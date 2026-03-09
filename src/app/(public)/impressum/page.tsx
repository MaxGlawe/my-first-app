import { Metadata } from "next"
import Link from "next/link"
import { createSupabaseServiceClient } from "@/lib/supabase-service"

export const metadata: Metadata = {
  title: "Impressum",
  description: "Impressum der Physiotherapie Glawe — Praxis OS. Angaben gemäß § 5 DDG.",
  alternates: { canonical: "https://wwwpraxis-os.com/impressum" },
}

async function getPraxisInfo() {
  const supabase = createSupabaseServiceClient()
  const { data } = await supabase
    .from("praxis_settings")
    .select("praxis_name, inhaber_name, strasse, plz, ort, telefon, email, website, zulassungsnummer")
    .limit(1)
    .single()
  return data
}

export default async function ImpressumPage() {
  const praxis = await getPraxisInfo()

  const name = praxis?.praxis_name ?? "Physiotherapie Glawe"
  const inhaber = praxis?.inhaber_name ?? "Max Glawe"
  const strasse = praxis?.strasse ?? null
  const plzOrt = praxis?.plz && praxis?.ort ? `${praxis.plz} ${praxis.ort}` : null
  const telefon = praxis?.telefon ?? null
  const email = praxis?.email ?? "physiotherapieglawe@gmx.de"
  const website = praxis?.website ?? "https://wwwpraxis-os.com"
  const zulassung = praxis?.zulassungsnummer ?? null

  return (
    <div className="min-h-screen bg-[#faf9f7]">
      <div className="container mx-auto px-4 py-16 max-w-3xl">
        <Link
          href="/"
          className="text-sm text-emerald-600 hover:text-emerald-700 font-medium mb-8 inline-block"
        >
          &larr; Zurück zur Startseite
        </Link>

        <h1 className="text-3xl font-bold text-slate-900 mb-2">Impressum</h1>
        <p className="text-sm text-slate-400 mb-10">Angaben gemäß § 5 DDG (Digitale-Dienste-Gesetz)</p>

        <div className="space-y-10 text-sm leading-relaxed text-slate-600">
          {/* 1. Diensteanbieter */}
          <section>
            <h2 className="text-lg font-semibold text-slate-800 mb-3">1. Diensteanbieter</h2>
            <p className="font-medium text-slate-700">
              {name}<br />
              {inhaber}<br />
              Heilpraktiker für Physiotherapie (sektoraler Heilpraktiker)
            </p>
            {strasse && <p className="mt-2">{strasse}</p>}
            {plzOrt && <p>{plzOrt}</p>}
            <p className="mt-1">Deutschland</p>
          </section>

          {/* 2. Kontakt */}
          <section>
            <h2 className="text-lg font-semibold text-slate-800 mb-3">2. Kontakt</h2>
            <p>
              {email && <>E-Mail: <a href={`mailto:${email}`} className="text-emerald-600 hover:underline">{email}</a><br /></>}
              {telefon && <>Telefon: {telefon}<br /></>}
              Website: <a href={website} className="text-emerald-600 hover:underline">{website}</a>
            </p>
            <p className="mt-2 text-slate-500">
              Bitte bevorzugen Sie die Kontaktaufnahme per E-Mail. Telefonische Erreichbarkeit kann
              aufgrund laufender Behandlungen eingeschränkt sein.
            </p>
          </section>

          {/* 3. Berufsbezeichnung */}
          <section>
            <h2 className="text-lg font-semibold text-slate-800 mb-3">3. Berufsbezeichnung und berufsrechtliche Regelungen</h2>
            <p>
              <span className="font-medium text-slate-700">Berufsbezeichnung:</span> Heilpraktiker beschränkt auf das Gebiet der
              Physiotherapie (sektoraler Heilpraktiker)
            </p>
            {zulassung && (
              <p className="mt-1">
                <span className="font-medium text-slate-700">Erlaubnisurkunde-Nr.:</span> {zulassung}
              </p>
            )}
            <p className="mt-2">
              Die Berufsbezeichnung wurde in der Bundesrepublik Deutschland verliehen. Die Erlaubnis zur
              berufsmäßigen Ausübung der Heilkunde ohne ärztliche Bestallung, beschränkt auf das Gebiet der
              Physiotherapie, wurde gemäß § 1 Abs. 1 des Heilpraktikergesetzes (HeilprG) erteilt.
            </p>
            <div className="mt-3 p-4 bg-white rounded-xl border border-slate-200">
              <p className="font-medium text-slate-700 mb-1">Zuständige Aufsichtsbehörde:</p>
              <p>Gesundheitsamt des jeweiligen Landkreises bzw. der kreisfreien Stadt am Sitz des Praxisinhabers.</p>
              <p className="mt-2 font-medium text-slate-700 mb-1">Berufsrechtliche Regelungen:</p>
              <ul className="list-disc list-inside space-y-1 mt-1">
                <li>Heilpraktikergesetz (HeilprG)</li>
                <li>Erste Durchführungsverordnung zum Heilpraktikergesetz (1. DVO-HeilprG)</li>
                <li>Berufsordnung für Heilpraktiker</li>
              </ul>
              <p className="mt-2 text-xs text-slate-400">
                Einsehbar unter: <a href="https://www.gesetze-im-internet.de/heilprg/" target="_blank" rel="noopener noreferrer" className="text-emerald-600 hover:underline">gesetze-im-internet.de</a>
              </p>
            </div>
          </section>

          {/* 4. Plattform für Videokonsultationen */}
          <section>
            <h2 className="text-lg font-semibold text-slate-800 mb-3">4. Plattform für Videokonsultationen</h2>
            <p>
              Die Video-Konsultationen im Rahmen der Online-Physiotherapie werden über die Plattform
              <span className="font-medium text-slate-700"> Doctolib </span> durchgeführt.
            </p>
            <div className="mt-3 p-4 bg-white rounded-xl border border-slate-200">
              <p className="font-medium text-slate-700">Doctolib GmbH</p>
              <p>Mehringdamm 51, 10961 Berlin, Deutschland</p>
              <p className="mt-1">
                Website: <a href="https://www.doctolib.de" target="_blank" rel="noopener noreferrer" className="text-emerald-600 hover:underline">www.doctolib.de</a>
              </p>
              <p className="mt-2 text-xs text-slate-500">
                Doctolib ist ein nach EU-Recht zertifizierter Anbieter für Telemedizin-Dienste. Die
                Videokonsultationen sind Ende-zu-Ende verschlüsselt und DSGVO-konform. Weitere
                Informationen entnehmen Sie der Datenschutzerklärung von Doctolib.
              </p>
            </div>
          </section>

          {/* 5. Online-Plattform Praxis OS */}
          <section>
            <h2 className="text-lg font-semibold text-slate-800 mb-3">5. Online-Plattform Praxis OS</h2>
            <p>
              „Praxis OS" ist die begleitende Web-Applikation (Progressive Web App) der Physiotherapie Glawe
              zur Bereitstellung von Trainingsplänen, Wissens-Lektionen, Befindlichkeits-Tracking und
              Chat-Kommunikation zwischen Therapeut und Patient. Praxis OS ist kein eigenständiges Unternehmen,
              sondern ein Produkt der Physiotherapie Glawe.
            </p>
          </section>

          {/* 6. Umsatzsteuer */}
          <section>
            <h2 className="text-lg font-semibold text-slate-800 mb-3">6. Umsatzsteuer</h2>
            <p>
              Heilpraktiker-Leistungen sind gemäß § 4 Nr. 14 UStG von der Umsatzsteuer befreit.
              Die Rechnungsstellung erfolgt daher ohne Ausweis von Umsatzsteuer.
            </p>
          </section>

          {/* 7. Berufshaftpflicht */}
          <section>
            <h2 className="text-lg font-semibold text-slate-800 mb-3">7. Berufshaftpflichtversicherung</h2>
            <p>
              Es besteht eine Berufshaftpflichtversicherung für die ausgeübte Tätigkeit als
              Heilpraktiker für Physiotherapie.
            </p>
          </section>

          {/* 8. Haftungshinweis — Inhalte */}
          <section>
            <h2 className="text-lg font-semibold text-slate-800 mb-3">8. Haftung für Inhalte</h2>
            <p>
              Die Inhalte dieser Website wurden mit größter Sorgfalt erstellt. Für die Richtigkeit,
              Vollständigkeit und Aktualität der Inhalte übernehmen wir jedoch keine Gewähr. Als
              Diensteanbieter sind wir gemäß § 7 Abs. 1 DDG für eigene Inhalte auf diesen Seiten
              nach den allgemeinen Gesetzen verantwortlich. Nach §§ 8 bis 10 DDG sind wir jedoch nicht
              verpflichtet, übermittelte oder gespeicherte fremde Informationen zu überwachen oder nach
              Umständen zu forschen, die auf eine rechtswidrige Tätigkeit hinweisen.
            </p>
            <p className="mt-2">
              Verpflichtungen zur Entfernung oder Sperrung der Nutzung von Informationen nach den
              allgemeinen Gesetzen bleiben hiervon unberührt. Eine diesbezügliche Haftung ist jedoch erst
              ab dem Zeitpunkt der Kenntnis einer konkreten Rechtsverletzung möglich. Bei Bekanntwerden
              entsprechender Rechtsverletzungen werden wir diese Inhalte umgehend entfernen.
            </p>
          </section>

          {/* 9. Haftung — Links */}
          <section>
            <h2 className="text-lg font-semibold text-slate-800 mb-3">9. Haftung für Links</h2>
            <p>
              Unser Angebot enthält Links zu externen Websites Dritter, auf deren Inhalte wir keinen
              Einfluss haben. Deshalb können wir für diese fremden Inhalte auch keine Gewähr übernehmen.
              Für die Inhalte der verlinkten Seiten ist stets der jeweilige Anbieter oder Betreiber der
              Seiten verantwortlich. Die verlinkten Seiten wurden zum Zeitpunkt der Verlinkung auf
              mögliche Rechtsverstöße überprüft. Rechtswidrige Inhalte waren zum Zeitpunkt der Verlinkung
              nicht erkennbar. Eine permanente inhaltliche Kontrolle der verlinkten Seiten ist jedoch ohne
              konkrete Anhaltspunkte einer Rechtsverletzung nicht zumutbar. Bei Bekanntwerden von
              Rechtsverletzungen werden wir derartige Links umgehend entfernen.
            </p>
          </section>

          {/* 10. Urheberrecht */}
          <section>
            <h2 className="text-lg font-semibold text-slate-800 mb-3">10. Urheberrecht</h2>
            <p>
              Die durch den Betreiber dieser Seiten erstellten Inhalte und Werke unterliegen dem
              deutschen Urheberrecht. Die Vervielfältigung, Bearbeitung, Verbreitung und jede Art der
              Verwertung außerhalb der Grenzen des Urheberrechts bedürfen der schriftlichen Zustimmung
              des jeweiligen Autors bzw. Erstellers. Downloads und Kopien dieser Seite sind nur für den
              privaten, nicht kommerziellen Gebrauch gestattet.
            </p>
            <p className="mt-2">
              Dies gilt insbesondere für Trainingspläne, Übungsanleitungen, Wissens-Lektionen und
              alle weiteren therapeutischen Inhalte, die über Praxis OS bereitgestellt werden.
            </p>
          </section>

          {/* 11. Streitschlichtung */}
          <section>
            <h2 className="text-lg font-semibold text-slate-800 mb-3">11. Online-Streitbeilegung</h2>
            <p>
              Die Europäische Kommission stellt eine Plattform zur Online-Streitbeilegung (OS) bereit:{" "}
              <a
                href="https://ec.europa.eu/consumers/odr/"
                target="_blank"
                rel="noopener noreferrer"
                className="text-emerald-600 hover:underline"
              >
                ec.europa.eu/consumers/odr
              </a>
            </p>
            <p className="mt-2">
              Wir sind weder bereit noch verpflichtet, an einem Streitbeilegungsverfahren vor einer
              Verbraucherschlichtungsstelle teilzunehmen.
            </p>
          </section>

          {/* 12. Hinweis zu Gesundheitsinformationen */}
          <section>
            <h2 className="text-lg font-semibold text-slate-800 mb-3">12. Hinweis zu Gesundheitsinformationen</h2>
            <p>
              Die auf dieser Website bereitgestellten Informationen zu Beschwerdebildern und
              Behandlungsmethoden dienen ausschließlich der allgemeinen Information. Sie ersetzen
              keine ärztliche Beratung, Diagnose oder Behandlung. Bei akuten oder schwerwiegenden
              Beschwerden konsultieren Sie bitte einen Arzt. Die Inhalte werden nach bestem Wissen
              und auf Grundlage aktueller wissenschaftlicher Erkenntnisse erstellt, erheben jedoch
              keinen Anspruch auf Vollständigkeit.
            </p>
          </section>

          <div className="pt-6 border-t border-slate-200 text-xs text-slate-400">
            <p>Stand: März 2026</p>
          </div>
        </div>
      </div>
    </div>
  )
}
