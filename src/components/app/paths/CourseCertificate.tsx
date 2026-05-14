"use client"

/**
 * CourseCertificate — Full-screen completion celebration + certificate.
 * Shown when a patient finishes all modules of a course/path.
 */

import { Button } from "@/components/ui/button"
import { Trophy, Star, Share2, ArrowLeft, Sparkles, Download } from "lucide-react"
import { PathIcon } from "@/components/app/paths/PathIcon"
import { downloadCertificatePdf } from "@/lib/pdf/certificate-pdf"
import { useEffect } from "react"

interface Props {
  courseName: string
  subtitle?: string | null
  icon?: string | null
  color: string
  completedAt?: string | null
  totalModules: number
  patientName: string
  certificateId: string
  onClose: () => void
}

const GRADIENT_MAP: Record<string, string> = {
  cyan:    "from-cyan-400 via-sky-500 to-blue-600",
  emerald: "from-emerald-400 via-teal-500 to-green-600",
  rose:    "from-rose-400 via-pink-500 to-red-600",
  indigo:  "from-indigo-400 via-violet-500 to-purple-600",
}

const LIGHT_GRADIENT: Record<string, string> = {
  cyan:    "from-cyan-50 to-sky-50",
  emerald: "from-emerald-50 to-teal-50",
  rose:    "from-rose-50 to-pink-50",
  indigo:  "from-indigo-50 to-violet-50",
}

const ICON_TEXT: Record<string, string> = {
  cyan:    "text-cyan-600",
  emerald: "text-emerald-600",
  rose:    "text-rose-600",
  indigo:  "text-indigo-600",
}

export function CourseCertificate({
  courseName,
  subtitle,
  icon,
  color,
  completedAt,
  totalModules,
  patientName,
  certificateId,
  onClose,
}: Props) {
  const gradient = GRADIENT_MAP[color] ?? GRADIENT_MAP.emerald
  const lightGrad = LIGHT_GRADIENT[color] ?? LIGHT_GRADIENT.emerald
  const iconText = ICON_TEXT[color] ?? ICON_TEXT.emerald

  const completedDate = completedAt
    ? new Date(completedAt).toLocaleDateString("de-DE", {
        day: "numeric",
        month: "long",
        year: "numeric",
      })
    : new Date().toLocaleDateString("de-DE", {
        day: "numeric",
        month: "long",
        year: "numeric",
      })

  // Fire confetti on mount
  useEffect(() => {
    import("@/lib/confetti")
      .then((m) => m.celebrationConfetti?.())
      .catch(() => undefined)
  }, [])

  return (
    <div className="fixed inset-0 z-[60] flex flex-col overflow-y-auto bg-white">
      {/* Hero gradient band */}
      <div className={`relative bg-gradient-to-br ${gradient} px-6 pt-14 pb-12 text-center overflow-hidden`}>
        {/* Decorative circles */}
        <div className="absolute inset-0 pointer-events-none">
          <div className="absolute -top-6 -right-6 h-40 w-40 rounded-full bg-white/10" />
          <div className="absolute -bottom-8 -left-8 h-48 w-48 rounded-full bg-white/10" />
          <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 h-56 w-56 rounded-full bg-white/5" />
        </div>

        {/* Stars */}
        <div className="relative z-10 flex items-center justify-center gap-1 mb-4">
          {[...Array(5)].map((_, i) => (
            <Star key={i} className="h-4 w-4 text-yellow-300 fill-yellow-300" />
          ))}
        </div>

        {/* Big icon */}
        <div className="relative z-10 mx-auto h-24 w-24 rounded-3xl bg-white/20 backdrop-blur-sm border-2 border-white/30 flex items-center justify-center shadow-2xl mb-4">
          {icon ? (
            <PathIcon name={icon} className="h-12 w-12 text-white" />
          ) : (
            <Trophy className="h-12 w-12 text-white" />
          )}
        </div>

        <div className="relative z-10">
          <p className="text-xs font-bold text-white/70 uppercase tracking-widest mb-2">
            Kurs abgeschlossen
          </p>
          <h1 className="text-2xl font-bold text-white leading-tight mb-2">{courseName}</h1>
          {subtitle && (
            <p className="text-sm text-white/70 leading-relaxed">{subtitle}</p>
          )}
        </div>
      </div>

      {/* Certificate card */}
      <div className="flex-1 px-5 py-8 flex flex-col items-center">
        <div className={`w-full max-w-sm rounded-3xl bg-gradient-to-br ${lightGrad} border border-slate-200 shadow-lg p-6 mb-6`}>
          {/* Certificate header */}
          <div className="flex items-center justify-center gap-2 mb-5">
            <Sparkles className={`h-4 w-4 ${iconText}`} />
            <p className="text-xs font-bold text-slate-500 uppercase tracking-widest">
              Zertifikat der Teilnahme
            </p>
            <Sparkles className={`h-4 w-4 ${iconText}`} />
          </div>

          {/* Decorative divider */}
          <div className={`h-px w-full bg-gradient-to-r from-transparent via-slate-300 to-transparent mb-5`} />

          <div className="text-center space-y-4">
            <div>
              <p className="text-xs text-slate-400 mb-1">Kurs</p>
              <p className="text-base font-bold text-slate-800">{courseName}</p>
            </div>

            <div className="flex items-center justify-center gap-6">
              <div className="text-center">
                <p className="text-2xl font-bold text-slate-800">{totalModules}</p>
                <p className="text-[11px] text-slate-400">Module</p>
              </div>
              <div className="h-10 w-px bg-slate-200" />
              <div className="text-center">
                <p className="text-2xl font-bold text-slate-800">100%</p>
                <p className="text-[11px] text-slate-400">Fortschritt</p>
              </div>
            </div>

            <div>
              <p className="text-xs text-slate-400 mb-1">Abgeschlossen am</p>
              <p className="text-sm font-semibold text-slate-700">{completedDate}</p>
            </div>
          </div>

          {/* Decorative divider */}
          <div className={`h-px w-full bg-gradient-to-r from-transparent via-slate-300 to-transparent mt-5 mb-4`} />

          <p className="text-[11px] text-slate-400 text-center leading-relaxed">
            Ausgestellt durch Praxis OS — Digitale Gesundheitsplattform
          </p>
        </div>

        {/* Motivational message */}
        <div className="text-center mb-8 max-w-xs">
          <p className="text-sm text-slate-500 leading-relaxed">
            Hervorragend! Du hast alle {totalModules} Module absolviert und damit einen wichtigen Schritt in deiner Rehabilitation gemacht.
          </p>
        </div>

        {/* Actions */}
        <div className="w-full max-w-xs space-y-3">
          <Button
            className="w-full h-12 font-semibold rounded-xl"
            onClick={() =>
              downloadCertificatePdf({
                patientName,
                courseName,
                courseSubtitle: subtitle,
                totalModules,
                completedAt,
                certificateId,
                color,
              })
            }
          >
            <Download className="mr-2 h-4 w-4" />
            Zertifikat herunterladen
          </Button>
          <Button
            variant="outline"
            className="w-full h-12 font-semibold rounded-xl border-2"
            onClick={() => {
              if (navigator.share) {
                navigator.share({
                  title: `${courseName} — abgeschlossen!`,
                  text: `Ich habe den Kurs "${courseName}" auf Praxis OS erfolgreich abgeschlossen!`,
                }).catch(() => undefined)
              }
            }}
          >
            <Share2 className="mr-2 h-4 w-4" />
            Teilen
          </Button>
          <Button
            variant="ghost"
            className="w-full h-12 font-semibold rounded-xl"
            onClick={onClose}
          >
            <ArrowLeft className="mr-2 h-4 w-4" />
            Zurück zur Übersicht
          </Button>
        </div>
      </div>
    </div>
  )
}
