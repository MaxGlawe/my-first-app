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
| PROJ-7 | Buchungstool-Integration | In Review | [Spec](PROJ-7-buchungstool-integration.md) | 2026-02-17 |
| PROJ-8 | Übungsdatenbank-Verwaltung | Planned | [Spec](PROJ-8-uebungsdatenbank.md) | 2026-02-17 |
| PROJ-9 | Trainingsplan-Builder (Drag & Drop) | Planned | [Spec](PROJ-9-trainingsplan-builder.md) | 2026-02-17 |
| PROJ-10 | Hausaufgaben-Zuweisung | Planned | [Spec](PROJ-10-hausaufgaben-zuweisung.md) | 2026-02-17 |
| PROJ-11 | Patienten-App: Dashboard & Trainingspläne | Planned | [Spec](PROJ-11-patienten-app-dashboard.md) | 2026-02-17 |
| PROJ-12 | Patienten-App: Chat (Therapeut ↔ Patient) | Planned | [Spec](PROJ-12-chat-therapeut-patient.md) | 2026-02-17 |
| PROJ-13 | Kurs-System (Skalierbares Gruppen-Angebot) | Planned | [Spec](PROJ-13-kurs-system.md) | 2026-02-17 |
| PROJ-14 | PWA-Setup & Push-Notifications | Planned | [Spec](PROJ-14-pwa-push-notifications.md) | 2026-02-17 |

<!-- Add features above this line -->

## Next Available ID: PROJ-15

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
```
