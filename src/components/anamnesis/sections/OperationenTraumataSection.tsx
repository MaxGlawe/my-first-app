"use client"

import { type UseFormReturn, useFieldArray } from "react-hook-form"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import { CollapsibleSection } from "@/components/clinical-ui"
import { Syringe, Plus, Trash2 } from "lucide-react"

const ART_OPTIONS = ["Operation", "Trauma / Unfall", "Fraktur", "Sonstiges"]

// eslint-disable-next-line @typescript-eslint/no-explicit-any
export function OperationenTraumataSection({ form }: { form: UseFormReturn<any> }) {
  const { register, control } = form
  const { fields, append, remove } = useFieldArray({
    control,
    name: "operationen_traumata",
  })

  return (
    <CollapsibleSection
      title="Operationen & Traumata"
      description="Relevante chirurgische Eingriffe und Verletzungen"
      icon={Syringe}
      accent="amber"
      badge={fields.length > 0 ? `${fields.length}` : undefined}
    >
      <div className="space-y-3">
        {fields.map((field, index) => (
          <div
            key={field.id}
            className="grid grid-cols-1 sm:grid-cols-[1fr_2fr_1fr_1fr_auto] gap-2 items-start bg-white/60 border border-slate-200/50 rounded-xl p-3"
          >
            <div className="space-y-1">
              <Label className="text-xs text-slate-500">Art</Label>
              <Select
                onValueChange={(v) => form.setValue(`operationen_traumata.${index}.art`, v)}
                value={form.watch(`operationen_traumata.${index}.art`) ?? ""}
              >
                <SelectTrigger><SelectValue placeholder="Art..." /></SelectTrigger>
                <SelectContent>
                  {ART_OPTIONS.map((a) => (
                    <SelectItem key={a} value={a}>{a}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-1">
              <Label className="text-xs text-slate-500">Beschreibung</Label>
              <Input
                placeholder="z.B. Kreuzband-OP rechtes Knie"
                {...register(`operationen_traumata.${index}.beschreibung`)}
              />
            </div>
            <div className="space-y-1">
              <Label className="text-xs text-slate-500">Zeitpunkt</Label>
              <Input
                placeholder="z.B. 03/2019"
                {...register(`operationen_traumata.${index}.datum`)}
              />
            </div>
            <div className="space-y-1">
              <Label className="text-xs text-slate-500">Region</Label>
              <Input
                placeholder="z.B. Knie re."
                {...register(`operationen_traumata.${index}.region`)}
              />
            </div>
            <Button
              type="button"
              variant="ghost"
              size="icon"
              onClick={() => remove(index)}
              className="mt-6"
            >
              <Trash2 className="h-4 w-4 text-red-500" />
            </Button>
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
              beschreibung: "",
              datum: "",
              region: "",
            })
          }
          className="border-slate-200/60"
        >
          <Plus className="mr-2 h-4 w-4" />
          Eintrag hinzufügen
        </Button>
      </div>
    </CollapsibleSection>
  )
}
