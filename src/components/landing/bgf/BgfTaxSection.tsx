"use client"

import { motion } from "framer-motion"
import { FileText, Heart, Award } from "lucide-react"

const cards = [
  {
    icon: FileText,
    badge: "§3 Nr. 34 EStG",
    title: "Bis 600 €/MA steuerfrei",
    description:
      "Für zertifizierte Präventionskurse können Arbeitgeber bis zu 600 € pro Mitarbeitendem und Jahr steuer- und sozialabgabenfrei leisten. Voraussetzung ist die Zertifizierung der Maßnahme nach §20/§20b SGB V — die wir über unsere zubuchbaren Kurskonzepte abbilden.",
    example: {
      label: "Wofür der Vorteil gilt:",
      items: [
        "Zertifizierte Präventionskurse (zubuchbar)",
        "Bis 600 € je MA/Jahr steuer- & abgabenfrei",
        "Nicht automatisch auf die Software-Lizenz",
        "Nachweise stellen wir bereit",
      ],
    },
    color: "landing-accent",
    bgLight: "bg-landing-accent-light",
    borderLight: "border-landing-accent/20",
  },
  {
    icon: Heart,
    badge: "§20 SGB V",
    title: "Krankenkassen-Förderung",
    description:
      "Zertifizierte Präventionskurse werden von gesetzlichen Krankenkassen bezuschusst. Wir liefern die Nachweise für die Antragstellung — die Förderhöhe legt die jeweilige Kasse fest.",
    example: {
      label: "Förderung möglich:",
      items: [
        "Zuschuss für zertifizierte Kurse",
        "Antrag über MA oder Krankenkasse",
        "Kombinierbar mit §3 Nr. 34 EStG",
        "Wir unterstützen mit Unterlagen",
      ],
    },
    color: "landing-highlight",
    bgLight: "bg-green-50",
    borderLight: "border-green-200",
  },
  {
    icon: Award,
    badge: "ZPP-Kursleiter",
    title: "Zertifizierte Kurskonzepte",
    description:
      "Max Glawe ist als Kursleiter bei der ZPP registriert. Auf Wunsch erstellen wir zertifizierte Präventionskurse — per Live-Stream oder vor Ort, individuell nach Absprache.",
    example: {
      label: "Optional zubuchbar:",
      items: [
        "ZPP-registrierte Kursleitung",
        "Live-Stream oder vor Ort",
        "Individuell nach Gespräch & Angebot",
        "Nachweise für Förderung inklusive",
      ],
    },
    color: "landing-accent-warm",
    bgLight: "bg-amber-50",
    borderLight: "border-amber-200",
  },
]

export function BgfTaxSection() {
  return (
    <section className="py-24 sm:py-32 bg-landing-bg relative overflow-hidden">
      <div className="container mx-auto px-4 max-w-6xl">
        {/* Header */}
        <motion.div
          className="text-center mb-16"
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: "-80px" }}
          transition={{ duration: 0.7 }}
        >
          <span className="text-sm font-semibold text-landing-accent uppercase tracking-widest">
            Förderung & Steuer
          </span>
          <h2 className="mt-3 font-display text-3xl sm:text-4xl lg:text-5xl font-bold text-landing-fg tracking-tight">
            Steuerlich gefördert —{" "}
            <span className="text-landing-accent">richtig aufgesetzt</span>
          </h2>
          <p className="mt-4 text-lg text-landing-fg-muted max-w-2xl mx-auto">
            Mit zertifizierten Präventionskursen nutzen Sie §3 Nr. 34 EStG und
            Krankenkassen-Förderung. Details klären Sie mit Ihrem Steuerberater —
            wir liefern die Nachweise.
          </p>
        </motion.div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {cards.map((card, i) => (
            <motion.div
              key={card.badge}
              className={`rounded-2xl bg-white border-2 ${card.borderLight} shadow-sm p-7 flex flex-col`}
              initial={{ opacity: 0, y: 40 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, margin: "-60px" }}
              transition={{ delay: i * 0.12, duration: 0.7 }}
              whileHover={{ y: -4, boxShadow: "0 20px 40px rgba(0,0,0,0.08)" }}
            >
              {/* Icon + badge */}
              <div className="flex items-center gap-3 mb-5">
                <div className={`w-11 h-11 rounded-xl ${card.bgLight} flex items-center justify-center`}>
                  <card.icon className="h-5 w-5 text-landing-accent" />
                </div>
                <span className={`text-xs font-bold px-3 py-1 rounded-full ${card.bgLight} text-landing-fg border ${card.borderLight}`}>
                  {card.badge}
                </span>
              </div>

              <h3 className="font-bold text-lg text-landing-fg mb-3">{card.title}</h3>
              <p className="text-sm text-landing-fg-muted leading-relaxed mb-6 flex-1">
                {card.description}
              </p>

              {/* Example box */}
              <div className={`rounded-xl ${card.bgLight} border ${card.borderLight} p-4`}>
                <p className="text-xs font-bold text-landing-fg mb-2">{card.example.label}</p>
                <ul className="space-y-1.5">
                  {card.example.items.map((item) => (
                    <li key={item} className="text-xs text-landing-fg-muted flex items-start gap-2">
                      <span className="text-landing-accent mt-0.5">›</span>
                      {item}
                    </li>
                  ))}
                </ul>
              </div>
            </motion.div>
          ))}
        </div>

        {/* Bottom note */}
        <motion.div
          className="mt-10 text-center"
          initial={{ opacity: 0 }}
          whileInView={{ opacity: 1 }}
          viewport={{ once: true }}
          transition={{ delay: 0.4, duration: 0.6 }}
        >
          <p className="text-sm text-landing-fg-subtle max-w-2xl mx-auto">
            Steuerliche Details hängen von Ihrem individuellen Fall ab.
            Sprechen Sie mit Ihrem Steuerberater — oder fragen Sie uns: Wir beraten Sie gern zu Fördermöglichkeiten.
          </p>
        </motion.div>
      </div>
    </section>
  )
}
