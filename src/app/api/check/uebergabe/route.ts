/**
 * POST /api/check/uebergabe — die Check-Antworten ans Buchungstool reichen.
 *
 * Der Browser schickt eine fertige Klartext-Zeile, dieser Weg reicht sie
 * weiter und gibt den Kurz-Code zurück, den das Buchungstool ausstellt. Der
 * Code wandert dann als `?check=…` an den Kalender — die Antworten selbst
 * NIE. Was in einer Adresse steht, landet in Server-Protokollen, in der
 * eigenen Messung und beim Meta-Pixel; Angaben über Beschwerden haben an
 * allen drei Orten nichts verloren.
 *
 * ── Warum über den eigenen Server und nicht direkt ──────────────────────
 *
 * Direkt aus dem Browser auf eine fremde Domain zu schreiben hiesse: Der
 * Ablauf steht und fällt mit deren CORS-Einstellungen, und die Adresse des
 * Endpunkts stünde im ausgelieferten Skript. Hier bleibt sie in der
 * Umgebung des Servers, und die Gegenseite sieht eine gewöhnliche
 * Server-zu-Server-Anfrage.
 *
 * ── Was dieser Weg NICHT tut ────────────────────────────────────────────
 *
 * Er speichert nichts und protokolliert den Inhalt nicht. Im Fehlerfall
 * steht im Protokoll, DASS es nicht geklappt hat, nie WAS übergeben werden
 * sollte. Ein Logeintrag mit Gesundheitsangaben wäre genau der Datensatz,
 * den die Seite dem Besucher versprochen hat zu vermeiden.
 *
 * ── Und er darf nie im Weg stehen ───────────────────────────────────────
 *
 * Fehlt der Endpunkt, antwortet er langsam oder gar nicht, kommt hier
 * `{ token: null }` zurück — kein Fehler. Der Browser leitet dann ohne Code
 * zum Kalender weiter. Eine Buchung darf an einer Bequemlichkeit nicht
 * scheitern.
 */

import { NextRequest, NextResponse } from "next/server"
import { z } from "zod"
import { isRateLimited } from "@/lib/rate-limit"

/** Das Buchungstool — dieselbe Adresse wie in lib/booking-coordination. */
const BUCHUNGSTOOL = "https://my-first-app-psi-seven.vercel.app"

export const dynamic = "force-dynamic"

/**
 * Kürzer als die Frist im Browser (1,5 s).
 *
 * Sonst bricht dort der Abruf ab, während hier noch gewartet wird — und
 * das Buchungstool stellt einen Code aus, den niemand mehr abholt.
 */
const FRIST_MS = 1200

const schema = z.object({
  // Eine Zeile, keine Freitextwüste: Was hier ankommt, baut `zusammenfassung()`
  // aus festen Antwortmöglichkeiten. Die Obergrenze ist die Notbremse für
  // alles andere.
  zusammenfassung: z.string().min(1).max(400),
})

export async function POST(request: NextRequest) {
  const ip = request.headers.get("x-forwarded-for")?.split(",")[0]?.trim() ?? "unknown"
  if (isRateLimited(`check-uebergabe:${ip}`, 20, 60_000)) {
    return NextResponse.json({ token: null }, { status: 429 })
  }

  let text: string
  try {
    const body = schema.parse(await request.json())
    // Zeilenumbrüche raus: Das Ziel ist ein Formularfeld, keine Datei.
    text = body.zusammenfassung.replace(/[\r\n\t]+/g, " ").trim()
  } catch {
    return NextResponse.json({ token: null }, { status: 400 })
  }

  // Derselbe Dienst und derselbe Schluessel wie die Koordinations-API
  // (lib/booking-coordination): Das Buchungstool stellt den Kurz-Code unter
  // /api/check-notiz aus. Beides laesst sich per Env ueberschreiben, muss
  // aber nicht — eine Konfiguration, die man setzen MUSS, ist eine, die
  // beim naechsten Server fehlt.
  const basis = (process.env.BOOKING_COORDINATION_BASE_URL || BUCHUNGSTOOL).replace(/\/$/, "")
  const ziel = process.env.CHECK_UEBERGABE_URL || `${basis}/api/check-notiz`
  const schluessel = process.env.CHECK_UEBERGABE_SCHLUESSEL || process.env.PRAXIS_OS_API_KEY

  if (!schluessel) {
    // Ohne Schluessel weist die Gegenseite die Anfrage ohnehin ab (401).
    // Dann gar nicht erst fragen — und trotzdem kein Fehler: nur kein Code.
    return NextResponse.json({ token: null })
  }

  try {
    const abbruch = new AbortController()
    const uhr = setTimeout(() => abbruch.abort(), FRIST_MS)
    const antwort = await fetch(ziel, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "X-Api-Key": schluessel,
      },
      body: JSON.stringify({ note: text, source: "praxis-os-check" }),
      signal: abbruch.signal,
    })
    clearTimeout(uhr)

    if (!antwort.ok) {
      console.error("[check/uebergabe] Buchungstool antwortete mit", antwort.status)
      return NextResponse.json({ token: null })
    }

    const daten = (await antwort.json()) as { token?: unknown; code?: unknown }
    const code = typeof daten.token === "string" ? daten.token : typeof daten.code === "string" ? daten.code : null

    // Nur was wie ein Kurz-Code aussieht. Ein langer Wert waere entweder
    // ein Missverstaendnis oder der Versuch, die Antworten doch wieder in
    // die Adresse zu bekommen.
    const sauber = code && /^[A-Za-z0-9_-]{1,64}$/.test(code) ? code : null
    if (code && !sauber) console.error("[check/uebergabe] Unerwartetes Code-Format verworfen.")

    return NextResponse.json({ token: sauber })
  } catch {
    // Zeitüberschreitung oder Netzfehler. Der Inhalt bleibt aussen vor.
    console.error("[check/uebergabe] Übergabe fehlgeschlagen oder zu langsam.")
    return NextResponse.json({ token: null })
  }
}
