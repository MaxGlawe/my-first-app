# Anfrage: Webhook vom Buchungskalender an Praxis OS

> **Empfänger:** Entwickler des Online-Buchungskalenders (physiotherapie-glawe.de)
> **Auftraggeber:** Praxis Glawe — Praxis OS
> **Stand:** 26.09.2026
> **Aufwand auf eurer Seite:** ein HTTP-POST pro Buchung. Mehr nicht.

---

## Worum es geht

Wenn ein Patient bei euch im Kalender bucht, soll Praxis OS das sofort
erfahren. Heute tippen wir jede Buchung von Hand ab — Name, E-Mail,
Geburtsdatum, Uhrzeit. Das kostet Zeit und erzeugt Tippfehler und Dubletten.

Die Gegenstelle ist seit Monaten fertig und getestet. Es fehlt nur, dass ihr
uns Bescheid gebt.

Bei der Leistung **„Video-Sprechstunde (Praxis OS)"** hängt noch mehr daran:
Praxis OS legt dann automatisch den Videotermin an und verschickt die
Einladung mit Zugangslink und Kalendereintrag an den Patienten. Für die
Praxis bleibt nichts zu tun.

---

## 1 · Ziel

```
POST https://wwwpraxis-os.com/api/webhooks/booking
Content-Type: application/json
X-Webhook-Signature: sha256=<HMAC-SHA256 des rohen Rumpfes>
```

Das Secret für die Signatur bekommt ihr von der Praxis (erzeugt unter
*Praxis OS → Admin → Integrationen*). Bitte **nicht** per Mail im Klartext —
Telefon oder ein Passwortdienst.

**Signatur:** HMAC-SHA256 über den **rohen** Anfragerumpf, hexadezimal, mit
dem Präfix `sha256=`. Also genau der Bytes-Strom, den ihr sendet — nicht das
neu serialisierte Objekt, sonst stimmt die Signatur nicht.

---

## 2 · Ereignisse

Drei Typen, mehr brauchen wir nicht:

| `event_type` | wann |
|---|---|
| `patient.created` | ein neuer Patient ist im Kalender entstanden |
| `appointment.created` | ein Termin wurde gebucht |
| `appointment.updated` | ein Termin wurde verlegt |
| `appointment.cancelled` | ein Termin wurde abgesagt |

`patient.created` muss **vor** dem ersten Termin dieses Patienten kommen: Der
Termin trägt nur eure Patienten-ID, nicht Name und E-Mail. Ohne das
vorangegangene Ereignis können wir einen neuen Bucher niemandem zuordnen.

### 2.1 Patient

```json
{
  "event_type": "patient.created",
  "payload": {
    "booking_patient_id": "12345",
    "vorname": "Anna",
    "nachname": "Beispiel",
    "geburtsdatum": "1985-03-12",
    "geschlecht": "weiblich",
    "email": "anna@example.com",
    "telefon": "+49 170 1234567"
  }
}
```

`geschlecht`: `maennlich` | `weiblich` | `divers` | `unbekannt`.
`booking_patient_id` ist eure ID — sie ist der Schlüssel, über den wir
Termine und Patienten zusammenbringen. Sie muss stabil bleiben.

**Leere Felder sind erlaubt (seit 16.10.2026).** Bei Praxis-OS-Buchungen
fragt der Kalender den Nachnamen nicht mehr ab und sendet `"nachname": ""`.
Das nehmen wir an: Ein leerer Text heißt „keine Angabe“, nicht „Fehler“.
Dasselbe gilt für `vorname`, `telefon`, `geburtsdatum` und `geschlecht` —
leer, `null` oder ganz weggelassen ist gleichwertig. In der Akte steht
dafür `Unbekannt`, bis der Name im Kennenlernen nachgetragen wird; in
Mails an den Patienten erscheint der Platzhalter nie.

**Pflicht bleiben nur zwei Angaben:** eine Patienten-ID (`id` oder
`booking_patient_id`) und eine gültige `email`. Fehlt eine davon, können
wir die Buchung niemandem zuordnen und weisen sie ab (sichtbar im
Ereignisprotokoll).

### 2.2 Termin

```json
{
  "event_type": "appointment.created",
  "payload": {
    "id": "a-98765",
    "patient_id": "12345",
    "scheduled_at": "2026-10-02T14:00:00+02:00",
    "duration_minutes": 30,
    "service_name": "Video-Sprechstunde (Praxis OS)",
    "therapist_name": "Max Glawe",
    "status": "scheduled",
    "referrer": {
      "source": "praxis-os",
      "medium": "website",
      "campaign": "programm-90-tage"
    }
  }
}
```

**Wichtig an drei Feldern:**

`scheduled_at` mit **Zeitzonen-Offset** (`+02:00`), nicht ohne. Ohne Offset
ist eine Uhrzeit nur die halbe Information, und im Oktober wird aus 14 Uhr
sonst 12 Uhr.

`service_name` — der Name der gebuchten Leistung. **Daran erkennen wir die
Videokonsultation.** Fehlt er, entsteht kein Videotermin; die Buchung selbst
kommt trotzdem an.

`referrer` — falls ihr die UTM-Parameter aus der Buchungs-URL mitführt. Rein
optional, hilft uns bei der Frage, welcher Weg Buchungen bringt.

`status`: `scheduled` | `cancelled` | `completed`.

---

## 3 · Antworten und Wiederholungen

* **200** — angenommen und verarbeitet.
* **401** — Signatur stimmt nicht.
* **429** — zu viele Ereignisse (Grenze: 100 pro Minute).
* **5xx** — bei uns ging etwas schief: **bitte wiederholen**, gern mit
  wachsendem Abstand (1 min, 5 min, 30 min).

**Doppelte Ereignisse sind unproblematisch.** Wir erkennen sie an `id`
beziehungsweise `booking_patient_id` und verarbeiten sie genau einmal.
Lieber einmal zu viel als einmal zu wenig.

---

## 4 · Prüfen, ob es läuft

Schickt ein `appointment.created` für einen Testpatienten. Die Praxis sieht
das Ereignis unmittelbar unter *Praxis OS → Admin → Integrationen* im
Ereignisprotokoll — mit Zeitstempel, Typ und Ergebnis. Steht dort nichts,
kam nichts an; steht dort ein Fehler, sagt er, welcher.

---

## 5 · Was auf unserer Seite passiert

| Ereignis | Praxis OS |
|---|---|
| `patient.created` | mit einem bestehenden Patienten verknüpfen; sonst nur vormerken |
| `appointment.created` | **Video-Sprechstunde:** Patient anlegen (falls neu), Videotermin anlegen, **eine** Einladung mit Zugangslink, .ics und Terminübersicht. **Andere Leistung:** Termin nur speichern, wenn die Person bereits Patient ist |
| `appointment.updated` | Termin aktualisieren; Videotermin mitverlegen, neue Einladung |
| `appointment.cancelled` | Termin absagen; Videozugang sofort schliessen |

Bei allen anderen Leistungen — Krankengymnastik, Manuelle Therapie und so
weiter — gilt:

* Ist die Person bereits Patient in Praxis OS, wird der Termin in ihrer Akte
  gespeichert. Sonst passiert **nichts**: kein Datensatz, kein Konto, keine
  Mail.

Das ist Absicht: Praxis OS ist die digitale Betreuung, nicht die Zweitkopie
des Praxiskalenders. Schickt trotzdem alle Ereignisse — wir entscheiden auf
unserer Seite, was daraus wird.

---

## 6 · Bitte im Buchungsformular ergänzen: Honorarhinweis

Das betrifft **nicht** den Webhook, sondern das Formular selbst — es ist die
einzige Stelle, an der wir nicht mitschreiben können.

Wer eine **Video-Konsultation** bucht, schliesst damit einen
Behandlungsvertrag mit einem Heilpraktiker. Vor dem Absenden sollte deshalb
ein Pflichthaken stehen, mit diesem Text:

> Die Konsultation kostet 69,00 € und wird nach dem Gebührenverzeichnis für
> Heilpraktiker abgerechnet; die angesetzten Sätze überschreiten dessen
> Rahmen nicht. Gesetzliche Krankenkassen erstatten Heilpraktiker-Leistungen
> nicht — bei privater Versicherung, Beihilfe oder Zusatzversicherung hängt
> es vom jeweiligen Tarif ab, eine Zusicherung kann nicht gegeben werden.
> Geschuldet ist die fachgerechte Behandlung, nicht ein bestimmter Erfolg.

Wenn ihr den Zeitpunkt des Hakens mitschickt, nehmen wir ihn entgegen:

```json
"honorar_consent_at": "2026-10-01T09:12:44Z"
```

Das Feld ist **optional** — ohne dieses Feld ändert sich nichts, der Termin
entsteht wie bisher.

Solange der Haken fehlt, steht derselbe Hinweis in unserer Einladungsmail.
Die geht direkt nach der Buchung raus und damit vor dem Termin, also bevor
eine Leistung erbracht ist. Das trägt; der Haken im Formular wäre trotzdem
der sauberere Ort, weil er vor dem Vertragsschluss liegt und nicht danach.

---

## 7 · Bitte mitschicken: woher die Buchung kam

Seit dem 09.10.2026 hängen unsere Buchungslinks die Kampagnenparameter an,
mit denen ein Besucher bei uns ankam. Ein Link sieht dann so aus:

```
https://physiotherapie-glawe.de/termin-buchen.html
  ?service=video-sprechstunde-praxis-os
  &utm_source=meta&utm_medium=paid&utm_campaign=…&utm_content=…&utm_term=…
  &cta=sabine-hero
  &fbclid=…
```

**Was wir brauchen:** diese Werte im `appointment.created`-Ereignis zurück.

```json
"payload": {
  "id": "…", "patient_id": "…", "scheduled_at": "…",
  "referrer": {
    "source":   "meta",      // utm_source
    "medium":   "paid",      // utm_medium
    "campaign": "herbst-26", // utm_campaign
    "content":  "trailer-a", // utm_content
    "term":     "rückenschmerzen", // utm_term, nur bei Suchanzeigen
    "cta":      "sabine-hero"      // Parameter `cta` (seit 11.10.2026)
  }
}
```

**Alle sechs Felder sind optional.** Fehlt `referrer` ganz, ändert sich nichts —
der Termin entsteht wie bisher. Wir nehmen entgegen, was kommt.

Technisch heisst das: Die Parameter müssen beim Aufruf der Buchungsseite
gespeichert (Sitzung genügt) und beim Absenden der Buchung an den Termin
gehängt werden. `cta` verhält sich dabei genau wie die utm_*-Werte — nur
dass er nicht `utm_` heisst.

**Zu `cta` (neu seit 11.10.2026):** `utm_content` trägt die ANZEIGE,
`cta` den geklickten KNOPF. Vorher stand beides in `utm_content`, und bei
Besuchern aus einer Anzeige gewann die Anzeige — der Knopf war genau dann
nicht mehr erkennbar, wenn die Buchung am meisten gekostet hat. Mögliche
Werte sind sprechend, etwa `sabine-hero`, `sabine-leiste`,
`erstattung-abschluss`, `hero`, `kopfzeile`.

**Warum es sich lohnt:** Ohne diese Felder lässt sich nicht sagen, welche
Anzeige eine Buchung gebracht hat. Die Buchung wird auf eurer Seite
abgeschlossen; was dort nicht mitgeschrieben wird, ist danach nicht mehr
rekonstruierbar. Geprüft am 09.10.2026: In allen bisherigen Ereignissen fehlt
`referrer` vollständig, in Praxis OS steht das Feld auf NULL.

---

## 8 · Buchungsseite: Aufruf mit `?service=video-sprechstunde-praxis-os`

Betrifft `physiotherapie-glawe.de/termin-buchen.html`, also **eure Seite** —
nicht Praxis OS. Drei Punkte, Stand 13.10.2026.

### 8.1 Schritt „Extras dazubuchen" ausblenden

Wird die Seite mit `?service=video-sprechstunde-praxis-os` aufgerufen, kommt
der Besucher aus einer bezahlten Anzeige und hat genau eine Absicht: die
Konsultation buchen. Ein Zwischenschritt mit Zusatzleistungen ist dort eine
Abzweigung, die niemand wollte — und jede Abzweigung kostet Buchungen.

Bitte den Schritt für diesen einen Service **vollständig überspringen**, nicht
nur leer anzeigen. Ein leerer Schritt, den man „weiter" klicken muss, ist
derselbe Verlust in langsamer.

### 8.2 Direkt zum Kalender scrollen

Nach dem Laden soll der Buchungskalender im Bild stehen, ohne dass jemand
suchen muss. Üblicherweise genügt eine ID am Kalender-Container und ein
Sprung dorthin, sobald die Seite steht:

```html
<div id="kalender"> … </div>
```
```js
// erst wenn der Kalender wirklich gerendert ist, sonst springt es ins Leere
document.getElementById('kalender')
  ?.scrollIntoView({ behavior: 'smooth', block: 'start' })
```

Nur bei diesem Service — wer regulär bucht, soll die Seite von oben sehen.

### 8.3 ALLE Parameter müssen den Weg überleben

`utm_source`, `utm_medium`, `utm_campaign`, `utm_content`, `utm_term`, `cta`
und `service` dürfen durch nichts verloren gehen: nicht durch eine
Weiterleitung, nicht durch einen Schrittwechsel, nicht durch das Scrollen.

**Warum das konkret dringend ist:** Am 13.10.2026 sind von 92 Sitzungen auf
`/start/erstattung` nur 14 mit `utm_content=erstattung` angekommen. 61 trugen
überhaupt keine Parameter, 52 davon zusätzlich keinen Referrer. Wo genau sie
verloren gehen, messen wir seit heute mit (wir speichern die vollständige
Landing-Adresse). Falls die Spur auf eurer Seite endet, sind die üblichen
Verdächtigen:

- Weiterleitung `www` ↔ ohne `www` oder `http` → `https`, die den
  Query-String abschneidet
- abschliessender Schrägstrich, der eine neue Weiterleitung auslöst
- ein Schrittwechsel, der die Adresse ohne Query neu setzt
  (`location.href = 'termin-buchen.html'` statt `location.search` zu erhalten)

Ein `scrollIntoView` darf die Adresse nicht anfassen — kein
`history.replaceState` ohne `location.search`.

### Prüfung in 30 Sekunden

1. `https://physiotherapie-glawe.de/termin-buchen.html?service=video-sprechstunde-praxis-os&utm_source=meta&utm_medium=paid&utm_campaign=test&utm_content=trailer&utm_term=x&cta=sabine-hero` öffnen
2. Steht der Kalender sofort im Bild? Fehlt der Extras-Schritt?
3. In der Adresszeile nachsehen: Sind nach dem letzten Schritt noch alle
   sieben Parameter da?
