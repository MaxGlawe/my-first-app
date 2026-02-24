"use client"

import { useCallback } from "react"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Badge } from "@/components/ui/badge"
import { ClinicalSection, ClinicalCard } from "@/components/clinical-ui"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import { Button } from "@/components/ui/button"
import { Brain, Plus, Trash2 } from "lucide-react"
import type {
  NeurologischeUntersuchung,
  DermatomEintrag,
  DermatomBefund,
  ReflexEintrag,
  ReflexBefund,
  KennmuskelEintrag,
} from "@/types/funktionsuntersuchung"
import {
  DERMATOM_SEGMENTE,
  REFLEXE,
  KENNMUSKELN,
} from "@/types/funktionsuntersuchung"

interface NeurologieSectionProps {
  data: NeurologischeUntersuchung
  onChange: (data: NeurologischeUntersuchung) => void
  disabled?: boolean
}

const DERMATOM_BEFUND_LABELS: Record<DermatomBefund, string> = {
  normal: "Normal",
  hyperaesthesie: "Hyperästhesie",
  hypaesthesie: "Hypästhesie",
  anaesthesie: "Anästhesie",
}

const REFLEX_BEFUND_LABELS: Record<ReflexBefund, string> = {
  normal: "Normal",
  abgeschwacht: "Abgeschwächt",
  gesteigert: "Gesteigert",
  fehlend: "Fehlend",
  pathologisch: "Pathologisch",
}

const KRAFTGRADE = ["0", "1", "2", "3", "4", "5"]

export function NeurologieSection({ data, onChange, disabled }: NeurologieSectionProps) {
  // ── Dermatome ──
  const addDermatom = useCallback(() => {
    const nextSegment = DERMATOM_SEGMENTE.find(
      (s) => !data.dermatome.some((d) => d.segment === s && d.seite === "rechts")
    )
    if (!nextSegment) return
    onChange({
      ...data,
      dermatome: [
        ...data.dermatome,
        { segment: nextSegment, seite: "rechts", befund: "normal" },
      ],
    })
  }, [data, onChange])

  const updateDermatom = useCallback(
    (index: number, updates: Partial<DermatomEintrag>) => {
      const updated = data.dermatome.map((d, i) =>
        i === index ? { ...d, ...updates } : d
      )
      onChange({ ...data, dermatome: updated })
    },
    [data, onChange]
  )

  const removeDermatom = useCallback(
    (index: number) => {
      onChange({ ...data, dermatome: data.dermatome.filter((_, i) => i !== index) })
    },
    [data, onChange]
  )

  // ── Reflexe ──
  const addReflex = useCallback(() => {
    const nextReflex = REFLEXE.find(
      (r) => !data.reflexe.some((ref) => ref.reflex === r && ref.seite === "rechts")
    )
    if (!nextReflex) return
    onChange({
      ...data,
      reflexe: [
        ...data.reflexe,
        { reflex: nextReflex, seite: "rechts", befund: "normal" },
      ],
    })
  }, [data, onChange])

  const updateReflex = useCallback(
    (index: number, updates: Partial<ReflexEintrag>) => {
      const updated = data.reflexe.map((r, i) =>
        i === index ? { ...r, ...updates } : r
      )
      onChange({ ...data, reflexe: updated })
    },
    [data, onChange]
  )

  const removeReflex = useCallback(
    (index: number) => {
      onChange({ ...data, reflexe: data.reflexe.filter((_, i) => i !== index) })
    },
    [data, onChange]
  )

  // ── Kennmuskeln ──
  const addKennmuskel = useCallback(() => {
    const nextKm = KENNMUSKELN.find(
      (km) =>
        !data.kennmuskeln.some(
          (k) => k.segment === km.segment && k.seite === "rechts"
        )
    )
    if (!nextKm) return
    onChange({
      ...data,
      kennmuskeln: [
        ...data.kennmuskeln,
        { segment: nextKm.segment, muskel: nextKm.muskel, kraftgrad: "5", seite: "rechts" },
      ],
    })
  }, [data, onChange])

  const updateKennmuskel = useCallback(
    (index: number, updates: Partial<KennmuskelEintrag>) => {
      const updated = data.kennmuskeln.map((k, i) =>
        i === index ? { ...k, ...updates } : k
      )
      onChange({ ...data, kennmuskeln: updated })
    },
    [data, onChange]
  )

  const removeKennmuskel = useCallback(
    (index: number) => {
      onChange({ ...data, kennmuskeln: data.kennmuskeln.filter((_, i) => i !== index) })
    },
    [data, onChange]
  )

  const abnormalDermatome = data.dermatome.filter((d) => d.befund !== "normal").length
  const abnormalReflexe = data.reflexe.filter((r) => r.befund !== "normal").length
  const weakMuscles = data.kennmuskeln.filter((k) => parseInt(k.kraftgrad) < 5).length

  return (
    <ClinicalSection
      title="Neurologische Untersuchung"
      description="Sensibilität, Reflexe & Kennmuskeln"
      icon={Brain}
      accent="purple"
    >
      {/* ── Dermatome / Sensibilität ── */}
      <div className="space-y-3">
        <div className="flex items-center justify-between">
          <h3 className="text-sm font-semibold text-slate-700">
            Sensibilität (Dermatome)
            {abnormalDermatome > 0 && (
              <Badge variant="destructive" className="ml-2 text-xs">
                {abnormalDermatome} auffällig
              </Badge>
            )}
          </h3>
          {!disabled && (
            <Button type="button" variant="outline" size="sm" onClick={addDermatom}>
              <Plus className="h-3.5 w-3.5 mr-1" />
              Segment
            </Button>
          )}
        </div>

        {data.dermatome.length === 0 ? (
          <p className="text-xs text-muted-foreground py-2">
            Keine Dermatome getestet. Klicken Sie auf &quot;+ Segment&quot;.
          </p>
        ) : (
          <div className="space-y-2">
            {data.dermatome.map((entry, i) => (
              <ClinicalCard
                key={i}
                warning={entry.befund !== "normal"}
              >
                <div className="flex items-center gap-2 flex-wrap">
                  <Select
                    value={entry.segment}
                    onValueChange={(v) => updateDermatom(i, { segment: v })}
                    disabled={disabled}
                  >
                    <SelectTrigger className="w-20 h-8 text-sm">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      {DERMATOM_SEGMENTE.map((s) => (
                        <SelectItem key={s} value={s}>{s}</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>

                  <Select
                    value={entry.seite}
                    onValueChange={(v) =>
                      updateDermatom(i, { seite: v as DermatomEintrag["seite"] })
                    }
                    disabled={disabled}
                  >
                    <SelectTrigger className="w-28 h-8 text-sm">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="rechts">Rechts</SelectItem>
                      <SelectItem value="links">Links</SelectItem>
                      <SelectItem value="beidseits">Beidseits</SelectItem>
                    </SelectContent>
                  </Select>

                  <Select
                    value={entry.befund}
                    onValueChange={(v) =>
                      updateDermatom(i, { befund: v as DermatomBefund })
                    }
                    disabled={disabled}
                  >
                    <SelectTrigger className="w-36 h-8 text-sm">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      {Object.entries(DERMATOM_BEFUND_LABELS).map(([k, v]) => (
                        <SelectItem key={k} value={k}>{v}</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>

                  {!disabled && (
                    <Button
                      type="button"
                      variant="ghost"
                      size="sm"
                      onClick={() => removeDermatom(i)}
                      className="text-destructive hover:text-destructive ml-auto"
                    >
                      <Trash2 className="h-3.5 w-3.5" />
                    </Button>
                  )}
                </div>
              </ClinicalCard>
            ))}
          </div>
        )}
      </div>

      {/* ── Reflexe ── */}
      <div className="space-y-3 pt-4 border-t border-slate-200/60">
        <div className="flex items-center justify-between">
          <h3 className="text-sm font-semibold text-slate-700">
            Reflexe
            {abnormalReflexe > 0 && (
              <Badge variant="destructive" className="ml-2 text-xs">
                {abnormalReflexe} auffällig
              </Badge>
            )}
          </h3>
          {!disabled && (
            <Button type="button" variant="outline" size="sm" onClick={addReflex}>
              <Plus className="h-3.5 w-3.5 mr-1" />
              Reflex
            </Button>
          )}
        </div>

        {data.reflexe.length === 0 ? (
          <p className="text-xs text-muted-foreground py-2">
            Keine Reflexe getestet. Klicken Sie auf &quot;+ Reflex&quot;.
          </p>
        ) : (
          <div className="space-y-2">
            {data.reflexe.map((entry, i) => (
              <ClinicalCard key={i} warning={entry.befund !== "normal"}>
                <div className="flex items-center gap-2 flex-wrap">
                  <Select
                    value={entry.reflex}
                    onValueChange={(v) => updateReflex(i, { reflex: v })}
                    disabled={disabled}
                  >
                    <SelectTrigger className="w-28 h-8 text-sm">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      {REFLEXE.map((r) => (
                        <SelectItem key={r} value={r}>{r}</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>

                  <Select
                    value={entry.seite}
                    onValueChange={(v) =>
                      updateReflex(i, { seite: v as ReflexEintrag["seite"] })
                    }
                    disabled={disabled}
                  >
                    <SelectTrigger className="w-24 h-8 text-sm">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="rechts">Rechts</SelectItem>
                      <SelectItem value="links">Links</SelectItem>
                    </SelectContent>
                  </Select>

                  <Select
                    value={entry.befund}
                    onValueChange={(v) =>
                      updateReflex(i, { befund: v as ReflexBefund })
                    }
                    disabled={disabled}
                  >
                    <SelectTrigger className="w-36 h-8 text-sm">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      {Object.entries(REFLEX_BEFUND_LABELS).map(([k, v]) => (
                        <SelectItem key={k} value={k}>{v}</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>

                  {!disabled && (
                    <Button
                      type="button"
                      variant="ghost"
                      size="sm"
                      onClick={() => removeReflex(i)}
                      className="text-destructive hover:text-destructive ml-auto"
                    >
                      <Trash2 className="h-3.5 w-3.5" />
                    </Button>
                  )}
                </div>
              </ClinicalCard>
            ))}
          </div>
        )}
      </div>

      {/* ── Kennmuskeln ── */}
      <div className="space-y-3 pt-4 border-t border-slate-200/60">
        <div className="flex items-center justify-between">
          <h3 className="text-sm font-semibold text-slate-700">
            Kennmuskeln
            {weakMuscles > 0 && (
              <Badge variant="destructive" className="ml-2 text-xs">
                {weakMuscles} &lt;5
              </Badge>
            )}
          </h3>
          {!disabled && (
            <Button type="button" variant="outline" size="sm" onClick={addKennmuskel}>
              <Plus className="h-3.5 w-3.5 mr-1" />
              Kennmuskel
            </Button>
          )}
        </div>

        {data.kennmuskeln.length === 0 ? (
          <p className="text-xs text-muted-foreground py-2">
            Keine Kennmuskeln getestet. Klicken Sie auf &quot;+ Kennmuskel&quot;.
          </p>
        ) : (
          <div className="space-y-2">
            {data.kennmuskeln.map((entry, i) => (
              <ClinicalCard key={i} warning={parseInt(entry.kraftgrad) < 5}>
                <div className="flex items-center gap-2 flex-wrap">
                  <Select
                    value={entry.segment}
                    onValueChange={(v) => {
                      const km = KENNMUSKELN.find((k) => k.segment === v)
                      updateKennmuskel(i, {
                        segment: v,
                        muskel: km?.muskel ?? entry.muskel,
                      })
                    }}
                    disabled={disabled}
                  >
                    <SelectTrigger className="w-20 h-8 text-sm">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      {KENNMUSKELN.map((km) => (
                        <SelectItem key={km.segment} value={km.segment}>
                          {km.segment}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>

                  <span className="text-xs text-muted-foreground min-w-[120px]">
                    {entry.muskel}
                  </span>

                  <Select
                    value={entry.seite}
                    onValueChange={(v) =>
                      updateKennmuskel(i, { seite: v as KennmuskelEintrag["seite"] })
                    }
                    disabled={disabled}
                  >
                    <SelectTrigger className="w-24 h-8 text-sm">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="rechts">Rechts</SelectItem>
                      <SelectItem value="links">Links</SelectItem>
                    </SelectContent>
                  </Select>

                  <div className="flex items-center gap-1">
                    <Label className="text-xs text-muted-foreground">KG:</Label>
                    <Select
                      value={entry.kraftgrad}
                      onValueChange={(v) => updateKennmuskel(i, { kraftgrad: v })}
                      disabled={disabled}
                    >
                      <SelectTrigger className="w-16 h-8 text-sm">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        {KRAFTGRADE.map((g) => (
                          <SelectItem key={g} value={g}>{g}/5</SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>

                  {!disabled && (
                    <Button
                      type="button"
                      variant="ghost"
                      size="sm"
                      onClick={() => removeKennmuskel(i)}
                      className="text-destructive hover:text-destructive ml-auto"
                    >
                      <Trash2 className="h-3.5 w-3.5" />
                    </Button>
                  )}
                </div>
              </ClinicalCard>
            ))}
          </div>
        )}
      </div>

      {/* ── Koordination & Notizen ── */}
      <div className="space-y-3 pt-4 border-t border-slate-200/60">
        <div className="space-y-2">
          <Label className="text-sm">Koordination / Gleichgewicht</Label>
          <Textarea
            rows={2}
            placeholder="z.B. Romberg, Einbeinstand, Finger-Nase-Versuch..."
            value={data.koordination}
            onChange={(e) => onChange({ ...data, koordination: e.target.value })}
            disabled={disabled}
          />
        </div>
        <div className="space-y-2">
          <Label className="text-sm">Notizen zur neurologischen Untersuchung</Label>
          <Textarea
            rows={2}
            placeholder="Zusätzliche Befunde, klinischer Eindruck..."
            value={data.notizen}
            onChange={(e) => onChange({ ...data, notizen: e.target.value })}
            disabled={disabled}
          />
        </div>
      </div>
    </ClinicalSection>
  )
}
