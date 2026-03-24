"use client"

import { useState, useCallback } from "react"
import {
  Users,
  UserPlus,
  Search,
  Upload,
  UserX,
  UserCheck,
  Loader2,
  CheckCircle2,
  AlertCircle,
} from "lucide-react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Badge } from "@/components/ui/badge"
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
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import { Skeleton } from "@/components/ui/skeleton"
import { useHrAuth } from "@/hooks/use-hr-auth"
import { useBgfMembers } from "@/hooks/use-bgf-members"
import { MemberStatusBadge } from "@/components/bgf/MemberStatusBadge"
import type { ArbeitsplatzTyp } from "@/types/bgf"

const ARBEITSPLATZ_LABELS: Record<string, string> = {
  buero: "Büro",
  homeoffice: "Homeoffice",
  lager: "Lager",
  produktion: "Produktion",
  handwerk: "Handwerk",
  pflege: "Pflege",
  mischform: "Mischform",
}

export default function HrMitarbeiterPage() {
  const { organizationId, isLoading: authLoading } = useHrAuth()
  const [search, setSearch] = useState("")
  const [statusFilter, setStatusFilter] = useState<string>("alle")

  const { members, totalCount, isLoading, refresh } = useBgfMembers({
    orgId: organizationId ?? "",
    search: search.trim() || undefined,
    status: statusFilter !== "alle" ? statusFilter : undefined,
  })

  const aktiveCount = members.filter((m) => m.status === "aktiv").length
  const eingeladenCount = members.filter((m) => m.status === "eingeladen").length

  if (authLoading || !organizationId) {
    return (
      <div className="p-8 space-y-4">
        <Skeleton className="h-8 w-64" />
        <Skeleton className="h-64 w-full" />
      </div>
    )
  }

  return (
    <div className="container mx-auto py-8 px-4 max-w-5xl">
      {/* Header */}
      <div className="flex items-start justify-between mb-8">
        <div>
          <h1 className="text-2xl font-bold text-slate-800">Mitarbeiter-Verwaltung</h1>
          <p className="text-sm text-slate-400 mt-1">
            {aktiveCount} aktiv · {eingeladenCount} eingeladen · {totalCount} gesamt
          </p>
        </div>
        <div className="flex items-center gap-2">
          <AddMemberDialog orgId={organizationId} onSuccess={refresh} />
        </div>
      </div>

      {/* Filters */}
      <div className="flex flex-col sm:flex-row gap-3 mb-6">
        <div className="relative flex-1 max-w-sm">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
          <Input
            placeholder="Name oder E-Mail suchen..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="pl-9"
          />
        </div>
        <Select value={statusFilter} onValueChange={setStatusFilter}>
          <SelectTrigger className="w-44">
            <SelectValue placeholder="Status" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="alle">Alle Status</SelectItem>
            <SelectItem value="aktiv">Aktiv</SelectItem>
            <SelectItem value="eingeladen">Eingeladen</SelectItem>
            <SelectItem value="pausiert">Pausiert</SelectItem>
            <SelectItem value="deaktiviert">Deaktiviert</SelectItem>
          </SelectContent>
        </Select>
      </div>

      {/* Table */}
      <div className="rounded-2xl border border-slate-200 bg-white shadow-sm overflow-hidden">
        {isLoading ? (
          <div className="p-6 space-y-3">
            {[1, 2, 3, 4, 5].map((i) => (
              <Skeleton key={i} className="h-12 w-full" />
            ))}
          </div>
        ) : members.length === 0 ? (
          <div className="p-12 text-center">
            <Users className="h-10 w-10 text-slate-300 mx-auto mb-3" />
            <p className="font-medium text-slate-600">Keine Mitarbeiter gefunden</p>
            <p className="text-sm text-slate-400 mt-1">
              Laden Sie Mitarbeiter ein um das Programm zu starten.
            </p>
          </div>
        ) : (
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Name</TableHead>
                <TableHead>E-Mail</TableHead>
                <TableHead>Abteilung</TableHead>
                <TableHead>Arbeitsplatz</TableHead>
                <TableHead>Ist-Analyse</TableHead>
                <TableHead>Status</TableHead>
                <TableHead className="text-right">Aktionen</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {members.map((m) => (
                <TableRow key={m.id}>
                  <TableCell className="font-medium">
                    {m.vorname && m.nachname
                      ? `${m.vorname} ${m.nachname}`
                      : <span className="text-slate-400 italic">Nicht registriert</span>
                    }
                  </TableCell>
                  <TableCell className="text-slate-500 text-sm">{m.email}</TableCell>
                  <TableCell className="text-sm">{m.abteilung || "—"}</TableCell>
                  <TableCell className="text-sm">
                    {ARBEITSPLATZ_LABELS[m.arbeitsplatz_typ] || m.arbeitsplatz_typ}
                  </TableCell>
                  <TableCell>
                    {m.ist_analyse_abgeschlossen ? (
                      <Badge variant="outline" className="bg-emerald-50 text-emerald-700 border-emerald-200 text-xs">
                        Abgeschlossen
                      </Badge>
                    ) : (
                      <Badge variant="outline" className="bg-slate-50 text-slate-500 border-slate-200 text-xs">
                        Ausstehend
                      </Badge>
                    )}
                  </TableCell>
                  <TableCell>
                    <MemberStatusBadge status={m.status} />
                  </TableCell>
                  <TableCell className="text-right">
                    <MemberActions
                      memberId={m.id}
                      orgId={organizationId}
                      status={m.status}
                      name={m.vorname ? `${m.vorname} ${m.nachname}` : m.email}
                      onSuccess={refresh}
                    />
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        )}
      </div>

      {/* DSGVO notice */}
      <p className="text-xs text-slate-400 mt-4 text-center">
        Sie sehen nur Verwaltungsdaten. Individuelle Gesundheitsdaten sind nicht einsehbar (DSGVO).
      </p>
    </div>
  )
}

// ── Add Member Dialog ───────────────────────────────────────────────

function AddMemberDialog({
  orgId,
  onSuccess,
}: {
  orgId: string
  onSuccess: () => void
}) {
  const [open, setOpen] = useState(false)
  const [email, setEmail] = useState("")
  const [vorname, setVorname] = useState("")
  const [nachname, setNachname] = useState("")
  const [abteilung, setAbteilung] = useState("")
  const [arbeitsplatz, setArbeitsplatz] = useState<ArbeitsplatzTyp>("buero")
  const [saving, setSaving] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [success, setSuccess] = useState(false)

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    setSaving(true)
    setError(null)

    try {
      const res = await fetch(`/api/bgf/organizations/${orgId}/members`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          email: email.trim(),
          vorname: vorname.trim() || undefined,
          nachname: nachname.trim() || undefined,
          abteilung: abteilung.trim() || undefined,
          arbeitsplatz_typ: arbeitsplatz,
        }),
      })

      const data = await res.json()
      if (!res.ok) {
        setError(data.error || "Fehler beim Hinzufügen.")
        setSaving(false)
        return
      }

      setSuccess(true)
      setSaving(false)
      onSuccess()
      setTimeout(() => {
        setOpen(false)
        setEmail("")
        setVorname("")
        setNachname("")
        setAbteilung("")
        setSuccess(false)
      }, 1500)
    } catch {
      setError("Netzwerkfehler.")
      setSaving(false)
    }
  }

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button size="sm" className="gap-2 bg-emerald-600 hover:bg-emerald-700">
          <UserPlus className="h-4 w-4" />
          Mitarbeiter einladen
        </Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>Mitarbeiter freischalten</DialogTitle>
        </DialogHeader>

        {success ? (
          <div className="flex items-center gap-3 py-4">
            <CheckCircle2 className="h-5 w-5 text-emerald-500" />
            <p className="text-sm text-emerald-700">Mitarbeiter erfolgreich eingeladen!</p>
          </div>
        ) : (
          <form onSubmit={handleSubmit} className="space-y-4 py-2">
            {error && (
              <div className="rounded-lg bg-red-50 border border-red-200 p-3 text-sm text-red-600 flex items-start gap-2">
                <AlertCircle className="h-4 w-4 mt-0.5 flex-shrink-0" />
                {error}
              </div>
            )}

            <div>
              <Label>E-Mail *</Label>
              <Input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="mitarbeiter@firma.de"
                required
                className="mt-1"
              />
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div>
                <Label>Vorname</Label>
                <Input value={vorname} onChange={(e) => setVorname(e.target.value)} className="mt-1" />
              </div>
              <div>
                <Label>Nachname</Label>
                <Input value={nachname} onChange={(e) => setNachname(e.target.value)} className="mt-1" />
              </div>
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div>
                <Label>Abteilung</Label>
                <Input value={abteilung} onChange={(e) => setAbteilung(e.target.value)} placeholder="z.B. IT" className="mt-1" />
              </div>
              <div>
                <Label>Arbeitsplatz</Label>
                <Select value={arbeitsplatz} onValueChange={(v) => setArbeitsplatz(v as ArbeitsplatzTyp)}>
                  <SelectTrigger className="mt-1"><SelectValue /></SelectTrigger>
                  <SelectContent>
                    <SelectItem value="buero">Büro</SelectItem>
                    <SelectItem value="homeoffice">Homeoffice</SelectItem>
                    <SelectItem value="lager">Lager</SelectItem>
                    <SelectItem value="produktion">Produktion</SelectItem>
                    <SelectItem value="handwerk">Handwerk</SelectItem>
                    <SelectItem value="pflege">Pflege</SelectItem>
                    <SelectItem value="mischform">Mischform</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>

            <Button type="submit" disabled={saving || !email.trim()} className="w-full bg-emerald-600 hover:bg-emerald-700">
              {saving ? <Loader2 className="h-4 w-4 animate-spin" /> : "Einladen"}
            </Button>
          </form>
        )}
      </DialogContent>
    </Dialog>
  )
}

// ── Member Actions (Pausieren / Deaktivieren / Reaktivieren) ────────

function MemberActions({
  memberId,
  orgId,
  status,
  name,
  onSuccess,
}: {
  memberId: string
  orgId: string
  status: string
  name: string
  onSuccess: () => void
}) {
  const [saving, setSaving] = useState(false)

  const updateStatus = useCallback(async (newStatus: string) => {
    const labels: Record<string, string> = { pausiert: "pausieren", deaktiviert: "deaktivieren", aktiv: "reaktivieren" }
    if (!confirm(`${name} wirklich ${labels[newStatus] || newStatus}?`)) return
    setSaving(true)
    try {
      await fetch(`/api/bgf/organizations/${orgId}/members`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          member_id: memberId,
          status: newStatus,
        }),
      })
      onSuccess()
    } catch {
      // silent
    }
    setSaving(false)
  }, [memberId, orgId, name, onSuccess])

  if (saving) return <Loader2 className="h-4 w-4 animate-spin text-slate-400" />

  return (
    <div className="flex items-center gap-1 justify-end">
      {(status === "aktiv" || status === "eingeladen") && (
        <Button
          variant="ghost"
          size="sm"
          className="h-7 text-xs text-slate-400 hover:text-amber-600"
          onClick={() => updateStatus("pausiert")}
          title="Pausieren"
        >
          Pausieren
        </Button>
      )}
      {(status === "aktiv" || status === "eingeladen" || status === "pausiert") && (
        <Button
          variant="ghost"
          size="sm"
          className="h-7 text-xs text-slate-400 hover:text-red-600"
          onClick={() => updateStatus("deaktiviert")}
          title="Deaktivieren (ausscheidend)"
        >
          <UserX className="h-3.5 w-3.5" />
        </Button>
      )}
      {(status === "pausiert" || status === "deaktiviert") && (
        <Button
          variant="ghost"
          size="sm"
          className="h-7 text-xs text-slate-400 hover:text-emerald-600"
          onClick={() => updateStatus("aktiv")}
          title="Reaktivieren"
        >
          <UserCheck className="h-3.5 w-3.5" />
        </Button>
      )}
    </div>
  )
}
