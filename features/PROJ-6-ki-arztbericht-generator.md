# PROJ-6: KI-Arztbericht-Generator

## Status: Planned
**Created:** 2026-02-17
**Last Updated:** 2026-02-17

## Dependencies
- Requires: PROJ-1 (Authentifizierung & Rollenrechte — Heilpraktiker-Rolle)
- Requires: PROJ-3 (Anamnese & Untersuchungsdokumentation)
- Requires: PROJ-4 (Befund & Diagnose)
- Requires: PROJ-5 (Behandlungsdokumentation)

## User Stories
- Als Heilpraktiker möchte ich per Klick einen Arztbericht generieren lassen, der automatisch Anamnese, Befund, Diagnose und Behandlungsverlauf eines Patienten zusammenfasst, damit ich keine Stunde für das Schreiben aufwende.
- Als Heilpraktiker möchte ich den KI-Entwurf vor dem Versenden überarbeiten und ergänzen können, damit ich für den Inhalt verantwortlich bleibe.
- Als Heilpraktiker möchte ich fertige Arztberichte als PDF exportieren und in der Akte archivieren, damit alles an einem Ort ist.
- Als Heilpraktiker möchte ich einen Zeitraum wählen (z.B. letzten 3 Monate), aus dem die KI die Daten für den Bericht zieht.

## Acceptance Criteria
- [ ] "Arztbericht generieren"-Button in der Patientenakte (nur für Heilpraktiker sichtbar)
- [ ] Zeitraum-Auswahl: Datum-von / Datum-bis für die einzubeziehenden Dokumentationen
- [ ] KI-Generierung: Claude API erstellt Arztbrief-Entwurf basierend auf: Stammdaten, Anamnese, Diagnosen (ICD-10), Behandlungsverlauf (NRS, Maßnahmen), Therapieziel
- [ ] Generierungsdauer: < 30 Sekunden mit Fortschrittsanzeige
- [ ] Editor: Entwurf in bearbeitbarem Rich-Text-Editor (kein Raw-Markdown)
- [ ] Professionelles Layout: Praxis-Briefkopf (Logo, Adresse, Datum), Empfänger-Feld (Arzt/Klinik)
- [ ] Speichern & Archivieren: Finaler Bericht wird in `medical_reports` Tabelle gespeichert
- [ ] PDF-Export: Korrekt formatiert, A4, mit Unterschriftsfeld
- [ ] Versionierung: Jeder generierte Entwurf wird mit Timestamp gespeichert (Audit-Trail)
- [ ] Server-seitige Absicherung: API-Route nur für Heilpraktiker und Admin

## Edge Cases
- Was passiert, wenn die Claude API nicht antwortet? → Timeout nach 60s, Fehlermeldung, erneut versuchen möglich
- Was passiert, wenn zu wenig Dokumentation vorhanden ist (< 1 Behandlungseinheit)? → Warnung: "Zu wenig Daten für vollständigen Bericht" mit Hinweis welche Daten fehlen
- Was passiert, wenn der Patient noch keine Diagnose hat (kein PROJ-4-Eintrag)? → Bericht ohne Diagnose-Abschnitt, Hinweis im Editor
- Was passiert mit dem KI-Prompt? → Patientendaten werden NICHT zur KI-Verbesserung genutzt (Anthropic API: kein Training auf User Data bei API-Nutzung)

## Technical Requirements
- Claude API: `claude-opus-4-6` für maximale Qualität der Arztberichte
- System-Prompt: Strukturierter medizinischer Arztbrief-Prompt (deutsch, professionell)
- Datenschutz: Patientenname im Prompt durch Pseudonym ersetzt, nach Generierung wiederhergestellt
- Tabelle: `medical_reports` mit `patient_id`, `generated_by`, `draft_content`, `final_content`, `pdf_url`
- PDF-Generierung: `@react-pdf/renderer` oder Puppeteer serverseitig
- Rate Limiting: Max 10 Generierungen pro Therapeut pro Stunde

---

## Tech Design (Solution Architect)
_To be added by /architecture_

## QA Test Results
_To be added by /qa_

## Deployment
_To be added by /deploy_
