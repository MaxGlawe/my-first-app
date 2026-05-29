"use client"

import { ScrollReveal } from "./ScrollReveal"
import { Activity, CheckCircle2, Dumbbell, MessageSquare, Play, Send } from "lucide-react"

// Premium-Markenwelt (Masterclass-Format)
const PAPER = "#F8F5F0"
const INK = "#0f172a"
const GREEN = "#2C3E2D"
const MUTED = "#64748b"
const LINE = "#e7e1d6"

/* ── Mini App Screen Mockups ─────────────────────────────────────────── */

function CheckInScreen() {
  return (
    <div className="p-3 space-y-2.5">
      <div className="text-[10px] font-semibold" style={{ color: "#334155" }}>Tägliches Check-in</div>
      {[
        { label: "Schmerz", value: "3/10", pct: 30 },
        { label: "Schlaf", value: "Gut", pct: 75 },
        { label: "Stress", value: "Mittel", pct: 50 },
      ].map((item) => (
        <div key={item.label}>
          <div className="flex justify-between mb-1">
            <span className="text-[8px]" style={{ color: MUTED }}>{item.label}</span>
            <span className="text-[8px] font-semibold" style={{ color: "#334155" }}>{item.value}</span>
          </div>
          <div className="h-1.5 rounded-full" style={{ backgroundColor: PAPER }}>
            <div
              className="h-1.5 rounded-full"
              style={{ width: `${item.pct}%`, backgroundColor: GREEN }}
            />
          </div>
        </div>
      ))}
      <div className="flex items-center gap-1 pt-1">
        <Activity className="h-3 w-3" style={{ color: GREEN }} />
        <span className="text-[8px] font-medium" style={{ color: GREEN }}>Trend: Verbesserung</span>
      </div>
    </div>
  )
}

function TrainingScreen() {
  return (
    <div className="p-3 space-y-2">
      <div className="text-[10px] font-semibold" style={{ color: "#334155" }}>Heutiges Training</div>
      {[
        { name: "Brücke", sets: "3×12", done: true },
        { name: "Katzenbuckel", sets: "3×10", done: true },
        { name: "Seitliche Plank", sets: "2×30s", done: false },
      ].map((ex) => (
        <div key={ex.name} className="flex items-center gap-2 py-1 border-b last:border-0" style={{ borderColor: LINE }}>
          <div className="h-5 w-5 rounded flex items-center justify-center" style={{ backgroundColor: ex.done ? GREEN : PAPER }}>
            {ex.done ? (
              <CheckCircle2 className="h-3 w-3 text-white" />
            ) : (
              <Play className="h-2.5 w-2.5" style={{ color: MUTED }} />
            )}
          </div>
          <span
            className={`text-[9px] flex-1 ${ex.done ? "line-through" : "font-medium"}`}
            style={{ color: ex.done ? MUTED : "#334155" }}
          >
            {ex.name}
          </span>
          <span className="text-[8px]" style={{ color: MUTED }}>{ex.sets}</span>
        </div>
      ))}
      <div className="flex items-center gap-2 pt-1">
        <Dumbbell className="h-3 w-3" style={{ color: GREEN }} />
        <span className="text-[8px] font-medium" style={{ color: GREEN }}>67% abgeschlossen</span>
      </div>
    </div>
  )
}

function ChatScreen() {
  return (
    <div className="p-3 space-y-2 flex flex-col h-full">
      <div className="text-[10px] font-semibold" style={{ color: "#334155" }}>Chat mit Therapeut</div>
      <div className="flex-1 space-y-2">
        <div className="flex gap-1.5">
          <div className="h-4 w-4 rounded-full flex items-center justify-center flex-shrink-0" style={{ backgroundColor: GREEN }}>
            <span className="text-[6px] text-white font-bold">TG</span>
          </div>
          <div className="rounded-lg rounded-tl-none px-2 py-1 max-w-[80%]" style={{ backgroundColor: PAPER }}>
            <span className="text-[8px]" style={{ color: "#334155" }}>Deine Fortschritte sehen gut aus! Weiter so.</span>
          </div>
        </div>
        <div className="flex justify-end">
          <div className="rounded-lg rounded-tr-none px-2 py-1 max-w-[80%]" style={{ backgroundColor: GREEN }}>
            <span className="text-[8px] text-white">Danke! Die Übungen helfen wirklich.</span>
          </div>
        </div>
      </div>
      <div className="flex items-center gap-1.5 mt-auto">
        <div className="flex-1 h-5 rounded-full flex items-center px-2" style={{ backgroundColor: PAPER }}>
          <span className="text-[7px]" style={{ color: MUTED }}>Nachricht...</span>
        </div>
        <div className="h-5 w-5 rounded-full flex items-center justify-center" style={{ backgroundColor: GREEN }}>
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
      <div className="rounded-[1.8rem] p-1.5 shadow-2xl" style={{ backgroundColor: INK, boxShadow: "0 22px 44px rgba(15,23,42,0.18)" }}>
        {/* Notch */}
        <div className="absolute top-0 left-1/2 -translate-x-1/2 w-16 h-4 rounded-b-xl z-10" style={{ backgroundColor: INK }} />
        <div className="rounded-[1.4rem] bg-white overflow-hidden w-32 h-56 sm:w-40 sm:h-72">
          {children}
        </div>
      </div>
    </div>
  )
}

function TabletFrame({ children }: { children: React.ReactNode }) {
  return (
    <div className="rounded-[1.2rem] p-1.5 shadow-2xl" style={{ backgroundColor: INK, boxShadow: "0 22px 44px rgba(15,23,42,0.18)" }}>
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
      <div className="rounded-t-lg p-1.5 shadow-2xl" style={{ backgroundColor: INK, boxShadow: "0 22px 44px rgba(15,23,42,0.18)" }}>
        <div className="rounded-sm bg-white overflow-hidden w-64 h-44 sm:w-80 sm:h-52">
          {children}
        </div>
      </div>
      {/* Base/Keyboard */}
      <div className="w-72 sm:w-[22rem] h-2.5 rounded-b-lg" style={{ backgroundColor: "#1e293b" }} />
      <div className="w-48 sm:w-56 h-1 rounded-b" style={{ backgroundColor: "#334155" }} />
    </div>
  )
}

/* ── Main Component ──────────────────────────────────────────────────── */

export function DeviceShowcase() {
  return (
    <section className="relative py-16 sm:py-24 lg:py-32 overflow-hidden" style={{ backgroundColor: "#ffffff" }}>
      {/* Connecting smart line from hero */}
      <div className="absolute top-0 left-1/2 -translate-x-1/2 flex flex-col items-center">
        <div className="smart-line h-16" />
        <div className="smart-line-dot animate-dot-pulse" />
      </div>

      <div className="container mx-auto px-4 max-w-6xl">
        <ScrollReveal className="text-center mb-10 sm:mb-16">
          <h2 className="text-3xl sm:text-4xl lg:text-5xl tracking-tight" style={{ fontFamily: "var(--font-serif)", fontWeight: 600, color: INK }}>
            Deine Therapie.{" "}
            <span style={{ color: GREEN }}>
              Überall.
            </span>
          </h2>
          <p className="mt-4 text-lg max-w-xl mx-auto" style={{ color: MUTED }}>
            Auf jedem Gerät, zu jeder Zeit. Deine Behandlung passt sich deinem
            Leben an.
          </p>
        </ScrollReveal>

        {/* Device mockups */}
        <ScrollReveal>
          <div className="flex items-end justify-center gap-3 sm:gap-8 lg:gap-12">
            {/* Laptop */}
            <div className="hidden md:block animate-float-slow">
              <LaptopFrame>
                <div className="p-3 h-full">
                  <div className="text-[9px] font-semibold mb-2" style={{ color: "#334155" }}>Dashboard — Übersicht</div>
                  <div className="grid grid-cols-3 gap-1.5 mb-2">
                    {[
                      { label: "Check-ins", value: "28", sub: "diesen Monat" },
                      { label: "Übungen", value: "84", sub: "absolviert" },
                      { label: "Trend", value: "↓ 40%", sub: "Schmerz" },
                    ].map((s) => (
                      <div key={s.label} className="rounded p-1.5" style={{ backgroundColor: PAPER }}>
                        <div className="text-[7px]" style={{ color: MUTED }}>{s.label}</div>
                        <div className="text-[11px] font-bold" style={{ color: "#334155" }}>{s.value}</div>
                        <div className="text-[6px]" style={{ color: MUTED }}>{s.sub}</div>
                      </div>
                    ))}
                  </div>
                  <div className="text-[8px] mb-1" style={{ color: MUTED }}>Schmerzverlauf</div>
                  <div className="flex items-end gap-0.5 h-10">
                    {[7, 6, 5, 6, 4, 3, 3, 4, 3, 2].map((v, i) => (
                      <div
                        key={i}
                        className="flex-1 rounded-t-sm"
                        style={{ height: `${(v / 10) * 100}%`, opacity: 0.4 + i * 0.06, backgroundColor: GREEN }}
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
