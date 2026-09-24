"use client"

/**
 * PROJ-28 — Standbild aus dem Gespräch, mit gemessenen Winkeln.
 *
 * Das ist der Teil, den keine Videokonferenz kann, und der Grund, warum das
 * hier ein Sprechzimmer ist: Der Patient bewegt sich, das Bild friert ein, und
 * auf dem Standbild wird gemessen.
 *
 * ═══ WAS DIESES WERKZEUG KANN — UND WAS NICHT ═══════════════════════════
 *
 * Es misst WINKEL IN DER BILDEBENE. Knieflexion von der Seite,
 * Schulterelevation von vorn, Rumpfneigung gegen die Senkrechte. Das sind
 * brauchbare Zahlen, wenn die Kamera senkrecht zur Bewegungsebene steht.
 *
 * Es misst NICHT:
 *
 *   — KRAFT. „Das rechte Bein trägt 43 kg" steckt nicht im Bild. Dafür
 *     braucht es eine Messplatte. Auch Ganglabore mit acht Kameras haben
 *     Kraftmessplatten im Boden; die Kameras liefern Bewegung, die Platte
 *     liefert Kraft. Eine geschätzte Zahl in einer Patientenakte wäre
 *     erfunden — deshalb gibt es sie hier nicht.
 *
 *   — ROTATION. Alles, was in die Tiefe geht, ist in einer Bildebene nicht
 *     zu fassen: HWS-Rotation, Hüft-Innenrotation, Pro-/Supination. Die
 *     Kamera müsste in der Rotationsebene stehen, und das geht bei den
 *     meisten nicht.
 *
 *   — STRECKEN. Der Maßstab fehlt. Eine Linie hat deshalb keine Zentimeter,
 *     sondern ihren Winkel zur Senkrechten — das ist die Zahl, die ohne
 *     Maßstab trotzdem stimmt.
 *
 * ═══ WARUM DER AUFBAU WICHTIGER IST ALS DIE MESSUNG ═════════════════════
 *
 * Absolute Werte aus einem Handybild sind fehleranfällig. VERÄNDERUNGEN bei
 * gleichem Aufbau sind es nicht. Genau deshalb gibt es die Aufbau-Hilfe und
 * den Vergleich mit einem früheren Bild: Woche 1 neben Woche 8, gleiche
 * Kamerahöhe, gleicher Abstand. Das ist der diagnostische Wert — nicht die
 * dritte Nachkommastelle eines einzelnen Winkels.
 */

import { useCallback, useEffect, useRef, useState } from "react"
import {
  Camera,
  Loader2,
  X,
  Undo2,
  Save,
  Check,
  Triangle,
  Minus,
  AlertTriangle,
  Columns2,
  MonitorSmartphone,
} from "lucide-react"
import type { Wurf } from "./Schaltzentrale"
import type { Track } from "livekit-client"

const INK = "#12160f"
const GREEN = "#2C3E2D"
const SAND = "#C9B79C"
const LINE = "#e3ddd1"
const MARKE = "#e8582c"

type Modus = "winkel" | "linie"

interface Punkt {
  x: number
  y: number
}

interface Form {
  art: Modus
  punkte: Punkt[]
  wert: number
}

interface AlteAufnahme {
  id: string
  titel: string
  created_at: string
}

/** Winkel bei B, zwischen den Schenkeln BA und BC. 0–180°. */
function winkelBei(a: Punkt, b: Punkt, c: Punkt): number {
  const v1 = { x: a.x - b.x, y: a.y - b.y }
  const v2 = { x: c.x - b.x, y: c.y - b.y }
  const l1 = Math.hypot(v1.x, v1.y)
  const l2 = Math.hypot(v2.x, v2.y)
  if (l1 === 0 || l2 === 0) return 0
  const cos = Math.min(1, Math.max(-1, (v1.x * v2.x + v1.y * v2.y) / (l1 * l2)))
  return (Math.acos(cos) * 180) / Math.PI
}

/**
 * Neigung einer Strecke gegen die Senkrechte. Ohne Massstab hat eine Linie
 * keine Laenge, die etwas bedeutet — ihr Winkel zur Lotrechten hat sie sehr
 * wohl: Rumpfneigung, Schulterstand, Beinachse gegen das Lot.
 */
function neigungZurSenkrechten(a: Punkt, b: Punkt): number {
  const dx = b.x - a.x
  const dy = b.y - a.y
  if (dx === 0 && dy === 0) return 0
  return Math.abs((Math.atan2(dx, dy) * 180) / Math.PI) % 180
}

export function Bewegungsbild({
  spur,
  patientId,
  gegenueber,
  onSchliessen,
  onZeigen,
  onAufbau,
  aufbauAn,
}: {
  spur: Track | undefined
  patientId: string
  gegenueber: string
  onSchliessen: () => void
  /** Das gespeicherte Bild dem Patienten zeigen. */
  onZeigen: (w: Wurf) => void
  /** Aufbau-Hilfe auf seinem Schirm ein/aus. */
  onAufbau: (ansicht: "seitlich" | "frontal" | null) => void
  aufbauAn: boolean
}) {
  const canvasRef = useRef<HTMLCanvasElement>(null)
  const bildRef = useRef<HTMLImageElement | null>(null)
  const vergleichRef = useRef<HTMLImageElement | null>(null)

  const [modus, setModus] = useState<Modus>("winkel")
  const [formen, setFormen] = useState<Form[]>([])
  const [offen, setOffen] = useState<Punkt[]>([])
  const [titel, setTitel] = useState("")
  const [speichert, setSpeichert] = useState(false)
  const [gespeichert, setGespeichert] = useState(false)
  const [fehler, setFehler] = useState<string | null>(null)
  const [alte, setAlte] = useState<AlteAufnahme[]>([])
  const [vergleichLaedt, setVergleichLaedt] = useState(false)

  // ── Standbild ziehen ────────────────────────────────────────────────────
  //
  // Zwei Fallen stecken hier, und ich bin in beide getreten:
  //
  //   1. EIN VIDEOELEMENT, DAS NICHT IM DOKUMENT HAENGT, WIRD OFT NICHT
  //      GEMALT. Der Browser dekodiert dann zwar, rendert aber nicht — und
  //      drawImage liefert Schwarz. Deshalb haengt das Element jetzt im
  //      Dokument, nur winzig und durchsichtig. Nicht `display:none`: Das
  //      stellt das Rendern genauso ein.
  //
  //   2. `videoWidth` IST GESETZT, BEVOR EIN BILD DA IST. Wer darauf wartet,
  //      zeichnet zu frueh — wieder Schwarz. Richtig ist, auf einen echten
  //      Frame zu warten: requestVideoFrameCallback, wo es das gibt, sonst
  //      das `playing`-Ereignis plus zwei Bildlaengen Vorsprung.
  //
  // Beide Fehler sehen gleich aus: ein schwarzes Standbild. Deshalb prueft
  // die Aufnahme am Ende selbst nach, ob ueberhaupt Helligkeit im Bild ist.
  const [nimmtAuf, setNimmtAuf] = useState(true)
  const [schwarz, setSchwarz] = useState(false)

  const aufnehmen = useCallback(() => {
    if (!spur) {
      setFehler("Es kommt gerade kein Bild von deinem Gegenüber an.")
      setNimmtAuf(false)
      return
    }
    setNimmtAuf(true)
    setFehler(null)
    setSchwarz(false)

    const video = document.createElement("video")
    video.muted = true
    video.playsInline = true
    video.autoplay = true
    video.setAttribute("aria-hidden", "true")
    video.style.cssText =
      "position:fixed;left:0;top:0;width:2px;height:2px;opacity:0.01;pointer-events:none;z-index:-1"
    document.body.appendChild(video)
    spur.attach(video)

    let fertig = false
    const aufraeumen = () => {
      try {
        spur.detach(video)
      } catch {
        /* Spur schon weg. */
      }
      video.remove()
    }

    const abzeichnen = () => {
      if (fertig) return
      fertig = true
      const breite = video.videoWidth
      const hoehe = video.videoHeight
      if (!breite || !hoehe) {
        setFehler("Von deinem Gegenüber kommt gerade kein Bild an.")
        setNimmtAuf(false)
        aufraeumen()
        return
      }
      const c = document.createElement("canvas")
      c.width = breite
      c.height = hoehe
      const ctx = c.getContext("2d")
      ctx?.drawImage(video, 0, 0, breite, hoehe)

      // Gegenprobe: Ist ueberhaupt Licht im Bild? Ein schwarzes Standbild
      // sieht aus wie ein Fehler des Patienten und ist keiner.
      if (ctx) {
        const probe = ctx.getImageData(0, 0, Math.min(breite, 64), Math.min(hoehe, 64)).data
        let summe = 0
        for (let i = 0; i < probe.length; i += 4) summe += probe[i] + probe[i + 1] + probe[i + 2]
        setSchwarz(summe / (probe.length / 4) < 12)
      }

      const bild = new Image()
      bild.onload = () => {
        bildRef.current = bild
        setNimmtAuf(false)
        neuZeichnen()
        aufraeumen()
      }
      bild.src = c.toDataURL("image/jpeg", 0.92)
    }

    type MitFrameRueckruf = HTMLVideoElement & {
      requestVideoFrameCallback?: (cb: () => void) => number
    }
    const v = video as MitFrameRueckruf

    void video.play().catch(() => {
      /* Autoplay-Sperre greift bei stummem Video nicht, aber sicher ist sicher. */
    })

    if (typeof v.requestVideoFrameCallback === "function") {
      v.requestVideoFrameCallback(() => abzeichnen())
    } else {
      video.addEventListener("playing", () => setTimeout(abzeichnen, 120), { once: true })
    }
    // Notbremse: Kommt binnen drei Sekunden kein Frame, sagen wir es, statt
    // ewig einen Kreisel zu drehen.
    setTimeout(() => {
      if (!fertig) {
        fertig = true
        setFehler("Es kam kein Bild an. Läuft die Kamera deines Gegenübers?")
        setNimmtAuf(false)
        aufraeumen()
      }
    }, 3000)
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [spur])

  useEffect(() => {
    aufnehmen()
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  // ── Frühere Aufnahmen für den Vergleich ─────────────────────────────────
  useEffect(() => {
    fetch(`/api/documents?patient_id=${patientId}`)
      .then((r) => r.json())
      .then((d) =>
        setAlte(
          ((d.dokumente ?? []) as { id: string; titel: string; kategorie: string; created_at: string }[])
            .filter((x) => x.kategorie === "bewegungsbild")
            .slice(0, 8)
        )
      )
      .catch(() => setAlte([]))
  }, [patientId])

  const vergleichLaden = useCallback(async (id: string) => {
    setVergleichLaedt(true)
    setFehler(null)
    try {
      const r = await fetch(`/api/documents/${id}`)
      const j = await r.json()
      if (!r.ok) throw new Error(j.error ?? "Das Bild konnte nicht geladen werden.")
      await new Promise<void>((fertig, scheitern) => {
        const img = new Image()
        img.crossOrigin = "anonymous"
        img.onload = () => {
          vergleichRef.current = img
          fertig()
        }
        img.onerror = () => scheitern(new Error("Das Vergleichsbild ließ sich nicht öffnen."))
        img.src = j.url
      })
      setFormen([])
      setOffen([])
      neuZeichnen()
    } catch (e) {
      setFehler((e as Error).message)
    } finally {
      setVergleichLaedt(false)
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  // ── Zeichnen ────────────────────────────────────────────────────────────
  const neuZeichnen = useCallback(() => {
    const canvas = canvasRef.current
    const bild = bildRef.current
    if (!canvas || !bild) return

    const vergleich = vergleichRef.current
    // Nebeneinander: links frueher, rechts jetzt. Die Leserichtung ist die
    // Zeitrichtung — alles andere verwirrt genau in dem Moment, in dem der
    // Patient den Fortschritt sehen soll.
    const breite = vergleich ? bild.width * 2 : bild.width
    canvas.width = breite
    canvas.height = bild.height

    const ctx = canvas.getContext("2d")
    if (!ctx) return
    ctx.fillStyle = "#0f120d"
    ctx.fillRect(0, 0, canvas.width, canvas.height)

    if (vergleich) {
      ctx.drawImage(vergleich, 0, 0, bild.width, bild.height)
      ctx.drawImage(bild, bild.width, 0, bild.width, bild.height)
      ctx.strokeStyle = "rgba(248,245,240,0.6)"
      ctx.lineWidth = Math.max(2, bild.width / 400)
      ctx.beginPath()
      ctx.moveTo(bild.width, 0)
      ctx.lineTo(bild.width, bild.height)
      ctx.stroke()
      beschriften(ctx, "früher", 14, 34, bild.width)
      beschriften(ctx, "jetzt", bild.width + 14, 34, bild.width)
    } else {
      ctx.drawImage(bild, 0, 0)
    }

    const skala = Math.max(1.5, canvas.width / 500)
    for (const f of formen) male(ctx, f, canvas, skala)
    if (offen.length > 0) {
      ctx.fillStyle = MARKE
      for (const p of offen) {
        ctx.beginPath()
        ctx.arc(p.x * canvas.width, p.y * canvas.height, skala * 2.5, 0, Math.PI * 2)
        ctx.fill()
      }
    }
  }, [formen, offen])

  useEffect(() => {
    neuZeichnen()
  }, [neuZeichnen])

  function beschriften(
    ctx: CanvasRenderingContext2D,
    text: string,
    x: number,
    y: number,
    bezug: number
  ) {
    const groesse = Math.max(14, bezug / 28)
    ctx.font = `600 ${groesse}px -apple-system, Segoe UI, sans-serif`
    ctx.fillStyle = "rgba(18,21,15,0.75)"
    const b = ctx.measureText(text).width
    ctx.fillRect(x - 6, y - groesse, b + 12, groesse * 1.5)
    ctx.fillStyle = "#F8F5F0"
    ctx.fillText(text, x, y + groesse * 0.2)
  }

  function male(ctx: CanvasRenderingContext2D, f: Form, canvas: HTMLCanvasElement, skala: number) {
    const P = f.punkte.map((p) => ({ x: p.x * canvas.width, y: p.y * canvas.height }))
    ctx.strokeStyle = MARKE
    ctx.fillStyle = MARKE
    ctx.lineWidth = skala

    ctx.beginPath()
    ctx.moveTo(P[0].x, P[0].y)
    for (const p of P.slice(1)) ctx.lineTo(p.x, p.y)
    ctx.stroke()

    for (const p of P) {
      ctx.beginPath()
      ctx.arc(p.x, p.y, skala * 2.2, 0, Math.PI * 2)
      ctx.fill()
    }

    const scheitel = f.art === "winkel" ? P[1] : { x: (P[0].x + P[1].x) / 2, y: (P[0].y + P[1].y) / 2 }
    const text =
      f.art === "winkel" ? `${Math.round(f.wert)}°` : `${Math.round(f.wert)}° zur Senkrechten`
    beschriften(ctx, text, scheitel.x + skala * 4, scheitel.y - skala * 3, canvas.width)
  }

  // ── Klicks ──────────────────────────────────────────────────────────────
  function klick(ev: React.MouseEvent<HTMLCanvasElement>) {
    const canvas = canvasRef.current
    if (!canvas || !bildRef.current) return
    const r = canvas.getBoundingClientRect()
    const p = { x: (ev.clientX - r.left) / r.width, y: (ev.clientY - r.top) / r.height }
    const noetig = modus === "winkel" ? 3 : 2
    const gesammelt = [...offen, p]

    if (gesammelt.length < noetig) {
      setOffen(gesammelt)
      return
    }
    const wert =
      modus === "winkel"
        ? winkelBei(gesammelt[0], gesammelt[1], gesammelt[2])
        : neigungZurSenkrechten(gesammelt[0], gesammelt[1])
    setFormen([...formen, { art: modus, punkte: gesammelt, wert }])
    setOffen([])
    setGespeichert(false)
  }

  // ── Speichern ───────────────────────────────────────────────────────────
  const speichern = async () => {
    const canvas = canvasRef.current
    if (!canvas) return
    setSpeichert(true)
    setFehler(null)
    try {
      const blob = await new Promise<Blob | null>((f) => canvas.toBlob(f, "image/jpeg", 0.9))
      if (!blob) throw new Error("Das Bild konnte nicht erzeugt werden.")

      const messwerte = formen
        .map((f) =>
          f.art === "winkel"
            ? `${Math.round(f.wert)}°`
            : `${Math.round(f.wert)}° zur Senkrechten`
        )
        .join(", ")

      const form = new FormData()
      form.append("patient_id", patientId)
      form.append("kategorie", "bewegungsbild")
      form.append(
        "datei",
        new File([blob], `bewegungsbild-${Date.now()}.jpg`, { type: "image/jpeg" })
      )
      form.append("titel", (titel.trim() || "Bewegungsbild") + (messwerte ? ` — ${messwerte}` : ""))
      form.append(
        "notiz",
        [
          "Standbild aus dem Videogespräch.",
          messwerte && `Gemessen: ${messwerte}.`,
          "Winkel in der Bildebene, keine Kraft- oder Längenmessung.",
          vergleichRef.current && "Links frühere Aufnahme, rechts die aktuelle.",
        ]
          .filter(Boolean)
          .join(" ")
      )

      const r = await fetch("/api/documents", { method: "POST", body: form })
      const j = await r.json()
      if (!r.ok) throw new Error(j.error ?? "Das Bild konnte nicht gespeichert werden.")
      setGespeichert(true)

      // Direkt zeigen: Der Moment, in dem der Patient seinen eigenen Winkel
      // sieht, ist der Moment, in dem die Zahl etwas bedeutet.
      const id = j.dokument?.id ?? j.id
      if (id) {
        const link = await fetch(`/api/documents/${id}`).then((x) => x.json())
        if (link?.url) {
          onZeigen({
            dokumentId: id,
            url: link.url,
            titel: link.titel ?? "Bewegungsbild",
            mime: "image/jpeg",
          })
        }
      }
    } catch (e) {
      setFehler((e as Error).message)
    } finally {
      setSpeichert(false)
    }
  }

  return (
    <div className="absolute inset-0 z-30 flex flex-col" style={{ backgroundColor: "#0f120d" }}>
      {/* Kopf */}
      <div
        className="flex shrink-0 flex-wrap items-center gap-2 px-3 py-2.5"
        style={{ backgroundColor: "#171c14" }}
      >
        <Camera className="h-4 w-4 shrink-0" style={{ color: SAND }} />
        <p className="mr-auto text-[13px] font-medium" style={{ color: "#F8F5F0" }}>
          Bewegungsbild — {gegenueber}
        </p>

        <button
          type="button"
          onClick={() => onAufbau(aufbauAn ? null : "seitlich")}
          className="flex items-center gap-1.5 rounded-lg px-2.5 py-1.5 text-[12px] font-semibold"
          style={
            aufbauAn
              ? { backgroundColor: SAND, color: INK }
              : { backgroundColor: "rgba(248,245,240,0.1)", color: "#F8F5F0" }
          }
        >
          <MonitorSmartphone className="h-3.5 w-3.5" />
          Aufbau-Hilfe
        </button>

        <button
          type="button"
          onClick={onSchliessen}
          aria-label="Bewegungsbild schliessen"
          className="rounded-lg p-1.5"
          style={{ color: "#F8F5F0", backgroundColor: "rgba(248,245,240,0.1)" }}
        >
          <X className="h-4 w-4" />
        </button>
      </div>

      {/* Bild */}
      <div className="min-h-0 flex-1 overflow-auto p-3">
        {bildRef.current && !nimmtAuf ? (
          <canvas
            ref={canvasRef}
            onClick={klick}
            className="mx-auto block max-h-full max-w-full cursor-crosshair rounded-lg"
          />
        ) : (
          <div className="flex h-full items-center justify-center">
            {fehler ? (
              <p className="flex items-center gap-2 text-[13.5px] text-red-300">
                <AlertTriangle className="h-4 w-4" /> {fehler}
              </p>
            ) : (
              <Loader2 className="h-6 w-6 animate-spin" style={{ color: SAND }} />
            )}
          </div>
        )}
      </div>

      {/* Werkzeuge */}
      <div className="shrink-0 border-t px-3 py-3" style={{ borderColor: "#2b3226", backgroundColor: "#171c14" }}>
        <div className="mb-2.5 flex flex-wrap items-center gap-1.5">
          {(
            [
              ["winkel", "Winkel (3 Punkte)", Triangle],
              ["linie", "Linie (Lot)", Minus],
            ] as const
          ).map(([wert, text, Icon]) => (
            <button
              key={wert}
              type="button"
              onClick={() => {
                setModus(wert)
                setOffen([])
              }}
              className="flex items-center gap-1.5 rounded-lg px-2.5 py-1.5 text-[12px] font-semibold"
              style={
                modus === wert
                  ? { backgroundColor: MARKE, color: "#fff" }
                  : { backgroundColor: "rgba(248,245,240,0.1)", color: "#F8F5F0" }
              }
            >
              <Icon className="h-3.5 w-3.5" />
              {text}
            </button>
          ))}

          <button
            type="button"
            onClick={() => {
              setFormen([])
              setOffen([])
              setGespeichert(false)
              aufnehmen()
            }}
            disabled={nimmtAuf}
            className="flex items-center gap-1.5 rounded-lg px-2.5 py-1.5 text-[12px] font-semibold disabled:opacity-35"
            style={{ backgroundColor: "rgba(248,245,240,0.1)", color: "#F8F5F0" }}
          >
            {nimmtAuf ? <Loader2 className="h-3.5 w-3.5 animate-spin" /> : <Camera className="h-3.5 w-3.5" />}
            Neu aufnehmen
          </button>

          <button
            type="button"
            onClick={() => {
              if (offen.length > 0) setOffen([])
              else setFormen(formen.slice(0, -1))
            }}
            disabled={formen.length === 0 && offen.length === 0}
            className="flex items-center gap-1.5 rounded-lg px-2.5 py-1.5 text-[12px] font-semibold disabled:opacity-35"
            style={{ backgroundColor: "rgba(248,245,240,0.1)", color: "#F8F5F0" }}
          >
            <Undo2 className="h-3.5 w-3.5" />
            Zurück
          </button>

          {alte.length > 0 && (
            <div className="flex items-center gap-1.5">
              <Columns2 className="h-3.5 w-3.5" style={{ color: SAND }} />
              <select
                defaultValue=""
                onChange={(e) => e.target.value && void vergleichLaden(e.target.value)}
                disabled={vergleichLaedt}
                className="rounded-lg px-2 py-1.5 text-[12px]"
                style={{ backgroundColor: "rgba(248,245,240,0.1)", color: "#F8F5F0" }}
              >
                <option value="">Mit früherem Bild vergleichen…</option>
                {alte.map((a) => (
                  <option key={a.id} value={a.id} style={{ color: INK }}>
                    {new Date(a.created_at).toLocaleDateString("de-DE", { timeZone: "Europe/Berlin" })} — {a.titel.slice(0, 40)}
                  </option>
                ))}
              </select>
            </div>
          )}
        </div>

        <div className="flex flex-wrap items-center gap-2">
          <input
            value={titel}
            onChange={(e) => setTitel(e.target.value)}
            placeholder="Was ist zu sehen? z. B. Schulter Abduktion rechts"
            className="min-w-0 flex-1 rounded-lg px-3 py-2 text-[13px] outline-none"
            style={{ backgroundColor: "rgba(248,245,240,0.08)", color: "#F8F5F0", border: `1px solid #2b3226` }}
          />
          <button
            type="button"
            onClick={() => void speichern()}
            disabled={speichert || !bildRef.current}
            className="flex items-center gap-2 rounded-xl px-4 py-2.5 text-[13.5px] font-semibold text-white disabled:opacity-50"
            style={{ backgroundColor: gespeichert ? "#4a6b47" : GREEN }}
          >
            {speichert ? (
              <Loader2 className="h-4 w-4 animate-spin" />
            ) : gespeichert ? (
              <Check className="h-4 w-4" />
            ) : (
              <Save className="h-4 w-4" />
            )}
            {gespeichert ? "In der Akte" : "In die Akte & zeigen"}
          </button>
        </div>

        {fehler && bildRef.current && (
          <p className="mt-2 text-[12px] text-red-300">{fehler}</p>
        )}

        {/* Ein schwarzes Standbild sieht aus wie ein Fehler des Patienten und
            ist keiner — meistens hatte die Kamera schlicht noch kein Bild
            geliefert. */}
        {schwarz && (
          <p className="mt-2 flex items-center gap-1.5 text-[12px]" style={{ color: SAND }}>
            <AlertTriangle className="h-3.5 w-3.5 shrink-0" />
            Das Standbild ist fast schwarz. Läuft seine Kamera? Sonst einfach „Neu aufnehmen".
          </p>
        )}
        <p className="mt-2 text-[11px] leading-relaxed" style={{ color: "rgba(248,245,240,0.55)" }}>
          Winkel in der Bildebene. Keine Kraft-, Gewichts- oder Längenmessung — und Rotationen
          (HWS-Drehung, Hüft-Innenrotation) sind so nicht messbar. Aussagekräftig wird es im
          Vergleich mit gleichem Aufbau.
        </p>
      </div>
    </div>
  )
}

/* ══════════════════════════════════════════════════════════════════════════
   Aufbau-Hilfe — was der Patient auf seinem Schirm sieht
   ══════════════════════════════════════════════════════════════════════════ */

/**
 * Ohne standardisierten Aufbau sind die Winkel Zufallszahlen, und der
 * Vergleich in acht Wochen misst die Kamerahoehe statt den Fortschritt.
 * Deshalb steht die Anleitung beim Patienten, gross, waehrend er sie braucht.
 */
export function AufbauHilfe({
  ansicht,
  gegenueber,
}: {
  ansicht: "seitlich" | "frontal"
  gegenueber: string
}) {
  const schritte =
    ansicht === "seitlich"
      ? [
          "Stell dein Gerät ungefähr hüfthoch auf — Stuhl, Tisch, Fensterbank.",
          "Dreh dich zur Seite, sodass ich dich im Profil sehe.",
          "Geh so weit zurück, bis du ganz im Bild bist, vom Kopf bis zu den Füßen.",
          "Merk dir, wo du stehst — beim nächsten Mal an dieselbe Stelle.",
        ]
      : [
          "Stell dein Gerät ungefähr hüfthoch auf — Stuhl, Tisch, Fensterbank.",
          "Stell dich frontal davor, Füße hüftbreit.",
          "Geh so weit zurück, bis du ganz im Bild bist, vom Kopf bis zu den Füßen.",
          "Merk dir, wo du stehst — beim nächsten Mal an dieselbe Stelle.",
        ]

  return (
    <div className="absolute inset-0 z-20 flex items-center justify-center p-6" style={{ backgroundColor: "rgba(15,18,13,0.94)" }}>
      <div className="w-full max-w-sm">
        <p className="text-[11px] font-semibold uppercase tracking-[0.18em]" style={{ color: SAND }}>
          {gegenueber} bittet dich
        </p>
        <h2
          className="mt-2 text-[22px] leading-snug"
          style={{ fontFamily: "Georgia, 'Times New Roman', serif", fontWeight: 600, color: "#F8F5F0" }}
        >
          Kurz aufbauen, dann schauen wir uns die Bewegung an
        </h2>
        <ol className="mt-5 space-y-3">
          {schritte.map((s, i) => (
            <li key={s} className="flex gap-3">
              <span
                className="flex h-6 w-6 shrink-0 items-center justify-center rounded-full text-[12px] font-bold"
                style={{ backgroundColor: SAND, color: INK }}
              >
                {i + 1}
              </span>
              <span className="text-[14px] leading-relaxed" style={{ color: "rgba(248,245,240,0.9)" }}>
                {s}
              </span>
            </li>
          ))}
        </ol>
        <p className="mt-5 text-[12.5px] leading-relaxed" style={{ color: "rgba(248,245,240,0.55)" }}>
          Lass dir Zeit. Ich sage dir, wenn du gut im Bild bist.
        </p>
      </div>
    </div>
  )
}
