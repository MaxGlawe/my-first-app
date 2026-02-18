# PROJ-11: Patienten-App — Dashboard & Trainingspläne

## Status: Planned
**Created:** 2026-02-17
**Last Updated:** 2026-02-17

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
_To be added by /architecture_

## QA Test Results
_To be added by /qa_

## Deployment
_To be added by /deploy_
