"use client"

import { useState, useEffect } from "react"

interface BeforeInstallPromptEvent extends Event {
  readonly platforms: string[]
  readonly userChoice: Promise<{ outcome: "accepted" | "dismissed"; platform: string }>
  prompt(): Promise<void>
}

export type PlatformType = "ios" | "android" | "desktop" | "unknown"

export interface UsePwaInstallReturn {
  isInstallable: boolean
  isInstalled: boolean
  platform: PlatformType
  isIos: boolean
  isAndroid: boolean
  /** Android, aber nicht Chrome — dort NICHT installieren lassen (s. u.). */
  androidOhneChrome: boolean
  showIosGuide: boolean
  showAndroidGuide: boolean
  triggerInstall: () => Promise<void>
  dismissInstall: () => void
}

function detectPlatform(): PlatformType {
  if (typeof navigator === "undefined") return "unknown"
  const ua = navigator.userAgent
  if (/iPad|iPhone|iPod/.test(ua)) return "ios"
  if (/Android/.test(ua)) return "android"
  return "desktop"
}

/**
 * Läuft die Seite auf Android in einem anderen Browser als Chrome?
 *
 * Samsung Internet, der Browser in Mail-Apps (WEB.DE, GMX …) und andere
 * bauen die App-Hülle selbst — für eine alte Android-Version. Neuere Geräte
 * blockieren sie mit „Unsichere App blockiert" (Play Protect), und die
 * gesperrte Hülle fängt danach sogar Links auf unsere Seite ab. Nur Chrome
 * lässt die Hülle von Google bauen; die geht durch (06.11.2026, erste
 * Programm-Patientin mit Samsung-Handy).
 *
 * Brave u. Ä. geben sich als Chrome aus — die erkennen wir nicht, das ist ok.
 */
function istAndroidOhneChrome(): boolean {
  if (typeof navigator === "undefined") return false
  const ua = navigator.userAgent
  if (!/Android/.test(ua)) return false
  if (!/Chrome\/\d+/.test(ua)) return true
  // `; wv)` = eingebettete WebView (Mail-Apps, Facebook, Instagram …),
  // `Version/x` = ältere WebViews.
  return /SamsungBrowser|EdgA|OPR|YaBrowser|MiuiBrowser|HuaweiBrowser|UCBrowser|; wv\)|Version\/\d/.test(ua)
}

function isRunningStandalone(): boolean {
  if (typeof window === "undefined") return false
  return (
    window.matchMedia("(display-mode: standalone)").matches ||
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    (window.navigator as any).standalone === true
  )
}

export function usePwaInstall(): UsePwaInstallReturn {
  const [deferredPrompt, setDeferredPrompt] = useState<BeforeInstallPromptEvent | null>(null)
  const [isInstalled, setIsInstalled] = useState(false)
  const [showIosGuide, setShowIosGuide] = useState(false)
  const [showAndroidGuide, setShowAndroidGuide] = useState(false)
  const [platform] = useState<PlatformType>(detectPlatform)
  // Erst nach dem Laden bestimmen: Auf dem Server gibt es keinen Browser,
  // ein Startwert aus `navigator` wiche beim Hydrieren ab.
  const [androidOhneChrome, setAndroidOhneChrome] = useState(false)

  useEffect(() => {
    // Check if already installed
    setIsInstalled(isRunningStandalone())
    setAndroidOhneChrome(istAndroidOhneChrome())

    const handleBeforeInstallPrompt = (e: Event) => {
      e.preventDefault()
      setDeferredPrompt(e as BeforeInstallPromptEvent)
    }

    const handleAppInstalled = () => {
      setIsInstalled(true)
      setDeferredPrompt(null)
    }

    window.addEventListener("beforeinstallprompt", handleBeforeInstallPrompt)
    window.addEventListener("appinstalled", handleAppInstalled)

    return () => {
      window.removeEventListener("beforeinstallprompt", handleBeforeInstallPrompt)
      window.removeEventListener("appinstalled", handleAppInstalled)
    }
  }, [])

  const triggerInstall = async () => {
    if (platform === "ios") {
      setShowIosGuide(true)
      return
    }

    // Außerhalb von Chrome nie den Browser-eigenen Dialog auslösen — der
    // baut die Hülle, die Play Protect blockiert. Die Oberfläche zeigt dort
    // stattdessen „In Chrome öffnen".
    if (androidOhneChrome) return

    // On Android, try native prompt first; show guide as fallback
    if (platform === "android" && !deferredPrompt) {
      setShowAndroidGuide(true)
      return
    }

    if (!deferredPrompt) return

    await deferredPrompt.prompt()
    const choice = await deferredPrompt.userChoice

    if (choice.outcome === "accepted") {
      setIsInstalled(true)
    }
    setDeferredPrompt(null)
  }

  const dismissInstall = () => {
    setShowIosGuide(false)
    setShowAndroidGuide(false)
    setDeferredPrompt(null)
  }

  const isInstallable = platform === "ios" || platform === "android" || !!deferredPrompt

  return {
    isInstallable,
    isInstalled,
    platform,
    isIos: platform === "ios",
    isAndroid: platform === "android",
    androidOhneChrome,
    showIosGuide,
    showAndroidGuide,
    triggerInstall,
    dismissInstall,
  }
}
