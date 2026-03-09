"use client"

import { useEffect, useState } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Skeleton } from "@/components/ui/skeleton"
import {
  CreditCard,
  Clock,
  CheckCircle2,
  XCircle,
  AlertTriangle,
  Receipt,
  ChevronRight,
} from "lucide-react"
import Link from "next/link"

interface Subscription {
  id: string
  plan_type: "monthly" | "yearly"
  status: "trial" | "active" | "past_due" | "cancelled" | "expired"
  trial_start: string | null
  trial_end: string | null
  current_period_start: string | null
  current_period_end: string | null
  price_amount: number
  extra_free_months: number
}

interface Installment {
  id: string
  installment_number: number
  amount: number
  due_date: string
  status: "pending" | "paid" | "failed" | "cancelled"
}

interface PaymentPlan {
  id: string
  package_name: string
  total_amount: number
  num_installments: number
  installment_amount: number
  status: string
  payment_installments: Installment[]
}

const STATUS_MAP: Record<string, { label: string; icon: React.ReactNode; color: string }> = {
  trial: { label: "Testphase — kostenlos", icon: <Clock className="h-5 w-5" />, color: "text-blue-600 bg-blue-50 border-blue-200" },
  active: { label: "Aktiv", icon: <CheckCircle2 className="h-5 w-5" />, color: "text-emerald-600 bg-emerald-50 border-emerald-200" },
  past_due: { label: "Zahlung ausstehend", icon: <AlertTriangle className="h-5 w-5" />, color: "text-amber-600 bg-amber-50 border-amber-200" },
  cancelled: { label: "Gekündigt", icon: <XCircle className="h-5 w-5" />, color: "text-slate-500 bg-slate-50 border-slate-200" },
  expired: { label: "Abgelaufen", icon: <XCircle className="h-5 w-5" />, color: "text-slate-500 bg-slate-50 border-slate-200" },
}

function formatDate(d: string | null): string {
  if (!d) return "–"
  return new Date(d).toLocaleDateString("de-DE", { day: "2-digit", month: "2-digit", year: "numeric" })
}

function formatCurrency(amount: number): string {
  return amount.toLocaleString("de-DE", { style: "currency", currency: "EUR" })
}

function daysUntil(dateStr: string | null): number | null {
  if (!dateStr) return null
  const diff = new Date(dateStr).getTime() - Date.now()
  return Math.max(0, Math.ceil(diff / (1000 * 60 * 60 * 24)))
}

export default function PatientAboPage() {
  const [subscription, setSubscription] = useState<Subscription | null>(null)
  const [paymentPlans, setPaymentPlans] = useState<PaymentPlan[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    fetch("/api/me/subscription")
      .then((res) => res.json())
      .then((data) => {
        setSubscription(data.subscription)
        setPaymentPlans(data.payment_plans ?? [])
      })
      .catch(console.error)
      .finally(() => setLoading(false))
  }, [])

  if (loading) {
    return (
      <div className="container mx-auto py-8 px-4 max-w-2xl">
        <Skeleton className="h-8 w-48 mb-6" />
        <Skeleton className="h-48 w-full rounded-xl" />
      </div>
    )
  }

  const status = subscription ? STATUS_MAP[subscription.status] : null
  const trialDays = subscription?.status === "trial" ? daysUntil(subscription.trial_end) : null

  return (
    <div className="container mx-auto py-8 px-4 max-w-2xl">
      <h1 className="text-2xl font-bold tracking-tight mb-6">Meine Mitgliedschaft</h1>

      {/* Subscription */}
      {!subscription ? (
        <Card>
          <CardContent className="py-8 text-center">
            <CreditCard className="h-10 w-10 text-muted-foreground mx-auto mb-3" />
            <p className="text-muted-foreground">
              Kein aktives Abo. Dein Therapeut schaltet den Zugang für dich frei.
            </p>
          </CardContent>
        </Card>
      ) : (
        <Card className="overflow-hidden">
          {/* Status banner */}
          {status && (
            <div className={`px-4 py-3 border-b flex items-center gap-2 ${status.color}`}>
              {status.icon}
              <span className="font-medium">{status.label}</span>
              {trialDays != null && (
                <span className="ml-auto text-sm">
                  noch {trialDays} {trialDays === 1 ? "Tag" : "Tage"}
                </span>
              )}
            </div>
          )}

          <CardContent className="pt-5">
            <div className="space-y-4">
              <div className="grid grid-cols-2 gap-4 text-sm">
                <div>
                  <p className="text-muted-foreground">Plan</p>
                  <p className="font-medium">
                    {subscription.plan_type === "yearly" ? "Jahresmitgliedschaft" : "Monatlich"}
                  </p>
                </div>
                <div>
                  <p className="text-muted-foreground">
                    {subscription.status === "trial" ? "Ab dem 2. Monat" : "Preis"}
                  </p>
                  <p className="font-medium">{formatCurrency(subscription.price_amount)}</p>
                </div>
                <div>
                  <p className="text-muted-foreground">
                    {subscription.status === "trial" ? "Testphase bis" : "Nächste Abbuchung"}
                  </p>
                  <p className="font-medium">
                    {formatDate(subscription.status === "trial" ? subscription.trial_end : subscription.current_period_end)}
                  </p>
                </div>
                <div>
                  <p className="text-muted-foreground">Mitglied seit</p>
                  <p className="font-medium">{formatDate(subscription.trial_start)}</p>
                </div>
              </div>

              {subscription.status === "trial" && (
                <div className="rounded-lg bg-blue-50 border border-blue-100 px-4 py-3 text-sm text-blue-800">
                  Dein erster Monat ist <span className="font-semibold">kostenfrei</span>.
                  {subscription.extra_free_months > 0 && (
                    <> Plus {subscription.extra_free_months} Bonus-{subscription.extra_free_months === 1 ? "Monat" : "Monate"} durch deinen Promo-Code.</>
                  )}
                  {" "}Danach wird die Betreuungspauschale automatisch eingezogen.
                </div>
              )}

              <div className="text-xs text-muted-foreground">
                Die Betreuungspauschale wird als Heilpraktiker-Leistung (GebüH Ziff. 3) abgerechnet und
                ist bei einigen Zusatzversicherungen erstattungsfähig (bis zu 4,50€).
              </div>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Payment Plans */}
      {paymentPlans.length > 0 && (
        <div className="mt-8">
          <h2 className="text-lg font-semibold mb-4 flex items-center gap-2">
            <Receipt className="h-5 w-5" />
            Behandlungspakete
          </h2>

          <div className="space-y-3">
            {paymentPlans.map((plan) => {
              const paidCount = plan.payment_installments.filter((i) => i.status === "paid").length
              const nextPending = plan.payment_installments
                .filter((i) => i.status === "pending")
                .sort((a, b) => a.installment_number - b.installment_number)[0]

              return (
                <Card key={plan.id}>
                  <CardContent className="py-4">
                    <div className="flex items-center justify-between mb-2">
                      <p className="font-medium text-sm">{plan.package_name}</p>
                      <Badge variant={plan.status === "completed" ? "default" : "secondary"}>
                        {plan.status === "completed"
                          ? "Bezahlt"
                          : `${paidCount}/${plan.num_installments} bezahlt`}
                      </Badge>
                    </div>
                    <p className="text-sm text-muted-foreground">
                      {formatCurrency(plan.total_amount)}
                      {plan.num_installments > 1 && (
                        <> — {plan.num_installments} Raten à {formatCurrency(plan.installment_amount)} (ohne Aufschlag)</>
                      )}
                    </p>
                    {nextPending && (
                      <p className="text-xs text-muted-foreground mt-1">
                        Nächste Rate: {formatCurrency(nextPending.amount)} am {formatDate(nextPending.due_date)}
                      </p>
                    )}
                  </CardContent>
                </Card>
              )
            })}
          </div>
        </div>
      )}

      {/* Link to invoices */}
      <div className="mt-8">
        <Link
          href="/app/rechnungen"
          className="flex items-center justify-between rounded-lg border border-slate-200 px-4 py-3 text-sm hover:bg-slate-50 transition-colors"
        >
          <span className="flex items-center gap-2">
            <Receipt className="h-4 w-4 text-muted-foreground" />
            Alle Rechnungen ansehen
          </span>
          <ChevronRight className="h-4 w-4 text-muted-foreground" />
        </Link>
      </div>
    </div>
  )
}
