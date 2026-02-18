"use client"

import { useState } from "react"
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Badge } from "@/components/ui/badge"
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { Copy, Check, RefreshCw, AlertTriangle, Globe, Key } from "lucide-react"
import { toast } from "sonner"

interface NewSecretResult {
  secret: string
}

export function WebhookConfigCard() {
  const [copiedUrl, setCopiedUrl] = useState(false)
  const [copiedSecret, setCopiedSecret] = useState(false)
  const [newSecret, setNewSecret] = useState<string | null>(null)
  const [isRotating, setIsRotating] = useState(false)

  const webhookUrl =
    typeof window !== "undefined"
      ? `${window.location.origin}/api/webhooks/booking`
      : "/api/webhooks/booking"

  const handleCopy = async (text: string, field: "url" | "secret") => {
    try {
      await navigator.clipboard.writeText(text)
      if (field === "url") {
        setCopiedUrl(true)
        setTimeout(() => setCopiedUrl(false), 2000)
      } else {
        setCopiedSecret(true)
        setTimeout(() => setCopiedSecret(false), 2000)
      }
      toast.success("In die Zwischenablage kopiert.")
    } catch {
      toast.error("Konnte nicht kopiert werden.")
    }
  }

  const handleRotateSecret = async () => {
    setIsRotating(true)
    setNewSecret(null)

    try {
      const res = await fetch("/api/admin/webhook-secret/rotate", {
        method: "POST",
      })
      const json: NewSecretResult & { error?: string } = await res.json().catch(() => ({}))

      if (!res.ok) {
        toast.error(json.error ?? "Secret konnte nicht rotiert werden.")
        return
      }

      setNewSecret(json.secret)
      toast.success("Neues Webhook-Secret generiert. Bitte jetzt im Buchungstool hinterlegen.")
    } catch {
      toast.error("Ein unerwarteter Fehler ist aufgetreten.")
    } finally {
      setIsRotating(false)
    }
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Globe className="h-5 w-5 text-blue-500" />
          Webhook-Konfiguration
        </CardTitle>
        <CardDescription>
          Trage diese URL und das Secret im Buchungstool ein, damit Patienten- und
          Termindaten automatisch synchronisiert werden.
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-6">
        {/* Webhook URL */}
        <div className="space-y-2">
          <Label htmlFor="webhook-url" className="flex items-center gap-1.5">
            <Globe className="h-3.5 w-3.5" />
            Webhook-URL
          </Label>
          <div className="flex gap-2">
            <Input
              id="webhook-url"
              value={webhookUrl}
              readOnly
              className="font-mono text-sm bg-muted"
              aria-label="Webhook URL"
            />
            <Button
              variant="outline"
              size="icon"
              onClick={() => handleCopy(webhookUrl, "url")}
              aria-label="URL kopieren"
              className="flex-shrink-0"
            >
              {copiedUrl ? (
                <Check className="h-4 w-4 text-green-600" />
              ) : (
                <Copy className="h-4 w-4" />
              )}
            </Button>
          </div>
          <p className="text-xs text-muted-foreground">
            POST-Endpunkt, der Events vom Buchungstool empfängt.
          </p>
        </div>

        {/* Webhook Secret */}
        <div className="space-y-2">
          <Label className="flex items-center gap-1.5">
            <Key className="h-3.5 w-3.5" />
            Webhook-Secret
            <Badge variant="secondary" className="text-xs ml-1">
              HMAC-SHA256
            </Badge>
          </Label>

          {newSecret ? (
            <div className="space-y-2">
              <Alert className="border-green-200 bg-green-50">
                <AlertTriangle className="h-4 w-4 text-green-700" />
                <AlertDescription className="text-green-800 text-sm">
                  <strong>Jetzt kopieren!</strong> Das Secret wird nur einmalig
                  angezeigt und danach nicht mehr im Klartext gespeichert.
                </AlertDescription>
              </Alert>
              <div className="flex gap-2">
                <Input
                  value={newSecret}
                  readOnly
                  className="font-mono text-sm bg-muted"
                  aria-label="Neues Webhook Secret"
                />
                <Button
                  variant="outline"
                  size="icon"
                  onClick={() => handleCopy(newSecret, "secret")}
                  aria-label="Secret kopieren"
                  className="flex-shrink-0"
                >
                  {copiedSecret ? (
                    <Check className="h-4 w-4 text-green-600" />
                  ) : (
                    <Copy className="h-4 w-4" />
                  )}
                </Button>
              </div>
            </div>
          ) : (
            <div className="flex items-center gap-2 p-3 rounded-md border bg-muted">
              <span className="font-mono text-sm text-muted-foreground select-none">
                ●●●●●●●●●●●●●●●●●●●●●●●●●●●●●●●●
              </span>
            </div>
          )}

          <p className="text-xs text-muted-foreground">
            Das Secret wird im Header{" "}
            <code className="font-mono bg-muted px-1 py-0.5 rounded text-xs">
              X-Webhook-Signature
            </code>{" "}
            als HMAC-SHA256 mitgesendet.
          </p>
        </div>

        {/* Rotate secret */}
        <div className="pt-2 border-t">
          <AlertDialog>
            <AlertDialogTrigger asChild>
              <Button
                variant="outline"
                size="sm"
                disabled={isRotating}
                className="text-destructive hover:text-destructive"
              >
                <RefreshCw
                  className={`mr-2 h-4 w-4 ${isRotating ? "animate-spin" : ""}`}
                />
                {isRotating ? "Generiere..." : "Neues Secret generieren"}
              </Button>
            </AlertDialogTrigger>
            <AlertDialogContent>
              <AlertDialogHeader>
                <AlertDialogTitle className="flex items-center gap-2">
                  <AlertTriangle className="h-5 w-5 text-yellow-500" />
                  Secret rotieren?
                </AlertDialogTitle>
                <AlertDialogDescription>
                  Das aktuelle Webhook-Secret wird ungültig. Du musst das neue
                  Secret sofort im Buchungstool hinterlegen, sonst werden keine
                  weiteren Events empfangen.
                </AlertDialogDescription>
              </AlertDialogHeader>
              <AlertDialogFooter>
                <AlertDialogCancel>Abbrechen</AlertDialogCancel>
                <AlertDialogAction onClick={handleRotateSecret}>
                  Neues Secret generieren
                </AlertDialogAction>
              </AlertDialogFooter>
            </AlertDialogContent>
          </AlertDialog>
        </div>
      </CardContent>
    </Card>
  )
}
