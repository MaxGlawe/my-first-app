"use client"

/**
 * PROJ-28 — Die Schaltzentrale des Behandlers, IM Gespräch.
 *
 * Der Raum war eine Seite, und eine Seite kann man nur verlassen. Wer sie
 * verlässt, lässt den Patienten allein — derselbe Fehler, der schon die
 * Einladungstafel in den Raum gezwungen hat.
 *
 * Deshalb eine Schublade: zu ist der Raum wie zuvor, offen ist er ein
 * Arbeitsplatz. Das Bild rückt zur Seite, statt zu verschwinden. Auf dem
 * Handy zieht sie von unten hoch.
 *
 * ZEIGEN STATT TEILEN — die tragende Entscheidung dieses Bauteils:
 *
 * Der naheliegende Weg wäre, den Bildschirm zu teilen. Wer das tut, zeigt im
 * Zweifel die Patientenliste, den Chat-Posteingang mit fremden Namen oder
 * eine Benachrichtigung, die gerade aufploppt. Einmal unachtsam, und ein
 * Patient sieht die Daten eines anderen — der häufigste Weg, auf dem in
 * Videosprechstunden Daten abfliessen, und meldepflichtig.
 *
 * Hier wird stattdessen GEWORFEN: Der Behandler wählt ein Dokument, und nur
 * dieses eine erscheint beim Patienten. Geworfen wird dabei nicht die Datei,
 * sondern eine kurzlebige signierte Adresse — sie verfällt von selbst, und
 * sie geht nur an den, der ohnehin im Raum sitzt und dessen Befund es ist.
 */

import { useCallback, useEffect, useRef, useState } from "react"
import { PlanImGespraech, type EntwurfsUebung } from "./PlanImGespraech"
import {
  FileText,
  ImageIcon,
  Loader2,
  NotebookPen,
  X,
  Eye,
  EyeOff,
  AlertTriangle,
  Check,
  Dumbbell,
} from "lucide-react"

const PAPER = "#F8F5F0"
const INK = "#12160f"
const GREEN = "#2C3E2D"
const SAND = "#C9B79C"
const LINE = "#e3ddd1"
const serif = { fontFamily: "Georgia, 'Times New Roman', serif", fontWeight: 600 } as const

export interface Wurf {
  dokumentId: string
  url: string
  titel: string
  mime: string
}

interface Dokument {
  id: string
  kategorie: string | null
  titel: string
  mime_type: string | null
  seiten: number | null
  created_at: string
}

const KATEGORIE_TEXT: Record<string, string> = {
  befund: "Befund",
  arztbrief: "Arztbrief",
  bildgebung: "Bildgebung",
  labor: "Labor",
  verordnung: "Verordnung",
  sonstiges: "Sonstiges",
}

function datum(iso: string): string {
  return new Date(iso).toLocaleDateString("de-DE", {
    timeZone: "Europe/Berlin",
    day: "2-digit",
    month: "2-digit",
    year: "2-digit",
  })
}

/* ══════════════════════════════════════════════════════════════════════════
   Akte
   ══════════════════════════════════════════════════════════════════════════ */

function Akte({
  patientId,
  gezeigt,
  onZeigen,
  onZeigenBeenden,
}: {
  patientId: string
  gezeigt: Wurf | null
  onZeigen: (w: Wurf) => void
  onZeigenBeenden: () => void
}) {
  const [dokumente, setDokumente] = useState<Dokument[] | null>(null)
  const [fehler, setFehler] = useState<string | null>(null)
  const [oeffnet, setOeffnet] = useState<string | null>(null)
  const [vorschau, setVorschau] = useState<Wurf | null>(null)

  useEffect(() => {
    let abgebrochen = false
    fetch(`/api/documents?patient_id=${patientId}`)
      .then(async (r) => {
        const j = await r.json()
        if (!r.ok) throw new Error(j.error ?? "Die Akte konnte nicht geladen werden.")
        return j
      })
      .then((d) => {
        if (!abgebrochen) setDokumente(d.dokumente ?? [])
      })
      .catch((e: Error) => !abgebrochen && setFehler(e.message))
    return () => {
      abgebrochen = true
    }
  }, [patientId])

  /**
   * Der signierte Link wird erst beim Öffnen geholt, nicht auf Vorrat für die
   * ganze Liste: Jeder Abruf wird protokolliert, und ein Protokoll, das jeden
   * Blick auf die Liste als „angesehen" verbucht, ist wertlos.
   */
  const oeffnen = useCallback(async (d: Dokument) => {
    setOeffnet(d.id)
    setFehler(null)
    try {
      const r = await fetch(`/api/documents/${d.id}`)
      const j = await r.json()
      if (!r.ok) throw new Error(j.error ?? "Das Dokument konnte nicht geöffnet werden.")
      setVorschau({ dokumentId: d.id, url: j.url, titel: j.titel, mime: j.mime ?? "" })
    } catch (e) {
      setFehler((e as Error).message)
    } finally {
      setOeffnet(null)
    }
  }, [])

  if (fehler && !dokumente) {
    return (
      <div className="flex items-start gap-2 px-4 py-5">
        <AlertTriangle className="mt-0.5 h-4 w-4 shrink-0 text-red-600" />
        <p className="text-[13.5px] leading-relaxed text-red-700">{fehler}</p>
      </div>
    )
  }

  if (!dokumente) {
    return (
      <div className="flex items-center justify-center py-10">
        <Loader2 className="h-5 w-5 animate-spin" style={{ color: GREEN }} />
      </div>
    )
  }

  // ── Vorschau eines geöffneten Dokuments ─────────────────────────────────
  if (vorschau) {
    const istBild = vorschau.mime.startsWith("image/")
    const wirdGezeigt = gezeigt?.dokumentId === vorschau.dokumentId
    return (
      <div className="flex h-full flex-col">
        <div className="flex items-center gap-2 border-b px-3 py-2.5" style={{ borderColor: LINE }}>
          <button
            type="button"
            onClick={() => setVorschau(null)}
            className="rounded-md px-2 py-1 text-[12.5px] font-medium"
            style={{ color: GREEN }}
          >
            ← Akte
          </button>
          <p className="truncate text-[13px] font-medium" style={{ color: INK }}>
            {vorschau.titel}
          </p>
        </div>

        <div className="flex-1 overflow-auto bg-slate-100">
          {istBild ? (
            // eslint-disable-next-line @next/next/no-img-element
            <img src={vorschau.url} alt={vorschau.titel} className="w-full" />
          ) : (
            <iframe src={vorschau.url} title={vorschau.titel} className="h-full w-full" />
          )}
        </div>

        <div className="border-t px-3 py-3" style={{ borderColor: LINE }}>
          {wirdGezeigt ? (
            <button
              type="button"
              onClick={onZeigenBeenden}
              className="flex w-full items-center justify-center gap-2 rounded-xl py-3 text-[14px] font-semibold"
              style={{ backgroundColor: "#fff", color: GREEN, border: `1px solid ${GREEN}` }}
            >
              <EyeOff className="h-4 w-4" />
              Zeigen beenden
            </button>
          ) : (
            <button
              type="button"
              onClick={() => onZeigen(vorschau)}
              className="flex w-full items-center justify-center gap-2 rounded-xl py-3 text-[14px] font-semibold text-white"
              style={{ backgroundColor: GREEN }}
            >
              <Eye className="h-4 w-4" />
              Dem Patienten zeigen
            </button>
          )}
          <p className="mt-2 text-center text-[11.5px] leading-relaxed text-slate-500">
            Er sieht nur dieses Dokument — nicht deinen Bildschirm.
          </p>
        </div>
      </div>
    )
  }

  // ── Liste ───────────────────────────────────────────────────────────────
  if (dokumente.length === 0) {
    return (
      <div className="px-4 py-8 text-center">
        <FileText className="mx-auto h-6 w-6" style={{ color: SAND }} />
        <p className="mt-3 text-[13.5px] leading-relaxed text-slate-600">
          In dieser Akte liegt noch nichts. Bitte den Patienten im Gespräch, seine Befunde
          abzufotografieren — in seiner App unter „Dokumente".
        </p>
      </div>
    )
  }

  return (
    <div className="flex h-full flex-col">
      {gezeigt && (
        <div
          className="flex items-center justify-between gap-2 px-3 py-2"
          style={{ backgroundColor: "#eef2ec" }}
        >
          <p className="truncate text-[12px] font-medium" style={{ color: GREEN }}>
            Wird gezeigt: {gezeigt.titel}
          </p>
          <button
            type="button"
            onClick={onZeigenBeenden}
            className="shrink-0 text-[12px] font-semibold underline"
            style={{ color: GREEN }}
          >
            beenden
          </button>
        </div>
      )}
      <ul className="flex-1 divide-y overflow-auto" style={{ borderColor: LINE }}>
        {dokumente.map((d) => {
          const istBild = (d.mime_type ?? "").startsWith("image/")
          return (
            <li key={d.id}>
              <button
                type="button"
                onClick={() => oeffnen(d)}
                disabled={oeffnet === d.id}
                className="flex w-full items-start gap-3 px-3 py-3 text-left hover:bg-slate-50"
              >
                {oeffnet === d.id ? (
                  <Loader2 className="mt-0.5 h-4 w-4 shrink-0 animate-spin" style={{ color: GREEN }} />
                ) : istBild ? (
                  <ImageIcon className="mt-0.5 h-4 w-4 shrink-0" style={{ color: GREEN }} />
                ) : (
                  <FileText className="mt-0.5 h-4 w-4 shrink-0" style={{ color: GREEN }} />
                )}
                <span className="min-w-0 flex-1">
                  <span className="block truncate text-[13.5px] font-medium" style={{ color: INK }}>
                    {d.titel}
                  </span>
                  <span className="mt-0.5 block text-[11.5px] text-slate-500">
                    {KATEGORIE_TEXT[d.kategorie ?? ""] ?? "Dokument"} · {datum(d.created_at)}
                    {d.seiten && d.seiten > 1 ? ` · ${d.seiten} Seiten` : ""}
                  </span>
                </span>
              </button>
            </li>
          )
        })}
      </ul>
    </div>
  )
}

/* ══════════════════════════════════════════════════════════════════════════
   Notiz
   ══════════════════════════════════════════════════════════════════════════ */

/**
 * Was im Gespräch getippt wird, gehört hinterher in die Akte — nicht in ein
 * zweites Formular. Wer alles zweimal tippt, lässt es beim dritten Mal.
 *
 * Gespeichert wird still, zwei Sekunden nach dem letzten Anschlag. Ein
 * Speichern-Knopf im Gespräch wäre ein Knopf, den jemand vergisst, während er
 * zuhört.
 */
function Notiz({ callId }: { callId: string }) {
  const [text, setText] = useState("")
  const [geladen, setGeladen] = useState(false)
  const [stand, setStand] = useState<"ruht" | "speichert" | "gesichert" | "fehler">("ruht")
  const timer = useRef<ReturnType<typeof setTimeout> | null>(null)

  useEffect(() => {
    fetch(`/api/os/video-calls/${callId}`)
      .then((r) => r.json())
      .then((d) => {
        if (typeof d.notiz === "string") setText(d.notiz)
      })
      .catch(() => {})
      .finally(() => setGeladen(true))
  }, [callId])

  const sichern = useCallback(
    async (wert: string) => {
      setStand("speichert")
      try {
        const r = await fetch("/api/os/video-calls", {
          method: "PATCH",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ id: callId, aktion: "notiz", notiz: wert }),
        })
        setStand(r.ok ? "gesichert" : "fehler")
      } catch {
        setStand("fehler")
      }
    },
    [callId]
  )

  const tippen = (wert: string) => {
    setText(wert)
    setStand("ruht")
    if (timer.current) clearTimeout(timer.current)
    timer.current = setTimeout(() => void sichern(wert), 2000)
  }

  useEffect(() => {
    return () => {
      if (timer.current) clearTimeout(timer.current)
    }
  }, [])

  return (
    <div className="flex h-full flex-col p-3">
      <textarea
        value={text}
        onChange={(e) => tippen(e.target.value)}
        onBlur={() => {
          if (timer.current) clearTimeout(timer.current)
          if (geladen) void sichern(text)
        }}
        placeholder="Was im Gespräch auffällt: Beobachtungen, Absprachen, was als Nächstes ansteht."
        className="flex-1 resize-none rounded-xl border p-3 text-[13.5px] leading-relaxed outline-none focus:ring-2"
        style={{ borderColor: LINE, color: INK, backgroundColor: "#fff" }}
      />
      <p className="mt-2 flex items-center gap-1.5 text-[11.5px] text-slate-500">
        {stand === "speichert" && <Loader2 className="h-3 w-3 animate-spin" />}
        {stand === "gesichert" && <Check className="h-3 w-3" style={{ color: GREEN }} />}
        {stand === "fehler"
          ? "Konnte nicht gesichert werden — der Text bleibt hier stehen."
          : stand === "gesichert"
          ? "Gesichert. Steht nach dem Auflegen beim Gespräch."
          : "Wird von selbst gesichert."}
      </p>
    </div>
  )
}

/* ══════════════════════════════════════════════════════════════════════════
   Schublade
   ══════════════════════════════════════════════════════════════════════════ */

export function Schaltzentrale({
  callId,
  patientId,
  gegenueber,
  offen,
  onSchliessen,
  gezeigt,
  onZeigen,
  onZeigenBeenden,
  entwurf,
  setEntwurf,
  onGesendet,
}: {
  callId: string
  patientId: string
  gegenueber: string
  offen: boolean
  onSchliessen: () => void
  gezeigt: Wurf | null
  onZeigen: (w: Wurf) => void
  onZeigenBeenden: () => void
  /** Der Planentwurf liegt oben, weil der Patient ihn mitwachsen sieht. */
  entwurf: EntwurfsUebung[]
  setEntwurf: (u: EntwurfsUebung[]) => void
  onGesendet: () => void
}) {
  const [reiter, setReiter] = useState<"akte" | "plan" | "notiz">("akte")

  if (!offen) return null

  return (
    <aside
      className="flex w-full shrink-0 flex-col border-l md:w-[380px]"
      style={{ backgroundColor: PAPER, borderColor: LINE }}
      aria-label="Schaltzentrale"
    >
      <div className="flex items-center justify-between border-b px-3 py-2.5" style={{ borderColor: LINE }}>
        <div className="flex gap-1">
          {(
            [
              ["akte", "Akte", FileText],
              ["plan", "Plan", Dumbbell],
              ["notiz", "Notiz", NotebookPen],
            ] as const
          ).map(([wert, text, Icon]) => (
            <button
              key={wert}
              type="button"
              onClick={() => setReiter(wert)}
              className="flex items-center gap-1.5 rounded-lg px-2.5 py-1.5 text-[12.5px] font-semibold"
              style={
                reiter === wert
                  ? { backgroundColor: GREEN, color: "#fff" }
                  : { color: INK, backgroundColor: "transparent" }
              }
            >
              <Icon className="h-3.5 w-3.5" />
              {text}
            </button>
          ))}
        </div>
        <button
          type="button"
          onClick={onSchliessen}
          aria-label="Schaltzentrale schliessen"
          className="rounded-lg p-1.5 hover:bg-slate-200"
          style={{ color: INK }}
        >
          <X className="h-4 w-4" />
        </button>
      </div>

      <div className="min-h-0 flex-1 overflow-hidden">
        {reiter === "akte" ? (
          <Akte
            patientId={patientId}
            gezeigt={gezeigt}
            onZeigen={onZeigen}
            onZeigenBeenden={onZeigenBeenden}
          />
        ) : reiter === "plan" ? (
          <PlanImGespraech
            patientId={patientId}
            gegenueber={gegenueber}
            entwurf={entwurf}
            setEntwurf={setEntwurf}
            onGesendet={onGesendet}
            gezeigt={gezeigt}
            onZeigen={onZeigen}
            onZeigenBeenden={onZeigenBeenden}
          />
        ) : (
          <Notiz callId={callId} />
        )}
      </div>
    </aside>
  )
}

/* ══════════════════════════════════════════════════════════════════════════
   Was der Patient sieht, wenn geworfen wurde
   ══════════════════════════════════════════════════════════════════════════ */

/**
 * Formatfüllend, mit Absender in der Kopfzeile. Der Patient soll nicht raten,
 * warum sein Bild gerade verschwunden ist — es steht dort, wer ihm was zeigt.
 *
 * Das Gespräch läuft darunter weiter: Ton bleibt, die Verbindung bleibt. Es
 * ist ein Blatt, das jemand hochhält, kein Raumwechsel.
 */
export function Gezeigt({ wurf, gegenueber }: { wurf: Wurf; gegenueber: string }) {
  const istBild = wurf.mime.startsWith("image/")
  const istVideo = wurf.mime.startsWith("video/")
  return (
    <div className="absolute inset-0 z-20 flex flex-col" style={{ backgroundColor: "#12150f" }}>
      <div
        className="flex items-center gap-2 px-4 py-2.5"
        style={{ backgroundColor: "rgba(248,245,240,0.95)" }}
      >
        <Eye className="h-4 w-4 shrink-0" style={{ color: GREEN }} />
        <p className="truncate text-[13px]" style={{ color: INK }}>
          <span style={serif}>{gegenueber}</span> zeigt dir: {wurf.titel}
        </p>
      </div>
      <div className="flex-1 overflow-auto bg-white">
        {istVideo ? (
          /*
           * Stumm und in Schleife: Eine Übung sieht man, man hört sie nicht —
           * und der Ton des Gesprächs hat Vorrang. Wer sie noch einmal sehen
           * will, muss nicht bitten; sie läuft weiter.
           */
          <video
            src={wurf.url}
            autoPlay
            loop
            muted
            playsInline
            controls
            className="mx-auto h-full w-full max-w-3xl bg-black object-contain"
          />
        ) : istBild ? (
          // eslint-disable-next-line @next/next/no-img-element
          <img src={wurf.url} alt={wurf.titel} className="mx-auto w-full max-w-3xl" />
        ) : (
          <iframe src={wurf.url} title={wurf.titel} className="h-full w-full" />
        )}
      </div>
    </div>
  )
}
