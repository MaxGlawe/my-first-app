import { createSupabaseServiceClient } from "@/lib/supabase-service"

export interface UpgradeBuyerParams {
  /** Login (auth user id) of the externer_kaeufer to upgrade */
  userId: string
  /** Therapist the new patient record is assigned to */
  therapeutId: string
  /** Optional overrides from a booking payload — fall back to user_profiles */
  vorname?: string | null
  nachname?: string | null
  geburtsdatum?: string | null
  telefon?: string | null
  bookingSystemId?: string | null
}

export interface UpgradeBuyerResult {
  upgraded: boolean
  patientId?: string
  /** true if the user was already a patient (idempotent no-op) */
  alreadyPatient?: boolean
  error?: string
}

/**
 * Upgrades an "externer_kaeufer" account to a full patient account.
 *  - changes the role in user_profiles  (externer_kaeufer → patient)
 *  - creates a patients record linked to the SAME login (user_id)
 *  - content entitlements stay untouched — they are keyed to user_id, so
 *    purchased courses carry over automatically
 *
 * Idempotent: calling it for an already-upgraded user is a safe no-op.
 * On a failed patient insert the role change is rolled back.
 *
 * Aufgerufen vom Booking-Webhook: bucht ein externer Käufer die Video-Analyse,
 * gleicht der Webhook die E-Mail ab und ruft diese Funktion direkt auf.
 */
export async function upgradeBuyerToPatient(
  params: UpgradeBuyerParams
): Promise<UpgradeBuyerResult> {
  const sc = createSupabaseServiceClient()
  const { userId, therapeutId } = params

  // ── Fetch current profile (user_profiles holds name/email for every role) ──
  const { data: profile } = await sc
    .from("user_profiles")
    .select("role, email, first_name, last_name")
    .eq("id", userId)
    .single()

  if (!profile) {
    return { upgraded: false, error: "User nicht gefunden." }
  }

  // ── Idempotency ──
  if (profile.role === "patient") {
    return { upgraded: false, alreadyPatient: true }
  }
  if (profile.role !== "externer_kaeufer") {
    return {
      upgraded: false,
      error: `Upgrade nicht möglich. Aktuelle Rolle: ${profile.role}`,
    }
  }

  // ── Step 1: role → patient ──
  const { error: roleUpdateError } = await sc
    .from("user_profiles")
    .update({ role: "patient" })
    .eq("id", userId)

  if (roleUpdateError) {
    console.error("[buyer-upgrade] Role update failed:", roleUpdateError.message)
    return { upgraded: false, error: "Rollen-Wechsel fehlgeschlagen." }
  }

  // ── Step 2: create patients record linked to the same login ──
  const email = profile.email ?? ""
  const { data: newPatient, error: patientInsertError } = await sc
    .from("patients")
    .insert({
      user_id: userId,
      vorname: params.vorname ?? profile.first_name ?? "Unbekannt",
      nachname: params.nachname ?? profile.last_name ?? "Unbekannt",
      email,
      geburtsdatum: params.geburtsdatum ?? "1900-01-01",
      telefon: params.telefon ?? null,
      geschlecht: "unbekannt",
      therapeut_id: therapeutId,
      booking_system_id: params.bookingSystemId ?? null,
      booking_email: email,
    })
    .select("id")
    .single()

  if (patientInsertError || !newPatient) {
    // Rollback the role change so the account stays in a consistent state
    console.error(
      "[buyer-upgrade] patients insert failed, rolling back role:",
      patientInsertError?.message
    )
    await sc
      .from("user_profiles")
      .update({ role: "externer_kaeufer" })
      .eq("id", userId)
    return {
      upgraded: false,
      error: "Patienten-Datensatz konnte nicht angelegt werden.",
    }
  }

  console.log(
    `[AUDIT] externer_kaeufer upgraded to patient: userId=${userId} patientId=${newPatient.id} therapeutId=${therapeutId}`
  )

  return { upgraded: true, patientId: newPatient.id }
}
