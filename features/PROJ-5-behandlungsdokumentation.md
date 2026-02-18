# PROJ-5: Behandlungsdokumentation

## Status: Planned
**Created:** 2026-02-17
**Last Updated:** 2026-02-17

## Dependencies
- Requires: PROJ-1 (Authentifizierung & Rollenrechte)
- Requires: PROJ-2 (Patientenstammdaten)
- Requires: PROJ-3 (Anamnese & Untersuchungsdokumentation)

## User Stories
- Als Physiotherapeut möchte ich nach jeder Behandlung ein Therapieprotokoll erfassen (Datum, Dauer, durchgeführte Maßnahmen, Patientenreaktion, nächste Schritte), damit der Behandlungsverlauf lückenlos dokumentiert ist.
- Als Therapeut möchte ich vordefinierte Maßnahmen-Templates wählen (z.B. KG, MT, MLD, US), damit ich die Dokumentation in < 3 Minuten abschließe.
- Als Therapeut möchte ich den Behandlungsfortschritt im Verlauf sehen (Timeline-Ansicht), damit ich Verbesserungen oder Stagnation erkenne.
- Als Therapeut möchte ich Notizen aus der letzten Behandlung als Vorlage für die aktuelle nutzen können, damit ich schneller dokumentiere.
- Als Admin möchte ich die Behandlungshistorie aller Patienten einsehen, damit ich Qualitätssicherung betreiben kann.

## Acceptance Criteria
- [ ] Behandlungsprotokoll-Formular: Datum (auto), Behandlungsdauer (min), Therapeut (auto), Maßnahmen (Mehrfachauswahl)
- [ ] Maßnahmen-Katalog: KG, MT (Manuelle Therapie), MLD, US (Ultraschall), TENS, Wärme/Kälte, Elektrotherapie, Atemtherapie + Freitext
- [ ] Schmerzwert (NRS 0-10) zu Beginn und Ende der Behandlung
- [ ] Freitextfeld: Patientenreaktion, Besonderheiten, Beobachtungen
- [ ] Nächste Schritte / Therapieziel für nächste Einheit
- [ ] Timeline-Ansicht: Alle Behandlungen eines Patienten chronologisch mit NRS-Verlaufschart
- [ ] Behandlung bearbeiten: Nur innerhalb 24h nach Erstellung (danach readonly — Rechtssicherheit)
- [ ] Unterschrift/Bestätigung: Therapeut bestätigt Protokoll mit Klick (kein digitales Zertifikat nötig)
- [ ] Schnell-Vorlage: "Wie letzte Behandlung" übernimmt Maßnahmen der letzten Session

## Edge Cases
- Was passiert, wenn zwei Protokolle am gleichen Tag für den gleichen Patienten erstellt werden? → Erlaubt (mehrere Einheiten/Tag möglich), Zeitstempel differenziert
- Was passiert, wenn ein Therapeut vergisst, das Protokoll zu speichern und den Browser schließt? → Auto-Save alle 30 Sekunden als Entwurf
- Was passiert nach der 24h-Bearbeitungsfrist? → Readonly mit Hinweis, Admin kann freischalten für Korrekturen
- Was passiert, wenn eine Behandlungseinheit über Mitternacht geht? → Datum des Behandlungsbeginns wird gespeichert

## Technical Requirements
- Tabelle: `treatment_sessions` mit `patient_id`, `therapist_id`, `date`, `measures (JSONB)`, `locked_at`
- Auto-Save: Optimistic UI + Debounce 30s
- NRS-Verlauf: Aggregiert für Chart-Darstellung (recharts oder ähnliches)
- Performance: Ladezeit der Behandlungshistorie < 500ms für bis zu 200 Einträge

---

## Tech Design (Solution Architect)
_To be added by /architecture_

## QA Test Results
_To be added by /qa_

## Deployment
_To be added by /deploy_
