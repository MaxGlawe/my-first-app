"use client"

/**
 * PROJ-26: Angebotsseite des Praxis-OS-Programms.
 *
 * Meist geöffnet, während der Patient noch im Video-Call sitzt — deshalb steht
 * die Aufstellung ganz oben und der vollständige Vertrag darunter, ausklappbar.
 * Die Anrechnung der Konsultation ist eine sichtbare Zeile, kein Rabattcode:
 * wer zwei Tage später entscheidet, sieht exakt dieselbe Rechnung.
 *
 * Ohne BEIDE Checkboxen ist der Knopf gesperrt — dieselbe Regel gilt
 * serverseitig im Checkout. Es sind bewusst zwei: die Honorarvereinbarung
 * („Ich kenne das Honorar und die Abrechnung") und der Widerrufsverzicht nach
 * § 356 Abs. 4 BGB („Fang sofort an"). Wer nur eine bestätigt, hat nicht beide
 * bestätigt — ein gemeinsamer Haken würde genau das verwischen.
 */

import { useRef, useState } from "react"
import { Button } from "@/components/ui/button"
import { Checkbox } from "@/components/ui/checkbox"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { CheckCircle2, AlertTriangle, Clock, ChevronDown, Loader2, ShieldCheck } from "lucide-react"
import type { Leistung, VertragText } from "@/types/contract"

const PAPER = "#F8F5F0"
const INK = "#0f172a"
const MUTED = "#64748b"
const LINE = "#e7e1d6"
const GREEN = "#2C3E2D"
const serif = { fontFamily: "var(--font-serif)", fontWeight: 600 } as const

function euro(n: number): string {
  return n.toLocaleString("de-DE", { style: "currency", currency: "EUR" })
}

function fmtDateTime(iso: string | null): string {
  if (!iso) return "—"
  return new Date(iso).toLocaleString("de-DE", {
    day: "2-digit",
    month: "2-digit",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  })
}

/** Reihenfolge der Paragraphen wie im PDF. */
const SECTIONS: (keyof VertragText)[] = [
  "vertragsparteien",
  "praeambel",
  "leistungsbeschreibung",
  "app_nutzung",
  "rechtsgrundlage",
  "fernbehandlung",
  "verguetung",
  "terminregelung",
  "mitwirkungspflichten",
  "schweigepflicht",
  "haftungsausschluss",
  "datenschutz",
  "widerrufsrecht",
  "kuendigung",
  "urheberrecht",
  "schlussbestimmungen",
  // PROJ-29: Anlage 1 — steht hinten und verschiebt keinen Paragrafen.
  "honorarvereinbarung",
]

export interface ProgrammAngebotViewProps {
  token: string
  contractNumber: string
  patientName: string
  praxisName: string
  behandler: string
  leistungen: Leistung[]
  vertragText: VertragText
  gesamtpreis: number
  bereitsBeglichen: number
  zuZahlen: number
  tage: number
  gueltigBis: string | null
  status: "offen" | "bezahlt" | "abgelaufen" | "ungueltig"
  geradeBezahlt: boolean
}

export function ProgrammAngebotView(props: ProgrammAngebotViewProps) {
  const [honorar, setHonorar] = useState(false)
  const [verzicht, setVerzicht] = useState(false)
  const [busy, setBusy] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [vertragOffen, setVertragOffen] = useState(false)
  const anlageRef = useRef<HTMLPreElement>(null)

  /**
   * Angebote, die vor dem 27.09.2026 ausgestellt wurden, haben die Anlage
   * nicht im gespeicherten Vertragstext — der wird bewusst nie nachträglich
   * verändert, sonst wäre nicht mehr nachweisbar, was jemand gelesen hat.
   *
   * Die Zusammenfassung unten steht für sich und bleibt deshalb Pflicht. Nur
   * der Verweis auf „Anlage 1" wäre dort eine Behauptung über ein Dokument,
   * das dieser Patient nicht hat. Also: kein Verweis, kein Knopf.
   */
  const hatAnlage = Boolean(props.vertragText?.honorarvereinbarung)

  /** Klappt den Vertrag auf und springt zur Anlage — nicht an seinen Anfang. */
  function anlageZeigen() {
    setVertragOffen(true)
    // Nach dem Aufklappen, sonst gibt es das Element noch nicht.
    requestAnimationFrame(() =>
      anlageRef.current?.scrollIntoView({ behavior: "smooth", block: "start" })
    )
  }

  async function bezahlen() {
    if (!honorar || !verzicht) return
    setBusy(true)
    setError(null)
    try {
      const res = await fetch(`/api/contracts/${props.token}/checkout`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ widerrufVerzicht: true, honorarvereinbarung: true }),
      })
      const json = await res.json()
      if (!res.ok || !json.url) {
        setError(json.error ?? "Die Zahlung konnte nicht gestartet werden.")
        setBusy(false)
        return
      }
      window.location.href = json.url
    } catch {
      setError("Verbindungsfehler. Bitte versuche es erneut.")
      setBusy(false)
    }
  }

  // ── Abgeschlossen ────────────────────────────────────────────────────────
  if (props.status === "bezahlt") {
    return (
      <Shell praxisName={props.praxisName}>
        <div className="flex items-start gap-3 rounded-2xl border p-5" style={{ borderColor: LINE, backgroundColor: "rgba(44,62,45,0.05)" }}>
          <CheckCircle2 className="mt-0.5 h-6 w-6 shrink-0" style={{ color: GREEN }} />
          <div>
            <h2 className="text-lg" style={{ ...serif, color: INK }}>
              {props.geradeBezahlt ? "Geschafft — deine Betreuung startet." : "Dieses Angebot ist abgeschlossen."}
            </h2>
            <p className="mt-2 text-sm leading-relaxed" style={{ color: MUTED }}>
              {props.behandler} richtet jetzt deinen persönlichen Plan ein — du bekommst eine
              Nachricht, sobald er bereit ist. Deinen Vertrag ({props.contractNumber}) und die
              Rechnung erhältst du per E-Mail.
            </p>
          </div>
        </div>
      </Shell>
    )
  }

  // ── Nicht (mehr) zahlbar ─────────────────────────────────────────────────
  if (props.status === "abgelaufen" || props.status === "ungueltig") {
    const abgelaufen = props.status === "abgelaufen"
    return (
      <Shell praxisName={props.praxisName}>
        <div className="flex items-start gap-3 rounded-2xl border p-5" style={{ borderColor: LINE, backgroundColor: "#fff" }}>
          <Clock className="mt-0.5 h-6 w-6 shrink-0 text-amber-600" />
          <div>
            <h2 className="text-lg" style={{ ...serif, color: INK }}>
              {abgelaufen ? "Dieses Angebot ist abgelaufen." : "Dieses Angebot ist nicht mehr gültig."}
            </h2>
            <p className="mt-2 text-sm leading-relaxed" style={{ color: MUTED }}>
              {abgelaufen
                ? "Kein Problem — melde dich kurz bei deinem Therapeuten, dann stellt er dir das Angebot neu aus. Deine bereits bezahlte Videokonsultation bleibt selbstverständlich angerechnet."
                : "Bitte wende dich an deinen Therapeuten, wenn du weitermachen möchtest."}
            </p>
          </div>
        </div>
      </Shell>
    )
  }

  // ── Offen ────────────────────────────────────────────────────────────────
  const bezahlt = props.leistungen.filter((l) => l.preis > 0)
  const inklusive = props.leistungen.filter((l) => l.preis === 0)

  return (
    <Shell praxisName={props.praxisName}>
      <p className="text-xs uppercase tracking-[0.18em]" style={{ color: GREEN }}>
        Angebot {props.contractNumber}
      </p>
      <h1 className="mt-2 text-2xl sm:text-3xl" style={{ ...serif, color: INK }}>
        {props.tage} Tage Betreuung
      </h1>
      <p className="mt-2 text-sm leading-relaxed" style={{ color: MUTED }}>
        Hallo {props.patientName.split(" ")[0]}, hier ist dein Angebot aus der Videokonsultation.
      </p>

      {/* Preisaufstellung */}
      <div className="mt-6 rounded-2xl border bg-white p-5" style={{ borderColor: LINE }}>
        <dl className="space-y-2.5 text-sm">
          <div className="flex items-baseline justify-between gap-4">
            <dt style={{ color: INK }}>Betreuung über {props.tage} Tage</dt>
            <dd className="tabular-nums" style={{ color: INK }}>{euro(props.gesamtpreis)}</dd>
          </div>
          <div className="flex items-baseline justify-between gap-4">
            <dt style={{ color: MUTED }}>Videokonsultation — bereits beglichen</dt>
            <dd className="tabular-nums" style={{ color: MUTED }}>− {euro(props.bereitsBeglichen)}</dd>
          </div>
          <div className="border-t pt-3" style={{ borderColor: LINE }}>
            <div className="flex items-baseline justify-between gap-4">
              <dt className="font-bold" style={{ color: INK }}>Jetzt zu zahlen</dt>
              <dd className="text-xl font-bold tabular-nums" style={{ color: INK }}>{euro(props.zuZahlen)}</dd>
            </div>
          </div>
        </dl>
        <p className="mt-3 text-xs leading-relaxed" style={{ color: MUTED }}>
          Heilkundliche Leistung — umsatzsteuerfrei nach § 4 Nr. 14a UStG. Einmalzahlung, kein
          Abonnement, keine Verlängerung.
        </p>
      </div>

      {/* Leistungen */}
      <div className="mt-6">
        <h2 className="text-base" style={{ ...serif, color: INK }}>Das ist enthalten</h2>
        <ul className="mt-3 space-y-2.5">
          {[...bezahlt, ...inklusive].map((l) => (
            <li key={l.beschreibung} className="flex items-start gap-2.5 text-sm leading-relaxed" style={{ color: INK }}>
              <CheckCircle2 className="mt-0.5 h-4 w-4 shrink-0" style={{ color: GREEN }} />
              <span>
                {l.beschreibung}
                {l.details && <span className="block text-xs" style={{ color: MUTED }}>{l.details}</span>}
              </span>
            </li>
          ))}
        </ul>
      </div>

      {/* Vertrag */}
      <div className="mt-6 rounded-2xl border bg-white" style={{ borderColor: LINE }}>
        <button
          type="button"
          onClick={() => setVertragOffen((v) => !v)}
          className="flex w-full items-center justify-between gap-3 p-4 text-left"
        >
          <span className="text-sm font-semibold" style={{ color: INK }}>
            Vollständiger Behandlungsvertrag
          </span>
          <ChevronDown
            className={`h-4 w-4 shrink-0 transition-transform ${vertragOffen ? "rotate-180" : ""}`}
            style={{ color: MUTED }}
          />
        </button>
        {vertragOffen && (
          <div className="max-h-[60vh] overflow-y-auto border-t px-4 py-4" style={{ borderColor: LINE }}>
            {SECTIONS.map((key) => {
              const text = props.vertragText?.[key]
              if (!text) return null
              return (
                <pre
                  key={key}
                  ref={key === "honorarvereinbarung" ? anlageRef : undefined}
                  className="mb-5 whitespace-pre-wrap font-sans text-[13px] leading-relaxed"
                  style={{ color: INK }}
                >
                  {text}
                </pre>
              )
            })}
          </div>
        )}
      </div>

      {/* Honorarvereinbarung — die Zahlen stehen sichtbar da, nicht nur im
          aufklappbaren Vertrag. Wer hier zustimmt, soll wissen wozu. */}
      <div
        className="mt-6 rounded-2xl border p-4"
        style={{ borderColor: honorar ? GREEN : LINE, backgroundColor: honorar ? "rgba(44,62,45,0.05)" : "#fff" }}
      >
        <p className="text-sm font-semibold" style={{ color: INK }}>
          Honorarvereinbarung
        </p>
        <ul className="mt-2 space-y-1.5 text-[13px] leading-relaxed" style={{ color: MUTED }}>
          <li>
            Pauschalhonorar {euro(props.gesamtpreis)} für {props.tage} Tage, abgerechnet nach dem
            Gebührenverzeichnis für Heilpraktiker (GebüH). Die angesetzten Sätze überschreiten
            dessen Rahmen nicht.
          </li>
          <li>
            Du erhältst drei Monatsrechnungen über die tatsächlich erbrachten Leistungen — jede
            mit dem Vermerk, dass sie durch deine Zahlung heute bereits beglichen ist.
          </li>
          <li>
            Gesetzliche Krankenkassen erstatten Heilpraktiker-Leistungen nicht. Bei privater
            Versicherung, Beihilfe oder Zusatzversicherung hängt die Erstattung von deinem Tarif
            ab; eine Zusicherung kann der Behandler nicht geben.
          </li>
          <li>Geschuldet ist die fachgerechte Behandlung, nicht ein bestimmter Erfolg.</li>
        </ul>
        {hatAnlage && (
          <button
            type="button"
            onClick={anlageZeigen}
            className="mt-2.5 text-[13px] font-semibold underline"
            style={{ color: GREEN }}
          >
            Vollständige Honorarvereinbarung lesen
          </button>
        )}

        <label className="mt-3 flex cursor-pointer items-start gap-3 border-t pt-3" style={{ borderColor: LINE }}>
          <Checkbox
            checked={honorar}
            onCheckedChange={(v) => setHonorar(v === true)}
            className="mt-0.5"
            aria-label="Honorarvereinbarung zustimmen"
          />
          <span className="text-[13px] leading-relaxed" style={{ color: INK }}>
            {hatAnlage
              ? "Ich habe die Honorarvereinbarung (Anlage 1 zum Behandlungsvertrag) gelesen und stimme ihr zu."
              : "Ich habe die Honorarvereinbarung gelesen und stimme ihr zu."}
          </span>
        </label>
      </div>

      {/* Widerrufsverzicht */}
      <label
        className="mt-3 flex cursor-pointer items-start gap-3 rounded-2xl border p-4 transition"
        style={{ borderColor: verzicht ? GREEN : LINE, backgroundColor: verzicht ? "rgba(44,62,45,0.05)" : "#fff" }}
      >
        <Checkbox
          checked={verzicht}
          onCheckedChange={(v) => setVerzicht(v === true)}
          className="mt-0.5"
          aria-label="Sofortiger Beginn der Betreuung"
        />
        <span className="text-[13px] leading-relaxed" style={{ color: INK }}>
          Ich verlange ausdrücklich, dass die Betreuung sofort beginnt — vor Ablauf der
          14-tägigen Widerrufsfrist. Mir ist bekannt, dass ich bei einem Widerruf Wertersatz
          für die bis dahin erbrachten Leistungen schulde und mein Widerrufsrecht erlischt,
          sobald die Leistung vollständig erbracht ist.
        </span>
      </label>

      {error && (
        <Alert variant="destructive" className="mt-4">
          <AlertTriangle className="h-4 w-4" />
          <AlertDescription>{error}</AlertDescription>
        </Alert>
      )}

      <Button
        onClick={bezahlen}
        disabled={!honorar || !verzicht || busy}
        size="lg"
        className="mt-5 w-full py-6 text-base font-bold"
        style={{ backgroundColor: GREEN }}
      >
        {busy ? (
          <>
            <Loader2 className="mr-2 h-4 w-4 animate-spin" /> Wird vorbereitet…
          </>
        ) : (
          <>Jetzt {euro(props.zuZahlen)} bezahlen und starten</>
        )}
      </Button>

      <div className="mt-3 flex items-start gap-2 text-xs leading-relaxed" style={{ color: MUTED }}>
        <ShieldCheck className="mt-0.5 h-4 w-4 shrink-0" />
        <span>
          Zahlung über Stripe — Karte oder Klarna. Ob Klarna eine Ratenzahlung anbietet,
          entscheidet Klarna nach eigener Prüfung.
          {props.gueltigBis && <> Dieses Angebot gilt bis {fmtDateTime(props.gueltigBis)}.</>}
        </span>
      </div>
    </Shell>
  )
}

function Shell({ children, praxisName }: { children: React.ReactNode; praxisName: string }) {
  return (
    <div className="min-h-screen" style={{ backgroundColor: PAPER }}>
      <div className="mx-auto max-w-2xl px-4 py-10 sm:py-14">
        <div className="mb-8 flex items-center gap-2">
          <span className="h-2 w-2 rounded-full" style={{ backgroundColor: GREEN }} />
          <span className="text-sm font-semibold" style={{ color: INK }}>{praxisName}</span>
          <span className="text-xs" style={{ color: MUTED }}>· Praxis OS</span>
        </div>
        {children}
        <p className="mt-10 text-center text-xs" style={{ color: MUTED }}>
          <a href="/impressum" className="underline">Impressum</a>
          {" · "}
          <a href="/datenschutz" className="underline">Datenschutz</a>
          {" · "}
          <a href="/widerruf" className="underline">Widerrufsrecht</a>
        </p>
      </div>
    </div>
  )
}
