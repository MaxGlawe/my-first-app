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
    <div className="min-h-screen" style={{ backgroundColor: "#faf9f7" }}>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
      />
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(breadcrumbJsonLd) }}
      />

      {/* Hero — Premium */}
      <div className="relative overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-br from-slate-950 via-slate-900 to-emerald-950" />
        <div className="absolute inset-0 bg-[radial-gradient(ellipse_80%_50%_at_50%_-20%,rgba(16,185,129,0.15),transparent)]" />
        <div className="absolute top-0 right-0 w-96 h-96 bg-emerald-500/5 rounded-full blur-3xl" />
        <div className="absolute bottom-0 left-0 w-72 h-72 bg-teal-500/5 rounded-full blur-3xl" />

        <div className="relative py-24 md:py-28 px-4">
          <div className="container mx-auto max-w-3xl">
            <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-white/5 backdrop-blur-sm border border-white/10 mb-8">
              <Activity className="h-4 w-4 text-emerald-400" />
              <span className="text-sm text-emerald-300 font-medium">Online Physiotherapie</span>
            </div>
            <h1 className="text-3xl md:text-4xl lg:text-5xl font-bold text-white mb-5 leading-tight">
              {b.heroTitle}
            </h1>
            <p className="text-lg text-slate-300/90 leading-relaxed max-w-2xl">{b.heroSubtitle}</p>
            <div className="mt-10 flex flex-col sm:flex-row items-start gap-4">
              <Link
                href="/anfrage"
                className="inline-flex items-center gap-2 px-8 py-3.5 bg-gradient-to-r from-emerald-500 to-teal-500 text-white font-semibold rounded-xl hover:from-emerald-600 hover:to-teal-600 transition-all shadow-lg shadow-emerald-500/25"
              >
                Jetzt Ersteinschätzung anfragen <ArrowRight className="h-4 w-4" />
              </Link>
              <span className="text-sm text-slate-400 sm:self-center">ab 69 €</span>
            </div>
          </div>
        </div>
      </div>

      <div className="container mx-auto max-w-3xl px-4 py-16 space-y-20">
        {/* Symptoms */}
        <section>
          <div className="mb-8">
            <span className="text-xs font-semibold uppercase tracking-wider text-emerald-600">Symptome erkennen</span>
            <h2 className="text-2xl md:text-3xl font-bold text-slate-800 mt-2">Typische Symptome</h2>
          </div>
          <div className="grid gap-3 sm:grid-cols-2">
            {b.symptoms.map((s, i) => (
              <div
                key={i}
                className="group flex items-start gap-3 rounded-2xl bg-white border border-slate-200/60 p-5 hover:shadow-md hover:border-emerald-200/60 transition-all"
              >
                <div className="h-8 w-8 rounded-xl bg-gradient-to-br from-emerald-50 to-teal-50 flex items-center justify-center shrink-0">
                  <CheckCircle2 className="h-4 w-4 text-emerald-600" />
                </div>
                <span className="text-sm text-slate-700 leading-relaxed">{s}</span>
              </div>
            ))}
          </div>
        </section>

        {/* How we help */}
        <section>
          <div className="mb-8">
            <span className="text-xs font-semibold uppercase tracking-wider text-emerald-600">Unser Ansatz</span>
            <h2 className="text-2xl md:text-3xl font-bold text-slate-800 mt-2">So helfen wir Ihnen</h2>
          </div>
          <div className="space-y-3">
            {b.howWeHelp.map((h, i) => (
              <div
                key={i}
                className="flex items-start gap-4 rounded-2xl bg-white border border-slate-200/60 p-5 hover:shadow-md hover:border-emerald-200/60 transition-all"
              >
                <div className="h-9 w-9 rounded-xl bg-gradient-to-br from-teal-500 to-emerald-500 flex items-center justify-center shrink-0 shadow-sm">
                  <span className="text-xs font-bold text-white">{i + 1}</span>
                </div>
                <span className="text-sm text-slate-700 leading-relaxed">{h}</span>
              </div>
            ))}
          </div>
        </section>

        {/* Treatment Steps */}
        <section>
          <div className="mb-8">
            <span className="text-xs font-semibold uppercase tracking-wider text-emerald-600">In 4 Schritten</span>
            <h2 className="text-2xl md:text-3xl font-bold text-slate-800 mt-2">Ihr Behandlungsweg</h2>
          </div>
          <div className="grid gap-4 sm:grid-cols-2">
            {b.treatmentSteps.map((step, i) => {
              const icons = [Video, ClipboardList, Activity, MessageCircle]
              const Icon = icons[i % icons.length]
              const gradients = [
                "from-emerald-500 to-teal-500",
                "from-teal-500 to-cyan-500",
                "from-emerald-600 to-emerald-500",
                "from-teal-600 to-emerald-500",
              ]
              return (
                <div
                  key={i}
                  className="group rounded-2xl bg-white border border-slate-200/60 shadow-sm hover:shadow-md transition-all p-6"
                >
                  <div className="flex items-center gap-3 mb-4">
                    <div className={`h-11 w-11 rounded-xl bg-gradient-to-br ${gradients[i]} flex items-center justify-center shadow-sm`}>
                      <Icon className="h-5 w-5 text-white" />
                    </div>
                    <div>
                      <p className="text-[10px] font-bold uppercase tracking-widest text-slate-400">
                        Schritt {i + 1}
                      </p>
                      <p className="text-sm font-bold text-slate-800">{step.title}</p>
                    </div>
                  </div>
                  <p className="text-sm text-slate-600 leading-relaxed">{step.description}</p>
                </div>
              )
            })}
          </div>
        </section>

        {/* FAQ */}
        <section>
          <div className="mb-8">
            <span className="text-xs font-semibold uppercase tracking-wider text-emerald-600">FAQ</span>
            <h2 className="text-2xl md:text-3xl font-bold text-slate-800 mt-2">Häufige Fragen</h2>
          </div>
          <div className="space-y-3">
            {b.faq.map((f, i) => (
              <details
                key={i}
                className="group rounded-2xl bg-white border border-slate-200/60 shadow-sm overflow-hidden hover:shadow-md transition-shadow"
              >
                <summary className="flex items-center justify-between cursor-pointer p-5 md:p-6 text-sm font-semibold text-slate-800 hover:text-emerald-700 transition-colors list-none [&::-webkit-details-marker]:hidden">
                  {f.question}
                  <div className="h-7 w-7 rounded-lg bg-slate-100 group-open:bg-emerald-100 flex items-center justify-center shrink-0 ml-4 transition-colors">
                    <ArrowRight className="h-3.5 w-3.5 text-slate-400 group-open:text-emerald-600 group-open:rotate-90 transition-all" />
                  </div>
                </summary>
                <div className="px-5 pb-5 md:px-6 md:pb-6">
                  <p className="text-sm text-slate-600 leading-relaxed">{f.answer}</p>
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
        <section className="relative rounded-3xl overflow-hidden">
          <div className="absolute inset-0 bg-gradient-to-r from-emerald-500 via-emerald-500 to-teal-500" />
          <div className="absolute inset-0 bg-[radial-gradient(circle_at_top_left,rgba(255,255,255,0.15),transparent)]" />
          <div className="relative p-10 md:p-14 text-center">
            <Sparkles className="h-8 w-8 text-emerald-100 mx-auto mb-4" />
            <h2 className="text-2xl md:text-3xl font-bold text-white mb-4">
              {b.name} behandeln lassen — jetzt starten
            </h2>
            <p className="text-emerald-50/90 mb-8 max-w-lg mx-auto leading-relaxed">
              Stellen Sie Ihre Anfrage und erhalten Sie innerhalb von
              24 Stunden eine persönliche Rückmeldung von unserem Therapeuten.
            </p>
            <Link
              href="/anfrage"
              className="inline-flex items-center gap-2 px-8 py-3.5 bg-white text-emerald-700 font-semibold rounded-xl hover:bg-emerald-50 transition-colors shadow-lg shadow-emerald-700/20"
            >
              Anfrage stellen — ab 69 € <ArrowRight className="h-4 w-4" />
            </Link>
          </div>
        </section>

        {/* Internal links to other conditions */}
        <section>
          <h2 className="text-lg font-semibold text-slate-700 mb-4">
            Weitere Beschwerdebilder
          </h2>
          <div className="flex flex-wrap gap-2">
            {BESCHWERDEN.filter((other) => other.slug !== b.slug)
              .slice(0, 6)
              .map((other) => (
                <Link
                  key={other.slug}
                  href={`/beschwerden/${other.slug}`}
                  className="group inline-flex items-center gap-1.5 px-3.5 py-2 rounded-lg bg-white border border-slate-200/60 text-sm text-slate-600 hover:text-emerald-700 hover:bg-emerald-50 hover:border-emerald-200 transition-all"
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
