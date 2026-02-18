"use client"

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Switch } from "@/components/ui/switch"
import { Label } from "@/components/ui/label"
import { Input } from "@/components/ui/input"
import { Separator } from "@/components/ui/separator"
import { PushPermissionButton } from "./PushPermissionButton"
import { usePushNotifications } from "@/hooks/use-push-notifications"
import { Bell, Dumbbell, MessageCircle } from "lucide-react"

export function BenachrichtigungsSection() {
  const {
    permissionState,
    isSubscribed,
    isLoading,
    error,
    preferences,
    subscribe,
    unsubscribe,
    updatePreferences,
  } = usePushNotifications()

  const handleReminderToggle = async (enabled: boolean) => {
    await updatePreferences({ reminderEnabled: enabled })
  }

  const handleReminderTimeChange = async (time: string) => {
    await updatePreferences({ reminderTime: time })
  }

  const handleChatToggle = async (enabled: boolean) => {
    await updatePreferences({ chatEnabled: enabled })
  }

  return (
    <Card>
      <CardHeader className="pb-3">
        <CardTitle className="text-base font-semibold text-slate-800 flex items-center gap-2">
          <Bell className="h-5 w-5 text-emerald-600" aria-hidden="true" />
          Benachrichtigungen
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-5">
        {/* Push activation / deactivation */}
        <PushPermissionButton
          permissionState={permissionState}
          isSubscribed={isSubscribed}
          isLoading={isLoading}
          error={error}
          onSubscribe={subscribe}
          onUnsubscribe={unsubscribe}
        />

        {/* Notification preferences — only shown when subscribed */}
        {isSubscribed && (
          <>
            <Separator />

            {/* Training reminder */}
            <div className="space-y-3">
              <div className="flex items-center justify-between gap-3">
                <div className="flex items-center gap-2.5 min-w-0">
                  <div className="w-8 h-8 rounded-lg bg-emerald-50 flex items-center justify-center flex-shrink-0">
                    <Dumbbell className="h-4 w-4 text-emerald-600" aria-hidden="true" />
                  </div>
                  <div className="min-w-0">
                    <Label
                      htmlFor="reminder-switch"
                      className="text-sm font-medium text-slate-700 cursor-pointer"
                    >
                      Training-Erinnerung
                    </Label>
                    <p className="text-xs text-slate-400 mt-0.5">
                      Täglich an Trainingstagen erinnern
                    </p>
                  </div>
                </div>
                <Switch
                  id="reminder-switch"
                  checked={preferences.reminderEnabled}
                  onCheckedChange={handleReminderToggle}
                  disabled={isLoading}
                  aria-label="Training-Erinnerung aktivieren oder deaktivieren"
                />
              </div>

              {/* Time picker — visible when reminder is enabled */}
              {preferences.reminderEnabled && (
                <div className="ml-10 flex items-center gap-3">
                  <Label
                    htmlFor="reminder-time"
                    className="text-xs text-slate-500 whitespace-nowrap"
                  >
                    Uhrzeit
                  </Label>
                  <Input
                    id="reminder-time"
                    type="time"
                    value={preferences.reminderTime}
                    onChange={(e) => handleReminderTimeChange(e.target.value)}
                    disabled={isLoading}
                    className="h-8 text-sm w-32"
                    aria-label="Uhrzeit für Training-Erinnerung"
                  />
                </div>
              )}
            </div>

            <Separator />

            {/* Chat notifications */}
            <div className="flex items-center justify-between gap-3">
              <div className="flex items-center gap-2.5 min-w-0">
                <div className="w-8 h-8 rounded-lg bg-blue-50 flex items-center justify-center flex-shrink-0">
                  <MessageCircle className="h-4 w-4 text-blue-500" aria-hidden="true" />
                </div>
                <div className="min-w-0">
                  <Label
                    htmlFor="chat-switch"
                    className="text-sm font-medium text-slate-700 cursor-pointer"
                  >
                    Nachrichten
                  </Label>
                  <p className="text-xs text-slate-400 mt-0.5">
                    Sofort bei neuer Therapeuten-Nachricht
                  </p>
                </div>
              </div>
              <Switch
                id="chat-switch"
                checked={preferences.chatEnabled}
                onCheckedChange={handleChatToggle}
                disabled={isLoading}
                aria-label="Chat-Benachrichtigungen aktivieren oder deaktivieren"
              />
            </div>
          </>
        )}

        {/* Fallback notice when push is not subscribed */}
        {!isSubscribed && permissionState !== "unsupported" && permissionState !== "denied" && (
          <p className="text-xs text-slate-400">
            Ohne Push-Benachrichtigungen siehst du neue Nachrichten und Trainingserinnerungen nur
            beim Öffnen der App.
          </p>
        )}
      </CardContent>
    </Card>
  )
}
