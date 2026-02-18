"use client"

import { useState } from "react"
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetDescription,
} from "@/components/ui/sheet"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Separator } from "@/components/ui/separator"
import { ScrollArea } from "@/components/ui/scroll-area"
import {
  Star,
  Pencil,
  Copy,
  Dumbbell,
  Clock,
  RotateCcw,
  Layers,
  AlertTriangle,
} from "lucide-react"
import { SCHWIERIGKEITSGRAD_LABELS } from "@/types/exercise"
import type { Exercise } from "@/types/exercise"

interface UebungsDetailSheetProps {
  exercise: Exercise | null
  open: boolean
  onOpenChange: (open: boolean) => void
  onEdit: (exercise: Exercise) => void
  onDuplicate: (exercise: Exercise) => void
  onFavoriteToggle: (exercise: Exercise) => void
  canEdit: boolean
}

const SCHWIERIGKEITSGRAD_COLORS: Record<string, string> = {
  anfaenger: "bg-green-100 text-green-800 border-green-200",
  mittel: "bg-yellow-100 text-yellow-800 border-yellow-200",
  fortgeschritten: "bg-red-100 text-red-800 border-red-200",
}

export function UebungsDetailSheet({
  exercise,
  open,
  onOpenChange,
  onEdit,
  onDuplicate,
  onFavoriteToggle,
  canEdit,
}: UebungsDetailSheetProps) {
  const [videoError, setVideoError] = useState(false) // BUG-6

  if (!exercise) return null

  const schwierigkeitColor =
    SCHWIERIGKEITSGRAD_COLORS[exercise.schwierigkeitsgrad] ?? ""

  return (
    <Sheet open={open} onOpenChange={onOpenChange}>
      <SheetContent className="w-full sm:max-w-lg flex flex-col p-0" side="right">
        <SheetHeader className="px-6 pt-6 pb-4 border-b">
          <div className="flex items-start justify-between gap-3">
            <div className="flex-1 min-w-0">
              <SheetTitle className="text-xl leading-tight">{exercise.name}</SheetTitle>
              <SheetDescription className="sr-only">
                Übungsdetails für {exercise.name}
              </SheetDescription>
            </div>
            {exercise.is_archived && (
              <Badge variant="outline" className="shrink-0 gap-1 text-amber-700 border-amber-300 bg-amber-50">
                <AlertTriangle className="h-3 w-3" />
                Archiviert
              </Badge>
            )}
          </div>

          {/* Action buttons */}
          <div className="flex gap-2 mt-3">
            <Button
              variant="outline"
              size="sm"
              className="gap-1.5"
              onClick={() => onFavoriteToggle(exercise)}
              aria-pressed={exercise.is_favorite}
              aria-label={exercise.is_favorite ? "Favorit entfernen" : "Als Favorit markieren"}
            >
              <Star
                className={`h-4 w-4 transition-colors ${
                  exercise.is_favorite ? "fill-yellow-400 text-yellow-400" : "text-muted-foreground"
                }`}
              />
              {exercise.is_favorite ? "Favorit" : "Favorisieren"}
            </Button>
            <Button
              variant="outline"
              size="sm"
              className="gap-1.5"
              onClick={() => onDuplicate(exercise)}
            >
              <Copy className="h-4 w-4" />
              Duplizieren
            </Button>
            {canEdit && (
              <Button
                size="sm"
                className="gap-1.5"
                onClick={() => onEdit(exercise)}
              >
                <Pencil className="h-4 w-4" />
                Bearbeiten
              </Button>
            )}
          </div>
        </SheetHeader>

        <ScrollArea className="flex-1">
          <div className="px-6 py-4 space-y-6">
            {/* Media */}
            {exercise.media_url && (
              <div className="rounded-lg overflow-hidden bg-muted aspect-video">
                {exercise.media_type === "image" ? (
                  // eslint-disable-next-line @next/next/no-img-element
                  <img
                    src={exercise.media_url}
                    alt={exercise.name}
                    className="w-full h-full object-cover"
                  />
                ) : videoError ? (
                  // BUG-6: Broken-link indicator
                  <div className="w-full h-full flex flex-col items-center justify-center gap-2 text-amber-600 bg-amber-50">
                    <AlertTriangle className="h-8 w-8" />
                    <span className="text-sm font-medium">Video nicht verfügbar</span>
                    <span className="text-xs text-muted-foreground">Die Video-Datei konnte nicht geladen werden.</span>
                  </div>
                ) : (
                  <video
                    src={exercise.media_url}
                    controls
                    loop
                    className="w-full h-full"
                    aria-label={`Video für ${exercise.name}`}
                    onError={() => setVideoError(true)}
                  />
                )}
              </div>
            )}

            {/* Badges row */}
            <div className="flex flex-wrap gap-2">
              <span
                className={`inline-flex items-center gap-1 text-xs px-2.5 py-1 rounded-full font-medium border ${schwierigkeitColor}`}
              >
                <Dumbbell className="h-3 w-3" />
                {SCHWIERIGKEITSGRAD_LABELS[exercise.schwierigkeitsgrad]}
              </span>
              {exercise.is_public && (
                <Badge className="bg-blue-600 text-white text-xs">Praxis-Bibliothek</Badge>
              )}
              {exercise.muskelgruppen.map((gruppe) => (
                <Badge key={gruppe} variant="outline" className="text-xs">
                  {gruppe}
                </Badge>
              ))}
            </div>

            {/* Beschreibung */}
            {exercise.beschreibung && (
              <div>
                <h3 className="text-sm font-semibold mb-1.5">Beschreibung</h3>
                <p className="text-sm text-muted-foreground whitespace-pre-line">
                  {exercise.beschreibung}
                </p>
              </div>
            )}

            {/* Ausführungsanweisung */}
            {exercise.ausfuehrung && exercise.ausfuehrung.length > 0 && (
              <div>
                <h3 className="text-sm font-semibold mb-2">Ausführungsanweisung</h3>
                <ol className="space-y-2">
                  {exercise.ausfuehrung.map((schritt) => (
                    <li key={schritt.nummer} className="flex gap-3 text-sm">
                      <span className="flex-shrink-0 font-semibold text-primary w-5">
                        {schritt.nummer}.
                      </span>
                      <span className="text-muted-foreground">{schritt.beschreibung}</span>
                    </li>
                  ))}
                </ol>
              </div>
            )}

            {/* Standard-Parameter */}
            {(exercise.standard_saetze ||
              exercise.standard_wiederholungen ||
              exercise.standard_pause_sekunden) && (
              <>
                <Separator />
                <div>
                  <h3 className="text-sm font-semibold mb-3">Standard-Parameter</h3>
                  <div className="grid grid-cols-3 gap-3">
                    {exercise.standard_saetze && (
                      <div className="flex flex-col items-center p-3 rounded-lg bg-muted text-center">
                        <Layers className="h-5 w-5 text-primary mb-1" />
                        <span className="text-lg font-bold">{exercise.standard_saetze}</span>
                        <span className="text-xs text-muted-foreground">Sätze</span>
                      </div>
                    )}
                    {exercise.standard_wiederholungen && (
                      <div className="flex flex-col items-center p-3 rounded-lg bg-muted text-center">
                        <RotateCcw className="h-5 w-5 text-primary mb-1" />
                        <span className="text-lg font-bold">
                          {exercise.standard_wiederholungen}
                        </span>
                        <span className="text-xs text-muted-foreground">Wiederh.</span>
                      </div>
                    )}
                    {exercise.standard_pause_sekunden && (
                      <div className="flex flex-col items-center p-3 rounded-lg bg-muted text-center">
                        <Clock className="h-5 w-5 text-primary mb-1" />
                        <span className="text-lg font-bold">
                          {exercise.standard_pause_sekunden}s
                        </span>
                        <span className="text-xs text-muted-foreground">Pause</span>
                      </div>
                    )}
                  </div>
                </div>
              </>
            )}
          </div>
        </ScrollArea>
      </SheetContent>
    </Sheet>
  )
}
