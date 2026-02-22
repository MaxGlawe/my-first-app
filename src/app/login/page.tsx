import { Suspense } from "react"
import { LoginForm } from "@/components/auth/LoginForm"
import { LoginPageContent } from "@/components/auth/LoginPageContent"

export const metadata = {
  title: "Anmelden | Praxis OS",
  description: "Melden Sie sich bei Praxis OS an",
}

export default function LoginPage() {
  return (
    <Suspense fallback={<LoginFormFallback />}>
      <LoginPageContent />
    </Suspense>
  )
}

function LoginFormFallback() {
  return (
    <div className="w-full max-w-md">
      <LoginForm />
    </div>
  )
}
