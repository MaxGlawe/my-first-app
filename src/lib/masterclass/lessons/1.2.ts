/**
 * Masterclass „Chronischer Kreuzschmerz" — Laufzeit-Daten der Lektion 1.2
 * Anatomie der LWS Teil 2: Muskeln, Faszien, Nerven, ISG
 *
 * ⚠️  GENERIERT — NICHT VON HAND EDITIEREN.
 * Quelle:   src/lib/masterclass/sources/1.2.source.ts
 * Erzeugt:  node scripts/build-masterclass.mjs 1.2  (Stimme: Adrian / YYyi4prp0WCqZCPDNGu1)
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

const AUDIO_BASE = "/audio/masterclass/chronischer-kreuzschmerz/1.2";

export const lesson_1_2: Lesson = {
  id: "1.2",
  title: "Anatomie der LWS Teil 2: Muskeln, Faszien, Nerven, ISG",
  subtitle: "Modul 1 – Verstehen · System statt Struktur",
  sections: [
    {
      title: "Eröffnung",
      audioSrc: `${AUDIO_BASE}/abschnitt-1.mp3`,
      transkript: "Willkommen zurück. In der vorigen Lektion haben wir uns die knöcherne Wirbelsäule angesehen – die Wirbel, die Bandscheiben, die Facettengelenke. Das ist sozusagen das Skelett der LWS. Aber dieses Skelett wäre völlig hilflos ohne die Strukturen, die wir heute besprechen. In dieser Lektion geht es um die lebendigen Elemente: die Muskeln, die deinen Rücken bewegen und stabilisieren. Die Faszien, die alles verbinden. Die Nerven, die Befehle senden und Empfindungen melden. Und das ISG – das Iliosakralgelenk – das deine Wirbelsäule mit dem Becken verbindet und manchmal eine eigene Geschichte erzählt. Am Ende dieser Lektion wirst du ein vollständigeres Bild davon haben, was alles bei dir im unteren Rücken passiert. Und damit haben wir die Grundlage für alles, was danach kommt.",
      slides: [
        {
          type: "title",
          appearTime: 0,
          kicker: "Masterclass · Modul 1 – Verstehen",
          lessonLabel: "Lektion 1.2 – Anatomie der LWS Teil 2: Muskeln, Faszien, Nerven, ISG",
        },
        {
          type: "content",
          appearTime: 0,
          kicker: "Willkommen zurück",
          headline: "In 1.1 hast du das Skelett der LWS kennengelernt.",
          lead: "Wirbel, Bandscheiben, Facettengelenke.",
        },
        {
          type: "statement",
          appearTime: 9.776,
          text: "Das Skelett war Teil 1. Heute kommt das Leben dazu.",
        },
        {
          type: "reveal-list",
          appearTime: 14.257,
          kicker: "Die lebendigen Elemente",
          title: "Heute besprechen wir",
          items: [{"label":"Muskeln – bewegen und stabilisieren"},{"label":"Faszien – verbinden alles"},{"label":"Nerven – senden Befehle, melden Empfindungen"},{"label":"ISG – verbindet Wirbelsäule und Becken"}],
        },
        {
          type: "content",
          appearTime: 35.422,
          headline: "Am Ende hast du ein vollständiges Bild deines unteren Rückens.",
          lead: "Die Grundlage für alles, was danach kommt.",
        },
      ],
    },
    {
      title: "Die Muskelschichten",
      audioSrc: `${AUDIO_BASE}/abschnitt-2.mp3`,
      transkript: "Beginnen wir mit den Muskeln. Wenn du an Rückenmuskeln denkst, hast du wahrscheinlich Bilder vor Augen wie den breiten Rücken eines Bodybuilders. Das ist aber nur ein kleiner Teil der Geschichte. Die Wirbelsäule wird von Muskeln in mehreren Schichten umgeben und stabilisiert – von ganz tief innen, direkt an den Wirbeln, bis zur oberflächlichen Schicht, die du im Spiegel siehst. Diese Schichten haben unterschiedliche Aufgaben. Die tiefe Schicht – die lokalen Stabilisatoren. Das sind kleine, segmental angeordnete Muskeln, die direkt an den Wirbeln ansetzen. Ihre Aufgabe ist nicht Kraft, sondern Feinkontrolle. Sie halten benachbarte Wirbel zueinander stabil, während du dich bewegst. Wenn diese Muskeln gut funktionieren, hast du eine geschmeidige, präzise Wirbelsäulenbewegung. Wenn sie schlecht funktionieren – etwa nach Schmerzepisoden – entstehen kleine Wackelbewegungen zwischen Wirbeln, die mit der Zeit irritieren können. Der wichtigste lokale Stabilisator im Rücken heißt Multifidus. Er ist ein vergleichsweise kleiner Muskel, der direkt entlang der Wirbelsäule verläuft und jedes Segment einzeln kontrolliert. Studien zeigen, dass der Multifidus nach einer Rückenschmerz-Episode oft schwächer und schlechter koordiniert ist – und dass gezieltes Training ihn wieder aufbauen kann. Wir kommen in Modul 2 darauf zurück. Eine Schwester-Muskelgruppe gibt es vorne am Bauch: der Transversus abdominis, der tiefe quere Bauchmuskel. Er bildet zusammen mit dem Multifidus eine Art Korsett um die Wirbelsäule. Wenn dieses Korsett aktiv ist, ist die Wirbelsäule gut geschützt. Wenn nicht, fehlt der Stabilitätsanteil von innen. Die mittlere Schicht – die globalen Bewegungsmuskeln. Hier liegt vor allem der Erector spinae – der Aufrichter der Wirbelsäule. Das ist eine längs verlaufende Muskelgruppe, die rechts und links der Wirbelsäule wie zwei Säulen verläuft. Sie streckt deine Wirbelsäule, wenn du dich aus der gebeugten Position aufrichtest. Sie ist sichtbar als die zwei länglichen Wölbungen rechts und links der Wirbelsäule, wenn du dich anstrengst. Diese mittlere Schicht ist die Kraft-Schicht. Sie macht die großen Bewegungen. Sie hält dich gegen die Schwerkraft aufrecht. Bei Rückenschmerz wird sie häufig zu aktiv – sie spannt sich reflexartig an, um zu schützen, was du als Verspannung spürst. Das ist nicht Schwäche, das ist Überaktivität. Die oberflächliche Schicht – die großen Bewegungsmuskeln, die nicht nur die Wirbelsäule, sondern auch Arme, Schultern und Beine mit dem Rumpf verbinden. Der breite Rückenmuskel – Latissimus dorsi. Die Gesäßmuskulatur – Gluteus maximus und seine Helfer. Diese Muskeln sind nicht nur Kraftquellen, sondern auch wichtige Lastverteiler. Wenn dein Gluteus zum Beispiel schwach ist, muss dein unterer Rücken seine Arbeit übernehmen – das ist eine sehr häufige Schmerzursache, gerade bei sitzberuflicher Tätigkeit. Wir kommen in Modul 2 ausführlich auf diesen Gluteus-Faktor zurück. Drei Schichten also, drei verschiedene Aufgaben: tief gleich Feinkontrolle, mittel gleich Aufrichtung, oberflächlich gleich Bewegung und Lastverteilung. Alle drei müssen gut zusammenarbeiten.",
      slides: [
        {
          type: "word",
          appearTime: 0,
          word: "Die Muskeln.",
        },
        {
          type: "content",
          appearTime: 1.927,
          headline: "Der Bodybuilder-Rücken ist nur ein kleiner Teil der Geschichte.",
        },
        {
          type: "content",
          appearTime: 10.739,
          kicker: "Mehrere Schichten",
          headline: "Muskeln umgeben die Wirbelsäule in Schichten – von tief bis oberflächlich.",
          lead: "Jede Schicht hat eine andere Aufgabe.",
        },
        {
          type: "term",
          appearTime: 22.686,
          kicker: "Schicht 1 · tief",
          term: "Die lokalen Stabilisatoren",
        },
        {
          type: "content",
          appearTime: 30.047,
          headline: "Nicht Kraft, sondern Feinkontrolle.",
          lead: "Sie halten benachbarte Wirbel stabil – für geschmeidige, präzise Bewegung.",
        },
        {
          type: "content",
          appearTime: 43.282,
          headline: "Funktionieren sie schlecht, entstehen kleine Wackelbewegungen.",
          lead: "Oft nach Schmerzepisoden – mit der Zeit können sie irritieren.",
        },
        {
          type: "content",
          appearTime: 50.932,
          kicker: "Multifidus",
          headline: "Der wichtigste lokale Stabilisator.",
          lead: "Er verläuft entlang der Wirbelsäule und kontrolliert jedes Segment einzeln.",
        },
        {
          type: "content",
          appearTime: 61.556,
          headline: "Nach einer Schmerz-Episode ist er oft schwächer.",
          lead: "Gezieltes Training kann ihn wieder aufbauen – mehr dazu in Modul 2.",
        },
        {
          type: "reveal-list",
          appearTime: 72.655,
          kicker: "Das innere Korsett",
          title: "Multifidus + Transversus abdominis",
          items: [{"label":"Transversus abdominis – tiefer querer Bauchmuskel"},{"label":"Mit dem Multifidus ein Korsett um die Wirbelsäule"},{"label":"Aktiv: gut geschützt — inaktiv: Stabilität von innen fehlt"}],
        },
        {
          type: "term",
          appearTime: 91.208,
          kicker: "Schicht 2 · mittel",
          term: "Erector spinae",
        },
        {
          type: "content",
          appearTime: 98.394,
          headline: "Zwei Säulen rechts und links der Wirbelsäule.",
          lead: "Sie richten dich aus der gebeugten Position auf – sichtbar als die zwei Wölbungen.",
        },
        {
          type: "content",
          appearTime: 114.417,
          kicker: "Die Kraft-Schicht",
          headline: "Bei Rückenschmerz wird sie häufig zu aktiv.",
          lead: "Sie spannt sich reflexartig an, um zu schützen – das spürst du als Verspannung.",
        },
        {
          type: "statement",
          appearTime: 127.257,
          text: "Verspannung ist meist Überaktivität, nicht Schwäche.",
          emphasis: "Überaktivität",
        },
        {
          type: "term",
          appearTime: 129.916,
          kicker: "Schicht 3 · oberflächlich",
          term: "Latissimus & Gluteus",
        },
        {
          type: "content",
          appearTime: 145.264,
          kicker: "Der Gluteus-Faktor",
          headline: "Ist der Gluteus schwach, übernimmt der untere Rücken seine Arbeit.",
          lead: "Eine sehr häufige Schmerzursache – gerade bei sitzender Tätigkeit. Mehr in Modul 2.",
        },
        {
          type: "reveal-list",
          appearTime: 164.2,
          kicker: "Zusammengefasst",
          title: "Drei Schichten, drei Aufgaben",
          items: [{"label":"Tief = Feinkontrolle"},{"label":"Mittel = Aufrichtung"},{"label":"Oberflächlich = Bewegung & Lastverteilung"}],
        },
      ],
    },
    {
      title: "Faszien",
      audioSrc: `${AUDIO_BASE}/abschnitt-3.mp3`,
      transkript: "Jetzt zu einem Gewebe, das in den letzten Jahren viel Aufmerksamkeit bekommen hat – manchmal mehr, als ihm sachlich zusteht: die Faszie. Was ist eine Faszie? Eine Faszie ist eine bindegewebige Hülle, die Muskeln umgibt, Muskeln untereinander verbindet, und das ganze Körpergewebe miteinander verknüpft. Stell dir eine Faszie vor wie eine sehr feine, aber sehr feste Frischhaltefolie, die jeden Muskel einhüllt – und gleichzeitig viele Muskeln zu größeren Funktionseinheiten zusammenbindet. Im unteren Rücken besonders wichtig ist die Fascia thoracolumbalis – die thorakolumbale Faszie. Sie ist eine sehr stabile, dichte Bindegewebsstruktur, die rückwärts wie ein großes Pflaster über dem unteren Rücken liegt. Sie verbindet den unteren Rücken mit der Gesäßmuskulatur, mit dem Latissimus, mit den schrägen Bauchmuskeln. Sie ist sozusagen die zentrale Schaltstelle, an der viele Muskelzüge zusammenlaufen. Faszien sind nicht nur passive Hüllen. Sie haben Nervenendigungen, sie können selbst Schmerz erzeugen, sie reagieren auf Belastung, sie verändern ihre Konsistenz mit Aktivität und Bewegungsmangel. Eine schlecht durchbewegte Faszie kann sich verkleben, weniger gleitfähig werden. Das wiederum kann zu Bewegungseinschränkungen und lokalem Druckgefühl im unteren Rücken führen. Was Faszien lieben? Dasselbe wie alle anderen Gewebe: Bewegung, Belastungswechsel, ausreichend Flüssigkeit, gute Durchblutung. Was sie nicht mögen: monotone Belastung über Stunden – etwa langes Sitzen. Faszien-Mobilisation ist deshalb ein wichtiger Bestandteil moderner Bewegungstherapie. Wir werden in Modul 2 konkrete Übungen kennenlernen, die genau auf die Fascia thoracolumbalis abzielen. Ein Hinweis zur Einordnung: Es gibt rund um Faszien einen gewissen Hype mit teils übertriebenen Versprechen. Vieles davon ist noch nicht abschließend wissenschaftlich gesichert. Faszien sind wichtig, aber sie sind nicht der einzige Schlüssel zu allem. Bleib hier auf der Höhe der seriösen Forschung – und das tust du in dieser Masterclass.",
      slides: [
        {
          type: "word",
          appearTime: 0,
          word: "Die Faszie.",
        },
        {
          type: "content",
          appearTime: 8.336,
          kicker: "Was ist eine Faszie?",
          headline: "Eine bindegewebige Hülle, die alles verbindet.",
          lead: "Sie umgibt Muskeln, verbindet sie untereinander und verknüpft das ganze Gewebe.",
        },
        {
          type: "content",
          appearTime: 19.539,
          headline: "Wie eine feine, feste Frischhaltefolie um jeden Muskel.",
          lead: "Sie bindet gleichzeitig viele Muskeln zu größeren Funktionseinheiten.",
        },
        {
          type: "content",
          appearTime: 30.604,
          kicker: "Fascia thoracolumbalis",
          headline: "Im unteren Rücken liegt sie wie ein großes Pflaster.",
          lead: "Eine sehr stabile, dichte Bindegewebsstruktur.",
        },
        {
          type: "reveal-list",
          appearTime: 43.27,
          kicker: "Die zentrale Schaltstelle",
          title: "Sie verbindet",
          items: [{"label":"den unteren Rücken mit der Gesäßmuskulatur"},{"label":"mit dem Latissimus"},{"label":"mit den schrägen Bauchmuskeln"}],
        },
        {
          type: "content",
          appearTime: 53.289,
          headline: "Faszien sind nicht nur passive Hüllen.",
          lead: "Sie haben Nervenendigungen, können selbst Schmerz erzeugen und reagieren auf Belastung.",
        },
        {
          type: "content",
          appearTime: 63.994,
          headline: "Schlecht durchbewegt, kann sie verkleben und weniger gleitfähig werden.",
          lead: "Die Folge: Bewegungseinschränkung und lokales Druckgefühl.",
        },
        {
          type: "statement",
          appearTime: 74.594,
          text: "Faszien lieben Bewegung. Sie hassen langes Sitzen.",
          emphasis: "Bewegung",
        },
        {
          type: "content",
          appearTime: 89.28,
          kicker: "Ausblick · Modul 2",
          headline: "Faszien-Mobilisation gehört zur modernen Bewegungstherapie.",
          lead: "In Modul 2 lernst du Übungen, die genau auf die Fascia thoracolumbalis zielen.",
        },
        {
          type: "content",
          appearTime: 101.576,
          kicker: "Zur Einordnung",
          headline: "Faszien sind wichtig – aber nicht der einzige Schlüssel zu allem.",
          lead: "Rund um sie gibt es einen Hype mit übertriebenen Versprechen. Wir bleiben bei seriöser Forschung.",
        },
      ],
    },
    {
      title: "Nerven",
      audioSrc: `${AUDIO_BASE}/abschnitt-4.mp3`,
      transkript: "Jetzt zu einer Struktur, die für chronischen Rückenschmerz besonders relevant ist – aber meist anders, als die meisten Menschen denken: dem Nervensystem. Im Wirbelkanal, also dem knöchernen Tunnel hinter den Wirbelkörpern, verläuft das Rückenmark. Aus dem Rückenmark treten in regelmäßigen Abständen Nervenwurzeln aus – jeweils ein Paar pro Wirbelhöhe. In der LWS-Region verläuft das eigentliche Rückenmark nicht mehr – es endet etwa auf Höhe des ersten oder zweiten Lendenwirbels. Darunter findest du die Cauda Equina, den Pferdeschwanz – ein Bündel aus einzelnen Nervenfasern, die noch durch den Wirbelkanal weiter nach unten ziehen, bevor sie segmentweise austreten. Jede Nervenwurzel – also jedes Nervenpaar – versorgt einen bestimmten Hautbereich und einen bestimmten Muskelbereich deines Körpers. Das ist sehr präzise organisiert. Der Bereich, den eine Nervenwurzel sensibel versorgt, nennt man Dermatom. Der Bereich, den sie motorisch versorgt, nennt man Myotom. Das ist klinisch wichtig: Wenn eine Nervenwurzel gereizt ist, kannst du oft an dem Schmerz- oder Taubheitsmuster ablesen, welche Nervenwurzel betroffen ist. Die wichtigsten Nervenwurzeln in der LWS treten zwischen L1 und S1 aus. Sie versorgen das gesamte Bein, das Gesäß, einen Teil des Beckenbodens. Wenn etwa die Nervenwurzel L5 gereizt ist, kann das einen Schmerz erzeugen, der außen am Oberschenkel entlang, über das Schienbein bis in den Fußrücken läuft. Bei der Wurzel S1 läuft der Schmerz typischerweise hinten am Bein hinunter bis in die Außenseite des Fußes. Mehrere Nervenwurzeln des unteren Rückens vereinen sich später zum Ischiasnerv. Das ist der dickste Nerv im menschlichen Körper – er hat den Durchmesser eines kleinen Fingers. Er verläuft tief im Gesäß, hinter dem Oberschenkel, und teilt sich kurz oberhalb des Knies auf. Wenn man von Ischias oder Ischialgie spricht, meint man Schmerzen, die diesem Nerven oder seinen Wurzeln zuzuordnen sind. Wichtig zur Unterscheidung: Nicht jeder Schmerz, der ins Bein ausstrahlt, ist eine Nervenwurzelreizung. Vieles, was nach Ischias fühlt, ist eigentlich referred pain – fortgeleiteter Schmerz von tiefen Strukturen wie Facettengelenken, Muskeln oder ISG. Das ist klinisch wichtig: Echte Nervenwurzelreizung strahlt typischerweise unterhalb des Knies aus, oft mit Kribbeln oder Taubheit. Fortgeleiteter Schmerz bleibt meist oberhalb des Knies und fühlt sich eher dumpf an. Diese Unterscheidung wird in der ärztlichen Untersuchung gemacht – sie ist für die richtige Therapieentscheidung wichtig. Und ein Punkt, der oft übersehen wird: Selbst wenn ein Nerv im MRT sichtbar eingeengt ist, heißt das nicht zwingend, dass er die Schmerzen verursacht. Wieder dieselbe Geschichte wie bei den Bandscheiben – Befund ist nicht immer gleich Ursache. Dazu in Lektion 1.4 mehr.",
      slides: [
        {
          type: "word",
          appearTime: 0,
          word: "Die Nerven.",
        },
        {
          type: "content",
          appearTime: 8.487,
          kicker: "Der Wirbelkanal",
          headline: "Im knöchernen Tunnel verläuft das Rückenmark.",
          lead: "Pro Wirbelhöhe tritt ein Paar Nervenwurzeln aus.",
        },
        {
          type: "content",
          appearTime: 20.015,
          kicker: "Cauda Equina",
          headline: "Das Rückenmark endet bei L1/L2 – darunter liegt der „Pferdeschwanz“.",
          lead: "Ein Bündel einzelner Nervenfasern, die segmentweise austreten.",
        },
        {
          type: "reveal-list",
          appearTime: 38.684,
          kicker: "Präzise organisiert",
          title: "Jede Nervenwurzel versorgt",
          items: [{"label":"Dermatom = der sensibel versorgte Hautbereich"},{"label":"Myotom = der motorisch versorgte Muskelbereich"}],
        },
        {
          type: "statement",
          appearTime: 55.74,
          text: "Am Schmerz- oder Taubheitsmuster lässt sich oft ablesen, welche Wurzel betroffen ist.",
        },
        {
          type: "content",
          appearTime: 63.634,
          kicker: "L1 bis S1",
          headline: "Sie versorgen das ganze Bein, das Gesäß, einen Teil des Beckenbodens.",
        },
        {
          type: "reveal-list",
          appearTime: 72.319,
          kicker: "Zwei Beispiele",
          title: "Typische Schmerzwege",
          items: [{"label":"L5: außen am Oberschenkel, über das Schienbein in den Fußrücken"},{"label":"S1: hinten am Bein hinunter bis in die Außenseite des Fußes"}],
        },
        {
          type: "content",
          appearTime: 87.899,
          kicker: "Der Ischiasnerv",
          headline: "Der dickste Nerv im Körper – dick wie ein kleiner Finger.",
          lead: "Er verläuft tief im Gesäß, hinter dem Oberschenkel, und teilt sich über dem Knie auf.",
        },
        {
          type: "content",
          appearTime: 103.109,
          headline: "„Ischias“ meint Schmerzen dieses Nervs oder seiner Wurzeln.",
        },
        {
          type: "statement",
          appearTime: 110.168,
          text: "Nicht jeder Schmerz, der ins Bein ausstrahlt, ist eine Nervenwurzelreizung.",
          emphasis: "nicht",
        },
        {
          type: "content",
          appearTime: 116.716,
          kicker: "Referred pain",
          headline: "Vieles, was nach Ischias fühlt, ist fortgeleiteter Schmerz.",
          lead: "Aus tiefen Strukturen wie Facettengelenken, Muskeln oder ISG.",
        },
        {
          type: "reveal-list",
          appearTime: 128.151,
          kicker: "Die wichtige Unterscheidung",
          title: "Wo strahlt der Schmerz hin?",
          items: [{"label":"Echte Nervenwurzelreizung: unterhalb des Knies, mit Kribbeln/Taubheit"},{"label":"Fortgeleiteter Schmerz: oberhalb des Knies, eher dumpf"},{"label":"Die Unterscheidung trifft die ärztliche Untersuchung"}],
        },
        {
          type: "content",
          appearTime: 146.983,
          dark: true,
          kicker: "Oft übersehen",
          headline: "Ein eingeengter Nerv im MRT ist nicht zwingend die Schmerzursache.",
          lead: "Wie bei den Bandscheiben: Befund ist nicht immer gleich Ursache. Mehr in 1.4.",
        },
      ],
    },
    {
      title: "Das ISG",
      audioSrc: `${AUDIO_BASE}/abschnitt-5.mp3`,
      transkript: "Jetzt zum letzten anatomischen Bauteil, das wir in diesem Modul besprechen – dem ISG, dem Iliosakralgelenk. Das ISG ist das Gelenk zwischen dem Kreuzbein – also dem unteren Ende deiner Wirbelsäule – und dem Beckenring. Genauer: zwischen dem Kreuzbein und der Beckenschaufel rechts und links. Du hast also zwei ISGs, eines auf jeder Seite. Wenn du dir mit den Händen ans Gesäß fasst und nach oben ertastest, wo dein Kreuzbein in das Becken übergeht – ungefähr dort spürst du die Region der ISGs. Was ist das Besondere am ISG? Es ist ein sehr unbewegliches Gelenk. Die Bewegungsamplitude beträgt nur wenige Grad – oft nur ein bis drei Grad in jede Richtung. Es ist also fast eine starre Verbindung, mit einer winzigen Beweglichkeit zur Stoßdämpfung und Lastverteilung. Im Vergleich zu deinem Schulter- oder Hüftgelenk ist das ISG quasi unbeweglich. Trotz dieser geringen Beweglichkeit kann das ISG eine bedeutende Schmerzquelle sein. Warum? Weil es eine zentrale Schaltstelle für Kraftübertragung ist. Hier wird die Last vom Oberkörper über das Kreuzbein in das Becken und in die Beine übertragen. Jeder Schritt, den du gehst, läuft durch das ISG. Jedes Heben, jedes Bücken, jedes Anstrengen erzeugt Kräfte, die durch das ISG laufen. Wenn das ISG gereizt ist – sei es durch ungewohnte Belastung, einseitige Haltung, Schwangerschaft, oder einfach ohne erkennbaren Grund – entsteht ein typischer Schmerz: meist seitlich-tief am unteren Rücken, häufig einseitig. Manchmal strahlt er ins Gesäß oder den Oberschenkel aus. Er ist oft beim Aufstehen aus dem Sitzen schlimm, beim einbeinigen Stehen, beim Treppensteigen oder im Liegen auf der betroffenen Seite. Der Begriff ISG-Blockade, den du vielleicht kennst, ist – wie ich in Lektion I.2 schon kurz angesprochen habe – etwas irreführend. Eine echte mechanische Blockade im Sinne eines verklemmten Gelenks ist anatomisch kaum denkbar. Was meist gemeint ist, ist ein Reizzustand mit erhöhter Muskelspannung um das Gelenk herum. Dieser Reizzustand spricht gut auf Bewegung, gezielte Mobilisation und entlastende Positionen an. Auch das ist Modul-2-Material. Das ISG kann übrigens auch von ganz oben her gestört werden – durch Bewegungseinschränkungen in der Hüfte zum Beispiel. Wenn deine Hüfte nicht voll beweglich ist, muss das ISG mehr arbeiten und wird überreizt. Deshalb gehört zu jeder guten ISG-Therapie ein Blick auf Hüfte und Becken-Statik. Auch dazu in Modul 2 mehr.",
      slides: [
        {
          type: "word",
          appearTime: 0,
          word: "Das ISG.",
        },
        {
          type: "content",
          appearTime: 6.803,
          kicker: "Iliosakralgelenk",
          headline: "Das Gelenk zwischen Kreuzbein und Beckenschaufel.",
          lead: "Du hast zwei ISGs – eines auf jeder Seite.",
        },
        {
          type: "content",
          appearTime: 19.691,
          headline: "Taste am Gesäß nach oben – dort, wo das Kreuzbein ins Becken übergeht.",
          lead: "Ungefähr dort sitzt die Region der ISGs.",
        },
        {
          type: "content",
          appearTime: 28.502,
          kicker: "Das Besondere",
          headline: "Ein sehr unbewegliches Gelenk – oft nur 1 bis 3 Grad.",
          lead: "Fast eine starre Verbindung, mit winziger Beweglichkeit zur Stoßdämpfung.",
        },
        {
          type: "content",
          appearTime: 44.593,
          headline: "Quasi unbeweglich – und trotzdem eine bedeutende Schmerzquelle.",
        },
        {
          type: "content",
          appearTime: 54.694,
          kicker: "Zentrale Schaltstelle",
          headline: "Jeder Schritt, jedes Heben, jedes Bücken läuft durch das ISG.",
          lead: "Hier wird die Last vom Oberkörper ins Becken und in die Beine übertragen.",
        },
        {
          type: "content",
          appearTime: 73.038,
          kicker: "Typischer ISG-Schmerz",
          headline: "Meist seitlich-tief am unteren Rücken, häufig einseitig.",
          lead: "Manchmal strahlt er ins Gesäß oder den Oberschenkel aus.",
        },
        {
          type: "reveal-list",
          appearTime: 92.218,
          kicker: "Wann er oft schlimm ist",
          title: "Typische Auslöser",
          items: [{"label":"Aufstehen aus dem Sitzen"},{"label":"Einbeiniges Stehen"},{"label":"Treppensteigen"},{"label":"Liegen auf der betroffenen Seite"}],
        },
        {
          type: "content",
          appearTime: 99.079,
          kicker: "„ISG-Blockade“",
          headline: "Ein verklemmtes Gelenk ist anatomisch kaum denkbar.",
          lead: "Gemeint ist meist ein Reizzustand mit erhöhter Muskelspannung rund um das Gelenk.",
        },
        {
          type: "statement",
          appearTime: 118.027,
          text: "ISG-Blockade ist meist kein verklemmtes Gelenk – es ist ein Reizzustand.",
          emphasis: "Reizzustand",
        },
        {
          type: "content",
          appearTime: 126.572,
          kicker: "Der Hüft-Zusammenhang",
          headline: "Eine unbewegliche Hüfte zwingt das ISG zu mehr Arbeit.",
          lead: "Deshalb gehört zu jeder guten ISG-Therapie ein Blick auf Hüfte und Becken-Statik.",
        },
      ],
    },
    {
      title: "Synthese: Die LWS als System",
      audioSrc: `${AUDIO_BASE}/abschnitt-6.mp3`,
      transkript: "Lass mich am Ende dieser Lektion einen Schritt zurücktreten und dir das große Bild zeigen. Du hast in dieser und der vorigen Lektion alle wichtigen anatomischen Bauteile deines unteren Rückens kennengelernt: Wirbel, Bandscheiben, Facettengelenke, drei Muskelschichten, die thorakolumbale Faszie, das Nervensystem mit Cauda Equina und Ischiasnerv, und das ISG. Was ich dir mitgeben möchte, ist nicht, dass du dir jeden dieser Begriffe sofort merken musst. Was ich dir mitgeben möchte, ist ein Bild – ein mentales Bild von deinem unteren Rücken als System. Nicht als einzelne Bandscheibe, die kaputt geht. Nicht als einzelne Verspannung, die du wegmassieren musst. Sondern als ein zusammenwirkendes System aus Knochen, Polstern, Gelenken, Muskeln, Faszien und Nerven. Wenn du Schmerz hast, ist es selten eine einzelne Struktur, die schreit. Es ist häufiger ein Zusammenspiel – ein Muskel ist überaktiv, ein anderer schläft, die Faszie ist weniger gleitfähig, die Bewegung ist eingeschränkt, das Nervensystem ist sensibilisiert. Schmerz ist ein Systemzeichen, kein einzelner Defekt. Genau deshalb funktionieren auch isolierte Lösungen meistens nicht. Eine einzelne Spritze in die schmerzende Bandscheibe löst selten das ganze Problem. Eine einzelne Massage löst selten die ganze Spannung. Was funktioniert, ist Arbeit am System – Bewegung, Belastungsdosierung, neue Routinen, Verständnis. Das ist das Programm der nächsten Module.",
      slides: [
        {
          type: "content",
          appearTime: 0,
          kicker: "Synthese · Das große Bild",
          headline: "Treten wir einen Schritt zurück.",
        },
        {
          type: "reveal-list",
          appearTime: 5.259,
          kicker: "Alle Bauteile aus 1.1 & 1.2",
          title: "Dein unterer Rücken",
          items: [{"label":"Wirbel, Bandscheiben, Facettengelenke"},{"label":"Drei Muskelschichten"},{"label":"Die thorakolumbale Faszie"},{"label":"Nervensystem mit Cauda Equina & Ischiasnerv"},{"label":"Das ISG"}],
        },
        {
          type: "content",
          appearTime: 23.545,
          headline: "Du musst nicht jeden Begriff merken – behalte ein Bild.",
          lead: "Ein mentales Bild von deinem unteren Rücken als System.",
        },
        {
          type: "content",
          appearTime: 34.888,
          headline: "Kein einzelnes Teil, das kaputt geht – ein zusammenwirkendes System.",
          lead: "Aus Knochen, Polstern, Gelenken, Muskeln, Faszien und Nerven.",
        },
        {
          type: "content",
          appearTime: 47.137,
          kicker: "Selten eine einzelne Struktur",
          headline: "Schmerz ist häufiger ein Zusammenspiel.",
          lead: "Ein Muskel überaktiv, einer schläft, die Faszie weniger gleitfähig, das Nervensystem sensibilisiert.",
        },
        {
          type: "statement",
          appearTime: 63.251,
          text: "Schmerz ist ein Systemzeichen. Kein einzelner Defekt.",
          emphasis: "Systemzeichen",
        },
        {
          type: "content",
          appearTime: 66.537,
          kicker: "Warum isolierte Lösungen scheitern",
          headline: "Eine Spritze, eine Massage – löst selten das ganze Problem.",
        },
        {
          type: "reveal-list",
          appearTime: 78.797,
          kicker: "Was funktioniert",
          title: "Arbeit am System",
          items: [{"label":"Bewegung"},{"label":"Belastungsdosierung"},{"label":"Neue Routinen"},{"label":"Verständnis"}],
        },
      ],
    },
    {
      title: "Workbook & Übergang",
      audioSrc: `${AUDIO_BASE}/abschnitt-7.mp3`,
      transkript: "Bevor du weitergehst, ein wichtiger Workbook-Stopp. Im Workbook findest du Übung 1.2: Body-Map. Auf einer Figur trägst du ein, wo du deinen Schmerz spürst. Wo ist er am stärksten? Wo strahlt er hin? Wann tritt er auf? Diese Body-Map wird uns in mehreren späteren Lektionen begleiten – und du wirst überrascht sein, wie viel klarer dein eigenes Bild wird, wenn du es einmal aufgezeichnet hast. In der nächsten Lektion – 1.3 – verlassen wir die reine Anatomie und gehen ins Verstehen einen Schritt tiefer. Wir sprechen darüber, was chronisch eigentlich bedeutet. Warum manche Schmerzen einfach nicht weggehen. Was im Nervensystem passiert, wenn Schmerz zur Dauerbegleitung wird. Und – das ist die wichtige Frage – was sich daran ändern lässt. Bis gleich.",
      slides: [
        {
          type: "content",
          appearTime: 0,
          kicker: "Workbook · Übung 1.2",
          headline: "Ein wichtiger Workbook-Stopp: die Body-Map.",
          lead: "Auf einer Figur trägst du ein, wo du deinen Schmerz spürst.",
        },
        {
          type: "reveal-list",
          appearTime: 9.044,
          kicker: "Drei Fragen",
          title: "Deine Body-Map",
          items: [{"label":"Wo ist der Schmerz am stärksten?"},{"label":"Wo strahlt er hin?"},{"label":"Wann tritt er auf?"}],
        },
        {
          type: "content",
          appearTime: 23.254,
          kicker: "Als Nächstes · Lektion 1.3",
          headline: "Was „chronisch“ eigentlich bedeutet.",
          lead: "Warum manche Schmerzen nicht weggehen – und was im Nervensystem passiert.",
        },
        {
          type: "outro",
          appearTime: 40.216,
          nextLabel: "Lektion 1.3",
          nextTitle: "Was „chronisch“ wirklich bedeutet",
          hint: "Weiter →",
        },
        {
          type: "word",
          appearTime: 43.072,
          word: "Bis gleich.",
        },
      ],
    },
  ],
};

/** Gesamtanzahl Slides der Lektion. */
export const total_1_2: number = totalSlides(lesson_1_2);

/** Flache Liste aller Slides (mit Rückverweis auf den Abschnitt). */
export const flat_1_2: FlatSlide[] = flatSlides(lesson_1_2);

export default lesson_1_2;
