import { Metadata } from "next"
import Link from "next/link"
import { createSupabaseServiceClient } from "@/lib/supabase-service"

export const metadata: Metadata = {
  title: "Datenschutzerklärung",
  description: "Datenschutzerklärung der Physiotherapie Glawe — Praxis OS. DSGVO-konforme Informationen zur Verarbeitung Ihrer personenbezogenen Daten.",
  alternates: { canonical: "https://wwwpraxis-os.com/datenschutz" },
}

async function getPraxisInfo() {
  const supabase = createSupabaseServiceClient()
  const { data } = await supabase
    .from("praxis_settings")
    .select("praxis_name, inhaber_name, strasse, plz, ort, email")
    .limit(1)
    .single()
  return data
}

export default async function DatenschutzPage() {
  const praxis = await getPraxisInfo()

  const name = praxis?.praxis_name ?? "Physiotherapie Glawe"
  const inhaber = praxis?.inhaber_name ?? "Max Glawe"
  const strasse = praxis?.strasse ?? null
  const plzOrt = praxis?.plz && praxis?.ort ? `${praxis.plz} ${praxis.ort}` : null
  const email = praxis?.email ?? "physiotherapieglawe@gmx.de"

  return (
    <div className="min-h-screen bg-[#faf9f7]">
      <div className="container mx-auto px-4 py-16 max-w-3xl">
        <Link
          href="/"
          className="text-sm text-emerald-600 hover:text-emerald-700 font-medium mb-8 inline-block"
        >
          &larr; Zurück zur Startseite
        </Link>

        <h1 className="text-3xl font-bold text-slate-900 mb-2">Datenschutzerklärung</h1>
        <p className="text-sm text-slate-400 mb-10">Informationen gemäß Art. 13 und 14 DSGVO</p>

        <div className="space-y-10 text-sm leading-relaxed text-slate-600">
          {/* 1. Überblick */}
          <section>
            <h2 className="text-lg font-semibold text-slate-800 mb-3">1. Datenschutz auf einen Blick</h2>
            <p>
              Der Schutz Ihrer personenbezogenen Daten ist uns ein besonderes Anliegen. Nachfolgend
              informieren wir Sie darüber, welche Daten wir erheben, wie wir sie verwenden und welche
              Rechte Ihnen zustehen, wenn Sie unsere Website <span className="font-medium">wwwpraxis-os.com</span> und
              die zugehörige Patienten-App „Praxis OS" nutzen.
            </p>
            <p className="mt-2">
              <span className="font-medium text-slate-700">Kurzfassung:</span> Ihre Daten werden ausschließlich auf
              Servern in der Europäischen Union gespeichert. Wir verkaufen keine Daten an Dritte. Gesundheitsdaten
              werden nur mit Ihrer ausdrücklichen Einwilligung verarbeitet.
            </p>
          </section>

          {/* 2. Verantwortliche Stelle */}
          <section>
            <h2 className="text-lg font-semibold text-slate-800 mb-3">2. Verantwortliche Stelle</h2>
            <p>
              Verantwortlich für die Datenverarbeitung auf dieser Website und in der App ist:
            </p>
            <div className="mt-3 p-4 bg-white rounded-xl border border-slate-200">
              <p className="font-medium text-slate-700">
                {name}<br />
                {inhaber}<br />
                Heilpraktiker für Physiotherapie
              </p>
              {strasse && <p className="mt-1">{strasse}</p>}
              {plzOrt && <p>{plzOrt}</p>}
              <p className="mt-1">E-Mail: <a href={`mailto:${email}`} className="text-emerald-600 hover:underline">{email}</a></p>
            </div>
            <p className="mt-3">
              Wenn Sie Fragen zum Datenschutz haben, wenden Sie sich bitte per E-Mail an die
              oben genannte Adresse.
            </p>
          </section>

          {/* 3. Erhebung und Speicherung */}
          <section>
            <h2 className="text-lg font-semibold text-slate-800 mb-3">3. Erhebung personenbezogener Daten</h2>

            <h3 className="text-base font-semibold text-slate-700 mt-5 mb-2">a) Beim Besuch der Website</h3>
            <p>
              Bei der rein informatorischen Nutzung der Website erheben wir nur die Daten, die Ihr Browser
              automatisch übermittelt (sog. Server-Log-Dateien):
            </p>
            <ul className="list-disc list-inside space-y-1 mt-2">
              <li>IP-Adresse (anonymisiert)</li>
              <li>Datum und Uhrzeit der Anfrage</li>
              <li>Browsertyp und -version</li>
              <li>Verwendetes Betriebssystem</li>
              <li>Referrer-URL (zuvor besuchte Seite)</li>
            </ul>
            <p className="mt-2">
              <span className="font-medium text-slate-700">Rechtsgrundlage:</span> Art. 6 Abs. 1 lit. f DSGVO
              (berechtigtes Interesse an der technischen Bereitstellung und Sicherheit der Website).
            </p>

            <h3 className="text-base font-semibold text-slate-700 mt-5 mb-2">b) Bei Nutzung des Anfrage-Formulars</h3>
            <p>Wenn Sie unser Anfrage-Formular ausfüllen, erheben wir:</p>
            <ul className="list-disc list-inside space-y-1 mt-2">
              <li>Vor- und Nachname</li>
              <li>E-Mail-Adresse</li>
              <li>Telefonnummer (optional)</li>
              <li>Beschreibung Ihrer Beschwerden</li>
              <li>Ihre Einwilligung zur Datenverarbeitung und Kontaktaufnahme</li>
            </ul>
            <p className="mt-2">
              <span className="font-medium text-slate-700">Rechtsgrundlage:</span> Art. 6 Abs. 1 lit. b DSGVO
              (vorvertragliche Maßnahmen) und Art. 9 Abs. 2 lit. a DSGVO (ausdrückliche Einwilligung für
              Gesundheitsdaten).
            </p>

            <h3 className="text-base font-semibold text-slate-700 mt-5 mb-2">c) Bei Registrierung und Nutzung der Patienten-App</h3>
            <p>Im Rahmen der therapeutischen Betreuung werden folgende Daten verarbeitet:</p>
            <ul className="list-disc list-inside space-y-1 mt-2">
              <li>Stammdaten (Name, E-Mail, Geburtsdatum)</li>
              <li>Therapeutische Dokumentation (Anamnese, Befund, Behandlungsverlauf)</li>
              <li>Trainingspläne und Übungsausführung</li>
              <li>Schmerztagebuch und tägliche Check-ins (Schmerz, Schlaf, Stress, Stimmung)</li>
              <li>Chat-Nachrichten zwischen Patient und Therapeut</li>
              <li>Fortschritts- und Compliance-Daten</li>
            </ul>
            <p className="mt-2">
              <span className="font-medium text-slate-700">Rechtsgrundlage:</span> Art. 6 Abs. 1 lit. b DSGVO
              (Vertragserfüllung), Art. 9 Abs. 2 lit. a DSGVO (ausdrückliche Einwilligung für Gesundheitsdaten)
              und Art. 9 Abs. 2 lit. h DSGVO (Gesundheitsversorgung).
            </p>

            <h3 className="text-base font-semibold text-slate-700 mt-5 mb-2">d) Bei Video-Konsultationen über Doctolib</h3>
            <p>
              Die Video-Konsultationen werden über die Plattform <span className="font-medium text-slate-700">Doctolib GmbH</span> (Mehringdamm 51, 10961 Berlin) durchgeführt. Im Rahmen der Terminbuchung und Videosprechstunde werden folgende Daten an Doctolib übermittelt:
            </p>
            <ul className="list-disc list-inside space-y-1 mt-2">
              <li>Vor- und Nachname</li>
              <li>E-Mail-Adresse</li>
              <li>Termindetails (Datum, Uhrzeit, Art der Konsultation)</li>
              <li>Videodaten während der Sprechstunde (Ende-zu-Ende-verschlüsselt)</li>
            </ul>
            <p className="mt-2">
              Die Videokonsultationen sind <span className="font-medium text-slate-700">Ende-zu-Ende verschlüsselt</span>.
              Doctolib hat keinen Zugriff auf die Inhalte der Gespräche. Doctolib speichert Daten auf Servern
              in der Europäischen Union und ist ISO 27001 und HDS (Hébergeur de Données de Santé) zertifiziert.
            </p>
            <p className="mt-2">
              <span className="font-medium text-slate-700">Rechtsgrundlage:</span> Art. 6 Abs. 1 lit. b DSGVO
              (Vertragserfüllung) und Art. 28 DSGVO (Auftragsverarbeitung).
            </p>
            <p className="mt-2">
              Datenschutzerklärung von Doctolib:{" "}
              <a href="https://www.doctolib.de/privacy-policy" target="_blank" rel="noopener noreferrer" className="text-emerald-600 hover:underline">
                www.doctolib.de/privacy-policy
              </a>
            </p>
          </section>

          {/* 4. Auftragsverarbeiter */}
          <section>
            <h2 className="text-lg font-semibold text-slate-800 mb-3">4. Auftragsverarbeiter und Drittanbieter</h2>
            <p>Wir setzen folgende Dienstleister zur Datenverarbeitung ein:</p>

            <div className="mt-4 space-y-4">
              <div className="p-4 bg-white rounded-xl border border-slate-200">
                <p className="font-medium text-slate-700">Supabase Inc.</p>
                <p className="text-xs text-slate-400 mb-2">Datenbank, Authentifizierung, Speicherung</p>
                <p>
                  Alle Daten werden auf Servern in der <span className="font-medium">Europäischen Union (AWS Frankfurt)</span> gespeichert.
                  Ein Auftragsverarbeitungsvertrag (AVV) gemäß Art. 28 DSGVO liegt vor. Supabase ist SOC2 Type II zertifiziert.
                </p>
              </div>

              <div className="p-4 bg-white rounded-xl border border-slate-200">
                <p className="font-medium text-slate-700">Doctolib GmbH</p>
                <p className="text-xs text-slate-400 mb-2">Videokonsultation, Terminbuchung</p>
                <p>
                  Daten werden auf Servern in der EU verarbeitet. Doctolib ist als Gesundheitsdaten-Hoster
                  (HDS) zertifiziert und erfüllt die Anforderungen der DSGVO. Ein AVV liegt vor.
                </p>
              </div>

              <div className="p-4 bg-white rounded-xl border border-slate-200">
                <p className="font-medium text-slate-700">Hetzner Online GmbH</p>
                <p className="text-xs text-slate-400 mb-2">Webhosting, Server-Infrastruktur</p>
                <p>
                  Unsere Webseite wird auf Servern von Hetzner in Deutschland gehostet. Ein AVV liegt vor.
                  Hetzner ist ISO 27001 zertifiziert.
                </p>
              </div>

              <div className="p-4 bg-white rounded-xl border border-slate-200">
                <p className="font-medium text-slate-700">Anthropic (Claude API)</p>
                <p className="text-xs text-slate-400 mb-2">KI-gestützte Wissens-Lektionen</p>
                <p>
                  Für die Generierung von Wissens-Lektionen zu Beschwerdebildern nutzen wir die KI von Anthropic.
                  Dabei werden <span className="font-medium">keine personenbezogenen Patientendaten</span> übermittelt —
                  lediglich der Name des Beschwerdebilds. Es findet keine Zuordnung zu einzelnen Patienten statt.
                  Die generierten Inhalte dienen ausschließlich der Patientenedukation.
                </p>
              </div>

              <div className="p-4 bg-white rounded-xl border border-slate-200">
                <p className="font-medium text-slate-700">GMX (1&1 Mail & Media GmbH)</p>
                <p className="text-xs text-slate-400 mb-2">E-Mail-Versand (transaktionale E-Mails)</p>
                <p>
                  Für den Versand von Registrierungs- und Benachrichtigungs-E-Mails nutzen wir GMX SMTP.
                  Server befinden sich in Deutschland.
                </p>
              </div>

              <div className="p-4 bg-white rounded-xl border border-slate-200">
                <p className="font-medium text-slate-700">Cloudflare Inc.</p>
                <p className="text-xs text-slate-400 mb-2">DNS, DDoS-Schutz</p>
                <p>
                  Cloudflare wird für DNS-Auflösung und DDoS-Schutz eingesetzt. In der aktuellen Konfiguration
                  (DNS-only-Modus) werden keine Inhalte über Cloudflare-Server geroutet. Ein AVV nach
                  EU-Standardvertragsklauseln liegt vor.
                </p>
              </div>
            </div>
          </section>

          {/* 5. Anonyme Website-Analyse */}
          <section>
            <h2 className="text-lg font-semibold text-slate-800 mb-3">5. Anonyme Website-Analyse</h2>
            <p>
              Zur Verbesserung unseres Angebots erfassen wir anonyme Nutzungsstatistiken auf unserer Website.
              Dabei werden <span className="font-medium text-slate-700">keine Cookies</span> verwendet und
              keine personenbezogenen Daten gespeichert.
            </p>
            <p className="mt-2">Folgende anonyme Daten werden erfasst:</p>
            <ul className="list-disc list-inside space-y-1 mt-2">
              <li>Aufgerufene Seiten (ohne IP-Adresse)</li>
              <li>Referrer-URL (woher der Besuch kam)</li>
              <li>UTM-Kampagnen-Parameter (z. B. aus Werbeanzeigen)</li>
              <li>Gerätetyp (Mobil/Tablet/Desktop) und Browser</li>
              <li>Verweildauer auf der Seite</li>
              <li>Anonyme Sitzungs-ID (per <span className="font-mono text-xs">sessionStorage</span>, wird beim
                Schließen des Browser-Tabs automatisch gelöscht)</li>
            </ul>
            <p className="mt-2">
              Die Daten werden <span className="font-medium text-slate-700">keiner identifizierbaren Person zugeordnet</span> und
              ausschließlich auf unserem eigenen Server in Deutschland (Hetzner) verarbeitet. Es erfolgt keine
              Weitergabe an Dritte und kein Einsatz von Drittanbieter-Analyse-Tools wie Google Analytics.
            </p>
            <p className="mt-2">
              <span className="font-medium text-slate-700">Rechtsgrundlage:</span> Art. 6 Abs. 1 lit. f DSGVO
              (berechtigtes Interesse an der bedarfsgerechten Gestaltung unserer Website).
            </p>
          </section>

          {/* 6. Cookies und lokale Speicherung */}
          <section>
            <h2 className="text-lg font-semibold text-slate-800 mb-3">6. Cookies und lokale Speicherung</h2>
            <p>
              Unsere Website verwendet <span className="font-medium text-slate-700">ausschließlich technisch notwendige Cookies</span>.
              Wir setzen keine Tracking-, Marketing- oder Analyse-Cookies ein.
            </p>
            <div className="mt-3 overflow-x-auto">
              <table className="w-full text-xs border border-slate-200 rounded-lg overflow-hidden">
                <thead>
                  <tr className="bg-slate-50">
                    <th className="text-left p-3 font-semibold text-slate-700">Cookie / Speicher</th>
                    <th className="text-left p-3 font-semibold text-slate-700">Zweck</th>
                    <th className="text-left p-3 font-semibold text-slate-700">Dauer</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  <tr>
                    <td className="p-3 font-mono text-xs">sb-*-auth-token</td>
                    <td className="p-3">Authentifizierung (Supabase Session)</td>
                    <td className="p-3">Session / 7 Tage</td>
                  </tr>
                  <tr>
                    <td className="p-3 font-mono text-xs">sessionStorage</td>
                    <td className="p-3">Anonyme Sitzungs-ID für Website-Analyse</td>
                    <td className="p-3">Bis Tab geschlossen wird</td>
                  </tr>
                  <tr>
                    <td className="p-3 font-mono text-xs">localStorage</td>
                    <td className="p-3">Onboarding-Status, App-Einstellungen</td>
                    <td className="p-3">Bis zur Löschung durch Nutzer</td>
                  </tr>
                  <tr>
                    <td className="p-3 font-mono text-xs">Service Worker</td>
                    <td className="p-3">Offline-Fähigkeit der PWA, Caching</td>
                    <td className="p-3">Bis zur Deinstallation</td>
                  </tr>
                </tbody>
              </table>
            </div>
            <p className="mt-3">
              <span className="font-medium text-slate-700">Rechtsgrundlage:</span> Art. 6 Abs. 1 lit. f DSGVO
              (berechtigtes Interesse). Da ausschließlich technisch notwendige Cookies eingesetzt werden,
              ist eine Einwilligung nach § 25 Abs. 2 TDDDG nicht erforderlich.
            </p>
          </section>

          {/* 7. Push-Benachrichtigungen */}
          <section>
            <h2 className="text-lg font-semibold text-slate-800 mb-3">7. Push-Benachrichtigungen</h2>
            <p>
              Mit Ihrer ausdrücklichen Einwilligung senden wir Push-Benachrichtigungen an Ihr Gerät
              (z. B. Trainingserinnerungen, Chat-Nachrichten). Sie können diese Einwilligung jederzeit
              in den Geräteeinstellungen oder in der App widerrufen.
            </p>
            <p className="mt-2">
              <span className="font-medium text-slate-700">Rechtsgrundlage:</span> Art. 6 Abs. 1 lit. a DSGVO (Einwilligung).
            </p>
          </section>

          {/* 8. SSL/TLS-Verschlüsselung */}
          <section>
            <h2 className="text-lg font-semibold text-slate-800 mb-3">8. SSL/TLS-Verschlüsselung</h2>
            <p>
              Diese Seite nutzt aus Sicherheitsgründen eine SSL/TLS-Verschlüsselung. Eine verschlüsselte
              Verbindung erkennen Sie daran, dass die Adresszeile des Browsers von „http://" auf „https://"
              wechselt und an dem Schloss-Symbol. Wenn die SSL/TLS-Verschlüsselung aktiviert ist, können
              die Daten, die Sie an uns übermitteln, nicht von Dritten mitgelesen werden.
            </p>
          </section>

          {/* 9. Aufbewahrung */}
          <section>
            <h2 className="text-lg font-semibold text-slate-800 mb-3">9. Speicherdauer und Löschung</h2>
            <p>Personenbezogene Daten werden nur so lange gespeichert, wie es für den jeweiligen Zweck erforderlich ist:</p>
            <div className="mt-3 overflow-x-auto">
              <table className="w-full text-xs border border-slate-200 rounded-lg overflow-hidden">
                <thead>
                  <tr className="bg-slate-50">
                    <th className="text-left p-3 font-semibold text-slate-700">Datenkategorie</th>
                    <th className="text-left p-3 font-semibold text-slate-700">Speicherdauer</th>
                    <th className="text-left p-3 font-semibold text-slate-700">Grundlage</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  <tr>
                    <td className="p-3">Anfrage-Formulardaten</td>
                    <td className="p-3">6 Monate nach Abschluss der Anfrage</td>
                    <td className="p-3">Art. 6 Abs. 1 lit. b DSGVO</td>
                  </tr>
                  <tr>
                    <td className="p-3">Therapeutische Dokumentation</td>
                    <td className="p-3">10 Jahre nach letzter Behandlung</td>
                    <td className="p-3">§ 630f Abs. 3 BGB</td>
                  </tr>
                  <tr>
                    <td className="p-3">Rechnungen / Vertragsdaten</td>
                    <td className="p-3">10 Jahre</td>
                    <td className="p-3">§ 147 AO, § 257 HGB</td>
                  </tr>
                  <tr>
                    <td className="p-3">Chat-Nachrichten</td>
                    <td className="p-3">Dauer der Behandlung + 10 Jahre</td>
                    <td className="p-3">§ 630f Abs. 3 BGB</td>
                  </tr>
                  <tr>
                    <td className="p-3">Schmerztagebuch / Check-ins</td>
                    <td className="p-3">Dauer der Behandlung + 10 Jahre</td>
                    <td className="p-3">§ 630f Abs. 3 BGB</td>
                  </tr>
                  <tr>
                    <td className="p-3">Server-Logdateien</td>
                    <td className="p-3">14 Tage</td>
                    <td className="p-3">Art. 6 Abs. 1 lit. f DSGVO</td>
                  </tr>
                </tbody>
              </table>
            </div>
          </section>

          {/* 10. Ihre Rechte */}
          <section>
            <h2 className="text-lg font-semibold text-slate-800 mb-3">10. Ihre Rechte als betroffene Person</h2>
            <p>Sie haben nach der DSGVO folgende Rechte:</p>
            <div className="mt-3 space-y-3">
              {[
                { right: "Auskunftsrecht (Art. 15 DSGVO)", desc: "Sie können Auskunft über Ihre bei uns gespeicherten personenbezogenen Daten verlangen." },
                { right: "Recht auf Berichtigung (Art. 16 DSGVO)", desc: "Sie können die Berichtigung unrichtiger oder die Vervollständigung unvollständiger Daten verlangen." },
                { right: "Recht auf Löschung (Art. 17 DSGVO)", desc: "Sie können die Löschung Ihrer Daten verlangen, sofern keine gesetzlichen Aufbewahrungspflichten entgegenstehen." },
                { right: "Recht auf Einschränkung (Art. 18 DSGVO)", desc: "Sie können die Einschränkung der Verarbeitung Ihrer Daten verlangen." },
                { right: "Recht auf Datenübertragbarkeit (Art. 20 DSGVO)", desc: "Sie können verlangen, dass wir Ihnen Ihre Daten in einem gängigen, maschinenlesbaren Format übermitteln." },
                { right: "Widerspruchsrecht (Art. 21 DSGVO)", desc: "Sie können der Verarbeitung Ihrer Daten jederzeit widersprechen, sofern diese auf berechtigtem Interesse basiert." },
                { right: "Recht auf Widerruf (Art. 7 Abs. 3 DSGVO)", desc: "Sie können eine erteilte Einwilligung jederzeit widerrufen. Die Rechtmäßigkeit der bis zum Widerruf erfolgten Verarbeitung bleibt unberührt." },
              ].map((item) => (
                <div key={item.right} className="p-3 bg-white rounded-xl border border-slate-200">
                  <p className="font-medium text-slate-700 text-xs">{item.right}</p>
                  <p className="mt-1">{item.desc}</p>
                </div>
              ))}
            </div>
            <p className="mt-4">
              Zur Ausübung Ihrer Rechte wenden Sie sich bitte an:{" "}
              <a href={`mailto:${email}`} className="text-emerald-600 hover:underline">{email}</a>
            </p>
          </section>

          {/* 11. Beschwerderecht */}
          <section>
            <h2 className="text-lg font-semibold text-slate-800 mb-3">11. Beschwerderecht bei einer Aufsichtsbehörde</h2>
            <p>
              Sie haben das Recht, sich bei einer Datenschutz-Aufsichtsbehörde über die Verarbeitung Ihrer
              personenbezogenen Daten zu beschweren. Die zuständige Aufsichtsbehörde richtet sich nach dem
              Bundesland des Praxissitzes. Eine Liste der Aufsichtsbehörden finden Sie unter:{" "}
              <a
                href="https://www.bfdi.bund.de/DE/Service/Anschriften/Laender/Laender-node.html"
                target="_blank"
                rel="noopener noreferrer"
                className="text-emerald-600 hover:underline"
              >
                bfdi.bund.de
              </a>
            </p>
          </section>

          {/* 12. Keine automatisierte Entscheidungsfindung */}
          <section>
            <h2 className="text-lg font-semibold text-slate-800 mb-3">12. Automatisierte Entscheidungsfindung</h2>
            <p>
              Es findet keine automatisierte Entscheidungsfindung oder Profiling im Sinne von Art. 22 DSGVO statt.
              Alle therapeutischen Entscheidungen werden ausschließlich durch qualifizierte Therapeuten getroffen.
              KI-generierte Inhalte (Wissens-Lektionen) dienen nur der allgemeinen Patientenedukation und
              haben keinen Einfluss auf individuelle Behandlungsentscheidungen.
            </p>
          </section>

          {/* 13. Änderungen */}
          <section>
            <h2 className="text-lg font-semibold text-slate-800 mb-3">13. Änderungen dieser Datenschutzerklärung</h2>
            <p>
              Wir behalten uns vor, diese Datenschutzerklärung anzupassen, um sie an geänderte Rechtslagen
              oder bei Änderungen unserer Dienstleistungen anzupassen. Die aktuelle Version finden Sie
              stets auf dieser Seite.
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
