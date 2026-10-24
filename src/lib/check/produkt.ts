/**
 * Was Praxis OS ist und kostet — so, wie es auf /check steht.
 *
 * Seite UND Ergebnis-Karte brauchen dieselben Preise und Leistungen. Die
 * Zahlen kommen aus `lib/programm`, also aus derselben Quelle wie Angebot,
 * Vertrag und Rechnung: Ändert sich dort ein Preis, steht auf der Seite
 * nie ein anderer als im Vertrag.
 *
 * Keine Ratenbeträge (die legt Klarna fest) und keine Preise für eine
 * Weiterbetreuung nach den 90 Tagen — beides wird individuell vereinbart.
 */

import { PROGRAMM, VARIANTEN } from "@/lib/programm"

const B = VARIANTEN.begleitet
const I = VARIANTEN.intensiv

export const TAGE = PROGRAMM.tage
export const PREIS_AB = B.preis

/** Die vier Bestandteile, die beide Varianten haben. */
export const LEISTUNGEN = [
  {
    titel: "Ausführlicher Erstbefund per Video",
    text: "Zum Start schaut Max sich deine Beschwerden genau an und klärt, ob eine Betreuung von zu Hause für dich passt.",
  },
  {
    titel: "Dein persönlicher Plan",
    text: "Kurze Übungen, die in deinen Alltag passen. Jede Übung ist in der App mit Video erklärt.",
  },
  {
    titel: "Chat mit Max",
    text: `Du hast eine Frage oder es läuft nicht rund? Max antwortet innerhalb von ${PROGRAMM.chatAntwortStunden} Stunden.`,
  },
  {
    titel: "Kurzer täglicher Check-in",
    text: "Du gibst an, wie es dir geht. So sieht Max früh, wann dein Plan angepasst werden sollte.",
  },
] as const

export const PAKETE = [
  {
    id: B.id,
    name: B.name,
    preis: B.preis,
    calls: B.calls,
    label: null as string | null,
    unterzeile: "Für alle, die selbstständig üben und trotzdem jemanden an ihrer Seite wollen.",
    punkte: [
      "Erstbefund per Video",
      "Persönlicher Übungsplan in der App",
      `Chat mit Max, Antwort innerhalb von ${PROGRAMM.chatAntwortStunden} Stunden`,
      "Täglicher Check-in und Anpassung deines Plans",
    ],
  },
  {
    id: I.id,
    name: I.name,
    preis: I.preis,
    calls: I.calls,
    label: I.label ?? null,
    unterzeile: "Für alle, die regelmäßig persönlich mit Max sprechen möchten.",
    punkte: [
      `Alles aus „${B.name}“`,
      `Zusätzlich ${I.calls} Videotermine mit Max: in den ersten 4 Wochen wöchentlich, danach seltener`,
    ],
  },
] as const

/** Steht unter den Preisen — auf der Seite und im Ergebnis. */
export const ZAHLUNG = "Ratenzahlung mit Klarna möglich."
export const ERST_NACH_KENNENLERNEN =
  "Bezahlt wird erst, wenn du nach dem kostenlosen Kennenlernen starten möchtest."
export const ERSTATTUNG =
  "Du erhältst eine Heilpraktiker-Rechnung. Ob deine private Krankenversicherung, Beihilfe oder Zusatzversicherung etwas erstattet, hängt von deinem Vertrag ab."
