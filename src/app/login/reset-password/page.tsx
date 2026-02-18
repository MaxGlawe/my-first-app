import { ResetPasswordForm } from "@/components/auth/ResetPasswordForm"

export const metadata = {
  title: "Passwort zurücksetzen | Praxis OS",
  description: "Setzen Sie Ihr Passwort zurück",
}

export default function ResetPasswordPage() {
  return (
    <main className="min-h-screen flex items-center justify-center bg-muted/40 px-4">
      <ResetPasswordForm />
    </main>
  )
}
