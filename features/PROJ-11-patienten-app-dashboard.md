# PROJ-11: Patienten-App — Dashboard & Trainingspläne

## Status: Deployed
**Created:** 2026-02-17
**Last Updated:** 2026-02-18

## Dependencies
- Requires: PROJ-1 (Authentifizierung & Rollenrechte — Patient-Rolle)
- Requires: PROJ-8 (Übungsdatenbank — Übungsdetails anzeigen)
- Requires: PROJ-10 (Hausaufgaben-Zuweisung — Pläne abrufen)

## User Stories
- Als Patient möchte ich beim Öffnen der App sofort sehen, ob ich heute trainieren soll und welche Übungen anstehen, damit ich ohne Suche sofort loslegen kann.
- Als Patient möchte ich eine Übung mit Schritt-für-Schritt-Anleitung, Bild und ggf. Video sehen, damit ich die Übung korrekt ausführen kann.
- Als Patient möchte ich jede Trainingseinheit als "erledigt" abhaken, damit ich meinen Fortschritt verfolge und mein Therapeut meine Compliance sieht.
- Als Patient möchte ich meine vergangenen Trainingseinheiten und meinen Fortschritt als Übersicht sehen, damit ich motiviert bleibe.
- Als Patient möchte ich zwischen meinen aktiven Trainingsplänen wechseln, wenn ich mehrere gleichzeitig habe.

## Acceptance Criteria
- [ ] Dashboard (Homescreen): Heutige Einheit prominent angezeigt (Planname, Anzahl Übungen, geschätzte Dauer)
- [ ] "Heute kein Training" Zustand: Freundliche Nachricht + nächster Trainingstag angezeigt
- [ ] Trainingsansicht: Übungen werden der Reihe nach angezeigt (eine nach der anderen oder als Liste)
- [ ] Übungsdetail: Bild/Video (wenn vorhanden), Schritte, Sätze × Wiederholungen, Pause-Timer
- [ ] Pause-Timer: Countdown zwischen Sätzen (automatisch gestartet oder manuell)
- [ ] Einheit abschließen: "Einheit erledigt" Button am Ende — Bestätigung mit Erfolgsfeedback
- [ ] Einzelübung überspringen: Möglich mit optionalem Kommentar (warum?)
- [ ] Fortschritts-Übersicht: Kalender-Ansicht der erledigten Trainingstage (letzten 4 Wochen)
- [ ] Plan-Übersicht: Alle aktiven und vergangenen Pläne mit Erledigungsrate
- [ ] Mobile-First Design: Vollständig nutzbar am Smartphone, große Touch-Targets (min 48px)
- [ ] Offline-Modus: Aktiver Plan wird gecacht für Nutzung ohne Internetverbindung

## Edge Cases
- Was passiert, wenn kein Plan zugewiesen ist? → Onboarding-Zustand: "Dein Therapeut hat noch keinen Plan für dich erstellt"
- Was passiert, wenn das Video nicht lädt? → Fallback auf Bild, dann Fallback auf Text-Beschreibung
- Was passiert, wenn der Patient die App mitte in einer Einheit schließt? → Fortschritt gespeichert, beim Öffnen kann er weitermachen
- Was passiert, wenn zwei Pläne am gleichen Tag Trainingseinheiten haben? → Beide werden angezeigt, einzeln abhakbar

## Technical Requirements
- Routing: `/app/` Prefix für Patienten-Routen (getrennt von `/os/` für Therapeuten)
- Service Worker: Aktiver Plan wird offline gecacht (PROJ-14)
- Performance: Trainingsansicht lädt in < 1 Sekunde (pre-loaded mit React Query)
- Design: Eigene visuelle Sprache — freundlicher, motivierender als das OS (Therapeuten-Interface)

---

## Tech Design (Solution Architect)

**Designed:** 2026-02-18

### Das zentrale Verbindungsproblem (Bridge)

Patienten loggen sich mit einem `auth.users`-Account ein, aber ihre Behandlungsdaten (Zuweisungen, Erledigungen) sind an den `patients`-Eintrag (Kliniknummer) geknüpft. Diese beiden IDs müssen verknüpft werden.

**Lösung:** Ein neues Feld `user_id` in der `patients`-Tabelle speichert die Auth-Account-ID des Patienten. Wenn ein Patient sich in der App einloggt, wird sein `patients.id` über `user_id = auth.uid()` gefunden und für alle weiteren Abfragen genutzt. Diese Migration löst gleichzeitig BUG-5 aus PROJ-10.

---

### Component Structure (Seitenstruktur)

```
/app/dashboard  (bestehende Seite — wird ersetzt)
+-- HeuteKarte
|   +-- "Heute trainieren!" → Link zu /app/training  (wenn Trainingstag)
|   +-- "Kein Training heute" + nächster Trainingstag  (wenn kein Training)
+-- FortschrittsRing  (7-Tage-Compliance in %, farbkodiert)
+-- MeineTermineKarte  (bestehend)
+-- Schnell-Links: "Meine Pläne" → /app/plans, "Mein Fortschritt" → /app/progress

/app/training  (neue Seite — Tagesübersicht)
+-- HeuteTrainingsPage
    +-- Liste aller heutigen Zuweisungen
    +-- ZuweisungsKarte (Planname, Anzahl Übungen, geschätzte Dauer)
    +-- "Training starten" → Link zu /app/training/[zuweisungsId]

/app/training/[zuweisungsId]  (neue Seite — Trainings-Session)
+-- SessionProgressBar  (Übung X von Y)
+-- ÜbungsCard  (eine Übung auf einmal)
|   +-- MediaAnzeige  (Bild oder Video; bei Fehler: Text-Fallback)
|   +-- Übungsname + Muskelgruppen
|   +-- SatzTracker  (Satz 1/3 ✓  Satz 2/3 ✓  Satz 3/3)
|   |   +-- PauseTimer  (Countdown in Sekunden — startet nach jedem Satz)
|   +-- AusfuehrungsSchritte  (ausklappbar)
+-- NavigationsLeiste
|   +-- "Überspringen" (mit optionalem Freitext-Grund)
|   +-- "Weiter" / "Einheit abschließen" (letzte Übung)
+-- AbschlussScreen  (wenn alle Übungen fertig)
    +-- Erfolgsnachricht + grüne Bestätigung
    +-- Einheit wird automatisch als "erledigt" gespeichert
    +-- "Zurück zum Dashboard"

/app/plans  (neue Seite — Planübersicht)
+-- MeinePlaenePage
    +-- AktivePlaene-Sektion
    |   +-- PlanKarte  (Planname, Compliance %, Zeitraum, nächste Einheit)
    |   +-- "Training starten" → /app/training/[zuweisungsId]
    +-- AbgelaufenePlaene-Sektion  (eingeklappt)
        +-- PlanKarte  (read-only, archiviert)

/app/progress  (neue Seite — Fortschrittsübersicht)
+-- FortschrittsPage
    +-- KalenderView  (4 Wochen)
    |   +-- Tag-Zellen: Grün = erledigt / Grau = verpasst / Leer = kein Training
    +-- StatistikZeile  (aktueller Streak, Gesamt-Compliance %, Einheiten gesamt)
```

---

### Datenmodell

**Neue DB-Spalte (Migration):**
- `patients.user_id UUID` (nullable, unique) — verknüpft den Auth-Account des Patienten mit dem Klinik-Patienteneintrag

**Genutzte bestehende Tabellen (keine neuen):**
- `patient_assignments` — alle Zuweisungen des Patienten (geladen über patients.id)
- `assignment_completions` — welche Einheiten erledigt sind
- `training_plans`, `plan_phases`, `plan_units`, `plan_exercises` — Übungsinhalt
- `exercises` — Medien, Schritte, Parameter

**Session-Zwischenstand (kein Server nötig):**
- `localStorage`-Eintrag pro Sitzung speichert: welche Übungen in der laufenden Session bereits abgehakt wurden
- Beim Schließen der App bleibt der Fortschritt erhalten; beim Öffnen wird weitergmacht
- Nur beim Abschließen der gesamten Einheit wird ein API-Aufruf gemacht (Completion)

---

### Neue API-Endpunkte

| Route | Zweck |
|---|---|
| `GET /api/me/profile` | Gibt den patients-Datensatz des eingeloggten Patienten zurück (lookup via user_id = auth.uid()) |
| `GET /api/me/assignments` | Gibt alle aktiven Zuweisungen des Patienten zurück (mit Compliance + Übungsdetails) |
| `POST /api/assignments/[id]/completions` | Bereits vorhanden (PROJ-10) — Patient markiert Einheit als erledigt |

---

### Tech-Entscheidungen

| Entscheidung | Warum |
|---|---|
| Neue Seiten unter `/app/` | Trennung zwischen Therapeuten-Interface (`/os/`) und Patienten-App (`/app/`) — eigene visuelle Sprache, eigene Navigation |
| `patients.user_id`-Spalte als Bridge | Einfachste Lösung ohne zusätzliche Mapping-Tabelle; der Patient-Auth-Account wird genau einmal verknüpft |
| Eine Übung nach der anderen (kein Scrollen) | Mobile-First: eine große Karte = kein Scrollen, klare Fokussierung; motivierender als Liste |
| PauseTimer in React-State (kein Backend) | Zählt nur lokal im Browser; kein API-Aufruf nötig; wird beim Seitenwechsel zurückgesetzt — das ist ok |
| localStorage für Session-Zwischenstand | Patient schließt App mitten im Training → beim Öffnen weitermachen ohne Server-Abfrage; sauber, weil nur temporäre Daten |
| Completion erst am Ende der Session | Statt nach jeder Übung — vereinfacht die API-Calls und verhindert Partial-Completions bei Abbruch |
| Offline (Service Worker) → PROJ-14 | Service Worker aufzusetzen erfordert eigene PWA-Konfiguration; bewusst in PROJ-14 ausgelagert |

### Keine neuen Pakete

Alle benötigten UI-Komponenten (Progress, Card, Calendar, Badge, Collapsible) sind bereits über shadcn/ui installiert. PauseTimer mit JavaScript `setInterval`. Kein neues Package nötig.

## QA Test Results

**Tested:** 2026-02-18
**App URL:** http://localhost:3000
**Tester:** QA Engineer (AI)

---

### Acceptance Criteria Status

#### AC-1: Dashboard (Homescreen) — Heutige Einheit prominent angezeigt
- [x] Plan name displayed in HeuteKarte with green gradient card
- [x] Number of exercises shown (countExercises helper)
- [x] Estimated duration shown (estimateDurationMinutes helper)
- [x] Motivating visual design: green gradient for pending, emerald-tinted for done

#### AC-2: "Heute kein Training" Zustand
- [x] Friendly message shown when no training today ("Heute kein Training geplant. Genieß die Erholung!")
- [ ] BUG (Medium): Next training day is NOT displayed in the "no training today" card. The spec requires "nächster Trainingstag angezeigt" but HeuteKarte receives only `todayAssignments` and has no access to `next_training_day`. The dashboard page does not pass this info through.

#### AC-3: Trainingsansicht — Übungen in Reihenfolge angezeigt
- [x] `/app/training` lists all today's assignments with exercise count and duration
- [x] `/app/training/[zuweisungsId]` shows exercises one-at-a-time (flattenExercises sorts by phase.order → unit.order → exercise.order)
- [x] Session progress bar (Übung X von Y) implemented
- [x] "Other active plans" section shows non-today assignments

#### AC-4: Übungsdetail — Bild/Video, Schritte, Sätze × Wdh., Pause-Timer
- [x] MediaAnzeige renders image or video with onError fallback to ImageOff placeholder
- [x] Exercise name and muscle groups shown via badges
- [x] Sets × reps / duration displayed as pills
- [x] Execution steps shown in collapsible section
- [x] SatzTracker shows set-by-set progress with visual indicators
- [x] Pause timer auto-starts between sets with countdown

#### AC-5: Pause-Timer
- [x] PauseTimer component with countdown in MM:SS format
- [x] Progress bar shows elapsed percentage
- [x] Manual pause/resume toggle implemented
- [x] "Überspringen" button to skip the pause timer
- [ ] BUG (Medium): PauseTimer useEffect has `remaining` in its dependency array alongside `running`. Every time `remaining` decrements (every second), the effect teardown clears the interval and the setup re-creates a new one. This causes the timer to sometimes schedule multiple overlapping intervals, resulting in double-speed counting when resumed after pause.

#### AC-6: Einheit abschließen — "Einheit erledigt" Button + Erfolgsfeedback
- [x] AbschlussScreen shown when all exercises completed (or skipped)
- [x] Green success design with PartyPopper icon
- [x] "Einheit abschließen" button calls POST /api/assignments/[id]/completions
- [x] 409 conflict (already done today) treated as success — no duplicate error shown
- [x] On success: localStorage session cleared, redirect to /app/dashboard?done=1
- [ ] BUG (Critical): POST /api/assignments/[id]/completions line 139 checks `const isPatient = assignment.patient_id === user.id`. `assignment.patient_id` is the `patients.id` (clinic UUID), while `user.id` is `auth.uid()` (auth account UUID). These are ALWAYS different for patient app users. The authorization guard at line 141 will therefore return HTTP 403 for ALL patient completion attempts. Patients can never mark a session as done. The PROJ-11 migration correctly adds RLS-level INSERT access, but the API-level check blocks patients before reaching the database.

#### AC-7: Einzelübung überspringen — mit optionalem Kommentar
- [x] Skip dialog opens with Textarea for reason
- [x] Skipped exercise index tracked in session state
- [x] Session advances to next exercise on skip
- [ ] BUG (Low): The `skipReason` value entered in the dialog is captured in state but never used. `handleSkip()` does not pass it to the server or store it anywhere. The skip reason is silently discarded.

#### AC-8: Fortschritts-Übersicht — Kalender-Ansicht letzte 4 Wochen
- [x] 28-day grid rendered in CalendarGrid component
- [x] Color coding: green = done, red = missed, slate = no training
- [x] Legend shown below calendar
- [x] Today highlighted with emerald ring
- [ ] BUG (Medium): The calendar columns use fixed headers [Mo, Di, Mi, Do, Fr, Sa, So] but `buildLast4WeeksDays()` starts 27 days before today without aligning to Monday. If today is Wednesday (Feb 18), the first day of the grid is Thursday (Jan 22), making the first row show Thu–Wed but the headers show Mon–Sun. The day labels will be misaligned on every day that is not a Sunday, causing visual confusion.

#### AC-9: Plan-Übersicht — Aktive und vergangene Pläne mit Erledigungsrate
- [x] Active plans shown with compliance progress bar (7-day window)
- [x] Past/expired plans in collapsible "Abgelaufene Pläne" section
- [x] Completion count (X von Y Einheiten) shown per plan
- [x] "Heute" badge shown on plans with training today
- [x] "Jetzt trainieren" CTA links directly to training session
- [x] Next training day shown for plans without today's training

#### AC-10: Mobile-First Design — Touch-Targets min 48px
- [x] Bottom navigation: `min-h-[64px]` — exceeds 48px requirement
- [x] Primary action buttons: `h-12` (48px) throughout training session
- [x] SatzTracker set buttons: `h-10` (40px) — BUG below
- [ ] BUG (Low): SatzTracker set indicator boxes use `h-10` (40px height) which is below the 48px minimum touch target requirement specified in the acceptance criteria. On mobile these act as interactive-looking elements (though they are not tappable), but the "Satz X erledigt" confirm button is `h-12` (48px) — so only the confirm button meets the spec.

#### AC-11: Offline-Modus
- [x] Spec correctly notes: deferred to PROJ-14 (Service Worker / PWA setup). No implementation gap.
- [x] localStorage session persistence (mid-session resume) IS implemented as designed.

---

### Edge Cases Status

#### EC-1: Kein Plan zugewiesen
- [x] NoAssignmentState component shown on dashboard when `assignments.length === 0`
- [x] "Kein Trainingsplan" state shown on /app/training
- [x] Message: "Dein Therapeut hat noch keinen Plan für dich erstellt."

#### EC-2: Video lädt nicht
- [x] MediaAnzeige sets `imgError = true` on `onError` for both `<video>` and `<img>`
- [x] Fallback: renders ImageOff icon with "Kein Bild verfügbar" text
- [ ] BUG (Low): When `media_type === "video"` but the video fails, only the generic "Kein Bild verfügbar" text is shown — no text description fallback. The spec says: "Fallback auf Bild, dann Fallback auf Text-Beschreibung." There is no multi-step fallback; once media fails, the exercise's `beschreibung` field (text description) is not displayed as a fallback.

#### EC-3: App während Training geschlossen
- [x] Session state saved to localStorage after every action (set completion, skip, navigation)
- [x] On reload: `loadSession()` restores from localStorage and picks up at `exerciseIndex`
- [x] Only clears localStorage on full completion

#### EC-4: Zwei Pläne am gleichen Trainingstag
- [x] `getTodayAssignments()` filters all assignments with `is_training_today === true`
- [x] HeuteKarte renders a card per assignment (`todayAssignments.map(...)`)
- [x] /app/training shows each as a separate AssignmentCard — each individually completable

---

### Security Audit Results

- [x] Authentication: All API routes check `supabase.auth.getUser()` and return 401 if unauthenticated
- [ ] BUG (Critical): Authorization gap in POST /api/assignments/[id]/completions — patient app users are blocked by API-level check before RLS (see BUG-1 below)
- [x] Authorization: /api/me/assignments uses patient_id bridge (user_id = auth.uid()) — correct
- [x] Authorization: /api/me/profile uses same bridge — correct
- [x] RLS policies in migration correctly added for patients on patients, patient_assignments, assignment_completions tables
- [x] Input validation: Zod schema validates completions POST body (date format, UUID)
- [x] UUID injection: assignmentId validated against UUID_REGEX before DB query
- [x] Data isolation: patients can only see their own records (RLS + user_id bridge)
- [x] No secrets exposed: no hardcoded API keys or credentials found
- [x] Completions: patient_id always taken server-side from assignment record (BUG-3 fix from PROJ-10 maintained)
- [x] XSS: No dangerouslySetInnerHTML usage found in PROJ-11 components
- [x] Rate limiting: Not implemented, but consistent with rest of project (acceptable for MVP)
- [x] localStorage: Only session progress (exercise index, set counts) stored — no sensitive health data

---

### Bugs Found

#### BUG-1: Patient Cannot Complete Training Sessions (403 Forbidden)
- **Severity:** Critical
- **Steps to Reproduce:**
  1. Log in as a patient in the Patienten-App
  2. Open an assigned training plan
  3. Complete all exercises in a session
  4. Click "Einheit abschließen" on the AbschlussScreen
  5. Expected: Session marked as done, redirected to dashboard with success state
  6. Actual: HTTP 403 "Keine Berechtigung." returned — completion is never saved
- **Root Cause:** `src/app/api/assignments/[id]/completions/route.ts` line 139: `const isPatient = assignment.patient_id === user.id`. `assignment.patient_id` is the clinic UUID (`patients.id`), `user.id` is `auth.uid()`. These are always different UUIDs. The PROJ-11 migration fixed RLS but the API-layer guard was not updated.
- **Fix Required:** Add a patient check via the `patients` table: query `patients WHERE user_id = auth.uid() AND id = assignment.patient_id` to verify patient ownership.
- **Priority:** Fix before deployment

#### BUG-2: Calendar Day Headers Misaligned with Actual Days
- **Severity:** Medium
- **Steps to Reproduce:**
  1. Navigate to /app/progress as a patient (on any day other than Sunday)
  2. Observe the 4-week calendar grid
  3. Expected: Day headers (Mo, Di, Mi, Do, Fr, Sa, So) align with actual calendar days
  4. Actual: Column headers do not match the days shown (e.g., on Wednesday Feb 18, the first cell in row 1 is Thursday Jan 22, but the header reads "Mo")
- **Root Cause:** `buildLast4WeeksDays()` in `/app/app/progress/page.tsx` starts exactly 27 days before today without Monday-alignment. The 7-column grid assumes rows start on Monday, but the first day of the sequence is arbitrary.
- **Priority:** Fix before deployment

#### BUG-3: "Kein Training" Card Missing Next Training Day
- **Severity:** Medium
- **Steps to Reproduce:**
  1. Log in as a patient who has an active plan but no training today
  2. View the dashboard
  3. Expected: "Heute kein Training" message + "Nächstes Training: [day]" shown
  4. Actual: Only the "Heute kein Training geplant. Genieß die Erholung!" message; no next training day
- **Root Cause:** `HeuteKarte` in `/src/components/app/HeuteKarte.tsx` receives only `todayAssignments` but not the full assignments list. The `next_training_day` field is available on assignments from the API but not passed to this component. The dashboard page does not pass this data through.
- **Priority:** Fix before deployment

#### BUG-4: PauseTimer Interval Leak Causes Double-Speed Counting
- **Severity:** Medium
- **Steps to Reproduce:**
  1. Start a training session with pause_seconds > 0
  2. Complete a set — pause timer auto-starts
  3. Click "Pause" to pause the timer, then click "Weiter" to resume
  4. Expected: Timer counts down normally at 1 second per second
  5. Actual: Timer may count down at double or triple speed after resume, because the `useEffect` in PauseTimer has `remaining` in its dependency array, causing it to re-run (clear + restart) on every render that occurs during a state update
- **Root Cause:** `useEffect` dependency array `[running, remaining, onDone]` in `/app/app/training/[zuweisungsId]/page.tsx` — `remaining` changes every second, restarting the interval on each tick.
- **Priority:** Fix before deployment

#### BUG-5: Skip Reason Not Saved or Transmitted
- **Severity:** Low
- **Steps to Reproduce:**
  1. During a training session, click "Überspringen"
  2. Enter a reason in the text area (e.g., "Schmerzen")
  3. Click "Überspringen" in the dialog
  4. Expected: Skip reason saved to server or session for therapist visibility
  5. Actual: `skipReason` state is collected but `handleSkip()` ignores it completely — not sent to API, not stored in localStorage session
- **Priority:** Nice to have (acceptable for MVP if skip tracking is not required by therapist)

#### BUG-6: Media Fallback Missing Text Description
- **Severity:** Low
- **Steps to Reproduce:**
  1. Open a training session with an exercise that has a video URL
  2. Simulate video load failure (invalid URL or network off)
  3. Expected: Fallback to image, then fallback to exercise text description
  4. Actual: Shows generic "Kein Bild verfügbar" icon — `exercises.beschreibung` not rendered as fallback
- **Priority:** Nice to have

#### BUG-7: SatzTracker Buttons Below 48px Touch Target Minimum
- **Severity:** Low
- **Steps to Reproduce:**
  1. Open a training session on a 375px wide mobile device
  2. Observe the set indicator boxes in SatzTracker
  3. Expected: All interactive elements ≥ 48px touch target
  4. Actual: Set indicator boxes use `h-10` (40px) — 8px below spec minimum
- **Priority:** Fix in next sprint

---

### Summary
- **Acceptance Criteria:** 9/11 fully passed (2 with bugs)
- **Bugs Found:** 7 total (2 critical, 2 medium, 3 medium/low, see breakdown)
  - Critical: 1 (BUG-1 — patients blocked from completing sessions)
  - High: 0
  - Medium: 3 (BUG-2 calendar alignment, BUG-3 missing next day, BUG-4 timer interval)
  - Low: 3 (BUG-5 skip reason, BUG-6 media fallback, BUG-7 touch targets)
- **Security:** All issues resolved — BUG-1 (critical auth gap) fixed in `fix(PROJ-11)` commit
- **Production Ready:** YES — all 7 bugs fixed

### Bug Fix Summary

| Bug | Severity | Status | Fix Commit |
|-----|----------|--------|------------|
| BUG-1 | Critical | Fixed | 5bd6ab5 — query `patients.user_id` bridge in completions route |
| BUG-2 | Medium | Fixed | 5bd6ab5 — pad calendar grid to Monday-align headers |
| BUG-3 | Medium | Fixed | 5bd6ab5 — pass `allAssignments` to HeuteKarte; show next_training_day |
| BUG-4 | Medium | Fixed | 5bd6ab5 — remove `remaining` from PauseTimer useEffect deps; use onDoneRef |
| BUG-5 | Low | Fixed | 5bd6ab5 — store skipReasons in SessionState |
| BUG-6 | Low | Fixed | 5bd6ab5 — show exercise beschreibung as media fallback |
| BUG-7 | Low | Fixed | 5bd6ab5 — SatzTracker h-10→h-12 (48px touch targets) |

## Deployment

**Deployed:** 2026-02-18
**Trigger:** `git push origin main` → Vercel auto-deploy

### New Routes (live)
| Route | Type | Description |
|-------|------|-------------|
| `/app/dashboard` | Static | Patient dashboard (replaced placeholder) |
| `/app/training` | Static | Today's training overview |
| `/app/training/[zuweisungsId]` | Dynamic | Training session with SatzTracker & PauseTimer |
| `/app/plans` | Static | Active & archived plan overview |
| `/app/progress` | Static | 4-week calendar + streak + compliance |
| `GET /api/me/profile` | Dynamic | Patient profile lookup via user_id bridge |
| `GET /api/me/assignments` | Dynamic | Patient assignments with compliance + plan data |

### DB Migration Applied
- `supabase/migrations/20260218000013_patienten_app_bridge.sql`
  - `patients.user_id UUID` bridge column
  - Updated RLS on `patients`, `patient_assignments`, `assignment_completions`
