"use client"

/**
 * Hero3DCarousel — rotierender Hero mit 3D-Tilt für die Shop-Landings.
 *
 * Zieht die hero_bild-URLs der aktiven Produkte aus /api/shop/products und
 * rotiert alle 5 Sekunden mit weichem Crossfade. Sobald neue Produkte
 * (Programme, Masterclasses) im Katalog landen, taucht ihr Cover automatisch
 * in der Rotation auf — kein Code-Anfassen mehr.
 *
 * - Pause beim Hovern (User soll das Bild beim Anschauen halten können)
 * - Respektiert prefers-reduced-motion (rotiert dann nicht)
 * - 3D-Perspective-Tilt beim Maus-Bewegen (Hero3DImage-Logik)
 * - Fallback-Bild für SSR / initialen Paint, bevor die API antwortet
 */
import { useEffect, useRef, useState, type MouseEvent } from "react"
import { cn } from "@/lib/utils"

interface Hero3DCarouselProps {
  /** SSR-Fallback / Initial-Render-Bild, solange die API noch lädt. */
  fallback?: string
  /** Rotationsintervall in Millisekunden. Default 3000. */
  intervalMs?: number
  className?: string
}

interface ApiProduct {
  hero_bild: string | null
}

export function Hero3DCarousel({
  fallback,
  intervalMs = 3000,
  className,
}: Hero3DCarouselProps) {
  const ref = useRef<HTMLDivElement>(null)
  const [images, setImages] = useState<string[]>(fallback ? [fallback] : [])
  const [activeIndex, setActiveIndex] = useState(0)
  const [paused, setPaused] = useState(false)

  // ── Bilder aus dem Shop-Katalog ziehen ────────────────────────────────────
  useEffect(() => {
    fetch("/api/shop/products")
      .then((res) => (res.ok ? res.json() : { products: [] }))
      .then((json: { products?: ApiProduct[] }) => {
        const imgs = (json.products ?? [])
          .map((p) => p.hero_bild)
          .filter((u): u is string => !!u)
        if (imgs.length > 0) {
          setImages(imgs)
          setActiveIndex(0)
        }
      })
      .catch(() => {
        /* still zeigen wir den Fallback */
      })
  }, [])

  // ── Rotation ──────────────────────────────────────────────────────────────
  useEffect(() => {
    if (images.length < 2 || paused) return
    // prefers-reduced-motion respektieren
    if (typeof window !== "undefined") {
      const reduced = window.matchMedia("(prefers-reduced-motion: reduce)")
      if (reduced.matches) return
    }
    const id = window.setInterval(() => {
      setActiveIndex((i) => (i + 1) % images.length)
    }, intervalMs)
    return () => window.clearInterval(id)
  }, [images.length, paused, intervalMs])

  // ── 3D-Tilt-Effekt beim Maus-Bewegen ──────────────────────────────────────
  const handleMove = (e: MouseEvent<HTMLDivElement>) => {
    const el = ref.current
    if (!el) return
    const rect = el.getBoundingClientRect()
    const x = (e.clientX - rect.left) / rect.width
    const y = (e.clientY - rect.top) / rect.height
    const rotateY = (x - 0.5) * 14
    const rotateX = (0.5 - y) * 14
    el.style.transform = `perspective(1100px) rotateX(${rotateX}deg) rotateY(${rotateY}deg) scale(1.02)`
  }

  const handleLeave = () => {
    const el = ref.current
    if (el) {
      el.style.transform = "perspective(1100px) rotateX(0deg) rotateY(0deg) scale(1)"
    }
    setPaused(false)
  }

  if (images.length === 0) {
    // Leerer State — nur die Hülle, kein Bild. Sollte mit gesetztem fallback
    // nicht eintreten, aber sicherheitshalber abgefangen.
    return (
      <div
        className={cn("relative aspect-square rounded-3xl ring-1", className)}
        style={{ backgroundColor: "rgba(201,183,156,0.12)", boxShadow: "inset 0 0 0 1px #e7e1d6" }}
      />
    )
  }

  return (
    <div
      ref={ref}
      onMouseMove={handleMove}
      onMouseLeave={handleLeave}
      onMouseEnter={() => setPaused(true)}
      className={cn(
        "relative aspect-square rounded-3xl overflow-hidden transition-transform duration-200 ease-out will-change-transform",
        className
      )}
      style={{ boxShadow: "0 28px 56px rgba(15,23,42,0.18)", outline: "1px solid #e7e1d6", outlineOffset: "-1px" }}
    >
      {images.map((src, i) => (
        // eslint-disable-next-line @next/next/no-img-element
        <img
          key={src}
          src={src}
          alt=""
          className={cn(
            "absolute inset-0 w-full h-full object-cover transition-opacity duration-1000 ease-in-out",
            i === activeIndex ? "opacity-100" : "opacity-0"
          )}
        />
      ))}
    </div>
  )
}
