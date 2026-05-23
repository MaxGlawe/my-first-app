# Briefing: Direkt-Link zur Leistung "Video-Sprechstunde (Praxis OS)"

> **Empfänger:** Entwickler des Online-Buchungskalenders
> **Auftraggeber:** Praxis Glawe — Praxis OS
> **Ziel-Domain:** wwwpraxis-os.com
> **Erstellt:** April 2026

---

## 1. Hintergrund

Wir haben aktuell zwei separate Touchpoints für Patienten:

1. **Praxis-Hauptwebsite** mit dem Online-Kalender — Patienten können dort beliebige Leistungen buchen, u. a. die "Video-Sprechstunde (Praxis OS) — 30 Min. — 69 €".
2. **wwwpraxis-os.com** — Marketing-/Landingpage speziell für unser digitales Angebot Praxis OS. Aktuell läuft hier alles über ein Kontakt-/Anfrageformular; wir melden uns danach manuell mit einem Terminvorschlag (24–48 h Bearbeitungszeit).

**Problem:** Diese 24–48 h Wartezeit kostet uns Conversions — heiße Leads kühlen ab, manche springen ab.

**Lösung:** Wir wollen auf wwwpraxis-os.com einen prominent platzierten "Jetzt Termin buchen"-Button einbauen, der direkt in unseren bestehenden Kalender springt — **mit der Leistung "Video-Sprechstunde (Praxis OS)" bereits vorausgewählt**.

So bleibt der Kalender **die alleinige Quelle der Wahrheit** (keine Doppelbuchungs-Risiken, kein Sync nötig). Patienten landen direkt im Auswahl-Schritt für Therapeut bzw. Datum/Uhrzeit.

---

## 2. Anforderung an den Kalender

### 2.1 Funktionale Anforderung

Der Kalender soll **GET-Parameter in der URL akzeptieren**, mit denen sich der Buchungs-Wizard bereits an einer späteren Stufe öffnen lässt — konkret: mit einer vorausgewählten Leistung.

**Vorgeschlagener Parameter-Name:**

| Parameter | Wert | Zweck |
|---|---|---|
| `service` | Slug der Leistung, z. B. `video-sprechstunde-praxis-os` | Wählt im Wizard automatisch die Leistung in Step 1 (Leistung) und springt direkt zu Step 2 (Therapeut). |

**Alternativ** (falls Slugs nicht möglich): numerische `service_id` aus eurer Datenbank.

### 2.2 Beispiel-URLs

```
https://praxis-glawe.de/buchen?service=video-sprechstunde-praxis-os
```

oder mit ID:

```
https://praxis-glawe.de/buchen?service_id=42
```

### 2.3 Erwartetes Verhalten

1. Wenn ein gültiger `service`/`service_id`-Parameter vorhanden ist:
   - Step 1 (Leistungsauswahl) wird **übersprungen** oder die Leistung dort bereits markiert dargestellt
   - Der Wizard zeigt direkt Step 2 (Therapeutenwahl) an
   - Im Wizard-Kopf bleibt Step 1 als "abgeschlossen" sichtbar (grüner Haken), damit der Patient zurückspringen könnte, falls er die falsche Leistung erkennt

2. Wenn der Parameter **fehlt**:
   - Normales Verhalten — Wizard startet bei Step 1 wie bisher.

3. Wenn der Parameter **vorhanden, aber ungültig** (z. B. nicht existierende Leistung):
   - Fallback auf Step 1 mit normaler Leistungsauswahl
   - Optional: kurzer Hinweis "Leistung nicht gefunden, bitte wählen"

### 2.4 Akzeptanzkriterien

- [ ] URL `https://praxis-glawe.de/buchen?service=video-sprechstunde-praxis-os` öffnet den Kalender mit vorausgewählter Leistung
- [ ] Der Patient landet in Step 2 (Therapeutenwahl) statt Step 1
- [ ] Bei ungültigem `service`-Wert kein Fehler, sondern Fallback auf normalen Flow
- [ ] Patient kann jederzeit per Klick auf Step 1 zurück und die Leistung ändern
- [ ] Funktioniert auf Mobile, Tablet, Desktop
- [ ] Keine Auswirkungen auf andere Buchungs-Flows ohne Parameter

---

## 3. Optionale Erweiterungen (nice-to-have)

Diese Punkte sind kein Must-have für Phase 1, aber wertvoll für Conversion-Tracking und UX:

### 3.1 UTM-Parameter / Tracking

Wir möchten messen, wie viele Buchungen aus wwwpraxis-os.com stammen. Ideal wäre, wenn der Kalender Standard-UTM-Parameter durchreicht:

```
?service=video-sprechstunde-praxis-os&utm_source=praxis-os-website&utm_medium=cta&utm_campaign=direct-booking
```

Diese sollten:
- in der DB gespeichert werden zusammen mit dem Termin (z. B. Spalte `referrer_source` oder `utm_*`)
- ggf. an den `/api/webhooks/booking`-Webhook von Praxis OS mit übermittelt werden, sodass wir später ein Conversion-Reporting bauen können

### 3.2 Pre-Filling von Patientendaten

Falls der Patient später per Klick aus einer E-Mail oder einem ausgefüllten Anfrageformular auf den Kalender gelangt, wäre es schick, wenn auch persönliche Daten vorbefüllt würden:

```
?service=video-sprechstunde-praxis-os&email=patient@example.com&firstname=Max&lastname=Mustermann
```

→ Im Step "Daten" sind die Felder bereits ausgefüllt, der Patient muss nur noch bestätigen.

**Wichtig:** Aus Datenschutz-Sicht sollte die URL möglichst kurz bleiben (z. B. nur eine `token`-ID, die serverseitig zu den Daten aufgelöst wird). Pre-Filling ist also eher Phase 2.

### 3.3 Embed-fähige Variante (Phase 2)

Falls ihr den Kalender später per `<iframe>` direkt auf wwwpraxis-os.com einbinden wollt (sodass der Patient die Domain optisch nicht verlässt), bräuchten wir:

- Eine "Embed-Mode"-URL, die ohne den restlichen Praxis-Glawe-Header/Footer rendert (z. B. `?embed=1`)
- Korrekte CSP-/X-Frame-Options-Header (oder eine spezifische Domain-Whitelist für `wwwpraxis-os.com`)
- Responsives Verhalten in einem flexiblen iframe-Container

Das ist explizit **Phase 2**; für den Anfang reicht der direkte Link, der den Patienten in einem neuen Tab auf den Kalender führt.

---

## 4. Implementierungs-Hinweise

- Der Wizard-State sollte in der URL persistiert werden (sodass Patient bei Reload nicht von vorn anfangen muss). Falls bisher serverseitig im Session-State gehalten — bitte parallel als Query-Param mitführen.
- Stabile Slugs für Leistungen sind hilfreich, weil sie sich nicht ändern (anders als IDs nach Datenbank-Migrationen). Wenn Slugs noch nicht existieren, könnte z. B. eine Slug-Spalte zur `services`-Tabelle ergänzt werden.

---

## 5. Was wir vom Entwickler zurückbekommen möchten

1. **Machbarkeitseinschätzung** — geht das mit dem aktuellen Setup, oder muss umgebaut werden?
2. **Aufwandschätzung** — wie viele Stunden / Arbeitstage?
3. **Empfehlung zu Slug vs. ID** — was ist im aktuellen System einfacher, was empfiehlt der Entwickler?
4. **Welche bestehenden Buchungs-URLs gibt es bereits?** Damit wir den korrekten Pfad in der wwwpraxis-os.com-Verlinkung verwenden.
5. **Können wir einen Test-Endpoint bekommen** (z. B. Staging-URL), gegen den wir das Ganze auf wwwpraxis-os.com verifizieren können, bevor es live geht?
6. **Liefer-Format des Webhooks** — übermittelt der Kalender bei der Buchung bereits alle relevanten Daten an unseren `/api/webhooks/booking`-Endpunkt? Falls ja: kommt der UTM-/Source-Parameter dort schon mit?

---

## 6. Zeitplan

Wir wollen das gerne **innerhalb der nächsten 2 Wochen** umsetzen, da die `/anfrage`-Conversion auf wwwpraxis-os.com aktuell der größte Conversion-Hebel ist. Sobald der Direkt-Link funktioniert, bauen wir auf wwwpraxis-os.com den prominenten "Jetzt Termin buchen"-Button ein (Aufwand auf unserer Seite ca. 30–60 Min).

---

## 7. Kontakt

Bei Rückfragen oder Vorschlägen für eine alternative Umsetzung:

- **Inhaber:** [Name + Kontakt]
- **Technische Fragen zu wwwpraxis-os.com / Webhook-Integration:** [E-Mail]

---

*Vielen Dank für die Einschätzung!*
