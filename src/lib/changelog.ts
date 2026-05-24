/**
 * Changelog / „Was ist neu" — Update-Meldungen für die Patienten-App.
 *
 * Neueste Version steht oben (Index 0). Pro Release ein Eintrag. Der
 * WhatsNewDialog zeigt den neuesten Eintrag genau einmal (localStorage-Merker
 * `praxis_os_whatsnew_seen` = zuletzt gesehene `version`). Die Verlaufsseite
 * `/app/neuigkeiten` listet alle Einträge.
 *
 * Inhalt redaktionell pflegbar — einfach oben einen neuen Eintrag mit höherer
 * `version` einfügen; der Dialog erscheint dann automatisch beim nächsten Login.
 */

export type ChangelogBadge = "Neu" | "Verbessert"

export interface ChangelogItem {
  /** Emoji als visueller Anker (kein Asset nötig). */
  emoji: string
  badge?: ChangelogBadge
  title: string
  text: string
}

export interface ChangelogEntry {
  /** Monoton steigend, z.B. "2026.05". Dient als „gesehen"-Schlüssel. */
  version: string
  /** ISO-Datum (YYYY-MM-DD) — wird deutsch formatiert angezeigt. */
  date: string
  headline: string
  intro?: string
  items: ChangelogItem[]
}

export const CHANGELOG: ChangelogEntry[] = [
  {
    version: "2026.05",
    date: "2026-05-24",
    headline: "Praxis OS entwickelt sich weiter",
    intro: "Wir haben in den letzten Wochen kräftig gebaut — das ist neu für dich:",
    items: [
      {
        emoji: "💧",
        badge: "Neu",
        title: "Hydration-Tracker",
        text: "Behalte deine tägliche Trinkmenge im Blick — direkt auf deinem Dashboard, mit einem Tipp pro Glas.",
      },
      {
        emoji: "🔥",
        badge: "Neu",
        title: "Streak & Erfolge",
        text: "Bleib dran und sammle Tage in Folge. Für deine Meilensteine schaltest du Auszeichnungen frei.",
      },
      {
        emoji: "🎯",
        badge: "Neu",
        title: "Challenges",
        text: "Geführte Programme, die dich Tag für Tag begleiten — jetzt fest in deiner Navigation.",
      },
      {
        emoji: "📓",
        badge: "Verbessert",
        title: "Befinden & Schmerz-Check",
        text: "Halte fest, wie es dir geht. Dein Therapeut sieht den Verlauf und kann dich gezielter begleiten.",
      },
      {
        emoji: "🛍️",
        badge: "Neu",
        title: "Praxis OS Shop",
        text: "Es gibt jetzt einen eigenen Shop — stöbere durch Challenges und Bewegungskarten und schalte neue Inhalte frei. Einmal kaufen, dauerhaft behalten.",
      },
      {
        emoji: "🚗",
        badge: "Neu",
        title: "Bewegungskarten",
        text: "Kurze Bewegungsimpulse für deinen Alltag — zum Beispiel der Vielfahrer-Reset für Auto und Pendeln. Im Shop erhältlich.",
      },
    ],
  },
]

/** Version des neuesten Eintrags — Merker für „schon gesehen". */
export const LATEST_VERSION: string = CHANGELOG[0]?.version ?? ""

/** Datum deutsch formatieren, z.B. "Mai 2026". */
export function formatChangelogDate(iso: string): string {
  const d = new Date(iso)
  if (Number.isNaN(d.getTime())) return iso
  return d.toLocaleDateString("de-DE", { month: "long", year: "numeric" })
}
