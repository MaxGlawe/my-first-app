/**
 * PROJ-17: Trainer-Skript Generator (Premium)
 *
 * Generiert natürliche, fließende Trainer-Ansagen wie ein echter Personal Trainer.
 * ElevenLabs interpretiert Satzzeichen als natürliche Pausen:
 *   Komma = kurze Pause (~0.3s)
 *   Punkt = mittlere Pause (~0.5s)
 *   Absatz = lange Pause (~1s)
 *
 * KEINE "..." oder technisch wirkende Marker — nur echtes, gesprochenes Deutsch.
 *
 * Das Segment-System trennt Sprache von echten Timer-Pausen:
 *   { type: "speech" } → wird zu Audio generiert
 *   { type: "pause"  } → Player wartet X Sekunden still
 */

// ── Types ──────────────────────────────────────────────────────────────────────

interface ExerciseInput {
  name: string
  ausfuehrung: Array<{ nummer: number; beschreibung: string }> | null
  params: {
    saetze: number
    wiederholungen?: number | null
    dauer_sekunden?: number | null
    pause_sekunden: number
    anmerkung?: string | null
  }
}

export type TrainerSegment =
  | { type: "speech"; text: string }
  | { type: "pause"; seconds: number }
  | { type: "set-boundary"; completedSets: number }

/** Prefix für Pause-Marker in der URL-Liste des Audio-Players */
export const PAUSE_MARKER_PREFIX = "pause:"

// Geschätzte Dauer der Pause-Ansage in Sekunden (Lob + Tipp)
const ANNOUNCEMENT_DURATION = 7

// ── Hilfsfunktionen ────────────────────────────────────────────────────────────

function pick<T>(arr: T[], seed: number): T {
  return arr[Math.abs(seed) % arr.length]
}

function zahlWort(n: number): string {
  const w: Record<number, string> = {
    1: "eins", 2: "zwei", 3: "drei", 4: "vier", 5: "fünf",
    6: "sechs", 7: "sieben", 8: "acht", 9: "neun", 10: "zehn",
    11: "elf", 12: "zwölf", 13: "dreizehn", 14: "vierzehn", 15: "fünfzehn",
    16: "sechzehn", 17: "siebzehn", 18: "achtzehn", 19: "neunzehn", 20: "zwanzig",
    25: "fünfundzwanzig", 30: "dreißig", 40: "vierzig", 45: "fünfundvierzig",
    50: "fünfzig", 60: "sechzig", 90: "neunzig", 120: "hundertundzwanzig",
  }
  return w[n] ?? String(n)
}

function satzOrdinal(n: number): string {
  if (n === 1) return "Erster Satz"
  if (n === 2) return "Zweiter Satz"
  if (n === 3) return "Dritter Satz"
  if (n === 4) return "Vierter Satz"
  if (n === 5) return "Fünfter Satz"
  return `Satz ${n}`
}

// ── Halteübung: Countdown mit Motivation ───────────────────────────────────────

function halteCountdown(sekunden: number, satzNr: number): string {
  const zeilen: string[] = []

  zeilen.push("Und los.")
  zeilen.push("\n\n")
  zeilen.push("Halte die Position. Atme ruhig und gleichmäßig weiter.")
  zeilen.push("\n\n")

  if (sekunden >= 60) {
    zeilen.push(pick([
      "Konzentrier dich auf deine Körperspannung.",
      "Achte auf eine saubere Haltung.",
      "Der ganze Körper bleibt stabil.",
    ], satzNr))
    zeilen.push("\n\n")
    zeilen.push(`Noch ${zahlWort(Math.ceil(sekunden * 0.6))} Sekunden. Du machst das richtig gut.`)
    zeilen.push("\n\n")
    zeilen.push("Halbzeit! Bleib dran, du schaffst das.")
    zeilen.push("\n\n")
    zeilen.push("Noch zwanzig Sekunden. Das Ende ist in Sicht.")
    zeilen.push("\n\n")
    zeilen.push("Noch zehn Sekunden, fast geschafft!")
    zeilen.push("\n\n")
    zeilen.push("Fünf, vier, drei, zwei, eins.")
    zeilen.push("\n\n")
    zeilen.push("Und lösen! Sehr gut.")
  } else if (sekunden >= 30) {
    zeilen.push(pick([
      "Achte auf eine gleichmäßige Atmung.",
      "Bleib stabil, du machst das klasse.",
      "Schöne Haltung, genau so.",
    ], satzNr))
    zeilen.push("\n\n")
    zeilen.push("Halbzeit. Stark bleiben.")
    zeilen.push("\n\n")
    zeilen.push("Noch zehn Sekunden, gleich hast du es!")
    zeilen.push("\n\n")
    zeilen.push("Fünf, vier, drei, zwei, eins.")
    zeilen.push("\n\n")
    zeilen.push("Und lösen! Super gemacht.")
  } else if (sekunden >= 15) {
    zeilen.push("Gut so, halte die Spannung.")
    zeilen.push("\n\n")
    zeilen.push("Noch fünf Sekunden.")
    zeilen.push("\n\n")
    zeilen.push("Drei, zwei, eins.")
    zeilen.push("\n\n")
    zeilen.push("Und lösen!")
  } else {
    zeilen.push(`${zahlWort(sekunden)} Sekunden, halte durch.`)
    zeilen.push("\n\n")
    zeilen.push("Drei, zwei, eins, und lösen!")
  }

  return zeilen.join(" ")
}

// ── Wiederholungsübung: Mitzählen mit Motivation ───────────────────────────────

function repCounting(wdh: number, satzNr: number): string {
  const zeilen: string[] = []
  const halbzeit = Math.ceil(wdh / 2)

  zeilen.push("Und los.")
  zeilen.push("\n\n")

  for (let i = 1; i <= wdh; i++) {
    zeilen.push(zahlWort(i) + ".")
    // Absatz nach JEDER Zahl → ElevenLabs macht ~1s Pause (= Trainingstempo)
    zeilen.push("\n\n")

    if (i === halbzeit && wdh >= 6) {
      zeilen.push(pick([
        "Halbzeit, weiter so!",
        "Gute Halbzeit, saubere Technik!",
        "Die Hälfte ist geschafft!",
      ], satzNr))
      zeilen.push("\n\n")
    } else if (i === wdh - 2 && wdh >= 8) {
      zeilen.push("Noch zwei!")
      zeilen.push("\n\n")
    } else if (i === wdh - 1 && wdh >= 4) {
      zeilen.push("Und die letzte.")
      zeilen.push("\n\n")
    } else if (i % 5 === 0 && i !== wdh && i !== halbzeit && wdh > 10) {
      zeilen.push(pick(["Weiter so.", "Sauber.", "Genau richtig."], satzNr + i))
      zeilen.push("\n\n")
    }
  }

  zeilen.push(pick(["Und fertig!", "Geschafft!", "Satz fertig!"], satzNr))

  return zeilen.join(" ")
}

// ── Pause-Ansage (nur die Ansage, ohne "Mach dich bereit") ──────────────────

function pauseAnsageKurz(sekunden: number, satzNr: number): string {
  const praise = pick([
    "Sehr gut!",
    "Super gemacht!",
    "Stark!",
    "Klasse!",
    "Perfekt!",
  ], satzNr)

  const tip = pick([
    `Kurze Pause, ${zahlWort(sekunden)} Sekunden. Trink einen Schluck Wasser und atme durch.`,
    `${zahlWort(sekunden)} Sekunden Pause. Schüttel die Arme kurz aus und atme tief ein.`,
    `Pause, ${zahlWort(sekunden)} Sekunden. Locker bleiben und durchatmen.`,
    `${zahlWort(sekunden)} Sekunden Erholung. Trink was und sammle dich.`,
  ], satzNr)

  return praise + "\n\n" + tip
}

// ── Segment-Builder: Trainer-Skript mit echten Pausen ───────────────────────

/**
 * Baut ein Trainer-Skript als Segment-Array.
 * Speech-Segmente werden zu Audio, Pause-Segmente werden als echte
 * stille Timer vom Player eingehalten.
 *
 * Optimiert: Aufeinanderfolgende Sprachblöcke werden zusammengefasst,
 * sodass nur an den Pausenstellen neue Segmente entstehen (= weniger API-Calls).
 */
export function buildTrainerSegments(
  exercise: ExerciseInput,
  exerciseIndex?: number,
  totalExercises?: number
): TrainerSegment[] {
  const segments: TrainerSegment[] = []
  const { params } = exercise
  const isHold = !!params.dauer_sekunden && !params.wiederholungen
  const isRep = !!params.wiederholungen

  // Accumulator: sammelt Textblöcke bis zur nächsten Pause
  let speechAcc: string[] = []

  const addLine = (line: string) => {
    speechAcc.push(line)
  }

  const flushSpeech = () => {
    if (speechAcc.length > 0) {
      segments.push({ type: "speech", text: speechAcc.join("\n\n") })
      speechAcc = []
    }
  }

  const addPause = (seconds: number) => {
    flushSpeech()
    if (seconds > 0) {
      segments.push({ type: "pause", seconds })
    }
  }

  // ── Begrüßung / Übergang ─────────────────────────────────────────────

  if (exerciseIndex !== undefined && totalExercises !== undefined) {
    if (exerciseIndex === 0) {
      addLine("Alles klar, dann starten wir jetzt mit dem Training.")
    } else {
      addLine(pick([
        "Sehr gut, weiter geht es.",
        "Super, nächste Übung.",
        "Toll gemacht, weiter geht's.",
      ], exerciseIndex))
    }

    addLine(`Übung ${zahlWort(exerciseIndex + 1)} von ${zahlWort(totalExercises)}.`)
  }

  // ── Übungsname und Parameter ─────────────────────────────────────────

  addLine(exercise.name + ".")

  if (isHold) {
    addLine(
      `Wir machen ${zahlWort(params.saetze)} Sätze und halten jede Position ${zahlWort(params.dauer_sekunden!)} Sekunden lang.`
    )
  } else if (isRep) {
    addLine(
      `Wir machen ${zahlWort(params.saetze)} Sätze mit jeweils ${zahlWort(params.wiederholungen!)} Wiederholungen.`
    )
  } else {
    addLine(`Wir machen ${zahlWort(params.saetze)} Sätze.`)
  }

  if (params.pause_sekunden > 0 && params.saetze > 1) {
    addLine(`Zwischen den Sätzen hast du ${zahlWort(params.pause_sekunden)} Sekunden Pause.`)
  }

  // ── Ausführung erklären ──────────────────────────────────────────────

  if (exercise.ausfuehrung && exercise.ausfuehrung.length > 0) {
    addLine("Ich erkläre dir kurz die Ausführung.")

    for (const step of exercise.ausfuehrung) {
      addLine(step.beschreibung + ".")
    }
  }

  if (params.anmerkung) {
    addLine(`Achte besonders darauf: ${params.anmerkung}.`)
  }

  // ── Sätze durchführen ────────────────────────────────────────────────

  for (let s = 0; s < params.saetze; s++) {
    // Satz-Ansage
    if (params.saetze > 1) {
      if (s === params.saetze - 1) {
        addLine(pick([
          "Jetzt kommt der letzte Satz. Gib nochmal alles, du schaffst das!",
          "Letzter Satz! Zeig mir was du kannst!",
          "Ein letztes Mal, volle Konzentration!",
        ], s))
      } else {
        addLine(satzOrdinal(s + 1) + ".")
      }
    }

    if (s === 0 && exercise.ausfuehrung && exercise.ausfuehrung.length > 0) {
      addLine("Geh in die Ausgangsposition.")
    }

    // Countdown oder Mitzählen — als eigenes Segment (kürzerer Text = stabiles Tempo)
    flushSpeech()
    if (isHold && params.dauer_sekunden) {
      addLine(halteCountdown(params.dauer_sekunden, s))
    } else if (isRep && params.wiederholungen) {
      addLine(repCounting(params.wiederholungen, s))
    } else {
      addLine("Und los. Führe die Übung jetzt durch.")
      addLine("Und fertig!")
    }
    flushSpeech()

    // Mark set as completed (used by TTS controller to advance set indicator)
    segments.push({ type: "set-boundary", completedSets: s + 1 })

    // Pause zwischen Sätzen (nicht nach dem letzten)
    if (s < params.saetze - 1) {
      // Pause-Ansage (Lob + Tipp) → wird noch als Speech angehängt
      addLine(pauseAnsageKurz(params.pause_sekunden, s))

      // Echte stille Pause (Gesamtdauer minus geschätzte Sprechzeit)
      const realPause = Math.max(params.pause_sekunden - ANNOUNCEMENT_DURATION, 0)
      addPause(realPause)

      // Nach der Stille: "Mach dich bereit"
      if (params.pause_sekunden >= 15) {
        addLine("Mach dich bereit, gleich geht es weiter.")
      }
    }
  }

  // ── Abschluss ────────────────────────────────────────────────────────

  if (exerciseIndex !== undefined && totalExercises !== undefined) {
    if (exerciseIndex === totalExercises - 1) {
      addLine(
        "Das war die letzte Übung. Training abgeschlossen! " +
        "Richtig starke Leistung heute. Vergiss nicht, dich kurz zu dehnen und genug zu trinken."
      )
    } else {
      addLine("Übung geschafft. Kurz durchatmen, dann machen wir weiter.")
    }
  } else {
    addLine("Übung abgeschlossen, gut gemacht!")
  }

  flushSpeech()

  return segments
}

// ── Kompatibilität: Text-only Version ──────────────────────────────────────

/**
 * Gibt das Trainer-Skript als reinen Text zurück (ohne echte Pausen).
 * Für Preview/Debug oder wenn keine Timer-Pausen benötigt werden.
 */
export function buildTrainerScript(
  exercise: ExerciseInput,
  exerciseIndex?: number,
  totalExercises?: number
): string {
  return buildTrainerSegments(exercise, exerciseIndex, totalExercises)
    .filter((s): s is Extract<TrainerSegment, { type: "speech" }> => s.type === "speech")
    .map((s) => s.text)
    .join("\n\n")
}

/**
 * Baut Trainer-Segmente für einen ganzen Trainingsplan.
 */
export function buildFullSessionSegments(
  exercises: ExerciseInput[]
): TrainerSegment[][] {
  return exercises.map((ex, i) =>
    buildTrainerSegments(ex, i, exercises.length)
  )
}
