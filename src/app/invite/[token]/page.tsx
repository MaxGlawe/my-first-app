import { redirect } from "next/navigation"
import { createSupabaseServerClient } from "@/lib/supabase-server"
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

  // Exchange PKCE code for session (after clicking Supabase invite email link)
  if (code) {
    const supabase = await createSupabaseServerClient()
    await supabase.auth.exchangeCodeForSession(code)
    redirect(`/invite/${token}`)
  }

  // Check if user is already authenticated (from invite email flow)
  const supabase = await createSupabaseServerClient()
  const {
    data: { user },
  } = await supabase.auth.getUser()

  // Fetch patient data from invite token (server-side)
  const siteUrl = process.env.NEXT_PUBLIC_SITE_URL || "http://localhost:3000"
  let patientData: { vorname: string; nachname: string; email: string } | null = null

  try {
    const res = await fetch(`${siteUrl}/api/patients/invite/${token}`, {
      cache: "no-store",
    })
    if (res.ok) {
      patientData = await res.json()
    }
  } catch {
    // Token invalid or already used — handled in the UI below
  }

  return (
    <main className="min-h-screen flex items-center justify-center bg-muted/40 px-4">
      {user && patientData ? (
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
