# PROJ-26 — Praxis OS als 90-Tage-Programm (Neupositionierung)

> **Weg von „die App kostet etwas" — hin zu „die 90-Tage-Betreuung kostet etwas".**

**Status:** In Progress — Phase 1 + 2 **DEPLOYT 22.09.2026** (Commit 0e2c166), Phase 3–5 offen
**Stand:** 22.09.2026

---

## 1 · Warum

Patienten sahen bisher ein **Abo** — im Gesundheitswesen negativ besetzt. Damit
verkaufte Praxis OS die App statt der eigentlichen Leistung. Die App ist aber
nur das Auslieferungsmedium: die Schaltzentrale einer physiotherapeutischen
Fernbetreuung.

Die Neupositionierung ist **keine Erneuerung des Systems**. Die Funktionen
existieren alle. Was sich ändert, ist die Auslegung — und die Geldstrecke.

Shop, Challenges und Masterclass bleiben als eigenständige Produkte unberührt
daneben bestehen.

---

## 2 · Der neue Weg

1. Patient kommt über Werbung, bucht im Kalender auf physiotherapie-glawe.de
   eine **Videokonsultation, 69 €**, bezahlt dort.
2. 30 Minuten Video: Was ist das Problem? Wie behandeln wir es über Praxis OS?
   **Können wir es überhaupt aus der Ferne behandeln?** (Eignungsprüfung)
3. Passt es, bekommt der Patient im Call per Link/QR ein Angebot über **378 €**
   (Stripe, Karte oder Klarna) und zahlt direkt.
4. Zahlung → App öffnet sich → Therapeut legt den Plan an: **Micro-Übungen für
   jeden Tag** + **Trainingsplan für die Trainingstage**.
5. **Tägliches Kurz-Check-in** (3–4 Fragen), wöchentlich ausführlicher.
6. **Gestaffelte Video-Calls:** Woche 1–4 wöchentlich, 5–8 zweiwöchentlich,
   9–12 ein Zwischen-Call + Abschluss. 5 Calls, fest im Preis, werden bei
   Nichtwahrnehmung nachgeholt.
7. Nach 90 Tagen optional **Erhaltungsphase, 16,99 €/Monat** — schaltet
   Schreiben und neue Pläne wieder frei, **ohne Video-Calls**.

---

## 3 · Entscheidungen (verbindlich)

| Thema | Entscheidung |
|---|---|
| Gesamtpreis | 447 € — dargestellt als „447 € gesamt, davon 69 € beim Kennenlerntermin" |
| Zahlung Programm | 378 € per Stripe-Link/QR im Call; Klarna als Option (Raten nach Klarnas Bonitätsprüfung — **nie als feste Zusage bewerben**) |
| Umsatzsteuer | Programm + Konsultation: Heilpraktiker-Rechnung, **umsatzsteuerfrei (§ 4 Nr. 14a UStG)**. Erhaltungsphase: normale Rechnung mit **19 % USt** |
| Eignungsprüfung negativ | 69 € bleiben — die Beratung war die Leistung |
| Angebotsfrist | 48 Stunden; der **Link** läuft ab, der **Anspruch** nicht. Neu ausstellen per Klick. Harte Grenze: **6 Wochen** — danach ist der Befund zu alt, es braucht eine neue Konsultation |
| 90-Tage-Start | mit der Zahlung |
| Extra-Call bei Verschlechterung | inklusive, harte Red-Flag-Logik, **Reaktion am nächsten Werktag** |
| Chat | Antwort **24 h werktags** |
| Tag 91 | Verlauf lesbar, nichts Neues (keine Check-ins, kein Chat, keine neuen Pläne) |
| Masterclass | behält **keine** Begleitung mehr — reines Kursprodukt. Sonst käme man ohne Konsultation und ohne Red-Flag-Prüfung in die Betreuung |
| Kontrollpunkt | Das **Angebot** des Therapeuten, nicht die Einladung. Kein Selbst-Checkout |
| Zahlmethode hinterlegen | **entfällt** — im Programm gibt es nur eine Zahlung |
| Startseite | `/` wird die Programmseite |
| 69-€-Rechnung | vorerst manuell (automatisieren, wenn es Volumen gibt) |
| Nicht-Bucher | Nachfass-Mail nach **3 und 10 Tagen** |

---

## 4 · Phasen

### Phase 1 — Widersprüche beseitigen ✅ deployt

Das System verkaufte und verhielt sich noch nach dem alten Modell.

- **`/meine-termine`:** Abo-Upsell entfernt (`UpsellSection` → `ProgrammSection`),
  drei Zustände: Termin steht bevor → Vorbereitung · Konsultation war → „wie es
  weitergeht" · noch kein Termin → Buchungs-CTA. Kein Selbst-Checkout mehr.
- **`/api/me/billing/start-subscription`:** nur noch Erhaltungsphase. Ohne
  abgelaufenen Grant → 403. Kein Trial mehr.
- **Zugangsmail** (`patient-provisioning.ts`): bereitet auf die Konsultation vor
  statt eine Terminverwaltung anzukündigen. Auf Paper/Ink/Green/Serif umgestellt.
- **Dritter Zugangszustand:** `getAccessState()` in `lib/app-access.ts` ist die
  einzige Wahrheit. `programm_beendet` = Lesezugriff statt Rauswurf.
  Middleware **und** alle schreibenden `/api/me`-Routen fragen dieselbe Funktion.

### Phase 2 — Die 378 € ✅ deployt

- **Migration** `20260922000001_praxis_os_programm.sql`: neuer `contract_type`,
  `bereits_beglichen`, `programm_tage`, `stripe_session_id` (UNIQUE), `paid_at`.
- **`lib/programm.ts`** ist die einzige Preisquelle (447 / 69 / 378 / 90 Tage /
  48 h / 6 Wochen / 24 h Chat).
- **Vertragstext**: fünf Klauseln weichen beim Programm bewusst ab — Zahlung per
  Link statt Überweisung, Sitzungen werden nachgeholt statt zu verfallen,
  App-Zugang endet mit Tag 90 statt nach 30 Tagen Nachlauf, Anrechnung als eigener
  Satz, Klarna ohne Zusage.
- **`POST /api/os/programm-angebot`**: erzeugt Vertrag + 48-h-Token, mailt ihn,
  liefert Link **und QR-Code** (serverseitig gerendert). Guards: laufende
  Betreuung → 409, offenes Angebot → wird zurückgegeben statt verdoppelt,
  Neu-Ausstellen storniert das alte.
- **Angebotsseite** `/vertrag/<token>`: serverseitige Weiche zwischen Unterschrift
  (Bestandsverträge) und Zahlung (Programm). Preisaufstellung mit sichtbarer
  Anrechnung, ausklappbarer Vertrag, Pflicht-Checkbox Widerrufsverzicht.
- **`POST /api/contracts/<token>/checkout`**: protokolliert den Verzicht
  (Zeitstempel, IP, User-Agent), erzeugt die Stripe-Session **ohne**
  `UST_TAX_RATE_ID`.
- **Webhook-Zweig** → `aktiviereProgramm()`: Vertrag schließen (idempotent über
  `paid_at IS NULL`), Login sicherstellen, 90-Tage-Grant, Therapeutenzuweisung,
  Rechnungsentwurf, Benachrichtigung, Meta-Purchase.
- **`ProgrammCard`** im Patientenprofil: Status, Knopf, QR, Link kopieren.
- **Invite-Guard**: `/api/patients/[id]/invite` lehnt Patienten mit bestehendem
  Konto ab, statt `patients.user_id` zu nullen.

### Phase 3 — Programmerlebnis
Call-Fahrplan in der App · Verschlechterungs-Trigger an die Ampel (PROJ-17) ·
Tages-Check auf 3–4 rotierende Fragen + Wochen-Check.

### Phase 4 — Landingpage & Texte
Neue Journey auf `/` · alte Preise raus, **inklusive `lib/beschwerden.ts`**
(landet als FAQ-JSON-LD in Google) · CSP für den eingebetteten Kalender ·
HWG-Review.

### Phase 5 — Nachrüsten
Pre-Call-Check-Up (eigene, an den Termin gekoppelte Tabelle) ·
Erhaltungsphase verdrahten — **erst nach** Trennung der Rechnungsart in
`lib/billing/auto-invoice.ts` · Therapeuten-Zuweisung fürs Team.

---

## 5 · Offene Risiken

- **`auto-invoice.ts` stellt für jede Abo-Zahlung eine umsatzsteuerfreie
  GebüH-Rechnung aus** („Eingehende Beratung"). Für die Erhaltungsphase ist das
  falsch. Deshalb ist der Kauf-CTA im `ReadOnlyBanner` bewusst **nicht**
  verdrahtet — er käme sonst vor der Rechnungstrennung.
- **Zugangsmail läuft über GMX** (`sendEmail`), das laut Konvention internen
  Benachrichtigungen vorbehalten ist. Kundenmails gehen sonst über SiteGround.
  Zustellbarkeit lokal nicht prüfbar — offene Entscheidung.
- **GebüH-Ziffern sind offen.** Der Rechnungsentwurf trägt die
  Klartext-Positionen des Vertrages, aber keine Ziffern — welche Ziffern für
  Untersuchung, Beratung und Behandlung anzusetzen sind und wie sich der Betrag
  auf sie verteilt, entscheidet der Behandler. Deshalb `entwurf` statt
  automatischem Versand.
- **Red-Flag-Versprechen erzeugt eine Überwachungserwartung.** Reaktionsfenster
  (nächster Werktag) und die Notdienst-Grenze müssen an jedem Check-in sichtbar
  sein.
- **Bestandsdaten vor Deploy prüfen:** Gibt es bereits abgelaufene
  `app_access_grants` (Masterclass-Käufer)? Das sind die ersten Nutzer des
  neuen Lese-Zustands.
