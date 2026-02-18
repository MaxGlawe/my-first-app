import { PatientRegistrationForm } from "@/components/auth/PatientRegistrationForm"

export const metadata = {
  title: "Einladung annehmen | Praxis OS",
  description: "Erstellen Sie Ihr Patienten-Konto",
}

interface InvitePageProps {
  params: Promise<{ token: string }>
}

export default async function InvitePage({ params }: InvitePageProps) {
  const { token } = await params

  return (
    <main className="min-h-screen flex items-center justify-center bg-muted/40 px-4">
      <PatientRegistrationForm token={token} />
    </main>
  )
}
