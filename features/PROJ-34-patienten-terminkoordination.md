# PROJ-34: Patienten-Terminkoordination (Termine in Praxis OS sehen & verwalten)

## Status: In Progress
**Created:** 2026-06-20
**Last Updated:** 2026-06-20
**Phase 1 DEPLOYT 2026-06-20** (commit f1f79ed): Login-Provisionierung + Paywall-Flip +
`/app/termine`. E2E lokal getestet (Provisionierung + Idempotenz), live verifiziert.
Phase 2/3 blockiert bis Koordinations-API live (aktuell 404) + Test-`patientId`.
**Quelle:** Briefing des Buchungstool-Teams (`Termintool_Praxis-OS/.../PROJ-34-praxis-os-dev-briefing.md`)

> Nummerierung: Wir übernehmen die feature-übergreifende ID **PROJ-34** aus dem
> Buchungstool-Briefing (statt unserer internen nächsten 25), damit beide Teams
> dieselbe Referenz nutzen.

## Finaler Plan (eingefroren 2026-06-21)
Nach Abstimmung mit Max — das ist die verbindliche Soll-Architektur für Phase 2/3:

**1. Eigener, abgespeckter Bereich `/meine-termine`** (NICHT in der klinischen `/app`-Hülle).
Grund: Das E2E zeigte, dass `/app` einen „Termine-only"-Bucher unter Changelog-Modal →
Onboarding-Wizard → täglichem Check-in begräbt (alles Overlays, für ihn sinnlos). Daher
eigener minimaler Rahmen: kein Dashboard-Nav, kein Onboarding, kein Check-in.

Inhalt von `/meine-termine`:
  a) **Termine** (Live aus Koordinations-API): ansehen / umbuchen / stornieren.
  b) **Ausgegraute Voll-Abo-Feature-Vorschau** (Schloss-Kacheln): Trainingsplan, Therapeuten-
     Chat, tägliches Check-in & Fortschritt, Kurse/Wissen — Texte/Icons 1:1 aus der echten App.
  c) **Kontext-abhängiger Upsell-CTA** (siehe Punkt 2).

**2. „Bekannt vs. unbekannt" entscheidet den Einstieg** (Max-Regel):
  - **Unbekannt** = der Patient hatte noch KEINEN stattgefundenen Termin in der Praxis
    (keiner kennt ihn) → CTA = **„Video-Analyse buchen (69 €)"**. Das ist Pflicht-Assessment,
    damit ein Therapeut ihn kennenlernt und überhaupt einen Plan bauen kann.
  - **Bekannt** = hatte schon einen (stattgefundenen/abgeschlossenen) Termin → CTA =
    **„Behandlung fortsetzen — Abo, 1. Monat geschenkt"** (Stripe `setup-checkout`).
  - Technische Ableitung „bekannt": mindestens ein vergangener/abgeschlossener Termin.

**3. Abo-Aktivierung → Handoff im Ampelsystem** (PROJ-17):
  - Hook: Stripe-Webhook (`/api/webhooks/stripe`), wenn ein Bucher-Abo aktiv wird.
  - Das Ampelsystem ist ein **berechnetes** Therapeuten-Dashboard (`/os/ampel`, keine Alert-
    Tabelle) → Handoff als **neues berechnetes Signal**: „Voll-Abo-Patient ohne Plan → Plan
    erstellen / Patient anbinden". Kein DDL nötig.
  - Signal geht an den **zuständigen Therapeuten** (der den Patienten kennt); MVP = der
    zugeordnete `therapeut_id` (anfangs Admin/Praxis, die zuweist). Ausbau: Auto-Zuordnung
    aus dem gebuchten Termin (Buchungstool-Therapeut → Praxis-OS-Account, Namens-Mapping).
  - **Patient-Hinweis** nach Kauf: „Dein Therapeut richtet jetzt deinen Plan ein."

**Selbst-Tätigkeit der Features:** Challenges + Kurse laufen self-serve (sofort beim Upgrade).
NUR der Trainingsplan braucht den Therapeuten-Handoff (Punkt 3).

## Dependencies
- Requires: **PROJ-1** (Auth & Rollenrechte) — nutzt Rolle `patient`, `user_profiles`, `patients.user_id`.
- Requires/Erweitert: **PROJ-7** (Buchungstool-Integration) — der Booking-Webhook (`/api/webhooks/booking`) wird um Konto-Provisionierung erweitert; `appointments`-Tabelle existiert bereits.
- Nutzt Muster aus: **PROJ-19** (externe Käufer — passwortlose Konto-Provisionierung via `admin.createUser`) und dem Patienten-Invite-Flow.
- Externe Abhängigkeit: **Koordinations-API des Buchungstools** (`https://my-first-app-psi-seven.vercel.app/api/praxis-os/appointments/*`, Bearer `PRAXIS_OS_API_KEY`) — wird vom Buchungstool-Team bereitgestellt.

## Kontext
Patient:innen buchen Physio-Termine über das externe Buchungstool (Website-Widget/Chatbot).
Diese Termine sollen **in Praxis OS** sicht- und verwaltbar sein (ansehen, umbuchen,
stornieren), **ohne** dass der Patient dafür eine kostenpflichtige App-Funktion braucht.
Ziel: Praxis OS wird der **Standard-Zugang für jeden Glawe-Patienten** → natürliche Basis
für den späteren Abo-Upsell (16,99 €/Monat).

**Was wir schon haben (kein Neubau nötig):**
- `appointments`-Tabelle (keyed by `booking_system_appointment_id`, UNIQUE) + Patienten-Self-RLS (`appointments_select_patient_self` über `patients.user_id = auth.uid()`).
- Booking-Webhook verarbeitet `patient.created` + `appointment.*` und speichert die **Buchungstool-Patienten-UUID** bereits als `patients.booking_system_id`.
- Read-only Termin-Karte `MeineTermineKarte` auf dem Patienten-Dashboard (`/api/me/appointments`).

**Was fehlt (= dieses Feature):**
1. **Login** für webhook-erstellte Patienten (heute wird nur eine nackte `patients`-Zeile angelegt, kein Auth-User → kein Zugang).
2. **Dedizierte Termin-Seite** mit Live-Stand statt nur 3 Dashboard-Karten.
3. **Umbuchen/Stornieren-UI** + serverseitige Anbindung der Koordinations-API.
4. **Passwortloser Deep-Link-Einstieg** aus den Buchungstool-Mails.

## User Stories
- Als Patient:in möchte ich nach einer Buchung automatisch (ohne Registrierung) Zugang zu Praxis OS bekommen, um meine Termine zu sehen.
- Als Patient:in möchte ich alle meine kommenden und vergangenen Termine an einem Ort sehen (Datum, Uhrzeit, Leistung, Therapeut:in, Status).
- Als Patient:in möchte ich einen Termin selbst **umbuchen** (freien Slot wählen), ohne anzurufen.
- Als Patient:in möchte ich einen Termin selbst **stornieren**.
- Als Patient:in möchte ich aus einer Buchungstool-Mail per Klick direkt im Termin-Bereich landen (eingeloggt, ohne Passwort-Eingabe).
- Als Praxis möchte ich, dass Bestätigungs-/Storno-Mails **nur vom Buchungstool** kommen (keine Doppelmails aus Praxis OS).

## Acceptance Criteria
- [ ] Bei `patient.created` wird (idempotent) ein **login-fähiges Patientenkonto** angelegt/gemerged (Schlüssel: E-Mail), `role='patient'`, `status='aktiv'`, `patients.user_id` gesetzt, `booking_system_id` persistiert.
- [ ] Bestehende Patienten/Accounts mit gleicher E-Mail werden **nicht dupliziert**, sondern verknüpft (kein zweiter Account).
- [ ] Eine Seite `/app/termine` zeigt die Termine des eingeloggten Patienten — **Source of Truth = Live-Aufruf** der Koordinations-API (`POST /list`) beim Öffnen; Fallback = synchronisierte `appointments`-Kopie.
- [ ] „Umbuchen" zeigt freie Slots (`reschedule-slots`) und schreibt die Umbuchung (`reschedule`); „Stornieren" ruft `cancel`. Buttons respektieren `canReschedule`/`canCancel`.
- [ ] Alle Aufrufe der Koordinations-API laufen **ausschließlich serverseitig** (Bearer `PRAXIS_OS_API_KEY`, nie im Client) und übergeben die echte `patientId` des eingeloggten Patienten.
- [ ] Server prüft vor jedem Koordinations-Call, dass der Termin (`bookingId`) zum eingeloggten Patienten gehört (defense-in-depth zusätzlich zur 403-Prüfung des Buchungstools).
- [ ] Fehlercodes der API werden patientenfreundlich angezeigt (`slot_conflict` → „Slot gerade vergeben, bitte anderen wählen" + Slots neu laden; `holiday`, `not_reschedulable`, `already_cancelled`, …).
- [ ] Webhook-Verarbeitung ist **idempotent** gegen Echo-Events (`appointment.updated`/`cancelled` nach eigener API-Aktion → keine Fehler/Doppel-Effekte).
- [ ] Praxis OS sendet **keine** Termin-Mails (Buchungstool übernimmt das).
- [ ] Passwortloser Deep-Link führt eingeloggt auf `/app/termine`.
- [ ] Neue Env-Vars (`PRAXIS_OS_API_KEY`, ggf. Coordination-Base-URL) in `.env.local.example` dokumentiert; auf dem Server in **beiden** Env-Dateien gesetzt.

## Edge Cases
- `appointment.created` trifft **vor** dem zugehörigen `patient.created` ein → Termin puffern/per `booking_patient_id` nachverknüpfen (Briefing Section 2 Hinweis; mit Buchungstool-Team abstimmen).
- Patient bucht mit einer E-Mail, die bereits als Patient **oder** externer Käufer existiert → mergen/hochstufen (bestehender `upgradeBuyerToPatient`-Pfad), kein Zweitkonto.
- Slot wird zwischen Anzeige und Umbuchung vergeben → `slot_conflict` (409) freundlich behandeln, Slots neu laden.
- Patient storniert einen bereits stornierten Termin → `already_cancelled` (409) als neutralen Hinweis zeigen, nicht als Fehler.
- Umbuchung/Storno löst Echo-Webhook aus → idempotent verarbeiten (gleiche `id`+Status mehrfach möglich).
- Patient ohne `user_id` (Altbestand vor diesem Feature) öffnet Deep-Link → On-the-fly-Provisionierung/Verknüpfung per E-Mail.
- Zeitzone: Buchungstool liefert lokale Praxiszeit (Europe/Berlin), `scheduled_at` ist als `…Z` formatiert, meint aber lokale Zeit → **nicht** als UTC umrechnen, sonst Slot-Versatz (siehe offene Punkte).
- Koordinations-API nicht erreichbar/`PRAXIS_OS_API_KEY` fehlt → Seite zeigt die synchronisierte Kopie + Hinweis „Aktionen gerade nicht verfügbar", kein Hard-Fail.

## Technical Requirements
- **Security:** Auth/RLS-Änderungen erfordern explizite Freigabe (`.claude/rules/security.md`). `appointments`-Writes bleiben service-role-only — Patienten schreiben **nie** direkt, nur über die serverseitige Koordinations-Anbindung.
- **Auth:** Supabase Auth, Rolle `patient`. Passwortlose Erstanmeldung via `admin.generateLink` (magiclink/recovery).
- **Validation:** Zod auf allen neuen API-Inputs.
- **Secrets:** `PRAXIS_OS_API_KEY` server-only (kein `NEXT_PUBLIC_`).

---
<!-- Sections below: Tech Design (Solution Architect) -->

## Tech Design

### Grundidee / Datenfluss
```
Buchung (Website/Widget)
  └─► Buchungstool ──(Webhook patient.created / appointment.*)──► Praxis OS
                                                                    ├─ Konto provisionieren (Login)
                                                                    └─ appointments-Kopie pflegen
  Patient öffnet /app/termine in Praxis OS
        └─► Server ruft Koordinations-API (Bearer) ──► Buchungstool  (Live-Liste, Slots)
        └─► „Umbuchen/Stornieren" ─► Server ─► Koordinations-API ─► Buchungstool
                                                       └─(Echo-Webhook)─► Praxis OS (Kopie aktualisieren)
```
Praxis OS hält eine **synchronisierte Kopie** (für Dashboard-Karte/Offline-Fallback),
nutzt aber für die Termin-Seite den **Live-`list`-Endpunkt als Source of Truth**.

### Komponente 1 — Konto-Provisionierung (Webhook-Erweiterung)
`handlePatientCreated` in `src/app/api/webhooks/booking/route.ts` erweitern:
- Heute: bei neuem Patient nur nackte `patients`-Zeile (kein Login).
- Neu: Muster aus `src/app/api/buyer-accounts/route.ts` spiegeln —
  `serviceClient.auth.admin.createUser({ email, email_confirm: true, user_metadata: { role:'patient', patient_id } })`,
  `user_profiles`-Zeile (`role='patient'`, `status='aktiv'`) sicherstellen, `patients.user_id` setzen.
- `booking_system_id` (Buchungstool-UUID) wird bereits gespeichert — bestätigt ans Buchungstool-Team (Briefing Section 6).
- Bestehende E-Mail (Patient/externer Käufer) → vorhandenen `upgradeBuyerToPatient`-/Merge-Pfad nutzen, kein Zweitkonto.
- **Kein** Passwort-Versand durch uns; Zugang via Deep-Link (Komponente 4).
- **JEDER Bucher bekommt automatisch ein Konto** (Entscheidung 2026-06-20), aber in einem
  **gesperrten „Termine-only"-Zustand** (siehe Komponente 5): voller Patienten-App-Shell,
  aber alles außer dem Termin-Bereich ausgegraut/gesperrt, mit Self-Upsell aufs Abo.

### Komponente 2 — Termin-Seite `/app/termine`
- Neue Seite unter `src/app/app/termine/page.tsx` (Patienten-App, hinter Patienten-Auth/RLS).
- Beim Öffnen: serverseitig `POST /api/praxis-os/appointments/list` mit der `patientId` des eingeloggten Patienten (aus `patients.booking_system_id`), `scope` umschaltbar (upcoming/past/all).
- Rendert `appointments[]` (Datum, Start/Ende, Leistung, Therapeut, Status) + aktiviert Buttons über `canReschedule`/`canCancel`.
- Dashboard-Karte `MeineTermineKarte` bleibt (Kurzübersicht) → Link auf `/app/termine`.
- **Inkonsistenz beheben:** `/api/me/appointments` matcht Patienten per `email`, RLS per `user_id`. Auf `user_id` vereinheitlichen.

### Komponente 3 — Umbuchen/Stornieren (Server-Routen + UI)
- Neuer Lib-Wrapper `src/lib/booking-coordination.ts` (Vorlage: `src/lib/brevo.ts`): liest `process.env.PRAXIS_OS_API_KEY`, sendet `Authorization: Bearer …`, getypte Ergebnisse, fail-soft.
- Neue authentifizierte Routen (verifizieren Session, prüfen Termin-Eigentum via `user_id`, rufen dann den Wrapper):
  - `GET  /api/me/appointments/[bookingId]/reschedule-slots?month=YYYY-MM[&therapistId=]`
  - `POST /api/me/appointments/[bookingId]/reschedule`  `{ date, startTime, endTime, therapistId? }`
  - `POST /api/me/appointments/[bookingId]/cancel`
- UI: Umbuchen-Dialog (Monats-Kalender aus `availableDates` → Tages-Slots), Storno-Bestätigungsdialog. shadcn-Komponenten verwenden.

### Komponente 4 — Passwortloser Deep-Link
- Empfohlen: Buchungstool-Mails verlinken auf eine Praxis-OS-URL (Format mit Buchungstool-Team abstimmen). Praxis OS löst den Link in eine **eingeloggte** Session auf:
  - Variante A (empfohlen, da echtes Konto = Upsell-Basis): On-Demand `admin.generateLink({ type:'magiclink', email, options:{ redirectTo:'/app/termine' } })` → Patient landet eingeloggt.
  - Variante B (leichter, ohne Konto): `lead-jwt`-artiger signierter Token, der eine token-gated `/termine`-Ansicht öffnet. Schwächere Upsell-Basis → nur als Fallback.
- Entscheidung siehe „Offene Entscheidungen".

### Komponente 5 — „Termine-only"-Zustand + Self-Upsell (Paywall-Flip)
Entscheidung 2026-06-20: Jeder Bucher bekommt ein echtes Patientenkonto, das **abgespeckt**
ist (alles ausgegraut außer Termine) und sich **selbst** aufs Abo upgraden kann.

**Ist-Zustand der Paywall** (`supabase-middleware.ts:206-236`): für `role='patient'` auf
`/app/*` blockt sie nur, wenn ein Abo existiert UND nicht `active`/`trial` ist. **Kein
Abo-Datensatz = voller Zugang.** Das ist genau umgekehrt zu unserem Ziel.

**Änderung (sicherheitsrelevant → braucht Freigabe):**
- Booking-provisionierte Patienten ohne aktives Abo standardmäßig **sperren** statt durchlassen.
  Unterscheidung nötig (z. B. Flag `patients.account_origin='booking'` oder „kein Abo + via
  Webhook angelegt"), damit Bestandspatienten ohne Billing nicht versehentlich gesperrt werden.
- **`/app/termine` (+ `/api/me/appointments*`) wird paywall-exempt** → immer zugänglich.
- Alle übrigen `/app/*`-Bereiche: gesperrt → **Locked-Overlay/Ausgegraut** mit Upsell-CTA
  (UX: App-Shell sichtbar, Features als „mit Abo freischalten" markiert) statt hartem Redirect.

**Self-Upsell (Backend existiert bereits):**
- `/api/me/billing/setup-checkout` (Stripe) ist vorhanden — nur der CTA fehlt im Leerzustand.
- „Jetzt Abo starten (16,99 €/Monat)"-CTA in der Upsell-/Locked-Ansicht + auf `/app/abo`
  (heute steht dort nur „Therapeut schaltet frei").
- Nach erfolgreicher Subscription (`active`/`trial`) greift die Paywall automatisch nicht mehr
  → volle App. Kein zusätzlicher Freischalt-Schritt nötig.
- Erster Monat geschenkt (vgl. Schmerzcheck-Angebot) ggf. als `trial`/Promo abbilden — mit Stripe-Setup abstimmen.

### Idempotenz / Echo-Webhooks
- `appointment.updated`/`cancelled` nach eigener API-Aktion kommen als Webhook zurück. Upsert auf `booking_system_appointment_id` ist bereits idempotent — sicherstellen, dass Status-Updates ohne Seiteneffekte mehrfach verarbeitbar sind.

### Env-Vars
- `PRAXIS_OS_API_KEY` (vom Buchungstool-Team, server-only)
- ggf. `BOOKING_COORDINATION_BASE_URL` (Default = Prod-Vercel-URL)
- in `.env.local.example` dokumentieren; auf dem Server in **beiden** Env-Dateien setzen.

### Antworten auf die offenen Punkte des Buchungstools (Briefing Section 6)
- **`patientId` persistieren:** Ja — bereits als `patients.booking_system_id` gespeichert; wird auch am Login-Konto referenziert.
- **Deep-Link-URL-Struktur:** Vorschlag `https://wwwpraxis-os.com/app/termine` als Ziel; Auth-Übergabe per magiclink (Format finalisieren).
- **Event-Reihenfolge:** Wir sichern den Fall „appointment vor patient" über Pufferung/Nachverknüpfung ab — bitte bestätigen, ob das vorkommen kann.
- **Zeitzone:** Bitte ein sauberes TZ-Format klären (lokale Praxiszeit explizit, kein irreführendes `…Z`), um Slot-Versatz zu vermeiden.

## Build Order (Empfohlen)
```
Phase 1 — Zugang  (ohne PRAXIS_OS_API_KEY möglich)
  1. Webhook-Erweiterung: Konto-Provisionierung (Login) + Merge-Logik
  2. Passwortloser Deep-Link-Einstieg (magiclink → /app/termine)
  3. Paywall-Flip: Booking-Patienten ohne Abo sperren, /app/termine exempt  ← Freigabe nötig
Phase 2 — Ansehen  (braucht PRAXIS_OS_API_KEY)
  4. src/lib/booking-coordination.ts + /app/termine (Live-list) + Dashboard-Link
  5. /api/me/appointments auf user_id vereinheitlichen
Phase 3 — Self-Upsell
  6. Locked-Overlay/Ausgegraut-UI + „Jetzt Abo starten"-CTA (setup-checkout)
Phase 4 — Koordinieren
  7. reschedule-slots / reschedule / cancel (Server-Routen + UI)
  8. Fehlercode-Handling + Idempotenz-Härtung der Echo-Webhooks
Phase 5 — QA
  9. End-to-End mit Test-patientId + Test-Key des Buchungstool-Teams
```

## Getroffene Entscheidungen (2026-06-20)
1. **Auth:** Echtes Patientenkonto + Magiclink (Variante A). ✓
2. **Auto-Konto für ALLE Bucher:** Ja — jeder bekommt eins, im gesperrten „Termine-only"-Zustand mit Self-Upsell aufs Abo (Komponente 5). ✓
3. **Self-Upsell:** Patient schaltet die volle App durch eigenständigen Abo-Abschluss frei (kein Therapeut-Schritt). ✓

## Noch offen / Abhängigkeiten
- **`PRAXIS_OS_API_KEY`:** Max liefert nach (vom Buchungstool-Team). Wird erst ab Phase 2/3 (Live-Liste, Umbuchen/Stornieren) gebraucht — **Phase 1 startet ohne.**
- **Freigabe nötig (sicherheitsrelevant):** Der Paywall-Flip (Komponente 5) ändert das Patienten-Zugriffsverhalten + ggf. RLS → explizite Freigabe vor Umsetzung (`.claude/rules/security.md`).
- **Mit Buchungstool-Team klären:** Deep-Link-URL-Format, Zeitzonen-Format, Event-Reihenfolge (Briefing Section 6).
- **Stripe/Trial:** Wie „1. Monat geschenkt" abgebildet wird (trial vs. Promo), mit Billing-Setup abstimmen.
- **Backfill Bestandspatienten (Entscheidung Max 2026-06-20): erstmal NICHT.** Neue Buchungen
  (inkl. neue/externe Patienten) bekommen Konto + Auto-Zugangsmail wie deployt. Wenn der
  Backfill der bestehenden Buchungstool-Patienten kommt, dürfen diese **nicht** massenhaft
  unaufgefordert angemailt werden — Zugangsmail dann **kontrolliert**: vom Team gezielt
  (z. B. nach Gespräch, via `sendPatientAccessMail`) ODER erst bei deren nächster Buchung.
