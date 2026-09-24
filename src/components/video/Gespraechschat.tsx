"use client"

/**
 * PROJ-28 — Ein Zettel, den man im Gespräch hinüberschieben kann.
 *
 * Der Behandler nach der ersten echten Konsultation: „Ich kann zwar den
 * QR-Code per Bildschirmfreigabe teilen, aber wer mit seinem Handy drin ist,
 * kann das ja nicht abfotografieren."
 *
 * Das ist keine Kleinigkeit, sondern ein Konstruktionsfehler: DER QR-CODE
 * SETZT EIN ZWEITES GERÄT VORAUS. Wer am Telefon sitzt, kann seinen eigenen
 * Bildschirm nicht scannen — und ausgerechnet an dieser Stelle steht der
 * Kaufabschluss des 90-Tage-Programms.
 *
 * Ein antippbarer Link löst das. Deshalb dieser Chat: kein zweiter
 * Nachrichtenkanal neben dem, den es in der App schon gibt, sondern ein
 * Notizzettel FÜR DIESES GESPRÄCH.
 *
 * ER IST FLÜCHTIG, UND DAS MIT ABSICHT. Die Nachrichten laufen über denselben
 * Datenkanal wie alles andere und werden nirgends gespeichert. Ein Chat, der
 * das Gespräch überlebt, wäre ein zweiter Posteingang neben dem in der App —
 * und niemand pflegt zwei. Was bleiben soll, gehört in die Notiz oder in den
 * Chat der App; das Angebot geht ohnehin zusätzlich per Mail hinaus.
 */

import { useEffect, useRef, useState } from "react"
import { Send, Link2, Loader2, MessageSquare } from "lucide-react"

const INK = "#12160f"
const GREEN = "#2C3E2D"
const SAND = "#C9B79C"
const LINE = "#e3ddd1"

export interface ChatNachricht {
  id: string
  text: string
  /** Aus Sicht des Empfängers: kam sie von drüben oder von mir? */
  vonMir: boolean
  zeit: string
}

/** Erkennt Adressen im Text und macht sie antippbar — darum geht es hier. */
function MitLinks({ text }: { text: string }) {
  const teile = text.split(/(https?:\/\/[^\s]+)/g)
  return (
    <>
      {teile.map((t, i) =>
        /^https?:\/\//.test(t) ? (
          <a
            key={i}
            href={t}
            target="_blank"
            rel="noopener noreferrer"
            className="break-all font-semibold underline"
          >
            {t}
          </a>
        ) : (
          <span key={i}>{t}</span>
        )
      )}
    </>
  )
}

export function Gespraechschat({
  nachrichten,
  onSenden,
  gegenueber,
  patientId,
  offen,
  onSchliessen,
}: {
  nachrichten: ChatNachricht[]
  onSenden: (text: string) => void
  gegenueber: string
  /** Nur die Therapeutenseite: dann gibt es den Knopf fürs Programm-Angebot. */
  patientId?: string
  offen: boolean
  onSchliessen: () => void
}) {
  const [text, setText] = useState("")
  const [angebotLaedt, setAngebotLaedt] = useState(false)
  const [fehler, setFehler] = useState<string | null>(null)
  const ende = useRef<HTMLDivElement>(null)

  useEffect(() => {
    if (offen) ende.current?.scrollIntoView({ block: "end" })
  }, [nachrichten, offen])

  if (!offen) return null

  const abschicken = () => {
    const wert = text.trim()
    if (!wert) return
    onSenden(wert.slice(0, 500))
    setText("")
  }

  /**
   * Der Link zum 90-Tage-Programm, direkt in den Chat.
   *
   * Gesucht wird zuerst ein OFFENES Angebot. Ein neues entsteht nur auf
   * ausdrückliche Bestätigung: Es legt einen Behandlungsvertrag an und
   * verschickt eine Mail — das passiert nicht aus Versehen, weil jemand im
   * Gespräch auf einen Knopf tippt.
   */
  const angebotSchicken = async () => {
    if (!patientId) return
    setAngebotLaedt(true)
    setFehler(null)
    try {
      const r = await fetch(`/api/os/programm-angebot?patient_id=${patientId}`)
      const j = await r.json()
      if (!r.ok) throw new Error(j.error ?? "Das Angebot konnte nicht geladen werden.")

      // Die Uebersicht nennt das noch zahlbare Angebot beim Namen — genau
      // das wollen wir, nicht das juengste und schon gar nicht ein
      // abgelaufenes.
      let url: string | null = j.offenes_angebot?.url ?? null

      if (!url) {
        const jetztErstellen = confirm(
          `Für ${gegenueber} ist kein Angebot offen. Jetzt eines erstellen?\n\n` +
            `Das legt einen Behandlungsvertrag an und schickt ihn zusätzlich per E-Mail.`
        )
        if (!jetztErstellen) return
        const neu = await fetch("/api/os/programm-angebot", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ patient_id: patientId }),
        })
        const jn = await neu.json()
        if (!neu.ok) throw new Error(jn.error ?? "Das Angebot konnte nicht erstellt werden.")
        url = jn.url ?? null
      }

      if (!url) throw new Error("Es kam kein Link zurück.")
      onSenden(`Hier ist dein Zugang zum 90-Tage-Programm: ${url}`)
    } catch (e) {
      setFehler((e as Error).message)
    } finally {
      setAngebotLaedt(false)
    }
  }

  return (
    <div className="absolute inset-x-0 bottom-0 z-[25] flex max-h-[70%] flex-col rounded-t-2xl shadow-2xl" style={{ backgroundColor: "#F8F5F0" }}>
      <div className="flex items-center gap-2 border-b px-3 py-2.5" style={{ borderColor: LINE }}>
        <MessageSquare className="h-4 w-4 shrink-0" style={{ color: GREEN }} />
        <p className="mr-auto text-[13px] font-semibold" style={{ color: INK }}>
          Nachrichten im Gespräch
        </p>
        <button
          type="button"
          onClick={onSchliessen}
          className="rounded-lg px-2.5 py-1 text-[12px] font-semibold"
          style={{ color: GREEN }}
        >
          Schliessen
        </button>
      </div>

      <div className="min-h-0 flex-1 space-y-2 overflow-auto p-3">
        {nachrichten.length === 0 ? (
          <p className="px-1 py-6 text-center text-[12.5px] leading-relaxed text-slate-500">
            Hier könnt ihr euch Links schicken — antippbar, auch wenn ihr mit dem Handy im
            Gespräch seid. Die Nachrichten bleiben nur für dieses Gespräch.
          </p>
        ) : (
          nachrichten.map((n) => (
            <div key={n.id} className={`flex ${n.vonMir ? "justify-end" : "justify-start"}`}>
              <div
                className="max-w-[85%] rounded-2xl px-3 py-2"
                style={
                  n.vonMir
                    ? { backgroundColor: GREEN, color: "#F8F5F0" }
                    : { backgroundColor: "#fff", color: INK, border: `1px solid ${LINE}` }
                }
              >
                <p className="whitespace-pre-wrap text-[13.5px] leading-relaxed">
                  <MitLinks text={n.text} />
                </p>
                <p className="mt-0.5 text-[10px]" style={{ color: n.vonMir ? SAND : "#94a3b8" }}>
                  {n.zeit}
                </p>
              </div>
            </div>
          ))
        )}
        <div ref={ende} />
      </div>

      {fehler && (
        <p className="px-3 pb-1 text-[12px] leading-relaxed text-red-700">{fehler}</p>
      )}

      <div className="border-t p-3" style={{ borderColor: LINE }}>
        {patientId && (
          <button
            type="button"
            onClick={() => void angebotSchicken()}
            disabled={angebotLaedt}
            className="mb-2 flex w-full items-center justify-center gap-2 rounded-xl py-2.5 text-[13px] font-semibold disabled:opacity-50"
            style={{ backgroundColor: "#fff", color: GREEN, border: `1px solid ${GREEN}` }}
          >
            {angebotLaedt ? <Loader2 className="h-4 w-4 animate-spin" /> : <Link2 className="h-4 w-4" />}
            Link zum 90-Tage-Programm schicken
          </button>
        )}

        <div className="flex items-end gap-2">
          <textarea
            value={text}
            onChange={(e) => setText(e.target.value)}
            onKeyDown={(e) => {
              if (e.key === "Enter" && !e.shiftKey) {
                e.preventDefault()
                abschicken()
              }
            }}
            rows={1}
            placeholder="Nachricht oder Link…"
            className="max-h-24 min-h-[42px] flex-1 resize-none rounded-xl border px-3 py-2.5 text-[13.5px] outline-none"
            style={{ borderColor: LINE, color: INK, backgroundColor: "#fff" }}
          />
          <button
            type="button"
            onClick={abschicken}
            disabled={!text.trim()}
            aria-label="Senden"
            className="flex h-[42px] w-[42px] shrink-0 items-center justify-center rounded-xl text-white disabled:opacity-40"
            style={{ backgroundColor: GREEN }}
          >
            <Send className="h-4 w-4" />
          </button>
        </div>
      </div>
    </div>
  )
}
