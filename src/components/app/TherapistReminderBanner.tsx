"use client"

/**
 * PROJ-17: Shows a prominent banner on the patient dashboard
 * when there are unread messages from the therapist.
 * Motivational but firm — encourages the patient to check their chat.
 */

import { useState, useEffect } from "react"
import Link from "next/link"
import { MessageCircle, ChevronRight, X } from "lucide-react"

export function TherapistReminderBanner() {
  const [unreadCount, setUnreadCount] = useState(0)
  const [dismissed, setDismissed] = useState(false)

  useEffect(() => {
    async function check() {
      try {
        const res = await fetch("/api/me/chat/unread")
        if (res.ok) {
          const data = await res.json()
          setUnreadCount(data.unread ?? 0)
        }
      } catch { /* ignore */ }
    }
    check()
  }, [])

  if (unreadCount === 0 || dismissed) return null

  return (
    <div className="relative rounded-2xl bg-gradient-to-r from-emerald-500 via-teal-500 to-emerald-600 p-4 shadow-lg shadow-emerald-500/20 text-white overflow-hidden">
      {/* Decorative circles */}
      <div className="absolute -top-6 -right-6 h-24 w-24 rounded-full bg-white/10" />
      <div className="absolute -bottom-4 -left-4 h-16 w-16 rounded-full bg-white/10" />

      <div className="relative flex items-center gap-3">
        <div className="h-10 w-10 rounded-xl bg-white/20 flex items-center justify-center shrink-0">
          <MessageCircle className="h-5 w-5 text-white" />
        </div>

        <Link href="/app/chat" className="flex-1 min-w-0">
          <p className="font-semibold text-sm">
            Dein Therapeut hat dir geschrieben!
          </p>
          <p className="text-xs text-white/80 mt-0.5">
            {unreadCount === 1
              ? "Du hast 1 ungelesene Nachricht"
              : `Du hast ${unreadCount} ungelesene Nachrichten`}
            {" — Tippe hier um sie zu lesen."}
          </p>
        </Link>

        <Link href="/app/chat" className="shrink-0">
          <ChevronRight className="h-5 w-5 text-white/60" />
        </Link>

        <button
          onClick={(e) => { e.preventDefault(); e.stopPropagation(); setDismissed(true) }}
          className="absolute top-2 right-2 h-6 w-6 rounded-md flex items-center justify-center hover:bg-white/20 text-white/50 hover:text-white transition-colors"
        >
          <X className="h-3.5 w-3.5" />
        </button>
      </div>
    </div>
  )
}
