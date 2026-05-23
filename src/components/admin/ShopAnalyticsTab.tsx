"use client"

/**
 * Shop-Analytics-Tab — Funnel, Umsatz & Attribution für den Website-Shop
 * (/kurse/* + /decks/*). Muster: SchmerzcheckFunnelTab.
 *
 * Datenquelle: GET /api/admin/shop/analytics (Staff only).
 */

import { useEffect, useState, type ReactNode } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import {
  Users,
  Eye,
  ShoppingCart,
  CreditCard,
  ShoppingBag,
  Euro,
  TrendingUp,
} from "lucide-react"

interface PerProduct {
  slug: string
  titel: string
  produkt_typ: string
  views: number
  purchases: number
  revenue: number
}

interface ShopAnalytics {
  funnel: {
    visitors: number
    productViews: number
    addToCart: number
    checkoutStart: number
    purchases: number
  }
  totals: {
    revenue: number
    currency: string
    purchases: number
    visitors: number
  }
  perProduct: PerProduct[]
  attribution: {
    visitorsBySource: Record<string, number>
    purchasesBySource: Record<string, number>
    byDevice: Record<string, number>
  }
}

const PRODUKT_TYP_LABELS: Record<string, string> = {
  challenge: "Challenge",
  programm: "Programm",
  masterclass: "Masterclass",
  deck: "Bewegungskarten",
}

const DEVICE_LABELS: Record<string, string> = {
  mobile: "Mobil",
  tablet: "Tablet",
  desktop: "Desktop",
  unbekannt: "Unbekannt",
}

const pct = (n: number, base: number) => (base > 0 ? Math.round((n / base) * 100) : 0)

const fmtEur = (n: number, currency = "EUR") =>
  n.toLocaleString("de-DE", { style: "currency", currency: currency || "EUR" })

export function ShopAnalyticsTab() {
  const [data, setData] = useState<ShopAnalytics | null>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    fetch("/api/admin/shop/analytics")
      .then((r) => r.json())
      .then(setData)
      .catch(console.error)
      .finally(() => setLoading(false))
  }, [])

  if (loading) return <div className="py-8 text-center text-muted-foreground">Lade Shop-Daten…</div>
  if (!data?.funnel)
    return <div className="py-8 text-center text-muted-foreground">Daten konnten nicht geladen werden.</div>

  const f = data.funnel
  const t = data.totals
  const steps = [
    { label: "Besucher (Shop)", value: f.visitors, icon: Users },
    { label: "Produktansichten", value: f.productViews, icon: Eye },
    { label: "In den Warenkorb", value: f.addToCart, icon: ShoppingCart },
    { label: "Zur Kasse", value: f.checkoutStart, icon: CreditCard },
    { label: "Käufe", value: f.purchases, icon: ShoppingBag },
  ]
  const top = Math.max(f.visitors, 1)
  const conversionRate = pct(f.purchases, f.visitors)

  const visitorsSorted = Object.entries(data.attribution.visitorsBySource).sort((a, b) => b[1] - a[1])
  const purchasesSorted = Object.entries(data.attribution.purchasesBySource).sort((a, b) => b[1] - a[1])
  const deviceSorted = Object.entries(data.attribution.byDevice)
    .map(([k, v]) => [DEVICE_LABELS[k] ?? k, v] as [string, number])
    .sort((a, b) => b[1] - a[1])

  return (
    <div className="space-y-6">
      {/* KPI cards */}
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <KpiCard icon={<Users className="h-4 w-4" />} label="Besucher (Shop)" value={f.visitors.toLocaleString("de-DE")} />
        <KpiCard
          icon={<ShoppingBag className="h-4 w-4" />}
          label="Käufe"
          value={t.purchases.toLocaleString("de-DE")}
        />
        <KpiCard
          icon={<Euro className="h-4 w-4" />}
          label="Umsatz"
          value={fmtEur(t.revenue, t.currency)}
        />
        <KpiCard
          icon={<TrendingUp className="h-4 w-4" />}
          label="Conversion-Rate"
          value={`${conversionRate}%`}
          sub="Käufe je Besucher"
        />
      </div>

      {/* Funnel */}
      <Card>
        <CardHeader>
          <CardTitle className="text-lg">Shop-Funnel</CardTitle>
          <CardDescription>Von Besucher bis Kauf — Übergang je Stufe rechts</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-2.5">
            {steps.map((s, i) => {
              const prev = i > 0 ? steps[i - 1].value : s.value
              const Icon = s.icon
              return (
                <div key={s.label} className="flex items-center gap-3">
                  <div className="flex w-40 shrink-0 items-center gap-2 text-sm sm:w-48">
                    <Icon className="h-4 w-4 shrink-0 text-emerald-600" />
                    <span className="truncate">{s.label}</span>
                  </div>
                  <div className="relative h-8 flex-1 overflow-hidden rounded bg-muted">
                    <div
                      className="absolute inset-y-0 left-0 rounded bg-emerald-500"
                      style={{ width: `${s.value > 0 ? Math.max(pct(s.value, top), 4) : 0}%` }}
                    />
                    <span className="absolute inset-y-0 left-2 flex items-center text-xs font-semibold text-slate-900">
                      {s.value.toLocaleString("de-DE")}
                    </span>
                  </div>
                  <span className="w-14 shrink-0 text-right text-xs text-muted-foreground">
                    {i === 0 ? "—" : `${pct(s.value, prev)}%`}
                  </span>
                </div>
              )
            })}
          </div>
        </CardContent>
      </Card>

      {/* Pro Produkt */}
      <Card>
        <CardHeader>
          <CardTitle className="text-lg">Pro Produkt</CardTitle>
          <CardDescription>Aufrufe, Käufe und Umsatz je Produkt</CardDescription>
        </CardHeader>
        <CardContent>
          {data.perProduct.length === 0 ? (
            <p className="py-4 text-center text-sm text-muted-foreground">Noch keine Shop-Daten.</p>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b text-left text-xs uppercase tracking-wide text-muted-foreground">
                    <th className="py-2 pr-3 font-medium">Produkt</th>
                    <th className="py-2 px-3 font-medium">Typ</th>
                    <th className="py-2 px-3 text-right font-medium">Aufrufe</th>
                    <th className="py-2 px-3 text-right font-medium">Käufe</th>
                    <th className="py-2 pl-3 text-right font-medium">Umsatz</th>
                  </tr>
                </thead>
                <tbody>
                  {data.perProduct.map((p) => (
                    <tr key={p.slug} className="border-b last:border-0">
                      <td className="py-2.5 pr-3">
                        <span className="font-medium text-slate-800">{p.titel}</span>
                      </td>
                      <td className="py-2.5 px-3">
                        <Badge variant="outline">
                          {PRODUKT_TYP_LABELS[p.produkt_typ] ?? p.produkt_typ}
                        </Badge>
                      </td>
                      <td className="py-2.5 px-3 text-right tabular-nums">
                        {p.views.toLocaleString("de-DE")}
                      </td>
                      <td className="py-2.5 px-3 text-right tabular-nums">
                        {p.purchases.toLocaleString("de-DE")}
                      </td>
                      <td className="py-2.5 pl-3 text-right tabular-nums font-medium">
                        {fmtEur(p.revenue, t.currency)}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Attribution */}
      <div className="grid gap-6 lg:grid-cols-3">
        <ListCard title="Besucher nach Quelle (UTM)" rows={visitorsSorted} empty="Noch keine Besucher." />
        <ListCard title="Käufe nach Quelle (UTM)" rows={purchasesSorted} empty="Noch keine Käufe." />
        <ListCard title="Besucher nach Gerät" rows={deviceSorted} empty="Noch keine Besucher." />
      </div>
    </div>
  )
}

function KpiCard({
  icon,
  label,
  value,
  sub,
}: {
  icon: ReactNode
  label: string
  value: string
  sub?: string
}) {
  return (
    <Card>
      <CardHeader className="pb-2">
        <CardDescription className="flex items-center gap-1.5">
          {icon}
          {label}
        </CardDescription>
      </CardHeader>
      <CardContent>
        <p className="text-3xl font-bold">{value}</p>
        {sub && <p className="mt-0.5 text-xs text-muted-foreground">{sub}</p>}
      </CardContent>
    </Card>
  )
}

function ListCard({ title, rows, empty }: { title: string; rows: [string, number][]; empty: string }) {
  return (
    <Card>
      <CardHeader>
        <CardTitle className="text-lg">{title}</CardTitle>
      </CardHeader>
      <CardContent>
        {rows.length === 0 ? (
          <p className="py-4 text-center text-sm text-muted-foreground">{empty}</p>
        ) : (
          <div className="space-y-2.5">
            {rows.map(([k, v]) => (
              <div key={k} className="flex items-center justify-between">
                <span className="text-sm">{k}</span>
                <Badge variant="secondary">{v}</Badge>
              </div>
            ))}
          </div>
        )}
      </CardContent>
    </Card>
  )
}
