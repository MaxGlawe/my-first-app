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

// Premium-Markenwelt (Masterclass-Format)
const PAPER = "#F8F5F0"
const INK = "#0f172a"
const BODY = "#334155"
const MUTED = "#64748b"
const GREEN = "#2C3E2D"
const SAND = "#C9B79C"
const LINE = "#e7e1d6"

const serif = { fontFamily: "var(--font-serif)", fontWeight: 600 } as const

export const metadata: Metadata = {
  title: "Online Physiotherapie in Deutschland, Österreich & Schweiz | Praxis OS",
  description:
    "Online Physiotherapie per Video im gesamten DACH-Raum. Professionelle physiotherapeutische Betreuung in deiner Stadt — ohne Wartezeit, ohne Anfahrt. Jetzt Termin buchen.",
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
    <div className="min-h-screen" style={{ backgroundColor: PAPER }}>
      {/* Hero */}
      <div className="relative overflow-hidden" style={{ backgroundColor: PAPER }}>
        <div
          aria-hidden
          className="pointer-events-none absolute -top-24 right-0 h-96 w-96 rounded-full"
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
              <Globe className="h-4 w-4" style={{ color: GREEN }} />
              <span className="text-sm font-medium" style={{ color: GREEN }}>
                {totalCities}+ Standorte im DACH-Raum
              </span>
            </div>
            <h1
              className="text-4xl md:text-5xl lg:text-6xl mb-6 leading-tight"
              style={{ ...serif, color: INK }}
            >
              Online Physiotherapie
              <br />
              <span style={{ color: GREEN }}>
                in deiner Stadt
              </span>
            </h1>
            <p className="text-lg md:text-xl max-w-2xl mx-auto leading-relaxed" style={{ color: BODY }}>
              Professionelle Physiotherapie per Video — in Deutschland, Österreich
              und der Schweiz. Ohne Wartezeit, ohne Anfahrt, mit persönlichem Therapeuten.
            </p>
            <div className="mt-10 flex flex-col sm:flex-row items-center justify-center gap-4">
              <Link
                href="/anfrage"
                className="inline-flex items-center gap-2 px-8 py-3.5 text-white font-semibold rounded-xl transition-all hover:opacity-90"
                style={{ backgroundColor: GREEN }}
              >
                Ersteinschätzung anfragen <ArrowRight className="h-4 w-4" />
              </Link>
              <span className="text-sm" style={{ color: MUTED }}>Ersteinschätzung ab 69 €</span>
            </div>
          </div>
        </div>
      </div>

      {/* Trust Bar */}
      <div className="border-b bg-white" style={{ borderColor: LINE }}>
        <div className="container mx-auto max-w-5xl px-4 py-5">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
            {[
              { icon: Video, label: "HD Video-Sitzungen", sub: "Persönlich & individuell" },
              { icon: Clock, label: "Termine in 24h", sub: "Keine langen Wartezeiten" },
              { icon: ShieldCheck, label: "DSGVO-konform", sub: "EU-Server, verschlüsselt" },
              { icon: Star, label: "Evidenzbasiert", sub: "Wissenschaftlich fundiert" },
            ].map((item, i) => (
              <div key={i} className="flex items-center gap-3">
                <div
                  className="h-10 w-10 rounded-xl flex items-center justify-center shrink-0"
                  style={{ backgroundColor: "rgba(44,62,45,0.10)" }}
                >
                  <item.icon className="h-5 w-5" style={{ color: GREEN }} />
                </div>
                <div>
                  <p className="text-sm font-semibold" style={{ color: INK }}>{item.label}</p>
                  <p className="text-xs" style={{ color: MUTED }}>{item.sub}</p>
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
                <div
                  className="h-10 w-10 rounded-xl flex items-center justify-center shadow-sm"
                  style={{ backgroundColor: GREEN }}
                >
                  <span className="text-sm font-bold text-white">{LAND_FLAGS[land]}</span>
                </div>
                <div>
                  <h2 className="text-2xl" style={{ ...serif, color: INK }}>{landName}</h2>
                  <p className="text-sm" style={{ color: MUTED }}>
                    {regionen.reduce((sum, r) => sum + r.cities.length, 0)} Standorte
                  </p>
                </div>
              </div>

              <div className="space-y-4">
                {regionen.map((region) => (
                  <section
                    key={region.slug}
                    className="rounded-2xl bg-white border shadow-sm overflow-hidden"
                    style={{ borderColor: LINE }}
                  >
                    <div className="px-6 py-4 border-b" style={{ backgroundColor: PAPER, borderColor: LINE }}>
                      <h3 className="text-base font-semibold flex items-center gap-2" style={{ color: INK }}>
                        <div className="h-2 w-2 rounded-full" style={{ backgroundColor: GREEN }} />
                        {region.name}
                        <span className="text-xs font-normal ml-1" style={{ color: MUTED }}>
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
                              className="group inline-flex items-center gap-1.5 px-3.5 py-2 rounded-lg border text-sm transition-all hover:opacity-90"
                              style={{ backgroundColor: PAPER, borderColor: LINE, color: BODY }}
                            >
                              <MapPin className="h-3 w-3" style={{ color: GREEN }} />
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
          <div className="relative rounded-3xl overflow-hidden border bg-white" style={{ borderColor: LINE }}>
            <div
              aria-hidden
              className="pointer-events-none absolute -top-16 right-0 h-72 w-72 rounded-full"
              style={{ background: "radial-gradient(circle, rgba(201,183,156,0.20) 0%, transparent 70%)" }}
            />
            <div className="relative px-8 py-12 md:px-12">
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-8">
                <div className="text-center">
                  <p className="text-4xl md:text-5xl" style={{ ...serif, color: GREEN }}>
                    {totalCities}+
                  </p>
                  <p className="text-sm mt-2" style={{ color: MUTED }}>Städte im DACH-Raum</p>
                </div>
                <div className="text-center">
                  <p className="text-4xl md:text-5xl" style={{ ...serif, color: GREEN }}>
                    3
                  </p>
                  <p className="text-sm mt-2" style={{ color: MUTED }}>Länder abgedeckt</p>
                </div>
                <div className="text-center">
                  <p className="text-4xl md:text-5xl" style={{ ...serif, color: GREEN }}>
                    100%
                  </p>
                  <p className="text-sm mt-2" style={{ color: MUTED }}>Online per Video</p>
                </div>
                <div className="text-center">
                  <p className="text-4xl md:text-5xl" style={{ ...serif, color: GREEN }}>
                    24h
                  </p>
                  <p className="text-sm mt-2" style={{ color: MUTED }}>Rückmeldung garantiert</p>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* CTA */}
        <div className="mt-20 text-center">
          <div className="relative rounded-3xl overflow-hidden border" style={{ backgroundColor: GREEN, borderColor: GREEN }}>
            <div
              aria-hidden
              className="pointer-events-none absolute inset-0"
              style={{ background: "radial-gradient(circle at top left, rgba(201,183,156,0.18), transparent)" }}
            />
            <div className="relative p-10 md:p-16">
              <Sparkles className="h-8 w-8 mx-auto mb-4" style={{ color: SAND }} />
              <h2 className="text-2xl md:text-3xl text-white mb-4" style={serif}>
                Deine Stadt ist nicht dabei?
              </h2>
              <p className="mb-8 max-w-lg mx-auto leading-relaxed" style={{ color: "rgba(255,255,255,0.85)" }}>
                Kein Problem — unsere Online-Physiotherapie ist komplett digital
                und funktioniert überall in Deutschland, Österreich und der Schweiz.
                Starte jetzt mit deiner Ersteinschätzung.
              </p>
              <Link
                href="/anfrage"
                className="inline-flex items-center gap-2 px-8 py-3.5 bg-white font-semibold rounded-xl transition-all hover:opacity-90"
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
