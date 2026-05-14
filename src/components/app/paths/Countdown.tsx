"use client"

import { useState, useEffect, useRef } from "react"

/**
 * Live HH:MM:SS countdown to a target timestamp. Ticks every second.
 * Calls onComplete once when it reaches zero.
 */
export function Countdown({
  targetIso,
  onComplete,
}: {
  targetIso: string
  onComplete?: () => void
}) {
  const [remaining, setRemaining] = useState(() =>
    Math.max(0, new Date(targetIso).getTime() - Date.now())
  )
  const firedRef = useRef(false)

  useEffect(() => {
    firedRef.current = false
    const target = new Date(targetIso).getTime()
    const tick = () => {
      const r = Math.max(0, target - Date.now())
      setRemaining(r)
      if (r === 0 && !firedRef.current) {
        firedRef.current = true
        onComplete?.()
      }
    }
    tick()
    const id = setInterval(tick, 1000)
    return () => clearInterval(id)
  }, [targetIso, onComplete])

  if (remaining === 0) {
    return <span className="tabular-nums">Jetzt verfügbar</span>
  }

  const totalSec = Math.floor(remaining / 1000)
  const h = Math.floor(totalSec / 3600)
  const m = Math.floor((totalSec % 3600) / 60)
  const s = totalSec % 60
  const pad = (n: number) => String(n).padStart(2, "0")

  return (
    <span className="tabular-nums">
      {pad(h)}:{pad(m)}:{pad(s)}
    </span>
  )
}
