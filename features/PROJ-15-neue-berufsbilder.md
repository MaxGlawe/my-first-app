# PROJ-15: Neue Berufsbilder — Präventionstrainer, Personal Trainer, Praxismanagement

**Status:** 🔵 Planned
**Created:** 2026-02-19
**Last Updated:** 2026-02-19

---

## Übersicht

Drei neue Berufsbilder werden in das System integriert:

| Rolle | Zweck | Kernfunktion |
|-------|-------|--------------|
| **Präventionstrainer** | Präventionskurse, betriebliche Gesundheit | Funktionsuntersuchung + Training |
| **Personal Trainer** | 1:1 Training, Leistungssport | Funktionsuntersuchung + Training |
| **Praxismanagement** | Tresenkraft, Verwaltung | Patientenauskunft, Stammdaten pflegen |

---

## Berechtigungs-Matrix

| Feature | Physio/HP | Prävention­strainer | Personal Trainer | Praxis­management |
|---------|-----------|---------------------|-----------------|------------------|
| Patienten sehen | Eigene | Eigene | Eigene | **Alle** (lesen) |
| Patient anlegen | ✅ | ✅ | ✅ | ✅ |
| Stammdaten bearbeiten | ✅ | ✅ | ✅ | ✅ |
| **Funktionsuntersuchung** | ❌ | ✅ | ✅ | ❌ |
| Klinische Anamnese | ✅ | ❌ | ❌ | lesen |
| Diagnosen (ICD-10) | HP only | ❌ | ❌ | lesen |
| Behandlungsdokumentation | ✅ | ❌ | ❌ | lesen |
| Arztbericht (KI) | HP only | ❌ | ❌ | lesen |
| Übungsdatenbank | ✅ | ✅ | ✅ | ❌ |
| Trainingspläne | ✅ | ✅ | ✅ | ❌ |
| Hausaufgaben | ✅ | ✅ | ✅ | ❌ |
| Kurse | ✅ | ✅ | ✅ | ❌ |
| Nachrichten | ✅ | ✅ | ✅ | ✅ (lesen) |
| Terminübersicht | ✅ | ✅ | ✅ | ✅ (alle) |
| Admin-Bereich | ❌ | ❌ | ❌ | ❌ |

---

## Tech Design (Solution Architect)

### A) Neue Rollen im System

Das System kennt aktuell: `admin`, `heilpraktiker`, `physiotherapeut`, `patient`

Neu hinzukommen:
- `praeventionstrainer`
- `personal_trainer`
- `praxismanagement`

Diese werden in der `user_profiles.role`-Spalte gespeichert (gleicher Mechanismus wie bestehende Rollen). Die PostgreSQL-Funktion `get_my_role()` gibt den Rollenwert zurück und wird von allen Sicherheitsregeln genutzt — sie muss aktualisiert werden, um die neuen Werte zu kennen.

---

### B) Datenbankänderungen

#### 1. user_profiles — Rollen-Erweiterung
Die CHECK-Bedingung auf `user_profiles.role` wird um die drei neuen Werte erweitert.

#### 2. Neue Tabelle: `janda_test_catalog`
Ein strukturiertes Nachschlagewerk aller Janda-Tests, das einmalig befüllt wird:

```
Jeder Katalogeintrag enthält:
- Eindeutige ID
- Region (z.B. "Hüfte & Becken", "LWS", "BWS & Schulter", "Nacken", "Knie & Unterschenkel")
- Muskelname (z.B. "M. Iliopsoas", "M. gluteus medius")
- Kategorie: Verkürzungstendenz ODER Abschwächungstendenz
- Testname (z.B. "Thomas-Test", "Ober-Test")
- Testbeschreibung (Schritt-für-Schritt Anleitung)
- Normalbefund (was bei gesundem Befund zu sehen ist)
- Pathologischer Befund (was auf eine Abweichung hinweist)
- Anzeigereihenfolge
```

**Enthaltene Tests (Auswahl):**

| Region | Muskel | Test | Kategorie |
|--------|--------|------|-----------|
| Hüfte & Becken | M. Iliopsoas | Thomas-Test | Verkürzung |
| Hüfte & Becken | M. Rectus femoris | Modifizierter Thomas-Test | Verkürzung |
| Hüfte & Becken | M. piriformis | FABER-Test | Verkürzung |
| Hüfte & Becken | M. gluteus maximus | Hüftextensions-Test | Abschwächung |
| Hüfte & Becken | M. gluteus medius | Trendelenburg-Test | Abschwächung |
| LWS | Ischiocrurale Muskulatur | Straight Leg Raise | Verkürzung |
| LWS | M. quadratus lumborum | Seitneigung | Verkürzung |
| LWS | Abdominale Muskulatur | Curl-up-Test | Abschwächung |
| LWS | Rückenstrecker | Prone Hip Extension | Abschwächung |
| BWS & Schulter | M. pectoralis major | Schulterhorizontalabduktion | Verkürzung |
| BWS & Schulter | M. trapezius (oberer Anteil) | Schulter-Nacken-Test | Verkürzung |
| BWS & Schulter | M. serratus anterior | Wall Angel / Push-up | Abschwächung |
| BWS & Schulter | M. trapezius (mittl./unt.) | Arm-Elevation | Abschwächung |
| Nacken | M. sternocleidomastoideus | HWS-Rotation | Verkürzung |
| Nacken | Tiefe Nackenflexoren | Chin-Tuck-Test | Abschwächung |
| Knie & Unterschenkel | M. tensor fasciae latae | Ober-Test | Verkürzung |
| Knie & Unterschenkel | M. vastus medialis | VMO-Test | Abschwächung |
| Übergreifend | Mehrgelenkig | Deep Squat Assessment | Muster |
| Übergreifend | Einbeinstand | Star Excursion Balance | Stabilität |

#### 3. Neue Tabelle: `funktionsuntersuchungen`
Für Präventionstrainer und Personal Trainer — getrennt von der klinischen Anamnese:

```
Jede Untersuchung enthält:
- Eindeutige ID
- Patienten-ID (Verweis auf Patient)
- Erstellt von (Therapeuten-ID)
- Versionsnummer (Auto-Increment pro Patient, gleiche Logik wie Anamnese)
- Status: "entwurf" oder "abgeschlossen"
- Daten (flexibles JSONB-Feld):
  - Hauptbeschwerde / Anliegen (Freitext)
  - Beschwerdedauer
  - Sportliche Aktivität (aktuelles Niveau)
  - Trainingsziele
  - Haltungs- und Ganganalyse (Freitext-Beobachtungen)
  - Janda-Tests (Array):
    - Verweis auf Katalog-Eintrag
    - Befund: Normal / Leicht auffällig / Deutlich auffällig
    - Optionale Notiz
  - Trainingsempfehlung (Freitext)
- Erstellt am / Aktualisiert am
```

#### 4. RLS-Anpassungen (Datenbankregeln)

**Patienten-Tabelle:**
- Praxismanagement darf ALLE Patienten lesen (nicht nur eigene)
- Präventionstrainer / Personal Trainer: nur eigene Patienten (wie Physio)
- Schreiben (UPDATE) für Praxismanagement: Erlaubt, aber nur Stammdaten — wird auf API-Ebene eingeschränkt

**Klinische Tabellen** (anamnesis_records, treatment_sessions, diagnoses):
- Praxismanagement: Nur lesen (keine SELECT-Blocks → voller Lesezugriff)
- Präventionstrainer / Personal Trainer: Kein Zugriff (0 Zeilen zurück)

**Funktionsuntersuchungen:**
- Nur Präventionstrainer und Personal Trainer dürfen schreiben
- Praxismanagement: Lesen erlaubt
- Physio/HP: Kein Zugriff (andere Dokumentationsform)

---

### C) Sicherheitsarchitektur (3 Schichten)

Das bestehende **Defense-in-Depth**-Prinzip bleibt erhalten:

```
Anfrage eingehend
      │
      ▼
 1. MIDDLEWARE (Route-Schutz)
    → Praxismanagement: /os/patients/[id]/befund/* → Lesezugriff-Seite
    → Praeventionstrainer/PT: /os/patients/[id]/befund/* → Redirect zu 403
    → Praeventionstrainer/PT: /os/patients/[id]/behandlung/* → Redirect zu 403
    → Praeventionstrainer/PT: /os/patients/[id]/arztbericht/* → Redirect zu 403
      │
      ▼
 2. API-ROUTE (Berechtigungsprüfung)
    → Stammdaten-Update für Praxismanagement: Nur vorname, nachname,
      geburtsdatum, telefon, email, strasse, plz, ort,
      krankenkasse, versichertennummer erlaubt
    → Klinische Dokumentation: 403 für nicht-klinische Rollen
      │
      ▼
 3. DATENBANK RLS (letzte Verteidigung)
    → Selbst bei direktem API-Aufruf: RLS verhindert unerlaubte Daten
```

---

### D) Frontend-Architektur

#### 1. Rollenbasierte Sidebar

Die `OsSidebar.tsx` wird um Rollen-Awareness erweitert. Jede Berufsgruppe sieht nur ihre relevanten Menüpunkte:

**Präventionstrainer / Personal Trainer Sidebar:**
```
Praxis
  ├── Dashboard
  ├── Patienten
  └── Nachrichten

Therapie-Tools
  ├── Funktionsuntersuchung  ← NEU
  ├── Übungsdatenbank
  ├── Trainingspläne
  ├── Hausaufgaben
  └── Kurse

(KEIN: Klinische Anamnese, Befunde, Behandlung, Arztbericht)
```

**Praxismanagement Sidebar:**
```
Praxis
  ├── Dashboard
  ├── Patienten (lesen + Stammdaten)
  └── Termine (alle Therapeuten)

(KEIN: Therapie-Tools, Übungsdatenbank, etc.)
```

#### 2. Neue Seiten (Präventionstrainer/PT)

```
/os/patients/[id]/funktionsuntersuchung/
├── page.tsx                    → Liste aller Untersuchungen
├── new/page.tsx                → Neue Untersuchung erstellen
└── [id]/page.tsx               → Untersuchung ansehen/bearbeiten
```

#### 3. Funktionsuntersuchungs-Formular (Hauptkomponente)

```
FunktionsuntersuchungForm
├── AllgemeinSection
│   ├── Hauptbeschwerde/Anliegen (Textarea)
│   ├── Beschwerdedauer (Dropdown + Freitext)
│   ├── Sportliche Aktivität (Dropdown: Einsteiger/Fortgeschritten/Leistung)
│   └── Trainingsziele (Textarea)
│
├── BewegungsanalyseSection
│   ├── Haltungsanalyse (Freitext-Notizen)
│   └── Gangbildanalyse (Freitext-Notizen)
│
├── JandaTestsSection  ← KERNFEATURE
│   ├── RegionTabs (Hüfte & Becken | LWS | BWS & Schulter | Nacken | Knie | Übergreifend)
│   ├── TestAuswahl
│   │   └── TestKatalogListe (alle Tests der gewählten Region)
│   │       └── TestEintrag (Name + Kategorie-Badge + "Hinzufügen"-Button)
│   └── AusgewählteTests (die dokumentierten Tests)
│       └── JandaTestKarte (pro ausgewähltem Test)
│           ├── TestName + Kategorie-Badge
│           ├── TestAnleitung (Akkordeon: "Wie wird der Test durchgeführt?")
│           │   ├── Schritt-für-Schritt Beschreibung
│           │   ├── Normalbefund (grün hinterlegt)
│           │   └── Pathologischer Befund (orange hinterlegt)
│           ├── BefundAuswahl (3 Buttons: Normal | Leicht auffällig | Deutlich auffällig)
│           └── Notizfeld (optional, Freitext)
│
├── EmpfehlungSection
│   └── Trainingsempfehlung (Textarea, z.B. "Fokus auf Hüftflexoren dehnen + Gluteus kräftigen")
│
└── AktionsLeiste
    ├── "Als Entwurf speichern"
    └── "Untersuchung abschließen" (schreibgeschützt danach)
```

#### 4. Praxismanagement — Patientenansicht

Spezielle Lesemodus-Ansicht für Praxismanagement:
- Alle Tabs sichtbar (Termine, Behandlung, Anamnese, etc.)
- Überall "Schreibgeschützt"-Banner
- Stammdaten-Tab: Bearbeitbar (Name, Kontakt, Krankenversicherung)
- Kein "Neue Behandlung / Neue Anamnese"-Button sichtbar

---

### E) API-Änderungen

**Bestehende Routen — Anpassungen:**

| Route | Änderung |
|-------|---------|
| `GET /api/patients` | Praxismanagement: alle Patienten (nicht nur eigene) |
| `PATCH /api/patients/[id]` | Praxismanagement: nur Stammdaten-Felder erlaubt |
| `GET /api/patients/[id]/treatments` | Praxismanagement: Leserecht ergänzen |
| `GET /api/patients/[id]/anamnesis` | Praxismanagement: Leserecht ergänzen |
| `GET /api/patients/[id]/diagnoses` | Praxismanagement: Leserecht ergänzen |

**Neue Routen:**

| Route | Methode | Beschreibung |
|-------|---------|--------------|
| `/api/patients/[id]/funktionsuntersuchung` | GET / POST | Liste + Neue Untersuchung |
| `/api/patients/[id]/funktionsuntersuchung/[id]` | GET / PUT | Detail + Update |
| `/api/janda-catalog` | GET | Alle Katalogeinträge (nach Region gefiltert) |

---

### F) Datenbank-Migration

**Eine neue Migration** (`20260219000018_neue_berufsbilder.sql`) deckt ab:

1. `user_profiles.role` CHECK-Constraint um neue Rollen erweitern
2. `get_my_role()` Funktion aktualisieren (neue Werte im CASE-Statement)
3. Tabelle `janda_test_catalog` anlegen + befüllen (ca. 25-30 Einträge)
4. Tabelle `funktionsuntersuchungen` anlegen mit RLS
5. RLS-Policies auf bestehenden Tabellen anpassen:
   - `patients`: Praxismanagement kann alle lesen
   - `treatment_sessions`, `anamnesis_records`, `diagnoses`: Praxismanagement Leserecht
   - Funktionsuntersuchungen: Nur Präventionstrainer/PT schreiben
6. `user_profiles` Policies: Praxismanagement kann eigenes Profil lesen

---

### G) Implementierungs-Reihenfolge

| Phase | Was | Priorität |
|-------|-----|-----------|
| 1 | DB-Migration (Rollen + Janda-Katalog + neue Tabellen) | Basis |
| 2 | Bestehende RLS-Policies für neue Rollen anpassen | Basis |
| 3 | Middleware um neue Rollen erweitern | Sicherheit |
| 4 | API-Anpassungen (bestehende Routen + neue Routen) | Backend |
| 5 | Rollenbasierte Sidebar | Frontend |
| 6 | Funktionsuntersuchungs-Formular | Frontend (Hauptarbeit) |
| 7 | Janda-Test Selektion + Karten mit Beschreibungen | Frontend |
| 8 | Praxismanagement-Ansicht (Lesemodus + Stammdaten-Edit) | Frontend |

---

## Offene Fragen

1. **Praxismanagement & Nachrichten**: Soll die Tresenkraft Chat-Nachrichten lesen können (für Auskunft), oder ist das zu sensibel?
2. **Eigene Patienten bei Praeventionstrainer**: Werden Patienten direkt einem Präventionstrainer zugeordnet (wie `therapeut_id`)? Oder arbeiten sie mit allen Praxis-Patienten?
3. **Funktionsuntersuchung im Patienten-Tab**: Soll die Funktionsuntersuchung als eigener Tab in der Patientendetailseite erscheinen, oder als separater Bereich?

---

## Abhängigkeiten

- PROJ-1 (Auth/Rollen) — wird erweitert
- PROJ-2 (Patientenverwaltung) — RLS wird erweitert
- PROJ-3 (Anamnese) — Vorbild für Funktionsuntersuchung-Schema
- PROJ-9 (Trainingsplan) — Wird von Präventionstrainer/PT genutzt
- PROJ-13 (Kurse) — Wird von Präventionstrainer/PT genutzt
