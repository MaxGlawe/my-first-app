# PROJ-28 — Schaltzentrale im Call (und ein Wartezimmer, das nach Praxis aussieht)

> **Der Raum ist heute eine Seite. Er muss ein Arbeitsplatz werden.**

**Status:** In Review — Phase 0 bis 4 gebaut und am 24.09.2026 **vollstaendig im Echtbetrieb bestaetigt** (Akte, Zeigen, Notiz, geloestes Fenster, Plan mit Handy-Vorschau, Bewegungsbild)
**Stand:** 24.09.2026
**Baut auf:** PROJ-27 (Sprechzimmer, Dokumentenakte), PROJ-8/9/10 (Übungen, Pläne, Hausaufgaben), PROJ-26 (Programm-Abschluss im Call)

---

## 1 · Warum

Der erste echte Call am 24.09.2026 lief technisch sauber — und legte offen, was
fehlt. Die Steuerleiste kennt vier Knöpfe: Mikrofon, Kamera, Bildschirm teilen,
Auflegen. Das ist ein Telefon mit Bild.

Der Behandler sagt es selbst:

> „Ich kann nicht auf Befunde zugreifen. Geil wäre, wenn ich eine eigene
> Schaltzentrale im Call hätte, wo ich auf die Dokumente zugreifen könnte und
> auch das Handy, wo ich dann Plan erstellen kann und ihm zeigen kann. Ich kann
> auch nicht den Call klein machen und was anderes im Hintergrund machen."

Das ist kein fehlender Knopf. Es ist die Bauform: Der Raum ist eine **Seite**,
und eine Seite kann man nur verlassen. Wer sie verlässt, lässt den Patienten
allein — derselbe Fehler, der schon die Einladungstafel in den Raum gezwungen
hat (PROJ-27).

Zweitens: Das Wartezimmer trägt heute die Hausfarben, aber keinen Namen. Für
viele Patienten ist dieser Link der **erste Kontakt mit Praxis OS überhaupt** —
vor Konto, vor Vertrag. Eine namenlose Seite, auf der man auf ein Videogespräch
über den eigenen Körper wartet, nimmt niemandem die Angst.

---

## 2 · Zeigen statt Teilen — die tragende Entscheidung

Der naheliegende Weg wäre: zweiter Tab, Bildschirm teilen. Den verbauen wir
bewusst nicht als Hauptweg.

**Wer seinen Bildschirm oder Tab teilt, zeigt im Zweifel die Patientenliste, den
Chat-Posteingang mit fremden Namen oder eine Benachrichtigung, die gerade
aufploppt.** Einmal unachtsam, und ein Patient sieht die Daten eines anderen.
Das ist der häufigste Weg, auf dem in Videosprechstunden Daten abfließen, und
er ist meldepflichtig.

Deshalb: **gezielter Wurf statt offener Bildschirm.** Der Behandler wählt ein
Dokument, eine Übung, einen Planentwurf — und schickt genau das in die Ansicht
des Patienten. Der sieht nur, was geworfen wurde. Bildschirmteilen bleibt
erhalten, aber als Ausnahme für den Fall, für den es gedacht war: etwas zeigen,
das nicht aus Praxis OS kommt.

Technisch trägt das der Datenkanal des Videoraums — beide Seiten sind ohnehin
schon im selben Raum, es braucht keinen zweiten Weg.

---

## 3 · Phasen

### Phase 0 — Wartezimmer mit Absender ✓ *(deployt 24.09.2026, Commit 2efc16d)*

Betrifft beide Wartezustände: die Countdown-Seite vor der Öffnung
(`/sprechzimmer/[token]`) und den Geräte-Check direkt davor (`Warteraum` in
`components/video/Sprechzimmer.tsx`).

* **Praxisname und Behandlername sichtbar** — aus `praxis_settings.praxis_name`
  und dem Namen, der ohnehin schon geladen wird.
* **Typografische Wortmarke** statt Bilddatei: Die Marke ist Serif + Paper/Ink/
  Green. Ein gesetzter Schriftzug braucht keine Datei, die irgendwo gepflegt
  werden muss, und sieht auf jedem Bildschirm scharf aus. *(Ein Foto des
  Behandlers wäre stärker — dafür fehlt bis heute sowohl das Feld als auch das
  Foto. Nachrüstbar: Bucket `avatars` existiert.)*
* **Drei Sätze, die Angst nehmen** — was gleich passiert, wie lange es dauert,
  und: **„Das Gespräch wird nicht aufgezeichnet."** Das ist keine Floskel,
  sondern die Wahrheit über die Anlage (kein Egress installiert) und genau die
  Frage, die sich jeder still stellt.
* **Telefonnummer der Praxis** für den Fall, dass etwas klemmt. Wer im
  Wartezimmer festhängt und keinen Ausweg sieht, legt auf.

### Phase 1 — Arbeitsfläche im Raum ✓ *(Commit 89b35f4 — Akte und Notiz; „Anfordern" verschoben, siehe Offen)*

Der Raum bekommt eine zweite Spalte. Video links, Schaltzentrale rechts;
auf dem Handy wird daraus ein Blatt, das von unten hochzieht.

Reiter zum Start:

| Reiter | Was er kann |
|---|---|
| **Akte** | Befunde und Arztbriefe des Patienten lesen — PDF und Bild direkt im Raum, über kurzlebige signierte Links (`/api/documents/[id]` gibt es bereits). |
| **Zeigen** | Das offene Dokument in die Ansicht des Patienten werfen. Er sieht es formatfüllend, mit seinem eigenen Zurück-Knopf. |
| **Anfordern** | „Befund jetzt abfotografieren" — öffnet auf seinem Gerät den mehrseitigen Scanner aus PROJ-27. Der Hinweis „denke an deine Befunde" wird damit vom Wunsch zum Knopf. |
| **Notiz** | Was hier getippt wird, landet nach dem Auflegen im Behandlungseintrag — nicht in einem zweiten Formular. Zweimal tippt niemand; beim dritten Mal lässt man es. |

### Phase 2 — Das Fenster lösen ✓

**Document Picture-in-Picture** (Chrome/Edge ab 116; der Behandler arbeitet mit
Edge 153): Das Patientenbild **samt Mikrofon- und Auflegen-Knopf** schwebt als
eigenes Fenster über allem, während darunter das ganze Praxis OS frei bedienbar
bleibt — Akte, Pläne, Buchhaltung.

Ehrlich zum Aufwand: Das Videoelement muss beim Umzug ins neue Fenster sauber
übergeben werden, sonst stockt das Bild; die Stile müssen mitkopiert werden; das
Fenster darf nur auf Klick aufgehen. Kein Zehnzeiler, aber ein überschaubares
Stück Arbeit.

Fällt zurück auf das gewöhnliche Bild-im-Bild (nur Video, keine Knöpfe), wo das
Verfahren fehlt.

### Phase 3 — Plan bauen im Gespräch ✓

Übungen suchen, das Übungsvideo dem Patienten zeigen („schau, so sieht das
aus"), Übungen in einen Entwurf legen, den er **mitwachsen sieht**, am Ende mit
einem Klick in seine App senden.

Das ist der Moment, in dem aus einem Gespräch ein Programm wird — und der
Moment, in dem der Patient begreift, wofür er zahlt (PROJ-26).

Gesendet wird als **Ad-hoc-Zuweisung** (PROJ-10), nicht als Trainingsplan mit
Phasen und Einheiten: Was im Gespräch entsteht, sind ein paar Übungen für die
nächsten Wochen, kein Bauwerk. Der grosse Builder bleibt für das, wofür er
gemacht ist — und der Patient bekommt die Übungen auf demselben Weg in die App,
den er von allen anderen Hausaufgaben kennt.

Zeitraum (Wochen ab heute) und Trainingstage stehen im Fuss der Schublade;
Voreinstellung vier Wochen, Mo/Mi/Fr. Sätze und Wiederholungen kommen aus den
Standardwerten der Übung und sind im Entwurf überschreibbar.

### Phase 3a — „So sieht es bei dir aus" ✓

Der Plan landet in der App — aber der Patient sieht davon im Gespräch nichts
außer vier Namen. Deshalb eine **Handy-Vorschau**, die der Behandler ihm auf
den Schirm wirft: das Telefon mit der Karte „Heute trainieren — 4 Übungen, ca.
12 Minuten", den Übungen darunter, den Trainingstagen.

Eine Liste mit vier Namen ist eine Ankündigung. Ein Handy, auf dem das Training
steht, ist ein Versprechen, das man anfassen kann — der Patient muss sich nicht
vorstellen, was er bekommt, er sieht es, **bevor** er zustimmt.

Die Vorschau ist der Karte aus `components/app/HeuteKarte.tsx` nachgebaut:
dieselbe Farbe, dieselbe Aufteilung, dieselbe Rechnung für die Dauer. Eine
hübschere Vorschau als die Wirklichkeit wäre ein Versprechen, das die App am
nächsten Morgen bricht.

Sie wächst mit: Kommt eine Übung dazu, erscheint sie sofort auf seinem Handy.
Wird der Plan gesendet, wechselt die Zeile darunter auf „Das liegt jetzt in
deiner App". Der Behandler sieht dieselbe Vorschau verkleinert in seiner
Schublade — ohne Gegenkontrolle zeigt man irgendwann etwas, von dem man glaubt,
es sei etwas anderes.

### Phase 4 — Bewegung festhalten ✓ *(das eigentlich Physiotherapeutische)*

Standbild aus dem laufenden Bild des Patienten einfrieren, **Winkel über drei
Punkte** und **Linien mit Neigung zur Senkrechten** einzeichnen, als
Bewegungsbild in seine Akte legen, mit einer früheren Aufnahme
nebeneinanderlegen („Termin 1 gegen Termin 5").

Dazu die **Aufbau-Hilfe**: vier Schritte auf dem Schirm des Patienten (Gerät
hüfthoch, seitlich oder frontal, ganz ins Bild, Standort merken). Ohne
standardisierten Aufbau misst der Vergleich in acht Wochen die Kamerahöhe
statt den Fortschritt.

**Was das Werkzeug ausdrücklich NICHT tut** — und warum das eine Entscheidung
ist, keine Lücke:

| Nicht möglich | Warum |
|---|---|
| **Kraft und Last** („das rechte Bein trägt 43 kg") | Kraft steckt nicht im Bild. Auch Ganglabore mit acht Kameras brauchen Kraftmessplatten im Boden. Eine geschätzte Zahl stünde erfunden in einer Patientenakte |
| **Rotationen** (HWS-Drehung, Hüft-IRO, Pro-/Supination) | Gehen in die Tiefe; eine Bildebene fasst sie nicht |
| **Strecken in Zentimetern** | Kein Maßstab im Bild. Deshalb misst eine Linie ihren Winkel zur Senkrechten — die Zahl stimmt auch ohne Maßstab |
| **Beckenschiefstand in Millimetern** | Wird von Kameraneigung, Standrotation und Kleidung dominiert. Auch die Palpation in der Praxis ist hier unzuverlässig; ein Foto macht den Fehler nur reproduzierbar |

Messbar sind Winkel **in der Bildebene**: Knieflexion sagittal, Schulter- und
Hüftelevation frontal, HWS-Flexion/Seitneigung, Rumpfneigung, Dorsalextension.
Nicht messbar ist alles Feine (Hand, Finger, Rückfußachse) auf Webcam-Abstand.

**Der eigentliche Wert liegt im Vergleich, nicht im Einzelwert.** Absolute
Zahlen aus einem Handybild sind fehleranfällig; Veränderungen bei gleichem
Aufbau sind robust. Dazu kommt, was die Praxis nicht kann: Der Patient steht
in seiner Wohnung, in seinen Schuhen — und er sieht seinen Fortschritt selbst.

Migration `20260924000001_bewegungsbild.sql` (neue Kategorie `bewegungsbild`)
muss **von Hand im Supabase-Editor** laufen. Fehlt sie, antwortet der Upload
seit demselben Commit mit einem sprechenden Hinweis statt mit 500.

---

## 4 · Entscheidungen (verbindlich)

| Thema | Entscheidung |
|---|---|
| Zeigen | **Gezielter Wurf** über den Datenkanal. Bildschirmteilen bleibt die Ausnahme, nicht der Weg |
| Arbeiten außerhalb | Document Picture-in-Picture, nicht „Tab wechseln und hoffen" |
| Aufzeichnung | Weiterhin **keine** — und das steht jetzt auch sichtbar im Wartezimmer |
| Marke im Wartezimmer | Typografisch, ohne Bilddatei. Foto erst, wenn es eins gibt |
| Notizen | Fließen in die bestehende Behandlungsdokumentation, kein zweites Formular |
| Reihenfolge | Phase 0 und 1 lösen das heutige Problem. 3 und 4 sind eigene Vorhaben |

---

## 4a · Was der Echtbetrieb am 24.09.2026 gekostet hat

Vier Fehler, die alle erst im Gebrauch sichtbar wurden — und alle dieselbe
Bauart hatten: **etwas schlug fehl, ohne es zu sagen.**

| Fehler | Ursache | Lehre |
|---|---|---|
| 502 auf dem Handy | Nginx `proxy_buffer_size` 4 KB, CSP + Supabase-Cookies passten nicht hinein | Erst `error.log` lesen, dann die App verdaechtigen |
| „PC manager is closed" | Gesendet, bevor die Verbindung stand — und nie nachgeholt | Nur bei stehender Verbindung senden, danach den **ganzen Zustand** nachreichen |
| Standbild schwarz | Abgezeichnet von einem Element, das niemand sieht — der Browser malt es nicht | Von der Kachel abzeichnen, die ohnehin laeuft |
| Warnung „fast schwarz" blieb stumm | Helligkeit in der **Ecke** gemessen; bei Hochkant-Video sind das schwarze Balken | Proben gehoeren in die Mitte |

Seitdem gilt im Raum: Jeder Fehlschlag wird sichtbar — roter Balken beim
Sender, Klartext beim Empfaenger, und ein staendiger Anwesenheitspunkt
(„Max ist im Raum"), damit niemand in einen leeren Raum wirft und auf eine
Reaktion wartet, die nicht kommen kann.

## 5 · Offen

* **„Anfordern" fehlt noch.** Der Scanner liegt in der Patienten-App und setzt
  ein Konto voraus; bei der Erstkonsultation hat der Patient keines. Ein Wurf,
  der beim Gast ins Leere führt, wäre schlimmer als kein Knopf. Braucht einen
  Upload-Weg über den Gast-Token — eigenes Stück Arbeit.
* **Der gezeigte Link gilt fünf Minuten.** Wer ein Dokument länger bespricht,
  sieht es weiter (es ist geladen), aber ein Neuladen beim Patienten liefe ins
  Leere. Auffrischen, sobald es jemandem auffällt.
* Notiz liegt vorerst am Gespräch (`video_calls.notiz`) und erscheint dort beim
  Beenden. Der Weg in die Behandlungsdokumentation aus PROJ-5 kommt, wenn
  Phase 3 die Pläne anfasst.
* Ob der Patient sehen soll, **dass** gerade etwas geworfen wird, bevor es
  erscheint (kurzer Hinweis statt Sprung).
* Foto des Behandlers: Feld, Upload, Zuschnitt — lohnt erst mit vorhandenem Foto.
