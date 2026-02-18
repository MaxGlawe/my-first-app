"use client"

import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Badge } from "@/components/ui/badge"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover"
import { Checkbox } from "@/components/ui/checkbox"
import { Label } from "@/components/ui/label"
import { Search, Plus, Filter, X } from "lucide-react"
import { MUSKELGRUPPEN, SCHWIERIGKEITSGRAD_LABELS } from "@/types/exercise"
import type { ExerciseFilter, Schwierigkeitsgrad, ExerciseQuelle } from "@/types/exercise"

interface UebungenHeaderProps {
  filter: ExerciseFilter
  onFilterChange: (filter: ExerciseFilter) => void
  onNewExercise: () => void
}

export function UebungenHeader({
  filter,
  onFilterChange,
  onNewExercise,
}: UebungenHeaderProps) {
  const activeFilterCount =
    (filter.schwierigkeitsgrad ? 1 : 0) +
    filter.muskelgruppen.length +
    (filter.quelle !== "alle" ? 1 : 0)

  function setSearch(search: string) {
    onFilterChange({ ...filter, search })
  }

  function setSchwierigkeitsgrad(value: string) {
    onFilterChange({
      ...filter,
      schwierigkeitsgrad: value as Schwierigkeitsgrad | "",
    })
  }

  function setQuelle(value: string) {
    onFilterChange({ ...filter, quelle: value as ExerciseQuelle })
  }

  function toggleMuskelgruppe(gruppe: string) {
    const existing = filter.muskelgruppen
    const updated = existing.includes(gruppe)
      ? existing.filter((g) => g !== gruppe)
      : [...existing, gruppe]
    onFilterChange({ ...filter, muskelgruppen: updated })
  }

  function clearFilters() {
    onFilterChange({
      search: filter.search,
      muskelgruppen: [],
      schwierigkeitsgrad: "",
      quelle: "alle",
    })
  }

  return (
    <div className="mb-6 space-y-4">
      {/* Title row */}
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Übungsdatenbank</h1>
          <p className="text-muted-foreground mt-1">
            Übungen verwalten, filtern und zur Bibliothek hinzufügen
          </p>
        </div>
        <Button onClick={onNewExercise} className="whitespace-nowrap self-start sm:self-auto">
          <Plus className="mr-2 h-4 w-4" />
          Neue Übung
        </Button>
      </div>

      {/* Filter row */}
      <div className="flex flex-wrap gap-3 items-center">
        {/* Text search */}
        <div className="relative flex-1 min-w-56">
          <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
          <Input
            type="search"
            placeholder="Übung suchen..."
            value={filter.search}
            onChange={(e) => setSearch(e.target.value)}
            className="pl-9"
            aria-label="Übung suchen"
          />
        </div>

        {/* Quelle filter */}
        <Select value={filter.quelle} onValueChange={setQuelle}>
          <SelectTrigger className="w-44" aria-label="Quelle wählen">
            <SelectValue placeholder="Quelle" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="alle">Alle Übungen</SelectItem>
            <SelectItem value="praxis">Praxis-Bibliothek</SelectItem>
            <SelectItem value="eigene">Meine Übungen</SelectItem>
            <SelectItem value="favoriten">Favoriten</SelectItem>
          </SelectContent>
        </Select>

        {/* Schwierigkeitsgrad filter */}
        <Select value={filter.schwierigkeitsgrad || "alle"} onValueChange={(v) => setSchwierigkeitsgrad(v === "alle" ? "" : v)}>
          <SelectTrigger className="w-44" aria-label="Schwierigkeitsgrad wählen">
            <SelectValue placeholder="Schwierigkeit" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="alle">Alle Schwierigkeiten</SelectItem>
            {(Object.entries(SCHWIERIGKEITSGRAD_LABELS) as [Schwierigkeitsgrad, string][]).map(
              ([value, label]) => (
                <SelectItem key={value} value={value}>
                  {label}
                </SelectItem>
              )
            )}
          </SelectContent>
        </Select>

        {/* Muskelgruppe multi-select popover */}
        <Popover>
          <PopoverTrigger asChild>
            <Button variant="outline" className="gap-2">
              <Filter className="h-4 w-4" />
              Muskelgruppe
              {filter.muskelgruppen.length > 0 && (
                <Badge variant="secondary" className="ml-1 h-5 px-1.5 text-xs">
                  {filter.muskelgruppen.length}
                </Badge>
              )}
            </Button>
          </PopoverTrigger>
          <PopoverContent className="w-64 p-3" align="start">
            <p className="text-sm font-medium mb-3">Muskelgruppen</p>
            <div className="grid grid-cols-2 gap-2 max-h-64 overflow-y-auto">
              {MUSKELGRUPPEN.map((gruppe) => (
                <div key={gruppe} className="flex items-center gap-2">
                  <Checkbox
                    id={`mg-${gruppe}`}
                    checked={filter.muskelgruppen.includes(gruppe)}
                    onCheckedChange={() => toggleMuskelgruppe(gruppe)}
                  />
                  <Label
                    htmlFor={`mg-${gruppe}`}
                    className="text-sm cursor-pointer"
                  >
                    {gruppe}
                  </Label>
                </div>
              ))}
            </div>
            {filter.muskelgruppen.length > 0 && (
              <Button
                variant="ghost"
                size="sm"
                className="mt-3 w-full text-xs"
                onClick={() => onFilterChange({ ...filter, muskelgruppen: [] })}
              >
                Auswahl aufheben
              </Button>
            )}
          </PopoverContent>
        </Popover>

        {/* Clear filters */}
        {activeFilterCount > 0 && (
          <Button
            variant="ghost"
            size="sm"
            onClick={clearFilters}
            className="gap-1 text-muted-foreground"
            aria-label="Alle Filter zurücksetzen"
          >
            <X className="h-4 w-4" />
            Filter zurücksetzen ({activeFilterCount})
          </Button>
        )}
      </div>

      {/* Active muskelgruppen badges */}
      {filter.muskelgruppen.length > 0 && (
        <div className="flex flex-wrap gap-2">
          {filter.muskelgruppen.map((gruppe) => (
            <Badge
              key={gruppe}
              variant="secondary"
              className="cursor-pointer gap-1"
              onClick={() => toggleMuskelgruppe(gruppe)}
            >
              {gruppe}
              <X className="h-3 w-3" />
            </Badge>
          ))}
        </div>
      )}
    </div>
  )
}
