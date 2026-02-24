"use client"

interface SparklineProps {
  /** Datenpunkte (y-Werte, z.B. NRS 0-10) */
  data: number[]
  /** Breite in px */
  width?: number
  /** Höhe in px */
  height?: number
  /** Linienfarbe (CSS-Wert) */
  color?: string
  /** Gradient-Füllung unter der Linie */
  fillColor?: string
  /** Strichbreite */
  strokeWidth?: number
  /** Min-Wert für y-Achse */
  min?: number
  /** Max-Wert für y-Achse */
  max?: number
  /** CSS-Klassen */
  className?: string
}

export function Sparkline({
  data,
  width = 120,
  height = 36,
  color = "#10b981",
  fillColor,
  strokeWidth = 1.5,
  min: propMin,
  max: propMax,
  className = "",
}: SparklineProps) {
  if (data.length < 2) return null

  const padding = 2
  const minVal = propMin ?? Math.min(...data)
  const maxVal = propMax ?? Math.max(...data)
  const range = maxVal - minVal || 1

  const points = data.map((val, i) => {
    const x = padding + (i / (data.length - 1)) * (width - padding * 2)
    const y = padding + (1 - (val - minVal) / range) * (height - padding * 2)
    return { x, y }
  })

  const pathD = points
    .map((p, i) => `${i === 0 ? "M" : "L"} ${p.x.toFixed(1)} ${p.y.toFixed(1)}`)
    .join(" ")

  // Area fill path (close at bottom)
  const areaD = `${pathD} L ${points[points.length - 1].x.toFixed(1)} ${height} L ${points[0].x.toFixed(1)} ${height} Z`

  const gradId = `sparkline-grad-${width}-${height}`
  const resolvedFill = fillColor ?? `${color}20`

  return (
    <svg
      width={width}
      height={height}
      viewBox={`0 0 ${width} ${height}`}
      className={className}
      aria-hidden="true"
    >
      <defs>
        <linearGradient id={gradId} x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stopColor={resolvedFill} />
          <stop offset="100%" stopColor={`${color}00`} />
        </linearGradient>
      </defs>

      {/* Area fill */}
      <path d={areaD} fill={`url(#${gradId})`} />

      {/* Line */}
      <path
        d={pathD}
        fill="none"
        stroke={color}
        strokeWidth={strokeWidth}
        strokeLinecap="round"
        strokeLinejoin="round"
      />

      {/* End dot */}
      <circle
        cx={points[points.length - 1].x}
        cy={points[points.length - 1].y}
        r={2.5}
        fill={color}
      />
    </svg>
  )
}
