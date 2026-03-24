"use client"

import { cn } from "@/lib/utils"

// ── Data ──────────────────────────────────────────────────────────────────────

interface KoerperRegion {
  id: string
  label: string
  shortLabel: string
  icon: string
  description: string
  color: string
  selectedColor: string
}

const REGIONEN: KoerperRegion[] = [
  {
    id: "hws_nacken",
    label: "HWS / Nacken",
    shortLabel: "Nacken",
    icon: "🔴",
    description: "Halswirbelsäule, Nackensteifigkeit",
    color: "from-red-50 to-rose-50 border-red-200",
    selectedColor: "from-red-500 to-rose-600 border-transparent text-white",
  },
  {
    id: "kopf_migraene",
    label: "Kopf / Migräne",
    shortLabel: "Kopf",
    icon: "🧠",
    description: "Kopfschmerzen, Migräne, Schwindel",
    color: "from-purple-50 to-violet-50 border-purple-200",
    selectedColor: "from-purple-500 to-violet-600 border-transparent text-white",
  },
  {
    id: "schulter_links",
    label: "Schulter links",
    shortLabel: "Schulter L",
    icon: "🫱",
    description: "Linke Schulter, Impingement",
    color: "from-blue-50 to-sky-50 border-blue-200",
    selectedColor: "from-blue-500 to-sky-600 border-transparent text-white",
  },
  {
    id: "schulter_rechts",
    label: "Schulter rechts",
    shortLabel: "Schulter R",
    icon: "🫲",
    description: "Rechte Schulter, Impingement",
    color: "from-blue-50 to-sky-50 border-blue-200",
    selectedColor: "from-blue-500 to-sky-600 border-transparent text-white",
  },
  {
    id: "bws",
    label: "BWS",
    shortLabel: "BWS",
    icon: "⬆️",
    description: "Brustwirbelsäule, oberer Rücken",
    color: "from-teal-50 to-emerald-50 border-teal-200",
    selectedColor: "from-teal-500 to-emerald-600 border-transparent text-white",
  },
  {
    id: "lws",
    label: "LWS",
    shortLabel: "LWS",
    icon: "⬇️",
    description: "Lendenwirbelsäule, unterer Rücken",
    color: "from-orange-50 to-amber-50 border-orange-200",
    selectedColor: "from-orange-500 to-amber-600 border-transparent text-white",
  },
  {
    id: "handgelenk_ellenbogen",
    label: "Handgelenk / Ellenbogen",
    shortLabel: "Hand/Arm",
    icon: "💪",
    description: "Tennisarm, Karpaltunnel, RSI",
    color: "from-yellow-50 to-lime-50 border-yellow-200",
    selectedColor: "from-yellow-500 to-lime-600 border-transparent text-white",
  },
  {
    id: "huefte",
    label: "Hüfte",
    shortLabel: "Hüfte",
    icon: "🔷",
    description: "Hüftgelenk, Ischiasnerv",
    color: "from-indigo-50 to-blue-50 border-indigo-200",
    selectedColor: "from-indigo-500 to-blue-600 border-transparent text-white",
  },
  {
    id: "knie_links",
    label: "Knie links",
    shortLabel: "Knie L",
    icon: "🦵",
    description: "Linkes Kniegelenk",
    color: "from-green-50 to-emerald-50 border-green-200",
    selectedColor: "from-green-500 to-emerald-600 border-transparent text-white",
  },
  {
    id: "knie_rechts",
    label: "Knie rechts",
    shortLabel: "Knie R",
    icon: "🦵",
    description: "Rechtes Kniegelenk",
    color: "from-green-50 to-emerald-50 border-green-200",
    selectedColor: "from-green-500 to-emerald-600 border-transparent text-white",
  },
]

// ── Component ─────────────────────────────────────────────────────────────────

interface Props {
  selected: string[]
  onChange: (selected: string[]) => void
}

export function IstAnalyseStepBeschwerden({ selected, onChange }: Props) {
  function toggle(id: string) {
    if (selected.includes(id)) {
      onChange(selected.filter((r) => r !== id))
    } else {
      onChange([...selected, id])
    }
  }

  return (
    <div>
      {/* None option */}
      <button
        type="button"
        onClick={() => onChange([])}
        className={cn(
          "w-full flex items-center gap-3 p-3.5 rounded-xl border-2 mb-4 transition-all duration-200",
          "focus:outline-none focus-visible:ring-2 focus-visible:ring-offset-2 focus-visible:ring-indigo-500",
          selected.length === 0
            ? "bg-gradient-to-r from-slate-600 to-slate-700 border-transparent text-white shadow-md"
            : "bg-slate-50 border-slate-200 text-slate-700 hover:bg-slate-100"
        )}
        aria-pressed={selected.length === 0}
      >
        <span className="text-xl" aria-hidden>✅</span>
        <div className="text-left">
          <p className={cn("text-sm font-semibold", selected.length === 0 ? "text-white" : "text-slate-800")}>
            Keine Beschwerden
          </p>
          <p className={cn("text-xs", selected.length === 0 ? "text-white/70" : "text-slate-500")}>
            Ich fühle mich beschwerdefrei
          </p>
        </div>
        {selected.length === 0 && (
          <span className="ml-auto w-5 h-5 bg-white/30 rounded-full flex items-center justify-center">
            <svg className="w-3 h-3 text-white" fill="currentColor" viewBox="0 0 20 20">
              <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
            </svg>
          </span>
        )}
      </button>

      {/* Region cards */}
      <div className="grid grid-cols-2 gap-2.5">
        {REGIONEN.map((region) => {
          const isSelected = selected.includes(region.id)
          return (
            <button
              key={region.id}
              type="button"
              onClick={() => toggle(region.id)}
              className={cn(
                "relative flex flex-col items-start p-3.5 rounded-xl border-2 transition-all duration-200 text-left",
                "focus:outline-none focus-visible:ring-2 focus-visible:ring-offset-2 focus-visible:ring-indigo-500",
                "active:scale-[0.97]",
                isSelected
                  ? `bg-gradient-to-br ${region.selectedColor} shadow-md scale-[1.01]`
                  : `bg-gradient-to-br ${region.color} hover:shadow-sm hover:scale-[1.01]`
              )}
              aria-pressed={isSelected}
            >
              {/* Checkmark */}
              {isSelected && (
                <span className="absolute top-2 right-2 w-4.5 h-4.5 bg-white/30 rounded-full flex items-center justify-center">
                  <svg className="w-3 h-3 text-white" fill="currentColor" viewBox="0 0 20 20">
                    <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                  </svg>
                </span>
              )}

              <span className="text-xl mb-1.5 leading-none" aria-hidden>
                {region.icon}
              </span>
              <span className={cn("text-sm font-semibold leading-tight", isSelected ? "text-white" : "text-slate-800")}>
                {region.label}
              </span>
              <span className={cn("text-[10px] mt-0.5 leading-snug", isSelected ? "text-white/75" : "text-slate-500")}>
                {region.description}
              </span>
            </button>
          )
        })}
      </div>

      {/* Selection summary */}
      {selected.length > 0 && (
        <div className="mt-4 p-3 bg-indigo-50 border border-indigo-100 rounded-xl">
          <p className="text-xs text-indigo-700 font-medium">
            {selected.length} Bereich{selected.length !== 1 ? "e" : ""} ausgewählt:{" "}
            {selected
              .map((id) => REGIONEN.find((r) => r.id === id)?.shortLabel ?? id)
              .join(", ")}
          </p>
        </div>
      )}
    </div>
  )
}
