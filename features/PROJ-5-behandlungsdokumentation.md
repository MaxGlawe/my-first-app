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
**Designed:** 2026-02-18

### Seitenstruktur & Komponenten

```
/os/patients/[id]                                ← Patientenakte (existiert bereits)
+-- Tab: Behandlungen                            ← neuer Tab (alle Therapeuten + Admin)
    +-- BehandlungTab
        +-- NrsVerlaufChart                      ← recharts LineChart: NRS start/end über Zeit
        +-- "Neue Behandlung" Button
        +-- BehandlungTimeline
            +-- BehandlungCard
            |   (Datum, Therapeut, Maßnahmen-Badges, NRS start→end, Dauer, Status-Badge)
            +-- Leer-Zustand
            +-- Lade-Skeleton

/os/patients/[id]/behandlung/new                 ← Neue Behandlung erfassen
+-- BehandlungForm
    +-- Datum (auto: heute, überschreibbar)
    +-- Behandlungsdauer (Minuten, Zahlenfeld)
    +-- NRS Beginn (Slider 0-10)
    +-- Maßnahmen-Auswahl (Checkbox-Gruppe)
    |   KG | MT | MLD | US | TENS | Wärme | Kälte | Elektrotherapie | Atemtherapie
    +-- Freitext: Patientenreaktion & Besonderheiten
    +-- NRS Ende (Slider 0-10)
    +-- Nächste Schritte (Freitext)
    +-- "Wie letzte Behandlung" Button  ← füllt Maßnahmen der letzten Session vor
    +-- Auto-Save Indikator (30s Debounce, useDebounce aus PROJ-2 wiederverwendet)
    +-- "Als Entwurf speichern" / "Abschließen & bestätigen" Buttons

/os/patients/[id]/behandlung/[sessionId]         ← Behandlungsansicht (read-only)
+-- BehandlungView
    +-- Alle Felder read-only dargestellt
    +-- Sperr-Hinweis: "Bearbeitbar bis [Datum+24h]" oder "Gesperrt (Admin kann freischalten)"
    +-- "Bearbeiten" Button (nur wenn < 24h alt UND Entwurf/eigene Behandlung oder Admin)
    +-- "Als PDF exportieren" Button (window.print)

/os/patients/[id]/behandlung/[sessionId]/edit    ← Behandlung bearbeiten (< 24h)
+-- BehandlungEditForm
    (gleiche Felder wie BehandlungForm, vorausgefüllt via PATCH-Endpoint)
```

### Datenmodell

**Tabelle `treatment_sessions`:**
- `id` — UUID, Primärschlüssel
- `patient_id` — Verknüpfung zum Patienten
- `therapist_id` — Durchführender Therapeut (= created_by)
- `session_date` — Datum der Behandlung (DATE, nicht DATETIME — Beginn zählt)
- `duration_minutes` — Behandlungsdauer in Minuten (Integer, optional)
- `measures` — JSONB-Array der Maßnahmen (z.B. `["KG", "MT", "Wärme"]` + Freitext)
- `nrs_before` — Schmerzwert Beginn (Integer 0–10)
- `nrs_after` — Schmerzwert Ende (Integer 0–10, nullable)
- `notes` — Freitext: Patientenreaktion, Besonderheiten (max 5.000 Zeichen)
- `next_steps` — Nächste Schritte für Folgeeinheit (Freitext, max 2.000 Zeichen)
- `status` — `entwurf` oder `abgeschlossen`
- `confirmed_at` — Zeitstempel der Therapeuten-Bestätigung (beim Abschließen)
- `locked_at` — Automatische Sperrzeit: `created_at + 24 Stunden` (vom Server berechnet)
- `created_at`, `updated_at`

**Maßnahmen-Katalog (statisch im Frontend, keine eigene Tabelle nötig):**
KG (Krankengymnastik), MT (Manuelle Therapie), MLD (Manuelle Lymphdrainage),
US (Ultraschall), TENS, Wärme, Kälte, Elektrotherapie, Atemtherapie, Freitext

**NRS-Verlaufsdaten:** API liefert sortierte Liste von `(session_date, nrs_before, nrs_after)` für recharts LineChart — kein eigener Aggregations-Endpoint nötig, da Daten bereits in der Behandlungshistorie enthalten sind.

**RLS (Row Level Security):**
- Therapeut → liest/schreibt nur eigene Patienten-Sessions
- Admin → liest/schreibt alle
- Patient → kein Zugriff (über `/app/*` wird separat in PROJ-11 gebaut)

### Tech-Entscheidungen

| Entscheidung | Begründung |
|---|---|
| `recharts` für NRS-Chart | Leichtgewichtig, React-nativ, beste Next.js-Kompatibilität; shadcn/ui Chart-Komponente basiert darauf |
| `locked_at = created_at + 24h` (serverberechnet) | Server setzt den Wert — Manipulation über Client ausgeschlossen |
| Auto-Save mit `useDebounce` (30s) | Hook bereits in PROJ-2 implementiert, wiederverwendbar ohne neue Abhängigkeit |
| Maßnahmen-Katalog hardcoded im Frontend | Liste ist stabil, keine DB-Tabelle nötig, kein Admin-Interface erforderlich |
| Gleiche Seitenstruktur wie PROJ-3/4 | Konsistenz für Therapeuten (Tab in Patientenakte → New-Seite → Detail-Seite → Edit-Seite) |
| `session_date` als DATE (nicht TIMESTAMP) | Über-Mitternacht-Problem gelöst: Datum des Behandlungsbeginns wird gespeichert |
| Mehrere Sessions pro Tag erlaubt | Zeitstempel differenziert, keine Unique-Constraint auf `(patient_id, session_date)` |

### Neue Pakete
- `recharts` — NRS-Verlaufschart (LineChart mit zwei Linien: NRS Beginn + NRS Ende)

## QA Test Results
_To be added by /qa_

## Deployment
_To be added by /deploy_
