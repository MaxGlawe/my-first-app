import type { Metadata } from "next"
import { Suspense } from "react"
import { MetaPixel } from "@/components/analytics/MetaPixel"
import { AufmerksamkeitMessen } from "@/components/analytics/AufmerksamkeitMessen"
import { LandingAnalytics } from "@/components/landing/LandingAnalytics"
import { KonsultationLink } from "@/components/landing/KonsultationLink"
import { ConsentEinstellungenLink } from "@/components/analytics/ConsentBanner"
import { AnzeigeBild } from "@/components/anzeigen/AnzeigeBild"
import { Bewertungen } from "@/components/anzeigen/Bewertungen"
import { SchmerzcheckKarte } from "@/components/check/SchmerzcheckKarte"
import { CheckFaq } from "@/components/check/CheckFaq"
import { ZumCheck } from "@/components/check/ZumCheck"
import { GEMESSENE_SEITEN } from "@/lib/gemessene-seiten"
import { KENNENLERNEN } from "@/lib/programm"
import {
  ERST_NACH_KENNENLERNEN,
  ERSTATTUNG,
  LEISTUNGEN,
  PAKETE,
  PREIS_AB,
  TAGE,
  ZAHLUNG,
} from "@/lib/check/produkt"
import "../start/anzeigen.css"

/**
 * Anzeigen-Landingpage „Schmerzcheck" — Produkt, Preis, Max und der Check.
 *
 * ── Umbau am 24.10.2026: erst erklären, dann fragen ──────────────────────
 *
 * Die erste Fassung erklärte nur den Check. 77 Menschen sahen eine
 * Einschätzung, 3 klickten auf „Kennenlernen", gebucht hat niemand — und in
 * den Anzeigen-Kommentaren fragten die Leute, was das kostet. Am Ende des
 * Checks stand ein Angebot, das niemand kannte.
 *
 * Der Check bleibt die Interaktion und steht weiter im Hero. Neu ist, dass
 * die Überschrift sagt, WAS es ist (Physiotherapie von zu Hause, 90 Tage),
 * die Chips sagen, was es KOSTET, und darunter Leistungen, Ablauf, Preise
 * und Max so stehen, dass niemand nach dem Ergebnis rätseln muss.
 *
 * ── Warum die Karte IM Hero steht ────────────────────────────────────────
 *
 * Weil der Knopf „Check starten" auf dem Handy ohne Scrollen erreichbar sein
 * muss, auch wenn unten die Einwilligungsleiste steht (Stufen in
 * `anzeigen.css`, `.check-hero`).
 *
 * ── Keine feste Buchungsleiste vor dem Ergebnis ──────────────────────────
 *
 * Wer die Sicherheitsfrage mit „ja" beantwortet, soll KEIN Buchungsangebot
 * sehen. Die Leiste erscheint deshalb erst mit der Einschätzung (in der
 * Karte). Die Buchungsknöpfe weiter unten sind Teil der Seite und stehen
 * dort wie auf /start/* — wer gar keinen Check macht, klärt die Eignung
 * im Kennenlernen.
 *
 * Gemessen wird über die gewohnten Wege: Abschnitte (`AufmerksamkeitMessen`,
 * Liste in `lib/gemessene-seiten`), Buchungsklicks über `KonsultationLink`
 * mit `check-hero` / `check-preise` / `check-abschluss`, dazu `faq_offen`,
 * `check_sprung` und `check_preise_aufgeklappt`. An Meta geht nur PageView.
 *
 * `noindex`: Anzeigenseite. Sie überschneidet sich inhaltlich mit der
 * Startseite, steht in keiner Navigation und in keiner Sitemap.
 */

export const metadata: Metadata = {
  title: "Physiotherapie von zu Hause – 90 Tage begleitet",
  description: `Physiotherapie von zu Hause, ${TAGE} Tage begleitet von deinem Therapeuten. Ab ${PREIS_AB} €, ohne Rezept. Mach den 1-Minuten-Check oder buche direkt ein kostenloses Kennenlernen.`,
  robots: { index: false, follow: true },
  alternates: { canonical: "https://wwwpraxis-os.com/check" },
}

const serif = "var(--font-anzeige-serif), Georgia, serif"
const GRUEN = "#0F2A1F"
const MINT = "#A8DCC0"
const AKZENT = "#2B6A4E"
const TEXT = "#33433B"

const ABLAUF = [
  {
    titel: "Kostenlos kennenlernen",
    text: "20 Minuten per Video. Du erzählst, Max hört zu. Danach entscheidest du, ob du starten willst.",
  },
  {
    titel: "Erstbefund und Plan",
    text: "Im ersten Termin untersucht Max dich per Video und erstellt deinen persönlichen Plan.",
  },
  {
    titel: `${TAGE} Tage begleitet`,
    text: "Am Anfang eng, dann Schritt für Schritt mehr Eigenständigkeit. Rückschlag? Dann meldest du dich und wir passen an.",
  },
  {
    titel: "Abschlussgespräch",
    text: "Wir schauen, was du erreicht hast und wie es für dich weitergeht.",
  },
]

/**
 * Frage 5 nennt dieselben vier Warnzeichen wie die Sicherheitsfrage im
 * Check (`lib/check/fragen`) — sonst widerspräche die Seite ihrem eigenen
 * Check. Wer dort etwas ändert, ändert es hier mit.
 */
const FAQ = [
  {
    frage: "Brauche ich ein Rezept?",
    antwort:
      "Nein. Als Heilpraktiker für Physiotherapie darf Max dich auch ohne ärztliche Verordnung untersuchen und behandeln.",
  },
  {
    frage: "Was brauche ich dafür?",
    antwort:
      "Ein Smartphone, Tablet oder einen Computer mit Kamera und etwas Platz zum Üben. Geräte sind meist nicht nötig. Falls doch, besprecht ihr das im Erstbefund.",
  },
  {
    frage: "Erstattet meine Versicherung die Kosten?",
    antwort:
      "Die gesetzliche Krankenkasse übernimmt das in der Regel nicht. Ob deine private Krankenversicherung, Beihilfe oder Zusatzversicherung etwas erstattet, hängt von deinem Vertrag ab. Du bekommst eine Heilpraktiker-Rechnung, die du einreichen kannst.",
  },
  {
    frage: "Ist das Kennenlernen wirklich kostenlos?",
    antwort: "Ja. 20 Minuten per Video, ohne Zahlungsdaten und ohne Verpflichtung.",
  },
  {
    frage: "Für wen ist das nicht geeignet?",
    antwort:
      "Bei neu aufgetretener Taubheit oder Lähmung, neuen Problemen beim Wasserlassen oder Stuhlgang, Fieber zusammen mit den Beschwerden oder nach einem schweren Sturz oder Unfall bitte zuerst ärztlich abklären lassen. Wenn im Kennenlernen klar wird, dass du besser in die Praxis kommst, sagt Max dir das ehrlich.",
  },
  {
    frage: `Was passiert nach den ${TAGE} Tagen?`,
    antwort:
      "Im Abschlussgespräch schaut ihr gemeinsam, wie es weitergeht. Es verlängert sich nichts automatisch. Eine Weiterbetreuung ist möglich, die besprecht ihr individuell.",
  },
] as const

const kicker: React.CSSProperties = {
  margin: "0",
  fontSize: "12px",
  letterSpacing: "0.14em",
  textTransform: "uppercase",
  fontWeight: 700,
  color: AKZENT,
}

const h2: React.CSSProperties = {
  margin: "0 0 4px",
  fontFamily: serif,
  fontWeight: 600,
  fontSize: "30px",
  lineHeight: "1.12",
}

const buchenKnopf: React.CSSProperties = {
  minHeight: "56px",
  borderRadius: "16px",
  background: MINT,
  color: GRUEN,
  textDecoration: "none",
  display: "flex",
  alignItems: "center",
  justifyContent: "center",
  gap: "10px",
  fontWeight: 700,
  fontSize: "17px",
}

function Pfeil() {
  return (
    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
      <path d="M5 12h14" />
      <path d="M13 6l6 6-6 6" />
    </svg>
  )
}

function Haken({ farbe = AKZENT }: { farbe?: string }) {
  return (
    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke={farbe} strokeWidth="2.6" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true" style={{ flex: "0 0 auto", marginTop: "3px" }}>
      <path d="M5 12l5 5 9-10" />
    </svg>
  )
}

/** Ein Symbol je Leistung — schlicht, in der Linienstärke der übrigen. */
const SYMBOLE = [
  // Video
  <path key="v" d="M3 7h12v10H3zM15 10l6-3v10l-6-3" />,
  // Plan
  <path key="p" d="M6 3h12v18H6zM9 8h6M9 12h6M9 16h4" />,
  // Chat
  <path key="c" d="M4 5h16v11H9l-5 4z" />,
  // Check-in
  <path key="k" d="M12 3a9 9 0 1 0 0 18 9 9 0 0 0 0-18zM8 12l3 3 5-6" />,
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
        zusammensetzt.

        Steht hier und nicht im Layout: Diese Seite liegt bewusst NICHT
        unter /start (die Anzeigen verweisen auf /check), und das Layout
        dort gilt nur fuer seine eigenen Kinder.
      */}
      <Suspense fallback={null}>
        <LandingAnalytics />
      </Suspense>
      <AufmerksamkeitMessen
        seite="check"
        abschnitte={GEMESSENE_SEITEN.check.abschnitte.map((a) => a.id)}
      />
      {/* `.anzeige` traegt Schrift, Textfarbe und die Grundregeln der
          Vorlage — auf /start/* kommt der Wrapper aus dem Layout. */}
      <div className="anzeige">
      <main className="page" style={{ fontSize: "16px", lineHeight: "1.55" }}>
        {/* HERO: was es ist, was es kostet, wer dahintersteht — und der Check */}
        <section
          id="einstieg"
          className="check-hero"
          style={{ background: GRUEN, color: "#F5F1EA", padding: "18px 20px 30px", display: "flex", flexDirection: "column", gap: "16px" }}
        >
          <div style={{ display: "flex", alignItems: "center", gap: "10px" }}>
            <AnzeigeBild name="logo" alt="Logo Physiotherapie Glawe" sofort width={34} height={34} style={{ width: "34px", height: "34px", borderRadius: "50%", objectFit: "cover" }} />
            <div style={{ display: "flex", flexDirection: "column", lineHeight: "1.15" }}>
              <span style={{ fontFamily: serif, fontWeight: "600", fontSize: "17px" }}>Praxis OS</span>
              <span style={{ fontSize: "12px", color: "#B9CEC2" }}>by Physiotherapie Glawe</span>
            </div>
          </div>

          <h1 style={{ margin: "0", fontFamily: serif, fontWeight: "600", fontSize: "36px", lineHeight: "1.06", letterSpacing: "-0.015em" }}>
            Physiotherapie von zu Hause.{" "}
            <span style={{ fontStyle: "italic", color: MINT }}>{TAGE} Tage begleitet von deinem Therapeuten.</span>
          </h1>

          <p className="check-lead" style={{ margin: "0", fontSize: "17px", color: "#D7E3DC" }}>
            Du bekommst einen Plan, der zu deinem Alltag passt, und übst, wann es dir passt. Max
            bleibt per Chat und Video an deiner Seite – Schritt für Schritt, bis du es allein
            schaffst.
          </p>

          <ul className="check-chips" style={{ display: "flex", flexWrap: "wrap", gap: "8px", margin: "0", padding: "0", listStyle: "none" }}>
            {[`ab ${PREIS_AB} € für ${TAGE} Tage`, "Ratenzahlung mit Klarna", "ohne Rezept"].map((t) => (
              <li key={t} style={{ border: "1px solid #3C5E4E", borderRadius: "999px", padding: "5px 12px", fontSize: "14px", color: "#E3ECE6" }}>
                {t}
              </li>
            ))}
          </ul>

          <div className="check-vertrauen" style={{ display: "flex", gap: "12px", alignItems: "center" }}>
            <AnzeigeBild name="max-klein" alt="Max Glawe" sofort width={44} height={44} style={{ width: "44px", height: "44px", borderRadius: "50%", objectFit: "cover", objectPosition: "50% 20%", flex: "0 0 auto", border: `2px solid ${MINT}` }} />
            <span style={{ fontSize: "13.5px", lineHeight: "1.35", color: "#C9D8CF" }}>
              <b style={{ color: "#F5F1EA" }}>Max Glawe</b> · Physiotherapeut und Heilpraktiker für
              Physiotherapie · eigene Praxis in Wildau
            </span>
          </div>

          <div id="check" style={{ scrollMarginTop: "16px" }}>
            <SchmerzcheckKarte />
          </div>
        </section>

        {/* WAS DU BEKOMMST */}
        <section id="leistungen" style={{ padding: "40px 20px 32px", display: "flex", flexDirection: "column", gap: "14px" }}>
          <p style={kicker}>Was du bekommst</p>
          <h2 style={h2}>Das steckt in Praxis OS</h2>
          <div style={{ display: "grid", gap: "10px" }}>
            {LEISTUNGEN.map((l, i) => (
              <div key={l.titel} style={{ background: "#FFFFFF", borderRadius: "20px", padding: "18px", display: "flex", gap: "14px", alignItems: "flex-start" }}>
                <span style={{ flex: "0 0 auto", width: "40px", height: "40px", borderRadius: "12px", background: "#E4EEE8", color: "#1F4A36", display: "grid", placeItems: "center" }}>
                  <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
                    {SYMBOLE[i]}
                  </svg>
                </span>
                <span style={{ display: "flex", flexDirection: "column", gap: "4px" }}>
                  <b style={{ fontSize: "17px" }}>{l.titel}</b>
                  <span style={{ fontSize: "15px", color: TEXT }}>{l.text}</span>
                </span>
              </div>
            ))}
          </div>
          <p style={{ margin: "0", fontSize: "13.5px", color: "#4A5A52" }}>
            Die App ist dein Werkzeug und im Programm enthalten. Sie läuft im Browser, du musst
            nichts installieren.
          </p>
        </section>

        {/* SO LÄUFT ES AB */}
        <section id="ablauf" style={{ padding: "8px 20px 36px", display: "flex", flexDirection: "column", gap: "14px" }}>
          <p style={kicker}>Dein Weg</p>
          <h2 style={h2}>So läuft es ab</h2>
          <ol style={{ listStyle: "none", margin: "0", padding: "0", display: "grid", gap: "16px" }}>
            {ABLAUF.map((s, i) => (
              <li key={s.titel} style={{ display: "grid", gridTemplateColumns: "36px 1fr", gap: "14px", alignItems: "start" }}>
                <span
                  aria-hidden="true"
                  style={{ width: "36px", height: "36px", borderRadius: "50%", background: GRUEN, color: MINT, display: "grid", placeItems: "center", fontFamily: serif, fontWeight: "600", fontSize: "18px" }}
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

        {/* PREISE */}
        <section id="preise" style={{ background: "#E9E2D5", padding: "40px 20px", display: "flex", flexDirection: "column", gap: "14px" }}>
          <p style={kicker}>Preise</p>
          <h2 style={h2}>Klare Preise, keine Überraschungen</h2>

          <div style={{ display: "grid", gap: "12px" }}>
            {PAKETE.map((p) => (
              <div
                key={p.id}
                style={{
                  background: "#FFFFFF",
                  borderRadius: "22px",
                  padding: "20px",
                  display: "flex",
                  flexDirection: "column",
                  gap: "10px",
                  border: p.label ? `2px solid ${AKZENT}` : "2px solid transparent",
                }}
              >
                <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", gap: "10px", flexWrap: "wrap" }}>
                  <span style={{ fontSize: "18px", fontWeight: 700 }}>{p.name}</span>
                  {p.label && (
                    <span style={{ background: GRUEN, color: MINT, borderRadius: "999px", padding: "4px 10px", fontSize: "12px", fontWeight: 700 }}>
                      {p.label}
                    </span>
                  )}
                </div>
                <div style={{ display: "flex", alignItems: "baseline", gap: "8px" }}>
                  <span style={{ fontFamily: serif, fontSize: "34px", fontWeight: 600, color: "#1F4A36", lineHeight: "1" }}>{p.preis} €</span>
                  <span style={{ fontSize: "14px", color: "#4A5A52" }}>für {TAGE} Tage</span>
                </div>
                <span style={{ fontSize: "14.5px", color: TEXT }}>{p.unterzeile}</span>
                <ul style={{ listStyle: "none", margin: "0", padding: "0", display: "grid", gap: "6px", fontSize: "15px" }}>
                  {p.punkte.map((t) => (
                    <li key={t} style={{ display: "flex", gap: "10px", alignItems: "flex-start" }}>
                      <Haken />
                      <span>{t}</span>
                    </li>
                  ))}
                </ul>
              </div>
            ))}
          </div>

          <div style={{ display: "grid", gap: "6px", fontSize: "14px", color: TEXT }}>
            <p style={{ margin: "0" }}>{ZAHLUNG}</p>
            <p style={{ margin: "0" }}>{ERST_NACH_KENNENLERNEN}</p>
            <p style={{ margin: "0" }}>{ERSTATTUNG}</p>
          </div>

          <KonsultationLink abschnitt="check-preise" metaMelden={false} neuerTab={false} className="js-book" style={{ ...buchenKnopf, background: GRUEN, color: "#F5F1EA", marginTop: "6px" }}>
            {KENNENLERNEN.knopf}
            <Pfeil />
          </KonsultationLink>
          <p style={{ margin: "0", textAlign: "center", fontSize: "13px", color: "#4A5A52" }}>{KENNENLERNEN.zusatz}</p>
        </section>

        {/* WER DICH BETREUT */}
        <section id="max" style={{ padding: "40px 20px 36px", display: "flex", flexDirection: "column", gap: "16px" }}>
          <p style={kicker}>Dein Therapeut</p>
          <h2 style={h2}>Wer dich betreut</h2>
          <div style={{ position: "relative", borderRadius: "24px", overflow: "hidden", height: "380px", background: "#DCD3C3" }}>
            <AnzeigeBild name="max" alt="Max Glawe in seiner Praxis" style={{ width: "100%", height: "100%", objectFit: "cover", objectPosition: "50% 15%", display: "block" }} />
            <div style={{ position: "absolute", left: "12px", right: "12px", bottom: "12px", background: "rgba(245,241,234,0.95)", borderRadius: "16px", padding: "12px 16px" }}>
              <b style={{ display: "block", fontSize: "16px" }}>Max Glawe</b>
              <span style={{ fontSize: "14px", color: TEXT }}>Physiotherapie Glawe, Wildau</span>
            </div>
          </div>
          <p style={{ margin: "0", fontSize: "15.5px", color: TEXT }}>
            Max Glawe ist Physiotherapeut und Heilpraktiker für Physiotherapie mit eigener Praxis in
            Wildau. Als Heilpraktiker für Physiotherapie darf er dich ohne ärztliche Verordnung
            untersuchen, eine Diagnose stellen, selbst entscheiden, wie behandelt wird, und dich
            behandeln.
          </p>
          <p style={{ margin: "0", fontSize: "15.5px", color: TEXT }}>
            Praxis OS hat er entwickelt, weil viele seiner Patientinnen und Patienten zwischen festen
            Terminen, Arbeit und Familie keine Zeit für Physiotherapie finden.
          </p>
          <div style={{ display: "flex", flexWrap: "wrap", gap: "8px" }}>
            {["Heilpraktiker für Physiotherapie", "ZPP-registrierter Kursleiter", "Praxispartner BTU Cottbus–Senftenberg"].map((t) => (
              <span key={t} style={{ background: "#E4EEE8", color: "#1F4A36", borderRadius: "999px", padding: "7px 12px", fontSize: "13px", fontWeight: 600 }}>
                {t}
              </span>
            ))}
          </div>
        </section>

        {/* BEWERTUNGEN — nur echte, mit Quelle; die Überschrift bringt die Komponente mit */}
        <section id="stimmen" style={{ background: GRUEN, padding: "32px 20px", display: "flex", flexDirection: "column", gap: "14px" }}>
          <Bewertungen reihenfolge={["sarah", "scarlett"]} />
        </section>

        {/* HÄUFIGE FRAGEN */}
        <section id="faq" style={{ padding: "40px 20px 36px", display: "flex", flexDirection: "column", gap: "10px" }}>
          <h2 style={{ ...h2, margin: "0 0 8px" }}>Häufige Fragen</h2>
          <CheckFaq eintraege={FAQ} />
        </section>

        {/* ABSCHLUSS */}
        <section id="abschluss" style={{ background: GRUEN, color: "#F5F1EA", padding: "44px 20px", display: "flex", flexDirection: "column", gap: "16px" }}>
          <AnzeigeBild name="max-klein" alt="Max Glawe" width={64} height={64} style={{ width: "64px", height: "64px", borderRadius: "50%", objectFit: "cover", objectPosition: "50% 20%", border: `2px solid ${MINT}` }} />
          <h2 style={{ ...h2, fontSize: "32px", margin: "0" }}>Lass uns 20 Minuten draufschauen.</h2>
          <p style={{ margin: "0", fontSize: "16px", color: "#D7E3DC" }}>
            Kostenlos, per Video, ohne Verpflichtung. Wir schauen gemeinsam, ob Praxis OS zu dir
            passt. Wenn nicht, sagt Max dir das ehrlich.
          </p>
          <KonsultationLink abschnitt="check-abschluss" metaMelden={false} neuerTab={false} className="js-book" style={buchenKnopf}>
            {KENNENLERNEN.knopf}
            <Pfeil />
          </KonsultationLink>
          <p style={{ margin: "0", textAlign: "center", fontSize: "13px", color: "#B9CEC2" }}>
            ab {PREIS_AB} € für {TAGE} Tage · Ratenzahlung mit Klarna
          </p>
          <ZumCheck
            abschnitt="abschluss"
            style={{ background: "none", border: `1px solid #3C5E4E`, borderRadius: "14px", color: "#E3ECE6", font: "inherit", fontSize: "15px", fontWeight: 600, padding: "12px", cursor: "pointer" }}
          >
            Noch unsicher? Zum 1-Minuten-Check
          </ZumCheck>
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
