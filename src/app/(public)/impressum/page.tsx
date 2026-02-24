import { Metadata } from "next"

export const metadata: Metadata = {
  title: "Impressum | Praxis OS",
}

export default function ImpressumPage() {
  return (
    <div className="container mx-auto px-4 py-16 max-w-3xl">
      <h1 className="text-3xl font-bold mb-8">Impressum</h1>

      <div className="prose prose-slate max-w-none space-y-6">
        <section>
          <h2 className="text-xl font-semibold mb-3">Angaben gemäß § 5 TMG</h2>
          <p>
            Physiotherapie Glawe<br />
            Max Glawe<br />
            Heilpraktiker für Physiotherapie
          </p>
          <p className="text-sm text-slate-500 mt-2">
            [Adresse bitte ergänzen]
          </p>
        </section>

        <section>
          <h2 className="text-xl font-semibold mb-3">Kontakt</h2>
          <p>
            E-Mail: <span className="text-slate-500">[E-Mail bitte ergänzen]</span><br />
            Telefon: <span className="text-slate-500">[Telefon bitte ergänzen]</span>
          </p>
        </section>

        <section>
          <h2 className="text-xl font-semibold mb-3">Berufsbezeichnung und berufsrechtliche Regelungen</h2>
          <p>
            Berufsbezeichnung: Heilpraktiker für Physiotherapie<br />
            Zuständige Aufsichtsbehörde: <span className="text-slate-500">[Gesundheitsamt bitte ergänzen]</span><br />
            Erlaubnis erteilt durch: <span className="text-slate-500">[Behörde bitte ergänzen]</span>
          </p>
          <p className="text-sm text-slate-500 mt-2">
            Die Berufsbezeichnung „Heilpraktiker beschränkt auf das Gebiet der Physiotherapie"
            wurde in der Bundesrepublik Deutschland verliehen.
          </p>
        </section>

        <section>
          <h2 className="text-xl font-semibold mb-3">Streitschlichtung</h2>
          <p className="text-sm text-slate-600">
            Die Europäische Kommission stellt eine Plattform zur Online-Streitbeilegung (OS) bereit:
            https://ec.europa.eu/consumers/odr/. Wir sind nicht bereit oder verpflichtet, an
            Streitbeilegungsverfahren vor einer Verbraucherschlichtungsstelle teilzunehmen.
          </p>
        </section>
      </div>
    </div>
  )
}
