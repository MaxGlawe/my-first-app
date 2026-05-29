import { Metadata } from "next"
import Link from "next/link"
import { BESCHWERDEN } from "@/lib/beschwerden"
import { ArrowRight, Activity, Sparkles } from "lucide-react"

// Premium-Markenwelt (Masterclass-Format)
const PAPER = "#F8F5F0"
const INK = "#0f172a"
const GREEN = "#2C3E2D"
const SAND = "#C9B79C"
const MUTED = "#64748b"
const LINE = "#e7e1d6"

export const metadata: Metadata = {
  title: "Beschwerdebilder | Online Physiotherapie",
  description:
    "Alle Beschwerdebilder, die wir per Online-Physiotherapie behandeln: Rückenschmerzen, Knieschmerzen, Schulterschmerzen, Bandscheibenvorfall, Arthrose und mehr.",
  keywords: [
    "Physiotherapie Beschwerden",
    "Online Physiotherapie Beschwerdebilder",
    "Schmerzen Physiotherapie",
    "Physiotherapie bei Schmerzen",
  ],
  alternates: { canonical: "https://wwwpraxis-os.com/beschwerden" },
}

export default function BeschwerdenHubPage() {
  return (
    <div className="min-h-screen" style={{ backgroundColor: PAPER }}>
      {/* Hero — Premium */}
      <div className="relative overflow-hidden" style={{ backgroundColor: PAPER }}>
        {/* Sand-Aura */}
        <div
          aria-hidden
          className="pointer-events-none absolute -top-24 right-0 h-[440px] w-[440px] rounded-full"
          style={{ background: "radial-gradient(circle, rgba(201,183,156,0.28) 0%, transparent 70%)" }}
        />
        <div
          aria-hidden
          className="pointer-events-none absolute bottom-0 left-0 h-72 w-72 rounded-full"
          style={{ background: "radial-gradient(circle, rgba(201,183,156,0.18) 0%, transparent 70%)" }}
        />

        <div className="relative py-24 md:py-32 px-4">
          <div className="container mx-auto max-w-4xl text-center">
            <div
              className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full border mb-8"
              style={{ borderColor: LINE, backgroundColor: "rgba(255,255,255,0.6)" }}
            >
              <Activity className="h-4 w-4" style={{ color: GREEN }} />
              <span className="text-sm font-medium" style={{ color: GREEN }}>Alle Beschwerdebilder</span>
            </div>
            <h1
              className="text-4xl md:text-5xl lg:text-6xl mb-6 leading-tight"
              style={{ fontFamily: "var(--font-serif)", fontWeight: 600, color: INK }}
            >
              Welche Beschwerden
              <br />
              <span style={{ color: GREEN }}>
                behandeln wir?
              </span>
            </h1>
            <p className="text-lg md:text-xl max-w-2xl mx-auto leading-relaxed" style={{ color: "#334155" }}>
              Von Rückenschmerzen bis Arthrose — wir behandeln eine Vielzahl von
              Beschwerden per Video-Physiotherapie. Professionell, individuell und
              ohne Wartezeit.
            </p>
          </div>
        </div>
      </div>

      {/* Grid */}
      <div className="container mx-auto max-w-5xl px-4 py-16">
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {BESCHWERDEN.map((b) => (
            <Link
              key={b.slug}
              href={`/beschwerden/${b.slug}`}
              className="group block rounded-2xl bg-white border shadow-sm hover:shadow-lg transition-all p-6"
              style={{ borderColor: LINE }}
            >
              <div className="flex items-center gap-3 mb-3">
                <div
                  className="h-10 w-10 rounded-xl flex items-center justify-center shrink-0"
                  style={{ backgroundColor: "rgba(44,62,45,0.10)" }}
                >
                  <Activity className="h-5 w-5" style={{ color: GREEN }} />
                </div>
                <h2 className="text-base font-bold" style={{ color: INK }}>
                  {b.name}
                </h2>
              </div>
              <p className="text-sm line-clamp-2 leading-relaxed" style={{ color: MUTED }}>
                {b.heroSubtitle}
              </p>
              <div className="flex items-center gap-1.5 mt-4 text-sm font-semibold" style={{ color: GREEN }}>
                Mehr erfahren
                <ArrowRight className="h-4 w-4 group-hover:translate-x-1 transition-transform" />
              </div>
            </Link>
          ))}
        </div>

        {/* CTA — Premium */}
        <div className="mt-20 text-center">
          <div className="relative rounded-3xl overflow-hidden" style={{ backgroundColor: GREEN }}>
            <div
              aria-hidden
              className="pointer-events-none absolute inset-0"
              style={{ background: "radial-gradient(circle at top left, rgba(201,183,156,0.18), transparent)" }}
            />
            <div className="relative p-10 md:p-16">
              <Sparkles className="h-8 w-8 mx-auto mb-4" style={{ color: SAND }} />
              <h2
                className="text-2xl md:text-3xl mb-4 text-white"
                style={{ fontFamily: "var(--font-serif)", fontWeight: 600 }}
              >
                Dein Beschwerdebild ist nicht dabei?
              </h2>
              <p className="text-white/80 mb-8 max-w-lg mx-auto leading-relaxed">
                Wir behandeln viele weitere Beschwerden per Online-Physiotherapie.
                Stelle eine Anfrage und wir beraten dich persönlich.
              </p>
              <Link
                href="/anfrage"
                className="inline-flex items-center gap-2 px-8 py-3.5 bg-white font-semibold rounded-xl hover:opacity-90 transition-opacity shadow-lg"
                style={{ color: GREEN }}
              >
                Anfrage stellen — ab 69 € <ArrowRight className="h-4 w-4" />
              </Link>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
