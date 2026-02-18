"use client"

interface FortschrittsRingProps {
  compliance: number // 0–100
  size?: number
  strokeWidth?: number
}

export function FortschrittsRing({
  compliance,
  size = 80,
  strokeWidth = 8,
}: FortschrittsRingProps) {
  const radius = (size - strokeWidth) / 2
  const circumference = 2 * Math.PI * radius
  const filled = Math.min(100, Math.max(0, compliance))
  const dashOffset = circumference * (1 - filled / 100)

  // Color based on compliance
  const color =
    filled >= 80
      ? "#10b981" // emerald-500
      : filled >= 50
      ? "#f59e0b" // amber-500
      : "#ef4444" // red-500

  return (
    <div className="relative inline-flex items-center justify-center" style={{ width: size, height: size }}>
      <svg
        width={size}
        height={size}
        viewBox={`0 0 ${size} ${size}`}
        className="-rotate-90"
        aria-hidden="true"
      >
        {/* Track */}
        <circle
          cx={size / 2}
          cy={size / 2}
          r={radius}
          fill="none"
          stroke="#e2e8f0"
          strokeWidth={strokeWidth}
        />
        {/* Progress */}
        <circle
          cx={size / 2}
          cy={size / 2}
          r={radius}
          fill="none"
          stroke={color}
          strokeWidth={strokeWidth}
          strokeDasharray={circumference}
          strokeDashoffset={dashOffset}
          strokeLinecap="round"
          style={{ transition: "stroke-dashoffset 0.5s ease" }}
        />
      </svg>
      {/* Label */}
      <div className="absolute inset-0 flex flex-col items-center justify-center">
        <span className="text-lg font-bold text-slate-800 leading-none">{filled}%</span>
        <span className="text-[9px] text-slate-400 font-medium leading-none mt-0.5">7 Tage</span>
      </div>
    </div>
  )
}
