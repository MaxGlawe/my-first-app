#!/usr/bin/env bash
#
# Deploy auf den Hetzner-Server. Auf dem Server ausführen:
#
#   ssh root@46.225.181.221 "cd /var/www/praxis-os && bash scripts/deploy.sh"
#
# Warum es dieses Skript gibt:
#
# Der bisherige Einzeiler war
#     pm2 stop && rm -rf .next && npm run build && pm2 start
# und hat zwei Fallen:
#
#   1. `rm -rf .next` reisst dem laufenden Prozess die Chunks weg. Ab da ist
#      die Seite ohnehin unten, bis der neue Build fertig ist.
#   2. Die `&&`-Kette bricht beim fehlgeschlagenen Build ab — `pm2 start` wird
#      nie erreicht. Die Seite bleibt dann unten, statt auf dem alten Stand
#      weiterzulaufen. Genau das ist am 22.09.2026 passiert: Turbopack ist mit
#      "next/font/google queries have exactly one entry" ausgestiegen, einem
#      Aussetzer, der beim naechsten identischen Lauf verschwindet.
#
# Dieses Skript baut deshalb ZUERST und tauscht erst danach um. Scheitert der
# Build, bleibt der alte Stand online.
#
set -uo pipefail

APP="praxis-os"
BUILD_VERSUCHE=2

echo "── Code holen ──────────────────────────────────────────────"
git pull origin main || { echo "git pull fehlgeschlagen — Abbruch, nichts geaendert."; exit 1; }

# Alten Build sichern, damit wir zurueckfallen koennen.
rm -rf .next.bak
[ -d .next ] && cp -r .next .next.bak

# Abhaengigkeiten nachziehen, wenn sich package-lock.json geaendert hat.
#
# Am 23.09.2026 schlug ein Deploy fehl, weil neue Pakete (LiveKit) im Repo
# standen, auf dem Server aber nie installiert wurden — das Skript hat nur
# gebaut. Der Rollback hat gegriffen, aber der Fehler kommt bei jedem neuen
# Paket wieder.
#
# PUPPETEER_SKIP_DOWNLOAD ist Pflicht: Puppeteer versucht sonst, Chromium
# herunterzuladen, scheitert daran auf diesem Server und laesst node_modules
# unvollstaendig zurueck — dann fehlen auch next und typescript.
if ! git diff --quiet HEAD@{1} HEAD -- package-lock.json 2>/dev/null; then
  echo "── Abhaengigkeiten haben sich geaendert ────────────────────"
  export PUPPETEER_SKIP_DOWNLOAD=true PUPPETEER_SKIP_CHROMIUM_DOWNLOAD=true
  if ! npm ci --no-audit --no-fund; then
    echo "npm ci fehlgeschlagen — Abbruch, alter Stand laeuft weiter."
    exit 1
  fi
fi

echo "── Bauen ───────────────────────────────────────────────────"
# Der Cache ist die Ursache der Chunk-Fehler ("Cannot find module
# .next/server/chunks/..."), deshalb bewusst von vorn.
rm -rf .next

ERFOLG=1
for versuch in $(seq 1 $BUILD_VERSUCHE); do
  echo "Versuch $versuch von $BUILD_VERSUCHE ..."
  if PUPPETEER_SKIP_DOWNLOAD=true npm run build; then
    ERFOLG=0
    break
  fi
  echo "Build fehlgeschlagen."
  rm -rf .next
done

if [ $ERFOLG -ne 0 ]; then
  echo "── Build endgueltig fehlgeschlagen ─────────────────────────"
  if [ -d .next.bak ]; then
    rm -rf .next
    mv .next.bak .next
    pm2 restart "$APP" >/dev/null 2>&1
    echo "Alter Stand wiederhergestellt und neu gestartet. Seite laeuft."
  else
    echo "ACHTUNG: kein alter Build zum Zurueckfallen vorhanden."
  fi
  exit 1
fi

echo "── Umschalten ──────────────────────────────────────────────"
pm2 restart "$APP" >/dev/null 2>&1 || pm2 start "$APP" >/dev/null 2>&1
sleep 5
pm2 status "$APP" --no-color | grep "$APP"

echo "── Erreichbarkeit ──────────────────────────────────────────"
CODE=$(curl -s -o /dev/null -w "%{http_code}" --max-time 20 http://localhost:3000/)
echo "localhost:3000 -> HTTP $CODE"

if [ "$CODE" = "200" ]; then
  rm -rf .next.bak
  echo "Deploy erfolgreich."
else
  echo "ACHTUNG: Die Anwendung antwortet nicht mit 200. Alter Build liegt noch"
  echo "unter .next.bak — zum Zurueckrollen:"
  echo "  pm2 stop $APP && rm -rf .next && mv .next.bak .next && pm2 start $APP"
  exit 1
fi
