/**
 * PROJ-27 — Dokumentenakte: die gemeinsame Quelle.
 *
 * Kategorien, Grenzen und die Protokollierung stehen hier und nicht verteilt
 * über die Endpunkte. Eine Dateigrössengrenze, die an drei Stellen steht,
 * steht irgendwann an drei Stellen verschieden — und dann lädt der Patient
 * etwas hoch, das der Server danach ablehnt.
 */

import type { SupabaseClient } from "@supabase/supabase-js"

export const DOKUMENT_BUCKET = "patient-documents"

/** Muss zur Migration passen (CHECK-Constraint und Bucket-Konfiguration). */
export const MAX_BYTES = 25 * 1024 * 1024

export const ERLAUBTE_TYPEN = [
  "application/pdf",
  "image/jpeg",
  "image/png",
  "image/heic",
  "image/heif",
  "image/webp",
] as const

export type Kategorie =
  | "arztbrief"
  | "bildgebung"
  | "op_bericht"
  | "labor"
  | "verordnung"
  | "sonstiges"

export const KATEGORIEN: { id: Kategorie; label: string; hinweis: string }[] = [
  { id: "arztbrief", label: "Arztbrief", hinweis: "Befundbericht, Entlassbrief, Überweisung" },
  { id: "bildgebung", label: "Bildgebung", hinweis: "MRT, Röntgen, CT, Ultraschall" },
  { id: "op_bericht", label: "OP-Bericht", hinweis: "Operationsbericht, Nachsorgeplan" },
  { id: "labor", label: "Laborwerte", hinweis: "Blutbild, Entzündungswerte" },
  { id: "verordnung", label: "Verordnung", hinweis: "Rezept, Heilmittelverordnung" },
  { id: "sonstiges", label: "Sonstiges", hinweis: "Alles andere" },
]

export function kategorieLabel(id: string): string {
  return KATEGORIEN.find((k) => k.id === id)?.label ?? "Sonstiges"
}

/**
 * Speicherpfad im Bucket.
 *
 * Der Patient steht vorn, damit sich die Dateien eines Patienten am Stück
 * finden und im Notfall am Stück entfernen lassen. Der Dateiname ist die
 * Dokument-UUID und NICHT der Name, den der Patient vergeben hat: Ein
 * hochgeladener Dateiname kann alles enthalten — Umlaute, Schrägstriche, den
 * Namen einer anderen Person. Der Originalname lebt in der Spalte `titel`,
 * wo er nichts kaputt machen kann.
 */
export function dokumentPfad(patientId: string, dokumentId: string, mime: string): string {
  const endung =
    {
      "application/pdf": "pdf",
      "image/jpeg": "jpg",
      "image/png": "png",
      "image/heic": "heic",
      "image/heif": "heif",
      "image/webp": "webp",
    }[mime] ?? "bin"
  return `${patientId}/${dokumentId}.${endung}`
}

export function formatBytes(bytes: number): string {
  if (bytes < 1024) return `${bytes} B`
  if (bytes < 1024 * 1024) return `${Math.round(bytes / 1024)} KB`
  return `${(bytes / (1024 * 1024)).toFixed(1)} MB`
}

/**
 * Hält fest, wer auf ein Dokument zugegriffen hat.
 *
 * Das ist das Gegenstück zu der Entscheidung, dass ALLE klinischen Rollen in
 * die Akte sehen dürfen. Ohne dieses Protokoll wäre die Öffnung reine
 * Bequemlichkeit; mit ihm ist sie belegbar.
 *
 * Bewusst ohne `await` an den Aufrufstellen und mit verschlucktem Fehler: Ein
 * Protokolleintrag, der scheitert, darf einem Behandler nicht den Befund
 * vorenthalten. Sichtbar wird das Scheitern trotzdem — in der Serverkonsole.
 */
export function protokolliere(
  svc: SupabaseClient,
  args: {
    documentId: string
    patientId: string
    userId: string | null
    rolle: string | null
    aktion: "angesehen" | "hochgeladen" | "geloescht" | "korrektur_gemeldet"
    ip?: string | null
  }
): void {
  void svc
    .from("patient_document_access")
    .insert({
      document_id: args.documentId,
      patient_id: args.patientId,
      user_id: args.userId,
      rolle: args.rolle,
      aktion: args.aktion,
      ip: args.ip ?? null,
    })
    .then(({ error }) => {
      if (error) console.error("[dokumente] Zugriffsprotokoll fehlgeschlagen:", error.message)
    })
}
