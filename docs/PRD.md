# Product Requirements Document — Praxis OS

## Vision

Praxis OS ist ein ganzheitliches Praxismanagementsystem für Physiotherapie-Praxen. Es verbindet eine leistungsstarke Therapiedokumentations-Plattform für Therapeuten (Praxis OS) mit einer modernen Patienten-App für Trainingspläne, Hausaufgaben, Kurse und direkten Chat mit dem Therapeuten. KI-Unterstützung automatisiert die Erstellung von Arztberichten. Das System ist DSGVO-konform auf EU-Servern gehostet.

## Target Users

### 1. Physiotherapeut
- Behandelt Patienten unter ärztlicher Verordnung
- Dokumentiert Therapieverlauf, Behandlungsmaßnahmen, Fortschritte
- Erstellt und verwaltet Trainingspläne für Patienten
- **Eingeschränkte Rechte:** Keine eigenständige Diagnosestellung

### 2. Heilpraktiker für Physiotherapie
- Alle Rechte des Physiotherapeuten PLUS:
- Eigenständige Diagnosestellung (ICD-10)
- Vollständige Befunderstellung und Anamnese
- Erstellt Arztberichte (KI-gestützt)
- Behandelt Patienten ohne ärztliche Verordnung

### 3. Admin / Praxisinhaber
- Vollzugriff auf alle Daten und Funktionen
- Nutzerverwaltung (Therapeuten anlegen, Rollen vergeben)
- Praxisstatistiken, Auslastung, Berichte
- Systemkonfiguration

### 4. Patient
- Greift über die Patienten-App (PWA) zu
- Sieht eigene Trainingspläne und Hausaufgaben
- Nimmt an Kursen teil
- Chattet mit seinem Therapeuten
- Sieht eigene Termine (via Buchungstool-Integration)

## Core Features (Roadmap)

| Priority | Feature | ID | Status |
|----------|---------|-----|--------|
| P0 (MVP) | Authentifizierung & Rollenrechte | PROJ-1 | Planned |
| P0 (MVP) | Patientenstammdaten | PROJ-2 | Planned |
| P0 (MVP) | Anamnese & Untersuchungsdokumentation | PROJ-3 | Planned |
| P0 (MVP) | Befund & Diagnose (Heilpraktiker) | PROJ-4 | Planned |
| P0 (MVP) | Behandlungsdokumentation | PROJ-5 | Planned |
| P0 (MVP) | KI-Arztbericht-Generator | PROJ-6 | Planned |
| P0 (MVP) | Buchungstool-Integration | PROJ-7 | Planned |
| P0 (MVP) | Übungsdatenbank-Verwaltung | PROJ-8 | Planned |
| P0 (MVP) | Trainingsplan-Builder (Drag & Drop) | PROJ-9 | Planned |
| P1 | Hausaufgaben-Zuweisung | PROJ-10 | Planned |
| P1 | Patienten-App: Dashboard & Trainingspläne | PROJ-11 | Planned |
| P1 | Patienten-App: Chat (Therapeut ↔ Patient) | PROJ-12 | Planned |
| P2 | Kurs-System (Skalierbares Gruppen-Angebot) | PROJ-13 | Planned |
| P2 | PWA-Setup & Push-Notifications | PROJ-14 | Planned |

## Success Metrics

- **Dokumentationszeit:** Behandlungsdoku in < 3 Min pro Termin
- **Arztbrief-Erstellung:** KI-Entwurf in < 30 Sekunden
- **Patienten-Engagement:** > 60% der Patienten öffnen Trainingsplan innerhalb 24h
- **Therapeuten-Adoption:** > 80% der Therapeuten nutzen System täglich nach 4 Wochen
- **DSGVO-Konformität:** 100% der Patientendaten EU-gehostet, verschlüsselt

## Constraints

- **Datenschutz:** DSGVO-Konformität ist nicht verhandelbar — alle Daten auf Supabase EU-Servern
- **Rollenrechte:** Heilpraktiker-Funktionen (Diagnose, Befund) müssen server-seitig gesichert sein — nicht nur UI-Ebene
- **Tech-Stack:** Next.js 16, TypeScript, Tailwind CSS, shadcn/ui, Supabase (Auth + DB + Realtime + Storage)
- **Integration:** Bestehendes Buchungstool muss angebunden werden (Patienten- & Terminimport)
- **KI:** Claude API (Anthropic) für Arztbericht-Generierung
- **Patienten-App:** Als PWA starten, später optional nativer App-Wrapper (Capacitor)

## Non-Goals (Version 1)

- Keine Abrechnung / KV-Schnittstellen (Phase 2)
- Kein nativer App-Store-Eintrag (Phase 2)
- Kein Video-Conferencing / Telemedizin
- Keine automatische Termin-Buchung im OS (kommt vom Buchungstool)
- Keine Multi-Praxis-Unterstützung (Phase 2)

---

_Erstellt mit `/requirements` — Praxis OS Initialisierung (17.02.2026)_
