# PROJ-9: Trainingsplan-Builder (Drag & Drop)

## Status: Planned
**Created:** 2026-02-17
**Last Updated:** 2026-02-17

## Dependencies
- Requires: PROJ-1 (Authentifizierung & Rollenrechte)
- Requires: PROJ-8 (Übungsdatenbank-Verwaltung)

## User Stories
- Als Therapeut möchte ich per Drag & Drop Übungen aus der Bibliothek in einen Trainingsplan ziehen und anordnen, damit die Planerstellung schnell und intuitiv ist.
- Als Therapeut möchte ich für jede Übung im Plan individuelle Parameter setzen (Wiederholungen, Sätze, Pause, Intensität, spezifische Hinweise), damit der Plan auf den Patienten zugeschnitten ist.
- Als Therapeut möchte ich Trainingspläne in Wochen oder Phasen unterteilen können (z.B. Woche 1-2: Mobilisation, Woche 3-4: Kräftigung), damit der Verlauf strukturiert ist.
- Als Therapeut möchte ich bestehende Trainingspläne als Vorlage kopieren und für einen neuen Patienten anpassen, damit ich nicht jeden Plan von Null aufbauen muss.

## Acceptance Criteria
- [ ] Drag & Drop Interface: Übungen aus Bibliotheks-Panel (links) per Drag in Plan-Bereich (rechts) ziehen
- [ ] Plan-Struktur: Plan hat einen Namen, eine Beschreibung und besteht aus ein oder mehreren "Einheiten" (Trainingstage)
- [ ] Reihenfolge ändern: Übungen innerhalb einer Einheit per Drag & Drop umsortieren
- [ ] Übungs-Parameter pro Plan-Item: Sätze, Wiederholungen (oder Sekunden), Pause (Sekunden), Intensität (%), Anmerkung (Freitext)
- [ ] Phasen/Wochen: Einheiten können in Phasen gruppiert werden (Phasenname, Dauer in Wochen)
- [ ] Planvorschau: "Patienten-Ansicht" zeigt, wie der Plan für den Patienten aussieht
- [ ] Plan-Templates: Therapeut kann eigene Pläne als Template markieren und wiederverwenden
- [ ] Plan bearbeiten: Jederzeit editierbar; aktive Pläne beim Patienten werden nicht automatisch überschrieben
- [ ] Plan duplizieren: Vollständige Kopie eines Plans für neuen Patienten
- [ ] Drag & Drop funktioniert auf Touch-Geräten (Tablet im Behandlungsraum)

## Edge Cases
- Was passiert, wenn eine Übung aus der Datenbank gelöscht wird, die im Plan enthalten ist? → Übung bleibt im Plan als "Archiviert" erhalten, wird orange markiert
- Was passiert, wenn ein Plan keine Übungen enthält? → Plan kann gespeichert, aber nicht dem Patienten zugewiesen werden (Validierung)
- Was passiert, wenn der Therapeut versehentlich alle Übungen löscht? → Undo (Ctrl+Z) für die letzten 10 Aktionen
- Was passiert auf kleinen Bildschirmen? → Bibliothek und Plan-Bereich wechseln in Tab-Layout (kein Side-by-Side)

## Technical Requirements
- Drag & Drop: `@dnd-kit/core` (zugänglich, touch-fähig, lightweight)
- Tabelle: `training_plans` mit `created_by`, `template_flag`; `plan_items` mit `exercise_id`, `plan_id`, `order`, `params (JSONB)`
- Auto-Save: Plan-Änderungen werden nach 2s Inaktivität gespeichert
- Performance: Plan mit 30 Übungen lädt in < 200ms

---

## Tech Design (Solution Architect)
_To be added by /architecture_

## QA Test Results
_To be added by /qa_

## Deployment
_To be added by /deploy_
