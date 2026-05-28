/**
 * Masterclass „Chronischer Kreuzschmerz" — Source of Truth für Lektion 1.1
 * ========================================================================
 *
 * DIES IST DIE QUELLE. `src/lib/masterclass/lessons/1.1.ts` wird DARAUS generiert
 * (via `node scripts/build-masterclass.mjs 1.1`). Niemals lessons/1.1.ts von Hand
 * editieren — immer hier ändern und das Build-Skript neu laufen lassen.
 *
 * Aufbau identisch zu I.1/I.2/I.3 (siehe sources/I.1.source.ts für die Konvention):
 *   - `narration`: bereinigter Erzähltext (Blockquote-`>`, `[Pause Xs]`-Marker und
 *     Emphasis-`*` entfernt). EXAKT der Text, der vertont wird + Transkript.
 *   - `slides[]`: Slide-Inhalte/-Typen + `seg` (Sprech-Segment, verbatim-Teilstring
 *     der narration). Die `seg` eines Abschnitts schließen LÜCKENLOS aneinander an
 *     und ergeben aneinandergehängt wieder die ganze `narration`.
 *
 * 3.-PERSON-REGEL: 1.1 enthält ausschließlich generische Guide-Ich-Form
 * (der Sprecher erklärt). Keine Ersteller-/Credential-/Praxis-Aussagen → keine
 * Umschreibung auf „Max Glawe" nötig.
 *
 * HWG: Wortlaut der MD beibehalten, keine Heilversprechen.
 *
 * GERMAN-QUOTE-GOTCHA (CLAUDE.md): ASCII-`"` in TS-Strings bricht das Literal.
 * In narration/seg NUR einfache Anführungen ('...') oder gar keine. Die Anzeige-
 * Strings der Slides nutzen typografische Quotes („…") — die sind unproblematisch.
 */

// ── Typen (build-only; nicht an den Client) ─────────────────────────────────

/** Slide-Inhalt + Sprech-Segment. `appearTime` wird vom Build ergänzt. */
export type SourceSlide = Record<string, unknown> & {
  type: string;
  /** Verbatim-Teilstring der narration, bei dem die Slide erscheint. */
  seg: string;
};

export interface SourceSection {
  title: string;
  /** Bereinigter Erzähltext (= vertont + Transkript). */
  narration: string;
  slides: SourceSlide[];
}

export interface SourceLesson {
  id: string;
  title: string;
  subtitle: string;
  sections: SourceSection[];
}

// ── Abschnitt 1 – Eröffnung ─────────────────────────────────────────────────

const abschnitt1: SourceSection = {
  title: "Eröffnung",
  narration:
    "Willkommen in Modul 1. Wir starten hier ein Modul, das vielleicht das wichtigste der ganzen Masterclass ist – das Modul Verstehen. Warum so wichtig? Weil alles, was später kommt – die Übungen in Modul 2, die Prävention in Modul 3, die Rituale in Modul 4 – nur dann wirklich wirkt, wenn du den Sinn dahinter verstehst. Übungen ohne Verständnis funktionieren nicht. Verstehen ist die Grundlage von Selbstwirksamkeit. In dieser Lektion und der nächsten – 1.1 und 1.2 – beschäftigen wir uns mit Anatomie. Mit dem Aufbau deines unteren Rückens. Ich werde versuchen, das so zu erklären, dass du es wirklich verstehst – auch wenn du Medizin nie studiert hast. Keine Sorge, wenn dir manche Begriffe neu vorkommen. Wir gehen langsam vor. Und du kannst die Lektion jederzeit pausieren oder noch einmal hören. Ein Hinweis vorab: Du wirst hier nicht jeden anatomischen Begriff bis ins letzte Detail verstehen müssen, um später erfolgreich mit der Masterclass zu arbeiten. Was du brauchst, ist ein Grundbild von dem, was bei dir im unteren Rücken passiert. Damit du bei den Übungen weißt, wozu du sie machst. Damit du, wenn dir jemand sagt deine Bandscheibe ist kaputt, sofort erkennst, was das überhaupt heißt – und was nicht.",
  slides: [
    {
      type: "title",
      seg: "",
      kicker: "Masterclass · Modul 1 – Verstehen",
      lessonLabel:
        "Lektion 1.1 – Anatomie der LWS Teil 1: Wirbel, Bandscheiben, Facetten",
    },
    {
      type: "content",
      seg: "Willkommen in Modul 1. Wir starten hier ein Modul, das vielleicht das wichtigste der ganzen Masterclass ist – das Modul Verstehen.",
      kicker: "Willkommen in Modul 1",
      headline: "Vielleicht das wichtigste Modul der ganzen Masterclass.",
      lead: "Das Modul „Verstehen“.",
    },
    {
      type: "content",
      seg: " Warum so wichtig? Weil alles, was später kommt – die Übungen in Modul 2, die Prävention in Modul 3, die Rituale in Modul 4 – nur dann wirklich wirkt, wenn du den Sinn dahinter verstehst.",
      kicker: "Warum so wichtig?",
      headline: "Alles, was später kommt, wirkt nur mit Verständnis.",
      lead: "Übungen, Prävention, Rituale – alles baut darauf auf.",
    },
    {
      type: "statement",
      seg: " Übungen ohne Verständnis funktionieren nicht. Verstehen ist die Grundlage von Selbstwirksamkeit.",
      text: "Verstehen ist die Grundlage von Selbstwirksamkeit.",
      emphasis: "Verstehen",
    },
    {
      type: "content",
      seg: " In dieser Lektion und der nächsten – 1.1 und 1.2 – beschäftigen wir uns mit Anatomie. Mit dem Aufbau deines unteren Rückens.",
      kicker: "1.1 & 1.2 · Anatomie",
      headline: "Wir schauen uns den Aufbau deines unteren Rückens an.",
    },
    {
      type: "content",
      seg: " Ich werde versuchen, das so zu erklären, dass du es wirklich verstehst – auch wenn du Medizin nie studiert hast. Keine Sorge, wenn dir manche Begriffe neu vorkommen. Wir gehen langsam vor. Und du kannst die Lektion jederzeit pausieren oder noch einmal hören.",
      headline: "Verständlich erklärt – auch ohne Medizinstudium.",
      lead: "Wir gehen langsam vor. Pausiere jederzeit oder hör noch einmal.",
    },
    {
      type: "content",
      seg: " Ein Hinweis vorab: Du wirst hier nicht jeden anatomischen Begriff bis ins letzte Detail verstehen müssen, um später erfolgreich mit der Masterclass zu arbeiten. Was du brauchst, ist ein Grundbild von dem, was bei dir im unteren Rücken passiert.",
      kicker: "Ein Hinweis vorab",
      headline: "Du brauchst kein Detailwissen – du brauchst ein Grundbild.",
      lead: "Ein Bild davon, was bei dir im unteren Rücken passiert.",
    },
    {
      type: "reveal-list",
      seg: " Damit du bei den Übungen weißt, wozu du sie machst. Damit du, wenn dir jemand sagt deine Bandscheibe ist kaputt, sofort erkennst, was das überhaupt heißt – und was nicht.",
      kicker: "Wozu dieses Grundbild?",
      title: "Damit du",
      items: [
        { label: "bei den Übungen weißt, wozu du sie machst" },
        { label: "„deine Bandscheibe ist kaputt“ einordnen kannst" },
        { label: "erkennst, was das heißt – und was nicht" },
      ],
    },
  ],
};

// ── Abschnitt 2 – Die LWS im Überblick ──────────────────────────────────────

const abschnitt2: SourceSection = {
  title: "Die LWS im Überblick",
  narration:
    "Schauen wir uns deinen Rücken erstmal aus der Vogelperspektive an. Deine Wirbelsäule besteht aus insgesamt 24 freien Wirbeln. Sieben in der Halswirbelsäule, zwölf in der Brustwirbelsäule, fünf in der Lendenwirbelsäule. Plus Kreuzbein und Steißbein am Ende. Wir reden in dieser Masterclass fast ausschließlich über den unteren Bereich – die Lendenwirbelsäule, abgekürzt LWS. Manchmal auch lumbale Wirbelsäule genannt. Daher kommt übrigens das Wort Lumbalgie aus Lektion I.2. Die LWS hat fünf Wirbel. Sie werden durchnummeriert von oben nach unten: L1, L2, L3, L4, L5. Wenn dein Arzt also schreibt Bandscheibenvorfall L4/L5, dann meint er die Bandscheibe zwischen dem vierten und dem fünften Lendenwirbel. Das ist eine der häufigsten Lokalisationen für Beschwerden überhaupt. Was macht die LWS? Sie ist im Grunde genommen ein hochbelastetes Tragwerk. Sie trägt das ganze Gewicht deines Oberkörpers – Kopf, Arme, Brustkorb, Bauch. Sie überträgt diese Last weiter über das Kreuzbein in das Becken und von dort in die Beine. Gleichzeitig ist sie beweglich: Sie muss sich vorbeugen, rückbeugen, seitneigen, drehen. Sie ist also gleichzeitig Stütze und Gelenk. Stabilität und Beweglichkeit. Das ist eine ziemliche Aufgabe, und der untere Rücken meistert sie bei den meisten Menschen Jahrzehnte lang sehr zuverlässig. Drei Hauptkomponenten arbeiten in der LWS zusammen, und das sind die, mit denen wir uns in dieser Lektion beschäftigen: Die Wirbel selbst. Die Bandscheiben zwischen den Wirbeln. Und die Facettengelenke – die kleinen Gelenke an der Rückseite jedes Wirbels. Diese drei bilden zusammen das, was man eine funktionelle Bewegungseinheit nennt – die kleinste mechanische Einheit der Wirbelsäule.",
  slides: [
    {
      type: "content",
      seg: "Schauen wir uns deinen Rücken erstmal aus der Vogelperspektive an.",
      kicker: "Die LWS im Überblick",
      headline: "Schauen wir uns deinen Rücken aus der Vogelperspektive an.",
    },
    {
      type: "reveal-list",
      seg: " Deine Wirbelsäule besteht aus insgesamt 24 freien Wirbeln. Sieben in der Halswirbelsäule, zwölf in der Brustwirbelsäule, fünf in der Lendenwirbelsäule. Plus Kreuzbein und Steißbein am Ende.",
      kicker: "24 freie Wirbel",
      title: "Deine Wirbelsäule",
      items: [
        { label: "7 Halswirbel (HWS)" },
        { label: "12 Brustwirbel (BWS)" },
        { label: "5 Lendenwirbel (LWS)" },
        { label: "+ Kreuzbein & Steißbein" },
      ],
    },
    {
      type: "content",
      seg: " Wir reden in dieser Masterclass fast ausschließlich über den unteren Bereich – die Lendenwirbelsäule, abgekürzt LWS. Manchmal auch lumbale Wirbelsäule genannt. Daher kommt übrigens das Wort Lumbalgie aus Lektion I.2.",
      kicker: "Unser Thema",
      headline: "Wir reden fast nur über die Lendenwirbelsäule – die LWS.",
      lead: "„Lumbale Wirbelsäule“ – daher das Wort Lumbalgie aus Lektion I.2.",
    },
    {
      type: "content",
      seg: " Die LWS hat fünf Wirbel. Sie werden durchnummeriert von oben nach unten: L1, L2, L3, L4, L5.",
      kicker: "L1 · L2 · L3 · L4 · L5",
      headline: "Fünf Wirbel, durchnummeriert von oben nach unten.",
    },
    {
      type: "content",
      seg: " Wenn dein Arzt also schreibt Bandscheibenvorfall L4/L5, dann meint er die Bandscheibe zwischen dem vierten und dem fünften Lendenwirbel. Das ist eine der häufigsten Lokalisationen für Beschwerden überhaupt.",
      headline: "„L4/L5“ meint die Bandscheibe zwischen viertem und fünftem Wirbel.",
      lead: "Eine der häufigsten Lokalisationen für Beschwerden überhaupt.",
    },
    {
      type: "content",
      seg: " Was macht die LWS? Sie ist im Grunde genommen ein hochbelastetes Tragwerk. Sie trägt das ganze Gewicht deines Oberkörpers – Kopf, Arme, Brustkorb, Bauch. Sie überträgt diese Last weiter über das Kreuzbein in das Becken und von dort in die Beine.",
      kicker: "Was macht die LWS?",
      headline: "Ein hochbelastetes Tragwerk.",
      lead: "Sie trägt deinen Oberkörper und leitet die Last über das Becken in die Beine.",
    },
    {
      type: "content",
      seg: " Gleichzeitig ist sie beweglich: Sie muss sich vorbeugen, rückbeugen, seitneigen, drehen. Sie ist also gleichzeitig Stütze und Gelenk. Stabilität und Beweglichkeit.",
      headline: "Und gleichzeitig beweglich: vorbeugen, rückbeugen, seitneigen, drehen.",
    },
    {
      type: "statement",
      seg: " Das ist eine ziemliche Aufgabe, und der untere Rücken meistert sie bei den meisten Menschen Jahrzehnte lang sehr zuverlässig.",
      text: "Stütze UND Gelenk. Stabilität UND Beweglichkeit.",
    },
    {
      type: "content",
      seg: " Drei Hauptkomponenten arbeiten in der LWS zusammen, und das sind die, mit denen wir uns in dieser Lektion beschäftigen: Die Wirbel selbst. Die Bandscheiben zwischen den Wirbeln. Und die Facettengelenke – die kleinen Gelenke an der Rückseite jedes Wirbels.",
      kicker: "Drei Hauptkomponenten",
      headline: "Heute geht es um drei Bauteile.",
    },
    {
      type: "reveal-list",
      seg: " Diese drei bilden zusammen das, was man eine funktionelle Bewegungseinheit nennt – die kleinste mechanische Einheit der Wirbelsäule.",
      kicker: "Die funktionelle Bewegungseinheit",
      title: "Die kleinste mechanische Einheit",
      items: [
        { label: "Die Wirbel" },
        { label: "Die Bandscheiben dazwischen" },
        { label: "Die Facettengelenke an der Rückseite" },
      ],
    },
  ],
};

// ── Abschnitt 3 – Die Wirbel ─────────────────────────────────────────────────

const abschnitt3: SourceSection = {
  title: "Die Wirbel",
  narration:
    "Beginnen wir mit den Wirbeln selbst. Ein einzelner Lendenwirbel sieht aus wie eine kleine, kompakte Knochenstruktur mit verschiedenen Fortsätzen. Stell dir das vor wie einen sehr robusten Bauklotz, der an mehreren Stellen Hebelarme nach außen hat. Diese Hebelarme heißen Wirbelfortsätze – auf Lateinisch Processus. Sie dienen als Hebel- und Ansatzpunkte für Muskeln und Bänder. Im Zentrum jedes Wirbels findest du den Wirbelkörper – einen massiven, fast zylindrischen Knochenblock. Das ist der tragende Teil. Wenn du auf einer Säule stehst, dann sind diese Wirbelkörper die Steine, aus denen die Säule gebaut ist. Hinter dem Wirbelkörper – also zur Rückseite hin – gibt es einen Knochenring, durch den ein wichtiger Kanal verläuft. Dieser Kanal heißt Wirbelkanal. In ihm liegt das Rückenmark – und ab dem Bereich der LWS die sogenannte Cauda Equina, der Pferdeschwanz aus Nervenfasern, die aus dem Rückenmark austreten. Wir merken uns: hinter jedem Wirbelkörper läuft ein wichtiger Nervenstrang. Das wird in der nächsten Lektion noch relevant, wenn wir über die Nerven sprechen. Zwischen den Wirbeln gibt es seitliche Öffnungen, durch die einzelne Nervenwurzeln aus dem Wirbelkanal nach außen treten – in deine Beine. Diese Öffnungen heißen Foramina intervertebralia, also Zwischenwirbel-Löcher. Wenn dort etwas eng wird, kann eine Nervenwurzel gereizt werden. Das ist der klassische Mechanismus bei einer Ischias-Symptomatik. Auch dazu in der nächsten Lektion mehr. Wichtig ist: Die Wirbel selbst, also der knöcherne Anteil, sind extrem belastbar. Sie können enormen Druck aushalten. Wenn man einen Lendenwirbel im Labor unter eine Hydraulikpresse legt, braucht es tausende Kilogramm, bevor er bricht. Im normalen Alltag – auch bei sportlicher Belastung – sind deine Wirbel praktisch nicht überlastbar. Das ist ein wichtiger Punkt, weil viele Menschen mit Rückenschmerz Angst haben, dass etwas brechen könnte. Bei einer ansonsten gesunden Wirbelsäule ohne Osteoporose ist das extrem unwahrscheinlich.",
  slides: [
    {
      type: "word",
      seg: "Beginnen wir mit den Wirbeln selbst.",
      word: "Die Wirbel.",
    },
    {
      type: "content",
      seg: " Ein einzelner Lendenwirbel sieht aus wie eine kleine, kompakte Knochenstruktur mit verschiedenen Fortsätzen. Stell dir das vor wie einen sehr robusten Bauklotz, der an mehreren Stellen Hebelarme nach außen hat.",
      kicker: "Ein einzelner Lendenwirbel",
      headline: "Ein robuster Bauklotz mit Hebelarmen nach außen.",
    },
    {
      type: "content",
      seg: " Diese Hebelarme heißen Wirbelfortsätze – auf Lateinisch Processus. Sie dienen als Hebel- und Ansatzpunkte für Muskeln und Bänder.",
      headline: "Die Hebelarme heißen Wirbelfortsätze (Processus).",
      lead: "Sie sind Hebel- und Ansatzpunkte für Muskeln und Bänder.",
    },
    {
      type: "content",
      seg: " Im Zentrum jedes Wirbels findest du den Wirbelkörper – einen massiven, fast zylindrischen Knochenblock. Das ist der tragende Teil. Wenn du auf einer Säule stehst, dann sind diese Wirbelkörper die Steine, aus denen die Säule gebaut ist.",
      kicker: "Der Wirbelkörper",
      headline: "Im Zentrum: der massive, tragende Knochenblock.",
      lead: "Die Wirbelkörper sind die Steine, aus denen deine Säule gebaut ist.",
    },
    {
      type: "content",
      seg: " Hinter dem Wirbelkörper – also zur Rückseite hin – gibt es einen Knochenring, durch den ein wichtiger Kanal verläuft. Dieser Kanal heißt Wirbelkanal. In ihm liegt das Rückenmark – und ab dem Bereich der LWS die sogenannte Cauda Equina, der Pferdeschwanz aus Nervenfasern, die aus dem Rückenmark austreten.",
      kicker: "Der Wirbelkanal",
      headline: "Hinter dem Wirbelkörper läuft der Wirbelkanal.",
      lead: "Darin liegt das Rückenmark – ab der LWS die Cauda Equina, der „Pferdeschwanz“ aus Nervenfasern.",
    },
    {
      type: "statement",
      seg: " Wir merken uns: hinter jedem Wirbelkörper läuft ein wichtiger Nervenstrang. Das wird in der nächsten Lektion noch relevant, wenn wir über die Nerven sprechen.",
      text: "Hinter jedem Wirbelkörper läuft ein wichtiger Nervenstrang.",
    },
    {
      type: "content",
      seg: " Zwischen den Wirbeln gibt es seitliche Öffnungen, durch die einzelne Nervenwurzeln aus dem Wirbelkanal nach außen treten – in deine Beine. Diese Öffnungen heißen Foramina intervertebralia, also Zwischenwirbel-Löcher.",
      kicker: "Foramina intervertebralia",
      headline: "Seitliche Öffnungen lassen die Nervenwurzeln ins Bein austreten.",
      lead: "Die „Zwischenwirbel-Löcher“.",
    },
    {
      type: "content",
      seg: " Wenn dort etwas eng wird, kann eine Nervenwurzel gereizt werden. Das ist der klassische Mechanismus bei einer Ischias-Symptomatik. Auch dazu in der nächsten Lektion mehr.",
      headline: "Wird es dort eng, kann eine Nervenwurzel gereizt werden.",
      lead: "Der klassische Mechanismus bei einer Ischias-Symptomatik.",
    },
    {
      type: "content",
      seg: " Wichtig ist: Die Wirbel selbst, also der knöcherne Anteil, sind extrem belastbar. Sie können enormen Druck aushalten. Wenn man einen Lendenwirbel im Labor unter eine Hydraulikpresse legt, braucht es tausende Kilogramm, bevor er bricht.",
      kicker: "Extrem belastbar",
      headline: "Im Labor braucht es tausende Kilogramm, bis ein Wirbel bricht.",
    },
    {
      type: "content",
      seg: " Im normalen Alltag – auch bei sportlicher Belastung – sind deine Wirbel praktisch nicht überlastbar. Das ist ein wichtiger Punkt, weil viele Menschen mit Rückenschmerz Angst haben, dass etwas brechen könnte.",
      headline: "Im Alltag sind deine Wirbel praktisch nicht überlastbar.",
      lead: "Viele mit Rückenschmerz haben Angst, dass „da etwas brechen“ könnte.",
    },
    {
      type: "statement",
      seg: " Bei einer ansonsten gesunden Wirbelsäule ohne Osteoporose ist das extrem unwahrscheinlich.",
      text: "Ohne Osteoporose ist das extrem unwahrscheinlich. Deine Wirbel sind stabil.",
      emphasis: "stabil",
    },
  ],
};

// ── Abschnitt 4 – Die Bandscheiben ───────────────────────────────────────────

const abschnitt4: SourceSection = {
  title: "Die Bandscheiben",
  narration:
    "Jetzt zu dem Bauteil, das wahrscheinlich die meiste mediale Aufmerksamkeit bekommt: der Bandscheibe. Zwischen zwei benachbarten Wirbelkörpern liegt jeweils eine Bandscheibe. In der LWS gibt es also fünf Bandscheiben – plus die zwischen L5 und dem Kreuzbein. Die Bandscheibe ist im Grunde ein Polster, das zwei Aufgaben erfüllt: Sie ermöglicht Bewegung zwischen den Wirbeln, und sie verteilt Belastung gleichmäßig. Wie ist die Bandscheibe aufgebaut? Stell sie dir vor wie ein kleines, sehr stabiles Kissen mit zwei Schichten. In der Mitte gibt es einen Gallertkern – auf Lateinisch Nucleus pulposus. Das ist eine geleeartige, wasserreiche Masse. Drumherum liegt ein zäher Faserring – der Anulus fibrosus – aus zwölf bis fünfzehn Schichten überkreuzter, sehr fester Fasern. Stell dir das vor: in der Mitte sitzt das Gel, außenrum ein dichtes Geflecht wie aus Stahlseilen. Das macht das Konstrukt extrem stabil und gleichzeitig flexibel. Was passiert, wenn du dich bewegst? Wenn du dich vorbeugst, wird die Bandscheibe vorne zusammengedrückt und hinten gedehnt. Das Gel im Inneren verschiebt sich entsprechend leicht nach hinten. Wenn du dich zur Seite neigst, dasselbe Spiel zur Seite. Die Bandscheibe ist also kein starrer Stoßdämpfer – sie ist ein dynamisches, mitarbeitendes Element. Sie atmet quasi bei jeder Bewegung mit. Hier kommt jetzt ein Punkt, der vielen Menschen mit Bandscheibenproblemen Erleichterung verschafft: Eine Bandscheibe ist kein Verbrauchsmaterial, das sich abnutzt wie ein Reifen. Sie ist lebendiges Gewebe. Sie reagiert auf Belastung, sie passt sich an, und sie regeneriert sich – langsam, aber sie regeneriert sich. Was sie braucht, um gesund zu bleiben, ist: Bewegung. Belastung. Wechsel von Druck und Entlastung. Eine Bandscheibe, die nie belastet wird, wird schlechter, nicht besser. Das ist ein wichtiges Argument gegen die alte Empfehlung bei Rückenschmerz Bettruhe. Was ist nun ein Bandscheibenvorfall? Wenn der Faserring an einer Stelle einreißt, kann ein Teil des Gallertkerns nach außen austreten – in den meisten Fällen nach hinten, weil der Faserring dort etwas dünner ist. Wenn das austretende Gel auf eine Nervenwurzel drückt, kann das Schmerzen, Kribbeln, Taubheit oder Muskelschwäche im Bein verursachen. Das ist die klassische Bandscheibenvorfall-Symptomatik. Aber – und das ist die entscheidende Botschaft – nicht jeder Bandscheibenvorfall macht Probleme. Wie ich in Lektion I.2 schon angedeutet habe, finden sich Bandscheibenvorfälle und Vorwölbungen bei vielen völlig schmerzfreien Menschen, wenn man sie ins MRT legt. Eine Bandscheibe kann vorgewölbt sein, ohne dass das jemals Beschwerden macht. Wir besprechen das in Lektion 1.4 ausführlich. Und noch etwas, das oft überraschend ist: Die meisten Bandscheibenvorfälle bilden sich von alleine zurück. Studien zeigen, dass innerhalb von Monaten bis Jahren das ausgetretene Gel vom Körper resorbiert wird – buchstäblich aufgelöst und abtransportiert. Eine Operation ist deshalb in den meisten Fällen nicht zwingend nötig, und sie wird heute auch deutlich zurückhaltender empfohlen als noch vor zwanzig Jahren.",
  slides: [
    {
      type: "word",
      seg: "Jetzt zu dem Bauteil, das wahrscheinlich die meiste mediale Aufmerksamkeit bekommt: der Bandscheibe.",
      word: "Die Bandscheibe.",
    },
    {
      type: "content",
      seg: " Zwischen zwei benachbarten Wirbelkörpern liegt jeweils eine Bandscheibe. In der LWS gibt es also fünf Bandscheiben – plus die zwischen L5 und dem Kreuzbein. Die Bandscheibe ist im Grunde ein Polster, das zwei Aufgaben erfüllt: Sie ermöglicht Bewegung zwischen den Wirbeln, und sie verteilt Belastung gleichmäßig.",
      kicker: "Ein Polster zwischen den Wirbeln",
      headline: "Zwei Aufgaben: Bewegung ermöglichen und Last verteilen.",
      lead: "In der LWS fünf Bandscheiben – plus die zwischen L5 und Kreuzbein.",
    },
    {
      type: "reveal-list",
      seg: " Wie ist die Bandscheibe aufgebaut? Stell sie dir vor wie ein kleines, sehr stabiles Kissen mit zwei Schichten. In der Mitte gibt es einen Gallertkern – auf Lateinisch Nucleus pulposus. Das ist eine geleeartige, wasserreiche Masse. Drumherum liegt ein zäher Faserring – der Anulus fibrosus – aus zwölf bis fünfzehn Schichten überkreuzter, sehr fester Fasern.",
      kicker: "Aufbau · zwei Schichten",
      title: "Ein sehr stabiles Kissen",
      items: [
        { label: "Innen: Gallertkern (Nucleus pulposus) – geleeartig, wasserreich" },
        { label: "Außen: Faserring (Anulus fibrosus) – 12–15 überkreuzte Schichten" },
      ],
    },
    {
      type: "content",
      seg: " Stell dir das vor: in der Mitte sitzt das Gel, außenrum ein dichtes Geflecht wie aus Stahlseilen. Das macht das Konstrukt extrem stabil und gleichzeitig flexibel.",
      headline: "In der Mitte Gel, außen ein Geflecht wie aus Stahlseilen.",
      lead: "Extrem stabil und gleichzeitig flexibel.",
    },
    {
      type: "content",
      seg: " Was passiert, wenn du dich bewegst? Wenn du dich vorbeugst, wird die Bandscheibe vorne zusammengedrückt und hinten gedehnt. Das Gel im Inneren verschiebt sich entsprechend leicht nach hinten. Wenn du dich zur Seite neigst, dasselbe Spiel zur Seite.",
      kicker: "Wenn du dich bewegst",
      headline: "Beim Vorbeugen: vorne gedrückt, hinten gedehnt – das Gel weicht aus.",
    },
    {
      type: "statement",
      seg: " Die Bandscheibe ist also kein starrer Stoßdämpfer – sie ist ein dynamisches, mitarbeitendes Element. Sie atmet quasi bei jeder Bewegung mit.",
      text: "Kein starrer Stoßdämpfer – sie atmet bei jeder Bewegung mit.",
    },
    {
      type: "content",
      seg: " Hier kommt jetzt ein Punkt, der vielen Menschen mit Bandscheibenproblemen Erleichterung verschafft: Eine Bandscheibe ist kein Verbrauchsmaterial, das sich abnutzt wie ein Reifen. Sie ist lebendiges Gewebe. Sie reagiert auf Belastung, sie passt sich an, und sie regeneriert sich – langsam, aber sie regeneriert sich.",
      kicker: "Der wichtige Punkt",
      headline: "Eine Bandscheibe nutzt sich nicht ab wie ein Reifen.",
      lead: "Sie ist lebendiges Gewebe – sie passt sich an und regeneriert sich.",
    },
    {
      type: "reveal-list",
      seg: " Was sie braucht, um gesund zu bleiben, ist: Bewegung. Belastung. Wechsel von Druck und Entlastung.",
      kicker: "Was die Bandscheibe braucht",
      title: "Um gesund zu bleiben",
      items: [
        { label: "Bewegung" },
        { label: "Belastung" },
        { label: "Wechsel von Druck und Entlastung" },
      ],
    },
    {
      type: "statement",
      seg: " Eine Bandscheibe, die nie belastet wird, wird schlechter, nicht besser. Das ist ein wichtiges Argument gegen die alte Empfehlung bei Rückenschmerz Bettruhe.",
      text: "Eine Bandscheibe, die nie belastet wird, wird schlechter – nicht besser.",
    },
    {
      type: "content",
      seg: " Was ist nun ein Bandscheibenvorfall? Wenn der Faserring an einer Stelle einreißt, kann ein Teil des Gallertkerns nach außen austreten – in den meisten Fällen nach hinten, weil der Faserring dort etwas dünner ist.",
      kicker: "Was ist ein Bandscheibenvorfall?",
      headline: "Der Faserring reißt – ein Teil des Gallertkerns tritt aus.",
      lead: "Meist nach hinten, weil der Faserring dort dünner ist.",
    },
    {
      type: "content",
      seg: " Wenn das austretende Gel auf eine Nervenwurzel drückt, kann das Schmerzen, Kribbeln, Taubheit oder Muskelschwäche im Bein verursachen. Das ist die klassische Bandscheibenvorfall-Symptomatik.",
      headline: "Drückt das Gel auf eine Nervenwurzel: Schmerz, Kribbeln, Taubheit im Bein.",
      lead: "Die klassische Bandscheibenvorfall-Symptomatik.",
    },
    {
      type: "statement",
      seg: " Aber – und das ist die entscheidende Botschaft – nicht jeder Bandscheibenvorfall macht Probleme.",
      text: "Nicht jeder Bandscheibenvorfall macht Probleme.",
      emphasis: "nicht",
    },
    {
      type: "content",
      seg: " Wie ich in Lektion I.2 schon angedeutet habe, finden sich Bandscheibenvorfälle und Vorwölbungen bei vielen völlig schmerzfreien Menschen, wenn man sie ins MRT legt. Eine Bandscheibe kann vorgewölbt sein, ohne dass das jemals Beschwerden macht. Wir besprechen das in Lektion 1.4 ausführlich.",
      dark: true,
      headline: "Vorfälle finden sich bei vielen völlig schmerzfreien Menschen.",
      lead: "Eine Bandscheibe kann vorgewölbt sein, ohne je Beschwerden zu machen. Mehr dazu in 1.4.",
    },
    {
      type: "content",
      seg: " Und noch etwas, das oft überraschend ist: Die meisten Bandscheibenvorfälle bilden sich von alleine zurück. Studien zeigen, dass innerhalb von Monaten bis Jahren das ausgetretene Gel vom Körper resorbiert wird – buchstäblich aufgelöst und abtransportiert.",
      kicker: "Oft überraschend",
      headline: "Die meisten Bandscheibenvorfälle bilden sich von alleine zurück.",
      lead: "Das ausgetretene Gel wird vom Körper resorbiert – aufgelöst und abtransportiert.",
    },
    {
      type: "statement",
      seg: " Eine Operation ist deshalb in den meisten Fällen nicht zwingend nötig, und sie wird heute auch deutlich zurückhaltender empfohlen als noch vor zwanzig Jahren.",
      text: "Eine OP ist in den meisten Fällen nicht zwingend nötig.",
    },
  ],
};

// ── Abschnitt 5 – Die Facettengelenke ────────────────────────────────────────

const abschnitt5: SourceSection = {
  title: "Die Facettengelenke",
  narration:
    "Die dritte Komponente, über die wir in dieser Lektion sprechen, sind die Facettengelenke. Erinnerst du dich an die Wirbelfortsätze, die ich vorhin als Hebelarme beschrieben habe? Zwei dieser Fortsätze – die Gelenkfortsätze, auf Lateinisch Processus articulares – treffen jeweils auf die Gelenkfortsätze des darüber- oder darunterliegenden Wirbels. Dort entstehen kleine, paarige Gelenke. Diese Gelenke heißen Facettengelenke, oder Wirbelbogengelenke. Sie sitzen jeweils links und rechts hinten am Wirbelpaar. Was machen die Facettengelenke? Sie führen die Bewegung. Während die Bandscheibe vorne hauptsächlich Druck aufnimmt und verteilt, bestimmen die Facettengelenke hinten, in welche Richtung sich die Wirbelsäule bewegen darf. Sie sind die Bewegungs-Schienen. Ohne sie würde deine Wirbelsäule wie ein nicht-geführter Stapel Bauklötze in alle Richtungen kippen. Wie alle Gelenke im Körper haben Facettengelenke Knorpelflächen und eine Gelenkkapsel mit Gelenkflüssigkeit. Und wie alle Gelenke können sie gereizt werden, wenn sie über lange Zeit ungünstig belastet oder einseitig benutzt werden. Eine Facettengelenkreizung oder Facettensyndrom ist eine häufige Ursache für lokalen, dumpfen Rückenschmerz, der oft beim Aufrichten aus gebeugter Position oder beim langen Stehen auftritt. Auch die Facettengelenke zeigen mit dem Alter Veränderungen – mehr Knorpelverschleiß, manchmal kleine Knochenanbauten. Das ist normal und in vielen Fällen schmerzfrei. Sichtbar sind diese Veränderungen oft im MRT als Spondylarthrose oder Facettengelenkarthrose. Auch hier gilt: Befund ist nicht automatisch gleich Schmerz. Was den Facettengelenken gut tut? Bewegung in vielen verschiedenen Richtungen. Variabilität. Das Gegenteil ist einseitige Dauerbelastung – also stundenlanges Sitzen in derselben Position oder immer wieder dieselben Hebebewegungen. Wir kommen in Modul 2 auf konkrete Strategien zurück.",
  slides: [
    {
      type: "word",
      seg: "Die dritte Komponente, über die wir in dieser Lektion sprechen, sind die Facettengelenke.",
      word: "Die Facettengelenke.",
    },
    {
      type: "content",
      seg: " Erinnerst du dich an die Wirbelfortsätze, die ich vorhin als Hebelarme beschrieben habe? Zwei dieser Fortsätze – die Gelenkfortsätze, auf Lateinisch Processus articulares – treffen jeweils auf die Gelenkfortsätze des darüber- oder darunterliegenden Wirbels. Dort entstehen kleine, paarige Gelenke.",
      kicker: "Woher sie kommen",
      headline: "Zwei Gelenkfortsätze treffen auf die des Nachbarwirbels.",
      lead: "Dort entstehen kleine, paarige Gelenke.",
    },
    {
      type: "content",
      seg: " Diese Gelenke heißen Facettengelenke, oder Wirbelbogengelenke. Sie sitzen jeweils links und rechts hinten am Wirbelpaar.",
      headline: "Facettengelenke – links und rechts hinten am Wirbelpaar.",
      lead: "Auch Wirbelbogengelenke genannt.",
    },
    {
      type: "content",
      seg: " Was machen die Facettengelenke? Sie führen die Bewegung. Während die Bandscheibe vorne hauptsächlich Druck aufnimmt und verteilt, bestimmen die Facettengelenke hinten, in welche Richtung sich die Wirbelsäule bewegen darf.",
      kicker: "Was machen sie?",
      headline: "Sie führen die Bewegung.",
      lead: "Vorne nimmt die Bandscheibe Druck auf – hinten bestimmen die Facetten die Richtung.",
    },
    {
      type: "statement",
      seg: " Sie sind die Bewegungs-Schienen. Ohne sie würde deine Wirbelsäule wie ein nicht-geführter Stapel Bauklötze in alle Richtungen kippen.",
      text: "Die Facettengelenke sind die Bewegungs-Schienen deiner Wirbelsäule.",
    },
    {
      type: "content",
      seg: " Wie alle Gelenke im Körper haben Facettengelenke Knorpelflächen und eine Gelenkkapsel mit Gelenkflüssigkeit. Und wie alle Gelenke können sie gereizt werden, wenn sie über lange Zeit ungünstig belastet oder einseitig benutzt werden.",
      headline: "Wie jedes Gelenk: Knorpel, Kapsel, Gelenkflüssigkeit.",
      lead: "Und wie jedes Gelenk können sie bei einseitiger Dauerbelastung gereizt werden.",
    },
    {
      type: "content",
      seg: " Eine Facettengelenkreizung oder Facettensyndrom ist eine häufige Ursache für lokalen, dumpfen Rückenschmerz, der oft beim Aufrichten aus gebeugter Position oder beim langen Stehen auftritt.",
      kicker: "Facettensyndrom",
      headline: "Eine häufige Ursache für lokalen, dumpfen Rückenschmerz.",
      lead: "Oft beim Aufrichten aus gebeugter Position oder beim langen Stehen.",
    },
    {
      type: "content",
      seg: " Auch die Facettengelenke zeigen mit dem Alter Veränderungen – mehr Knorpelverschleiß, manchmal kleine Knochenanbauten. Das ist normal und in vielen Fällen schmerzfrei. Sichtbar sind diese Veränderungen oft im MRT als Spondylarthrose oder Facettengelenkarthrose.",
      headline: "Mit dem Alter: Knorpelverschleiß, kleine Knochenanbauten.",
      lead: "Im MRT „Spondylarthrose“ oder „Facettengelenkarthrose“ – normal und oft schmerzfrei.",
    },
    {
      type: "statement",
      seg: " Auch hier gilt: Befund ist nicht automatisch gleich Schmerz.",
      text: "Befund ist nicht automatisch gleich Schmerz.",
      emphasis: "nicht",
    },
    {
      type: "reveal-list",
      seg: " Was den Facettengelenken gut tut? Bewegung in vielen verschiedenen Richtungen. Variabilität. Das Gegenteil ist einseitige Dauerbelastung – also stundenlanges Sitzen in derselben Position oder immer wieder dieselben Hebebewegungen. Wir kommen in Modul 2 auf konkrete Strategien zurück.",
      kicker: "Was ihnen gut tut",
      title: "Bewegung & Variabilität",
      items: [
        { label: "Bewegung in vielen Richtungen" },
        { label: "Variabilität" },
        { label: "Gift: einseitige Dauerbelastung & langes Sitzen" },
      ],
    },
  ],
};

// ── Abschnitt 6 – Wie alles zusammenarbeitet ─────────────────────────────────

const abschnitt6: SourceSection = {
  title: "Wie alles zusammenarbeitet",
  narration:
    "Jetzt, wo du die drei Hauptkomponenten kennst – Wirbel, Bandscheibe, Facettengelenke – zoomen wir nochmal raus und schauen uns das Zusammenspiel an. Ein Wirbel plus die darunterliegende Bandscheibe plus die beiden zugehörigen Facettengelenke bilden zusammen eine funktionelle Bewegungseinheit. Diese Einheit wiederholt sich fünfmal in deiner LWS. Aus diesen Einheiten setzt sich die Beweglichkeit deines unteren Rückens zusammen. Was bedeutet das praktisch? Wenn du dich vorbeugst, geschieht das nicht in einem einzigen Gelenk. Es geschieht gleichzeitig in fünf Bewegungseinheiten, jede ein bisschen. So funktioniert eine gesunde Wirbelsäule: viele kleine Anteile, die sich gemeinsam bewegen. Genau wie ein Schwarm Fische gemeinsam um eine Kurve schwimmt – jeder einzelne Fisch macht eine kleine Drehung, das Schwarmbild macht eine elegante Kurve. Wenn aus irgendeinem Grund einzelne Segmente in ihrer Beweglichkeit eingeschränkt sind – etwa, weil bestimmte Muskeln verspannt sind oder weil aus Schmerzfurcht Bewegungen vermieden werden – dann müssen andere Segmente das kompensieren. Das ist ein Mechanismus, der bei chronischem Rückenschmerz häufig zu beobachten ist. Manche Etagen werden überbeweglich, andere unterbeweglich. Das macht das System weniger effizient und kann Schmerzen verstärken. Die gute Nachricht: Genau das ist trainierbar. Du kannst lernen, einzelne Segmente besser zu mobilisieren. Du kannst Bewegungsvarianz wieder aufbauen. Genau das sind die Übungsthemen in Modul 2 – nicht Krafttraining im Sinne von mehr Muskel, sondern bessere Bewegungsqualität und gleichmäßigere Lastverteilung. Halten wir fest, was du in dieser Lektion gelernt hast: Deine LWS besteht aus fünf Wirbeln, mit Bandscheiben dazwischen und Facettengelenken an der Rückseite. Sie ist enorm belastbar. Sie ist nicht starr, sondern ein dynamisches System. Veränderungen wie Verschleiß oder Bandscheibenvorwölbungen sind oft normal und schmerzfrei. Und Bewegung ist das, was dieses System gesund hält – nicht Schonung.",
  slides: [
    {
      type: "content",
      seg: "Jetzt, wo du die drei Hauptkomponenten kennst – Wirbel, Bandscheibe, Facettengelenke – zoomen wir nochmal raus und schauen uns das Zusammenspiel an.",
      kicker: "Das Zusammenspiel",
      headline: "Zoomen wir raus und schauen auf das Ganze.",
    },
    {
      type: "reveal-list",
      seg: " Ein Wirbel plus die darunterliegende Bandscheibe plus die beiden zugehörigen Facettengelenke bilden zusammen eine funktionelle Bewegungseinheit. Diese Einheit wiederholt sich fünfmal in deiner LWS. Aus diesen Einheiten setzt sich die Beweglichkeit deines unteren Rückens zusammen.",
      kicker: "Funktionelle Bewegungseinheit",
      title: "Wirbel + Bandscheibe + 2 Facetten",
      items: [
        { label: "Eine funktionelle Bewegungseinheit" },
        { label: "Wiederholt sich fünfmal in der LWS" },
        { label: "Daraus entsteht die Beweglichkeit deines Rückens" },
      ],
    },
    {
      type: "content",
      seg: " Was bedeutet das praktisch? Wenn du dich vorbeugst, geschieht das nicht in einem einzigen Gelenk. Es geschieht gleichzeitig in fünf Bewegungseinheiten, jede ein bisschen.",
      kicker: "Praktisch bedeutet das",
      headline: "Vorbeugen passiert nicht in einem Gelenk – sondern in fünf Einheiten.",
      lead: "Jede ein bisschen.",
    },
    {
      type: "quote",
      seg: " So funktioniert eine gesunde Wirbelsäule: viele kleine Anteile, die sich gemeinsam bewegen. Genau wie ein Schwarm Fische gemeinsam um eine Kurve schwimmt – jeder einzelne Fisch macht eine kleine Drehung, das Schwarmbild macht eine elegante Kurve.",
      text: "Wie ein Fischschwarm um die Kurve – viele kleine Drehungen, eine elegante Kurve.",
      caption: "So bewegt sich eine gesunde Wirbelsäule.",
    },
    {
      type: "content",
      seg: " Wenn aus irgendeinem Grund einzelne Segmente in ihrer Beweglichkeit eingeschränkt sind – etwa, weil bestimmte Muskeln verspannt sind oder weil aus Schmerzfurcht Bewegungen vermieden werden – dann müssen andere Segmente das kompensieren.",
      headline: "Ist ein Segment eingeschränkt, müssen andere kompensieren.",
      lead: "Etwa durch verspannte Muskeln oder vermiedene Bewegungen aus Schmerzfurcht.",
    },
    {
      type: "content",
      seg: " Das ist ein Mechanismus, der bei chronischem Rückenschmerz häufig zu beobachten ist. Manche Etagen werden überbeweglich, andere unterbeweglich. Das macht das System weniger effizient und kann Schmerzen verstärken.",
      dark: true,
      headline: "Manche Etagen werden überbeweglich, andere unterbeweglich.",
      lead: "Häufig bei chronischem Rückenschmerz – das System wird weniger effizient.",
    },
    {
      type: "statement",
      seg: " Die gute Nachricht: Genau das ist trainierbar. Du kannst lernen, einzelne Segmente besser zu mobilisieren. Du kannst Bewegungsvarianz wieder aufbauen.",
      text: "Die gute Nachricht: Genau das ist trainierbar.",
      emphasis: "trainierbar",
    },
    {
      type: "content",
      seg: " Genau das sind die Übungsthemen in Modul 2 – nicht Krafttraining im Sinne von mehr Muskel, sondern bessere Bewegungsqualität und gleichmäßigere Lastverteilung.",
      kicker: "Ausblick · Modul 2",
      headline: "Nicht mehr Muskel – bessere Bewegungsqualität.",
      lead: "Und eine gleichmäßigere Lastverteilung.",
    },
    {
      type: "reveal-list",
      seg: " Halten wir fest, was du in dieser Lektion gelernt hast: Deine LWS besteht aus fünf Wirbeln, mit Bandscheiben dazwischen und Facettengelenken an der Rückseite. Sie ist enorm belastbar. Sie ist nicht starr, sondern ein dynamisches System. Veränderungen wie Verschleiß oder Bandscheibenvorwölbungen sind oft normal und schmerzfrei. Und Bewegung ist das, was dieses System gesund hält – nicht Schonung.",
      kicker: "Take-aways",
      title: "Was du heute gelernt hast",
      items: [
        { label: "Belastbar – die LWS ist enorm stabil" },
        { label: "Dynamisch – kein starrer Stapel, ein lebendiges System" },
        { label: "Veränderungen sind oft normal und schmerzfrei" },
        { label: "Bewegung hält das System gesund – nicht Schonung" },
      ],
    },
  ],
};

// ── Abschnitt 7 – Workbook-Aufforderung und Übergang ─────────────────────────

const abschnitt7: SourceSection = {
  title: "Workbook & Übergang",
  narration:
    "Bevor du in Lektion 1.2 weitergehst – ein kurzer Workbook-Stopp. Im Workbook findest du Übung 1.1: Verstehen-Check, drei kurze Reflexionsfragen, die dir helfen, das Gelernte sacken zu lassen. Pausiere kurz, geh die Fragen durch, dann komm zurück. In der nächsten Lektion – 1.2 – sprechen wir über die Strukturen, die deine Wirbelsäule erst lebendig machen: die Muskeln, die sie bewegen, die Faszien, die sie umhüllen, die Nerven, die durch sie und aus ihr austreten – und das ISG, das deinen Rücken mit dem Becken verbindet. Damit ist dein anatomisches Bild komplett. Bis gleich.",
  slides: [
    {
      type: "content",
      seg: "Bevor du in Lektion 1.2 weitergehst – ein kurzer Workbook-Stopp. Im Workbook findest du Übung 1.1: Verstehen-Check, drei kurze Reflexionsfragen, die dir helfen, das Gelernte sacken zu lassen. Pausiere kurz, geh die Fragen durch, dann komm zurück.",
      kicker: "Workbook · Übung 1.1",
      headline: "Ein kurzer Workbook-Stopp: der Verstehen-Check.",
      lead: "Drei kurze Reflexionsfragen. Pausiere, geh sie durch, dann komm zurück.",
    },
    {
      type: "content",
      seg: " In der nächsten Lektion – 1.2 – sprechen wir über die Strukturen, die deine Wirbelsäule erst lebendig machen: die Muskeln, die sie bewegen, die Faszien, die sie umhüllen, die Nerven, die durch sie und aus ihr austreten – und das ISG, das deinen Rücken mit dem Becken verbindet.",
      kicker: "Als Nächstes · Lektion 1.2",
      headline: "Die Strukturen, die deine Wirbelsäule lebendig machen.",
      lead: "Muskeln, Faszien, Nerven – und das ISG.",
    },
    {
      type: "outro",
      seg: " Damit ist dein anatomisches Bild komplett.",
      nextLabel: "Lektion 1.2",
      nextTitle: "Anatomie der LWS Teil 2: Muskeln, Faszien, Nerven, ISG",
      hint: "Weiter →",
    },
    {
      type: "word",
      seg: " Bis gleich.",
      word: "Bis gleich.",
    },
  ],
};

// ── Lektion ─────────────────────────────────────────────────────────────────

export const lessonSource: SourceLesson = {
  id: "1.1",
  title: "Anatomie der LWS Teil 1: Wirbel, Bandscheiben, Facetten",
  subtitle: "Modul 1 – Verstehen · Das knöcherne Fundament",
  sections: [
    abschnitt1,
    abschnitt2,
    abschnitt3,
    abschnitt4,
    abschnitt5,
    abschnitt6,
    abschnitt7,
  ],
};
