/**
 * Die Auswertung als Text — zum Mitnehmen.
 *
 * Das Dashboard zeigt alles, aber es zeigt es nur dort. Wer die Zahlen
 * woanders besprechen will (mit Claude, mit einem Berater, in einer Notiz),
 * hatte bisher nur den Screenshot — und ein Screenshot ist für eine
 * Rückfrage wertlos: Man kann ihn nicht durchsuchen, nicht nachrechnen, und
 * die Zählregel steht nicht drin.
 *
 * Diese Datei erzeugt denselben Stand als Markdown. Drei Entscheidungen,
 * die sie trägt:
 *
 *   1. ZÄHLREGELN STEHEN DABEI. Eine Zahl ohne ihre Definition ist in einem
 *      fremden Zusammenhang keine Zahl, sondern eine Behauptung — und wer
 *      sie liest, rät sich eine Definition zusammen. Deshalb steht unter
 *      jeder Stufe, was sie zählt.
 *
 *   2. KEINE PERSONENBEZOGENEN DATEN. Nur Summen und Quoten, keine
 *      Sitzungskennungen, keine Adressen, keine Namen, kein einzelner
 *      Termin. Der Bericht darf das Haus verlassen, ohne dass jemand erst
 *      Art. 6 DSGVO prüfen muss — und genau das steht auch oben drin.
 *
 *   3. GRENZEN WERDEN MITGESCHRIEBEN. Verworfene Sitzungen, ausgeschlossene
 *      Testbesuche, der Angebotswechsel, der Messbeginn der Abschnitte. Ein
 *      Leser, der diese vier Dinge nicht kennt, zieht aus denselben Zahlen
 *      falsche Schlüsse — am ehesten den, die Startseite sei eingebrochen.
 */

/**
 * Was unter einer Trichterstufe wirklich gezählt wird.
 *
 * Anlass (13.10.2026): Nach einer Korrektur sanken 30-Tage-Werte, obwohl
 * sie nur steigen können. Der Grund war eine Zählung je SITZUNG statt je
 * Klick — richtig, aber nicht erkennbar. Eine Kennzahl, deren Definition
 * man nicht ablesen kann, ist keine Kennzahl.
 *
 * Steht hier und nicht im Dashboard, weil beide sie brauchen: die Ansicht
 * unter der Stufe und der Bericht in der Datei. Zwei Fassungen desselben
 * Satzes würden auseinanderlaufen, und dann widerspricht der Export dem
 * Bildschirm.
 */
export const ZAEHLREGEL: Record<string, string> = {
  Besucher: "Je Sitzung einmal. Eine Sitzung endet, wenn der Browser-Tab geschlossen wird.",
  Geblieben: "Je Sitzung einmal, auch bei mehrfachem Scrollen.",
  "Preis gesehen":
    "Je Sitzung einmal — nicht je Aufruf des Preisabschnitts. Wer dreimal hoch- und runterscrollt, zählt einmal.",
  "Kennenlernen angeklickt":
    "Je Sitzung einmal — nicht je Klick. Wer zweimal auf „buchen“ tippt, zählt einmal. Enthält auch die Klicks von vor dem 15.10.2026, als der Einstieg noch „Konsultation“ hiess und 69 € kostete.",
  "Termin gebucht": "Termine aus dem Buchungskalender, nicht aus der Website-Messung.",
}

interface Zeile {
  name: string
  sitzungen: number
  geblieben: number
  preis: number
  klicks: number
  bleiberate: number
  klickrate: number
}

interface BannerZeile {
  name: string
  gezeigt: number
  akzeptiert: number
  abgelehnt: number
  ohne_auswahl: number
  zustimmungsrate: number
}

export interface BerichtDaten {
  zeitraum: { tage: number; seit: string; frei: boolean; tests_sichtbar: boolean }
  umstellung_kennenlernen: string
  verworfene_sitzungen: number
  gesamt: number
  intern_ausgeschlossen: number
  trichter: { stufe: string; anzahl: number; anteil: number; hinweis: string }[]
  leitern: {
    titel: string
    pfad: string
    sitzungen: number
    klicks: number
    gemessen: boolean
    sprossen: { titel: string; erreicht: number; anteil: number; haltequote: number | null }[]
  }[]
  absprung: { pfad: string; enden: number; aufrufe: number; rate: number }[]
  einstieg: {
    pfad: string
    sitzungen: number
    geblieben: number
    klicks: number
    bleiberate: number
  }[]
  quellen: Zeile[]
  kampagnen: Zeile[]
  anzeigen: Zeile[]
  geraete: Zeile[]
  browser: Zeile[]
  in_app_sitzungen: number
  lesetiefe: { marke: number; anzahl: number }[] | null
  aktivzeit: { marke: number; anzahl: number }[] | null
  nach_klick: {
    klicks: number
    verlassen: number
    geblieben: number
    unbekannt: number
    median_ms: number | null
    schnell: number
  }
  banner: { gezeigt: number; akzeptiert: number; abgelehnt: number; ohne_auswahl: number }
  banner_nach_seite: BannerZeile[]
  banner_nach_anzeige: BannerZeile[]
  buchungen_nach_quelle: { quelle: string; anzahl: number }[]
  buchungen_nach_anzeige: { anzeige: string; anzahl: number }[]
  buchungen_nach_cta: { cta: string; anzahl: number }[]
  buchungen_ohne_herkunft: number
  seitenProSitzung: { eine: number; zweiBisVier: number; fuenfPlus: number }
}

const datum = (iso: string) =>
  new Date(iso).toLocaleString("de-DE", { dateStyle: "short", timeStyle: "short" })

/** Eine Markdown-Tabelle. Leere Daten ergeben einen Satz, keine leere Tabelle. */
function tabelle(
  kopf: string[],
  zeilen: (string | number)[][],
  leer = "Keine Angaben im Zeitraum."
): string {
  if (zeilen.length === 0) return `_${leer}_`
  const trenner = kopf.map((_, i) => (i === 0 ? "---" : "---:"))
  return [
    `| ${kopf.join(" | ")} |`,
    `| ${trenner.join(" | ")} |`,
    ...zeilen.map((z) => `| ${z.join(" | ")} |`),
  ].join("\n")
}

const quellenZeilen = (zeilen: Zeile[]) =>
  zeilen.map((q) => [
    q.name,
    q.sitzungen,
    `${q.geblieben} (${q.bleiberate} %)`,
    q.preis,
    `${q.klicks} (${q.klickrate} %)`,
  ])

const bannerZeilen = (zeilen: BannerZeile[]) =>
  zeilen.map((r) => [
    r.name,
    r.gezeigt,
    r.akzeptiert,
    r.abgelehnt,
    r.ohne_auswahl,
    `${r.zustimmungsrate} %`,
  ])

export function berichtAlsText(d: BerichtDaten): string {
  const z: string[] = []
  const spalten = ["Sitzungen", "geblieben", "Preis gesehen", "Buchung geklickt"]
  const zeitraum = d.zeitraum.frei
    ? `ab ${datum(d.zeitraum.seit)}`
    : `letzte ${d.zeitraum.tage} Tage (ab ${datum(d.zeitraum.seit)})`

  z.push("# Praxis OS — Website-Auswertung")
  z.push("")
  z.push(`**Zeitraum:** ${zeitraum}`)
  z.push(`**Erstellt:** ${datum(new Date().toISOString())}`)
  z.push(`**Sitzungen:** ${d.gesamt}`)
  z.push(
    `**Eigene Testbesuche:** ${d.intern_ausgeschlossen} ${
      d.zeitraum.tests_sichtbar ? "**mitgezählt**" : "ausgeschlossen"
    }`
  )
  z.push("")
  z.push(
    "Dieser Bericht enthält nur Summen und Quoten — keine Sitzungskennungen, keine Namen, keine Adressen, keine einzelnen Termine. Er kann weitergegeben werden."
  )
  z.push("")

  // ── Trichter ───────────────────────────────────────────────────────────
  z.push("## 1. Der Trichter")
  z.push("")
  for (let i = 0; i < d.trichter.length; i++) {
    const s = d.trichter[i]
    const vorher = i > 0 ? d.trichter[i - 1] : null
    const verlust = vorher && vorher.anzahl > 0 ? vorher.anzahl - s.anzahl : 0
    z.push(`### ${s.stufe}: ${s.anzahl} (${s.anteil} % aller Sitzungen)`)
    if (vorher && verlust > 0) {
      z.push(
        `- Verlust gegenüber „${vorher.stufe}“: −${verlust} (${Math.round((verlust / vorher.anzahl) * 100)} %)`
      )
    }
    z.push(`- Bedingung: ${s.hinweis}`)
    if (ZAEHLREGEL[s.stufe]) z.push(`- Zählregel: ${ZAEHLREGEL[s.stufe]}`)
    z.push("")
  }

  // ── Leseleitern ────────────────────────────────────────────────────────
  z.push("## 2. Wo das Lesen aufhört (je Einstiegsseite)")
  z.push("")
  z.push(
    "„Erreicht“ = der Abschnitt stand im Fenster. „Haltequote“ = Anteil derjenigen, die den vorigen Abschnitt erreicht hatten. Gerechnet nur über Sitzungen, die auf DIESER Seite eingestiegen sind."
  )
  z.push("")
  if (d.leitern.length === 0) {
    z.push("_Keine gemessene Seite im Zeitraum._")
    z.push("")
  }
  for (const l of d.leitern) {
    z.push(`### ${l.titel} — ${l.pfad}`)
    z.push(
      `${l.sitzungen} Sitzungen, davon ${l.klicks} mit Buchungsklick${
        l.gemessen ? "" : " · **Abschnitte wurden auf dieser Seite nicht gemeldet**"
      }`
    )
    z.push("")
    if (l.gemessen) {
      z.push(
        tabelle(
          ["Abschnitt", "erreicht", "von allen", "Haltequote"],
          l.sprossen.map((s) => [
            s.titel,
            s.erreicht,
            `${s.anteil} %`,
            s.haltequote === null ? "—" : `${s.haltequote} %`,
          ])
        )
      )
      z.push("")
    }
  }

  // ── Lesetiefe und Zeit ─────────────────────────────────────────────────
  z.push("## 3. Lesetiefe und aktive Zeit")
  z.push("")
  z.push(
    d.lesetiefe
      ? tabelle(
          ["mindestens gelesen", "Sitzungen", "Anteil"],
          d.lesetiefe.map((l) => [
            `${l.marke} %`,
            l.anzahl,
            `${d.gesamt > 0 ? Math.round((l.anzahl / d.gesamt) * 100) : 0} %`,
          ])
        )
      : "_Lesetiefe wurde im Zeitraum nicht gemeldet._"
  )
  z.push("")
  z.push(
    d.aktivzeit
      ? tabelle(
          ["mindestens aktiv", "Sitzungen", "Anteil"],
          d.aktivzeit.map((a) => [
            `${a.marke} s`,
            a.anzahl,
            `${d.gesamt > 0 ? Math.round((a.anzahl / d.gesamt) * 100) : 0} %`,
          ])
        )
      : "_Aktive Zeit wurde im Zeitraum nicht gemeldet._"
  )
  z.push("")
  z.push(
    `Seiten je Sitzung: ${d.seitenProSitzung.eine} mit einer Seite · ${d.seitenProSitzung.zweiBisVier} mit zwei bis vier · ${d.seitenProSitzung.fuenfPlus} mit fünf und mehr.`
  )
  z.push("")

  // ── Nach dem Klick ─────────────────────────────────────────────────────
  z.push("## 4. Was nach dem Buchungsklick passiert")
  z.push("")
  z.push(
    "Ein gezählter Klick ist noch kein Besucher im Buchungstool. Wer die Seite gleich danach verlässt, ist unterwegs; wer nach drei Sekunden noch dasteht, dem hat der Knopf nichts gebracht."
  )
  z.push("")
  z.push(
    tabelle(
      ["Ausgang", "Sitzungen"],
      [
        ["Klicks insgesamt", d.nach_klick.klicks],
        ["Seite danach verlassen", d.nach_klick.verlassen],
        ["davon innerhalb 1,5 s", d.nach_klick.schnell],
        ["nach 3 s noch auf der Seite", d.nach_klick.geblieben],
        ["ohne Rückmeldung", d.nach_klick.unbekannt],
        [
          "Median bis zum Verlassen",
          d.nach_klick.median_ms === null ? "—" : `${d.nach_klick.median_ms} ms`,
        ],
      ]
    )
  )
  z.push("")

  // ── Einwilligungsbanner ────────────────────────────────────────────────
  z.push("## 5. Einwilligungsbanner")
  z.push("")
  z.push(
    `Gezeigt: ${d.banner.gezeigt} · akzeptiert: ${d.banner.akzeptiert} · abgelehnt: ${d.banner.abgelehnt} · ohne Auswahl gegangen: ${d.banner.ohne_auswahl}`
  )
  z.push("")
  z.push("Nach Einstiegsseite:")
  z.push("")
  z.push(
    tabelle(
      ["Seite", "gezeigt", "akzeptiert", "abgelehnt", "ohne Auswahl", "Zustimmung"],
      bannerZeilen(d.banner_nach_seite)
    )
  )
  z.push("")
  z.push("Nach Anzeigenkennung (utm_content):")
  z.push("")
  z.push(
    tabelle(
      ["Anzeige", "gezeigt", "akzeptiert", "abgelehnt", "ohne Auswahl", "Zustimmung"],
      bannerZeilen(d.banner_nach_anzeige)
    )
  )
  z.push("")

  // ── Herkunft ───────────────────────────────────────────────────────────
  z.push("## 6. Woher die Besucher kommen")
  z.push("")
  for (const [titel, zeilen] of [
    ["Quelle", d.quellen],
    ["Kampagne", d.kampagnen],
    ["Anzeige (utm_content)", d.anzeigen],
  ] as const) {
    z.push(`### ${titel}`)
    z.push("")
    z.push(tabelle([titel, ...spalten], quellenZeilen(zeilen)))
    z.push("")
  }

  // ── Einstieg und Absprung ──────────────────────────────────────────────
  z.push("## 7. Einstieg und Absprung")
  z.push("")
  z.push("Wo die Sitzung beginnt:")
  z.push("")
  z.push(
    tabelle(
      ["Seite", "Sitzungen", "geblieben", "Bleiberate", "Buchung geklickt"],
      d.einstieg.map((e) => [e.pfad, e.sitzungen, e.geblieben, `${e.bleiberate} %`, e.klicks])
    )
  )
  z.push("")
  z.push("Wo sie endet (Rechtstexte ausgenommen):")
  z.push("")
  z.push(
    tabelle(
      ["Seite", "Sitzungsenden", "Aufrufe", "endet hier"],
      d.absprung.map((a) => [a.pfad, a.enden, a.aufrufe, `${a.rate} %`])
    )
  )
  z.push("")

  // ── Gerät ──────────────────────────────────────────────────────────────
  z.push("## 8. Gerät und Browser")
  z.push("")
  z.push(tabelle(["Gerät", ...spalten], quellenZeilen(d.geraete)))
  z.push("")
  z.push(tabelle(["Browser", ...spalten], quellenZeilen(d.browser)))
  z.push("")
  z.push(
    `Sitzungen in einem In-App-Browser (Instagram, Facebook): ${d.in_app_sitzungen} — dort kommt der bezahlte Verkehr an.`
  )
  z.push("")

  // ── Buchungen ──────────────────────────────────────────────────────────
  z.push("## 9. Buchungen")
  z.push("")
  z.push(
    "Videotermine aus dem Buchungskalender, nicht aus der Website-Messung. Eigene Testbuchungen sind ausgenommen."
  )
  z.push("")
  z.push(
    tabelle(
      ["Quelle", "Buchungen"],
      d.buchungen_nach_quelle.map((r) => [r.quelle, r.anzahl]),
      "Keine Buchung mit Herkunftsangabe im Zeitraum."
    )
  )
  z.push("")
  z.push(
    tabelle(
      ["Anzeige (utm_content)", "Buchungen"],
      d.buchungen_nach_anzeige.map((r) => [r.anzeige, r.anzahl]),
      "Keine Buchung mit Anzeigenkennung im Zeitraum."
    )
  )
  z.push("")
  z.push(
    tabelle(
      ["Geklickter Knopf (cta)", "Buchungen"],
      d.buchungen_nach_cta.map((r) => [r.cta, r.anzahl]),
      "Keine Buchung mit Knopfkennung im Zeitraum."
    )
  )
  z.push("")
  z.push(
    `Buchungen ohne Herkunftsangabe: ${d.buchungen_ohne_herkunft}. Sie als „direkt“ zu zählen wäre eine Erfindung — das Buchungstool sendet die Herkunft erst seit Oktober 2026 mit.`
  )
  z.push("")

  // ── Grenzen ────────────────────────────────────────────────────────────
  z.push("## 10. Was diese Zahlen nicht sagen")
  z.push("")
  z.push(
    `- **Angebotswechsel am ${new Date(d.umstellung_kennenlernen).toLocaleDateString("de-DE")}.** Davor kostete der Einstieg 69 € („Konsultation“), danach ist er kostenlos („Kennenlernen“, 20 Min. per Video). Klickraten über diesen Schnitt hinweg vergleichen zwei verschiedene Angebote.`
  )
  z.push(
    `- **${d.verworfene_sitzungen} Sitzungen verworfen.** Ereignisse ohne zugehörigen Seitenaufruf, meist Bots. Sie lassen sich keiner Sitzung zuordnen und fallen aus jeder Quote heraus.`
  )
  z.push(
    "- **Abschnitte werden erst seit dem 10.10.2026 gemeldet.** Seiten mit älterem Verkehr — vor allem die Startseite — zeigen deshalb eine niedrige Melde-Quote. Das ist keine Leseschwäche, das ist der Messbeginn."
  )
  z.push(
    "- **Gebucht wird auf einer fremden Domain.** Die Website sieht den Klick, nicht die Buchung. Die letzte Trichterstufe kommt aus dem Kalender und lässt sich nicht sitzungsgenau mit den übrigen verketten."
  )
  z.push(
    "- **An Meta geht nur PageView.** Keine Buchungs- oder Gesundheitsereignisse, keine Conversions API. Metas Zahlen werden deshalb nicht zu diesen passen."
  )
  z.push(
    "- **Ohne Einwilligung kein Pixel.** Wer das Banner ohne Auswahl verlässt, ist hier gezählt, bei Meta nie."
  )
  z.push("")

  return z.join("\n")
}
