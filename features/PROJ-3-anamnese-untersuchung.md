# PROJ-3: Anamnese & Untersuchungsdokumentation

## Status: Planned
**Created:** 2026-02-17
**Last Updated:** 2026-02-17

## Dependencies
- Requires: PROJ-1 (Authentifizierung & Rollenrechte)
- Requires: PROJ-2 (Patientenstammdaten)

## User Stories
- Als Physiotherapeut möchte ich bei der Erstaufnahme eine strukturierte Anamnese erfassen (Hauptbeschwerde, Schmerzanamnese, Vorerkrankungen, Medikamente), damit alle relevanten Informationen zentral gespeichert sind.
- Als Therapeut möchte ich Untersuchungsbefunde dokumentieren (Bewegungsausmaß, Muskeltests, Schmerzlokalisation auf Körperbild), damit meine Kollegen den Status des Patienten nachvollziehen können.
- Als Therapeut möchte ich frühere Anamnesebögen einsehen können, damit ich Veränderungen im Verlauf erkenne.
- Als Heilpraktiker möchte ich erweiterte Untersuchungsfelder sehen (z.B. Differentialdiagnosen-Checklisten), die einem normalen PT nicht angezeigt werden.

## Acceptance Criteria
- [ ] Anamnesebogen-Formular: Hauptbeschwerde, Schmerzdauer, Schmerzcharakter (NRS 0-10), Lokalisation
- [ ] Vorerkrankungen (Mehrfachauswahl aus Katalog + Freitext)
- [ ] Aktuelle Medikamente (Freitext)
- [ ] Untersuchungsfelder: Bewegungsausmaß (Gelenk, Bewegungsrichtung, Grad), Kraftgrad (0-5 nach Janda)
- [ ] Körperschema-Markierung: Schmerzlokalisation auf SVG-Körperbild (anterior/posterior) per Klick markierbar
- [ ] Versionierung: Jede Anamnese-Erfassung wird als eigener Eintrag gespeichert (Verlauf sichtbar)
- [ ] Heilpraktiker-Erweiterung: Differentialdiagnosen-Notizfeld und erweiterte orthopädische Tests
- [ ] Physiotherapeuten sehen kein Diagnosefeld (nur in PROJ-4)
- [ ] Export als PDF möglich

## Edge Cases
- Was passiert, wenn eine Anamnese nur zur Hälfte ausgefüllt ist? → Als Entwurf speicherbar, Markierung "Unvollständig"
- Was passiert, wenn zwei Therapeuten gleichzeitig die Akte bearbeiten? → Letzter Stand gewinnt, Warnung bei parallelem Edit
- Was passiert, wenn der Patient keine Vorerkrankungen hat? → Checkbox "Keine bekannt" setzt Pflichtfeld als ausgefüllt

## Technical Requirements
- Tabelle: `anamnesis_records` mit `patient_id`, `created_by`, `version`, `data (JSONB)`
- SVG-Körperbild: Interaktives Markup gespeichert als JSON-Koordinaten
- RLS: Nur zugewiesene Therapeuten und Admins dürfen Daten lesen/schreiben

---

## Tech Design (Solution Architect)
_To be added by /architecture_

## QA Test Results
_To be added by /qa_

## Deployment
_To be added by /deploy_
