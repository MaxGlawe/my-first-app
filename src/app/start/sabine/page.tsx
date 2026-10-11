import type { Metadata } from "next"
import { MetaPixel } from "@/components/analytics/MetaPixel"
import { AufmerksamkeitMessen } from "@/components/analytics/AufmerksamkeitMessen"
import { ConsentEinstellungenLink } from "@/components/analytics/ConsentBanner"
import { KonsultationLink } from "@/components/landing/KonsultationLink"
import { AnzeigeBild } from "@/components/anzeigen/AnzeigeBild"
import { StickyBuchung } from "@/components/anzeigen/StickyBuchung"
import { GEMESSENE_SEITEN } from "@/lib/gemessene-seiten"

/**
 * Anzeigen-Landingpage „Sabines Weg" — Ziel der Meta-Anzeigen Trailer und
 * Teil 1 (`utm_content=trailer` bzw. `teil1`).
 *
 * Markup, Texte, Reihenfolge und Farben sind aus der abgestimmten Vorlage
 * uebernommen. Die Texte sind heilmittelwerberechtlich abgestimmt — wer hier
 * etwas umformuliert, aendert eine rechtliche Zusage, nicht einen Stil.
 * Umgewandelt wurde mechanisch aus dem HTML der Vorlage; geaendert sind nur
 * drei Dinge:
 *
 *   - die Buchungsknoepfe laufen ueber `KonsultationLink` (UTM-Weitergabe
 *     an den Kalender und eigene Klickmessung),
 *   - die Bilder ueber `AnzeigeBild` (WebP mit Rueckfall),
 *   - „Cookie-Einstellungen" oeffnet unser Banner.
 *
 * Das UTM-Skript der Vorlage ist entfallen: `lib/kampagnen-herkunft` macht
 * dasselbe, nur zusaetzlich mit fbclid und gclid und mit der Regel, dass
 * der erste Treffer gilt.
 *
 * `noindex`: reine Anzeigenseite. Sie ueberschneidet sich inhaltlich mit der
 * Startseite, steht in keiner Navigation und in keiner Sitemap.
 */

export const metadata: Metadata = {
  title: "Physiotherapie per Video – schon vor deinem Termin starten | Praxis OS",
  description:
    "90 Tage Physiotherapie per Video und Chat mit Max Glawe, Heilpraktiker für Physiotherapie. Ohne Rezept, von zu Hause. Konsultation 69 €, wird angerechnet.",
  robots: { index: false, follow: true },
  alternates: { canonical: "https://wwwpraxis-os.com/start/sabine" },
}

export default function SabineLandingPage() {
  return (
    <>
      <MetaPixel />
      {/* Nur PageView an Meta. Der Buchungsklick geht ausschliesslich in die
          eigene Messung — siehe `metaMelden={false}` an jedem Knopf. */}
      <AufmerksamkeitMessen
        seite="start-sabine"
        abschnitte={GEMESSENE_SEITEN["start-sabine"].abschnitte.map((a) => a.id)}
      />
      <main className="page" style={{ fontSize: "16px", lineHeight: "1.55" }}>

        {/* HERO */}
        <section id="einstieg" style={{ background: "#0F2A1F", color: "#F5F1EA", padding: "18px 20px 32px", display: "flex", flexDirection: "column", gap: "20px" }}>
          <div style={{ display: "flex", alignItems: "center", gap: "10px" }}>
            <AnzeigeBild name="logo" alt="Logo Physiotherapie Glawe" sofort width={34} height={34} style={{ width: "34px", height: "34px", borderRadius: "50%", objectFit: "cover" }} />
            <div style={{ display: "flex", flexDirection: "column", lineHeight: "1.15" }}>
              <span style={{ fontFamily: "var(--font-anzeige-serif), Georgia, serif", fontWeight: "600", fontSize: "17px" }}>Praxis OS</span>
              <span style={{ fontSize: "12px", color: "#B9CEC2" }}>by Physiotherapie Glawe</span>
            </div>
          </div>

          <div style={{ position: "relative", borderRadius: "24px", overflow: "hidden", height: "200px", background: "#1C3A2D" }}>
            <AnzeigeBild name="sabine" vorrang alt="Illustration: Sabine, nachdenklich in der Küche" sofort style={{ width: "100%", height: "100%", objectFit: "cover", objectPosition: "30% 40%", display: "block" }} />
            <span style={{ position: "absolute", left: "14px", bottom: "14px", background: "rgba(15,42,31,0.82)", color: "#F5F1EA", borderRadius: "999px", padding: "6px 12px", fontSize: "12px", fontWeight: "600", letterSpacing: "0.02em" }}>Aus der Serie · Sabines Weg</span>
            <span style={{ position: "absolute", right: "12px", top: "12px", background: "rgba(15,42,31,0.7)", color: "#DDE8E1", borderRadius: "6px", padding: "3px 8px", fontSize: "11px" }}>Illustration · KI</span>
          </div>

          <h1 style={{ margin: "0", fontFamily: "var(--font-anzeige-serif), Georgia, serif", fontWeight: "600", fontSize: "38px", lineHeight: "1.06", letterSpacing: "-0.015em" }}>Sechs Wochen auf einen Termin warten? <span style={{ fontStyle: "italic", color: "#A8DCC0" }}>Du kannst schon vorher starten.</span></h1>

          <p style={{ margin: "0", fontSize: "17px", color: "#D7E3DC" }}>Wie Sabine: 90 Tage Physiotherapie per Video und Chat – ohne Rezept, ohne Wartezimmer, von zu Hause.</p>

          <div style={{ display: "flex", flexDirection: "column", gap: "10px" }}>
            <KonsultationLink abschnitt="sabine-hero" metaMelden={false} className="js-book" style={{ minHeight: "56px", borderRadius: "16px", background: "#A8DCC0", color: "#0F2A1F", textDecoration: "none", display: "flex", alignItems: "center", justifyContent: "center", gap: "10px", fontWeight: "700", fontSize: "17px" }}>Konsultation buchen · 69 €
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true"><path d="M5 12h14" /><path d="M13 6l6 6-6 6" /></svg>
            </KonsultationLink>
            <p style={{ margin: "0", textAlign: "center", fontSize: "13px", color: "#B9CEC2" }}>30 Min per Video · wird angerechnet · deutschlandweit</p>
          </div>

          {/* Stärke 1: persönliche Stimme */}
          <div style={{ display: "flex", gap: "14px", alignItems: "flex-start", background: "#17382A", borderRadius: "20px", padding: "16px" }}>
            <AnzeigeBild name="max-klein" alt="Max Glawe" sofort width={52} height={52} style={{ width: "52px", height: "52px", borderRadius: "50%", objectFit: "cover", objectPosition: "50% 20%", flex: "0 0 auto", border: "2px solid #A8DCC0" }} />
            <div style={{ display: "flex", flexDirection: "column", gap: "6px" }}>
              <p style={{ margin: "0", fontFamily: "var(--font-anzeige-serif), Georgia, serif", fontStyle: "italic", fontSize: "18px", lineHeight: "1.35", color: "#F5F1EA" }}>„Ich bin Max, Physiotherapeut aus Wildau. Ich betreue dich persönlich – kein Callcenter, kein Bot.“</p>
              <span style={{ fontSize: "13px", color: "#B9CEC2" }}>Max Glawe · Heilpraktiker für Physiotherapie</span>
            </div>
          </div>
        </section>

        {/* Stärke 2: Wo stehst du gerade */}
        <section id="wo-stehst-du" style={{ padding: "44px 20px 40px", display: "flex", flexDirection: "column", gap: "14px" }}>
          <p style={{ margin: "0", fontSize: "12px", letterSpacing: "0.14em", textTransform: "uppercase", fontWeight: "700", color: "#2B6A4E" }}>Wo stehst du gerade?</p>
          <h2 style={{ margin: "0 0 6px", fontFamily: "var(--font-anzeige-serif), Georgia, serif", fontWeight: "600", fontSize: "30px", lineHeight: "1.12" }}>Drei Situationen, die ich jede Woche höre.</h2>

          <div style={{ background: "#FFFFFF", borderRadius: "20px", padding: "20px", display: "flex", flexDirection: "column", gap: "10px" }}>
            <span style={{ fontFamily: "var(--font-anzeige-serif), Georgia, serif", fontSize: "22px", fontWeight: "600", lineHeight: "1.2" }}>„Der nächste freie Termin ist in sechs Wochen.“</span>
            <span style={{ fontSize: "15px", color: "#33433B" }}>Per Video können wir vorher starten – ohne Anfahrt, ohne Rezept. In der Konsultation klären wir auch, ob du dich erst ärztlich untersuchen lassen solltest.</span>
          </div>
          <div style={{ background: "#FFFFFF", borderRadius: "20px", padding: "20px", display: "flex", flexDirection: "column", gap: "10px" }}>
            <span style={{ fontFamily: "var(--font-anzeige-serif), Georgia, serif", fontSize: "22px", fontWeight: "600", lineHeight: "1.2" }}>„Mein Rezept ist aufgebraucht.“</span>
            <span style={{ fontSize: "15px", color: "#33433B" }}>Sechs Termine sind schnell vorbei – die Übungen sind dann oft noch nicht im Alltag angekommen. Hier trainierst du weiter, ein neues Rezept brauchst du nicht.</span>
          </div>
          <div style={{ background: "#FFFFFF", borderRadius: "20px", padding: "20px", display: "flex", flexDirection: "column", gap: "10px" }}>
            <span style={{ fontFamily: "var(--font-anzeige-serif), Georgia, serif", fontSize: "22px", fontWeight: "600", lineHeight: "1.2" }}>„Allein bleibe ich nicht dran.“</span>
            <span style={{ fontSize: "15px", color: "#33433B" }}>Musst du auch nicht. Du bekommst einen Plan, der in deinen Alltag passt – und jemanden, der nachfragt, wenn es hakt.</span>
          </div>
        </section>

        {/* WAS IST ANDERS */}
        <section id="was-ist-praxis-os" style={{ padding: "8px 20px 40px", display: "flex", flexDirection: "column", gap: "16px" }}>
          <p style={{ margin: "0", fontSize: "12px", letterSpacing: "0.14em", textTransform: "uppercase", fontWeight: "700", color: "#2B6A4E" }}>Was ist Praxis OS?</p>
          <h2 style={{ margin: "0 0 4px", fontFamily: "var(--font-anzeige-serif), Georgia, serif", fontWeight: "600", fontSize: "30px", lineHeight: "1.12" }}>Physiotherapie, die nicht an der Praxistür aufhört.</h2>
          <p style={{ margin: "0", fontSize: "15px", color: "#33433B" }}>Statt einzelner Termine bekommst du 90 Tage am Stück: einen Plan, der in deinen Alltag passt, und einen Therapeuten, der dranbleibt.</p>
          <div style={{ display: "grid", gridTemplateColumns: "repeat(2, minmax(0, 1fr))", gap: "10px", marginTop: "6px" }}>
            <div style={{ background: "#E9E2D5", borderRadius: "20px", padding: "16px", display: "flex", flexDirection: "column", gap: "10px" }}>
              <span style={{ fontSize: "12px", fontWeight: "700", letterSpacing: "0.08em", textTransform: "uppercase", color: "#4A5A52" }}>Gewohnt</span>
              <span style={{ fontSize: "14px", lineHeight: "1.4", color: "#33433B" }}>Einzelne Termine in der Praxis</span>
              <span style={{ fontSize: "14px", lineHeight: "1.4", color: "#33433B" }}>Anfahrt und Wartezimmer</span>
              <span style={{ fontSize: "14px", lineHeight: "1.4", color: "#33433B" }}>Zwischen den Terminen allein</span>
              <span style={{ fontSize: "14px", lineHeight: "1.4", color: "#33433B" }}>Endet mit dem letzten Termin</span>
            </div>
            <div style={{ background: "#0F2A1F", color: "#F5F1EA", borderRadius: "20px", padding: "16px", display: "flex", flexDirection: "column", gap: "10px" }}>
              <span style={{ fontSize: "12px", fontWeight: "700", letterSpacing: "0.08em", textTransform: "uppercase", color: "#A8DCC0" }}>Praxis OS</span>
              <span style={{ fontSize: "14px", lineHeight: "1.4" }}>90 Tage als ein Programm</span>
              <span style={{ fontSize: "14px", lineHeight: "1.4" }}>Von zu Hause, per Handy</span>
              <span style={{ fontSize: "14px", lineHeight: "1.4" }}>Fragen im Chat, Antwort in 24 h</span>
              <span style={{ fontSize: "14px", lineHeight: "1.4" }}>Endet mit einem Plan für dich allein</span>
            </div>
          </div>
        </section>

        {/* DEINE 90 TAGE */}
        <section id="deine-90-tage" style={{ padding: "8px 20px 44px", display: "flex", flexDirection: "column", gap: "18px" }}>
          <h2 style={{ margin: "0", fontFamily: "var(--font-anzeige-serif), Georgia, serif", fontWeight: "600", fontSize: "32px", lineHeight: "1.1" }}>Deine 90 Tage</h2>

          <div style={{ background: "#FFFFFF", borderRadius: "22px", padding: "22px", display: "flex", gap: "16px" }}>
            <span style={{ fontFamily: "var(--font-anzeige-serif), Georgia, serif", fontStyle: "italic", fontSize: "40px", lineHeight: "1", color: "#2B6A4E", flex: "0 0 auto" }}>1</span>
            <div style={{ display: "flex", flexDirection: "column", gap: "6px" }}>
              <span style={{ fontSize: "12px", fontWeight: "700", letterSpacing: "0.1em", textTransform: "uppercase", color: "#4A5A52" }}>Tag 1 · 30 Min.</span>
              <span style={{ fontSize: "18px", fontWeight: "600" }}>Video-Konsultation</span>
              <span style={{ fontSize: "15px", color: "#33433B" }}>Wir schauen uns deine Beschwerden an und prüfen ehrlich, ob Betreuung aus der Ferne für dich passt.</span>
              <span style={{ display: "inline-flex", alignItems: "center", gap: "8px", marginTop: "4px", fontSize: "14px", fontWeight: "600", color: "#1F4A36" }}>
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true"><rect x="7" y="2" width="10" height="20" rx="2" /><path d="M11 18h2" /></svg>Du brauchst nur dein Handy – keine Technik, kein Konto vorab.</span>
            </div>
          </div>
          <div style={{ background: "#FFFFFF", borderRadius: "22px", padding: "22px", display: "flex", gap: "16px" }}>
            <span style={{ fontFamily: "var(--font-anzeige-serif), Georgia, serif", fontStyle: "italic", fontSize: "40px", lineHeight: "1", color: "#2B6A4E", flex: "0 0 auto" }}>2</span>
            <div style={{ display: "flex", flexDirection: "column", gap: "6px" }}>
              <span style={{ fontSize: "12px", fontWeight: "700", letterSpacing: "0.1em", textTransform: "uppercase", color: "#4A5A52" }}>Danach</span>
              <span style={{ fontSize: "18px", fontWeight: "600" }}>Dein Plan steht</span>
              <span style={{ fontSize: "15px", color: "#33433B" }}>Wenige Übungen, die zu dir passen. In der App, mit kurzen Check-ins im Alltag.</span>
            </div>
          </div>
          <div style={{ background: "#FFFFFF", borderRadius: "22px", padding: "22px", display: "flex", gap: "16px" }}>
            <span style={{ fontFamily: "var(--font-anzeige-serif), Georgia, serif", fontStyle: "italic", fontSize: "40px", lineHeight: "1", color: "#2B6A4E", flex: "0 0 auto" }}>3</span>
            <div style={{ display: "flex", flexDirection: "column", gap: "6px" }}>
              <span style={{ fontSize: "12px", fontWeight: "700", letterSpacing: "0.1em", textTransform: "uppercase", color: "#4A5A52" }}>90 Tage</span>
              <span style={{ fontSize: "18px", fontWeight: "600" }}>Begleitet – erst eng, dann mit langer Leine</span>
              <span style={{ fontSize: "15px", color: "#33433B" }}>Fragen per Chat, Antwort innerhalb von 24 Stunden. Ich passe den Plan an, bis du allein weitermachst.</span>
            </div>
          </div>

          {/* Stärke 4: Betreuung zeigen */}
          <div style={{ background: "#E9E2D5", borderRadius: "24px", padding: "20px 18px 22px", display: "flex", flexDirection: "column", gap: "12px" }}>
            <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", gap: "10px" }}>
              <span style={{ fontSize: "12px", fontWeight: "700", letterSpacing: "0.1em", textTransform: "uppercase", color: "#2B6A4E" }}>So sieht die Betreuung aus</span>
              <span style={{ fontSize: "11px", color: "#4A5A52", background: "#F5F1EA", borderRadius: "6px", padding: "2px 8px" }}>Beispiel</span>
            </div>
            <div style={{ background: "#F5F1EA", borderRadius: "18px", padding: "14px", display: "flex", flexDirection: "column", gap: "8px" }}>
              <div style={{ alignSelf: "flex-end", maxWidth: "250px", background: "#0F2A1F", color: "#F5F1EA", borderRadius: "16px 4px 16px 16px", padding: "9px 12px", fontSize: "14.5px", lineHeight: "1.4" }}>Die zweite Übung zieht heute etwas. Soll ich weitermachen?</div>
              <div style={{ alignSelf: "flex-start", maxWidth: "270px", background: "#FFFFFF", borderRadius: "4px 16px 16px 16px", padding: "9px 12px", fontSize: "14.5px", lineHeight: "1.4" }}>Gut, dass du fragst. Mach sie heute nur halb so weit und schick mir morgen kurz, wie es war. Dann passe ich deinen Plan an.</div>
              <span style={{ alignSelf: "flex-start", fontSize: "12px", color: "#4A5A52", display: "flex", alignItems: "center", gap: "6px" }}>
                <AnzeigeBild name="max-klein" alt="" width={18} height={18} style={{ width: "18px", height: "18px", borderRadius: "50%", objectFit: "cover", objectPosition: "50% 20%" }} />Max · Antwort innerhalb von 24 h</span>
            </div>
          </div>
        </section>

        {/* WER DICH BETREUT */}
        <section id="wer-betreut-dich" style={{ padding: "0 20px 44px", display: "flex", flexDirection: "column", gap: "18px" }}>
          <h2 style={{ margin: "0", fontFamily: "var(--font-anzeige-serif), Georgia, serif", fontWeight: "600", fontSize: "32px", lineHeight: "1.1" }}>Wer dich betreut</h2>
          <div style={{ position: "relative", borderRadius: "24px", overflow: "hidden", height: "400px", background: "#DCD3C3" }}>
            <AnzeigeBild name="max" alt="Max Glawe in seiner Praxis" style={{ width: "100%", height: "100%", objectFit: "cover", objectPosition: "50% 15%", display: "block" }} />
            <div style={{ position: "absolute", left: "12px", right: "12px", bottom: "12px", background: "rgba(245,241,234,0.95)", borderRadius: "16px", padding: "14px 16px", display: "flex", flexDirection: "column", gap: "6px" }}>
              <span style={{ fontFamily: "var(--font-anzeige-serif), Georgia, serif", fontStyle: "italic", fontSize: "18px", lineHeight: "1.35" }}>„Vom ersten Video-Termin bis Tag 90 hast du mit mir einen festen Ansprechpartner.“</span>
              <span style={{ fontSize: "14px", color: "#33433B" }}>Max Glawe · Physiotherapie Glawe, Wildau</span>
            </div>
          </div>
          <div style={{ display: "flex", flexWrap: "wrap", gap: "8px" }}>
            <span style={{ background: "#E4EEE8", color: "#1F4A36", borderRadius: "999px", padding: "7px 12px", fontSize: "13px", fontWeight: "600" }}>Heilpraktiker für Physiotherapie</span>
            <span style={{ background: "#E4EEE8", color: "#1F4A36", borderRadius: "999px", padding: "7px 12px", fontSize: "13px", fontWeight: "600" }}>ZPP-registrierter Kursleiter</span>
            <span style={{ background: "#E4EEE8", color: "#1F4A36", borderRadius: "999px", padding: "7px 12px", fontSize: "13px", fontWeight: "600" }}>Praxispartner BTU Cottbus–Senftenberg</span>
          </div>
          <div style={{ display: "grid", gridTemplateColumns: "repeat(3, minmax(0, 1fr))", gap: "10px" }}>
            <div style={{ background: "#FFFFFF", borderRadius: "16px", padding: "14px 12px", display: "flex", flexDirection: "column", gap: "4px" }}>
              <span style={{ fontFamily: "var(--font-anzeige-serif), Georgia, serif", fontSize: "22px", fontWeight: "600", color: "#1F4A36" }}>1</span>
              <span style={{ fontSize: "13px", lineHeight: "1.35", color: "#33433B" }}>fester Ansprechpartner</span>
            </div>
            <div style={{ background: "#FFFFFF", borderRadius: "16px", padding: "14px 12px", display: "flex", flexDirection: "column", gap: "4px" }}>
              <span style={{ fontFamily: "var(--font-anzeige-serif), Georgia, serif", fontSize: "22px", fontWeight: "600", color: "#1F4A36" }}>24 h</span>
              <span style={{ fontSize: "13px", lineHeight: "1.35", color: "#33433B" }}>Antwort auf deine Fragen</span>
            </div>
            <div style={{ background: "#FFFFFF", borderRadius: "16px", padding: "14px 12px", display: "flex", flexDirection: "column", gap: "4px" }}>
              <span style={{ fontFamily: "var(--font-anzeige-serif), Georgia, serif", fontSize: "22px", fontWeight: "600", color: "#1F4A36" }}>90</span>
              <span style={{ fontSize: "13px", lineHeight: "1.35", color: "#33433B" }}>Tage, dann ein klares Ende</span>
            </div>
          </div>
        </section>

        {/* PREIS */}
        <section id="preis" style={{ background: "#E9E2D5", padding: "44px 20px", display: "flex", flexDirection: "column", gap: "16px" }}>
          <h2 style={{ margin: "0", fontFamily: "var(--font-anzeige-serif), Georgia, serif", fontWeight: "600", fontSize: "30px", lineHeight: "1.12" }}>Was kostet Physiotherapie ohne Rezept?</h2>
          <p style={{ margin: "0", fontSize: "15px", color: "#33433B" }}>Keine automatische Verlängerung. Du startest mit der Konsultation und entscheidest danach.</p>

          <div style={{ background: "#0F2A1F", color: "#F5F1EA", borderRadius: "22px", padding: "22px", display: "flex", flexDirection: "column", gap: "6px" }}>
            <span style={{ fontSize: "12px", fontWeight: "700", letterSpacing: "0.1em", textTransform: "uppercase", color: "#A8DCC0" }}>Erster Schritt</span>
            <div style={{ display: "flex", alignItems: "baseline", justifyContent: "space-between", gap: "12px" }}>
              <span style={{ fontSize: "18px", fontWeight: "600" }}>Konsultation, 30 Min.</span>
              <span style={{ fontFamily: "var(--font-anzeige-serif), Georgia, serif", fontSize: "32px", fontWeight: "600" }}>69 €</span>
            </div>
            <span style={{ fontSize: "14px", color: "#C9D8CF" }}>Wird bei Programmstart vollständig angerechnet.</span>
          </div>

          <div style={{ display: "grid", gridTemplateColumns: "repeat(2, minmax(0, 1fr))", gap: "12px" }}>
            <div style={{ background: "#FFFFFF", borderRadius: "20px", padding: "18px", display: "flex", flexDirection: "column", gap: "6px" }}>
              <span style={{ fontSize: "15px", fontWeight: "600" }}>Begleitet</span>
              <span style={{ fontFamily: "var(--font-anzeige-serif), Georgia, serif", fontSize: "28px", fontWeight: "600", color: "#1F4A36" }}>299 €</span>
              <span style={{ fontSize: "13px", lineHeight: "1.4", color: "#4A5A52" }}>90 Tage Plan + Chat-Begleitung</span>
            </div>
            <div style={{ background: "#FFFFFF", borderRadius: "20px", padding: "18px", display: "flex", flexDirection: "column", gap: "6px" }}>
              <span style={{ fontSize: "15px", fontWeight: "600" }}>Intensiv</span>
              <span style={{ fontFamily: "var(--font-anzeige-serif), Georgia, serif", fontSize: "28px", fontWeight: "600", color: "#1F4A36" }}>499 €</span>
              <span style={{ fontSize: "13px", lineHeight: "1.4", color: "#4A5A52" }}>zusätzlich 8 Video-Sitzungen</span>
            </div>
          </div>

          {/* Stärke 3: Einwand direkt an der Stelle */}
          <div style={{ background: "#F5F1EA", borderRadius: "20px", padding: "18px", display: "flex", gap: "14px", alignItems: "flex-start" }}>
            <span style={{ flex: "0 0 auto", width: "40px", height: "40px", borderRadius: "12px", background: "#E4EEE8", color: "#1F4A36", display: "flex", alignItems: "center", justifyContent: "center" }}>
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true"><path d="M12 3l8 3v6c0 4.5-3.4 8.2-8 9-4.6-.8-8-4.5-8-9V6z" /><path d="M9 12l2 2 4-4" /></svg>
            </span>
            <div style={{ display: "flex", flexDirection: "column", gap: "4px" }}>
              <span style={{ fontSize: "16px", fontWeight: "600" }}>Zahlt meine Krankenkasse?</span>
              <span style={{ fontSize: "14px", lineHeight: "1.45", color: "#33433B" }}>Praxis OS ist eine Selbstzahlerleistung – die gesetzliche Krankenkasse zahlt nicht. Du bekommst eine Heilpraktiker-Rechnung. Ob deine private Versicherung, Beihilfe oder Zusatzversicherung etwas erstattet, hängt von deinem Tarif ab – das können wir nicht zusagen. Frag am besten vorher mit dem Kostenvoranschlag bei deiner Versicherung nach.</span>
            </div>
          </div>
          <p style={{ margin: "0", fontSize: "13px", color: "#4A5A52", textAlign: "center" }}>Ratenzahlung über Klarna möglich</p>
        </section>

        {/* FAQ */}
        <section id="faq" style={{ padding: "44px 20px 40px", display: "flex", flexDirection: "column", gap: "10px" }}>
          <h2 style={{ margin: "0 0 8px", fontFamily: "var(--font-anzeige-serif), Georgia, serif", fontWeight: "600", fontSize: "32px", lineHeight: "1.1" }}>Kurz gefragt</h2>
          <details className="faq" open><summary><span>Ersetzt das meinen Termin vor Ort?</span><span className="sign" aria-hidden="true"></span></summary><p>Nicht unbedingt. Du kannst die Wartezeit nutzen und schon vorher anfangen – deinen Termin kannst du trotzdem wahrnehmen. In der Konsultation klären wir, ob Betreuung aus der Ferne für dich passt oder ob du dich vorher ärztlich untersuchen lassen solltest.</p></details>
          <details className="faq"><summary><span>Funktioniert Physiotherapie per Video überhaupt?</span><span className="sign" aria-hidden="true"></span></summary><p>Für viele Beschwerden ja – vor allem, wenn es um Übungen, Belastung und Alltag geht. Ob es für dich passt, prüfen wir in der Konsultation. Wenn nicht, sage ich dir das ehrlich.</p></details>
          <details className="faq"><summary><span>Kann ich ohne Rezept zur Physiotherapie?</span><span className="sign" aria-hidden="true"></span></summary><p>Ja. Als Heilpraktiker für Physiotherapie darf ich dich ohne ärztliche Verordnung betreuen. Praxis OS ist eine Selbstzahlerleistung. In der Konsultation prüfen wir, ob die Betreuung per Video für dich passt.</p></details>
          <details className="faq"><summary><span>Mein Arzt verschreibt keine Physio mehr – was jetzt?</span><span className="sign" aria-hidden="true"></span></summary><p>Verordnungen sind an feste Vorgaben gebunden. Das sagt nichts darüber, ob weiteres Training für dich sinnvoll ist. Bei mir kannst du ohne Verordnung weitermachen. Ändern sich deine Beschwerden, gehört das ärztlich abgeklärt – darauf achte ich.</p></details>
          <details className="faq"><summary><span>Was, wenn Fernbetreuung für mich nicht passt?</span><span className="sign" aria-hidden="true"></span></summary><p>Dann sage ich dir das in der Konsultation ehrlich und empfehle dir, was stattdessen sinnvoll ist – zum Beispiel eine ärztliche Abklärung oder Behandlung vor Ort.</p></details>
          <details className="faq"><summary><span>Was passiert nach den 90 Tagen?</span><span className="sign" aria-hidden="true"></span></summary><p>Das Programm endet automatisch – es verlängert sich nichts. Du kannst mit deinem Plan selbstständig weitertrainieren. Möchtest du weiter begleitet werden, ist das möglich – das besprechen wir individuell.</p></details>
        </section>

        {/* ABSCHLUSS */}
        <section id="abschluss" style={{ background: "#0F2A1F", color: "#F5F1EA", padding: "48px 20px", display: "flex", flexDirection: "column", gap: "18px" }}>
          <AnzeigeBild name="max-klein" alt="Max Glawe" width={64} height={64} style={{ width: "64px", height: "64px", borderRadius: "50%", objectFit: "cover", objectPosition: "50% 20%", border: "2px solid #A8DCC0" }} />
          <h2 style={{ margin: "0", fontFamily: "var(--font-anzeige-serif), Georgia, serif", fontWeight: "600", fontSize: "34px", lineHeight: "1.1" }}>Der erste Schritt dauert <span style={{ fontStyle: "italic", color: "#A8DCC0" }}>30 Minuten.</span></h2>
          <p style={{ margin: "0", fontSize: "16px", color: "#D7E3DC" }}>Per Video, von zu Hause. Passt es nicht, sage ich dir das ehrlich.</p>
          <KonsultationLink abschnitt="sabine-abschluss" metaMelden={false} className="js-book" style={{ minHeight: "56px", borderRadius: "16px", background: "#A8DCC0", color: "#0F2A1F", textDecoration: "none", display: "flex", alignItems: "center", justifyContent: "center", gap: "10px", fontWeight: "700", fontSize: "17px" }}>Konsultation buchen · 69 €
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true"><path d="M5 12h14" /><path d="M13 6l6 6-6 6" /></svg>
          </KonsultationLink>
        </section>

        {/* FOOTER */}
        <footer style={{ padding: "24px 20px 40px", display: "flex", flexDirection: "column", gap: "10px", fontSize: "13px", color: "#4A5A52" }}>
          <p style={{ margin: "0" }}>Sabine ist eine fiktive Figur, die Illustrationen sind mit KI erstellt. Der Chatverlauf ist ein Beispiel. Jeder Verlauf ist individuell.</p>
          <div style={{ display: "flex", flexWrap: "wrap", gap: "16px" }}>
            <a href="/impressum" style={{ color: "#33433B" }}>Impressum</a>
            <a href="/datenschutz" style={{ color: "#33433B" }}>Datenschutz</a>
            <ConsentEinstellungenLink className="js-cookie-settings" style={{ color: "#33433B" }} />
          </div>
        </footer>
      </main>
      <StickyBuchung abschnitt="sabine-leiste" />
    </>
  )
}
