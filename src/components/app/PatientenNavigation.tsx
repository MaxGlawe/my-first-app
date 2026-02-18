"use client"

import Link from "next/link"
import { usePathname } from "next/navigation"
import { Home, Dumbbell, ClipboardList, TrendingUp } from "lucide-react"
import { cn } from "@/lib/utils"

const NAV_ITEMS = [
  { href: "/app/dashboard", label: "Home", icon: Home },
  { href: "/app/training", label: "Training", icon: Dumbbell },
  { href: "/app/plans", label: "Pläne", icon: ClipboardList },
  { href: "/app/progress", label: "Fortschritt", icon: TrendingUp },
]

export function PatientenNavigation() {
  const pathname = usePathname()

  return (
    <nav className="fixed bottom-0 left-0 right-0 z-50 bg-white border-t border-slate-200 shadow-lg safe-area-inset-bottom">
      <div className="flex items-stretch max-w-lg mx-auto">
        {NAV_ITEMS.map(({ href, label, icon: Icon }) => {
          const isActive = pathname === href || pathname.startsWith(href + "/")
          return (
            <Link
              key={href}
              href={href}
              className={cn(
                "flex flex-col items-center justify-center gap-1 flex-1 py-3 min-h-[64px] transition-colors",
                isActive
                  ? "text-emerald-600"
                  : "text-slate-400 hover:text-slate-600"
              )}
            >
              <Icon
                className={cn("h-6 w-6", isActive && "stroke-[2.5px]")}
                aria-hidden="true"
              />
              <span className={cn("text-[10px] font-medium", isActive && "font-semibold")}>
                {label}
              </span>
            </Link>
          )
        })}
      </div>
    </nav>
  )
}
