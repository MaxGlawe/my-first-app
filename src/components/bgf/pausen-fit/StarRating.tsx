"use client"

import { useState } from "react"

interface StarRatingProps {
  value: number
  onChange: (value: number) => void
  size?: "sm" | "lg"
}

export function StarRating({ value, onChange, size = "lg" }: StarRatingProps) {
  const [hover, setHover] = useState(0)

  const starSize = size === "lg" ? "text-4xl" : "text-2xl"

  return (
    <div className="flex items-center gap-2" role="group" aria-label="Bewertung">
      {Array.from({ length: 5 }).map((_, i) => {
        const starValue = i + 1
        const isActive = starValue <= (hover || value)
        return (
          <button
            key={i}
            type="button"
            onClick={() => onChange(starValue)}
            onMouseEnter={() => setHover(starValue)}
            onMouseLeave={() => setHover(0)}
            className={[
              starSize,
              "transition-transform duration-100 active:scale-90",
              isActive ? "text-amber-400" : "text-slate-200",
            ].join(" ")}
            aria-label={`${starValue} Stern${starValue > 1 ? "e" : ""}`}
          >
            ★
          </button>
        )
      })}
    </div>
  )
}
