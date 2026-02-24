/**
 * Premium Design-Tokens für die Patient-App
 * Inspiriert von der Landingpage-Ästhetik (Emerald/Teal Gradients, Glassmorphismus)
 */

// ── Gradient Presets ──────────────────────────────────────────────────────
export const GRADIENTS = {
  /** Hero-Header: dunkler Slate → Emerald */
  heroHeader: "bg-gradient-to-br from-slate-900 via-slate-800 to-emerald-950",
  /** Primary Action: Emerald → Teal */
  primary: "bg-gradient-to-r from-emerald-500 to-teal-500",
  primaryHover: "hover:from-emerald-400 hover:to-teal-400",
  /** Accent: Teal → Cyan */
  accent: "bg-gradient-to-r from-teal-500 to-cyan-500",
  /** Success: Emerald hell */
  success: "bg-gradient-to-br from-emerald-50 to-teal-50",
  /** Warm: für Streak/Flame */
  warm: "bg-gradient-to-br from-orange-500 to-amber-500",
  /** Gradient Text (für Headlines) */
  text: "bg-gradient-to-r from-emerald-400 via-teal-400 to-cyan-400 bg-clip-text text-transparent",
  textDark: "bg-gradient-to-r from-emerald-600 via-teal-600 to-cyan-600 bg-clip-text text-transparent",
} as const

// ── Glass Card Klassen ────────────────────────────────────────────────────
export const GLASS = {
  /** Standard Glassmorphismus auf hellem Hintergrund */
  card: "bg-white/80 backdrop-blur-sm border border-white/60 shadow-sm",
  /** Stärker: für hervorgehobene Karten */
  cardStrong: "bg-white/90 backdrop-blur-md border border-white/70 shadow-md",
  /** Auf dunklem Hintergrund */
  dark: "bg-white/8 backdrop-blur-xl border border-white/10",
  /** Hover-Effekt für Karten */
  hover: "hover:shadow-lg hover:-translate-y-0.5 transition-all duration-300",
} as const

// ── Shared Card Styles ────────────────────────────────────────────────────
export const CARD_STYLES = {
  /** Standard-Karte */
  base: "rounded-2xl p-4 sm:p-5",
  /** Stat-Karte (kompakt) */
  stat: "rounded-xl p-3 sm:p-4 text-center",
  /** Action-Karte (klickbar) */
  action: "rounded-2xl p-4 sm:p-5 cursor-pointer group",
  /** Feature-Karte (größer) */
  feature: "rounded-2xl p-5 sm:p-6",
} as const

// ── Animation Utilities ───────────────────────────────────────────────────
export const ANIM = {
  /** Fade-in-up (nutzt globals.css Klasse) */
  fadeInUp: "animate-fade-in-up",
  /** Stagger-Delays für Listen */
  delay: (index: number) => {
    const delays = [
      "",
      "animation-delay-150",
      "animation-delay-300",
      "animation-delay-450",
      "animation-delay-600",
    ]
    return delays[Math.min(index, delays.length - 1)]
  },
  /** Glow-Pulse (z.B. für aktive CTA) */
  glowPulse: "animate-glow-pulse",
  /** Float (für dekorative Elemente) */
  float: "animate-float",
} as const

// ── Farb-Konstanten ───────────────────────────────────────────────────────
export const COLORS = {
  emerald: {
    glow: "shadow-emerald-500/20",
    glowStrong: "shadow-emerald-500/30",
    text: "text-emerald-600",
    textLight: "text-emerald-400",
    bg: "bg-emerald-50",
    bgDark: "bg-emerald-500",
    border: "border-emerald-200",
  },
  teal: {
    glow: "shadow-teal-500/20",
    text: "text-teal-600",
    textLight: "text-teal-400",
    bg: "bg-teal-50",
    border: "border-teal-200",
  },
  slate: {
    text: "text-slate-700",
    textMuted: "text-slate-500",
    textSubtle: "text-slate-400",
    bg: "bg-slate-50",
    border: "border-slate-200/60",
  },
} as const

// ── Premium Button Presets ────────────────────────────────────────────────
export const BUTTONS = {
  /** Primärer CTA-Button (gradient) */
  primary: [
    "inline-flex items-center justify-center gap-2",
    "bg-gradient-to-r from-emerald-500 to-teal-500",
    "hover:from-emerald-400 hover:to-teal-400",
    "text-white font-semibold",
    "px-6 py-3 rounded-full",
    "shadow-lg shadow-emerald-500/20",
    "hover:shadow-xl hover:shadow-emerald-500/30",
    "hover:-translate-y-0.5",
    "transition-all duration-300",
    "active:scale-[0.98]",
  ].join(" "),
  /** Sekundärer Button (outline) */
  secondary: [
    "inline-flex items-center justify-center gap-2",
    "bg-white/80 backdrop-blur-sm",
    "border border-slate-200/60",
    "text-slate-700 font-medium",
    "px-5 py-2.5 rounded-full",
    "shadow-sm",
    "hover:shadow-md hover:border-emerald-200 hover:text-emerald-700",
    "hover:-translate-y-0.5",
    "transition-all duration-300",
  ].join(" "),
} as const

// ── Helper: Combine classNames ────────────────────────────────────────────
export function cx(...classes: (string | false | null | undefined)[]) {
  return classes.filter(Boolean).join(" ")
}
