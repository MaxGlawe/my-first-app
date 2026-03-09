"use client"

interface SessionRepCounterProps {
  reps: number
  label?: string
}

export function SessionRepCounter({ reps, label = "Wdh." }: SessionRepCounterProps) {
  return (
    <div className="flex flex-col items-center gap-1">
      <span className="text-7xl font-bold text-slate-900 tabular-nums leading-none">
        {reps}
      </span>
      <span className="text-sm font-medium text-slate-400 uppercase tracking-wider">
        {label}
      </span>
    </div>
  )
}
