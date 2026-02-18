# PROJ-7: Buchungstool-Integration

## Status: Planned
**Created:** 2026-02-17
**Last Updated:** 2026-02-17

## Dependencies
- Requires: PROJ-1 (Authentifizierung & Rollenrechte)
- Requires: PROJ-2 (Patientenstammdaten)

## User Stories
- Als Admin möchte ich Patienten aus dem bestehenden Buchungstool ins Praxis OS importieren, damit ich nicht alle Bestandspatienten manuell anlegen muss.
- Als Therapeut möchte ich in der Patientenakte die nächsten Termine des Patienten sehen, damit ich weiß, wann ich ihn wieder behandle.
- Als Therapeut möchte ich über das Praxis OS einen neuen Termin im Buchungstool anlegen können, ohne zwischen zwei Systemen wechseln zu müssen.
- Als Patient möchte ich in der Patienten-App meine gebuchten Termine sehen, damit ich immer auf dem aktuellen Stand bin.

## Acceptance Criteria
- [ ] Import-Funktion: Admin kann Patientenliste aus Buchungstool als CSV oder via API importieren
- [ ] Mapping: Name, E-Mail, Telefon, Geburtsdatum werden zugeordnet, Duplikate erkannt
- [ ] Termin-Anzeige: In der Patientenakte werden kommende Termine aus dem Buchungstool angezeigt (read-only)
- [ ] Patienten-App: Tab "Meine Termine" zeigt gebuchte Termine aus dem Buchungstool
- [ ] Link-Verknüpfung: Patient im OS ist mit Patient-ID im Buchungstool verknüpft (`booking_system_id` Feld)
- [ ] Neu-Termin-Button: Öffnet Buchungstool im neuen Tab mit vorbelegtem Patientennamen
- [ ] Sync-Indikator: Zeigt an, wann zuletzt synchronisiert wurde
- [ ] Fehlerbehandlung: Wenn Buchungstool nicht erreichbar, wird Fallback-Text angezeigt

## Edge Cases
- Was passiert, wenn der gleiche Patient unterschiedliche E-Mails im OS und Buchungstool hat? → Manuelle Verknüpfung durch Admin, Warnung bei Import
- Was passiert, wenn das Buchungstool offline ist? → Cached Termindaten (max. 24h alt) anzeigen mit Hinweis
- Was passiert, wenn ein Patient gelöscht wird? → Verknüpfung wird entfernt, Buchungstool-Daten bleiben unberührt

## Technical Requirements
- Integration-Art: Abhängig vom bestehenden Buchungstool (API-Key oder Webhook oder CSV-Import)
- Tabelle: `patients.booking_system_id` (nullable VARCHAR)
- Termin-Daten: In `appointments` Tabelle gecacht, TTL 24 Stunden
- Webhook-Empfänger: `/api/webhooks/booking` empfängt neue/geänderte Termine

---

## Tech Design (Solution Architect)

**Ansatz: Webhook-basierte Push-Integration**

Da das Buchungstool intern entwickelt wird, senden wir Daten aktiv per Webhook an Praxis OS — kein Polling, kein CSV-Import.

---

### A) Komponenten-Struktur

```
Admin-Bereich
+-- /os/admin/integrations (neu)
|   +-- WebhookConfigCard
|   |   +-- Webhook-URL (kopierbar)
|   |   +-- Webhook-Secret (kopierbar, einmalig sichtbar)
|   +-- WebhookEventLog
|       +-- Tabelle: Letzte 50 Events (Zeitstempel, Typ, Status, Payload-Vorschau)

Patienten-Detail
+-- TermineTab (ersetzt PlaceholderTab)
    +-- Termin-Liste (kommende Termine aus Cache)
    +-- Letzter Sync-Zeitstempel
    +-- "Termin buchen"-Button → öffnet Buchungstool im neuen Tab
```

---

### B) Datenmodell

**Erweiterung: `patients` Tabelle**
- Neues Feld: `booking_system_id` (TEXT, nullable) — verknüpft Patient im OS mit Patient-ID im Buchungstool
- Neues Feld: `booking_email` (TEXT, nullable) — E-Mail wie sie im Buchungstool hinterlegt ist (für Duplikat-Erkennung)

**Neue Tabelle: `appointments`**
- Cached Termindaten aus dem Buchungstool
- Felder: `id`, `patient_id` (FK → patients), `booking_system_appointment_id`, `scheduled_at`, `duration_minutes`, `therapist_name`, `service_name`, `status`, `synced_at`
- TTL-Konzept: 24 Stunden — nach Ablauf wird Fallback-Text angezeigt

**Neue Tabelle: `webhook_events`**
- Unveränderliches Audit-Log aller eingehenden Webhooks
- Felder: `id`, `event_type`, `received_at`, `payload` (JSONB), `processing_status` (`success`/`error`/`duplicate`), `error_message`
- Kein DELETE, kein UPDATE (DSGVO-Audit-Trail)

---

### C) Integrationsfluss

**Patient registriert sich im Buchungstool:**
1. Buchungstool sendet `POST /api/webhooks/booking` mit Event-Typ `patient.created`
2. Praxis OS prüft HMAC-Signatur (Webhook-Secret im `X-Webhook-Signature` Header)
3. E-Mail-basierte Duplikat-Erkennung: existiert bereits ein Patient mit dieser E-Mail?
   - **Neu:** Patient wird automatisch in `patients` Tabelle angelegt (Therapeut = Standard-Therapeut oder per Konfiguration)
   - **Duplikat:** `booking_system_id` wird im bestehenden Patienten verknüpft
4. Event wird in `webhook_events` geloggt

**Termin wird gebucht/geändert/storniert:**
1. Buchungstool sendet `POST /api/webhooks/booking` mit Event-Typ `appointment.created` / `appointment.updated` / `appointment.cancelled`
2. Signatur-Prüfung (wie oben)
3. `appointments` Tabelle wird aktualisiert (`synced_at` = NOW())
4. Event in `webhook_events` geloggt

---

### D) Sicherheit

- **HMAC-SHA256** Signaturprüfung bei jedem eingehenden Webhook
- Webhook-Secret wird beim ersten Setup generiert (einmalig im UI angezeigt, dann nur noch als Hash gespeichert)
- Idempotenz: `booking_system_appointment_id` verhindert doppelte Einträge bei Retry-Logik des Buchungstools
- Rate Limiting: max. 100 Webhook-Events pro Minute (HTTP 429 bei Überschreitung)

---

### E) API-Endpunkte

| Methode | Pfad | Beschreibung |
|---------|------|--------------|
| `POST` | `/api/webhooks/booking` | Empfängt Events vom Buchungstool (öffentlich, HMAC-gesichert) |
| `GET` | `/api/patients/[id]/appointments` | Holt gecachte Termine für einen Patienten |
| `GET` | `/api/admin/webhook-events` | Holt Event-Log (nur Admin) |
| `POST` | `/api/admin/webhook-secret/rotate` | Generiert neues Webhook-Secret (nur Admin) |

---

### F) Tech-Entscheidungen

- **HMAC statt Bearer Token:** Kryptografisch sicherer — schützt gegen Replay-Attacks
- **Daten cachen statt live abfragen:** Praxis OS braucht keine direkte API-Verbindung zum Buchungstool; das Buchungstool pusht Änderungen aktiv
- **Keine neuen Packages nötig:** HMAC via Node.js `crypto` (built-in), Rest mit bestehendem Supabase-Stack
- **Auto-Assign Therapeut:** Bei automatisch erstellten Patienten wird ein konfigurierbarer Standard-Therapeut zugewiesen (in Admin-Einstellungen wählbar)

---

### G) Migrations-Übersicht

1. `ALTER TABLE patients ADD COLUMN booking_system_id TEXT, ADD COLUMN booking_email TEXT`
2. `CREATE TABLE appointments (...)` mit RLS
3. `CREATE TABLE webhook_events (...)` mit RLS (nur Admin SELECT, kein DELETE/UPDATE)
4. Webhook-Secret wird als Umgebungsvariable `BOOKING_WEBHOOK_SECRET` gespeichert

## QA Test Results
_To be added by /qa_

## Deployment
_To be added by /deploy_
