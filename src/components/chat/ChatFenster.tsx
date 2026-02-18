"use client"

import { useState, useEffect, useRef, useCallback } from "react"
import { ImageIcon, Send, X, AlertCircle, RefreshCw } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Textarea } from "@/components/ui/textarea"
import { ScrollArea } from "@/components/ui/scroll-area"
import { Skeleton } from "@/components/ui/skeleton"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { NachrichtBubble, DateSeparator } from "@/components/chat/NachrichtBubble"
import { useChatMessages, useChatImageUpload } from "@/hooks/use-chat"
import { cn } from "@/lib/utils"
import type { ChatMessage, ChatPerspective } from "@/types/chat"

const MAX_CHARS = 2000
const MAX_FILE_SIZE_MB = 10
const ALLOWED_TYPES = ["image/jpeg", "image/png", "image/heic", "image/heif"]

// ── Helpers ───────────────────────────────────────────────────────────────────

function isSameDay(a: string, b: string): boolean {
  return new Date(a).toDateString() === new Date(b).toDateString()
}

function groupWithDateSeparators(
  messages: ChatMessage[]
): Array<{ type: "message"; data: ChatMessage } | { type: "separator"; date: string }> {
  const result: Array<
    { type: "message"; data: ChatMessage } | { type: "separator"; date: string }
  > = []
  let lastDate: string | null = null

  for (const msg of messages) {
    if (!lastDate || !isSameDay(lastDate, msg.created_at)) {
      result.push({ type: "separator", date: msg.created_at })
      lastDate = msg.created_at
    }
    result.push({ type: "message", data: msg })
  }

  return result
}

// ── ChatFenster ────────────────────────────────────────────────────────────────

export interface ChatFensterProps {
  patientId: string | null
  /** The auth.uid() of the currently logged-in user */
  currentUserId: string | null
  perspective: ChatPerspective
  /** Optional: hides the header area when embedding in a page that has its own header */
  hideHeader?: boolean
  /** Whether the chat is read-only (e.g. archived patient) */
  readOnly?: boolean
  className?: string
}

export function ChatFenster({
  patientId,
  currentUserId,
  perspective,
  readOnly = false,
  className,
}: ChatFensterProps) {
  const { messages, isLoading, isSending, error, hasOlder, loadOlder, sendMessage, markRead, refresh } =
    useChatMessages({ patientId, perspective })
  const { uploadImage, isUploading, uploadError } = useChatImageUpload()

  const [text, setText] = useState("")
  const [pendingImage, setPendingImage] = useState<File | null>(null)
  const [pendingImagePreview, setPendingImagePreview] = useState<string | null>(null)
  const [fileError, setFileError] = useState<string | null>(null)
  const [sendError, setSendError] = useState<string | null>(null)
  const [isRetrying, setIsRetrying] = useState(false)

  const bottomRef = useRef<HTMLDivElement>(null)
  const fileInputRef = useRef<HTMLInputElement>(null)
  const textareaRef = useRef<HTMLTextAreaElement>(null)
  // BUG-7 FIX: Track when the user manually loads older messages so the
  // auto-scroll effect can skip scrolling to the bottom in that case.
  const isLoadingOlderRef = useRef(false)

  // Auto-scroll to bottom on new messages — but NOT when loading older ones
  useEffect(() => {
    if (isLoadingOlderRef.current) {
      // Older messages were prepended; preserve the user's reading position
      isLoadingOlderRef.current = false
      return
    }
    bottomRef.current?.scrollIntoView({ behavior: "smooth" })
  }, [messages])

  // BUG-1 FIX: Only call markRead() when there are actually unread messages
  // from the other party. The previous implementation fired on every
  // messages.length change (including own Realtime echoes).
  const hasUnreadFromOther = messages.some(
    (m) => m.sender_id !== currentUserId && !m.read_at
  )
  useEffect(() => {
    if (hasUnreadFromOther && patientId) {
      markRead()
    }
  }, [hasUnreadFromOther, patientId, markRead])

  // ── File selection ─────────────────────────────────────────────────────────
  const handleFileSelect = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
    setFileError(null)
    const file = e.target.files?.[0]
    if (!file) return

    if (!ALLOWED_TYPES.includes(file.type)) {
      setFileError("Nur JPG, PNG und HEIC-Bilder erlaubt.")
      return
    }
    if (file.size > MAX_FILE_SIZE_MB * 1024 * 1024) {
      setFileError(`Bild ist zu groß. Maximal ${MAX_FILE_SIZE_MB} MB erlaubt.`)
      return
    }

    setPendingImage(file)
    const reader = new FileReader()
    reader.onloadend = () => setPendingImagePreview(reader.result as string)
    reader.readAsDataURL(file)
  }, [])

  const clearPendingImage = useCallback(() => {
    setPendingImage(null)
    setPendingImagePreview(null)
    if (fileInputRef.current) fileInputRef.current.value = ""
  }, [])

  // ── Send ───────────────────────────────────────────────────────────────────
  const handleSend = useCallback(async () => {
    if (!patientId) return
    const trimmedText = text.trim()
    if (!trimmedText && !pendingImage) return

    setSendError(null)
    try {
      let mediaUrl: string | undefined
      if (pendingImage) {
        mediaUrl = await uploadImage(pendingImage, patientId)
      }
      await sendMessage(trimmedText, mediaUrl)
      setText("")
      clearPendingImage()
    } catch (err: unknown) {
      setSendError(
        err instanceof Error ? err.message : "Nachricht konnte nicht gesendet werden."
      )
    }
  }, [patientId, text, pendingImage, sendMessage, uploadImage, clearPendingImage])

  const handleKeyDown = useCallback(
    (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
      if (e.key === "Enter" && (e.ctrlKey || e.metaKey)) {
        e.preventDefault()
        handleSend()
      }
    },
    [handleSend]
  )

  const charsLeft = MAX_CHARS - text.length
  const canSend = (text.trim().length > 0 || pendingImage !== null) && !isSending && !isUploading
  const grouped = groupWithDateSeparators(messages)

  // ── Loading skeleton ───────────────────────────────────────────────────────
  if (isLoading) {
    return (
      <div className={cn("flex flex-col h-full", className)}>
        <div className="flex-1 p-4 space-y-4">
          {Array.from({ length: 6 }).map((_, i) => (
            <div
              key={i}
              className={cn("flex", i % 2 === 0 ? "justify-start" : "justify-end")}
            >
              <Skeleton className={cn("h-12 rounded-2xl", i % 2 === 0 ? "w-48" : "w-64")} />
            </div>
          ))}
        </div>
      </div>
    )
  }

  // ── Error state ────────────────────────────────────────────────────────────
  if (error) {
    return (
      <div className={cn("flex flex-col items-center justify-center h-full p-8 gap-4", className)}>
        <Alert variant="destructive" className="max-w-md">
          <AlertCircle className="h-4 w-4" />
          <AlertDescription>{error}</AlertDescription>
        </Alert>
        <Button variant="outline" onClick={refresh}>
          <RefreshCw className="h-4 w-4 mr-2" />
          Erneut versuchen
        </Button>
      </div>
    )
  }

  return (
    <div className={cn("flex flex-col h-full bg-slate-50", className)}>
      {/* Messages area */}
      <ScrollArea className="flex-1 px-4 py-2">
        {/* Load older button */}
        {hasOlder && (
          <div className="flex justify-center mb-4">
            <Button
              variant="ghost"
              size="sm"
              onClick={() => {
                // BUG-7 FIX: set flag before loadOlder so the messages useEffect skips scroll
                isLoadingOlderRef.current = true
                loadOlder()
              }}
              className="text-xs text-slate-500"
            >
              Ältere Nachrichten laden
            </Button>
          </div>
        )}

        {/* Empty state */}
        {messages.length === 0 && !isLoading && (
          <div className="flex flex-col items-center justify-center h-full py-16 text-center">
            <div className="w-16 h-16 bg-emerald-100 rounded-full flex items-center justify-center mb-4">
              <Send className="h-7 w-7 text-emerald-500" />
            </div>
            <p className="text-slate-600 font-medium">Noch keine Nachrichten</p>
            <p className="text-slate-400 text-sm mt-1">Schreib die erste Nachricht!</p>
          </div>
        )}

        {/* Message list */}
        <div className="space-y-1.5 pb-2">
          {grouped.map((item, idx) => {
            if (item.type === "separator") {
              return <DateSeparator key={`sep-${idx}`} date={item.date} />
            }
            return (
              <NachrichtBubble
                key={item.data.id}
                message={item.data}
                isMine={item.data.sender_id === currentUserId}
              />
            )
          })}
          <div ref={bottomRef} />
        </div>
      </ScrollArea>

      {/* Input area */}
      {!readOnly && (
        <div className="border-t border-slate-200 bg-white p-3 space-y-2">
          {/* Pending image preview */}
          {pendingImagePreview && (
            <div className="relative inline-block">
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img
                src={pendingImagePreview}
                alt="Vorschau"
                className="h-20 w-20 object-cover rounded-lg border border-slate-200"
              />
              <button
                onClick={clearPendingImage}
                className="absolute -top-1.5 -right-1.5 bg-slate-700 text-white rounded-full p-0.5 hover:bg-slate-900"
                aria-label="Bild entfernen"
              >
                <X className="h-3.5 w-3.5" />
              </button>
            </div>
          )}

          {/* File or upload errors */}
          {(fileError || uploadError || sendError) && (
            <p className="text-xs text-red-500 flex items-center gap-1">
              <AlertCircle className="h-3.5 w-3.5 flex-shrink-0" />
              {fileError ?? uploadError ?? sendError}
            </p>
          )}

          {/* Retry button when send failed */}
          {sendError && !isSending && (
            <Button
              size="sm"
              variant="outline"
              className="text-xs h-7"
              onClick={() => {
                setSendError(null)
                handleSend()
              }}
            >
              <RefreshCw className="h-3 w-3 mr-1" />
              Erneut senden
            </Button>
          )}

          <div className="flex items-end gap-2">
            {/* Hidden file input */}
            <input
              ref={fileInputRef}
              type="file"
              accept="image/jpeg,image/png,image/heic,image/heif"
              className="hidden"
              onChange={handleFileSelect}
              aria-label="Bild auswählen"
            />

            {/* Image upload button */}
            <Button
              type="button"
              variant="ghost"
              size="icon"
              className="flex-shrink-0 text-slate-400 hover:text-emerald-600"
              onClick={() => fileInputRef.current?.click()}
              disabled={isSending || isUploading}
              aria-label="Bild hochladen"
            >
              <ImageIcon className="h-5 w-5" />
            </Button>

            {/* Textarea */}
            <div className="flex-1 relative">
              <Textarea
                ref={textareaRef}
                value={text}
                onChange={(e) => {
                  if (e.target.value.length <= MAX_CHARS) setText(e.target.value)
                }}
                onKeyDown={handleKeyDown}
                placeholder="Nachricht schreiben… (Strg+Enter zum Senden)"
                className="resize-none min-h-[44px] max-h-32 pr-12 text-sm"
                rows={1}
                disabled={isSending || isUploading}
                aria-label="Nachrichtentext"
              />
              {text.length > MAX_CHARS * 0.8 && (
                <span
                  className={cn(
                    "absolute bottom-2 right-3 text-[10px]",
                    charsLeft < 50 ? "text-red-500" : "text-slate-400"
                  )}
                >
                  {charsLeft}
                </span>
              )}
            </div>

            {/* Send button */}
            <Button
              type="button"
              size="icon"
              className="flex-shrink-0 bg-emerald-500 hover:bg-emerald-600 text-white"
              onClick={handleSend}
              disabled={!canSend}
              aria-label="Nachricht senden"
            >
              <Send className="h-4 w-4" />
            </Button>
          </div>
        </div>
      )}

      {/* Read-only banner */}
      {readOnly && (
        <div className="border-t border-slate-200 bg-slate-100 px-4 py-3 text-center">
          <p className="text-sm text-slate-500">
            Dieser Chat ist archiviert. Keine neuen Nachrichten möglich.
          </p>
        </div>
      )}
    </div>
  )
}
