"use client"

/**
 * Therapeuten-Dashboard — Premium Design (V2 Landing Colors)
 * Warmer Hintergrund, Dark Header, Emerald/Teal-Akzente, glassmorphe Elemente
 */

import Link from "next/link"
import { Skeleton } from "@/components/ui/skeleton"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { useDashboardStats } from "@/hooks/use-dashboard-stats"
import { AmpelDashboard } from "@/components/ampel/AmpelDashboard"
import type { LucideIcon } from "lucide-react"
import {
  Users,
  Dumbbell,
  ClipboardList,
  BookOpen,
  GraduationCap,
  MessageCircle,
  Activity,
  CheckCircle2,
  ChevronRight,
  AlertTriangle,
} from "lucide-react"

// ── Greeting helper ──────────────────────────────────────────────────────────

function getGreeting(): string {
  const hour = new Date().getHours()
  if (hour < 12) return "Guten Morgen"
  if (hour < 17) return "Guten Nachmittag"
  return "Guten Abend"
}

function getTodayStr(): string {
  return new Date().toLocaleDateString("de-DE", {
    weekday: "long",
    day: "numeric",
    month: "long",
  })
}

// ── Stat Card ────────────────────────────────────────────────────────────────

interface StatCardProps {
  label: string
  value: string | number
  icon: LucideIcon
  iconBg: string
  iconColor: string
}

function StatCard({ label, value, icon: Icon, iconBg, iconColor }: StatCardProps) {
  return (
    <div className="rounded-2xl bg-white/80 backdrop-blur-sm border border-slate-200/60 shadow-sm p-5 hover:shadow-md transition-shadow">
      <div className={`h-10 w-10 rounded-xl ${iconBg} flex items-center justify-center mb-3`}>
        <Icon className={`h-5 w-5 ${iconColor}`} />
      </div>
      <p className="text-2xl font-bold text-slate-800">{value}</p>
      <p className="text-xs text-slate-400 font-medium mt-1">{label}</p>
    </div>
  )
}

// ── Quick Action Card ────────────────────────────────────────────────────────

interface QuickAction {
  title: string
  description: string
  href: string
  icon: LucideIcon
}

const quickActions: QuickAction[] = [
  {
    title: "Patienten",
    description: "Stammdaten & Dokumentation",
    href: "/os/patients",
    icon: Users,
  },
  {
    title: "Übungsdatenbank",
    description: "Übungen verwalten",
    href: "/os/exercises",
    icon: Dumbbell,
  },
  {
    title: "Trainingspläne",
    description: "Pläne erstellen & zuweisen",
    href: "/os/training-plans",
    icon: ClipboardList,
  },
  {
    title: "Hausaufgaben",
    description: "Compliance-Übersicht",
    href: "/os/hausaufgaben",
    icon: BookOpen,
  },
  {
    title: "Kurse",
    description: "Gruppen-Kurse verwalten",
    href: "/os/courses",
    icon: GraduationCap,
  },
]

// ── Skeleton ─────────────────────────────────────────────────────────────────

function DashboardSkeleton() {
  return (
    <div className="space-y-6">
      <div>
        <Skeleton className="h-8 w-64 rounded-xl" />
        <Skeleton className="h-4 w-40 rounded-lg mt-2" />
      </div>
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        {[1, 2, 3, 4].map((i) => (
          <Skeleton key={i} className="h-32 rounded-2xl" />
        ))}
      </div>
      <Skeleton className="h-20 rounded-2xl" />
      <div className="grid grid-cols-2 lg:grid-cols-5 gap-4">
        {[1, 2, 3, 4, 5].map((i) => (
          <Skeleton key={i} className="h-32 rounded-2xl" />
        ))}
      </div>
    </div>
  )
}

// ── Dashboard Page ───────────────────────────────────────────────────────────

export default function TherapistDashboardPage() {
  const { stats, isLoading, error } = useDashboardStats()

  return (
    <div className="min-h-screen" style={{ backgroundColor: "#faf9f7" }}>
      {/* Dark header area */}
      <div className="bg-gradient-to-b from-slate-900 via-slate-900 to-transparent pt-6 pb-20 px-6">
        <div className="container mx-auto max-w-7xl">
          {!isLoading && stats && (
            <div>
              <h1 className="text-2xl font-bold text-white">
                {getGreeting()}
                {stats.firstName ? `, ${stats.firstName}` : ""}!
              </h1>
              <p className="text-sm text-slate-400 mt-0.5">{getTodayStr()}</p>
            </div>
          )}
        </div>
      </div>

      {/* Content overlapping the header */}
      <div className="container mx-auto px-6 max-w-7xl -mt-12 pb-8 space-y-6">
        {/* Error */}
        {error && (
          <Alert variant="destructive">
            <AlertTriangle className="h-4 w-4" />
            <AlertDescription>{error}</AlertDescription>
          </Alert>
        )}

        {/* Ampel Dashboard — solid container so dark header gradient doesn't bleed through */}
        <div className="rounded-2xl bg-[#faf9f7] p-5 shadow-sm border border-slate-200/40">
          <AmpelDashboard />
        </div>

        {/* Loading */}
        {isLoading && <DashboardSkeleton />}

        {/* Main content */}
        {!isLoading && stats && (
          <>
            {/* Stats Row */}
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
            <StatCard
              label="Patienten gesamt"
              value={stats.patientCount}
              icon={Users}
              iconBg="bg-emerald-100"
              iconColor="text-emerald-600"
            />
            <StatCard
              label="Aktive Zuweisungen"
              value={stats.activeAssignments}
              icon={ClipboardList}
              iconBg="bg-teal-100"
              iconColor="text-teal-600"
            />
            <StatCard
              label="Ø 7-Tage Compliance"
              value={`${stats.avgCompliance7d}%`}
              icon={Activity}
              iconBg="bg-cyan-100"
              iconColor="text-cyan-600"
            />
            <StatCard
              label="Heute trainiert"
              value={stats.trainedTodayCount}
              icon={CheckCircle2}
              iconBg="bg-green-100"
              iconColor="text-green-600"
            />
          </div>

          {/* Messages Card */}
          {stats.unreadMessages > 0 ? (
            <Link href="/os/chat" className="block">
              <div className="rounded-2xl bg-gradient-to-r from-emerald-500 to-teal-600 p-5 text-white shadow-sm hover:shadow-md transition-shadow">
                <div className="flex items-center gap-3">
                  <div className="h-10 w-10 rounded-xl bg-white/20 flex items-center justify-center shrink-0">
                    <MessageCircle className="h-5 w-5 text-white" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="font-semibold">
                      {stats.unreadMessages} ungelesene Nachricht{stats.unreadMessages !== 1 ? "en" : ""}
                    </p>
                    <p className="text-sm text-white/80">Zum Posteingang</p>
                  </div>
                  <ChevronRight className="h-5 w-5 text-white/60 shrink-0" />
                </div>
              </div>
            </Link>
          ) : (
            <Link href="/os/chat" className="block">
              <div className="rounded-2xl bg-white/80 backdrop-blur-sm border border-slate-200/60 shadow-sm p-5 hover:shadow-md transition-all">
                <div className="flex items-center gap-3">
                  <div className="h-10 w-10 rounded-xl bg-emerald-100 flex items-center justify-center shrink-0">
                    <MessageCircle className="h-5 w-5 text-emerald-600" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="font-semibold text-slate-700">Nachrichten</p>
                    <p className="text-xs text-slate-400">Keine ungelesenen Nachrichten</p>
                  </div>
                  <ChevronRight className="h-5 w-5 text-slate-300 shrink-0" />
                </div>
              </div>
            </Link>
          )}

          {/* Quick Actions */}
          <div>
            <p className="text-xs font-semibold uppercase tracking-wider text-slate-400 mb-3">
              Schnellzugriff
            </p>
            <div className="grid grid-cols-2 lg:grid-cols-5 gap-4">
              {quickActions.map((action) => (
                <Link key={action.href} href={action.href} className="block">
                  <div className="rounded-2xl bg-white/80 backdrop-blur-sm border border-slate-200/60 shadow-sm p-5 hover:shadow-md hover:border-slate-300/60 transition-all group h-full">
                    <div className="h-10 w-10 rounded-xl bg-emerald-100 flex items-center justify-center mb-3">
                      <action.icon className="h-5 w-5 text-emerald-600" />
                    </div>
                    <p className="text-sm font-semibold text-slate-700 group-hover:text-slate-900">
                      {action.title}
                    </p>
                    <p className="text-xs text-slate-400 mt-0.5">{action.description}</p>
                  </div>
                </Link>
              ))}
            </div>
          </div>
        </>
      )}
      </div>
    </div>
  )
}
