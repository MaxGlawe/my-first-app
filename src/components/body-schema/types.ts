export interface AnatomyPath {
  id: string
  d: string
  type?: "long-bone" | "flat-bone" | "irregular" | "vertebra"
}

export interface JointDef {
  id: string
  cx: number
  cy: number
  r?: number
}

export type MarkerType = "schmerz" | "taubheit" | "ausstrahlung" | "schwellung"

export interface PainPointV2 {
  x: number
  y: number
  view: "anterior" | "posterior"
  type?: MarkerType
  region?: string
}

export const MARKER_CONFIG: Record<
  MarkerType,
  { label: string; color: string; halo: string; icon: string }
> = {
  schmerz: {
    label: "Schmerz",
    color: "#ef4444",
    halo: "rgba(239, 68, 68, 0.15)",
    icon: "⚡",
  },
  taubheit: {
    label: "Taubheit",
    color: "#3b82f6",
    halo: "rgba(59, 130, 246, 0.15)",
    icon: "◆",
  },
  ausstrahlung: {
    label: "Ausstrahlung",
    color: "#f97316",
    halo: "rgba(249, 115, 22, 0.15)",
    icon: "↗",
  },
  schwellung: {
    label: "Schwellung",
    color: "#a855f7",
    halo: "rgba(168, 85, 247, 0.15)",
    icon: "●",
  },
}
