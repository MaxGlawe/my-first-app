"use client"

import { useEffect, useRef, useState } from "react"

interface AnimatedCounterProps {
  /** Zielwert */
  value: number
  /** Suffix (z.B. "%" oder " Tage") */
  suffix?: string
  /** Prefix (z.B. "+" oder "~") */
  prefix?: string
  /** Animationsdauer in ms */
  duration?: number
  /** Dezimalstellen */
  decimals?: number
  /** Zusätzliche CSS-Klassen */
  className?: string
}

export function AnimatedCounter({
  value,
  suffix = "",
  prefix = "",
  duration = 800,
  decimals = 0,
  className = "",
}: AnimatedCounterProps) {
  const [displayValue, setDisplayValue] = useState(0)
  const prevValue = useRef(0)
  const frameRef = useRef<number | null>(null)

  useEffect(() => {
    const startValue = prevValue.current
    const diff = value - startValue
    if (diff === 0) return

    const startTime = performance.now()

    function animate(currentTime: number) {
      const elapsed = currentTime - startTime
      const progress = Math.min(elapsed / duration, 1)

      // Ease-out cubic for snappy feel
      const eased = 1 - Math.pow(1 - progress, 3)
      const current = startValue + diff * eased

      setDisplayValue(current)

      if (progress < 1) {
        frameRef.current = requestAnimationFrame(animate)
      } else {
        prevValue.current = value
      }
    }

    frameRef.current = requestAnimationFrame(animate)

    return () => {
      if (frameRef.current) cancelAnimationFrame(frameRef.current)
    }
  }, [value, duration])

  const formatted =
    decimals > 0
      ? displayValue.toFixed(decimals)
      : Math.round(displayValue).toString()

  return (
    <span className={className}>
      {prefix}
      {formatted}
      {suffix}
    </span>
  )
}
