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

// Premium-Markenwelt (Masterclass-Format)
const PAPER = "#F8F5F0"
const INK = "#0f172a"
const BODY = "#334155"
const MUTED = "#64748b"
const GREEN = "#2C3E2D"
const SAND = "#C9B79C"
const LINE = "#e7e1d6"

const serif = { fontFamily: "var(--font-serif)", fontWeight: 600 } as const

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
      subtitle: `Du suchst professionelle Physiotherapie in ${city}? Mit Praxis OS erhältst du individuelle Behandlung per Video — bequem von zu Hause, ohne Wartezeit und ohne Anfahrt.`,
    },
    {
      title: `Physiotherapie ${city} — jetzt online`,
      subtitle: `Lange Wartezeiten auf einen Physiotherapie-Termin in ${city}? Das muss nicht sein. Unsere zertifizierten Therapeuten behandeln dich per Video — flexibel, persönlich und effektiv.`,
    },
    {
      title: `Dein Physiotherapeut in ${city} — per Video`,
      subtitle: `Professionelle physiotherapeutische Betreuung für Patienten aus ${city} und Umgebung. Online-Termine innerhalb von 24 Stunden, individuelle Trainingspläne und persönlicher Chat mit deinem Therapeuten.`,
    },
    {
      title: `Physiotherapie von zu Hause — ${city}`,
      subtitle: `Ob Rückenschmerzen, Kniebeschwerden oder Reha nach einer OP: Unsere Online-Physiotherapie bringt professionelle Behandlung direkt zu dir nach ${city}. Ganz ohne Praxisbesuch.`,
    },
    {
      title: `${city}: Physiotherapie neu gedacht`,
      subtitle: `Erlebe moderne Physiotherapie in ${city} — digital, individuell und evidenzbasiert. Per Video-Sitzung mit deinem persönlichen Therapeuten, ergänzt durch einen maßgeschneiderten Trainingsplan.`,
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
      "Persönlicher Chat mit deinem Therapeuten zwischen den Sitzungen",
      "Flexible Terminwahl — auch abends und am Wochenende",
      "Keine Anfahrt, kein Stau, kein Parkplatzsuchen",
    ],
    [
      "Zertifizierte Physiotherapeuten mit langjähriger Erfahrung",
      `Speziell für Patienten aus ${city} und Umgebung`,
      "Evidenzbasierte Behandlungsmethoden",
      "Tägliches Befindlichkeits-Tracking per App",
      "Trainingspläne, die sich deinem Fortschritt anpassen",
      "Ersteinschätzung bereits ab 69 €",
    ],
    [
      `Schnelle Termine für Patienten in ${city}`,
      "HD-Video-Sitzungen mit persönlichem Therapeuten",
      "Übungen mit Videoanleitung zum Nachmachen",
      "Fortschrittskontrolle und Anpassung des Trainingsplans",
      "DSGVO-konforme Plattform — deine Daten sind sicher",
      "Keine Verordnung vom Arzt notwendig",
    ],
    [
      "Therapie-Start ohne lange Wartezeit",
      `Ideal für berufstätige Patienten in ${city}`,
      "Persönliche Betreuung wie in der Praxis vor Ort",
      "Wissenschaftlich fundierte Übungsprogramme",
      "Direkter Draht zu deinem Therapeuten per Chat",
      "Transparente Preise ohne versteckte Kosten",
    ],
    [
      `Online-Physiotherapie auf höchstem Niveau in ${city}`,
      "Maßgeschneiderte Therapiepläne für deine Beschwerden",
      "Video-Sitzungen in HD-Qualität",
      "Lernmodule zu deinem Krankheitsbild inklusive",
      "Regelmäßige Fortschrittsmessung und Zielanpassung",
      "Einfache Terminbuchung über die App",
    ],
  ]
  return sets[variant % sets.length]
}

function getProcessSteps(city: string, variant: number) {
  const sets = [
    [
      { title: "Anfrage stellen", desc: `Stelle deine Anfrage online. Beschreibe kurz deine Beschwerden — wir melden uns innerhalb von 24 Stunden bei dir.` },
      { title: "Ersteinschätzung per Video", desc: `In einem persönlichen Video-Gespräch lernen wir deine Situation kennen, führen eine ausführliche Anamnese durch und besprechen deine Ziele.` },
      { title: "Dein Trainingsplan", desc: `Du erhältst einen individuellen Trainingsplan mit Video-Anleitungen, den du flexibel in deinen Alltag in ${city} integrieren kannst.` },
      { title: "Begleitung & Anpassung", desc: `Über unsere App bleiben wir in Kontakt. Wir passen deinen Plan regelmäßig an deinen Fortschritt an.` },
    ],
    [
      { title: "Anfrage stellen", desc: `Fülle unser kurzes Formular aus. Wir prüfen, ob Online-Physiotherapie für dein Anliegen geeignet ist.` },
      { title: "Termin buchen", desc: `Wähle einen passenden Termin für deine Ersteinschätzung. Wir bieten flexible Zeiten, auch abends.` },
      { title: "Behandlung starten", desc: `In der ersten Video-Sitzung erstellen wir gemeinsam deinen Behandlungsplan mit konkreten Übungen und Zielen.` },
      { title: "Dranbleiben", desc: `Mit täglichem Tracking, Chat-Support und regelmäßigen Follow-ups begleiten wir dich auf deinem Weg in ${city}.` },
    ],
    [
      { title: "Beschwerden schildern", desc: `Erzähl uns in wenigen Sätzen, was dich belastet. Die Anfrage verpflichtet dich zu nichts.` },
      { title: "Kennenlernen", desc: `Dein Therapeut meldet sich persönlich bei dir und bespricht mit dir den weiteren Ablauf per Video.` },
      { title: "Therapie & Training", desc: `Du erhältst deine Behandlung per Video plus einen Trainingsplan, den du eigenständig in ${city} durchführst.` },
      { title: "Erfolge messen", desc: `Gemeinsam verfolgen wir deinen Fortschritt und passen die Therapie bei Bedarf an.` },
    ],
    [
      { title: "Online-Anfrage", desc: `Starte mit einer Anfrage. Kein Rezept nötig — als Heilpraktiker für Physiotherapie behandeln wir auch ohne ärztliche Verordnung.` },
      { title: "Video-Befund", desc: `In einer ausführlichen Video-Sitzung untersuchen wir deine Beschwerden und erstellen einen individuellen Befund.` },
      { title: "Aktiv werden", desc: `Mit deinem persönlichen Trainingsplan und Video-Übungen startest du deine Therapie — wann und wo es dir in ${city} passt.` },
      { title: "Langfristig gesund", desc: `Regelmäßige Video-Kontrollen und ein angepasster Plan sorgen dafür, dass du nachhaltig schmerzfrei bleibst.` },
    ],
    [
      { title: "Kontakt aufnehmen", desc: `Über unser Formular erreichst du uns in weniger als 2 Minuten. Wir antworten innerhalb eines Werktags.` },
      { title: "Ersteinschätzung", desc: `In einem Erstgespräch klären wir, wie wir dir am besten helfen können — ab 69 €.` },
      { title: "Therapieplan erhalten", desc: `Basierend auf deiner Untersuchung erhältst du einen evidenzbasierten Trainingsplan für deine Beschwerden.` },
      { title: "Fortlaufende Betreuung", desc: `Dein Therapeut begleitet dich per Video und Chat — als wärst du direkt in der Praxis in ${city}.` },
    ],
  ]
  return sets[variant % sets.length]
}

function getFaq(city: string, variant: number) {
  const baseFaq = [
    {
      q: `Brauche ich eine Verordnung für Online-Physiotherapie in ${city}?`,
      a: `Nein, als Heilpraktiker für Physiotherapie können wir dich auch ohne ärztliche Verordnung behandeln. Du kannst direkt eine Anfrage stellen und wir melden uns bei dir.`,
    },
    {
      q: `Wie läuft eine Online-Physiotherapie-Sitzung ab?`,
      a: `Die Sitzung findet per Video statt. Dein Therapeut führt eine Untersuchung durch, zeigt dir Übungen und erstellt einen individuellen Trainingsplan. Zwischen den Sitzungen bleibst du per Chat in Kontakt.`,
    },
    {
      q: `Was kostet Online-Physiotherapie?`,
      a: `Die Ersteinschätzung beginnt ab 69 €. Je nach Beschwerdebild bieten wir verschiedene Behandlungspakete an. Konkrete Preise besprechen wir im Erstgespräch basierend auf deinen Bedürfnissen.`,
    },
  ]

  const extraFaq = [
    [
      { q: `Ist Online-Physiotherapie genauso effektiv wie in einer Praxis in ${city}?`, a: `Studien zeigen, dass Online-Physiotherapie bei vielen Beschwerden gleichwertige Ergebnisse erzielt wie die Behandlung vor Ort. Besonders bei muskuloskelettalen Beschwerden, Rückenschmerzen und Reha nach OPs ist die Wirksamkeit wissenschaftlich belegt.` },
      { q: `Was brauche ich für eine Video-Sitzung?`, a: `Du brauchst lediglich ein Smartphone, Tablet oder einen Computer mit Kamera und Internetverbindung. Unsere Plattform funktioniert direkt im Browser — keine Installation nötig.` },
    ],
    [
      { q: `Wie schnell bekomme ich einen Termin in ${city}?`, a: `In der Regel können wir dir innerhalb von 24 Stunden nach deiner Anfrage einen Termin anbieten. Wir bieten auch Abend- und Wochenendtermine an.` },
      { q: `Kann ich die Übungen auch unterwegs machen?`, a: `Ja, alle Übungen in deinem Trainingsplan haben Video-Anleitungen, die du jederzeit über unsere App abrufen kannst — zu Hause, im Büro oder unterwegs.` },
    ],
    [
      { q: `Werden die Kosten von der Krankenkasse übernommen?`, a: `Als Heilpraktiker-Leistung werden die Kosten in der Regel nicht von gesetzlichen Krankenkassen übernommen. Private Krankenversicherungen und Zusatzversicherungen erstatten die Behandlung häufig. Wir stellen dir eine Rechnung aus, die du einreichen kannst.` },
      { q: `Wie oft finden die Video-Sitzungen statt?`, a: `Die Frequenz richtet sich nach deinen Beschwerden und deinem Therapieplan. Typischerweise starten wir mit wöchentlichen Sitzungen und reduzieren die Frequenz im Verlauf.` },
    ],
    [
      { q: `Behandelt ihr auch akute Schmerzen per Video?`, a: `Ja, bei vielen akuten Beschwerden können wir dir per Video-Sitzung schnell weiterhelfen. Bei Verdacht auf schwerwiegende Verletzungen empfehlen wir jedoch den Besuch eines Arztes.` },
      { q: `Kann ich meinen Therapeuten wechseln?`, a: `Selbstverständlich. Wenn die Chemie nicht stimmt, kannst du jederzeit einen anderen Therapeuten anfragen. Deine Zufriedenheit steht an erster Stelle.` },
    ],
    [
      { q: `Gibt es eine Mindestlaufzeit?`, a: `Nein, es gibt keine Mindestlaufzeit. Du kannst die Zusammenarbeit jederzeit beenden. Wir empfehlen jedoch mindestens 4-6 Wochen, um nachhaltige Ergebnisse zu erzielen.` },
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

        <div className="relative py-24 md:py-28 px-4">
          <div className="container mx-auto max-w-3xl">
            <div
              className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full border mb-8"
              style={{ borderColor: LINE, backgroundColor: "rgba(255,255,255,0.6)" }}
            >
              <MapPin className="h-4 w-4" style={{ color: GREEN }} />
              <span className="text-sm font-medium" style={{ color: GREEN }}>
                {city.name}, {city.region} — {LAND_NAMEN[city.land]}
              </span>
            </div>
            <h1
              className="text-3xl md:text-4xl lg:text-5xl mb-5 leading-tight"
              style={{ ...serif, color: INK }}
            >
              {hero.title}
            </h1>
            <p className="text-lg leading-relaxed max-w-2xl" style={{ color: BODY }}>
              {hero.subtitle}
            </p>
            <div className="mt-10 flex flex-col sm:flex-row items-start gap-4">
              <Link
                href="/anfrage"
                className="inline-flex items-center gap-2 px-8 py-3.5 text-white font-semibold rounded-xl transition-all hover:opacity-90"
                style={{ backgroundColor: GREEN }}
              >
                Jetzt Ersteinschätzung anfragen <ArrowRight className="h-4 w-4" />
              </Link>
              <span className="text-sm sm:self-center" style={{ color: MUTED }}>ab 69 €</span>
            </div>
          </div>
        </div>
      </div>

      {/* Trust Bar */}
      <div className="border-b bg-white" style={{ borderColor: LINE }}>
        <div className="container mx-auto max-w-3xl px-4 py-5">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            {[
              { icon: Video, label: "HD Video" },
              { icon: Clock, label: "Termin in 24h" },
              { icon: ShieldCheck, label: "DSGVO" },
              { icon: Star, label: "Evidenzbasiert" },
            ].map((item, i) => (
              <div key={i} className="flex items-center gap-2 justify-center">
                <item.icon className="h-4 w-4" style={{ color: GREEN }} />
                <span className="text-xs font-medium" style={{ color: BODY }}>{item.label}</span>
              </div>
            ))}
          </div>
        </div>
      </div>

      <div className="container mx-auto max-w-3xl px-4 py-16 space-y-20">
        {/* Advantages — Premium cards with subtle gradient */}
        <section>
          <div className="mb-8">
            <span className="text-xs font-semibold uppercase tracking-wider" style={{ color: GREEN }}>Deine Vorteile</span>
            <h2 className="text-2xl md:text-3xl mt-2" style={{ ...serif, color: INK }}>
              Warum Patienten in {city.name} uns wählen
            </h2>
          </div>
          <div className="grid gap-3 sm:grid-cols-2">
            {advantages.map((adv, i) => (
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
                <span className="text-sm leading-relaxed" style={{ color: BODY }}>{adv}</span>
              </div>
            ))}
          </div>
        </section>

        {/* How it works — Premium steps with connecting line */}
        <section>
          <div className="mb-8">
            <span className="text-xs font-semibold uppercase tracking-wider" style={{ color: GREEN }}>In 4 Schritten</span>
            <h2 className="text-2xl md:text-3xl mt-2" style={{ ...serif, color: INK }}>
              So funktioniert&apos;s
            </h2>
          </div>
          <div className="grid gap-4 sm:grid-cols-2">
            {steps.map((step, i) => {
              const icons = [ClipboardList, Video, Activity, MessageCircle]
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
                  <p className="text-sm leading-relaxed" style={{ color: MUTED }}>{step.desc}</p>
                </div>
              )
            })}
          </div>
        </section>

        {/* Beschwerden we treat — Premium grid */}
        <section>
          <div className="mb-8">
            <span className="text-xs font-semibold uppercase tracking-wider" style={{ color: GREEN }}>Beschwerdebilder</span>
            <h2 className="text-2xl md:text-3xl mt-2" style={{ ...serif, color: INK }}>
              Beschwerden, die wir in {city.name} behandeln
            </h2>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            {BESCHWERDEN.slice(0, 8).map((b) => (
              <Link
                key={b.slug}
                href={`/beschwerden/${b.slug}`}
                className="group flex items-center justify-between rounded-2xl bg-white border p-5 hover:shadow-md transition-all"
                style={{ borderColor: LINE }}
              >
                <div className="flex items-center gap-3">
                  <div
                    className="h-9 w-9 rounded-xl flex items-center justify-center shrink-0"
                    style={{ backgroundColor: "rgba(44,62,45,0.10)" }}
                  >
                    <Activity className="h-4 w-4" style={{ color: GREEN }} />
                  </div>
                  <span className="text-sm font-semibold transition-colors" style={{ color: BODY }}>
                    {b.name}
                  </span>
                </div>
                <ArrowRight className="h-4 w-4 group-hover:translate-x-1 transition-all" style={{ color: SAND }} />
              </Link>
            ))}
          </div>
          <div className="mt-5 text-center">
            <Link
              href="/beschwerden"
              className="text-sm font-semibold inline-flex items-center gap-1.5 hover:opacity-90"
              style={{ color: GREEN }}
            >
              Alle Beschwerdebilder ansehen <ArrowRight className="h-3.5 w-3.5" />
            </Link>
          </div>
        </section>

        {/* Why online — Premium card with gradient accent */}
        <section className="relative rounded-3xl bg-white border shadow-sm overflow-hidden" style={{ borderColor: LINE }}>
          <div className="absolute top-0 left-0 right-0 h-1" style={{ backgroundColor: GREEN }} />
          <div className="p-8 md:p-10">
            <span className="text-xs font-semibold uppercase tracking-wider" style={{ color: GREEN }}>Gut zu wissen</span>
            <h2 className="text-2xl md:text-3xl mt-2 mb-6" style={{ ...serif, color: INK }}>
              Warum Online-Physiotherapie in {city.name}?
            </h2>
            <div className="space-y-4 text-sm leading-relaxed" style={{ color: MUTED }}>
              <p>
                Die Suche nach einem Physiotherapie-Termin in {city.name} kann frustrierend sein:
                Lange Wartelisten, ungünstige Zeiten und weite Anfahrtswege. Mit Online-Physiotherapie
                gehören diese Probleme der Vergangenheit an.
              </p>
              <p>
                Unsere zertifizierten Therapeuten behandeln dich per hochauflösender Video-Sitzung —
                genauso persönlich und individuell wie in einer Praxis vor Ort. Der Unterschied: Du
                sparst dir die Anfahrt und bekommst schneller einen Termin.
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
            <span className="text-xs font-semibold uppercase tracking-wider" style={{ color: GREEN }}>FAQ</span>
            <h2 className="text-2xl md:text-3xl mt-2" style={{ ...serif, color: INK }}>
              Häufige Fragen zur Physiotherapie in {city.name}
            </h2>
          </div>
          <div className="space-y-3">
            {faq.map((f, i) => (
              <details
                key={i}
                className="group rounded-2xl bg-white border shadow-sm overflow-hidden hover:shadow-md transition-shadow"
                style={{ borderColor: LINE }}
              >
                <summary className="flex items-center justify-between cursor-pointer p-5 md:p-6 text-sm font-semibold transition-colors list-none [&::-webkit-details-marker]:hidden" style={{ color: INK }}>
                  {f.q}
                  <div
                    className="h-7 w-7 rounded-lg flex items-center justify-center shrink-0 ml-4 transition-colors group-open:bg-[rgba(44,62,45,0.10)]"
                    style={{ backgroundColor: PAPER }}
                  >
                    <ArrowRight className="h-3.5 w-3.5 group-open:rotate-90 transition-all" style={{ color: GREEN }} />
                  </div>
                </summary>
                <div className="px-5 pb-5 md:px-6 md:pb-6">
                  <p className="text-sm leading-relaxed" style={{ color: MUTED }}>{f.a}</p>
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
        <section className="relative rounded-3xl overflow-hidden border" style={{ backgroundColor: GREEN, borderColor: GREEN }}>
          <div
            aria-hidden
            className="pointer-events-none absolute inset-0"
            style={{ background: "radial-gradient(circle at top left, rgba(201,183,156,0.18), transparent)" }}
          />
          <div className="relative p-10 md:p-14 text-center">
            <h2 className="text-2xl md:text-3xl text-white mb-4" style={serif}>
              Physiotherapie in {city.name} — jetzt starten
            </h2>
            <p className="mb-8 max-w-lg mx-auto leading-relaxed" style={{ color: "rgba(255,255,255,0.85)" }}>
              Stelle deine Anfrage und erhalte innerhalb von
              24 Stunden eine persönliche Rückmeldung von unserem Therapeuten.
            </p>
            <Link
              href="/anfrage"
              className="inline-flex items-center gap-2 px-8 py-3.5 bg-white font-semibold rounded-xl transition-all hover:opacity-90"
              style={{ color: GREEN }}
            >
              Anfrage stellen — ab 69 € <ArrowRight className="h-4 w-4" />
            </Link>
          </div>
        </section>

        {/* Nearby cities */}
        {nearbyCities.length > 0 && (
          <section>
            <h2 className="text-lg font-semibold mb-4" style={{ color: INK }}>
              Weitere Städte in {city.region}
            </h2>
            <div className="flex flex-wrap gap-2">
              {nearbyCities.map((other) => (
                <Link
                  key={other.slug}
                  href={`/online-physiotherapie/${other.slug}`}
                  className="group inline-flex items-center gap-1.5 px-3.5 py-2 rounded-lg bg-white border text-sm transition-all hover:opacity-90"
                  style={{ borderColor: LINE, color: BODY }}
                >
                  <MapPin className="h-3 w-3" style={{ color: GREEN }} />
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
            className="text-sm font-medium inline-flex items-center gap-1 hover:opacity-90"
            style={{ color: MUTED }}
          >
            Alle Standorte ansehen <ArrowRight className="h-3 w-3" />
          </Link>
        </div>
      </div>
    </div>
  )
}
