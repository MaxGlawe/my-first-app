"use client"

import { useState } from "react"
import type { PainPoint } from "@/types/anamnesis"

interface BodySchemaProps {
  value: PainPoint[]
  onChange?: (points: PainPoint[]) => void
  readOnly?: boolean
}

const BODY_SVG_WIDTH = 120
const BODY_SVG_HEIGHT = 300

// Simple anterior (front) body outline path
const ANTERIOR_BODY_PATH = `
  M 60 10
  C 60 10 70 10 74 16
  C 78 22 78 28 76 32
  C 74 36 70 38 60 38
  C 50 38 46 36 44 32
  C 42 28 42 22 46 16
  C 50 10 60 10 Z

  M 44 38
  C 36 40 28 46 26 56
  C 24 66 26 80 28 88
  L 16 130
  L 22 132
  L 34 94
  L 34 155
  L 30 220
  L 40 220
  L 46 170
  L 60 170
  L 74 170
  L 80 220
  L 90 220
  L 86 155
  L 86 94
  L 98 132
  L 104 130
  L 92 88
  C 94 80 96 66 94 56
  C 92 46 84 40 76 38
  C 72 40 66 42 60 42
  C 54 42 48 40 44 38 Z
`

// Simple posterior (back) body outline path (mirrored, same shape)
const POSTERIOR_BODY_PATH = ANTERIOR_BODY_PATH

interface BodyViewProps {
  view: "anterior" | "posterior"
  points: PainPoint[]
  onAddPoint?: (point: PainPoint) => void
  onRemovePoint?: (index: number) => void
  readOnly?: boolean
}

function BodyView({ view, points, onAddPoint, onRemovePoint, readOnly }: BodyViewProps) {
  const viewPoints = points.filter((p) => p.view === view)

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
        style={{ maxWidth: 140 }}
        className={`border rounded-md bg-muted/30 ${readOnly ? "cursor-default" : "cursor-crosshair"}`}
        onClick={handleClick}
        aria-label={`Körperschema ${view === "anterior" ? "Vorderseite" : "Rückseite"} — ${readOnly ? "Ansicht" : "Klicken zum Markieren"}`}
      >
        {/* Body silhouette */}
        <path
          d={view === "anterior" ? ANTERIOR_BODY_PATH : POSTERIOR_BODY_PATH}
          fill="#e2e8f0"
          stroke="#94a3b8"
          strokeWidth="1.5"
          fillRule="evenodd"
        />

        {/* Pain markers */}
        {viewPoints.map((point, i) => {
          // Find the global index for removal
          const globalIndex = points.findIndex(
            (p, idx) =>
              p.view === view &&
              points.filter((pp) => pp.view === view).indexOf(p) === i &&
              points.indexOf(p) === idx
          )
          // Simpler: track by iterating
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
              <circle
                cx={point.x}
                cy={point.y}
                r={5}
                fill="rgba(239, 68, 68, 0.85)"
                stroke="white"
                strokeWidth="1.5"
              />
              <circle
                cx={point.x}
                cy={point.y}
                r={8}
                fill="rgba(239, 68, 68, 0.2)"
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
