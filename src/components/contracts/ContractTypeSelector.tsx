"use client"

import { CONTRACT_TYPE_CONFIG } from "@/types/contract"
import type { ContractType } from "@/types/contract"
import { Video, Activity, Clock, type LucideIcon } from "lucide-react"

const typeIcons: Record<ContractType, LucideIcon> = {
  einzelsitzung: Video,
  mini_reha_post_op: Activity,
  chronik_programm: Clock,
}

interface ContractTypeSelectorProps {
  value: ContractType | null
  onChange: (type: ContractType) => void
}

export function ContractTypeSelector({ value, onChange }: ContractTypeSelectorProps) {
  return (
    <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
      {(Object.entries(CONTRACT_TYPE_CONFIG) as [ContractType, typeof CONTRACT_TYPE_CONFIG[ContractType]][]).map(
        ([type, config]) => {
          const Icon = typeIcons[type]
          const isSelected = value === type

          return (
            <button
              key={type}
              type="button"
              onClick={() => onChange(type)}
              className={`relative rounded-2xl border-2 p-5 text-left transition-all ${
                isSelected
                  ? "border-emerald-500 bg-emerald-50/50 shadow-lg shadow-emerald-500/10"
                  : "border-slate-200 bg-white hover:border-slate-300"
              }`}
            >
              <div className={`h-10 w-10 rounded-xl flex items-center justify-center mb-3 ${
                isSelected ? "bg-emerald-100" : "bg-slate-100"
              }`}>
                <Icon className={`h-5 w-5 ${isSelected ? "text-emerald-600" : "text-slate-500"}`} />
              </div>
              <h4 className="font-semibold text-slate-900 text-sm">{config.label}</h4>
              <p className="text-xs text-slate-500 mt-1 leading-relaxed">{config.description}</p>
              {isSelected && (
                <div className="absolute top-3 right-3 h-5 w-5 rounded-full bg-emerald-500 flex items-center justify-center">
                  <svg className="h-3 w-3 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={3}>
                    <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
                  </svg>
                </div>
              )}
            </button>
          )
        }
      )}
    </div>
  )
}
