/**
 * Masterclass „Chronischer Kreuzschmerz" — Laufzeit-Daten der Lektion 2.1
 * Bewegungsphilosophie: Warum Bewegung Medizin ist
 *
 * ⚠️  GENERIERT — NICHT VON HAND EDITIEREN.
 * Quelle:   src/lib/masterclass/sources/2.1.source.ts
 * Erzeugt:  node scripts/build-masterclass.mjs 2.1  (Stimme: Adrian / YYyi4prp0WCqZCPDNGu1)
 * Änderungen am Text/Timing → Source ändern + Build-Skript erneut laufen lassen.
 *
 * SYNCHRONISATION (wort-genau):
 *   Jede Slide trägt eine `appearTime` (Sekunden, relativ zum Abschnitt-Audio).
 *   Sie wurde aus dem ElevenLabs-Wort-Alignment berechnet: Für das Sprech-Segment
 *   jeder Slide (`seg` in der Source) wird der Start-Zeichen-Offset im gesprochenen
 *   Text bestimmt und `appearTime = starts[offset]` gesetzt. Der Player schaltet
 *   die Slide, sobald `audio.currentTime >= slide.appearTime`. Weder `seg` noch
 *   das Alignment werden an den Client ausgeliefert — nur die fertigen Zeitwerte.
 *
 * Die Transkripte sind die bereinigten Erzähltexte (Pausen-Marker und Emphasis
 * entfernt). Der Wortlaut bleibt unverändert (HWG: keine Heilversprechen).
 *
 * Die Slide-/Abschnitt-/Lektions-Typen liegen geteilt in ../types.
 */

import {
  type Lesson,
  totalSlides,
  flatSlides,
  type FlatSlide,
} from "../types";

const AUDIO_BASE = "/audio/masterclass/chronischer-kreuzschmerz/2.1";

export const lesson_2_1: Lesson = {
  id: "2.1",
  title: "Bewegungsphilosophie: Warum Bewegung Medizin ist",
  subtitle: "Modul 2 – Kurativ handeln · Das Mindset vor der ersten Übung",
  sections: [
    {
      title: "Eröffnung",
      audioSrc: `${AUDIO_BASE}/abschnitt-1.mp3`,
      transkript: "Willkommen in Modul 2. Wir verlassen jetzt das Modul Verstehen und betreten das Modul Handeln. In Modul 1 hast du gelernt, was in deinem Rücken passiert und warum chronischer Schmerz so funktioniert, wie er funktioniert. In Modul 2 lernst du, was du damit machen kannst. Bevor wir aber mit der ersten konkreten Übung starten, müssen wir eine wichtige philosophische Vorarbeit leisten. Diese Lektion ist eine Lektion ohne Übungen. Sie ist eine Lektion über das Warum der Übungen, über das Mindset, mit dem du an sie herangehen solltest. Wenn dieses Mindset nicht stimmt, wirst du Übungen entweder schlecht ausführen oder bald wieder aufhören. Wenn es stimmt, hast du gute Chancen, dass die folgenden Übungen wirklich wirken.",
      slides: [
        {
          type: "title",
          appearTime: 0,
          kicker: "Masterclass · Modul 2 – Kurativ handeln",
          lessonLabel: "Lektion 2.1 – Bewegungsphilosophie: Warum Bewegung Medizin ist",
        },
        {
          type: "statement",
          appearTime: 0,
          text: "Vom Verstehen ins Handeln.",
          emphasis: "Handeln",
        },
        {
          type: "content",
          appearTime: 5.584,
          kicker: "Was sich ändert",
          headline: "Modul 1 war das Warum. Modul 2 ist das Was-du-tun-kannst.",
        },
        {
          type: "content",
          appearTime: 16.068,
          kicker: "Eine Lektion ohne Übungen",
          headline: "Erst die Vorarbeit: das Warum und das Mindset.",
          lead: "Mit welcher Haltung du an die Übungen herangehst.",
        },
        {
          type: "statement",
          appearTime: 31.533,
          text: "Das Mindset entscheidet, ob die Übung wirkt.",
          emphasis: "Mindset",
        },
      ],
    },
    {
      title: "Die Schonungs-Falle",
      audioSrc: `${AUDIO_BASE}/abschnitt-2.mp3`,
      transkript: "Beginnen wir mit einer Überzeugung, die in unserer Kultur tief verankert ist und die für chronischen Rückenschmerz oft das Gegenteil von hilfreich ist: Wenn etwas weh tut, dann schone es. Diese Überzeugung kommt aus einer Welt, die viele akute Verletzungen kannte – Knochenbrüche, Bänderrisse, frische Wunden. Bei diesen Verletzungen ist Schonung tatsächlich oft richtig: Du gibst dem Gewebe Zeit zu heilen. Nach drei, vier Wochen ist alles vernarbt, und du kannst langsam wieder anfangen zu belasten. Bei chronischem Rückenschmerz funktioniert diese Strategie nicht. Im Gegenteil – sie ist oft Teil des Problems. Warum? Weil bei chronischem Schmerz die Sensitivitätseinstellung deines Nervensystems – erinnere dich an die Alarmanlage – bereits hoch ist. Wenn du jetzt schonst, machst du zwei Dinge gleichzeitig: Erstens: Du gibst dem Nervensystem zusätzliche Bestätigung, dass die Bewegung gefährlich ist. Ich vermeide das, also muss es schlimm sein. Die Sensitivität bleibt oben. Das Problem verfestigt sich. Zweitens: Du verlierst genau die körperlichen Eigenschaften, die deinen Rücken vor zukünftigen Schmerzen schützen würden. Muskeln werden schwächer. Faszien werden weniger gleitfähig. Bewegungsmuster werden ungeschickter. Die Lastverteilung wird schlechter. Mit jedem Tag Schonung wird dein Körper weniger belastbar. Das Ergebnis ist ein Teufelskreis, den Forschende seit Jahren beschreiben: Schmerz führt zu Schonung, Schonung führt zu reduzierter Belastbarkeit, reduzierte Belastbarkeit führt zu mehr Schmerz bei kleineren Belastungen, das führt zu noch mehr Schonung. Und so weiter. Die Leitlinien sind heute eindeutig: Bei akutem Rückenschmerz wird Bettruhe explizit nicht empfohlen. Bei chronischem Rückenschmerz wird aktive Bewegungstherapie an erster Stelle empfohlen. Nicht passive Behandlung. Nicht Schonung. Aktive Bewegung.",
      slides: [
        {
          type: "quote",
          appearTime: 0,
          text: "Wenn etwas weh tut, dann schone es.",
          caption: "Eine tief verankerte Überzeugung – und bei chronischem Schmerz oft das Gegenteil von hilfreich.",
        },
        {
          type: "content",
          appearTime: 10.832,
          kicker: "Bei akuten Verletzungen",
          headline: "Bei Knochenbruch oder Bänderriss ist Schonung oft richtig.",
          lead: "Du gibst dem Gewebe Zeit – nach drei, vier Wochen ist es vernarbt.",
        },
        {
          type: "statement",
          appearTime: 27.213,
          text: "Bei chronischem Schmerz ist Schonung oft Teil des Problems.",
          emphasis: "Teil des Problems",
        },
        {
          type: "content",
          appearTime: 32.484,
          kicker: "Erinnere dich an die Alarmanlage",
          headline: "Die Sensitivität ist schon hoch. Schonen macht zwei Dinge gleichzeitig.",
        },
        {
          type: "content",
          appearTime: 43.989,
          kicker: "Erstens",
          headline: "Du bestätigst dem Nervensystem: diese Bewegung ist gefährlich.",
          lead: "„Ich vermeide das, also muss es schlimm sein.“ Die Sensitivität bleibt oben.",
        },
        {
          type: "reveal-list",
          appearTime: 56.551,
          kicker: "Zweitens · was du verlierst",
          title: "Mit jedem Tag Schonung weniger belastbar",
          items: [{"label":"Muskeln werden schwächer"},{"label":"Faszien werden weniger gleitfähig"},{"label":"Bewegungsmuster werden ungeschickter"},{"label":"Die Lastverteilung wird schlechter"}],
        },
        {
          type: "reveal-list",
          appearTime: 72.504,
          dark: true,
          kicker: "Der Teufelskreis",
          title: "Schonung → weniger Belastbarkeit → mehr Schmerz",
          items: [{"label":"Schmerz führt zu Schonung"},{"label":"Schonung führt zu reduzierter Belastbarkeit"},{"label":"Weniger Belastbarkeit führt zu mehr Schmerz bei kleineren Belastungen"},{"label":"Mehr Schmerz führt zu noch mehr Schonung"}],
        },
        {
          type: "statement",
          appearTime: 90.046,
          text: "Die Leitlinien sagen eindeutig: aktive Bewegung statt Schonung.",
          emphasis: "aktive Bewegung",
        },
      ],
    },
    {
      title: "Bewegung als Medizin: Die sechs Mechanismen",
      audioSrc: `${AUDIO_BASE}/abschnitt-3.mp3`,
      transkript: "Aber was macht Bewegung eigentlich konkret? Warum hilft sie? In den letzten zwanzig Jahren hat die Forschung sehr genau analysiert, was bei aktiver Bewegungstherapie passiert. Die Mechanismen sind vielfältig – und es ist nützlich, sie zu kennen, damit du verstehst, warum dich gleich ein Bird-Dog oder ein Hip-Hinge wirklich besser machen kann. Erster Mechanismus: Sicherheits-Information ans Nervensystem. Wir haben das in Lektion 1.5 ausführlich besprochen. Jede schmerzfreie oder gering schmerzhafte Bewegung ist eine kleine Information für dein Nervensystem: Diese Bewegung ist sicher. Hunderte solcher Informationen über Wochen kalibrieren die Sensitivität herunter. Das ist nicht nebenbei – das ist der Hauptmechanismus moderner Bewegungstherapie bei chronischem Schmerz. Zweiter Mechanismus: Wiederaufbau der lokalen Stabilisatoren. Erinnerst du dich an den Multifidus aus Lektion 1.2 – den kleinen tiefen Stabilisator? Bei chronischem Rückenschmerz funktioniert er meistens schlechter. Gezieltes Training stellt seine Funktion wieder her. Eine gute Stabilisation reduziert das, was Forschende aberrant motion nennen – kleine, ungewollte Wackelbewegungen zwischen Wirbeln. Weniger Wackelbewegung heißt weniger Reizung heißt weniger Schmerz. Dritter Mechanismus: Verbesserung der Lastverteilung. In Lektion 1.2 haben wir auch über den Gluteus gesprochen – die Gesäßmuskulatur. Wenn er schwach ist, übernimmt der untere Rücken seine Arbeit. Das ist ein klassisches Schmerzmuster. Krafttraining für Hüfte und Gesäß entlastet den unteren Rücken oft mehr als jede Übung direkt am Rücken. Vierter Mechanismus: Faszien-Mobilität. Faszien lieben Bewegung – das hatten wir auch. Eine durchbewegte Fascia thoracolumbalis ist gleitfähiger, hat bessere Stoffwechselversorgung, ist weniger reizbar. Mobilisationsübungen wirken direkt auf diese Schicht. Fünfter Mechanismus: Endogene Schmerzmodulation. Dein Körper produziert während und nach Bewegung eigene Schmerz-Dämpfer – Endorphine, Endocannabinoide, das parasympathische Nervensystem fährt hoch. Das ist nicht Einbildung, das ist neurobiologisch sauber beschrieben. Bewegung ist tatsächlich Schmerztherapie auf molekularer Ebene. Sechster Mechanismus: Verbesserung von Stress, Schlaf, Stimmung. Wir wissen aus Lektion 1.3, dass diese Faktoren chronischen Schmerz aufrechterhalten können. Regelmäßige Bewegung verbessert sie nachweislich. Das ist systemische Therapie – nicht punktuell, sondern auf das ganze Schmerz-Ökosystem wirkend. Mit anderen Worten: Wenn du gleich Übungen lernst, dann lernst du nicht Sport zum Muskeln machen. Du lernst sechs gleichzeitig wirkende Therapie-Mechanismen, die alle gemeinsam dein Schmerzsystem in die richtige Richtung bewegen. Das ist Medizin im wahrsten Sinne des Wortes.",
      slides: [
        {
          type: "content",
          appearTime: 0,
          kicker: "Sechs Mechanismen",
          headline: "Aber was macht Bewegung eigentlich konkret?",
        },
        {
          type: "content",
          appearTime: 5.399,
          headline: "Die Mechanismen sind vielfältig – und nützlich zu kennen.",
          lead: "Damit du verstehst, warum dich gleich ein Bird-Dog oder ein Hip-Hinge besser machen kann.",
        },
        {
          type: "content",
          appearTime: 20.979,
          kicker: "Mechanismus 1 · Sicherheits-Info",
          headline: "Jede gute Bewegung sagt dem Nervensystem: diese Bewegung ist sicher.",
          lead: "Hunderte solcher Informationen kalibrieren die Sensitivität herunter – der Hauptmechanismus.",
        },
        {
          type: "content",
          appearTime: 49.458,
          kicker: "Mechanismus 2 · Stabilisatoren",
          headline: "Gezieltes Training stellt die Funktion des Multifidus wieder her.",
          lead: "Weniger ungewollte Wackelbewegungen zwischen Wirbeln – weniger Reizung, weniger Schmerz.",
        },
        {
          type: "content",
          appearTime: 79.435,
          kicker: "Mechanismus 3 · Lastverteilung",
          headline: "Ist der Gluteus schwach, übernimmt der untere Rücken seine Arbeit.",
          lead: "Kraft für Hüfte und Gesäß entlastet den Rücken oft mehr als jede Übung direkt am Rücken.",
        },
        {
          type: "content",
          appearTime: 98.847,
          kicker: "Mechanismus 4 · Faszien",
          headline: "Faszien lieben Bewegung.",
          lead: "Eine durchbewegte Fascia thoracolumbalis ist gleitfähiger, besser versorgt, weniger reizbar.",
        },
        {
          type: "content",
          appearTime: 116.274,
          kicker: "Mechanismus 5 · Endogene Modulation",
          headline: "Dein Körper produziert bei Bewegung eigene Schmerz-Dämpfer.",
          lead: "Endorphine, Endocannabinoide, parasympathisches Nervensystem – Schmerztherapie auf molekularer Ebene.",
        },
        {
          type: "content",
          appearTime: 137.799,
          kicker: "Mechanismus 6 · Stress, Schlaf, Stimmung",
          headline: "Regelmäßige Bewegung verbessert Stress, Schlaf und Stimmung.",
          lead: "Systemische Therapie – nicht punktuell, sondern auf das ganze Schmerz-Ökosystem wirkend.",
        },
        {
          type: "reveal-list",
          appearTime: 153.763,
          kicker: "Sechs Wege gleichzeitig",
          title: "Sechs gleichzeitig wirkende Mechanismen",
          items: [{"label":"Sicherheits-Information ans Nervensystem"},{"label":"Wiederaufbau der lokalen Stabilisatoren"},{"label":"Verbesserung der Lastverteilung"},{"label":"Faszien-Mobilität"},{"label":"Endogene Schmerzmodulation"},{"label":"Verbesserung von Stress, Schlaf, Stimmung"}],
        },
        {
          type: "statement",
          appearTime: 166.302,
          text: "Bewegung ist nicht Sport. Bewegung ist Medizin.",
          emphasis: "Medizin",
        },
      ],
    },
    {
      title: "Die fünf Bewegungs-Prinzipien",
      audioSrc: `${AUDIO_BASE}/abschnitt-4.mp3`,
      transkript: "Bevor wir in die konkreten Übungen gehen, lass mich dir fünf Prinzipien mitgeben, nach denen du in dieser Masterclass mit Bewegung arbeitest. Diese Prinzipien gelten immer – egal ob du eine Mobilisation machst, ein Kraftpaar, oder einfach einen Spaziergang gehst. Erstes Prinzip: Dosiert. Du wirst Übungen nicht in maximaler Intensität machen, sondern in passender Intensität. Bei chronischem Schmerz ist zu wenig oft besser als zu viel. Du gehst nicht ans Limit, du gehst in eine Reizdosis, die dein System verarbeiten kann. Wenn du am nächsten Tag stärker Schmerz hast, war es zu viel – nicht zu wenig. Das ist eine wichtige Verschiebung des Denkens, vor allem für Leute, die früher viel Sport gemacht haben. Zweites Prinzip: Regelmäßig. Häufige kleine Reize wirken besser als seltene große. Lieber jeden Tag fünfzehn Minuten als einmal pro Woche eine Stunde. Dein Nervensystem lernt durch Wiederholung – nicht durch Intensität. Das ist der ganze Grund, warum wir in Modul 4 mit Habit Stacking arbeiten: Tägliche Mini-Dosen sind die wirksame Form. Drittes Prinzip: Vielseitig. Dein Rücken liebt Variabilität. Nicht immer dieselbe Bewegung, nicht immer dieselbe Position, nicht immer dieselbe Belastungsart. Ein Tag Mobilisation, ein Tag Kraft, ein Tag Spaziergang, ein Tag Rumpfstabilisation. Diese Variabilität gibt deinem System mehr Lernerfahrungen, mehr Sicherheits-Signale, mehr Lastverteilungs-Optionen. Viertes Prinzip: Schmerzadaptiv. Das ist der zentrale Begriff dieser Masterclass. Du wirst nicht trotz Schmerz trainieren und auch nicht nur ohne Schmerz. Du wirst lernen, deinen Tagesschmerz wahrzunehmen und die Übung daran anzupassen. An guten Tagen mehr Intensität, an schlechten Tagen weniger – aber an beiden Tagen etwas. Genau dafür hat jede unserer Übungen drei Schienen: reizarm, Standard, belastend. Du wirst lernen, diese Schienen flexibel zu wählen. Fünftes Prinzip: Alltagsintegriert. Die Bewegung der Masterclass soll nicht in deinem Alltag eine Insel sein. Sie soll im Alltag stattfinden. In Modul 4 zeige ich dir, wie du Übungen an Rituale knüpfst – Kaffeemaschine, Zähneputzen, Schreibtischpause. Damit sie nicht zur lästigen Pflicht werden, sondern zu Routinen, die du nicht mehr bemerkst. Halte diese fünf Prinzipien fest, während wir gleich in die ersten Übungen gehen: Dosiert. Regelmäßig. Vielseitig. Schmerzadaptiv. Alltagsintegriert. Das ist die DNA der Bewegung, die hier wirkt.",
      slides: [
        {
          type: "content",
          appearTime: 0,
          kicker: "Fünf Prinzipien",
          headline: "Fünf Prinzipien, die immer gelten.",
          lead: "Egal ob Mobilisation, Kraftpaar oder einfach ein Spaziergang.",
        },
        {
          type: "content",
          appearTime: 14.791,
          kicker: "Prinzip 1 · Dosiert",
          headline: "Passende Intensität, nicht maximale.",
          lead: "Zu wenig ist oft besser als zu viel. Mehr Schmerz am nächsten Tag heißt: es war zu viel.",
        },
        {
          type: "content",
          appearTime: 40.194,
          kicker: "Prinzip 2 · Regelmäßig",
          headline: "Häufige kleine Reize wirken besser als seltene große.",
          lead: "Lieber jeden Tag fünfzehn Minuten. Dein Nervensystem lernt durch Wiederholung, nicht durch Intensität.",
        },
        {
          type: "content",
          appearTime: 61.149,
          kicker: "Prinzip 3 · Vielseitig",
          headline: "Dein Rücken liebt Variabilität.",
          lead: "Mobilisation, Kraft, Spaziergang, Stabilisation – mehr Lernerfahrungen, mehr Sicherheits-Signale.",
        },
        {
          type: "content",
          appearTime: 82.21,
          dark: true,
          kicker: "Prinzip 4 · Schmerzadaptiv",
          headline: "Nicht trotz Schmerz, nicht nur ohne – sondern angepasst an deinen Tag.",
          lead: "An guten Tagen mehr, an schlechten weniger, aber an beiden etwas. Jede Übung hat drei Schienen: reizarm, Standard, belastend.",
        },
        {
          type: "content",
          appearTime: 113.022,
          kicker: "Prinzip 5 · Alltagsintegriert",
          headline: "Bewegung soll im Alltag stattfinden, nicht daneben.",
          lead: "An Rituale geknüpft – Kaffeemaschine, Zähneputzen, Schreibtischpause – bis sie zu Routinen werden.",
        },
        {
          type: "reveal-list",
          appearTime: 134.118,
          kicker: "Die DNA der Bewegung",
          title: "Halte diese fünf fest",
          items: [{"label":"Dosiert"},{"label":"Regelmäßig"},{"label":"Vielseitig"},{"label":"Schmerzadaptiv"},{"label":"Alltagsintegriert"}],
        },
      ],
    },
    {
      title: "Was kommt in Modul 2",
      audioSrc: `${AUDIO_BASE}/abschnitt-5.mp3`,
      transkript: "Was erwartet dich in den nächsten Lektionen? Lektion 2.2: Schmerzmodulierende Mobilisation. Sanfte, oft im Liegen oder Vierfüßler-Stand ausgeführte Bewegungen, die deinen Rücken durchbluten, mobilisieren und beruhigen. Das sind die Übungen, die du auch an schlechten Tagen machen kannst – oft sogar dann besonders gerne, weil sie schmerzlindernd wirken. Lektion 2.3: Modernes Rumpftraining Teil 1 – Stabilisation. Hier trainierst du die Feinkontrolle – Multifidus, Transversus, die tiefen Stabilisatoren. Nicht laut, nicht spektakulär, aber neurologisch enorm wirksam. Lektion 2.4: Modernes Rumpftraining Teil 2 – Belastungstoleranz. Hier trainierst du Kraft. Echtes, dosiertes Krafttraining mit Hip Hinges, Kniebeugen, Carries. Du wirst überrascht sein, wie viel dein Rücken aushält – wenn er trainiert ist. Lektion 2.5: Atemmechanik und Beckenboden. Eine der unterschätztesten Bewegungs-Werkzeuge überhaupt. Lektion 2.6: Belastungsdosierung und Pacing. Wie du im Alltag zwischen Aktivitäts-Spitzen und Erholung dosierst, um nicht in den klassischen Push-Crash-Zyklus zu fallen. Lektion 2.7: Schmerz-Coping. Mentale Werkzeuge, mit denen du in Schmerz-Momenten handlungsfähig bleibst – ohne entweder zu verkrampfen oder einzubrechen.",
      slides: [
        {
          type: "content",
          appearTime: 0,
          kicker: "Modul 2 · Ausblick",
          headline: "Was erwartet dich in den nächsten Lektionen?",
        },
        {
          type: "content",
          appearTime: 2.728,
          kicker: "Lektion 2.2",
          headline: "Schmerzmodulierende Mobilisation.",
          lead: "Sanfte Bewegungen, die durchbluten und beruhigen – auch an schlechten Tagen machbar.",
        },
        {
          type: "content",
          appearTime: 23.661,
          kicker: "Lektion 2.3",
          headline: "Rumpftraining 1 – Stabilisation.",
          lead: "Feinkontrolle der tiefen Stabilisatoren – nicht spektakulär, aber neurologisch enorm wirksam.",
        },
        {
          type: "content",
          appearTime: 38.847,
          kicker: "Lektion 2.4",
          headline: "Rumpftraining 2 – Belastungstoleranz.",
          lead: "Echtes, dosiertes Krafttraining. Du wirst überrascht sein, wie viel dein Rücken aushält.",
        },
        {
          type: "content",
          appearTime: 55.612,
          kicker: "Lektion 2.5",
          headline: "Atemmechanik und Beckenboden.",
          lead: "Eines der unterschätztesten Bewegungs-Werkzeuge überhaupt.",
        },
        {
          type: "content",
          appearTime: 63.204,
          kicker: "Lektion 2.6",
          headline: "Belastungsdosierung und Pacing.",
          lead: "Zwischen Aktivitäts-Spitzen und Erholung dosieren – raus aus dem Push-Crash-Zyklus.",
        },
        {
          type: "module",
          appearTime: 75.348,
          number: "2",
          title: "Modul 2 – Kurativ handeln",
          lead: "Sieben Lektionen, von der Philosophie bis zum Coping.",
          items: [{"label":"2.2 – Schmerzmodulierende Mobilisation"},{"label":"2.3 – Rumpftraining 1: Stabilisation"},{"label":"2.4 – Rumpftraining 2: Belastungstoleranz"},{"label":"2.5 – Atemmechanik & Beckenboden"},{"label":"2.6 – Belastungsdosierung & Pacing"},{"label":"2.7 – Schmerz-Coping"}],
        },
      ],
    },
    {
      title: "Workbook & Übergang",
      audioSrc: `${AUDIO_BASE}/abschnitt-6.mp3`,
      transkript: "Im Workbook findest du Übung 2.1: Meine Bewegungs-Anamnese. Eine kurze Bestandsaufnahme: Was bewegst du aktuell schon? Was würdest du gerne wieder können? Welche Bewegungen meidest du, und seit wann? Bevor du in Lektion 2.2 weitergehst, hol dir bitte das, was du dafür brauchst: eine ruhige Ecke, eine Yogamatte oder Decke auf dem Boden, bequeme Kleidung, ein Kissen für unter den Kopf. Eine Massagerolle ist hilfreich, aber nicht zwingend – wir kommen darauf zurück. Dann sehen wir uns auf der Matte.",
      slides: [
        {
          type: "content",
          appearTime: 0,
          kicker: "Workbook · Übung 2.1",
          headline: "Ein Workbook-Stopp: Meine Bewegungs-Anamnese.",
          lead: "Was bewegst du schon? Was würdest du gerne wieder können? Was meidest du, und seit wann?",
        },
        {
          type: "checklist",
          appearTime: 13.967,
          items: [{"icon":"exercise","label":"Yogamatte oder Decke"},{"icon":"integrate","label":"Bequeme Kleidung"},{"icon":"quiet","label":"Kissen für unter den Kopf"},{"icon":"toolbox","label":"Massagerolle (optional)"},{"icon":"quiet","label":"Eine ruhige Ecke"}],
        },
        {
          type: "word",
          appearTime: 27.863,
          word: "Auf der Matte.",
        },
        {
          type: "outro",
          appearTime: 27.863,
          nextLabel: "Lektion 2.2",
          nextTitle: "Schmerzmodulierende Mobilisation",
          hint: "Weiter →",
        },
      ],
    },
  ],
};

/** Gesamtanzahl Slides der Lektion. */
export const total_2_1: number = totalSlides(lesson_2_1);

/** Flache Liste aller Slides (mit Rückverweis auf den Abschnitt). */
export const flat_2_1: FlatSlide[] = flatSlides(lesson_2_1);

export default lesson_2_1;
