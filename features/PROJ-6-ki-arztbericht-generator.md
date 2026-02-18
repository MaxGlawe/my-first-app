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
**Designed:** 2026-02-18

### Seitenstruktur & Komponenten

```
/os/patients/[id]                           ← Patientenakte
+-- Tab: Arztberichte                       ← neuer Tab (nur Heilpraktiker + Admin)
    +-- ArztberichtTab
        +-- "Neuen Bericht generieren" Button
        +-- ArztberichtListe
            +-- ArztberichtCard
            |   (Datum, Empfänger, Status-Badge: Entwurf/Finalisiert, Aktionen)
            +-- Leer-Zustand
            +-- Lade-Skeleton

/os/patients/[id]/arztbericht/new           ← Konfiguration vor Generierung
+-- ArztberichtKonfigForm
    +-- Zeitraum-Auswahl: Datum-von / Datum-bis
    +-- Datenverfügbarkeit-Info
    |   (z.B. "3 Behandlungen, 1 Befund im gewählten Zeitraum gefunden")
    +-- Empfänger-Felder: Name (Arzt/Klinik), Adresse
    +-- "Arztbericht generieren" Button
    +-- KI-Fortschrittsanzeige (Spinner + Statustext, max 60s Timeout)
    → Weiterleitung zu [reportId] nach Erfolg

/os/patients/[id]/arztbericht/[reportId]    ← Editor & Archivansicht
+-- ArztberichtEditor
    +-- Briefkopf-Vorschau (Praxis-Logo, Adresse, Datum, Empfänger — read-only)
    +-- TipTap Rich-Text-Editor (bearbeitbarer Entwurf)
    +-- "Als Entwurf speichern" Button
    +-- "Finalisieren & archivieren" Button (sperrt Editor, setzt Status = finalisiert)
    +-- "Als PDF exportieren" Button (window.print mit Briefkopf-Layout)
    +-- Versions-Info: "Generiert am [Datum] — KI-Entwurf"
```

### Datenmodell

**Tabelle `medical_reports`:**
- `id` — UUID, Primärschlüssel
- `patient_id` — Verknüpfung zum Patienten
- `generated_by` — Heilpraktiker der den Bericht erstellt hat
- `date_from` / `date_to` — Zeitraum der einbezogenen Dokumentation
- `recipient_name` — Empfänger (Arzt/Klinik)
- `recipient_address` — Adresse des Empfängers (Freitext)
- `draft_content` — Originaler KI-Entwurf (unveränderlich gespeichert — Audit-Trail)
- `final_content` — Bearbeitete Endversion (JSON/HTML, vom Therapeuten editiert)
- `status` — `entwurf` oder `finalisiert`
- `created_at`, `updated_at`

**Kein `pdf_url`:** PDF wird on-demand per window.print() aus dem gespeicherten `final_content` erzeugt — kein Supabase Storage nötig, konsistent mit PROJ-3/4/5.

**Rate Limiting (ohne externe Pakete):** API zählt `medical_reports`-Einträge des Therapeuten der letzten 60 Minuten direkt in der Datenbank — kein Redis, keine zusätzliche Tabelle.

**RLS:**
- Heilpraktiker → liest/schreibt nur Berichte seiner eigenen Patienten
- Admin → liest/schreibt alle
- Physiotherapeut / Patient → kein Zugriff

### KI-Generierungsablauf (Datenschutz-Design)

```
1. Patient-Daten laden (Name, Anamnese, Befunde, Behandlungen)
2. Name durch Pseudonym ersetzen: "Max Mustermann" → "Patient A"
3. Strukturierten Prompt + pseudonymisierte Daten → Claude API (claude-opus-4-6)
4. Antwort empfangen
5. Pseudonym wieder durch echten Namen ersetzen
6. draft_content (pseudonymisiert) + final_content (mit Namen) speichern
```

Patientendaten verlassen die Praxis pseudonymisiert → DSGVO-konform auch beim KI-Einsatz.

### Tech-Entscheidungen

| Entscheidung | Begründung |
|---|---|
| `@tiptap/react` + `@tiptap/starter-kit` als Rich-Text-Editor | Aktiv gewartet, Next.js-kompatibel, kein Raw-Markdown für medizinische Berichte, leichtgewichtiger als Quill |
| `@anthropic-ai/sdk` für Claude API | Offizielle SDK, typsicher, unterstützt Streaming für Fortschrittsanzeige |
| `claude-opus-4-6` (wie in Spec vorgegeben) | Beste Qualität für medizinische Sprache und Strukturierung |
| window.print() für PDF (kein `@react-pdf/renderer`) | Konsistent mit PROJ-3/4/5; kein zusätzliches Paket; Briefkopf via print-CSS in globals.css bereits vorhanden |
| Rate Limiting via DB-Count | Serverless-kompatibel (kein Redis nötig), einfach, kein neues Paket |
| `draft_content` unveränderlich speichern | Audit-Trail: Therapeut kann beweisen, was die KI generiert hat vs. was er editiert hat |
| Kein separater Wizard (1 Formular → direkte Generierung) | Reduziert UX-Komplexität; Zeitraum + Empfänger in einem Schritt → schneller als 3-Schritt-Wizard |

### Neue Pakete
- `@anthropic-ai/sdk` — Claude API Client (server-side only, niemals im Browser-Bundle)
- `@tiptap/react` + `@tiptap/starter-kit` — Rich-Text-Editor für Berichtsbearbeitung

### API-Übersicht
```
GET  /api/patients/[id]/reports              → Liste aller Berichte (neueste zuerst)
POST /api/patients/[id]/reports              → Generierung starten (ruft Claude auf)
GET  /api/patients/[id]/reports/[reportId]   → Einzelnen Bericht laden
PATCH /api/patients/[id]/reports/[reportId]  → Entwurf aktualisieren oder finalisieren
```

## QA Test Results
_To be added by /qa_

## Deployment
_To be added by /deploy_
