"use client"

import { useState, useEffect } from "react"
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"
import { Skeleton } from "@/components/ui/skeleton"
import { Search, UserPlus } from "lucide-react"

interface Patient {
  id: string
  first_name: string
  last_name: string
  email: string | null
}

interface EnrollPatientDialogProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  onEnroll: (patientId: string) => void
  isEnrolling: boolean
}

export function EnrollPatientDialog({
  open,
  onOpenChange,
  onEnroll,
  isEnrolling,
}: EnrollPatientDialogProps) {
  const [search, setSearch] = useState("")
  const [patients, setPatients] = useState<Patient[]>([])
  const [isLoading, setIsLoading] = useState(false)

  useEffect(() => {
    if (!open) return

    let cancelled = false
    setIsLoading(true)

    const params = new URLSearchParams({ pageSize: "50" })
    if (search.trim()) params.set("search", search.trim())

    fetch(`/api/patients?${params.toString()}`)
      .then((res) => res.json())
      .then((json) => {
        if (!cancelled) setPatients(json.patients ?? [])
      })
      .catch(() => {
        if (!cancelled) setPatients([])
      })
      .finally(() => {
        if (!cancelled) setIsLoading(false)
      })

    return () => { cancelled = true }
  }, [open, search])

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-lg max-h-[80vh] flex flex-col">
        <DialogHeader>
          <DialogTitle>Patient einschreiben</DialogTitle>
        </DialogHeader>

        <div className="relative">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input
            placeholder="Patient suchen..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="pl-10"
          />
        </div>

        <div className="flex-1 overflow-y-auto space-y-1 min-h-0">
          {isLoading && (
            <div className="space-y-2 p-2">
              {Array.from({ length: 5 }).map((_, i) => (
                <Skeleton key={i} className="h-12 w-full" />
              ))}
            </div>
          )}

          {!isLoading && patients.length === 0 && (
            <p className="text-sm text-muted-foreground text-center py-8">
              Keine Patienten gefunden.
            </p>
          )}

          {!isLoading &&
            patients.map((patient) => (
              <div
                key={patient.id}
                className="flex items-center justify-between p-3 rounded-lg hover:bg-muted transition-colors"
              >
                <div>
                  <p className="text-sm font-medium">
                    {patient.first_name} {patient.last_name}
                  </p>
                  {patient.email && (
                    <p className="text-xs text-muted-foreground">{patient.email}</p>
                  )}
                </div>
                <Button
                  size="sm"
                  variant="outline"
                  onClick={() => onEnroll(patient.id)}
                  disabled={isEnrolling}
                >
                  <UserPlus className="mr-2 h-3.5 w-3.5" />
                  Einschreiben
                </Button>
              </div>
            ))}
        </div>
      </DialogContent>
    </Dialog>
  )
}
