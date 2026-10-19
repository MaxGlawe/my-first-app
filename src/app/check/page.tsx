import type { Metadata } from "next"
import { Suspense } from "react"
import { MetaPixel } from "@/components/analytics/MetaPixel"
import { LandingAnalytics } from "@/components/landing/LandingAnalytics"
import { ConsentEinstellungenLink } from "@/components/analytics/ConsentBanner"
import { AnzeigeBild } from "@/components/anzeigen/AnzeigeBild"
import { BewertungsKarte } from "@/components/anzeigen/Bewertungen"
import { SchmerzcheckKarte } from "@/components/check/SchmerzcheckKarte"
import "../start/anzeigen.css"

/**
 * Anzeigen-Landingpage „Schmerzcheck" — sechs Fragen, Einschätzung, Buchung.
 *
 * Gleiches Gewand wie /start/*: dieselben Schriften (Anzeige Serif/Sans aus
 * `anzeigen.css`), dieselbe Spalte, derselbe Kopf, dieselbe Einwilligungs-
 * leiste aus dem Wurzel-Layout. Anders ist nur der Einstieg: Statt eines
 * Buchungsknopfes steht im Hero eine Karte, in der der Check sofort beginnt.
 *
 * ── Warum die Karte IM Hero steht ────────────────────────────────────────
 *
 * Weil der Knopf „Check starten" auf dem Handy ohne Scrollen erreichbar sein
 * muss, auch wenn unten die Einwilligungsleiste steht. Ein eigener Abschnitt
 * darunter hätte denselben Inhalt, aber eine Bildschirmhöhe später — und
 * damit nur noch die Hälfte der Leute.
 *
 * ── Keine feste Buchungsleiste ───────────────────────────────────────────
 *
 * Die anderen Anzeigenseiten tragen unten eine mitlaufende Leiste mit dem
 * Buchungsknopf. Hier wäre sie falsch: Wer die Sicherheitsfrage mit „ja"
 * beantwortet, soll genau KEIN Buchungsangebot sehen — eine Leiste, die
 * trotzdem „Kennenlernen buchen" anbietet, würde den Hinweis auf ärztliche
 * Abklärung aushebeln.
 *
 * `noindex`: Anzeigenseite. Sie überschneidet sich inhaltlich mit der
 * Startseite, steht in keiner Navigation und in keiner Sitemap.
 */

export const metadata: Metadata = {
  title: "Passt Physio per App zu dir? | Praxis OS",
  description:
    "Sechs kurze Fragen zu deiner Situation. Danach weißt du, ob eine begleitete Betreuung von zu Hause für dich in Frage kommt. Ohne Anmeldung, ohne E-Mail.",
  robots: { index: false, follow: true },
  alternates: { canonical: "https://wwwpraxis-os.com/check" },
}

const serif = "var(--font-anzeige-serif), Georgia, serif"

const SCHRITTE = [
  { titel: "Check machen", text: "Sechs Fragen, du tippst nur an." },
  { titel: "Einschätzung lesen", text: "Sofort auf dem Bildschirm, ohne E-Mail." },
  {
    titel: "Kostenlos kennenlernen",
    text: "20 Minuten per Video mit Max. Du erzählst, er hört zu. Danach entscheidest du.",
  },
]

export default function CheckPage() {
  return (
    <>
      {/* Nur PageView an Meta — wie auf allen Anzeigenseiten. Der Check
          selbst meldet nichts dorthin, weder Antworten noch Schritte. */}
      <MetaPixel />
      {/*
        Der Seitenaufruf. Ohne ihn gibt es die Sitzung in der Auswertung
        nicht — und dann fallen auch alle `check_*`-Ereignisse unter den
        Tisch, weil der Trichter jede Sitzung aus ihren Seitenaufrufen
        zusammensetzt. Genau so war es beim Livegang der /start-Seiten:
        200 Ereignisse, kein Seitenaufruf, im Dashboard nichts.

        Steht hier und nicht im Layout: Diese Seite liegt bewusst NICHT
        unter /start (die Anzeigen verweisen auf /check), und das Layout
        dort gilt nur fuer seine eigenen Kinder.
      */}
      <Suspense fallback={null}>
        <LandingAnalytics />
      </Suspense>
      {/* `.anzeige` traegt Schrift, Textfarbe und die Grundregeln der
          Vorlage — auf /start/* kommt der Wrapper aus dem Layout. */}
      <div className="anzeige">
      <main className="page" style={{ fontSize: "16px", lineHeight: "1.55" }}>
        {/* HERO mit der Check-Karte */}
        <section
          id="einstieg"
          className="check-hero"
          style={{ background: "#0F2A1F", color: "#F5F1EA", padding: "18px 20px 30px", display: "flex", flexDirection: "column", gap: "18px" }}
        >
          <div style={{ display: "flex", alignItems: "center", gap: "10px" }}>
            <AnzeigeBild name="logo" alt="Logo Physiotherapie Glawe" sofort width={34} height={34} style={{ width: "34px", height: "34px", borderRadius: "50%", objectFit: "cover" }} />
            <div style={{ display: "flex", flexDirection: "column", lineHeight: "1.15" }}>
              <span style={{ fontFamily: serif, fontWeight: "600", fontSize: "17px" }}>Praxis OS</span>
              <span style={{ fontSize: "12px", color: "#B9CEC2" }}>by Physiotherapie Glawe</span>
            </div>
          </div>

          <h1 style={{ margin: "0", fontFamily: serif, fontWeight: "600", fontSize: "36px", lineHeight: "1.06", letterSpacing: "-0.015em" }}>
            Passt Physio per App zu dir?{" "}
            <span style={{ fontStyle: "italic", color: "#A8DCC0" }}>Finde es in einer Minute heraus.</span>
          </h1>

          <p className="check-lead" style={{ margin: "0", fontSize: "17px", color: "#D7E3DC" }}>
            Sechs kurze Fragen zu deiner Situation. Danach weißt du, ob eine begleitete Betreuung von
            zu Hause für dich in Frage kommt.
          </p>

          <ul className="check-chips" style={{ display: "flex", flexWrap: "wrap", gap: "8px", margin: "0", padding: "0", listStyle: "none" }}>
            {["6 Fragen", "unter 1 Minute", "ohne Anmeldung"].map((t) => (
              <li key={t} style={{ border: "1px solid #3C5E4E", borderRadius: "999px", padding: "5px 12px", fontSize: "14px", color: "#E3ECE6" }}>
                {t}
              </li>
            ))}
          </ul>

          <SchmerzcheckKarte />
        </section>

        {/* So geht es weiter */}
        <section id="ablauf" style={{ padding: "34px 20px 30px", display: "flex", flexDirection: "column", gap: "14px" }}>
          <p style={{ margin: "0", fontSize: "12px", letterSpacing: "0.14em", textTransform: "uppercase", fontWeight: "700", color: "#2B6A4E" }}>
            So geht es weiter
          </p>
          <h2 style={{ margin: "0 0 4px", fontFamily: serif, fontWeight: "600", fontSize: "28px", lineHeight: "1.15" }}>
            Vom Check zum ersten Gespräch
          </h2>
          <ol style={{ listStyle: "none", margin: "0", padding: "0", display: "grid", gap: "14px" }}>
            {SCHRITTE.map((s, i) => (
              <li key={s.titel} style={{ display: "grid", gridTemplateColumns: "36px 1fr", gap: "14px", alignItems: "start" }}>
                <span
                  aria-hidden="true"
                  style={{ width: "36px", height: "36px", borderRadius: "50%", background: "#0F2A1F", color: "#A8DCC0", display: "grid", placeItems: "center", fontFamily: serif, fontWeight: "600", fontSize: "18px" }}
                >
                  {i + 1}
                </span>
                <span>
                  <b style={{ display: "block", fontSize: "17px" }}>{s.titel}</b>
                  <span style={{ color: "#5B6A62", fontSize: "15.5px" }}>{s.text}</span>
                </span>
              </li>
            ))}
          </ol>
        </section>

        {/* Eine Stimme von aussen — dieselbe Karte wie auf den anderen Seiten. */}
        <section id="stimmen" style={{ padding: "0 20px 34px" }}>
          <BewertungsKarte wer="sarah" ton="hell" />
        </section>

        <footer style={{ padding: "24px 20px 40px", display: "flex", flexDirection: "column", gap: "10px", fontSize: "13px", color: "#4A5A52", borderTop: "1px solid #E4DED3" }}>
          <p style={{ margin: "0" }}>
            Max Glawe · Physiotherapeut, Heilpraktiker für Physiotherapie · Wildau
          </p>
          {/* Steht hier und nicht im Kleingedruckten: Der Check ordnet ein,
              er untersucht nicht. */}
          <p style={{ margin: "0" }}>Der Check ersetzt keine Untersuchung und keine Diagnose.</p>
          <div style={{ display: "flex", flexWrap: "wrap", gap: "16px" }}>
            <a href="/impressum" style={{ color: "#33433B" }}>Impressum</a>
            <a href="/datenschutz" style={{ color: "#33433B" }}>Datenschutz</a>
            <ConsentEinstellungenLink className="js-cookie-settings" style={{ color: "#33433B" }} />
          </div>
        </footer>
      </main>
      </div>
    </>
  )
}
