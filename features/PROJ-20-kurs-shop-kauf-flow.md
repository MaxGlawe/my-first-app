# PROJ-20: Kurs-Shop & Kauf-Flow (In-App)

## Status: In Progress
**Created:** 2026-05-14
**Last Updated:** 2026-05-14

## Dependencies
- Requires: PROJ-19 (Externe Käufer-Accounts) — Käufer-Typ & Entitlement-Träger
- Requires: PROJ-1 (Authentifizierung & Rollenrechte)
- Baut auf dem bestehenden 21-Tage-Kurs-Feature auf (`learning_paths` & zugehörige Tabellen)

## Kontext
Das Herzstück des Shops: ein **erweiterbarer Produktkatalog** (Shopify-Vorbild) plus
Kauf- und Zugriffs-Logik. v1 verkauft die 4 bestehenden 21-Tage-Kurse, ist aber so
gebaut, dass jederzeit neue Inhalte und Produkttypen (größere Programme,
Masterclasses, Traumreisen) ohne Code-Änderung dazukommen können. Abo-Kunden
bekommen die im Abo enthaltenen Kurse gratis; Nicht-Abo-Kunden kaufen einzeln.

## User Stories
- Als App-Nutzer ohne Abo möchte ich Kurse im Shop durchstöbern und einzeln kaufen, damit ich gezielt relevante Inhalte freischalte.
- Als Abo-Kunde möchte ich sehen, dass die im Abo enthaltenen Kurse für mich kostenlos freigeschaltet sind, ohne einen Kauf zu tätigen.
- Als Käufer möchte ich nach dem Stripe-Kauf sofort Zugriff auf den Kurs haben.
- Als Admin möchte ich neue Produkte (Kurse, größere Programme, Masterclasses) jederzeit anlegen und bepreisen können — ohne Deployment.
- Als Abo-Kunde möchte ich auf Masterclasses einen Rabatt bekommen (nicht gratis, aber vergünstigt).
- Als Käufer möchte ich Kurse nach Anliegen/Ziel durchstöbern (Rücken, Schmerz, Stress, Faszien …), nicht nur nach Produkttyp, damit ich schnell finde, was zu meinem Problem passt.
- Als Erstkäufer möchte ich kuratierte Bundles kaufen können (z.B. ein Komplettpaket aus mehreren Kursen), damit mir die Auswahl abgenommen wird.

## Acceptance Criteria
- [ ] Es gibt einen Produktkatalog mit Preis, Produkttyp/Tier (Kurs / Programm / Masterclass) und Verknüpfung zum Inhalt
- [ ] Neue Produkte und Produkttypen können datengetrieben angelegt werden, ohne Code-Deployment
- [ ] Stripe-Einmalkauf-Flow funktioniert in der App; nach erfolgreichem Webhook ist der Inhalt sofort freigeschaltet
- [ ] Ein Entitlement-Modell hält fest, wer welchen Inhalt besitzt, inkl. Quelle (Einzelkauf vs. Abo-Freischaltung)
- [ ] Abo-Kunden sehen abo-inkludierte Kurse als freigeschaltet, ohne Kauf
- [ ] Masterclass-Produkte zeigen Abo-Kunden einen rabattierten Preis
- [ ] Einzelkäufe gewähren lebenslangen Zugriff; Abo-Freischaltungen enden mit dem Abo
- [ ] Der Zugriffs-Check (darf dieser User diesen Inhalt sehen?) ist server-seitig erzwungen
- [ ] Bereits besessene Produkte werden im Shop als "im Besitz" markiert, kein erneuter Kauf möglich
- [ ] Kurse sind nach Anwendungsbereich/Anliegen browsebar (nicht nur nach Produkttyp)
- [ ] Das Produktmodell unterstützt Bundles (mehrere Inhalte zu einem Produkt mit eigenem Preis)
- [ ] Produktkarten zeigen Bild, Name, Kurzbeschreibung und Preis einheitlich

## Edge Cases
- Stripe-Webhook kommt verspätet oder doppelt → Kauf wird nur einmal gutgeschrieben (Idempotenz)
- Zahlung schlägt fehl oder wird abgebrochen → kein Entitlement, klare Rückmeldung an den User
- Abo läuft ab, während ein abo-freigeschalteter Kurs in Bearbeitung ist → Zugriff endet, Fortschritt bleibt gespeichert
- Nicht-Abo-User kauft einen Kurs, bekommt später ein Abo, das denselben Kurs enthält → der Einzelkauf bleibt der dauerhafte Zugriff
- Produktpreis ändert sich nach dem Kauf → bestehende Käufer behalten Zugriff
- Stripe-Rückerstattung → Entscheidung: Entitlement entziehen oder belassen
- Produkt wird aus dem Katalog genommen → bestehende Käufer behalten Zugriff, kein Neuverkauf

## Technical Requirements (optional)
- Payments: Stripe (bereits im Stack), Einmalzahlung; Webhook-Verifizierung via HMAC wie bestehende Webhooks
- Datenmodell erweiterbar für künftige Produkttypen (Shopify-Vorbild) — keine harte Verdrahtung auf "Kurs"
- Security: Zugriffs-Gating server-seitig + RLS; Zod-Validierung aller Eingaben
- Follow-up aus PROJ-19-QA: Index auf `user_profiles(lower(email))` in der PROJ-20-Migration ergänzen — der Käufer-Lookup (`/api/buyer-accounts`) nutzt einen case-insensitiven E-Mail-Lookup

## Design-Referenz
Vorbild: **biogena.com** (vom User als Referenz benannt) — premium, ruhig, wissenschaftlich:
viel Weiß, dezente Erdtöne, sparsame Akzentfarben, hochwertige Bildsprache. Übertragbare
Muster für unseren Shop:
- **Entdeckung über Anwendungsbereich/Outcome** statt nur Produkttyp — bei Biogena "Anwendungsbereiche" (Sport, Frauengesundheit …); bei uns: nach Anliegen browsen (Rücken, Schmerz, Stress, Faszien …)
- **Bundles & kuratierte Kollektionen** ("Starterbundle") — nehmen dem Erstkäufer die Entscheidung ab
- **Wissens-/Edukations-Layer** als Vertrauensaufbau (Biogena: "Wissen"-Sektion) — bei uns: Kurs-Einführungen / kostenlose Inhalts-Vorschau
- **Geführte Auswahl** ("welcher Kurs passt zu mir?") — bei Biogena implizit über Anwendungsbereiche; ein vollwertiger Recommender ist eine spätere Option, nicht v1
- Einheitliche **Produktkarten** (Bild · Name · Kurzbeschreibung · Preis), klare Trust-Signale

---
<!-- Sections below are added by subsequent skills -->

## Tech Design (Solution Architect)

### Grundidee
Ein **erweiterbarer Produktkatalog** (Shopify-Vorbild) + **Stripe-Einmalkauf** +
**Zugriffs-Gating**. Käufe landen in der bereits existierenden
`content_entitlements`-Tabelle (aus PROJ-19). Abo-Zugriff wird **berechnet**, nicht
in der DB materialisiert — so ist ein neues abo-inkludiertes Produkt sofort für
alle Abo-Kunden verfügbar, ohne Backfill.

### Komponenten-Struktur
```
Shop (/shop/* — geteilt von Patienten UND externen Käufern)
├── Katalog (/shop)
│   ├── Entdeckung nach Anliegen (Rücken, Schmerz, Stress, Faszien …)
│   ├── Produktkarten (Bild · Titel · Kurzbeschreibung · Preis/Status)
│   └── Bundles & kuratierte Kollektionen
├── Produktdetail (/shop/[slug])
│   ├── Beschreibung, Inhalts-Vorschau, Modul-Übersicht
│   ├── Preis-Anzeige — kontextabhängig:
│   │     · Abo-Kunde + abo-inkludiert → "Im Abo enthalten · Jetzt starten"
│   │     · Masterclass + Abo-Kunde    → rabattierter Preis
│   │     · sonst                       → voller Preis · "Kaufen"
│   │     · bereits im Besitz           → "Im Besitz · Öffnen"
│   └── Kauf-Button → Stripe Checkout
└── Nach dem Kauf (/shop/success) → Bestätigung + Weiterleitung zum Inhalt

Zugriffs-Gating (server-seitig)
└── hasContentAccess(user, content) — eine geteilte Prüfung, genutzt von der
    Kurs-Detail-API und überall, wo Kurs-Inhalt ausgeliefert wird
```

### Datenmodell (in Klartext)
```
products — der erweiterbare Katalog (Shopify-Vorbild)
- id, slug, titel, kurzbeschreibung, beschreibung, hero_bild
- produkt_typ: kurs | programm | masterclass        (Enum, erweiterbar)
- anliegen/kategorie: für Entdeckung nach Outcome
- preis + währung   (der Preis wird beim Checkout inline als `price_data` an
                     Stripe übergeben — kein `stripe_price_id`-Feld nötig)
- abo_inkludiert: ja/nein   (Kurse: ja → für Abo-Kunden gratis;
                             Masterclass: nein → Abo bekommt nur Rabatt)
- abo_rabatt_prozent: für Masterclasses (Abo-Rabatt statt gratis)
- status: entwurf | aktiv | archiviert ; sortierung

product_contents — verbindet ein Produkt mit seinem Inhalt
- normales Produkt → 1 Eintrag ; Bundle → mehrere Einträge
- (content_type, content_id) zeigt auf learning_paths (später erweiterbar)

content_entitlements — EXISTIERT BEREITS (PROJ-19)
- hält die tatsächlichen Käufe (source = 'purchase', lebenslang)
- Abo-Zugriff wird NICHT hier materialisiert, sondern live berechnet
```

### Zugriffs-Gating — eine zentrale Prüfung
Eine geteilte Funktion `hasContentAccess(userId, contentType, contentId)` ist TRUE,
wenn: ein Kauf-Entitlement existiert (lebenslang) **oder** der User ein aktives Abo
hat **und** das Produkt `abo_inkludiert` ist. Server-seitig erzwungen — die
Kurs-Detail-API liefert vollen Inhalt nur bei Zugriff, sonst einen
"gesperrt · kaufen"-Zustand.

### Tech-Entscheidungen (warum so)
- **Bestehende Stripe-Infrastruktur wiederverwenden** — `getStripe()`, gehostete
  Checkout Sessions (im `payment`-Modus für Einmalkäufe), der bestehende
  `/api/webhooks/stripe`-Handler (erweitert um `checkout.session.completed`).
  Kein neues Payment-Setup; der Abo-Flow nutzt dasselbe Muster bereits.
- **Käufe materialisiert, Abo-Zugriff berechnet** — Vorteil: neue abo-inkludierte
  Produkte sind sofort für alle Abo-Kunden da, kein Backfill. Genau das "Shopify-
  artig erweiterbar".
- **Entitlements am `user_id`** (schon so aus PROJ-19) — funktioniert für Patienten
  und externe Käufer gleichermaßen; ein Upgrade verliert nichts.
- **Inline `price_data` statt `stripe_price_id`** — Produkt + Preis liegen in
  unserer DB; der Checkout übergibt den Preis inline an Stripe (`price_data`).
  Kein Preis-Sync, kein zusätzliches DB-Feld. Automatischer Sync zu Stripe = spätere Option.
- **Shop unter `/shop/*`** — geteilt von Patienten und externen Käufern (die
  Middleware erlaubt externen Käufern `/shop/*` bereits). `/app/kurse` bleibt
  "meine Kurse", `/shop` ist "stöbern & kaufen".

### Hinweis: Stripe-Kunden-Verknüpfung
`getOrCreateCustomer()` ist aktuell an `patientId` gekoppelt. Für den Shop muss die
Stripe-Kunden-Zuordnung auch für externe Käufer (ohne Patienten-Datensatz)
funktionieren → an den `user_id` (Login) koppeln. Kleine Verallgemeinerung der
bestehenden Hilfsfunktion.

### Entscheidung: Admin-Produktverwaltung (geklärt, 2026-05-14)
Das Datenmodell ist von Anfang an erweiterbar/datengetrieben. Die **4 Start-Produkte
werden per Seed angelegt**. Das **Admin-CRUD-UI** zum Anlegen neuer Produkte kommt
als kleines **Fast-Follow** (eigenes Mini-Feature) NACH PROJ-20 — so bleibt PROJ-20
auf den Kauf-Flow fokussiert und bläht nicht auf.

### Bewusst NICHT in PROJ-20 — externe Käufer konsumieren Kurse (Option B, 2026-05-14)
Externe Käufer können im Shop **kaufen**, aber das **Konsumieren** eines gekauften
Kurses (Module, Fortschritt, Quiz, Zertifikat) ist **nicht** Teil von PROJ-20. Grund:
Die Kurs-Engine (`patient_path_enrollments`, `patient_path_progress`) ist
patienten-gebunden; externe Käufer haben keinen Patienten-Datensatz, und die
Middleware sperrt sie aus `/app/kurse/*`.

PROJ-20 liefert daher den **Kauf-Flow für Patienten** (Abo-Kunden + Einzelkäufer mit
Patienten-Konto, die über `/app/kurse` konsumieren). Die Externe-Käufer-Konsumierung
wird ein **eigenes, sauber gespectes Folge-Feature** — die saubere Lösung ist, die
Kurs-Engine auf `user_id` umzustellen (statt `patient_id`), sodass Kurse login-scoped
statt patienten-scoped sind.

### Dependencies
Keine neuen Pakete — `stripe` ist im Stack. Reine DB-/API-/Frontend-Arbeit auf
Next.js 16 + Supabase.

### Sicherheitshinweis
Neue Tabellen (`products`, `product_contents`) inkl. RLS sowie die Erweiterung des
Stripe-Webhooks erfordern laut `.claude/rules/security.md` **explizite Freigabe**,
bevor sie umgesetzt werden. Follow-up aus PROJ-19-QA: Index auf
`user_profiles(lower(email))` in die PROJ-20-Migration aufnehmen.

## QA Test Results

**Tested:** 2026-05-14
**App URL:** http://localhost:3000 (static code review + build analysis)
**Tester:** QA Engineer (AI)

### Acceptance Criteria Status

#### AC-1: Produktkatalog mit Preis, Produkttyp/Tier und Verknüpfung zum Inhalt
- [x] `products`-Tabelle enthält `preis`, `produkt_typ` (kurs/programm/masterclass), `anliegen`, `stripe_price_id` (im Schema als Konzept vorhanden, umgesetzt als `price_data` inline — bewusste Abweichung, s. Tech Design)
- [x] `product_contents` verknüpft Produkt mit `learning_path` (FK auf `content_id`)
- [x] 4 Seed-Produkte aus bestehenden `learning_paths` angelegt (idempotent via ON CONFLICT DO NOTHING)

#### AC-2: Neue Produkte datengetrieben ohne Code-Deployment
- [x] Schema und RLS erlauben Admin-INSERT ohne Code-Änderung
- [x] `produkt_typ`-Enum erweiterbar (TEXT + CHECK, kein Postgres ENUM — einfach zu erweitern)
- [x] Bewusste Einschränkung: Admin-CRUD-UI ist Fast-Follow nach PROJ-20, kein Gap im Datenmodell

#### AC-3: Stripe-Einmalkauf-Flow in App; nach Webhook sofort freigeschaltet
- [x] `POST /api/shop/checkout` erzeugt Stripe-Checkout-Session (mode='payment') korrekt
- [x] `checkout.session.completed` im Stripe-Webhook-Handler implementiert
- [x] Entitlements werden per Upsert (ON CONFLICT ignoreDuplicates) geschrieben — idempotent
- [x] `success_url` leitet auf `/shop/success` weiter; UI zeigt animierte Schritte
- [x] Webhook-Signatur-Verifikation (HMAC) über `constructWebhookEvent()` vorhanden

#### AC-4: Entitlement-Modell mit Quelle (Einzelkauf vs. Abo)
- [x] `content_entitlements.source` = 'purchase' für Käufe; Abo-Zugriff wird live berechnet (nicht materialisiert)
- [x] `valid_until = NULL` für Einzel-Kauf (lebenslang)
- [x] `hasContentAccess()` in `src/lib/content-access.ts` prüft beide Pfade korrekt

#### AC-5: Abo-Kunden sehen abo-inkludierte Kurse als freigeschaltet, ohne Kauf
- [x] `GET /api/shop/products` berechnet `abo_access` live über `patient_subscriptions`
- [x] `GET /api/shop/products/[slug]` gibt `zugriff_status: 'im_abo'` zurück
- [x] `CtaBlock`-Komponente zeigt "Im Abo enthalten · Jetzt starten" bei `im_abo`
- [x] `ProductCard` zeigt "Freigeschaltet"-Overlay bei `abo_access`
- [x] `POST /api/shop/checkout` verweigert Kauf mit 409 wenn abo_inkludiert + aktives Abo

#### AC-6: Masterclass-Produkte zeigen Abo-Kunden rabattierten Preis
- [x] `abo_rabatt_prozent`-Feld in `products`-Tabelle
- [x] `GET /api/shop/products` berechnet `effektiver_preis` bei Masterclass + Abo
- [x] `GET /api/shop/products/[slug]` setzt `effektiver_preis` + `zugriff_status: 'kaufbar'`
- [x] `CtaBlock` zeigt durchgestrichenen Originalpreis + "Abo-Rabatt"-Badge
- [x] `POST /api/shop/checkout` verwendet den rabattierten `unitAmount` für die Stripe-Session

#### AC-7: Einzelkäufe → lebenslanger Zugriff; Abo-Freischaltungen enden mit Abo
- [x] Kauf: `valid_until = null` (lebenslang) in `content_entitlements`
- [x] Abo: kein Eintrag in `content_entitlements`; Zugriff live berechnet — endet, wenn `patient_subscriptions.status` nicht mehr 'trial'/'active'
- [x] `hasContentAccess()` prüft `valid_until`-Ablauf korrekt

#### AC-8: Zugriffs-Check server-seitig erzwungen
- [x] `GET /api/me/paths/[slug]` ruft `hasContentAccess()` auf und gibt `gesperrt: true` zurück wenn kein Zugriff
- [x] Voller Kursinhalt (Lektionen, Quizzes, Fortschritt) nur bei berechtigtem Zugriff geliefert
- [x] `hasContentAccess()` nutzt Service-Client (RLS-Bypass), d.h. vertrauenswürdiger Server-Kontext

#### AC-9: Bereits besessene Produkte als "im Besitz" markiert, kein erneuter Kauf
- [x] `GET /api/shop/products` gibt `besitz: true` zurück
- [x] `GET /api/shop/products/[slug]` gibt `zugriff_status: 'besitz'` zurück
- [x] `CtaBlock` zeigt "Du besitzt diesen Kurs" + "Kurs öffnen"-Button statt Kauf-CTA
- [x] `POST /api/shop/checkout` verweigert Kauf mit 409 wenn Entitlement vorhanden
- [x] `ProductCard` zeigt "Im Besitz"-Overlay

#### AC-10: Kurse nach Anwendungsbereich/Anliegen browsebar
- [x] `anliegen TEXT[]`-Feld in `products` mit Array-Contains-Filter in `GET /api/shop/products`
- [x] `/shop/kurse` bietet Rubrik-Filter-Chips (Rücken, Schmerz, Faszien usw.)
- [x] KurseMenu gruppiert Kurse nach Anliegen-Rubriken
- [x] Suchfeld filtert live nach Titel + Kurzbeschreibung
- [x] URL-Parameter `?anliegen=` und `?q=` werden ausgelesen

#### AC-11: Produktmodell unterstützt Bundles
- [x] `product_contents` ermöglicht mehrere Einträge pro `product_id` (Bundle-Mechanik)
- [x] Seed-Produkte sind 1:1 (1 Produkt → 1 learning_path), Datenmodell ist bereit für n:1
- [x] `checkout.session.completed` Webhook schreibt Entitlement für **jedes** `content`-Element in einem Bundle

#### AC-12: Produktkarten zeigen Bild, Name, Kurzbeschreibung und Preis einheitlich
- [x] `ProductCard` zeigt hero_bild (oder Farbverlauf-Platzhalter), Titel, Kurzbeschreibung, Preis
- [x] Typ-Badge, Anliegen-Tags, Status-Overlay (besitz/abo_access), Favoriten-Herz vorhanden
- [x] Skeleton-Loading-State implementiert (`ProductCardSkeleton`)

### Edge Cases Status

#### EC-1: Stripe-Webhook doppelt → Idempotenz
- [x] Entitlement-Upsert mit `{ onConflict: "user_id,content_type,content_id,source", ignoreDuplicates: true }` — doppelter Webhook schreibt kein zweites Entitlement
- [x] UNIQUE-Constraint `uq_entitlement` in der DB als zusätzliche Absicherung

#### EC-2: Zahlung schlägt fehl oder wird abgebrochen → kein Entitlement
- [x] Entitlement wird ausschließlich im `checkout.session.completed`-Webhook geschrieben — schlägt fehl, entsteht kein Eintrag
- [x] `cancel_url` leitet auf `/shop` zurück
- [x] Frontend zeigt Toast-Error bei Checkout-Fehlern

#### EC-3: Abo läuft ab, abo-freigeschalteter Kurs in Bearbeitung → Zugriff endet
- [x] Abo-Zugriff wird live berechnet (nicht materialisiert) — endet sofort wenn `status` nicht mehr trial/active
- [x] `hasContentAccess()` prüft `patient_subscriptions.status` live
- [x] Im Spec vermerkt: Fortschritt bleibt gespeichert (patient_path_progress nicht gelöscht)

#### EC-4: Nicht-Abo-User kauft Kurs, bekommt später Abo das denselben enthält → Einzelkauf bleibt dauerhaft
- [x] `hasContentAccess()` prüft `purchase`-Entitlement ZUERST (vor Abo-Check)
- [x] `GET /api/shop/products/[slug]`: `isBesitz`-Check läuft vor Abo-Check → `zugriff_status: 'besitz'`
- [x] Kaufter Zugriff ist lebenslang (valid_until = NULL), unabhängig vom Abo

#### EC-5: Produktpreis ändert sich nach dem Kauf → bestehende Käufer behalten Zugriff
- [x] Entitlements sind nicht preisabhängig — einmal gesetzt, gilt `valid_until = NULL`
- [x] Kein Mechanismus, der Entitlements bei Preisänderung entzieht

#### EC-6: Stripe-Rückerstattung → Entscheidung
- [ ] BUG-MEDIUM: Kein `charge.refunded`- oder `checkout.session.expired`-Handler im Stripe-Webhook. Laut Spec ist "Entscheidung offen" (belassen oder entziehen). Aktuell: Entitlement bleibt nach Rückerstattung bestehen. Das ist eine bewusst offengelassene Entscheidung — muss vor Go-Live dokumentiert/entschieden werden.

#### EC-7: Produkt aus Katalog genommen → bestehende Käufer behalten Zugriff
- [x] Entitlements zeigen auf `content_id` (learning_path UUID), nicht auf `product.id`
- [x] Kurs-Engine (`/api/me/paths/[slug]`) prüft Zugriff via `hasContentAccess()`, nicht via Produktstatus
- [x] Archiviertes Produkt: RLS lässt Kauf nicht zu, aber bestehender Zugriff bleibt erhalten

### Security Audit Results

#### Authentifizierung
- [x] `POST /api/shop/checkout` prüft Auth via `supabase.auth.getUser()` — 401 ohne Session
- [x] `GET /api/shop/products` und `GET /api/shop/products/[slug]` laufen mit Service-Client; Auth ist optional (Produkte für anonyme sichtbar, aber ohne Ownership-Info)
- [x] `/api/me/paths/[slug]` erfordert Auth — 401 ohne Session
- [x] Stripe-Webhook-Endpunkt: Signatur-Verifikation über HMAC — kein Auth-Bypass möglich

#### Autorisierung
- [x] `hasContentAccess()` prüft server-seitig ob `user_id` berechtigt ist
- [x] RLS auf `content_entitlements`: User sieht nur eigene Einträge
- [x] RLS auf `products`: nur `status = 'aktiv'` für reguläre User sichtbar; Admin sieht alle
- [x] Middleware sperrt externe Käufer auf `/shop/*`, klinische Bereiche nicht erreichbar
- [x] `checkout.session.completed`: `user_id` kommt aus `session.metadata` (vom Server beim Checkout-Erstellen gesetzt), nicht aus User-Input — kein Manipulation-Angriff möglich

#### Eingabe-Validierung
- [x] `POST /api/shop/checkout`: Zod-Schema validiert `productSlug` (string, min 1, max 200)
- [x] Produkt-Status wird server-seitig geprüft (`status !== 'aktiv'` → 404)
- [x] `productSlug` aus Request-Body, nicht aus URL-Parametern — kein Path-Traversal

#### Rate Limiting
- [x] `/api/shop/public-checkout` (PROJ-21): 5/IP/h + 50 global/h
- [x] `/api/shop/resend-access` (PROJ-21): 3/IP/h + 30 global/h
- [ ] BUG-MEDIUM: **`POST /api/shop/checkout` hat kein Rate Limiting.** Ein eingeloggter User kann theoretisch in Sekundenschnelle hunderte Checkout-Sessions erstellen (jede erzeugt einen Stripe API Call). Risiko: Stripe API-Limit-Erschöpfung + erhöhte Kosten. Mitigierung: Stripe selbst hat Limits; aber ein serverseitiges Throttle (z.B. 10/user/h) wäre best practice.

#### Datenlecks
- [x] `GET /api/shop/products/[slug]` liefert für nicht-authentifizierte User kein `zugriff_status` / `effektiver_preis` (da `user = null` → Standardwerte)
- [x] Produktbeschreibungen, Preise und Lesbarkeit sind für aktive Produkte öffentlich — das ist gewollt
- [x] Lektionsinhalte werden nur bei berechtigtem Zugriff geliefert (server-seitig erzwungen)
- [x] Kein INTERNAL_API_SECRET im Frontend-Code; nur in Server-API-Routes verwendet

#### Weitere Security-Checks
- [x] `escapeHtml()` in Resend-Access-E-Mail-Template — XSS-Schutz für `first_name`
- [x] Webhook-Handler: `session.mode !== 'payment'` → Break — Subscription-Checkouts werden nicht fehlerhaft als Kauf behandelt
- [x] Email-Blocklist für Wegwerf-Adressen im Public-Checkout implementiert
- [x] `stripe_price_id`-Feld in `products`-Schema fehlt (laut Spec vorgesehen) — implementiert als `price_data` inline. Kein Security-Problem, aber Spec-Abweichung (s. BUG-LOW-1)

### Bugs Found

#### BUG-1: `POST /api/shop/checkout` ohne Rate Limiting
- **Severity:** Medium
- **Steps to Reproduce:**
  1. Eingeloggter User sendet in schneller Folge POST-Requests an `/api/shop/checkout`
  2. Jeder Request erzeugt eine neue Stripe-Checkout-Session
  3. Erwartet: Throttling nach N Requests / Zeitfenster
  4. Tatsächlich: Unbegrenzte Sessions möglich; Stripe API-Calls werden akkumuliert
- **Priority:** Fix in next sprint (kein akutes Angriffsvektor, da Auth erforderlich)

#### BUG-2: Rückerstattungs-Handling nicht implementiert / nicht entschieden
- **Severity:** Medium
- **Steps to Reproduce:**
  1. User kauft Kurs
  2. Stripe-Rückerstattung via Dashboard
  3. Erwartet: Entscheidung dokumentiert (Entitlement behalten oder entziehen + automatischer Handler)
  4. Tatsächlich: Entitlement bleibt dauerhaft — kein Webhook für Rückerstattung
- **Priority:** Entscheidung vor Go-Live treffen; Umsetzung je nach Entscheidung

#### BUG-3: `stripe_price_id`-Feld in `products`-Tabelle fehlt (Spec vs. Implementierung)
- **Severity:** Low
- **Steps to Reproduce:**
  1. Spec (Tech Design, Datenmodell): `products` hat `stripe_price_id`-Feld
  2. Migration `20260514000003_kurs_shop_kauf_flow.sql`: kein `stripe_price_id`-Feld vorhanden
  3. Checkout nutzt `price_data` inline statt `stripe_price_id` — funktional korrekt (Abweichung von der Spec-Beschreibung, aber bewusste Implementierungsentscheidung laut Tech-Design "kein Preis-Sync zu Stripe in v1")
  4. Konsequenz: Wenn später `stripe_price_id` benötigt wird, braucht es eine Migrations-Ergänzung
- **Priority:** Nice to have — Spec aktualisieren oder Feld nachträglich ergänzen

#### BUG-4: N+1 Query in `/api/shop/products/[slug]` bei vielen Inhalten
- **Severity:** Low
- **Steps to Reproduce:**
  1. Bundle-Produkt mit N linked learning_paths
  2. `GET /api/shop/products/[slug]` iteriert über alle Contents und macht für jede `learning_path`-Query einen separaten DB-Call
  3. Bei 4 Inhalten: 4+4 = 8 DB-Calls nur für Pfad-Daten und Lektionen
  4. Bei v1 (max. 4 Inhalte) nicht kritisch; bei Bundles mit 10+ Inhalten Performance-Problem
- **Priority:** Nice to have / Fix before large bundles launched

### Regression Testing

Getestete bestehende Features (via Code-Review):
- [x] **PROJ-19 (Externe Käufer-Accounts):** Middleware-Regeln für `externer_kaeufer`-Rolle unverändert korrekt; `/shop/dashboard` weiterhin erreichbar; Upgrade-Flow unberührt
- [x] **PROJ-13 (Kurs-System):** `/api/me/paths/[slug]` erweitert um `hasContentAccess()`-Check — **kein Breaking Change**: bestehende Patienten mit Abo-Zugriff erhalten `access = true` wie vorher; Patienten ohne Zugriff erhalten `gesperrt: true` mit `product_slug` für Kauflink (neue Funktionalität, kein Regression)
- [x] **Stripe Webhook:** `checkout.session.completed`-Case ergänzt, bestehende Cases (subscription lifecycle, invoice.paid, invoice.payment_failed, setup_intent) unverändert
- [x] **Supabase Middleware:** Nur Erweiterungen (öffentliche Route-Prüfungen für PROJ-21); bestehende Rollenlogik unverändert

### Summary
- **Acceptance Criteria:** 12/12 vollständig implementiert
- **Bugs Found:** 4 total (0 critical, 0 high, 2 medium, 2 low)
- **Security:** Gut — Auth/Authz/Webhook-Verifikation korrekt; Rate Limiting am In-App-Checkout fehlt (Medium)
- **Production Ready:** YES — keine Critical/High-Bugs; Medium-Bugs sind bekannte Einschränkungen ohne akuten Angriffsvektor
- **Recommendation:** Vor Go-Live BUG-2 (Rückerstattungs-Entscheidung) treffen; BUG-1 (Rate Limit am Checkout) im nächsten Sprint nachrüsten

## Deployment
_To be added by /deploy_
