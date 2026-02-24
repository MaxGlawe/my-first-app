"use client"

import { type UseFormReturn } from "react-hook-form"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Checkbox } from "@/components/ui/checkbox"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import { CollapsibleSection } from "@/components/clinical-ui"
import { Briefcase } from "lucide-react"

const ARBEITSBELASTUNG_OPTIONS = [
  "Überwiegend sitzend",
  "Überwiegend stehend",
  "Schwere körperliche Arbeit",
  "Wechselnd / gemischt",
  "Nicht berufstätig",
  "Rentner/in",
]

const LEBENSSITUATION_OPTIONS = [
  "Alleinlebend",
  "Mit Partner/in",
  "Mit Familie",
  "Betreutes Wohnen",
  "Pflegeeinrichtung",
]

// eslint-disable-next-line @typescript-eslint/no-explicit-any
export function SozialamneseSection({ form }: { form: UseFormReturn<any> }) {
  const { register, watch, setValue } = form
  const arbeitsfaehig = watch("sozial_arbeitsfaehig")

  return (
    <CollapsibleSection
      title="Sozial- & Berufsanamnese"
      description="Berufliche Belastung und Lebenssituation"
      icon={Briefcase}
      accent="blue"
    >
      <div className="space-y-4">
        <div className="grid gap-4 sm:grid-cols-2">
          <div className="space-y-2">
            <Label htmlFor="sozial-beruf" className="text-sm">Beruf / Tätigkeit</Label>
            <Input
              id="sozial-beruf"
              placeholder="z.B. Bürokauffrau, Handwerker, Rentner..."
              {...register("sozial_beruf")}
            />
          </div>
          <div className="space-y-2">
            <Label className="text-sm">Arbeitsbelastung</Label>
            <Select
              onValueChange={(v) => setValue("sozial_arbeitsbelastung", v)}
              value={watch("sozial_arbeitsbelastung") ?? ""}
            >
              <SelectTrigger><SelectValue placeholder="Auswählen..." /></SelectTrigger>
              <SelectContent>
                {ARBEITSBELASTUNG_OPTIONS.map((o) => (
                  <SelectItem key={o} value={o}>{o}</SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        </div>

        <div className="flex items-start gap-4">
          <div className="flex items-center gap-2">
            <Checkbox
              id="sozial-au"
              checked={arbeitsfaehig === false}
              onCheckedChange={(c) => setValue("sozial_arbeitsfaehig", c === true ? false : null)}
            />
            <Label htmlFor="sozial-au" className="cursor-pointer text-sm">
              Derzeit arbeitsunfähig
            </Label>
          </div>
          {arbeitsfaehig === false && (
            <div className="space-y-1">
              <Input
                placeholder="Seit wann? z.B. 01.02.2026"
                {...register("sozial_au_seit")}
                className="w-48"
              />
            </div>
          )}
        </div>

        <div className="grid gap-4 sm:grid-cols-2">
          <div className="space-y-2">
            <Label className="text-sm">Lebenssituation</Label>
            <Select
              onValueChange={(v) => setValue("sozial_lebenssituation", v)}
              value={watch("sozial_lebenssituation") ?? ""}
            >
              <SelectTrigger><SelectValue placeholder="Auswählen..." /></SelectTrigger>
              <SelectContent>
                {LEBENSSITUATION_OPTIONS.map((o) => (
                  <SelectItem key={o} value={o}>{o}</SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
          <div className="space-y-2">
            <Label htmlFor="sozial-freizeit" className="text-sm">Freizeitaktivitäten / Sport</Label>
            <Input
              id="sozial-freizeit"
              placeholder="z.B. Joggen, Schwimmen, Gartenarbeit..."
              {...register("sozial_freizeitaktivitaeten")}
            />
          </div>
        </div>
      </div>
    </CollapsibleSection>
  )
}
