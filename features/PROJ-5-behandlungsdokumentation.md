# PROJ-5: Behandlungsdokumentation

## Status: In Review
**Created:** 2026-02-17
**Last Updated:** 2026-02-18

## Dependencies
- Requires: PROJ-1 (Authentifizierung & Rollenrechte)
- Requires: PROJ-2 (Patientenstammdaten)
- Requires: PROJ-3 (Anamnese & Untersuchungsdokumentation)

## User Stories
- Als Physiotherapeut möchte ich nach jeder Behandlung ein Therapieprotokoll erfassen (Datum, Dauer, durchgeführte Maßnahmen, Patientenreaktion, nächste Schritte), damit der Behandlungsverlauf lückenlos dokumentiert ist.
- Als Therapeut möchte ich vordefinierte Maßnahmen-Templates wählen (z.B. KG, MT, MLD, US), damit ich die Dokumentation in < 3 Minuten abschließe.
- Als Therapeut möchte ich den Behandlungsfortschritt im Verlauf sehen (Timeline-Ansicht), damit ich Verbesserungen oder Stagnation erkenne.
- Als Therapeut möchte ich Notizen aus der letzten Behandlung als Vorlage für die aktuelle nutzen können, damit ich schneller dokumentiere.
- Als Admin möchte ich die Behandlungshistorie aller Patienten einsehen, damit ich Qualitätssicherung betreiben kann.

## Acceptance Criteria
- [ ] Behandlungsprotokoll-Formular: Datum (auto), Behandlungsdauer (min), Therapeut (auto), Maßnahmen (Mehrfachauswahl)
- [ ] Maßnahmen-Katalog: KG, MT (Manuelle Therapie), MLD, US (Ultraschall), TENS, Wärme/Kälte, Elektrotherapie, Atemtherapie + Freitext
- [ ] Schmerzwert (NRS 0-10) zu Beginn und Ende der Behandlung
- [ ] Freitextfeld: Patientenreaktion, Besonderheiten, Beobachtungen
- [ ] Nächste Schritte / Therapieziel für nächste Einheit
- [ ] Timeline-Ansicht: Alle Behandlungen eines Patienten chronologisch mit NRS-Verlaufschart
- [ ] Behandlung bearbeiten: Nur innerhalb 24h nach Erstellung (danach readonly — Rechtssicherheit)
- [ ] Unterschrift/Bestätigung: Therapeut bestätigt Protokoll mit Klick (kein digitales Zertifikat nötig)
- [ ] Schnell-Vorlage: "Wie letzte Behandlung" übernimmt Maßnahmen der letzten Session

## Edge Cases
- Was passiert, wenn zwei Protokolle am gleichen Tag für den gleichen Patienten erstellt werden? → Erlaubt (mehrere Einheiten/Tag möglich), Zeitstempel differenziert
- Was passiert, wenn ein Therapeut vergisst, das Protokoll zu speichern und den Browser schließt? → Auto-Save alle 30 Sekunden als Entwurf
- Was passiert nach der 24h-Bearbeitungsfrist? → Readonly mit Hinweis, Admin kann freischalten für Korrekturen
- Was passiert, wenn eine Behandlungseinheit über Mitternacht geht? → Datum des Behandlungsbeginns wird gespeichert

## Technical Requirements
- Tabelle: `treatment_sessions` mit `patient_id`, `therapist_id`, `date`, `measures (JSONB)`, `locked_at`
- Auto-Save: Optimistic UI + Debounce 30s
- NRS-Verlauf: Aggregiert für Chart-Darstellung (recharts oder ähnliches)
- Performance: Ladezeit der Behandlungshistorie < 500ms für bis zu 200 Einträge

---

## Tech Design (Solution Architect)
**Designed:** 2026-02-18

### Seitenstruktur & Komponenten

```
/os/patients/[id]                                ← Patientenakte (existiert bereits)
+-- Tab: Behandlungen                            ← neuer Tab (alle Therapeuten + Admin)
    +-- BehandlungTab
        +-- NrsVerlaufChart                      ← recharts LineChart: NRS start/end über Zeit
        +-- "Neue Behandlung" Button
        +-- BehandlungTimeline
            +-- BehandlungCard
            |   (Datum, Therapeut, Maßnahmen-Badges, NRS start→end, Dauer, Status-Badge)
            +-- Leer-Zustand
            +-- Lade-Skeleton

/os/patients/[id]/behandlung/new                 ← Neue Behandlung erfassen
+-- BehandlungForm
    +-- Datum (auto: heute, überschreibbar)
    +-- Behandlungsdauer (Minuten, Zahlenfeld)
    +-- NRS Beginn (Slider 0-10)
    +-- Maßnahmen-Auswahl (Checkbox-Gruppe)
    |   KG | MT | MLD | US | TENS | Wärme | Kälte | Elektrotherapie | Atemtherapie
    +-- Freitext: Patientenreaktion & Besonderheiten
    +-- NRS Ende (Slider 0-10)
    +-- Nächste Schritte (Freitext)
    +-- "Wie letzte Behandlung" Button  ← füllt Maßnahmen der letzten Session vor
    +-- Auto-Save Indikator (30s Debounce, useDebounce aus PROJ-2 wiederverwendet)
    +-- "Als Entwurf speichern" / "Abschließen & bestätigen" Buttons

/os/patients/[id]/behandlung/[sessionId]         ← Behandlungsansicht (read-only)
+-- BehandlungView
    +-- Alle Felder read-only dargestellt
    +-- Sperr-Hinweis: "Bearbeitbar bis [Datum+24h]" oder "Gesperrt (Admin kann freischalten)"
    +-- "Bearbeiten" Button (nur wenn < 24h alt UND Entwurf/eigene Behandlung oder Admin)
    +-- "Als PDF exportieren" Button (window.print)

/os/patients/[id]/behandlung/[sessionId]/edit    ← Behandlung bearbeiten (< 24h)
+-- BehandlungEditForm
    (gleiche Felder wie BehandlungForm, vorausgefüllt via PATCH-Endpoint)
```

### Datenmodell

**Tabelle `treatment_sessions`:**
- `id` — UUID, Primärschlüssel
- `patient_id` — Verknüpfung zum Patienten
- `therapist_id` — Durchführender Therapeut (= created_by)
- `session_date` — Datum der Behandlung (DATE, nicht DATETIME — Beginn zählt)
- `duration_minutes` — Behandlungsdauer in Minuten (Integer, optional)
- `measures` — JSONB-Array der Maßnahmen (z.B. `["KG", "MT", "Wärme"]` + Freitext)
- `nrs_before` — Schmerzwert Beginn (Integer 0–10)
- `nrs_after` — Schmerzwert Ende (Integer 0–10, nullable)
- `notes` — Freitext: Patientenreaktion, Besonderheiten (max 5.000 Zeichen)
- `next_steps` — Nächste Schritte für Folgeeinheit (Freitext, max 2.000 Zeichen)
- `status` — `entwurf` oder `abgeschlossen`
- `confirmed_at` — Zeitstempel der Therapeuten-Bestätigung (beim Abschließen)
- `locked_at` — Automatische Sperrzeit: `created_at + 24 Stunden` (vom Server berechnet)
- `created_at`, `updated_at`

**Maßnahmen-Katalog (statisch im Frontend, keine eigene Tabelle nötig):**
KG (Krankengymnastik), MT (Manuelle Therapie), MLD (Manuelle Lymphdrainage),
US (Ultraschall), TENS, Wärme, Kälte, Elektrotherapie, Atemtherapie, Freitext

**NRS-Verlaufsdaten:** API liefert sortierte Liste von `(session_date, nrs_before, nrs_after)` für recharts LineChart — kein eigener Aggregations-Endpoint nötig, da Daten bereits in der Behandlungshistorie enthalten sind.

**RLS (Row Level Security):**
- Therapeut → liest/schreibt nur eigene Patienten-Sessions
- Admin → liest/schreibt alle
- Patient → kein Zugriff (über `/app/*` wird separat in PROJ-11 gebaut)

### Tech-Entscheidungen

| Entscheidung | Begründung |
|---|---|
| `recharts` für NRS-Chart | Leichtgewichtig, React-nativ, beste Next.js-Kompatibilität; shadcn/ui Chart-Komponente basiert darauf |
| `locked_at = created_at + 24h` (serverberechnet) | Server setzt den Wert — Manipulation über Client ausgeschlossen |
| Auto-Save mit `useDebounce` (30s) | Hook bereits in PROJ-2 implementiert, wiederverwendbar ohne neue Abhängigkeit |
| Maßnahmen-Katalog hardcoded im Frontend | Liste ist stabil, keine DB-Tabelle nötig, kein Admin-Interface erforderlich |
| Gleiche Seitenstruktur wie PROJ-3/4 | Konsistenz für Therapeuten (Tab in Patientenakte → New-Seite → Detail-Seite → Edit-Seite) |
| `session_date` als DATE (nicht TIMESTAMP) | Über-Mitternacht-Problem gelöst: Datum des Behandlungsbeginns wird gespeichert |
| Mehrere Sessions pro Tag erlaubt | Zeitstempel differenziert, keine Unique-Constraint auf `(patient_id, session_date)` |

### Neue Pakete
- `recharts` — NRS-Verlaufschart (LineChart mit zwei Linien: NRS Beginn + NRS Ende)

## QA Test Results

**Tested:** 2026-02-18
**App URL:** http://localhost:3000
**Tester:** QA Engineer (AI)

### Acceptance Criteria Status

#### AC-1: Behandlungsprotokoll-Formular
- [x] Datum (auto-filled with today's date, overridable via date input)
- [x] Behandlungsdauer in Minuten (optional number field, 1–480 validated client + server)
- [x] Therapeut (auto — therapist_id set server-side from authenticated user, never trusted from client)
- [x] Maßnahmen (Mehrfachauswahl via Checkbox-Gruppe)

#### AC-2: Maßnahmen-Katalog
- [x] KG, MT (Manuelle Therapie), MLD, US (Ultraschall), TENS, Wärme, Kälte, Elektrotherapie, Atemtherapie present as checkboxes
- [x] Freitext-Eingabe für weitere Maßnahmen implementiert (Input below catalog)

#### AC-3: Schmerzwert (NRS 0-10)
- [x] NRS Beginn: Slider 0–10 with color coding (green/amber/red) — required field, defaults to 5
- [x] NRS Ende: Optional — enabled via checkbox, defaults to 5 when enabled

#### AC-4: Freitextfeld Patientenreaktion
- [x] Textarea "Patientenreaktion & Besonderheiten" — max 5000 chars, validated client + server

#### AC-5: Nächste Schritte / Therapieziel
- [x] Textarea "Nächste Schritte / Therapieziel" — max 2000 chars, validated client + server

#### AC-6: Timeline-Ansicht
- [x] BehandlungTab shows all sessions chronologically (newest first)
- [x] NRS-Verlaufschart (recharts LineChart) with NRS Beginn + NRS Ende lines — shown when >= 2 sessions with NRS data
- [x] Badges for Maßnahmen (max 4 shown + overflow count)
- [x] NRS start → end shown on each card
- [x] Duration and therapist name shown
- [x] Loading skeleton and empty state implemented

#### AC-7: Behandlung bearbeiten (24h Frist)
- [ ] BUG: Non-admin therapists CANNOT edit "abgeschlossen" sessions even within the 24h window (see BUG-1)
- [ ] BUG: Admin can unlock and edit after 24h at the API level but the RLS UPDATE policy blocks the DB update regardless (see BUG-2)
- [x] Edit page shows "LockedAlert" when 24h has expired (for non-admin)
- [x] "Bearbeiten" button hidden in BehandlungView when session is not editable

#### AC-8: Unterschrift/Bestätigung
- [x] "Abschließen & bestätigen" button sets status to "abgeschlossen" and records confirmed_at timestamp
- [x] Confirmation timestamp displayed in BehandlungView under "Bestätigung" section

#### AC-9: Schnell-Vorlage "Wie letzte Behandlung"
- [x] "Wie letzte Behandlung" section appears when lastSession is available
- [x] Copies standard measures (checkbox values) from last session
- [x] Copies freitext measures (joined with ", ") into freitext field
- [ ] BUG: Falls back to sessions[0] (which may be a draft) when no "abgeschlossen" session exists — see BUG-3

### Edge Cases Status

#### EC-1: Mehrere Protokolle am gleichen Tag
- [x] No UNIQUE constraint on (patient_id, session_date) — multiple sessions per day allowed
- [x] API returns ordered by session_date DESC, then created_at DESC for same-day differentiation

#### EC-2: Browser schließen ohne Speichern (Auto-Save)
- [x] Auto-Save with 30s debounce implemented (useDebounce hook from PROJ-2 reused)
- [x] AutoSaveIndicator shows saving/saved/error states
- [ ] BUG: Auto-Save fires after 30s on initial page load even with no user input (no isDirty guard) — creates empty draft sessions — see BUG-4

#### EC-3: 24h-Bearbeitungsfrist abgelaufen
- [x] locked_at computed by DB trigger as created_at + 24h (server-enforced, not client-manipulable)
- [x] API PATCH returns 409 with clear message when lock window expired
- [x] BehandlungView shows lock hint with "gesperrt seit [datum+uhrzeit]"
- [x] Edit page shows LockedAlert for non-admin when locked
- [ ] BUG: Admin edit-after-24h blocked by RLS at DB level despite API bypass (see BUG-2)

#### EC-4: Behandlung über Mitternacht
- [x] session_date stored as DATE (not TIMESTAMP) — treatment start date is saved, not end date

### Security Audit Results

- [x] Authentication: All API routes check supabase.auth.getUser() before processing — unauthenticated requests return 401
- [x] Authorization (RLS): RLS enabled on treatment_sessions table with SELECT, INSERT, UPDATE, DELETE policies
- [x] therapist_id injection: Server always sets therapist_id = user.id, client cannot override
- [x] Patient scope: patient_id validated against RLS (therapist can only see own patients' sessions)
- [x] Input validation: All inputs validated with Zod on server side (session_date format, NRS 0-10, duration 1-480, max lengths)
- [x] UUID validation: UUIDs validated with regex before DB queries — prevents malformed ID injection
- [x] XSS: No dangerouslySetInnerHTML; all output rendered via React's escaped rendering; notes displayed via whitespace-pre-wrap (safe)
- [x] DELETE blocked: RLS DELETE policy uses USING(false) — physical deletion of sessions is impossible (DSGVO Dokumentationspflicht)
- [x] measures array: max 20 items enforced; each item max 200 chars; trimmed server-side
- [ ] BUG (Security): RLS UPDATE policy allows Admin to bypass ownership (therapist_id = auth.uid() OR get_my_role() = 'admin' in WITH CHECK) but the USING clause still enforces NOW() < locked_at for ALL users including Admin — making Admin unlock after 24h silently fail at DB level (see BUG-2)
- [x] Rate limiting: Not implemented (no rate limiter middleware), but this is a known gap across entire project — not PROJ-5 specific

### Bugs Found

#### BUG-1: Non-admin therapist cannot edit "abgeschlossen" sessions within 24h window
- **Severity:** High
- **Steps to Reproduce:**
  1. Create a new Behandlung and click "Abschließen & bestätigen"
  2. Navigate to the session's detail page (BehandlungView)
  3. Expected: "Bearbeiten" button is visible because the session is within the 24h edit window
  4. Actual: "Bearbeiten" button is hidden — `isEditable()` returns `false` for any "abgeschlossen" session for non-admin users, regardless of locked_at
- **Root Cause:** `BehandlungView.tsx` `isEditable()` function has `if (session.status === "abgeschlossen" && !isAdmin) return false` which fires before the locked_at check
- **Priority:** Fix before deployment

#### BUG-2: Admin "Freischaltung" (edit after 24h) silently fails due to RLS USING clause
- **Severity:** High
- **Steps to Reproduce:**
  1. Wait for a session's 24h edit window to expire (locked_at < NOW())
  2. Log in as Admin
  3. Navigate to the session's edit page — edit page renders (API bypass works)
  4. Submit edits
  5. Expected: Admin edits are saved successfully (spec: "Admin kann freischalten für Korrekturen")
  6. Actual: The API PATCH handler bypasses the lock check for admin, but the Supabase UPDATE query is blocked by the RLS USING clause `NOW() < locked_at` which applies to all roles including admin
- **Root Cause:** `supabase/migrations/20260218000005_treatment_sessions.sql` RLS UPDATE policy — `NOW() < locked_at` is an outer condition in USING clause, not inside the non-admin OR branch. The admin comment says "wird in API gehandhabt" but the DB still enforces it.
- **Priority:** Fix before deployment

#### BUG-3: "Wie letzte Behandlung" may use a Draft session as template
- **Severity:** Low
- **Steps to Reproduce:**
  1. Create a Behandlung and save as "Entwurf" (draft), do not confirm it
  2. Navigate to "Neue Behandlung"
  3. Expected: "Wie letzte Behandlung" uses the most recent confirmed (abgeschlossen) session, or the feature should not appear if only drafts exist
  4. Actual: If no "abgeschlossen" session exists, `sessions[0]` (the draft) is used as the template
- **Root Cause:** `new/page.tsx` line 67: `sessions.find((s) => s.status === "abgeschlossen") ?? sessions[0] ?? null` — the fallback uses an unconfirmed draft
- **Priority:** Fix in next sprint

#### BUG-4: Auto-Save creates empty draft after 30s on initial page load without user input
- **Severity:** Medium
- **Steps to Reproduce:**
  1. Navigate to "Neue Behandlung"
  2. Do not type anything
  3. Wait 30 seconds
  4. Navigate away by clicking "Abbrechen"
  5. Expected: No draft session is created if the user made no changes
  6. Actual: An "entwurf" session is created with default values (NRS 5, empty measures, today's date) and the timeline will show an empty draft
- **Root Cause:** `BehandlungForm.tsx` — `useEffect` with `[debouncedValues]` has no `isDirty` guard. `useDebounce` fires after 30s even for initial (unchanged) form values.
- **Priority:** Fix before deployment

#### BUG-5: Back button from BehandlungView does not restore "Behandlungen" tab
- **Severity:** Low
- **Steps to Reproduce:**
  1. Navigate to a patient's Behandlungen tab
  2. Click on a session to open BehandlungView
  3. Click "Zurück" button
  4. Expected: Patient detail page opens with "Behandlungen" tab active
  5. Actual: Patient detail page opens with "Stammdaten" tab active (default) — the `?tab=behandlungen` query param in the link is ignored because `PatientDetailPage` does not read `searchParams`
- **Root Cause:** `src/app/os/patients/[id]/page.tsx` uses `defaultValue="stammdaten"` and does not call `useSearchParams()` to read the `tab` query param. Same issue exists in PROJ-3/4 back links.
- **Priority:** Fix in next sprint

### Summary
- **Acceptance Criteria:** 7/9 passed (2 failed due to BUG-1 and BUG-2)
- **Bugs Found:** 5 total (0 critical, 2 high, 1 medium, 2 low)
- **Security:** Mostly pass — Admin edit-after-24h RLS contradiction is a High severity gap
- **Production Ready:** NO — 2 High bugs must be fixed first (BUG-1, BUG-2)
- **Recommendation:** Fix BUG-1, BUG-2, BUG-4 before deployment; BUG-3 and BUG-5 can be fixed in next sprint

## Deployment

**Deployed:** 2026-02-18
**Production URL:** https://my-first-app-sigma-teal.vercel.app
**Git Tag:** v1.5.0-PROJ-5

### Pre-Deployment Checklist
- [x] `npm run build` passed (0 TypeScript errors)
- [x] All 5 QA bugs fixed (BUG-1, BUG-2, BUG-3, BUG-4, BUG-5)
- [x] Supabase migration applied: `20260218000005_treatment_sessions.sql`
- [x] RLS UPDATE policy patched (Admin bypass after 24h)
- [x] Code committed and pushed to GitHub (main branch)
- [x] Vercel auto-deployed via GitHub integration

### Database Migration Applied
- Table `treatment_sessions` created with RLS
- `locked_at` computed via BEFORE INSERT trigger (`created_at + 24h`)
- 5 performance indexes created
- RLS: SELECT / INSERT / UPDATE / DELETE policies active
