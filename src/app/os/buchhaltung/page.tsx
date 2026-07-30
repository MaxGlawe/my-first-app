"use client"

/**
 * /os/buchhaltung — Alle Erlöse an einem Ort
 *
 * Führt BGF-Rechnungen, Patienten-Rechnungen und Shop-Verkäufe (Stripe) für
 * einen Zeitraum zusammen. Gedacht für den Monatsabschluss: filtern, Summen
 * prüfen, als CSV für die Buchhaltung ziehen.
 */

import { useState, useEffect, useCallback } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Card, CardContent } from "@/components/ui/card"
import { Skeleton } from "@/components/ui/skeleton"
import {
  Receipt,
  Download,
  AlertTriangle,
  Building2,
  HeartPulse,
  ShoppingBag,
  ExternalLink,
} from "lucide-react"

type Quelle = "bgf" | "patient" | "shop"

interface Posten {
  quelle: Quelle
  nummer: string
  datum: string
  kunde: string
  netto: number
  ust: number
  brutto: number
  mahngebuehren: number
  status: string
  bezahlt: boolean
  pdf_url: string | null
}

interface Summe {
  anzahl: number
  netto: number
  ust: number
  mahngebuehren: number
  brutto: number
  offen: number
}

interface Antwort {
  zeitraum: { von: string; bis: string }
  posten: Posten[]
  summen: { gesamt: Summe; bgf: Summe; patient: Summe; shop: Summe }
  warnungen: string[]
}

const QUELLE_META: Record<Quelle, { label: string; icon: typeof Building2; klasse: string }> = {
  bgf: { label: "BGF", icon: Building2, klasse: "bg-emerald-50 text-emerald-700 border-emerald-200" },
  patient: { label: "Patient", icon: HeartPulse, klasse: "bg-sky-50 text-sky-700 border-sky-200" },
  shop: { label: "Shop", icon: ShoppingBag, klasse: "bg-violet-50 text-violet-700 border-violet-200" },
}

function eur(n: number): string {
  return n.toLocaleString("de-DE", { minimumFractionDigits: 2, maximumFractionDigits: 2 }) + " €"
}

function monatsStart(d = new Date()): string {
  return new Date(d.getFullYear(), d.getMonth(), 1).toISOString().split("T")[0]
}

function heute(): string {
  return new Date().toISOString().split("T")[0]
}

export default function BuchhaltungPage() {
  const [von, setVon] = useState(monatsStart())
  const [bis, setBis] = useState(heute())
  const [daten, setDaten] = useState<Antwort | null>(null)
  const [laden, setLaden] = useState(true)
  const [fehler, setFehler] = useState<string | null>(null)

  const laden_ = useCallback(async () => {
    setLaden(true)
    setFehler(null)
    try {
      const res = await fetch(`/api/admin/buchhaltung?von=${von}&bis=${bis}`)
      if (!res.ok) {
        const j = await res.json().catch(() => ({}))
        throw new Error(j.error ?? "Daten konnten nicht geladen werden.")
      }
      setDaten(await res.json())
    } catch (e) {
      setFehler(e instanceof Error ? e.message : "Unbekannter Fehler.")
    } finally {
      setLaden(false)
    }
  }, [von, bis])

  useEffect(() => {
    laden_()
  }, [laden_])

  function zeitraumPreset(art: "monat" | "vormonat" | "quartal" | "jahr") {
    const j = new Date()
    if (art === "monat") {
      setVon(monatsStart())
      setBis(heute())
    } else if (art === "vormonat") {
      const v = new Date(j.getFullYear(), j.getMonth() - 1, 1)
      setVon(v.toISOString().split("T")[0])
      setBis(new Date(j.getFullYear(), j.getMonth(), 0).toISOString().split("T")[0])
    } else if (art === "quartal") {
      const q = Math.floor(j.getMonth() / 3)
      setVon(new Date(j.getFullYear(), q * 3, 1).toISOString().split("T")[0])
      setBis(heute())
    } else {
      setVon(`${j.getFullYear()}-01-01`)
      setBis(heute())
    }
  }

  /** CSV mit allen Posten — Trennzeichen Semikolon, Komma als Dezimaltrenner. */
  function csvHerunterladen() {
    if (!daten) return
    const kopf = ["Quelle", "Belegnummer", "Datum", "Kunde", "Netto", "USt", "Mahngebuehren", "Brutto", "Status"]
    const zeilen = daten.posten.map((p) =>
      [
        QUELLE_META[p.quelle].label,
        p.nummer,
        p.datum,
        p.kunde.replace(/;/g, ","),
        p.netto.toFixed(2).replace(".", ","),
        p.ust.toFixed(2).replace(".", ","),
        p.mahngebuehren.toFixed(2).replace(".", ","),
        p.brutto.toFixed(2).replace(".", ","),
        p.status,
      ].join(";")
    )
    // BOM, damit Excel die Umlaute richtig liest
    const inhalt = "﻿" + [kopf.join(";"), ...zeilen].join("\r\n")
    const url = URL.createObjectURL(new Blob([inhalt], { type: "text/csv;charset=utf-8" }))
    const a = document.createElement("a")
    a.href = url
    a.download = `Erloese_${von}_bis_${bis}.csv`
    a.click()
    URL.revokeObjectURL(url)
  }

  const s = daten?.summen

  return (
    <div className="container mx-auto py-8 px-4 max-w-6xl space-y-6">
      {/* Kopf */}
      <div className="flex items-start justify-between gap-4 flex-wrap">
        <div className="flex items-center gap-3">
          <div className="h-10 w-10 rounded-xl bg-slate-900 flex items-center justify-center">
            <Receipt className="h-5 w-5 text-white" />
          </div>
          <div>
            <h1 className="text-xl font-bold text-slate-800">Buchhaltung</h1>
            <p className="text-sm text-slate-400">
              Alle Erlöse aus BGF, Praxis und Shop in einem Zeitraum
            </p>
          </div>
        </div>
        <Button
          onClick={csvHerunterladen}
          disabled={!daten || daten.posten.length === 0}
          className="gap-2 bg-slate-900 hover:bg-slate-800"
        >
          <Download className="h-4 w-4" />
          CSV herunterladen
        </Button>
      </div>

      {/* Zeitraum */}
      <Card className="border-slate-200">
        <CardContent className="p-4 flex flex-wrap items-end gap-3">
          <div>
            <label className="text-xs text-slate-500 block mb-1">Von</label>
            <Input type="date" value={von} onChange={(e) => setVon(e.target.value)} className="h-9 w-40" />
          </div>
          <div>
            <label className="text-xs text-slate-500 block mb-1">Bis</label>
            <Input type="date" value={bis} onChange={(e) => setBis(e.target.value)} className="h-9 w-40" />
          </div>
          <div className="flex gap-2 flex-wrap">
            {([
              ["monat", "Dieser Monat"],
              ["vormonat", "Vormonat"],
              ["quartal", "Quartal"],
              ["jahr", "Jahr"],
            ] as const).map(([art, label]) => (
              <Button key={art} variant="outline" size="sm" onClick={() => zeitraumPreset(art)} className="h-9">
                {label}
              </Button>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Warnungen */}
      {daten?.warnungen.map((w) => (
        <div key={w} className="flex items-start gap-2.5 rounded-xl border border-amber-200 bg-amber-50 p-3">
          <AlertTriangle className="h-4 w-4 text-amber-600 mt-0.5 shrink-0" />
          <p className="text-sm text-amber-800">{w}</p>
        </div>
      ))}

      {fehler && (
        <div className="rounded-xl border border-red-200 bg-red-50 p-4 text-sm text-red-700">{fehler}</div>
      )}

      {/* Summen */}
      {laden ? (
        <div className="grid grid-cols-1 sm:grid-cols-4 gap-3">
          {[0, 1, 2, 3].map((i) => <Skeleton key={i} className="h-24 rounded-xl" />)}
        </div>
      ) : s ? (
        <div className="grid grid-cols-1 sm:grid-cols-4 gap-3">
          <Card className="border-slate-300 bg-slate-900 text-white">
            <CardContent className="p-4">
              <p className="text-xs text-white/50 uppercase tracking-wider">Gesamt brutto</p>
              <p className="text-2xl font-bold mt-1">{eur(s.gesamt.brutto)}</p>
              <p className="text-xs text-white/50 mt-1">
                netto {eur(s.gesamt.netto)} · USt. {eur(s.gesamt.ust)}
              </p>
              {s.gesamt.offen > 0 && (
                <p className="text-xs text-amber-300 mt-1">offen: {eur(s.gesamt.offen)}</p>
              )}
            </CardContent>
          </Card>
          {(["bgf", "patient", "shop"] as const).map((q) => {
            const meta = QUELLE_META[q]
            const Icon = meta.icon
            return (
              <Card key={q} className="border-slate-200">
                <CardContent className="p-4">
                  <p className="text-xs text-slate-400 uppercase tracking-wider flex items-center gap-1.5">
                    <Icon className="h-3.5 w-3.5" />
                    {meta.label}
                  </p>
                  <p className="text-2xl font-bold text-slate-800 mt-1">{eur(s[q].brutto)}</p>
                  <p className="text-xs text-slate-400 mt-1">
                    {s[q].anzahl} {s[q].anzahl === 1 ? "Beleg" : "Belege"}
                    {q === "patient" && " · USt.-frei"}
                  </p>
                </CardContent>
              </Card>
            )
          })}
        </div>
      ) : null}

      {/* Posten */}
      <Card className="border-slate-200">
        <CardContent className="p-0">
          {laden ? (
            <div className="p-4 space-y-2">
              {[0, 1, 2, 3, 4].map((i) => <Skeleton key={i} className="h-12 rounded-lg" />)}
            </div>
          ) : !daten || daten.posten.length === 0 ? (
            <div className="p-12 text-center">
              <Receipt className="h-10 w-10 text-slate-200 mx-auto mb-3" />
              <p className="text-sm text-slate-500">Keine Belege in diesem Zeitraum.</p>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead className="bg-slate-50 border-b border-slate-200">
                  <tr className="text-left text-xs uppercase tracking-wider text-slate-400">
                    <th className="px-4 py-3 font-medium">Quelle</th>
                    <th className="px-4 py-3 font-medium">Beleg</th>
                    <th className="px-4 py-3 font-medium">Datum</th>
                    <th className="px-4 py-3 font-medium">Kunde</th>
                    <th className="px-4 py-3 font-medium text-right">Netto</th>
                    <th className="px-4 py-3 font-medium text-right">USt.</th>
                    <th className="px-4 py-3 font-medium text-right">Brutto</th>
                    <th className="px-4 py-3 font-medium">Status</th>
                    <th className="px-4 py-3" />
                  </tr>
                </thead>
                <tbody>
                  {daten.posten.map((p, i) => {
                    const meta = QUELLE_META[p.quelle]
                    return (
                      <tr key={`${p.quelle}-${p.nummer}-${i}`} className="border-b border-slate-100 last:border-0 hover:bg-slate-50/70">
                        <td className="px-4 py-3">
                          <span className={`inline-flex items-center rounded-full border px-2 py-0.5 text-[11px] font-medium ${meta.klasse}`}>
                            {meta.label}
                          </span>
                        </td>
                        <td className="px-4 py-3 font-medium text-slate-700 whitespace-nowrap">{p.nummer}</td>
                        <td className="px-4 py-3 text-slate-500 whitespace-nowrap">
                          {new Date(p.datum).toLocaleDateString("de-DE")}
                        </td>
                        <td className="px-4 py-3 text-slate-600 max-w-[200px] truncate">{p.kunde}</td>
                        <td className="px-4 py-3 text-right tabular-nums text-slate-600">{eur(p.netto)}</td>
                        <td className="px-4 py-3 text-right tabular-nums text-slate-400">
                          {p.ust > 0 ? eur(p.ust) : "—"}
                        </td>
                        <td className="px-4 py-3 text-right tabular-nums font-semibold text-slate-800">{eur(p.brutto)}</td>
                        <td className="px-4 py-3">
                          <span className={`text-xs font-medium ${p.bezahlt ? "text-emerald-600" : "text-amber-600"}`}>
                            {p.bezahlt ? "bezahlt" : p.status}
                          </span>
                        </td>
                        <td className="px-4 py-3 text-right">
                          {p.pdf_url && (
                            <a
                              href={p.pdf_url}
                              target="_blank"
                              rel="noopener noreferrer"
                              className="inline-flex items-center gap-1 text-xs text-slate-400 hover:text-slate-700"
                            >
                              Beleg <ExternalLink className="h-3 w-3" />
                            </a>
                          )}
                        </td>
                      </tr>
                    )
                  })}
                </tbody>
              </table>
            </div>
          )}
        </CardContent>
      </Card>

      <p className="text-xs text-slate-400">
        Patienten-Rechnungen sind als Heilbehandlung nach § 4 Nr. 14 UStG umsatzsteuerfrei.
        Shop-Verkäufe kommen direkt aus Stripe, weil Kaufbeträge nicht in der Datenbank liegen —
        die Belege dazu stellt Stripe bereit.
      </p>
    </div>
  )
}
