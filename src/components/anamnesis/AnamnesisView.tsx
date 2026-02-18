"use client"

import Link from "next/link"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Separator } from "@/components/ui/separator"
import { Card, CardContent } from "@/components/ui/card"
import { BodySchema } from "./BodySchema"
import type { AnamnesisRecord } from "@/types/anamnesis"
import { ArrowLeft, Download } from "lucide-react"

interface AnamnesisViewProps {
  record: AnamnesisRecord
  patientId: string
  patientName?: string
}

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
      <p className="text-sm">
        {value || <span className="text-muted-foreground">—</span>}
      </p>
    </div>
  )
}

function SectionHeader({ title, description }: { title: string; description?: string }) {
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

function NrsDisplay({ value }: { value: number }) {
  const color =
    value <= 3
      ? "text-green-600 border-green-300 bg-green-50"
      : value <= 6
      ? "text-amber-600 border-amber-300 bg-amber-50"
      : "text-red-600 border-red-300 bg-red-50"

  return (
    <div className="flex items-center gap-3">
      <Badge variant="outline" className={`text-2xl font-bold px-6 py-2 ${color}`}>
        {value} / 10
      </Badge>
      <span className="text-sm text-muted-foreground">
        {value === 0
          ? "Kein Schmerz"
          : value <= 3
          ? "Leichter Schmerz"
          : value <= 6
          ? "Mäßiger Schmerz"
          : "Starker Schmerz"}
      </span>
    </div>
  )
}

export function AnamnesisView({ record, patientId, patientName }: AnamnesisViewProps) {
  const { data } = record

  const formattedDate = new Date(record.created_at).toLocaleDateString("de-DE", {
    day: "2-digit",
    month: "long",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  })

  const handlePdfExport = () => {
    // PDF export is handled server-side in the backend phase.
    // For now, the browser's print dialog can render the page as PDF.
    window.print()
  }

  const vorerkrankungenList = [
    ...(data.vorerkrankungen ?? []),
    ...(data.vorerkrankungenFreitext
      ? [data.vorerkrankungenFreitext]
      : []),
  ]

  return (
    <div className="space-y-8">
      {/* ── Header ── */}
      <div className="flex items-start justify-between flex-wrap gap-4">
        <div>
          <div className="flex items-center gap-2 flex-wrap">
            <h2 className="text-lg font-semibold">
              Anamnesebogen Version {record.version}
            </h2>
            {record.status === "entwurf" ? (
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
        <div className="flex items-center gap-2 print:hidden">
          <Button variant="outline" size="sm" onClick={handlePdfExport}>
            <Download className="mr-2 h-4 w-4" />
            Als PDF exportieren
          </Button>
          <Button asChild variant="ghost" size="sm">
            <Link href={`/os/patients/${patientId}?tab=dokumentation`}>
              <ArrowLeft className="mr-2 h-4 w-4" />
              Zurück
            </Link>
          </Button>
        </div>
      </div>

      <Separator />

      {/* ── Hauptbeschwerde ── */}
      <div className="space-y-4">
        <SectionHeader title="Hauptbeschwerde" />
        <div className="grid gap-4 sm:grid-cols-3">
          <div className="sm:col-span-3">
            <ReadonlyField label="Hauptbeschwerde" value={data.hauptbeschwerde} />
          </div>
          <ReadonlyField label="Schmerzdauer" value={data.schmerzdauer} />
          <ReadonlyField label="Schmerzcharakter" value={data.schmerzcharakter} />
        </div>
      </div>

      {/* ── Schmerzintensität ── */}
      <div className="space-y-4">
        <SectionHeader title="Schmerzintensität (NRS)" />
        <NrsDisplay value={data.nrs ?? 0} />
      </div>

      {/* ── Schmerzlokalisation ── */}
      <div className="space-y-4">
        <SectionHeader title="Schmerzlokalisation" />
        <BodySchema
          value={data.schmerzlokalisation ?? []}
          readOnly
        />
      </div>

      {/* ── Vorerkrankungen ── */}
      <div className="space-y-4">
        <SectionHeader title="Vorerkrankungen" />
        {data.keineVorerkrankungen ? (
          <p className="text-sm text-muted-foreground">
            Keine bekannten Vorerkrankungen
          </p>
        ) : vorerkrankungenList.length > 0 ? (
          <div className="flex flex-wrap gap-2">
            {vorerkrankungenList.map((v, i) => (
              <Badge key={i} variant="secondary">
                {v}
              </Badge>
            ))}
          </div>
        ) : (
          <p className="text-sm text-muted-foreground">Keine Angabe</p>
        )}
      </div>

      {/* ── Medikamente ── */}
      <div className="space-y-4">
        <SectionHeader title="Aktuelle Medikamente" />
        <ReadonlyField
          label="Medikamente"
          value={data.medikamente || "Keine Angabe"}
        />
      </div>

      {/* ── Bewegungsausmaß ── */}
      <div className="space-y-4">
        <SectionHeader title="Bewegungsausmaß" />
        {(data.bewegungsausmass ?? []).length === 0 ? (
          <p className="text-sm text-muted-foreground">Keine Messungen dokumentiert.</p>
        ) : (
          <div className="border rounded-md overflow-hidden">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b bg-muted/50">
                  <th className="text-left px-4 py-2 font-medium text-muted-foreground">
                    Gelenk
                  </th>
                  <th className="text-left px-4 py-2 font-medium text-muted-foreground">
                    Bewegungsrichtung
                  </th>
                  <th className="text-left px-4 py-2 font-medium text-muted-foreground">
                    Grad
                  </th>
                </tr>
              </thead>
              <tbody>
                {data.bewegungsausmass.map((entry, i) => (
                  <tr key={entry.id ?? i} className="border-b last:border-0">
                    <td className="px-4 py-2">{entry.gelenk}</td>
                    <td className="px-4 py-2">{entry.richtung}</td>
                    <td className="px-4 py-2">{entry.grad}°</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* ── Kraftgrad nach Janda ── */}
      <div className="space-y-4">
        <SectionHeader title="Kraftgrad nach Janda" />
        {(data.kraftgrad ?? []).length === 0 ? (
          <p className="text-sm text-muted-foreground">
            Keine Kraftgradmessungen dokumentiert.
          </p>
        ) : (
          <div className="border rounded-md overflow-hidden">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b bg-muted/50">
                  <th className="text-left px-4 py-2 font-medium text-muted-foreground">
                    Muskelgruppe
                  </th>
                  <th className="text-left px-4 py-2 font-medium text-muted-foreground">
                    Kraftgrad
                  </th>
                </tr>
              </thead>
              <tbody>
                {data.kraftgrad.map((entry, i) => (
                  <tr key={entry.id ?? i} className="border-b last:border-0">
                    <td className="px-4 py-2">{entry.muskelgruppe}</td>
                    <td className="px-4 py-2">Grad {entry.grad}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* ── Heilpraktiker-Felder (nur wenn befüllt) ── */}
      {(data.differentialdiagnosen || data.erweiterte_tests) && (
        <Card className="border-dashed border-purple-200 bg-purple-50/30">
          <CardContent className="pt-6 space-y-6">
            {data.differentialdiagnosen && (
              <div className="space-y-4">
                <SectionHeader
                  title="Differentialdiagnosen"
                  description="Heilpraktiker-Dokumentation"
                />
                <p className="text-sm whitespace-pre-wrap">{data.differentialdiagnosen}</p>
              </div>
            )}
            {data.erweiterte_tests && (
              <div className="space-y-4">
                <SectionHeader
                  title="Erweiterte orthopädische Tests"
                  description="Heilpraktiker-Dokumentation"
                />
                <p className="text-sm whitespace-pre-wrap">{data.erweiterte_tests}</p>
              </div>
            )}
          </CardContent>
        </Card>
      )}
    </div>
  )
}
