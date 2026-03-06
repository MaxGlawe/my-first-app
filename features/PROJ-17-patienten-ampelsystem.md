# PROJ-17: Patienten-Ampelsystem (Traffic Light Alert System)

**Status:** In Progress
**Erstellt:** 2026-03-06
**Priorität:** P0 — Kern-Feature für Online-Betreuung

---

## Problem

Therapeuten betreuen 20–30+ Patienten gleichzeitig. Wenn ein Patient täglich Check-Ins macht (Schmerz, Befindlichkeit, Training), landen diese Daten passiv in der Datenbank. Der Therapeut erfährt von Verschlechterungen **nur wenn er aktiv in den Patientenverlauf schaut** — was im Praxisalltag oft nicht täglich passiert.

**Kritisches Szenario:** Patient meldet Schmerz 4 → 7 über 3 Tage. Ohne Alert passiert 5 Tage lang nichts. Bei Online-Betreuung kann das therapieschädigend sein.

---

## Lösung

Ein automatisches Ampelsystem das kontinuierlich Patienten-Daten auswertet und dem Therapeuten priorisierte Alerts liefert — mit direkten Aktionen aus dem Dashboard.

---

## User Stories

1. **Als Therapeut** sehe ich beim Öffnen des Dashboards sofort welche Patienten meine Aufmerksamkeit brauchen — ohne jeden Patienten einzeln anzusehen.

2. **Als Therapeut** sehe ich den konkreten Grund für einen Alert ("Schmerz von 4 auf 7 in 3 Tagen") damit ich sofort handeln kann.

3. **Als Therapeut** kann ich direkt aus dem Alert heraus eine Chat-Nachricht senden, den Trainingsplan anpassen oder eine Push-Erinnerung schicken.

4. **Als Therapeut** in der Online-Betreuung habe ich Sicherheit dass ich kritische Verschlechterungen nicht übersehe.

5. **Als Therapeut** sehe ich in der Patientenliste einen farbigen Punkt der den Ampelstatus jedes Patienten anzeigt.

---

## Akzeptanzkriterien

- [ ] Dashboard zeigt Ampel-Sektion ganz oben, sortiert: Rot → Gelb → Grün
- [ ] Rote Patienten: Schmerz ≥8, Schmerzanstieg ≥3P/3Tage, Compliance <25%, kein Check-In 7+ Tage
- [ ] Gelbe Patienten: Schmerzanstieg ≥2P/3Tage, Compliance 25–49%, kein Check-In 3–6 Tage
- [ ] Jeder Alert zeigt konkrete Begründung in Klartext
- [ ] Schnellaktion "Nachricht senden" öffnet Chat zum Patienten
- [ ] Schnellaktion "Trainingsplan anpassen" navigiert zum Plan
- [ ] Schnellaktion "Erinnerung senden" sendet Push-Notification an Patient
- [ ] Patientenliste zeigt Ampel-Dot neben jedem Namen
- [ ] Filter: Alle / Nur Rot / Nur Gelb
- [ ] Bei keinen Alerts: leerer Grün-Zustand ("Alle Patienten im grünen Bereich")

---

## Technische Architektur (Solution Architect)

### Komponentenstruktur

```
/os/dashboard (erweitert)
└── AmpelDashboard (neue Sektion — ganz oben)
    ├── AmpelSummaryBar
    │   ├── Rot-Badge "X Patienten — Sofort handeln"
    │   ├── Gelb-Badge "Y Patienten — Beobachten"
    │   └── Grün-Badge "Z Patienten — Alles gut"
    ├── AmpelFilter (Tabs: Alle / Rot / Gelb)
    └── AmpelPatientenKarte[] — eine pro Patient mit Alert
        ├── Avatar + Name + letzter Check-In
        ├── AmpelIndikator (ROT / GELB / GRÜN)
        ├── AlertGründe[]
        │   ├── "⚠ Schmerz: 4 → 7 in 3 Tagen"
        │   ├── "📉 Compliance: 18% letzte Woche"
        │   └── "🔕 Kein Check-In seit 8 Tagen"
        └── SchnellAktionen
            ├── [💬 Nachricht senden]
            ├── [📋 Plan anpassen]
            └── [🔔 Erinnerung senden]

/os/patients (Patientenliste — erweitert)
└── PatientenZeile
    └── AmpelDot (kleiner farbiger Punkt) — NEU
```

### Alert-Regelwerk

| Ampel | Trigger | Priorität |
|-------|---------|-----------|
| 🔴 ROT | Schmerz ≥ 8 in den letzten 3 Tagen | 1 |
| 🔴 ROT | Schmerzanstieg ≥ 3 Punkte über 3 aufeinanderfolgende Tage | 2 |
| 🔴 ROT | Compliance < 25% letzte 7 Tage (aktive Zuweisung) | 3 |
| 🔴 ROT | Kein Check-In seit ≥ 7 Tagen (aktive Zuweisung) | 4 |
| 🟡 GELB | Schmerzanstieg ≥ 2 Punkte über 3 Tage | 5 |
| 🟡 GELB | Compliance 25–49% letzte 7 Tage | 6 |
| 🟡 GELB | Kein Check-In seit 3–6 Tagen | 7 |
| 🟢 GRÜN | Kein Trigger zutrifft | — |

### Datenmodell

Keine neuen Tabellen. Bestehende Quellen:

| Tabelle | Genutzt für |
|---------|-------------|
| `pain_diary` | Schmerzentwicklung letzte 7 Tage |
| `assignment_completions` | Compliance-Berechnung |
| `patient_assignments` | Aktiv betreute Patienten |
| `chat_messages` | Chat-Schnellaktion |
| `push_subscriptions` | Push-Erinnerung |

**V1.1 Optional:** `alert_dismissals` — Therapeut kann Alert als "reagiert" markieren (Snooze)

### Neue API

| Endpoint | Beschreibung |
|----------|-------------|
| `GET /api/os/patient-alerts` | Berechnet Ampelstatus + Gründe für alle Patienten des Therapeuten. Kombiniert pain_diary + compliance in einem Aufruf. |

### Tech-Entscheidungen

- **Server-seitige Berechnung:** Alert-Logik läuft im API-Endpoint — sicher, konsistent, nicht manipulierbar
- **On-Demand (kein Realtime):** Alerts werden bei Dashboard-Load berechnet + Refresh-Button. Kein Websocket für V1.
- **Bestehende Push-Infrastruktur:** Schnellaktion nutzt `/api/push/send` (PROJ-14)
- **Keine neuen Packages:** Alles mit shadcn Badge, Card, Tabs umsetzbar

---

## Abhängigkeiten

- PROJ-10 (Hausaufgaben/Compliance-Daten) ✅
- PROJ-14 (Push-Notifications für Erinnerungen) ✅
- PROJ-16 (Schmerztagebuch-Daten) ✅
- PROJ-12 (Chat für Schnellaktion) ✅

---

_Erstellt: 2026-03-06_
