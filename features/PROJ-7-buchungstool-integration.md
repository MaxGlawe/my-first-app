# PROJ-7: Buchungstool-Integration

## Status: Planned
**Created:** 2026-02-17
**Last Updated:** 2026-02-17

## Dependencies
- Requires: PROJ-1 (Authentifizierung & Rollenrechte)
- Requires: PROJ-2 (Patientenstammdaten)

## User Stories
- Als Admin möchte ich Patienten aus dem bestehenden Buchungstool ins Praxis OS importieren, damit ich nicht alle Bestandspatienten manuell anlegen muss.
- Als Therapeut möchte ich in der Patientenakte die nächsten Termine des Patienten sehen, damit ich weiß, wann ich ihn wieder behandle.
- Als Therapeut möchte ich über das Praxis OS einen neuen Termin im Buchungstool anlegen können, ohne zwischen zwei Systemen wechseln zu müssen.
- Als Patient möchte ich in der Patienten-App meine gebuchten Termine sehen, damit ich immer auf dem aktuellen Stand bin.

## Acceptance Criteria
- [ ] Import-Funktion: Admin kann Patientenliste aus Buchungstool als CSV oder via API importieren
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
_To be added by /architecture_

## QA Test Results
_To be added by /qa_

## Deployment
_To be added by /deploy_
