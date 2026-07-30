/**
 * GET /api/cron/bgf-quarterly-report
 *
 * Cron endpoint — runs daily at 07:00 UTC.
 * On the 5th day after each quarter ends (Apr 5, Jul 5, Oct 5, Jan 5),
 * generates PDF health reports for all active/pilot organizations
 * and emails them to the HR contact.
 *
 * Security: Protected by CRON_SECRET header.
 */

import { NextRequest, NextResponse } from "next/server"
import { createSupabaseServiceClient } from "@/lib/supabase-service"
import { sendEmail } from "@/lib/email"
import { generateBgfReportPdf } from "@/lib/pdf/bgf-report-pdf"
import Anthropic from "@anthropic-ai/sdk"

function getQuartalInfo(date: Date): { quartal: string; isReportDay: boolean } {
  const month = date.getMonth() + 1 // 1-12
  const day = date.getDate()
  const year = date.getFullYear()

  // Report days: Jan 5 (Q4 of prev year), Apr 5 (Q1), Jul 5 (Q2), Oct 5 (Q3)
  const isReportDay =
    day === 5 && (month === 1 || month === 4 || month === 7 || month === 10)

  // Which quarter are we reporting on?
  let reportQuartal: string
  if (month === 1) {
    reportQuartal = `Q4 ${year - 1}`
  } else if (month === 4) {
    reportQuartal = `Q1 ${year}`
  } else if (month === 7) {
    reportQuartal = `Q2 ${year}`
  } else if (month === 10) {
    reportQuartal = `Q3 ${year}`
  } else {
    reportQuartal = `Q${Math.ceil(month / 3)} ${year}`
  }

  return { quartal: reportQuartal, isReportDay }
}

export async function GET(request: NextRequest) {
  // Auth check
  const cronSecret = process.env.CRON_SECRET
  const authHeader = request.headers.get("authorization")
  const cronHeader = request.headers.get("x-cron-secret")

  const isAuthorized =
    (cronSecret && authHeader === `Bearer ${cronSecret}`) ||
    (cronSecret && cronHeader === cronSecret)

  if (!isAuthorized) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
  }

  const now = new Date()
  const { quartal, isReportDay } = getQuartalInfo(now)

  if (!isReportDay) {
    return NextResponse.json({
      skipped: true,
      message: `Heute ist kein Report-Tag. Nächster: 5. des nächsten Quartals-Monats.`,
      date: now.toISOString(),
    })
  }

  const sc = createSupabaseServiceClient()

  // Quartals-Reports gehören zum Vollumfang — jede aktive Organisation bekommt einen.
  const { data: orgs, error: orgsError } = await sc
    .from("organizations")
    .select("id, name, branche, kontakt_name, kontakt_email")
    .in("status", ["aktiv", "pilot"])

  if (orgsError || !orgs?.length) {
    return NextResponse.json({
      skipped: true,
      message: "Keine aktiven Organisationen gefunden.",
    })
  }

  const anthropic = new Anthropic()
  const results: { org: string; success: boolean; error?: string }[] = []

  for (const org of orgs) {
    try {
      // Fetch dashboard data via service client (no user session needed)
      const { data: members } = await sc
        .from("organization_members")
        .select("id, user_id, status, ist_analyse_abgeschlossen, abteilung")
        .eq("organization_id", org.id)

      const total = members?.length ?? 0
      const aktiv = members?.filter((m) => m.status === "aktiv").length ?? 0
      const istAnalyseQuote = total > 0
        ? Math.round((members?.filter((m) => m.ist_analyse_abgeschlossen).length ?? 0) / total * 100)
        : 0

      const activeUserIds = members?.filter((m) => m.user_id && m.status === "aktiv").map((m) => m.user_id!) ?? []

      // Health data (last 90 days)
      const ninetyDaysAgo = new Date(now.getTime() - 90 * 24 * 60 * 60 * 1000).toISOString()

      let avgSchmerz: number | null = null
      let avgStress: number | null = null
      let avgSchlaf: number | null = null
      if (activeUserIds.length > 0) {
        const { data: checkins } = await sc
          .from("bgf_daily_checkins")
          .select("schmerz, stimmung, schlaf")
          .in("user_id", activeUserIds)
          .gte("datum", ninetyDaysAgo.split("T")[0])

        if (checkins?.length) {
          const schmerzVals = checkins.map((c) => c.schmerz).filter((v): v is number => v != null)
          const stimmungVals = checkins.map((c) => c.stimmung).filter((v): v is number => v != null)
          const schlafVals = checkins.map((c) => c.schlaf).filter((v): v is number => v != null)
          avgSchmerz = schmerzVals.length ? +(schmerzVals.reduce((a, b) => a + b, 0) / schmerzVals.length).toFixed(1) : null
          avgStress = stimmungVals.length ? +(10 - stimmungVals.reduce((a, b) => a + b, 0) / stimmungVals.length).toFixed(1) : null
          avgSchlaf = schlafVals.length ? +(schlafVals.reduce((a, b) => a + b, 0) / schlafVals.length).toFixed(1) : null
        }
      }

      // Pausen-Fit stats
      let pfTotal = 0, pfCompleted = 0
      if (activeUserIds.length > 0) {
        const { data: sessions } = await sc
          .from("pausen_fit_sessions")
          .select("status")
          .eq("organization_id", org.id)
          .gte("created_at", ninetyDaysAgo)
        pfTotal = sessions?.length ?? 0
        pfCompleted = sessions?.filter((s) => s.status === "abgeschlossen").length ?? 0
      }
      const teilnahmequote = aktiv > 0 ? Math.round((pfCompleted / Math.max(1, aktiv * 60)) * 100) : 0

      // Feedback
      let avgSterne: number | null = null
      let anzahlBewertungen = 0
      if (activeUserIds.length > 0) {
        const { data: feedback } = await sc
          .from("pausen_fit_sessions")
          .select("feedback_sterne")
          .eq("organization_id", org.id)
          .not("feedback_sterne", "is", null)
          .gte("created_at", ninetyDaysAgo)
        if (feedback?.length) {
          anzahlBewertungen = feedback.length
          avgSterne = +(feedback.reduce((a, b) => a + (b.feedback_sterne ?? 0), 0) / feedback.length).toFixed(1)
        }
      }

      // Beschwerden from Ist-Analyse
      let topBeschwerden: { region: string; prozent: number }[] = []
      if (activeUserIds.length > 0) {
        const { data: analysen } = await sc
          .from("ist_analyse")
          .select("beschwerden_regionen")
          .eq("organization_id", org.id)
        if (analysen?.length) {
          const counts: Record<string, number> = {}
          analysen.forEach((a) => (a.beschwerden_regionen ?? []).forEach((r: string) => { counts[r] = (counts[r] || 0) + 1 }))
          topBeschwerden = Object.entries(counts)
            .sort(([, a], [, b]) => b - a)
            .slice(0, 5)
            .map(([region, count]) => ({ region, prozent: Math.round((count / analysen.length) * 100) }))
        }
      }

      // Abteilungen
      const abtMap = new Map<string, { total: number; active: number }>()
      members?.forEach((m) => {
        const key = m.abteilung || "Nicht zugewiesen"
        const entry = abtMap.get(key) || { total: 0, active: 0 }
        entry.total++
        if (m.status === "aktiv") entry.active++
        abtMap.set(key, entry)
      })
      const abteilungen = [...abtMap.entries()].map(([name, v]) => ({
        name,
        total: v.total,
        teilnahmequote: v.total > 0 ? Math.round((v.active / v.total) * 100) : 0,
      }))

      const dashData = {
        mitglieder: { total, aktiv, ist_analyse_quote: istAnalyseQuote },
        gesundheit: { avg_schmerz: avgSchmerz, avg_stress: avgStress, avg_schlaf: avgSchlaf, avg_risiko_score: null, top_beschwerden: topBeschwerden },
        pausen_fit: { total: pfTotal, completed: pfCompleted, teilnahmequote },
        feedback: { avg_sterne: avgSterne, anzahl_bewertungen: anzahlBewertungen },
        abteilungen,
      }

      // Claude generates the report content
      const message = await anthropic.messages.create({
        model: "claude-haiku-4-5-20251001",
        max_tokens: 4096,
        tools: [
          {
            name: "erstelle_gesundheitsbericht",
            description: "Strukturierter Gesundheitsbericht",
            input_schema: {
              type: "object" as const,
              properties: {
                zusammenfassung: { type: "string", description: "3-4 Sätze Executive Summary" },
                inhalt: { type: "string", description: "Vollständiger Bericht in Markdown" },
                empfehlungen: { type: "array", items: { type: "string" }, description: "3-5 konkrete Handlungsempfehlungen" },
                roi_einsparung_jahr: { type: "number", description: "Geschätzte Einsparung €/Jahr" },
                roi_prozent: { type: "number", description: "ROI in Prozent" },
              },
              required: ["zusammenfassung", "inhalt", "empfehlungen"],
            },
          },
        ],
        tool_choice: { type: "tool", name: "erstelle_gesundheitsbericht" },
        messages: [{
          role: "user",
          content: `Erstelle einen Gesundheitsbericht für ${org.name} (${org.branche || "Branche unbekannt"}), Zeitraum ${quartal}.
Daten: ${JSON.stringify(dashData, null, 2)}
Empfehlungen müssen KONKRET und UMSETZBAR sein. ROI: Ø AU-Tag = 300€.`,
        }],
      })

      const toolBlock = message.content.find((b) => b.type === "tool_use")
      if (!toolBlock || toolBlock.type !== "tool_use") {
        results.push({ org: org.name, success: false, error: "KI-Generierung fehlgeschlagen" })
        continue
      }

      const input = toolBlock.input as {
        zusammenfassung: string; inhalt: string; empfehlungen: string[]
        roi_einsparung_jahr?: number; roi_prozent?: number
      }

      // Generate PDF
      const pdfBuffer = await generateBgfReportPdf({
        firma: org.name,
        quartal,
        branche: org.branche || "",
        kontakt: org.kontakt_name,
        erstellt_am: now.toISOString(),
        dashboard: {
          ...dashData,
          roi: {
            einsparung_pro_jahr: input.roi_einsparung_jahr ?? 0,
            roi_prozent: input.roi_prozent ?? 0,
          },
        },
        empfehlungen: Array.isArray(input.empfehlungen) ? input.empfehlungen : [],
        zusammenfassung: input.zusammenfassung,
      })

      // Send email to HR contact
      await sendEmail({
        to: org.kontakt_email,
        subject: `Gesundheitsbericht ${quartal} — ${org.name}`,
        html: `
          <div style="font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif; max-width: 520px; margin: 0 auto; padding: 24px;">
            <div style="background: linear-gradient(135deg, #059669, #0d9488); border-radius: 12px 12px 0 0; padding: 24px; text-align: center;">
              <h1 style="color: white; font-size: 20px; margin: 0;">Gesundheitsbericht ${quartal}</h1>
              <p style="color: rgba(255,255,255,0.8); font-size: 14px; margin: 8px 0 0;">${org.name}</p>
            </div>
            <div style="background: white; padding: 24px; border: 1px solid #e5e7eb; border-top: none;">
              <p style="font-size: 14px; color: #475569; line-height: 1.6; margin: 0 0 16px;">
                Guten Tag ${org.kontakt_name},
              </p>
              <p style="font-size: 14px; color: #475569; line-height: 1.6; margin: 0 0 16px;">
                Ihr Quartals-Gesundheitsbericht ist fertig. Im Anhang finden Sie eine detaillierte
                Auswertung mit anonymisierten KPIs, Abteilungsvergleich und konkreten Handlungsempfehlungen.
              </p>
              <div style="background: #f0fdf4; border: 1px solid #bbf7d0; border-radius: 8px; padding: 16px; margin: 0 0 16px;">
                <p style="font-size: 13px; font-weight: 600; color: #166534; margin: 0 0 8px;">Zusammenfassung:</p>
                <p style="font-size: 13px; color: #374151; line-height: 1.6; margin: 0;">${input.zusammenfassung}</p>
              </div>
              <p style="font-size: 12px; color: #94a3b8; margin: 0;">
                Der vollständige Bericht ist als PDF beigefügt.
              </p>
            </div>
            <div style="background: #f8fafc; border-radius: 0 0 12px 12px; padding: 16px; text-align: center; border: 1px solid #e5e7eb; border-top: none;">
              <p style="font-size: 11px; color: #94a3b8; margin: 0;">Praxis OS — Betriebliche Gesundheitsförderung</p>
            </div>
          </div>
        `,
        attachments: [
          {
            filename: `Gesundheitsbericht-${quartal.replace(/\s+/g, "-")}-${org.name.replace(/\s+/g, "-")}.pdf`,
            content: pdfBuffer,
          },
        ],
      })

      results.push({ org: org.name, success: true })
    } catch (err) {
      console.error(`[cron/bgf-quarterly-report] Error for ${org.name}:`, err)
      results.push({
        org: org.name,
        success: false,
        error: err instanceof Error ? err.message : "Unbekannter Fehler",
      })
    }
  }

  // Notify admin
  const adminEmail = process.env.SMTP_USER || "physiotherapieglawe@gmx.de"
  const successCount = results.filter((r) => r.success).length
  await sendEmail({
    to: adminEmail,
    subject: `BGF Quartals-Reports ${quartal}: ${successCount}/${results.length} versendet`,
    html: `
      <div style="font-family: sans-serif; padding: 20px;">
        <h2>BGF Quartals-Report Versand — ${quartal}</h2>
        <p>${successCount} von ${results.length} Reports erfolgreich versendet.</p>
        <table style="border-collapse: collapse; width: 100%; font-size: 14px;">
          <tr style="background: #f1f5f9;">
            <th style="padding: 8px; text-align: left;">Organisation</th>
            <th style="padding: 8px; text-align: left;">Status</th>
          </tr>
          ${results.map((r) => `
            <tr>
              <td style="padding: 8px; border-bottom: 1px solid #e2e8f0;">${r.org}</td>
              <td style="padding: 8px; border-bottom: 1px solid #e2e8f0; color: ${r.success ? "#059669" : "#dc2626"};">
                ${r.success ? "✓ Versendet" : `✗ ${r.error}`}
              </td>
            </tr>
          `).join("")}
        </table>
      </div>
    `,
  }).catch(() => {})

  return NextResponse.json({
    quartal,
    total: results.length,
    success: successCount,
    results,
  })
}
