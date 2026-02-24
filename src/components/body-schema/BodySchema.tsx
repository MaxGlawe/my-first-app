"use client"

import { useState, useMemo } from "react"
import type { PainPoint } from "@/types/anamnesis"
import { BodySilhouette } from "./BodySilhouette"
import { MARKER_CONFIG, type MarkerType, type PainPointV2 } from "./types"
import { detectRegion } from "./body-regions"

interface BodySchemaProps {
  value: PainPoint[]
  onChange?: (points: PainPoint[]) => void
  readOnly?: boolean
}

const MARKER_TYPES: MarkerType[] = ["schmerz", "taubheit", "ausstrahlung", "schwellung"]

export function BodySchema({ value, onChange, readOnly = false }: BodySchemaProps) {
  const [activeType, setActiveType] = useState<MarkerType>("schmerz")

  // Convert legacy PainPoint[] to PainPointV2[] (backward compat)
  const points = useMemo(
    () =>
      value.map((p) => ({
        ...p,
        type: (p as PainPointV2).type ?? ("schmerz" as MarkerType),
        region: (p as PainPointV2).region,
      })),
    [value]
  )

  const anteriorPoints = useMemo(() => points.filter((p) => p.view === "anterior"), [points])
  const posteriorPoints = useMemo(() => points.filter((p) => p.view === "posterior"), [points])

  const handleAddPoint = (point: PainPointV2) => {
    if (!onChange) return
    // Auto-detect region if not set
    const region = point.region ?? detectRegion(point.x, point.y, point.view)
    const newPoint: PainPoint & PainPointV2 = { ...point, region }
    onChange([...value, newPoint as PainPoint])
  }

  const handleRemovePoint = (index: number) => {
    if (!onChange) return
    onChange(value.filter((_, i) => i !== index))
  }

  const handleClearAll = () => {
    if (!onChange) return
    onChange([])
  }

  // Count markers by type
  const typeCounts = useMemo(() => {
    const counts: Record<string, number> = {}
    for (const p of points) {
      const t = p.type ?? "schmerz"
      counts[t] = (counts[t] ?? 0) + 1
    }
    return counts
  }, [points])

  return (
    <div className="space-y-4">
      {/* Marker type toolbar */}
      {!readOnly && (
        <div className="flex flex-wrap items-center gap-2">
          <span className="text-xs font-medium text-slate-500 mr-1">Marker:</span>
          {MARKER_TYPES.map((type) => {
            const config = MARKER_CONFIG[type]
            const isActive = activeType === type
            return (
              <button
                key={type}
                type="button"
                onClick={() => setActiveType(type)}
                className={`
                  inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-medium
                  transition-all duration-150 border
                  ${
                    isActive
                      ? "border-slate-300 bg-white shadow-sm scale-105"
                      : "border-transparent bg-slate-100/80 hover:bg-slate-200/80"
                  }
                `}
              >
                <span
                  className="h-3 w-3 rounded-full shrink-0"
                  style={{ backgroundColor: config.color }}
                />
                {config.label}
              </button>
            )
          })}
        </div>
      )}

      {/* Legend (read-only mode) */}
      {readOnly && value.length > 0 && (
        <div className="flex flex-wrap items-center gap-3">
          {MARKER_TYPES.filter((t) => (typeCounts[t] ?? 0) > 0).map((type) => {
            const config = MARKER_CONFIG[type]
            return (
              <div key={type} className="inline-flex items-center gap-1.5 text-xs text-slate-500">
                <span
                  className="h-2.5 w-2.5 rounded-full shrink-0"
                  style={{ backgroundColor: config.color }}
                />
                {config.label} ({typeCounts[type]})
              </div>
            )
          })}
        </div>
      )}

      {/* Body diagrams */}
      <div className="grid grid-cols-2 gap-4 sm:gap-6">
        <BodySilhouette
          view="anterior"
          points={anteriorPoints}
          allPoints={points}
          onAddPoint={handleAddPoint}
          onRemovePoint={handleRemovePoint}
          readOnly={readOnly}
          activeMarkerType={activeType}
        />
        <BodySilhouette
          view="posterior"
          points={posteriorPoints}
          allPoints={points}
          onAddPoint={handleAddPoint}
          onRemovePoint={handleRemovePoint}
          readOnly={readOnly}
          activeMarkerType={activeType}
        />
      </div>

      {/* Footer info bar */}
      {!readOnly && value.length > 0 && (
        <div className="flex items-center justify-between text-xs">
          <span className="text-slate-500">
            {value.length} {value.length === 1 ? "Markierung" : "Markierungen"}
          </span>
          <button
            type="button"
            onClick={handleClearAll}
            className="text-red-500 hover:text-red-600 hover:underline font-medium transition-colors"
          >
            Alle entfernen
          </button>
        </div>
      )}

      {readOnly && value.length === 0 && (
        <p className="text-xs text-slate-400 text-center py-2">
          Keine Schmerzlokalisation markiert.
        </p>
      )}
    </div>
  )
}
