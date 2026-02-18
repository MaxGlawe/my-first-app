"use client"

import Link from "next/link"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Card, CardContent } from "@/components/ui/card"
import { Skeleton } from "@/components/ui/skeleton"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { Separator } from "@/components/ui/separator"
import { useAnamnesisRecords } from "@/hooks/use-anamnesis"
import type { AnamnesisRecord } from "@/types/anamnesis"
import { Plus, FileText, ChevronRight } from "lucide-react"

interface AnamnesisTabProps {
  patientId: string
}

function AnamnesisCardSkeleton() {
  return (
    <div className="flex items-center justify-between p-4 border rounded-lg">
      <div className="space-y-2">
        <Skeleton className="h-4 w-40" />
        <Skeleton className="h-3 w-24" />
      </div>
      <Skeleton className="h-6 w-20 rounded-full" />
    </div>
  )
}

function AnamnesisCard({
  record,
  patientId,
}: {
  record: AnamnesisRecord
  patientId: string
}) {
  const date = new Date(record.created_at).toLocaleDateString("de-DE", {
    day: "2-digit",
    month: "2-digit",
    year: "numeric",
  })

  const time = new Date(record.created_at).toLocaleTimeString("de-DE", {
    hour: "2-digit",
    minute: "2-digit",
  })

  const hauptbeschwerde = record.data?.hauptbeschwerde
    ? record.data.hauptbeschwerde.length > 60
      ? record.data.hauptbeschwerde.slice(0, 60) + "…"
      : record.data.hauptbeschwerde
    : "Keine Hauptbeschwerde angegeben"

  return (
    <Link
      href={`/os/patients/${patientId}/anamnesis/${record.id}`}
      className="block"
    >
      <div className="flex items-start justify-between p-4 border rounded-lg hover:bg-muted/50 transition-colors group cursor-pointer">
        <div className="flex items-start gap-3 min-w-0">
          <div className="rounded-full bg-muted p-2 mt-0.5 shrink-0">
            <FileText className="h-4 w-4 text-muted-foreground" />
          </div>
          <div className="min-w-0">
            <div className="flex items-center gap-2 flex-wrap">
              <span className="text-sm font-medium">
                Version {record.version} — {date} {time}
              </span>
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
            <p className="text-xs text-muted-foreground mt-1 truncate">
              {hauptbeschwerde}
            </p>
            {record.created_by_name && (
              <p className="text-xs text-muted-foreground mt-0.5">
                Erstellt von: {record.created_by_name}
              </p>
            )}
          </div>
        </div>
        <ChevronRight className="h-4 w-4 text-muted-foreground shrink-0 mt-1 group-hover:text-foreground transition-colors" />
      </div>
    </Link>
  )
}

function EmptyState({ patientId }: { patientId: string }) {
  return (
    <Card className="border-dashed">
      <CardContent className="flex flex-col items-center justify-center py-16 text-center">
        <div className="rounded-full bg-muted p-4 mb-4">
          <FileText className="h-6 w-6 text-muted-foreground" />
        </div>
        <h3 className="font-semibold text-base">Noch kein Anamnesebogen vorhanden</h3>
        <p className="text-sm text-muted-foreground mt-1 max-w-xs">
          Erstelle den ersten Anamnesebogen für diesen Patienten.
        </p>
        <Button asChild className="mt-6">
          <Link href={`/os/patients/${patientId}/anamnesis/new`}>
            <Plus className="mr-2 h-4 w-4" />
            Erste Anamnese erstellen
          </Link>
        </Button>
      </CardContent>
    </Card>
  )
}

export function AnamnesisTab({ patientId }: AnamnesisTabProps) {
  const { records, isLoading, error, refresh } = useAnamnesisRecords(patientId)

  if (isLoading) {
    return (
      <div className="space-y-4">
        <div className="flex justify-between items-center">
          <Skeleton className="h-5 w-36" />
          <Skeleton className="h-9 w-40" />
        </div>
        <div className="space-y-3">
          {[1, 2, 3].map((i) => (
            <AnamnesisCardSkeleton key={i} />
          ))}
        </div>
      </div>
    )
  }

  if (error) {
    return (
      <div className="space-y-4">
        <Alert variant="destructive">
          <AlertDescription>{error}</AlertDescription>
        </Alert>
        <Button variant="outline" onClick={refresh}>
          Erneut versuchen
        </Button>
      </div>
    )
  }

  if (records.length === 0) {
    return <EmptyState patientId={patientId} />
  }

  return (
    <div className="space-y-4">
      <div className="flex justify-between items-center">
        <div>
          <h3 className="text-base font-semibold">Anamnesebögen</h3>
          <p className="text-xs text-muted-foreground mt-0.5">
            {records.length} {records.length === 1 ? "Eintrag" : "Einträge"}
          </p>
        </div>
        <Button asChild size="sm">
          <Link href={`/os/patients/${patientId}/anamnesis/new`}>
            <Plus className="mr-2 h-4 w-4" />
            Neue Anamnese
          </Link>
        </Button>
      </div>

      <Separator />

      <div className="space-y-3">
        {records.map((record) => (
          <AnamnesisCard key={record.id} record={record} patientId={patientId} />
        ))}
      </div>
    </div>
  )
}
