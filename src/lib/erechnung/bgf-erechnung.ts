/**
 * BGF-Rechnung als E-Rechnung erzeugen.
 *
 * Ein Aufruf für alle Stellen, an denen eine Rechnung ausgeliefert wird
 * (Download, Versand, Rechnungslauf): sichtbares PDF wie bisher, zusätzlich
 * das Factur-X-XML nach EN 16931 eingebettet.
 *
 * Bewusst NUR für Rechnungen: Mahnungen und Zahlungserinnerungen sind keine
 * Rechnungen und dürfen kein Rechnungs-XML tragen — sonst würde ein
 * Buchhaltungssystem denselben Umsatz mehrfach verbuchen.
 */

import type { BgfInvoice } from "@/types/bgf-invoice"
import { generateBgfInvoicePdf } from "@/lib/pdf/bgf-invoice-pdf"
import { buildFacturXXml } from "./factur-x-xml"
import { pdfMitERechnungAnreichern } from "./zugferd-einbetten"

export async function generateBgfERechnung(invoice: BgfInvoice): Promise<Buffer> {
  const pdf = await generateBgfInvoicePdf(invoice, "rechnung")

  try {
    const xml = buildFacturXXml(invoice)
    return await pdfMitERechnungAnreichern(pdf, xml, {
      rechnungsnummer: invoice.invoice_number,
      aussteller: invoice.praxis_name,
    })
  } catch (err) {
    // Die Rechnung muss den Kunden auch dann erreichen, wenn die Anreicherung
    // scheitert — dann eben als reines PDF.
    console.error("[e-rechnung] Anreicherung fehlgeschlagen, sende reines PDF:", err)
    return pdf
  }
}
