// ── PROJ-17: TTS Type Definitions ──────────────────────────────────────────────

export type TTSSourceType = "exercise" | "lesson" | "training_plan"

export type AmbientTheme = "forest" | "sea" | "mountains"

export const AMBIENT_THEME_LABELS: Record<AmbientTheme, string> = {
  forest: "Wald",
  sea: "Meer",
  mountains: "Berge",
}

export const AMBIENT_THEME_ICONS: Record<AmbientTheme, string> = {
  forest: "trees",
  sea: "waves",
  mountains: "mountain",
}

export interface TTSAudioCache {
  id: string
  content_hash: string
  voice_id: string
  model_id: string
  source_type: TTSSourceType
  source_id: string | null
  chunk_index: number
  total_chunks: number
  storage_path: string
  storage_bucket: string
  file_size_bytes: number | null
  duration_seconds: number | null
  input_char_count: number
  created_at: string
  expires_at: string | null
}

export interface TTSGenerateRequest {
  text: string
  source_type: TTSSourceType
  source_id?: string
  is_html?: boolean
}

export interface TTSGenerateResponse {
  audio_urls: string[]
  cached: boolean
  total_chunks: number
}

export interface AmbientSound {
  name: string
  url: string
}

export interface AmbientSoundsResponse {
  theme: AmbientTheme
  sounds: AmbientSound[]
}
