"use client"

/**
 * PROJ-29 — Der Schnellbauer für Kostenvoranschläge.
 *
 * „Ich brauche vor allem den Builder, wo ich einen solchen sehr sehr schnell
 * erstellen kann — unabhängig von Benutzerkonten, damit ich für jeden
 * Patienten einen erstellen kann, ohne einen Account zu erstellen."
 *
 * Deshalb:
 *
 *   — Ein Bildschirm. Kein Patient suchen, kein Konto anlegen, kein Wizard.
 *     Pflicht ist genau EIN Feld: der Name.
 *
 *   — Das Paket ist vorgewählt und die Summe steht sofort da. Wer am Telefon
 *     gefragt wird „was kostet das denn", soll die Zahl sagen können, bevor
 *     er auf Erstellen drückt.
 *
 *   — Enter im Namensfeld erstellt. Das PDF öffnet sich in einem neuen Tab.
 *
 * Was hier NICHT ist: eine Zeile-für-Zeile-Bearbeitung der GebüH-Positionen.
 * Die Aufstellung kommt aus denselben Konstanten wie die spätere Abrechnung —
 * genau das ist ihr Wert. Wäre sie frei editierbar, könnte der Voranschlag von
 * dem abweichen, was am Ende wirklich berechnet wird.
 */

import { useCallback, useEffect, useMemo, useState } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { AlertTriangle, FileText, Loader2, ExternalLink, Send, Check } from "lucide-react"
import { KV_VARIANTEN, kostenvoranschlagAufstellung, type KvVariante } from "@/lib/abrechnung/kostenvoranschlag"

interface Eintrag {
  id: string
  nummer: string
  empfaenger_name: string
  empfaenger_email: string | null
  variante: string | null
  summe: number
  gueltig_bis: string | null
  created_at: string
  versendet_at: string | null
}

function euro(n: number): string {
  return n.toLocaleString("de-DE", { style: "currency", currency: "EUR" })
}

function datum(iso: string | null): string {
  if (!iso) return "—"
  return new Date(iso).toLocaleDateString("de-DE", {
    day: "2-digit",
    month: "2-digit",
    year: "numeric",
  })
}

export default function KostenvoranschlagPage() {
  const [name, setName] = useState("")
  const [anschrift, setAnschrift] = useState("")
  const [geburtstag, setGeburtstag] = useState("")
  const [email, setEmail] = useState("")
  const [diagnose, setDiagnose] = useState("")
  const [variante, setVariante] = useState<KvVariante>("intensiv")
  const [gueltigTage, setGueltigTage] = useState(30)

  const [busy, setBusy] = useState(false)
  const [fehler, setFehler] = useState<string | null>(null)
  const [letzter, setLetzter] = useState<{ nummer: string; pdf: string; gesendetAn?: string } | null>(
    null
  )
  const [sendetId, setSendetId] = useState<string | null>(null)
  const [liste, setListe] = useState<Eintrag[]>([])

  const aufstellung = useMemo(() => kostenvoranschlagAufstellung(variante), [variante])

  const laden = useCallback(() => {
    fetch("/api/os/kostenvoranschlag")
      .then((r) => (r.ok ? r.json() : { voranschlaege: [] }))
      .then((d) => setListe(d.voranschlaege ?? []))
      .catch(() => setListe([]))
  }, [])

  useEffect(() => {
    laden()
  }, [laden])

  async function erstellen() {
    if (!name.trim() || busy) return
    setBusy(true)
    setFehler(null)
    try {
      const res = await fetch("/api/os/kostenvoranschlag", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          empfaenger_name: name.trim(),
          empfaenger_anschrift: anschrift.trim() || null,
          empfaenger_geburtstag: geburtstag || null,
          empfaenger_email: email.trim() || null,
          diagnose: diagnose.trim() || null,
          variante,
          gueltig_tage: gueltigTage,
        }),
      })
      const json = await res.json()
      if (!res.ok) {
        setFehler(json.error ?? "Der Kostenvoranschlag konnte nicht erstellt werden.")
        return
      }
      // Steht eine Adresse da, geht die Mail sofort raus — das war der ganze
      // Sinn des Feldes. Scheitert sie, ist der Voranschlag trotzdem angelegt
      // und laesst sich aus der Liste erneut senden.
      let gesendetAn: string | undefined
      if (email.trim()) {
        const s = await fetch(json.senden_url, { method: "POST" })
        const sj = await s.json().catch(() => ({}))
        if (s.ok) {
          gesendetAn = sj.an
        } else {
          setFehler(
            `${json.nummer} wurde angelegt, aber der Versand schlug fehl: ` +
              `${sj.error ?? "unbekannter Fehler"}. Du kannst ihn unten erneut senden.`
          )
        }
      }

      setLetzter({ nummer: json.nummer, pdf: json.pdf_url, gesendetAn })
      if (!gesendetAn) window.open(json.pdf_url, "_blank", "noopener")
      // Felder leeren, damit der naechste sofort getippt werden kann — die
      // Diagnose bleibt stehen, die ist beim naechsten oft dieselbe nicht.
      setName("")
      setAnschrift("")
      setGeburtstag("")
      setEmail("")
      setDiagnose("")
      laden()
    } catch {
      setFehler("Verbindungsfehler.")
    } finally {
      setBusy(false)
    }
  }

  /** Nachsenden aus der Liste — auch an eine Adresse, die erst jetzt bekannt ist. */
  async function senden(e: Eintrag) {
    const adresse =
      e.empfaenger_email ||
      window.prompt(`An welche Adresse soll ${e.nummer} gehen?`, "")?.trim() ||
      ""
    if (!adresse) return

    setSendetId(e.id)
    setFehler(null)
    try {
      const res = await fetch(`/api/os/kostenvoranschlag/${e.id}/send`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email: adresse }),
      })
      const json = await res.json().catch(() => ({}))
      if (!res.ok) {
        setFehler(json.error ?? "Der Versand schlug fehl.")
        return
      }
      laden()
    } catch {
      setFehler("Verbindungsfehler beim Versand.")
    } finally {
      setSendetId(null)
    }
  }

  return (
    <div className="container mx-auto max-w-5xl px-4 py-8">
      <div className="mb-6">
        <h1 className="text-3xl font-bold tracking-tight">Kostenvoranschlag</h1>
        <p className="mt-1 text-muted-foreground">
          Für die Einreichung bei einer Versicherung — ohne Patientenkonto, in einem Zug.
        </p>
      </div>

      <div className="grid gap-6 lg:grid-cols-[1fr_320px]">
        {/* ── Formular ─────────────────────────────────────────────── */}
        <div className="rounded-2xl border bg-white p-5">
          <div className="grid gap-4 sm:grid-cols-2">
            <div className="sm:col-span-2">
              <Label htmlFor="kv-name">Name *</Label>
              <Input
                id="kv-name"
                value={name}
                autoFocus
                onChange={(e) => setName(e.target.value)}
                onKeyDown={(e) => {
                  if (e.key === "Enter") void erstellen()
                }}
                placeholder="Vor- und Nachname"
                className="mt-1"
              />
            </div>

            <div className="sm:col-span-2">
              <Label htmlFor="kv-anschrift">Anschrift</Label>
              <Textarea
                id="kv-anschrift"
                value={anschrift}
                onChange={(e) => setAnschrift(e.target.value)}
                placeholder={"Straße und Hausnummer\nPLZ Ort"}
                rows={2}
                className="mt-1"
              />
              <p className="mt-1 text-xs text-muted-foreground">
                Ohne Anschrift bleibt das Adressfeld leer — Versicherungen verlangen sie meist.
              </p>
            </div>

            <div>
              <Label htmlFor="kv-geb">Geburtsdatum</Label>
              <Input
                id="kv-geb"
                type="date"
                value={geburtstag}
                onChange={(e) => setGeburtstag(e.target.value)}
                className="mt-1"
              />
            </div>

            <div>
              <Label htmlFor="kv-tage">Gültig für (Tage)</Label>
              <Input
                id="kv-tage"
                type="number"
                min={1}
                max={365}
                value={gueltigTage}
                onChange={(e) => setGueltigTage(Number(e.target.value) || 30)}
                className="mt-1"
              />
            </div>

            <div className="sm:col-span-2">
              <Label htmlFor="kv-email">E-Mail</Label>
              <Input
                id="kv-email"
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                onKeyDown={(e) => {
                  if (e.key === "Enter") void erstellen()
                }}
                placeholder="name@beispiel.de"
                className="mt-1"
              />
              <p className="mt-1 text-xs text-muted-foreground">
                Steht hier eine Adresse, geht der Voranschlag sofort als PDF per Mail hinaus —
                mit einem Text, den der Patient direkt an seine Versicherung weiterleiten kann.
                Ohne Adresse öffnet sich nur das PDF.
              </p>
            </div>

            <div className="sm:col-span-2">
              <Label htmlFor="kv-diagnose">Diagnose</Label>
              <Input
                id="kv-diagnose"
                value={diagnose}
                onChange={(e) => setDiagnose(e.target.value)}
                placeholder="z. B. Chronische Lumbalgie ohne radikuläre Symptomatik (M54.5)"
                className="mt-1"
              />
            </div>

            <div className="sm:col-span-2">
              <Label>Leistung</Label>
              <div className="mt-2 grid gap-2 sm:grid-cols-3">
                {KV_VARIANTEN.map((v) => (
                  <button
                    key={v.id}
                    type="button"
                    onClick={() => setVariante(v.id)}
                    className={`rounded-xl border p-3 text-left transition ${
                      variante === v.id
                        ? "border-emerald-600 bg-emerald-50"
                        : "border-slate-200 hover:border-slate-300"
                    }`}
                  >
                    <span className="block text-sm font-semibold text-slate-800">{v.name}</span>
                    <span className="mt-0.5 block text-lg font-bold text-slate-900">
                      {euro(v.preis)}
                    </span>
                  </button>
                ))}
              </div>
            </div>
          </div>

          {fehler && (
            <Alert variant="destructive" className="mt-4">
              <AlertTriangle className="h-4 w-4" />
              <AlertDescription>{fehler}</AlertDescription>
            </Alert>
          )}

          <Button
            onClick={() => void erstellen()}
            disabled={!name.trim() || busy}
            size="lg"
            className="mt-5 w-full"
          >
            {busy ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                {email.trim() ? "Wird erstellt und gesendet…" : "Wird erstellt…"}
              </>
            ) : email.trim() ? (
              <>
                <Send className="mr-2 h-4 w-4" /> Erstellen und an {email.trim()} senden
              </>
            ) : (
              <>
                <FileText className="mr-2 h-4 w-4" /> Erstellen und PDF öffnen
              </>
            )}
          </Button>

          {letzter && (
            <p className="mt-3 text-sm text-slate-600">
              <strong>{letzter.nummer}</strong>{" "}
              {letzter.gesendetAn ? (
                <span className="font-semibold text-emerald-700">
                  an {letzter.gesendetAn} verschickt.
                </span>
              ) : (
                "erstellt."
              )}{" "}
              <a
                href={letzter.pdf}
                target="_blank"
                rel="noopener noreferrer"
                className="font-semibold text-emerald-700 underline"
              >
                PDF erneut öffnen
              </a>
            </p>
          )}
        </div>

        {/* ── Vorschau der Aufstellung ─────────────────────────────── */}
        <div className="rounded-2xl border bg-slate-50 p-5">
          <p className="text-sm font-semibold text-slate-800">Das steht darauf</p>
          <ul className="mt-3 space-y-2.5">
            {aufstellung.positionen.map((p, i) => (
              <li key={i} className="text-[12.5px] leading-snug">
                <div className="flex items-baseline justify-between gap-2">
                  <span className="font-mono text-[11px] font-semibold text-emerald-700">
                    {p.ziffer ?? "—"}
                  </span>
                  <span className="whitespace-nowrap tabular-nums text-slate-700">
                    {p.anzahl} × {euro(p.einzelpreis)}
                  </span>
                </div>
                <p className="mt-0.5 text-slate-600">{p.beschreibung}</p>
              </li>
            ))}
          </ul>
          <div className="mt-4 flex items-baseline justify-between border-t pt-3">
            <span className="text-sm font-semibold text-slate-800">Gesamt</span>
            <span className="text-lg font-bold tabular-nums text-slate-900">
              {euro(aufstellung.summe)}
            </span>
          </div>
        </div>
      </div>

      {/* ── Zuletzt erstellt ───────────────────────────────────────── */}
      {liste.length > 0 && (
        <div className="mt-8">
          <h2 className="text-sm font-semibold text-slate-800">Zuletzt erstellt</h2>
          <div className="mt-3 overflow-x-auto rounded-2xl border bg-white">
            <table className="w-full text-sm">
              <thead className="bg-slate-50 text-left text-xs text-slate-500">
                <tr>
                  <th className="px-4 py-2.5 font-medium">Nummer</th>
                  <th className="px-4 py-2.5 font-medium">Empfänger</th>
                  <th className="px-4 py-2.5 font-medium">Gültig bis</th>
                  <th className="px-4 py-2.5 font-medium">Versand</th>
                  <th className="px-4 py-2.5 text-right font-medium">Betrag</th>
                  <th className="px-4 py-2.5" />
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {liste.map((e) => (
                  <tr key={e.id}>
                    <td className="px-4 py-2.5 font-mono text-xs">{e.nummer}</td>
                    <td className="px-4 py-2.5">{e.empfaenger_name}</td>
                    <td className="px-4 py-2.5 text-slate-600">{datum(e.gueltig_bis)}</td>
                    <td className="px-4 py-2.5">
                      {e.versendet_at ? (
                        <span className="inline-flex items-center gap-1 text-xs text-emerald-700">
                          <Check className="h-3.5 w-3.5" />
                          {datum(e.versendet_at)}
                        </span>
                      ) : (
                        <span className="text-xs text-slate-400">—</span>
                      )}
                    </td>
                    <td className="px-4 py-2.5 text-right tabular-nums">{euro(Number(e.summe))}</td>
                    <td className="px-4 py-2.5">
                      <div className="flex items-center justify-end gap-3">
                        <button
                          type="button"
                          onClick={() => void senden(e)}
                          disabled={sendetId === e.id}
                          className="inline-flex items-center gap-1 text-xs font-semibold text-slate-600 hover:text-slate-900 disabled:opacity-40"
                        >
                          {sendetId === e.id ? (
                            <Loader2 className="h-3.5 w-3.5 animate-spin" />
                          ) : (
                            <Send className="h-3.5 w-3.5" />
                          )}
                          {e.versendet_at ? "Erneut" : "Senden"}
                        </button>
                        <a
                          href={`/api/os/kostenvoranschlag/${e.id}/pdf`}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="inline-flex items-center gap-1 text-xs font-semibold text-emerald-700"
                        >
                          PDF <ExternalLink className="h-3 w-3" />
                        </a>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  )
}
