"use client"

import { useState, useEffect, useCallback } from "react"

export type PushPermissionState = "default" | "granted" | "denied" | "unsupported"

export interface PushPreferences {
  reminderEnabled: boolean
  reminderTime: string
  chatEnabled: boolean
}

export interface UsePushNotificationsReturn {
  permissionState: PushPermissionState
  isSubscribed: boolean
  isLoading: boolean
  error: string | null
  preferences: PushPreferences
  subscribe: () => Promise<void>
  unsubscribe: () => Promise<void>
  updatePreferences: (prefs: Partial<PushPreferences>) => Promise<void>
}

const DEFAULT_PREFERENCES: PushPreferences = {
  reminderEnabled: true,
  reminderTime: "08:00",
  chatEnabled: true,
}

function urlBase64ToUint8Array(base64String: string): ArrayBuffer {
  const padding = "=".repeat((4 - (base64String.length % 4)) % 4)
  const base64 = (base64String + padding).replace(/-/g, "+").replace(/_/g, "/")
  const rawData = window.atob(base64)
  const outputArray = new Uint8Array(rawData.length)
  for (let i = 0; i < rawData.length; ++i) {
    outputArray[i] = rawData.charCodeAt(i)
  }
  return outputArray.buffer as ArrayBuffer
}

function getDeviceType(): "ios" | "android" | "desktop" {
  const ua = navigator.userAgent
  if (/iPad|iPhone|iPod/.test(ua)) return "ios"
  if (/Android/.test(ua)) return "android"
  return "desktop"
}

export function usePushNotifications(): UsePushNotificationsReturn {
  const [permissionState, setPermissionState] = useState<PushPermissionState>("default")
  const [isSubscribed, setIsSubscribed] = useState(false)
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [preferences, setPreferences] = useState<PushPreferences>(DEFAULT_PREFERENCES)

  // BUG-4 FIX: Initialize: check current permission + subscription state,
  // AND fetch saved preferences from DB so UI reflects the patient's actual settings.
  useEffect(() => {
    if (!("Notification" in window) || !("serviceWorker" in navigator) || !("PushManager" in window)) {
      setPermissionState("unsupported")
      return
    }

    setPermissionState(Notification.permission as PushPermissionState)

    // Check if already subscribed
    navigator.serviceWorker.ready
      .then((registration) => registration.pushManager.getSubscription())
      .then((subscription) => {
        setIsSubscribed(!!subscription)
      })
      .catch(() => {
        // Service worker not ready yet, that's ok
      })

    // Fetch saved preferences from DB — avoids showing stale defaults on page load
    fetch("/api/me/push/preferences")
      .then((res) => (res.ok ? res.json() : null))
      .then((data) => {
        if (data) {
          setPreferences({
            reminderEnabled: data.reminderEnabled,
            reminderTime: data.reminderTime,
            chatEnabled: data.chatEnabled,
          })
        }
      })
      .catch(() => {
        // Non-fatal: fall back to DEFAULT_PREFERENCES
      })
  }, [])

  const subscribe = useCallback(async () => {
    setIsLoading(true)
    setError(null)

    try {
      if (!("Notification" in window) || !("serviceWorker" in navigator) || !("PushManager" in window)) {
        throw new Error("Push-Benachrichtigungen werden von diesem Browser nicht unterstützt.")
      }

      const permission = await Notification.requestPermission()
      setPermissionState(permission as PushPermissionState)

      if (permission !== "granted") {
        throw new Error("Berechtigung für Push-Benachrichtigungen wurde abgelehnt.")
      }

      const vapidPublicKey = process.env.NEXT_PUBLIC_VAPID_PUBLIC_KEY
      if (!vapidPublicKey) {
        throw new Error("VAPID-Konfiguration fehlt. Bitte den Administrator kontaktieren.")
      }

      const registration = await navigator.serviceWorker.ready
      const subscription = await registration.pushManager.subscribe({
        userVisibleOnly: true,
        applicationServerKey: urlBase64ToUint8Array(vapidPublicKey),
      })

      const response = await fetch("/api/me/push/subscribe", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          subscription: subscription.toJSON(),
          deviceType: getDeviceType(),
        }),
      })

      if (!response.ok) {
        const data = await response.json().catch(() => ({}))
        throw new Error(data.error || "Fehler beim Speichern der Subscription.")
      }

      setIsSubscribed(true)
    } catch (err) {
      const message = err instanceof Error ? err.message : "Unbekannter Fehler."
      setError(message)
    } finally {
      setIsLoading(false)
    }
  }, [])

  const unsubscribe = useCallback(async () => {
    setIsLoading(true)
    setError(null)

    try {
      const registration = await navigator.serviceWorker.ready
      const subscription = await registration.pushManager.getSubscription()

      if (subscription) {
        await subscription.unsubscribe()

        const response = await fetch("/api/me/push/unsubscribe", {
          method: "DELETE",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ endpoint: subscription.endpoint }),
        })

        if (!response.ok) {
          const data = await response.json().catch(() => ({}))
          throw new Error(data.error || "Fehler beim Entfernen der Subscription.")
        }
      }

      setIsSubscribed(false)
    } catch (err) {
      const message = err instanceof Error ? err.message : "Unbekannter Fehler."
      setError(message)
    } finally {
      setIsLoading(false)
    }
  }, [])

  const updatePreferences = useCallback(async (prefs: Partial<PushPreferences>) => {
    setIsLoading(true)
    setError(null)

    const updated = { ...preferences, ...prefs }

    try {
      const response = await fetch("/api/me/push/preferences", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          reminderEnabled: updated.reminderEnabled,
          reminderTime: updated.reminderTime,
          chatEnabled: updated.chatEnabled,
        }),
      })

      if (!response.ok) {
        const data = await response.json().catch(() => ({}))
        throw new Error(data.error || "Fehler beim Speichern der Einstellungen.")
      }

      setPreferences(updated)
    } catch (err) {
      const message = err instanceof Error ? err.message : "Unbekannter Fehler."
      setError(message)
    } finally {
      setIsLoading(false)
    }
  }, [preferences])

  return {
    permissionState,
    isSubscribed,
    isLoading,
    error,
    preferences,
    subscribe,
    unsubscribe,
    updatePreferences,
  }
}
