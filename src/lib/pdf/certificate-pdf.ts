import { jsPDF } from "jspdf"

// ── Color palette ────────────────────────────────────────────────────────────

const ACCENT: Record<string, { r: number; g: number; b: number }> = {
  cyan:    { r: 8,   g: 145, b: 178 },
  emerald: { r: 16,  g: 185, b: 129 },
  rose:    { r: 225, g: 29,  b: 72 },
  indigo:  { r: 79,  g: 70,  b: 229 },
}

const DARK   = { r: 15,  g: 23,  b: 42 }  // slate-900
const TEXT   = { r: 51,  g: 65,  b: 85 }  // slate-700
const GRAY   = { r: 100, g: 116, b: 139 } // slate-500
const LIGHT  = { r: 148, g: 163, b: 184 } // slate-400
const FAINT  = { r: 226, g: 232, b: 240 } // slate-200

// ── A4 Portrait layout ───────────────────────────────────────────────────────

const PAGE_W = 210
const PAGE_H = 297
const CX = PAGE_W / 2

export interface CertificateData {
  patientName: string
  courseName: string
  courseSubtitle?: string | null
  totalModules: number
  completedAt?: string | null
  /** enrollment id — serves as the certificate number */
  certificateId: string
  color: string
}

/**
 * jsPDF-Bug-Workaround: bei `align: "center"` + `charSpace` rechnet jsPDF
 * die Text-Width OHNE charSpace, daher landet der Text links-versetzt.
 * Diese Helper berechnet die korrekte Breite und positioniert manuell.
 */
function drawCenteredText(
  doc: jsPDF,
  text: string,
  centerX: number,
  y: number,
  charSpace: number
): void {
  const baseWidth = doc.getTextWidth(text)
  const trueWidth = baseWidth + Math.max(0, text.length - 1) * charSpace
  doc.text(text, centerX - trueWidth / 2, y, { charSpace })
}

/**
 * Premium A4-portrait completion certificate. Serif typography for title +
 * recipient name (Times), Helvetica for everything else. Corner ornaments
 * instead of a heavy outer frame; subtle accent linework throughout.
 *
 * Runs client-side via jsPDF — fonts and colors are baked in, no external
 * resources needed.
 */
export function downloadCertificatePdf(data: CertificateData): void {
  const accent = ACCENT[data.color] ?? ACCENT.emerald
  const doc = new jsPDF({ unit: "mm", format: "a4", orientation: "portrait" })

  const setColor = (c: { r: number; g: number; b: number }) =>
    doc.setTextColor(c.r, c.g, c.b)
  const setDraw = (c: { r: number; g: number; b: number }) =>
    doc.setDrawColor(c.r, c.g, c.b)
  const setFill = (c: { r: number; g: number; b: number }) =>
    doc.setFillColor(c.r, c.g, c.b)

  const completedDate = (
    data.completedAt ? new Date(data.completedAt) : new Date()
  ).toLocaleDateString("de-DE", { day: "numeric", month: "long", year: "numeric" })

  // ── Outer Frame ────────────────────────────────────────────────────────────
  // Zwei dezente Rahmen: feiner Außenrahmen + minimal innen versetzter Linie.
  setDraw(FAINT)
  doc.setLineWidth(0.5)
  doc.rect(10, 10, PAGE_W - 20, PAGE_H - 20)

  setDraw(accent)
  doc.setLineWidth(0.25)
  doc.rect(13, 13, PAGE_W - 26, PAGE_H - 26)

  // ── Corner ornaments ───────────────────────────────────────────────────────
  const orn = 12
  setDraw(accent)
  doc.setLineWidth(0.8)
  // Top-left
  doc.line(15, 19, 15 + orn, 19)
  doc.line(19, 15, 19, 15 + orn)
  // Top-right
  doc.line(PAGE_W - 15 - orn, 19, PAGE_W - 15, 19)
  doc.line(PAGE_W - 19, 15, PAGE_W - 19, 15 + orn)
  // Bottom-left
  doc.line(15, PAGE_H - 19, 15 + orn, PAGE_H - 19)
  doc.line(19, PAGE_H - 19, 19, PAGE_H - 15)
  // Bottom-right
  doc.line(PAGE_W - 15 - orn, PAGE_H - 19, PAGE_W - 15, PAGE_H - 19)
  doc.line(PAGE_W - 19, PAGE_H - 19, PAGE_W - 19, PAGE_H - 15)

  // ── Header: Brand mark ────────────────────────────────────────────────────
  doc.setFont("helvetica", "bold")
  doc.setFontSize(9.5)
  setColor(accent)
  drawCenteredText(doc, "PRAXIS  OS   ·   AKADEMIE", CX, 36, 2)

  // Decorative line under header
  setDraw(accent)
  doc.setLineWidth(0.4)
  doc.line(CX - 22, 41, CX + 22, 41)

  // ── Title: TEILNAHMEZERTIFIKAT (Serif) ─────────────────────────────────────
  doc.setFont("times", "bold")
  doc.setFontSize(44)
  setColor(DARK)
  doc.text("Teilnahmezertifikat", CX, 78, { align: "center" })

  doc.setFont("helvetica", "normal")
  doc.setFontSize(9)
  setColor(GRAY)
  drawCenteredText(doc, "DER ERFOLGREICHEN TEILNAHME", CX, 88, 2)

  // ── Recipient intro ────────────────────────────────────────────────────────
  doc.setFont("helvetica", "normal")
  doc.setFontSize(11)
  setColor(GRAY)
  doc.text("Verliehen an", CX, 118, { align: "center" })

  // ── Patient Name (Times Bold, big) ────────────────────────────────────────
  const recipient = data.patientName || "Teilnehmer:in"
  doc.setFont("times", "bold")
  doc.setFontSize(34)
  setColor(DARK)
  doc.text(recipient, CX, 138, { align: "center" })

  // Underline under name — accent
  const nameWidth = Math.min(doc.getTextWidth(recipient) + 24, 160)
  setDraw(accent)
  doc.setLineWidth(0.7)
  doc.line(CX - nameWidth / 2, 144, CX + nameWidth / 2, 144)

  // Small decorative diamond on the underline center
  setFill(accent)
  const dx = CX
  const dy = 144
  doc.triangle(dx, dy - 1.4, dx - 1.2, dy, dx, dy + 1.4, "F")
  doc.triangle(dx, dy - 1.4, dx + 1.2, dy, dx, dy + 1.4, "F")

  // ── Course attribution ─────────────────────────────────────────────────────
  doc.setFont("helvetica", "normal")
  doc.setFontSize(11)
  setColor(TEXT)
  doc.text(
    "für den erfolgreichen Abschluss der 21-Tage-Challenge",
    CX,
    160,
    { align: "center" }
  )

  // Course name — Serif italic, accent
  doc.setFont("times", "bolditalic")
  doc.setFontSize(26)
  setColor(accent)
  const courseLines = doc.splitTextToSize(data.courseName, 170)
  doc.text(courseLines[0], CX, 178, { align: "center" })

  // Course subtitle
  if (data.courseSubtitle) {
    doc.setFont("times", "italic")
    doc.setFontSize(11)
    setColor(GRAY)
    const subLines = doc.splitTextToSize(data.courseSubtitle, 160)
    doc.text(subLines[0], CX, 188, { align: "center" })
  }

  // ── Stats row ──────────────────────────────────────────────────────────────
  const statsY = 220

  doc.setFont("helvetica", "bold")
  doc.setFontSize(20)
  setColor(DARK)
  doc.text(`${data.totalModules}`, CX - 45, statsY, { align: "center" })
  doc.text("21", CX, statsY, { align: "center" })
  doc.text("100 %", CX + 45, statsY, { align: "center" })

  doc.setFont("helvetica", "normal")
  doc.setFontSize(7.5)
  setColor(LIGHT)
  drawCenteredText(doc, "MODULE", CX - 45, statsY + 6, 1.2)
  drawCenteredText(doc, "TAGE", CX, statsY + 6, 1.2)
  drawCenteredText(doc, "ABGESCHLOSSEN", CX + 45, statsY + 6, 1.2)

  // Dividers between stats
  setDraw(FAINT)
  doc.setLineWidth(0.3)
  doc.line(CX - 22, statsY - 5, CX - 22, statsY + 3)
  doc.line(CX + 22, statsY - 5, CX + 22, statsY + 3)

  // ── Footer: date + signature ──────────────────────────────────────────────
  const footY = 258
  setDraw(LIGHT)
  doc.setLineWidth(0.3)
  doc.line(35, footY, 90, footY)
  doc.line(PAGE_W - 90, footY, PAGE_W - 35, footY)

  doc.setFont("helvetica", "normal")
  doc.setFontSize(10)
  setColor(DARK)
  doc.text(completedDate, 62.5, footY + 5, { align: "center" })
  doc.text("Praxis  OS", PAGE_W - 62.5, footY + 5, { align: "center" })

  doc.setFontSize(7)
  setColor(LIGHT)
  drawCenteredText(doc, "AUSSTELLUNGSDATUM", 62.5, footY + 10, 0.8)
  drawCenteredText(doc, "DIGITALE GESUNDHEITSPLATTFORM", PAGE_W - 62.5, footY + 10, 0.5)

  // ── Certificate number ────────────────────────────────────────────────────
  doc.setFontSize(7)
  setColor(LIGHT)
  drawCenteredText(
    doc,
    `Zertifikat-Nr.   ${data.certificateId.slice(0, 8).toUpperCase()}`,
    CX,
    PAGE_H - 22,
    0.5
  )

  // ── Save ──────────────────────────────────────────────────────────────────
  const safeName = (data.courseName || "Challenge")
    .replace(/[^a-zA-Z0-9äöüÄÖÜß]+/g, "-")
    .replace(/^-+|-+$/g, "")
  doc.save(`Teilnahmezertifikat-${safeName}.pdf`)
}
