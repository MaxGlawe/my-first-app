"use client"

import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"
import { Search, Plus, GraduationCap } from "lucide-react"
import type { CourseFilter, CourseKategorie } from "@/types/course"
import { KATEGORIE_LABELS } from "@/types/course"

const FILTER_LABELS: Record<CourseFilter, string> = {
  alle: "Alle",
  entwurf: "Entwurf",
  aktiv: "Aktiv",
  archiviert: "Archiviert",
}

const KATEGORIE_OPTIONS: { value: CourseKategorie | ""; label: string }[] = [
  { value: "", label: "Alle Kategorien" },
  ...Object.entries(KATEGORIE_LABELS).map(([value, label]) => ({
    value: value as CourseKategorie,
    label,
  })),
]

interface KurseHeaderProps {
  search: string
  onSearchChange: (value: string) => void
  filter: CourseFilter
  onFilterChange: (filter: CourseFilter) => void
  kategorie: CourseKategorie | ""
  onKategorieChange: (kategorie: CourseKategorie | "") => void
  onNewCourse: () => void
}

export function KurseHeader({
  search,
  onSearchChange,
  filter,
  onFilterChange,
  kategorie,
  onKategorieChange,
  onNewCourse,
}: KurseHeaderProps) {
  return (
    <div className="mb-8 space-y-4">
      {/* Title row */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-emerald-100 flex items-center justify-center shrink-0">
            <GraduationCap className="h-5 w-5 text-emerald-600" />
          </div>
          <div>
            <h1 className="text-2xl font-bold tracking-tight text-slate-900">Kurse</h1>
            <p className="text-sm text-slate-500 mt-0.5">
              Online-Kurse erstellen und verwalten
            </p>
          </div>
        </div>
        <Button onClick={onNewCourse} className="shrink-0">
          <Plus className="mr-2 h-4 w-4" />
          Neuer Kurs
        </Button>
      </div>

      {/* Search & Filters */}
      <div className="flex flex-col sm:flex-row gap-3">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
          <Input
            placeholder="Kurs suchen..."
            value={search}
            onChange={(e) => onSearchChange(e.target.value)}
            className="pl-10"
          />
        </div>

        {/* Kategorie select */}
        <select
          value={kategorie}
          onChange={(e) => onKategorieChange(e.target.value as CourseKategorie | "")}
          className="h-10 rounded-md border border-slate-200/60 bg-white/80 px-3 text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500/20 focus:ring-offset-2"
        >
          {KATEGORIE_OPTIONS.map((opt) => (
            <option key={opt.value} value={opt.value}>
              {opt.label}
            </option>
          ))}
        </select>

        {/* Status filter pills */}
        <div className="flex items-center rounded-xl border border-slate-200/60 bg-slate-100/60 p-1">
          {(Object.entries(FILTER_LABELS) as [CourseFilter, string][]).map(
            ([value, label]) => (
              <button
                key={value}
                onClick={() => onFilterChange(value)}
                className={`rounded-lg px-3 py-1.5 text-sm font-medium transition-colors ${
                  filter === value
                    ? "bg-white text-slate-800 shadow-sm"
                    : "text-slate-500 hover:text-slate-700"
                }`}
              >
                {label}
              </button>
            )
          )}
        </div>
      </div>
    </div>
  )
}
