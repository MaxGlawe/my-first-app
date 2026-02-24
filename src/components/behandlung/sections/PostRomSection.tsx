"use client"

import { useCallback } from "react"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { CollapsibleSection, ClinicalCard } from "@/components/clinical-ui"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import { Ruler, Plus, Trash2 } from "lucide-react"
import type { PostRomEintrag } from "@/types/behandlung"
import { GELENK_OPTIONS, RICHTUNG_OPTIONS } from "@/types/behandlung"

interface PostRomSectionProps {
  entries: PostRomEintrag[]
  onChange: (entries: PostRomEintrag[]) => void
  disabled?: boolean
}

export function PostRomSection({ entries, onChange, disabled }: PostRomSectionProps) {
  const addEntry = useCallback(() => {
    onChange([...entries, { gelenk: "", richtung: "", grad_vorher: undefined, grad_nachher: undefined }])
  }, [entries, onChange])

  const updateEntry = useCallback(
    (index: number, updates: Partial<PostRomEintrag>) => {
      onChange(
        entries.map((e, i) => (i === index ? { ...e, ...updates } : e))
      )
    },
    [entries, onChange]
  )

  const removeEntry = useCallback(
    (index: number) => {
      onChange(entries.filter((_, i) => i !== index))
    },
    [entries, onChange]
  )

  const improvedCount = entries.filter(
    (e) =>
      e.grad_vorher !== undefined &&
      e.grad_nachher !== undefined &&
      e.grad_nachher > e.grad_vorher
  ).length

  return (
    <CollapsibleSection
      title="ROM-Vergleich (vorher / nachher)"
      description="Bewegungsausmaß vor und nach der Behandlung"
      icon={Ruler}
      accent="blue"
      badge={entries.length > 0 ? `${entries.length}` : undefined}
    >
      <div className="space-y-3">
        {entries.length === 0 ? (
          <p className="text-xs text-muted-foreground py-2">
            Keine ROM-Messungen erfasst.
          </p>
        ) : (
          entries.map((entry, i) => {
            const improved =
              entry.grad_vorher !== undefined &&
              entry.grad_nachher !== undefined &&
              entry.grad_nachher > entry.grad_vorher
            const worsened =
              entry.grad_vorher !== undefined &&
              entry.grad_nachher !== undefined &&
              entry.grad_nachher < entry.grad_vorher

            return (
              <ClinicalCard key={i} highlighted={improved} warning={worsened}>
                <div className="flex items-center gap-2 flex-wrap">
                  <Select
                    value={entry.gelenk}
                    onValueChange={(v) => updateEntry(i, { gelenk: v })}
                    disabled={disabled}
                  >
                    <SelectTrigger className="w-32 h-8 text-sm">
                      <SelectValue placeholder="Gelenk..." />
                    </SelectTrigger>
                    <SelectContent>
                      {GELENK_OPTIONS.map((g) => (
                        <SelectItem key={g} value={g}>{g}</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>

                  <Select
                    value={entry.richtung}
                    onValueChange={(v) => updateEntry(i, { richtung: v })}
                    disabled={disabled}
                  >
                    <SelectTrigger className="w-36 h-8 text-sm">
                      <SelectValue placeholder="Richtung..." />
                    </SelectTrigger>
                    <SelectContent>
                      {RICHTUNG_OPTIONS.map((r) => (
                        <SelectItem key={r} value={r}>{r}</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>

                  <div className="flex items-center gap-1">
                    <Label className="text-xs text-muted-foreground whitespace-nowrap">Vorher:</Label>
                    <Input
                      type="number"
                      min={0}
                      max={360}
                      placeholder="°"
                      value={entry.grad_vorher ?? ""}
                      onChange={(e) =>
                        updateEntry(i, {
                          grad_vorher: e.target.value ? parseInt(e.target.value, 10) : undefined,
                        })
                      }
                      disabled={disabled}
                      className="w-16 h-8 text-sm"
                    />
                  </div>

                  <div className="flex items-center gap-1">
                    <Label className="text-xs text-muted-foreground whitespace-nowrap">Nachher:</Label>
                    <Input
                      type="number"
                      min={0}
                      max={360}
                      placeholder="°"
                      value={entry.grad_nachher ?? ""}
                      onChange={(e) =>
                        updateEntry(i, {
                          grad_nachher: e.target.value ? parseInt(e.target.value, 10) : undefined,
                        })
                      }
                      disabled={disabled}
                      className="w-16 h-8 text-sm"
                    />
                  </div>

                  {improved && (
                    <Badge variant="outline" className="text-xs bg-green-50 text-green-700 border-green-200">
                      +{(entry.grad_nachher ?? 0) - (entry.grad_vorher ?? 0)}°
                    </Badge>
                  )}

                  {!disabled && (
                    <Button
                      type="button"
                      variant="ghost"
                      size="sm"
                      onClick={() => removeEntry(i)}
                      className="text-destructive hover:text-destructive ml-auto"
                    >
                      <Trash2 className="h-3.5 w-3.5" />
                    </Button>
                  )}
                </div>
              </ClinicalCard>
            )
          })
        )}

        {!disabled && (
          <Button type="button" variant="outline" size="sm" onClick={addEntry}>
            <Plus className="h-3.5 w-3.5 mr-1" />
            ROM-Messung
          </Button>
        )}

        {improvedCount > 0 && (
          <p className="text-xs text-green-600 font-medium">
            {improvedCount} von {entries.length} Messungen verbessert
          </p>
        )}
      </div>
    </CollapsibleSection>
  )
}
