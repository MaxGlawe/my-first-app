import type { Metadata } from "next"
import { PatientenNavigation } from "@/components/app/PatientenNavigation"

export const metadata: Metadata = {
  title: "Praxis OS — Patienten-App",
  description: "Deine Übungen, Trainingspläne und Termine",
}

export default function PatientenAppLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <div className="min-h-screen bg-gradient-to-b from-slate-50 to-white">
      {/* Main content with bottom padding for nav bar */}
      <main className="pb-20">{children}</main>

      {/* Mobile bottom navigation */}
      <PatientenNavigation />
    </div>
  )
}
