"use client"

import { motion } from "framer-motion"
import { Check, Sparkles, ArrowRight, Lock, UserPlus } from "lucide-react"
import { Button } from "@/components/ui/button"
import Link from "next/link"
import {
  BGF_PAKETE,
  GROSSES_TEAM_LABEL,
  fmtEuro,
  paketLabel,
} from "@/lib/bgf-pakete"

// In JEDEM Paket enthalten — jeder Mitarbeiter bekommt das volle Produkt.
const enthalten = [
  "Echter Therapeut als fester Ansprechpartner (Heilpraktiker)",
  "Therapeuten-Draht: Chat bei jeder Beschwerde — vertraulich",
  "Tägliche KI-Pausen-Fit-Routinen am Arbeitsplatz",
  "Persönliche Gesundheits-Ist-Analyse je Mitarbeiter",
  "Individuelle Übungspläne vom Therapeuten",
  "Ampel-System: kritische Fälle werden früh erkannt",
  "Anonymer Nutzungs-Report für die Geschäftsführung",
  "Onboarding-Workshop für Ihr Team",
]

export function BgfPricingSection() {
  return (
    <section id="preise" className="py-24 sm:py-32 bg-white relative overflow-hidden">
      <div className="container mx-auto px-4 max-w-6xl">
        {/* Header */}
        <motion.div
          className="text-center mb-14"
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: "-80px" }}
          transition={{ duration: 0.7 }}
        >
          <span className="text-sm font-semibold text-landing-accent uppercase tracking-widest">
            Preise
          </span>
          <h2 className="mt-3 font-display text-3xl sm:text-4xl lg:text-5xl font-bold text-landing-fg tracking-tight">
            Ein Angebot.{" "}
            <span className="text-landing-accent">Nach Teamgröße.</span>
          </h2>
          <p className="mt-4 text-lg text-landing-fg-muted max-w-2xl mx-auto">
            Fester Monatspreis, ein volles Produkt für jeden im Team — innerhalb
            Ihres Pakets ohne Pro-Kopf-Rechnung. Steuervorteil nach §3 Nr. 34 EStG
            über zubuchbare, zertifizierte Präventionskurse.
          </p>
        </motion.div>

        {/* Was enthalten ist — ein Produkt für alle */}
        <motion.div
          className="rounded-2xl border border-landing-border bg-landing-bg p-7 sm:p-8 mb-10"
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: "-60px" }}
          transition={{ duration: 0.7 }}
        >
          <p className="text-xs font-bold uppercase tracking-widest text-landing-fg-subtle mb-5">
            In jedem Paket enthalten — für jeden Mitarbeiter
          </p>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-x-8 gap-y-3">
            {enthalten.map((f) => (
              <div key={f} className="flex items-start gap-2.5 text-sm">
                <Check className="h-4 w-4 flex-shrink-0 mt-0.5 text-landing-accent" />
                <span className="text-landing-fg">{f}</span>
              </div>
            ))}
          </div>
          <div className="mt-6 pt-5 border-t border-landing-border/70 flex items-start gap-2.5">
            <Lock className="h-4 w-4 flex-shrink-0 mt-0.5 text-landing-accent" />
            <p className="text-sm text-landing-fg-muted">
              <span className="font-semibold text-landing-fg">Vertraulich by design:</span>{" "}
              Die Geschäftsführung sieht Nutzung und Teilnahme — nie die
              Gesundheitsdaten einzelner Mitarbeitender.
            </p>
          </div>
          <p className="mt-4 text-xs text-landing-fg-subtle">
            Zubuchbar: ZPP-zertifizierte Präventionskurse & Ergonomie-Audits vor Ort.
          </p>
        </motion.div>

        {/* Preis-Bänder nach Größe */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5 mb-6">
          {BGF_PAKETE.map((g, i) => (
            <motion.div
              key={g.size}
              className={`relative rounded-2xl p-6 flex flex-col text-center ${
                g.featured
                  ? "bg-landing-fg border-2 border-landing-fg shadow-2xl"
                  : "bg-white border border-landing-border shadow-sm"
              }`}
              initial={{ opacity: 0, y: 40 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, margin: "-60px" }}
              transition={{ delay: i * 0.1, duration: 0.6 }}
            >
              {g.featured && (
                <div className="absolute -top-3.5 left-1/2 -translate-x-1/2">
                  <span className="inline-flex items-center gap-1.5 rounded-full bg-landing-accent px-4 py-1.5 text-xs font-bold text-white shadow-lg shadow-landing-accent/30">
                    <Sparkles className="h-3 w-3" />
                    Beliebt
                  </span>
                </div>
              )}
              <p className={`text-xs font-bold uppercase tracking-widest mb-3 ${g.featured ? "text-white/60 mt-2" : "text-landing-fg-subtle"}`}>
                {g.size} Mitarbeitende
              </p>
              <div className="mb-1">
                <span className={`font-display text-4xl font-bold ${g.featured ? "text-white" : "text-landing-fg"}`}>
                  {fmtEuro(g.preis)} €
                </span>
              </div>
              <p className={`text-sm mb-6 ${g.featured ? "text-white/50" : "text-landing-fg-subtle"}`}>
                pro Monat
              </p>
              <Link
                href={`/unternehmen/kontakt?modell=${encodeURIComponent(paketLabel(g))}`}
                className="mt-auto"
              >
                <Button
                  className={`w-full rounded-full ${
                    g.featured
                      ? "bg-landing-accent hover:bg-landing-accent-hover text-white shadow-lg shadow-landing-accent/30"
                      : "border border-landing-border bg-white hover:bg-landing-bg text-landing-fg"
                  }`}
                >
                  Anfragen
                  <ArrowRight className="ml-2 h-4 w-4" />
                </Button>
              </Link>
            </motion.div>
          ))}
        </div>

        {/* Wachstum während der Laufzeit */}
        <motion.div
          className="rounded-2xl bg-landing-bg border border-landing-border p-5 mb-6 flex items-start gap-3"
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: "-60px" }}
          transition={{ duration: 0.6 }}
        >
          <UserPlus className="h-4 w-4 flex-shrink-0 mt-0.5 text-landing-accent" />
          <p className="text-sm text-landing-fg-muted">
            <span className="font-semibold text-landing-fg">Sie stellen jemanden ein?</span>{" "}
            Jeder Mitarbeitende über der Paketgrenze kostet{" "}
            {BGF_PAKETE.map((p) => fmtEuro(p.proMaZusatz)).at(-1)}–
            {BGF_PAKETE.map((p) => fmtEuro(p.proMaZusatz))[0]} € im Monat — genau so
            viel wie seine Kolleginnen und Kollegen im Paket. Wird das größere Paket
            günstiger, wechseln Sie automatisch dorthin. Sie zahlen nie mehr als den
            Listenpreis Ihrer Teamgröße.
          </p>
        </motion.div>

        {/* Größere Teams — individuelles Angebot */}
        <motion.div
          className="rounded-2xl border border-landing-border bg-white shadow-sm p-6 flex flex-col sm:flex-row items-center justify-between gap-4 mb-12"
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: "-60px" }}
          transition={{ duration: 0.6 }}
        >
          <div className="text-center sm:text-left">
            <p className="font-display text-lg font-bold text-landing-fg">
              Mehr als 50 Mitarbeitende?
            </p>
            <p className="text-sm text-landing-fg-muted mt-0.5">
              Individuelles Angebot mit fest eingeplanter Therapeuten-Kapazität für Ihr Unternehmen.
            </p>
          </div>
          <Link href={`/unternehmen/kontakt?modell=${encodeURIComponent(GROSSES_TEAM_LABEL)}`}>
            <Button
              variant="outline"
              className="rounded-full border-landing-border text-landing-fg hover:bg-landing-bg whitespace-nowrap"
            >
              Angebot anfragen
              <ArrowRight className="ml-2 h-4 w-4" />
            </Button>
          </Link>
        </motion.div>

        {/* Pilot banner */}
        <motion.div
          className="rounded-2xl bg-gradient-to-r from-landing-accent/10 via-landing-accent-light to-landing-accent-warm/10 border border-landing-accent/20 p-8 text-center"
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: "-60px" }}
          transition={{ delay: 0.2, duration: 0.7 }}
        >
          <span className="inline-flex items-center gap-2 bg-landing-accent text-white text-xs font-bold px-4 py-1.5 rounded-full mb-4">
            <Sparkles className="h-3.5 w-3.5" />
            Pilot-Programm
          </span>
          <h3 className="font-display text-2xl font-bold text-landing-fg mb-2">
            30 Tage kostenlos testen
          </h3>
          <p className="text-landing-fg-muted mb-6 max-w-lg mx-auto">
            Starten Sie mit 10–20 Mitarbeitenden, ohne Risiko und ohne Verpflichtung.
            Nach 30 Tagen entscheiden Sie.
          </p>
          <Link href="/unternehmen/kontakt">
            <Button
              size="lg"
              className="bg-landing-accent hover:bg-landing-accent-hover text-white rounded-full px-8 shadow-lg shadow-landing-accent/25"
            >
              Pilot-Programm anfragen
              <ArrowRight className="ml-2 h-4 w-4" />
            </Button>
          </Link>
        </motion.div>
      </div>
    </section>
  )
}
