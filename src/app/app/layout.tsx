"use client"

import { usePathname } from "next/navigation"
import { Suspense } from "react"
import { PatientenNavigation } from "@/components/app/PatientenNavigation"
import { OnboardingWizard } from "@/components/app/OnboardingWizard"
import { PaymentSetupGate } from "@/components/app/PaymentSetupGate"
import { CheckInGate } from "@/components/app/CheckInGate"
import { MilestonePopup } from "@/components/app/MilestonePopup"
import { useStreak } from "@/hooks/use-streak"

function MilestoneOverlay() {
  const { newUnlock, dismissUnlock } = useStreak()
  return <MilestonePopup achievement={newUnlock} onClose={dismissUnlock} />
}

export default function PatientenAppLayout({
  children,
}: {
  children: React.ReactNode
}) {
  const pathname = usePathname()
  const isSessionMode = pathname?.includes("/session")

  // Session mode: fullscreen without navigation or wrappers
  if (isSessionMode) {
    return (
      <div className="min-h-screen">
        {children}
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gradient-to-b from-slate-50 to-white">
      <OnboardingWizard>
        <Suspense>
          <PaymentSetupGate>
            <CheckInGate>
              <main className="pb-20">{children}</main>
            </CheckInGate>
          </PaymentSetupGate>
        </Suspense>
      </OnboardingWizard>

      {/* Mobile bottom navigation */}
      <PatientenNavigation />

      {/* Achievement celebration popup */}
      <MilestoneOverlay />
    </div>
  )
}
