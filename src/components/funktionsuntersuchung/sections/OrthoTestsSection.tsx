"use client"

import { useState, useEffect, useCallback } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Badge } from "@/components/ui/badge"
import { Skeleton } from "@/components/ui/skeleton"
import { ClinicalSection, ClinicalCard } from "@/components/clinical-ui"
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import { Stethoscope, Plus, Trash2, Info } from "lucide-react"
import type {
  OrthoTestCatalogEntry,
  OrthoTestResult,
  OrthoBefund,
} from "@/types/funktionsuntersuchung"
import { ORTHO_REGIONEN, ORTHO_BEFUND_LABELS } from "@/types/funktionsuntersuchung"

interface OrthoTestsSectionProps {
  tests: OrthoTestResult[]
  onChange: (tests: OrthoTestResult[]) => void
  disabled?: boolean
}

const BEFUND_COLORS: Record<OrthoBefund, string> = {
  positiv: "bg-red-600 hover:bg-red-700 text-white",
  negativ: "bg-green-600 hover:bg-green-700 text-white",
  fraglich: "bg-amber-500 hover:bg-amber-600 text-white",
}

export function OrthoTestsSection({ tests, onChange, disabled }: OrthoTestsSectionProps) {
  const [catalog, setCatalog] = useState<OrthoTestCatalogEntry[]>([])
  const [loading, setLoading] = useState(true)
  const [activeRegion, setActiveRegion] = useState<string>(ORTHO_REGIONEN[0])

  useEffect(() => {
    fetch("/api/ortho-catalog")
      .then((res) => res.json())
      .then((json) => setCatalog(json.tests ?? []))
      .catch(() => {})
      .finally(() => setLoading(false))
  }, [])

  const addTest = useCallback(
    (catalogId: string) => {
      if (tests.some((t) => t.catalog_id === catalogId)) return
      onChange([...tests, { catalog_id: catalogId, befund: "negativ" }])
    },
    [tests, onChange]
  )

  const removeTest = useCallback(
    (catalogId: string) => {
      onChange(tests.filter((t) => t.catalog_id !== catalogId))
    },
    [tests, onChange]
  )

  const updateTest = useCallback(
    (catalogId: string, updates: Partial<OrthoTestResult>) => {
      onChange(
        tests.map((t) =>
          t.catalog_id === catalogId ? { ...t, ...updates } : t
        )
      )
    },
    [tests, onChange]
  )

  const regionTests = catalog.filter((t) => t.region === activeRegion)
  const selectedIds = new Set(tests.map((t) => t.catalog_id))
  const positiveCount = tests.filter((t) => t.befund === "positiv").length

  return (
    <ClinicalSection
      title="Orthopädische Spezialtests"
      description="Gelenk- und Bandspezifische Funktionstests"
      icon={Stethoscope}
      accent="blue"
    >
      {/* Region tabs */}
      <div className="flex flex-wrap gap-2 mb-4">
        {ORTHO_REGIONEN.map((region) => {
          const count = tests.filter((t) => {
            const entry = catalog.find((c) => c.id === t.catalog_id)
            return entry?.region === region
          }).length
          return (
            <Button
              key={region}
              type="button"
              variant={activeRegion === region ? "default" : "outline"}
              size="sm"
              onClick={() => setActiveRegion(region)}
              className={activeRegion === region ? "bg-blue-600 hover:bg-blue-700" : ""}
            >
              {region}
              {count > 0 && (
                <Badge variant="secondary" className="ml-1.5 text-xs">
                  {count}
                </Badge>
              )}
            </Button>
          )
        })}
      </div>

      {/* Catalog list */}
      {loading ? (
        <div className="space-y-2">
          {[1, 2, 3].map((i) => (
            <Skeleton key={i} className="h-16 w-full" />
          ))}
        </div>
      ) : regionTests.length === 0 ? (
        <p className="text-sm text-muted-foreground py-4">
          Keine Tests für diese Region im Katalog.
        </p>
      ) : (
        <div className="space-y-2">
          {regionTests.map((test) => {
            const isAdded = selectedIds.has(test.id)
            const result = tests.find((t) => t.catalog_id === test.id)

            return (
              <ClinicalCard
                key={test.id}
                highlighted={isAdded}
                className="space-y-0"
              >
                <div className="flex items-start justify-between gap-3">
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 flex-wrap">
                      <span className="font-medium text-sm">{test.test_name}</span>
                      <Badge variant="outline" className="text-xs">
                        {test.kategorie}
                      </Badge>
                    </div>

                    <Accordion type="single" collapsible className="mt-1">
                      <AccordionItem value="info" className="border-0">
                        <AccordionTrigger className="py-1 text-xs text-muted-foreground hover:no-underline">
                          <span className="flex items-center gap-1">
                            <Info className="h-3 w-3" />
                            Testbeschreibung
                          </span>
                        </AccordionTrigger>
                        <AccordionContent className="pb-2">
                          <div className="text-xs space-y-1.5 text-muted-foreground">
                            <p>{test.beschreibung}</p>
                            <p>
                              <strong>Positiver Befund:</strong> {test.positiver_befund}
                            </p>
                            <p>
                              <strong>Klinische Relevanz:</strong> {test.klinische_relevanz}
                            </p>
                          </div>
                        </AccordionContent>
                      </AccordionItem>
                    </Accordion>
                  </div>

                  {!disabled && (
                    <div className="shrink-0">
                      {isAdded ? (
                        <Button
                          type="button"
                          variant="ghost"
                          size="sm"
                          onClick={() => removeTest(test.id)}
                          className="text-destructive hover:text-destructive"
                        >
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      ) : (
                        <Button
                          type="button"
                          variant="outline"
                          size="sm"
                          onClick={() => addTest(test.id)}
                        >
                          <Plus className="h-4 w-4 mr-1" />
                          Hinzufügen
                        </Button>
                      )}
                    </div>
                  )}
                </div>

                {/* Befund + Seite + Notiz */}
                {isAdded && result && (
                  <div className="mt-3 pt-3 border-t space-y-3">
                    <div className="flex flex-wrap gap-3 items-end">
                      <div>
                        <Label className="text-xs">Befund</Label>
                        <div className="flex gap-2 mt-1">
                          {(Object.keys(ORTHO_BEFUND_LABELS) as OrthoBefund[]).map((befund) => (
                            <Button
                              key={befund}
                              type="button"
                              size="sm"
                              variant={result.befund === befund ? "default" : "outline"}
                              disabled={disabled}
                              onClick={() => updateTest(test.id, { befund })}
                              className={result.befund === befund ? BEFUND_COLORS[befund] : ""}
                            >
                              {ORTHO_BEFUND_LABELS[befund]}
                            </Button>
                          ))}
                        </div>
                      </div>

                      <div className="min-w-[140px]">
                        <Label className="text-xs">Seite</Label>
                        <Select
                          value={result.seite ?? ""}
                          onValueChange={(v) =>
                            updateTest(test.id, {
                              seite: v as OrthoTestResult["seite"],
                            })
                          }
                          disabled={disabled}
                        >
                          <SelectTrigger className="mt-1 h-8 text-sm">
                            <SelectValue placeholder="Seite..." />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="rechts">Rechts</SelectItem>
                            <SelectItem value="links">Links</SelectItem>
                            <SelectItem value="beidseits">Beidseits</SelectItem>
                          </SelectContent>
                        </Select>
                      </div>
                    </div>

                    <div>
                      <Label className="text-xs">Notiz (optional)</Label>
                      <Input
                        placeholder="Ergänzende Beobachtung..."
                        value={result.notiz ?? ""}
                        onChange={(e) => updateTest(test.id, { notiz: e.target.value })}
                        disabled={disabled}
                        className="mt-1 h-8 text-sm"
                      />
                    </div>
                  </div>
                )}
              </ClinicalCard>
            )
          })}
        </div>
      )}

      {/* Summary */}
      {tests.length > 0 && (
        <div className="mt-4 p-3 bg-blue-50/50 border border-blue-200/60 rounded-lg">
          <p className="text-sm font-medium">
            {tests.length} Test{tests.length !== 1 ? "s" : ""} durchgeführt
            {positiveCount > 0 && (
              <span className="text-red-600 ml-2">
                ({positiveCount} positiv)
              </span>
            )}
          </p>
          <div className="flex flex-wrap gap-1.5 mt-2">
            {tests.map((t) => {
              const entry = catalog.find((c) => c.id === t.catalog_id)
              return (
                <Badge
                  key={t.catalog_id}
                  variant={
                    t.befund === "negativ"
                      ? "outline"
                      : t.befund === "positiv"
                      ? "destructive"
                      : "secondary"
                  }
                  className="text-xs"
                >
                  {entry?.test_name ?? t.catalog_id}
                  {t.seite && ` (${t.seite})`}
                </Badge>
              )
            })}
          </div>
        </div>
      )}
    </ClinicalSection>
  )
}
