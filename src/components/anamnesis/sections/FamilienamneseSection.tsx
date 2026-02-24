"use client"

import { type UseFormReturn } from "react-hook-form"
import { Checkbox } from "@/components/ui/checkbox"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { CollapsibleSection } from "@/components/clinical-ui"
import { Users } from "lucide-react"

const FAMILIEN_ERKRANKUNGEN = [
  "Rheuma / Rheumatoide Arthritis",
  "Osteoporose",
  "Bandscheibenprobleme",
  "Arthrose",
  "Herz-Kreislauf-Erkrankungen",
  "Diabetes mellitus",
  "Krebserkrankung",
  "Autoimmunerkrankungen",
]

// eslint-disable-next-line @typescript-eslint/no-explicit-any
export function FamilienamneseSection({ form }: { form: UseFormReturn<any> }) {
  const { register, watch, setValue } = form
  const keine = watch("familienanamnese_keine") ?? false
  const selected: string[] = watch("familienanamnese_erkrankungen") ?? []

  const toggle = (item: string, checked: boolean) => {
    if (checked) {
      setValue("familienanamnese_erkrankungen", [...selected, item])
    } else {
      setValue("familienanamnese_erkrankungen", selected.filter((s: string) => s !== item))
    }
  }

  return (
    <CollapsibleSection
      title="Familienanamnese"
      description="Relevante Erkrankungen in der Familie"
      icon={Users}
      accent="blue"
    >
      <div className="space-y-4">
        <div className="flex items-center gap-2">
          <Checkbox
            id="fam-keine"
            checked={keine}
            onCheckedChange={(c) => {
              setValue("familienanamnese_keine", c === true)
              if (c === true) {
                setValue("familienanamnese_erkrankungen", [])
                setValue("familienanamnese_freitext", "")
              }
            }}
          />
          <Label htmlFor="fam-keine" className="cursor-pointer font-medium text-sm">
            Keine relevanten familiären Erkrankungen bekannt
          </Label>
        </div>

        {!keine && (
          <>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
              {FAMILIEN_ERKRANKUNGEN.map((item) => (
                <div key={item} className="flex items-center gap-2">
                  <Checkbox
                    id={`fam-${item}`}
                    checked={selected.includes(item)}
                    onCheckedChange={(c) => toggle(item, c === true)}
                  />
                  <Label htmlFor={`fam-${item}`} className="cursor-pointer text-sm font-normal">
                    {item}
                  </Label>
                </div>
              ))}
            </div>
            <div className="space-y-2">
              <Label htmlFor="fam-freitext" className="text-sm">Ergänzungen</Label>
              <Textarea
                id="fam-freitext"
                rows={2}
                placeholder="Weitere familiäre Vorbelastungen..."
                {...register("familienanamnese_freitext")}
              />
            </div>
          </>
        )}
      </div>
    </CollapsibleSection>
  )
}
