# PROJ-28 — Schaltzentrale im Call (und ein Wartezimmer, das nach Praxis aussieht)

> **Der Raum ist heute eine Seite. Er muss ein Arbeitsplatz werden.**

**Status:** Planned
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

### Phase 0 — Wartezimmer mit Absender *(klein, unabhängig, sofort spürbar)*

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

### Phase 1 — Arbeitsfläche im Raum

Der Raum bekommt eine zweite Spalte. Video links, Schaltzentrale rechts;
auf dem Handy wird daraus ein Blatt, das von unten hochzieht.

Reiter zum Start:

| Reiter | Was er kann |
|---|---|
| **Akte** | Befunde und Arztbriefe des Patienten lesen — PDF und Bild direkt im Raum, über kurzlebige signierte Links (`/api/documents/[id]` gibt es bereits). |
| **Zeigen** | Das offene Dokument in die Ansicht des Patienten werfen. Er sieht es formatfüllend, mit seinem eigenen Zurück-Knopf. |
| **Anfordern** | „Befund jetzt abfotografieren" — öffnet auf seinem Gerät den mehrseitigen Scanner aus PROJ-27. Der Hinweis „denke an deine Befunde" wird damit vom Wunsch zum Knopf. |
| **Notiz** | Was hier getippt wird, landet nach dem Auflegen im Behandlungseintrag — nicht in einem zweiten Formular. Zweimal tippt niemand; beim dritten Mal lässt man es. |

### Phase 2 — Das Fenster lösen

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

### Phase 3 — Plan bauen im Gespräch *(eigenes Gewicht, danach)*

Übungen suchen, Video auf **beiden** Seiten gleichzeitig abspielen („schau, so
sieht das aus"), Übungen in einen Entwurf legen, den der Patient mitwachsen
sieht, am Ende mit einem Klick in seine App senden.

Das ist der Moment, in dem aus einem Gespräch ein Programm wird — und der
Moment, in dem der Patient begreift, wofür er zahlt (PROJ-26).

### Phase 4 — Bewegung festhalten *(das eigentlich Physiotherapeutische)*

Standbild aus dem laufenden Bild des Patienten einfrieren, Linien und Winkel
einzeichnen, als Befund in seine Akte legen, später nebeneinanderlegen
(„Termin 1 gegen Termin 5").

Das kann kein Zoom und kein Teams. Es ist der Teil, der ein *Sprechzimmer* von
einer *Videokonferenz* unterscheidet — und handwerklich billiger, als es klingt.

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

## 5 · Offen

* Wohin genau der Notiz-Text nach dem Auflegen geschrieben wird — braucht einen
  Blick auf die Behandlungsdokumentation aus PROJ-5.
* Ob der Patient sehen soll, **dass** gerade etwas geworfen wird, bevor es
  erscheint (kurzer Hinweis statt Sprung).
* Foto des Behandlers: Feld, Upload, Zuschnitt — lohnt erst mit vorhandenem Foto.
