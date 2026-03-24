"use client"

import { useEffect, useRef, useState } from "react"
import { useScrollReveal } from "@/hooks/use-scroll-reveal"

interface AnimatedCounterProps {
  value: string
  className?: string
}

export function AnimatedCounter({ value, className }: AnimatedCounterProps) {
  const { ref, isRevealed } = useScrollReveal(0.3)
  const [display, setDisplay] = useState("0")
  const animatedRef = useRef(false)

  useEffect(() => {
    if (!isRevealed || animatedRef.current) return
    animatedRef.current = true

    // Parse the numeric part
    const match = value.match(/^([<>]?)(\d+(?:\.\d+)?)(.*)$/)
    if (!match) {
      setDisplay(value)
      return
    }

    const prefix = match[1]
    const target = parseFloat(match[2])
    const suffix = match[3]
    const hasDecimal = match[2].includes(".")
    const duration = 1800
    const startTime = performance.now()

    function animate(currentTime: number) {
      const elapsed = currentTime - startTime
      const progress = Math.min(elapsed / duration, 1)
      // Ease out cubic
      const eased = 1 - Math.pow(1 - progress, 3)
      const current = target * eased

      if (hasDecimal) {
        setDisplay(`${prefix}${current.toFixed(1)}${suffix}`)
      } else {
        setDisplay(`${prefix}${Math.round(current)}${suffix}`)
      }

      if (progress < 1) {
        requestAnimationFrame(animate)
      }
    }

    requestAnimationFrame(animate)
  }, [isRevealed, value])

  return (
    <span ref={ref} className={className}>
      {display}
    </span>
  )
}
