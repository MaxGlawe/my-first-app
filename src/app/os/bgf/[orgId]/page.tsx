"use client"

import { use, useEffect, useState, useCallback } from "react"
import Link from "next/link"
import { useState as useStateReact } from "react"
import {
  ArrowLeft,
  Users,
  Activity,
  ClipboardCheck,
  Building2,
  Mail,
  Phone,
  MapPin,
  RefreshCw,
  ExternalLink,
  UserPlus,
  Loader2,
  CheckCircle2,
  Copy,
  Stethoscope,
  FileText,
  CreditCard,
  type LucideIcon,
} from "lucide-react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog"
import { Skeleton } from "@/components/ui/skeleton"
import { Progress } from "@/components/ui/progress"
import { useBgfOrganization } from "@/hooks/use-bgf-organization"
import { useBgfMembers } from "@/hooks/use-bgf-members"
import { OrgStatusBadge } from "@/components/bgf/OrgStatusBadge"
import { MemberStatusBadge } from "@/components/bgf/MemberStatusBadge"
import { AmpelDot } from "@/components/bgf/AmpelDot"
import { FreischaltungDialog } from "@/components/bgf/FreischaltungDialog"
import { SignaturePad } from "@/components/contracts/SignaturePad"
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table"
import { fmtCurrencyEuro, paketVertragsLabel } from "@/lib/bgf-pakete"

// ── Stat Card ─────────────────────────────────────────────────────────────────

interface StatCardProps {
  label: string
  value: string | number
  icon: LucideIcon
  iconBg: string
  iconColor: string
  sub?: string
}

function StatCard({ label, value, icon: Icon, iconBg, iconColor, sub }: StatCardProps) {
  return (
    <div className="rounded-2xl bg-white/80 backdrop-blur-sm border border-slate-200/60 shadow-sm p-5">
      <div className={`h-10 w-10 rounded-xl ${iconBg} flex items-center justify-center mb-3`}>
        <Icon className={`h-5 w-5 ${iconColor}`} />
      </div>
      <p className="text-2xl font-bold text-slate-800">{value}</p>
      <p className="text-xs text-slate-400 font-medium mt-1">{label}</p>
      {sub && <p className="text-xs text-slate-300 mt-0.5">{sub}</p>}
    </div>
  )
}

// ── Page ─────────────────────────────────────────────────────────────────────

export default function OrgDetailPage({ params }: { params: Promise<{ orgId: string }> }) {
  const { orgId } = use(params)
  const { organization: org, stats, isLoading, error, refresh } = useBgfOrganization(orgId)
  const { members, isLoading: membersLoading, refresh: refreshMembers } = useBgfMembers({
    orgId,
  })

  function handleRefresh() {
    refresh()
    refreshMembers()
  }

  // ── Loading ──────────────────────────────────────────────────────────────

  if (isLoading) {
    return (
      <div className="container mx-auto py-8 px-4 max-w-5xl space-y-6">
        <Skeleton className="h-8 w-48" />
        <div className="grid grid-cols-2 sm:grid-cols-3 gap-4">
          {Array.from({ length: 3 }).map((_, i) => <Skeleton key={i} className="h-28 rounded-2xl" />)}
        </div>
        <Skeleton className="h-64 rounded-2xl" />
      </div>
    )
  }

  if (error || !org) {
    return (
      <div className="container mx-auto py-8 px-4 max-w-5xl">
        <Link href="/os/bgf" className="flex items-center gap-1.5 text-sm text-slate-500 hover:text-slate-700 mb-4">
          <ArrowLeft className="h-4 w-4" /> Zurück
        </Link>
        <Card className="border-red-200 bg-red-50">
          <CardContent className="p-6 text-red-600">
            {error ?? "Organisation nicht gefunden."}
          </CardContent>
        </Card>
      </div>
    )
  }

  const teilnahmequote = stats
    ? stats.total_members > 0
      ? Math.round((stats.aktive_members / stats.total_members) * 100)
      : 0
    : 0

  const recentMembers = members.slice(0, 8)

  return (
    <div className="container mx-auto py-8 px-4 max-w-5xl">
      {/* Back + Header */}
      <div className="mb-6">
        <Link
          href="/os/bgf"
          className="flex items-center gap-1.5 text-sm text-slate-400 hover:text-slate-600 mb-4 w-fit"
        >
          <ArrowLeft className="h-4 w-4" /> BGF-Übersicht
        </Link>

        <div className="flex items-start justify-between gap-4">
          <div className="flex items-center gap-3">
            <div className="h-12 w-12 rounded-2xl bg-emerald-50 border border-emerald-100 flex items-center justify-center">
              <Building2 className="h-6 w-6 text-emerald-600" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h1 className="text-xl font-bold text-slate-800">{org.name}</h1>
                <AmpelDot teilnahmequote={teilnahmequote} />
              </div>
              <div className="flex items-center gap-2 mt-1">
                <OrgStatusBadge status={org.status} />
                {org.branche && (
                  <span className="text-xs text-slate-400">{org.branche}</span>
                )}
              </div>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <Button
              variant="ghost"
              size="icon"
              onClick={handleRefresh}
              title="Aktualisieren"
              className="text-slate-400 hover:text-slate-600"
            >
              <RefreshCw className="h-4 w-4" />
            </Button>
            <HrInviteDialog orgId={orgId} orgName={org.name} />
            <Link href={`/os/bgf/${orgId}/members`}>
              <Button variant="outline" size="sm" className="gap-2">
                <Users className="h-4 w-4" />
                Alle Mitarbeiter
                <ExternalLink className="h-3.5 w-3.5" />
              </Button>
            </Link>
          </div>
        </div>
      </div>

      {/* Stats row */}
      <div className="grid grid-cols-2 sm:grid-cols-3 gap-4 mb-8">
        <StatCard
          label="Mitarbeiter gesamt"
          value={stats?.total_members ?? 0}
          icon={Users}
          iconBg="bg-blue-50"
          iconColor="text-blue-600"
          sub={`von ${org.vertrag_lizenzen} Lizenzen`}
        />
        <StatCard
          label="Aktive Mitarbeiter"
          value={stats?.aktive_members ?? 0}
          icon={Activity}
          iconBg="bg-emerald-50"
          iconColor="text-emerald-600"
        />
        <StatCard
          label="Ist-Analyse Quote"
          value={`${stats?.ist_analyse_quote ?? 0}%`}
          icon={ClipboardCheck}
          iconBg="bg-teal-50"
          iconColor="text-teal-600"
        />
      </div>

      {/* Participation rate */}
      <Card className="mb-6 border-slate-200/60 bg-white/80 shadow-sm">
        <CardContent className="p-5">
          <div className="flex items-center justify-between mb-2">
            <p className="text-sm font-medium text-slate-700">Teilnahmequote</p>
            <span className="text-lg font-bold text-slate-800">{teilnahmequote}%</span>
          </div>
          <Progress value={teilnahmequote} className="h-2" />
          <p className="text-xs text-slate-400 mt-2">
            {stats?.aktive_members ?? 0} aktiv von {stats?.total_members ?? 0} freigeschalteten Mitarbeitern
          </p>
        </CardContent>
      </Card>

      {/* Two column layout */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Contact / Contract info */}
        <div className="space-y-4">
          <Card className="border-slate-200/60 bg-white/80 shadow-sm">
            <CardHeader className="pb-3">
              <CardTitle className="text-sm font-semibold text-slate-700">Kontakt</CardTitle>
            </CardHeader>
            <CardContent className="space-y-3 text-sm">
              <div className="flex items-start gap-2">
                <Users className="h-4 w-4 text-slate-400 mt-0.5 flex-shrink-0" />
                <div>
                  <p className="text-slate-700 font-medium">{org.kontakt_name}</p>
                </div>
              </div>
              <div className="flex items-center gap-2">
                <Mail className="h-4 w-4 text-slate-400 flex-shrink-0" />
                <a href={`mailto:${org.kontakt_email}`} className="text-emerald-600 hover:underline truncate">
                  {org.kontakt_email}
                </a>
              </div>
              {org.kontakt_telefon && (
                <div className="flex items-center gap-2">
                  <Phone className="h-4 w-4 text-slate-400 flex-shrink-0" />
                  <span className="text-slate-600">{org.kontakt_telefon}</span>
                </div>
              )}
              {org.adresse_ort && (
                <div className="flex items-start gap-2">
                  <MapPin className="h-4 w-4 text-slate-400 mt-0.5 flex-shrink-0" />
                  <span className="text-slate-600">
                    {[org.adresse_strasse, org.adresse_plz, org.adresse_ort]
                      .filter(Boolean)
                      .join(", ")}
                  </span>
                </div>
              )}
            </CardContent>
          </Card>

          <Card className="border-slate-200/60 bg-white/80 shadow-sm">
            <CardHeader className="pb-3">
              <CardTitle className="text-sm font-semibold text-slate-700">Vertrag</CardTitle>
            </CardHeader>
            <CardContent className="space-y-2 text-sm">
              <div className="flex justify-between">
                <span className="text-slate-400">Paket</span>
                <span className="text-slate-700 font-medium">
                  {paketVertragsLabel(org.vertrag_paket_max_ma)}
                </span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-400">Mitarbeitende</span>
                <span className="text-slate-700 font-medium">{org.vertrag_lizenzen}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-400">Monatspreis</span>
                <span className="text-slate-700 font-medium">
                  {org.vertrag_monatspreis != null
                    ? fmtCurrencyEuro(org.vertrag_monatspreis)
                    : "—"}
                </span>
              </div>
              {org.vertrag_start && (
                <div className="flex justify-between">
                  <span className="text-slate-400">Vertragsbeginn</span>
                  <span className="text-slate-700">
                    {new Date(org.vertrag_start).toLocaleDateString("de-DE")}
                  </span>
                </div>
              )}
              {org.groesse && (
                <div className="flex justify-between">
                  <span className="text-slate-400">Unternehmensgröße</span>
                  <span className="text-slate-700">{org.groesse} MA</span>
                </div>
              )}

              {/* Vertrag erstellen Button */}
              <div className="pt-3 border-t border-slate-100">
                <BgfContractButton
                  orgId={orgId}
                  orgName={org.name}
                  paketMaxMa={org.vertrag_paket_max_ma}
                  lizenzen={org.vertrag_lizenzen}
                  monatspreis={org.vertrag_monatspreis}
                  vertragStart={org.vertrag_start ?? null}
                />
              </div>
            </CardContent>
          </Card>

          {/* Therapeut assignment */}
          <TherapeutAssignment orgId={orgId} currentTherapeutId={org.therapeut_id ?? null} onChanged={refresh} />

          {/* SEPA Lastschrift */}
          <SepaSetupCard orgId={orgId} />

        </div>

        {/* Recent members */}
        <div className="lg:col-span-2">
          <Card className="border-slate-200/60 bg-white/80 shadow-sm">
            <CardHeader className="pb-3">
              <div className="flex items-center justify-between">
                <CardTitle className="text-sm font-semibold text-slate-700">
                  Mitarbeiter (letzte {recentMembers.length})
                </CardTitle>
                <div className="flex items-center gap-2">
                  <FreischaltungDialog
                    orgId={orgId}
                    abteilungen={org.abteilungen}
                    onSuccess={handleRefresh}
                  />
                  <Link href={`/os/bgf/${orgId}/members`}>
                    <Button variant="ghost" size="sm" className="text-xs text-slate-400">
                      Alle anzeigen
                    </Button>
                  </Link>
                </div>
              </div>
            </CardHeader>
            <CardContent className="p-0">
              {membersLoading ? (
                <div className="p-4 space-y-2">
                  {Array.from({ length: 4 }).map((_, i) => (
                    <Skeleton key={i} className="h-10 w-full" />
                  ))}
                </div>
              ) : recentMembers.length === 0 ? (
                <div className="py-12 text-center text-slate-400">
                  <Users className="h-8 w-8 mx-auto mb-2 opacity-30" />
                  <p className="text-sm">Noch keine Mitarbeiter freigeschaltet.</p>
                </div>
              ) : (
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Name</TableHead>
                      <TableHead>E-Mail</TableHead>
                      <TableHead>Abteilung</TableHead>
                      <TableHead>Status</TableHead>
                      <TableHead>Ist-Analyse</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {recentMembers.map((member) => (
                      <TableRow key={member.id}>
                        <TableCell className="font-medium">
                          {[member.vorname, member.nachname].filter(Boolean).join(" ") || "—"}
                        </TableCell>
                        <TableCell className="text-slate-500 text-sm">{member.email}</TableCell>
                        <TableCell className="text-slate-500 text-sm">
                          {member.abteilung || "—"}
                        </TableCell>
                        <TableCell>
                          <MemberStatusBadge status={member.status} />
                        </TableCell>
                        <TableCell>
                          {member.ist_analyse_abgeschlossen ? (
                            <span className="text-xs text-emerald-600 font-medium">Abgeschlossen</span>
                          ) : (
                            <span className="text-xs text-slate-400">Ausstehend</span>
                          )}
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              )}
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  )
}

// ── SEPA Setup Card ─────────────────────────────────────────────────

function SepaSetupCard({ orgId }: { orgId: string }) {
  const [sepaActive, setSepaActive] = useStateReact(false)
  const [sepaInfo, setSepaInfo] = useStateReact<{ last4: string; country: string }[]>([])
  const [isLoading, setIsLoading] = useStateReact(true)
  const [setting, setSetting] = useStateReact(false)

  useEffect(() => {
    fetch(`/api/bgf/organizations/${orgId}/setup-sepa`)
      .then((r) => r.json())
      .then((data) => {
        setSepaActive(data.sepa_active ?? false)
        setSepaInfo(data.payment_methods ?? [])
      })
      .catch(() => {})
      .finally(() => setIsLoading(false))
  }, [orgId])

  async function handleSetup() {
    setSetting(true)
    try {
      const res = await fetch(`/api/bgf/organizations/${orgId}/setup-sepa`, { method: "POST" })
      const data = await res.json()
      if (data.checkout_url) {
        window.open(data.checkout_url, "_blank")
      }
    } catch {
      // Error
    } finally {
      setSetting(false)
    }
  }

  if (isLoading) return null

  return (
    <Card className="border-slate-200/60 bg-white/80 shadow-sm">
      <CardHeader className="pb-3">
        <CardTitle className="text-sm font-semibold text-slate-700 flex items-center gap-2">
          <CreditCard className="h-4 w-4 text-slate-400" />
          SEPA-Lastschrift
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-3">
        {sepaActive && sepaInfo.length > 0 ? (
          <>
            <div className="flex items-center gap-2 bg-emerald-50 rounded-lg p-2.5 border border-emerald-100">
              <CheckCircle2 className="h-4 w-4 text-emerald-500" />
              <div>
                <span className="text-xs font-medium text-emerald-700">Lastschrift aktiv</span>
                <p className="text-[10px] text-emerald-600">
                  IBAN ····{sepaInfo[0].last4} ({sepaInfo[0].country})
                </p>
              </div>
            </div>
            <Button
              size="sm"
              variant="outline"
              onClick={handleSetup}
              disabled={setting}
              className="w-full text-xs"
            >
              Zahlungsmethode ändern
            </Button>
          </>
        ) : (
          <>
            <div className="flex items-center gap-2 bg-amber-50 rounded-lg p-2.5 border border-amber-100">
              <span className="text-xs text-amber-700">Keine Lastschrift eingerichtet</span>
            </div>
            <Button
              size="sm"
              onClick={handleSetup}
              disabled={setting}
              className="w-full gap-2 bg-blue-600 hover:bg-blue-700 text-xs"
            >
              {setting ? <Loader2 className="h-3.5 w-3.5 animate-spin" /> : <CreditCard className="h-3.5 w-3.5" />}
              Lastschrift einrichten
            </Button>
            <p className="text-[10px] text-slate-400">
              Öffnet Stripe Checkout für den HR-Kontakt zur IBAN-Eingabe.
            </p>
          </>
        )}
      </CardContent>
    </Card>
  )
}

// ── BGF Contract Button ─────────────────────────────────────────────

function BgfContractButton({
  orgId,
  orgName,
  paketMaxMa,
  lizenzen,
  monatspreis,
  vertragStart,
}: {
  orgId: string
  orgName: string
  paketMaxMa: number | null
  lizenzen: number
  monatspreis: number | null
  vertragStart: string | null
}) {
  const [creating, setCreating] = useStateReact(false)
  const [contractStatus, setContractStatus] = useStateReact<string | null>(null)
  const [contractId, setContractId] = useStateReact<string | null>(null)
  const [hasPraxisSignature, setHasPraxisSignature] = useStateReact(false)
  const [signingToken, setSigningToken] = useStateReact<string | null>(null)
  const [showSignDialog, setShowSignDialog] = useStateReact(false)
  const [signaturePng, setSignaturePng] = useStateReact<string | null>(null)
  const [error, setError] = useStateReact<string | null>(null)

  // Stable callback for SignaturePad (prevents useEffect re-fire which clears the canvas)
  const handleSignatureChange = useCallback((png: string | null) => {
    setSignaturePng(png)
  }, [])

  // Check if contract already exists
  useEffect(() => {
    fetch(`/api/admin/bgf-contracts?organization_id=${orgId}`)
      .then((r) => r.json())
      .then((data) => {
        const contracts = data.contracts ?? []
        if (contracts.length > 0) {
          const latest = contracts[0]
          setContractStatus(latest.status)
          setContractId(latest.id)
          setSigningToken(latest.signing_token)
          setHasPraxisSignature(!!latest.praxis_signature_png)
        }
      })
      .catch(() => {})
  }, [orgId])

  async function handleCreate() {
    setCreating(true)
    setError(null)
    try {
      const today = new Date().toISOString().split("T")[0]
      const res = await fetch("/api/admin/bgf-contracts", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          organization_id: orgId,
          paket_max_ma: paketMaxMa,
          // Ohne Staffel (individuelles Paket) muss der Betrag mitkommen.
          monatspreis: monatspreis ?? undefined,
          lizenzen,
          laufzeit_monate: 12,
          vertrag_start: vertragStart || today,
        }),
      })
      const data = await res.json()
      if (!res.ok) {
        setError(data.error || "Fehler beim Erstellen.")
        return
      }
      setContractId(data.contract.id)
      setContractStatus("entwurf")
      setSigningToken(data.contract.signing_token)
    } catch {
      setError("Netzwerkfehler.")
    } finally {
      setCreating(false)
    }
  }

  async function handleSaveSignatureAndSend() {
    if (!contractId || !signaturePng) return
    setCreating(true)
    setError(null)
    try {
      // 1. Save praxis signature
      const patchRes = await fetch(`/api/admin/bgf-contracts/${contractId}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ praxis_signature_png: signaturePng }),
      })
      if (!patchRes.ok) {
        const d = await patchRes.json()
        setError(d.error || "Signatur konnte nicht gespeichert werden.")
        return
      }
      setHasPraxisSignature(true)

      // 2. Send contract
      const sendRes = await fetch(`/api/admin/bgf-contracts/${contractId}/send`, {
        method: "POST",
      })
      const sendData = await sendRes.json()
      if (!sendRes.ok) {
        setError(sendData.error || "Fehler beim Versenden.")
        return
      }
      setContractStatus("versendet")
      setShowSignDialog(false)
    } catch {
      setError("Netzwerkfehler.")
    } finally {
      setCreating(false)
    }
  }

  async function handleDeleteDraft() {
    if (!contractId) return
    if (!window.confirm("Entwurf wirklich löschen?")) return
    setCreating(true)
    setError(null)
    try {
      const res = await fetch(`/api/admin/bgf-contracts/${contractId}`, {
        method: "DELETE",
      })
      if (!res.ok) {
        const data = await res.json().catch(() => ({}))
        setError(data.error || "Fehler beim Löschen.")
        return
      }
      setContractId(null)
      setContractStatus(null)
      setSigningToken(null)
      setHasPraxisSignature(false)
    } catch {
      setError("Netzwerkfehler.")
    } finally {
      setCreating(false)
    }
  }

  async function handleSendExisting() {
    if (!contractId) return
    if (!hasPraxisSignature) {
      setShowSignDialog(true)
      return
    }
    setCreating(true)
    setError(null)
    try {
      const res = await fetch(`/api/admin/bgf-contracts/${contractId}/send`, {
        method: "POST",
      })
      const data = await res.json()
      if (!res.ok) {
        setError(data.error || "Fehler beim Versenden.")
        return
      }
      setContractStatus("versendet")
    } catch {
      setError("Netzwerkfehler.")
    } finally {
      setCreating(false)
    }
  }

  if (error) {
    return (
      <div className="space-y-2">
        <p className="text-xs text-red-500">{error}</p>
        <Button size="sm" variant="outline" onClick={() => setError(null)} className="w-full text-xs">
          Erneut versuchen
        </Button>
      </div>
    )
  }

  // Signature Dialog
  if (showSignDialog) {
    return (
      <div className="space-y-3">
        <p className="text-xs font-semibold text-slate-700">Praxis-Unterschrift</p>
        <p className="text-[10px] text-slate-400">
          Unterschreiben Sie als Auftragnehmer, bevor der Vertrag versendet wird.
        </p>
        <div className="border border-slate-200 rounded-xl overflow-hidden">
          <SignaturePad onSignatureChange={handleSignatureChange} />
        </div>
        <div className="flex gap-2">
          <Button
            size="sm"
            variant="outline"
            onClick={() => setShowSignDialog(false)}
            className="flex-1 text-xs"
          >
            Abbrechen
          </Button>
          <Button
            size="sm"
            onClick={handleSaveSignatureAndSend}
            disabled={!signaturePng || creating}
            className="flex-1 gap-1.5 bg-emerald-600 hover:bg-emerald-700 text-xs"
          >
            {creating ? <Loader2 className="h-3.5 w-3.5 animate-spin" /> : <Mail className="h-3.5 w-3.5" />}
            Unterschreiben & senden
          </Button>
        </div>
      </div>
    )
  }

  // Show status if contract exists
  if (contractStatus === "unterschrieben") {
    return (
      <div className="space-y-2">
        <div className="flex items-center gap-2 bg-emerald-50 rounded-lg p-2 border border-emerald-100">
          <CheckCircle2 className="h-4 w-4 text-emerald-500" />
          <span className="text-xs font-medium text-emerald-700">Vertrag unterschrieben</span>
        </div>
        <Button
          size="sm"
          variant="outline"
          onClick={() => {
            setContractId(null)
            setContractStatus(null)
            setSigningToken(null)
            setHasPraxisSignature(false)
          }}
          className="w-full text-xs text-slate-500"
        >
          Neuen Vertrag erstellen
        </Button>
      </div>
    )
  }

  if (contractStatus === "versendet") {
    return (
      <div className="space-y-2">
        <div className="flex items-center justify-between bg-blue-50 rounded-lg p-2 border border-blue-100">
          <div className="flex items-center gap-2">
            <Mail className="h-4 w-4 text-blue-500" />
            <span className="text-xs font-medium text-blue-700">Versendet — warte auf Unterschrift</span>
          </div>
          <button
            onClick={handleDeleteDraft}
            disabled={creating}
            className="text-[10px] text-red-400 hover:text-red-600 font-medium transition-colors"
          >
            Stornieren
          </button>
        </div>
      </div>
    )
  }

  if (contractStatus === "entwurf" && contractId) {
    return (
      <div className="space-y-2">
        <div className="flex items-center justify-between bg-slate-50 rounded-lg p-2 border border-slate-100">
          <div className="flex items-center gap-2">
            <FileText className="h-4 w-4 text-slate-400" />
            <span className="text-xs font-medium text-slate-600">Entwurf erstellt</span>
          </div>
          <button
            onClick={handleDeleteDraft}
            disabled={creating}
            className="text-[10px] text-red-400 hover:text-red-600 font-medium transition-colors"
          >
            Löschen
          </button>
        </div>
        <div className="flex gap-2">
          {signingToken && (
            <Button
              size="sm"
              variant="outline"
              onClick={() => window.open(`/bgf-vertrag/${signingToken}?vorschau=1`, "_blank")}
              className="flex-1 gap-1.5 text-xs"
            >
              <ExternalLink className="h-3.5 w-3.5" />
              Vorschau
            </Button>
          )}
          <Button
            size="sm"
            onClick={handleSendExisting}
            disabled={creating}
            className="flex-1 gap-1.5 bg-blue-600 hover:bg-blue-700 text-xs"
          >
            {creating ? <Loader2 className="h-3.5 w-3.5 animate-spin" /> : <Mail className="h-3.5 w-3.5" />}
            Senden
          </Button>
        </div>
      </div>
    )
  }

  return (
    <Button
      size="sm"
      onClick={handleCreate}
      disabled={creating}
      className="w-full gap-2 bg-emerald-600 hover:bg-emerald-700 text-xs"
    >
      {creating ? <Loader2 className="h-3.5 w-3.5 animate-spin" /> : <FileText className="h-3.5 w-3.5" />}
      Vertrag erstellen
    </Button>
  )
}

// ── Therapeut Assignment Card ────────────────────────────────────────

function TherapeutAssignment({
  orgId,
  currentTherapeutId,
  onChanged,
}: {
  orgId: string
  currentTherapeutId: string | null
  onChanged: () => void
}) {
  const [therapeuten, setTherapeuten] = useStateReact<{ id: string; name: string; role: string }[]>([])
  const [selected, setSelected] = useStateReact<string>(currentTherapeutId ?? "")
  const [saving, setSaving] = useStateReact(false)
  const [saved, setSaved] = useStateReact(false)

  useEffect(() => {
    async function loadTherapeuten() {
      try {
        const res = await fetch("/api/bgf/therapeuten")
        if (res.ok) {
          const data = await res.json()
          setTherapeuten(data.therapeuten ?? [])
        }
      } catch {
        // Non-critical
      }
    }
    loadTherapeuten()
  }, [])

  useEffect(() => {
    setSelected(currentTherapeutId ?? "")
  }, [currentTherapeutId])

  async function handleSave() {
    if (!selected) return
    setSaving(true)
    setSaved(false)
    try {
      const res = await fetch(`/api/bgf/organizations/${orgId}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ therapeut_id: selected }),
      })
      if (res.ok) {
        setSaved(true)
        onChanged()
        setTimeout(() => setSaved(false), 2000)
      }
    } catch {
      // Error handling
    } finally {
      setSaving(false)
    }
  }

  const currentName = therapeuten.find((t) => t.id === currentTherapeutId)?.name

  return (
    <Card className="border-slate-200/60 bg-white/80 shadow-sm">
      <CardHeader className="pb-3">
        <CardTitle className="text-sm font-semibold text-slate-700 flex items-center gap-2">
          <Stethoscope className="h-4 w-4 text-slate-400" />
          Betreuender Therapeut
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-3">
        {currentName ? (
          <div className="flex items-center gap-2 bg-emerald-50 rounded-lg p-2.5 border border-emerald-100">
            <CheckCircle2 className="h-4 w-4 text-emerald-500 flex-shrink-0" />
            <span className="text-sm font-medium text-emerald-700">{currentName}</span>
          </div>
        ) : (
          <div className="flex items-center gap-2 bg-amber-50 rounded-lg p-2.5 border border-amber-100">
            <span className="text-sm text-amber-700">Kein Therapeut zugewiesen</span>
          </div>
        )}

        <div>
          <Label htmlFor="therapeut-select" className="text-xs text-slate-500">
            {currentTherapeutId ? "Therapeut ändern" : "Therapeut zuweisen"}
          </Label>
          <select
            id="therapeut-select"
            value={selected}
            onChange={(e) => setSelected(e.target.value)}
            className="mt-1 w-full h-9 rounded-md border border-slate-200 bg-white px-3 text-sm text-slate-700 focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500"
          >
            <option value="">— Bitte wählen —</option>
            {therapeuten.map((t) => (
              <option key={t.id} value={t.id}>
                {t.name} ({t.role})
              </option>
            ))}
          </select>
        </div>

        <Button
          size="sm"
          onClick={handleSave}
          disabled={saving || !selected || selected === currentTherapeutId}
          className="w-full gap-2 bg-emerald-600 hover:bg-emerald-700"
        >
          {saving ? (
            <Loader2 className="h-4 w-4 animate-spin" />
          ) : saved ? (
            <>
              <CheckCircle2 className="h-4 w-4" />
              Gespeichert
            </>
          ) : (
            "Therapeut zuweisen"
          )}
        </Button>
      </CardContent>
    </Card>
  )
}

// ── HR Invite Dialog ─────────────────────────────────────────────────

function HrInviteDialog({ orgId, orgName }: { orgId: string; orgName: string }) {
  const [open, setOpen] = useStateReact(false)
  const [email, setEmail] = useStateReact("")
  const [vorname, setVorname] = useStateReact("")
  const [nachname, setNachname] = useStateReact("")
  const [saving, setSaving] = useStateReact(false)
  const [error, setError] = useStateReact<string | null>(null)
  const [result, setResult] = useStateReact<{ message: string; invite_link?: string } | null>(null)

  async function handleInvite(e: React.FormEvent) {
    e.preventDefault()
    setSaving(true)
    setError(null)

    try {
      const res = await fetch(`/api/bgf/organizations/${orgId}/invite-hr`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          email: email.trim(),
          vorname: vorname.trim(),
          nachname: nachname.trim(),
          rolle: "hr_admin",
        }),
      })

      const data = await res.json()

      if (!res.ok) {
        setError(data.error || "Fehler beim Einladen.")
        setSaving(false)
        return
      }

      setResult(data)
      setSaving(false)
    } catch {
      setError("Netzwerkfehler.")
      setSaving(false)
    }
  }

  function handleCopy() {
    if (result?.invite_link) {
      navigator.clipboard.writeText(result.invite_link)
    }
  }

  function handleClose() {
    setOpen(false)
    setEmail("")
    setVorname("")
    setNachname("")
    setError(null)
    setResult(null)
  }

  return (
    <Dialog open={open} onOpenChange={(v) => { if (!v) handleClose(); else setOpen(true) }}>
      <DialogTrigger asChild>
        <Button variant="outline" size="sm" className="gap-2">
          <UserPlus className="h-4 w-4" />
          HR einladen
        </Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>HR-Zugang einrichten — {orgName}</DialogTitle>
        </DialogHeader>

        {result ? (
          <div className="space-y-4 py-2">
            <div className="flex items-start gap-3 bg-emerald-50 rounded-xl p-4 border border-emerald-200">
              <CheckCircle2 className="h-5 w-5 text-emerald-500 mt-0.5 flex-shrink-0" />
              <div>
                <p className="text-sm font-medium text-emerald-700">{result.message}</p>
                {result.invite_link && (
                  <p className="text-xs text-emerald-600 mt-1">
                    Falls die E-Mail nicht ankommt, können Sie den Link manuell teilen.
                  </p>
                )}
              </div>
            </div>

            {result.invite_link && (
              <div>
                <Label className="text-xs text-slate-500">Einladungs-Link (Backup)</Label>
                <div className="flex items-center gap-2 mt-1">
                  <Input
                    value={result.invite_link}
                    readOnly
                    className="text-xs font-mono"
                  />
                  <Button size="icon" variant="outline" onClick={handleCopy} title="Kopieren">
                    <Copy className="h-4 w-4" />
                  </Button>
                </div>
              </div>
            )}

            <Button onClick={handleClose} className="w-full">
              Fertig
            </Button>
          </div>
        ) : (
          <form onSubmit={handleInvite} className="space-y-4 py-2">
            {error && (
              <div className="rounded-lg bg-red-50 border border-red-200 p-3 text-sm text-red-600">
                {error}
              </div>
            )}

            <div className="grid grid-cols-2 gap-3">
              <div>
                <Label htmlFor="hr-vorname">Vorname</Label>
                <Input
                  id="hr-vorname"
                  value={vorname}
                  onChange={(e) => setVorname(e.target.value)}
                  placeholder="Max"
                  required
                  className="mt-1"
                />
              </div>
              <div>
                <Label htmlFor="hr-nachname">Nachname</Label>
                <Input
                  id="hr-nachname"
                  value={nachname}
                  onChange={(e) => setNachname(e.target.value)}
                  placeholder="Mustermann"
                  required
                  className="mt-1"
                />
              </div>
            </div>

            <div>
              <Label htmlFor="hr-email">E-Mail</Label>
              <Input
                id="hr-email"
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="hr@firma.de"
                required
                className="mt-1"
              />
            </div>

            <p className="text-xs text-slate-400">
              Der HR-Admin erhält eine E-Mail mit einem Link zum Passwort setzen.
              Danach hat er Zugang zum anonymisierten Gesundheits-Dashboard.
            </p>

            <Button
              type="submit"
              disabled={saving || !email.trim() || !vorname.trim() || !nachname.trim()}
              className="w-full gap-2 bg-emerald-600 hover:bg-emerald-700"
            >
              {saving ? <Loader2 className="h-4 w-4 animate-spin" /> : <Mail className="h-4 w-4" />}
              Einladung senden
            </Button>
          </form>
        )}
      </DialogContent>
    </Dialog>
  )
}
