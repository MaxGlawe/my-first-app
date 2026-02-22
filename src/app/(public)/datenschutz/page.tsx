import { Metadata } from "next"

export const metadata: Metadata = {
  title: "Datenschutzerklärung | Praxis OS",
}

export default function DatenschutzPage() {
  return (
    <div className="container mx-auto px-4 py-16 max-w-3xl">
      <h1 className="text-3xl font-bold mb-8">Datenschutzerklärung</h1>

      <div className="prose prose-slate max-w-none space-y-6 text-sm leading-relaxed">
        <section>
          <h2 className="text-xl font-semibold mb-3">1. Datenschutz auf einen Blick</h2>
          <p>
            Die folgenden Hinweise geben einen Überblick darüber, was mit Ihren personenbezogenen
            Daten passiert, wenn Sie diese Website und die zugehörige App nutzen.
          </p>
        </section>

        <section>
          <h2 className="text-xl font-semibold mb-3">2. Verantwortliche Stelle</h2>
          <p>
            Physiotherapie Glawe<br />
            Max Glawe<br />
            Heilpraktiker für Physiotherapie<br />
            <span className="text-slate-500">[Adresse bitte ergänzen]</span><br />
            <span className="text-slate-500">[E-Mail bitte ergänzen]</span>
          </p>
        </section>

        <section>
          <h2 className="text-xl font-semibold mb-3">3. Erhebung und Speicherung personenbezogener Daten</h2>
          <h3 className="text-lg font-medium mt-4 mb-2">a) Beim Besuch der Website</h3>
          <p>
            Bei der Nutzung unserer Website werden automatisch Informationen erfasst, die Ihr
            Browser an unseren Server übermittelt (Server-Log-Dateien). Diese umfassen u.a.
            Browsertyp, Betriebssystem, Referrer-URL, IP-Adresse und Uhrzeit.
          </p>

          <h3 className="text-lg font-medium mt-4 mb-2">b) Bei der Nutzung des Anfrage-Formulars</h3>
          <p>
            Wenn Sie unser Anfrage-Formular nutzen, erheben wir: Name, E-Mail-Adresse,
            Telefonnummer, Angaben zu Ihren Beschwerden, sowie Ihre Einwilligungen. Diese Daten
            werden ausschließlich zur Bearbeitung Ihrer Anfrage und zur Vorbereitung einer
            therapeutischen Behandlung verwendet.
          </p>
          <p className="font-medium mt-2">Rechtsgrundlage: Art. 6 Abs. 1 lit. b DSGVO (Vertragsanbahnung)</p>

          <h3 className="text-lg font-medium mt-4 mb-2">c) Bei der Nutzung der App</h3>
          <p>
            Im Rahmen der App-Nutzung werden Gesundheitsdaten verarbeitet (Schmerztagebuch,
            Trainingsdaten, Check-in-Daten). Diese besonderen Kategorien personenbezogener Daten
            werden auf Grundlage Ihrer ausdrücklichen Einwilligung verarbeitet (Art. 9 Abs. 2 lit. a DSGVO).
          </p>
        </section>

        <section>
          <h2 className="text-xl font-semibold mb-3">4. Datenverarbeitung durch Dritte</h2>

          <h3 className="text-lg font-medium mt-4 mb-2">Supabase (Datenbank & Authentifizierung)</h3>
          <p>
            Wir nutzen Supabase zur Speicherung von Daten und zur Nutzer-Authentifizierung.
            Die Daten werden auf Servern innerhalb der Europäischen Union verarbeitet.
          </p>

          <h3 className="text-lg font-medium mt-4 mb-2">Anthropic (KI-gestützte Inhalte)</h3>
          <p>
            Für die Erstellung von Wissens-Lektionen nutzen wir die KI von Anthropic.
            Dabei werden keine personenbezogenen Patientendaten an Anthropic übermittelt —
            lediglich der Name des Hauptproblems zur Inhaltsgenerierung.
          </p>
        </section>

        <section>
          <h2 className="text-xl font-semibold mb-3">5. Ihre Rechte</h2>
          <p>Sie haben jederzeit das Recht auf:</p>
          <ul className="list-disc list-inside space-y-1 mt-2">
            <li>Auskunft über Ihre gespeicherten Daten (Art. 15 DSGVO)</li>
            <li>Berichtigung unrichtiger Daten (Art. 16 DSGVO)</li>
            <li>Löschung Ihrer Daten (Art. 17 DSGVO)</li>
            <li>Einschränkung der Verarbeitung (Art. 18 DSGVO)</li>
            <li>Datenübertragbarkeit (Art. 20 DSGVO)</li>
            <li>Widerspruch gegen die Verarbeitung (Art. 21 DSGVO)</li>
          </ul>
          <p className="mt-2">
            Zur Ausübung Ihrer Rechte wenden Sie sich bitte an die oben genannte verantwortliche Stelle.
          </p>
        </section>

        <section>
          <h2 className="text-xl font-semibold mb-3">6. Aufbewahrungsdauer</h2>
          <p>
            Personenbezogene Daten werden gelöscht, sobald der Zweck der Speicherung entfällt.
            Therapeutische Dokumentation wird gemäß den gesetzlichen Aufbewahrungsfristen
            (bis zu 10 Jahre) aufbewahrt.
          </p>
        </section>

        <section className="text-slate-400 text-xs pt-4 border-t">
          <p>Stand: Februar 2026</p>
        </section>
      </div>
    </div>
  )
}
