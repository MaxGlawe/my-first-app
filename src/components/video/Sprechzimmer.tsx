"use client"

/**
 * PROJ-27 — Das Sprechzimmer.
 *
 * Eine Komponente für beide Seiten. Was Therapeut und Patient unterscheidet,
 * ist die Rolle im Token und was drumherum steht — nicht das Gespräch selbst.
 *
 * Aufbau in drei Zuständen:
 *
 *   1. WARTERAUM — Kamera und Mikrofon prüfen, bevor es zählt. Der Moment, in
 *      dem jemand merkt, dass sein Mikrofon stumm ist, darf nicht der Moment
 *      sein, in dem sein Behandler schon zusieht.
 *   2. GESPRÄCH — Videobild, Ton, Steuerleiste.
 *   3. ENDE — ruhiger Abschluss statt weisser Seite.
 *
 * Bewusst KEIN Alarmrot bei Verbindungsproblemen. Wer gerade über Schmerzen
 * spricht, braucht keine rote Warnung im Bild. Eine ruhige Zeile genügt, und
 * LiveKit verbindet von allein neu.
 */

import { useCallback, useEffect, useRef, useState } from "react"
import {
  LiveKitRoom,
  RoomAudioRenderer,
  GridLayout,
  ParticipantTile,
  useTracks,
  useConnectionState,
  useRoomContext,
} from "@livekit/components-react"
import { Steuerleiste } from "./Steuerleiste"
import { ConnectionState, Track, RoomEvent, VideoPresets } from "livekit-client"
import "@livekit/components-styles"
import { Button } from "@/components/ui/button"
import { Loader2, Mic, Video as VideoIcon, AlertTriangle, PhoneOff, QrCode } from "lucide-react"

const PAPER = "#F8F5F0"
const INK = "#12160f"
const GREEN = "#2C3E2D"
const SAND = "#C9B79C"

const serif = { fontFamily: "Georgia, 'Times New Roman', serif", fontWeight: 600 } as const

interface Zutritt {
  token: string
  url: string
  rolle: "therapeut" | "patient"
  anlass: string
}

/* ══════════════════════════════════════════════════════════════════════════
   Warteraum
   ══════════════════════════════════════════════════════════════════════════ */

function Warteraum({
  anlassText,
  gegenueber,
  onBeitreten,
  laedt,
}: {
  anlassText: string
  gegenueber: string
  onBeitreten: () => void
  laedt: boolean
}) {
  const videoRef = useRef<HTMLVideoElement>(null)
  const [pegel, setPegel] = useState(0)
  const [fehler, setFehler] = useState<string | null>(null)
  const [bereit, setBereit] = useState(false)

  useEffect(() => {
    let stream: MediaStream | null = null
    let audioCtx: AudioContext | null = null
    let frame = 0

    async function start() {
      try {
        stream = await navigator.mediaDevices.getUserMedia({ video: true, audio: true })
        if (videoRef.current) {
          videoRef.current.srcObject = stream
          await videoRef.current.play().catch(() => {})
        }

        // Ein sichtbarer Pegel ist der einzige Weg, bei dem jemand wirklich
        // glaubt, dass sein Mikrofon geht. Eine Beschriftung „Mikrofon aktiv"
        // glaubt niemand, der schon einmal stumm in einer Konferenz sass.
        audioCtx = new AudioContext()
        const quelle = audioCtx.createMediaStreamSource(stream)
        const analyse = audioCtx.createAnalyser()
        analyse.fftSize = 512
        quelle.connect(analyse)
        const daten = new Uint8Array(analyse.frequencyBinCount)

        const messen = () => {
          analyse.getByteTimeDomainData(daten)
          let summe = 0
          for (const wert of daten) summe += (wert - 128) ** 2
          setPegel(Math.min(1, Math.sqrt(summe / daten.length) / 24))
          frame = requestAnimationFrame(messen)
        }
        messen()
        setBereit(true)
      } catch {
        setFehler(
          "Wir konnten nicht auf Kamera und Mikrofon zugreifen. Bitte erlaube den Zugriff im Browser — beim iPhone oben in der Adresszeile."
        )
      }
    }
    start()

    return () => {
      cancelAnimationFrame(frame)
      stream?.getTracks().forEach((t) => t.stop())
      void audioCtx?.close()
    }
  }, [])

  return (
    <div className="mx-auto w-full max-w-lg px-4 py-8">
      <p className="text-[12px] font-semibold uppercase tracking-[0.16em]" style={{ color: GREEN }}>
        {anlassText}
      </p>
      <h1 className="mt-2 text-2xl sm:text-3xl" style={{ ...serif, color: INK }}>
        Kurz prüfen, dann los
      </h1>
      <p className="mt-2 text-[14.5px] leading-relaxed text-slate-600">
        Sieh dich einmal selbst und sprich einen Satz. Wenn sich der Balken bewegt, hört dich {gegenueber} gleich auch.
      </p>

      <div
        className="relative mt-5 aspect-[3/4] w-full overflow-hidden rounded-2xl sm:aspect-video"
        style={{ backgroundColor: "#1a1e16" }}
      >
        <video
          ref={videoRef}
          muted
          playsInline
          className="h-full w-full object-cover"
          style={{ transform: "scaleX(-1)" }}
        />
        {!bereit && !fehler && (
          <div className="absolute inset-0 flex items-center justify-center">
            <Loader2 className="h-6 w-6 animate-spin" style={{ color: SAND }} />
          </div>
        )}
      </div>

      {fehler ? (
        <div className="mt-4 flex items-start gap-2 rounded-xl border border-red-200 bg-red-50 p-3">
          <AlertTriangle className="mt-0.5 h-4 w-4 shrink-0 text-red-600" />
          <p className="text-[13.5px] leading-relaxed text-red-800">{fehler}</p>
        </div>
      ) : (
        <div className="mt-4 flex items-center gap-3">
          <Mic className="h-4 w-4 shrink-0" style={{ color: GREEN }} />
          <div className="h-2 flex-1 overflow-hidden rounded-full bg-slate-200">
            <div
              className="h-full rounded-full transition-[width] duration-75"
              style={{ width: `${Math.round(pegel * 100)}%`, backgroundColor: GREEN }}
            />
          </div>
          <VideoIcon className="h-4 w-4 shrink-0" style={{ color: bereit ? GREEN : "#94a3b8" }} />
        </div>
      )}

      <Button
        size="lg"
        onClick={onBeitreten}
        disabled={laedt || !!fehler}
        className="mt-6 h-13 w-full rounded-xl text-base font-semibold text-white hover:opacity-90"
        style={{ backgroundColor: GREEN }}
      >
        {laedt ? (
          <>
            <Loader2 className="mr-2 h-4 w-4 animate-spin" /> Einen Moment…
          </>
        ) : (
          "Gespräch betreten"
        )}
      </Button>

      <p className="mt-4 text-[12.5px] leading-relaxed text-slate-500">
        Halte dein Handy so, dass du gut zu sehen bist, und such dir Licht von vorn. Ein
        stabiles WLAN ist besser als Mobilfunk.
      </p>
    </div>
  )
}

/* ══════════════════════════════════════════════════════════════════════════
   Einladungstafel — im Raum, nicht daneben
   ══════════════════════════════════════════════════════════════════════════ */

/**
 * Der Praxistest am 23.09.2026 endete daran: Um an den QR-Code zu kommen,
 * musste der Behandler das Gespräch verlassen. Damit war der Patient allein
 * im Raum, und der Weg zu ihm lag ausserhalb.
 *
 * Deshalb liegt die Tafel IM Raum. Sie ist gross genug, dass sie über die
 * Bildschirmfreigabe lesbar ist — genau dafür ist sie da: Bildschirm teilen,
 * der Patient scannt mit dem Handy, fertig.
 */
function Einladungstafel({
  gastUrl,
  qrUrl,
  onSchliessen,
}: {
  gastUrl: string
  qrUrl: string
  onSchliessen: () => void
}) {
  const [kopiert, setKopiert] = useState(false)

  return (
    <div
      className="absolute inset-0 z-20 flex items-center justify-center p-4"
      style={{ backgroundColor: "rgba(18,21,15,0.92)" }}
    >
      <div
        className="w-full max-w-md rounded-2xl p-6 text-center"
        style={{ backgroundColor: PAPER }}
      >
        <h2 className="text-xl" style={{ ...serif, color: INK }}>
          So kommt dein Patient herein
        </h2>
        <p className="mt-1.5 text-[13.5px] leading-relaxed text-slate-600">
          Teile deinen Bildschirm und lass ihn den Code mit der Handykamera scannen. Er braucht
          dafür kein Konto.
        </p>

        <div className="mt-4 flex justify-center">
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img
            src={qrUrl}
            alt="QR-Code zum Sprechzimmer"
            className="h-56 w-56 rounded-xl bg-white p-2"
          />
        </div>

        <p className="mt-3 break-all font-mono text-[11.5px] text-slate-600">{gastUrl}</p>

        <div className="mt-4 flex justify-center gap-2">
          <Button
            size="sm"
            variant="outline"
            onClick={async () => {
              try {
                await navigator.clipboard.writeText(gastUrl)
                setKopiert(true)
                setTimeout(() => setKopiert(false), 2000)
              } catch {
                /* Kopieren kann der Browser verweigern — der Link steht ja da. */
              }
            }}
          >
            {kopiert ? "Kopiert" : "Link kopieren"}
          </Button>
          <Button size="sm" onClick={onSchliessen} style={{ backgroundColor: GREEN }} className="text-white">
            Zurück ins Gespräch
          </Button>
        </div>
      </div>
    </div>
  )
}

/* ══════════════════════════════════════════════════════════════════════════
   Im Gespräch
   ══════════════════════════════════════════════════════════════════════════ */

function Buehne({
  gegenueber,
  onEnde,
  gastUrl,
  qrUrl,
}: {
  gegenueber: string
  onEnde: () => void
  gastUrl?: string
  qrUrl?: string
}) {
  const [tafelOffen, setTafelOffen] = useState(false)
  const zustand = useConnectionState()
  const raum = useRoomContext()
  const spuren = useTracks(
    [
      { source: Track.Source.Camera, withPlaceholder: true },
      { source: Track.Source.ScreenShare, withPlaceholder: false },
    ],
    { onlySubscribed: false }
  )

  useEffect(() => {
    const beendet = () => onEnde()
    raum.on(RoomEvent.Disconnected, beendet)
    return () => {
      raum.off(RoomEvent.Disconnected, beendet)
    }
  }, [raum, onEnde])

  const alleine = spuren.filter((s) => !s.participant.isLocal).length === 0
  const wackelt =
    zustand === ConnectionState.Reconnecting || zustand === ConnectionState.Connecting

  return (
    <div className="flex h-full flex-col" style={{ backgroundColor: "#12150f" }}>
      <div className="relative flex-1 overflow-hidden">
        <GridLayout tracks={spuren} style={{ height: "100%" }}>
          <ParticipantTile />
        </GridLayout>

        {alleine && !wackelt && (
          <div className="pointer-events-none absolute inset-x-0 bottom-24 flex justify-center px-4">
            <p
              className="rounded-full px-4 py-2 text-[13.5px]"
              style={{ backgroundColor: "rgba(18,21,15,0.82)", color: PAPER }}
            >
              {gegenueber} kommt gleich dazu.
            </p>
          </div>
        )}

        {tafelOffen && gastUrl && qrUrl && (
          <Einladungstafel gastUrl={gastUrl} qrUrl={qrUrl} onSchliessen={() => setTafelOffen(false)} />
        )}

        {/* Der Weg zum Patienten, ohne den Raum zu verlassen. */}
        {gastUrl && qrUrl && !tafelOffen && (
          <button
            type="button"
            onClick={() => setTafelOffen(true)}
            className="absolute right-4 top-4 z-10 flex items-center gap-2 rounded-full px-4 py-2.5 text-[13px] font-medium"
            style={{ backgroundColor: "rgba(248,245,240,0.92)", color: GREEN }}
          >
            <QrCode className="h-4 w-4" />
            Patient einladen
          </button>
        )}

        {/* Ruhig, nicht alarmierend — siehe Kopfkommentar. */}
        {wackelt && (
          <div className="pointer-events-none absolute inset-x-0 top-4 flex justify-center px-4">
            <p
              className="flex items-center gap-2 rounded-full px-4 py-2 text-[13px]"
              style={{ backgroundColor: "rgba(18,21,15,0.82)", color: SAND }}
            >
              <Loader2 className="h-3.5 w-3.5 animate-spin" />
              Verbindung wird wiederhergestellt…
            </p>
          </div>
        )}
      </div>

      <RoomAudioRenderer />

      <div className="shrink-0 border-t" style={{ borderColor: "#2b3226" }}>
        <Steuerleiste onAuflegen={onEnde} />
      </div>
    </div>
  )
}

/* ══════════════════════════════════════════════════════════════════════════
   Hülle
   ══════════════════════════════════════════════════════════════════════════ */

export function Sprechzimmer({
  callId,
  gastToken,
  anlassText,
  gegenueber,
  zurueckHref,
  gastUrl,
  qrUrl,
}: {
  /** Zutritt ueber das angemeldete Konto. */
  callId?: string
  /**
   * Zutritt ueber den Gast-Link, ohne Praxis-OS-Konto.
   *
   * Noetig, weil der Patient bei der Videokonsultation noch gar kein Konto
   * hat — er bekommt es erst, wenn er danach das Programm kauft.
   */
  gastToken?: string
  anlassText: string
  gegenueber: string
  zurueckHref: string
  /** Nur die Therapeutenansicht: Einladungstafel im Raum. */
  gastUrl?: string
  qrUrl?: string
}) {
  const [zutritt, setZutritt] = useState<Zutritt | null>(null)
  const [laedt, setLaedt] = useState(false)
  const [fehler, setFehler] = useState<string | null>(null)
  const [beendet, setBeendet] = useState(false)

  const beitreten = useCallback(async () => {
    setLaedt(true)
    setFehler(null)
    try {
      const res = gastToken
        ? await fetch("/api/video/gast", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ token: gastToken }),
          })
        : await fetch("/api/video/token", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ call_id: callId }),
          })
      const json = await res.json()
      if (!res.ok) {
        setFehler(json.error ?? "Der Zutritt wurde abgelehnt.")
        return
      }
      setZutritt(json)
    } catch {
      setFehler("Keine Verbindung zum Server. Bitte noch einmal versuchen.")
    } finally {
      setLaedt(false)
    }
  }, [callId, gastToken])

  if (beendet) {
    return (
      <div className="mx-auto flex min-h-[60vh] max-w-md flex-col items-center justify-center px-4 text-center">
        <h1 className="text-2xl" style={{ ...serif, color: INK }}>
          Das Gespräch ist beendet
        </h1>
        <p className="mt-3 text-[14.5px] leading-relaxed text-slate-600">
          Danke für deine Zeit. Alles Weitere findest du in der App.
        </p>
        <a href={zurueckHref} className="mt-6">
          <Button className="rounded-xl text-white" style={{ backgroundColor: GREEN }}>
            Zurück
          </Button>
        </a>
      </div>
    )
  }

  if (!zutritt) {
    return (
      <>
        <Warteraum
          anlassText={anlassText}
          gegenueber={gegenueber}
          onBeitreten={beitreten}
          laedt={laedt}
        />
        {fehler && (
          <div className="mx-auto mt-2 flex max-w-lg items-start gap-2 px-4 pb-8">
            <AlertTriangle className="mt-0.5 h-4 w-4 shrink-0 text-red-600" />
            <p className="text-[13.5px] leading-relaxed text-red-700">{fehler}</p>
          </div>
        )}
      </>
    )
  }

  return (
    <div className="fixed inset-0 z-50">
      <LiveKitRoom
        token={zutritt.token}
        serverUrl={zutritt.url}
        connect
        video
        audio
        // Ton hat Vorrang vor Bild: Bei knapper Bandbreite lieber ein weicheres
        // Bild als ein stockendes Gespraech. Wer eine Uebung erklaert, muss
        // fluessig zu hoeren sein.
        options={{
          adaptiveStream: true,
          dynacast: true,
          // 1080p statt der Voreinstellung 720p. In diesem Gespraech wird
          // eine Bewegung beurteilt — ob eine Schulter ausweicht, sieht man
          // bei 720p mit sparsamer Bitrate nicht mehr. Der Server traegt das
          // muehelos: Ein Einzelgespraech macht auch so nur wenige Mbit/s.
          videoCaptureDefaults: { resolution: VideoPresets.h1080.resolution },
          publishDefaults: {
            videoEncoding: { maxBitrate: 2_500_000, maxFramerate: 30 },
            // Drei Stufen: Bei schwachem Netz schaltet der Server herunter,
            // statt das Bild einfrieren zu lassen.
            videoSimulcastLayers: [VideoPresets.h360, VideoPresets.h720],
            degradationPreference: "maintain-framerate",
            audioPreset: { maxBitrate: 32_000 },
            red: true,
            dtx: true,
          },
          audioCaptureDefaults: {
            echoCancellation: true,
            noiseSuppression: true,
            autoGainControl: true,
          },
        }}
        onDisconnected={() => setBeendet(true)}
        onError={(e) => setFehler(e.message)}
        style={{ height: "100%" }}
      >
        <Buehne
          gegenueber={gegenueber}
          onEnde={() => setBeendet(true)}
          gastUrl={gastUrl}
          qrUrl={qrUrl}
        />
      </LiveKitRoom>

      {fehler && (
        <div className="absolute inset-x-0 bottom-0 flex items-center gap-2 p-4" style={{ backgroundColor: "rgba(140,58,43,0.95)" }}>
          <PhoneOff className="h-4 w-4 shrink-0 text-white" />
          <p className="text-[13.5px] text-white">{fehler}</p>
        </div>
      )}
    </div>
  )
}
