import { jsPDF } from "jspdf"
import type { TreatmentContract } from "@/types/contract"
import type { PraxisSettings } from "@/types/billing"

// ── Farben ──
const EMERALD = { r: 16, g: 185, b: 129 }
const DARK = { r: 15, g: 23, b: 42 }
const GRAY = { r: 100, g: 116, b: 139 }
const LIGHT = { r: 148, g: 163, b: 184 }
const SUBTLE = { r: 241, g: 245, b: 249 }
const WHITE = { r: 255, g: 255, b: 255 }
const BLACK = { r: 0, g: 0, b: 0 }

// ── Layout ──
const PAGE_W = 210
const PAGE_H = 297
const ML = 25
const MR = 20
const CW = PAGE_W - ML - MR
const RIGHT_EDGE = PAGE_W - MR

type Color = { r: number; g: number; b: number }

export async function generateContractPdf(
  contract: TreatmentContract,
  praxis: PraxisSettings,
  options?: { includeSignature?: boolean }
): Promise<ArrayBuffer> {
  const doc = new jsPDF({ unit: "mm", format: "a4" })
  let y = 0

  const setColor = (c: Color) => doc.setTextColor(c.r, c.g, c.b)
  const setFill = (c: Color) => doc.setFillColor(c.r, c.g, c.b)
  const setDraw = (c: Color) => doc.setDrawColor(c.r, c.g, c.b)

  function checkPageBreak(neededSpace: number) {
    if (y + neededSpace > PAGE_H - 25) {
      drawFooter(doc, praxis)
      doc.addPage()
      setFill(EMERALD)
      doc.rect(0, 0, PAGE_W, 3, "F")
      y = 20
    }
  }

  // ════════════════════════════════════════════
  // 1. AKZENTLINIE
  // ════════════════════════════════════════════
  setFill(EMERALD)
  doc.rect(0, 0, PAGE_W, 3, "F")

  // ════════════════════════════════════════════
  // 2. BRIEFKOPF
  // ════════════════════════════════════════════
  y = 15
  doc.setFontSize(20)
  doc.setFont("helvetica", "bold")
  setColor(DARK)
  doc.text(praxis.praxis_name, RIGHT_EDGE, y, { align: "right" })
  y += 7

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

  // ════════════════════════════════════════════
  // 3. ABSENDERZEILE (DIN 5008)
  // ════════════════════════════════════════════
  y = 50
  doc.setFontSize(6.5)
  setColor(LIGHT)
  doc.text(
    `${praxis.praxis_name}  \u00B7  ${praxis.strasse}  \u00B7  ${praxis.plz} ${praxis.ort}`,
    ML, y
  )
  setDraw(LIGHT)
  doc.setLineWidth(0.2)
  doc.line(ML, y + 1.5, ML + 90, y + 1.5)

  // ════════════════════════════════════════════
  // 4. EMPFÄNGER
  // ════════════════════════════════════════════
  y = 56
  doc.setFontSize(11)
  doc.setFont("helvetica", "normal")
  setColor(BLACK)
  doc.text(contract.patient_name, ML, y)
  y += 5.5
  if (contract.patient_address) {
    for (const line of contract.patient_address.split("\n")) {
      doc.text(line, ML, y)
      y += 5.5
    }
  }

  // ════════════════════════════════════════════
  // 5. VERTRAGS-INFO-BLOCK
  // ════════════════════════════════════════════
  const infoBoxX = 128
  let infoY = 54
  setFill(SUBTLE)
  doc.roundedRect(infoBoxX, infoY - 2, RIGHT_EDGE - infoBoxX, 26, 2, 2, "F")

  doc.setFontSize(8.5)
  infoY += 3

  const infoRows = [
    ["Vertragsnr.", contract.contract_number],
    ["Datum", fmtDate(contract.created_at)],
    ["Status", contract.status === "unterschrieben" ? "Unterzeichnet" : "Entwurf"],
  ]

  for (const [label, value] of infoRows) {
    doc.setFont("helvetica", "normal")
    setColor(GRAY)
    doc.text(label, infoBoxX + 3, infoY)
    doc.setFont("helvetica", "bold")
    setColor(DARK)
    doc.text(value, RIGHT_EDGE - 3, infoY, { align: "right" })
    infoY += 6.5
  }

  // ════════════════════════════════════════════
  // 6. TITEL
  // ════════════════════════════════════════════
  y = 90
  doc.setFontSize(22)
  doc.setFont("helvetica", "bold")
  setColor(DARK)
  doc.text("BEHANDLUNGSVERTRAG", ML, y)
  setFill(EMERALD)
  doc.rect(ML, y + 2, 60, 1, "F")
  y += 14

  // ════════════════════════════════════════════
  // 7. VERTRAGSTEXT (alle Klauseln)
  // ════════════════════════════════════════════
  const sections = [
    contract.vertrag_text.vertragsparteien,
    contract.vertrag_text.praeambel,
    contract.vertrag_text.leistungsbeschreibung,
    contract.vertrag_text.app_nutzung,
    contract.vertrag_text.rechtsgrundlage,
    contract.vertrag_text.fernbehandlung,
    contract.vertrag_text.verguetung,
    contract.vertrag_text.terminregelung,
    contract.vertrag_text.mitwirkungspflichten,
    contract.vertrag_text.schweigepflicht,
    contract.vertrag_text.haftungsausschluss,
    contract.vertrag_text.datenschutz,
    contract.vertrag_text.widerrufsrecht,
    contract.vertrag_text.kuendigung,
    contract.vertrag_text.urheberrecht,
    contract.vertrag_text.schlussbestimmungen,
  ].filter(Boolean)

  for (const section of sections) {
    const lines = section.split("\n")
    for (const line of lines) {
      checkPageBreak(6)

      if (line.startsWith("§") || line === "Präambel") {
        // Section header
        y += 3
        doc.setFontSize(11)
        doc.setFont("helvetica", "bold")
        setColor(DARK)
        doc.text(line, ML, y)
        y += 6
      } else if (line.startsWith("Widerrufsrecht") || line.startsWith("Vorzeitiger Beginn") || line.startsWith("Folgen des Widerrufs") || line.startsWith("Rückzahlung bei Widerruf") || line.startsWith("Zusammenfassung der Kostenfolge") || line.startsWith("Muster-Widerrufsformular")) {
        // Sub-headers in Widerrufsbelehrung
        y += 2
        doc.setFontSize(9)
        doc.setFont("helvetica", "bold")
        setColor(DARK)
        doc.text(line, ML, y)
        y += 5
      } else if (line.startsWith("Zwischen") || line.startsWith("und") || line.startsWith("wird folgender") || line.startsWith("— gemeinsam")) {
        doc.setFontSize(9)
        doc.setFont("helvetica", "bold")
        setColor(DARK)
        doc.text(line, ML, y)
        y += 5
      } else if (/^[a-f]\)/.test(line)) {
        // Sub-items like a), b), c)
        doc.setFontSize(8.5)
        doc.setFont("helvetica", "normal")
        setColor(DARK)
        const wrapped = doc.splitTextToSize(line, CW - 6)
        for (const wl of wrapped) {
          checkPageBreak(5)
          doc.text(wl, ML + 6, y)
          y += 4.5
        }
      } else if (line.startsWith("- ")) {
        doc.setFontSize(8.5)
        doc.setFont("helvetica", "normal")
        setColor(DARK)
        const bulletText = line.substring(2)
        const wrapped = doc.splitTextToSize(bulletText, CW - 8)
        for (const wl of wrapped) {
          checkPageBreak(5)
          doc.text("\u2022", ML + 2, y)
          doc.text(wl, ML + 8, y)
          y += 4.5
        }
      } else if (line.trim() === "") {
        y += 2
      } else {
        doc.setFontSize(8.5)
        doc.setFont("helvetica", "normal")
        setColor(DARK)
        const wrapped = doc.splitTextToSize(line, CW)
        for (const wl of wrapped) {
          checkPageBreak(5)
          doc.text(wl, ML, y)
          y += 4.5
        }
      }
    }
    y += 3
  }

  // ════════════════════════════════════════════
  // 8. SIGNATUR-BEREICH
  // ════════════════════════════════════════════
  checkPageBreak(50)
  y += 8

  setDraw(LIGHT)
  doc.setLineWidth(0.3)
  doc.line(ML, y, ML + 60, y)
  doc.line(ML + 80, y, ML + 140, y)

  y += 4
  doc.setFontSize(8)
  doc.setFont("helvetica", "normal")
  setColor(GRAY)
  doc.text("Ort, Datum", ML, y)
  doc.text("Ort, Datum", ML + 80, y)

  y += 8
  doc.setFontSize(9)
  doc.setFont("helvetica", "bold")
  setColor(DARK)

  // Praxis/Behandler signature (always included if available)
  if (contract.praxis_signature_png) {
    try {
      doc.addImage(contract.praxis_signature_png, "PNG", ML, y - 18, 55, 20)
    } catch {
      // Praxis signature image failed to load
    }
  }
  doc.text(praxis.inhaber_name, ML, y)
  doc.text("(Behandler)", ML, y + 4)

  // Patient signature
  if (options?.includeSignature && contract.signature_png) {
    try {
      doc.addImage(contract.signature_png, "PNG", ML + 80, y - 18, 55, 20)
    } catch {
      // Signature image failed to load
    }
  }

  doc.text(contract.patient_name, ML + 80, y)
  doc.text("(Patient)", ML + 80, y + 4)

  if (options?.includeSignature && contract.signed_at) {
    y += 10
    doc.setFontSize(7)
    doc.setFont("helvetica", "normal")
    setColor(LIGHT)
    doc.text(
      `Elektronisch unterzeichnet am ${fmtDateTime(contract.signed_at)}`,
      ML + 80, y
    )
    if (contract.signer_ip) {
      doc.text(`IP: ${contract.signer_ip}`, ML + 80, y + 3.5)
    }
  }

  // ════════════════════════════════════════════
  // 9. FUSSZEILE
  // ════════════════════════════════════════════
  drawFooter(doc, praxis)

  return doc.output("arraybuffer")
}

function drawFooter(doc: jsPDF, praxis: PraxisSettings) {
  const footerY = PAGE_H - 15

  doc.setDrawColor(226, 232, 240)
  doc.setLineWidth(0.3)
  doc.line(ML, footerY - 2, RIGHT_EDGE, footerY - 2)

  doc.setFontSize(6.5)
  doc.setFont("helvetica", "normal")
  doc.setTextColor(148, 163, 184)

  const contact = [praxis.praxis_name, praxis.inhaber_name]
  if (praxis.telefon) contact.push(`Tel. ${praxis.telefon}`)
  if (praxis.email) contact.push(praxis.email)
  if (praxis.website) contact.push(praxis.website)
  doc.text(contact.join("  \u00B7  "), PAGE_W / 2, footerY, { align: "center" })

  const legal: string[] = []
  legal.push("Heilpraktiker gem. \u00A71 HeilprG")
  legal.push("Umsatzsteuerbefreit gem. \u00A74 Nr. 14 UStG")
  if (praxis.zulassungsnummer) legal.push(`Zul.-Nr. ${praxis.zulassungsnummer}`)
  if (praxis.steuernummer) legal.push(`St.-Nr. ${praxis.steuernummer}`)
  doc.text(legal.join("  \u00B7  "), PAGE_W / 2, footerY + 3.5, { align: "center" })
}

function fmtDate(dateStr: string): string {
  if (!dateStr) return ""
  const d = new Date(dateStr)
  return d.toLocaleDateString("de-DE", { day: "2-digit", month: "2-digit", year: "numeric" })
}

function fmtDateTime(dateStr: string): string {
  if (!dateStr) return ""
  const d = new Date(dateStr)
  return d.toLocaleDateString("de-DE", {
    day: "2-digit", month: "2-digit", year: "numeric",
    hour: "2-digit", minute: "2-digit",
  })
}
