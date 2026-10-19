/**
 * Die Einschätzung am Ende des Checks — aus Bausteinen zusammengesetzt.
 *
 * Hier wird NICHTS gerechnet, was nach Diagnose aussieht: kein Punktwert,
 * keine Risikostufe, keine Vermutung über eine Ursache. Die Einschätzung
 * ist eine Einordnung dessen, was jemand selbst angegeben hat, in Sätze,
 * die vorher abgestimmt wurden. Das ist der Unterschied zwischen „wir
 * sagen dir, was du hast" und „wir sagen dir, was ein sinnvoller nächster
 * Schritt wäre" — und nur das Zweite darf eine Website.
 *
 * ── Zwei Wege, und der erste schliesst den zweiten aus ──────────────────
 *
 * Bei einem Warnzeichen (Sicherheitsfrage) gibt es keine Einschätzung,
 * kein Angebot und keinen Buchungsknopf, sondern den Hinweis auf
 * ärztliche Abklärung. Das ist keine Vorsicht aus Höflichkeit: Wer über
 * Taubheit, Blasenstörung oder nächtliche Dauerschmerzen berichtet,
 * gehört untersucht und nicht in ein Videogespräch über Übungen.
 *
 * ── Warum die Texte hier stehen und nicht in der Komponente ─────────────
 *
 * Weil sie wörtlich abgestimmt sind und sich so ohne Browser prüfen
 * lassen: Die Tests vergleichen Zeichen für Zeichen und suchen nach
 * Wörtern, die auf einer Gesundheitsseite nicht vorkommen dürfen. In JSX
 * verteilt wäre beides nicht zu machen.
 */

import { FLAGGE_JA, type Antworten } from "./fragen"

/** Begriffe, die in keiner Einschätzung stehen dürfen. */
export const VERBOTEN = [
  "heilen",
  "heilt",
  "Heilung",
  "schmerzfrei",
  "garantiert",
  "Garantie",
  "Diagnose",
  "diagnostiz",
]

/** Baustein 1: Überschrift und erster Absatz, nach Dauer. */
const NACH_DAUER: Record<string, { ueberschrift: string; text: string }> = {
  "Seit ein paar Tagen": {
    ueberschrift: "Gut, dass du früh hinschaust.",
    text: "Frische Beschwerden lassen oft von selbst nach. Wenn sie bleiben oder dich unsicher machen, hilft eine fachliche Einschätzung. Dann weißt du, was du tun kannst und was du besser lässt.",
  },
  "2 bis 6 Wochen": {
    ueberschrift: "Jetzt ist ein guter Zeitpunkt, aktiv zu werden.",
    text: "Wenn Beschwerden nach ein paar Wochen nicht von selbst verschwinden, lohnt sich ein klarer Plan statt weiter abzuwarten.",
  },
  "6 Wochen bis 3 Monate": {
    ueberschrift: "Zeit für einen Plan, der zu dir passt.",
    text: "Wer schon länger mit Beschwerden lebt, braucht meist keinen weiteren Tipp aus dem Internet, sondern einen Plan für den eigenen Alltag und jemanden, der dranbleibt.",
  },
  "Länger als 3 Monate": {
    ueberschrift: "Bei länger bestehenden Beschwerden zählt vor allem eins: dranbleiben.",
    text: "Viele haben schon einiges ausprobiert. Was oft fehlt, ist jemand, der über Wochen begleitet, nachjustiert und nachfragt. Genau dafür ist Praxis OS gedacht.",
  },
}

/** Baustein 2: Absatz zur grössten Hürde. */
const NACH_HUERDE: Record<string, string> = {
  "Ich bekomme keinen Termin":
    "Du musst nicht auf einen freien Praxistermin warten. Das Kennenlernen ist meist schon in den nächsten Tagen möglich, und danach startest du direkt.",
  "Feste Termine passen nicht in meinen Alltag":
    "Deine Übungen machst du, wann es dir passt. Videotermine legen wir in Zeiten, die zu deinem Alltag passen.",
  "Allein üben klappt bei mir nicht":
    "Allein üben hält bei vielen nicht lange. Bei Praxis OS siehst du deine Fortschritte, und Max fragt nach, wenn es stockt. Fragen beantwortet er im Chat innerhalb von 24 Stunden.",
  "Ich weiß nicht, was das Richtige ist":
    "Du bekommst einen Plan, der auf deine Situation abgestimmt ist, statt Übungen von der Stange. Was du tust, warum und wie viel, besprechen wir gemeinsam.",
}

/** Baustein 3: Satz zur besten Tageszeit. */
const NACH_ZEIT: Record<string, string> = {
  Morgens:
    "Deine Übungen dauern meist 10 bis 15 Minuten und passen gut vor den Start in den Tag.",
  Mittags: "Deine Übungen dauern meist 10 bis 15 Minuten und passen gut in die Mittagspause.",
  Abends: "Deine Übungen dauern meist 10 bis 15 Minuten und passen gut in den Abend.",
  "Ganz unterschiedlich":
    "Deine Übungen dauern meist 10 bis 15 Minuten. Du machst sie, wann es gerade passt.",
}

/** Baustein 4: nur bei starker Einschränkung. */
export const ALLTAG_STARK = "Stark, es bestimmt meinen Tag"
const BEI_STARKER_EINSCHRAENKUNG =
  "Weil dich die Beschwerden stark einschränken, schauen wir uns im Kennenlernen genau an, ob eine Betreuung von zu Hause jetzt der richtige Weg ist oder ob du besser zuerst in die Praxis kommst."

/** Baustein 5: steht immer am Ende. */
const SCHLUSSSATZ =
  "Nach deinen Angaben spricht nichts gegen eine Betreuung von zu Hause. Ob sie wirklich zu dir passt, klären wir gemeinsam im Kennenlernen."

/** Der Sicherheits-Stopp. */
export const STOPP = {
  ueberschrift: "Bitte lass das zuerst ärztlich anschauen",
  absaetze: [
    "Bei dem, was du angegeben hast, ist eine Betreuung von zu Hause gerade nicht der richtige erste Schritt. Wende dich an deine Hausarztpraxis oder bei akuten Beschwerden an den ärztlichen Bereitschaftsdienst unter 116 117. In einem Notfall wähle die 112.",
    "Wenn das geklärt ist, bist du bei uns jederzeit willkommen.",
  ],
} as const

export interface Ergebnis {
  /** Warnzeichen angegeben: kein Angebot, kein Buchungsknopf. */
  stopp: boolean
  /** Der Bereich als Merkmal über der Einschätzung. */
  bereich: string | null
  ueberschrift: string
  absaetze: string[]
}

/**
 * Die Einschätzung zu einem Satz Antworten.
 *
 * Fehlende Antworten lassen ihren Baustein einfach aus, statt eine Lücke
 * zu erfinden: Der Check ist zwar nur vollständig zu beenden, aber ein
 * halber Datensatz (zurück-getippt, Seite neu geladen) darf keine Sätze
 * erzeugen, die niemand abgestimmt hat.
 */
export function baueErgebnis(antworten: Antworten): Ergebnis {
  if (antworten.flags === FLAGGE_JA) {
    return {
      stopp: true,
      bereich: null,
      ueberschrift: STOPP.ueberschrift,
      absaetze: [...STOPP.absaetze],
    }
  }

  const dauer = antworten.dauer ? NACH_DAUER[antworten.dauer] : undefined
  const absaetze: string[] = []

  if (dauer) absaetze.push(dauer.text)
  if (antworten.huerde && NACH_HUERDE[antworten.huerde]) {
    absaetze.push(NACH_HUERDE[antworten.huerde])
  }
  if (antworten.zeit && NACH_ZEIT[antworten.zeit]) {
    absaetze.push(NACH_ZEIT[antworten.zeit])
  }
  if (antworten.alltag === ALLTAG_STARK) absaetze.push(BEI_STARKER_EINSCHRAENKUNG)
  absaetze.push(SCHLUSSSATZ)

  return {
    stopp: false,
    bereich: antworten.ort ?? null,
    // Ohne Dauer-Angabe bleibt die Überschrift neutral — erfunden wird keine.
    ueberschrift: dauer?.ueberschrift ?? "Deine Einschätzung",
    absaetze,
  }
}
