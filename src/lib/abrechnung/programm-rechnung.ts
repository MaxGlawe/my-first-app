/**
 * PROJ-29 — Die Monatsrechnung des Programms, gerechnet aus dem, was
 * wirklich stattgefunden hat.
 *
 * ═══ DIE EINE REGEL ═════════════════════════════════════════════════════
 *
 * Keine Position ohne Ereignis, das sie trägt. Jede Zeile auf der Rechnung
 * zeigt auf etwas, das im System steht und ein Datum hat: ein Gespräch, das
 * begonnen wurde, ein Plan, der angelegt wurde, ein Bericht, der geschrieben
 * wurde. Was nicht stattfand, wird nicht berechnet — auch dann nicht, wenn
 * es geplant war.
 *
 * Das ist keine Vorsicht, sondern die Rechtslage: Abgerechnet werden dürfen
 * nur tatsächlich erbrachte Leistungen. Eine Rechnung, die eine Sitzung
 * ausweist, die ausfiel, ist im günstigen Fall peinlich.
 *
 * ═══ WIE DIE SUMME TROTZDEM STIMMT ══════════════════════════════════════
 *
 * Bezahlt wurde ein Programmpreis, erbracht werden einzelne Leistungen.
 * Beides zur Deckung zu bringen ist Aufgabe von zwei Posten:
 *
 *   „Digitale Betreuung und Verlaufsbegleitung" — der geplante Rest zwischen
 *   den Einzelleistungen und dem Programmpreis. Bei „Begleitet" sind das
 *   85 €, bei „Intensiv" 37 €; in beiden Fällen genau die Differenz.
 *
 *   „Programmpauschale gemäß Honorarvereinbarung" — was auf der letzten
 *   Rechnung übrig bleibt, weil weniger stattfand als geplant. Ein ehrlicher
 *   Name für einen echten Sachverhalt, statt einer erfundenen Leistung.
 *
 * Über alle drei Rechnungen ergibt sich exakt der Programmpreis.
 *
 * ═══ ANALOGZIFFERN ══════════════════════════════════════════════════════
 *
 * A20.1 und A11.3 sind Analogleistungen: Die GebüH kennt keine Ziffer für
 * eine per Video angeleitete Übung oder einen schriftlichen Trainingsplan.
 * Deshalb das „A" und eine Beschreibung, die ohne Vorkenntnis verständlich
 * ist — wer die Rechnung bei seiner Versicherung einreicht, soll nicht
 * erklären müssen, was gemeint war.
 */

import { PROGRAMM, VARIANTEN, type ProgrammVariante } from "@/lib/programm"

/** Sätze aus dem Gebührenverzeichnis — durchweg der Höchstsatz des Katalogs. */
export const SATZ = {
  /** Ziffer 1 — eingehende Untersuchung. */
  untersuchung: 20.5,
  /** Ziffer 5 — Beratung. */
  beratung: 17.5,
  /** A20.1 — aktive Bewegungstherapie per Video (analog Atemtherapie). */
  bewegungstherapie: 31.0,
  /** A11.3 — schriftlicher Übungs- und Therapieplan (analog Diätplan). */
  plan: 26.0,
  /** 11.2 — ausführlicher Bericht. */
  bericht: 20.5,
} as const

export interface Position {
  /** GebüH-Ziffer, „A" davor bei Analogleistungen. Null bei der Pauschale. */
  ziffer: string | null
  beschreibung: string
  anzahl: number
  einzelpreis: number
}

export interface Ereignisse {
  /** Die Konsultation: begonnen_at, und ob eine Übung angeleitet wurde. */
  konsultation?: { datum: string; uebungAngeleitet: boolean } | null
  /** Jede weitere Video-Sitzung im Zeitraum, die wirklich begonnen wurde. */
  sitzungen: { datum: string; uebungAngeleitet: boolean }[]
  /** Angelegte oder überarbeitete Pläne im Zeitraum. */
  plaene: { datum: string; erste: boolean }[]
  /** Geschriebene Berichte im Zeitraum. */
  berichte: { datum: string; abschluss: boolean }[]
}

export interface Monatsrechnung {
  positionen: Position[]
  summe: number
  /** Sitzungen ohne Haken „Übung angeleitet" — nicht abrechenbar als A20.1. */
  ohneNachweis: number
  /** Erbrachte Leistungen übersteigen den noch offenen Betrag. */
  ueberschuss: number
}

function datum(iso: string): string {
  return new Date(iso).toLocaleDateString("de-DE", {
    timeZone: "Europe/Berlin",
    day: "2-digit",
    month: "2-digit",
    year: "numeric",
  })
}

function runde(n: number): number {
  return Math.round(n * 100) / 100
}

/**
 * Der geplante Betrag für die digitale Betreuung: Programmpreis minus alles,
 * was nach Plan als Einzelleistung anfällt. Wird nicht von Hand gepflegt —
 * sonst stünde er irgendwann im Widerspruch zum Preis.
 */
export function digitaleBetreuungGesamt(variante: ProgrammVariante): number {
  const v = VARIANTEN[variante]
  const konsultation = SATZ.untersuchung + SATZ.beratung + SATZ.bewegungstherapie
  const plaene = SATZ.plan * 4 // Erstellung + drei Überarbeitungen
  const berichte = SATZ.bericht * 2 // Verlauf und Abschluss
  const sitzungen = SATZ.bewegungstherapie * v.calls
  return runde(v.preis - (konsultation + plaene + berichte + sitzungen))
}

/**
 * Was nach diesem Monat planmaessig noch ansteht.
 *
 * Gebraucht, damit die digitale Betreuung SOFORT schrumpft, wenn mehr
 * stattfand als geplant — und nicht erst die letzte Rechnung den Ueberschuss
 * ausbaden muss. Genau dieser Fall stand im Briefing: „Extra-Call bei
 * Rueckschlag: der Betrag der digitalen Betreuung verringert sich
 * entsprechend, Summe bleibt beim Programmpreis."
 *
 * Planmaessig: Plan-Ueberarbeitung in Woche 6 und 9, Verlaufsbericht in
 * Monat 2, Abschlussbericht in Monat 3, und die Sitzungen nach Taktung
 * (Intensiv: vier im ersten Monat, je zwei danach).
 */
function geplantRest(variante: ProgrammVariante, monat: 1 | 2 | 3): number {
  const sitzungenJeMonat = VARIANTEN[variante].calls > 0 ? [4, 2, 2] : [0, 0, 0]
  const plaeneJeMonat = [2, 1, 1] // Erstellung + Woche 3 | Woche 6 | Woche 9
  const berichteJeMonat = [0, 1, 1]

  let rest = 0
  for (let m = monat; m < 3; m++) {
    rest += sitzungenJeMonat[m] * SATZ.bewegungstherapie
    rest += plaeneJeMonat[m] * SATZ.plan
    rest += berichteJeMonat[m] * SATZ.bericht
  }
  return runde(rest)
}

/**
 * Baut die Positionen eines Monats.
 *
 * `bereitsBerechnet` ist die Summe der vorherigen Monatsrechnungen dieses
 * Programms. Im dritten Monat entscheidet sie darüber, was noch offen ist —
 * denn die drei Rechnungen zusammen müssen den Programmpreis ergeben, nicht
 * mehr und nicht weniger.
 */
export function monatsrechnung(args: {
  variante: ProgrammVariante
  monat: 1 | 2 | 3
  ereignisse: Ereignisse
  bereitsBerechnet: number
}): Monatsrechnung {
  const { variante, monat, ereignisse, bereitsBerechnet } = args
  const preis = VARIANTEN[variante].preis
  const positionen: Position[] = []
  let ohneNachweis = 0

  // ── Konsultation (nur im ersten Monat) ──────────────────────────────────
  if (ereignisse.konsultation) {
    const k = ereignisse.konsultation
    positionen.push({
      ziffer: "1",
      beschreibung: `Eingehende Untersuchung (per Video) am ${datum(k.datum)}`,
      anzahl: 1,
      einzelpreis: SATZ.untersuchung,
    })
    if (k.uebungAngeleitet) {
      positionen.push({
        ziffer: "A20.1",
        beschreibung: `Aktive Bewegungstherapie per Video: Anleitung und Korrektur der ersten Übung (analog Ziff. 20.1) am ${datum(k.datum)}`,
        anzahl: 1,
        einzelpreis: SATZ.bewegungstherapie,
      })
    } else {
      ohneNachweis++
    }
    positionen.push({
      ziffer: "5",
      beschreibung: `Beratung (per Video) am ${datum(k.datum)}`,
      anzahl: 1,
      einzelpreis: SATZ.beratung,
    })
  }

  // ── Pläne ───────────────────────────────────────────────────────────────
  for (const p of ereignisse.plaene) {
    positionen.push({
      ziffer: "A11.3",
      beschreibung: p.erste
        ? `Erstellung individueller schriftlicher Übungs- und Therapieplan (analog Ziff. 11.3) am ${datum(p.datum)}`
        : `Überarbeitung des Übungs- und Therapieplans (analog Ziff. 11.3) am ${datum(p.datum)}`,
      anzahl: 1,
      einzelpreis: SATZ.plan,
    })
  }

  // ── Video-Sitzungen ─────────────────────────────────────────────────────
  for (const s of ereignisse.sitzungen) {
    if (!s.uebungAngeleitet) {
      ohneNachweis++
      continue
    }
    positionen.push({
      ziffer: "A20.1",
      beschreibung: `Aktive Bewegungstherapie per Video (analog Ziff. 20.1) am ${datum(s.datum)}`,
      anzahl: 1,
      einzelpreis: SATZ.bewegungstherapie,
    })
  }

  // ── Berichte ────────────────────────────────────────────────────────────
  for (const b of ereignisse.berichte) {
    positionen.push({
      ziffer: "11.2",
      beschreibung: b.abschluss
        ? `Abschlussbericht vom ${datum(b.datum)}`
        : `Ausführlicher Verlaufsbericht vom ${datum(b.datum)}`,
      anzahl: 1,
      einzelpreis: SATZ.bericht,
    })
  }

  const leistungen = runde(positionen.reduce((s, p) => s + p.anzahl * p.einzelpreis, 0))

  // ── Digitale Betreuung ──────────────────────────────────────────────────
  //
  // Zu Dritteln über die Monate, damit jede Rechnung einen Abschnitt des
  // Programmzeitraums abbildet und nicht erst die letzte alles nachholt.
  const gesamtDigital = digitaleBetreuungGesamt(variante)
  const drittel = runde(gesamtDigital / 3)

  let digital: number
  let pauschale = 0
  let ueberschuss = 0

  if (monat < 3) {
    // Das Drittel, aber nie so viel, dass fuer die noch geplanten Leistungen
    // nichts mehr uebrig bliebe. Sonst zahlt die letzte Rechnung drauf.
    const spielraum = runde(preis - bereitsBerechnet - leistungen - geplantRest(variante, monat))
    digital = Math.max(0, Math.min(drittel, spielraum))
  } else {
    // Die letzte Rechnung schliesst die Lücke — oder deckelt.
    const offen = runde(preis - bereitsBerechnet)
    const rest = runde(offen - leistungen)
    if (rest >= 0) {
      // Was vom geplanten Drittel bleibt, heisst weiter „digitale Betreuung";
      // alles darüber hinaus bekommt seinen ehrlichen Namen.
      digital = Math.min(drittel, rest)
      pauschale = runde(rest - digital)
    } else {
      digital = 0
      ueberschuss = runde(-rest)
    }
  }

  if (digital > 0) {
    positionen.push({
      ziffer: null,
      beschreibung: `Digitale Betreuung und Verlaufsbegleitung (Chat, tägliche Check-ins, Auswertung), Programmabschnitt ${monat} von 3`,
      anzahl: 1,
      einzelpreis: digital,
    })
  }

  if (pauschale > 0) {
    positionen.push({
      ziffer: null,
      beschreibung: "Programmpauschale gemäß Honorarvereinbarung",
      anzahl: 1,
      einzelpreis: pauschale,
    })
  }

  return {
    positionen,
    summe: runde(positionen.reduce((s, p) => s + p.anzahl * p.einzelpreis, 0)),
    ohneNachweis,
    ueberschuss,
  }
}

/** Der Vermerk, der auf jede Rechnung des Programms gehört. */
export function vermerk(args: {
  konsultationAm: string | null
  bezahltAm: string | null
  /** Die Bezahlrechnung, die diesen Nachweis bereits beglichen hat. */
  rechnungsnummer?: string | null
  rechnungsdatum?: string | null
}): string {
  const teile: string[] = []
  if (args.konsultationAm) teile.push(`Behandlungsfall seit ${datum(args.konsultationAm)}`)

  // Der wichtigste Satz auf dem ganzen Blatt: Hier ist nichts zu zahlen.
  // Steht die Rechnungsnummer zur Verfügung, wird sie genannt — dann kann der
  // Patient (und seine Versicherung) beide Belege zusammenführen.
  if (args.rechnungsnummer) {
    teile.push(
      `Bereits beglichen durch Rechnung ${args.rechnungsnummer}` +
        (args.rechnungsdatum ? ` vom ${datum(args.rechnungsdatum)}` : "") +
        `. Dies ist keine Zahlungsaufforderung`
    )
  } else if (args.bezahltAm) {
    teile.push(
      `Bereits durch Vorauszahlung vom ${datum(args.bezahltAm)} beglichen. ` +
        `Dies ist keine Zahlungsaufforderung`
    )
  }

  teile.push(`Umsatzsteuerfrei gemäß § 4 Nr. 14a UStG`)
  teile.push(`Behandlungszeitraum: ${PROGRAMM.tage} Tage ab Programmstart`)
  return teile.join(". ") + "."
}
