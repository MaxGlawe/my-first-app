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

function euro(n: number): string {
  return n.toLocaleString("de-DE", { style: "currency", currency: "EUR" })
}

/**
 * Der Wortlaut der Position A20.1 — an EINER Stelle.
 *
 * Er steht auf der Konsultationsrechnung, auf jedem Leistungsnachweis und im
 * Kostenvoranschlag. Dreimal derselbe Text an drei Stellen waere dreimal eine
 * Gelegenheit, ihn verschieden werden zu lassen; dieselbe Leistung darf auf
 * zwei Belegen nicht verschieden aussehen.
 *
 * Warum er so ausfuehrlich ist (entschieden am 07.10.2026):
 *
 *   — „Krankengymnastische Uebungsbehandlung" statt „Bewegungstherapie":
 *     die Bezeichnung, die ein Sachbearbeiter kennt.
 *
 *   — „in der Videosprechstunde" bleibt stehen. Es wegzulassen, damit es nach
 *     einer Behandlung vor Ort aussieht, waere eine falsche Angabe gegenueber
 *     der Versicherung.
 *
 *   — Die Analogie wird offengelegt UND begruendet. Ziffer 20.1 heisst im
 *     Katalog „Atemtherapeutische Behandlungsverfahren". Ohne den Zusatz
 *     gleicht der Sachbearbeiter ab, liest Atemtherapie, sieht Bewegungs-
 *     therapie — und lehnt ab. Die GebueH kennt fuer Bewegungstherapie
 *     nachweislich keine eigene Ziffer (im Katalog: null Treffer fuer
 *     Bewegung, Gymnastik, Uebungsbehandlung, Krankengymnastik).
 */
export function bewegungstherapieText(args: {
  datum: string
  /** Die erste Uebung in der Konsultation wird eigens benannt. */
  ersteUebung?: boolean
}): string {
  const was = args.ersteUebung
    ? "Krankengymnastische Übungsbehandlung als Einzelbehandlung: Anleitung und Korrektur der ersten Übung in der Videosprechstunde"
    : "Krankengymnastische Übungsbehandlung als Einzelbehandlung, angeleitet und korrigiert in der Videosprechstunde"

  // Die Begruendung der Analogie steht NICHT hier, sondern einmal als Fussnote
  // unter der Tabelle (`analogHinweis` im PDF). Bei „Intensiv" stehen im
  // ersten Monat fuenf dieser Positionen auf einem Blatt — fuenfmal derselbe
  // Erklaerblock ist Laerm, und gelesen wird er beim zweiten Mal ohnehin nicht.
  return `${was} (analog Ziff. 20.1) am ${args.datum}`
}

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
export function digitaleBetreuungGesamt(
  variante: ProgrammVariante,
  /**
   * Betrag einer bereits GESONDERT gestellten Konsultationsrechnung.
   *
   * Dann gehört die Konsultation nicht mehr in dieses Programm: Weder ihre
   * Ziffern auf den Leistungsnachweis noch ihr Betrag in den zu verteilenden
   * Preis. Beides zusammen ergibt wieder den Programmpreis — nur eben auf
   * zwei Belegen statt auf einem.
   */
  konsultationExtern = 0
): number {
  const v = VARIANTEN[variante]
  const konsultation =
    konsultationExtern > 0 ? 0 : SATZ.untersuchung + SATZ.beratung + SATZ.bewegungstherapie
  const plaene = SATZ.plan * 4 // Erstellung + drei Überarbeitungen
  const berichte = SATZ.bericht * 2 // Verlauf und Abschluss
  const sitzungen = SATZ.bewegungstherapie * v.calls
  return runde(v.preis - konsultationExtern - (konsultation + plaene + berichte + sitzungen))
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
  /**
   * Betrag einer bereits gesondert gestellten Konsultationsrechnung — also
   * der Fall „erst nur die Konsultation, später doch das Programm".
   *
   * Die drei Nachweise decken dann nur noch den Rest; die Konsultation steht
   * vollständig auf ihrer eigenen Rechnung.
   */
  konsultationExtern?: number
}): Monatsrechnung {
  const { variante, monat, bereitsBerechnet } = args
  const konsultationExtern = args.konsultationExtern ?? 0
  const preis = runde(VARIANTEN[variante].preis - konsultationExtern)

  // Wurde die Konsultation gesondert berechnet, darf sie hier unter keinen
  // Umständen noch einmal auftauchen. Das wird hier erzwungen und nicht dem
  // Aufrufer überlassen: Der Fehler wäre eine doppelt abgerechnete Leistung,
  // und die fällt erst auf, wenn die Versicherung zurückfragt.
  const ereignisse: Ereignisse =
    konsultationExtern > 0 ? { ...args.ereignisse, konsultation: null } : args.ereignisse
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
        beschreibung: bewegungstherapieText({ datum: datum(k.datum), ersteUebung: true }),
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
      beschreibung: bewegungstherapieText({ datum: datum(s.datum) }),
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
  const gesamtDigital = digitaleBetreuungGesamt(variante, konsultationExtern)
  const drittel = runde(gesamtDigital / 3)

  let digital: number
  let pauschale = 0
  let ueberschuss = 0
  /** Der Cent, der beim Dritteln uebrig bleibt. Wird auf dem Beleg benannt. */
  let rundungsausgleich = 0

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

      // Ein Rundungsrest von einem Cent ist keine Pauschale, sondern ein
      // Rundungsrest. Als eigene Zeile „Programmpauschale gemäß
      // Honorarvereinbarung — 0,01 €" sieht er auf einem Beleg, den jemand bei
      // seiner Versicherung einreicht, nach einem Fehler aus.
      //
      // Er wandert deshalb in die digitale Betreuung — aber NICHT stillschweigend:
      // 85,00 € lassen sich nicht durch drei teilen, zweimal 28,33 € und einmal
      // 28,34 € ist die einzige ehrliche Aufteilung. Steht der Cent unkommentiert
      // da, rechnet der Leser 3 × 28,33 = 84,99 und kommt auf 298,99 statt 299,00
      // — genau das ist am 01.10.2026 passiert, und zwar dem, der es gebaut hat.
      // Ein Cent, den niemand findet, ist schlimmer als eine hässliche Zeile.
      if (pauschale > 0 && pauschale < 1) {
        digital = runde(digital + pauschale)
        rundungsausgleich = pauschale
        pauschale = 0
      }
    } else {
      digital = 0
      ueberschuss = runde(-rest)
    }
  }

  if (digital > 0) {
    positionen.push({
      ziffer: null,
      beschreibung:
        `Digitale Betreuung und Verlaufsbegleitung (Chat, tägliche Check-ins, Auswertung), ` +
        `Programmabschnitt ${monat} von 3` +
        // Warum es den Ausgleich gibt, sagt der Vermerk unter der Tabelle
        // („einer von drei Abschnitten, die zusammen X ergeben"). Hier steht
        // nur, dass dieser eine Cent kein Zufall ist.
        (rundungsausgleich > 0
          ? ` — einschließlich Rundungsausgleich von ${euro(rundungsausgleich)}`
          : ""),
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
  /** Ihr Gesamtbetrag — damit der Leser die drei Abschnitte pruefen kann. */
  rechnungsbetrag?: number | null
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
        (args.rechnungsbetrag ? ` über ${euro(args.rechnungsbetrag)}` : "") +
        `. Dies ist keine Zahlungsaufforderung`
    )
    // Der Satz, der das Nachrechnen ueberfluessig macht: Wer drei Blaetter in
    // der Hand haelt, soll sehen, worauf sie sich zusammen belaufen muessen.
    if (args.rechnungsbetrag) {
      teile.push(
        `Dieser Nachweis ist einer von drei Abschnitten, die zusammen ` +
          `${euro(args.rechnungsbetrag)} ergeben`
      )
    }
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
