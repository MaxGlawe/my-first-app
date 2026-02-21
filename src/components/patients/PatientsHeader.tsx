"use client"

import { useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Switch } from "@/components/ui/switch"
import { Label } from "@/components/ui/label"
import { UserPlus, Search, Users } from "lucide-react"

interface PatientsHeaderProps {
  search: string
  onSearchChange: (value: string) => void
  showArchived: boolean
  onShowArchivedChange: (value: boolean) => void
}

export function PatientsHeader({
  search,
  onSearchChange,
  showArchived,
  onShowArchivedChange,
}: PatientsHeaderProps) {
  const router = useRouter()

  return (
    <div className="mb-6 flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
      <div className="flex items-center gap-3">
        <div className="w-10 h-10 rounded-xl bg-emerald-100 flex items-center justify-center shrink-0">
          <Users className="h-5 w-5 text-emerald-600" />
        </div>
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-slate-900">Patienten</h1>
          <p className="text-sm text-slate-500 mt-0.5">
            Stammdaten verwalten und durchsuchen
          </p>
        </div>
      </div>

      <div className="flex flex-col gap-3 sm:flex-row sm:items-center">
        {/* Search */}
        <div className="relative">
          <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
          <Input
            type="search"
            placeholder="Name oder Geburtsdatum..."
            value={search}
            onChange={(e) => onSearchChange(e.target.value)}
            className="pl-9 w-full sm:w-72"
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
          className="whitespace-nowrap"
        >
          <UserPlus className="mr-2 h-4 w-4" />
          Neuer Patient
        </Button>
      </div>
    </div>
  )
}
