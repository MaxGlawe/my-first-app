import type { ReactNode } from "react"
import { LogoutButton } from "./LogoutButton"

/**
 * PROJ-34: Minimaler Rahmen für den „Termine-only"-Bereich der Buchungs-Patienten.
 * Bewusst OHNE klinische /app-Hülle (kein Dashboard-Nav, kein Onboarding, kein
 * Check-in) — ein Bucher soll fokussiert seine Termine sehen + den Upsell.
 */
export default function MeineTermineLayout({ children }: { children: ReactNode }) {
  return (
    <div className="min-h-screen bg-slate-50">
      <header className="border-b bg-white">
        <div className="mx-auto flex max-w-2xl items-center justify-between px-4 py-3">
          <div className="flex items-center gap-2.5">
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img src="/images/physio-logo.png" alt="Praxis OS" className="h-8 w-8 rounded-full object-contain" />
            <span className="font-semibold text-slate-900">Praxis OS</span>
          </div>
          <LogoutButton />
        </div>
      </header>
      {children}
    </div>
  )
}
