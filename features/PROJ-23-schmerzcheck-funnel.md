# PROJ-23: Schmerzcheck-Funnel (B2C Akquise)

## Status: In Progress
**Created:** 2026-05-21
**Last Updated:** 2026-05-22 (Phase 1 implementiert)

## Kontext
B2C-Akquise-Funnel für kalten Meta-Paid-Traffic. Vorbild war akquise.de
(Gratis-Lead-Magnet). Maßgebliche Spezifikation: externe Datei
`schmerzcheck-system-spec.md` (v2.0) + visuelle Vorlage `schmerzcheck-landing.html`.

Der vollständige Funnel: Meta-Ad → Landing `/schmerzcheck` → 15-Item-Schmerzcheck
→ personalisierter Schmerz-Report (Web + PDF + Mail) → 5-teilige E-Mail-Strecke →
Video-Analyse (69 €, Tripwire) → App/Challenge.

**HWG-kritisch:** „Orientierung statt Outcome". Verbotene Vokabeln (heilt,
schmerzfrei, garantiert, …) dürfen auf keiner Oberfläche erscheinen
(Build-Check). Red-Flag-User werden später komplett aus dem Funnel genommen.

## Stack-Anpassung gegenüber der externen Spec
Die Spec ist gegen einen generischen Stack geschrieben. Umsetzung auf den
realen Praxis-OS-Stack:
- Eine Next.js-16-App (kein Monorepo) → `src/app/schmerzcheck/*`, `src/app/api/*`
- **Supabase + RLS** statt rohem PG/Prisma
- Bestehender In-Memory-Ratelimiter statt Redis
- **Brevo** für Funnel-Mails (separat von GMX/Nodemailer der Praxis)
- jsPDF (Phase 3) statt Puppeteer/@react-pdf
- Meta-Pixel/CAPI neu gebaut

## Entscheidungen (fixiert mit dem Owner, 2026-05-21)
- Scope-Reihenfolge: **Phase 1 zuerst** (Landing + Lead-Capture + T1).
- E-Mail Phase 1: **eigenes SiteGround-Postfach** `info@physiotherapie-glawe.de`
  via SMTP/Nodemailer (Owner-Entscheidung 2026-05-22, statt Brevo — Kosten
  vermeiden). Ein echter ESP (Brevo Free-Tier/Resend) erst für die Phase-4-Drip
  empfohlen. Der Brevo-Wrapper (`src/lib/brevo.ts`) bleibt ungenutzt liegen.
- Klinische Inhalte: **Spec-Defaults + `[TBD by Max]`-Platzhalter**.
- Video-Analyse-Upsell: **Link auf bestehenden externen Kalender** (kein Eigenbau).
- Formular: **nur Vorname + E-Mail**.
- Tracking: **Meta-Pixel + CAPI (server-seitig)**.
- Social-Proof-Zahl ("1.247 …"): **vorerst weggelassen** (keine erfundene Zahl).
- Einwilligung: **Double-Opt-in** — der T1-Link bestätigt die Einwilligung.

---

## Phase 1 — Landing + Lead-Capture (DIESE LIEFERUNG)

### User Stories
- Als Meta-Besucher möchte ich auf einer fokussierten Seite verstehen, was der
  Schmerzcheck ist, und mit Vorname + E-Mail starten.
- Als Lead möchte ich eine Bestätigungs-E-Mail mit dem Check-Link bekommen.
- Als Praxis möchte ich Leads inkl. Attribution (UTM/fbclid) erfassen und
  Conversions in Meta messen (Pixel + CAPI), bei DSGVO-konformem Double-Opt-in.

### Acceptance Criteria (Phase 1)
- [x] Route `/schmerzcheck` (öffentlich, `noindex`), visuell nach `schmerzcheck-landing.html`
- [x] Copy wortgleich aus Spec §4.4 — **ohne** Social-Proof-Zahl
- [x] Formular Vorname + E-Mail mit Honeypot + Submit-Timing-Check
- [x] `POST /api/leads/schmerzcheck`: Zod, Ratelimit (5/IP/h + 50/h global),
      Disposable-Block, Lead-Upsert (Supabase, RLS), UTM/fbclid/Referrer persistiert
- [x] Signiertes Lead-Token (HS256, `LEAD_LINK_SECRET`)
- [x] T1-Welcome-Mail via SiteGround-SMTP (Nodemailer), Link = Double-Opt-in-Confirm
- [x] `GET /api/leads/schmerzcheck/confirm`: bestätigt Einwilligung
      (`consent_status=confirmed`), Redirect auf `/schmerzcheck/bestaetigt`.
      Phase-4-Drip liest später bestätigte, nicht-gesperrte Leads aus der DB.
- [x] Meta-Pixel (Browser, `Lead` + `PageView`) + Conversions API (server-seitig,
      gehashte E-Mail), Dedup über gemeinsame `eventId`
- [x] HWG-Disclaimer im Footer (verbatim §4.4)
- [x] HWG-Forbidden-Vocab-Build-Check (`npm run hwg:check`)
- [x] Mobile: Formular über dem Visual (<lg)

### Geänderte/Neue Dateien (Phase 1)
- `supabase/migrations/20260521000001_schmerzcheck_leads.sql` (leads, email_events, unsubscribes + RLS)
- `src/lib/lead-jwt.ts`, `src/lib/meta-capi.ts` (`src/lib/brevo.ts` ungenutzt, für Phase 4)
- `src/lib/schmerzcheck/{forbidden-vocab,emails,mailer}.ts`
- `src/app/api/leads/schmerzcheck/route.ts` + `confirm/route.ts`
- `src/app/schmerzcheck/{layout,page}.tsx` + `bestaetigt/page.tsx`
- `src/components/schmerzcheck/{LeadForm,MetaPixel,HeroVisual,SpineDiagram,StackVisuals}.tsx`
- `src/lib/supabase-middleware.ts` (Public-Routen-Exemptions)
- `scripts/check-hwg-vocab.mjs`, `package.json` (hwg:check), `.env.local.example`

### Benötigte Env-Variablen (vom Owner einzutragen)
`LEAD_LINK_SECRET`, `SCHMERZCHECK_SMTP_{HOST,PORT,USER,PASS,FROM_NAME,FROM_EMAIL}`
(SiteGround-Postfach), `NEXT_PUBLIC_META_PIXEL_ID`, `META_PIXEL_ID`,
`META_CAPI_TOKEN`. Ohne diese Keys laufen Mail/Tracking im No-Op (Lead wird
trotzdem gespeichert).

### Offen / bewusst verschoben
- Echte Unsubscribe-Endpoint (1-Klick) → Phase 4 (aktuell Mailto im Footer)
- Authority-Portrait (Platzhalter-Monogramm „M") — bis echtes Foto vorliegt

---

## Phase 2 — Schmerzcheck (15 Items, Red-Flag-Routing) — ✅ implementiert (2026-05-22)

**Scope:** Check-Flow + Red-Flag + Scoring (ohne Report — der ist Phase 3).

### Geliefert
- Migration `20260522000001_schmerzcheck_check.sql`: `schmerzcheck_responses` + `schmerzcheck_results` (RLS, Indizes). **Eingespielt.**
- 15 Items (`src/lib/schmerzcheck/check-items.ts`) — Spec-Defaults, **klinische Freigabe durch Max ausstehend**.
- Red-Flag + Scoring (`src/lib/schmerzcheck/scoring.ts`): Hard/Soft-Flag, Severity/Chronicity/Psychosocial/Movement → `result_category`.
- API: `GET /api/check/state`, `POST /api/check/answer` (Auto-Save + sofortiger Red-Flag-Stop + T3-Mail), `POST /api/check/complete` (Scoring → results-Row). Token-gated (HS256).
- T3-Red-Flag-Mail (verbatim §7.4) in `emails.ts`; `routeToRedFlag` in `check-store.ts`.
- Frontend `src/app/check/{layout,start,q/[step],red-flag-stop,processing}` + Komponenten `src/components/schmerzcheck/check/{CheckShell,QuestionRenderer,StartClient,QuestionClient}`. Eine Frage/Screen, Fortschritt, Auto-Save, Zurück/Weiter, Resume.
- DOI-Confirm-Link führt jetzt auf `/check/start?t=` (statt `/schmerzcheck/bestaetigt`).
- Middleware: `/check` öffentlich + `/api/check/*` exemptet.

### Verifiziert (2026-05-22, lokal gegen DB)
- `tsc --noEmit` = 0, Production-Build grün (332 Seiten), `hwg:check` grün.
- Normaler Durchlauf (15 Antworten) → `severity_score 5.20 · high · subacute · chronic_severe · soft_flag false` korrekt persistiert.
- Red-Flag (rf_cauda_equina) → Lead `red_flag_routed`, Result `red_flag_stopped` + codes, **T3 `sent`**, kein Drip. Test-Daten danach bereinigt.

### Offen
- Klinische Freigabe der 15 Items + Soft-Flag-Schwellen durch Max (§14 #5/#14).
- Bei Vollständigkeits-Logik: alle 15 Items required (kein Skip).

## Phase 3 — Schmerz-Report (Web + PDF + T2) — ✅ implementiert (2026-05-22)

- Empfehlungs-Engine `recommendations.ts` (§6.5 verbatim, CTA-Typ booking/roadmap/info, Video-Analyse-URL env-overridable).
- Bewegungsmodule `movement-modules.ts` (§6.6, 3/Region, Fallback) — Inhalte [TBD by Max].
- Report-View-Model `report.ts` (HWG-safe, geteilt von Web + PDF).
- Web-Report `src/app/check/result/page.tsx` (6 Sektionen, Disclaimer oben+Footer, SpineDiagram mit `focusRegion`, PDF-Link).
- PDF `report-pdf.ts` (jsPDF, Helvetica v1) + `GET /api/check/report.pdf` (token-gated, Stream).
- T2-Mail (§7.4 verbatim) in `emails.ts`, Mailer mit Attachments; in `/api/check/complete` T2 mit PDF-Anhang + Web-Link (fire-and-forget). `/check/processing` verlinkt jetzt direkt auf den Report.
- **Verifiziert (2026-05-22):** tsc/build (334 Seiten)/hwg grün; E2E: complete → result_category persistiert, `/check/result` rendert alle Sektionen, `report.pdf` liefert valides PDF (10.876 B, `%PDF-1.3`), **T2 `sent`** mit PDF-Anhang über SiteGround. Test-Daten bereinigt.
### Report v2 — Ampel + Barometer (2026-05-22, nach Owner-Feedback)
Report war zu generisch → individueller, visueller, arzttauglicher + verkaufsorientierter.
- `ampel.ts`: Gesamt-Ampel (rot/gelb/gruen) + 3 Barometer-Dimensionen **Schmerz / Beweglichkeit / Stress** (je 0–100 Health + Band + individueller Satz). Farben emerald-500/amber-400/red-500 (konsistent zu PROJ-17).
- `Barometer.tsx`: horizontale Skala (links rot → rechts grün, Marker an Position).
- Report-Seite v2: Gesamt-Ampel-Hero (Ampel-Lichter), 3 Barometer, region-fokussiertes Spine, band-abhängige 7-Tage-Strategie + Empfehlung, **Praxis-OS-Verkaufsblock** (Video-Analyse/App/Chat → /online-physiotherapie), `ReportCta` feuert Meta `InitiateCheckout` (stärkeres Tracking, v. a. bei Rot).
- PDF v2: Ampel-Balken + Sätze. `answers` an buildReportView in `/check/result`, `/api/check/report.pdf`, `/api/check/complete`.
- Verifiziert: E2E → Gesamtbild Rot, Barometer rendern, PDF 16,8 KB valide.
### Report/PDF v3 (2026-05-22, Owner-Feedback „Link schwach")
- PDF redesign: Emerald-Header-Band, Times-Italic-Serifen-Akzente, Ampel-Strip + Barometer-Chips, **klickbarer CTA-Button** (jsPDF `doc.link`/`textWithLink`, absolute URL → User wird weitergeleitet) + klickbarer Praxis-OS-Link. `baseUrl` an `generateReportPdf`. Verifiziert: 3 `/URI`-Annotationen im PDF.
- Web: kräftigere CTAs (`ReportCta` solid Gradient für booking+roadmap), premiumere Section-Typo.
- Feinschliff (Owner-Feedback): PDF-Überschriften-Abstände (Eyebrow→Headline) korrigiert; echtes **Praxis-Glawe-Logo** im PDF-Header eingebettet (auf weißer „Münze", mit Transparenz, `compress: true` → PDF ~38 KB statt ~1 MB) **und in allen E-Mails** (inline via CID-Attachment, `LOGO_CID` in mailer.ts → zeigt auch bei geblockten externen Bildern); Titel überall „**Heilpraktiker für Physiotherapie**" statt „Sektoraler…" (Impressum bleibt rechtlich präzise). `maxglawe.webp` (Portrait) liegt bereit, falls Authority-Foto gewünscht.
- Offen: echtes Inter/Cormorant-Embedding im PDF (v3 nutzt Built-in helvetica+times), Wissenskarten-/Modul-Inhalte (Max), klinische Freigabe Items/Schwellen.

## Phase 4 — E-Mail-Drip, Unsubscribe, Admin — ✅ implementiert (2026-05-22)

- **Drip D1–D4** (`renderDripEmail` in emails.ts, Subjects §7.2, HWG-safe Platzhalter-Bodies [TBD by Max]) + Cron `/api/cron/schmerzcheck-drip` (CRON_SECRET): pro Lead **eine fällige, ungesendete, zulässige Stufe pro Lauf** (Offsets +1/+3/+5/+7 Tage ab completed_at), Cap 100/Lauf.
- **Exclusions §7.3:** Red-Flag nie enrolled (kein completed result); Unsubscribed suppressed; Soft-Flag/needs_physician_assessment **überspringt D3** (Video-Pitch). D4 ohne Booking-CTA bei Soft-Flag.
- **1-Klick-Unsubscribe**: `GET /api/email/unsubscribe?u=<token>` → `schmerzcheck_unsubscribes` (email_hash) + Event, Seite `/schmerzcheck/abgemeldet`. Footer-Link in T2 + allen Drip-Mails (`shell` unsubscribeUrl). Cron prüft Suppression vor Versand.
- **Admin-Funnel**: `GET /api/admin/schmerzcheck/funnel` (staff-auth) + Seite `/os/admin/schmerzcheck` (Stage-Counts, Kategorien, E-Mail-Versand, letzte Leads).
- Middleware: `/api/email/unsubscribe` exemptet.
- **Verifiziert (2026-05-22):** Cron→D1 sent (1/Lauf), Unsubscribe→Suppression greift (Lauf 2 sent:0), Admin-API ohne Auth geblockt. tsc/build/hwg grün.
- **„Raus aus Drip nach Buchung": ✅ implementiert (2026-05-22).** Der bestehende Buchungs-Webhook (`/api/webhooks/booking`) ruft bei `patient.created` und gebuchtem `appointment.scheduled` `stopSchmerzcheckDrip(email)` (in check-store.ts) → passender Lead landet auf der Suppression-Liste (`reason: "booked"`), der Drip-Cron überspringt ihn. E2E verifiziert (signierter Webhook → Suppression gesetzt → Cron sent:0).
- **Offen:** Event-level Analytics über Funnel-Counts hinaus. **Cron-Scheduler** muss in Prod eingerichtet werden (Supabase pg_cron/externer Trigger ruft `/api/cron/schmerzcheck-drip` ~täglich). Drip-Texte D1–D4 sind v1 (verfeinerbar).

## Phase 5 — Soft-Launch (warme Liste) vor Paid-Spend — geplant

> Klinische Inhalte (Items, Übungsmodule, Drip-Texte) brauchen Freigabe durch
> Max Glawe (sektoraler HP) — siehe Spec §14.

## QA Test Results
_To be added by /qa_

## Deployment
_Kein Deploy ohne ausdrückliche Freigabe (siehe CLAUDE.md). Lokal testen zuerst._
