"use client"

import Image from "next/image"
import { Check, CheckCheck } from "lucide-react"
import { cn } from "@/lib/utils"
import type { ChatMessage } from "@/types/chat"

interface NachrichtBubbleProps {
  message: ChatMessage
  /** Is this message sent by the current user (shown on the right)? */
  isMine: boolean
}

function formatTime(isoString: string): string {
  const date = new Date(isoString)
  return date.toLocaleTimeString("de-DE", { hour: "2-digit", minute: "2-digit" })
}

function formatDate(isoString: string): string {
  const date = new Date(isoString)
  const today = new Date()
  const yesterday = new Date(today)
  yesterday.setDate(yesterday.getDate() - 1)

  if (date.toDateString() === today.toDateString()) return "Heute"
  if (date.toDateString() === yesterday.toDateString()) return "Gestern"
  return date.toLocaleDateString("de-DE", {
    day: "2-digit",
    month: "2-digit",
    year: "numeric",
  })
}

export function NachrichtBubble({ message, isMine }: NachrichtBubbleProps) {
  const isRead = message.read_at !== null
  const hasMedia = message.media_url && message.media_type === "image"
  const hasText = message.content && message.content.trim().length > 0

  return (
    <div
      className={cn(
        "flex w-full",
        isMine ? "justify-end" : "justify-start"
      )}
    >
      <div
        className={cn(
          "max-w-[75%] rounded-2xl px-4 py-2.5 shadow-sm",
          isMine
            ? "bg-emerald-500 text-white rounded-br-sm"
            : "bg-white text-slate-800 rounded-bl-sm border border-slate-100"
        )}
      >
        {/* Media preview */}
        {hasMedia && (
          <div className="mb-2">
            <a href={message.media_url!} target="_blank" rel="noopener noreferrer">
              <div className="relative w-48 h-48 rounded-lg overflow-hidden">
                <Image
                  src={message.media_url!}
                  alt="Bild"
                  fill
                  className="object-cover"
                  sizes="192px"
                />
              </div>
            </a>
          </div>
        )}

        {/* Text content */}
        {hasText && (
          <p className="text-sm leading-relaxed whitespace-pre-wrap break-words">
            {message.content}
          </p>
        )}

        {/* Timestamp + read receipt */}
        <div
          className={cn(
            "flex items-center gap-1 mt-1",
            isMine ? "justify-end" : "justify-end"
          )}
        >
          <span
            className={cn(
              "text-[10px]",
              isMine ? "text-emerald-100" : "text-slate-400"
            )}
          >
            {formatTime(message.created_at)}
          </span>
          {isMine && (
            isRead ? (
              <CheckCheck className="h-3.5 w-3.5 text-emerald-100" aria-label="Gelesen" />
            ) : (
              <Check className="h-3.5 w-3.5 text-emerald-200" aria-label="Gesendet" />
            )
          )}
        </div>
      </div>
    </div>
  )
}

// ── DateSeparator ─────────────────────────────────────────────────────────────

interface DateSeparatorProps {
  date: string
}

export function DateSeparator({ date }: DateSeparatorProps) {
  return (
    <div className="flex items-center gap-3 my-4">
      <div className="flex-1 h-px bg-slate-200" />
      <span className="text-xs text-slate-400 font-medium px-2">
        {formatDate(date)}
      </span>
      <div className="flex-1 h-px bg-slate-200" />
    </div>
  )
}
