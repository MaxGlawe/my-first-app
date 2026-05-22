#!/usr/bin/env node
/**
 * PROJ-23 / HWG compliance gate (spec §2.4).
 *
 * Scans the Schmerzcheck user-facing source for forbidden, outcome-promising
 * vocabulary and fails (exit 1) on any match. We sell orientation, not outcome.
 *
 * Run:  npm run hwg:check
 *
 * NOTE: keep these patterns in sync with src/lib/schmerzcheck/forbidden-vocab.ts.
 * Word boundaries ensure legitimate disclaimer terms ("Heilbehandlung",
 * "Heilmittelwerbegesetz", "Diagnose") are NOT flagged.
 */
import { readdirSync, readFileSync, statSync } from "node:fs"
import { join } from "node:path"

const SCAN_DIRS = [
  "src/app/schmerzcheck",
  "src/components/schmerzcheck",
  "src/lib/schmerzcheck",
]

const FORBIDDEN = [
  { label: "heilen/heilt/Heilung", regex: /\b(heilt|heilen|heilung)\b/gi },
  { label: "schmerzfrei/Schmerzfreiheit", regex: /\bschmerzfrei\w*\b/gi },
  { label: "garantiert/Garantie", regex: /\bgarantie\w*\b/gi },
  { label: "Outcome-Versprechen (in X Tagen …)", regex: /\bin\s+\d+\s+(tag|tage|tagen|woche|wochen)\b[^.]*\b(besser|weg|schmerzfrei)\b/gi },
  { label: "Erfolgs-Statistik (X Patienten erfolgreich …)", regex: /\b\d[\d.]*\s+patienten\b[^.]*\berfolgreich\b/gi },
]

/** The pattern-definition file legitimately contains the words → never scan it. */
const EXCLUDE = /forbidden-vocab\.ts$/

function collectFiles(dir) {
  let entries
  try {
    entries = readdirSync(dir)
  } catch {
    return [] // directory may not exist yet
  }
  const files = []
  for (const name of entries) {
    const full = join(dir, name)
    if (statSync(full).isDirectory()) {
      files.push(...collectFiles(full))
    } else if (/\.(ts|tsx)$/.test(full) && !EXCLUDE.test(full)) {
      files.push(full)
    }
  }
  return files
}

const findings = []
for (const dir of SCAN_DIRS) {
  for (const file of collectFiles(dir)) {
    const lines = readFileSync(file, "utf8").split("\n")
    lines.forEach((line, i) => {
      for (const { label, regex } of FORBIDDEN) {
        regex.lastIndex = 0
        const m = regex.exec(line)
        if (m) {
          findings.push({ file, line: i + 1, label, text: m[0], snippet: line.trim() })
        }
      }
    })
  }
}

if (findings.length > 0) {
  console.error("\n✖ HWG-Check fehlgeschlagen — verbotene Vokabeln gefunden:\n")
  for (const f of findings) {
    console.error(`  ${f.file}:${f.line}  [${f.label}] → "${f.text}"`)
    console.error(`      ${f.snippet}`)
  }
  console.error(`\n${findings.length} Treffer. Bitte HWG-konform umformulieren (Orientierung statt Outcome).\n`)
  process.exit(1)
}

console.log("✓ HWG-Check bestanden — keine verbotenen Vokabeln gefunden.")
