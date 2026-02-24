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
    <div className="rounded-2xl bg-white shadow-xl shadow-black/5 border border-slate-100 p-5 sm:p-6">
      <div className="text-xs font-semibold text-slate-800 mb-4">
        Tägliches Check-in
      </div>
      <div className="space-y-4">
        {[
          { label: "Wie stark sind Ihre Schmerzen?", value: "3", max: 10, pct: 30, gradient: "from-emerald-400 to-teal-400" },
          { label: "Wie haben Sie geschlafen?", value: "Gut", max: null, pct: 75, gradient: "from-blue-400 to-indigo-400" },
          { label: "Wie ist Ihr Stresslevel?", value: "Mittel", max: null, pct: 50, gradient: "from-amber-400 to-orange-400" },
        ].map((item) => (
          <div key={item.label}>
            <div className="flex justify-between mb-1.5">
              <span className="text-xs text-slate-500">{item.label}</span>
              <span className="text-xs font-bold text-slate-700">
                {item.value}{item.max ? `/${item.max}` : ""}
              </span>
            </div>
            <div className="h-2 rounded-full bg-slate-100">
              <div
                className={`h-2 rounded-full bg-gradient-to-r ${item.gradient} transition-all duration-1000`}
                style={{ width: `${item.pct}%` }}
              />
            </div>
          </div>
        ))}
      </div>
      <div className="mt-5 flex items-center gap-2 text-emerald-600">
        <Activity className="h-4 w-4" />
        <span className="text-xs font-medium">Trend: Deutliche Verbesserung seit Woche 1</span>
      </div>
    </div>
  )
}

function TrainingMock() {
  return (
    <div className="rounded-2xl bg-white shadow-xl shadow-black/5 border border-slate-100 p-5 sm:p-6">
      <div className="flex items-center justify-between mb-4">
        <div className="text-xs font-semibold text-slate-800">Ihr Trainingsplan</div>
        <div className="flex items-center gap-1.5">
          <svg className="h-8 w-8 -rotate-90" viewBox="0 0 36 36">
            <path d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831" fill="none" stroke="#e2e8f0" strokeWidth="3" />
            <path d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831" fill="none" stroke="url(#pg)" strokeWidth="3" strokeDasharray="67, 100" strokeLinecap="round" />
            <defs><linearGradient id="pg" x1="0%" y1="0%" x2="100%" y2="0%"><stop offset="0%" stopColor="#10b981" /><stop offset="100%" stopColor="#14b8a6" /></linearGradient></defs>
          </svg>
          <span className="text-xs font-bold text-slate-700">67%</span>
        </div>
      </div>
      {[
        { name: "Brücke", sets: "3 × 12 Wdh.", done: true },
        { name: "Katzenbuckel", sets: "3 × 10 Wdh.", done: true },
        { name: "Seitliche Plank", sets: "2 × 30 Sek.", done: false },
      ].map((ex) => (
        <div key={ex.name} className="flex items-center gap-3 py-3 border-b border-slate-50 last:border-0">
          <div className={`h-8 w-8 rounded-lg flex items-center justify-center ${ex.done ? "bg-emerald-500" : "bg-slate-100"}`}>
            {ex.done ? <CheckCircle2 className="h-4 w-4 text-white" /> : <Play className="h-4 w-4 text-slate-400" />}
          </div>
          <div className="flex-1">
            <div className={`text-sm font-medium ${ex.done ? "text-slate-400 line-through" : "text-slate-800"}`}>{ex.name}</div>
            <div className="text-xs text-slate-400">{ex.sets}</div>
          </div>
          {!ex.done && (
            <span className="text-xs font-medium text-emerald-600 bg-emerald-50 px-2 py-0.5 rounded-full">Starten</span>
          )}
        </div>
      ))}
    </div>
  )
}

function ChatMock() {
  return (
    <div className="rounded-2xl bg-white shadow-xl shadow-black/5 border border-slate-100 p-5 sm:p-6 flex flex-col">
      <div className="text-xs font-semibold text-slate-800 mb-4">Direkter Draht zu Ihrem Therapeuten</div>
      <div className="space-y-3 flex-1">
        <div className="flex gap-2">
          <div className="h-7 w-7 rounded-full bg-gradient-to-br from-emerald-500 to-teal-500 flex items-center justify-center flex-shrink-0">
            <span className="text-[8px] text-white font-bold">TG</span>
          </div>
          <div className="bg-slate-50 rounded-2xl rounded-tl-sm px-3 py-2 max-w-[80%]">
            <span className="text-xs text-slate-700">Super Fortschritte! Die Schmerzwerte gehen stetig runter. Weiter so! 💪</span>
          </div>
        </div>
        <div className="flex justify-end">
          <div className="bg-emerald-500 rounded-2xl rounded-tr-sm px-3 py-2 max-w-[80%]">
            <span className="text-xs text-white">Danke! Die Übungen helfen wirklich. Seitliche Plank fällt mir noch schwer.</span>
          </div>
        </div>
        <div className="flex gap-2">
          <div className="h-7 w-7 rounded-full bg-gradient-to-br from-emerald-500 to-teal-500 flex items-center justify-center flex-shrink-0">
            <span className="text-[8px] text-white font-bold">TG</span>
          </div>
          <div className="bg-slate-50 rounded-2xl rounded-tl-sm px-3 py-2 max-w-[80%]">
            <span className="text-xs text-slate-700">Kein Problem — ich passe den Plan an. Schauen Sie gleich mal rein.</span>
          </div>
        </div>
      </div>
      <div className="flex items-center gap-2 mt-4 pt-3 border-t border-slate-100">
        <div className="flex-1 h-9 rounded-full bg-slate-50 flex items-center px-3">
          <span className="text-xs text-slate-400">Nachricht schreiben...</span>
        </div>
        <div className="h-9 w-9 rounded-full bg-gradient-to-r from-emerald-500 to-teal-500 flex items-center justify-center">
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
    tagColor: "bg-emerald-50 text-emerald-700",
    title: "Verstehen Sie Ihren Körper — jeden Tag besser",
    description:
      "Ein kurzes tägliches Check-in erfasst Schmerz, Schlaf und Stresslevel. Ihr Therapeut sieht die Daten in Echtzeit und passt Ihren Plan dynamisch an. Sie sehen Ihre Fortschritte als klare Trends.",
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
    tagColor: "bg-blue-50 text-blue-700",
    title: "Ihr persönlicher Trainingsplan — mit Video-Anleitung",
    description:
      "Keine generischen YouTube-Übungen. Ihr Therapeut stellt jede Übung individuell zusammen — mit professionellen Video-Anleitungen, Wiederholungen und Fortschrittsmessung.",
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
    tagColor: "bg-violet-50 text-violet-700",
    title: "Direkter Draht — Ihr Therapeut, immer erreichbar",
    description:
      "Fragen, Feedback, Motivation — Ihr Therapeut ist nur eine Nachricht entfernt. Kein Call-Center, kein Bot. Echte Menschen, echte Antworten.",
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
    <section id="features" className="py-24 sm:py-32 bg-white relative overflow-hidden">
      {/* Smart line connector */}
      <div className="absolute top-0 left-1/2 -translate-x-1/2 flex flex-col items-center">
        <div className="smart-line h-16" />
        <div className="smart-line-dot animate-dot-pulse" />
      </div>

      <div className="container mx-auto px-4 max-w-6xl">
        <ScrollReveal className="text-center mb-12 sm:mb-20">
          <span className="text-sm font-medium text-emerald-600 uppercase tracking-wider">
            Die App
          </span>
          <h2 className="mt-3 text-3xl sm:text-4xl lg:text-5xl font-bold text-slate-900 tracking-tight">
            Alles für Ihre Genesung —{" "}
            <span className="bg-gradient-to-r from-emerald-600 to-teal-500 bg-clip-text text-transparent">
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
                <span className={`inline-flex items-center rounded-full px-3 py-1 text-xs font-semibold ${feature.tagColor}`}>
                  {feature.tag}
                </span>
                <h3 className="mt-4 text-2xl sm:text-3xl font-bold text-slate-900 leading-tight">
                  {feature.title}
                </h3>
                <p className="mt-4 text-slate-500 leading-relaxed">
                  {feature.description}
                </p>
                <div className="mt-6 grid grid-cols-2 gap-3">
                  {feature.details.map((d) => (
                    <div key={d.text} className="flex items-center gap-2">
                      <d.icon className="h-4 w-4 text-emerald-500 flex-shrink-0" />
                      <span className="text-sm text-slate-600">{d.text}</span>
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
