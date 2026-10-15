/**
 * Zwei Quoten vergleichen — und sagen, ob der Unterschied etwas bedeutet.
 *
 * Der Anlass ist eine Frage, die bei jeder Änderung kommt: „Um 16 Uhr habe
 * ich etwas umgestellt — sieht man das?" Ohne Rechnung lautet die Antwort
 * immer ja, denn zwei Zeitfenster haben nie dieselbe Quote. Bei 20
 * Sitzungen ist ein Sprung von 5 % auf 10 % ein einziger zusätzlicher
 * Mensch.
 *
 * Deshalb liefert diese Datei zu jedem Vergleich drei Dinge:
 *
 *   1. ein Intervall je Quote (Wilson) — die Spanne, in der der wahre Wert
 *      plausibel liegt,
 *   2. ein Intervall für den UNTERSCHIED (Newcombe) — enthält es die Null,
 *      ist der Unterschied von Zufall nicht zu trennen,
 *   3. die Schwelle: Welcher Unterschied wäre bei dieser Datenmenge
 *      überhaupt erkennbar gewesen?
 *
 * Punkt 3 ist der wichtigste, weil er vor dem häufigsten Fehlschluss
 * schützt. „Kein Unterschied messbar" heisst bei 20 Sitzungen nicht, dass
 * die Änderung nichts gebracht hat — es heisst, dass man mit 20 Sitzungen
 * nichts sehen kann. Das sind zwei verschiedene Aussagen, und nur die
 * zweite ist hier belegt.
 *
 * Wilson statt der Lehrbuchformel (p ± z·√(p(1−p)/n)), weil die bei
 * kleinen Zahlen und Quoten nahe null unbrauchbar wird: Bei 0 von 20
 * ergäbe sie die Spanne 0 bis 0 — also die Behauptung, es sei sicher
 * unmöglich.
 */

/** 95 % — zweiseitig. */
const Z = 1.959964

export interface Spanne {
  /** Beobachteter Anteil in Prozent. */
  anteil: number
  /** Untere und obere Grenze in Prozent. */
  unten: number
  oben: number
}

const auf1 = (x: number) => Math.round(x * 1000) / 10

/**
 * Wilson-Intervall für k von n.
 *
 * `n = 0` ergibt null: Über etwas, das nicht beobachtet wurde, ist keine
 * Aussage möglich — und eine Spanne „0 bis 0" wäre genau die falsche.
 */
export function spanne(k: number, n: number): Spanne | null {
  if (n <= 0) return null
  const p = k / n
  const nenner = n + Z * Z
  const mitte = (k + (Z * Z) / 2) / nenner
  const halb = (Z / nenner) * Math.sqrt((k * (n - k)) / n + (Z * Z) / 4)
  return {
    anteil: auf1(p),
    unten: auf1(Math.max(0, mitte - halb)),
    oben: auf1(Math.min(1, mitte + halb)),
  }
}

export interface Vergleich {
  davor: Spanne | null
  danach: Spanne | null
  /** Unterschied in Prozentpunkten, danach minus davor. */
  unterschied: number | null
  /** 95-%-Spanne des Unterschieds in Prozentpunkten (Newcombe). */
  unterschied_unten: number | null
  unterschied_oben: number | null
  /**
   * Ist der Unterschied von Zufall zu trennen? Nur dann, wenn die Spanne
   * des Unterschieds die Null nicht enthält.
   */
  erkennbar: boolean
  /**
   * Die Schwelle: Ab welchem Unterschied (in Prozentpunkten) hätte man bei
   * DIESER Datenmenge überhaupt etwas sehen können.
   */
  schwelle: number | null
  /** Ein Satz, der das Ergebnis in Worten sagt. */
  urteil: string
}

/**
 * Zwei Quoten gegeneinander. `k` ist jeweils die Zahl der Treffer, `n` die
 * Grundgesamtheit des Fensters.
 */
export function vergleicheAnteile(
  kDavor: number,
  nDavor: number,
  kDanach: number,
  nDanach: number
): Vergleich {
  const a = spanne(kDavor, nDavor)
  const b = spanne(kDanach, nDanach)

  if (!a || !b) {
    return {
      davor: a,
      danach: b,
      unterschied: null,
      unterschied_unten: null,
      unterschied_oben: null,
      erkennbar: false,
      schwelle: null,
      urteil: "Zu wenig Daten für einen Vergleich — ein Fenster ist leer.",
    }
  }

  const pA = kDavor / nDavor
  const pB = kDanach / nDanach
  const unterschied = auf1(pB - pA)

  // Newcombe: die Spanne des Unterschieds aus den beiden Wilson-Spannen.
  const unten = auf1(
    pB - pA - Math.sqrt(Math.pow(pB - b.unten / 100, 2) + Math.pow(a.oben / 100 - pA, 2))
  )
  const oben = auf1(
    pB - pA + Math.sqrt(Math.pow(b.oben / 100 - pB, 2) + Math.pow(pA - a.unten / 100, 2))
  )

  // Die Schwelle: der kleinste Unterschied, der bei diesen Fenstergrössen
  // noch von Zufall zu trennen wäre.
  const gepoolt = (kDavor + kDanach) / (nDavor + nDanach)
  const schwelle = auf1(
    Z * Math.sqrt(gepoolt * (1 - gepoolt) * (1 / nDavor + 1 / nDanach))
  )

  const erkennbar = unten > 0 || oben < 0

  let urteil: string
  if (erkennbar) {
    urteil = `${unterschied > 0 ? "Besser" : "Schlechter"} — der Unterschied von ${Math.abs(unterschied)} Prozentpunkten liegt ausserhalb des Zufalls (Spanne ${unten} bis ${oben}).`
  } else if (kDavor === 0 && kDanach === 0) {
    // Null gegen null. Ohne diesen Fall stand hier „Hinweis, kein Beleg: 0
    // Prozentpunkte weniger" — ein Satz, der Bewegung behauptet, wo keine
    // Zahl war. Aufgefallen beim Durchlesen des Berichts am 15.10.2026.
    urteil = `In beiden Fenstern niemand — bis ${b.oben} % wäre es trotzdem unauffällig geblieben.`
  } else if (unterschied === 0) {
    urteil = "Unverändert — in beiden Fenstern dieselbe Quote."
  } else if (schwelle > 0 && Math.abs(unterschied) >= schwelle) {
    urteil = `Hinweis, kein Beleg: ${Math.abs(unterschied)} Prozentpunkte ${unterschied > 0 ? "mehr" : "weniger"}, aber die Spanne (${unten} bis ${oben}) schliesst die Null ein.`
  } else {
    urteil = `Nicht zu erkennen. Bei dieser Datenmenge wäre erst ein Unterschied ab etwa ${schwelle} Prozentpunkten sichtbar — gemessen sind ${Math.abs(unterschied)}.`
  }

  return {
    davor: a,
    danach: b,
    unterschied,
    unterschied_unten: unten,
    unterschied_oben: oben,
    erkennbar,
    schwelle,
    urteil,
  }
}

/**
 * Für 80 % Aussicht, einen vorhandenen Unterschied auch zu finden.
 *
 * Ohne diesen Term stünde in der Rechnung nur die Schwelle, ab der ein
 * Unterschied signifikant WÄRE — und die erreicht man im Schnitt in der
 * Hälfte der Fälle. Eine Datenmenge, bei der man eine echte Verbesserung
 * mit 50 % Wahrscheinlichkeit verpasst, ist keine Antwort auf „wie lange
 * muss ich warten".
 *
 * Aufgefallen beim Gegencheck am 15.10.2026: Die erste Fassung nannte 377
 * Sitzungen je Fenster für eine Verdopplung von 2 % auf 4 % — bei genau
 * dieser Menge war der Unterschied dann nicht erkennbar. Die Funktion hatte
 * ihr eigenes Versprechen gebrochen.
 */
const Z_KRAFT = 0.8416

/**
 * Wie viele Sitzungen braucht ein Fenster, um einen Unterschied von
 * `punkte` Prozentpunkten zu finden? Beantwortet die Folgefrage, die nach
 * jedem „nicht zu erkennen" kommt: „Wie lange muss ich warten?"
 *
 * Gerechnet für zwei gleich grosse Fenster, Ausgangsquote `anteil` (0–1),
 * und für 80 % Trefferwahrscheinlichkeit — also: in vier von fünf Fällen
 * würde man den Unterschied dann auch sehen.
 */
export function noetigeSitzungen(anteil: number, punkte: number): number {
  if (punkte <= 0) return Infinity
  const d = punkte / 100
  const p1 = Math.min(Math.max(anteil, 0.001), 0.998)
  const p2 = Math.min(p1 + d, 0.999)
  const streuung = p1 * (1 - p1) + p2 * (1 - p2)
  return Math.ceil((Math.pow(Z + Z_KRAFT, 2) * streuung) / (d * d))
}
