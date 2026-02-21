"use client"

import { useState, useRef, useEffect } from "react"
import Link from "next/link"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { ArrowLeft, Save, Loader2, Check, Rocket, Users } from "lucide-react"
import { STATUS_LABELS } from "@/types/course"
import type { CourseStatus } from "@/types/course"

export type SaveStatus = "saved" | "saving" | "unsaved"

interface CourseBuilderHeaderProps {
  name: string
  onNameChange: (name: string) => void
  status: CourseStatus
  version: number
  saveStatus: SaveStatus
  onPublish: () => void
  isPublishing: boolean
  courseId: string
}

export function CourseBuilderHeader({
  name,
  onNameChange,
  status,
  version,
  saveStatus,
  onPublish,
  isPublishing,
  courseId,
}: CourseBuilderHeaderProps) {
  const [isEditing, setIsEditing] = useState(false)
  const [editValue, setEditValue] = useState(name)
  const inputRef = useRef<HTMLInputElement>(null)

  useEffect(() => {
    if (isEditing && inputRef.current) {
      inputRef.current.focus()
      inputRef.current.select()
    }
  }, [isEditing])

  const commitEdit = () => {
    const trimmed = editValue.trim()
    if (trimmed && trimmed !== name) {
      onNameChange(trimmed)
    } else {
      setEditValue(name)
    }
    setIsEditing(false)
  }

  return (
    <div className="sticky top-0 z-10 bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/80 border-b">
      <div className="container mx-auto px-4 max-w-7xl">
        <div className="flex items-center gap-3 h-14">
          {/* Back */}
          <Link href="/os/courses">
            <Button variant="ghost" size="icon" className="shrink-0">
              <ArrowLeft className="h-4 w-4" />
            </Button>
          </Link>

          {/* Editable title */}
          {isEditing ? (
            <input
              ref={inputRef}
              value={editValue}
              onChange={(e) => setEditValue(e.target.value)}
              onBlur={commitEdit}
              onKeyDown={(e) => {
                if (e.key === "Enter") commitEdit()
                if (e.key === "Escape") {
                  setEditValue(name)
                  setIsEditing(false)
                }
              }}
              className="text-lg font-semibold bg-transparent border-b-2 border-primary outline-none flex-1 min-w-0"
              maxLength={200}
            />
          ) : (
            <button
              onClick={() => { setEditValue(name); setIsEditing(true) }}
              className="text-lg font-semibold truncate text-left hover:text-primary transition-colors min-w-0"
            >
              {name}
            </button>
          )}

          {/* Status badge */}
          <Badge variant="outline" className="shrink-0">
            {STATUS_LABELS[status]}
            {version > 0 && ` v${version}`}
          </Badge>

          {/* Save status */}
          <div className="flex items-center gap-1.5 text-sm shrink-0 ml-auto">
            {saveStatus === "saving" && (
              <>
                <Loader2 className="h-3.5 w-3.5 animate-spin text-muted-foreground" />
                <span className="text-muted-foreground">Speichert...</span>
              </>
            )}
            {saveStatus === "saved" && (
              <>
                <Check className="h-3.5 w-3.5 text-green-600" />
                <span className="text-green-600">Gespeichert</span>
              </>
            )}
            {saveStatus === "unsaved" && (
              <>
                <Save className="h-3.5 w-3.5 text-amber-600" />
                <span className="text-amber-600">Nicht gespeichert</span>
              </>
            )}
          </div>

          {/* Participants link */}
          <Link href={`/os/courses/${courseId}/participants`}>
            <Button variant="outline" size="sm" className="shrink-0">
              <Users className="mr-2 h-4 w-4" />
              Teilnehmer
            </Button>
          </Link>

          {/* Publish button */}
          <Button
            onClick={onPublish}
            disabled={isPublishing || status === "archiviert"}
            size="sm"
            className="shrink-0"
          >
            {isPublishing ? (
              <Loader2 className="mr-2 h-4 w-4 animate-spin" />
            ) : (
              <Rocket className="mr-2 h-4 w-4" />
            )}
            {version === 0 ? "Veröffentlichen" : "Neu veröffentlichen"}
          </Button>
        </div>
      </div>
    </div>
  )
}
