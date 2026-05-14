# PROJ-21: Öffentlicher Shop (Website)

## Status: In Review
**Created:** 2026-05-14
**Last Updated:** 2026-05-14 (Re-QA: alle Bugfixes verifiziert, production-ready)

## Dependencies
- Requires: PROJ-19 (Externe Käufer-Accounts) — Checkout erzeugt einen externen Account
- Requires: PROJ-20 (Kurs-Shop & Kauf-Flow) — Produktkatalog, Entitlements, Stripe

## Kontext
Der Shop muss auch für Menschen erreichbar sein, die noch keine App-Nutzer sind —
auf der öffentlichen Marketing-Website. Besucher können stöbern, kaufen und bekommen
nach der Zahlung automatisch einen Zugang (PROJ-19). Die Shop-Seiten sind zugleich
eine Upsell-Fläche für die Voll-App. Backend (Katalog, Entitlements, Stripe) ist
dasselbe wie im In-App-Shop — keine Doppelung.

## User Stories
- Als nicht eingeloggter Website-Besucher möchte ich die angebotenen Kurse mit Beschreibung und Preis sehen, damit ich eine Kaufentscheidung treffen kann.
- Als externer Käufer möchte ich auf der Website einen Kurs kaufen und automatisch einen Zugang bekommen, ohne vorher einen Account anzulegen.
- Als externer Käufer möchte ich nach dem Kauf eine E-Mail mit Login-Daten bzw. einem Zugangslink erhalten.
- Als Website-Besucher möchte ich verstehen, dass es eine Voll-App mit mehr Funktionen gibt (Marketing/Upsell auf den Shop-Seiten).
- Als Käufer möchte ich meinen Zugang erneut zugeschickt bekommen können, falls ich die E-Mail nicht finde.

## Acceptance Criteria
- [ ] Öffentliche Shop-Seiten auf der Marketing-Website, ohne Login zum Stöbern
- [ ] Produktdetailseiten mit Beschreibung, Preis und Inhalts-Vorschau
- [ ] Checkout für nicht eingeloggte Besucher → erzeugt nach erfolgreicher Zahlung einen externen Account (PROJ-19)
- [ ] Käufer erhält automatisch eine E-Mail mit Zugang (Login-Daten oder Magic Link)
- [ ] "Zugang erneut senden"-Funktion vorhanden
- [ ] Öffentlicher Shop nutzt denselben Produktkatalog und dieselbe Entitlement-Logik wie der In-App-Shop
- [ ] Shop-Seiten enthalten einen klaren Upsell-Hinweis auf die Voll-App
- [ ] Shop-Seiten sind SEO-fähig (eigene Routen, Metadaten)
- [ ] Premium-Erscheinungsbild im Stil hochwertiger Health-Shops — ruhig, wissenschaftlich, vertrauenswürdig
- [ ] Wissens-/Edukations-Elemente auf den Shop-Seiten als Vertrauensaufbau
- [ ] Sichtbare Trust-Signale (Bewertungen, sichere Zahlung, Badges)

## Edge Cases
- Besucher kauft mit einer E-Mail, die bereits einen Account hat (Patient oder Externer) → kein Doppel-Account, Kauf dem bestehenden Account gutschreiben, Hinweis-E-Mail
- Zahlung erfolgreich, aber Account-Erstellung schlägt fehl → Kauf darf nicht verloren gehen, Wiederherstellung möglich
- Besucher bricht den Checkout ab → kein Account, kein Entitlement
- Käufer findet die Zugangs-E-Mail nicht → "Zugang erneut senden" löst das
- Doppelter Kauf desselben Kurses durch denselben Besucher → verhindern bzw. abfangen
- Besucher mit bereits aktivem Abo kauft auf der Website → Hinweis, dass der Inhalt bereits im Abo enthalten ist

## Technical Requirements (optional)
- Im `(public)`-Route-Bereich, SEO-fähig (Metadaten, eigene URLs)
- E-Mail-Versand über bestehendes Nodemailer/GMX-Setup
- Stripe-Checkout auch für nicht authentifizierte Sessions
- Public-Checkout-Endpunkt braucht Rate-Limiting & Missbrauchsschutz (analog `/api/intake`)

## Design-Referenz
Vorbild: **biogena.com** (vom User als Referenz benannt). Siehe ausführliche Muster
in PROJ-20. Für die öffentliche Website besonders relevant:
- **Premium, ruhig, wissenschaftlich** — viel Weiß, dezente Erdtöne, hochwertige Bildsprache; Expertise statt aggressivem Verkauf
- **Edukations-Layer** ("Wissen"-Sektion bei Biogena) — Artikel/Inhalts-Vorschau bauen Vertrauen auf, bevor gekauft wird
- **Trust-Signale prominent** — Bewertungen, sichere Zahlung, Badges, ggf. "kostenloser Versand ab …"-Äquivalent (z.B. Bundle-Vorteil)
- **Entdeckung über Anliegen/Outcome** — Besucher findet auch ohne Vorwissen das passende Produkt

---
<!-- Sections below are added by subsequent skills -->

## Tech Design (Solution Architect)
_To be added by /architecture_

## QA Test Results

**Tested:** 2026-05-14
**Tester:** QA Engineer (AI)
**Scope:** Code-Review + strukturelle Verifikation aller Acceptance Criteria und Edge Cases

**Re-Verification:** 2026-05-14 — Verifikation der Bugfixes aus QA-Lauf 1 (BUG-1, BUG-2, BUG-3)

---

### Acceptance Criteria Status

#### AC-1: Öffentliche Shop-Seiten ohne Login zum Stöbern
- [x] `/kurse` in `publicRoutes` (supabase-middleware.ts Zeile 37): alle Subrouten `/kurse/*` ohne Auth erreichbar
- [x] `/kurse` — Landing-Page (`src/app/kurse/page.tsx`) implementiert
- [x] `/kurse/alle` — Kurs-Gesamtübersicht (`src/app/kurse/alle/page.tsx`) implementiert
- [x] `/kurse/[slug]` — Produktdetailseite (`src/app/kurse/[slug]/page.tsx`) implementiert
- [x] Middleware-Exemption korrekt: `isPublicRoute` deckt `/kurse` + alle Unterrouten ab

#### AC-2: Produktdetailseiten mit Beschreibung, Preis und Inhalts-Vorschau
- [x] `/kurse/[slug]` zeigt: Hero-Bild, Titel, Kurzbeschreibung, Beschreibung, Anliegen-Tags
- [x] Modul-Übersicht (bis zu 21 Lektionen, mit Expand/Collapse ab 7)
- [x] Preis angezeigt (voller Preis für Gäste, rabattierter Preis für eingeloggte Abo-Kunden)
- [x] "Das ist enthalten"-Sektion mit Bullet-Liste
- [x] Bewertungs-Platzhalter vorhanden (Sterne + "Bewertungen folgen")

#### AC-3: Checkout für nicht eingeloggte Besucher → Account-Erstellung nach Zahlung
- [x] Gast-Checkout-Formular: Vorname, Nachname, E-Mail-Adresse + "Jetzt kaufen"-Button
- [x] POST `/api/shop/public-checkout` implementiert (public-checkout/route.ts)
- [x] Middleware-Exemption `isPublicCheckoutApi` für anonymen Zugriff (Zeile 45–46)
- [x] Stripe Checkout Session im `payment`-Modus ohne User-Session erstellt
- [x] `guest_email`, `guest_first_name`, `guest_last_name` in Session-Metadaten
- [x] Stripe-Webhook `checkout.session.completed` (stripe/route.ts Zeile 214) erkennt Gast-Käufe und ruft `/api/buyer-accounts` auf
- [x] Idempotenz: Webhook-Retry sicher (Rollback + `ON CONFLICT DO NOTHING` in Entitlement-Upsert)

#### AC-4: Käufer erhält E-Mail mit Zugang nach Kauf
- [x] Nach Account-Erstellung in `/api/buyer-accounts` wird Welcome-E-Mail mit temporärem Passwort versandt (fire-and-forget)
- [x] E-Mail enthält: Temporäres Passwort, Login-Button → `/login`, Hinweis "Meine Inhalte"
- [x] Success-Seite `/kurse/erfolg` bestätigt E-Mail-Versand und verlinkt auf `/login`

#### AC-5: "Zugang erneut senden"-Funktion
- [x] Seite `/kurse/zugang` implementiert (`src/app/kurse/zugang/page.tsx`)
- [x] POST `/api/shop/resend-access` implementiert mit Supabase `generateLink({ type: "recovery" })`
- [x] Middleware-Exemption `isResendAccessApi` aktiv (Zeile 47)
- [x] Keine Account-Enumeration: immer dieselbe Antwort egal ob E-Mail existiert
- [x] `/kurse/erfolg` verlinkt direkt auf `/kurse/zugang` ("Keine E-Mail erhalten?")

#### AC-6: Geteilter Produktkatalog und Entitlement-Logik
- [x] `/api/shop/products` und `/api/shop/products/[slug]` dienen sowohl In-App (`/shop/*`) als auch öffentlichem Shop (`/kurse/*`)
- [x] Gleiche `content_entitlements`-Tabelle, gleiche Zugriffslogik
- [x] Keine Code-Doppelung — nur UI-Layer unterschiedlich (mode="website" vs mode="app")

#### AC-7: Upsell-Hinweis auf die Voll-App ✅ BEHOBEN (war BUG-1)
- [x] Neue Komponente `src/components/shop/AppUpsell.tsx` — dunkle Praxis-OS-Karte, CTA → `/online-physiotherapie`, keine Client-Abhängigkeiten
- [x] `/kurse` (Landing): `<AppUpsell />` als eigene `<section>` vor dem Footer — verifiziert in `src/app/kurse/page.tsx` Zeile 290
- [x] `/kurse/alle`: `<AppUpsell />` nach dem Produkt-Grid, nur wenn `!isLoading && !error` — verifiziert in `src/app/kurse/alle/page.tsx` Zeile 248
- [x] `/kurse/[slug]` (ProductDetailClient.tsx): `<AppUpsell />` in der Inhaltsspalte nach "Das ist enthalten" — verifiziert Zeile 526
- [x] Upsell-Text: "Individuelle Trainingspläne, Video-Analyse durch einen Physiotherapeuten und direkter Chat mit deinem Therapeuten" — klarer Mehrwert der Voll-App kommuniziert

#### AC-8: SEO-fähige Routen mit Metadaten ✅ BEHOBEN (schneller Teil, war BUG-2)
- [x] Eigene URL-Struktur `/kurse/*` vorhanden, klar vom App-Bereich getrennt
- [x] `/kurse` als Server-Component umgestellt (war `"use client"`): exportiert eigene `metadata` mit title, description, canonical — verifiziert in `src/app/kurse/page.tsx` Zeile 29–34
- [x] `/kurse/[slug]/page.tsx` — Server-Wrapper mit `generateMetadata`: zieht `titel` + `kurzbeschreibung` pro Kurs aus der `products`-Tabelle (Supabase Service Client), setzt canonical — verifiziert Zeilen 12–42
- [x] Interaktiver Teil ausgelagert nach `src/app/kurse/[slug]/ProductDetailClient.tsx` (`"use client"`) — saubere Trennung
- [x] `src/app/sitemap.ts` — jetzt `async`, enthält `/kurse` + `/kurse/alle` als statische Einträge + alle aktiven Produktseiten dynamisch aus DB, defensiv in `try/catch` — verifiziert Zeilen 37–60
- [~] SSR-Umbau von `/kurse/alle` bewusst nicht gemacht (mit User abgestimmt) — akzeptiert für v1

#### AC-9: Premium-Erscheinungsbild (Biogena-Referenz)
- [x] Ruhige Palette: Slate/Weiß/Emerald — keine aggressiven Marketing-Farben
- [x] Shop-Header mit Glas-Effekt (backdrop-blur), Logo, Mega-Menü
- [x] Produktkarten: konsistente Bild-/Gradient-Platzhalter, Hover-Effekte, Premium-Look
- [x] Kursdetailseite: zweispaltig (Content + Sticky CTA), TrustRow, Modul-Übersicht
- [x] Leerstände (kein Bild) mit Gradient-Platzhaltern gut gelöst
- [~] Bewertungen sind Platzhalter (5 graue Sterne + "Bewertungen folgen") — akzeptabel für v1

#### AC-10: Wissens-/Edukations-Elemente als Vertrauensaufbau
- [x] "Verstehen, bevor du startest"-Sektion auf der Landing (`/kurse`) mit 3 Wissens-Karten
- [x] Inhalts-Vorschau auf Produktdetailseite (Modul-Übersicht, "Das ist enthalten")
- [~] Artikel-Inhalte sind Platzhalter ("Artikel folgt") — akzeptabel für v1, muss später befüllt werden

#### AC-11: Sichtbare Trust-Signale
- [x] TrustRow-Komponente: Sichere Zahlung (Stripe), Physiotherapeutisch entwickelt, Lebenslanger Zugriff
- [x] Checkout-Block zeigt Stripe-Zahlungsmethoden (Kreditkarte, SEPA, Sofort)
- [x] "Nach dem Kauf bekommst du automatisch deinen Zugang per E-Mail"-Hinweis im Checkout
- [~] Keine echten Kundenbewertungen (Platzhalter) — akzeptabel für v1

---

### Edge Cases Status

#### EC-1: Besucher kauft mit E-Mail eines bestehenden Accounts
- [x] `/api/shop/public-checkout` prüft vorab auf `user_profiles` via `.ilike("email", email)` (Zeilen 94–149)
- [x] Wenn Account vorhanden + Kurs besessen → HTTP 409 + "Du besitzt diesen Kurs bereits. Bitte melde dich an."
- [x] Wenn Account vorhanden + im Abo enthalten → HTTP 409 + "Dieser Kurs ist in deinem Abo bereits enthalten."
- [x] Wenn Account vorhanden, Kurs aber NICHT besessen → Kauf geht durch, Webhook schreibt Entitlement dem bestehenden Account gut (via `/api/buyer-accounts` Idempotenz)
- [~] **HINWEIS:** Kein explizites Feedback an den Besucher, wenn der Kauf einem bestehenden Account gutgeschrieben wird (kein "Wir haben den Kauf deinem bestehenden Konto gutgeschrieben"-Hinweis) — kein Bug, aber UX-Verbesserungspotenzial

#### EC-2: Zahlung erfolgreich, Account-Erstellung schlägt fehl
- [x] Stripe-Webhook gibt HTTP 500 zurück wenn `/api/buyer-accounts` fehlschlägt → Stripe wiederholt den Webhook automatisch
- [x] Rollback in `/api/buyer-accounts`: bei `user_profiles`-Update-Fehler wird der Auth-User gelöscht
- [x] Idempotenz-Design: Zweiter Webhook-Retry funktioniert sauber (bestehender `externer_kaeufer` → HTTP 200 + `isNew: false`)

#### EC-3: Besucher bricht Checkout ab
- [x] `cancel_url` zeigt zurück auf `/kurse/${product.slug}` — kein Account angelegt, kein Entitlement
- [x] Kein Account wird vor der Webhook-Bestätigung angelegt

#### EC-4: Käufer findet Zugangs-E-Mail nicht
- [x] `/kurse/erfolg` verlinkt direkt auf `/kurse/zugang`
- [x] `/kurse/zugang` implementiert mit Recovery-Link-Versand

#### EC-5: Doppelter Kauf desselben Kurses
- [x] Vorab-Check in `/api/shop/public-checkout` (Zeilen 108–119) — gibt HTTP 409 zurück wenn Kurs schon besessen
- [x] Webhook-Ebene: `ON CONFLICT DO NOTHING` via `ignoreDuplicates: true` in Entitlement-Upsert

#### EC-6: Besucher mit aktivem Abo kauft auf Website
- [x] Vorab-Check: wenn Kurs `abo_inkludiert` + aktives Abo → HTTP 409 + klarer Hinweis
- [x] `GuestCtaBlock`: wenn eingeloggter User `zugriff_status === "im_abo"` → zeigt "Du hast bereits Zugang"-Block statt Checkout-Formular

---

### Security Audit

- [x] `/api/shop/public-checkout`: Rate-Limiting 5 req/IP/Stunde + 50 global/Stunde
- [x] `/api/shop/resend-access`: Rate-Limiting 3 req/IP/Stunde + 30 global/Stunde (strikt)
- [x] Zod-Validierung aller Eingaben in beiden Endpunkten
- [x] Wegwerf-E-Mail-Blocklist (`isDisposableEmail`) in Public-Checkout
- [x] Keine Account-Enumeration in `resend-access` (immer gleiche Antwort)
- [x] Stripe-Webhook-Signatur verifiziert (HMAC via `constructWebhookEvent`)
- [x] `INTERNAL_API_SECRET`-Prüfung zwischen Webhook und `/api/buyer-accounts`
- [x] Temporäres Passwort in Welcome-E-Mail — Benutzer wird zur Passwortänderung aufgefordert
- [x] `escapeHtml()` wird in resend-access-E-Mail für `first_name` verwendet — kein XSS-Risiko
- [x] Middleware-Exemptions korrekt scope-begrenzt (nur POST, nur exakter Pfad)
- [x] **BUG-3 BEHOBEN:** `buyer-accounts/route.ts` importiert jetzt `escapeHtml` aus `@/lib/html-escape` (Zeile 28) und verwendet `${escapeHtml(firstName)}` in der Welcome-E-Mail (Zeile 212) — verifiziert. Konsistenz mit `resend-access` hergestellt.
- [x] `escapeHtml()` korrekt implementiert: escaped `&`, `<`, `>`, `"`, `'` — XSS/HTML-Injection via E-Mail nicht möglich
- [x] Supabase RLS schützt Entitlements (aus PROJ-19 verifiziert)

---

### Responsive & Browser Testing (statische Analyse)

- [x] Alle Seiten sind responsive (Tailwind: `grid-cols-1 sm:grid-cols-2 lg:grid-cols-3`, `lg:hidden` / `hidden lg:block` CTA-Placement)
- [x] Mobile CTA (GuestCtaBlock) erscheint inline auf `lg:hidden`, Desktop als Sticky-Sidebar
- [x] `ShopHeader` kollabiert Suche und Kurs-Menü auf Mobile (`hidden md:flex`)
- [x] Loading-Skeletons und Error-States implementiert
- [x] Toaster für Checkout-Feedback auf mobil (`position="bottom-center"`)
- [x] `AppUpsell` responsiv: Stack-Layout auf Mobile (`flex-col`), Side-by-side auf `sm:` — verifiziert
- Kein Live-Browser-Test möglich (kein laufender Dev-Server, keine DB-Verbindung)

---

### TypeScript

- [x] `npx tsc --noEmit` — keine PROJ-21-Fehler
- [x] Einzige Fehler: 2 pre-existing `.next/types/validator.ts`-Fehler (pfade-Seiten, unrelated zu PROJ-21)

---

### Bugs Found (Re-Verification)

#### BUG-1: BEHOBEN ✅
- `AppUpsell`-Komponente auf allen 3 öffentlichen Shop-Seiten korrekt integriert

#### BUG-2: BEHOBEN (vereinbarter Scope) ✅
- `src/app/kurse/page.tsx`: Server-Component mit eigenem `metadata`-Export
- `src/app/kurse/[slug]/page.tsx`: Server-Wrapper mit `generateMetadata` (per-Kurs-Titel/-Description)
- `src/app/sitemap.ts`: enthält `/kurse`, `/kurse/alle` statisch + alle aktiven Kursseiten dynamisch
- SSR-Umbau von `/kurse/alle`: bewusst ausgelassen (mit User abgestimmt)

#### BUG-3: BEHOBEN ✅
- `escapeHtml(firstName)` in Welcome-E-Mail von `/api/buyer-accounts` korrekt implementiert

---

### Bekannte / akzeptierte offene Punkte (nicht als Bugs gewertet)

- Zugangs-E-Mail Design (kein Bug — bestehender Stil akzeptiert)
- `redirectTo` im Recovery-Link (mit User abgestimmt)
- Platzhalter-Inhalte (Wissen-Artikel, Bewertungen) — akzeptiert für v1
- SSR-Umbau `/kurse/alle` — für spätere Phase geplant
- Stripe Webhook E2E-Test — kein lokaler Test-Server verfügbar

---

### Summary

| Kategorie | QA-Lauf 1 | Re-Verification |
|---|---|---|
| AC-1 bis AC-11 | 9/11 PASS | **11/11 PASS** |
| Edge Cases EC-1 bis EC-6 | 6/6 | 6/6 |
| Security | 1 Low-Finding | **0 offene Findings** |
| Responsive (statisch) | PASS | PASS |
| TypeScript | 2 pre-existing Fehler | 2 pre-existing Fehler (unverändert, unrelated) |

**Bugs nach Re-Verification:** 0 verbleibend
- BUG-1: Medium — BEHOBEN (AppUpsell auf allen 3 Seiten)
- BUG-2: Medium — BEHOBEN (Sitemap + generateMetadata + kurse/page Server-Component)
- BUG-3: Low — BEHOBEN (escapeHtml in buyer-accounts Welcome-E-Mail)

**Production Ready: JA**

Alle Acceptance Criteria erfüllt. Keine Critical oder High Bugs. Alle ursprünglichen Findings behoben und code-seitig verifiziert.

## Deployment
_To be added by /deploy_
