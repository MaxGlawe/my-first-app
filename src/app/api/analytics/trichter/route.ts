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
 * ?tage=7|30|90   (Voreinstellung 30)
 */

import { NextRequest, NextResponse } from "next/server"
import { createSupabaseServerClient } from "@/lib/supabase-server"
import { createSupabaseServiceClient } from "@/lib/supabase-service"

export const dynamic = "force-dynamic"

const STAFF = ["admin"]

/** Seiten, die kein Besuchsziel sind — sie verfaelschen die Absprungrate. */
const RECHTLICH = new Set(["/impressum", "/datenschutz", "/agb", "/widerruf"])

/**
 * Die Abschnitte der Startseite in Leserichtung. Die Reihenfolge ist die
 * Aussage: Sie zeigt, an welcher Stelle das Lesen aufhoert. Muss zu den IDs
 * in `app/page.tsx` passen.
 */
const ABSCHNITTE: { id: string; titel: string }[] = [
  { id: "was-ist-praxis-os", titel: "Was ist Praxis OS" },
  { id: "ablauf", titel: "Ablauf" },
  { id: "wer-betreut-dich", titel: "Wer betreut dich" },
  { id: "eignung", titel: "Passt das zu mir" },
  { id: "preis", titel: "Preis" },
  { id: "faq", titel: "Häufige Fragen" },
]

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

  const tage = Math.min(365, Math.max(1, Number(request.nextUrl.searchParams.get("tage")) || 30))
  const seit = new Date(Date.now() - tage * 86_400_000).toISOString()

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
    referrer: string | null
    device_type: string | null
    browser: string | null
  }[] = []

  for (let seite = 0; seite < 20; seite++) {
    const { data, error } = await svc
      .from("page_views")
      .select(
        "session_id, path, created_at, utm_source, utm_campaign, utm_content, referrer, device_type, browser"
      )
      .gte("created_at", seit)
      .order("created_at", { ascending: true })
      .range(seite * 1000, seite * 1000 + 999)

    if (error) {
      console.error("[analytics/trichter] page_views:", error.message)
      return NextResponse.json({ error: "Daten konnten nicht geladen werden." }, { status: 500 })
    }
    aufrufe.push(...(data ?? []))
    if (!data || data.length < 1000) break
  }

  const { data: ereignisse } = await svc
    .from("conversion_events")
    .select("session_id, event_type, path, created_at")
    .gte("created_at", seit)
    .limit(20000)

  // ── Eigene Besuche aussortieren ────────────────────────────────────────
  //
  // Seit dem 10.10.2026 verhindert `lib/intern` schon das Senden. Fuer die
  // Zeit davor — und fuer Testlinks mit utm_content=test — wird hier noch
  // einmal gefiltert: Wer die Seite baut, scrollt gezielt zum Preis und
  // klickt den Buchungsbutton zum Pruefen. Bei 442 Sitzungen im Monat
  // verschiebt das die Klickrate sichtbar.
  const intern = new Set(
    aufrufe.filter((a) => a.utm_content === "test").map((a) => a.session_id)
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
      })
    } else {
      vorhanden.letzte = a.path
      vorhanden.seiten++
    }
  }

  for (const e of ereignisse ?? []) {
    const s = sitzungen.get(e.session_id)
    if (!s) continue
    if (e.event_type === "konsultation_klick") s.klick = true

    const tiefe = /^lesetiefe_(\d+)$/.exec(e.event_type)
    if (tiefe) s.lesetiefe = Math.max(s.lesetiefe, Number(tiefe[1]))

    const zeit = /^aktivzeit_(\d+)$/.exec(e.event_type)
    if (zeit) s.aktiv = Math.max(s.aktiv, Number(zeit[1]))

    const abschnitt = /^abschnitt_(.+)$/.exec(e.event_type)
    if (abschnitt) s.abschnitte.add(abschnitt[1])
  }

  const alle = [...sitzungen.values()]
  const gesamt = alle.length

  // ── Der Trichter ───────────────────────────────────────────────────────
  //
  // „Geblieben": mehr als eine Seite ODER ein Viertel gelesen ODER
  // mindestens 15 Sekunden wirklich da. Drei Wege, weil keiner allein
  // genuegt — eine Salespage braucht keine zweite Seite, wer sofort
  // weiterklickt hat nicht gelesen, und wer liest ohne zu scrollen (kurzes
  // Fenster, grosse Schrift) wuerde sonst durchfallen.
  const geblieben = (s: Sitzung) => s.seiten > 1 || s.lesetiefe >= 25 || s.aktiv >= 15

  // „Preis gesehen": der Abschnitt stand im Fenster. Fuer Sitzungen auf
  // Seiten ohne Abschnittsmessung (Stadtseiten, Shop) tritt die Lesetiefe
  // ein — sonst waere die Stufe dort immer null und der Trichter log.
  const preisGesehen = (s: Sitzung) => s.abschnitte.has("preis") || s.lesetiefe >= 75

  const dageblieben = alle.filter(geblieben)
  const beimPreis = alle.filter(preisGesehen)
  const geklickt = alle.filter((s) => s.klick)

  // Buchungen kommen NICHT aus der Website-Messung: Gebucht wird auf einer
  // fremden Domaene. Sie werden deshalb direkt aus den Terminen gezaehlt.
  // `referrer_content = 'test'` markiert eigene Testbuchungen — dieselbe
  // Vereinbarung wie auf der Website (siehe lib/intern). Bei einer Handvoll
  // echter Buchungen im Monat wuerde eine Testbuchung die letzte Stufe
  // verdoppeln.
  const { data: termine } = await svc
    .from("appointments")
    .select("id, referrer_source, referrer_campaign, referrer_content, service_name")
    .gte("created_at", seit)
    .ilike("service_name", "%video%")
    .or("referrer_content.is.null,referrer_content.neq.test")
    .limit(2000)

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
      stufe: "Buchung angeklickt",
      anzahl: geklickt.length,
      anteil: anteil(geklickt.length),
      hinweis: "Klick auf „Konsultation buchen“",
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
  let vorige: number | null = null
  const leiter = ABSCHNITTE.map((a) => {
    const erreicht = alle.filter((s) => s.abschnitte.has(a.id)).length
    const haltequote = vorige && vorige > 0 ? Math.round((erreicht / vorige) * 1000) / 10 : null
    vorige = erreicht
    return {
      id: a.id,
      titel: a.titel,
      erreicht,
      anteil: anteil(erreicht),
      haltequote,
    }
  })
  const abschnitteGemessen = alle.some((s) => s.abschnitte.size > 0)

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

  // ── Buchungen nach Herkunft ────────────────────────────────────────────
  //
  // Erst seit PROJ-88 sendet das Buchungstool die Herkunft mit. Aeltere
  // Termine tragen NULL — sie als „direkt" zu zaehlen waere eine Erfindung,
  // deshalb stehen sie getrennt als „ohne Angabe".
  const buchungProQuelle = new Map<string, number>()
  let buchungOhneHerkunft = 0
  for (const t of termine ?? []) {
    const q = (t.referrer_source as string | null)?.trim()
    if (!q) buchungOhneHerkunft++
    else buchungProQuelle.set(q, (buchungProQuelle.get(q) ?? 0) + 1)
  }
  const buchungen_nach_quelle = [...buchungProQuelle.entries()]
    .map(([quelle, anzahl]) => ({ quelle, anzahl }))
    .sort((a, b) => b.anzahl - a.anzahl)

  return NextResponse.json({
    zeitraum: { tage, seit },
    gesamt,
    intern_ausgeschlossen: intern.size,
    trichter,
    leiter: abschnitteGemessen ? leiter : null,
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
    buchungen_ohne_herkunft: buchungOhneHerkunft,
    seitenProSitzung: {
      eine: alle.filter((s) => s.seiten === 1).length,
      zweiBisVier: alle.filter((s) => s.seiten >= 2 && s.seiten <= 4).length,
      fuenfPlus: alle.filter((s) => s.seiten >= 5).length,
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
