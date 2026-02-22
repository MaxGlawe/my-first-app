"use client"

import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"
import { Search, Plus, ClipboardList } from "lucide-react"
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
    <div className="mb-8 space-y-4">
      {/* Hero header */}
      <div className="rounded-2xl bg-gradient-to-br from-emerald-50/80 via-white to-teal-50/40 border border-emerald-100/60 p-6 shadow-sm">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-11 h-11 rounded-xl bg-emerald-100 flex items-center justify-center shrink-0">
              <ClipboardList className="h-5 w-5 text-emerald-600" />
            </div>
            <div>
              <h1 className="text-2xl font-bold tracking-tight text-slate-800">Trainingspläne</h1>
              <p className="text-sm text-slate-500 mt-0.5">
                Individuelle Trainingspläne erstellen und verwalten
              </p>
            </div>
          </div>
          <Button onClick={onNewPlan} className="gap-2 bg-gradient-to-r from-emerald-500 to-teal-500 hover:from-emerald-600 hover:to-teal-600 text-white border-0 shadow-sm">
            <Plus className="h-4 w-4" />
            Neuer Plan
          </Button>
        </div>
      </div>

      <div className="flex flex-col sm:flex-row gap-4">
        {/* Search */}
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
          <Input
            placeholder="Plan suchen..."
            value={search}
            onChange={(e) => onSearchChange(e.target.value)}
            className="pl-9 bg-white/80 border-slate-200/60"
          />
        </div>

        {/* Filter buttons */}
        <div className="flex gap-1 rounded-xl border border-slate-200/60 p-1 bg-slate-100/60">
          {(Object.keys(FILTER_LABELS) as PlanFilter[]).map((f) => (
            <button
              key={f}
              onClick={() => onFilterChange(f)}
              className={`px-3 py-1.5 rounded-lg text-sm font-medium transition-colors ${
                filter === f
                  ? "bg-white shadow-sm text-slate-800"
                  : "text-slate-500 hover:text-slate-700"
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
