"use client"

import { useState, useEffect, useCallback, useRef } from "react"
import { supabase } from "@/lib/supabase"
import type { ChatMessage, ChatInboxEntry, ChatPerspective } from "@/types/chat"

// ── useChatMessages ────────────────────────────────────────────────────────────
// Loads messages for a conversation (patient_id), subscribes to Realtime,
// and handles mark-as-read + sending.

interface UseChatMessagesOptions {
  patientId: string | null
  perspective: ChatPerspective
}

interface UseChatMessagesResult {
  messages: ChatMessage[]
  isLoading: boolean
  isSending: boolean
  error: string | null
  hasOlder: boolean
  loadOlder: () => void
  sendMessage: (content: string, mediaUrl?: string) => Promise<void>
  markRead: () => Promise<void>
  refresh: () => void
}

const PAGE_SIZE = 50

export function useChatMessages({
  patientId,
  perspective,
}: UseChatMessagesOptions): UseChatMessagesResult {
  const [messages, setMessages] = useState<ChatMessage[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [isSending, setIsSending] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [cursor, setCursor] = useState<string | null>(null)
  const [hasOlder, setHasOlder] = useState(false)
  const [refreshKey, setRefreshKey] = useState(0)

  const refresh = useCallback(() => setRefreshKey((k) => k + 1), [])

  // ── API base URLs depending on perspective ───────────────────────────────────
  const apiBase =
    perspective === "patient" ? "/api/me/chat" : `/api/patients/${patientId}/chat`

  // ── Fetch latest 50 messages ─────────────────────────────────────────────────
  useEffect(() => {
    if (!patientId) {
      setIsLoading(false)
      return
    }

    let cancelled = false

    async function load() {
      setIsLoading(true)
      setError(null)
      try {
        const res = await fetch(apiBase)
        if (cancelled) return
        if (!res.ok) {
          const body = await res.json().catch(() => ({}))
          setError(body.error ?? "Nachrichten konnten nicht geladen werden.")
          return
        }
        const json = await res.json()
        setMessages(json.messages ?? [])
        setCursor(json.nextCursor ?? null)
        setHasOlder(json.hasOlder ?? false)
      } catch {
        if (!cancelled) setError("Ein unerwarteter Fehler ist aufgetreten.")
      } finally {
        if (!cancelled) setIsLoading(false)
      }
    }

    load()
    return () => {
      cancelled = true
    }
  }, [patientId, apiBase, refreshKey])

  // ── Supabase Realtime subscription ───────────────────────────────────────────
  useEffect(() => {
    if (!patientId) return

    const channel = supabase
      .channel(`chat:patient:${patientId}`)
      .on(
        "postgres_changes",
        {
          event: "INSERT",
          schema: "public",
          table: "chat_messages",
          filter: `patient_id=eq.${patientId}`,
        },
        (payload) => {
          const newMsg = payload.new as ChatMessage
          setMessages((prev) => {
            // Avoid duplicates
            if (prev.some((m) => m.id === newMsg.id)) return prev
            return [...prev, newMsg]
          })
        }
      )
      .on(
        "postgres_changes",
        {
          event: "UPDATE",
          schema: "public",
          table: "chat_messages",
          filter: `patient_id=eq.${patientId}`,
        },
        (payload) => {
          const updated = payload.new as ChatMessage
          setMessages((prev) =>
            prev.map((m) => (m.id === updated.id ? updated : m))
          )
        }
      )
      .subscribe()

    return () => {
      supabase.removeChannel(channel)
    }
  }, [patientId])

  // ── Load older messages (pagination) ─────────────────────────────────────────
  const loadOlder = useCallback(async () => {
    if (!patientId || !cursor || !hasOlder) return
    try {
      const res = await fetch(`${apiBase}?cursor=${encodeURIComponent(cursor)}`)
      if (!res.ok) return
      const json = await res.json()
      const older: ChatMessage[] = json.messages ?? []
      setMessages((prev) => [...older, ...prev])
      setCursor(json.nextCursor ?? null)
      setHasOlder(json.hasOlder ?? false)
    } catch {
      // Silently fail for pagination
    }
  }, [patientId, cursor, hasOlder, apiBase])

  // ── Send message ─────────────────────────────────────────────────────────────
  const sendMessage = useCallback(
    async (content: string, mediaUrl?: string) => {
      if (!patientId) return
      setIsSending(true)
      try {
        const body: Record<string, string> = { content }
        if (mediaUrl) body.media_url = mediaUrl
        const res = await fetch(apiBase, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(body),
        })
        if (!res.ok) {
          const err = await res.json().catch(() => ({}))
          throw new Error(err.error ?? "Nachricht konnte nicht gesendet werden.")
        }
        // Realtime will add the message; no manual push needed
      } catch (err) {
        throw err
      } finally {
        setIsSending(false)
      }
    },
    [patientId, apiBase]
  )

  // ── Mark messages as read ─────────────────────────────────────────────────────
  const markRead = useCallback(async () => {
    if (!patientId) return
    try {
      await fetch(`${apiBase}/read`, { method: "PATCH" })
    } catch {
      // Non-critical
    }
  }, [patientId, apiBase])

  return {
    messages,
    isLoading,
    isSending,
    error,
    hasOlder,
    loadOlder,
    sendMessage,
    markRead,
    refresh,
  }
}

// ── useChatInbox ───────────────────────────────────────────────────────────────
// Used by the therapist to load the full inbox.

interface UseChatInboxResult {
  inbox: ChatInboxEntry[]
  isLoading: boolean
  error: string | null
  totalUnread: number
  refresh: () => void
}

export function useChatInbox(): UseChatInboxResult {
  const [inbox, setInbox] = useState<ChatInboxEntry[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [refreshKey, setRefreshKey] = useState(0)

  const refresh = useCallback(() => setRefreshKey((k) => k + 1), [])

  useEffect(() => {
    let cancelled = false

    async function load() {
      setIsLoading(true)
      setError(null)
      try {
        const res = await fetch("/api/chat/inbox")
        if (cancelled) return
        if (!res.ok) {
          const body = await res.json().catch(() => ({}))
          setError(body.error ?? "Posteingang konnte nicht geladen werden.")
          return
        }
        const json = await res.json()
        setInbox(json.conversations ?? [])
      } catch {
        if (!cancelled) setError("Ein unerwarteter Fehler ist aufgetreten.")
      } finally {
        if (!cancelled) setIsLoading(false)
      }
    }

    load()
    return () => {
      cancelled = true
    }
  }, [refreshKey])

  // Realtime: re-fetch inbox when any chat_messages INSERT occurs
  useEffect(() => {
    const channel = supabase
      .channel("chat:inbox:therapeut")
      .on(
        "postgres_changes",
        { event: "INSERT", schema: "public", table: "chat_messages" },
        () => {
          refresh()
        }
      )
      .subscribe()

    return () => {
      supabase.removeChannel(channel)
    }
  }, [refresh])

  const totalUnread = inbox.reduce((sum, c) => sum + c.unread_count, 0)

  return { inbox, isLoading, error, totalUnread, refresh }
}

// ── useChatImageUpload ──────────────────────────────────────────────────────────
// Handles uploading an image to Supabase Storage chat/ folder.

interface UseImageUploadResult {
  uploadImage: (file: File, patientId: string) => Promise<string>
  isUploading: boolean
  uploadError: string | null
}

export function useChatImageUpload(): UseImageUploadResult {
  const [isUploading, setIsUploading] = useState(false)
  const [uploadError, setUploadError] = useState<string | null>(null)

  const uploadImage = useCallback(
    async (file: File, patientId: string): Promise<string> => {
      setIsUploading(true)
      setUploadError(null)
      try {
        const ext = file.name.split(".").pop() ?? "jpg"
        const path = `chat/${patientId}/${Date.now()}.${ext}`
        const { error } = await supabase.storage
          .from("chat-media")
          .upload(path, file, { upsert: false })
        if (error) throw new Error(error.message)
        // BUG-3 FIX: Use signed URL (7-day TTL) instead of public URL.
        // The media bucket must be set to private in Supabase Dashboard.
        const { data: signData, error: signError } = await supabase.storage
          .from("chat-media")
          .createSignedUrl(path, 604800) // 7 days
        if (signError || !signData?.signedUrl)
          throw new Error("Signed URL konnte nicht erstellt werden.")
        return signData.signedUrl
      } catch (err: unknown) {
        const msg =
          err instanceof Error ? err.message : "Bild konnte nicht hochgeladen werden."
        setUploadError(msg)
        throw err
      } finally {
        setIsUploading(false)
      }
    },
    []
  )

  return { uploadImage, isUploading, uploadError }
}
