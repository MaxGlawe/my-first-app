# PROJ-14: PWA-Setup & Push-Notifications

## Status: Planned
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
_To be added by /architecture_

## QA Test Results
_To be added by /qa_

## Deployment
_To be added by /deploy_
