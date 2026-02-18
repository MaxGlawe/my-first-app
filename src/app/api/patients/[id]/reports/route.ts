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
  // Admin-only: allows choosing between arztbericht and therapiebericht
  // Ignored for non-admin roles (server enforces role-based type)
  admin_report_type: z.enum(["arztbericht", "therapiebericht"]).optional(),
})

// ── Normalize helper ───────────────────────────────────────────────────────────

function normalizeReport(r: Record<string, unknown>) {
  const profile = r.user_profiles as { full_name?: string } | null
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
    generated_by_name: profile?.full_name ?? null,
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

  // Hole Rolle des eingeloggten Therapeuten
  const { data: profile } = await supabase
    .from("user_profiles")
    .select("role")
    .eq("id", user.id)
    .single()

  const role = profile?.role as string | null

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
      created_at, updated_at,
      user_profiles!generated_by ( full_name )
    `)
    .eq("patient_id", patientId)
    .order("created_at", { ascending: false })
    .limit(100)

  // Admin sieht beide Typen, Rollen nur den eigenen Typ
  if (role === "heilpraktiker") {
    query = query.eq("report_type", "arztbericht")
  } else if (role === "physiotherapeut") {
    query = query.eq("report_type", "therapiebericht")
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

  return NextResponse.json({ reports: (reports ?? []).map(r => normalizeReport(r as Record<string, unknown>)) })
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
  const { data: profile } = await supabase
    .from("user_profiles")
    .select("role, full_name")
    .eq("id", user.id)
    .single()

  const role = profile?.role as string | null

  if (!role || !["heilpraktiker", "physiotherapeut", "admin"].includes(role)) {
    return NextResponse.json({ error: "Keine Berechtigung zur Berichtsgenerierung." }, { status: 403 })
  }

  // generated_by_role reflects the actual DB role (admin stays "admin")
  const generatedByRole = role as "heilpraktiker" | "physiotherapeut" | "admin"

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
    .select("id, vorname, nachname, geburtsdatum, krankenkasse, versichertennummer")
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
  // Admin: honors admin_report_type if provided (both types are legitimate for admin)
  // HP: always arztbericht | PT: always therapiebericht (security: no override possible)
  const reportType =
    role === "heilpraktiker"
      ? "arztbericht"
      : role === "physiotherapeut"
      ? "therapiebericht"
      : (admin_report_type ?? "arztbericht") // Admin → defaults to arztbericht

  // Datum-Logik prüfen
  if (new Date(date_from) > new Date(date_to)) {
    return NextResponse.json({ error: "Datum-von muss vor Datum-bis liegen." }, { status: 422 })
  }

  // ── Daten für KI laden ─────────────────────────────────────────────────────

  // Pseudonymisierung: echter Name → "Patient A"
  const realName = `${patient.vorname} ${patient.nachname}`
  const pseudonym = "Patient A"

  // Behandlungen laden (beide Rollen)
  const { data: treatments } = await supabase
    .from("treatment_sessions")
    .select("session_date, measures, nrs_before, nrs_after, notes, next_steps, duration_minutes")
    .eq("patient_id", patientId)
    .gte("session_date", date_from)
    .lte("session_date", date_to)
    .order("session_date", { ascending: true })
    .limit(100)

  let anamnesisSummary = ""
  let diagnosesSummary = ""

  // Heilpraktiker: Anamnese + Diagnosen laden
  if (role === "heilpraktiker" || role === "admin") {
    // anamnesis_records.data is a JSONB column (PROJ-3 schema)
    const { data: anamnesisRecords } = await supabase
      .from("anamnesis_records")
      .select("data, created_at")
      .eq("patient_id", patientId)
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
            vorerkrankungenFreitext?: string
            medikamente?: string
            differentialdiagnosen?: string
          }
          const date = new Date(a.created_at as string).toLocaleDateString("de-DE")
          return [
            `Anamnese ${i + 1} (${date}):`,
            d.hauptbeschwerde ? `  Hauptbeschwerde: ${d.hauptbeschwerde}` : "",
            d.schmerzdauer ? `  Beschwerdedauer: ${d.schmerzdauer}` : "",
            d.schmerzcharakter ? `  Schmerzcharakter: ${d.schmerzcharakter}` : "",
            d.nrs !== undefined ? `  NRS: ${d.nrs}/10` : "",
            d.vorerkrankungenFreitext ? `  Vorerkrankungen: ${d.vorerkrankungenFreitext}` : "",
            d.medikamente ? `  Medikamente: ${d.medikamente}` : "",
            d.differentialdiagnosen ? `  Differentialdiagnosen: ${d.differentialdiagnosen}` : "",
          ]
            .filter(Boolean)
            .join("\n")
        })
        .join("\n\n")
    }

    // diagnoses table (PROJ-4 schema — correct table name is "diagnoses")
    const { data: diagnoses } = await supabase
      .from("diagnoses")
      .select("hauptdiagnose, nebendiagnosen, klinischer_befund, therapieziel, prognose, created_at")
      .eq("patient_id", patientId)
      .gte("created_at", date_from)
      .lte("created_at", date_to + "T23:59:59")
      .order("created_at", { ascending: false })
      .limit(10)

    if (diagnoses && diagnoses.length > 0) {
      diagnosesSummary = diagnoses
        .map((d, i) => {
          const hd = d.hauptdiagnose as Record<string, unknown> | null
          const icdCode = hd?.icd10
            ? `${(hd.icd10 as Record<string, string>).code} — ${(hd.icd10 as Record<string, string>).bezeichnung}`
            : (hd?.freitextDiagnose as string) ?? "Keine Hauptdiagnose"
          const nebendiagnosen = (d.nebendiagnosen as unknown[]) ?? []
          const date = new Date(d.created_at as string).toLocaleDateString("de-DE")
          return [
            `Befund ${i + 1} (${date}):`,
            `  Hauptdiagnose: ${icdCode}`,
            nebendiagnosen.length > 0 ? `  Nebendiagnosen: ${nebendiagnosen.length}` : "",
            d.klinischer_befund ? `  Klinischer Befund: ${String(d.klinischer_befund).slice(0, 500)}` : "",
            d.therapieziel ? `  Therapieziel: ${d.therapieziel}` : "",
            d.prognose ? `  Prognose: ${d.prognose}` : "",
          ]
            .filter(Boolean)
            .join("\n")
        })
        .join("\n\n")
    }
  }

  // Behandlungsverlauf aufbereiten
  const treatmentSummary = (treatments ?? [])
    .map((t) => {
      const date = new Date(t.session_date).toLocaleDateString("de-DE")
      const measures = Array.isArray(t.measures) ? (t.measures as string[]).join(", ") : ""
      const nrs =
        t.nrs_before !== null
          ? `NRS Beginn: ${t.nrs_before}${t.nrs_after !== null ? ` → Ende: ${t.nrs_after}` : ""}`
          : ""
      const notes = t.notes ? `Notiz: ${String(t.notes).slice(0, 300)}` : ""
      return [
        `${date}: ${measures || "Keine Maßnahmen dokumentiert"}`,
        nrs,
        notes,
      ]
        .filter(Boolean)
        .join(" | ")
    })
    .join("\n")

  // ── KI-Prompt zusammenstellen ──────────────────────────────────────────────

  const patientInfo = [
    `Patient: ${pseudonym}`,
    `Geburtsdatum: ${new Date(patient.geburtsdatum as string).toLocaleDateString("de-DE")}`,
    patient.krankenkasse ? `Krankenkasse: ${patient.krankenkasse}` : "",
    patient.versichertennummer ? `Versichertennummer: ${patient.versichertennummer}` : "",
    `Berichtszeitraum: ${new Date(date_from).toLocaleDateString("de-DE")} – ${new Date(date_to).toLocaleDateString("de-DE")}`,
  ]
    .filter(Boolean)
    .join("\n")

  let systemPrompt: string
  let userContent: string

  if (reportType === "arztbericht") {
    systemPrompt = `Du bist ein erfahrener Heilpraktiker für Physiotherapie und verfasst professionelle Arztberichte für mitbehandelnde Ärzte oder Überweisungsärzte.

Erstelle einen vollständigen medizinischen Arztbrief auf Deutsch in folgendem Format:
1. Anrede & Bezug (An: [Empfänger])
2. Betreff: Arztbericht
3. Anamnese
4. Klinischer Befund
5. Diagnose(n) (ICD-10 wenn vorhanden)
6. Behandlungsverlauf (mit NRS-Entwicklung)
7. Therapieziel und Prognose
8. Empfehlung / Weiteres Vorgehen
9. Grußformel

Schreibe im professionellen medizinischen Stil. Verwende Fachterminologie. Der Bericht soll 1-2 DIN-A4-Seiten umfassen.
Ersetze den Pseudonym "${pseudonym}" NICHT durch einen echten Namen — das System übernimmt die Realpersonalisierung.`

    userContent = `${patientInfo}

Empfänger: ${recipient_name}
${recipient_address ? `Adresse: ${recipient_address}` : ""}

ANAMNESE:
${anamnesisSummary || "Keine Anamnesedaten im Zeitraum dokumentiert."}

BEFUND & DIAGNOSEN:
${diagnosesSummary || "Keine Befund-/Diagnosedaten im Zeitraum dokumentiert."}

BEHANDLUNGSVERLAUF (${(treatments ?? []).length} Behandlungen):
${treatmentSummary || "Keine Behandlungen im Zeitraum dokumentiert."}

${extra_instructions ? `ZUSÄTZLICHE HINWEISE:\n${extra_instructions}` : ""}`
  } else {
    // Therapiebericht (Physiotherapeut)
    systemPrompt = `Du bist ein erfahrener Physiotherapeut und verfasst professionelle Therapieverlaufsberichte für Ärzte zur Unterstützung bei der Rezeptverlängerung oder Weiterverordnung.

Erstelle einen Therapieverlaufsbericht auf Deutsch in folgendem Format:
1. Anrede & Bezug (An: [Empfänger])
2. Betreff: Therapieverlaufsbericht
3. Behandlungsverlauf (durchgeführte Maßnahmen, NRS-Entwicklung)
4. Reaktion des Patienten / Therapieerfolg
5. Empfehlung zur Weiterbehandlung (Heilmittel, Einheiten)
6. Behandlungsziel für die nächste Verordnungsphase
7. Grußformel

WICHTIG: Enthält KEINEN Diagnose-Abschnitt — Physiotherapeuten dürfen nicht eigenständig diagnostizieren.
Schreibe im professionellen physiotherapeutischen Stil. Der Bericht soll 0,5-1 DIN-A4-Seite umfassen.
Ersetze den Pseudonym "${pseudonym}" NICHT durch einen echten Namen.`

    userContent = `${patientInfo}

Empfänger: ${recipient_name}
${recipient_address ? `Adresse: ${recipient_address}` : ""}

BEHANDLUNGSVERLAUF (${(treatments ?? []).length} Behandlungen):
${treatmentSummary || "Keine Behandlungen im Zeitraum dokumentiert."}

${extra_instructions ? `ZUSÄTZLICHE HINWEISE / GEWÜNSCHTE HEILMITTEL:\n${extra_instructions}` : ""}`
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
      model: "claude-opus-4-6",
      max_tokens: 4096,
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

  const report = normalizeReport({ ...(created as Record<string, unknown>), user_profiles: null })

  return NextResponse.json({ report }, { status: 201 })
}
