"use client"

import { useState, useEffect, useCallback } from "react"
import { motion, AnimatePresence } from "framer-motion"
import { ChevronRight, X, Sparkles } from "lucide-react"

// ── Tutorial Steps ───────────────────────────────────────────────────

const STEPS = [
  {
    selector: null, // Welcome — no highlight
    title: "Willkommen!",
    description: "Das ist dein persönliches Gesundheits-Dashboard. Lass uns kurz durchgehen, was dich hier erwartet.",
    emoji: "👋",
  },
  {
    selector: "[data-tutorial='sessions']",
    title: "Dein Tagesplan",
    description: "Hier siehst du deine heutigen Pausen-Fit Sessions. Sie werden automatisch basierend auf deinem Check-In erstellt.",
    emoji: "🗓️",
  },
  {
    selector: "[data-tutorial='atem-pause']",
    title: "Atem-Pause",
    description: "Für stressige Momente: Eine geführte 1-Minuten-Atemübung. Freiwillig, jederzeit verfügbar.",
    emoji: "🧘",
  },
  {
    selector: "[data-tutorial='bildschirm-pause']",
    title: "Bildschirm-Pause",
    description: "Die 20-20-20 Regel: Alle 20 Minuten 20 Sekunden in die Ferne schauen. Gut für deine Augen.",
    emoji: "👀",
  },
  {
    selector: "[data-tutorial='hydration']",
    title: "Hydration-Tracker",
    description: "Tracke deine Wasseraufnahme. Tippe auf das Glas oder den Button, wenn du ein Glas getrunken hast.",
    emoji: "💧",
  },
  {
    selector: "[data-tutorial='team-puls']",
    title: "Team-Puls",
    description: "Sieh anonym, wie aktiv dein Team ist. Keine individuellen Daten — nur der Team-Spirit zählt.",
    emoji: "👥",
  },
  {
    selector: "[data-tutorial='goals']",
    title: "Deine Ziele",
    description: "Die Gesundheitsziele aus deiner Analyse. Hier siehst du deinen Fortschritt auf einen Blick.",
    emoji: "🎯",
  },
  {
    selector: "[data-tutorial='weekly']",
    title: "Wochen-Übersicht",
    description: "Dein Aktivitäts-Kalender. Grün = erledigt, Mond = Ruhetag. Halte deinen Streak aufrecht!",
    emoji: "📊",
  },
]

const STORAGE_KEY = "bgf-tutorial-completed"

// ── Spotlight Overlay ────────────────────────────────────────────────

interface SpotlightRect {
  top: number
  left: number
  width: number
  height: number
}

function SpotlightOverlay({
  rect,
  children,
}: {
  rect: SpotlightRect | null
  children: React.ReactNode
}) {
  // Full-screen overlay with a transparent cutout
  const padding = 8
  const borderRadius = 20

  return (
    <div className="fixed inset-0 z-[100]">
      {/* Dark overlay with cutout via clip-path */}
      <div
        className="absolute inset-0 bg-slate-900/70 transition-all duration-500"
        style={
          rect
            ? {
                clipPath: `polygon(
                  0% 0%, 0% 100%, 100% 100%, 100% 0%, 0% 0%,
                  ${rect.left - padding}px ${rect.top - padding}px,
                  ${rect.left - padding}px ${rect.top + rect.height + padding}px,
                  ${rect.left + rect.width + padding}px ${rect.top + rect.height + padding}px,
                  ${rect.left + rect.width + padding}px ${rect.top - padding}px,
                  ${rect.left - padding}px ${rect.top - padding}px
                )`,
              }
            : undefined
        }
      />

      {/* Highlight border around cutout */}
      {rect && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          className="absolute border-2 border-white/30 pointer-events-none"
          style={{
            top: rect.top - padding,
            left: rect.left - padding,
            width: rect.width + padding * 2,
            height: rect.height + padding * 2,
            borderRadius,
          }}
        />
      )}

      {/* Content (tooltip) */}
      {children}
    </div>
  )
}

// ── Main Component ───────────────────────────────────────────────────

export function DashboardTutorial() {
  const [isActive, setIsActive] = useState(false)
  const [stepIndex, setStepIndex] = useState(0)
  const [spotlightRect, setSpotlightRect] = useState<SpotlightRect | null>(null)

  // Check if tutorial should show
  useEffect(() => {
    const completed = localStorage.getItem(STORAGE_KEY)
    if (!completed) {
      // Small delay so dashboard renders first
      const timer = setTimeout(() => setIsActive(true), 800)
      return () => clearTimeout(timer)
    }
  }, [])

  // Position spotlight on current step's element
  const positionSpotlight = useCallback(() => {
    const step = STEPS[stepIndex]
    if (!step.selector) {
      setSpotlightRect(null)
      return
    }

    const el = document.querySelector(step.selector)
    if (el) {
      const rect = el.getBoundingClientRect()
      setSpotlightRect({
        top: rect.top,
        left: rect.left,
        width: rect.width,
        height: rect.height,
      })

      // Scroll element into view
      el.scrollIntoView({ behavior: "smooth", block: "center" })
    } else {
      setSpotlightRect(null)
    }
  }, [stepIndex])

  useEffect(() => {
    if (!isActive) return
    // Small delay after step change for scroll to settle
    const timer = setTimeout(positionSpotlight, 300)
    return () => clearTimeout(timer)
  }, [isActive, stepIndex, positionSpotlight])

  // Reposition on scroll/resize
  useEffect(() => {
    if (!isActive) return
    const handleReposition = () => positionSpotlight()
    window.addEventListener("scroll", handleReposition, true)
    window.addEventListener("resize", handleReposition)
    return () => {
      window.removeEventListener("scroll", handleReposition, true)
      window.removeEventListener("resize", handleReposition)
    }
  }, [isActive, positionSpotlight])

  function handleNext() {
    if (stepIndex < STEPS.length - 1) {
      setStepIndex((s) => s + 1)
    } else {
      handleComplete()
    }
  }

  function handleComplete() {
    localStorage.setItem(STORAGE_KEY, "true")
    setIsActive(false)
  }

  if (!isActive) return null

  const step = STEPS[stepIndex]
  const isWelcome = stepIndex === 0
  const isLast = stepIndex === STEPS.length - 1

  return (
    <AnimatePresence>
      <SpotlightOverlay rect={spotlightRect}>
        {/* Tooltip card */}
        <motion.div
          key={stepIndex}
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: -20 }}
          transition={{ duration: 0.3 }}
          className={`absolute left-4 right-4 max-w-sm mx-auto ${
            isWelcome
              ? "top-1/2 -translate-y-1/2"
              : spotlightRect && spotlightRect.top > window.innerHeight / 2
              ? "top-20"
              : "bottom-24"
          }`}
          style={
            !isWelcome && spotlightRect
              ? spotlightRect.top > window.innerHeight / 2
                ? { top: Math.max(20, spotlightRect.top - 180) }
                : { top: Math.min(window.innerHeight - 200, spotlightRect.top + spotlightRect.height + 20) }
              : undefined
          }
        >
          <div className="bg-white rounded-2xl shadow-2xl border border-slate-100 p-5 relative">
            {/* Skip button */}
            {!isLast && (
              <button
                onClick={handleComplete}
                className="absolute top-3 right-3 w-7 h-7 rounded-full bg-slate-100 flex items-center justify-center text-slate-400 hover:text-slate-600 hover:bg-slate-200 transition-colors"
                aria-label="Tutorial überspringen"
              >
                <X className="w-3.5 h-3.5" />
              </button>
            )}

            {/* Content */}
            <div className="flex gap-3.5">
              <div className="w-12 h-12 rounded-2xl bg-gradient-to-br from-indigo-100 to-violet-100 flex items-center justify-center text-2xl flex-shrink-0">
                {step.emoji}
              </div>
              <div className="flex-1 min-w-0 pr-4">
                <h3 className="text-base font-bold text-slate-900 mb-1">
                  {step.title}
                </h3>
                <p className="text-sm text-slate-500 leading-relaxed">
                  {step.description}
                </p>
              </div>
            </div>

            {/* Footer */}
            <div className="flex items-center justify-between mt-4 pt-3 border-t border-slate-100">
              {/* Step dots */}
              <div className="flex items-center gap-1">
                {STEPS.map((_, i) => (
                  <div
                    key={i}
                    className={`h-1.5 rounded-full transition-all duration-300 ${
                      i === stepIndex
                        ? "w-5 bg-indigo-500"
                        : i < stepIndex
                        ? "w-1.5 bg-indigo-300"
                        : "w-1.5 bg-slate-200"
                    }`}
                  />
                ))}
              </div>

              {/* Next button */}
              <button
                onClick={handleNext}
                className="flex items-center gap-1.5 text-sm font-bold text-white bg-gradient-to-r from-indigo-500 to-indigo-600 hover:from-indigo-600 hover:to-indigo-700 px-4 py-2 rounded-xl shadow-sm transition-colors"
              >
                {isLast ? (
                  <>
                    <Sparkles className="w-3.5 h-3.5" />
                    Los geht&apos;s!
                  </>
                ) : (
                  <>
                    Weiter
                    <ChevronRight className="w-3.5 h-3.5" />
                  </>
                )}
              </button>
            </div>
          </div>
        </motion.div>
      </SpotlightOverlay>
    </AnimatePresence>
  )
}
