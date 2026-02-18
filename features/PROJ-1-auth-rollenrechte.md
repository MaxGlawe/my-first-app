# PROJ-1: Authentifizierung & Rollenrechte

## Status: In Review
**Created:** 2026-02-17
**Last Updated:** 2026-02-17

## Dependencies
- None (Fundament für alle anderen Features)

## User Stories
- Als Admin möchte ich Therapeuten anlegen und ihnen eine Rolle (Physiotherapeut oder Heilpraktiker) zuweisen, damit die richtigen Berechtigungen automatisch greifen.
- Als Physiotherapeut möchte ich mich mit E-Mail und Passwort einloggen, damit ich sicher auf meine Patienten zugreifen kann.
- Als Heilpraktiker möchte ich nach dem Login Zugang zu erweiterten Diagnose-Funktionen haben, die einem normalen Physiotherapeuten nicht angezeigt werden.
- Als Patient möchte ich mich über die Patienten-App einloggen, damit ich meine Trainingspläne und Nachrichten sehe — aber keinen Zugang zur Therapiedokumentation habe.
- Als Admin möchte ich Nutzer deaktivieren können, ohne ihre Daten zu löschen, damit ausgeschiedene Mitarbeiter keinen Zugang mehr haben.

## Acceptance Criteria
- [ ] Supabase Auth ist eingerichtet mit E-Mail/Passwort-Login
- [ ] Rollen-Tabelle: `admin`, `heilpraktiker`, `physiotherapeut`, `patient`
- [ ] Row Level Security (RLS) auf Supabase: Jede Rolle sieht nur ihre erlaubten Daten
- [ ] Heilpraktiker-Funktionen sind server-seitig gesperrt für Physiotherapeuten (nicht nur UI)
- [ ] Admin-Panel: Nutzer anlegen, Rolle zuweisen, Nutzer deaktivieren
- [ ] Patienten können sich selbst registrieren (via Einladungslink vom Therapeuten)
- [ ] Login-Redirect: Admin → Admin-Dashboard, Therapeut → OS-Dashboard, Patient → Patienten-App
- [ ] Session-Timeout nach 8 Stunden Inaktivität (Datenschutz)
- [ ] Passwort-Reset per E-Mail funktioniert

## Edge Cases
- Was passiert, wenn ein Admin seinen eigenen Account deaktiviert? → Verhindert durch Validierung (letzter Admin kann nicht deaktiviert werden)
- Was passiert, wenn ein Therapeut seine Rolle von HP zu PT wechselt? → Bestehende Diagnosen bleiben, neue Diagnosefelder werden ausgeblendet
- Was passiert bei fehlgeschlagenen Login-Versuchen? → Nach 5 Versuchen 15-Minuten-Sperre
- Was passiert, wenn ein Patient versucht auf OS-Routen zuzugreifen? → Redirect zur Patienten-App, Fehlermeldung

## Technical Requirements
- Security: Supabase RLS auf ALLEN Tabellen — kein Bypass möglich
- Rollen werden in `user_profiles.role` gespeichert (nicht im Auth-Token allein)
- Middleware prüft Rolle bei jedem Request auf geschützten Routes
- DSGVO: Keine unnötigen Nutzerdaten im JWT-Token

---
<!-- Sections below are added by subsequent skills -->

## Tech Design (Solution Architect)
**Designed:** 2026-02-17

### Seitenstruktur & Komponenten

```
/login                          ← Öffentliche Login-Seite
+-- LoginForm
|   +-- E-Mail Eingabe
|   +-- Passwort Eingabe
|   +-- "Anmelden" Button
|   +-- "Passwort vergessen?" Link
|   +-- Fehlermeldung (falsches PW, gesperrter Account)

/login/reset-password           ← Passwort-Reset per E-Mail
+-- ResetPasswordForm

/invite/[token]                 ← Einladungslink für Patienten
+-- PatientRegistrationForm
    +-- Name, E-Mail, Passwort setzen

Nach Login — Weiterleitung je nach Rolle:
  Admin       → /os/admin/dashboard
  Therapeut   → /os/dashboard
  Patient     → /app/dashboard

/os/admin/users                 ← Nutzerverwaltung (Admin only)
+-- UserListTable (Name, E-Mail, Rolle, Status, Aktionen)
+-- NewUserButton → NewUserDialog
|   +-- NewUserForm (Name, E-Mail, Rolle)
+-- DeactivateToggle (pro Nutzer)
+-- RoleChangeDropdown (pro Nutzer)

Middleware (unsichtbar, schützt alle Routen):
- Nicht eingeloggt → /login
- Patient auf /os/* → /app/dashboard
- PT auf /os/befund/* → 403 Fehlerseite
```

### Datenmodell

**Supabase Auth** (verwaltet automatisch):
- Nutzer-ID, E-Mail, Passwort-Hash, Session-Token

**user_profiles** (eigene Tabelle):
- Verknüpft mit Auth-Nutzer-ID
- Felder: Vorname, Nachname, Rolle (admin/heilpraktiker/physiotherapeut/patient), Status (aktiv/inaktiv), letzter Login

**Row Level Security (RLS)**:
- Patientendaten → nur zugewiesener Therapeut & Admin
- Diagnosen → nur Heilpraktiker & Admin
- Behandlungsdoku → PT, HP, Admin (nicht Patient)
- Nutzerverwaltung → nur Admin

### Tech-Entscheidungen

| Entscheidung | Begründung |
|---|---|
| Supabase Auth | Login, Session, Reset, Einladungslinks fertig eingebaut |
| Rolle in eigener Tabelle | Rollenwechsel greift sofort, nicht erst beim nächsten Login |
| Next.js Middleware | Prüft jede Route serverseitig vor dem Laden |
| 4 Routen-Namespaces (/login, /os/*, /app/*, /os/admin/*) | Strikte Trennung zwischen Nutzergruppen |
| Session-Timeout 8h | DSGVO-Best-Practice für medizinische Software |

### Neue Pakete
- `@supabase/ssr` — Supabase-Auth in Next.js Server Components & Middleware

## QA Test Results
_To be added by /qa_

## Deployment
_To be added by /deploy_
