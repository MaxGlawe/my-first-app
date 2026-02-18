"use client"

import { Button } from "@/components/ui/button"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { Bell, BellOff, BellRing, AlertTriangle, Loader2 } from "lucide-react"
import type { PushPermissionState } from "@/hooks/use-push-notifications"

interface PushPermissionButtonProps {
  permissionState: PushPermissionState
  isSubscribed: boolean
  isLoading: boolean
  error: string | null
  onSubscribe: () => Promise<void>
  onUnsubscribe: () => Promise<void>
}

export function PushPermissionButton({
  permissionState,
  isSubscribed,
  isLoading,
  error,
  onSubscribe,
  onUnsubscribe,
}: PushPermissionButtonProps) {
  if (permissionState === "unsupported") {
    return (
      <div className="rounded-xl bg-slate-50 border border-slate-200 p-3">
        <p className="text-xs text-slate-500 text-center">
          Dein Browser unterstützt keine Push-Benachrichtigungen. Versuche Chrome oder Safari (iOS
          16.4+).
        </p>
      </div>
    )
  }

  if (permissionState === "denied") {
    return (
      <Alert className="border-amber-200 bg-amber-50">
        <AlertTriangle className="h-4 w-4 text-amber-600" />
        <AlertDescription className="text-amber-700 text-xs">
          Push-Benachrichtigungen wurden blockiert. Erlaube sie in deinen Browser-Einstellungen und
          lade die Seite neu.
        </AlertDescription>
      </Alert>
    )
  }

  return (
    <div className="space-y-2">
      {error && (
        <Alert variant="destructive" className="py-2">
          <AlertTriangle className="h-4 w-4" />
          <AlertDescription className="text-xs">{error}</AlertDescription>
        </Alert>
      )}

      {isSubscribed ? (
        <div className="flex items-center justify-between gap-3">
          <div className="flex items-center gap-2">
            <BellRing className="h-4 w-4 text-emerald-600" aria-hidden="true" />
            <span className="text-sm text-emerald-700 font-medium">
              Push-Benachrichtigungen aktiv
            </span>
          </div>
          <Button
            variant="outline"
            size="sm"
            onClick={onUnsubscribe}
            disabled={isLoading}
            className="text-slate-500 border-slate-200 hover:bg-red-50 hover:text-red-600 hover:border-red-200 gap-1.5"
            aria-label="Push-Benachrichtigungen deaktivieren"
          >
            {isLoading ? (
              <Loader2 className="h-3.5 w-3.5 animate-spin" />
            ) : (
              <BellOff className="h-3.5 w-3.5" />
            )}
            Deaktivieren
          </Button>
        </div>
      ) : (
        <Button
          onClick={onSubscribe}
          disabled={isLoading}
          className="w-full bg-emerald-600 hover:bg-emerald-700 text-white gap-2"
          aria-label="Push-Benachrichtigungen aktivieren"
        >
          {isLoading ? (
            <Loader2 className="h-4 w-4 animate-spin" />
          ) : (
            <Bell className="h-4 w-4" />
          )}
          Push-Benachrichtigungen aktivieren
        </Button>
      )}
    </div>
  )
}
