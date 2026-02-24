// Body region definitions for region auto-detection and labeling
// Each region has a bounding box (x1, y1, x2, y2) within the 200×400 viewBox
// Calibrated for the anatomy image (body-anatomy.png)

export interface BodyRegionDef {
  id: string
  label: string
  /** Bounding box [x1, y1, x2, y2] in SVG coords */
  bounds: [number, number, number, number]
  /** Center point for label placement */
  center: [number, number]
}

// ── ANTERIOR (Vorderseite) ──────────────────────────────────────────────────
export const ANTERIOR_REGIONS: BodyRegionDef[] = [
  // Kopf + Hals
  { id: "kopf", label: "Kopf", bounds: [80, 15, 120, 58], center: [100, 36] },
  { id: "hws", label: "HWS", bounds: [88, 56, 112, 70], center: [100, 63] },

  // Schultern
  { id: "schulter_rechts", label: "Schulter R", bounds: [48, 65, 74, 88], center: [61, 76] },
  { id: "schulter_links", label: "Schulter L", bounds: [126, 65, 152, 88], center: [139, 76] },

  // Arme
  { id: "oberarm_rechts", label: "Oberarm R", bounds: [28, 84, 56, 128], center: [42, 106] },
  { id: "oberarm_links", label: "Oberarm L", bounds: [144, 84, 172, 128], center: [158, 106] },
  { id: "ellbogen_rechts", label: "Ellbogen R", bounds: [20, 124, 46, 146], center: [33, 135] },
  { id: "ellbogen_links", label: "Ellbogen L", bounds: [154, 124, 180, 146], center: [167, 135] },
  { id: "unterarm_rechts", label: "Unterarm R", bounds: [10, 144, 36, 178], center: [23, 161] },
  { id: "unterarm_links", label: "Unterarm L", bounds: [164, 144, 190, 178], center: [177, 161] },
  { id: "hand_rechts", label: "Hand R", bounds: [2, 176, 22, 205], center: [12, 190] },
  { id: "hand_links", label: "Hand L", bounds: [178, 176, 198, 205], center: [188, 190] },

  // Rumpf
  { id: "thorax", label: "Thorax", bounds: [68, 70, 132, 118], center: [100, 94] },
  { id: "abdomen", label: "Abdomen", bounds: [72, 118, 128, 168], center: [100, 143] },

  // Hüfte
  { id: "hueftregion_rechts", label: "Hüfte R", bounds: [60, 164, 92, 200], center: [76, 182] },
  { id: "hueftregion_links", label: "Hüfte L", bounds: [108, 164, 140, 200], center: [124, 182] },

  // Beine
  { id: "oberschenkel_rechts", label: "Oberschenkel R", bounds: [56, 198, 96, 282], center: [76, 240] },
  { id: "oberschenkel_links", label: "Oberschenkel L", bounds: [104, 198, 144, 282], center: [124, 240] },
  { id: "knie_rechts", label: "Knie R", bounds: [52, 280, 94, 312], center: [73, 296] },
  { id: "knie_links", label: "Knie L", bounds: [106, 280, 148, 312], center: [127, 296] },
  { id: "unterschenkel_rechts", label: "Unterschenkel R", bounds: [48, 310, 92, 366], center: [70, 338] },
  { id: "unterschenkel_links", label: "Unterschenkel L", bounds: [108, 310, 152, 366], center: [130, 338] },
  { id: "fuss_rechts", label: "Fuß R", bounds: [40, 364, 80, 398], center: [60, 382] },
  { id: "fuss_links", label: "Fuß L", bounds: [120, 364, 160, 398], center: [140, 382] },
]

// ── POSTERIOR (Rückseite) ───────────────────────────────────────────────────
export const POSTERIOR_REGIONS: BodyRegionDef[] = [
  // Kopf + Hals
  { id: "kopf", label: "Kopf", bounds: [80, 15, 120, 58], center: [100, 36] },
  { id: "hws", label: "HWS", bounds: [88, 56, 112, 70], center: [100, 63] },

  // Schultern
  { id: "schulter_rechts", label: "Schulter R", bounds: [48, 65, 74, 88], center: [61, 76] },
  { id: "schulter_links", label: "Schulter L", bounds: [126, 65, 152, 88], center: [139, 76] },

  // Schulterblätter
  { id: "scapula_rechts", label: "Scapula R", bounds: [64, 74, 96, 106], center: [80, 90] },
  { id: "scapula_links", label: "Scapula L", bounds: [104, 74, 136, 106], center: [120, 90] },

  // Wirbelsäule
  { id: "bws", label: "BWS", bounds: [86, 78, 114, 122], center: [100, 100] },

  // Arme
  { id: "oberarm_rechts", label: "Oberarm R", bounds: [26, 84, 54, 128], center: [40, 106] },
  { id: "oberarm_links", label: "Oberarm L", bounds: [146, 84, 174, 128], center: [160, 106] },
  { id: "ellbogen_rechts", label: "Ellbogen R", bounds: [18, 124, 44, 146], center: [31, 135] },
  { id: "ellbogen_links", label: "Ellbogen L", bounds: [156, 124, 182, 146], center: [169, 135] },
  { id: "unterarm_rechts", label: "Unterarm R", bounds: [8, 144, 34, 178], center: [21, 161] },
  { id: "unterarm_links", label: "Unterarm L", bounds: [166, 144, 192, 178], center: [179, 161] },
  { id: "hand_rechts", label: "Hand R", bounds: [0, 176, 20, 205], center: [10, 190] },
  { id: "hand_links", label: "Hand L", bounds: [180, 176, 200, 205], center: [190, 190] },

  // LWS + Gesäß
  { id: "lws", label: "LWS", bounds: [82, 120, 118, 168], center: [100, 144] },
  { id: "gesaess_rechts", label: "Gesäß R", bounds: [62, 166, 100, 202], center: [81, 184] },
  { id: "gesaess_links", label: "Gesäß L", bounds: [100, 166, 138, 202], center: [119, 184] },

  // Beine
  { id: "oberschenkel_rechts", label: "Oberschenkel R", bounds: [58, 200, 100, 282], center: [79, 241] },
  { id: "oberschenkel_links", label: "Oberschenkel L", bounds: [100, 200, 142, 282], center: [121, 241] },
  { id: "kniekehle_rechts", label: "Kniekehle R", bounds: [56, 280, 98, 312], center: [77, 296] },
  { id: "kniekehle_links", label: "Kniekehle L", bounds: [102, 280, 144, 312], center: [123, 296] },
  { id: "wade_rechts", label: "Wade R", bounds: [54, 310, 96, 362], center: [75, 336] },
  { id: "wade_links", label: "Wade L", bounds: [104, 310, 146, 362], center: [125, 336] },
  { id: "achillessehne_rechts", label: "Achillessehne R", bounds: [50, 360, 88, 398], center: [69, 380] },
  { id: "achillessehne_links", label: "Achillessehne L", bounds: [112, 360, 150, 398], center: [131, 380] },
]

/** Detect which region a point falls into */
export function detectRegion(
  x: number,
  y: number,
  view: "anterior" | "posterior"
): string | undefined {
  const regions = view === "anterior" ? ANTERIOR_REGIONS : POSTERIOR_REGIONS
  for (const region of regions) {
    const [x1, y1, x2, y2] = region.bounds
    if (x >= x1 && x <= x2 && y >= y1 && y <= y2) {
      return region.id
    }
  }
  return undefined
}
