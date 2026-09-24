# PROJ-27 — Digitales Sprechzimmer (Video, Dokumentenakte, Befund-Scan)

> **Das Gespräch, das Praxis OS bisher fehlte — und die Ablage für alles, was
> der Patient dazu mitbringt.**

**Status:** In Review — vollständig **DEPLOYT 23.09.2026** (Commits `6cf4a97` … `badb080`),
End-to-End-Durchlauf mit einem echten Termin steht noch aus
**Stand:** 24.09.2026

---

## 1 · Warum

PROJ-26 verkauft eine **Videokonsultation** als Eintritt ins Programm und fünf
gestaffelte Video-Calls als dessen Kern. Bis hierher gab es dafür kein
Werkzeug: Der Call lief über einen fremden Dienst, per Link von Hand in den
Chat. Damit lag der wichtigste Termin der ganzen Strecke außerhalb des Systems
— ohne Bezug zum Patienten, ohne Protokoll, ohne Erinnerung.

Dasselbe galt für **Befunde**: MRT-Berichte, Arztbriefe, Röntgenbilder kamen
als Foto im Chat an und versanken dort.

---

## 2 · Was gebaut wurde

### 2.1 Sprechzimmer (Video)

| Teil | Wo |
|---|---|
| Eigener LiveKit-Server (SFU + TURN) | `infra/video/`, VPS **188.245.20.248** |
| Token-Ausgabe, Raumlogik | `src/lib/video/`, `/api/video/token` |
| Raum-Oberfläche + eigene Steuerleiste | `src/components/video/` |
| Therapeutenseite | `/os/sprechstunde`, `/os/sprechzimmer/[id]` |
| Patientenseite (mit Konto) | `/app/sprechzimmer` |
| **Gast-Zugang (ohne Konto)** | `/sprechzimmer/[token]`, `/api/video/gast` |

Der **Gast-Link ist der verlässliche Weg**, nicht Push: Bei der Konsultation hat
der Patient noch gar kein Konto — er bekommt es erst beim Kauf danach. Im
Praxistest am 23.09.2026 existierte im ganzen System genau **eine**
Push-Anmeldung.

### 2.2 Vom Ad-hoc-Raum zum Termin

Der erste Entwurf kannte nur „jetzt einen Raum aufmachen". Ein Patient hat aber
nicht dann Zeit, wenn der Behandler Zeit hat. Ein Termin hat jetzt eine Zeit,
und daraus ergibt sich alles andere:

```
oeffnet   = geplant_at − 5 Minuten          (Warteraum: Kamera/Mikro prüfen)
schliesst = geplant_at + Dauer + 30 Minuten (Nachlauf: niemand fliegt mitten im Satz raus)
```

Beide Zeitpunkte stehen als **eigene Spalten** in der Datenbank, statt jedes Mal
gerechnet zu werden: Wann jemand hineindurfte, muss nachvollziehbar bleiben,
auch wenn sich die Regel im Code später ändert.

Einzige Quelle der Zeitlogik: `src/lib/video/termin.ts`. Die Regel taucht sonst
an sechs Stellen auf und lautet irgendwann sechsmal leicht verschieden.

### 2.3 Einladung und Erinnerungen

* Mail mit **Kalendereintrag (.ics)**, von Hand gebaut: CRLF-Zeilenenden
  (Outlook ignoriert alles andere kommentarlos), Faltung bei 75 Zeichen.
* Der Link steht **als ganze Adresse im Text**, nicht nur hinter einem Knopf —
  viele Mailprogramme zeigen Knöpfe nicht an.
* **Keine Angaben zur Beschwerde, auch nicht im Betreff.** Eine Mail wird auf
  gesperrten Bildschirmen als Vorschau angezeigt.
* Erinnerungen **24 h** und **1 h** vorher, stündlicher Cron.
  Der Zeitstempel wird **vor** dem Versand gesetzt: Scheitert die Mail, gilt die
  Erinnerung trotzdem als erledigt. Eine verpasste Erinnerung ist ärgerlich,
  zwanzig gleiche Mails sind ein Vertrauensschaden.

### 2.4 Dokumentenakte + Befund-Scan

* Tabelle `patient_documents`, privater Storage-Bucket `patient-documents`
  (**keine** RLS-Policy auf `storage.objects` → nur der Service-Key kommt dran,
  Zugriff ausschließlich über die API).
* Patient: `/app/dokumente`. Therapeut: Karte im Patientenprofil.
* **Mehrseitiger Scan mit Entzerrung im Browser**, ohne OpenCV
  (`src/lib/scan/scan.worker.ts`) — ein Arztbrief wird abfotografiert, nicht
  hochgeladen.

---

## 3 · Entscheidungen (verbindlich)

| Thema | Entscheidung |
|---|---|
| Anbieter | **Eigener LiveKit-Server**, kein Fremddienst. Begründung in `src/lib/video/index.ts` |
| Serverwahl | **Eigener VPS** — der Praxis-OS-Server trägt bereits App, Voice-Agent und einen fremden Docker-Stack auf 2 vCPU |
| Cloudflare | `video` und `turn` zwingend **DNS only**. Mit Proxy bricht WebRTC genau bei den Patienten hinter Firmen-Firewalls |
| Aufzeichnung | **Keine.** Kein Egress installiert, nicht konfiguriert |
| Rückfallebene | Kein zweiter Anbieter im Code. Im Zweifel ein fremder Raum-Link von Hand in den Chat |
| Wer lädt ein | Immer der Behandler. Sonst gäbe sich jeder selbst einen Termin und die Eignungsprüfung wäre eine Formalie |
| Anlegen | An **einem** Ort (`/os/sprechstunde`), nicht an zweien. Im Patientenprofil steht nur, wann das nächste Gespräch ist |
| Einladung scheitert | Termin bleibt bestehen, Oberfläche sagt es, Mail per Klick nachsendbar |
| TURN-Zertifikat | Aus Caddys Speicher herauskopiert, Pfad **gesucht statt verdrahtet** (er enthält den ACME-Anbieter), täglicher systemd-Timer |

---

## 4 · Datenbank

| Migration | Inhalt |
|---|---|
| `20260923000003_sprechzimmer.sql` | `video_calls`, Raumnamen, RLS |
| `20260923000004_dokumentenakte.sql` | `patient_documents` + Bucket `patient-documents` |
| `20260923000005_sprechzimmer_gastzugang.sql` | `gast_token` |
| `20260923000006_sprechzimmer_termine.sql` | `geplant_at`, `dauer_minuten`, Fensterspalten, Erinnerungs-Zeitstempel, Status `geplant`/`abgesagt`, Indizes |

**Alle vier sind am 23.09.2026 auf der Produktionsdatenbank angewendet** (geprüft 24.09.2026).

---

## 5 · Cron

`sprechzimmer-erinnerungen-hourly` — `0 * * * *`, Supabase pg_cron + pg_net,
SQL in `supabase/cron/sprechzimmer-erinnerungen.sql`.

**Aktiv und geprüft** (24.09.2026): stündliche Aufrufe mit HTTP 200 im
Nginx-Log. Das SQL liest das `CRON_SECRET` per Regex aus einem laufenden Job,
statt einen Platzhalter zu hinterlassen — ein stehengebliebener Platzhalter
ergibt einen *aktiven* Job, der 401 kassiert, nichts sendet und von pg_cron
trotzdem als erfolgreich verbucht wird.

---

## 6 · Betrieb

* **Video-Server:** `infra/video/README.md` — DNS, Secret, Compose, Firewall,
  TURN-Zertifikat, Gegenprobe.
* **Env (Praxis-OS-Server, BEIDE Dateien):** `LIVEKIT_API_KEY=praxis-os`,
  `LIVEKIT_API_SECRET`, `NEXT_PUBLIC_LIVEKIT_URL=wss://video.wwwpraxis-os.com`.
  Fehlen sie, blendet sich die Sprechzimmer-Karte aus und POST antwortet 503.
* **Monitoring:** Uptime-Prüfung auf `https://video.wwwpraxis-os.com` mit Alarm
  aufs Handy. Fällt der Server aus, merkt man es sonst erst, wenn ein Patient
  im Warteraum sitzt.

---

## 7 · Offen

1. **End-to-End mit einem echten Termin.** Am 23.09. blockierte ein Fehler in
   der Patientensuche (`geburtsdatum.ilike` auf einer DATE-Spalte, 500 bei
   *jeder* Suche) genau diesen Durchlauf; der Fehler ist behoben (`4e3e34c`),
   der Durchlauf danach nicht mehr nachgeholt worden. Zu prüfen: anlegen →
   Einladung + .ics kommt an → Gastseite zeigt Countdown → Zutritt ab −5 Min →
   Gespräch → beenden.
2. **Erinnerungsmail im Echtbetrieb** — der Cron läuft, hatte aber noch nie
   einen Termin im Fenster.
3. **Dokumentenakte im Echtbetrieb** — Tabelle und Bucket sind leer; Upload und
   Scan sind noch nie mit einem echten Befund gelaufen.
4. **Absage-Mail:** `PATCH aktion=absagen` setzt `abgesagt_at`; ob der Patient
   darüber aktiv benachrichtigt wird, ist bewusst noch offen.

---

## 8 · Was hier bewusst fehlt

* **Keine Aufzeichnung.** Ein Gespräch über Gesundheit wird nicht mitgeschnitten.
* **Kein Selbst-Termin durch den Patienten.**
* **Kein UDP-TURN.** Wer TURN braucht, sitzt hinter einer Firewall, die UDP ohnehin blockt.
