"use client"

import { useState, useEffect } from "react"
import { supabase } from "@/lib/supabase"
import { ChatFenster } from "@/components/chat/ChatFenster"
import { Skeleton } from "@/components/ui/skeleton"

interface ChatTabProps {
  patientId: string
  /** Whether the patient is archived (chat becomes read-only) */
  isArchived?: boolean
}

export function ChatTab({ patientId, isArchived = false }: ChatTabProps) {
  const [currentUserId, setCurrentUserId] = useState<string | null>(null)
  const [isLoading, setIsLoading] = useState(true)

  useEffect(() => {
    supabase.auth.getUser().then(({ data: { user } }) => {
      setCurrentUserId(user?.id ?? null)
      setIsLoading(false)
    })
  }, [])

  if (isLoading) {
    return (
      <div className="space-y-3 p-4">
        {Array.from({ length: 4 }).map((_, i) => (
          <div key={i} className={`flex ${i % 2 === 0 ? "justify-start" : "justify-end"}`}>
            <Skeleton className={`h-12 rounded-2xl ${i % 2 === 0 ? "w-48" : "w-64"}`} />
          </div>
        ))}
      </div>
    )
  }

  return (
    <div className="h-[600px] border border-slate-200 rounded-xl overflow-hidden">
      <ChatFenster
        patientId={patientId}
        currentUserId={currentUserId}
        perspective="therapeut"
        readOnly={isArchived}
        className="h-full"
      />
    </div>
  )
}
