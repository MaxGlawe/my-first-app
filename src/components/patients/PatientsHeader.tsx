"use client"

import { useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Switch } from "@/components/ui/switch"
import { Label } from "@/components/ui/label"
import { UserPlus, Search, Users, Building2 } from "lucide-react"

interface PatientsHeaderProps {
  search: string
  onSearchChange: (value: string) => void
  showArchived: boolean
  onShowArchivedChange: (value: boolean) => void
  scope: "mine" | "all"
  onScopeChange: (scope: "mine" | "all") => void
}

export function PatientsHeader({
  search,
  onSearchChange,
  showArchived,
  onShowArchivedChange,
  scope,
  onScopeChange,
}: PatientsHeaderProps) {
  const router = useRouter()

  return (
    <div className="mb-6 rounded-2xl bg-gradient-to-br from-emerald-50/80 via-white to-teal-50/40 border border-emerald-100/60 p-6 shadow-sm">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div className="flex items-center gap-3">
          <div className="w-11 h-11 rounded-xl bg-emerald-100 flex items-center justify-center shrink-0">
            <Users className="h-5 w-5 text-emerald-600" />
          </div>
          <div>
            <h1 className="text-2xl font-bold tracking-tight text-slate-800">Patienten</h1>
            <p className="text-sm text-slate-500 mt-0.5">
              Stammdaten verwalten und durchsuchen
            </p>
          </div>
        </div>

        <div className="flex flex-col gap-3 sm:flex-row sm:items-center">
          {/* Scope toggle: Meine / Alle */}
          <div className="inline-flex rounded-lg border border-slate-200/80 bg-white/60 p-0.5">
            <button
              onClick={() => onScopeChange("mine")}
              className={`flex items-center gap-1.5 rounded-md px-3 py-1.5 text-sm font-medium transition-colors ${
                scope === "mine"
                  ? "bg-emerald-500 text-white shadow-sm"
                  : "text-slate-600 hover:text-slate-800 hover:bg-slate-50"
              }`}
            >
              <Users className="h-3.5 w-3.5" />
              Meine
            </button>
            <button
              onClick={() => onScopeChange("all")}
              className={`flex items-center gap-1.5 rounded-md px-3 py-1.5 text-sm font-medium transition-colors ${
                scope === "all"
                  ? "bg-emerald-500 text-white shadow-sm"
                  : "text-slate-600 hover:text-slate-800 hover:bg-slate-50"
              }`}
            >
              <Building2 className="h-3.5 w-3.5" />
              Alle
            </button>
          </div>

          {/* Search */}
          <div className="relative">
            <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
            <Input
              type="search"
              placeholder="Name oder Geburtsdatum..."
              value={search}
              onChange={(e) => onSearchChange(e.target.value)}
              className="pl-9 w-full sm:w-72 bg-white/80 border-slate-200/60"
              aria-label="Patienten suchen"
            />
          </div>

          {/* Archived filter */}
          <div className="flex items-center gap-2">
            <Switch
              id="show-archived"
              checked={showArchived}
              onCheckedChange={onShowArchivedChange}
            />
            <Label htmlFor="show-archived" className="cursor-pointer text-sm whitespace-nowrap">
              Archivierte anzeigen
            </Label>
          </div>

          {/* New patient button */}
          <Button
            onClick={() => router.push("/os/patients/new")}
            className="whitespace-nowrap bg-gradient-to-r from-emerald-500 to-teal-500 hover:from-emerald-600 hover:to-teal-600 text-white border-0 shadow-sm"
          >
            <UserPlus className="mr-2 h-4 w-4" />
            Neuer Patient
          </Button>
        </div>
      </div>
    </div>
  )
}
