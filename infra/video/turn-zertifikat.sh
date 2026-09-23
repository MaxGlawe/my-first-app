#!/usr/bin/env bash
#
# PROJ-27 — TURN-Zertifikat aus Caddys Speicher holen.
#
# Warum es dieses Skript gibt: Caddy besorgt und erneuert die Zertifikate,
# legt sie aber in seinem eigenen Datenverzeichnis ab und exportiert sie
# nicht. LiveKits eingebauter TURN-Server spricht TLS selbst — er laeuft
# nicht durch Caddy, weil TURN kein HTTP ist — und braucht die Dateien
# deshalb direkt.
#
# Der Pfad in Caddys Speicher enthaelt den ACME-Anbieter. Deshalb wird er
# per Suche ermittelt und nicht fest verdrahtet: Faellt Caddy einmal auf
# einen anderen Anbieter zurueck, aendert sich das Verzeichnis, und ein fest
# eingetragener Pfad waere ab da still veraltet — TURN liefe mit einem
# abgelaufenen Zertifikat weiter, bis jemand es merkt.
#
# Kopiert wird nur, wenn sich etwas geaendert hat; neu gestartet wird nur
# dann. Let's Encrypt erneuert alle 60 Tage, ein Neustart mitten im Gespraech
# waere sonst der Preis fuer nichts.
set -euo pipefail

DOMAIN="turn.wwwpraxis-os.com"
ZIEL="/opt/sprechzimmer/certs"
cd /opt/sprechzimmer

crt=$(docker compose exec -T caddy sh -c "find /data/caddy/certificates -name '${DOMAIN}.crt' | head -1" | tr -d '\r')
key=$(docker compose exec -T caddy sh -c "find /data/caddy/certificates -name '${DOMAIN}.key' | head -1" | tr -d '\r')

if [ -z "$crt" ] || [ -z "$key" ]; then
  echo "Zertifikat fuer ${DOMAIN} noch nicht in Caddys Speicher — nichts zu tun."
  exit 0
fi

mkdir -p "$ZIEL"
tmp=$(mktemp -d)
trap 'rm -rf "$tmp"' EXIT

docker compose exec -T caddy cat "$crt" > "$tmp/turn.crt"
docker compose exec -T caddy cat "$key" > "$tmp/turn.key"

if [ ! -s "$tmp/turn.crt" ] || [ ! -s "$tmp/turn.key" ]; then
  echo "FEHLER: leere Dateien aus Caddy gelesen — alter Stand bleibt unangetastet."
  exit 1
fi

if cmp -s "$tmp/turn.crt" "$ZIEL/turn.crt" && cmp -s "$tmp/turn.key" "$ZIEL/turn.key"; then
  echo "Zertifikat unveraendert."
  exit 0
fi

install -m 644 "$tmp/turn.crt" "$ZIEL/turn.crt"
install -m 600 "$tmp/turn.key" "$ZIEL/turn.key"
echo "Zertifikat aktualisiert — LiveKit wird neu gestartet."
docker compose restart livekit
