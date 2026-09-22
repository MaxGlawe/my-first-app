"use client"

/**
 * PROJ-26: Die Betreuung über 90 Tage als Bild.
 *
 * Eine Linie, auf der die Kontaktpunkte vorne dicht stehen und nach hinten
 * auseinanderrücken, bis sie offen ausläuft. Das ist das Angebot in einem
 * Blick: eng begleitet, Schritt für Schritt allein weiter.
 *
 * Die Positionen sind nicht dekorativ, sondern die echte Taktung — Woche 1
 * bis 4 wöchentlich, dann vierzehntägig, zum Schluss Zwischen- und
 * Abschlussgespräch. Wer die Taktung ändert, ändert sie hier mit.
 *
 * Bewusst inline-SVG statt Bilddatei: skaliert verlustfrei, trägt die
 * Markenfarben, kostet keinen Ladevorgang und braucht kein Fotomaterial.
 */

/** Wochen, in denen eine Video-Sitzung stattfindet. */
const SITZUNGEN = [1, 2, 3, 4, 6, 8, 10, 12]
const WOCHEN_GESAMT = 12

/** Linkes und rechtes Polster, damit Start- und Endpunkt nicht am Rand kleben. */
const PAD = 4
const x = (woche: number) => PAD + ((woche - 1) / (WOCHEN_GESAMT - 1)) * (100 - 2 * PAD)

const GREEN = "#2C3E2D"
const SAND = "#C9B79C"
const LINE = "#e7e1d6"
const MUTED = "#64748b"
const INK = "#0f172a"

export function BetreuungsbogenGrafik({ className }: { className?: string }) {
  return (
    <figure className={className}>
      <svg
        viewBox="0 0 100 26"
        preserveAspectRatio="none"
        className="h-[110px] w-full sm:h-[130px]"
        role="img"
        aria-label="Zeitachse über zwölf Wochen: In den Wochen 1 bis 4 findet wöchentlich eine Video-Sitzung statt, in den Wochen 5 bis 8 alle zwei Wochen, in den Wochen 9 bis 12 ein Zwischengespräch und das Abschlussgespräch."
      >
        <defs>
          {/* Von kräftig nach hell: die Begleitung wird lockerer, nicht schwächer. */}
          <linearGradient id="bogen" x1="0" y1="0" x2="1" y2="0">
            <stop offset="0%" stopColor={GREEN} />
            <stop offset="55%" stopColor={GREEN} stopOpacity="0.55" />
            <stop offset="100%" stopColor={SAND} stopOpacity="0.5" />
          </linearGradient>
        </defs>

        {/* Grundlinie */}
        <line x1={PAD} y1="13" x2={100 - PAD} y2="13" stroke={LINE} strokeWidth="0.4" />
        <line
          x1={PAD}
          y1="13"
          x2={100 - PAD}
          y2="13"
          stroke="url(#bogen)"
          strokeWidth="0.9"
          strokeLinecap="round"
        />

        {/* Kontaktpunkte */}
        {SITZUNGEN.map((w, i) => (
          <g key={w}>
            <circle
              cx={x(w)}
              cy="13"
              r={i === SITZUNGEN.length - 1 ? 1.6 : 1.15}
              fill="#FFFFFF"
              stroke={i === SITZUNGEN.length - 1 ? SAND : GREEN}
              strokeWidth="0.65"
              vectorEffect="non-scaling-stroke"
            />
          </g>
        ))}
      </svg>

      {/* Beschriftung als echter Text — nicht im SVG, damit sie lesbar,
          durchsuchbar und für Vorleseprogramme erreichbar bleibt. */}
      <figcaption className="mt-3 grid grid-cols-3 gap-2 text-center">
        {[
          { phase: "Woche 1–4", takt: "wöchentlich" },
          { phase: "Woche 5–8", takt: "alle zwei Wochen" },
          { phase: "Woche 9–12", takt: "Zwischen- und Abschlussgespräch" },
        ].map((s) => (
          <div key={s.phase}>
            <span className="block text-[12px] font-semibold" style={{ color: INK }}>
              {s.phase}
            </span>
            <span className="mt-0.5 block text-[11.5px] leading-snug" style={{ color: MUTED }}>
              {s.takt}
            </span>
          </div>
        ))}
      </figcaption>
    </figure>
  )
}
