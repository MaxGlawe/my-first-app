# PROJ-11: Patienten-App — Dashboard & Trainingspläne

## Status: In Progress
**Created:** 2026-02-17
**Last Updated:** 2026-02-18

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

**Designed:** 2026-02-18

### Das zentrale Verbindungsproblem (Bridge)

Patienten loggen sich mit einem `auth.users`-Account ein, aber ihre Behandlungsdaten (Zuweisungen, Erledigungen) sind an den `patients`-Eintrag (Kliniknummer) geknüpft. Diese beiden IDs müssen verknüpft werden.

**Lösung:** Ein neues Feld `user_id` in der `patients`-Tabelle speichert die Auth-Account-ID des Patienten. Wenn ein Patient sich in der App einloggt, wird sein `patients.id` über `user_id = auth.uid()` gefunden und für alle weiteren Abfragen genutzt. Diese Migration löst gleichzeitig BUG-5 aus PROJ-10.

---

### Component Structure (Seitenstruktur)

```
/app/dashboard  (bestehende Seite — wird ersetzt)
+-- HeuteKarte
|   +-- "Heute trainieren!" → Link zu /app/training  (wenn Trainingstag)
|   +-- "Kein Training heute" + nächster Trainingstag  (wenn kein Training)
+-- FortschrittsRing  (7-Tage-Compliance in %, farbkodiert)
+-- MeineTermineKarte  (bestehend)
+-- Schnell-Links: "Meine Pläne" → /app/plans, "Mein Fortschritt" → /app/progress

/app/training  (neue Seite — Tagesübersicht)
+-- HeuteTrainingsPage
    +-- Liste aller heutigen Zuweisungen
    +-- ZuweisungsKarte (Planname, Anzahl Übungen, geschätzte Dauer)
    +-- "Training starten" → Link zu /app/training/[zuweisungsId]

/app/training/[zuweisungsId]  (neue Seite — Trainings-Session)
+-- SessionProgressBar  (Übung X von Y)
+-- ÜbungsCard  (eine Übung auf einmal)
|   +-- MediaAnzeige  (Bild oder Video; bei Fehler: Text-Fallback)
|   +-- Übungsname + Muskelgruppen
|   +-- SatzTracker  (Satz 1/3 ✓  Satz 2/3 ✓  Satz 3/3)
|   |   +-- PauseTimer  (Countdown in Sekunden — startet nach jedem Satz)
|   +-- AusfuehrungsSchritte  (ausklappbar)
+-- NavigationsLeiste
|   +-- "Überspringen" (mit optionalem Freitext-Grund)
|   +-- "Weiter" / "Einheit abschließen" (letzte Übung)
+-- AbschlussScreen  (wenn alle Übungen fertig)
    +-- Erfolgsnachricht + grüne Bestätigung
    +-- Einheit wird automatisch als "erledigt" gespeichert
    +-- "Zurück zum Dashboard"

/app/plans  (neue Seite — Planübersicht)
+-- MeinePlaenePage
    +-- AktivePlaene-Sektion
    |   +-- PlanKarte  (Planname, Compliance %, Zeitraum, nächste Einheit)
    |   +-- "Training starten" → /app/training/[zuweisungsId]
    +-- AbgelaufenePlaene-Sektion  (eingeklappt)
        +-- PlanKarte  (read-only, archiviert)

/app/progress  (neue Seite — Fortschrittsübersicht)
+-- FortschrittsPage
    +-- KalenderView  (4 Wochen)
    |   +-- Tag-Zellen: Grün = erledigt / Grau = verpasst / Leer = kein Training
    +-- StatistikZeile  (aktueller Streak, Gesamt-Compliance %, Einheiten gesamt)
```

---

### Datenmodell

**Neue DB-Spalte (Migration):**
- `patients.user_id UUID` (nullable, unique) — verknüpft den Auth-Account des Patienten mit dem Klinik-Patienteneintrag

**Genutzte bestehende Tabellen (keine neuen):**
- `patient_assignments` — alle Zuweisungen des Patienten (geladen über patients.id)
- `assignment_completions` — welche Einheiten erledigt sind
- `training_plans`, `plan_phases`, `plan_units`, `plan_exercises` — Übungsinhalt
- `exercises` — Medien, Schritte, Parameter

**Session-Zwischenstand (kein Server nötig):**
- `localStorage`-Eintrag pro Sitzung speichert: welche Übungen in der laufenden Session bereits abgehakt wurden
- Beim Schließen der App bleibt der Fortschritt erhalten; beim Öffnen wird weitergmacht
- Nur beim Abschließen der gesamten Einheit wird ein API-Aufruf gemacht (Completion)

---

### Neue API-Endpunkte

| Route | Zweck |
|---|---|
| `GET /api/me/profile` | Gibt den patients-Datensatz des eingeloggten Patienten zurück (lookup via user_id = auth.uid()) |
| `GET /api/me/assignments` | Gibt alle aktiven Zuweisungen des Patienten zurück (mit Compliance + Übungsdetails) |
| `POST /api/assignments/[id]/completions` | Bereits vorhanden (PROJ-10) — Patient markiert Einheit als erledigt |

---

### Tech-Entscheidungen

| Entscheidung | Warum |
|---|---|
| Neue Seiten unter `/app/` | Trennung zwischen Therapeuten-Interface (`/os/`) und Patienten-App (`/app/`) — eigene visuelle Sprache, eigene Navigation |
| `patients.user_id`-Spalte als Bridge | Einfachste Lösung ohne zusätzliche Mapping-Tabelle; der Patient-Auth-Account wird genau einmal verknüpft |
| Eine Übung nach der anderen (kein Scrollen) | Mobile-First: eine große Karte = kein Scrollen, klare Fokussierung; motivierender als Liste |
| PauseTimer in React-State (kein Backend) | Zählt nur lokal im Browser; kein API-Aufruf nötig; wird beim Seitenwechsel zurückgesetzt — das ist ok |
| localStorage für Session-Zwischenstand | Patient schließt App mitten im Training → beim Öffnen weitermachen ohne Server-Abfrage; sauber, weil nur temporäre Daten |
| Completion erst am Ende der Session | Statt nach jeder Übung — vereinfacht die API-Calls und verhindert Partial-Completions bei Abbruch |
| Offline (Service Worker) → PROJ-14 | Service Worker aufzusetzen erfordert eigene PWA-Konfiguration; bewusst in PROJ-14 ausgelagert |

### Keine neuen Pakete

Alle benötigten UI-Komponenten (Progress, Card, Calendar, Badge, Collapsible) sind bereits über shadcn/ui installiert. PauseTimer mit JavaScript `setInterval`. Kein neues Package nötig.

## QA Test Results
_To be added by /qa_

## Deployment
_To be added by /deploy_
