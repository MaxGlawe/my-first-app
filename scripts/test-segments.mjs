/**
 * Sicherheitstest der Segment-Logik (Spec Teil E, Mail-System).
 *
 * Der wichtigste Test hier: Segment D (210 Leads OHNE Double-Opt-in) darf niemals
 * eine Mail bekommen — auch dann nicht, wenn jemand später den Query-Filter im
 * Cron entfernt. Deshalb prüft `assertMailable()` unmittelbar vor jedem Versand
 * nochmal und WIRFT, statt still false zurückzugeben.
 *
 * Zweitwichtigster Test: Segment B (Red-Flag, nicht ärztlich abgeklärt) darf
 * ausschließlich die Brücken-Mails B1/B2 bekommen — nie ein Kaufangebot.
 *
 * Aufruf: npm run test:segments
 */
const {
  computeSegment,
  assertMailable,
  isMasterclassEligible,
  needsRegionRouting,
  redFlagGruppe,
  waitlistGruppe,
} = await import("../src/lib/schmerzcheck/segments.ts")

let pass = 0
let fail = 0
const check = (name, ok, extra = "") => {
  if (ok) { pass++; console.log(`  PASS  ${name}`) }
  else { fail++; console.log(`  FAIL  ${name} ${extra}`) }
}

// Standard-Lead: Segment A, LWS-Schwerpunkt → darf die Masterclass bekommen.
const lead = (over) => ({
  id: "test",
  status: "check_completed",
  consent_status: "confirmed",
  main_region: "unterer_ruecken",
  ...over,
})

console.log("\n── Segment-Zuordnung ──")
check("A: DOI + Check abgeschlossen", computeSegment(lead({})) === "A")
check("B: DOI + Red-Flag, nicht abgeklärt", computeSegment(lead({ status: "red_flag_routed" })) === "B")
check("A: Red-Flag, ärztlich ABGEKLÄRT → wandert nach A",
  computeSegment(lead({ status: "red_flag_routed", medical_cleared_at: "2026-07-12T10:00:00Z" })) === "A")
check("C: DOI, Check offen", computeSegment(lead({ status: "awaiting_check" })) === "C")
check("C: DOI, Check begonnen", computeSegment(lead({ status: "check_started" })) === "C")
check("D: KEIN Double-Opt-in", computeSegment(lead({ consent_status: "pending" })) === "D")
check("D: auch bei abgeschlossenem Check ohne DOI",
  computeSegment(lead({ status: "check_completed", consent_status: "pending" })) === "D")

console.log("\n── Harte Sperre: Segment D bekommt NIE eine Mail ──")
const throws = (l, code) => {
  try { assertMailable(l, code); return false } catch { return true }
}
for (const code of ["M1", "M2", "M3", "M4", "B1", "B2", "C1R"]) {
  check(`Segment D + ${code} → wirft`, throws(lead({ consent_status: "pending" }), code))
}

console.log("\n── Segment B bekommt NUR die Brücken-Mails (kein Kaufangebot) ──")
const b = lead({ status: "red_flag_routed" })
check("B + B1 → erlaubt", !throws(b, "B1"))
check("B + B2 → erlaubt", !throws(b, "B2"))
for (const code of ["M1", "M2", "M3", "M4", "C1R"]) {
  check(`B + ${code} → wirft (Red-Flag darf kein Angebot sehen)`, throws(b, code))
}

console.log("\n── Nach ärztlicher Abklärung darf B die M-Sequenz bekommen ──")
const cleared = lead({ status: "red_flag_routed", medical_cleared_at: "2026-07-12T10:00:00Z" })
check("abgeklärt + M1 → erlaubt", !throws(cleared, "M1"))

console.log("\n── Segment A + C dürfen ihre Mails ──")
check("A + M1 → erlaubt", !throws(lead({}), "M1"))
check("C + C1R → erlaubt", !throws(lead({ status: "awaiting_check" }), "C1R"))

// ── PROJ-25b: Die Masterclass ist ein LWS-Kurs ────────────────────────────────
// Sie einem Nacken- oder Knie-Patienten für 399 € anzubieten, wäre ein
// Fehlverkauf. Bei UNBEKANNTER Region (die 77 aus „Mehrere Bereiche") gibt es
// ebenfalls kein Angebot — erst der RT1-Klick schaltet frei. Fail closed.

console.log("\n── Wer darf die Masterclass (LWS-Kurs) angeboten bekommen? ──")
check("LWS → ja", isMasterclassEligible(lead({ main_region: "unterer_ruecken" })) === true)
check("Nacken/Schulter → NEIN", isMasterclassEligible(lead({ main_region: "nacken_schulter" })) === false)
check("Oberer Rücken → NEIN", isMasterclassEligible(lead({ main_region: "oberer_ruecken" })) === false)
check("Knie/Hüfte/Fuß → NEIN", isMasterclassEligible(lead({ main_region: "knie_huefte_fuss" })) === false)
check("„wechselt ständig“ → NEIN (Default: parken)", isMasterclassEligible(lead({ main_region: "wechselt_staendig" })) === false)
check("Region UNBEKANNT → NEIN (fail closed)", isMasterclassEligible(lead({ main_region: null })) === false)

console.log("\n── M-Mails an Nicht-LWS-Leads MÜSSEN werfen ──")
for (const [region, name] of [
  [null, "unbekannt (die 77)"],
  ["nacken_schulter", "Nacken/Schulter"],
  ["oberer_ruecken", "Oberer Rücken"],
  ["knie_huefte_fuss", "Knie/Hüfte/Fuß"],
  ["wechselt_staendig", "wechselt ständig"],
]) {
  for (const code of ["M1", "M2", "M3", "M4"]) {
    check(`${name} + ${code} → wirft`, throws(lead({ main_region: region }), code))
  }
}

console.log("\n── Routing-Mail RT1/RT2 ──")
check("Region unbekannt + Segment A → braucht RT1", needsRegionRouting(lead({ main_region: null })) === true)
check("Region bekannt → braucht KEIN RT1", needsRegionRouting(lead({ main_region: "nacken_schulter" })) === false)
check("Segment B (Red-Flag) → braucht kein RT1", needsRegionRouting(lead({ status: "red_flag_routed", main_region: null })) === false)
check("RT1 an Lead mit unbekannter Region → erlaubt", !throws(lead({ main_region: null }), "RT1"))
check("RT2 an Lead mit unbekannter Region → erlaubt", !throws(lead({ main_region: null }), "RT2"))
check("RT1 an Lead mit BEKANNTER Region → wirft (sinnlos)", throws(lead({ main_region: "unterer_ruecken" }), "RT1"))
check("Segment D + RT1 → wirft (keine Einwilligung)", throws(lead({ consent_status: "pending", main_region: null }), "RT1"))

// ── PROJ-25c: Der Red-Flag-Split ─────────────────────────────────────────────
// 45 Leads wurden AUSSCHLIESSLICH wegen „Beschwerden, die dich nachts aufwecken"
// gestoppt — nach der entschärften Regel zu Unrecht. Sie bekommen RF1
// („Check nachgeschärft"). Die anderen 72 haben echte Warnzeichen und bekommen
// nur die Arzt-Frage (B1/B2).
//
// Der gefährlichste denkbare Fehler im ganzen System: RF1 an jemanden mit echter
// Sattel-Taubheit oder Blasenkontrollverlust. Diese Mail lädt ihn ein,
// weiterzumachen — bei einem Warnzeichen, das in die Notaufnahme gehört.

const rfLead = (codes) =>
  lead({ status: "red_flag_routed", main_region: null, red_flag_codes: codes })

console.log("\n── Red-Flag-Split: wer bekommt RF1, wer B1? ──")
check("nur nächtlicher Schmerz → rf1", redFlagGruppe(rfLead(["night_pain_severe"])) === "rf1")
check("nur Sattel-Kribbeln → rf1", redFlagGruppe(rfLead(["saddle_tingling"])) === "rf1")
check("nachts + Kribbeln → rf1", redFlagGruppe(rfLead(["night_pain_severe", "saddle_tingling"])) === "rf1")
check("Sattel-TAUBHEIT → b1", redFlagGruppe(rfLead(["saddle_numbness"])) === "b1")
check("Blasenkontrollverlust → b1", redFlagGruppe(rfLead(["bladder_bowel"])) === "b1")
check("Gewichtsverlust → b1", redFlagGruppe(rfLead(["weight_loss"])) === "b1")
check("Fieber → b1", redFlagGruppe(rfLead(["fever_sweats"])) === "b1")
check("Krebsanamnese → b1", redFlagGruppe(rfLead(["cancer_history"])) === "b1")
check("Lähmung → b1", redFlagGruppe(rfLead(["severe_progressive_weakness"])) === "b1")
check("nachts + Gewichtsverlust → b1 (Kombination!)", redFlagGruppe(rfLead(["night_pain_severe", "weight_loss"])) === "b1")
check("nachts + Sattel-Taubheit → b1", redFlagGruppe(rfLead(["night_pain_severe", "saddle_numbness"])) === "b1")
check("KEINE Codes → b1 (fail closed)", redFlagGruppe(rfLead(null)) === "b1")
check("leeres Array → b1 (fail closed)", redFlagGruppe(rfLead([])) === "b1")

console.log("\n── RF1 an echte Warnzeichen MUSS werfen (der gefährlichste Fehler) ──")
for (const codes of [
  ["saddle_numbness"],
  ["bladder_bowel"],
  ["severe_progressive_weakness"],
  ["weight_loss"],
  ["fever_sweats"],
  ["cancer_history"],
  ["night_pain_severe", "saddle_numbness"],
  null,
]) {
  check(`RF1 + ${JSON.stringify(codes)} → wirft`, throws(rfLead(codes), "RF1"))
}
check("RF1 + nur nächtlicher Schmerz → erlaubt", !throws(rfLead(["night_pain_severe"]), "RF1"))

console.log("\n── Umgekehrt: B1 an die zu Unrecht Gestoppten MUSS werfen ──")
check("B1 + nur nächtlicher Schmerz → wirft (dafür gibt es RF1)", throws(rfLead(["night_pain_severe"]), "B1"))
check("B2 + nur nächtlicher Schmerz → wirft", throws(rfLead(["night_pain_severe"]), "B2"))
check("B1 + echtes Warnzeichen → erlaubt", !throws(rfLead(["saddle_numbness"]), "B1"))

console.log("\n── Red-Flag-Leads bekommen NIEMALS ein Angebot ──")
for (const code of ["M1", "M2", "M3", "M4"]) {
  check(`RF1-Gruppe + ${code} → wirft`, throws(rfLead(["night_pain_severe"]), code))
  check(`B1-Gruppe + ${code} → wirft`, throws(rfLead(["saddle_numbness"]), code))
}

// ── Wartelisten-Mails an die 79 Geparkten ────────────────────────────────────
console.log("\n── Warteliste: richtige Mail für die richtige Region ──")
check("Nacken → N1", waitlistGruppe(lead({ main_region: "nacken_schulter" })) === "nacken_schulter")
check("Oberer Rücken → OB1", waitlistGruppe(lead({ main_region: "oberer_ruecken" })) === "oberer_ruecken")
check("Knie/Hüfte/Fuß → K1", waitlistGruppe(lead({ main_region: "knie_huefte_fuss" })) === "knie_huefte_fuss")
check("LWS → keine Warteliste (bekommt das Produkt)", waitlistGruppe(lead({ main_region: "unterer_ruecken" })) === null)
check("Region unbekannt → keine Warteliste (erst RT1)", waitlistGruppe(lead({ main_region: null })) === null)

check("N1 an Nacken-Lead → erlaubt", !throws(lead({ main_region: "nacken_schulter" }), "N1"))
check("N1 an Knie-Lead → wirft (falsche Region)", throws(lead({ main_region: "knie_huefte_fuss" }), "N1"))
check("OB1 an Nacken-Lead → wirft", throws(lead({ main_region: "nacken_schulter" }), "OB1"))
check("K1 an Knie-Lead → erlaubt", !throws(lead({ main_region: "knie_huefte_fuss" }), "K1"))
check("N1 an LWS-Lead → wirft (der bekommt das Produkt)", throws(lead({ main_region: "unterer_ruecken" }), "N1"))
check("Segment D + N1 → wirft (keine Einwilligung)", throws(lead({ consent_status: "pending", main_region: "nacken_schulter" }), "N1"))

console.log(`\n${pass} passed, ${fail} failed\n`)
process.exit(fail ? 1 : 0)
