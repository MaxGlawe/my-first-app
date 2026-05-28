// scripts/build-workbook-pdf.mjs
//
// Baut aus der Workbook-Markdown ein A5-Premium-Druck-PDF.
// Quelle (Single Source of Truth): die MASTER-Markdown.
// Pipeline:  Markdown -> A5-HTML (eingebettetes Print-CSS) -> Puppeteer (headless Chrome) -> PDF
// Aufruf:    node scripts/build-workbook-pdf.mjs
//
// Erzeugt:   public/downloads/workbook-chronischer-kreuzschmerz.pdf
//
// Sonderkonstrukte der MD (siehe README im MD-Kopf):
//   # Lektion / # MODUL / # COVER / # INNENTITEL / # IMPRESSUM / # VORWORT / # INHALTSVERZEICHNIS / # ANHANG
//   ## ABSCHNITT       interne Struktur
//   ### ÜK-..          Übungsblock (mit Foto-Einbettung)
//   > **💎 VERTIEFUNG  Wissenschafts-Box
//   > **📖 AUS DER PRAXIS  Praxis-Vignette
//   ## ✏️ ÜBUNG ..      Workbook-Übung
//   <!-- ABBILDUNG: -->  Anatomie-Diagramm / Cover-Mockup (SVG)
//   <!-- NOTIZFELD: X Linien -->  X Schreiblinien
//   <!-- SEITENUMBRUCH -->        harter Seitenumbruch
//   Tabellen, Code-Blöcke, Listen, Blockquotes

import fs from "node:fs";
import path from "node:path";
import { fileURLToPath, pathToFileURL } from "node:url";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const ROOT = path.resolve(__dirname, "..");

const MD_PATH =
  process.env.WORKBOOK_MD ||
  "C:/Users/Asus/Downloads/workbook-chronischer-kreuzschmerz-MASTER.md";
const IMG_DIR = path.join(
  ROOT,
  "public/images/masterclass/chronischer-kreuzschmerz/workbook"
);
const OUT_PDF = path.join(ROOT, "public/downloads/workbook-chronischer-kreuzschmerz.pdf");
// Debug-HTML in scripts/ (nicht im öffentlichen Asset-Verzeichnis)
const OUT_HTML = path.join(__dirname, "workbook-debug.html");

// ── Farbpalette (aus README) ──────────────────────────────────────────────
const C = {
  paper: "#F8F5F0",
  ink: "#2C3E2D",
  body: "#2b2b28",
  muted: "#7c776c",
  line: "#e2dccf",
  sand: "#C9B79C",
  mod1: "#2C3E2D",
  mod2: "#A45A3A",
  mod3: "#3D5A6C",
  mod4: "#5A3D4C",
};

// Modul-Akzentfarbe je Kontext
let currentAccent = C.ink;

// ── Bild-Inventar (combo bevorzugt) ───────────────────────────────────────
const imageFiles = fs.existsSync(IMG_DIR) ? fs.readdirSync(IMG_DIR) : [];
const comboByUk = new Map(); // "m1" -> filename
for (const f of imageFiles) {
  const m = f.match(/^uk-([msba]\d+)-combo\.png$/i);
  if (m) comboByUk.set(m[1].toLowerCase(), f);
}
// Fallback: erstes Einzelbild, falls kein combo existiert
const singleByUk = new Map();
for (const f of imageFiles) {
  const m = f.match(/^uk-([msba]\d+)-\d+\.png$/i);
  if (m) {
    const id = m[1].toLowerCase();
    if (!singleByUk.has(id)) singleByUk.set(id, f);
  }
}
function imgForUk(id) {
  const key = id.toLowerCase();
  return comboByUk.get(key) || singleByUk.get(key) || null;
}
function imgUrl(filename) {
  return pathToFileURL(path.join(IMG_DIR, filename)).href;
}

let stats = { photos: 0, diagrams: 0 };

// ── HTML-Escape ────────────────────────────────────────────────────────────
function esc(s) {
  return String(s)
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;");
}

// ── Inline-Markdown (bold/italic/code/links) ───────────────────────────────
function inline(text) {
  let s = esc(text);
  // inline code
  s = s.replace(/`([^`]+)`/g, '<code>$1</code>');
  // bold
  s = s.replace(/\*\*([^*]+)\*\*/g, "<strong>$1</strong>");
  // italic (single * not adjacent to another *)
  s = s.replace(/(^|[^*])\*([^*\n]+)\*(?!\*)/g, "$1<em>$2</em>");
  // Markdown-Links [text](url)
  s = s.replace(/\[([^\]]+)\]\(([^)]+)\)/g, '<a href="$2">$1</a>');
  // Querverweis-Pfeile dezent setzen
  s = s.replace(/(→\s*)/g, '<span class="xref-arrow">$1</span>');
  // Checkbox-Glyphe in Fließtext
  s = s.replace(/☐/g, '<span class="cb">☐</span>');
  s = s.replace(/☑|✅/g, '<span class="cb cb-on">✓</span>');
  // Warn-Emoji im Fließtext (z.B. Handlungspfad) als Icon
  s = s.split("⚠️").join(`<span class="inline-icon warn-inline">${icon("warn", C.mod2)}</span>`);
  return s;
}

// ── Icon-SVGs (dezent, einfarbig, im Akzentfarbton) ────────────────────────
function icon(name, color) {
  const c = color || currentAccent;
  const base = `width="1em" height="1em" viewBox="0 0 24 24" fill="none" stroke="${c}" stroke-width="1.6" stroke-linecap="round" stroke-linejoin="round" class="wb-icon"`;
  switch (name) {
    case "target": // ⭕ Lernziele
      return `<svg ${base}><circle cx="12" cy="12" r="8.5"/><circle cx="12" cy="12" r="4"/><circle cx="12" cy="12" r="0.6" fill="${c}"/></svg>`;
    case "gem": // 💎 Vertiefung
      return `<svg ${base}><path d="M6 3h12l3 5-9 13L3 8z"/><path d="M3 8h18"/><path d="M9 3 6 8l6 13 6-13-3-5"/></svg>`;
    case "book": // 📖 Praxis
      return `<svg ${base}><path d="M12 5.5C10 4 6.5 4 4 5v13c2.5-1 6-1 8 .5 2-1.5 5.5-1.5 8-.5V5c-2.5-1-6-1-8 .5z"/><path d="M12 5.5v14"/></svg>`;
    case "pencil": // ✏️ Übung
      return `<svg ${base}><path d="M15 4.5 19.5 9 8 20.5 3.5 21l.5-4.5z"/><path d="M13.5 6 18 10.5"/></svg>`;
    case "loop": // 🔁 Reflexion / Zusammenfassung
      return `<svg ${base}><path d="M4 12a8 8 0 0 1 13.5-5.8L20 8"/><path d="M20 4v4h-4"/><path d="M20 12a8 8 0 0 1-13.5 5.8L4 16"/><path d="M4 20v-4h4"/></svg>`;
    case "chart": // 📊 Tabelle / Daten
      return `<svg ${base}><path d="M4 20V4"/><path d="M4 20h16"/><rect x="7" y="11" width="3" height="6"/><rect x="12" y="7" width="3" height="10"/><rect x="17" y="13" width="3" height="4"/></svg>`;
    case "link": // 🔗 Querverweis
      return `<svg ${base}><path d="M10 13a4 4 0 0 0 5.7.4l2.5-2.5a4 4 0 0 0-5.6-5.7l-1.4 1.4"/><path d="M14 11a4 4 0 0 0-5.7-.4L5.8 13a4 4 0 0 0 5.6 5.7l1.4-1.4"/></svg>`;
    case "warn": // ⚠️ Achtung
      return `<svg ${base}><path d="M12 3 22 20H2L12 3z"/><path d="M12 10v5"/><circle cx="12" cy="17.6" r="0.6" fill="${c}"/></svg>`;
    case "compass": // 🧭 Modul-Trenner
      return `<svg ${base}><circle cx="12" cy="12" r="9"/><path d="M15.5 8.5 13 13l-4.5 2.5L11 11z"/></svg>`;
    case "note": // 📝 Notizfeld
      return `<svg ${base}><path d="M5 4h11l3 3v13H5z"/><path d="M16 4v3h3"/><path d="M8 12h8M8 16h6"/></svg>`;
    case "check": // ✅
      return `<svg ${base}><circle cx="12" cy="12" r="9"/><path d="M8 12.5 11 15.5 16 9"/></svg>`;
    default:
      return "";
  }
}

// Map Emoji -> Icon-Name
const EMOJI_ICON = {
  "⭕": "target",
  "💎": "gem",
  "📖": "book",
  "✏️": "pencil",
  "🔁": "loop",
  "📊": "chart",
  "🔗": "link",
  "⚠️": "warn",
  "🧭": "compass",
  "📝": "note",
  "✅": "check",
  "★": "star",
};

// Ersetzt führende/eingebettete Emojis in Überschriften durch Icons
function headingWithIcon(text) {
  let prefixIcon = "";
  let t = text.trim();
  // führendes Emoji?
  for (const [emo, ic] of Object.entries(EMOJI_ICON)) {
    if (t.startsWith(emo)) {
      if (ic === "star") {
        prefixIcon = `<span class="hd-star">★</span>`;
      } else {
        prefixIcon = `<span class="hd-icon">${icon(ic)}</span>`;
      }
      t = t.slice(emo.length).trim();
      break;
    }
  }
  // WICHTIG: erst inline() (escaped Text), DANN Emojis durch Icon-SVG ersetzen,
  // sonst escaped esc() die spitzen Klammern der eingefügten SVGs.
  return prefixIcon + `<span class="hd-text">${replaceInlineEmojis(inline(t))}</span>`;
}

function replaceInlineEmojis(s) {
  let out = s;
  for (const [emo, ic] of Object.entries(EMOJI_ICON)) {
    if (ic === "star") {
      out = out.split(emo).join('<span class="inline-star">★</span>');
    } else {
      out = out
        .split(emo)
        .join(`<span class="inline-icon">${icon(ic)}</span>`);
    }
  }
  return out;
}

// ── Anatomie-/Abbildungs-SVGs ──────────────────────────────────────────────
// Wir matchen anhand von Stichworten im ABBILDUNG-Briefing.
function abbildungSVG(brief) {
  const b = brief.toLowerCase();
  if (b.includes("cover")) return null; // Cover separat gerendert
  if (b.includes("aufriss") || (b.includes("wirbelsäule") && b.includes("abschnitt"))) {
    stats.diagrams++;
    return figure(spineSVG(), "Aufriss der Wirbelsäule – fünf Abschnitte, LWS hervorgehoben (seitliche Ansicht)");
  }
  if (b.includes("querschnitt") && b.includes("bandscheibe")) {
    stats.diagrams++;
    return figure(discSVG(), "Querschnitt durch eine Bandscheibe – Nucleus pulposus (Kern) und Anulus fibrosus (Faserring)");
  }
  if (b.includes("rückenansicht") || (b.includes("becken") && b.includes("markiere"))) {
    stats.diagrams++;
    return figure(backSVG(), "Schematische Rückenansicht – Markiere mit Bleistift, wo dein Schmerz sitzt (L1–L5, ISG-Bereich)");
  }
  // Generisches Briefing -> dezenter Platzhalter mit Briefing-Text
  stats.diagrams++;
  return figure(genericSVG(), esc(brief));
}

function figure(svg, caption) {
  return `<figure class="diagram"><div class="diagram-art">${svg}</div><figcaption>${caption}</figcaption></figure>`;
}

const STROKE = C.ink;
function spineSVG() {
  // Seitliche Wirbelsäulen-Silhouette, LWS hervorgehoben
  return `<svg viewBox="0 0 200 360" role="img" aria-label="Wirbelsäulen-Aufriss">
    <g fill="none" stroke="${STROKE}" stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round">
      <!-- Schädelbasis -->
      <path d="M70 22 q40 -10 56 8" stroke-width="1.6"/>
      <!-- HWS (konkav) -->
      <path d="M96 30 q-22 18 -8 46"/>
      <!-- BWS (konvex) -->
      <path d="M88 76 q26 44 6 96"/>
      <!-- LWS (lordotisch) hervorgehoben -->
      <path d="M94 172 q-30 40 0 82" stroke="${C.mod1}" stroke-width="4"/>
      <!-- Sakrum -->
      <path d="M94 254 q14 22 -2 44"/>
    </g>
    <!-- Wirbel-Marker -->
    <g fill="${STROKE}">
      ${Array.from({ length: 7 }, (_, i) => `<circle cx="${94 - i * 1.5}" cy="${36 + i * 6}" r="1.6"/>`).join("")}
    </g>
    <!-- LWS-Wirbel L1-L5 als Blöcke -->
    <g fill="none" stroke="${C.mod1}" stroke-width="1.6">
      ${Array.from({ length: 5 }, (_, i) => {
        const y = 178 + i * 15;
        return `<rect x="78" y="${y}" width="26" height="11" rx="2"/>`;
      }).join("")}
    </g>
    <!-- Beschriftung -->
    <g font-family="Inter, sans-serif" font-size="11" fill="${C.muted}">
      <text x="120" y="52">HWS</text>
      <text x="118" y="120">BWS</text>
      <text x="120" y="222" fill="${C.mod1}" font-weight="600">LWS</text>
      <text x="116" y="288">Sakrum</text>
    </g>
    <g font-family="Inter, sans-serif" font-size="9" fill="${C.mod1}" text-anchor="end">
      ${Array.from({ length: 5 }, (_, i) => `<text x="74" y="${187 + i * 15}">L${i + 1}</text>`).join("")}
    </g>
  </svg>`;
}

function discSVG() {
  // Bandscheiben-Querschnitt: Nucleus zentral, Anulus konzentrisch
  const rings = Array.from({ length: 5 }, (_, i) => {
    const r = 30 + i * 11;
    return `<ellipse cx="100" cy="100" rx="${r + 18}" ry="${r}" fill="none" stroke="${C.ink}" stroke-width="${i === 4 ? 2.4 : 1.3}"/>`;
  }).join("");
  return `<svg viewBox="0 0 200 200" role="img" aria-label="Bandscheiben-Querschnitt">
    ${rings}
    <ellipse cx="100" cy="100" rx="40" ry="26" fill="${C.ink}" opacity="0.12"/>
    <ellipse cx="100" cy="100" rx="40" ry="26" fill="none" stroke="${C.ink}" stroke-width="1.6" stroke-dasharray="3 3"/>
    <g font-family="Inter, sans-serif" font-size="11" fill="${C.muted}">
      <text x="100" y="104" text-anchor="middle" fill="${C.ink}" font-weight="600">Nucleus</text>
      <text x="100" y="118" text-anchor="middle" font-size="9">pulposus</text>
      <text x="100" y="186" text-anchor="middle">Anulus fibrosus (Faserring)</text>
    </g>
  </svg>`;
}

function backSVG() {
  // Rückenansicht von hinten, LWS + Becken, Wirbelhöhen L1-L5, ISG
  return `<svg viewBox="0 0 220 320" role="img" aria-label="Rückenansicht zum Markieren">
    <g fill="none" stroke="${C.ink}" stroke-width="2.2" stroke-linejoin="round" stroke-linecap="round">
      <!-- Torso-Umriss (Rücken) -->
      <path d="M70 20 q-14 4 -16 26 q-2 20 -10 30 q-6 10 -2 16 q4 4 8 -2 q2 14 6 40 q3 26 4 60 q-2 30 6 56 q6 16 14 24"/>
      <path d="M150 20 q14 4 16 26 q2 20 10 30 q6 10 2 16 q-4 4 -8 -2 q-2 14 -6 40 q-3 26 -4 60 q2 30 -6 56 q-6 16 -14 24"/>
      <path d="M70 20 q40 -10 80 0"/>
      <!-- Wirbelsäulen-Mittellinie -->
      <path d="M110 40 V250" stroke-width="1.4"/>
    </g>
    <!-- LWS-Höhen L1-L5 -->
    <g stroke="${C.mod1}" stroke-width="1.4">
      ${Array.from({ length: 5 }, (_, i) => {
        const y = 150 + i * 16;
        return `<line x1="96" y1="${y}" x2="124" y2="${y}"/>`;
      }).join("")}
    </g>
    <g font-family="Inter, sans-serif" font-size="9" fill="${C.mod1}" text-anchor="start">
      ${Array.from({ length: 5 }, (_, i) => `<text x="128" y="${153 + i * 16}">L${i + 1}</text>`).join("")}
    </g>
    <!-- ISG links/rechts -->
    <g fill="none" stroke="${C.mod2}" stroke-width="1.6" stroke-dasharray="2 2">
      <circle cx="92" cy="250" r="9"/>
      <circle cx="128" cy="250" r="9"/>
    </g>
    <g font-family="Inter, sans-serif" font-size="9" fill="${C.mod2}">
      <text x="60" y="276" text-anchor="middle">ISG</text>
      <text x="160" y="276" text-anchor="middle">ISG</text>
    </g>
  </svg>`;
}

function genericSVG() {
  return `<svg viewBox="0 0 200 120" role="img" aria-label="Abbildung">
    <rect x="6" y="6" width="188" height="108" rx="6" fill="none" stroke="${C.line}" stroke-width="2" stroke-dasharray="5 4"/>
    <g stroke="${C.muted}" stroke-width="1.4" fill="none">
      <circle cx="60" cy="60" r="16"/><path d="M90 70 l24 -22 18 26 14 -16"/>
    </g>
  </svg>`;
}

// ── Markdown-Parser ─────────────────────────────────────────────────────────
function parse(md) {
  // Normalisieren
  const text = md.replace(/\r\n/g, "\n");
  const lines = text.split("\n");

  // 1) Frontmatter + README/Konventions-Block bis zum ersten "# COVER" entfernen
  let start = 0;
  for (let i = 0; i < lines.length; i++) {
    if (/^# COVER/.test(lines[i])) {
      start = i;
      break;
    }
  }

  const blocks = []; // { type, ... }
  let i = start;

  function pushPara(buf) {
    if (buf.length) {
      const joined = buf.join(" ").trim();
      if (joined) blocks.push({ type: "p", text: joined });
    }
  }

  let paraBuf = [];

  while (i < lines.length) {
    let line = lines[i];

    // Kommentar-Marker
    let m;
    if ((m = line.match(/^<!--\s*SEITENUMBRUCH\s*-->/))) {
      pushPara(paraBuf); paraBuf = [];
      blocks.push({ type: "pagebreak" });
      i++; continue;
    }
    if ((m = line.match(/^<!--\s*NOTIZFELD:\s*(\d+)\s*Linien\s*-->/i))) {
      pushPara(paraBuf); paraBuf = [];
      blocks.push({ type: "notizfeld", lines: parseInt(m[1], 10) });
      i++;
      // direkt folgende rohe "___"-Platzhalterzeilen überspringen
      while (i < lines.length && /^[_\s]*$/.test(lines[i]) && /_/.test(lines[i] + "")) {
        i++;
      }
      // auch leere Folgezeilen, die zwischen den ___ standen, sind ok
      continue;
    }
    if ((m = line.match(/^<!--\s*ABBILDUNG:\s*([\s\S]*?)\s*-->/))) {
      pushPara(paraBuf); paraBuf = [];
      blocks.push({ type: "abbildung", brief: m[1] });
      i++; continue;
    }
    if (/^<!--/.test(line)) { i++; continue; } // sonstige Kommentare ignorieren

    // Rohe "___"-Schreiblinien (außerhalb von NOTIZFELD) ignorieren
    if (/^_{6,}\s*$/.test(line)) { i++; continue; }

    // Headings
    if ((m = line.match(/^(#{1,4})\s+(.*)$/))) {
      pushPara(paraBuf); paraBuf = [];
      blocks.push({ type: "heading", level: m[1].length, text: m[2].trim() });
      i++; continue;
    }

    // horizontale Linie
    if (/^---+\s*$/.test(line)) {
      pushPara(paraBuf); paraBuf = [];
      blocks.push({ type: "hr" });
      i++; continue;
    }

    // Code-Block
    if (/^```/.test(line)) {
      pushPara(paraBuf); paraBuf = [];
      const code = [];
      i++;
      while (i < lines.length && !/^```/.test(lines[i])) {
        code.push(lines[i]); i++;
      }
      i++; // schließendes ```
      blocks.push({ type: "code", text: code.join("\n") });
      continue;
    }

    // Blockquote (Boxen)
    if (/^>\s?/.test(line)) {
      pushPara(paraBuf); paraBuf = [];
      const quote = [];
      while (i < lines.length && /^>\s?/.test(lines[i])) {
        quote.push(lines[i].replace(/^>\s?/, ""));
        i++;
      }
      blocks.push({ type: "quote", lines: quote });
      continue;
    }

    // Tabelle: Header-Zeile (| ... |) gefolgt von Separator-Zeile (|---|---|)
    if (
      /^\s*\|.*\|\s*$/.test(line) &&
      i + 1 < lines.length &&
      /^\s*\|?[\s:|-]*-[\s:|-]*\|?\s*$/.test(lines[i + 1]) &&
      /-/.test(lines[i + 1])
    ) {
      pushPara(paraBuf); paraBuf = [];
      const tbl = [];
      while (i < lines.length && /^\s*\|.*\|\s*$/.test(lines[i])) {
        tbl.push(lines[i]); i++;
      }
      blocks.push({ type: "table", rows: tbl });
      continue;
    }

    // Liste (ungeordnet / geordnet)
    if (/^\s*([-*]|\d+\.)\s+/.test(line)) {
      pushPara(paraBuf); paraBuf = [];
      const items = [];
      const ordered = /^\s*\d+\.\s+/.test(line);
      while (i < lines.length && /^\s*([-*]|\d+\.)\s+/.test(lines[i])) {
        items.push(lines[i].replace(/^\s*([-*]|\d+\.)\s+/, ""));
        i++;
      }
      blocks.push({ type: "list", ordered, items });
      continue;
    }

    // Leerzeile -> Absatzgrenze
    if (/^\s*$/.test(line)) {
      pushPara(paraBuf); paraBuf = [];
      i++; continue;
    }

    // sonst: Absatztext
    paraBuf.push(line.trim());
    i++;
  }
  pushPara(paraBuf);

  return blocks;
}

// ── Tabellen-Renderer ───────────────────────────────────────────────────────
function renderTable(rows) {
  const clean = rows.map((r) =>
    r.trim().replace(/^\|/, "").replace(/\|$/, "").split("|").map((c) => c.trim())
  );
  if (clean.length < 1) return "";
  // Separator-Zeile (2. Zeile) entfernen
  const header = clean[0];
  let bodyStart = 1;
  if (clean[1] && clean[1].every((c) => /^:?-{1,}:?$/.test(c.replace(/\s/g, "")) || c === "")) {
    bodyStart = 2;
  }
  const body = clean.slice(bodyStart);
  const th = header.map((c) => `<th>${inline(c)}</th>`).join("");
  const trs = body
    .map(
      (r) =>
        `<tr>${r.map((c) => `<td>${inline(c)}</td>`).join("")}</tr>`
    )
    .join("");
  return `<table class="wb-table"><thead><tr>${th}</tr></thead><tbody>${trs}</tbody></table>`;
}

// ── Box-Renderer (Vertiefung / Praxis) ──────────────────────────────────────
function renderQuote(qlines) {
  // erste nicht-leere Zeile prüfen
  const joined = qlines.join("\n");
  const first = qlines.find((l) => l.trim().length) || "";
  let kind = null;
  let title = "";
  let titleMatch;

  if ((titleMatch = first.match(/^\*\*\s*💎\s*VERTIEFUNG\s*[—–-]?\s*(.*?)\*\*\s*$/))) {
    kind = "vertiefung";
    title = titleMatch[1].trim();
  } else if ((titleMatch = first.match(/^\*\*\s*📖\s*AUS DER PRAXIS\s*[—–-]?\s*(.*?)\*\*\s*$/))) {
    kind = "praxis";
    title = titleMatch[1].trim();
  }

  // Inhalt = restliche Zeilen (ohne Titelzeile)
  const rest = [];
  let skippedTitle = false;
  for (const l of qlines) {
    if (!skippedTitle && l.trim() === first.trim()) {
      skippedTitle = true;
      continue;
    }
    rest.push(l);
  }
  const bodyHtml = renderBlocks(parse("# COVER\n" + rest.join("\n")).slice(1)); // reuse parser; strip dummy

  if (kind === "vertiefung") {
    return `<aside class="box box-vertiefung">
      <div class="box-head"><span class="box-icon">${icon("gem", C.mod3)}</span><span class="box-label">Vertiefung</span></div>
      ${title ? `<h4 class="box-title">${inline(title)}</h4>` : ""}
      <div class="box-body">${bodyHtml}</div>
    </aside>`;
  }
  if (kind === "praxis") {
    return `<aside class="box box-praxis">
      <div class="box-head"><span class="box-icon">${icon("book", C.mod2)}</span><span class="box-label">Aus der Praxis</span></div>
      ${title ? `<h4 class="box-title">${inline(title)}</h4>` : ""}
      <div class="box-body">${bodyHtml}</div>
    </aside>`;
  }
  // generisches Blockquote
  return `<blockquote class="wb-quote">${renderBlocks(parse("# COVER\n" + qlines.join("\n")).slice(1))}</blockquote>`;
}

// ── Notizfeld (Schreiblinien) ────────────────────────────────────────────────
function renderNotizfeld(n) {
  const rows = Array.from({ length: n }, () => `<div class="write-line"></div>`).join("");
  return `<div class="notizfeld">${rows}</div>`;
}

// ── Code/ASCII-Block ─────────────────────────────────────────────────────────
function renderCode(t) {
  return `<pre class="wb-pre">${esc(t)}</pre>`;
}

// ── Heading-Renderer mit Sonderfällen ────────────────────────────────────────
function renderHeading(level, text) {
  // ÜK-Übungsblock (### ÜK-M1 — Name)
  const ukm = text.match(/^ÜK-([MSBA]\d+)\s*[—–-]\s*(.*)$/i);
  if (level === 3 && ukm) {
    const id = ukm[1].toLowerCase();
    const name = ukm[2].trim();
    const file = imgForUk(id);
    let photo = "";
    if (file) {
      stats.photos++;
      photo = `<div class="uk-photo"><img src="${imgUrl(file)}" alt="${esc(name)}"/></div>`;
    }
    return `<div class="uk-block">
      <div class="uk-head"><span class="uk-id">ÜK-${ukm[1].toUpperCase()}</span><span class="uk-name">${inline(name)}</span></div>
      ${photo}
    </div>`;
  }

  // Übung-Überschrift (## ✏️ ÜBUNG ..) als Hervorhebung
  if (level === 2 && /✏️\s*ÜBUNG|✏️\s*REFLEXIONSSEITE/.test(text)) {
    return `<h2 class="exercise-title">${headingWithIcon(text)}</h2>`;
  }

  const cls = `h${level}`;
  return `<h${level} class="${cls}">${headingWithIcon(text)}</h${level}>`;
}

// ── Block-Renderer ───────────────────────────────────────────────────────────
function renderBlocks(blocks) {
  let out = [];
  for (const b of blocks) {
    switch (b.type) {
      case "heading":
        out.push(renderHeading(b.level, b.text));
        break;
      case "p":
        out.push(`<p>${inline(b.text)}</p>`);
        break;
      case "list": {
        const tag = b.ordered ? "ol" : "ul";
        const items = b.items.map((it) => `<li>${inline(it)}</li>`).join("");
        out.push(`<${tag} class="wb-list">${items}</${tag}>`);
        break;
      }
      case "table":
        out.push(renderTable(b.rows));
        break;
      case "quote":
        out.push(renderQuote(b.lines));
        break;
      case "code":
        out.push(renderCode(b.text));
        break;
      case "notizfeld":
        out.push(renderNotizfeld(b.lines));
        break;
      case "abbildung": {
        const svg = abbildungSVG(b.brief);
        if (svg) out.push(svg);
        break;
      }
      case "hr":
        out.push(`<hr class="wb-hr"/>`);
        break;
      case "pagebreak":
        out.push(`<div class="pagebreak"></div>`);
        break;
    }
  }
  return out.join("\n");
}

// ── Seiten-Sektionierung ─────────────────────────────────────────────────────
// Wir gruppieren Top-Level-# Headings zu Sektionen mit Modul-Kontext + Kopfzeile.
function buildDocument(blocks) {
  // Spezial-Sektionen separat behandeln: COVER, INNENTITEL, IMPRESSUM, VORWORT, INHALTSVERZEICHNIS
  const sections = [];
  let cur = null;

  function startSection(meta) {
    cur = { ...meta, blocks: [] };
    sections.push(cur);
  }
  startSection({ kind: "preface", headerTitle: "" });

  for (const b of blocks) {
    if (b.type === "heading" && b.level === 1) {
      const t = b.text.replace(/^[★\s]*/, "").trim();
      // Modul-Kontext setzen
      let kind = "lesson";
      let module = null;
      let headerTitle = t;
      if (/^COVER/i.test(t)) kind = "cover";
      else if (/^INNENTITEL/i.test(t)) kind = "innentitel";
      else if (/^IMPRESSUM/i.test(t)) kind = "impressum";
      else if (/^VORWORT/i.test(t)) kind = "vorwort";
      else if (/^INHALTSVERZEICHNIS/i.test(t)) kind = "toc";
      else if (/MODUL\s*1/i.test(t)) { kind = "modul"; module = 1; }
      else if (/MODUL\s*2/i.test(t)) { kind = "modul"; module = 2; }
      else if (/MODUL\s*3/i.test(t)) { kind = "modul"; module = 3; }
      else if (/MODUL\s*4/i.test(t)) { kind = "modul"; module = 4; }
      else if (/^🧭?\s*INTRO/i.test(b.text)) { kind = "modul"; module = 0; }
      else if (/^🧭?\s*OUTRO/i.test(b.text)) { kind = "modul"; module = 5; }
      else if (/^ANHANG/i.test(t)) kind = "anhang";

      startSection({ kind, module, headerTitle, headingBlock: b });
      continue;
    }
    cur.blocks.push(b);
  }
  return sections;
}

const MODULE_COLOR = {
  0: C.sand,
  1: C.mod1,
  2: C.mod2,
  3: C.mod3,
  4: C.mod4,
  5: C.sand,
};
const MODULE_LABEL = {
  0: "Intro",
  1: "Modul 1",
  2: "Modul 2",
  3: "Modul 3",
  4: "Modul 4",
  5: "Outro",
};

// Welche Modulfarbe gilt für eine Lektion? Wir tracken den letzten Modul-Trenner.
// Flowing-Modell: Spezialseiten (Cover/Titel/Trenner) sind .fullpage-Blöcke mit
// erzwungenem Seitenumbruch; Prosa-Sektionen fließen über mehrere Seiten.
function renderSections(sections) {
  let activeColor = C.sand;
  let activeLabel = "Intro";
  const html = [];

  for (const s of sections) {
    if (s.kind === "preface") continue;
    if (s.kind === "cover") { currentAccent = C.sand; html.push(renderCover(s)); continue; }
    if (s.kind === "innentitel") { currentAccent = C.sand; html.push(renderInnentitel(s)); continue; }
    if (s.kind === "impressum") { html.push(renderImpressum(s)); continue; }
    if (s.kind === "vorwort") { html.push(renderVorwort(s)); continue; }
    if (s.kind === "toc") { html.push(renderToc(s)); continue; }

    if (s.kind === "modul") {
      activeColor = MODULE_COLOR[s.module];
      activeLabel = MODULE_LABEL[s.module];
      currentAccent = activeColor;
      html.push(renderModuleDivider(s, activeColor, activeLabel));
      continue;
    }

    // Lektion oder Anhang
    currentAccent = activeColor;
    const isAnhang = s.kind === "anhang";
    const runHeader = isAnhang ? "Anhang" : activeLabel;
    html.push(renderLesson(s, activeColor, runHeader, isAnhang));
  }
  return html.join("\n");
}

// ── Spezial-Seiten (full-bleed, erzwungener Umbruch) ─────────────────────────
function renderCover() {
  // Premium-Cover gemäß "# COVER"-Konzept
  return `<section class="fullpage cover no-runhead">
    <div class="cover-inner">
      <div class="cover-logo">PHYSIOTHERAPIE&nbsp;GLAWE</div>
      <div class="cover-spine">${coverSpineSVG()}</div>
      <p class="cover-kicker">Masterclass</p>
      <h1 class="cover-title">Chronischer<br/>Kreuzschmerz</h1>
      <p class="cover-sub">Das Workbook zur Masterclass</p>
      <div class="cover-rule"></div>
      <p class="cover-subline">Verstehen · Handeln · Bleiben · Wiederkommen</p>
      <div class="cover-foot">Physiotherapie Glawe · Wildau</div>
    </div>
  </section>
  <section class="fullpage cover-back no-runhead">
    <div class="cover-back-inner">
      <div class="cb-statements">
        <p>„Verstehen verändert.&ldquo;</p>
        <p>„Bewegung ist Information.&ldquo;</p>
        <p>„Das System trägt sich selbst.&ldquo;</p>
      </div>
      <p class="cb-text">Dieses Workbook ist die schriftliche Detailebene unter der Masterclass <em>Chronischer Kreuzschmerz</em>. Es vertieft, was das Audio erklärt: präzise Anatomie, vollständige Übungs-Protokolle, Studienlage und 22 Workbook-Übungen zum Ausfüllen. Es ist kein Heilversprechen, sondern ein Werkzeugkasten für mehr Schmerzkompetenz. Schreib hinein – es ist zum Arbeiten gemacht.</p>
      <div class="cb-foot">
        <p>Physiotherapie Glawe · Wildau · PraxisOS · 1. Auflage 2026</p>
        <p class="cb-disclaimer">Dieses Workbook ersetzt weder eine individuelle ärztliche Diagnose noch eine individuelle physiotherapeutische Behandlung. Es ist für Menschen mit chronischen, ärztlich vorabgeklärten Kreuzschmerzen konzipiert. Selbstanwendung erfolgt eigenverantwortlich.</p>
      </div>
    </div>
  </section>`;
}

function coverSpineSVG() {
  return `<svg viewBox="0 0 120 320" role="img" aria-label="LWS-Silhouette">
    <g fill="none" stroke="${C.ink}" stroke-opacity="0.30" stroke-width="2.4" stroke-linecap="round" stroke-linejoin="round">
      <path d="M62 10 q-20 22 -6 56"/>
      <path d="M56 66 q26 50 4 110"/>
      <path d="M60 176 q-30 44 0 92"/>
      <path d="M60 268 q14 24 -4 46"/>
    </g>
  </svg>`;
}

function renderInnentitel() {
  return `<section class="fullpage titlepage no-runhead">
    <div class="tp-inner">
      <p class="tp-kicker">Masterclass</p>
      <h1 class="tp-title">Chronischer Kreuzschmerz</h1>
      <h2 class="tp-sub">Das Workbook</h2>
      <p class="tp-line">Verstehen · Handeln · Bleiben · Wiederkommen</p>
      <p class="tp-desc">Ein Begleitwerk zur gleichnamigen Online-Masterclass.</p>
      <div class="tp-foot">
        <p>Physiotherapie Glawe · Wildau</p>
        <p>PraxisOS · 2026</p>
      </div>
    </div>
  </section>`;
}

function renderImpressum(s) {
  currentAccent = C.sand;
  const body = renderBlocks(s.blocks);
  return `<section class="flow" style="--accent:${C.sand}">
    <div class="run-title">Impressum</div>
    <h1 class="page-h1">Impressum</h1>
    <div class="prose small">${body}</div>
  </section>`;
}

function renderVorwort(s) {
  currentAccent = C.sand;
  const body = renderBlocks(s.blocks);
  return `<section class="flow" style="--accent:${C.sand}">
    <div class="run-title">Vorwort</div>
    <h1 class="page-h1">So nutzt du dieses Workbook</h1>
    <div class="prose">${body}</div>
  </section>`;
}

function renderToc(s) {
  currentAccent = C.ink;
  // TOC: Modul-Überschriften + Einträge. Die MD-Platzhalter-Seitenzahlen (**NN**)
  // entsprechen nicht der echten Paginierung -> wir entfernen sie und setzen
  // die Einträge sauber (Premium: keine falschen Seitenzahlen).
  const out = [];
  // Eine zusammenhängende Paragraphenzeile in einzelne TOC-Einträge zerlegen.
  // Trennzeichen: optionale Leader-Punkte + **NN** (Platzhalter-Seitenzahl).
  function splitEntries(text) {
    // an "**NN**" splitten, die Punkte davor mit entfernen
    return text
      .split(/\s*\.{2,}\s*\*\*\d+\*\*/g)
      .map((x) => x.replace(/\.{2,}/g, "").replace(/\*\*\d+\*\*/g, "").trim())
      .map((x) => x.replace(/^🧭\s*/, "").trim())
      .filter((x) => x.length && !/^Modul-Trenner$/i.test(x));
  }
  for (const b of s.blocks) {
    if (b.type === "heading" && b.level === 2) {
      out.push(`<h2 class="toc-mod">${inline(b.text)}</h2>`);
    } else if (b.type === "p") {
      // Schlussnotiz zur Paginierung weglassen
      if (/Seitenzahlen sind Platzhalter/i.test(b.text)) continue;
      for (const e of splitEntries(b.text)) {
        out.push(`<p class="toc-row">${inline(e)}</p>`);
      }
    } else if (b.type === "list") {
      const items = [];
      for (const it of b.items) {
        for (const e of splitEntries(it)) items.push(`<li class="toc-row">${inline(e)}</li>`);
      }
      if (items.length) out.push(`<ul class="toc-list">${items.join("")}</ul>`);
    }
  }
  return `<section class="flow toc" style="--accent:${C.ink}">
    <div class="run-title">Inhalt</div>
    <h1 class="page-h1">Inhalt</h1>
    <div class="toc-body">${out.join("\n")}</div>
  </section>`;
}

function renderModuleDivider(s, color, label) {
  // Modul-Trenner-Seite in Modulfarbe (full-bleed) + Modul-Intro-Inhalt fließend
  const headTitle = s.headingBlock.text.replace(/^🧭\s*/, "").replace(/^[★\s]*/, "").trim();
  const introHtml = renderBlocks(s.blocks);
  return `<section class="fullpage module-divider no-runhead" style="--mod:${color}">
    <div class="md-inner">
      <span class="md-icon">${icon("compass", "#ffffff")}</span>
      <p class="md-label">${label}</p>
      <h1 class="md-title">${inline(stripModulePrefix(headTitle))}</h1>
    </div>
  </section>
  <section class="flow" style="--accent:${color}">
    <div class="run-title">${esc(label)}</div>
    <div class="prose">${introHtml}</div>
  </section>`;
}

function stripModulePrefix(t) {
  // Modul-/Intro-/Outro-Präfix entfernen, da das Label es bereits zeigt.
  const stripped = t
    .replace(/^MODUL\s*\d+\s*[—–-]\s*/i, "")
    .replace(/^(INTRO|OUTRO)\s*[—–-]\s*/i, "")
    .trim();
  return stripped || t;
}

function renderLesson(s, color, runHeader, isAnhang) {
  const headingBlock = s.headingBlock;
  const titleText = headingBlock.text.replace(/^[★\s]*/, "").trim();
  const isHerzstueck = /★/.test(headingBlock.text);
  const body = renderBlocks(s.blocks);
  const headerLabel = isAnhang ? "Anhang" : runHeader;
  const shortTitle = esc(
    (titleText.match(/^(Lektion\s+[\w.]+)/) || [, titleText])[1]
  );

  return `<section class="flow lesson" style="--accent:${color}">
    <div class="run-title">${esc(headerLabel)} · ${shortTitle}</div>
    <div class="lesson-head">
      ${isHerzstueck ? `<span class="herz-badge">★ Herzstück der Masterclass</span>` : ""}
      <h1 class="lesson-title">${inline(titleText)}</h1>
      <div class="lesson-rule"></div>
    </div>
    <div class="prose">${body}</div>
  </section>`;
}

// ── Print-CSS (A5 Premium) ───────────────────────────────────────────────────
function css() {
  return `
@page {
  size: 148mm 210mm;
  margin: 0;            /* Ränder werden von Puppeteer gesetzt */
}
* { box-sizing: border-box; }
html { background: ${C.paper}; }
body {
  margin: 0; padding: 0;
  background: ${C.paper};
  color: ${C.body};
  font-family: 'Inter', -apple-system, system-ui, sans-serif;
  font-size: 9.6pt;
  line-height: 1.4;
  -webkit-font-smoothing: antialiased;
  text-rendering: optimizeLegibility;
}
.serif { font-family: 'Source Serif 4', Georgia, serif; }

/* ── Fließende Inhalts-Sektion ──
   Beginnt auf einer neuen Seite, Inhalt fließt über beliebig viele Seiten.
   Die @page-Ränder sorgen für den Innenbund. */
.flow {
  break-before: page;
  page-break-before: always;
}
.flow:first-child { break-before: auto; page-break-before: auto; }
.run-title { display: none; } /* Running-Header kommt aus Puppeteer headerTemplate */

/* ── Full-Bleed-Seiten (Cover, Titel, Modul-Trenner) ──
   Müssen die @page-Ränder per negativem Margin überdecken. */
.fullpage {
  position: relative;
  break-before: page;  page-break-before: always;
  break-after: page;   page-break-after: always;
  break-inside: avoid; page-break-inside: avoid;
  /* Puppeteer-Ränder (top16 bottom14 left25 right22) neutralisieren -> echte 148x210 Fläche */
  margin: -16mm -22mm -14mm -25mm;
  width: 148mm;
  height: 210mm;
  overflow: hidden;
  background: ${C.paper};
  display: flex;
}
.fullpage:first-child { break-before: auto; page-break-before: auto; }

/* ── Cover ── */
.cover { padding: 0; }
.cover-inner {
  position: relative;
  width: 100%; height: 100%;
  padding: 26mm 20mm;
  display: flex; flex-direction: column; align-items: center;
  text-align: center;
}
.cover-logo {
  font-size: 7.5pt; letter-spacing: 0.34em; color: ${C.muted}; font-weight: 600;
}
.cover-spine {
  position: absolute; top: 50%; left: 50%;
  transform: translate(-50%, -52%);
  width: 60mm; height: auto; opacity: 0.55; z-index: 0;
}
.cover-spine svg { width: 100%; height: auto; }
.cover-kicker {
  margin-top: 28mm; z-index: 1;
  font-size: 10pt; letter-spacing: 0.4em; text-transform: uppercase; color: ${C.mod2};
}
.cover-title {
  font-family: 'Source Serif 4', Georgia, serif; font-weight: 600; z-index: 1;
  font-size: 32pt; line-height: 1.06; color: ${C.ink}; margin: 6mm 0 0;
}
.cover-sub {
  z-index: 1; font-size: 12pt; color: ${C.body}; margin-top: 6mm;
  font-family: 'Source Serif 4', Georgia, serif; font-style: italic;
}
.cover-rule { width: 16mm; height: 1.4pt; background: ${C.mod2}; margin: 14mm 0 6mm; z-index: 1; }
.cover-subline { z-index: 1; font-size: 9pt; letter-spacing: 0.22em; text-transform: uppercase; color: ${C.muted}; }
.cover-foot {
  position: absolute; bottom: 22mm; left: 0; right: 0;
  font-size: 8pt; letter-spacing: 0.18em; color: ${C.muted}; text-transform: uppercase;
}

.cover-back { padding: 0; }
.cover-back-inner { display: flex; flex-direction: column; width: 100%; height: 100%; padding: 26mm 22mm; }
.cb-statements p {
  font-family: 'Source Serif 4', Georgia, serif;
  font-size: 16pt; color: ${C.ink}; margin: 0 0 4mm; line-height: 1.3;
}
.cb-text { margin-top: 10mm; font-size: 10pt; line-height: 1.55; color: ${C.body}; }
.cb-foot { margin-top: auto; }
.cb-foot p { font-size: 8pt; color: ${C.muted}; }
.cb-disclaimer { margin-top: 4mm; font-size: 6.6pt; line-height: 1.4; color: ${C.muted}; }

/* ── Innentitel ── */
.titlepage { align-items: center; justify-content: center; }
.tp-inner { text-align: center; width: 100%; padding: 0 20mm; }
.tp-kicker { font-size: 9pt; letter-spacing: 0.36em; text-transform: uppercase; color: ${C.mod2}; }
.tp-title { font-family: 'Source Serif 4', Georgia, serif; font-weight: 600; font-size: 24pt; color: ${C.ink}; margin: 6mm 0 2mm; }
.tp-sub { font-family: 'Source Serif 4', Georgia, serif; font-weight: 400; font-style: italic; font-size: 15pt; color: ${C.body}; margin: 0 0 8mm; }
.tp-line { font-size: 8.5pt; letter-spacing: 0.2em; text-transform: uppercase; color: ${C.muted}; }
.tp-desc { margin-top: 10mm; font-size: 10pt; color: ${C.body}; }
.tp-foot { margin-top: 16mm; font-size: 8.5pt; color: ${C.muted}; line-height: 1.6; }

/* ── Plain pages (Impressum/Vorwort/TOC) Titel ── */
.page-h1 {
  font-family: 'Source Serif 4', Georgia, serif;
  font-weight: 600; font-size: 18pt; color: ${C.ink};
  margin: 0 0 7mm; line-height: 1.1;
}

/* ── Modul-Trenner ── */
.module-divider {
  background: var(--mod);
  align-items: center; justify-content: center;
}
.md-inner { text-align: center; color: #fff; padding: 0 22mm; width: 100%; }
.md-icon { display: inline-flex; font-size: 30pt; opacity: 0.92; }
.md-icon svg { stroke: #fff; }
.md-label { margin-top: 8mm; font-size: 10pt; letter-spacing: 0.4em; text-transform: uppercase; opacity: 0.85; color: #fff; }
.md-title {
  font-family: 'Source Serif 4', Georgia, serif;
  font-weight: 600; font-size: 23pt; line-height: 1.12; margin-top: 5mm; color: #fff;
}

/* ── Lektion ── */
.lesson-head { margin-bottom: 6mm; break-after: avoid; }
.lesson-title {
  font-family: 'Source Serif 4', Georgia, serif;
  font-weight: 600; font-size: 17pt; line-height: 1.16; color: ${C.ink}; margin: 2mm 0 0;
}
.lesson-rule { width: 14mm; height: 2pt; background: var(--accent, ${C.ink}); margin-top: 4mm; }
.herz-badge {
  display: inline-block; font-size: 7pt; letter-spacing: 0.14em; text-transform: uppercase;
  color: var(--accent, ${C.ink}); border: 0.6pt solid var(--accent, ${C.ink});
  border-radius: 10pt; padding: 1pt 7pt; margin-bottom: 3mm;
}

/* ── Prosa ── */
.prose { color: ${C.body}; }
.prose p { margin: 0 0 3mm; text-align: justify; hyphens: auto; }
.prose.small p { font-size: 8.6pt; }
.h2 {
  font-family: 'Inter', sans-serif; font-weight: 700;
  font-size: 10.5pt; letter-spacing: 0.01em; color: ${C.ink};
  margin: 7mm 0 3mm;
  display: flex; align-items: center; gap: 1.6mm;
  border-left: 2.4pt solid var(--accent, ${C.ink});
  padding-left: 3mm;
  break-after: avoid; page-break-after: avoid;
}
.h3 {
  font-family: 'Inter', sans-serif; font-weight: 700; font-size: 9.6pt;
  color: ${C.ink}; margin: 5mm 0 2mm; break-after: avoid;
}
.h4 { font-weight: 700; font-size: 9.2pt; color: ${C.ink}; margin: 4mm 0 2mm; break-after: avoid; }
.exercise-title {
  font-family: 'Source Serif 4', Georgia, serif;
  font-weight: 600; font-size: 13pt; color: #fff;
  background: var(--accent, ${C.ink});
  padding: 4mm 5mm; border-radius: 3pt; margin: 7mm 0 4mm;
  display: flex; align-items: center; gap: 2.4mm; line-height: 1.2;
  break-after: avoid; page-break-after: avoid; break-inside: avoid;
}
.exercise-title .hd-icon svg { stroke: #fff; }

.hd-icon { display: inline-flex; align-items: center; font-size: 1.05em; }
.hd-icon svg { vertical-align: -0.12em; }
.inline-icon { display: inline-flex; align-items: center; }
.inline-icon svg { vertical-align: -0.14em; }
.wb-icon { flex: none; }
.hd-text { display: inline; }
.hd-star, .inline-star { color: var(--accent, ${C.ink}); }

.wb-list { margin: 0 0 3mm; padding-left: 5mm; }
.wb-list li { margin: 0 0 1.3mm; }
ol.wb-list { padding-left: 6mm; }

.xref-arrow { color: var(--accent, ${C.ink}); font-weight: 600; }
.cb { font-family: 'Inter', sans-serif; color: ${C.muted}; }
.cb-on { color: var(--accent, ${C.ink}); font-weight: 700; }

code {
  font-family: 'SFMono-Regular', Consolas, monospace;
  font-size: 0.86em; background: rgba(44,62,45,0.06);
  padding: 0.5pt 2pt; border-radius: 2pt;
}
.wb-pre {
  font-family: 'SFMono-Regular', Consolas, monospace;
  font-size: 7.6pt; line-height: 1.35; white-space: pre;
  background: #fff; border: 0.5pt solid ${C.line}; border-radius: 3pt;
  padding: 3mm; margin: 3mm 0; overflow: hidden; color: ${C.ink};
  break-inside: avoid; page-break-inside: avoid;
}

.wb-hr { border: none; border-top: 0.5pt solid ${C.line}; margin: 5mm 0; }

/* ── Tabellen ── */
.wb-table { width: 100%; border-collapse: collapse; margin: 3mm 0 4mm; font-size: 8.2pt; }
.wb-table th {
  background: var(--accent, ${C.ink}); color: #fff;
  text-align: left; padding: 1.6mm 2mm; font-weight: 600; font-size: 7.8pt; vertical-align: top;
}
.wb-table td { border-bottom: 0.4pt solid ${C.line}; padding: 1.6mm 2mm; vertical-align: top; }
.wb-table tbody tr:nth-child(even) { background: rgba(44,62,45,0.025); }
.wb-table thead { display: table-header-group; }
.wb-table tr { break-inside: avoid; page-break-inside: avoid; }

/* ── Boxen ── */
.box { margin: 4mm 0; padding: 4mm 4.5mm; border-radius: 4pt; break-inside: avoid; page-break-inside: avoid; }
.box-head { display: flex; align-items: center; gap: 1.8mm; margin-bottom: 1.5mm; }
.box-icon { display: inline-flex; font-size: 11pt; }
.box-label { font-size: 7pt; letter-spacing: 0.18em; text-transform: uppercase; font-weight: 700; }
.box-title { font-size: 9.4pt; font-weight: 700; margin: 0 0 2mm; color: ${C.ink}; }
.box-body p { margin: 0 0 2mm; font-size: 8.8pt; }
.box-body p:last-child { margin-bottom: 0; }
.box-body ul, .box-body ol { font-size: 8.8pt; margin: 0 0 2mm; }
.box-vertiefung { background: rgba(61,90,108,0.07); border-left: 2.6pt solid ${C.mod3}; }
.box-vertiefung .box-label { color: ${C.mod3}; }
.box-praxis { background: rgba(164,90,58,0.06); border-left: 2.6pt solid ${C.mod2}; }
.box-praxis .box-label { color: ${C.mod2}; }
.box-praxis .box-body p { font-style: italic; }
.wb-quote { border-left: 2.4pt solid ${C.line}; padding-left: 4mm; margin: 3mm 0; color: ${C.muted}; }

/* ── Notizfeld (Schreiblinien) ── */
.notizfeld { margin: 3mm 0 4mm; break-inside: avoid; page-break-inside: avoid; }
.write-line { height: 7.4mm; border-bottom: 0.5pt solid ${C.sand}; }

/* ── Übungskarten-Block (ÜK) mit Foto ── */
.uk-block {
  break-inside: avoid; page-break-inside: avoid;
  margin: 5mm 0 3mm;
  border: 0.6pt solid ${C.line}; border-radius: 4pt; overflow: hidden; background: #fff;
}
.uk-head {
  display: flex; align-items: baseline; gap: 2.5mm;
  padding: 2.5mm 3mm; background: rgba(44,62,45,0.04);
  border-bottom: 0.5pt solid ${C.line};
}
.uk-id {
  font-size: 7.4pt; font-weight: 700; letter-spacing: 0.08em;
  color: #fff; background: var(--accent, ${C.ink}); padding: 0.8pt 4pt; border-radius: 8pt;
}
.uk-name { font-weight: 700; font-size: 9.6pt; color: ${C.ink}; }
.uk-photo { padding: 3mm; text-align: center; background: #fff; }
.uk-photo img { max-width: 100%; max-height: 50mm; object-fit: contain; }

/* ── Diagramm-Figuren ── */
.diagram { margin: 4mm 0; text-align: center; break-inside: avoid; page-break-inside: avoid; }
.diagram-art svg { max-width: 62mm; max-height: 76mm; height: auto; }
.diagram figcaption {
  margin-top: 2mm; font-size: 7.4pt; color: ${C.muted}; font-style: italic;
  max-width: 88mm; margin-left: auto; margin-right: auto; line-height: 1.35;
}

/* ── TOC ── */
.toc-mod { font-family: 'Inter', sans-serif; font-weight: 700; font-size: 9.4pt; color: var(--accent, ${C.ink}); margin: 5mm 0 2mm; text-transform: uppercase; letter-spacing: 0.08em; }
.toc-mod:first-child { margin-top: 0; }
.toc-row { font-size: 8.6pt; margin: 0 0 1.4mm; color: ${C.body}; }
.toc-list { list-style: none; padding: 0; margin: 0; }
.toc-list .toc-row { margin: 0 0 1.4mm; }

/* harter Seitenumbruch innerhalb einer Sektion */
.pagebreak { break-after: page; page-break-after: always; height: 0; }

.box, .uk-block, .diagram, .wb-table, .wb-pre, .notizfeld { orphans: 2; widows: 2; }
`;
}
// ── HTML zusammenbauen ───────────────────────────────────────────────────────
function buildHTML(bodyHtml) {
  return `<!DOCTYPE html>
<html lang="de">
<head>
<meta charset="utf-8"/>
<title>Workbook – Chronischer Kreuzschmerz</title>
<link rel="preconnect" href="https://fonts.googleapis.com"/>
<link rel="preconnect" href="https://fonts.gstatic.com" crossorigin/>
<link href="https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700&family=Source+Serif+4:ital,wght@0,400;0,600;1,400;1,600&display=swap" rel="stylesheet"/>
<style>${css()}</style>
</head>
<body>
${bodyHtml}
</body>
</html>`;
}

// ── Main ─────────────────────────────────────────────────────────────────────
async function main() {
  if (!fs.existsSync(MD_PATH)) {
    console.error(`FEHLER: Markdown nicht gefunden: ${MD_PATH}`);
    process.exit(1);
  }
  const md = fs.readFileSync(MD_PATH, "utf8");
  console.log(`MD gelesen: ${MD_PATH} (${md.split("\n").length} Zeilen)`);
  console.log(`Bild-Inventar: ${comboByUk.size} combo-Fotos, ${singleByUk.size} ÜK-IDs gesamt`);

  const blocks = parse(md);
  const sections = buildDocument(blocks);
  const bodyHtml = renderSections(sections);
  const html = buildHTML(bodyHtml);

  fs.mkdirSync(path.dirname(OUT_HTML), { recursive: true });
  fs.writeFileSync(OUT_HTML, html, "utf8");
  console.log(`Debug-HTML geschrieben: ${OUT_HTML}`);
  console.log(`Eingebettet: ${stats.photos} Übungsfotos, ${stats.diagrams} Diagramme`);

  // Puppeteer
  let puppeteer;
  try {
    puppeteer = (await import("puppeteer")).default;
  } catch (e) {
    console.error("FEHLER: puppeteer ist nicht installiert. Bitte `npm i -D puppeteer` ausführen.");
    console.error(e.message);
    process.exit(2);
  }

  const browser = await puppeteer.launch({
    headless: true,
    args: ["--no-sandbox", "--disable-setuid-sandbox"],
  });
  try {
    const page = await browser.newPage();
    await page.setContent(html, { waitUntil: "networkidle0", timeout: 120000 });
    // Sicherstellen, dass Webfonts geladen sind
    await page.evaluateHandle("document.fonts.ready");

    fs.mkdirSync(path.dirname(OUT_PDF), { recursive: true });
    // Ränder kommen aus Puppeteer (nicht preferCSSPageSize), damit Kopf-/Fußzeile
    // im Randbereich platziert werden. .fullpage neutralisiert diese per neg. Margin.
    const headerTpl = `<div style="width:100%; font-size:6.6pt; letter-spacing:0.14em; text-transform:uppercase; color:#a8a195; font-family:Inter, sans-serif; padding:0 22mm 0 25mm;">
        <span style="float:left;">Chronischer Kreuzschmerz</span>
        <span style="float:right;">Das Workbook</span>
      </div>`;
    const footerTpl = `<div style="width:100%; font-size:7.5pt; color:#7c776c; font-family:Inter, sans-serif; padding:0 22mm 0 25mm;">
        <span style="float:right;"><span class="pageNumber"></span></span>
      </div>`;
    await page.pdf({
      path: OUT_PDF,
      width: "148mm",
      height: "210mm",
      printBackground: true,
      preferCSSPageSize: false,
      displayHeaderFooter: true,
      headerTemplate: headerTpl,
      footerTemplate: footerTpl,
      margin: { top: "16mm", bottom: "14mm", left: "25mm", right: "22mm" },
    });
  } finally {
    await browser.close();
  }

  const sizeKb = (fs.statSync(OUT_PDF).size / 1024).toFixed(1);
  console.log(`\n✓ PDF geschrieben: ${OUT_PDF} (${sizeKb} KB)`);
  console.log(`  Übungsfotos: ${stats.photos} · Diagramme: ${stats.diagrams}`);
}

main().catch((e) => {
  console.error("Build fehlgeschlagen:", e);
  process.exit(1);
});
