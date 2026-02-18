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

**Designed:** 2026-02-18

---

### Das Konversations-Modell

Ein Patient hat genau einen zugewiesenen Therapeuten (`patients.therapeut_id`). Damit ist eine Konversation eindeutig durch die `patient_id` definiert — keine separate Konversations-Tabelle nötig. Alle Nachrichten einer Konversation sind an `patient_id` gebunden; Therapeut und Patient sind über die bestehende Beziehung (`patients.therapeut_id`) identifiziert.

---

### Component Structure (Seitenstruktur)

```
/app/chat  (neue Seite — Patient-Seite)
+-- ChatPage
    +-- ChatHeader  (Therapeut-Name + Avatar)
    +-- NachrichtenListe  (ScrollArea, letzte 50 laden)
    |   +-- NachrichtBubble  (links = Therapeut, rechts = Patient)
    |   |   +-- Text ODER MediaVorschau (Bild)
    |   |   +-- Zeitstempel + Gelesen-Haken (✓✓)
    |   +-- LadeÄltere-Button  (Pagination nach oben)
    +-- NachrichtInput
        +-- Textarea  (max 2000 Zeichen mit Zähler)
        +-- BildUpload-Button  (JPG/PNG/HEIC ≤ 10 MB)
        +-- Senden-Button

/os/chat  (neue Seite — Therapeuten-Posteingang)
+-- ChatPosteingang
    +-- GesprächsListe
        +-- GesprächsKarte  (Patienten-Avatar + Name + Letzte Nachricht + Zeit)
        |   +-- UnreadBadge  (Anzahl ungelesener Nachrichten)
        +-- Link → /os/patients/[id] #chat

/os/patients/[id]  → neuer "Chat" Tab (in bestehender Patient-Detailseite)
+-- ChatTab
    +-- ChatFenster  (geteilte Komponente — gleiche UI, Therapeuten-Perspektive)
        +-- NachrichtenListe
        +-- NachrichtInput
```

**Geteilte Kernkomponente:** `<ChatFenster>` wird sowohl in `/app/chat` (Patient) als auch im Therapeuten-Tab verwendet. Ein `perspective`-Prop steuert, welche Nachrichten links/rechts erscheinen und welche API-Route genutzt wird.

**PatientenNavigation:** Neues "Nachrichten"-Tab (MessageCircle-Icon) als 5. Eintrag in der bestehenden Bottom-Navigation.

**Therapeuten-Sidebar:** Neuer "Chat"-Eintrag in der `/os/`-Navigation mit Echtzeit-Unread-Badge.

---

### Datenmodell

**Neue DB-Tabelle: `chat_messages`**

Jede Nachricht enthält:
- Eindeutige ID
- `patient_id` → FK zu `patients` (bindet Nachricht an Konversation + ermöglicht RLS)
- `sender_id` → `auth.uid()` des Absenders (Patient oder Therapeut)
- `content` → Text bis 2000 Zeichen (at-rest AES-256 durch Supabase — DSGVO-konform für MVP)
- `media_url` → optionaler Supabase Storage Link (Ordner `chat/`)
- `media_type` → `'image'` oder `null` (keine direkten Video-Uploads, nur URLs)
- `read_at` → Zeitstempel wenn Empfänger Nachricht gesehen hat (`null` = ungelesen)
- `created_at` → Zeitstempel

**Keine separate Konversations-Tabelle** — die Konversation ergibt sich implizit aus `patient_id` + `patients.therapeut_id`.

**DSGVO — 2-Jahres-Aufbewahrung:** Spalte `retain_until = created_at + 2 Jahre`. Automatisches Löschen via `pg_cron`-Job (wird in PROJ-14/Infra-Sprint eingerichtet; für MVP ist das Feld vorhanden).

---

### Neue API-Endpunkte

| Route | Zweck |
|---|---|
| `GET /api/me/chat` | Patient lädt seine Nachrichten (letzte 50, Cursor-Pagination) |
| `POST /api/me/chat` | Patient sendet Nachricht an Therapeuten |
| `PATCH /api/me/chat/read` | Patient markiert alle ungelesenen Therapeuten-Nachrichten als gelesen |
| `GET /api/patients/[id]/chat` | Therapeut lädt Nachrichten für einen Patienten |
| `POST /api/patients/[id]/chat` | Therapeut sendet Nachricht an Patient |
| `PATCH /api/patients/[id]/chat/read` | Therapeut markiert alle ungelesenen Patienten-Nachrichten als gelesen |
| `GET /api/chat/inbox` | Therapeut lädt Posteingang: alle Konversationen mit Unread-Count + letzter Nachricht |

---

### Echtzeit (Realtime)

Supabase Realtime Channels: Das `<ChatFenster>` abonniert den Kanal `chat:patient:{patient_id}`. Jede neue `INSERT`-Nachricht wird sofort angezeigt — kein Reload nötig. Read-Receipts (`UPDATE` auf `read_at`) werden ebenfalls in Echtzeit übertragen, sodass das Gelesen-Haken (✓✓) beim Absender sofort erscheint.

---

### Tech-Entscheidungen

| Entscheidung | Warum |
|---|---|
| Keine separate Konversations-Tabelle | Patient hat genau einen Therapeuten → `patient_id` allein definiert die Konversation eindeutig; weniger Komplexität |
| Supabase Realtime (WebSocket) | Bereits im Stack; kein neues Paket; native Integration mit Supabase RLS |
| Geteilte `<ChatFenster>`-Komponente | Vermeidet Code-Duplizierung zwischen Patient- und Therapeuten-Ansicht |
| Cursor-Pagination (nach `created_at`) | Effizient für große Nachrichtenhistorien; Infinite-Scroll-Muster nach oben |
| Bilder via Supabase Storage `chat/`-Ordner | Bereits für Exercise-Media genutzt; selbe Infrastruktur, kein neues Service |
| Kein Video-Upload (nur Link-URLs) | Spec-Vorgabe; vermeidet hohe Storage-Kosten und Transcode-Komplexität |
| `read_at`-Spalte (nicht separate Tabelle) | Einfachste Lösung für Gelesen-Status in 1:1-Chats |
| At-rest AES-256 (Supabase) | DSGVO-konform für MVP; True E2E-Verschlüsselung ist unverhältnismäßig komplex für diesen Use-Case |

### Keine neuen Pakete

Alle UI-Komponenten (`ScrollArea`, `Avatar`, `Textarea`, `Badge`, `Skeleton`) bereits via shadcn/ui installiert. Supabase Realtime ist in `@supabase/supabase-js` enthalten. Kein neues Package nötig.

## QA Test Results
_To be added by /qa_

## Deployment
_To be added by /deploy_
