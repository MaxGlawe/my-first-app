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

const credentials = [
  {
    icon: ShieldCheck,
    badge: "Staatlich zugelassen",
    title: "Heilpraktiker-Zulassung",
    description:
      "Staatlich gepr\u00fcfte Zulassung nach dem Heilpraktikergesetz. Eigenst\u00e4ndige Diagnosestellung und Behandlung ohne \u00e4rztliche Verordnung.",
    benefit: "Keine Wartezeit auf Rezept",
  },
  {
    icon: Award,
    badge: "ZPP-zertifiziert",
    title: "ZPP-Zertifizierung",
    description:
      "Registriert bei der Zentralen Pr\u00fcfstelle Pr\u00e4vention. Qualifikation f\u00fcr Pr\u00e4ventionskurse nach \u00a720 SGB V nachgewiesen.",
    benefit: "Gepr\u00fcfte Qualifikation Ihres Therapeuten",
  },
  {
    icon: GraduationCap,
    badge: "Praxispartner BTU",
    title: "Hochschul-Kooperation",
    description:
      "Als offizieller Praxispartner der BTU Cottbus\u2013Senftenberg verbinden wir akademische Forschung mit therapeutischer Praxis.",
    benefit: "Therapie auf akademischem Niveau",
  },
  {
    icon: Lock,
    badge: "DSGVO-konform",
    title: "Datenschutz-konform",
    description:
      "Vollst\u00e4ndige Konformit\u00e4t mit der DSGVO. Ihre sensiblen Gesundheitsdaten werden nach h\u00f6chsten Standards gesch\u00fctzt.",
    benefit: "Gesundheitsdaten geh\u00f6ren nur Ihnen",
  },
  {
    icon: Server,
    badge: "EU-Server",
    title: "Europ\u00e4ische Server",
    description:
      "Alle Daten werden ausschlie\u00dflich auf Servern in der Europ\u00e4ischen Union gespeichert. Keine Daten\u00fcbertragung in Drittl\u00e4nder.",
    benefit: "EU-Datenschutzrecht sch\u00fctzt Sie",
  },
  {
    icon: FlaskConical,
    badge: "Evidenzbasiert",
    title: "Evidenzbasierte Methoden",
    description:
      "Wir setzen ausschlie\u00dflich Therapiemethoden ein, deren Wirksamkeit durch wissenschaftliche Studien belegt ist.",
    benefit: "Nur Methoden, die nachweislich wirken",
  },
]

export function CredentialsSection() {
  return (
    <section
      id="qualifikation"
      className="py-24 sm:py-32 bg-[#faf9f7] relative overflow-hidden"
    >
      {/* Smart line */}
      <div className="absolute top-0 left-1/2 -translate-x-1/2 flex flex-col items-center">
        <div className="smart-line h-12" />
        <div className="smart-line-dot animate-dot-pulse" />
      </div>

      <div className="container mx-auto px-4 max-w-6xl">
        {/* University Cooperation Hero */}
        <ScrollReveal className="mb-16">
          <div className="rounded-3xl bg-white border border-slate-100 shadow-xl shadow-slate-900/5 p-8 sm:p-12">
            <div className="flex flex-col lg:flex-row items-center gap-8 lg:gap-12">
              {/* Left: BTU Info */}
              <div className="flex-1 text-center lg:text-left">
                <div className="flex items-center justify-center lg:justify-start gap-3 mb-4">
                  <GraduationCap className="h-7 w-7 text-emerald-600" />
                  <span className="text-sm font-medium text-emerald-600 uppercase tracking-wider">
                    Akademische Partnerschaft
                  </span>
                </div>
                <h3 className="text-2xl sm:text-3xl font-bold text-slate-900 mb-3">
                  In Kooperation mit der{" "}
                  <span className="bg-gradient-to-r from-emerald-600 to-teal-500 bg-clip-text text-transparent">
                    BTU Cottbus–Senftenberg
                  </span>
                </h3>
                <p className="text-slate-500 max-w-xl">
                  Als offizieller Praxispartner der Brandenburgischen Technischen
                  Universität verbinden wir akademische Forschung mit
                  therapeutischer Praxis — für Behandlungen auf dem neuesten Stand
                  der Wissenschaft.
                </p>
                <a
                  href="https://www.b-tu.de"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center gap-1.5 mt-4 text-sm font-medium text-emerald-600 hover:text-emerald-700 transition-colors"
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
          <span className="text-sm font-medium text-emerald-600 uppercase tracking-wider">
            Qualifikation
          </span>
          <h2 className="mt-3 text-3xl sm:text-4xl lg:text-5xl font-bold text-slate-900 tracking-tight">
            Geprüft.{" "}
            <span className="bg-gradient-to-r from-emerald-600 to-teal-500 bg-clip-text text-transparent">
              Zertifiziert.
            </span>
          </h2>
          <p className="mt-4 text-lg text-slate-500 max-w-2xl mx-auto">
            Jede Auszeichnung hat einen konkreten Vorteil für Sie.
          </p>
        </ScrollReveal>

        {/* Credentials Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6 reveal-stagger">
          {credentials.map((cred) => (
            <ScrollReveal key={cred.title}>
              <div className="group rounded-2xl border border-slate-100 bg-white p-6 hover:border-emerald-200 hover:shadow-lg hover:shadow-emerald-500/5 transition-all duration-500 h-full flex flex-col">
                {/* Badge Icon */}
                <div className="flex items-start justify-between mb-4">
                  <div className="h-14 w-14 rounded-2xl bg-gradient-to-br from-emerald-50 to-teal-50 flex items-center justify-center ring-2 ring-emerald-100 group-hover:ring-emerald-300 transition-colors">
                    <cred.icon className="h-7 w-7 text-emerald-600" />
                  </div>
                  <span className="inline-flex items-center rounded-full bg-emerald-50 px-3 py-1 text-xs font-medium text-emerald-700">
                    {cred.badge}
                  </span>
                </div>

                {/* Content */}
                <h3 className="text-lg font-bold text-slate-900 mb-2">
                  {cred.title}
                </h3>
                <p className="text-sm text-slate-500 leading-relaxed flex-1">
                  {cred.description}
                </p>

                {/* Patient Benefit */}
                <div className="mt-4 pt-4 border-t border-slate-100">
                  <p className="text-sm font-medium text-emerald-600">
                    Für Sie: {cred.benefit}
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
