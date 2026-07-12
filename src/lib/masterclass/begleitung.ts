/**
 * Masterclass-Kauf → 3 Monate Begleitung aktivieren.
 *
 * Wird vom Stripe-Webhook aufgerufen, nachdem die Kurs-Entitlements vergeben
 * sind. Vier Schritte, alle idempotent:
 *
 *   1. Käufer zum Patienten machen (Chat braucht patients.therapeut_id NOT NULL;
 *      ein `externer_kaeufer` ist von /app/* strukturell ausgesperrt).
 *   2. Zugangs-Grant über N Tage anlegen (stapelnd, siehe app-access.ts).
 *   3. Schmerzcheck-Lead attribuieren (converted_at) — endlich messbare Konversion.
 *   4. Max benachrichtigen: "Neuer Begleitungs-Patient, Betreuung bis X".
 *
 * Fehler in 3./4. dürfen den Kauf NIE scheitern lassen — der Kunde hat bezahlt.
 */
import type { createSupabaseServiceClient } from "@/lib/supabase-service"
import { upgradeBuyerToPatient } from "@/lib/buyer-upgrade"
import { grantAppAccess, revokeAppAccess, MASTERCLASS_THERAPIST_ID } from "@/lib/app-access"
import { sendEmail } from "@/lib/email"

type ServiceClient = ReturnType<typeof createSupabaseServiceClient>

const ADMIN_EMAIL = process.env.ADMIN_NOTIFY_EMAIL || "physiotherapieglawe@gmx.de"

export interface ActivateParams {
  userId: string
  days: number
  stripeSessionId: string
  productTitle: string
  /** Für die Attribution + die Benachrichtigung an Max. */
  email?: string | null
  amount?: number | null
  /** UTM aus der Stripe-Session (Mail → /go → Salespage → Checkout). */
  utm?: Record<string, string | undefined> | null
}

export interface ActivateResult {
  ok: boolean
  duplicate?: boolean
  /** Konto kommt für eine Begleitung nicht in Frage (z.B. Staff) — kein Fehler. */
  skipped?: boolean
  expiresAt?: string
  error?: string
}

export async function activateBegleitung(
  supabase: ServiceClient,
  params: ActivateParams
): Promise<ActivateResult> {
  const { userId, days, stripeSessionId, productTitle } = params

  // ── 0. Kommt dieses Konto überhaupt für eine Begleitung in Frage? ──────────
  // Ein Staff-Konto (Testkauf durch Max/Therapeut) lässt sich nicht zum Patienten
  // machen. Das ist KEIN Fehler — es darf nur nicht zu einem 500 führen, sonst
  // wiederholt Stripe den Webhook endlos.
  const { data: profile } = await supabase
    .from("user_profiles")
    .select("role")
    .eq("id", userId)
    .maybeSingle()

  const role = profile?.role
  if (role && !["externer_kaeufer", "patient"].includes(role)) {
    console.warn(
      `[begleitung] Konto ist "${role}" — keine Begleitung möglich (user=${userId}). ` +
        `Kurszugang wurde trotzdem vergeben.`
    )
    return { ok: true, skipped: true }
  }

  // ── 1. Rolle: externer_kaeufer → patient (idempotent, no-op bei Patienten) ──
  const upgrade = await upgradeBuyerToPatient({
    userId,
    therapeutId: MASTERCLASS_THERAPIST_ID,
  })

  if (!upgrade.upgraded && !upgrade.alreadyPatient) {
    // Echter Fehlschlag (DB) → 500 → Stripe wiederholt. Der Kunde hat bezahlt.
    console.error(
      `[begleitung] Upgrade zu Patient fehlgeschlagen user=${userId}: ${upgrade.error}`
    )
    return { ok: false, error: upgrade.error ?? "Upgrade fehlgeschlagen" }
  }

  // ── 2. Zugangs-Grant (stapelnd, idempotent über stripe_session_id) ──
  const grant = await grantAppAccess(supabase, { userId, days, stripeSessionId })

  if (grant.duplicate) {
    console.log(`[begleitung] Grant existiert bereits (Webhook-Retry) session=${stripeSessionId}`)
    return { ok: true, duplicate: true, expiresAt: grant.expiresAt }
  }
  if (!grant.granted) {
    return { ok: false, error: grant.error ?? "Grant fehlgeschlagen" }
  }

  const expiresAt = grant.expiresAt!

  // ── 3. + 4. Attribution + Benachrichtigung — dürfen den Kauf nicht brechen ──
  void attributeLead(supabase, params).catch((err) =>
    console.error("[begleitung] Lead-Attribution fehlgeschlagen:", err)
  )
  void notifyTherapist(supabase, { userId, expiresAt, productTitle, email: params.email }).catch(
    (err) => console.error("[begleitung] Benachrichtigung an Max fehlgeschlagen:", err)
  )

  return { ok: true, expiresAt }
}

/** Refund/Widerruf: Begleitung zurücknehmen + Lead-Konversion zurücksetzen. */
export async function revokeBegleitung(
  supabase: ServiceClient,
  stripeSessionId: string,
  email?: string | null
): Promise<void> {
  await revokeAppAccess(supabase, stripeSessionId, "refund")

  if (email) {
    await supabase
      .from("schmerzcheck_leads")
      .update({ converted_at: null, conversion_source: null, conversion_value: null })
      .eq("email", email.trim().toLowerCase())
  }
}

/**
 * Käufer-E-Mail gegen die Schmerzcheck-Leads matchen. Damit ist die Konversion
 * zum ersten Mal überhaupt sichtbar — beim externen Buchungs-Widget war sie es
 * nie (booked_at blieb bei 0 von 521 Leads).
 */
async function attributeLead(supabase: ServiceClient, params: ActivateParams): Promise<void> {
  if (!params.email) return

  const { data: lead } = await supabase
    .from("schmerzcheck_leads")
    .select("id, utm_source, utm_campaign, utm_content, converted_at")
    .eq("email", params.email.trim().toLowerCase())
    .maybeSingle()

  if (!lead || lead.converted_at) return // kein Lead, oder schon attribuiert

  // Die UTM aus der Stripe-Session sagt, welche MAIL den Kauf brachte (utm_content
  // = Mail-Code, z.B. "m2"). Die UTM am Lead sagt nur, welche ANZEIGE ihn damals
  // gebracht hat. Die Session gewinnt — sie ist näher am Geld.
  const sessionUtm = params.utm ?? {}
  const fromSession = [sessionUtm.utm_campaign, sessionUtm.utm_medium, sessionUtm.utm_content]
    .filter(Boolean)
    .join(" / ")

  const fromLead =
    [lead.utm_source, lead.utm_campaign, lead.utm_content].filter(Boolean).join(" / ") || "direkt"

  const source = fromSession || fromLead

  await supabase
    .from("schmerzcheck_leads")
    .update({
      converted_at: new Date().toISOString(),
      conversion_source: source,
      conversion_value: params.amount ?? null,
    })
    .eq("id", lead.id)

  console.log(`[begleitung] Schmerzcheck-Lead konvertiert: ${params.email} (${source})`)
}

/** Interne Mail an Max: neuer Begleitungs-Patient. */
async function notifyTherapist(
  supabase: ServiceClient,
  args: { userId: string; expiresAt: string; productTitle: string; email?: string | null }
): Promise<void> {
  const { data: profile } = await supabase
    .from("user_profiles")
    .select("first_name, last_name, email")
    .eq("id", args.userId)
    .maybeSingle()

  const name = [profile?.first_name, profile?.last_name].filter(Boolean).join(" ") || "—"
  const mail = profile?.email ?? args.email ?? "—"
  const bis = new Date(args.expiresAt).toLocaleDateString("de-DE", {
    day: "2-digit",
    month: "2-digit",
    year: "numeric",
  })

  await sendEmail({
    to: ADMIN_EMAIL,
    subject: `Neuer Begleitungs-Patient: ${name}`,
    html: `
      <p><strong>${args.productTitle}</strong> wurde gekauft — die 3-Monats-Begleitung ist aktiv.</p>
      <table cellpadding="6" style="border-collapse:collapse;font-family:sans-serif;font-size:14px">
        <tr><td><strong>Name</strong></td><td>${name}</td></tr>
        <tr><td><strong>E-Mail</strong></td><td>${mail}</td></tr>
        <tr><td><strong>Betreuung bis</strong></td><td>${bis}</td></tr>
      </table>
      <p style="font-family:sans-serif;font-size:14px">
        Der Patient taucht ab sofort in deiner Patientenliste auf (Badge „Masterclass-Begleitung").
        Zugesagte Antwortzeit im Chat: <strong>48 h werktags</strong>.
      </p>
    `,
  })
}
