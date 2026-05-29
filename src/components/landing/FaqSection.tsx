"use client"

import { ScrollReveal } from "./ScrollReveal"
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion"

// Premium-Markenwelt (Masterclass-Format)
const PAPER = "#F8F5F0"
const INK = "#0f172a"
const BODY = "#334155"
const MUTED = "#64748b"
const GREEN = "#2C3E2D"
const LINE = "#e7e1d6"

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
          "Online-Therapie eignet sich besonders gut für: Rückenschmerzen (LWS, BWS, HWS), Schulter- und Nackenbeschwerden, Kniebeschwerden, Rehabilitaton nach Operationen, Prävention und Haltungskorrektur. Nicht geeignet ist sie für akute Notfälle, frische Frakturen oder Beschwerden, die eine manuelle Untersuchung vor Ort erfordern. In der Ersteinschätzung (30 Min., 69€) klären wir gemeinsam, ob Online-Therapie für dich der richtige Weg ist.",
      },
      {
        question: "Was brauche ich technisch?",
        answer:
          "Nicht viel: Ein Smartphone, Tablet oder Computer mit Kamera, eine stabile Internetverbindung und ca. 2×2 Meter Platz zum Üben. Für die Übungen benötigst du keine speziellen Geräte — wir arbeiten vorrangig mit deinem eigenen Körpergewicht und Alltagsgegenständen. Falls ein Hilfsmittel sinnvoll ist, besprechen wir das individuell.",
      },
    ],
  },
  {
    category: "Kosten & Erstattung",
    items: [
      {
        question: "Übernimmt meine Krankenkasse die Kosten?",
        answer:
          "Ja, in vielen Fällen. Private Krankenversicherungen (PKV) erstatten Heilpraktiker-Leistungen in der Regel vollständig oder anteilig — je nach Tarif. Auch Heilpraktiker-Zusatzversicherungen (schon ab ca. 15€/Monat) decken unsere Behandlungen ab — ideal für gesetzlich Versicherte. In der Ersteinschätzung prüfen wir gerne deine individuelle Erstattungssituation.",
      },
      {
        question: "Brauche ich eine ärztliche Verordnung?",
        answer:
          "Nein. Als Heilpraktiker für Physiotherapie sind wir berechtigt, eigenständig Diagnosen zu stellen und zu behandeln — ohne dass du vorher zum Arzt musst. Das spart dir Zeit und Wartezeit. Du kannst direkt bei uns anfragen und sofort starten.",
      },
    ],
  },
  {
    category: "Ablauf & Betreuung",
    items: [
      {
        question: "Wie persönlich ist die Betreuung?",
        answer:
          "Sehr persönlich. Du hast einen festen Therapeuten, der dich über den gesamten Behandlungszeitraum begleitet — kein Wechsel, kein Weiterreichen. Wir nehmen bewusst nur eine begrenzte Anzahl an Patienten gleichzeitig an, damit jeder die Aufmerksamkeit bekommt, die er verdient. Per Chat sind wir auch zwischen den Sitzungen erreichbar.",
      },
      {
        question: "Was ist, wenn mir die Therapie nicht hilft?",
        answer:
          "Schon in der Ersteinschätzung (30 Min., 69€) besprechen wir ehrlich, ob Online-Therapie für deine Situation geeignet ist. Nicht jede Beschwerde lässt sich online behandeln — und das sagen wir dir offen. Sollten wir im Verlauf der Therapie feststellen, dass eine andere Behandlungsform besser passt, beraten wir dich und finden gemeinsam eine Lösung. Die Betreuungspauschale (16,99€/Monat) ist jederzeit kündbar — du gehst also kein Risiko ein.",
      },
      {
        question:
          "Was wenn ich mal keine Zeit zum Trainieren habe?",
        answer:
          "Das passiert — und ist kein Problem. Dein Trainingsplan passt sich deinem Leben an, nicht umgekehrt. Wenn es eine stressige Woche ist, reduzieren wir den Umfang. Wenn du verreist, passen wir die Übungen an. Das Ziel ist eine nachhaltige Routine, keine Perfektion. Dein Therapeut begleitet dich flexibel durch Höhen und Tiefen.",
      },
    ],
  },
]

export function FaqSection() {
  return (
    <section
      id="faq"
      className="py-24 sm:py-32 relative overflow-hidden"
      style={{ backgroundColor: PAPER }}
    >
      {/* Smart line */}
      <div className="absolute top-0 left-1/2 -translate-x-1/2 flex flex-col items-center">
        <div className="smart-line h-12" />
        <div className="smart-line-dot animate-dot-pulse" />
      </div>

      <div className="container mx-auto px-4 max-w-6xl">
        <ScrollReveal className="text-center mb-16">
          <span className="text-sm font-medium uppercase tracking-wider" style={{ color: GREEN }}>
            FAQ
          </span>
          <h2
            className="mt-3 text-3xl sm:text-4xl lg:text-5xl tracking-tight"
            style={{ fontFamily: "var(--font-serif)", fontWeight: 600, color: INK }}
          >
            Noch Fragen?
          </h2>
          <p className="mt-4 text-lg max-w-2xl mx-auto" style={{ color: MUTED }}>
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
                  <p className="text-sm font-semibold" style={{ color: INK }}>
                    {cat.category}
                  </p>
                  <p className="text-xs mt-0.5" style={{ color: MUTED }}>
                    {cat.items.length} Fragen
                  </p>
                </div>
              ))}
              <div className="pt-4 border-t" style={{ borderColor: LINE }}>
                <p className="text-xs" style={{ color: MUTED }}>
                  Weitere Fragen? Stelle eine{" "}
                  <a
                    href="/anfrage"
                    className="font-medium hover:opacity-80"
                    style={{ color: GREEN }}
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
                <h3
                  className="text-xs font-semibold uppercase tracking-wider mb-4"
                  style={{ color: GREEN }}
                >
                  {cat.category}
                </h3>
                <Accordion type="single" collapsible className="space-y-2">
                  {cat.items.map((item, idx) => (
                    <AccordionItem
                      key={idx}
                      value={`${cat.category}-${idx}`}
                      className="rounded-2xl border bg-white px-6 data-[state=open]:shadow-lg data-[state=open]:shadow-slate-900/5 transition-shadow"
                      style={{ borderColor: LINE }}
                    >
                      <AccordionTrigger
                        className="text-left text-base font-semibold hover:no-underline py-5"
                        style={{ color: INK }}
                      >
                        {item.question}
                      </AccordionTrigger>
                      <AccordionContent
                        className="text-sm leading-relaxed pb-5"
                        style={{ color: BODY }}
                      >
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
