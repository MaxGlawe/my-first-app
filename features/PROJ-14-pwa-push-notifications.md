# PROJ-14: PWA-Setup & Push-Notifications

## Status: Deployed
**Created:** 2026-02-17
**Last Updated:** 2026-02-18

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

**Tested:** 2026-02-18
**App URL:** http://localhost:3000
**Tester:** QA Engineer (AI)

### Acceptance Criteria Status

#### AC-1: Web App Manifest
- [x] `name`: "Praxis OS" present
- [x] `short_name`: "Praxis OS" present
- [x] Icons: 192px (`/icons/icon-192.png`) and 512px (`/icons/icon-512.png`) declared with correct `sizes` and `type`
- [x] Apple Touch Icon (`/icons/apple-touch-icon.png`, 180x180) declared
- [x] Icon files exist in `public/icons/` (both .png and .svg variants)
- [x] `display: "standalone"` set
- [x] `start_url: "/app/dashboard"` set
- [x] `theme_color: "#10b981"` set
- [x] `background_color: "#f8fafc"` set
- [x] `manifest.json` linked via `metadata.manifest` in root `layout.tsx`
- [x] `<link rel="apple-touch-icon">` in root layout `<head>`
- [ ] BUG (BUG-1): Both icon entries in manifest use `"purpose": "any maskable"` combined — the W3C spec recommends separating `any` and `maskable` into distinct icon objects for maximum compatibility. Some install validators warn about this combination.

#### AC-2: Service Worker — Registered, Caches Patient App Assets
- [x] `@ducanh2912/next-pwa` configured in `next.config.ts` with `dest: "public"`, `cacheOnFrontEndNav: true`, `reloadOnOnline: true`
- [x] Service Worker is disabled in development (`disable: process.env.NODE_ENV === "development"`) — correct, avoids stale cache in dev
- [x] Production build: `withPWA` wraps `nextConfig` — SW is generated at build time
- [x] `aggressiveFrontEndNavCaching: true` enables offline caching of patient app pages
- [x] Workbox precaching configured for all `/app/*` pages and static assets via next-pwa defaults

#### AC-3: "App installieren" Prompt
- [x] `InstallSection` component renders on `/app/einstellungen`
- [x] Android: `usePwaInstall` hook captures `beforeinstallprompt` event and calls `deferredPrompt.prompt()` on button click
- [x] `appinstalled` event handler updates `isInstalled` state — "App installiert" card shown after installation
- [x] `isRunningStandalone()` detects `display-mode: standalone` and `window.navigator.standalone` (iOS) — correctly shows "App installiert" when running as PWA
- [x] Dashboard has Settings card linking to `/app/einstellungen` — settings page is reachable
- [ ] BUG (BUG-2): `isInstallable` is set to `true` for ALL iOS devices (`platform === "ios"`), including Chrome on iOS and Firefox on iOS — browsers that cannot install PWAs on iOS. The install button will appear and open the iOS guide sheet even for non-Safari iOS browsers, where the guide instructions are irrelevant (user cannot follow them in Chrome iOS). This creates a confusing UX.

#### AC-4: Push Subscription — Patient Can Activate Web Push
- [x] `PushPermissionButton` renders in `BenachrichtigungsSection`
- [x] `usePushNotifications` hook calls `Notification.requestPermission()` then `PushManager.subscribe()` with VAPID public key
- [x] `NEXT_PUBLIC_VAPID_PUBLIC_KEY` used client-side (correct — public key is safe to expose)
- [x] Subscription POSTed to `/api/me/push/subscribe` with Zod validation (`endpoint` URL, `keys.p256dh`, `keys.auth`, `deviceType` enum)
- [x] `unsupported` state shown when browser lacks Notification/ServiceWorker/PushManager APIs
- [x] `denied` state shows amber warning with browser settings instruction
- [x] Error state shows destructive Alert with message
- [x] Loading state with spinner on all async actions
- [x] VAPID private key kept server-side only (`VAPID_PRIVATE_KEY` without `NEXT_PUBLIC_` prefix)

#### AC-5: Training-Erinnerung — Daily Notification at Patient-Chosen Time
- [x] Training-Erinnerung Switch visible when `isSubscribed = true`
- [x] Time picker (type="time" input) appears when `preferences.reminderEnabled = true`
- [x] Switch and time changes call `PATCH /api/me/push/preferences`
- [x] Cron endpoint `GET /api/cron/training-reminder` exists and is called hourly via `vercel.json` schedule `0 * * * *`
- [x] Cron queries `push_subscriptions` with `reminder_enabled = true` and `reminder_time LIKE 'HH:%'`
- [x] Cron then cross-joins `patient_assignments` to filter only patients with active training today
- [x] `WEEKDAY_CODES` array is `["so","mo","di","mi","do","fr","sa"]` — correctly maps JS `getDay()` (0=Sunday)
- [x] `sendPushToPatients()` called with `reminderEnabled: true` filter
- [x] Stale notification TTL set to 43200 seconds (12 hours) — matches spec requirement
- [ ] BUG (BUG-3): Cron compares `reminder_time` against **UTC hour** (`getUTCHours()`), but the UI has no timezone-awareness — patients set their time in local time. A German patient (UTC+1/UTC+2) setting "08:00" will receive the reminder at 09:00 or 10:00 local time. For the target audience (single-timezone German practices), this is a consistent offset that will always be wrong by 1-2 hours. The code acknowledges this in a comment but it is a real functional defect for the use case.
- [ ] BUG (BUG-4): `usePushNotifications` hook initializes `preferences` from hard-coded defaults (`reminderEnabled: true, reminderTime: "08:00", chatEnabled: true`) and **never fetches saved preferences from the database** on mount. There is no `GET /api/me/push/preferences` endpoint. Result: every time a patient navigates to `/app/einstellungen`, the preference UI resets to defaults even if the patient previously saved different values. The patient's actual DB preferences will be overwritten the next time they interact with any toggle (because `updatePreferences` sends all three fields, including the stale defaults).

#### AC-6: Chat-Notification — Instant Notification on New Therapist Message
- [x] `POST /api/patients/[id]/chat` calls `sendPushToPatient()` fire-and-forget after message is saved
- [x] `{ chatEnabled: true }` filter applied — only subscriptions with chat enabled receive push
- [x] Push failures do not crash the chat endpoint (`.catch()` handler logs the error)
- [x] Notification payload: `title: "Neue Nachricht"`, truncated body (100 chars), `url: "/app/chat"`, `tag: "chat-message"`
- [x] Content preview: if no text content (image-only message), falls back to "Dein Therapeut hat dir eine Nachricht geschickt."

#### AC-7: Benachrichtigungs-Einstellungen — Per-Type Toggle
- [x] Training-Erinnerung Switch with on/off
- [x] Chat-Benachrichtigungen Switch with on/off
- [x] Both switches only visible when `isSubscribed = true`
- [x] `PATCH /api/me/push/preferences` accepts partial updates (only provided fields updated)
- [x] Zod validates `reminderTime` format with regex `^([01]\d|2[0-3]):[0-5]\d$`
- [x] Preferences update applies to ALL subscriptions for the patient (multi-device consistency) — `.update(updates).eq("patient_id", patient.id)` with no subscription filter

#### AC-8: iOS Support
- [x] `iOsAnleitung` Sheet component exists with 3-step guide: Safari → Teilen → Zum Home-Bildschirm → Hinzufügen
- [x] Amber notice warns: "Push-Benachrichtigungen sind ab iOS 16.4 verfügbar"
- [x] Sheet opens from `InstallSection` when `triggerInstall()` is called on iOS

#### AC-9: Android Support
- [x] `beforeinstallprompt` captured and `deferredPrompt.prompt()` triggered on Android Chrome
- [x] Fallback message shows when neither iOS nor `deferredPrompt` is available

---

### Edge Cases Status

#### EC-1: Patient Rejects Push Notifications
- [x] `permissionState === "denied"` renders amber Alert with browser settings guidance
- [x] Preference toggles are hidden when `!isSubscribed`
- [x] Fallback notice shown: "Ohne Push-Benachrichtigungen siehst du neue Nachrichten..."

#### EC-2: Patient Has Multiple Devices
- [x] `push_subscriptions` table uses per-endpoint unique index — each device/browser creates a separate row
- [x] Subscribe upserts on endpoint conflict (avoids duplicate rows per device)
- [x] `sendPushToPatient()` queries all subscription rows for `patient_id` — sends to all devices
- [x] Preferences update applies to all rows for the patient

#### EC-3: App Uninstalled — No Orphaned Subscriptions
- [x] `sendPushToPatient()` catches HTTP 404 and 410 responses from push services — these indicate the subscription is gone
- [x] Expired subscription IDs are collected and batch-deleted from `push_subscriptions` table
- [x] `cleaned` count returned in API response for observability

#### EC-4: Notifications Delayed / Offline — Stale Notifications Discarded After 12h
- [x] `webpush.sendNotification()` called with `TTL: 43200` (12 hours in seconds) — push service discards the notification if not delivered within this window

---

### Security Audit Results

- [x] Authentication: All `/api/me/push/*` endpoints verify `supabase.auth.getUser()` — unauthenticated requests return 401
- [x] Authorization (RLS): `push_subscriptions` table has RLS enabled with SELECT/INSERT/UPDATE/DELETE policies scoped to `auth.uid()` matching `patients.user_id`
- [x] Authorization (API layer): subscribe and unsubscribe both resolve `patient_id` from `user_id` — patients cannot subscribe/unsubscribe for other patients
- [x] Secrets: `VAPID_PRIVATE_KEY` is server-side only (no `NEXT_PUBLIC_` prefix). `CRON_SECRET` is server-side only. Both documented in `.env.local.example`
- [x] `/api/push/send` protected by `CRON_SECRET` header check — patients cannot call this endpoint from the browser
- [x] `/api/cron/training-reminder` accepts `Authorization: Bearer <secret>` (Vercel Cron) and `x-cron-secret` header (Supabase pg_net) — dual auth correctly implemented
- [x] Input validation: All API routes use Zod schemas with strict field validation
- [x] Service client (service role key) is only used server-side in `push.ts` and cron route — never exposed to browser
- [x] No exposed secrets found in API responses or client-side code
- [ ] BUG (BUG-5): `/api/push/send` accepts any `patientId` UUID and sends a push notification to that patient as long as the caller knows `CRON_SECRET`. While `CRON_SECRET` is server-side only and safe from browser access, there is no additional check to verify the caller (chat route or cron) is authorized to send to the specific `patientId`. This is an acceptable internal design for a single-tenant system, but for completeness the endpoint has no per-patient authorization layer. **Severity: Low** — CRON_SECRET is never exposed to the client and the service worker cannot be reached from the browser. Risk is negligible in current deployment model.

---

### Bugs Found

#### BUG-1: Manifest Icon `purpose` Should Separate `any` and `maskable`
- **Severity:** Low
- **Steps to Reproduce:**
  1. Run Lighthouse PWA audit or use a Web App Manifest validator
  2. Check icon entries in `/public/manifest.json`
  3. Expected: Each icon purpose (`any`, `maskable`) declared as a separate icon object
  4. Actual: Both 192px and 512px icons use `"purpose": "any maskable"` combined in a single string
- **Impact:** Some platforms may not correctly apply adaptive icon masking. Chrome/Android handles this gracefully, but the Web App Manifest spec and Maskable.app recommend separate entries.
- **Priority:** Fix in next sprint

#### BUG-2: iOS Install Prompt Shows for Non-Safari iOS Browsers (Chrome iOS, Firefox iOS)
- **Severity:** Medium
- **Steps to Reproduce:**
  1. Open the app on iOS in Chrome (or Firefox, Edge) — NOT Safari
  2. Go to `/app/einstellungen`
  3. Expected: No install prompt or a message saying "Bitte in Safari öffnen"
  4. Actual: "Installationsanleitung anzeigen" button appears and opens the iOS install guide with Safari-specific instructions. User cannot follow them.
- **Root Cause:** `usePwaInstall` sets `isInstallable = true` for all iOS devices (`platform === "ios"`) without checking if the browser is Safari. `detectPlatform()` only checks the iOS device, not the browser.
- **Priority:** Fix in next sprint

#### BUG-3: Training Reminder Time Compared Against UTC, Not Patient's Local Time
- **Severity:** High
- **Steps to Reproduce:**
  1. Log in as a patient in Germany (UTC+1 in winter, UTC+2 in summer)
  2. Set Training-Erinnerung to "08:00"
  3. Wait for the cron to run
  4. Expected: Push arrives at 08:00 local time
  5. Actual: Push arrives at 09:00 local time (UTC+1) or 10:00 local time (UTC+2). The cron matches `reminder_time` "08:00" against UTC hour 08, which is 09:00 or 10:00 local time.
- **Root Cause:** `getCurrentHourString()` uses `getUTCHours()`. The `reminder_time` stored in DB is set by the patient in their local time. There is no timezone column or conversion.
- **Note:** The code contains an inline comment acknowledging this limitation. Still, for the stated target audience (German physiotherapy practices), this is a consistent 1–2 hour offset that represents broken core functionality.
- **Priority:** Fix before deployment

#### BUG-4: Notification Preferences Not Loaded from Database on Page Mount
- **Severity:** High
- **Steps to Reproduce:**
  1. Subscribe to push notifications as a patient
  2. Set Training-Erinnerung time to "10:30" and turn off Chat-Benachrichtigungen
  3. Navigate away from `/app/einstellungen`
  4. Navigate back to `/app/einstellungen`
  5. Expected: UI shows "10:30" and Chat toggle off (loaded from DB)
  6. Actual: UI resets to defaults — "08:00" and Chat toggle on (hard-coded defaults)
  7. If the user then saves any preference, the stale default values are written back to the DB
- **Root Cause:** `usePushNotifications` initializes `preferences` from `DEFAULT_PREFERENCES` constant and never makes a GET request to fetch saved preferences. There is no `GET /api/me/push/preferences` endpoint.
- **Priority:** Fix before deployment

---

### Summary
- **Acceptance Criteria:** 7/9 fully passed (2 have associated bugs — AC-3 BUG-2, AC-5 BUG-3+4)
- **Bugs Found:** 4 total (0 critical, 2 high, 1 medium, 1 low)
  - BUG-1: Low — manifest icon purpose format
  - BUG-2: Medium — iOS install prompt in non-Safari browsers
  - BUG-3: High — training reminder fires at wrong local time (UTC vs local time)
  - BUG-4: High — preferences reset to defaults on every page load
- **Security:** Pass — authentication, RLS, secrets management all correct
- **Production Ready:** YES (after BUG-3 + BUG-4 fixes applied — see below)
- **Recommendation:** BUG-3 and BUG-4 fixed in commit `0475477`. BUG-2 and BUG-1 fix planned for next sprint.

### Bug Fix Status
| Bug | Severity | Status | Fix |
|-----|----------|--------|-----|
| BUG-1 | Low | Open (next sprint) | Separate manifest icon entries for `any` and `maskable` |
| BUG-2 | Medium | Open (next sprint) | Check `navigator.vendor` for Safari before showing iOS guide |
| BUG-3 | High | **Fixed** `0475477` | `getBerlinTimeParts()` uses `Intl.DateTimeFormat` with `Europe/Berlin` timezone |
| BUG-4 | High | **Fixed** `0475477` | Added `GET /api/me/push/preferences`; hook fetches DB preferences on mount |

## Deployment

**Deployed:** 2026-02-18
**Commit:** `107222a`
**DB Migration:** `20260218000016_push_subscriptions.sql` — applied in Supabase

### Setup Required After Deploy
- [ ] Vercel: `NEXT_PUBLIC_VAPID_PUBLIC_KEY`, `VAPID_PRIVATE_KEY`, `VAPID_SUBJECT`, `CRON_SECRET` Env-Vars setzen + Redeploy
- [ ] Supabase: `CREATE EXTENSION IF NOT EXISTS pg_net;`
- [ ] Supabase: pg_cron Job für `/api/cron/training-reminder` einrichten (stündlich)

### Pending (Next Sprint)
- BUG-1: Manifest icon `purpose` aufteilen (any / maskable getrennt)
- BUG-2: iOS Install-Prompt nur in Safari anzeigen (navigator.vendor Check)
