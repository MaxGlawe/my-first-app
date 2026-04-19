export interface Beschwerde {
  slug: string
  name: string
  metaTitle: string
  metaDescription: string
  heroTitle: string
  heroSubtitle: string
  symptoms: string[]
  howWeHelp: string[]
  treatmentSteps: { title: string; description: string }[]
  faq: { question: string; answer: string }[]
  keywords: string[]
}

export const BESCHWERDEN: Beschwerde[] = [
  {
    slug: "rueckenschmerzen",
    name: "Rückenschmerzen",
    metaTitle: "Online Physiotherapie bei Rückenschmerzen",
    metaDescription:
      "Rückenschmerzen effektiv behandeln — per Video-Physiotherapie. Individuelle Übungen, Schmerzanalyse und persönliche Betreuung durch Heilpraktiker. Jetzt starten.",
    heroTitle: "Rückenschmerzen gezielt behandeln — online",
    heroSubtitle:
      "Über 80% der Deutschen leiden mindestens einmal im Leben an Rückenschmerzen. Mit gezielter Physiotherapie per Video helfen wir Ihnen, Schmerzen zu lindern und langfristig vorzubeugen.",
    symptoms: [
      "Schmerzen im unteren Rücken (LWS-Syndrom)",
      "Verspannungen im oberen Rücken und Schulterbereich",
      "Ausstrahlende Schmerzen in Gesäß oder Beine",
      "Morgensteifigkeit und eingeschränkte Beweglichkeit",
      "Schmerzen beim Sitzen, Stehen oder Heben",
      "Wiederkehrende Blockaden und Hexenschuss",
    ],
    howWeHelp: [
      "Individuelle Befunderhebung per Video zur Identifikation der Schmerzursache",
      "Gezielte Mobilisations- und Stabilisationsübungen für die Wirbelsäule",
      "Progressiver Trainingsplan mit Video-Anleitungen für zu Hause",
      "Haltungskorrektur und ergonomische Beratung für den Alltag",
      "Schmerztagebuch zur Dokumentation des Therapiefortschritts",
    ],
    treatmentSteps: [
      { title: "Befunderhebung", description: "Ausführliche Anamnese und Bewegungsanalyse per Video. Wir identifizieren die Ursache Ihrer Rückenschmerzen." },
      { title: "Therapieplan", description: "Individueller Trainingsplan mit gezielten Übungen für Ihre spezifische Problematik — direkt in der App." },
      { title: "Aktive Therapie", description: "Regelmäßige Video-Sitzungen mit Ihrem Therapeuten und tägliches Training nach Plan." },
      { title: "Verlaufskontrolle", description: "Schmerztagebuch und regelmäßige Anpassung des Trainingsplans basierend auf Ihrem Fortschritt." },
    ],
    faq: [
      { question: "Kann Physiotherapie bei Rückenschmerzen online funktionieren?", answer: "Ja, zahlreiche Studien belegen die Wirksamkeit von Tele-Physiotherapie bei Rückenschmerzen. Durch die Video-Befunderhebung können wir Ihre Bewegungsmuster analysieren und gezielte Übungen anleiten — genauso effektiv wie vor Ort." },
      { question: "Wie schnell bessern sich meine Rückenschmerzen?", answer: "Die meisten Patienten spüren nach 2-3 Wochen konsequentem Training eine deutliche Verbesserung. Chronische Beschwerden benötigen oft 8-12 Wochen systematische Therapie." },
      { question: "Brauche ich spezielle Geräte für die Übungen?", answer: "Nein, die meisten Übungen arbeiten mit Ihrem eigenen Körpergewicht. Gelegentlich empfehlen wir ein Theraband oder eine Faszienrolle — beides günstig erhältlich." },
      { question: "Was kostet die Online-Physiotherapie bei Rückenschmerzen?", answer: "Die Video-Analyse (30 Min.) kostet 69€ und wird auf Ihre Behandlung angerechnet. Für chronische Rückenschmerzen bieten wir individuelle Behandlungspakete an — den passenden Umfang besprechen wir persönlich in der Analyse. Preise auf Anfrage." },
    ],
    keywords: ["Rückenschmerzen Physiotherapie", "Online Physiotherapie Rücken", "Rückenschmerzen Übungen", "LWS Syndrom Behandlung", "Rückenschmerzen online behandeln"],
  },
  {
    slug: "knieschmerzen",
    name: "Knieschmerzen",
    metaTitle: "Online Physiotherapie bei Knieschmerzen",
    metaDescription:
      "Knieschmerzen online behandeln lassen. Video-Physiotherapie mit Heilpraktiker — Übungen, Trainingsplan und Betreuung per App. Ohne Wartezeit starten.",
    heroTitle: "Knieschmerzen verstehen und behandeln — online",
    heroSubtitle:
      "Das Knie ist eines der am stärksten belasteten Gelenke. Mit gezielter Physiotherapie stärken wir die umgebende Muskulatur und verbessern Ihre Gelenkfunktion.",
    symptoms: [
      "Schmerzen beim Treppensteigen oder in die Hocke gehen",
      "Schwellung und Überwärmung des Kniegelenks",
      "Instabilitätsgefühl oder Wegknicken",
      "Knirschen oder Knacken bei Bewegung",
      "Schmerzen nach längerem Sitzen (Kinozeichen)",
      "Eingeschränkte Beuge- oder Streckfähigkeit",
    ],
    howWeHelp: [
      "Funktionelle Analyse der Beinachse und Bewegungsmuster per Video",
      "Gezieltes Aufbautraining für die kniestabilisierende Muskulatur",
      "Dehnübungen und Faszientraining für verkürzte Strukturen",
      "Belastungssteuerung und Trainingsanpassung nach Schmerzreaktion",
      "Beratung zu kniefreundlichem Sport und Alltagsverhalten",
    ],
    treatmentSteps: [
      { title: "Videoanalyse", description: "Wir analysieren Ihre Beinachse, Gangbild und Bewegungsmuster — direkt per Videocall." },
      { title: "Muskelaufbau", description: "Individuelle Kräftigungsübungen für Oberschenkel, Hüfte und Unterschenkel zur Kniestabilisation." },
      { title: "Progressives Training", description: "Schrittweise Steigerung der Belastung mit wöchentlicher Anpassung durch Ihren Therapeuten." },
      { title: "Rückkehr zum Alltag", description: "Begleitung zurück in Sport und Alltag mit angepasstem Langzeit-Trainingsprogramm." },
    ],
    faq: [
      { question: "Hilft Online-Physiotherapie auch bei Meniskusschäden?", answer: "Ja, bei konservativ behandelten Meniskusschäden ist Physiotherapie essentiell. Per Video können wir die Übungen präzise anleiten und den Trainingsfortschritt überwachen." },
      { question: "Ich habe Arthrose im Knie — kann mir Physiotherapie helfen?", answer: "Absolut. Bewegung ist die beste Medizin bei Kniearthrose. Wir erstellen einen schonenden Trainingsplan, der die Gelenkfunktion verbessert und Schmerzen lindert." },
      { question: "Wie oft sollte ich bei Knieschmerzen trainieren?", answer: "Wir empfehlen 3-5 kurze Trainingseinheiten pro Woche (15-20 Min.). Der Trainingsplan in der App erinnert Sie und dokumentiert Ihren Fortschritt." },
    ],
    keywords: ["Knieschmerzen Physiotherapie", "Knie Übungen online", "Knieschmerzen Behandlung", "Physiotherapie Knie online", "Kniearthrose Übungen"],
  },
  {
    slug: "schulterschmerzen",
    name: "Schulterschmerzen",
    metaTitle: "Online Physiotherapie bei Schulterschmerzen",
    metaDescription:
      "Schulterschmerzen online behandeln. Impingement, Frozen Shoulder, Rotatorenmanschette — Heilpraktiker-Behandlung per Video mit individuellem Trainingsplan.",
    heroTitle: "Schulterschmerzen effektiv behandeln — per Video",
    heroSubtitle:
      "Die Schulter ist das beweglichste Gelenk des Körpers — und dadurch besonders anfällig für Beschwerden. Wir behandeln die Ursache, nicht nur die Symptome.",
    symptoms: [
      "Schmerzen beim Heben des Arms über Kopf",
      "Nächtliche Schulterschmerzen beim Liegen",
      "Eingeschränkte Beweglichkeit (Frozen Shoulder)",
      "Schmerzen im Bereich der Rotatorenmanschette",
      "Impingement-Syndrom mit Einklemmungsgefühl",
      "Ausstrahlende Schmerzen in Oberarm oder Nacken",
    ],
    howWeHelp: [
      "Differenzierte Diagnostik per Video-Untersuchung",
      "Spezifische Übungen für die Rotatorenmanschette und Schulterblattmuskulatur",
      "Manuelle Mobilisationstechniken als Eigenübung angeleitet",
      "Progressive Belastungssteigerung nach individuellem Tempo",
      "Haltungsschulung zur Vorbeugung von Rezidiven",
    ],
    treatmentSteps: [
      { title: "Diagnostik", description: "Gezielte Schultertests per Video zur Eingrenzung der Ursache — Impingement, Instabilität oder Kapselreizung." },
      { title: "Schmerzlinderung", description: "Erste Übungen zur Schmerzreduktion und Wiederherstellung der Grundbeweglichkeit." },
      { title: "Kräftigung", description: "Aufbau der Schulterblatt- und Rotatorenmanschettenmuskulatur mit progressivem Training." },
      { title: "Prävention", description: "Langfristiges Übungsprogramm zur Vorbeugung erneuter Beschwerden." },
    ],
    faq: [
      { question: "Kann man Impingement online behandeln?", answer: "Ja, das Schulter-Impingement spricht sehr gut auf konservative Therapie an. Die Übungen können wir per Video präzise anleiten und kontrollieren." },
      { question: "Wie lange dauert die Behandlung bei Frozen Shoulder?", answer: "Eine Frozen Shoulder benötigt Geduld — typischerweise 3-6 Monate. Wir begleiten Sie über den gesamten Zeitraum mit angepasstem Training." },
      { question: "Brauche ich vorher eine MRT-Aufnahme?", answer: "Nicht zwingend. Durch unsere Video-Untersuchung können wir die meisten Schulterprobleme gut einordnen. Falls nötig, empfehlen wir weiterführende Diagnostik." },
    ],
    keywords: ["Schulterschmerzen Physiotherapie", "Impingement Behandlung online", "Frozen Shoulder Übungen", "Rotatorenmanschette Training", "Schulter Physiotherapie online"],
  },
  {
    slug: "nackenschmerzen",
    name: "Nackenschmerzen",
    metaTitle: "Online Physiotherapie bei Nackenschmerzen",
    metaDescription:
      "Nackenschmerzen und Verspannungen online behandeln. HWS-Syndrom, Spannungskopfschmerz, steifer Nacken — Heilpraktiker-Behandlung per Video.",
    heroTitle: "Nackenschmerzen und Verspannungen lösen — online",
    heroSubtitle:
      "Bildschirmarbeit, Stress und Fehlhaltungen — Nackenschmerzen sind eine Volkskrankheit. Mit gezielter Therapie lösen wir Verspannungen und beseitigen die Ursachen.",
    symptoms: [
      "Verspannungen und Steifigkeit im Nacken- und Schulterbereich",
      "Kopfschmerzen ausgehend vom Nacken (zervikogener Kopfschmerz)",
      "Eingeschränkte Kopfdrehung und Seitneigung",
      "Ausstrahlende Schmerzen in Arme oder Hinterkopf",
      "Schwindel bei Kopfbewegungen",
      "Schmerzen nach langem Sitzen am Schreibtisch",
    ],
    howWeHelp: [
      "Analyse der Haltung und Arbeitsplatzergonomie per Video",
      "Gezielte Mobilisationsübungen für die Halswirbelsäule",
      "Kräftigung der tiefen Nackenflexoren und Schulterblattmuskulatur",
      "Entspannungstechniken und Faszientraining",
      "Ergonomie-Beratung für den Arbeitsplatz",
    ],
    treatmentSteps: [
      { title: "Haltungsanalyse", description: "Wir analysieren Ihre Sitz- und Arbeitshaltung per Video und identifizieren Verspannungsmuster." },
      { title: "Akutbehandlung", description: "Sofort umsetzbare Übungen gegen akute Verspannungen und Schmerzen." },
      { title: "Muskelaufbau", description: "Kräftigung der Haltungsmuskulatur für langfristige Beschwerdefreiheit." },
      { title: "Alltagsintegration", description: "Micro-Pausen und Übungen für den Arbeitsalltag — in 5 Minuten anwendbar." },
    ],
    faq: [
      { question: "Helfen Online-Übungen wirklich bei Nackenverspannungen?", answer: "Ja, aktive Therapie ist bei Nackenschmerzen nachweislich wirksamer als passive Behandlungen. Wir zeigen Ihnen Übungen, die Sie täglich in wenigen Minuten durchführen können." },
      { question: "Ich arbeite viel am Computer — kann das die Ursache sein?", answer: "Häufig ja. Bildschirmarbeit begünstigt eine vorgeschobene Kopfhaltung, die den Nacken überlastet. Wir beraten Sie auch zur Ergonomie Ihres Arbeitsplatzes." },
      { question: "Sollte ich bei Nackenschmerzen zum Arzt gehen?", answer: "Bei Taubheitsgefühlen in den Armen, starkem Schwindel oder nach einem Unfall empfehlen wir eine ärztliche Abklärung. Muskuläre Nackenschmerzen können wir direkt behandeln." },
    ],
    keywords: ["Nackenschmerzen Physiotherapie", "HWS Syndrom Behandlung", "Nackenverspannung Übungen", "Nackenschmerzen online behandeln", "steifer Nacken Therapie"],
  },
  {
    slug: "hueftschmerzen",
    name: "Hüftschmerzen",
    metaTitle: "Online Physiotherapie bei Hüftschmerzen",
    metaDescription:
      "Hüftschmerzen online behandeln. Coxarthrose, Impingement, Bursitis — individuelle Video-Physiotherapie mit Heilpraktiker. Jetzt Anfrage stellen.",
    heroTitle: "Hüftschmerzen verstehen und gezielt behandeln",
    heroSubtitle:
      "Hüftbeschwerden schränken die Mobilität im Alltag massiv ein. Mit gezielter Physiotherapie verbessern wir Ihre Beweglichkeit und reduzieren Schmerzen nachhaltig.",
    symptoms: [
      "Schmerzen in der Leiste oder seitlichen Hüfte",
      "Anlaufschmerz nach längerem Sitzen",
      "Eingeschränkte Hüftbeugung oder Rotation",
      "Schmerzen beim Gehen oder Treppensteigen",
      "Nächtliche Hüftschmerzen beim Liegen auf der Seite",
      "Ausstrahlung in Oberschenkel oder Knie",
    ],
    howWeHelp: [
      "Funktionelle Hüftuntersuchung per Video",
      "Mobilisationsübungen für eingeschränkte Bewegungsrichtungen",
      "Kräftigung der Hüft- und Gesäßmuskulatur",
      "Gangschulung und Belastungsmanagement",
      "Beratung zu gelenkschonenden Alltagsbewegungen",
    ],
    treatmentSteps: [
      { title: "Funktionsanalyse", description: "Untersuchung der Hüftbeweglichkeit und Muskelkraft per Video — inklusive Ganganalyse." },
      { title: "Mobilisation", description: "Gezielte Übungen zur Verbesserung der Hüftbeweglichkeit und Schmerzreduktion." },
      { title: "Stabilisation", description: "Aufbau der hüftstabilisierenden Muskulatur für mehr Belastbarkeit im Alltag." },
      { title: "Langzeitmanagement", description: "Angepasstes Trainingsprogramm für dauerhafte Beschwerdefreiheit." },
    ],
    faq: [
      { question: "Hilft Physiotherapie bei Hüftarthrose?", answer: "Ja, Physiotherapie ist bei Hüftarthrose eine der wichtigsten Behandlungen. Regelmäßiges Training kann die Gelenkfunktion verbessern und eine OP verzögern oder sogar vermeiden." },
      { question: "Kann ich nach einer Hüft-OP online Physiotherapie machen?", answer: "Ja, nach der initialen Wundheilungsphase ist Online-Physiotherapie ideal für den Reha-Aufbau. Wir bieten ein spezielles Post-OP-Programm an." },
      { question: "Wie unterscheiden Sie verschiedene Hüftprobleme per Video?", answer: "Durch gezielte Bewegungstests und eine ausführliche Anamnese können wir per Video sehr gut zwischen Arthrose, Impingement, Bursitis und muskulären Ursachen unterscheiden." },
    ],
    keywords: ["Hüftschmerzen Physiotherapie", "Coxarthrose Übungen", "Hüftschmerzen online behandeln", "Hüftimpingement Therapie", "Hüfte Physiotherapie"],
  },
  {
    slug: "bandscheibenvorfall",
    name: "Bandscheibenvorfall",
    metaTitle: "Online Physiotherapie bei Bandscheibenvorfall",
    metaDescription:
      "Bandscheibenvorfall konservativ behandeln — per Video-Physiotherapie. Schmerzlinderung, Stabilisation und Rückkehr in den Alltag. Heilpraktiker-Betreuung.",
    heroTitle: "Bandscheibenvorfall — konservative Therapie online",
    heroSubtitle:
      "Die gute Nachricht: Über 90% aller Bandscheibenvorfälle heilen ohne Operation. Mit der richtigen Physiotherapie begleiten wir Sie zurück in ein schmerzfreies Leben.",
    symptoms: [
      "Starke Rückenschmerzen mit Ausstrahlung in Bein oder Arm",
      "Taubheitsgefühle oder Kribbeln in Extremitäten",
      "Muskelschwäche im betroffenen Bereich",
      "Schmerzverstärkung beim Husten, Niesen oder Pressen",
      "Bewegungseinschränkung der Wirbelsäule",
      "Schmerzen beim Sitzen oder Vorbeugen",
    ],
    howWeHelp: [
      "Symptombasierte Befunderhebung und Schweregradeinschätzung",
      "Entlastende Lagerungstechniken und Akutmaßnahmen",
      "Stufenweiser Aufbau der Rumpfstabilität nach McKenzie-Prinzip",
      "Nervengleitübungen (Neurodynamik) zur Symptomlinderung",
      "Rückenschule und Verhaltensberatung für den Alltag",
    ],
    treatmentSteps: [
      { title: "Akutphase", description: "Schmerzlindernde Lagerung und erste vorsichtige Bewegungsübungen unter therapeutischer Anleitung." },
      { title: "Mobilisation", description: "Behutsame Wiederherstellung der Wirbelsäulenbeweglichkeit mit Nervengleitübungen." },
      { title: "Stabilisation", description: "Gezielter Aufbau der tiefen Rumpfmuskulatur zum Schutz der Bandscheiben." },
      { title: "Belastungsaufbau", description: "Schrittweise Rückkehr zu normaler Belastung mit Rückfallprophylaxe." },
    ],
    faq: [
      { question: "Kann ich mit Bandscheibenvorfall online Physiotherapie machen?", answer: "Ja, sofern keine Notfall-Symptome vorliegen (Blasen-/Darmstörungen, zunehmende Lähmungen). Die konservative Therapie per Video ist sehr effektiv und gut belegt." },
      { question: "Wann brauche ich eine OP bei Bandscheibenvorfall?", answer: "Eine OP ist nur bei schweren neurologischen Ausfällen nötig. Bei Schmerzen ohne Lähmung ist konservative Therapie der Goldstandard — und genau das bieten wir an." },
      { question: "Wie lange dauert die Rehabilitation?", answer: "Die akute Phase dauert 4-6 Wochen, der vollständige Aufbau 3-6 Monate. Wir begleiten Sie mit unserem Chronik-Programm über den gesamten Zeitraum." },
    ],
    keywords: ["Bandscheibenvorfall Physiotherapie", "Bandscheibenvorfall Übungen", "Bandscheibenvorfall konservativ behandeln", "Bandscheibenvorfall online Therapie"],
  },
  {
    slug: "arthrose",
    name: "Arthrose",
    metaTitle: "Online Physiotherapie bei Arthrose",
    metaDescription:
      "Arthrose aktiv behandeln mit Online-Physiotherapie. Gelenkschonende Übungen, individuelle Trainingspläne und Schmerzmanagement per Video. Jetzt starten.",
    heroTitle: "Arthrose aktiv behandeln — Bewegung als Medizin",
    heroSubtitle:
      "Arthrose ist kein Grund, sich weniger zu bewegen — im Gegenteil. Gezielte Bewegung ist die wirksamste Therapie. Wir zeigen Ihnen, wie.",
    symptoms: [
      "Anlaufschmerz nach Ruhephasen",
      "Belastungsschmerz bei Aktivität",
      "Gelenksteifigkeit, besonders morgens",
      "Knirsch- oder Reibegeräusche (Krepitation)",
      "Schwellung und Überwärmung des Gelenks",
      "Zunehmende Bewegungseinschränkung",
    ],
    howWeHelp: [
      "Individuelle Belastungssteuerung nach Schmerzreaktion",
      "Gelenkschonende Kräftigungsübungen für die umgebende Muskulatur",
      "Beweglichkeitstraining zur Erhaltung der Gelenkfunktion",
      "Schmerzmanagement-Strategien für den Alltag",
      "Beratung zu Hilfsmitteln und gelenkschonendem Verhalten",
    ],
    treatmentSteps: [
      { title: "Bestandsaufnahme", description: "Erfassung des aktuellen Gelenkstatus und Ihrer Schmerzsituation per Video." },
      { title: "Sanfter Einstieg", description: "Schmerzadaptiertes Training mit niedriger Intensität zum Einstieg." },
      { title: "Aufbauphase", description: "Progressive Steigerung der Übungen zur Verbesserung von Kraft und Beweglichkeit." },
      { title: "Selbstmanagement", description: "Sie lernen, Ihre Arthrose langfristig selbst zu managen — mit unserem Trainingsplan als täglichem Begleiter." },
    ],
    faq: [
      { question: "Ist Bewegung bei Arthrose nicht schädlich?", answer: "Nein, das Gegenteil ist der Fall! Moderate Bewegung ist die beste Therapie bei Arthrose. Sie nährt den Knorpel, stärkt die Muskulatur und lindert Schmerzen nachweislich." },
      { question: "Welche Gelenke können Sie online behandeln?", answer: "Wir behandeln Arthrose in Knie, Hüfte, Schulter, Händen und Wirbelsäule. Der Trainingsplan wird individuell auf Ihr betroffenes Gelenk abgestimmt." },
      { question: "Kann Physiotherapie eine Gelenk-OP vermeiden?", answer: "In vielen Fällen ja. Studien zeigen, dass konsequente Physiotherapie bei Knie- und Hüftarthrose eine OP um Jahre verzögern oder ganz vermeiden kann." },
    ],
    keywords: ["Arthrose Physiotherapie", "Arthrose Übungen", "Kniearthrose Behandlung", "Arthrose Bewegungstherapie", "Arthrose online behandeln"],
  },
  {
    slug: "post-op-reha",
    name: "Reha nach Operation",
    metaTitle: "Online Reha nach OP — Physiotherapie per Video",
    metaDescription:
      "Rehabilitation nach Operation bequem von zu Hause. Knie-OP, Hüft-OP, Schulter-OP, Kreuzband — strukturiertes Reha-Programm per Video-Physiotherapie.",
    heroTitle: "Nach der OP zurück in den Alltag — mit Online-Reha",
    heroSubtitle:
      "Die Operation war der erste Schritt. Jetzt kommt der wichtigste Teil: die Rehabilitation. Unser strukturiertes Reha-Programm begleitet Sie per Video zurück zur vollen Belastbarkeit.",
    symptoms: [
      "Eingeschränkte Beweglichkeit nach der Operation",
      "Muskelschwäche und Muskelabbau (Atrophie)",
      "Schwellung und Narbengewebe",
      "Unsicherheit bei Belastung des operierten Bereichs",
      "Schmerzen bei bestimmten Bewegungen",
      "Angst vor erneuter Verletzung",
    ],
    howWeHelp: [
      "Strukturiertes Reha-Programm nach OP-spezifischem Protokoll",
      "Phasengerechter Aufbau von Beweglichkeit und Kraft",
      "Regelmäßige Video-Kontrollen des Therapiefortschritts",
      "Koordination mit Ihrem Operateur bei Bedarf",
      "Psychologische Unterstützung bei Bewegungsangst",
    ],
    treatmentSteps: [
      { title: "Frühphase", description: "Abschwellung, Wundheilung und erste vorsichtige Bewegungsübungen nach OP-Protokoll." },
      { title: "Aufbauphase", description: "Systematischer Aufbau von Beweglichkeit und beginnende Kräftigung." },
      { title: "Belastungsphase", description: "Steigerung der Belastbarkeit und funktionelles Training für Alltagsaktivitäten." },
      { title: "Return to Activity", description: "Rückkehr zu Sport und vollem Alltag mit abschließender Leistungstestung." },
    ],
    faq: [
      { question: "Ab wann kann ich nach der OP mit Online-Reha starten?", answer: "In der Regel nach der Wundheilungsphase (ca. 2 Wochen nach OP). Der genaue Zeitpunkt hängt von Ihrer Operation ab — wir besprechen das individuell." },
      { question: "Welche OPs können Sie online rehabilitieren?", answer: "Knie-TEP, Hüft-TEP, Kreuzband-OP, Schulter-OP, Bandscheiben-OP und viele weitere. Unser Therapeut passt das Reha-Protokoll an Ihren Eingriff an." },
      { question: "Ist Online-Reha genauso gut wie ambulante Reha?", answer: "Studien zeigen vergleichbare Ergebnisse. Der Vorteil: Sie trainieren in Ihrer gewohnten Umgebung, ohne Anfahrt, und mit intensiverer Betreuung durch täglichen App-Kontakt." },
    ],
    keywords: ["Reha nach OP online", "Physiotherapie nach Knie OP", "Online Rehabilitation", "Kreuzband Reha", "Post-OP Physiotherapie"],
  },
  {
    slug: "tennisarm",
    name: "Tennisarm (Epicondylitis)",
    metaTitle: "Online Physiotherapie bei Tennisarm",
    metaDescription:
      "Tennisarm / Epicondylitis online behandeln. Gezielte Übungen, exzentrisches Training und Schmerzmanagement per Video-Physiotherapie. Jetzt Anfrage stellen.",
    heroTitle: "Tennisarm gezielt behandeln — auch ohne Tennis",
    heroSubtitle:
      "Der Tennisarm betrifft nicht nur Sportler. Repetitive Belastungen im Beruf und Alltag sind die häufigste Ursache. Mit der richtigen Therapie heilt er zuverlässig aus.",
    symptoms: [
      "Schmerzen an der Außenseite des Ellenbogens",
      "Schwäche beim Greifen und Heben",
      "Schmerzen beim Händeschütteln oder Türklinke drücken",
      "Ausstrahlung in Unterarm und Handgelenk",
      "Druckschmerz am Knochenvorsprung (Epicondylus)",
      "Zunehmende Beschwerden bei wiederholten Bewegungen",
    ],
    howWeHelp: [
      "Identifikation der auslösenden Belastung und Beratung zur Modifikation",
      "Exzentrisches Sehnentraining nach aktuellem Forschungsstand",
      "Dehnübungen und Faszientechniken für den Unterarm",
      "Ergonomie-Beratung für Arbeitsplatz und Sportgerät",
      "Stufenweiser Wiedereinstieg in belastende Tätigkeiten",
    ],
    treatmentSteps: [
      { title: "Ursachenanalyse", description: "Identifikation der auslösenden Aktivitäten und Belastungsberatung." },
      { title: "Schmerzreduktion", description: "Entlastungsstrategien und erste therapeutische Übungen zur Schmerzlinderung." },
      { title: "Sehnenaufbau", description: "Exzentrisches Training — der Goldstandard bei Sehnenbeschwerden." },
      { title: "Belastungsaufbau", description: "Schrittweise Rückkehr zu normaler Belastung und Sport." },
    ],
    faq: [
      { question: "Wie lange dauert die Heilung beim Tennisarm?", answer: "Mit konsequenter Therapie 6-12 Wochen. Ohne Behandlung kann ein Tennisarm Monate bis Jahre bestehen bleiben." },
      { question: "Was ist exzentrisches Training?", answer: "Dabei wird die Sehne unter kontrollierter Verlängerung belastet. Diese Trainingsform stimuliert die Sehnenheilung nachweislich am effektivsten." },
      { question: "Kann ich trotz Tennisarm weiter arbeiten?", answer: "Meist ja, mit angepasster Belastung. Wir zeigen Ihnen, wie Sie auslösende Bewegungen modifizieren und trotzdem aktiv bleiben können." },
    ],
    keywords: ["Tennisarm Behandlung", "Epicondylitis Physiotherapie", "Tennisarm Übungen", "Tennisellenbogen Therapie", "Tennisarm online behandeln"],
  },
  {
    slug: "ischias",
    name: "Ischiasschmerzen",
    metaTitle: "Online Physiotherapie bei Ischiasschmerzen",
    metaDescription:
      "Ischiasschmerzen (Ischialgie) online behandeln. Schmerzlinderung, Nervengleitübungen und Rückenstabilisation per Video-Physiotherapie mit Heilpraktiker.",
    heroTitle: "Ischiasschmerzen lindern — mit gezielter Online-Therapie",
    heroSubtitle:
      "Der stechende Schmerz vom Rücken ins Bein ist typisch für Ischiasbeschwerden. Mit der richtigen Therapie können die Symptome deutlich gelindert werden.",
    symptoms: [
      "Ausstrahlende Schmerzen vom Rücken über das Gesäß ins Bein",
      "Brennen, Kribbeln oder Taubheitsgefühle im Bein",
      "Schmerzen beim Sitzen, besonders auf harten Stühlen",
      "Verstärkung beim Husten, Niesen oder Pressen",
      "Schwierigkeiten beim Gehen oder Treppensteigen",
      "Muskelschwäche im betroffenen Bein",
    ],
    howWeHelp: [
      "Differenzierung der Ursache (Bandscheibe, Piriformis, Stenose)",
      "Neurodynamische Übungen zur Nervenentlastung",
      "Stabilisationsübungen für die Lendenwirbelsäule",
      "Entlastungslagerungen und Akutmaßnahmen",
      "Langfristiges Rückenprogramm zur Rückfallprophylaxe",
    ],
    treatmentSteps: [
      { title: "Abklärung", description: "Sorgfältige Befunderhebung zur Unterscheidung der verschiedenen Ischias-Ursachen." },
      { title: "Akutbehandlung", description: "Schmerzlindernde Positionen und erste Nervengleitübungen." },
      { title: "Rehabilitation", description: "Aufbau der Rumpfstabilität und Verbesserung der Nervenmobilität." },
      { title: "Prävention", description: "Langzeit-Übungsprogramm zur Verhinderung erneuter Ischiasepisoden." },
    ],
    faq: [
      { question: "Wann sollte ich mit Ischiasschmerzen zum Arzt?", answer: "Bei Blasen-/Darmstörungen, zunehmender Schwäche im Bein oder nach Unfall sofort zum Arzt. Ansonsten kann konservative Physiotherapie der erste Behandlungsschritt sein." },
      { question: "Hilft Wärme oder Kälte bei Ischias?", answer: "Beides kann helfen. In der Akutphase oft Kälte, bei muskulären Verspannungen Wärme. Wir beraten Sie individuell in der ersten Video-Sitzung." },
      { question: "Kann Ischias von alleine weggehen?", answer: "Oft bessern sich die Symptome in 4-6 Wochen. Mit gezielter Physiotherapie geht es deutlich schneller und Sie beugen Rückfällen vor." },
    ],
    keywords: ["Ischias Physiotherapie", "Ischiasschmerzen Behandlung", "Ischialgie Übungen", "Ischias online behandeln", "Ischiasnerv Therapie"],
  },
  {
    slug: "kopfschmerzen-migraene",
    name: "Kopfschmerzen & Migräne",
    metaTitle: "Online Physiotherapie bei Kopfschmerzen & Migräne",
    metaDescription:
      "Kopfschmerzen und Migräne physiotherapeutisch behandeln. Spannungskopfschmerz, zervikogener Kopfschmerz — Video-Therapie mit Heilpraktiker. Ohne Medikamente.",
    heroTitle: "Kopfschmerzen & Migräne — Physiotherapie statt Tabletten",
    heroSubtitle:
      "Viele Kopfschmerzen haben ihren Ursprung im Nacken und der Halswirbelsäule. Physiotherapie behandelt die Ursache, nicht nur das Symptom — medikamentenfrei.",
    symptoms: [
      "Drückende oder ziehende Kopfschmerzen (Spannungstyp)",
      "Einseitige pochende Kopfschmerzen (Migräne)",
      "Kopfschmerzen ausgehend vom Nacken (zervikogen)",
      "Begleitende Nacken- und Schulterverspannungen",
      "Schwindel oder Übelkeit bei Kopfschmerzen",
      "Häufigkeit: mehr als 4 Kopfschmerztage pro Monat",
    ],
    howWeHelp: [
      "Differenzierung des Kopfschmerztyps durch gezielte Befragung und Tests",
      "Manuelle Techniken als Eigenübung für die obere Halswirbelsäule",
      "Korrektur von Haltungsdefiziten (Kopf-Vorschub-Haltung)",
      "Entspannungstechniken und Stressmanagement",
      "Kopfschmerztagebuch zur Identifikation von Triggern",
    ],
    treatmentSteps: [
      { title: "Kopfschmerzanalyse", description: "Ausführliche Befragung zu Art, Häufigkeit und Auslösern Ihrer Kopfschmerzen." },
      { title: "HWS-Behandlung", description: "Gezielte Mobilisations- und Kräftigungsübungen für die obere Halswirbelsäule." },
      { title: "Triggermanagement", description: "Identifikation und Reduktion von Auslösern durch Verhaltensanpassung." },
      { title: "Langzeitbetreuung", description: "Regelmäßige Kontrolle und Anpassung — mit dem Ziel, Kopfschmerztage deutlich zu reduzieren." },
    ],
    faq: [
      { question: "Kann Physiotherapie wirklich gegen Migräne helfen?", answer: "Ja, besonders wenn die Migräne mit Nackenverspannungen einhergeht. Physiotherapie kann die Häufigkeit und Intensität von Migräneattacken nachweislich reduzieren." },
      { question: "Wie unterscheiden Sie die Kopfschmerzart per Video?", answer: "Durch eine strukturierte Befragung, gezielte HWS-Tests und die Analyse Ihrer Symptommuster können wir den Kopfschmerztyp gut einordnen." },
      { question: "Wie oft muss ich trainieren?", answer: "Täglich 10-15 Minuten Nackenübungen plus Entspannungstechnik. Die kurzen Einheiten lassen sich gut in den Alltag integrieren." },
    ],
    keywords: ["Kopfschmerzen Physiotherapie", "Migräne Behandlung Physiotherapie", "Spannungskopfschmerz Therapie", "zervikogener Kopfschmerz", "Kopfschmerzen ohne Medikamente"],
  },
  {
    slug: "fersensporn",
    name: "Fersensporn (Plantarfasziitis)",
    metaTitle: "Online Physiotherapie bei Fersensporn",
    metaDescription:
      "Fersensporn und Plantarfasziitis online behandeln. Gezielte Dehn- und Kräftigungsübungen per Video-Physiotherapie. Schmerzfrei gehen — ohne OP.",
    heroTitle: "Fersensporn behandeln — Schritt für Schritt zurück",
    heroSubtitle:
      "Der stechende Schmerz bei jedem Schritt ist quälend. Die gute Nachricht: Fersensporn und Plantarfasziitis heilen mit der richtigen Therapie zuverlässig aus.",
    symptoms: [
      "Stechender Schmerz unter der Ferse beim Auftreten",
      "Anlaufschmerz morgens oder nach Ruhephasen (typisch!)",
      "Schmerzen nach langem Stehen oder Gehen",
      "Druckschmerz an der Unterseite der Ferse",
      "Zunahme der Beschwerden bei Barfußlaufen",
      "Gelegentlich Ausstrahlung in die Fußsohle",
    ],
    howWeHelp: [
      "Exzentrisches Training der Wadenmuskulatur und Plantarfaszie",
      "Spezifische Dehnübungen für verkürzte Wadenmuskulatur",
      "Faszientechniken mit Ball oder Faszienrolle",
      "Beratung zu geeignetem Schuhwerk und Einlagen",
      "Belastungsmanagement und Trainingssteuerung",
    ],
    treatmentSteps: [
      { title: "Diagnostik", description: "Analyse der Fußstatik, Wadenmuskulatur und Belastungsmuster per Video." },
      { title: "Schmerzphase", description: "Entlastungstechniken und erste Dehnübungen zur Schmerzreduktion." },
      { title: "Sehnenaufbau", description: "Progressives exzentrisches Training für die Plantarfaszie — der Schlüssel zur Heilung." },
      { title: "Belastungsaufbau", description: "Schrittweise Rückkehr zu Sport und langen Spaziergängen." },
    ],
    faq: [
      { question: "Wie lange dauert es, bis ein Fersensporn ausheilt?", answer: "Mit konsequenter Therapie 6-12 Wochen. Ohne Behandlung kann es Monate bis über ein Jahr dauern. Je früher Sie starten, desto schneller die Heilung." },
      { question: "Brauche ich Einlagen bei Fersensporn?", answer: "Einlagen können die Symptome lindern, behandeln aber nicht die Ursache. Wir kombinieren Übungstherapie mit Einlagenberatung für optimale Ergebnisse." },
      { question: "Kann man Fersensporn per Video behandeln?", answer: "Ja, hervorragend sogar. Die Übungen sind einfach durchzuführen und der Fortschritt gut messbar. Wir kontrollieren Ihre Technik per Video." },
    ],
    keywords: ["Fersensporn Behandlung", "Plantarfasziitis Physiotherapie", "Fersensporn Übungen", "Fersenschmerzen Therapie", "Fersensporn online behandeln"],
  },
]

export function getBeschwerdeBySlug(slug: string): Beschwerde | undefined {
  return BESCHWERDEN.find((b) => b.slug === slug)
}
