"use client"

import { useRef, useEffect, useCallback, useState } from "react"
import SignaturePadLib from "signature_pad"
import { Button } from "@/components/ui/button"
import { Eraser } from "lucide-react"

interface SignaturePadProps {
  onSignatureChange: (dataUrl: string | null) => void
}

export function SignaturePad({ onSignatureChange }: SignaturePadProps) {
  const canvasRef = useRef<HTMLCanvasElement>(null)
  const padRef = useRef<SignaturePadLib | null>(null)
  const [isEmpty, setIsEmpty] = useState(true)

  useEffect(() => {
    const canvas = canvasRef.current
    if (!canvas) return

    const pad = new SignaturePadLib(canvas, {
      backgroundColor: "rgb(255, 255, 255)",
      penColor: "rgb(15, 23, 42)",
      minWidth: 1.5,
      maxWidth: 3,
    })

    padRef.current = pad

    // Handle resize
    function resizeCanvas() {
      if (!canvas) return
      const ratio = Math.max(window.devicePixelRatio || 1, 1)
      const rect = canvas.getBoundingClientRect()
      canvas.width = rect.width * ratio
      canvas.height = rect.height * ratio
      canvas.getContext("2d")?.scale(ratio, ratio)
      pad.clear()
      setIsEmpty(true)
      onSignatureChange(null)
    }

    resizeCanvas()
    window.addEventListener("resize", resizeCanvas)

    // Listen for end stroke
    pad.addEventListener("endStroke", () => {
      setIsEmpty(pad.isEmpty())
      if (!pad.isEmpty()) {
        onSignatureChange(pad.toDataURL("image/png"))
      }
    })

    return () => {
      window.removeEventListener("resize", resizeCanvas)
      pad.off()
    }
  }, [onSignatureChange])

  const handleClear = useCallback(() => {
    padRef.current?.clear()
    setIsEmpty(true)
    onSignatureChange(null)
  }, [onSignatureChange])

  return (
    <div className="space-y-2">
      <div className="relative rounded-xl border-2 border-dashed border-slate-300 bg-white overflow-hidden">
        <canvas
          ref={canvasRef}
          className="w-full touch-none"
          style={{ height: "160px" }}
        />
        {isEmpty && (
          <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
            <p className="text-sm text-slate-300">
              Hier unterschreiben (Finger oder Maus)
            </p>
          </div>
        )}
      </div>
      <div className="flex justify-end">
        <Button
          type="button"
          variant="ghost"
          size="sm"
          onClick={handleClear}
          disabled={isEmpty}
        >
          <Eraser className="mr-2 h-4 w-4" />
          {"L\u00f6schen"}
        </Button>
      </div>
    </div>
  )
}
