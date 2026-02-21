"use client"

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { KATEGORIE_LABELS, UNLOCK_MODE_LABELS } from "@/types/course"
import type { CourseKategorie, CourseUnlockMode } from "@/types/course"

interface CourseSettingsPanelProps {
  beschreibung: string
  onBeschreibungChange: (value: string) => void
  kategorie: CourseKategorie
  onKategorieChange: (value: CourseKategorie) => void
  dauerWochen: number
  onDauerWochenChange: (value: number) => void
  unlockMode: CourseUnlockMode
  onUnlockModeChange: (value: CourseUnlockMode) => void
  coverImageUrl: string
  onCoverImageUrlChange: (value: string) => void
}

export function CourseSettingsPanel({
  beschreibung,
  onBeschreibungChange,
  kategorie,
  onKategorieChange,
  dauerWochen,
  onDauerWochenChange,
  unlockMode,
  onUnlockModeChange,
  coverImageUrl,
  onCoverImageUrlChange,
}: CourseSettingsPanelProps) {
  return (
    <Card>
      <CardHeader>
        <CardTitle className="text-base">Kurs-Einstellungen</CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        {/* Description */}
        <div className="space-y-2">
          <Label htmlFor="beschreibung">Beschreibung</Label>
          <Textarea
            id="beschreibung"
            value={beschreibung}
            onChange={(e) => onBeschreibungChange(e.target.value)}
            placeholder="Kursbeschreibung für Patienten..."
            rows={4}
            maxLength={5000}
          />
        </div>

        {/* Kategorie */}
        <div className="space-y-2">
          <Label htmlFor="kategorie">Kategorie</Label>
          <select
            id="kategorie"
            value={kategorie}
            onChange={(e) => onKategorieChange(e.target.value as CourseKategorie)}
            className="w-full h-10 rounded-md border border-input bg-background px-3 text-sm ring-offset-background focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2"
          >
            {Object.entries(KATEGORIE_LABELS).map(([value, label]) => (
              <option key={value} value={value}>
                {label}
              </option>
            ))}
          </select>
        </div>

        {/* Duration */}
        <div className="space-y-2">
          <Label htmlFor="dauer">Dauer (Wochen)</Label>
          <Input
            id="dauer"
            type="number"
            min={1}
            max={104}
            value={dauerWochen}
            onChange={(e) => {
              const val = parseInt(e.target.value, 10)
              if (!isNaN(val) && val >= 1 && val <= 104) {
                onDauerWochenChange(val)
              }
            }}
          />
        </div>

        {/* Unlock Mode */}
        <div className="space-y-2">
          <Label htmlFor="unlock_mode">Freischaltung</Label>
          <select
            id="unlock_mode"
            value={unlockMode}
            onChange={(e) => onUnlockModeChange(e.target.value as CourseUnlockMode)}
            className="w-full h-10 rounded-md border border-input bg-background px-3 text-sm ring-offset-background focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2"
          >
            {Object.entries(UNLOCK_MODE_LABELS).map(([value, label]) => (
              <option key={value} value={value}>
                {label}
              </option>
            ))}
          </select>
        </div>

        {/* Cover Image URL */}
        <div className="space-y-2">
          <Label htmlFor="cover_image">Cover-Bild URL</Label>
          <Input
            id="cover_image"
            type="url"
            value={coverImageUrl}
            onChange={(e) => onCoverImageUrlChange(e.target.value)}
            placeholder="https://..."
          />
        </div>
      </CardContent>
    </Card>
  )
}
