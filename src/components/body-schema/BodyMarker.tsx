import { MARKER_CONFIG, type MarkerType } from "./types"

interface BodyMarkerProps {
  x: number
  y: number
  type: MarkerType
  onClick?: (e: React.MouseEvent) => void
  readOnly?: boolean
}

export function BodyMarker({ x, y, type, onClick, readOnly }: BodyMarkerProps) {
  const config = MARKER_CONFIG[type] ?? MARKER_CONFIG.schmerz

  return (
    <g
      onClick={onClick}
      className={readOnly ? "" : "cursor-pointer"}
      role={readOnly ? undefined : "button"}
      aria-label={readOnly ? `${config.label} Markierung` : "Markierung entfernen"}
    >
      {/* Outer halo */}
      <circle cx={x} cy={y} r={11} fill={config.halo} />
      {/* Main marker circle */}
      <circle
        cx={x}
        cy={y}
        r={6.5}
        fill={config.color}
        stroke="white"
        strokeWidth="1.8"
        style={{ filter: "drop-shadow(0 1px 2px rgba(0,0,0,0.15))" }}
      />
      {/* Type indicator symbol */}
      <text
        x={x}
        y={y + 1.2}
        textAnchor="middle"
        dominantBaseline="middle"
        fontSize="5.5"
        fill="white"
        fontWeight="bold"
        style={{ pointerEvents: "none", userSelect: "none" }}
      >
        {type === "schmerz" && "✦"}
        {type === "taubheit" && "≡"}
        {type === "ausstrahlung" && "↗"}
        {type === "schwellung" && "◉"}
      </text>
    </g>
  )
}
