# PROJ-12: Chat (Therapeut ↔ Patient)

## Status: Planned
**Created:** 2026-02-17
**Last Updated:** 2026-02-17

## Dependencies
- Requires: PROJ-1 (Authentifizierung & Rollenrechte)
- Requires: PROJ-2 (Patientenstammdaten)
- Requires: PROJ-11 (Patienten-App — Einstiegspunkt für Patienten)

## User Stories
- Als Patient möchte ich meinem Therapeuten eine Nachricht schreiben, wenn ich eine Frage zu meinen Übungen habe, damit ich nicht bis zum nächsten Termin warten muss.
- Als Therapeut möchte ich Nachrichten meiner Patienten in einem übersichtlichen Posteingang sehen und antworten, damit ich keinen Kontakt verpasse.
- Als Therapeut möchte ich Bilder oder kurze Videos in den Chat schicken können (z.B. Korrektur der Übungsausführung), damit ich visuell helfen kann.
- Als Patient möchte ich eine Benachrichtigung erhalten, wenn mein Therapeut antwortet, damit ich nicht ständig die App prüfen muss.
- Als Therapeut möchte ich sehen, welche Patienten ich noch nicht beantwortet habe (unread badge), damit ich keinen Patienten ignoriere.

## Acceptance Criteria
- [ ] Chat-Interface: Bewährtes Messaging-Layout (Nachrichten links/rechts, Zeitstempel, Gelesen-Status)
- [ ] Therapeuten-Posteingang: Liste aller Patientengespräche mit letzter Nachricht, Unread-Counter
- [ ] Text-Nachrichten: Bis 2000 Zeichen
- [ ] Medien-Upload: Bilder (JPG/PNG/HEIC, max 10MB), keine direkten Videos (nur Link-URLs)
- [ ] Echtzeit: Nachrichten erscheinen sofort ohne Reload (Supabase Realtime)
- [ ] Gelesen-Status: "Gelesen" angezeigt wenn Empfänger Nachricht gesehen hat
- [ ] Push-Notification: Patient erhält Benachrichtigung bei neuer Therapeuten-Antwort (PROJ-14)
- [ ] Therapeut erhält In-App-Benachrichtigung (Glocken-Icon) bei neuen Patientennachrichten
- [ ] Chat nur zwischen Patient und zugewiesenem Therapeuten (kein Gruppen-Chat)
- [ ] DSGVO: Nachrichten werden verschlüsselt gespeichert, max. 2 Jahre Aufbewahrung
- [ ] Kein Chat mit nicht-zugewiesenen Patienten möglich (RLS)

## Edge Cases
- Was passiert, wenn der Therapeut im Urlaub ist? → Status "Abwesend" setzbar mit automatischer Abwesenheitsnachricht
- Was passiert, wenn ein Patient belästigende Nachrichten schickt? → Admin kann Konversation sperren
- Was passiert, wenn ein Bild nicht hochgeladen werden kann (schlechte Verbindung)? → Retry-Button, Nachricht wird als Entwurf gehalten
- Was passiert, wenn ein Patient nicht mehr in der Praxis ist (archiviert)? → Chat wird readonly, keine neuen Nachrichten möglich

## Technical Requirements
- Real-time: Supabase Realtime Channels (WebSocket)
- Tabelle: `chat_messages` mit `sender_id`, `receiver_id`, `content`, `media_url`, `read_at`
- RLS: Patient sieht nur eigene Konversation; Therapeut sieht nur eigene Patienten
- Storage: Bilder in Supabase Storage, Ordner `chat/`, nach 2 Jahren auto-delete
- Performance: Letzte 50 Nachrichten laden in < 500ms; ältere Nachrichten per Pagination

---

## Tech Design (Solution Architect)
_To be added by /architecture_

## QA Test Results
_To be added by /qa_

## Deployment
_To be added by /deploy_
