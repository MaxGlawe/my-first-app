"use client"

import * as React from "react"
import { Check, ChevronsUpDown, AlertTriangle } from "lucide-react"
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
import type { Icd10Entry } from "@/types/diagnose"

// Statischer Import der ICD-10-GM Daten
import icd10Data from "../../../public/data/icd10-gm.json"

const ICD10_LIST: Icd10Entry[] = icd10Data as Icd10Entry[]

interface Icd10ComboboxProps {
  value: Icd10Entry | null
  onChange: (value: Icd10Entry | null) => void
  disabled?: boolean
  placeholder?: string
}

function isKnownCode(code: string): boolean {
  return ICD10_LIST.some((e) => e.code === code)
}

export function Icd10Combobox({
  value,
  onChange,
  disabled,
  placeholder = "ICD-10-Code oder Diagnose suchen...",
}: Icd10ComboboxProps) {
  const [open, setOpen] = React.useState(false)
  const [searchValue, setSearchValue] = React.useState("")

  // Filter entries based on search: match code OR bezeichnung
  const filtered = React.useMemo(() => {
    const q = searchValue.toLowerCase().trim()
    if (!q) return ICD10_LIST.slice(0, 50)
    return ICD10_LIST.filter(
      (e) =>
        e.code.toLowerCase().includes(q) ||
        e.bezeichnung.toLowerCase().includes(q)
    ).slice(0, 80)
  }, [searchValue])

  const handleSelect = (entry: Icd10Entry) => {
    onChange(value?.code === entry.code ? null : entry)
    setSearchValue("")
    setOpen(false)
  }

  const handleFreitext = () => {
    // Allow free-text entry if nothing found
    if (!searchValue.trim()) return
    onChange({
      code: searchValue.trim().toUpperCase(),
      bezeichnung: "(Freitext)",
    })
    setSearchValue("")
    setOpen(false)
  }

  const displayValue = value
    ? `${value.code} — ${value.bezeichnung}`
    : ""

  const isValueKnown = value ? isKnownCode(value.code) : true
  const isFreitext = value?.bezeichnung === "(Freitext)"

  return (
    <div className="space-y-1">
      <Popover open={open} onOpenChange={setOpen}>
        <PopoverTrigger asChild>
          <Button
            variant="outline"
            role="combobox"
            aria-expanded={open}
            aria-label="ICD-10 Diagnose suchen"
            disabled={disabled}
            className="w-full justify-between font-normal"
          >
            <span className="truncate text-left">
              {displayValue || placeholder}
            </span>
            <ChevronsUpDown className="ml-2 h-4 w-4 shrink-0 opacity-50" />
          </Button>
        </PopoverTrigger>
        <PopoverContent className="w-[480px] p-0" align="start">
          <Command shouldFilter={false}>
            <CommandInput
              placeholder="Code (z.B. M54.5) oder Bezeichnung eingeben..."
              value={searchValue}
              onValueChange={setSearchValue}
            />
            <CommandList>
              <CommandEmpty>
                <div className="py-3 px-4 space-y-2">
                  <p className="text-sm text-muted-foreground">
                    Kein ICD-10-Code gefunden.
                  </p>
                  {searchValue.trim() && (
                    <Button
                      type="button"
                      variant="outline"
                      size="sm"
                      className="w-full"
                      onClick={handleFreitext}
                    >
                      <AlertTriangle className="mr-2 h-3 w-3 text-amber-500" />
                      &quot;{searchValue}&quot; als Freitext-Diagnose übernehmen
                    </Button>
                  )}
                </div>
              </CommandEmpty>
              <CommandGroup>
                {filtered.map((entry) => (
                  <CommandItem
                    key={entry.code}
                    value={`${entry.code} ${entry.bezeichnung}`}
                    onSelect={() => handleSelect(entry)}
                    className="flex items-start gap-2"
                  >
                    <Check
                      className={cn(
                        "mt-0.5 h-4 w-4 shrink-0",
                        value?.code === entry.code ? "opacity-100" : "opacity-0"
                      )}
                    />
                    <span className="font-mono text-xs shrink-0 text-muted-foreground w-16">
                      {entry.code}
                    </span>
                    <span className="text-sm leading-snug">{entry.bezeichnung}</span>
                  </CommandItem>
                ))}
              </CommandGroup>
            </CommandList>
          </Command>
        </PopoverContent>
      </Popover>

      {/* Warning for free-text or unknown codes */}
      {isFreitext && value && (
        <p className="text-xs text-amber-600 flex items-center gap-1">
          <AlertTriangle className="h-3 w-3" />
          Freitext-Diagnose — bitte Pflichtnotiz ergänzen.
        </p>
      )}
      {!isFreitext && value && !isValueKnown && (
        <p className="text-xs text-amber-600 flex items-center gap-1">
          <AlertTriangle className="h-3 w-3" />
          Dieser Code ist in der aktuellen ICD-10-GM Datei nicht hinterlegt — bitte prüfen.
        </p>
      )}
    </div>
  )
}
