import { redirect } from "next/navigation"
import { createSupabaseServerClient } from "@/lib/supabase-server"
import { createSupabaseServiceClient } from "@/lib/supabase-service"
import { SetPasswordForm } from "@/components/auth/SetPasswordForm"
import { PatientRegistrationForm } from "@/components/auth/PatientRegistrationForm"

export const metadata = {
  title: "Einladung annehmen | Praxis OS",
  description: "Erstellen Sie Ihr Patienten-Konto",
}

interface InvitePageProps {
  params: Promise<{ token: string }>
  searchParams: Promise<{ code?: string }>
}

export default async function InvitePage({ params, searchParams }: InvitePageProps) {
  const { token } = await params
  const { code } = await searchParams

  // Legacy: Exchange PKCE code for session (in case old Supabase invite emails are clicked)
  if (code) {
    const supabase = await createSupabaseServerClient()
    await supabase.auth.exchangeCodeForSession(code)
    redirect(`/invite/${token}`)
  }

  // Check if user is already authenticated
  const supabase = await createSupabaseServerClient()
  const {
    data: { user },
  } = await supabase.auth.getUser()

  // Fetch patient data directly from DB via service client (no self-fetch)
  const serviceClient = createSupabaseServiceClient()
  let patientData: { vorname: string; nachname: string; email: string } | null = null

  const { data: patient } = await serviceClient
    .from("patients")
    .select("vorname, nachname, email, invite_status, user_id")
    .eq("invite_token", token)
    .single()

  if (patient && patient.invite_status !== "registered") {
    patientData = {
      vorname: patient.vorname,
      nachname: patient.nachname,
      email: patient.email,
    }
  }

  // Only show SetPasswordForm if the authenticated user IS the invited patient
  // (prevents admin/therapist testing from accidentally using their own session)
  const isInvitedPatient = user && patient?.user_id && patient.user_id === user.id

  return (
    <main className="min-h-screen flex items-center justify-center bg-muted/40 px-4">
      {isInvitedPatient && patientData ? (
        <SetPasswordForm
          token={token}
          vorname={patientData.vorname}
        />
      ) : (
        <PatientRegistrationForm
          token={token}
          prefill={patientData ?? undefined}
        />
      )}
    </main>
  )
}
