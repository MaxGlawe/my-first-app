# PROJ-29 — Automatische GebüH-Abrechnung des Programms

> **Die Rechnung schreibt sich aus dem, was wirklich stattgefunden hat.**

**Status:** Planned
**Stand:** 27.09.2026
**Baut auf:** PROJ-26 (Programm, Varianten, Angebot), PROJ-27/28 (Videotermine als belegte Ereignisse), bestehendes Rechnungswesen (`invoices`, `invoice_line_items`, `gebueh_catalog`, `lib/pdf/invoice-pdf.ts`)

---

## 1 · Ausgangslage

Was es **schon gibt** — und das ist mehr, als es scheint:

| Baustein | Stand |
|---|---|
| `invoices` | Patient, Nummer, Rechnungs-/Behandlungsdatum, Diagnosetext, Praxisdaten, Status, Summe |
| `invoice_line_items` | **`gebueh_ziffer`**, Beschreibung, Anzahl, Einzel- und Gesamtpreis |
| `gebueh_catalog` | 118 Ziffern mit `preis_min` / `preis_default` / `preis_max` |
| PDF | `lib/pdf/invoice-pdf.ts`, inklusive EPC-QR fürs Überweisen |
| Oberfläche | Anlegen und Ansehen unter `/os/admin/billing` |

Was **fehlt**: dass all das von selbst passiert.

**Die Sätze aus dem Briefing sind geprüft** (27.09.2026) und entsprechen exakt
dem `preis_max` des Katalogs:

| Ziffer | Briefing | Katalog max | |
|---|---|---|---|
| 1 | 20,50 € | 20,50 € | ✓ |
| 5 | 17,50 € | 20,50 € | ✓ im Rahmen |
| 11.2 | 20,50 € | 20,50 € | ✓ |
| 11.3 | 26,00 € | 26,00 € | ✓ |
| 20.1 | 31,00 € | 31,00 € | ✓ |

Keine Position liegt über dem Höchstsatz. Die Honorarvereinbarung muss das
zwar trotzdem erwähnen (Ziffer 3), aber der Satz beschreibt einen Fall, der
hier gar nicht eintritt.

---

## 2 · Die tragende Regel

**Abgerechnet wird nur, was im System belegt ist.** Keine Position ohne
Ereignis, das sie trägt — und jedes Ereignis liefert das Datum, das auf die
Rechnung gehört.

| Position | Beleg im System | Datum aus |
|---|---|---|
| Ziffer 1, A20.1, 5 (Konsultation) | `video_calls` mit `anlass='konsultation'` und gesetztem `begonnen_at` | `begonnen_at` |
| A20.1 je Video-Sitzung | jedes weitere `video_calls` mit `begonnen_at` | `begonnen_at` |
| A11.3 Planerstellung | erste `patient_assignments` des Programms | `created_at` |
| A11.3 Planüberarbeitung | jede weitere Zuweisung im Zeitraum | `created_at` |
| 11.2 Verlaufs-/Abschlussbericht | Eintrag in `medical_reports` | dessen Datum |
| Digitale Betreuung | der Programmzeitraum selbst | Monatsabschnitt |

**A20.1 bei der Konsultation nur, wenn tatsächlich eine Übung angeleitet
wurde** — das verlangt das Briefing ausdrücklich und es ist der Punkt, an dem
eine Prüfung ansetzen würde. Vorschlag: ein Haken im Sprechzimmer („Übung
angeleitet"), der die Notiz ergänzt. Ohne Haken keine Position; die 31 €
wandern in die Pauschale.

---

## 3 · Die drei Monatsrechnungen

Ausgelöst vom bestehenden Tages-Cron, gerechnet ab `paid_at` des Vertrags:

* **Monat 1** (bei Programmstart): Konsultation, Planerstellung,
  Planüberarbeitung Woche 3, Sitzungen der Wochen 1–4, ein Drittel der
  digitalen Betreuung
* **Monat 2** (Tag 30): Planüberarbeitung Woche 6, Verlaufsbericht,
  Sitzungen der Wochen 5–8, ein Drittel
* **Monat 3** (Tag 60): Planüberarbeitung Woche 9, Abschlussbericht,
  Sitzungen der Wochen 9–12, der Rest

Jede Rechnung trägt: Name und Anschrift des Patienten, die vollständige
Diagnose, jede Leistung mit Ziffer, Einzelbetrag und Datum, eigene
Rechnungsnummer, den Vermerk **„Behandlungsfall seit [Datum der
Konsultation]"** und **„Bereits durch Vorauszahlung vom [Datum] beglichen"**.

### Die Summe muss stimmen

Die Position „Digitale Betreuung" ist der **Ausgleichsposten**: Sie nimmt auf,
was zwischen den erbrachten Einzelleistungen und dem Programmpreis bleibt.
Fällt eine Sitzung aus, wächst sie; kommt ein Extra-Termin bei Rückschlag
dazu, schrumpft sie um 31 €.

Reicht sie nicht mehr aus — weil so wenig stattfand, dass die Einzelleistungen
den Preis nicht füllen —, erscheint der Rest als eigene Position
**„Programmpauschale gemäß Honorarvereinbarung"**. Das ist die ehrliche
Darstellung: bezahlt wurde ein Programm, erbracht wurde weniger, und die
Differenz hat einen Namen statt einer erfundenen Leistung.

Über alle drei Rechnungen ergibt die Summe **exakt** den Programmpreis.

---

## 4 · Honorarvereinbarung im Checkout

Pflichtbestätigung vor der Zahlung, mit Zeitstempel. Der Vertrag hat die
Felder bereits: `signer_consent`, `signed_at`, `signer_ip`,
`signer_user_agent`, `widerruf_bis`.

Inhalt nach Briefing: Leistung, Honorar, Hinweis auf mögliche Überschreitung
der GebüH-Sätze, Erstattung nicht garantiert (gesetzliche Kassen zahlen
nicht), kein geschuldeter Behandlungserfolg, monatliche Rechnungen,
Widerrufsbelehrung mit ausdrücklichem Verlangen des vorzeitigen
Leistungsbeginns und Kenntnisnahme des Wertersatzes.

Für die **Konsultation allein** die Kurzfassung mit den Punkten 2, 3, 4 und 5
— bestätigt bei der Buchung.

---

## 5 · Zu entscheiden

1. **Versand automatisch oder nach Freigabe?** „Völlig automatisiert" hiesse:
   Rechnung entsteht und geht raus. Eine Rechnung ist aber ein Dokument, das
   man nicht zurückholen kann. Vorschlag: automatisch als **Entwurf**, eine
   Benachrichtigung an den Behandler, Versand mit einem Klick — oder nach
   sieben Tagen ohne Widerspruch von selbst.
2. **Verlaufs- und Abschlussbericht** existieren im System nur, wenn sie
   geschrieben werden (`medical_reports`). Werden sie es nicht, dürfen die
   41 € nicht als 11.2 erscheinen. Soll der Cron in Woche 6 und 12 daran
   erinnern?
3. **Diagnose fehlt** → nach Pflichtangaben darf die Rechnung nicht entstehen.
   Abbrechen und melden, oder Entwurf ohne Diagnose anlegen und blockieren?

---

## 6 · Was ausdrücklich nicht gebaut wird

Keine Erstattungsprognose, keine Einreichung bei Versicherungen, keine
Mahnläufe. Und keine Position, für die es kein Ereignis gibt.
