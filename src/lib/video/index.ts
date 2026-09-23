/**
 * PROJ-27 — Die Schnittstelle zum Videodienst.
 *
 * Alles, was der Rest der Anwendung über Videogespräche wissen muss, steht
 * hier. Kein Aufruf von `livekit-server-sdk` ausserhalb von `livekit.ts`.
 *
 * Warum eine Abstraktion, obwohl es nur EINE Implementierung gibt:
 *
 * Das Briefing wollte zwei — LiveKit und Whereby als Notfallweg. Dagegen habe
 * ich argumentiert: Ein Pfad, der nur im Notfall läuft, wird nie benutzt und
 * ist deshalb im Notfall kaputt. Genau das haben wir am 23.09.2026 am
 * Buchungs-Webhook erlebt, der zwei Wochen lang jede Zustellung gegen die Wand
 * fahren liess, ohne dass es jemandem auffiel.
 *
 * Die Schnittstelle bleibt trotzdem. Sie kostet nichts, sie hält die Tür für
 * einen Wechsel offen, und sie hat einen sofortigen Nutzen: Sie zwingt dazu,
 * die Frage „was braucht die Anwendung eigentlich vom Videodienst?" einmal zu
 * beantworten. Es sind genau zwei Dinge — ein Raum und ein Zutritt.
 *
 * Die Rückfallebene ist bewusst kein Code, sondern ein Handgriff: im Zweifel
 * einen fremden Raum-Link von Hand in den Chat schicken.
 */

export type CallRolle = "therapeut" | "patient"

export interface ZutrittsWunsch {
  /** Raumname aus `video_calls.room_name`. */
  raum: string
  /** Eindeutig je Teilnehmer — wird zur LiveKit-Identity. */
  identitaet: string
  /** Angezeigter Name im Gespräch. */
  anzeigename: string
  rolle: CallRolle
  /** Ab wann der Zutritt ungültig wird. */
  gueltigBis: Date
}

export interface Zutritt {
  token: string
  /** WebSocket-Adresse des Signaling-Servers, z. B. wss://video.example.com */
  url: string
  gueltigBis: string
}

export interface VideoAnbieter {
  readonly name: string
  /**
   * Erzeugt einen Zutritt. Der Anbieter legt den Raum bei Bedarf implizit an —
   * bei LiveKit entsteht er beim ersten Beitritt, es braucht also keinen
   * getrennten Schritt „Raum anlegen".
   */
  zutritt(wunsch: ZutrittsWunsch): Promise<Zutritt>
  /** Beendet den Raum serverseitig und wirft alle Teilnehmer hinaus. */
  raumSchliessen(raum: string): Promise<void>
  /** Prüft die Signatur eines eingehenden Anbieter-Webhooks. */
  webhookPruefen(body: string, authHeader: string | null): Promise<unknown | null>
}

/**
 * Ist der Videodienst überhaupt eingerichtet?
 *
 * Bewusst eine eigene Abfrage: Die halbe Oberfläche soll sich ausblenden,
 * solange kein Server steht, statt Knöpfe anzubieten, die ins Leere führen.
 * Dasselbe Muster wie bei der Terminkarte — nichts zu zeigen heisst nichts
 * zeigen.
 */
export function videoEingerichtet(): boolean {
  return Boolean(
    process.env.LIVEKIT_API_KEY &&
      process.env.LIVEKIT_API_SECRET &&
      process.env.NEXT_PUBLIC_LIVEKIT_URL
  )
}

/** Anzeigetexte je Anlass — eine Quelle für Oberfläche, Mail und Push. */
export const ANLASS_TEXT: Record<string, { kurz: string; lang: string; dauerMin: number }> = {
  konsultation: {
    kurz: "Videokonsultation",
    lang: "Videokonsultation mit Eignungsprüfung",
    dauerMin: 30,
  },
  programm_sitzung: {
    kurz: "Video-Sitzung",
    lang: "Video-Sitzung im 90-Tage-Programm",
    dauerMin: 30,
  },
  verschlechterung: {
    kurz: "Zusätzliche Sitzung",
    lang: "Zusätzliche Video-Sitzung bei Verschlechterung",
    dauerMin: 30,
  },
  sonstiges: {
    kurz: "Videogespräch",
    lang: "Videogespräch",
    dauerMin: 30,
  },
}

export type Anlass = keyof typeof ANLASS_TEXT
