import { Metadata } from "next"
import Link from "next/link"

export const metadata: Metadata = {
  title: "AGB",
  description: "Allgemeine Geschäftsbedingungen der Physiotherapie Glawe für Online-Physiotherapie und Heilpraktiker-Behandlungen per Video über Praxis OS.",
  alternates: { canonical: "https://wwwpraxis-os.com/agb" },
}

export default function AgbPage() {
  return (
    <div className="min-h-screen bg-[#faf9f7]">
      <div className="container mx-auto px-4 py-16 max-w-3xl">
        <Link
          href="/"
          className="text-sm text-emerald-600 hover:text-emerald-700 font-medium mb-8 inline-block"
        >
          &larr; Zurück zur Startseite
        </Link>

        <h1 className="text-3xl font-bold text-slate-900 mb-2">Allgemeine Geschäftsbedingungen</h1>
        <p className="text-sm text-slate-400 mb-10">Physiotherapie Glawe — Praxis OS</p>

        <div className="space-y-10 text-sm leading-relaxed text-slate-600">
          {/* § 1 */}
          <section>
            <h2 className="text-lg font-semibold text-slate-800 mb-3">§ 1 Geltungsbereich</h2>
            <p>
              (1) Diese Allgemeinen Geschäftsbedingungen (nachfolgend „AGB") gelten für alle Verträge
              zwischen der Physiotherapie Glawe, betrieben von Max Glawe, Heilpraktiker für Physiotherapie
              (nachfolgend „Anbieter"), und dem Patienten (nachfolgend „Patient") über die Nutzung der
              Online-Plattform „Praxis OS" sowie der damit verbundenen therapeutischen Dienstleistungen.
            </p>
            <p className="mt-2">
              (2) Die AGB gelten in der zum Zeitpunkt des Vertragsschlusses gültigen Fassung. Abweichende
              Bedingungen des Patienten werden nicht anerkannt, es sei denn, der Anbieter stimmt ihrer
              Geltung ausdrücklich schriftlich zu.
            </p>
            <p className="mt-2">
              (3) Die AGB gelten für alle Leistungen des Anbieters, einschließlich Video-Konsultationen,
              Trainingspläne, Wissens-Lektionen, Chat-Kommunikation und sonstige über Praxis OS
              bereitgestellte Dienste.
            </p>
          </section>

          {/* § 2 */}
          <section>
            <h2 className="text-lg font-semibold text-slate-800 mb-3">§ 2 Leistungsbeschreibung</h2>
            <p>(1) Der Anbieter erbringt folgende Leistungen:</p>
            <ul className="list-disc list-inside space-y-1 mt-2 ml-2">
              <li>Physiotherapeutische Ersteinschätzung und Befunderhebung per Video</li>
              <li>Individuelle Behandlung durch einen Heilpraktiker für Physiotherapie per Videokonsultation</li>
              <li>Erstellung individueller Trainingspläne mit Video-Anleitungen</li>
              <li>Bereitstellung von Wissens-Lektionen zum jeweiligen Beschwerdebild</li>
              <li>Tägliches Befindlichkeits-Tracking (Schmerztagebuch) über die App</li>
              <li>Chat-Kommunikation zwischen Therapeut und Patient</li>
              <li>Bei Buchung eines Reha-Programms: strukturierte Betreuung über den vereinbarten Zeitraum</li>
            </ul>
            <p className="mt-3">
              (2) Die <span className="font-medium text-slate-700">Video-Konsultationen</span> werden über die
              Plattform <span className="font-medium text-slate-700">Doctolib GmbH</span> durchgeführt. Der Patient
              erhält vor jedem Termin einen individuellen Zugangslink. Die Videogespräche sind Ende-zu-Ende
              verschlüsselt. Für die Nutzung von Doctolib gelten ergänzend die Nutzungsbedingungen und
              Datenschutzbestimmungen von Doctolib.
            </p>
            <p className="mt-2">
              (3) Die ergänzende Betreuung (Trainingspläne, Chat, Tracking, Wissens-Lektionen) erfolgt
              über die Web-Applikation „Praxis OS" (Progressive Web App), die über den Browser zugänglich ist.
            </p>
            <p className="mt-2">
              (4) Der Anbieter behandelt als Heilpraktiker für Physiotherapie. Die Behandlung umfasst
              die eigenständige Befunderhebung, Diagnosestellung und physiotherapeutische Behandlung.
              Die Leistungen <span className="font-medium text-slate-700">ersetzen keine ärztliche Untersuchung,
              Diagnose oder Behandlung</span>. Bei Verdacht auf schwerwiegende Erkrankungen wird der Anbieter
              den Patienten an einen Arzt verweisen.
            </p>
          </section>

          {/* § 3 */}
          <section>
            <h2 className="text-lg font-semibold text-slate-800 mb-3">§ 3 Vertragsschluss</h2>
            <p>
              (1) Die Darstellung der Leistungen auf der Website stellt kein rechtlich bindendes Angebot dar,
              sondern eine unverbindliche Aufforderung an den Patienten, eine Anfrage zu stellen.
            </p>
            <p className="mt-2">
              (2) Mit dem Absenden des Anfrage-Formulars gibt der Patient ein unverbindliches Angebot auf
              Abschluss eines Behandlungsvertrags ab.
            </p>
            <p className="mt-2">
              (3) Der Behandlungsvertrag kommt erst mit der ausdrücklichen Annahme durch den Anbieter zustande.
              Die Annahme erfolgt in der Regel durch die Bestätigung eines Termins für die Ersteinschätzung
              per E-Mail oder über Doctolib.
            </p>
            <p className="mt-2">
              (4) Bei Buchung eines Reha-Programms (z. B. Mini-Reha Post-OP, Chronik-Programm) wird ein
              separater Behandlungsvertrag geschlossen, der den Leistungsumfang, die Laufzeit und die
              Vergütung regelt.
            </p>
          </section>

          {/* § 4 */}
          <section>
            <h2 className="text-lg font-semibold text-slate-800 mb-3">§ 4 Preise und Zahlung</h2>
            <p>
              (1) Es gelten die zum Zeitpunkt des Vertragsschlusses auf der Website ausgewiesenen Preise.
              Alle Preise verstehen sich als Endpreise. Gemäß § 4 Nr. 14 UStG sind Heilpraktiker-Leistungen
              von der Umsatzsteuer befreit.
            </p>
            <p className="mt-2">
              (2) Die Vergütung für Einzelsitzungen ist unmittelbar nach der Behandlung fällig. Bei
              Reha-Programmen wird die Vergütung gemäß dem individuellen Behandlungsvertrag fällig
              (in der Regel vor Beginn des Programms oder in vereinbarten Raten).
            </p>
            <p className="mt-2">
              (3) Die Zahlung erfolgt per Überweisung auf das in der Rechnung angegebene Konto. Der
              Anbieter stellt eine ordnungsgemäße Rechnung aus, die vom Patienten zur Erstattung bei
              seiner Krankenversicherung eingereicht werden kann.
            </p>
            <p className="mt-2">
              (4) <span className="font-medium text-slate-700">Erstattung durch Versicherungen:</span> Der Anbieter
              weist darauf hin, dass die Erstattungsfähigkeit der Behandlungskosten vom jeweiligen
              Versicherungstarif des Patienten abhängt. Der Anbieter übernimmt keine Gewähr für die
              Erstattung durch die Krankenversicherung des Patienten. Es obliegt dem Patienten, die
              Erstattungsfähigkeit vorab mit seiner Versicherung zu klären.
            </p>
            <p className="mt-2">
              (5) Bei Zahlungsverzug ist der Anbieter berechtigt, Verzugszinsen in gesetzlicher Höhe
              (§ 288 BGB) zu berechnen. Die Geltendmachung weiterer Verzugsschäden bleibt vorbehalten.
            </p>
          </section>

          {/* § 5 */}
          <section>
            <h2 className="text-lg font-semibold text-slate-800 mb-3">§ 5 Termine und Absageregelung</h2>
            <p>
              (1) Termine für Video-Konsultationen werden über Doctolib oder per Absprache mit dem
              Anbieter vereinbart.
            </p>
            <p className="mt-2">
              (2) <span className="font-medium text-slate-700">Absagefrist:</span> Vereinbarte Termine können
              bis <span className="font-medium text-slate-700">24 Stunden vor dem geplanten Termin</span> kostenfrei
              abgesagt oder verschoben werden. Die Absage hat über Doctolib, per E-Mail oder per
              Chat-Nachricht in der App zu erfolgen.
            </p>
            <p className="mt-2">
              (3) Bei Absagen, die weniger als 24 Stunden vor dem Termin erfolgen, oder bei
              Nichterscheinen zum Termin, ist der Anbieter berechtigt, den{" "}
              <span className="font-medium text-slate-700">vollen Sitzungspreis</span> in Rechnung zu stellen.
              Dies gilt nicht, wenn der Patient die verspätete Absage nicht zu vertreten hat
              (z. B. akuter Notfall mit Nachweis).
            </p>
            <p className="mt-2">
              (4) Der Anbieter behält sich vor, Termine aus wichtigem Grund (z. B. Erkrankung des
              Therapeuten, technische Störungen) abzusagen. In diesem Fall wird zeitnah ein Ersatztermin
              angeboten. Ein Anspruch auf Schadensersatz besteht nicht.
            </p>
          </section>

          {/* § 6 */}
          <section>
            <h2 className="text-lg font-semibold text-slate-800 mb-3">§ 6 Mitwirkungspflichten des Patienten</h2>
            <p>(1) Der Patient ist verpflichtet:</p>
            <ul className="list-disc list-inside space-y-1 mt-2 ml-2">
              <li>Wahrheitsgemäße und vollständige Angaben zu seinem Gesundheitszustand zu machen</li>
              <li>Den Therapeuten über alle relevanten Vorerkrankungen, laufende Behandlungen und Medikamenteneinnahmen zu informieren</li>
              <li>Die vereinbarten Übungen und Trainingspläne nur im Rahmen der besprochenen Vorgaben durchzuführen</li>
              <li>Bei Verschlechterung der Beschwerden, neuen Symptomen oder Schmerzen während der Übungsausführung die Übungen sofort abzubrechen und den Therapeuten zu informieren</li>
              <li>Für die Video-Konsultation eine stabile Internetverbindung und ein geeignetes Endgerät mit Kamera bereitzustellen</li>
              <li>Pünktlich zu den vereinbarten Terminen zu erscheinen</li>
            </ul>
            <p className="mt-3">
              (2) Kommt der Patient seinen Mitwirkungspflichten nicht nach, kann dies den Behandlungserfolg
              beeinträchtigen. Der Anbieter übernimmt hierfür keine Verantwortung.
            </p>
            <p className="mt-2">
              (3) Der Patient ist dafür verantwortlich, dass sein Übungsumfeld sicher ist und die
              Durchführung der Übungen gefahrlos möglich ist.
            </p>
          </section>

          {/* § 7 */}
          <section>
            <h2 className="text-lg font-semibold text-slate-800 mb-3">§ 7 Therapeutische Hinweise und Haftungsbeschränkung</h2>
            <p>
              (1) <span className="font-medium text-slate-700">Keine Erfolgsgarantie:</span> Der Anbieter schuldet
              eine fachgerechte Behandlung, jedoch keinen bestimmten Behandlungserfolg. Der Heilungsverlauf
              ist von vielen individuellen Faktoren abhängig, die außerhalb des Einflussbereichs des
              Anbieters liegen (z. B. Compliance, Vorerkrankungen, Lebensumstände).
            </p>
            <p className="mt-2">
              (2) Die Nutzung der App, der Trainingspläne und der Übungsanleitungen erfolgt auf eigene
              Verantwortung des Patienten. Der Patient ist verpflichtet, die Übungen nur im besprochenen
              Rahmen durchzuführen und bei Schmerzen oder Verschlechterung sofort abzubrechen.
            </p>
            <p className="mt-2">
              (3) Der Anbieter haftet unbeschränkt für Schäden aus der Verletzung des Lebens, des Körpers
              oder der Gesundheit, die auf einer vorsätzlichen oder fahrlässigen Pflichtverletzung des
              Anbieters beruhen.
            </p>
            <p className="mt-2">
              (4) Für sonstige Schäden haftet der Anbieter nur bei Vorsatz und grober Fahrlässigkeit
              sowie bei der schuldhaften Verletzung wesentlicher Vertragspflichten (Kardinalpflichten).
              Bei der Verletzung wesentlicher Vertragspflichten ist die Haftung auf den vertragstypischen,
              vorhersehbaren Schaden begrenzt.
            </p>
            <p className="mt-2">
              (5) Die Haftung für mittelbare Schäden, Folgeschäden, entgangenen Gewinn und Schäden aus
              Ansprüchen Dritter ist — soweit gesetzlich zulässig — ausgeschlossen.
            </p>
            <p className="mt-2">
              (6) Der Anbieter haftet nicht für Störungen, Unterbrechungen oder Ausfälle der
              Plattform Praxis OS oder der Video-Plattform Doctolib, soweit diese nicht vom Anbieter
              zu vertreten sind. Dies umfasst insbesondere technische Störungen der Internetverbindung,
              der Server oder Drittanbieter-Dienste.
            </p>
          </section>

          {/* § 8 */}
          <section>
            <h2 className="text-lg font-semibold text-slate-800 mb-3">§ 8 Geistiges Eigentum</h2>
            <p>
              (1) Alle über Praxis OS bereitgestellten Inhalte — insbesondere Trainingspläne,
              Übungsanleitungen, Übungsvideos, Wissens-Lektionen, therapeutische Dokumentationen
              und Software — sind urheberrechtlich geschützt und stehen im Eigentum des Anbieters.
            </p>
            <p className="mt-2">
              (2) Der Patient erhält ein einfaches, nicht übertragbares, nicht unterlizenzierbares
              Nutzungsrecht an den bereitgestellten Inhalten ausschließlich für den persönlichen,
              therapeutischen Gebrauch.
            </p>
            <p className="mt-2">
              (3) Es ist dem Patienten untersagt, die Inhalte ganz oder teilweise zu vervielfältigen,
              zu verbreiten, öffentlich zugänglich zu machen, an Dritte weiterzugeben, zu verkaufen
              oder für kommerzielle Zwecke zu nutzen. Insbesondere ist das Teilen von Trainingsplänen,
              Übungsvideos und Wissens-Lektionen mit Dritten (auch in sozialen Medien) ohne
              ausdrückliche schriftliche Genehmigung des Anbieters nicht gestattet.
            </p>
            <p className="mt-2">
              (4) Bei Verstößen gegen diese Bestimmungen behält sich der Anbieter die Geltendmachung
              von Unterlassungs- und Schadensersatzansprüchen vor.
            </p>
          </section>

          {/* § 9 */}
          <section>
            <h2 className="text-lg font-semibold text-slate-800 mb-3">§ 9 Datenschutz</h2>
            <p>
              (1) Der Anbieter verarbeitet personenbezogene Daten des Patienten gemäß der
              Datenschutz-Grundverordnung (DSGVO) und dem Bundesdatenschutzgesetz (BDSG).
            </p>
            <p className="mt-2">
              (2) Ausführliche Informationen zur Datenverarbeitung finden Sie in unserer{" "}
              <Link href="/datenschutz" className="text-emerald-600 hover:underline font-medium">
                Datenschutzerklärung
              </Link>.
            </p>
            <p className="mt-2">
              (3) Im Rahmen der Video-Konsultationen werden Daten an die Doctolib GmbH übermittelt.
              Näheres hierzu regelt die Datenschutzerklärung von Doctolib sowie unsere eigene
              Datenschutzerklärung.
            </p>
            <p className="mt-2">
              (4) Der Patient willigt mit Vertragsschluss in die Verarbeitung seiner Gesundheitsdaten
              zum Zwecke der therapeutischen Behandlung ein (Art. 9 Abs. 2 lit. a DSGVO). Diese
              Einwilligung kann jederzeit mit Wirkung für die Zukunft widerrufen werden, was jedoch
              zur Folge haben kann, dass die Behandlung nicht fortgeführt werden kann.
            </p>
          </section>

          {/* § 10 */}
          <section>
            <h2 className="text-lg font-semibold text-slate-800 mb-3">§ 10 Widerrufsrecht</h2>
            <div className="p-5 bg-white rounded-xl border-2 border-slate-200">
              <p className="font-semibold text-slate-800 mb-3">Widerrufsbelehrung</p>
              <p>
                <span className="font-medium text-slate-700">Widerrufsrecht:</span> Sie haben das Recht, binnen
                vierzehn Tagen ohne Angabe von Gründen diesen Vertrag zu widerrufen. Die Widerrufsfrist beträgt
                vierzehn Tage ab dem Tag des Vertragsschlusses.
              </p>
              <p className="mt-2">
                Um Ihr Widerrufsrecht auszuüben, müssen Sie uns mittels einer eindeutigen Erklärung
                (z. B. per E-Mail an physiotherapieglawe@gmx.de) über Ihren Entschluss, diesen Vertrag
                zu widerrufen, informieren.
              </p>
              <p className="mt-2">
                <span className="font-medium text-slate-700">Folgen des Widerrufs:</span> Wenn Sie diesen Vertrag
                widerrufen, haben wir Ihnen alle Zahlungen, die wir von Ihnen erhalten haben, unverzüglich und
                spätestens binnen vierzehn Tagen ab dem Tag zurückzuzahlen, an dem die Mitteilung über Ihren
                Widerruf bei uns eingegangen ist.
              </p>
              <p className="mt-3 p-3 bg-slate-50 rounded-lg">
                <span className="font-medium text-slate-700">Vorzeitiges Erlöschen des Widerrufsrechts:</span>{" "}
                Das Widerrufsrecht erlischt vorzeitig, wenn der Anbieter die Dienstleistung vollständig erbracht
                hat und mit der Ausführung der Dienstleistung erst begonnen hat, nachdem der Patient seine
                ausdrückliche Zustimmung gegeben und gleichzeitig seine Kenntnis davon bestätigt hat, dass er
                sein Widerrufsrecht bei vollständiger Vertragserfüllung verliert (§ 356 Abs. 4 BGB).
              </p>
            </div>
          </section>

          {/* § 11 */}
          <section>
            <h2 className="text-lg font-semibold text-slate-800 mb-3">§ 11 Vertragsdauer und Kündigung</h2>
            <p>
              (1) <span className="font-medium text-slate-700">Einzelsitzungen:</span> Der Vertrag über eine
              Einzelsitzung endet mit Erbringung der vereinbarten Leistung.
            </p>
            <p className="mt-2">
              (2) <span className="font-medium text-slate-700">Reha-Programme:</span> Reha-Programme haben eine
              feste Laufzeit gemäß dem individuellen Behandlungsvertrag. Eine ordentliche Kündigung ist
              während der Laufzeit nicht möglich. Das Recht zur außerordentlichen Kündigung aus wichtigem
              Grund bleibt unberührt.
            </p>
            <p className="mt-2">
              (3) <span className="font-medium text-slate-700">App-Zugang:</span> Der Zugang zur Patienten-App
              besteht für die Dauer der aktiven Behandlung. Nach Beendigung der Behandlung bleibt der
              Zugang noch für 30 Tage bestehen, damit der Patient seine Daten exportieren kann. Danach
              wird der Account deaktiviert.
            </p>
            <p className="mt-2">
              (4) Der Anbieter ist berechtigt, den Vertrag aus wichtigem Grund fristlos zu kündigen.
              Ein wichtiger Grund liegt insbesondere vor, wenn:
            </p>
            <ul className="list-disc list-inside space-y-1 mt-2 ml-2">
              <li>Der Patient falsche Angaben zu seinem Gesundheitszustand macht</li>
              <li>Der Patient trotz Mahnung mit der Zahlung fälliger Beträge in Verzug ist</li>
              <li>Der Patient die Plattform missbräuchlich nutzt</li>
              <li>Der Patient urheberrechtlich geschützte Inhalte unbefugt weitergibt</li>
              <li>Das Vertrauensverhältnis zwischen Therapeut und Patient nachhaltig gestört ist</li>
            </ul>
            <p className="mt-2">
              (5) Bei außerordentlicher Kündigung durch den Anbieter aus den in Abs. 4 genannten Gründen
              besteht kein Anspruch auf Rückerstattung bereits erbrachter Leistungen.
            </p>
          </section>

          {/* § 12 */}
          <section>
            <h2 className="text-lg font-semibold text-slate-800 mb-3">§ 12 Verfügbarkeit der Plattform</h2>
            <p>
              (1) Der Anbieter bemüht sich um eine möglichst hohe Verfügbarkeit der Plattform Praxis OS.
              Eine Verfügbarkeit von 100 % kann technisch nicht gewährleistet werden. Insbesondere Wartung,
              Sicherheitsupdates oder Störungen bei Drittanbietern können zu vorübergehenden
              Einschränkungen führen.
            </p>
            <p className="mt-2">
              (2) Geplante Wartungsarbeiten werden nach Möglichkeit außerhalb der üblichen Nutzungszeiten
              durchgeführt und — soweit möglich — vorab angekündigt.
            </p>
            <p className="mt-2">
              (3) Ansprüche des Patienten wegen vorübergehender Nichtverfügbarkeit der Plattform sind
              ausgeschlossen, sofern der Anbieter die Störung nicht zu vertreten hat.
            </p>
          </section>

          {/* § 13 */}
          <section>
            <h2 className="text-lg font-semibold text-slate-800 mb-3">§ 13 Höhere Gewalt</h2>
            <p>
              Im Falle höherer Gewalt (z. B. Naturkatastrophen, Pandemien, behördliche Anordnungen,
              Stromausfälle, großflächige Internetausfälle) ist der Anbieter von der Leistungspflicht
              befreit, solange und soweit die Erbringung der Leistung durch den Umstand unmöglich oder
              unzumutbar ist. Bereits gezahlte Vergütung wird anteilig erstattet.
            </p>
          </section>

          {/* § 14 */}
          <section>
            <h2 className="text-lg font-semibold text-slate-800 mb-3">§ 14 Änderungen der AGB</h2>
            <p>
              (1) Der Anbieter behält sich vor, diese AGB mit Wirkung für die Zukunft zu ändern. Der
              Patient wird über Änderungen mindestens 14 Tage vor Inkrafttreten per E-Mail informiert.
            </p>
            <p className="mt-2">
              (2) Widerspricht der Patient den geänderten AGB nicht innerhalb von 14 Tagen nach Zugang
              der Änderungsmitteilung, gelten die geänderten AGB als akzeptiert. Der Anbieter wird den
              Patienten in der Änderungsmitteilung auf die Bedeutung des Schweigens hinweisen.
            </p>
            <p className="mt-2">
              (3) Widerspricht der Patient den Änderungen, steht beiden Parteien ein Sonderkündigungsrecht
              zum Zeitpunkt des Inkrafttretens der Änderungen zu.
            </p>
          </section>

          {/* § 15 */}
          <section>
            <h2 className="text-lg font-semibold text-slate-800 mb-3">§ 15 Schlussbestimmungen</h2>
            <p>
              (1) Es gilt das Recht der Bundesrepublik Deutschland unter Ausschluss des
              UN-Kaufrechts (CISG).
            </p>
            <p className="mt-2">
              (2) Ist der Patient Kaufmann, juristische Person des öffentlichen Rechts oder
              öffentlich-rechtliches Sondervermögen, ist ausschließlicher Gerichtsstand für alle
              Streitigkeiten aus diesem Vertrag der Sitz des Anbieters. Gegenüber Verbrauchern gelten
              die gesetzlichen Gerichtsstandregelungen.
            </p>
            <p className="mt-2">
              (3) Sollten einzelne Bestimmungen dieser AGB unwirksam sein oder werden, so bleibt die
              Wirksamkeit der übrigen Bestimmungen unberührt. An die Stelle der unwirksamen Bestimmung
              tritt die gesetzliche Regelung.
            </p>
            <p className="mt-2">
              (4) Die Vertragssprache ist Deutsch.
            </p>
            <p className="mt-2">
              (5) Mündliche Nebenabreden bestehen nicht. Änderungen und Ergänzungen dieser AGB bedürfen
              der Schriftform. Dies gilt auch für die Aufhebung dieser Schriftformklausel.
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
