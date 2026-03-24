"use client"

import { motion } from "framer-motion"
import { ArrowRight, Phone, Mail } from "lucide-react"
import { Button } from "@/components/ui/button"
import Link from "next/link"

export function BgfCtaSection() {
  return (
    <section className="py-24 sm:py-32 bg-landing-fg relative overflow-hidden">
      {/* Background accents */}
      <motion.div
        className="absolute top-0 left-1/4 w-96 h-96 rounded-full bg-landing-accent/15 blur-3xl"
        animate={{ scale: [1, 1.2, 1], x: [0, 30, 0] }}
        transition={{ duration: 12, repeat: Infinity, ease: "easeInOut" }}
      />
      <motion.div
        className="absolute bottom-0 right-1/4 w-80 h-80 rounded-full bg-landing-accent-warm/10 blur-3xl"
        animate={{ scale: [1.1, 1, 1.1], x: [0, -20, 0] }}
        transition={{ duration: 10, repeat: Infinity, ease: "easeInOut", delay: 4 }}
      />

      <div className="relative z-10 container mx-auto px-4 max-w-4xl text-center">
        <motion.div
          initial={{ opacity: 0, y: 40 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: "-80px" }}
          transition={{ duration: 0.8 }}
        >
          {/* Badge */}
          <div className="inline-flex items-center gap-2 rounded-full bg-landing-accent/20 border border-landing-accent/30 px-5 py-2 mb-8">
            <motion.div
              className="w-2 h-2 rounded-full bg-landing-accent"
              animate={{ scale: [1, 1.4, 1], opacity: [1, 0.5, 1] }}
              transition={{ duration: 2, repeat: Infinity }}
            />
            <span className="text-sm font-semibold text-landing-highlight">
              Pilot-Programm — kostenlos & unverbindlich
            </span>
          </div>

          <h2 className="font-display text-4xl sm:text-5xl lg:text-6xl font-bold text-white leading-tight tracking-tight mb-6">
            Starten Sie Ihr
            <br />
            <span className="text-landing-accent">Pilot-Programm</span>
          </h2>

          <p className="text-xl text-white/60 max-w-2xl mx-auto mb-10 leading-relaxed">
            30 Tage, 10–20 Mitarbeitende, kostenlos und unverbindlich.
            Sehen Sie mit echten Daten, was betriebliche Gesundheitsförderung
            für Ihr Unternehmen bewirken kann.
          </p>

          <div className="flex flex-col sm:flex-row items-center justify-center gap-4 mb-14">
            <Link href="/anfrage">
              <motion.div whileHover={{ scale: 1.04, y: -3 }} whileTap={{ scale: 0.97 }}>
                <Button
                  size="lg"
                  className="bg-landing-accent hover:bg-landing-accent-hover text-white text-lg px-10 h-14 rounded-full shadow-2xl shadow-landing-accent/30"
                >
                  Pilot anfragen
                  <ArrowRight className="ml-2.5 h-5 w-5" />
                </Button>
              </motion.div>
            </Link>
          </div>

          {/* Contact alternatives */}
          <div className="flex flex-col sm:flex-row items-center justify-center gap-6 text-white/50 text-sm">
            <a
              href="tel:+49000000000"
              className="flex items-center gap-2 hover:text-white/80 transition-colors"
            >
              <Phone className="h-4 w-4" />
              Direkt anrufen
            </a>
            <span className="hidden sm:block w-1 h-1 rounded-full bg-white/20" />
            <a
              href="mailto:physiotherapieglawe@gmx.de"
              className="flex items-center gap-2 hover:text-white/80 transition-colors"
            >
              <Mail className="h-4 w-4" />
              physiotherapieglawe@gmx.de
            </a>
          </div>
        </motion.div>

        {/* Bottom stats row */}
        <motion.div
          className="mt-16 grid grid-cols-1 sm:grid-cols-3 gap-6"
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ delay: 0.3, duration: 0.7 }}
        >
          {[
            { value: "30 Tage", label: "Kostenlos testen" },
            { value: "10–20 MA", label: "Pilot-Größe" },
            { value: "0€", label: "Keine Einrichtungsgebühr" },
          ].map((stat) => (
            <div
              key={stat.value}
              className="rounded-2xl bg-white/5 border border-white/10 p-6"
            >
              <p className="font-display text-3xl font-bold text-white mb-1">{stat.value}</p>
              <p className="text-sm text-white/50">{stat.label}</p>
            </div>
          ))}
        </motion.div>
      </div>
    </section>
  )
}
