/**
 * Masterclass-Begleitung: zeitlich begrenzter App-Zugang (92 Tage).
 *
 * Getrennt vom Abo (`patient_subscriptions`), weil Stripe dort bei jeder
 * Abrechnung `current_period_end` überschreibt — angehängte Bonus-Tage wären
 * beim nächsten Monatswechsel still verschwunden. Grants sind entkoppelt,
 * stapelbar und laufen NIE automatisch weiter (kein Auto-Abo, § 312 BGB).
 *
 * Was der Grant steuert: die BEGLEITUNG (Chat mit dem Therapeuten).
 * Was er NICHT steuert: den Masterclass-Kurszugang (lebenslang via
 * content_entitlements) und den Blick aufs Übungsprogramm — beides bleibt
 * nach Ablauf sichtbar. Nur die Betreuung endet.
 */
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

export interface ChatAccess {
  allowed: boolean
  /** 'begleitung_ended' → Begleitung ist abgelaufen (Upsell zeigen). */
  reason?: "begleitung_ended"
  /** Ende der Begleitung — für die Anzeige („noch 12 Tage"). */
  endsAt?: string | null
  daysLeft?: number
}

/**
 * Darf dieser Patient im Chat schreiben?
 *
 * Reihenfolge ist wichtig:
 *   1. Laufende Begleitung  → ja (Masterclass-Käufer)
 *   2. Aktives Abo          → ja (regulärer Abonnent)
 *   3. Hatte mal eine Begleitung, die abgelaufen ist → NEIN (Chat schließt)
 *   4. Sonst                → ja (Bestandspatient ohne Abo-Datensatz, unverändert)
 *
 * Schritt 4 hält das bestehende Verhalten für Alt-Patienten unangetastet: wer nie
 * eine Begleitung hatte und keinen Abo-Datensatz besitzt, chattet wie bisher.
 * Der Lesezugriff auf den Verlauf bleibt in JEDEM Fall erhalten — es endet nur
 * die Betreuung, die Historie gehört dem Patienten.
 */
export async function canUseChat(
  supabase: ServiceClient,
  userId: string,
  patientId: string
): Promise<ChatAccess> {
  const begleitung = await getBegleitungStatus(supabase, userId)

  if (begleitung.active) {
    return { allowed: true, endsAt: begleitung.endsAt, daysLeft: begleitung.daysLeft }
  }

  const { data: sub } = await supabase
    .from("patient_subscriptions")
    .select("status")
    .eq("patient_id", patientId)
    .maybeSingle()

  if (sub && ["trial", "active"].includes(sub.status)) {
    return { allowed: true }
  }

  if (begleitung.everHadGrant) {
    return { allowed: false, reason: "begleitung_ended", endsAt: begleitung.endsAt }
  }

  return { allowed: true }
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
