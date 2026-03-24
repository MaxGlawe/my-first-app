"use client"

import { motion, useMotionValue, useTransform } from "framer-motion"
import { useRef } from "react"

function HrDashboardMockup() {
  const ref = useRef<HTMLDivElement>(null)
  const mouseX = useMotionValue(0)
  const mouseY = useMotionValue(0)

  const rotateX = useTransform(mouseY, [-200, 200], [4, -4])
  const rotateY = useTransform(mouseX, [-300, 300], [-6, 6])

  function handleMouseMove(e: React.MouseEvent<HTMLDivElement>) {
    const rect = ref.current?.getBoundingClientRect()
    if (!rect) return
    mouseX.set(e.clientX - rect.left - rect.width / 2)
    mouseY.set(e.clientY - rect.top - rect.height / 2)
  }

  function handleMouseLeave() {
    mouseX.set(0)
    mouseY.set(0)
  }

  return (
    <motion.div
      ref={ref}
      onMouseMove={handleMouseMove}
      onMouseLeave={handleMouseLeave}
      style={{ rotateX, rotateY, transformPerspective: 1200 }}
      className="relative cursor-default"
      initial={{ opacity: 0, y: 50, rotateX: 12 }}
      whileInView={{ opacity: 1, y: 0, rotateX: 0 }}
      viewport={{ once: true, margin: "-80px" }}
      transition={{ duration: 0.9, ease: [0.16, 1, 0.3, 1] }}
    >
      {/* Shadow */}
      <div className="absolute inset-0 bg-landing-fg/10 blur-2xl rounded-3xl translate-y-8 scale-95" />

      {/* Dashboard card */}
      <div className="relative rounded-2xl border border-landing-border bg-white shadow-xl overflow-hidden">
        {/* Top bar */}
        <div className="bg-landing-fg px-6 py-4 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="flex gap-1.5">
              <div className="w-3 h-3 rounded-full bg-red-400/50" />
              <div className="w-3 h-3 rounded-full bg-yellow-400/50" />
              <div className="w-3 h-3 rounded-full bg-green-400/50" />
            </div>
            <span className="text-white/70 text-sm font-medium">HR Dashboard — Praxis OS</span>
          </div>
          <div className="flex items-center gap-2">
            <span className="text-white/40 text-xs">März 2026</span>
            <div className="w-2 h-2 rounded-full bg-landing-accent animate-pulse" />
          </div>
        </div>

        <div className="p-6 space-y-5 bg-landing-bg/50">
          {/* KPI cards */}
          <div className="grid grid-cols-4 gap-3">
            {[
              { label: "Aktive MA", value: "78", unit: "", delta: "+12%", positive: true },
              { label: "Teilnahme", value: "82", unit: "%", delta: "+8%", positive: true },
              { label: "Ø Risiko-Score", value: "38", unit: "", delta: "-14%", positive: true },
              { label: "Zufriedenheit", value: "4.8", unit: "★", delta: "+0.3", positive: true },
            ].map((kpi, i) => (
              <motion.div
                key={kpi.label}
                className="rounded-xl bg-white border border-landing-border p-4 shadow-sm"
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: 0.3 + i * 0.08 }}
              >
                <p className="text-[10px] text-landing-fg-subtle mb-2 uppercase tracking-wider">{kpi.label}</p>
                <p className="text-2xl font-bold text-landing-fg font-display">
                  {kpi.value}<span className="text-sm">{kpi.unit}</span>
                </p>
                <p className={`text-[10px] font-semibold mt-1 ${kpi.positive ? "text-landing-accent" : "text-red-500"}`}>
                  {kpi.delta} vs. Vormonat
                </p>
              </motion.div>
            ))}
          </div>

          {/* Chart + Table row */}
          <div className="grid grid-cols-[1fr_auto] gap-4">
            {/* Bar chart */}
            <div className="rounded-xl bg-white border border-landing-border p-4 shadow-sm">
              <p className="text-xs font-semibold text-landing-fg mb-4">Beschwerden-Verteilung</p>
              <div className="space-y-2.5">
                {[
                  { label: "LWS / Rücken", pct: 42, color: "bg-orange-400" },
                  { label: "Schulter / Nacken", pct: 31, color: "bg-yellow-400" },
                  { label: "Knie / Hüfte", pct: 18, color: "bg-landing-accent" },
                  { label: "Sonstige", pct: 9, color: "bg-landing-highlight" },
                ].map((row) => (
                  <div key={row.label} className="flex items-center gap-3">
                    <span className="text-[10px] text-landing-fg-muted w-28 shrink-0">{row.label}</span>
                    <div className="flex-1 h-2 bg-landing-border rounded-full overflow-hidden">
                      <motion.div
                        className={`h-full rounded-full ${row.color}`}
                        initial={{ width: 0 }}
                        whileInView={{ width: `${row.pct}%` }}
                        viewport={{ once: true }}
                        transition={{ duration: 0.7, delay: 0.4 }}
                      />
                    </div>
                    <span className="text-[10px] font-bold text-landing-fg w-8 text-right">{row.pct}%</span>
                  </div>
                ))}
              </div>
            </div>

            {/* Dept table */}
            <div className="rounded-xl bg-white border border-landing-border p-4 shadow-sm min-w-[200px]">
              <p className="text-xs font-semibold text-landing-fg mb-4">Abteilungs-Vergleich</p>
              <table className="w-full text-[10px]">
                <thead>
                  <tr className="text-landing-fg-subtle border-b border-landing-border">
                    <th className="text-left pb-2">Abt.</th>
                    <th className="text-right pb-2">Teil.</th>
                    <th className="text-right pb-2">Score</th>
                  </tr>
                </thead>
                <tbody className="space-y-1">
                  {[
                    { dept: "IT", pct: "91%", score: 32 },
                    { dept: "Sales", pct: "78%", score: 41 },
                    { dept: "Lager", pct: "65%", score: 58 },
                    { dept: "HR", pct: "95%", score: 28 },
                  ].map((row) => (
                    <tr key={row.dept} className="border-b border-landing-border/30">
                      <td className="py-1.5 text-landing-fg font-medium">{row.dept}</td>
                      <td className="py-1.5 text-right text-landing-accent font-bold">{row.pct}</td>
                      <td className="py-1.5 text-right">
                        <span className={`font-bold ${row.score < 40 ? "text-landing-accent" : row.score < 55 ? "text-yellow-500" : "text-orange-500"}`}>
                          {row.score}
                        </span>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      </div>
    </motion.div>
  )
}

const annotations = [
  { text: "Anonymisierte Daten", pos: "top-[8%] -left-4 lg:-left-32", dir: "right" },
  { text: "Quartals-Report per Klick", pos: "top-[50%] -right-4 lg:-right-36", dir: "left" },
  { text: "Abteilungs-Vergleich", pos: "bottom-[12%] -left-4 lg:-left-36", dir: "right" },
]

export function BgfDashboardSection() {
  return (
    <section className="py-24 sm:py-32 bg-landing-fg relative overflow-hidden">
      {/* Dark background accents */}
      <div className="absolute top-0 left-0 w-96 h-96 rounded-full bg-landing-accent/10 blur-3xl -translate-x-1/2 -translate-y-1/2" />
      <div className="absolute bottom-0 right-0 w-96 h-96 rounded-full bg-landing-accent-warm/10 blur-3xl translate-x-1/2 translate-y-1/2" />

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
            HR Dashboard
          </span>
          <h2 className="mt-3 font-display text-3xl sm:text-4xl lg:text-5xl font-bold text-white tracking-tight">
            Volle Transparenz{" "}
            <span className="text-landing-highlight">für HR</span>
          </h2>
          <p className="mt-4 text-lg text-white/60 max-w-2xl mx-auto">
            Sehen Sie, was sich verändert — anonymisiert, DSGVO-konform, in Echtzeit.
          </p>
        </motion.div>

        {/* Dashboard with annotations */}
        <div className="relative">
          {/* Annotations (desktop only) */}
          {annotations.map((ann, i) => (
            <motion.div
              key={ann.text}
              className={`hidden lg:flex absolute ${ann.pos} items-center gap-2 z-20`}
              initial={{ opacity: 0, x: ann.dir === "right" ? -20 : 20 }}
              whileInView={{ opacity: 1, x: 0 }}
              viewport={{ once: true }}
              transition={{ delay: 0.8 + i * 0.2, duration: 0.5 }}
            >
              {ann.dir === "right" && (
                <>
                  <div className="bg-landing-accent text-white text-xs font-semibold px-3 py-1.5 rounded-full shadow-lg whitespace-nowrap">
                    {ann.text}
                  </div>
                  <div className="w-8 h-0.5 bg-landing-accent/50" />
                </>
              )}
              {ann.dir === "left" && (
                <>
                  <div className="w-8 h-0.5 bg-landing-accent/50" />
                  <div className="bg-landing-accent text-white text-xs font-semibold px-3 py-1.5 rounded-full shadow-lg whitespace-nowrap">
                    {ann.text}
                  </div>
                </>
              )}
            </motion.div>
          ))}

          <div className="lg:mx-16">
            <HrDashboardMockup />
          </div>
        </div>
      </div>
    </section>
  )
}
