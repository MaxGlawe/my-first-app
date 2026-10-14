import type { Metadata } from "next"
import { MetaPixel } from "@/components/analytics/MetaPixel"
import { AufmerksamkeitMessen } from "@/components/analytics/AufmerksamkeitMessen"
import { ConsentEinstellungenLink } from "@/components/analytics/ConsentBanner"
import { KonsultationLink } from "@/components/landing/KonsultationLink"
import { AnzeigeBild } from "@/components/anzeigen/AnzeigeBild"
import { StickyBuchung } from "@/components/anzeigen/StickyBuchung"
import { GEMESSENE_SEITEN } from "@/lib/gemessene-seiten"

/**
 * Anzeigen-Landingpage „Erstattung" — Ziel der Meta-Anzeige Erstattung
 * (`utm_content=erstattung`).
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
  title: "90 Tage Physiotherapie-Begleitung per Video | Praxis OS",
  description:
    "Physiotherapie als 90-Tage-Programm: Plan in der App, Therapeut im Chat und per Video, Heilpraktiker-Rechnung. Einstieg: kostenloses Kennenlernen, 20 Min. per Video.",
  robots: { index: false, follow: true },
  alternates: { canonical: "https://wwwpraxis-os.com/start/erstattung" },
}

export default function ErstattungLandingPage() {
  return (
    <>
      <MetaPixel />
      {/* Nur PageView an Meta. Der Buchungsklick geht ausschliesslich in die
          eigene Messung — siehe `metaMelden={false}` an jedem Knopf. */}
      <AufmerksamkeitMessen
        seite="start-erstattung"
        abschnitte={GEMESSENE_SEITEN["start-erstattung"].abschnitte.map((a) => a.id)}
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

          <h1 style={{ margin: "0", fontFamily: "var(--font-anzeige-serif), Georgia, serif", fontWeight: "600", fontSize: "40px", lineHeight: "1.05", letterSpacing: "-0.015em" }}>Nicht sechs Termine. <span style={{ fontStyle: "italic", color: "#A8DCC0" }}>90 Tage Begleitung.</span></h1>

          <p style={{ margin: "0", fontSize: "17px", color: "#D7E3DC" }}>Physiotherapie als Programm: ein Plan in der App, dein Therapeut im Chat und per Video – mit Heilpraktiker-Rechnung für deine Versicherung.</p>

          <div style={{ display: "flex", flexWrap: "wrap", gap: "8px" }}>
            <span style={{ background: "#1E4434", color: "#DDE8E1", borderRadius: "999px", padding: "5px 11px", fontSize: "13px", fontWeight: "600" }}>Ohne Rezept</span>
            <span style={{ background: "#1E4434", color: "#DDE8E1", borderRadius: "999px", padding: "5px 11px", fontSize: "13px", fontWeight: "600" }}>Von zu Hause</span>
            <span style={{ background: "#1E4434", color: "#DDE8E1", borderRadius: "999px", padding: "5px 11px", fontSize: "13px", fontWeight: "600" }}>Heilpraktiker-Rechnung</span>
          </div>

          <div style={{ display: "flex", flexDirection: "column", gap: "10px" }}>
            <KonsultationLink abschnitt="erstattung-hero" metaMelden={false} neuerTab={false} className="js-book" style={{ minHeight: "56px", borderRadius: "16px", background: "#A8DCC0", color: "#0F2A1F", textDecoration: "none", display: "flex", alignItems: "center", justifyContent: "center", gap: "10px", fontWeight: "700", fontSize: "17px" }}>Kostenloses Kennenlernen buchen
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true"><path d="M5 12h14" /><path d="M13 6l6 6-6 6" /></svg>
            </KonsultationLink>
            <p style={{ margin: "0", textAlign: "center", fontSize: "13px", color: "#B9CEC2" }}>20 Min. per Video · unverbindlich · deutschlandweit</p>
          </div>

          <div style={{ display: "flex", gap: "14px", alignItems: "flex-start", background: "#17382A", borderRadius: "20px", padding: "16px" }}>
            <AnzeigeBild name="max-klein" alt="Max Glawe" sofort width={52} height={52} style={{ width: "52px", height: "52px", borderRadius: "50%", objectFit: "cover", objectPosition: "50% 20%", flex: "0 0 auto", border: "2px solid #A8DCC0" }} />
            <div style={{ display: "flex", flexDirection: "column", gap: "6px" }}>
              <p style={{ margin: "0", fontFamily: "var(--font-anzeige-serif), Georgia, serif", fontStyle: "italic", fontSize: "18px", lineHeight: "1.35", color: "#F5F1EA" }}>„Die meiste Arbeit passiert zwischen den Terminen. Genau dort begleite ich dich.“</p>
              <span style={{ fontSize: "13px", color: "#B9CEC2" }}>Max Glawe · Heilpraktiker für Physiotherapie</span>
            </div>
          </div>
        </section>

        {/* WAS IST NEU */}
        <section id="was-ist-anders" style={{ padding: "44px 20px 40px", display: "flex", flexDirection: "column", gap: "16px" }}>
          <p style={{ margin: "0", fontSize: "12px", letterSpacing: "0.14em", textTransform: "uppercase", fontWeight: "700", color: "#2B6A4E" }}>Was ist anders?</p>
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

          <div style={{ display: "flex", flexDirection: "column", gap: "0" }}>
            <div style={{ display: "flex", gap: "16px" }}>
              <div style={{ display: "flex", flexDirection: "column", alignItems: "center", flex: "0 0 auto" }}>
                <span style={{ width: "40px", height: "40px", borderRadius: "50%", background: "#0F2A1F", color: "#A8DCC0", display: "flex", alignItems: "center", justifyContent: "center", fontFamily: "var(--font-anzeige-serif), Georgia, serif", fontSize: "18px", fontWeight: "600" }}>1</span>
                <span style={{ width: "2px", flex: "1 1 auto", background: "#CFC6B6" }}></span>
              </div>
              <div style={{ padding: "6px 0 26px", display: "flex", flexDirection: "column", gap: "4px" }}>
                <span style={{ fontSize: "12px", fontWeight: "700", letterSpacing: "0.1em", textTransform: "uppercase", color: "#4A5A52" }}>Tag 1 · 20 Min.</span>
                <span style={{ fontSize: "18px", fontWeight: "600" }}>Kostenloses Kennenlernen</span>
                <span style={{ fontSize: "15px", color: "#33433B" }}>Wir sprechen über deine Beschwerden und dein Ziel und prüfen ehrlich, ob Betreuung aus der Ferne zu dir passt. Danach entscheidest du.</span>
              </div>
            </div>
            <div style={{ display: "flex", gap: "16px" }}>
              <div style={{ display: "flex", flexDirection: "column", alignItems: "center", flex: "0 0 auto" }}>
                <span style={{ width: "40px", height: "40px", borderRadius: "50%", background: "#0F2A1F", color: "#A8DCC0", display: "flex", alignItems: "center", justifyContent: "center", fontFamily: "var(--font-anzeige-serif), Georgia, serif", fontSize: "18px", fontWeight: "600" }}>2</span>
                <span style={{ width: "2px", flex: "1 1 auto", background: "#CFC6B6" }}></span>
              </div>
              <div style={{ padding: "6px 0 26px", display: "flex", flexDirection: "column", gap: "4px" }}>
                <span style={{ fontSize: "12px", fontWeight: "700", letterSpacing: "0.1em", textTransform: "uppercase", color: "#4A5A52" }}>Start</span>
                <span style={{ fontSize: "18px", fontWeight: "600" }}>Erstbefundung und dein Plan</span>
                <span style={{ fontSize: "15px", color: "#33433B" }}>Zum Start schauen wir uns alles ausführlich per Video an. Danach bekommst du deinen Plan in der App.</span>
              </div>
            </div>
            <div style={{ display: "flex", gap: "16px" }}>
              <div style={{ display: "flex", flexDirection: "column", alignItems: "center", flex: "0 0 auto" }}>
                <span style={{ width: "40px", height: "40px", borderRadius: "50%", background: "#0F2A1F", color: "#A8DCC0", display: "flex", alignItems: "center", justifyContent: "center", fontFamily: "var(--font-anzeige-serif), Georgia, serif", fontSize: "18px", fontWeight: "600" }}>3</span>
                <span style={{ width: "2px", flex: "1 1 auto", background: "#CFC6B6" }}></span>
              </div>
              <div style={{ padding: "6px 0 26px", display: "flex", flexDirection: "column", gap: "4px" }}>
                <span style={{ fontSize: "12px", fontWeight: "700", letterSpacing: "0.1em", textTransform: "uppercase", color: "#4A5A52" }}>Die Wochen danach</span>
                <span style={{ fontSize: "18px", fontWeight: "600" }}>Training mit Rückendeckung</span>
                <span style={{ fontSize: "15px", color: "#33433B" }}>Kurze Check-ins im Alltag, Fragen im Chat – Antwort innerhalb von 24 Stunden. Ich passe den Plan an, wenn etwas nicht passt. Erst eng, dann mit langer Leine.</span>
              </div>
            </div>
            <div style={{ display: "flex", gap: "16px" }}>
              <div style={{ display: "flex", flexDirection: "column", alignItems: "center", flex: "0 0 auto" }}>
                <span style={{ width: "40px", height: "40px", borderRadius: "50%", background: "#A8DCC0", color: "#0F2A1F", display: "flex", alignItems: "center", justifyContent: "center", fontFamily: "var(--font-anzeige-serif), Georgia, serif", fontSize: "18px", fontWeight: "600" }}>4</span>
              </div>
              <div style={{ padding: "6px 0 0", display: "flex", flexDirection: "column", gap: "4px" }}>
                <span style={{ fontSize: "12px", fontWeight: "700", letterSpacing: "0.1em", textTransform: "uppercase", color: "#4A5A52" }}>Tag 90</span>
                <span style={{ fontSize: "18px", fontWeight: "600" }}>Du machst allein weiter</span>
                <span style={{ fontSize: "15px", color: "#33433B" }}>Am Ende hast du einen Plan, den du selbstständig weiterführen kannst. Das Programm endet automatisch.</span>
              </div>
            </div>
          </div>
        </section>

        {/* WAS DU DAVON HAST */}
        <section id="was-du-davon-hast" style={{ background: "#E9E2D5", padding: "44px 20px", display: "flex", flexDirection: "column", gap: "16px" }}>
          <h2 style={{ margin: "0 0 4px", fontFamily: "var(--font-anzeige-serif), Georgia, serif", fontWeight: "600", fontSize: "32px", lineHeight: "1.1" }}>Was du davon hast</h2>
          <div style={{ display: "grid", gridTemplateColumns: "repeat(2, minmax(0, 1fr))", gap: "10px" }}>
            <div style={{ background: "#FFFFFF", borderRadius: "20px", padding: "16px", display: "flex", flexDirection: "column", gap: "8px" }}>
              <span style={{ width: "36px", height: "36px", borderRadius: "10px", background: "#E4EEE8", color: "#1F4A36", display: "flex", alignItems: "center", justifyContent: "center" }}>
                <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true"><circle cx="12" cy="8" r="4" /><path d="M4 21c0-4 4-6 8-6s8 2 8 6" /></svg>
              </span>
              <span style={{ fontSize: "15px", fontWeight: "600", lineHeight: "1.3" }}>Ein fester Ansprechpartner</span>
              <span style={{ fontSize: "13.5px", lineHeight: "1.4", color: "#4A5A52" }}>Du erzählst deine Geschichte nur einmal.</span>
            </div>
            <div style={{ background: "#FFFFFF", borderRadius: "20px", padding: "16px", display: "flex", flexDirection: "column", gap: "8px" }}>
              <span style={{ width: "36px", height: "36px", borderRadius: "10px", background: "#E4EEE8", color: "#1F4A36", display: "flex", alignItems: "center", justifyContent: "center" }}>
                <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true"><path d="M3 11l9-7 9 7" /><path d="M5 10v10h14V10" /></svg>
              </span>
              <span style={{ fontSize: "15px", fontWeight: "600", lineHeight: "1.3" }}>Keine Anfahrt, kein Wartezimmer</span>
              <span style={{ fontSize: "13.5px", lineHeight: "1.4", color: "#4A5A52" }}>Training dann, wenn es in deinen Tag passt.</span>
            </div>
            <div style={{ background: "#FFFFFF", borderRadius: "20px", padding: "16px", display: "flex", flexDirection: "column", gap: "8px" }}>
              <span style={{ width: "36px", height: "36px", borderRadius: "10px", background: "#E4EEE8", color: "#1F4A36", display: "flex", alignItems: "center", justifyContent: "center" }}>
                <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true"><path d="M21 12a8 8 0 0 1-11.6 7.1L4 20l1-4.6A8 8 0 1 1 21 12z" /></svg>
              </span>
              <span style={{ fontSize: "15px", fontWeight: "600", lineHeight: "1.3" }}>Fragen, wenn sie aufkommen</span>
              <span style={{ fontSize: "13.5px", lineHeight: "1.4", color: "#4A5A52" }}>Nicht erst beim nächsten Termin in zwei Wochen.</span>
            </div>
            <div style={{ background: "#FFFFFF", borderRadius: "20px", padding: "16px", display: "flex", flexDirection: "column", gap: "8px" }}>
              <span style={{ width: "36px", height: "36px", borderRadius: "10px", background: "#E4EEE8", color: "#1F4A36", display: "flex", alignItems: "center", justifyContent: "center" }}>
                <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true"><path d="M5 12l5 5 9-10" /></svg>
              </span>
              <span style={{ fontSize: "15px", fontWeight: "600", lineHeight: "1.3" }}>Ein Plan, der bleibt</span>
              <span style={{ fontSize: "13.5px", lineHeight: "1.4", color: "#4A5A52" }}>Nach 90 Tagen weißt du, wie du allein weitermachst.</span>
            </div>
          </div>

          {/* Betreuung zeigen */}
          <div style={{ background: "#F5F1EA", borderRadius: "24px", padding: "18px", display: "flex", flexDirection: "column", gap: "10px", marginTop: "6px" }}>
            <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", gap: "10px" }}>
              <span style={{ fontSize: "12px", fontWeight: "700", letterSpacing: "0.1em", textTransform: "uppercase", color: "#2B6A4E" }}>So sieht die Betreuung aus</span>
              <span style={{ fontSize: "11px", color: "#4A5A52", background: "#FFFFFF", borderRadius: "6px", padding: "2px 8px" }}>Beispiel</span>
            </div>
            <div style={{ alignSelf: "flex-end", maxWidth: "250px", background: "#0F2A1F", color: "#F5F1EA", borderRadius: "16px 4px 16px 16px", padding: "9px 12px", fontSize: "14.5px", lineHeight: "1.4" }}>Die zweite Übung zieht heute etwas. Soll ich weitermachen?</div>
            <div style={{ alignSelf: "flex-start", maxWidth: "270px", background: "#FFFFFF", borderRadius: "4px 16px 16px 16px", padding: "9px 12px", fontSize: "14.5px", lineHeight: "1.4" }}>Gut, dass du fragst. Mach sie heute nur halb so weit und schick mir morgen kurz, wie es war. Dann passe ich deinen Plan an.</div>
            <span style={{ alignSelf: "flex-start", fontSize: "12px", color: "#4A5A52", display: "flex", alignItems: "center", gap: "6px" }}>
              <AnzeigeBild name="max-klein" alt="" width={18} height={18} style={{ width: "18px", height: "18px", borderRadius: "50%", objectFit: "cover", objectPosition: "50% 20%" }} />Max · Antwort innerhalb von 24 h</span>
          </div>
        </section>

        {/* PAKETE */}
        <section id="pakete" style={{ padding: "44px 20px", display: "flex", flexDirection: "column", gap: "16px" }}>
          <h2 style={{ margin: "0", fontFamily: "var(--font-anzeige-serif), Georgia, serif", fontWeight: "600", fontSize: "32px", lineHeight: "1.1" }}>So startest du</h2>
          <p style={{ margin: "0", fontSize: "15px", color: "#33433B" }}>Das Kennenlernen ist kostenlos und unverbindlich. Erst wenn du starten möchtest, wählst du ein Paket. Keine automatische Verlängerung.</p>

          <div style={{ background: "#0F2A1F", color: "#F5F1EA", borderRadius: "22px", padding: "22px", display: "flex", flexDirection: "column", gap: "6px" }}>
            <span style={{ fontSize: "12px", fontWeight: "700", letterSpacing: "0.1em", textTransform: "uppercase", color: "#A8DCC0" }}>Erster Schritt</span>
            <div style={{ display: "flex", alignItems: "baseline", justifyContent: "space-between", gap: "12px" }}>
              <span style={{ fontSize: "18px", fontWeight: "600" }}>Kennenlernen, 20 Min.</span>
              <span style={{ fontFamily: "var(--font-anzeige-serif), Georgia, serif", fontSize: "32px", fontWeight: "600" }}>Kostenlos</span>
            </div>
            <span style={{ fontSize: "14px", color: "#C9D8CF" }}>Unverbindlich – du entscheidest danach.</span>
          </div>

          <div style={{ background: "#FFFFFF", borderRadius: "22px", padding: "20px", display: "flex", flexDirection: "column", gap: "12px" }}>
            <div style={{ display: "flex", alignItems: "baseline", justifyContent: "space-between", gap: "12px" }}>
              <span style={{ fontSize: "18px", fontWeight: "600" }}>Begleitet</span>
              <span style={{ fontFamily: "var(--font-anzeige-serif), Georgia, serif", fontSize: "28px", fontWeight: "600", color: "#1F4A36" }}>299 €</span>
            </div>
            <div style={{ display: "flex", flexDirection: "column", gap: "8px", fontSize: "14.5px", color: "#33433B" }}>
              <span style={{ display: "flex", gap: "8px", alignItems: "flex-start" }}><svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="#2B6A4E" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true" style={{ flex: "0 0 auto", marginTop: "4px" }}><path d="M5 12l5 5 9-10" /></svg>90 Tage inkl. Erstbefundung und persönlicher Begleitung</span>
              <span style={{ display: "flex", gap: "8px", alignItems: "flex-start" }}><svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="#2B6A4E" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true" style={{ flex: "0 0 auto", marginTop: "4px" }}><path d="M5 12l5 5 9-10" /></svg>Dein individueller Plan in der App</span>
              <span style={{ display: "flex", gap: "8px", alignItems: "flex-start" }}><svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="#2B6A4E" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true" style={{ flex: "0 0 auto", marginTop: "4px" }}><path d="M5 12l5 5 9-10" /></svg>Chat mit mir – Antwort innerhalb von 24 h</span>
              <span style={{ display: "flex", gap: "8px", alignItems: "flex-start" }}><svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="#2B6A4E" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true" style={{ flex: "0 0 auto", marginTop: "4px" }}><path d="M5 12l5 5 9-10" /></svg>Anpassung des Plans, wenn nötig</span>
            </div>
          </div>

          <div style={{ background: "#FFFFFF", borderRadius: "22px", padding: "20px", display: "flex", flexDirection: "column", gap: "12px", border: "2px solid #0F2A1F" }}>
            <div style={{ display: "flex", alignItems: "baseline", justifyContent: "space-between", gap: "12px" }}>
              <span style={{ fontSize: "18px", fontWeight: "600" }}>Intensiv</span>
              <span style={{ fontFamily: "var(--font-anzeige-serif), Georgia, serif", fontSize: "28px", fontWeight: "600", color: "#1F4A36" }}>499 €</span>
            </div>
            <div style={{ display: "flex", flexDirection: "column", gap: "8px", fontSize: "14.5px", color: "#33433B" }}>
              <span style={{ display: "flex", gap: "8px", alignItems: "flex-start" }}><svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="#2B6A4E" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true" style={{ flex: "0 0 auto", marginTop: "4px" }}><path d="M5 12l5 5 9-10" /></svg>Alles aus Begleitet</span>
              <span style={{ display: "flex", gap: "8px", alignItems: "flex-start" }}><svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="#2B6A4E" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true" style={{ flex: "0 0 auto", marginTop: "4px" }}><path d="M5 12l5 5 9-10" /></svg>plus 8 Video-Calls mit mir</span>
              <span style={{ display: "flex", gap: "8px", alignItems: "flex-start" }}><svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="#2B6A4E" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true" style={{ flex: "0 0 auto", marginTop: "4px" }}><path d="M5 12l5 5 9-10" /></svg>Für alle, die regelmäßig gesehen werden möchten</span>
            </div>
          </div>
          <p style={{ margin: "0", fontSize: "13px", color: "#4A5A52", textAlign: "center" }}>Welches Paket passt, besprechen wir im Kennenlernen. Ratenzahlung über Klarna möglich.</p>
        </section>

        {/* VERSICHERUNG */}
        <section id="versicherung" style={{ background: "#E9E2D5", padding: "44px 20px", display: "flex", flexDirection: "column", gap: "16px" }}>
          <p style={{ margin: "0", fontSize: "12px", letterSpacing: "0.14em", textTransform: "uppercase", fontWeight: "700", color: "#2B6A4E" }}>Für deine Versicherung</p>
          <h2 style={{ margin: "0", fontFamily: "var(--font-anzeige-serif), Georgia, serif", fontWeight: "600", fontSize: "30px", lineHeight: "1.12" }}>Privat versichert, Beihilfe oder Zusatzversicherung?</h2>
          <p style={{ margin: "0", fontSize: "15px", color: "#33433B" }}>Praxis OS ist eine Selbstzahlerleistung. Du bekommst eine Heilpraktiker-Rechnung, die du bei deiner Versicherung einreichen kannst. Ob und wie viel erstattet wird, hängt von deinem Vertrag ab.</p>
          <div style={{ display: "flex", flexDirection: "column", gap: "10px" }}>
            <div style={{ background: "#FFFFFF", borderRadius: "18px", padding: "16px", display: "flex", gap: "14px", alignItems: "center" }}>
              <span style={{ fontFamily: "var(--font-anzeige-serif), Georgia, serif", fontStyle: "italic", fontSize: "28px", color: "#2B6A4E", flex: "0 0 auto", width: "24px" }}>1</span>
              <span style={{ fontSize: "15px" }}>Du bekommst einen Kostenvoranschlag.</span>
            </div>
            <div style={{ background: "#FFFFFF", borderRadius: "18px", padding: "16px", display: "flex", gap: "14px", alignItems: "center" }}>
              <span style={{ fontFamily: "var(--font-anzeige-serif), Georgia, serif", fontStyle: "italic", fontSize: "28px", color: "#2B6A4E", flex: "0 0 auto", width: "24px" }}>2</span>
              <span style={{ fontSize: "15px" }}>Du fragst damit bei deiner Versicherung nach.</span>
            </div>
            <div style={{ background: "#FFFFFF", borderRadius: "18px", padding: "16px", display: "flex", gap: "14px", alignItems: "center" }}>
              <span style={{ fontFamily: "var(--font-anzeige-serif), Georgia, serif", fontStyle: "italic", fontSize: "28px", color: "#2B6A4E", flex: "0 0 auto", width: "24px" }}>3</span>
              <span style={{ fontSize: "15px" }}>Du reichst die Rechnung ein.</span>
            </div>
          </div>
          <p style={{ margin: "0", fontSize: "13px", color: "#4A5A52" }}>Die gesetzliche Krankenkasse übernimmt die Kosten nicht.</p>
        </section>

        {/* WER */}
        <section id="wer-betreut-dich" style={{ padding: "44px 20px", display: "flex", flexDirection: "column", gap: "18px" }}>
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
        </section>

        {/* FAQ */}
        <section id="faq" style={{ padding: "8px 20px 40px", display: "flex", flexDirection: "column", gap: "10px" }}>
          <h2 style={{ margin: "0 0 8px", fontFamily: "var(--font-anzeige-serif), Georgia, serif", fontWeight: "600", fontSize: "32px", lineHeight: "1.1" }}>Kurz gefragt</h2>
          <details className="faq" open><summary><span>Was passiert im Kennenlernen?</span><span className="sign" aria-hidden="true"></span></summary><p>Wir sprechen 20 Minuten per Video über deine Beschwerden, deinen Alltag und dein Ziel. Ich sage dir ehrlich, ob Praxis OS zu dir passt – und wenn ja, welches Paket sinnvoll ist.</p></details>
          <details className="faq"><summary><span>Muss ich danach etwas buchen?</span><span className="sign" aria-hidden="true"></span></summary><p>Nein. Das Kennenlernen ist kostenlos und unverbindlich. Du entscheidest in Ruhe.</p></details>
          <details className="faq"><summary><span>Zahlt meine Heilpraktiker-Zusatzversicherung?</span><span className="sign" aria-hidden="true"></span></summary><p>Das hängt von deinem Vertrag ab. Du bekommst eine Heilpraktiker-Rechnung und vorab einen Kostenvoranschlag – damit kannst du bei deiner Versicherung nachfragen, bevor du startest.</p></details>
          <details className="faq"><summary><span>Zahlt die Beihilfe?</span><span className="sign" aria-hidden="true"></span></summary><p>Auch das hängt von deinen Beihilfevorschriften und deinem Vertrag ab. Mit dem Kostenvoranschlag kannst du es vorher klären.</p></details>
          <details className="faq"><summary><span>Wie läuft die Abrechnung ab?</span><span className="sign" aria-hidden="true"></span></summary><p>Du zahlst erst, wenn du das Programm startest – auf Wunsch über Klarna. Den Kostenvoranschlag für deine Versicherung bekommst du nach dem Kennenlernen. Du bekommst eine Heilpraktiker-Rechnung, die du selbst einreichst.</p></details>
          <details className="faq"><summary><span>Funktioniert Physiotherapie per Video überhaupt?</span><span className="sign" aria-hidden="true"></span></summary><p>Für viele Beschwerden ja – vor allem, wenn es um Übungen, Belastung und Alltag geht. Ob es für dich passt, prüfen wir im Kennenlernen. Wenn nicht, sage ich dir das ehrlich und empfehle dir, was stattdessen sinnvoll ist.</p></details>
          <details className="faq"><summary><span>Brauche ich ein Rezept?</span><span className="sign" aria-hidden="true"></span></summary><p>Nein. Als Heilpraktiker für Physiotherapie darf ich dich ohne ärztliche Verordnung betreuen.</p></details>
          <details className="faq"><summary><span>Was passiert nach den 90 Tagen?</span><span className="sign" aria-hidden="true"></span></summary><p>Das Programm endet automatisch – es verlängert sich nichts. Du kannst mit deinem Plan selbstständig weitertrainieren. Möchtest du weiter begleitet werden, ist das möglich – das besprechen wir individuell.</p></details>
        </section>

        {/* ABSCHLUSS */}
        <section id="abschluss" style={{ background: "#0F2A1F", color: "#F5F1EA", padding: "48px 20px", display: "flex", flexDirection: "column", gap: "18px" }}>
          <AnzeigeBild name="max-klein" alt="Max Glawe" width={64} height={64} style={{ width: "64px", height: "64px", borderRadius: "50%", objectFit: "cover", objectPosition: "50% 20%", border: "2px solid #A8DCC0" }} />
          <h2 style={{ margin: "0", fontFamily: "var(--font-anzeige-serif), Georgia, serif", fontWeight: "600", fontSize: "34px", lineHeight: "1.1" }}>Der erste Schritt dauert <span style={{ fontStyle: "italic", color: "#A8DCC0" }}>20 Minuten. Und kostet nichts.</span></h2>
          <p style={{ margin: "0", fontSize: "16px", color: "#D7E3DC" }}>Per Video, von zu Hause. Passt es nicht, sage ich dir das ehrlich.</p>
          <KonsultationLink abschnitt="erstattung-abschluss" metaMelden={false} neuerTab={false} className="js-book" style={{ minHeight: "56px", borderRadius: "16px", background: "#A8DCC0", color: "#0F2A1F", textDecoration: "none", display: "flex", alignItems: "center", justifyContent: "center", gap: "10px", fontWeight: "700", fontSize: "17px" }}>Kostenloses Kennenlernen buchen
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true"><path d="M5 12h14" /><path d="M13 6l6 6-6 6" /></svg>
          </KonsultationLink>
        </section>

        {/* FOOTER */}
        <footer style={{ padding: "24px 20px 40px", display: "flex", flexDirection: "column", gap: "10px", fontSize: "13px", color: "#4A5A52" }}>
          <p style={{ margin: "0" }}>Der Chatverlauf ist ein Beispiel. Jeder Verlauf ist individuell. Ob deine Versicherung erstattet, hängt von deinem Vertrag ab.</p>
          <div style={{ display: "flex", flexWrap: "wrap", gap: "16px" }}>
            <a href="/impressum" style={{ color: "#33433B" }}>Impressum</a>
            <a href="/datenschutz" style={{ color: "#33433B" }}>Datenschutz</a>
            <ConsentEinstellungenLink className="js-cookie-settings" style={{ color: "#33433B" }} />
          </div>
        </footer>
      </main>
      <StickyBuchung abschnitt="erstattung-leiste" />
    </>
  )
}
