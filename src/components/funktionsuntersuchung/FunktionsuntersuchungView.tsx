"use client"

import { useState, useEffect } from "react"
import Link from "next/link"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Printer, Edit } from "lucide-react"
import { ClinicalSection, ClinicalCard, StatusBadge } from "@/components/clinical-ui"
import type {
  FunktionsuntersuchungRecord,
  JandaTestCatalogEntry,
  OrthoTestCatalogEntry,
} from "@/types/funktionsuntersuchung"
import {
  JANDA_BEFUND_LABELS,
  JANDA_KATEGORIE_LABELS,
  ORTHO_BEFUND_LABELS,
} from "@/types/funktionsuntersuchung"

interface FunktionsuntersuchungViewProps {
  record: FunktionsuntersuchungRecord
  patientId: string
  patientName: string
  readOnly?: boolean
}

const DERMATOM_BEFUND_LABELS: Record<string, string> = {
  normal: "Normal",
  hyperaesthesie: "Hyperästhesie",
  hypaesthesie: "Hypästhesie",
  anaesthesie: "Anästhesie",
}

const REFLEX_BEFUND_LABELS: Record<string, string> = {
  normal: "Normal",
  abgeschwacht: "Abgeschwächt",
  gesteigert: "Gesteigert",
  fehlend: "Fehlend",
  pathologisch: "Pathologisch",
}

export function FunktionsuntersuchungView({
  record,
  patientId,
  patientName,
  readOnly,
}: FunktionsuntersuchungViewProps) {
  const [jandaCatalog, setJandaCatalog] = useState<JandaTestCatalogEntry[]>([])
  const [orthoCatalog, setOrthoCatalog] = useState<OrthoTestCatalogEntry[]>([])

  useEffect(() => {
    fetch("/api/janda-catalog")
      .then((res) => res.json())
      .then((json) => setJandaCatalog(json.tests ?? []))
      .catch(() => {})

    fetch("/api/ortho-catalog")
      .then((res) => res.json())
      .then((json) => setOrthoCatalog(json.tests ?? []))
      .catch(() => {})
  }, [])

  const data = record.data
  const canEdit = record.status === "entwurf" && !readOnly

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-start justify-between">
        <div>
          <h1 className="text-2xl font-bold tracking-tight">
            Funktionsuntersuchung V{record.version}
          </h1>
          <p className="text-muted-foreground mt-1">
            {patientName} —{" "}
            {new Date(record.created_at).toLocaleDateString("de-DE", {
              day: "2-digit",
              month: "2-digit",
              year: "numeric",
            })}
            {record.created_by_name && ` — von ${record.created_by_name}`}
          </p>
          <div className="mt-2">
            <StatusBadge status={record.status === "abgeschlossen" ? "abgeschlossen" : "entwurf"} />
          </div>
        </div>
        <div className="flex gap-2 print:hidden">
          {canEdit && (
            <Link href={`/os/patients/${patientId}/funktionsuntersuchung/${record.id}/edit`}>
              <Button variant="outline" size="sm">
                <Edit className="mr-2 h-4 w-4" />
                Bearbeiten
              </Button>
            </Link>
          )}
          <Button variant="outline" size="sm" onClick={() => window.print()}>
            <Printer className="mr-2 h-4 w-4" />
            Drucken
          </Button>
        </div>
      </div>

      {/* Allgemeine Angaben */}
      <ClinicalSection title="Allgemeine Angaben" flat>
        <div className="grid gap-4 sm:grid-cols-2">
          <ViewField label="Hauptbeschwerde" value={data.hauptbeschwerde} span={2} />
          <ViewField label="Beschwerdedauer" value={data.beschwerdedauer} />
          <ViewField label="Sportliche Aktivität" value={data.sportliche_aktivitaet} />
          <ViewField label="Trainingsziele" value={data.trainingsziele} span={2} />
        </div>
      </ClinicalSection>

      {/* Bewegungsanalyse */}
      {(data.haltungsanalyse || data.gangbildanalyse) && (
        <ClinicalSection title="Haltungs- & Bewegungsanalyse" flat>
          <div className="grid gap-4 sm:grid-cols-2">
            <ViewField label="Haltungsanalyse" value={data.haltungsanalyse} />
            <ViewField label="Gangbildanalyse" value={data.gangbildanalyse} />
          </div>
        </ClinicalSection>
      )}

      {/* Janda Tests */}
      {data.janda_tests.length > 0 && (
        <ClinicalSection
          title={`Muskelfunktionstests (${data.janda_tests.length})`}
          flat
        >
          <div className="space-y-2">
            {data.janda_tests.map((test) => {
              const entry = jandaCatalog.find((c) => c.id === test.catalog_id)
              return (
                <ClinicalCard key={test.catalog_id}>
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2 flex-wrap">
                      <span className="font-medium text-sm">
                        {entry?.test_name ?? test.catalog_id}
                      </span>
                      {entry && (
                        <>
                          <Badge variant="outline" className="text-xs">
                            {entry.muskel}
                          </Badge>
                          <Badge variant="secondary" className="text-xs">
                            {JANDA_KATEGORIE_LABELS[entry.kategorie]}
                          </Badge>
                        </>
                      )}
                    </div>
                    <Badge
                      variant={
                        test.befund === "normal"
                          ? "outline"
                          : test.befund === "leicht_auffaellig"
                          ? "secondary"
                          : "destructive"
                      }
                    >
                      {JANDA_BEFUND_LABELS[test.befund]}
                    </Badge>
                  </div>
                  {test.notiz && (
                    <p className="text-sm text-muted-foreground mt-2">{test.notiz}</p>
                  )}
                </ClinicalCard>
              )
            })}
          </div>
        </ClinicalSection>
      )}

      {/* Orthopädische Spezialtests */}
      {data.ortho_tests && data.ortho_tests.length > 0 && (
        <ClinicalSection
          title={`Orthopädische Spezialtests (${data.ortho_tests.length})`}
          flat
        >
          <div className="space-y-2">
            {data.ortho_tests.map((test) => {
              const entry = orthoCatalog.find((c) => c.id === test.catalog_id)
              return (
                <ClinicalCard
                  key={test.catalog_id}
                  warning={test.befund === "positiv"}
                >
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2 flex-wrap">
                      <span className="font-medium text-sm">
                        {entry?.test_name ?? test.catalog_id}
                      </span>
                      {entry && (
                        <Badge variant="outline" className="text-xs">
                          {entry.kategorie}
                        </Badge>
                      )}
                      {test.seite && (
                        <Badge variant="secondary" className="text-xs">
                          {test.seite}
                        </Badge>
                      )}
                    </div>
                    <Badge
                      variant={
                        test.befund === "negativ"
                          ? "outline"
                          : test.befund === "positiv"
                          ? "destructive"
                          : "secondary"
                      }
                    >
                      {ORTHO_BEFUND_LABELS[test.befund]}
                    </Badge>
                  </div>
                  {test.notiz && (
                    <p className="text-sm text-muted-foreground mt-2">{test.notiz}</p>
                  )}
                </ClinicalCard>
              )
            })}
          </div>
        </ClinicalSection>
      )}

      {/* Neurologische Untersuchung */}
      {data.neurologische_untersuchung && (
        <NeurologieViewSection neuro={data.neurologische_untersuchung} />
      )}

      {/* Trainingsempfehlung */}
      {data.trainingsempfehlung && (
        <ClinicalSection title="Trainingsempfehlung" flat>
          <p className="text-sm whitespace-pre-wrap">{data.trainingsempfehlung}</p>
        </ClinicalSection>
      )}
    </div>
  )
}

// ── Neurologie Sub-View ──

function NeurologieViewSection({
  neuro,
}: {
  neuro: NonNullable<FunktionsuntersuchungRecord["data"]["neurologische_untersuchung"]>
}) {
  const hasDermatome = neuro.dermatome && neuro.dermatome.length > 0
  const hasReflexe = neuro.reflexe && neuro.reflexe.length > 0
  const hasKennmuskeln = neuro.kennmuskeln && neuro.kennmuskeln.length > 0
  const hasContent =
    hasDermatome ||
    hasReflexe ||
    hasKennmuskeln ||
    neuro.koordination ||
    neuro.notizen

  if (!hasContent) return null

  return (
    <ClinicalSection title="Neurologische Untersuchung" flat>
      {hasDermatome && (
        <div className="space-y-2">
          <h4 className="text-sm font-semibold text-slate-700">Sensibilität (Dermatome)</h4>
          <div className="space-y-1.5">
            {neuro.dermatome.map((d, i) => (
              <ClinicalCard key={i} warning={d.befund !== "normal"}>
                <div className="flex items-center gap-3 text-sm">
                  <span className="font-medium w-10">{d.segment}</span>
                  <Badge variant="outline" className="text-xs">{d.seite}</Badge>
                  <Badge
                    variant={d.befund === "normal" ? "outline" : "destructive"}
                    className="text-xs"
                  >
                    {DERMATOM_BEFUND_LABELS[d.befund] ?? d.befund}
                  </Badge>
                </div>
              </ClinicalCard>
            ))}
          </div>
        </div>
      )}

      {hasReflexe && (
        <div className="space-y-2 pt-3">
          <h4 className="text-sm font-semibold text-slate-700">Reflexe</h4>
          <div className="space-y-1.5">
            {neuro.reflexe.map((r, i) => (
              <ClinicalCard key={i} warning={r.befund !== "normal"}>
                <div className="flex items-center gap-3 text-sm">
                  <span className="font-medium w-16">{r.reflex}</span>
                  <Badge variant="outline" className="text-xs">{r.seite}</Badge>
                  <Badge
                    variant={r.befund === "normal" ? "outline" : "destructive"}
                    className="text-xs"
                  >
                    {REFLEX_BEFUND_LABELS[r.befund] ?? r.befund}
                  </Badge>
                </div>
              </ClinicalCard>
            ))}
          </div>
        </div>
      )}

      {hasKennmuskeln && (
        <div className="space-y-2 pt-3">
          <h4 className="text-sm font-semibold text-slate-700">Kennmuskeln</h4>
          <div className="space-y-1.5">
            {neuro.kennmuskeln.map((k, i) => (
              <ClinicalCard key={i} warning={parseInt(k.kraftgrad) < 5}>
                <div className="flex items-center gap-3 text-sm">
                  <span className="font-medium w-10">{k.segment}</span>
                  <span className="text-muted-foreground text-xs flex-1">{k.muskel}</span>
                  <Badge variant="outline" className="text-xs">{k.seite}</Badge>
                  <Badge
                    variant={parseInt(k.kraftgrad) < 5 ? "destructive" : "outline"}
                    className="text-xs"
                  >
                    KG {k.kraftgrad}/5
                  </Badge>
                </div>
              </ClinicalCard>
            ))}
          </div>
        </div>
      )}

      {neuro.koordination && (
        <div className="pt-3">
          <ViewField label="Koordination / Gleichgewicht" value={neuro.koordination} />
        </div>
      )}

      {neuro.notizen && (
        <div className="pt-2">
          <ViewField label="Notizen" value={neuro.notizen} />
        </div>
      )}
    </ClinicalSection>
  )
}

// ── Helper ──

function ViewField({
  label,
  value,
  span,
}: {
  label: string
  value: string
  span?: number
}) {
  if (!value) return null
  return (
    <div className={span === 2 ? "sm:col-span-2" : ""}>
      <dt className="text-xs font-medium text-muted-foreground">{label}</dt>
      <dd className="text-sm mt-0.5 whitespace-pre-wrap">{value}</dd>
    </div>
  )
}
