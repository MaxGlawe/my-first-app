import { jsPDF } from "jspdf"
import type { BgfContract, BgfVertragText } from "@/types/bgf-contract"
import { BGF_CONTRACT_TYPE_LABELS, istPaketVertrag } from "@/types/bgf-contract"
import { paketVertragsLabel } from "@/lib/bgf-pakete"

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
const CW = PAGE_W - ML - MR
const RIGHT_EDGE = PAGE_W - MR

type Color = { r: number; g: number; b: number }

// Section order (JSONB doesn't guarantee order)
const SECTION_ORDER: (keyof BgfVertragText)[] = [
  "vertragsparteien",
  "praeambel",
  "vertragsgegenstand",
  "leistungsumfang",
  "zusatzleistungen",
  "app_nutzung",
  "verguetung",
  "laufzeit_kuendigung",
  "datenschutz",
  "vertraulichkeit",
  "haftung",
  "mitwirkungspflichten",
  "widerrufsrecht",
  "geistiges_eigentum",
  "abwerbeverbot",
  "schlussbestimmungen",
]

function fmtDate(dateStr: string | null | undefined): string {
  if (!dateStr) return "—"
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

export async function generateBgfContractPdf(
  contract: BgfContract,
  options?: { includeSignature?: boolean }
): Promise<Buffer> {
  const doc = new jsPDF({ unit: "mm", format: "a4" })
  let y = 0

  const setColor = (c: Color) => doc.setTextColor(c.r, c.g, c.b)
  const setFill = (c: Color) => doc.setFillColor(c.r, c.g, c.b)
  const setDraw = (c: Color) => doc.setDrawColor(c.r, c.g, c.b)

  function drawFooter() {
    const footerY = PAGE_H - 12
    setDraw(LIGHT)
    doc.setLineWidth(0.2)
    doc.line(ML, footerY - 2, RIGHT_EDGE, footerY - 2)
    doc.setFontSize(6.5)
    doc.setFont("helvetica", "normal")
    setColor(LIGHT)
    doc.text(
      `${contract.praxis_name}  ·  ${contract.praxis_inhaber}  ·  ${contract.praxis_address}`,
      PAGE_W / 2, footerY, { align: "center" }
    )
    doc.text(
      "Betriebliche Gesundheitsförderung  ·  BGF-Dienstleistungsvertrag",
      PAGE_W / 2, footerY + 3.5, { align: "center" }
    )
  }

  function checkPageBreak(neededSpace: number) {
    if (y + neededSpace > PAGE_H - 25) {
      drawFooter()
      doc.addPage()
      setFill(EMERALD)
      doc.rect(0, 0, PAGE_W, 3, "F")
      y = 20
    }
  }

  // ════════════════════════════════════════════
  // 1. ACCENT BAR
  // ════════════════════════════════════════════
  setFill(EMERALD)
  doc.rect(0, 0, PAGE_W, 3, "F")

  // ════════════════════════════════════════════
  // 2. LETTERHEAD (right aligned)
  // ════════════════════════════════════════════
  y = 15
  doc.setFontSize(20)
  doc.setFont("helvetica", "bold")
  setColor(DARK)
  doc.text(contract.praxis_name, RIGHT_EDGE, y, { align: "right" })
  y += 7
  doc.setFontSize(9)
  doc.setFont("helvetica", "normal")
  setColor(GRAY)
  doc.text(contract.praxis_inhaber, RIGHT_EDGE, y, { align: "right" })
  y += 4.5
  doc.text(contract.praxis_address, RIGHT_EDGE, y, { align: "right" })

  // ════════════════════════════════════════════
  // 3. SENDER LINE (DIN 5008)
  // ════════════════════════════════════════════
  y = 50
  doc.setFontSize(6.5)
  setColor(LIGHT)
  doc.text(
    `${contract.praxis_name}  ·  ${contract.praxis_address}`,
    ML, y
  )
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
  doc.text(contract.org_name, ML, y)
  y += 5.5
  doc.setFont("helvetica", "normal")
  doc.text(contract.kontakt_name, ML, y)
  y += 5.5
  if (contract.org_address) {
    doc.text(contract.org_address, ML, y)
    y += 5.5
  }

  // ════════════════════════════════════════════
  // 5. INFO BOX (right side)
  // ════════════════════════════════════════════
  const infoBoxX = 125
  let infoY = 54
  setFill(SUBTLE)
  doc.roundedRect(infoBoxX, infoY - 2, RIGHT_EDGE - infoBoxX, contract.zusatz_ma_preis ? 40 : 35, 2, 2, "F")

  doc.setFontSize(8.5)
  infoY += 3

  const statusLabel = contract.status === "unterschrieben" ? "Unterzeichnet" : "Entwurf"

  // Altverträge (Tarif-Ära) zeigen weiter ihren Tarif, neue das Paket.
  const istPaket = istPaketVertrag(contract)
  const umfangRow: [string, string] = istPaket
    ? ["Paket", contract.paket_label ?? paketVertragsLabel(contract.paket_max_ma)]
    : ["Tarif", BGF_CONTRACT_TYPE_LABELS[contract.contract_type] ?? contract.contract_type]

  const infoRows: [string, string][] = [
    ["Vertragsnr.", contract.contract_number],
    umfangRow,
    [istPaket ? "Mitarbeitende" : "Lizenzen", `${contract.lizenzen} MA`],
    ["Monatlich", `${Number(contract.monatlicher_gesamtpreis).toFixed(2)} €`],
    ...(istPaket && contract.zusatz_ma_preis
      ? ([["Je weiterer MA", `${Number(contract.zusatz_ma_preis).toFixed(2)} €`]] as [string, string][])
      : []),
    ["Status", statusLabel],
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
  doc.text("BGF-DIENSTLEISTUNGSVERTRAG", ML, y)
  y += 3
  setFill(EMERALD)
  doc.rect(ML, y, 50, 1, "F")
  y += 12

  // ════════════════════════════════════════════
  // 7. CONTRACT TEXT (all sections in order)
  // ════════════════════════════════════════════
  const vertragText = contract.vertrag_text as BgfVertragText

  for (const key of SECTION_ORDER) {
    const text = vertragText[key]
    if (!text) continue

    const lines = text.split("\n")

    for (const line of lines) {
      const trimmed = line.trim()
      if (!trimmed) {
        y += 2
        continue
      }

      // Section headers (§, Präambel, Zwischen...)
      if (/^(§\d|Präambel)/.test(trimmed)) {
        checkPageBreak(12)
        y += 4
        doc.setFontSize(11)
        doc.setFont("helvetica", "bold")
        setColor(DARK)
        doc.text(trimmed, ML, y)
        y += 6
      } else if (trimmed.startsWith("Zwischen") || trimmed.startsWith("und") || trimmed.startsWith("wird folgender") || trimmed.startsWith("— gemeinsam")) {
        checkPageBreak(6)
        doc.setFontSize(9)
        doc.setFont("helvetica", "bold")
        setColor(DARK)
        doc.text(trimmed, ML, y)
        y += 5
      } else if (trimmed.startsWith("- ")) {
        checkPageBreak(6)
        doc.setFontSize(8.5)
        doc.setFont("helvetica", "normal")
        setColor(DARK)
        const bulletText = trimmed.substring(2)
        const wrapped = doc.splitTextToSize(bulletText, CW - 8)
        for (const wl of wrapped) {
          checkPageBreak(5)
          doc.text("\u2022", ML + 2, y)
          doc.text(wl, ML + 8, y)
          y += 4.5
        }
      } else if (trimmed === "") {
        y += 2
      } else {
        checkPageBreak(6)
        doc.setFontSize(8.5)
        doc.setFont("helvetica", "normal")
        setColor(DARK)
        const wrapped = doc.splitTextToSize(trimmed, CW)
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
  // 8. SIGNATURE AREA
  // ════════════════════════════════════════════
  checkPageBreak(55)
  y += 10

  setDraw(LIGHT)
  doc.setLineWidth(0.3)

  // Left: Praxis (Auftragnehmer)
  const sigY = y
  doc.setFontSize(8)
  setColor(GRAY)
  doc.text("Auftragnehmer (Praxis)", ML, sigY)

  if (contract.praxis_signature_png) {
    try {
      doc.addImage(contract.praxis_signature_png, "PNG", ML, sigY + 2, 55, 20)
    } catch { /* ignore */ }
  }

  doc.line(ML, sigY + 25, ML + 65, sigY + 25)
  doc.setFontSize(7.5)
  setColor(LIGHT)
  doc.text(contract.praxis_inhaber, ML, sigY + 29)
  doc.text(contract.praxis_name, ML, sigY + 33)

  // Right: Company (Auftraggeber)
  const sigX = 115
  doc.setFontSize(8)
  setColor(GRAY)
  doc.text("Auftraggeber (Unternehmen)", sigX, sigY)

  if (options?.includeSignature && contract.signature_png) {
    try {
      doc.addImage(contract.signature_png, "PNG", sigX, sigY + 2, 55, 20)
    } catch { /* ignore */ }
  }

  doc.line(sigX, sigY + 25, sigX + 65, sigY + 25)
  doc.setFontSize(7.5)
  setColor(LIGHT)
  doc.text(contract.kontakt_name, sigX, sigY + 29)
  doc.text(contract.org_name, sigX, sigY + 33)

  // Electronic signature metadata
  if (options?.includeSignature && contract.signed_at) {
    doc.setFontSize(6.5)
    setColor(LIGHT)
    doc.text(
      `Elektronisch unterzeichnet am ${fmtDateTime(contract.signed_at)}`,
      sigX, sigY + 38
    )
    if (contract.signer_ip) {
      doc.text(`IP: ${contract.signer_ip}`, sigX, sigY + 42)
    }
  }

  // ════════════════════════════════════════════
  // 9. FOOTER
  // ════════════════════════════════════════════
  drawFooter()

  return Buffer.from(doc.output("arraybuffer"))
}
