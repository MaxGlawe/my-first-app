"use client"

import { useState, useEffect } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Euro, TrendingUp, Clock, AlertTriangle } from "lucide-react"
import type { BillingSummary } from "@/types/billing"

export function BillingSummaryCards() {
  const [summary, setSummary] = useState<BillingSummary | null>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    let cancelled = false
    async function load() {
      try {
        const res = await fetch("/api/admin/billing/summary")
        if (!res.ok) throw new Error()
        const json = await res.json()
        if (!cancelled) setSummary(json.data)
      } catch {
        // Silent fail
      } finally {
        if (!cancelled) setLoading(false)
      }
    }
    load()
    return () => { cancelled = true }
  }, [])

  const fmt = (n: number) =>
    n.toLocaleString("de-DE", { style: "currency", currency: "EUR" })

  if (loading) {
    return (
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        {[1, 2, 3, 4].map((i) => (
          <Card key={i}>
            <CardHeader className="pb-2">
              <div className="h-4 w-24 bg-muted animate-pulse rounded" />
            </CardHeader>
            <CardContent>
              <div className="h-8 w-32 bg-muted animate-pulse rounded" />
            </CardContent>
          </Card>
        ))}
      </div>
    )
  }

  if (!summary) return null

  const cards = [
    {
      title: "Gesamtumsatz",
      value: fmt(summary.total_revenue),
      sub: `${summary.paid_count} bezahlte Rechnungen`,
      icon: Euro,
      color: "text-emerald-600",
    },
    {
      title: "Umsatz (Monat)",
      value: fmt(summary.revenue_this_month),
      sub: "Aktueller Monat",
      icon: TrendingUp,
      color: "text-blue-600",
    },
    {
      title: "Offene Beträge",
      value: fmt(summary.outstanding_amount),
      sub: `${summary.open_count} offene Rechnungen`,
      icon: Clock,
      color: "text-amber-600",
    },
    {
      title: "Überfällig",
      value: fmt(summary.overdue_amount),
      sub: `${summary.overdue_count} überfällige Rechnungen`,
      icon: AlertTriangle,
      color: summary.overdue_count > 0 ? "text-red-600" : "text-gray-400",
    },
  ]

  return (
    <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
      {cards.map((card) => (
        <Card key={card.title}>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">
              {card.title}
            </CardTitle>
            <card.icon className={`h-4 w-4 ${card.color}`} />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{card.value}</div>
            <p className="text-xs text-muted-foreground mt-1">{card.sub}</p>
          </CardContent>
        </Card>
      ))}
    </div>
  )
}
