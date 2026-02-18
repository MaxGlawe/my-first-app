"use client"

import { useState } from "react"
import { Card, CardContent, CardFooter } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog"
import {
  Star,
  MoreVertical,
  Pencil,
  Copy,
  Trash2,
  Video,
  Image,
  AlertTriangle,
} from "lucide-react"
import { SCHWIERIGKEITSGRAD_LABELS } from "@/types/exercise"
import type { Exercise } from "@/types/exercise"

interface UebungsKarteProps {
  exercise: Exercise
  onEdit: (exercise: Exercise) => void
  onDuplicate: (exercise: Exercise) => void
  onDelete: (exercise: Exercise) => void
  onFavoriteToggle: (exercise: Exercise) => void
  onViewDetail: (exercise: Exercise) => void
  isCurrentUserAdmin?: boolean
  currentUserId?: string
}

const SCHWIERIGKEITSGRAD_COLORS: Record<string, string> = {
  anfaenger: "bg-green-100 text-green-800",
  mittel: "bg-yellow-100 text-yellow-800",
  fortgeschritten: "bg-red-100 text-red-800",
}

export function UebungsKarte({
  exercise,
  onEdit,
  onDuplicate,
  onDelete,
  onFavoriteToggle,
  onViewDetail,
  isCurrentUserAdmin = false,
  currentUserId,
}: UebungsKarteProps) {
  const [showDeleteDialog, setShowDeleteDialog] = useState(false)
  const [favoriteLoading, setFavoriteLoading] = useState(false)
  const [videoError, setVideoError] = useState(false) // BUG-6

  const canEdit =
    !exercise.is_public ||
    (exercise.is_public && isCurrentUserAdmin) ||
    exercise.created_by === currentUserId

  async function handleFavoriteToggle(e: React.MouseEvent) {
    e.stopPropagation()
    if (favoriteLoading) return
    setFavoriteLoading(true)
    try {
      await onFavoriteToggle(exercise)
    } finally {
      setFavoriteLoading(false)
    }
  }

  function handleDeleteConfirm() {
    setShowDeleteDialog(false)
    onDelete(exercise)
  }

  return (
    <>
      <Card
        className="group cursor-pointer hover:shadow-md transition-shadow flex flex-col h-full"
        onClick={() => onViewDetail(exercise)}
        role="button"
        aria-label={`Übung ${exercise.name} anzeigen`}
        tabIndex={0}
        onKeyDown={(e) => e.key === "Enter" && onViewDetail(exercise)}
      >
        {/* Media Preview */}
        <div className="relative aspect-video rounded-t-lg overflow-hidden bg-muted">
          {exercise.media_url && exercise.media_type === "image" ? (
            // eslint-disable-next-line @next/next/no-img-element
            <img
              src={exercise.media_url}
              alt={exercise.name}
              className="w-full h-full object-cover"
            />
          ) : exercise.media_url && exercise.media_type === "video" && !videoError ? (
            <video
              src={exercise.media_url}
              className="w-full h-full object-cover"
              muted
              loop
              playsInline
              aria-label={`Video-Vorschau für ${exercise.name}`}
              onError={() => setVideoError(true)}
            />
          ) : exercise.media_url && exercise.media_type === "video" && videoError ? (
            // BUG-6: Broken-link indicator
            <div className="w-full h-full flex flex-col items-center justify-center gap-1 text-amber-600 bg-amber-50">
              <AlertTriangle className="h-6 w-6" />
              <span className="text-xs font-medium">Video nicht verfügbar</span>
            </div>
          ) : (
            <div className="w-full h-full flex items-center justify-center text-muted-foreground">
              <Image className="h-10 w-10 opacity-30" aria-hidden="true" />
            </div>
          )}

          {/* Media type badge */}
          {exercise.media_type && (
            <div className="absolute top-2 left-2">
              <Badge variant="secondary" className="text-xs gap-1 bg-white/90 text-gray-700">
                {exercise.media_type === "video" ? (
                  <Video className="h-3 w-3" />
                ) : (
                  <Image className="h-3 w-3" />
                )}
                {exercise.media_type === "video" ? "Video" : "Bild"}
              </Badge>
            </div>
          )}

          {/* Praxis badge */}
          {exercise.is_public && (
            <div className="absolute top-2 right-2">
              <Badge className="text-xs bg-blue-600 text-white">Praxis</Badge>
            </div>
          )}

          {/* Favorite button */}
          <button
            className="absolute bottom-2 right-2 p-1.5 rounded-full bg-white/90 shadow-sm opacity-0 group-hover:opacity-100 transition-opacity hover:bg-white"
            onClick={handleFavoriteToggle}
            disabled={favoriteLoading}
            aria-label={exercise.is_favorite ? "Favorit entfernen" : "Als Favorit markieren"}
            aria-pressed={exercise.is_favorite}
          >
            <Star
              className={`h-4 w-4 transition-colors ${
                exercise.is_favorite
                  ? "fill-yellow-400 text-yellow-400"
                  : "text-gray-400"
              }`}
            />
          </button>
        </div>

        {/* Content */}
        <CardContent className="flex-1 pt-3 pb-2 px-3">
          <h3 className="font-semibold text-sm leading-tight line-clamp-2 mb-2">
            {exercise.name}
          </h3>

          {/* Muskelgruppen */}
          {exercise.muskelgruppen.length > 0 && (
            <div className="flex flex-wrap gap-1 mb-2">
              {exercise.muskelgruppen.slice(0, 3).map((gruppe) => (
                <Badge key={gruppe} variant="outline" className="text-xs px-1.5 py-0">
                  {gruppe}
                </Badge>
              ))}
              {exercise.muskelgruppen.length > 3 && (
                <Badge variant="outline" className="text-xs px-1.5 py-0">
                  +{exercise.muskelgruppen.length - 3}
                </Badge>
              )}
            </div>
          )}

          {/* Schwierigkeitsgrad */}
          <span
            className={`inline-block text-xs px-2 py-0.5 rounded-full font-medium ${
              SCHWIERIGKEITSGRAD_COLORS[exercise.schwierigkeitsgrad] ?? ""
            }`}
          >
            {SCHWIERIGKEITSGRAD_LABELS[exercise.schwierigkeitsgrad]}
          </span>
        </CardContent>

        {/* Footer with actions */}
        <CardFooter className="px-3 py-2 border-t flex items-center justify-between">
          <div className="flex items-center gap-1 text-xs text-muted-foreground">
            {exercise.standard_saetze && (
              <span>{exercise.standard_saetze} Sätze</span>
            )}
            {exercise.standard_saetze && exercise.standard_wiederholungen && (
              <span>×</span>
            )}
            {exercise.standard_wiederholungen && (
              <span>{exercise.standard_wiederholungen} Wdh.</span>
            )}
          </div>

          <DropdownMenu>
            <DropdownMenuTrigger asChild onClick={(e) => e.stopPropagation()}>
              <Button
                variant="ghost"
                size="sm"
                className="h-7 w-7 p-0 opacity-0 group-hover:opacity-100 focus:opacity-100 transition-opacity"
                aria-label="Weitere Aktionen"
              >
                <MoreVertical className="h-4 w-4" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end" onClick={(e) => e.stopPropagation()}>
              {canEdit && (
                <DropdownMenuItem onClick={() => onEdit(exercise)}>
                  <Pencil className="mr-2 h-4 w-4" />
                  Bearbeiten
                </DropdownMenuItem>
              )}
              <DropdownMenuItem onClick={() => onDuplicate(exercise)}>
                <Copy className="mr-2 h-4 w-4" />
                Duplizieren
              </DropdownMenuItem>
              {canEdit && (
                <>
                  <DropdownMenuSeparator />
                  <DropdownMenuItem
                    onClick={() => setShowDeleteDialog(true)}
                    className="text-destructive focus:text-destructive"
                  >
                    <Trash2 className="mr-2 h-4 w-4" />
                    Löschen
                  </DropdownMenuItem>
                </>
              )}
            </DropdownMenuContent>
          </DropdownMenu>
        </CardFooter>
      </Card>

      {/* Delete confirmation */}
      <AlertDialog open={showDeleteDialog} onOpenChange={setShowDeleteDialog}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle className="flex items-center gap-2">
              <AlertTriangle className="h-5 w-5 text-destructive" />
              Übung löschen?
            </AlertDialogTitle>
            <AlertDialogDescription>
              Soll die Übung <strong>{exercise.name}</strong> wirklich gelöscht werden?
              {" "}Wenn die Übung in aktiven Trainingsplänen genutzt wird, wird sie dort als „Archiviert" markiert.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Abbrechen</AlertDialogCancel>
            <AlertDialogAction
              onClick={handleDeleteConfirm}
              className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
            >
              Löschen
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </>
  )
}
