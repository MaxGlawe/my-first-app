# Praxis OS

> Ganzheitliches Praxismanagementsystem für Physiotherapie + B2B Betriebliche Gesundheitsförderung (BGF).

## Tech Stack

- **Framework:** Next.js 16 (App Router), TypeScript
- **Styling:** Tailwind CSS + shadcn/ui (copy-paste components)
- **Backend:** Supabase (PostgreSQL + Auth + Storage + RLS)
- **Payments:** Stripe (Subscriptions, SEPA, Invoicing)
- **AI:** Claude API (Anthropic) — Arztberichte, Kurse, Pausen-Fit, Quartals-Reports
- **TTS:** ElevenLabs API — Traumreisen, Übungsvorlesen
- **Email:** Nodemailer + GMX SMTP (Port 587, STARTTLS)
- **PDF:** jsPDF — Verträge, Rechnungen, BGF-Reports
- **Push:** Web Push (VAPID) via service worker
- **Deployment:** Hetzner CX23 (Ubuntu 24.04) + PM2 + Nginx
- **Validation:** Zod + react-hook-form
- **State:** React useState / Context API

## Project Structure

```
src/
  app/                   Pages (Next.js App Router)
    (public)/            Public pages (Landing, Anfrage, SEO)
    app/                 Patient-App (Dashboard, Training, Chat, BGF)
    hr/                  HR-Portal (BGF Dashboard, Mitarbeiter, Reports)
    os/                  Therapeuten-OS (Patienten, Übungen, Behandlungen)
    os/bgf/              BGF-Verwaltung (Organisationen, Mitglieder, Rechnungen)
    api/                 API Routes
      bgf/               BGF API (Orgs, Members, Ist-Analyse, Pausen-Fit, Team-Puls)
      cron/              Cron Jobs (Training-Reminder, BGF-Invoicing, Quarterly-Reports)
      admin/             Admin APIs (Users, Billing, Contracts, BGF-Invoices)
      webhooks/          Webhooks (Stripe, Booking-System)
  components/
    ui/                  shadcn/ui components (NEVER recreate these)
    bgf/                 BGF components (Dashboard, Onboarding, Pausen-Fit, TierGate)
    bgf-contracts/       BGF contract components
    landing/             Main landing page sections
    landing/bgf/         BGF landing page sections (/unternehmen)
    hausaufgaben/        Homework assignment components
    intake/              Intake form components
  hooks/                 Custom React hooks (use-bgf-membership, use-hr-auth, etc.)
  lib/                   Utilities
    email.ts             Email sending via nodemailer
    rate-limit.ts        In-memory rate limiter
    supabase.ts          Supabase browser client
    supabase-server.ts   Supabase server client (with cookies)
    supabase-service.ts  Supabase service client (bypasses RLS)
    supabase-middleware.ts  Auth middleware (role checks, paywall, etc.)
    pdf/                 PDF generators (contracts, invoices, bgf-reports)
  types/                 TypeScript types (bgf.ts, bgf-contract.ts, bgf-invoice.ts, etc.)
features/                Feature specifications (PROJ-X-name.md)
  INDEX.md               Feature status overview
supabase/
  migrations/            Database migrations (RLS, tables, indexes)
docs/
  PRD.md                 Product Requirements Document
```

## Deployment

- **Server:** root@46.225.181.221 (Hetzner CX23, Ubuntu 24.04)
- **Domain:** wwwpraxis-os.com (Cloudflare DNS)
- **Deploy:** `ssh root@46.225.181.221 "cd /var/www/praxis-os && git pull origin main && npm run build && pm2 restart praxis-os"`
- **Logs:** `ssh root@46.225.181.221 "pm2 logs praxis-os --lines 50 --nostream"`
- **IMPORTANT:** Server has TWO env files: `.env.local` AND `.env.production.local` — both must be updated for config changes
- **IMPORTANT:** Never deploy without explicit user confirmation. Test locally first.

## Build & Test Commands

```bash
npm run dev        # Development server (localhost:3000)
npm run build      # Production build
npm run lint       # ESLint
npx tsc --noEmit   # TypeScript check (run before deploying)
```

## Key Conventions

- **Feature IDs:** PROJ-1 through PROJ-18 (sequential), next: PROJ-19
- **Commits:** `feat(PROJ-X): description`, `fix(PROJ-X): description`
- **shadcn/ui first:** NEVER create custom versions of installed shadcn components
- **German UI:** All user-facing text in German
- **RLS:** Every Supabase table has Row Level Security enabled
- **Validation:** Zod schemas on all API inputs
- **Auth:** supabase-middleware.ts handles role checks, paywall, deactivation

## BGF Pricing: EIN Produkt, Staffel nach Teamgröße

Seit 30.07.2026 gibt es **kein Feature-Gating mehr**. Jede Organisation bekommt den
Vollumfang (Therapeut, Chat, Ist-Analyse, HR-Dashboard, Team-Puls, Ziel-Tracking,
Quartals-Reports); der Preis richtet sich nur nach der Teamgröße.

- **Preis-Quelle (einzige!):** `src/lib/bgf-pakete.ts` — 390 € bis 10 MA, 590 € bis 20,
  890 € bis 35, 1.190 € bis 50, darüber individuell. Genutzt von Landing (`BgfPricingSection`,
  `BgfRoiCalculator`, `BgfContactForm`), Vertrags-API, Vertrags-PDF und Invoicing.
  Das Paket-Label muss zwischen Pricing-Sektion und Kontaktformular identisch bleiben,
  sonst greift die Vorauswahl per `?modell=` nicht.
- **Entfernt:** `lib/bgf-tiers.ts`, `lib/bgf-tier-guard.ts`, `components/bgf/TierGate.tsx`,
  `components/bgf/TierLockedPage.tsx` sowie alle `requireTierAccess`-Aufrufe.
  Quartals-Report-Cron filtert nicht mehr auf `vertrag_tier = enterprise`.
- **Verträge & Rechnungen:** `bgf_contracts.paket_max_ma` + `paket_label`,
  `monatlicher_gesamtpreis` = Paket-Festpreis; `preis_pro_ma_monat` ist Altlast (neue
  Verträge schreiben NULL), `contract_type = 'voll'`. Rechnungen tragen `paket_label`,
  `preis_pro_ma` NULL. Vertrags-PDF, Rechnungs-PDF und Signatur-Ansicht rendern
  **beide Welten**: `paket_label`/`contract_type='voll'` → Paketdarstellung, sonst die
  alte Tarif-/Pro-Kopf-Darstellung (Bestandsverträge bleiben reproduzierbar).
- **Nachbesetzungen:** Köpfe über der Paketgrenze kosten den Kopfpreis ihrer Staffel
  (`proMaZusatz`: 39 / 29,50 / 25,50 / 24 €), gedeckelt durch die **Bestpreis-Regel** —
  sobald ein größeres Paket günstiger ist, gilt dieses (Vertrag §4 Abs. 4/4a).
  Berechnung ausschließlich über `berechneMonatsbetrag()` in `lib/bgf-pakete.ts`;
  Rechnungslauf zählt dafür `organization_members` mit `status='aktiv'` und schreibt
  `zusatz_ma_anzahl`/`zusatz_ma_preis` als zweite Rechnungsposition.
- **Migrationen:** `20260730000001_bgf_paketpreise.sql` (Paketfelder) und
  `20260730000002_bgf_nachbesetzung_kopfpreis.sql` (Kopfpreis + Rechnungsposition),
  beide idempotent. Ohne sie schlagen neue Verträge/Orgs fehl (Spalten +
  CHECK-Constraint für `'voll'`).
- **Altverträge NICHT anfassen:** `paket_max_ma`/`paket_label` bleiben dort NULL. Ein
  abgeleitetes Label würde einem 50 × 39 € = 1.950 €-Vertrag das Paket „bis 50"
  (Listenpreis 1.190 €) zuschreiben und dem gespeicherten Vertragstext widersprechen.

## Claude API Gotchas (IMPORTANT)

- **tool_use with German text:** Claude writes `„Wort"` where closing `"` is ASCII U+0022, breaks JSON.parse. Use `repairAndParseJson()`.
- **tool_use nested arrays as strings:** SDK sometimes returns arrays as JSON strings. Always use `coerceArray()`.
- **tool_use XML tag leakage:** Claude Haiku sometimes injects XML-like tags (`</zusammenfassung>`) into tool_use output. Strip with regex: `.replace(/<\/?[a-z_]+(?:\s[^>]*)?>/gi, "")`.
- **max_tokens:** 16384 for curriculum generation, 4096 for reports.

## Security Notes

- `/api/intake` is public (no auth) — protected by rate limiting (2/min/IP + 20/hr global), honeypot fields, timing check, disposable email blocklist
- All other API routes require authentication via supabase-middleware.ts
- Cron routes protected by CRON_SECRET header
- Webhook routes verify HMAC-SHA256 signatures

## Feature Overview

@features/INDEX.md

## Product Context

@docs/PRD.md
