"use client"

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { MoreHorizontal, Dumbbell, Layers, Copy, Trash2, ExternalLink } from "lucide-react"
import type { TrainingPlanListItem } from "@/types/training-plan"
import Link from "next/link"

interface TrainingsplanKarteProps {
  plan: TrainingPlanListItem
  onDuplicate: (plan: TrainingPlanListItem) => void
  onDelete: (plan: TrainingPlanListItem) => void
}

export function TrainingsplanKarte({ plan, onDuplicate, onDelete }: TrainingsplanKarteProps) {
  const formatDate = (dateStr: string) => {
    return new Date(dateStr).toLocaleDateString("de-DE", {
      day: "2-digit",
      month: "2-digit",
      year: "numeric",
    })
  }

  return (
    <Card className="group hover:shadow-md transition-shadow flex flex-col">
      <CardHeader className="pb-3">
        <div className="flex items-start justify-between gap-2">
          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-2 mb-1 flex-wrap">
              <CardTitle className="text-base truncate">{plan.name}</CardTitle>
              {plan.is_template && (
                <Badge variant="secondary" className="text-xs shrink-0">
                  Template
                </Badge>
              )}
            </div>
            {plan.beschreibung && (
              <p className="text-sm text-muted-foreground line-clamp-2">{plan.beschreibung}</p>
            )}
          </div>

          {/* Actions */}
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button
                variant="ghost"
                size="icon"
                className="h-8 w-8 shrink-0 opacity-0 group-hover:opacity-100 transition-opacity"
                aria-label="Plan-Aktionen"
              >
                <MoreHorizontal className="h-4 w-4" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end">
              <DropdownMenuItem asChild>
                <Link href={`/os/training-plans/${plan.id}`} className="flex items-center gap-2">
                  <ExternalLink className="h-4 w-4" />
                  Öffnen
                </Link>
              </DropdownMenuItem>
              <DropdownMenuItem onClick={() => onDuplicate(plan)} className="gap-2">
                <Copy className="h-4 w-4" />
                Duplizieren
              </DropdownMenuItem>
              <DropdownMenuSeparator />
              <DropdownMenuItem
                onClick={() => onDelete(plan)}
                className="gap-2 text-destructive focus:text-destructive"
              >
                <Trash2 className="h-4 w-4" />
                Löschen
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      </CardHeader>

      <CardContent className="pt-0 flex-1 flex flex-col">
        {/* Stats */}
        <div className="flex gap-4 text-sm text-muted-foreground mb-4">
          <span className="flex items-center gap-1.5">
            <Dumbbell className="h-3.5 w-3.5" />
            {plan.uebungen_anzahl} Übung{plan.uebungen_anzahl !== 1 ? "en" : ""}
          </span>
          <span className="flex items-center gap-1.5">
            <Layers className="h-3.5 w-3.5" />
            {plan.phasen_anzahl} Phase{plan.phasen_anzahl !== 1 ? "n" : ""}
          </span>
        </div>

        <div className="mt-auto">
          <p className="text-xs text-muted-foreground mb-3">
            Geändert: {formatDate(plan.updated_at)}
          </p>
          <Link href={`/os/training-plans/${plan.id}`}>
            <Button variant="outline" size="sm" className="w-full">
              Plan öffnen
            </Button>
          </Link>
        </div>
      </CardContent>
    </Card>
  )
}
