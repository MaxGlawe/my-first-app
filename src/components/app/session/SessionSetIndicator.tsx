"use client"

interface SessionSetIndicatorProps {
  currentSet: number  // 0-indexed: how many sets completed
  totalSets: number
}

export function SessionSetIndicator({ currentSet, totalSets }: SessionSetIndicatorProps) {
  if (totalSets <= 1) return null

  return (
    <div className="flex flex-col items-center gap-1.5">
      <div className="flex items-center gap-2">
        {Array.from({ length: totalSets }, (_, i) => (
          <div
            key={i}
            className={`h-2.5 w-2.5 rounded-full transition-all duration-300 ${
              i < currentSet
                ? "bg-emerald-500 scale-100"
                : i === currentSet
                  ? "bg-emerald-400 scale-125 animate-countdown-pulse"
                  : "bg-slate-200"
            }`}
          />
        ))}
      </div>
      <p className="text-xs text-slate-500">
        Satz {Math.min(currentSet + 1, totalSets)} von {totalSets}
      </p>
    </div>
  )
}
