"use client"

import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"
import { Search, Plus } from "lucide-react"
import type { PlanFilter } from "@/types/training-plan"

interface TrainingsplaeneHeaderProps {
  search: string
  onSearchChange: (value: string) => void
  filter: PlanFilter
  onFilterChange: (filter: PlanFilter) => void
  onNewPlan: () => void
}

const FILTER_LABELS: Record<PlanFilter, string> = {
  alle: "Alle",
  meine: "Meine",
  templates: "Templates",
}

export function TrainingsplaeneHeader({
  search,
  onSearchChange,
  filter,
  onFilterChange,
  onNewPlan,
}: TrainingsplaeneHeaderProps) {
  return (
    <div className="mb-8">
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Trainingspläne</h1>
          <p className="text-muted-foreground mt-1">
            Erstelle und verwalte individuelle Trainingspläne für deine Patienten.
          </p>
        </div>
        <Button onClick={onNewPlan} className="gap-2">
          <Plus className="h-4 w-4" />
          Neuer Plan
        </Button>
      </div>

      <div className="flex flex-col sm:flex-row gap-4">
        {/* Search */}
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input
            placeholder="Plan suchen..."
            value={search}
            onChange={(e) => onSearchChange(e.target.value)}
            className="pl-9"
          />
        </div>

        {/* Filter buttons */}
        <div className="flex gap-1 rounded-lg border p-1 bg-muted/40">
          {(Object.keys(FILTER_LABELS) as PlanFilter[]).map((f) => (
            <button
              key={f}
              onClick={() => onFilterChange(f)}
              className={`px-3 py-1.5 rounded-md text-sm font-medium transition-colors ${
                filter === f
                  ? "bg-background shadow-sm text-foreground"
                  : "text-muted-foreground hover:text-foreground"
              }`}
            >
              {FILTER_LABELS[f]}
            </button>
          ))}
        </div>
      </div>
    </div>
  )
}
