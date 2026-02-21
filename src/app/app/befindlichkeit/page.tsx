"use client"

/**
 * Schmerztagebuch — Tages-Check-in (Direktzugang)
 * Nutzt das wiederverwendbare CheckInForm.
 */

import Link from "next/link"
import { useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"
import { CheckInForm } from "@/components/app/CheckInForm"
import { ArrowLeft } from "lucide-react"

export default function BefindlichkeitPage() {
  const router = useRouter()

  return (
    <div className="container mx-auto py-6 px-4 max-w-lg space-y-6">
      {/* Header */}
      <div className="flex items-center gap-3">
        <Link href="/app/dashboard">
          <Button
            variant="ghost"
            size="icon"
            className="h-10 w-10 rounded-xl text-slate-400"
          >
            <ArrowLeft className="h-5 w-5" />
          </Button>
        </Link>
        <div>
          <h1 className="text-xl font-bold text-slate-800">Tages-Check-in</h1>
          <p className="text-xs text-slate-400">
            {new Date().toLocaleDateString("de-DE", {
              weekday: "long",
              day: "numeric",
              month: "long",
            })}
          </p>
        </div>
      </div>

      {/* Reusable check-in form */}
      <CheckInForm onComplete={() => router.push("/app/dashboard")} />
    </div>
  )
}
