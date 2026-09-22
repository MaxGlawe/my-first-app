/**
 * PROJ-26: Zahlung eingegangen → Betreuung startet.
 *
 * Wird aus dem Stripe-Webhook aufgerufen. Reihenfolge und Fehlerverhalten sind
 * bewusst gewählt:
 *
 *   1. Vertrag als bezahlt markieren — das ist gleichzeitig die Idempotenz-
 *      Sperre (`paid_at IS NULL` als Bedingung, UNIQUE auf der Session).
 *   2. Login sicherstellen (der Patient hat i. d. R. schon eines aus der
 *      Terminbuchung; fehlt es, wird es hier angelegt).
 *   3. Zugang über `programm_tage` gewähren.
 *   4. Therapeut zuweisen — derjenige, der das Angebot erstellt hat.
 *   5. Rechnungsentwurf + Benachrichtigung.
 *
 * Schritte 4 und 5 dürfen den Kauf NIE scheitern lassen: der Patient hat
 * bezahlt, sein Zugang darf nicht an einer Rechnung hängen.
 */

import type { createSupabaseServiceClient } from "@/lib/supabase-service"
import { grantAppAccess } from "@/lib/app-access"
import { ensurePatientLogin } from "@/lib/patient-provisioning"
import { createProgrammInvoiceDraft } from "@/lib/billing/programm-invoice"
import { sendEmail } from "@/lib/email"
import type { Leistung } from "@/types/contract"

type ServiceClient = ReturnType<typeof createSupabaseServiceClient>

const ADMIN_EMAIL = process.env.ADMIN_NOTIFY_EMAIL || "physiotherapieglawe@gmx.de"

const STAFF_ROLES = new Set([
  "admin",
  "heilpraktiker",
  "physiotherapeut",
  "praeventionstrainer",
  "personal_trainer",
])

export interface AktivierungResult {
  ok: boolean
  duplicate?: boolean
  expiresAt?: string
  error?: string
}

export async function aktiviereProgramm(
  supabase: ServiceClient,
  args: { contractId: string; stripeSessionId: string; amountTotal: number | null }
): Promise<AktivierungResult> {
  const { contractId, stripeSessionId } = args

  const { data: contract } = await supabase
    .from("treatment_contracts")
    .select(
      "id, contract_number, patient_id, created_by, programm_tage, gesamtpreis, bereits_beglichen, leistungen, paid_at, patient_name, patient_email"
    )
    .eq("id", contractId)
    .maybeSingle()

  if (!contract) {
    // Kein Retry-Grund: der Vertrag existiert nicht (mehr).
    console.error(`[programm] Vertrag ${contractId} nicht gefunden (session=${stripeSessionId})`)
    return { ok: true, duplicate: true }
  }

  if (contract.paid_at) {
    console.log(`[programm] Vertrag ${contract.contract_number} war bereits bezahlt — Retry.`)
    return { ok: true, duplicate: true }
  }

  const tage = contract.programm_tage ?? 90
  const now = new Date()
  const widerrufBis = new Date(now.getTime() + 14 * 24 * 60 * 60 * 1000)

  // ── 1. Vertrag schließen (idempotent über paid_at IS NULL) ────────────────
  const { data: updated, error: updateError } = await supabase
    .from("treatment_contracts")
    .update({
      status: "unterschrieben",
      signed_at: now.toISOString(),
      paid_at: now.toISOString(),
      stripe_session_id: stripeSessionId,
      widerruf_bis: widerrufBis.toISOString().split("T")[0],
    })
    .eq("id", contract.id)
    .is("paid_at", null)
    .select("id")

  if (updateError) {
    // 23505 = eine parallele Zustellung war schneller.
    if (updateError.code === "23505") return { ok: true, duplicate: true }
    console.error("[programm] Vertrag konnte nicht geschlossen werden:", updateError.message)
    return { ok: false, error: updateError.message }
  }

  if (!updated?.length) {
    return { ok: true, duplicate: true }
  }

  // ── 2. Login sicherstellen ────────────────────────────────────────────────
  const { data: patient } = await supabase
    .from("patients")
    .select("id, user_id, vorname, nachname, email")
    .eq("id", contract.patient_id)
    .single()

  let userId = patient?.user_id as string | null | undefined

  if (!userId && patient?.email) {
    const provision = await ensurePatientLogin(supabase, {
      patientId: patient.id,
      email: patient.email,
      firstName: patient.vorname,
      lastName: patient.nachname,
    })
    if (provision.status === "error") {
      console.error("[programm] Login-Provisionierung fehlgeschlagen:", provision.error)
      return { ok: false, error: provision.error }
    }
    userId = provision.userId
  }

  if (!userId) {
    console.error(`[programm] Kein Konto für Patient ${contract.patient_id} — Zugang offen.`)
    return { ok: false, error: "Kein Patientenkonto vorhanden." }
  }

  // ── 3. Zugang gewähren ────────────────────────────────────────────────────
  const grant = await grantAppAccess(supabase, {
    userId,
    days: tage,
    stripeSessionId,
    plan: "praxis_os_programm",
  })

  if (!grant.granted && !grant.duplicate) {
    return { ok: false, error: grant.error ?? "Zugang konnte nicht gewährt werden." }
  }

  const expiresAt = grant.expiresAt

  // ── 4. + 5. Zuweisung, Rechnung, Benachrichtigung — nie den Kauf brechen ──
  void weiseTherapeutZu(supabase, contract.patient_id, contract.created_by).catch((err) =>
    console.error("[programm] Therapeutenzuweisung fehlgeschlagen:", err)
  )

  void createProgrammInvoiceDraft(supabase, {
    patientId: contract.patient_id,
    createdBy: contract.created_by,
    contractId: contract.id,
    contractNumber: contract.contract_number,
    amount: args.amountTotal != null ? args.amountTotal / 100 : betragAusVertrag(contract),
    leistungen: (contract.leistungen ?? []) as Leistung[],
    stripeSessionId,
  }).catch((err) => console.error("[programm] Rechnungsentwurf fehlgeschlagen:", err))

  void benachrichtige({
    patientName: contract.patient_name,
    patientEmail: contract.patient_email,
    contractNumber: contract.contract_number,
    expiresAt: expiresAt ?? null,
    tage,
  }).catch((err) => console.error("[programm] Benachrichtigung fehlgeschlagen:", err))

  console.log(
    `[programm] Betreuung aktiv: ${contract.contract_number}, user=${userId}, ${tage} Tage bis ${expiresAt}`
  )

  return { ok: true, expiresAt }
}

function betragAusVertrag(c: { gesamtpreis: number; bereits_beglichen: number | null }): number {
  return Math.max(0, c.gesamtpreis - (c.bereits_beglichen ?? 0))
}

/**
 * Der Therapeut, der das Angebot erstellt hat, wird betreuender Therapeut.
 * Damit hängt der Chat am richtigen Menschen — und wenn später Kolleginnen die
 * laufende Betreuung übernehmen, ist das Feld der Ort, an dem das passiert.
 */
async function weiseTherapeutZu(
  supabase: ServiceClient,
  patientId: string,
  createdBy: string
): Promise<void> {
  const { data: profile } = await supabase
    .from("user_profiles")
    .select("role")
    .eq("id", createdBy)
    .maybeSingle()

  if (!profile || !STAFF_ROLES.has(profile.role)) return

  await supabase.from("patients").update({ therapeut_id: createdBy }).eq("id", patientId)
}

async function benachrichtige(
  args: {
    patientName: string
    patientEmail: string | null
    contractNumber: string
    expiresAt: string | null
    tage: number
  }
): Promise<void> {
  const bis = args.expiresAt
    ? new Date(args.expiresAt).toLocaleDateString("de-DE", {
        day: "2-digit",
        month: "2-digit",
        year: "numeric",
      })
    : "—"

  await sendEmail({
    to: ADMIN_EMAIL,
    subject: `Programm gestartet: ${args.patientName}`,
    html: `
      <p style="font-family:sans-serif;font-size:14px">
        <strong>${args.patientName}</strong> hat das Angebot angenommen und bezahlt.
        Die Betreuung läuft ab sofort.
      </p>
      <table cellpadding="6" style="border-collapse:collapse;font-family:sans-serif;font-size:14px">
        <tr><td><strong>Vertrag</strong></td><td>${args.contractNumber}</td></tr>
        <tr><td><strong>E-Mail</strong></td><td>${args.patientEmail ?? "—"}</td></tr>
        <tr><td><strong>Betreuung bis</strong></td><td>${bis} (${args.tage} Tage)</td></tr>
      </table>
      <p style="font-family:sans-serif;font-size:14px">
        Als Nächstes: Plan anlegen (tägliche Micro-Übungen + Trainingsplan) und den
        ersten Video-Call vereinbaren.
      </p>
    `,
  })
}
