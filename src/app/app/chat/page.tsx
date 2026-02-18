"use client"

import { useState, useEffect } from "react"
import { AlertCircle } from "lucide-react"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { Skeleton } from "@/components/ui/skeleton"
import { ChatHeader } from "@/components/chat/ChatHeader"
import { ChatFenster } from "@/components/chat/ChatFenster"
import { supabase } from "@/lib/supabase"

interface PatientProfile {
  id: string
  vorname: string
  nachname: string
  therapeut_id: string | null
  therapeut_name: string | null
  is_archived: boolean
}

export default function PatientChatPage() {
  const [profile, setProfile] = useState<PatientProfile | null>(null)
  const [currentUserId, setCurrentUserId] = useState<string | null>(null)
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    let cancelled = false

    async function loadProfile() {
      setIsLoading(true)
      setError(null)
      try {
        // Get current user session
        const { data: { user } } = await supabase.auth.getUser()
        if (!user) {
          setError("Nicht angemeldet.")
          return
        }
        if (!cancelled) setCurrentUserId(user.id)

        // Load patient profile + therapist name via API
        const res = await fetch("/api/me/chat/profile")
        if (cancelled) return
        if (!res.ok) {
          const body = await res.json().catch(() => ({}))
          setError(body.error ?? "Profil konnte nicht geladen werden.")
          return
        }
        const json = await res.json()
        setProfile(json.profile ?? null)
      } catch {
        if (!cancelled) setError("Ein unerwarteter Fehler ist aufgetreten.")
      } finally {
        if (!cancelled) setIsLoading(false)
      }
    }

    loadProfile()
    return () => {
      cancelled = true
    }
  }, [])

  if (isLoading) {
    return (
      <div className="flex flex-col h-[calc(100vh-80px)]">
        {/* Header skeleton */}
        <div className="flex items-center gap-3 px-4 py-3 bg-white border-b border-slate-200">
          <Skeleton className="h-10 w-10 rounded-full" />
          <div className="space-y-1.5">
            <Skeleton className="h-4 w-32" />
            <Skeleton className="h-3 w-20" />
          </div>
        </div>
        {/* Message area skeleton */}
        <div className="flex-1 p-4 space-y-3">
          {Array.from({ length: 5 }).map((_, i) => (
            <div
              key={i}
              className={`flex ${i % 2 === 0 ? "justify-start" : "justify-end"}`}
            >
              <Skeleton className={`h-12 rounded-2xl ${i % 2 === 0 ? "w-48" : "w-64"}`} />
            </div>
          ))}
        </div>
      </div>
    )
  }

  if (error || !profile) {
    return (
      <div className="container mx-auto py-8 px-4 max-w-lg">
        <Alert variant="destructive">
          <AlertCircle className="h-4 w-4" />
          <AlertDescription>
            {error ?? "Dein Profil konnte nicht gefunden werden."}
          </AlertDescription>
        </Alert>
      </div>
    )
  }

  if (!profile.therapeut_id) {
    return (
      <div className="container mx-auto py-8 px-4 max-w-lg">
        <Alert>
          <AlertCircle className="h-4 w-4" />
          <AlertDescription>
            Du hast noch keinen zugewiesenen Therapeuten. Sobald dir ein Therapeut zugewiesen
            wurde, kannst du hier chatten.
          </AlertDescription>
        </Alert>
      </div>
    )
  }

  const therapeutName = profile.therapeut_name ?? "Dein Therapeut"

  return (
    <div className="flex flex-col h-[calc(100vh-80px)]">
      <ChatHeader
        name={therapeutName}
        subtitle="Dein Therapeut"
        backHref="/app/dashboard"
      />
      <div className="flex-1 min-h-0">
        <ChatFenster
          patientId={profile.id}
          currentUserId={currentUserId}
          perspective="patient"
          readOnly={profile.is_archived}
          className="h-full"
        />
      </div>
    </div>
  )
}
