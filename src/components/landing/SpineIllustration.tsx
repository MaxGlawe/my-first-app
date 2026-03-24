"use client"

import { useRef, useState, useEffect } from "react"
import { motion } from "framer-motion"

/*
 * Anatomical Lumbar Spine — Lateral View SVG
 * Based on medical illustration style: vertebral bodies, intervertebral discs,
 * spinous processes, transverse processes, sacrum, coccyx.
 * Colors: warm bone (#D4B896, #C4A67A), blue discs (#6BA3BE, #89C4DC)
 */

interface SpineIllustrationProps {
  className?: string
}

function VertebraGroup({
  index,
  hoveredVertebra,
  onHover,
}: {
  index: number
  hoveredVertebra: number | null
  onHover: (i: number | null) => void
}) {
  const isHovered = hoveredVertebra === index
  const labels = ["L1", "L2", "L3", "L4", "L5"]

  return (
    <motion.g
      onMouseEnter={() => onHover(index)}
      onMouseLeave={() => onHover(null)}
      initial={{ opacity: 0, x: -20 }}
      animate={{ opacity: 1, x: 0 }}
      transition={{ delay: 0.3 + index * 0.12, duration: 0.7, ease: [0.16, 1, 0.3, 1] }}
      style={{ cursor: "pointer" }}
    >
      {/* Hover glow */}
      {isHovered && (
        <motion.ellipse
          cx={vertebrae[index].cx}
          cy={vertebrae[index].cy}
          rx="65"
          ry="40"
          fill="#7CB69D"
          opacity="0.15"
          initial={{ scale: 0.8, opacity: 0 }}
          animate={{ scale: 1, opacity: 0.15 }}
          transition={{ duration: 0.3 }}
        />
      )}

      {/* Hover label */}
      {isHovered && (
        <motion.g
          initial={{ opacity: 0, x: 10 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.2 }}
        >
          <rect
            x={vertebrae[index].cx + 70}
            y={vertebrae[index].cy - 14}
            width="48"
            height="28"
            rx="8"
            fill="white"
            stroke="#2D6A4F"
            strokeWidth="1.5"
            filter="url(#labelShadow)"
          />
          <text
            x={vertebrae[index].cx + 94}
            y={vertebrae[index].cy + 5}
            textAnchor="middle"
            className="font-mono"
            fontSize="13"
            fontWeight="700"
            fill="#2D6A4F"
          >
            {labels[index]}
          </text>
        </motion.g>
      )}
    </motion.g>
  )
}

// Vertebra center positions for hover detection
const vertebrae = [
  { cx: 95, cy: 68 },
  { cx: 100, cy: 138 },
  { cx: 108, cy: 210 },
  { cx: 118, cy: 282 },
  { cx: 130, cy: 354 },
]

export function SpineIllustration({ className }: SpineIllustrationProps) {
  const [hoveredVertebra, setHoveredVertebra] = useState<number | null>(null)
  const [mousePos, setMousePos] = useState({ x: 0, y: 0 })
  const svgRef = useRef<SVGSVGElement>(null)

  useEffect(() => {
    const onMove = (e: MouseEvent) => {
      if (!svgRef.current) return
      const rect = svgRef.current.getBoundingClientRect()
      setMousePos({
        x: ((e.clientX - rect.left) / rect.width - 0.5) * 2,
        y: ((e.clientY - rect.top) / rect.height - 0.5) * 2,
      })
    }
    window.addEventListener("mousemove", onMove, { passive: true })
    return () => window.removeEventListener("mousemove", onMove)
  }, [])

  // Subtle tilt based on mouse
  const tiltX = mousePos.y * -3
  const tiltY = mousePos.x * 4

  return (
    <div className={className}>
      <motion.div
        className="w-full h-full flex items-center justify-center"
        animate={{ rotateX: tiltX, rotateY: tiltY }}
        transition={{ type: "spring", stiffness: 50, damping: 30 }}
        style={{ perspective: "800px" }}
      >
        <motion.svg
          ref={svgRef}
          viewBox="0 0 260 520"
          className="w-full h-full max-w-[280px]"
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ delay: 0.2, duration: 1.2, ease: [0.16, 1, 0.3, 1] }}
        >
          <defs>
            {/* Bone gradient - warm beige */}
            <linearGradient id="boneGrad" x1="0" y1="0" x2="1" y2="1">
              <stop offset="0%" stopColor="#E8D5B5" />
              <stop offset="40%" stopColor="#D4B896" />
              <stop offset="70%" stopColor="#C4A67A" />
              <stop offset="100%" stopColor="#B89865" />
            </linearGradient>

            {/* Bone gradient lighter for front face */}
            <linearGradient id="boneFront" x1="0" y1="0" x2="0.5" y2="1">
              <stop offset="0%" stopColor="#F0E0C8" />
              <stop offset="50%" stopColor="#DECCA8" />
              <stop offset="100%" stopColor="#D0BC94" />
            </linearGradient>

            {/* Bone shadow gradient */}
            <linearGradient id="boneShadow" x1="0" y1="0" x2="1" y2="0.5">
              <stop offset="0%" stopColor="#A08058" />
              <stop offset="100%" stopColor="#C4A67A" />
            </linearGradient>

            {/* Disc gradient - blue/teal */}
            <linearGradient id="discGrad" x1="0" y1="0" x2="0" y2="1">
              <stop offset="0%" stopColor="#89C4DC" />
              <stop offset="50%" stopColor="#6BA3BE" />
              <stop offset="100%" stopColor="#5A8FA8" />
            </linearGradient>

            {/* Sacrum gradient */}
            <linearGradient id="sacrumGrad" x1="0" y1="0" x2="0.8" y2="1">
              <stop offset="0%" stopColor="#E0CBB0" />
              <stop offset="40%" stopColor="#CCAF88" />
              <stop offset="100%" stopColor="#B89865" />
            </linearGradient>

            {/* Drop shadow filter */}
            <filter id="boneDrop" x="-10%" y="-10%" width="130%" height="130%">
              <feDropShadow dx="2" dy="3" stdDeviation="3" floodColor="#8B7355" floodOpacity="0.25" />
            </filter>

            {/* Label shadow */}
            <filter id="labelShadow" x="-20%" y="-20%" width="140%" height="140%">
              <feDropShadow dx="0" dy="2" stdDeviation="4" floodColor="#000" floodOpacity="0.1" />
            </filter>

            {/* Subtle texture pattern for bone */}
            <pattern id="boneTexture" width="4" height="4" patternUnits="userSpaceOnUse">
              <rect width="4" height="4" fill="transparent" />
              <circle cx="1" cy="1" r="0.4" fill="#B89865" opacity="0.15" />
              <circle cx="3" cy="3" r="0.3" fill="#A08058" opacity="0.1" />
            </pattern>
          </defs>

          {/* ── L1 Vertebra ───────────────────────────────── */}
          {/* Vertebral body */}
          <path
            d="M 58 45 C 60 35, 80 28, 110 30 C 130 32, 138 38, 140 48 L 142 72 C 140 82, 130 88, 110 90 C 80 92, 60 85, 56 75 Z"
            fill="url(#boneFront)"
            stroke="#A08058"
            strokeWidth="0.8"
            filter="url(#boneDrop)"
          />
          <path
            d="M 58 45 C 60 35, 80 28, 110 30 C 130 32, 138 38, 140 48 L 142 72 C 140 82, 130 88, 110 90 C 80 92, 60 85, 56 75 Z"
            fill="url(#boneTexture)"
          />
          {/* Spinous process L1 */}
          <path
            d="M 140 50 L 168 42 C 178 38, 188 36, 192 38 C 196 40, 194 46, 186 50 L 165 56 C 158 58, 148 60, 142 58"
            fill="url(#boneGrad)"
            stroke="#A08058"
            strokeWidth="0.6"
          />
          {/* Transverse process L1 */}
          <path
            d="M 130 36 L 148 26 C 155 22, 160 24, 158 30 L 145 40"
            fill="url(#boneGrad)"
            stroke="#A08058"
            strokeWidth="0.5"
          />
          {/* Pedicle hint */}
          <path
            d="M 138 44 Q 150 44, 155 48 Q 158 52, 155 56 Q 150 58, 142 56"
            fill="url(#boneShadow)"
            stroke="#A08058"
            strokeWidth="0.5"
            opacity="0.6"
          />

          {/* ── Disc L1-L2 ────────────────────────────────── */}
          <motion.path
            d="M 58 90 C 60 86, 80 83, 108 84 C 130 85, 142 88, 144 92 L 146 100 C 144 104, 130 107, 108 108 C 80 109, 60 106, 56 102 Z"
            fill="url(#discGrad)"
            stroke="#5A8FA8"
            strokeWidth="0.6"
            opacity="0.9"
            animate={{ opacity: [0.85, 0.95, 0.85] }}
            transition={{ duration: 4, repeat: Infinity, ease: "easeInOut" }}
          />

          {/* ── L2 Vertebra ───────────────────────────────── */}
          <path
            d="M 56 102 C 58 94, 80 90, 112 92 C 134 94, 146 100, 148 110 L 150 140 C 148 150, 134 156, 112 158 C 80 160, 58 153, 54 143 Z"
            fill="url(#boneFront)"
            stroke="#A08058"
            strokeWidth="0.8"
            filter="url(#boneDrop)"
          />
          <path
            d="M 56 102 C 58 94, 80 90, 112 92 C 134 94, 146 100, 148 110 L 150 140 C 148 150, 134 156, 112 158 C 80 160, 58 153, 54 143 Z"
            fill="url(#boneTexture)"
          />
          {/* Spinous process L2 */}
          <path
            d="M 148 115 L 176 106 C 186 102, 196 100, 200 104 C 204 108, 200 114, 190 118 L 170 124 C 162 126, 152 128, 148 126"
            fill="url(#boneGrad)"
            stroke="#A08058"
            strokeWidth="0.6"
          />
          {/* Transverse process L2 */}
          <path
            d="M 136 98 L 156 88 C 163 84, 168 86, 165 92 L 150 104"
            fill="url(#boneGrad)"
            stroke="#A08058"
            strokeWidth="0.5"
          />

          {/* ── Disc L2-L3 ────────────────────────────────── */}
          <motion.path
            d="M 54 158 C 56 154, 80 150, 112 152 C 136 153, 150 156, 152 160 L 154 170 C 152 174, 136 178, 112 179 C 80 180, 56 177, 52 172 Z"
            fill="url(#discGrad)"
            stroke="#5A8FA8"
            strokeWidth="0.6"
            opacity="0.9"
            animate={{ opacity: [0.85, 0.95, 0.85] }}
            transition={{ duration: 4, repeat: Infinity, ease: "easeInOut", delay: 0.7 }}
          />

          {/* ── L3 Vertebra ───────────────────────────────── */}
          <path
            d="M 52 172 C 56 164, 82 160, 116 162 C 140 164, 154 170, 158 180 L 160 214 C 158 224, 140 230, 116 232 C 82 234, 56 228, 50 216 Z"
            fill="url(#boneFront)"
            stroke="#A08058"
            strokeWidth="0.8"
            filter="url(#boneDrop)"
          />
          <path
            d="M 52 172 C 56 164, 82 160, 116 162 C 140 164, 154 170, 158 180 L 160 214 C 158 224, 140 230, 116 232 C 82 234, 56 228, 50 216 Z"
            fill="url(#boneTexture)"
          />
          {/* Spinous process L3 */}
          <path
            d="M 158 188 L 184 178 C 194 174, 206 174, 208 178 C 212 182, 206 190, 196 194 L 176 200 C 168 202, 158 204, 156 200"
            fill="url(#boneGrad)"
            stroke="#A08058"
            strokeWidth="0.6"
          />
          {/* Transverse process L3 */}
          <path
            d="M 142 168 L 164 158 C 172 154, 178 156, 174 162 L 158 174"
            fill="url(#boneGrad)"
            stroke="#A08058"
            strokeWidth="0.5"
          />

          {/* ── Disc L3-L4 ────────────────────────────────── */}
          <motion.path
            d="M 50 232 C 54 228, 82 224, 116 226 C 142 227, 160 230, 162 234 L 164 244 C 162 248, 142 252, 116 253 C 82 254, 54 252, 48 246 Z"
            fill="url(#discGrad)"
            stroke="#5A8FA8"
            strokeWidth="0.6"
            opacity="0.9"
            animate={{ opacity: [0.85, 0.95, 0.85] }}
            transition={{ duration: 4, repeat: Infinity, ease: "easeInOut", delay: 1.4 }}
          />

          {/* ── L4 Vertebra ───────────────────────────────── */}
          <path
            d="M 48 246 C 54 238, 84 234, 120 236 C 148 238, 164 244, 168 256 L 172 290 C 170 302, 148 308, 120 310 C 84 312, 54 306, 46 294 Z"
            fill="url(#boneFront)"
            stroke="#A08058"
            strokeWidth="0.8"
            filter="url(#boneDrop)"
          />
          <path
            d="M 48 246 C 54 238, 84 234, 120 236 C 148 238, 164 244, 168 256 L 172 290 C 170 302, 148 308, 120 310 C 84 312, 54 306, 46 294 Z"
            fill="url(#boneTexture)"
          />
          {/* Spinous process L4 */}
          <path
            d="M 168 264 L 194 254 C 205 250, 216 250, 218 256 C 222 262, 214 268, 204 272 L 184 280 C 176 282, 168 284, 166 278"
            fill="url(#boneGrad)"
            stroke="#A08058"
            strokeWidth="0.6"
          />
          {/* Transverse process L4 */}
          <path
            d="M 150 242 L 172 232 C 180 228, 186 230, 182 236 L 166 248"
            fill="url(#boneGrad)"
            stroke="#A08058"
            strokeWidth="0.5"
          />

          {/* ── Disc L4-L5 ────────────────────────────────── */}
          <motion.path
            d="M 46 310 C 52 306, 84 302, 120 304 C 150 305, 170 308, 174 312 L 176 322 C 174 326, 150 330, 120 331 C 84 332, 52 330, 44 324 Z"
            fill="url(#discGrad)"
            stroke="#5A8FA8"
            strokeWidth="0.6"
            opacity="0.9"
            animate={{ opacity: [0.85, 0.95, 0.85] }}
            transition={{ duration: 4, repeat: Infinity, ease: "easeInOut", delay: 2.1 }}
          />

          {/* ── L5 Vertebra ───────────────────────────────── */}
          <path
            d="M 44 324 C 52 316, 86 312, 124 314 C 154 316, 176 322, 180 334 L 184 368 C 182 380, 154 388, 124 390 C 86 392, 52 386, 42 374 Z"
            fill="url(#boneFront)"
            stroke="#A08058"
            strokeWidth="0.8"
            filter="url(#boneDrop)"
          />
          <path
            d="M 44 324 C 52 316, 86 312, 124 314 C 154 316, 176 322, 180 334 L 184 368 C 182 380, 154 388, 124 390 C 86 392, 52 386, 42 374 Z"
            fill="url(#boneTexture)"
          />
          {/* Spinous process L5 (shorter) */}
          <path
            d="M 180 342 L 200 336 C 208 333, 214 334, 214 338 C 216 342, 210 348, 204 350 L 190 354 C 184 356, 178 356, 178 350"
            fill="url(#boneGrad)"
            stroke="#A08058"
            strokeWidth="0.6"
          />

          {/* ── Disc L5-S1 ────────────────────────────────── */}
          <motion.path
            d="M 42 390 C 50 386, 86 382, 124 384 C 156 385, 182 388, 186 392 L 188 400 C 186 404, 156 408, 124 409 C 86 410, 50 408, 40 402 Z"
            fill="url(#discGrad)"
            stroke="#5A8FA8"
            strokeWidth="0.6"
            opacity="0.9"
            animate={{ opacity: [0.85, 0.95, 0.85] }}
            transition={{ duration: 4, repeat: Infinity, ease: "easeInOut", delay: 2.8 }}
          />

          {/* ── Sacrum ────────────────────────────────────── */}
          <path
            d="M 40 402 C 48 396, 88 392, 128 394 C 160 396, 186 400, 190 408
               L 188 420 C 186 428, 174 436, 160 442
               L 152 448 C 144 454, 138 460, 134 466
               L 130 474 C 126 480, 124 486, 122 490
               L 118 494 C 116 496, 114 496, 112 494
               L 108 486 C 104 478, 98 470, 90 462
               L 78 448 C 66 438, 52 430, 44 420
               L 40 410 Z"
            fill="url(#sacrumGrad)"
            stroke="#A08058"
            strokeWidth="0.8"
            filter="url(#boneDrop)"
          />
          <path
            d="M 40 402 C 48 396, 88 392, 128 394 C 160 396, 186 400, 190 408
               L 188 420 C 186 428, 174 436, 160 442
               L 152 448 C 144 454, 138 460, 134 466
               L 130 474 C 126 480, 124 486, 122 490
               L 118 494 C 116 496, 114 496, 112 494
               L 108 486 C 104 478, 98 470, 90 462
               L 78 448 C 66 438, 52 430, 44 420
               L 40 410 Z"
            fill="url(#boneTexture)"
          />
          {/* Sacral foramina (holes) */}
          <ellipse cx="100" cy="420" rx="8" ry="5" fill="#B89865" opacity="0.5" />
          <ellipse cx="108" cy="438" rx="7" ry="4.5" fill="#B89865" opacity="0.5" />
          <ellipse cx="114" cy="454" rx="6" ry="4" fill="#B89865" opacity="0.4" />
          <ellipse cx="118" cy="468" rx="5" ry="3" fill="#B89865" opacity="0.3" />

          {/* Sacral ridge (medial crest) */}
          <path
            d="M 155 410 C 150 420, 142 440, 132 460 C 126 474, 120 486, 116 494"
            fill="none"
            stroke="#A08058"
            strokeWidth="0.8"
            opacity="0.4"
          />

          {/* ── Interactive hover layers ──────────────────── */}
          {vertebrae.map((_, i) => (
            <VertebraGroup
              key={i}
              index={i}
              hoveredVertebra={hoveredVertebra}
              onHover={setHoveredVertebra}
            />
          ))}

          {/* ── Nerve pathway particles (animated) ────────── */}
          {[0, 1, 2, 3, 4, 5].map((i) => (
            <motion.circle
              key={`particle-${i}`}
              r="2"
              fill="#7CB69D"
              opacity="0.6"
              animate={{
                cx: [40 + i * 3, 50 + i * 2, 60 + i * 2, 50 + i * 3, 40 + i * 3],
                cy: [60 + i * 20, 150 + i * 30, 280 + i * 25, 400, 60 + i * 20],
                opacity: [0, 0.6, 0.8, 0.4, 0],
                r: [1, 2.5, 2, 1.5, 1],
              }}
              transition={{
                duration: 6 + i * 0.5,
                repeat: Infinity,
                ease: "easeInOut",
                delay: i * 0.8,
              }}
            />
          ))}

          {/* ── Subtle depth lines on vertebral bodies ────── */}
          <path d="M 70 55 Q 95 50, 120 52" fill="none" stroke="#B89865" strokeWidth="0.4" opacity="0.3" />
          <path d="M 68 125 Q 96 118, 125 120" fill="none" stroke="#B89865" strokeWidth="0.4" opacity="0.3" />
          <path d="M 66 195 Q 98 188, 130 190" fill="none" stroke="#B89865" strokeWidth="0.4" opacity="0.3" />
          <path d="M 62 268 Q 100 260, 138 262" fill="none" stroke="#B89865" strokeWidth="0.4" opacity="0.3" />
          <path d="M 58 345 Q 102 336, 145 338" fill="none" stroke="#B89865" strokeWidth="0.4" opacity="0.3" />
        </motion.svg>
      </motion.div>
    </div>
  )
}
