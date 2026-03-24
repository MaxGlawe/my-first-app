import { jsPDF } from "jspdf"
import type { BgfInvoice } from "@/types/bgf-invoice"
import { formatZeitraum } from "@/types/bgf-invoice"

// ── Colors ──
const EMERALD = { r: 16, g: 185, b: 129 }
const DARK = { r: 15, g: 23, b: 42 }
const GRAY = { r: 100, g: 116, b: 139 }
const LIGHT = { r: 148, g: 163, b: 184 }
const SUBTLE = { r: 241, g: 245, b: 249 }
const BLACK = { r: 0, g: 0, b: 0 }

// ── Layout ──
const PAGE_W = 210
const PAGE_H = 297
const ML = 25
const MR = 20
const RIGHT_EDGE = PAGE_W - MR

type Color = { r: number; g: number; b: number }

function fmtDate(dateStr: string | null | undefined): string {
  if (!dateStr) return "—"
  const d = new Date(dateStr)
  return d.toLocaleDateString("de-DE", { day: "2-digit", month: "2-digit", year: "numeric" })
}

function fmtCurrency(amount: number): string {
  return amount.toLocaleString("de-DE", { minimumFractionDigits: 2, maximumFractionDigits: 2 }) + " €"
}

export async function generateBgfInvoicePdf(invoice: BgfInvoice): Promise<Buffer> {
  const doc = new jsPDF({ unit: "mm", format: "a4" })
  let y = 0

  const setColor = (c: Color) => doc.setTextColor(c.r, c.g, c.b)
  const setFill = (c: Color) => doc.setFillColor(c.r, c.g, c.b)
  const setDraw = (c: Color) => doc.setDrawColor(c.r, c.g, c.b)

  // ════════════════════════════════════════════
  // 1. ACCENT BAR
  // ════════════════════════════════════════════
  setFill(EMERALD)
  doc.rect(0, 0, PAGE_W, 3, "F")

  // ════════════════════════════════════════════
  // 2. LETTERHEAD (right)
  // ════════════════════════════════════════════
  y = 15
  doc.setFontSize(20)
  doc.setFont("helvetica", "bold")
  setColor(DARK)
  doc.text(invoice.praxis_name, RIGHT_EDGE, y, { align: "right" })
  y += 7
  doc.setFontSize(9)
  doc.setFont("helvetica", "normal")
  setColor(GRAY)
  doc.text(invoice.praxis_inhaber, RIGHT_EDGE, y, { align: "right" })
  y += 4.5
  doc.text(invoice.praxis_address, RIGHT_EDGE, y, { align: "right" })

  // ════════════════════════════════════════════
  // 3. SENDER LINE (DIN 5008)
  // ════════════════════════════════════════════
  y = 50
  doc.setFontSize(6.5)
  setColor(LIGHT)
  doc.text(`${invoice.praxis_name}  ·  ${invoice.praxis_address}`, ML, y)
  setDraw(LIGHT)
  doc.setLineWidth(0.2)
  doc.line(ML, y + 1.5, ML + 90, y + 1.5)

  // ════════════════════════════════════════════
  // 4. RECIPIENT
  // ════════════════════════════════════════════
  y = 56
  doc.setFontSize(11)
  doc.setFont("helvetica", "bold")
  setColor(BLACK)
  doc.text(invoice.org_name, ML, y)
  y += 5.5
  doc.setFont("helvetica", "normal")
  doc.text(invoice.kontakt_name, ML, y)
  y += 5.5
  if (invoice.org_address) {
    doc.text(invoice.org_address, ML, y)
    y += 5.5
  }

  // ════════════════════════════════════════════
  // 5. INFO BOX (right)
  // ════════════════════════════════════════════
  const infoBoxX = 125
  let infoY = 54
  setFill(SUBTLE)
  doc.roundedRect(infoBoxX, infoY - 2, RIGHT_EDGE - infoBoxX, 30, 2, 2, "F")

  doc.setFontSize(8.5)
  infoY += 3

  const infoRows = [
    ["Rechnungsnr.", invoice.invoice_number],
    ["Datum", fmtDate(invoice.invoice_date)],
    ["Zeitraum", formatZeitraum(invoice.zeitraum_monat, invoice.zeitraum_jahr)],
    ["Fällig bis", fmtDate(invoice.due_date)],
  ]

  for (const [label, value] of infoRows) {
    doc.setFont("helvetica", "normal")
    setColor(GRAY)
    doc.text(label, infoBoxX + 3, infoY)
    doc.setFont("helvetica", "bold")
    setColor(DARK)
    doc.text(value, RIGHT_EDGE - 3, infoY, { align: "right" })
    infoY += 5.5
  }

  // ════════════════════════════════════════════
  // 6. TITLE
  // ════════════════════════════════════════════
  y = 95
  doc.setFontSize(18)
  doc.setFont("helvetica", "bold")
  setColor(DARK)
  doc.text("RECHNUNG", ML, y)
  y += 3
  setFill(EMERALD)
  doc.rect(ML, y, 30, 1, "F")
  y += 10

  // Intro text
  doc.setFontSize(9)
  doc.setFont("helvetica", "normal")
  setColor(DARK)
  doc.text(
    `Sehr geehrte/r ${invoice.kontakt_name}, für den Leistungszeitraum ${formatZeitraum(invoice.zeitraum_monat, invoice.zeitraum_jahr)} stellen wir Ihnen folgende Leistungen in Rechnung:`,
    ML, y, { maxWidth: RIGHT_EDGE - ML }
  )
  y += 14

  // ════════════════════════════════════════════
  // 7. LINE ITEMS TABLE
  // ════════════════════════════════════════════
  const colPos = ML
  const colLeistung = ML + 8
  const colAnzahl = 115
  const colEinzel = 145
  const colGesamt = RIGHT_EDGE

  // Table header
  setFill(SUBTLE)
  doc.rect(ML, y - 1, RIGHT_EDGE - ML, 8, "F")
  doc.setFontSize(8)
  doc.setFont("helvetica", "bold")
  setColor(GRAY)
  doc.text("Pos", colPos, y + 4)
  doc.text("Leistung", colLeistung, y + 4)
  doc.text("Anzahl", colAnzahl, y + 4, { align: "right" })
  doc.text("Einzelpreis", colEinzel, y + 4, { align: "right" })
  doc.text("Gesamt", colGesamt, y + 4, { align: "right" })
  y += 10

  // Line separator
  setDraw(LIGHT)
  doc.setLineWidth(0.2)

  // Row 1: BGF licenses
  doc.setFont("helvetica", "normal")
  setColor(DARK)
  doc.setFontSize(9)
  doc.text("1", colPos, y)
  doc.text(`BGF-Lizenz — ${formatZeitraum(invoice.zeitraum_monat, invoice.zeitraum_jahr)}`, colLeistung, y)
  doc.text(`${invoice.lizenzen} MA`, colAnzahl, y, { align: "right" })
  doc.text(fmtCurrency(invoice.preis_pro_ma), colEinzel, y, { align: "right" })
  doc.setFont("helvetica", "bold")
  doc.text(fmtCurrency(invoice.gesamtbetrag), colGesamt, y, { align: "right" })
  y += 7

  let posCounter = 2
  let totalWithFees = invoice.gesamtbetrag

  // Mahngebühr 1 (if applicable)
  if (invoice.mahngebuehr_1 > 0) {
    doc.setFont("helvetica", "normal")
    setColor(DARK)
    doc.text(`${posCounter}`, colPos, y)
    doc.text("Mahngebühr (1. Mahnung)", colLeistung, y)
    doc.setFont("helvetica", "bold")
    doc.text(fmtCurrency(invoice.mahngebuehr_1), colGesamt, y, { align: "right" })
    totalWithFees += invoice.mahngebuehr_1
    posCounter++
    y += 7
  }

  // Mahngebühr 2 (if applicable)
  if (invoice.mahngebuehr_2 > 0) {
    doc.setFont("helvetica", "normal")
    setColor(DARK)
    doc.text(`${posCounter}`, colPos, y)
    doc.text("Mahngebühr (2. Mahnung)", colLeistung, y)
    doc.setFont("helvetica", "bold")
    doc.text(fmtCurrency(invoice.mahngebuehr_2), colGesamt, y, { align: "right" })
    totalWithFees += invoice.mahngebuehr_2
    y += 7
  }

  // Separator line
  y += 2
  doc.line(ML, y, RIGHT_EDGE, y)
  y += 6

  // Totals with 19% USt
  const nettobetrag = totalWithFees
  const ustBetrag = Math.round(nettobetrag * 0.19 * 100) / 100
  const bruttobetrag = Math.round((nettobetrag + ustBetrag) * 100) / 100

  doc.setFontSize(9)
  doc.setFont("helvetica", "normal")
  setColor(GRAY)
  doc.text("Nettobetrag", colEinzel, y, { align: "right" })
  doc.setFont("helvetica", "bold")
  setColor(DARK)
  doc.text(fmtCurrency(nettobetrag), colGesamt, y, { align: "right" })
  y += 6

  doc.setFont("helvetica", "normal")
  setColor(GRAY)
  doc.text("zzgl. 19% USt.", colEinzel, y, { align: "right" })
  setColor(DARK)
  doc.text(fmtCurrency(ustBetrag), colGesamt, y, { align: "right" })
  y += 8

  // Total line — wider bar starting from ML
  setFill(EMERALD)
  doc.rect(ML, y - 2, RIGHT_EDGE - ML, 10, "F")
  doc.setFontSize(11)
  doc.setFont("helvetica", "bold")
  doc.setTextColor(255, 255, 255)
  doc.text("Gesamtbetrag (brutto)", ML + 5, y + 4)
  doc.text(fmtCurrency(bruttobetrag), colGesamt, y + 4, { align: "right" })
  y += 18

  // ════════════════════════════════════════════
  // 8. PAYMENT TERMS
  // ════════════════════════════════════════════
  setColor(DARK)
  doc.setFontSize(9)
  doc.setFont("helvetica", "normal")
  doc.text(
    `Bitte überweisen Sie den Gesamtbetrag von ${fmtCurrency(bruttobetrag)} bis zum ${fmtDate(invoice.due_date)} auf folgendes Konto:`,
    ML, y, { maxWidth: RIGHT_EDGE - ML }
  )
  y += 12

  // Bank details box
  setFill(SUBTLE)
  doc.roundedRect(ML, y - 2, RIGHT_EDGE - ML, 28, 2, 2, "F")

  doc.setFontSize(8.5)
  const bankY = y + 3
  const bankCol1 = ML + 5
  const bankCol2 = ML + 40

  doc.setFont("helvetica", "bold")
  setColor(DARK)
  doc.text("Bankverbindung", bankCol1, bankY)
  y = bankY + 7

  const bankRows = [
    ["Empfänger", invoice.praxis_inhaber],
    ["IBAN", invoice.praxis_iban || "—"],
    ["BIC", invoice.praxis_bic || "—"],
    ["Bank", invoice.praxis_bank_name || "—"],
  ].filter(([, v]) => v !== "—")

  for (const [label, value] of bankRows) {
    doc.setFont("helvetica", "normal")
    setColor(GRAY)
    doc.text(label, bankCol1, y)
    doc.setFont("helvetica", "bold")
    setColor(DARK)
    doc.text(value, bankCol2, y)
    y += 5
  }

  y += 8

  // Verwendungszweck
  doc.setFontSize(8)
  doc.setFont("helvetica", "normal")
  setColor(GRAY)
  doc.text(`Verwendungszweck: ${invoice.invoice_number}`, ML, y)
  y += 10

  // Thank you
  doc.setFontSize(9)
  setColor(DARK)
  doc.text("Vielen Dank für Ihr Vertrauen in unsere Leistungen.", ML, y)
  y += 5
  doc.text("Mit freundlichen Grüßen", ML, y)
  y += 8
  doc.setFont("helvetica", "bold")
  doc.text(invoice.praxis_inhaber, ML, y)
  doc.setFont("helvetica", "normal")
  y += 4
  doc.text(invoice.praxis_name, ML, y)

  // ════════════════════════════════════════════
  // 9. FOOTER
  // ════════════════════════════════════════════
  const footerY = PAGE_H - 12
  setDraw(LIGHT)
  doc.setLineWidth(0.2)
  doc.line(ML, footerY - 2, RIGHT_EDGE, footerY - 2)
  doc.setFontSize(6.5)
  doc.setFont("helvetica", "normal")
  setColor(LIGHT)
  doc.text(
    `${invoice.praxis_name}  ·  ${invoice.praxis_inhaber}  ·  ${invoice.praxis_address}`,
    PAGE_W / 2, footerY, { align: "center" }
  )
  const legalLine = [
    "Betriebliche Gesundheitsförderung",
    invoice.praxis_steuernr ? `St.-Nr. ${invoice.praxis_steuernr}` : null,
  ].filter(Boolean).join("  ·  ")
  doc.text(legalLine, PAGE_W / 2, footerY + 3.5, { align: "center" })

  return Buffer.from(doc.output("arraybuffer"))
}
