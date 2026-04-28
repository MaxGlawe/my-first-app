"use client"

import { ScrollReveal } from "./ScrollReveal"
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion"

const faqCategories = [
  {
    category: "Über Online-Therapie",
    items: [
      {
        question: "Funktioniert Physiotherapie wirklich online?",
        answer:
          "Ja — und das ist wissenschaftlich belegt. Ein Cochrane Review (Cottrell et al. 2017) zeigt, dass Telerehabilitation gleichwertige Ergebnisse wie Präsenzbehandlung erzielt. Zusätzlich profitieren Patienten von höherer Therapietreue (+34%), weil der digitale Support zwischen den Sitzungen die Motivation aufrechterhält. Entscheidend ist nicht der Ort der Behandlung, sondern die Qualität der Anleitung und die Konsequenz des Trainings.",
      },
      {
        question: "Für welche Beschwerden eignet sich Online-Therapie?",
        answer:
          "Online-Therapie eignet sich besonders gut für: Rückenschmerzen (LWS, BWS, HWS), Schulter- und Nackenbeschwerden, Kniebeschwerden, Rehabilitaton nach Operationen, Prävention und Haltungskorrektur. Nicht geeignet ist sie für akute Notfälle, frische Frakturen oder Beschwerden, die eine manuelle Untersuchung vor Ort erfordern. In der Ersteinschätzung (30 Min., 69€) klären wir gemeinsam, ob Online-Therapie für Sie der richtige Weg ist.",
      },
      {
        question: "Was brauche ich technisch?",
        answer:
          "Nicht viel: Ein Smartphone, Tablet oder Computer mit Kamera, eine stabile Internetverbindung und ca. 2×2 Meter Platz zum Üben. Für die Übungen benötigen Sie keine speziellen Geräte — wir arbeiten vorrangig mit Ihrem eigenen Körpergewicht und Alltagsgegenständen. Falls ein Hilfsmittel sinnvoll ist, besprechen wir das individuell.",
      },
    ],
  },
  {
    category: "Kosten & Erstattung",
    items: [
      {
        question: "Übernimmt meine Krankenkasse die Kosten?",
        answer:
          "Ja, in vielen Fällen. Private Krankenversicherungen (PKV) erstatten Heilpraktiker-Leistungen in der Regel vollständig oder anteilig — je nach Tarif. Auch Heilpraktiker-Zusatzversicherungen (schon ab ca. 15€/Monat) decken unsere Behandlungen ab — ideal für gesetzlich Versicherte. In der Ersteinschätzung prüfen wir gerne Ihre individuelle Erstattungssituation.",
      },
      {
        question: "Brauche ich eine ärztliche Verordnung?",
        answer:
          "Nein. Als Heilpraktiker für Physiotherapie sind wir berechtigt, eigenständig Diagnosen zu stellen und zu behandeln — ohne dass Sie vorher zum Arzt müssen. Das spart Ihnen Zeit und Wartezeit. Sie können direkt bei uns anfragen und sofort starten.",
      },
    ],
  },
  {
    category: "Ablauf & Betreuung",
    items: [
      {
        question: "Wie persönlich ist die Betreuung?",
        answer:
          "Sehr persönlich. Sie haben einen festen Therapeuten, der Sie über den gesamten Behandlungszeitraum begleitet — kein Wechsel, kein Weiterreichen. Wir nehmen bewusst nur eine begrenzte Anzahl an Patienten gleichzeitig an, damit jeder die Aufmerksamkeit bekommt, die er verdient. Per Chat sind wir auch zwischen den Sitzungen erreichbar.",
      },
      {
        question: "Was ist, wenn mir die Therapie nicht hilft?",
        answer:
          "Schon in der Ersteinschätzung (30 Min., 69€) besprechen wir ehrlich, ob Online-Therapie für Ihre Situation geeignet ist. Nicht jede Beschwerde lässt sich online behandeln — und das sagen wir Ihnen offen. Sollten wir im Verlauf der Therapie feststellen, dass eine andere Behandlungsform besser passt, beraten wir Sie und finden gemeinsam eine Lösung. Die Betreuungspauschale (16,99€/Monat) ist jederzeit kündbar — Sie gehen also kein Risiko ein.",
      },
      {
        question:
          "Was wenn ich mal keine Zeit zum Trainieren habe?",
        answer:
          "Das passiert — und ist kein Problem. Ihr Trainingsplan passt sich Ihrem Leben an, nicht umgekehrt. Wenn es eine stressige Woche ist, reduzieren wir den Umfang. Wenn Sie verreisen, passen wir die Übungen an. Das Ziel ist eine nachhaltige Routine, keine Perfektion. Ihr Therapeut begleitet Sie flexibel durch Höhen und Tiefen.",
      },
    ],
  },
]

export function FaqSection() {
  return (
    <section
      id="faq"
      className="py-24 sm:py-32 bg-[#faf9f7] relative overflow-hidden"
    >
      {/* Smart line */}
      <div className="absolute top-0 left-1/2 -translate-x-1/2 flex flex-col items-center">
        <div className="smart-line h-12" />
        <div className="smart-line-dot animate-dot-pulse" />
      </div>

      <div className="container mx-auto px-4 max-w-6xl">
        <ScrollReveal className="text-center mb-16">
          <span className="text-sm font-medium text-emerald-600 uppercase tracking-wider">
            FAQ
          </span>
          <h2 className="mt-3 text-3xl sm:text-4xl lg:text-5xl font-bold text-slate-900 tracking-tight">
            Noch{" "}
            <span className="bg-gradient-to-r from-emerald-600 to-teal-500 bg-clip-text text-transparent">
              Fragen?
            </span>
          </h2>
          <p className="mt-4 text-lg text-slate-500 max-w-2xl mx-auto">
            Die häufigsten Fragen — ehrlich und ausführlich beantwortet.
          </p>
        </ScrollReveal>

        {/* Two-column layout: sticky header left + accordion right */}
        <div className="grid grid-cols-1 lg:grid-cols-[280px_1fr] gap-10 lg:gap-16">
          {/* Left: Category navigation (sticky on desktop) */}
          <div className="hidden lg:block">
            <div className="sticky top-24 space-y-6">
              {faqCategories.map((cat) => (
                <div key={cat.category}>
                  <p className="text-sm font-semibold text-slate-900">
                    {cat.category}
                  </p>
                  <p className="text-xs text-slate-400 mt-0.5">
                    {cat.items.length} Fragen
                  </p>
                </div>
              ))}
              <div className="pt-4 border-t border-slate-200">
                <p className="text-xs text-slate-400">
                  Weitere Fragen? Stellen Sie eine{" "}
                  <a
                    href="/anfrage"
                    className="text-emerald-600 hover:text-emerald-700 font-medium"
                  >
                    Anfrage
                  </a>
                  .
                </p>
              </div>
            </div>
          </div>

          {/* Right: Accordion */}
          <div>
            {faqCategories.map((cat) => (
              <div key={cat.category} className="mb-8 last:mb-0">
                <h3 className="text-xs font-semibold text-emerald-600 uppercase tracking-wider mb-4">
                  {cat.category}
                </h3>
                <Accordion type="single" collapsible className="space-y-2">
                  {cat.items.map((item, idx) => (
                    <AccordionItem
                      key={idx}
                      value={`${cat.category}-${idx}`}
                      className="rounded-2xl border border-slate-200 bg-white px-6 data-[state=open]:shadow-lg data-[state=open]:shadow-slate-900/5 transition-shadow"
                    >
                      <AccordionTrigger className="text-left text-base font-semibold text-slate-900 hover:no-underline py-5">
                        {item.question}
                      </AccordionTrigger>
                      <AccordionContent className="text-sm text-slate-500 leading-relaxed pb-5">
                        {item.answer}
                      </AccordionContent>
                    </AccordionItem>
                  ))}
                </Accordion>
              </div>
            ))}
          </div>
        </div>
      </div>
    </section>
  )
}
