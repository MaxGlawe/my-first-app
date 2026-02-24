"use client"

import { useState } from "react"

interface DataPoint {
  label: string
  value: number
}

interface TrendChartProps {
  /** Datenpunkte (chronologisch, älteste zuerst) */
  data: DataPoint[]
  /** Farbe der Linie */
  color?: string
  /** Zweite Datenlinie (optional) */
  secondaryData?: DataPoint[]
  secondaryColor?: string
  /** Min/Max für y-Achse */
  min?: number
  max?: number
  /** Chart-Höhe in px */
  height?: number
  /** Titel */
  title?: string
  /** Untertitel */
  subtitle?: string
  /** CSS-Klassen */
  className?: string
  /** Zeige Durchschnittslinie */
  showAverage?: boolean
}

export function TrendChart({
  data,
  color = "#10b981",
  secondaryData,
  secondaryColor = "#f87171",
  min: propMin,
  max: propMax,
  height = 180,
  title,
  subtitle,
  className = "",
  showAverage = false,
}: TrendChartProps) {
  const [tooltip, setTooltip] = useState<{
    x: number
    y: number
    label: string
    value: number
    secondary?: number
  } | null>(null)

  if (data.length < 2) {
    return (
      <div className={`rounded-2xl bg-white/80 border border-slate-200/60 p-4 ${className}`}>
        {title && <p className="text-sm font-semibold text-slate-700 mb-1">{title}</p>}
        <p className="text-xs text-slate-400">Nicht genügend Daten für ein Diagramm.</p>
      </div>
    )
  }

  const padding = { top: 16, right: 16, bottom: 28, left: 32 }
  const width = 400
  const chartW = width - padding.left - padding.right
  const chartH = height - padding.top - padding.bottom

  const allValues = [
    ...data.map((d) => d.value),
    ...(secondaryData?.map((d) => d.value) ?? []),
  ]
  const minVal = propMin ?? Math.min(...allValues)
  const maxVal = propMax ?? Math.max(...allValues)
  const range = maxVal - minVal || 1

  const getX = (i: number) => padding.left + (i / (data.length - 1)) * chartW
  const getY = (v: number) => padding.top + (1 - (v - minVal) / range) * chartH

  // Primary line
  const points = data.map((d, i) => ({ x: getX(i), y: getY(d.value) }))
  const pathD = points.map((p, i) => `${i === 0 ? "M" : "L"} ${p.x.toFixed(1)} ${p.y.toFixed(1)}`).join(" ")
  const areaD = `${pathD} L ${points[points.length - 1].x.toFixed(1)} ${padding.top + chartH} L ${points[0].x.toFixed(1)} ${padding.top + chartH} Z`

  // Secondary line
  const secondaryPoints = secondaryData?.map((d, i) => ({ x: getX(i), y: getY(d.value) }))
  const secondaryPathD = secondaryPoints
    ?.map((p, i) => `${i === 0 ? "M" : "L"} ${p.x.toFixed(1)} ${p.y.toFixed(1)}`)
    .join(" ")

  // Average line
  const avg = data.reduce((s, d) => s + d.value, 0) / data.length
  const avgY = getY(avg)

  // Y-axis labels
  const yLabels = [minVal, Math.round((minVal + maxVal) / 2), maxVal]

  // X-axis labels (show first, middle, last)
  const xLabelIndices =
    data.length <= 5
      ? data.map((_, i) => i)
      : [0, Math.floor(data.length / 2), data.length - 1]

  const gradId = `trend-grad-${color.replace("#", "")}`
  const secGradId = `trend-grad-sec-${(secondaryColor ?? "").replace("#", "")}`

  return (
    <div className={`rounded-2xl bg-white/80 backdrop-blur-sm border border-slate-200/60 p-4 ${className}`}>
      {(title || subtitle) && (
        <div className="mb-3">
          {title && <p className="text-sm font-semibold text-slate-700">{title}</p>}
          {subtitle && <p className="text-[11px] text-slate-400">{subtitle}</p>}
        </div>
      )}

      <svg
        viewBox={`0 0 ${width} ${height}`}
        className="w-full"
        style={{ height: "auto" }}
        onMouseLeave={() => setTooltip(null)}
      >
        <defs>
          <linearGradient id={gradId} x1="0" y1="0" x2="0" y2="1">
            <stop offset="0%" stopColor={color} stopOpacity="0.15" />
            <stop offset="100%" stopColor={color} stopOpacity="0" />
          </linearGradient>
          {secondaryColor && (
            <linearGradient id={secGradId} x1="0" y1="0" x2="0" y2="1">
              <stop offset="0%" stopColor={secondaryColor} stopOpacity="0.1" />
              <stop offset="100%" stopColor={secondaryColor} stopOpacity="0" />
            </linearGradient>
          )}
        </defs>

        {/* Grid lines */}
        {yLabels.map((v, i) => {
          const y = getY(v)
          return (
            <g key={i}>
              <line
                x1={padding.left}
                y1={y}
                x2={width - padding.right}
                y2={y}
                stroke="#e2e8f0"
                strokeWidth="0.5"
                strokeDasharray="4 4"
              />
              <text
                x={padding.left - 6}
                y={y + 3}
                textAnchor="end"
                fontSize="9"
                fill="#94a3b8"
              >
                {v}
              </text>
            </g>
          )
        })}

        {/* X-axis labels */}
        {xLabelIndices.map((i) => (
          <text
            key={i}
            x={getX(i)}
            y={height - 4}
            textAnchor="middle"
            fontSize="9"
            fill="#94a3b8"
          >
            {data[i].label}
          </text>
        ))}

        {/* Average line */}
        {showAverage && (
          <line
            x1={padding.left}
            y1={avgY}
            x2={width - padding.right}
            y2={avgY}
            stroke={color}
            strokeWidth="0.8"
            strokeDasharray="6 4"
            opacity="0.4"
          />
        )}

        {/* Secondary area + line */}
        {secondaryPathD && secondaryPoints && (
          <>
            <path
              d={`${secondaryPathD} L ${secondaryPoints[secondaryPoints.length - 1].x.toFixed(1)} ${padding.top + chartH} L ${secondaryPoints[0].x.toFixed(1)} ${padding.top + chartH} Z`}
              fill={`url(#${secGradId})`}
            />
            <path
              d={secondaryPathD}
              fill="none"
              stroke={secondaryColor}
              strokeWidth="2"
              strokeLinecap="round"
              strokeLinejoin="round"
            />
          </>
        )}

        {/* Primary area + line */}
        <path d={areaD} fill={`url(#${gradId})`} />
        <path
          d={pathD}
          fill="none"
          stroke={color}
          strokeWidth="2"
          strokeLinecap="round"
          strokeLinejoin="round"
        />

        {/* Data points (dots) */}
        {points.map((p, i) => (
          <circle
            key={i}
            cx={p.x}
            cy={p.y}
            r={tooltip?.label === data[i].label ? 4 : 2.5}
            fill={color}
            stroke="white"
            strokeWidth="1.5"
            className="cursor-pointer transition-all"
            onMouseEnter={() =>
              setTooltip({
                x: p.x,
                y: p.y,
                label: data[i].label,
                value: data[i].value,
                secondary: secondaryData?.[i]?.value,
              })
            }
          />
        ))}

        {/* Tooltip */}
        {tooltip && (
          <g>
            <rect
              x={tooltip.x - 30}
              y={tooltip.y - 28}
              width={60}
              height={20}
              rx="4"
              fill="#1e293b"
              opacity="0.9"
            />
            <text
              x={tooltip.x}
              y={tooltip.y - 15}
              textAnchor="middle"
              fontSize="10"
              fontWeight="600"
              fill="white"
            >
              {tooltip.value}
              {tooltip.secondary !== undefined ? ` / ${tooltip.secondary}` : ""}
            </text>
          </g>
        )}
      </svg>

      {/* Legend */}
      {secondaryData && (
        <div className="flex items-center gap-4 mt-2 justify-center">
          <div className="flex items-center gap-1.5">
            <div className="w-3 h-0.5 rounded" style={{ backgroundColor: color }} />
            <span className="text-[10px] text-slate-400">{title ?? "Primär"}</span>
          </div>
          <div className="flex items-center gap-1.5">
            <div className="w-3 h-0.5 rounded" style={{ backgroundColor: secondaryColor }} />
            <span className="text-[10px] text-slate-400">Sekundär</span>
          </div>
        </div>
      )}
    </div>
  )
}
