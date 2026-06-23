"use client"

import { LogOut } from "lucide-react"

export function LogoutButton() {
  const handleSignOut = async () => {
    await fetch("/api/auth/signout", { method: "POST" })
    window.location.href = "/login"
  }
  return (
    <button
      onClick={handleSignOut}
      className="inline-flex items-center gap-1.5 rounded-lg px-3 py-1.5 text-sm font-medium text-slate-600 transition hover:bg-slate-100 hover:text-slate-900"
    >
      <LogOut className="h-4 w-4" />
      <span className="hidden sm:inline">Abmelden</span>
    </button>
  )
}
