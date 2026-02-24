import type { JointDef } from "./types"

// ── ANTERIOR JOINTS ─────────────────────────────────────────────────────────
export const ANTERIOR_JOINTS: JointDef[] = [
  // Shoulders
  { id: "shoulder-l", cx: 62, cy: 78, r: 3 },
  { id: "shoulder-r", cx: 138, cy: 78, r: 3 },
  // Elbows
  { id: "elbow-l", cx: 42, cy: 122, r: 2.5 },
  { id: "elbow-r", cx: 158, cy: 122, r: 2.5 },
  // Wrists
  { id: "wrist-l", cx: 24, cy: 170, r: 2 },
  { id: "wrist-r", cx: 176, cy: 170, r: 2 },
  // Hips
  { id: "hip-l", cx: 78, cy: 172, r: 3 },
  { id: "hip-r", cx: 122, cy: 172, r: 3 },
  // Knees
  { id: "knee-l", cx: 78, cy: 294, r: 3 },
  { id: "knee-r", cx: 122, cy: 294, r: 3 },
  // Ankles
  { id: "ankle-l", cx: 62, cy: 374, r: 2 },
  { id: "ankle-r", cx: 138, cy: 374, r: 2 },
]

// ── POSTERIOR JOINTS ────────────────────────────────────────────────────────
export const POSTERIOR_JOINTS: JointDef[] = [
  // Shoulders
  { id: "shoulder-post-l", cx: 60, cy: 80, r: 3 },
  { id: "shoulder-post-r", cx: 140, cy: 80, r: 3 },
  // Elbows
  { id: "elbow-post-l", cx: 40, cy: 124, r: 2.5 },
  { id: "elbow-post-r", cx: 160, cy: 124, r: 2.5 },
  // Wrists
  { id: "wrist-post-l", cx: 22, cy: 172, r: 2 },
  { id: "wrist-post-r", cx: 178, cy: 172, r: 2 },
  // Hips
  { id: "hip-post-l", cx: 80, cy: 176, r: 3 },
  { id: "hip-post-r", cx: 120, cy: 176, r: 3 },
  // Knees
  { id: "knee-post-l", cx: 78, cy: 296, r: 3 },
  { id: "knee-post-r", cx: 122, cy: 296, r: 3 },
  // Ankles
  { id: "ankle-post-l", cx: 72, cy: 372, r: 2 },
  { id: "ankle-post-r", cx: 128, cy: 372, r: 2 },
]
