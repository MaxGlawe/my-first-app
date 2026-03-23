/**
 * PROJ-18: POST /api/bgf/organizations/[id]/report
 *
 * Generates a quarterly health report for management using Claude AI.
 * Input: dashboard KPIs (fetched internally)
 * Output: Structured report text (can be rendered as PDF)
 */

import { NextRequest, NextResponse } from "next/server"
import { createSupabaseServerClient } from "@/lib/supabase-server"
import { createSupabaseServiceClient } from "@/lib/supabase-service"
import Anthropic from "@anthropic-ai/sdk"
import { requireTierAccess } from "@/lib/bgf-tier-guard"
import { BgfFeature } from "@/lib/bgf-tiers"

const UUID_REGEX = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i

export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id: orgId } = await params

  if (!UUID_REGEX.test(orgId)) {
    return NextResponse.json({ error: "Ungültige Organisations-ID." }, { status: 400 })
  }

  // Tier-Check: Quartals-Reports requires Enterprise
  const tierAccess = await requireTierAccess(orgId, BgfFeature.QUARTALS_REPORTS)
  if (!tierAccess.allowed) return tierAccess.response

  const supabase = await createSupabaseServerClient()
  const { data: { user }, error: authError } = await supabase.auth.getUser()
  if (authError || !user) {
    return NextResponse.json({ error: "Nicht autorisiert." }, { status: 401 })
  }

  const sc = createSupabaseServiceClient()

  // Check access: Admin or BGF-Therapeut for this org
  const { data: profile } = await sc
    .from("user_profiles")
    .select("role, bgf_freigeschaltet")
    .eq("id", user.id)
    .single()

  if (!profile) {
    return NextResponse.json({ error: "Profil nicht gefunden." }, { status: 404 })
  }

  const isAdmin = profile.role === "admin"
  const isBgfTherapist = !!profile.bgf_freigeschaltet

  // Also allow HR admins of this organization
  let isHrAdmin = false
  if (!isAdmin && !isBgfTherapist) {
    const { data: orgAdmin } = await sc
      .from("organization_admins")
      .select("id")
      .eq("user_id", user.id)
      .eq("organization_id", orgId)
      .maybeSingle()
    isHrAdmin = !!orgAdmin
  }

  if (!isAdmin && !isBgfTherapist && !isHrAdmin) {
    return NextResponse.json({ error: "Keine Berechtigung." }, { status: 403 })
  }

  // Fetch org details
  const { data: org } = await sc
    .from("organizations")
    .select("name, branche, vertrag_tier, kontakt_name")
    .eq("id", orgId)
    .single()

  if (!org) {
    return NextResponse.json({ error: "Organisation nicht gefunden." }, { status: 404 })
  }

  // Fetch dashboard data (reuse logic from dashboard endpoint)
  const dashboardUrl = new URL(`/api/bgf/organizations/${orgId}/dashboard?zeitraum=90`, request.url)
  const dashRes = await fetch(dashboardUrl.toString(), {
    headers: { cookie: request.headers.get("cookie") || "" },
  })

  if (!dashRes.ok) {
    return NextResponse.json({ error: "Dashboard-Daten nicht verfügbar." }, { status: 500 })
  }

  const dashData = await dashRes.json()

  // Generate report with Claude
  const anthropic = new Anthropic()

  const heute = new Date()
  const quartal = `Q${Math.ceil((heute.getMonth() + 1) / 3)} ${heute.getFullYear()}`

  const prompt = `Erstelle einen professionellen Gesundheitsbericht für die Geschäftsführung.
Sprache: Deutsch. Ton: sachlich-professionell, datenbasiert, konkret.

FIRMA: ${org.name}
BRANCHE: ${org.branche || "nicht angegeben"}
ZEITRAUM: Letzte 90 Tage (${quartal})
KONTAKT: ${org.kontakt_name}

DATEN:
- Mitarbeiter gesamt: ${dashData.mitglieder.total}
- Aktiv im Programm: ${dashData.mitglieder.aktiv}
- Ist-Analyse abgeschlossen: ${dashData.mitglieder.ist_analyse_quote}%
- Ø Schmerzlevel: ${dashData.gesundheit.avg_schmerz ?? "keine Daten"}/10
- Ø Stresslevel: ${dashData.gesundheit.avg_stress ?? "keine Daten"}/10
- Ø Schlafqualität: ${dashData.gesundheit.avg_schlaf ?? "keine Daten"}/10
- Ø Risiko-Score: ${dashData.gesundheit.avg_risiko_score ?? "keine Daten"}/100
- Häufigste Beschwerden: ${dashData.gesundheit.top_beschwerden?.map((b: { region: string; prozent: number }) => `${b.region} (${b.prozent}%)`).join(", ") || "keine"}
- Pausen-Fit Sessions gesamt: ${dashData.pausen_fit.total}
- Pausen-Fit abgeschlossen: ${dashData.pausen_fit.completed}
- Pausen-Fit Teilnahmequote: ${dashData.pausen_fit.teilnahmequote}%
- Ø Pausen-Fit Bewertung: ${dashData.feedback.avg_sterne ?? "keine"}/5 (${dashData.feedback.anzahl_bewertungen} Bewertungen)
- Abteilungen: ${dashData.abteilungen?.map((a: { name: string; teilnahmequote: number; total: number }) => `${a.name} (${a.total} MA, ${a.teilnahmequote}% Teilnahme)`).join("; ") || "keine Aufteilung"}

STRUKTUR DES BERICHTS:
1. ZUSAMMENFASSUNG (3-4 Sätze Kernaussagen)
2. TEILNAHME & ENGAGEMENT (Aktivierungsquote, Pausen-Fit Nutzung, Feedback)
3. GESUNDHEITSSTATUS (Schmerz, Stress, Schlaf — anonymisiert)
4. HÄUFIGSTE BESCHWERDEN (Top 5 mit Prozentzahlen)
5. ABTEILUNGSVERGLEICH (falls Daten vorhanden — anonymisiert, nur bei ≥5 MA pro Abteilung)
6. EMPFEHLUNGEN (3-5 konkrete, umsetzbare Maßnahmen basierend auf den Daten)
7. ROI-EINSCHÄTZUNG (geschätzte AU-Tage-Einsparung basierend auf Schmerzreduktion und Teilnahme)

WICHTIG:
- Keine individuellen Gesundheitsdaten nennen
- Alle Daten sind anonymisiert und aggregiert
- Empfehlungen müssen konkret und umsetzbar sein (z.B. "Ergonomie-Schulung für Abteilung X" statt "Ergonomie verbessern")
- ROI-Berechnung: Ø AU-Tag kostet 300€, Ø 5 Rücken-AU-Tage/MA/Jahr bei Ø Schmerz >4

Formatiere mit Markdown (## Überschriften, **fett**, Aufzählungen).`

  try {
    const message = await anthropic.messages.create({
      model: "claude-haiku-4-5-20251001",
      max_tokens: 4096,
      messages: [{ role: "user", content: prompt }],
    })

    const textBlock = message.content.find((b) => b.type === "text")
    if (!textBlock || textBlock.type !== "text") {
      return NextResponse.json({ error: "KI konnte keinen Report generieren." }, { status: 500 })
    }

    return NextResponse.json({
      report: {
        titel: `Gesundheitsbericht ${quartal} — ${org.name}`,
        quartal,
        firma: org.name,
        erstellt_am: new Date().toISOString(),
        erstellt_von: "Praxis OS BGF — KI-generiert",
        inhalt: textBlock.text,
        daten: dashData,
      },
    })
  } catch (err) {
    console.error("[POST /api/bgf/.../report] Claude error:", err)
    return NextResponse.json(
      { error: "Report konnte nicht generiert werden." },
      { status: 500 }
    )
  }
}
