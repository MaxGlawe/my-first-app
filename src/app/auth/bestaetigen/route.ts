import { NextResponse, type NextRequest } from "next/server"
import type { EmailOtpType } from "@supabase/supabase-js"
import { createSupabaseServerClient } from "@/lib/supabase-server"

/**
 * Anmeldung über den Link aus unseren Mails — serverseitig.
 *
 * ── Warum es diese Route gibt (06.11.2026) ──────────────────────────────
 *
 * Bis hierher zeigten die Links auf Supabases eigenen `/auth/v1/verify`.
 * Der leitet danach mit den Schlüsseln HINTER EINEM DOPPELKREUZ weiter:
 * `/app/dashboard#access_token=…`. Diesen Teil schickt der Browser nie an
 * den Server — die Middleware sah also niemanden angemeldet, leitete auf
 * /login, und auch dort griff ihn niemand auf (der Browser-Client arbeitet
 * mit PKCE und verwirft solche Adressen). Die erste Patientin, die das
 * Programm kaufte, landete so in einer Schleife aus „E-Mail oder Passwort
 * ist falsch" — ohne je ein Passwort gehabt zu haben.
 *
 * Jetzt trägt der Link den gehashten Token in der Abfrage, und HIER wird
 * er eingelöst: `verifyOtp` setzt die Sitzungs-Cookies direkt in der
 * Antwort, danach geht es zum Ziel. Steht dort noch die Passwortpflicht,
 * schickt die Middleware weiter zu „Passwort festlegen".
 *
 * `next` darf nur ein Pfad auf dieser Seite sein — sonst wäre das eine
 * offene Weiterleitung mit unserem Namen davor.
 */

const ERLAUBTE_TYPEN: EmailOtpType[] = ["magiclink", "recovery", "invite", "email", "signup"]

function sichererPfad(roh: string | null): string {
  if (!roh || !roh.startsWith("/") || roh.startsWith("//") || roh.includes("\\")) {
    return "/app/dashboard"
  }
  return roh
}

export async function GET(request: NextRequest) {
  const { searchParams, origin } = request.nextUrl
  const tokenHash = searchParams.get("token_hash")
  const typ = searchParams.get("type") as EmailOtpType | null
  const ziel = sichererPfad(searchParams.get("next"))

  if (tokenHash && typ && ERLAUBTE_TYPEN.includes(typ)) {
    const supabase = await createSupabaseServerClient()
    const { error } = await supabase.auth.verifyOtp({ type: typ, token_hash: tokenHash })
    if (!error) {
      return NextResponse.redirect(new URL(ziel, origin))
    }
    console.error("[auth/bestaetigen] Link nicht einloesbar:", error.message)
  }

  // Abgelaufen, schon benutzt oder verstümmelt: Auf der Anmeldeseite steht
  // dann, was passiert ist und wie es weitergeht — statt eines stummen
  // Formulars, das „E-Mail oder Passwort falsch" meldet.
  return NextResponse.redirect(new URL("/login?error=link_ungueltig", origin))
}
