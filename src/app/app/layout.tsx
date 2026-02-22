"use client"

import { PatientenNavigation } from "@/components/app/PatientenNavigation"
import { OnboardingWizard } from "@/components/app/OnboardingWizard"
import { CheckInGate } from "@/components/app/CheckInGate"

export default function PatientenAppLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <div className="min-h-screen bg-gradient-to-b from-slate-50 to-white">
      <OnboardingWizard>
        <CheckInGate>
          <main className="pb-20">{children}</main>
        </CheckInGate>
      </OnboardingWizard>

      {/* Mobile bottom navigation */}
      <PatientenNavigation />
    </div>
  )
}
