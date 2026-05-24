"use client"

/**
 * „Praxis OS entwickelt sich weiter" — Update-Meldung für Patienten.
 *
 * Zeigt den neuesten Changelog-Eintrag genau EINMAL: gemerkt wird die zuletzt
 * gesehene Version in localStorage (`praxis_os_whatsnew_seen`). Erscheint mit
 * kurzer Verzögerung nach dem Laden, ist jederzeit schließbar. Beim Schließen
 * (oder „Los geht's") gilt die aktuelle Version als gesehen.
 *
 * Stil: eigenständiges Premium-Overlay analog zu MilestonePopup (Backdrop-Blur,
 * sanftes Scale-In, emerald/teal-Akzent). Mobile-first.
 */

import { useEffect, useState, useCallback } from "react"
import Link from "next/link"
import { Sparkles, X, ArrowRight } from "lucide-react"
import {
  CHANGELOG,
  LATEST_VERSION,
  formatChangelogDate,
  type ChangelogBadge,
} from "@/lib/changelog"

const SEEN_KEY = "praxis_os_whatsnew_seen"

export function markChangelogSeen() {
  try {
    localStorage.setItem(SEEN_KEY, LATEST_VERSION)
  } catch {
    /* localStorage nicht verfügbar — ignorieren */
  }
}

function badgeClasses(badge: ChangelogBadge): string {
  return badge === "Neu"
    ? "bg-emerald-100 text-emerald-700"
    : "bg-blue-100 text-blue-700"
}

export function WhatsNewDialog() {
  const [open, setOpen] = useState(false)
  const [visible, setVisible] = useState(false)
  const entry = CHANGELOG[0]

  useEffect(() => {
    if (typeof window === "undefined" || !entry) return
    let seen: string | null = null
    try {
      seen = localStorage.getItem(SEEN_KEY)
    } catch {
      /* ignore */
    }
    if (seen === LATEST_VERSION) return

    const t = setTimeout(() => {
      setOpen(true)
      // einen Frame später sichtbar schalten → Transition greift
      requestAnimationFrame(() => setVisible(true))
    }, 700)
    return () => clearTimeout(t)
  }, [entry])

  const close = useCallback(() => {
    setVisible(false)
    markChangelogSeen()
    setTimeout(() => setOpen(false), 300)
  }, [])

  if (!open || !entry) return null

  return (
    <div
      className="fixed inset-0 z-[100] flex items-end sm:items-center justify-center"
      role="dialog"
      aria-modal="true"
      aria-label="Was ist neu in Praxis OS"
      onClick={close}
    >
      {/* Backdrop */}
      <div
        className="absolute inset-0 bg-slate-900/50 backdrop-blur-sm"
        style={{ opacity: visible ? 1 : 0, transition: "opacity 0.3s ease" }}
      />

      {/* Card */}
      <div
        className="relative w-full sm:max-w-md mx-auto sm:mx-6 bg-white rounded-t-3xl sm:rounded-3xl shadow-2xl overflow-hidden flex flex-col max-h-[90vh]"
        style={{
          transform: visible
            ? "translateY(0) scale(1)"
            : "translateY(24px) scale(0.98)",
          opacity: visible ? 1 : 0,
          transition:
            "transform 0.45s cubic-bezier(0.16, 1, 0.3, 1), opacity 0.35s ease",
        }}
        onClick={(e) => e.stopPropagation()}
      >
        {/* ── Header (Gradient) ─────────────────────────────────── */}
        <div className="relative bg-gradient-to-br from-emerald-600 via-emerald-600 to-teal-600 px-6 pt-7 pb-6 text-white shrink-0">
          {/* Deko-Glow */}
          <div className="absolute -top-8 -right-6 h-32 w-32 rounded-full bg-white/10 blur-2xl pointer-events-none" />
          <button
            onClick={close}
            aria-label="Schließen"
            className="absolute top-4 right-4 h-8 w-8 rounded-full bg-white/15 hover:bg-white/25 flex items-center justify-center transition-colors"
          >
            <X className="h-4 w-4" />
          </button>

          <div className="relative flex items-center gap-2 mb-3">
            <span className="inline-flex items-center justify-center h-9 w-9 rounded-xl bg-white/15">
              <Sparkles className="h-5 w-5" />
            </span>
            <span className="text-[11px] font-semibold uppercase tracking-[0.18em] text-emerald-50/90">
              {formatChangelogDate(entry.date)} · Update
            </span>
          </div>
          <h2 className="relative text-2xl font-bold leading-snug">
            {entry.headline}
          </h2>
          {entry.intro && (
            <p className="relative text-sm text-emerald-50/90 mt-2 leading-relaxed">
              {entry.intro}
            </p>
          )}
        </div>

        {/* ── Feature-Liste (scrollbar) ─────────────────────────── */}
        <div className="px-5 py-5 space-y-3 overflow-y-auto">
          {entry.items.map((item, i) => (
            <div
              key={i}
              className="flex items-start gap-3.5 rounded-2xl border border-slate-100 bg-slate-50/60 p-3.5"
              style={{
                opacity: visible ? 1 : 0,
                transform: visible ? "translateY(0)" : "translateY(8px)",
                transition: `opacity 0.4s ease ${0.15 + i * 0.07}s, transform 0.4s ease ${
                  0.15 + i * 0.07
                }s`,
              }}
            >
              <span className="shrink-0 text-2xl leading-none mt-0.5 select-none">
                {item.emoji}
              </span>
              <div className="min-w-0">
                <div className="flex items-center gap-2 flex-wrap">
                  <h3 className="font-semibold text-slate-800 text-[15px]">
                    {item.title}
                  </h3>
                  {item.badge && (
                    <span
                      className={`text-[10px] font-bold uppercase tracking-wide px-1.5 py-0.5 rounded ${badgeClasses(
                        item.badge
                      )}`}
                    >
                      {item.badge}
                    </span>
                  )}
                </div>
                <p className="text-sm text-slate-500 leading-relaxed mt-0.5">
                  {item.text}
                </p>
              </div>
            </div>
          ))}
        </div>

        {/* ── Footer ────────────────────────────────────────────── */}
        <div className="px-5 pb-5 pt-1 shrink-0 space-y-3">
          <button
            onClick={close}
            className="w-full inline-flex items-center justify-center h-12 rounded-2xl bg-gradient-to-r from-emerald-500 to-teal-500 text-white font-semibold text-[15px] shadow-lg shadow-emerald-500/25 hover:shadow-emerald-500/40 active:scale-[0.98] transition-all duration-200"
          >
            Los geht&apos;s
          </button>
          <Link
            href="/app/neuigkeiten"
            onClick={close}
            className="flex items-center justify-center gap-1 text-xs font-medium text-slate-400 hover:text-emerald-600 transition-colors"
          >
            Alle Neuigkeiten ansehen
            <ArrowRight className="h-3 w-3" />
          </Link>
        </div>
      </div>
    </div>
  )
}
