"use client"

import { useState, useRef } from "react"
import { useRouter } from "next/navigation"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Button } from "@/components/ui/button"
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
import type { Patient } from "@/types/patient"
import { Camera, Archive, ArchiveRestore, ArrowLeft, AlertTriangle } from "lucide-react"
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

  return (
    <div className="mb-6">
      {/* Back navigation */}
      <Button
        variant="ghost"
        size="sm"
        onClick={() => router.push("/os/patients")}
        className="mb-4 -ml-2 text-muted-foreground"
      >
        <ArrowLeft className="mr-1 h-4 w-4" />
        Zurück zur Patientenliste
      </Button>

      <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
        {/* Avatar + Name + Info */}
        <div className="flex items-center gap-4">
          <div className="relative group">
            <Avatar className="h-16 w-16">
              {patient.avatar_url && (
                <AvatarImage
                  src={patient.avatar_url}
                  alt={`${patient.vorname} ${patient.nachname}`}
                />
              )}
              <AvatarFallback className="text-lg font-semibold">
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
              <h1 className="text-2xl font-bold">
                {patient.vorname} {patient.nachname}
              </h1>
              {isArchived ? (
                <Badge variant="secondary">Archiviert</Badge>
              ) : (
                <Badge className="bg-green-500 hover:bg-green-600">Aktiv</Badge>
              )}
            </div>
            <p className="text-muted-foreground text-sm mt-0.5">
              {getAlter(patient.geburtsdatum)} &middot;{" "}
              {new Date(patient.geburtsdatum).toLocaleDateString("de-DE")}
              {patient.krankenkasse && ` · ${patient.krankenkasse}`}
            </p>
          </div>
        </div>

        {/* Actions */}
        <div className="flex items-center gap-2">
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
                  className="text-muted-foreground"
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
  )
}
