"use client"

import type { ArbeitsplatzTyp } from "@/types/bgf"
import { cn } from "@/lib/utils"

// ── Data ──────────────────────────────────────────────────────────────────────

interface ArbeitsplatzOption {
  value: ArbeitsplatzTyp
  label: string
  description: string
  icon: string
  gradient: string
  border: string
  selectedBg: string
}

const OPTIONS: ArbeitsplatzOption[] = [
  {
    value: "buero",
    label: "Büro",
    description: "Schreibtisch, PC, Meetings",
    icon: "🖥️",
    gradient: "from-blue-50 to-indigo-50",
    border: "border-blue-200",
    selectedBg: "from-blue-500 to-indigo-600",
  },
  {
    value: "homeoffice",
    label: "Homeoffice",
    description: "Zuhause am Arbeitsplatz",
    icon: "🏠",
    gradient: "from-violet-50 to-purple-50",
    border: "border-violet-200",
    selectedBg: "from-violet-500 to-purple-600",
  },
  {
    value: "lager",
    label: "Lager",
    description: "Lagerhaltung, Kommissionierung",
    icon: "📦",
    gradient: "from-amber-50 to-orange-50",
    border: "border-amber-200",
    selectedBg: "from-amber-500 to-orange-500",
  },
  {
    value: "produktion",
    label: "Produktion",
    description: "Fertigung, Montage, Maschinen",
    icon: "⚙️",
    gradient: "from-slate-50 to-gray-100",
    border: "border-slate-200",
    selectedBg: "from-slate-600 to-gray-700",
  },
  {
    value: "handwerk",
    label: "Handwerk",
    description: "Körperliche Handarbeit, Baustelle",
    icon: "🔨",
    gradient: "from-orange-50 to-red-50",
    border: "border-orange-200",
    selectedBg: "from-orange-500 to-red-500",
  },
  {
    value: "pflege",
    label: "Pflege",
    description: "Gesundheits- & Sozialwesen",
    icon: "🩺",
    gradient: "from-green-50 to-teal-50",
    border: "border-green-200",
    selectedBg: "from-green-500 to-teal-500",
  },
  {
    value: "mischform",
    label: "Mischform",
    description: "Kombination verschiedener Bereiche",
    icon: "🔀",
    gradient: "from-pink-50 to-rose-50",
    border: "border-pink-200",
    selectedBg: "from-pink-500 to-rose-500",
  },
]

// ── Component ─────────────────────────────────────────────────────────────────

interface Props {
  value: ArbeitsplatzTyp
  onChange: (value: ArbeitsplatzTyp) => void
}

export function IstAnalyseStepArbeitsplatz({ value, onChange }: Props) {
  return (
    <div className="grid grid-cols-2 gap-3 sm:gap-4">
      {OPTIONS.map((opt) => {
        const isSelected = value === opt.value
        return (
          <button
            key={opt.value}
            type="button"
            onClick={() => onChange(opt.value)}
            className={cn(
              "relative flex flex-col items-center text-center p-4 rounded-2xl border-2 transition-all duration-200 shadow-sm",
              "focus:outline-none focus-visible:ring-2 focus-visible:ring-offset-2 focus-visible:ring-indigo-500",
              "active:scale-[0.97]",
              isSelected
                ? `bg-gradient-to-br ${opt.selectedBg} border-transparent text-white shadow-md scale-[1.02]`
                : `bg-gradient-to-br ${opt.gradient} ${opt.border} hover:shadow-md hover:scale-[1.01]`
            )}
            aria-pressed={isSelected}
          >
            {/* Selection indicator */}
            {isSelected && (
              <span className="absolute top-2 right-2 w-5 h-5 bg-white/30 rounded-full flex items-center justify-center">
                <svg className="w-3 h-3 text-white" fill="currentColor" viewBox="0 0 20 20">
                  <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                </svg>
              </span>
            )}

            {/* Icon */}
            <span className="text-3xl mb-2 leading-none" aria-hidden>
              {opt.icon}
            </span>

            {/* Label */}
            <span className={cn(
              "text-sm font-semibold leading-tight",
              isSelected ? "text-white" : "text-slate-800"
            )}>
              {opt.label}
            </span>

            {/* Description */}
            <span className={cn(
              "text-[11px] mt-0.5 leading-snug",
              isSelected ? "text-white/80" : "text-slate-500"
            )}>
              {opt.description}
            </span>
          </button>
        )
      })}
    </div>
  )
}
