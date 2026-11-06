"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { iOsAnleitung as IOsAnleitung } from "./iOsAnleitung"
import { AndroidAnleitung } from "./AndroidAnleitung"
import { usePwaInstall } from "@/hooks/use-pwa-install"
import { Smartphone, CheckCircle2, Download, Copy, ExternalLink } from "lucide-react"

/**
 * Android außerhalb von Chrome: statt Installieren der Weg nach Chrome.
 *
 * Warum, steht bei `istAndroidOhneChrome` im Hook. „In Chrome öffnen" ist
 * ein Android-Intent — Samsung Internet & Co. reichen ihn an Chrome weiter;
 * eingebettete Mail-Browser schlucken ihn manchmal, deshalb daneben das
 * Kopieren als Ausweg, der immer geht.
 */
function InChromeOeffnen() {
  const [kopiert, setKopiert] = useState(false)
  const ziel = typeof window === "undefined" ? "" : `${window.location.origin}/login`
  const intent = ziel
    ? `intent://${ziel.replace(/^https?:\/\//, "")}#Intent;scheme=https;package=com.android.chrome;end`
    : "#"

  const kopieren = async () => {
    try {
      await navigator.clipboard.writeText(ziel)
      setKopiert(true)
      setTimeout(() => setKopiert(false), 2500)
    } catch {
      // Ohne Zwischenablage-Recht bleibt die Adresse sichtbar im Text.
    }
  }

  return (
    <div className="space-y-3">
      <div className="rounded-xl bg-amber-50 border border-amber-200 p-3">
        <p className="text-sm font-semibold text-amber-800">Bitte in Chrome öffnen</p>
        <p className="text-xs text-amber-700 mt-1">
          Dein aktueller Browser baut eine App, die Android als „unsicher“ blockiert. Über
          Google Chrome klappt es ohne Warnung. Melde dich dort an und wähle im Menü (⋮)
          „Zum Startbildschirm hinzufügen“.
        </p>
      </div>
      <Button asChild className="w-full bg-emerald-600 hover:bg-emerald-700 text-white gap-2">
        <a href={intent}>
          <ExternalLink className="h-4 w-4" />
          In Chrome öffnen
        </a>
      </Button>
      <Button variant="outline" onClick={kopieren} className="w-full gap-2">
        <Copy className="h-4 w-4" />
        {kopiert ? "Link kopiert – in Chrome einfügen" : "Link kopieren"}
      </Button>
      {ziel && <p className="text-xs text-slate-400 text-center break-all">{ziel}</p>}
    </div>
  )
}

export function InstallSection() {
  const {
    isInstallable,
    isInstalled,
    isIos,
    isAndroid,
    androidOhneChrome,
    showIosGuide,
    showAndroidGuide,
    triggerInstall,
    dismissInstall,
  } = usePwaInstall()

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

  const buttonLabel = isIos || isAndroid
    ? "Installationsanleitung anzeigen"
    : "App installieren"

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

          {androidOhneChrome ? (
            <InChromeOeffnen />
          ) : isInstallable ? (
            <Button
              onClick={triggerInstall}
              className="w-full bg-emerald-600 hover:bg-emerald-700 text-white gap-2"
              aria-label="Praxis OS auf Homescreen installieren"
            >
              <Download className="h-4 w-4" />
              {buttonLabel}
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
      <AndroidAnleitung open={showAndroidGuide} onClose={dismissInstall} />
    </>
  )
}
