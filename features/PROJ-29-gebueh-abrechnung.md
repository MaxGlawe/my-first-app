# PROJ-29 — Automatische GebüH-Abrechnung des Programms

> **Die Rechnung schreibt sich aus dem, was wirklich stattgefunden hat.**

**Status:** In Review — vollständig gebaut am 27.09.2026. Erste echte Monatsrechnung fällt am 22.10.2026 an.
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

## 4 · Honorarvereinbarung (gebaut 27.09.2026)

**Anlage 1 zum Behandlungsvertrag**, nicht ein neuer Paragraf: Ein
eingeschobener § hätte jede folgende Nummer verschoben und die Querverweise
im Vertragstext („vgl. §7 Abs. 2") falsch gemacht. Erzeugt in
`contract-templates.ts`, gerendert in Angebotsseite, Unterschriftsansicht und
PDF.

Sieben Abschnitte: Gegenstand · Honorar · Abrechnung nach GebüH (die fünf
Ziffern mit ihren Sätzen, Analogziffern erklärt) · Höhe der Sätze ·
Rechnungsstellung · Erstattung · kein geschuldeter Erfolg.

Bei Abschnitt 4 steht beides: dass ein Honorar oberhalb der GebüH-Rahmensätze
frei vereinbart werden *dürfte*, und dass es hier nicht geschieht. Ein blosser
Warnhinweis auf eine Überschreitung, die nachweislich nicht stattfindet, wäre
die schlechtere Auskunft.

### Zwei Haken, nicht einer

Im Checkout sind es **zwei getrennte Erklärungen**, beide Pflicht, beide
serverseitig erzwungen (`z.literal(true)`, kein `.optional()`):

| Haken | Erklärung | Feld |
|---|---|---|
| Honorarvereinbarung | „Ich kenne Honorar und Abrechnung." | `honorar_consent` + `honorar_consent_at` |
| Widerrufsverzicht (§ 356 Abs. 4 BGB) | „Fang sofort an." | `signer_consent` + `signer_consent_at` |

Wer nur eine von beiden bestätigt, hat nicht beide bestätigt — ein
gemeinsamer Haken hätte genau das verwischt. `signer_consent_at` ist neu:
Bisher lag der Zeitpunkt des Widerrufsverzichts ausschliesslich in den
Stripe-Metadaten, also ausserhalb unserer Akte. `signed_at` ist er nicht, das
ist der Zahlungseingang aus dem Webhook.

Die vier tragenden Sätze stehen **sichtbar auf der Seite**, nicht nur im
aufklappbaren Vertrag. Wer zustimmt, soll wissen wozu, ohne zu klicken.

### Altangebote

Angebote von vor dem 27.09.2026 haben die Anlage nicht im gespeicherten
Vertragstext — der wird nie nachträglich verändert, sonst wäre nicht mehr
nachweisbar, was jemand gelesen hat. Für sie entfällt der Verweis auf
„Anlage 1" und der Knopf dorthin; die Zusammenfassung steht für sich und
bleibt Pflicht.

### Konsultation allein (69 €)

Gebucht wird im Kalender auf physiotherapie-glawe.de — **dort können wir
keinen Haken setzen.** Die Kurzfassung (Honorar, GebüH, Erstattung, kein
Erfolg) steht deshalb in der Einladungsmail, die direkt nach der Buchung
rausgeht und den Patienten vor dem Termin erreicht, also bevor eine Leistung
erbracht ist.

Der Haken im Buchungsformular wäre der sauberere Ort, weil er vor dem
Vertragsschluss liegt statt danach. Er ist in
`docs/webhook-briefing-buchungskalender.md` § 6 angefragt, samt optionalem
Feld `honorar_consent_at` im Termin-Ereignis. **Offen auf fremder Seite.**

---

## 5 · Entschieden (27.09.2026)

1. **Entwurf, dann Freigabe.** Der Lauf legt an und benachrichtigt; versendet
   wird nach kurzer Prüfung durch den Behandler.
2. **Erinnerungen in Woche 6 und 12** an Verlaufs- und Abschlussbericht, mit
   dem Hinweis, was ohne Bericht aus den 20,50 € wird.
3. **Keine Rechnung ohne Diagnose.** Der Lauf überspringt und meldet. Damit
   sie nicht im Nachhinein rekonstruiert werden muss, wird sie im Gespräch
   erfasst — Feld in der Schublade, zusammen mit dem Haken für A20.1.

4. **Der Lauf schreibt ins OS, nicht ins Postfach** (Nachtrag 27.09.2026).
   Eine Mail ist eine Benachrichtigung, keine Aufgabe: sie kennt kein
   „erledigt" und sie sammelt sich. Bei zwanzig Patienten im Programm wären
   das allein aus Entwürfen und Berichtserinnerungen sechzig Mails im Quartal.

   Stattdessen `os_aufgaben` (Migration `20260927000003`) und eine Karte auf
   dem Therapeuten-Dashboard: Titel, ein Satz Kontext, **Öffnen** dorthin, wo
   man sie erledigt, und ein Haken. Sind alle abgehakt, verschwindet die Karte
   — wie der Ampel-Banner. Erreichbar von jedem Endgerät, weil es im OS liegt
   und nicht in einem Postfach.

   | Aufgabe | entsteht bei | Öffnen führt nach | doppelt verhindert durch |
   |---|---|---|---|
   | Rechnung freigeben | jedem Entwurf | `/os/admin/billing/{id}` | `ref_id` = Rechnung |
   | Verlaufs-/Abschlussbericht | Woche 6 / 12 | `/os/patients/{id}/arztbericht/new` | Zeitstempel am Vertrag |
   | Diagnose fehlt | übersprungenem Vertrag | Patientenakte | `ref_id` = Vertrag |

   Die Berichtserinnerungen tragen **bewusst keine `ref_id`**: Woche 6 und
   Woche 12 haben denselben Typ, und der eindeutige Index liegt auf
   `(typ, ref_id)` — die zweite Erinnerung würde verschluckt. Dort schützt der
   Zeitstempel `bericht_erinnerung_woche{6,12}_at` am Vertrag.

   Der Hinweis „Diagnose fehlt" ist neu und schließt eine stille Lücke: Vorher
   übersprang der Lauf jeden Morgen wortlos ins Log. Kein Ausfall im System
   darf nur im Log stehen.

## 5a · Geprüft (27.09.2026)

Sieben Läufe gegen die Rechenlogik, alle ergeben exakt den Programmpreis:

| Szenario | M1 | M2 | M3 | Summe |
|---|---|---|---|---|
| Begleitet, wie geplant | 149,33 | 74,83 | 74,84 | **299,00** |
| Intensiv, wie geplant | 257,33 | 120,83 | 120,84 | **499,00** |
| Intensiv, zwei Sitzungen fielen aus | 195,33 | 120,83 | 182,84 | **499,00** |
| Begleitet, keine Berichte | 149,33 | 54,33 | 95,34 | **299,00** |
| Konsultation ohne Haken | 118,33 | 74,83 | 105,84 | **299,00** |
| Begleitet + Extra-Sitzung | 180,33 | 72,17 | 46,50 | **299,00** |
| Nur die Konsultation | 97,33 | 28,33 | 173,34 | **299,00** |

Die letzte Zeile zeigt das Prinzip am deutlichsten: Je weniger stattfindet,
desto grösser wird die Programmpauschale — und desto kürzer die Liste der
Einzelleistungen. Keine Zeile behauptet etwas, das nicht im System steht.

Die vorletzte kostete eine zweite Runde: Eine Extra-Sitzung liess die Summe
um 2,66 € über den Programmpreis steigen, weil die digitale Betreuung in den
ersten beiden Monaten stur ihr Drittel nahm. Sie rechnet jetzt gegen das, was
planmässig noch aussteht, und schrumpft sofort.

---

## 5b · Ein Beleg zählt, drei weisen nach (27.09.2026)

Nachgefragt: „Ich will eine Bezahlrechnung, die der Klient bezahlt hat, und
dann drei Teilrechnungen für das, was bisher passiert ist."

Beides wird gebraucht — aber nur **eines** darf Umsatz sein. Trügen beide
Sätze echte Rechnungsnummern, stünden für ein 299-€-Programm 598 € in den
Büchern.

| | Bezahlrechnung | Leistungsnachweis (3×) |
|---|---|---|
| Nummer | `2026-0042` | `N-2026-0001` (eigene Folge) |
| Betrag | 299 € (voller Preis) | Summe der drei = 299 € |
| Umsatz | **ja** | **nie** |
| Entsteht | mit dem Zahlungseingang | Tag 30 / 60 / 90 |
| Status | `bezahlt` | `entwurf`, Freigabe durch den Behandler |
| Zweck | Buchhaltung | Einreichung bei der Versicherung |

Die Bezahlrechnung trägt den **vollen** Programmpreis, nicht nur was Stripe
eingezogen hat: Die Konsultation ist Teil des Honorars, sie wurde nur früher
bezahlt. (Nebenbei behoben: Bisher stand im Kopf 230 € und in den Zeilen
299 €.) Sie entsteht nicht mehr als Entwurf — das Geld ist da, der Inhalt
steht im Vertrag; ein Entwurf, der nie freigegeben wird, ist ein Umsatz, der
nie in den Büchern steht.

### Drei Stellen, an denen Nachweise nicht mitzählen dürfen

`invoices.beleg_art` trennt beides. Ausgeschlossen werden Nachweise in
`/api/admin/billing/summary` (Kennzahlen), `/api/admin/buchhaltung`
(Auswertung) und beim `bereitsBerechnet` des Rechnungslaufs — dort hätte die
Bezahlrechnung sonst jeden Nachweis auf null gerechnet.

### Das Dokument

Drei Fehler, die beim Nachsehen auffielen und alle das Papier betrafen:

1. **Vier Rechnungen statt drei.** `createProgrammInvoiceDraft` aus PROJ-26
   legte bei jeder Zahlung zusätzlich einen Entwurf über den vollen Betrag an,
   ohne `programm_contract_id` — der Rechnungslauf sah ihn nicht.
2. **Die Vermerke standen nur in der Datenbank.** `invoices.notes` wurde im
   PDF nirgends gedruckt.
3. **Das PDF forderte zum Zahlen auf.** Bankdaten, „Zahlbar bis" und ein
   EPC-QR-Code, unbedingt auf jedem Beleg — auf einer vorausbezahlten
   Monatsrechnung eine scanfertige Aufforderung, zweimal zu zahlen.

Behoben: Der Zahlungsteil entfällt, sobald ein Beleg als beglichen gilt
(`beleg_art = leistungsnachweis` **oder** `status = bezahlt`), und wird durch
einen hervorgehobenen Kasten ersetzt. „Fällig bis" verschwindet aus dem Kopf,
der Titel lautet LEISTUNGSNACHWEIS, die Nummer heißt „Nachweis-Nr.".

Beide Belege wurden als PDF gerendert und gelesen, nicht nur kompiliert.
Dabei fiel noch ein vierter Fehler auf: Der Zebrastreifen der Positionstabelle
war immer 7 mm hoch, unabhängig davon, wie oft die Beschreibung umbrach — auf
einem Leistungsnachweis ist eine dreizeilige Beschreibung der Normalfall, nicht
die Ausnahme. Die Zeilenhöhe rechnet jetzt mit.

---

## 5c · Was ein Muster zutage förderte (01.–05.10.2026)

Auf Bitte hin vier Musterbelege per Mail verschickt. Ein Muster entlang eines
echten Zeitablaufs zu bauen, deckte drei Fehler auf, die keine Rechnung und
kein Typecheck gefunden hätte.

**1. Die Konsultation fiel aus der Abrechnung — stillschweigend.**
Das Monatsfenster begann bei `paid_at`. Die Konsultation liegt aber **immer
davor**: Sie ist der Anlass für das Angebot. Damit rutschten Ziffer 1, A20.1
und Ziffer 5 (zusammen 69 €) durch den Filter und erschienen auf keinem
Nachweis. Die Summe blieb richtig, weil der Ausgleichsposten sie schluckte —
die Leistung war nur nicht mehr benannt. Also genau das, was ein Patient bei
seiner Versicherung einreichen will.

Die sieben Szenarien aus Abschnitt 5a haben das nicht gefangen, weil sie
`ereignisse` direkt füttern und das Zeitfenster nie durchlaufen. **Monat 1
beginnt jetzt beim Behandlungsfall, nicht beim Geldeingang.** Und die
Konsultation ist die letzte vor dem Vertrag, nicht die erste überhaupt — ein
Patient, der nach einem Jahr wiederkommt, hat zwei.

**2. Ein Cent, den niemand findet.**
85,00 € digitale Betreuung lassen sich nicht durch drei teilen. Zuerst stand
der Rest als eigene Zeile „Programmpauschale gemäß Honorarvereinbarung —
0,01 €" da; das sah nach einem Fehler aus und wurde in die digitale Betreuung
gefaltet. Damit war es schlimmer: Monat 1 und 2 zeigten 28,33 €, Monat 3
zeigte 28,34 € — ohne ein Wort dazu. Wer 3 × 28,33 rechnet, kommt auf 84,99
und landet bei **298,99 €**. Genau das ist passiert, und zwar dem, der die
Belege angefordert hat.

Jetzt benennt der letzte Abschnitt den Cent („einschließlich Rundungsausgleich
von 0,01 €"), und **jeder** Nachweis sagt unter der Tabelle, wozu er gehört:
„Bereits beglichen durch Rechnung 2026-0042 vom 27.09.2026 über 299,00 €.
Dieser Nachweis ist einer von drei Abschnitten, die zusammen 299,00 € ergeben."

Die Lehre ist nicht die Rundung, sondern: **Ein richtiges Ergebnis, dessen
Zustandekommen der Leser nicht nachvollziehen kann, ist auf einem Beleg kein
richtiges Ergebnis.**

**3. „Diese Rechnung ist nach dem GebüH erstellt" auf einem Leistungsnachweis.**

### Offen in den Praxis-Stammdaten

Die Muster zeigen im Fuß: **Steuernummer und Zulassungsnummer sind leer**, und
als Kontakt steht `physiotherapieglawe@gmx.de` statt
`info@physiotherapie-glawe.de`. Die Steuernummer gehört auf eine Rechnung, die
Zulassungsnummer trägt die GebüH-Abrechnung gegenüber einer Versicherung.
Einzutragen unter `/os/admin/billing/settings`.

---

## 6 · Was ausdrücklich nicht gebaut wird

Keine Erstattungsprognose, keine Einreichung bei Versicherungen, keine
Mahnläufe. Und keine Position, für die es kein Ereignis gibt.
