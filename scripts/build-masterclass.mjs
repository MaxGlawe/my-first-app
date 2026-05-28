#!/usr/bin/env node
/**
 * build-masterclass.mjs — GENERALISIERTE, WIEDERHOLBARE Build-Pipeline für die
 * Masterclass „Chronischer Kreuzschmerz". Eine Lektion pro Aufruf.
 * ============================================================================
 *
 *   node scripts/build-masterclass.mjs <lessonId> [--no-audio]
 *
 * Beispiele:
 *   node scripts/build-masterclass.mjs I.1            # I.1 mit Audio bauen
 *   node scripts/build-masterclass.mjs I.1 --no-audio # nur Timings/Datei neu
 *   node scripts/build-masterclass.mjs 1.1            # nächste Lektion bauen
 *
 * <lessonId> = die MD-ID der Lektion (I.1, I.2, …, 1.1 … 4.6, O.1, O.2). Sie
 * bestimmt alle Pfade:
 *   Quelle:   src/lib/masterclass/sources/<lessonId>.source.ts   (export lessonSource)
 *   Ziel:     src/lib/masterclass/lessons/<lessonId>.ts          (generiert)
 *   Audio:    public/audio/masterclass/chronischer-kreuzschmerz/<lessonId>/abschnitt-N.mp3
 *   Alignment public/audio/masterclass/chronischer-kreuzschmerz/<lessonId>/_align/abschnitt-N.json
 *
 * Was es tut (identisch zur ursprünglichen I.1-Pipeline, nur per lessonId
 * parametrisiert):
 *   1. Liest die `narration` pro Abschnitt aus der Source (export `lessonSource`).
 *   2. Schickt sie an ElevenLabs `/text-to-speech/{VOICE}/with-timestamps`,
 *      schreibt das MP3 nach …/<lessonId>/abschnitt-N.mp3 und behält das
 *      Alignment (characters + character_start_times_seconds) unter
 *      …/<lessonId>/_align/abschnitt-N.json (Debug/Reproduktion, NICHT an Client).
 *   3. Bestimmt für jede Slide den Start-Zeichen-Offset ihres `seg` im
 *      gesprochenen Text (chars.join('')) über einen sequenziellen,
 *      Whitespace-robusten Cursor und setzt appearTime = starts[offset].
 *      Erste Slide je Abschnitt = 0; appearTime wird monoton erzwungen.
 *   4. Generiert src/lib/masterclass/lessons/<lessonId>.ts (Slides inkl.
 *      appearTime, Transkripte = narration; Typen kommen aus ../types).
 *      KEIN seg / kein Alignment im Client-Output.
 *
 * STIMMWECHSEL künftig = nur die VOICE_ID-Konstante unten ändern und das Skript
 * für die betroffenen Lektionen erneut laufen lassen.
 *
 * Voraussetzung: ELEVENLABS_API_KEY in .env.local.
 * Flags:
 *   --no-audio   nur lessons/<lessonId>.ts aus vorhandenem _align neu generieren
 *                (kein ElevenLabs-Call, keine Kosten)
 */

import { readFileSync, writeFileSync, mkdirSync, existsSync } from "node:fs";
import { dirname, resolve } from "node:path";
import { fileURLToPath, pathToFileURL } from "node:url";
import { config } from "dotenv";

// ── Konfiguration ───────────────────────────────────────────────────────────

/** Adrian (deutsche Stimme). Für einen Stimmwechsel NUR diesen Wert ändern. */
const VOICE_ID = "YYyi4prp0WCqZCPDNGu1";
const VOICE_NAME = "Adrian";

const MODEL_ID = "eleven_multilingual_v2";
const VOICE_SETTINGS = {
  stability: 0.5,
  similarity_boost: 0.8,
  style: 0.15,
  use_speaker_boost: true,
};

const __dirname = dirname(fileURLToPath(import.meta.url));
const projectRoot = resolve(__dirname, "..");

// ── CLI-Argumente ─────────────────────────────────────────────────────────────

const args = process.argv.slice(2);
const SKIP_AUDIO = args.includes("--no-audio");
const LESSON_ID = args.find((a) => !a.startsWith("--"));

if (!LESSON_ID) {
  console.error(
    "\nFEHLER: lessonId fehlt.\n  Aufruf: node scripts/build-masterclass.mjs <lessonId> [--no-audio]\n  Beispiel: node scripts/build-masterclass.mjs I.1 --no-audio\n",
  );
  process.exit(1);
}

// Pfade aus der lessonId ableiten (lessonId = MD-ID, z.B. „I.1", „4.6", „O.2").
const SOURCE_PATH = resolve(
  projectRoot,
  `src/lib/masterclass/sources/${LESSON_ID}.source.ts`,
);
const OUT_TS_PATH = resolve(
  projectRoot,
  `src/lib/masterclass/lessons/${LESSON_ID}.ts`,
);
const AUDIO_DIR = resolve(
  projectRoot,
  `public/audio/masterclass/chronischer-kreuzschmerz/${LESSON_ID}`,
);
const ALIGN_DIR = resolve(AUDIO_DIR, "_align");
const AUDIO_BASE_URL = `/audio/masterclass/chronischer-kreuzschmerz/${LESSON_ID}`;

config({ path: resolve(projectRoot, ".env.local") });
const API_KEY = process.env.ELEVENLABS_API_KEY;

// ── Helfer ───────────────────────────────────────────────────────────────────

/** Normalisiert Whitespace für den positionsunabhängigen Vergleich. */
function squash(s) {
  return s.replace(/\s+/g, " ").trim();
}

/**
 * Sucht den Start-Zeichen-Offset von `seg` im gesprochenen `chars`-Array ab
 * `fromIndex`. Whitespace-robust: vergleicht squash(seg) gegen den ab jeder
 * Kandidatenposition gelesenen Text gleicher (squash-)Länge. Liefert den
 * gefundenen char-Index oder -1.
 */
function findSegOffset(chars, seg, fromIndex) {
  const needle = squash(seg);
  if (!needle) return fromIndex;
  for (let i = fromIndex; i < chars.length; i++) {
    if (/\s/.test(chars[i])) continue;
    let acc = "";
    let j = i;
    while (j < chars.length && squash(acc).length < needle.length) {
      acc += chars[j];
      j++;
    }
    if (squash(acc) === needle) return i;
  }
  return -1;
}

function ensureDir(dir) {
  if (!existsSync(dir)) mkdirSync(dir, { recursive: true });
}

// ── 1) Source laden (native TS-Type-Stripping, Node ≥ 22.6 / 25) ─────────────

async function loadSource() {
  if (!existsSync(SOURCE_PATH)) {
    throw new Error(`Source nicht gefunden: ${SOURCE_PATH}`);
  }
  const mod = await import(pathToFileURL(SOURCE_PATH).href);
  // Konvention: jede Source exportiert `lessonSource`. Fallback auf jeden
  // Export, der wie eine SourceLesson aussieht (id + sections).
  const lesson =
    mod.lessonSource ??
    Object.values(mod).find(
      (v) => v && typeof v === "object" && "sections" in v && "id" in v,
    );
  if (!lesson) {
    throw new Error(
      `${LESSON_ID}.source.ts exportiert kein lessonSource (oder keine SourceLesson).`,
    );
  }
  if (lesson.id !== LESSON_ID) {
    console.warn(
      `  Hinweis: Source-id „${lesson.id}" ≠ lessonId „${LESSON_ID}". Es wird die lessonId für Pfade verwendet.`,
    );
  }
  return lesson;
}

// ── 2) ElevenLabs TTS mit Timestamps ─────────────────────────────────────────

async function synthesize(narration) {
  const url = `https://api.elevenlabs.io/v1/text-to-speech/${VOICE_ID}/with-timestamps`;
  const res = await fetch(url, {
    method: "POST",
    headers: {
      "xi-api-key": API_KEY,
      "Content-Type": "application/json",
      Accept: "application/json",
    },
    body: JSON.stringify({
      text: narration,
      model_id: MODEL_ID,
      voice_settings: VOICE_SETTINGS,
    }),
  });
  if (!res.ok) {
    const body = await res.text();
    throw new Error(`ElevenLabs ${res.status}: ${body.slice(0, 500)}`);
  }
  const data = await res.json();
  const align = data.alignment ?? data.normalized_alignment;
  if (!align || !Array.isArray(align.characters)) {
    throw new Error("Antwort ohne alignment.characters");
  }
  const audioBuffer = Buffer.from(data.audio_base64, "base64");
  return {
    audioBuffer,
    chars: align.characters,
    starts: align.character_start_times_seconds,
    ends: align.character_end_times_seconds,
  };
}

/** Geschätzte MP3-Dauer (Sek.) aus dem letzten End-Zeitstempel. */
function alignDuration(align) {
  const ends = align.ends ?? align.starts;
  return ends && ends.length ? ends[ends.length - 1] : 0;
}

// ── 3) appearTimes pro Abschnitt aus dem Alignment berechnen ─────────────────

function computeAppearTimes(section, align) {
  const { chars, starts } = align;
  const spoken = chars.join("");
  const appearTimes = [];
  let cursor = 0;
  for (let i = 0; i < section.slides.length; i++) {
    const slide = section.slides[i];
    let t;
    if (i === 0 || !slide.seg || squash(slide.seg) === "") {
      t = 0;
    } else {
      const offset = findSegOffset(chars, slide.seg, cursor);
      if (offset < 0) {
        throw new Error(
          `Segment nicht gefunden in „${section.title}“ (Slide ${i + 1}, type=${slide.type}):\n  seg = ${JSON.stringify(squash(slide.seg).slice(0, 80))}\n  ab Cursor-Kontext = ${JSON.stringify(squash(spoken.slice(cursor, cursor + 80)))}`,
        );
      }
      cursor = offset + 1;
      t = starts[offset] ?? 0;
    }
    const prev = appearTimes.length ? appearTimes[appearTimes.length - 1] : 0;
    if (t < prev) t = prev;
    appearTimes.push(Number(t.toFixed(3)));
  }
  return appearTimes;
}

// ── 4) lessons/<lessonId>.ts generieren ──────────────────────────────────────

/**
 * Serialisiert ein Slide-Objekt (ohne `seg`) mit appearTime an Position 2.
 * Erzeugt lesbares, eingerücktes TS.
 */
function serializeSlide(slide, appearTime, indent) {
  const { seg, type, ...rest } = slide;
  const pad = " ".repeat(indent);
  const pad2 = " ".repeat(indent + 2);
  const lines = [`${pad}{`];
  lines.push(`${pad2}type: ${JSON.stringify(type)},`);
  lines.push(`${pad2}appearTime: ${appearTime},`);
  for (const [key, value] of Object.entries(rest)) {
    lines.push(`${pad2}${key}: ${JSON.stringify(value)},`);
  }
  lines.push(`${pad}},`);
  return lines.join("\n");
}

function serializeSection(section, appearTimes, indent) {
  const pad = " ".repeat(indent);
  const pad2 = " ".repeat(indent + 2);
  const lines = [`${pad}{`];
  lines.push(`${pad2}title: ${JSON.stringify(section.title)},`);
  const fileN = section._fileN;
  lines.push(`${pad2}audioSrc: \`\${AUDIO_BASE}/abschnitt-${fileN}.mp3\`,`);
  lines.push(`${pad2}transkript: ${JSON.stringify(section.narration)},`);
  lines.push(`${pad2}slides: [`);
  section.slides.forEach((slide, i) => {
    lines.push(serializeSlide(slide, appearTimes[i], indent + 4));
  });
  lines.push(`${pad2}],`);
  lines.push(`${pad}},`);
  return lines.join("\n");
}

/** Macht aus „I.1" einen gültigen TS-Identifier-Teil: „I_1". */
function idToVar(id) {
  return id.replace(/[^A-Za-z0-9]/g, "_");
}

function buildTsFile(lesson, sectionAppearTimes) {
  const varBase = idToVar(LESSON_ID);
  const header = `/**
 * Masterclass „Chronischer Kreuzschmerz" — Laufzeit-Daten der Lektion ${LESSON_ID}
 * ${lesson.title}
 *
 * ⚠️  GENERIERT — NICHT VON HAND EDITIEREN.
 * Quelle:   src/lib/masterclass/sources/${LESSON_ID}.source.ts
 * Erzeugt:  node scripts/build-masterclass.mjs ${LESSON_ID}  (Stimme: ${VOICE_NAME} / ${VOICE_ID})
 * Änderungen am Text/Timing → Source ändern + Build-Skript erneut laufen lassen.
 *
 * SYNCHRONISATION (wort-genau):
 *   Jede Slide trägt eine \`appearTime\` (Sekunden, relativ zum Abschnitt-Audio).
 *   Sie wurde aus dem ElevenLabs-Wort-Alignment berechnet: Für das Sprech-Segment
 *   jeder Slide (\`seg\` in der Source) wird der Start-Zeichen-Offset im gesprochenen
 *   Text bestimmt und \`appearTime = starts[offset]\` gesetzt. Der Player schaltet
 *   die Slide, sobald \`audio.currentTime >= slide.appearTime\`. Weder \`seg\` noch
 *   das Alignment werden an den Client ausgeliefert — nur die fertigen Zeitwerte.
 *
 * Die Transkripte sind die bereinigten Erzähltexte (Pausen-Marker und Emphasis
 * entfernt). Der Wortlaut bleibt unverändert (HWG: keine Heilversprechen).
 *
 * Die Slide-/Abschnitt-/Lektions-Typen liegen geteilt in ../types.
 */

import {
  type Lesson,
  totalSlides,
  flatSlides,
  type FlatSlide,
} from "../types";

const AUDIO_BASE = "${AUDIO_BASE_URL}";

export const lesson_${varBase}: Lesson = {
  id: ${JSON.stringify(lesson.id)},
  title: ${JSON.stringify(lesson.title)},
  subtitle: ${JSON.stringify(lesson.subtitle)},
  sections: [`;

  const sectionsTs = lesson.sections
    .map((section, i) => serializeSection(section, sectionAppearTimes[i], 4))
    .join("\n");

  const footer = `  ],
};

/** Gesamtanzahl Slides der Lektion. */
export const total_${varBase}: number = totalSlides(lesson_${varBase});

/** Flache Liste aller Slides (mit Rückverweis auf den Abschnitt). */
export const flat_${varBase}: FlatSlide[] = flatSlides(lesson_${varBase});

export default lesson_${varBase};
`;

  return `${header}\n${sectionsTs}\n${footer}`;
}

// ── Hauptablauf ──────────────────────────────────────────────────────────────

async function main() {
  const lesson = await loadSource();

  if (!SKIP_AUDIO && !API_KEY) {
    console.error("FEHLER: ELEVENLABS_API_KEY fehlt in .env.local.");
    process.exit(1);
  }

  ensureDir(dirname(OUT_TS_PATH));
  ensureDir(AUDIO_DIR);
  ensureDir(ALIGN_DIR);

  console.log(
    `\nMasterclass ${LESSON_ID} Build — Stimme ${VOICE_ID} (${MODEL_ID})${SKIP_AUDIO ? " [--no-audio]" : ""}\n`,
  );

  const sectionAppearTimes = [];

  for (let i = 0; i < lesson.sections.length; i++) {
    const section = lesson.sections[i];
    const n = i + 1;
    section._fileN = n;
    const alignPath = resolve(ALIGN_DIR, `abschnitt-${n}.json`);
    const mp3Path = resolve(AUDIO_DIR, `abschnitt-${n}.mp3`);

    let align;
    if (SKIP_AUDIO) {
      if (!existsSync(alignPath)) {
        throw new Error(
          `--no-audio, aber kein Alignment: ${alignPath}. Erst einmal mit Audio bauen.`,
        );
      }
      align = JSON.parse(readFileSync(alignPath, "utf8"));
    } else {
      const result = await synthesize(section.narration);
      writeFileSync(mp3Path, result.audioBuffer);
      align = {
        text: section.narration,
        chars: result.chars,
        starts: result.starts,
        ends: result.ends,
      };
      writeFileSync(alignPath, JSON.stringify(align));
    }

    const appearTimes = computeAppearTimes(section, align);
    sectionAppearTimes.push(appearTimes);

    const dur = alignDuration(align);
    console.log(
      `  Abschnitt ${n} — ${section.title}: ${section.slides.length} Slides, ` +
        `Dauer ${dur.toFixed(1)}s, appearTimes [${appearTimes.join(", ")}]`,
    );
  }

  const tsContent = buildTsFile(lesson, sectionAppearTimes);
  writeFileSync(OUT_TS_PATH, tsContent);

  const total = lesson.sections.reduce((s, x) => s + x.slides.length, 0);
  console.log(
    `\nGeneriert: ${OUT_TS_PATH}\n  ${lesson.sections.length} Abschnitte, ${total} Slides gesamt.\n`,
  );
}

main().catch((err) => {
  console.error("\nBUILD FEHLGESCHLAGEN:", err.message, "\n");
  process.exit(1);
});
