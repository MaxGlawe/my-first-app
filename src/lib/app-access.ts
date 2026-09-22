/**
 * Zugang zur Patienten-App: befristete Betreuungs-Grants + Zugangszustand.
 *
 * Grants sind getrennt vom Abo (`patient_subscriptions`), weil Stripe dort bei
 * jeder Abrechnung `current_period_end` überschreibt — angehängte Tage wären
 * beim nächsten Monatswechsel still verschwunden. Grants sind entkoppelt,
 * stapelbar und laufen NIE automatisch weiter (kein Auto-Abo, § 312 BGB).
 *
 * Was ein Grant steuert: die BETREUUNG (Chat, Check-ins, neue Pläne).
 * Was er NICHT steuert: den Blick zurück. Nach Ablauf bleibt der Verlauf
 * lesbar (`programm_beendet`), und ein Masterclass-Kurszugang bleibt ohnehin
 * lebenslang bestehen (content_entitlements). Es endet nur die Betreuung.
 *
 * `getAccessState()` weiter unten ist die EINZIGE Stelle, an der entschieden
 * wird, wer hinein darf und wer schreiben darf — Middleware wie API-Routen.
 */
import { NextResponse } from "next/server"
import type { createSupabaseServiceClient } from "@/lib/supabase-service"

type ServiceClient = ReturnType<typeof createSupabaseServiceClient>

/** Therapeut, dem Masterclass-Käufer zugeordnet werden (Chat-Partner). */
export const MASTERCLASS_THERAPIST_ID =
  process.env.MASTERCLASS_THERAPIST_ID || "3dea2c76-7a14-4172-9f73-8ef3219a47de" // Max Glawe

export interface GrantRow {
  id: string
  expires_at: string
  starts_at: string
  plan: string
  revoked_at: string | null
}

export interface BegleitungStatus {
  /** Läuft gerade eine bezahlte Begleitung? */
  active: boolean
  /** Ende der (ggf. gestapelten) Begleitung — ISO. */
  endsAt: string | null
  /** Hatte der User jemals eine Begleitung? (unterscheidet "abgelaufen" von "nie gehabt") */
  everHadGrant: boolean
  /** Verbleibende volle Tage (0, wenn abgelaufen). */
  daysLeft: number
}

/**
 * Status der Begleitung. Ein Grant zählt als aktiv, solange er nicht widerrufen
 * ist und sein Ablaufdatum in der Zukunft liegt. Gestapelte Grants schließen
 * lückenlos aneinander an (siehe grantAppAccess) → das späteste `expires_at`
 * ist das Enddatum.
 */
export async function getBegleitungStatus(
  supabase: ServiceClient,
  userId: string
): Promise<BegleitungStatus> {
  const { data, error } = await supabase
    .from("app_access_grants")
    .select("id, starts_at, expires_at, plan, revoked_at")
    .eq("user_id", userId)
    .is("revoked_at", null)
    .order("expires_at", { ascending: false })
    .limit(1)

  if (error) {
    console.error("[app-access] Grant-Abfrage fehlgeschlagen:", error.message)
    // Fail open: ein DB-Hiccup darf einem zahlenden Kunden nicht den Chat wegnehmen.
    // (Anders als beim Mailversand ist "zu viel Zugang" hier das harmlosere Risiko.)
    return { active: false, endsAt: null, everHadGrant: false, daysLeft: 0 }
  }

  const latest = data?.[0]
  if (!latest) return { active: false, endsAt: null, everHadGrant: false, daysLeft: 0 }

  const expiresAt = new Date(latest.expires_at).getTime()
  const now = Date.now()
  const active = expiresAt > now

  return {
    active,
    endsAt: latest.expires_at,
    everHadGrant: true,
    daysLeft: active ? Math.ceil((expiresAt - now) / 86_400_000) : 0,
  }
}

/** Schlanke Variante für die Middleware — nur "ja/nein". */
export async function hasActiveAppGrant(supabase: ServiceClient, userId: string): Promise<boolean> {
  const { data } = await supabase
    .from("app_access_grants")
    .select("id")
    .eq("user_id", userId)
    .is("revoked_at", null)
    .gt("expires_at", new Date().toISOString())
    .limit(1)
  return !!data?.length
}

// ── Zugangszustand: die EINZIGE Wahrheit ────────────────────────────────────
//
// PROJ-26. Vorher gab es zwei: `canUseChat()` sagte „Chat zu, Übungen bleiben",
// die Middleware warf denselben Patienten komplett aus /app. Im neuen Modell
// kommt JEDER Programmpatient über den Buchungskalender (account_origin =
// 'booking') — der Widerspruch hätte also jeden Einzelnen an Tag 91 getroffen.
// Middleware und Schreib-Endpunkte fragen ab jetzt dieselbe Funktion.

export type AccessState =
  /** Bezahlte 90-Tage-Betreuung läuft. */
  | "programm_aktiv"
  /** Erhaltungsphase (16,99 €/Monat) läuft. */
  | "erhaltung_aktiv"
  /** Betreuung gelaufen, nicht verlängert → Verlauf lesbar, nichts Neues. */
  | "programm_beendet"
  /** Konto existiert, war aber nie im Programm → kein Zugang zu /app. */
  | "gesperrt"
  /** Bestandspatient ohne Abrechnungsdatensatz → unverändertes Altverhalten. */
  | "bestandspatient"

export interface AccessInfo {
  state: AccessState
  /** Darf /app überhaupt betreten werden? */
  canEnter: boolean
  /** Darf Neues angelegt werden (Check-in, Training, Quiz, Chat)? */
  canWrite: boolean
  /** Ende der Betreuung — für „beendet am TT.MM.JJJJ". */
  endsAt: string | null
  /**
   * Verbleibende Tage — NUR bei laufender Betreuung, sonst null.
   * Wichtig: nicht 0 zurückgeben, sonst zeigt die Oberfläche „läuft noch 0 Tage".
   */
  daysLeft: number | null
}

/** Text für die 403-Antwort, wenn die Betreuung ausgelaufen ist. */
export const WRITE_BLOCKED_ENDED =
  "Deine Betreuung ist beendet. Dein Verlauf bleibt dir erhalten — für neue Einträge sprich bitte deinen Therapeuten an."

/** Text für die 403-Antwort, wenn nie eine Betreuung bestand. */
export const WRITE_BLOCKED_LOCKED =
  "Für diesen Bereich brauchst du eine laufende Betreuung. Der Einstieg läuft über eine persönliche Videokonsultation."

/** Passende Meldung zum Zustand — damit alle Endpunkte identisch antworten. */
export function writeBlockedMessage(state: AccessState): string {
  return state === "programm_beendet" ? WRITE_BLOCKED_ENDED : WRITE_BLOCKED_LOCKED
}

/**
 * Zugangszustand eines Patienten. Reihenfolge ist bewusst:
 *
 *   1. Laufende Betreuung        → voller Zugriff
 *   2. Laufende Erhaltungsphase  → voller Zugriff
 *   3. Betreuung war da, ist aus → LESEN (der neue dritte Zustand)
 *   4. Abo-Datensatz oder via Buchung provisioniert, nie Betreuung → gesperrt
 *   5. Sonst                     → Bestandspatient, unverändert
 *
 * `accountOrigin` kommt aus `user.app_metadata.account_origin` (nicht
 * user-editierbar) und markiert via Buchungstool provisionierte Konten.
 *
 * Aufrufer stellen sicher, dass ein Patientendatensatz existiert — ohne einen
 * solchen greift die Sperre wie bisher nicht.
 */
export async function getAccessState(
  supabase: ServiceClient,
  args: { userId: string; patientId: string; accountOrigin?: string | null }
): Promise<AccessInfo> {
  const { userId, patientId, accountOrigin } = args

  const betreuung = await getBegleitungStatus(supabase, userId)

  if (betreuung.active) {
    return {
      state: "programm_aktiv",
      canEnter: true,
      canWrite: true,
      endsAt: betreuung.endsAt,
      daysLeft: betreuung.daysLeft,
    }
  }

  const { data: sub } = await supabase
    .from("patient_subscriptions")
    .select("status")
    .eq("patient_id", patientId)
    .maybeSingle()

  if (sub && ["trial", "active"].includes(sub.status)) {
    return {
      state: "erhaltung_aktiv",
      canEnter: true,
      canWrite: true,
      endsAt: betreuung.endsAt,
      daysLeft: null,
    }
  }

  if (betreuung.everHadGrant) {
    return {
      state: "programm_beendet",
      canEnter: true,
      canWrite: false,
      endsAt: betreuung.endsAt,
      daysLeft: null,
    }
  }

  if (sub || accountOrigin === "booking") {
    return { state: "gesperrt", canEnter: false, canWrite: false, endsAt: null, daysLeft: null }
  }

  return { state: "bestandspatient", canEnter: true, canWrite: true, endsAt: null, daysLeft: null }
}

/**
 * Schreib-Gate für Patienten-Endpunkte.
 *
 * Gibt `null` zurück, wenn geschrieben werden darf — sonst eine fertige
 * 403-Antwort. Damit antworten alle Endpunkte identisch, und die Regel steht
 * an genau einer Stelle.
 *
 * Wichtig: Dieses Gate gehört in JEDE schreibende /api/me-Route. Die Middleware
 * greift ausschließlich bei Seitenaufrufen unter `/app` — API-Routen hat sie
 * noch nie erfasst.
 */
export async function requireWriteAccess(
  supabase: ServiceClient,
  args: { userId: string; patientId: string; accountOrigin?: string | null }
): Promise<NextResponse | null> {
  const access = await getAccessState(supabase, args)
  if (access.canWrite) return null

  return NextResponse.json(
    {
      error: writeBlockedMessage(access.state),
      code: access.state,
      endsAt: access.endsAt,
    },
    { status: 403 }
  )
}

export interface GrantResult {
  granted: boolean
  /** true, wenn diese Stripe-Session schon einen Grant hatte (Webhook-Retry). */
  duplicate?: boolean
  expiresAt?: string
  error?: string
}

/**
 * Legt einen Zugangs-Grant an. **Stapelnd**: Hat der User bereits eine laufende
 * Begleitung (oder ein Bestandsabo, dessen Ende übergeben wird), beginnt der
 * neue Zeitraum erst dort, wo der alte endet — die Tage verpuffen nicht.
 *
 * Idempotent über `stripe_session_id UNIQUE`: derselbe Kauf kann NIE zwei Grants
 * erzeugen, auch wenn Stripe den Webhook mehrfach zustellt.
 */
export async function grantAppAccess(
  supabase: ServiceClient,
  params: {
    userId: string
    days: number
    stripeSessionId: string
    plan?: string
  }
): Promise<GrantResult> {
  const { userId, days, stripeSessionId, plan = "masterclass_begleitung" } = params

  // Bereits vergeben? (Retry) — vor dem Insert prüfen, damit wir sauber loggen.
  const { data: existing } = await supabase
    .from("app_access_grants")
    .select("id, expires_at")
    .eq("stripe_session_id", stripeSessionId)
    .maybeSingle()

  if (existing) {
    return { granted: false, duplicate: true, expiresAt: existing.expires_at }
  }

  // Stapeln: an das späteste laufende Ende anhängen, sonst ab jetzt.
  const current = await getBegleitungStatus(supabase, userId)
  const startsAt =
    current.active && current.endsAt ? new Date(current.endsAt) : new Date()
  const expiresAt = new Date(startsAt.getTime() + days * 86_400_000)

  const { error } = await supabase.from("app_access_grants").insert({
    user_id: userId,
    plan,
    starts_at: startsAt.toISOString(),
    expires_at: expiresAt.toISOString(),
    source: `stripe:${stripeSessionId}`,
    stripe_session_id: stripeSessionId,
  })

  if (error) {
    // 23505 = unique_violation → paralleler Webhook war schneller. Kein Fehler.
    if (error.code === "23505") {
      return { granted: false, duplicate: true }
    }
    console.error("[app-access] Grant fehlgeschlagen:", error.message)
    return { granted: false, error: error.message }
  }

  console.log(
    `[app-access] Begleitung gewährt user=${userId} plan=${plan} ` +
      `${startsAt.toISOString()} → ${expiresAt.toISOString()} (${days}d, session=${stripeSessionId})`
  )
  return { granted: true, expiresAt: expiresAt.toISOString() }
}

/** Widerruf bei Refund/Rückerstattung. Idempotent. */
export async function revokeAppAccess(
  supabase: ServiceClient,
  stripeSessionId: string,
  reason = "refund"
): Promise<boolean> {
  const { data, error } = await supabase
    .from("app_access_grants")
    .update({ revoked_at: new Date().toISOString(), revoke_reason: reason })
    .eq("stripe_session_id", stripeSessionId)
    .is("revoked_at", null)
    .select("id, user_id")

  if (error) {
    console.error("[app-access] Widerruf fehlgeschlagen:", error.message)
    return false
  }
  if (data?.length) {
    console.log(`[app-access] Begleitung widerrufen (${reason}) session=${stripeSessionId}`)
  }
  return true
}
