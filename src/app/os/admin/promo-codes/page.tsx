"use client"

import { useEffect, useState } from "react"
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
import { Gift, Plus, Loader2, Copy, Check, ChevronDown, ChevronUp, User } from "lucide-react"

interface Redemption {
  id: string
  redeemed_at: string
  patient_id: string
  patients: { vorname: string; nachname: string } | null
}

interface PromoCode {
  id: string
  code: string
  description: string | null
  type: "free_months" | "percent_off" | "amount_off"
  value: number
  max_redemptions: number | null
  current_redemptions: number
  valid_until: string | null
  is_active: boolean
  created_at: string
  promo_code_redemptions: Redemption[]
}

const TYPE_LABELS: Record<string, string> = {
  free_months: "Gratis-Monate",
  percent_off: "Prozent-Rabatt",
  amount_off: "Festbetrag-Rabatt",
}

function formatValue(type: string, value: number): string {
  if (type === "free_months") return `${value} Monat${value > 1 ? "e" : ""} gratis`
  if (type === "percent_off") return `${value}% Rabatt`
  return `${value.toLocaleString("de-DE", { style: "currency", currency: "EUR" })} Rabatt`
}

function formatDate(d: string | null): string {
  if (!d) return "Unbegrenzt"
  return new Date(d).toLocaleDateString("de-DE", { day: "2-digit", month: "2-digit", year: "numeric" })
}

function CopyButton({ text }: { text: string }) {
  const [copied, setCopied] = useState(false)

  function handleCopy() {
    navigator.clipboard.writeText(text)
    setCopied(true)
    setTimeout(() => setCopied(false), 2000)
  }

  return (
    <button onClick={handleCopy} className="p-1 hover:bg-slate-100 rounded transition-colors" title="Code kopieren">
      {copied ? <Check className="h-3.5 w-3.5 text-emerald-600" /> : <Copy className="h-3.5 w-3.5 text-muted-foreground" />}
    </button>
  )
}

export default function PromoCodesPage() {
  const [codes, setCodes] = useState<PromoCode[]>([])
  const [loading, setLoading] = useState(true)
  const [showCreate, setShowCreate] = useState(false)
  const [creating, setCreating] = useState(false)
  const [error, setError] = useState<string | null>(null)

  // Form state
  const [code, setCode] = useState("")
  const [description, setDescription] = useState("")
  const [type, setType] = useState<"free_months" | "percent_off" | "amount_off">("free_months")
  const [value, setValue] = useState("")
  const [maxRedemptions, setMaxRedemptions] = useState("")
  const [validUntil, setValidUntil] = useState("")

  function loadCodes() {
    fetch("/api/admin/promo-codes")
      .then((res) => res.json())
      .then(setCodes)
      .catch(console.error)
      .finally(() => setLoading(false))
  }

  useEffect(() => { loadCodes() }, [])

  async function handleCreate() {
    setCreating(true)
    setError(null)

    try {
      const res = await fetch("/api/admin/promo-codes", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          code,
          description: description || undefined,
          type,
          value: parseFloat(value),
          max_redemptions: maxRedemptions ? parseInt(maxRedemptions) : undefined,
          valid_until: validUntil ? new Date(validUntil).toISOString() : undefined,
        }),
      })

      if (!res.ok) {
        const body = await res.json().catch(() => ({}))
        setError(body.error ?? "Fehler beim Erstellen.")
        return
      }

      setShowCreate(false)
      setCode("")
      setDescription("")
      setType("free_months")
      setValue("")
      setMaxRedemptions("")
      setValidUntil("")
      loadCodes()
    } catch {
      setError("Netzwerkfehler.")
    } finally {
      setCreating(false)
    }
  }

  const activeCodes = codes.filter((c) => c.is_active)
  const inactiveCodes = codes.filter((c) => !c.is_active)

  return (
    <div className="container mx-auto py-8 px-4 max-w-4xl">
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Promo-Codes</h1>
          <p className="text-muted-foreground mt-1">Gutscheine für Patienten erstellen und verwalten</p>
        </div>

        <Dialog open={showCreate} onOpenChange={setShowCreate}>
          <DialogTrigger asChild>
            <Button className="bg-emerald-600 hover:bg-emerald-700">
              <Plus className="h-4 w-4 mr-1.5" />
              Neuer Code
            </Button>
          </DialogTrigger>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Promo-Code erstellen</DialogTitle>
              <DialogDescription>
                Erstelle einen Gutschein-Code für Patienten.
              </DialogDescription>
            </DialogHeader>

            {error && (
              <Alert variant="destructive">
                <AlertDescription>{error}</AlertDescription>
              </Alert>
            )}

            <div className="space-y-4 py-2">
              <div className="space-y-1.5">
                <Label>Code *</Label>
                <Input
                  placeholder="z.B. WILLKOMMEN"
                  value={code}
                  onChange={(e) => setCode(e.target.value.toUpperCase())}
                  className="font-mono"
                />
                <p className="text-xs text-muted-foreground">Wird automatisch in Großbuchstaben umgewandelt.</p>
              </div>

              <div className="space-y-1.5">
                <Label>Beschreibung</Label>
                <Input
                  placeholder="z.B. Launch-Aktion für neue Patienten"
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-1.5">
                  <Label>Typ *</Label>
                  <Select value={type} onValueChange={(v) => setType(v as typeof type)}>
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="free_months">Gratis-Monate</SelectItem>
                      <SelectItem value="percent_off">Prozent-Rabatt</SelectItem>
                      <SelectItem value="amount_off">Festbetrag (€)</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div className="space-y-1.5">
                  <Label>
                    Wert * {type === "free_months" ? "(Monate)" : type === "percent_off" ? "(%)" : "(€)"}
                  </Label>
                  <Input
                    type="number"
                    step={type === "free_months" ? "1" : "0.01"}
                    placeholder={type === "free_months" ? "z.B. 1" : type === "percent_off" ? "z.B. 50" : "z.B. 10"}
                    value={value}
                    onChange={(e) => setValue(e.target.value)}
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-1.5">
                  <Label>Max. Einlösungen</Label>
                  <Input
                    type="number"
                    placeholder="Unbegrenzt"
                    value={maxRedemptions}
                    onChange={(e) => setMaxRedemptions(e.target.value)}
                  />
                </div>

                <div className="space-y-1.5">
                  <Label>Gültig bis</Label>
                  <Input
                    type="date"
                    value={validUntil}
                    onChange={(e) => setValidUntil(e.target.value)}
                  />
                </div>
              </div>
            </div>

            <DialogFooter>
              <Button variant="outline" onClick={() => setShowCreate(false)}>
                Abbrechen
              </Button>
              <Button
                onClick={handleCreate}
                disabled={creating || !code || !value}
                className="bg-emerald-600 hover:bg-emerald-700"
              >
                {creating ? <Loader2 className="h-4 w-4 animate-spin mr-1.5" /> : null}
                Erstellen
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </div>

      {loading ? (
        <div className="text-center py-12 text-muted-foreground">Lade Promo-Codes...</div>
      ) : codes.length === 0 ? (
        <Card>
          <CardContent className="py-12 text-center">
            <Gift className="h-10 w-10 text-muted-foreground mx-auto mb-3" />
            <p className="text-muted-foreground">Noch keine Promo-Codes erstellt.</p>
            <p className="text-sm text-muted-foreground mt-1">
              Erstelle deinen ersten Code um Patienten Gratis-Monate oder Rabatte zu geben.
            </p>
          </CardContent>
        </Card>
      ) : (
        <div className="space-y-6">
          {/* Active Codes */}
          {activeCodes.length > 0 && (
            <div>
              <h2 className="text-sm font-medium text-muted-foreground mb-3">Aktive Codes ({activeCodes.length})</h2>
              <div className="space-y-3">
                {activeCodes.map((c) => (
                  <PromoCodeCard key={c.id} promoCode={c} />
                ))}
              </div>
            </div>
          )}

          {/* Inactive Codes */}
          {inactiveCodes.length > 0 && (
            <div>
              <h2 className="text-sm font-medium text-muted-foreground mb-3">Inaktive Codes ({inactiveCodes.length})</h2>
              <div className="space-y-3 opacity-60">
                {inactiveCodes.map((c) => (
                  <PromoCodeCard key={c.id} promoCode={c} />
                ))}
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  )
}

function PromoCodeCard({ promoCode }: { promoCode: PromoCode }) {
  const [expanded, setExpanded] = useState(false)
  const isExpired = promoCode.valid_until && new Date(promoCode.valid_until) < new Date()
  const isMaxed = promoCode.max_redemptions != null && promoCode.current_redemptions >= promoCode.max_redemptions
  const redemptions = promoCode.promo_code_redemptions ?? []
  const hasRedemptions = redemptions.length > 0

  return (
    <Card>
      <CardContent className="py-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="flex items-center gap-1.5 bg-slate-100 rounded-lg px-3 py-1.5">
              <code className="text-sm font-bold tracking-wider">{promoCode.code}</code>
              <CopyButton text={promoCode.code} />
            </div>
            <div>
              <p className="text-sm font-medium">{formatValue(promoCode.type, promoCode.value)}</p>
              {promoCode.description && (
                <p className="text-xs text-muted-foreground">{promoCode.description}</p>
              )}
            </div>
          </div>

          <div className="flex items-center gap-3 text-sm">
            <div className="text-right">
              <p className="text-muted-foreground text-xs">Eingelöst</p>
              <p className="font-medium">
                {promoCode.current_redemptions}
                {promoCode.max_redemptions != null && ` / ${promoCode.max_redemptions}`}
              </p>
            </div>
            <div className="text-right">
              <p className="text-muted-foreground text-xs">Gültig bis</p>
              <p className="font-medium">{formatDate(promoCode.valid_until)}</p>
            </div>
            {(isExpired || isMaxed) && (
              <Badge variant="outline" className="text-amber-600">
                {isExpired ? "Abgelaufen" : "Ausgeschöpft"}
              </Badge>
            )}
            {hasRedemptions && (
              <button
                onClick={() => setExpanded(!expanded)}
                className="p-1.5 hover:bg-slate-100 rounded-md transition-colors"
                title="Einlösungen anzeigen"
              >
                {expanded
                  ? <ChevronUp className="h-4 w-4 text-muted-foreground" />
                  : <ChevronDown className="h-4 w-4 text-muted-foreground" />
                }
              </button>
            )}
          </div>
        </div>

        {expanded && hasRedemptions && (
          <div className="mt-3 pt-3 border-t border-slate-100">
            <p className="text-xs font-medium text-muted-foreground mb-2">Einlösungen</p>
            <div className="space-y-1.5">
              {redemptions
                .sort((a, b) => new Date(b.redeemed_at).getTime() - new Date(a.redeemed_at).getTime())
                .map((r) => (
                  <div key={r.id} className="flex items-center justify-between text-xs py-1.5 px-2 rounded bg-slate-50">
                    <div className="flex items-center gap-2">
                      <User className="h-3 w-3 text-muted-foreground" />
                      <span className="font-medium">
                        {r.patients
                          ? `${r.patients.vorname} ${r.patients.nachname}`
                          : "Unbekannter Patient"}
                      </span>
                    </div>
                    <span className="text-muted-foreground">
                      {new Date(r.redeemed_at).toLocaleDateString("de-DE", {
                        day: "2-digit",
                        month: "2-digit",
                        year: "numeric",
                        hour: "2-digit",
                        minute: "2-digit",
                      })}
                    </span>
                  </div>
                ))}
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  )
}
