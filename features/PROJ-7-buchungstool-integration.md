# PROJ-7: Buchungstool-Integration

## Status: In Progress
**Created:** 2026-02-17
**Last Updated:** 2026-02-18

## Dependencies
- Requires: PROJ-1 (Authentifizierung & Rollenrechte)
- Requires: PROJ-2 (Patientenstammdaten)

## User Stories
- Als Admin möchte ich Patienten aus dem bestehenden Buchungstool ins Praxis OS importieren, damit ich nicht alle Bestandspatienten manuell anlegen muss.
- Als Therapeut möchte ich in der Patientenakte die nächsten Termine des Patienten sehen, damit ich weiß, wann ich ihn wieder behandle.
- Als Therapeut möchte ich über das Praxis OS einen neuen Termin im Buchungstool anlegen können, ohne zwischen zwei Systemen wechseln zu müssen.
- Als Patient möchte ich in der Patienten-App meine gebuchten Termine sehen, damit ich immer auf dem aktuellen Stand bin.

## Acceptance Criteria
- [x] Import-Funktion: Neue Patienten werden automatisch per Webhook (`patient.created`) in Praxis OS angelegt — kein manueller CSV-Import notwendig (Tech Design: Webhook-Push statt CSV)
- [ ] Mapping: Name, E-Mail, Telefon, Geburtsdatum werden zugeordnet, Duplikate erkannt
- [ ] Termin-Anzeige: In der Patientenakte werden kommende Termine aus dem Buchungstool angezeigt (read-only)
- [ ] Patienten-App: Tab "Meine Termine" zeigt gebuchte Termine aus dem Buchungstool
- [ ] Link-Verknüpfung: Patient im OS ist mit Patient-ID im Buchungstool verknüpft (`booking_system_id` Feld)
- [ ] Neu-Termin-Button: Öffnet Buchungstool im neuen Tab mit vorbelegtem Patientennamen
- [ ] Sync-Indikator: Zeigt an, wann zuletzt synchronisiert wurde
- [ ] Fehlerbehandlung: Wenn Buchungstool nicht erreichbar, wird Fallback-Text angezeigt

## Edge Cases
- Was passiert, wenn der gleiche Patient unterschiedliche E-Mails im OS und Buchungstool hat? → Manuelle Verknüpfung durch Admin, Warnung bei Import
- Was passiert, wenn das Buchungstool offline ist? → Cached Termindaten (max. 24h alt) anzeigen mit Hinweis
- Was passiert, wenn ein Patient gelöscht wird? → Verknüpfung wird entfernt, Buchungstool-Daten bleiben unberührt

## Technical Requirements
- Integration-Art: Abhängig vom bestehenden Buchungstool (API-Key oder Webhook oder CSV-Import)
- Tabelle: `patients.booking_system_id` (nullable VARCHAR)
- Termin-Daten: In `appointments` Tabelle gecacht, TTL 24 Stunden
- Webhook-Empfänger: `/api/webhooks/booking` empfängt neue/geänderte Termine

---

## Tech Design (Solution Architect)

**Ansatz: Webhook-basierte Push-Integration**

Da das Buchungstool intern entwickelt wird, senden wir Daten aktiv per Webhook an Praxis OS — kein Polling, kein CSV-Import.

---

### A) Komponenten-Struktur

```
Admin-Bereich
+-- /os/admin/integrations (neu)
|   +-- WebhookConfigCard
|   |   +-- Webhook-URL (kopierbar)
|   |   +-- Webhook-Secret (kopierbar, einmalig sichtbar)
|   +-- WebhookEventLog
|       +-- Tabelle: Letzte 50 Events (Zeitstempel, Typ, Status, Payload-Vorschau)

Patienten-Detail
+-- TermineTab (ersetzt PlaceholderTab)
    +-- Termin-Liste (kommende Termine aus Cache)
    +-- Letzter Sync-Zeitstempel
    +-- "Termin buchen"-Button → öffnet Buchungstool im neuen Tab
```

---

### B) Datenmodell

**Erweiterung: `patients` Tabelle**
- Neues Feld: `booking_system_id` (TEXT, nullable) — verknüpft Patient im OS mit Patient-ID im Buchungstool
- Neues Feld: `booking_email` (TEXT, nullable) — E-Mail wie sie im Buchungstool hinterlegt ist (für Duplikat-Erkennung)

**Neue Tabelle: `appointments`**
- Cached Termindaten aus dem Buchungstool
- Felder: `id`, `patient_id` (FK → patients), `booking_system_appointment_id`, `scheduled_at`, `duration_minutes`, `therapist_name`, `service_name`, `status`, `synced_at`
- TTL-Konzept: 24 Stunden — nach Ablauf wird Fallback-Text angezeigt

**Neue Tabelle: `webhook_events`**
- Unveränderliches Audit-Log aller eingehenden Webhooks
- Felder: `id`, `event_type`, `received_at`, `payload` (JSONB), `processing_status` (`success`/`error`/`duplicate`), `error_message`
- Kein DELETE, kein UPDATE (DSGVO-Audit-Trail)

---

### C) Integrationsfluss

**Patient registriert sich im Buchungstool:**
1. Buchungstool sendet `POST /api/webhooks/booking` mit Event-Typ `patient.created`
2. Praxis OS prüft HMAC-Signatur (Webhook-Secret im `X-Webhook-Signature` Header)
3. E-Mail-basierte Duplikat-Erkennung: existiert bereits ein Patient mit dieser E-Mail?
   - **Neu:** Patient wird automatisch in `patients` Tabelle angelegt (Therapeut = Standard-Therapeut oder per Konfiguration)
   - **Duplikat:** `booking_system_id` wird im bestehenden Patienten verknüpft
4. Event wird in `webhook_events` geloggt

**Termin wird gebucht/geändert/storniert:**
1. Buchungstool sendet `POST /api/webhooks/booking` mit Event-Typ `appointment.created` / `appointment.updated` / `appointment.cancelled`
2. Signatur-Prüfung (wie oben)
3. `appointments` Tabelle wird aktualisiert (`synced_at` = NOW())
4. Event in `webhook_events` geloggt

---

### D) Sicherheit

- **HMAC-SHA256** Signaturprüfung bei jedem eingehenden Webhook
- Webhook-Secret wird beim ersten Setup generiert (einmalig im UI angezeigt, dann nur noch als Hash gespeichert)
- Idempotenz: `booking_system_appointment_id` verhindert doppelte Einträge bei Retry-Logik des Buchungstools
- Rate Limiting: max. 100 Webhook-Events pro Minute (HTTP 429 bei Überschreitung)

---

### E) API-Endpunkte

| Methode | Pfad | Beschreibung |
|---------|------|--------------|
| `POST` | `/api/webhooks/booking` | Empfängt Events vom Buchungstool (öffentlich, HMAC-gesichert) |
| `GET` | `/api/patients/[id]/appointments` | Holt gecachte Termine für einen Patienten |
| `GET` | `/api/admin/webhook-events` | Holt Event-Log (nur Admin) |
| `POST` | `/api/admin/webhook-secret/rotate` | Generiert neues Webhook-Secret (nur Admin) |

---

### F) Tech-Entscheidungen

- **HMAC statt Bearer Token:** Kryptografisch sicherer — schützt gegen Replay-Attacks
- **Daten cachen statt live abfragen:** Praxis OS braucht keine direkte API-Verbindung zum Buchungstool; das Buchungstool pusht Änderungen aktiv
- **Keine neuen Packages nötig:** HMAC via Node.js `crypto` (built-in), Rest mit bestehendem Supabase-Stack
- **Auto-Assign Therapeut:** Bei automatisch erstellten Patienten wird ein konfigurierbarer Standard-Therapeut zugewiesen (in Admin-Einstellungen wählbar)

---

### G) Migrations-Übersicht

1. `ALTER TABLE patients ADD COLUMN booking_system_id TEXT, ADD COLUMN booking_email TEXT`
2. `CREATE TABLE appointments (...)` mit RLS
3. `CREATE TABLE webhook_events (...)` mit RLS (nur Admin SELECT, kein DELETE/UPDATE)
4. Webhook-Secret wird als Umgebungsvariable `BOOKING_WEBHOOK_SECRET` gespeichert

## QA Test Results

**Tested:** 2026-02-18
**App URL:** http://localhost:3000
**Tester:** QA Engineer (AI)

### Acceptance Criteria Status

#### AC-1: Import-Funktion — Admin kann Patienten aus Buchungstool importieren (CSV oder API)
- [ ] BUG (AC-1): The spec lists "CSV or via API import" as a criterion, but the implementation is webhook-only (push-based). No CSV import functionality exists. The Tech Design intentionally replaced CSV with webhook-push, but the acceptance criterion was never updated. The patient dashboard `app/app/dashboard/page.tsx` shows "Meine Termine" as "Kommt bald (PROJ-7)" — no actual implementation. **See BUG-1.**

#### AC-2: Mapping — Name, E-Mail, Telefon, Geburtsdatum zugeordnet, Duplikate erkannt
- [x] Name (vorname, nachname), E-Mail, Telefon, Geburtsdatum are all mapped in `patientCreatedSchema` and the `handlePatientCreated` handler.
- [x] Duplicate detection via email: `.or(\`email.eq.${data.email},booking_email.eq.${data.email}\`)` checks both the OS email and the booking email fields.
- [ ] BUG (AC-2): The email-based OR filter in the duplicate lookup uses raw string interpolation in a Supabase `.or()` call: `.or(\`email.eq.${data.email},booking_email.eq.${data.email}\`)`. While Supabase uses parameterized queries under the hood for most operators, building a raw `.or()` string with unsanitised user input (from the webhook payload) is a security concern — a crafted email could manipulate the filter string. **See BUG-2.**
- [ ] BUG (AC-2): Edge case: when a patient has a different email in the OS vs. the booking tool, the spec requires a "warning at import" and "manual linking by admin". The webhook handler silently auto-links `booking_system_id` without any admin notification or warning UI. **See BUG-3.**

#### AC-3: Termin-Anzeige — Kommende Termine in Patientenakte (read-only)
- [x] `TermineTab` component is implemented and integrated in the patient detail page under the "Termine" tab.
- [x] Appointments are displayed read-only (no edit/delete controls).
- [x] Upcoming and past appointments are separated correctly via `isUpcoming()` and `status` filtering.
- [x] Sync timestamp is displayed below the heading.

#### AC-4: Patienten-App — Tab "Meine Termine"
- [ ] BUG (AC-4) HIGH: The patient app dashboard (`/app/dashboard`) shows "Meine Termine" as a disabled "Kommt bald (PROJ-7)" placeholder. The acceptance criterion requires this to be implemented, but no actual appointments tab or list exists in the patient-facing app. **See BUG-4.**

#### AC-5: Link-Verknüpfung — `booking_system_id` Feld
- [x] `booking_system_id` field exists in `patients` table (added in PROJ-2 migration) and is used throughout the webhook handler.
- [x] `booking_email` field added in PROJ-7 migration for duplicate detection.
- [x] `Patient` TypeScript interface includes `booking_system_id?: string | null`.

#### AC-6: Neu-Termin-Button — Öffnet Buchungstool mit vorbelegtem Patientennamen
- [x] "Termin buchen" button implemented in `TermineTab` as `<a href={bookingUrl} target="_blank" rel="noopener noreferrer">`.
- [x] Patient name is URL-encoded and appended as a query parameter (`?patient=` or `?name=`).
- [x] Opens in new tab (`target="_blank"`) with `rel="noopener noreferrer"` for security.
- [ ] BUG (AC-6) LOW: When `NEXT_PUBLIC_BOOKING_TOOL_URL` is not configured, the button href falls back to `"#"`, which navigates to the current page instead of showing an error or disabling the button. **See BUG-5.**

#### AC-7: Sync-Indikator — Zeigt letzten Synchronisationszeitpunkt
- [x] `lastSyncedAt` is computed from the most recent `synced_at` timestamp across all appointments.
- [x] Displayed as a human-readable relative time (e.g. "vor 5 Minuten", "vor 3 Stunden").
- [x] When no appointments exist, no sync timestamp is shown (correct — no misleading indicator).

#### AC-8: Fehlerbehandlung — Fallback-Text wenn Buchungstool nicht erreichbar
- [x] Since the integration is webhook-based (cached data), the "booking tool unreachable" scenario manifests as stale data, not a real-time connection error.
- [x] `isStale` flag correctly checks if the most recent `synced_at` is older than 24 hours and shows a yellow warning: "Die Termindaten sind älter als 24 Stunden."
- [x] When no `NEXT_PUBLIC_BOOKING_TOOL_URL` is configured and appointments are empty, a blue informational alert is shown explaining that the patient is not yet linked.
- [x] Error states from the API (500, 404) are shown via destructive `Alert` components.

---

### Edge Cases Status

#### EC-1: Patient mit unterschiedlichen E-Mails in OS und Buchungstool
- [ ] BUG (EC-1): Edge case requires "Manuelle Verknüpfung durch Admin, Warnung bei Import". The current webhook handler silently auto-links `booking_system_id` when a patient is found by email match, with no admin notification, no UI for manual linking, and no warning logged beyond the `webhook_events` audit log. While the event log captures the action, there is no admin alert or "requires review" mechanism. **Partially addressed via BUG-3.**

#### EC-2: Buchungstool offline
- [x] Since the architecture is push-based (webhook), "booking tool offline" means no new webhooks arrive. This is correctly handled via the 24-hour stale warning.
- [x] Stale detection logic: `isStale = lastSyncedAt !== null ? !isSynced(lastSyncedAt) : appointments.length > 0` — correctly flags stale state.

#### EC-3: Patient im OS gelöscht
- [x] Database migration defines `ON DELETE CASCADE` on `appointments.patient_id` — deleting a patient removes their cached appointments.
- [x] `booking_system_id` is cleared implicitly (patient row deleted). Booking tool data is untouched (correct).

---

### Security Audit Results

- [x] Authentication on webhook endpoint: The webhook endpoint (`POST /api/webhooks/booking`) is intentionally public but secured via HMAC-SHA256 signature verification. No session required.
- [x] HMAC timing-safe comparison: Uses `timingSafeEqual` from Node.js `crypto` to prevent timing attacks.
- [x] Webhook secret storage: Plaintext secret is stored in `webhook_config` table, protected by RLS `USING (false)` — only service role can access it. Environment variable fallback (`BOOKING_WEBHOOK_SECRET`) for initial setup.
- [x] Rate limiting: 100 events per minute per IP enforced in the webhook route.
- [x] Authentication on all protected API routes: `GET /api/patients/[id]/appointments`, `GET /api/admin/webhook-events`, and `POST /api/admin/webhook-secret/rotate` all verify `supabase.auth.getUser()` and return 401 if unauthenticated.
- [x] Authorization on webhook events log: Admin role check is performed server-side via `user_profiles.role` comparison, not just via RLS.
- [x] Idempotency: `UNIQUE` constraint on `booking_system_appointment_id` prevents duplicate appointment rows on webhook retries.
- [x] RLS on `appointments`: Therapists can only SELECT appointments for their own patients. INSERT/UPDATE/DELETE are blocked for all user roles (service role only).
- [x] RLS on `webhook_events`: Admin-only SELECT. INSERT/UPDATE/DELETE blocked for all user roles.
- [x] RLS on `webhook_config`: All access blocked via RLS (`USING (false)`). Service role bypasses.
- [x] No secrets in browser bundle: `BOOKING_WEBHOOK_SECRET` and `SUPABASE_SERVICE_ROLE_KEY` are server-only (no `NEXT_PUBLIC_` prefix).
- [x] `rel="noopener noreferrer"` on external booking tool link.
- [ ] BUG (Security) MEDIUM: The admin integrations page (`/os/admin/integrations`) is a client-rendered page with no server-side role check or middleware protection. While the API endpoints themselves enforce admin-only access, a logged-in non-admin therapist can navigate directly to `/os/admin/integrations` and see the Webhook URL and the "Neues Secret generieren" button. The button call will be blocked by the API, but the webhook URL itself is visible, which reveals the endpoint path. **See BUG-6.**
- [ ] BUG (Security) MEDIUM: In-memory rate limiting (`rateLimitMap`) is per-process. On Vercel's serverless edge, each cold start has a fresh map, meaning the 100-request-per-minute limit does not hold across concurrent serverless instances. A distributed attacker can bypass it by hitting multiple instances simultaneously. The spec acknowledges this with "For production, replace with Redis / Upstash" — but it remains an active risk. **See BUG-7.**
- [ ] BUG (Security) LOW: The webhook error response at line 447 returns `status: 200` with `status: "error"` and the `errorMessage` in the JSON body for processing errors. This includes potentially internal database error messages (`lookupError.message`, `upsertError.message`) which may leak schema information (table names, column names) to the webhook caller. **See BUG-8.**

---

### Bugs Found

#### BUG-1: CSV-Import nicht implementiert — Acceptance Criterion nicht erfüllt
- **Severity:** Medium
- **Steps to Reproduce:**
  1. Check AC-1: "Admin kann Patientenliste als CSV oder via API importieren."
  2. Look for any CSV import UI in `/os/admin/integrations` or elsewhere.
  3. Expected: A CSV upload or bulk import mechanism.
  4. Actual: Only webhook-push integration exists. No CSV import. The spec's AC was not updated to reflect the Tech Design decision.
- **Priority:** Fix in next sprint (update acceptance criterion to reflect webhook-only design, OR implement CSV fallback)

#### BUG-2: Unsanitised email interpolation in Supabase .or() filter
- **Severity:** Medium
- **Steps to Reproduce:**
  1. Send a webhook `patient.created` event with a crafted email such as `a@b.com,booking_email.eq.admin@praxis.de`.
  2. The `.or()` call in `handlePatientCreated` constructs: `email.eq.a@b.com,booking_email.eq.admin@praxis.de,booking_email.eq.a@b.com,booking_email.eq.admin@praxis.de`.
  3. Expected: Only the submitted email is checked.
  4. Actual: The crafted email value could inject additional OR conditions, potentially matching unintended patients.
- **File:** `src/app/api/webhooks/booking/route.ts` line 210
- **Priority:** Fix before deployment

#### BUG-3: No admin notification for email mismatch / manual linking requirement
- **Severity:** Medium
- **Steps to Reproduce:**
  1. A patient exists in Praxis OS with email `old@mail.com`.
  2. The same person registers in the booking tool with email `new@mail.com`.
  3. A `patient.created` webhook arrives for `new@mail.com`.
  4. Expected: Admin is warned and must manually link the accounts (per edge case spec).
  5. Actual: No patient match found (different email) — a **new duplicate patient** is auto-created. No admin warning is generated.
- **Priority:** Fix before deployment

#### BUG-4: Patienten-App "Meine Termine" not implemented
- **Severity:** High
- **Steps to Reproduce:**
  1. Log in as a patient and navigate to `/app/dashboard`.
  2. Click "Meine Termine".
  3. Expected: A list of the patient's booked appointments from the booking tool.
  4. Actual: The button is disabled with label "Kommt bald (PROJ-7)". No appointments view exists in the patient-facing app.
- **File:** `src/app/app/dashboard/page.tsx` line 53-57
- **Priority:** Fix before deployment

#### BUG-5: "Termin buchen" button falls back to "#" when env var missing
- **Severity:** Low
- **Steps to Reproduce:**
  1. Ensure `NEXT_PUBLIC_BOOKING_TOOL_URL` is not set in environment.
  2. Open any patient's "Termine" tab.
  3. Click "Termin buchen".
  4. Expected: An error message or disabled button with explanation.
  5. Actual: The anchor `href` is `"#"`, which navigates to the same page (no-op or scroll-to-top).
- **File:** `src/components/patients/TermineTab.tsx` lines 113-115
- **Priority:** Fix in next sprint

#### BUG-6: Admin integrations page accessible by non-admin authenticated users
- **Severity:** Medium
- **Steps to Reproduce:**
  1. Log in as a Physiotherapeut (non-admin role).
  2. Navigate directly to `/os/admin/integrations`.
  3. Expected: Redirect to 403/access denied, or role-guarded server-side.
  4. Actual: Page renders, showing the webhook URL read-only field and the "Neues Secret generieren" button. API calls from non-admins are blocked, but the UI is accessible.
- **File:** `src/app/os/admin/integrations/page.tsx` — no role check
- **Priority:** Fix before deployment

#### BUG-7: In-memory rate limiting ineffective in serverless environment
- **Severity:** Medium
- **Steps to Reproduce:**
  1. Deploy to Vercel (serverless).
  2. Send 200 simultaneous webhook requests from different IPs hitting different serverless instances.
  3. Expected: Rate limiting enforced globally (max 100/min).
  4. Actual: Each serverless instance has its own `rateLimitMap`; the limit is not enforced across instances.
- **File:** `src/app/api/webhooks/booking/route.ts` lines 27-46
- **Note:** Acknowledged in code comment; must be addressed before production at scale.
- **Priority:** Fix before deployment

#### BUG-8: Internal DB error messages exposed in webhook error response body
- **Severity:** Low
- **Steps to Reproduce:**
  1. Trigger a processing error in the webhook handler (e.g. DB schema mismatch).
  2. Examine the JSON response body.
  3. Expected: A generic error message without internal details.
  4. Actual: `message` field contains the raw Supabase/PostgreSQL error string, which may include table names and column names.
- **File:** `src/app/api/webhooks/booking/route.ts` lines 443-455
- **Priority:** Fix in next sprint

---

### Summary
- **Acceptance Criteria:** 5/8 passed (AC-1 not met, AC-4 not implemented, AC-2 partial)
- **Bugs Found:** 8 total (0 critical, 2 high, 4 medium, 2 low)
  - High: BUG-4 (Patienten-App "Meine Termine" not implemented)
  - High: BUG-2 (OR filter injection risk) — reclassified as Medium due to Supabase's internal handling but warrants a fix
  - Medium: BUG-1 (AC mismatch: CSV import not implemented), BUG-3 (no admin notification for email mismatch), BUG-6 (admin page accessible by non-admins), BUG-7 (in-memory rate limiting)
  - Low: BUG-5 (booking URL fallback to "#"), BUG-8 (internal error message exposure)
- **Security:** Issues found — BUG-2 (filter injection), BUG-6 (page auth), BUG-7 (rate limiting bypass), BUG-8 (error message leakage)
- **Production Ready:** NO
- **Recommendation:** Fix BUG-4 (Patienten-App), BUG-2 (OR injection), BUG-3 (missing admin notification), and BUG-6 (admin page access control) before deployment. BUG-7 requires a Redis/Upstash solution for production-scale serverless deployment.

## Deployment
_To be added by /deploy_
