"use client"

import { useState, useEffect } from "react"
import QRCode from "qrcode"
import type { InvoiceWithItems, PraxisSettings } from "@/types/billing"

function fmtDate(dateStr: string) {
  if (!dateStr) return ""
  return new Date(dateStr + "T00:00:00").toLocaleDateString("de-DE", {
    day: "2-digit",
    month: "2-digit",
    year: "numeric",
  })
}

function fmtCurrency(amount: number) {
  return amount.toLocaleString("de-DE", { style: "currency", currency: "EUR" })
}

interface InvoicePreviewProps {
  invoice: InvoiceWithItems
  praxis: PraxisSettings
}

export function InvoicePreview({ invoice, praxis }: InvoicePreviewProps) {
  const items = invoice.line_items || []
  const [qrDataUrl, setQrDataUrl] = useState<string | null>(null)

  useEffect(() => {
    if (!praxis.iban) return

    const cleanIban = praxis.iban.replace(/\s/g, "")
    const cleanBic = (praxis.bic || "").replace(/\s/g, "")
    const reference = invoice.invoice_number
      ? `Rechnung ${invoice.invoice_number}`
      : `Rechnung-Entwurf`

    const payload = [
      "BCD",
      "002",
      "1",
      "SCT",
      cleanBic,
      (praxis.praxis_name || "").substring(0, 70),
      cleanIban,
      `EUR${Number(invoice.total).toFixed(2)}`,
      "",
      "",
      reference.substring(0, 140),
      "",
    ].join("\n")

    QRCode.toDataURL(payload, {
      errorCorrectionLevel: "M",
      margin: 2,
      width: 200,
      color: { dark: "#000000", light: "#FFFFFF" },
    }).then(setQrDataUrl).catch(() => setQrDataUrl(null))
  }, [praxis.iban, praxis.bic, praxis.praxis_name, invoice.total, invoice.invoice_number])

  return (
    <div className="flex justify-center">
      {/* A4 Paper */}
      <div
        className="bg-white shadow-2xl border border-slate-200 w-full max-w-[794px] relative overflow-hidden"
        style={{ aspectRatio: "210 / 297", fontSize: "clamp(7px, 1.1vw, 11px)" }}
      >
        {/* Emerald top accent */}
        <div className="absolute top-0 left-0 right-0 h-[4px] bg-emerald-500" />

        <div className="px-[8%] pt-[5%] pb-[4%] h-full flex flex-col">
          {/* ── Header: Briefkopf rechts ── */}
          <div className="flex justify-between items-start mb-[3%]">
            <div /> {/* Spacer */}
            <div className="text-right">
              <p className="font-bold text-slate-900" style={{ fontSize: "1.8em" }}>
                {praxis.praxis_name}
              </p>
              <div className="text-slate-500 mt-1 space-y-[1px]" style={{ fontSize: "0.85em" }}>
                <p>{praxis.inhaber_name}</p>
                <p>{praxis.strasse}</p>
                <p>{praxis.plz} {praxis.ort}</p>
                {praxis.telefon && <p>Tel. {praxis.telefon}</p>}
                {praxis.email && <p>{praxis.email}</p>}
              </div>
            </div>
          </div>

          {/* ── Absenderzeile + Empfänger + Info-Block ── */}
          <div className="flex justify-between items-start mb-[2%]">
            {/* Links: Absender + Empfänger */}
            <div className="max-w-[55%]">
              {/* Absenderzeile */}
              <p
                className="text-slate-400 border-b border-slate-300 pb-[2px] mb-[6px]"
                style={{ fontSize: "0.6em" }}
              >
                {praxis.praxis_name} &middot; {praxis.strasse} &middot; {praxis.plz} {praxis.ort}
              </p>
              {/* Empfänger */}
              <div style={{ fontSize: "1.05em" }}>
                <p className="font-normal text-black">{invoice.patient_name}</p>
                {invoice.patient_address?.split("\n").map((line, i) => (
                  <p key={i} className="text-black">{line}</p>
                ))}
              </div>
            </div>

            {/* Rechts: Info-Block */}
            <div
              className="bg-slate-100 rounded-md px-[2.5%] py-[1.5%] min-w-[35%]"
              style={{ fontSize: "0.82em" }}
            >
              {[
                ["Rechnungsnr.", invoice.invoice_number],
                ["Rechnungsdatum", fmtDate(invoice.invoice_date)],
                ["Behandlungsdatum", fmtDate(invoice.treatment_date)],
                ["Fällig bis", fmtDate(invoice.due_date)],
              ].map(([label, value]) => (
                <div key={label} className="flex justify-between gap-4 py-[3px]">
                  <span className="text-slate-500">{label}</span>
                  <span className="font-bold text-slate-900">{value}</span>
                </div>
              ))}
            </div>
          </div>

          {/* ── RECHNUNG Titel ── */}
          <div className="mb-[2%]">
            <h2 className="font-bold text-slate-900 tracking-tight" style={{ fontSize: "2em" }}>
              RECHNUNG
            </h2>
            <div className="w-[15%] h-[3px] bg-emerald-500 mt-[3px] rounded-full" />
          </div>

          {/* ── Diagnose ── */}
          {invoice.diagnose_text && (
            <div className="mb-[1.5%]" style={{ fontSize: "0.85em" }}>
              <span className="text-slate-500">Diagnose: </span>
              <span className="text-slate-800 italic">{invoice.diagnose_text}</span>
            </div>
          )}

          {/* ── Positionstabelle ── */}
          <div className="mb-[1.5%]">
            {/* Header */}
            <div
              className="bg-slate-800 text-white rounded-t-md grid items-center px-[2%] py-[6px] font-bold"
              style={{
                fontSize: "0.75em",
                gridTemplateColumns: "6% 10% 1fr 7% 14% 14%",
              }}
            >
              <span>Pos.</span>
              <span>GebüH</span>
              <span>Leistungsbeschreibung</span>
              <span className="text-center">Anz.</span>
              <span className="text-right">Einzelpreis</span>
              <span className="text-right">Betrag</span>
            </div>

            {/* Rows */}
            {items.map((item, i) => (
              <div
                key={item.id}
                className={`grid items-center px-[2%] py-[5px] ${i % 2 === 0 ? "bg-slate-50" : "bg-white"}`}
                style={{
                  fontSize: "0.82em",
                  gridTemplateColumns: "6% 10% 1fr 7% 14% 14%",
                }}
              >
                <span className="text-slate-700">{i + 1}</span>
                <span className="font-bold text-emerald-600">{item.gebueh_ziffer || "—"}</span>
                <span className="text-slate-800 pr-2">{item.beschreibung}</span>
                <span className="text-center text-slate-700">{item.anzahl}</span>
                <span className="text-right text-slate-700">
                  {fmtCurrency(Number(item.einzelpreis))}
                </span>
                <span className="text-right font-bold text-slate-900">
                  {fmtCurrency(Number(item.gesamtpreis))}
                </span>
              </div>
            ))}

            {/* Abschlusslinie */}
            <div className="h-[2px] bg-emerald-500 mt-[2px]" />
          </div>

          {/* ── Summenblock ── */}
          <div className="flex justify-end mb-[3%]">
            <div className="min-w-[35%]" style={{ fontSize: "0.85em" }}>
              <div className="flex justify-between py-[3px]">
                <span className="text-slate-500">Nettobetrag</span>
                <span className="text-slate-900">{fmtCurrency(Number(invoice.total))}</span>
              </div>
              <div className="flex justify-between py-[3px]" style={{ fontSize: "0.9em" }}>
                <span className="text-slate-400">MwSt. (§4 Nr. 14 UStG)</span>
                <span className="text-slate-400">0,00&nbsp;&euro;</span>
              </div>
              <div className="border-t border-slate-800 mt-[4px]" />
              <div
                className="bg-slate-800 text-white rounded-md flex justify-between items-center px-[10%] py-[6px] mt-[4px] font-bold"
                style={{ fontSize: "1.15em" }}
              >
                <span>Gesamtbetrag</span>
                <span>{fmtCurrency(Number(invoice.total))}</span>
              </div>
            </div>
          </div>

          {/* ── Zahlungsinformationen ── */}
          <div className="mb-[2%]">
            {/* Section Header */}
            <div className="flex items-center gap-2 mb-[6px]">
              <div className="w-[4px] h-[4px] bg-emerald-500 rounded-full" />
              <span className="font-bold text-slate-900" style={{ fontSize: "0.95em" }}>
                Zahlungsinformationen
              </span>
            </div>

            <div className="flex justify-between items-start">
              {/* Bankdaten */}
              <div
                className="bg-slate-100 rounded-md px-[2.5%] py-[1.5%] max-w-[60%]"
                style={{ fontSize: "0.82em" }}
              >
                {[
                  ["Empfänger", praxis.praxis_name],
                  ["IBAN", praxis.iban],
                  ...(praxis.bic ? [["BIC", praxis.bic]] : []),
                  ...(praxis.bank_name ? [["Bank", praxis.bank_name]] : []),
                ].map(([label, value]) => (
                  <div key={label} className="flex gap-4 py-[2px]">
                    <span className="text-slate-500 min-w-[70px]">{label}</span>
                    <span className="font-bold text-slate-900">{value}</span>
                  </div>
                ))}
                <p className="font-bold text-emerald-600 mt-[4px]">
                  Zahlbar bis {fmtDate(invoice.due_date)}
                </p>
              </div>

              {/* QR-Code */}
              <div className="border border-slate-200 rounded-md flex flex-col items-center justify-center px-[2%] py-[1.5%]">
                {qrDataUrl ? (
                  <img
                    src={qrDataUrl}
                    alt="GiroCode"
                    style={{ width: "clamp(50px, 8vw, 90px)", height: "clamp(50px, 8vw, 90px)" }}
                  />
                ) : (
                  <div
                    className="bg-slate-100 rounded flex items-center justify-center text-slate-400"
                    style={{ width: "clamp(50px, 8vw, 90px)", height: "clamp(50px, 8vw, 90px)", fontSize: "0.65em" }}
                  >
                    QR
                  </div>
                )}
                <p className="text-slate-400 mt-[3px]" style={{ fontSize: "0.6em" }}>
                  GiroCode scannen
                </p>
                <p className="text-slate-400" style={{ fontSize: "0.6em" }}>
                  zum Bezahlen
                </p>
              </div>
            </div>
          </div>

          {/* ── Hinweistext ── */}
          <div className="text-slate-400 mb-[2%]" style={{ fontSize: "0.7em" }}>
            <p>Diese Rechnung ist nach dem Gebührenverzeichnis für Heilpraktiker (GebüH) erstellt.</p>
            <p>Bitte beachten Sie, dass die Erstattung durch Ihre Versicherung von Ihrem Tarif abhängt.</p>
          </div>

          {/* ── Spacer ── */}
          <div className="flex-1" />

          {/* ── Fußzeile ── */}
          <div className="border-t border-slate-200 pt-[6px] text-center" style={{ fontSize: "0.6em" }}>
            <p className="text-slate-400">
              {[
                praxis.praxis_name,
                praxis.inhaber_name,
                ...(praxis.telefon ? [`Tel. ${praxis.telefon}`] : []),
                ...(praxis.email ? [praxis.email] : []),
                ...(praxis.website ? [praxis.website] : []),
              ].join("  ·  ")}
            </p>
            <p className="text-slate-400 mt-[2px]">
              {[
                "Heilpraktiker gem. §1 HeilprG",
                "Umsatzsteuerbefreit gem. §4 Nr. 14 UStG",
                ...(praxis.zulassungsnummer ? [`Zul.-Nr. ${praxis.zulassungsnummer}`] : []),
                ...(praxis.steuernummer ? [`St.-Nr. ${praxis.steuernummer}`] : []),
              ].join("  ·  ")}
            </p>
          </div>
        </div>
      </div>
    </div>
  )
}
