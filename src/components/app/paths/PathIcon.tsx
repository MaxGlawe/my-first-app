"use client"

import { Activity, BookHeart, Compass, Droplets, Layers } from "lucide-react"

const ICON_MAP: Record<string, React.ComponentType<{ className?: string }>> = {
  Droplets,
  Activity,
  BookHeart,
  Layers,
  Compass,
}

/**
 * Renders a lucide icon by name. Used by path cards to display the per-path icon
 * stored as a string in the DB. Falls back to Compass if the icon name isn't known.
 */
export function PathIcon({
  name,
  className,
}: {
  name: string | null
  className?: string
}) {
  const Icon = (name && ICON_MAP[name]) || Compass
  return <Icon className={className} />
}
