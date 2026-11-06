# Praxis OS — Funktionsübersicht, Technik und ZPP-Machbarkeit

**Stand:** 06.11.2026 · **Grundlage:** Quellcode (Repo `my-first-app`), Feature-Specs (`features/`), 98 Datenbank-Migrationen, Server-Konfiguration sowie die aktuellen Primärquellen des GKV-Spitzenverbands (Leitfaden Prävention, Fassung 17.12.2025).
**Zweck:** Entscheidungsgrundlage, ob und wie ein zweites Modul gebaut werden kann, mit dem ein Präventionsangebot über Praxis OS nach § 20 SGB V durch die Zentrale Prüfstelle Prävention (ZPP) zertifiziert werden kann.

> Alle Aussagen zur Software sind aus dem Code abgelesen. Wo etwas nur außerhalb des Codes prüfbar ist (Supabase-Dashboard, Verträge, Server), steht das ausdrücklich dabei.

---

## Inhalt

1. [Kurzprofil](#1-kurzprofil)
2. [Rollen und Rechte](#2-rollen-und-rechte)
3. [Patienten-App](#3-patienten-app)
4. [Therapeuten-OS](#4-therapeuten-os)
5. [90-Tage-Programm, Verträge, Abrechnung](#5-90-tage-programm-verträge-abrechnung)
6. [BGF-Modul (Betriebliche Gesundheitsförderung)](#6-bgf-modul)
7. [Akquise und Analyse](#7-akquise-und-analyse)
8. [Technik](#8-technik)
9. [Datenschutz und Sicherheit — Ist-Stand und Lücken](#9-datenschutz-und-sicherheit)
10. [ZPP-Anforderungen kompakt](#10-zpp-anforderungen-kompakt)
11. [Gap-Analyse: Was für ein ZPP-Modul da ist und was fehlt](#11-gap-analyse)
12. [Empfehlung und nächste Schritte](#12-empfehlung-und-nächste-schritte)
13. [Quellen](#13-quellen)

---

## 1. Kurzprofil

Praxis OS ist eine Web-Plattform (installierbar als PWA) mit drei Oberflächen:

| Oberfläche | Nutzer | Kern |
|---|---|---|
| **Patienten-App** (`/app`) | Patientinnen und Patienten, BGF-Mitarbeitende | Trainingspläne mit Videos, Trainingspfade mit Quiz, Schmerztagebuch/Check-in, Chat, Video-Sprechstunde, Dokumente, Rechnungen |
| **Therapeuten-OS** (`/os`) | Heilpraktiker, Physiotherapeuten, Trainer, Praxismanagement, Admin | Patientenakte (Anamnese, Befund, ICD-10, Behandlungsdoku), KI-Arztbericht, Übungsdatenbank, Plan-Builder, Ampelsystem, Video-Sprechzimmer, Abrechnung nach GebüH |
| **HR-Portal** (`/hr`) | Personalverantwortliche von Firmenkunden | Anonyme Kennzahlen, Leistungen, Quartalsberichte |

Dazu kommen öffentliche Seiten: Website, Schmerzcheck, Anzeigen-Landingpages, Shop (Kurse, Bewegungskarten), Vertragsunterzeichnung.

**Umfang in Zahlen:** 225 API-Endpunkte, ca. 60 OS-Seiten, 4 HR-Seiten, 82 Datenbanktabellen, 98 Migrationen, 8 zeitgesteuerte Jobs, 3 Webhooks.

**Aktuelles Kernprodukt:** das **90-Tage-Programm** (Begleitet 299 €, Intensiv 499 € mit 8 Videoterminen) als Heilpraktiker-Leistung, abgerechnet nach GebüH, umsatzsteuerfrei nach § 4 Nr. 14 UStG.

---

## 2. Rollen und Rechte

Rollen in `user_profiles.role`: `admin`, `heilpraktiker`, `physiotherapeut`, `praeventionstrainer`, `personal_trainer`, `praxismanagement`, `patient`, `externer_kaeufer`.
HR-Zugänge laufen über die Tabelle `organization_admins`, BGF-Mitarbeitende über `organization_members`.

Durchsetzung serverseitig in `src/lib/supabase-middleware.ts` und zusätzlich per Row Level Security in der Datenbank:

- **Heilpraktiker:** alles inklusive Befund und Diagnose (ICD-10).
- **Physiotherapeut:** kein Befund-/Diagnosebereich.
- **Präventionstrainer / Personal Trainer:** keine klinischen Bereiche.
- **Praxismanagement:** keine Therapie-Werkzeuge (Übungen, Pläne, Hausaufgaben).
- **Admin:** zusätzlich `/os/admin` (Nutzer, Abrechnung, Verträge, Integrationen).
- **Patient:** nur `/app`, kein Zugriff auf `/os`.
- Deaktivierte Konten werden abgemeldet; Passwortänderung kann erzwungen werden.

> Für ZPP relevant: Die Rolle **`praeventionstrainer`** existiert bereits. Eine Zuordnung „Kursleitung ↔ Kurs“ gibt es noch nicht.

---

## 3. Patienten-App

Navigation: Home · Training · Challenges · Fortschritt · Nachrichten.

| Funktion | Was sie tut | Daten |
|---|---|---|
| **Dashboard** | Heutiges Training, Termine, Trinkziel, Tagesimpuls, Wochenrückblick, Serie, ungelesene Nachrichten | mehrere |
| **Trainingspläne / Hausaufgaben** | Übungen mit Bild/Video, geführter Modus, Vorlesefunktion, Session-Player (Sätze, Wiederholungen, Halte-Timer, Seitenwechsel), eigene Trainingstage | `patient_assignments`, `assignment_completions`, `training_session_logs` |
| **Trainingspfade („Challenges“)** | Mehrtägige Kurse (Standard 21 Tage), **1 Modul pro Kalendertag freigeschaltet**, Reflexionsfrage, **Quiz je Modul (≥ 2 von 3)**, Abschlusstest, **Teilnahmezertifikat (PDF)** | `learning_paths`, `path_lessons`, `path_lesson_quizzes`, `patient_path_enrollments`, `patient_path_progress` |
| **Wissen** | Lektionen je Beschwerdebild, nächste Lektion wird bei Bedarf mit KI erzeugt, Quiz | `education_*`, `quiz_attempts` |
| **Masterclass „Chronischer Kreuzschmerz“** | 27 Lektionen (Audio + Folien), Workbook; Einmalkauf, schaltet 3 Monate Begleitung frei. *Status: gebaut, ruhend* | Freischaltung serverseitig, Fortschritt nur im Browser |
| **Schmerztagebuch / täglicher Check-in** | Befinden und Schmerz täglich, als sanfte Pflicht beim Öffnen | `pain_diary_entries` |
| **Fortschritt / Gamification** | Serie, Wochenziel, Erfolge, Verlaufskurven | berechnet |
| **Trinkziel** | Gläser pro Tag | `patient_hydration_daily` |
| **Chat** | Nachrichten mit dem Therapeuten inkl. Medien; Antwortzusage im Programm 24 h | `chat_messages`, Bucket `chat-media` |
| **Video-Sprechzimmer** | Termin per Link/QR, selbst gehosteter Videoserver (LiveKit), keine Aufzeichnung | `video_calls`, `video_call_events` |
| **Termine** | Termine sehen, umbuchen, stornieren (über das Buchungstool) | `appointments` |
| **Dokumente** | Hochladen und Scannen (Scan läuft im Browser) | `patient_documents` |
| **Rechnungen** | Rechnungen und Leistungsnachweise als PDF | `invoices` |
| **Verschlechterung melden** | Eigener Fall mit Frist und Zusatz-Videotermin, erscheint in der Ampel des Therapeuten | `programm_verschlechterungen` |
| **Push / Installation** | Web-Push mit Einstellungen, Installationshilfe | `push_subscriptions` |
| **BGF-Bereich** | Ist-Analyse (5 Schritte), Pausen-Fit (KI-generierte Kurzroutinen), Check-in, Team-Puls (anonym), Atempause | `ist_analyse`, `pausen_fit_sessions`, `bgf_daily_checkins` |

**Zugangsmodell:** Zugangszustände `programm_aktiv`, `erhaltung_aktiv`, `programm_beendet` (Verlauf bleibt lesbar), `gesperrt`, `bestandspatient`. Zeitlich befristete Betreuung ist vom Abo getrennt (keine automatische Verlängerung). Inhalte werden über Kauf **oder** Abo freigeschaltet.

---

## 4. Therapeuten-OS

| Bereich | Inhalt |
|---|---|
| **Patientenakte** | Stammdaten, Anamnese, Funktionsuntersuchung (inkl. Janda-Katalog), Befund und Diagnose mit ICD-10 (nur Heilpraktiker), Behandlungsdokumentation, Trainingsdokumentation, Duplikatsprüfung, Archiv |
| **Anfragen** | Öffentliches Anfrageformular → Umwandlung in Patient |
| **KI-Arztbericht** | Entwurf aus der Akte per Claude, Bearbeitung im Editor |
| **Übungsdatenbank** | Übungen mit Medien, Favoriten, Duplizieren |
| **Trainingsplan-Builder** | Drag & Drop, Phasen, Einheiten, Übungen |
| **Hausaufgaben** | Zuweisung und Erledigungsübersicht |
| **Ampelsystem** | Rot/Gelb/Grün je Patient in aktiver Betreuung, Erinnerung per Push + Chat, Verschlechterungsfälle |
| **Chat-Posteingang** | Alle Patientengespräche |
| **Sprechstunde / Sprechzimmer** | Video-Calls starten, „Schaltzentrale“ im Call: Akte, Notiz, Plan und Bewegungsbild zeigen statt Bildschirm teilen |
| **Aufgaben** | Automatisch erzeugte To-dos (z. B. Leistungsnachweis freigeben) |
| **Admin** | Nutzer, Praxisdaten, Integrationen (Buchungs-Webhook), Shop-Bewertungen, Promo-Codes, Analytics, Client-Fehlerprotokoll |

---

## 5. 90-Tage-Programm, Verträge, Abrechnung

- **Programm-Angebot:** Am Ende der Video-Konsultation erzeugt der Therapeut ein Angebot (QR-Code, 48 h gültig). Ohne dieses Angebot kein Kauf.
- **Varianten:** einzige Preisquelle `src/lib/programm.ts` — Begleitet 299 €, Intensiv 499 € (8 Videotermine), Konsultation 69 €, Dauer 90 Tage.
- **Vertrag:** digital unterschrieben, Variante am Vertrag gespeichert.
- **Zahlung:** Stripe Checkout, Klarna als Zahlart (Raten entscheidet Klarna).
- **Abrechnung nach GebüH:**
  - **eine** Bezahlrechnung (Umsatz) und **drei** monatliche **Leistungsnachweise** (eigene Nummernfolge `N-2026-xxxx`, kein Umsatz, „bereits beglichen“) — erzeugt als Entwurf durch einen täglichen Job, Freigabe durch den Therapeuten.
  - Analogziffern werden auf dem Beleg erklärt.
  - Kostenvoranschläge ohne Patientenkonto.
  - Buchhaltungsübersicht: BGF-Rechnungen (19 % USt), Patientenrechnungen (steuerfrei), Shop-Umsätze.

---

## 6. BGF-Modul

- **Organisationen, Mitarbeitende, HR-Admins** mit eigenen Einladungswegen.
- **Ist-Analyse**, **Pausen-Fit** (Routinen morgens/mittags/nachmittags, Push alle 30 min geplant), **Team-Puls** (nur anonyme Aggregate), Ziele, Leistungen buchbar.
- **Verträge** (Paketpreise nach Teamgröße, einzige Quelle `src/lib/bgf-pakete.ts`), **Rechnungen** inkl. E-Rechnung (XML), Mahnwesen, **Quartalsbericht** als PDF an HR.
- **Wichtig für ZPP:** Die App selbst ist **nicht** ZPP-zertifiziert. Steuerfreiheit nach § 3 Nr. 34 EStG gilt nur für zertifizierte Kurse, nicht für die App-Lizenz.

---

## 7. Akquise und Analyse

- **Schmerzcheck** (`/check`, `/schmerzcheck`): 6 Fragen, Auswertung im Browser, Sicherheitsstopp bei Warnzeichen, Antworten nie in der URL; Lead-Strecke mit E-Mail-Serie.
- **Anzeigen-Landingpages** (`/start/*`).
- **Eigene Analyse** ohne Drittanbieter: Seitenaufrufe, Ereignisse, Trichter, Aufmerksamkeitsmessung je Abschnitt.
- **Meta-Pixel** nur auf Marketing-Seiten und nur nach Einwilligung; nicht im eingeloggten Bereich.

---

## 8. Technik

### 8.1 Architektur

| Baustein | Umsetzung |
|---|---|
| Frontend + Backend | **Next.js 16** (App Router), React 19, TypeScript, Tailwind + shadcn/ui |
| Datenbank, Auth, Dateien | **Supabase** (PostgreSQL, Auth, Storage, Row Level Security) |
| Validierung | Zod auf API-Eingaben |
| App-Server | **Hetzner** VPS (Ubuntu 24.04), PM2, Nginx als Reverse Proxy, TLS via Let's Encrypt |
| Videoserver | **LiveKit**, selbst gehostet auf eigenem Hetzner-VPS, TURN über TLS, max. 8 Teilnehmer je Raum, **keine Aufzeichnung** |
| DNS | Cloudflare, nur DNS (kein Proxy) |
| Zahlungen | Stripe (inkl. Klarna) |
| E-Mail | Nodemailer über GMX und SiteGround-SMTP |
| Push | Web Push (VAPID) über Service Worker |
| PDF | jsPDF / pdf-lib (Rechnungen, Verträge, Berichte, Zertifikate) |
| KI | Anthropic Claude API (Arztbericht, Lektionen, Tagesimpuls, Pausen-Fit, BGF-Berichte) |
| Sprachausgabe | ElevenLabs |
| Zeitgesteuerte Jobs | Supabase **pg_cron + pg_net** rufen die Cron-Endpunkte mit Geheimnis auf |
| Schriften | beim Build eingebunden und selbst ausgeliefert (kein Laufzeitabruf bei Google) |

### 8.2 Betrieb

- **Deploy-Skript** baut zuerst, schaltet erst bei Erfolg um, wiederholt fehlgeschlagene Builds, fällt sonst auf den alten Stand zurück und prüft die Erreichbarkeit.
- **Zeitgesteuerte Jobs (8):** Trainingserinnerungen, BGF-Rechnungslauf, BGF-Quartalsbericht, Pausen-Fit, Schmerzcheck-E-Mails, Masterclass-Kampagne, Leistungsnachweise, Sprechzimmer-Erinnerungen.
- **Webhooks (3):** Buchungstool (HMAC-SHA256), LiveKit (Teilnahmeprotokoll), Stripe.
- **Protokoll:** Teilnahme an Video-Calls (wer wann beigetreten/gegangen), Webhook-Ereignisse, Client-Fehler.

### 8.3 Authentifizierung

- Supabase Auth mit E-Mail + Passwort, Sitzung per Cookie, Prüfung bei jeder Anfrage in der Middleware.
- Passwortregeln: mindestens 8 Zeichen, Groß- und Kleinbuchstabe, Zahl (in den Formularen).
- Anmeldelinks aus Mails werden serverseitig eingelöst (`/auth/bestaetigen`).
- Rate Limiting auf ca. 22 öffentlichen Endpunkten (im Speicher, nicht über Neustarts hinweg).
- **Keine Zwei-Faktor-Anmeldung.**

### 8.4 Datenbank

- **82 Tabellen, alle mit Row Level Security** (Abgleich `CREATE TABLE` gegen `ENABLE ROW LEVEL SECURITY` ohne Lücke; die Qualität jeder einzelnen Regel ist nicht einzeln geprüft).
- Dateispeicher: private Buckets für Verträge, Chat-Medien, Patientendokumente; öffentliche Buckets nur für Profilbilder, Sprachausgabe, Hintergrundklänge.
- Verschlüsselung im Ruhezustand: Supabase-Standard; keine zusätzliche Feldverschlüsselung.
- Standort laut Datenschutzerklärung: Datenbank in der **Schweiz** (Angemessenheitsbeschluss). *Im Supabase-Dashboard zu bestätigen.*

### 8.5 Sicherheits-Header

X-Frame-Options DENY, nosniff, HSTS (2 Jahre, preload), Referrer-Policy, Permissions-Policy (Kamera/Mikrofon nur eigene Seite), Content-Security-Policy mit `frame-ancestors 'none'`.
**Schwächen:** CSP erlaubt `unsafe-inline`/`unsafe-eval` und Facebook-Domains global (auch im App-Bereich).

### 8.6 Qualitätssicherung

- TypeScript-Prüfung vor jedem Deploy.
- **Keine automatisierten Tests** (keine Unit-/E2E-Suites), **keine CI**. Nur Einzelskripte (Warnzeichen-Logik, HWG-Wortprüfung).

---

## 9. Datenschutz und Sicherheit

### 9.1 Was vorhanden ist

- Hosting in Deutschland (Hetzner), Video selbst gehostet, keine Aufzeichnung.
- Row Level Security auf allen Tabellen, Rollenprüfung serverseitig.
- Kein Tracking durch Dritte im eingeloggten Bereich; Einwilligungsbanner für Marketing; Google Consent Mode standardmäßig „verweigert“.
- Chatnachrichten unveränderlich.
- Rechtsseiten: Datenschutz, Impressum, AGB, Widerruf.
- Grundlegende Barrierefreiheit: `lang="de"`, Zoom erlaubt, Radix-Bausteine mit ARIA (ca. 430 ARIA-Attribute).

### 9.2 Lücken — unabhängig von ZPP zu beheben

| # | Befund | Gewicht |
|---|---|---|
| 1 | **Datenschutzerklärung stimmt beim KI-Einsatz nicht mit dem Code überein.** Sie sagt, an Anthropic gingen „keine personenbezogenen Patientendaten“. Tatsächlich sendet der **KI-Arztbericht** Geburtsdatum, Geschlecht, Krankenkasse, Versichertennummer, Anamnese, Diagnosen und Behandlungsnotizen (nur der Name ist durch „Patient A“ ersetzt). Der **Tagesimpuls** sendet Vorname, Beschwerdebild und Schmerzwerte. | **hoch** |
| 2 | ElevenLabs und SiteGround fehlen in der Liste der Auftragsverarbeiter. | mittel |
| 3 | Keine Zwei-Faktor-Anmeldung, v. a. für Therapeuten-/Admin-Konten mit Gesundheitsdaten. | mittel |
| 4 | Keine Selbstbedienung für Auskunft/Datenexport (Art. 15/20) und Löschung (Art. 17); nur per Anfrage. | mittel |
| 5 | Kein allgemeines Zugriffsprotokoll auf Patientendaten. | mittel |
| 6 | Einwilligungen nur im Browser gespeichert, nicht nachweisbar in der Datenbank. | niedrig–mittel |
| 7 | CSP zu weit (siehe 8.5). | niedrig |
| 8 | Keine automatisierten Tests, keine Barrierefreiheits-Prüfung, keine Erklärung zur Barrierefreiheit. | niedrig (für Kap. 7 Pflicht) |
| 9 | Backup-Konzept nur Supabase-Standard, nicht dokumentiert. | niedrig–mittel |

**Empfehlung zu Punkt 1:** kurzfristig Pseudonymisierung im Arztbericht schärfen (Geburtsdatum → Alter, Krankenkasse und Versichertennummer **nicht** senden, im Ergebnis lokal wieder einsetzen) und die Datenschutzerklärung an den tatsächlichen Umfang anpassen.

---

## 10. ZPP-Anforderungen kompakt

Grundlage: Leitfaden Prävention, Fassung 17.12.2025; Kriterien Kapitel 5 (Stand 06.01.2026) und Kapitel 7 (Stand 17.12.2025); FAQ digitale Angebote (12.12.2025).

### 10.1 Welche Form passt

Die Trennlinie: **Leitet eine reale Person, gilt Kapitel 5. Übernimmt die Technik die Kursleitung, gilt Kapitel 7.**

| Form | Kapitel | Kurz | Aufwand für uns |
|---|---|---|---|
| **(a) Live-Onlineseminar** | 5 (IKT-Kurs) | Kursleitung live per Video | **gering–mittel** |
| **(b) Onlinekurs mit Kursleitung** | 5 (IKT-Kurs) | zeitversetzt, reale Kursleitung erreichbar | **mittel** |
| (c) Digitales Präventionsangebot / App | 7 | Wirksamkeitsstudie (vorab registriert), ISO 27001, DSFA, BITV-Erklärung, werbefrei | **sehr hoch** |
| Hybrid / Blended | 5 oder 7 | Präsenz + digital | wie (a)/(b) |

### 10.2 Kapitel 5 — gemeinsame Anforderungen (a) und (b)

- **8–12 aufeinander aufbauende Einheiten à 45–90 Minuten**, i. d. R. wöchentlich.
- Stundenverlaufspläne (Einstieg, Hauptteil, Abschluss), Teilnehmerunterlagen, evidenzbasierte Inhalte, **keine Heilungsversprechen**.
- Plattform: Aktivitäten planen und kontrollieren, Rückmeldung über Protokollierung und Auswertung, Hinweise auf typische Übungsfehler.
- Ansprechperson für technischen Support; Quellen und Stand der Überarbeitung angeben.
- Bereitschaft zur Teilnahme am kassenübergreifenden Evaluationssystem.
- **Teilnahmebescheinigung nach verbindlichem GKV-Muster** (seit 01.01.2026), digitale Signatur zulässig.
- Datenschutz: DSGVO/BDSG/SGB X, Selbstverpflichtung per unterschriebenem Formblatt. Haftungsausschluss und „Teilnahme auf eigene Gefahr“ in den Nutzungsbedingungen.
- **Nicht** gefordert für Kapitel 5: ISO 27001, BSI TR-03161, Barrierefreiheitserklärung.

### 10.3 Unterschiede (a) Live vs. (b) Onlinekurs

| Kriterium | (a) Live-Onlineseminar | (b) Onlinekurs |
|---|---|---|
| Kommunikation | Austausch ermöglichen | **mind. 24 Min. Kommunikation je Teilnehmendem**, fachliche Fragen binnen 48 h |
| Reihenfolge | — | Folgemodul erst nach Abschluss des vorigen |
| Erfolgskontrolle | im Stundenverlaufsplan | **Wissensquiz mit Rückmeldung** |
| Kontraindikationen | informieren | **technisch ausschließen** |
| Erstattung | **≥ 80 %** Teilnahme | **100 %** der Einheiten, technisch nachweisbar |
| Sonstiges | Plattform + Kommunikationsform benennen | **Testzugang** für die ZPP (muss dauerhaft funktionieren) |

### 10.4 Kursleitung

Staatlich anerkannter bewegungsbezogener Abschluss **plus** Mindeststandards (Präventionsprinzip 2 „spezielle Risiken“, z. B. Rücken: 870 Std./29 ECTS, Fachpraxis nur in Präsenz) **plus** Einweisung in das Verfahren. Einmal anerkannt, gilt die Qualifikation dauerhaft für das Präventionsprinzip. → Max ist als Kursleiter registriert; **zu prüfen: für welches Präventionsprinzip** (im ZPP-Portal).

### 10.5 Verfahren

- Prüfung **kostenfrei**, auch Rezertifizierung.
- IKT-Angebote laufen **über ein Konzept** (Bearbeitung i. d. R. 15 Arbeitstage).
- **Gültigkeit für IKT-Konzepte ohne Evaluation zunächst 1 Jahr**, mit Wirksamkeitsnachweis +2 Jahre.

---

## 11. Gap-Analyse

Bewertet für die realistischen Formen (a) und (b) nach Kapitel 5.

### 11.1 Was schon da ist und genutzt werden kann

| ZPP-Anforderung | Vorhandener Baustein |
|---|---|
| Live-Einheiten per Video (a) | **Video-Sprechzimmer** (LiveKit, selbst gehostet, DSGVO-freundlich, Teilnahmeprotokoll über Webhook) |
| Module in fester Reihenfolge, Freischaltung nach Abschluss (b) | **Trainingspfade**: sequenzielle Module, tägliche Sperre, Fortschritt je Modul |
| Wissensquiz mit Rückmeldung (b) | **Modul-Quiz** und Abschlusstest |
| Aktivitäten planen/kontrollieren, Protokollierung | Trainingspläne, Session-Player, Erledigungen, Trainingslog, Check-in |
| Hinweise auf Übungsfehler | Übungsdatenbank mit Video und Beschreibung, Vorlesefunktion |
| Kommunikation / Fragen binnen 48 h (b) | **Chat** (Antwortzusage im Programm bereits 24 h) |
| Kontraindikationen erfassen | **Warnzeichen-Logik** aus dem Schmerzcheck (Sicherheitsstopp) |
| Teilnahmebescheinigung | Zertifikat-PDF existiert (muss aber umgebaut werden, s. u.) |
| Rolle Kursleitung | Rolle `praeventionstrainer` existiert |
| Datenschutz-Grundlagen | EU-/CH-Hosting, RLS, kein Tracking in der App |
| Push-Erinnerungen an Einheiten | Web-Push + zeitgesteuerte Jobs |

### 11.2 Was fehlt

| # | Lücke | Für | Aufwand (grob) |
|---|---|---|---|
| 1 | **Kursmodell** mit 8–12 Einheiten à 45–90 Min. (statt 21 Tagesmodulen), Kurs-ID der ZPP, Stand/Quellenangabe | a + b | mittel |
| 2 | **Kursleitung ↔ Kurs** zuordnen, Kursleiter-Anzeige | a + b | gering |
| 3 | **Teilnahmenachweis serverseitig**: Anwesenheit Live-Einheit (aus Video-Protokoll) bzw. Abschluss jeder Einheit; Quote 80 %/100 % | a + b | mittel |
| 4 | **Teilnahmebescheinigung nach GKV-Muster** (Kursleitung, ZPP-ID, Zeitraum, Quote, Signatur), serverseitig ausgestellt und gespeichert; heute nur Browser-PDF, `certificate_issued_at` wird nie gesetzt | a + b | mittel |
| 5 | **Kommunikationsquote 24 Min./TN** messbar (Chat-/Call-Zeit je Teilnehmendem) | b | mittel |
| 6 | **Kontraindikations-Ausschluss** vor Kursbeginn als Pflichtschritt mit Bestätigung | b (a: Info) | gering |
| 7 | **Gruppenkurse**: Kurs-Termine, Gruppen (Leitfaden: 6–15 TN), Einladungen; **LiveKit-Raumgröße von 8 anheben** | a | mittel |
| 8 | **Testzugang** für die ZPP (dauerhaft, ohne Abo) | b | gering |
| 9 | **Vom Abo/Shop entkoppelter Zugang**: Kurs als eigenständig buchbares Angebot mit festem Ende, ohne Mitgliedschaftsbindung und ohne Verkauf von Begleitprodukten im Kurs | a + b | gering–mittel |
| 10 | **Nutzungsbedingungen** mit Haftungsausschluss / „Teilnahme auf eigene Gefahr“, Datenschutz-Formblatt | a + b | gering (Text) |
| 11 | **Inhalte**: Konzept, Stundenverlaufspläne, Teilnehmerunterlagen, Evidenzbasis (z. B. Rückenschule nach KddR-Curriculum) | a + b | **hoch (fachlich, nicht technisch)** |
| 12 | Evaluations-Bereitschaft (Fragebogen vorher/nachher technisch vorbereiten) | a + b | gering |

### 11.3 Kritischer Punkt: Abo und Shop

Der Leitfaden schließt Maßnahmen aus, die **an eine Mitgliedschaft gebunden** oder **auf Dauer angelegt** sind, sowie Anbieter mit **Interesse am Verkauf von Begleitprodukten**. Praxis OS hat heute Abo, Shop, Bewegungskarten und Programmverkauf in derselben App.
→ Das ZPP-Modul sollte als **klar abgegrenzter Kursbereich** laufen: eigener Zugang, fester Zeitraum, keine Verkaufsflächen innerhalb des Kurses. **Vorab bei der ZPP klären** (Tel. 0201 / 56 58 290), ob die übrigen Angebote der App ein Problem sind.

---

## 12. Empfehlung und nächste Schritte

**Empfehlung:** Ein **Kapitel-5-IKT-Kurs** im Präventionsprinzip „Rücken“ — zuerst als **(a) Live-Onlineseminar**, weil:
- der Video-Teil schon steht und datenschutzfreundlich selbst gehostet ist,
- 80 % Teilnahme leichter erreichbar ist als 100 %,
- keine Kommunikationsquote nachgewiesen werden muss,
- keine Studie, kein ISO 27001 nötig ist.

Danach optional **(b) Onlinekurs** auf Basis der Trainingspfade (sequenziell, Quiz, Chat sind vorhanden) — skaliert besser, braucht aber 100 %-Nachweis und Kommunikationsquote.

Kapitel 7 (eigenständige Präventions-App) lohnt sich erst mit Studie und ISO 27001 — für eine Einzelpraxis aktuell unverhältnismäßig.

**Nächste Schritte:**

1. **ZPP anrufen:** Abo/Shop-Thema (11.3), Gruppengröße bei Live-Online, Gültigkeit 1 Jahr auch für Live-Online, welches Präventionsprinzip Max' Anerkennung abdeckt.
2. **Datenschutz-Lücken 9.2 Nr. 1 und 2 beheben** — unabhängig von ZPP, rechtlich dringend.
3. **Kurskonzept fachlich festlegen** (Rückenschule, 8–10 Einheiten à 60 Min., Stundenverlaufspläne).
4. **Technik-Modul bauen** (Lücken 11.2 Nr. 1–4, 6–10, 12).
5. Konzept bei der ZPP einreichen, Testzugang bereitstellen.

---

## 13. Quellen

- GKV-Spitzenverband: [Leitfaden Prävention, Fassung 17.12.2025](https://www.gkv-spitzenverband.de/media/dokumente/krankenversicherung_1/praevention__selbsthilfe__beratung/praevention/praevention_leitfaden/20251218_Leitfaden_Pravention_2025_barrierefrei.pdf)
- [Kriterien zur Zertifizierung von Präventionskursangeboten gemäß Kapitel 5, Stand 06.01.2026](https://www.gkv-spitzenverband.de/media/dokumente/krankenversicherung_1/praevention__selbsthilfe__beratung/praevention/praevention_leitfaden/Kriterien_zur_Zertifizierung_von_Praeventionskursangeboten_gemaess_Kapitel_5_Stand_06.01.2026.pdf)
- [Kriterien zur Zertifizierung digitaler Präventionsangebote gemäß Kapitel 7, Stand 17.12.2025](https://www.gkv-spitzenverband.de/media/dokumente/krankenversicherung_1/praevention__selbsthilfe__beratung/praevention/praevention_leitfaden/Kriterien_zur_Zertifizierung_digitalen_Praeventionsangebote_gemaess_Kapitel_7_Stand_17.12.2025.pdf)
- [FAQ Digitale Präventions- und Gesundheitsförderangebote, Stand 12.12.2025](https://www.gkv-spitzenverband.de/media/dokumente/krankenversicherung_1/praevention__selbsthilfe__beratung/praevention/praevention_leitfaden/FAQs_Digitale_Praeventions-_und_Gesundheitsfoerderangebote_Stand_12.12.2025.pdf)
- ZPP: [FAQ Anbieter](https://www.zentrale-pruefstelle-praevention.de/faqs/anbieter/), [Präventionsangebot zertifizieren lassen](https://www.zentrale-pruefstelle-praevention.de/leistungen/praeventionsangebot-zertifizieren-lassen/), [Konzept einreichen](https://www.zentrale-pruefstelle-praevention.de/leistungen/konzept-fuer-einen-kurs-einreichen/)

> Hinweis: Diese Übersicht ist keine Rechtsberatung. Die ZPP-Einordnung (insbesondere 11.3) sollte vor dem Bau direkt mit der ZPP abgestimmt werden.
