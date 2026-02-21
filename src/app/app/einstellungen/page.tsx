"use client"

import Link from "next/link"
import { Button } from "@/components/ui/button"
import { InstallSection } from "@/components/pwa/InstallSection"
import { BenachrichtigungsSection } from "@/components/pwa/BenachrichtigungsSection"
import { ChevronLeft, Settings } from "lucide-react"

export default function EinstellungenPage() {
  return (
    <div className="container mx-auto py-6 px-4 max-w-lg space-y-6">
      {/* Header */}
      <div className="flex items-center gap-3">
        <Link href="/app/dashboard">
          <Button
            variant="ghost"
            size="icon"
            className="h-9 w-9 text-slate-500"
            aria-label="Zurück zum Dashboard"
          >
            <ChevronLeft className="h-5 w-5" />
          </Button>
        </Link>
        <div>
          <h1 className="text-xl font-bold text-slate-800 flex items-center gap-2">
            <Settings className="h-5 w-5 text-slate-500" aria-hidden="true" />
            Einstellungen
          </h1>
          <p className="text-xs text-slate-400 mt-0.5">App & Benachrichtigungen</p>
        </div>
      </div>

      {/* App installation section */}
      <InstallSection />

      {/* Push notification settings section */}
      <BenachrichtigungsSection />

      {/* Account */}
      <div className="pt-2">
        <form action="/api/auth/signout" method="post">
          <Button
            variant="outline"
            type="submit"
            className="w-full text-slate-500 border-slate-200 hover:bg-red-50 hover:text-red-600 hover:border-red-200"
          >
            Abmelden
          </Button>
        </form>
      </div>

      {/* Credits */}
      <div className="pt-4 pb-2 text-center space-y-1">
        <p className="text-xs text-slate-400">
          Powered by <span className="font-medium text-slate-500">Physiotherapie Glawe</span>
        </p>
        <p className="text-[10px] text-slate-300">
          Designed by Max Glawe &middot; v1.0
        </p>
      </div>
    </div>
  )
}
