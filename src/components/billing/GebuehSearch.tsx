"use client"

import { useState } from "react"
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
import { Button } from "@/components/ui/button"
import { ChevronsUpDown } from "lucide-react"
import type { GebuehCode } from "@/types/billing"

interface GebuehSearchProps {
  codes: GebuehCode[]
  onSelect: (code: GebuehCode) => void
}

export function GebuehSearch({ codes, onSelect }: GebuehSearchProps) {
  const [open, setOpen] = useState(false)

  // Gruppiere nach Kategorie
  const grouped = codes.reduce<Record<string, GebuehCode[]>>((acc, code) => {
    if (!acc[code.kategorie]) acc[code.kategorie] = []
    acc[code.kategorie].push(code)
    return acc
  }, {})

  return (
    <Popover open={open} onOpenChange={setOpen}>
      <PopoverTrigger asChild>
        <Button
          variant="outline"
          className="w-full justify-between text-left font-normal"
        >
          GebüH-Leistung auswählen...
          <ChevronsUpDown className="ml-2 h-4 w-4 shrink-0 opacity-50" />
        </Button>
      </PopoverTrigger>
      <PopoverContent className="w-[500px] p-0" align="start">
        <Command>
          <CommandInput placeholder="Ziffer oder Beschreibung suchen..." />
          <CommandList className="max-h-[300px]">
            <CommandEmpty>Keine Leistung gefunden.</CommandEmpty>
            {Object.entries(grouped).map(([kategorie, items]) => (
              <CommandGroup key={kategorie} heading={kategorie}>
                {items.map((code) => (
                  <CommandItem
                    key={code.id}
                    value={`${code.ziffer} ${code.bezeichnung}`}
                    onSelect={() => {
                      onSelect(code)
                      setOpen(false)
                    }}
                  >
                    <div className="flex items-center gap-3 w-full">
                      <span className="font-mono text-xs bg-slate-100 px-1.5 py-0.5 rounded shrink-0">
                        {code.ziffer}
                      </span>
                      <span className="text-sm truncate flex-1">
                        {code.bezeichnung}
                      </span>
                      <span className="text-xs text-muted-foreground shrink-0">
                        {code.preis_min.toFixed(2)}–{code.preis_max.toFixed(2)} €
                      </span>
                    </div>
                  </CommandItem>
                ))}
              </CommandGroup>
            ))}
          </CommandList>
        </Command>
      </PopoverContent>
    </Popover>
  )
}
