/**
 * GET /api/analytics/trichter — wo der Besucher verloren geht.
 *
 * Das bestehende `website-summary` zaehlt: Besucher, Seitenaufrufe, Top-Seiten,
 * Quellen. Alles richtig, und alles nebeneinander — man sieht Zahlen, aber
 * keinen Weg. Die Frage „wo springt er ab" liess sich daraus nicht lesen.
 *
 * Hier wird stattdessen JEDE SITZUNG rekonstruiert: Welche Seite zuerst,
 * welche zuletzt, wie viele dazwischen, wie weit gelesen, wie lange wirklich
 * da, welche Abschnitte gesehen, ob geklickt.
 *
 * Was die ersten dreissig Tage zeigten (10.10.2026):
 *   442 Sitzungen, 404 davon (91 %) sahen genau EINE Seite.
 *   218 Sitzungen aus bezahlter Meta-Werbung — null mit irgendeinem Ereignis.
 * Das ist keine Schwaeche der Messung, das ist das Ergebnis.
 *
 * ── Zur Stufe „Gelesen" (ersetzt am 10.10.2026) ──────────────────────────
 *
 * Sie hiess „mind. die Haelfte gelesen ODER drei Seiten" — und war damit
 * ohne eine Zeile Text erreichbar: Drei Seitenaufrufe schafft jeder, der
 * zweimal falsch klickt. Eine Trichterstufe, die man ohne die gemessene
 * Handlung passieren kann, ist keine Stufe. An ihre Stelle tritt
 * „Preis gesehen": der Abschnitt #preis stand im Fenster. Das ist der
 * Moment, an dem die Seite ihre Arbeit getan hat.
 *
 * ?tage=7|30|90     (Voreinstellung 30)
 * ?von=<ISO>        fester Startzeitpunkt, hat Vorrang vor `tage`
 * ?tests=ein        eigene Testbesuche mitzaehlen
 * ?format=text      dieselbe Auswertung als Markdown-Bericht
 * ?umstellung=<ISO> Vergleich: Fenster seit diesem Zeitpunkt gegen das
 *                   gleich lange Fenster davor und gegen dieselbe Uhrzeit
 *                   am Vortag. Die Auswertung selbst gilt dann fuer das
 *                   Fenster DANACH.
 */

import { NextRequest, NextResponse } from "next/server"
import { createSupabaseServerClient } from "@/lib/supabase-server"
import { createSupabaseServiceClient } from "@/lib/supabase-service"
import { SEITEN_LISTE, seiteZuPfad } from "@/lib/gemessene-seiten"
import { UMSTELLUNG_KENNENLERNEN } from "@/lib/programm"
import { berichtAlsText, type BerichtDaten } from "@/lib/analytics-bericht"
import { noetigeSitzungen, vergleicheAnteile } from "@/lib/anteil-vergleich"
import { alleZeilen } from "@/lib/supabase-alle-zeilen"

export const dynamic = "force-dynamic"

const STAFF = ["admin"]

/** Seiten, die kein Besuchsziel sind — sie verfaelschen die Absprungrate. */
const RECHTLICH = new Set(["/impressum", "/datenschutz", "/agb", "/widerruf"])

/**
 * Kennungen, unter denen wir selbst getestet haben.
 *
 * `utm_content=test` wird schon beim Senden unterdrueckt (lib/intern), die
 * hier sind nachtraeglich entstanden: Links, die zum Pruefen verschickt
 * oder am Handy aufgerufen wurden. Sie landen mal in `utm_source`, mal in
 * `utm_campaign`, mal in `utm_content` — geprueft werden deshalb ALLE
 * DREI. Am 14.10.2026 fielen genau deshalb Testbesuche durch: Sie trugen
 * `utm_campaign=handytest` bei `utm_content=erstattung`, und der Filter
 * sah nur Quelle und Inhalt.
 */
const TESTKENNUNGEN = new Set([
  "test",
  "selbsttest",
  "handytest",
  "testbuchung",
  "androidtest",
  "probe",
  "abnahme",
])

function istTest(
  quelle?: string | null,
  kampagne?: string | null,
  inhalt?: string | null,
  landingUrl?: string | null
): boolean {
  // `praxis_test=1` in der Adresse ist die zuverlaessigste Markierung:
  // Sie kollidiert mit keiner utm-Angabe, die eine Pruefung vielleicht
  // gerade behaupten will, und sie ueberlebt in `landing_url`.
  //
  // Anlass: Am 13.10.2026 liefen die Abnahmeskripte gegen die Live-Seite
  // und erzeugten zwoelf Sitzungen mit Buchungsklick — mit
  // `utm_content=trailer` und ohne Kampagne, also von keinem Filter
  // erfasst. Im Dashboard sah das aus wie zwoelf Interessenten, von denen
  // elf nie am Buchungstool ankamen. Einen halben Tag Fehlersuche spaeter
  // war klar: Es gab sie nie.
  if ((landingUrl ?? "").includes("praxis_test=1")) return true
  return [quelle, kampagne, inhalt].some((v) => TESTKENNUNGEN.has((v ?? "").trim().toLowerCase()))
}

const LESEMARKEN = [25, 50, 75, 100] as const
const AKTIVMARKEN = [15, 45, 120] as const

interface Sitzung {
  erste: string
  letzte: string
  seiten: number
  quelle: string
  kampagne: string | null
  anzeige: string | null
  geraet: string
  browser: string
  start: string
  lesetiefe: number
  aktiv: number
  abschnitte: Set<string>
  klick: boolean
  /** Einwilligungsbanner: gezeigt? und wie entschieden? */
  bannerGezeigt: boolean
  bannerEntscheidung: "akzeptiert" | "abgelehnt" | null
  /** Nach dem Buchungsklick: Seite verlassen (ms) oder geblieben? */
  klickVerlassenMs: number | null
  klickGeblieben: boolean
  /**
   * Der Schmerzcheck auf /check. Nur erreichte SCHRITTE, nie Antworten —
   * was jemand angetippt hat, verlaesst sein Geraet erst bei der Buchung
   * und steht in keiner Messung.
   */
  checkGestartet: boolean
  checkFrage6: boolean
  checkErgebnis: boolean
  checkKlick: boolean
  checkStopp: boolean
  /** Aus welchen Abschnitten der Buchungsknopf gedrückt wurde (`abschnitt`). */
  klickAbschnitte: Set<string>
}

/** Ein Zeitfenster. `bis: null` heisst „bis jetzt". */
export interface Fenster {
  seit: string
  bis: string | null
}

/**
 * Die komplette Auswertung fuer EIN Zeitfenster.
 *
 * Stand bis zum 15.10.2026 direkt in GET. Herausgeloest, weil sie seither
 * mehrfach gebraucht wird: Wer wissen will, ob eine Aenderung um 16 Uhr
 * etwas bewirkt hat, braucht dieselbe Rechnung dreimal — danach, davor und
 * zur selben Uhrzeit am Vortag.
 *
 * Dreimal dieselbe Rechnung heisst: EINE Funktion. Haette der Vergleich
 * seine eigene, schlankere Zaehlung bekommen, waeren seine Zahlen andere
 * als die im Trichter darunter — und niemand koennte sagen, welche gilt.
 */
async function auswerten(
  svc: ReturnType<typeof createSupabaseServiceClient>,
  { seit, bis }: Fenster,
  zeitraum: { tage: number; seit: string; frei: boolean; tests_sichtbar: boolean },
  testsZeigen: boolean
) {
  // Seitenaufrufe seitenweise holen: PostgREST deckelt bei 1000, und ein
  // stillschweigend abgeschnittener Datensatz ergaebe eine Auswertung, die
  // falsch ist, ohne falsch auszusehen.
  const aufrufe: {
    session_id: string
    path: string
    created_at: string
    utm_source: string | null
    utm_campaign: string | null
    utm_content: string | null
    landing_url: string | null
    referrer: string | null
    device_type: string | null
    browser: string | null
  }[] = []

  const seiten = await alleZeilen<(typeof aufrufe)[number]>(
    (von, nach) => {
      let abfrage = svc
        .from("page_views")
        .select(
          "session_id, path, created_at, utm_source, utm_campaign, utm_content, landing_url, referrer, device_type, browser"
        )
        .gte("created_at", seit)
      // Obergrenze: Das Fenster „davor" endet am Umstellungszeitpunkt, nicht
      // heute. Ohne `bis` waere jeder Vergleich ein Vergleich mit sich selbst.
      if (bis) abfrage = abfrage.lt("created_at", bis)
      return abfrage.order("created_at", { ascending: true }).range(von, nach)
    },
    { hoechstens: 60_000, name: "page_views" }
  )
  aufrufe.push(...seiten.zeilen)

  // ── Ereignisse: seitenweise, und das ist kein Detail ───────────────────
  //
  // Hier stand `.limit(20000)`. Supabase deckelt trotzdem bei 1000 Zeilen,
  // ohne Fehler und ohne Hinweis — und ohne `order()` sind es die
  // AELTESTEN tausend. Das Dashboard rechnete deshalb seit dem 13.10.2026
  // mit Ereignissen aus der Vergangenheit: 135 Besucher auf /check, null
  // gestartete Checks, waehrend in der Datenbank 68 begonnene Checks
  // standen. Jede ereignisbasierte Zahl war betroffen.
  const ereignisSeiten = await alleZeilen<{
    session_id: string
    event_type: string
    path: string
    created_at: string
    metadata: unknown
  }>(
    (von, nach) => {
      let abfrage = svc
        .from("conversion_events")
        .select("session_id, event_type, path, created_at, metadata")
        .gte("created_at", seit)
      if (bis) abfrage = abfrage.lt("created_at", bis)
      return abfrage.order("created_at", { ascending: true }).range(von, nach)
    },
    { hoechstens: 60_000, name: "conversion_events" }
  )
  const ereignisse = ereignisSeiten.zeilen

  // ── Eigene Besuche aussortieren ────────────────────────────────────────
  //
  // Seit dem 10.10.2026 verhindert `lib/intern` schon das Senden. Fuer die
  // Zeit davor — und fuer Testlinks mit utm_content=test — wird hier noch
  // einmal gefiltert: Wer die Seite baut, scrollt gezielt zum Preis und
  // klickt den Buchungsbutton zum Pruefen. Bei 442 Sitzungen im Monat
  // verschiebt das die Klickrate sichtbar.
  const intern = new Set(
    aufrufe
      .filter((a) => (testsZeigen ? a.utm_content === "test" : istTest(a.utm_source, a.utm_campaign, a.utm_content, a.landing_url)))
      .map((a) => a.session_id)
  )

  // ── Sitzungen zusammensetzen ───────────────────────────────────────────
  const sitzungen = new Map<string, Sitzung>()

  for (const a of aufrufe) {
    if (intern.has(a.session_id)) continue
    const vorhanden = sitzungen.get(a.session_id)
    if (!vorhanden) {
      sitzungen.set(a.session_id, {
        erste: a.path,
        letzte: a.path,
        seiten: 1,
        // Die Quelle der ERSTEN Seite gilt fuer die ganze Sitzung: Wer ueber
        // eine Anzeige kam und dann intern weiterklickt, bleibt ein
        // Anzeigen-Besucher.
        quelle: a.utm_source || herkunftAusReferrer(a.referrer),
        kampagne: a.utm_campaign || null,
        anzeige: a.utm_content || null,
        geraet: a.device_type || "unbekannt",
        browser: a.browser || "unbekannt",
        start: a.created_at,
        lesetiefe: 0,
        aktiv: 0,
        abschnitte: new Set<string>(),
        klick: false,
        bannerGezeigt: false,
        bannerEntscheidung: null,
        klickVerlassenMs: null,
        klickGeblieben: false,
        checkGestartet: false,
        checkFrage6: false,
        checkErgebnis: false,
        checkKlick: false,
        checkStopp: false,
        klickAbschnitte: new Set<string>(),
      })
    } else {
      vorhanden.letzte = a.path
      vorhanden.seiten++
    }
  }

  for (const e of ereignisse) {
    const s = sitzungen.get(e.session_id)
    if (!s) continue
    // Beide Namen zaehlen auf dieselbe Stufe: Bis zum 15.10.2026 hiess der
    // Einstieg „Konsultation" (69 €), danach „Kennenlernen" (kostenlos).
    // Zwei Stufen daraus zu machen, haette die Historie zerschnitten; eine
    // Stufe ohne Hinweis auf den Schnitt waere ein Vergleich zweier
    // verschiedener Angebote. Deshalb: eine Stufe, und die Marke daneben.
    if (e.event_type === "konsultation_klick" || e.event_type === "kennenlernen_klick") {
      s.klick = true
      const ab = (e.metadata as Record<string, unknown> | null)?.abschnitt
      if (typeof ab === "string") s.klickAbschnitte.add(ab)
    }

    const tiefe = /^lesetiefe_(\d+)$/.exec(e.event_type)
    if (tiefe) s.lesetiefe = Math.max(s.lesetiefe, Number(tiefe[1]))

    const zeit = /^aktivzeit_(\d+)$/.exec(e.event_type)
    if (zeit) s.aktiv = Math.max(s.aktiv, Number(zeit[1]))

    const abschnitt = /^abschnitt_(.+)$/.exec(e.event_type)
    if (abschnitt) s.abschnitte.add(abschnitt[1])

    if (e.event_type === "klick_verlassen") {
      const ms = Number((e.metadata as Record<string, unknown> | null)?.ms)
      if (Number.isFinite(ms)) s.klickVerlassenMs = ms
    }
    if (e.event_type === "klick_geblieben") s.klickGeblieben = true

    // ── Schmerzcheck ───────────────────────────────────────────────────
    if (e.event_type === "check_gestartet") s.checkGestartet = true
    if (e.event_type === "check_frage_6") s.checkFrage6 = true
    if (e.event_type === "check_ergebnis") s.checkErgebnis = true
    if (e.event_type === "check_kennenlernen_klick") s.checkKlick = true
    if (e.event_type === "check_sicherheitsstopp") s.checkStopp = true

    if (e.event_type === "consent_gezeigt") s.bannerGezeigt = true
    if (e.event_type === "consent_akzeptiert") s.bannerEntscheidung = "akzeptiert"
    if (e.event_type === "consent_abgelehnt") s.bannerEntscheidung = "abgelehnt"

  }

  const alle = [...sitzungen.values()]
  const gesamt = alle.length

  // Ereignisse OHNE Seitenaufruf — und wie viele Sitzungen deshalb fehlen.
  //
  // Die Auswertung setzt jede Sitzung aus ihren Seitenaufrufen zusammen.
  // Ereignisse einer Sitzung, von der kein Seitenaufruf vorliegt, lassen
  // sich nirgends einhaengen und fallen heraus. Das ist richtig so, darf
  // aber nicht unsichtbar passieren: Am 13.10.2026 waren es 196 Sitzungen
  // mit 516 Ereignissen — genug, um jede Quote zu verschieben, und die
  // Ursache (Bots sendeten Ereignisse, aber keinen Seitenaufruf) war nur
  // zu finden, weil jemand nachgerechnet hat. Steht die Zahl im Dashboard,
  // faellt der naechste Fall am selben Tag auf.
  const verworfen = new Set(
    (ereignisse).filter((e) => !sitzungen.has(e.session_id)).map((e) => e.session_id)
  )

  // ── Der Trichter ───────────────────────────────────────────────────────
  //
  // „Geblieben": mehr als eine Seite ODER ein Viertel gelesen ODER
  // mindestens 15 Sekunden wirklich da. Drei Wege, weil keiner allein
  // genuegt — eine Salespage braucht keine zweite Seite, wer sofort
  // weiterklickt hat nicht gelesen, und wer liest ohne zu scrollen (kurzes
  // Fenster, grosse Schrift) wuerde sonst durchfallen.
  const geblieben = (s: Sitzung) => s.seiten > 1 || s.lesetiefe >= 25 || s.aktiv >= 15

  // „Preis gesehen": der Abschnitt stand im Fenster. WELCHER Abschnitt das
  // ist, haengt an der Seite — auf der Erstattungsseite heisst er „pakete",
  // sonst „preis". Dieselbe Stufe, anderer Name; ein fest verdrahtetes
  // „preis" haette dort immer null gemeldet.
  //
  // Fuer Sitzungen auf Seiten ohne Abschnittsmessung (Stadtseiten, Shop)
  // tritt die Lesetiefe ein — sonst waere die Stufe dort immer null und der
  // Trichter log.
  const preisGesehen = (s: Sitzung) => {
    const seite = seiteZuPfad(s.erste)
    if (seite) return s.abschnitte.has(seite.preis) || s.lesetiefe >= 75
    return s.abschnitte.has("preis") || s.lesetiefe >= 75
  }

  const dageblieben = alle.filter(geblieben)
  const beimPreis = alle.filter(preisGesehen)
  const geklickt = alle.filter((s) => s.klick)

  // Buchungen kommen NICHT aus der Website-Messung: Gebucht wird auf einer
  // fremden Domaene. Sie werden deshalb direkt aus den Terminen gezaehlt.
  // `referrer_content = 'test'` markiert eigene Testbuchungen — dieselbe
  // Vereinbarung wie auf der Website (siehe lib/intern). Bei einer Handvoll
  // echter Buchungen im Monat wuerde eine Testbuchung die letzte Stufe
  // verdoppeln.
  // Auch hier: `.limit(2000)` haette bei 1000 Zeilen stillschweigend geendet.
  const terminSeiten = await alleZeilen<{
    id: string
    referrer_source: string | null
    referrer_campaign: string | null
    referrer_content: string | null
    referrer_cta: string | null
    service_name: string | null
  }>(
    (von, nach) => {
      let abfrage = svc
        .from("appointments")
        .select("id, referrer_source, referrer_campaign, referrer_content, referrer_cta, service_name")
        .gte("created_at", seit)
      if (bis) abfrage = abfrage.lt("created_at", bis)
      return abfrage
        .ilike("service_name", "%video%")
        .or("referrer_content.is.null,referrer_content.neq.test")
        .order("created_at", { ascending: true })
        .range(von, nach)
    },
    { hoechstens: 20_000, name: "appointments" }
  )
  const termine = terminSeiten.zeilen

  const buchungen = termine?.length ?? 0

  const anteil = (n: number) => (gesamt > 0 ? Math.round((n / gesamt) * 1000) / 10 : 0)

  const trichter = [
    { stufe: "Besucher", anzahl: gesamt, anteil: 100, hinweis: "Sitzungen im Zeitraum" },
    {
      stufe: "Geblieben",
      anzahl: dageblieben.length,
      anteil: anteil(dageblieben.length),
      hinweis: "zweite Seite, 25 % gelesen oder 15 s aktiv",
    },
    {
      stufe: "Preis gesehen",
      anzahl: beimPreis.length,
      anteil: anteil(beimPreis.length),
      hinweis: "Preisabschnitt stand im Fenster",
    },
    {
      stufe: "Kennenlernen angeklickt",
      anzahl: geklickt.length,
      anteil: anteil(geklickt.length),
      hinweis: "Klick auf „Kostenloses Kennenlernen buchen“",
    },
    {
      stufe: "Termin gebucht",
      anzahl: buchungen,
      anteil: anteil(buchungen),
      hinweis: "Videotermine im Buchungskalender",
    },
  ]

  // ── Wo das Lesen aufhoert ──────────────────────────────────────────────
  //
  // Die Leiter der Abschnitte. Zwei Zahlen, die aneinander haengen: wie
  // viele den Abschnitt erreicht haben, und wie viele von denen, die den
  // vorigen erreicht hatten, hier noch dabei sind. Die zweite zeigt, WO es
  // bricht — ein Abschnitt mit 30 Prozent Verlust ist eine Baustelle.
  //
  // Eine Leiter JE SEITE, und gerechnet nur ueber die Sitzungen, die dort
  // eingestiegen sind. Startseite und Anzeigenseiten haben verschiedene
  // Abschnitte; sie in einen Topf zu werfen hiesse, jeden Abschnitt an
  // allen Besuchern zu messen — und jede Leiter saehe nach Abbruch aus.
  const leitern = SEITEN_LISTE.map((seite) => {
    const sitzungenDort = alle.filter((s) => s.erste === seite.pfad)
    let vorige: number | null = null
    const sprossen = seite.abschnitte.map((a) => {
      const erreicht = sitzungenDort.filter((s) => s.abschnitte.has(a.id)).length
      const haltequote = vorige && vorige > 0 ? Math.round((erreicht / vorige) * 1000) / 10 : null
      vorige = erreicht
      return {
        id: a.id,
        titel: a.titel,
        erreicht,
        anteil:
          sitzungenDort.length > 0
            ? Math.round((erreicht / sitzungenDort.length) * 1000) / 10
            : 0,
        haltequote,
      }
    })
    return {
      schluessel: seite.schluessel,
      titel: seite.titel,
      pfad: seite.pfad,
      sitzungen: sitzungenDort.length,
      klicks: sitzungenDort.filter((s) => s.klick).length,
      sprossen,
      // Ohne eine einzige Meldung waere die Leiter eine Reihe Nullen — und
      // „niemand hat den Preis gesehen" ist etwas anderes als „es wird noch
      // nicht gemessen". Deshalb der Unterschied im Datensatz.
      gemessen: sitzungenDort.some((s) => s.abschnitte.size > 0),
    }
  }).filter((l) => l.sitzungen > 0)

  // ── Wo die Sitzung endet ───────────────────────────────────────────────
  const aufrufeProSeite = new Map<string, number>()
  for (const a of aufrufe) {
    if (intern.has(a.session_id)) continue
    aufrufeProSeite.set(a.path, (aufrufeProSeite.get(a.path) ?? 0) + 1)
  }

  const endenProSeite = new Map<string, number>()
  for (const s of alle) endenProSeite.set(s.letzte, (endenProSeite.get(s.letzte) ?? 0) + 1)

  const absprung = [...endenProSeite.entries()]
    .filter(([pfad]) => !RECHTLICH.has(pfad))
    .map(([pfad, enden]) => {
      const auf = aufrufeProSeite.get(pfad) ?? enden
      return { pfad, enden, aufrufe: auf, rate: Math.round((enden / auf) * 1000) / 10 }
    })
    .sort((a, b) => b.enden - a.enden)
    .slice(0, 10)

  // ── Wo sie ankommen ────────────────────────────────────────────────────
  const einstiegMap = new Map<string, { sitzungen: number; geblieben: number; klicks: number }>()
  for (const s of alle) {
    const e = einstiegMap.get(s.erste) ?? { sitzungen: 0, geblieben: 0, klicks: 0 }
    e.sitzungen++
    if (geblieben(s)) e.geblieben++
    if (s.klick) e.klicks++
    einstiegMap.set(s.erste, e)
  }
  const einstieg = [...einstiegMap.entries()]
    .map(([pfad, e]) => ({
      pfad,
      ...e,
      bleiberate: Math.round((e.geblieben / e.sitzungen) * 1000) / 10,
    }))
    .sort((a, b) => b.sitzungen - a.sitzungen)
    .slice(0, 10)

  // ── Welche Quelle bringt wen ───────────────────────────────────────────
  //
  // Drei Ebenen derselben Frage. „Meta bringt 218 Sitzungen" ist noch kein
  // Hinweis darauf, was zu tun ist; „Anzeige B bringt 140 Sitzungen und
  // keinen einzigen Klick" ist einer.
  const nachSchluessel = (schluessel: (s: Sitzung) => string | null) => {
    const map = new Map<
      string,
      { sitzungen: number; geblieben: number; preis: number; klicks: number }
    >()
    for (const s of alle) {
      const k = schluessel(s)
      if (!k) continue
      const q = map.get(k) ?? { sitzungen: 0, geblieben: 0, preis: 0, klicks: 0 }
      q.sitzungen++
      if (geblieben(s)) q.geblieben++
      if (preisGesehen(s)) q.preis++
      if (s.klick) q.klicks++
      map.set(k, q)
    }
    return [...map.entries()]
      .map(([name, q]) => ({
        name,
        ...q,
        bleiberate: Math.round((q.geblieben / q.sitzungen) * 1000) / 10,
        klickrate: Math.round((q.klicks / q.sitzungen) * 1000) / 10,
      }))
      .sort((a, b) => b.sitzungen - a.sitzungen)
      .slice(0, 12)
  }

  const quellen = nachSchluessel((s) => s.quelle)
  const kampagnen = nachSchluessel((s) => s.kampagne)
  const anzeigen = nachSchluessel((s) => s.anzeige)

  // ── Geraet und Browser ─────────────────────────────────────────────────
  //
  // Der In-App-Browser steht hier als eigener Eintrag (siehe
  // lib/device-detect). Wenn Anzeigen-Traffic nicht konvertiert, ist die
  // erste Frage, ob er ueberhaupt in einem funktionsfaehigen Browser war.
  const geraete = nachSchluessel((s) => s.geraet)
  const browser = nachSchluessel((s) => s.browser)
  const inApp = alle.filter((s) => s.browser.includes("(App)")).length

  // ── Verteilungen ───────────────────────────────────────────────────────
  const lesetiefe = LESEMARKEN.map((marke) => ({
    marke,
    anzahl: alle.filter((s) => s.lesetiefe >= marke).length,
  }))
  const lesetiefeGemessen = alle.some((s) => s.lesetiefe > 0)

  const aktivzeit = AKTIVMARKEN.map((marke) => ({
    marke,
    anzahl: alle.filter((s) => s.aktiv >= marke).length,
  }))
  const aktivzeitGemessen = alle.some((s) => s.aktiv > 0)

  // ── Was nach dem Buchungsklick passiert ────────────────────────────────
  //
  // Ein gezaehlter Klick ist noch kein Besucher auf der Buchungsseite. Wer
  // die Seite gleich danach verlaesst, ist unterwegs; wer nach drei
  // Sekunden noch hier steht, dem hat der Knopf nichts gebracht. Ohne
  // diese Unterscheidung sieht „niemand bucht" genauso aus wie „der Knopf
  // ist kaputt" — und das sind entgegengesetzte Probleme.
  const mitKlick = alle.filter((s) => s.klick)
  const zeiten = mitKlick
    .map((s) => s.klickVerlassenMs)
    .filter((m): m is number => m !== null)
    .sort((a, b) => a - b)
  const nachKlick = {
    klicks: mitKlick.length,
    verlassen: zeiten.length,
    geblieben: mitKlick.filter((s) => s.klickGeblieben).length,
    unbekannt: mitKlick.filter((s) => s.klickVerlassenMs === null && !s.klickGeblieben).length,
    // Median, nicht Mittelwert: Ein einzelner Wert von 20 Sekunden (Tab
    // gewechselt und zurueck) wuerde den Schnitt sonst unbrauchbar machen.
    median_ms: zeiten.length > 0 ? zeiten[Math.floor(zeiten.length / 2)] : null,
    schnell: zeiten.filter((m) => m <= 1500).length,
  }

  // ── Das Einwilligungsbanner ────────────────────────────────────────────
  //
  // Drei Ausgaenge, und der dritte ist der interessante: Wer gefragt wurde
  // und ohne Antwort gegangen ist, hat weder zugestimmt noch abgelehnt —
  // fuer ihn laedt kein Pixel, und er taucht in Metas Zahlen nie auf. Ohne
  // das Ereignis „gezeigt" liesse sich diese Gruppe nicht von denen
  // unterscheiden, die nie gefragt wurden (weil sie schon entschieden
  // hatten).
  const bannerNach = (schluessel: (s: Sitzung) => string | null) => {
    const map = new Map<string, { gezeigt: number; akzeptiert: number; abgelehnt: number }>()
    for (const s of alle) {
      if (!s.bannerGezeigt) continue
      const k = schluessel(s)
      if (!k) continue
      const e = map.get(k) ?? { gezeigt: 0, akzeptiert: 0, abgelehnt: 0 }
      e.gezeigt++
      if (s.bannerEntscheidung === "akzeptiert") e.akzeptiert++
      if (s.bannerEntscheidung === "abgelehnt") e.abgelehnt++
      map.set(k, e)
    }
    return [...map.entries()]
      .map(([name, e]) => ({
        name,
        ...e,
        ohne_auswahl: e.gezeigt - e.akzeptiert - e.abgelehnt,
        zustimmungsrate: e.gezeigt > 0 ? Math.round((e.akzeptiert / e.gezeigt) * 1000) / 10 : 0,
      }))
      .sort((a, b) => b.gezeigt - a.gezeigt)
      .slice(0, 12)
  }

  const banner_nach_seite = bannerNach((s) => s.erste)
  const banner_nach_anzeige = bannerNach((s) => s.anzeige ?? "(ohne Kennung)")
  const bannerGesamt = alle.filter((s) => s.bannerGezeigt)
  const banner = {
    gezeigt: bannerGesamt.length,
    akzeptiert: bannerGesamt.filter((s) => s.bannerEntscheidung === "akzeptiert").length,
    abgelehnt: bannerGesamt.filter((s) => s.bannerEntscheidung === "abgelehnt").length,
    ohne_auswahl: bannerGesamt.filter((s) => s.bannerEntscheidung === null).length,
  }

  // ── Buchungen nach Herkunft ────────────────────────────────────────────
  //
  // Erst seit PROJ-88 sendet das Buchungstool die Herkunft mit. Aeltere
  // Termine tragen NULL — sie als „direkt" zu zaehlen waere eine Erfindung,
  // deshalb stehen sie getrennt als „ohne Angabe".
  const buchungProQuelle = new Map<string, number>()
  let buchungOhneHerkunft = 0
  for (const t of termine) {
    const q = (t.referrer_source as string | null)?.trim()
    if (!q) buchungOhneHerkunft++
    else buchungProQuelle.set(q, (buchungProQuelle.get(q) ?? 0) + 1)
  }
  const buchungen_nach_quelle = [...buchungProQuelle.entries()]
    .map(([quelle, anzahl]) => ({ quelle, anzahl }))
    .sort((a, b) => b.anzahl - a.anzahl)

  // Und: welcher KNOPF hat ueberzeugt? Zwei verschiedene Fragen —
  // `referrer_content` sagt, welche Anzeige jemanden gebracht hat,
  // `referrer_cta`, wo auf der Seite er dann geklickt hat. Frueher
  // teilten sich beide ein Feld, und bei bezahltem Traffic gewann die
  // Anzeige; der Knopf war genau dann unsichtbar, wenn er am meisten
  // gekostet hat.
  // Nach Anzeige, nicht nur nach Quelle: „meta" sagt nur, dass bezahlt
  // wurde — welche Anzeige gebucht hat, steht in utm_content.
  const buchungProAnzeige = new Map<string, number>()
  for (const t of termine) {
    const c = (t.referrer_content as string | null)?.trim()
    if (c) buchungProAnzeige.set(c, (buchungProAnzeige.get(c) ?? 0) + 1)
  }
  const buchungen_nach_anzeige = [...buchungProAnzeige.entries()]
    .map(([anzeige, anzahl]) => ({ anzeige, anzahl }))
    .sort((a, b) => b.anzahl - a.anzahl)

  const buchungProCta = new Map<string, number>()
  for (const t of termine) {
    const c = (t.referrer_cta as string | null)?.trim()
    if (c) buchungProCta.set(c, (buchungProCta.get(c) ?? 0) + 1)
  }
  const buchungen_nach_cta = [...buchungProCta.entries()]
    .map(([cta, anzahl]) => ({ cta, anzahl }))
    .sort((a, b) => b.anzahl - a.anzahl)

  // ── Der Schmerzcheck auf /check ────────────────────────────────────────
  //
  // Ein EIGENER Trichter, nicht eine weitere Leiter: Die Stufen sind hier
  // keine Abschnitte, die jemand ueberscrollt, sondern Schritte, die er
  // antippt. In die Leseleiter gemischt saehe ein abgebrochener Check aus
  // wie ein Leser, der nicht weit genug gescrollt hat — zwei verschiedene
  // Dinge mit derselben Zahl.
  //
  // Die letzte Stufe kommt aus dem Kalender: Buchungen tragen `cta` aus dem
  // Knopf am Ergebnis (`check-ergebnis`). Ohne diesen Umweg endete der
  // Trichter beim Klick, und ob daraus ein Termin wurde, stuende nirgends.
  const checkSitzungen = alle.filter((s) => s.erste === "/check")
  const checkBuchungen = (termine).filter(
    (t) => (t.referrer_cta as string | null)?.trim() === "check-ergebnis"
  ).length
  const checkAnteil = (n: number) =>
    checkSitzungen.length > 0 ? Math.round((n / checkSitzungen.length) * 1000) / 10 : 0

  const check_trichter = [
    {
      stufe: "Besucher",
      anzahl: checkSitzungen.length,
      anteil: 100,
      hinweis: "Sitzungen, die auf /check begonnen haben",
    },
    {
      stufe: "Check gestartet",
      anzahl: checkSitzungen.filter((s) => s.checkGestartet).length,
      anteil: checkAnteil(checkSitzungen.filter((s) => s.checkGestartet).length),
      hinweis: "Klick auf „Check starten“",
    },
    {
      stufe: "Frage 6 erreicht",
      anzahl: checkSitzungen.filter((s) => s.checkFrage6).length,
      anteil: checkAnteil(checkSitzungen.filter((s) => s.checkFrage6).length),
      hinweis: "die Sicherheitsfrage stand auf dem Bildschirm",
    },
    {
      stufe: "Ergebnis gesehen",
      anzahl: checkSitzungen.filter((s) => s.checkErgebnis).length,
      anteil: checkAnteil(checkSitzungen.filter((s) => s.checkErgebnis).length),
      hinweis: "Einschätzung erschienen (ohne Sicherheits-Stopp)",
    },
    {
      stufe: "Kennenlernen angeklickt",
      anzahl: checkSitzungen.filter((s) => s.checkKlick).length,
      anteil: checkAnteil(checkSitzungen.filter((s) => s.checkKlick).length),
      hinweis: "Klick auf den Knopf unter der Einschätzung",
    },
    {
      stufe: "Termin gebucht",
      anzahl: checkBuchungen,
      anteil: checkAnteil(checkBuchungen),
      hinweis: "Videotermine mit cta=check-ergebnis",
    },
  ]

  // ── Der direkte Weg auf /check (seit 24.10.2026) ─────────────────────
  //
  // Seit dem Umbau stehen Produkt und Preise auf derselben Seite, und wer
  // schon überzeugt ist, bucht ohne Check — über den Link in der Karte
  // (`check-hero`), unter den Preisen (`check-preise`) oder am Ende
  // (`check-abschluss`). Ohne diesen zweiten Weg sähe jede Direktbuchung
  // wie ein Verlust im Check-Trichter aus.
  const DIREKT = ["check-hero", "check-preise", "check-abschluss"]
  const direktGeklickt = (s: Sitzung) => DIREKT.some((d) => s.klickAbschnitte.has(d))
  const direktBuchungen = termine.filter((t) =>
    DIREKT.includes(((t.referrer_cta as string | null) ?? "").trim())
  ).length
  const check_direkt = [
    {
      stufe: "Besucher",
      anzahl: checkSitzungen.length,
      anteil: 100,
      hinweis: "Sitzungen, die auf /check begonnen haben",
    },
    {
      stufe: "Preise gesehen",
      anzahl: checkSitzungen.filter((s) => s.abschnitte.has("preise")).length,
      anteil: checkAnteil(checkSitzungen.filter((s) => s.abschnitte.has("preise")).length),
      hinweis: "Abschnitt „Preise“ ins obere Dreiviertel des Bildschirms gescrollt",
    },
    {
      stufe: "Kennenlernen direkt angeklickt",
      anzahl: checkSitzungen.filter(direktGeklickt).length,
      anteil: checkAnteil(checkSitzungen.filter(direktGeklickt).length),
      hinweis: "Knopf in der Karte, unter den Preisen oder am Ende — ohne Check",
    },
    {
      stufe: "Termin gebucht",
      anzahl: direktBuchungen,
      anteil: checkAnteil(direktBuchungen),
      hinweis: "Videotermine mit cta=check-hero/-preise/-abschluss",
    },
  ]
  const check_direkt_nach_knopf = DIREKT.map((d) => ({
    knopf: d,
    klicks: checkSitzungen.filter((s) => s.klickAbschnitte.has(d)).length,
  }))

  // Der Sicherheits-Stopp ist KEINE Trichterstufe, sondern ein eigener
  // Ausgang: Diese Menschen sollen nicht buchen. Als Abbruch gezaehlt
  // saehe die Seite schlechter aus, je besser sie ihre Aufgabe erfuellt.
  const check_stopp = checkSitzungen.filter((s) => s.checkStopp).length

  const checkNachAnzeige = new Map<
    string,
    { sitzungen: number; gestartet: number; ergebnis: number; klicks: number; stopp: number }
  >()
  for (const s of checkSitzungen) {
    const k = s.anzeige ?? "(ohne Kennung)"
    const e = checkNachAnzeige.get(k) ?? { sitzungen: 0, gestartet: 0, ergebnis: 0, klicks: 0, stopp: 0 }
    e.sitzungen++
    if (s.checkGestartet) e.gestartet++
    if (s.checkErgebnis) e.ergebnis++
    if (s.checkKlick) e.klicks++
    if (s.checkStopp) e.stopp++
    checkNachAnzeige.set(k, e)
  }
  const check_nach_anzeige = [...checkNachAnzeige.entries()]
    .map(([name, e]) => ({
      name,
      ...e,
      startrate: e.sitzungen > 0 ? Math.round((e.gestartet / e.sitzungen) * 1000) / 10 : 0,
      klickrate: e.sitzungen > 0 ? Math.round((e.klicks / e.sitzungen) * 1000) / 10 : 0,
    }))
    .sort((a, b) => b.sitzungen - a.sitzungen)
    .slice(0, 12)

  const ergebnis = {
    zeitraum,
    // Der Schnitt zwischen zwei Angeboten. Steht im Dashboard als Marke,
    // damit niemand Klickraten von vorher und nachher vergleicht, ohne zu
    // wissen, dass dazwischen aus 69 Euro „kostenlos" wurde.
    umstellung_kennenlernen: UMSTELLUNG_KENNENLERNEN,
    verworfene_sitzungen: verworfen.size,
    // Wenn eine der Obergrenzen gegriffen hat, beruht alles darunter auf
    // einem Ausschnitt. Das gehoert ins Dashboard, nicht ins Protokoll.
    daten_abgeschnitten:
      seiten.abgeschnitten || ereignisSeiten.abgeschnitten || terminSeiten.abgeschnitten,
    check_trichter,
    check_direkt,
    check_direkt_nach_knopf,
    check_stopp,
    check_nach_anzeige,
    gesamt,
    intern_ausgeschlossen: intern.size,
    trichter,
    leitern,
    absprung,
    einstieg,
    quellen,
    kampagnen,
    anzeigen,
    geraete,
    browser,
    in_app_sitzungen: inApp,
    lesetiefe: lesetiefeGemessen ? lesetiefe : null,
    aktivzeit: aktivzeitGemessen ? aktivzeit : null,
    buchungen_nach_quelle,
    buchungen_nach_anzeige,
    buchungen_nach_cta,
    nach_klick: nachKlick,
    banner,
    banner_nach_seite,
    banner_nach_anzeige,
    buchungen_ohne_herkunft: buchungOhneHerkunft,
    seitenProSitzung: {
      eine: alle.filter((s) => s.seiten === 1).length,
      zweiBisVier: alle.filter((s) => s.seiten >= 2 && s.seiten <= 4).length,
      fuenfPlus: alle.filter((s) => s.seiten >= 5).length,
    },
  }
  return ergebnis
}

type Auswertung = Awaited<ReturnType<typeof auswerten>>

/**
 * Drei Fenster gegeneinander — der Kern der Frage „sieht man das?".
 *
 * Verglichen wird NICHT roh, sondern als Quote je Sitzung: Mehr Klicks bei
 * mehr Besuchern ist keine Verbesserung. Und zu jeder Quote kommt die
 * Spanne, in der ihr wahrer Wert plausibel liegt — bei zwei Stunden
 * Datenerhebung ist die so breit, dass „10 % statt 5 %" meistens ein
 * einzelner Mensch ist.
 *
 * Das dritte Fenster (gleiche Uhrzeit am Vortag) steht da, weil der
 * Vorher-Vergleich eine Luecke hat, die man ihm nicht ansieht: Von 14 bis
 * 16 Uhr ist anderer Verkehr unterwegs als von 16 bis 18 Uhr. Wer nur
 * „davor" kennt, verwechselt die Tageszeit mit seiner Aenderung.
 */
function baueVergleich(
  danach: Auswertung,
  davor: Auswertung,
  vortag: Auswertung,
  umstellung: Date,
  dauerMs: number
) {
  const basisD = danach.gesamt
  const basisV = davor.gesamt
  const basisT = vortag.gesamt

  const stufen = danach.trichter.map((s, i) => {
    const v = davor.trichter[i]
    const t = vortag.trichter[i]
    return {
      stufe: s.stufe,
      hinweis: s.hinweis,
      danach: s.anzahl,
      davor: v?.anzahl ?? 0,
      vortag: t?.anzahl ?? 0,
      // Die erste Stufe IST die Grundgesamtheit — eine Quote von sich
      // selbst waere immer 100 % und wuerde nur Platz kosten.
      quote: i === 0 ? null : vergleicheAnteile(v?.anzahl ?? 0, basisV, s.anzahl, basisD),
      quote_vortag: i === 0 ? null : vergleicheAnteile(t?.anzahl ?? 0, basisT, s.anzahl, basisD),
    }
  })

  // Wie viele Sitzungen JE FENSTER es braeuchte, um eine Verdopplung der
  // Klickquote zu sehen. Die Antwort auf die Frage, die nach jedem „nicht
  // zu erkennen" kommt: „Wie lange muss ich warten?"
  const klick = danach.trichter.find((s) => s.stufe.includes("angeklickt"))
  const klickquote = basisD > 0 && klick ? klick.anzahl / basisD : 0
  const bezug = klickquote > 0 ? klickquote : 0.01
  const noetig = noetigeSitzungen(bezug, bezug * 100)

  return {
    umstellung: umstellung.toISOString(),
    dauer_minuten: Math.round(dauerMs / 60000),
    sitzungen: { danach: basisD, davor: basisV, vortag: basisT },
    stufen,
    verdopplung: {
      quote: Math.round(bezug * 1000) / 10,
      sitzungen_je_fenster: Number.isFinite(noetig) ? noetig : null,
      gemessen: klickquote > 0,
    },
  }
}

export async function GET(request: NextRequest) {
  const supabase = await createSupabaseServerClient()
  const {
    data: { user },
  } = await supabase.auth.getUser()
  if (!user) return NextResponse.json({ error: "Nicht autorisiert." }, { status: 401 })

  const svc = createSupabaseServiceClient()
  const { data: profil } = await svc
    .from("user_profiles")
    .select("role")
    .eq("id", user.id)
    .maybeSingle()
  if (!profil || !STAFF.includes(profil.role as string)) {
    return NextResponse.json({ error: "Keine Berechtigung." }, { status: 403 })
  }

  const q = request.nextUrl.searchParams

  // Zeitraum: entweder „letzte N Tage" oder ein fester Startzeitpunkt.
  // `von` gewinnt — wer einen Zeitpunkt nennt, meint ihn. Praktisch fuer
  // „ab dem Moment, in dem die Anzeige umgestellt wurde": Ein Tagesraster
  // wuerde den halben Tag davor mitzaehlen.
  const vonRoh = q.get("von")
  const vonDatum = vonRoh ? new Date(vonRoh) : null
  const gueltigesVon = vonDatum && !Number.isNaN(vonDatum.getTime()) ? vonDatum : null

  const tage = Math.min(365, Math.max(1, Number(q.get("tage")) || 30))
  const seit = (gueltigesVon ?? new Date(Date.now() - tage * 86_400_000)).toISOString()

  // Testquellen ausblenden (Voreinstellung: ja). Das sind Besuche, die wir
  // selbst erzeugt haben — sie zu zaehlen hiesse, die eigene Arbeit fuer
  // Nachfrage zu halten.
  const testsZeigen = q.get("tests") === "ein"

  // „Um 16 Uhr habe ich etwas geaendert — sieht man das an den Zahlen?"
  //
  // `umstellung` schaltet den Vergleich ein. Das Fenster danach reicht vom
  // genannten Zeitpunkt bis jetzt; das Fenster davor ist GENAU SO LANG und
  // endet am Zeitpunkt. Gleich lang, weil alles andere der haeufigste
  // Trugschluss waere: Zwei Stunden gegen dreissig Tage zu stellen heisst,
  // eine Stichprobe von zwanzig gegen eine von zweitausend zu stellen.
  const umstellungRoh = q.get("umstellung")
  const umstellungDatum = umstellungRoh ? new Date(umstellungRoh) : null
  const umstellung =
    umstellungDatum && !Number.isNaN(umstellungDatum.getTime()) && umstellungDatum.getTime() < Date.now()
      ? umstellungDatum
      : null

  try {
    if (umstellung) {
      const jetzt = Date.now()
      const dauer = jetzt - umstellung.getTime()
      const fensterDanach: Fenster = { seit: umstellung.toISOString(), bis: null }
      const fensterDavor: Fenster = {
        seit: new Date(umstellung.getTime() - dauer).toISOString(),
        bis: umstellung.toISOString(),
      }
      // Gleiche Uhrzeit, ein Tag zurueck — gegen die Verwechslung von
      // Tageszeit mit Wirkung.
      const fensterVortag: Fenster = {
        seit: new Date(umstellung.getTime() - 86_400_000).toISOString(),
        bis: new Date(jetzt - 86_400_000).toISOString(),
      }

      const zeitraumDanach = {
        tage,
        seit: fensterDanach.seit,
        frei: true,
        tests_sichtbar: testsZeigen,
      }

      const [danach, davor, vortag] = await Promise.all([
        auswerten(svc, fensterDanach, zeitraumDanach, testsZeigen),
        auswerten(svc, fensterDavor, { ...zeitraumDanach, seit: fensterDavor.seit }, testsZeigen),
        auswerten(svc, fensterVortag, { ...zeitraumDanach, seit: fensterVortag.seit }, testsZeigen),
      ])

      const antwort = {
        ...danach,
        vergleich: baueVergleich(danach, davor, vortag, umstellung, dauer),
      }
      return antworten(antwort, q.get("format"))
    }

    const zeitraum = { tage, seit, frei: gueltigesVon !== null, tests_sichtbar: testsZeigen }
    const ergebnis = await auswerten(svc, { seit, bis: null }, zeitraum, testsZeigen)
    return antworten(ergebnis, q.get("format"))
  } catch (e) {
    console.error("[analytics/trichter]", e instanceof Error ? e.message : e)
    return NextResponse.json({ error: "Daten konnten nicht geladen werden." }, { status: 500 })
  }
}

/**
 * Dieselben Zahlen als JSON oder als Text.
 *
 * Erzeugt wird der Bericht HIER, nicht im Browser aus den JSON-Daten: So
 * steht in der Datei garantiert derselbe Stand, den die Auswertung
 * gerechnet hat, und die Regel-Texte liegen nicht doppelt vor.
 */
function antworten(daten: BerichtDaten, format: string | null) {
  if (format !== "text") return NextResponse.json(daten)
  const dateiname = `praxis-os-auswertung-${new Date().toISOString().slice(0, 10)}.md`
  return new NextResponse(berichtAlsText(daten), {
    headers: {
      "Content-Type": "text/markdown; charset=utf-8",
      "Content-Disposition": `attachment; filename="${dateiname}"`,
      "Cache-Control": "no-store",
    },
  })
}

/** „google.com" statt „https://www.google.com/search?q=…". */
function herkunftAusReferrer(referrer: string | null): string {
  if (!referrer) return "direkt"
  try {
    const host = new URL(referrer).hostname.replace(/^www\./, "")
    if (host.includes("praxis-os")) return "intern"
    return host
  } catch {
    return "direkt"
  }
}
