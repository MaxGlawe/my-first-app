/**
 * PROJ-23 / Report PDF v3 (jsPDF, server-side).
 *
 * Premium layout: emerald header band, serif (times-italic) editorial accents,
 * Ampel strip + barometer chips, and a CLICKABLE emerald CTA button (doc.link)
 * so the reader is forwarded to the Video-Analyse booking straight from the PDF.
 * Built-in fonts (helvetica + times) — embedding Inter/Cormorant is a later step.
 */
import { jsPDF } from "jspdf"
import { readFileSync } from "node:fs"
import { join } from "node:path"
import type { ReportView } from "./report"
import type { AmpelBand } from "./ampel"

// Practice logo as a data URL, read once and cached (server-only).
let _logoDataUrl: string | null | undefined
function getLogoDataUrl(): string | null {
  if (_logoDataUrl !== undefined) return _logoDataUrl
  try {
    const buf = readFileSync(join(process.cwd(), "public/images/physio-logo.png"))
    _logoDataUrl = `data:image/png;base64,${buf.toString("base64")}`
  } catch {
    _logoDataUrl = null
  }
  return _logoDataUrl
}

type RGB = [number, number, number]
const EMERALD: RGB = [6, 95, 70]
const EMERALD_BTN: RGB = [4, 120, 87]
const INK: RGB = [15, 23, 42]
const SLATE: RGB = [71, 85, 105]
const SLATE_LIGHT: RGB = [148, 163, 184]
const PAPER: RGB = [251, 250, 246]

const BAND_FILL: Record<AmpelBand, RGB> = { rot: [239, 68, 68], gelb: [245, 158, 11], gruen: [16, 185, 129] }
const BAND_TINT: Record<AmpelBand, RGB> = { rot: [254, 242, 242], gelb: [255, 251, 235], gruen: [236, 253, 245] }
const BAND_WORD: Record<AmpelBand, string> = { rot: "Handeln", gelb: "Beobachten", gruen: "Stabil" }

export function generateReportPdf(view: ReportView, dateStr: string, baseUrl: string): ArrayBuffer {
  const doc = new jsPDF({ unit: "pt", format: "a4", compress: true })
  const pageW = doc.internal.pageSize.getWidth()
  const pageH = doc.internal.pageSize.getHeight()
  const margin = 50
  const contentW = pageW - margin * 2
  let y = margin

  const ensure = (needed: number) => {
    if (y + needed > pageH - margin) {
      doc.addPage()
      y = margin
    }
  }

  const para = (text: string, size = 10.5, color: RGB = SLATE, gap = 9, style: "normal" | "bold" | "italic" = "normal", font: "helvetica" | "times" = "helvetica") => {
    doc.setFont(font, style)
    doc.setFontSize(size)
    doc.setTextColor(...color)
    const lines = doc.splitTextToSize(text, contentW) as string[]
    for (const line of lines) {
      ensure(size + 4)
      doc.text(line, margin, y)
      y += size + 4
    }
    y += gap
  }

  // Serif italic editorial accent (mimics Cormorant)
  const accent = (text: string, size = 12, color: RGB = EMERALD) => {
    doc.setFont("times", "italic")
    doc.setFontSize(size)
    doc.setTextColor(...color)
    ensure(size + 2)
    doc.text(text, margin, y)
    y += size + 4
  }

  const eyebrow = (text: string) => {
    ensure(46)
    y += 14
    doc.setFont("helvetica", "bold")
    doc.setFontSize(7.5)
    doc.setTextColor(...EMERALD)
    doc.text(text.toUpperCase(), margin, y, { charSpace: 1 })
    y += 21
  }

  const heading = (text: string) => {
    doc.setFont("helvetica", "bold")
    doc.setFontSize(16)
    doc.setTextColor(...INK)
    const lines = doc.splitTextToSize(text, contentW) as string[]
    for (const line of lines) {
      ensure(20)
      doc.text(line, margin, y)
      y += 20
    }
    y += 4
  }

  // Clickable, filled emerald button (forwards on click)
  const linkButton = (label: string, url: string) => {
    const bh = 34
    ensure(bh + 12)
    doc.setFont("helvetica", "bold")
    doc.setFontSize(12)
    const tw = doc.getTextWidth(label + "   ›")
    const bw = Math.min(contentW, Math.max(200, tw + 44))
    doc.setFillColor(...EMERALD_BTN)
    doc.roundedRect(margin, y, bw, bh, 7, 7, "F")
    doc.setTextColor(255, 255, 255)
    doc.text(`${label}   ›`, margin + 22, y + bh / 2 + 4)
    doc.link(margin, y, bw, bh, { url })
    y += bh + 6
    // tiny clickable URL line for transparency
    doc.setFont("helvetica", "normal")
    doc.setFontSize(8)
    doc.setTextColor(...SLATE_LIGHT)
    doc.textWithLink(url.length > 70 ? url.slice(0, 70) + "…" : url, margin, y, { url })
    y += 14
  }

  // ── Header band ──
  doc.setFillColor(...EMERALD)
  doc.rect(0, 0, pageW, 92, "F")
  const logo = getLogoDataUrl()
  if (logo) {
    // white "coin" so the logo reads cleanly on the emerald band
    doc.setFillColor(255, 255, 255)
    doc.circle(margin + 26, 46, 27, "F")
    try {
      doc.addImage(logo, "PNG", margin + 2, 22, 48, 48)
    } catch {
      /* image embed failed — wordmark still shows */
    }
    doc.setFont("helvetica", "bold")
    doc.setFontSize(16)
    doc.setTextColor(255, 255, 255)
    doc.text("Praxis OS", margin + 66, 51)
  } else {
    doc.setFillColor(255, 255, 255)
    doc.circle(margin + 13, 40, 13, "F")
    doc.setFont("helvetica", "bold")
    doc.setFontSize(15)
    doc.setTextColor(...EMERALD)
    doc.text("P", margin + 9, 45)
    doc.setTextColor(255, 255, 255)
    doc.setFontSize(15)
    doc.text("Praxis OS", margin + 34, 45)
  }
  doc.setFont("helvetica", "normal")
  doc.setFontSize(8)
  doc.setTextColor(209, 250, 229)
  doc.text(`SCHMERZ-REPORT · ${dateStr}`, pageW - margin, 46, { align: "right", charSpace: 0.5 })
  y = 122

  // ── Title ──
  accent("Dein persönlicher Schmerz-Report", 13)
  y += 7
  doc.setFont("helvetica", "bold")
  doc.setFontSize(22)
  doc.setTextColor(...INK)
  doc.text(`Hallo ${view.firstName},`, margin, y)
  y += 24
  para("deine persönliche Standortbestimmung im Überblick.", 12, INK, 10)

  // ── Gesamtbild strip ──
  {
    const band = view.ampel.overall
    ensure(70)
    const stripTop = y
    const actionLines = doc.splitTextToSize(view.ampel.actionLine, contentW - 36) as string[]
    const stripH = 40 + actionLines.length * 13
    doc.setFillColor(...BAND_TINT[band])
    doc.setDrawColor(...BAND_FILL[band])
    doc.roundedRect(margin, stripTop, contentW, stripH, 8, 8, "FD")
    doc.setFillColor(...BAND_FILL[band])
    doc.roundedRect(margin, stripTop, 5, stripH, 2, 2, "F")
    doc.setFont("helvetica", "bold")
    doc.setFontSize(7.5)
    doc.setTextColor(...SLATE)
    doc.text("DEIN GESAMTBILD", margin + 18, stripTop + 18, { charSpace: 1 })
    doc.setFontSize(14)
    doc.setTextColor(...INK)
    doc.text(view.ampel.headline, margin + 18, stripTop + 34)
    doc.setFont("helvetica", "normal")
    doc.setFontSize(10)
    doc.setTextColor(...SLATE)
    let ay = stripTop + 50
    for (const l of actionLines) {
      doc.text(l, margin + 18, ay)
      ay += 13
    }
    y = stripTop + stripH + 16
  }

  // ── Disclaimer ──
  {
    const discText = doc.splitTextToSize(
      "Dieser Report ist eine strukturierte Bewegungs-Standortbestimmung auf Basis deiner Antworten — keine medizinische Diagnose und kein Ersatz für eine ärztliche Untersuchung. Die Hinweise dienen der Orientierung, nicht der Heilbehandlung im Sinne des HWG. Bei Unsicherheit oder Verschlechterung: bitte ärztlich abklären.",
      contentW - 24
    ) as string[]
    ensure(24 + discText.length * 12)
    const top = y
    const h = 22 + discText.length * 12
    doc.setFillColor(248, 250, 252)
    doc.setDrawColor(226, 232, 240)
    doc.roundedRect(margin, top, contentW, h, 8, 8, "FD")
    doc.setFont("helvetica", "bold")
    doc.setFontSize(9)
    doc.setTextColor(...INK)
    doc.text("Wichtiger Hinweis", margin + 12, top + 16)
    doc.setFont("helvetica", "normal")
    doc.setFontSize(8.5)
    doc.setTextColor(...SLATE)
    let dy = top + 30
    for (const l of discText) {
      doc.text(l, margin + 12, dy)
      dy += 12
    }
    y = top + h + 16
  }

  // ── Section 1 ──
  eyebrow("01 · Deine Standortbestimmung")
  heading("Wo du gerade stehst")
  para(view.intro)
  para(view.severityPlain)
  para(`Schwerpunkt deiner Angaben: ${view.regionLabel}.`, 10.5, INK)

  // ── Barometer ──
  eyebrow("Dein Barometer")
  heading("Schmerz, Beweglichkeit & Stress")
  for (const d of view.ampel.dimensions) {
    ensure(60)
    // label + chip
    doc.setFont("helvetica", "bold")
    doc.setFontSize(11)
    doc.setTextColor(...INK)
    doc.text(d.label, margin, y)
    const word = BAND_WORD[d.band]
    doc.setFont("helvetica", "bold")
    doc.setFontSize(8)
    const cw = doc.getTextWidth(word) + 16
    doc.setFillColor(...BAND_FILL[d.band])
    doc.roundedRect(margin + contentW - cw, y - 9, cw, 14, 7, 7, "F")
    doc.setTextColor(255, 255, 255)
    doc.text(word, margin + contentW - cw + 8, y + 1)
    y += 9
    // 3-segment track
    const trackH = 7
    const w = contentW
    doc.setFillColor(...BAND_FILL.rot)
    doc.rect(margin, y, w / 3, trackH, "F")
    doc.setFillColor(...BAND_FILL.gelb)
    doc.rect(margin + w / 3, y, w / 3, trackH, "F")
    doc.setFillColor(...BAND_FILL.gruen)
    doc.rect(margin + (2 * w) / 3, y, w / 3, trackH, "F")
    // marker
    const mx = margin + (d.value / 100) * w
    doc.setFillColor(...INK)
    doc.circle(mx, y + trackH / 2, 4.5, "F")
    doc.setFillColor(255, 255, 255)
    doc.circle(mx, y + trackH / 2, 2, "F")
    y += trackH + 4
    // zone labels
    doc.setFont("helvetica", "normal")
    doc.setFontSize(6.5)
    doc.setTextColor(...SLATE_LIGHT)
    doc.text("Handeln", margin, y + 4)
    doc.text("Beobachten", margin + w / 2, y + 4, { align: "center" })
    doc.text("Stabil", margin + w, y + 4, { align: "right" })
    y += 12
    para(d.sentence, 9.5, SLATE, 10)
  }

  // ── Section 2 ──
  eyebrow("02 · Was deine Antworten zeigen")
  heading("Deine Einordnung im Detail")
  for (const p of view.interpretation) para(p)

  // ── Section 3 ──
  eyebrow("03 · Deine 7-Tage-Bewegungs-Roadmap")
  heading("Drei Bausteine für deinen Alltag")
  para("Je 5 Minuten — als sanfter Einstieg, nicht als Trainingsplan.", 9.5, SLATE_LIGHT)
  for (const m of view.modules) {
    ensure(50)
    doc.setFont("helvetica", "bold")
    doc.setFontSize(11)
    doc.setTextColor(...INK)
    doc.text(`${m.name}  ·  ${m.duration}`, margin, y)
    y += 14
    accent(m.technique, 10)
    para(m.description, 9.5, SLATE, 9)
  }

  // ── Section 4 — Empfehlung + CTA ──
  eyebrow("04 · Deine Empfehlung")
  heading("Dein nächster Schritt")
  para(view.recommendation.text, 11, INK)
  if (view.recommendation.ctaType === "booking") {
    linkButton(view.recommendation.ctaLabel, view.recommendationHref)
    para("69 € Erstanalyse · anschließend Betreuung 16,99 €/Monat · monatlich kündbar", 8, SLATE_LIGHT)
  } else if (view.recommendation.ctaType === "info") {
    linkButton(view.recommendation.ctaLabel, `${baseUrl}/anfrage`)
  } else {
    para("→ Starte mit deiner Bewegungs-Roadmap oben.", 10, EMERALD)
  }

  // ── Praxis OS ──
  {
    ensure(80)
    const top = y
    doc.setFillColor(...INK)
    doc.roundedRect(margin, top, contentW, 64, 8, 8, "F")
    doc.setFont("times", "italic")
    doc.setFontSize(13)
    doc.setTextColor(209, 250, 229)
    doc.text("Mehr als ein Report", margin + 16, top + 22)
    doc.setFont("helvetica", "bold")
    doc.setFontSize(13)
    doc.setTextColor(255, 255, 255)
    doc.text("Praxis OS — dein Therapeut für die Hosentasche.", margin + 16, top + 40)
    doc.setFont("helvetica", "bold")
    doc.setFontSize(9)
    doc.setTextColor(110, 231, 183)
    doc.textWithLink("Praxis OS entdecken  ›", margin + 16, top + 56, { url: `${baseUrl}/online-physiotherapie` })
    y = top + 64 + 16
  }

  // ── About ──
  eyebrow("Hinter dem Schmerzcheck")
  heading("Max Glawe")
  accent("Heilpraktiker für Physiotherapie", 11)
  para("Der Schmerzcheck wurde in der Physiotherapie Glawe in Wildau entwickelt — auf Basis tausender Patientengespräche und etablierter Screening-Instrumente.", 9.5)

  // ── Footer disclaimer ──
  ensure(36)
  para("Der Schmerzcheck ist ein orientierendes Screening-Instrument und ersetzt keine ärztliche Untersuchung oder Diagnose. Die Inhalte dienen der Information, nicht der Heilbehandlung im Sinne des Heilmittelwerbegesetzes.", 7.5, SLATE_LIGHT)

  return doc.output("arraybuffer") as ArrayBuffer
}
