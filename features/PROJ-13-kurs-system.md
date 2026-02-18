# PROJ-13: Kurs-System (Skalierbares Gruppen-Angebot)

## Status: Planned
**Created:** 2026-02-17
**Last Updated:** 2026-02-17

## Dependencies
- Requires: PROJ-1 (Authentifizierung & Rollenrechte)
- Requires: PROJ-8 (Übungsdatenbank — Übungen in Kursen verwenden)
- Requires: PROJ-11 (Patienten-App — Zugriffspunkt für Patienten)

## User Stories
- Als Therapeut/Admin möchte ich Online-Kurse erstellen (z.B. "Rücken-Fit in 8 Wochen"), die viele Patienten gleichzeitig absolvieren können, ohne dass ich jeden einzeln betreuen muss.
- Als Therapeut möchte ich einen Kurs aus Lektionen aufbauen (Lektionen = Übungseinheiten, Texte, Videos), die in einer bestimmten Reihenfolge freigeschaltet werden.
- Als Admin möchte ich Patienten zu einem Kurs einschreiben oder sie selbst einschreiben lassen, damit der Kurs skalierbar ist.
- Als Patient möchte ich in der Patienten-App meine laufenden Kurse sehen und Lektionen Schritt für Schritt absolvieren.
- Als Therapeut möchte ich Kurs-Fortschritte aller Teilnehmer auf einen Blick sehen, damit ich weiß, wer noch Hilfe braucht.

## Acceptance Criteria
- [ ] Kurs-Erstellung: Name, Beschreibung, Titelbild, Dauer (Wochen), Kategorie (Rücken, Schulter, Knie, etc.)
- [ ] Lektions-Editor: Lektionen anlegen mit Titel, Beschreibungstext (Rich Text), Video-URL, zugehörige Übungseinheit (aus Trainingsplan-Builder)
- [ ] Freischaltung: Lektionen werden sequenziell freigeschaltet (Lektion 2 erst nach Abschluss von Lektion 1) oder alle direkt verfügbar (Therapeuten-Wahl)
- [ ] Einschreibung: Admin schreibt Patienten direkt ein; optional: Einladungslink für Selbsteinschreibung
- [ ] Patienten-Ansicht: Kurs-Übersicht in App, Lektions-Player mit Fortschrittsbalken
- [ ] Fortschritts-Tracking: Patient markiert Lektion als abgeschlossen
- [ ] Therapeuten-Dashboard: Teilnehmerliste mit Fortschritt (%)
- [ ] Kurs-Status: Entwurf / Aktiv / Archiviert
- [ ] Mehrere Kurse gleichzeitig für einen Patienten möglich

## Edge Cases
- Was passiert, wenn ein Kurs geändert wird, während Patienten ihn aktiv absolvieren? → Bestehende Einschreibungen sehen die alte Version, neue Einschreibungen sehen die neue
- Was passiert, wenn ein Patient einen Kurs abbricht? → Status "Abgebrochen", kann erneut eingeschrieben werden
- Was passiert, wenn ein Video-Link im Kurs bricht? → Broken-Link-Warnung für Therapeut, Patient sieht Text-Fallback

## Technical Requirements
- Tabellen: `courses`, `course_lessons`, `course_enrollments`, `lesson_completions`
- Rich Text: `tiptap` Editor für Lektionsbeschreibungen
- Kurs-Fortschritt: Berechnet aus `completed_lessons / total_lessons`
- Performance: Kurs-Übersicht mit 20 Lektionen lädt in < 500ms

---

## Tech Design (Solution Architect)
_To be added by /architecture_

## QA Test Results
_To be added by /qa_

## Deployment
_To be added by /deploy_
