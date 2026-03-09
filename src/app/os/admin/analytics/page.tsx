"use client"

import { useEffect, useState } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Activity, Users, TrendingUp, Calendar, Globe, BarChart3 } from "lucide-react"
import { WebsiteAnalyticsTab } from "@/components/admin/WebsiteAnalyticsTab"

interface AnalyticsSummary {
  events_by_type: Record<string, number>
  events_by_day: Record<string, number>
  active_users: number
  total_events: number
  today_events: number
  yesterday_events: number
}

const EVENT_LABELS: Record<string, string> = {
  page_view: "Seitenaufrufe",
  checkin_complete: "Check-ins",
  training_complete: "Trainings abgeschlossen",
  chat_sent: "Nachrichten gesendet",
  quiz_complete: "Quiz abgeschlossen",
  education_viewed: "Lektionen angesehen",
  exercise_viewed: "Übungen angesehen",
}

function AppAnalyticsTab() {
  const [data, setData] = useState<AnalyticsSummary | null>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    fetch("/api/analytics/summary")
      .then((res) => res.json())
      .then(setData)
      .catch(console.error)
      .finally(() => setLoading(false))
  }, [])

  if (loading) {
    return (
      <div className="py-8 text-center text-muted-foreground">Lade App-Statistiken...</div>
    )
  }

  if (!data) {
    return (
      <div className="py-8 text-center text-muted-foreground">Daten konnten nicht geladen werden.</div>
    )
  }

  const sortedTypes = Object.entries(data.events_by_type).sort((a, b) => b[1] - a[1])

  const last7Days: { day: string; count: number }[] = []
  for (let i = 6; i >= 0; i--) {
    const d = new Date()
    d.setDate(d.getDate() - i)
    const key = d.toISOString().split("T")[0]
    last7Days.push({
      day: d.toLocaleDateString("de-DE", { weekday: "short" }),
      count: data.events_by_day[key] ?? 0,
    })
  }
  const maxDayCount = Math.max(...last7Days.map((d) => d.count), 1)

  return (
    <div className="space-y-6">
      {/* KPI Cards */}
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <Card>
          <CardHeader className="pb-2">
            <CardDescription className="flex items-center gap-1.5">
              <Activity className="h-4 w-4" />
              Gesamt-Events
            </CardDescription>
          </CardHeader>
          <CardContent>
            <p className="text-3xl font-bold">{data.total_events.toLocaleString("de-DE")}</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-2">
            <CardDescription className="flex items-center gap-1.5">
              <Users className="h-4 w-4" />
              Aktive Nutzer
            </CardDescription>
          </CardHeader>
          <CardContent>
            <p className="text-3xl font-bold">{data.active_users}</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-2">
            <CardDescription className="flex items-center gap-1.5">
              <Calendar className="h-4 w-4" />
              Heute
            </CardDescription>
          </CardHeader>
          <CardContent>
            <p className="text-3xl font-bold">{data.today_events}</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-2">
            <CardDescription className="flex items-center gap-1.5">
              <TrendingUp className="h-4 w-4" />
              Gestern
            </CardDescription>
          </CardHeader>
          <CardContent>
            <p className="text-3xl font-bold">{data.yesterday_events}</p>
          </CardContent>
        </Card>
      </div>

      <div className="grid gap-6 lg:grid-cols-2">
        {/* Activity Chart */}
        <Card>
          <CardHeader>
            <CardTitle className="text-lg">Aktivität (letzte 7 Tage)</CardTitle>
          </CardHeader>
          <CardContent>
            {data.total_events === 0 ? (
              <p className="text-sm text-muted-foreground py-8 text-center">
                Noch keine Events. Tracking wird nach dem ersten Patienten-Login aktiv.
              </p>
            ) : (
              <div className="flex items-end gap-2 h-40">
                {last7Days.map((d) => (
                  <div key={d.day} className="flex-1 flex flex-col items-center gap-1">
                    <span className="text-xs text-muted-foreground">{d.count}</span>
                    <div
                      className="w-full bg-emerald-500 rounded-t"
                      style={{ height: `${Math.max((d.count / maxDayCount) * 120, 2)}px` }}
                    />
                    <span className="text-xs text-muted-foreground">{d.day}</span>
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>

        {/* Event Types */}
        <Card>
          <CardHeader>
            <CardTitle className="text-lg">Events nach Typ</CardTitle>
          </CardHeader>
          <CardContent>
            {sortedTypes.length === 0 ? (
              <p className="text-sm text-muted-foreground py-8 text-center">
                Noch keine Events erfasst.
              </p>
            ) : (
              <div className="space-y-3">
                {sortedTypes.map(([type, count]) => (
                  <div key={type} className="flex items-center justify-between">
                    <span className="text-sm">{EVENT_LABELS[type] ?? type}</span>
                    <Badge variant="secondary">{count}</Badge>
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

export default function AdminAnalyticsPage() {
  return (
    <div className="container mx-auto py-8 px-4 max-w-7xl">
      <div className="mb-8">
        <h1 className="text-3xl font-bold tracking-tight">Statistiken</h1>
        <p className="text-muted-foreground mt-2">
          Letzte 30 Tage — App-Nutzung und Website-Besucher
        </p>
      </div>

      <Tabs defaultValue="website" className="space-y-6">
        <TabsList>
          <TabsTrigger value="website" className="gap-1.5">
            <Globe className="h-4 w-4" />
            Website
          </TabsTrigger>
          <TabsTrigger value="app" className="gap-1.5">
            <BarChart3 className="h-4 w-4" />
            App-Nutzung
          </TabsTrigger>
        </TabsList>

        <TabsContent value="website">
          <WebsiteAnalyticsTab />
        </TabsContent>

        <TabsContent value="app">
          <AppAnalyticsTab />
        </TabsContent>
      </Tabs>
    </div>
  )
}
