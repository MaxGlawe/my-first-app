"use client"

import { useState } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Link2, Copy, Check, Loader2, X } from "lucide-react"

interface InviteLinkCardProps {
  courseId: string
  inviteToken: string | null
  inviteEnabled: boolean
  onUpdate: (token: string | null, enabled: boolean) => void
}

export function InviteLinkCard({
  courseId,
  inviteToken,
  inviteEnabled,
  onUpdate,
}: InviteLinkCardProps) {
  const [isGenerating, setIsGenerating] = useState(false)
  const [isDisabling, setIsDisabling] = useState(false)
  const [copied, setCopied] = useState(false)

  const inviteUrl = inviteToken
    ? `${typeof window !== "undefined" ? window.location.origin : ""}/app/courses/join/${inviteToken}`
    : null

  const handleGenerate = async () => {
    setIsGenerating(true)
    try {
      const res = await fetch(`/api/courses/${courseId}/invite`, { method: "POST" })
      if (!res.ok) throw new Error()
      const json = await res.json()
      onUpdate(json.invite_token, json.invite_enabled)
    } catch {
      // Silently fail
    } finally {
      setIsGenerating(false)
    }
  }

  const handleDisable = async () => {
    setIsDisabling(true)
    try {
      const res = await fetch(`/api/courses/${courseId}/invite`, { method: "DELETE" })
      if (!res.ok) throw new Error()
      onUpdate(inviteToken, false)
    } catch {
      // Silently fail
    } finally {
      setIsDisabling(false)
    }
  }

  const handleCopy = async () => {
    if (!inviteUrl) return
    try {
      await navigator.clipboard.writeText(inviteUrl)
      setCopied(true)
      setTimeout(() => setCopied(false), 2000)
    } catch {
      // Fallback
    }
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle className="text-base flex items-center gap-2">
          <Link2 className="h-4 w-4" />
          Einladungslink
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-3">
        {inviteToken && inviteEnabled ? (
          <>
            <div className="flex gap-2">
              <Input value={inviteUrl ?? ""} readOnly className="text-sm" />
              <Button variant="outline" size="icon" onClick={handleCopy}>
                {copied ? (
                  <Check className="h-4 w-4 text-green-600" />
                ) : (
                  <Copy className="h-4 w-4" />
                )}
              </Button>
            </div>
            <p className="text-xs text-muted-foreground">
              Patienten können sich über diesen Link selbst einschreiben.
            </p>
            <Button
              variant="outline"
              size="sm"
              onClick={handleDisable}
              disabled={isDisabling}
              className="text-destructive hover:text-destructive"
            >
              {isDisabling ? (
                <Loader2 className="mr-2 h-3.5 w-3.5 animate-spin" />
              ) : (
                <X className="mr-2 h-3.5 w-3.5" />
              )}
              Link deaktivieren
            </Button>
          </>
        ) : (
          <>
            <p className="text-sm text-muted-foreground">
              Erstelle einen Einladungslink, damit Patienten sich selbst einschreiben können.
            </p>
            <Button onClick={handleGenerate} disabled={isGenerating} size="sm">
              {isGenerating ? (
                <Loader2 className="mr-2 h-3.5 w-3.5 animate-spin" />
              ) : (
                <Link2 className="mr-2 h-3.5 w-3.5" />
              )}
              Einladungslink erstellen
            </Button>
          </>
        )}
      </CardContent>
    </Card>
  )
}
