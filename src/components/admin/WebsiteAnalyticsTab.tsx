"use client"

import { useEffect, useState } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import {
  Globe,
  Eye,
  MousePointerClick,
  Clock,
  Smartphone,
  Monitor,
  Tablet,
  TrendingUp,
  TrendingDown,
  ArrowRight,
} from "lucide-react"

interface WebsiteSummary {
  kpi: {
    total_visitors: number
    total_pageviews: number
    total_conversions: number
    conversion_rate: number
    avg_duration_seconds: number
    today_visitors: number
    yesterday_visitors: number
  }
  daily: { date: string; visitors: number; pageviews: number }[]
  top_pages: { path: string; count: number }[]
  traffic_sources: { source: string; count: number }[]
  devices: Record<string, number>
  browsers: { browser: string; count: number }[]
  campaigns: { campaign: string; count: number }[]
  conversions_by_type: Record<string, number>
}

const CONVERSION_LABELS: Record<string, string> = {
  anfrage_opened: "Anfrage geöffnet",
  anfrage_submitted: "Anfrage abgesendet",
  cta_click: "CTA-Klick",
  scroll_to_pricing: "Preise angesehen",
}

const DEVICE_ICONS: Record<string, React.ReactNode> = {
  mobile: <Smartphone className="h-4 w-4" />,
  tablet: <Tablet className="h-4 w-4" />,
  desktop: <Monitor className="h-4 w-4" />,
}

const DEVICE_LABELS: Record<string, string> = {
  mobile: "Mobil",
  tablet: "Tablet",
  desktop: "Desktop",
}

function formatDuration(seconds: number): string {
  if (seconds < 60) return `${seconds}s`
  const min = Math.floor(seconds / 60)
  const sec = seconds % 60
  return `${min}:${sec.toString().padStart(2, "0")} Min`
}

function formatPath(path: string): string {
  if (path === "/") return "Startseite"
  return path
}

export function WebsiteAnalyticsTab() {
  const [data, setData] = useState<WebsiteSummary | null>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    fetch("/api/analytics/website-summary")
      .then((res) => res.json())
      .then(setData)
      .catch(console.error)
      .finally(() => setLoading(false))
  }, [])

  if (loading) {
    return (
      <div className="py-8 text-center text-muted-foreground">
        Lade Website-Statistiken...
      </div>
    )
  }

  if (!data) {
    return (
      <div className="py-8 text-center text-muted-foreground">
        Daten konnten nicht geladen werden.
      </div>
    )
  }

  const { kpi, daily, top_pages, traffic_sources, devices, browsers, campaigns, conversions_by_type } = data

  // Chart values
  const maxDaily = Math.max(...daily.map((d) => d.visitors), 1)

  // Today vs yesterday trend
  const trend = kpi.today_visitors - kpi.yesterday_visitors
  const trendPercent =
    kpi.yesterday_visitors > 0
      ? Math.round((trend / kpi.yesterday_visitors) * 100)
      : kpi.today_visitors > 0
        ? 100
        : 0

  // Total devices for percentage
  const totalDevices = Object.values(devices).reduce((a, b) => a + b, 0)

  return (
    <div className="space-y-6">
      {/* KPI Cards */}
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-5">
        <Card>
          <CardHeader className="pb-2">
            <CardDescription className="flex items-center gap-1.5">
              <Globe className="h-4 w-4" />
              Besucher (30 Tage)
            </CardDescription>
          </CardHeader>
          <CardContent>
            <p className="text-3xl font-bold">{kpi.total_visitors.toLocaleString("de-DE")}</p>
            <div className="flex items-center gap-1 mt-1">
              {trend >= 0 ? (
                <TrendingUp className="h-3.5 w-3.5 text-emerald-600" />
              ) : (
                <TrendingDown className="h-3.5 w-3.5 text-red-500" />
              )}
              <span className={`text-xs font-medium ${trend >= 0 ? "text-emerald-600" : "text-red-500"}`}>
                {trend >= 0 ? "+" : ""}{trendPercent}% vs. gestern
              </span>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-2">
            <CardDescription className="flex items-center gap-1.5">
              <Eye className="h-4 w-4" />
              Seitenaufrufe
            </CardDescription>
          </CardHeader>
          <CardContent>
            <p className="text-3xl font-bold">{kpi.total_pageviews.toLocaleString("de-DE")}</p>
            <p className="text-xs text-muted-foreground mt-1">
              {kpi.total_visitors > 0
                ? `Ø ${(kpi.total_pageviews / kpi.total_visitors).toFixed(1)} pro Besucher`
                : "–"}
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-2">
            <CardDescription className="flex items-center gap-1.5">
              <MousePointerClick className="h-4 w-4" />
              Conversions
            </CardDescription>
          </CardHeader>
          <CardContent>
            <p className="text-3xl font-bold">{kpi.total_conversions}</p>
            <p className="text-xs text-muted-foreground mt-1">
              {kpi.conversion_rate}% Conversion-Rate
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-2">
            <CardDescription className="flex items-center gap-1.5">
              <Clock className="h-4 w-4" />
              Ø Verweildauer
            </CardDescription>
          </CardHeader>
          <CardContent>
            <p className="text-3xl font-bold">{formatDuration(kpi.avg_duration_seconds)}</p>
            <p className="text-xs text-muted-foreground mt-1">pro Seitenaufruf</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-2">
            <CardDescription className="flex items-center gap-1.5">
              <TrendingUp className="h-4 w-4" />
              Heute
            </CardDescription>
          </CardHeader>
          <CardContent>
            <p className="text-3xl font-bold">{kpi.today_visitors}</p>
            <p className="text-xs text-muted-foreground mt-1">
              Gestern: {kpi.yesterday_visitors}
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Visitors Chart + Conversions */}
      <div className="grid gap-6 lg:grid-cols-3">
        <Card className="lg:col-span-2">
          <CardHeader>
            <CardTitle className="text-lg">Besucher (letzte 30 Tage)</CardTitle>
          </CardHeader>
          <CardContent>
            {kpi.total_visitors === 0 ? (
              <p className="text-sm text-muted-foreground py-8 text-center">
                Noch keine Besucher erfasst. Das Tracking startet automatisch nach dem Deployment.
              </p>
            ) : (
              <div className="flex items-end gap-[3px] h-44">
                {daily.map((d) => {
                  const dayLabel = new Date(d.date + "T12:00:00").toLocaleDateString("de-DE", { day: "2-digit", month: "2-digit" })
                  const isToday = d.date === new Date().toISOString().split("T")[0]
                  return (
                    <div
                      key={d.date}
                      className="flex-1 flex flex-col items-center gap-0.5 group"
                      title={`${dayLabel}: ${d.visitors} Besucher, ${d.pageviews} Aufrufe`}
                    >
                      <span className="text-[10px] text-muted-foreground opacity-0 group-hover:opacity-100 transition-opacity">
                        {d.visitors}
                      </span>
                      <div
                        className={`w-full rounded-t transition-colors ${
                          isToday ? "bg-emerald-400" : "bg-emerald-500 group-hover:bg-emerald-400"
                        }`}
                        style={{ height: `${Math.max((d.visitors / maxDaily) * 140, 2)}px` }}
                      />
                    </div>
                  )
                })}
              </div>
            )}
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="text-lg">Conversions</CardTitle>
          </CardHeader>
          <CardContent>
            {Object.keys(conversions_by_type).length === 0 ? (
              <p className="text-sm text-muted-foreground py-8 text-center">
                Noch keine Conversions.
              </p>
            ) : (
              <div className="space-y-3">
                {Object.entries(conversions_by_type)
                  .sort((a, b) => b[1] - a[1])
                  .map(([type, count]) => (
                    <div key={type} className="flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <ArrowRight className="h-3.5 w-3.5 text-emerald-600" />
                        <span className="text-sm">{CONVERSION_LABELS[type] ?? type}</span>
                      </div>
                      <Badge variant="secondary">{count}</Badge>
                    </div>
                  ))}
              </div>
            )}
          </CardContent>
        </Card>
      </div>

      {/* Top Pages + Traffic Sources */}
      <div className="grid gap-6 lg:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle className="text-lg">Top-Seiten</CardTitle>
          </CardHeader>
          <CardContent>
            {top_pages.length === 0 ? (
              <p className="text-sm text-muted-foreground py-4 text-center">Keine Daten.</p>
            ) : (
              <div className="space-y-2">
                {top_pages.map((p, i) => (
                  <div key={p.path} className="flex items-center justify-between py-1.5">
                    <div className="flex items-center gap-2 min-w-0">
                      <span className="text-xs text-muted-foreground w-5 text-right shrink-0">{i + 1}.</span>
                      <span className="text-sm truncate font-mono">{formatPath(p.path)}</span>
                    </div>
                    <Badge variant="outline" className="shrink-0 ml-2">{p.count}</Badge>
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="text-lg">Traffic-Quellen</CardTitle>
          </CardHeader>
          <CardContent>
            {traffic_sources.length === 0 ? (
              <p className="text-sm text-muted-foreground py-4 text-center">Keine Daten.</p>
            ) : (
              <div className="space-y-2">
                {traffic_sources.map((s) => (
                  <div key={s.source} className="flex items-center justify-between py-1.5">
                    <span className="text-sm truncate">{s.source}</span>
                    <Badge variant="outline" className="shrink-0 ml-2">{s.count}</Badge>
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>
      </div>

      {/* Devices + Browsers + Campaigns */}
      <div className="grid gap-6 lg:grid-cols-3">
        <Card>
          <CardHeader>
            <CardTitle className="text-lg">Geräte</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {Object.entries(devices).map(([device, count]) => {
                const pct = totalDevices > 0 ? Math.round((count / totalDevices) * 100) : 0
                return (
                  <div key={device}>
                    <div className="flex items-center justify-between mb-1">
                      <div className="flex items-center gap-2">
                        {DEVICE_ICONS[device]}
                        <span className="text-sm">{DEVICE_LABELS[device] ?? device}</span>
                      </div>
                      <span className="text-sm text-muted-foreground">{pct}%</span>
                    </div>
                    <div className="h-2 bg-slate-100 rounded-full overflow-hidden">
                      <div
                        className="h-full bg-emerald-500 rounded-full transition-all"
                        style={{ width: `${pct}%` }}
                      />
                    </div>
                  </div>
                )
              })}
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="text-lg">Browser</CardTitle>
          </CardHeader>
          <CardContent>
            {browsers.length === 0 ? (
              <p className="text-sm text-muted-foreground py-4 text-center">Keine Daten.</p>
            ) : (
              <div className="space-y-2">
                {browsers.map((b) => (
                  <div key={b.browser} className="flex items-center justify-between py-1">
                    <span className="text-sm">{b.browser}</span>
                    <Badge variant="secondary">{b.count}</Badge>
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="text-lg">UTM-Kampagnen</CardTitle>
          </CardHeader>
          <CardContent>
            {campaigns.length === 0 ? (
              <p className="text-sm text-muted-foreground py-4 text-center">
                Keine Kampagnen erfasst. Verwende UTM-Parameter in deinen Links.
              </p>
            ) : (
              <div className="space-y-2">
                {campaigns.map((c) => (
                  <div key={c.campaign} className="flex items-center justify-between py-1">
                    <span className="text-sm font-mono truncate">{c.campaign}</span>
                    <Badge variant="outline" className="shrink-0 ml-2">{c.count}</Badge>
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
