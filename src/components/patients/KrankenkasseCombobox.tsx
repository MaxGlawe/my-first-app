"use client"

import * as React from "react"
import { Check, ChevronsUpDown } from "lucide-react"
import { cn } from "@/lib/utils"
import { Button } from "@/components/ui/button"
import {
  Command,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
  CommandList,
} from "@/components/ui/command"
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover"

// Liste der wichtigsten gesetzlichen Krankenkassen in Deutschland
const GKV_LIST = [
  "AOK Bayern",
  "AOK Baden-Württemberg",
  "AOK Bremen/Bremerhaven",
  "AOK Hessen",
  "AOK Niedersachsen",
  "AOK NordWest",
  "AOK Nordost",
  "AOK Plus",
  "AOK Rheinland-Pfalz/Saarland",
  "AOK Rheinland/Hamburg",
  "AOK Sachsen-Anhalt",
  "Barmer",
  "DAK-Gesundheit",
  "TK – Techniker Krankenkasse",
  "KKH Kaufmännische Krankenkasse",
  "HEK – Hanseatische Krankenkasse",
  "hkk – Handelskrankenkasse",
  "IKK classic",
  "IKK gesund plus",
  "IKK Brandenburg und Berlin",
  "IKK Südwest",
  "BKK VBU",
  "BKK Mobil Oil",
  "BKK ProVita",
  "BKK Linde",
  "Knappschaft",
  "Minijob-Zentrale / Knappschaft",
  "LKK (Landwirtschaftliche Krankenkasse)",
  "Privat versichert (PKV)",
  "Selbstzahler / keine Krankenkasse",
]

interface KrankenkasseComboboxProps {
  value: string
  onChange: (value: string) => void
  disabled?: boolean
}

export function KrankenkasseCombobox({ value, onChange, disabled }: KrankenkasseComboboxProps) {
  const [open, setOpen] = React.useState(false)
  const [inputValue, setInputValue] = React.useState(value)

  // Update inputValue when external value changes
  React.useEffect(() => {
    setInputValue(value)
  }, [value])

  const handleSelect = (selected: string) => {
    onChange(selected)
    setInputValue(selected)
    setOpen(false)
  }

  // Allow free-text: commit whatever the user typed
  const handleInputChange = (val: string) => {
    setInputValue(val)
    onChange(val)
  }

  const filtered = GKV_LIST.filter((kk) =>
    kk.toLowerCase().includes(inputValue.toLowerCase())
  )

  return (
    <Popover open={open} onOpenChange={setOpen}>
      <PopoverTrigger asChild>
        <Button
          variant="outline"
          role="combobox"
          aria-expanded={open}
          aria-label="Krankenkasse auswählen"
          disabled={disabled}
          className="w-full justify-between font-normal"
        >
          <span className="truncate">{value || "Krankenkasse wählen oder eingeben..."}</span>
          <ChevronsUpDown className="ml-2 h-4 w-4 shrink-0 opacity-50" />
        </Button>
      </PopoverTrigger>
      <PopoverContent className="w-full p-0" align="start">
        <Command>
          <CommandInput
            placeholder="Suchen oder Freitext eingeben..."
            value={inputValue}
            onValueChange={handleInputChange}
          />
          <CommandList>
            <CommandEmpty>
              <span className="text-sm text-muted-foreground px-2">
                Nicht gefunden — Freitext wird übernommen.
              </span>
            </CommandEmpty>
            <CommandGroup>
              {filtered.map((kk) => (
                <CommandItem
                  key={kk}
                  value={kk}
                  onSelect={() => handleSelect(kk)}
                >
                  <Check
                    className={cn(
                      "mr-2 h-4 w-4",
                      value === kk ? "opacity-100" : "opacity-0"
                    )}
                  />
                  {kk}
                </CommandItem>
              ))}
            </CommandGroup>
          </CommandList>
        </Command>
      </PopoverContent>
    </Popover>
  )
}
