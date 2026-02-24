"use client"

import { useState } from "react"

interface BarDataPoint {
  label: string
  value: number
}

interface BarChartProps {
  data: BarDataPoint[]
  /** Max-Wert für y-Achse (default: auto) */
  max?: number
  /** Chart-Höhe in px */
  height?: number
  /** Farbe-Funktion basierend auf Wert (default: Emerald→Amber→Red) */
  getColor?: (value: number, max: number) => string
  /** Titel */
  title?: string
  /** Suffix für Werte (z.B. "%") */
  suffix?: string
  /** CSS-Klassen */
  className?: string
}

function defaultGetColor(value: number, max: number): string {
  const pct = max > 0 ? value / max : 0
  if (pct >= 0.8) return "#10b981" // emerald
  if (pct >= 0.5) return "#f59e0b" // amber
  return "#ef4444" // red
}

export function BarChart({
  data,
  max: propMax,
  height = 160,
  getColor = defaultGetColor,
  title,
  suffix = "",
  className = "",
}: BarChartProps) {
  const [hovered, setHovered] = useState<number | null>(null)

  if (data.length === 0) return null

  const maxVal = propMax ?? Math.max(...data.map((d) => d.value), 1)
  const padding = { top: 12, right: 8, bottom: 28, left: 8 }
  const width = 400
  const chartW = width - padding.left - padding.right
  const chartH = height - padding.top - padding.bottom

  const barGap = 8
  const barWidth = Math.min(40, (chartW - barGap * (data.length - 1)) / data.length)
  const totalBarsW = data.length * barWidth + (data.length - 1) * barGap
  const offsetX = padding.left + (chartW - totalBarsW) / 2

  return (
    <div className={`rounded-2xl bg-white/80 backdrop-blur-sm border border-slate-200/60 p-4 ${className}`}>
      {title && <p className="text-sm font-semibold text-slate-700 mb-3">{title}</p>}

      <svg
        viewBox={`0 0 ${width} ${height}`}
        className="w-full"
        style={{ height: "auto" }}
        onMouseLeave={() => setHovered(null)}
      >
        {/* Baseline */}
        <line
          x1={padding.left}
          y1={padding.top + chartH}
          x2={width - padding.right}
          y2={padding.top + chartH}
          stroke="#e2e8f0"
          strokeWidth="0.5"
        />

        {/* Bars */}
        {data.map((d, i) => {
          const barH = (d.value / maxVal) * chartH
          const x = offsetX + i * (barWidth + barGap)
          const y = padding.top + chartH - barH
          const color = getColor(d.value, maxVal)
          const isHovered = hovered === i

          return (
            <g
              key={i}
              onMouseEnter={() => setHovered(i)}
              className="cursor-pointer"
            >
              {/* Bar */}
              <rect
                x={x}
                y={y}
                width={barWidth}
                height={barH}
                rx={4}
                fill={color}
                opacity={isHovered ? 1 : 0.8}
                style={{
                  transition: "opacity 0.15s ease, height 0.5s cubic-bezier(0.16, 1, 0.3, 1), y 0.5s cubic-bezier(0.16, 1, 0.3, 1)",
                }}
              />

              {/* Value label (on hover) */}
              {isHovered && (
                <text
                  x={x + barWidth / 2}
                  y={y - 6}
                  textAnchor="middle"
                  fontSize="10"
                  fontWeight="600"
                  fill="#334155"
                >
                  {d.value}{suffix}
                </text>
              )}

              {/* X-axis label */}
              <text
                x={x + barWidth / 2}
                y={height - 4}
                textAnchor="middle"
                fontSize="9"
                fill="#94a3b8"
              >
                {d.label}
              </text>
            </g>
          )
        })}
      </svg>
    </div>
  )
}
