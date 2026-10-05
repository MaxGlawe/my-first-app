import { jsPDF } from "jspdf"
import type { InvoiceWithItems, PraxisSettings } from "@/types/billing"
import { generateEpcQrCode } from "./epc-qr"

// ── Farben ──
const EMERALD = { r: 16, g: 185, b: 129 }   // Brand-Akzent
const DARK    = { r: 15, g: 23, b: 42 }      // slate-900
const GRAY    = { r: 100, g: 116, b: 139 }   // slate-500
const LIGHT   = { r: 148, g: 163, b: 184 }   // slate-400
const SUBTLE  = { r: 241, g: 245, b: 249 }   // slate-100
const WHITE   = { r: 255, g: 255, b: 255 }
const BLACK   = { r: 0, g: 0, b: 0 }

// ── Layout ──
const PAGE_W = 210
const PAGE_H = 297
const ML = 25    // margin left
const MR = 20    // margin right
const CW = PAGE_W - ML - MR  // content width
const RIGHT_EDGE = PAGE_W - MR

/**
 * Generiert eine professionelle Heilpraktiker-Rechnung als PDF.
 * DIN-5008-konform, mit EPC QR-Code (GiroCode).
 */
export async function generateInvoicePdf(
  invoice: InvoiceWithItems,
  praxis: PraxisSettings
): Promise<ArrayBuffer> {
  const doc = new jsPDF({ unit: "mm", format: "a4" })
  let y = 0

  // ── Helper ──
  const setColor = (c: { r: number; g: number; b: number }) =>
    doc.setTextColor(c.r, c.g, c.b)
  const setFill = (c: { r: number; g: number; b: number }) =>
    doc.setFillColor(c.r, c.g, c.b)
  const setDraw = (c: { r: number; g: number; b: number }) =>
    doc.setDrawColor(c.r, c.g, c.b)

  // ════════════════════════════════════════════════════
  // 1. AKZENTLINIE — oben am Seitenrand
  // ════════════════════════════════════════════════════
  setFill(EMERALD)
  doc.rect(0, 0, PAGE_W, 3, "F")

  // ════════════════════════════════════════════════════
  // 2. BRIEFKOPF — rechts oben
  // ════════════════════════════════════════════════════
  y = 15

  // Praxisname
  doc.setFontSize(20)
  doc.setFont("helvetica", "bold")
  setColor(DARK)
  doc.text(praxis.praxis_name, RIGHT_EDGE, y, { align: "right" })
  y += 7

  // Inhaber + Adresse
  doc.setFontSize(9)
  doc.setFont("helvetica", "normal")
  setColor(GRAY)
  doc.text(praxis.inhaber_name, RIGHT_EDGE, y, { align: "right" })
  y += 4.5
  doc.text(praxis.strasse, RIGHT_EDGE, y, { align: "right" })
  y += 4.5
  doc.text(`${praxis.plz} ${praxis.ort}`, RIGHT_EDGE, y, { align: "right" })
  y += 4.5

  if (praxis.telefon) {
    doc.text(`Tel. ${praxis.telefon}`, RIGHT_EDGE, y, { align: "right" })
    y += 4.5
  }
  if (praxis.email) {
    doc.text(praxis.email, RIGHT_EDGE, y, { align: "right" })
  }

  // ════════════════════════════════════════════════════
  // PROJ-29: Rechnung oder Leistungsnachweis?
  // ════════════════════════════════════════════════════
  //
  // Ein Leistungsnachweis gehoert zu einer bereits bezahlten Rechnung und ist
  // nie eine Zahlungsaufforderung. Dasselbe gilt fuer jede Rechnung, die als
  // bezahlt gilt. Auf beiden haben Bankdaten, Faelligkeit und ein GiroCode
  // nichts zu suchen — ein QR-Code zum Ueberweisen auf einem beglichenen Beleg
  // ist eine Aufforderung, zweimal zu zahlen.
  const istNachweis = invoice.beleg_art === "leistungsnachweis"
  const beglichen = istNachweis || invoice.status === "bezahlt"

  // ════════════════════════════════════════════════════
  // 3. ABSENDERZEILE (über Adressfeld, DIN 5008)
  // ════════════════════════════════════════════════════
  y = 50
  doc.setFontSize(6.5)
  setColor(LIGHT)
  doc.text(
    `${praxis.praxis_name}  \u00B7  ${praxis.strasse}  \u00B7  ${praxis.plz} ${praxis.ort}`,
    ML, y
  )
  // Unterstrich
  setDraw(LIGHT)
  doc.setLineWidth(0.2)
  doc.line(ML, y + 1.5, ML + 90, y + 1.5)

  // ════════════════════════════════════════════════════
  // 4. EMPFÄNGERADRESSE
  // ════════════════════════════════════════════════════
  y = 56
  doc.setFontSize(11)
  doc.setFont("helvetica", "normal")
  setColor(BLACK)
  doc.text(invoice.patient_name, ML, y)
  y += 5.5

  if (invoice.patient_address) {
    const lines = invoice.patient_address.split("\n")
    for (const line of lines) {
      doc.text(line, ML, y)
      y += 5.5
    }
  }

  // ════════════════════════════════════════════════════
  // 5. RECHNUNGS-INFO-BLOCK (rechts, neben Adresse)
  // ════════════════════════════════════════════════════
  const infoBoxX = 128
  let infoY = 54

  // Box-Hintergrund
  setFill(SUBTLE)
  doc.roundedRect(infoBoxX, infoY - 2, RIGHT_EDGE - infoBoxX, beglichen ? 25.5 : 32, 2, 2, "F")

  doc.setFontSize(8.5)
  infoY += 3

  const infoRows: string[][] = [
    [istNachweis ? "Nachweis-Nr." : "Rechnungsnr.", invoice.invoice_number],
    [istNachweis ? "Ausstellungsdatum" : "Rechnungsdatum", fmtDate(invoice.invoice_date)],
    ["Behandlungsdatum", fmtDate(invoice.treatment_date)],
  ]

  // „Faellig bis" auf einem beglichenen Beleg liest sich wie eine Frist, die
  // noch laeuft. Auf einem Leistungsnachweis waere es schlicht falsch.
  if (!beglichen) infoRows.push(["Fällig bis", fmtDate(invoice.due_date)])

  for (const [label, value] of infoRows) {
    doc.setFont("helvetica", "normal")
    setColor(GRAY)
    doc.text(label, infoBoxX + 3, infoY)
    doc.setFont("helvetica", "bold")
    setColor(DARK)
    doc.text(value, RIGHT_EDGE - 3, infoY, { align: "right" })
    infoY += 6.5
  }

  // ════════════════════════════════════════════════════
  // 6. TITEL
  // ════════════════════════════════════════════════════
  y = 94
  doc.setFontSize(22)
  doc.setFont("helvetica", "bold")
  setColor(DARK)
  doc.text(istNachweis ? "LEISTUNGSNACHWEIS" : "RECHNUNG", ML, y)

  // Akzentlinie unter Titel
  setFill(EMERALD)
  doc.rect(ML, y + 2, istNachweis ? 72 : 40, 1, "F")
  y += 12

  // ════════════════════════════════════════════════════
  // 7. DIAGNOSE (optional)
  // ════════════════════════════════════════════════════
  if (invoice.diagnose_text) {
    doc.setFontSize(9)
    doc.setFont("helvetica", "normal")
    setColor(GRAY)
    doc.text("Diagnose:", ML, y)
    doc.setFont("helvetica", "italic")
    setColor(DARK)
    doc.text(invoice.diagnose_text, ML + 20, y)
    y += 8
  }

  // ════════════════════════════════════════════════════
  // 8. POSITIONSTABELLE
  // ════════════════════════════════════════════════════
  const colPos   = ML
  const colZif   = ML + 11
  const colDesc  = ML + 30
  const colAnz   = ML + 112
  const colEP    = ML + 126
  const colTotal = RIGHT_EDGE

  // ── Table Header ──
  setFill(DARK)
  doc.roundedRect(ML, y - 1, CW, 8, 1.5, 1.5, "F")

  doc.setFontSize(7.5)
  doc.setFont("helvetica", "bold")
  setColor(WHITE)
  const hdrY = y + 3.5
  doc.text("Pos.", colPos + 2, hdrY)
  doc.text("Geb\u00FCH", colZif, hdrY)
  doc.text("Leistungsbeschreibung", colDesc, hdrY)
  doc.text("Anz.", colAnz + 2, hdrY)
  doc.text("Einzelpreis", colEP, hdrY)
  doc.text("Betrag", colTotal - 1, hdrY, { align: "right" })

  y += 10

  // ── Table Rows ──
  const items = invoice.line_items || []
  doc.setFontSize(8.5)

  items.forEach((item, i) => {
    // Die Beschreibung entscheidet, wie hoch die Zeile wird — deshalb muss sie
    // VOR dem Seitenumbruch und vor dem Streifen umbrochen werden. Vorher war
    // der Streifen immer 7 mm hoch, und bei einer dreizeiligen Beschreibung
    // lief der Text unten aus seiner eigenen Zeile heraus in die naechste.
    // Auf einem Leistungsnachweis ist das der Normalfall, nicht die Ausnahme.
    doc.setFontSize(8.5)
    const maxDescW = colAnz - colDesc - 3
    const descLines = doc.splitTextToSize(item.beschreibung, maxDescW) as string[]
    const rowH = 7 + Math.max(0, descLines.length - 1) * 5

    // Page break check
    if (y + rowH > 248) {
      drawPageFooter(doc, praxis)
      doc.addPage()
      setFill(EMERALD)
      doc.rect(0, 0, PAGE_W, 3, "F")
      y = 20
    }

    // Zebra-Stripe
    if (i % 2 === 0) {
      setFill(SUBTLE)
      doc.rect(ML, y - 3, CW, rowH, "F")
    }

    doc.setFont("helvetica", "normal")
    setColor(DARK)
    doc.text(String(i + 1), colPos + 2, y + 0.5)

    // GebüH-Ziffer in Akzentfarbe
    doc.setFontSize(8)
    setColor(EMERALD)
    doc.setFont("helvetica", "bold")
    doc.text(item.gebueh_ziffer || "\u2014", colZif, y + 0.5)

    // Beschreibung
    doc.setFontSize(8.5)
    doc.setFont("helvetica", "normal")
    setColor(DARK)
    doc.text(descLines[0], colDesc, y + 0.5)

    // Anzahl (zentriert)
    setColor(DARK)
    doc.text(String(item.anzahl), colAnz + 6, y + 0.5, { align: "center" })

    // Einzelpreis
    doc.text(fmtCurrency(Number(item.einzelpreis)), colEP, y + 0.5)

    // Gesamtpreis (rechtsbündig, fett)
    doc.setFont("helvetica", "bold")
    doc.text(fmtCurrency(Number(item.gesamtpreis)), colTotal - 1, y + 0.5, { align: "right" })

    y += 7

    // Weitere Beschreibungszeilen — zusammen mit den 7 mm oben ergibt das
    // genau `rowH`, also die Hoehe, die der Streifen bereits abgedeckt hat.
    if (descLines.length > 1) {
      doc.setFont("helvetica", "normal")
      doc.setFontSize(8)
      setColor(GRAY)
      for (let j = 1; j < descLines.length; j++) {
        doc.text(descLines[j], colDesc, y + 0.5)
        y += 5
      }
    }
  })

  // ── Abschlusslinie ──
  setDraw(EMERALD)
  doc.setLineWidth(0.6)
  doc.line(ML, y + 1, RIGHT_EDGE, y + 1)
  y += 6

  // ════════════════════════════════════════════════════
  // 9. SUMMENBLOCK
  // ════════════════════════════════════════════════════
  const sumLabelX = colEP - 10
  const sumValueX = colTotal - 1

  // Nettobetrag
  doc.setFontSize(9)
  doc.setFont("helvetica", "normal")
  setColor(GRAY)
  doc.text("Nettobetrag", sumLabelX, y, { align: "right" })
  setColor(DARK)
  doc.text(fmtCurrency(Number(invoice.total)), sumValueX, y, { align: "right" })
  y += 5

  // USt-Hinweis
  doc.setFontSize(8)
  setColor(LIGHT)
  doc.text("MwSt. (\u00A74 Nr. 14 UStG)", sumLabelX, y, { align: "right" })
  doc.text("0,00\u00A0\u20AC", sumValueX, y, { align: "right" })
  y += 5

  // Trennlinie
  setDraw(DARK)
  doc.setLineWidth(0.4)
  doc.line(sumLabelX - 30, y - 1, RIGHT_EDGE, y - 1)

  // Gesamtbetrag (hervorgehoben)
  setFill(DARK)
  doc.roundedRect(sumLabelX - 32, y, RIGHT_EDGE - sumLabelX + 33, 9, 1.5, 1.5, "F")

  doc.setFontSize(11)
  doc.setFont("helvetica", "bold")
  setColor(WHITE)
  doc.text("Gesamtbetrag", sumLabelX - 5, y + 6, { align: "right" })
  doc.text(fmtCurrency(Number(invoice.total)), sumValueX - 1, y + 6, { align: "right" })

  y += 18

  // ════════════════════════════════════════════════════
  // 9b. VERMERKE (PROJ-29)
  // ════════════════════════════════════════════════════
  //
  // "Behandlungsfall seit ...", "Bereits beglichen durch Rechnung ...". Die
  // standen bisher in der Datenbank und auf keinem Blatt Papier.
  if (invoice.notes) {
    // Der Stripe-Anker aus der Bezahlrechnung ist Technik, kein Vermerk.
    const vermerkZeilen = invoice.notes
      .split("\n")
      .map((z) => z.trim())
      .filter((z) => z && !z.startsWith("stripe_session:"))

    if (vermerkZeilen.length > 0) {
      if (y > 235) {
        drawPageFooter(doc, praxis)
        doc.addPage()
        setFill(EMERALD)
        doc.rect(0, 0, PAGE_W, 3, "F")
        y = 20
      }
      doc.setFontSize(8)
      doc.setFont("helvetica", "normal")
      setColor(GRAY)
      for (const zeile of vermerkZeilen) {
        const umbrochen = doc.splitTextToSize(zeile, RIGHT_EDGE - ML) as string[]
        for (const teil of umbrochen) {
          doc.text(teil, ML, y)
          y += 4
        }
        y += 1.5
      }
      y += 4
    }
  }

  // ════════════════════════════════════════════════════
  // 10. ZAHLUNGSINFORMATIONEN + QR-CODE
  // ════════════════════════════════════════════════════
  if (beglichen) {
    // Kein Zahlungsteil. Stattdessen der eine Satz, um den es geht — gross
    // genug, dass ihn niemand uebersieht, der nach einer IBAN sucht.
    if (y > 240) {
      drawPageFooter(doc, praxis)
      doc.addPage()
      setFill(EMERALD)
      doc.rect(0, 0, PAGE_W, 3, "F")
      y = 20
    }

    setFill({ r: 236, g: 253, b: 245 })
    setDraw(EMERALD)
    doc.setLineWidth(0.3)
    doc.roundedRect(ML, y, RIGHT_EDGE - ML, 16, 2, 2, "FD")

    doc.setFontSize(10)
    doc.setFont("helvetica", "bold")
    setColor(EMERALD)
    doc.text("Betrag bereits beglichen", ML + 5, y + 6.5)

    doc.setFontSize(8)
    doc.setFont("helvetica", "normal")
    setColor(GRAY)
    doc.text(
      istNachweis
        ? "Dieser Nachweis dient Ihren Unterlagen und der Einreichung bei Ihrer Versicherung. Bitte nicht überweisen."
        : "Bitte nicht überweisen.",
      ML + 5,
      y + 12
    )

    y += 22
  } else {
    // Page break check
    if (y > 220) {
      drawPageFooter(doc, praxis)
      doc.addPage()
      setFill(EMERALD)
      doc.rect(0, 0, PAGE_W, 3, "F")
      y = 20
    }

    // Section-Akzent
    setFill(EMERALD)
    doc.rect(ML, y, 3, 0.8, "F")
    doc.setFontSize(10)
    doc.setFont("helvetica", "bold")
    setColor(DARK)
    doc.text("Zahlungsinformationen", ML + 6, y + 1)
    y += 8

    // Bankdaten-Box
    const bankBoxStartY = y
    const hasBic = !!praxis.bic
    const hasBank = !!praxis.bank_name
    const bankBoxH = 20 + (hasBic ? 6 : 0) + (hasBank ? 6 : 0)

    setFill(SUBTLE)
    doc.roundedRect(ML, y - 2, 100, bankBoxH, 2, 2, "F")

    doc.setFontSize(8.5)
    const bankLabelX = ML + 4
    const bankValueX = ML + 35

    doc.setFont("helvetica", "normal")
    setColor(GRAY)
    doc.text("Empf\u00E4nger", bankLabelX, y + 3)
    doc.setFont("helvetica", "bold")
    setColor(DARK)
    doc.text(praxis.praxis_name, bankValueX, y + 3)
    y += 6

    doc.setFont("helvetica", "normal")
    setColor(GRAY)
    doc.text("IBAN", bankLabelX, y + 3)
    doc.setFont("helvetica", "bold")
    setColor(DARK)
    doc.text(praxis.iban, bankValueX, y + 3)
    y += 6

    if (hasBic) {
      doc.setFont("helvetica", "normal")
      setColor(GRAY)
      doc.text("BIC", bankLabelX, y + 3)
      setColor(DARK)
      doc.text(praxis.bic!, bankValueX, y + 3)
      y += 6
    }

    if (hasBank) {
      doc.setFont("helvetica", "normal")
      setColor(GRAY)
      doc.text("Bank", bankLabelX, y + 3)
      setColor(DARK)
      doc.text(praxis.bank_name!, bankValueX, y + 3)
      y += 6
    }

    doc.setFont("helvetica", "bold")
    setColor(EMERALD)
    doc.text(`Zahlbar bis ${fmtDate(invoice.due_date)}`, bankLabelX, y + 3)

    // ── QR-Code (rechts neben Bankdaten) ──
    let qrDataUrl: string | null = null
    try {
      qrDataUrl = await generateEpcQrCode({
        bic: praxis.bic || "",
        name: praxis.praxis_name,
        iban: praxis.iban,
        amount: Number(invoice.total),
        reference: `RE ${invoice.invoice_number}`,
      })
    } catch {
      // QR-Code Generierung fehlgeschlagen
    }

    if (qrDataUrl) {
      const qrSize = 32
      const qrX = RIGHT_EDGE - qrSize - 5
      const qrY = bankBoxStartY

      // QR-Rahmen
      setDraw({ r: 226, g: 232, b: 240 })
      doc.setLineWidth(0.3)
      doc.roundedRect(qrX - 3, qrY - 3, qrSize + 6, qrSize + 14, 2, 2, "S")

      doc.addImage(qrDataUrl, "PNG", qrX, qrY, qrSize, qrSize)

      doc.setFontSize(7)
      doc.setFont("helvetica", "normal")
      setColor(GRAY)
      doc.text("GiroCode scannen", qrX + qrSize / 2, qrY + qrSize + 4, { align: "center" })
      doc.text("zum Bezahlen", qrX + qrSize / 2, qrY + qrSize + 8, { align: "center" })
    }
  }

  // ════════════════════════════════════════════════════
  // 11. HINWEISTEXT
  // ════════════════════════════════════════════════════
  y += 14
  if (y < 256) {
    doc.setFontSize(7.5)
    doc.setFont("helvetica", "normal")
    setColor(LIGHT)
    doc.text(
      istNachweis
        ? "Dieser Nachweis ist nach dem Geb\u00FChrenverzeichnis f\u00FCr Heilpraktiker (Geb\u00FCH) erstellt."
        : "Diese Rechnung ist nach dem Geb\u00FChrenverzeichnis f\u00FCr Heilpraktiker (Geb\u00FCH) erstellt.",
      ML, y
    )
    y += 3.5
    doc.text(
      "Bitte beachten Sie, dass die Erstattung durch Ihre Versicherung von Ihrem Tarif abh\u00E4ngt.",
      ML, y
    )
  }

  // ════════════════════════════════════════════════════
  // 12. FUSSZEILE
  // ════════════════════════════════════════════════════
  drawPageFooter(doc, praxis)

  return doc.output("arraybuffer")
}

// ── Fußzeile auf jeder Seite ──
function drawPageFooter(doc: jsPDF, praxis: PraxisSettings) {
  const footerY = PAGE_H - 15

  // Trennlinie
  doc.setDrawColor(226, 232, 240)
  doc.setLineWidth(0.3)
  doc.line(ML, footerY - 2, RIGHT_EDGE, footerY - 2)

  // Zeile 1: Kontakt
  doc.setFontSize(6.5)
  doc.setFont("helvetica", "normal")
  doc.setTextColor(148, 163, 184)

  const contact = [praxis.praxis_name, praxis.inhaber_name]
  if (praxis.telefon) contact.push(`Tel. ${praxis.telefon}`)
  if (praxis.email) contact.push(praxis.email)
  if (praxis.website) contact.push(praxis.website)
  doc.text(contact.join("  \u00B7  "), PAGE_W / 2, footerY, { align: "center" })

  // Zeile 2: Rechtliches
  const legal: string[] = []
  legal.push("Heilpraktiker gem. \u00A71 HeilprG")
  legal.push("Umsatzsteuerbefreit gem. \u00A74 Nr. 14 UStG")
  if (praxis.zulassungsnummer) legal.push(`Zul.-Nr. ${praxis.zulassungsnummer}`)
  if (praxis.steuernummer) legal.push(`St.-Nr. ${praxis.steuernummer}`)
  doc.text(legal.join("  \u00B7  "), PAGE_W / 2, footerY + 3.5, { align: "center" })
}

// ── Formatter ──
function fmtDate(dateStr: string): string {
  if (!dateStr) return ""
  const d = new Date(dateStr + "T00:00:00")
  return d.toLocaleDateString("de-DE", { day: "2-digit", month: "2-digit", year: "numeric" })
}

function fmtCurrency(amount: number): string {
  return amount.toLocaleString("de-DE", { style: "currency", currency: "EUR" })
}
