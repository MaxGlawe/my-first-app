"use client"

/**
 * PROJ-27 Etappe 5 — Befund scannen.
 *
 * Der Ablauf ist bewusst auf einen Daumen ausgelegt: fotografieren, Ecken
 * zurechtziehen, nächste Seite oder fertig. Mehr Bedienelemente gibt es
 * nicht.
 *
 * Drei Entscheidungen, die anders ausfallen könnten:
 *
 *   ECKEN VON HAND, nicht automatisch. Begründung steht im Worker — eine
 *   Automatik trifft bei weissem Papier auf hellem Tisch oft daneben, und
 *   dann korrigiert man doch. Vorbelegt sind sie mit einem Rand von acht
 *   Prozent; bei einem formatfüllenden Foto stimmt das fast immer.
 *
 *   DER UNSCHÄRFE-HINWEIS BLOCKIERT NICHT. Er warnt und lässt weitermachen.
 *   Wer bei schlechtem Licht den einzigen Arztbrief fotografiert, den er hat,
 *   darf nicht von einer Software ausgesperrt werden, die sich auch irren
 *   kann.
 *
 *   MEHRERE SEITEN WERDEN ZU EINEM PDF. Ein zehnseitiger Entlassbrief als
 *   zehn Einzelbilder in der Akte ist für den Behandler unbrauchbar — er
 *   blättert dann durch zehn Einträge statt durch ein Dokument.
 */

import { useCallback, useEffect, useRef, useState } from "react"
import { Button } from "@/components/ui/button"
import { Camera, Loader2, Check, X, AlertTriangle, Plus, RotateCcw } from "lucide-react"

const GREEN = "#2C3E2D"
const SAND = "#C9B79C"

/** Unterhalb dieses Werts gilt ein Foto als verwackelt. Empirisch, grosszügig. */
const SCHAERFE_GRENZE = 60

interface Ecke {
  x: number
  y: number
}

interface Seite {
  blob: Blob
  vorschau: string
}

export function DokumentScanner({
  onFertig,
  onAbbruch,
}: {
  onFertig: (datei: File) => void
  onAbbruch: () => void
}) {
  const kameraRef = useRef<HTMLInputElement>(null)
  const canvasRef = useRef<HTMLCanvasElement>(null)
  const workerRef = useRef<Worker | null>(null)
  const bitmapRef = useRef<ImageBitmap | null>(null)

  const [seiten, setSeiten] = useState<Seite[]>([])
  const [rohBild, setRohBild] = useState<string | null>(null)
  const [ecken, setEcken] = useState<Ecke[] | null>(null)
  const [ziehtEcke, setZiehtEcke] = useState<number | null>(null)
  const [unscharf, setUnscharf] = useState(false)
  const [arbeitet, setArbeitet] = useState(false)
  const [fehler, setFehler] = useState<string | null>(null)

  useEffect(() => {
    workerRef.current = new Worker(new URL("../../lib/scan/scan.worker.ts", import.meta.url))
    return () => {
      workerRef.current?.terminate()
      bitmapRef.current?.close()
    }
  }, [])

  // ── Foto aufnehmen ──────────────────────────────────────────────────────
  const fotoGewaehlt = useCallback(async (datei: File | null) => {
    if (!datei) return
    setFehler(null)
    setUnscharf(false)
    try {
      const bitmap = await createImageBitmap(datei)
      bitmapRef.current = bitmap
      setRohBild(URL.createObjectURL(datei))

      // Rand von acht Prozent — siehe Kopfkommentar.
      const rx = bitmap.width * 0.08
      const ry = bitmap.height * 0.08
      setEcken([
        { x: rx, y: ry },
        { x: bitmap.width - rx, y: ry },
        { x: bitmap.width - rx, y: bitmap.height - ry },
        { x: rx, y: bitmap.height - ry },
      ])

      // Schärfe prüfen — auf einer Kopie, das Original brauchen wir noch.
      const kopie = await createImageBitmap(datei)
      const w = workerRef.current
      if (w) {
        const hoeren = (e: MessageEvent) => {
          if (e.data?.typ === "schaerfe") {
            setUnscharf(e.data.wert < SCHAERFE_GRENZE)
            w.removeEventListener("message", hoeren)
          }
        }
        w.addEventListener("message", hoeren)
        w.postMessage({ typ: "schaerfe", bild: kopie }, [kopie])
      }
    } catch {
      setFehler("Das Bild konnte nicht gelesen werden. Versuch es noch einmal.")
    }
  }, [])

  // ── Ecken zeichnen ──────────────────────────────────────────────────────
  useEffect(() => {
    const canvas = canvasRef.current
    const bitmap = bitmapRef.current
    if (!canvas || !bitmap || !ecken) return

    const maxBreite = canvas.parentElement?.clientWidth ?? 340
    const skala = maxBreite / bitmap.width
    canvas.width = maxBreite
    canvas.height = bitmap.height * skala

    const ctx = canvas.getContext("2d")!
    ctx.drawImage(bitmap, 0, 0, canvas.width, canvas.height)

    ctx.strokeStyle = SAND
    ctx.lineWidth = 2
    ctx.beginPath()
    ecken.forEach((e, i) => {
      const x = e.x * skala
      const y = e.y * skala
      i === 0 ? ctx.moveTo(x, y) : ctx.lineTo(x, y)
    })
    ctx.closePath()
    ctx.stroke()

    ctx.fillStyle = SAND
    for (const e of ecken) {
      ctx.beginPath()
      ctx.arc(e.x * skala, e.y * skala, 11, 0, Math.PI * 2)
      ctx.fill()
    }
  }, [ecken])

  function zeigerPosition(ev: React.PointerEvent<HTMLCanvasElement>): Ecke | null {
    const canvas = canvasRef.current
    const bitmap = bitmapRef.current
    if (!canvas || !bitmap) return null
    const rect = canvas.getBoundingClientRect()
    const skala = bitmap.width / rect.width
    return { x: (ev.clientX - rect.left) * skala, y: (ev.clientY - rect.top) * skala }
  }

  function greifen(ev: React.PointerEvent<HTMLCanvasElement>) {
    const p = zeigerPosition(ev)
    if (!p || !ecken || !bitmapRef.current) return
    // Grosszügiger Fangradius: Auf einem Handy trifft niemand elf Pixel.
    const radius = bitmapRef.current.width * 0.09
    let naechste = -1
    let beste = Infinity
    ecken.forEach((e, i) => {
      const d = Math.hypot(e.x - p.x, e.y - p.y)
      if (d < beste && d < radius) {
        beste = d
        naechste = i
      }
    })
    if (naechste >= 0) {
      setZiehtEcke(naechste)
      ev.currentTarget.setPointerCapture(ev.pointerId)
    }
  }

  function ziehen(ev: React.PointerEvent<HTMLCanvasElement>) {
    if (ziehtEcke === null) return
    const p = zeigerPosition(ev)
    const bitmap = bitmapRef.current
    if (!p || !ecken || !bitmap) return
    const neu = [...ecken]
    neu[ziehtEcke] = {
      x: Math.max(0, Math.min(bitmap.width, p.x)),
      y: Math.max(0, Math.min(bitmap.height, p.y)),
    }
    setEcken(neu)
  }

  // ── Seite übernehmen ────────────────────────────────────────────────────
  async function seiteUebernehmen() {
    const bitmap = bitmapRef.current
    const w = workerRef.current
    if (!bitmap || !ecken || !w) return

    setArbeitet(true)
    setFehler(null)

    // Zielgrösse aus den gezogenen Kanten — so bleibt das Seitenverhältnis
    // des echten Blattes erhalten, statt alles auf A4 zu quetschen.
    const breite = Math.round(
      Math.max(
        Math.hypot(ecken[1].x - ecken[0].x, ecken[1].y - ecken[0].y),
        Math.hypot(ecken[2].x - ecken[3].x, ecken[2].y - ecken[3].y)
      )
    )
    const hoehe = Math.round(
      Math.max(
        Math.hypot(ecken[3].x - ecken[0].x, ecken[3].y - ecken[0].y),
        Math.hypot(ecken[2].x - ecken[1].x, ecken[2].y - ecken[1].y)
      )
    )

    const fertig = (e: MessageEvent) => {
      if (e.data?.typ === "warp") {
        const blob = e.data.blob as Blob
        setSeiten((s) => [...s, { blob, vorschau: URL.createObjectURL(blob) }])
        setRohBild(null)
        setEcken(null)
        bitmapRef.current = null
        setArbeitet(false)
        w.removeEventListener("message", fertig)
      } else if (e.data?.typ === "fehler") {
        setFehler("Die Seite konnte nicht aufbereitet werden.")
        setArbeitet(false)
        w.removeEventListener("message", fertig)
      }
    }
    w.addEventListener("message", fertig)
    w.postMessage(
      {
        typ: "warp",
        bild: bitmap,
        ecken,
        zielBreite: Math.min(2200, Math.max(600, breite)),
        zielHoehe: Math.min(3200, Math.max(600, hoehe)),
        aufhellen: true,
      },
      [bitmap]
    )
  }

  // ── Abschluss: ein PDF aus allen Seiten ─────────────────────────────────
  async function abschliessen() {
    if (seiten.length === 0) return
    setArbeitet(true)
    setFehler(null)
    try {
      // pdf-lib liegt bereits im Projekt (Verträge, Rechnungen) — keine neue
      // Abhängigkeit für diesen Schritt.
      const { PDFDocument } = await import("pdf-lib")
      const pdf = await PDFDocument.create()

      for (const seite of seiten) {
        const bytes = new Uint8Array(await seite.blob.arrayBuffer())
        const bild = await pdf.embedJpg(bytes)
        const blatt = pdf.addPage([bild.width, bild.height])
        blatt.drawImage(bild, { x: 0, y: 0, width: bild.width, height: bild.height })
      }

      const bytes = await pdf.save()
      const datei = new File(
        [new Uint8Array(bytes)],
        `Scan-${new Date().toISOString().slice(0, 10)}.pdf`,
        { type: "application/pdf" }
      )
      onFertig(datei)
    } catch (err) {
      console.error("[scanner] PDF:", err)
      setFehler("Das PDF konnte nicht erzeugt werden.")
    } finally {
      setArbeitet(false)
    }
  }

  // ══ Ansicht: Ecken zurechtziehen ═══════════════════════════════════════
  if (rohBild && ecken) {
    return (
      <div>
        <p className="text-[13.5px] leading-relaxed text-slate-600">
          Zieh die vier Punkte auf die Ecken des Blattes.
        </p>

        {unscharf && (
          <div className="mt-3 flex items-start gap-2 rounded-xl border border-amber-300 bg-amber-50 p-3">
            <AlertTriangle className="mt-0.5 h-4 w-4 shrink-0 text-amber-700" />
            <p className="text-[13px] leading-relaxed text-amber-900">
              Das Foto wirkt unscharf. Mit mehr Licht und ruhiger Hand wird es lesbarer — du
              kannst es aber auch so verwenden.
            </p>
          </div>
        )}

        <div className="mt-3 overflow-hidden rounded-xl bg-slate-900">
          <canvas
            ref={canvasRef}
            className="block w-full touch-none"
            onPointerDown={greifen}
            onPointerMove={ziehen}
            onPointerUp={() => setZiehtEcke(null)}
            onPointerCancel={() => setZiehtEcke(null)}
          />
        </div>

        {fehler && (
          <p className="mt-2 flex items-start gap-1.5 text-[13px] text-red-600">
            <AlertTriangle className="mt-0.5 h-3.5 w-3.5 shrink-0" />
            {fehler}
          </p>
        )}

        <div className="mt-3 flex gap-2">
          <Button
            onClick={seiteUebernehmen}
            disabled={arbeitet}
            className="flex-1 text-white"
            style={{ backgroundColor: GREEN }}
          >
            {arbeitet ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" /> Wird begradigt…
              </>
            ) : (
              <>
                <Check className="mr-1.5 h-4 w-4" /> Seite übernehmen
              </>
            )}
          </Button>
          <Button
            variant="outline"
            onClick={() => {
              setRohBild(null)
              setEcken(null)
              bitmapRef.current?.close()
              bitmapRef.current = null
            }}
            disabled={arbeitet}
          >
            <RotateCcw className="mr-1.5 h-4 w-4" /> Neu
          </Button>
        </div>
      </div>
    )
  }

  // ══ Ansicht: Seiten sammeln ════════════════════════════════════════════
  return (
    <div>
      <input
        ref={kameraRef}
        type="file"
        accept="image/*"
        capture="environment"
        className="hidden"
        onChange={(e) => {
          fotoGewaehlt(e.target.files?.[0] ?? null)
          e.target.value = ""
        }}
      />

      {seiten.length > 0 && (
        <div className="mb-3 flex flex-wrap gap-2">
          {seiten.map((s, i) => (
            <div key={i} className="relative">
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img
                src={s.vorschau}
                alt={`Seite ${i + 1}`}
                className="h-24 w-[4.5rem] rounded-lg border border-slate-200 object-cover"
              />
              <span className="absolute bottom-1 left-1 rounded bg-black/70 px-1.5 text-[10px] font-semibold text-white">
                {i + 1}
              </span>
              <button
                type="button"
                aria-label={`Seite ${i + 1} entfernen`}
                onClick={() => setSeiten((alt) => alt.filter((_, j) => j !== i))}
                className="absolute -right-1.5 -top-1.5 rounded-full bg-slate-800 p-0.5 text-white"
              >
                <X className="h-3 w-3" />
              </button>
            </div>
          ))}
        </div>
      )}

      {fehler && (
        <p className="mb-2 flex items-start gap-1.5 text-[13px] text-red-600">
          <AlertTriangle className="mt-0.5 h-3.5 w-3.5 shrink-0" />
          {fehler}
        </p>
      )}

      <div className="flex flex-wrap gap-2">
        <Button
          size="sm"
          onClick={() => kameraRef.current?.click()}
          disabled={arbeitet}
          className="text-white"
          style={{ backgroundColor: GREEN }}
        >
          {seiten.length === 0 ? (
            <>
              <Camera className="mr-1.5 h-4 w-4" /> Seite fotografieren
            </>
          ) : (
            <>
              <Plus className="mr-1.5 h-4 w-4" /> Weitere Seite
            </>
          )}
        </Button>

        {seiten.length > 0 && (
          <Button size="sm" variant="outline" onClick={abschliessen} disabled={arbeitet}>
            {arbeitet ? (
              <>
                <Loader2 className="mr-1.5 h-4 w-4 animate-spin" /> Einen Moment…
              </>
            ) : (
              <>
                Fertig — {seiten.length} {seiten.length === 1 ? "Seite" : "Seiten"}
              </>
            )}
          </Button>
        )}

        <Button size="sm" variant="ghost" onClick={onAbbruch} disabled={arbeitet}>
          Abbrechen
        </Button>
      </div>

      {seiten.length === 0 && (
        <p className="mt-3 text-[12.5px] leading-relaxed text-slate-500">
          Leg das Blatt auf eine dunkle Unterlage und fotografiere von oben. Mehrere Seiten
          werden zu einem PDF zusammengefasst.
        </p>
      )}
    </div>
  )
}
