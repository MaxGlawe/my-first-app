"use client"

/**
 * PROJ-18: Push-Opt-in für Pausen-Fit Erinnerungen (BGF)
 *
 * Zeigt eine dezente Aufforderung, Erinnerungen zu aktivieren, solange der
 * Mitarbeiter noch nicht subscribed ist. Sobald aktiv, verschwindet die Karte.
 *
 * iOS-Sonderfall: Web-Push funktioniert auf dem iPhone nur, wenn die App
 * vorher „Zum Home-Bildschirm hinzugefügt" (installiert) wurde. Ist das nicht
 * der Fall, meldet der Browser keine Push-Unterstützung — dann zeigen wir
 * gezielt die Installations-Anleitung statt eines toten Buttons.
 */

import { useEffect, useState } from "react"
import { motion } from "framer-motion"
import { usePushNotifications } from "@/hooks/use-push-notifications"
import { Button } from "@/components/ui/button"
import { BellRing, Share, PlusSquare, X } from "lucide-react"

export function PausenFitReminderPrompt() {
  const { permissionState, isSubscribed, isLoading, error, subscribe } = usePushNotifications()
  const [mounted, setMounted] = useState(false)
  const [isIos, setIsIos] = useState(false)
  const [dismissed, setDismissed] = useState(false)

  useEffect(() => {
    setMounted(true)
    setIsIos(/iPad|iPhone|iPod/.test(navigator.userAgent))
    // Im aktuellen Tab bereits weggeklickt? (nur diese Session)
    try {
      setDismissed(sessionStorage.getItem("bgf-push-prompt-dismissed") === "1")
    } catch {
      /* sessionStorage kann blockiert sein — dann eben nicht */
    }
  }, [])

  // Vor Hydration nichts rendern (navigator ist server-seitig nicht verfügbar)
  if (!mounted) return null

  // Bereits aktiv oder in dieser Session weggeklickt → nichts anzeigen
  if (isSubscribed || dismissed) return null

  function handleDismiss() {
    setDismissed(true)
    try {
      sessionStorage.setItem("bgf-push-prompt-dismissed", "1")
    } catch {
      /* egal */
    }
  }

  // iOS ohne Installation → Push nicht verfügbar → Installations-Anleitung
  if (permissionState === "unsupported" && isIos) {
    return (
      <motion.div
        initial={{ opacity: 0, y: 8 }}
        animate={{ opacity: 1, y: 0 }}
        className="relative rounded-2xl border border-indigo-100 bg-indigo-50/60 p-4"
      >
        <button
          onClick={handleDismiss}
          className="absolute right-3 top-3 text-indigo-300 hover:text-indigo-500"
          aria-label="Hinweis ausblenden"
        >
          <X className="h-4 w-4" />
        </button>
        <div className="flex items-start gap-3 pr-6">
          <div className="mt-0.5 flex h-9 w-9 flex-shrink-0 items-center justify-center rounded-xl bg-indigo-100">
            <BellRing className="h-4.5 w-4.5 text-indigo-600" strokeWidth={2.5} />
          </div>
          <div className="min-w-0">
            <p className="text-sm font-semibold text-slate-800">
              Erinnerungen auf dem iPhone
            </p>
            <p className="mt-1 text-xs leading-relaxed text-slate-500">
              Damit dich dein Pausen-Fit erinnern kann, füge die App einmalig zum Home-Bildschirm hinzu:
            </p>
            <ol className="mt-2 space-y-1.5 text-xs text-slate-600">
              <li className="flex items-center gap-1.5">
                <Share className="h-3.5 w-3.5 text-indigo-500" /> Teilen-Symbol antippen
              </li>
              <li className="flex items-center gap-1.5">
                <PlusSquare className="h-3.5 w-3.5 text-indigo-500" /> „Zum Home-Bildschirm"
              </li>
              <li className="flex items-center gap-1.5">
                <BellRing className="h-3.5 w-3.5 text-indigo-500" /> App vom Home-Bildschirm öffnen, dann Erinnerungen aktivieren
              </li>
            </ol>
          </div>
        </div>
      </motion.div>
    )
  }

  // Nicht unterstützt (Desktop-Altbrowser) oder Nutzer hat abgelehnt → still
  if (permissionState === "unsupported" || permissionState === "denied") {
    return null
  }

  // Standardfall: Subscribe-CTA
  return (
    <motion.div
      initial={{ opacity: 0, y: 8 }}
      animate={{ opacity: 1, y: 0 }}
      className="relative rounded-2xl border border-indigo-100 bg-gradient-to-br from-indigo-50 to-white p-4"
    >
      <button
        onClick={handleDismiss}
        className="absolute right-3 top-3 text-slate-300 hover:text-slate-500"
        aria-label="Ausblenden"
      >
        <X className="h-4 w-4" />
      </button>
      <div className="flex items-start gap-3 pr-6">
        <div className="mt-0.5 flex h-9 w-9 flex-shrink-0 items-center justify-center rounded-xl bg-indigo-100">
          <BellRing className="h-4.5 w-4.5 text-indigo-600" strokeWidth={2.5} />
        </div>
        <div className="min-w-0 flex-1">
          <p className="text-sm font-semibold text-slate-800">
            Pausen-Fit Erinnerungen aktivieren
          </p>
          <p className="mt-1 text-xs leading-relaxed text-slate-500">
            Wir erinnern dich zu deinen Arbeitszeiten sanft an deine 3-Minuten-Routine — sonst geht sie im Alltag unter.
          </p>
          {error && <p className="mt-1.5 text-xs text-red-500">{error}</p>}
          <Button
            onClick={() => subscribe()}
            disabled={isLoading}
            size="sm"
            className="mt-3 bg-indigo-600 hover:bg-indigo-700"
          >
            {isLoading ? "Wird aktiviert…" : "Erinnerungen aktivieren"}
          </Button>
        </div>
      </div>
    </motion.div>
  )
}
