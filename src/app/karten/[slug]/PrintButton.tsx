"use client"

/**
 * Kleine Client-Insel: löst den Druck-/PDF-Dialog des Browsers aus.
 * Die print-freundliche CSS (nur die Karten drucken) lebt in page.tsx.
 */

import { Printer } from "lucide-react"
import { Button } from "@/components/ui/button"

export function PrintButton() {
  return (
    <Button
      type="button"
      onClick={() => window.print()}
      variant="outline"
      className="rounded-xl font-medium hover:bg-black/[0.03]"
      style={{ borderColor: "#C9B79C", color: "#2C3E2D", backgroundColor: "transparent" }}
    >
      <Printer className="h-4 w-4 mr-2" />
      Drucken / Als PDF speichern
    </Button>
  )
}
