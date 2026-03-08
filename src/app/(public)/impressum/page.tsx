import { Metadata } from "next"
import { createSupabaseServiceClient } from "@/lib/supabase-service"

export const metadata: Metadata = {
  title: "Impressum | Praxis OS",
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
  const adresse = praxis?.strasse && praxis?.plz && praxis?.ort
    ? `${praxis.strasse}, ${praxis.plz} ${praxis.ort}`
    : null
  const telefon = praxis?.telefon ?? null
  const email = praxis?.email ?? null
  const website = praxis?.website ?? null
  const zulassung = praxis?.zulassungsnummer ?? null

  return (
    <div className="container mx-auto px-4 py-16 max-w-3xl">
      <h1 className="text-3xl font-bold mb-8">Impressum</h1>

      <div className="prose prose-slate max-w-none space-y-6">
        <section>
          <h2 className="text-xl font-semibold mb-3">Angaben gemäß § 5 TMG</h2>
          <p>
            {name}<br />
            {inhaber}<br />
            Heilpraktiker für Physiotherapie
          </p>
          {adresse && <p>{adresse}</p>}
        </section>

        <section>
          <h2 className="text-xl font-semibold mb-3">Kontakt</h2>
          <p>
            {email && <>E-Mail: {email}<br /></>}
            {telefon && <>Telefon: {telefon}<br /></>}
            {website && <>Website: {website}</>}
          </p>
        </section>

        <section>
          <h2 className="text-xl font-semibold mb-3">Berufsbezeichnung und berufsrechtliche Regelungen</h2>
          <p>
            Berufsbezeichnung: Heilpraktiker für Physiotherapie<br />
            {zulassung && <>Erlaubnisurkunde-Nr.: {zulassung}<br /></>}
            Die Berufsbezeichnung wurde in der Bundesrepublik Deutschland verliehen.
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
