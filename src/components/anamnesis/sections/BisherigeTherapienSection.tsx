"use client"

import { type UseFormReturn, useFieldArray } from "react-hook-form"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import { CollapsibleSection } from "@/components/clinical-ui"
import { History, Plus, Trash2 } from "lucide-react"

const THERAPIE_ARTEN = [
  "Physiotherapie",
  "Osteopathie",
  "Chirotherapie / Manuelle Medizin",
  "Akupunktur",
  "Medikamentöse Therapie",
  "Injektionstherapie",
  "Operation",
  "Psychotherapie",
  "Ergotherapie",
  "Sonstiges",
]

const ERGEBNIS_OPTIONS = [
  { value: "verbessert", label: "Verbessert" },
  { value: "unveraendert", label: "Unverändert" },
  { value: "verschlechtert", label: "Verschlechtert" },
]

// eslint-disable-next-line @typescript-eslint/no-explicit-any
export function BisherigeTherapienSection({ form }: { form: UseFormReturn<any> }) {
  const { register, control, watch, setValue } = form
  const { fields, append, remove } = useFieldArray({
    control,
    name: "bisherige_therapien",
  })

  return (
    <CollapsibleSection
      title="Bisherige Therapien"
      description="Vorangegangene Behandlungen und deren Ergebnis"
      icon={History}
      accent="emerald"
      badge={fields.length > 0 ? `${fields.length}` : undefined}
    >
      <div className="space-y-3">
        {fields.map((field, index) => (
          <div
            key={field.id}
            className="bg-white/60 border border-slate-200/50 rounded-xl p-3 space-y-2"
          >
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-2">
              <div className="space-y-1">
                <Label className="text-xs text-slate-500">Art der Therapie</Label>
                <Select
                  onValueChange={(v) => setValue(`bisherige_therapien.${index}.art`, v)}
                  value={watch(`bisherige_therapien.${index}.art`) ?? ""}
                >
                  <SelectTrigger><SelectValue placeholder="Therapieart..." /></SelectTrigger>
                  <SelectContent>
                    {THERAPIE_ARTEN.map((a) => (
                      <SelectItem key={a} value={a}>{a}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-1">
                <Label className="text-xs text-slate-500">Zeitraum</Label>
                <Input
                  placeholder="z.B. 2023-2024"
                  {...register(`bisherige_therapien.${index}.zeitraum`)}
                />
              </div>
              <div className="flex items-end gap-2">
                <div className="flex-1 space-y-1">
                  <Label className="text-xs text-slate-500">Ergebnis</Label>
                  <Select
                    onValueChange={(v) => setValue(`bisherige_therapien.${index}.ergebnis`, v)}
                    value={watch(`bisherige_therapien.${index}.ergebnis`) ?? ""}
                  >
                    <SelectTrigger><SelectValue placeholder="Ergebnis..." /></SelectTrigger>
                    <SelectContent>
                      {ERGEBNIS_OPTIONS.map((o) => (
                        <SelectItem key={o.value} value={o.value}>{o.label}</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                <Button
                  type="button"
                  variant="ghost"
                  size="icon"
                  onClick={() => remove(index)}
                >
                  <Trash2 className="h-4 w-4 text-red-500" />
                </Button>
              </div>
            </div>
            <div className="space-y-1">
              <Label className="text-xs text-slate-500">Details / Anmerkungen</Label>
              <Textarea
                rows={1}
                placeholder="Weitere Details zur Behandlung..."
                {...register(`bisherige_therapien.${index}.details`)}
              />
            </div>
          </div>
        ))}

        <Button
          type="button"
          variant="outline"
          size="sm"
          onClick={() =>
            append({
              id: Math.random().toString(36).slice(2, 10),
              art: "",
              zeitraum: "",
              ergebnis: "",
              details: "",
            })
          }
          className="border-slate-200/60"
        >
          <Plus className="mr-2 h-4 w-4" />
          Therapie hinzufügen
        </Button>
      </div>
    </CollapsibleSection>
  )
}
