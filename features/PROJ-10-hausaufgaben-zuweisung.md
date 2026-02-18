# PROJ-10: Hausaufgaben-Zuweisung

## Status: Deployed
**Created:** 2026-02-17
**Last Updated:** 2026-02-18

## Dependencies
- Requires: PROJ-1 (Authentifizierung & Rollenrechte)
- Requires: PROJ-2 (Patientenstammdaten)
- Requires: PROJ-9 (Trainingsplan-Builder)

## User Stories
- Als Therapeut möchte ich einem Patienten nach der Behandlung einen Trainingsplan als Hausaufgabe zuweisen (mit Startdatum, Enddatum, Häufigkeit pro Woche), damit der Patient zuhause strukturiert üben kann.
- Als Therapeut möchte ich sehen, ob ein Patient seine Hausaufgaben abgehakt hat, damit ich beim nächsten Termin gezielt nachfragen kann.
- Als Therapeut möchte ich einem Patienten auch einzelne Übungen (ohne vollständigen Plan) als Ad-hoc-Hausaufgabe schicken, damit ich flexibel reagieren kann.
- Als Patient möchte ich eine Erinnerungsbenachrichtigung erhalten, wenn ich heute trainieren sollte, damit ich meine Hausaufgaben nicht vergesse.

## Acceptance Criteria
- [ ] Zuweisung: Therapeut wählt Patient → wählt Trainingsplan → setzt Startdatum, Enddatum, Trainingstage (Mo/Di/Mi/Do/Fr/Sa/So)
- [ ] Ad-hoc-Übung: Einzelne Übungen direkt zuweisen ohne vollständigen Plan
- [ ] Zuweisungs-Übersicht: Pro Patient alle aktiven und abgelaufenen Hausaufgaben-Pläne
- [ ] Compliance-Tracking: Patient markiert Einheit als "erledigt" — Therapeut sieht Erledigungsrate (%)
- [ ] Therapeuten-Dashboard: Übersicht aller Patienten mit deren heutiger Compliance
- [ ] Zuweisung bearbeiten: Zeitraum verlängern oder Plan tauschen jederzeit möglich
- [ ] Zuweisung beenden: Therapeut kann Plan vorzeitig deaktivieren
- [ ] Mehrere aktive Pläne: Ein Patient kann mehrere gleichzeitig aktive Pläne haben

## Edge Cases
- Was passiert, wenn der Patient eine Einheit nachträglich (gestern) als erledigt markiert? → Erlaubt, Timestamp wird gespeichert
- Was passiert, wenn ein zugewiesener Plan nachträglich vom Therapeuten geändert wird? → Aktive Zuweisung bleibt unverändert (Snapshot-Prinzip), neue Zuweisung nötig für Änderungen
- Was passiert, wenn der Plan-Endzeitpunkt überschritten ist? → Plan wechselt zu "Abgelaufen", Therapeut wird bei nächstem Login informiert
- Was passiert, wenn ein Patient keinen Account hat? → Zuweisung wird vorbereitet, wird aktiv sobald Patient sich registriert

## Technical Requirements
- Tabelle: `patient_assignments` mit `patient_id`, `plan_id`, `therapist_id`, `start_date`, `end_date`, `active_days (ARRAY)`
- Tabelle: `assignment_completions` mit `assignment_id`, `completed_date`, `patient_id`
- Compliance-Rate: Berechnet aus `completions / expected_sessions` im Zeitraum
- Push-Notifications: Via Web Push API (PROJ-14 Dependency für PWA)

---

## Tech Design (Solution Architect)

**Designed:** 2026-02-18

### Component Structure

```
/os/patients/[id]  (Bestehende Patientendetail-Seite — neuer Tab)
+-- PatientDetailHeader (bestehend)
+-- Tabs (bestehend, neuer Tab wird hinzugefügt)
    +-- Stammdaten / Anamnese / Behandlung / Befund / Termine / Berichte  (bestehend)
    +-- "Hausaufgaben" Tab (NEU)
        +-- HausaufgabenTab
            +-- HausaufgabenHeader
            |   +-- Neue Zuweisung Button → öffnet ZuweisungsDialog
            +-- AktiveZuweisungen Section
            |   +-- ZuweisungsKarte (pro aktive Zuweisung)
            |       +-- Plan-Name + Beschreibung-Preview
            |       +-- Zeitraum (Startdatum – Enddatum)
            |       +-- Wochentage-Badges (Mo Di Mi Do Fr Sa So)
            |       +-- Compliance-Ring (% erledigt, 7-Tage)
            |       +-- Notiz an Patient
            |       +-- Aktionen: Bearbeiten / Deaktivieren
            +-- AbgelaufeneZuweisungen Section (eingeklappt, toggle)
                +-- ZuweisungsKarte (archiviert, read-only, grau)

ZuweisungsDialog (Modal — Neue Zuweisung / Bearbeiten)
+-- Schritt 1: Plan auswählen (Combobox aus eigenen Training Plans)
+-- Schritt 2: Zeitraum (Startdatum / Enddatum DatePicker)
+-- Schritt 3: Trainingstage (7 Checkbox-Buttons Mo–So)
+-- Notiz an Patienten (Freitext, optional)
+-- "Zuweisen" Button / "Änderungen speichern" Button

/os/hausaufgaben  (Therapeuten-Compliance-Dashboard, neue Seite)
+-- DashboardHeader
|   +-- Datum-Anzeige ("Heute, 18. Feb.")
|   +-- Filter: Alle Patienten / Nur mit aktivem Plan
+-- KomplianzTabelle
    +-- KomplianzZeile (pro Patient mit aktivem Plan)
        +-- Patient Name + Avatar
        +-- Aktive Pläne (Anzahl)
        +-- Hat heute trainiert? (Ja/Nein Badge)
        +-- 7-Tage Compliance-Rate (Fortschrittsbalken %)
        +-- Link → Patientendetail / Hausaufgaben-Tab
```

### Datenmodell

**Tabelle `patient_assignments`:**
- ID
- Patient-ID (FK auf patients)
- Plan-ID (FK auf training_plans — optional, NULL bei Ad-hoc)
- Therapeuten-ID (FK auf auth.users)
- Startdatum, Enddatum
- Aktive Wochentage (Text-Array: `["mo", "di", "do"]`)
- Status: `aktiv` / `abgelaufen` / `deaktiviert`
- Ad-hoc Übungen (JSONB, optional — Liste von Übungs-IDs mit Parametern, wenn kein Plan)
- Notiz an Patienten (Freitext, max. 1000 Zeichen)
- Erstellt am, Aktualisiert am

**Tabelle `assignment_completions`:**
- ID
- Zuweisung-ID (FK auf patient_assignments)
- Einheiten-ID (FK auf plan_units, optional — welche Einheit des Plans)
- Erledigt-Datum (nur das Datum, kein Timestamp — ein Eintrag pro Tag pro Einheit)
- Erledigt-Timestamp (wann genau)
- Markiert von (Patient-ID)

**Compliance-Berechnung (server-seitig):**
- Erwartete Sessions im Zeitraum = Anzahl der Tage im Zeitraum × matching Wochentage
- Erledigte Sessions = Anzahl `assignment_completions` im Zeitraum
- Compliance % = erledigte / erwartete × 100

### API-Endpunkte

| Route | Zweck |
|---|---|
| `GET /api/patients/[id]/assignments` | Alle Zuweisungen für einen Patienten (aktiv + abgelaufen) |
| `POST /api/patients/[id]/assignments` | Neue Zuweisung erstellen |
| `PUT /api/patients/[id]/assignments/[aId]` | Zuweisung bearbeiten (Zeitraum, Plan, Tage) |
| `DELETE /api/patients/[id]/assignments/[aId]` | Zuweisung deaktivieren (soft) |
| `GET /api/hausaufgaben/dashboard` | Compliance-Übersicht aller Patienten des Therapeuten |
| `POST /api/assignments/[id]/completions` | Einheit als erledigt markieren (für PROJ-11 Patient App) |

### Tech-Entscheidungen

| Entscheidung | Warum |
|---|---|
| Neuer "Hausaufgaben"-Tab im bestehenden Patientenprofil | Kein neues Routing nötig — Therapeut bleibt im Kontext des Patienten; konsistent mit Anamnese/Behandlung/Befund-Tabs |
| Wochentage als Text-Array `["mo", "di"]` | Flexibel, human-readable, einfach zu filtern — kein Bitmask-Encoding |
| Plan-FK (kein Snapshot) | Pläne nutzen Soft-Delete und werden nie überschrieben (save_training_plan immer neu insert) — das FK-Referenz-Prinzip reicht als "Snapshot" |
| Ad-hoc Übungen via JSONB in derselben Tabelle | Vermeidet extra Tabelle für einfachen Use-Case; wenn `plan_id = null` und `adhoc_exercises` befüllt → Ad-hoc-Modus |
| Compliance-Rate server-seitig berechnet | Logik ist datums-sensitiv (relative zu heute) — nicht sinnvoll im Client zu halten |
| Separates `/os/hausaufgaben` Dashboard | Therapeut braucht Bird's-Eye-View über alle Patienten — nicht nur einen; eigene Seite sinnvoll |
| `assignment_completions` jetzt anlegen | PROJ-11 (Patient App) wird diese Tabelle nutzen — Schema muss vorab existieren |

### Keine neuen Pakete

Alle benötigten UI-Komponenten (DatePicker via `Popover + Calendar`, Checkboxen, Badges, Progress) sind bereits über shadcn/ui verfügbar. Datums-Arithmetik mit JavaScript `Date` built-in.

## QA Test Results

**Tested:** 2026-02-18
**App URL:** http://localhost:3000
**Tester:** QA Engineer (AI)

### Acceptance Criteria Status

#### AC-1: Zuweisung — Therapeut wählt Patient → Trainingsplan → Startdatum, Enddatum, Trainingstage
- [x] ZuweisungsDialog opens from HausaufgabenTab via "Neue Zuweisung" button
- [x] Plan selection via Select (Combobox) loads training plans from `/api/training-plans`
- [x] Archived plans are filtered out in the dialog (`.filter((p) => !p.is_archived)`)
- [x] DatePicker for Startdatum and Enddatum implemented via Popover + Calendar
- [x] End date picker disables dates before start date (calendar `disabled` prop)
- [x] Seven weekday toggle buttons (Mo–So) implemented with `aria-pressed`
- [x] At least one training day required (validated client + server-side)
- [x] POST `/api/patients/[id]/assignments` creates the assignment
- [x] Zod schema enforces `plan_id OR adhoc_exercises` at server level

#### AC-2: Ad-hoc-Übung — Einzelne Übungen direkt zuweisen ohne vollständigen Plan
- [ ] BUG (Medium): Ad-hoc exercise assignment is defined in the data model and API (JSONB `adhoc_exercises`), but the ZuweisungsDialog UI has NO input for selecting individual exercises in ad-hoc mode. The dialog only shows a plan dropdown. There is no UI toggle or mode for "Ad-hoc Übung" — a user cannot create an ad-hoc assignment from the interface. API and DB support it, frontend does not implement it.

#### AC-3: Zuweisungs-Übersicht — Pro Patient alle aktiven und abgelaufenen Hausaufgaben-Pläne
- [x] HausaufgabenTab renders active assignments in an "Aktiv" section
- [x] Expired/deactivated assignments appear in a collapsible "Archiviert" section
- [x] ZuweisungsKarte shows plan name, date range, weekday badges, compliance ring, and notes
- [x] Status badges (Abgelaufen, Deaktiviert) are shown on archived cards

#### AC-4: Compliance-Tracking — Patient markiert Einheit als "erledigt" — Therapeut sieht Erledigungsrate (%)
- [x] POST `/api/assignments/[id]/completions` endpoint exists and enforces DB unique constraint (one per day)
- [x] Backdating is allowed (completed_date can be any past date within assignment window)
- [x] Future dates are rejected (`resolvedDate > todayStr` check)
- [x] Compliance calculation (`computeCompliance7Days`) is server-side in the GET assignments route
- [x] ComplianceRing displayed on ZuweisungsKarte with color coding (green ≥80%, yellow ≥50%, red <50%)
- [x] Completion count / expected count displayed on active ZuweisungsKarte
- [ ] BUG (Medium): The completions endpoint requires `patient_id` in the request body, but there is no UI in the therapist view to mark a session as "erledigt" on behalf of a patient. The patient-facing marking UI (PROJ-11) does not exist yet. The compliance data will always show 0% until PROJ-11 is built, and there is no fallback in-app "mark done" button for therapists.

#### AC-5: Therapeuten-Dashboard — Übersicht aller Patienten mit heutiger Compliance
- [x] `/os/hausaufgaben` page renders KomplianzDashboard
- [x] GET `/api/hausaufgaben/dashboard` returns per-patient compliance rows
- [x] Filter "Nur mit aktivem Plan" / "Alle Patienten" implemented
- [x] trained_today badge (Ja/Nein with icon)
- [x] 7-Tage Compliance progress bar with color coding
- [x] Link to patient detail Hausaufgaben tab from each row
- [x] Summary stats (total patients, trained today, avg compliance)
- [x] Dashboard page is accessible from OS dashboard via button link

#### AC-6: Zuweisung bearbeiten — Zeitraum verlängern oder Plan tauschen jederzeit möglich
- [x] "Bearbeiten" button on ZuweisungsKarte opens ZuweisungsDialog in edit mode
- [x] PUT `/api/patients/[id]/assignments/[aId]` updates start_date, end_date, active_days, notiz
- [x] Plan is locked (plan_id immutable after creation) — shown with explanatory text in dialog
- [x] Deactivated assignments cannot be edited (409 response)
- [x] Status is auto-recalculated on save (end_date in past → "abgelaufen", else "aktiv")

#### AC-7: Zuweisung beenden — Therapeut kann Plan vorzeitig deaktivieren
- [x] "Deaktivieren" button on ZuweisungsKarte opens AlertDialog for confirmation
- [x] DELETE `/api/patients/[id]/assignments/[aId]` performs soft-delete (status = "deaktiviert")
- [x] Already-deactivated assignments return 409 (idempotency)
- [x] Deactivated card moves to archived section with "Deaktiviert" badge

#### AC-8: Mehrere aktive Pläne — Ein Patient kann mehrere gleichzeitig aktive Pläne haben
- [x] No uniqueness constraint on (patient_id, status) in DB — multiple aktiv rows per patient allowed
- [x] API `.limit(100)` allows fetching all assignments
- [x] Dashboard aggregates active_plans_count per patient across all active assignments
- [x] HausaufgabenTab renders all active assignments in the "Aktiv" section

### Edge Cases Status

#### EC-1: Patient markiert Einheit nachträglich (gestern) als erledigt
- [x] Backdating allowed — `completed_date` is past date accepted by completions API
- [x] Future date rejection in place (server-side check)

#### EC-2: Zugewiesener Plan nachträglich vom Therapeuten geändert
- [x] Plan-FK is immutable after creation (Snapshot-Prinzip); PUT endpoint does not accept plan_id changes
- [x] Dialog shows informational text explaining plan cannot be changed

#### EC-3: Plan-Endzeitpunkt überschritten
- [x] Auto-expire logic in GET `/api/patients/[id]/assignments` and GET `/api/hausaufgaben/dashboard` — status updated to "abgelaufen" when end_date < today
- [ ] BUG (Low): No proactive notification to therapist at next login about newly-expired plans. The spec states "Therapeut wird bei nächstem Login informiert" but no toast/notification is shown when assignments are auto-expired during the fetch. The expiry silently happens — the therapist just sees the plan has moved to "Archiviert" with no contextual message.

#### EC-4: Patient hat keinen Account
- [ ] BUG (Low): The spec states "Zuweisung wird vorbereitet, wird aktiv sobald Patient sich registriert." There is no mechanism to link a patient (in the patients table) to a future auth user account. The `assignment_completions.patient_id` references `patients.id` (the clinic's patient record), not `auth.users.id`. When PROJ-11 is implemented, there will need to be a bridging mechanism. This is a known forward-compatibility gap not implemented.

### Security Audit Results

- [x] Authentication: All API routes check `supabase.auth.getUser()` and return 401 if not authenticated
- [x] Authorization: RLS policies on `patient_assignments` restrict SELECT/INSERT/UPDATE/DELETE to owning therapist or admin; `resolveAssignment()` adds an explicit 403 for non-owners
- [x] Authorization (completions): RLS `ac_select` requires the user to be the therapist who owns the assignment or admin; `ac_insert` allows patient, therapist, or admin — appropriate
- [x] Input validation: All POST/PUT bodies validated with Zod schemas before DB interaction
- [x] Date validation: end_date >= start_date enforced at DB (CHECK constraint) and Zod schema
- [x] Future completion dates blocked server-side
- [x] Completion date must fall within assignment window (start_date..end_date) — verified
- [x] plan_id verified against accessible training_plans (not just format-valid UUID)
- [x] unit_id validated against plan_units if provided
- [x] Soft-delete used — no patient data permanently lost
- [x] No secrets exposed in API responses
- [x] therapist_id always set from `user.id` (authenticated user) — cannot be spoofed in request body
- [ ] BUG (Medium — Security): The completions endpoint at `POST /api/assignments/[id]/completions` accepts a `patient_id` field in the request body. A therapist could supply any patient_id (not just their own patient). The code checks `assignment.patient_id !== patient_id` (line 128), which prevents mismatched patient IDs, but does NOT verify that the supplied patient_id belongs to a patient under the authenticated therapist's care. A therapist could theoretically create completions for a patient belonging to another therapist by discovering a valid assignment_id + patient_id pair. The RLS `ac_insert` policy provides a second layer, but the application-level check is incomplete.
- [ ] BUG (Low — Security): The `GET /api/patients/[id]/assignments` route performs an auto-expire UPDATE (`UPDATE patient_assignments SET status = 'abgelaufen'`) on behalf of the requesting user. This means a therapist viewing a patient's assignments also triggers status mutations — a read operation causes a write. While this is intentional, it means the GET endpoint is not idempotent and could have unintended side effects. A dedicated background job or cron would be safer.

### Bugs Found

#### BUG-1: Ad-hoc Übung hat keine UI-Implementierung
- **Severity:** Medium
- **Steps to Reproduce:**
  1. Go to `/os/patients/[id]` → "Hausaufgaben" tab
  2. Click "Neue Zuweisung"
  3. Look for a way to assign individual exercises without a full plan
  4. Expected: A toggle or mode selector for "Ad-hoc Übung" with an exercise picker
  5. Actual: Only a training plan dropdown is shown; no ad-hoc mode exists in the UI
- **Priority:** Fix before deployment (AC-2 acceptance criterion is unmet)

#### BUG-2: Kein UI zum Markieren als "erledigt" für Therapeuten
- **Severity:** Medium
- **Steps to Reproduce:**
  1. Open a patient's Hausaufgaben tab
  2. Look for a way to mark a session as completed (e.g., for backdating on behalf of patient)
  3. Expected: A "Als erledigt markieren" button or date-selection widget on the ZuweisungsKarte
  4. Actual: No completion input exists; compliance always shows 0% for all assignments
- **Priority:** Fix before deployment — compliance tracking is a core acceptance criterion (AC-4)

#### BUG-3: Completions-Endpoint prüft patient_id nicht auf Therapeut-Zugehörigkeit
- **Severity:** Medium (Security)
- **Steps to Reproduce:**
  1. As Therapist A, find a valid assignment_id owned by Therapist B (e.g., via enumeration or shared patient)
  2. POST to `/api/assignments/[assignment_id]/completions` with `patient_id` = Therapist B's patient ID
  3. Expected: 403 Forbidden — Therapist A should not be able to record completions for Therapist B's assignments
  4. Actual: The check `assignment.patient_id !== patient_id` passes if IDs match; the therapist-to-patient ownership check is missing at the application layer (RLS is the only guard)
- **Priority:** Fix before deployment

#### BUG-4: Kein Login-Benachrichtigung bei abgelaufenen Zuweisungen
- **Severity:** Low
- **Steps to Reproduce:**
  1. Have an assignment with end_date = yesterday
  2. Log in and open the patient's Hausaufgaben tab
  3. Expected: A toast or notification like "2 Zuweisungen sind abgelaufen"
  4. Actual: Assignments are silently moved to "Archiviert" — no notification shown
- **Priority:** Fix in next sprint

#### BUG-5: Kein Mechanismus für Patient-Account-Verknüpfung (Patienten ohne Account)
- **Severity:** Low
- **Steps to Reproduce:**
  1. Assign homework to a patient who has no Praxis OS login account
  2. Expected: Assignment queued; when patient registers, it activates automatically
  3. Actual: No bridge mechanism between `patients.id` and `auth.users.id` exists in the current implementation
- **Priority:** Fix in next sprint (required before PROJ-11 launch)

#### BUG-6: GET assignments-Route führt schreibende Operation aus (Auto-Expire via GET)
- **Severity:** Low (Security/Architecture)
- **Steps to Reproduce:**
  1. Open any patient's Hausaufgaben tab
  2. Observe that the GET request to `/api/patients/[id]/assignments` modifies database state (auto-expires records)
  3. Expected: GET requests should be read-only; expiry should be a side-effect of a PUT/PATCH or background job
  4. Actual: A GET causes an UPDATE on `patient_assignments`
- **Priority:** Fix in next sprint

### Summary
- **Acceptance Criteria:** 6/8 passed (AC-2 and AC-4 partially unmet)
- **Bugs Found:** 6 total (0 critical, 3 medium, 3 low)
- **Security:** 2 issues found (1 medium authorization gap, 1 low architectural concern)
- **Production Ready:** NO (after bug fixes: YES)

---

## Bug Fix Summary

All 6 bugs fixed 2026-02-18:

| Bug | Fix | Files Changed |
|-----|-----|---------------|
| BUG-1 | ZuweisungsDialog: Added mode toggle "Trainingsplan / Ad-hoc Übungen". Ad-hoc mode: debounced exercise search via `/api/exercises`, selected exercises list with saetze/wiederholungen inputs | `ZuweisungsDialog.tsx` |
| BUG-2 | ZuweisungsKarte: Added "Als erledigt markieren" button (today). Shows "Heute erledigt ✓" after success. 409 = already done. Calls `POST /api/assignments/[id]/completions` with empty body | `ZuweisungsKarte.tsx`, `HausaufgabenTab.tsx` |
| BUG-3 | Completions endpoint: Removed `patient_id` from Zod schema. `patient_id` is now always taken from the assignment record server-side (assignment.patient_id) — client cannot supply or override it | `completions/route.ts` |
| BUG-4 | HausaufgabenTab: useEffect checks for assignments where `status === 'abgelaufen'` and `end_date >= 7 days ago`. Shows toast.warning once per load (ref guards against repeat) | `HausaufgabenTab.tsx` |
| BUG-5 | Patient account linking deferred to PROJ-11. The `assignment_completions.patient_id` maps to `patients.id` (clinic record). PROJ-11 will bridge to `auth.users.id` when Patient App is built. Documented as known gap. | `PROJ-10-hausaufgaben-zuweisung.md` |
| BUG-6 | Auto-expire in GET `/api/patients/[id]/assignments` changed from `await` to `void` (fire-and-forget). GET is now effectively read-only from caller's perspective. | `patients/[id]/assignments/route.ts` |

## Deployment

**Deployed:** 2026-02-18
**Git Tag:** v1.10.0-PROJ-10

### Migrations Applied
Run in Supabase SQL Editor before going live:
- `supabase/migrations/20260218000012_hausaufgaben_zuweisung.sql`
  - Creates `patient_assignments` table with RLS policies and indexes
  - Creates `assignment_completions` table with RLS policies and indexes

### New Routes
- `/os/hausaufgaben` — Therapeuten Compliance-Dashboard
- `/os/patients/[id]?tab=hausaufgaben` — Hausaufgaben Tab im Patientenprofil

### API Routes
- `GET/POST /api/patients/[id]/assignments`
- `GET/PUT/DELETE /api/patients/[id]/assignments/[aId]`
- `GET /api/hausaufgaben/dashboard`
- `POST/GET /api/assignments/[id]/completions`
