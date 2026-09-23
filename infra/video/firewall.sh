#!/usr/bin/env bash
# PROJ-27 — Firewall des Video-Servers. Genau vier Regeln, mehr braucht es nicht.
set -euo pipefail

ufw --force reset
ufw default deny incoming
ufw default allow outgoing

ufw allow 22/tcp        comment 'SSH'
ufw allow 80/tcp        comment 'HTTP - nur fuer den Zertifikatsbezug'
ufw allow 443/tcp       comment 'HTTPS + WSS Signaling'
ufw allow 5349/tcp      comment 'TURN ueber TLS - fuer Firmennetze'
ufw allow 7881/tcp      comment 'WebRTC ueber TCP - Rueckfallebene'
ufw allow 7882/udp      comment 'WebRTC Medien (UDP-Mux, EIN Port)'

ufw --force enable
ufw status verbose
