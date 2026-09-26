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

`patient.created` ist optional: Kommt ein Termin für einen uns unbekannten
Patienten, legen wir ihn aus den Termindaten an — vorausgesetzt, ihr schickt
`patient.created` **vorher** oder der Patient existiert bereits.

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
| `patient.created` | Patient anlegen oder mit bestehendem verknüpfen; passwortloser Zugang zur Termin-Ansicht |
| `appointment.created` | Termin speichern; **bei der Video-Sprechstunde zusätzlich:** Videotermin anlegen + Einladung mit Zugangslink und .ics verschicken |
| `appointment.updated` | Termin aktualisieren; Videotermin mitverlegen, neue Einladung |
| `appointment.cancelled` | Termin absagen; Videozugang sofort schliessen |

Bei allen anderen Leistungen — Krankengymnastik, Manuelle Therapie und so
weiter — passiert **nichts** ausser dem Speichern des Termins. Das ist
Absicht.
