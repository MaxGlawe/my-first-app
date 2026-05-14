"use client"

import confetti from "canvas-confetti"

/**
 * Big-celebration confetti — for moments like reaching the daily hydration goal.
 * Multiple overlapping bursts + a top-down shower for ~3s total.
 */
export function celebrationConfetti() {
  if (typeof window === "undefined") return

  // Cyan/teal/emerald palette to match the water theme + warm pops
  const colors = [
    "#06b6d4",
    "#22d3ee",
    "#0ea5e9",
    "#10b981",
    "#34d399",
    "#fbbf24",
    "#f472b6",
    "#a78bfa",
  ]

  // Burst 1 — left bottom corner
  confetti({
    particleCount: 80,
    angle: 60,
    spread: 70,
    origin: { x: 0, y: 0.85 },
    colors,
    scalar: 1.1,
    ticks: 250,
  })

  // Burst 2 — right bottom corner
  confetti({
    particleCount: 80,
    angle: 120,
    spread: 70,
    origin: { x: 1, y: 0.85 },
    colors,
    scalar: 1.1,
    ticks: 250,
  })

  // Center fountain after 150ms
  setTimeout(() => {
    confetti({
      particleCount: 120,
      spread: 100,
      startVelocity: 45,
      origin: { x: 0.5, y: 0.7 },
      colors,
      scalar: 1.2,
      ticks: 300,
    })
  }, 150)

  // Second wave from both sides
  setTimeout(() => {
    confetti({
      particleCount: 100,
      angle: 60,
      spread: 90,
      origin: { x: 0, y: 0.7 },
      colors,
      scalar: 1.3,
      ticks: 300,
    })
    confetti({
      particleCount: 100,
      angle: 120,
      spread: 90,
      origin: { x: 1, y: 0.7 },
      colors,
      scalar: 1.3,
      ticks: 300,
    })
  }, 600)

  // Final shower from the top
  setTimeout(() => {
    const end = Date.now() + 1500
    const frame = () => {
      confetti({
        particleCount: 4,
        angle: 90,
        spread: 180,
        startVelocity: 25,
        gravity: 0.6,
        origin: { x: Math.random(), y: -0.1 },
        colors,
        scalar: 1.0,
        ticks: 400,
      })
      if (Date.now() < end) requestAnimationFrame(frame)
    }
    frame()
  }, 1000)
}
