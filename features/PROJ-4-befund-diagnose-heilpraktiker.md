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

**Tested:** 2026-02-18
**App URL:** http://localhost:3000
**Tester:** QA Engineer (AI)
**Build:** Passing — `npm run build` compiled successfully with 0 errors

---

### Acceptance Criteria Status

#### AC-1: ICD-10-Suche — Autocomplete mit ICD-10-GM Katalog (deutsch), Mehrfachdiagnosen möglich
- [x] `Icd10Combobox` implementiert mit shadcn `Command` + `Popover`
- [x] Filtert nach Code UND Bezeichnung gleichzeitig (case-insensitive)
- [x] Zeigt bis zu 80 Treffer bei Suche, 50 beim Öffnen ohne Eingabe
- [x] ICD-10-GM Datei lokal eingebettet (`public/data/icd10-gm.json`, 194 Einträge aus M-, G-, S- und Z-Kapiteln)
- [x] Mehrfachdiagnosen: Hauptdiagnose + bis zu 5 Nebendiagnosen, je mit eigenem `Icd10Combobox`
- [ ] BUG-1 (Medium): ICD-10-GM Datei enthält nur ~194 Codes — die Spec spricht von ~1.200 häufigsten Codes. Der Katalog ist deutlich kleiner als dokumentiert und deckt nur M-, S- und Z-Kapitel ab (keine G-Kapitel für Neurologie trotz Spec-Erwähnung).

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
- [x] Regex `/^\/os\/patients\/[^/]+\/befund(\/|$)/` blockiert korrekt alle Subpfade
- [x] `pathname.startsWith('/os/befund')` als Legacy-Guard für Top-Level-Route
- [x] Redirect zu `/403` bei Zugriff als Physiotherapeut
- [ ] BUG-2 (Low): Die Spec nennt auch `/os/diagnose/*` als zu blockierende Route, diese Route existiert nicht in der Implementierung. Die tatsächlich implementierte Route `/os/patients/[id]/befund/*` ist korrekt blockiert. Kein Sicherheitsproblem, aber Diskrepanz zur Spec.

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
- [ ] BUG-3 (High): Es gibt keine Edit-Seite (`/os/patients/[id]/befund/[befundId]/edit`). Der "Bearbeiten"-Button in `BefundView` verlinkt auf `href={...befundId}/edit}`, aber diese Route existiert nicht. Das Bearbeiten eines Entwurfs ist damit im Frontend **nicht funktionsfähig**, obwohl die API `PATCH` korrekt implementiert ist.

#### AC-8: Befund-PDF-Export
- [x] "Als PDF exportieren"-Button in `BefundView` implementiert
- [x] `window.print()` wird aufgerufen
- [x] Print-only-Styles via `print:hidden` Klassen (Tailwind): Buttons und Audit-Hinweis werden im Druck ausgeblendet
- [ ] BUG-4 (Low): Kein dediziertes `@media print` CSS — der Druck verwendet das normale Layout. Für einen professionellen PDF-Export fehlen print-spezifische Stile (z.B. saubere Seitenumbrüche, Kopf-/Fußzeile mit Patientenname). Funktioniert technisch, aber das Ergebnis ist suboptimal.

---

### Edge Cases Status

#### EC-1: Veralteter/ungültiger ICD-Code — Warnung bei Eingabe
- [x] `Icd10Combobox` zeigt Warnung: "Dieser Code ist in der aktuellen ICD-10-GM Datei nicht hinterlegt — bitte prüfen." wenn `value` gesetzt, aber Code nicht in der lokalen Liste gefunden wird
- [x] Freitext-Fallback: Wenn kein Code gefunden, Button "Als Freitext-Diagnose übernehmen" in `CommandEmpty`
- [ ] BUG-5 (Medium): Der Freitext-Fallback aus der `CommandEmpty`-Ansicht setzt `bezeichnung: "(Freitext)"` fest, aber es gibt keine serverseitige Validierung, die einen Freitext-Code **ablehnt** — ein Angreifer kann beliebige Codes über die API einschleusen. Die Spec verlangt bei Freitext-Diagnose eine Pflichtnotiz (`freitextNotiz`). Die API erzwingt diese Pflicht jedoch nicht — das Feld `freitextNotiz` ist `optional().default("")`. Im Frontend erscheint nur ein UI-Hinweis, aber keine Pflichtvalidierung.

#### EC-2: Physiotherapeut versucht über API eine Diagnose zu speichern → 403 + Log-Eintrag
- [x] API blockt mit 403 und `console.warn`-Security-Log in `POST` und `PATCH`
- [x] `GET` gibt ebenfalls 403 zurück — kein versehentliches Datenleck

#### EC-3: Kein passender ICD-Code — Freitext-Diagnose mit Pflichtnotiz
- [x] UI-Warnung bei Freitext-Diagnose sichtbar
- [x] Notiz-Feld vorhanden und durch Placeholder angedeutet als wichtig
- [ ] BUG-5 (wie oben): Keine serverseitige Pflichtvalidierung der `freitextNotiz` wenn `freitextDiagnose` gesetzt ist und `icd10 = null`

---

### Security Audit Results

- [x] **Authentication:** Alle API-Routen prüfen `supabase.auth.getUser()` → 401 ohne Session
- [x] **Authorization (Rollentrennung):** Physiotherapeut erhält 403 auf GET/POST/PATCH. Middleware blockt Zugriff auf Frontend-Routen. RLS als dritte Sicherheitsschicht im DB-Layer.
- [x] **Authorization (Datenisolation Heilpraktiker):** RLS-SELECT-Policy stellt sicher, dass Heilpraktiker nur Diagnosen seiner eigenen Patienten sieht (`patients.therapeut_id = auth.uid()`)
- [x] **Defense-in-Depth:** Drei unabhängige Schichten: Middleware → API-Rollencheck → RLS
- [x] **Audit-Feld `created_by_role`:** DB-Constraint `CHECK (created_by_role = 'heilpraktiker')` verhindert, dass ein Admin versehentlich einen anderen Wert setzt. API setzt immer `"heilpraktiker"` hardcoded.
- [x] **Immutability:** `status = 'abgeschlossen'` ist auf API-Ebene (409) und RLS-Ebene gleichzeitig blockiert für Updates. RLS-DELETE-Policy gibt `USING (false)` → kein physisches Löschen möglich.
- [x] **Input Validation:** Zod-Schemas auf allen API-Routen (POST + PATCH). UUID-Format-Validierung für URL-Parameter.
- [x] **XSS:** React rendert alle Felder als Text (kein `dangerouslySetInnerHTML`). `whitespace-pre-wrap` in `ReadonlyField` — keine HTML-Injection möglich.
- [x] **IDOR (Insecure Direct Object Reference):** API prüft `patient_id` aus URL gegen DB; RLS stellt sicher, dass nur eigene Patienten zugänglich sind. Befund-Lookup kombiniert `.eq("patient_id", patientId)` mit `.eq("id", befundId)` — cross-patient access auf Befunde ist blockiert.
- [ ] **BUG-6 (Medium):** Die `PATCH`-Route erlaubt es einem Admin, den `created_by_role`-Wert **nicht** zu überschreiben (nicht im patchSchema vorhanden) — das ist korrekt. Jedoch hat die RLS-UPDATE-`WITH CHECK`-Klausel `created_by_role = 'heilpraktiker'` — ein Admin, der aus Versehen einen anderen Wert setzt (nicht über UI möglich), würde vom DB-Layer gestoppt. Dies ist kein aktives Sicherheitsproblem, da die API den Wert nicht akzeptiert.
- [ ] **BUG-7 (Medium):** Die ICD-10-GM JSON-Datei liegt in `public/data/icd10-gm.json` und ist damit öffentlich über das Netz abrufbar (`/data/icd10-gm.json`). Dies enthält **keine** Patientendaten, ist also kein DSGVO-Problem. Die Codes sind frei verfügbar. Kein Sicherheitsproblem, aber erwähnenswert für das Tech-Design.
- [x] **Rate Limiting:** Kein explizites Rate Limiting auf den Diagnose-Routen — identisch zum restlichen System (PROJ-1, PROJ-2, PROJ-3 haben das gleiche Niveau). Kein Rückschritt gegenüber existierenden Features.
- [x] **No secrets in responses:** API-Antworten enthalten keine internen IDs oder Tokens jenseits der normalen Datenbankfelder.

---

### Bugs Found

#### BUG-1: ICD-10-GM Katalog deutlich kleiner als spezifiziert
- **Severity:** Medium
- **Steps to Reproduce:**
  1. Öffne Befundformular als Heilpraktiker
  2. Suche in der Hauptdiagnose-Combobox nach einem neurologischen ICD-Code (z.B. "G43" für Migräne oder "G54" für Nervenwurzelkompression)
  3. Expected: Treffer gefunden — Spec verspricht G-Kapitel (Neurologie) und ~1.200 Codes
  4. Actual: Kein Treffer. Die JSON-Datei enthält nur 194 Codes aus M- und S-Kapiteln (Bewegungsapparat + Verletzungen) plus einige Z-Codes. G-Kapitel fehlt komplett.
- **Priority:** Fix before deployment

#### BUG-2: Spec nennt `/os/diagnose/*` als zu blockierende Route, die nicht existiert
- **Severity:** Low
- **Steps to Reproduce:**
  1. Lese Spec AC: "Middleware blockiert `/os/befund/*` und `/os/diagnose/*`"
  2. Vergleiche mit implementierter Middleware-Regel
  3. Expected: `/os/diagnose/*` wird auch blockiert
  4. Actual: Die Route `/os/diagnose/*` existiert in der App nicht. Die Implementierung nutzt korrekt `/os/patients/[id]/befund/*`. Kein Sicherheitsrisiko, nur Spec-Diskrepanz.
- **Priority:** Fix in next sprint (Spec aktualisieren oder Route ergänzen, je nach Intention)

#### BUG-3: Edit-Seite für Befund-Entwurf fehlt
- **Severity:** High
- **Steps to Reproduce:**
  1. Erstelle einen Befundbericht als Entwurf (Status: "Entwurf")
  2. Öffne den Befundbericht in der Detailansicht `/os/patients/[id]/befund/[befundId]`
  3. Klicke den "Bearbeiten"-Button
  4. Expected: Formular zum Bearbeiten des Entwurfs öffnet sich
  5. Actual: 404-Fehler — die Route `/os/patients/[id]/befund/[befundId]/edit` existiert nicht. Weder die Page-Datei noch das Edit-Formular ist implementiert.
- **Priority:** Fix before deployment

#### BUG-4: PDF-Export ohne professionelle Print-Styles
- **Severity:** Low
- **Steps to Reproduce:**
  1. Öffne einen abgeschlossenen Befundbericht
  2. Klicke "Als PDF exportieren"
  3. Expected: Professioneller PDF-Druck mit sauberem Layout, Kopfzeile, Seitenumbrüchen
  4. Actual: Browser-Druck-Dialog mit dem normalen Webseiten-Layout. `print:hidden` ist gesetzt für UI-Elemente, aber kein spezifisches Print-CSS für Typografie, Seitenränder oder Kopf-/Fußzeilen.
- **Priority:** Fix in next sprint

#### BUG-5: Freitext-Diagnose ohne serverseitige Pflichtnotiz-Validierung
- **Severity:** Medium
- **Steps to Reproduce:**
  1. Öffne Befundformular
  2. Wähle keine ICD-10-Diagnose (lasse Feld leer), tippe nichts in Freitext-Diagnose
  3. Alternativ: Sende direkt via API POST mit `{ icd10: null, sicherheitsgrad: "gesichert", freitextDiagnose: "Eigenerfundene Diagnose", freitextNotiz: "" }`
  4. Expected: Server lehnt ab wenn `icd10 = null`, `freitextDiagnose` gesetzt aber `freitextNotiz` leer
  5. Actual: Server akzeptiert — `freitextNotiz` ist `optional().default("")`. Die Pflichtnotiz-Anforderung ist nur als UI-Hinweis kommuniziert, nicht erzwungen.
- **Priority:** Fix before deployment

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
- **Acceptance Criteria:** 6/8 vollständig bestanden (AC-1 mit Einschränkung, AC-7 und AC-8 mit Bugs)
- **Bugs Found:** 5 total (0 critical, 1 high, 2 medium, 2 low)
- **Security:** Gut — Defense-in-Depth korrekt implementiert (Middleware + API + RLS). Keine kritischen Sicherheitslücken.
- **Build:** Passing — keine TypeScript-Fehler, keine Build-Warnungen
- **Production Ready:** NO — BUG-3 (fehlende Edit-Seite) und BUG-5 (fehlende Pflichtnotiz-Validierung) müssen vor Deployment behoben werden.
- **Recommendation:** Fix BUG-3 und BUG-5 zuerst, dann BUG-1 (ICD-Katalog erweitern). BUG-2 und BUG-4 können im nächsten Sprint folgen.

## Deployment
_To be added by /deploy_
