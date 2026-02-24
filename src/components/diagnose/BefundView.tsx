"use client"

import Link from "next/link"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { ClinicalSection, StatusBadge } from "@/components/clinical-ui"
import type { DiagnoseRecord, DiagnoseSicherheitsgrad, DiagnoseEintrag } from "@/types/diagnose"
import { ArrowLeft, Download, Pencil, FileSearch, Stethoscope, Target, Clock, ShieldAlert } from "lucide-react"

interface BefundViewProps {
  record: DiagnoseRecord
  patientId: string
  patientName?: string
  canEdit?: boolean
}

// ── Helpers ───────────────────────────────────────────────────────────────────

function ReadonlyField({
  label,
  value,
}: {
  label: string
  value?: string | null
}) {
  return (
    <div className="space-y-1">
      <p className="text-xs font-medium text-slate-500 uppercase tracking-wide">
        {label}
      </p>
      <p className="text-sm whitespace-pre-wrap text-slate-700">
        {value || <span className="text-slate-400">&mdash;</span>}
      </p>
    </div>
  )
}

function SicherheitsgradBadge({ grad }: { grad: DiagnoseSicherheitsgrad }) {
  if (grad === "gesichert") {
    return (
      <Badge variant="outline" className="text-emerald-700 border-emerald-200 bg-emerald-50">
        Gesichert
      </Badge>
    )
  }
  if (grad === "verdacht") {
    return (
      <Badge variant="outline" className="text-amber-700 border-amber-200 bg-amber-50">
        Verdachtsdiagnose
      </Badge>
    )
  }
  return (
    <Badge variant="outline" className="text-slate-600 border-slate-200 bg-slate-50">
      Ausschlussdiagnose
    </Badge>
  )
}

function DiagnoseBlock({
  label,
  eintrag,
}: {
  label: string
  eintrag: DiagnoseEintrag
}) {
  const hasIcd = eintrag.icd10 && eintrag.icd10.code
  const hasFreitext = eintrag.freitextDiagnose

  if (!hasIcd && !hasFreitext) {
    return (
      <div className="p-4 bg-white/60 backdrop-blur-sm border border-slate-200/60 rounded-xl space-y-1">
        <p className="text-xs font-medium text-slate-500">{label}</p>
        <p className="text-sm text-slate-400">Keine Diagnose angegeben</p>
      </div>
    )
  }

  return (
    <div className="p-4 bg-white/60 backdrop-blur-sm border border-slate-200/60 rounded-xl space-y-2">
      <p className="text-xs font-medium text-slate-500">{label}</p>
      <div className="flex items-start gap-2 flex-wrap">
        {hasIcd && (
          <div className="flex items-center gap-2">
            <span className="font-mono text-sm font-semibold text-purple-700">
              {eintrag.icd10!.code}
            </span>
            <span className="text-sm text-slate-700">{eintrag.icd10!.bezeichnung}</span>
          </div>
        )}
        {!hasIcd && hasFreitext && (
          <span className="text-sm text-slate-700">{eintrag.freitextDiagnose}</span>
        )}
        <SicherheitsgradBadge grad={eintrag.sicherheitsgrad} />
      </div>
      {hasIcd && hasFreitext && (
        <p className="text-xs text-slate-500">
          Freitext: {eintrag.freitextDiagnose}
        </p>
      )}
      {eintrag.freitextNotiz && (
        <p className="text-sm text-slate-500 italic">
          {eintrag.freitextNotiz}
        </p>
      )}
    </div>
  )
}

// ── BefundView ────────────────────────────────────────────────────────────────

export function BefundView({
  record,
  patientId,
  patientName,
  canEdit = false,
}: BefundViewProps) {
  const formattedDate = new Date(record.created_at).toLocaleDateString("de-DE", {
    day: "2-digit",
    month: "long",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  })

  const handlePdfExport = () => {
    window.print()
  }

  const isDraft = record.status === "entwurf"

  return (
    <div className="space-y-6">
      {/* ── Header ── */}
      <div className="flex items-start justify-between flex-wrap gap-4">
        <div>
          <div className="flex items-center gap-2 flex-wrap">
            <h2 className="text-lg font-semibold text-slate-800">Befundbericht</h2>
            <StatusBadge status={isDraft ? "entwurf" : "abgeschlossen"} />
          </div>
          <p className="text-sm text-slate-500 mt-1">
            Erstellt am {formattedDate}
            {record.created_by_name && ` von ${record.created_by_name}`}
          </p>
          {patientName && (
            <p className="text-sm text-slate-500">Patient: {patientName}</p>
          )}
        </div>

        <div className="flex items-center gap-2 print:hidden flex-wrap">
          {canEdit && isDraft && (
            <Button asChild variant="outline" size="sm" className="border-slate-200/60">
              <Link href={`/os/patients/${patientId}/befund/${record.id}/edit`}>
                <Pencil className="mr-2 h-4 w-4" />
                Bearbeiten
              </Link>
            </Button>
          )}
          <Button variant="outline" size="sm" onClick={handlePdfExport} className="border-slate-200/60">
            <Download className="mr-2 h-4 w-4" />
            Als PDF exportieren
          </Button>
          <Button asChild variant="ghost" size="sm">
            <Link href={`/os/patients/${patientId}?tab=befund`}>
              <ArrowLeft className="mr-2 h-4 w-4" />
              Zurück
            </Link>
          </Button>
        </div>
      </div>

      {/* ── Klinischer Befund ── */}
      <ClinicalSection title="Klinischer Befund" icon={Stethoscope} accent="purple" flat>
        <ReadonlyField label="Befundbeschreibung" value={record.klinischer_befund} />
      </ClinicalSection>

      {/* ── Hauptdiagnose ── */}
      <ClinicalSection title="Hauptdiagnose" icon={FileSearch} accent="purple" flat>
        <DiagnoseBlock label="Hauptdiagnose" eintrag={record.hauptdiagnose} />
      </ClinicalSection>

      {/* ── Nebendiagnosen ── */}
      {record.nebendiagnosen && record.nebendiagnosen.length > 0 && (
        <ClinicalSection
          title="Nebendiagnosen"
          description={`${record.nebendiagnosen.length} weitere ${record.nebendiagnosen.length === 1 ? "Diagnose" : "Diagnosen"}`}
          icon={FileSearch}
          accent="blue"
          flat
        >
          <div className="space-y-3">
            {record.nebendiagnosen.map((n, i) => (
              <DiagnoseBlock
                key={i}
                label={`Nebendiagnose ${i + 1}`}
                eintrag={n}
              />
            ))}
          </div>
        </ClinicalSection>
      )}

      {/* ── Therapieziel & Prognose ── */}
      {(record.therapieziel || record.prognose) && (
        <ClinicalSection title="Therapieziel & Prognose" icon={Target} accent="emerald" flat>
          <div className="grid gap-4 sm:grid-cols-2">
            {record.therapieziel && (
              <ReadonlyField label="Therapieziel" value={record.therapieziel} />
            )}
            {record.prognose && (
              <ReadonlyField label="Prognose" value={record.prognose} />
            )}
          </div>
        </ClinicalSection>
      )}

      {/* ── Therapiedauer ── */}
      {record.therapiedauer_wochen !== null && record.therapiedauer_wochen !== undefined && (
        <ClinicalSection title="Therapiedauer" icon={Clock} accent="blue" flat>
          <p className="text-sm text-slate-700">
            <span className="font-semibold">{record.therapiedauer_wochen}</span>{" "}
            {record.therapiedauer_wochen === 1 ? "Woche" : "Wochen"}
          </p>
        </ClinicalSection>
      )}

      {/* ── Audit-Hinweis (Heilpraktiker-only) ── */}
      <div className="bg-purple-50/30 backdrop-blur-sm border border-dashed border-purple-200/60 rounded-2xl p-4 print:hidden">
        <div className="flex items-start gap-2">
          <ShieldAlert className="h-4 w-4 text-purple-400 mt-0.5 shrink-0" />
          <p className="text-xs text-slate-500">
            Dieser Befundbericht wurde ausschließlich von einem Heilpraktiker für
            Physiotherapie erstellt (Rolle: <span className="font-mono text-purple-600">heilpraktiker</span>).
            Server-seitige RLS-Absicherung gewährleistet, dass keine anderen Rollen
            Befunde erstellen oder einsehen können.
          </p>
        </div>
      </div>
    </div>
  )
}
