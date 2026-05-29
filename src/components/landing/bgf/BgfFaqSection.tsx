"use client"

import { motion } from "framer-motion"
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion"

const faqs = [
  {
    question: "Ist das wirklich ein echter Therapeut — oder nur eine App?",
    answer:
      "Ein echter, staatlich geprüfter Therapeut. Hinter Praxis OS steht eine Physiotherapie- und Heilpraktiker-Praxis. Die App ist das Werkzeug, mit dem ein Therapeut viele Mitarbeitende gleichzeitig betreuen kann — Analyse, individuelle Pläne, Chat bei Beschwerden und Quartals-Auswertung übernimmt ein Mensch, nicht ein Algorithmus. Im Tarif „Dedizierter Therapeut“ haben Sie sogar einen festen, namentlichen Ansprechpartner für Ihr Unternehmen.",
  },
  {
    question: "Wie läuft ein Pilot-Programm ab?",
    answer:
      "Nach Ihrer Anfrage vereinbaren wir einen kostenlosen 30-Minuten-Call. Danach erhalten Sie einen Zugang für 10–20 Mitarbeitende für 30 Tage — vollkommen kostenlos und unverbindlich. Wir begleiten das Pilot-Programm aktiv und liefern nach Abschluss einen detaillierten Ergebnisbericht. Erst danach entscheiden Sie, ob und wie Sie weitermachen möchten.",
  },
  {
    question: "Was genau sieht HR? Was sieht HR NICHT?",
    answer:
      "HR sieht ausschließlich anonymisierte, aggregierte Daten: Teilnahmequoten, Risiko-Scores nach Abteilung, Trend-Entwicklungen, Beschwerdekategorien. HR sieht NIEMALS: Individuelle Schmerzprotokolle, persönliche Übungsverläufe, Diagnosen oder Angaben einzelner Mitarbeitenden. Die Anonymisierung wird technisch erzwungen — nicht nur organisatorisch.",
  },
  {
    question: "Ist das wirklich DSGVO-konform?",
    answer:
      "Ja. Alle Daten werden ausschließlich auf deutschen EU-Servern gespeichert. Wir schließen mit Ihnen einen DSGVO-konformen Auftragsverarbeitungsvertrag (AVV). Die technische Anonymisierung der HR-Auswertungen ist architektonisch sichergestellt. Mitarbeitende geben informierte Einwilligung bei der Registrierung. Auf Wunsch stellen wir alle DSGVO-Unterlagen vor Vertragsabschluss zur Verfügung.",
  },
  {
    question: "Brauchen Mitarbeiter eine App?",
    answer:
      "Nein — kein App-Download nötig. Praxis OS funktioniert vollständig im Browser als Progressive Web App (PWA). Mitarbeitende können optional eine Verknüpfung auf dem Home-Bildschirm speichern, falls gewünscht. Das senkt die Einstiegshürde erheblich — keine IT-Abteilung, keine App-Store-Genehmigungen nötig.",
  },
  {
    question: "Was passiert, wenn ein Mitarbeitender hohe Schmerzwerte hat?",
    answer:
      "Das Ampel-System erkennt kritische Schmerzwerte automatisch. Bei 'Rot' wird der Mitarbeitende aktiv zur Kontaktaufnahme mit unserem Therapeuten aufgefordert. HR sieht lediglich, dass ein anonymer Fall eine therapeutische Betreuung erhalten hat — keine Identität, keine Details. Unser Therapeut nimmt ggf. direkten Kontakt auf und bietet eine Video-Konsultation an.",
  },
  {
    question: "Wie sieht es mit Steuervorteil und Krankenkassen-Förderung aus?",
    answer:
      "Hier sind wir bewusst transparent: Die Software-Lizenz selbst ist keine ZPP-zertifizierte Maßnahme. Den Steuervorteil nach §3 Nr. 34 EStG (bis 600 €/MA/Jahr steuer- und abgabenfrei) sowie eine Krankenkassen-Förderung nutzen Sie über unsere zubuchbaren, zertifizierten Präventionskurse — per Live-Stream oder vor Ort. Max Glawe ist als Kursleiter bei der ZPP registriert. Die nötigen Nachweise stellen wir bereit — die steuerliche Behandlung klären Sie bitte mit Ihrem Steuerberater.",
  },
]

export function BgfFaqSection() {
  return (
    <section className="py-24 sm:py-32 bg-landing-bg relative overflow-hidden">
      <div className="container mx-auto px-4 max-w-4xl">
        <motion.div
          className="text-center mb-16"
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: "-80px" }}
          transition={{ duration: 0.7 }}
        >
          <span className="text-sm font-semibold text-landing-accent uppercase tracking-widest">
            FAQ
          </span>
          <h2 className="mt-3 font-display text-3xl sm:text-4xl font-bold text-landing-fg tracking-tight">
            Häufige{" "}
            <span className="text-landing-accent">Fragen</span>
          </h2>
          <p className="mt-4 text-lg text-landing-fg-muted max-w-xl mx-auto">
            Ehrliche Antworten auf die wichtigsten Fragen von HR-Verantwortlichen.
          </p>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: "-60px" }}
          transition={{ duration: 0.7 }}
        >
          <Accordion type="single" collapsible className="space-y-3">
            {faqs.map((faq, i) => (
              <AccordionItem
                key={i}
                value={`faq-${i}`}
                className="rounded-2xl border border-landing-border bg-white px-6 data-[state=open]:shadow-md data-[state=open]:shadow-landing-accent/5 transition-shadow"
              >
                <AccordionTrigger className="text-left text-base font-semibold text-landing-fg hover:no-underline py-5">
                  {faq.question}
                </AccordionTrigger>
                <AccordionContent className="text-sm text-landing-fg-muted leading-relaxed pb-5">
                  {faq.answer}
                </AccordionContent>
              </AccordionItem>
            ))}
          </Accordion>
        </motion.div>
      </div>
    </section>
  )
}
