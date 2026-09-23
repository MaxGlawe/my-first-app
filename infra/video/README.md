# Video-Server einrichten (PROJ-27)

Alles hier gehört auf einen **eigenen VPS**, nicht auf den Praxis-OS-Server.
Der trägt bereits die Anwendung, einen Voice-Agent und einen fremden
Docker-Stack auf 2 vCPU und 3,8 GB RAM.

**Größe:** 2 vCPU, 4 GB reichen. Bei Einzelgesprächen wird nichts
transkodiert — der Server reicht Ströme durch, das ist billig. Teuer wird
nur TURN-Verkehr, und der fällt erst an, wenn ein Netz keine direkte
Verbindung zulässt.

---

## 1. DNS bei Cloudflare

Zwei A-Records auf die IP des neuen Servers:

| Name | Typ | Proxy |
|---|---|---|
| `video` | A | **DNS only** |
| `turn`  | A | **DNS only** |

> **Das ist keine Feinheit, sondern die Bedingung.** Mit aktiviertem
> Cloudflare-Proxy (orange Wolke) bricht WebRTC: Cloudflare reicht weder
> UDP-Medien noch TURN durch, und das Gespräch scheitert genau bei den
> Patienten, die es am nötigsten haben — hinter einer Firmen-Firewall.

## 2. Secret erzeugen

```bash
openssl rand -hex 24
```

Den Wert an **zwei** Stellen eintragen:

1. in `livekit.yaml` unter `keys.praxis-os` (ersetzt `__SECRET_HIER_EINSETZEN__`)
2. auf dem Praxis-OS-Server als `LIVEKIT_API_SECRET` — in **beide** Env-Dateien,
   `.env.local` **und** `.env.production.local`

Dazu `LIVEKIT_API_KEY=praxis-os` und
`NEXT_PUBLIC_LIVEKIT_URL=wss://video.wwwpraxis-os.com`.

> Die Erfahrung vom 23.09.2026: Ein Secret, das auf zwei Seiten
> auseinanderläuft, kostet zwei Wochen stille Fehlschläge. Beim Eintragen
> einmal gegenprüfen:
> `printf '%s' "$SECRET" | sha256sum | cut -c1-12` — der Wert muss auf
> beiden Servern gleich sein.

## 3. Starten

```bash
apt update && apt install -y docker.io docker-compose-plugin ufw
./firewall.sh
docker compose up -d
docker compose logs -f livekit
```

Im Log muss `starting LiveKit server` und die öffentliche IP erscheinen.

## 4. Gegenprobe

```bash
# Signaling erreichbar?
curl -s -o /dev/null -w '%{http_code}\n' https://video.wwwpraxis-os.com
# Erwartet: 200

# TURN-Zertifikat gültig?
echo | openssl s_client -connect turn.wwwpraxis-os.com:5349 2>/dev/null \
  | openssl x509 -noout -dates
```

## 5. Praxis OS neu starten

```bash
ssh root@46.225.181.221 "cd /var/www/praxis-os && pm2 restart praxis-os"
```

Kein neuer Build nötig — die Werte werden zur Laufzeit gelesen. Danach
erscheint im Patientenprofil die Karte „Sprechzimmer"; vorher blendet sie
sich aus.

---

## Ports

| Port | Protokoll | Wofür |
|---|---|---|
| 443 | TCP | HTTPS und WSS (Signaling) |
| 5349 | TCP | TURN über TLS — Firmennetze |
| 7881 | TCP | WebRTC über TCP, Rückfallebene |
| 7882 | UDP | Medien (UDP-Mux, **ein** Port statt eines Bereichs) |
| 80 | TCP | nur Zertifikatsbezug |

## Was hier bewusst fehlt

- **Kein Egress.** Keine Aufzeichnung, nicht installiert, nicht konfiguriert.
  Ein Gespräch über Gesundheit wird nicht mitgeschnitten.
- **Kein zweiter Anbieter.** Begründung in `src/lib/video/index.ts`.
  Rückfallebene ist ein Handgriff, kein Code: im Zweifel einen fremden
  Raum-Link von Hand in den Chat schicken.
- **Kein UDP-TURN.** Wer TURN braucht, sitzt hinter einer Firewall, die UDP
  ohnehin blockt.

## Monitoring

Uptime-Prüfung auf `https://video.wwwpraxis-os.com` mit Alarm aufs Handy.
Fällt dieser Server aus, merkt man es sonst erst, wenn ein Patient im
Warteraum sitzt.
