// ── PROJ-12: Chat types ────────────────────────────────────────────────────────

export interface ChatMessage {
  id: string
  patient_id: string
  sender_id: string
  content: string | null
  media_url: string | null
  media_type: "image" | null
  read_at: string | null
  created_at: string
  retain_until: string
}

/** A conversation entry in the therapist inbox */
export interface ChatInboxEntry {
  patient_id: string
  patient_name: string
  patient_avatar: string | null
  last_message: string | null
  last_message_at: string | null
  unread_count: number
}

/** Which side of the chat window is "me" */
export type ChatPerspective = "patient" | "therapeut"
