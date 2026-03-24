# PROJ-18: Betriebliche Gesundheitsförderung (BGF)

**Status:** Planned
**Erstellt:** 2026-03-15
**Priorität:** P0 — Neues Geschäftsmodell (B2B-Säule)
**Abhängigkeiten:** PROJ-1 (Auth), PROJ-8 (Übungen), PROJ-9 (Trainingspläne), PROJ-10 (Hausaufgaben), PROJ-14 (Push), PROJ-15 (Präventionstrainer-Rolle), PROJ-17 (Ampelsystem)

---

## Vision

Praxis OS wird zur Plattform für Betriebliche Gesundheitsförderung (BGF). Unternehmen buchen Lizenzen, schalten Mitarbeitende frei, und jeder freigeschaltete MA erhält ein persönliches Gesundheitsprogramm: Ist-Analyse, KI-generierte Pausen-Fits am Arbeitsplatz, tägliches Check-in und bei Bedarf 1:1-Betreuung durch einen freigeschalteten BGF-Therapeuten.

Intern: BGF-Betreuung ist ein Karriere-Upgrade. Therapeuten müssen sich die Freischaltung für BGF-Arbeit verdienen — BGF ist 100% remote/Workcation-fähig und damit ein Lifestyle-Benefit.

---

## Positionierung

- **Betriebliche Gesundheitsförderung (BGF)** nach §20b SGB V
- Steuerfreier Arbeitgeber-Zuschuss bis 600€/MA/Jahr (§3 Nr. 34 EStG)
- ZPP-zertifizierte Maßnahmen (vorhanden)
- Heilpraktiker-Qualifikation für eigenständige Diagnostik (vorhanden)

---

## User Stories

### Firmen-Seite (HR / Geschäftsführung)

1. **Als HR-Admin** kann ich eine Firmenlizenz mit X Plätzen erwerben und Mitarbeitende einzeln oder per CSV freischalten.

2. **Als HR-Admin** sehe ich in einem Dashboard: Wie viele MA freigeschaltet, wie viele aktiv, anonymisierte Teilnahmequote und Gesundheitstrends — ohne individuelle Gesundheitsdaten zu sehen (DSGVO).

3. **Als Geschäftsführer** erhalte ich quartalsweise einen KI-generierten PDF-Gesundheitsbericht mit anonymisierten KPIs, Abteilungsvergleichen und ROI-Berechnung.

### Mitarbeiter-Seite

4. **Als Mitarbeiter** erhalte ich eine Benachrichtigung "Sie wurden für das Gesundheitsprogramm freigeschaltet" und durchlaufe eine geführte Ist-Analyse (5-8 Min.), die mein Gesundheitsprofil erstellt.

5. **Als Mitarbeiter** bekomme ich 2-3x täglich eine Push-Notification für mein personalisiertes Pausen-Fit (3-5 Min. Micro-Routine mit Übungen + Ergonomie-Tipp).

6. **Als Mitarbeiter** mache ich ein tägliches Check-in (Schmerz, Stress — bestehendes System) und mein Pausen-Fit passt sich automatisch an meine Werte an.

7. **Als Mitarbeiter** kann ich bei Beschwerden über den Chat meinen BGF-Therapeuten kontaktieren.

### Therapeuten-Seite (BGF)

8. **Als BGF-Therapeut** sehe ich ein Firmen-Dashboard mit Ampelübersicht aller betreuten MA: Rot (aktiv eingreifen), Gelb (beobachten), Grün (läuft automatisch).

9. **Als BGF-Therapeut** kann ich die Ist-Analyse eines MA einsehen, den Trainingsplan anpassen und Pausen-Fit-Präferenzen konfigurieren.

10. **Als BGF-Therapeut** werde ich über das Ampelsystem automatisch benachrichtigt wenn ein MA in den Rot-Status wechselt.

### Interne Seite (Praxis OS Mitarbeiter-Freischaltung)

11. **Als Admin/Praxisleitung** kann ich einen Therapeuten für BGF-Arbeit freischalten wenn er die Voraussetzungen erfüllt (Erfahrung, Leistung, Schulung).

12. **Als Therapeut** sehe ich meinen BGF-Freischaltungsstatus und die Kriterien die ich erfüllen muss.

---

## Akzeptanzkriterien

### Phase 1: Fundament

- [ ] Neue Tabelle `organizations` mit Firmenname, Logo, Branche, Kontaktdaten, Vertragsstatus, Lizenzzahl
- [ ] Neue Tabelle `organization_members` mit Zuordnung User → Firma, Freischaltungsstatus, Abteilung, Arbeitsplatztyp
- [ ] Neue Tabelle `organization_admins` mit HR-Rolle die nur anonymisierte Aggregate sieht
- [ ] RLS-Policies: HR-Admins sehen nur Aggregate ihrer eigenen Organisation, niemals individuelle Gesundheitsdaten
- [ ] Freischaltungs-Flow: HR gibt E-Mail ein → MA erhält Einladung → Registrierung/Login → Ist-Analyse
- [ ] CSV-Import: HR lädt MA-Liste hoch (Name, E-Mail, Abteilung)
- [ ] Basis HR-Dashboard unter `/os/bgf/[org-id]`: Aktive MA, Teilnahmequote, Freischaltungsübersicht

### Phase 2: Ist-Analyse & Pausen-Fit

- [ ] Neue Tabelle `ist_analyse` mit: Arbeitsplatztyp, Bildschirmarbeit-Stunden, Beschwerden (Array Körperregionen), Schmerz/Stress/Bewegung, Vorerkrankungen, Ziele, berechneter Risiko-Score
- [ ] 5-Schritte Ist-Analyse UI in der Mitarbeiter-App als geführter Onboarding-Flow
- [ ] Risiko-Score-Berechnung (0-100) aus Ist-Analyse-Daten
- [ ] Neue Tabelle `pausen_fit_sessions` mit: Geplanter Zeitpunkt, Übungen (JSONB), Ergonomie-Tipp, Dauer, Status, Feedback
- [ ] KI-Endpoint `POST /api/bgf/pausen-fit/generate` der aus Mitarbeiter-Profil + Check-in-Daten + Tageszeit eine personalisierte Micro-Routine generiert
- [ ] Push-Scheduling: 2-3 Notifications pro Arbeitstag zu konfigurierbaren Zeiten (Standard: 10:00, 13:00, 15:30)
- [ ] Pausen-Fit UI in der App: Geführte Session mit Timer, Übungsbeschreibung, Fortschrittsanzeige, Ergonomie-Tipp am Ende
- [ ] Completion-Tracking: MA markiert Session als abgeschlossen
- [ ] Feedback: Optional 1-5 Sterne nach jeder Session
- [ ] KI-Adaptivität: Wenn Check-in-Schmerz hoch → sanftere Übungen; wenn Feedback schlecht → mehr Variation

### Phase 3: Therapeuten-BGF-Dashboard & Ampel

- [ ] PROJ-17 Ampelsystem fertig implementiert (API + UI)
- [ ] Ampel erweitert um BGF-spezifische Regeln: Pausen-Fit Teilnahme <30% = Gelb, <10% = Rot
- [ ] BGF-Dashboard unter `/os/bgf`: Alle betreuten Firmen auf einen Blick mit Ampel-Summary
- [ ] Firmen-Detailansicht: Liste aller MA mit Ampelstatus, letzte Aktivität, Compliance
- [ ] Quick Actions aus Ampel: Chat öffnen, Plan anpassen, Push senden
- [ ] `bgf_freigeschaltet`-Flag am Therapeuten-Profil
- [ ] Admin-UI zum Freischalten von Therapeuten für BGF (Kriterien-Checkliste)

### Phase 4: Reporting & Abrechnung

- [ ] Anonymisierte Firmen-KPIs: Ø Schmerz, Ø Stress, Teilnahmequote, Compliance, Trend (besser/schlechter/gleich)
- [ ] Abteilungs-Vergleich (anonymisiert, min. 5 MA pro Abteilung für Anonymität)
- [ ] KI-generierter Quartals-PDF-Report für GF mit: Zusammenfassung, KPIs, Trends, Empfehlungen, ROI-Schätzung
- [ ] Firmen-Sammelrechnung: Eine Rechnung pro Firma pro Monat (Lizenzanzahl × Preis)
- [ ] ROI-Dashboard: AU-Kosten-Schätzung vorher/nachher basierend auf Schmerzreduktion

### Phase 5: HR-Schulungen & Polish

- [ ] HR-Schulungsmodule über bestehendes Kurs-System (PROJ-13): "Arbeitsplatz-Check", "Gesundes Führen", "Ergonomie-Basics"
- [ ] Gesundheits-Challenges: Firmenweite oder abteilungsweise Teilnahme-Challenges mit Leaderboard
- [ ] BGF-Landing-Page unter `/unternehmen` mit Pricing, ROI-Rechner, Anfrage-Formular
- [ ] Onboarding-E-Mail-Sequenz für freigeschaltete MA (Willkommen, Ist-Analyse Erinnerung, Erste-Woche-Tipps)

---

## Datenmodell

### Neue Tabellen

```sql
-- Firmen/Organisationen
CREATE TABLE organizations (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL,
  logo_url TEXT,
  branche TEXT,
  groesse TEXT CHECK (groesse IN ('1-49', '50-99', '100-249', '250-499', '500+')),
  kontakt_name TEXT NOT NULL,
  kontakt_email TEXT NOT NULL,
  kontakt_telefon TEXT,
  adresse_strasse TEXT,
  adresse_plz TEXT,
  adresse_ort TEXT,
  vertrag_tier TEXT CHECK (vertrag_tier IN ('basic', 'pro', 'enterprise')) DEFAULT 'pro',
  vertrag_lizenzen INTEGER NOT NULL DEFAULT 50,
  vertrag_start DATE,
  vertrag_ende DATE,
  vertrag_preis_pro_ma_monat DECIMAL(8,2) DEFAULT 39.00,
  status TEXT CHECK (status IN ('pilot', 'aktiv', 'pausiert', 'gekuendigt')) DEFAULT 'pilot',
  pausen_fit_zeiten JSONB DEFAULT '["10:00","13:00","15:30"]',
  abteilungen TEXT[] DEFAULT '{}',
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now()
);

-- Firmen-Admins (HR, GF) — sehen nur anonymisierte Daten
CREATE TABLE organization_admins (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  organization_id UUID REFERENCES organizations(id) ON DELETE CASCADE NOT NULL,
  user_id UUID REFERENCES profiles(id) ON DELETE CASCADE NOT NULL,
  rolle TEXT CHECK (rolle IN ('hr_admin', 'hr_viewer', 'geschaeftsfuehrung')) DEFAULT 'hr_admin',
  created_at TIMESTAMPTZ DEFAULT now(),
  UNIQUE (organization_id, user_id)
);

-- MA-Zuordnung zu Firma
CREATE TABLE organization_members (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  organization_id UUID REFERENCES organizations(id) ON DELETE CASCADE NOT NULL,
  user_id UUID REFERENCES profiles(id) ON DELETE CASCADE,
  email TEXT NOT NULL,
  vorname TEXT,
  nachname TEXT,
  abteilung TEXT,
  arbeitsplatz_typ TEXT CHECK (arbeitsplatz_typ IN ('buero', 'homeoffice', 'lager', 'produktion', 'handwerk', 'pflege', 'mischform')) DEFAULT 'buero',
  status TEXT CHECK (status IN ('eingeladen', 'aktiv', 'pausiert', 'deaktiviert')) DEFAULT 'eingeladen',
  freigeschaltet_am TIMESTAMPTZ,
  freigeschaltet_von UUID REFERENCES profiles(id),
  ist_analyse_abgeschlossen BOOLEAN DEFAULT false,
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now(),
  UNIQUE (organization_id, email)
);

-- Ist-Analyse Ergebnisse
CREATE TABLE ist_analyse (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES profiles(id) ON DELETE CASCADE NOT NULL,
  organization_id UUID REFERENCES organizations(id) ON DELETE CASCADE NOT NULL,
  -- Arbeitsplatz
  arbeitsplatz_typ TEXT NOT NULL,
  bildschirmarbeit_stunden DECIMAL(3,1),
  sitz_stunden_pro_tag DECIMAL(3,1),
  heben_tragen BOOLEAN DEFAULT false,
  -- Beschwerden
  beschwerden_regionen TEXT[] DEFAULT '{}',
  schmerz_aktuell INTEGER CHECK (schmerz_aktuell BETWEEN 0 AND 10),
  stress_level INTEGER CHECK (stress_level BETWEEN 0 AND 10),
  schlaf_qualitaet INTEGER CHECK (schlaf_qualitaet BETWEEN 0 AND 10),
  -- Bewegung & Vorerkrankungen
  bewegung_minuten_pro_woche INTEGER DEFAULT 0,
  vorerkrankungen TEXT[] DEFAULT '{}',
  -- Ziele
  ziele TEXT[] DEFAULT '{}',
  -- Berechnete Werte
  risiko_score INTEGER CHECK (risiko_score BETWEEN 0 AND 100),
  ki_empfehlung TEXT,
  pausen_fit_fokus TEXT[] DEFAULT '{}',
  -- Meta
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now(),
  UNIQUE (user_id, organization_id)
);

-- Pausen-Fit Sessions
CREATE TABLE pausen_fit_sessions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES profiles(id) ON DELETE CASCADE NOT NULL,
  organization_id UUID REFERENCES organizations(id) ON DELETE CASCADE NOT NULL,
  -- Timing
  geplant_um TIMESTAMPTZ NOT NULL,
  gestartet_um TIMESTAMPTZ,
  abgeschlossen_um TIMESTAMPTZ,
  -- Inhalt
  typ TEXT CHECK (typ IN ('morgen_aktivierung', 'mittag_mobilisation', 'nachmittag_reset')) NOT NULL,
  uebungen JSONB NOT NULL DEFAULT '[]',
  ergonomie_tipp TEXT,
  dauer_sekunden INTEGER,
  -- Feedback
  feedback_sterne INTEGER CHECK (feedback_sterne BETWEEN 1 AND 5),
  -- Status
  status TEXT CHECK (status IN ('geplant', 'gestartet', 'abgeschlossen', 'verpasst')) DEFAULT 'geplant',
  -- Kontext
  check_in_schmerz_bei_erstellung INTEGER,
  created_at TIMESTAMPTZ DEFAULT now()
);

-- Ergonomie-Tipps Bibliothek
CREATE TABLE ergonomie_tipps (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  kategorie TEXT CHECK (kategorie IN ('bildschirm', 'sitzen', 'stehen', 'heben', 'pausen', 'allgemein')) NOT NULL,
  arbeitsplatz_typen TEXT[] DEFAULT '{}',
  tipp TEXT NOT NULL,
  quelle TEXT,
  created_at TIMESTAMPTZ DEFAULT now()
);
```

### Erweiterung bestehender Tabellen

```sql
-- profiles erweitern
ALTER TABLE profiles ADD COLUMN bgf_freigeschaltet BOOLEAN DEFAULT false;
ALTER TABLE profiles ADD COLUMN bgf_freigeschaltet_am TIMESTAMPTZ;
ALTER TABLE profiles ADD COLUMN bgf_freigeschaltet_von UUID REFERENCES profiles(id);
ALTER TABLE profiles ADD COLUMN bgf_level TEXT CHECK (bgf_level IN ('gesperrt', 'berechtigt', 'lead')) DEFAULT 'gesperrt';
```

### RLS-Policies (Kern-Sicherheit)

```sql
-- HR-Admins sehen NIEMALS individuelle Gesundheitsdaten
-- Sie sehen nur: organization_members (Status, Abteilung) + aggregierte Kennzahlen

-- HR-Admin sieht Mitglieder seiner Firma
CREATE POLICY org_admins_see_members ON organization_members
  FOR SELECT USING (
    organization_id IN (
      SELECT organization_id FROM organization_admins WHERE user_id = auth.uid()
    )
  );

-- HR-Admin sieht KEINE ist_analyse, pain_diary, chat_messages etc.
-- Aggregate werden über server-seitige API-Endpoints berechnet die RLS umgehen (service_role)

-- BGF-Therapeut sieht MA seiner betreuten Firmen
CREATE POLICY bgf_therapeut_sees_members ON organization_members
  FOR SELECT USING (
    organization_id IN (
      SELECT id FROM organizations WHERE ... -- Therapeut ist der Firma zugewiesen
    )
    AND (SELECT bgf_freigeschaltet FROM profiles WHERE id = auth.uid()) = true
  );
```

---

## API-Endpoints

### Firmen-Management
```
POST   /api/bgf/organizations              → Firma anlegen
GET    /api/bgf/organizations              → Eigene Firmen (Admin/Therapeut)
GET    /api/bgf/organizations/[id]         → Firmen-Detail
PATCH  /api/bgf/organizations/[id]         → Firma bearbeiten
```

### Mitarbeiter-Freischaltung
```
POST   /api/bgf/organizations/[id]/members          → MA einzeln freischalten
POST   /api/bgf/organizations/[id]/members/import    → CSV-Import
PATCH  /api/bgf/organizations/[id]/members/[mid]     → Status ändern (aktivieren/pausieren)
DELETE /api/bgf/organizations/[id]/members/[mid]      → MA entfernen
```

### Ist-Analyse
```
POST   /api/bgf/ist-analyse                → Analyse speichern
GET    /api/bgf/ist-analyse/[user-id]      → Analyse abrufen (Therapeut)
GET    /api/me/bgf/ist-analyse             → Eigene Analyse (MA)
```

### Pausen-Fit
```
POST   /api/bgf/pausen-fit/generate        → KI generiert nächstes Pausen-Fit
GET    /api/me/bgf/pausen-fit/today        → Heutige Sessions (MA)
PATCH  /api/me/bgf/pausen-fit/[id]         → Session starten/abschließen/Feedback
POST   /api/bgf/pausen-fit/schedule        → Tages-Scheduling (Cron-Job)
```

### Dashboard & Reporting
```
GET    /api/bgf/organizations/[id]/dashboard     → Anonymisierte KPIs (HR)
GET    /api/bgf/organizations/[id]/ampel         → Ampel-Übersicht (Therapeut)
GET    /api/bgf/organizations/[id]/report        → Quartals-Report generieren (KI)
GET    /api/bgf/therapeut/dashboard              → Alle Firmen des Therapeuten
```

### Interne BGF-Freischaltung
```
POST   /api/admin/bgf/freischaltung/[user-id]   → Therapeut freischalten
GET    /api/admin/bgf/freischaltung/kriterien/[user-id] → Kriterien-Check
```

---

## Komponentenstruktur

```
src/app/
├── os/bgf/                              → BGF-Bereich für Therapeuten
│   ├── page.tsx                         → Firmen-Übersicht + Ampel
│   ├── [orgId]/                         → Firmen-Detail
│   │   ├── page.tsx                     → MA-Liste + Ampel + KPIs
│   │   ├── members/page.tsx             → MA-Verwaltung + Freischaltung
│   │   └── report/page.tsx              → Report generieren
│   └── settings/page.tsx               → BGF-Einstellungen
│
├── os/admin/bgf/                        → Admin BGF-Verwaltung
│   ├── organizations/page.tsx           → Alle Firmen
│   ├── freischaltung/page.tsx           → Therapeuten-Freischaltung
│   └── abrechnung/page.tsx             → Firmen-Rechnungen
│
├── app/bgf/                             → MA-App BGF-Bereich
│   ├── onboarding/page.tsx              → Ist-Analyse (5 Schritte)
│   ├── pausen-fit/page.tsx              → Aktuelle/Heutige Pausen-Fits
│   ├── pausen-fit/[id]/page.tsx         → Geführte Session
│   └── profil/page.tsx                  → Gesundheitsprofil + Risiko-Score
│
├── hr/                                  → HR-Portal (neue Route-Gruppe)
│   ├── layout.tsx                       → HR-spezifisches Layout
│   ├── dashboard/page.tsx               → Anonymisierte KPIs
│   ├── members/page.tsx                 → MA freischalten/verwalten
│   ├── reports/page.tsx                 → Quartals-Reports
│   └── settings/page.tsx               → Pausen-Fit-Zeiten, Abteilungen

src/components/bgf/
├── IstAnalyseForm.tsx                   → 5-Schritte Fragebogen
├── PausenFitSession.tsx                 → Geführte Übungs-Session
├── PausenFitCard.tsx                    → Nächstes Pausen-Fit Karte
├── RisikoScoreDisplay.tsx               → Risiko-Score Anzeige
├── AmpelFirmenDashboard.tsx             → Firmen-Ampel (Therapeut)
├── HRDashboard.tsx                      → Anonymisierte KPIs (HR)
├── MitarbeiterFreischaltung.tsx         → CSV-Import + Einzel-Invite
├── BGFTherapeutFreischaltung.tsx        → Interne Freischaltungs-UI
└── QuartalsReportPDF.tsx                → KI-Report Anzeige/Download
```

---

## KI-Prompts

### Pausen-Fit Generator

```
System: Du bist ein Präventionstrainer. Erstelle eine Pausen-Fit Micro-Routine
für den Arbeitsplatz. Die Routine dauert 3-5 Minuten und besteht aus 3-4 Übungen
plus einem Ergonomie-Tipp.

Input:
- Arbeitsplatztyp: {buero|lager|produktion|homeoffice}
- Hauptbeschwerden: {Array von Körperregionen}
- Tageszeit: {morgen|mittag|nachmittag}
- Aktueller Schmerzlevel: {0-10}
- Heutige bisherige Routinen: {Array}
- Fitness-Level: {gering|mittel|hoch}

Output (JSON):
{
  "uebungen": [
    {
      "name": "Schulterkreisen",
      "beschreibung": "Stehen Sie auf. Kreisen Sie beide Schultern...",
      "dauer_sekunden": 30,
      "wiederholungen": null,
      "position": "stehend",
      "schwierigkeit": "leicht"
    }
  ],
  "ergonomie_tipp": "Stellen Sie Ihren Bildschirm so ein, dass...",
  "gesamt_dauer_sekunden": 210,
  "fokus": "Schulter & Nacken"
}
```

### Quartals-Report Generator

```
System: Erstelle einen professionellen Gesundheitsbericht für die
Geschäftsführung. Anonymisiert, datenbasiert, mit konkreten Empfehlungen.
Sprache: Deutsch, sachlich-professionell.

Input: Aggregierte Firmendaten der letzten 3 Monate
Output: Strukturierter Bericht mit Zusammenfassung, KPIs, Trends,
Abteilungsvergleich, Empfehlungen, ROI-Schätzung
```

---

## Interne BGF-Freischaltung — Kriterien

### Stufe 1: BGF-Berechtigt

| Kriterium | Messung |
|---|---|
| Mindestens 6 Monate bei Praxis OS | `profiles.created_at` |
| Mindestens 15 Patienten aktiv betreut | Count `patient_assignments` |
| Keine offenen Beschwerden | Manuell durch Admin |
| Schulung "BGF-Methodik" abgeschlossen | Kurs-Completion in PROJ-13 |
| Genehmigung durch Praxisleitung | Admin setzt Flag |

### Stufe 2: BGF-Lead

| Kriterium | Messung |
|---|---|
| Mindestens 3 Monate BGF-Erfahrung | `bgf_freigeschaltet_am` |
| Mindestens 1 Firma eigenständig betreut | `organizations` Zuordnung |
| Firmen-Teilnahmequote >70% | Dashboard-KPI |
| Kann neue BGF-Therapeuten einarbeiten | Manuell |

---

## Pricing

| Tier | Preis/MA/Monat | Enthält |
|---|---|---|
| **Basic** | 19€ | Ist-Analyse, KI-Pausen-Fit 2x/Tag, Check-ins, Ergonomie-Tipps, Quartals-Report |
| **Pro** | 39€ | + Video-Erstanalyse, individueller Trainingsplan, Ampel mit 1:1-Intervention, Chat, monatlicher Report |
| **Enterprise** | 59€ | + Dedizierter Therapeut, HR-Schulungen, Ergonomie-Audit, Gesundheits-Challenges, Abteilungsvergleiche |

Einmalig: Ist-Analyse & Setup ab 1.500€
Optional: Vor-Ort Ergonomie-Audit ab 2.500€

---

## Build-Reihenfolge

```
Phase 1 — Fundament (3-4 Wochen)
  Neue DB-Tabellen + RLS
  organizations + members CRUD
  HR-Admin-Rolle + Basis HR-Dashboard
  Freischaltungs-Flow (Invite per E-Mail)
  CSV-Import für MA-Listen

Phase 2 — Ist-Analyse & Pausen-Fit (3-4 Wochen)
  Ist-Analyse 5-Schritte UI
  Risiko-Score-Berechnung
  KI-Pausen-Fit-Generator (Claude API)
  Push-Scheduling
  Pausen-Fit UI (geführte Session in App)
  Completion-Tracking + Feedback

Phase 3 — Intelligenz & Ampel (2-3 Wochen)
  PROJ-17 Ampelsystem fertig implementieren
  Ampel erweitern um BGF-Regeln
  BGF-Therapeuten-Dashboard
  KI-Adaptivität (Check-in → Pausen-Fit anpassen)
  Interne Therapeuten-Freischaltung UI

Phase 4 — Reporting & Abrechnung (2-3 Wochen)
  Anonymisierte Firmen-KPIs
  KI-Quartals-Report-Generator (PDF)
  Abteilungs-Vergleiche
  Firmen-Sammelrechnung
  ROI-Dashboard

Phase 5 — Launch & Skalierung (2 Wochen)
  BGF-Landing-Page (/unternehmen)
  HR-Schulungsmodule (Kurs-System)
  Gesundheits-Challenges
  Eigenes Team als erste Organisation
  Onboarding-E-Mail-Sequenz

Gesamt: ~12-16 Wochen
```

---

## Erfolgskriterien

- [ ] Erste Organisation (eigenes Team) erfolgreich ongeboardet
- [ ] Pausen-Fit Teilnahmequote >60% nach 4 Wochen
- [ ] KI-generierte Pausen-Fits werden von >80% der MA als nützlich bewertet (3+ Sterne)
- [ ] Quartals-Report wird von Test-HR als "aussagekräftig" bewertet
- [ ] Ein BGF-Therapeut kann 100+ MA über Dashboard managen ohne Überlastung
- [ ] Erste externe Pilotfirma gewonnen innerhalb 8 Wochen nach Launch

---

## Abgrenzung (Nicht in V1)

- Keine Integration mit externen HR-Systemen (SAP, Personio etc.)
- Keine Video-Übungsanleitungen in Pausen-Fit (Text + Bilder reichen für V1)
- Keine native App (PWA reicht)
- Keine automatische AU-Tage-Erfassung (manuell im Report)
- Keine Multi-Therapeut-pro-Firma Zuordnung (1 Therapeut = 1 Firma in V1)
- Kein Marketplace für externe Therapeuten

---

_Erstellt: 2026-03-15 — PROJ-18 Betriebliche Gesundheitsförderung_
