import { UpdatePasswordForm } from "@/components/auth/UpdatePasswordForm"

export const metadata = {
  title: "Neues Passwort | Praxis OS",
  description: "Legen Sie Ihr neues Passwort fest",
}

export default function UpdatePasswordPage() {
  return (
    <main className="min-h-screen flex items-center justify-center bg-muted/40 px-4">
      <UpdatePasswordForm />
    </main>
  )
}
