"use client"

import Link from "next/link"
import { MessageCircle, RefreshCw, AlertCircle } from "lucide-react"
import { Avatar, AvatarFallback } from "@/components/ui/avatar"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Skeleton } from "@/components/ui/skeleton"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { useChatInbox } from "@/hooks/use-chat"
import { cn } from "@/lib/utils"
import type { ChatInboxEntry } from "@/types/chat"

function getInitials(name: string): string {
  return name
    .split(" ")
    .map((w) => w[0])
    .slice(0, 2)
    .join("")
    .toUpperCase()
}

function formatRelativeTime(isoString: string | null): string {
  if (!isoString) return ""
  const date = new Date(isoString)
  const now = new Date()
  const diffMs = now.getTime() - date.getTime()
  const diffMins = Math.floor(diffMs / 60000)
  const diffHours = Math.floor(diffMins / 60)
  const diffDays = Math.floor(diffHours / 24)

  if (diffMins < 1) return "Jetzt"
  if (diffMins < 60) return `${diffMins} Min.`
  if (diffHours < 24) return `${diffHours} Std.`
  if (diffDays === 1) return "Gestern"
  if (diffDays < 7) return `${diffDays} Tagen`
  return date.toLocaleDateString("de-DE", { day: "2-digit", month: "2-digit" })
}

// ── GesprächsKarte ─────────────────────────────────────────────────────────────

interface GesprächsKarteProps {
  entry: ChatInboxEntry
}

function GesprächsKarte({ entry }: GesprächsKarteProps) {
  const initials = getInitials(entry.patient_name)
  const hasUnread = entry.unread_count > 0

  return (
    <Link
      href={`/os/patients/${entry.patient_id}?tab=chat`}
      className={cn(
        "flex items-center gap-3 px-4 py-3 hover:bg-slate-50 transition-colors border-b border-slate-100 last:border-0",
        hasUnread && "bg-emerald-50/50 hover:bg-emerald-50"
      )}
    >
      <div className="relative flex-shrink-0">
        <Avatar className="h-12 w-12">
          <AvatarFallback
            className={cn(
              "font-semibold text-sm",
              hasUnread
                ? "bg-emerald-100 text-emerald-700"
                : "bg-slate-100 text-slate-600"
            )}
          >
            {initials}
          </AvatarFallback>
        </Avatar>
        {hasUnread && (
          <span className="absolute -top-0.5 -right-0.5 h-3 w-3 rounded-full bg-emerald-500 ring-2 ring-white" />
        )}
      </div>

      <div className="flex-1 min-w-0">
        <div className="flex items-center justify-between gap-2">
          <span
            className={cn(
              "text-sm truncate",
              hasUnread ? "font-bold text-slate-900" : "font-medium text-slate-700"
            )}
          >
            {entry.patient_name}
          </span>
          <span className="text-[10px] text-slate-400 flex-shrink-0">
            {formatRelativeTime(entry.last_message_at)}
          </span>
        </div>
        <div className="flex items-center justify-between gap-2 mt-0.5">
          <p
            className={cn(
              "text-xs truncate",
              hasUnread ? "text-slate-700 font-medium" : "text-slate-400"
            )}
          >
            {entry.last_message ?? "Noch keine Nachrichten"}
          </p>
          {entry.unread_count > 0 && (
            <Badge className="bg-emerald-500 text-white text-[10px] h-5 min-w-5 px-1.5 flex-shrink-0">
              {entry.unread_count > 99 ? "99+" : entry.unread_count}
            </Badge>
          )}
        </div>
      </div>
    </Link>
  )
}

// ── ChatPosteingang ────────────────────────────────────────────────────────────

export function ChatPosteingang() {
  const { inbox, isLoading, error, totalUnread, refresh } = useChatInbox()

  if (isLoading) {
    return (
      <div className="space-y-0">
        {Array.from({ length: 5 }).map((_, i) => (
          <div key={i} className="flex items-center gap-3 px-4 py-3 border-b border-slate-100">
            <Skeleton className="h-12 w-12 rounded-full flex-shrink-0" />
            <div className="flex-1 space-y-2">
              <Skeleton className="h-4 w-36" />
              <Skeleton className="h-3 w-52" />
            </div>
          </div>
        ))}
      </div>
    )
  }

  if (error) {
    return (
      <div className="p-6 space-y-4">
        <Alert variant="destructive">
          <AlertCircle className="h-4 w-4" />
          <AlertDescription>{error}</AlertDescription>
        </Alert>
        <Button variant="outline" onClick={refresh} className="w-full">
          <RefreshCw className="h-4 w-4 mr-2" />
          Erneut versuchen
        </Button>
      </div>
    )
  }

  if (inbox.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center py-16 px-8 text-center">
        <div className="w-16 h-16 bg-slate-100 rounded-full flex items-center justify-center mb-4">
          <MessageCircle className="h-7 w-7 text-slate-400" />
        </div>
        <p className="text-slate-600 font-medium">Keine Gespräche</p>
        <p className="text-slate-400 text-sm mt-1">
          Sobald Patienten schreiben, erscheinen die Gespräche hier.
        </p>
      </div>
    )
  }

  return (
    <div>
      {/* Summary header */}
      {totalUnread > 0 && (
        <div className="px-4 py-2.5 bg-emerald-50 border-b border-emerald-100">
          <p className="text-sm text-emerald-700 font-medium">
            {totalUnread} ungelesene Nachricht{totalUnread !== 1 ? "en" : ""}
          </p>
        </div>
      )}

      {/* Conversation list */}
      <div>
        {inbox.map((entry) => (
          <GesprächsKarte key={entry.patient_id} entry={entry} />
        ))}
      </div>
    </div>
  )
}

// ── ChatUnreadBadge ────────────────────────────────────────────────────────────
// Small inline badge for sidebar navigation, driven by live data.

export function ChatUnreadBadge() {
  const { totalUnread } = useChatInbox()
  if (totalUnread === 0) return null
  return (
    <Badge className="ml-auto bg-emerald-500 text-white text-[10px] h-5 min-w-5 px-1.5">
      {totalUnread > 99 ? "99+" : totalUnread}
    </Badge>
  )
}
