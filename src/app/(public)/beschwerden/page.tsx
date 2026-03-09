import { Metadata } from "next"
import Link from "next/link"
import { BESCHWERDEN } from "@/lib/beschwerden"
import { ArrowRight, Activity, Sparkles } from "lucide-react"

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
    <div className="min-h-screen" style={{ backgroundColor: "#faf9f7" }}>
      {/* Hero — Premium */}
      <div className="relative overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-br from-slate-950 via-slate-900 to-emerald-950" />
        <div className="absolute inset-0 bg-[radial-gradient(ellipse_80%_50%_at_50%_-20%,rgba(16,185,129,0.15),transparent)]" />
        <div className="absolute top-0 right-0 w-96 h-96 bg-emerald-500/5 rounded-full blur-3xl" />
        <div className="absolute bottom-0 left-0 w-72 h-72 bg-teal-500/5 rounded-full blur-3xl" />

        <div className="relative py-24 md:py-32 px-4">
          <div className="container mx-auto max-w-4xl text-center">
            <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-white/5 backdrop-blur-sm border border-white/10 mb-8">
              <Activity className="h-4 w-4 text-emerald-400" />
              <span className="text-sm text-emerald-300 font-medium">Alle Beschwerdebilder</span>
            </div>
            <h1 className="text-4xl md:text-5xl lg:text-6xl font-bold text-white mb-6 leading-tight">
              Welche Beschwerden
              <br />
              <span className="bg-gradient-to-r from-emerald-400 to-teal-300 bg-clip-text text-transparent">
                behandeln wir?
              </span>
            </h1>
            <p className="text-lg md:text-xl text-slate-300/90 max-w-2xl mx-auto leading-relaxed">
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
              className="group block rounded-2xl bg-white border border-slate-200/60 shadow-sm hover:shadow-lg hover:border-emerald-200/60 transition-all p-6"
            >
              <div className="flex items-center gap-3 mb-3">
                <div className="h-10 w-10 rounded-xl bg-gradient-to-br from-emerald-50 to-teal-50 flex items-center justify-center shrink-0 group-hover:from-emerald-100 group-hover:to-teal-100 transition-colors">
                  <Activity className="h-5 w-5 text-emerald-600" />
                </div>
                <h2 className="text-base font-bold text-slate-800 group-hover:text-emerald-700 transition-colors">
                  {b.name}
                </h2>
              </div>
              <p className="text-sm text-slate-500 line-clamp-2 leading-relaxed">
                {b.heroSubtitle}
              </p>
              <div className="flex items-center gap-1.5 mt-4 text-sm font-semibold text-emerald-600">
                Mehr erfahren
                <ArrowRight className="h-4 w-4 group-hover:translate-x-1 transition-transform" />
              </div>
            </Link>
          ))}
        </div>

        {/* CTA — Premium */}
        <div className="mt-20 text-center">
          <div className="relative rounded-3xl overflow-hidden">
            <div className="absolute inset-0 bg-gradient-to-r from-emerald-500 via-emerald-500 to-teal-500" />
            <div className="absolute inset-0 bg-[radial-gradient(circle_at_top_left,rgba(255,255,255,0.15),transparent)]" />
            <div className="relative p-10 md:p-16">
              <Sparkles className="h-8 w-8 text-emerald-100 mx-auto mb-4" />
              <h2 className="text-2xl md:text-3xl font-bold text-white mb-4">
                Ihr Beschwerdebild ist nicht dabei?
              </h2>
              <p className="text-emerald-50/90 mb-8 max-w-lg mx-auto leading-relaxed">
                Wir behandeln viele weitere Beschwerden per Online-Physiotherapie.
                Stellen Sie eine Anfrage und wir beraten Sie persönlich.
              </p>
              <Link
                href="/anfrage"
                className="inline-flex items-center gap-2 px-8 py-3.5 bg-white text-emerald-700 font-semibold rounded-xl hover:bg-emerald-50 transition-colors shadow-lg shadow-emerald-700/20"
              >
                Anfrage stellen — ab 29 € <ArrowRight className="h-4 w-4" />
              </Link>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
