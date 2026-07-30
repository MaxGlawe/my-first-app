/**
 * Einzige Preis-Quelle für BGF — Website, Verträge und Rechnungen.
 *
 * Ein volles Produkt für jeden Mitarbeitenden — gestaffelt nach Teamgröße,
 * fester Monatspreis (kein Pro-Kopf-Preis, keine Feature-Tarife).
 * Genutzt von: BgfPricingSection, BgfRoiCalculator, BgfContactForm,
 * Vertrags-Erstellung (/api/admin/bgf-contracts), Vertrags-PDF und Invoicing.
 */

export type BgfPaket = {
  /** Obergrenze der Staffel in Mitarbeitenden */
  maxMa: number
  /** Anzeige-Label der Staffel, z. B. „bis 20“ */
  size: string
  /** Monatspreis in Euro (netto) */
  preis: number
  /**
   * Kopfpreis für Nachbesetzungen über der Paketgrenze (netto/Monat).
   * Entspricht dem, was ein Kopf im Paket ohnehin kostet (preis / maxMa,
   * kaufmännisch gerundet) — der Neue kostet also so viel wie seine Kollegen.
   */
  proMaZusatz: number
  featured?: boolean
}

export const BGF_PAKETE: BgfPaket[] = [
  { maxMa: 10, size: "bis 10", preis: 390, proMaZusatz: 39 },
  { maxMa: 20, size: "bis 20", preis: 590, proMaZusatz: 29.5, featured: true },
  { maxMa: 35, size: "bis 35", preis: 890, proMaZusatz: 25.5 },
  { maxMa: 50, size: "bis 50", preis: 1190, proMaZusatz: 24 },
]

/** Richtwert je zusätzlichem Mitarbeitenden oberhalb der größten Staffel. */
const MEHRPREIS_PRO_MA = 22

export const GROSSES_TEAM_LABEL = "Größeres Team (über 50 Mitarbeitende)"

export function fmtEuro(n: number) {
  return new Intl.NumberFormat("de-DE").format(Math.round(n))
}

/**
 * Label für die Paket-Auswahl. Pricing-Sektion verlinkt damit auf das
 * Kontaktformular (?modell=…) — die Strings müssen identisch bleiben,
 * sonst greift die Vorauswahl im Formular nicht.
 */
export function paketLabel(p: BgfPaket) {
  return `${p.size} Mitarbeitende (${fmtEuro(p.preis)} €/Monat)`
}

/**
 * Monatspreis für eine Teamgröße. Oberhalb der größten Staffel gibt es kein
 * Listenpreis-Paket mehr — dann ist `paket` null und der Preis ein Richtwert
 * für ein individuelles Angebot.
 */
export function monatspreis(mitarbeiter: number): { preis: number; paket: BgfPaket | null } {
  const paket = BGF_PAKETE.find((p) => mitarbeiter <= p.maxMa)
  if (paket) return { preis: paket.preis, paket }

  const groesste = BGF_PAKETE[BGF_PAKETE.length - 1]
  return {
    preis: groesste.preis + (mitarbeiter - groesste.maxMa) * MEHRPREIS_PRO_MA,
    paket: null,
  }
}

// ── Vertrags- und Rechnungsseite ─────────────────────────────────────

/** Größte Staffel mit Listenpreis — darüber gilt ein individuelles Angebot. */
export const MAX_LISTEN_PAKET_MA = BGF_PAKETE[BGF_PAKETE.length - 1].maxMa

/** Paket zu einer Staffel-Obergrenze, z. B. 20 → „bis 20“. */
export function paketByMaxMa(maxMa: number): BgfPaket | undefined {
  return BGF_PAKETE.find((p) => p.maxMa === maxMa)
}

/**
 * Paket-Label für Vertrag, Rechnung und Admin-Ansicht.
 * `maxMa` außerhalb der Staffel = individuell verhandeltes Paket.
 */
export function paketVertragsLabel(maxMa: number | null | undefined): string {
  if (!maxMa) return "Individuelles Paket"
  const p = paketByMaxMa(maxMa)
  return p ? `${p.size} Mitarbeitende` : `bis ${maxMa} Mitarbeitende (individuell)`
}

/** Betrag als deutsche Währung, z. B. „590,00 €“. */
export function fmtCurrencyEuro(amount: number): string {
  return Number(amount).toLocaleString("de-DE", { style: "currency", currency: "EUR" })
}

// ── Monatsbetrag inkl. Nachbesetzungen ───────────────────────────────

export type MonatsAbrechnung = {
  /** Tatsächlich abgerechnetes Paket (kann größer sein als das vereinbarte) */
  abgerechnetesPaketMaxMa: number | null
  paketPreis: number
  /** Köpfe über der Paketgrenze */
  zusatzMa: number
  /** Kopfpreis je Nachbesetzung */
  zusatzPreisProMa: number
  zusatzBetrag: number
  gesamt: number
  /** true = größeres Paket war günstiger als Paket + Nachbesetzungen */
  paketWechsel: boolean
  /** true = Teamgröße übersteigt die Listen-Staffel, individuelles Angebot nötig */
  ueberListe: boolean
}

/**
 * Monatsbetrag für eine Abrechnungsperiode.
 *
 * Regel aus §4 des Vertrags: Köpfe über der Paketgrenze werden einzeln
 * berechnet — höchstens jedoch bis zum Preis des nächstgrößeren Pakets
 * („Bestpreis"). Sobald das größere Paket günstiger ist, gilt dieses.
 *
 * `vertragsPaketMaxMa = null` (individuell verhandelt) ⇒ keine automatische
 * Nachberechnung; solche Verträge werden von Hand angepasst.
 */
export function berechneMonatsbetrag(
  vertragsPaketMaxMa: number | null,
  vertragsPreis: number,
  aktiveMa: number,
  zusatzPreisProMa: number | null
): MonatsAbrechnung {
  const basis: MonatsAbrechnung = {
    abgerechnetesPaketMaxMa: vertragsPaketMaxMa,
    paketPreis: vertragsPreis,
    zusatzMa: 0,
    zusatzPreisProMa: zusatzPreisProMa ?? 0,
    zusatzBetrag: 0,
    gesamt: vertragsPreis,
    paketWechsel: false,
    ueberListe: false,
  }

  if (vertragsPaketMaxMa == null) return basis

  const ueberhang = Math.max(0, aktiveMa - vertragsPaketMaxMa)
  if (ueberhang === 0) return basis

  const kopfpreis = zusatzPreisProMa ?? paketByMaxMa(vertragsPaketMaxMa)?.proMaZusatz ?? 0

  // Alle zulässigen Varianten durchrechnen und die günstigste nehmen:
  //   (a) beim vereinbarten Paket bleiben, Überhang je Kopf
  //   (b) jedes größere Listenpaket, ebenfalls mit Überhang je Kopf
  // Damit gibt es keine Sprünge nach oben: Wächst das Team weiter, steigt der
  // Betrag immer nur um den jeweils günstigsten Kopfpreis.
  type Variante = {
    maxMa: number
    paketPreis: number
    kopfpreis: number
    zusatzMa: number
    gesamt: number
    wechsel: boolean
  }

  const varianten: Variante[] = [
    {
      maxMa: vertragsPaketMaxMa,
      paketPreis: vertragsPreis,
      kopfpreis,
      zusatzMa: ueberhang,
      gesamt: round2(vertragsPreis + ueberhang * kopfpreis),
      wechsel: false,
    },
    ...BGF_PAKETE.filter((p) => p.maxMa > vertragsPaketMaxMa).map((p) => {
      const zusatzMa = Math.max(0, aktiveMa - p.maxMa)
      return {
        maxMa: p.maxMa,
        paketPreis: p.preis,
        kopfpreis: p.proMaZusatz,
        zusatzMa,
        gesamt: round2(p.preis + zusatzMa * p.proMaZusatz),
        wechsel: true,
      }
    }),
  ]

  // Günstigste Variante; bei Gleichstand die mit dem größeren Paket (mehr Puffer)
  const beste = varianten.reduce((a, b) =>
    b.gesamt < a.gesamt || (b.gesamt === a.gesamt && b.maxMa > a.maxMa) ? b : a
  )

  return {
    abgerechnetesPaketMaxMa: beste.maxMa,
    paketPreis: beste.paketPreis,
    zusatzMa: beste.zusatzMa,
    zusatzPreisProMa: beste.kopfpreis,
    zusatzBetrag: round2(beste.zusatzMa * beste.kopfpreis),
    gesamt: beste.gesamt,
    paketWechsel: beste.wechsel,
    ueberListe: aktiveMa > MAX_LISTEN_PAKET_MA,
  }
}

function round2(n: number): number {
  return Math.round(n * 100) / 100
}
