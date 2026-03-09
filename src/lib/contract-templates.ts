import type { ContractType, Leistung, VertragText } from "@/types/contract"
import type { PraxisSettings } from "@/types/billing"

interface ContractContext {
  contractType: ContractType
  leistungen: Leistung[]
  gesamtpreis: number
  zahlungsweise: "einmalig" | "pro_sitzung"
  dauerWochen?: number | null
  sitzungenAnzahl?: number | null
  praxis: PraxisSettings
  patientName: string
  patientAddress?: string | null
  patientGeburtsdatum?: string | null
}

function fmtDate(dateStr: string | null | undefined): string {
  if (!dateStr) return "—"
  const d = new Date(dateStr + "T00:00:00")
  return d.toLocaleDateString("de-DE", { day: "2-digit", month: "2-digit", year: "numeric" })
}

function fmtCurrency(amount: number): string {
  return amount.toLocaleString("de-DE", { style: "currency", currency: "EUR" })
}

function getTypeLabel(type: ContractType): string {
  const labels: Record<ContractType, string> = {
    einzelsitzung: "Einzelsitzung (Video-Behandlung)",
    mini_reha_post_op: "Mini-Reha Post-OP Programm",
    chronik_programm: "Chronik-Programm",
  }
  return labels[type]
}

export function generateVertragText(ctx: ContractContext): VertragText {
  const { praxis } = ctx
  const praxisFullAddress = `${praxis.strasse}, ${praxis.plz} ${praxis.ort}`
  const praxisEmail = praxis.email || "info@physiotherapie-glawe.de"
  const praxisTelefon = praxis.telefon || ""

  const leistungenText = ctx.leistungen
    .filter((l) => l.preis > 0)
    .map((l) => `- ${l.beschreibung}: ${fmtCurrency(l.preis)}`)
    .join("\n")

  const inklusivleistungen = ctx.leistungen
    .filter((l) => l.preis === 0)
    .map((l) => `- ${l.beschreibung}`)
    .join("\n")

  const dauerText = ctx.dauerWochen
    ? `Die Behandlung erstreckt sich über einen voraussichtlichen Zeitraum von ca. ${ctx.dauerWochen} Wochen. Der tatsächliche Behandlungszeitraum kann je nach individuellem Therapieverlauf und medizinischer Notwendigkeit abweichen.`
    : ""

  const sitzungenText = ctx.sitzungenAnzahl
    ? `Der Vertrag umfasst ${ctx.sitzungenAnzahl} Video-Sitzungen à ca. 45 Minuten.`
    : ""

  const einzelpreisText = ctx.zahlungsweise === "pro_sitzung"
    ? `Der Preis je Sitzung beträgt ${fmtCurrency(ctx.gesamtpreis)}.`
    : `Der Gesamtpreis für das vereinbarte Leistungspaket beträgt ${fmtCurrency(ctx.gesamtpreis)}.`

  return {
    // ──────────────────────────────────────────────
    // VERTRAGSPARTEIEN
    // ──────────────────────────────────────────────
    vertragsparteien: [
      `Zwischen`,
      ``,
      `${praxis.praxis_name}`,
      `${praxis.inhaber_name}`,
      `${praxisFullAddress}`,
      praxis.zulassungsnummer ? `Zulassungsnummer: ${praxis.zulassungsnummer}` : "",
      praxisTelefon ? `Tel.: ${praxisTelefon}` : "",
      `E-Mail: ${praxisEmail}`,
      `(nachfolgend „Behandler" oder „Praxis" genannt)`,
      ``,
      `und`,
      ``,
      `${ctx.patientName}`,
      ctx.patientAddress || "",
      ctx.patientGeburtsdatum ? `geb. am ${fmtDate(ctx.patientGeburtsdatum)}` : "",
      `(nachfolgend „Patient" genannt)`,
      ``,
      `— gemeinsam „Vertragsparteien" —`,
      ``,
      `wird folgender Behandlungsvertrag geschlossen:`,
    ].filter(Boolean).join("\n"),

    // ──────────────────────────────────────────────
    // PRÄAMBEL
    // ──────────────────────────────────────────────
    praeambel: [
      `Präambel`,
      ``,
      `Der Behandler betreibt eine Praxis für Physiotherapie und ist als Heilpraktiker für Physiotherapie gemäß § 1 Heilpraktikergesetz (HeilprG) zugelassen. Im Rahmen dieser Zulassung ist der Behandler berechtigt, eigenständig Befunde zu erheben, Diagnosen zu stellen und Therapien durchzuführen — ohne ärztliche Verordnung.`,
      ``,
      `Der Patient wünscht eine physiotherapeutische Behandlung durch den Behandler. Die Behandlung erfolgt auf Grundlage dieses Vertrages als Privatbehandlung. Die Vertragsparteien vereinbaren die nachfolgend aufgeführten Leistungen, Pflichten und Bedingungen.`,
      ``,
      `Der Patient wurde darüber informiert, dass die Kosten dieser Behandlung nicht von der gesetzlichen Krankenversicherung (GKV) übernommen werden. Eine Erstattung durch private Krankenversicherungen (PKV) oder Zusatzversicherungen ist je nach individuellem Versicherungstarif möglich. Die Klärung der Erstattungsfähigkeit obliegt dem Patienten.`,
    ].join("\n"),

    // ──────────────────────────────────────────────
    // §1 LEISTUNGSBESCHREIBUNG
    // ──────────────────────────────────────────────
    leistungsbeschreibung: [
      `§1 Vertragsgegenstand und Leistungsbeschreibung`,
      ``,
      `(1) Gegenstand dieses Vertrages ist die Erbringung physiotherapeutischer Leistungen durch den Behandler an den Patienten. Die Behandlung erfolgt als ${getTypeLabel(ctx.contractType)}.`,
      ``,
      `(2) Der Behandler erbringt folgende kostenpflichtige Leistungen:`,
      ``,
      leistungenText,
      ``,
      inklusivleistungen ? `(3) Im Vertragspreis sind folgende Zusatzleistungen ohne gesonderte Berechnung enthalten:\n\n${inklusivleistungen}` : "",
      ``,
      dauerText ? `(${inklusivleistungen ? "4" : "3"}) ${dauerText}` : "",
      sitzungenText ? `(${inklusivleistungen ? "5" : "4"}) ${sitzungenText} Die einzelnen Sitzungen werden individuell terminiert. Nicht wahrgenommene Sitzungen verfallen gemäß den Regelungen in §6 dieses Vertrages.` : "",
      ``,
      `(${inklusivleistungen ? "6" : "5"}) Die Behandlung erfolgt per Video-Sitzung (Telerehabilitation) über eine gesicherte, DSGVO-konforme Videoverbindung. Zwischen den Sitzungen erhält der Patient einen individuellen, digitalen Trainingsplan über die Praxis-App (siehe §2) sowie persönlichen Chat-Support durch den Behandler.`,
      ``,
      `(${inklusivleistungen ? "7" : "6"}) Der Behandler legt Art und Umfang der Behandlung nach pflichtgemäßem Ermessen unter Berücksichtigung des aktuellen Standes der physiotherapeutischen Wissenschaft fest. Der Behandler behält sich vor, den Therapieplan bei medizinischer Notwendigkeit anzupassen, worüber der Patient informiert wird.`,
      ``,
      `(${inklusivleistungen ? "8" : "7"}) Sollte der Behandler feststellen, dass die Behandlung des Patienten den Rahmen der heilpraktischen Erlaubnis für Physiotherapie überschreitet (z. B. bei Verdacht auf schwerwiegende, nicht-muskuloskelettale Erkrankungen), wird der Behandler den Patienten darüber informieren und an einen Arzt oder Facharzt verweisen. Dies stellt keine Vertragsverletzung dar.`,
    ].filter((l) => l !== undefined && l !== "").join("\n"),

    // ──────────────────────────────────────────────
    // §2 DIGITALE PRAXIS-APP
    // ──────────────────────────────────────────────
    app_nutzung: [
      `§2 Digitale Praxis-App (im Vertragspreis enthalten)`,
      ``,
      `(1) Der Patient erhält für die Dauer der Behandlung kostenfreien Zugang zur digitalen Praxis-App des Behandlers („Praxis OS Patienten-App"). Die Nutzung der App ist im Vertragspreis gemäß §5 vollständig enthalten und wird nicht gesondert berechnet.`,
      ``,
      `(2) Die Praxis-App umfasst folgende Funktionen:`,
      `- Anzeige des individuellen Trainingsplans mit Video-Anleitungen und Übungsbeschreibungen`,
      `- Durchführung geführter Trainingseinheiten mit Timer, Satz- und Wiederholungszähler`,
      `- Persönlicher Chat-Kanal zum Behandler für Rückfragen zur Therapie`,
      `- Schmerztagebuch zur Dokumentation des Behandlungsverlaufs`,
      `- Einsicht in Hausaufgaben und Übungsfortschritt`,
      `- Teilnahme an therapeutischen Kursen (sofern im Leistungsumfang enthalten)`,
      `- Push-Benachrichtigungen zu Terminen, neuen Trainingsplänen und Nachrichten`,
      ``,
      `(3) Der Zugang zur Praxis-App wird nach Unterzeichnung dieses Vertrages eingerichtet. Die Zugangsdaten werden dem Patienten per E-Mail zugesandt. Der Patient ist verpflichtet, seine Zugangsdaten vertraulich zu behandeln und nicht an Dritte weiterzugeben.`,
      ``,
      `(4) Der Behandler stellt die technische Verfügbarkeit der Praxis-App nach bestem Bemühen sicher, übernimmt jedoch keine Garantie für eine ununterbrochene Verfügbarkeit. Kurzfristige technische Störungen oder Wartungsarbeiten begründen keinen Anspruch auf Minderung oder Schadensersatz.`,
      ``,
      `(5) Die in der App bereitgestellten Trainingspläne und Übungsanleitungen sind individuell auf den Patienten zugeschnitten und dienen ausschließlich der therapeutischen Nachsorge. Sie ersetzen nicht die professionelle Behandlung durch den Behandler und dürfen nicht eigenmächtig verändert oder an Dritte weitergegeben werden (siehe §13 Urheberrecht).`,
      ``,
      `(6) Nach Beendigung des Vertragsverhältnisses (durch Ablauf, Kündigung oder Widerruf) bleibt der App-Zugang für einen Übergangszeitraum von 30 Tagen bestehen, damit der Patient seine Daten sichern kann. Danach wird der Zugang deaktiviert.`,
    ].join("\n"),

    // ──────────────────────────────────────────────
    // §3 RECHTSGRUNDLAGE
    // ──────────────────────────────────────────────
    rechtsgrundlage: [
      `§3 Rechtsgrundlage der Behandlung`,
      ``,
      `(1) Der Behandler ist als Heilpraktiker, beschränkt auf das Gebiet der Physiotherapie, gemäß § 1 Abs. 1 Heilpraktikergesetz (HeilprG) in Verbindung mit der Ersten Durchführungsverordnung zum HeilprG zugelassen. Die Erlaubnis zur eigenständigen Ausübung der Heilkunde umfasst insbesondere:`,
      `- Eigenständige Befunderhebung und Diagnosestellung im Bereich des Bewegungsapparates`,
      `- Erstellung individueller Therapiepläne ohne ärztliche Verordnung`,
      `- Durchführung physiotherapeutischer Behandlungstechniken`,
      `- Beratung zu Prävention, Gesundheitsförderung und Eigenübungsprogrammen`,
      ``,
      `(2) Die Behandlung erfolgt auf Grundlage des Gebührenverzeichnisses für Heilpraktiker (GebüH) sowie — soweit anwendbar — der Anlage zum Vertrag über die Versorgung mit Heilpraktiker-Leistungen. Die Rechnungsstellung erfolgt gemäß den geltenden berufsrechtlichen Vorschriften.`,
      ``,
      `(3) Der Behandler weist ausdrücklich darauf hin, dass die heilpraktische Tätigkeit im Bereich der Physiotherapie kein Ersatz für eine ärztliche Diagnose und Behandlung ist, sofern eine solche medizinisch indiziert ist. Bei Verdacht auf Erkrankungen, die über das Behandlungsspektrum der Physiotherapie hinausgehen, ist der Patient verpflichtet, einen Arzt zu konsultieren.`,
      ``,
      `(4) Die Behandlung begründet kein Arbeitsverhältnis und kein Dauerschuldverhältnis über die vereinbarte Vertragslaufzeit hinaus. Der Behandler erbringt seine Leistungen als freiberuflich tätiger Heilpraktiker.`,
    ].join("\n"),

    // ──────────────────────────────────────────────
    // §4 FERNBEHANDLUNG / TELEREHABILITATION
    // ──────────────────────────────────────────────
    fernbehandlung: [
      `§4 Fernbehandlung und Telerehabilitation`,
      ``,
      `(1) Die Vertragsparteien vereinbaren, dass die Behandlung ganz oder teilweise als Fernbehandlung mittels Videokonferenz (Telerehabilitation) durchgeführt wird. Der Patient wurde über die Besonderheiten der Fernbehandlung aufgeklärt und stimmt dieser Behandlungsform ausdrücklich zu.`,
      ``,
      `(2) Der Patient erklärt sich damit einverstanden, dass der Behandler im Rahmen der Fernbehandlung Befunde erhebt, Diagnosen stellt und Therapieempfehlungen ausspricht, soweit dies fachlich vertretbar ist. Der Patient ist sich bewusst, dass die Fernbehandlung gegenüber einer Präsenzbehandlung Einschränkungen aufweisen kann, insbesondere:`,
      `- Eingeschränkte Möglichkeiten der manuellen Befunderhebung und Palpation`,
      `- Eingeschränkte Beurteilung von Bewegungsqualität und Gewebebeschaffenheit`,
      `- Abhängigkeit von einer stabilen Internetverbindung und funktionsfähiger Technik`,
      ``,
      `(3) Der Behandler behält sich vor, den Patienten bei medizinischer Notwendigkeit an eine Präsenzbehandlung zu verweisen. In diesem Fall wird der Behandler den Patienten darüber informieren und — sofern gewünscht — bei der Suche nach einem geeigneten Therapeuten vor Ort unterstützen. Die Verweisung stellt keine Vertragsverletzung dar.`,
      ``,
      `(4) Technische Voraussetzungen auf Seiten des Patienten: Der Patient stellt sicher, dass er über ein internetfähiges Endgerät mit Kamera und Mikrofon sowie eine stabile Internetverbindung (empfohlen: mind. 5 Mbit/s) verfügt. Technische Störungen, die in der Sphäre des Patienten liegen, begründen keinen Anspruch auf Nachholung oder Preisminderung.`,
      ``,
      `(5) Der Patient sorgt für eine geeignete Umgebung während der Video-Sitzung: ausreichend Platz für Übungen, rutschfester Untergrund und ggf. benötigte Hilfsmittel (z. B. Matte, Theraband). Der Behandler ist nicht verantwortlich für Verletzungen, die durch ungeeignete Übungsumgebungen entstehen.`,
      ``,
      `(6) Die Fernbehandlung ersetzt nicht die Notfallversorgung. Bei akuten medizinischen Notfällen (z. B. Herzinfarkt, Schlaganfall, akute Atemnot, schwere Verletzungen) ist unverzüglich der Rettungsdienst (112) oder ein Notarzt zu verständigen. Die Video-Sitzung ist in einem solchen Fall sofort zu beenden.`,
    ].join("\n"),

    // ──────────────────────────────────────────────
    // §5 VERGÜTUNG
    // ──────────────────────────────────────────────
    verguetung: [
      `§5 Vergütung und Zahlungsbedingungen`,
      ``,
      `(1) ${einzelpreisText} In diesem Preis sind alle in §1 und §2 genannten Leistungen enthalten, einschließlich der Nutzung der digitalen Praxis-App.`,
      ``,
      ctx.zahlungsweise === "einmalig"
        ? `(2) Der Gesamtbetrag ist innerhalb von 7 Tagen nach Vertragsunterzeichnung auf das folgende Konto zu überweisen:\n\n${praxis.iban ? `IBAN: ${praxis.iban}` : "Bankverbindung wird nach Vertragsschluss mitgeteilt."}\n${praxis.bic ? `BIC: ${praxis.bic}` : ""}\nKontoinhaber: ${praxis.inhaber_name}\nVerwendungszweck: Vertragsnummer (wird nach Vertragsschluss mitgeteilt)\n\nAlternativ kann die Zahlung per Überweisung nach Rechnungserhalt erfolgen. Das Zahlungsziel beträgt 14 Tage ab Rechnungsdatum.`
        : `(2) Die Vergütung in Höhe von ${fmtCurrency(ctx.gesamtpreis)} je Sitzung ist jeweils innerhalb von 14 Tagen nach der jeweiligen Sitzung fällig. Der Behandler stellt dem Patienten nach jeder Sitzung eine entsprechende Rechnung.`,
      ``,
      `(3) Der Behandler stellt dem Patienten ordnungsgemäße Rechnungen nach dem Gebührenverzeichnis für Heilpraktiker (GebüH) aus. Die Rechnungen enthalten alle für die PKV-Erstattung erforderlichen Angaben (Ziffern nach GebüH, Diagnose, Behandlungsdatum, Therapeutenangaben).`,
      ``,
      `(4) Hinweis zur Umsatzsteuer: Heilkundliche Leistungen des Behandlers als Heilpraktiker sind gemäß § 4 Nr. 14 Buchstabe a) Umsatzsteuergesetz (UStG) von der Umsatzsteuer befreit. Die Rechnungen werden ohne Umsatzsteuer ausgestellt.`,
      ``,
      `(5) Hinweis zur Erstattungsfähigkeit: Die Erstattungsfähigkeit der Behandlungskosten durch private Krankenversicherungen, Beihilfestellen oder Heilpraktiker-Zusatzversicherungen hängt ausschließlich vom individuellen Versicherungstarif des Patienten ab. Der Behandler gibt keine Zusicherung hinsichtlich der Erstattung ab. Dem Patienten wird empfohlen, die Kostenübernahme vor Behandlungsbeginn mit seiner Versicherung zu klären. Eine fehlende oder teilweise Erstattung durch die Versicherung berührt die Zahlungspflicht des Patienten gegenüber dem Behandler nicht.`,
      ``,
      `(6) Bei Zahlungsverzug ist der Behandler berechtigt, Verzugszinsen in gesetzlicher Höhe (§ 288 Abs. 1 BGB, derzeit 5 Prozentpunkte über dem Basiszinssatz) sowie eine Mahnpauschale von 5,00 EUR je Mahnung zu erheben. Die Geltendmachung eines weitergehenden Verzugsschadens bleibt vorbehalten.`,
      ``,
      `(7) Bei einem Zahlungsrückstand von mehr als 30 Tagen ist der Behandler berechtigt, die weitere Behandlung bis zum vollständigen Zahlungsausgleich auszusetzen. In medizinisch dringenden Fällen wird der Behandler den Patienten an einen anderen Behandler verweisen.`,
    ].join("\n"),

    // ──────────────────────────────────────────────
    // §6 TERMINREGELUNG
    // ──────────────────────────────────────────────
    terminregelung: [
      `§6 Terminvereinbarung und Absageregelung`,
      ``,
      `(1) Die Termine für die Video-Sitzungen werden individuell zwischen dem Behandler und dem Patienten vereinbart. Terminvorschläge erfolgen über die Praxis-App, per E-Mail oder telefonisch.`,
      ``,
      `(2) Absagen und Verschiebungen: Der Patient kann vereinbarte Termine bis spätestens 24 Stunden vor dem geplanten Termin kostenfrei absagen oder verschieben. Die Absage muss schriftlich (E-Mail, Chat in der Praxis-App) oder telefonisch erfolgen.`,
      ``,
      `(3) Bei Absagen, die weniger als 24 Stunden vor dem Termin eingehen, oder bei Nichterscheinen (No-Show) ohne vorherige Absage ist der Behandler berechtigt, eine Ausfallgebühr in Höhe von 100 % des vereinbarten Sitzungshonorars zu berechnen. Dies gilt nicht, wenn der Patient die verspätete Absage nicht zu vertreten hat (z. B. nachgewiesener medizinischer Notfall, Krankenhausaufenthalt).`,
      ``,
      `(4) Der Behandler ist seinerseits berechtigt, Termine aus wichtigem Grund (z. B. eigene Erkrankung, technische Ausfälle, höhere Gewalt) abzusagen. In diesem Fall wird der Termin zeitnah nachgeholt, ohne dass dem Patienten dadurch Kosten entstehen.`,
      ``,
      `(5) Verspätungen: Erscheint der Patient mehr als 10 Minuten nach dem vereinbarten Sitzungsbeginn, kann der Behandler die Sitzung um die entsprechende Zeit verkürzen. Ein Anspruch auf vollständige Nachholung der versäumten Zeit besteht nicht. Bei einer Verspätung von mehr als 20 Minuten gilt der Termin als nicht wahrgenommen (No-Show), sofern keine rechtzeitige Benachrichtigung erfolgt ist.`,
      ``,
      `(6) Im Falle von Paketverträgen (Einmalzahlung): Nicht wahrgenommene Sitzungen, die gemäß Abs. 3 als Ausfalltermine gelten, verfallen und werden nicht nachgeholt oder erstattet. Bei Absage gemäß Abs. 2 wird ein Ersatztermin angeboten.`,
    ].join("\n"),

    // ──────────────────────────────────────────────
    // §7 MITWIRKUNGSPFLICHTEN
    // ──────────────────────────────────────────────
    mitwirkungspflichten: [
      `§7 Mitwirkungspflichten des Patienten`,
      ``,
      `(1) Der Therapieerfolg hängt maßgeblich von der aktiven Mitwirkung des Patienten ab. Der Patient verpflichtet sich daher:`,
      ``,
      `a) Vollständige und wahrheitsgemäße Angaben zu seinem Gesundheitszustand, seiner Krankengeschichte, bestehenden Vorerkrankungen, aktuellen Medikation sowie bekannten Allergien und Unverträglichkeiten zu machen.`,
      ``,
      `b) Änderungen seines Gesundheitszustandes, insbesondere neue Beschwerden, Verschlechterungen, Nebenwirkungen der Übungen oder zwischenzeitlich eingetretene Erkrankungen, unverzüglich dem Behandler mitzuteilen.`,
      ``,
      `c) Die vom Behandler empfohlenen Übungen und Trainingseinheiten (Eigenübungsprogramm) zwischen den Sitzungen gewissenhaft und gemäß den Anleitungen durchzuführen.`,
      ``,
      `d) Bei Auftreten von Schmerzen, Schwindelgefühlen, Taubheitsgefühlen oder anderen ungewöhnlichen Symptomen während der Übungen sofort aufzuhören und den Behandler zu informieren.`,
      ``,
      `e) Die vereinbarten Termine einzuhalten und im Falle einer Verhinderung die Absagefristen gemäß §6 einzuhalten.`,
      ``,
      `f) Die technischen Voraussetzungen für die Fernbehandlung gemäß §4 Abs. 4 und 5 sicherzustellen.`,
      ``,
      `(2) Der Patient bestätigt, dass ihm keine medizinischen Kontraindikationen für die vereinbarte Behandlung bekannt sind, die er dem Behandler nicht mitgeteilt hat. Hierzu zählen insbesondere: Herzerkrankungen, Blutgerinnungsstörungen, akute Entzündungen, Tumorerkrankungen, kürzliche Operationen, Schwangerschaft, Epilepsie, Osteoporose sowie psychische Erkrankungen.`,
      ``,
      `(3) Verletzt der Patient seine Mitwirkungspflichten nach Abs. 1 oder verschweigt er relevante Gesundheitsinformationen gemäß Abs. 2, so haftet der Behandler nicht für daraus resultierende gesundheitliche Nachteile oder Behandlungsverzögerungen. Der Behandler ist in diesem Fall berechtigt, die Behandlung einzustellen.`,
    ].join("\n"),

    // ──────────────────────────────────────────────
    // §8 SCHWEIGEPFLICHT
    // ──────────────────────────────────────────────
    schweigepflicht: [
      `§8 Schweigepflicht und Berufsgeheimnis`,
      ``,
      `(1) Der Behandler unterliegt als Heilpraktiker der Schweigepflicht gemäß § 203 Abs. 1 Nr. 1 StGB. Alle ihm im Rahmen der Behandlung bekannt gewordenen Informationen über den Patienten — insbesondere Gesundheitsdaten, persönliche Lebensumstände und sonstige vertrauliche Informationen — werden streng vertraulich behandelt.`,
      ``,
      `(2) Die Schweigepflicht gilt über das Ende des Vertragsverhältnisses hinaus und auch gegenüber Familienangehörigen, Arbeitgebern, Versicherungen und sonstigen Dritten.`,
      ``,
      `(3) Eine Weitergabe von Informationen an Dritte erfolgt nur:`,
      `- Mit ausdrücklicher, schriftlicher Einwilligung des Patienten`,
      `- Bei gesetzlicher Verpflichtung zur Offenbarung (z. B. Meldepflichten nach Infektionsschutzgesetz)`,
      `- Im Rahmen eines berechtigten Interesses zur Abwehr einer Gefahr für Leib und Leben`,
      `- Gegenüber mitbehandelnden Ärzten oder Therapeuten, sofern der Patient hierin eingewilligt hat`,
      ``,
      `(4) Der Patient kann den Behandler jederzeit von der Schweigepflicht gegenüber bestimmten Personen oder Institutionen (z. B. Versicherung, mitbehandelnder Arzt) schriftlich entbinden. Die Entbindung kann jederzeit widerrufen werden.`,
      ``,
      `(5) Die Mitarbeiter des Behandlers sowie von ihm eingesetzte Dienstleister (z. B. für IT, Abrechnung) sind ebenfalls zur Verschwiegenheit verpflichtet.`,
    ].join("\n"),

    // ──────────────────────────────────────────────
    // §9 HAFTUNG
    // ──────────────────────────────────────────────
    haftungsausschluss: [
      `§9 Haftung und Haftungsbeschränkung`,
      ``,
      `(1) Der Behandler haftet für die ordnungsgemäße Erbringung der vereinbarten Leistungen nach den anerkannten Standards der Physiotherapie und den Sorgfaltspflichten eines Heilpraktikers. Die Haftung richtet sich nach den gesetzlichen Vorschriften (§§ 280 ff., 611 ff., 823 ff. BGB).`,
      ``,
      `(2) Der Behandler weist ausdrücklich darauf hin, dass ein bestimmter Behandlungserfolg nicht geschuldet wird. Die physiotherapeutische Behandlung ist eine Dienstleistung, keine Werkleistung. Der Behandler schuldet die fachgerecht durchgeführte Behandlung, nicht den Therapieerfolg.`,
      ``,
      `(3) Die Haftung des Behandlers ist in folgenden Fällen ausgeschlossen oder beschränkt:`,
      `- Gesundheitliche Nachteile, die auf unrichtige oder unvollständige Angaben des Patienten über seinen Gesundheitszustand zurückzuführen sind (vgl. §7 Abs. 2 und 3)`,
      `- Verletzungen oder Beschwerden, die durch eigenmächtige Abweichung des Patienten vom Therapieplan entstehen`,
      `- Verletzungen, die durch eine ungeeignete Übungsumgebung des Patienten bei der Fernbehandlung entstehen (vgl. §4 Abs. 5)`,
      `- Schäden durch technische Störungen, die außerhalb des Einflussbereichs des Behandlers liegen`,
      `- Schäden durch die eigenständige Durchführung von Übungen ohne vorherige Rücksprache bei Beschwerden`,
      ``,
      `(4) Für leichte Fahrlässigkeit haftet der Behandler nur bei Verletzung wesentlicher Vertragspflichten (Kardinalpflichten). In diesem Fall ist die Haftung auf den vertragstypisch vorhersehbaren Schaden begrenzt. Diese Haftungsbeschränkung gilt nicht für Schäden aus der Verletzung des Lebens, des Körpers oder der Gesundheit.`,
      ``,
      `(5) Die Haftung für Vorsatz und grobe Fahrlässigkeit bleibt unberührt.`,
      ``,
      `(6) Der Patient wird darüber aufgeklärt, dass physiotherapeutische Behandlungen — insbesondere Übungsprogramme — mit folgenden Risiken verbunden sein können: vorübergehende Schmerzverstärkung, Muskelkater, lokale Rötungen, Kreislaufbeschwerden. Diese normalen Behandlungsfolgen stellen keine Haftungsfälle dar.`,
      ``,
      `(7) Etwaige Schadensersatzansprüche des Patienten verjähren innerhalb von zwei Jahren ab Kenntnis des Schadens und des Schädigers, sofern keine kürzeren gesetzlichen Fristen gelten. Dies gilt nicht für Ansprüche aus vorsätzlichen oder grob fahrlässigen Pflichtverletzungen.`,
    ].join("\n"),

    // ──────────────────────────────────────────────
    // §10 DATENSCHUTZ
    // ──────────────────────────────────────────────
    datenschutz: [
      `§10 Datenschutz (DSGVO)`,
      ``,
      `(1) Verantwortlicher im Sinne der Datenschutz-Grundverordnung (DSGVO) ist der Behandler: ${praxis.praxis_name}, ${praxisFullAddress}, E-Mail: ${praxisEmail}.`,
      ``,
      `(2) Rechtsgrundlage der Datenverarbeitung: Die Verarbeitung personenbezogener Gesundheitsdaten erfolgt auf Grundlage von Art. 9 Abs. 2 lit. h) DSGVO i.V.m. § 22 Abs. 1 Nr. 1 lit. b) BDSG (Gesundheitsvorsorge und Arbeitsmedizin) sowie Art. 6 Abs. 1 lit. b) DSGVO (Vertragserfüllung).`,
      ``,
      `(3) Umfang der Datenverarbeitung: Der Behandler erhebt und verarbeitet folgende personenbezogene Daten des Patienten:`,
      `- Stammdaten (Name, Adresse, Geburtsdatum, Kontaktdaten)`,
      `- Gesundheitsdaten (Anamnese, Befunde, Diagnosen, Therapieverlauf, Trainingsdaten)`,
      `- Kommunikationsdaten (Chat-Nachrichten, E-Mails)`,
      `- Nutzungsdaten der Praxis-App (Login-Zeiten, absolvierte Übungen, Schmerztagebuch-Einträge)`,
      `- Vertragsdaten (Vertragsnummer, Signatur, IP-Adresse bei elektronischer Signatur)`,
      ``,
      `(4) Zweck der Verarbeitung: Die Daten werden ausschließlich verarbeitet zum Zweck der:`,
      `- Durchführung und Dokumentation der vereinbarten Behandlung`,
      `- Erstellung individueller Trainings- und Therapiepläne`,
      `- Kommunikation zwischen Behandler und Patient`,
      `- Rechnungsstellung und Vertragsverwaltung`,
      `- Erfüllung gesetzlicher Aufbewahrungspflichten`,
      ``,
      `(5) Speicherung und Sicherheit: Alle Patientendaten werden auf Servern innerhalb der Europäischen Union gespeichert (Supabase EU, Frankfurt am Main). Die Datenübertragung erfolgt verschlüsselt (TLS 1.2 oder höher). Die Daten werden durch technische und organisatorische Maßnahmen gemäß Art. 32 DSGVO geschützt.`,
      ``,
      `(6) Aufbewahrungsfrist: Behandlungsunterlagen und Vertragsdaten werden gemäß § 630f Abs. 3 BGB und den berufsrechtlichen Vorgaben für mindestens 10 Jahre nach Abschluss der Behandlung aufbewahrt. Abrechnungsunterlagen werden gemäß § 257 HGB für 10 Jahre aufbewahrt. Nach Ablauf der Aufbewahrungsfristen werden die Daten gelöscht.`,
      ``,
      `(7) Weitergabe an Dritte: Eine Weitergabe personenbezogener Daten an Dritte erfolgt nur:`,
      `- Mit ausdrücklicher Einwilligung des Patienten`,
      `- An Auftragsverarbeiter, die vertraglich zur DSGVO-konformen Verarbeitung verpflichtet sind (z. B. Hosting-Anbieter, E-Mail-Dienstleister)`,
      `- Wenn eine gesetzliche Verpflichtung zur Offenbarung besteht`,
      ``,
      `(8) Rechte des Patienten: Der Patient hat jederzeit das Recht auf:`,
      `- Auskunft über die gespeicherten Daten (Art. 15 DSGVO)`,
      `- Berichtigung unrichtiger Daten (Art. 16 DSGVO)`,
      `- Löschung, soweit keine gesetzlichen Aufbewahrungspflichten entgegenstehen (Art. 17 DSGVO)`,
      `- Einschränkung der Verarbeitung (Art. 18 DSGVO)`,
      `- Datenübertragbarkeit (Art. 20 DSGVO)`,
      `- Widerspruch gegen die Verarbeitung (Art. 21 DSGVO)`,
      `- Beschwerde bei der zuständigen Datenschutzaufsichtsbehörde`,
      ``,
      `(9) Der Patient kann seine datenschutzrechtlichen Rechte per E-Mail an ${praxisEmail} geltend machen.`,
    ].join("\n"),

    // ──────────────────────────────────────────────
    // §11 WIDERRUFSBELEHRUNG
    // ──────────────────────────────────────────────
    widerrufsrecht: [
      `§11 Widerrufsbelehrung`,
      ``,
      `Widerrufsrecht`,
      ``,
      `Der Patient hat das Recht, diesen Vertrag innerhalb von 14 Tagen ohne Angabe von Gründen zu widerrufen. Die Widerrufsfrist beträgt 14 Tage ab dem Tag des Vertragsschlusses (Datum der elektronischen Unterzeichnung).`,
      ``,
      `Um das Widerrufsrecht auszuüben, muss der Patient den Behandler`,
      ``,
      `${praxis.praxis_name}`,
      `${praxis.inhaber_name}`,
      `${praxisFullAddress}`,
      `E-Mail: ${praxisEmail}`,
      praxisTelefon ? `Tel.: ${praxisTelefon}` : "",
      ``,
      `mittels einer eindeutigen Erklärung (z. B. ein mit der Post versandter Brief oder eine E-Mail) über den Entschluss, diesen Vertrag zu widerrufen, informieren.`,
      ``,
      `Zur Wahrung der Widerrufsfrist reicht es aus, dass die Mitteilung über die Ausübung des Widerrufsrechts vor Ablauf der Widerrufsfrist abgesendet wird.`,
      ``,
      `Vorzeitiger Beginn der Dienstleistung und Erlöschen des Widerrufsrechts`,
      ``,
      `Der Patient stimmt mit der Unterzeichnung dieses Vertrages ausdrücklich zu, dass der Behandler mit der Erbringung der Dienstleistung vor Ablauf der Widerrufsfrist beginnt. Dem Patienten ist bekannt, dass sein Widerrufsrecht gemäß § 356 Abs. 4 BGB erlischt, sobald der Behandler die vereinbarte Dienstleistung vollständig erbracht hat.`,
      ``,
      `Folgen des Widerrufs bei bereits begonnener Leistung`,
      ``,
      `Widerruft der Patient den Vertrag nach Beginn der Leistungserbringung (z. B. nach der ersten oder weiteren Video-Sitzungen), ist der Patient gemäß § 357 Abs. 8 BGB verpflichtet, dem Behandler einen angemessenen Betrag für die bis zum Zeitpunkt des Widerrufs bereits erbrachten Leistungen zu zahlen.`,
      ``,
      `Die Berechnung erfolgt anteilig: Wurden z. B. 3 von 8 vereinbarten Sitzungen durchgeführt, schuldet der Patient 3/8 des Gesamtbetrages. Bei Einzelsitzungsverträgen (Zahlung pro Sitzung) sind alle bis zum Widerruf durchgeführten Sitzungen vollständig zu vergüten. Bereits in Anspruch genommene App-Nutzung, erstellte Trainingspläne und Chat-Beratung werden anteilig berücksichtigt.`,
      ``,
      `Rückzahlung bei Widerruf`,
      ``,
      `Der Behandler erstattet ausschließlich den Betrag für noch nicht erbrachte Leistungen. Die Rückzahlung erfolgt unverzüglich und spätestens binnen 14 Tagen ab Eingang der Widerrufserklärung. Für die Rückzahlung wird dasselbe Zahlungsmittel verwendet, das der Patient bei der ursprünglichen Transaktion eingesetzt hat; Entgelte werden hierfür nicht berechnet.`,
      ``,
      `Zusammenfassung der Kostenfolge bei Widerruf:`,
      `- Widerruf vor Behandlungsbeginn: Volle Erstattung aller geleisteten Zahlungen`,
      `- Widerruf nach Behandlungsbeginn: Erstattung abzüglich der bereits erbrachten Leistungen (anteilig berechnet)`,
      `- Widerruf nach vollständiger Leistungserbringung: Kein Widerrufsrecht mehr (§ 356 Abs. 4 BGB)`,
      ``,
      `Muster-Widerrufsformular`,
      ``,
      `(Wenn Sie den Vertrag widerrufen wollen, füllen Sie bitte dieses Formular aus und senden Sie es zurück.)`,
      `- An: ${praxis.praxis_name}, ${praxisFullAddress}, E-Mail: ${praxisEmail}`,
      `- Hiermit widerrufe(n) ich/wir (*) den von mir/uns (*) abgeschlossenen Vertrag über die Erbringung der folgenden Dienstleistung: Behandlungsvertrag [Vertragsnummer]`,
      `- Bestellt am (*)/erhalten am (*): [Datum der Unterzeichnung]`,
      `- Name des/der Verbraucher(s): [Name]`,
      `- Anschrift des/der Verbraucher(s): [Anschrift]`,
      `- Unterschrift des/der Verbraucher(s) (nur bei Mitteilung auf Papier): [Unterschrift]`,
      `- Datum: [Datum]`,
      `(*) Unzutreffendes streichen.`,
    ].filter(Boolean).join("\n"),

    // ──────────────────────────────────────────────
    // §12 KÜNDIGUNG
    // ──────────────────────────────────────────────
    kuendigung: [
      `§12 Vertragslaufzeit und Kündigung`,
      ``,
      ctx.zahlungsweise === "einmalig"
        ? `(1) Dieser Vertrag hat eine feste Laufzeit entsprechend des vereinbarten Behandlungsprogramms (${ctx.dauerWochen ? `ca. ${ctx.dauerWochen} Wochen` : "siehe §1"}). Er endet automatisch mit der Erbringung aller vereinbarten Leistungen oder mit Ablauf der vereinbarten Laufzeit, ohne dass es einer Kündigung bedarf.`
        : `(1) Dieser Vertrag wird auf unbestimmte Zeit geschlossen und kann von beiden Seiten mit einer Frist von 14 Tagen zum Ende eines Kalendermonats ordentlich gekündigt werden.`,
      ``,
      `(2) Das Recht zur außerordentlichen Kündigung aus wichtigem Grund bleibt unberührt. Ein wichtiger Grund liegt insbesondere vor, wenn:`,
      `- Der Patient seine Mitwirkungspflichten gemäß §7 trotz schriftlicher Abmahnung wiederholt verletzt`,
      `- Der Patient mit Zahlungen in Höhe von mindestens zwei Sitzungshonoraren oder für mehr als 30 Tage in Verzug ist`,
      `- Der Behandler feststellt, dass die Behandlung aus medizinischen Gründen nicht fortgesetzt werden kann oder sollte`,
      `- Das Vertrauensverhältnis zwischen den Vertragsparteien nachhaltig gestört ist`,
      `- Einer der Vertragsparteien ein wesentlicher Vertragsverstoß der anderen Partei nicht abgestellt wird`,
      ``,
      `(3) Die Kündigung bedarf der Textform (E-Mail genügt).`,
      ``,
      ctx.zahlungsweise === "einmalig"
        ? `(4) Im Falle einer vorzeitigen Beendigung des Vertrages (durch Kündigung, nicht durch Widerruf gemäß §11) wird wie folgt abgerechnet: Der Behandler erstattet dem Patienten den anteiligen Betrag für noch nicht erbrachte Sitzungen abzüglich einer Verwaltungspauschale von 10 % des Gesamtbetrages, maximal jedoch 50,00 EUR. Bereits erbrachte Leistungen und verpasste Sitzungen gemäß §6 Abs. 3 werden nicht erstattet.`
        : `(4) Im Falle einer Kündigung werden bis zum Wirksamwerden der Kündigung bereits erbrachte oder in Anspruch genommene Leistungen nach §5 abgerechnet.`,
      ``,
      `(5) Bei Beendigung des Vertragsverhältnisses erstellt der Behandler auf Wunsch des Patienten einen Abschlussbefund und übergibt relevante Behandlungsunterlagen gemäß den berufsrechtlichen Pflichten. Der App-Zugang wird gemäß §2 Abs. 6 geregelt.`,
    ].join("\n"),

    // ──────────────────────────────────────────────
    // §13 URHEBERRECHT
    // ──────────────────────────────────────────────
    urheberrecht: [
      `§13 Urheberrecht und geistiges Eigentum`,
      ``,
      `(1) Sämtliche vom Behandler erstellten Materialien — insbesondere Trainingspläne, Übungsbeschreibungen, Video-Anleitungen, Kursinhalte, therapeutische Konzepte und Inhalte der Praxis-App — sind urheberrechtlich geschützt und verbleiben im geistigen Eigentum des Behandlers.`,
      ``,
      `(2) Der Patient erhält ein einfaches, nicht übertragbares, nicht unterlizenzierbares Nutzungsrecht an diesen Materialien ausschließlich zum Zweck der eigenen therapeutischen Nutzung im Rahmen dieses Vertragsverhältnisses.`,
      ``,
      `(3) Dem Patienten ist es untersagt:`,
      `- Die Materialien ganz oder teilweise zu vervielfältigen, weiterzugeben oder Dritten zugänglich zu machen`,
      `- Die Materialien in sozialen Medien, auf Websites oder in anderen öffentlichen Kanälen zu veröffentlichen`,
      `- Die Materialien für kommerzielle Zwecke zu nutzen`,
      `- Video-Sitzungen oder Inhalte der Praxis-App aufzuzeichnen (Bild- oder Tonaufnahme) ohne ausdrückliche schriftliche Zustimmung des Behandlers`,
      ``,
      `(4) Zuwiderhandlungen gegen Abs. 3 können zivilrechtliche Ansprüche auf Unterlassung und Schadensersatz begründen. Der Behandler ist in diesem Fall zudem berechtigt, das Vertragsverhältnis fristlos zu kündigen.`,
    ].join("\n"),

    // ──────────────────────────────────────────────
    // §14 SCHLUSSBESTIMMUNGEN
    // ──────────────────────────────────────────────
    schlussbestimmungen: [
      `§14 Schlussbestimmungen`,
      ``,
      `(1) Änderungen und Ergänzungen dieses Vertrages bedürfen der Textform (E-Mail genügt). Mündliche Nebenabreden bestehen nicht.`,
      ``,
      `(2) Salvatorische Klausel: Sollte eine Bestimmung dieses Vertrages ganz oder teilweise unwirksam sein oder werden, so wird die Wirksamkeit der übrigen Bestimmungen hiervon nicht berührt. An die Stelle der unwirksamen Bestimmung tritt eine wirksame Regelung, die dem wirtschaftlichen Zweck der unwirksamen Bestimmung am nächsten kommt.`,
      ``,
      `(3) Auf diesen Vertrag findet ausschließlich das Recht der Bundesrepublik Deutschland Anwendung.`,
      ``,
      `(4) Gerichtsstand für alle Streitigkeiten aus diesem Vertragsverhältnis ist — soweit gesetzlich zulässig — der Sitz des Behandlers.`,
      ``,
      `(5) Der Patient bestätigt mit seiner Unterschrift, dass er:`,
      `- Diesen Vertrag vollständig gelesen und verstanden hat`,
      `- Über Art, Umfang und Risiken der Behandlung aufgeklärt wurde`,
      `- Die Widerrufsbelehrung zur Kenntnis genommen hat`,
      `- Die Datenschutzhinweise gelesen und zur Kenntnis genommen hat`,
      `- Alle ihm bekannten gesundheitsrelevanten Informationen mitgeteilt hat`,
      ``,
      `(6) Hinweis gemäß § 36 Verbraucherstreitbeilegungsgesetz (VSBG): Der Behandler ist weder bereit noch verpflichtet, an Streitbeilegungsverfahren vor einer Verbraucherschlichtungsstelle teilzunehmen.`,
      ``,
      `(7) Dieser Vertrag wird in elektronischer Form geschlossen. Die elektronische Signatur des Patienten ist rechtsverbindlich im Sinne des § 126b BGB (Textform) und genügt als einfache elektronische Signatur den Anforderungen der eIDAS-Verordnung (EU) Nr. 910/2014.`,
    ].join("\n"),
  }
}
