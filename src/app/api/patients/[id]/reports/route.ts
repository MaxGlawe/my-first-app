/**
 * PROJ-6: KI-Arztbericht-Generator
 * GET  /api/patients/[id]/reports  — Liste der Berichte
 * POST /api/patients/[id]/reports  — Neuen Bericht mit KI generieren
 *
 * Sicherheit:
 * - report_type wird SERVERSEITIG aus der Rolle abgeleitet (kein Client-Override)
 * - Heilpraktiker → arztbericht | Physiotherapeut → therapiebericht | Admin → beide
 * - Rate Limiting: Max 10 Generierungen pro Therapeut pro Stunde (DB-basiert)
 */

import { NextRequest, NextResponse } from "next/server"
import { z } from "zod"
import { createSupabaseServerClient } from "@/lib/supabase-server"
import Anthropic from "@anthropic-ai/sdk"

const UUID_REGEX = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i

// ── Zod Schema für POST ────────────────────────────────────────────────────────

const createReportSchema = z.object({
  date_from: z
    .string()
    .regex(/^\d{4}-\d{2}-\d{2}$/, "date_from muss im Format YYYY-MM-DD sein."),
  date_to: z
    .string()
    .regex(/^\d{4}-\d{2}-\d{2}$/, "date_to muss im Format YYYY-MM-DD sein."),
  recipient_name: z.string().min(1, "Empfänger-Name ist erforderlich.").max(500),
  recipient_address: z.string().max(1000).default(""),
  extra_instructions: z.string().max(2000).optional().default(""),
  // Admin-only: allows choosing between report types
  // Ignored for non-admin roles (server enforces role-based type)
  admin_report_type: z.enum(["arztbericht", "therapiebericht", "funktionsanalyse"]).optional(),
})

// ── Normalize helper ───────────────────────────────────────────────────────────

function normalizeReport(r: Record<string, unknown>, generatedByName: string | null = null) {
  return {
    id: r.id,
    patient_id: r.patient_id,
    generated_by: r.generated_by,
    generated_by_role: r.generated_by_role,
    report_type: r.report_type,
    date_from: r.date_from,
    date_to: r.date_to,
    recipient_name: r.recipient_name,
    recipient_address: r.recipient_address,
    extra_instructions: r.extra_instructions,
    draft_content: r.draft_content,
    final_content: r.final_content,
    status: r.status,
    created_at: r.created_at,
    updated_at: r.updated_at,
    generated_by_name: generatedByName,
  }
}

// ── GET /api/patients/[id]/reports ────────────────────────────────────────────

export async function GET(
  _request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id: patientId } = await params
  const supabase = await createSupabaseServerClient()

  const { data: { user }, error: authError } = await supabase.auth.getUser()
  if (authError || !user) {
    return NextResponse.json({ error: "Nicht autorisiert. Bitte einloggen." }, { status: 401 })
  }

  if (!UUID_REGEX.test(patientId)) {
    return NextResponse.json({ error: "Ungültige Patienten-ID." }, { status: 400 })
  }

  // Hole Rolle des eingeloggten Therapeuten (service client bypasses RLS)
  const { createSupabaseServiceClient } = await import("@/lib/supabase-service")
  const serviceClient = createSupabaseServiceClient()
  const { data: roleProfile } = await serviceClient
    .from("user_profiles")
    .select("role")
    .eq("id", user.id)
    .single()

  const role = roleProfile?.role as string | null

  // Patientenexistenz + Zugriff prüfen (RLS greift hier zusätzlich)
  const { data: patient, error: patientError } = await supabase
    .from("patients")
    .select("id")
    .eq("id", patientId)
    .single()

  if (patientError || !patient) {
    return NextResponse.json(
      { error: "Patient nicht gefunden oder keine Berechtigung." },
      { status: 404 }
    )
  }

  // Berichte laden — RLS steuert Zugriff serverseitig
  let query = supabase
    .from("medical_reports")
    .select(`
      id, patient_id, generated_by, generated_by_role, report_type,
      date_from, date_to, recipient_name, recipient_address,
      extra_instructions, draft_content, final_content, status,
      created_at, updated_at
    `)
    .eq("patient_id", patientId)
    .order("created_at", { ascending: false })
    .limit(100)

  // Filter by role-appropriate report type
  if (role === "heilpraktiker") {
    query = query.eq("report_type", "arztbericht")
  } else if (role === "physiotherapeut") {
    query = query.eq("report_type", "therapiebericht")
  } else if (role === "praeventionstrainer" || role === "personal_trainer") {
    query = query.eq("report_type", "funktionsanalyse")
  }
  // Admin: kein Filter — sieht alle

  const { data: reports, error } = await query

  if (error) {
    console.error("[GET /api/patients/[id]/reports] Supabase error:", error)
    return NextResponse.json(
      { error: "Berichte konnten nicht geladen werden." },
      { status: 500 }
    )
  }

  // Resolve generated_by names via separate query (no FK dependency)
  const generatorIds = [...new Set((reports ?? []).map((r) => r.generated_by as string).filter(Boolean))]
  let profileMap: Record<string, string> = {}
  if (generatorIds.length > 0) {
    const { data: profiles } = await supabase
      .from("user_profiles")
      .select("id, first_name, last_name, role")
      .in("id", generatorIds)
    profileMap = Object.fromEntries(
      (profiles ?? []).map((p) => {
        // For admin users whose first_name is "Admin" (placeholder), use only last_name
        const fn = p.role === "admin" && p.first_name?.toLowerCase() === "admin"
          ? null
          : p.first_name
        return [p.id, [fn, p.last_name].filter(Boolean).join(" ")]
      })
    )
  }

  return NextResponse.json({
    reports: (reports ?? []).map((r) =>
      normalizeReport(r as Record<string, unknown>, r.generated_by ? (profileMap[r.generated_by as string] || null) : null)
    ),
  })
}

// ── POST /api/patients/[id]/reports ───────────────────────────────────────────

export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id: patientId } = await params
  const supabase = await createSupabaseServerClient()

  // Auth
  const { data: { user }, error: authError } = await supabase.auth.getUser()
  if (authError || !user) {
    return NextResponse.json({ error: "Nicht autorisiert. Bitte einloggen." }, { status: 401 })
  }

  if (!UUID_REGEX.test(patientId)) {
    return NextResponse.json({ error: "Ungültige Patienten-ID." }, { status: 400 })
  }

  // Rolle ermitteln (serverseitig — kein Client-Override möglich)
  // Use service client to bypass potential RLS restrictions on user_profiles
  const { createSupabaseServiceClient } = await import("@/lib/supabase-service")
  const serviceClient = createSupabaseServiceClient()
  const { data: profile, error: profileError } = await serviceClient
    .from("user_profiles")
    .select("role, first_name, last_name")
    .eq("id", user.id)
    .single()

  if (profileError) {
    console.error("[POST /api/patients/[id]/reports] Profile query failed:", profileError, "user.id:", user.id)
  }

  const role = profile?.role as string | null

  if (!role || !["heilpraktiker", "physiotherapeut", "admin", "praeventionstrainer", "personal_trainer"].includes(role)) {
    return NextResponse.json({
      error: "Keine Berechtigung zur Berichtsgenerierung.",
    }, { status: 403 })
  }

  // generated_by_role reflects the actual DB role
  const generatedByRole = role as "heilpraktiker" | "physiotherapeut" | "admin" | "praeventionstrainer" | "personal_trainer"

  // Rate Limiting: Max 10 Generierungen pro Therapeut pro Stunde
  const oneHourAgo = new Date(Date.now() - 60 * 60 * 1000).toISOString()
  const { count: recentCount } = await supabase
    .from("medical_reports")
    .select("id", { count: "exact", head: true })
    .eq("generated_by", user.id)
    .gte("created_at", oneHourAgo)

  if ((recentCount ?? 0) >= 10) {
    return NextResponse.json(
      { error: "Rate-Limit erreicht: Maximal 10 Berichte pro Stunde. Bitte später erneut versuchen." },
      { status: 429 }
    )
  }

  // Patientenexistenz prüfen
  const { data: patient, error: patientError } = await supabase
    .from("patients")
    .select("id, vorname, nachname, geburtsdatum, geschlecht, krankenkasse, versichertennummer")
    .eq("id", patientId)
    .single()

  if (patientError || !patient) {
    return NextResponse.json(
      { error: "Patient nicht gefunden oder keine Berechtigung." },
      { status: 404 }
    )
  }

  // Body parsen
  let body: unknown
  try {
    body = await request.json()
  } catch {
    return NextResponse.json({ error: "Ungültiges JSON." }, { status: 400 })
  }

  const parseResult = createReportSchema.safeParse(body)
  if (!parseResult.success) {
    return NextResponse.json(
      { error: "Validierungsfehler.", details: parseResult.error.flatten().fieldErrors },
      { status: 422 }
    )
  }

  const { date_from, date_to, recipient_name, recipient_address, extra_instructions, admin_report_type } =
    parseResult.data

  // report_type wird serverseitig festgelegt (nach Body-Parsing, damit admin_report_type verfügbar)
  // HP: always arztbericht | PT: always therapiebericht | Trainer: always funktionsanalyse
  // Admin: honors admin_report_type if provided (all types are legitimate for admin)
  const reportType =
    role === "heilpraktiker"
      ? "arztbericht"
      : role === "physiotherapeut"
      ? "therapiebericht"
      : role === "praeventionstrainer" || role === "personal_trainer"
      ? "funktionsanalyse"
      : (admin_report_type ?? "arztbericht") // Admin → defaults to arztbericht

  // Datum-Logik prüfen
  if (new Date(date_from) > new Date(date_to)) {
    return NextResponse.json({ error: "Datum-von muss vor Datum-bis liegen." }, { status: 422 })
  }

  // ── Daten für KI laden ─────────────────────────────────────────────────────

  // Pseudonymisierung: echter Name → "Patient A"
  const realName = `${patient.vorname} ${patient.nachname}`
  const pseudonym = "Patient A"

  // Behandlungen laden (nur abgeschlossene — Entwürfe enthalten ungeprüfte Daten)
  const { data: treatments } = await supabase
    .from("treatment_sessions")
    .select("session_date, measures, nrs_before, nrs_after, notes, next_steps, duration_minutes, status")
    .eq("patient_id", patientId)
    .eq("status", "abgeschlossen")
    .gte("session_date", date_from)
    .lte("session_date", date_to)
    .order("session_date", { ascending: true })
    .limit(100)

  let anamnesisSummary = ""
  let diagnosesSummary = ""

  // Heilpraktiker: Anamnese + Diagnosen laden
  if (role === "heilpraktiker" || role === "admin") {
    // anamnesis_records.data is a JSONB column (PROJ-3 schema)
    // Only include finalized records — drafts may contain incomplete/unverified data
    const { data: anamnesisRecords } = await supabase
      .from("anamnesis_records")
      .select("data, created_at")
      .eq("patient_id", patientId)
      .eq("status", "abgeschlossen")
      .gte("created_at", date_from)
      .lte("created_at", date_to + "T23:59:59")
      .order("created_at", { ascending: false })
      .limit(10)

    if (anamnesisRecords && anamnesisRecords.length > 0) {
      anamnesisSummary = anamnesisRecords
        .map((a, i) => {
          const d = a.data as {
            hauptbeschwerde?: string
            schmerzdauer?: string
            schmerzcharakter?: string
            nrs?: number
            vorerkrankungen?: string[]
            vorerkrankungenFreitext?: string
            keineVorerkrankungen?: boolean
            medikamente?: string
            differentialdiagnosen?: string
            bewegungsausmass?: Array<{ gelenk: string; richtung: string; grad: string }>
            kraftgrad?: Array<{ muskelgruppe: string; grad: string }>
            erweiterte_tests?: string
          }
          const date = new Date(a.created_at as string).toLocaleDateString("de-DE")

          // Vorerkrankungen: combine array + freetext
          let vorerkrankungenText = ""
          if (d.keineVorerkrankungen) {
            vorerkrankungenText = "Keine Vorerkrankungen bekannt"
          } else {
            const parts: string[] = []
            if (d.vorerkrankungen && d.vorerkrankungen.length > 0) {
              parts.push(d.vorerkrankungen.join(", "))
            }
            if (d.vorerkrankungenFreitext) {
              parts.push(d.vorerkrankungenFreitext)
            }
            vorerkrankungenText = parts.join("; ")
          }

          // ROM-Messungen formatieren
          let romText = ""
          if (d.bewegungsausmass && d.bewegungsausmass.length > 0) {
            romText = d.bewegungsausmass
              .map((r) => `${r.gelenk} ${r.richtung}: ${r.grad}°`)
              .join(", ")
          }

          // Kraftgrad nach Janda formatieren
          let kraftText = ""
          if (d.kraftgrad && d.kraftgrad.length > 0) {
            kraftText = d.kraftgrad
              .map((k) => `${k.muskelgruppe}: ${k.grad}/5`)
              .join(", ")
          }

          return [
            `Anamnese ${i + 1} (${date}):`,
            d.hauptbeschwerde ? `  Hauptbeschwerde: ${d.hauptbeschwerde}` : "",
            d.schmerzdauer ? `  Beschwerdedauer: ${d.schmerzdauer}` : "",
            d.schmerzcharakter ? `  Schmerzcharakter: ${d.schmerzcharakter}` : "",
            d.nrs !== undefined ? `  NRS: ${d.nrs}/10` : "",
            vorerkrankungenText ? `  Vorerkrankungen: ${vorerkrankungenText}` : "",
            d.medikamente ? `  Medikamente: ${d.medikamente}` : "",
            romText ? `  Bewegungsausmaß (ROM): ${romText}` : "",
            kraftText ? `  Kraftgrad (Janda): ${kraftText}` : "",
            d.differentialdiagnosen ? `  Differentialdiagnosen: ${d.differentialdiagnosen}` : "",
            d.erweiterte_tests ? `  Erweiterte Tests: ${d.erweiterte_tests}` : "",
          ]
            .filter(Boolean)
            .join("\n")
        })
        .join("\n\n")
    }

    // diagnoses table (PROJ-4 schema — correct table name is "diagnoses")
    // Only include finalized diagnoses — drafts may contain unverified ICD codes
    const { data: diagnoses } = await supabase
      .from("diagnoses")
      .select("hauptdiagnose, nebendiagnosen, klinischer_befund, therapieziel, prognose, therapiedauer_wochen, created_at")
      .eq("patient_id", patientId)
      .eq("status", "abgeschlossen")
      .gte("created_at", date_from)
      .lte("created_at", date_to + "T23:59:59")
      .order("created_at", { ascending: false })
      .limit(10)

    // Helper: format a single diagnosis entry
    const formatDiagnoseEintrag = (entry: Record<string, unknown>): string => {
      const icd = entry.icd10 as { code: string; bezeichnung: string } | null
      const sicherheit = entry.sicherheitsgrad as string | undefined
      const freitext = entry.freitextDiagnose as string | undefined
      const notiz = entry.freitextNotiz as string | undefined

      let text = ""
      if (icd) {
        text = `${icd.code} — ${icd.bezeichnung}`
      } else if (freitext) {
        text = freitext
      } else {
        return ""
      }

      if (sicherheit === "verdacht") text += " (V.a.)"
      else if (sicherheit === "ausschluss") text += " (Ausschluss)"
      else if (sicherheit === "gesichert") text += " (gesichert)"

      if (notiz) text += ` [${notiz}]`
      return text
    }

    if (diagnoses && diagnoses.length > 0) {
      diagnosesSummary = diagnoses
        .map((d, i) => {
          const hd = d.hauptdiagnose as Record<string, unknown> | null
          const hauptdiagnoseText = hd ? formatDiagnoseEintrag(hd) : "Keine Hauptdiagnose"
          const nebendiagnosen = (d.nebendiagnosen as Record<string, unknown>[]) ?? []
          const date = new Date(d.created_at as string).toLocaleDateString("de-DE")

          // Format all secondary diagnoses with full details
          const nebenTexte = nebendiagnosen
            .map((nd) => formatDiagnoseEintrag(nd))
            .filter(Boolean)

          return [
            `Befund ${i + 1} (${date}):`,
            `  Hauptdiagnose: ${hauptdiagnoseText}`,
            nebenTexte.length > 0 ? `  Nebendiagnosen:\n${nebenTexte.map((t) => `    - ${t}`).join("\n")}` : "",
            d.klinischer_befund ? `  Klinischer Befund: ${String(d.klinischer_befund).slice(0, 2000)}` : "",
            d.therapieziel ? `  Therapieziel: ${d.therapieziel}` : "",
            d.prognose ? `  Prognose: ${d.prognose}` : "",
            d.therapiedauer_wochen ? `  Geplante Therapiedauer: ${d.therapiedauer_wochen} Wochen` : "",
          ]
            .filter(Boolean)
            .join("\n")
        })
        .join("\n\n")
    }
  }

  // Behandlungsverlauf aufbereiten
  const treatmentList = treatments ?? []
  const treatmentSummary = treatmentList
    .map((t) => {
      const date = new Date(t.session_date).toLocaleDateString("de-DE")
      const duration = t.duration_minutes ? `${t.duration_minutes} Min.` : ""
      const measures = Array.isArray(t.measures) ? (t.measures as string[]).join(", ") : ""
      const nrs =
        t.nrs_before !== null
          ? `NRS: ${t.nrs_before}/10${t.nrs_after !== null ? ` → ${t.nrs_after}/10` : ""}`
          : ""
      const notes = t.notes ? `Notiz: ${String(t.notes).slice(0, 1000)}` : ""
      const nextSteps = t.next_steps ? `Nächste Schritte: ${String(t.next_steps).slice(0, 500)}` : ""
      return [
        `${date}${duration ? ` (${duration})` : ""}: ${measures || "Keine Maßnahmen dokumentiert"}`,
        nrs,
        notes,
        nextSteps,
      ]
        .filter(Boolean)
        .join(" | ")
    })
    .join("\n")

  // NRS-Gesamtentwicklung berechnen
  let nrsOverview = ""
  if (treatmentList.length > 0) {
    const firstNrs = treatmentList[0]?.nrs_before
    const lastSession = treatmentList[treatmentList.length - 1]
    const lastNrs = lastSession?.nrs_after ?? lastSession?.nrs_before
    if (firstNrs !== null && firstNrs !== undefined && lastNrs !== null && lastNrs !== undefined) {
      const diff = firstNrs - lastNrs
      const trend = diff > 0 ? "Verbesserung" : diff < 0 ? "Verschlechterung" : "unverändert"
      nrsOverview = `NRS-Gesamtentwicklung: ${firstNrs}/10 → ${lastNrs}/10 (${trend} um ${Math.abs(diff)} Punkte über ${treatmentList.length} Behandlungen)`
    }
  }

  // ── KI-Prompt zusammenstellen ──────────────────────────────────────────────

  // Geschlecht für korrekte Anrede
  const geschlecht = patient.geschlecht as string | null
  const patientAnrede = geschlecht === "weiblich" ? "die Patientin" : geschlecht === "maennlich" ? "der Patient" : "der Patient/die Patientin"
  const geburtsdatumFormatted = new Date(patient.geburtsdatum as string).toLocaleDateString("de-DE")

  const dateFromFormatted = new Date(date_from).toLocaleDateString("de-DE")
  const dateToFormatted = new Date(date_to).toLocaleDateString("de-DE")

  const patientInfo = [
    `Patient: ${pseudonym} (${patientAnrede})`,
    `Geburtsdatum: ${geburtsdatumFormatted}`,
    geschlecht ? `Geschlecht: ${geschlecht === "maennlich" ? "männlich" : geschlecht === "weiblich" ? "weiblich" : geschlecht}` : "",
    patient.krankenkasse ? `Krankenkasse: ${patient.krankenkasse}` : "",
    patient.versichertennummer ? `Versichertennummer: ${patient.versichertennummer}` : "",
    `Berichtszeitraum: ${dateFromFormatted} – ${dateToFormatted}`,
  ]
    .filter(Boolean)
    .join("\n")

  let systemPrompt: string
  let userContent: string

  // Shared HTML formatting instructions
  const htmlInstructions = `

FORMATIERUNG:
- Verwende HTML-Tags für die Ausgabe (der Editor nutzt TipTap/HTML).
- Abschnittsüberschriften als <h2>, z.B. <h2>Anamnese</h2>
- Fließtext in <p>-Tags
- Aufzählungen als <ul><li>…</li></ul>
- ICD-10-Codes fett: <strong>M54.5</strong> — Kreuzschmerz
- KEINE <h1>-Tags verwenden (Briefkopf wird extern gerendert)
- KEINE Anrede/Empfänger-Block (wird extern gerendert)
- Beginne direkt mit dem Betreff als <h2>
- Ersetze den Pseudonym "${pseudonym}" NICHT durch einen echten Namen — das System übernimmt die Re-Personalisierung.`

  if (reportType === "arztbericht") {
    systemPrompt = `Du bist ein erfahrener Heilpraktiker für Physiotherapie und verfasst professionelle Arztberichte (Befundberichte) für mitbehandelnde Ärzte oder Überweisungsärzte.

Erstelle einen vollständigen medizinischen Arztbrief auf Deutsch mit folgenden Abschnitten:

<h2>Betreff</h2>
"Arztbericht über ${pseudonym}, geb. ${geburtsdatumFormatted}"
Berichtszeitraum: ${dateFromFormatted} – ${dateToFormatted}

<h2>Anamnese</h2>
Hauptbeschwerde, Beschwerdedauer, Schmerzcharakter, Schmerzintensität (NRS), Vorerkrankungen, Medikamente. Fasse die vorliegenden Anamnesedaten in einem professionellen Fließtext zusammen.

<h2>Klinischer Befund</h2>
Klinische Untersuchungsergebnisse, ROM-Messungen (falls vorhanden), Kraftgrad nach Janda (falls vorhanden), weitere Tests. Beschreibe die Befunde präzise mit Fachterminologie.

<h2>Diagnose(n)</h2>
ICD-10-codierte Hauptdiagnose und Nebendiagnosen mit Sicherheitsgrad (gesichert/V.a./Ausschluss). Format: <strong>CODE</strong> — Bezeichnung (Sicherheitsgrad)

<h2>Behandlungsverlauf</h2>
Zusammenfassung der durchgeführten Maßnahmen, Behandlungshäufigkeit, NRS-Entwicklung (Anfangswert → Endwert). Beschreibe den Verlauf als Fließtext, nicht als Liste einzelner Sitzungen.

<h2>Therapieziel und Prognose</h2>
Aktuelle Therapieziele, Prognose, geplante Therapiedauer.

<h2>Empfehlung</h2>
Empfehlung für weitere Behandlung, Heilmittelverordnung, oder Überweisung.

Schließe mit: "Mit freundlichen kollegialen Grüßen"

WICHTIG — DATENGENAUIGKEIT:
- Verwende AUSSCHLIESSLICH die unten übergebenen Daten. Erfinde NIEMALS Werte, Messergebnisse, Diagnosen, Behandlungsdaten oder DATEN.
- Verwende NUR die oben angegebenen Daten für Geburtsdatum und Berichtszeitraum — erfinde KEINE anderen Daten oder Zeiträume.
- Wenn ein Datenfeld fehlt oder leer ist, lasse den entsprechenden Abschnitt weg oder schreibe "nicht dokumentiert" — erfinde KEINE Ersatzwerte.
- Gib NRS-Werte, ROM-Messungen, ICD-10-Codes und Behandlungsdaten EXAKT so wieder, wie sie in den Daten stehen.
- Wenn keine Behandlungen dokumentiert sind, schreibe das explizit — erfinde keine Maßnahmen.
- Verwende die Behandlungsdaten (Termine) NUR aus den übergebenen Daten — erfinde KEINE zusätzlichen Behandlungstermine.

Schreibe im professionellen medizinischen Stil. Verwende Fachterminologie. Fasse Daten zusammen, statt sie einfach aufzulisten. Der Bericht soll 1-2 DIN-A4-Seiten umfassen.${htmlInstructions}`

    userContent = `${patientInfo}

ANAMNESE-DATEN:
${anamnesisSummary || "Keine Anamnesedaten im Zeitraum dokumentiert."}

BEFUND & DIAGNOSEN:
${diagnosesSummary || "Keine Befund-/Diagnosedaten im Zeitraum dokumentiert."}

BEHANDLUNGSVERLAUF (${treatmentList.length} Behandlungen):
${nrsOverview ? `${nrsOverview}\n` : ""}${treatmentSummary || "Keine Behandlungen im Zeitraum dokumentiert."}

${extra_instructions ? `ZUSÄTZLICHE HINWEISE DES THERAPEUTEN:\n${extra_instructions}` : ""}`
  } else if (reportType === "therapiebericht") {
    // Therapiebericht (Physiotherapeut)
    systemPrompt = `Du bist ein erfahrener Physiotherapeut und verfasst professionelle Therapieverlaufsberichte für Ärzte zur Unterstützung bei der Rezeptverlängerung oder Weiterverordnung.

Erstelle einen Therapieverlaufsbericht auf Deutsch mit folgenden Abschnitten:

<h2>Betreff</h2>
"Therapieverlaufsbericht über ${pseudonym}, geb. ${geburtsdatumFormatted}"
Berichtszeitraum: ${dateFromFormatted} – ${dateToFormatted}

<h2>Behandlungsverlauf</h2>
Zusammenfassung der durchgeführten physiotherapeutischen Maßnahmen (KG, MT, MLD, etc.), Behandlungshäufigkeit und -dauer, NRS-Schmerzentwicklung (Anfangswert → Endwert). Beschreibe den Verlauf als zusammenhängenden Fließtext.

<h2>Therapieergebnis</h2>
Reaktion des Patienten auf die Therapie, funktionelle Verbesserungen, verbliebene Einschränkungen. Nutze konkrete Zahlen (NRS, ROM) wenn vorhanden.

<h2>Empfehlung zur Weiterbehandlung</h2>
Konkrete Empfehlung für Heilmittelverordnung (Maßnahme, Anzahl Einheiten, Frequenz). Behandlungsziel für die nächste Verordnungsphase.

Schließe mit: "Mit freundlichen kollegialen Grüßen"

WICHTIG: Enthält KEINEN Diagnose-Abschnitt — Physiotherapeuten dürfen nicht eigenständig diagnostizieren.

DATENGENAUIGKEIT:
- Verwende AUSSCHLIESSLICH die unten übergebenen Daten. Erfinde NIEMALS Werte, Messergebnisse, Behandlungsdaten oder DATEN.
- Verwende NUR die oben angegebenen Daten für Geburtsdatum und Berichtszeitraum — erfinde KEINE anderen Daten oder Zeiträume.
- Wenn ein Datenfeld fehlt oder leer ist, lasse den entsprechenden Abschnitt weg oder schreibe "nicht dokumentiert" — erfinde KEINE Ersatzwerte.
- Gib NRS-Werte, Maßnahmen und Behandlungsdaten EXAKT so wieder, wie sie in den Daten stehen.
- Verwende die Behandlungsdaten (Termine) NUR aus den übergebenen Daten — erfinde KEINE zusätzlichen Behandlungstermine.

Schreibe im professionellen physiotherapeutischen Stil. Fasse Daten zusammen, statt einzelne Sitzungen aufzulisten. Der Bericht soll 0,5-1 DIN-A4-Seite umfassen.${htmlInstructions}`

    userContent = `${patientInfo}

BEHANDLUNGSVERLAUF (${treatmentList.length} Behandlungen):
${nrsOverview ? `${nrsOverview}\n` : ""}${treatmentSummary || "Keine Behandlungen im Zeitraum dokumentiert."}

${extra_instructions ? `ZUSÄTZLICHE HINWEISE / GEWÜNSCHTE HEILMITTEL:\n${extra_instructions}` : ""}`
  } else if (reportType === "funktionsanalyse") {
    // ── Funktionsanalyse (Präventionstrainer / Personal Trainer) ──

    // Load Funktionsuntersuchungen
    const { data: funktionsRecords } = await supabase
      .from("funktionsuntersuchungen")
      .select("data, version, status, created_at")
      .eq("patient_id", patientId)
      .eq("status", "abgeschlossen")
      .gte("created_at", date_from)
      .lte("created_at", date_to + "T23:59:59")
      .order("created_at", { ascending: false })
      .limit(5)

    // Load Janda test catalog for resolving test names
    const { data: jandaCatalog } = await supabase
      .from("janda_test_catalog")
      .select("id, region, muskel, test_name, kategorie")

    const catalogMap = new Map(
      (jandaCatalog ?? []).map((c) => [c.id, c])
    )

    let funktionsSummary = ""
    if (funktionsRecords && funktionsRecords.length > 0) {
      funktionsSummary = funktionsRecords
        .map((r, i) => {
          const d = r.data as {
            hauptbeschwerde?: string
            beschwerdedauer?: string
            sportliche_aktivitaet?: string
            trainingsziele?: string
            haltungsanalyse?: string
            gangbildanalyse?: string
            janda_tests?: Array<{ catalog_id: string; befund: string; notiz?: string }>
            trainingsempfehlung?: string
          }
          const date = new Date(r.created_at as string).toLocaleDateString("de-DE")

          const jandaTests = (d.janda_tests ?? []).map((t) => {
            const entry = catalogMap.get(t.catalog_id)
            const befundLabel = t.befund === "normal" ? "Normal" : t.befund === "leicht_auffaellig" ? "Leicht auffällig" : "Deutlich auffällig"
            return `    - ${entry?.test_name ?? t.catalog_id} (${entry?.muskel ?? ""}): ${befundLabel}${t.notiz ? ` [${t.notiz}]` : ""}`
          })

          return [
            `Funktionsuntersuchung V${r.version} (${date}):`,
            d.hauptbeschwerde ? `  Hauptbeschwerde: ${d.hauptbeschwerde}` : "",
            d.beschwerdedauer ? `  Beschwerdedauer: ${d.beschwerdedauer}` : "",
            d.sportliche_aktivitaet ? `  Sportliche Aktivität: ${d.sportliche_aktivitaet}` : "",
            d.trainingsziele ? `  Trainingsziele: ${d.trainingsziele}` : "",
            d.haltungsanalyse ? `  Haltungsanalyse: ${d.haltungsanalyse}` : "",
            d.gangbildanalyse ? `  Gangbildanalyse: ${d.gangbildanalyse}` : "",
            jandaTests.length > 0 ? `  Muskelfunktionstests (Janda):\n${jandaTests.join("\n")}` : "",
            d.trainingsempfehlung ? `  Trainingsempfehlung: ${d.trainingsempfehlung}` : "",
          ]
            .filter(Boolean)
            .join("\n")
        })
        .join("\n\n")
    }

    // Load Trainingsdokumentationen
    const { data: trainingDocs } = await supabase
      .from("training_documentations")
      .select("typ, session_date, duration_minutes, data, status, created_at")
      .eq("patient_id", patientId)
      .eq("status", "abgeschlossen")
      .gte("session_date", date_from)
      .lte("session_date", date_to)
      .order("session_date", { ascending: true })
      .limit(50)

    let trainingDokuSummary = ""
    if (trainingDocs && trainingDocs.length > 0) {
      trainingDokuSummary = trainingDocs
        .map((t) => {
          const date = new Date(t.session_date).toLocaleDateString("de-DE")
          const duration = t.duration_minutes ? `${t.duration_minutes} Min.` : ""
          const typ = t.typ === "training" ? "Training" : "Therapeutisch"

          if (t.typ === "training") {
            const d = t.data as { trainingsart?: string; schwerpunkt?: string; uebungen?: Array<{ name: string; saetze?: number; wiederholungen?: number; gewicht?: string }>; anmerkung?: string }
            const exercises = (d.uebungen ?? []).map((u) => {
              const parts = [u.name]
              if (u.saetze) parts.push(`${u.saetze}×${u.wiederholungen ?? "?"}`)
              if (u.gewicht) parts.push(u.gewicht)
              return parts.join(" ")
            }).join(", ")
            return `${date} (${typ}${duration ? `, ${duration}` : ""}): ${d.trainingsart ?? ""} — ${d.schwerpunkt ?? ""} | Übungen: ${exercises || "keine"} ${d.anmerkung ? `| Anmerkung: ${d.anmerkung}` : ""}`
          } else {
            const d = t.data as { massnahmen?: string[]; nrs_before?: number | null; nrs_after?: number | null; befund?: string; notizen?: string }
            const massnahmen = (d.massnahmen ?? []).join(", ")
            const nrs = d.nrs_before !== null && d.nrs_before !== undefined ? `NRS: ${d.nrs_before}/10${d.nrs_after !== null && d.nrs_after !== undefined ? ` → ${d.nrs_after}/10` : ""}` : ""
            return `${date} (${typ}${duration ? `, ${duration}` : ""}): ${massnahmen || "keine Maßnahmen"} ${nrs ? `| ${nrs}` : ""} ${d.befund ? `| Befund: ${String(d.befund).slice(0, 500)}` : ""}`
          }
        })
        .join("\n")
    }

    systemPrompt = `Du bist ein erfahrener Sportwissenschaftler / Präventionstrainer und erstellst professionelle Funktionsanalyse-Berichte. Diese Berichte fassen die Ergebnisse von Funktionsuntersuchungen (insbesondere Muskelfunktionstests nach Janda) und Trainingsdokumentationen zusammen.

Erstelle einen Funktionsanalyse-Bericht auf Deutsch mit folgenden Abschnitten:

<h2>Betreff</h2>
"Funktionsanalyse-Bericht über ${pseudonym}, geb. ${geburtsdatumFormatted}"
Berichtszeitraum: ${dateFromFormatted} – ${dateToFormatted}

<h2>Ausgangssituation</h2>
Hauptbeschwerde, Beschwerdedauer, sportlicher Hintergrund und Trainingsziele des Patienten.

<h2>Funktionsanalyse</h2>
Zusammenfassung der Muskelfunktionstests (nach Janda):
- Welche Muskeln zeigen Verkürzungs- oder Abschwächungstendenzen?
- Welche Bewegungsmuster sind auffällig?
- Haltungs- und Gangbildanalyse-Ergebnisse.
Strukturiere die Befunde nach Körperregion und hebe die wichtigsten Auffälligkeiten hervor.

<h2>Trainingsverlauf</h2>
Zusammenfassung der durchgeführten Trainingseinheiten: Häufigkeit, Trainingsart, Schwerpunkte, Übungen. Bei therapeutischen Sitzungen: Maßnahmen und NRS-Verlauf.

<h2>Bewertung & Fortschritt</h2>
Interpretation der Befunde, Verbesserungen seit Trainingsbeginn, verbleibende Defizite.

<h2>Trainingsempfehlung</h2>
Konkrete Empfehlungen für das weitere Training basierend auf den Janda-Befunden: Welche Muskeln sollten gekräftigt, welche gedehnt werden? Welche Übungen/Trainingsart wird empfohlen?

Schließe mit: "Mit sportlichen Grüßen"

WICHTIG — KEINE MEDIZINISCHEN DIAGNOSEN:
- Dieser Bericht enthält KEINE ICD-10-Codes oder medizinischen Diagnosen.
- Beschreibe funktionelle Auffälligkeiten, KEINE Krankheitsbilder.
- Verwende sportwissenschaftliche Terminologie.

DATENGENAUIGKEIT:
- Verwende AUSSCHLIESSLICH die unten übergebenen Daten.
- Erfinde NIEMALS Testergebnisse, Übungen oder Trainingsdaten.
- Wenn ein Datenfeld fehlt, schreibe "nicht dokumentiert" — erfinde KEINE Ersatzwerte.
- Gib Janda-Befunde EXAKT so wieder, wie sie in den Daten stehen.

Schreibe im professionellen sportwissenschaftlichen Stil. Der Bericht soll 1-2 DIN-A4-Seiten umfassen.${htmlInstructions}`

    userContent = `${patientInfo}

FUNKTIONSUNTERSUCHUNGEN:
${funktionsSummary || "Keine Funktionsuntersuchungen im Zeitraum dokumentiert."}

TRAININGSDOKUMENTATION (${trainingDocs?.length ?? 0} Sitzungen):
${trainingDokuSummary || "Keine Trainingsdokumentationen im Zeitraum dokumentiert."}

${extra_instructions ? `ZUSÄTZLICHE HINWEISE DES TRAINERS:\n${extra_instructions}` : ""}`
  } else {
    return NextResponse.json({ error: "Unbekannter Berichtstyp." }, { status: 400 })
  }

  // ── Claude API aufrufen ───────────────────────────────────────────────────

  if (!process.env.ANTHROPIC_API_KEY) {
    console.error("[POST /api/patients/[id]/reports] ANTHROPIC_API_KEY not configured")
    return NextResponse.json(
      { error: "KI-Service nicht konfiguriert. Bitte ANTHROPIC_API_KEY in der Umgebung setzen." },
      { status: 503 }
    )
  }

  let draftContentPseudonymized: string

  try {
    const anthropic = new Anthropic({
      apiKey: process.env.ANTHROPIC_API_KEY,
    })

    // Enforce 60-second timeout (spec requirement: edge case — Claude API timeout)
    const claudePromise = anthropic.messages.create({
      model: "claude-sonnet-4-6",
      max_tokens: 8192,
      system: systemPrompt,
      messages: [
        {
          role: "user",
          content: userContent,
        },
      ],
    })

    const timeoutPromise = new Promise<never>((_, reject) =>
      setTimeout(() => reject(new Error("CLAUDE_TIMEOUT")), 60_000)
    )

    const message = await Promise.race([claudePromise, timeoutPromise])

    const content = message.content[0]
    if (content.type !== "text") {
      throw new Error("Unerwartetes Antwortformat von der KI.")
    }

    draftContentPseudonymized = content.text
  } catch (err) {
    console.error("[POST /api/patients/[id]/reports] Claude API error:", err)
    const errMsg = err instanceof Error ? err.message : "Unbekannter Fehler"
    if (errMsg === "CLAUDE_TIMEOUT") {
      return NextResponse.json(
        { error: "KI-Generierung hat zu lange gedauert (> 60 Sekunden). Bitte erneut versuchen." },
        { status: 504 }
      )
    }
    if (errMsg.includes("overloaded")) {
      return NextResponse.json(
        { error: "Die KI ist derzeit überlastet. Bitte in wenigen Minuten erneut versuchen." },
        { status: 503 }
      )
    }
    return NextResponse.json(
      { error: "KI-Generierung fehlgeschlagen. Bitte erneut versuchen." },
      { status: 502 }
    )
  }

  // Pseudonym durch echten Namen ersetzen für final_content
  const finalContent = draftContentPseudonymized.replace(
    new RegExp(pseudonym, "g"),
    realName
  )

  // ── In DB speichern ────────────────────────────────────────────────────────

  const { data: created, error: insertError } = await supabase
    .from("medical_reports")
    .insert({
      patient_id: patientId,
      generated_by: user.id,
      generated_by_role: generatedByRole,
      report_type: reportType,
      date_from,
      date_to,
      recipient_name,
      recipient_address: recipient_address ?? "",
      extra_instructions: extra_instructions ?? "",
      draft_content: draftContentPseudonymized,
      final_content: finalContent,
      status: "entwurf",
    })
    .select(`
      id, patient_id, generated_by, generated_by_role, report_type,
      date_from, date_to, recipient_name, recipient_address,
      extra_instructions, draft_content, final_content, status,
      created_at, updated_at
    `)
    .single()

  if (insertError) {
    console.error("[POST /api/patients/[id]/reports] Insert error:", insertError)
    return NextResponse.json(
      { error: "Bericht konnte nicht gespeichert werden." },
      { status: 500 }
    )
  }

  // For admin users whose first_name is "Admin" (placeholder), use only last_name
  const firstName = role === "admin" && profile?.first_name?.toLowerCase() === "admin"
    ? null
    : profile?.first_name
  const generatedByName = [firstName, profile?.last_name].filter(Boolean).join(" ") || null
  const report = normalizeReport(created as Record<string, unknown>, generatedByName)

  return NextResponse.json({ report }, { status: 201 })
}
