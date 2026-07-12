# PROJ-25 — Masterclass + 3 Monate Begleitung

> **Ablösung des Video-Analyse-Angebots (69 €) durch die Masterclass (399 € inkl. 3 Monate Begleitung)**

**Status:** Fertig gebaut, alles getestet — **nicht deployt, nichts versendet**
**Stand:** 12.07.2026
**Ersetzt:** Video-Analyse-Tripwire aus PROJ-23

---

## 1 · Warum das gebaut wurde

Auswertung der ersten Meta-Kampagne (521 Leads, 03.–23.06.2026):

| Stufe | Zahl | |
|---|---|---|
| Leads aus Meta | 521 | |
| Double-Opt-in bestätigt | 311 | **59,7 %** — beweist: die Mails kommen an |
| Check gestartet | 295 | |
| Check abgeschlossen | 178 | **117 Red-Flag-Stopps (39,7 %!)** |
| Klick auf den Buchungs-CTA | **6 Personen** | 3,4 % der Abschließer |
| Buchungen | **0** | |

**Die Mails waren nie das Problem.** 59,7 % DOI-Klickrate ist der Beweis; SPF, DKIM und DMARC sind alle korrekt gesetzt. Das **Angebot** zündete nicht — von 521 bezahlten Leads haben ganze 6 Menschen jemals den Buchungskalender gesehen.

Zwei weitere Funde bei der Analyse, beide behoben:
- **100 doppelte D1-Mails** am 10.07. (Dedup-Abfrage schlug fehl, Fehler wurde verschluckt)
- **Der Stripe-Webhook hatte keinerlei Idempotenz** — kein Event-ID-Check, gar nichts

---

## 2 · Das neue Angebot

**Masterclass „Chronischer Kreuzschmerz"** — 399 € einmalig (Anker 499 €), Klarna 3 × 133 €.

27 vertonte Lektionen, 270-Seiten-Workbook, Kartendeck — **und 3 Monate persönliche Begleitung per App** (Chat mit Max, individuelles Übungsprogramm, Verlaufskontrolle).

**Grundsatz:** Die Begleitung ist der **Hauptbestandteil**, nicht ein Bonus. Sie wird nirgends als „gratis dazu" geframt. Sie endet nach 92 Tagen **automatisch** — kein Auto-Abo, keine stille Verlängerung (§ 312 BGB).

---

## 3 · Was gebaut wurde

### 3.1 Datenbank — 3 Migrationen, alle eingespielt ✅

| Migration | Inhalt |
|---|---|
| `20260712000001_schmerzcheck_email_claims` | Anspruchs-Register gegen Doppelversand (1 Zeile pro Lead+Mail, atomar) |
| `20260712000002_masterclass_begleitung` | `stripe_webhook_events` (Idempotenz), `app_access_grants` (92-Tage-Zugang), `products.app_zugang_tage`, Lead-Attribution |
| `20260712000003_schmerzcheck_segments` | `medical_cleared_at` — die „war beim Arzt"-Bestätigung |

### 3.2 Kauf → Freischaltung

- **Zwei unabhängige Idempotenz-Sperren:** Event-ID-Register + `UNIQUE` auf der Stripe-Session im Grant. Ein Webhook-Retry kann nie zweimal 92 Tage schenken.
- Käufer wird zum **Patienten** (Therapeut: Max), bekommt den 92-Tage-Grant, der Schmerzcheck-Lead wird attribuiert, Max bekommt eine Mail („Neuer Begleitungs-Patient, Betreuung bis X").
- **Stapelnd:** Doppelkauf → 184 Tage, nicht zweimal 92 parallel.
- **Refund** → Grant widerrufen, `converted_at` zurückgesetzt.
- **Staff-Testkauf** → kein 500 (sonst würde Stripe endlos retryen).
- **Meta Purchase-Event** (CAPI, serverseitig) beim ersten Grant.

### 3.3 Nach Tag 92

Chat schließt (**Verlauf bleibt lesbar**), Übungsprogramm bleibt sichtbar, **Kurszugang bleibt lebenslang**. Keine Abbuchung, kein Abo.

### 3.4 Admin

Badge „Begleitung bis TT.MM.JJJJ" in der Patientenliste + Filter „Aktive Begleitungen".

### 3.5 Red-Flag-Screening entschärft

Das Screening warf **39,7 % aller Check-Starter** raus. Zwei Kriterien hatten zu wenig Trennschärfe:

| Kriterium | Vorher | Jetzt |
|---|---|---|
| „Beschwerden wecken dich jede Nacht" | harter Stopp — **50 Leads, bei 45 der einzige Grund** | **kein Stopp.** Stoppt weiterhin **in Kombination** mit Gewichtsverlust, Fieber oder Krebsanamnese |
| „Taubheit **oder Kribbeln** im Sattelbereich" | harter Stopp (33 Leads) | aufgeteilt: **Taubheit/Gefühllosigkeit** („wie beim Zahnarzt betäubt") stoppt hart · **nur Kribbeln** stoppt nicht |

Der klinische Hinweis **verschwindet nicht, er wandert**: Beide Angaben werden weiter erfasst und stehen jetzt im Report — inklusive der klaren Grenze, ab wann es doch sofort in die Notaufnahme gehört.

**Wirkung:** 117 → **72 Stopps** (24,4 % statt 39,7 %). 45 Leads pro 521 kommen zurück in den Funnel.
**Bestandsleads:** Die 45 damals Gestoppten bleiben unangetastet (deine Entscheidung). Sie stehen weiter in Segment B.

### 3.5b Regions-Routing (PROJ-25b) — der teuerste Fund

**Die Masterclass ist ein LWS-Kurs** („Chronischer Kreuzschmerz" — Lektionen zur Anatomie der LWS, Rumpftraining). Die Region-Frage im Check war aber eine **Einfachauswahl mit der Option „Mehrere Bereiche gleichzeitig"** — und **47 % aller Teilnehmer haben genau die geklickt** und damit ihre eigene Detailangabe überschrieben.

**Ergebnis:** Von 157 anmailbaren Leads in Segment A haben **9** explizit „Unterer Rücken" angegeben. Das sind **1,7 % des Werbebudgets.** Nacken ist mit 51 die viermal größere Gruppe.

| Wer | Anzahl | Bekommt |
|---|---|---|
| **Region unbekannt** („Mehrere Bereiche"/„Anderer") | **69** | **RT1** — Routing-Frage, **KEIN Angebot** |
| **LWS** (unterer Rücken) | **9** | M1–M4 sofort |
| Nacken/Schulter (51), Oberer Rücken (22), Knie/Hüfte/Fuß (6) | **79** | **NICHTS** — geparkt für ein passendes Produkt |

**RT1/RT2** stellen eine Frage mit fünf Ein-Klick-Antworten. Kein Preis, kein Kauf-Link (maschinell geprüft). Wer „Unterer Rücken" klickt, wandert in die M-Sequenz — mit **eigener M1-Variante**, weil sein Report keinen klaren LWS-Befund zeigt und ein Rückbezug darauf gelogen wäre.

**Fail closed:** Bei unbekannter Region gibt es **kein Angebot**. `assertMailable()` wirft bei jeder M-Mail an einen Nicht-LWS-Lead — 57/57 Tests, jede Kombination durchgeprüft.

**Der Check kann das Problem nicht mehr erzeugen:** Die Option „Mehrere Bereiche" ist ersatzlos gestrichen. Region ist jetzt **Mehrfachauswahl**, dazu eine Schwerpunkt-Frage — die aber nur erscheint, wenn wirklich mehrere Bereiche gewählt wurden.

**Auch D3/D5 und W1 sind gesperrt** (reine Verkaufsmails), nicht nur die M-Sequenz. Und der Karten-Paywall im Report wäre für Nicht-LWS-Leute eine Sackgasse geworden — gesperrte Karten ohne Freischaltweg. Die bekommen sie jetzt geschenkt.

### 3.6 Mails — Kampagne an die 521 Bestandsleads

| Segment | Definition | Anzahl | Bekommt |
|---|---|---|---|
| **A** | DOI + Check abgeschlossen | 178 | M1–M4 (Tag 0 / 3 / 6 / 10) |
| **B** | DOI + Red-Flag-Stopp | 117 | B1–B2 — **KEIN Angebot** |
| **C** | DOI + Check offen | 16 | C1R (Reaktivierung) |
| **D** | **kein DOI** | 210 | **NICHTS** |

**Der Red-Flag-Türsteher:** B1/B2 verkaufen nichts. Sie fragen „Warst du beim Arzt?" mit zwei Ein-Klick-Antworten. Wer *„Ja, abgeklärt"* klickt → `medical_cleared_at` → wandert in Segment A → bekommt **ab dann erst** die M-Sequenz.

> Grund: Die Masterclass enthält Bewegungskarten und ein Übungsprogramm. Das jemandem mit ungeklärten Warnzeichen zu bewerben, ist genau das, was der Red-Flag-Stopp verhindern soll — egal wie man es formuliert.

### 3.7 Mails — Funnel für NEUE Leads (umgestellt)

T2, D1–D5 und W1 bewarben bis zuletzt die Video-Analyse für 69 €. **Alle jetzt auf die Masterclass umgestellt.** Ohne das wären neue Leads beim nächsten Anzeigen-Start ins alte, tote Angebot gelaufen.

Soft-Flag-Leads („ärztlich abklären") bekommen weiterhin **kein Angebot** — D3 und D5 werden für sie komplett übersprungen.

### 3.8 Tracking — erstmals lückenlos

**Mail → `/api/schmerzcheck/go` → Salespage → Stripe-Metadata → `conversion_source` am Lead.**
Damit ist sichtbar, welche Mail einen Kauf gebracht hat. Beim alten Buchungs-Widget war das nie möglich (`booked_at` bei **0 von 521** Leads).

Zusätzlich: **Scroll-Tiefe** (25/50/75/100 %) und **Kaufen-Klick** auf der Salespage. Damit unterscheidbar:

| Beobachtung | Bedeutung |
|---|---|
| frühe Absprünge (25 %) | die **Seite** überzeugt nicht |
| tief gescrollt, kein Klick | das **Angebot** überzeugt nicht |
| Button-Klick, kein Kauf | Hürde am **Checkout** → erst Klarna prominenter, **dann erst** Preis |

> Ohne diese Unterscheidung dreht man beim ersten Ausbleiben von Käufen reflexhaft am Preis — meistens die falsche Stellschraube.

### 3.9 Sicherheitsnetz im Kampagnen-Cron

- **Drosselung: 30 Mails pro Lauf.** Die 157 M1-Empfänger gehen über ~5 Tage raus — nebenbei gut für die Zustellbarkeit.
- **Sanity-Guard:** über 200 fällige Mails → **Abbruch + Alarm-Mail an dich**, kein Versand.
- **Fail closed:** jeder Query-Fehler bricht ab. Nie „leeres Ergebnis = noch nie gesendet".
- **Claim vor Versand:** ein Retry oder Doppellauf kann nichts doppelt senden.
- **`assertMailable()`** prüft unmittelbar vor **jedem** Versand nochmal das Segment und **wirft**.
- **`?dry=1`** → Empfängerliste, sendet nichts.

### 3.10 Rechtliches

- **`/widerruf`** angelegt (Muster nach EGBGB Anlage 1)
- **Pflicht-Checkbox im Checkout** (§ 356 Abs. 5 BGB): *„Ich stimme ausdrücklich zu, dass der Zugang sofort bereitgestellt wird, und bestätige, dass ich damit mein Widerrufsrecht verliere."*
  Kaufen-Button ohne Häkchen **deaktiviert**, Server lehnt ohne Zustimmung ab, Zustimmung wandert mit Zeitstempel in die Stripe-Session.
  > Ohne das hätte ein Käufer alle 27 Lektionen konsumieren und danach die 399 € zurückfordern können — völlig legal.
- **Datenschutz Abschnitt 9a** ergänzt: Stripe + Klarna als Empfänger, Rechtsgrundlage, Speicherdauer. Vorher fehlten **beide vollständig** (Art. 13 DSGVO).

### 3.11 Edge Cases (Spec A5)

| Fall | Verhalten |
|---|---|
| Bestehendes Abo | Grant liegt in **eigener Tabelle** → Stripe kann ihn nicht überschreiben |
| Doppelkauf | stapelt auf 184 Tage, Mail an Max |
| Refund | Zugang widerrufen, `converted_at` zurückgesetzt |
| **Klarna-Rate platzt / Chargeback** | **Alarm-Mail an dich** — keine automatische Sperre, du entscheidest |
| **Zugangsmail geht nicht raus** | **1 Wiederholungsversuch nach 3 s, dann Alarm-Mail an dich** (der Kunde hat bezahlt und wartet) |

---

## 4 · Automatisch verifiziert ✅

| Test | Ergebnis |
|---|---|
| `npm run test:redflags` | **17/17** — jede Notfall-Kombination stoppt weiterhin |
| `npm run test:segments` | **57/57** — Segment D bekommt NIE eine Mail · Segment B nur B1/B2 · **M-Mails an Nicht-LWS-Leads werfen** (jede Region einzeln geprüft) |
| Migration 4 (echtes Postgres) | **16/16** — JSONB-Mapping, Constraints, Idempotenz |
| Region-Endpoint: gefälschter/fehlender Token | abgewiesen — Lead-ID kommt nur aus dem signierten Token |
| RT1/RT2: „Kein-Angebot"-Check | **0 Preise, 0 Salespage-Links** |
| `npm run hwg:check` | grün — keine verbotenen Vokabeln in irgendeiner Datei |
| `npx tsc --noEmit` | grün |
| `npm run build` | grün |
| Migration + Grant-Semantik (echtes Postgres) | **16/16** — Retry schenkt keine 2. Begleitung, Doppelkauf stapelt, Refund nimmt zurück |
| Claim-Register (echtes Postgres) | **19/19** — inkl. 10 parallele Claims → genau 1 Gewinner |
| Backfill gegen Prod-Daten | **8/8** — 1.835 Claims, alle 521 Leads erfasst |
| Segmentzahlen gegen echte Leads | **178 / 117 / 16 / 210** — exakt wie in der Spec |
| Dry-Run gegen echte Leads | 170 fällig, 30 im ersten Lauf, **Segment D = 0** |
| „Kein-Angebot"-Mails (B1, B2, T3, D1S, D2S, D4S) | **0 Preise, 0 Salespage-Links, 0 Kauf-Buttons** |
| Kaufen-Button ohne Häkchen | **deaktiviert** (im Browser geprüft) |
| Deck-/Kurs-Checkout | **nicht gebrochen** (Widerrufs-Pflicht greift nur bei der Masterclass) |

---

## 5 · Was DU testen musst

**Review-Zentrale:** http://localhost:3001/api/dev/review

### 5.1 Funnel durchspielen
- [ ] `/api/dev/funnel` → Check **ohne** Warnzeichen → Report + Masterclass-Angebot
- [ ] Nochmal → Check **mit** „Beschwerden wecken dich jede Nacht" → **muss durchkommen**, Hinweis im Report
- [ ] Nochmal → Check mit **Sattel-Taubheit** → **muss stoppen**, Arzt-Seite, kein Angebot

> ⚠️ Das Formular auf `/schmerzcheck` **nicht** selbst ausfüllen — der Dev-Server hängt an der Produktions-DB und am echten SMTP. `/api/dev/funnel` legt einen Test-Lead an, der garantiert nie angemailt werden kann.

### 5.2 Mails gegenlesen
- [ ] **M1–M4** — Ton, Betreff, Preisblock. Klingt das nach dir?
- [ ] **B1/B2** — kein Kaufangebot (automatisch geprüft, aber lies es trotzdem)
- [ ] **T2, D1–D5, W1** — der umgestellte Funnel für neue Leads
- [ ] Abmelde-Link in jeder Mail

### 5.3 Salespage `/kurse/chronischer-kreuzschmerz`
- [ ] Preisblock, Klarna-Kasten, Sektion „Deine Begleitung", FAQ
- [ ] **Auf dem Handy ansehen** — die Zielgruppe kommt fast nur mobil

### 5.4 Kauf-Flow (Stripe-Testmodus) — nach dem Deploy
- [ ] Testkauf mit Karte → Zugangsmail kommt an, Grant mit `expires_at` = +92 Tage
- [ ] **Klarna-Checkout einmal durchklicken**
- [ ] Zustelltest mit echter **web.de**- UND **gmx.de**-Adresse (Posteingang, nicht Spam)
- [ ] Kauf mit E-Mail eines bestehenden Kontos → Grant hängt am bestehenden Login
- [ ] Refund auslösen → Zugang widerrufen
- [ ] `expires_at` auf gestern setzen → Chat zu, Training bleibt, **keine Abbuchung**
- [ ] Admin: Badge + Filter „Aktive Begleitungen"

---

## 6 · Bewusst abweichend von der Spec

| Spec | Umsetzung | Grund |
|---|---|---|
| Brücken-Mails „R1/R2" | **B1/B2** | R1/R2 sind seit Juni als Check-Erinnerung vergeben — gleicher Code hätte den Doppelversand-Schutz zerlegt |
| 92 Tage in `patient_subscriptions` stapeln | **eigene Tabelle** `app_access_grants` | Stripe überschreibt dort `current_period_end` bei jeder Abrechnung → die Tage wären still verschwunden |
| Konto-Status `invited` | bestehender Käufer-Flow (Konto + Passwort per Mail) | existiert bereits und funktioniert |
| Verknappung „max. X Begleitungen/Monat" | **weggelassen** | Zahl X nicht genannt — lieber keine Verknappung als eine erfundene |
| Segment B bekommt die Masterclass | **erst nach ärztlicher Abklärung** (Klick) | Masterclass enthält Übungsprogramm → HWG |

---

## 7 · Noch offen

| # | Was | Blocker? |
|---|---|---|
| 1 | **Widerrufsbelehrung anwaltlich prüfen** — folgt dem gesetzlichen Muster, ist aber von mir eingesetzt, nicht geprüft | ⚠️ vor dem 1. Kauf |
| 2 | **Tag-70/85-Erinnerungsmails** vor Ablauf der Begleitung — braucht Migration 4 | ✅ nein — Tag 70 ist frühestens Ende September |
| 3 | **Widerrufs-Checkbox für Decks und Kurse** — dieselbe Rechtslage, bestehende Lücke (kein neuer Fehler) | ✅ nein, aber nachziehen |
| 4 | **Mail-Texte** — meine Entwürfe, deine Stimme sollte drüber | ✅ nein |
| 5 | **Zahl X** für die Betreuungsplatz-Verknappung | ✅ nein |
| 6 | **P2:** Open-Pixel in Mails, SLA-Ampel bei > 48 h unbeantworteten Chats, Buchungs-Widget-Rückmeldung | ✅ nein |

**Erledigt:** ~~Klarna im Stripe-Dashboard aktivieren~~ ✅ (12.07.)

---

## 8 · Deploy-Plan

1. Commit + Push + Hetzner-Deploy
2. **Ab dann sofort live:** entschärfte Red-Flags, Masterclass-Angebot im Report, umgestellte Funnel-Mails für neue Leads, Salespage, Kauf → 92 Tage Begleitung, Widerruf + Datenschutz
3. **NICHT live:** die Kampagne an die 521 Bestandsleads. Der Cron ist eine Route, die niemand aufruft — es gibt dafür **keinen pg_cron-Job**. Es geht keine einzige Mail raus, bis wir den Job bewusst anlegen.
4. Testkauf im Stripe-Testmodus (Abschnitt 5.4)
5. Erst danach: pg_cron-Job für die Kampagne → erster gedrosselter Lauf (30 Mails) → Sichtprüfung → Rest
