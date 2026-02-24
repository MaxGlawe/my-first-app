"use client"

import { type UseFormReturn } from "react-hook-form"
import { Checkbox } from "@/components/ui/checkbox"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { CollapsibleSection } from "@/components/clinical-ui"
import { Flag } from "lucide-react"

const YELLOW_FLAGS = [
  "Katastrophisierung",
  "Angst-Vermeidungsverhalten (Fear-Avoidance)",
  "Überzeugung, dass Bewegung schadet",
  "Passive Einstellung zur Therapie",
  "Depressive Stimmungslage",
  "Sozialer Rückzug",
  "Sekundärer Krankheitsgewinn",
  "Längere Arbeitsunfähigkeit (> 4 Wochen)",
  "Übermäßiger Medikamentengebrauch",
  "Starke Fixierung auf Diagnose/Bildgebung",
]

// eslint-disable-next-line @typescript-eslint/no-explicit-any
export function YellowFlagsSection({ form }: { form: UseFormReturn<any> }) {
  const { register, watch, setValue } = form
  const screened = watch("yellow_flags_screened") ?? false
  const selected: string[] = watch("yellow_flags_items") ?? []

  const toggle = (item: string, checked: boolean) => {
    if (checked) {
      setValue("yellow_flags_items", [...selected, item])
    } else {
      setValue("yellow_flags_items", selected.filter((s: string) => s !== item))
    }
  }

  return (
    <CollapsibleSection
      title="Yellow Flags — Psychosoziales Screening"
      description="Risikofaktoren für Chronifizierung (nur Heilpraktiker)"
      icon={Flag}
      accent="amber"
      badge={selected.length > 0 ? `${selected.length}` : undefined}
    >
      <div className="space-y-4">
        <div className="flex items-center gap-2">
          <Checkbox
            id="yf-screened"
            checked={screened}
            onCheckedChange={(c) => setValue("yellow_flags_screened", c === true)}
          />
          <Label htmlFor="yf-screened" className="cursor-pointer font-medium text-sm">
            Psychosoziales Screening durchgeführt
          </Label>
        </div>

        {screened && (
          <>
            <div className="space-y-2">
              {YELLOW_FLAGS.map((flag) => (
                <div key={flag} className="flex items-center gap-2">
                  <Checkbox
                    id={`yf-${flag}`}
                    checked={selected.includes(flag)}
                    onCheckedChange={(c) => toggle(flag, c === true)}
                  />
                  <Label htmlFor={`yf-${flag}`} className="cursor-pointer text-sm font-normal">
                    {flag}
                  </Label>
                </div>
              ))}
            </div>
            <div className="space-y-2">
              <Label className="text-sm">Anmerkungen zum Screening</Label>
              <Textarea
                rows={2}
                placeholder="Klinische Einschätzung, Empfehlungen..."
                {...register("yellow_flags_notizen")}
              />
            </div>
          </>
        )}
      </div>
    </CollapsibleSection>
  )
}
