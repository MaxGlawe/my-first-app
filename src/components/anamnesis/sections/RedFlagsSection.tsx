"use client"

import { type UseFormReturn } from "react-hook-form"
import { Checkbox } from "@/components/ui/checkbox"
import { Label } from "@/components/ui/label"
import { Input } from "@/components/ui/input"
import { ClinicalSection, ClinicalCard } from "@/components/clinical-ui"
import { AlertTriangle } from "lucide-react"

const RED_FLAGS = [
  { id: "cauda_equina", label: "Cauda-equina-Syndrom (Blasen-/Mastdarmstörung)" },
  { id: "gewichtsverlust", label: "Unerklärter Gewichtsverlust" },
  { id: "nachtschmerz", label: "Nachtschmerz / Ruheschmerz" },
  { id: "fieber", label: "Fieber / Nachtschweiß" },
  { id: "trauma", label: "Signifikantes Trauma / Sturzanamnese" },
  { id: "tumor", label: "Tumoranamnese" },
  { id: "osteoporose", label: "Osteoporose-Risikofaktoren" },
  { id: "steroide", label: "Langzeit-Steroidtherapie" },
  { id: "neuro_defizit", label: "Progressive neurologische Defizite" },
  { id: "thorax", label: "Thoraxschmerz / Atemnot" },
]

// eslint-disable-next-line @typescript-eslint/no-explicit-any
export function RedFlagsSection({ form }: { form: UseFormReturn<any> }) {
  const { register, watch, setValue } = form
  const screened = watch("red_flags_screened") ?? false
  const flagStates: Record<string, boolean> = watch("red_flags_states") ?? {}
  const flagNotes: Record<string, string> = watch("red_flags_notes") ?? {}

  const toggleFlag = (id: string, checked: boolean) => {
    setValue("red_flags_states", { ...flagStates, [id]: checked })
  }

  const setNote = (id: string, note: string) => {
    setValue("red_flags_notes", { ...flagNotes, [id]: note })
  }

  const positiveCount = Object.values(flagStates).filter(Boolean).length

  return (
    <ClinicalSection
      title="Red Flags — Warnzeichen"
      description="Screening auf abwendbar gefährliche Verläufe (nur Heilpraktiker)"
      icon={AlertTriangle}
      accent="red"
    >
      <div className="space-y-4">
        <div className="flex items-center gap-2">
          <Checkbox
            id="red-flags-screened"
            checked={screened}
            onCheckedChange={(c) => setValue("red_flags_screened", c === true)}
          />
          <Label htmlFor="red-flags-screened" className="cursor-pointer font-medium text-sm">
            Red-Flag-Screening durchgeführt
          </Label>
          {positiveCount > 0 && (
            <span className="text-xs font-medium text-red-600 bg-red-50 px-2 py-0.5 rounded-full">
              {positiveCount} positiv
            </span>
          )}
        </div>

        {screened && (
          <div className="space-y-2">
            {RED_FLAGS.map((flag) => {
              const isPositive = flagStates[flag.id] ?? false
              return (
                <ClinicalCard
                  key={flag.id}
                  warning={isPositive}
                  className="space-y-2"
                >
                  <div className="flex items-center gap-2">
                    <Checkbox
                      id={`rf-${flag.id}`}
                      checked={isPositive}
                      onCheckedChange={(c) => toggleFlag(flag.id, c === true)}
                    />
                    <Label
                      htmlFor={`rf-${flag.id}`}
                      className={`cursor-pointer text-sm ${
                        isPositive ? "font-semibold text-red-700" : "font-normal"
                      }`}
                    >
                      {flag.label}
                    </Label>
                  </div>
                  {isPositive && (
                    <Input
                      placeholder="Notiz / Details..."
                      value={flagNotes[flag.id] ?? ""}
                      onChange={(e) => setNote(flag.id, e.target.value)}
                      className="text-sm"
                    />
                  )}
                </ClinicalCard>
              )
            })}
          </div>
        )}
      </div>
    </ClinicalSection>
  )
}
