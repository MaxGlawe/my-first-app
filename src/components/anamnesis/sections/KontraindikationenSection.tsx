"use client"

import { type UseFormReturn } from "react-hook-form"
import { Checkbox } from "@/components/ui/checkbox"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { CollapsibleSection } from "@/components/clinical-ui"
import { ShieldAlert } from "lucide-react"

const KONTRAINDIKATIONEN_KATALOG = [
  "Antikoagulanzien (Blutverdünner)",
  "Metallimplantate / Endoprothese",
  "Schwangerschaft",
  "Akute Entzündung / Infektion",
  "Thrombose / Thrombosegefahr",
  "Offene Wunden im Behandlungsgebiet",
  "Herzschrittmacher / Defibrillator",
  "Akute Bandscheibenvorfälle",
  "Instabile Frakturen",
  "Tumorerkrankung im Behandlungsgebiet",
]

// eslint-disable-next-line @typescript-eslint/no-explicit-any
export function KontraindikationenSection({ form }: { form: UseFormReturn<any> }) {
  const { register, watch, setValue } = form
  const vorhanden = watch("kontra_vorhanden") ?? false
  const selected: string[] = watch("kontra_items") ?? []

  const toggle = (item: string, checked: boolean) => {
    if (checked) {
      setValue("kontra_items", [...selected, item])
    } else {
      setValue("kontra_items", selected.filter((s: string) => s !== item))
    }
  }

  return (
    <CollapsibleSection
      title="Kontraindikationen"
      description="Gegenanzeigen für bestimmte Therapiemaßnahmen"
      icon={ShieldAlert}
      accent="red"
      badge={vorhanden && selected.length > 0 ? `${selected.length}` : undefined}
    >
      <div className="space-y-4">
        <div className="flex items-center gap-2">
          <Checkbox
            id="kontra-vorhanden"
            checked={vorhanden}
            onCheckedChange={(c) => {
              setValue("kontra_vorhanden", c === true)
              if (!c) {
                setValue("kontra_items", [])
                setValue("kontra_freitext", "")
              }
            }}
          />
          <Label htmlFor="kontra-vorhanden" className="cursor-pointer font-medium text-sm">
            Kontraindikationen vorhanden
          </Label>
        </div>

        {vorhanden && (
          <>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
              {KONTRAINDIKATIONEN_KATALOG.map((item) => (
                <div key={item} className="flex items-center gap-2">
                  <Checkbox
                    id={`kontra-${item}`}
                    checked={selected.includes(item)}
                    onCheckedChange={(c) => toggle(item, c === true)}
                  />
                  <Label htmlFor={`kontra-${item}`} className="cursor-pointer text-sm font-normal">
                    {item}
                  </Label>
                </div>
              ))}
            </div>
            <div className="space-y-2">
              <Label className="text-sm">Ergänzende Hinweise</Label>
              <Textarea
                rows={2}
                placeholder="Weitere Kontraindikationen oder wichtige Hinweise..."
                {...register("kontra_freitext")}
              />
            </div>
          </>
        )}
      </div>
    </CollapsibleSection>
  )
}
