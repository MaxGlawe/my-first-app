# PROJ-6: KI-Arztbericht-Generator

## Status: In Review
**Created:** 2026-02-17
**Last Updated:** 2026-02-18

## Dependencies
- Requires: PROJ-1 (Authentifizierung & Rollenrechte — alle Therapeuten-Rollen)
- Requires: PROJ-3 (Anamnese & Untersuchungsdokumentation — für Heilpraktiker-Bericht)
- Requires: PROJ-4 (Befund & Diagnose — für Heilpraktiker-Bericht)
- Requires: PROJ-5 (Behandlungsdokumentation — für beide Berichtstypen)

## Zwei Berichtslinien

### Linie A: Arztbericht (Heilpraktiker)
Vollständiger medizinischer Bericht für den zuweisenden/mitbehandelnden Arzt.
Inhalt: Anamnese, klinischer Befund, ICD-10-Diagnose(n), Behandlungsverlauf mit NRS-Kurve, Therapieziel, Prognose, Empfehlung.

### Linie B: Therapiebericht (Physiotherapeut)
Kürzerer Verlaufsbericht, z.B. für den Arzt bei Rezeptverlängerung oder Weiterverordnung.
Inhalt: Behandlungsverlauf (durchgeführte Maßnahmen, NRS-Entwicklung), Patientenreaktion, Empfehlung zur Weiterbehandlung mit Heilmittel X/Y, Behandlungsziel für nächste Verordnungsphase.
Kein Diagnose-Abschnitt — Physiotherapeuten dürfen nicht diagnostizieren.

## User Stories
- Als Heilpraktiker möchte ich per Klick einen vollständigen Arztbericht generieren lassen (Anamnese, Befund, ICD-10-Diagnose, Behandlungsverlauf), damit ich keine Stunde für das Schreiben aufwende.
- Als Physiotherapeut möchte ich einen Therapieverlaufsbericht generieren lassen (Behandlungsverlauf, NRS-Entwicklung, Maßnahmen, Weiterbehandlungsempfehlung), damit der Arzt die Verlängerung eines Heilmittelrezepts fundiert entscheiden kann.
- Als Therapeut (HP oder PT) möchte ich den KI-Entwurf vor dem Versenden überarbeiten, damit ich für den Inhalt verantwortlich bleibe.
- Als Therapeut möchte ich einen Zeitraum wählen (z.B. letzten 3 Monate), aus dem die KI die Daten für den Bericht zieht.
- Als Therapeut möchte ich fertige Berichte als PDF exportieren und in der Akte archivieren.
- Als Admin möchte ich alle Berichte aller Patienten einsehen (beide Typen).

## Acceptance Criteria
- [ ] Tab "Berichte" in der Patientenakte sichtbar für Heilpraktiker UND Physiotherapeuten (und Admin)
- [ ] Berichtstyp wird automatisch anhand der Rolle bestimmt — kein manuelles Umschalten
- [ ] Zeitraum-Auswahl: Datum-von / Datum-bis für beide Berichtstypen
- [ ] **Arztbericht (HP):** KI generiert auf Basis von Stammdaten + Anamnese + Befund/Diagnosen (ICD-10) + Behandlungsverlauf + Therapieziel/Prognose
- [ ] **Therapiebericht (PT):** KI generiert auf Basis von Stammdaten + Behandlungsverlauf (Maßnahmen, NRS) + Weiterbehandlungsempfehlung — OHNE Diagnose-Abschnitt
- [ ] Generierungsdauer: < 30 Sekunden mit Fortschrittsanzeige
- [ ] Editor: Entwurf in bearbeitbarem Rich-Text-Editor (kein Raw-Markdown)
- [ ] Professionelles Layout: Praxis-Briefkopf, Empfänger-Feld (Arzt/Klinik/Name)
- [ ] Speichern & Archivieren: Finaler Bericht in `medical_reports` Tabelle mit `report_type`-Feld
- [ ] PDF-Export: A4, mit Unterschriftsfeld
- [ ] Audit-Trail: KI-Rohentwurf wird unveränderlich gespeichert
- [ ] Server-seitige Absicherung: Berichtstyp wird serverseitig aus Rolle berechnet (kein Client-Override möglich)
- [ ] Rate Limiting: Max 10 Generierungen pro Therapeut pro Stunde (rollenübergreifend)

## Edge Cases
- Was passiert, wenn die Claude API nicht antwortet? → Timeout nach 60s, Fehlermeldung, erneut versuchen möglich
- Was passiert, wenn zu wenig Dokumentation vorhanden ist? → Warnung: "Zu wenig Daten für vollständigen Bericht" mit Hinweis welche Daten fehlen
- Was passiert, wenn der Heilpraktiker-Patient noch keine Diagnose hat? → Arztbericht ohne Diagnose-Abschnitt, Hinweis im Editor
- Was passiert, wenn ein Physiotherapeut versucht einen Arztbericht zu erstellen? → Server lehnt ab (403), nur eigener Berichtstyp erlaubt
- Was passiert mit dem KI-Prompt? → Patientendaten werden NICHT zur KI-Verbesserung genutzt (Anthropic API: kein Training auf User Data bei API-Nutzung)

## Technical Requirements
- Claude API: `claude-opus-4-6` für maximale Qualität beider Berichtstypen
- Zwei System-Prompts: Einer für Arztberichte (HP), einer für Therapieberichte (PT)
- Datenschutz: Patientenname im Prompt durch Pseudonym ersetzt, nach Generierung wiederhergestellt
- Tabelle: `medical_reports` mit `patient_id`, `generated_by`, `generated_by_role`, `report_type`, `draft_content`, `final_content`
- Rate Limiting: Max 10 Generierungen pro Therapeut pro Stunde

---

## Tech Design (Solution Architect)
**Designed:** 2026-02-18 (überarbeitet: Dual-Report-Linie HP + PT)

### Die zwei Berichtstypen im Vergleich

| | Arztbericht (Heilpraktiker) | Therapiebericht (Physiotherapeut) |
|---|---|---|
| Wer erstellt ihn? | Heilpraktiker | Physiotherapeut |
| Typischer Anlass | Überweisung, Mitbehandlung | Rezeptverlängerung, Weiterverordnung |
| Datenquellen | Stammdaten + Anamnese + Befund/Diagnose (ICD-10) + Behandlungen | Stammdaten + Behandlungen (Maßnahmen, NRS) |
| Enthält Diagnose? | Ja (ICD-10 Codes) | Nein (rechtlich unzulässig für PT) |
| KI-Prompt | Medizinischer Arztbrief-Stil | Physiotherapeutischer Verlaufsbericht-Stil |
| Länge (typisch) | 1–2 Seiten | 0,5–1 Seite |

### Seitenstruktur & Komponenten

```
/os/patients/[id]
+-- Tab: "Berichte"                         ← sichtbar für HP + PT + Admin
    +-- BerichteTab
        +-- BerichtsTyp-Info-Banner
        |   HP sieht: "Arztberichte"
        |   PT sieht: "Therapieberichte"
        |   Admin sieht: beide Typen mit Badge
        +-- "Neuen Bericht generieren" Button
        +-- BerichteListe
            +-- BerichtCard
            |   (Datum, Typ-Badge: Arztbericht/Therapiebericht,
            |    Empfänger, Status-Badge: Entwurf/Finalisiert, Aktionen)
            +-- Leer-Zustand
            +-- Lade-Skeleton

/os/patients/[id]/arztbericht/new           ← Konfigurationsformular (rollenadaptiv)
+-- BerichtKonfigForm
    +-- Zeitraum-Auswahl: Datum-von / Datum-bis
    +-- Datenverfügbarkeits-Zusammenfassung
    |   HP: "X Behandlungen, Y Befunde, Z Diagnosen gefunden"
    |   PT: "X Behandlungen gefunden"
    +-- Empfänger: Name (Arzt/Klinik) + Adresse
    +-- [HP only] Heilmittelempfehlung-Freifeld (optional, vorausfüllen)
    +-- [PT only] Verordnungsphase / gewünschte Heilmittel (Freitext-Hinweis an KI)
    +-- "Bericht generieren" Button
    +-- KI-Fortschrittsanzeige (Spinner + Statustext, max 60s Timeout)
    → Weiterleitung zu [reportId] nach Erfolg

/os/patients/[id]/arztbericht/[reportId]    ← Editor & Archivansicht (identisch für beide Typen)
+-- BerichtEditor
    +-- Typ-Badge (Arztbericht / Therapiebericht) — read-only
    +-- Briefkopf-Vorschau (Praxis-Logo, Adresse, Datum, Empfänger — read-only)
    +-- TipTap Rich-Text-Editor (bearbeitbarer Entwurf)
    +-- "Als Entwurf speichern" Button
    +-- "Finalisieren & archivieren" Button (sperrt Editor)
    +-- "Als PDF exportieren" Button (window.print)
    +-- Hinweis: "Generiert am [Datum] — KI-Entwurf — [Rolle] verantwortlich"
```

### Datenmodell

**Tabelle `medical_reports`:**
- `id` — UUID, Primärschlüssel
- `patient_id` — Verknüpfung zum Patienten
- `generated_by` — Therapeut der den Bericht erstellt hat
- `generated_by_role` — `heilpraktiker` oder `physiotherapeut` (DB-Audit-Feld, serverseitig gesetzt)
- `report_type` — `arztbericht` oder `therapiebericht` (aus Rolle abgeleitet, nicht vom Client steuerbar)
- `date_from` / `date_to` — Zeitraum der einbezogenen Dokumentation
- `recipient_name` — Empfänger (Arzt/Klinik)
- `recipient_address` — Adresse des Empfängers (Freitext)
- `extra_instructions` — Optionaler Hinweis an die KI (z.B. gewünschte Heilmittel bei PT)
- `draft_content` — Originaler KI-Entwurf (unveränderlich — Audit-Trail)
- `final_content` — Bearbeitete Endversion (vom Therapeuten editiert)
- `status` — `entwurf` oder `finalisiert`
- `created_at`, `updated_at`

**RLS (Row Level Security):**
- Heilpraktiker → liest/schreibt nur `arztbericht`-Einträge seiner eigenen Patienten
- Physiotherapeut → liest/schreibt nur `therapiebericht`-Einträge seiner eigenen Patienten
- Admin → liest/schreibt alle Typen
- Patient → kein Zugriff

**Rate Limiting:** API zählt `medical_reports`-Einträge des Therapeuten der letzten 60 Minuten in der DB — kein Redis, kein extra Paket.

### KI-Generierungsablauf nach Rolle

```
Gemeinsam (beide Rollen):
1. Berichtstyp aus Rolle ableiten (server-side, nicht vom Client übernehmbar)
2. Patient-Basisdaten laden (Name, Geburtsdatum, Versicherung)
3. Name durch Pseudonym ersetzen: "Max Mustermann" → "Patient A"

Heilpraktiker (Arztbericht):
4a. Anamnese-Einträge im Zeitraum laden
4b. Befund/Diagnose-Einträge im Zeitraum laden (ICD-10 Codes + Beschreibungen)
4c. Behandlungsverlauf im Zeitraum laden (Maßnahmen, NRS-Werte)

Physiotherapeut (Therapiebericht):
4d. Behandlungsverlauf im Zeitraum laden (Maßnahmen, NRS-Werte, Notizen)
    — KEIN Zugriff auf Befund/Diagnose (RLS blockiert es ohnehin)

Gemeinsam (beide Rollen):
5. Passenden System-Prompt wählen (HP-Prompt oder PT-Prompt)
6. Pseudonymisierte Daten + extra_instructions → Claude API (claude-opus-4-6)
7. Antwort empfangen
8. Pseudonym durch echten Patientennamen ersetzen
9. draft_content (pseudonymisiert) + final_content (mit Namen) speichern
```

### Tech-Entscheidungen

| Entscheidung | Begründung |
|---|---|
| Gemeinsamer Tab "Berichte" statt separater Tabs | Beide Rollen sehen ihre eigenen Berichte im selben Tab — einfachere UX, weniger Tabs |
| `report_type` serverseitig aus Rolle abgeleitet | Sicherheit: Kein Client kann seinen Berichtstyp fälschen — ein PT kann keinen Arztbericht mit ICD-Codes erstellen |
| Zwei Claude-Prompts (HP + PT) | Andere Sprache, anderer Stil, anderer Inhalt — ein generischer Prompt wäre schlechter für beide |
| Physiotherapeut lädt keine Befund-Daten | Datentrennung: PT hat ohnehin keinen RLS-Zugriff auf `diagnoses`; das Design entspricht der Realität |
| `@tiptap/react` + `@tiptap/starter-kit` | Next.js-kompatibel, aktiv gewartet, kein Raw-Markdown — medizinische Berichte brauchen WYSIWYG |
| `@anthropic-ai/sdk` (server-side only) | Offizielle SDK, typsicher — API-Key niemals im Browser-Bundle |
| `claude-opus-4-6` | Beste Qualität für medizinische Fachsprache (Spec-Vorgabe) |
| window.print() für PDF | Konsistent mit PROJ-3/4/5; kein extra Paket; Briefkopf-CSS bereits in globals.css |
| `extra_instructions` Freifeld | PT kann gewünschte Heilmittel als Hinweis mitgeben → KI richtet Empfehlung gezielt aus |

### Neue Pakete
- `@anthropic-ai/sdk` — Claude API Client (server-side only)
- `@tiptap/react` + `@tiptap/starter-kit` — Rich-Text-Editor

### API-Übersicht
```
GET  /api/patients/[id]/reports              → Liste (HP sieht arztberichte, PT sieht therapieberichte)
POST /api/patients/[id]/reports              → Generierung starten (report_type aus Rolle, ruft Claude auf)
GET  /api/patients/[id]/reports/[reportId]   → Einzelnen Bericht laden
PATCH /api/patients/[id]/reports/[reportId]  → Entwurf aktualisieren oder finalisieren
```

## QA Test Results
_To be added by /qa_

## Deployment
_To be added by /deploy_
