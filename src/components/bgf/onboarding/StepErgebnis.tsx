"use client"

import { useEffect, useState } from "react"
import { motion } from "framer-motion"
import { Button } from "@/components/ui/button"
import { cn } from "@/lib/utils"
import {
  CheckCircle2,
  TrendingUp,
  Target,
  PlayCircle,
  Sparkles,
} from "lucide-react"

// ── Risk Score Gauge ──────────────────────────────────────────────────────────

interface RiskGaugeProps {
  score: number
}

function getRiskLevel(score: number): {
  label: string
  color: string
  trackColor: string
  bgColor: string
  emoji: string
  message: string
} {
  if (score <= 30) {
    return {
      label: "Niedriges Risiko",
      color: "text-emerald-600",
      trackColor: "#10b981",
      bgColor: "bg-emerald-50 border-emerald-200",
      emoji: "🟢",
      message: "Sehr gut! Ihr Profil zeigt ein niedriges Gesundheitsrisiko.",
    }
  }
  if (score <= 60) {
    return {
      label: "Mittleres Risiko",
      color: "text-amber-600",
      trackColor: "#f59e0b",
      bgColor: "bg-amber-50 border-amber-200",
      emoji: "🟡",
      message: "Es gibt Bereiche, die wir gezielt verbessern können.",
    }
  }
  return {
    label: "Erhöhtes Risiko",
    color: "text-red-600",
    trackColor: "#ef4444",
    bgColor: "bg-red-50 border-red-200",
    emoji: "🔴",
    message: "Wir haben klare Handlungsfelder identifiziert — starten wir!",
  }
}

function RiskGauge({ score }: RiskGaugeProps) {
  const [animated, setAnimated] = useState(false)
  const size = 200
  const strokeWidth = 16
  const radius = (size - strokeWidth) / 2
  // Half-circle gauge: total arc = 180°
  const circumference = Math.PI * radius // half circle
  const progress = Math.min(100, Math.max(0, score)) / 100
  const dashOffset = circumference * (1 - (animated ? progress : 0))

  const risk = getRiskLevel(score)

  useEffect(() => {
    const t = setTimeout(() => setAnimated(true), 300)
    return () => clearTimeout(t)
  }, [])

  // Gradient definitions
  const gradId = "risk-gauge-grad"

  return (
    <div className="flex flex-col items-center">
      <div className="relative" style={{ width: size, height: size / 2 + 20 }}>
        <svg
          width={size}
          height={size / 2 + strokeWidth}
          viewBox={`0 0 ${size} ${size / 2 + strokeWidth}`}
          style={{ overflow: "visible" }}
          aria-hidden
        >
          <defs>
            <linearGradient id={gradId} x1="0%" y1="0%" x2="100%" y2="0%">
              <stop offset="0%" stopColor="#10b981" />
              <stop offset="50%" stopColor="#f59e0b" />
              <stop offset="100%" stopColor="#ef4444" />
            </linearGradient>
          </defs>

          {/* Background track */}
          <path
            d={`M ${strokeWidth / 2} ${size / 2} A ${radius} ${radius} 0 0 1 ${size - strokeWidth / 2} ${size / 2}`}
            fill="none"
            stroke="#e2e8f0"
            strokeWidth={strokeWidth}
            strokeLinecap="round"
          />

          {/* Progress arc */}
          <path
            d={`M ${strokeWidth / 2} ${size / 2} A ${radius} ${radius} 0 0 1 ${size - strokeWidth / 2} ${size / 2}`}
            fill="none"
            stroke={`url(#${gradId})`}
            strokeWidth={strokeWidth}
            strokeDasharray={circumference}
            strokeDashoffset={dashOffset}
            strokeLinecap="round"
            style={{
              transition: "stroke-dashoffset 1.2s cubic-bezier(0.16, 1, 0.3, 1)",
            }}
          />
        </svg>

        {/* Score in center */}
        <div className="absolute bottom-0 left-0 right-0 flex flex-col items-center">
          <motion.span
            className={cn("text-5xl font-black tabular-nums", risk.color)}
            initial={{ opacity: 0, scale: 0.5 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ delay: 0.5, duration: 0.5, type: "spring" }}
          >
            {score}
          </motion.span>
          <span className="text-xs text-slate-400 font-medium">von 100</span>
        </div>
      </div>

      {/* Risk level badge */}
      <motion.div
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.8, duration: 0.4 }}
        className={cn(
          "mt-4 px-4 py-2 rounded-full border font-semibold text-sm flex items-center gap-2",
          risk.bgColor,
          risk.color
        )}
      >
        <span>{risk.emoji}</span>
        {risk.label}
      </motion.div>

      <motion.p
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 1, duration: 0.4 }}
        className="mt-3 text-center text-sm text-slate-600 max-w-xs"
      >
        {risk.message}
      </motion.p>
    </div>
  )
}

// ── Fokus Chip ────────────────────────────────────────────────────────────────

const FOKUS_ICONS: Record<string, string> = {
  nacken: "🔴",
  ruecken: "⬇️",
  schulter: "🫱",
  stress: "🧘",
  bewegung: "🚶",
  ergonomie: "💺",
  ausdauer: "🏃",
  kraft: "💪",
}

function getFokusIcon(fokus: string): string {
  const lower = fokus.toLowerCase()
  for (const [key, icon] of Object.entries(FOKUS_ICONS)) {
    if (lower.includes(key)) return icon
  }
  return "✨"
}

// ── Main Component ────────────────────────────────────────────────────────────

interface Props {
  result: {
    risiko_score: number
    ki_empfehlung: string
    pausen_fit_fokus: string[]
  } | null
  onFinish: () => void
  /** Der heutige Check-in ist aus diesem Onboarding entstanden */
  checkinAngelegt?: boolean
}

export function IstAnalyseStepErgebnis({ result, onFinish, checkinAngelegt }: Props) {
  if (!result) {
    // Should not happen, but show loading state as fallback
    return (
      <div className="flex flex-col items-center justify-center py-12">
        <div className="w-12 h-12 rounded-full border-4 border-indigo-200 border-t-indigo-600 animate-spin mb-4" />
        <p className="text-sm text-slate-500">Analyse wird berechnet...</p>
      </div>
    )
  }

  return (
    <div className="pb-6">
      {/* Title */}
      <motion.div
        initial={{ opacity: 0, y: -10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.4 }}
        className="text-center mb-8"
      >
        <div className="inline-flex items-center gap-2 bg-indigo-100 text-indigo-700 rounded-full px-4 py-1.5 text-sm font-semibold mb-3">
          <CheckCircle2 className="w-4 h-4" />
          Analyse abgeschlossen
        </div>
        <h1 className="text-2xl font-bold text-slate-900">Ihr Gesundheitsprofil</h1>
        <p className="text-sm text-slate-500 mt-1">Basierend auf Ihren Antworten</p>
      </motion.div>

      {/* Risk Gauge */}
      <motion.div
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ delay: 0.2, duration: 0.5 }}
        className="flex justify-center mb-8"
      >
        <RiskGauge score={result.risiko_score} />
      </motion.div>

      {/* Focus Areas */}
      {result.pausen_fit_fokus.length > 0 && (
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 1.1, duration: 0.4 }}
          className="mb-6"
        >
          <div className="flex items-center gap-2 mb-3">
            <Target className="w-4 h-4 text-indigo-600" />
            <h2 className="text-sm font-semibold text-slate-800">Ihre Fokus-Bereiche</h2>
          </div>
          <div className="flex flex-wrap gap-2">
            {result.pausen_fit_fokus.map((fokus, i) => (
              <motion.span
                key={fokus}
                initial={{ opacity: 0, scale: 0.8 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ delay: 1.2 + i * 0.1, duration: 0.3 }}
                className="flex items-center gap-1.5 bg-white border border-indigo-100 text-slate-700 rounded-full px-3 py-1.5 text-xs font-medium shadow-sm"
              >
                <span className="text-base leading-none">{getFokusIcon(fokus)}</span>
                {fokus}
              </motion.span>
            ))}
          </div>
        </motion.div>
      )}

      {/* AI Recommendation */}
      {result.ki_empfehlung && (
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 1.3, duration: 0.4 }}
          className="mb-6 bg-gradient-to-br from-indigo-50 to-blue-50 border border-indigo-100 rounded-2xl p-4"
        >
          <div className="flex items-center gap-2 mb-2">
            <Sparkles className="w-4 h-4 text-indigo-600" />
            <h2 className="text-sm font-semibold text-indigo-700">KI-Empfehlung</h2>
          </div>
          <p className="text-sm text-slate-700 leading-relaxed">
            {result.ki_empfehlung}
          </p>
        </motion.div>
      )}

      {/* What happens next */}
      <motion.div
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 1.5, duration: 0.4 }}
        className="mb-8 bg-white border border-slate-100 rounded-2xl p-4 shadow-sm"
      >
        <div className="flex items-center gap-2 mb-3">
          <TrendingUp className="w-4 h-4 text-emerald-600" />
          <h2 className="text-sm font-semibold text-slate-800">Was passiert jetzt?</h2>
        </div>
        <ul className="space-y-2">
          {[
            "Sie erhalten täglich 2–3 personalisierte Pausen-Fits (3–5 Min.)",
            "Jede Übung wird auf Ihre Beschwerden und Ziele abgestimmt",
            "Bei Bedarf können Sie Ihren BGF-Therapeuten direkt kontaktieren",
          ].map((text, i) => (
            <li key={i} className="flex items-start gap-2.5">
              <CheckCircle2 className="w-4 h-4 text-emerald-500 mt-0.5 shrink-0" />
              <span className="text-xs text-slate-600 leading-snug">{text}</span>
            </li>
          ))}
        </ul>
      </motion.div>

      {/* CTA */}
      <motion.div
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 1.7, duration: 0.4 }}
      >
        {checkinAngelegt && (
          <div className="mb-4 rounded-2xl bg-emerald-50 border border-emerald-200 p-3.5 flex items-start gap-2.5">
            <CheckCircle2 className="w-4 h-4 text-emerald-600 mt-0.5 shrink-0" />
            <p className="text-xs text-emerald-800 leading-snug">
              <span className="font-semibold">Ihr heutiger Tag steht bereits.</span>{" "}
              Aus Ihren Angaben haben wir den Check-in für heute übernommen und
              Ihre Pausen-Routinen zusammengestellt — Sie müssen nichts doppelt
              ausfüllen. Ab morgen dauert der Check-in nur noch 30 Sekunden.
            </p>
          </div>
        )}

        <Button
          onClick={onFinish}
          className="w-full bg-gradient-to-r from-indigo-500 to-blue-600 hover:from-indigo-600 hover:to-blue-700 text-white font-semibold py-4 h-auto rounded-2xl shadow-lg text-base"
        >
          <PlayCircle className="w-5 h-5 mr-2" />
          {checkinAngelegt ? "Zu meinem Tagesplan" : "Erstes Pausen-Fit starten!"}
        </Button>
        <p className="text-center text-xs text-slate-400 mt-3">
          Ihre Daten werden sicher und DSGVO-konform gespeichert
        </p>
      </motion.div>
    </div>
  )
}
