"use client"

import Link from "next/link"
import { ArrowLeft } from "lucide-react"
import { Avatar, AvatarFallback } from "@/components/ui/avatar"
import { Badge } from "@/components/ui/badge"
import { cn } from "@/lib/utils"

interface ChatHeaderProps {
  /** Display name of the other person in the chat */
  name: string
  /** Optional subtitle (e.g. role or last seen) */
  subtitle?: string
  /** Optional initials for avatar fallback */
  initials?: string
  /** Back navigation href */
  backHref?: string
  /** Optional status badge (e.g. "Abwesend") */
  statusLabel?: string
  className?: string
}

function getInitials(name: string): string {
  return name
    .split(" ")
    .map((w) => w[0])
    .slice(0, 2)
    .join("")
    .toUpperCase()
}

export function ChatHeader({
  name,
  subtitle,
  initials,
  backHref,
  statusLabel,
  className,
}: ChatHeaderProps) {
  const avatarInitials = initials ?? getInitials(name)

  return (
    <header
      className={cn(
        "flex items-center gap-3 px-4 py-3 bg-white border-b border-slate-200 shadow-sm",
        className
      )}
    >
      {backHref && (
        <Link
          href={backHref}
          className="text-slate-500 hover:text-slate-700 transition-colors"
          aria-label="Zurück"
        >
          <ArrowLeft className="h-5 w-5" />
        </Link>
      )}

      <Avatar className="h-10 w-10 flex-shrink-0">
        <AvatarFallback className="bg-emerald-100 text-emerald-700 font-semibold text-sm">
          {avatarInitials}
        </AvatarFallback>
      </Avatar>

      <div className="flex-1 min-w-0">
        <div className="flex items-center gap-2">
          <span className="font-semibold text-slate-800 truncate">{name}</span>
          {statusLabel && (
            <Badge variant="secondary" className="text-[10px] shrink-0">
              {statusLabel}
            </Badge>
          )}
        </div>
        {subtitle && (
          <p className="text-xs text-slate-500 truncate">{subtitle}</p>
        )}
      </div>
    </header>
  )
}
