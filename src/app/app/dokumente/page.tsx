"use client"

/**
 * PROJ-27 — Meine Unterlagen (Patientenseite).
 *
 * Der Grund, warum diese Seite existiert: Ein Heilpraktiker behandelt ohne
 * aerztliche Verordnung und arbeitet deshalb mit dem, was der Patient
 * mitbringt — Arztbriefe, MRT-Befunde, OP-Berichte. Bisher gab es dafuer
 * keinen Weg ausser E-Mail.
 *
 * Bewusst ohne Papierkorb und ohne "Loeschen": Was hier liegt, gehoert zur
 * Behandlungsdokumentation. Der Patient kann melden, dass etwas nicht
 * stimmt — dann kuemmert sich die Praxis.
 */

import Link from "next/link"
import { Button } from "@/components/ui/button"
import { Loader2, ArrowLeft, AlertTriangle } from "lucide-react"
import { DokumentUpload } from "@/components/app/DokumentUpload"
import { DokumentListe, useDokumente } from "@/components/app/DokumentListe"

const INK = "#12160f"
const GREEN = "#2C3E2D"
const serif = { fontFamily: "Georgia, 'Times New Roman', serif", fontWeight: 600 } as const

export default function MeineDokumentePage() {
  const { dokumente, laedt, fehler, laden } = useDokumente()

  return (
    <div className="min-h-screen" style={{ backgroundColor: "#faf9f7" }}>
      <div className="container mx-auto max-w-lg px-4 py-8 pb-24">
        <Link href="/app/dashboard" className="inline-flex items-center text-[13px] text-slate-500 hover:text-slate-800">
          <ArrowLeft className="mr-1 h-3.5 w-3.5" /> Übersicht
        </Link>

        <h1 className="mt-4 text-2xl sm:text-3xl" style={{ ...serif, color: INK }}>
          Meine Unterlagen
        </h1>
        <p className="mt-2 text-[14.5px] leading-relaxed text-slate-600">
          Arztbriefe, Befunde und Aufnahmen. Fotografiere sie einfach ab — dein Behandler sieht
          sie dann vor eurem Gespräch.
        </p>

        <div className="mt-6">
          <DokumentUpload onFertig={laden} />
        </div>

        <div className="mt-8">
          <h2 className="text-[12px] font-semibold uppercase tracking-wide text-slate-500">
            In deiner Akte
          </h2>

          {laedt && (
            <div className="flex justify-center py-8">
              <Loader2 className="h-5 w-5 animate-spin" style={{ color: GREEN }} />
            </div>
          )}

          {!laedt && fehler && (
            <div className="mt-3 flex items-start gap-2 rounded-xl border border-red-200 bg-red-50 p-3">
              <AlertTriangle className="mt-0.5 h-4 w-4 shrink-0 text-red-600" />
              <div>
                <p className="text-[13.5px] text-red-800">{fehler}</p>
                <Button size="sm" variant="outline" onClick={laden} className="mt-2">
                  Erneut versuchen
                </Button>
              </div>
            </div>
          )}

          {!laedt && !fehler && (
            <div className="mt-3">
              <DokumentListe
                dokumente={dokumente}
                istPraxis={false}
                onAenderung={laden}
                leerText="Hier ist noch nichts. Lade deinen ersten Befund hoch."
              />
            </div>
          )}
        </div>

        <p className="mt-8 text-[12px] leading-relaxed text-slate-500">
          Deine Unterlagen liegen verschlüsselt und sind nur für dich und die behandelnden
          Personen der Praxis sichtbar. Jeder Zugriff wird protokolliert.
        </p>
      </div>
    </div>
  )
}
