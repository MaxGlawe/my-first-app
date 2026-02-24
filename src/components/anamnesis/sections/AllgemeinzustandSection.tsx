"use client"

import { type UseFormReturn } from "react-hook-form"
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
import { Activity } from "lucide-react"
import { useMemo } from "react"

const AZ_OPTIONS = ["Gut", "Leicht reduziert", "Reduziert", "Stark reduziert"]

// eslint-disable-next-line @typescript-eslint/no-explicit-any
export function AllgemeinzustandSection({ form }: { form: UseFormReturn<any> }) {
  const { register, watch, setValue } = form
  const gewicht = watch("az_gewicht")
  const groesse = watch("az_groesse")

  const bmi = useMemo(() => {
    const w = parseFloat(gewicht)
    const h = parseFloat(groesse)
    if (!w || !h || h <= 0) return null
    const hMeters = h / 100
    return (w / (hMeters * hMeters)).toFixed(1)
  }, [gewicht, groesse])

  return (
    <CollapsibleSection
      title="Allgemeinzustand & Vitalzeichen"
      description="Klinische Basisuntersuchung (nur Heilpraktiker)"
      icon={Activity}
      accent="purple"
    >
      <div className="space-y-4">
        <div className="space-y-2">
          <Label className="text-sm">Allgemeineindruck</Label>
          <Select
            onValueChange={(v) => setValue("az_eindruck", v)}
            value={watch("az_eindruck") ?? ""}
          >
            <SelectTrigger><SelectValue placeholder="AZ-Eindruck..." /></SelectTrigger>
            <SelectContent>
              {AZ_OPTIONS.map((o) => (
                <SelectItem key={o} value={o}>{o}</SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        <div className="grid gap-3 grid-cols-2 sm:grid-cols-4">
          <div className="space-y-1">
            <Label className="text-xs text-slate-500">Blutdruck (mmHg)</Label>
            <Input placeholder="120/80" {...register("az_blutdruck")} />
          </div>
          <div className="space-y-1">
            <Label className="text-xs text-slate-500">Puls (bpm)</Label>
            <Input placeholder="72" {...register("az_puls")} />
          </div>
          <div className="space-y-1">
            <Label className="text-xs text-slate-500">Temperatur (°C)</Label>
            <Input placeholder="36.8" {...register("az_temperatur")} />
          </div>
          <div />
        </div>

        <div className="grid gap-3 grid-cols-2 sm:grid-cols-4">
          <div className="space-y-1">
            <Label className="text-xs text-slate-500">Gewicht (kg)</Label>
            <Input placeholder="78" {...register("az_gewicht")} />
          </div>
          <div className="space-y-1">
            <Label className="text-xs text-slate-500">Größe (cm)</Label>
            <Input placeholder="175" {...register("az_groesse")} />
          </div>
          <div className="space-y-1">
            <Label className="text-xs text-slate-500">BMI (berechnet)</Label>
            <div className="h-9 flex items-center px-3 rounded-md border border-slate-200/60 bg-slate-50/80 text-sm text-slate-600">
              {bmi ?? "–"}
            </div>
          </div>
          <div />
        </div>

        <div className="space-y-2">
          <Label className="text-sm">Sonstige Befunde</Label>
          <Textarea
            rows={2}
            placeholder="Weitere klinische Auffälligkeiten..."
            {...register("az_sonstiges")}
          />
        </div>
      </div>
    </CollapsibleSection>
  )
}
