"use client"

import { motion } from "framer-motion"
import { ArrowRight, CalendarX, Activity, Smile, BarChart3, Heart } from "lucide-react"

const rows = [
  {
    icon: CalendarX,
    dimension: "Ausfalltage",
    before: "Hoch & steigend, Ursachen unklar",
    after: "Spürbar weniger — bis zu 35 % Reduktion",
  },
  {
    icon: Activity,
    dimension: "Beschwerden",
    before: "Rücken & Nacken als Dauerthema",
    after: "Früh erkannt, gezielt behandelt, rückläufig",
  },
  {
    icon: Smile,
    dimension: "Fitness & Moral",
    before: "Müde Teams, kein Gesundheitsangebot",
    after: "Tägliche Routine, mehr Energie & Wohlbefinden",
  },
  {
    icon: BarChart3,
    dimension: "HR-Transparenz",
    before: "Bauchgefühl statt Daten",
    after: "Anonyme KPIs & Quartals-Reports — DSGVO-konform",
  },
  {
    icon: Heart,
    dimension: "Arbeitgeber-Attraktivität",
    before: "Gesundheit kein Argument im Recruiting",
    after: "Echter Benefit: „Eigener Therapeut fürs Team“",
  },
]

export function BgfJourneySection() {
  return (
    <section className="py-24 sm:py-32 bg-white relative overflow-hidden">
      <div className="container mx-auto px-4 max-w-5xl">
        {/* Header */}
        <motion.div
          className="text-center mb-16"
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: "-80px" }}
          transition={{ duration: 0.7 }}
        >
          <span className="text-sm font-semibold text-landing-accent uppercase tracking-widest">
            Was sich verändert
          </span>
          <h2 className="mt-3 font-display text-3xl sm:text-4xl lg:text-5xl font-bold text-landing-fg tracking-tight">
            Vorher. <span className="text-landing-accent">Nachher.</span>
          </h2>
          <p className="mt-4 text-lg text-landing-fg-muted max-w-2xl mx-auto">
            Eine klare Reise vom Status quo zu einem messbar gesünderen,
            stärkeren Unternehmen.
          </p>
        </motion.div>

        {/* Column headers (desktop) */}
        <div className="hidden md:grid grid-cols-[1fr_auto_1fr] gap-4 mb-3 px-2">
          <div className="text-center">
            <span className="inline-block text-xs font-bold uppercase tracking-wider text-red-400 bg-red-50 rounded-full px-4 py-1.5 border border-red-100">
              Ohne Praxis OS
            </span>
          </div>
          <div className="w-10" />
          <div className="text-center">
            <span className="inline-block text-xs font-bold uppercase tracking-wider text-landing-accent bg-landing-accent-light rounded-full px-4 py-1.5 border border-landing-accent/20">
              Mit Ihrem Therapeuten
            </span>
          </div>
        </div>

        {/* Rows */}
        <div className="space-y-4">
          {rows.map((row, i) => (
            <motion.div
              key={row.dimension}
              initial={{ opacity: 0, y: 24 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, margin: "-50px" }}
              transition={{ delay: i * 0.08, duration: 0.6 }}
            >
              {/* Dimension label */}
              <div className="flex items-center gap-2 mb-2 md:hidden">
                <row.icon className="h-4 w-4 text-landing-accent" />
                <span className="text-sm font-bold text-landing-fg">{row.dimension}</span>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-[1fr_auto_1fr] gap-3 md:gap-4 items-stretch">
                {/* Before */}
                <div className="rounded-2xl border border-red-100 bg-red-50/40 p-5 flex items-center">
                  <p className="text-sm text-landing-fg-muted leading-snug">{row.before}</p>
                </div>

                {/* Arrow + dimension (desktop) */}
                <div className="hidden md:flex flex-col items-center justify-center w-10">
                  <div className="w-9 h-9 rounded-full bg-landing-accent/10 border border-landing-accent/20 flex items-center justify-center">
                    <ArrowRight className="h-4 w-4 text-landing-accent" />
                  </div>
                </div>

                {/* After */}
                <div className="rounded-2xl border-2 border-landing-accent/25 bg-landing-accent/5 p-5 flex items-center gap-3">
                  <div className="hidden md:flex w-9 h-9 rounded-xl bg-landing-accent/10 items-center justify-center flex-shrink-0">
                    <row.icon className="h-4 w-4 text-landing-accent" />
                  </div>
                  <p className="text-sm font-semibold text-landing-fg leading-snug">{row.after}</p>
                </div>
              </div>
            </motion.div>
          ))}
        </div>

        {/* Bottom statement */}
        <motion.div
          className="mt-14 rounded-2xl bg-landing-fg p-8 sm:p-10 text-center relative overflow-hidden"
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: "-60px" }}
          transition={{ duration: 0.7 }}
        >
          <div className="absolute -top-12 left-1/3 h-48 w-48 rounded-full bg-landing-accent/15 blur-3xl" />
          <div className="relative">
            <p className="font-display text-2xl sm:text-3xl font-bold text-white leading-snug max-w-2xl mx-auto">
              Gesunde Mitarbeitende sind kein Zufall.
              <br />
              <span className="text-landing-highlight">Sie sind eine Entscheidung.</span>
            </p>
          </div>
        </motion.div>
      </div>
    </section>
  )
}
