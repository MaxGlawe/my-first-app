"use client"

import { use, useState, useCallback } from "react"
import Link from "next/link"
import {
  ArrowLeft,
  Search,
  RefreshCw,
  Users,
  CheckCircle2,
  Clock,
  XCircle,
  type LucideIcon,
} from "lucide-react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Card, CardContent } from "@/components/ui/card"
import { Skeleton } from "@/components/ui/skeleton"
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import { useBgfOrganization } from "@/hooks/use-bgf-organization"
import { useBgfMembers } from "@/hooks/use-bgf-members"
import { useDebounce } from "@/hooks/use-debounce"
import { MemberStatusBadge } from "@/components/bgf/MemberStatusBadge"
import { FreischaltungDialog } from "@/components/bgf/FreischaltungDialog"
import { CsvImportDialog } from "@/components/bgf/CsvImportDialog"
import type { MemberStatus, ArbeitsplatzTyp } from "@/types/bgf"

const arbeitsplatzLabels: Record<ArbeitsplatzTyp, string> = {
  buero: "Büro",
  homeoffice: "Homeoffice",
  lager: "Lager",
  produktion: "Produktion",
  handwerk: "Handwerk",
  pflege: "Pflege",
  mischform: "Mischform",
}

// ── Filter pill ────────────────────────────────────────────────────────────

interface StatusPillProps {
  label: string
  count: number
  active: boolean
  onClick: () => void
  icon: LucideIcon
  color: string
}

function StatusPill({ label, count, active, onClick, icon: Icon, color }: StatusPillProps) {
  return (
    <button
      onClick={onClick}
      className={`flex items-center gap-1.5 px-3 py-1.5 rounded-full text-sm font-medium transition-colors border ${
        active
          ? `${color} border-current`
          : "bg-white text-slate-500 border-slate-200 hover:border-slate-300"
      }`}
    >
      <Icon className="h-3.5 w-3.5" />
      {label}
      <span className="ml-1 text-xs opacity-70">{count}</span>
    </button>
  )
}

// ── Page ─────────────────────────────────────────────────────────────────────

export default function MembersPage({ params }: { params: Promise<{ orgId: string }> }) {
  const { orgId } = use(params)

  const [search, setSearch] = useState("")
  const [statusFilter, setStatusFilter] = useState<MemberStatus | "alle">("alle")
  const [abteilungFilter, setAbteilungFilter] = useState<string>("")

  const debouncedSearch = useDebounce(search, 300)

  const { organization: org, isLoading: orgLoading } = useBgfOrganization(orgId)
  const {
    members,
    totalCount,
    isLoading: membersLoading,
    error,
    refresh,
  } = useBgfMembers({
    orgId,
    search: debouncedSearch,
    status: statusFilter !== "alle" ? statusFilter : undefined,
    abteilung: abteilungFilter || undefined,
  })

  const handleSuccess = useCallback(() => refresh(), [refresh])

  // Count by status (from the current full unfiltered members)
  const aktivCount = members.filter((m) => m.status === "aktiv").length
  const eingeladenCount = members.filter((m) => m.status === "eingeladen").length
  const deaktiviertCount = members.filter((m) => m.status === "deaktiviert" || m.status === "pausiert").length

  // Unique Abteilungen from current results + org config
  const abteilungen = Array.from(
    new Set([
      ...(org?.abteilungen ?? []),
      ...members.map((m) => m.abteilung).filter(Boolean),
    ])
  ) as string[]

  return (
    <div className="container mx-auto py-8 px-4 max-w-6xl">
      {/* Breadcrumb + Header */}
      <div className="mb-6">
        <Link
          href={`/os/bgf/${orgId}`}
          className="flex items-center gap-1.5 text-sm text-slate-400 hover:text-slate-600 mb-4 w-fit"
        >
          <ArrowLeft className="h-4 w-4" />
          {orgLoading ? "Organisation" : (org?.name ?? "Organisation")}
        </Link>

        <div className="flex items-start justify-between gap-4">
          <div>
            <h1 className="text-xl font-bold text-slate-800">Mitarbeiterverwaltung</h1>
            <p className="text-sm text-slate-400 mt-0.5">
              {totalCount} Mitarbeiter
              {org ? ` · ${org.vertrag_lizenzen} Lizenzen` : ""}
            </p>
          </div>
          <div className="flex items-center gap-2">
            <Button
              variant="ghost"
              size="icon"
              onClick={refresh}
              title="Aktualisieren"
              className="text-slate-400 hover:text-slate-600"
            >
              <RefreshCw className="h-4 w-4" />
            </Button>
            <CsvImportDialog orgId={orgId} onSuccess={handleSuccess} />
            <FreischaltungDialog
              orgId={orgId}
              abteilungen={org?.abteilungen}
              onSuccess={handleSuccess}
            />
          </div>
        </div>
      </div>

      {/* Status filter pills */}
      <div className="flex items-center gap-2 flex-wrap mb-4">
        <StatusPill
          label="Alle"
          count={totalCount}
          active={statusFilter === "alle"}
          onClick={() => setStatusFilter("alle")}
          icon={Users}
          color="bg-slate-100 text-slate-700"
        />
        <StatusPill
          label="Aktiv"
          count={aktivCount}
          active={statusFilter === "aktiv"}
          onClick={() => setStatusFilter("aktiv")}
          icon={CheckCircle2}
          color="bg-emerald-100 text-emerald-700"
        />
        <StatusPill
          label="Eingeladen"
          count={eingeladenCount}
          active={statusFilter === "eingeladen"}
          onClick={() => setStatusFilter("eingeladen")}
          icon={Clock}
          color="bg-blue-100 text-blue-700"
        />
        <StatusPill
          label="Inaktiv"
          count={deaktiviertCount}
          active={statusFilter === "deaktiviert"}
          onClick={() => setStatusFilter("deaktiviert")}
          icon={XCircle}
          color="bg-slate-100 text-slate-500"
        />
      </div>

      {/* Search + Abteilung filter */}
      <div className="flex flex-col sm:flex-row gap-3 mb-5">
        <div className="relative flex-1 max-w-sm">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
          <Input
            placeholder="Name oder E-Mail suchen…"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="pl-9"
          />
        </div>
        {abteilungen.length > 0 && (
          <Select value={abteilungFilter || "alle"} onValueChange={(v) => setAbteilungFilter(v === "alle" ? "" : v)}>
            <SelectTrigger className="w-48">
              <SelectValue placeholder="Abteilung" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="alle">Alle Abteilungen</SelectItem>
              {abteilungen.map((a) => (
                <SelectItem key={a} value={a}>{a}</SelectItem>
              ))}
            </SelectContent>
          </Select>
        )}
      </div>

      {/* Error */}
      {error && (
        <Card className="border-red-200 bg-red-50 mb-4">
          <CardContent className="p-4 text-sm text-red-600">{error}</CardContent>
        </Card>
      )}

      {/* Members table */}
      <Card className="border-slate-200/60 bg-white/80 shadow-sm">
        <CardContent className="p-0">
          {membersLoading ? (
            <div className="p-6 space-y-3">
              {Array.from({ length: 8 }).map((_, i) => (
                <Skeleton key={i} className="h-10 w-full" />
              ))}
            </div>
          ) : members.length === 0 ? (
            <div className="py-16 text-center text-slate-400">
              <Users className="h-10 w-10 mx-auto mb-3 opacity-30" />
              <p className="font-medium">Keine Mitarbeiter gefunden</p>
              <p className="text-sm mt-1">
                {search || statusFilter !== "alle" ? (
                  <>
                    Filter anpassen oder{" "}
                    <button
                      onClick={() => { setSearch(""); setStatusFilter("alle"); setAbteilungFilter("") }}
                      className="text-emerald-600 underline hover:no-underline"
                    >
                      zurücksetzen
                    </button>
                  </>
                ) : (
                  "Schalten Sie den ersten Mitarbeiter frei."
                )}
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
                  <TableHead>Status</TableHead>
                  <TableHead>Ist-Analyse</TableHead>
                  <TableHead>Freigeschaltet</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {members.map((member) => (
                  <TableRow key={member.id} className="hover:bg-slate-50/50">
                    <TableCell className="font-medium text-slate-800">
                      {[member.vorname, member.nachname].filter(Boolean).join(" ") || (
                        <span className="text-slate-400 font-normal">—</span>
                      )}
                    </TableCell>
                    <TableCell className="text-slate-500 text-sm">{member.email}</TableCell>
                    <TableCell className="text-slate-500 text-sm">
                      {member.abteilung || "—"}
                    </TableCell>
                    <TableCell className="text-slate-500 text-sm">
                      {arbeitsplatzLabels[member.arbeitsplatz_typ] ?? member.arbeitsplatz_typ}
                    </TableCell>
                    <TableCell>
                      <MemberStatusBadge status={member.status} />
                    </TableCell>
                    <TableCell>
                      {member.ist_analyse_abgeschlossen ? (
                        <span className="inline-flex items-center gap-1 text-xs text-emerald-600 font-medium">
                          <CheckCircle2 className="h-3.5 w-3.5" />
                          Abgeschlossen
                        </span>
                      ) : (
                        <span className="text-xs text-slate-400">Ausstehend</span>
                      )}
                    </TableCell>
                    <TableCell className="text-xs text-slate-400">
                      {member.freigeschaltet_am
                        ? new Date(member.freigeschaltet_am).toLocaleDateString("de-DE")
                        : "—"}
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          )}
        </CardContent>
      </Card>

      {/* Footer count */}
      {members.length > 0 && (
        <p className="text-xs text-slate-400 mt-3 text-right">
          {members.length} von {totalCount} Mitarbeitern
        </p>
      )}
    </div>
  )
}
