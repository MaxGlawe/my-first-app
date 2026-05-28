/**
 * Masterclass „Chronischer Kreuzschmerz" — Laufzeit-Daten der Lektion 3.3
 * Schlaf, Stress, Ernährung als Schmerzmodulatoren
 *
 * ⚠️  GENERIERT — NICHT VON HAND EDITIEREN.
 * Quelle:   src/lib/masterclass/sources/3.3.source.ts
 * Erzeugt:  node scripts/build-masterclass.mjs 3.3  (Stimme: Adrian / YYyi4prp0WCqZCPDNGu1)
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

const AUDIO_BASE = "/audio/masterclass/chronischer-kreuzschmerz/3.3";

export const lesson_3_3: Lesson = {
  id: "3.3",
  title: "Schlaf, Stress, Ernährung als Schmerzmodulatoren",
  subtitle: "Modul 3 – Prävention · Die unsichtbaren Schmerzmodulatoren",
  sections: [
    {
      title: "Eröffnung",
      audioSrc: `${AUDIO_BASE}/abschnitt-1.mp3`,
      transkript: "Willkommen zur längsten Lektion von Modul 3. Wir behandeln heute drei Themen, die untrennbar zusammenhängen, wenn es um chronischen Schmerz geht: Schlaf, Stress, Ernährung. Diese drei sind das, was man gerne die unsichtbaren Schmerzmodulatoren nennt. Sie machen nicht den Schmerz – aber sie entscheiden mit, wie laut dein Schmerzsystem heute spricht. Wer chronischen Schmerz hat und diese drei Faktoren vernachlässigt, kämpft mit einem Bein gefesselt. Wer sie versteht und ein bisschen pflegt, hat einen massiven Hebel. Wichtig vorab: Diese Lektion wird keine Wunderdiäten anbieten, keine Schlaf-Optimierungs-Hacks, kein Bio-Hacking. Wir bleiben bei dem, was die Forschung wirklich gut belegt – und was sich realistisch im Alltag umsetzen lässt.",
      slides: [
        {
          type: "title",
          appearTime: 0,
          kicker: "Masterclass · Modul 3 – Prävention",
          lessonLabel: "Lektion 3.3 – Schlaf, Stress, Ernährung als Schmerzmodulatoren",
        },
        {
          type: "module",
          appearTime: 0,
          number: "3.3",
          title: "Drei Schmerzmodulatoren",
          lead: "Die längste Lektion von Modul 3 – drei Themen, die untrennbar zusammenhängen.",
          items: [{"label":"Schlaf"},{"label":"Stress"},{"label":"Ernährung"}],
        },
        {
          type: "content",
          appearTime: 11.842,
          kicker: "Die unsichtbaren Schmerzmodulatoren",
          headline: "Sie machen nicht den Schmerz – aber sie entscheiden mit, wie laut er heute spricht.",
          lead: "Wer sie vernachlässigt, kämpft mit einem Bein gefesselt. Wer sie versteht und ein bisschen pflegt, hat einen massiven Hebel.",
        },
        {
          type: "content",
          appearTime: 32.252,
          kicker: "Wichtig vorab",
          headline: "Keine Wunderdiäten, keine Hacks, kein Bio-Hacking.",
          lead: "Wir bleiben bei dem, was die Forschung wirklich gut belegt – und was sich realistisch im Alltag umsetzen lässt.",
        },
      ],
    },
    {
      title: "Schlaf: Der unterschätzte Schmerz-Hebel",
      audioSrc: `${AUDIO_BASE}/abschnitt-2.mp3`,
      transkript: "Beginnen wir mit Schlaf. Wenn Max Glawe nur einen Lifestyle-Faktor priorisieren müsste – es wäre Schlaf. Warum ist Schlaf so wichtig für chronischen Schmerz? Mehrere Mechanismen wirken zusammen. Erstens: Schlaf ist die Hauptregenerationszeit deines Nervensystems. Während du schläfst, werden Entzündungsstoffe abgebaut, Nervenverbindungen umgeordnet, die Sensitivität deines Schmerzsystems neu kalibriert. Wer schlecht schläft, geht mit einem aufgedrehten System in den Tag. Zweitens: Schlafmangel senkt direkt die Schmerzschwelle. Mehrere Studien zeigen: Schon eine einzige durchwachte Nacht reduziert die Schmerztoleranz messbar. Chronischer Schlafmangel über Wochen ist ein eigenständiger Risikofaktor für die Chronifizierung von Schmerz. Drittens: Schlafstörungen und chronischer Schmerz bilden einen Teufelskreis. Schmerz stört den Schlaf, schlechter Schlaf verstärkt den Schmerz, mehr Schmerz stört wieder den Schlaf. Diesen Zyklus zu durchbrechen, ist eines der effektivsten Dinge, die du tun kannst. Was funktioniert? Wir reden hier nicht über exotische Tricks. Die Basics sind das, was wirklich zählt. Regelmäßige Schlafzeiten. Dein Körper liebt Rhythmus. Wenn du jeden Tag ungefähr zur selben Zeit ins Bett gehst und aufstehst, kalibriert sich dein Schlafsystem. Schwankungen von zwei oder drei Stunden – zum Beispiel am Wochenende viel länger schlafen – stören das. Eine Schwankung von 30 bis 60 Minuten ist okay. Sieben bis neun Stunden im Bett. Die Bandbreite ist individuell, aber für die meisten Menschen liegt das gesunde Maß in diesem Bereich. Weniger als sechs Stunden chronisch ist ein eigenständiger Risikofaktor für alles Mögliche, inklusive Schmerz. Dunkler, kühler, ruhiger Schlafraum. Klingt banal, ist aber Grundlage. Verdunkelnde Vorhänge, leicht kühle Temperatur, etwa 16 bis 19 Grad, Ohrstöpsel bei Geräuschempfindlichkeit. Smartphone und Fernseher gehören nicht ins Bett. Abendliche Beruhigung. In den letzten 60 bis 90 Minuten vor dem Schlaf läuft idealerweise nichts mehr Aufregendes. Kein intensiver Sport, keine wichtigen Entscheidungen, keine Streit-Gespräche, kein endloses Social Media. Stattdessen: Lesen, ruhige Musik, Bad, Atemübung. Box Breathing aus Lektion 2.5 ist hier ein ausgezeichnetes Werkzeug. Koffein-Schnitt. Koffein hat eine Halbwertszeit von fünf bis sieben Stunden. Wer um 15 Uhr noch einen Espresso trinkt, hat um Mitternacht noch die Hälfte der Wirkung im Blut. Der Tipp von Max Glawe: kein Koffein nach 14 Uhr. Wenn das schwer ist, geh schrittweise vor. Alkohol-Vorsicht. Alkohol macht dich müde, aber er stört die Schlafqualität – vor allem die zweite Nachthälfte. Wer regelmäßig schlecht schläft und abends Alkohol trinkt, kann durch Reduktion oft schon viel verbessern. Wenn du an Schlafstörungen leidest, die sich nicht durch diese Basics verbessern – etwa Ein- oder Durchschlafstörungen über mehr als drei Monate – dann ist eine schlafmedizinische Abklärung sinnvoll. Diese Masterclass ersetzt das nicht.",
      slides: [
        {
          type: "statement",
          appearTime: 0,
          text: "Schlaf ist die wichtigste regenerative Zeit deines Schmerzsystems.",
          emphasis: "Schlaf",
        },
        {
          type: "content",
          appearTime: 8.719,
          kicker: "Mechanismus 1 · Regeneration",
          headline: "Im Schlaf kalibriert sich dein Schmerzsystem neu.",
          lead: "Entzündungsstoffe werden abgebaut, Nervenverbindungen umgeordnet, die Sensitivität neu eingestellt. Wer schlecht schläft, geht mit einem aufgedrehten System in den Tag.",
        },
        {
          type: "content",
          appearTime: 30.789,
          kicker: "Mechanismus 2 · Schmerzschwelle",
          headline: "Schon eine durchwachte Nacht senkt die Schmerztoleranz messbar.",
          lead: "Chronischer Schlafmangel über Wochen ist ein eigenständiger Risikofaktor für die Chronifizierung von Schmerz.",
        },
        {
          type: "content",
          appearTime: 48.379,
          dark: true,
          kicker: "Mechanismus 3 · Teufelskreis",
          headline: "Schmerz stört den Schlaf → schlechter Schlaf verstärkt den Schmerz → mehr Schmerz.",
          lead: "Diesen Zyklus zu durchbrechen, ist eines der effektivsten Dinge, die du tun kannst.",
        },
        {
          type: "content",
          appearTime: 65.782,
          kicker: "Was funktioniert",
          headline: "Keine exotischen Tricks – die Basics sind das, was wirklich zählt.",
        },
        {
          type: "content",
          appearTime: 72.086,
          kicker: "Basic 1 · Regelmäßigkeit",
          headline: "Dein Körper liebt Rhythmus – etwa gleiche Zeiten ins Bett und raus.",
          lead: "Schwankungen von zwei, drei Stunden – etwa am Wochenende viel länger schlafen – stören. 30 bis 60 Minuten sind okay.",
        },
        {
          type: "content",
          appearTime: 93.088,
          kicker: "Basic 2 · Dauer",
          headline: "Sieben bis neun Stunden im Bett.",
          lead: "Die Bandbreite ist individuell, aber dieses Maß passt für die meisten. Chronisch weniger als sechs Stunden ist ein eigenständiger Risikofaktor – auch für Schmerz.",
        },
        {
          type: "content",
          appearTime: 106.544,
          kicker: "Basic 3 · Schlafraum",
          headline: "Dunkel, kühl, ruhig – die unscheinbare Grundlage.",
          lead: "Verdunkelnde Vorhänge, etwa 16 bis 19 Grad, Ohrstöpsel bei Geräuschempfindlichkeit. Smartphone und Fernseher gehören nicht ins Bett.",
        },
        {
          type: "content",
          appearTime: 121.754,
          kicker: "Basic 4 · Abendliche Beruhigung",
          headline: "Die letzten 60 bis 90 Minuten: nichts Aufregendes mehr.",
          lead: "Kein intensiver Sport, keine wichtigen Entscheidungen, keine Streit-Gespräche, kein endloses Social Media. Stattdessen Lesen, ruhige Musik, Bad, Atemübung – Box Breathing aus Lektion 2.5.",
        },
        {
          type: "content",
          appearTime: 144.602,
          kicker: "Basic 5 · Koffein-Schnitt",
          headline: "Kein Koffein nach 14 Uhr.",
          lead: "Koffein hat fünf bis sieben Stunden Halbwertszeit – ein Espresso um 15 Uhr wirkt um Mitternacht noch halb. Wenn der Schnitt schwerfällt, geh schrittweise vor.",
        },
        {
          type: "content",
          appearTime: 160.845,
          kicker: "Basic 6 · Alkohol-Vorsicht",
          headline: "Alkohol macht müde – aber er stört die Schlafqualität.",
          lead: "Vor allem die zweite Nachthälfte leidet. Wer schlecht schläft und abends trinkt, kann durch Reduktion oft schon viel verbessern.",
        },
        {
          type: "content",
          appearTime: 173.128,
          dark: true,
          kicker: "Wichtiger Hinweis",
          headline: "Halten Schlafstörungen über drei Monate an: schlafmedizinische Abklärung.",
          lead: "Wenn die Basics nicht helfen – etwa Ein- oder Durchschlafstörungen über mehr als drei Monate –, ist eine ärztliche Abklärung sinnvoll. Diese Masterclass ersetzt das nicht.",
        },
      ],
    },
    {
      title: "Stress: Das parallele Schmerzsystem",
      audioSrc: `${AUDIO_BASE}/abschnitt-3.mp3`,
      transkript: "Zweiter Faktor: Stress. Stress und Schmerz teilen viele neurologische Wege. Im Gehirn sind die Schaltkreise, die Stress verarbeiten, und die Schaltkreise, die Schmerz verarbeiten, eng verbunden. Wer chronisch unter Stress steht, hat automatisch ein sensibleres Schmerzsystem. Es ist nicht so, dass Stress Schmerz macht – aber Stress verstärkt Schmerz, der bereits da ist, und er erhöht die Wahrscheinlichkeit, dass akuter Schmerz chronifiziert. Wichtig zu verstehen: Stress ist nicht gleich Stress. Akuter Stress – eine schwierige Aufgabe, eine Prüfung, ein kurzer Konflikt – ist sogar gesundheitsfördernd, solange er wieder abebbt. Was schadet, ist chronischer, nicht abebbender Stress. Stress, der wochenlang anhält. Stress, dem du nicht entkommen kannst. Klassische Stress-Quellen bei chronischen Schmerzpatienten: Berufliche Überforderung. Konflikte am Arbeitsplatz. Familiäre Belastung – kranke Angehörige, schwierige Beziehungen. Finanzielle Sorgen. Soziale Isolation. Und – das wird oft übersehen – der chronische Schmerz selbst. Wer Schmerz hat, ist gestresst von dem Schmerz. Das ist ein eigener Stressfaktor, der sich selbst verstärkt. Was kannst du tun? Vier Werkzeuge, die nachweislich wirken. Erstens: Atemübungen. Wir hatten das in Lektion 2.5. Box Breathing, 360-Grad-Atmung. Diese Tools sind die direktesten Hebel ans vegetative Nervensystem, die du hast. Drei Minuten Box Breathing ein paar Mal am Tag senken dein Stress-Niveau messbar. Das ist Forschung, nicht Esoterik. Zweitens: Bewegung. Bewegung ist eines der wirksamsten Antidepressiva und Antistress-Mittel überhaupt. Regelmäßige moderate Bewegung – nicht extremer Sport, sondern moderate Belastung dreimal pro Woche – reduziert Stresshormone, verbessert Stimmung, normalisiert Schlaf. Das ist gleichzeitig dein Schmerztraining – also doppelt nützlich. Drittens: Soziale Verbindung. Menschen mit gutem sozialen Netz haben weniger Stresshormone im Blut, schlafen besser, haben weniger chronischen Schmerz. Wer im chronischen Schmerz isoliert lebt, sollte aktiv etwas dagegen tun – Familie, Freunde, Vereine, Gruppen. Eine Stunde guter Kontakt ist therapeutisch. Viertens: Was loslassen. Das ist das schwierigste der vier. Manchmal ist Stress unausweichlich, aber oft ist er durch Überverantwortung erzeugt. Wer chronisch alles schaffen will, alle Erwartungen erfüllen, allen helfen – baut sich seinen eigenen Stress. Manchmal ist die Antwort: ein Projekt abgeben. Ein Ehrenamt beenden. Ein Mal Nein sagen. Das ist nicht egoistisch – das ist Selbsterhaltung. Wenn dein Stress so anhaltend ist, dass du dich überfordert fühlst, oder wenn Depression, Angst oder Burnout-Symptome dazukommen – dann ist professionelle Unterstützung sinnvoll. Eine Psychotherapie oder eine ärztlich begleitete Stress-Beratung kann viel verändern, parallel zu dieser Masterclass.",
      slides: [
        {
          type: "statement",
          appearTime: 0,
          text: "Stress und Schmerz teilen dieselben Schaltkreise.",
          emphasis: "dieselben Schaltkreise",
        },
        {
          type: "content",
          appearTime: 19.191,
          kicker: "Was Stress tut",
          headline: "Stress macht nicht den Schmerz – aber er verstärkt ihn und treibt die Chronifizierung.",
        },
        {
          type: "content",
          appearTime: 27.945,
          kicker: "Stress ist nicht gleich Stress",
          headline: "Akuter Stress ist sogar gesund – chronischer, nicht abebbender schadet.",
          lead: "Eine schwierige Aufgabe, eine Prüfung, ein kurzer Konflikt sind okay, solange sie abebben. Schädlich ist Stress, der wochenlang anhält und dem du nicht entkommst.",
        },
        {
          type: "reveal-list",
          appearTime: 45.036,
          kicker: "Klassische Stress-Quellen",
          title: "Wo der Stress herkommt",
          items: [{"label":"Berufliche Überforderung & Konflikte am Arbeitsplatz"},{"label":"Familiäre Belastung – kranke Angehörige, schwierige Beziehungen"},{"label":"Finanzielle Sorgen"},{"label":"Soziale Isolation"},{"label":"Der chronische Schmerz selbst – ein eigener Stressfaktor"}],
        },
        {
          type: "content",
          appearTime: 69.521,
          kicker: "Werkzeug 1 · Atemübungen",
          headline: "Atemübungen sind der direkteste Hebel ans vegetative Nervensystem.",
          lead: "Box Breathing, 360-Grad-Atmung aus Lektion 2.5: drei Minuten ein paar Mal am Tag senken dein Stress-Niveau messbar. Forschung, nicht Esoterik.",
        },
        {
          type: "content",
          appearTime: 92.881,
          kicker: "Werkzeug 2 · Bewegung",
          headline: "Bewegung ist eines der wirksamsten Antistress-Mittel überhaupt.",
          lead: "Moderate Belastung dreimal pro Woche – kein Extremsport – reduziert Stresshormone, verbessert Stimmung, normalisiert Schlaf. Gleichzeitig dein Schmerztraining: doppelt nützlich.",
        },
        {
          type: "content",
          appearTime: 113.686,
          kicker: "Werkzeug 3 · Soziale Verbindung",
          headline: "Ein gutes soziales Netz senkt Stresshormone – und Schmerz.",
          lead: "Wer im chronischen Schmerz isoliert lebt, sollte aktiv gegensteuern: Familie, Freunde, Vereine, Gruppen. Eine Stunde guter Kontakt ist therapeutisch.",
        },
        {
          type: "content",
          appearTime: 132.727,
          kicker: "Werkzeug 4 · Loslassen",
          headline: "Manchmal ist die Antwort: ein Projekt abgeben, ein Mal Nein sagen.",
          lead: "Oft ist Stress durch Überverantwortung selbst gemacht: alles schaffen, alle Erwartungen erfüllen, allen helfen. Loslassen ist nicht egoistisch – es ist Selbsterhaltung.",
        },
        {
          type: "content",
          appearTime: 155.749,
          dark: true,
          kicker: "Wichtiger Hinweis",
          headline: "Bei anhaltender Überforderung, Depression, Angst oder Burnout: professionelle Unterstützung.",
          lead: "Eine Psychotherapie oder eine ärztlich begleitete Stress-Beratung kann viel verändern – parallel zu dieser Masterclass.",
        },
      ],
    },
    {
      title: "Ernährung: Keine Wunderdiät, aber wichtige Basics",
      audioSrc: `${AUDIO_BASE}/abschnitt-4.mp3`,
      transkript: "Dritter Faktor: Ernährung. Hier wird es interessant, weil im Internet eine riesige Industrie zu diesem Thema unterwegs ist. Anti-entzündliche Diäten, ketogen, paleo, vegan, intermittierendes Fasten, alles wird gegen chronischen Schmerz beworben. Was davon stimmt? Erstaunlich wenig in der spezifischen Form. Aber: Es gibt einige Basis-Erkenntnisse, die wissenschaftlich gut belegt sind und die Max Glawe dir mitgeben möchte. Erkenntnis 1: Vermeide stark verarbeitete Lebensmittel. Industrielle Backwaren, Fertiggerichte, Wurst, Süßigkeiten, sehr zuckerhaltige Getränke – diese Lebensmittelgruppe ist konsistent mit erhöhter systemischer Entzündung verbunden. Systemische Entzündung ist nicht die Ursache chronischen Schmerzes, aber sie senkt die Schmerzschwelle und verstärkt das Schmerzempfinden. Wie sieht das praktisch aus? Du musst nicht alles aus deinem Leben streichen. Aber: Erhöhe den Anteil unverarbeiteter Lebensmittel – Gemüse, Obst, Hülsenfrüchte, Vollkorn, Nüsse, Fisch, gutes Fleisch, gute Öle. Reduziere den Anteil hochverarbeiteter Industrie-Produkte. Das ist keine Diät, das ist Ernährungs-Hygiene. Erkenntnis 2: Genug Protein. Bei chronischem Schmerz wird Gewebe ständig umgebaut – Muskeln, Sehnen, Bindegewebe, Nervenzellen. Diese Umbauten brauchen Eiweiß als Baustein. Wer zu wenig Protein isst, hat schlechtere Regeneration, schlechtere Muskelbildung, schlechtere Schmerzheilung. Faustregel: etwa 1 bis 1,2 Gramm Protein pro Kilogramm Körpergewicht und Tag. Wer 70 Kilo wiegt, braucht also 70 bis 85 Gramm Protein. Das sind etwa drei eiweißreiche Mahlzeiten pro Tag – Eier zum Frühstück, Hülsenfrüchte oder Fleisch und Fisch zum Mittag, Quark oder Skyr zum Abend. Bei intensivem Training oder über 60 Jahren eher mehr – bis 1,5 Gramm pro Kilo. Erkenntnis 3: Omega-3-Fettsäuren. Diese Fettsäuren – vor allem aus fettem Seefisch, Leinöl, Walnüssen, Chia-Samen – wirken entzündungshemmend. Wer regelmäßig zwei Portionen fetten Seefisch pro Woche isst, oder alternativ eine gute Omega-3-Ergänzung nimmt, profitiert messbar. Erkenntnis 4: Vitamin D. In Deutschland ist Vitamin-D-Mangel weit verbreitet, vor allem im Winter. Mehrere Studien zeigen Zusammenhänge zwischen niedrigem Vitamin D und chronischen Schmerzzuständen, vor allem muskulären Schmerzen. Lass deinen Wert einmal ärztlich messen. Wenn er niedrig ist, supplementiere – meistens reicht eine moderate Tagesdosis aus. Erkenntnis 5: Hydration. Klingt banal, ist aber relevant. Bandscheiben bestehen zu 75 bis 90 Prozent aus Wasser. Wer chronisch dehydriert ist, hat schlechtere Bandscheibenfunktion. Faustregel: anderthalb bis zwei Liter Wasser pro Tag, mehr bei intensivem Training oder Hitze. Was nicht funktioniert: Spezielle Anti-Schmerz-Diäten ohne medizinischen Hintergrund. Wer keine Glutenunverträglichkeit hat, hat keinen Vorteil von glutenfreier Ernährung. Wer keinen erhöhten Harnsäurewert hat, profitiert nicht von purinarmer Ernährung. Lass dich nicht in eine Diät treiben, die du nicht brauchst.",
      slides: [
        {
          type: "content",
          appearTime: 0,
          kicker: "Dritter Faktor · Ernährung",
          headline: "Von all den beworbenen Diäten stimmt erstaunlich wenig in der spezifischen Form.",
          lead: "Ketogen, paleo, vegan, Fasten – eine riesige Industrie. Aber es gibt einige Basis-Erkenntnisse, die wissenschaftlich gut belegt sind.",
        },
        {
          type: "content",
          appearTime: 25.263,
          kicker: "Erkenntnis 1 · Wenig Hochverarbeitetes",
          headline: "Stark verarbeitete Lebensmittel hängen konsistent mit systemischer Entzündung zusammen.",
          lead: "Industrielle Backwaren, Fertiggerichte, Wurst, Süßigkeiten, zuckrige Getränke. Entzündung ist nicht die Ursache des Schmerzes, aber sie senkt die Schmerzschwelle.",
        },
        {
          type: "content",
          appearTime: 46.938,
          kicker: "Praktisch",
          headline: "Anteil unverarbeiteter Lebensmittel hoch, Industrie-Produkte runter.",
          lead: "Du musst nichts komplett streichen. Mehr Gemüse, Obst, Hülsenfrüchte, Vollkorn, Nüsse, Fisch, gutes Fleisch, gute Öle. Das ist keine Diät, das ist Ernährungs-Hygiene.",
        },
        {
          type: "content",
          appearTime: 68.243,
          kicker: "Erkenntnis 2 · Genug Protein",
          headline: "Gewebe-Umbau braucht Eiweiß als Baustein.",
          lead: "Muskeln, Sehnen, Bindegewebe, Nervenzellen werden ständig umgebaut. Zu wenig Protein heißt schlechtere Regeneration, Muskelbildung und Schmerzheilung.",
        },
        {
          type: "content",
          appearTime: 86.216,
          kicker: "Faustregel · Protein",
          headline: "Etwa 1 bis 1,2 Gramm Protein pro Kilo und Tag.",
          lead: "Bei 70 Kilo also 70 bis 85 Gramm – etwa drei eiweißreiche Mahlzeiten: Eier morgens, Hülsenfrüchte oder Fleisch und Fisch mittags, Quark oder Skyr abends. Bei intensivem Training oder über 60 eher mehr.",
        },
        {
          type: "content",
          appearTime: 111.967,
          kicker: "Erkenntnis 3 · Omega-3",
          headline: "Omega-3-Fettsäuren wirken entzündungshemmend.",
          lead: "Vor allem aus fettem Seefisch, Leinöl, Walnüssen, Chia-Samen. Zwei Portionen Seefisch pro Woche – oder eine gute Ergänzung – bringen messbaren Nutzen.",
        },
        {
          type: "content",
          appearTime: 130.601,
          kicker: "Erkenntnis 4 · Vitamin D",
          headline: "Vitamin-D-Mangel ist weit verbreitet – lass deinen Wert ärztlich messen.",
          lead: "Studien zeigen Zusammenhänge zwischen niedrigem Vitamin D und chronischen, vor allem muskulären Schmerzen. Ist der Wert niedrig, reicht meist eine moderate Tagesdosis.",
        },
        {
          type: "content",
          appearTime: 150.814,
          kicker: "Erkenntnis 5 · Hydration",
          headline: "Bandscheiben bestehen zu 75 bis 90 Prozent aus Wasser.",
          lead: "Wer chronisch dehydriert ist, hat schlechtere Bandscheibenfunktion. Faustregel: anderthalb bis zwei Liter pro Tag, mehr bei Training oder Hitze.",
        },
        {
          type: "content",
          appearTime: 168.681,
          dark: true,
          kicker: "Was nicht funktioniert",
          headline: "Spezielle Anti-Schmerz-Diäten ohne medizinischen Grund bringen nichts.",
          lead: "Ohne Glutenunverträglichkeit kein Vorteil von glutenfrei, ohne erhöhte Harnsäure keiner von purinarm. Lass dich nicht in eine Diät treiben, die du nicht brauchst.",
        },
        {
          type: "statement",
          appearTime: 168.681,
          text: "Du brauchst keine Diät. Du brauchst Ernährungs-Hygiene.",
          emphasis: "Ernährungs-Hygiene",
        },
      ],
    },
    {
      title: "Wie integrieren ohne Überforderung",
      audioSrc: `${AUDIO_BASE}/abschnitt-5.mp3`,
      transkript: "Drei Themen – Schlaf, Stress, Ernährung. Das könnte überwältigend wirken. Wie integrierst du das, ohne dich zu überfordern? Der Vorschlag von Max Glawe: Pick eine Sache aus. Nicht alle drei gleichzeitig. Wenn du schlecht schläfst, beginn mit Schlaf. Setz dir das Ziel, eine Schlafhygiene-Basis aufzubauen – regelmäßige Zeiten, kein Koffein nach 14 Uhr, dunkler Raum. Gib dir vier Wochen, das stabil zu integrieren. Wenn du sehr gestresst bist, beginn mit Stress. Wähle ein konkretes Werkzeug – Box Breathing dreimal täglich, oder einen wöchentlichen längeren Spaziergang, oder eine soziale Verabredung pro Woche. Wenn du dich generell schlecht ernährst, beginn mit Ernährung. Eine konkrete Änderung – mehr Gemüse zum Mittag, oder ein Protein-Frühstück, oder Vitamin-D-Wert messen lassen. Erst wenn die erste Sache stabil läuft – die zweite anpacken. Lieber langsam und konsistent als schnell und unhaltbar.",
      slides: [
        {
          type: "content",
          appearTime: 0,
          kicker: "Ohne Überforderung",
          headline: "Pick eine Sache aus. Nicht alle drei gleichzeitig.",
          lead: "Drei Themen können überwältigend wirken. Der Weg hinein führt über einen einzigen Anfang.",
        },
        {
          type: "content",
          appearTime: 13.212,
          kicker: "Wenn du schlecht schläfst",
          headline: "Beginn mit Schlaf: regelmäßige Zeiten, kein Koffein nach 14 Uhr, dunkler Raum.",
          lead: "Bau eine Schlafhygiene-Basis auf und gib dir vier Wochen, sie stabil zu integrieren.",
        },
        {
          type: "content",
          appearTime: 25.182,
          kicker: "Wenn du gestresst bist",
          headline: "Beginn mit Stress: ein konkretes Werkzeug.",
          lead: "Box Breathing dreimal täglich, ein wöchentlicher längerer Spaziergang oder eine soziale Verabredung pro Woche.",
        },
        {
          type: "content",
          appearTime: 35.724,
          kicker: "Wenn du dich schlecht ernährst",
          headline: "Beginn mit Ernährung: eine konkrete Änderung.",
          lead: "Mehr Gemüse zum Mittag, ein Protein-Frühstück oder den Vitamin-D-Wert messen lassen.",
        },
        {
          type: "statement",
          appearTime: 45.464,
          text: "Eine Sache. Vier Wochen. Dann die nächste.",
          emphasis: "Eine Sache",
        },
      ],
    },
    {
      title: "Workbook & Übergang",
      audioSrc: `${AUDIO_BASE}/abschnitt-6.mp3`,
      transkript: "Im Workbook findest du Übung 3.3: Lifestyle-Scan. Drei kurze Selbst-Audits – wie steht es bei dir um Schlaf, Stress, Ernährung? Du markierst, wo du dich gut versorgst, wo es Verbesserungs-Potenzial gibt. Plus ein Feld: Welche eine Sache fange ich in den nächsten vier Wochen an? In der letzten Lektion von Modul 3 – Lektion 3.4 – geht es um Alltagsbewegung. Wie kommst du raus aus der Workout-Mentalität – Ich muss dreimal pro Woche Sport machen – und rein in eine Bewegungs-Lebensweise, in der Bewegung kein Termin ist, sondern dauerhafte Hintergrundmusik deines Tages. Bis gleich.",
      slides: [
        {
          type: "content",
          appearTime: 0,
          kicker: "Workbook · Übung 3.3",
          headline: "Lifestyle-Scan – drei kurze Selbst-Audits für Schlaf, Stress, Ernährung.",
          lead: "Markiere, wo du dich gut versorgst und wo Potenzial steckt. Plus ein Feld: Welche eine Sache fange ich in den nächsten vier Wochen an?",
        },
        {
          type: "content",
          appearTime: 16.87,
          kicker: "Als Nächstes · Lektion 3.4",
          headline: "Bewegung im Alltag – raus aus der Workout-Mentalität.",
          lead: "Nicht „dreimal pro Woche Sport“, sondern eine Bewegungs-Lebensweise, in der Bewegung kein Termin ist, sondern dauerhafte Hintergrundmusik deines Tages.",
        },
        {
          type: "word",
          appearTime: 36.305,
          word: "Bis gleich.",
        },
        {
          type: "outro",
          appearTime: 36.305,
          nextLabel: "Lektion 3.4",
          nextTitle: "Bewegung im Alltag",
          hint: "Weiter →",
        },
      ],
    },
  ],
};

/** Gesamtanzahl Slides der Lektion. */
export const total_3_3: number = totalSlides(lesson_3_3);

/** Flache Liste aller Slides (mit Rückverweis auf den Abschnitt). */
export const flat_3_3: FlatSlide[] = flatSlides(lesson_3_3);

export default lesson_3_3;
