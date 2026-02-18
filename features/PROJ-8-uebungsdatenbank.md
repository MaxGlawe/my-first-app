# PROJ-8: Übungsdatenbank-Verwaltung

## Status: Planned
**Created:** 2026-02-17
**Last Updated:** 2026-02-17

## Dependencies
- Requires: PROJ-1 (Authentifizierung & Rollenrechte)

## User Stories
- Als Therapeut möchte ich Übungen anlegen (Name, Beschreibung, Video/Bild, Muskelgruppe, Schwierigkeitsgrad), damit ich eine eigene Bibliothek aufbaue, aus der ich Trainingspläne zusammenstelle.
- Als Therapeut möchte ich Übungen nach Muskelgruppe, Schwierigkeitsgrad oder Name filtern und durchsuchen, damit ich schnell die richtige Übung finde.
- Als Admin möchte ich eine Basis-Bibliothek mit Standard-PT-Übungen im System vorinstallieren, damit neue Therapeuten sofort produktiv arbeiten können.
- Als Therapeut möchte ich Übungen aus der Praxis-Bibliothek in meine persönliche Favoriten-Liste übernehmen, damit meine meist-genutzten Übungen schnell erreichbar sind.

## Acceptance Criteria
- [ ] Übungs-Formular: Name, Beschreibung (Freitext), Ausführungsanweisung (nummerierte Schritte), Muskelgruppe (Mehrfachauswahl), Schwierigkeitsgrad (Anfänger/Mittel/Fortgeschritten)
- [ ] Medien-Upload: Bild (JPG/PNG, max 5MB) oder Video-URL (YouTube/Vimeo-Link) pro Übung
- [ ] Parameter-Felder: Standardwiederholungen, Standardsätze, Standardpause (als Vorlage beim Zuweisen)
- [ ] Filter & Suche: Freitextsuche + Filter nach Muskelgruppe, Schwierigkeit, eigene vs. Praxis-Bibliothek
- [ ] Favoritenliste: Therapeuten können Übungen als Favoriten markieren
- [ ] Vorinstallierte Bibliothek: 50+ Standard-PT-Übungen (Hüfte, Knie, Schulter, LWS, HWS, Core)
- [ ] Übung bearbeiten/löschen: Nur eigene Übungen; Praxis-Übungen nur durch Admin
- [ ] Übungen duplizieren: Praxis-Übung kopieren und personalisieren

## Edge Cases
- Was passiert, wenn ein Video-Link nicht mehr funktioniert? → Broken-Link-Indikator, Therapeut wird benachrichtigt
- Was passiert, wenn eine Übung gelöscht wird, die in aktiven Trainingsplänen verwendet wird? → Warnung, Übung wird in Plänen auf "Archiviert" gesetzt (bleibt sichtbar, kann nicht neu zugeteilt werden)
- Was passiert bei sehr großen Video-Uploads? → Nur URL-Links erlaubt für Videos (kein direkter Video-Upload), um Speicherkosten zu minimieren

## Technical Requirements
- Tabelle: `exercises` mit `created_by`, `is_public` (für Praxis-Bibliothek), `muscle_groups (ARRAY)`, `media_url`
- Storage: Bilder in Supabase Storage, Ordner `exercises/`
- Favoriten: `exercise_favorites` Join-Tabelle
- Performance: Übungsliste mit 500+ Einträgen < 300ms (mit Volltextsuche via Supabase `fts`)

---

## Tech Design (Solution Architect)
_To be added by /architecture_

## QA Test Results
_To be added by /qa_

## Deployment
_To be added by /deploy_
