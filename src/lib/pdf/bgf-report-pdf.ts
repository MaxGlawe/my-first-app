/**
 * BGF Quarterly Health Report — Premium PDF generation
 * Professional management report layout with KPIs, charts, and action items.
 */

import { jsPDF } from "jspdf"

// ── Colors ──────────────────────────────────────────────────────────
const EMERALD = { r: 5, g: 150, b: 105 }
const EMERALD_DARK = { r: 4, g: 120, b: 87 }
const DARK = { r: 15, g: 23, b: 42 }
const SLATE = { r: 71, g: 85, b: 105 }
const GRAY = { r: 100, g: 116, b: 139 }
const LIGHT = { r: 148, g: 163, b: 184 }
const SUBTLE_BG = { r: 248, g: 250, b: 252 }
const GREEN_BG = { r: 240, g: 253, b: 244 }
const GREEN_BORDER = { r: 187, g: 247, b: 208 }
const RED = { r: 220, g: 38, b: 38 }
const RED_BG = { r: 254, g: 242, b: 242 }
const AMBER = { r: 217, g: 119, b: 6 }
const AMBER_BG = { r: 255, g: 251, b: 235 }
const WHITE = { r: 255, g: 255, b: 255 }
const INDIGO = { r: 79, g: 70, b: 229 }

// ── Layout ──────────────────────────────────────────────────────────
const PAGE_W = 210
const PAGE_H = 297
const ML = 22
const MR = 22
const CONTENT_W = PAGE_W - ML - MR
const RIGHT_EDGE = PAGE_W - MR

type Color = { r: number; g: number; b: number }
type ReportData = {
  firma: string
  quartal: string
  branche: string
  kontakt: string
  erstellt_am: string
  dashboard: {
    mitglieder: { total: number; aktiv: number; ist_analyse_quote: number }
    gesundheit: {
      avg_schmerz: number | null
      avg_stress: number | null
      avg_schlaf: number | null
      avg_risiko_score: number | null
      top_beschwerden: { region: string; prozent: number }[]
    }
    pausen_fit: { total: number; completed: number; teilnahmequote: number }
    feedback: { avg_sterne: number | null; anzahl_bewertungen: number }
    abteilungen: { name: string; total: number; teilnahmequote: number }[]
    roi?: { einsparung_pro_jahr?: number; roi_prozent?: number }
  }
  empfehlungen: string[]
  zusammenfassung: string
}

// ── Helpers ──────────────────────────────────────────────────────────

function fmtDate(dateStr: string): string {
  return new Date(dateStr).toLocaleDateString("de-DE", {
    day: "2-digit",
    month: "long",
    year: "numeric",
  })
}

/** Map raw DB region keys to readable German labels */
const REGION_LABELS: Record<string, string> = {
  lws: "Lendenwirbelsäule (LWS)",
  hws: "Halswirbelsäule (HWS)",
  hws_nacken: "HWS & Nacken",
  bws: "Brustwirbelsäule (BWS)",
  schulter: "Schulter",
  knie: "Knie",
  huefte: "Hüfte",
  handgelenk_ellenbogen: "Handgelenk & Ellenbogen",
  fuss_sprunggelenk: "Fuß & Sprunggelenk",
  hand_arm: "Hand & Arm",
  kopf: "Kopf / Migräne",
  nacken: "Nacken",
  oberschenkel: "Oberschenkel",
}

function readableRegion(raw: string): string {
  return REGION_LABELS[raw.toLowerCase()] || raw.charAt(0).toUpperCase() + raw.slice(1).replace(/_/g, " ")
}

/** Strip markdown bold/italic markers from text */
function stripMarkdown(text: string): string {
  return text
    .replace(/\*\*(.+?)\*\*/g, "$1")
    .replace(/\*(.+?)\*/g, "$1")
    .replace(/__(.+?)__/g, "$1")
    .replace(/_(.+?)_/g, "$1")
}

function ampelColor(value: number, thresholds: { good: number; warn: number }, inverted = false): Color {
  if (inverted) {
    return value <= thresholds.good ? EMERALD : value <= thresholds.warn ? AMBER : RED
  }
  return value >= thresholds.good ? EMERALD : value >= thresholds.warn ? AMBER : RED
}

function ampelBg(value: number, thresholds: { good: number; warn: number }, inverted = false): Color {
  if (inverted) {
    return value <= thresholds.good ? GREEN_BG : value <= thresholds.warn ? AMBER_BG : RED_BG
  }
  return value >= thresholds.good ? GREEN_BG : value >= thresholds.warn ? AMBER_BG : RED_BG
}

function fmtKpi(value: number | null, suffix: string): string {
  if (value === null || value === undefined) return "Keine Daten"
  return `${value.toFixed(1)}${suffix}`
}

// ── Main ─────────────────────────────────────────────────────────────

export async function generateBgfReportPdf(data: ReportData): Promise<Buffer> {
  const doc = new jsPDF({ unit: "mm", format: "a4" })
  let y = 0

  const setColor = (c: Color) => doc.setTextColor(c.r, c.g, c.b)
  const setFill = (c: Color) => doc.setFillColor(c.r, c.g, c.b)

  function checkPageBreak(needed: number) {
    if (y + needed > PAGE_H - 25) {
      doc.addPage()
      y = 20
      setFill(EMERALD)
      doc.rect(0, 0, PAGE_W, 2, "F")
    }
  }

  function drawKpiCard(x: number, boxY: number, w: number, label: string, value: string, color: Color, bgColor: Color) {
    setFill(bgColor)
    doc.roundedRect(x, boxY, w, 30, 3, 3, "F")
    // Accent line top
    setFill(color)
    doc.roundedRect(x, boxY, w, 3, 3, 3, "F")
    doc.setFillColor(bgColor.r, bgColor.g, bgColor.b)
    doc.rect(x, boxY + 2, w, 2, "F") // cover bottom part of rounded accent
    // Value
    doc.setFontSize(20)
    doc.setFont("helvetica", "bold")
    setColor(color)
    doc.text(value, x + w / 2, boxY + 16, { align: "center" })
    // Label
    doc.setFontSize(7.5)
    doc.setFont("helvetica", "normal")
    setColor(GRAY)
    doc.text(label, x + w / 2, boxY + 24, { align: "center" })
  }

  function sectionTitle(title: string) {
    checkPageBreak(20)
    y += 12
    setFill(EMERALD)
    doc.roundedRect(ML, y, 4, 8, 1, 1, "F")
    doc.setFontSize(14)
    doc.setFont("helvetica", "bold")
    setColor(DARK)
    doc.text(title, ML + 8, y + 6)
    // Subtle underline
    setFill({ r: 226, g: 232, b: 240 })
    doc.rect(ML, y + 10, CONTENT_W, 0.3, "F")
    y += 16
  }

  function bodyText(text: string, maxWidth?: number) {
    doc.setFontSize(9.5)
    doc.setFont("helvetica", "normal")
    setColor(SLATE)
    const lines = doc.splitTextToSize(stripMarkdown(text), maxWidth ?? CONTENT_W)
    checkPageBreak(lines.length * 4.5)
    doc.text(lines, ML, y)
    y += lines.length * 4.5
  }

  // ════════════════════════════════════════════════════════════════════
  // PAGE 1: COVER
  // ════════════════════════════════════════════════════════════════════

  // Full-width emerald header block
  setFill(EMERALD)
  doc.rect(0, 0, PAGE_W, 85, "F")
  // Darker overlay stripe
  setFill(EMERALD_DARK)
  doc.rect(0, 0, PAGE_W, 4, "F")

  // Branding in header
  y = 18
  doc.setFontSize(9)
  doc.setFont("helvetica", "bold")
  setColor(WHITE)
  doc.text("PRAXIS OS", ML, y)
  doc.setFont("helvetica", "normal")
  doc.setTextColor(255, 255, 255, 180)
  doc.text("  |  Betriebliche Gesundheitsförderung", ML + 20, y)

  // Title
  y = 42
  doc.setFontSize(32)
  doc.setFont("helvetica", "bold")
  setColor(WHITE)
  doc.text("Gesundheitsbericht", ML, y)
  y += 14
  doc.setFontSize(22)
  doc.setFont("helvetica", "normal")
  doc.text(data.quartal, ML, y)

  // Confidential badge
  y = 72
  doc.setFontSize(7)
  doc.setFont("helvetica", "bold")
  setFill(WHITE)
  doc.roundedRect(ML, y, 32, 6, 1.5, 1.5, "F")
  setColor(EMERALD)
  doc.text("VERTRAULICH", ML + 16, y + 4.2, { align: "center" })

  // Company info card
  y = 100
  setFill(WHITE)
  doc.roundedRect(ML, y, CONTENT_W, 38, 4, 4, "F")
  // Shadow effect (subtle border)
  doc.setDrawColor(226, 232, 240)
  doc.setLineWidth(0.3)
  doc.roundedRect(ML, y, CONTENT_W, 38, 4, 4, "S")

  doc.setFontSize(8)
  doc.setFont("helvetica", "normal")
  setColor(GRAY)
  doc.text("ERSTELLT FÜR", ML + 10, y + 10)

  doc.setFontSize(18)
  doc.setFont("helvetica", "bold")
  setColor(DARK)
  doc.text(data.firma, ML + 10, y + 20)

  doc.setFontSize(9)
  doc.setFont("helvetica", "normal")
  setColor(SLATE)
  const metaLine = [
    data.branche ? `Branche: ${data.branche}` : null,
    `Ansprechpartner: ${data.kontakt}`,
  ].filter(Boolean).join("   |   ")
  doc.text(metaLine, ML + 10, y + 28)

  // Report meta
  y = 155
  doc.setFontSize(8.5)
  setColor(LIGHT)
  doc.text(`Erstellt am ${fmtDate(data.erstellt_am)}`, ML, y)
  y += 5
  doc.text("Praxis OS  —  KI-gestützter Gesundheitsbericht  —  DSGVO-konform", ML, y)

  // ════════════════════════════════════════════════════════════════════
  // PAGE 2: EXECUTIVE SUMMARY + KPIs
  // ════════════════════════════════════════════════════════════════════
  doc.addPage()
  setFill(EMERALD)
  doc.rect(0, 0, PAGE_W, 2, "F")
  y = 15

  // Executive Summary in highlighted box
  sectionTitle("Zusammenfassung")
  setFill(GREEN_BG)
  const summaryLines = doc.splitTextToSize(stripMarkdown(data.zusammenfassung), CONTENT_W - 20)
  const summaryH = summaryLines.length * 4.5 + 14
  doc.roundedRect(ML, y, CONTENT_W, summaryH, 3, 3, "F")
  // Green left border
  setFill(EMERALD)
  doc.roundedRect(ML, y, 3, summaryH, 1.5, 1.5, "F")
  doc.setFontSize(9.5)
  doc.setFont("helvetica", "normal")
  setColor(SLATE)
  doc.text(summaryLines, ML + 10, y + 8)
  y += summaryH + 4

  // KPI Dashboard
  sectionTitle("Kennzahlen im Überblick")

  const d = data.dashboard
  const kpiW = (CONTENT_W - 12) / 3
  const kpiGap = 6

  // Row 1
  const teilnahmeVal = d.pausen_fit.teilnahmequote
  const teilnahmeColor = ampelColor(teilnahmeVal, { good: 60, warn: 30 })
  const teilnahmeBg = ampelBg(teilnahmeVal, { good: 60, warn: 30 })
  drawKpiCard(ML, y, kpiW, "Teilnahmequote", `${teilnahmeVal}%`, teilnahmeColor, teilnahmeBg)

  const schmerzVal = d.gesundheit.avg_schmerz
  const schmerzColor = schmerzVal !== null ? ampelColor(schmerzVal, { good: 3, warn: 5 }, true) : GRAY
  const schmerzBg = schmerzVal !== null ? ampelBg(schmerzVal, { good: 3, warn: 5 }, true) : SUBTLE_BG
  drawKpiCard(ML + kpiW + kpiGap, y, kpiW, "Ø Schmerzlevel", fmtKpi(schmerzVal, "/10"), schmerzColor, schmerzBg)

  const stressVal = d.gesundheit.avg_stress
  const stressColor = stressVal !== null ? ampelColor(stressVal, { good: 3, warn: 5 }, true) : GRAY
  const stressBg = stressVal !== null ? ampelBg(stressVal, { good: 3, warn: 5 }, true) : SUBTLE_BG
  drawKpiCard(ML + (kpiW + kpiGap) * 2, y, kpiW, "Ø Stresslevel", fmtKpi(stressVal, "/10"), stressColor, stressBg)
  y += 36

  // Row 2
  drawKpiCard(ML, y, kpiW, "Mitarbeiter aktiv", `${d.mitglieder.aktiv} von ${d.mitglieder.total}`, INDIGO, SUBTLE_BG)

  const schlafVal = d.gesundheit.avg_schlaf
  const schlafColor = schlafVal !== null ? ampelColor(schlafVal, { good: 7, warn: 5 }) : GRAY
  const schlafBg = schlafVal !== null ? ampelBg(schlafVal, { good: 7, warn: 5 }) : SUBTLE_BG
  drawKpiCard(ML + kpiW + kpiGap, y, kpiW, "Ø Schlafqualität", fmtKpi(schlafVal, "/10"), schlafColor, schlafBg)

  const sterneVal = d.feedback.avg_sterne
  const sterneColor = sterneVal !== null ? ampelColor(sterneVal, { good: 4, warn: 3 }) : GRAY
  const sterneBg = sterneVal !== null ? ampelBg(sterneVal, { good: 4, warn: 3 }) : SUBTLE_BG
  drawKpiCard(ML + (kpiW + kpiGap) * 2, y, kpiW, "Ø Bewertung", sterneVal !== null ? `${sterneVal.toFixed(1)}/5` : "Noch keine", sterneColor, sterneBg)
  y += 36

  // Pausen-Fit Activity Bar
  sectionTitle("Pausen-Fit Aktivität")
  const pfItems = [
    { label: "Sessions", value: `${d.pausen_fit.total}` },
    { label: "Abgeschlossen", value: `${d.pausen_fit.completed}` },
    { label: "Ist-Analyse", value: `${d.mitglieder.ist_analyse_quote}%` },
    { label: "Bewertungen", value: `${d.feedback.anzahl_bewertungen}` },
  ]
  const pfItemW = CONTENT_W / pfItems.length
  setFill(SUBTLE_BG)
  doc.roundedRect(ML, y, CONTENT_W, 18, 3, 3, "F")
  pfItems.forEach((item, i) => {
    const cx = ML + pfItemW * i + pfItemW / 2
    doc.setFontSize(12)
    doc.setFont("helvetica", "bold")
    setColor(DARK)
    doc.text(item.value, cx, y + 8, { align: "center" })
    doc.setFontSize(7)
    doc.setFont("helvetica", "normal")
    setColor(GRAY)
    doc.text(item.label, cx, y + 13.5, { align: "center" })
  })
  y += 24

  // Top Beschwerden
  if (d.gesundheit.top_beschwerden?.length > 0) {
    sectionTitle("Häufigste Beschwerden")
    const beschwerden = d.gesundheit.top_beschwerden.slice(0, 5)

    for (const b of beschwerden) {
      checkPageBreak(12)
      const label = readableRegion(b.region)
      // Background bar
      setFill(SUBTLE_BG)
      doc.roundedRect(ML, y, CONTENT_W, 8, 2, 2, "F")
      // Filled bar (proportional)
      const barW = Math.max(8, (b.prozent / 100) * CONTENT_W)
      setFill(EMERALD)
      doc.roundedRect(ML, y, barW, 8, 2, 2, "F")
      // Label on bar
      doc.setFontSize(8)
      doc.setFont("helvetica", "bold")
      setColor(barW > 80 ? WHITE : DARK)
      doc.text(label, ML + 5, y + 5.5)
      // Percentage right-aligned
      doc.setFont("helvetica", "bold")
      setColor(DARK)
      doc.text(`${b.prozent}%`, RIGHT_EDGE - 2, y + 5.5, { align: "right" })
      y += 11
    }
    y += 2
  }

  // ════════════════════════════════════════════════════════════════════
  // ABTEILUNGEN + ROI + EMPFEHLUNGEN
  // ════════════════════════════════════════════════════════════════════

  // Abteilungsvergleich
  if (d.abteilungen?.length > 0) {
    sectionTitle("Abteilungsvergleich")

    checkPageBreak(12)
    setFill(DARK)
    doc.roundedRect(ML, y, CONTENT_W, 9, 2, 2, "F")
    doc.setFontSize(8)
    doc.setFont("helvetica", "bold")
    setColor(WHITE)
    doc.text("Abteilung", ML + 5, y + 6)
    doc.text("MA", ML + 90, y + 6, { align: "center" })
    doc.text("Teilnahme", ML + 120, y + 6, { align: "center" })
    doc.text("Status", ML + 150, y + 6, { align: "center" })
    y += 11

    for (let i = 0; i < d.abteilungen.length; i++) {
      const abt = d.abteilungen[i]
      checkPageBreak(10)

      if (i % 2 === 0) {
        setFill(SUBTLE_BG)
        doc.rect(ML, y, CONTENT_W, 9, "F")
      }

      doc.setFontSize(8.5)
      doc.setFont("helvetica", "normal")
      setColor(DARK)
      doc.text(abt.name || "Nicht zugewiesen", ML + 5, y + 6)
      setColor(SLATE)
      doc.text(`${abt.total}`, ML + 90, y + 6, { align: "center" })

      const tqColor = ampelColor(abt.teilnahmequote, { good: 60, warn: 30 })
      doc.setFont("helvetica", "bold")
      setColor(tqColor)
      doc.text(`${abt.teilnahmequote}%`, ML + 120, y + 6, { align: "center" })

      // Status dot
      setFill(tqColor)
      doc.circle(ML + 150, y + 4.5, 2.5, "F")

      y += 9
    }
    y += 4
  }

  // ROI
  if (d.roi?.einsparung_pro_jahr) {
    sectionTitle("ROI-Einschätzung")
    checkPageBreak(30)

    setFill(GREEN_BG)
    doc.roundedRect(ML, y, CONTENT_W, 28, 3, 3, "F")
    setFill(EMERALD)
    doc.roundedRect(ML, y, 3, 28, 1.5, 1.5, "F")

    doc.setFontSize(9)
    doc.setFont("helvetica", "normal")
    setColor(SLATE)
    doc.text("Geschätzte jährliche Einsparung durch Fehltagereduktion:", ML + 10, y + 9)

    doc.setFontSize(22)
    doc.setFont("helvetica", "bold")
    setColor(EMERALD)
    doc.text(`${d.roi.einsparung_pro_jahr.toLocaleString("de-DE")} €`, ML + 10, y + 21)

    if (d.roi.roi_prozent) {
      doc.setFontSize(12)
      doc.setFont("helvetica", "bold")
      setColor(DARK)
      doc.text(`ROI: ${d.roi.roi_prozent}%`, RIGHT_EDGE - 8, y + 21, { align: "right" })
    }
    y += 34
  }

  // ════════════════════════════════════════════════════════════════════
  // HANDLUNGSEMPFEHLUNGEN — most important section
  // ════════════════════════════════════════════════════════════════════
  sectionTitle("Handlungsempfehlungen")

  if (data.empfehlungen.length > 0) {
    // Intro text
    doc.setFontSize(9)
    doc.setFont("helvetica", "normal")
    setColor(SLATE)
    doc.text("Die folgenden Maßnahmen sind nach Priorität sortiert:", ML, y)
    y += 8

    for (let i = 0; i < data.empfehlungen.length; i++) {
      const rawEmp = data.empfehlungen[i]
      const emp = stripMarkdown(rawEmp)
      const empLines = doc.splitTextToSize(emp, CONTENT_W - 18)
      const cardH = Math.max(16, empLines.length * 4.2 + 10)

      checkPageBreak(cardH + 4)

      // Card background
      setFill(i === 0 ? GREEN_BG : SUBTLE_BG)
      doc.roundedRect(ML, y, CONTENT_W, cardH, 3, 3, "F")

      // Priority number circle
      setFill(i === 0 ? EMERALD : DARK)
      doc.circle(ML + 8, y + 8, 4.5, "F")
      doc.setFontSize(10)
      doc.setFont("helvetica", "bold")
      setColor(WHITE)
      doc.text(`${i + 1}`, ML + 8, y + 9.5, { align: "center" })

      // Priority label
      if (i === 0) {
        doc.setFontSize(6.5)
        doc.setFont("helvetica", "bold")
        setColor(EMERALD_DARK)
        doc.text("HÖCHSTE PRIORITÄT", ML + 16, y + 5.5)
      }

      // Recommendation text
      doc.setFontSize(9)
      doc.setFont("helvetica", "normal")
      setColor(DARK)
      doc.text(empLines, ML + 16, y + (i === 0 ? 11 : 7))
      y += cardH + 4
    }
  } else {
    bodyText("Keine spezifischen Empfehlungen für diesen Zeitraum.")
  }

  // ════════════════════════════════════════════════════════════════════
  // FOOTER on every page
  // ════════════════════════════════════════════════════════════════════
  const totalPages = doc.getNumberOfPages()
  for (let p = 1; p <= totalPages; p++) {
    doc.setPage(p)
    if (p === 1) continue // Cover page has no footer

    doc.setDrawColor(226, 232, 240)
    doc.setLineWidth(0.3)
    doc.line(ML, PAGE_H - 15, RIGHT_EDGE, PAGE_H - 15)

    doc.setFontSize(7)
    doc.setFont("helvetica", "normal")
    setColor(LIGHT)
    doc.text("Praxis OS  —  Betriebliche Gesundheitsförderung  —  Vertraulich", ML, PAGE_H - 10)
    doc.text(`Seite ${p} von ${totalPages}`, RIGHT_EDGE, PAGE_H - 10, { align: "right" })
    doc.text(data.firma, RIGHT_EDGE, PAGE_H - 6.5, { align: "right" })
  }

  const arrayBuffer = doc.output("arraybuffer")
  return Buffer.from(arrayBuffer)
}
