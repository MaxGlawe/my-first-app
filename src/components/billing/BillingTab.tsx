"use client"

import { useEffect, useState, useCallback } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Alert, AlertDescription } from "@/components/ui/alert"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog"
import {
  CreditCard,
  Clock,
  CheckCircle2,
  XCircle,
  AlertTriangle,
  Plus,
  Receipt,
  Loader2,
  Gift,
  BadgeCheck,
  X,
} from "lucide-react"

interface Subscription {
  id: string
  patient_id: string
  plan_type: "monthly" | "yearly"
  status: "trial" | "active" | "past_due" | "cancelled" | "expired"
  trial_start: string | null
  trial_end: string | null
  current_period_start: string | null
  current_period_end: string | null
  price_amount: number
  gebuh_ziffer: string
  promo_code_id: string | null
  extra_free_months: number
  cancelled_at: string | null
}

interface Installment {
  id: string
  installment_number: number
  amount: number
  due_date: string
  status: "pending" | "paid" | "failed" | "cancelled"
  paid_at: string | null
}

interface PaymentPlan {
  id: string
  package_name: string
  total_amount: number
  num_installments: number
  installment_amount: number
  status: "active" | "completed" | "cancelled" | "defaulted"
  gebuh_items: { ziffer: string; analog?: boolean; beschreibung: string; einzelpreis: number }[]
  payment_installments: Installment[]
  created_at: string
}

interface TreatmentPackage {
  id: string
  name: string
  description: string | null
  total_price: number
  gebuh_items: { ziffer: string; analog?: boolean; beschreibung: string; einzelpreis: number }[]
  sitzungen: number | null
  dauer_wochen: number | null
  max_installments: number
  is_active: boolean
}

const STATUS_CONFIG: Record<string, { label: string; variant: "default" | "secondary" | "destructive" | "outline"; icon: React.ReactNode }> = {
  trial: { label: "Testphase", variant: "secondary", icon: <Clock className="h-3.5 w-3.5" /> },
  active: { label: "Aktiv", variant: "default", icon: <CheckCircle2 className="h-3.5 w-3.5" /> },
  past_due: { label: "Zahlung ausstehend", variant: "destructive", icon: <AlertTriangle className="h-3.5 w-3.5" /> },
  cancelled: { label: "Gekündigt", variant: "outline", icon: <XCircle className="h-3.5 w-3.5" /> },
  expired: { label: "Abgelaufen", variant: "outline", icon: <XCircle className="h-3.5 w-3.5" /> },
}

const INSTALLMENT_STATUS: Record<string, { label: string; color: string }> = {
  pending: { label: "Offen", color: "text-amber-600 bg-amber-50" },
  paid: { label: "Bezahlt", color: "text-emerald-600 bg-emerald-50" },
  failed: { label: "Fehlgeschlagen", color: "text-red-600 bg-red-50" },
  cancelled: { label: "Storniert", color: "text-slate-400 bg-slate-50" },
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
  return Math.ceil(diff / (1000 * 60 * 60 * 24))
}

interface BillingTabProps {
  patientId: string
}

export function BillingTab({ patientId }: BillingTabProps) {
  const [subscription, setSubscription] = useState<Subscription | null>(null)
  const [paymentPlans, setPaymentPlans] = useState<PaymentPlan[]>([])
  const [packages, setPackages] = useState<TreatmentPackage[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  const loadData = useCallback(async () => {
    setLoading(true)
    try {
      const [subRes, planRes, pkgRes] = await Promise.all([
        fetch(`/api/admin/subscriptions`),
        fetch(`/api/admin/payment-plans?patient_id=${patientId}`),
        fetch(`/api/admin/treatment-packages`),
      ])

      if (subRes.ok) {
        const subs = await subRes.json()
        const patientSub = subs.find((s: Subscription & { patient_id: string }) => s.patient_id === patientId)
        setSubscription(patientSub ?? null)
      }

      if (planRes.ok) {
        setPaymentPlans(await planRes.json())
      }

      if (pkgRes.ok) {
        setPackages((await pkgRes.json()).filter((p: TreatmentPackage) => p.is_active))
      }
    } catch {
      setError("Daten konnten nicht geladen werden.")
    } finally {
      setLoading(false)
    }
  }, [patientId])

  useEffect(() => { loadData() }, [loadData])

  if (loading) {
    return (
      <div className="flex items-center justify-center py-12">
        <Loader2 className="h-6 w-6 animate-spin text-muted-foreground" />
      </div>
    )
  }

  return (
    <div className="space-y-6">
      {error && (
        <Alert variant="destructive">
          <AlertDescription>{error}</AlertDescription>
        </Alert>
      )}

      {/* Subscription Card */}
      <SubscriptionCard
        subscription={subscription}
        patientId={patientId}
        onRefresh={loadData}
      />

      {/* Payment Plans */}
      <PaymentPlansSection
        plans={paymentPlans}
        packages={packages}
        patientId={patientId}
        onRefresh={loadData}
      />
    </div>
  )
}

// ── Subscription Card ──────────────────────────────────────

function SubscriptionCard({
  subscription,
  patientId,
  onRefresh,
}: {
  subscription: Subscription | null
  patientId: string
  onRefresh: () => void
}) {
  const [activating, setActivating] = useState(false)
  const [showActivate, setShowActivate] = useState(false)
  const [planType, setPlanType] = useState<"monthly" | "yearly">("monthly")
  const [promoCode, setPromoCode] = useState("")
  const [activateError, setActivateError] = useState<string | null>(null)
  const [promoValid, setPromoValid] = useState<{ valid: boolean; type?: string; value?: number; error?: string } | null>(null)
  const [promoChecking, setPromoChecking] = useState(false)

  async function validatePromo(code: string) {
    if (!code.trim()) {
      setPromoValid(null)
      return
    }
    setPromoChecking(true)
    try {
      const res = await fetch(`/api/admin/promo-codes/validate?code=${encodeURIComponent(code)}`)
      const data = await res.json()
      setPromoValid(data)
    } catch {
      setPromoValid({ valid: false, error: "Prüfung fehlgeschlagen." })
    } finally {
      setPromoChecking(false)
    }
  }

  function formatPromoValue(type: string, value: number): string {
    if (type === "free_months") return `+${value} Gratis-Monat${value > 1 ? "e" : ""}`
    if (type === "percent_off") return `${value}% Rabatt`
    return `${value.toLocaleString("de-DE", { style: "currency", currency: "EUR" })} Rabatt`
  }

  async function handleActivate() {
    setActivating(true)
    setActivateError(null)

    try {
      const res = await fetch("/api/admin/subscriptions", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          patient_id: patientId,
          plan_type: planType,
          promo_code: promoCode || undefined,
        }),
      })

      if (!res.ok) {
        const body = await res.json().catch(() => ({}))
        setActivateError(body.error ?? "Fehler beim Aktivieren.")
        return
      }

      setShowActivate(false)
      setPromoCode("")
      setPromoValid(null)
      onRefresh()
    } catch {
      setActivateError("Netzwerkfehler.")
    } finally {
      setActivating(false)
    }
  }

  async function handleCancel() {
    if (!subscription || !confirm("Abo wirklich kündigen? Der Zugang bleibt bis zum Ende des Zeitraums bestehen.")) return

    try {
      const res = await fetch(`/api/admin/subscriptions/${subscription.id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ action: "cancel" }),
      })

      if (res.ok) onRefresh()
    } catch {
      // ignore
    }
  }

  if (!subscription || ["cancelled", "expired"].includes(subscription.status)) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="text-lg flex items-center gap-2">
            <CreditCard className="h-5 w-5" />
            Betreuungspauschale
          </CardTitle>
          <CardDescription>
            {subscription ? "Abo wurde gekündigt oder ist abgelaufen." : "Kein aktives Abo."}
          </CardDescription>
        </CardHeader>
        <CardContent>
          <Dialog open={showActivate} onOpenChange={setShowActivate}>
            <DialogTrigger asChild>
              <Button className="bg-emerald-600 hover:bg-emerald-700">
                <Plus className="h-4 w-4 mr-1.5" />
                App-Zugang freischalten
              </Button>
            </DialogTrigger>
            <DialogContent>
              <DialogHeader>
                <DialogTitle>App-Zugang freischalten</DialogTitle>
                <DialogDescription>
                  Der erste Monat ist kostenfrei (Testphase). Danach wird die Betreuungspauschale automatisch eingezogen.
                </DialogDescription>
              </DialogHeader>

              {activateError && (
                <Alert variant="destructive">
                  <AlertDescription>{activateError}</AlertDescription>
                </Alert>
              )}

              <div className="space-y-4 py-2">
                <div className="space-y-1.5">
                  <Label>Abrechnungsmodell</Label>
                  <Select value={planType} onValueChange={(v) => setPlanType(v as "monthly" | "yearly")}>
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="monthly">Monatlich — 16,99€/Monat</SelectItem>
                      <SelectItem value="yearly">Jahresmitgliedschaft — 169,99€/Jahr (2 Monate gratis)</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div className="space-y-1.5">
                  <Label className="flex items-center gap-1.5">
                    <Gift className="h-3.5 w-3.5" />
                    Promo-Code (optional)
                  </Label>
                  <div className="flex gap-2">
                    <div className="relative flex-1">
                      <Input
                        placeholder="z.B. WILLKOMMEN"
                        value={promoCode}
                        onChange={(e) => {
                          setPromoCode(e.target.value.toUpperCase())
                          setPromoValid(null)
                        }}
                        className={`font-mono pr-8 ${
                          promoValid?.valid === true
                            ? "border-emerald-500 focus-visible:ring-emerald-500"
                            : promoValid?.valid === false
                            ? "border-red-400 focus-visible:ring-red-400"
                            : ""
                        }`}
                      />
                      {promoCode && (
                        <button
                          type="button"
                          onClick={() => { setPromoCode(""); setPromoValid(null) }}
                          className="absolute right-2 top-1/2 -translate-y-1/2 p-0.5 hover:bg-slate-100 rounded"
                        >
                          <X className="h-3.5 w-3.5 text-muted-foreground" />
                        </button>
                      )}
                    </div>
                    <Button
                      type="button"
                      variant="outline"
                      size="sm"
                      onClick={() => validatePromo(promoCode)}
                      disabled={!promoCode.trim() || promoChecking}
                      className="shrink-0"
                    >
                      {promoChecking ? <Loader2 className="h-3.5 w-3.5 animate-spin" /> : "Prüfen"}
                    </Button>
                  </div>

                  {promoValid?.valid === true && (
                    <div className="flex items-center gap-2 text-sm text-emerald-600 bg-emerald-50 rounded-md px-3 py-2 mt-1">
                      <BadgeCheck className="h-4 w-4 shrink-0" />
                      <span className="font-medium">
                        Code gültig — {formatPromoValue(promoValid.type!, promoValid.value!)}
                      </span>
                    </div>
                  )}
                  {promoValid?.valid === false && (
                    <div className="flex items-center gap-2 text-sm text-red-600 bg-red-50 rounded-md px-3 py-2 mt-1">
                      <XCircle className="h-4 w-4 shrink-0" />
                      <span>{promoValid.error}</span>
                    </div>
                  )}
                </div>
              </div>

              <DialogFooter>
                <Button variant="outline" onClick={() => setShowActivate(false)}>
                  Abbrechen
                </Button>
                <Button
                  onClick={handleActivate}
                  disabled={activating}
                  className="bg-emerald-600 hover:bg-emerald-700"
                >
                  {activating ? <Loader2 className="h-4 w-4 animate-spin mr-1.5" /> : null}
                  Freischalten
                </Button>
              </DialogFooter>
            </DialogContent>
          </Dialog>
        </CardContent>
      </Card>
    )
  }

  const statusConfig = STATUS_CONFIG[subscription.status]
  const trialDaysLeft = subscription.status === "trial" ? daysUntil(subscription.trial_end) : null
  const periodEnd = daysUntil(subscription.current_period_end)

  return (
    <Card>
      <CardHeader>
        <div className="flex items-center justify-between">
          <CardTitle className="text-lg flex items-center gap-2">
            <CreditCard className="h-5 w-5" />
            Betreuungspauschale
          </CardTitle>
          <Badge variant={statusConfig.variant} className="flex items-center gap-1">
            {statusConfig.icon}
            {statusConfig.label}
          </Badge>
        </div>
      </CardHeader>
      <CardContent>
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 text-sm">
          <div>
            <p className="text-muted-foreground">Plan</p>
            <p className="font-medium">
              {subscription.plan_type === "yearly" ? "Jahresmitgliedschaft" : "Monatlich"}
            </p>
          </div>
          <div>
            <p className="text-muted-foreground">Preis</p>
            <p className="font-medium">{formatCurrency(subscription.price_amount)}</p>
            <p className="text-xs text-muted-foreground">GebüH Ziff. {subscription.gebuh_ziffer}</p>
          </div>
          {subscription.status === "trial" && trialDaysLeft != null && (
            <div>
              <p className="text-muted-foreground">Testphase endet</p>
              <p className="font-medium">{formatDate(subscription.trial_end)}</p>
              <p className="text-xs text-muted-foreground">
                noch {trialDaysLeft} {trialDaysLeft === 1 ? "Tag" : "Tage"}
              </p>
            </div>
          )}
          {subscription.status === "active" && periodEnd != null && (
            <div>
              <p className="text-muted-foreground">Nächste Abbuchung</p>
              <p className="font-medium">{formatDate(subscription.current_period_end)}</p>
            </div>
          )}
          <div>
            <p className="text-muted-foreground">Aktiv seit</p>
            <p className="font-medium">{formatDate(subscription.trial_start)}</p>
          </div>
        </div>

        {subscription.extra_free_months > 0 && (
          <div className="mt-3 flex items-center gap-1.5 text-sm text-emerald-600">
            <Gift className="h-3.5 w-3.5" />
            +{subscription.extra_free_months} Gratis-{subscription.extra_free_months === 1 ? "Monat" : "Monate"} (Promo-Code)
          </div>
        )}

        <div className="mt-4 flex gap-2">
          {["trial", "active"].includes(subscription.status) && (
            <Button variant="outline" size="sm" onClick={handleCancel} className="text-red-600 hover:text-red-700">
              Abo kündigen
            </Button>
          )}
        </div>
      </CardContent>
    </Card>
  )
}

// ── Payment Plans Section ──────────────────────────────────

function PaymentPlansSection({
  plans,
  packages,
  patientId,
  onRefresh,
}: {
  plans: PaymentPlan[]
  packages: TreatmentPackage[]
  patientId: string
  onRefresh: () => void
}) {
  const [showCreate, setShowCreate] = useState(false)
  const [selectedPackage, setSelectedPackage] = useState<string>("")
  const [numInstallments, setNumInstallments] = useState(1)
  const [customName, setCustomName] = useState("")
  const [customAmount, setCustomAmount] = useState("")
  const [creating, setCreating] = useState(false)
  const [createError, setCreateError] = useState<string | null>(null)

  const pkg = packages.find((p) => p.id === selectedPackage)
  const isCustom = selectedPackage === "custom"
  const totalAmount = isCustom ? parseFloat(customAmount) || 0 : (pkg?.total_price ?? 0)
  const maxRates = isCustom ? 12 : (pkg?.max_installments ?? 1)

  async function handleCreate() {
    setCreating(true)
    setCreateError(null)

    const name = isCustom ? customName : pkg?.name
    if (!name || totalAmount <= 0) {
      setCreateError("Bitte alle Felder ausfüllen.")
      setCreating(false)
      return
    }

    try {
      const res = await fetch("/api/admin/payment-plans", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          patient_id: patientId,
          package_id: isCustom ? undefined : selectedPackage,
          package_name: name,
          total_amount: totalAmount,
          num_installments: numInstallments,
          gebuh_items: isCustom ? [] : (pkg?.gebuh_items ?? []),
        }),
      })

      if (!res.ok) {
        const body = await res.json().catch(() => ({}))
        setCreateError(body.error ?? "Fehler beim Erstellen.")
        return
      }

      setShowCreate(false)
      setSelectedPackage("")
      setNumInstallments(1)
      setCustomName("")
      setCustomAmount("")
      onRefresh()
    } catch {
      setCreateError("Netzwerkfehler.")
    } finally {
      setCreating(false)
    }
  }

  return (
    <Card>
      <CardHeader>
        <div className="flex items-center justify-between">
          <div>
            <CardTitle className="text-lg flex items-center gap-2">
              <Receipt className="h-5 w-5" />
              Behandlungspakete & Ratenzahlung
            </CardTitle>
            <CardDescription>Ohne Aufschlag — faire Ratenzahlung</CardDescription>
          </div>
          <Dialog open={showCreate} onOpenChange={setShowCreate}>
            <DialogTrigger asChild>
              <Button size="sm" className="bg-emerald-600 hover:bg-emerald-700">
                <Plus className="h-4 w-4 mr-1" />
                Paket anlegen
              </Button>
            </DialogTrigger>
            <DialogContent className="max-w-lg">
              <DialogHeader>
                <DialogTitle>Behandlungspaket anlegen</DialogTitle>
                <DialogDescription>
                  Wählen Sie ein Paket oder erstellen Sie ein individuelles.
                </DialogDescription>
              </DialogHeader>

              {createError && (
                <Alert variant="destructive">
                  <AlertDescription>{createError}</AlertDescription>
                </Alert>
              )}

              <div className="space-y-4 py-2">
                <div className="space-y-1.5">
                  <Label>Paketvorlage</Label>
                  <Select value={selectedPackage} onValueChange={(v) => { setSelectedPackage(v); setNumInstallments(1) }}>
                    <SelectTrigger>
                      <SelectValue placeholder="Paket wählen..." />
                    </SelectTrigger>
                    <SelectContent>
                      {packages.map((p) => (
                        <SelectItem key={p.id} value={p.id}>
                          {p.name} — {formatCurrency(p.total_price)}
                        </SelectItem>
                      ))}
                      <SelectItem value="custom">Individuell erstellen</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                {isCustom && (
                  <>
                    <div className="space-y-1.5">
                      <Label>Bezeichnung</Label>
                      <Input
                        placeholder="z.B. 8-Wochen Rücken-Intensiv"
                        value={customName}
                        onChange={(e) => setCustomName(e.target.value)}
                      />
                    </div>
                    <div className="space-y-1.5">
                      <Label>Gesamtbetrag (€)</Label>
                      <Input
                        type="number"
                        step="0.01"
                        placeholder="z.B. 398.99"
                        value={customAmount}
                        onChange={(e) => setCustomAmount(e.target.value)}
                      />
                    </div>
                  </>
                )}

                {(pkg || isCustom) && totalAmount > 0 && (
                  <div className="space-y-1.5">
                    <Label>Zahlungsart</Label>
                    <Select
                      value={String(numInstallments)}
                      onValueChange={(v) => setNumInstallments(Number(v))}
                    >
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="1">
                          Einmalzahlung — {formatCurrency(totalAmount)}
                        </SelectItem>
                        {Array.from({ length: Math.min(maxRates, 12) - 1 }, (_, i) => i + 2).map(
                          (n) => (
                            <SelectItem key={n} value={String(n)}>
                              {n} Raten à {formatCurrency(Math.ceil((totalAmount / n) * 100) / 100)}
                            </SelectItem>
                          )
                        )}
                      </SelectContent>
                    </Select>
                    <p className="text-xs text-muted-foreground">Ohne Aufschlag — keine Extrakosten für den Patienten.</p>
                  </div>
                )}

                {pkg && !isCustom && pkg.gebuh_items.length > 0 && (
                  <div className="space-y-1.5">
                    <Label className="text-xs text-muted-foreground">GebüH-Positionen</Label>
                    <div className="space-y-1 text-xs">
                      {pkg.gebuh_items.map((item, i) => (
                        <div key={i} className="flex justify-between py-1 border-b border-slate-100 last:border-0">
                          <span>
                            {item.analog ? "A " : ""}{item.ziffer} {item.beschreibung}
                          </span>
                          <span className="font-medium">{formatCurrency(item.einzelpreis)}</span>
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </div>

              <DialogFooter>
                <Button variant="outline" onClick={() => setShowCreate(false)}>
                  Abbrechen
                </Button>
                <Button
                  onClick={handleCreate}
                  disabled={creating || (!selectedPackage)}
                  className="bg-emerald-600 hover:bg-emerald-700"
                >
                  {creating ? <Loader2 className="h-4 w-4 animate-spin mr-1.5" /> : null}
                  Anlegen
                </Button>
              </DialogFooter>
            </DialogContent>
          </Dialog>
        </div>
      </CardHeader>
      <CardContent>
        {plans.length === 0 ? (
          <p className="text-sm text-muted-foreground text-center py-6">
            Keine Behandlungspakete angelegt.
          </p>
        ) : (
          <div className="space-y-4">
            {plans.map((plan) => (
              <PaymentPlanCard key={plan.id} plan={plan} />
            ))}
          </div>
        )}
      </CardContent>
    </Card>
  )
}

function PaymentPlanCard({ plan }: { plan: PaymentPlan }) {
  const paidCount = plan.payment_installments.filter((i) => i.status === "paid").length
  const sortedInstallments = [...plan.payment_installments].sort(
    (a, b) => a.installment_number - b.installment_number
  )

  return (
    <div className="rounded-lg border border-slate-200 p-4">
      <div className="flex items-center justify-between mb-3">
        <div>
          <p className="font-medium text-sm">{plan.package_name}</p>
          <p className="text-xs text-muted-foreground">
            {formatCurrency(plan.total_amount)} — {plan.num_installments === 1
              ? "Einmalzahlung"
              : `${plan.num_installments} Raten`}
          </p>
        </div>
        <Badge variant={plan.status === "completed" ? "default" : plan.status === "active" ? "secondary" : "outline"}>
          {plan.status === "active" ? `${paidCount}/${plan.num_installments} bezahlt` : plan.status === "completed" ? "Abgeschlossen" : plan.status}
        </Badge>
      </div>

      {plan.num_installments > 1 && (
        <div className="space-y-1.5">
          {sortedInstallments.map((inst) => {
            const cfg = INSTALLMENT_STATUS[inst.status]
            return (
              <div key={inst.id} className="flex items-center justify-between text-xs py-1.5 border-b border-slate-50 last:border-0">
                <span className="text-muted-foreground">
                  Rate {inst.installment_number}/{plan.num_installments}
                </span>
                <span>{formatDate(inst.due_date)}</span>
                <span className="font-medium">{formatCurrency(inst.amount)}</span>
                <span className={`px-2 py-0.5 rounded-full text-[10px] font-medium ${cfg.color}`}>
                  {cfg.label}
                </span>
              </div>
            )
          })}
        </div>
      )}
    </div>
  )
}
