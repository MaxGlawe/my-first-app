/**
 * Sicherheitstest der Red-Flag-Logik (Anpassung 07/2026).
 *
 * Prüft die echte Funktion aus scoring.ts — nicht eine Nachbildung. Der Kern:
 * Nächtlicher Schmerz und Sattel-Kribbeln stoppen NICHT mehr allein, aber jede
 * echte Warnzeichen-Kombination stoppt weiterhin. Ein Fehler hier wäre ein
 * übersehener Notfall, deshalb wird auch jede Kombination getestet.
 *
 * Aufruf: node scripts/test-redflags.mjs
 */
// TypeScript direkt laden (Node ≥22 via --experimental-strip-types)
const { detectHardRedFlag } = await import("../src/lib/schmerzcheck/scoring.ts")

let pass = 0
let fail = 0

function check(name, answers, expectStop) {
  const { hardFlag, codes } = detectHardRedFlag(answers)
  const ok = hardFlag === expectStop
  if (ok) {
    pass++
    console.log(`  PASS  ${name}${hardFlag ? `  → Stopp (${codes.join(",")})` : "  → kein Stopp"}`)
  } else {
    fail++
    console.log(`  FAIL  ${name} — erwartet ${expectStop ? "Stopp" : "kein Stopp"}, war ${hardFlag ? "Stopp" : "kein Stopp"}`)
  }
}

console.log("\n── Darf NICHT mehr stoppen (das war der Zweck der Änderung) ──")
check("Nur nächtliches Aufwachen", { rf_systemic: ["night_pain_severe"], rf_cauda_equina: ["none"], rf_neuro: "none" }, false)
check("Nur Sattel-Kribbeln", { rf_cauda_equina: ["saddle_tingling"], rf_systemic: ["none"], rf_neuro: "none" }, false)
check("Nachts + Kribbeln zusammen", { rf_systemic: ["night_pain_severe"], rf_cauda_equina: ["saddle_tingling"], rf_neuro: "none" }, false)
check("Gar nichts angegeben", { rf_systemic: ["none"], rf_cauda_equina: ["none"], rf_neuro: "none" }, false)

console.log("\n── MUSS weiterhin stoppen (die echten Notfälle) ──")
check("Sattel-TAUBHEIT (Cauda equina)", { rf_cauda_equina: ["saddle_numbness"], rf_systemic: ["none"], rf_neuro: "none" }, true)
check("Blasen-/Darmkontrollverlust", { rf_cauda_equina: ["bladder_bowel"], rf_systemic: ["none"], rf_neuro: "none" }, true)
check("Fortschreitende Lähmung", { rf_cauda_equina: ["severe_progressive_weakness"], rf_systemic: ["none"], rf_neuro: "none" }, true)
check("Gewichtsverlust", { rf_systemic: ["weight_loss"], rf_cauda_equina: ["none"], rf_neuro: "none" }, true)
check("Fieber/Nachtschweiß", { rf_systemic: ["fever_sweats"], rf_cauda_equina: ["none"], rf_neuro: "none" }, true)
check("Krebsanamnese", { rf_systemic: ["cancer_history"], rf_cauda_equina: ["none"], rf_neuro: "none" }, true)
check("Zunehmende Schwäche", { rf_systemic: ["none"], rf_cauda_equina: ["none"], rf_neuro: "progressive" }, true)

console.log("\n── KOMBINATIONEN: nachts + systemisches Zeichen = weiterhin Stopp ──")
check("Nachts + Gewichtsverlust", { rf_systemic: ["night_pain_severe", "weight_loss"], rf_cauda_equina: ["none"], rf_neuro: "none" }, true)
check("Nachts + Fieber", { rf_systemic: ["night_pain_severe", "fever_sweats"], rf_cauda_equina: ["none"], rf_neuro: "none" }, true)
check("Nachts + Krebsanamnese", { rf_systemic: ["night_pain_severe", "cancer_history"], rf_cauda_equina: ["none"], rf_neuro: "none" }, true)
check("Kribbeln + Sattel-Taubheit", { rf_cauda_equina: ["saddle_tingling", "saddle_numbness"], rf_systemic: ["none"], rf_neuro: "none" }, true)
check("Kribbeln + Blasenkontrollverlust", { rf_cauda_equina: ["saddle_tingling", "bladder_bowel"], rf_systemic: ["none"], rf_neuro: "none" }, true)
check("Nachts + Kribbeln + Lähmung", { rf_systemic: ["night_pain_severe"], rf_cauda_equina: ["saddle_tingling", "severe_progressive_weakness"], rf_neuro: "none" }, true)

console.log(`\n${pass} passed, ${fail} failed\n`)
process.exit(fail ? 1 : 0)
