/**
 * PROJ-27 — LiveKit-Implementierung der Video-Schnittstelle.
 *
 * Die EINZIGE Datei, die `livekit-server-sdk` kennt. Sie läuft
 * ausschliesslich serverseitig: API-Key und Secret dürfen den Server nie
 * verlassen, weshalb der Zutritts-Endpunkt sie benutzt und nicht der Browser.
 *
 * Zum Zuschnitt der Rechte im Token: Ein Teilnehmer darf beitreten, senden
 * und empfangen — mehr nicht. Kein `roomAdmin`, kein `roomCreate`, kein
 * `canUpdateOwnMetadata`. Wer ein Token abgreift, kann damit an einem
 * Gespräch teilnehmen; er kann keine fremden Räume auflisten, keine
 * Teilnehmer hinauswerfen und keine Aufzeichnung starten.
 *
 * Aufzeichnung ist nirgends vorgesehen und Egress wird auf dem Server gar
 * nicht erst installiert. Ein Gespräch über Gesundheit wird nicht
 * mitgeschnitten — nicht, weil es technisch schwierig wäre, sondern weil es
 * niemand erwartet.
 */

import { AccessToken, RoomServiceClient, WebhookReceiver } from "livekit-server-sdk"
import type { VideoAnbieter, ZutrittsWunsch, Zutritt } from "./index"

function konfiguration() {
  const key = process.env.LIVEKIT_API_KEY
  const secret = process.env.LIVEKIT_API_SECRET
  const wsUrl = process.env.NEXT_PUBLIC_LIVEKIT_URL

  if (!key || !secret || !wsUrl) {
    throw new Error(
      "Videodienst ist nicht eingerichtet (LIVEKIT_API_KEY, LIVEKIT_API_SECRET, NEXT_PUBLIC_LIVEKIT_URL)."
    )
  }
  // Die Verwaltungs-API spricht HTTPS, das Signaling WSS — dieselbe Adresse,
  // anderes Schema.
  const httpUrl = wsUrl.replace(/^ws/, "http")
  return { key, secret, wsUrl, httpUrl }
}

export const livekitAnbieter: VideoAnbieter = {
  name: "livekit",

  async zutritt(wunsch: ZutrittsWunsch): Promise<Zutritt> {
    const { key, secret, wsUrl } = konfiguration()

    // Die Gültigkeit des Tokens endet, wenn das Zutrittsfenster des Gesprächs
    // endet — nicht nach einer festen Spanne. Sonst überlebt ein Token das
    // Gespräch, zu dem es gehört.
    const sekunden = Math.max(
      60,
      Math.floor((wunsch.gueltigBis.getTime() - Date.now()) / 1000)
    )

    const at = new AccessToken(key, secret, {
      identity: wunsch.identitaet,
      name: wunsch.anzeigename,
      ttl: sekunden,
      // Die Rolle steuert im Browser die Ansicht (Seitenleiste ja/nein) und
      // steht im Protokoll. Sie ist nicht sicherheitsrelevant — die
      // Berechtigung hängt an den Grants unten, nicht an diesem Text.
      metadata: JSON.stringify({ rolle: wunsch.rolle }),
    })

    at.addGrant({
      room: wunsch.raum,
      roomJoin: true,
      canPublish: true,
      canSubscribe: true,
      // Datenkanal: traegt spaeter die Live-Vorschau der Patienten-App.
      canPublishData: true,
    })

    return {
      token: await at.toJwt(),
      url: wsUrl,
      gueltigBis: wunsch.gueltigBis.toISOString(),
    }
  },

  async raumSchliessen(raum: string): Promise<void> {
    const { key, secret, httpUrl } = konfiguration()
    const svc = new RoomServiceClient(httpUrl, key, secret)
    try {
      await svc.deleteRoom(raum)
    } catch (err) {
      // Ein Raum, den es nicht mehr gibt, ist kein Fehler — genau das war das
      // Ziel. Alles andere soll sichtbar sein, aber den Aufrufer nicht
      // scheitern lassen: Das Gespräch ist in unserer Datenbank ohnehin
      // beendet.
      console.error("[video/livekit] Raum konnte nicht geschlossen werden:", err)
    }
  },

  async webhookPruefen(body: string, authHeader: string | null) {
    if (!authHeader) return null
    const { key, secret } = konfiguration()
    try {
      const receiver = new WebhookReceiver(key, secret)
      return await receiver.receive(body, authHeader)
    } catch (err) {
      console.error("[video/livekit] Webhook-Signatur ungueltig:", err)
      return null
    }
  },
}

/**
 * Der aktive Anbieter.
 *
 * Bewusst eine Funktion und keine Konstante: Sie liest die Umgebung beim
 * Aufruf. Ein Konfigurationswechsel braucht damit einen Neustart, aber keinen
 * neuen Build — dieselbe Eigenschaft, die beim Buchungs-Secret nützlich war.
 */
export function videoAnbieter(): VideoAnbieter {
  const gewaehlt = (process.env.VIDEO_ANBIETER ?? "livekit").toLowerCase()
  if (gewaehlt !== "livekit") {
    throw new Error(
      `Unbekannter Videoanbieter „${gewaehlt}". Eingebaut ist derzeit nur „livekit".`
    )
  }
  return livekitAnbieter
}
