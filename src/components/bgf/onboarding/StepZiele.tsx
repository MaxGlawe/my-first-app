"use client"

import { cn } from "@/lib/utils"

// ── Data ──────────────────────────────────────────────────────────────────────

interface ZielOption {
  id: string
  label: string
  description: string
  icon: string
  gradient: string
  selectedGradient: string
}

const ZIELE: ZielOption[] = [
  {
    id: "weniger_schmerzen",
    label: "Weniger Schmerzen",
    description: "Akute und chronische Beschwerden lindern",
    icon: "💊",
    gradient: "from-red-50 to-rose-50 border-red-200",
    selectedGradient: "from-red-500 to-rose-600 border-transparent",
  },
  {
    id: "fitter_werden",
    label: "Fitter werden",
    description: "Kraft, Ausdauer und Energie steigern",
    icon: "💪",
    gradient: "from-orange-50 to-amber-50 border-orange-200",
    selectedGradient: "from-orange-500 to-amber-500 border-transparent",
  },
  {
    id: "stress_abbauen",
    label: "Stress abbauen",
    description: "Entspannung und mentale Erholung",
    icon: "🧘",
    gradient: "from-violet-50 to-purple-50 border-violet-200",
    selectedGradient: "from-violet-500 to-purple-600 border-transparent",
  },
  {
    id: "haltung_verbessern",
    label: "Haltung verbessern",
    description: "Rücken, Körperhaltung und Ergonomie",
    icon: "🦷",
    gradient: "from-blue-50 to-sky-50 border-blue-200",
    selectedGradient: "from-blue-500 to-sky-600 border-transparent",
  },
  {
    id: "mehr_bewegung",
    label: "Mehr Bewegung",
    description: "Aktiver im Alltag und bei der Arbeit",
    icon: "🚶",
    gradient: "from-green-50 to-emerald-50 border-green-200",
    selectedGradient: "from-green-500 to-emerald-600 border-transparent",
  },
  {
    id: "praevention",
    label: "Prävention",
    description: "Beschwerden und Verletzungen vorbeugen",
    icon: "🛡️",
    gradient: "from-teal-50 to-cyan-50 border-teal-200",
    selectedGradient: "from-teal-500 to-cyan-600 border-transparent",
  },
]

// ── Component ─────────────────────────────────────────────────────────────────

interface Props {
  selected: string[]
  onChange: (selected: string[]) => void
}

export function IstAnalyseStepZiele({ selected, onChange }: Props) {
  function toggle(id: string) {
    if (selected.includes(id)) {
      onChange(selected.filter((z) => z !== id))
    } else {
      onChange([...selected, id])
    }
  }

  return (
    <div>
      {/* Hint */}
      <div className="mb-4 p-3 bg-indigo-50 border border-indigo-100 rounded-xl">
        <p className="text-xs text-indigo-700">
          Wählen Sie ein oder mehrere Ziele. Das Programm wird individuell auf Ihre Ziele abgestimmt.
        </p>
      </div>

      {/* Goal cards */}
      <div className="grid grid-cols-1 gap-3">
        {ZIELE.map((ziel) => {
          const isSelected = selected.includes(ziel.id)
          return (
            <button
              key={ziel.id}
              type="button"
              onClick={() => toggle(ziel.id)}
              className={cn(
                "relative flex items-center gap-4 p-4 rounded-2xl border-2 transition-all duration-200",
                "focus:outline-none focus-visible:ring-2 focus-visible:ring-offset-2 focus-visible:ring-indigo-500",
                "active:scale-[0.98] text-left",
                isSelected
                  ? `bg-gradient-to-r ${ziel.selectedGradient} shadow-md`
                  : `bg-gradient-to-r ${ziel.gradient} hover:shadow-sm hover:scale-[1.005]`
              )}
              aria-pressed={isSelected}
            >
              {/* Icon */}
              <span className="text-3xl leading-none shrink-0" aria-hidden>
                {ziel.icon}
              </span>

              {/* Text */}
              <div className="flex-1 min-w-0">
                <p className={cn(
                  "text-sm font-semibold leading-tight",
                  isSelected ? "text-white" : "text-slate-800"
                )}>
                  {ziel.label}
                </p>
                <p className={cn(
                  "text-xs mt-0.5 leading-snug",
                  isSelected ? "text-white/75" : "text-slate-500"
                )}>
                  {ziel.description}
                </p>
              </div>

              {/* Checkmark */}
              <div className={cn(
                "shrink-0 w-6 h-6 rounded-full border-2 flex items-center justify-center transition-all",
                isSelected
                  ? "bg-white/30 border-white/50"
                  : "border-slate-300 bg-white"
              )}>
                {isSelected && (
                  <svg className="w-3.5 h-3.5 text-white" fill="currentColor" viewBox="0 0 20 20">
                    <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                  </svg>
                )}
              </div>
            </button>
          )
        })}
      </div>

      {/* Validation message */}
      {selected.length === 0 && (
        <p className="mt-4 text-center text-xs text-slate-400">
          Bitte wählen Sie mindestens ein Ziel aus
        </p>
      )}

      {selected.length > 0 && (
        <p className="mt-4 text-center text-xs text-indigo-600 font-medium">
          {selected.length} Ziel{selected.length !== 1 ? "e" : ""} ausgewählt
        </p>
      )}
    </div>
  )
}
