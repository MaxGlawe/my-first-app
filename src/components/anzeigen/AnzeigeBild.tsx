/**
 * Ein Bild auf den Anzeigen-Seiten: WebP mit JPG/PNG als Rückfall.
 *
 * ── Warum `display: contents` auf dem `<picture>` ────────────────────────
 *
 * Die Bilder der Vorlage sitzen als Flex-Kinder oder absolut positioniert in
 * ihren Kästen, und ihre Maße stehen in eigenen Inline-Stilen. Ein
 * zusätzliches `<picture>` wäre ein zusätzlicher Kasten — es würde zum
 * Flex-Kind und das `<img>` darin verlöre seine Position. `display: contents`
 * nimmt dem `<picture>` genau diesen Kasten: Es bleibt im Dokument, aber
 * nicht im Layout, und das `<img>` wird wieder selbst das Flex-Kind.
 *
 * Dazu gehört zwingend `.anzeige picture > source { display: none }` in
 * `anzeigen.css`: Sonst wird auch das `<source>` zum Flex-Kind — unsichtbar,
 * null Pixel groß und trotzdem eine weitere `gap`-Lücke. Im
 * Abschluss-Abschnitt waren das 18 px zu viel.
 *
 * ── Warum `max` in zwei Größen vorliegt ──────────────────────────────────
 *
 * Dasselbe Porträt erscheint einmal 400 px hoch und viermal als Rundbild
 * zwischen 18 und 64 px. Zuerst lud auch jedes Rundbild die 800×1000-Datei:
 * 53 KB für einen 44-Pixel-Kreis, und zwar im ersten Bildschirm, wo sie dem
 * render-blockierenden Stylesheet die Bandbreite wegnahm. `max-klein` ist
 * 160 px breit und 4,8 KB groß.
 *
 * Ohne `next/image`: Die Bilder liegen fest, ihre Maße stehen in den
 * Inline-Stilen, und ein zweiter Wrapper (den `next/image` mitbringt) wäre
 * genau das Problem von oben.
 */

/** Dateiname ohne Endung in `public/anzeigen/`. */
export type AnzeigeBildName = "logo" | "max" | "max-klein" | "sabine"

const RUECKFALL: Record<AnzeigeBildName, string> = {
  logo: "/anzeigen/logo.png",
  max: "/anzeigen/max.jpg",
  "max-klein": "/anzeigen/max-klein.jpg",
  sabine: "/anzeigen/sabine.jpg",
}

export function AnzeigeBild({
  name,
  alt,
  style,
  className,
  /**
   * Bilder im ersten Bildschirm: sofort laden, nicht verzögert. Alles
   * darunter bleibt `lazy` — ein Porträt auf halber Seitenhöhe darf den
   * ersten Eindruck nicht aufhalten.
   */
  sofort = false,
  /**
   * Vorrang vor allem anderen. Nur für das EINE Bild, das den ersten
   * Bildschirm prägt. Jedes weitere `high` nimmt dem Stylesheet Bandbreite
   * weg, und ohne Stylesheet wird gar nichts gezeichnet.
   */
  vorrang = false,
  width,
  height,
}: {
  name: AnzeigeBildName
  alt: string
  style?: React.CSSProperties
  className?: string
  sofort?: boolean
  vorrang?: boolean
  width?: number
  height?: number
}) {
  return (
    <picture style={{ display: "contents" }}>
      <source srcSet={`/anzeigen/${name}.webp`} type="image/webp" />
      {/* eslint-disable-next-line @next/next/no-img-element */}
      <img
        src={RUECKFALL[name]}
        alt={alt}
        className={className}
        style={style}
        width={width}
        height={height}
        loading={sofort ? "eager" : "lazy"}
        fetchPriority={vorrang ? "high" : "auto"}
        decoding={sofort ? "sync" : "async"}
      />
    </picture>
  )
}
