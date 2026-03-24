"use client"

import { useEffect, useRef, useState, useCallback } from "react"

export function SpineCursor() {
  const cursorRef = useRef<HTMLDivElement>(null)
  const posRef = useRef({ x: -100, y: -100 })
  const targetRef = useRef({ x: -100, y: -100 })
  const rafRef = useRef<number>(0)
  const [isHovering, setIsHovering] = useState(false)
  const [isClicking, setIsClicking] = useState(false)
  const [isTouch, setIsTouch] = useState(false)

  const animate = useCallback(() => {
    const lerp = 0.15
    posRef.current.x += (targetRef.current.x - posRef.current.x) * lerp
    posRef.current.y += (targetRef.current.y - posRef.current.y) * lerp

    if (cursorRef.current) {
      cursorRef.current.style.transform = `translate(${posRef.current.x}px, ${posRef.current.y}px)`
    }

    rafRef.current = requestAnimationFrame(animate)
  }, [])

  useEffect(() => {
    // Detect touch device
    if ("ontouchstart" in window || navigator.maxTouchPoints > 0) {
      setIsTouch(true)
      return
    }

    const onMove = (e: MouseEvent) => {
      targetRef.current.x = e.clientX
      targetRef.current.y = e.clientY
    }

    const onDown = () => setIsClicking(true)
    const onUp = () => setIsClicking(false)

    const interactiveSelector = 'a, button, [role="button"], input, textarea, select, label, [data-cursor="pointer"]'

    const onOver = (e: MouseEvent) => {
      const target = e.target as HTMLElement
      if (target.closest(interactiveSelector)) {
        setIsHovering(true)
      }
    }

    const onOut = (e: MouseEvent) => {
      const target = e.target as HTMLElement
      if (target.closest(interactiveSelector)) {
        setIsHovering(false)
      }
    }

    document.addEventListener("mousemove", onMove, { passive: true })
    document.addEventListener("mousedown", onDown)
    document.addEventListener("mouseup", onUp)
    document.addEventListener("mouseover", onOver, { passive: true })
    document.addEventListener("mouseout", onOut, { passive: true })

    rafRef.current = requestAnimationFrame(animate)

    return () => {
      document.removeEventListener("mousemove", onMove)
      document.removeEventListener("mousedown", onDown)
      document.removeEventListener("mouseup", onUp)
      document.removeEventListener("mouseover", onOver)
      document.removeEventListener("mouseout", onOut)
      cancelAnimationFrame(rafRef.current)
    }
  }, [animate])

  if (isTouch) return null

  return (
    <>
      {/* Hide default cursor on landing pages */}
      <style>{`
        body, body * {
          cursor: none !important;
        }
      `}</style>

      <div
        ref={cursorRef}
        className="pointer-events-none fixed top-0 left-0 z-[9999]"
        style={{ willChange: "transform" }}
      >
        {/* Outer glow ring — visible on hover */}
        <div
          className={`absolute transition-all duration-300 ease-out rounded-full ${
            isHovering
              ? "w-12 h-12 -left-6 -top-6 opacity-100 bg-landing-accent/10 border border-landing-accent/20"
              : "w-0 h-0 left-0 top-0 opacity-0"
          }`}
        />

        {/* Spine SVG cursor */}
        <svg
          width="28"
          height="40"
          viewBox="0 0 28 40"
          fill="none"
          xmlns="http://www.w3.org/2000/svg"
          className={`transition-transform duration-200 ease-out ${
            isHovering ? "scale-75" : ""
          } ${isClicking ? "scale-90" : ""}`}
          style={{ marginLeft: "-14px", marginTop: "-4px" }}
        >
          {/* Spinal cord — center line */}
          <line
            x1="14" y1="1" x2="14" y2="39"
            stroke="#2D5A4C"
            strokeWidth="1.2"
            strokeLinecap="round"
            opacity="0.5"
          />

          {/* Vertebra 1 (C-type — small, top) */}
          <rect x="8" y="2" width="12" height="4" rx="2" fill="#2D5A4C" opacity="0.7" />
          {/* Spinous process */}
          <line x1="14" y1="4" x2="14" y2="1" stroke="#2D5A4C" strokeWidth="1.5" strokeLinecap="round" opacity="0.5" />

          {/* Vertebra 2 */}
          <rect x="7" y="8" width="14" height="4.5" rx="2.2" fill="#2D5A4C" opacity="0.8" />
          {/* Nerve branches */}
          <line x1="7" y1="10" x2="3" y2="9" stroke="#3D7A66" strokeWidth="0.8" strokeLinecap="round" opacity="0.4" />
          <line x1="21" y1="10" x2="25" y2="9" stroke="#3D7A66" strokeWidth="0.8" strokeLinecap="round" opacity="0.4" />

          {/* Vertebra 3 (largest — lumbar) */}
          <rect x="6" y="14.5" width="16" height="5" rx="2.5" fill="#2D5A4C" opacity="0.9" />
          {/* Nerve branches */}
          <line x1="6" y1="17" x2="2" y2="15.5" stroke="#3D7A66" strokeWidth="0.8" strokeLinecap="round" opacity="0.4" />
          <line x1="22" y1="17" x2="26" y2="15.5" stroke="#3D7A66" strokeWidth="0.8" strokeLinecap="round" opacity="0.4" />

          {/* Vertebra 4 */}
          <rect x="7" y="21.5" width="14" height="4.5" rx="2.2" fill="#2D5A4C" opacity="0.8" />
          {/* Nerve branches */}
          <line x1="7" y1="23.5" x2="3" y2="24.5" stroke="#3D7A66" strokeWidth="0.8" strokeLinecap="round" opacity="0.4" />
          <line x1="21" y1="23.5" x2="25" y2="24.5" stroke="#3D7A66" strokeWidth="0.8" strokeLinecap="round" opacity="0.4" />

          {/* Vertebra 5 (smaller — sacral) */}
          <rect x="8" y="28" width="12" height="4" rx="2" fill="#2D5A4C" opacity="0.7" />

          {/* Sacrum / Tailbone */}
          <path
            d="M 11 34 L 14 39 L 17 34"
            fill="#2D5A4C"
            opacity="0.5"
          />

          {/* Pulsing highlight on center vertebra */}
          <rect
            x="6" y="14.5" width="16" height="5" rx="2.5"
            fill="none"
            stroke="#3D7A66"
            strokeWidth="1"
            opacity="0.4"
            className="animate-[pulse_2s_ease-in-out_infinite]"
          />
        </svg>
      </div>
    </>
  )
}
