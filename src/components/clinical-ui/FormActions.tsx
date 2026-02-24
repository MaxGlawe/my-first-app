"use client"

import { Button } from "@/components/ui/button"
import { Save, CheckCircle, ArrowLeft, Loader2 } from "lucide-react"
import Link from "next/link"

interface FormActionsProps {
  /** URL for the back/cancel button */
  backHref: string
  /** Is the form currently saving? */
  saving: boolean
  /** Show the "Abschließen" (finalize) button */
  showFinalize?: boolean
  /** Labels */
  saveLabel?: string
  finalizeLabel?: string
  /** Handlers */
  onSaveDraft?: () => void
  onFinalize?: () => void
  /** Disable buttons */
  disabled?: boolean
}

export function FormActions({
  backHref,
  saving,
  showFinalize = true,
  saveLabel = "Als Entwurf speichern",
  finalizeLabel = "Abschließen & Sperren",
  onSaveDraft,
  onFinalize,
  disabled = false,
}: FormActionsProps) {
  return (
    <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-3 pt-6 border-t border-slate-200/60">
      <Link href={backHref} className="sm:mr-auto">
        <Button type="button" variant="ghost" className="w-full sm:w-auto text-slate-500">
          <ArrowLeft className="mr-2 h-4 w-4" />
          Zurück
        </Button>
      </Link>

      <div className="flex items-center gap-3">
        {onSaveDraft && (
          <Button
            type="button"
            variant="outline"
            onClick={onSaveDraft}
            disabled={saving || disabled}
            className="border-slate-200/60"
          >
            {saving ? (
              <Loader2 className="mr-2 h-4 w-4 animate-spin" />
            ) : (
              <Save className="mr-2 h-4 w-4" />
            )}
            {saveLabel}
          </Button>
        )}

        {showFinalize && onFinalize && (
          <Button
            type="button"
            onClick={onFinalize}
            disabled={saving || disabled}
            className="bg-gradient-to-r from-emerald-500 to-teal-500 hover:from-emerald-600 hover:to-teal-600 text-white border-0 shadow-sm"
          >
            {saving ? (
              <Loader2 className="mr-2 h-4 w-4 animate-spin" />
            ) : (
              <CheckCircle className="mr-2 h-4 w-4" />
            )}
            {finalizeLabel}
          </Button>
        )}
      </div>
    </div>
  )
}
