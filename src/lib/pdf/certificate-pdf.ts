import { jsPDF } from "jspdf"

// ── Course-color → accent RGB ──
const ACCENT: Record<string, { r: number; g: number; b: number }> = {
  cyan:    { r: 8,  g: 145, b: 178 },
  emerald: { r: 16, g: 185, b: 129 },
  rose:    { r: 225, g: 29, b: 72 },
  indigo:  { r: 79, g: 70, b: 229 },
}

const DARK  = { r: 15, g: 23, b: 42 }    // slate-900
const GRAY  = { r: 100, g: 116, b: 139 } // slate-500
const LIGHT = { r: 148, g: 163, b: 184 } // slate-400

// ── Layout (landscape A4) ──
const PAGE_W = 297
const PAGE_H = 210
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
 * Builds an A4-landscape course-completion certificate and triggers a download.
 * Runs client-side (jsPDF works in the browser).
 */
export function downloadCertificatePdf(data: CertificateData): void {
  const accent = ACCENT[data.color] ?? ACCENT.emerald
  const doc = new jsPDF({ unit: "mm", format: "a4", orientation: "landscape" })

  const setColor = (c: { r: number; g: number; b: number }) =>
    doc.setTextColor(c.r, c.g, c.b)
  const setDraw = (c: { r: number; g: number; b: number }) =>
    doc.setDrawColor(c.r, c.g, c.b)
  const setFill = (c: { r: number; g: number; b: number }) =>
    doc.setFillColor(c.r, c.g, c.b)

  const completedDate = (
    data.completedAt ? new Date(data.completedAt) : new Date()
  ).toLocaleDateString("de-DE", { day: "numeric", month: "long", year: "numeric" })

  // ── Outer decorative double border ──
  setDraw(accent)
  doc.setLineWidth(1.2)
  doc.rect(10, 10, PAGE_W - 20, PAGE_H - 20)
  setDraw(LIGHT)
  doc.setLineWidth(0.3)
  doc.rect(13, 13, PAGE_W - 26, PAGE_H - 26)

  // ── Top accent bar ──
  setFill(accent)
  doc.rect(13, 13, PAGE_W - 26, 4, "F")

  // ── Header: Akademie ──
  doc.setFont("helvetica", "bold")
  doc.setFontSize(11)
  setColor(accent)
  doc.text("PRAXIS OS AKADEMIE", CX, 34, { align: "center", charSpace: 1.5 })

  // ── Title ──
  doc.setFont("helvetica", "bold")
  doc.setFontSize(40)
  setColor(DARK)
  doc.text("ZERTIFIKAT", CX, 54, { align: "center", charSpace: 2 })

  doc.setFont("helvetica", "normal")
  doc.setFontSize(11)
  setColor(GRAY)
  doc.text("der erfolgreichen Kursteilnahme", CX, 63, { align: "center" })

  // ── Recipient ──
  doc.setFontSize(11)
  setColor(GRAY)
  doc.text("Hiermit wird bestätigt, dass", CX, 82, { align: "center" })

  doc.setFont("helvetica", "bold")
  doc.setFontSize(28)
  setColor(DARK)
  doc.text(data.patientName || "Teilnehmer:in", CX, 96, { align: "center" })

  // underline under the name
  const nameWidth = Math.min(
    doc.getTextWidth(data.patientName || "Teilnehmer:in") + 20,
    180
  )
  setDraw(accent)
  doc.setLineWidth(0.5)
  doc.line(CX - nameWidth / 2, 100, CX + nameWidth / 2, 100)

  // ── Course ──
  doc.setFont("helvetica", "normal")
  doc.setFontSize(11)
  setColor(GRAY)
  doc.text("den 21-Tage-Kurs erfolgreich abgeschlossen hat:", CX, 112, {
    align: "center",
  })

  doc.setFont("helvetica", "bold")
  doc.setFontSize(19)
  setColor(accent)
  doc.text(data.courseName, CX, 124, { align: "center" })

  if (data.courseSubtitle) {
    doc.setFont("helvetica", "italic")
    doc.setFontSize(9.5)
    setColor(GRAY)
    const subLines = doc.splitTextToSize(data.courseSubtitle, 200)
    doc.text(subLines[0], CX, 131, { align: "center" })
  }

  // ── Stats row ──
  const statsY = 146
  doc.setFont("helvetica", "bold")
  doc.setFontSize(15)
  setColor(DARK)
  doc.text(`${data.totalModules}`, CX - 35, statsY, { align: "center" })
  doc.text("100 %", CX + 35, statsY, { align: "center" })

  doc.setFont("helvetica", "normal")
  doc.setFontSize(8)
  setColor(LIGHT)
  doc.text("MODULE", CX - 35, statsY + 5, { align: "center", charSpace: 0.5 })
  doc.text("ABGESCHLOSSEN", CX + 35, statsY + 5, { align: "center", charSpace: 0.5 })

  // divider between stats
  setDraw(LIGHT)
  doc.setLineWidth(0.3)
  doc.line(CX, statsY - 6, CX, statsY + 2)

  // ── Footer: date + signature ──
  const footY = 178
  setDraw(LIGHT)
  doc.setLineWidth(0.3)
  doc.line(45, footY, 110, footY)
  doc.line(PAGE_W - 110, footY, PAGE_W - 45, footY)

  doc.setFont("helvetica", "normal")
  doc.setFontSize(9)
  setColor(DARK)
  doc.text(completedDate, 77.5, footY + 5, { align: "center" })
  doc.text("Praxis OS", PAGE_W - 77.5, footY + 5, { align: "center" })

  doc.setFontSize(7.5)
  setColor(LIGHT)
  doc.text("Datum", 77.5, footY + 10, { align: "center" })
  doc.text("Digitale Gesundheitsplattform", PAGE_W - 77.5, footY + 10, {
    align: "center",
  })

  // ── Certificate number ──
  doc.setFontSize(7)
  setColor(LIGHT)
  doc.text(
    `Zertifikat-Nr. ${data.certificateId.slice(0, 8).toUpperCase()}`,
    CX,
    PAGE_H - 18,
    { align: "center" }
  )

  const safeName = (data.courseName || "Kurs")
    .replace(/[^a-zA-Z0-9äöüÄÖÜß]+/g, "-")
    .replace(/^-+|-+$/g, "")
  doc.save(`Zertifikat-${safeName}.pdf`)
}
