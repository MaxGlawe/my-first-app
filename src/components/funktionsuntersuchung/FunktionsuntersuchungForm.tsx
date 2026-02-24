"use client"

import { useState, useEffect, useCallback } from "react"
import { useRouter } from "next/navigation"
import Link from "next/link"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Badge } from "@/components/ui/badge"
import { Alert, AlertDescription } from "@/components/ui/alert"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion"
import { Skeleton } from "@/components/ui/skeleton"
import { toast } from "sonner"
import {
  ClipboardList,
  Eye,
  Dumbbell,
  GraduationCap,
  Info,
  Plus,
  Trash2,
} from "lucide-react"
import { ClinicalSection, ClinicalCard, FormActions } from "@/components/clinical-ui"
import { OrthoTestsSection } from "./sections/OrthoTestsSection"
import { NeurologieSection } from "./sections/NeurologieSection"
import type {
  JandaTestCatalogEntry,
  JandaTestResult,
  JandaBefund,
  FunktionsuntersuchungData,
  OrthoTestResult,
  NeurologischeUntersuchung,
} from "@/types/funktionsuntersuchung"
import {
  JANDA_REGIONEN,
  JANDA_BEFUND_LABELS,
  JANDA_KATEGORIE_LABELS,
  SPORTLICHE_AKTIVITAET_OPTIONS,
  BESCHWERDEDAUER_OPTIONS,
  createEmptyFunktionsuntersuchungData,
} from "@/types/funktionsuntersuchung"

interface FunktionsuntersuchungFormProps {
  patientId: string
  existingData?: FunktionsuntersuchungData
  existingId?: string
  existingStatus?: string
}

const EMPTY_NEURO: NeurologischeUntersuchung = {
  dermatome: [],
  reflexe: [],
  kennmuskeln: [],
  koordination: "",
  notizen: "",
}

export function FunktionsuntersuchungForm({
  patientId,
  existingData,
  existingId,
  existingStatus,
}: FunktionsuntersuchungFormProps) {
  const router = useRouter()
  const isEdit = !!existingId
  const isLocked = existingStatus === "abgeschlossen"

  // ── Form state ──
  const [formData, setFormData] = useState<FunktionsuntersuchungData>(
    existingData ?? createEmptyFunktionsuntersuchungData()
  )

  // ── Janda catalog ──
  const [catalog, setCatalog] = useState<JandaTestCatalogEntry[]>([])
  const [catalogLoading, setCatalogLoading] = useState(true)
  const [activeRegion, setActiveRegion] = useState<string>(JANDA_REGIONEN[0])

  // ── Submission state ──
  const [isSavingDraft, setIsSavingDraft] = useState(false)
  const [isFinishing, setIsFinishing] = useState(false)
  const [serverError, setServerError] = useState<string | null>(null)

  const isSubmitting = isSavingDraft || isFinishing

  // ── Load Janda catalog ──
  useEffect(() => {
    fetch("/api/janda-catalog")
      .then((res) => res.json())
      .then((json) => setCatalog(json.tests ?? []))
      .catch(() => {})
      .finally(() => setCatalogLoading(false))
  }, [])

  // ── Field updaters ──
  const updateField = useCallback(
    <K extends keyof FunktionsuntersuchungData>(key: K, value: FunktionsuntersuchungData[K]) => {
      setFormData((prev) => ({ ...prev, [key]: value }))
    },
    []
  )

  // ── Janda test management ──
  const addJandaTest = useCallback((catalogId: string) => {
    setFormData((prev) => {
      if (prev.janda_tests.some((t) => t.catalog_id === catalogId)) return prev
      return {
        ...prev,
        janda_tests: [...prev.janda_tests, { catalog_id: catalogId, befund: "normal" as JandaBefund }],
      }
    })
  }, [])

  const removeJandaTest = useCallback((catalogId: string) => {
    setFormData((prev) => ({
      ...prev,
      janda_tests: prev.janda_tests.filter((t) => t.catalog_id !== catalogId),
    }))
  }, [])

  const updateJandaTest = useCallback(
    (catalogId: string, updates: Partial<JandaTestResult>) => {
      setFormData((prev) => ({
        ...prev,
        janda_tests: prev.janda_tests.map((t) =>
          t.catalog_id === catalogId ? { ...t, ...updates } : t
        ),
      }))
    },
    []
  )

  // ── Ortho tests ──
  const updateOrthoTests = useCallback((tests: OrthoTestResult[]) => {
    setFormData((prev) => ({ ...prev, ortho_tests: tests }))
  }, [])

  // ── Neurologie ──
  const updateNeuro = useCallback((neuro: NeurologischeUntersuchung) => {
    setFormData((prev) => ({ ...prev, neurologische_untersuchung: neuro }))
  }, [])

  // ── Submit ──
  async function submitForm(status: "entwurf" | "abgeschlossen") {
    setServerError(null)

    const payload = { status, data: formData }

    try {
      const url = isEdit
        ? `/api/patients/${patientId}/funktionsuntersuchung/${existingId}`
        : `/api/patients/${patientId}/funktionsuntersuchung`
      const method = isEdit ? "PUT" : "POST"

      const res = await fetch(url, {
        method,
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      })

      const json = await res.json().catch(() => ({}))

      if (!res.ok) {
        setServerError(json.error ?? "Speichern fehlgeschlagen.")
        return null
      }

      return json.record?.id as string
    } catch {
      setServerError("Ein unerwarteter Fehler ist aufgetreten.")
      return null
    }
  }

  const onSaveDraft = async () => {
    setIsSavingDraft(true)
    try {
      const id = await submitForm("entwurf")
      if (id) {
        toast.success("Entwurf gespeichert.")
        router.push(`/os/patients/${patientId}/funktionsuntersuchung/${id}`)
      }
    } finally {
      setIsSavingDraft(false)
    }
  }

  const onFinish = async () => {
    if (!formData.hauptbeschwerde.trim()) {
      setServerError("Bitte geben Sie die Hauptbeschwerde an.")
      return
    }
    setIsFinishing(true)
    try {
      const id = await submitForm("abgeschlossen")
      if (id) {
        toast.success("Funktionsuntersuchung abgeschlossen und gesperrt.")
        router.push(`/os/patients/${patientId}/funktionsuntersuchung/${id}`)
      }
    } finally {
      setIsFinishing(false)
    }
  }

  // ── Catalog filtered by region ──
  const regionTests = catalog.filter((t) => t.region === activeRegion)
  const selectedIds = new Set(formData.janda_tests.map((t) => t.catalog_id))

  return (
    <div className="space-y-6">
      {serverError && (
        <Alert variant="destructive">
          <AlertDescription>{serverError}</AlertDescription>
        </Alert>
      )}

      {isLocked && (
        <Alert>
          <AlertDescription>
            Diese Untersuchung ist abgeschlossen und kann nicht mehr bearbeitet werden.
          </AlertDescription>
        </Alert>
      )}

      {/* ── Section 1: Allgemeine Angaben ── */}
      <ClinicalSection
        title="Allgemeine Angaben"
        description="Beschwerde, Aktivitätslevel & Trainingsziele"
        icon={ClipboardList}
        accent="emerald"
      >
        <div className="grid gap-4 sm:grid-cols-2">
          <div className="sm:col-span-2">
            <Label htmlFor="hauptbeschwerde">Hauptbeschwerde *</Label>
            <Textarea
              id="hauptbeschwerde"
              placeholder="z.B. Rückenschmerzen seit 3 Monaten, besonders nach langem Sitzen..."
              value={formData.hauptbeschwerde}
              onChange={(e) => updateField("hauptbeschwerde", e.target.value)}
              disabled={isLocked}
              rows={3}
              className="mt-1"
            />
          </div>

          <div>
            <Label htmlFor="beschwerdedauer">Beschwerdedauer</Label>
            <Select
              value={formData.beschwerdedauer}
              onValueChange={(v) => updateField("beschwerdedauer", v)}
              disabled={isLocked}
            >
              <SelectTrigger id="beschwerdedauer" className="mt-1">
                <SelectValue placeholder="Bitte wählen..." />
              </SelectTrigger>
              <SelectContent>
                {BESCHWERDEDAUER_OPTIONS.map((opt) => (
                  <SelectItem key={opt} value={opt}>
                    {opt}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div>
            <Label htmlFor="sportliche_aktivitaet">Sportliche Aktivität</Label>
            <Select
              value={formData.sportliche_aktivitaet}
              onValueChange={(v) => updateField("sportliche_aktivitaet", v)}
              disabled={isLocked}
            >
              <SelectTrigger id="sportliche_aktivitaet" className="mt-1">
                <SelectValue placeholder="Bitte wählen..." />
              </SelectTrigger>
              <SelectContent>
                {SPORTLICHE_AKTIVITAET_OPTIONS.map((opt) => (
                  <SelectItem key={opt} value={opt}>
                    {opt}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div className="sm:col-span-2">
            <Label htmlFor="trainingsziele">Trainingsziele</Label>
            <Textarea
              id="trainingsziele"
              placeholder="z.B. Schmerzreduktion, Muskelaufbau, Beweglichkeit verbessern..."
              value={formData.trainingsziele}
              onChange={(e) => updateField("trainingsziele", e.target.value)}
              disabled={isLocked}
              rows={2}
              className="mt-1"
            />
          </div>
        </div>
      </ClinicalSection>

      {/* ── Section 2: Bewegungsanalyse ── */}
      <ClinicalSection
        title="Haltungs- & Bewegungsanalyse"
        description="Statische Haltung & dynamisches Gangbild"
        icon={Eye}
        accent="teal"
      >
        <div className="grid gap-4 sm:grid-cols-2">
          <div>
            <Label htmlFor="haltungsanalyse">Haltungsanalyse</Label>
            <Textarea
              id="haltungsanalyse"
              placeholder="Beobachtungen zur Haltung (Kopfhaltung, Schulterstand, Beckenstellung...)"
              value={formData.haltungsanalyse}
              onChange={(e) => updateField("haltungsanalyse", e.target.value)}
              disabled={isLocked}
              rows={3}
              className="mt-1"
            />
          </div>
          <div>
            <Label htmlFor="gangbildanalyse">Gangbildanalyse</Label>
            <Textarea
              id="gangbildanalyse"
              placeholder="Beobachtungen zum Gangbild (Schrittlänge, Abrollbewegung, Symmetrie...)"
              value={formData.gangbildanalyse}
              onChange={(e) => updateField("gangbildanalyse", e.target.value)}
              disabled={isLocked}
              rows={3}
              className="mt-1"
            />
          </div>
        </div>
      </ClinicalSection>

      {/* ── Section 3: Janda Tests ── */}
      <ClinicalSection
        title="Muskelfunktionstests (nach Janda)"
        description="Systematische Erfassung muskulärer Dysbalancen"
        icon={Dumbbell}
        accent="emerald"
      >
        {/* Region tabs */}
        <div className="flex flex-wrap gap-2 mb-4">
          {JANDA_REGIONEN.map((region) => {
            const count = formData.janda_tests.filter((t) => {
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
                className={activeRegion === region ? "bg-emerald-600 hover:bg-emerald-700" : ""}
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

        {/* Test catalog for selected region */}
        {catalogLoading ? (
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
              const result = formData.janda_tests.find((t) => t.catalog_id === test.id)

              return (
                <ClinicalCard key={test.id} highlighted={isAdded}>
                  <div className="flex items-start justify-between gap-3">
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2 flex-wrap">
                        <span className="font-medium text-sm">{test.test_name}</span>
                        <Badge variant="outline" className="text-xs">
                          {test.muskel}
                        </Badge>
                        <Badge variant="secondary" className="text-xs">
                          {JANDA_KATEGORIE_LABELS[test.kategorie]}
                        </Badge>
                      </div>

                      <Accordion type="single" collapsible className="mt-1">
                        <AccordionItem value="info" className="border-0">
                          <AccordionTrigger className="py-1 text-xs text-muted-foreground hover:no-underline">
                            <span className="flex items-center gap-1">
                              <Info className="h-3 w-3" />
                              Testanleitung
                            </span>
                          </AccordionTrigger>
                          <AccordionContent className="pb-2">
                            <div className="text-xs space-y-1.5 text-muted-foreground">
                              <p>{test.beschreibung}</p>
                              <p>
                                <strong>Normalbefund:</strong> {test.normalbefund}
                              </p>
                              <p>
                                <strong>Pathologisch:</strong> {test.pathologischer_befund}
                              </p>
                            </div>
                          </AccordionContent>
                        </AccordionItem>
                      </Accordion>
                    </div>

                    {!isLocked && (
                      <div className="shrink-0">
                        {isAdded ? (
                          <Button
                            type="button"
                            variant="ghost"
                            size="sm"
                            onClick={() => removeJandaTest(test.id)}
                            className="text-destructive hover:text-destructive"
                          >
                            <Trash2 className="h-4 w-4" />
                          </Button>
                        ) : (
                          <Button
                            type="button"
                            variant="outline"
                            size="sm"
                            onClick={() => addJandaTest(test.id)}
                          >
                            <Plus className="h-4 w-4 mr-1" />
                            Hinzufügen
                          </Button>
                        )}
                      </div>
                    )}
                  </div>

                  {/* Befund selection + notes */}
                  {isAdded && result && (
                    <div className="mt-3 pt-3 border-t space-y-3">
                      <div>
                        <Label className="text-xs">Befund</Label>
                        <div className="flex gap-2 mt-1">
                          {(Object.keys(JANDA_BEFUND_LABELS) as JandaBefund[]).map((befund) => (
                            <Button
                              key={befund}
                              type="button"
                              size="sm"
                              variant={result.befund === befund ? "default" : "outline"}
                              disabled={isLocked}
                              onClick={() => updateJandaTest(test.id, { befund })}
                              className={
                                result.befund === befund
                                  ? befund === "normal"
                                    ? "bg-green-600 hover:bg-green-700"
                                    : befund === "leicht_auffaellig"
                                    ? "bg-yellow-600 hover:bg-yellow-700"
                                    : "bg-red-600 hover:bg-red-700"
                                  : ""
                              }
                            >
                              {JANDA_BEFUND_LABELS[befund]}
                            </Button>
                          ))}
                        </div>
                      </div>
                      <div>
                        <Label htmlFor={`notiz-${test.id}`} className="text-xs">
                          Notiz (optional)
                        </Label>
                        <Input
                          id={`notiz-${test.id}`}
                          placeholder="Ergänzende Beobachtung..."
                          value={result.notiz ?? ""}
                          onChange={(e) => updateJandaTest(test.id, { notiz: e.target.value })}
                          disabled={isLocked}
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

        {/* Summary of selected tests */}
        {formData.janda_tests.length > 0 && (
          <div className="mt-4 p-3 bg-emerald-50/50 border border-emerald-200/60 rounded-lg">
            <p className="text-sm font-medium">
              {formData.janda_tests.length} Test{formData.janda_tests.length !== 1 ? "s" : ""} ausgewählt
            </p>
            <div className="flex flex-wrap gap-1.5 mt-2">
              {formData.janda_tests.map((t) => {
                const entry = catalog.find((c) => c.id === t.catalog_id)
                return (
                  <Badge
                    key={t.catalog_id}
                    variant={
                      t.befund === "normal"
                        ? "outline"
                        : t.befund === "leicht_auffaellig"
                        ? "secondary"
                        : "destructive"
                    }
                    className="text-xs"
                  >
                    {entry?.test_name ?? t.catalog_id}
                  </Badge>
                )
              })}
            </div>
          </div>
        )}
      </ClinicalSection>

      {/* ── Section 4: Orthopädische Spezialtests ── */}
      <OrthoTestsSection
        tests={formData.ortho_tests ?? []}
        onChange={updateOrthoTests}
        disabled={isLocked}
      />

      {/* ── Section 5: Neurologische Untersuchung ── */}
      <NeurologieSection
        data={formData.neurologische_untersuchung ?? EMPTY_NEURO}
        onChange={updateNeuro}
        disabled={isLocked}
      />

      {/* ── Section 6: Trainingsempfehlung ── */}
      <ClinicalSection
        title="Trainingsempfehlung"
        description="Empfehlung basierend auf den Befunden"
        icon={GraduationCap}
        accent="emerald"
      >
        <Textarea
          id="trainingsempfehlung"
          placeholder="Empfehlung für das weitere Training basierend auf den Befunden..."
          value={formData.trainingsempfehlung}
          onChange={(e) => updateField("trainingsempfehlung", e.target.value)}
          disabled={isLocked}
          rows={4}
        />
      </ClinicalSection>

      {/* ── Action buttons ── */}
      {!isLocked && (
        <FormActions
          onSaveDraft={onSaveDraft}
          onFinalize={onFinish}
          saving={isSubmitting}
          backHref={`/os/patients/${patientId}?tab=dokumentation`}
        />
      )}
    </div>
  )
}
