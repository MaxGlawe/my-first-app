/**
 * PROJ-26 — Gegenprobe der Fristrechnung aus lib/werktag.ts.
 *
 * Die Frist steht schriftlich im Behandlungsvertrag („Rückmeldung spätestens
 * am nächsten Werktag"). Ein Rechenfehler hier ist kein Schönheitsfehler,
 * sondern eine gebrochene Zusage — deshalb eine eigene Gegenprobe.
 *
 *   npx tsx --tsconfig tsconfig.json scripts/pruefe-werktag.ts
 */
import { naechsterWerktag, fristUeberschritten, formatFrist } from "../src/lib/werktag"

const WOCHENTAG = ["So", "Mo", "Di", "Mi", "Do", "Fr", "Sa"]

// 21.09.2026 ist ein Montag.
const faelle: Array<{ meldung: string; erwartetTag: string }> = [
  { meldung: "2026-09-21T09:00:00", erwartetTag: "Di" }, // Mo -> Di
  { meldung: "2026-09-22T23:30:00", erwartetTag: "Mi" }, // Di spaet -> Mi
  { meldung: "2026-09-24T14:00:00", erwartetTag: "Fr" }, // Do -> Fr
  { meldung: "2026-09-25T09:00:00", erwartetTag: "Mo" }, // Fr -> Montag
  { meldung: "2026-09-25T23:59:00", erwartetTag: "Mo" }, // Fr Nacht -> Montag
  { meldung: "2026-09-26T10:00:00", erwartetTag: "Mo" }, // Sa -> Montag
  { meldung: "2026-09-27T10:00:00", erwartetTag: "Mo" }, // So -> Montag
]

let fehler = 0
console.log("Meldung                    ->  Frist                          erwartet")
for (const f of faelle) {
  const frist = naechsterWerktag(new Date(f.meldung))
  const tag = WOCHENTAG[frist.getDay()]
  const ok = tag === f.erwartetTag
  if (!ok) fehler++
  const m = new Date(f.meldung)
  console.log(
    `${WOCHENTAG[m.getDay()]} ${m.toLocaleString("de-DE")}  ->  ${formatFrist(frist).padEnd(30)} ${f.erwartetTag} ${ok ? "ok" : "FALSCH (" + tag + ")"}`
  )
}

// Nie am Wochenende
for (let i = 0; i < 400; i++) {
  const d = new Date(2026, 0, 1 + i, 12, 0, 0)
  const tag = naechsterWerktag(d).getDay()
  if (tag === 0 || tag === 6) {
    console.log("FEHLER: Frist faellt auf ein Wochenende fuer", d.toDateString())
    fehler++
  }
}
console.log("\nFrist liegt an 400 aufeinanderfolgenden Tagen nie auf Sa/So: " + (fehler === 0 ? "ok" : "NEIN"))

// Ueberschreitung
const vergangen = new Date(Date.now() - 3600_000).toISOString()
const kuenftig = new Date(Date.now() + 3600_000).toISOString()
console.log("fristUeberschritten(vor 1 h):  " + fristUeberschritten(vergangen) + " (erwartet true)")
console.log("fristUeberschritten(in 1 h):   " + fristUeberschritten(kuenftig) + " (erwartet false)")
if (!fristUeberschritten(vergangen) || fristUeberschritten(kuenftig)) fehler++

console.log(fehler === 0 ? "\nAlle Faelle korrekt." : `\n${fehler} Abweichung(en).`)
process.exit(fehler === 0 ? 0 : 1)
