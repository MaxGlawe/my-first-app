"use client"

/**
 * PROJ-26: FAQ.
 *
 * Zwei Regeln, nach denen jede Antwort hier geschrieben ist:
 *
 *  1. IN SICH GESCHLOSSEN. Jede Antwort muss ohne die Frage und ohne den Rest
 *     der Seite verständlich sein — sie wiederholt den Gegenstand also
 *     ausdrücklich („Das 90-Tage-Programm kostet ..."), statt auf „das" oder
 *     „oben" zu verweisen. Das ist der GEO-Punkt: Sprachmodelle zitieren
 *     einzelne Absätze, nicht ganze Seiten.
 *
 *  2. KEINE WIRKUNGSAUSSAGE. Auch nicht in der Frage. „Hilft mir das?" wäre
 *     eine Einladung zum Heilversprechen; deshalb fragt die Seite stattdessen,
 *     was passiert, wenn es nicht passt.
 *
 * Die Erhaltungsphase (16,99 €/Monat) steht bewusst NUR hier und nirgends
 * prominent — sie ist eine Möglichkeit nach dem Programm, kein Teil des
 * Angebots. Genau dieses Nebeneinander war im alten Modell das Problem.
 *
 * Das JSON-LD unten wird aus derselben Liste erzeugt wie die sichtbaren
 * Texte. So können Rich Snippet und Seite nicht auseinanderlaufen.
 */

import { ScrollReveal } from "./ScrollReveal"
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion"
import { PROGRAMM, PROGRAMM_CALLS, formatEuro } from "@/lib/programm"

const PAPER = "#F8F5F0"
const INK = "#0f172a"
const BODY = "#334155"
const MUTED = "#64748b"
const GREEN = "#2C3E2D"

const serif = { fontFamily: "var(--font-serif)", fontWeight: 600 } as const

const FRAGEN: { frage: string; antwort: string }[] = [
  {
    frage: "Wie läuft das 90-Tage-Programm von Praxis OS ab?",
    antwort: `Das 90-Tage-Programm beginnt mit einer 30-minütigen Videokonsultation, in der Beschwerden, Vorgeschichte und Ziele besprochen werden und geprüft wird, ob sich das Beschwerdebild aus der Ferne betreuen lässt. Passt es, erstellt der Behandler einen persönlichen Plan aus täglichen Micro-Übungen und einem Trainingsplan für festgelegte Trainingstage. In der App wird täglich kurz eingecheckt, der Plan wird laufend angepasst. Über die gesamte Zeit gibt es ${PROGRAMM_CALLS} Video-Sitzungen: in den Wochen 1 bis 4 wöchentlich, in den Wochen 5 bis 8 alle zwei Wochen, in den Wochen 9 bis 12 ein Zwischengespräch und ein Abschlussgespräch. Nach ${PROGRAMM.tage} Tagen endet die Betreuung automatisch.`,
  },
  {
    frage: "Brauche ich eine ärztliche Verordnung oder eine Überweisung?",
    antwort:
      "Für das 90-Tage-Programm von Praxis OS ist weder eine ärztliche Verordnung noch eine Überweisung nötig. Behandelt wird von Max Glawe, Heilpraktiker für Physiotherapie. Diese Erlaubnis nach dem Heilpraktikergesetz, beschränkt auf das Gebiet der Physiotherapie, erlaubt eigenständige Befunderhebung und Behandlung — man spricht vom Direktzugang. Unabhängig davon empfehlen wir, ungeklärte oder plötzlich aufgetretene Beschwerden vorab ärztlich abklären zu lassen.",
  },
  {
    frage: "Was kostet das Programm, und wann wird abgerechnet?",
    antwort: `Das 90-Tage-Programm von Praxis OS kostet ${formatEuro(PROGRAMM.gesamtpreis)} einmalig; die vorausgegangene Videokonsultation ist darin enthalten. Die Terminbuchung selbst kostet nichts und es wird dabei nichts abgebucht. Abgerechnet wird erst nach dem Gespräch: entweder das Programm, oder ${formatEuro(PROGRAMM.konsultation)} für die Konsultation allein, wenn man sich gegen das Programm entscheidet. Bezahlt wird per Karte oder Klarna; ob Klarna eine Ratenzahlung anbietet, entscheidet Klarna nach eigener Prüfung.`,
  },
  {
    frage: "Was passiert, wenn ihr mein Beschwerdebild nicht betreuen könnt?",
    antwort: `Dann wird das in der Videokonsultation offen gesagt. Fernbetreuung ist nicht für jedes Beschwerdebild geeignet — etwa nicht bei frischen Verletzungen, nach einer kürzlichen Operation oder bei Anzeichen, die zuerst ärztlich abgeklärt gehören. In diesem Fall entstehen nur die ${formatEuro(PROGRAMM.konsultation)} für das Gespräch, und es wird kein Programm abgeschlossen. Nach Möglichkeit wird auf einen geeigneteren Weg hingewiesen.`,
  },
  {
    frage: "Ist das ein Abonnement, und was passiert nach den 90 Tagen?",
    antwort: `Das 90-Tage-Programm von Praxis OS ist kein Abonnement. Es endet nach ${PROGRAMM.tage} Tagen automatisch, verlängert sich nicht und es wird danach nichts weiter abgebucht. Der bisherige Verlauf — Pläne, Check-ins, Nachrichten — bleibt danach einsehbar. Wer die App darüber hinaus aktiv weiternutzen möchte, kann das gesondert für 16,99 € im Monat tun; diese Weiternutzung ist jederzeit kündbar und enthält keine Video-Sitzungen. Sie ist nicht Bestandteil des Programms und muss ausdrücklich beauftragt werden.`,
  },
  {
    frage: "Übernimmt die Krankenkasse die Kosten?",
    antwort:
      "Die gesetzliche Krankenkasse übernimmt die Kosten für das 90-Tage-Programm von Praxis OS nicht. Es handelt sich um eine Privatleistung, abgerechnet über eine Heilpraktiker-Rechnung; als heilkundliche Leistung ist sie nach § 4 Nr. 14a UStG umsatzsteuerfrei. Private Krankenversicherungen, Beihilfestellen und Heilpraktiker-Zusatzversicherungen erstatten je nach Tarif teilweise — das hängt ausschließlich vom individuellen Vertrag ab. Ein Kostenvoranschlag wird auf Wunsch vorab ausgestellt. Das Programm ist kein nach § 20 SGB V zertifizierter Präventionskurs.",
  },
  {
    frage: "Wie schnell bekomme ich eine Antwort, wenn ich eine Frage habe?",
    antwort: `Im Chat von Praxis OS wird an Werktagen innerhalb von ${PROGRAMM.chatAntwortStunden} Stunden geantwortet, und zwar vom betreuenden Behandler selbst, nicht von einem Team oder einer Hotline. Verschlechtern sich die Beschwerden, kann zusätzlich eine weitere Video-Sitzung vereinbart werden; eine Rückmeldung dazu erfolgt spätestens am nächsten Werktag. Praxis OS ist kein Notdienst: Bei akuten Beschwerden ist der ärztliche Notdienst oder die 112 zuständig.`,
  },
  {
    frage: "Was brauche ich technisch, um mitzumachen?",
    antwort:
      "Für das 90-Tage-Programm von Praxis OS genügen ein Smartphone, Tablet oder Computer mit Kamera, Mikrofon und Internetverbindung sowie etwas Platz zum Bewegen. Die Video-Sitzungen laufen über Doctolib; dafür wird vor jedem Termin ein persönlicher Zugangslink verschickt, eine Installation ist nicht nötig. Plan, Check-in und Chat laufen über die Praxis-OS-App im Browser, die sich auf dem Startbildschirm ablegen lässt. Besondere Geräte oder Trainingsmittel werden nicht vorausgesetzt.",
  },
  {
    frage: "Kann ich den Vertrag widerrufen?",
    antwort:
      "Ja. Für das 90-Tage-Programm von Praxis OS besteht ein Widerrufsrecht von 14 Tagen ab Vertragsschluss. Beim Abschluss wird ausdrücklich zugestimmt, dass die Betreuung sofort beginnt — dadurch ist im Fall eines Widerrufs nach Beginn ein anteiliger Wertersatz für die bereits erbrachten Leistungen zu zahlen (§ 357 Abs. 8 BGB). Die vollständigen Bedingungen stehen im Behandlungsvertrag, der vor der Zahlung vollständig einsehbar ist.",
  },
]

export function FaqSection() {
  const jsonLd = {
    "@context": "https://schema.org",
    "@type": "FAQPage",
    mainEntity: FRAGEN.map((f) => ({
      "@type": "Question",
      name: f.frage,
      acceptedAnswer: { "@type": "Answer", text: f.antwort },
    })),
  }

  return (
    <section id="faq" className="relative py-24 sm:py-32" style={{ backgroundColor: PAPER }}>
      {/* Aus derselben Liste wie die sichtbaren Texte — sie können nicht auseinanderlaufen. */}
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
      />

      <div className="container mx-auto max-w-3xl px-4">
        <ScrollReveal className="mb-12 sm:mb-16">
          <span className="text-sm font-medium uppercase tracking-wider" style={{ color: GREEN }}>
            Häufige Fragen
          </span>
          <h2 className="mt-3 text-3xl sm:text-4xl lg:text-5xl" style={{ ...serif, color: INK }}>
            Was du wissen solltest
          </h2>
          <p className="mt-4 text-lg leading-relaxed" style={{ color: MUTED }}>
            Offene Fragen klären wir ohnehin in der Konsultation. Das Wichtigste steht aber
            schon hier.
          </p>
        </ScrollReveal>

        <ScrollReveal>
          <Accordion type="single" collapsible className="w-full">
            {FRAGEN.map((f, i) => (
              <AccordionItem key={f.frage} value={`frage-${i}`}>
                <AccordionTrigger className="text-left text-[17px] leading-snug hover:no-underline sm:text-lg">
                  <span style={{ ...serif, color: INK }}>{f.frage}</span>
                </AccordionTrigger>
                <AccordionContent>
                  <p className="pb-2 text-[15.5px] leading-relaxed" style={{ color: BODY }}>
                    {f.antwort}
                  </p>
                </AccordionContent>
              </AccordionItem>
            ))}
          </Accordion>
        </ScrollReveal>
      </div>
    </section>
  )
}
