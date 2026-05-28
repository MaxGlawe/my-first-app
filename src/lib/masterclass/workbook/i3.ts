import type { WorkbookData } from "./types";

/**
 * Workbook-Daten — Lektion I.3 „Der Red-Flag-Selbstcheck" (Pilot).
 *
 * Wortlaut 1:1 aus `workbook-chronischer-kreuzschmerz-MASTER.md`
 * (Sektion „Lektion I.3"). HWG-konform: Orientierung, keine Diagnose.
 * Typografische Anführungszeichen — kein ASCII-".
 */
export const WORKBOOK_I3: WorkbookData = {
  lessonId: "I.3",
  nr: "I.3",
  sectionLabel: "Intro · Ankommen & Spielregeln",
  title: "Der Red-Flag-Selbstcheck",
  subtitle:
    "Ein Sicherheitsfilter, bevor du mit der Masterclass beginnst — kein ärztliches Diagnostik-Tool.",
  meta: {
    audio: "Audio-Dauer: 11–13 Min",
    lese: "Lese-Zeit Workbook: 25–30 Min",
    uebung: "mit Übung I.3",
  },

  objectives: [
    "die wichtigsten Red Flags beim chronischen Kreuzschmerz kennen und an dir selbst überprüfen können,",
    "den Unterschied zwischen Red Flags (Warnsignale für spezifische Pathologien) und Yellow Flags (Risikofaktoren für Chronifizierung) verstehen,",
    "wissen, wann sofort, wann zeitnah, wann routinemäßig ärztlich abgeklärt werden sollte,",
    "nach Abschluss der Übung eine begründete Entscheidung haben, ob diese Masterclass für deine Selbstanwendung geeignet ist – oder ob zuerst eine ärztliche Abklärung sinnvoller ist,",
    "den Stellenwert ärztlicher Abklärung im Kontext einer ansonsten konservativen Behandlung sicher einordnen können.",
  ],

  content: [
    {
      kind: "heading",
      eyebrow: "Grundlage",
      text: "Was sind Red Flags — und warum sind sie wichtig?",
    },
    {
      kind: "lead",
      text: "In der medizinischen Diagnostik bezeichnet der Begriff Red Flags Warnsignale, die auf eine spezifische, behandlungsbedürftige Ursache des Schmerzes hinweisen.",
    },
    {
      kind: "paragraph",
      text: "Bei den allermeisten Menschen mit chronischem Kreuzschmerz (etwa 85–90 %) liegt keine solche spezifische Ursache vor – aber bei den verbleibenden 10–15 % ist sie da, und sie kann ernst sein. Tumoren, Frakturen, Infektionen, entzündlich-rheumatische Erkrankungen, schwere neurologische Komplikationen wie das Cauda-equina-Syndrom – diese Konstellationen gehören nicht in die Selbstbehandlung.",
    },
    {
      kind: "paragraph",
      text: "Die gute Nachricht: Red Flags lassen sich mit einer überschaubaren Symptom-Liste gut screenen. Du musst kein Arzt sein, um die Hauptkonstellationen zu erkennen – du musst nur die Liste durchgehen.",
    },
    {
      kind: "paragraph",
      text: "Die wichtige Erinnerung: Ein negatives Red-Flag-Screening macht weiteren ärztlichen Kontakt nicht überflüssig. Es ist eine Voraussetzung für sinnvolle Selbstanwendung, kein Ersatz für eine Vorab-Abklärung deiner Beschwerden insgesamt.",
    },
    {
      kind: "vertiefung",
      title: "Die klinische Realität der Red Flags",
      body: [
        "Die Trefferquote einzelner Red Flags ist – und das ist eine Subtilität, die in vielen populären Darstellungen verloren geht – nicht hoch. Studien (Henschke 2009, Downie 2013, Cochrane Review) zeigen, dass die meisten einzelnen Warnsignale eine niedrige positive prädiktive Wahrscheinlichkeit haben – das heißt: wenn ein Red Flag positiv ist, heißt das nicht automatisch, dass eine ernste Pathologie vorliegt. Allerdings ist die negative prädiktive Wahrscheinlichkeit hoch – wenn alle Red Flags negativ sind, ist eine ernste Pathologie sehr unwahrscheinlich.",
        "Praktisch heißt das: Diese Liste ist als Filter konzipiert, nicht als Diagnose. Wenn du Red Flags bei dir findest, brauchst du eine ärztliche Einschätzung – nicht weil sicher etwas Ernstes vorliegt, sondern weil zur Sicherheit weiter abgeklärt werden muss. Die ärztliche Abklärung wird in den meisten Fällen Entwarnung geben können.",
      ],
    },

    {
      kind: "heading",
      eyebrow: "Die fünf Gruppen",
      text: "Die wichtigsten Red-Flag-Gruppen",
    },
    {
      kind: "paragraph",
      text: "Wir gehen die wichtigsten Symptomgruppen durch. Pro Gruppe: das Warnsignal, der dahinter vermutete Mechanismus, und die Dringlichkeit der Abklärung.",
    },
    {
      kind: "flagGroup",
      n: 1,
      title: "Neurologische Warnsignale",
      intro:
        "Diese sind die zeitkritischsten. Bei klassischen Cauda-equina-Symptomen ist die Versorgungsdringlichkeit innerhalb von Stunden – nicht Tagen.",
      tone: "sofort",
      signals: [
        {
          code: "1.1",
          name: "Reithosenanästhesie",
          text: "Taubheitsgefühl oder Sensibilitätsminderung im Bereich, der beim Sitzen auf einem Pferd Kontakt zum Sattel hätte: Innenseiten der Oberschenkel, Damm, Anal- und Genitalregion. Möglicher Hinweis auf eine Cauda-equina-Kompression – ein neurologischer Notfall.",
        },
        {
          code: "1.2",
          name: "Blasen- oder Mastdarmstörungen",
          text: "Neu auftretende Probleme beim Wasserlassen (besonders: Restharngefühl, Inkontinenz oder akute Harnverhaltung) oder bei der Stuhlkontrolle. Im Zusammenhang mit Rückenschmerz immer ernst zu nehmen.",
        },
        {
          code: "1.3",
          name: "Sexuelle Funktionsstörungen, neu aufgetreten",
          text: "Neu aufgetretene Erektionsstörungen bei Männern, Sensibilitätsstörungen im Genitalbereich bei beiden Geschlechtern – im zeitlichen Zusammenhang mit Rückenbeschwerden.",
        },
        {
          code: "1.4",
          name: "Fortschreitende muskuläre Schwäche im Bein",
          text: "Progrediente Lähmungserscheinungen in einem oder beiden Beinen – etwa nicht mehr auf den Zehen oder Fersen stehen können, das Bein nicht mehr heben können, häufiges Stolpern oder Fallen.",
        },
        {
          code: "1.5",
          name: "Bilaterale Beinsymptomatik",
          text: "Schmerzen, Taubheit oder Schwäche in beiden Beinen – ein Hinweis auf eine zentrale Schädigung im Wirbelkanal.",
        },
      ],
      dringlichkeit:
        "Sofort – Notaufnahme oder ärztlicher Bereitschaftsdienst, nicht später als am selben Tag.",
    },
    {
      kind: "flagGroup",
      n: 2,
      title: "Hinweise auf eine maligne (tumoröse) Ursache",
      tone: "zeitnah",
      signals: [
        {
          code: "2.1",
          name: "Ungewollter Gewichtsverlust",
          text: "Mehr als 5 kg in 3 Monaten ohne erklärbare Ursache (Diät, Stress, Aktivitätsänderung).",
        },
        {
          code: "2.2",
          name: "Tumoranamnese",
          text: "Bekannte Tumorerkrankung in der Vorgeschichte – auch wenn sie als geheilt gilt.",
        },
        {
          code: "2.3",
          name: "Lebensalter > 50 Jahre bei erstem Auftreten",
          text: "Erstmaliger Kreuzschmerz nach dem 50. Lebensjahr ohne plausiblen Auslöser sollte sorgfältiger abgeklärt werden als bei jüngeren Patienten.",
        },
        {
          code: "2.4",
          name: "Schmerz, der nachts schlimmer wird",
          text: "Charakteristisch: Schmerz, der einen aus dem Schlaf reißt und sich nicht durch Positionswechsel verbessert. (Achtung: Schmerz beim Aufstehen morgens ist ein anderes Phänomen und meist harmlos.)",
        },
        {
          code: "2.5",
          name: "Schmerz, der durch keine Position oder Bewegung gelindert wird",
          text: "Mechanischer Schmerz lässt sich in der Regel durch Positionswechsel modulieren. Schmerz, der unabhängig von Position oder Aktivität ist, gehört genauer abgeklärt.",
        },
      ],
      dringlichkeit:
        "Zeitnah – innerhalb von ein bis zwei Wochen, hausärztliche Vorstellung.",
    },
    {
      kind: "flagGroup",
      n: 3,
      title: "Hinweise auf eine Infektion",
      tone: "zeitnah",
      signals: [
        { code: "3.1", name: "Fieber, Schüttelfrost", text: "Im Zusammenhang mit Rückenschmerz." },
        {
          code: "3.2",
          name: "Immunsuppression",
          text: "Cortisontherapie, Chemotherapie, HIV-Infektion, anderer Immundefekt.",
        },
        {
          code: "3.3",
          name: "Intravenöser Drogenkonsum",
          text: "Erhöht das Risiko bakterieller Spondylodiscitis erheblich.",
        },
        {
          code: "3.4",
          name: "Vor Kurzem durchgemachte bakterielle Infektion",
          text: "Insbesondere Harnwegs-, Haut- oder Atemwegsinfektion in den letzten 4–6 Wochen.",
        },
        {
          code: "3.5",
          name: "Schwellung, Rötung, Überwärmung im Rückenbereich",
          text: "Eher selten, aber spezifisch.",
        },
      ],
      dringlichkeit:
        "Zeitnah bis sofort, abhängig vom Schweregrad. Bei Fieber + zunehmenden Beschwerden: sofortige Vorstellung.",
    },
    {
      kind: "flagGroup",
      n: 4,
      title: "Hinweise auf eine Fraktur",
      tone: "zeitnah",
      signals: [
        {
          code: "4.1",
          name: "Bekanntes Trauma",
          text: "Sturz, Verkehrsunfall, Heberunfall – auch wenn er Wochen zurückliegt.",
        },
        {
          code: "4.2",
          name: "Osteoporose oder Steroidtherapie",
          text: "Erhöhtes Frakturrisiko, auch bei Bagatell-Belastungen.",
        },
        {
          code: "4.3",
          name: "Lebensalter > 70 Jahre",
          text: "Erhöhtes Risiko osteoporotischer Sinterungsfrakturen.",
        },
        {
          code: "4.4",
          name: "Akute Verstärkung des Schmerzes nach Bagatell-Trauma",
          text: "(Heben einer leichten Tasche, falsche Drehung beim Aufstehen.)",
        },
      ],
      dringlichkeit:
        "Zeitnah – innerhalb von Tagen, hausärztliche oder orthopädische Vorstellung.",
    },
    {
      kind: "flagGroup",
      n: 5,
      title: "Hinweise auf eine entzündlich-rheumatische Ursache",
      intro:
        "Diese Gruppe ist weniger zeitkritisch, aber wichtig für die längerfristige Versorgung.",
      tone: "rheuma",
      signals: [
        {
          code: "5.1",
          name: "Morgensteifigkeit > 30 Minuten",
          text: "Anhaltende Steifigkeit der Lendenwirbelsäule am Morgen, die durch Bewegung besser wird.",
        },
        {
          code: "5.2",
          name: "Schmerzverbesserung durch Bewegung, Schmerzverschlechterung durch Ruhe",
          text: "Charakteristisch für entzündliche Wirbelsäulenerkrankungen (z. B. axiale Spondyloarthritis).",
        },
        {
          code: "5.3",
          name: "Nachtschmerz in der zweiten Nachthälfte",
          text: "Typisch entzündliches Muster, anders als der unspezifische nächtliche Schmerz.",
        },
        {
          code: "5.4",
          name: "Alter unter 45 bei Schmerzbeginn, schleichender Beginn",
          text: "Charakteristik der axialen Spondyloarthritis.",
        },
        {
          code: "5.5",
          name: "Begleitsymptome",
          text: "Augenentzündungen (Iritis), Hauterscheinungen (Psoriasis), Darmprobleme (chronisch-entzündliche Darmerkrankungen), Gelenkbeschwerden in anderen Körperregionen.",
        },
      ],
      dringlichkeit:
        "Routinemäßig zeitnah – innerhalb einiger Wochen rheumatologische Vorstellung in Erwägung ziehen.",
    },

    {
      kind: "heading",
      eyebrow: "Das andere Warnsystem",
      text: "Yellow Flags",
    },
    {
      kind: "yellowFlags",
      intro:
        "Während Red Flags auf spezifische Pathologien hinweisen, beschreiben Yellow Flags psychosoziale Risikofaktoren für die Chronifizierung von Schmerz oder für einen schwierigen Verlauf. Sie sind keine Kontraindikation gegen Selbstanwendung – im Gegenteil, sie weisen oft darauf hin, dass Patientenedukation und Selbstmanagement-Werkzeuge besonders sinnvoll sind. Aber sie sind ein Hinweis, dass professionelle Begleitung (Schmerzpsychologie, multimodale Schmerztherapie) zusätzlich hilfreich sein kann.",
      rows: [
        { area: "Kognitiv", sign: "Katastrophisierende Schmerzgedanken („Es wird nie besser“)" },
        { area: "Emotional", sign: "Anhaltende Niedergeschlagenheit, Hoffnungslosigkeit" },
        { area: "Verhalten", sign: "Ausgeprägtes Vermeidungsverhalten gegenüber Bewegung" },
        { area: "Sozial", sign: "Sozialer Rückzug, Isolation" },
        { area: "Arbeit", sign: "Unzufriedenheit am Arbeitsplatz, Konflikte, Rentenwunsch" },
        { area: "Lebensqualität", sign: "Schlafstörungen, sexuelle Probleme im Zusammenhang mit Schmerz" },
        { area: "Iatrogen", sign: "Ablehnung aktiver Bewegungstherapien, Vertrauen nur auf passive Maßnahmen" },
      ],
      outro:
        "Yellow Flags sind kein „Schwäche-Zeichen“. Sie sind Hinweise auf eine besondere Risikokonstellation, die mit den richtigen Werkzeugen gut bearbeitet werden kann. Modul 2 (insbesondere Lektion 2.7 zu Schmerz-Coping) und Modul 3 widmen sich diesen Faktoren ausführlich.",
    },

    {
      kind: "heading",
      eyebrow: "Im Idealfall",
      text: "Was passiert bei einer ärztlichen Abklärung?",
    },
    {
      kind: "paragraph",
      text: "Falls du in der gleich folgenden Übung Red Flags bei dir findest – oder wenn du die Masterclass beginnst, ohne dass dein chronischer Schmerz je systematisch ärztlich evaluiert wurde – hier eine kurze Skizze, was eine sinnvolle Abklärung umfasst:",
    },
    {
      kind: "abklaerung",
      steps: [
        {
          title: "Klinische Anamnese",
          text: "Genaue Schmerzgeschichte (Beginn, Verlauf, Auslöser, Begleitsymptome, Vorbehandlung), allgemeine Anamnese (Vorerkrankungen, Medikamente, Lebensstil), gezielte Red-Flag-Anamnese.",
        },
        {
          title: "Körperliche Untersuchung",
          text: "Inspektion (Haltung, Asymmetrien, Hautveränderungen), aktive und passive Beweglichkeit, neurologische Untersuchung (Reflexe, Sensibilität, Kraft), spezifische Tests (Lasègue, ISG-Provokation, etc.).",
        },
        {
          title: "Gezielte Diagnostik (nur bei Hinweisen, nicht routinemäßig)",
          text: "Laboruntersuchungen (Entzündungswerte, ggf. Tumormarker), Bildgebung (Röntgen, MRT, CT) nur bei klinischer Notwendigkeit. Routinemäßiges MRT bei unspezifischem Kreuzschmerz wird von allen aktuellen Leitlinien explizit nicht empfohlen, da es oft mehr verunsichert als hilft.",
        },
        {
          title: "Therapieempfehlung",
          text: "In den allermeisten Fällen wird die ärztliche Empfehlung sein: konservative, aktive Therapie – Bewegung, Edukation, Selbstmanagement. Also genau das, was diese Masterclass aufbaut.",
        },
      ],
    },
    {
      kind: "vignette",
      title: "Aus der Praxis — Das überflüssige MRT",
      body: [
        "Eine Patientin kam mit chronischem unspezifischem Kreuzschmerz, der nach unauffälliger Hausarzt-Untersuchung empirisch erst einmal aktiv-konservativ behandelt werden sollte. Sie war damit nicht zufrieden und ließ sich auf eigene Kosten ein MRT machen. Das MRT zeigte unspektakuläre altersentsprechende Veränderungen – Protrusionen L4/L5 und L5/S1, leichte Facettenarthrose, Bandscheibendegeneration. Im Bericht las sie: „Multietagäre degenerative Veränderungen mit Bandscheibenprotrusionen.“",
        "Ihre Schmerzintensität verdoppelte sich in den folgenden zwei Wochen. Nicht weil sich strukturell etwas geändert hatte. Sondern weil die Sprache des Befundes sich in ihrem Kopf festgesetzt hatte. „Mehrere kaputte Bandscheiben. Ich bin doch erst 47.“",
        "Es dauerte einige Termine, ihr klar zu machen, dass dieser Befund bei statistisch praktisch jedem 47-Jährigen identisch wäre – und dass die Bildgebung mehr Sprach-Schaden angerichtet hatte als diagnostischen Nutzen geliefert.",
      ],
    },
  ],

  exercise: {
    kind: "redflag-selfcheck",
    title: "Mein Red-Flag-Selbstcheck",
    timing:
      "Geschätzte Bearbeitungszeit: 10–15 Minuten · Bitte ehrlich und gründlich ausfüllen, bevor du Modul 1 beginnst.",
    anleitung: [
      "Gehe die fünf Gruppen durch und kreuze für jedes Symptom an, ob es bei dir vorliegt – auch wenn es nur ansatzweise oder gelegentlich auftritt. Antworte für den Zeitraum innerhalb der letzten sechs Monate. Im Zweifel kreuze Ja an – falsch-positive Antworten führen nur zu einem ärztlichen Termin (gut investierte Zeit), falsch-negative können bedeuten, dass etwas Wichtiges übersehen wird.",
      "Während du ankreuzt, läuft rechts (auf dem Handy unten) eine Auswertung mit, die dir einen klaren Handlungspfad zeigt. Nichts davon ist eine Diagnose – es ist eine Orientierung.",
    ],
    groups: [
      {
        key: "Gruppe 1",
        title: "Neurologische Warnsignale",
        caption: "zeitkritisch",
        urgency: "sofort",
        triggerCount: 1,
        intro:
          "Die zeitkritischste Gruppe. Schon ein einziges Ja bedeutet: sofortige ärztliche Vorstellung.",
        dringlichkeit:
          "Sofort – Notaufnahme oder ärztlicher Bereitschaftsdienst, nicht später als am selben Tag.",
        items: [
          {
            id: "1.1",
            label:
              "Taubheit/Sensibilitätsminderung im Reithosenbereich (Innenseite Oberschenkel, Damm, Genital-/Analregion)",
          },
          {
            id: "1.2",
            label:
              "Neu aufgetretene Probleme beim Wasserlassen (Inkontinenz, Restharngefühl, Harnverhaltung)",
          },
          { id: "1.3", label: "Neu aufgetretene Probleme bei der Stuhlkontrolle" },
          {
            id: "1.4",
            label:
              "Neu aufgetretene Sexualfunktions-Störungen (Erektionsstörung, genitale Taubheit) im zeitlichen Zusammenhang mit dem Rückenschmerz",
          },
          {
            id: "1.5",
            label:
              "Fortschreitende Schwäche in einem oder beiden Beinen (Zehenstand/Fersenstand nicht mehr möglich, Stolpern, Bein-Heben schwer)",
          },
          { id: "1.6", label: "Schmerzen, Taubheit oder Schwäche in beiden Beinen gleichzeitig" },
        ],
      },
      {
        key: "Gruppe 2",
        title: "Hinweise auf eine maligne Ursache",
        caption: "Tumor",
        urgency: "zeitnah",
        triggerCount: 1,
        dringlichkeit:
          "Zeitnah – innerhalb von ein bis zwei Wochen, hausärztliche Vorstellung.",
        items: [
          { id: "2.1", label: "Ungewollter Gewichtsverlust über 5 kg in den letzten 3 Monaten" },
          { id: "2.2", label: "Bekannte Tumorerkrankung in der Vorgeschichte (auch wenn geheilt)" },
          {
            id: "2.3",
            label: "Erstmaliger Kreuzschmerz nach dem 50. Lebensjahr ohne plausiblen Auslöser",
          },
          {
            id: "2.4",
            label:
              "Schmerz, der dich nachts aus dem Schlaf reißt und sich durch Positionswechsel nicht verbessert",
          },
          { id: "2.5", label: "Schmerz, der unabhängig von Position oder Aktivität konstant bleibt" },
        ],
      },
      {
        key: "Gruppe 3",
        title: "Hinweise auf eine Infektion",
        caption: "Infektion",
        urgency: "zeitnah",
        triggerCount: 1,
        dringlichkeit:
          "Zeitnah bis sofort, abhängig vom Schweregrad. Bei Fieber + zunehmenden Beschwerden: sofortige Vorstellung.",
        items: [
          { id: "3.1", label: "Fieber oder Schüttelfrost im Zusammenhang mit dem Rückenschmerz" },
          {
            id: "3.2",
            label:
              "Aktuelle Immunsuppression (Cortison-Langzeittherapie, Chemotherapie, HIV, anderer Immundefekt)",
          },
          { id: "3.3", label: "Intravenöser Drogenkonsum" },
          { id: "3.4", label: "Bakterielle Infektion in den letzten 4–6 Wochen (Harnweg, Haut, Atemweg)" },
          { id: "3.5", label: "Schwellung, Rötung oder Überwärmung im Rückenbereich" },
        ],
      },
      {
        key: "Gruppe 4",
        title: "Hinweise auf eine Fraktur",
        caption: "Fraktur",
        urgency: "zeitnah",
        triggerCount: 1,
        dringlichkeit:
          "Zeitnah – innerhalb von Tagen, hausärztliche oder orthopädische Vorstellung.",
        items: [
          { id: "4.1", label: "Bekanntes Trauma (Sturz, Unfall, Heberunfall) im zeitlichen Zusammenhang" },
          { id: "4.2", label: "Bekannte Osteoporose oder Cortison-Langzeittherapie" },
          { id: "4.3", label: "Lebensalter über 70 Jahre" },
          {
            id: "4.4",
            label:
              "Akute Schmerzverstärkung nach Bagatell-Belastung (leichte Tasche heben, beim Aufstehen verdreht)",
          },
        ],
      },
      {
        key: "Gruppe 5",
        title: "Hinweise auf eine entzündlich-rheumatische Ursache",
        caption: "rheumatisch · ab 2 Treffern",
        urgency: "rheuma",
        triggerCount: 2,
        intro:
          "Weniger zeitkritisch, aber wichtig für die längerfristige Versorgung. Erst ab zwei Ja gibt diese Gruppe eine Empfehlung.",
        dringlichkeit:
          "Routinemäßig zeitnah – innerhalb einiger Wochen rheumatologische Vorstellung in Erwägung ziehen.",
        items: [
          {
            id: "5.1",
            label:
              "Morgensteifigkeit der Lendenwirbelsäule länger als 30 Minuten, die durch Bewegung besser wird",
          },
          { id: "5.2", label: "Schmerzverbesserung durch Bewegung, Schmerzverschlechterung durch Ruhe" },
          { id: "5.3", label: "Nachtschmerz typischerweise in der zweiten Nachthälfte" },
          { id: "5.4", label: "Schmerzbeginn vor dem 45. Lebensjahr, schleichend einsetzend" },
          {
            id: "5.5",
            label:
              "Begleitsymptome: Augenentzündungen, Psoriasis, chronische Darmprobleme, Gelenkbeschwerden anderer Lokalisation",
          },
        ],
      },
    ],
    outcomes: [
      {
        level: "sofort",
        heading: "Sofortige ärztliche Vorstellung",
        body: "Mindestens ein Ja in Gruppe 1 (Neurologie): Notaufnahme oder ärztlicher Bereitschaftsdienst, noch am gleichen Tag. Selbstanwendung der Masterclass: pausieren, bis ärztliche Klärung erfolgt ist.",
      },
      {
        level: "zeitnah",
        heading: "Zeitnahe ärztliche Vorstellung – innerhalb der nächsten 1–7 Tage",
        body: "Mindestens ein Ja in Gruppe 2, 3 oder 4 (Tumor, Infektion, Fraktur): Hausarzt, ggf. mit Empfehlung zur fachärztlichen Weiterleitung. Selbstanwendung: pausieren oder sehr zurückhaltend (nur sanfte Mobilisation, keine belastenden Übungen), bis ärztliche Klärung erfolgt ist.",
      },
      {
        level: "rheuma",
        heading: "Hausärztliche Vorstellung innerhalb der nächsten 2–4 Wochen",
        body: "Mindestens zwei Ja in Gruppe 5 (entzündlich-rheumatisch): mit Bitte um Klärung einer möglichen entzündlich-rheumatischen Erkrankung (rheumatologische Vorstellung erwägen). Selbstanwendung der Masterclass kann parallel beginnen – aber bitte informiere den behandelnden Arzt darüber.",
      },
      {
        level: "ok",
        heading: "Du kannst mit der Masterclass beginnen",
        body: "Alle Antworten Nein – oder einzelne Yellow-Flag-nahe Konstellationen ohne Red-Flag-Cluster. Auch in diesem Fall ist eine einmalige ärztliche Vorab-Abklärung sinnvoll, falls du seit längerem mit chronischem Kreuzschmerz lebst und noch keine strukturierte Befundung hattest. Eine Hausarzt-Konsultation mit dem expliziten Auftrag „Bitte einmal Red Flags ausschließen, ich möchte ein konservatives Selbstanwendungs-Programm beginnen“ reicht in den meisten Fällen.",
      },
    ],
    reflection: [
      {
        id: "fazit",
        label: "Welches Fazit ziehe ich aus diesem Selbstcheck?",
        rows: 6,
      },
      {
        id: "termin",
        label: "Wenn ärztliche Abklärung empfohlen: Wann hole ich mir den Termin? Bei wem?",
        rows: 4,
      },
    ],
    reflectionNote:
      "Diese Selbstüberprüfung ist eine Momentaufnahme. Wenn sich deine Symptomatik im Laufe der Zeit verändert – insbesondere wenn neurologische Symptome (Gruppe 1) neu auftreten – ist eine erneute Durchsicht und ärztliche Vorstellung indiziert.",
  },

  einordnung: {
    intro:
      "Dieser Selbstcheck ist ein Sicherheitsfilter, kein ärztliches Diagnostik-Tool. Er reduziert das Risiko, dass du eine spezifische behandlungsbedürftige Ursache übersiehst und stattdessen monatelang konservativ selbst arbeitest, während eine echte Pathologie unbehandelt fortschreitet. Bei sauberer Anwendung der Liste ist dieses Risiko sehr gering.",
    nichtLeistet: [
      "Er ersetzt keine vollständige ärztliche Anamnese und körperliche Untersuchung.",
      "Er liefert keine Diagnose.",
      "Er gewichtet die einzelnen Symptome nicht (jedes Ja in Gruppe 1 ist gravierender als jedes Ja in Gruppe 5).",
      "Er ist nicht statisch: Was heute negativ ist, kann in einem halben Jahr positiv werden. Bei neuen Symptomen: neu überprüfen.",
    ],
    sehrWohlLeistet: [
      "Er sortiert dich in einen der drei Versorgungswege ein: sofortige Notfall-Versorgung, zeitnahe Abklärung, konservative Selbstanwendung.",
      "Er macht dich zur informierten Selbst-Beobachterin / zum informierten Selbst-Beobachter deiner eigenen Symptomatik.",
      "Er gibt dir Sprache für ein ärztliches Gespräch: Wenn du sagst „Ich habe einen Red-Flag-Selbstcheck gemacht und Gruppe 4, Frage 4.2 positiv“, dann wirst du in der Sprechstunde anders gehört als mit einer vagen Beschwerde.",
    ],
  },

  letzteBemerkung: {
    title: "Eine letzte wichtige Bemerkung",
    body: [
      "Selbst nach einem makellosen Red-Flag-Selbstcheck und nach erfolgreicher Vorab-Abklärung kann es vorkommen, dass im Laufe der Anwendung dieser Masterclass etwas Neues auftaucht. Eine plötzliche neurologische Auffälligkeit. Ein Bauchgefühl, dass etwas anders ist als sonst. Eine Beschwerde, die sich neu anders anfühlt.",
      "In solchen Momenten gilt der Grundsatz der erneuten Selbstprüfung: Geh den Red-Flag-Selbstcheck noch einmal durch. Wenn etwas anders ist als beim letzten Mal – hol dir ärztliche Einschätzung. Das ist nicht übervorsichtig. Das ist Schmerzkompetenz: Selbstwirksamkeit inklusive der Bereitschaft, Hilfe zu holen, wenn das System die Grenzen der Selbstanwendung erreicht.",
    ],
  },

  zusammenfassung: [
    "Red Flags sind Warnsignale für spezifische behandlungsbedürftige Ursachen des Kreuzschmerzes. In 85–90 % aller chronischen Fälle sind sie negativ – aber in 10–15 % nicht, und diese Fälle gehören in ärztliche Hand.",
    "Die fünf Gruppen (Neurologie, Tumor, Infektion, Fraktur, Entzündlich-rheumatisch) decken den klinisch relevanten Bereich gut ab.",
    "Gruppe 1 (Neurologie) ist zeitkritisch – jedes Ja dort bedeutet sofortige ärztliche Vorstellung.",
    "Yellow Flags sind keine Kontraindikation gegen Selbstanwendung, aber Hinweise auf eine besondere Risikokonstellation, in der zusätzliche professionelle Begleitung sinnvoll sein kann.",
    "Auch bei negativem Selbstcheck ist eine einmalige ärztliche Vorab-Abklärung empfehlenswert, sofern du seit längerem mit chronischem Schmerz lebst und noch keine strukturierte Befundung hattest.",
  ],

  querverweise: [
    {
      label: "Lektion 1.4",
      text: "behandelt das MRT-Paradox und gibt dir die Werkzeuge, einen Bildgebungsbefund nicht ängstigend, sondern einordnend zu lesen.",
    },
    {
      label: "Lektion 2.7",
      text: "behandelt Yellow-Flag-Themen (Katastrophisierung, Vermeidungsverhalten) systematisch und gibt konkrete Coping-Werkzeuge.",
    },
    {
      label: "Anhang: Notfall-Karte",
      text: "(heraustrennbar) enthält die Red-Flag-Gruppe-1-Symptome als Wallet-fähige Kurzversion für den schnellen Zugriff.",
    },
  ],

  notizfeld: {
    id: "notizen",
    label: "Notizfeld",
    helper:
      "Eigene Gedanken zur Abklärung deiner Situation. Welche ärztliche Erstanlaufstelle ist für dich realistisch? Welche Symptome willst du im Auge behalten? Welche Fragen stellst du beim nächsten Termin?",
    rows: 10,
  },
};
