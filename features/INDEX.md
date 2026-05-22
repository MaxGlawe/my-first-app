# Feature Index — Praxis OS

> Central tracking for all features. Updated by skills automatically.

## Status Legend
- **Planned** - Requirements written, ready for development
- **In Progress** - Currently being built
- **In Review** - QA testing in progress
- **Deployed** - Live in production

## Features

| ID | Feature | Status | Spec | Created |
|----|---------|--------|------|---------|
| PROJ-1 | Authentifizierung & Rollenrechte | Deployed | [Spec](PROJ-1-auth-rollenrechte.md) | 2026-02-17 |
| PROJ-2 | Patientenstammdaten | Deployed | [Spec](PROJ-2-patientenstammdaten.md) | 2026-02-17 |
| PROJ-3 | Anamnese & Untersuchungsdokumentation | Deployed | [Spec](PROJ-3-anamnese-untersuchung.md) | 2026-02-17 |
| PROJ-4 | Befund & Diagnose (Heilpraktiker) | Deployed | [Spec](PROJ-4-befund-diagnose-heilpraktiker.md) | 2026-02-18 |
| PROJ-5 | Behandlungsdokumentation | Deployed | [Spec](PROJ-5-behandlungsdokumentation.md) | 2026-02-17 |
| PROJ-6 | KI-Arztbericht-Generator | Deployed | [Spec](PROJ-6-ki-arztbericht-generator.md) | 2026-02-17 |
| PROJ-7 | Buchungstool-Integration | Deployed | [Spec](PROJ-7-buchungstool-integration.md) | 2026-02-17 |
| PROJ-8 | Übungsdatenbank-Verwaltung | Deployed | [Spec](PROJ-8-uebungsdatenbank.md) | 2026-02-17 |
| PROJ-9 | Trainingsplan-Builder (Drag & Drop) | Deployed | [Spec](PROJ-9-trainingsplan-builder.md) | 2026-02-17 |
| PROJ-10 | Hausaufgaben-Zuweisung | Deployed | [Spec](PROJ-10-hausaufgaben-zuweisung.md) | 2026-02-17 |
| PROJ-11 | Patienten-App: Dashboard & Trainingspläne | Deployed | [Spec](PROJ-11-patienten-app-dashboard.md) | 2026-02-17 |
| PROJ-12 | Patienten-App: Chat (Therapeut ↔ Patient) | Deployed | [Spec](PROJ-12-chat-therapeut-patient.md) | 2026-02-17 |
| PROJ-13 | Kurs-System (Skalierbares Gruppen-Angebot) | Deployed | [Spec](PROJ-13-kurs-system.md) | 2026-02-17 |
| PROJ-14 | PWA-Setup & Push-Notifications | Deployed | [Spec](PROJ-14-pwa-push-notifications.md) | 2026-02-17 |
| PROJ-15 | Neue Berufsbilder (Trainer, Praxismanagement) | Deployed | [Spec](PROJ-15-neue-berufsbilder.md) | 2026-02-19 |
| PROJ-16 | Patienten-App 2.0 (Design, Schmerztagebuch, Gamification) | In Progress | [Spec](PROJ-16-patienten-app-v2.md) | 2026-02-19 |
| PROJ-17 | Patienten-Ampelsystem (Traffic Light Alert System) | In Progress | [Spec](PROJ-17-patienten-ampelsystem.md) | 2026-03-06 |
| PROJ-18 | Betriebliche Gesundheitsförderung (BGF) | In Progress | [Spec](PROJ-18-bgf-betriebliche-gesundheitsfoerderung.md) | 2026-03-15 |
| PROJ-19 | Externe Käufer-Accounts | In Review | [Spec](PROJ-19-externe-kaeufer-accounts.md) | 2026-05-14 |
| PROJ-20 | Kurs-Shop & Kauf-Flow (In-App) | In Review | [Spec](PROJ-20-kurs-shop-kauf-flow.md) | 2026-05-14 |
| PROJ-21 | Öffentlicher Shop (Website) | In Review | [Spec](PROJ-21-oeffentlicher-shop-website.md) | 2026-05-14 |
| PROJ-22 | Ablösung PROJ-13 & Inhalts-Migration | In Review | [Spec](PROJ-22-kurssystem-abloesung.md) | 2026-05-14 |
| PROJ-23 | Schmerzcheck-Funnel (B2C Akquise) | In Progress | [Spec](PROJ-23-schmerzcheck-funnel.md) | 2026-05-21 |

<!-- Add features above this line -->

## Next Available ID: PROJ-24

## Build Order (Empfohlen)

```
Phase 1 — Fundament
  PROJ-1  Authentifizierung & Rollenrechte     ← ZUERST (alles hängt davon ab)
  PROJ-2  Patientenstammdaten                  ← Danach

Phase 2 — Klinisches OS (Therapeuten)
  PROJ-7  Buchungstool-Integration             ← Bestandspatienten importieren
  PROJ-3  Anamnese & Untersuchungsdoku
  PROJ-5  Behandlungsdokumentation
  PROJ-4  Befund & Diagnose (Heilpraktiker)   ← Braucht PROJ-3 & PROJ-5

Phase 3 — KI & Training-Engine
  PROJ-8  Übungsdatenbank
  PROJ-9  Trainingsplan-Builder (Drag & Drop)  ← Braucht PROJ-8
  PROJ-6  KI-Arztbericht-Generator             ← Braucht PROJ-3, 4, 5
  PROJ-10 Hausaufgaben-Zuweisung               ← Braucht PROJ-9

Phase 4 — Patienten-App
  PROJ-11 Patienten-App Dashboard & Training   ← Braucht PROJ-10
  PROJ-12 Chat (Therapeut ↔ Patient)           ← Braucht PROJ-11
  PROJ-14 PWA-Setup & Push-Notifications       ← Braucht PROJ-11 & 12

Phase 5 — Skalierung
  PROJ-13 Kurs-System                          ← Braucht PROJ-8 & 11

Phase 6 — Neue Berufsbilder
  PROJ-15 Trainer & Praxismanagement           ← Braucht PROJ-1, 6, 8

Phase 7 — B2B: Betriebliche Gesundheitsförderung
  PROJ-18 BGF-System                           ← Braucht PROJ-1, 8, 9, 10, 14, 15, 17
    Phase 18.1  Fundament (Org, Members, HR-Rolle)
    Phase 18.2  Ist-Analyse & Pausen-Fit (KI)
    Phase 18.3  Ampel + BGF-Dashboard
    Phase 18.4  Reporting & Abrechnung
    Phase 18.5  Launch & Skalierung

Phase 8 — Praxis OS Shop (Kurse als Produkte)
  PROJ-19 Externe Käufer-Accounts              ← Fundament (Account-Typ + RLS)
  PROJ-20 Kurs-Shop & Kauf-Flow (In-App)       ← Braucht PROJ-19
  PROJ-21 Öffentlicher Shop (Website)          ← Braucht PROJ-19 & 20
  PROJ-22 Ablösung PROJ-13 & Inhalts-Migration ← Braucht PROJ-20
```
