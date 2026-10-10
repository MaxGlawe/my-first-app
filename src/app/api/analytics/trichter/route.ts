/**
 * GET /api/analytics/trichter — wo der Besucher verloren geht.
 *
 * Das bestehende `website-summary` zaehlt: Besucher, Seitenaufrufe, Top-Seiten,
 * Quellen. Alles richtig, und alles nebeneinander — man sieht Zahlen, aber
 * keinen Weg. Die Frage „wo springt er ab" liess sich daraus nicht lesen.
 *
 * Hier wird stattdessen JEDE SITZUNG rekonstruiert: Welche Seite zuerst,
 * welche zuletzt, wie viele dazwischen, wie weit gelesen, ob geklickt. Daraus
 * ergeben sich die vier Zahlen, die zaehlen.
 *
 * Was die ersten dreissig Tage zeigten (10.10.2026):
 *   442 Sitzungen, 404 davon (91 %) sahen genau EINE Seite.
 *   218 Sitzungen aus bezahlter Meta-Werbung — null mit irgendeinem Ereignis.
 * Das ist keine Schwaeche der Messung, das ist das Ergebnis.
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

interface Sitzung {
  erste: string
  letzte: string
  seiten: number
  quelle: string
  geraet: string
  start: string
  lesetiefe: number
  klick: boolean
  ereignisse: string[]
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
    referrer: string | null
    device_type: string | null
  }[] = []

  for (let seite = 0; seite < 20; seite++) {
    const { data, error } = await svc
      .from("page_views")
      .select("session_id, path, created_at, utm_source, referrer, device_type")
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
    .limit(5000)

  // ── Sitzungen zusammensetzen ───────────────────────────────────────────
  const sitzungen = new Map<string, Sitzung>()

  for (const a of aufrufe) {
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
        geraet: a.device_type || "unbekannt",
        start: a.created_at,
        lesetiefe: 0,
        klick: false,
        ereignisse: [],
      })
    } else {
      vorhanden.letzte = a.path
      vorhanden.seiten++
    }
  }

  for (const e of ereignisse ?? []) {
    const s = sitzungen.get(e.session_id)
    if (!s) continue
    s.ereignisse.push(e.event_type)
    if (e.event_type === "konsultation_klick") s.klick = true
    const m = /^lesetiefe_(\d+)$/.exec(e.event_type)
    if (m) s.lesetiefe = Math.max(s.lesetiefe, Number(m[1]))
  }

  const alle = [...sitzungen.values()]
  const gesamt = alle.length

  // ── Der Trichter ───────────────────────────────────────────────────────
  //
  // „Geblieben" heisst: mehr als eine Seite ODER mindestens ein Viertel
  // gelesen. Beides zeigt, dass jemand nicht sofort wieder weg war — und
  // keines der beiden allein genuegt: Eine Salespage braucht keine zweite
  // Seite, und wer sofort weiterklickt, hat vielleicht gar nicht gelesen.
  const geblieben = alle.filter((s) => s.seiten > 1 || s.lesetiefe >= 25)
  const gelesen = alle.filter((s) => s.lesetiefe >= 50 || s.seiten >= 3)
  const geklickt = alle.filter((s) => s.klick)

  // Buchungen kommen NICHT aus der Website-Messung: Gebucht wird auf einer
  // fremden Domaene. Sie werden deshalb direkt aus den Terminen gezaehlt.
  const { count: buchungen } = await svc
    .from("appointments")
    .select("id", { count: "exact", head: true })
    .gte("created_at", seit)
    .ilike("service_name", "%video%")

  const anteil = (n: number) => (gesamt > 0 ? Math.round((n / gesamt) * 1000) / 10 : 0)

  const trichter = [
    { stufe: "Besucher", anzahl: gesamt, anteil: 100, hinweis: "Sitzungen im Zeitraum" },
    {
      stufe: "Geblieben",
      anzahl: geblieben.length,
      anteil: anteil(geblieben.length),
      hinweis: "mehr als eine Seite oder mind. 25 % gelesen",
    },
    {
      stufe: "Gelesen",
      anzahl: gelesen.length,
      anteil: anteil(gelesen.length),
      hinweis: "mind. die Hälfte gelesen oder drei Seiten",
    },
    {
      stufe: "Buchung angeklickt",
      anzahl: geklickt.length,
      anteil: anteil(geklickt.length),
      hinweis: "Klick auf „Konsultation buchen“",
    },
    {
      stufe: "Termin gebucht",
      anzahl: buchungen ?? 0,
      anteil: anteil(buchungen ?? 0),
      hinweis: "Videotermine im Buchungskalender",
    },
  ]

  // ── Wo die Sitzung endet ───────────────────────────────────────────────
  const aufrufeProSeite = new Map<string, number>()
  for (const a of aufrufe) aufrufeProSeite.set(a.path, (aufrufeProSeite.get(a.path) ?? 0) + 1)

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
    if (s.seiten > 1 || s.lesetiefe >= 25) e.geblieben++
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
  const quelleMap = new Map<string, { sitzungen: number; geblieben: number; klicks: number }>()
  for (const s of alle) {
    const q = quelleMap.get(s.quelle) ?? { sitzungen: 0, geblieben: 0, klicks: 0 }
    q.sitzungen++
    if (s.seiten > 1 || s.lesetiefe >= 25) q.geblieben++
    if (s.klick) q.klicks++
    quelleMap.set(s.quelle, q)
  }
  const quellen = [...quelleMap.entries()]
    .map(([quelle, q]) => ({
      quelle,
      ...q,
      bleiberate: Math.round((q.geblieben / q.sitzungen) * 1000) / 10,
      klickrate: Math.round((q.klicks / q.sitzungen) * 1000) / 10,
    }))
    .sort((a, b) => b.sitzungen - a.sitzungen)
    .slice(0, 10)

  // ── Wie weit gelesen wird ──────────────────────────────────────────────
  const lesetiefe = [0, 25, 50, 75, 100].map((marke) => ({
    marke,
    anzahl: alle.filter((s) => s.lesetiefe >= marke).length,
  }))
  const lesetiefeGemessen = alle.some((s) => s.lesetiefe > 0)

  return NextResponse.json({
    zeitraum: { tage, seit },
    gesamt,
    trichter,
    absprung,
    einstieg,
    quellen,
    lesetiefe: lesetiefeGemessen ? lesetiefe : null,
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
