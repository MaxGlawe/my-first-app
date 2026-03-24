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
    landing-bgf/         BGF landing page sections (/unternehmen)
    landing/             Main landing page sections
    hausaufgaben/        Homework assignment components
    intake/              Intake form components
  hooks/                 Custom React hooks (use-bgf-membership, use-hr-auth, etc.)
  lib/                   Utilities
    bgf-tiers.ts         BGF tier feature gating (hasFeature, BgfFeature enum)
    bgf-tier-guard.ts    Server-side tier access guard (requireTierAccess)
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

## BGF Tier System

Three pricing tiers with feature gating (src/lib/bgf-tiers.ts):

| Feature | Basic (29€) | Pro (39€) | Enterprise (59€) |
|---|---|---|---|
| Pausen-Fit, Check-In, Ergonomie, Hydration, Streaks | ✓ | ✓ | ✓ |
| Ist-Analyse, HR-Dashboard, Chat, Team-Puls, Ziel-Tracking | ✗ | ✓ | ✓ |
| Quartals-Reports, Dedizierter Therapeut, Zusatzleistungen | ✗ | ✗ | ✓ |

- **Server guard:** `requireTierAccess(orgId, BgfFeature.X)` in API routes
- **Frontend gate:** `<TierGate>` for sections, `<TierLockedPage>` for full pages
- **Hooks:** `useBgfMembership()` and `useHrAuth()` return `vertragTier`

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
