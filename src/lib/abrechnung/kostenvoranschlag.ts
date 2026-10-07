/**
 * PROJ-29 — Die Positionen eines Kostenvoranschlags.
 *
 * Der Unterschied zur Rechnung ist nicht kosmetisch, sondern inhaltlich:
 *
 *   — KEINE DATEN. Auf einer Rechnung trägt jede Position den Tag, an dem die
 *     Leistung stattfand. Hier hat noch nichts stattgefunden. Ein Datum wäre
 *     eine Behauptung über etwas, das es nicht gibt.
 *
 *   — ZUSAMMENGEFASST. Acht Video-Sitzungen stehen als „8 × 31,00 €" in einer
 *     Zeile, nicht achtmal einzeln. Wer prüft, ob er die Kosten übernimmt,
 *     will den Umfang sehen, nicht einen Kalender.
 *
 * Die Beträge stammen aus denselben Konstanten wie die spätere Abrechnung.
 * Damit kann der Kostenvoranschlag nicht von dem abweichen, was am Ende
 * wirklich auf den Belegen steht — und das ist der einzige Grund, warum eine
 * Versicherung ihm glauben soll.
 */

import { SATZ, type Position } from "@/lib/abrechnung/programm-rechnung"
import { PROGRAMM, VARIANTEN, type ProgrammVariante } from "@/lib/programm"

export type KvVariante = ProgrammVariante | "konsultation"

export const KV_VARIANTEN: { id: KvVariante; name: string; preis: number }[] = [
  { id: "konsultation", name: "Videokonsultation (einzeln)", preis: PROGRAMM.konsultation },
  { id: "begleitet", name: VARIANTEN.begleitet.name, preis: VARIANTEN.begleitet.preis },
  { id: "intensiv", name: VARIANTEN.intensiv.name, preis: VARIANTEN.intensiv.preis },
]

function runde(n: number): number {
  return Math.round(n * 100) / 100
}

/** Die drei Positionen der Konsultation — immer gleich, egal in welchem Paket. */
function konsultationsPositionen(): Position[] {
  return [
    {
      ziffer: "1",
      beschreibung:
        "Eingehende, das gewöhnliche Maß übersteigende Untersuchung in der Videosprechstunde",
      anzahl: 1,
      einzelpreis: SATZ.untersuchung,
    },
    {
      ziffer: "A20.1",
      beschreibung:
        "Krankengymnastische Übungsbehandlung als Einzelbehandlung: Anleitung und Korrektur der ersten Übung in der Videosprechstunde (analog Ziff. 20.1)",
      anzahl: 1,
      einzelpreis: SATZ.bewegungstherapie,
    },
    {
      ziffer: "5",
      beschreibung: "Beratung, ggf. einschließlich kurzer Untersuchung, in der Videosprechstunde",
      anzahl: 1,
      einzelpreis: SATZ.beratung,
    },
  ]
}

export interface KvAufstellung {
  positionen: Position[]
  summe: number
  /** Stimmt die Summe mit dem Listenpreis überein? Sonst stimmt etwas nicht. */
  listenpreis: number
}

/**
 * Baut die geplante Aufstellung einer Variante.
 *
 * Die Zahlen sind dieselben, aus denen sich später die drei Leistungsnachweise
 * speisen: Konsultation, vier Pläne (Erstellung plus drei Überarbeitungen),
 * zwei Berichte, die Sitzungen nach Taktung — und als Ausgleich die digitale
 * Betreuung, die den Rest zum Programmpreis trägt.
 */
export function kostenvoranschlagAufstellung(variante: KvVariante): KvAufstellung {
  if (variante === "konsultation") {
    const positionen = konsultationsPositionen()
    return {
      positionen,
      summe: runde(positionen.reduce((s, p) => s + p.anzahl * p.einzelpreis, 0)),
      listenpreis: PROGRAMM.konsultation,
    }
  }

  const v = VARIANTEN[variante]
  const positionen: Position[] = [...konsultationsPositionen()]

  positionen.push({
    ziffer: "A11.3",
    beschreibung:
      "Individueller schriftlicher Übungs- und Therapieplan: Erstellung sowie drei Überarbeitungen im Behandlungsverlauf (analog Ziff. 11.3)",
    anzahl: 4,
    einzelpreis: SATZ.plan,
  })

  if (v.calls > 0) {
    positionen.push({
      ziffer: "A20.1",
      beschreibung:
        "Krankengymnastische Übungsbehandlung als Einzelbehandlung, angeleitet und korrigiert in der Videosprechstunde (analog Ziff. 20.1)",
      anzahl: v.calls,
      einzelpreis: SATZ.bewegungstherapie,
    })
  }

  positionen.push({
    ziffer: "11.2",
    beschreibung: "Ausführlicher Krankheitsbericht: Verlaufs- und Abschlussbericht",
    anzahl: 2,
    einzelpreis: SATZ.bericht,
  })

  // Der Ausgleichsposten: Programmpreis minus alles, was als Einzelleistung
  // geplant ist. Wird nicht von Hand gepflegt, sonst steht er irgendwann im
  // Widerspruch zum Preis.
  const einzelleistungen = runde(positionen.reduce((s, p) => s + p.anzahl * p.einzelpreis, 0))
  const digital = runde(v.preis - einzelleistungen)

  if (digital > 0) {
    positionen.push({
      ziffer: null,
      beschreibung: `Digitale Betreuung und Verlaufsbegleitung über ${PROGRAMM.tage} Tage (persönlicher Chat, tägliche Check-ins, Auswertung)`,
      anzahl: 1,
      einzelpreis: digital,
    })
  }

  return {
    positionen,
    summe: runde(positionen.reduce((s, p) => s + p.anzahl * p.einzelpreis, 0)),
    listenpreis: v.preis,
  }
}
