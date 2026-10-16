/**
 * „Was andere sagen" — zwei echte Google-Bewertungen.
 *
 * Steht an einer Stelle, weil derselbe Abschnitt auf drei Anzeigenseiten
 * erscheint und die Zitate dort WORTGLEICH stehen müssen. Dreimal
 * abgeschrieben wäre die dritte Fassung irgendwann eine andere — und bei
 * fremden Äusserungen ist das kein Schönheitsfehler: Ein Zitat, das vom
 * Original abweicht, ist keines mehr.
 *
 * ── Was hier bewusst NICHT steht ─────────────────────────────────────────
 *
 * Keine Fotos, keine Angaben zu Beschwerden, keine Aussagen über Ergebnisse
 * oder Heilung. Die beiden Texte sprechen über Organisation, Erreichbarkeit
 * und Zeit — nicht über Wirkung. Das ist bei Werbung für eine
 * heilkundliche Leistung der Unterschied zwischen einer Empfehlung und
 * einem Heilversprechen (§ 11 Abs. 1 Nr. 11 HWG: Äusserungen Dritter dürfen
 * nicht irreführend sein).
 *
 * ── Die Auslassung ───────────────────────────────────────────────────────
 *
 * Beide Zitate sind gekürzt, und die Kürzung ist mit `[…]` ausgewiesen.
 * Genau deshalb steht unter jeder Karte der Link zum Google-Profil: Dort
 * ist der vollständige Text nachzulesen. Eine gekürzte Äusserung ohne Weg
 * zum Original wäre eine Behauptung über einen Menschen, den niemand
 * fragen kann.
 */

/**
 * Das Profil, auf das die Praxis schon auf ihrer eigenen Startseite
 * verlinkt. Nicht neu erfunden: Eine zweite Adresse für dieselbe Sache
 * wäre eine Adresse, die irgendwann ins Leere zeigt.
 */
export const GOOGLE_PROFIL = "https://www.google.com/maps/place/Physiotherapie+Glawe/"

/** Monat und Jahr der Bewertungen — steht unter jeder Karte. */
const ZEITRAUM = "Oktober 2026"

/**
 * Die Zitate. Wortgleich übernommen, einschliesslich der ausgewiesenen
 * Auslassung. Hier wird nichts geglättet, gekürzt oder „verbessert".
 *
 * Die Anführungszeichen stehen NICHT im Text, sondern erst in der
 * Darstellung. Grund: Ein typografisches Schlusszeichen ist in dieser
 * Codebasis schon mehrfach als ASCII-Zoll (") hereingerutscht und hat die
 * Zeichenkette beendet — die dokumentierte Falle aus CLAUDE.md. Was nicht
 * im String steht, kann ihn nicht sprengen.
 */
export const BEWERTUNGEN = {
  sarah: {
    name: "Sarah K.",
    zitat:
      "Ich habe die App genutzt, weil es das Zeitfenster privat nicht anders zuließ. […] Auch bei Fragen immer eine schnelle, freundliche Antwort und Hilfestellung. Kann es nur weiterempfehlen.",
  },
  scarlett: {
    name: "Scarlett M.",
    zitat:
      "Hab die neue Online-Therapie genutzt und war sehr zufrieden. […] Die Organisation und Terminplanung hat super funktioniert, auch wenn mal ein Termin verschoben werden musste.",
  },
} as const

export type BewertungsSchluessel = keyof typeof BEWERTUNGEN

/** Dunkel im Abschlussblock, hell zwischen den weissen Karten. */
type Ton = "dunkel" | "hell"

const FARBEN: Record<Ton, { grund: string; text: string; leise: string; stern: string }> = {
  dunkel: { grund: "#17382A", text: "#F5F1EA", leise: "#B9CEC2", stern: "#A8DCC0" },
  hell: { grund: "#FFFFFF", text: "#1C3A2D", leise: "#5A6B62", stern: "#2B6A4E" },
}

/** Fünf Sterne. Ein Bild wäre ein Abruf mehr für etwas, das 24 Pixel hat. */
function Sterne({ farbe }: { farbe: string }) {
  return (
    <span
      role="img"
      aria-label="5 von 5 Sternen"
      style={{ display: "inline-flex", gap: "2px", lineHeight: "1" }}
    >
      {[0, 1, 2, 3, 4].map((i) => (
        <svg key={i} width="15" height="15" viewBox="0 0 24 24" fill={farbe} aria-hidden="true">
          <path d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z" />
        </svg>
      ))}
    </span>
  )
}

export function BewertungsKarte({
  wer,
  ton = "dunkel",
}: {
  wer: BewertungsSchluessel
  ton?: Ton
}) {
  const b = BEWERTUNGEN[wer]
  const f = FARBEN[ton]
  return (
    <figure
      style={{
        margin: "0",
        background: f.grund,
        borderRadius: "20px",
        padding: "18px",
        display: "flex",
        flexDirection: "column",
        gap: "10px",
      }}
    >
      <Sterne farbe={f.stern} />
      <blockquote
        style={{
          margin: "0",
          fontFamily: "var(--font-anzeige-serif), Georgia, serif",
          fontStyle: "italic",
          fontSize: "17px",
          lineHeight: "1.4",
          color: f.text,
        }}
      >
        „{b.zitat}“
      </blockquote>
      <figcaption style={{ display: "flex", flexDirection: "column", gap: "2px" }}>
        <span style={{ fontSize: "14px", fontWeight: "700", color: f.text }}>{b.name}</span>
        {/*
          Der Link öffnet einen neuen Tab: Wer die Bewertung nachlesen will,
          soll die Seite nicht verlieren — sonst ist der Besuch aus der
          Anzeige bei Google zu Ende. `noopener` ist Pflicht, `nofollow`
          höflich gegenüber dem fremden Profil.
        */}
        <a
          href={GOOGLE_PROFIL}
          target="_blank"
          rel="noopener nofollow"
          style={{ fontSize: "12px", color: f.leise, textDecoration: "underline" }}
        >
          Google-Bewertung · {ZEITRAUM}
        </a>
      </figcaption>
    </figure>
  )
}

/**
 * Der Abschnitt mit beiden Karten.
 *
 * `reihenfolge` wird von der Seite bestimmt und nicht hier festgelegt: Auf
 * der Alltags-Anzeige steht Sarah vorn, weil ihr Satz von fehlender Zeit
 * spricht und die Anzeige genau damit geworben hat. Wer aus einer Anzeige
 * kommt, soll zuerst den Satz lesen, der zu ihr gehört.
 */
export function Bewertungen({ reihenfolge }: { reihenfolge: readonly BewertungsSchluessel[] }) {
  return (
    <div style={{ display: "flex", flexDirection: "column", gap: "12px" }}>
      <p
        style={{
          margin: "0",
          fontSize: "12px",
          letterSpacing: "0.14em",
          textTransform: "uppercase",
          fontWeight: "700",
          color: "#A8DCC0",
        }}
      >
        Was andere sagen
      </p>
      {reihenfolge.map((wer) => (
        <BewertungsKarte key={wer} wer={wer} ton="dunkel" />
      ))}
    </div>
  )
}
