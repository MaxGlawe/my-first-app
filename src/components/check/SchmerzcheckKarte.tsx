"use client"

/**
 * Der Schmerzcheck — sechs Fragen, Einschätzung, Buchung.
 *
 * ── Was diese Karte NICHT tut ───────────────────────────────────────────
 *
 * Sie fragt keinen Server. Die Einschätzung entsteht im Browser aus den
 * Bausteinen in `lib/check/ergebnis`, und die Antworten verlassen das Gerät
 * erst in einem einzigen Moment: wenn jemand auf „Kostenloses Kennenlernen
 * buchen" tippt. Genau das steht auch unter dem Startknopf, und ein
 * Versprechen, das die Seite selbst bricht, wäre schlimmer als keines.
 *
 * Daraus folgt auch, was die Messung sehen darf: nur den erreichten
 * Schritt, nie eine Antwort. `check_frage_3` heisst „die dritte Frage stand
 * auf dem Bildschirm" — nicht, was dort angetippt wurde.
 *
 * ── Die Adresse bleibt sauber ───────────────────────────────────────────
 *
 * Keine Antwort steht je in der Adresszeile, weder als Parameter noch
 * hinter einem Doppelkreuz. Was dort steht, landet in Server-Protokollen,
 * in der eigenen Messung und beim Meta-Pixel — drei Orte, an denen
 * Angaben über Beschwerden nichts verloren haben. Übergeben wird deshalb
 * ein Kurz-Code, den das Buchungstool ausstellt.
 *
 * ── Und sie steht nie im Weg ────────────────────────────────────────────
 *
 * Scheitert die Übergabe oder dauert sie länger als 1,5 Sekunden, geht es
 * trotzdem zum Kalender, nur ohne Code. Eine Buchung darf an einer
 * Bequemlichkeit nicht scheitern.
 */

import { useCallback, useEffect, useRef, useState } from "react"
import { FRAGEN, FLAGGE_JA, zusammenfassung, type Antworten } from "@/lib/check/fragen"
import { baueErgebnis } from "@/lib/check/ergebnis"
import { buchungsUrl } from "@/lib/programm"
import { mitHerkunft } from "@/lib/kampagnen-herkunft"
import { useConversionTracker } from "@/hooks/use-conversion-tracker"
import { AnzeigeBild } from "@/components/anzeigen/AnzeigeBild"

/** Wie lange die Antwort markiert bleibt, bevor es weitergeht. */
const WEITER_MS = 250

/** Länger als das warten wir nicht auf den Kurz-Code. */
const UEBERGABE_MS = 1500

const GRUEN = "#0F2A1F"
const MINT = "#A8DCC0"
const MINT_SANFT = "#DCEFE4"
const MITTEL = "#2F6B4F"
const CREME = "#F5F1EA"
const TINTE = "#16241D"
const LEISE = "#5B6A62"
const WARN_SANFT = "#FBEDE4"

const serif = "var(--font-anzeige-serif), Georgia, serif"

function Pfeil() {
  return (
    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.4" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
      <path d="M5 12h14M13 6l6 6-6 6" />
    </svg>
  )
}

function Haken() {
  return (
    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke={MITTEL} strokeWidth="2.6" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true" style={{ flex: "0 0 auto", marginTop: "3px" }}>
      <path d="M5 12l5 5 9-10" />
    </svg>
  )
}

function Schloss() {
  return (
    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke={LEISE} strokeWidth="2" strokeLinecap="round" aria-hidden="true" style={{ flex: "0 0 auto", marginTop: "2px" }}>
      <rect x="5" y="11" width="14" height="10" rx="2" />
      <path d="M8 11V8a4 4 0 0 1 8 0v3" />
    </svg>
  )
}

const knopfStil: React.CSSProperties = {
  display: "flex",
  justifyContent: "center",
  alignItems: "center",
  gap: "10px",
  width: "100%",
  border: "0",
  borderRadius: "16px",
  padding: "17px 20px",
  font: "inherit",
  fontSize: "18px",
  fontWeight: 600,
  cursor: "pointer",
  background: GRUEN,
  color: CREME,
  textDecoration: "none",
  minHeight: "56px",
}

export function SchmerzcheckKarte() {
  /** −1 = Einstieg, 0…5 = Fragen, 6 = Ergebnis. */
  const [schritt, setSchritt] = useState(-1)
  const [antworten, setAntworten] = useState<Antworten>({})
  const [gewaehlt, setGewaehlt] = useState<string | null>(null)
  const [laedt, setLaedt] = useState(false)
  const { trackConversion } = useConversionTracker()

  const uhr = useRef<number | null>(null)
  useEffect(() => () => { if (uhr.current) window.clearTimeout(uhr.current) }, [])

  /**
   * Jeder Schritt meldet sich genau einmal.
   *
   * Ohne das Gedächtnis zählt ein Zurück-und-wieder-vor jede Frage erneut —
   * und der Trichter zeigte dann mehr Menschen bei Frage 4 als bei Frage 3.
   */
  const gemeldet = useRef<Set<string>>(new Set())
  const melden = useCallback(
    (name: string) => {
      if (gemeldet.current.has(name)) return
      gemeldet.current.add(name)
      trackConversion(name)
    },
    [trackConversion]
  )

  useEffect(() => {
    if (schritt < 0 || schritt >= FRAGEN.length) return
    melden(`check_frage_${schritt + 1}`)
  }, [schritt, melden])

  const fertig = schritt >= FRAGEN.length
  const ergebnis = fertig ? baueErgebnis(antworten) : null

  useEffect(() => {
    if (!ergebnis) return
    melden(ergebnis.stopp ? "check_sicherheitsstopp" : "check_ergebnis")
  }, [ergebnis, melden])

  const starten = () => {
    melden("check_gestartet")
    setSchritt(0)
  }

  const antworten_ = (schluessel: string, wert: string) => {
    setGewaehlt(wert)
    setAntworten((a) => ({ ...a, [schluessel]: wert }))
    uhr.current = window.setTimeout(() => {
      setGewaehlt(null)
      setSchritt((s) => s + 1)
    }, WEITER_MS)
  }

  const zurueck = () => {
    if (uhr.current) window.clearTimeout(uhr.current)
    setGewaehlt(null)
    setSchritt((s) => Math.max(-1, s - 1))
  }

  const neuStarten = () => {
    setAntworten({})
    setGewaehlt(null)
    setSchritt(-1)
  }

  /**
   * Zum Kalender — mit Kurz-Code, wenn er rechtzeitig da ist.
   *
   * Der Link trägt bereits das richtige Ziel. Wir fangen den Klick nur ab,
   * um den Code anzuhängen; geht dabei irgendetwas schief, landet der
   * Besucher auf genau der Adresse, die ohnehin im `href` stand.
   */
  const zumKalender = async (e: React.MouseEvent<HTMLAnchorElement>) => {
    const ziel = e.currentTarget.href
    e.preventDefault()
    if (laedt) return
    setLaedt(true)
    trackConversion("check_kennenlernen_klick")

    let code: string | null = null
    try {
      const abbruch = new AbortController()
      const frist = window.setTimeout(() => abbruch.abort(), UEBERGABE_MS)
      const antwort = await fetch("/api/check/uebergabe", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ zusammenfassung: zusammenfassung(antworten) }),
        signal: abbruch.signal,
      })
      window.clearTimeout(frist)
      if (antwort.ok) {
        const d = (await antwort.json()) as { token?: string }
        if (d.token) code = d.token
      }
    } catch {
      // Zeitüberschreitung oder Netzfehler: Dann eben ohne Code.
    } finally {
      window.location.href = code ? `${ziel}&check=${encodeURIComponent(code)}` : ziel
    }
  }

  // ── Darstellung ────────────────────────────────────────────────────────
  const karte: React.CSSProperties = {
    background: "#FFFFFF",
    color: TINTE,
    borderRadius: "22px",
    padding: "22px 20px 20px",
    boxShadow: "0 18px 40px rgba(0,0,0,.25)",
    display: "grid",
    gap: "16px",
  }

  if (schritt < 0) {
    return (
      <div className="check-karte" style={karte} aria-live="polite">
        <div style={{ display: "grid", gap: "14px" }}>
          <h2 style={{ margin: "0", fontFamily: serif, fontWeight: 600, fontSize: "24px", lineHeight: "1.2" }}>
            Dein kurzer Check
          </h2>
          {/* Auf kurzen Bildschirmen ausgeblendet (siehe `.check-vorteile`
              in anzeigen.css): Die drei Zeilen sagen dasselbe wie die
              Unterzeile darueber, und der Startknopf muss ins Bild. */}
          <ul className="check-vorteile" style={{ margin: "0", padding: "0", listStyle: "none", display: "grid", gap: "8px", fontSize: "16px" }}>
            {["Wo und seit wann es dich bremst", "Was dir bisher im Weg steht", "Ob eine Betreuung von zu Hause sicher passt"].map((t) => (
              <li key={t} style={{ display: "flex", gap: "10px", alignItems: "flex-start" }}>
                <Haken />
                <span>{t}</span>
              </li>
            ))}
          </ul>
          <button type="button" onClick={starten} style={knopfStil}>
            Check starten <Pfeil />
          </button>
          <p style={{ display: "flex", gap: "8px", alignItems: "flex-start", fontSize: "13.5px", color: LEISE, margin: "0" }}>
            <Schloss />
            <span>
              Deine Antworten bleiben auf deinem Gerät. Erst wenn du ein Kennenlernen buchst, siehst
              du sie im Formular und entscheidest selbst, ob du sie mitschickst.
            </span>
          </p>
        </div>
      </div>
    )
  }

  if (!fertig) {
    const f = FRAGEN[schritt]
    const beantwortet = gewaehlt ?? antworten[f.schluessel] ?? null
    const anteil = Math.round(((schritt + (beantwortet ? 1 : 0)) / FRAGEN.length) * 100)
    return (
      <div className="check-karte" style={karte} aria-live="polite">
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", fontSize: "14px", color: LEISE, fontVariantNumeric: "tabular-nums" }}>
          <button
            type="button"
            onClick={zurueck}
            style={{ background: "none", border: "0", padding: "4px 0", font: "inherit", fontSize: "14px", color: MITTEL, fontWeight: 600, cursor: "pointer" }}
          >
            ‹ Zurück
          </button>
          <span>
            Frage {schritt + 1} von {FRAGEN.length}
          </span>
        </div>

        <div style={{ height: "6px", background: MINT_SANFT, borderRadius: "99px", overflow: "hidden" }} aria-hidden="true">
          <div style={{ height: "100%", width: `${anteil}%`, background: MITTEL, borderRadius: "99px", transition: "width .35s ease" }} />
        </div>

        <div style={{ display: "grid", gap: "16px" }}>
          <h2 id="check-frage" style={{ margin: "0", fontFamily: serif, fontWeight: 600, fontSize: "25px", lineHeight: "1.18" }}>
            {f.frage}
          </h2>

          {"hinweis" in f && f.hinweis && (
            <p style={{ margin: "-8px 0 0", color: LEISE, fontSize: "15px" }}>{f.hinweis}</p>
          )}

          {"liste" in f && f.liste && (
            <ul style={{ margin: "0", padding: "14px 16px 14px 34px", background: WARN_SANFT, borderRadius: "14px", color: "#5A3420", fontSize: "15px", display: "grid", gap: "4px" }}>
              {f.liste.map((t) => (
                <li key={t}>{t}</li>
              ))}
            </ul>
          )}

          <div
            role="radiogroup"
            aria-labelledby="check-frage"
            style={{
              display: "grid",
              gap: "10px",
              gridTemplateColumns: "zweispaltig" in f && f.zweispaltig ? "1fr 1fr" : "1fr",
            }}
          >
            {f.antworten.map((t) => {
              const aktiv = beantwortet === t
              return (
                <button
                  key={t}
                  type="button"
                  role="radio"
                  aria-checked={aktiv}
                  onClick={() => antworten_(f.schluessel, t)}
                  style={{
                    display: "flex",
                    alignItems: "center",
                    gap: "12px",
                    width: "100%",
                    textAlign: "left",
                    font: "inherit",
                    fontSize: "17px",
                    fontWeight: 500,
                    color: TINTE,
                    background: aktiv ? MINT_SANFT : CREME,
                    border: `2px solid ${aktiv ? MITTEL : "transparent"}`,
                    borderRadius: "14px",
                    padding: "14px 16px",
                    cursor: "pointer",
                    minHeight: "52px",
                  }}
                >
                  <span
                    aria-hidden="true"
                    style={{
                      width: "20px",
                      height: "20px",
                      borderRadius: "50%",
                      border: `2px solid ${aktiv ? MITTEL : "#B9C3BD"}`,
                      background: aktiv ? MITTEL : "#FFFFFF",
                      flex: "0 0 auto",
                      display: "grid",
                      placeItems: "center",
                    }}
                  >
                    {aktiv && <span style={{ width: "8px", height: "8px", borderRadius: "50%", background: "#FFFFFF" }} />}
                  </span>
                  {t}
                </button>
              )
            })}
          </div>
        </div>
      </div>
    )
  }

  // ── Ergebnis ───────────────────────────────────────────────────────────
  const e = ergebnis!
  const ziel = mitHerkunft(buchungsUrl("check-ergebnis"))

  /**
   * Die feste Leiste — NUR im Ergebnis, und nur ohne Warnzeichen.
   *
   * Angemerkt am 19.10.2026 beim Durchklicken am Telefon: Im längsten Fall
   * (lange bestehende Beschwerden, starke Einschränkung) stehen fünf
   * Absätze zwischen Überschrift und Buchungsknopf. Wer nicht weiter
   * scrollt, sieht das Angebot nie — und das Lesen ist freiwillig, das
   * Buchen soll es auch sein.
   *
   * Während der Fragen gibt es sie bewusst nicht: Erst Frage 6 klärt, ob
   * eine Betreuung von zu Hause überhaupt sicher ist. Eine Leiste, die
   * vorher schon „buchen" anbietet, würde genau diese Frage entwerten —
   * und bei einem Warnzeichen bleibt sie deshalb auch danach weg.
   *
   * Klassen aus `anzeigen.css`: Das Einwilligungsbanner misst die Höhe von
   * `.sticky-cta` und legt sich darüber, statt sie zu verdecken; `.page`
   * hält unten 110 px frei, damit die Fußzeile nicht darunter liegt.
   */
  const leiste = e.stopp ? null : (
    <div className="sticky-cta" role="region" aria-label="Termin buchen">
      <div className="sticky-cta__inner">
        <AnzeigeBild name="max-klein" alt="" className="sticky-cta__avatar" sofort width={44} height={44} />
        <a href={ziel} onClick={zumKalender} className="js-book sticky-cta__btn">
          {laedt ? "Kalender wird geöffnet …" : "Kostenloses Kennenlernen buchen"}
        </a>
      </div>
      <span className="sticky-cta__note">20 Min. per Video · unverbindlich</span>
    </div>
  )

  return (
    <>
    <div className="check-karte" style={karte} aria-live="polite">
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", fontSize: "14px", color: LEISE }}>
        <button
          type="button"
          onClick={zurueck}
          style={{ background: "none", border: "0", padding: "4px 0", font: "inherit", fontSize: "14px", color: MITTEL, fontWeight: 600, cursor: "pointer" }}
        >
          ‹ Zurück
        </button>
        <span>Fertig</span>
      </div>
      <div style={{ height: "6px", background: MINT_SANFT, borderRadius: "99px", overflow: "hidden" }} aria-hidden="true">
        <div style={{ height: "100%", width: "100%", background: MITTEL, borderRadius: "99px" }} />
      </div>

      {e.stopp ? (
        <div style={{ background: WARN_SANFT, borderRadius: "16px", padding: "18px", display: "grid", gap: "8px", color: "#4A2C1B" }}>
          <h3 style={{ margin: "0", fontFamily: serif, fontSize: "22px", lineHeight: "1.2" }}>{e.ueberschrift}</h3>
          {e.absaetze.map((t) => (
            <p key={t} style={{ margin: "0", fontSize: "15.5px" }}>
              {t}
            </p>
          ))}
        </div>
      ) : (
        <>
          <div style={{ display: "grid", gap: "10px" }}>
            <span style={{ fontSize: "12px", fontWeight: 700, letterSpacing: "0.08em", textTransform: "uppercase", color: MITTEL }}>
              Deine Einschätzung
            </span>
            {e.bereich && (
              <span style={{ justifySelf: "start", background: MINT_SANFT, color: GRUEN, borderRadius: "999px", padding: "5px 12px", fontSize: "14px", fontWeight: 600 }}>
                {e.bereich}
              </span>
            )}
            <h3 style={{ margin: "0", fontFamily: serif, fontWeight: 600, fontSize: "23px", lineHeight: "1.2" }}>
              {e.ueberschrift}
            </h3>
            {e.absaetze.map((t) => (
              <p key={t} style={{ margin: "0", fontSize: "15.5px", lineHeight: "1.55" }}>
                {t}
              </p>
            ))}
          </div>

          <div style={{ background: GRUEN, color: CREME, borderRadius: "18px", padding: "18px 14px", display: "grid", gap: "12px" }}>
            <div style={{ display: "flex", gap: "12px", alignItems: "center" }}>
              {/* Dasselbe Bild wie auf den anderen Anzeigenseiten — ueber
                  dieselbe Komponente, damit WebP-Rueckfall und Masse nicht
                  ein zweites Mal von Hand dastehen. */}
              <AnzeigeBild
                name="max-klein"
                alt="Max Glawe"
                width={46}
                height={46}
                style={{ width: "46px", height: "46px", borderRadius: "50%", objectFit: "cover", objectPosition: "50% 20%", border: `2px solid ${MINT}`, flex: "0 0 auto" }}
              />
              <div>
                <b style={{ display: "block" }}>Max Glawe</b>
                <small style={{ color: "#B9CCC1", fontSize: "13.5px" }}>
                  Physiotherapeut, Heilpraktiker für Physiotherapie
                </small>
              </div>
            </div>
            <h3 style={{ margin: "0", fontFamily: serif, fontWeight: 600, fontSize: "23px", lineHeight: "1.2" }}>
              Lass uns 20 Minuten draufschauen
            </h3>
            <p style={{ margin: "0", color: "#D5E2DA", fontSize: "15.5px" }}>
              Im kostenlosen Kennenlernen per Video sprechen wir über deine Antworten. Danach weißt
              du, ob Praxis OS zu dir passt.
            </p>
            <p style={{ margin: "0", fontSize: "14px", color: "#B9CCC1" }}>
              Deine Antworten übernehmen wir auf Wunsch ins Buchungsformular. Dort kannst du sie
              ändern oder löschen.
            </p>
            <a
              href={ziel}
              onClick={zumKalender}
              className="js-book"
              style={{
                ...knopfStil,
                background: MINT,
                color: GRUEN,
                opacity: laedt ? 0.75 : 1,
                // Eine Zeile: Der Kasten gibt dem Text rund 250 px, und bei
                // 18 px brach „Kostenloses Kennenlernen buchen" um.
                // Nachgemessen am 19.10.2026: Der Text braucht bei 16 px
                // 262 px, im Knopf waren 254 frei — acht Pixel zu wenig,
                // und der Knopf brach auf zwei Zeilen um. Schrift und
                // Innenabstaende sind deshalb auf 8 px Spielraum gesetzt.
                fontSize: "15.5px",
                padding: "16px 10px",
              }}
            >
              {laedt ? "Kalender wird geöffnet …" : "Kostenloses Kennenlernen buchen"}
            </a>
            <div style={{ fontSize: "14px", color: "#B9CCC1", textAlign: "center" }}>
              kostenlos · unverbindlich · 20 Min. per Video
            </div>
          </div>
        </>
      )}

      <button
        type="button"
        onClick={neuStarten}
        style={{ background: "none", border: "0", font: "inherit", color: MITTEL, fontWeight: 600, cursor: "pointer", padding: "6px 0", justifySelf: "center" }}
      >
        Check neu starten
      </button>
    </div>
    {leiste}
    </>
  )
}
