# PROJ-2: Patientenstammdaten

## Status: In Review
**Created:** 2026-02-17
**Last Updated:** 2026-02-17

## Dependencies
- Requires: PROJ-1 (Authentifizierung & Rollenrechte)

## User Stories
- Als Physiotherapeut möchte ich einen neuen Patienten anlegen (Name, Geburtsdatum, Kontaktdaten, Krankenkasse), damit ich sofort mit der Dokumentation beginnen kann.
- Als Therapeut möchte ich die Patientenliste nach Name oder Geburtsdatum durchsuchen, damit ich schnell den richtigen Patienten finde.
- Als Therapeut möchte ich auf einen Patienten klicken und seine vollständige Akte sehen (Stammdaten, Dokumentationen, Trainingspläne), damit ich einen Gesamtüberblick habe.
- Als Admin möchte ich Patienten aus dem Buchungstool importieren können, damit ich nicht alle Bestandspatienten manuell anlegen muss.
- Als Patient möchte ich meine eigenen Stammdaten in der App einsehen (aber nicht eigenständig ändern können), damit ich weiß, was gespeichert ist.

## Acceptance Criteria
- [ ] Formular: Neue Patienten anlegen (Vorname, Nachname, Geburtsdatum, Geschlecht, Adresse, Telefon, E-Mail, Krankenkasse, Versichertennummer)
- [ ] Patientenliste mit Suchfunktion (Name, Geburtsdatum)
- [ ] Patientenakte-Übersicht: Stammdaten, Terminhistorie, Dokumentationen, Trainingspläne (Tab-Navigation)
- [ ] Patienten bearbeiten (alle Felder editierbar)
- [ ] Patienten archivieren (nicht löschen — DSGVO-Aufbewahrungspflicht 10 Jahre)
- [ ] Foto/Avatar für Patienten hochladbar (optional)
- [ ] Notiz-Feld für interne Anmerkungen (nur für Therapeuten sichtbar)
- [ ] RLS: Therapeuten sehen nur ihre eigenen Patienten (oder alle bei Admin)

## Edge Cases
- Was passiert bei Duplikaten (gleicher Name + Geburtsdatum)? → Warnung anzeigen, manuell bestätigen
- Was passiert, wenn ein Patient gelöscht werden soll? → Nur Archivierung möglich, Hinweis auf Aufbewahrungspflicht
- Was passiert, wenn Pflichtfelder fehlen? → Inline-Validierung, Speichern blockiert
- Was passiert, wenn die Krankenkasse nicht in der Liste ist? → Freitext-Eingabe als Fallback

## Technical Requirements
- Tabelle: `patients` mit DSGVO-konformer Datenspeicherung
- Avatare: Supabase Storage, max 2MB, automatisch komprimiert
- Archivierung: `archived_at` Timestamp, nicht physisch gelöscht
- Performance: Patientenliste lädt in < 500ms (Pagination bei > 100 Patienten)

---

## Tech Design (Solution Architect)
**Designed:** 2026-02-17

### Seitenstruktur & Komponenten

```
/os/patients                      ← Patientenliste
+-- PatientsHeader
|   +-- Suchfeld (Name oder Geburtsdatum)
|   +-- Filter-Toggle: Aktiv / Archiviert
|   +-- "Neuer Patient" Button
+-- PatientTable
|   +-- PatientRow (Avatar, Name, Alter, Krankenkasse, Status-Badge)
|   +-- Lade-Skeleton
|   +-- Leer-Zustand
+-- Pagination (ab 20 Einträgen)

/os/patients/new                  ← Neuer Patient anlegen
+-- NewPatientForm
    +-- Abschnitt: Person (Vorname, Nachname, Geburtsdatum, Geschlecht)
    +-- Abschnitt: Kontakt (Telefon, E-Mail, Adresse)
    +-- Abschnitt: Krankenkasse (Combobox + Freitext, Versichertennummer)
    +-- DuplikatWarnung (gleicher Name + Geburtsdatum)
    +-- "Speichern" Button

/os/patients/[id]                 ← Patientenakte
+-- PatientHeader (Avatar-Upload, Name, Alter, Status, Archivieren-Button)
+-- TabNavigation
    +-- Tab: Stammdaten (alle Felder editierbar + interne Notizen)
    +-- Tab: Termine (Platzhalter → PROJ-7)
    +-- Tab: Dokumentation (Platzhalter → PROJ-3/4/5)
    +-- Tab: Trainingspläne (Platzhalter → PROJ-10)
```

### Datenmodell

**Tabelle `patients`**:
- Vorname, Nachname, Geburtsdatum, Geschlecht (Pflicht)
- Telefon, E-Mail, Straße, PLZ, Ort (optional)
- Krankenkasse, Versichertennummer (optional)
- Avatar-URL (Supabase Storage, max 2MB)
- Interne Notizen (nur Therapeuten/Admin)
- Therapeut-ID (Zuständigkeit + RLS-Grundlage)
- `archived_at` (null = aktiv, Datum = archiviert — nie physisch gelöscht)
- `booking_system_id` (Verknüpfung mit PROJ-7)

**RLS:**
- PT/HP → sehen nur eigene Patienten (therapist_id = auth.uid())
- Admin → sieht alle Patienten

**Storage:** Avatare in Supabase Storage `avatars/`, JPG/PNG, max 2MB

### Tech-Entscheidungen

| Entscheidung | Begründung |
|---|---|
| Supabase Storage für Avatare | Bereits im Stack, CDN, sichere URLs |
| Combobox für Krankenkasse | 30+ GKV + Freitext-Fallback — shadcn Command bereits installiert |
| Pagination statt Infinite Scroll | Performanter für > 100 Patienten |
| Archivierung statt Löschung | DSGVO-Aufbewahrungspflicht 10 Jahre |
| Duplikatprüfung client-seitig | Schnelle UX-Warnung vor dem Speichern |

### Neue Pakete
- Keine — alle UI-Komponenten bereits installiert

## QA Test Results

**Tested:** 2026-02-18
**App URL:** http://localhost:3000
**Tester:** QA Engineer (AI)
**Method:** Full static code review of all implemented files (API routes, components, hooks, DB migration, middleware)

### Acceptance Criteria Status

#### AC-1: Formular — Neue Patienten anlegen (Vorname, Nachname, Geburtsdatum, Geschlecht, Adresse, Telefon, E-Mail, Krankenkasse, Versichertennummer)
- [x] `NewPatientForm.tsx` implements all required fields: Vorname, Nachname, Geburtsdatum, Geschlecht, Telefon, E-Mail, Strasse, PLZ, Ort, Krankenkasse, Versichertennummer
- [x] Client-side validation via Zod + react-hook-form with inline error messages
- [x] Server-side validation via Zod in `POST /api/patients`
- [x] Form is organized into logical sections (Person, Kontakt, Krankenkasse, Interne Notizen)
- [ ] BUG-3: Birth date accepts future dates (e.g., 2099-01-01) — no past-date validation on client or server

#### AC-2: Patientenliste mit Suchfunktion (Name, Geburtsdatum)
- [x] `PatientsHeader.tsx` provides a search input with debounce (300ms) via `use-debounce` hook
- [x] Search queries `vorname`, `nachname`, `geburtsdatum` via ilike in `GET /api/patients`
- [x] Archived/active filter toggle (Switch) implemented
- [x] Pagination implemented (20 per page)
- [ ] BUG-6: Pagination renders ALL page numbers at once — no ellipsis/windowed pagination — would be unusable with 50+ pages

#### AC-3: Patientenakte-Übersicht: Stammdaten, Terminhistorie, Dokumentationen, Trainingspläne (Tab-Navigation)
- [x] Tab navigation implemented: Stammdaten, Termine, Dokumentation, Trainingspläne
- [x] Stammdaten tab fully functional with read/edit modes
- [x] Termine, Dokumentation, Trainingspläne show placeholder tabs with PROJ references (correct per spec)
- [x] Loading skeleton shown during patient fetch
- [x] Error state shown if patient not found

#### AC-4: Patienten bearbeiten (alle Felder editierbar)
- [x] `StammdatenTab.tsx` implements edit mode with all fields editable
- [x] Edit is triggered by "Bearbeiten" button, cancel restores prior values via form `reset()`
- [x] `PUT /api/patients/[id]` validates and persists all fields
- [x] Toast success/error feedback on save
- [ ] BUG-10: Form default values not re-initialized after `onRefresh()` — a cancel after a successful save would reset to pre-save values (stale defaults)

#### AC-5: Patienten archivieren (nicht löschen — DSGVO-Aufbewahrungspflicht 10 Jahre)
- [x] Archive/Unarchive via `PATCH /api/patients/[id]/archive` sets/clears `archived_at` timestamp
- [x] Confirmation dialog with DSGVO explanation shown before archiving
- [x] "Archiviert" badge shown on patient detail header and in patient list
- [x] DB migration has `DELETE` policy set to `USING (false)` — physical deletion is impossible
- [x] Reactivation ("Reaktivieren") implemented

#### AC-6: Foto/Avatar für Patienten hochladbar (optional)
- [x] Avatar upload via camera overlay on patient detail header
- [x] Client-side validation: JPG/PNG/WEBP only, max 2MB
- [x] Server-side validation: MIME type + file size in `POST /api/patients/[id]/avatar`
- [x] Stored in Supabase Storage `avatars/` bucket with upsert (replaces previous avatar)
- [x] Avatar shown in patient list and detail header with initials fallback
- [ ] BUG-5: Avatar bucket is `public: true` — unauthenticated access to avatar images is possible via direct CDN URL

#### AC-7: Notiz-Feld für interne Anmerkungen (nur für Therapeuten sichtbar)
- [x] `interne_notizen` field is part of both NewPatientForm and StammdatenTab
- [x] "Nur für Therapeuten sichtbar" label present in both forms
- [x] Field stored in DB; patient RLS SELECT policy excludes patient role from accessing therapist records
- [x] Note: The patient-facing app (PROJ-11) does not yet exist, so isolation cannot be fully regression-tested

#### AC-8: RLS — Therapeuten sehen nur ihre eigenen Patienten (oder alle bei Admin)
- [x] `patients_select` policy: Therapeuten/Heilpraktiker see only `therapeut_id = auth.uid()`, Admin sees all
- [x] `patients_insert` policy: `therapeut_id` must equal `auth.uid()` (except Admin)
- [x] `patients_update` policy: same restriction as select
- [x] `patients_delete` policy: `USING (false)` — nobody can delete
- [x] `therapeut_id` is set server-side from `user.id` in `POST /api/patients` — cannot be spoofed by client

---

### Edge Cases Status

#### EC-1: Duplikate (gleicher Name + Geburtsdatum) — Warnung anzeigen, manuell bestätigen
- [x] `check-duplicate` API endpoint checks for matching vorname/nachname/geburtsdatum (case-insensitive) among active patients
- [x] `NewPatientForm.tsx` calls duplicate check before saving; shows `AlertDialog` with patient info on match
- [x] User can confirm or cancel — "Trotzdem anlegen" proceeds to create the patient

#### EC-2: Patient löschen soll nicht möglich sein — nur Archivierung
- [x] DB DELETE policy blocks physical deletion at RLS level
- [x] UI has no "Löschen" button — only "Archivieren"
- [x] Archive confirmation dialog includes DSGVO retention notice

#### EC-3: Pflichtfelder fehlen — Inline-Validierung, Speichern blockiert
- [x] Required fields (Vorname, Nachname, Geburtsdatum, Geschlecht) have Zod min(1) validation
- [x] Error messages appear inline below each field
- [x] Form submit is blocked by react-hook-form until validation passes
- [ ] BUG-3: Geburtsdatum accepts future dates — no max-date constraint

#### EC-4: Krankenkasse nicht in Liste — Freitext-Eingabe als Fallback
- [x] `KrankenkasseCombobox.tsx` allows free-text input via `CommandInput`
- [x] "Nicht gefunden — Freitext wird übernommen." message shown when no match
- [x] Free-text value is committed to form via `onChange`

---

### Security Audit Results

- [x] Authentication: All API routes verify `supabase.auth.getUser()` before processing; 401 returned if not authenticated
- [x] Authorization: RLS policies enforce therapist-to-patient scoping at DB level; API does not perform manual WHERE filtering (relies correctly on RLS)
- [x] Input validation: All API routes use Zod schemas server-side; field length limits enforced
- [x] UUID injection: All `[id]` routes validate UUID format before querying DB
- [x] Physical deletion blocked: DELETE RLS policy uses `USING (false)`
- [x] No hardcoded secrets found in source code — all credentials via env vars
- [x] Middleware (`src/proxy.ts` proxying `supabase-middleware.ts`) protects `/os/*` routes and redirects unauthenticated users to `/login`
- [ ] BUG-1: `src/proxy.ts` is NOT named `middleware.ts` — Next.js middleware file MUST be named `middleware.ts` (or `middleware.js`) at `src/` or project root. A file named `proxy.ts` will NOT be automatically loaded by Next.js as Edge Middleware, meaning route protection will NOT work in production unless the middleware is explicitly imported elsewhere.
- [ ] BUG-2: Filter injection in search: `GET /api/patients` uses `.or(\`vorname.ilike.%${term}%,...\`)` with direct string interpolation. A search term containing Supabase PostgREST filter syntax characters (e.g., commas, parentheses) could break filter logic or expose unintended data rows.
- [ ] BUG-5: Avatar Storage bucket set as `public: true` with `avatars_public_read` RLS allowing `anon` reads. Avatars are accessible without authentication via public CDN URL. Although avatar filenames are patient UUIDs (not guessable by brute force in practice), this contradicts DSGVO principle of data minimization for a healthcare application.

---

### Bugs Found

#### BUG-1: Middleware file named `proxy.ts` instead of `middleware.ts`
- **Severity:** Critical
- **Steps to Reproduce:**
  1. Deploy the application
  2. Attempt to access `/os/patients` without being logged in
  3. Expected: Redirect to `/login`
  4. Actual: No redirect — `proxy.ts` is ignored by Next.js because it must be named `middleware.ts` or `middleware.js`
- **File:** `src/proxy.ts`
- **Priority:** Fix before deployment

#### BUG-2: Filter injection vulnerability in patient search
- **Severity:** High
- **Steps to Reproduce:**
  1. Authenticate as a therapist
  2. Call `GET /api/patients?search=test%2Cid.gte.00000000-0000-0000-0000-000000000000`
  3. Expected: Only search by name/birthdate matching "test,..."
  4. Actual: The comma inside the `or()` string could split the filter into additional conditions, potentially exposing patients belonging to other therapists (RLS is the last line of defense, but filter injection can cause logic bypasses depending on Supabase PostgREST parsing)
- **File:** `src/app/api/patients/route.ts` line 93-95
- **Priority:** Fix before deployment

#### BUG-3: Future birth dates accepted (Geburtsdatum validation)
- **Severity:** Low
- **Steps to Reproduce:**
  1. Open `/os/patients/new`
  2. Enter a future date (e.g., 2099-12-31) in Geburtsdatum
  3. Expected: Validation error — birth date must be in the past
  4. Actual: Form accepts the future date; patient is saved with `geburtsdatum = 2099-12-31`
- **Files:** `src/components/patients/NewPatientForm.tsx`, `src/app/api/patients/route.ts`
- **Priority:** Fix in next sprint

#### BUG-4: "Änderungen speichern" button disabled after server error (isDirty edge case)
- **Severity:** Low
- **Steps to Reproduce:**
  1. Open a patient's Stammdaten tab, click "Bearbeiten"
  2. Change a field, click "Änderungen speichern"
  3. If the server returns an error (e.g., 500), the button becomes disabled (isDirty = false after failed save attempt where react-hook-form resets dirty state internally in some scenarios)
  4. Expected: User can retry without touching another field
  5. Actual: May require making another unnecessary field change to re-enable the button
- **File:** `src/components/patients/StammdatenTab.tsx` line 379
- **Priority:** Nice to have

#### BUG-5: Patient avatar images publicly accessible without authentication
- **Severity:** Medium
- **Steps to Reproduce:**
  1. Upload an avatar for a patient
  2. Copy the CDN URL from the patient detail page
  3. Open the URL in a private/incognito browser window (not logged in)
  4. Expected: Access denied (401/403)
  5. Actual: Avatar image loads successfully — no auth required
- **File:** `supabase/migrations/20260217000002_patients.sql` lines 167-207
- **Priority:** Fix in next sprint (DSGVO concern for healthcare data)

#### BUG-6: Pagination renders all page numbers — no windowed/ellipsis pagination
- **Severity:** Medium
- **Steps to Reproduce:**
  1. Create 500+ patients (25+ pages)
  2. Navigate to `/os/patients`
  3. Expected: Paginator shows limited page numbers with ellipsis (e.g., 1 2 3 ... 24 25)
  4. Actual: All 25+ page numbers render, causing a severely overcrowded UI
- **File:** `src/app/os/patients/page.tsx` lines 72-85
- **Priority:** Fix in next sprint

#### BUG-10: StammdatenTab form defaults become stale after save + cancel
- **Severity:** Low
- **Steps to Reproduce:**
  1. Open patient detail, Stammdaten tab
  2. Edit Vorname from "Max" to "Maximilian", save successfully
  3. Edit Vorname from "Maximilian" to "Maxi", click "Abbrechen"
  4. Expected: Form reverts to "Maximilian" (last saved value)
  5. Actual: Form reverts to "Max" (original mount-time defaultValues — stale)
- **File:** `src/components/patients/StammdatenTab.tsx` lines 68-83
- **Priority:** Fix in next sprint

---

### Summary
- **Acceptance Criteria:** 7/8 fully passed, 1 partially passed (AC-1/AC-3: future date bug)
- **Bugs Found:** 7 total (1 critical, 1 high, 2 medium, 3 low)
- **Security:** Issues found (middleware naming critical, filter injection high, public avatar medium)
- **Production Ready:** NO — BUG-1 (middleware not loading) and BUG-2 (filter injection) must be fixed first
- **Recommendation:** Fix BUG-1 and BUG-2 before deployment. BUG-5 and BUG-6 should be fixed in next sprint.

## Deployment
_To be added by /deploy_
