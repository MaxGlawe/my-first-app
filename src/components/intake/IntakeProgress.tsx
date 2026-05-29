"use client"

// Premium-Markenwelt (Masterclass-Format)
const GREEN = "#2C3E2D"
const MUTED = "#64748b"
const LINE = "#e7e1d6"

const STEPS = ["Kontakt", "Beschwerden", "Vorgeschichte", "Absenden"]

interface IntakeProgressProps {
  currentStep: number
}

export function IntakeProgress({ currentStep }: IntakeProgressProps) {
  return (
    <div className="flex items-center justify-center gap-2 mb-8">
      {STEPS.map((label, i) => {
        const stepNum = i + 1
        const isActive = stepNum === currentStep
        const isCompleted = stepNum < currentStep
        return (
          <div key={label} className="flex items-center gap-2">
            <div className="flex flex-col items-center">
              <div
                className="flex h-8 w-8 items-center justify-center rounded-full text-sm font-medium transition-colors"
                style={
                  isCompleted
                    ? { backgroundColor: GREEN, color: "#ffffff" }
                    : isActive
                    ? {
                        backgroundColor: "rgba(44,62,45,0.10)",
                        color: GREEN,
                        boxShadow: `0 0 0 2px ${GREEN}`,
                      }
                    : { backgroundColor: "#F8F5F0", color: MUTED }
                }
              >
                {isCompleted ? "✓" : stepNum}
              </div>
              <span
                className="text-[10px] mt-1"
                style={isActive ? { color: GREEN, fontWeight: 500 } : { color: MUTED }}
              >
                {label}
              </span>
            </div>
            {i < STEPS.length - 1 && (
              <div
                className="h-0.5 w-6 sm:w-10 mt-[-12px]"
                style={{ backgroundColor: isCompleted ? GREEN : LINE }}
              />
            )}
          </div>
        )
      })}
    </div>
  )
}
