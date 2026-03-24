"use client"

import { useState } from "react"
import Link from "next/link"
import {
  Building2,
  TrendingUp,
  Users,
  Activity,
  Plus,
  Search,
  RefreshCw,
  Receipt,
  Package,
  type LucideIcon,
} from "lucide-react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Card, CardContent } from "@/components/ui/card"
import { Skeleton } from "@/components/ui/skeleton"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import { useBgfOrganizations } from "@/hooks/use-bgf-organizations"
import { OrgCard } from "@/components/bgf/OrgCard"
import type { Organization, OrgStatus } from "@/types/bgf"

// ── Stat Card ─────────────────────────────────────────────────────────────────

interface StatCardProps {
  label: string
  value: string | number
  icon: LucideIcon
  iconBg: string
  iconColor: string
}

function StatCard({ label, value, icon: Icon, iconBg, iconColor }: StatCardProps) {
  return (
    <div className="rounded-2xl bg-white/80 backdrop-blur-sm border border-slate-200/60 shadow-sm p-5">
      <div className={`h-10 w-10 rounded-xl ${iconBg} flex items-center justify-center mb-3`}>
        <Icon className={`h-5 w-5 ${iconColor}`} />
      </div>
      <p className="text-2xl font-bold text-slate-800">{value}</p>
      <p className="text-xs text-slate-400 font-medium mt-1">{label}</p>
    </div>
  )
}

// ── Ampel Summary ─────────────────────────────────────────────────────────────

function AmpelSummary({ organizations }: { organizations: Organization[] }) {
  const green = organizations.filter((o) => o.status === "aktiv").length
  const yellow = organizations.filter((o) => o.status === "pilot" || o.status === "pausiert").length
  const red = organizations.filter((o) => o.status === "gekuendigt").length

  return (
    <div className="flex items-center gap-4">
      <div className="flex items-center gap-1.5">
        <span className="h-3 w-3 rounded-full bg-emerald-500 inline-block" />
        <span className="text-sm text-slate-600">{green} Aktiv</span>
      </div>
      <div className="flex items-center gap-1.5">
        <span className="h-3 w-3 rounded-full bg-amber-400 inline-block" />
        <span className="text-sm text-slate-600">{yellow} Pilot / Pausiert</span>
      </div>
      <div className="flex items-center gap-1.5">
        <span className="h-3 w-3 rounded-full bg-red-500 inline-block" />
        <span className="text-sm text-slate-600">{red} Gekündigt</span>
      </div>
    </div>
  )
}

// ── Page ─────────────────────────────────────────────────────────────────────

export default function BgfDashboardPage() {
  const [search, setSearch] = useState("")
  const [statusFilter, setStatusFilter] = useState<OrgStatus | "alle">("alle")

  const { organizations, totalCount, isLoading, error, refresh } = useBgfOrganizations({
    status: statusFilter !== "alle" ? statusFilter : undefined,
  })

  const filtered = search.trim()
    ? organizations.filter(
        (o) =>
          o.name.toLowerCase().includes(search.toLowerCase()) ||
          o.branche?.toLowerCase().includes(search.toLowerCase()) ||
          o.adresse_ort?.toLowerCase().includes(search.toLowerCase())
      )
    : organizations

  const totalLizenzen = organizations.reduce((sum, o) => sum + o.vertrag_lizenzen, 0)

  return (
    <div className="container mx-auto py-8 px-4 max-w-7xl">
      {/* Header */}
      <div className="flex items-start justify-between mb-8 gap-4">
        <div>
          <h1 className="text-2xl font-bold text-slate-800">BGF-Dashboard</h1>
          <p className="text-slate-400 text-sm mt-1">
            Betriebliche Gesundheitsförderung — Organisationsübersicht
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
          <Link href="/os/bgf/dienstleistungen">
            <Button size="sm" variant="outline" className="gap-2">
              <Package className="h-4 w-4" />
              Dienstleistungen
            </Button>
          </Link>
          <Link href="/os/bgf/rechnungen">
            <Button size="sm" variant="outline" className="gap-2">
              <Receipt className="h-4 w-4" />
              Rechnungen
            </Button>
          </Link>
          <Link href="/os/bgf/neu">
            <Button size="sm" className="gap-2 bg-emerald-600 hover:bg-emerald-700">
              <Plus className="h-4 w-4" />
              Organisation anlegen
            </Button>
          </Link>
        </div>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 mb-8">
        <StatCard
          label="Organisationen"
          value={totalCount}
          icon={Building2}
          iconBg="bg-emerald-50"
          iconColor="text-emerald-600"
        />
        <StatCard
          label="Lizenzen gesamt"
          value={totalLizenzen}
          icon={Users}
          iconBg="bg-blue-50"
          iconColor="text-blue-600"
        />
        <StatCard
          label="Aktive Verträge"
          value={organizations.filter((o) => o.status === "aktiv").length}
          icon={Activity}
          iconBg="bg-teal-50"
          iconColor="text-teal-600"
        />
        <StatCard
          label="Pilot-Phase"
          value={organizations.filter((o) => o.status === "pilot").length}
          icon={TrendingUp}
          iconBg="bg-amber-50"
          iconColor="text-amber-600"
        />
      </div>

      {/* Filters */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center gap-3 mb-4">
        <div className="relative flex-1 max-w-sm">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
          <Input
            placeholder="Organisation suchen…"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="pl-9"
          />
        </div>
        <Select value={statusFilter} onValueChange={(v) => setStatusFilter(v as OrgStatus | "alle")}>
          <SelectTrigger className="w-44">
            <SelectValue placeholder="Status" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="alle">Alle Status</SelectItem>
            <SelectItem value="aktiv">Aktiv</SelectItem>
            <SelectItem value="pilot">Pilot</SelectItem>
            <SelectItem value="pausiert">Pausiert</SelectItem>
            <SelectItem value="gekuendigt">Gekündigt</SelectItem>
          </SelectContent>
        </Select>

        <div className="hidden sm:block ml-auto">
          <AmpelSummary organizations={organizations} />
        </div>
      </div>

      {/* Error */}
      {error && (
        <Card className="border-red-200 bg-red-50 mb-4">
          <CardContent className="p-4 text-sm text-red-600">{error}</CardContent>
        </Card>
      )}

      {/* Organization list */}
      {isLoading ? (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {Array.from({ length: 6 }).map((_, i) => (
            <Skeleton key={i} className="h-36 rounded-2xl" />
          ))}
        </div>
      ) : filtered.length === 0 ? (
        <div className="text-center py-16 text-slate-400">
          <Building2 className="h-10 w-10 mx-auto mb-3 opacity-30" />
          <p className="font-medium">Keine Organisationen gefunden</p>
          <p className="text-sm mt-1">
            {search ? "Suchbegriff anpassen oder" : "Legen Sie die erste Organisation an."}{" "}
            {search && (
              <button
                onClick={() => setSearch("")}
                className="text-emerald-600 underline hover:no-underline"
              >
                Filter zurücksetzen
              </button>
            )}
          </p>
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {filtered.map((org) => (
            <OrgCard key={org.id} org={org} />
          ))}
        </div>
      )}
    </div>
  )
}
