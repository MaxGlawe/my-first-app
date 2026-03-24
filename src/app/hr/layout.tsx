"use client"

import { useHrAuth } from "@/hooks/use-hr-auth"
import { supabase } from "@/lib/supabase"
import { Button } from "@/components/ui/button"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { Skeleton } from "@/components/ui/skeleton"
import { Building2, ChevronDown, LogOut, LayoutDashboard, Users, FileText, ShoppingCart, Lock } from "lucide-react"
import { useRouter, usePathname } from "next/navigation"
import Link from "next/link"
import { cn } from "@/lib/utils"
import { TierLockedPage } from "@/components/bgf/TierLockedPage"
import { hasFeature, BgfFeature } from "@/lib/bgf-tiers"
import type { VertragTier } from "@/types/bgf"

const NAV_ITEMS = [
  { href: "/hr/dashboard", label: "Dashboard", icon: LayoutDashboard, feature: BgfFeature.HR_DASHBOARD },
  { href: "/hr/mitarbeiter", label: "Mitarbeiter", icon: Users, feature: BgfFeature.MEMBER_MANAGEMENT },
  { href: "/hr/leistungen", label: "Leistungen", icon: ShoppingCart, feature: BgfFeature.ZUSATZLEISTUNGEN },
  { href: "/hr/reports", label: "Berichte", icon: FileText, feature: BgfFeature.QUARTALS_REPORTS },
] as const

function HrNavbar({
  companyName,
  vertragTier,
}: {
  companyName: string | null
  vertragTier: VertragTier | null
}) {
  const router = useRouter()
  const pathname = usePathname()

  async function handleLogout() {
    await supabase.auth.signOut()
    window.location.href = "/login"
  }

  return (
    <header className="sticky top-0 z-50 border-b border-slate-200 bg-white shadow-sm">
      <div className="mx-auto flex h-16 max-w-7xl items-center justify-between px-4 sm:px-6 lg:px-8">
        {/* Logo + Brand */}
        <div className="flex items-center gap-6">
          <div className="flex items-center gap-3">
            <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-emerald-600">
              <Building2 className="h-5 w-5 text-white" />
            </div>
            <div className="flex flex-col leading-tight">
              <span className="text-sm font-semibold text-slate-900">Praxis OS BGF</span>
              {companyName && (
                <span className="text-xs text-slate-500">{companyName}</span>
              )}
            </div>
          </div>

          {/* Navigation */}
          <nav className="hidden sm:flex items-center gap-1">
            {NAV_ITEMS.map((item) => {
              const isActive = pathname === item.href || pathname.startsWith(item.href + "/")
              const isLocked = vertragTier ? !hasFeature(vertragTier, item.feature) : false
              return (
                <Link
                  key={item.href}
                  href={isLocked ? "#" : item.href}
                  className={cn(
                    "flex items-center gap-2 px-3 py-2 rounded-lg text-sm font-medium transition-colors",
                    isLocked
                      ? "text-slate-300 cursor-not-allowed"
                      : isActive
                      ? "bg-emerald-50 text-emerald-700"
                      : "text-slate-500 hover:text-slate-700 hover:bg-slate-50"
                  )}
                  onClick={isLocked ? (e) => e.preventDefault() : undefined}
                >
                  <item.icon className="h-4 w-4" />
                  {item.label}
                  {isLocked && <Lock className="h-3 w-3 text-slate-300" />}
                </Link>
              )
            })}
          </nav>
        </div>

        {/* User Dropdown */}
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button variant="ghost" className="gap-2 text-slate-700">
              <span className="hidden sm:inline text-sm">
                {companyName ?? "HR-Portal"}
              </span>
              <ChevronDown className="h-4 w-4" />
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end" className="w-48">
            {/* Mobile nav */}
            <div className="sm:hidden">
              {NAV_ITEMS.map((item) => (
                <DropdownMenuItem
                  key={item.href}
                  onClick={() => router.push(item.href)}
                  className="gap-2"
                >
                  <item.icon className="h-4 w-4" />
                  {item.label}
                </DropdownMenuItem>
              ))}
              <DropdownMenuSeparator />
            </div>
            <DropdownMenuItem
              onClick={handleLogout}
              className="gap-2 text-red-600 focus:text-red-600"
            >
              <LogOut className="h-4 w-4" />
              Abmelden
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </div>
    </header>
  )
}

export default function HrLayout({ children }: { children: React.ReactNode }) {
  const { isLoading, isAuthorized, organizationName, vertragTier } = useHrAuth()

  if (isLoading) {
    return (
      <div className="min-h-screen bg-slate-50">
        <div className="border-b border-slate-200 bg-white shadow-sm">
          <div className="mx-auto flex h-16 max-w-7xl items-center justify-between px-4 sm:px-6 lg:px-8">
            <Skeleton className="h-9 w-48" />
            <Skeleton className="h-9 w-32" />
          </div>
        </div>
        <main className="mx-auto max-w-7xl px-4 py-10 sm:px-6 lg:px-8">
          <div className="space-y-4">
            <Skeleton className="h-8 w-64" />
            <Skeleton className="h-40 w-full" />
            <Skeleton className="h-40 w-full" />
          </div>
        </main>
      </div>
    )
  }

  if (!isAuthorized) {
    return null // Router redirect handled in hook
  }

  // Tier-Gate: HR portal requires Pro+
  if (vertragTier && !hasFeature(vertragTier, BgfFeature.HR_DASHBOARD)) {
    return (
      <div className="min-h-screen bg-slate-50 flex items-center justify-center">
        <TierLockedPage
          currentTier={vertragTier}
          requiredTier="pro"
          featureTitle="HR-Dashboard"
          featureDescription="Das HR-Dashboard zeigt anonymisierte Gesundheits-KPIs, Mitarbeiter-Verwaltung und ROI-Berechnungen — verfügbar ab dem Professional-Tarif."
        />
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-slate-50">
      <HrNavbar companyName={organizationName} vertragTier={vertragTier} />
      <main className="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8">
        {children}
      </main>
    </div>
  )
}
