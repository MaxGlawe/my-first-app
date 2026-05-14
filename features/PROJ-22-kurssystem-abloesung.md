# PROJ-22: Ablösung PROJ-13 & Inhalts-Migration

## Status: Planned
**Created:** 2026-05-14
**Last Updated:** 2026-05-14

## Dependencies
- Requires: PROJ-20 (Kurs-Shop & Kauf-Flow) — das neue System muss existieren, bevor das alte abgelöst wird

## Kontext
Das alte PROJ-13-Kurssystem (therapeuten-erstellte Gruppenkurse mit manueller
Einschreibung) wird durch den neuen Shop ersetzt. Es enthält **nur Test-User, keine
echten Klienten** — der Sunset ist daher unkritisch. Die wertvollen Traumreisen-
Inhalte (Wald/Meer/Berg) sollen aber erhalten bleiben und als Produkte ins neue
System wandern. Ziel: ein einziges, self-service-fähiges System statt zweier
paralleler — und Ende des manuellen Einschreibungs-Aufwands.

## User Stories
- Als Produktverantwortlicher möchte ich, dass das alte PROJ-13-System abgelöst wird, damit es kein paralleles, manuell zu pflegendes System mehr gibt.
- Als Nutzer möchte ich die Traumreisen-Inhalte (Wald/Meer/Berg) weiterhin nutzen können — jetzt als Produkte im neuen Shop.
- Als App-Nutzer möchte ich keine widersprüchliche "Meine Kurse"-Anzeige mehr sehen (altes vs. neues Kurssystem).
- Als Admin möchte ich den manuellen Einschreibungs-Aufwand des alten Systems los sein.

## Acceptance Criteria
- [ ] Die Traumreisen-Inhalte aus PROJ-13 sind als Produkte/Inhalte im neuen System verfügbar
- [ ] Übergangsweise (vor vollständiger Ablösung) ist die alte "Meine Kurse"-Dashboard-Karte ausgeblendet, um die sichtbare Vermischung sofort zu beenden
- [ ] Die alten Kurs-Routen (`/app/courses`) und das Therapeuten-Kursverwaltungs-UI sind entfernt oder leiten weiter
- [ ] Keine Funktion verweist mehr auf das alte `courses`-Datenmodell oder die `/api/courses/*`-Endpunkte
- [ ] Test-User-Daten aus dem alten System sind sauber entfernt
- [ ] Der Begriff "Kurs" ist nach der Ablösung eindeutig dem neuen System zugeordnet

## Edge Cases
- Alte Enrollment-/Fortschrittsdaten von Test-Usern → können verworfen werden (bestätigt: keine echten Klienten)
- Bookmarks/Links auf alte Kurs-URLs → Weiterleitung oder saubere 404-Seite
- Traumreisen-Inhalt hat ein anderes Format (Audio/Traumreise) als die 21-Tage-Kurse → das neue Produktmodell (PROJ-20) muss diesen Inhaltstyp abbilden
- `MeineKurseKarte`-Komponente und `/api/courses/*`-Endpunkte → sauber entfernen, keine toten Verweise
- Reihenfolge: das alte System darf erst entfernt werden, wenn das neue produktiv und getestet ist

## Technical Requirements (optional)
- Sauberer Sunset: erst neues System live & getestet, dann altes entfernen
- Keine Datenmigration echter Nutzer nötig (nur Test-Daten)
- Inhalts-Migration der Traumreisen, nicht der User-Daten

---
<!-- Sections below are added by subsequent skills -->

## Tech Design (Solution Architect)
_To be added by /architecture_

## QA Test Results
_To be added by /qa_

## Deployment
_To be added by /deploy_
