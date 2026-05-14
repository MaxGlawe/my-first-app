"use client"

import Link from "next/link"
import { usePaths, type PathSummary } from "@/hooks/use-paths"
import { Skeleton } from "@/components/ui/skeleton"
import { Badge } from "@/components/ui/badge"
import { Progress } from "@/components/ui/progress"
import { PathIcon } from "@/components/app/paths/PathIcon"
import {
  GraduationCap,
  CheckCircle2,
  Clock,
  Trophy,
  ArrowRight,
  Sparkles,
  BookOpen,
  Star,
  ShoppingBag,
} from "lucide-react"

// ── Color config ────────────────────────────────────────────────────────────

const COLOR_MAP: Record<
  string,
  {
    gradient: string
    dot: string
    badge: string
    badgeText: string
    accent: string
    bar: string
    border: string
    iconBg: string
    iconText: string
  }
> = {
  cyan: {
    gradient: "from-cyan-500 to-sky-500",
    dot: "bg-cyan-400",
    badge: "bg-cyan-50 border-cyan-200",
    badgeText: "text-cyan-700",
    accent: "text-cyan-600",
    bar: "bg-cyan-500",
    border: "border-cyan-100",
    iconBg: "bg-gradient-to-br from-cyan-100 to-sky-100",
    iconText: "text-cyan-600",
  },
  emerald: {
    gradient: "from-emerald-500 to-teal-500",
    dot: "bg-emerald-400",
    badge: "bg-emerald-50 border-emerald-200",
    badgeText: "text-emerald-700",
    accent: "text-emerald-600",
    bar: "bg-emerald-500",
    border: "border-emerald-100",
    iconBg: "bg-gradient-to-br from-emerald-100 to-teal-100",
    iconText: "text-emerald-600",
  },
  rose: {
    gradient: "from-rose-500 to-pink-500",
    dot: "bg-rose-400",
    badge: "bg-rose-50 border-rose-200",
    badgeText: "text-rose-700",
    accent: "text-rose-600",
    bar: "bg-rose-500",
    border: "border-rose-100",
    iconBg: "bg-gradient-to-br from-rose-100 to-pink-100",
    iconText: "text-rose-600",
  },
  indigo: {
    gradient: "from-indigo-500 to-violet-500",
    dot: "bg-indigo-400",
    badge: "bg-indigo-50 border-indigo-200",
    badgeText: "text-indigo-700",
    accent: "text-indigo-600",
    bar: "bg-indigo-500",
    border: "border-indigo-100",
    iconBg: "bg-gradient-to-br from-indigo-100 to-violet-100",
    iconText: "text-indigo-600",
  },
}

function colorFor(c: string) {
  return COLOR_MAP[c] ?? COLOR_MAP.emerald
}

// ── Enrolled course card (active / completed) ───────────────────────────────

function ActiveCourseCard({ path }: { path: PathSummary }) {
  const c = colorFor(path.color)
  const e = path.enrollment!
  const progressPct = Math.round((e.completed_days / path.duration_days) * 100)
  const isCompleted = e.status === "completed"

  return (
    <Link href={`/app/kurse/${path.slug}`} className="block group">
      <div className="relative overflow-hidden rounded-2xl bg-white border border-slate-200/80 shadow-sm hover:shadow-md transition-all duration-300 hover:-translate-y-0.5">
        {/* Top accent bar */}
        <div className={`h-1 w-full bg-gradient-to-r ${c.gradient}`} />

        <div className="p-5">
          <div className="flex items-start gap-3.5 mb-4">
            {/* Icon */}
            <div className={`h-12 w-12 rounded-2xl ${c.iconBg} flex items-center justify-center shrink-0 shadow-inner`}>
              <PathIcon name={path.icon} className={`h-6 w-6 ${c.iconText}`} />
            </div>

            {/* Title + status */}
            <div className="flex-1 min-w-0">
              <div className="flex items-start justify-between gap-2 mb-1">
                <h3 className="text-base font-bold text-slate-800 leading-tight">{path.name}</h3>
                {isCompleted && (
                  <Badge className="bg-amber-50 border border-amber-200 text-amber-700 h-5 px-2 flex items-center gap-1 shrink-0">
                    <Trophy className="h-3 w-3" />
                    Fertig
                  </Badge>
                )}
              </div>
              {path.subtitle && (
                <p className="text-xs text-slate-400 leading-relaxed line-clamp-2">{path.subtitle}</p>
              )}
            </div>
          </div>

          {/* Progress */}
          <div>
            <div className="flex items-center justify-between mb-2">
              <span className={`text-xs font-semibold ${c.accent}`}>
                {isCompleted ? "Abgeschlossen" : `Modul ${e.current_day} / ${path.duration_days}`}
              </span>
              <span className="text-xs font-bold text-slate-600">{progressPct}%</span>
            </div>
            <div className="h-2 w-full bg-slate-100 rounded-full overflow-hidden">
              <div
                className={`h-full rounded-full transition-all duration-500 ${isCompleted ? "bg-amber-400" : c.bar}`}
                style={{ width: `${progressPct}%` }}
              />
            </div>
            <div className="flex items-center justify-between mt-2">
              <span className="text-[11px] text-slate-400">
                {e.completed_days} von {path.duration_days} Modulen
              </span>
              <span className={`text-[11px] font-semibold ${c.accent} flex items-center gap-0.5 group-hover:gap-1 transition-all`}>
                {isCompleted ? "Zertifikat" : "Weiter"}
                <ArrowRight className="h-3 w-3" />
              </span>
            </div>
          </div>
        </div>
      </div>
    </Link>
  )
}

// ── Catalog card (not enrolled / abandoned) ─────────────────────────────────

function CatalogCard({ path }: { path: PathSummary }) {
  const c = colorFor(path.color)
  const isAbandoned = path.enrollment?.status === "abandoned"

  return (
    <Link href={`/app/kurse/${path.slug}`} className="block group">
      <div className="relative overflow-hidden rounded-2xl bg-white border border-slate-200/80 shadow-sm hover:shadow-md transition-all duration-300 hover:-translate-y-0.5">
        {/* Gradient hero top — or KI hero image if available */}
        <div className={`relative h-28 bg-gradient-to-br ${c.gradient} flex items-center justify-center`}>
          {path.hero_image ? (
            <>
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img
                src={path.hero_image}
                alt=""
                className="absolute inset-0 h-full w-full object-cover"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-black/45 to-black/10" />
            </>
          ) : (
            <>
              {/* Decorative circles (placeholder until a hero image exists) */}
              <div className="absolute top-3 right-4 h-16 w-16 rounded-full bg-white/10" />
              <div className="absolute -bottom-4 -left-4 h-20 w-20 rounded-full bg-white/10" />
            </>
          )}

          <div className="relative z-10 h-16 w-16 rounded-3xl bg-white/20 backdrop-blur-sm border border-white/30 flex items-center justify-center shadow-lg">
            <PathIcon name={path.icon} className="h-8 w-8 text-white" />
          </div>

          {isAbandoned && (
            <div className="absolute top-3 left-3">
              <Badge className="bg-white/20 border-white/30 text-white text-[10px] h-5 px-2 backdrop-blur-sm">
                Pausiert
              </Badge>
            </div>
          )}
        </div>

        <div className="p-4">
          <h3 className="text-sm font-bold text-slate-800 leading-tight mb-1">{path.name}</h3>
          {path.subtitle && (
            <p className="text-xs text-slate-400 leading-relaxed line-clamp-2 mb-3">{path.subtitle}</p>
          )}

          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <span className={`inline-flex items-center gap-1 text-[11px] font-medium ${c.badgeText} ${c.badge} border rounded-full px-2 py-0.5`}>
                <BookOpen className="h-2.5 w-2.5" />
                {path.duration_days} Module
              </span>
            </div>
            <span className={`text-xs font-semibold ${c.accent} flex items-center gap-0.5 group-hover:gap-1 transition-all`}>
              {isAbandoned ? "Fortsetzen" : "Starten"}
              <ArrowRight className="h-3 w-3" />
            </span>
          </div>
        </div>
      </div>
    </Link>
  )
}

// ── Main page ───────────────────────────────────────────────────────────────

export default function KursUebersichtPage() {
  const { paths, isLoading, error } = usePaths()

  const activePaths = paths?.filter((p) => p.enrollment?.status === "active") ?? []
  const completedPaths = paths?.filter((p) => p.enrollment?.status === "completed") ?? []
  const catalogPaths = paths?.filter((p) => !p.enrollment || p.enrollment.status === "abandoned") ?? []

  return (
    <div className="min-h-[calc(100vh-5rem)]">
      {/* Hero header */}
      <div className="relative overflow-hidden bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900 px-5 pt-8 pb-10">
        {/* Decorative background elements */}
        <div className="absolute inset-0">
          <div className="absolute top-6 right-8 h-32 w-32 rounded-full bg-emerald-500/10 blur-2xl" />
          <div className="absolute -bottom-4 left-4 h-24 w-24 rounded-full bg-cyan-400/10 blur-2xl" />
        </div>

        <div className="relative z-10 max-w-lg mx-auto">
          <div className="flex items-center gap-2 mb-3">
            <div className="h-8 w-8 rounded-xl bg-gradient-to-br from-emerald-400 to-teal-400 flex items-center justify-center shadow-lg shadow-emerald-500/30">
              <GraduationCap className="h-4 w-4 text-white" />
            </div>
            <span className="text-xs font-semibold text-emerald-400 uppercase tracking-widest">
              Praxis OS Akademie
            </span>
          </div>

          <h1 className="text-2xl font-bold text-white leading-tight mb-2">
            Deine Kurse
          </h1>
          <p className="text-sm text-slate-400 leading-relaxed">
            Geführte Therapieprogramme — Schritt für Schritt zurück in Bewegung.
          </p>

          {/* Stats pills */}
          {!isLoading && paths && (
            <div className="flex items-center gap-2 mt-4 flex-wrap">
              {activePaths.length > 0 && (
                <div className="flex items-center gap-1.5 bg-white/10 border border-white/10 rounded-full px-3 py-1.5">
                  <Sparkles className="h-3 w-3 text-emerald-400" />
                  <span className="text-xs font-medium text-white">
                    {activePaths.length} aktiv
                  </span>
                </div>
              )}
              {completedPaths.length > 0 && (
                <div className="flex items-center gap-1.5 bg-white/10 border border-white/10 rounded-full px-3 py-1.5">
                  <Trophy className="h-3 w-3 text-amber-400" />
                  <span className="text-xs font-medium text-white">
                    {completedPaths.length} abgeschlossen
                  </span>
                </div>
              )}
              {catalogPaths.length > 0 && (
                <div className="flex items-center gap-1.5 bg-white/10 border border-white/10 rounded-full px-3 py-1.5">
                  <Star className="h-3 w-3 text-sky-400" />
                  <span className="text-xs font-medium text-white">
                    {catalogPaths.length} verfügbar
                  </span>
                </div>
              )}
            </div>
          )}
        </div>
      </div>

      {/* Content */}
      <div className="max-w-lg mx-auto px-4 py-6 space-y-8">
        {error && (
          <div className="rounded-2xl bg-red-50 border border-red-200 px-4 py-3 text-sm text-red-700">
            {error}
          </div>
        )}

        {isLoading ? (
          <div className="space-y-4">
            <Skeleton className="h-5 w-32 rounded-lg" />
            <Skeleton className="h-36 w-full rounded-2xl" />
            <Skeleton className="h-36 w-full rounded-2xl" />
            <Skeleton className="h-5 w-28 rounded-lg mt-4" />
            <div className="grid grid-cols-2 gap-3">
              <Skeleton className="h-52 w-full rounded-2xl" />
              <Skeleton className="h-52 w-full rounded-2xl" />
            </div>
          </div>
        ) : (
          <>
            {/* Active courses */}
            {activePaths.length > 0 && (
              <section className="space-y-3">
                <div className="flex items-center gap-2">
                  <div className="h-2 w-2 rounded-full bg-emerald-500 animate-pulse" />
                  <h2 className="text-xs font-bold text-slate-500 uppercase tracking-widest">
                    In Bearbeitung
                  </h2>
                </div>
                {activePaths.map((p) => (
                  <ActiveCourseCard key={p.id} path={p} />
                ))}
              </section>
            )}

            {/* Catalog */}
            {catalogPaths.length > 0 && (
              <section className="space-y-3">
                <div className="flex items-center gap-2">
                  <div className="h-2 w-2 rounded-full bg-sky-500" />
                  <h2 className="text-xs font-bold text-slate-500 uppercase tracking-widest">
                    Kurs-Katalog
                  </h2>
                </div>
                <div className="grid grid-cols-2 gap-3">
                  {catalogPaths.map((p) => (
                    <CatalogCard key={p.id} path={p} />
                  ))}
                </div>
              </section>
            )}

            {/* Completed courses */}
            {completedPaths.length > 0 && (
              <section className="space-y-3">
                <div className="flex items-center gap-2">
                  <Trophy className="h-3.5 w-3.5 text-amber-500" />
                  <h2 className="text-xs font-bold text-slate-500 uppercase tracking-widest">
                    Abgeschlossen
                  </h2>
                </div>
                {completedPaths.map((p) => (
                  <ActiveCourseCard key={p.id} path={p} />
                ))}
              </section>
            )}

            {/* Empty state */}
            {paths && paths.length === 0 && (
              <div className="flex flex-col items-center justify-center py-16 text-center">
                <div className="h-20 w-20 rounded-3xl bg-slate-100 flex items-center justify-center mb-4">
                  <GraduationCap className="h-10 w-10 text-slate-300" />
                </div>
                <h3 className="text-base font-bold text-slate-700 mb-2">
                  Noch keine Kurse verfügbar
                </h3>
                <p className="text-sm text-slate-400 max-w-xs leading-relaxed">
                  Dein Therapeut schaltet dir bald einen Kurs frei.
                </p>
              </div>
            )}

            {/* Shop-Einstieg — weitere Kurse entdecken */}
            <Link href="/shop" className="block group">
              <div className="rounded-2xl bg-gradient-to-br from-emerald-50 to-teal-50 border border-emerald-200/60 p-5 flex items-center gap-4 transition-all duration-300 hover:shadow-md hover:-translate-y-0.5">
                <div className="h-12 w-12 rounded-2xl bg-gradient-to-br from-emerald-400 to-teal-400 flex items-center justify-center shrink-0 shadow-md shadow-emerald-500/20">
                  <ShoppingBag className="h-6 w-6 text-white" />
                </div>
                <div className="flex-1 min-w-0">
                  <h3 className="text-sm font-bold text-slate-800 mb-0.5">
                    Mehr Kurse im Shop
                  </h3>
                  <p className="text-xs text-slate-500 leading-relaxed">
                    Entdecke weitere Kurse — im Abo inklusive oder einzeln freischaltbar.
                  </p>
                </div>
                <ArrowRight className="h-4 w-4 text-emerald-600 shrink-0 group-hover:translate-x-0.5 transition-transform" />
              </div>
            </Link>
          </>
        )}
      </div>
    </div>
  )
}
