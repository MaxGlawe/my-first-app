"use client"

import { useEffect, useRef, useState } from "react"
import { motion, AnimatePresence } from "framer-motion"
import { Droplets, Sparkles } from "lucide-react"
import { HydrationTracker } from "@/components/bgf/dashboard/HydrationTracker"
import { useHydration } from "@/hooks/use-hydration"
import { Skeleton } from "@/components/ui/skeleton"
import { celebrationConfetti } from "@/lib/confetti"

/**
 * Patient-app hydration card. Reuses the BGF animated-glass tracker UI,
 * adds confetti + congrats overlay the moment the patient reaches the
 * daily goal — turns "filled the 8th glass" into a real moment.
 */
export function HydrationCard() {
  const { state, isLoading, isUpdating, add, remove } = useHydration()
  const [showCelebration, setShowCelebration] = useState(false)
  const prevGlassesRef = useRef<number | null>(null)

  // Trigger celebration the moment we *cross* into goal-reached.
  useEffect(() => {
    if (!state) return
    const prev = prevGlassesRef.current
    const reachedNow = state.glasses >= state.goal
    const wasBelow = prev !== null && prev < state.goal

    prevGlassesRef.current = state.glasses

    if (reachedNow && wasBelow) {
      try {
        celebrationConfetti()
      } catch {
        // confetti is purely decorative — never block the celebration banner
      }
      setShowCelebration(true)
    }
  }, [state])

  // Auto-hide the celebration banner after 4 seconds. Separate effect so that
  // state-driven re-renders (e.g. server response after the optimistic update)
  // don't accidentally cancel the timer via cleanup.
  useEffect(() => {
    if (!showCelebration) return
    const t = setTimeout(() => setShowCelebration(false), 4000)
    return () => clearTimeout(t)
  }, [showCelebration])

  if (isLoading || !state) {
    return <Skeleton className="h-[170px] w-full rounded-2xl" />
  }

  return (
    <>
      <HydrationTracker
        current={state.glasses}
        goal={state.goal}
        onAdd={add}
        onRemove={remove}
        isUpdating={isUpdating}
      />

      {/* Full-screen congrats overlay — explicitly lower z-index than the
          confetti canvas (canvas-confetti uses z-9999 via our config) so the
          particles fly *over* the banner. Also: NO backdrop-blur, which would
          create its own stacking context and hide the confetti behind it. */}
      <AnimatePresence>
        {showCelebration && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.25 }}
            className="fixed inset-0 z-50 pointer-events-none flex items-center justify-center px-6"
          >
            {/* Soft gradient backdrop — no blur, so it doesn't form a stacking context */}
            <div className="absolute inset-0 bg-gradient-to-b from-cyan-500/15 via-transparent to-emerald-500/15" />

            {/* Card */}
            <motion.div
              initial={{ scale: 0.6, y: 30, opacity: 0 }}
              animate={{ scale: 1, y: 0, opacity: 1 }}
              exit={{ scale: 0.9, opacity: 0 }}
              transition={{ type: "spring", stiffness: 200, damping: 16 }}
              className="relative bg-white rounded-3xl shadow-2xl shadow-cyan-500/25 px-8 py-7 max-w-sm w-full text-center border border-cyan-100"
            >
              {/* Glow */}
              <div className="absolute -inset-1 bg-gradient-to-br from-cyan-400/30 via-emerald-400/20 to-transparent rounded-3xl blur-xl -z-10" />

              {/* Animated icon */}
              <motion.div
                animate={{
                  rotate: [0, -8, 8, -8, 8, 0],
                  scale: [1, 1.1, 1, 1.1, 1],
                }}
                transition={{ duration: 1.5, repeat: Infinity, repeatDelay: 0.5 }}
                className="inline-flex h-16 w-16 rounded-2xl bg-gradient-to-br from-cyan-400 to-emerald-500 items-center justify-center shadow-lg shadow-cyan-500/40 mb-4"
              >
                <Droplets className="h-8 w-8 text-white" strokeWidth={2.5} />
              </motion.div>

              <div className="flex items-center justify-center gap-2 mb-2">
                <Sparkles className="h-4 w-4 text-amber-400" />
                <p className="text-xs font-bold text-emerald-600 uppercase tracking-wider">
                  Tagesziel geschafft
                </p>
                <Sparkles className="h-4 w-4 text-amber-400" />
              </div>

              <h2 className="text-2xl font-bold text-slate-900 leading-tight mb-2">
                {state.goal} Gläser. 🎉
              </h2>
              <p className="text-sm text-slate-500 leading-relaxed">
                Deine Faszien sagen Danke. Mach morgen genauso weiter.
              </p>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  )
}
