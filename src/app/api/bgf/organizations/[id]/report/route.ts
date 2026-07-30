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

const UUID_REGEX = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i

export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id: orgId } = await params

  if (!UUID_REGEX.test(orgId)) {
    return NextResponse.json({ error: "Ungültige Organisations-ID." }, { status: 400 })
  }

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

  // Generate report with Claude (structured output via tool_use)
  const anthropic = new Anthropic()
  const { generateBgfReportPdf } = await import("@/lib/pdf/bgf-report-pdf")

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

Erstelle:
1. Eine ZUSAMMENFASSUNG (3-4 Sätze, die wichtigsten Erkenntnisse)
2. Den vollständigen BERICHT in Markdown (Teilnahme, Gesundheitsstatus, Beschwerden, Abteilungsvergleich, ROI)
3. Exakt 3-5 HANDLUNGSEMPFEHLUNGEN — konkret, priorisiert, direkt umsetzbar für die Geschäftsleitung
4. Eine ROI-Einschätzung (Ø AU-Tag = 300€, Ø 5 Rücken-AU-Tage/MA/Jahr bei Schmerz >4)

WICHTIG:
- Empfehlungen müssen KONKRET sein ("Ergonomie-Workshop für Abt. Lager im Q2 durchführen" statt "Ergonomie verbessern")
- Jede Empfehlung beginnt mit einer klaren Handlungsaufforderung
- Keine individuellen Gesundheitsdaten, alles anonymisiert`

  try {
    const message = await anthropic.messages.create({
      model: "claude-haiku-4-5-20251001",
      max_tokens: 4096,
      tools: [
        {
          name: "erstelle_gesundheitsbericht",
          description: "Strukturierter Gesundheitsbericht für PDF-Generierung",
          input_schema: {
            type: "object" as const,
            properties: {
              zusammenfassung: {
                type: "string",
                description: "Executive Summary — 3-4 Sätze Kernaussagen für die Geschäftsleitung",
              },
              inhalt: {
                type: "string",
                description: "Vollständiger Berichtstext in Markdown (Teilnahme, Gesundheit, Beschwerden, Abteilungen, ROI)",
              },
              empfehlungen: {
                type: "array",
                items: { type: "string" },
                description: "3-5 konkrete, priorisierte Handlungsempfehlungen",
              },
              roi_einsparung_jahr: {
                type: "number",
                description: "Geschätzte jährliche Einsparung in Euro durch Fehltagereduktion",
              },
              roi_prozent: {
                type: "number",
                description: "ROI in Prozent (Einsparung / BGF-Kosten × 100)",
              },
            },
            required: ["zusammenfassung", "inhalt", "empfehlungen"],
          },
        },
      ],
      tool_choice: { type: "tool", name: "erstelle_gesundheitsbericht" },
      messages: [{ role: "user", content: prompt }],
    })

    const toolBlock = message.content.find((b) => b.type === "tool_use")
    if (!toolBlock || toolBlock.type !== "tool_use") {
      return NextResponse.json({ error: "KI konnte keinen Report generieren." }, { status: 500 })
    }

    const raw = toolBlock.input as Record<string, unknown>

    // Robust parsing — Claude Haiku sometimes injects XML tags or returns
    // arrays as JSON strings (known issue with German text + tool_use)
    function cleanText(val: unknown): string {
      if (typeof val !== "string") return ""
      return val
        .replace(/<\/?[a-z_]+(?:\s[^>]*)?>/gi, "") // strip XML-like tags
        .replace(/\*\*(.+?)\*\*/g, "$1") // strip markdown bold for summary
        .trim()
    }

    function coerceArray(val: unknown): string[] {
      if (Array.isArray(val)) return val.map((v) => String(v))
      if (typeof val === "string") {
        try { const parsed = JSON.parse(val); if (Array.isArray(parsed)) return parsed.map(String) } catch {}
        return val.split("\n").filter((l) => l.trim().length > 5)
      }
      return []
    }

    const zusammenfassung = cleanText(raw.zusammenfassung)
    const inhalt = typeof raw.inhalt === "string" ? raw.inhalt : ""
    const empfehlungen = coerceArray(raw.empfehlungen).map((e) =>
      e.replace(/<\/?[a-z_]+(?:\s[^>]*)?>/gi, "").replace(/\*\*(.+?)\*\*/g, "$1").trim()
    )
    const roi_einsparung_jahr = typeof raw.roi_einsparung_jahr === "number" ? raw.roi_einsparung_jahr : 0
    const roi_prozent = typeof raw.roi_prozent === "number" ? raw.roi_prozent : 0

    // Generate PDF
    const pdfBuffer = await generateBgfReportPdf({
      firma: org.name,
      quartal,
      branche: org.branche || "",
      kontakt: org.kontakt_name,
      erstellt_am: new Date().toISOString(),
      dashboard: {
        ...dashData,
        roi: {
          einsparung_pro_jahr: roi_einsparung_jahr,
          roi_prozent: roi_prozent,
        },
      },
      empfehlungen,
      zusammenfassung,
    })

    const pdfBase64 = pdfBuffer.toString("base64")

    return NextResponse.json({
      report: {
        titel: `Gesundheitsbericht ${quartal} — ${org.name}`,
        quartal,
        firma: org.name,
        erstellt_am: new Date().toISOString(),
        erstellt_von: "Praxis OS BGF — KI-generiert",
        inhalt,
        zusammenfassung,
        empfehlungen,
        daten: dashData,
        pdf_base64: pdfBase64,
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
