/**
 * PROJ-34: Aktuellen Patienten aus der Session auflösen (für die /api/me/appointments*-
 * Routen). Liefert die Praxis-OS-Patienten-ID + die Buchungstool-`patientId`
 * (= patients.booking_system_id, der Schlüssel für die Koordinations-API).
 *
 * Auth über die Server-Session; DB-Zugriff über den Service-Client (die
 * appointments/patients-RLS ist aus Patienten-Kontext eingeschränkt). Wir matchen
 * primär über user_id (sauber), mit E-Mail-Fallback für Altbestand.
 */
import { createSupabaseServerClient } from "@/lib/supabase-server"
import { createSupabaseServiceClient } from "@/lib/supabase-service"

export interface CurrentPatient {
  patientRowId: string
  /** Buchungstool-UUID — null, wenn (noch) nicht mit dem Buchungstool verknüpft. */
  coordPatientId: string | null
  userId: string
  email: string | null
}

export async function resolveCurrentPatient(): Promise<CurrentPatient | null> {
  const supabase = await createSupabaseServerClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return null

  const svc = createSupabaseServiceClient()
  let { data: patient } = await svc
    .from("patients")
    .select("id, booking_system_id")
    .eq("user_id", user.id)
    .maybeSingle()

  if (!patient && user.email) {
    const r = await svc
      .from("patients")
      .select("id, booking_system_id")
      .eq("email", user.email)
      .limit(1)
      .maybeSingle()
    patient = r.data
  }

  if (!patient) return null
  return {
    patientRowId: patient.id as string,
    coordPatientId: (patient.booking_system_id as string | null) ?? null,
    userId: user.id,
    email: user.email ?? null,
  }
}
