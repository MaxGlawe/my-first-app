"use client"

import { useState, useRef } from "react"
import { useRouter } from "next/navigation"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Switch } from "@/components/ui/switch"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
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
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import type { Patient } from "@/types/patient"
import { Camera, Archive, ArchiveRestore, ArrowLeft, AlertTriangle, Mail, Send, Loader2, Gift, BadgeCheck, XCircle, X } from "lucide-react"
import { toast } from "sonner"

interface PatientDetailHeaderProps {
  patient: Patient
  onRefresh: () => void
}

function getInitials(vorname: string, nachname: string): string {
  return `${vorname.charAt(0)}${nachname.charAt(0)}`.toUpperCase()
}

function getAlter(geburtsdatum: string): string {
  const birth = new Date(geburtsdatum)
  const today = new Date()
  let age = today.getFullYear() - birth.getFullYear()
  const m = today.getMonth() - birth.getMonth()
  if (m < 0 || (m === 0 && today.getDate() < birth.getDate())) age--
  return `${age} Jahre`
}

const MAX_AVATAR_SIZE_MB = 2

export function PatientDetailHeader({ patient, onRefresh }: PatientDetailHeaderProps) {
  const router = useRouter()
  const fileInputRef = useRef<HTMLInputElement>(null)
  const [isUploadingAvatar, setIsUploadingAvatar] = useState(false)
  const [isArchiving, setIsArchiving] = useState(false)
  const [isSendingInvite, setIsSendingInvite] = useState(false)

  // Invite + Subscription dialog
  const [showInviteDialog, setShowInviteDialog] = useState(false)
  const [activateSubscription, setActivateSubscription] = useState(true)
  const [planType, setPlanType] = useState<"monthly" | "yearly">("monthly")
  const [promoCode, setPromoCode] = useState("")
  const [promoValid, setPromoValid] = useState<{ valid: boolean; type?: string; value?: number; error?: string } | null>(null)
  const [promoChecking, setPromoChecking] = useState(false)

  const isArchived = !!patient.archived_at

  const handleAvatarUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (!file) return

    if (!["image/jpeg", "image/png", "image/webp"].includes(file.type)) {
      toast.error("Nur JPG, PNG oder WEBP erlaubt.")
      return
    }

    if (file.size > MAX_AVATAR_SIZE_MB * 1024 * 1024) {
      toast.error(`Avatar darf maximal ${MAX_AVATAR_SIZE_MB} MB groß sein.`)
      return
    }

    setIsUploadingAvatar(true)
    try {
      const formData = new FormData()
      formData.append("avatar", file)

      const res = await fetch(`/api/patients/${patient.id}/avatar`, {
        method: "POST",
        body: formData,
      })

      const json = await res.json().catch(() => ({}))

      if (!res.ok) {
        toast.error(json.error ?? "Avatar konnte nicht hochgeladen werden.")
        return
      }

      toast.success("Avatar erfolgreich aktualisiert.")
      onRefresh()
    } catch {
      toast.error("Ein unerwarteter Fehler ist aufgetreten.")
    } finally {
      setIsUploadingAvatar(false)
      // Reset input so same file can be re-uploaded if needed
      if (fileInputRef.current) fileInputRef.current.value = ""
    }
  }

  const handleArchive = async () => {
    setIsArchiving(true)
    try {
      const res = await fetch(`/api/patients/${patient.id}/archive`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ archive: true }),
      })

      const json = await res.json().catch(() => ({}))

      if (!res.ok) {
        toast.error(json.error ?? "Patient konnte nicht archiviert werden.")
        return
      }

      toast.success(json.message ?? "Patient wurde archiviert.")
      onRefresh()
    } catch {
      toast.error("Ein unerwarteter Fehler ist aufgetreten.")
    } finally {
      setIsArchiving(false)
    }
  }

  const handleUnarchive = async () => {
    setIsArchiving(true)
    try {
      const res = await fetch(`/api/patients/${patient.id}/archive`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ archive: false }),
      })

      const json = await res.json().catch(() => ({}))

      if (!res.ok) {
        toast.error(json.error ?? "Patient konnte nicht reaktiviert werden.")
        return
      }

      toast.success(json.message ?? "Patient wurde reaktiviert.")
      onRefresh()
    } catch {
      toast.error("Ein unerwarteter Fehler ist aufgetreten.")
    } finally {
      setIsArchiving(false)
    }
  }

  async function validatePromo(code: string) {
    if (!code.trim()) { setPromoValid(null); return }
    setPromoChecking(true)
    try {
      const res = await fetch(`/api/admin/promo-codes/validate?code=${encodeURIComponent(code)}`)
      setPromoValid(await res.json())
    } catch {
      setPromoValid({ valid: false, error: "Prüfung fehlgeschlagen." })
    } finally {
      setPromoChecking(false)
    }
  }

  function formatPromoValue(type: string, value: number): string {
    if (type === "free_months") return `+${value} Gratis-Monat${value > 1 ? "e" : ""}`
    if (type === "percent_off") return `${value}% Rabatt`
    return `${value.toLocaleString("de-DE", { style: "currency", currency: "EUR" })} Rabatt`
  }

  const handleSendInvite = async () => {
    setIsSendingInvite(true)
    try {
      // One API call: invite + optional subscription activation
      const inviteBody: Record<string, unknown> = {}
      if (activateSubscription) {
        inviteBody.plan_type = planType
        if (promoCode && promoValid?.valid) inviteBody.promo_code = promoCode
      }

      const res = await fetch(`/api/patients/${patient.id}/invite`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(inviteBody),
      })

      const json = await res.json().catch(() => ({}))

      if (!res.ok) {
        toast.error(json.error ?? "Einladung konnte nicht gesendet werden.")
        return
      }

      toast.success(json.message ?? "Einladung wurde gesendet.")

      setShowInviteDialog(false)
      setPromoCode("")
      setPromoValid(null)
      setActivateSubscription(true)
      setPlanType("monthly")
      onRefresh()
    } catch {
      toast.error("Ein unerwarteter Fehler ist aufgetreten.")
    } finally {
      setIsSendingInvite(false)
    }
  }

  return (
    <div className="mb-6">
      {/* Back navigation */}
      <Button
        variant="ghost"
        size="sm"
        onClick={() => router.push("/os/patients")}
        className="mb-4 -ml-2 text-slate-500"
      >
        <ArrowLeft className="mr-1 h-4 w-4" />
        Zurück zur Patientenliste
      </Button>

      <div className="rounded-2xl bg-gradient-to-br from-emerald-50/80 via-white to-teal-50/40 border border-emerald-100/60 p-6 shadow-sm">
        <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
          {/* Avatar + Name + Info */}
          <div className="flex items-center gap-4">
            <div className="relative group">
              <Avatar className="h-16 w-16 border-2 border-white shadow-sm">
                {patient.avatar_url && (
                  <AvatarImage
                    src={patient.avatar_url}
                    alt={`${patient.vorname} ${patient.nachname}`}
                  />
                )}
                <AvatarFallback className="text-lg font-semibold bg-emerald-100 text-emerald-700">
                  {getInitials(patient.vorname, patient.nachname)}
                </AvatarFallback>
              </Avatar>
              {/* Upload overlay */}
              <button
                type="button"
                aria-label="Avatar hochladen"
                onClick={() => fileInputRef.current?.click()}
                disabled={isUploadingAvatar}
                className="absolute inset-0 flex items-center justify-center rounded-full bg-black/50 opacity-0 group-hover:opacity-100 transition-opacity cursor-pointer"
              >
                <Camera className="h-5 w-5 text-white" />
              </button>
              <input
                ref={fileInputRef}
                type="file"
                accept="image/jpeg,image/png,image/webp"
                className="hidden"
                onChange={handleAvatarUpload}
                aria-hidden="true"
              />
            </div>

            <div>
              <div className="flex items-center gap-2 flex-wrap">
                <h1 className="text-2xl font-bold text-slate-800">
                  {patient.vorname} {patient.nachname}
                </h1>
                {isArchived ? (
                  <Badge variant="secondary">Archiviert</Badge>
                ) : (
                  <Badge className="bg-green-500 hover:bg-green-600">Aktiv</Badge>
                )}
                {patient.invite_status === "registered" && (
                  <Badge variant="secondary" className="bg-blue-100 text-blue-800 hover:bg-blue-100">
                    App aktiv
                  </Badge>
                )}
                {patient.invite_status === "invited" && (
                  <Badge variant="secondary" className="bg-amber-100 text-amber-800 hover:bg-amber-100">
                    Eingeladen
                  </Badge>
                )}
              </div>
              <p className="text-slate-500 text-sm mt-0.5">
                {getAlter(patient.geburtsdatum)} &middot;{" "}
                {new Date(patient.geburtsdatum).toLocaleDateString("de-DE")}
                {patient.krankenkasse && ` · ${patient.krankenkasse}`}
              </p>
            </div>
          </div>

          {/* Actions */}
          <div className="flex items-center gap-2">
          {/* Invite button → opens dialog */}
          {patient.email && patient.invite_status !== "registered" && (
            <Button
              variant="outline"
              size="sm"
              onClick={() => setShowInviteDialog(true)}
            >
              {patient.invite_status === "invited" ? (
                <>
                  <Send className="mr-2 h-4 w-4" />
                  Erneut einladen
                </>
              ) : (
                <>
                  <Mail className="mr-2 h-4 w-4" />
                  Zur App einladen
                </>
              )}
            </Button>
          )}

          {/* Invite + Subscription Dialog */}
          <Dialog open={showInviteDialog} onOpenChange={setShowInviteDialog}>
            <DialogContent className="max-w-md">
              <DialogHeader>
                <DialogTitle>
                  {patient.vorname} {patient.nachname} zur App einladen
                </DialogTitle>
                <DialogDescription>
                  Eine Einladungs-E-Mail wird an <strong>{patient.email}</strong> gesendet.
                </DialogDescription>
              </DialogHeader>

              <div className="space-y-5 py-2">
                {/* Subscription toggle */}
                <div className="flex items-center justify-between rounded-lg border border-slate-200 p-4">
                  <div className="space-y-0.5">
                    <Label className="text-sm font-medium">Betreuungspauschale aktivieren</Label>
                    <p className="text-xs text-muted-foreground">
                      1. Monat kostenfrei, danach {planType === "yearly" ? "149,99€/Jahr" : "14,99€/Monat"}
                    </p>
                  </div>
                  <Switch
                    checked={activateSubscription}
                    onCheckedChange={setActivateSubscription}
                  />
                </div>

                {activateSubscription && (
                  <div className="space-y-4 pl-1">
                    {/* Plan type */}
                    <div className="space-y-1.5">
                      <Label className="text-sm">Abrechnungsmodell</Label>
                      <Select value={planType} onValueChange={(v) => setPlanType(v as "monthly" | "yearly")}>
                        <SelectTrigger>
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="monthly">Monatlich — 14,99€/Monat</SelectItem>
                          <SelectItem value="yearly">Jahresmitgliedschaft — 149,99€/Jahr</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>

                    {/* Promo code */}
                    <div className="space-y-1.5">
                      <Label className="text-sm flex items-center gap-1.5">
                        <Gift className="h-3.5 w-3.5" />
                        Promo-Code (optional)
                      </Label>
                      <div className="flex gap-2">
                        <div className="relative flex-1">
                          <Input
                            placeholder="z.B. WILLKOMMEN"
                            value={promoCode}
                            onChange={(e) => {
                              setPromoCode(e.target.value.toUpperCase())
                              setPromoValid(null)
                            }}
                            className={`font-mono pr-8 ${
                              promoValid?.valid === true
                                ? "border-emerald-500 focus-visible:ring-emerald-500"
                                : promoValid?.valid === false
                                ? "border-red-400 focus-visible:ring-red-400"
                                : ""
                            }`}
                          />
                          {promoCode && (
                            <button
                              type="button"
                              onClick={() => { setPromoCode(""); setPromoValid(null) }}
                              className="absolute right-2 top-1/2 -translate-y-1/2 p-0.5 hover:bg-slate-100 rounded"
                            >
                              <X className="h-3.5 w-3.5 text-muted-foreground" />
                            </button>
                          )}
                        </div>
                        <Button
                          type="button"
                          variant="outline"
                          size="sm"
                          onClick={() => validatePromo(promoCode)}
                          disabled={!promoCode.trim() || promoChecking}
                          className="shrink-0"
                        >
                          {promoChecking ? <Loader2 className="h-3.5 w-3.5 animate-spin" /> : "Prüfen"}
                        </Button>
                      </div>

                      {promoValid?.valid === true && (
                        <div className="flex items-center gap-2 text-sm text-emerald-600 bg-emerald-50 rounded-md px-3 py-2">
                          <BadgeCheck className="h-4 w-4 shrink-0" />
                          <span className="font-medium">
                            Code gültig — {formatPromoValue(promoValid.type!, promoValid.value!)}
                          </span>
                        </div>
                      )}
                      {promoValid?.valid === false && (
                        <div className="flex items-center gap-2 text-sm text-red-600 bg-red-50 rounded-md px-3 py-2">
                          <XCircle className="h-4 w-4 shrink-0" />
                          <span>{promoValid.error}</span>
                        </div>
                      )}
                    </div>
                  </div>
                )}
              </div>

              <DialogFooter>
                <Button variant="outline" onClick={() => setShowInviteDialog(false)}>
                  Abbrechen
                </Button>
                <Button
                  onClick={handleSendInvite}
                  disabled={isSendingInvite}
                  className="bg-emerald-600 hover:bg-emerald-700"
                >
                  {isSendingInvite ? (
                    <Loader2 className="h-4 w-4 animate-spin mr-1.5" />
                  ) : (
                    <Send className="h-4 w-4 mr-1.5" />
                  )}
                  {activateSubscription ? "Einladen & Freischalten" : "Einladung senden"}
                </Button>
              </DialogFooter>
            </DialogContent>
          </Dialog>

          {isArchived ? (
            <Button
              variant="outline"
              size="sm"
              onClick={handleUnarchive}
              disabled={isArchiving}
            >
              <ArchiveRestore className="mr-2 h-4 w-4" />
              {isArchiving ? "Reaktivieren..." : "Reaktivieren"}
            </Button>
          ) : (
            <AlertDialog>
              <AlertDialogTrigger asChild>
                <Button
                  variant="outline"
                  size="sm"
                  disabled={isArchiving}
                  className="text-slate-500"
                >
                  <Archive className="mr-2 h-4 w-4" />
                  Archivieren
                </Button>
              </AlertDialogTrigger>
              <AlertDialogContent>
                <AlertDialogHeader>
                  <AlertDialogTitle className="flex items-center gap-2">
                    <AlertTriangle className="h-5 w-5 text-yellow-500" />
                    Patient archivieren?
                  </AlertDialogTitle>
                  <AlertDialogDescription>
                    <strong>
                      {patient.vorname} {patient.nachname}
                    </strong>{" "}
                    wird archiviert und nicht mehr in der aktiven Patientenliste angezeigt.
                    <br />
                    <br />
                    Aus DSGVO-Gründen (Aufbewahrungspflicht 10 Jahre) werden die Daten{" "}
                    <strong>nicht gelöscht</strong>. Der Patient kann jederzeit reaktiviert
                    werden.
                  </AlertDialogDescription>
                </AlertDialogHeader>
                <AlertDialogFooter>
                  <AlertDialogCancel>Abbrechen</AlertDialogCancel>
                  <AlertDialogAction onClick={handleArchive}>
                    Archivieren
                  </AlertDialogAction>
                </AlertDialogFooter>
              </AlertDialogContent>
            </AlertDialog>
          )}
        </div>
      </div>
      </div>
    </div>
  )
}
