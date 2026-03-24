/**
 * Ampel-style colored dot indicating status health
 * red = ≥ 20% inactive or low participation
 * yellow = 10–20% issues
 * green = healthy
 */

interface AmpelDotProps {
  teilnahmequote: number // 0-100
  size?: "sm" | "md"
}

export function AmpelDot({ teilnahmequote, size = "md" }: AmpelDotProps) {
  let color: string
  let label: string

  if (teilnahmequote >= 70) {
    color = "bg-emerald-500"
    label = "Gut"
  } else if (teilnahmequote >= 40) {
    color = "bg-amber-400"
    label = "Mittel"
  } else {
    color = "bg-red-500"
    label = "Kritisch"
  }

  const sizeClass = size === "sm" ? "h-2.5 w-2.5" : "h-3.5 w-3.5"

  return (
    <span
      className={`inline-block rounded-full ${color} ${sizeClass} flex-shrink-0`}
      title={label}
      aria-label={label}
    />
  )
}
