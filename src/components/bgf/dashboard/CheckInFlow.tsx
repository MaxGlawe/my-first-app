"use client"

import { useState } from "react"
import { motion, AnimatePresence } from "framer-motion"
import { Button } from "@/components/ui/button"
import {
  ChevronRight,
  ChevronLeft,
  Building2,
  Home,
  MapPin,
  Palmtree,
  Sparkles,
  Moon,
  Zap,
  Heart,
} from "lucide-react"

// ── Types ────────────────────────────────────────────────────────────

interface CheckInValues {
  stimmung: number
  schlaf_qualitaet: number
  schmerz_aktuell: number
  arbeitstag_typ: "buero" | "homeoffice" | "unterwegs" | "frei"
  arbeitszeit_stunden: number
}

interface CheckInFlowProps {
  hasBeschwerden: boolean
  onComplete: (values: CheckInValues) => void
  isSubmitting: boolean
}

// ── Data ─────────────────────────────────────────────────────────────

const MOODS = [
  { value: 1, emoji: "😔", label: "Schlecht", color: "from-red-100 to-red-50", ring: "ring-red-300", glow: "shadow-red-200/60" },
  { value: 2, emoji: "😕", label: "Mäßig", color: "from-orange-100 to-orange-50", ring: "ring-orange-300", glow: "shadow-orange-200/60" },
  { value: 3, emoji: "😐", label: "Okay", color: "from-amber-100 to-amber-50", ring: "ring-amber-300", glow: "shadow-amber-200/60" },
  { value: 4, emoji: "🙂", label: "Gut", color: "from-emerald-100 to-emerald-50", ring: "ring-emerald-300", glow: "shadow-emerald-200/60" },
  { value: 5, emoji: "😊", label: "Super", color: "from-cyan-100 to-cyan-50", ring: "ring-cyan-300", glow: "shadow-cyan-200/60" },
]

const WORK_TYPES = [
  { value: "buero" as const, icon: Building2, label: "Büro", emoji: "🏢", gradient: "from-blue-500 to-indigo-600" },
  { value: "homeoffice" as const, icon: Home, label: "Homeoffice", emoji: "🏠", gradient: "from-violet-500 to-purple-600" },
  { value: "unterwegs" as const, icon: MapPin, label: "Unterwegs", emoji: "🚗", gradient: "from-emerald-500 to-teal-600" },
  { value: "frei" as const, icon: Palmtree, label: "Frei", emoji: "🌴", gradient: "from-amber-500 to-orange-600" },
]

const WORK_HOURS = [
  { value: 4, label: "~4h", sub: "Halber Tag" },
  { value: 6, label: "~6h", sub: "Kurzer Tag" },
  { value: 8, label: "8h+", sub: "Voller Tag" },
]

// ── Visual Slider ────────────────────────────────────────────────────

function VisualSlider({
  label,
  icon,
  value,
  onChange,
  min = 0,
  max = 10,
  lowLabel,
  highLabel,
  lowEmoji,
  highEmoji,
  accentColor,
}: {
  label: string
  icon: React.ReactNode
  value: number
  onChange: (v: number) => void
  min?: number
  max?: number
  lowLabel: string
  highLabel: string
  lowEmoji: string
  highEmoji: string
  accentColor: string
}) {
  const percent = ((value - min) / (max - min)) * 100

  // Interpolate emoji based on value
  const emojis = lowEmoji === "😴"
    ? ["😴", "😴", "😪", "😪", "🥱", "😌", "😌", "😊", "😊", "🌟", "✨"]
    : ["😊", "😊", "😐", "😐", "😕", "😕", "😣", "😣", "😖", "😖", "🔥"]
  const currentEmoji = emojis[Math.min(value, emojis.length - 1)]

  return (
    <div className="bg-white/60 backdrop-blur-sm rounded-2xl p-5 border border-white/80 shadow-sm">
      <div className="flex items-center gap-2.5 mb-4">
        <div className={`w-8 h-8 rounded-xl bg-gradient-to-br ${accentColor} flex items-center justify-center`}>
          {icon}
        </div>
        <span className="text-sm font-bold text-slate-800">{label}</span>
        <div className="ml-auto flex items-center gap-2">
          <span className="text-2xl">{currentEmoji}</span>
          <span className="text-lg font-bold text-slate-900 tabular-nums w-6 text-center">
            {value}
          </span>
        </div>
      </div>

      {/* Slider track */}
      <div className="relative h-12 flex items-center px-1">
        <div className="absolute inset-x-1 h-3 bg-slate-100 rounded-full overflow-hidden">
          <motion.div
            className={`h-full rounded-full bg-gradient-to-r ${accentColor}`}
            animate={{ width: `${percent}%` }}
            transition={{ type: "spring", stiffness: 300, damping: 30 }}
          />
        </div>
        <input
          type="range"
          min={min}
          max={max}
          value={value}
          onChange={(e) => onChange(parseInt(e.target.value))}
          className="absolute inset-x-0 w-full h-12 opacity-0 cursor-pointer z-10"
        />
        <motion.div
          className="absolute w-8 h-8 bg-white rounded-full shadow-lg border-2 border-slate-200 pointer-events-none flex items-center justify-center"
          animate={{ left: `calc(${percent}% - 16px + 4px)` }}
          transition={{ type: "spring", stiffness: 300, damping: 30 }}
        >
          <div className={`w-3 h-3 rounded-full bg-gradient-to-br ${accentColor}`} />
        </motion.div>
      </div>

      <div className="flex justify-between mt-1 px-1">
        <span className="text-[10px] text-slate-400 flex items-center gap-1">
          {lowEmoji} {lowLabel}
        </span>
        <span className="text-[10px] text-slate-400 flex items-center gap-1">
          {highLabel} {highEmoji}
        </span>
      </div>
    </div>
  )
}

// ── Generating Animation ─────────────────────────────────────────────

function GeneratingScreen() {
  const steps = [
    { label: "Profil wird analysiert", delay: 0 },
    { label: "Übungen werden ausgewählt", delay: 1.5 },
    { label: "Tagesplan wird erstellt", delay: 3.0 },
  ]

  return (
    <motion.div
      key="generating"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      className="min-h-screen bg-gradient-to-b from-slate-900 via-indigo-950 to-slate-900 flex flex-col items-center justify-center px-6 text-center"
    >
      {/* Animated orb */}
      <div className="relative w-32 h-32 mb-10">
        <motion.div
          animate={{
            scale: [1, 1.15, 1],
            opacity: [0.3, 0.6, 0.3],
          }}
          transition={{ duration: 2, repeat: Infinity, ease: "easeInOut" }}
          className="absolute inset-0 bg-indigo-500 rounded-full blur-2xl"
        />
        <motion.div
          animate={{
            scale: [1, 1.08, 1],
            opacity: [0.5, 0.8, 0.5],
          }}
          transition={{ duration: 2, repeat: Infinity, ease: "easeInOut", delay: 0.3 }}
          className="absolute inset-2 bg-violet-500 rounded-full blur-xl"
        />
        <motion.div
          animate={{ rotate: 360 }}
          transition={{ duration: 8, repeat: Infinity, ease: "linear" }}
          className="absolute inset-4 bg-gradient-to-br from-indigo-400 to-purple-500 rounded-full flex items-center justify-center shadow-2xl shadow-indigo-500/40"
        >
          <Sparkles className="w-10 h-10 text-white" />
        </motion.div>

        {/* Orbiting dots */}
        {[0, 1, 2].map((i) => (
          <motion.div
            key={i}
            animate={{ rotate: 360 }}
            transition={{
              duration: 3 + i * 0.5,
              repeat: Infinity,
              ease: "linear",
              delay: i * 0.4,
            }}
            className="absolute inset-0"
            style={{ transformOrigin: "center" }}
          >
            <div
              className="absolute w-2.5 h-2.5 bg-white rounded-full shadow-lg"
              style={{ top: -4, left: "50%", transform: "translateX(-50%)" }}
            />
          </motion.div>
        ))}
      </div>

      {/* Text */}
      <motion.h2
        initial={{ opacity: 0, y: 12 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.2 }}
        className="text-2xl font-bold text-white mb-3"
      >
        Dein Tagesplan wird erstellt
      </motion.h2>
      <motion.p
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.4 }}
        className="text-sm text-indigo-200/70 max-w-xs mb-10"
      >
        Unsere KI erstellt personalisierte Sessions basierend auf deinem Check-In
      </motion.p>

      {/* Progress steps */}
      <div className="space-y-3 w-full max-w-xs">
        {steps.map((s, i) => (
          <motion.div
            key={s.label}
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: s.delay }}
            className="flex items-center gap-3"
          >
            <motion.div
              initial={{ scale: 0 }}
              animate={{ scale: 1 }}
              transition={{ delay: s.delay + 0.3, type: "spring" }}
              className="w-6 h-6 rounded-full bg-indigo-500/30 flex items-center justify-center flex-shrink-0"
            >
              <motion.div
                initial={{ scale: 0 }}
                animate={{ scale: 1 }}
                transition={{ delay: s.delay + 0.6 }}
                className="w-2.5 h-2.5 rounded-full bg-indigo-400"
              />
            </motion.div>
            <span className="text-sm text-indigo-200/80 font-medium">{s.label}</span>
            {i < steps.length - 1 && (
              <motion.span
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: s.delay + 1.2 }}
                className="ml-auto text-emerald-400 text-xs font-bold"
              >
                ✓
              </motion.span>
            )}
          </motion.div>
        ))}
      </div>
    </motion.div>
  )
}

// ── Main Component ───────────────────────────────────────────────────

export function CheckInFlow({ hasBeschwerden, onComplete, isSubmitting }: CheckInFlowProps) {
  const [step, setStep] = useState(0)
  const [values, setValues] = useState<CheckInValues>({
    stimmung: 0,
    schlaf_qualitaet: 7,
    schmerz_aktuell: 0,
    arbeitstag_typ: "buero",
    arbeitszeit_stunden: 8,
  })

  const greeting = (() => {
    const h = new Date().getHours()
    if (h < 12) return "Guten Morgen"
    if (h < 17) return "Guten Tag"
    return "Guten Abend"
  })()

  const timeEmoji = (() => {
    const h = new Date().getHours()
    if (h < 12) return "🌅"
    if (h < 17) return "☀️"
    return "🌙"
  })()

  function handleMoodSelect(mood: number) {
    setValues((v) => ({ ...v, stimmung: mood }))
    setTimeout(() => setStep(1), 400)
  }

  function handleSubmit() {
    onComplete(values)
  }

  // ── Generating Screen ──────────────────────────────────────────────
  if (isSubmitting) {
    return <GeneratingScreen />
  }

  return (
    <div className="min-h-screen flex flex-col">
      {/* ── Dark Hero Header ───────────────────────────────────── */}
      <div className="bg-gradient-to-br from-slate-900 via-indigo-950 to-slate-900 text-white px-6 pt-12 pb-8 relative overflow-hidden">
        {/* Subtle grid */}
        <div
          className="absolute inset-0 opacity-[0.04]"
          style={{
            backgroundImage: "radial-gradient(circle, white 1px, transparent 1px)",
            backgroundSize: "20px 20px",
          }}
        />

        <motion.div
          initial={{ opacity: 0, y: -8 }}
          animate={{ opacity: 1, y: 0 }}
          className="relative"
        >
          <div className="flex items-center gap-2 mb-1">
            <span className="text-2xl">{timeEmoji}</span>
            <p className="text-xs font-semibold text-indigo-300/70 uppercase tracking-widest">
              Täglicher Check-In
            </p>
          </div>
          <h1 className="text-3xl font-bold font-display">{greeting}!</h1>
          <p className="text-sm text-white/40 mt-1">
            30 Sekunden für deinen personalisierten Tagesplan
          </p>
        </motion.div>

        {/* Step indicator in header */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.2 }}
          className="flex items-center gap-2 mt-5"
        >
          {["Stimmung", "Body-Check", "Arbeitstag"].map((label, i) => (
            <div key={label} className="flex items-center gap-2">
              <div className="flex items-center gap-1.5">
                <div
                  className={`w-6 h-6 rounded-full flex items-center justify-center text-[10px] font-bold transition-all duration-300 ${
                    i < step
                      ? "bg-emerald-500 text-white"
                      : i === step
                      ? "bg-white text-slate-900"
                      : "bg-white/10 text-white/40"
                  }`}
                >
                  {i < step ? "✓" : i + 1}
                </div>
                <span
                  className={`text-[11px] font-medium transition-colors duration-300 ${
                    i <= step ? "text-white/80" : "text-white/30"
                  }`}
                >
                  {label}
                </span>
              </div>
              {i < 2 && (
                <div
                  className={`w-6 h-px transition-colors duration-300 ${
                    i < step ? "bg-emerald-500" : "bg-white/10"
                  }`}
                />
              )}
            </div>
          ))}
        </motion.div>
      </div>

      {/* ── Content Area ───────────────────────────────────── */}
      <div className="flex-1 bg-gradient-to-b from-slate-50 to-white px-5 py-6">
        <AnimatePresence mode="wait">
          {/* ── Step 0: Mood ───────────────────────────── */}
          {step === 0 && (
            <motion.div
              key="mood"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              transition={{ duration: 0.3, ease: "easeOut" }}
              className="max-w-lg mx-auto"
            >
              <div className="text-center mb-8">
                <h2 className="text-2xl font-bold text-slate-900">
                  Wie fühlst du dich?
                </h2>
                <p className="text-sm text-slate-500 mt-1">
                  Tippe auf das Emoji, das am besten passt
                </p>
              </div>

              <div className="flex items-end justify-center gap-3">
                {MOODS.map((mood, i) => {
                  const selected = values.stimmung === mood.value
                  return (
                    <motion.button
                      key={mood.value}
                      initial={{ opacity: 0, y: 20 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ delay: 0.1 + i * 0.06 }}
                      onClick={() => handleMoodSelect(mood.value)}
                      className={`flex flex-col items-center gap-2 transition-all duration-200 ${
                        selected ? "scale-110 -translate-y-1" : "hover:scale-105"
                      }`}
                    >
                      <div
                        className={`w-16 h-16 rounded-2xl bg-gradient-to-b ${mood.color} flex items-center justify-center transition-all duration-200 ${
                          selected
                            ? `ring-3 ${mood.ring} shadow-xl ${mood.glow}`
                            : "shadow-sm hover:shadow-md"
                        }`}
                      >
                        <span className={`transition-all duration-200 ${selected ? "text-5xl" : "text-4xl"}`}>
                          {mood.emoji}
                        </span>
                      </div>
                      <span
                        className={`text-xs font-semibold transition-colors ${
                          selected ? "text-slate-900" : "text-slate-400"
                        }`}
                      >
                        {mood.label}
                      </span>
                    </motion.button>
                  )
                })}
              </div>
            </motion.div>
          )}

          {/* ── Step 1: Body Check ────────────────────── */}
          {step === 1 && (
            <motion.div
              key="bodycheck"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              transition={{ duration: 0.3, ease: "easeOut" }}
              className="max-w-lg mx-auto space-y-5"
            >
              <div className="text-center mb-2">
                <h2 className="text-2xl font-bold text-slate-900">
                  Kurzer Body-Check
                </h2>
                <p className="text-sm text-slate-500 mt-1">
                  Damit dein Pausen-Fit optimal auf dich abgestimmt ist
                </p>
              </div>

              <VisualSlider
                label="Schlafqualität"
                icon={<Moon className="w-4 h-4 text-white" />}
                value={values.schlaf_qualitaet}
                onChange={(v) => setValues((p) => ({ ...p, schlaf_qualitaet: v }))}
                lowLabel="Schlecht"
                highLabel="Erholsam"
                lowEmoji="😴"
                highEmoji="✨"
                accentColor="from-indigo-500 to-violet-500"
              />

              {hasBeschwerden && (
                <VisualSlider
                  label="Aktueller Schmerz"
                  icon={<Heart className="w-4 h-4 text-white" />}
                  value={values.schmerz_aktuell}
                  onChange={(v) => setValues((p) => ({ ...p, schmerz_aktuell: v }))}
                  lowLabel="Kein Schmerz"
                  highLabel="Stark"
                  lowEmoji="😊"
                  highEmoji="🔥"
                  accentColor="from-rose-500 to-pink-500"
                />
              )}

              <div className="flex gap-3 pt-2">
                <Button
                  variant="outline"
                  onClick={() => setStep(0)}
                  className="h-13 px-5 rounded-2xl border-slate-200"
                >
                  <ChevronLeft className="w-4 h-4" />
                </Button>
                <Button
                  onClick={() => setStep(2)}
                  className="flex-1 h-13 text-base font-bold bg-gradient-to-r from-indigo-500 to-indigo-600 hover:from-indigo-600 hover:to-indigo-700 text-white rounded-2xl shadow-lg shadow-indigo-200/50"
                >
                  Weiter
                  <ChevronRight className="w-5 h-5 ml-1" />
                </Button>
              </div>
            </motion.div>
          )}

          {/* ── Step 2: Work Type ──────────────────────── */}
          {step === 2 && (
            <motion.div
              key="worktype"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              transition={{ duration: 0.3, ease: "easeOut" }}
              className="max-w-lg mx-auto space-y-5"
            >
              <div className="text-center mb-2">
                <h2 className="text-2xl font-bold text-slate-900">
                  Dein Arbeitstag
                </h2>
                <p className="text-sm text-slate-500 mt-1">
                  Wir passen Anzahl und Art der Sessions an
                </p>
              </div>

              {/* Work type cards */}
              <div className="grid grid-cols-2 gap-3">
                {WORK_TYPES.map((type, i) => {
                  const selected = values.arbeitstag_typ === type.value
                  return (
                    <motion.button
                      key={type.value}
                      initial={{ opacity: 0, scale: 0.9 }}
                      animate={{ opacity: 1, scale: 1 }}
                      transition={{ delay: 0.05 + i * 0.06 }}
                      onClick={() => setValues((v) => ({ ...v, arbeitstag_typ: type.value }))}
                      className={`relative overflow-hidden flex flex-col items-center gap-2.5 p-5 rounded-2xl border-2 transition-all duration-200 ${
                        selected
                          ? "border-transparent bg-white shadow-xl scale-[1.02]"
                          : "border-slate-100 bg-white hover:border-slate-200 hover:shadow-sm"
                      }`}
                    >
                      {/* Selected accent bar */}
                      {selected && (
                        <motion.div
                          layoutId="work-accent"
                          className={`absolute inset-x-0 top-0 h-1 bg-gradient-to-r ${type.gradient}`}
                          transition={{ type: "spring", stiffness: 400, damping: 30 }}
                        />
                      )}

                      <div
                        className={`w-12 h-12 rounded-2xl flex items-center justify-center text-2xl transition-all duration-200 ${
                          selected
                            ? `bg-gradient-to-br ${type.gradient} shadow-lg`
                            : "bg-slate-50"
                        }`}
                      >
                        {selected ? (
                          <span className="text-xl filter drop-shadow-sm">{type.emoji}</span>
                        ) : (
                          <span className="text-xl opacity-70">{type.emoji}</span>
                        )}
                      </div>
                      <span
                        className={`text-sm font-bold transition-colors ${
                          selected ? "text-slate-900" : "text-slate-600"
                        }`}
                      >
                        {type.label}
                      </span>
                    </motion.button>
                  )
                })}
              </div>

              {/* Work hours */}
              {values.arbeitstag_typ !== "frei" && (
                <motion.div
                  initial={{ opacity: 0, height: 0 }}
                  animate={{ opacity: 1, height: "auto" }}
                  exit={{ opacity: 0, height: 0 }}
                >
                  <p className="text-sm font-bold text-slate-700 mb-3 text-center">
                    Wie lange arbeitest du heute?
                  </p>
                  <div className="flex gap-2">
                    {WORK_HOURS.map((h) => {
                      const selected = values.arbeitszeit_stunden === h.value
                      return (
                        <button
                          key={h.value}
                          onClick={() => setValues((v) => ({ ...v, arbeitszeit_stunden: h.value }))}
                          className={`flex-1 py-3.5 px-2 rounded-2xl border-2 transition-all text-center ${
                            selected
                              ? "border-indigo-400 bg-indigo-50 shadow-md shadow-indigo-100/50"
                              : "border-slate-100 bg-white hover:border-slate-200"
                          }`}
                        >
                          <p className={`text-lg font-bold ${selected ? "text-indigo-600" : "text-slate-700"}`}>
                            {h.label}
                          </p>
                          <p className="text-[10px] text-slate-400 mt-0.5">{h.sub}</p>
                        </button>
                      )
                    })}
                  </div>
                </motion.div>
              )}

              <div className="flex gap-3 pt-1">
                <Button
                  variant="outline"
                  onClick={() => setStep(1)}
                  className="h-14 px-5 rounded-2xl border-slate-200"
                >
                  <ChevronLeft className="w-4 h-4" />
                </Button>
                <Button
                  onClick={handleSubmit}
                  className="flex-1 h-14 text-base font-bold bg-gradient-to-r from-indigo-500 via-indigo-600 to-violet-600 hover:from-indigo-600 hover:via-indigo-700 hover:to-violet-700 text-white rounded-2xl shadow-xl shadow-indigo-300/40"
                >
                  <Zap className="w-5 h-5 mr-2" />
                  Tagesplan erstellen
                </Button>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </div>
  )
}
