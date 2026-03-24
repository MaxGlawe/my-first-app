import type { BgfContractType, BgfLeistung, BgfVertragText } from "@/types/bgf-contract"
import type { PraxisSettings } from "@/types/billing"

interface BgfContractContext {
  contractType: BgfContractType
  leistungen: BgfLeistung[]
  preisProMaMonat: number
  lizenzen: number
  monatlichGesamt: number
  laufzeitMonate: number
  vertragStart: string | null
  praxis: PraxisSettings
  orgName: string
  orgAddress?: string | null
  orgBranche?: string | null
  orgGroesse?: string | null
  kontaktName: string
  kontaktEmail: string
}

function fmtDate(dateStr: string | null | undefined): string {
  if (!dateStr) return "—"
  const d = new Date(dateStr + "T00:00:00")
  return d.toLocaleDateString("de-DE", { day: "2-digit", month: "2-digit", year: "numeric" })
}

function fmtCurrency(amount: number): string {
  return amount.toLocaleString("de-DE", { style: "currency", currency: "EUR" })
}

function getTierLabel(type: BgfContractType): string {
  const labels: Record<BgfContractType, string> = {
    basic: "Basic",
    pro: "Professional",
    enterprise: "Enterprise",
  }
  return labels[type]
}

export function generateBgfVertragText(ctx: BgfContractContext): BgfVertragText {
  const { praxis } = ctx
  const praxisFullAddress = `${praxis.strasse}, ${praxis.plz} ${praxis.ort}`
  const praxisEmail = praxis.email || "info@physiotherapie-glawe.de"
  const praxisTelefon = praxis.telefon || ""

  const enthalteneLeistungen = ctx.leistungen
    .filter((l) => l.enthalten)
    .map((l) => `- ${l.beschreibung}${l.details ? ` (${l.details})` : ""}`)
    .join("\n")

  const nichtEnthalteneLeistungen = ctx.leistungen
    .filter((l) => !l.enthalten)
    .map((l) => `- ${l.beschreibung}`)
    .join("\n")

  const vertragStartText = ctx.vertragStart ? fmtDate(ctx.vertragStart) : "nach Unterzeichnung"

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
      `(nachfolgend „Auftragnehmer" oder „Praxis" genannt)`,
      ``,
      `und`,
      ``,
      `${ctx.orgName}`,
      ctx.orgAddress || "",
      ctx.orgBranche ? `Branche: ${ctx.orgBranche}` : "",
      `Ansprechpartner: ${ctx.kontaktName}`,
      `E-Mail: ${ctx.kontaktEmail}`,
      `(nachfolgend „Auftraggeber" oder „Unternehmen" genannt)`,
      ``,
      `— gemeinsam „Vertragsparteien" —`,
      ``,
      `wird folgender BGF-Dienstleistungsvertrag geschlossen:`,
    ].filter(Boolean).join("\n"),

    // ──────────────────────────────────────────────
    // PRÄAMBEL
    // ──────────────────────────────────────────────
    praeambel: [
      `Präambel`,
      ``,
      `Der Auftragnehmer betreibt eine Praxis für Physiotherapie und bietet im Rahmen der Betrieblichen Gesundheitsförderung (BGF) gemäß § 20b SGB V digitale und analoge Gesundheitsdienstleistungen für Unternehmen an.`,
      ``,
      `Der Auftraggeber beabsichtigt, seinen Mitarbeitenden im Rahmen der betrieblichen Gesundheitsförderung Zugang zu einer digitalen Gesundheitsplattform mit personalisierten Bewegungs- und Präventionsprogrammen zu ermöglichen.`,
      ``,
      `Die Vertragsparteien vereinbaren die nachfolgend aufgeführten Leistungen, Pflichten und Bedingungen. Der Vertrag dient dem Ziel, die Gesundheit, das Wohlbefinden und die Arbeitsfähigkeit der Mitarbeitenden nachhaltig zu fördern und arbeitsbedingte Gesundheitsrisiken zu reduzieren.`,
    ].join("\n"),

    // ──────────────────────────────────────────────
    // §1 VERTRAGSGEGENSTAND
    // ──────────────────────────────────────────────
    vertragsgegenstand: [
      `§1 Vertragsgegenstand`,
      ``,
      `(1) Gegenstand dieses Vertrages ist die Bereitstellung einer digitalen Plattform zur betrieblichen Gesundheitsförderung („Praxis OS BGF") einschließlich präventiver Maßnahmen zur Förderung von Bewegung, Ergonomie und allgemeinem Wohlbefinden der Mitarbeitenden. Das vereinbarte Leistungspaket entspricht dem Tarif „${getTierLabel(ctx.contractType)}".`,
      ``,
      `(2) Die Leistungen dienen ausschließlich der Prävention im Sinne des § 20b SGB V und stellen keine medizinische Behandlung, Therapie oder Diagnosestellung im heilkundlichen Sinne dar.`,
      ``,
      `(3) Individuelle therapeutische Leistungen bei Beschwerden sind nicht Bestandteil dieses Vertrages. Für diese gelten die Regelungen in §2a (Optionale Zusatzleistungen).`,
      ``,
      `(4) Der Auftragnehmer stellt dem Auftraggeber ${ctx.lizenzen} Mitarbeiter-Lizenzen zur Verfügung. Jede Lizenz berechtigt einen Mitarbeitenden des Auftraggebers zur vollumfänglichen Nutzung der BGF-Plattform gemäß dem vereinbarten Leistungsumfang (§2).`,
      ``,
      `(5) Der Vertrag tritt am ${vertragStartText} in Kraft und hat eine Mindestlaufzeit gemäß §5.`,
    ].join("\n"),

    // ──────────────────────────────────────────────
    // §2 LEISTUNGSUMFANG
    // ──────────────────────────────────────────────
    leistungsumfang: [
      `§2 Leistungsumfang (Tarif: ${getTierLabel(ctx.contractType)})`,
      ``,
      `(1) Der Leistungsumfang umfasst insbesondere:`,
      ``,
      `- KI-basierte Bewegungsimpulse`,
      `- Pausen-Fit Sessions (personalisiert auf Arbeitsplatztyp und Beschwerdeprofil)`,
      `- Täglicher Gesundheits-Check-In mit personalisierter Tagesplanung`,
      `- Ergonomische Empfehlungen und Bildschirm-Pausen`,
      `- Allgemeine Bewegungsprogramme`,
      `- Anonymisierte Auswertungen für das HR-Dashboard`,
      ``,
      enthalteneLeistungen ? `(2) Im vereinbarten Tarif „${getTierLabel(ctx.contractType)}" sind folgende Leistungen enthalten:\n\n${enthalteneLeistungen}` : "",
      ``,
      `(${nichtEnthalteneLeistungen ? "3" : "2"}) Die bereitgestellten Inhalte dienen der allgemeinen Gesundheitsförderung und ersetzen keine individuelle medizinische Beratung oder Behandlung.`,
      ``,
      nichtEnthalteneLeistungen ? `(4) Folgende Leistungen sind im gewählten Tarif nicht enthalten und können bei Bedarf durch ein Upgrade hinzugebucht werden:\n\n${nichtEnthalteneLeistungen}` : "",
      ``,
      `(${nichtEnthalteneLeistungen ? "5" : "3"}) Der Auftragnehmer behält sich vor, den Leistungsumfang im Rahmen von Plattform-Updates zu erweitern. Eine Reduzierung des vereinbarten Leistungsumfangs bedarf der schriftlichen Zustimmung des Auftraggebers.`,
    ].filter(Boolean).join("\n"),

    // ──────────────────────────────────────────────
    // §2a OPTIONALE ZUSATZLEISTUNGEN
    // ──────────────────────────────────────────────
    zusatzleistungen: [
      `§2a Optionale Zusatzleistungen`,
      ``,
      `(1) Der Auftragnehmer bietet den Mitarbeitenden des Auftraggebers optional zusätzliche individuelle Gesundheitsleistungen an.`,
      ``,
      `(2) Diese Leistungen umfassen insbesondere:`,
      `- Individuelle Befundungen`,
      `- Personalisierte Trainings- und Therapieprogramme`,
      `- Therapeutische Beratung im Rahmen der heilpraktischen Tätigkeit (beschränkt auf Physiotherapie)`,
      ``,
      `(3) Diese Leistungen sind nicht Bestandteil dieses Vertrages und werden ausschließlich auf Grundlage eines separaten Behandlungsvertrages zwischen dem jeweiligen Mitarbeitenden und dem Auftragnehmer erbracht.`,
      ``,
      `(4) Die Inanspruchnahme dieser Leistungen erfolgt ausschließlich freiwillig und auf eigene Initiative der Mitarbeitenden. Eine Verpflichtung zur Nutzung besteht nicht.`,
      ``,
      `(5) Der Zugang zu optionalen individuellen Leistungen erfolgt ausschließlich durch aktive Auswahl und Zustimmung des jeweiligen Mitarbeitenden innerhalb der Plattform.`,
      ``,
      `(6) Mitarbeitende des Auftraggebers können im Rahmen des BGF-Programms Zugang zu Sonderkonditionen für diese Leistungen erhalten.`,
      ``,
      `(7) Zwischen dem Auftraggeber und dem Mitarbeitenden entsteht durch diesen Vertrag kein Anspruch auf individuelle Gesundheitsleistungen.`,
      ``,
      `(8) Ein Vertragsverhältnis über individuelle Leistungen besteht ausschließlich zwischen dem jeweiligen Mitarbeitenden und dem Auftragnehmer.`,
    ].join("\n"),

    // ──────────────────────────────────────────────
    // §3 APP-NUTZUNG / SLA
    // ──────────────────────────────────────────────
    app_nutzung: [
      `§3 Digitale BGF-Plattform und Systemverfügbarkeit (SLA)`,
      ``,
      `(1) Die Mitarbeitenden des Auftraggebers erhalten individuellen Zugang zur BGF-Plattform über die Praxis-App. Der Zugang erfolgt nach Durchführung einer digitalen Ist-Analyse (Gesundheits-Onboarding).`,
      ``,
      `(2) Die Plattform umfasst — je nach vereinbartem Tarif — folgende Kernfunktionen:`,
      `- Täglicher Gesundheits-Check-In mit personalisierter Tagesplanung`,
      `- KI-generierte Pausen-Fit Micro-Routinen (angepasst an Arbeitsplatztyp und Beschwerden)`,
      `- Geführte Atem-Pause zur Stressreduktion`,
      `- Bildschirm-Pause Timer (20-20-20 Augenentlastung)`,
      `- Hydration-Tracker zur Förderung der Flüssigkeitsaufnahme`,
      `- Fortschritts-Tracking mit Zielvisualisierung`,
      `- Wochen-Übersicht und Aktivitäts-Streak`,
      ``,
      `(3) Der Auftragnehmer stellt die technische Verfügbarkeit der Plattform nach bestem Bemühen sicher (Verfügbarkeitsziel: 99,5% pro Kalendermonat). Geplante Wartungsarbeiten werden mindestens 48 Stunden im Voraus angekündigt und finden bevorzugt außerhalb der Geschäftszeiten statt.`,
      ``,
      `(4) Die Plattform wird auf EU-Servern (Deutschland/Finnland) betrieben. Alle Daten verbleiben innerhalb der Europäischen Union.`,
      ``,
      `(5) Wird die vereinbarte Systemverfügbarkeit von 99,5% im Kalendermonat unterschritten, hat der Auftraggeber Anspruch auf eine anteilige Gutschrift (Service Credit) in Höhe von bis zu 20% der monatlichen Vergütung. Die Geltendmachung hat innerhalb von 30 Tagen nach Ende des betreffenden Kalendermonats schriftlich zu erfolgen.`,
    ].join("\n"),

    // ──────────────────────────────────────────────
    // §4 VERGÜTUNG
    // ──────────────────────────────────────────────
    verguetung: [
      `§4 Vergütung und Zahlungsbedingungen`,
      ``,
      `(1) Der Auftraggeber zahlt für die vereinbarten Leistungen eine monatliche Vergütung in Höhe von:`,
      ``,
      `  Preis pro Mitarbeiter/Monat: ${fmtCurrency(ctx.preisProMaMonat)}`,
      `  Anzahl Lizenzen: ${ctx.lizenzen}`,
      `  Monatlicher Gesamtbetrag: ${fmtCurrency(ctx.monatlichGesamt)}`,
      ``,
      `(2) Die Vergütung wird monatlich im Voraus in Rechnung gestellt. Die Rechnung wird dem Auftraggeber in elektronischer Form (PDF per E-Mail) zugestellt. Das Zahlungsziel beträgt 14 Tage ab Rechnungsdatum.`,
      ``,
      `(3) Die genannten Preise verstehen sich als Nettopreise zuzüglich der gesetzlichen Umsatzsteuer, sofern diese anfällt. Physiotherapeutische Leistungen sind gemäß § 4 Nr. 14 UStG umsatzsteuerbefreit, soweit sie als Heilbehandlung im Bereich der Humanmedizin gelten. Digitale Dienstleistungen können der Regelbesteuerung unterliegen.`,
      ``,
      `(4) Die Lizenzanzahl kann während der Vertragslaufzeit einvernehmlich angepasst werden. Eine Erhöhung wird zum Folgemonat wirksam. Eine Reduzierung ist mit einer Frist von 30 Tagen zum Monatsende möglich, jedoch nicht unter die bei Vertragsschluss vereinbarte Mindestlizenzanzahl.`,
      ``,
      `(5) Bei Zahlungsverzug ist der Auftragnehmer berechtigt, Verzugszinsen in Höhe von 5 Prozentpunkten über dem jeweiligen Basiszinssatz der Europäischen Zentralbank (§ 288 BGB) zu berechnen. Das Recht auf Geltendmachung eines weitergehenden Verzugsschadens bleibt unberührt.`,
      ``,
      `(6) Preisanpassungen erfolgen nur bei nachweislich gestiegenen Kosten (insbesondere Infrastruktur-, Personal- oder Lizenzkosten) und sind auf maximal 10% pro Jahr begrenzt. Preisanpassungen sind mit einer Ankündigungsfrist von 3 Monaten zum jeweiligen Verlängerungszeitraum mitzuteilen. Preiserhöhungen berechtigen den Auftraggeber zur außerordentlichen Kündigung mit einer Frist von 30 Tagen.`,
    ].join("\n"),

    // ──────────────────────────────────────────────
    // §5 LAUFZEIT & KÜNDIGUNG
    // ──────────────────────────────────────────────
    laufzeit_kuendigung: [
      `§5 Vertragslaufzeit und Kündigung`,
      ``,
      `(1) Der Vertrag beginnt am ${vertragStartText} und hat eine Mindestlaufzeit von ${ctx.laufzeitMonate} Monaten (nachfolgend „Erstlaufzeit").`,
      ``,
      `(2) Nach Ablauf der Erstlaufzeit verlängert sich der Vertrag automatisch um jeweils weitere 12 Monate, sofern er nicht von einer der Vertragsparteien mit einer Frist von 3 Monaten zum Ende der jeweiligen Vertragslaufzeit schriftlich gekündigt wird.`,
      ``,
      `(3) Das Recht zur außerordentlichen Kündigung aus wichtigem Grund bleibt unberührt. Ein wichtiger Grund liegt insbesondere vor, wenn:`,
      `- der Auftraggeber mit der Zahlung von zwei aufeinanderfolgenden Monatsrechnungen in Verzug gerät`,
      `- der Auftragnehmer seine vertraglichen Leistungspflichten trotz schriftlicher Mahnung und angemessener Nachfrist nicht erfüllt`,
      `- gegen eine Vertragspartei ein Insolvenzverfahren eröffnet oder mangels Masse abgelehnt wird`,
      ``,
      `(4) Die Kündigung bedarf der Schriftform (E-Mail ausreichend). Die Kündigung ist an die im Vertrag genannte Kontaktadresse der jeweiligen Vertragspartei zu richten.`,
      ``,
      `(5) Im Falle der Beendigung des Vertrages gewährt der Auftragnehmer dem Auftraggeber eine Übergangsfrist von 30 Tagen, in der die Mitarbeitenden noch auf die Plattform zugreifen können. Danach werden alle personenbezogenen Daten gemäß den Bestimmungen in §6 gelöscht oder anonymisiert.`,
    ].join("\n"),

    // ──────────────────────────────────────────────
    // §6 DATENSCHUTZ
    // ──────────────────────────────────────────────
    datenschutz: [
      `§6 Datenschutz und DSGVO-Konformität`,
      ``,
      `(1) Beide Vertragsparteien verpflichten sich, die Bestimmungen der Europäischen Datenschutz-Grundverordnung (DSGVO), des Bundesdatenschutzgesetzes (BDSG) sowie aller weiteren anwendbaren datenschutzrechtlichen Vorschriften einzuhalten.`,
      ``,
      `(2) Der Auftragnehmer verarbeitet im Rahmen der BGF-Plattform folgende personenbezogene Daten der Mitarbeitenden:`,
      `- Stammdaten: Vorname, Nachname, E-Mail-Adresse, Abteilung`,
      `- Gesundheitsdaten (Art. 9 DSGVO): Schmerzangaben, Stresslevel, Schlafqualität, Bewegungsverhalten, Beschwerde-Regionen`,
      `- Nutzungsdaten: Check-In-Daten, absolvierte Sessions, Hydration-Tracking`,
      ``,
      `(3) Die Gesundheitsdaten der Mitarbeitenden werden ausschließlich zur personalisierten Gestaltung der BGF-Maßnahmen (Pausen-Fit Sessions, Ist-Analyse, Ziel-Tracking) verwendet. Sie werden NICHT an den Auftraggeber in individuell zuordenbarer Form weitergegeben.`,
      ``,
      `(4) Der Auftraggeber erhält ausschließlich anonymisierte und aggregierte Auswertungen über das HR-Dashboard. Individuelle Gesundheitsdaten einzelner Mitarbeitender sind für den Auftraggeber zu keinem Zeitpunkt einsehbar. Eine Mindestgruppengröße von 5 Mitarbeitenden pro Abteilung wird für Auswertungen vorausgesetzt.`,
      ``,
      `(5) Die Einwilligung der Mitarbeitenden zur Verarbeitung ihrer Gesundheitsdaten wird im Rahmen des digitalen Onboardings (Ist-Analyse) eingeholt. Die Teilnahme am BGF-Programm ist für Mitarbeitende freiwillig.`,
      ``,
      `(6) Alle Daten werden auf EU-Servern (Supabase, Standorte Deutschland und Finnland) gespeichert. Es findet keine Datenübermittlung in Drittstaaten statt.`,
      ``,
      `(7) Für die Verarbeitung personenbezogener Daten im Auftrag wird ein gesonderter Auftragsverarbeitungsvertrag (AVV) gemäß Art. 28 DSGVO geschlossen, der diesem Vertrag als Anlage beigefügt ist.`,
      ``,
      `(8) Die Rechte der betroffenen Mitarbeitenden (Auskunft, Berichtigung, Löschung, Einschränkung, Datenübertragbarkeit, Widerspruch) werden vom Auftragnehmer gemäß Art. 12–23 DSGVO gewährleistet.`,
      ``,
      `(9) Der Auftragnehmer handelt im Rahmen der BGF-Plattform als eigenständiger Verantwortlicher im Sinne des Art. 4 Nr. 7 DSGVO.`,
      ``,
      `(10) Für die optionalen individuellen Gesundheitsleistungen gemäß §2a (Behandlungsverhältnis) ist der Auftragnehmer ebenfalls eigenständiger Verantwortlicher.`,
      ``,
      `(11) Eine Übermittlung personenbezogener oder gesundheitsbezogener Daten an den Auftraggeber erfolgt zu keinem Zeitpunkt.`,
    ].join("\n"),

    // ──────────────────────────────────────────────
    // §7 VERTRAULICHKEIT
    // ──────────────────────────────────────────────
    vertraulichkeit: [
      `§7 Vertraulichkeit und Geheimhaltung`,
      ``,
      `(1) Die Vertragsparteien verpflichten sich, alle im Rahmen dieses Vertrages erlangten vertraulichen Informationen der jeweils anderen Partei geheim zu halten und nur für die Zwecke dieses Vertrages zu verwenden.`,
      ``,
      `(2) Vertrauliche Informationen umfassen insbesondere: Geschäftsgeheimnisse, Vertragsinhalte (einschließlich Preise und Konditionen), Mitarbeiterdaten, technische Informationen zur Plattform und Gesundheitsdaten.`,
      ``,
      `(3) Diese Geheimhaltungsverpflichtung gilt auch nach Beendigung des Vertragsverhältnisses für einen Zeitraum von 3 Jahren fort.`,
      ``,
      `(4) Ausgenommen von der Geheimhaltungsverpflichtung sind Informationen, die (a) öffentlich bekannt sind oder werden, (b) der empfangenden Partei bereits vor Offenlegung bekannt waren, oder (c) aufgrund gesetzlicher oder behördlicher Anordnung offengelegt werden müssen.`,
    ].join("\n"),

    // ──────────────────────────────────────────────
    // §8 HAFTUNG
    // ──────────────────────────────────────────────
    haftung: [
      `§8 Haftung und Haftungsbeschränkung`,
      ``,
      `(1) Der Auftragnehmer haftet für Schäden, die durch vorsätzliches oder grob fahrlässiges Verhalten seiner Mitarbeiter oder Erfüllungsgehilfen verursacht werden, nach den gesetzlichen Bestimmungen.`,
      ``,
      `(2) Bei leichter Fahrlässigkeit haftet der Auftragnehmer nur bei Verletzung wesentlicher Vertragspflichten (Kardinalpflichten). Die Haftung ist in diesem Fall auf den vertragstypischen, vorhersehbaren Schaden begrenzt, maximal jedoch auf den Jahresvertragswert (12 × monatlicher Gesamtbetrag).`,
      ``,
      `(3) Die BGF-Plattform dient der Gesundheitsförderung und Prävention. Der Auftragnehmer übernimmt keine Garantie für bestimmte Gesundheitsergebnisse. Die Pausen-Fit Sessions und Ergonomie-Empfehlungen stellen keine medizinische Behandlung dar und ersetzen nicht die ärztliche Versorgung.`,
      ``,
      `(4) Die Haftung für Datenverlust wird auf den typischen Wiederherstellungsaufwand begrenzt, der bei regelmäßiger und gefahrentsprechender Anfertigung von Sicherungskopien eingetreten wäre.`,
      ``,
      `(5) Die vorstehenden Haftungsbeschränkungen gelten nicht für Schäden aus der Verletzung des Lebens, des Körpers oder der Gesundheit sowie für Ansprüche nach dem Produkthaftungsgesetz.`,
      ``,
      `(6) Der Auftragnehmer haftet nicht für Schäden, die aus einer unsachgemäßen Nutzung der Plattform, Nichtbeachtung von Nutzungshinweisen oder eigenverantwortlicher Fehlanwendung der bereitgestellten Inhalte resultieren.`,
      ``,
      `(7) Der Auftragnehmer übernimmt keine Gewähr für das Erreichen individueller gesundheitlicher Ziele oder subjektiver Verbesserungen.`,
    ].join("\n"),

    // ──────────────────────────────────────────────
    // §9 MITWIRKUNGSPFLICHTEN
    // ──────────────────────────────────────────────
    mitwirkungspflichten: [
      `§9 Mitwirkungspflichten des Auftraggebers`,
      ``,
      `(1) Der Auftraggeber benennt einen verantwortlichen Ansprechpartner (HR-Koordinator), der als zentrale Kontaktperson für die Kommunikation mit dem Auftragnehmer fungiert.`,
      ``,
      `(2) Der Auftraggeber stellt die für die Einrichtung der Mitarbeiter-Accounts erforderlichen Daten (Name, E-Mail-Adresse, optional: Abteilung) zeitnah und in geeigneter Form zur Verfügung.`,
      ``,
      `(3) Der Auftraggeber informiert seine Mitarbeitenden über das BGF-Programm und motiviert zur freiwilligen Teilnahme. Die Teilnahme ist für die Mitarbeitenden stets freiwillig.`,
      ``,
      `(4) Der Auftraggeber stellt sicher, dass die Mitarbeitenden während der Arbeitszeit in angemessenem Umfang an den Pausen-Fit Sessions teilnehmen können (empfohlen: 3 × 5 Minuten pro Arbeitstag).`,
      ``,
      `(5) Der Auftraggeber informiert den Auftragnehmer unverzüglich über Änderungen in der Mitarbeiterstruktur (Zu- und Abgänge), damit die Lizenzanzahl entsprechend angepasst werden kann.`,
    ].join("\n"),

    // ──────────────────────────────────────────────
    // §10 WIDERRUFSRECHT
    // ──────────────────────────────────────────────
    widerrufsrecht: [
      `§10 Widerrufsbelehrung`,
      ``,
      `Hinweis: Da es sich um einen Vertrag zwischen Unternehmern (B2B) handelt, besteht grundsätzlich kein gesetzliches Widerrufsrecht nach dem Fernabsatzgesetz.`,
      ``,
      `Der Auftragnehmer räumt dem Auftraggeber dennoch aus Kulanz ein vertragliches Rücktrittsrecht ein:`,
      ``,
      `(1) Der Auftraggeber kann innerhalb von 14 Tagen nach Unterzeichnung dieses Vertrages ohne Angabe von Gründen vom Vertrag zurücktreten. Der Rücktritt ist schriftlich (E-Mail ausreichend) an den Auftragnehmer zu richten.`,
      ``,
      `(2) Im Falle des Rücktritts werden bereits erbrachte Leistungen anteilig berechnet. Bereits eingerichtete Mitarbeiter-Accounts werden innerhalb von 48 Stunden deaktiviert und die zugehörigen Daten gemäß §6 gelöscht.`,
      ``,
      `(3) Die Frist beginnt mit dem Tag der Unterzeichnung dieses Vertrages durch den Auftraggeber.`,
    ].join("\n"),

    // ──────────────────────────────────────────────
    // §11 (vorher §12) GEISTIGES EIGENTUM
    // ──────────────────────────────────────────────
    geistiges_eigentum: [
      `§11 Geistiges Eigentum und Urheberrecht`,
      ``,
      `(1) Alle Inhalte, Programme, Trainingskonzepte, Algorithmen und Systeme der Plattform sind urheberrechtlich geschützt und verbleiben im alleinigen Eigentum des Auftragnehmers.`,
      ``,
      `(2) Der Auftraggeber erhält für die Dauer des Vertrages ein einfaches, nicht übertragbares, nicht unterlizenzierbares Nutzungsrecht an der BGF-Plattform im vereinbarten Umfang.`,
      ``,
      `(3) Eine Vervielfältigung, Weitergabe, Veröffentlichung oder Nutzung der Plattform-Inhalte außerhalb dieses Vertrages ist ohne ausdrückliche schriftliche Zustimmung des Auftragnehmers untersagt.`,
    ].join("\n"),

    // ──────────────────────────────────────────────
    // §12 (vorher §13) ABWERBEVERBOT
    // ──────────────────────────────────────────────
    abwerbeverbot: [
      `§12 Abwerbeverbot`,
      ``,
      `(1) Der Auftraggeber verpflichtet sich, während der Vertragslaufzeit sowie für einen Zeitraum von 12 Monaten nach Beendigung des Vertrages keine Mitarbeitenden oder freien Mitarbeiter des Auftragnehmers abzuwerben oder deren Abwerbung zu veranlassen.`,
      ``,
      `(2) Bei einem schuldhaften Verstoß gegen das Abwerbeverbot ist der Auftraggeber verpflichtet, eine Vertragsstrafe in Höhe von 10.000,00 € (zehntausend Euro) je Verstoß an den Auftragnehmer zu zahlen. Die Geltendmachung eines darüber hinausgehenden Schadens bleibt vorbehalten.`,
    ].join("\n"),

    // ──────────────────────────────────────────────
    // §13 SCHLUSSBESTIMMUNGEN
    // ──────────────────────────────────────────────
    schlussbestimmungen: [
      `§13 Schlussbestimmungen`,
      ``,
      `(1) Änderungen und Ergänzungen dieses Vertrages bedürfen der Schriftform (E-Mail ausreichend). Dies gilt auch für die Aufhebung dieser Schriftformklausel.`,
      ``,
      `(2) Sollten einzelne Bestimmungen dieses Vertrages unwirksam oder undurchführbar sein oder werden, so wird hierdurch die Wirksamkeit der übrigen Bestimmungen nicht berührt. An die Stelle der unwirksamen Bestimmung tritt eine Regelung, die dem wirtschaftlichen Zweck der unwirksamen Bestimmung am nächsten kommt.`,
      ``,
      `(3) Es gilt das Recht der Bundesrepublik Deutschland. Gerichtsstand für alle Streitigkeiten aus und im Zusammenhang mit diesem Vertrag ist der Sitz des Auftragnehmers, sofern der Auftraggeber Kaufmann, juristische Person des öffentlichen Rechts oder öffentlich-rechtliches Sondervermögen ist.`,
      ``,
      `(4) Dieser Vertrag wird in elektronischer Form geschlossen. Beide Vertragsparteien erkennen die Wirksamkeit der digitalen Unterschrift gemäß § 126a BGB an.`,
      ``,
      `(5) Nebenabreden, die nicht in diesem Vertrag enthalten sind, bestehen nicht. Mündliche Nebenabreden sind unwirksam.`,
    ].join("\n"),
  }
}
