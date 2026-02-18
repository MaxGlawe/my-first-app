"use client"

import Link from "next/link"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Separator } from "@/components/ui/separator"
import { Card, CardContent } from "@/components/ui/card"
import type { DiagnoseRecord, DiagnoseSicherheitsgrad, DiagnoseEintrag } from "@/types/diagnose"
import { ArrowLeft, Download, Pencil } from "lucide-react"

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
      <p className="text-xs font-medium text-muted-foreground uppercase tracking-wide">
        {label}
      </p>
      <p className="text-sm whitespace-pre-wrap">
        {value || <span className="text-muted-foreground">—</span>}
      </p>
    </div>
  )
}

function SectionHeader({
  title,
  description,
}: {
  title: string
  description?: string
}) {
  return (
    <div>
      <h3 className="text-base font-semibold">{title}</h3>
      {description && (
        <p className="text-xs text-muted-foreground mt-0.5">{description}</p>
      )}
      <Separator className="mt-2" />
    </div>
  )
}

function SicherheitsgradBadge({ grad }: { grad: DiagnoseSicherheitsgrad }) {
  if (grad === "gesichert") {
    return (
      <Badge variant="outline" className="text-green-700 border-green-300 bg-green-50">
        Gesichert
      </Badge>
    )
  }
  if (grad === "verdacht") {
    return (
      <Badge variant="outline" className="text-amber-700 border-amber-300 bg-amber-50">
        Verdachtsdiagnose
      </Badge>
    )
  }
  return (
    <Badge variant="outline" className="text-slate-600 border-slate-300 bg-slate-50">
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
      <div className="p-3 border rounded-md bg-muted/20 space-y-1">
        <p className="text-xs font-medium text-muted-foreground">{label}</p>
        <p className="text-sm text-muted-foreground">Keine Diagnose angegeben</p>
      </div>
    )
  }

  return (
    <div className="p-3 border rounded-md bg-muted/20 space-y-2">
      <p className="text-xs font-medium text-muted-foreground">{label}</p>
      <div className="flex items-start gap-2 flex-wrap">
        {hasIcd && (
          <div className="flex items-center gap-2">
            <span className="font-mono text-sm font-semibold text-purple-700">
              {eintrag.icd10!.code}
            </span>
            <span className="text-sm">{eintrag.icd10!.bezeichnung}</span>
          </div>
        )}
        {!hasIcd && hasFreitext && (
          <span className="text-sm">{eintrag.freitextDiagnose}</span>
        )}
        <SicherheitsgradBadge grad={eintrag.sicherheitsgrad} />
      </div>
      {hasIcd && hasFreitext && (
        <p className="text-xs text-muted-foreground">
          Freitext: {eintrag.freitextDiagnose}
        </p>
      )}
      {eintrag.freitextNotiz && (
        <p className="text-sm text-muted-foreground italic">
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
    <div className="space-y-8">
      {/* ── Header ── */}
      <div className="flex items-start justify-between flex-wrap gap-4">
        <div>
          <div className="flex items-center gap-2 flex-wrap">
            <h2 className="text-lg font-semibold">Befundbericht</h2>
            {isDraft ? (
              <Badge variant="outline" className="text-amber-600 border-amber-300 bg-amber-50">
                Entwurf
              </Badge>
            ) : (
              <Badge variant="outline" className="text-green-600 border-green-300 bg-green-50">
                Abgeschlossen
              </Badge>
            )}
          </div>
          <p className="text-sm text-muted-foreground mt-1">
            Erstellt am {formattedDate}
            {record.created_by_name && ` von ${record.created_by_name}`}
          </p>
          {patientName && (
            <p className="text-sm text-muted-foreground">Patient: {patientName}</p>
          )}
        </div>

        <div className="flex items-center gap-2 print:hidden flex-wrap">
          {canEdit && isDraft && (
            <Button asChild variant="outline" size="sm">
              <Link href={`/os/patients/${patientId}/befund/${record.id}/edit`}>
                <Pencil className="mr-2 h-4 w-4" />
                Bearbeiten
              </Link>
            </Button>
          )}
          <Button variant="outline" size="sm" onClick={handlePdfExport}>
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

      <Separator />

      {/* ── Klinischer Befund ── */}
      <div className="space-y-4">
        <SectionHeader title="Klinischer Befund" />
        <ReadonlyField label="Befundbeschreibung" value={record.klinischer_befund} />
      </div>

      {/* ── Hauptdiagnose ── */}
      <div className="space-y-4">
        <SectionHeader title="Hauptdiagnose" />
        <DiagnoseBlock label="Hauptdiagnose" eintrag={record.hauptdiagnose} />
      </div>

      {/* ── Nebendiagnosen ── */}
      {record.nebendiagnosen && record.nebendiagnosen.length > 0 && (
        <div className="space-y-4">
          <SectionHeader
            title="Nebendiagnosen"
            description={`${record.nebendiagnosen.length} weitere ${record.nebendiagnosen.length === 1 ? "Diagnose" : "Diagnosen"}`}
          />
          <div className="space-y-3">
            {record.nebendiagnosen.map((n, i) => (
              <DiagnoseBlock
                key={i}
                label={`Nebendiagnose ${i + 1}`}
                eintrag={n}
              />
            ))}
          </div>
        </div>
      )}

      {/* ── Therapieziel & Prognose ── */}
      {(record.therapieziel || record.prognose) && (
        <div className="space-y-4">
          <SectionHeader title="Therapieziel & Prognose" />
          <div className="grid gap-4 sm:grid-cols-2">
            {record.therapieziel && (
              <ReadonlyField label="Therapieziel" value={record.therapieziel} />
            )}
            {record.prognose && (
              <ReadonlyField label="Prognose" value={record.prognose} />
            )}
          </div>
        </div>
      )}

      {/* ── Therapiedauer ── */}
      {record.therapiedauer_wochen !== null && record.therapiedauer_wochen !== undefined && (
        <div className="space-y-4">
          <SectionHeader title="Therapiedauer" />
          <p className="text-sm">
            <span className="font-semibold">{record.therapiedauer_wochen}</span>{" "}
            {record.therapiedauer_wochen === 1 ? "Woche" : "Wochen"}
          </p>
        </div>
      )}

      {/* ── Audit-Hinweis (Heilpraktiker-only) ── */}
      <Card className="border-dashed border-purple-200 bg-purple-50/30 print:hidden">
        <CardContent className="pt-4 pb-4">
          <p className="text-xs text-muted-foreground">
            Dieser Befundbericht wurde ausschließlich von einem Heilpraktiker für
            Physiotherapie erstellt (Rolle: <span className="font-mono">heilpraktiker</span>).
            Server-seitige RLS-Absicherung gewährleistet, dass keine anderen Rollen
            Befunde erstellen oder einsehen können.
          </p>
        </CardContent>
      </Card>
    </div>
  )
}
