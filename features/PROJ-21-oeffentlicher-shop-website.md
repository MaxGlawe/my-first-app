# PROJ-21: Öffentlicher Shop (Website)

## Status: Planned
**Created:** 2026-05-14
**Last Updated:** 2026-05-14

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
_To be added by /qa_

## Deployment
_To be added by /deploy_
