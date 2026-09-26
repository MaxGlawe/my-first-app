"use client"

/**
 * PROJ-27 — Videotermin anlegen.
 *
 * Vier Angaben: wer, wann, wie lange, worum. Mehr braucht es nicht, und
 * alles Weitere würde den Vorgang verlangsamen, den der Behandler
 * wahrscheinlich zehnmal am Tag macht.
 *
 * Zwei Entscheidungen:
 *
 *   — DATUM UND UHRZEIT sind mit sinnvollen Werten vorbelegt: der nächste
 *     volle Viertelstundenschritt. Wer sofort sprechen will, drückt einfach
 *     ab; wer plant, ändert die Zeit. Ein leeres Datumsfeld wäre bei jedem
 *     einzelnen Termin Tipparbeit.
 *
 *   — DIE EINLADUNG GEHT VORGEWÄHLT RAUS. Ein angelegter Termin, von dem
 *     der Patient nichts weiss, ist kein Termin. Abwählen kann man es, wenn
 *     man ihn gerade am Telefon hat und den Link selbst durchgibt.
 */

import { useEffect, useMemo, useState } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import { Loader2, AlertTriangle, Search, Check } from "lucide-react"

const GREEN = "#2C3E2D"

type Anlass = "konsultation" | "programm_sitzung" | "verschlechterung" | "sonstiges"

const ANLAESSE: { id: Anlass; label: string; dauer: number }[] = [
  { id: "konsultation", label: "Videokonsultation", dauer: 30 },
  { id: "programm_sitzung", label: "Programm-Sitzung", dauer: 30 },
  { id: "verschlechterung", label: "Zusätzliche Sitzung", dauer: 30 },
  { id: "sonstiges", label: "Sonstiges", dauer: 30 },
]

interface Patient {
  id: string
  vorname: string | null
  nachname: string | null
  email: string | null
}

/** Nächster voller Viertelstundenschritt, mindestens fünf Minuten voraus. */
function naechsterSlot(): { datum: string; zeit: string } {
  const d = new Date(Date.now() + 5 * 60_000)
  d.setMinutes(Math.ceil(d.getMinutes() / 15) * 15, 0, 0)
  const pad = (n: number) => String(n).padStart(2, "0")
  return {
    datum: `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}`,
    zeit: `${pad(d.getHours())}:${pad(d.getMinutes())}`,
  }
}

export function TerminAnlegen({ onFertig }: { onFertig: () => void }) {
  const vorgabe = useMemo(naechsterSlot, [])

  const [suche, setSuche] = useState("")
  const [treffer, setTreffer] = useState<Patient[]>([])
  const [patient, setPatient] = useState<Patient | null>(null)
  const [anlass, setAnlass] = useState<Anlass>("konsultation")
  const [datum, setDatum] = useState(vorgabe.datum)
  const [zeit, setZeit] = useState(vorgabe.zeit)
  const [dauer, setDauer] = useState(30)
  const [hinweis, setHinweis] = useState("")
  const [einladen, setEinladen] = useState(true)
  const [busy, setBusy] = useState(false)
  const [fehler, setFehler] = useState<string | null>(null)

  /**
   * SCHNELLANLAGE — der Weg fuer alle, die noch nicht in der Akte stehen.
   *
   * Wer die Videokonsultation auf der Website bucht, ist in Praxis OS
   * niemand: Das Buchungstool schickt (Stand 26.09.2026) keine Ereignisse
   * herueber, also entsteht kein Datensatz. Dasselbe gilt fuer jemanden aus
   * der Krankengymnastik, den es hier noch nicht gibt.
   *
   * Ein KONTO braucht dafuer niemand — der Gast-Link kommt ohne Anmeldung
   * aus. Was es braucht, ist ein PATIENTENDATENSATZ, denn an ihm haengt
   * alles Klinische: Akte, Bewegungsbild, Plan, Notiz. Ein Termin ohne
   * Datensatz waere ein Gespraech, das nirgends stattgefunden hat.
   *
   * Also: nicht den Datensatz abschaffen, sondern die Reibung. Vier Felder,
   * hier, ohne die Seite zu wechseln.
   */
  const [neuOffen, setNeuOffen] = useState(false)
  const [nVorname, setNVorname] = useState("")
  const [nNachname, setNNachname] = useState("")
  const [nEmail, setNEmail] = useState("")
  const [nGeburt, setNGeburt] = useState("")
  const [nGeschlecht, setNGeschlecht] = useState<
    "weiblich" | "maennlich" | "divers" | "unbekannt"
  >("unbekannt")
  const [legtAn, setLegtAn] = useState(false)

  async function neuAnlegen() {
    setLegtAn(true)
    setFehler(null)
    try {
      const res = await fetch("/api/patients", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          vorname: nVorname.trim(),
          nachname: nNachname.trim(),
          email: nEmail.trim(),
          geburtsdatum: nGeburt,
          geschlecht: nGeschlecht,
        }),
      })
      const j = await res.json()
      if (!res.ok) {
        setFehler(j.error ?? "Der Patient konnte nicht angelegt werden.")
        return
      }
      const angelegt = j.patient ?? j
      setPatient({
        id: angelegt.id,
        vorname: angelegt.vorname ?? nVorname.trim(),
        nachname: angelegt.nachname ?? nNachname.trim(),
        email: angelegt.email ?? nEmail.trim(),
      })
      setNeuOffen(false)
    } catch {
      setFehler("Verbindungsfehler. Bitte erneut versuchen.")
    } finally {
      setLegtAn(false)
    }
  }

  useEffect(() => {
    if (patient || suche.trim().length < 2) {
      setTreffer([])
      return
    }
    const ab = new AbortController()
    const t = setTimeout(() => {
      fetch(`/api/patients?search=${encodeURIComponent(suche.trim())}&pageSize=8&scope=all`, {
        signal: ab.signal,
      })
        .then((r) => (r.ok ? r.json() : null))
        .then((d) => setTreffer(d?.patients ?? d?.data ?? []))
        .catch(() => {})
    }, 250)
    return () => {
      clearTimeout(t)
      ab.abort()
    }
  }, [suche, patient])

  async function anlegen() {
    if (!patient) {
      setFehler("Bitte zuerst einen Patienten auswählen.")
      return
    }
    setBusy(true)
    setFehler(null)
    try {
      // Lokale Zeit in einen echten Zeitpunkt wandeln. `new Date("...")` mit
      // Datum und Uhrzeit ohne Zeitzone nimmt die des Browsers — genau das
      // ist hier richtig: Der Behandler denkt in seiner Ortszeit.
      const geplant = new Date(`${datum}T${zeit}:00`)
      if (Number.isNaN(geplant.getTime())) {
        setFehler("Datum oder Uhrzeit sind nicht lesbar.")
        return
      }

      const res = await fetch("/api/os/video-calls", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          patient_id: patient.id,
          anlass,
          geplant_at: geplant.toISOString(),
          dauer_minuten: dauer,
          hinweis: hinweis.trim() || null,
          einladen,
        }),
      })
      const json = await res.json()
      if (!res.ok) {
        setFehler(json.error ?? "Der Termin konnte nicht angelegt werden.")
        return
      }
      if (json.einladungFehler) {
        // Der Termin steht — nur die Mail nicht. Das ist eine Warnung, kein
        // Fehlschlag: Nachschicken geht jederzeit.
        setFehler(`Termin angelegt, aber: ${json.einladungFehler}`)
        setTimeout(onFertig, 2500)
        return
      }
      onFertig()
    } catch {
      setFehler("Verbindungsfehler. Bitte erneut versuchen.")
    } finally {
      setBusy(false)
    }
  }

  return (
    <div>
      {/* Patient */}
      <label className="text-[12px] font-semibold uppercase tracking-wide text-slate-500">
        Patient
      </label>
      {patient ? (
        <div className="mt-1.5 flex items-center gap-2 rounded-xl border border-[#2C3E2D] bg-white px-3 py-2.5">
          <Check className="h-4 w-4 shrink-0 text-emerald-600" />
          <span className="min-w-0 flex-1 truncate text-[14px] text-slate-900">
            {[patient.vorname, patient.nachname].filter(Boolean).join(" ")}
            {patient.email && <span className="text-slate-500"> · {patient.email}</span>}
          </span>
          <button
            type="button"
            onClick={() => {
              setPatient(null)
              setSuche("")
            }}
            className="shrink-0 text-[12.5px] text-slate-500 underline"
          >
            ändern
          </button>
        </div>
      ) : (
        <div className="relative mt-1.5">
          <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
          <Input
            value={suche}
            onChange={(e) => setSuche(e.target.value)}
            placeholder="Name oder E-Mail eingeben"
            className="bg-white pl-9"
          />
          {treffer.length > 0 && (
            <ul className="absolute z-20 mt-1 max-h-60 w-full overflow-auto rounded-xl border border-slate-200 bg-white shadow-lg">
              {treffer.map((p) => (
                <li key={p.id}>
                  <button
                    type="button"
                    onClick={() => setPatient(p)}
                    className="w-full px-3 py-2.5 text-left text-[14px] hover:bg-slate-50"
                  >
                    <span className="font-medium text-slate-900">
                      {[p.vorname, p.nachname].filter(Boolean).join(" ")}
                    </span>
                    {p.email && <span className="block text-[12.5px] text-slate-500">{p.email}</span>}
                  </button>
                </li>
              ))}
            </ul>
          )}
          {!patient && !neuOffen && suche.trim().length >= 2 && treffer.length === 0 && (
            <div className="mt-1.5 flex flex-wrap items-center gap-2">
              <p className="text-[12.5px] text-slate-500">Kein Treffer.</p>
              <button
                type="button"
                onClick={() => {
                  // Was schon getippt wurde, ist meistens der Name — oder die
                  // Mailadresse. Uebernehmen statt abtippen lassen.
                  const roh = suche.trim()
                  if (roh.includes("@")) setNEmail(roh)
                  else {
                    const teile = roh.split(/\s+/)
                    setNVorname(teile[0] ?? "")
                    setNNachname(teile.slice(1).join(" "))
                  }
                  setNeuOffen(true)
                }}
                className="text-[12.5px] font-semibold underline"
                style={{ color: "#2C3E2D" }}
              >
                Neuen Patienten anlegen
              </button>
            </div>
          )}
        </div>
      )}

      {/* Schnellanlage — vier Felder, ohne die Seite zu wechseln. */}
      {neuOffen && !patient && (
        <div className="mt-2 rounded-xl border border-[#e7e1d6] bg-[#F8F5F0] p-3">
          <div className="flex items-center justify-between">
            <p className="text-[12px] font-semibold uppercase tracking-wide text-slate-500">
              Neuer Patient
            </p>
            <button
              type="button"
              onClick={() => setNeuOffen(false)}
              className="text-[12.5px] text-slate-500 underline"
            >
              abbrechen
            </button>
          </div>

          <div className="mt-2 grid grid-cols-2 gap-2">
            <Input
              value={nVorname}
              onChange={(e) => setNVorname(e.target.value)}
              placeholder="Vorname"
              className="bg-white"
            />
            <Input
              value={nNachname}
              onChange={(e) => setNNachname(e.target.value)}
              placeholder="Nachname"
              className="bg-white"
            />
            <Input
              value={nEmail}
              onChange={(e) => setNEmail(e.target.value)}
              type="email"
              placeholder="E-Mail"
              className="col-span-2 bg-white"
            />
            <Input
              value={nGeburt}
              onChange={(e) => setNGeburt(e.target.value)}
              type="date"
              className="bg-white"
            />
            <select
              value={nGeschlecht}
              onChange={(e) =>
                setNGeschlecht(e.target.value as "weiblich" | "maennlich" | "divers" | "unbekannt")
              }
              className="rounded-md border border-slate-200 bg-white px-2 text-[14px]"
            >
              <option value="unbekannt">Geschlecht (offen)</option>
              <option value="weiblich">weiblich</option>
              <option value="maennlich">männlich</option>
              <option value="divers">divers</option>
            </select>
          </div>

          <p className="mt-2 text-[11.5px] leading-relaxed text-slate-500">
            Die E-Mail-Adresse braucht die Einladung. Das Geburtsdatum ist Pflichtfeld der
            Akte — ein Konto bekommt er dadurch nicht, der Gast-Link kommt ohne aus.
          </p>

          <Button
            type="button"
            size="sm"
            onClick={() => void neuAnlegen()}
            disabled={
              legtAn ||
              !nVorname.trim() ||
              !nNachname.trim() ||
              !nEmail.trim() ||
              !/^\d{4}-\d{2}-\d{2}$/.test(nGeburt)
            }
            className="mt-2.5 w-full bg-[#2C3E2D] hover:bg-[#24321f]"
          >
            {legtAn ? "Wird angelegt…" : "Anlegen und Termin geben"}
          </Button>
        </div>
      )}

      {/* Anlass */}
      <label className="mt-4 block text-[12px] font-semibold uppercase tracking-wide text-slate-500">
        Anlass
      </label>
      <div className="mt-1.5 flex flex-wrap gap-1.5">
        {ANLAESSE.map((a) => (
          <button
            key={a.id}
            type="button"
            onClick={() => {
              setAnlass(a.id)
              setDauer(a.dauer)
            }}
            className={`rounded-full border px-3 py-1.5 text-[12.5px] transition-colors ${
              anlass === a.id
                ? "border-[#2C3E2D] bg-white font-medium text-slate-900"
                : "border-slate-200 bg-white/60 text-slate-600 hover:bg-white"
            }`}
          >
            {a.label}
          </button>
        ))}
      </div>

      {/* Zeit */}
      <div className="mt-4 grid gap-3 sm:grid-cols-3">
        <div>
          <label className="text-[12px] font-semibold uppercase tracking-wide text-slate-500">
            Datum
          </label>
          <Input
            type="date"
            value={datum}
            onChange={(e) => setDatum(e.target.value)}
            className="mt-1.5 bg-white"
          />
        </div>
        <div>
          <label className="text-[12px] font-semibold uppercase tracking-wide text-slate-500">
            Uhrzeit
          </label>
          <Input
            type="time"
            value={zeit}
            onChange={(e) => setZeit(e.target.value)}
            className="mt-1.5 bg-white"
          />
        </div>
        <div>
          <label className="text-[12px] font-semibold uppercase tracking-wide text-slate-500">
            Dauer
          </label>
          <select
            value={dauer}
            onChange={(e) => setDauer(Number(e.target.value))}
            className="mt-1.5 h-10 w-full rounded-md border border-slate-200 bg-white px-3 text-[14px]"
          >
            {[15, 20, 30, 45, 60].map((m) => (
              <option key={m} value={m}>
                {m} Minuten
              </option>
            ))}
          </select>
        </div>
      </div>

      {/* Vorbereitung */}
      <label className="mt-4 block text-[12px] font-semibold uppercase tracking-wide text-slate-500">
        Soll der Patient etwas vorbereiten? <span className="normal-case text-slate-400">(freiwillig)</span>
      </label>
      <Textarea
        value={hinweis}
        onChange={(e) => setHinweis(e.target.value)}
        rows={2}
        maxLength={500}
        placeholder="Zieh dir bitte etwas an, in dem du dich gut bewegen kannst. Leg deinen MRT-Befund bereit."
        className="mt-1.5 bg-white"
      />

      <label className="mt-4 flex cursor-pointer items-start gap-2.5">
        <input
          type="checkbox"
          checked={einladen}
          onChange={(e) => setEinladen(e.target.checked)}
          className="mt-0.5 h-4 w-4 accent-[#2C3E2D]"
        />
        <span className="text-[13px] leading-relaxed text-slate-600">
          Einladung sofort per E-Mail verschicken — mit Kalendereintrag und Zugang.
          <span className="block text-slate-500">
            Ohne Haken steht der Termin nur bei dir; du kannst die Einladung später nachschicken.
          </span>
        </span>
      </label>

      {fehler && (
        <p className="mt-3 flex items-start gap-1.5 text-[13px] text-red-600">
          <AlertTriangle className="mt-0.5 h-3.5 w-3.5 shrink-0" />
          {fehler}
        </p>
      )}

      <Button
        onClick={anlegen}
        disabled={busy || !patient}
        className="mt-4 text-white"
        style={{ backgroundColor: GREEN }}
      >
        {busy ? (
          <>
            <Loader2 className="mr-2 h-4 w-4 animate-spin" /> Wird angelegt…
          </>
        ) : einladen ? (
          "Termin anlegen und einladen"
        ) : (
          "Termin anlegen"
        )}
      </Button>
    </div>
  )
}
