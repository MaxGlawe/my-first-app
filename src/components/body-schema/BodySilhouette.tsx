"use client"

import { useState, useCallback } from "react"
import {
  ANTERIOR_REGIONS,
  POSTERIOR_REGIONS,
  type BodyRegionDef,
} from "./body-regions"
import { BodyMarker } from "./BodyMarker"
import type { PainPointV2 } from "./types"

const SVG_W = 200
const SVG_H = 400

/** Anatomy image: both views side-by-side in one PNG */
const ANATOMY_IMAGE = "/images/body-anatomy.png"

/**
 * Positioning config for the anatomy image inside the SVG viewBox.
 * The image contains anterior (left) + posterior (right) in one file.
 * We shift the <image> x position to show the correct half,
 * and the SVG viewBox naturally clips to 200×400.
 */
const IMG_CFG = {
  /** Total width of the image in SVG units (covers both figures) */
  width: 420,
  /** Height in SVG units */
  height: 390,
  /** Vertical offset to center the figure */
  yOffset: 10,
  /** X offset for anterior view (show left figure) */
  anteriorX: 8,
  /** X offset for posterior view (shift right figure into view) */
  posteriorX: -205,
}

interface BodySilhouetteProps {
  view: "anterior" | "posterior"
  points: PainPointV2[]
  allPoints: PainPointV2[]
  onAddPoint?: (point: PainPointV2) => void
  onRemovePoint?: (globalIndex: number) => void
  readOnly?: boolean
  activeMarkerType: PainPointV2["type"]
}

export function BodySilhouette({
  view,
  points,
  allPoints,
  onAddPoint,
  onRemovePoint,
  readOnly,
  activeMarkerType,
}: BodySilhouetteProps) {
  const [hoveredRegion, setHoveredRegion] = useState<string | null>(null)

  const regions = view === "anterior" ? ANTERIOR_REGIONS : POSTERIOR_REGIONS

  const handleClick = useCallback(
    (e: React.MouseEvent<SVGSVGElement>) => {
      if (readOnly || !onAddPoint) return
      const svg = e.currentTarget
      const rect = svg.getBoundingClientRect()
      const scaleX = SVG_W / rect.width
      const scaleY = SVG_H / rect.height
      const x = Math.round((e.clientX - rect.left) * scaleX)
      const y = Math.round((e.clientY - rect.top) * scaleY)

      let region: string | undefined
      for (const r of regions) {
        const [x1, y1, x2, y2] = r.bounds
        if (x >= x1 && x <= x2 && y >= y1 && y <= y2) {
          region = r.id
          break
        }
      }

      onAddPoint({ x, y, view, type: activeMarkerType, region })
    },
    [readOnly, onAddPoint, view, activeMarkerType, regions]
  )

  const handlePointClick = useCallback(
    (e: React.MouseEvent, globalIndex: number) => {
      e.stopPropagation()
      if (readOnly || !onRemovePoint) return
      onRemovePoint(globalIndex)
    },
    [readOnly, onRemovePoint]
  )

  const handleRegionHover = useCallback(
    (region: BodyRegionDef | null) => {
      if (readOnly) return
      setHoveredRegion(region?.id ?? null)
    },
    [readOnly]
  )

  const imgX = view === "anterior" ? IMG_CFG.anteriorX : IMG_CFG.posteriorX

  return (
    <div className="flex flex-col items-center gap-2">
      <p className="text-xs font-semibold text-slate-500 uppercase tracking-wider">
        {view === "anterior" ? "Vorderseite" : "Rückseite"}
      </p>
      <svg
        viewBox={`0 0 ${SVG_W} ${SVG_H}`}
        width="100%"
        style={{ maxWidth: 320 }}
        className={`rounded-2xl transition-shadow ${
          readOnly
            ? "cursor-default"
            : "cursor-crosshair hover:shadow-lg"
        }`}
        onClick={handleClick}
        aria-label={`Körperschema ${
          view === "anterior" ? "Vorderseite" : "Rückseite"
        } — ${readOnly ? "Ansicht" : "Klicken zum Markieren"}`}
      >
        {/* Background */}
        <rect
          x="0" y="0"
          width={SVG_W} height={SVG_H}
          rx="12"
          fill="#f5f2ee"
        />

        {/* Anatomy image — positioned to show correct half */}
        <image
          href={ANATOMY_IMAGE}
          x={imgX}
          y={IMG_CFG.yOffset}
          width={IMG_CFG.width}
          height={IMG_CFG.height}
          preserveAspectRatio="xMidYMid meet"
          style={{ pointerEvents: "none" }}
        />

        {/* Interactive region overlays (edit mode only) */}
        {!readOnly &&
          regions.map((region) => {
            const [x1, y1, x2, y2] = region.bounds
            const isHovered = hoveredRegion === region.id
            return (
              <g key={region.id}>
                <rect
                  x={x1}
                  y={y1}
                  width={x2 - x1}
                  height={y2 - y1}
                  rx="4"
                  fill={isHovered ? "rgba(16, 185, 129, 0.12)" : "transparent"}
                  stroke={isHovered ? "rgba(16, 185, 129, 0.4)" : "transparent"}
                  strokeWidth="0.8"
                  strokeDasharray={isHovered ? "none" : "2 2"}
                  style={{ transition: "all 0.15s ease" }}
                  onMouseEnter={() => handleRegionHover(region)}
                  onMouseLeave={() => handleRegionHover(null)}
                />
                {isHovered && (
                  <text
                    x={region.center[0]}
                    y={region.center[1]}
                    textAnchor="middle"
                    dominantBaseline="middle"
                    fontSize="7"
                    fontWeight="600"
                    fill="#059669"
                    opacity="0.8"
                    style={{ pointerEvents: "none", userSelect: "none" }}
                  >
                    {region.label}
                  </text>
                )}
              </g>
            )
          })}

        {/* Region labels (faint, readOnly mode) */}
        {readOnly &&
          regions
            .filter((_, i) => i % 3 === 0)
            .map((region) => (
              <text
                key={region.id}
                x={region.center[0]}
                y={region.center[1]}
                textAnchor="middle"
                dominantBaseline="middle"
                fontSize="5.5"
                fill="#94867a"
                opacity="0.35"
                style={{ pointerEvents: "none", userSelect: "none" }}
              >
                {region.label}
              </text>
            ))}

        {/* Pain markers */}
        {points.map((point, localIdx) => {
          let globalIdx = -1
          let count = 0
          for (let j = 0; j < allPoints.length; j++) {
            if (allPoints[j].view === view) {
              if (count === localIdx) {
                globalIdx = j
                break
              }
              count++
            }
          }

          return (
            <BodyMarker
              key={localIdx}
              x={point.x}
              y={point.y}
              type={point.type ?? "schmerz"}
              onClick={(e) => handlePointClick(e, globalIdx)}
              readOnly={readOnly}
            />
          )
        })}
      </svg>

      {!readOnly && (
        <p className="text-[11px] text-slate-400 text-center">
          Klicken zum Markieren
        </p>
      )}
    </div>
  )
}
