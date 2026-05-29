import { Metadata } from "next"
import Link from "next/link"
import { notFound } from "next/navigation"
import { BESCHWERDEN, getBeschwerdeBySlug } from "@/lib/beschwerden"
import {
  CheckCircle2,
  ArrowRight,
  ClipboardList,
  MessageCircle,
  Video,
  Activity,
  Sparkles,
} from "lucide-react"

// Premium-Markenwelt (Masterclass-Format)
const PAPER = "#F8F5F0"
const INK = "#0f172a"
const BODY = "#334155"
const GREEN = "#2C3E2D"
const SAND = "#C9B79C"
const MUTED = "#64748b"
const LINE = "#e7e1d6"

interface Props {
  params: Promise<{ slug: string }>
}

export function generateStaticParams() {
  return BESCHWERDEN.map((b) => ({ slug: b.slug }))
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { slug } = await params
  const b = getBeschwerdeBySlug(slug)
  if (!b) return {}
  return {
    title: b.metaTitle,
    description: b.metaDescription,
    keywords: b.keywords,
    alternates: { canonical: `https://wwwpraxis-os.com/beschwerden/${b.slug}` },
    openGraph: {
      title: b.metaTitle,
      description: b.metaDescription,
      type: "article",
      locale: "de_DE",
      images: [{ url: "/opengraph-image", width: 1200, height: 630, alt: `${b.name} — Online Physiotherapie` }],
    },
  }
}

export default async function BeschwerdePage({ params }: Props) {
  const { slug } = await params
  const b = getBeschwerdeBySlug(slug)
  if (!b) notFound()

  const jsonLd = {
    "@context": "https://schema.org",
    "@type": "MedicalCondition",
    name: b.name,
    description: b.heroSubtitle,
    possibleTreatment: {
      "@type": "MedicalTherapy",
      name: "Online Physiotherapie",
      description: `Physiotherapeutische Behandlung von ${b.name} per Video-Sitzung mit individuellem Trainingsplan.`,
    },
  }

  const breadcrumbJsonLd = {
    "@context": "https://schema.org",
    "@type": "BreadcrumbList",
    itemListElement: [
      { "@type": "ListItem", position: 1, name: "Home", item: "https://wwwpraxis-os.com" },
      { "@type": "ListItem", position: 2, name: "Beschwerden", item: "https://wwwpraxis-os.com/beschwerden" },
      { "@type": "ListItem", position: 3, name: b.name },
    ],
  }

  return (
    <div className="min-h-screen" style={{ backgroundColor: PAPER }}>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
      />
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(breadcrumbJsonLd) }}
      />

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

        <div className="relative py-24 md:py-28 px-4">
          <div className="container mx-auto max-w-3xl">
            <div
              className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full border mb-8"
              style={{ borderColor: LINE, backgroundColor: "rgba(255,255,255,0.6)" }}
            >
              <Activity className="h-4 w-4" style={{ color: GREEN }} />
              <span className="text-sm font-medium" style={{ color: GREEN }}>Online Physiotherapie</span>
            </div>
            <h1
              className="text-3xl md:text-4xl lg:text-5xl mb-5 leading-tight"
              style={{ fontFamily: "var(--font-serif)", fontWeight: 600, color: INK }}
            >
              {b.heroTitle}
            </h1>
            <p className="text-lg leading-relaxed max-w-2xl" style={{ color: BODY }}>{b.heroSubtitle}</p>
            <div className="mt-10 flex flex-col sm:flex-row items-start gap-4">
              <Link
                href="/anfrage"
                className="inline-flex items-center gap-2 px-8 py-3.5 text-white font-semibold rounded-xl hover:opacity-90 transition-opacity shadow-lg"
                style={{ backgroundColor: GREEN }}
              >
                Jetzt Ersteinschätzung anfragen <ArrowRight className="h-4 w-4" />
              </Link>
              <span className="text-sm sm:self-center" style={{ color: MUTED }}>ab 69 €</span>
            </div>
          </div>
        </div>
      </div>

      <div className="container mx-auto max-w-3xl px-4 py-16 space-y-20">
        {/* Symptoms */}
        <section>
          <div className="mb-8">
            <span className="text-xs font-semibold uppercase tracking-wider" style={{ color: GREEN }}>Symptome erkennen</span>
            <h2 className="text-2xl md:text-3xl mt-2" style={{ fontFamily: "var(--font-serif)", fontWeight: 600, color: INK }}>Typische Symptome</h2>
          </div>
          <div className="grid gap-3 sm:grid-cols-2">
            {b.symptoms.map((s, i) => (
              <div
                key={i}
                className="group flex items-start gap-3 rounded-2xl bg-white border p-5 hover:shadow-md transition-all"
                style={{ borderColor: LINE }}
              >
                <div
                  className="h-8 w-8 rounded-xl flex items-center justify-center shrink-0"
                  style={{ backgroundColor: "rgba(44,62,45,0.10)" }}
                >
                  <CheckCircle2 className="h-4 w-4" style={{ color: GREEN }} />
                </div>
                <span className="text-sm leading-relaxed" style={{ color: BODY }}>{s}</span>
              </div>
            ))}
          </div>
        </section>

        {/* How we help */}
        <section>
          <div className="mb-8">
            <span className="text-xs font-semibold uppercase tracking-wider" style={{ color: GREEN }}>Unser Ansatz</span>
            <h2 className="text-2xl md:text-3xl mt-2" style={{ fontFamily: "var(--font-serif)", fontWeight: 600, color: INK }}>So helfen wir dir</h2>
          </div>
          <div className="space-y-3">
            {b.howWeHelp.map((h, i) => (
              <div
                key={i}
                className="flex items-start gap-4 rounded-2xl bg-white border p-5 hover:shadow-md transition-all"
                style={{ borderColor: LINE }}
              >
                <div
                  className="h-9 w-9 rounded-xl flex items-center justify-center shrink-0 shadow-sm"
                  style={{ backgroundColor: GREEN }}
                >
                  <span className="text-xs font-bold text-white">{i + 1}</span>
                </div>
                <span className="text-sm leading-relaxed" style={{ color: BODY }}>{h}</span>
              </div>
            ))}
          </div>
        </section>

        {/* Treatment Steps */}
        <section>
          <div className="mb-8">
            <span className="text-xs font-semibold uppercase tracking-wider" style={{ color: GREEN }}>In 4 Schritten</span>
            <h2 className="text-2xl md:text-3xl mt-2" style={{ fontFamily: "var(--font-serif)", fontWeight: 600, color: INK }}>Dein Behandlungsweg</h2>
          </div>
          <div className="grid gap-4 sm:grid-cols-2">
            {b.treatmentSteps.map((step, i) => {
              const icons = [Video, ClipboardList, Activity, MessageCircle]
              const Icon = icons[i % icons.length]
              return (
                <div
                  key={i}
                  className="group rounded-2xl bg-white border shadow-sm hover:shadow-md transition-all p-6"
                  style={{ borderColor: LINE }}
                >
                  <div className="flex items-center gap-3 mb-4">
                    <div
                      className="h-11 w-11 rounded-xl flex items-center justify-center shadow-sm"
                      style={{ backgroundColor: GREEN }}
                    >
                      <Icon className="h-5 w-5 text-white" />
                    </div>
                    <div>
                      <p className="text-[10px] font-bold uppercase tracking-widest" style={{ color: MUTED }}>
                        Schritt {i + 1}
                      </p>
                      <p className="text-sm font-bold" style={{ color: INK }}>{step.title}</p>
                    </div>
                  </div>
                  <p className="text-sm leading-relaxed" style={{ color: MUTED }}>{step.description}</p>
                </div>
              )
            })}
          </div>
        </section>

        {/* FAQ */}
        <section>
          <div className="mb-8">
            <span className="text-xs font-semibold uppercase tracking-wider" style={{ color: GREEN }}>FAQ</span>
            <h2 className="text-2xl md:text-3xl mt-2" style={{ fontFamily: "var(--font-serif)", fontWeight: 600, color: INK }}>Häufige Fragen</h2>
          </div>
          <div className="space-y-3">
            {b.faq.map((f, i) => (
              <details
                key={i}
                className="group rounded-2xl bg-white border shadow-sm overflow-hidden hover:shadow-md transition-shadow"
                style={{ borderColor: LINE }}
              >
                <summary
                  className="flex items-center justify-between cursor-pointer p-5 md:p-6 text-sm font-semibold list-none [&::-webkit-details-marker]:hidden"
                  style={{ color: INK }}
                >
                  {f.question}
                  <div
                    className="h-7 w-7 rounded-lg flex items-center justify-center shrink-0 ml-4 transition-colors"
                    style={{ backgroundColor: "rgba(44,62,45,0.10)" }}
                  >
                    <ArrowRight className="h-3.5 w-3.5 group-open:rotate-90 transition-all" style={{ color: GREEN }} />
                  </div>
                </summary>
                <div className="px-5 pb-5 md:px-6 md:pb-6">
                  <p className="text-sm leading-relaxed" style={{ color: MUTED }}>{f.answer}</p>
                </div>
              </details>
            ))}
          </div>
        </section>

        {/* FAQ JSON-LD */}
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{
            __html: JSON.stringify({
              "@context": "https://schema.org",
              "@type": "FAQPage",
              mainEntity: b.faq.map((f) => ({
                "@type": "Question",
                name: f.question,
                acceptedAnswer: {
                  "@type": "Answer",
                  text: f.answer,
                },
              })),
            }),
          }}
        />

        {/* CTA — Premium */}
        <section className="relative rounded-3xl overflow-hidden" style={{ backgroundColor: GREEN }}>
          <div
            aria-hidden
            className="pointer-events-none absolute inset-0"
            style={{ background: "radial-gradient(circle at top left, rgba(201,183,156,0.18), transparent)" }}
          />
          <div className="relative p-10 md:p-14 text-center">
            <Sparkles className="h-8 w-8 mx-auto mb-4" style={{ color: SAND }} />
            <h2
              className="text-2xl md:text-3xl mb-4 text-white"
              style={{ fontFamily: "var(--font-serif)", fontWeight: 600 }}
            >
              {b.name} behandeln lassen — jetzt starten
            </h2>
            <p className="text-white/80 mb-8 max-w-lg mx-auto leading-relaxed">
              Stelle deine Anfrage und erhalte innerhalb von
              24 Stunden eine persönliche Rückmeldung von unserem Therapeuten.
            </p>
            <Link
              href="/anfrage"
              className="inline-flex items-center gap-2 px-8 py-3.5 bg-white font-semibold rounded-xl hover:opacity-90 transition-opacity shadow-lg"
              style={{ color: GREEN }}
            >
              Anfrage stellen — ab 69 € <ArrowRight className="h-4 w-4" />
            </Link>
          </div>
        </section>

        {/* Internal links to other conditions */}
        <section>
          <h2 className="text-lg font-semibold mb-4" style={{ color: BODY }}>
            Weitere Beschwerdebilder
          </h2>
          <div className="flex flex-wrap gap-2">
            {BESCHWERDEN.filter((other) => other.slug !== b.slug)
              .slice(0, 6)
              .map((other) => (
                <Link
                  key={other.slug}
                  href={`/beschwerden/${other.slug}`}
                  className="group inline-flex items-center gap-1.5 px-3.5 py-2 rounded-lg bg-white border text-sm hover:shadow-md transition-all"
                  style={{ borderColor: LINE, color: MUTED }}
                >
                  {other.name}
                  <ArrowRight className="h-3 w-3" />
                </Link>
              ))}
          </div>
        </section>
      </div>
    </div>
  )
}
