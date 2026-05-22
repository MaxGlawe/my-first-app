"use client"

import { useEffect, useRef, useState } from "react"
import { Check, Loader2, Mail } from "lucide-react"
import { fireLeadPixel } from "./MetaPixel"

/**
 * PROJ-23: Lead capture form (Vorname + E-Mail).
 * Honeypot + submit-timing anti-spam, fires the Pixel `Lead` event with a
 * dedup eventID, then shows a Double-Opt-in "check your inbox" confirmation.
 */
export function LeadForm() {
  const [firstName, setFirstName] = useState("")
  const [email, setEmail] = useState("")
  const [website, setWebsite] = useState("") // honeypot
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [done, setDone] = useState(false)
  const renderedAt = useRef<number>(0)

  useEffect(() => {
    renderedAt.current = Date.now()
  }, [])

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    if (loading) return
    setError(null)

    if (!firstName.trim() || !email.trim()) {
      setError("Bitte gib deinen Vornamen und deine E-Mail-Adresse ein.")
      return
    }

    setLoading(true)
    const params = new URLSearchParams(window.location.search)
    const eventId =
      typeof crypto !== "undefined" && "randomUUID" in crypto
        ? crypto.randomUUID()
        : `${Date.now()}-${Math.random()}`

    try {
      const res = await fetch("/api/leads/schmerzcheck", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          firstName: firstName.trim(),
          email: email.trim(),
          website, // honeypot
          _t: renderedAt.current,
          eventId,
          utm_source: params.get("utm_source"),
          utm_medium: params.get("utm_medium"),
          utm_campaign: params.get("utm_campaign"),
          utm_content: params.get("utm_content"),
          utm_term: params.get("utm_term"),
          fbclid: params.get("fbclid"),
          referrer: document.referrer || null,
        }),
      })
      const data = await res.json().catch(() => ({}))

      if (!res.ok) {
        setError(data?.error || "Etwas ist schiefgelaufen. Bitte versuche es erneut.")
        setLoading(false)
        return
      }

      fireLeadPixel(data?.eventId || eventId)
      setDone(true)
    } catch {
      setError("Verbindung fehlgeschlagen. Bitte prüfe deine Internetverbindung.")
      setLoading(false)
    }
  }

  if (done) {
    return (
      <div className="sc-rise relative rounded-[20px] border border-slate-200 bg-white p-9 text-center shadow-[0_1px_3px_rgba(15,23,42,0.04),0_12px_32px_rgba(15,23,42,0.06)]">
        <div className="mx-auto mb-5 flex h-14 w-14 items-center justify-center rounded-full bg-emerald-50 text-emerald-800">
          <Mail className="h-7 w-7" />
        </div>
        <h2 className="[font-family:var(--font-cormorant)] text-[28px] font-medium italic leading-tight text-emerald-800">
          Fast geschafft — schau in dein Postfach.
        </h2>
        <p className="mx-auto mt-3 max-w-sm text-[15px] leading-relaxed text-slate-600">
          Wir haben dir eine E-Mail an <strong className="font-semibold text-slate-900">{email}</strong>{" "}
          geschickt. Klicke auf den Link darin, um deinen Schmerzcheck zu bestätigen und
          zu starten.
        </p>
        <p className="mt-4 text-[13px] text-slate-400">
          Keine E-Mail erhalten? Sieh kurz im Spam-Ordner nach — der Link bleibt 30 Tage gültig.
        </p>
      </div>
    )
  }

  return (
    <div className="sc-rise sc-rise-2 relative rounded-[20px] border border-slate-200 bg-white p-8 shadow-[0_1px_3px_rgba(15,23,42,0.04),0_12px_32px_rgba(15,23,42,0.06)] sm:p-9">
      {/* eslint-disable-next-line @next/next/no-img-element */}
      <img
        src="/images/physio-logo.png"
        alt="Praxis OS"
        className="mb-[18px] h-12 w-12 rounded-full object-contain"
      />
      <h2 className="mb-[22px] [font-family:var(--font-cormorant)] text-[30px] font-medium italic leading-[1.1] text-emerald-800">
        Jetzt deinen Schmerzcheck starten
      </h2>

      <form onSubmit={handleSubmit} noValidate>
        <label htmlFor="sc-firstname" className="sr-only">
          Vorname
        </label>
        <input
          id="sc-firstname"
          type="text"
          autoComplete="given-name"
          placeholder="Vorname"
          value={firstName}
          onChange={(e) => setFirstName(e.target.value)}
          className="mb-3 w-full rounded-xl border border-slate-200 bg-[#fbfaf6] px-[18px] py-4 text-[15px] text-slate-900 outline-none transition focus:border-emerald-700 focus:bg-white focus:ring-[3px] focus:ring-emerald-700/10 placeholder:text-slate-400"
        />

        <label htmlFor="sc-email" className="sr-only">
          E-Mail-Adresse
        </label>
        <input
          id="sc-email"
          type="email"
          autoComplete="email"
          placeholder="deine@email.de"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          className="mb-3 w-full rounded-xl border border-slate-200 bg-[#fbfaf6] px-[18px] py-4 text-[15px] text-slate-900 outline-none transition focus:border-emerald-700 focus:bg-white focus:ring-[3px] focus:ring-emerald-700/10 placeholder:text-slate-400"
        />

        {/* Honeypot — visually hidden, must stay empty */}
        <div aria-hidden="true" className="absolute left-[-9999px] top-auto h-0 w-0 overflow-hidden">
          <label htmlFor="sc-website">Website (bitte leer lassen)</label>
          <input
            id="sc-website"
            type="text"
            tabIndex={-1}
            autoComplete="off"
            value={website}
            onChange={(e) => setWebsite(e.target.value)}
          />
        </div>

        {error && (
          <p className="mb-3 rounded-lg bg-red-50 px-3 py-2 text-[13px] text-red-700" role="alert">
            {error}
          </p>
        )}

        <button
          type="submit"
          disabled={loading}
          className="mt-2 flex w-full flex-col items-center rounded-[14px] bg-gradient-to-b from-emerald-700 to-emerald-800 px-5 py-[18px] font-bold text-white shadow-[0_6px_20px_rgba(6,95,70,0.25)] transition hover:-translate-y-px hover:shadow-[0_10px_28px_rgba(6,95,70,0.30)] disabled:cursor-not-allowed disabled:opacity-70"
        >
          <span className="flex items-center gap-2 text-base">
            {loading && <Loader2 className="h-4 w-4 animate-spin" />}
            {loading ? "Wird gesendet…" : "5-Minuten-Schmerzcheck starten"}
          </span>
          {!loading && (
            <span className="mt-1 text-xs font-normal tracking-[0.02em] opacity-85">
              Sofort starten · kostenlos · ohne Anmeldung
            </span>
          )}
        </button>
      </form>

      <div className="mt-[18px] flex items-center justify-center gap-2 text-[11px] font-bold uppercase tracking-[0.14em] text-slate-500">
        <span className="h-px w-10 max-w-[40px] flex-1 bg-slate-200" />
        <span className="flex items-center gap-1.5">
          <Check className="h-3 w-3 text-emerald-700" />
          Klinisch fundiert · DSGVO-konform
        </span>
        <span className="h-px w-10 max-w-[40px] flex-1 bg-slate-200" />
      </div>
    </div>
  )
}
