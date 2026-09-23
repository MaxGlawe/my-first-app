"use client"

/**
 * PROJ-27 — Dokument hochladen.
 *
 * Wird von beiden Seiten benutzt: Patient in seiner App, Praxis im
 * Patientenprofil. Der einzige Unterschied ist `patientId` — die Praxis muss
 * sagen, wessen Akte gemeint ist, der Patient kann es gar nicht.
 *
 * ZWEI KNÖPFE, mit Absicht:
 *
 *   „Fotografieren" setzt `capture="environment"` und öffnet am Handy direkt
 *   die Rückkamera. Genau das will jemand, der einen Arztbrief auf dem Tisch
 *   liegen hat.
 *
 *   „Datei wählen" lässt das weg. Wer den Befund schon als PDF im Postfach
 *   hat, soll nicht erst etwas abfotografieren müssen — und `capture` würde
 *   ihm die Auswahl verbauen.
 *
 * Ein einzelner Knopf hätte immer eine der beiden Gruppen verärgert.
 *
 * Die Bildaufbereitung — Kanten, Entzerrung, Mehrseiten-PDF — kommt in
 * Etappe 5. Hier geht es erst darum, dass ein Dokument sicher ankommt.
 */

import { useRef, useState } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import { Camera, Upload, Loader2, AlertTriangle, X } from "lucide-react"
import { KATEGORIEN, MAX_BYTES, formatBytes, type Kategorie } from "@/lib/dokumente"

const GREEN = "#2C3E2D"

export function DokumentUpload({
  patientId,
  onFertig,
}: {
  /** Nur die Praxis gibt das mit. Fehlt es, gilt die eigene Akte. */
  patientId?: string
  onFertig: () => void
}) {
  const kameraRef = useRef<HTMLInputElement>(null)
  const dateiRef = useRef<HTMLInputElement>(null)

  const [datei, setDatei] = useState<File | null>(null)
  const [vorschau, setVorschau] = useState<string | null>(null)
  const [kategorie, setKategorie] = useState<Kategorie>("arztbrief")
  const [titel, setTitel] = useState("")
  const [notiz, setNotiz] = useState("")
  const [laedt, setLaedt] = useState(false)
  const [fehler, setFehler] = useState<string | null>(null)

  function auswaehlen(f: File | null) {
    setFehler(null)
    if (!f) return
    if (f.size > MAX_BYTES) {
      setFehler(
        `Die Datei ist ${formatBytes(f.size)} gross — mehr als ${formatBytes(MAX_BYTES)} geht nicht. Fotografiere die Seiten einzeln.`
      )
      return
    }
    setDatei(f)
    if (!titel) setTitel(f.name.replace(/\.[^.]+$/, "").slice(0, 120))
    setVorschau(f.type.startsWith("image/") ? URL.createObjectURL(f) : null)
  }

  function verwerfen() {
    if (vorschau) URL.revokeObjectURL(vorschau)
    setDatei(null)
    setVorschau(null)
    setTitel("")
    setNotiz("")
    setFehler(null)
  }

  async function senden() {
    if (!datei) return
    setLaedt(true)
    setFehler(null)
    try {
      const form = new FormData()
      form.append("datei", datei)
      form.append("kategorie", kategorie)
      form.append("titel", titel.trim() || datei.name)
      if (notiz.trim()) form.append("notiz", notiz.trim())
      if (patientId) form.append("patient_id", patientId)

      const res = await fetch("/api/documents", { method: "POST", body: form })
      const json = await res.json()
      if (!res.ok) {
        setFehler(json.error ?? "Der Upload ist fehlgeschlagen.")
        return
      }
      verwerfen()
      onFertig()
    } catch {
      setFehler("Keine Verbindung. Bitte noch einmal versuchen.")
    } finally {
      setLaedt(false)
    }
  }

  return (
    <div>
      <input
        ref={kameraRef}
        type="file"
        accept="image/*"
        capture="environment"
        className="hidden"
        onChange={(e) => auswaehlen(e.target.files?.[0] ?? null)}
      />
      <input
        ref={dateiRef}
        type="file"
        accept="image/*,application/pdf"
        className="hidden"
        onChange={(e) => auswaehlen(e.target.files?.[0] ?? null)}
      />

      {!datei ? (
        <div className="flex flex-wrap gap-2">
          <Button
            size="sm"
            onClick={() => kameraRef.current?.click()}
            className="text-white"
            style={{ backgroundColor: GREEN }}
          >
            <Camera className="mr-1.5 h-4 w-4" /> Fotografieren
          </Button>
          <Button size="sm" variant="outline" onClick={() => dateiRef.current?.click()}>
            <Upload className="mr-1.5 h-4 w-4" /> Datei wählen
          </Button>
        </div>
      ) : (
        <div className="rounded-xl border border-slate-200 bg-white p-4">
          <div className="flex items-start gap-3">
            {vorschau ? (
              // eslint-disable-next-line @next/next/no-img-element
              <img
                src={vorschau}
                alt="Vorschau des gewählten Dokuments"
                className="h-20 w-16 shrink-0 rounded-lg object-cover"
              />
            ) : (
              <div className="flex h-20 w-16 shrink-0 items-center justify-center rounded-lg bg-slate-100 text-[11px] font-semibold text-slate-500">
                PDF
              </div>
            )}
            <div className="min-w-0 flex-1">
              <p className="truncate text-[13.5px] font-medium text-slate-900">{datei.name}</p>
              <p className="text-[12.5px] text-slate-500">{formatBytes(datei.size)}</p>
            </div>
            <button
              type="button"
              onClick={verwerfen}
              className="shrink-0 rounded-lg p-1 text-slate-400 hover:bg-slate-100 hover:text-slate-700"
              aria-label="Auswahl verwerfen"
            >
              <X className="h-4 w-4" />
            </button>
          </div>

          <div className="mt-4 space-y-3">
            <div>
              <label className="text-[12px] font-semibold uppercase tracking-wide text-slate-500">
                Worum geht es?
              </label>
              <div className="mt-1.5 flex flex-wrap gap-1.5">
                {KATEGORIEN.map((k) => (
                  <button
                    key={k.id}
                    type="button"
                    title={k.hinweis}
                    onClick={() => setKategorie(k.id)}
                    className={`rounded-full border px-3 py-1.5 text-[12.5px] transition-colors ${
                      kategorie === k.id
                        ? "border-[#2C3E2D] bg-[#F8F5F0] font-medium text-slate-900"
                        : "border-slate-200 text-slate-600 hover:bg-slate-50"
                    }`}
                  >
                    {k.label}
                  </button>
                ))}
              </div>
            </div>

            <Input
              value={titel}
              onChange={(e) => setTitel(e.target.value)}
              maxLength={200}
              placeholder="Titel, z. B. MRT-Befund LWS vom 14.08."
            />
            <Textarea
              value={notiz}
              onChange={(e) => setNotiz(e.target.value)}
              rows={2}
              maxLength={2000}
              placeholder="Anmerkung (freiwillig)"
            />
          </div>

          {fehler && (
            <p className="mt-3 flex items-start gap-1.5 text-[13px] text-red-600">
              <AlertTriangle className="mt-0.5 h-3.5 w-3.5 shrink-0" />
              {fehler}
            </p>
          )}

          <Button
            onClick={senden}
            disabled={laedt}
            className="mt-4 w-full text-white"
            style={{ backgroundColor: GREEN }}
          >
            {laedt ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" /> Wird hochgeladen…
              </>
            ) : (
              "Zur Akte hinzufügen"
            )}
          </Button>
        </div>
      )}

      {!datei && fehler && (
        <p className="mt-3 flex items-start gap-1.5 text-[13px] text-red-600">
          <AlertTriangle className="mt-0.5 h-3.5 w-3.5 shrink-0" />
          {fehler}
        </p>
      )}
    </div>
  )
}
