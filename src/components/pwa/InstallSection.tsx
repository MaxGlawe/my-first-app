"use client"

import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { iOsAnleitung as IOsAnleitung } from "./iOsAnleitung"
import { usePwaInstall } from "@/hooks/use-pwa-install"
import { Smartphone, CheckCircle2, Download } from "lucide-react"

export function InstallSection() {
  const { isInstallable, isInstalled, isIos, showIosGuide, triggerInstall, dismissInstall } =
    usePwaInstall()

  if (isInstalled) {
    return (
      <Card className="border-emerald-200 bg-emerald-50">
        <CardContent className="pt-5 pb-4">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-emerald-100 flex items-center justify-center flex-shrink-0">
              <CheckCircle2 className="h-5 w-5 text-emerald-600" />
            </div>
            <div>
              <p className="text-sm font-semibold text-emerald-800">App installiert</p>
              <p className="text-xs text-emerald-600 mt-0.5">
                Praxis OS läuft als eigenständige App auf deinem Gerät.
              </p>
            </div>
          </div>
        </CardContent>
      </Card>
    )
  }

  return (
    <>
      <Card>
        <CardHeader className="pb-3">
          <CardTitle className="text-base font-semibold text-slate-800 flex items-center gap-2">
            <Smartphone className="h-5 w-5 text-emerald-600" aria-hidden="true" />
            App installieren
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-3">
          <p className="text-sm text-slate-500">
            Installiere Praxis OS auf deinem Homescreen für schnelleren Zugriff und
            Push-Benachrichtigungen.
          </p>

          {isInstallable ? (
            <Button
              onClick={triggerInstall}
              className="w-full bg-emerald-600 hover:bg-emerald-700 text-white gap-2"
              aria-label="Praxis OS auf Homescreen installieren"
            >
              <Download className="h-4 w-4" />
              {isIos ? "Installationsanleitung anzeigen" : "App installieren"}
            </Button>
          ) : (
            <div className="rounded-xl bg-slate-50 border border-slate-200 p-3">
              <p className="text-xs text-slate-500 text-center">
                Öffne diese Seite in Chrome (Android) oder Safari (iPhone), um die App zu
                installieren.
              </p>
            </div>
          )}
        </CardContent>
      </Card>

      <IOsAnleitung open={showIosGuide} onClose={dismissInstall} />
    </>
  )
}
