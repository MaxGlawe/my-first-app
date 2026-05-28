/**
 * Masterclass „Chronischer Kreuzschmerz" — Laufzeit-Daten der Lektion 2.5
 * Atemmechanik & Beckenboden-Verbindung
 *
 * ⚠️  GENERIERT — NICHT VON HAND EDITIEREN.
 * Quelle:   src/lib/masterclass/sources/2.5.source.ts
 * Erzeugt:  node scripts/build-masterclass.mjs 2.5  (Stimme: Adrian / YYyi4prp0WCqZCPDNGu1)
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

const AUDIO_BASE = "/audio/masterclass/chronischer-kreuzschmerz/2.5";

export const lesson_2_5: Lesson = {
  id: "2.5",
  title: "Atemmechanik & Beckenboden-Verbindung",
  subtitle: "Modul 2 – Kurativ handeln · Das innere Zylinder-System & drei Atem-Tools",
  sections: [
    {
      title: "Eröffnung",
      audioSrc: `${AUDIO_BASE}/abschnitt-1.mp3`,
      transkript: "Willkommen zu Lektion 2.5. Diese Lektion behandelt etwas, das in vielen Rückenschmerz-Programmen unterschätzt oder ganz weggelassen wird: die Verbindung von Atmung und Beckenboden mit der Rumpfstabilität. Du wirst gleich verstehen, warum das nicht soft ist, sondern handfest mechanisch. Dein Zwerchfell – der wichtigste Atemmuskel – ist gleichzeitig die obere Deckplatte eines hochbelasteten Stabilisationssystems in deinem Bauchraum. Wenn diese Atmung nicht richtig funktioniert, fehlt deinem unteren Rücken einer der wichtigsten Stabilisations-Mechanismen, die der Körper kennt. Dazu kommt: Atmung ist gleichzeitig der direkteste Hebel, den du hast, um dein vegetatives Nervensystem zu beruhigen. Erinnere dich an die Alarmanlage aus Lektion 1.5: Eine ruhige Atmung kalibriert die Sensitivität nach unten. Mehrere Studien belegen das messbar. Drei Atem-Übungen heute. Plus eine kurze Anmerkung am Ende für besondere Lebensphasen wie postpartal.",
      slides: [
        {
          type: "title",
          appearTime: 0,
          kicker: "Masterclass · Modul 2 – Kurativ handeln",
          lessonLabel: "Lektion 2.5 – Atemmechanik & Beckenboden-Verbindung",
        },
        {
          type: "content",
          appearTime: 0,
          kicker: "Oft unterschätzt",
          headline: "Atmung, Beckenboden und Rumpfstabilität – eng verbunden.",
          lead: "In vielen Rückenschmerz-Programmen unterschätzt oder ganz weggelassen.",
        },
        {
          type: "content",
          appearTime: 14.048,
          kicker: "Nicht soft, sondern mechanisch",
          headline: "Dein Zwerchfell ist die obere Deckplatte eines Stabilisationssystems.",
          lead: "Funktioniert die Atmung nicht, fehlt dem unteren Rücken einer der wichtigsten Stabilisations-Mechanismen, die der Körper kennt.",
        },
        {
          type: "content",
          appearTime: 35.666,
          kicker: "Erinnere dich an die Alarmanlage",
          headline: "Atmung ist der direkteste Hebel ans vegetative Nervensystem.",
          lead: "Eine ruhige Atmung kalibriert die Sensitivität nach unten – mehrere Studien belegen das messbar.",
        },
        {
          type: "statement",
          appearTime: 51.677,
          text: "Atmung ist Stabilisation. Und der direkteste Hebel ans Nervensystem.",
          emphasis: "Stabilisation",
        },
      ],
    },
    {
      title: "Das innere Zylinder-System",
      audioSrc: `${AUDIO_BASE}/abschnitt-2.mp3`,
      transkript: "Stell dir deinen Bauchraum vor wie einen Zylinder. Diesen Zylinder kennst du noch nicht in dieser Form – aber er ist die zentrale stabilisierende Einheit deines Rumpfes. Die Deckplatte oben: das Zwerchfell. Dein wichtigster Atemmuskel. Bei der Einatmung kontrahiert es sich nach unten, drückt also auf die Bauchorgane. Die Bodenplatte unten: der Beckenboden. Ein Geflecht aus Muskeln und Bindegewebe, das den Beckenausgang abschließt. Er reagiert reflexartig auf das Zwerchfell – bei der Einatmung dehnt er sich leicht, bei der Ausatmung zieht er sich leicht zusammen. Die Seitenwände: die Bauchmuskulatur, vor allem der Transversus abdominis, den du in Lektion 2.3 schon kennengelernt hast. Die Rückwand: der Multifidus und die kleinen tiefen Rückenmuskeln, die direkt an der Wirbelsäule ansetzen. Dieser Zylinder erzeugt durch koordiniertes Zusammenspiel den sogenannten intraabdominalen Druck. Klingt technisch, ist aber zentral. Dieser Druck stabilisiert deine Wirbelsäule von innen, fast so wie Luft in einem Reifen den Reifen stabilisiert. Wenn der Druck gut aufgebaut wird, hast du eine innere Stütze für deine Lendenwirbelsäule. Diese innere Stütze brauchst du nicht nur beim Heben schwerer Lasten. Du brauchst sie bei jedem Aufstehen, bei jedem Husten, bei jedem Niesen, bei jedem Aufrichten aus dem Sitz. Sie ist eine Hintergrund-Funktion, die du normalerweise nicht bewusst wahrnimmst – die aber unermüdlich für dich arbeitet. Und das wichtigste: Sie wird gesteuert durch deine Atmung.",
      slides: [
        {
          type: "content",
          appearTime: 0,
          kicker: "Ein Bild",
          headline: "Stell dir deinen Bauchraum vor wie einen Zylinder.",
          lead: "Die zentrale stabilisierende Einheit deines Rumpfes.",
        },
        {
          type: "reveal-list",
          appearTime: 10.379,
          kicker: "Vier Wände einer Kammer",
          title: "Der innere Zylinder",
          items: [{"label":"Deckplatte oben – das Zwerchfell, dein wichtigster Atemmuskel"},{"label":"Bodenplatte unten – der Beckenboden, reagiert reflexartig auf das Zwerchfell"},{"label":"Seitenwände – die Bauchmuskulatur, vor allem der Transversus abdominis"},{"label":"Rückwand – der Multifidus und die tiefen Rückenmuskeln"}],
        },
        {
          type: "content",
          appearTime: 46.846,
          kicker: "Die Reifen-Metapher",
          headline: "Der intraabdominale Druck stabilisiert die Wirbelsäule von innen.",
          lead: "Fast so wie Luft in einem Reifen den Reifen stabilisiert – eine innere Stütze für deine Lendenwirbelsäule.",
        },
        {
          type: "content",
          appearTime: 67.395,
          kicker: "Eine Hintergrund-Funktion",
          headline: "Du brauchst sie bei jedem Aufstehen, Husten, Niesen, Aufrichten.",
          lead: "Eine Hintergrund-Funktion, die du normalerweise nicht bewusst wahrnimmst – die aber unermüdlich für dich arbeitet.",
        },
        {
          type: "statement",
          appearTime: 84.033,
          text: "Innere Stabilität entsteht durch Druck, nicht durch Anspannung. Und der Druck wird gesteuert durch deine Atmung.",
          emphasis: "durch deine Atmung",
        },
      ],
    },
    {
      title: "Was bei chronischem Schmerz schiefläuft",
      audioSrc: `${AUDIO_BASE}/abschnitt-3.mp3`,
      transkript: "Bei chronischem Rückenschmerz funktioniert dieser Zylinder oft nicht mehr richtig. Mehrere Probleme treten auf: Erstens: Brustatmung statt Bauchatmung. Viele Menschen mit chronischem Schmerz – oder mit chronischem Stress, was sich oft überschneidet – atmen primär in den oberen Brustkorb. Schultern heben sich, Bauch bewegt sich kaum. Das Zwerchfell macht nur kleine Bewegungen. Damit funktioniert die obere Deckplatte des Zylinders schlecht. Zweitens: Permanente Anspannung. Aus Schutzreflex spannen sich Bauchmuskeln und Beckenboden permanent leicht an. Das fühlt sich vielleicht nicht spürbar an, aber es verhindert, dass das Zwerchfell sich richtig bewegen kann. Es drückt quasi gegen eine angespannte Bauchwand. Resultat: weniger Atmung, weniger Stabilität. Drittens: Beckenboden-Dysfunktion. Der Beckenboden kann zu schwach sein – das ist klassisch nach Schwangerschaften, manchmal auch im Alter. Oder er kann zu angespannt sein – das ist überraschend häufig bei chronischen Schmerzen, besonders wenn Stress eine Rolle spielt. Beides stört die Zylinder-Funktion. Was wir gleich üben, adressiert all diese drei Punkte: Wir trainieren freie Zwerchfell-Bewegung. Wir lernen, Bauchwand und Beckenboden bei Bedarf zu entspannen und zu aktivieren. Und wir verbinden Atmung mit Aktivierung im richtigen Timing.",
      slides: [
        {
          type: "content",
          appearTime: 0,
          kicker: "Drei Probleme",
          headline: "Bei chronischem Schmerz funktioniert der Zylinder oft nicht mehr richtig.",
        },
        {
          type: "content",
          appearTime: 6.548,
          kicker: "Erstens · Brustatmung",
          headline: "Atmung in den oberen Brustkorb – das Zwerchfell bewegt sich kaum.",
          lead: "Schultern heben sich, der Bauch bewegt sich kaum. Damit funktioniert die obere Deckplatte des Zylinders schlecht.",
        },
        {
          type: "content",
          appearTime: 25.414,
          kicker: "Zweitens · Permanente Anspannung",
          headline: "Bauchmuskeln und Beckenboden spannen aus Schutzreflex permanent an.",
          lead: "Das Zwerchfell drückt gegen eine angespannte Bauchwand. Resultat: weniger Atmung, weniger Stabilität.",
        },
        {
          type: "content",
          appearTime: 46.033,
          kicker: "Drittens · Beckenboden-Dysfunktion",
          headline: "Der Beckenboden kann zu schwach oder zu angespannt sein.",
          lead: "Zu schwach klassisch nach Schwangerschaften; zu angespannt überraschend häufig bei chronischem Schmerz. Beides stört die Zylinder-Funktion.",
        },
        {
          type: "reveal-list",
          appearTime: 65.294,
          kicker: "Was wir gleich üben",
          title: "Die drei Punkte adressieren",
          items: [{"label":"Freie Zwerchfell-Bewegung trainieren"},{"label":"Bauchwand und Beckenboden entspannen und aktivieren"},{"label":"Atmung mit Aktivierung im richtigen Timing verbinden"}],
        },
      ],
    },
    {
      title: "Übung 1 – 360°-Atmung (ÜK-A1)",
      audioSrc: `${AUDIO_BASE}/abschnitt-4.mp3`,
      transkript: "Erste Übung: 360°-Atmung, auch Zwerchfellatmung genannt. Übungskarte ÜK-A1. Diese Übung lehrt dich, in alle Richtungen zu atmen – nicht nur nach vorne in den Bauch, sondern auch zu den Seiten und in den unteren Rücken. 360 Grad heißt: rundherum. Position: Setz dich aufrecht auf einen Stuhl oder leg dich auf den Rücken. Die Wirbelsäule ist in einer neutralen Position. Hände auf die unteren Rippen – nicht auf den Bauch. Die Daumen zeigen nach hinten, die Finger nach vorne, sodass du mit den Händen den unteren Rippenbogen umgreifst. Bewegung: Atme tief und langsam in deine Hände hinein. Wenn du es richtig machst, spürst du, wie sich der Rippenbogen nach allen Seiten ausdehnt – nach vorne, zu den Seiten, und sogar nach hinten gegen die Stuhllehne oder den Boden. Stell dir vor, dein Rumpf ist ein Ballon, der gleichmäßig in alle Richtungen größer wird. Beim Ausatmen entspannt sich der Rippenbogen wieder. Die Ausatmung darf länger sein als die Einatmung – etwa 4 Sekunden ein, 6 Sekunden aus. Reizarme Schiene: 5 Atemzüge, sehr ruhig. Standard: 10 Atemzüge, mit Aufmerksamkeit auf die Seitenausdehnung. Belastend: 15 bis 20 Atemzüge mit verlängerter Ausatmung – 4 Sekunden ein, 8 Sekunden aus. Häufiger Fehler: Hochatmung in die Schultern. Die Schultern sollen sich kaum bewegen. Wenn sie hochziehen, atmest du wieder in den oberen Brustkorb. Wann sinnvoll? Diese Übung ist gut für jeden Trainingseinstieg, gut für Stressmomente im Alltag, gut zum Einschlafen. Sie kostet drei Minuten und beruhigt das Nervensystem messbar.",
      slides: [
        {
          type: "term",
          appearTime: 0,
          kicker: "Übung 1 · ÜK-A1",
          term: "360°-Atmung",
        },
        {
          type: "statement",
          appearTime: 7.001,
          text: "In alle Richtungen atmen – nach vorne, zu den Seiten, in den unteren Rücken.",
          emphasis: "rundherum",
        },
        {
          type: "content",
          appearTime: 16.324,
          kicker: "Ausgangsposition",
          headline: "Hände auf die unteren Rippen – nicht auf den Bauch.",
          lead: "Aufrecht sitzen oder auf dem Rücken liegen, Wirbelsäule neutral. Daumen nach hinten, Finger nach vorne, sodass du den unteren Rippenbogen umgreifst.",
        },
        {
          type: "content",
          appearTime: 33.158,
          kicker: "Die Bewegung",
          headline: "Tief und langsam in deine Hände hineinatmen.",
          lead: "Der Rippenbogen dehnt sich nach allen Seiten aus – nach vorne, zu den Seiten, nach hinten. Wie ein Ballon, der gleichmäßig größer wird.",
        },
        {
          type: "content",
          appearTime: 51.049,
          kicker: "Der Rhythmus",
          headline: "Die Ausatmung darf länger sein als die Einatmung.",
          lead: "Etwa 4 Sekunden ein, 6 Sekunden aus – beim Ausatmen entspannt sich der Rippenbogen wieder.",
        },
        {
          type: "reveal-list",
          appearTime: 59.664,
          kicker: "ÜK-A1 · Drei Schienen",
          title: "360°-Atmung nach Tagesform",
          items: [{"label":"Reizarm – 5 Atemzüge, sehr ruhig"},{"label":"Standard – 10 Atemzüge, Aufmerksamkeit auf die Seitenausdehnung"},{"label":"Belastend – 15–20 Atemzüge, 4 s ein, 8 s aus"}],
        },
        {
          type: "content",
          appearTime: 74.327,
          dark: true,
          kicker: "Häufiger Fehler",
          headline: "Hochatmung in die Schultern.",
          lead: "Die Schultern sollen sich kaum bewegen. Wenn sie hochziehen, atmest du wieder in den oberen Brustkorb.",
        },
        {
          type: "content",
          appearTime: 83.081,
          kicker: "Wann sinnvoll",
          headline: "Gut für jeden Trainingseinstieg, für Stressmomente, zum Einschlafen.",
          lead: "Sie kostet drei Minuten und beruhigt das Nervensystem messbar.",
        },
      ],
    },
    {
      title: "Übung 2 – Beckenboden mit Atmung (ÜK-A2)",
      audioSrc: `${AUDIO_BASE}/abschnitt-5.mp3`,
      transkript: "Zweite Übung: Beckenboden-Aktivierung mit Atmung. Übungskarte ÜK-A2. Diese Übung verbindet zwei Elemente: Du lernst, deinen Beckenboden bewusst wahrzunehmen und zu steuern – und gleichzeitig verbindest du diese Steuerung mit der Atmung. Position: Setz dich aufrecht auf einen Stuhl oder leg dich auf den Rücken mit angestellten Beinen. Hände entspannt. Erst die Beckenboden-Wahrnehmung: Stell dir vor, du möchtest gleichzeitig den Strahl beim Wasserlassen unterbrechen und einen Wind verkneifen. Ohne dass dabei dein Gesäß anspannt oder du den Atem anhältst. Das ist eine milde Aktivierung der inneren Schließmuskeln und der Beckenboden-Muskulatur drumherum. Wichtig: Es ist eine milde Aktivierung. Etwa 20 Prozent dessen, was du maximal könntest. Nicht zusammenpressen, nicht den Atem anhalten. Jetzt die Atemkopplung: Bei der Einatmung lässt du den Beckenboden los – er entspannt sich. Bei der Ausatmung aktivierst du sanft die Schließmuskeln. Einatmen loslassen, Ausatmen aktivieren. Das ist die natürliche Bewegung deines Beckenbodens. Bei chronischem Schmerz ist sie oft gestört – der Beckenboden bleibt entweder dauerhaft angespannt oder reagiert nicht mehr richtig auf die Atmung. Diese Übung kalibriert ihn wieder ein. Reizarme Schiene: 5 Atemzüge mit Beckenboden-Kopplung. Standard: 10 Atemzüge, plus 3 Sekunden Halte-Phase in der Aktivierung. Belastend: 15 Atemzüge mit länger gehaltener Aktivierung – 5 Sekunden –, optional in der Vierfüßler- oder Liegestütz-Position für Beckenboden unter Last. Häufiger Fehler: Du spannst zu stark an oder ziehst Bauch- und Pomuskeln mit. Such die isolierte milde Aktivierung. Wenn das schwerfällt – was am Anfang oft so ist – üb erst mal nur die Wahrnehmung ohne Atemkopplung. Eine kurze Bemerkung: Wenn du eine konkrete Beckenboden-Problematik hast – sei es nach einer Geburt, einer Operation oder bei Inkontinenz – dann ist eine spezialisierte Beckenboden-Therapie sinnvoll. Diese Masterclass ersetzt das nicht. Wir machen hier die Grundkalibrierung, die jedem hilft. Postpartale Themen verdienen einen eigenen, spezialisierten Rahmen.",
      slides: [
        {
          type: "term",
          appearTime: 0,
          kicker: "Übung 2 · ÜK-A2",
          term: "Beckenboden mit Atmung",
        },
        {
          type: "content",
          appearTime: 7.5,
          kicker: "Was sie verbindet",
          headline: "Beckenboden bewusst wahrnehmen und steuern – gekoppelt an die Atmung.",
          lead: "Die Übung verbindet zwei Elemente: Wahrnehmung und Steuerung des Beckenbodens mit dem Atemrhythmus.",
        },
        {
          type: "content",
          appearTime: 17.844,
          kicker: "Position & Wahrnehmung",
          headline: "Den Strahl unterbrechen und einen Wind verkneifen – gleichzeitig.",
          lead: "Aufrecht sitzen oder mit angestellten Beinen liegen. Ohne dass Gesäß anspannt oder du den Atem anhältst – eine milde Aktivierung der inneren Schließmuskeln.",
        },
        {
          type: "statement",
          appearTime: 45.163,
          text: "Eine milde Aktivierung – etwa 20 Prozent. Nicht pressen, nicht den Atem anhalten.",
          emphasis: "20 Prozent",
        },
        {
          type: "content",
          appearTime: 54.021,
          kicker: "Die Atemkopplung",
          headline: "Einatmen loslassen, Ausatmen aktivieren.",
          lead: "Bei der Einatmung entspannt sich der Beckenboden, bei der Ausatmung aktivierst du sanft die Schließmuskeln.",
        },
        {
          type: "content",
          appearTime: 64.272,
          kicker: "Warum das wirkt",
          headline: "Die natürliche Bewegung des Beckenbodens wieder einkalibrieren.",
          lead: "Bei chronischem Schmerz ist sie oft gestört – der Beckenboden bleibt angespannt oder reagiert nicht mehr richtig auf die Atmung.",
        },
        {
          type: "reveal-list",
          appearTime: 75.72,
          kicker: "ÜK-A2 · Drei Schienen",
          title: "Beckenboden mit Atmung nach Tagesform",
          items: [{"label":"Reizarm – 5 Atemzüge mit Beckenboden-Kopplung"},{"label":"Standard – 10 Atemzüge, plus 3 s Halte-Phase"},{"label":"Belastend – 15 Atemzüge, 5 s gehalten, optional Vierfüßler/Liegestütz"}],
        },
        {
          type: "content",
          appearTime: 93.39,
          dark: true,
          kicker: "Häufiger Fehler",
          headline: "Zu stark anspannen oder Bauch- und Pomuskeln mitziehen.",
          lead: "Such die isolierte milde Aktivierung. Wenn das schwerfällt – am Anfang oft so – üb erst nur die Wahrnehmung ohne Atemkopplung.",
        },
        {
          type: "content",
          appearTime: 107.079,
          kicker: "Wichtiger Hinweis",
          headline: "Bei konkreter Beckenboden-Diagnose: spezialisierte Therapie.",
          lead: "Nach Geburt, Operation oder bei Inkontinenz ersetzt diese Masterclass das nicht. Hier machen wir die Grundkalibrierung, die jedem hilft.",
        },
      ],
    },
    {
      title: "Übung 3 – Box Breathing (ÜK-A3)",
      audioSrc: `${AUDIO_BASE}/abschnitt-6.mp3`,
      transkript: "Dritte Übung: Box Breathing – die Box-Atmung. Übungskarte ÜK-A3. Diese Übung ist die wirksamste Schmerz-Notfall-Übung, die ich kenne. Sie kostet drei Minuten, kann überall gemacht werden, und sie beruhigt das vegetative Nervensystem sehr direkt. Der Name kommt vom Rhythmus: Du atmest vier Sekunden ein, hältst vier Sekunden, atmest vier Sekunden aus, hältst wieder vier Sekunden. Vier mal vier – wie eine Box. Position: Sitz oder lieg ruhig. Augen geschlossen oder weicher Blick auf einen Punkt. Rhythmus: 4 Sekunden einatmen, in den Rumpf hinein, 360 Grad. 4 Sekunden halten, Bauch entspannt. 4 Sekunden ausatmen, ruhig, vollständig. 4 Sekunden halten, ruhig. Dann wieder von vorne. Reizarme Schiene: 5 Wiederholungen mit 3 Sekunden statt 4. Standard: 10 Wiederholungen mit dem vollen 4-4-4-4-Rhythmus. Belastend: 15 bis 20 Wiederholungen mit 5-5-5-5 oder sogar 6-6-6-6. Wann nutzt du Box Breathing? Erstens: als Eröffnungs-Übung deiner täglichen Bewegungsroutine – drei Minuten vor allem anderen. Zweitens, und das ist der eigentliche Hebel: als Schmerz-Akut-Tool. Wenn du eine Schmerzspitze hast, wenn dein Schmerz hochfährt, wenn du gestresst bist und es im Rücken zieht – drei Minuten Box Breathing senken in der Mehrheit der Fälle die Schmerzintensität messbar. Nicht weg, aber runter. Plus dein Nervensystem schaltet vom Sympathikus-Modus, also Stress, in den Parasympathikus-Modus, also Erholung. In Modul 4 wird Box Breathing zentraler Teil deines Flare-up-Protokolls.",
      slides: [
        {
          type: "term",
          appearTime: 0,
          kicker: "Übung 3 · ÜK-A3",
          term: "Box Breathing",
        },
        {
          type: "statement",
          appearTime: 4.841,
          text: "Die wirksamste Schmerz-Notfall-Übung – drei Minuten, überall machbar.",
          emphasis: "Schmerz-Notfall-Übung",
        },
        {
          type: "content",
          appearTime: 14.71,
          kicker: "Woher der Name kommt",
          headline: "Vier Sekunden ein, vier halten, vier aus, vier halten.",
          lead: "Vier mal vier – wie die vier Seiten einer Box.",
        },
        {
          type: "content",
          appearTime: 24.334,
          kicker: "Ausgangsposition",
          headline: "Sitz oder lieg ruhig.",
          lead: "Augen geschlossen oder weicher Blick auf einen Punkt.",
        },
        {
          type: "reveal-list",
          appearTime: 30.36,
          kicker: "Die vier Seiten der Box",
          title: "Der Rhythmus",
          items: [{"label":"4 Sekunden einatmen – in den Rumpf hinein, 360 Grad"},{"label":"4 Sekunden halten – Bauch entspannt"},{"label":"4 Sekunden ausatmen – ruhig, vollständig"},{"label":"4 Sekunden halten – ruhig, dann von vorne"}],
        },
        {
          type: "reveal-list",
          appearTime: 45.999,
          kicker: "ÜK-A3 · Drei Schienen",
          title: "Box Breathing nach Tagesform",
          items: [{"label":"Reizarm – 5 Wiederholungen mit 3 statt 4 Sekunden"},{"label":"Standard – 10 Wiederholungen, voller 4-4-4-4-Rhythmus"},{"label":"Belastend – 15–20 Wiederholungen mit 5-5-5-5 oder 6-6-6-6"}],
        },
        {
          type: "content",
          appearTime: 62.821,
          kicker: "Wann nutzen · Erstens",
          headline: "Als Eröffnungs-Übung deiner täglichen Bewegungsroutine.",
          lead: "Drei Minuten vor allem anderen.",
        },
        {
          type: "content",
          appearTime: 70.449,
          dark: true,
          kicker: "Wann nutzen · Zweitens",
          headline: "Der eigentliche Hebel: als Schmerz-Akut-Tool.",
          lead: "Drei Minuten senken in der Mehrheit der Fälle die Schmerzintensität messbar. Nicht weg, aber runter – das Nervensystem schaltet vom Stress- in den Erholungs-Modus.",
        },
        {
          type: "statement",
          appearTime: 94.157,
          text: "In Modul 4 wird Box Breathing zentraler Teil deines Flare-up-Protokolls.",
          emphasis: "Flare-up-Protokolls",
        },
      ],
    },
    {
      title: "Integration",
      audioSrc: `${AUDIO_BASE}/abschnitt-7.mp3`,
      transkript: "Wie nutzt du diese drei Atem-Werkzeuge im Alltag? ÜK-A1, die 360°-Atmung, als tägliche Praxis – drei bis fünf Minuten, am liebsten morgens oder vor dem Schlafen. ÜK-A2, die Beckenboden-Atmung, am Anfang ein- bis zweimal pro Woche zur Wahrnehmungsschulung. Sobald du sie integriert hast, koppelt sich der Beckenboden in jeder anderen Atmung automatisch mit. ÜK-A3, das Box Breathing, nach Bedarf – immer dann, wenn du sie brauchst. Mehrmals pro Tag ist okay. Alle drei Übungen kannst du im Sitzen machen. Sie brauchen kein Equipment. Sie sind die perfekten Übungen für den Schreibtisch, das Wartezimmer, das Auto, den Zug. Genau dort, wo Rückenschmerz oft am ehesten auftaucht.",
      slides: [
        {
          type: "content",
          appearTime: 0,
          kicker: "Integration",
          headline: "Wie nutzt du diese drei Atem-Werkzeuge im Alltag?",
        },
        {
          type: "reveal-list",
          appearTime: 3.367,
          kicker: "Drei Werkzeuge, drei Rhythmen",
          title: "So setzt du sie ein",
          items: [{"label":"A1 · 360°-Atmung – tägliche Praxis, 3–5 Minuten, morgens oder vor dem Schlafen"},{"label":"A2 · Beckenboden-Atmung – 1–2x pro Woche zur Wahrnehmungsschulung"},{"label":"A3 · Box Breathing – nach Bedarf, mehrmals pro Tag ist okay"}],
        },
        {
          type: "statement",
          appearTime: 29.884,
          text: "Kein Equipment. Im Sitzen. Genau dort, wo Rückenschmerz auftaucht.",
          emphasis: "Kein Equipment",
        },
      ],
    },
    {
      title: "Workbook & Übergang",
      audioSrc: `${AUDIO_BASE}/abschnitt-8.mp3`,
      transkript: "Im Workbook findest du Übung 2.5: Atem-Tagebuch. Du beobachtest in den nächsten drei Tagen kurz: Wie atmest du eigentlich gerade? – in unterschiedlichen Situationen: Aufstehen, Schreibtisch, Stressmomente. Diese Wahrnehmung ist die erste Stufe der Veränderung. In Lektion 2.6 geht es um eine andere Form der Dosierung – nicht innerhalb einer Übung, sondern innerhalb deines Tages. Belastungsdosierung und Pacing. Wie verhinderst du den klassischen Push-Crash-Zyklus, in den fast jeder chronische Schmerzpatient mindestens einmal pro Woche fällt? Das schauen wir uns als nächstes an. Bis gleich.",
      slides: [
        {
          type: "content",
          appearTime: 0,
          kicker: "Workbook · Übung 2.5",
          headline: "Ein Workbook-Stopp: Atem-Tagebuch über drei Tage.",
          lead: "Beobachte kurz, wie du gerade atmest – beim Aufstehen, am Schreibtisch, in Stressmomenten. Diese Wahrnehmung ist die erste Stufe der Veränderung.",
        },
        {
          type: "content",
          appearTime: 16.869,
          kicker: "Als Nächstes · Lektion 2.6",
          headline: "Belastungsdosierung und Pacing – Dosierung innerhalb deines Tages.",
          lead: "Wie verhinderst du den klassischen Push-Crash-Zyklus, in den fast jeder chronische Schmerzpatient mindestens einmal pro Woche fällt?",
        },
        {
          type: "word",
          appearTime: 34.528,
          word: "Bis gleich.",
        },
        {
          type: "outro",
          appearTime: 34.528,
          nextLabel: "Lektion 2.6",
          nextTitle: "Belastungsdosierung & Pacing-Prinzipien",
          hint: "Weiter →",
        },
      ],
    },
  ],
};

/** Gesamtanzahl Slides der Lektion. */
export const total_2_5: number = totalSlides(lesson_2_5);

/** Flache Liste aller Slides (mit Rückverweis auf den Abschnitt). */
export const flat_2_5: FlatSlide[] = flatSlides(lesson_2_5);

export default lesson_2_5;
