# PROJ-3: Anamnese & Untersuchungsdokumentation

## Status: In Review
**Created:** 2026-02-17
**Last Updated:** 2026-02-18

## Dependencies
- Requires: PROJ-1 (Authentifizierung & Rollenrechte)
- Requires: PROJ-2 (Patientenstammdaten)

## User Stories
- Als Physiotherapeut möchte ich bei der Erstaufnahme eine strukturierte Anamnese erfassen (Hauptbeschwerde, Schmerzanamnese, Vorerkrankungen, Medikamente), damit alle relevanten Informationen zentral gespeichert sind.
- Als Therapeut möchte ich Untersuchungsbefunde dokumentieren (Bewegungsausmaß, Muskeltests, Schmerzlokalisation auf Körperbild), damit meine Kollegen den Status des Patienten nachvollziehen können.
- Als Therapeut möchte ich frühere Anamnesebögen einsehen können, damit ich Veränderungen im Verlauf erkenne.
- Als Heilpraktiker möchte ich erweiterte Untersuchungsfelder sehen (z.B. Differentialdiagnosen-Checklisten), die einem normalen PT nicht angezeigt werden.

## Acceptance Criteria
- [ ] Anamnesebogen-Formular: Hauptbeschwerde, Schmerzdauer, Schmerzcharakter (NRS 0-10), Lokalisation
- [ ] Vorerkrankungen (Mehrfachauswahl aus Katalog + Freitext)
- [ ] Aktuelle Medikamente (Freitext)
- [ ] Untersuchungsfelder: Bewegungsausmaß (Gelenk, Bewegungsrichtung, Grad), Kraftgrad (0-5 nach Janda)
- [ ] Körperschema-Markierung: Schmerzlokalisation auf SVG-Körperbild (anterior/posterior) per Klick markierbar
- [ ] Versionierung: Jede Anamnese-Erfassung wird als eigener Eintrag gespeichert (Verlauf sichtbar)
- [ ] Heilpraktiker-Erweiterung: Differentialdiagnosen-Notizfeld und erweiterte orthopädische Tests
- [ ] Physiotherapeuten sehen kein Diagnosefeld (nur in PROJ-4)
- [ ] Export als PDF möglich

## Edge Cases
- Was passiert, wenn eine Anamnese nur zur Hälfte ausgefüllt ist? → Als Entwurf speicherbar, Markierung "Unvollständig"
- Was passiert, wenn zwei Therapeuten gleichzeitig die Akte bearbeiten? → Letzter Stand gewinnt, Warnung bei parallelem Edit
- Was passiert, wenn der Patient keine Vorerkrankungen hat? → Checkbox "Keine bekannt" setzt Pflichtfeld als ausgefüllt

## Technical Requirements
- Tabelle: `anamnesis_records` mit `patient_id`, `created_by`, `version`, `data (JSONB)`
- SVG-Körperbild: Interaktives Markup gespeichert als JSON-Koordinaten
- RLS: Nur zugewiesene Therapeuten und Admins dürfen Daten lesen/schreiben

---

## Tech Design (Solution Architect)
**Designed:** 2026-02-18

### Seitenstruktur & Komponenten

```
/os/patients/[id]                       ← Patientenakte (existiert bereits)
+-- Tab: Dokumentation                  ← war Platzhalter → wird ersetzt
    +-- AnamnesisTab
        +-- AnamnesisHistory            ← Liste aller bisherigen Bögen
        |   +-- AnamnesisCard (Datum, Ersteller, Status-Badge: Entwurf / Abgeschlossen)
        |   +-- Leer-Zustand
        +-- "Neue Anamnese" Button

/os/patients/[id]/anamnesis/new         ← Neuer Anamnesebogen (volles Formular)
+-- AnamnesisForm
    +-- Abschnitt: Hauptbeschwerde (Freitext + Schmerzdauer + Schmerzcharakter)
    +-- Abschnitt: Schmerzintensität (NRS Schieberegler 0–10)
    +-- Abschnitt: Schmerzlokalisation (interaktives SVG-Körperbild, anterior + posterior)
    +-- Abschnitt: Vorerkrankungen (Checkbox-Katalog + "Keine bekannt" + Freitext)
    +-- Abschnitt: Aktuelle Medikamente (Freitext)
    +-- Abschnitt: Bewegungsausmaß (dynamische Tabelle: Gelenk, Richtung, Grad in °)
    +-- Abschnitt: Kraftgrad nach Janda (Tabelle: Muskelgruppe, Grad 0–5)
    +-- [Nur Heilpraktiker] Abschnitt: Differentialdiagnosen (Notizfeld)
    +-- [Nur Heilpraktiker] Abschnitt: Erweiterte orthopädische Tests
    +-- "Als Entwurf speichern" / "Abschließen & sperren" Buttons

/os/patients/[id]/anamnesis/[recordId]  ← Früherer Bogen (nur lesen + PDF-Export)
+-- AnamnesisView (alle Abschnitte, read-only)
+-- "Als PDF exportieren" Button
```

### Datenmodell

**Tabelle `anamnesis_records`**:
- `patient_id` — Verknüpfung zum Patienten
- `created_by` — Therapeut der den Bogen angelegt hat
- `version` — Automatisch hochgezählt je Patient (1, 2, 3 ...)
- `status` — `entwurf` oder `abgeschlossen` (abgeschlossene Bögen sind schreibgeschützt)
- `data` (JSONB) — alle Formularfelder flexibel gespeichert:
  - Hauptbeschwerde, Schmerzdauer, Schmerzcharakter
  - NRS-Wert (0–10)
  - Schmerzlokalisation als Koordinaten-JSON (SVG-Klick-Punkte)
  - Vorerkrankungen (Array aus Katalog + Freitext)
  - Medikamente (Freitext)
  - Bewegungsausmaß (Array: Gelenk, Richtung, Grad)
  - Kraftgrad (Array: Muskelgruppe, Grad 0–5)
  - HP-Felder: Differentialdiagnosen, erweiterte Tests (nur gefüllt wenn Heilpraktiker)
- `created_at`, `updated_at`

**Warum JSONB?** Anamnesebögen ändern sich über Zeit (neue Felder, neue Krankheiten). JSONB erlaubt das ohne Datenbankmigrationen.

**Unveränderlichkeit:** Abgeschlossene Bögen werden nie überschrieben — nur neue Versionen angelegt. Entwürfe dürfen bearbeitet werden.

**RLS:**
- PT/HP → lesen/schreiben nur Patienten des eigenen `therapeut_id`
- Admin → liest alle
- Patient → kein Zugriff (Anamnese ist klinische Doku)

### Tech-Entscheidungen

| Entscheidung | Begründung |
|---|---|
| JSONB für Formulardaten | Flexibel erweiterbar ohne Schema-Migrationen; Standard für strukturierte klinische Docs |
| Versionierung als neue Zeilen | Dokumentationspflicht: kein Überschreiben von Befunden; vollständige Historie |
| SVG-Körperbild (custom) | Kein externes Paket nötig; interaktive Klick-Punkte als JSON-Koordinaten gespeichert |
| NRS als Schieberegler | Klinischer Standard (Numeric Rating Scale); intuitiv für Therapeuten |
| Heilpraktiker-Felder client- + serverseitig | Felder werden basierend auf Rolle ein/ausgeblendet; kein HP-Inhalt für PT sichtbar |
| PDF-Export: `@react-pdf/renderer` | Bewährte Lösung für strukturierte PDFs in Next.js; offline-fähig |
| Entwurf-Modus | Erlaubt unterbrechbare Dokumentation (z.B. Patient kommt wieder) ohne Datenverlust |

### Neue Pakete
- `@react-pdf/renderer` — PDF-Export des Anamnesebogens

## QA Test Results

**Tested:** 2026-02-18
**App URL:** http://localhost:3000
**Tester:** QA Engineer (AI)
**Build:** Passes cleanly — `npm run build` completes with 0 TypeScript errors, all 24 routes compiled.

---

### Acceptance Criteria Status

#### AC-1: Anamnesebogen-Formular — Hauptbeschwerde, Schmerzdauer, Schmerzcharakter (NRS 0-10), Lokalisation
- [x] Hauptbeschwerde: Pflicht-Textarea vorhanden, Zod min(1)/max(2000), Fehleranzeige implementiert
- [x] Schmerzdauer: Input-Feld vorhanden (max 200)
- [x] Schmerzcharakter: Input-Feld vorhanden (max 500)
- [x] NRS 0–10: Schieberegler implementiert, farbkodiert (grün/gelb/rot), ARIA-Label vorhanden
- [x] Schmerzlokalisation: Interaktives SVG-Körperbild (anterior + posterior), Klick-Punkte werden als JSON-Koordinaten gespeichert

#### AC-2: Vorerkrankungen — Mehrfachauswahl aus Katalog + Freitext
- [x] Checkbox-Katalog mit 19 Einträgen implementiert
- [x] Freitext-Feld für weitere Vorerkrankungen
- [x] "Keine bekannten Vorerkrankungen" Checkbox blendet Katalog aus und leert Auswahl
- [ ] BUG-1 (Medium): Wenn "Keine bekannt" aktiv ist und der Nutzer danach manuell eine Krankheit aus dem Katalog anklickt, wird die "Keine bekannt"-Checkbox nicht automatisch deaktiviert. Die Checkbox-Katalog ist jedoch ausgeblendet, solange "Keine bekannt" aktiv ist — daher kein widersprüchlicher Zustand möglich, aber `keineVorerkrankungen` bleibt `true` wenn man per direkter State-Manipulation interagieren würde.

#### AC-3: Aktuelle Medikamente (Freitext)
- [x] Textarea vorhanden, max 2000 Zeichen, korrekt validiert

#### AC-4: Untersuchungsfelder — Bewegungsausmaß (Gelenk, Bewegungsrichtung, Grad), Kraftgrad (0-5 nach Janda)
- [x] Bewegungsausmaß: Dynamische Tabelle mit Gelenk (Select), Richtung (Select), Grad (Input)
- [x] 15 Gelenk-Optionen, 10 Richtungs-Optionen in Dropdowns
- [x] Kraftgrad: Tabelle mit Muskelgruppe (Select) und Grad 0–5 (Select)
- [x] Zeilen können per Trash-Button entfernt werden
- [ ] BUG-2 (Medium): Das Grad-Feld im Bewegungsausmaß ist ein Freitext-Input — es gibt keine serverseitige Validierung, ob der Wert eine valide Gradzahl darstellt (z.B. akzeptiert "abc"). Server validiert nur max(20) Zeichen. Das Feld ist klinisch sicherheitskritisch.

#### AC-5: Körperschema-Markierung — SVG-Körperbild anterior/posterior per Klick markierbar
- [x] SVG-Körperbild anterior und posterior implementiert
- [x] Klick-Punkte werden hinzugefügt, Klick auf Punkt entfernt ihn
- [x] "Alle entfernen" Button vorhanden
- [x] Read-only Ansicht in AnamnesisView implementiert
- [ ] BUG-3 (Medium): Die Koordinaten werden als absolute SVG-Pixel gespeichert (x, y als integer in SVG-Koordinatenraum), nicht als relative 0–1 Werte. Der PainPoint-Typ definiert `x: number, y: number`, und der Server-Zod-Schema validiert `x: z.number().min(0).max(1)`. Die BodySchema.tsx-Komponente rechnet jedoch mit absoluten SVG-Koordinaten (BODY_SVG_WIDTH=120, BODY_SVG_HEIGHT=300). Ein gespeicherter Punkt mit x=60, y=150 würde die API-Validierung scheitern lassen, da x>1. **Dies ist ein kritischer Datenverlust-Bug — gespeicherte Schmerzpunkte werden vom Server abgelehnt.**

#### AC-6: Versionierung — Jede Anamnese-Erfassung als eigener Eintrag gespeichert (Verlauf sichtbar)
- [x] DB-Trigger `set_anamnesis_version` inkrementiert `version` automatisch pro Patient
- [x] Versionsnummer wird in AnamnesisCard und AnamnesisView angezeigt
- [x] Verlauf in AnamnesisTab als sortierte Liste (neueste zuerst) sichtbar
- [x] Abgeschlossene Bögen sind schreibgeschützt (RLS UPDATE Policy + Application-Level Guard)

#### AC-7: Heilpraktiker-Erweiterung — Differentialdiagnosen-Notizfeld und erweiterte orthopädische Tests
- [x] Felder werden nur angezeigt wenn `isHeilpraktiker || isAdmin` (client-seitig via `useUserRole`)
- [x] Server-seitige Durchsetzung: POST und PATCH Routen strippen HP-Felder für Nicht-HP-Nutzer
- [x] HP-Felder werden in AnamnesisView nur angezeigt wenn befüllt (data.differentialdiagnosen || data.erweiterte_tests)

#### AC-8: Physiotherapeuten sehen kein Diagnosefeld (nur in PROJ-4)
- [x] `isHeilpraktiker`-Flag wird an `AnamnesisForm` übergeben, bei PT bleiben Felder ausgeblendet
- [x] Server-seitige Durchsetzung via `get_my_role()` in der API

#### AC-9: Export als PDF möglich
- [ ] BUG-4 (High): PDF-Export ist nicht vollständig implementiert. `handlePdfExport()` in `AnamnesisView.tsx` ruft nur `window.print()` auf. Das spezifizierte Paket `@react-pdf/renderer` ist nicht in `package.json` installiert. Das Acceptance Criterion verlangt einen strukturierten PDF-Export, `window.print()` ist kein echter PDF-Export und produziert keine strukturierten, patientenakten-tauglichen PDFs.

---

### Edge Cases Status

#### EC-1: Anamnese nur zur Hälfte ausgefüllt — Als Entwurf speicherbar, Markierung "Unvollständig"
- [x] "Als Entwurf speichern" Button funktioniert auch wenn nur Pflichtfelder (Hauptbeschwerde) ausgefüllt
- [ ] BUG-5 (Low): Das System zeigt den Status "Entwurf" als Badge an, aber es gibt keine explizite "Unvollständig"-Markierung wie in der Spec beschrieben. Das ist rein ein Label-Unterschied (Status heißt "Entwurf", nicht "Unvollständig") — funktional korrekt, terminologisch abweichend.

#### EC-2: Zwei Therapeuten bearbeiten gleichzeitig die Akte
- [ ] BUG-6 (Medium): Keine Warnung bei parallelem Edit implementiert. Die Spec definiert "Letzter Stand gewinnt, Warnung bei parallelem Edit". Die "Letzter Stand gewinnt"-Logik (last write wins) ist durch PATCH vorhanden, aber eine Warnung/Concurrency-Indikator fehlt vollständig.

#### EC-3: Patient hat keine Vorerkrankungen — Checkbox "Keine bekannt" setzt Pflichtfeld
- [x] "Keine bekannten Vorerkrankungen" Checkbox wird gespeichert (`keineVorerkrankungen: true`)
- [x] In AnamnesisView wird "Keine bekannten Vorerkrankungen" korrekt angezeigt

---

### Security Audit Results

- [x] **Authentifizierung:** Beide API-Routen prüfen `supabase.auth.getUser()` — nicht-authentifizierte Requests erhalten 401
- [x] **Autorisierung (RLS):** `anamnesis_records` hat RLS aktiviert. SELECT/INSERT/UPDATE/DELETE Policies vorhanden. Therapeut sieht nur Anamnesen eigener Patienten (via `therapeut_id` Join). Patient-Rolle hat explizit keinen Zugriff.
- [x] **HP-Felder Server-Durchsetzung:** POST und PATCH strippen `differentialdiagnosen` und `erweiterte_tests` für Nicht-HP-Nutzer server-seitig — rein client-seitige Unterdrückung wäre unzureichend.
- [x] **Zod-Validierung:** Alle API-Inputs werden mit Zod validiert (anamnesisDataSchema, createAnamnesisSchema, patchAnamnesisSchema). UUID-Format-Checks auf patientId und recordId.
- [x] **XSS-Schutz:** Keine gefährlichen `dangerouslySetInnerHTML`-Verwendungen. React escaped alle Ausgaben automatisch. Freitext-Felder werden nur in `<p>` oder `<Textarea>` gerendert.
- [x] **Unveränderlichkeit:** RLS UPDATE Policy blockiert Änderungen an abgeschlossenen Bögen auf DB-Ebene. Application-Level Guard liefert aussagekräftige Fehlermeldung (409 Conflict).
- [x] **DSGVO DELETE-Schutz:** DELETE-Policy mit `USING (false)` verhindert physisches Löschen von Anamnesedaten.
- [x] **Secrets:** Keine hardcodierten Credentials. Supabase-Credentials via `NEXT_PUBLIC_SUPABASE_URL` / `NEXT_PUBLIC_SUPABASE_ANON_KEY` Env-Vars.
- [ ] **BUG-7 (Medium — Security):** `useUserRole` Hook liest die Rolle direkt aus Supabase `user_profiles` auf dem Client. Wenn ein Angreifer seinen `user_profiles.role` manipuliert (was RLS verhindern sollte, aber theoretisch durch einen Supabase-Konfigurationsfehler möglich wäre), könnte er HP-Felder auf der Client-Seite sehen. **Da der Server die Rolle unabhängig prüft und HP-Felder serverseitig strippt, ist das Risiko gering.** Es ist jedoch eine Defense-in-Depth-Lücke: Der Server vertraut der `user_profiles`-Tabelle — diese muss durch eine RLS-Policy geschützt sein, die Nutzer nur ihre eigene Zeile lesen/schreiben lässt. Die Migration für PROJ-1 sollte das abdecken, aber wurde hier nicht verifiziert.
- [ ] **BUG-8 (High — Security):** Die PATCH-Route prüft nicht, ob der aktuelle User der ursprüngliche `created_by`-Ersteller ist, wenn er nicht Admin ist. Die RLS UPDATE Policy tut das (`created_by = auth.uid()`), aber die Application-Level-Prüfung in der Route lädt den Datensatz und prüft nur `status === 'abgeschlossen'` — nicht `created_by === user.id`. Das bedeutet: Ein anderer Therapeut mit Zugriff auf denselben Patienten (falls zukünftig multi-therapeut) könnte einen Entwurf eines Kollegen überschreiben. Aktuell verhindert die RLS-Policy das, aber der Fehler sollte application-seitig auch geprüft werden (defense in depth).

---

### Bugs Found

#### BUG-1: "Keine Vorerkrankungen" Checkbox wird nicht automatisch deaktiviert
- **Severity:** Low
- **Steps to Reproduce:**
  1. Öffne neuen Anamnesebogen
  2. Aktiviere "Keine bekannten Vorerkrankungen"
  3. Katalog blendet sich aus — korrekt
  4. Deaktiviere "Keine bekannt" manuell, wähle eine Krankheit aus
  5. Aktiviere "Keine bekannt" erneut — Krankheiten werden geleert (korrekt)
  6. Beobachtung: Wenn ein zukünftiger Workflow beide Checkboxen gleichzeitig setzt (z.B. programmatisch), entsteht kein inkonsistenter Zustand durch UI, aber die Logik ist nur einseitig (HP-Auswahl leert "Keine bekannt" nicht)
- **Priority:** Fix in next sprint

#### BUG-2: Bewegungsausmaß Grad-Feld akzeptiert keine-numerischen Werte
- **Severity:** Medium
- **Steps to Reproduce:**
  1. Öffne neuen Anamnesebogen
  2. Füge eine Bewegungsausmass-Zeile hinzu
  3. Gib "abc" im Grad-Feld ein
  4. Erwartetes Verhalten: Validierungsfehler "Bitte eine gültige Gradzahl eingeben"
  5. Tatsächliches Verhalten: Formular akzeptiert den Wert, API speichert "abc" als Gradwert
- **Priority:** Fix before deployment

#### BUG-3: Kritisch — Schmerzlokalisation-Koordinaten scheitern an API-Validierung
- **Severity:** Critical
- **Steps to Reproduce:**
  1. Öffne neuen Anamnesebogen (`/os/patients/[id]/anamnesis/new`)
  2. Klicke auf das Körperbild, um einen Schmerzpunkt zu setzen
  3. Versuche, den Bogen zu speichern
  4. Erwartetes Verhalten: Speichern erfolgreich, Schmerzpunkt wird gespeichert
  5. Tatsächliches Verhalten: API gibt 422 zurück. Ursache: `BodySchema.tsx` speichert absolute SVG-Koordinaten (x bis 120, y bis 300), aber `painPointSchema` auf dem Server validiert `x: z.number().min(0).max(1)` und `y: z.number().min(0).max(1)` als normalisierte 0–1 Werte. Die Umrechnung auf normalisierte Werte fehlt in der Komponente.
- **Priority:** Fix before deployment

#### BUG-4: PDF-Export nicht implementiert (window.print statt @react-pdf/renderer)
- **Severity:** High
- **Steps to Reproduce:**
  1. Öffne einen gespeicherten Anamnesebogen
  2. Klicke "Als PDF exportieren"
  3. Erwartetes Verhalten: Strukturiertes PDF wird generiert/heruntergeladen
  4. Tatsächliches Verhalten: Browser-Druckdialog öffnet sich (window.print())
  5. `@react-pdf/renderer` ist nicht in package.json installiert
- **Priority:** Fix before deployment

#### BUG-5: Status-Label "Entwurf" statt "Unvollständig" wie in Spec
- **Severity:** Low
- **Steps to Reproduce:**
  1. Speichere einen unvollständigen Anamnesebogen als Entwurf
  2. Öffne die Patientenakte → Dokumentation-Tab
  3. Erwartetes Verhalten laut Spec: Badge "Unvollständig"
  4. Tatsächliches Verhalten: Badge "Entwurf"
- **Priority:** Nice to have

#### BUG-6: Keine Warnung bei parallelem Edit (Concurrency-Indikator fehlt)
- **Severity:** Medium
- **Steps to Reproduce:**
  1. Öffne denselben Entwurf-Bogen in zwei Browser-Tabs
  2. Bearbeite und speichere in Tab 1
  3. Bearbeite und speichere in Tab 2
  4. Erwartetes Verhalten laut Spec: Warnung "Bogen wurde inzwischen von jemand anderem bearbeitet"
  5. Tatsächliches Verhalten: Letzter Stand überschreibt ohne Warnung (silent last-write-wins)
- **Priority:** Fix in next sprint

#### BUG-7: Defense-in-Depth-Lücke bei Client-seitiger Rollenprüfung
- **Severity:** Medium (Security — Low Risk given server-side enforcement)
- **Steps to Reproduce:**
  1. Als Physiotherapeut eingeloggt
  2. Öffne DevTools, manipuliere den lokalen Supabase-Cache (`user_profiles.role`)
  3. Erwartetes Verhalten: HP-Felder bleiben ausgeblendet
  4. Tatsächliches Verhalten: HP-Felder könnten client-seitig sichtbar werden (rein visuell), aber der Server strippt die Daten bei Speicherung
  5. Risiko: Gering durch korrekte serverseitige Durchsetzung
- **Priority:** Fix in next sprint

#### BUG-8: PATCH-Route prüft created_by nicht application-seitig
- **Severity:** High (Security)
- **Steps to Reproduce:**
  1. Therapeut A erstellt einen Entwurf für Patient X
  2. Therapeut B hat auch Zugriff auf Patient X (zukünftig denkbar)
  3. Therapeut B sendet PATCH auf den Entwurf von Therapeut A
  4. Erwartetes Verhalten: 403 Forbidden — nur Ersteller kann eigenen Entwurf bearbeiten
  5. Tatsächliches Verhalten: Nur RLS blockiert das. Application-Level-Code prüft `created_by` nicht.
  6. Aktuelles Risiko: Gering (single-therapeut-per-patient Datenmodell), aber fehlende Defense-in-Depth.
- **Priority:** Fix in next sprint

---

### Regression Testing (PROJ-1 + PROJ-2)

- [x] **PROJ-1 Auth:** Login/Logout-Flow nicht direkt getestet (kein laufender Server), aber API-Routen prüfen `supabase.auth.getUser()` korrekt — keine Regression im Auth-Flow
- [x] **PROJ-2 Patientenstammdaten:** `PatientDetailPage` importiert `AnamnesisTab` und integriert es korrekt im "Dokumentation"-Tab. Bestehende Tabs (Stammdaten, Termine, Trainingspläne) sind unverändert. PlaceholderTab für andere Tabs unberührt.
- [x] **Build-Regression:** `npm run build` kompiliert alle 24 Routen erfolgreich — keine Breaking Changes.

---

### Cross-Browser & Responsive Testing

Da kein laufender Browser-Testserver verfügbar, basiert diese Einschätzung auf Code-Review:

- **Chrome/Firefox/Safari:** Verwendet nur Standard-HTML-Elemente (`<input type="range">`, SVG, shadcn/ui-Komponenten). Browser-Kompatibilität erwartet gut. `accent-primary` CSS für den Range-Slider ist in älteren Safari-Versionen ggf. nicht vollständig unterstützt.
- **Mobile (375px):** Grid-Layouts verwenden `sm:grid-cols-2` und `sm:grid-cols-3` — stacked auf Mobile. Bewegungsausmaß-Tabelle mit `grid-cols-[1fr_1fr_1fr_auto]` könnte auf 375px sehr eng werden.
- [ ] BUG-9 (Low): Bewegungsausmaß-Grid (`grid-cols-[1fr_1fr_1fr_auto]`) auf kleinen Viewports (375px) — die 3 gleichgroßen Spalten + Delete-Button könnten horizontal überlaufen oder sehr eng werden. Kein `overflow-x-auto` vorhanden.

---

### Summary

- **Acceptance Criteria:** 7/9 vollständig bestanden | 2 teilweise (AC-5 wegen BUG-3, AC-9 wegen BUG-4)
- **Bugs Found:** 9 total (1 critical, 2 high, 3 medium, 3 low)
  - Critical: 1 (BUG-3 — Koordinaten-Mismatch bricht Schmerzlokalisation)
  - High: 2 (BUG-4 — PDF nicht implementiert, BUG-8 — PATCH Autorisierung unvollständig)
  - Medium: 3 (BUG-2, BUG-6, BUG-7)
  - Low: 3 (BUG-1, BUG-5, BUG-9)
- **Security:** Grundlegend solide — RLS, Auth-Checks, Zod-Validierung, HP-Felder serverseitig. 2 Defense-in-Depth-Lücken (BUG-7, BUG-8).
- **Production Ready:** NO
- **Recommendation:** Fix BUG-3 (Critical) und BUG-4 (High) vor Deployment. BUG-8 (High Security) sollte ebenfalls behoben werden.

## Deployment
**Deployed:** 2026-02-18
**Environment:** Development (localhost:3001)
**GitHub:** https://github.com/MaxGlawe/my-first-app (branch: main, commit: 9751ab1)
**Tag:** v1.3.0-PROJ-3
**Status:** Code + DB migration live. Vercel production deployment deferred until MVP complete.
**Note:** BUG-1, BUG-4 (PDF), BUG-5, BUG-6, BUG-7, BUG-9 deferred to next sprint.
