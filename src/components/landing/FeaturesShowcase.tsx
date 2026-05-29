"use client"

import { ScrollReveal } from "./ScrollReveal"
import { useScrollReveal } from "@/hooks/use-scroll-reveal"
import { cn } from "@/lib/utils"
import {
  Activity,
  BarChart3,
  BookOpen,
  Brain,
  CheckCircle2,
  Dumbbell,
  Heart,
  MessageSquare,
  Play,
  Send,
  Sparkles,
  Target,
} from "lucide-react"

// Premium-Markenwelt (Masterclass-Format)
const PAPER = "#F8F5F0"
const INK = "#0f172a"
const BODY = "#334155"
const MUTED = "#64748b"
const GREEN = "#2C3E2D"
const LINE = "#e7e1d6"

/* ── Directional Reveal ──────────────────────────────────────────────── */

function RevealSide({
  children,
  direction,
  className,
  delay,
}: {
  children: React.ReactNode
  direction: "left" | "right"
  className?: string
  delay?: number
}) {
  const { ref, isRevealed } = useScrollReveal()
  return (
    <div
      ref={ref}
      className={cn(
        direction === "left" ? "reveal-left" : "reveal-right",
        isRevealed && "revealed",
        className
      )}
      style={delay ? { transitionDelay: `${delay}ms` } : undefined}
    >
      {children}
    </div>
  )
}

/* ── Feature Mock UIs ────────────────────────────────────────────────── */

function CheckInMock() {
  return (
    <div className="rounded-2xl bg-white shadow-xl shadow-black/5 border p-5 sm:p-6" style={{ borderColor: LINE }}>
      <div className="text-xs font-semibold mb-4" style={{ color: BODY }}>
        Tägliches Check-in
      </div>
      <div className="space-y-4">
        {[
          { label: "Wie stark sind deine Schmerzen?", value: "3", max: 10, pct: 30 },
          { label: "Wie hast du geschlafen?", value: "Gut", max: null, pct: 75 },
          { label: "Wie ist dein Stresslevel?", value: "Mittel", max: null, pct: 50 },
        ].map((item) => (
          <div key={item.label}>
            <div className="flex justify-between mb-1.5">
              <span className="text-xs" style={{ color: MUTED }}>{item.label}</span>
              <span className="text-xs font-bold" style={{ color: BODY }}>
                {item.value}{item.max ? `/${item.max}` : ""}
              </span>
            </div>
            <div className="h-2 rounded-full" style={{ backgroundColor: PAPER }}>
              <div
                className="h-2 rounded-full transition-all duration-1000"
                style={{ width: `${item.pct}%`, backgroundColor: GREEN }}
              />
            </div>
          </div>
        ))}
      </div>
      <div className="mt-5 flex items-center gap-2" style={{ color: GREEN }}>
        <Activity className="h-4 w-4" />
        <span className="text-xs font-medium">Trend: Deutliche Verbesserung seit Woche 1</span>
      </div>
    </div>
  )
}

function TrainingMock() {
  return (
    <div className="rounded-2xl bg-white shadow-xl shadow-black/5 border p-5 sm:p-6" style={{ borderColor: LINE }}>
      <div className="flex items-center justify-between mb-4">
        <div className="text-xs font-semibold" style={{ color: BODY }}>Dein Trainingsplan</div>
        <div className="flex items-center gap-1.5">
          <svg className="h-8 w-8 -rotate-90" viewBox="0 0 36 36">
            <path d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831" fill="none" stroke="#e7e1d6" strokeWidth="3" />
            <path d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831" fill="none" stroke="#2C3E2D" strokeWidth="3" strokeDasharray="67, 100" strokeLinecap="round" />
          </svg>
          <span className="text-xs font-bold" style={{ color: BODY }}>67%</span>
        </div>
      </div>
      {[
        { name: "Brücke", sets: "3 × 12 Wdh.", done: true },
        { name: "Katzenbuckel", sets: "3 × 10 Wdh.", done: true },
        { name: "Seitliche Plank", sets: "2 × 30 Sek.", done: false },
      ].map((ex) => (
        <div key={ex.name} className="flex items-center gap-3 py-3 border-b last:border-0" style={{ borderColor: LINE }}>
          <div className="h-8 w-8 rounded-lg flex items-center justify-center" style={{ backgroundColor: ex.done ? GREEN : PAPER }}>
            {ex.done ? <CheckCircle2 className="h-4 w-4 text-white" /> : <Play className="h-4 w-4" style={{ color: MUTED }} />}
          </div>
          <div className="flex-1">
            <div className={`text-sm font-medium ${ex.done ? "line-through" : ""}`} style={{ color: ex.done ? MUTED : BODY }}>{ex.name}</div>
            <div className="text-xs" style={{ color: MUTED }}>{ex.sets}</div>
          </div>
          {!ex.done && (
            <span className="text-xs font-medium px-2 py-0.5 rounded-full" style={{ color: GREEN, backgroundColor: "rgba(44,62,45,0.10)" }}>Starten</span>
          )}
        </div>
      ))}
    </div>
  )
}

function ChatMock() {
  return (
    <div className="rounded-2xl bg-white shadow-xl shadow-black/5 border p-5 sm:p-6 flex flex-col" style={{ borderColor: LINE }}>
      <div className="text-xs font-semibold mb-4" style={{ color: BODY }}>Direkter Draht zu deinem Therapeuten</div>
      <div className="space-y-3 flex-1">
        <div className="flex gap-2">
          <div className="h-7 w-7 rounded-full flex items-center justify-center flex-shrink-0" style={{ backgroundColor: GREEN }}>
            <span className="text-[8px] text-white font-bold">TG</span>
          </div>
          <div className="rounded-2xl rounded-tl-sm px-3 py-2 max-w-[80%]" style={{ backgroundColor: PAPER }}>
            <span className="text-xs" style={{ color: BODY }}>Super Fortschritte! Die Schmerzwerte gehen stetig runter. Weiter so! 💪</span>
          </div>
        </div>
        <div className="flex justify-end">
          <div className="rounded-2xl rounded-tr-sm px-3 py-2 max-w-[80%]" style={{ backgroundColor: GREEN }}>
            <span className="text-xs text-white">Danke! Die Übungen helfen wirklich. Seitliche Plank fällt mir noch schwer.</span>
          </div>
        </div>
        <div className="flex gap-2">
          <div className="h-7 w-7 rounded-full flex items-center justify-center flex-shrink-0" style={{ backgroundColor: GREEN }}>
            <span className="text-[8px] text-white font-bold">TG</span>
          </div>
          <div className="rounded-2xl rounded-tl-sm px-3 py-2 max-w-[80%]" style={{ backgroundColor: PAPER }}>
            <span className="text-xs" style={{ color: BODY }}>Kein Problem — ich passe den Plan an. Schau gleich mal rein.</span>
          </div>
        </div>
      </div>
      <div className="flex items-center gap-2 mt-4 pt-3 border-t" style={{ borderColor: LINE }}>
        <div className="flex-1 h-9 rounded-full flex items-center px-3" style={{ backgroundColor: PAPER }}>
          <span className="text-xs" style={{ color: MUTED }}>Nachricht schreiben...</span>
        </div>
        <div className="h-9 w-9 rounded-full flex items-center justify-center" style={{ backgroundColor: GREEN }}>
          <Send className="h-4 w-4 text-white" />
        </div>
      </div>
    </div>
  )
}

/* ── Feature Data ────────────────────────────────────────────────────── */

const features = [
  {
    tag: "Check-in",
    title: "Verstehe deinen Körper — jeden Tag besser",
    description:
      "Ein kurzes tägliches Check-in erfasst Schmerz, Schlaf und Stresslevel. Dein Therapeut sieht die Daten in Echtzeit und passt deinen Plan dynamisch an. Du siehst deine Fortschritte als klare Trends.",
    details: [
      { icon: Activity, text: "Schmerzskala 0–10" },
      { icon: Heart, text: "Schlaf & Stresslevel" },
      { icon: BarChart3, text: "Wochen-Trends" },
      { icon: Sparkles, text: "Automatische Plan-Anpassung" },
    ],
    mockup: <CheckInMock />,
  },
  {
    tag: "Training",
    title: "Dein persönlicher Trainingsplan — mit Video-Anleitung",
    description:
      "Keine generischen YouTube-Übungen. Dein Therapeut stellt jede Übung individuell zusammen — mit professionellen Video-Anleitungen, Wiederholungen und Fortschrittsmessung.",
    details: [
      { icon: Dumbbell, text: "Individuelle Übungen" },
      { icon: Play, text: "Video-Anleitungen" },
      { icon: Target, text: "Klare Ziele" },
      { icon: CheckCircle2, text: "Abschluss-Tracking" },
    ],
    mockup: <TrainingMock />,
  },
  {
    tag: "Kommunikation",
    title: "Direkter Draht — dein Therapeut, immer erreichbar",
    description:
      "Fragen, Feedback, Motivation — dein Therapeut ist nur eine Nachricht entfernt. Kein Call-Center, kein Bot. Echte Menschen, echte Antworten.",
    details: [
      { icon: MessageSquare, text: "Echtzeit-Chat" },
      { icon: Brain, text: "Persönliche Beratung" },
      { icon: BookOpen, text: "Wissensdatenbank" },
      { icon: Sparkles, text: "Schnelle Antworten" },
    ],
    mockup: <ChatMock />,
  },
]

/* ── Main Component ──────────────────────────────────────────────────── */

export function FeaturesShowcase() {
  return (
    <section id="features" className="py-24 sm:py-32 relative overflow-hidden" style={{ backgroundColor: PAPER }}>
      {/* Smart line connector */}
      <div className="absolute top-0 left-1/2 -translate-x-1/2 flex flex-col items-center">
        <div className="smart-line h-16" />
        <div className="smart-line-dot animate-dot-pulse" />
      </div>

      <div className="container mx-auto px-4 max-w-6xl">
        <ScrollReveal className="text-center mb-12 sm:mb-20">
          <span className="text-sm font-medium uppercase tracking-wider" style={{ color: GREEN }}>
            Die App
          </span>
          <h2 className="mt-3 text-3xl sm:text-4xl lg:text-5xl tracking-tight" style={{ fontFamily: "var(--font-serif)", fontWeight: 600, color: INK }}>
            Alles für deine Genesung —{" "}
            <span style={{ color: GREEN }}>
              in einer App
            </span>
          </h2>
        </ScrollReveal>

        <div className="space-y-16 sm:space-y-24 lg:space-y-32">
          {features.map((feature, i) => (
            <div
              key={feature.tag}
              className={`flex flex-col ${
                i % 2 === 0 ? "lg:flex-row" : "lg:flex-row-reverse"
              } gap-6 sm:gap-10 lg:gap-16 items-center`}
            >
              {/* Text */}
              <RevealSide direction={i % 2 === 0 ? "left" : "right"} className="flex-1">
                <span
                  className="inline-flex items-center rounded-full px-3 py-1 text-xs font-semibold"
                  style={{ color: GREEN, backgroundColor: "rgba(44,62,45,0.10)" }}
                >
                  {feature.tag}
                </span>
                <h3 className="mt-4 text-2xl sm:text-3xl leading-tight" style={{ fontFamily: "var(--font-serif)", fontWeight: 600, color: INK }}>
                  {feature.title}
                </h3>
                <p className="mt-4 leading-relaxed" style={{ color: MUTED }}>
                  {feature.description}
                </p>
                <div className="mt-6 grid grid-cols-2 gap-3">
                  {feature.details.map((d) => (
                    <div key={d.text} className="flex items-center gap-2">
                      <d.icon className="h-4 w-4 flex-shrink-0" style={{ color: GREEN }} />
                      <span className="text-sm" style={{ color: BODY }}>{d.text}</span>
                    </div>
                  ))}
                </div>
              </RevealSide>

              {/* Mockup */}
              <RevealSide
                direction={i % 2 === 0 ? "right" : "left"}
                delay={150}
                className="flex-1 w-full max-w-md"
              >
                {feature.mockup}
              </RevealSide>
            </div>
          ))}
        </div>
      </div>
    </section>
  )
}
