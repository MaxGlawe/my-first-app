import { Metadata } from "next"

export const metadata: Metadata = {
  title: "AGB | Praxis OS",
}

export default function AgbPage() {
  return (
    <div className="container mx-auto px-4 py-16 max-w-3xl">
      <h1 className="text-3xl font-bold mb-8">Allgemeine Geschäftsbedingungen</h1>

      <div className="prose prose-slate max-w-none space-y-6 text-sm leading-relaxed">
        <section>
          <h2 className="text-xl font-semibold mb-3">1. Geltungsbereich</h2>
          <p>
            Diese Allgemeinen Geschäftsbedingungen gelten für die Nutzung der Online-Plattform
            „Praxis OS" und der damit verbundenen Tele-Therapie-Dienstleistungen der
            Physiotherapie Glawe, betrieben von Max Glawe, Heilpraktiker für Physiotherapie.
          </p>
        </section>

        <section>
          <h2 className="text-xl font-semibold mb-3">2. Leistungsbeschreibung</h2>
          <p>
            Praxis OS bietet eine Plattform für physiotherapeutische Betreuung, bestehend aus:
          </p>
          <ul className="list-disc list-inside space-y-1 mt-2">
            <li>Video-Konsultationen mit einem Therapeuten</li>
            <li>Individuell erstellte Trainingspläne</li>
            <li>Wissens-Lektionen zu Ihrem Krankheitsbild</li>
            <li>Tägliches Befindlichkeits-Tracking</li>
            <li>Chat-Kommunikation mit Ihrem Therapeuten</li>
          </ul>
        </section>

        <section>
          <h2 className="text-xl font-semibold mb-3">3. Vertragsschluss</h2>
          <p>
            Mit dem Absenden des Anfrage-Formulars geben Sie ein unverbindliches Angebot ab.
            Der Vertrag kommt erst mit der Bestätigung durch Physiotherapie Glawe und der
            Buchung eines ersten Video-Termins zustande.
          </p>
        </section>

        <section>
          <h2 className="text-xl font-semibold mb-3">4. Hinweis zur Behandlung</h2>
          <p>
            Die Behandlung erfolgt durch einen Heilpraktiker für Physiotherapie und ersetzt
            keine ärztliche Diagnose oder Behandlung. Bei akuten oder schwerwiegenden
            Beschwerden wird empfohlen, einen Arzt aufzusuchen.
          </p>
        </section>

        <section>
          <h2 className="text-xl font-semibold mb-3">5. Widerrufsrecht</h2>
          <p>
            Sie haben das Recht, binnen vierzehn Tagen ohne Angabe von Gründen diesen Vertrag
            zu widerrufen. Die Widerrufsfrist beträgt vierzehn Tage ab dem Tag des
            Vertragsschlusses.
          </p>
        </section>

        <section>
          <h2 className="text-xl font-semibold mb-3">6. Haftung</h2>
          <p>
            Die Nutzung der App und der bereitgestellten Trainingspläne erfolgt auf eigene
            Verantwortung. Physiotherapie Glawe haftet nicht für Schäden, die durch
            unsachgemäße Ausführung der Übungen entstehen.
          </p>
        </section>

        <section>
          <h2 className="text-xl font-semibold mb-3">7. Anwendbares Recht</h2>
          <p>
            Es gilt das Recht der Bundesrepublik Deutschland. Gerichtsstand ist der Sitz
            des Betreibers.
          </p>
        </section>

        <section className="text-slate-400 text-xs pt-4 border-t">
          <p>Stand: Februar 2026</p>
        </section>
      </div>
    </div>
  )
}
