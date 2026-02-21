"use client"

import { useState, useRef, useCallback } from "react"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Button } from "@/components/ui/button"
import { Progress } from "@/components/ui/progress"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { Image, Video, Upload, X, AlertCircle } from "lucide-react"
import type { MediaType } from "@/types/exercise"

interface MediaUploadFieldProps {
  mediaUrl?: string | null
  mediaType?: MediaType | null
  onUploadComplete: (url: string, type: MediaType) => void
  onClear: () => void
  exerciseId?: string // provided when editing; used for the storage path
}

const IMAGE_MAX_BYTES = 5 * 1024 * 1024 // 5 MB
const VIDEO_MAX_BYTES = 50 * 1024 * 1024 // 50 MB

export function MediaUploadField({
  mediaUrl,
  mediaType,
  onUploadComplete,
  onClear,
  exerciseId,
}: MediaUploadFieldProps) {
  const [activeTab, setActiveTab] = useState<"image" | "video">(
    mediaType === "video" ? "video" : "image"
  )
  const [dragOver, setDragOver] = useState(false)
  const [uploadProgress, setUploadProgress] = useState<number | null>(null)
  const [uploadError, setUploadError] = useState<string | null>(null)
  const fileInputRef = useRef<HTMLInputElement>(null)
  // BUG-3: Generate a stable temp UUID for new exercises (no exerciseId yet)
  const tempIdRef = useRef<string>(crypto.randomUUID())
  const effectiveExerciseId = exerciseId ?? tempIdRef.current

  const accept = activeTab === "image" ? "image/jpeg,image/png,image/webp" : "video/mp4,video/webm"
  const maxBytes = activeTab === "image" ? IMAGE_MAX_BYTES : VIDEO_MAX_BYTES
  const maxLabel = activeTab === "image" ? "5 MB" : "50 MB"

  async function uploadFile(file: File) {
    setUploadError(null)

    // Validate file type
    const validImageTypes = ["image/jpeg", "image/png", "image/webp"]
    const validVideoTypes = ["video/mp4", "video/webm"]
    const validTypes = activeTab === "image" ? validImageTypes : validVideoTypes
    if (!validTypes.includes(file.type)) {
      setUploadError(
        activeTab === "image"
          ? "Nur JPG, PNG oder WebP-Dateien erlaubt."
          : "Nur MP4 oder WebM-Dateien erlaubt."
      )
      return
    }

    // Validate file size
    if (file.size > maxBytes) {
      setUploadError(`Datei zu groß. Maximal ${maxLabel} erlaubt.`)
      return
    }

    setUploadProgress(0)

    try {
      const formData = new FormData()
      formData.append("file", file)
      formData.append("media_type", activeTab)          // BUG-1: snake_case
      formData.append("exercise_id", effectiveExerciseId) // BUG-1+3: always send ID

      // Use XMLHttpRequest for upload progress support
      const url = await new Promise<string>((resolve, reject) => {
        const xhr = new XMLHttpRequest()

        xhr.upload.addEventListener("progress", (e) => {
          if (e.lengthComputable) {
            setUploadProgress(Math.round((e.loaded / e.total) * 100))
          }
        })

        xhr.addEventListener("load", () => {
          if (xhr.status >= 200 && xhr.status < 300) {
            try {
              const json = JSON.parse(xhr.responseText)
              resolve(json.media_url) // BUG-2: backend returns media_url
            } catch {
              reject(new Error("Ungültige Server-Antwort."))
            }
          } else {
            try {
              const json = JSON.parse(xhr.responseText)
              reject(new Error(json.error ?? "Upload fehlgeschlagen."))
            } catch {
              reject(new Error("Upload fehlgeschlagen."))
            }
          }
        })

        xhr.addEventListener("error", () => reject(new Error("Netzwerkfehler beim Upload.")))
        xhr.addEventListener("abort", () => reject(new Error("Upload abgebrochen.")))

        xhr.open("POST", "/api/exercises/upload")
        xhr.send(formData)
      })

      setUploadProgress(null)
      onUploadComplete(url, activeTab)
    } catch (err) {
      setUploadProgress(null)
      setUploadError(err instanceof Error ? err.message : "Upload fehlgeschlagen.")
    }
  }

  const handleDrop = useCallback(
    (e: React.DragEvent<HTMLDivElement>) => {
      e.preventDefault()
      setDragOver(false)
      const file = e.dataTransfer.files[0]
      if (file) uploadFile(file)
    },
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [activeTab, effectiveExerciseId]
  )

  function handleFileChange(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0]
    if (file) uploadFile(file)
    // Reset so same file can be re-uploaded
    e.target.value = ""
  }

  // If a media is already uploaded, show preview with option to replace
  if (mediaUrl && !uploadProgress) {
    return (
      <div className="space-y-2">
        <div className="relative rounded-lg overflow-hidden bg-muted border aspect-video">
          {mediaType === "image" ? (
            // eslint-disable-next-line @next/next/no-img-element
            <img
              src={mediaUrl}
              alt="Medien-Vorschau"
              className="w-full h-full object-contain"
            />
          ) : (
            <video
              src={mediaUrl}
              controls
              loop
              className="w-full h-full"
              aria-label="Video-Vorschau"
            />
          )}
          <button
            type="button"
            onClick={onClear}
            className="absolute top-2 right-2 p-1.5 rounded-full bg-white/90 shadow hover:bg-white transition-colors"
            aria-label="Medien entfernen"
          >
            <X className="h-4 w-4 text-gray-700" />
          </button>
        </div>
        <p className="text-xs text-muted-foreground text-center">
          {mediaType === "image" ? "Bild" : "Video"} hochgeladen. Zum Ändern: Medien entfernen und erneut hochladen.
        </p>
      </div>
    )
  }

  return (
    <div className="space-y-3">
      <Tabs value={activeTab} onValueChange={(v) => setActiveTab(v as "image" | "video")}>
        <TabsList className="grid w-full grid-cols-2">
          <TabsTrigger value="image" className="gap-2">
            <Image className="h-4 w-4" />
            Bild
          </TabsTrigger>
          <TabsTrigger value="video" className="gap-2">
            <Video className="h-4 w-4" />
            Video
          </TabsTrigger>
        </TabsList>

        <TabsContent value="image" className="mt-3">
          <DropZone
            accept={accept}
            maxLabel={maxLabel}
            dragOver={dragOver}
            onDragOver={(e) => { e.preventDefault(); setDragOver(true) }}
            onDragLeave={() => setDragOver(false)}
            onDrop={handleDrop}
            onClick={() => fileInputRef.current?.click()}
            label="JPG, PNG oder WebP"
          />
        </TabsContent>

        <TabsContent value="video" className="mt-3">
          <DropZone
            accept={accept}
            maxLabel={maxLabel}
            dragOver={dragOver}
            onDragOver={(e) => { e.preventDefault(); setDragOver(true) }}
            onDragLeave={() => setDragOver(false)}
            onDrop={handleDrop}
            onClick={() => fileInputRef.current?.click()}
            label="MP4 oder WebM"
          />
        </TabsContent>
      </Tabs>

      {/* Hidden file input */}
      <input
        ref={fileInputRef}
        type="file"
        accept={accept}
        className="hidden"
        onChange={handleFileChange}
        aria-hidden="true"
      />

      {/* Upload progress */}
      {uploadProgress !== null && (
        <div className="space-y-1">
          <div className="flex justify-between text-xs text-muted-foreground">
            <span>Hochladen...</span>
            <span>{uploadProgress}%</span>
          </div>
          <Progress value={uploadProgress} className="h-2" />
        </div>
      )}

      {/* Upload error */}
      {uploadError && (
        <Alert variant="destructive">
          <AlertCircle className="h-4 w-4" />
          <AlertDescription className="flex items-center justify-between">
            <span>{uploadError}</span>
            <Button
              type="button"
              variant="ghost"
              size="sm"
              onClick={() => setUploadError(null)}
              className="h-auto p-0 ml-2 text-destructive-foreground hover:text-destructive-foreground hover:bg-transparent"
            >
              Erneut versuchen
            </Button>
          </AlertDescription>
        </Alert>
      )}
    </div>
  )
}

interface DropZoneProps {
  accept: string
  maxLabel: string
  dragOver: boolean
  onDragOver: (e: React.DragEvent<HTMLDivElement>) => void
  onDragLeave: () => void
  onDrop: (e: React.DragEvent<HTMLDivElement>) => void
  onClick: () => void
  label: string
}

function DropZone({
  dragOver,
  onDragOver,
  onDragLeave,
  onDrop,
  onClick,
  label,
  maxLabel,
}: DropZoneProps) {
  return (
    <div
      role="button"
      tabIndex={0}
      onClick={onClick}
      onKeyDown={(e) => e.key === "Enter" && onClick()}
      onDragOver={onDragOver}
      onDragLeave={onDragLeave}
      onDrop={onDrop}
      aria-label={`${label} hochladen, max. ${maxLabel}`}
      className={`border-2 border-dashed rounded-lg p-8 text-center cursor-pointer transition-colors ${
        dragOver
          ? "border-primary bg-primary/5"
          : "border-muted-foreground/25 hover:border-primary/50 hover:bg-muted/50"
      }`}
    >
      <Upload className="h-8 w-8 mx-auto mb-3 text-muted-foreground" />
      <p className="text-sm font-medium mb-1">Datei hierher ziehen oder klicken</p>
      <p className="text-xs text-muted-foreground">
        {label} — max. {maxLabel}
      </p>
    </div>
  )
}
