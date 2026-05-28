/**
 * Masterclass „Chronischer Kreuzschmerz" — Laufzeit-Daten der Lektion I.2
 * Die vielen Namen deines Schmerzes
 *
 * ⚠️  GENERIERT — NICHT VON HAND EDITIEREN.
 * Quelle:   src/lib/masterclass/sources/I.2.source.ts
 * Erzeugt:  node scripts/build-masterclass.mjs I.2  (Stimme: Adrian / YYyi4prp0WCqZCPDNGu1)
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

const AUDIO_BASE = "/audio/masterclass/chronischer-kreuzschmerz/I.2";

export const lesson_I_2: Lesson = {
  id: "I.2",
  title: "Die vielen Namen deines Schmerzes",
  subtitle: "Du bist nicht allein · Namen demystifiziert",
  sections: [
    {
      title: "Eröffnung",
      audioSrc: `${AUDIO_BASE}/abschnitt-1.mp3`,
      transkript: "Eine Frage, mit der ich oft anfange, wenn ich Menschen zum ersten Mal in der Praxis sehe: Wie nennst du das eigentlich, was du hast? Was hat dir dein Arzt gesagt? Und dann fallen ganz unterschiedliche Wörter. Der eine sagt: Ich hab Hexenschuss. Die nächste: Mein Bandscheibenvorfall macht mich fertig. Wieder eine andere: Ich hab ISG-Blockade. Der nächste: Mein Doc hat Lumbalgie geschrieben. Wieder andere: Es ist halt Verschleiß, da müssen Sie mit leben. Fünf Menschen, fünf Wörter. Und doch – in den meisten Fällen reden wir hier über dasselbe Phänomen. Nicht identisch, aber sehr verwandt. In dieser Lektion sortieren wir das. Damit du verstehst, was diese Wörter bedeuten, was sie nicht bedeuten – und warum das gleich eine ziemlich gute Nachricht für dich ist.",
      slides: [
        {
          type: "title",
          appearTime: 0,
          kicker: "Masterclass · Chronischer Kreuzschmerz",
          lessonLabel: "Lektion I.2 – Die vielen Namen deines Schmerzes",
        },
        {
          type: "content",
          appearTime: 0,
          kicker: "Eine Frage zum Einstieg",
          headline: "Eine Frage, mit der es oft beginnt.",
        },
        {
          type: "statement",
          appearTime: 4.702,
          text: "Wie nennst du das eigentlich, was du hast?",
        },
        {
          type: "content",
          appearTime: 8.916,
          headline: "Und dann fallen ganz unterschiedliche Wörter.",
        },
        {
          type: "reveal-list",
          appearTime: 11.366,
          kicker: "Fünf Menschen",
          title: "Fünf Wörter",
          items: [{"label":"„Ich hab Hexenschuss.“"},{"label":"„Mein Bandscheibenvorfall macht mich fertig.“"},{"label":"„Ich hab ISG-Blockade.“"},{"label":"„Mein Doc hat Lumbalgie geschrieben.“"},{"label":"„Es ist halt Verschleiß.“"}],
        },
        {
          type: "statement",
          appearTime: 24.834,
          text: "Fünf Menschen, fünf Wörter.",
        },
        {
          type: "content",
          appearTime: 26.738,
          headline: "Und doch reden wir meist über dasselbe Phänomen.",
          lead: "Nicht identisch, aber sehr verwandt.",
        },
        {
          type: "content",
          appearTime: 31.916,
          kicker: "Was wir heute tun",
          headline: "Wir sortieren das.",
          lead: "Was die Wörter bedeuten, was nicht – und warum das eine gute Nachricht ist.",
        },
      ],
    },
    {
      title: "Die Namen sortieren",
      audioSrc: `${AUDIO_BASE}/abschnitt-2.mp3`,
      transkript: "Schauen wir uns die wichtigsten Begriffe der Reihe nach an. Lumbalgie. Das ist ein medizinischer Sammelbegriff. Lumbal heißt: unterer Rücken, also Lendenwirbelsäule. Algie heißt: Schmerz. Lumbalgie heißt also wörtlich übersetzt: Schmerz im unteren Rücken. Mehr nicht. Es sagt nichts darüber aus, woher der Schmerz kommt – nur, dass er da ist und wo er sitzt. Ein Synonym dafür, das du oft hörst, ist Lumbago. Kreuzschmerz. Das ist im Grunde dasselbe wie Lumbalgie, nur auf Deutsch. Das Kreuz ist die Lendenregion. Kreuzschmerz und Lumbalgie meinen dasselbe Symptom: Schmerz im unteren Rücken. In den deutschen Leitlinien – der sogenannten Nationalen Versorgungsleitlinie, falls du das je gegoogelt hast – wird Kreuzschmerz sogar als offizieller Begriff bevorzugt. Hexenschuss. Das ist der volkstümliche Name für eine akute, plötzlich einschießende Kreuzschmerz-Episode. Du bist runtergegangen, um die Socke aufzuheben, und plötzlich – stockt es. Du kannst dich nicht mehr aufrichten. Das ist Hexenschuss. Medizinisch hieße das akute Lumbago. Wichtig zu wissen: Hexenschuss ist in den allermeisten Fällen ungefährlich, auch wenn er sich beängstigend anfühlt. Es ist meist ein muskulärer Reflexkrampf – kein Zeichen dafür, dass etwas zerstört wurde. Bandscheibenvorfall – oder Vorwölbung, Protrusion, Prolaps. Hier wird es spannend, denn das ist der Begriff, der bei vielen am meisten Angst macht. Worum geht es? Die Bandscheiben sind die Polster zwischen den Wirbeln. Wenn das innere Gel einer Bandscheibe sich verschiebt oder einen Riss in der äußeren Faserschicht hat, sprechen wir von Vorwölbung oder Vorfall – je nach Schweregrad. Aber – und das ist die Kernbotschaft hier – ein Bandscheibenvorfall im MRT bedeutet nicht automatisch, dass dieser Vorfall die Ursache deiner Schmerzen ist. Studien zeigen seit Jahren: Wenn man völlig schmerzfreie Menschen ins MRT schiebt, finden sich bei mehr als der Hälfte der über Vierzigjährigen Vorwölbungen oder Vorfälle. Ohne Schmerzen. Bandscheibenbefunde im MRT korrelieren oft sehr schlecht mit Schmerz. Wir kommen darauf in Lektion 1.4 ausführlich zurück. ISG-Blockade, manchmal auch Iliosakralgelenk-Beschwerden genannt. Das ISG ist das Gelenk zwischen Kreuzbein und Beckenschaufel – eine sehr feste, sehr unbewegliche Verbindung. Wenn dort Reizzustände entstehen, können sie Schmerzen ausstrahlen, oft seitlich am unteren Rücken oder ins Gesäß. Blockade ist dabei ein etwas irreführendes Wort – es ist meist keine echte mechanische Blockade, sondern ein Reizzustand. Aber der Begriff hat sich eingebürgert. Lumboischialgie oder Ischias. Das beschreibt einen Kreuzschmerz, der nach unten ausstrahlt – ins Gesäß, ins Bein, manchmal bis in den Fuß. Ursache ist meistens eine Reizung des Ischiasnervs, häufig nah an seiner Wurzel an der Wirbelsäule. Eine wichtige Unterscheidung: Ausstrahlung in den Oberschenkel ist oft fortgeleiteter Schmerz, nicht zwingend Nervenkompression. Echte Nervenwurzelreizung strahlt typischerweise unterhalb des Knies aus, oft mit Kribbeln oder Taubheit. Das ist klinisch relevant – und auch ein Punkt, den wir in der nächsten Lektion noch berühren. Verschleiß, Abnutzung, Degeneration. Das sind keine Diagnosen im engeren Sinn, sondern beschreibende Worte für altersbedingte Veränderungen, die im MRT sichtbar sind. Wirbel werden mit den Jahren etwas anders, Bandscheiben verlieren Wasser, Facettengelenke zeigen Spuren des Lebens. Das Wichtige: Diese Veränderungen sind normal. Sie sind kein Defekt. Eine fünfzigjährige Wirbelsäule sieht anders aus als eine zwanzigjährige – genauso, wie ein fünfzigjähriges Gesicht anders aussieht als ein zwanzigjähriges. Und genau, wie wir keine Schmerzen davon haben, dass unser Gesicht altert, müssen wir auch keine Schmerzen davon haben, dass unsere Wirbelsäule altert.",
      slides: [
        {
          type: "content",
          appearTime: 0,
          kicker: "Die Namen sortieren",
          headline: "Schauen wir uns die Begriffe der Reihe nach an.",
        },
        {
          type: "term",
          appearTime: 2.868,
          kicker: "Begriff 1",
          term: "Lumbalgie",
        },
        {
          type: "reveal-list",
          appearTime: 6.455,
          kicker: "Wörtlich übersetzt",
          title: "Lumbal + Algie",
          items: [{"label":"Lumbal = unterer Rücken"},{"label":"Algie = Schmerz"},{"label":"→ Schmerz im unteren Rücken. Mehr nicht."}],
        },
        {
          type: "content",
          appearTime: 18.367,
          headline: "Es sagt nichts darüber aus, woher der Schmerz kommt.",
          lead: "Nur, dass er da ist und wo er sitzt. Synonym: Lumbago.",
        },
        {
          type: "term",
          appearTime: 28.444,
          kicker: "Begriff 2",
          term: "Kreuzschmerz",
        },
        {
          type: "content",
          appearTime: 33.39,
          headline: "Kreuzschmerz und Lumbalgie meinen dasselbe Symptom.",
          lead: "Das Kreuz ist die Lendenregion.",
        },
        {
          type: "content",
          appearTime: 40.867,
          kicker: "Nationale Versorgungsleitlinie",
          headline: "Die Leitlinien bevorzugen sogar „Kreuzschmerz“.",
        },
        {
          type: "term",
          appearTime: 50.805,
          kicker: "Begriff 3",
          term: "Hexenschuss",
        },
        {
          type: "content",
          appearTime: 57.655,
          headline: "Du bückst dich nach der Socke – und plötzlich stockt es.",
          lead: "Medizinisch: akute Lumbago.",
        },
        {
          type: "statement",
          appearTime: 68.15,
          text: "Hexenschuss ist fast immer ungefährlich – auch wenn er sich nicht so anfühlt.",
        },
        {
          type: "content",
          appearTime: 74.117,
          headline: "Meist ein muskulärer Reflexkrampf.",
          lead: "Kein Zeichen dafür, dass etwas zerstört wurde.",
        },
        {
          type: "term",
          appearTime: 79.527,
          kicker: "Begriff 4 · macht oft am meisten Angst",
          term: "Bandscheibenvorfall",
        },
        {
          type: "content",
          appearTime: 87.294,
          kicker: "Worum geht es?",
          headline: "Die Bandscheiben sind die Polster zwischen den Wirbeln.",
          lead: "Verschiebt sich das innere Gel: Vorwölbung oder Vorfall – je nach Schweregrad.",
        },
        {
          type: "statement",
          appearTime: 99.798,
          text: "Bandscheibenbefund im MRT ≠ Ursache deines Schmerzes.",
        },
        {
          type: "content",
          appearTime: 109.574,
          dark: true,
          kicker: "Was Studien zeigen",
          headline: "Über die Hälfte der über Vierzigjährigen hat Befunde – ohne Schmerzen.",
        },
        {
          type: "content",
          appearTime: 121.509,
          headline: "MRT-Befunde korrelieren oft schlecht mit Schmerz.",
          lead: "Darauf kommen wir in Lektion 1.4 ausführlich zurück.",
        },
        {
          type: "term",
          appearTime: 129.113,
          kicker: "Begriff 5",
          term: "ISG-Blockade",
        },
        {
          type: "content",
          appearTime: 133.293,
          headline: "Das Gelenk zwischen Kreuzbein und Beckenschaufel.",
          lead: "Reizzustände strahlen oft seitlich am unteren Rücken oder ins Gesäß aus.",
        },
        {
          type: "content",
          appearTime: 147.155,
          headline: "„Blockade“ ist irreführend.",
          lead: "Meist keine echte mechanische Blockade, sondern ein Reizzustand.",
        },
        {
          type: "term",
          appearTime: 156.803,
          kicker: "Begriff 6",
          term: "Ischias",
        },
        {
          type: "content",
          appearTime: 165.998,
          headline: "Meist eine Reizung des Ischiasnervs nah an der Wurzel.",
          lead: "Ausstrahlung in den Oberschenkel ist oft fortgeleiteter Schmerz – nicht zwingend Nervenkompression.",
        },
        {
          type: "statement",
          appearTime: 179.896,
          text: "Unterhalb des Knies, mit Kribbeln oder Taubheit – das ist klinisch relevant.",
          emphasis: "unterhalb",
        },
        {
          type: "term",
          appearTime: 191.633,
          kicker: "Begriff 7",
          term: "Verschleiß",
        },
        {
          type: "content",
          appearTime: 201.966,
          headline: "Wirbel verändern sich, Bandscheiben verlieren Wasser.",
          lead: "Facettengelenke zeigen Spuren des Lebens.",
        },
        {
          type: "statement",
          appearTime: 207.597,
          text: "Diese Veränderungen sind normal. Kein Defekt.",
          emphasis: "normal",
        },
        {
          type: "content",
          appearTime: 211.301,
          headline: "Eine 50-jährige Wirbelsäule sieht anders aus als eine 20-jährige.",
          lead: "Genauso wie ein 50-jähriges Gesicht anders aussieht als ein 20-jähriges.",
        },
        {
          type: "quote",
          appearTime: 218.916,
          text: "Altern ist normal. Kein Defekt.",
          caption: "So wenig wie ein alterndes Gesicht weh tut.",
        },
      ],
    },
    {
      title: "Die gute Nachricht",
      audioSrc: `${AUDIO_BASE}/abschnitt-3.mp3`,
      transkript: "Und jetzt kommt die gute Nachricht. Wenn du dir diese Liste anschaust – Lumbalgie, Hexenschuss, Bandscheibe, ISG, Ischias, Verschleiß – dann steckt dahinter ein klinisches Geheimnis, das in der breiten Öffentlichkeit kaum bekannt ist: In etwa 80 bis 85 Prozent aller Fälle von chronischem Rückenschmerz lässt sich gar keine eindeutige strukturelle Ursache benennen. Das klingt erst einmal frustrierend, wenn du es zum ersten Mal hörst. Was, niemand weiß genau, was bei mir los ist? Aber wenn du eine Sekunde drüber nachdenkst, ist es das Gegenteil von schlechter Nachricht. Wenn der Schmerz nicht eindeutig an einer kaputten Struktur hängt, dann musst du auch keine kaputte Struktur reparieren. Dann ist die Lösung nicht zwangsläufig eine OP, eine Spritze, ein Wundermittel. Dann ist die Lösung viel eher: das gesamte System verstehen, dosiert belasten, bewegen, beruhigen, integrieren. Genau das, was diese Masterclass dir Schritt für Schritt zeigt. Internationale Leitlinien – die deutschen, die britischen, die australischen – sagen seit Jahren dasselbe: Bei unspezifischem chronischem Kreuzschmerz ist Bewegungstherapie kombiniert mit Edukation und Verhaltensänderung das, was nachweislich am besten wirkt. Nicht passive Behandlungen, nicht Bettruhe, nicht Spritzen-Marathons. Aktivität, Verstehen, neue Routinen. Genau das machen wir hier.",
      slides: [
        {
          type: "word",
          appearTime: 0,
          word: "Die gute Nachricht.",
        },
        {
          type: "content",
          appearTime: 2.38,
          kicker: "Ein klinisches Geheimnis",
          headline: "Hinter all diesen Wörtern steckt etwas, das kaum jemand kennt.",
        },
        {
          type: "stats",
          appearTime: 12.48,
          stats: [{"value":"80–85%","label":"ohne klare strukturelle Ursache"},{"value":"= ","label":"unspezifischer Kreuzschmerz"},{"value":"Gute","label":"Nachricht"}],
        },
        {
          type: "content",
          appearTime: 20.503,
          headline: "Das klingt erst einmal frustrierend.",
          lead: "„Was, niemand weiß genau, was bei mir los ist?“",
        },
        {
          type: "statement",
          appearTime: 26.818,
          text: "Es ist das Gegenteil von schlechter Nachricht.",
        },
        {
          type: "content",
          appearTime: 30.627,
          headline: "Keine kaputte Struktur, die repariert werden muss.",
          lead: "Dann ist die Lösung nicht zwangsläufig OP, Spritze oder Wundermittel.",
        },
        {
          type: "reveal-list",
          appearTime: 42.632,
          kicker: "Dann ist die Lösung",
          title: "Das gesamte System",
          items: [{"label":"verstehen"},{"label":"dosiert belasten"},{"label":"bewegen"},{"label":"beruhigen"},{"label":"integrieren"}],
        },
        {
          type: "content",
          appearTime: 55.159,
          kicker: "Internationaler Leitlinien-Konsens",
          headline: "Bewegung + Edukation + Verhaltensänderung wirkt nachweislich am besten.",
        },
        {
          type: "anti-list",
          appearTime: 70.182,
          title: "Nachweislich NICHT die Lösung",
          items: [{"label":"Passive Behandlungen"},{"label":"Bettruhe"},{"label":"Spritzen-Marathons"}],
        },
        {
          type: "reveal-list",
          appearTime: 74.373,
          kicker: "Was wirkt",
          title: "Aktivität · Verstehen · Routinen",
          items: [{"label":"Aktivität"},{"label":"Verstehen"},{"label":"Neue Routinen"}],
        },
        {
          type: "statement",
          appearTime: 77.345,
          text: "Genau das machen wir hier.",
        },
      ],
    },
    {
      title: "Du bist nicht allein",
      audioSrc: `${AUDIO_BASE}/abschnitt-4.mp3`,
      transkript: "Eine weitere gute Nachricht, die dir vielleicht hilft, falls du dich gerade allein fühlst mit dieser Geschichte. Rund 85 Prozent aller Erwachsenen in Deutschland erleben mindestens einmal in ihrem Leben Rückenschmerzen. Mindestens. Viele erleben sie wiederholt. Eine signifikante Minderheit erlebt sie chronisch – also länger als drei Monate am Stück oder immer wiederkehrend. Das heißt: Wenn du gerade chronischen Kreuzschmerz hast, gehörst du zu einer sehr großen Gruppe von Menschen. Du bist nicht ungewöhnlich. Du bist kein medizinischer Sonderfall. Du teilst diese Erfahrung mit Millionen anderer Menschen allein in diesem Land. Warum ist das wichtig? Weil chronischer Schmerz oft mit einem Gefühl von Isolation kommt. Du gehst auf eine Party, du verziehst beim Hinsetzen das Gesicht, jemand fragt nach, und du erzählst es ein paarmal, aber dann merkst du: die Leute haben das nicht, sie verstehen das nicht so richtig, du redest immer weniger drüber. Mit der Zeit fühlst du dich abgekapselt von Menschen, die das einfach nicht haben. Aber statistisch gesehen sitzt in jedem Wartezimmer, in jedem Bus, in jeder Familie irgendwer, der genau dasselbe kennt. Du bist nur die einzige Person in deinem direkten Umfeld, mit der du gerade darüber sprichst. Das ist ein Unterschied.",
      slides: [
        {
          type: "content",
          appearTime: 0,
          kicker: "Falls du dich allein fühlst",
          headline: "Noch eine gute Nachricht.",
        },
        {
          type: "stats",
          appearTime: 5.213,
          stats: [{"value":"85%","label":"der Erwachsenen kennen Rückenschmerz"},{"value":"mind.","label":"einmal im Leben"},{"value":"Du","label":"bist nicht allein"}],
        },
        {
          type: "content",
          appearTime: 11.47,
          headline: "Viele wiederholt – eine Minderheit chronisch.",
          lead: "Chronisch: länger als drei Monate am Stück oder immer wiederkehrend.",
        },
        {
          type: "reveal-list",
          appearTime: 19.005,
          kicker: "Das heißt für dich",
          title: "Du gehörst zu einer großen Gruppe",
          items: [{"label":"Du bist nicht ungewöhnlich"},{"label":"Du bist kein medizinischer Sonderfall"}],
        },
        {
          type: "statement",
          appearTime: 27.515,
          text: "Du teilst diese Erfahrung mit Millionen – allein in diesem Land.",
        },
        {
          type: "content",
          appearTime: 32.078,
          kicker: "Warum das wichtig ist",
          headline: "Chronischer Schmerz kommt oft mit einem Gefühl von Isolation.",
        },
        {
          type: "content",
          appearTime: 36.93,
          dark: true,
          headline: "Du erzählst es ein paarmal – dann redest du immer weniger drüber.",
        },
        {
          type: "content",
          appearTime: 47.867,
          dark: true,
          headline: "Mit der Zeit fühlst du dich abgekapselt.",
        },
        {
          type: "content",
          appearTime: 52.313,
          headline: "In jedem Wartezimmer, Bus, jeder Familie kennt jemand genau dasselbe.",
        },
        {
          type: "statement",
          appearTime: 58.432,
          text: "Du bist nur die Einzige, mit der du gerade darüber sprichst.",
        },
      ],
    },
    {
      title: "Warum die Vielfalt ein Problem ist",
      audioSrc: `${AUDIO_BASE}/abschnitt-5.mp3`,
      transkript: "Eine letzte Beobachtung in dieser Lektion, bevor wir weitergehen. Die Vielfalt der Begriffe – Lumbalgie, Hexenschuss, Bandscheibe, ISG, und so weiter – hat einen Nebeneffekt, der oft unterschätzt wird: Sie suggeriert, dass es viele verschiedene Probleme gibt. Und das wiederum suggeriert, dass es viele verschiedene Spezialbehandlungen braucht. Du kennst das vielleicht: Du gehst zum Orthopäden, der sagt Bandscheibe. Du gehst zum Heilpraktiker, der sagt ISG-Blockade. Du gehst zur Massage, die sagt Verspannungen. Du gehst zum Osteopathen, der sagt Beckenschiefstand. Vier verschiedene Erklärungen für möglicherweise dasselbe Problem. Das ist nicht zwingend Inkompetenz. Das ist die Folge eines Systems, das sehr stark in Strukturmodellen denkt – also in der Idee, dass es eine kaputte Struktur geben muss, wenn Schmerz vorhanden ist. Diese Idee hat sich in den letzten zwanzig Jahren in der Schmerzforschung deutlich gewandelt. Aber in der täglichen Praxis ist sie zäh, und sie wird oft an Patienten weitergegeben. Du wirst in dieser Masterclass ein anderes Modell kennenlernen. Ein Modell, das anerkennt, dass Strukturen eine Rolle spielen, aber auch, dass dein Nervensystem, dein Bewegungsverhalten, dein Stresslevel, dein Schlaf, deine Erwartungen und dein Verständnis vom eigenen Körper mindestens genauso wichtig sind. Manchmal wichtiger. Das ist kein esoterischer Quatsch. Das ist der aktuelle Stand der Schmerzwissenschaft. Und es ist – wieder einmal – eine gute Nachricht. Denn auf viele dieser Faktoren hast du Einfluss. Auf eine Bandscheibe hast du keinen direkten Einfluss. Auf dein Verhalten, deine Belastung, dein Verständnis – sehr wohl.",
      slides: [
        {
          type: "content",
          appearTime: 0,
          kicker: "Eine letzte Beobachtung",
          headline: "Bevor wir weitergehen – ein letzter Gedanke.",
        },
        {
          type: "content",
          appearTime: 3.564,
          headline: "Viele Wörter suggerieren viele verschiedene Probleme.",
          lead: "Und damit: viele verschiedene Spezialbehandlungen.",
        },
        {
          type: "reveal-list",
          appearTime: 20.375,
          kicker: "Vier Türen, vier Antworten",
          title: "Derselbe Patient",
          items: [{"label":"Orthopäde: „Bandscheibe.“"},{"label":"Heilpraktiker: „ISG-Blockade.“"},{"label":"Massage: „Verspannungen.“"},{"label":"Osteopath: „Beckenschiefstand.“"}],
        },
        {
          type: "statement",
          appearTime: 32.833,
          text: "Vier Erklärungen für möglicherweise dasselbe Problem.",
        },
        {
          type: "content",
          appearTime: 36.362,
          kicker: "Das Strukturmodell",
          headline: "Nicht Inkompetenz – ein System, das in Strukturmodellen denkt.",
          lead: "Die Idee: Wenn Schmerz da ist, muss es eine kaputte Struktur geben.",
        },
        {
          type: "content",
          appearTime: 46.811,
          headline: "Die Schmerzforschung hat sich gewandelt.",
          lead: "Aber in der täglichen Praxis ist die alte Idee zäh.",
        },
        {
          type: "content",
          appearTime: 56.203,
          kicker: "Das erweiterte Modell",
          headline: "Du wirst ein anderes Modell kennenlernen.",
          lead: "Strukturen zählen – aber Nervensystem, Verhalten, Stress, Schlaf und Verstehen mindestens genauso. Manchmal mehr.",
        },
        {
          type: "reveal-list",
          appearTime: 72.98,
          kicker: "Worauf du Einfluss hast",
          title: "Mehr als nur Struktur",
          items: [{"label":"Nervensystem"},{"label":"Bewegungsverhalten"},{"label":"Stress"},{"label":"Schlaf"},{"label":"Verstehen"}],
        },
        {
          type: "statement",
          appearTime: 82.314,
          text: "Auf die Bandscheibe hast du keinen Einfluss. Auf dein Verhalten – sehr wohl.",
          emphasis: "Verhalten",
        },
      ],
    },
    {
      title: "Übergang",
      audioSrc: `${AUDIO_BASE}/abschnitt-6.mp3`,
      transkript: "In der nächsten Lektion machen wir einen wichtigen Selbstcheck. Bei aller Beruhigung, die ich dir jetzt gegeben habe: Es gibt eine kleine, aber wichtige Gruppe von Symptomen, bei denen du nicht hier richtig bist, sondern beim Arzt. Diese filtern wir heraus. Die Lektion ist kurz, aber wichtig. Bis gleich.",
      slides: [
        {
          type: "content",
          appearTime: 0,
          kicker: "Als Nächstes · Lektion I.3",
          headline: "Eine kleine Gruppe von Symptomen gehört zuerst zum Arzt.",
          lead: "Bei aller Beruhigung: Die filtern wir im nächsten Schritt heraus.",
        },
        {
          type: "outro",
          appearTime: 12.864,
          nextLabel: "Lektion I.3",
          nextTitle: "Der Red-Flag-Selbstcheck",
          hint: "Weiter →",
        },
        {
          type: "word",
          appearTime: 15.952,
          word: "Bis gleich.",
        },
      ],
    },
  ],
};

/** Gesamtanzahl Slides der Lektion. */
export const total_I_2: number = totalSlides(lesson_I_2);

/** Flache Liste aller Slides (mit Rückverweis auf den Abschnitt). */
export const flat_I_2: FlatSlide[] = flatSlides(lesson_I_2);

export default lesson_I_2;
