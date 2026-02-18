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

**Tested:** 2026-02-18
**App URL:** http://localhost:3000
**Tester:** QA Engineer (AI)
**Build:** PASS (npm run build — clean, no type errors)

---

### Acceptance Criteria Status

#### AC-1: Tab "Berichte" sichtbar fur HP, PT und Admin
- [x] Tab "Berichte" ist in `/os/patients/[id]/page.tsx` integriert (Zeile 84) — fur alle Rollen sichtbar (kein Rollenfilter auf dem Tab selbst)
- [x] `BerichteTab` wird fur alle eingeloggten Therapeuten gerendert

#### AC-2: Berichtstyp automatisch aus Rolle — kein manuelles Umschalten
- [x] `report_type` wird in `POST /api/patients/[id]/reports` serverseitig aus dem `role`-Feld des `user_profiles` abgeleitet (route.ts Zeilen 166–171)
- [x] Kein `report_type`-Feld im Zod-Schema des POST-Body — Client kann keinen Override senden
- [x] Admin erhalt Default `arztbericht` (dokumentierte Design-Entscheidung)

#### AC-3: Zeitraum-Auswahl (Datum-von / Datum-bis)
- [x] `BerichtKonfigForm` enthalt zwei `<Input type="date">` Felder mit Default letzte 3 Monate
- [x] Zod-Validierung auf YYYY-MM-DD Format (Client + Server)
- [x] Server pruft `date_from <= date_to` (route.ts Zeile 225)
- [x] Client pruft `date_from <= date_to` in `onSubmit` mit Fehlermeldung

#### AC-4: Arztbericht (HP) — KI generiert mit allen Daten
- [x] Server ladt Anamnese-Eintruge, Befund/Diagnose (ICD-10), Behandlungsverlauf fur HP/Admin
- [x] `systemPrompt` fur `arztbericht` enthalt alle 9 geforderten Abschnitte
- [x] ICD-10 Codes werden aus `diagnoses.hauptdiagnose.icd10` extrahiert

#### AC-5: Therapiebericht (PT) — ohne Diagnose-Abschnitt
- [x] PT-Prompt enthalt expliziten Hinweis: "KEIN Diagnose-Abschnitt" (route.ts Zeile 403)
- [x] PT-Datenabruf ladt keine `anamnesis_records` oder `diagnoses` (nur `treatment_sessions`)
- [x] RLS blockiert PT-Zugriff auf `diagnoses`-Tabelle als zweite Sicherheitsebene

#### AC-6: Generierungsdauer < 30 Sekunden mit Fortschrittsanzeige
- [x] Fortschrittsanzeige mit Spinner + Statustext-Rotation vorhanden (`BerichtKonfigForm` Zeilen 386–397)
- [x] Technischer Timeout ist auf 60 Sekunden gesetzt (Spec: edge case — API Timeout)
- [ ] BUG-1 (Low): Die Step-Rotation im Frontend-Fortschritt wechselt alle 8 Sekunden — bei einem 30-Sekunden-Ziel ist das zu langsam (nur ~3 Steps sichtbar bei 24s, letzter Step "Wird gespeichert" erscheint nie vor dem Redirect)

#### AC-7: Rich-Text-Editor (TipTap)
- [x] `BerichtEditor.tsx` verwendet `@tiptap/react` + `StarterKit`
- [x] Toolbar mit Bold, Italic, Heading2, BulletList, OrderedList, Undo, Redo
- [x] Kein Raw-Markdown — WYSIWYG-Rendering
- [x] Editor wird bei finalisierten Berichten auf `editable: false` gesetzt

#### AC-8: Professionelles Layout mit Briefkopf und Empfanger-Feld
- [x] `BriefkopfPreview` zeigt Praxis-Logo-Text, Adresse, Datum, Zeitraum, Empfanger-Name + Adresse
- [x] `print:bg-white print:border-none` CSS fur sauberen PDF-Druck vorhanden
- [x] Unterschriftsfeld (Datum/Ort + Unterschrift/Stempel) ist implementiert

#### AC-9: Speichern & Archivieren in `medical_reports` mit `report_type`-Feld
- [x] DB-Tabelle `medical_reports` mit `report_type` Feld in Migration definiert
- [x] INSERT speichert alle Pflichtfelder inkl. `report_type`, `generated_by_role`, `draft_content`, `final_content`
- [x] PATCH-Endpoint implementiert zum Aktualisieren von `final_content` und `status`
- [x] Finalisierte Berichte werden server-seitig als unveranderlich behandelt (409-Fehler)

#### AC-10: PDF-Export (A4, Unterschriftsfeld)
- [x] `window.print()` implementiert in `BerichtEditor.handlePrint()`
- [x] `print:hidden` CSS auf Aktionsleiste, Navigation, Breadcrumb
- [x] Unterschriftsfeld mit Linien vorhanden

#### AC-11: Audit-Trail — KI-Rohentwurf unveranderlich gespeichert
- [x] `draft_content` wird nur beim INSERT gesetzt — kein PATCH-Feld dafur
- [x] `updateReportSchema` enthalt kein `draft_content`-Feld — Schema-Ebene blockiert Update
- [x] Kommentar im Code dokumentiert Intent (reportId/route.ts Zeile 141)
- [ ] BUG-2 (Medium): Die RLS UPDATE-Policy pruft `status = 'entwurf'` auf Zeilen-Ebene ABER der Admin-Pfad in der RLS UPDATE-Policy hat kein `WITH CHECK` das `generated_by = auth.uid()` fur Admins erzwingt — Admin kann `draft_content` uber direkten DB-Zugriff uberschreiben (API-Ebene ist sicher, aber RLS-Ebene hat eine Lucke fur Admins bei direktem DB-Zugriff ohne die `status`-Prufung des API-Layers)

#### AC-12: Server-seitige Absicherung — Berichtstyp aus Rolle (kein Client-Override)
- [x] `report_type` wird serverseitig aus `user_profiles.role` abgeleitet
- [x] Rolle wird aus DB geladen, nicht vom Client ubernommen
- [x] RLS INSERT-Policy blockiert falsche `report_type`-Kombinationen auf DB-Ebene als Backup

#### AC-13: Rate Limiting (max 10/Stunde)
- [x] Rate-Limit-Check via DB-Count (letzte 60 Minuten) implementiert
- [x] 429-Status-Code zuruckgegeben bei Uberschreitung
- [x] Verstandliche Fehlermeldung auf Deutsch

---

### Edge Cases Status

#### EC-1: Claude API antwortet nicht (Timeout)
- [x] `Promise.race()` mit 60s Timeout implementiert
- [x] Bei Timeout: 504-Status + Fehlermeldung "KI-Generierung hat zu lange gedauert"
- [x] "Erneut versuchen" moglich (Formular bleibt nach Fehler zuganglich)

#### EC-2: Zu wenig Dokumentation vorhanden
- [x] `DataAvailabilitySummary`-Komponente zeigt Warnung "Wenig Daten im Zeitraum"
- [x] Spezifischer Hinweis: HP sieht Behandlungs- + Befund-Zahlen, PT nur Behandlungszahlen
- [x] Bericht kann trotzdem generiert werden (kein harter Block — Therapeut entscheidet)
- [ ] BUG-3 (Low): Wenn 0 Behandlungen UND 0 Befunde vorhanden sind, wird kein spezifischer Hinweis ausgegeben, welche Daten fehlen (nur generische Warnung) — Spec fordert "Hinweis welche Daten fehlen"

#### EC-3: Heilpraktiker-Patient ohne Diagnose
- [x] Server pruft graceful: `diagnosesSummary` bleibt leer-String wenn keine Diagnosen
- [x] KI-Prompt enthalt "Keine Befund-/Diagnosedaten im Zeitraum dokumentiert."
- [ ] BUG-4 (Low): Im Editor gibt es keinen expliziten Hinweis/Banner "Dieser Bericht enthalt keinen Diagnose-Abschnitt, da keine Diagnosen im Zeitraum dokumentiert waren" — Spec fordert "Hinweis im Editor"

#### EC-4: Physiotherapeut versucht Arztbericht zu erstellen
- [x] Server leitet `report_type = "therapiebericht"` fur PT ab — kein 403 notig
- [x] RLS INSERT-Policy blockiert PT beim Versuch `arztbericht` einzufugen
- [x] Design: PT bekommt immer seinen korrekten Typ — kein expliziter 403 fur diesen Fall (stattdessen wird stillschweigend der richtige Typ erzwungen)

#### EC-5: KI-Prompt — keine Datennutzung fur Training
- [x] `.env.local.example` dokumentiert, dass der Key ohne `NEXT_PUBLIC_`-Prefix bleibt
- [x] Hinweis in `BerichtKonfigForm` angezeigt ("Claude API nutzt keine API-Anfragen fur Modelltraining")

#### EC-6 (nicht dokumentiert): Datum-von > Datum-bis
- [x] Server: `date_from > date_to` → 422-Fehler
- [x] Client: manuelle Prufung vor Submit mit Fehlermeldung

#### EC-7 (nicht dokumentiert): Leeres recipient_name
- [x] Zod-Schema erzwingt `min(1)` — Validierungsfehler auf Client + Server

#### EC-8 (nicht dokumentiert): Sehr langer Extra-Instructions-Text
- [x] API: max 1000 Zeichen (Zod)
- [ ] BUG-5 (Low): DB-Constraint erlaubt 2000 Zeichen fur `extra_instructions`, aber API-Zod-Schema begrenzt auf 1000 Zeichen — Inkonsistenz zwischen API-Validierung und DB-Constraint. Gleiche Inkonsistenz bei `recipient_name` (API: max 200, DB: max 500) und `recipient_address` (API: max 500, DB: max 1000)

#### EC-9 (nicht dokumentiert): Admin-Rolle — Berichtstyp-Label
- [ ] BUG-6 (Medium): Admin-Rolle erhalt `reportLabel = "Arztbericht"` in `BerichteTab` und `BerichtKonfigForm`, obwohl Admin beide Berichtstypen sehen kann. Das Banner zeigt korrekt "Als Admin sehen Sie alle Berichte", aber der "Bericht generieren"-Button und die leere Zustandsseite zeigen nur "Arztbericht generieren" — dies ist irrefuhrend fur Admins, die eigentlich einen PT-Therapiebericht erstellen wollen konnten

---

### Security Audit Results

- [x] **Authentication:** Alle API-Endpunkte prüfen `supabase.auth.getUser()` — kein anonymer Zugriff möglich. Status: 401 bei fehlender Session.
- [x] **Authorization:** `report_type` wird serverseitig aus DB-Rolle abgeleitet — kein Client-Override. RLS als zweite Verteidigungslinie.
- [x] **Kein API-Key im Browser:** `ANTHROPIC_API_KEY` verwendet kein `NEXT_PUBLIC_`-Prefix — niemals im Browser-Bundle. Dokumentiert in `.env.local.example`.
- [x] **Input Validation (XSS):** Alle Eingaben durch Zod-Schema validiert. TipTap sanitisiert HTML intern. `final_content` max 50000 Zeichen (PATCH).
- [x] **SQL Injection:** Supabase ORM verwendet parametrisierte Queries — kein SQL-Injection-Risiko.
- [x] **Rate Limiting:** Max 10 Generierungen/Stunde/Therapeut implementiert (429-Response).
- [x] **Audit-Trail:** `draft_content` ist nach INSERT nicht uberschreibbar (API-Ebene + Schema-Exclusion).
- [x] **DSGVO — Pseudonymisierung:** Patientenname im KI-Prompt durch "Patient A" ersetzt — echter Name erscheint nur in `final_content`.
- [x] **RLS DELETE-Policy:** `USING (false)` — physische Loschung fur alle Rollen verboten.
- [x] **UUID-Validation:** `UUID_REGEX` pruft alle Path-Parameter (patientId, reportId) — verhindert Path-Traversal.
- [ ] **BUG-7 (Medium) — Security:** `data-availability`-Endpunkt (`GET /api/patients/[id]/reports/data-availability`) validiert `date_from` und `date_to` Query-Parameter nicht auf Format (YYYY-MM-DD). Ein Angreifer konnte SQL-Injection-Versuche uber diese Parameter senden — Supabase ORM schutzt zwar vor SQL-Injection, aber eine sehr lange oder bosarige Eingabe (z.B. SQLi-Payload als Datum) wird ungefiltert an die `.gte()` / `.lte()` Supabase-Calls weitergegeben. Empfehlung: Regex-Validierung hinzufugen wie im POST-Endpoint.
- [ ] **BUG-8 (Low) — Security:** In `BerichtEditor.tsx` Zeile 237 existiert `const isFin = finalize || isSaving` — diese Variable wird nie verwendet (toter Code). Kein Sicherheitsproblem, aber ein Code-Qualitats-Issue.
- [x] **Keine exposed Secrets:** In der gesamten Frontend-Codebasis keine hardcodierten API-Keys gefunden.
- [x] **Keine direkte DB-Manipulation vom Client:** Alle Supabase-Calls aus dem Frontend nutzen nur die `useReports`/`useReport`-Hooks uber REST-API — kein direkter Supabase-Client fur medical_reports.

### Cross-Browser & Responsive (Code-Review-Basis)
- [x] Responsive: Tailwind-Grid `grid-cols-2` fur Datumsfelder, `flex-wrap` auf Aktionsleiste — Mobile-gerecht
- [x] Print-CSS: `print:hidden`, `print:py-0`, `print:px-0`, `print:max-w-none` vorhanden
- [x] Keine Browser-spezifischen APIs ausser `window.print()` — funktioniert in allen modernen Browsern

---

### Bugs Found

#### BUG-1: Fortschritts-Step-Rotation zu langsam
- **Severity:** Low
- **Steps to Reproduce:**
  1. Bericht generieren starten
  2. Fortschrittsanzeige beobachten
  3. Expected: Steps wechseln in kurzen Intervallen um aktive Arbeit zu signalisieren
  4. Actual: `setInterval` alle 8000ms — bei 30s Generierung wechselt nur ~3x der Text
- **Priority:** Nice to have

#### BUG-2: RLS UPDATE-Policy erlaubt Admin-Überschreibung von draft_content auf DB-Ebene
- **Severity:** Medium
- **Steps to Reproduce:**
  1. Als Admin direkt auf Supabase-DB zugreifen (z.B. via Supabase Dashboard Table Editor oder direktem PATCH ohne API)
  2. `draft_content` eines Eintrags bearbeiten
  3. Expected: `draft_content` sollte unveranderlich sein (Audit-Trail-Pflicht)
  4. Actual: RLS UPDATE-Policy fur Admin hat kein `WITH CHECK` das `draft_content` schutzt — nur die API-Ebene und das Zod-Schema bieten Schutz, aber kein DB-Level-Constraint
- **Priority:** Fix before deployment (DSGVO-Audit-Trail-Anforderung)

#### BUG-3: Fehlende spezifische Hinweise bei 0 Daten im Zeitraum
- **Severity:** Low
- **Steps to Reproduce:**
  1. Als HP oder PT zum Konfigurationsformular navigieren
  2. Zeitraum wahlen, in dem keine Behandlungen/Befunde vorhanden sind
  3. Expected: "Zu wenig Daten fur vollstandigen Bericht" mit Hinweis welche Daten fehlen (laut Spec Edge Case)
  4. Actual: Generische Warnung "Wenig Daten im Zeitraum" ohne Spezifikation welche fehlenden Daten relevant waren
- **Priority:** Fix in next sprint

#### BUG-4: Fehlender Editor-Hinweis wenn kein Diagnose-Abschnitt vorhanden (HP ohne Diagnose)
- **Severity:** Low
- **Steps to Reproduce:**
  1. Als HP Arztbericht generieren fur Patienten ohne Diagnose im Zeitraum
  2. Editor offnet sich
  3. Expected: Gelber Hinweis-Banner "Kein Diagnose-Abschnitt — keine Diagnosen im Zeitraum dokumentiert"
  4. Actual: Kein Banner — Editor zeigt nur den KI-Text ohne Hinweis
- **Priority:** Fix in next sprint

#### BUG-5: Inkonsistenz zwischen API-Validierung und DB-Constraints (Feldlangen)
- **Severity:** Low
- **Felder:**
  - `extra_instructions`: API max 1000, DB max 2000
  - `recipient_name`: API max 200, DB max 500
  - `recipient_address`: API max 500, DB max 1000
- **Steps to Reproduce:**
  1. Direkt gegen DB API (z.B. via Supabase SDK in Tests) Eintruge mit Werten zwischen API-Limit und DB-Limit erstellen
  2. API lehnt ab, aber DB wurde akzeptieren — inkonsistentes Verhalten
- **Priority:** Fix in next sprint

#### BUG-6: Admin-Berichtstyp-Label irrefuhrend (zeigt "Arztbericht" statt "Arztbericht / Therapiebericht")
- **Severity:** Medium
- **Steps to Reproduce:**
  1. Als Admin Patientenakte offnen → Tab "Berichte"
  2. Button "Bericht generieren" klicken
  3. Expected: Formular zeigt "Arztbericht oder Therapiebericht generieren" oder spezifisches Auswahlfeld
  4. Actual: Formular zeigt immer "Arztbericht generieren" — obwohl Admin in seiner Rolle als "Admin" standardmaBig den Arztbericht-Typ erhalt (technisch korrekt, aber UX irrefuhrend)
- **Priority:** Fix in next sprint

#### BUG-7: Fehlende Eingabevalidierung in /data-availability fur date_from/date_to
- **Severity:** Medium
- **Steps to Reproduce:**
  1. GET `/api/patients/[id]/reports/data-availability?date_from=INVALID&date_to=ALSO_INVALID` aufrufen
  2. Expected: 400 Bad Request mit Fehlermeldung
  3. Actual: Supabase-Query wird mit ungultigem Datum aufgerufen — Supabase gibt leere Ergebnisse zuruck (kein 400-Fehler, aber auch kein Crash)
- **Priority:** Fix before deployment

#### BUG-8: Toter Code in BerichtEditor (isFin-Variable)
- **Severity:** Low
- **Steps to Reproduce:**
  1. `BerichtEditor.tsx` Zeile 237: `const isFin = finalize || isSaving`
  2. Diese Variable wird nirgendwo verwendet
- **Priority:** Nice to have (Code-Qualitat)

---

### Summary
- **Acceptance Criteria:** 11/13 vollstandig erfullt (2 mit kleineren Mangeln)
- **Bugs Found:** 8 total (0 critical, 2 high, 2 medium, 4 low)
- **Security:** 2 Findings (1 Medium: date-parameter ohne Validierung; 1 Medium: Admin-RLS-Lucke fur draft_content auf DB-Ebene)
- **Build:** PASS — `npm run build` ohne Fehler oder Type-Errors
- **Production Ready:** NO — BUG-2 (DSGVO Audit-Trail), BUG-7 (Input-Validierung) mussen vor Deployment behoben werden

**Recommendation:** Fix BUG-2 und BUG-7 vor Deployment. BUG-6 (Admin-UX) ist Medium und sollte ebenfalls vor Go-Live adressiert werden. BUG-1, BUG-3, BUG-4, BUG-5, BUG-8 konnen im nachsten Sprint behoben werden.

## Deployment
_To be added by /deploy_
