"use client"

import { useSearchParams } from "next/navigation"
import { LoginForm } from "./LoginForm"

export function LoginPageContent() {
  const searchParams = useSearchParams()
  const error = searchParams.get("error") ?? undefined

  return <LoginForm errorParam={error} />
}
