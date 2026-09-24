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
import { Schaltzentrale, Gezeigt, type Wurf } from "@/components/video/Schaltzentrale"
import { EntwurfStreifen, type EntwurfsUebung } from "@/components/video/PlanImGespraech"
import { HandyGezeigt, type HandyDaten } from "@/components/video/HandyVorschau"
import { Bewegungsbild, AufbauHilfe } from "@/components/video/Bewegungsbild"
import { useSchwebefenster } from "@/components/video/Schwebefenster"
import {
  LiveKitRoom,
  RoomAudioRenderer,
  GridLayout,
  ParticipantTile,
  useTracks,
  useConnectionState,
  useRoomContext,
  useLocalParticipant,
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
  praxisName,
  onBeitreten,
  laedt,
}: {
  anlassText: string
  gegenueber: string
  /** Absender. Nur auf der Gastseite gesetzt — der Behandler weiss, wo er ist. */
  praxisName?: string
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
      {praxisName && (
        <div className="mb-6">
          <p className="text-[17px] leading-none" style={{ ...serif, color: INK }}>
            {praxisName}
          </p>
          <div className="mt-3.5 h-px w-10" style={{ backgroundColor: SAND }} />
        </div>
      )}
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

      {/* Die letzte Sekunde vor dem Betreten ist die, in der jemand zögert. */}
      {praxisName && (
        <p className="mt-3 text-[12.5px] leading-relaxed" style={{ color: GREEN }}>
          Das Gespräch wird nicht aufgezeichnet.
        </p>
      )}
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
  callId,
  patientId,
}: {
  gegenueber: string
  onEnde: () => void
  gastUrl?: string
  qrUrl?: string
  /** Beide nur auf der Therapeutenseite — nur dort gibt es die Schublade. */
  callId?: string
  patientId?: string
}) {
  const [tafelOffen, setTafelOffen] = useState(false)
  const [schubladeOffen, setSchubladeOffen] = useState(false)
  /** Was ICH gerade zeige (Therapeutenseite). */
  const [gezeigt, setGezeigt] = useState<Wurf | null>(null)
  /** Was MIR gerade gezeigt wird (Patientenseite). */
  const [empfangen, setEmpfangen] = useState<Wurf | null>(null)
  /** Der Planentwurf — beim Behandler die Quelle, beim Patienten das Echo. */
  const [entwurf, setEntwurf] = useState<EntwurfsUebung[]>([])
  const [planGesendet, setPlanGesendet] = useState(false)
  /** „So sieht es bei dir aus" — beim Behandler der Schalter, beim Patienten das Bild. */
  const [handy, setHandy] = useState<HandyDaten | null>(null)
  /** Standbild-Werkzeug (nur Behandler) und die Aufbau-Hilfe auf beiden Seiten. */
  const [bewegungsbild, setBewegungsbild] = useState(false)
  const [aufbau, setAufbau] = useState<"seitlich" | "frontal" | null>(null)
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

  /**
   * Der Datenkanal des Raums. Ueber ihn wird geworfen — kein zweiter Weg,
   * kein eigener Server: Beide sitzen ohnehin schon im selben Raum.
   *
   * Empfangen wird nur, was von der Gegenseite kommt; der eigene Wurf kommt
   * nicht zurueck. Unbekannte Nachrichten werden still verworfen, damit eine
   * spaetere Erweiterung eine aeltere Sitzung nicht aus dem Tritt bringt.
   */
  useEffect(() => {
    const empfangenHandler = (nutzlast: Uint8Array) => {
      try {
        const nachricht = JSON.parse(new TextDecoder().decode(nutzlast)) as {
          art?: string
          wurf?: Wurf
          entwurf?: EntwurfsUebung[]
          gesendet?: boolean
          handy?: HandyDaten | null
          ansicht?: "seitlich" | "frontal"
        }
        if (nachricht.art === "zeigen" && nachricht.wurf) setEmpfangen(nachricht.wurf)
        else if (nachricht.art === "zeigen-ende") setEmpfangen(null)
        else if (nachricht.art === "plan") {
          setEntwurf(nachricht.entwurf ?? [])
          setPlanGesendet(Boolean(nachricht.gesendet))
        } else if (nachricht.art === "handy") setHandy(nachricht.handy ?? null)
        else if (nachricht.art === "handy-ende") setHandy(null)
        else if (nachricht.art === "aufbau") setAufbau(nachricht.ansicht ?? "seitlich")
        else if (nachricht.art === "aufbau-ende") setAufbau(null)
      } catch {
        /* Nicht unsere Nachricht. */
      }
    }
    raum.on(RoomEvent.DataReceived, empfangenHandler)
    return () => {
      raum.off(RoomEvent.DataReceived, empfangenHandler)
    }
  }, [raum])

  const senden = useCallback(
    (nachricht: Record<string, unknown>) => {
      const daten = new TextEncoder().encode(JSON.stringify(nachricht))
      void raum.localParticipant.publishData(daten, { reliable: true })
    },
    [raum]
  )

  const zeigen = useCallback(
    (w: Wurf) => {
      setGezeigt(w)
      senden({ art: "zeigen", wurf: w })
    },
    [senden]
  )

  const zeigenBeenden = useCallback(() => {
    setGezeigt(null)
    senden({ art: "zeigen-ende" })
  }, [senden])

  /**
   * Jede Aenderung am Entwurf geht sofort hinueber. Der Patient soll den Plan
   * WACHSEN sehen — das ist der Unterschied zwischen "wir besprechen etwas"
   * und "wir bauen gerade dein Programm".
   *
   * Eine Aenderung nach dem Senden setzt den Vermerk zurueck: Was er sieht,
   * liegt dann nicht mehr so in seiner App.
   */
  const entwurfSetzen = useCallback((u: EntwurfsUebung[]) => {
    setEntwurf(u)
    setPlanGesendet(false)
  }, [])

  const aufbauZeigen = useCallback(
    (ansicht: "seitlich" | "frontal" | null) => {
      setAufbau(ansicht)
      senden(ansicht ? { art: "aufbau", ansicht } : { art: "aufbau-ende" })
    },
    [senden]
  )

  const handyZeigen = useCallback(
    (daten: { uebungen: EntwurfsUebung[]; tage: string[]; wochen: number } | null) => {
      if (!daten) {
        setHandy(null)
        senden({ art: "handy-ende" })
        return
      }
      const voll: HandyDaten = { ...daten, gesendet: planGesendet }
      setHandy(voll)
      senden({ art: "handy", handy: voll })
    },
    [senden, planGesendet]
  )

  useEffect(() => {
    if (!callId || !patientId) return
    senden({ art: "plan", entwurf, gesendet: planGesendet })
    // Laeuft die Handy-Vorschau, traegt sie den Vermerk "liegt in deiner App"
    // sofort mit - das ist der Moment, auf den der Patient wartet.
    if (handy) {
      const voll: HandyDaten = { ...handy, uebungen: entwurf, gesendet: planGesendet }
      setHandy(voll)
      senden({ art: "handy", handy: voll })
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [entwurf, planGesendet, callId, patientId, senden])

  /**
   * Wer neu dazukommt, hat nichts von dem mitbekommen, was vorher ueber den
   * Kanal ging — Nachrichten gehen nur an den, der gerade drin ist. Nach einem
   * Verbindungsabbruch saehe der Patient also ein leeres Bild, waehrend der
   * Behandler ihm laengst etwas zeigt. Deshalb schickt die Therapeutenseite
   * ihren Stand noch einmal, sobald jemand eintritt.
   */
  useEffect(() => {
    if (!callId || !patientId) return
    const eingetreten = () => {
      senden({ art: "plan", entwurf, gesendet: planGesendet })
      if (gezeigt) senden({ art: "zeigen", wurf: gezeigt })
      if (handy) senden({ art: "handy", handy })
      if (aufbau) senden({ art: "aufbau", ansicht: aufbau })
    }
    raum.on(RoomEvent.ParticipantConnected, eingetreten)
    return () => {
      raum.off(RoomEvent.ParticipantConnected, eingetreten)
    }
  }, [raum, senden, entwurf, planGesendet, gezeigt, handy, aufbau, callId, patientId])

  /**
   * Auflegen beendet auch das Zeigen. Sonst bliebe beim Patienten ein Befund
   * stehen, waehrend niemand mehr im Raum ist, der ihn wegnehmen koennte.
   */
  useEffect(() => {
    if (!gezeigt) return
    const aufraeumen = () => senden({ art: "zeigen-ende" })
    raum.on(RoomEvent.Disconnected, aufraeumen)
    return () => {
      raum.off(RoomEvent.Disconnected, aufraeumen)
    }
  }, [raum, gezeigt, senden])

  const alleine = spuren.filter((s) => !s.participant.isLocal).length === 0
  const wackelt =
    zustand === ConnectionState.Reconnecting || zustand === ConnectionState.Connecting

  const hatSchublade = Boolean(callId && patientId)

  /**
   * Das Bild des Gegenuebers fuer das schwebende Fenster. Kein Platzhalter und
   * keine geteilte Flaeche — wer nebenher arbeitet, will den Menschen sehen.
   */
  const { localParticipant } = useLocalParticipant()
  const gegenueberSpur = spuren.find(
    (s) => !s.participant.isLocal && s.source === Track.Source.Camera && s.publication?.track
  )?.publication?.track

  const fenster = useSchwebefenster({
    spur: gegenueberSpur,
    gegenueber,
    mikroAn: localParticipant.isMicrophoneEnabled,
    onMikro: () =>
      void localParticipant.setMicrophoneEnabled(!localParticipant.isMicrophoneEnabled),
    onAuflegen: () => {
      void raum.disconnect()
      onEnde()
    },
  })

  return (
    <div className="flex h-full flex-col" style={{ backgroundColor: "#12150f" }}>
      {/*
        Nebeneinander statt uebereinander: Die Schublade schiebt das Bild zur
        Seite, sie legt sich nicht darueber. Wer arbeitet, soll den Menschen
        weiter sehen — sonst spricht man mit einer Akte statt mit einem
        Patienten. Auf dem Handy wird aus der Spalte ein Blatt von unten.
      */}
      <div className="flex min-h-0 flex-1 flex-col md:flex-row">
      <div className="relative min-h-0 flex-1 overflow-hidden">
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
        {/* Der Plan waechst am unteren Rand mit — nur beim Patienten; der
            Behandler sieht ihn ohnehin in der Schublade. */}
        {!hatSchublade && <EntwurfStreifen uebungen={entwurf} gesendet={planGesendet} />}

        {/* Was mir gezeigt wird — formatfuellend, mit Absender. */}
        {empfangen && <Gezeigt wurf={empfangen} gegenueber={gegenueber} />}

        {/* „So sieht es bei dir aus." Nur beim Patienten: Der Behandler hat
            die Vorschau in seiner Schublade. */}
        {!hatSchublade && handy && <HandyGezeigt daten={handy} gegenueber={gegenueber} />}

        {/* Aufbau-Hilfe sieht nur der Patient — der Behandler hat den Schalter. */}
        {!hatSchublade && aufbau && <AufbauHilfe ansicht={aufbau} gegenueber={gegenueber} />}

        {/* Das Standbild-Werkzeug liegt ueber allem, weil darauf gearbeitet wird. */}
        {hatSchublade && bewegungsbild && (
          <Bewegungsbild
            spur={gegenueberSpur}
            patientId={patientId!}
            gegenueber={gegenueber}
            onSchliessen={() => setBewegungsbild(false)}
            onZeigen={zeigen}
            onAufbau={aufbauZeigen}
            aufbauAn={aufbau !== null}
          />
        )}
      </div>

        {hatSchublade && (
          <Schaltzentrale
            callId={callId!}
            patientId={patientId!}
            gegenueber={gegenueber}
            offen={schubladeOffen}
            onSchliessen={() => setSchubladeOffen(false)}
            gezeigt={gezeigt}
            onZeigen={zeigen}
            onZeigenBeenden={zeigenBeenden}
            entwurf={entwurf}
            setEntwurf={entwurfSetzen}
            onGesendet={() => setPlanGesendet(true)}
            handy={Boolean(handy)}
            onHandy={handyZeigen}
          />
        )}
      </div>

      <RoomAudioRenderer />

      <div className="shrink-0 border-t" style={{ borderColor: "#2b3226" }}>
        <Steuerleiste
          onAuflegen={onEnde}
          onSchublade={hatSchublade ? () => setSchubladeOffen((o) => !o) : undefined}
          schubladeOffen={schubladeOffen}
          onStandbild={hatSchublade ? () => setBewegungsbild((o) => !o) : undefined}
          standbildOffen={bewegungsbild}
          onFenster={
            fenster.verfuegbar
              ? () => (fenster.offen ? fenster.schliessen() : void fenster.oeffnen())
              : undefined
          }
          fensterOffen={fenster.offen}
        />
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
  praxisName,
  patientId,
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
  /** Absender im Warteraum. Nur die Gastseite setzt ihn. */
  praxisName?: string
  /**
   * Wessen Akte in der Schublade liegt. Nur die Therapeutenseite setzt ihn —
   * und nur mit ihm gibt es ueberhaupt eine Schublade.
   */
  patientId?: string
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
          praxisName={praxisName}
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
          callId={callId}
          patientId={patientId}
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
