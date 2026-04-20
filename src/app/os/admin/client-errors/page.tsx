"use client"

import { useEffect, useMemo, useState } from "react"
import { Card, CardContent } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Input } from "@/components/ui/input"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import { Skeleton } from "@/components/ui/skeleton"
import {
  AlertTriangle,
  Check,
  ChevronDown,
  ChevronRight,
  RefreshCw,
  Search,
  ShieldCheck,
  Bug,
} from "lucide-react"
import { toast } from "sonner"

interface ClientError {
  id: string
  user_id: string | null
  user_email: string | null
  source: "error" | "unhandledrejection" | "errorboundary"
  message: string
  stack: string | null
  url: string | null
  user_agent: string | null
  ip: string | null
  lineno: number | null
  colno: number | null
  resolved_at: string | null
  created_at: string
}

const SOURCE_STYLE: Record<
  ClientError["source"],
  { label: string; class: string }
> = {
  error: { label: "JS Error", class: "bg-red-100 text-red-700 border-red-200" },
  unhandledrejection: {
    label: "Promise",
    class: "bg-amber-100 text-amber-700 border-amber-200",
  },
  errorboundary: {
    label: "React Crash",
    class: "bg-purple-100 text-purple-700 border-purple-200",
  },
}

function formatDateTime(iso: string): string {
  const d = new Date(iso)
  return d.toLocaleString("de-DE", {
    day: "2-digit",
    month: "2-digit",
    year: "2-digit",
    hour: "2-digit",
    minute: "2-digit",
  })
}

function shortBrowser(ua: string | null): string {
  if (!ua) return "?"
  if (/iPhone|iPad/.test(ua)) return "iOS"
  if (/Android/.test(ua)) return "Android"
  if (/Firefox/.test(ua)) return "Firefox"
  if (/Edg\//.test(ua)) return "Edge"
  if (/Chrome/.test(ua)) return "Chrome"
  if (/Safari/.test(ua)) return "Safari"
  return "Desktop"
}

export default function ClientErrorsPage() {
  const [errors, setErrors] = useState<ClientError[] | null>(null)
  const [isLoading, setIsLoading] = useState(true)
  const [range, setRange] = useState<"24h" | "7d" | "30d" | "all">("7d")
  const [resolved, setResolved] = useState<"unresolved" | "all">("unresolved")
  const [query, setQuery] = useState("")
  const [debouncedQuery, setDebouncedQuery] = useState("")
  const [expanded, setExpanded] = useState<Record<string, boolean>>({})

  useEffect(() => {
    const t = setTimeout(() => setDebouncedQuery(query), 250)
    return () => clearTimeout(t)
  }, [query])

  async function refresh() {
    setIsLoading(true)
    try {
      const params = new URLSearchParams({ range, resolved })
      if (debouncedQuery) params.set("q", debouncedQuery)
      const res = await fetch(`/api/admin/client-errors?${params.toString()}`)
      const json = await res.json()
      if (!res.ok) {
        toast.error(json.error ?? "Laden fehlgeschlagen.")
        setErrors([])
        return
      }
      setErrors(json)
    } catch {
      toast.error("Netzwerkfehler.")
      setErrors([])
    } finally {
      setIsLoading(false)
    }
  }

  useEffect(() => {
    refresh()
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [range, resolved, debouncedQuery])

  async function toggleResolved(id: string, currentlyResolved: boolean) {
    const res = await fetch(`/api/admin/client-errors/${id}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ resolved: !currentlyResolved }),
    })
    if (!res.ok) {
      toast.error("Speichern fehlgeschlagen.")
      return
    }
    toast.success(currentlyResolved ? "Als offen markiert." : "Als erledigt markiert.")
    refresh()
  }

  const grouped = useMemo(() => {
    if (!errors) return null
    const map = new Map<string, ClientError[]>()
    for (const e of errors) {
      const key = e.message.slice(0, 140)
      const list = map.get(key) ?? []
      list.push(e)
      map.set(key, list)
    }
    return Array.from(map.entries()).sort(
      (a, b) => b[1].length - a[1].length
    )
  }, [errors])

  return (
    <div className="container mx-auto py-8 px-4 max-w-6xl">
      <div className="mb-6 flex items-start justify-between gap-4 flex-wrap">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <Bug className="h-6 w-6 text-red-500" />
            <h1 className="text-2xl font-bold text-slate-800">Client-Fehler</h1>
          </div>
          <p className="text-sm text-slate-500">
            JavaScript-Fehler, die bei Nutzern im Browser aufgetreten sind.
          </p>
        </div>
        <Button
          variant="outline"
          onClick={refresh}
          disabled={isLoading}
          className="shrink-0"
        >
          <RefreshCw className={`h-4 w-4 mr-2 ${isLoading ? "animate-spin" : ""}`} />
          Aktualisieren
        </Button>
      </div>

      {/* Filters */}
      <Card className="mb-6 rounded-2xl">
        <CardContent className="pt-5">
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
            <div>
              <label className="text-xs font-medium text-slate-500 mb-1 block">
                Zeitraum
              </label>
              <Select value={range} onValueChange={(v) => setRange(v as typeof range)}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="24h">Letzte 24 Stunden</SelectItem>
                  <SelectItem value="7d">Letzte 7 Tage</SelectItem>
                  <SelectItem value="30d">Letzte 30 Tage</SelectItem>
                  <SelectItem value="all">Alle</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div>
              <label className="text-xs font-medium text-slate-500 mb-1 block">
                Status
              </label>
              <Select
                value={resolved}
                onValueChange={(v) => setResolved(v as typeof resolved)}
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="unresolved">Nur offene</SelectItem>
                  <SelectItem value="all">Alle (inkl. erledigte)</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div>
              <label className="text-xs font-medium text-slate-500 mb-1 block">
                Suche
              </label>
              <div className="relative">
                <Search className="h-4 w-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
                <Input
                  value={query}
                  onChange={(e) => setQuery(e.target.value)}
                  placeholder="Fehlermeldung, URL oder E-Mail"
                  className="pl-9"
                />
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* List */}
      {isLoading && !errors ? (
        <div className="space-y-3">
          <Skeleton className="h-24 w-full rounded-xl" />
          <Skeleton className="h-24 w-full rounded-xl" />
          <Skeleton className="h-24 w-full rounded-xl" />
        </div>
      ) : !errors || errors.length === 0 ? (
        <Card className="rounded-2xl">
          <CardContent className="py-16 text-center">
            <ShieldCheck className="h-12 w-12 text-emerald-500 mx-auto mb-3" />
            <p className="text-slate-700 font-semibold mb-1">Keine Fehler im Zeitraum</p>
            <p className="text-sm text-slate-500">
              Super — deine App läuft rund.
            </p>
          </CardContent>
        </Card>
      ) : (
        <div className="space-y-6">
          <p className="text-sm text-slate-500">
            {errors.length} {errors.length === 1 ? "Eintrag" : "Einträge"} —
            gruppiert nach Fehlermeldung
          </p>

          {grouped?.map(([messageKey, group]) => {
            const first = group[0]
            const allResolved = group.every((e) => e.resolved_at)
            const isExpanded = !!expanded[messageKey]
            const sourceStyle = SOURCE_STYLE[first.source]

            return (
              <Card
                key={messageKey}
                className={`rounded-2xl overflow-hidden ${
                  allResolved ? "opacity-60" : ""
                }`}
              >
                <CardContent className="p-0">
                  <button
                    onClick={() =>
                      setExpanded((prev) => ({
                        ...prev,
                        [messageKey]: !prev[messageKey],
                      }))
                    }
                    className="w-full text-left p-5 hover:bg-slate-50 transition-colors"
                  >
                    <div className="flex items-start gap-3">
                      <div className="mt-0.5 shrink-0">
                        {isExpanded ? (
                          <ChevronDown className="h-5 w-5 text-slate-400" />
                        ) : (
                          <ChevronRight className="h-5 w-5 text-slate-400" />
                        )}
                      </div>
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2 flex-wrap mb-1.5">
                          <Badge className={`${sourceStyle.class} border`}>
                            {sourceStyle.label}
                          </Badge>
                          <Badge variant="outline">
                            {group.length}×
                          </Badge>
                          {allResolved && (
                            <Badge className="bg-emerald-100 text-emerald-700 border-emerald-200 border">
                              Erledigt
                            </Badge>
                          )}
                        </div>
                        <p className="font-mono text-sm text-slate-800 break-all leading-relaxed">
                          {first.message}
                        </p>
                        <p className="text-xs text-slate-500 mt-1.5">
                          Zuletzt: {formatDateTime(first.created_at)}
                          {" · "}
                          {group.filter((e) => e.user_email).length > 0 &&
                            `${new Set(group.map((e) => e.user_email).filter(Boolean)).size} Nutzer betroffen · `}
                          erstmals: {formatDateTime(group[group.length - 1].created_at)}
                        </p>
                      </div>
                    </div>
                  </button>

                  {isExpanded && (
                    <div className="border-t border-slate-100 bg-slate-50/60 px-5 py-4 space-y-4">
                      {group.map((err) => (
                        <div
                          key={err.id}
                          className="bg-white border border-slate-200 rounded-lg p-4 text-sm"
                        >
                          <div className="flex items-start justify-between gap-3 mb-3 flex-wrap">
                            <div className="flex items-center gap-2 text-xs text-slate-500 flex-wrap">
                              <span className="font-medium text-slate-700">
                                {formatDateTime(err.created_at)}
                              </span>
                              <span>·</span>
                              <span>{err.user_email ?? <em className="text-slate-400">anonym</em>}</span>
                              <span>·</span>
                              <span>{shortBrowser(err.user_agent)}</span>
                              {err.ip && (
                                <>
                                  <span>·</span>
                                  <span className="font-mono">{err.ip}</span>
                                </>
                              )}
                            </div>
                            <Button
                              variant="outline"
                              size="sm"
                              onClick={() => toggleResolved(err.id, !!err.resolved_at)}
                              className="h-7 text-xs shrink-0"
                            >
                              {err.resolved_at ? (
                                <>
                                  <AlertTriangle className="h-3 w-3 mr-1" />
                                  Wieder öffnen
                                </>
                              ) : (
                                <>
                                  <Check className="h-3 w-3 mr-1" />
                                  Erledigt
                                </>
                              )}
                            </Button>
                          </div>
                          {err.url && (
                            <div className="mb-2">
                              <span className="text-xs text-slate-500">URL: </span>
                              <span className="font-mono text-xs text-slate-700 break-all">
                                {err.url}
                              </span>
                            </div>
                          )}
                          {err.stack && (
                            <details className="mt-2">
                              <summary className="text-xs text-slate-500 cursor-pointer hover:text-slate-700">
                                Stacktrace
                              </summary>
                              <pre className="mt-2 text-[11px] bg-slate-900 text-slate-100 rounded p-3 overflow-x-auto whitespace-pre-wrap break-all">
                                {err.stack}
                              </pre>
                            </details>
                          )}
                          {err.user_agent && (
                            <details className="mt-2">
                              <summary className="text-xs text-slate-500 cursor-pointer hover:text-slate-700">
                                User-Agent
                              </summary>
                              <p className="mt-1 text-[11px] font-mono text-slate-500 break-all">
                                {err.user_agent}
                              </p>
                            </details>
                          )}
                        </div>
                      ))}
                    </div>
                  )}
                </CardContent>
              </Card>
            )
          })}
        </div>
      )}
    </div>
  )
}
