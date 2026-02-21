"use client"

import type { PainPoint } from "@/types/anamnesis"

interface BodySchemaProps {
  value: PainPoint[]
  onChange?: (points: PainPoint[]) => void
  readOnly?: boolean
}

const BODY_SVG_WIDTH = 200
const BODY_SVG_HEIGHT = 400

// ── Realistic anterior (front) human body silhouette ──────────────────────────
// Anatomically proportioned: head, neck, shoulders, arms, hands, torso, legs, feet
const ANTERIOR_BODY_PATH = `
  M 100 8
  C 112 8, 120 16, 120 28
  C 120 40, 112 50, 100 50
  C 88 50, 80 40, 80 28
  C 80 16, 88 8, 100 8 Z

  M 93 50 L 93 58 C 93 62, 92 64, 90 66
  L 107 50 Z
  M 107 50 L 110 66 C 108 64, 107 62, 107 58 L 107 50 Z

  M 90 66
  C 82 68, 68 70, 56 74
  C 44 78, 36 84, 30 92
  C 24 100, 22 112, 20 124
  L 16 156
  L 14 170
  C 12 178, 10 184, 8 188
  C 6 194, 6 198, 8 200
  C 10 202, 14 200, 16 196
  L 20 184
  L 24 170
  L 28 156
  L 32 136
  C 34 128, 38 118, 42 110
  C 46 102, 50 96, 56 90
  L 62 84
  L 62 116
  C 60 126, 58 138, 58 148
  L 56 196
  L 54 230
  L 52 268
  C 52 276, 50 288, 50 296
  C 50 306, 48 318, 48 328
  L 46 348
  C 44 358, 44 366, 46 372
  C 48 376, 48 380, 44 384
  C 40 388, 38 390, 38 392
  C 38 396, 44 398, 52 398
  C 60 398, 66 396, 68 392
  C 70 388, 68 380, 68 374
  C 68 368, 68 360, 68 348
  L 72 328
  C 74 318, 76 306, 78 296
  C 80 286, 82 274, 84 264
  L 88 224
  L 92 196
  L 96 166
  L 100 166
  L 104 196
  L 108 224
  L 116 264
  C 118 274, 120 286, 122 296
  C 124 306, 126 318, 128 328
  L 132 348
  C 132 360, 132 368, 132 374
  C 132 380, 130 388, 132 392
  C 134 396, 140 398, 148 398
  C 156 398, 162 396, 162 392
  C 162 390, 160 388, 156 384
  C 152 380, 152 376, 154 372
  C 156 366, 156 358, 154 348
  L 152 328
  C 152 318, 150 306, 150 296
  C 150 288, 148 276, 148 268
  L 146 230
  L 144 196
  L 142 148
  C 142 138, 140 126, 138 116
  L 138 84
  L 144 90
  C 150 96, 154 102, 158 110
  C 162 118, 166 128, 168 136
  L 172 156
  L 176 170
  L 180 184
  L 184 196
  C 186 200, 190 202, 192 200
  C 194 198, 194 194, 192 188
  C 190 184, 188 178, 186 170
  L 184 156
  L 180 124
  C 178 112, 176 100, 170 92
  C 164 84, 156 78, 144 74
  C 132 70, 118 68, 110 66
  L 90 66 Z
`

// ── Anatomical detail lines for the anterior view ─────────────────────────────
const ANTERIOR_DETAILS = [
  // Clavicles (Schlüsselbein)
  "M 72 72 Q 86 68, 100 70 Q 114 68, 128 72",
  // Pectorals outline
  "M 72 80 Q 80 88, 88 90 Q 94 92, 100 90 Q 106 92, 112 90 Q 120 88, 128 80",
  // Abs center line
  "M 100 92 L 100 160",
  // Navel
  "M 96 140 Q 100 144, 104 140",
  // Hip line
  "M 70 164 Q 100 172, 130 164",
  // Knee caps
  "M 78 296 Q 82 302, 86 296",
  "M 114 296 Q 118 302, 122 296",
]

// ── Realistic posterior (back) human body silhouette ──────────────────────────
// Same proportions, slightly different contours for back anatomy
const POSTERIOR_BODY_PATH = `
  M 100 8
  C 112 8, 120 16, 120 28
  C 120 40, 112 50, 100 50
  C 88 50, 80 40, 80 28
  C 80 16, 88 8, 100 8 Z

  M 93 50 L 93 58 C 93 62, 92 64, 90 66
  L 107 50 Z
  M 107 50 L 110 66 C 108 64, 107 62, 107 58 L 107 50 Z

  M 90 66
  C 82 68, 68 70, 56 74
  C 44 78, 36 84, 30 92
  C 24 100, 22 112, 20 124
  L 16 156
  L 14 170
  C 12 178, 10 184, 8 188
  C 6 194, 6 198, 8 200
  C 10 202, 14 200, 16 196
  L 20 184
  L 24 170
  L 28 156
  L 32 136
  C 34 128, 38 118, 42 110
  C 46 102, 50 96, 56 90
  L 62 84
  L 62 116
  C 60 126, 58 138, 58 148
  L 56 196
  L 54 230
  L 52 268
  C 52 276, 50 288, 50 296
  C 50 306, 48 318, 48 328
  L 46 348
  C 44 358, 44 366, 46 372
  C 48 376, 48 380, 44 384
  C 40 388, 38 390, 38 392
  C 38 396, 44 398, 52 398
  C 60 398, 66 396, 68 392
  C 70 388, 68 380, 68 374
  C 68 368, 68 360, 68 348
  L 72 328
  C 74 318, 76 306, 78 296
  C 80 286, 82 274, 84 264
  L 88 224
  L 92 196
  L 96 166
  L 100 166
  L 104 196
  L 108 224
  L 116 264
  C 118 274, 120 286, 122 296
  C 124 306, 126 318, 128 328
  L 132 348
  C 132 360, 132 368, 132 374
  C 132 380, 130 388, 132 392
  C 134 396, 140 398, 148 398
  C 156 398, 162 396, 162 392
  C 162 390, 160 388, 156 384
  C 152 380, 152 376, 154 372
  C 156 366, 156 358, 154 348
  L 152 328
  C 152 318, 150 306, 150 296
  C 150 288, 148 276, 148 268
  L 146 230
  L 144 196
  L 142 148
  C 142 138, 140 126, 138 116
  L 138 84
  L 144 90
  C 150 96, 154 102, 158 110
  C 162 118, 166 128, 168 136
  L 172 156
  L 176 170
  L 180 184
  L 184 196
  C 186 200, 190 202, 192 200
  C 194 198, 194 194, 192 188
  C 190 184, 188 178, 186 170
  L 184 156
  L 180 124
  C 178 112, 176 100, 170 92
  C 164 84, 156 78, 144 74
  C 132 70, 118 68, 110 66
  L 90 66 Z
`

// ── Anatomical detail lines for the posterior view ────────────────────────────
const POSTERIOR_DETAILS = [
  // Spine (Wirbelsäule)
  "M 100 58 L 100 168",
  // Scapulae (Schulterblätter)
  "M 72 78 Q 78 86, 88 90 Q 92 88, 94 84",
  "M 128 78 Q 122 86, 112 90 Q 108 88, 106 84",
  // Lower back dimples (Iliosakralgelenk)
  "M 88 158 Q 92 162, 88 166",
  "M 112 158 Q 108 162, 112 166",
  // Gluteal fold
  "M 72 178 Q 86 186, 100 184 Q 114 186, 128 178",
  // Knee creases
  "M 76 300 Q 82 304, 88 300",
  "M 112 300 Q 118 304, 124 300",
  // Achilles tendon lines
  "M 80 348 L 80 374",
  "M 120 348 L 120 374",
]

// ── Body region labels (positioned at anatomical landmarks) ───────────────────
const ANTERIOR_LABELS: { x: number; y: number; label: string }[] = [
  { x: 100, y: 29, label: "Kopf" },
  { x: 100, y: 60, label: "HWS" },
  { x: 64, y: 74, label: "Schulter" },
  { x: 136, y: 74, label: "Schulter" },
  { x: 100, y: 120, label: "Thorax" },
  { x: 36, y: 136, label: "Ellbogen" },
  { x: 164, y: 136, label: "Ellbogen" },
  { x: 100, y: 152, label: "LWS" },
  { x: 82, y: 200, label: "Hüfte" },
  { x: 118, y: 200, label: "Hüfte" },
  { x: 82, y: 296, label: "Knie" },
  { x: 118, y: 296, label: "Knie" },
  { x: 60, y: 380, label: "Fuß" },
  { x: 140, y: 380, label: "Fuß" },
]

const POSTERIOR_LABELS: { x: number; y: number; label: string }[] = [
  { x: 100, y: 29, label: "Kopf" },
  { x: 100, y: 60, label: "HWS" },
  { x: 64, y: 74, label: "Schulter" },
  { x: 136, y: 74, label: "Schulter" },
  { x: 84, y: 88, label: "Scapula" },
  { x: 116, y: 88, label: "Scapula" },
  { x: 100, y: 108, label: "BWS" },
  { x: 36, y: 136, label: "Ellbogen" },
  { x: 164, y: 136, label: "Ellbogen" },
  { x: 100, y: 152, label: "LWS" },
  { x: 86, y: 182, label: "Gesäß" },
  { x: 114, y: 182, label: "Gesäß" },
  { x: 82, y: 300, label: "Knie" },
  { x: 118, y: 300, label: "Knie" },
  { x: 80, y: 360, label: "Achilles" },
  { x: 120, y: 360, label: "Achilles" },
]

// ── BodyView sub-component ────────────────────────────────────────────────────

interface BodyViewProps {
  view: "anterior" | "posterior"
  points: PainPoint[]
  onAddPoint?: (point: PainPoint) => void
  onRemovePoint?: (index: number) => void
  readOnly?: boolean
}

function BodyView({ view, points, onAddPoint, onRemovePoint, readOnly }: BodyViewProps) {
  const viewPoints = points.filter((p) => p.view === view)
  const bodyPath = view === "anterior" ? ANTERIOR_BODY_PATH : POSTERIOR_BODY_PATH
  const detailPaths = view === "anterior" ? ANTERIOR_DETAILS : POSTERIOR_DETAILS
  const labels = view === "anterior" ? ANTERIOR_LABELS : POSTERIOR_LABELS

  const handleClick = (e: React.MouseEvent<SVGSVGElement>) => {
    if (readOnly || !onAddPoint) return

    const svg = e.currentTarget
    const rect = svg.getBoundingClientRect()
    const scaleX = BODY_SVG_WIDTH / rect.width
    const scaleY = BODY_SVG_HEIGHT / rect.height
    const x = Math.round((e.clientX - rect.left) * scaleX)
    const y = Math.round((e.clientY - rect.top) * scaleY)

    onAddPoint({ x, y, view })
  }

  const handlePointClick = (e: React.MouseEvent, globalIndex: number) => {
    e.stopPropagation()
    if (readOnly || !onRemovePoint) return
    onRemovePoint(globalIndex)
  }

  return (
    <div className="flex flex-col items-center gap-2">
      <p className="text-xs font-medium text-muted-foreground uppercase tracking-wide">
        {view === "anterior" ? "Vorderseite" : "Rückseite"}
      </p>
      <svg
        viewBox={`0 0 ${BODY_SVG_WIDTH} ${BODY_SVG_HEIGHT}`}
        width="100%"
        style={{ maxWidth: 180 }}
        className={`border rounded-lg bg-slate-50 dark:bg-slate-900/50 ${readOnly ? "cursor-default" : "cursor-crosshair"}`}
        onClick={handleClick}
        aria-label={`Körperschema ${view === "anterior" ? "Vorderseite" : "Rückseite"} — ${readOnly ? "Ansicht" : "Klicken zum Markieren"}`}
      >
        {/* Background body silhouette */}
        <path
          d={bodyPath}
          fill="#f0d5b8"
          stroke="#a08060"
          strokeWidth="1.2"
          fillRule="evenodd"
          strokeLinejoin="round"
        />

        {/* Anatomical detail lines */}
        {detailPaths.map((d, i) => (
          <path
            key={i}
            d={d}
            fill="none"
            stroke="#c4a882"
            strokeWidth="0.6"
            strokeLinecap="round"
            opacity="0.5"
          />
        ))}

        {/* Region labels (shown faintly for orientation) */}
        {labels.map((lbl, i) => (
          <text
            key={i}
            x={lbl.x}
            y={lbl.y}
            textAnchor="middle"
            fontSize="6"
            fill="#a08060"
            opacity="0.45"
            style={{ pointerEvents: "none", userSelect: "none" }}
          >
            {lbl.label}
          </text>
        ))}

        {/* Pain markers */}
        {viewPoints.map((point, i) => {
          let globalIdx = -1
          let count = 0
          for (let j = 0; j < points.length; j++) {
            if (points[j].view === view) {
              if (count === i) {
                globalIdx = j
                break
              }
              count++
            }
          }

          return (
            <g
              key={i}
              onClick={(e) => handlePointClick(e, globalIdx)}
              className={readOnly ? "" : "cursor-pointer"}
              role={readOnly ? undefined : "button"}
              aria-label={readOnly ? undefined : "Markierung entfernen"}
            >
              {/* Outer halo */}
              <circle
                cx={point.x}
                cy={point.y}
                r={10}
                fill="rgba(239, 68, 68, 0.15)"
              />
              {/* Main marker */}
              <circle
                cx={point.x}
                cy={point.y}
                r={6}
                fill="rgba(239, 68, 68, 0.85)"
                stroke="white"
                strokeWidth="1.5"
              />
            </g>
          )
        })}
      </svg>
      {!readOnly && (
        <p className="text-xs text-muted-foreground text-center">
          Klicken zum Markieren, erneut klicken zum Entfernen
        </p>
      )}
    </div>
  )
}

// ── Main BodySchema component ─────────────────────────────────────────────────

export function BodySchema({ value, onChange, readOnly = false }: BodySchemaProps) {
  const handleAddPoint = (point: PainPoint) => {
    if (!onChange) return
    onChange([...value, point])
  }

  const handleRemovePoint = (index: number) => {
    if (!onChange) return
    onChange(value.filter((_, i) => i !== index))
  }

  const handleClearAll = () => {
    if (!onChange) return
    onChange([])
  }

  return (
    <div className="space-y-3">
      <div className="grid grid-cols-2 gap-6">
        <BodyView
          view="anterior"
          points={value}
          onAddPoint={handleAddPoint}
          onRemovePoint={handleRemovePoint}
          readOnly={readOnly}
        />
        <BodyView
          view="posterior"
          points={value}
          onAddPoint={handleAddPoint}
          onRemovePoint={handleRemovePoint}
          readOnly={readOnly}
        />
      </div>

      {!readOnly && value.length > 0 && (
        <div className="flex items-center justify-between text-xs text-muted-foreground">
          <span>{value.length} {value.length === 1 ? "Markierung" : "Markierungen"}</span>
          <button
            type="button"
            onClick={handleClearAll}
            className="text-destructive hover:underline"
          >
            Alle entfernen
          </button>
        </div>
      )}

      {readOnly && value.length === 0 && (
        <p className="text-xs text-muted-foreground text-center">Keine Schmerzlokalisation markiert.</p>
      )}
    </div>
  )
}
