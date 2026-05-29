"use client"

import { useRef, useEffect, useState } from "react"
import Image from "next/image"
import { ScrollReveal } from "./ScrollReveal"

// Premium-Markenwelt (Masterclass-Format)
const PAPER = "#F8F5F0"
const INK = "#0f172a"
const BODY = "#334155"
const MUTED = "#64748b"
const GREEN = "#2C3E2D"
const SAND = "#C9B79C"
const LINE = "#e7e1d6"

const serif = { fontFamily: "var(--font-serif)", fontWeight: 600 } as const

const SIGNATURE_PATH = [
  // M
  "M8 55 L14 12 L26 40 L38 12 L44 55",
  // a
  "M54 30 C50 30, 48 38, 50 44 C52 50, 58 50, 60 44 C62 38, 60 30, 56 30 M60 30 L60 50",
  // x
  "M68 30 L82 50 M82 30 L68 50",
  // G
  "M108 20 C96 18, 88 26, 88 38 C88 50, 96 56, 108 54 C116 52, 118 46, 118 40 L106 40",
  // l
  "M126 12 L128 50",
  // a
  "M136 30 C132 30, 130 38, 132 44 C134 50, 140 50, 142 44 C144 38, 142 30, 138 30 M142 30 L142 50",
  // w
  "M150 30 L156 50 L164 34 L172 50 L178 30",
  // e
  "M186 40 C186 34, 190 30, 196 30 C202 30, 204 34, 204 40 L186 40 C186 46, 190 50, 196 50 C200 50, 204 48, 206 44",
  // decorative tail
  "C210 38, 216 52, 224 48 C230 45, 236 55, 240 50",
].join(" ")

function SignatureSVG() {
  const pathRef = useRef<SVGPathElement>(null)
  const svgRef = useRef<SVGSVGElement>(null)
  const [pathLength, setPathLength] = useState(0)
  const [animate, setAnimate] = useState(false)

  // Step 1: measure the real path length after mount
  useEffect(() => {
    const path = pathRef.current
    if (!path) return
    requestAnimationFrame(() => {
      setPathLength(path.getTotalLength())
    })
  }, [])

  // Step 2: once we know the length, observe scroll
  useEffect(() => {
    if (pathLength === 0) return
    const svg = svgRef.current
    if (!svg) return

    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          // Small delay so the initial hidden state is painted first
          setTimeout(() => setAnimate(true), 50)
          observer.disconnect()
        }
      },
      { threshold: 0.2 }
    )

    observer.observe(svg)
    return () => observer.disconnect()
  }, [pathLength])

  return (
    <svg
      ref={svgRef}
      viewBox="0 0 280 70"
      className="h-14 w-auto"
      style={{ color: INK }}
      aria-label="Unterschrift Max Glawe"
    >
      <path
        ref={pathRef}
        d={SIGNATURE_PATH}
        fill="none"
        stroke="currentColor"
        strokeWidth="2"
        strokeLinecap="round"
        strokeLinejoin="round"
        style={
          pathLength > 0
            ? {
                strokeDasharray: pathLength,
                strokeDashoffset: animate ? 0 : pathLength,
                transition: animate
                  ? "stroke-dashoffset 2.5s ease-out"
                  : "none",
              }
            : { opacity: 0 }
        }
      />
    </svg>
  )
}

function FounderImage() {
  const [imgError, setImgError] = useState(false)

  return (
    <div
      className="h-60 w-48 sm:h-80 sm:w-64 md:h-[22rem] md:w-72 lg:h-96 lg:w-80 rounded-3xl overflow-hidden ring-1 ring-[#e7e1d6] relative"
      style={{ boxShadow: "0 28px 56px rgba(15,23,42,0.10)" }}
    >
      {imgError ? (
        <div
          className="h-full w-full flex items-center justify-center"
          style={{
            background:
              "linear-gradient(135deg, rgba(44,62,45,0.10) 0%, rgba(201,183,156,0.18) 100%)",
          }}
        >
          <span className="text-5xl select-none" style={{ ...serif, color: GREEN }}>
            MG
          </span>
        </div>
      ) : (
        <Image
          src="/images/masterclass/chronischer-kreuzschmerz/max-portrait.jpg"
          alt="Max Glawe — Heilpraktiker für Physiotherapie und Gründer von Praxis OS"
          fill
          className="object-cover object-top"
          sizes="(max-width: 640px) 192px, (max-width: 768px) 256px, (max-width: 1024px) 288px, 320px"
          onError={() => setImgError(true)}
        />
      )}
    </div>
  )
}

export function QuoteSection() {
  return (
    <section
      className="py-24 sm:py-32 relative overflow-hidden"
      style={{ backgroundColor: PAPER }}
    >
      {/* Smart line */}
      <div className="absolute top-0 left-1/2 -translate-x-1/2 flex flex-col items-center">
        <div className="smart-line h-12" />
        <div className="smart-line-dot animate-dot-pulse" />
      </div>

      <div className="container mx-auto px-4 max-w-6xl">
        <ScrollReveal>
          <div className="flex flex-col lg:flex-row items-center gap-8 sm:gap-12 lg:gap-16">
            {/* Portrait */}
            <div className="flex-shrink-0">
              <div className="relative">
                <FounderImage />
                {/* Decorative accent */}
                <div
                  className="absolute -bottom-3 -right-3 h-24 w-24 rounded-2xl -z-10"
                  style={{ backgroundColor: SAND }}
                />
              </div>
            </div>

            {/* Quote content */}
            <div className="flex-1 text-center lg:text-left">
              {/* Decorative quote mark */}
              <span
                className="text-5xl sm:text-7xl lg:text-8xl leading-none select-none block mb-4"
                style={{ ...serif, color: GREEN }}
              >
                &ldquo;
              </span>

              <blockquote
                className="text-lg sm:text-xl md:text-2xl lg:text-[1.7rem] font-light leading-relaxed italic tracking-tight"
                style={{ color: BODY }}
              >
                Niemand heilt auf einer Behandlungsbank. Der Körper heilt durch
                Bewegung — aktiv, bewusst, jeden Tag.
                <span className="not-italic font-semibold" style={{ color: INK }}>
                  {" "}
                  20&nbsp;Minuten pro Woche reichen nicht.
                </span>{" "}
                Echte Heilung beginnt nicht im Wartezimmer —
                <span className="not-italic font-semibold" style={{ color: GREEN }}>
                  {" "}
                  sondern in deiner Bewegung.
                </span>
              </blockquote>

              {/* Signature */}
              <div className="mt-8 flex flex-col items-center lg:items-start gap-4">
                <SignatureSVG />

                <div>
                  <p className="text-base font-semibold" style={{ color: INK }}>
                    Max Glawe
                  </p>
                  <p className="text-sm" style={{ color: MUTED }}>
                    Heilpraktiker für Physiotherapie — Gründer Praxis&nbsp;OS
                  </p>
                </div>
              </div>
            </div>
          </div>
        </ScrollReveal>
      </div>
    </section>
  )
}
