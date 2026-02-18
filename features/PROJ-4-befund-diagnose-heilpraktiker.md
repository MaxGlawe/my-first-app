# PROJ-4: Befund & Diagnose (Heilpraktiker)

## Status: Planned
**Created:** 2026-02-17
**Last Updated:** 2026-02-17

## Dependencies
- Requires: PROJ-1 (Authentifizierung & Rollenrechte — Heilpraktiker-Rolle)
- Requires: PROJ-2 (Patientenstammdaten)
- Requires: PROJ-3 (Anamnese & Untersuchungsdokumentation)

## User Stories
- Als Heilpraktiker möchte ich nach der Untersuchung eine eigenständige Diagnose stellen und mit ICD-10-Code verschlüsseln, damit die Dokumentation rechtssicher und abrechenbar ist.
- Als Heilpraktiker möchte ich einen strukturierten Befundbericht verfassen (Befund, Diagnose, Therapieziel, Prognose), der als Basis für den Arztbericht dient.
- Als Heilpraktiker möchte ich Diagnosen aus früheren Behandlungen übernehmen oder anpassen, damit ich nicht jedes Mal neu suchen muss.
- Als Admin möchte ich sicherstellen, dass kein Physiotherapeut Diagnosefunktionen aufrufen kann — auch nicht über direkte URL-Eingabe.

## Acceptance Criteria
- [ ] ICD-10-Suche: Autocomplete-Suchfeld mit ICD-10-GM Katalog (deutsch), Mehrfachdiagnosen möglich
- [ ] Befundbericht-Formular: Klinischer Befund (Freitext), Hauptdiagnose (ICD-10), Nebendiagnosen (ICD-10), Therapieziel, Prognose, Therapiedauer (Wochen)
- [ ] Diagnose-Sicherheitsgrad: Gesichert / Verdacht / Ausschluss
- [ ] Server-seitige Absicherung: API-Route wirft 403 für Nicht-Heilpraktiker
- [ ] Middleware blockiert `/os/befund/*` und `/os/diagnose/*` für Physiotherapeuten
- [ ] Befundübersicht: Alle Befunde eines Patienten chronologisch mit Datum und Therapeut
- [ ] Befund bearbeiten: Nur der erstellende Therapeut oder Admin darf bearbeiten
- [ ] Befund-PDF-Export

## Edge Cases
- Was passiert, wenn ein ICD-Code veraltet/ungültig ist? → Warnung bei Eingabe veralteter Codes, aktueller Code vorgeschlagen
- Was passiert, wenn ein Physiotherapeut über die API versucht, eine Diagnose zu speichern? → 403 Forbidden, Log-Eintrag für Admin
- Was passiert, wenn kein ICD-Code passt? → Freitext-Diagnose möglich mit Pflichtnotiz

## Technical Requirements
- ICD-10-GM Datenbank lokal oder als API eingebunden (kein Datenschutz-Problem da kein PHI)
- Tabelle: `diagnoses` mit `patient_id`, `created_by_role` Pflichtfeld (`heilpraktiker` only)
- RLS-Policy: `INSERT/UPDATE/DELETE` nur für Heilpraktiker-Rolle und Admins
- Server Action / API Route prüft Rolle serverseitig (nicht nur Frontend-Guard)

---

## Tech Design (Solution Architect)
_To be added by /architecture_

## QA Test Results
_To be added by /qa_

## Deployment
_To be added by /deploy_
