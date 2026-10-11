import { KonsultationLink } from "@/components/landing/KonsultationLink"
import { AnzeigeBild } from "@/components/anzeigen/AnzeigeBild"

/**
 * Die feste Buchungsleiste am unteren Bildschirmrand.
 *
 * Das wichtigste Element der Anzeigen-Seiten: Wer auf dem Handy zwei Meter
 * Seite herunterscrollt, soll an jeder Stelle buchen können, ohne zurück
 * nach oben zu müssen.
 *
 * Zwei Dinge, die zusammengehören und beide in `anzeigen.css` stehen:
 *
 *   - `padding-bottom: 110px` auf `.page`, sonst liegt die Fußzeile mit
 *     Impressum und Datenschutz unter der Leiste.
 *   - `body.consent-open .sticky-cta { display: none }` — solange das
 *     Einwilligungsbanner offen ist, verschwindet die Leiste. Beides sitzt
 *     unten; zusammen würde die Leiste den Ablehnen-Knopf verdecken.
 *
 * Die Klasse `js-book` bleibt am Knopf, obwohl kein Skript sie mehr braucht:
 * Sie ist der Name, unter dem die Buchungsknöpfe in der Vorlage und in der
 * Abstimmung geführt werden.
 */
export function StickyBuchung({ abschnitt }: { abschnitt: string }) {
  return (
    <div className="sticky-cta" role="region" aria-label="Termin buchen">
      <div className="sticky-cta__inner">
        <AnzeigeBild name="max-klein" alt="" className="sticky-cta__avatar" sofort width={44} height={44} />
        <KonsultationLink
          abschnitt={abschnitt}
          metaMelden={false}
          className="js-book sticky-cta__btn"
        >
          Konsultation buchen · 69 €
          <svg
            width="18"
            height="18"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="2"
            strokeLinecap="round"
            strokeLinejoin="round"
            aria-hidden="true"
          >
            <path d="M5 12h14" />
            <path d="M13 6l6 6-6 6" />
          </svg>
        </KonsultationLink>
      </div>
      <span className="sticky-cta__note">30 Min per Video · wird angerechnet</span>
    </div>
  )
}
