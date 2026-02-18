# PROJ-10: Hausaufgaben-Zuweisung

## Status: Planned
**Created:** 2026-02-17
**Last Updated:** 2026-02-17

## Dependencies
- Requires: PROJ-1 (Authentifizierung & Rollenrechte)
- Requires: PROJ-2 (Patientenstammdaten)
- Requires: PROJ-9 (Trainingsplan-Builder)

## User Stories
- Als Therapeut möchte ich einem Patienten nach der Behandlung einen Trainingsplan als Hausaufgabe zuweisen (mit Startdatum, Enddatum, Häufigkeit pro Woche), damit der Patient zuhause strukturiert üben kann.
- Als Therapeut möchte ich sehen, ob ein Patient seine Hausaufgaben abgehakt hat, damit ich beim nächsten Termin gezielt nachfragen kann.
- Als Therapeut möchte ich einem Patienten auch einzelne Übungen (ohne vollständigen Plan) als Ad-hoc-Hausaufgabe schicken, damit ich flexibel reagieren kann.
- Als Patient möchte ich eine Erinnerungsbenachrichtigung erhalten, wenn ich heute trainieren sollte, damit ich meine Hausaufgaben nicht vergesse.

## Acceptance Criteria
- [ ] Zuweisung: Therapeut wählt Patient → wählt Trainingsplan → setzt Startdatum, Enddatum, Trainingstage (Mo/Di/Mi/Do/Fr/Sa/So)
- [ ] Ad-hoc-Übung: Einzelne Übungen direkt zuweisen ohne vollständigen Plan
- [ ] Zuweisungs-Übersicht: Pro Patient alle aktiven und abgelaufenen Hausaufgaben-Pläne
- [ ] Compliance-Tracking: Patient markiert Einheit als "erledigt" — Therapeut sieht Erledigungsrate (%)
- [ ] Therapeuten-Dashboard: Übersicht aller Patienten mit deren heutiger Compliance
- [ ] Zuweisung bearbeiten: Zeitraum verlängern oder Plan tauschen jederzeit möglich
- [ ] Zuweisung beenden: Therapeut kann Plan vorzeitig deaktivieren
- [ ] Mehrere aktive Pläne: Ein Patient kann mehrere gleichzeitig aktive Pläne haben

## Edge Cases
- Was passiert, wenn der Patient eine Einheit nachträglich (gestern) als erledigt markiert? → Erlaubt, Timestamp wird gespeichert
- Was passiert, wenn ein zugewiesener Plan nachträglich vom Therapeuten geändert wird? → Aktive Zuweisung bleibt unverändert (Snapshot-Prinzip), neue Zuweisung nötig für Änderungen
- Was passiert, wenn der Plan-Endzeitpunkt überschritten ist? → Plan wechselt zu "Abgelaufen", Therapeut wird bei nächstem Login informiert
- Was passiert, wenn ein Patient keinen Account hat? → Zuweisung wird vorbereitet, wird aktiv sobald Patient sich registriert

## Technical Requirements
- Tabelle: `patient_assignments` mit `patient_id`, `plan_id`, `therapist_id`, `start_date`, `end_date`, `active_days (ARRAY)`
- Tabelle: `assignment_completions` mit `assignment_id`, `completed_date`, `patient_id`
- Compliance-Rate: Berechnet aus `completions / expected_sessions` im Zeitraum
- Push-Notifications: Via Web Push API (PROJ-14 Dependency für PWA)

---

## Tech Design (Solution Architect)

**Designed:** 2026-02-18

### Component Structure

```
/os/patients/[id]  (Bestehende Patientendetail-Seite — neuer Tab)
+-- PatientDetailHeader (bestehend)
+-- Tabs (bestehend, neuer Tab wird hinzugefügt)
    +-- Stammdaten / Anamnese / Behandlung / Befund / Termine / Berichte  (bestehend)
    +-- "Hausaufgaben" Tab (NEU)
        +-- HausaufgabenTab
            +-- HausaufgabenHeader
            |   +-- Neue Zuweisung Button → öffnet ZuweisungsDialog
            +-- AktiveZuweisungen Section
            |   +-- ZuweisungsKarte (pro aktive Zuweisung)
            |       +-- Plan-Name + Beschreibung-Preview
            |       +-- Zeitraum (Startdatum – Enddatum)
            |       +-- Wochentage-Badges (Mo Di Mi Do Fr Sa So)
            |       +-- Compliance-Ring (% erledigt, 7-Tage)
            |       +-- Notiz an Patient
            |       +-- Aktionen: Bearbeiten / Deaktivieren
            +-- AbgelaufeneZuweisungen Section (eingeklappt, toggle)
                +-- ZuweisungsKarte (archiviert, read-only, grau)

ZuweisungsDialog (Modal — Neue Zuweisung / Bearbeiten)
+-- Schritt 1: Plan auswählen (Combobox aus eigenen Training Plans)
+-- Schritt 2: Zeitraum (Startdatum / Enddatum DatePicker)
+-- Schritt 3: Trainingstage (7 Checkbox-Buttons Mo–So)
+-- Notiz an Patienten (Freitext, optional)
+-- "Zuweisen" Button / "Änderungen speichern" Button

/os/hausaufgaben  (Therapeuten-Compliance-Dashboard, neue Seite)
+-- DashboardHeader
|   +-- Datum-Anzeige ("Heute, 18. Feb.")
|   +-- Filter: Alle Patienten / Nur mit aktivem Plan
+-- KomplianzTabelle
    +-- KomplianzZeile (pro Patient mit aktivem Plan)
        +-- Patient Name + Avatar
        +-- Aktive Pläne (Anzahl)
        +-- Hat heute trainiert? (Ja/Nein Badge)
        +-- 7-Tage Compliance-Rate (Fortschrittsbalken %)
        +-- Link → Patientendetail / Hausaufgaben-Tab
```

### Datenmodell

**Tabelle `patient_assignments`:**
- ID
- Patient-ID (FK auf patients)
- Plan-ID (FK auf training_plans — optional, NULL bei Ad-hoc)
- Therapeuten-ID (FK auf auth.users)
- Startdatum, Enddatum
- Aktive Wochentage (Text-Array: `["mo", "di", "do"]`)
- Status: `aktiv` / `abgelaufen` / `deaktiviert`
- Ad-hoc Übungen (JSONB, optional — Liste von Übungs-IDs mit Parametern, wenn kein Plan)
- Notiz an Patienten (Freitext, max. 1000 Zeichen)
- Erstellt am, Aktualisiert am

**Tabelle `assignment_completions`:**
- ID
- Zuweisung-ID (FK auf patient_assignments)
- Einheiten-ID (FK auf plan_units, optional — welche Einheit des Plans)
- Erledigt-Datum (nur das Datum, kein Timestamp — ein Eintrag pro Tag pro Einheit)
- Erledigt-Timestamp (wann genau)
- Markiert von (Patient-ID)

**Compliance-Berechnung (server-seitig):**
- Erwartete Sessions im Zeitraum = Anzahl der Tage im Zeitraum × matching Wochentage
- Erledigte Sessions = Anzahl `assignment_completions` im Zeitraum
- Compliance % = erledigte / erwartete × 100

### API-Endpunkte

| Route | Zweck |
|---|---|
| `GET /api/patients/[id]/assignments` | Alle Zuweisungen für einen Patienten (aktiv + abgelaufen) |
| `POST /api/patients/[id]/assignments` | Neue Zuweisung erstellen |
| `PUT /api/patients/[id]/assignments/[aId]` | Zuweisung bearbeiten (Zeitraum, Plan, Tage) |
| `DELETE /api/patients/[id]/assignments/[aId]` | Zuweisung deaktivieren (soft) |
| `GET /api/hausaufgaben/dashboard` | Compliance-Übersicht aller Patienten des Therapeuten |
| `POST /api/assignments/[id]/completions` | Einheit als erledigt markieren (für PROJ-11 Patient App) |

### Tech-Entscheidungen

| Entscheidung | Warum |
|---|---|
| Neuer "Hausaufgaben"-Tab im bestehenden Patientenprofil | Kein neues Routing nötig — Therapeut bleibt im Kontext des Patienten; konsistent mit Anamnese/Behandlung/Befund-Tabs |
| Wochentage als Text-Array `["mo", "di"]` | Flexibel, human-readable, einfach zu filtern — kein Bitmask-Encoding |
| Plan-FK (kein Snapshot) | Pläne nutzen Soft-Delete und werden nie überschrieben (save_training_plan immer neu insert) — das FK-Referenz-Prinzip reicht als "Snapshot" |
| Ad-hoc Übungen via JSONB in derselben Tabelle | Vermeidet extra Tabelle für einfachen Use-Case; wenn `plan_id = null` und `adhoc_exercises` befüllt → Ad-hoc-Modus |
| Compliance-Rate server-seitig berechnet | Logik ist datums-sensitiv (relative zu heute) — nicht sinnvoll im Client zu halten |
| Separates `/os/hausaufgaben` Dashboard | Therapeut braucht Bird's-Eye-View über alle Patienten — nicht nur einen; eigene Seite sinnvoll |
| `assignment_completions` jetzt anlegen | PROJ-11 (Patient App) wird diese Tabelle nutzen — Schema muss vorab existieren |

### Keine neuen Pakete

Alle benötigten UI-Komponenten (DatePicker via `Popover + Calendar`, Checkboxen, Badges, Progress) sind bereits über shadcn/ui verfügbar. Datums-Arithmetik mit JavaScript `Date` built-in.

## QA Test Results
_To be added by /qa_

## Deployment
_To be added by /deploy_
