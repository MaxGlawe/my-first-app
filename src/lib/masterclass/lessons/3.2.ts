/**
 * Masterclass „Chronischer Kreuzschmerz" — Laufzeit-Daten der Lektion 3.2
 * Haltungs-Mythen entzaubert
 *
 * ⚠️  GENERIERT — NICHT VON HAND EDITIEREN.
 * Quelle:   src/lib/masterclass/sources/3.2.source.ts
 * Erzeugt:  node scripts/build-masterclass.mjs 3.2  (Stimme: Adrian / YYyi4prp0WCqZCPDNGu1)
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

const AUDIO_BASE = "/audio/masterclass/chronischer-kreuzschmerz/3.2";

export const lesson_3_2: Lesson = {
  id: "3.2",
  title: "Haltungs-Mythen entzaubert",
  subtitle: "Modul 3 – Prävention · Variabilität schlägt Perfektion",
  sections: [
    {
      title: "Eröffnung",
      audioSrc: `${AUDIO_BASE}/abschnitt-1.mp3`,
      transkript: "Willkommen zu Lektion 3.2. Diese Lektion ist gleichzeitig befreiend und kontrovers. Befreiend, weil viele Patienten nach dieser Lektion eine alte Last loswerden. Kontrovers, weil gleich Dinge gesagt werden, die deinem Eindruck von gesunder Haltung widersprechen werden. Worum geht es? Um drei Haltungs-Mythen, die in unserer Kultur als gesichert gelten – aber die wissenschaftliche Datenlage entweder nicht stützt oder direkt widerlegt. Wenn du diese Mythen ablegen kannst, wird dein Alltag deutlich entspannter.",
      slides: [
        {
          type: "title",
          appearTime: 0,
          kicker: "Masterclass · Modul 3 – Prävention",
          lessonLabel: "Lektion 3.2 – Haltungs-Mythen entzaubert",
        },
        {
          type: "content",
          appearTime: 0,
          kicker: "Lektion 3.2",
          headline: "Befreiend und kontrovers zugleich.",
          lead: "Befreiend, weil viele eine alte Last loswerden. Kontrovers, weil gleich Dinge gesagt werden, die deinem Eindruck von gesunder Haltung widersprechen.",
        },
        {
          type: "content",
          appearTime: 17.914,
          kicker: "Worum es geht",
          headline: "Drei Haltungs-Mythen, die als gesichert gelten – aber die Datenlage nicht stützt.",
          lead: "Wenn du sie ablegen kannst, wird dein Alltag deutlich entspannter.",
        },
      ],
    },
    {
      title: "Mythos 1: Die eine richtige Haltung",
      audioSrc: `${AUDIO_BASE}/abschnitt-2.mp3`,
      transkript: "Mythos 1: Es gibt eine richtige Haltung. Wer sie nicht hat, schadet seinem Rücken. Diese Idee ist tief verankert. Du kennst die Bilder: Aufrechter Oberkörper, Schultern zurück, leichter Bauch eingezogen, Kopf gerade über der Wirbelsäule, gesunde S-Form der Wirbelsäule. So muss es aussehen, sonst tut der Rücken bald weh. Was sagt die aktuelle Forschung dazu? Erstaunlich wenig Bestätigung. Eine ganze Reihe von Studien hat verglichen: Wer hat statistisch häufiger Rückenschmerz – Menschen mit guter Haltung oder Menschen mit schlechter Haltung nach klassischer Definition? Die Antwort ist: kaum ein Unterschied. Manche Studien finden sogar einen umgekehrten Effekt – Menschen mit als perfekt bewerteter Haltung haben tendenziell mehr Rückenschmerz, weil sie sich permanent in eine angeblich richtige Position zwingen. Was zählt wirklich? Nicht eine bestimmte Form, sondern Variabilität. Dein Rücken hat keine Probleme mit einer Position – auch wenn sie schlecht aussieht. Er hat Probleme damit, zu lange in derselben Position zu sein, egal welcher. Das gilt für Sitzen, Stehen, Liegen. Eine perfekte Haltung, eine Stunde lang gehalten, belastet deine Strukturen stärker als eine schlechte Haltung, die du alle zehn Minuten wechselst. Die Bewegung ist der Schutz – nicht die Form. Was bedeutet das praktisch? Du kannst aufhören, dich permanent zu beobachten und zu korrigieren. Du kannst auch mal in einem alten Sessel zusammensacken. Du kannst auch mal mit hochgezogenen Schultern am Schreibtisch sitzen, weil du gerade konzentriert bist. Du musst nicht ständig deine eigene Haltung kontrollieren – das raubt dir Energie und verschlimmert oft genau das Problem, das du vermeiden willst.",
      slides: [
        {
          type: "statement",
          appearTime: 0,
          text: "Mythos 1: Es gibt die eine richtige Haltung – wer sie nicht hat, schadet seinem Rücken.",
          emphasis: "Mythos 1",
        },
        {
          type: "content",
          appearTime: 5.097,
          kicker: "Tief verankert",
          headline: "Du kennst die Bilder: aufrecht, Schultern zurück, gesunde S-Form.",
          lead: "Oberkörper aufrecht, Bauch leicht eingezogen, Kopf gerade über der Wirbelsäule – so muss es aussehen, sonst tut der Rücken bald weh.",
        },
        {
          type: "content",
          appearTime: 20.561,
          dark: true,
          kicker: "Was die Forschung sagt",
          headline: "Gute Haltung, schlechte Haltung – kaum ein Unterschied beim Rückenschmerz.",
          lead: "Eine ganze Reihe von Studien hat genau das verglichen. Die Bestätigung für die eine richtige Haltung? Erstaunlich wenig.",
        },
        {
          type: "content",
          appearTime: 37.604,
          kicker: "Der umgekehrte Effekt",
          headline: "Wer sich permanent in die perfekte Position zwingt, hat tendenziell mehr Schmerz.",
          lead: "Manche Studien finden sogar das Gegenteil: die als perfekt bewertete Haltung kostet, weil sie ständig gehalten werden muss.",
        },
        {
          type: "content",
          appearTime: 49.528,
          kicker: "Was wirklich zählt",
          headline: "Nicht die Form ist das Problem – sondern zu lange dieselbe Position.",
          lead: "Dein Rücken hat keine Probleme mit einer Position, auch wenn sie schlecht aussieht. Er hat Probleme damit, zu lange in derselben zu bleiben – egal welcher.",
        },
        {
          type: "content",
          appearTime: 61.509,
          kicker: "Sitzen, Stehen, Liegen",
          headline: "Eine Stunde perfekt gehalten belastet mehr als eine schlechte Haltung, alle zehn Minuten gewechselt.",
          lead: "Die Bewegung ist der Schutz – nicht die Form.",
        },
        {
          type: "content",
          appearTime: 73.874,
          kicker: "Was das praktisch heißt",
          headline: "Du darfst zusammensacken. Du musst dich nicht permanent korrigieren.",
          lead: "Mal in den alten Sessel sinken, mal konzentriert mit hochgezogenen Schultern sitzen: ständige Selbstkontrolle raubt Energie und verschlimmert oft genau das Problem, das du vermeiden willst.",
        },
        {
          type: "statement",
          appearTime: 73.874,
          text: "Variabilität schlägt Perfektion. Immer.",
          emphasis: "Variabilität",
        },
      ],
    },
    {
      title: "Mythos 2: Sitzen ist das neue Rauchen",
      audioSrc: `${AUDIO_BASE}/abschnitt-3.mp3`,
      transkript: "Mythos 2: Sitzen ist das neue Rauchen. Lange Sitzphasen zerstören deinen Rücken. Auch ein populärer Satz. Sitzen sei genauso gesundheitsschädlich wie Rauchen, gerade für den Rücken. Studien zeigen Zusammenhänge zwischen langem Sitzen und Rückenschmerzen, also muss Sitzen das Problem sein. Richtig? Nicht ganz. Die Forschungslage ist differenzierter. Was wirklich schaden kann, ist nicht Sitzen an sich. Es ist Mangel an Bewegung. Wenn du acht Stunden am Tag sitzt und dich sonst nicht bewegst, ist das ein Problem. Wenn du acht Stunden am Tag sitzt und dich ansonsten regelmäßig bewegst – einkaufen, spazieren, Treppen steigen, Übungen machen – dann ist das deutlich weniger ein Problem. Sitzen ist auch nicht die Schmerzursache. Studien zeigen: Menschen, die acht Stunden sitzen, haben statistisch leicht häufiger Rückenschmerz als Menschen, die fünf Stunden sitzen. Leicht häufiger, nicht dramatisch. Und der Effekt verschwindet weitgehend, wenn man andere Faktoren – Bewegungsmangel, Stress, Schlafmangel – mit berücksichtigt. Was wirklich zählt? Wieder Variabilität. Lang sitzen ohne Unterbrechung – das ist das Problem. Lang sitzen mit Mikro-Pausen, mit gelegentlichem Aufstehen, mit Positionswechsel – das ist deutlich weniger problematisch. Wenn dein Beruf Sitzen erfordert, dann darfst du sitzen. Du musst dich nicht schuldig fühlen für deine acht Stunden Schreibtisch. Was du brauchst, ist Mikro-Bewegung während des Sitzens und zwischendurch. Ein bisschen wackeln. Alle 30 Minuten mal aufstehen. Kurze Treppenrunde in der Pause. Das ist die richtige Antwort – nicht Sitzen verbieten.",
      slides: [
        {
          type: "statement",
          appearTime: 0,
          text: "Mythos 2: Sitzen ist das neue Rauchen – lange Sitzphasen zerstören deinen Rücken.",
          emphasis: "Mythos 2",
        },
        {
          type: "content",
          appearTime: 4.969,
          kicker: "Ein populärer Satz",
          headline: "Sitzen so schädlich wie Rauchen – also muss Sitzen das Problem sein. Richtig?",
          lead: "Studien zeigen Zusammenhänge zwischen langem Sitzen und Rückenschmerzen. Der Schluss liegt nahe – aber stimmt er?",
        },
        {
          type: "content",
          appearTime: 18.309,
          dark: true,
          kicker: "Differenzierter",
          headline: "Nicht das Sitzen schadet – der Bewegungsmangel drumherum.",
          lead: "Acht Stunden sitzen und sonst nichts: ein Problem. Acht Stunden sitzen und sich ansonsten regelmäßig bewegen – einkaufen, spazieren, Treppen, Übungen –: deutlich weniger.",
        },
        {
          type: "content",
          appearTime: 40.182,
          kicker: "Nicht die Ursache",
          headline: "Acht statt fünf Stunden sitzen: leicht häufiger Schmerz – nicht dramatisch.",
          lead: "Und der Effekt verschwindet weitgehend, wenn man Bewegungsmangel, Stress und Schlafmangel mit berücksichtigt.",
        },
        {
          type: "statement",
          appearTime: 58.886,
          text: "Nicht Sitzen ist das Problem. Bewegungsmangel ist das Problem.",
          emphasis: "Bewegungsmangel",
        },
        {
          type: "content",
          appearTime: 71.715,
          kicker: "Kein Schuldgefühl",
          headline: "Wenn dein Beruf Sitzen erfordert, dann darfst du sitzen.",
          lead: "Du musst dich nicht schuldig fühlen für deine acht Stunden Schreibtisch.",
        },
        {
          type: "reveal-list",
          appearTime: 78.252,
          kicker: "Die richtige Antwort",
          title: "Mikro-Bewegung statt Sitz-Verbot",
          items: [{"label":"Mikro-Bewegung beim Sitzen – ein bisschen wackeln"},{"label":"Alle 30 Minuten mal aufstehen"},{"label":"Pausen-Treppe statt Aufzug"}],
        },
      ],
    },
    {
      title: "Mythos 3: Stehpulte heilen den Rücken",
      audioSrc: `${AUDIO_BASE}/abschnitt-4.mp3`,
      transkript: "Mythos 3: Wer ein Stehpult hat, hat das Sitz-Problem gelöst. Stehpulte sind ein Mode-Phänomen der letzten zehn Jahre. Die Idee: Wenn Sitzen schädlich ist, ist Stehen die Lösung. Studien zeigen aber: Wer acht Stunden steht, hat ähnliche oder andere Probleme als wer acht Stunden sitzt. Stehen erzeugt andere Belastungs-Muster, die ihrerseits zu Beschwerden führen können – vor allem in der unteren Wirbelsäule, in den Knien und Füßen. Was wirklich hilft, ist – wieder mal – Wechsel. Höhenverstellbare Pulte, die du zwischen Sitzen und Stehen flexibel nutzt, sind viel sinnvoller als reine Stehpulte. Du sitzt 30 Minuten, du stehst 30 Minuten, du sitzt wieder, du gehst kurz raus. Das Wechselspiel ist der Schutz. Wenn du kein höhenverstellbares Pult hast, ist das auch nicht das Drama. Du kannst Variabilität anders erzeugen – mit Pausen, mit Positions-Wechseln, mit Übungen zwischendurch. Das Pult ist nicht das Problem. Die Bewegung drumherum ist die Lösung.",
      slides: [
        {
          type: "statement",
          appearTime: 0,
          text: "Mythos 3: Wer ein Stehpult hat, hat das Sitz-Problem gelöst.",
          emphasis: "Mythos 3",
        },
        {
          type: "content",
          appearTime: 3.936,
          dark: true,
          kicker: "Ein Mode-Phänomen",
          headline: "Acht Stunden stehen hat ähnliche oder andere Probleme als acht Stunden sitzen.",
          lead: "Die Idee klingt logisch: ist Sitzen schädlich, ist Stehen die Lösung. Doch Stehen erzeugt eigene Belastungs-Muster – vor allem in der unteren Wirbelsäule, den Knien und Füßen.",
        },
        {
          type: "content",
          appearTime: 25.577,
          kicker: "Was wirklich hilft",
          headline: "Wechsel: 30 Minuten sitzen, 30 Minuten stehen, wieder sitzen, kurz raus.",
          lead: "Höhenverstellbare Pulte, flexibel zwischen Sitzen und Stehen genutzt, sind viel sinnvoller als reine Stehpulte. Das Wechselspiel ist der Schutz.",
        },
        {
          type: "statement",
          appearTime: 41.773,
          text: "Das Pult ist nicht das Problem. Die Bewegung drumherum ist die Lösung.",
          emphasis: "die Bewegung drumherum",
        },
      ],
    },
    {
      title: "Was wirklich zählt: Variabilität",
      audioSrc: `${AUDIO_BASE}/abschnitt-5.mp3`,
      transkript: "Was gerade beschrieben wurde – Variabilität – ist tatsächlich der zentrale Faktor, den die Forschung konsistent findet. Drei Dinge, an denen du dich orientieren kannst. Erstens: Die nächste Haltung ist die beste Haltung. Egal wie du gerade sitzt oder stehst – die beste Haltung ist die, in die du als nächstes wechselst. Sitzen, stehen, lehnen, hocken, liegen – alles gut, solange du wechselst. Zweitens: Bewegung schlägt Position. Selbst eine schlechte Position ist okay, solange du dabei kleine Bewegungen machst. Zappel mit den Füßen. Streck die Arme. Roll mit den Schultern. Diese Mikro-Bewegungen halten Gewebe durchblutet und Nervensystem in Sicherheit. Drittens: Dein Körper kennt sich selbst. Wenn du in einer Position spürst, dass du sie gleich loswerden willst, glaub diesem Signal. Wechsel. Das Signal ist klüger als jede ergonomische Empfehlung. Wenn du in einer Position sehr lange entspannt bist, ist das auch in Ordnung – du musst nicht zwanghaft alle dreißig Sekunden wechseln. Was du nach dieser Lektion nicht mehr tun musst: dich selbst zur Haltung erziehen. Permanent kontrollieren, ob du gerade richtig sitzt. Schuldgefühle haben, wenn du im Sofa zusammensackst. Diese mentale Last fällt weg.",
      slides: [
        {
          type: "content",
          appearTime: 0,
          kicker: "Der zentrale Faktor",
          headline: "Variabilität ist das, was die Forschung konsistent findet.",
          lead: "Drei Dinge, an denen du dich orientieren kannst.",
        },
        {
          type: "content",
          appearTime: 10.995,
          kicker: "Prinzip 1",
          headline: "Die nächste Haltung ist die beste Haltung.",
          lead: "Egal wie du gerade sitzt oder stehst – sitzen, stehen, lehnen, hocken, liegen ist alles gut, solange du wechselst.",
        },
        {
          type: "content",
          appearTime: 25.867,
          kicker: "Prinzip 2",
          headline: "Bewegung schlägt Position.",
          lead: "Selbst eine schlechte Position ist okay mit kleinen Bewegungen: mit den Füßen zappeln, die Arme strecken, die Schultern rollen. Das hält Gewebe durchblutet und das Nervensystem in Sicherheit.",
        },
        {
          type: "content",
          appearTime: 40.519,
          kicker: "Prinzip 3",
          headline: "Dein Körper kennt sich selbst – vertrau dem Signal.",
          lead: "Willst du eine Position loswerden, glaub dem Signal und wechsle. Es ist klüger als jede ergonomische Empfehlung. Und bist du lange entspannt, musst du nicht zwanghaft alle dreißig Sekunden wechseln.",
        },
        {
          type: "content",
          appearTime: 59.095,
          kicker: "Was wegfällt",
          headline: "Keine Selbstkontrolle, keine Schuldgefühle mehr im Sofa.",
          lead: "Du musst dich nicht mehr zur Haltung erziehen oder permanent kontrollieren, ob du richtig sitzt. Diese mentale Last fällt weg.",
        },
        {
          type: "statement",
          appearTime: 59.095,
          text: "Du kannst aufhören, dich zur Haltung zu erziehen.",
          emphasis: "aufhören",
        },
      ],
    },
    {
      title: "Praktische Empfehlungen",
      audioSrc: `${AUDIO_BASE}/abschnitt-6.mp3`,
      transkript: "Wenn du an deinem Arbeitsplatz – oder grundsätzlich im Alltag – die Variabilitäts-Idee umsetzen willst, drei konkrete Tipps. Erstens: Mehrere Sitz-Optionen. Wechsel zwischen Stuhl, Hocker und – wenn möglich – Stehen. Ein höhenverstellbarer Schreibtisch ist eine gute Investition, aber kein Muss. Ein zweiter Stuhl mit anderer Sitzform geht auch. Zweitens: Bewegungs-Trigger. Wir kommen in Modul 4 ausführlich darauf zurück. Aber schon jetzt: Verknüpfe Positionswechsel mit anderen Aktivitäten, die ohnehin passieren. Beim Telefonieren stehst du. Wenn der Computer hochfährt, machst du fünf Hip Hinges. Wenn das Mailprogramm öffnet, machst du eine Cat-Cow. Solche Mikro-Anker helfen, die Variabilität nicht zu vergessen. Drittens: Spaziergänge in den Tag bauen. Mittagspause: zehn Minuten draußen gehen. Nach Feierabend: nicht direkt heim, sondern eine Runde drehen. Wenn du nicht ins Büro fährst, ein kurzer Vor- und Nach-Arbeit-Spaziergang als Ritual. Bewegung ist dein wichtigster Variabilitäts-Generator – und sie hat zusätzlich messbar schmerzreduzierende Effekte.",
      slides: [
        {
          type: "content",
          appearTime: 0,
          kicker: "Praktisch",
          headline: "Drei konkrete Tipps, um Variabilität in den Alltag zu bringen.",
        },
        {
          type: "content",
          appearTime: 6.548,
          kicker: "Tipp 1 · Mehrere Sitz-Optionen",
          headline: "Wechsel zwischen Stuhl, Hocker und – wenn möglich – Stehen.",
          lead: "Ein höhenverstellbarer Schreibtisch ist eine gute Investition, aber kein Muss. Ein zweiter Stuhl mit anderer Sitzform geht auch.",
        },
        {
          type: "content",
          appearTime: 19.156,
          kicker: "Tipp 2 · Bewegungs-Trigger",
          headline: "Verknüpfe Positionswechsel mit Dingen, die ohnehin passieren.",
          lead: "Beim Telefonieren stehst du. Computer fährt hoch: fünf Hip Hinges. Mailprogramm öffnet: eine Cat-Cow. Solche Mikro-Anker helfen, die Variabilität nicht zu vergessen.",
        },
        {
          type: "content",
          appearTime: 40.007,
          kicker: "Tipp 3 · Spaziergänge",
          headline: "Bewegung ist dein wichtigster Variabilitäts-Generator.",
          lead: "Mittagspause zehn Minuten draußen, nach Feierabend eine Runde drehen, im Homeoffice ein Vor- und Nach-Arbeit-Spaziergang als Ritual. Bewegung wirkt zusätzlich messbar schmerzreduzierend.",
        },
      ],
    },
    {
      title: "Workbook & Übergang",
      audioSrc: `${AUDIO_BASE}/abschnitt-7.mp3`,
      transkript: "Im Workbook findest du Übung 3.2: Meine eigenen Haltungs-Mythen. Du listest dort drei Überzeugungen, die du über richtige und falsche Haltung hast – und überprüfst sie kritisch im Licht dieser Lektion. Welche kannst du loslassen? Welche willst du behalten? In der nächsten Lektion – 3.3 – kommen die unsichtbaren Schmerzmodulatoren. Schlaf, Stress, Ernährung. Drei Faktoren, die viel mehr Einfluss auf chronischen Schmerz haben, als die meisten Menschen vermuten. Wir schauen uns an, was wirklich zählt – ohne in den Diät-Wahn oder die Selbstoptimierungs-Falle zu kippen. Bis gleich.",
      slides: [
        {
          type: "content",
          appearTime: 0,
          kicker: "Workbook · Übung 3.2",
          headline: "Meine eigenen Haltungs-Mythen – drei Überzeugungen kritisch prüfen.",
          lead: "Du listest drei Überzeugungen über richtige und falsche Haltung und prüfst sie im Licht dieser Lektion: Welche kannst du loslassen? Welche willst du behalten?",
        },
        {
          type: "content",
          appearTime: 16.243,
          kicker: "Als Nächstes · Lektion 3.3",
          headline: "Die unsichtbaren Schmerzmodulatoren – Schlaf, Stress, Ernährung.",
          lead: "Drei Faktoren mit mehr Einfluss auf chronischen Schmerz, als die meisten vermuten. Was wirklich zählt – ohne Diät-Wahn, ohne Selbstoptimierungs-Falle.",
        },
        {
          type: "word",
          appearTime: 33.635,
          word: "Bis gleich.",
        },
        {
          type: "outro",
          appearTime: 33.635,
          nextLabel: "Lektion 3.3",
          nextTitle: "Schlaf, Stress, Ernährung als Schmerzmodulatoren",
          hint: "Weiter →",
        },
      ],
    },
  ],
};

/** Gesamtanzahl Slides der Lektion. */
export const total_3_2: number = totalSlides(lesson_3_2);

/** Flache Liste aller Slides (mit Rückverweis auf den Abschnitt). */
export const flat_3_2: FlatSlide[] = flatSlides(lesson_3_2);

export default lesson_3_2;
