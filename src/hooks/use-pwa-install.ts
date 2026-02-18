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
  showIosGuide: boolean
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
  const [platform] = useState<PlatformType>(detectPlatform)

  useEffect(() => {
    // Check if already installed
    setIsInstalled(isRunningStandalone())

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
    setDeferredPrompt(null)
  }

  const isInstallable = platform === "ios" || !!deferredPrompt

  return {
    isInstallable,
    isInstalled,
    platform,
    isIos: platform === "ios",
    showIosGuide,
    triggerInstall,
    dismissInstall,
  }
}
