# PROJ-14: PWA-Setup & Push-Notifications

## Status: In Progress
**Created:** 2026-02-17
**Last Updated:** 2026-02-17

## Dependencies
- Requires: PROJ-11 (Patienten-App Dashboard — Basis-App muss existieren)
- Requires: PROJ-12 (Chat — Push bei neuer Nachricht)

## User Stories
- Als Patient möchte ich die Patienten-App auf meinem iPhone/Android-Homescreen installieren können, damit ich sie wie eine native App nutze ohne App-Store.
- Als Patient möchte ich eine Push-Benachrichtigung erhalten, wenn ich heute trainieren soll, damit ich meine Hausaufgaben nicht vergesse.
- Als Patient möchte ich eine Push-Benachrichtigung erhalten, wenn mein Therapeut mir eine Nachricht schickt, damit ich zeitnah antworten kann.
- Als Patient möchte ich einstellen, welche Benachrichtigungen ich erhalten möchte, damit ich nicht überflutet werde.

## Acceptance Criteria
- [ ] Web App Manifest: Name, Icons (192px, 512px), Splash Screen, Theme Color, Display Mode "standalone"
- [ ] Service Worker: Registriert, cached Patienten-App-Assets für Offline-Nutzung
- [ ] "App installieren" Prompt: Browser-nativer Install-Banner erscheint automatisch (iOS: Anleitung in App anzeigen)
- [ ] Push-Subscription: Patient kann Web Push aktivieren (Permission-Dialog)
- [ ] Training-Erinnerung: Tägliche Benachrichtigung an Trainingstagen um vom Patienten gewählter Uhrzeit
- [ ] Chat-Notification: Sofort-Benachrichtigung bei neuer Therapeuten-Nachricht
- [ ] Benachrichtigungs-Einstellungen: Patient kann einzelne Notification-Typen an/aus schalten
- [ ] iOS-Support: PWA installierbar via Safari "Zum Homescreen" (explizite Anleitung im Onboarding)
- [ ] Android-Support: Chrome Install-Banner automatisch

## Edge Cases
- Was passiert, wenn der Patient Push-Notifications ablehnt? → App funktioniert vollständig, In-App-Badge als Fallback
- Was passiert, wenn ein Patient mehrere Geräte hat? → Push an alle registrierten Geräte
- Was passiert, wenn der Patient die App deinstalliert? → Service Worker und Push-Subscription werden entfernt, keine verwaisten Subscriptions
- Was passiert, wenn Notifications mehrere Stunden nicht zugestellt werden (offline)? → Zustellung beim nächsten Online-Sein, Stale Notifications (> 12h alt) werden verworfen

## Technical Requirements
- `next-pwa` oder manueller Service Worker mit Workbox
- Web Push: VAPID Keys, Push-Service (eigener Endpoint `/api/push/send`)
- Tabelle: `push_subscriptions` mit `patient_id`, `subscription (JSONB)`, `device_type`
- Cron Job: Tägliche Training-Reminder via Supabase Edge Function (Zeitzone-aware)
- iOS: WKWebView-Hinweise für Safari-Installation (ab iOS 16.4 PWA Push möglich)

---

## Tech Design (Solution Architect)

**Designed:** 2026-02-18

---

### Kern-Entscheidung: Service Worker

Empfehlung: **`@ducanh2912/next-pwa`** — aktiv gepflegter Fork von next-pwa mit explizitem Next.js App Router Support. Generiert den Service Worker automatisch beim Build, braucht nur minimale Konfiguration in `next.config.ts`.

---

### Component Structure (Seitenstruktur)

```
/app/einstellungen  (neue Seite)
+-- EinstellungenPage
    +-- InstallSection
    |   +-- InstallPrompt  (Android: nativer Browser-Banner)
    |   +-- iOsAnleitung   (Sheet mit Schritt-für-Schritt Guide)
    |       "Safari → Teilen → Zum Home-Bildschirm"
    +-- BenachrichtigungsSection
        +-- PushPermissionButton  (Aktivieren / Deaktivieren)
        +-- Switch: Training-Erinnerung  (an/aus)
        |   +-- UhrzeitPicker  (z.B. 08:00)
        +-- Switch: Chat-Benachrichtigungen  (an/aus)

/app/dashboard  (bestehend — neue Einstellungen-Karte)

PatientenNavigation  (bestehend — keine neuen Tabs)
→ Einstellungen erreichbar via Dashboard-Karte
```

---

### Datenmodell

**Neue DB-Tabelle: `push_subscriptions`**

Jede Zeile = ein Gerät eines Patienten (Multi-Gerät-Support):

- `id` — Eindeutige ID
- `patient_id` → FK zu patients
- `subscription_json` → Browser-PushSubscription-Objekt als JSONB (Endpoint + Verschlüsselungs-Keys)
- `device_type` → "ios" / "android" / "desktop"
- `reminder_enabled` → Training-Erinnerung an/aus (Standard: true)
- `reminder_time` → Uhrzeit als "HH:MM" (Standard: "08:00")
- `chat_enabled` → Chat-Benachrichtigungen an/aus (Standard: true)
- `created_at`, `updated_at`

**Neue ENV-Variablen:**
- `VAPID_PUBLIC_KEY` — öffentlich, wird an den Browser übergeben
- `VAPID_PRIVATE_KEY` — geheim, nur server-seitig
- `VAPID_SUBJECT` — z.B. `mailto:praxis@example.com`
- `CRON_SECRET` — zufälliger langer String; Supabase pg_cron sendet ihn im Header, API-Route prüft ihn (verhindert unautorisierte Cron-Aufrufe)

---

### Neue API-Endpunkte

| Route | Zweck |
|---|---|
| `POST /api/me/push/subscribe` | Patient speichert Browser-Subscription + Gerätetyp in DB |
| `DELETE /api/me/push/unsubscribe` | Patient entfernt Subscription bei Permission-Entzug |
| `PATCH /api/me/push/preferences` | Patient ändert reminder_enabled, reminder_time, chat_enabled |
| `POST /api/push/send` | Interner Endpoint — sendet Push an Patient (von Chat-Route + Cron aufgerufen); via `CRON_SECRET` Header abgesichert |
| `GET /api/cron/training-reminder` | Cron-Endpunkt (aufgerufen von Supabase pg_cron via pg_net) — stündlich, sendet Training-Reminder |

---

### Push-Auslöser

**Chat-Benachrichtigung (sofort):**
`POST /api/patients/[id]/chat` ruft nach dem Speichern der Nachricht intern `sendPushToPatient()` auf — lädt alle aktiven Subscriptions des Patienten, sendet Push an jedes Gerät.

**Training-Erinnerung (täglich, stündlich geprüft):**
Supabase **pg_cron** (DB-Level Scheduler) ruft stündlich via **pg_net** (Supabase HTTP-Extension) den Endpoint `/api/cron/training-reminder` der Next.js App auf. Der Endpoint prüft: Welche Patienten haben heute Training + deren `reminder_time` liegt in der letzten Stunde? → Push senden.

Vorteile gegenüber Vercel Cron: funktioniert unabhängig vom Hosting-Anbieter (Vercel, eigener Server, Docker). Die Next.js App muss nur erreichbar sein. Der Endpoint ist mit `CRON_SECRET` Header abgesichert — nur Supabase kennt das Secret.

---

### Service Worker & Manifest

```
public/
+-- manifest.json       (Name, Icons, Theme Color, display: "standalone")
+-- icons/
    +-- icon-192.png
    +-- icon-512.png
    +-- apple-touch-icon.png
```

SW übernimmt automatisch via next-pwa:
- Precaching aller `/app/*`-Seiten + statischer Assets
- Push-Event-Handler: zeigt Notification mit Titel, Body, Icon, Klick-URL

---

### Tech-Entscheidungen

| Entscheidung | Warum |
|---|---|
| `@ducanh2912/next-pwa` | Einziger aktiv gepflegter next-pwa Fork mit App Router Support; keine manuelle SW-Konfiguration |
| `web-push` | Standard-VAPID-Library; kein externer Push-Dienst (Firebase/OneSignal); volle Kontrolle, DSGVO-konform |
| Vercel Cron (statt Supabase Edge Function) | Bereits im Stack; einfachere Logs; kein neues Supabase-Feature aktivieren |
| JSONB für Subscription | Browser-PushSubscription ist verschachteltes Objekt — JSONB ideal, kein Schema-Mapping |
| Per-Device-Subscription | Spec fordert Multi-Gerät; jede Browser-Subscription ist geräteeinzigartig |
| iOS-Anleitung (manuell) | iOS unterstützt keinen Auto-Banner; "Teilen → Zum Home-Bildschirm"-Guide ist der einzige Weg |

### Neue Packages

| Package | Zweck |
|---|---|
| `@ducanh2912/next-pwa` | Service Worker + PWA-Manifest für Next.js App Router |
| `web-push` | Server-seitiges VAPID-Push-Senden |
| `@types/web-push` | TypeScript-Types |

## QA Test Results
_To be added by /qa_

## Deployment
_To be added by /deploy_
