# PROJ-16: Patienten-App 2.0 — Design, Schmerztagebuch & Gamification

## Status: In Progress
**Created:** 2026-02-19
**Last Updated:** 2026-02-19

## Dependencies
- Requires: PROJ-11 (Patienten-App Dashboard & Training — Basis)
- Requires: PROJ-1 (Authentifizierung — Patient-Rolle)

## User Stories
- Als Patient möchte ich beim Öffnen der App eine moderne, motivierende Oberfläche sehen, die mich zum Training animiert.
- Als Patient möchte ich meinen Tagesstreak sehen, damit ich motiviert bleibe, jeden Tag zu trainieren.
- Als Patient möchte ich täglich mein Schmerzlevel und meine Befindlichkeit eintragen, damit mein Therapeut meinen Verlauf objektiv nachvollziehen kann.
- Als Therapeut möchte ich den Schmerzverl auf meiner Patienten in einer Timeline sehen, damit ich Behandlungsentscheidungen auf objektive Daten stützen kann.
- Als Patient möchte ich Achievements und Meilensteine sehen, die mich für Trainings-Compliance belohnen.

## Acceptance Criteria
- [ ] Dashboard: Persönliche Begrüßung mit Tageszeit (Morgen/Mittag/Abend)
- [ ] Dashboard: Animierter Wochenziel-Ring (Einheiten diese Woche / geplante Einheiten)
- [ ] Dashboard: Streak-Karte mit Flammen-Icon und Tagesanzahl
- [ ] Dashboard: Tages-Check-in Banner ("Wie geht es dir heute?")
- [ ] Schmerztagebuch: NRS-Slider (0–10) mit Emoji-Feedback
- [ ] Schmerztagebuch: Wohlbefinden-Slider (0–10)
- [ ] Schmerztagebuch: Optionales Freitext-Notizfeld
- [ ] Schmerztagebuch: Max. 1 Eintrag pro Tag (Überschreiben bei erneutem Eintrag)
- [ ] Progress: Schmerzverl auf als Liniendiagramm (letzte 30 Tage)
- [ ] Progress: Achievement-Badges (Meilensteine)
- [ ] OS: Therapeut sieht Befindlichkeits-Timeline im Patienten-Detail
- [ ] Design: Apple Health Style — Teal/Emerald Akzente, warme Weißtöne, runde Formen
- [ ] Design: Bottom-Navigation mit aktivem Indikator-Punkt
- [ ] Mobile-First: Alle Touch-Targets ≥ 48px

## Edge Cases
- Was passiert bei erstem Login ohne Daten? → Leerer Streak (0), Check-in Banner prominent
- Was passiert wenn Patient zweimal am Tag einträgt? → Upsert: letzter Eintrag gewinnt
- Was passiert wenn kein Trainingsplan? → Wochenziel-Ring zeigt 0/0, Check-in trotzdem möglich
