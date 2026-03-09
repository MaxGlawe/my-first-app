import { Metadata } from "next"
import Link from "next/link"
import {
  STAEDTE,
  REGIONEN,
  LAND_NAMEN,
  getStadtBySlug,
  getRegionenByLand,
  type Land,
} from "@/lib/staedte"
import {
  ArrowRight,
  MapPin,
  Star,
  Video,
  Clock,
  ShieldCheck,
  Sparkles,
  Globe,
} from "lucide-react"

export const metadata: Metadata = {
  title: "Online Physiotherapie in Deutschland, Österreich & Schweiz | Praxis OS",
  description:
    "Online Physiotherapie per Video im gesamten DACH-Raum. Professionelle physiotherapeutische Betreuung in Ihrer Stadt — ohne Wartezeit, ohne Anfahrt. Jetzt Termin buchen.",
  keywords: [
    "Online Physiotherapie Deutschland",
    "Online Physiotherapie Österreich",
    "Online Physiotherapie Schweiz",
    "Physiotherapie per Video",
    "Telemedizin Physiotherapie",
    "digitale Physiotherapie DACH",
    "Online Physio Termin",
    "Physiotherapie ohne Wartezeit",
  ],
  alternates: { canonical: "https://wwwpraxis-os.com/online-physiotherapie" },
}

const LAENDER: Land[] = ["DE", "AT", "CH"]
const LAND_FLAGS: Record<Land, string> = { DE: "DE", AT: "AT", CH: "CH" }

export default function OnlinePhysiotherapieHubPage() {
  const totalCities = STAEDTE.length

  return (
    <div className="min-h-screen" style={{ backgroundColor: "#faf9f7" }}>
      {/* Hero */}
      <div className="relative overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-br from-slate-950 via-slate-900 to-emerald-950" />
        <div className="absolute inset-0 bg-[radial-gradient(ellipse_80%_50%_at_50%_-20%,rgba(16,185,129,0.15),transparent)]" />
        <div className="absolute top-0 right-0 w-96 h-96 bg-emerald-500/5 rounded-full blur-3xl" />
        <div className="absolute bottom-0 left-0 w-72 h-72 bg-teal-500/5 rounded-full blur-3xl" />

        <div className="relative py-24 md:py-32 px-4">
          <div className="container mx-auto max-w-4xl text-center">
            <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-white/5 backdrop-blur-sm border border-white/10 mb-8">
              <Globe className="h-4 w-4 text-emerald-400" />
              <span className="text-sm text-emerald-300 font-medium">
                {totalCities}+ Standorte im DACH-Raum
              </span>
            </div>
            <h1 className="text-4xl md:text-5xl lg:text-6xl font-bold text-white mb-6 leading-tight">
              Online Physiotherapie
              <br />
              <span className="bg-gradient-to-r from-emerald-400 to-teal-300 bg-clip-text text-transparent">
                in Ihrer Stadt
              </span>
            </h1>
            <p className="text-lg md:text-xl text-slate-300/90 max-w-2xl mx-auto leading-relaxed">
              Professionelle Physiotherapie per Video — in Deutschland, Österreich
              und der Schweiz. Ohne Wartezeit, ohne Anfahrt, mit persönlichem Therapeuten.
            </p>
            <div className="mt-10 flex flex-col sm:flex-row items-center justify-center gap-4">
              <Link
                href="/anfrage"
                className="inline-flex items-center gap-2 px-8 py-3.5 bg-gradient-to-r from-emerald-500 to-teal-500 text-white font-semibold rounded-xl hover:from-emerald-600 hover:to-teal-600 transition-all shadow-lg shadow-emerald-500/25"
              >
                Ersteinschätzung anfragen <ArrowRight className="h-4 w-4" />
              </Link>
              <span className="text-sm text-slate-400">Ersteinschätzung ab 29 €</span>
            </div>
          </div>
        </div>
      </div>

      {/* Trust Bar */}
      <div className="border-b border-slate-200/60 bg-white">
        <div className="container mx-auto max-w-5xl px-4 py-5">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
            {[
              { icon: Video, label: "HD Video-Sitzungen", sub: "Persönlich & individuell" },
              { icon: Clock, label: "Termine in 24h", sub: "Keine langen Wartezeiten" },
              { icon: ShieldCheck, label: "DSGVO-konform", sub: "EU-Server, verschlüsselt" },
              { icon: Star, label: "Evidenzbasiert", sub: "Wissenschaftlich fundiert" },
            ].map((item, i) => (
              <div key={i} className="flex items-center gap-3">
                <div className="h-10 w-10 rounded-xl bg-emerald-50 flex items-center justify-center shrink-0">
                  <item.icon className="h-5 w-5 text-emerald-600" />
                </div>
                <div>
                  <p className="text-sm font-semibold text-slate-800">{item.label}</p>
                  <p className="text-xs text-slate-500">{item.sub}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      <div className="container mx-auto max-w-5xl px-4 py-16">
        {/* Country sections */}
        {LAENDER.map((land) => {
          const regionen = getRegionenByLand(land)
          const landName = LAND_NAMEN[land]

          return (
            <div key={land} className="mb-16 last:mb-0">
              {/* Country header */}
              <div className="flex items-center gap-3 mb-8">
                <div className="h-10 w-10 rounded-xl bg-gradient-to-br from-slate-800 to-slate-900 flex items-center justify-center shadow-sm">
                  <span className="text-sm font-bold text-white">{LAND_FLAGS[land]}</span>
                </div>
                <div>
                  <h2 className="text-2xl font-bold text-slate-800">{landName}</h2>
                  <p className="text-sm text-slate-500">
                    {regionen.reduce((sum, r) => sum + r.cities.length, 0)} Standorte
                  </p>
                </div>
              </div>

              <div className="space-y-4">
                {regionen.map((region) => (
                  <section
                    key={region.slug}
                    className="rounded-2xl bg-white border border-slate-200/60 shadow-sm overflow-hidden"
                  >
                    <div className="px-6 py-4 bg-gradient-to-r from-slate-50 to-white border-b border-slate-100">
                      <h3 className="text-base font-semibold text-slate-800 flex items-center gap-2">
                        <div className="h-2 w-2 rounded-full bg-emerald-500" />
                        {region.name}
                        <span className="text-xs text-slate-400 font-normal ml-1">
                          ({region.cities.length} {region.cities.length === 1 ? "Stadt" : "Städte"})
                        </span>
                      </h3>
                    </div>
                    <div className="px-6 py-4">
                      <div className="flex flex-wrap gap-2">
                        {region.cities.map((citySlug) => {
                          const city = getStadtBySlug(citySlug)
                          if (!city) return null
                          return (
                            <Link
                              key={city.slug}
                              href={`/online-physiotherapie/${city.slug}`}
                              className="group inline-flex items-center gap-1.5 px-3.5 py-2 rounded-lg bg-slate-50 border border-slate-200/60 text-sm text-slate-600 hover:text-emerald-700 hover:bg-emerald-50 hover:border-emerald-200 transition-all"
                            >
                              <MapPin className="h-3 w-3 text-slate-400 group-hover:text-emerald-500 transition-colors" />
                              {city.name}
                            </Link>
                          )
                        })}
                      </div>
                    </div>
                  </section>
                ))}
              </div>
            </div>
          )
        })}

        {/* Stats */}
        <div className="mt-20">
          <div className="relative rounded-3xl overflow-hidden">
            <div className="absolute inset-0 bg-gradient-to-br from-slate-900 via-slate-800 to-emerald-950" />
            <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_top_right,rgba(16,185,129,0.15),transparent)]" />
            <div className="relative px-8 py-12 md:px-12">
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-8">
                <div className="text-center">
                  <p className="text-4xl md:text-5xl font-bold bg-gradient-to-r from-emerald-400 to-teal-300 bg-clip-text text-transparent">
                    {totalCities}+
                  </p>
                  <p className="text-sm text-slate-400 mt-2">Städte im DACH-Raum</p>
                </div>
                <div className="text-center">
                  <p className="text-4xl md:text-5xl font-bold bg-gradient-to-r from-emerald-400 to-teal-300 bg-clip-text text-transparent">
                    3
                  </p>
                  <p className="text-sm text-slate-400 mt-2">Länder abgedeckt</p>
                </div>
                <div className="text-center">
                  <p className="text-4xl md:text-5xl font-bold bg-gradient-to-r from-emerald-400 to-teal-300 bg-clip-text text-transparent">
                    100%
                  </p>
                  <p className="text-sm text-slate-400 mt-2">Online per Video</p>
                </div>
                <div className="text-center">
                  <p className="text-4xl md:text-5xl font-bold bg-gradient-to-r from-emerald-400 to-teal-300 bg-clip-text text-transparent">
                    24h
                  </p>
                  <p className="text-sm text-slate-400 mt-2">Rückmeldung garantiert</p>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* CTA */}
        <div className="mt-20 text-center">
          <div className="relative rounded-3xl overflow-hidden">
            <div className="absolute inset-0 bg-gradient-to-r from-emerald-500 via-emerald-500 to-teal-500" />
            <div className="absolute inset-0 bg-[radial-gradient(circle_at_top_left,rgba(255,255,255,0.15),transparent)]" />
            <div className="relative p-10 md:p-16">
              <Sparkles className="h-8 w-8 text-emerald-100 mx-auto mb-4" />
              <h2 className="text-2xl md:text-3xl font-bold text-white mb-4">
                Ihre Stadt ist nicht dabei?
              </h2>
              <p className="text-emerald-50/90 mb-8 max-w-lg mx-auto leading-relaxed">
                Kein Problem — unsere Online-Physiotherapie ist komplett digital
                und funktioniert überall in Deutschland, Österreich und der Schweiz.
                Starten Sie jetzt mit Ihrer Ersteinschätzung.
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
