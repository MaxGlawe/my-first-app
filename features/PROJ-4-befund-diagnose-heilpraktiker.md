# PROJ-4: Befund & Diagnose (Heilpraktiker)

## Status: In Progress
**Created:** 2026-02-17
**Last Updated:** 2026-02-18

## Dependencies
- Requires: PROJ-1 (Authentifizierung & Rollenrechte — Heilpraktiker-Rolle)
- Requires: PROJ-2 (Patientenstammdaten)
- Requires: PROJ-3 (Anamnese & Untersuchungsdokumentation)

## User Stories
- Als Heilpraktiker möchte ich nach der Untersuchung eine eigenständige Diagnose stellen und mit ICD-10-Code verschlüsseln, damit die Dokumentation rechtssicher und abrechenbar ist.
- Als Heilpraktiker möchte ich einen strukturierten Befundbericht verfassen (Befund, Diagnose, Therapieziel, Prognose), der als Basis für den Arztbericht dient.
- Als Heilpraktiker möchte ich Diagnosen aus früheren Behandlungen übernehmen oder anpassen, damit ich nicht jedes Mal neu suchen muss.
- Als Admin möchte ich sicherstellen, dass kein Physiotherapeut Diagnosefunktionen aufrufen kann — auch nicht über direkte URL-Eingabe.

## Acceptance Criteria
- [ ] ICD-10-Suche: Autocomplete-Suchfeld mit ICD-10-GM Katalog (deutsch), Mehrfachdiagnosen möglich
- [ ] Befundbericht-Formular: Klinischer Befund (Freitext), Hauptdiagnose (ICD-10), Nebendiagnosen (ICD-10), Therapieziel, Prognose, Therapiedauer (Wochen)
- [ ] Diagnose-Sicherheitsgrad: Gesichert / Verdacht / Ausschluss
- [ ] Server-seitige Absicherung: API-Route wirft 403 für Nicht-Heilpraktiker
- [ ] Middleware blockiert `/os/befund/*` und `/os/diagnose/*` für Physiotherapeuten
- [ ] Befundübersicht: Alle Befunde eines Patienten chronologisch mit Datum und Therapeut
- [ ] Befund bearbeiten: Nur der erstellende Therapeut oder Admin darf bearbeiten
- [ ] Befund-PDF-Export

## Edge Cases
- Was passiert, wenn ein ICD-Code veraltet/ungültig ist? → Warnung bei Eingabe veralteter Codes, aktueller Code vorgeschlagen
- Was passiert, wenn ein Physiotherapeut über die API versucht, eine Diagnose zu speichern? → 403 Forbidden, Log-Eintrag für Admin
- Was passiert, wenn kein ICD-Code passt? → Freitext-Diagnose möglich mit Pflichtnotiz

## Technical Requirements
- ICD-10-GM Datenbank lokal oder als API eingebunden (kein Datenschutz-Problem da kein PHI)
- Tabelle: `diagnoses` mit `patient_id`, `created_by_role` Pflichtfeld (`heilpraktiker` only)
- RLS-Policy: `INSERT/UPDATE/DELETE` nur für Heilpraktiker-Rolle und Admins
- Server Action / API Route prüft Rolle serverseitig (nicht nur Frontend-Guard)

---

## Tech Design (Solution Architect)
**Designed:** 2026-02-18

### Seitenstruktur & Komponenten

```
/os/patients/[id]                         ← Patientenakte (existiert bereits)
+-- Tab: Befund & Diagnose                ← neuer Tab (nur für Heilpraktiker + Admin sichtbar)
    +-- BefundTab
        +-- BefundHistory                 ← Chronologische Liste aller Befunde
        |   +-- BefundCard (Datum, Ersteller, Hauptdiagnose + ICD-Code, Sicherheitsgrad-Badge)
        |   +-- Leer-Zustand
        +-- "Neuer Befund" Button

/os/patients/[id]/befund/new              ← Neuer Befundbericht (HP-only)
+-- BefundForm
    +-- Abschnitt: Klinischer Befund (Freitext, Pflichtfeld)
    +-- Abschnitt: Hauptdiagnose
    |   +-- Icd10Combobox (Autocomplete: Code + deutsche Bezeichnung)
    |   +-- SicherheitsgradSelect (Gesichert / Verdacht / Ausschluss)
    +-- Abschnitt: Nebendiagnosen (bis zu 5, jeweils ICD-10 + Sicherheitsgrad)
    +-- Abschnitt: Therapieziel (Freitext)
    +-- Abschnitt: Prognose (Freitext)
    +-- Abschnitt: Therapiedauer (Anzahl Wochen, Zahlenfeld)
    +-- "Als Entwurf speichern" / "Abschließen & sperren" Buttons

/os/patients/[id]/befund/[befundId]       ← Befundansicht (read-only + PDF)
+-- BefundView (alle Felder read-only)
+-- "Als PDF exportieren" Button (window.print)
+-- "Bearbeiten" Button (nur Ersteller oder Admin, nur wenn Entwurf)
```

### Datenmodell

**Tabelle `diagnoses`**:
- `patient_id` — Verknüpfung zum Patienten
- `created_by` — Heilpraktiker der den Befund erstellt hat
- `created_by_role` — Immer `"heilpraktiker"` (Audit-Pflichtfeld, beweist Rollenkonformität)
- `status` — `entwurf` oder `abgeschlossen` (abgeschlossene Befunde sind schreibgeschützt)
- `klinischer_befund` — Freitext-Befundbeschreibung (Pflichtfeld)
- `hauptdiagnose` — ICD-10-Code + deutsche Bezeichnung + Sicherheitsgrad (JSONB)
- `nebendiagnosen` — Liste von bis zu 5 weiteren Diagnosen (JSONB-Array)
- `therapieziel` — Freitext
- `prognose` — Freitext
- `therapiedauer_wochen` — Ganzzahl (Wochen)
- `created_at`, `updated_at`

**ICD-10-GM Katalog:**
Lokal eingebettet als statische JSON-Datei (`public/data/icd10-gm.json`) mit den ~1.200 häufigsten Codes aus M- (Bewegungsapparat), G- (Neurologie) und weiteren relevanten Kapiteln. Freitext-Fallback für unlisted Codes.

**RLS:**
- Heilpraktiker → lesen/schreiben nur eigene Patienten
- Admin → liest/schreibt alle
- Physiotherapeut → **kein Zugriff** (SELECT ebenfalls geblockt)
- Patient → kein Zugriff

**Middleware:**
Route `/os/patients/[id]/befund` wird in `supabase-middleware.ts` zur bestehenden HP-Blockierung hinzugefügt (neben dem bereits blockierten `/os/befund`).

### Tech-Entscheidungen

| Entscheidung | Begründung |
|---|---|
| ICD-10-GM als lokale JSON-Datei | DSGVO-konform (kein PHI an externe APIs), keine Netzwerkabhängigkeit, schnelle Client-Suche |
| shadcn Command für ICD-Autocomplete | Bereits installiert (genutzt in KrankenkasseCombobox), filtert nach Code UND Bezeichnung gleichzeitig |
| Eigene `diagnoses` Tabelle | Klar getrennt von Anamnese-Daten; eigenes RLS-Set; einfacher Audit-Trail |
| `created_by_role` Pflichtfeld | Audit-Sicherheit: DB-Level-Nachweis dass ausschließlich Heilpraktiker Diagnosen stellen durften |
| Abgeschlossen = unveränderlich | Rechtssichere Dokumentationspflicht identisch zu PROJ-3 (Anamnese) |
| PT-Blockierung auf Middleware + RLS + API | Defense-in-Depth: drei unabhängige Sicherheitsschichten |

### Neue Pakete
- Keine — ICD-10-GM als statische JSON-Datei, shadcn Command bereits installiert

## QA Test Results

**Tested:** 2026-02-18 (Re-Test nach Developer Fixes)
**App URL:** http://localhost:3000
**Tester:** QA Engineer (AI)
**Build:** Passing — `npm run build` compiled successfully with 0 errors (alle 22 Routen inkl. `/os/patients/[id]/befund/[befundId]/edit`)

---

### Acceptance Criteria Status

#### AC-1: ICD-10-Suche — Autocomplete mit ICD-10-GM Katalog (deutsch), Mehrfachdiagnosen möglich
- [x] `Icd10Combobox` implementiert mit shadcn `Command` + `Popover`
- [x] Filtert nach Code UND Bezeichnung gleichzeitig (case-insensitive)
- [x] Zeigt bis zu 80 Treffer bei Suche, 50 beim Öffnen ohne Eingabe
- [x] ICD-10-GM Datei lokal eingebettet (`public/data/icd10-gm.json`, 282 Einträge aus M-, G-, S-, E-, F-, I-, J-, K-, N-, R-, T-, Z-Kapiteln)
- [x] G-Kapitel (Neurologie, 40 Codes) jetzt vorhanden — G43 Migräne, G54 Nervenwurzelkompression etc. auffindbar
- [x] Mehrfachdiagnosen: Hauptdiagnose + bis zu 5 Nebendiagnosen, je mit eigenem `Icd10Combobox`
- [ ] BUG-1 (Medium): ICD-10-GM Datei enthält 282 Codes (verbessert von 194) — die Spec spricht von ~1.200 häufigsten Codes. Der Katalog deckt nun 12 Kapitel ab, bleibt aber deutlich unter dem spezifizierten Umfang (~24% der Zielgröße).

#### AC-2: Befundbericht-Formular — alle Felder vorhanden
- [x] Klinischer Befund (Freitext, Pflichtfeld mit Validierung)
- [x] Hauptdiagnose (ICD-10 via Combobox + Sicherheitsgrad)
- [x] Nebendiagnosen (bis zu 5, jede mit ICD-10 + Sicherheitsgrad)
- [x] Therapieziel (Freitext)
- [x] Prognose (Freitext)
- [x] Therapiedauer (Wochen, Zahlenfeld, Integer 1–520)

#### AC-3: Diagnose-Sicherheitsgrad — Gesichert / Verdacht / Ausschluss
- [x] `SicherheitsgradSelect` in der Form implementiert (Hauptdiagnose + alle Nebendiagnosen)
- [x] Drei Optionen: `gesichert`, `verdacht` (als "Verdachtsdiagnose"), `ausschluss` (als "Ausschlussdiagnose")
- [x] Defaultwert: `gesichert`
- [x] Farbcodierte Badges in `BefundTab` (grün = gesichert, orange = verdacht, grau = ausschluss)
- [x] Badges auch in `BefundView` korrekt dargestellt

#### AC-4: Server-seitige Absicherung — 403 für Nicht-Heilpraktiker
- [x] `GET /api/patients/[id]/diagnoses` — Rollenprüfung: 403 für `physiotherapeut` und `patient`
- [x] `POST /api/patients/[id]/diagnoses` — Rollenprüfung: 403 für Nicht-Heilpraktiker, `console.warn` Security-Log-Eintrag
- [x] `GET /api/patients/[id]/diagnoses/[befundId]` — Rollenprüfung: 403 für Nicht-Heilpraktiker
- [x] `PATCH /api/patients/[id]/diagnoses/[befundId]` — Rollenprüfung: 403 für Nicht-Heilpraktiker, Security-Log
- [x] Authentifizierungsprüfung in allen Routen: 401 ohne Session
- [x] UUID-Formatvalidierung für `patientId` und `befundId`
- [x] Zod-Validierung aller Eingaben (POST + PATCH)

#### AC-5: Middleware blockiert `/os/befund/*` und `/os/patients/[id]/befund/*` für Physiotherapeuten
- [x] Middleware-Regel in `supabase-middleware.ts` vorhanden
- [x] Regex `/^\/os\/patients\/[^/]+\/befund(\/|$)/` blockiert korrekt alle Subpfade inkl. `/edit`
- [x] `pathname.startsWith('/os/befund')` als Legacy-Guard für Top-Level-Route
- [x] Redirect zu `/403` bei Zugriff als Physiotherapeut
- [ ] BUG-2 (Low): Die Spec nennt auch `/os/diagnose/*` als zu blockierende Route, diese Route existiert nicht in der Implementierung. Die tatsächlich implementierte Route `/os/patients/[id]/befund/*` ist korrekt blockiert. Kein Sicherheitsproblem, nur Spec-Diskrepanz.

#### AC-6: Befundübersicht — chronologisch, mit Datum und Therapeut
- [x] `BefundTab` listet alle Befunde eines Patienten, neueste zuerst (`ORDER BY created_at DESC`)
- [x] `BefundCard` zeigt: Datum, Uhrzeit, Hauptdiagnose (Code + Bezeichnung), Status-Badge, Sicherheitsgrad-Badge, Anzahl Nebendiagnosen, Ersteller-Name
- [x] Leer-Zustand mit CTA "Ersten Befund erstellen"
- [x] Lade-Skeleton während Datenabruf
- [x] Fehler-Alert mit "Erneut versuchen"-Button

#### AC-7: Befund bearbeiten — nur Ersteller oder Admin darf bearbeiten
- [x] API (`PATCH`): Prüft `existingRecord.created_by !== user.id && role !== 'admin'` → 403
- [x] API: Abgeschlossene Befunde (status = `abgeschlossen`) → 409 Conflict
- [x] RLS UPDATE-Policy: Nur Entwürfe editierbar, nur `created_by = auth.uid()` oder Admin
- [x] `BefundView`: "Bearbeiten"-Button nur sichtbar wenn `canEdit && isDraft`
- [x] `canEdit` berechnet korrekt: `isAdmin || (isHeilpraktiker && currentUserId === record.created_by)`
- [x] **FIXED (war BUG-3):** Edit-Seite `/os/patients/[id]/befund/[befundId]/edit` existiert jetzt mit vollständigem `BefundEditForm` inkl. Zod-Validierung, Freitext-Pflichtnotiz-Validierung, Entwurf- und Abschließen-Buttons

#### AC-8: Befund-PDF-Export
- [x] "Als PDF exportieren"-Button in `BefundView` implementiert
- [x] `window.print()` wird aufgerufen
- [x] Print-only-Styles via `print:hidden` Klassen (Tailwind): Buttons und Audit-Hinweis werden im Druck ausgeblendet
- [x] **FIXED (war BUG-4):** `globals.css` enthält vollständiges `@media print` mit A4 Seitenlayout (`@page { margin: 2cm; size: A4 }`), Seitenumbruch-Regeln (`page-break-inside: avoid`), B&W-Farbnormalisierung und `.print-header` Klasse für Praxiskopfzeile

---

### Edge Cases Status

#### EC-1: Veralteter/ungültiger ICD-Code — Warnung bei Eingabe
- [x] `Icd10Combobox` zeigt Warnung: "Dieser Code ist in der aktuellen ICD-10-GM Datei nicht hinterlegt — bitte prüfen." wenn `value` gesetzt, aber Code nicht in der lokalen Liste gefunden wird
- [x] Freitext-Fallback: Wenn kein Code gefunden, Button "Als Freitext-Diagnose übernehmen" in `CommandEmpty`
- [x] **FIXED (war BUG-5):** Serverseitige `superRefine`-Validierung in beiden API-Routen: wenn `icd10 = null` und `freitextDiagnose` gesetzt, wird `freitextNotiz` als Pflichtfeld erzwungen (422 Unprocessable Entity wenn leer). Gilt für POST und PATCH.

#### EC-2: Physiotherapeut versucht über API eine Diagnose zu speichern → 403 + Log-Eintrag
- [x] API blockt mit 403 und `console.warn`-Security-Log in `POST` und `PATCH`
- [x] `GET` gibt ebenfalls 403 zurück — kein versehentliches Datenleck

#### EC-3: Kein passender ICD-Code — Freitext-Diagnose mit Pflichtnotiz
- [x] UI-Warnung bei Freitext-Diagnose sichtbar ("Freitext-Diagnose — bitte Pflichtnotiz ergänzen.")
- [x] Notiz-Feld vorhanden, Zod-`superRefine` im Client-Formular erzwingt Eingabe
- [x] **FIXED (war BUG-5):** Serverseitige Pflichtvalidierung der `freitextNotiz` wenn `freitextDiagnose` gesetzt und `icd10 = null` — sowohl `BefundForm` als auch `BefundEditForm` haben identische Validierungslogik

---

### Security Audit Results

- [x] **Authentication:** Alle API-Routen prüfen `supabase.auth.getUser()` → 401 ohne Session
- [x] **Authorization (Rollentrennung):** Physiotherapeut erhält 403 auf GET/POST/PATCH. Middleware blockt Zugriff auf Frontend-Routen inkl. `/edit`. RLS als dritte Sicherheitsschicht im DB-Layer.
- [x] **Authorization (Datenisolation Heilpraktiker):** RLS-SELECT-Policy stellt sicher, dass Heilpraktiker nur Diagnosen seiner eigenen Patienten sieht (`patients.therapeut_id = auth.uid()`)
- [x] **Defense-in-Depth:** Drei unabhängige Schichten: Middleware → API-Rollencheck → RLS
- [x] **Audit-Feld `created_by_role`:** DB-Constraint `CHECK (created_by_role = 'heilpraktiker')` verhindert, dass ein Admin versehentlich einen anderen Wert setzt. API setzt immer `"heilpraktiker"` hardcoded.
- [x] **Immutability:** `status = 'abgeschlossen'` ist auf API-Ebene (409) und RLS-Ebene gleichzeitig blockiert für Updates. RLS-DELETE-Policy gibt `USING (false)` → kein physisches Löschen möglich.
- [x] **Input Validation:** Zod-Schemas auf allen API-Routen (POST + PATCH) inkl. `superRefine` für Freitext-Pflichtnotiz. UUID-Format-Validierung für URL-Parameter.
- [x] **XSS:** React rendert alle Felder als Text (kein `dangerouslySetInnerHTML`). `whitespace-pre-wrap` in `ReadonlyField` — keine HTML-Injection möglich.
- [x] **IDOR (Insecure Direct Object Reference):** API prüft `patient_id` aus URL gegen DB; RLS stellt sicher, dass nur eigene Patienten zugänglich sind. Befund-Lookup kombiniert `.eq("patient_id", patientId)` mit `.eq("id", befundId)` — cross-patient access auf Befunde ist blockiert.
- [x] **`created_by_role` Immutability:** `patchSchema` enthält `created_by_role` nicht — kein Überschreiben über API möglich. Zusätzlich DB-Level-Absicherung via RLS `WITH CHECK (created_by_role = 'heilpraktiker')`.
- [x] **Public ICD-10-GM JSON:** `public/data/icd10-gm.json` ist öffentlich abrufbar. Enthält keine Patientendaten (DSGVO-konform). Codes sind öffentlich verfügbare medizinische Klassifikationsdaten. Kein Sicherheitsproblem.
- [x] **Rate Limiting:** Kein explizites Rate Limiting auf den Diagnose-Routen — identisch zum restlichen System (PROJ-1, PROJ-2, PROJ-3 haben das gleiche Niveau). Kein Rückschritt gegenüber existierenden Features.
- [x] **No secrets in responses:** API-Antworten enthalten keine internen IDs oder Tokens jenseits der normalen Datenbankfelder.

---

### Bugs Found

#### BUG-1: ICD-10-GM Katalog kleiner als spezifiziert (teilweise verbessert)
- **Severity:** Medium
- **Steps to Reproduce:**
  1. Öffne Befundformular als Heilpraktiker
  2. Suche nach seltenen neurologischen oder kardiovaskulären Codes (z.B. "G20" Parkinson, "I63" Hirninfarkt, "F32" depressive Episode)
  3. Expected: Breite Abdeckung — Spec verspricht ~1.200 häufigste Codes
  4. Actual: 282 Codes vorhanden (verbessert von 194). G-Kapitel (40 Codes), F-Kapitel (10 Codes), I-Kapitel (6 Codes) ergänzt. Dennoch nur ~24% des spezifizierten Umfangs erreicht. Seltene Codes aus A-, B-, C-, D-, H-, L-, O-, P-, Q-Kapiteln fehlen komplett.
- **Priority:** Fix before deployment

#### BUG-2: Spec nennt `/os/diagnose/*` als zu blockierende Route, die nicht existiert
- **Severity:** Low
- **Steps to Reproduce:**
  1. Lese Spec AC: "Middleware blockiert `/os/befund/*` und `/os/diagnose/*`"
  2. Vergleiche mit implementierter Middleware-Regel
  3. Expected: `/os/diagnose/*` wird auch blockiert
  4. Actual: Die Route `/os/diagnose/*` existiert in der App nicht. Die Implementierung nutzt korrekt `/os/patients/[id]/befund/*`. Kein Sicherheitsrisiko, nur Spec-Diskrepanz.
- **Priority:** Fix in next sprint (Spec aktualisieren oder Route ergänzen, je nach Intention)

---

### Regression Testing — Deployed Features

#### PROJ-1 (Authentifizierung & Rollenrechte)
- [x] Login-Redirect funktioniert korrekt
- [x] `useUserRole` Hook arbeitet unverändert (keine Änderungen an `use-user-role.ts`)
- [x] Middleware-Guards für PROJ-1-Routen unverändert

#### PROJ-2 (Patientenstammdaten)
- [x] Patient-Detail-Seite lädt korrekt (neuer Tab "Befund & Diagnose" eingebaut)
- [x] `StammdatenTab`, `PatientDetailHeader` unberührt
- [x] API `/api/patients/[id]` unverändert

#### PROJ-3 (Anamnese & Untersuchungsdokumentation)
- [x] `AnamnesisTab` in der Patient-Detailseite weiterhin vorhanden und unter Tab "Dokumentation"
- [x] `use-anamnesis.ts` Hook unverändert
- [x] DB-Migration PROJ-3 nicht tangiert

---

### Summary
- **Acceptance Criteria:** 7/8 vollständig bestanden (AC-1 mit Einschränkung durch BUG-1)
- **Bugs Found:** 2 total (0 critical, 0 high, 1 medium, 1 low) — BUG-3, BUG-4, BUG-5 wurden vom Entwickler behoben
- **Security:** Gut — Defense-in-Depth korrekt implementiert (Middleware + API + RLS). Keine kritischen oder hohen Sicherheitslücken.
- **Build:** Passing — keine TypeScript-Fehler, keine Build-Warnungen
- **Production Ready:** NO — BUG-1 (ICD-10-Katalog nur 282/1.200 Codes) muss vor Deployment auf ausreichende Abdeckung erweitert werden.
- **Recommendation:** ICD-10-GM JSON auf ~1.200 häufigste Codes erweitern. BUG-2 kann in nächstem Sprint per Spec-Update (Wording anpassen) behoben werden.

## Deployment
_To be added by /deploy_
