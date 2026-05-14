# PROJ-20: Kurs-Shop & Kauf-Flow (In-App)

## Status: Planned
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
_To be added by /architecture_

## QA Test Results
_To be added by /qa_

## Deployment
_To be added by /deploy_
