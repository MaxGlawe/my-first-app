"use client"

import { ScrollReveal } from "./ScrollReveal"
import Image from "next/image"
import {
  ShieldCheck,
  Award,
  GraduationCap,
  Lock,
  Server,
  FlaskConical,
  ExternalLink,
} from "lucide-react"

// Premium-Markenwelt (Masterclass-Format)
const PAPER = "#F8F5F0"
const INK = "#0f172a"
const MUTED = "#64748b"
const GREEN = "#2C3E2D"
const LINE = "#e7e1d6"

const serif = { fontFamily: "var(--font-serif)", fontWeight: 600 } as const

const credentials = [
  {
    icon: ShieldCheck,
    badge: "Staatlich zugelassen",
    title: "Heilpraktiker-Zulassung",
    description:
      "Staatlich geprüfte Zulassung nach dem Heilpraktikergesetz. Eigenständige Diagnosestellung und Behandlung ohne ärztliche Verordnung.",
    benefit: "Keine Wartezeit auf Rezept",
  },
  {
    icon: Award,
    badge: "ZPP-zertifiziert",
    title: "ZPP-Zertifizierung",
    description:
      "Registriert bei der Zentralen Prüfstelle Prävention. Qualifikation für Präventionskurse nach §20 SGB V nachgewiesen.",
    benefit: "Geprüfte Qualifikation deines Therapeuten",
  },
  {
    icon: GraduationCap,
    badge: "Praxispartner BTU",
    title: "Hochschul-Kooperation",
    description:
      "Als offizieller Praxispartner der BTU Cottbus–Senftenberg verbinden wir akademische Forschung mit therapeutischer Praxis.",
    benefit: "Therapie auf akademischem Niveau",
  },
  {
    icon: Lock,
    badge: "DSGVO-konform",
    title: "Datenschutz-konform",
    description:
      "Vollständige Konformität mit der DSGVO. Deine sensiblen Gesundheitsdaten werden nach höchsten Standards geschützt.",
    benefit: "Gesundheitsdaten gehören nur dir",
  },
  {
    icon: Server,
    badge: "EU-Server",
    title: "Europäische Server",
    description:
      "Alle Daten werden ausschließlich auf Servern in der Europäischen Union gespeichert. Keine Datenübertragung in Drittländer.",
    benefit: "EU-Datenschutzrecht schützt dich",
  },
  {
    icon: FlaskConical,
    badge: "Evidenzbasiert",
    title: "Evidenzbasierte Methoden",
    description:
      "Wir setzen ausschließlich Therapiemethoden ein, deren Wirksamkeit durch wissenschaftliche Studien belegt ist.",
    benefit: "Nur Methoden, die nachweislich wirken",
  },
]

export function CredentialsSection() {
  return (
    <section
      id="qualifikation"
      className="py-24 sm:py-32 relative overflow-hidden"
      style={{ backgroundColor: PAPER }}
    >
      {/* Smart line */}
      <div className="absolute top-0 left-1/2 -translate-x-1/2 flex flex-col items-center">
        <div className="smart-line h-12" />
        <div className="smart-line-dot animate-dot-pulse" />
      </div>

      <div className="container mx-auto px-4 max-w-6xl">
        {/* University Cooperation Hero */}
        <ScrollReveal className="mb-16">
          <div
            className="rounded-3xl bg-white border p-8 sm:p-12"
            style={{ borderColor: LINE, boxShadow: "0 20px 50px rgba(15,23,42,0.05)" }}
          >
            <div className="flex flex-col lg:flex-row items-center gap-8 lg:gap-12">
              {/* Left: BTU Info */}
              <div className="flex-1 text-center lg:text-left">
                <div className="flex items-center justify-center lg:justify-start gap-3 mb-4">
                  <GraduationCap className="h-7 w-7" style={{ color: GREEN }} />
                  <span
                    className="text-sm font-medium uppercase tracking-wider"
                    style={{ color: GREEN }}
                  >
                    Akademische Partnerschaft
                  </span>
                </div>
                <h3 className="text-2xl sm:text-3xl mb-3" style={{ ...serif, color: INK }}>
                  In Kooperation mit der{" "}
                  <span style={{ color: GREEN }}>BTU Cottbus–Senftenberg</span>
                </h3>
                <p className="max-w-xl" style={{ color: MUTED }}>
                  Als offizieller Praxispartner der Brandenburgischen Technischen
                  Universität verbinden wir akademische Forschung mit
                  therapeutischer Praxis — für Behandlungen auf dem neuesten Stand
                  der Wissenschaft.
                </p>
                <a
                  href="https://www.b-tu.de"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center gap-1.5 mt-4 text-sm font-medium transition-opacity hover:opacity-80"
                  style={{ color: GREEN }}
                >
                  www.b-tu.de
                  <ExternalLink className="h-3.5 w-3.5" />
                </a>
              </div>

              {/* Right: BTU logo */}
              <div className="flex-shrink-0">
                <div className="h-32 w-48 sm:h-36 sm:w-56 rounded-2xl bg-white flex items-center justify-center p-4">
                  <Image
                    src="/images/BTU.png"
                    alt="BTU Cottbus–Senftenberg — Brandenburgische Technische Universität"
                    width={200}
                    height={120}
                    className="object-contain"
                  />
                </div>
              </div>
            </div>
          </div>
        </ScrollReveal>

        {/* Section Header */}
        <ScrollReveal className="text-center mb-12">
          <span
            className="text-sm font-medium uppercase tracking-wider"
            style={{ color: GREEN }}
          >
            Qualifikation
          </span>
          <h2
            className="mt-3 text-3xl sm:text-4xl lg:text-5xl tracking-tight"
            style={{ ...serif, color: INK }}
          >
            Geprüft. <span style={{ color: GREEN }}>Zertifiziert.</span>
          </h2>
          <p className="mt-4 text-lg max-w-2xl mx-auto" style={{ color: MUTED }}>
            Jede Auszeichnung hat einen konkreten Vorteil für dich.
          </p>
        </ScrollReveal>

        {/* Credentials Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6 reveal-stagger">
          {credentials.map((cred) => (
            <ScrollReveal key={cred.title}>
              <div
                className="group rounded-2xl border bg-white p-6 hover:shadow-lg transition-all duration-500 h-full flex flex-col"
                style={{ borderColor: LINE }}
              >
                {/* Badge Icon */}
                <div className="flex items-start justify-between mb-4">
                  <div
                    className="h-14 w-14 rounded-2xl flex items-center justify-center"
                    style={{ backgroundColor: "rgba(44,62,45,0.1)" }}
                  >
                    <cred.icon className="h-7 w-7" style={{ color: GREEN }} />
                  </div>
                  <span
                    className="inline-flex items-center rounded-full px-3 py-1 text-xs font-medium"
                    style={{ backgroundColor: "rgba(44,62,45,0.1)", color: GREEN }}
                  >
                    {cred.badge}
                  </span>
                </div>

                {/* Content */}
                <h3 className="text-lg mb-2" style={{ ...serif, color: INK }}>
                  {cred.title}
                </h3>
                <p className="text-sm leading-relaxed flex-1" style={{ color: MUTED }}>
                  {cred.description}
                </p>

                {/* Patient Benefit */}
                <div className="mt-4 pt-4 border-t" style={{ borderColor: LINE }}>
                  <p className="text-sm font-medium" style={{ color: GREEN }}>
                    Für dich: {cred.benefit}
                  </p>
                </div>
              </div>
            </ScrollReveal>
          ))}
        </div>
      </div>
    </section>
  )
}
