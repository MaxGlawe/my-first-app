import "./anzeigen.css"

/**
 * Layout der Anzeigen-Landingpages (/start/*).
 *
 * Die Seiten stehen bewusst allein: keine Navigation, keine Fußzeile der
 * Website, kein Weg wieder hinaus außer dem Buchungsknopf. Wer aus einer
 * Anzeige kommt, soll genau eine Entscheidung treffen können.
 *
 * ── Warum die Schriften von Hand eingebunden sind ────────────────────────
 *
 * Nicht über `next/font`, und das hat einen gemessenen Grund.
 *
 * Die Vorlage lädt `Source Serif 4` als VARIABLE Schrift mit der Achse
 * `opsz` (optische Größe, 8–60). Bei `font-optical-sizing: auto` — der
 * Voreinstellung — wählt der Browser die Zeichenform passend zur
 * Schriftgröße: bei 38 px schmaler und enger als bei 14 px. `next/font` mit
 * festen Gewichten liefert dagegen statische Schnitte, gezeichnet für 14 px.
 *
 * Der Unterschied ist keine Feinheit: Die große Überschrift der Vorlage
 * braucht vier Zeilen, mit statischen Schnitten fünf — 201 statt 161 Pixel
 * Höhe, und alles darunter verschiebt sich. Nachgemessen am 11.10.2026:
 * `font-variation-settings: "opsz" 38` ergibt 161 px, `"opsz" 14` ergibt
 * 201 px. Genau diese 40 px fehlten.
 *
 * Dazu kommt ein zweites Problem: `next/font` benennt seine Schriftfamilie
 * nach dem Google-Namen. Das Wurzel-Layout lädt `Source Serif 4` bereits
 * (ohne Kursive, mit festen Gewichten). Eine zweite Einbindung hätte
 * dieselbe Familie mit anderen Schnitten belegt — welcher gewinnt, hängt
 * dann an der Reihenfolge der Stylesheets. Eigene Familiennamen
 * („Anzeige Serif", „Anzeige Sans" in `anzeigen.css`) schließen das aus und
 * lassen die übrige Website unberührt.
 *
 * Die Dateien liegen als Teilsatz in `public/anzeigen/fonts/` — nur die
 * Zeichen, die hier vorkommen, Variationsachsen erhalten: 193 KB statt der
 * 276 KB, die die Vorlage von Google holt, und ohne Verbindungsaufbau zu
 * einem fremden Server. Dass dabei auch keine IP-Adresse unserer Besucher
 * zu Google geht, bevor irgendwer zugestimmt hat, ist der angenehme
 * Nebeneffekt.
 */

/**
 * Kein `<link rel="preload">` für die Schriften — gemessen und verworfen.
 *
 * Naheliegend wäre es: Die drei Dateien stehen im ersten Bildschirm, die
 * Kursive sogar in der Überschrift. Vorab geladen holt der Browser sie
 * aber mit HOHER Priorität, gleichzeitig mit dem Stylesheet, das das
 * Zeichnen blockiert — und auf 1,6 Mbit/s teilen sich beide dieselbe
 * Leitung. Gemessen am 11.10.2026 (leerer Cache, CPU vierfach gebremst):
 * mit Vorabladen 2,2 s bis zum ersten Bild, ohne 2,0 s. Die Schriften
 * kommen nun eine Rundreise später; `font-display: swap` zeigt den Text
 * bis dahin im Rückfall. Lieber Text sofort in Georgia als nichts in
 * Source Serif.
 */
export default function AnzeigenLayout({ children }: { children: React.ReactNode }) {
  return <div className="anzeige">{children}</div>
}
