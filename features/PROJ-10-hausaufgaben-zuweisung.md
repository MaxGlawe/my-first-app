# PROJ-10: Hausaufgaben-Zuweisung

## Status: Planned
**Created:** 2026-02-17
**Last Updated:** 2026-02-17

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
_To be added by /architecture_

## QA Test Results
_To be added by /qa_

## Deployment
_To be added by /deploy_
