"use client"

import { motion } from "framer-motion"
import {
  ShieldCheck,
  Award,
  GraduationCap,
  Lock,
  Server,
  FlaskConical,
} from "lucide-react"

const credentials = [
  {
    icon: ShieldCheck,
    title: "Heilpraktiker-Zulassung",
    subtitle: "Staatlich geprüft",
    description:
      "Eigenständige Diagnosestellung und Behandlung nach dem Heilpraktikergesetz — ohne ärztliche Verordnung.",
    gradient: "from-landing-accent/10 to-landing-accent/5",
    iconBg: "bg-landing-accent/10",
    iconColor: "text-landing-accent",
  },
  {
    icon: Award,
    title: "ZPP-registrierte Kursleitung",
    subtitle: "Prävention",
    description:
      "Max Glawe ist als Kursleiter bei der Zentralen Prüfstelle Prävention (ZPP) registriert. Auf Wunsch erstellen wir zertifizierte Präventionskurs-Konzepte — per Live-Stream oder vor Ort, individuell nach Absprache.",
    gradient: "from-landing-accent-warm/10 to-landing-accent-warm/5",
    iconBg: "bg-landing-accent-warm/10",
    iconColor: "text-landing-accent-warm",
  },
  {
    icon: GraduationCap,
    title: "BTU Cottbus-Senftenberg",
    subtitle: "Akademische Partnerschaft",
    description:
      "Offizieller Praxispartner der Brandenburgischen Technischen Universität. Therapie auf dem neuesten Stand der Forschung.",
    gradient: "from-blue-50 to-blue-50/50",
    iconBg: "bg-blue-50",
    iconColor: "text-blue-600",
  },
  {
    icon: Lock,
    title: "DSGVO-konform",
    subtitle: "Datenschutz garantiert",
    description:
      "Vollständige Konformität mit der DSGVO. HR sieht ausschließlich anonymisierte Aggregate — niemals individuelle Gesundheitsdaten.",
    gradient: "from-landing-accent/10 to-landing-accent/5",
    iconBg: "bg-landing-accent/10",
    iconColor: "text-landing-accent",
  },
  {
    icon: Server,
    title: "Deutsche Server",
    subtitle: "EU-Hosting",
    description:
      "Alle Daten werden ausschließlich auf Servern in Deutschland gehostet. Keine Datenübertragung in Drittländer.",
    gradient: "from-slate-50 to-slate-50/50",
    iconBg: "bg-slate-100",
    iconColor: "text-slate-600",
  },
  {
    icon: FlaskConical,
    title: "Evidenzbasiert",
    subtitle: "Wissenschaftlich fundiert",
    description:
      "Ausschließlich Methoden mit nachgewiesener Wirksamkeit. Cochrane Reviews, Systematic Reviews, Meta-Analysen als Grundlage.",
    gradient: "from-landing-accent-warm/10 to-landing-accent-warm/5",
    iconBg: "bg-landing-accent-warm/10",
    iconColor: "text-landing-accent-warm",
  },
]

export function BgfCredentialsSection() {
  return (
    <section className="py-24 sm:py-32 bg-landing-bg-warm relative overflow-hidden">
      {/* Subtle background glow */}
      <div className="absolute top-0 left-1/3 h-[400px] w-[600px] bg-landing-accent/[0.04] blur-[150px] rounded-full" />

      <div className="relative z-10 container mx-auto px-4 max-w-6xl">
        {/* Header */}
        <motion.div
          className="text-center mb-16"
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: "-80px" }}
          transition={{ duration: 0.7 }}
        >
          <span className="text-sm font-semibold text-landing-accent uppercase tracking-widest">
            Qualifikation & Sicherheit
          </span>
          <h2 className="mt-3 font-display text-3xl sm:text-4xl lg:text-5xl font-bold text-landing-fg tracking-tight">
            Vertrauen durch{" "}
            <span className="text-landing-accent">Kompetenz</span>
          </h2>
          <p className="mt-4 text-lg text-landing-fg-muted max-w-2xl mx-auto">
            Zertifiziert, geprüft und wissenschaftlich fundiert — jede Qualifikation mit konkretem Nutzen für Ihr Unternehmen.
          </p>
        </motion.div>

        {/* Credentials Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {credentials.map((cred, i) => (
            <motion.div
              key={cred.title}
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, margin: "-40px" }}
              transition={{ delay: i * 0.08, duration: 0.6, ease: [0.16, 1, 0.3, 1] }}
            >
              <motion.div
                className={`relative h-full rounded-2xl bg-gradient-to-br ${cred.gradient} border border-landing-border p-6 sm:p-7 overflow-hidden group`}
                whileHover={{
                  y: -4,
                  boxShadow: "0 20px 40px rgba(0,0,0,0.06)",
                  borderColor: "rgba(45,106,79,0.2)",
                }}
                transition={{ duration: 0.3 }}
              >
                {/* Background accent on hover */}
                <div className="absolute inset-0 bg-white opacity-0 group-hover:opacity-60 transition-opacity duration-500" />

                <div className="relative z-10">
                  {/* Icon + Badge */}
                  <div className="flex items-start justify-between mb-5">
                    <motion.div
                      className={`h-12 w-12 rounded-xl ${cred.iconBg} flex items-center justify-center`}
                      whileHover={{ rotate: [0, -5, 5, 0], scale: 1.05 }}
                      transition={{ duration: 0.4 }}
                    >
                      <cred.icon className={`h-6 w-6 ${cred.iconColor}`} />
                    </motion.div>
                    <span className="text-[10px] font-bold uppercase tracking-wider text-landing-fg-subtle bg-white/80 rounded-full px-3 py-1 border border-landing-border/50">
                      {cred.subtitle}
                    </span>
                  </div>

                  {/* Content */}
                  <h3 className="font-display font-bold text-lg text-landing-fg mb-2">
                    {cred.title}
                  </h3>
                  <p className="text-sm text-landing-fg-muted leading-relaxed">
                    {cred.description}
                  </p>
                </div>
              </motion.div>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  )
}
