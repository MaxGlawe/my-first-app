/**
 * Die Vermerkzeilen unter den Positionen eines Belegs — für PDF UND Vorschau.
 *
 * Lagen bis 06.11.2026 nur im PDF-Generator. Die Vorschau im OS zeigte
 * deshalb einen Leistungsnachweis als „RECHNUNG“ mit Bankdaten, ohne
 * „Bereits beglichen durch …“ — obwohl das PDF an den Patienten stimmte.
 *
 * Bewusst ohne jsPDF-Import: Die Vorschau ist eine Client-Komponente.
 */

import type { InvoiceWithItems } from "@/types/billing"

// Eine Analogziffer ohne Begruendung ist der sichere Weg in die Ablehnung:
// Der Sachbearbeiter gleicht mit dem Katalog ab, liest unter 20.1
// „Atemtherapeutische Behandlungsverfahren" und sieht eine Uebungsbehandlung.
// Die Erklaerung gehoert deshalb auf den Beleg — aber EINMAL, als Fussnote.
// In jeder Zeile stuende sie bei „Intensiv" fuenfmal auf derselben Seite.
const ANALOG_HERKUNFT: Record<string, string> = {
  "A20.1": "Ziffer 20.1 (Atemtherapeutische Behandlungsverfahren)",
  "A11.3": "Ziffer 11.3 (Individueller schriftlicher Diätplan)",
}

export function belegVermerke(invoice: Pick<InvoiceWithItems, "notes" | "line_items">): string[] {
  const analogZiffern = [
    ...new Set(
      (invoice.line_items ?? [])
        .map((p) => p.gebueh_ziffer)
        .filter((z): z is string => !!z && z.startsWith("A"))
    ),
  ].sort()

  const analogHinweis =
    analogZiffern.length > 0
      ? `Analogleistungen: ` +
        analogZiffern
          .map((z) => `${z} analog ${ANALOG_HERKUNFT[z] ?? `Ziffer ${z.slice(1)}`}`)
          .join(", ") +
        `. Die GebüH von 1985 enthält für Bewegungstherapie und schriftliche Trainingspläne ` +
        `keine eigenen Ziffern; die Analogie wird deshalb offen ausgewiesen.`
      : null

  // Der Stripe-Anker aus der Bezahlrechnung ist Technik, kein Vermerk.
  const zeilen = (invoice.notes ?? "")
    .split("\n")
    .map((z) => z.trim())
    .filter((z) => z && !z.startsWith("stripe_session:"))

  if (analogHinweis) zeilen.unshift(analogHinweis)
  return zeilen
}
