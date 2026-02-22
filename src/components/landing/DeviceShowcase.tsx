"use client"

import { ScrollReveal } from "./ScrollReveal"
import { Activity, CheckCircle2, Dumbbell, MessageSquare, Play, Send } from "lucide-react"

/* ── Mini App Screen Mockups ─────────────────────────────────────────── */

function CheckInScreen() {
  return (
    <div className="p-3 space-y-2.5">
      <div className="text-[10px] font-semibold text-slate-700">Tägliches Check-in</div>
      {[
        { label: "Schmerz", value: "3/10", pct: 30, color: "from-emerald-400 to-teal-400" },
        { label: "Schlaf", value: "Gut", pct: 75, color: "from-blue-400 to-indigo-400" },
        { label: "Stress", value: "Mittel", pct: 50, color: "from-amber-400 to-orange-400" },
      ].map((item) => (
        <div key={item.label}>
          <div className="flex justify-between mb-1">
            <span className="text-[8px] text-slate-500">{item.label}</span>
            <span className="text-[8px] font-semibold text-slate-700">{item.value}</span>
          </div>
          <div className="h-1.5 rounded-full bg-slate-100">
            <div
              className={`h-1.5 rounded-full bg-gradient-to-r ${item.color}`}
              style={{ width: `${item.pct}%` }}
            />
          </div>
        </div>
      ))}
      <div className="flex items-center gap-1 pt-1">
        <Activity className="h-3 w-3 text-emerald-500" />
        <span className="text-[8px] text-emerald-600 font-medium">Trend: Verbesserung</span>
      </div>
    </div>
  )
}

function TrainingScreen() {
  return (
    <div className="p-3 space-y-2">
      <div className="text-[10px] font-semibold text-slate-700">Heutiges Training</div>
      {[
        { name: "Brücke", sets: "3×12", done: true },
        { name: "Katzenbuckel", sets: "3×10", done: true },
        { name: "Seitliche Plank", sets: "2×30s", done: false },
      ].map((ex) => (
        <div key={ex.name} className="flex items-center gap-2 py-1 border-b border-slate-50 last:border-0">
          <div className={`h-5 w-5 rounded flex items-center justify-center ${ex.done ? "bg-emerald-500" : "bg-slate-100"}`}>
            {ex.done ? (
              <CheckCircle2 className="h-3 w-3 text-white" />
            ) : (
              <Play className="h-2.5 w-2.5 text-slate-400" />
            )}
          </div>
          <span className={`text-[9px] flex-1 ${ex.done ? "text-slate-400 line-through" : "text-slate-700 font-medium"}`}>
            {ex.name}
          </span>
          <span className="text-[8px] text-slate-400">{ex.sets}</span>
        </div>
      ))}
      <div className="flex items-center gap-2 pt-1">
        <Dumbbell className="h-3 w-3 text-blue-500" />
        <span className="text-[8px] text-blue-600 font-medium">67% abgeschlossen</span>
      </div>
    </div>
  )
}

function ChatScreen() {
  return (
    <div className="p-3 space-y-2 flex flex-col h-full">
      <div className="text-[10px] font-semibold text-slate-700">Chat mit Therapeut</div>
      <div className="flex-1 space-y-2">
        <div className="flex gap-1.5">
          <div className="h-4 w-4 rounded-full bg-emerald-500 flex items-center justify-center flex-shrink-0">
            <span className="text-[6px] text-white font-bold">TG</span>
          </div>
          <div className="bg-slate-100 rounded-lg rounded-tl-none px-2 py-1 max-w-[80%]">
            <span className="text-[8px] text-slate-700">Ihre Fortschritte sehen gut aus! Weiter so.</span>
          </div>
        </div>
        <div className="flex justify-end">
          <div className="bg-emerald-500 rounded-lg rounded-tr-none px-2 py-1 max-w-[80%]">
            <span className="text-[8px] text-white">Danke! Die Übungen helfen wirklich.</span>
          </div>
        </div>
      </div>
      <div className="flex items-center gap-1.5 mt-auto">
        <div className="flex-1 h-5 rounded-full bg-slate-100 flex items-center px-2">
          <span className="text-[7px] text-slate-400">Nachricht...</span>
        </div>
        <div className="h-5 w-5 rounded-full bg-emerald-500 flex items-center justify-center">
          <Send className="h-2.5 w-2.5 text-white" />
        </div>
      </div>
    </div>
  )
}

/* ── Device Frames ───────────────────────────────────────────────────── */

function PhoneFrame({ children }: { children: React.ReactNode }) {
  return (
    <div className="relative">
      <div className="rounded-[1.8rem] bg-slate-800 p-1.5 shadow-2xl shadow-black/30">
        {/* Notch */}
        <div className="absolute top-0 left-1/2 -translate-x-1/2 w-16 h-4 bg-slate-800 rounded-b-xl z-10" />
        <div className="rounded-[1.4rem] bg-white overflow-hidden w-36 h-64 sm:w-40 sm:h-72">
          {children}
        </div>
      </div>
    </div>
  )
}

function TabletFrame({ children }: { children: React.ReactNode }) {
  return (
    <div className="rounded-[1.2rem] bg-slate-800 p-1.5 shadow-2xl shadow-black/30">
      <div className="rounded-[0.8rem] bg-white overflow-hidden w-48 h-64 sm:w-56 sm:h-72">
        {children}
      </div>
    </div>
  )
}

function LaptopFrame({ children }: { children: React.ReactNode }) {
  return (
    <div className="flex flex-col items-center">
      {/* Screen */}
      <div className="rounded-t-lg bg-slate-800 p-1.5 shadow-2xl shadow-black/30">
        <div className="rounded-sm bg-white overflow-hidden w-64 h-44 sm:w-80 sm:h-52">
          {children}
        </div>
      </div>
      {/* Base/Keyboard */}
      <div className="w-72 sm:w-[22rem] h-2.5 bg-slate-700 rounded-b-lg" />
      <div className="w-48 sm:w-56 h-1 bg-slate-600 rounded-b" />
    </div>
  )
}

/* ── Main Component ──────────────────────────────────────────────────── */

export function DeviceShowcase() {
  return (
    <section className="relative py-24 sm:py-32 bg-[#faf9f7] overflow-hidden">
      {/* Connecting smart line from hero */}
      <div className="absolute top-0 left-1/2 -translate-x-1/2 flex flex-col items-center">
        <div className="smart-line h-16" />
        <div className="smart-line-dot animate-dot-pulse" />
      </div>

      <div className="container mx-auto px-4 max-w-6xl">
        <ScrollReveal className="text-center mb-16">
          <h2 className="text-3xl sm:text-4xl lg:text-5xl font-bold text-slate-900 tracking-tight">
            Ihre Therapie.{" "}
            <span className="bg-gradient-to-r from-emerald-600 to-teal-500 bg-clip-text text-transparent">
              Überall.
            </span>
          </h2>
          <p className="mt-4 text-lg text-slate-500 max-w-xl mx-auto">
            Auf jedem Gerät, zu jeder Zeit. Ihre Behandlung passt sich Ihrem
            Leben an.
          </p>
        </ScrollReveal>

        {/* Device mockups */}
        <ScrollReveal>
          <div className="flex items-end justify-center gap-4 sm:gap-8 lg:gap-12">
            {/* Laptop */}
            <div className="hidden md:block animate-float-slow">
              <LaptopFrame>
                <div className="p-3 h-full">
                  <div className="text-[9px] font-semibold text-slate-700 mb-2">Dashboard — Übersicht</div>
                  <div className="grid grid-cols-3 gap-1.5 mb-2">
                    {[
                      { label: "Check-ins", value: "28", sub: "diesen Monat" },
                      { label: "Übungen", value: "84", sub: "absolviert" },
                      { label: "Trend", value: "↓ 40%", sub: "Schmerz" },
                    ].map((s) => (
                      <div key={s.label} className="bg-slate-50 rounded p-1.5">
                        <div className="text-[7px] text-slate-400">{s.label}</div>
                        <div className="text-[11px] font-bold text-slate-800">{s.value}</div>
                        <div className="text-[6px] text-slate-400">{s.sub}</div>
                      </div>
                    ))}
                  </div>
                  <div className="text-[8px] text-slate-500 mb-1">Schmerzverlauf</div>
                  <div className="flex items-end gap-0.5 h-10">
                    {[7, 6, 5, 6, 4, 3, 3, 4, 3, 2].map((v, i) => (
                      <div
                        key={i}
                        className="flex-1 rounded-t-sm bg-gradient-to-t from-emerald-500 to-teal-400"
                        style={{ height: `${(v / 10) * 100}%`, opacity: 0.4 + i * 0.06 }}
                      />
                    ))}
                  </div>
                </div>
              </LaptopFrame>
            </div>

            {/* Tablet */}
            <div className="hidden sm:block animate-float-delayed">
              <TabletFrame>
                <TrainingScreen />
              </TabletFrame>
            </div>

            {/* Phone — always visible */}
            <div className="animate-float">
              <PhoneFrame>
                <CheckInScreen />
              </PhoneFrame>
            </div>

            {/* Second phone on mobile for visual interest */}
            <div className="sm:hidden animate-float-delayed">
              <PhoneFrame>
                <ChatScreen />
              </PhoneFrame>
            </div>
          </div>
        </ScrollReveal>
      </div>
    </section>
  )
}
