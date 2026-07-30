/**
 * E-Rechnung: EN 16931 / Factur-X (ZUGFeRD 2.x) — XML-Erzeugung
 *
 * Erzeugt ein Cross Industry Invoice (CII) nach EN 16931, Profil
 * "urn:cen.eu:en16931:2017". Genau dieses XML wird in das Rechnungs-PDF
 * eingebettet und macht daraus eine E-Rechnung im Sinne des § 14 UStG —
 * eine reine PDF-Datei ist ausdrücklich KEINE.
 *
 * Rechtlicher Rahmen (Wachstumschancengesetz):
 *   - seit 01.01.2025: Empfangspflicht für inländische B2B-Umsätze
 *   - ab  01.01.2027: Ausstellungspflicht ab 800.000 € Vorjahresumsatz
 *   - ab  01.01.2028: Ausstellungspflicht für alle übrigen
 * Steuerfreie Umsätze (§ 4 Nr. 14 UStG — Heilbehandlung) fallen nicht
 * darunter; betroffen sind hier die regelbesteuerten BGF-Leistungen.
 */

import type { BgfInvoice } from "@/types/bgf-invoice"
import { formatZeitraum } from "@/types/bgf-invoice"

/** XML-Sonderzeichen maskieren. */
function esc(text: string | null | undefined): string {
  if (!text) return ""
  return text
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&apos;")
}

/** EN 16931 verlangt das Format JJJJMMTT mit Attribut format="102". */
function datum(iso: string): string {
  return iso.slice(0, 10).replace(/-/g, "")
}

function betrag(n: number): string {
  return (Math.round(n * 100) / 100).toFixed(2)
}

/**
 * Adresse in Straße / PLZ / Ort zerlegen.
 * Die Anschrift wird im System als ein Feld gepflegt („Straße 1, 12345 Ort").
 */
function adresseTeile(adresse: string | null): {
  strasse: string
  plz: string
  ort: string
} {
  if (!adresse) return { strasse: "", plz: "", ort: "" }
  const teile = adresse.split(",").map((t) => t.trim())
  const strasse = teile[0] ?? ""
  const rest = teile.slice(1).join(" ").trim()
  const treffer = rest.match(/(\d{4,5})\s+(.+)/)
  return {
    strasse,
    plz: treffer?.[1] ?? "",
    ort: treffer?.[2] ?? rest,
  }
}

export interface FacturXOptions {
  /** Umsatzsteuersatz in Prozent (BGF: 19) */
  steuersatz?: number
  /** Umsatzsteuer-ID des Ausstellers, falls vorhanden */
  ustIdAussteller?: string | null
}

/**
 * Baut das Factur-X-XML für eine BGF-Rechnung.
 *
 * Mahngebühren bleiben bewusst außen vor: Sie sind Verzugsschaden und kein
 * Entgelt für eine Leistung — sie gehören weder in die Rechnungspositionen
 * noch in die Steuerbemessungsgrundlage.
 */
export function buildFacturXXml(
  invoice: BgfInvoice,
  options: FacturXOptions = {}
): string {
  const steuersatz = options.steuersatz ?? 19
  const netto = Math.round(Number(invoice.gesamtbetrag) * 100) / 100
  const steuer = Math.round(netto * (steuersatz / 100) * 100) / 100
  const brutto = Math.round((netto + steuer) * 100) / 100

  const verkaeufer = adresseTeile(invoice.praxis_address)
  const kaeufer = adresseTeile(invoice.org_address)
  const zeitraum = formatZeitraum(invoice.zeitraum_monat, invoice.zeitraum_jahr)

  // Positionen: Paketpreis, dazu ggf. Nachbesetzungen über der Paketgrenze
  const zusatzAnzahl = invoice.zusatz_ma_anzahl ?? 0
  const zusatzPreis = Number(invoice.zusatz_ma_preis ?? 0)
  const zusatzBetrag = Math.round(zusatzAnzahl * zusatzPreis * 100) / 100
  const paketBetrag = Math.round((netto - zusatzBetrag) * 100) / 100

  const positionen: Array<{
    nr: number
    name: string
    einzelpreis: number
    menge: number
    einheit: string
    gesamt: number
  }> = [
    {
      nr: 1,
      name: invoice.paket_label
        ? `BGF-Vollzugriff, ${invoice.paket_label} — ${zeitraum}`
        : `BGF-Leistung — ${zeitraum}`,
      einzelpreis: paketBetrag,
      menge: 1,
      // C62 = Stück (UN/ECE Recommendation 20)
      einheit: "C62",
      gesamt: paketBetrag,
    },
  ]

  if (zusatzAnzahl > 0) {
    positionen.push({
      nr: 2,
      name: `Nachbesetzung über Paketgrenze — ${zeitraum}`,
      einzelpreis: zusatzPreis,
      menge: zusatzAnzahl,
      einheit: "C62",
      gesamt: zusatzBetrag,
    })
  }

  const positionenXml = positionen
    .map(
      (p) => `  <ram:IncludedSupplyChainTradeLineItem>
    <ram:AssociatedDocumentLineDocument>
      <ram:LineID>${p.nr}</ram:LineID>
    </ram:AssociatedDocumentLineDocument>
    <ram:SpecifiedTradeProduct>
      <ram:Name>${esc(p.name)}</ram:Name>
    </ram:SpecifiedTradeProduct>
    <ram:SpecifiedLineTradeAgreement>
      <ram:NetPriceProductTradePrice>
        <ram:ChargeAmount>${betrag(p.einzelpreis)}</ram:ChargeAmount>
      </ram:NetPriceProductTradePrice>
    </ram:SpecifiedLineTradeAgreement>
    <ram:SpecifiedLineTradeDelivery>
      <ram:BilledQuantity unitCode="${p.einheit}">${p.menge}</ram:BilledQuantity>
    </ram:SpecifiedLineTradeDelivery>
    <ram:SpecifiedLineTradeSettlement>
      <ram:ApplicableTradeTax>
        <ram:TypeCode>VAT</ram:TypeCode>
        <ram:CategoryCode>S</ram:CategoryCode>
        <ram:RateApplicablePercent>${betrag(steuersatz)}</ram:RateApplicablePercent>
      </ram:ApplicableTradeTax>
      <ram:SpecifiedTradeSettlementLineMonetarySummation>
        <ram:LineTotalAmount>${betrag(p.gesamt)}</ram:LineTotalAmount>
      </ram:SpecifiedTradeSettlementLineMonetarySummation>
    </ram:SpecifiedLineTradeSettlement>
  </ram:IncludedSupplyChainTradeLineItem>`
    )
    .join("\n")

  return `<?xml version="1.0" encoding="UTF-8"?>
<rsm:CrossIndustryInvoice
  xmlns:rsm="urn:un:unece:uncefact:data:standard:CrossIndustryInvoice:100"
  xmlns:ram="urn:un:unece:uncefact:data:standard:ReusableAggregateBusinessInformationEntity:100"
  xmlns:udt="urn:un:unece:uncefact:data:standard:UnqualifiedDataType:100">
  <rsm:ExchangedDocumentContext>
    <ram:GuidelineSpecifiedDocumentContextParameter>
      <ram:ID>urn:cen.eu:en16931:2017</ram:ID>
    </ram:GuidelineSpecifiedDocumentContextParameter>
  </rsm:ExchangedDocumentContext>
  <rsm:ExchangedDocument>
    <ram:ID>${esc(invoice.invoice_number)}</ram:ID>
    <!-- 380 = Handelsrechnung -->
    <ram:TypeCode>380</ram:TypeCode>
    <ram:IssueDateTime>
      <udt:DateTimeString format="102">${datum(invoice.invoice_date)}</udt:DateTimeString>
    </ram:IssueDateTime>
  </rsm:ExchangedDocument>
  <rsm:SupplyChainTradeTransaction>
${positionenXml}
    <ram:ApplicableHeaderTradeAgreement>
      <ram:SellerTradeParty>
        <ram:Name>${esc(invoice.praxis_name)}</ram:Name>
        <ram:PostalTradeAddress>
          <ram:PostcodeCode>${esc(verkaeufer.plz)}</ram:PostcodeCode>
          <ram:LineOne>${esc(verkaeufer.strasse)}</ram:LineOne>
          <ram:CityName>${esc(verkaeufer.ort)}</ram:CityName>
          <ram:CountryID>DE</ram:CountryID>
        </ram:PostalTradeAddress>
${
  options.ustIdAussteller
    ? `        <ram:SpecifiedTaxRegistration>
          <ram:ID schemeID="VA">${esc(options.ustIdAussteller)}</ram:ID>
        </ram:SpecifiedTaxRegistration>`
    : `        <ram:SpecifiedTaxRegistration>
          <ram:ID schemeID="FC">${esc(invoice.praxis_steuernr)}</ram:ID>
        </ram:SpecifiedTaxRegistration>`
}
      </ram:SellerTradeParty>
      <ram:BuyerTradeParty>
        <ram:Name>${esc(invoice.org_name)}</ram:Name>
        <ram:PostalTradeAddress>
          <ram:PostcodeCode>${esc(kaeufer.plz)}</ram:PostcodeCode>
          <ram:LineOne>${esc(kaeufer.strasse)}</ram:LineOne>
          <ram:CityName>${esc(kaeufer.ort)}</ram:CityName>
          <ram:CountryID>DE</ram:CountryID>
        </ram:PostalTradeAddress>
      </ram:BuyerTradeParty>
    </ram:ApplicableHeaderTradeAgreement>
    <ram:ApplicableHeaderTradeDelivery>
      <ram:ActualDeliverySupplyChainEvent>
        <ram:OccurrenceDateTime>
          <udt:DateTimeString format="102">${datum(invoice.invoice_date)}</udt:DateTimeString>
        </ram:OccurrenceDateTime>
      </ram:ActualDeliverySupplyChainEvent>
    </ram:ApplicableHeaderTradeDelivery>
    <ram:ApplicableHeaderTradeSettlement>
      <ram:InvoiceCurrencyCode>EUR</ram:InvoiceCurrencyCode>
      <ram:SpecifiedTradeSettlementPaymentMeans>
        <!-- 58 = SEPA-Ueberweisung -->
        <ram:TypeCode>58</ram:TypeCode>
        <ram:PayeePartyCreditorFinancialAccount>
          <ram:IBANID>${esc(invoice.praxis_iban)}</ram:IBANID>
        </ram:PayeePartyCreditorFinancialAccount>
      </ram:SpecifiedTradeSettlementPaymentMeans>
      <ram:ApplicableTradeTax>
        <ram:CalculatedAmount>${betrag(steuer)}</ram:CalculatedAmount>
        <ram:TypeCode>VAT</ram:TypeCode>
        <ram:BasisAmount>${betrag(netto)}</ram:BasisAmount>
        <ram:CategoryCode>S</ram:CategoryCode>
        <ram:RateApplicablePercent>${betrag(steuersatz)}</ram:RateApplicablePercent>
      </ram:ApplicableTradeTax>
      <ram:SpecifiedTradePaymentTerms>
        <ram:DueDateDateTime>
          <udt:DateTimeString format="102">${datum(invoice.due_date)}</udt:DateTimeString>
        </ram:DueDateDateTime>
      </ram:SpecifiedTradePaymentTerms>
      <ram:SpecifiedTradeSettlementHeaderMonetarySummation>
        <ram:LineTotalAmount>${betrag(netto)}</ram:LineTotalAmount>
        <ram:TaxBasisTotalAmount>${betrag(netto)}</ram:TaxBasisTotalAmount>
        <ram:TaxTotalAmount currencyID="EUR">${betrag(steuer)}</ram:TaxTotalAmount>
        <ram:GrandTotalAmount>${betrag(brutto)}</ram:GrandTotalAmount>
        <ram:DuePayableAmount>${betrag(brutto)}</ram:DuePayableAmount>
      </ram:SpecifiedTradeSettlementHeaderMonetarySummation>
    </ram:ApplicableHeaderTradeSettlement>
  </rsm:SupplyChainTradeTransaction>
</rsm:CrossIndustryInvoice>
`
}
