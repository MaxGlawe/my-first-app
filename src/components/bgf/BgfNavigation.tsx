"use client"

import Link from "next/link"
import { usePathname } from "next/navigation"
import { Home, Dumbbell, MessageCircle } from "lucide-react"
import { cn } from "@/lib/utils"
import { usePatientChatUnread } from "@/hooks/use-chat"

const BGF_NAV_ITEMS = [
  { href: "/app/bgf/dashboard", label: "Dashboard", icon: Home },
  { href: "/app/training", label: "Übungen", icon: Dumbbell },
  { href: "/app/chat", label: "Chat", icon: MessageCircle },
]

export function BgfNavigation() {
  const pathname = usePathname()
  const chatUnread = usePatientChatUnread()

  return (
    <nav className="fixed bottom-0 left-0 right-0 z-50 bg-white/90 backdrop-blur-md border-t border-slate-200/60 safe-area-inset-bottom">
      <div className="flex items-stretch max-w-lg mx-auto">
        {BGF_NAV_ITEMS.map(({ href, label, icon: Icon }) => {
          const isActive = pathname === href || pathname.startsWith(href + "/")
          const showBadge = href === "/app/chat" && chatUnread > 0
          return (
            <Link
              key={href}
              href={href}
              className={cn(
                "flex flex-col items-center justify-center gap-1 flex-1 py-3 min-h-[64px] transition-colors relative",
                isActive
                  ? "text-indigo-600"
                  : "text-slate-400 hover:text-slate-600"
              )}
            >
              <div className="relative">
                <Icon
                  className={cn("h-6 w-6", isActive && "stroke-[2.5px]")}
                  aria-hidden="true"
                />
                {showBadge && (
                  <span className="absolute -top-1.5 -right-2.5 bg-indigo-500 text-white text-[9px] font-bold min-w-[18px] h-[18px] px-1 rounded-full flex items-center justify-center ring-2 ring-white">
                    {chatUnread > 99 ? "99+" : chatUnread}
                  </span>
                )}
              </div>
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
