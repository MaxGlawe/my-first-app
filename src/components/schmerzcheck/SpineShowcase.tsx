"use client"

import Image from "next/image"
import { useRef, useState } from "react"

/**
 * PROJ-23: Premium spine showcase for the "Nach diesem Check…" panel.
 * Real lateral spine image with: pulsing emerald glow, gentle float, an
 * "analysis" scan beam sweeping down, and mouse-reactive 3D tilt.
 * Respects prefers-reduced-motion (animations disabled via globals.css).
 */
export function SpineShowcase() {
  const ref = useRef<HTMLDivElement>(null)
  const [tilt, setTilt] = useState({ rx: 0, ry: 0 })

  function onMove(e: React.MouseEvent) {
    const el = ref.current
    if (!el) return
    const r = el.getBoundingClientRect()
    const px = (e.clientX - r.left) / r.width - 0.5 // -0.5..0.5
    const py = (e.clientY - r.top) / r.height - 0.5
    setTilt({ rx: -py * 9, ry: px * 11 })
  }
  function reset() {
    setTilt({ rx: 0, ry: 0 })
  }

  return (
    <div
      ref={ref}
      onMouseMove={onMove}
      onMouseLeave={reset}
      className="relative flex h-[380px] items-center justify-center overflow-hidden [perspective:1200px] sm:h-[520px]"
    >
      {/* pulsing emerald glow behind the spine */}
      <div
        aria-hidden
        className="sc-glow-pulse pointer-events-none absolute left-1/2 top-1/2 h-[72%] w-[58%] -translate-x-1/2 -translate-y-1/2 rounded-full bg-emerald-400/30 blur-[64px]"
      />

      {/* spine — floats, tilts with the mouse */}
      <div className="sc-spine-float relative z-10 flex h-full items-center justify-center">
        <div
          style={{ transform: `rotateX(${tilt.rx}deg) rotateY(${tilt.ry}deg)` }}
          className="flex h-full items-center justify-center transition-transform duration-300 ease-out [transform-style:preserve-3d]"
        >
          <Image
            src="/images/spine-cut.png"
            alt="Wirbelsäule, seitliche Ansicht"
            width={1024}
            height={1536}
            priority={false}
            className="object-contain drop-shadow-[0_26px_55px_rgba(15,23,42,0.22)]"
            style={{ height: "92%", width: "auto" }}
          />
        </div>
      </div>

      {/* analysis scan beam sweeping top → bottom */}
      <div
        aria-hidden
        className="sc-scan pointer-events-none inset-x-0 z-20 h-24 bg-gradient-to-b from-transparent via-emerald-400/35 to-transparent blur-md"
      />

      {/* caption */}
      <div className="absolute bottom-4 left-0 right-0 z-30 text-center">
        <span className="[font-family:var(--font-cormorant)] text-[15px] italic text-slate-500">
          deine Bewegungs-Standortbestimmung
        </span>
      </div>
    </div>
  )
}
