"use client"

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
                className={`flex h-8 w-8 items-center justify-center rounded-full text-sm font-medium transition-colors ${
                  isCompleted
                    ? "bg-emerald-600 text-white"
                    : isActive
                    ? "bg-emerald-100 text-emerald-700 ring-2 ring-emerald-600"
                    : "bg-slate-100 text-slate-400"
                }`}
              >
                {isCompleted ? "✓" : stepNum}
              </div>
              <span
                className={`text-[10px] mt-1 ${
                  isActive ? "text-emerald-700 font-medium" : "text-slate-400"
                }`}
              >
                {label}
              </span>
            </div>
            {i < STEPS.length - 1 && (
              <div
                className={`h-0.5 w-6 sm:w-10 mt-[-12px] ${
                  isCompleted ? "bg-emerald-600" : "bg-slate-200"
                }`}
              />
            )}
          </div>
        )
      })}
    </div>
  )
}
