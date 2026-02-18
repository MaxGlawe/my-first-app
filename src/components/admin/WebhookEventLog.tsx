"use client"

import { useState } from "react"
import { useWebhookEvents, type WebhookEvent } from "@/hooks/use-appointments"
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Skeleton } from "@/components/ui/skeleton"
import { Alert, AlertDescription } from "@/components/ui/alert"
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog"
import {
  Activity,
  RefreshCw,
  CheckCircle2,
  XCircle,
  Copy,
  AlertTriangle,
} from "lucide-react"
import { toast } from "sonner"
import { ScrollArea } from "@/components/ui/scroll-area"

function formatTimestamp(iso: string): string {
  return new Date(iso).toLocaleString("de-DE", {
    day: "2-digit",
    month: "2-digit",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
    second: "2-digit",
  })
}

function getStatusBadge(status: WebhookEvent["processing_status"]) {
  switch (status) {
    case "success":
      return (
        <Badge className="bg-green-100 text-green-800 hover:bg-green-100 gap-1">
          <CheckCircle2 className="h-3 w-3" />
          Erfolg
        </Badge>
      )
    case "error":
      return (
        <Badge variant="destructive" className="gap-1">
          <XCircle className="h-3 w-3" />
          Fehler
        </Badge>
      )
    case "duplicate":
      return (
        <Badge variant="secondary" className="gap-1">
          <Copy className="h-3 w-3" />
          Duplikat
        </Badge>
      )
    default:
      return <Badge variant="outline">{status}</Badge>
  }
}

function getEventTypeBadge(eventType: string) {
  if (eventType.startsWith("patient.")) {
    return (
      <Badge variant="outline" className="font-mono text-xs text-blue-700 border-blue-200 bg-blue-50">
        {eventType}
      </Badge>
    )
  }
  if (eventType.startsWith("appointment.")) {
    return (
      <Badge variant="outline" className="font-mono text-xs text-purple-700 border-purple-200 bg-purple-50">
        {eventType}
      </Badge>
    )
  }
  return (
    <Badge variant="outline" className="font-mono text-xs">
      {eventType}
    </Badge>
  )
}

function PayloadDialog({ event }: { event: WebhookEvent }) {
  const handleCopy = async () => {
    try {
      await navigator.clipboard.writeText(JSON.stringify(event.payload, null, 2))
      toast.success("Payload kopiert.")
    } catch {
      toast.error("Konnte nicht kopiert werden.")
    }
  }

  return (
    <Dialog>
      <DialogTrigger asChild>
        <Button variant="ghost" size="sm" className="h-7 text-xs">
          Payload
        </Button>
      </DialogTrigger>
      <DialogContent className="max-w-2xl">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            {getEventTypeBadge(event.event_type)}
            <span className="text-muted-foreground font-normal text-sm">
              {formatTimestamp(event.received_at)}
            </span>
          </DialogTitle>
          <DialogDescription>
            Event-ID: <code className="font-mono text-xs">{event.id}</code>
            {event.error_message && (
              <span className="block mt-1 text-destructive">{event.error_message}</span>
            )}
          </DialogDescription>
        </DialogHeader>
        <div className="relative">
          <Button
            variant="outline"
            size="sm"
            className="absolute top-2 right-2 h-7 text-xs z-10"
            onClick={handleCopy}
          >
            <Copy className="h-3 w-3 mr-1" />
            Kopieren
          </Button>
          <ScrollArea className="h-80 rounded-md border bg-muted p-4">
            <pre className="text-xs font-mono whitespace-pre-wrap break-all">
              {JSON.stringify(event.payload, null, 2)}
            </pre>
          </ScrollArea>
        </div>
      </DialogContent>
    </Dialog>
  )
}

function EventTableSkeleton() {
  return (
    <>
      {Array.from({ length: 5 }).map((_, i) => (
        <TableRow key={i}>
          <TableCell>
            <Skeleton className="h-4 w-32" />
          </TableCell>
          <TableCell>
            <Skeleton className="h-5 w-28 rounded-full" />
          </TableCell>
          <TableCell>
            <Skeleton className="h-5 w-16 rounded-full" />
          </TableCell>
          <TableCell>
            <Skeleton className="h-4 w-20" />
          </TableCell>
        </TableRow>
      ))}
    </>
  )
}

export function WebhookEventLog() {
  const { events, isLoading, error, refresh } = useWebhookEvents()
  const [isRefreshing, setIsRefreshing] = useState(false)

  const handleRefresh = async () => {
    setIsRefreshing(true)
    refresh()
    // Brief visual feedback
    setTimeout(() => setIsRefreshing(false), 800)
  }

  const successCount = events.filter((e) => e.processing_status === "success").length
  const errorCount = events.filter((e) => e.processing_status === "error").length

  return (
    <Card>
      <CardHeader>
        <div className="flex flex-col gap-2 sm:flex-row sm:items-start sm:justify-between">
          <div>
            <CardTitle className="flex items-center gap-2">
              <Activity className="h-5 w-5 text-purple-500" />
              Webhook-Event-Log
            </CardTitle>
            <CardDescription className="mt-1">
              Letzte 50 empfangene Events vom Buchungstool (unveränderliches
              Audit-Log, DSGVO-konform)
            </CardDescription>
          </div>
          <div className="flex items-center gap-3">
            {!isLoading && events.length > 0 && (
              <div className="flex gap-2 text-sm">
                <Badge className="bg-green-100 text-green-800 hover:bg-green-100">
                  {successCount} OK
                </Badge>
                {errorCount > 0 && (
                  <Badge variant="destructive">{errorCount} Fehler</Badge>
                )}
              </div>
            )}
            <Button
              variant="outline"
              size="sm"
              onClick={handleRefresh}
              disabled={isLoading || isRefreshing}
              aria-label="Event-Log aktualisieren"
            >
              <RefreshCw
                className={`h-4 w-4 ${isLoading || isRefreshing ? "animate-spin" : ""}`}
              />
            </Button>
          </div>
        </div>
      </CardHeader>
      <CardContent>
        {error && (
          <Alert variant="destructive" className="mb-4">
            <AlertTriangle className="h-4 w-4" />
            <AlertDescription>{error}</AlertDescription>
          </Alert>
        )}

        <div className="rounded-md border overflow-hidden">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Zeitstempel</TableHead>
                <TableHead>Event-Typ</TableHead>
                <TableHead>Status</TableHead>
                <TableHead className="text-right">Payload</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {isLoading ? (
                <EventTableSkeleton />
              ) : events.length === 0 ? (
                <TableRow>
                  <TableCell
                    colSpan={4}
                    className="text-center py-10 text-muted-foreground text-sm"
                  >
                    Noch keine Events empfangen. Stelle sicher, dass das
                    Buchungstool konfiguriert ist.
                  </TableCell>
                </TableRow>
              ) : (
                events.map((event) => (
                  <TableRow
                    key={event.id}
                    className={
                      event.processing_status === "error"
                        ? "bg-red-50/50"
                        : undefined
                    }
                  >
                    <TableCell className="text-xs text-muted-foreground whitespace-nowrap">
                      {formatTimestamp(event.received_at)}
                    </TableCell>
                    <TableCell>{getEventTypeBadge(event.event_type)}</TableCell>
                    <TableCell>{getStatusBadge(event.processing_status)}</TableCell>
                    <TableCell className="text-right">
                      <PayloadDialog event={event} />
                    </TableCell>
                  </TableRow>
                ))
              )}
            </TableBody>
          </Table>
        </div>

        {!isLoading && events.length > 0 && (
          <p className="text-xs text-muted-foreground mt-3">
            Es werden maximal 50 Events angezeigt.
          </p>
        )}
      </CardContent>
    </Card>
  )
}
