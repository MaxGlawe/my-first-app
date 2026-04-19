import { Metadata } from "next"
import Link from "next/link"
import { notFound } from "next/navigation"
import { STAEDTE, LAND_NAMEN, getStadtBySlug } from "@/lib/staedte"
import { BESCHWERDEN } from "@/lib/beschwerden"
import {
  ArrowRight,
  MapPin,
  Video,
  ClipboardList,
  MessageCircle,
  CheckCircle2,
  Shield,
  Star,
  Clock,
  ShieldCheck,
  Activity,
} from "lucide-react"

interface Props {
  params: Promise<{ stadt: string }>
}

export function generateStaticParams() {
  return STAEDTE.map((s) => ({ stadt: s.slug }))
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { stadt: slug } = await params
  const city = getStadtBySlug(slug)
  if (!city) return {}
  return {
    title: `Online Physiotherapie ${city.name} — Jetzt Termin buchen`,
    description: `Physiotherapie in ${city.name} per Video: Professionelle Behandlung ohne Wartezeit. Individueller Trainingsplan, persönliche Betreuung & schnelle Termine. Ersteinschätzung ab 69 €.`,
    keywords: [
      `Physiotherapie ${city.name}`,
      `Online Physiotherapie ${city.name}`,
      `Physiotherapie ${city.region}`,
      `Video Physiotherapie ${city.name}`,
      `Physiotherapeut ${city.name}`,
    ],
    alternates: { canonical: `https://wwwpraxis-os.com/online-physiotherapie/${city.slug}` },
    openGraph: {
      title: `Online Physiotherapie in ${city.name}`,
      description: `Physiotherapie per Video in ${city.name}. Ohne Wartezeit, ohne Anfahrt — professionell & individuell.`,
      type: "website",
      locale: "de_DE",
      images: [{ url: "/opengraph-image", width: 1200, height: 630, alt: `Online Physiotherapie ${city.name}` }],
    },
  }
}

/* ────── Content Variation Templates ────── */

function getHeroText(city: string, variant: number) {
  const templates = [
    {
      title: `Online Physiotherapie in ${city}`,
      subtitle: `Sie suchen professionelle Physiotherapie in ${city}? Mit Praxis OS erhalten Sie individuelle Behandlung per Video — bequem von zu Hause, ohne Wartezeit und ohne Anfahrt.`,
    },
    {
      title: `Physiotherapie ${city} — jetzt online`,
      subtitle: `Lange Wartezeiten auf einen Physiotherapie-Termin in ${city}? Das muss nicht sein. Unsere zertifizierten Therapeuten behandeln Sie per Video — flexibel, persönlich und effektiv.`,
    },
    {
      title: `Ihr Physiotherapeut in ${city} — per Video`,
      subtitle: `Professionelle physiotherapeutische Betreuung für Patienten aus ${city} und Umgebung. Online-Termine innerhalb von 24 Stunden, individuelle Trainingspläne und persönlicher Chat mit Ihrem Therapeuten.`,
    },
    {
      title: `Physiotherapie von zu Hause — ${city}`,
      subtitle: `Ob Rückenschmerzen, Kniebeschwerden oder Reha nach einer OP: Unsere Online-Physiotherapie bringt professionelle Behandlung direkt zu Ihnen nach ${city}. Ganz ohne Praxisbesuch.`,
    },
    {
      title: `${city}: Physiotherapie neu gedacht`,
      subtitle: `Erleben Sie moderne Physiotherapie in ${city} — digital, individuell und evidenzbasiert. Per Video-Sitzung mit Ihrem persönlichen Therapeuten, ergänzt durch einen maßgeschneiderten Trainingsplan.`,
    },
  ]
  return templates[variant % templates.length]
}

function getAdvantages(city: string, variant: number) {
  const sets = [
    [
      `Keine Wartezeit — Termine in ${city} oft innerhalb von 24 Stunden`,
      "Behandlung bequem von zu Hause per Video",
      "Individueller Trainingsplan mit Übungsvideos",
      "Persönlicher Chat mit Ihrem Therapeuten zwischen den Sitzungen",
      "Flexible Terminwahl — auch abends und am Wochenende",
      "Keine Anfahrt, kein Stau, kein Parkplatzsuchen",
    ],
    [
      "Zertifizierte Physiotherapeuten mit langjähriger Erfahrung",
      `Speziell für Patienten aus ${city} und Umgebung`,
      "Evidenzbasierte Behandlungsmethoden",
      "Tägliches Befindlichkeits-Tracking per App",
      "Trainingspläne, die sich Ihrem Fortschritt anpassen",
      "Ersteinschätzung bereits ab 69 €",
    ],
    [
      `Schnelle Termine für Patienten in ${city}`,
      "HD-Video-Sitzungen mit persönlichem Therapeuten",
      "Übungen mit Videoanleitung zum Nachmachen",
      "Fortschrittskontrolle und Anpassung des Trainingsplans",
      "DSGVO-konforme Plattform — Ihre Daten sind sicher",
      "Keine Verordnung vom Arzt notwendig",
    ],
    [
      "Therapie-Start ohne lange Wartezeit",
      `Ideal für berufstätige Patienten in ${city}`,
      "Persönliche Betreuung wie in der Praxis vor Ort",
      "Wissenschaftlich fundierte Übungsprogramme",
      "Direkter Draht zu Ihrem Therapeuten per Chat",
      "Transparente Preise ohne versteckte Kosten",
    ],
    [
      `Online-Physiotherapie auf höchstem Niveau in ${city}`,
      "Maßgeschneiderte Therapiepläne für Ihre Beschwerden",
      "Video-Sitzungen in HD-Qualität",
      "Lernmodule zu Ihrem Krankheitsbild inklusive",
      "Regelmäßige Fortschrittsmessung und Zielanpassung",
      "Einfache Terminbuchung über die App",
    ],
  ]
  return sets[variant % sets.length]
}

function getProcessSteps(city: string, variant: number) {
  const sets = [
    [
      { title: "Anfrage stellen", desc: `Stellen Sie Ihre Anfrage online. Beschreiben Sie kurz Ihre Beschwerden — wir melden uns innerhalb von 24 Stunden bei Ihnen.` },
      { title: "Ersteinschätzung per Video", desc: `In einem persönlichen Video-Gespräch lernen wir Ihre Situation kennen, führen eine ausführliche Anamnese durch und besprechen Ihre Ziele.` },
      { title: "Ihr Trainingsplan", desc: `Sie erhalten einen individuellen Trainingsplan mit Video-Anleitungen, den Sie flexibel in Ihren Alltag in ${city} integrieren können.` },
      { title: "Begleitung & Anpassung", desc: `Über unsere App bleiben wir in Kontakt. Wir passen Ihren Plan regelmäßig an Ihren Fortschritt an.` },
    ],
    [
      { title: "Anfrage stellen", desc: `Füllen Sie unser kurzes Formular aus. Wir prüfen, ob Online-Physiotherapie für Ihr Anliegen geeignet ist.` },
      { title: "Termin buchen", desc: `Wählen Sie einen passenden Termin für Ihre Ersteinschätzung. Wir bieten flexible Zeiten, auch abends.` },
      { title: "Behandlung starten", desc: `In der ersten Video-Sitzung erstellen wir gemeinsam Ihren Behandlungsplan mit konkreten Übungen und Zielen.` },
      { title: "Dranbleiben", desc: `Mit täglichem Tracking, Chat-Support und regelmäßigen Follow-ups begleiten wir Sie auf Ihrem Weg in ${city}.` },
    ],
    [
      { title: "Beschwerden schildern", desc: `Erzählen Sie uns in wenigen Sätzen, was Sie belastet. Die Anfrage verpflichtet Sie zu nichts.` },
      { title: "Kennenlernen", desc: `Ihr Therapeut meldet sich persönlich bei Ihnen und bespricht mit Ihnen den weiteren Ablauf per Video.` },
      { title: "Therapie & Training", desc: `Sie erhalten Ihre Behandlung per Video plus einen Trainingsplan, den Sie eigenständig in ${city} durchführen.` },
      { title: "Erfolge messen", desc: `Gemeinsam verfolgen wir Ihren Fortschritt und passen die Therapie bei Bedarf an.` },
    ],
    [
      { title: "Online-Anfrage", desc: `Starten Sie mit einer Anfrage. Kein Rezept nötig — als Heilpraktiker für Physiotherapie behandeln wir auch ohne ärztliche Verordnung.` },
      { title: "Video-Befund", desc: `In einer ausführlichen Video-Sitzung untersuchen wir Ihre Beschwerden und erstellen einen individuellen Befund.` },
      { title: "Aktiv werden", desc: `Mit Ihrem persönlichen Trainingsplan und Video-Übungen starten Sie Ihre Therapie — wann und wo es Ihnen in ${city} passt.` },
      { title: "Langfristig gesund", desc: `Regelmäßige Video-Kontrollen und ein angepasster Plan sorgen dafür, dass Sie nachhaltig schmerzfrei bleiben.` },
    ],
    [
      { title: "Kontakt aufnehmen", desc: `Über unser Formular erreichen Sie uns in weniger als 2 Minuten. Wir antworten innerhalb eines Werktags.` },
      { title: "Ersteinschätzung", desc: `In einem Erstgespräch klären wir, wie wir Ihnen am besten helfen können — ab 69 €.` },
      { title: "Therapieplan erhalten", desc: `Basierend auf Ihrer Untersuchung erhalten Sie einen evidenzbasierten Trainingsplan für Ihre Beschwerden.` },
      { title: "Fortlaufende Betreuung", desc: `Ihr Therapeut begleitet Sie per Video und Chat — als wären Sie direkt in der Praxis in ${city}.` },
    ],
  ]
  return sets[variant % sets.length]
}

function getFaq(city: string, variant: number) {
  const baseFaq = [
    {
      q: `Brauche ich eine Verordnung für Online-Physiotherapie in ${city}?`,
      a: `Nein, als Heilpraktiker für Physiotherapie können wir Sie auch ohne ärztliche Verordnung behandeln. Sie können direkt eine Anfrage stellen und wir melden uns bei Ihnen.`,
    },
    {
      q: `Wie läuft eine Online-Physiotherapie-Sitzung ab?`,
      a: `Die Sitzung findet per Video statt. Ihr Therapeut führt eine Untersuchung durch, zeigt Ihnen Übungen und erstellt einen individuellen Trainingsplan. Zwischen den Sitzungen bleiben Sie per Chat in Kontakt.`,
    },
    {
      q: `Was kostet Online-Physiotherapie?`,
      a: `Die Ersteinschätzung beginnt ab 69 €. Je nach Beschwerdebild bieten wir verschiedene Behandlungspakete an. Konkrete Preise besprechen wir im Erstgespräch basierend auf Ihren Bedürfnissen.`,
    },
  ]

  const extraFaq = [
    [
      { q: `Ist Online-Physiotherapie genauso effektiv wie in einer Praxis in ${city}?`, a: `Studien zeigen, dass Online-Physiotherapie bei vielen Beschwerden gleichwertige Ergebnisse erzielt wie die Behandlung vor Ort. Besonders bei muskuloskelettalen Beschwerden, Rückenschmerzen und Reha nach OPs ist die Wirksamkeit wissenschaftlich belegt.` },
      { q: `Was brauche ich für eine Video-Sitzung?`, a: `Sie brauchen lediglich ein Smartphone, Tablet oder einen Computer mit Kamera und Internetverbindung. Unsere Plattform funktioniert direkt im Browser — keine Installation nötig.` },
    ],
    [
      { q: `Wie schnell bekomme ich einen Termin in ${city}?`, a: `In der Regel können wir Ihnen innerhalb von 24 Stunden nach Ihrer Anfrage einen Termin anbieten. Wir bieten auch Abend- und Wochenendtermine an.` },
      { q: `Kann ich die Übungen auch unterwegs machen?`, a: `Ja, alle Übungen in Ihrem Trainingsplan haben Video-Anleitungen, die Sie jederzeit über unsere App abrufen können — zu Hause, im Büro oder unterwegs.` },
    ],
    [
      { q: `Werden die Kosten von der Krankenkasse übernommen?`, a: `Als Heilpraktiker-Leistung werden die Kosten in der Regel nicht von gesetzlichen Krankenkassen übernommen. Private Krankenversicherungen und Zusatzversicherungen erstatten die Behandlung häufig. Wir stellen Ihnen eine Rechnung aus, die Sie einreichen können.` },
      { q: `Wie oft finden die Video-Sitzungen statt?`, a: `Die Frequenz richtet sich nach Ihren Beschwerden und Ihrem Therapieplan. Typischerweise starten wir mit wöchentlichen Sitzungen und reduzieren die Frequenz im Verlauf.` },
    ],
    [
      { q: `Behandeln Sie auch akute Schmerzen per Video?`, a: `Ja, bei vielen akuten Beschwerden können wir Ihnen per Video-Sitzung schnell weiterhelfen. Bei Verdacht auf schwerwiegende Verletzungen empfehlen wir jedoch den Besuch eines Arztes.` },
      { q: `Kann ich meinen Therapeuten wechseln?`, a: `Selbstverständlich. Wenn die Chemie nicht stimmt, können Sie jederzeit einen anderen Therapeuten anfragen. Ihre Zufriedenheit steht an erster Stelle.` },
    ],
    [
      { q: `Gibt es eine Mindestlaufzeit?`, a: `Nein, es gibt keine Mindestlaufzeit. Sie können die Zusammenarbeit jederzeit beenden. Wir empfehlen jedoch mindestens 4-6 Wochen, um nachhaltige Ergebnisse zu erzielen.` },
      { q: `Sind meine Daten sicher?`, a: `Absolut. Unsere Plattform ist DSGVO-konform und wird auf EU-Servern gehostet. Alle Daten werden verschlüsselt übertragen und gespeichert. Wir nehmen Datenschutz sehr ernst.` },
    ],
  ]

  return [...baseFaq, ...extraFaq[variant % extraFaq.length]]
}

export default async function StadtPage({ params }: Props) {
  const { stadt: slug } = await params
  const city = getStadtBySlug(slug)
  if (!city) notFound()

  const cityIndex = STAEDTE.findIndex((s) => s.slug === slug)
  const variant = cityIndex >= 0 ? cityIndex % 5 : 0

  const hero = getHeroText(city.name, variant)
  const advantages = getAdvantages(city.name, variant)
  const steps = getProcessSteps(city.name, variant)
  const faq = getFaq(city.name, variant)

  const nearbyCities = STAEDTE.filter(
    (s) => s.region === city.region && s.land === city.land && s.slug !== city.slug
  ).slice(0, 8)

  const jsonLd = {
    "@context": "https://schema.org",
    "@type": "MedicalBusiness",
    name: `Praxis OS — Online Physiotherapie ${city.name}`,
    description: hero.subtitle,
    areaServed: { "@type": "City", name: city.name },
    availableService: {
      "@type": "MedicalTherapy",
      name: "Online Physiotherapie",
      description: `Physiotherapeutische Behandlung per Video für Patienten in ${city.name}`,
    },
    url: `https://wwwpraxis-os.com/online-physiotherapie/${city.slug}`,
  }

  const breadcrumbJsonLd = {
    "@context": "https://schema.org",
    "@type": "BreadcrumbList",
    itemListElement: [
      { "@type": "ListItem", position: 1, name: "Home", item: "https://wwwpraxis-os.com" },
      { "@type": "ListItem", position: 2, name: "Online Physiotherapie", item: "https://wwwpraxis-os.com/online-physiotherapie" },
      { "@type": "ListItem", position: 3, name: city.name },
    ],
  }

  const faqJsonLd = {
    "@context": "https://schema.org",
    "@type": "FAQPage",
    mainEntity: faq.map((f) => ({
      "@type": "Question",
      name: f.q,
      acceptedAnswer: { "@type": "Answer", text: f.a },
    })),
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
              <MapPin className="h-4 w-4 text-emerald-400" />
              <span className="text-sm text-emerald-300 font-medium">
                {city.name}, {city.region} — {LAND_NAMEN[city.land]}
              </span>
            </div>
            <h1 className="text-3xl md:text-4xl lg:text-5xl font-bold text-white mb-5 leading-tight">
              {hero.title}
            </h1>
            <p className="text-lg text-slate-300/90 leading-relaxed max-w-2xl">
              {hero.subtitle}
            </p>
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

      {/* Trust Bar */}
      <div className="border-b border-slate-200/60 bg-white">
        <div className="container mx-auto max-w-3xl px-4 py-5">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            {[
              { icon: Video, label: "HD Video" },
              { icon: Clock, label: "Termin in 24h" },
              { icon: ShieldCheck, label: "DSGVO" },
              { icon: Star, label: "Evidenzbasiert" },
            ].map((item, i) => (
              <div key={i} className="flex items-center gap-2 justify-center">
                <item.icon className="h-4 w-4 text-emerald-600" />
                <span className="text-xs font-medium text-slate-600">{item.label}</span>
              </div>
            ))}
          </div>
        </div>
      </div>

      <div className="container mx-auto max-w-3xl px-4 py-16 space-y-20">
        {/* Advantages — Premium cards with subtle gradient */}
        <section>
          <div className="mb-8">
            <span className="text-xs font-semibold uppercase tracking-wider text-emerald-600">Ihre Vorteile</span>
            <h2 className="text-2xl md:text-3xl font-bold text-slate-800 mt-2">
              Warum Patienten in {city.name} uns wählen
            </h2>
          </div>
          <div className="grid gap-3 sm:grid-cols-2">
            {advantages.map((adv, i) => (
              <div
                key={i}
                className="group flex items-start gap-3 rounded-2xl bg-white border border-slate-200/60 p-5 hover:shadow-md hover:border-emerald-200/60 transition-all"
              >
                <div className="h-8 w-8 rounded-xl bg-gradient-to-br from-emerald-50 to-teal-50 flex items-center justify-center shrink-0">
                  <CheckCircle2 className="h-4 w-4 text-emerald-600" />
                </div>
                <span className="text-sm text-slate-700 leading-relaxed">{adv}</span>
              </div>
            ))}
          </div>
        </section>

        {/* How it works — Premium steps with connecting line */}
        <section>
          <div className="mb-8">
            <span className="text-xs font-semibold uppercase tracking-wider text-emerald-600">In 4 Schritten</span>
            <h2 className="text-2xl md:text-3xl font-bold text-slate-800 mt-2">
              So funktioniert&apos;s
            </h2>
          </div>
          <div className="grid gap-4 sm:grid-cols-2">
            {steps.map((step, i) => {
              const icons = [ClipboardList, Video, Activity, MessageCircle]
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
                  <p className="text-sm text-slate-600 leading-relaxed">{step.desc}</p>
                </div>
              )
            })}
          </div>
        </section>

        {/* Beschwerden we treat — Premium grid */}
        <section>
          <div className="mb-8">
            <span className="text-xs font-semibold uppercase tracking-wider text-emerald-600">Beschwerdebilder</span>
            <h2 className="text-2xl md:text-3xl font-bold text-slate-800 mt-2">
              Beschwerden, die wir in {city.name} behandeln
            </h2>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            {BESCHWERDEN.slice(0, 8).map((b) => (
              <Link
                key={b.slug}
                href={`/beschwerden/${b.slug}`}
                className="group flex items-center justify-between rounded-2xl bg-white border border-slate-200/60 p-5 hover:border-emerald-200 hover:shadow-md transition-all"
              >
                <div className="flex items-center gap-3">
                  <div className="h-9 w-9 rounded-xl bg-gradient-to-br from-emerald-50 to-teal-50 flex items-center justify-center shrink-0">
                    <Activity className="h-4 w-4 text-emerald-600" />
                  </div>
                  <span className="text-sm font-semibold text-slate-700 group-hover:text-emerald-700 transition-colors">
                    {b.name}
                  </span>
                </div>
                <ArrowRight className="h-4 w-4 text-slate-300 group-hover:text-emerald-500 group-hover:translate-x-1 transition-all" />
              </Link>
            ))}
          </div>
          <div className="mt-5 text-center">
            <Link
              href="/beschwerden"
              className="text-sm text-emerald-600 hover:text-emerald-700 font-semibold inline-flex items-center gap-1.5"
            >
              Alle Beschwerdebilder ansehen <ArrowRight className="h-3.5 w-3.5" />
            </Link>
          </div>
        </section>

        {/* Why online — Premium card with gradient accent */}
        <section className="relative rounded-3xl bg-white border border-slate-200/60 shadow-sm overflow-hidden">
          <div className="absolute top-0 left-0 right-0 h-1 bg-gradient-to-r from-emerald-500 to-teal-500" />
          <div className="p-8 md:p-10">
            <span className="text-xs font-semibold uppercase tracking-wider text-emerald-600">Gut zu wissen</span>
            <h2 className="text-2xl md:text-3xl font-bold text-slate-800 mt-2 mb-6">
              Warum Online-Physiotherapie in {city.name}?
            </h2>
            <div className="space-y-4 text-sm text-slate-600 leading-relaxed">
              <p>
                Die Suche nach einem Physiotherapie-Termin in {city.name} kann frustrierend sein:
                Lange Wartelisten, ungünstige Zeiten und weite Anfahrtswege. Mit Online-Physiotherapie
                gehören diese Probleme der Vergangenheit an.
              </p>
              <p>
                Unsere zertifizierten Therapeuten behandeln Sie per hochauflösender Video-Sitzung —
                genauso persönlich und individuell wie in einer Praxis vor Ort. Der Unterschied: Sie
                sparen sich die Anfahrt und bekommen schneller einen Termin.
              </p>
              <p>
                Zahlreiche Studien belegen, dass Online-Physiotherapie bei muskuloskelettalen
                Beschwerden, chronischen Schmerzen und nach Operationen genauso wirksam ist wie
                die klassische Behandlung in der Praxis. Unsere Patienten aus {city.name} und
                Umgebung bestätigen das.
              </p>
            </div>
          </div>
        </section>

        {/* FAQ — Premium accordion */}
        <section>
          <div className="mb-8">
            <span className="text-xs font-semibold uppercase tracking-wider text-emerald-600">FAQ</span>
            <h2 className="text-2xl md:text-3xl font-bold text-slate-800 mt-2">
              Häufige Fragen zur Physiotherapie in {city.name}
            </h2>
          </div>
          <div className="space-y-3">
            {faq.map((f, i) => (
              <details
                key={i}
                className="group rounded-2xl bg-white border border-slate-200/60 shadow-sm overflow-hidden hover:shadow-md transition-shadow"
              >
                <summary className="flex items-center justify-between cursor-pointer p-5 md:p-6 text-sm font-semibold text-slate-800 hover:text-emerald-700 transition-colors list-none [&::-webkit-details-marker]:hidden">
                  {f.q}
                  <div className="h-7 w-7 rounded-lg bg-slate-100 group-open:bg-emerald-100 flex items-center justify-center shrink-0 ml-4 transition-colors">
                    <ArrowRight className="h-3.5 w-3.5 text-slate-400 group-open:text-emerald-600 group-open:rotate-90 transition-all" />
                  </div>
                </summary>
                <div className="px-5 pb-5 md:px-6 md:pb-6">
                  <p className="text-sm text-slate-600 leading-relaxed">{f.a}</p>
                </div>
              </details>
            ))}
          </div>
        </section>

        {/* FAQ JSON-LD */}
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(faqJsonLd) }}
        />

        {/* CTA — Premium */}
        <section className="relative rounded-3xl overflow-hidden">
          <div className="absolute inset-0 bg-gradient-to-r from-emerald-500 via-emerald-500 to-teal-500" />
          <div className="absolute inset-0 bg-[radial-gradient(circle_at_top_left,rgba(255,255,255,0.15),transparent)]" />
          <div className="relative p-10 md:p-14 text-center">
            <h2 className="text-2xl md:text-3xl font-bold text-white mb-4">
              Physiotherapie in {city.name} — jetzt starten
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

        {/* Nearby cities */}
        {nearbyCities.length > 0 && (
          <section>
            <h2 className="text-lg font-semibold text-slate-700 mb-4">
              Weitere Städte in {city.region}
            </h2>
            <div className="flex flex-wrap gap-2">
              {nearbyCities.map((other) => (
                <Link
                  key={other.slug}
                  href={`/online-physiotherapie/${other.slug}`}
                  className="group inline-flex items-center gap-1.5 px-3.5 py-2 rounded-lg bg-white border border-slate-200/60 text-sm text-slate-600 hover:text-emerald-700 hover:bg-emerald-50 hover:border-emerald-200 transition-all"
                >
                  <MapPin className="h-3 w-3 text-slate-400 group-hover:text-emerald-500 transition-colors" />
                  {other.name}
                </Link>
              ))}
            </div>
          </section>
        )}

        {/* Back to hub */}
        <div className="text-center">
          <Link
            href="/online-physiotherapie"
            className="text-sm text-slate-500 hover:text-emerald-600 font-medium inline-flex items-center gap-1"
          >
            Alle Standorte ansehen <ArrowRight className="h-3 w-3" />
          </Link>
        </div>
      </div>
    </div>
  )
}
