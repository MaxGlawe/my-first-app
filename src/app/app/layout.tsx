"use client"

import { usePathname } from "next/navigation"
import { Suspense } from "react"
import { PatientenNavigation } from "@/components/app/PatientenNavigation"
import { BgfNavigation } from "@/components/bgf/BgfNavigation"
import { OnboardingWizard } from "@/components/app/OnboardingWizard"
import { PaymentSetupGate } from "@/components/app/PaymentSetupGate"
import { CheckInGate } from "@/components/app/CheckInGate"
import { MilestonePopup } from "@/components/app/MilestonePopup"
import { WhatsNewDialog } from "@/components/app/WhatsNewDialog"
import { ClientErrorReporter } from "@/components/app/ClientErrorReporter"
import { useStreak } from "@/hooks/use-streak"
import { useBgfMembership } from "@/hooks/use-bgf-membership"

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
  const { isMember: isBgfMember } = useBgfMembership()

  const isSessionMode =
    pathname?.includes("/session") ||
    pathname?.includes("/bgf/pausen-fit/")

  const isBgfRoute = pathname?.startsWith("/app/bgf")

  // Shared routes that BGF members also use (skip patient wrappers, show BGF nav)
  const isSharedBgfRoute =
    isBgfMember &&
    (pathname?.startsWith("/app/training") ||
     pathname?.startsWith("/app/chat"))

  // Session mode: fullscreen without navigation or wrappers
  if (isSessionMode) {
    return (
      <ClientErrorReporter>
        <div className="min-h-screen">
          {children}
        </div>
      </ClientErrorReporter>
    )
  }

  // BGF fullscreen pages (onboarding) — no nav
  const isBgfFullscreen =
    pathname?.includes("/bgf/onboarding") ||
    pathname?.includes("/bgf/check-in")

  if (isBgfRoute && isBgfFullscreen) {
    return (
      <ClientErrorReporter>
        <div className="min-h-screen">
          {children}
        </div>
      </ClientErrorReporter>
    )
  }

  // BGF routes + shared routes for BGF members — BGF nav, no patient wrappers
  if (isBgfRoute || isSharedBgfRoute) {
    return (
      <ClientErrorReporter>
        <div className="min-h-screen">
          <main className="pb-20">{children}</main>
          <BgfNavigation />
        </div>
      </ClientErrorReporter>
    )
  }

  return (
    <ClientErrorReporter>
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

        {/* „Was ist neu" — Update-Meldung (einmal pro Release) */}
        <WhatsNewDialog />
      </div>
    </ClientErrorReporter>
  )
}
