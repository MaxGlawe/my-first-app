"use client"

import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Badge } from "@/components/ui/badge"
import { CollapsibleSection, ClinicalCard } from "@/components/clinical-ui"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import { ListChecks } from "lucide-react"
import type { MassnahmeDetail, MassnahmeIntensitaet } from "@/types/behandlung"
import { MASSNAHMEN_KATALOG, INTENSITAET_OPTIONS } from "@/types/behandlung"

interface MassnahmenDetailSectionProps {
  /** Currently selected measures (from the main measures checkbox) */
  selectedMeasures: string[]
  /** Detail data for each measure */
  details: MassnahmeDetail[]
  onChange: (details: MassnahmeDetail[]) => void
  disabled?: boolean
}

const INTENSITAET_COLORS: Record<MassnahmeIntensitaet, string> = {
  leicht: "bg-green-50 text-green-700 border-green-200",
  mittel: "bg-amber-50 text-amber-700 border-amber-200",
  intensiv: "bg-red-50 text-red-700 border-red-200",
}

export function MassnahmenDetailSection({
  selectedMeasures,
  details,
  onChange,
  disabled,
}: MassnahmenDetailSectionProps) {
  if (selectedMeasures.length === 0) return null

  const getDetail = (id: string): MassnahmeDetail => {
    return details.find((d) => d.massnahme_id === id) ?? { massnahme_id: id }
  }

  const updateDetail = (id: string, updates: Partial<MassnahmeDetail>) => {
    const existing = details.find((d) => d.massnahme_id === id)
    if (existing) {
      onChange(
        details.map((d) =>
          d.massnahme_id === id ? { ...d, ...updates } : d
        )
      )
    } else {
      onChange([...details, { massnahme_id: id, ...updates }])
    }
  }

  const filledCount = details.filter(
    (d) => d.dauer_minuten || d.region || d.intensitaet || d.notiz
  ).length

  return (
    <CollapsibleSection
      title="Maßnahmen-Details"
      description="Dauer, Region & Intensität pro Maßnahme"
      icon={ListChecks}
      accent="teal"
      badge={filledCount > 0 ? `${filledCount}/${selectedMeasures.length}` : undefined}
    >
      <div className="space-y-3">
        {selectedMeasures.map((measureId) => {
          const catalogEntry = MASSNAHMEN_KATALOG.find((m) => m.id === measureId)
          const label = catalogEntry?.label ?? measureId
          const detail = getDetail(measureId)

          return (
            <ClinicalCard key={measureId}>
              <div className="space-y-3">
                <div className="flex items-center gap-2">
                  <span className="font-medium text-sm">{label}</span>
                  {detail.intensitaet && (
                    <Badge
                      variant="outline"
                      className={`text-xs ${INTENSITAET_COLORS[detail.intensitaet]}`}
                    >
                      {INTENSITAET_OPTIONS.find((o) => o.value === detail.intensitaet)?.label}
                    </Badge>
                  )}
                </div>

                <div className="grid gap-3 grid-cols-2 sm:grid-cols-4">
                  <div className="space-y-1">
                    <Label className="text-xs text-slate-500">Dauer (Min)</Label>
                    <Input
                      type="number"
                      min={1}
                      max={120}
                      placeholder="z.B. 15"
                      value={detail.dauer_minuten ?? ""}
                      onChange={(e) =>
                        updateDetail(measureId, {
                          dauer_minuten: e.target.value ? parseInt(e.target.value, 10) : undefined,
                        })
                      }
                      disabled={disabled}
                      className="h-8 text-sm"
                    />
                  </div>

                  <div className="space-y-1">
                    <Label className="text-xs text-slate-500">Region</Label>
                    <Input
                      placeholder="z.B. LWS, Knie re."
                      value={detail.region ?? ""}
                      onChange={(e) => updateDetail(measureId, { region: e.target.value })}
                      disabled={disabled}
                      className="h-8 text-sm"
                    />
                  </div>

                  <div className="space-y-1">
                    <Label className="text-xs text-slate-500">Intensität</Label>
                    <Select
                      value={detail.intensitaet ?? ""}
                      onValueChange={(v) =>
                        updateDetail(measureId, {
                          intensitaet: v as MassnahmeIntensitaet,
                        })
                      }
                      disabled={disabled}
                    >
                      <SelectTrigger className="h-8 text-sm">
                        <SelectValue placeholder="—" />
                      </SelectTrigger>
                      <SelectContent>
                        {INTENSITAET_OPTIONS.map((opt) => (
                          <SelectItem key={opt.value} value={opt.value}>
                            {opt.label}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>

                  <div className="space-y-1">
                    <Label className="text-xs text-slate-500">Notiz</Label>
                    <Input
                      placeholder="Bemerkung..."
                      value={detail.notiz ?? ""}
                      onChange={(e) => updateDetail(measureId, { notiz: e.target.value })}
                      disabled={disabled}
                      className="h-8 text-sm"
                    />
                  </div>
                </div>
              </div>
            </ClinicalCard>
          )
        })}
      </div>
    </CollapsibleSection>
  )
}
