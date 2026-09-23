"use client"

/**
 * PROJ-27 — Eigene Steuerleiste.
 *
 * Ersetzt LiveKits mitgelieferte `ControlBar`. Der Praxistest am 23.09.2026
 * hat gezeigt, warum: Die Standardleiste war auf dem dunklen Hintergrund
 * praktisch unsichtbar, und weder das Auflegen noch die Bildschirmfreigabe
 * waren als solche zu erkennen. Wer zum ersten Mal in einem Videogespräch
 * sitzt, sucht dann nach dem roten Hörer — und findet nichts.
 *
 * Deshalb hier:
 *
 *   — GROSSE FLÄCHEN. Mindestens 56 Pixel, damit ein Daumen auf einem Handy
 *     sicher trifft. Ein verfehltes Stummschalten mitten im Satz ist
 *     peinlicher als eine unelegante Leiste.
 *
 *   — TEXT UNTER JEDEM SYMBOL. Ein durchgestrichenes Mikrofon bedeutet für
 *     die eine Hälfte „ist stumm" und für die andere „hier stummschalten".
 *     Das Wort löst den Streit.
 *
 *   — AUFLEGEN STEHT ABSEITS, rot und rechts. Es ist der einzige Knopf, den
 *     man nicht aus Versehen drücken darf.
 *
 *   — BILDSCHIRM TEILEN nur am Rechner. Auf dem Handy kann der Browser es
 *     ohnehin nicht; ein Knopf, der dort nichts tut, ist schlimmer als
 *     keiner.
 */

import { useState } from "react"
import { useLocalParticipant, useRoomContext } from "@livekit/components-react"
import { Track } from "livekit-client"
import { Mic, MicOff, Video, VideoOff, MonitorUp, MonitorX, PhoneOff } from "lucide-react"

const PAPER = "#F8F5F0"
const SAND = "#C9B79C"

function Knopf({
  an,
  aus,
  label,
  onClick,
  gefahr,
  disabled,
}: {
  an: React.ReactNode
  aus: React.ReactNode
  label: string
  onClick: () => void
  /** Rot und abgesetzt — nur fürs Auflegen. */
  gefahr?: boolean
  disabled?: boolean
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      disabled={disabled}
      aria-label={label}
      className="flex min-w-[68px] flex-col items-center justify-center gap-1 rounded-xl px-3 py-2.5 transition-colors disabled:opacity-40"
      style={{
        backgroundColor: gefahr ? "#8c3a2b" : "rgba(248,245,240,0.08)",
        color: gefahr ? "#ffffff" : PAPER,
      }}
    >
      <span className="flex h-6 w-6 items-center justify-center">{an ?? aus}</span>
      <span className="text-[11px] font-medium leading-none">{label}</span>
    </button>
  )
}

export function Steuerleiste({ onAuflegen }: { onAuflegen: () => void }) {
  const raum = useRoomContext()
  const { localParticipant } = useLocalParticipant()
  const [busy, setBusy] = useState(false)

  const mikroAn = localParticipant.isMicrophoneEnabled
  const kameraAn = localParticipant.isCameraEnabled
  const teiltBildschirm = localParticipant.isScreenShareEnabled

  // Auf dem Handy gibt es keine Bildschirmfreigabe im Browser.
  const kannTeilen =
    typeof navigator !== "undefined" &&
    typeof navigator.mediaDevices?.getDisplayMedia === "function"

  async function umschalten(fn: () => Promise<unknown>) {
    if (busy) return
    setBusy(true)
    try {
      await fn()
    } catch (err) {
      console.error("[steuerleiste]", err)
    } finally {
      setBusy(false)
    }
  }

  return (
    <div
      className="flex items-center justify-center gap-2 px-3 py-3"
      style={{ backgroundColor: "#171c14", paddingBottom: "max(0.75rem, env(safe-area-inset-bottom))" }}
    >
      <Knopf
        label={mikroAn ? "Mikrofon" : "Stumm"}
        an={mikroAn ? <Mic className="h-5 w-5" /> : <MicOff className="h-5 w-5" style={{ color: SAND }} />}
        aus={<MicOff className="h-5 w-5" />}
        disabled={busy}
        onClick={() => umschalten(() => localParticipant.setMicrophoneEnabled(!mikroAn))}
      />

      <Knopf
        label={kameraAn ? "Kamera" : "Kamera aus"}
        an={kameraAn ? <Video className="h-5 w-5" /> : <VideoOff className="h-5 w-5" style={{ color: SAND }} />}
        aus={<VideoOff className="h-5 w-5" />}
        disabled={busy}
        onClick={() => umschalten(() => localParticipant.setCameraEnabled(!kameraAn))}
      />

      {kannTeilen && (
        <Knopf
          label={teiltBildschirm ? "Teilen beenden" : "Bildschirm"}
          an={
            teiltBildschirm ? (
              <MonitorX className="h-5 w-5" style={{ color: SAND }} />
            ) : (
              <MonitorUp className="h-5 w-5" />
            )
          }
          aus={<MonitorUp className="h-5 w-5" />}
          disabled={busy}
          onClick={() =>
            umschalten(() =>
              localParticipant.setScreenShareEnabled(!teiltBildschirm, { audio: true })
            )
          }
        />
      )}

      <span aria-hidden className="mx-1 h-10 w-px" style={{ backgroundColor: "rgba(248,245,240,0.12)" }} />

      <Knopf
        label="Auflegen"
        gefahr
        an={<PhoneOff className="h-5 w-5" />}
        aus={<PhoneOff className="h-5 w-5" />}
        disabled={busy}
        onClick={async () => {
          await raum.disconnect()
          onAuflegen()
        }}
      />
    </div>
  )
}

export { Track }
