#!/usr/bin/env node
/**
 * Seeds learning paths (Kurse) from the markdown files in docs/paths/.
 *
 * - Reads the `## Einführung` section → learning_paths.intro_content
 * - Reads each `### Tag X — Titel` block → path_lessons
 *   (content, task, reflection question)
 * - Reads each `**Quiz:**` sub-section → path_lesson_quizzes
 * - Wipes existing lessons for the path (quizzes cascade) — idempotent re-runs
 * - Inserts fresh rows
 *
 * Run with: node scripts/seed-paths.mjs
 *
 * Requires NEXT_PUBLIC_SUPABASE_URL and SUPABASE_SERVICE_ROLE_KEY in .env.local.
 */

import { readFileSync, existsSync } from "node:fs"
import { dirname, resolve } from "node:path"
import { fileURLToPath } from "node:url"
import { createClient } from "@supabase/supabase-js"
import { config } from "dotenv"

const __dirname = dirname(fileURLToPath(import.meta.url))
const projectRoot = resolve(__dirname, "..")

// Load env from .env.local (Next.js convention)
config({ path: resolve(projectRoot, ".env.local") })

const SUPABASE_URL = process.env.NEXT_PUBLIC_SUPABASE_URL
const SERVICE_KEY = process.env.SUPABASE_SERVICE_ROLE_KEY

if (!SUPABASE_URL || !SERVICE_KEY) {
  console.error(
    "Missing NEXT_PUBLIC_SUPABASE_URL or SUPABASE_SERVICE_ROLE_KEY in .env.local"
  )
  process.exit(1)
}

const supabase = createClient(SUPABASE_URL, SERVICE_KEY, {
  auth: { persistSession: false },
})

const PATHS = [
  { slug: "hydrations-boost", file: "docs/paths/hydrations-boost.md" },
  { slug: "ruecken-mobility", file: "docs/paths/ruecken-mobility.md" },
  { slug: "schmerz-tagebuch-routine", file: "docs/paths/schmerz-tagebuch-routine.md" },
  { slug: "faszien-tiefenarbeit", file: "docs/paths/faszien-tiefenarbeit.md" },
]

/**
 * Parses a quiz block into questions. Format per question:
 *   F: Frage-Text?
 *   - Option A
 *   - *Option B   (the leading "*" marks the correct answer)
 *   - Option C
 *   E: Erklärung (optional, one line)
 */
function parseQuizBlock(text, day) {
  const questions = []
  // Each question starts at a line beginning with "F:"
  const chunks = text
    .split(/^F:/m)
    .map((c) => c.trim())
    .filter(Boolean)

  for (const chunk of chunks) {
    const lines = chunk
      .split("\n")
      .map((l) => l.trim())
      .filter(Boolean)
    if (lines.length === 0) continue

    const question = lines[0].trim()
    const options = []
    let correctIndex = -1
    let explanation = null

    for (let i = 1; i < lines.length; i++) {
      const line = lines[i]
      if (line.startsWith("- ")) {
        let opt = line.substring(2).trim()
        if (opt.startsWith("*")) {
          correctIndex = options.length
          opt = opt.substring(1).trim()
        }
        options.push(opt)
      } else if (line.startsWith("E:")) {
        explanation = line.substring(2).trim()
      }
    }

    if (question && options.length >= 2 && correctIndex >= 0) {
      questions.push({ question, options, correctIndex, explanation })
    } else {
      console.warn(
        `  ⚠ Day ${day}: malformed quiz question "${question.slice(0, 40)}…"`
      )
    }
  }
  return questions
}

/**
 * Parses a day block (everything from "### Tag X" to the next "### Tag" or "## " or "---").
 * Returns { day, title, content, task, reflection, quizzes } or null if malformed.
 */
function parseDayBlock(block) {
  // First line: "X — Title text"  (X is day number)
  // The "###" prefix has already been stripped by the split
  const firstLine = block.split("\n", 1)[0].trim()
  const dayMatch = firstLine.match(/^Tag\s+(\d+)\s*[—–-]\s*(.+)$/u)
  if (!dayMatch) return null
  const day = parseInt(dayMatch[1], 10)
  const title = dayMatch[2].trim()

  // The rest after the headline
  const rest = block.substring(firstLine.length).trim()

  // Section markers we look for (German, exactly as written in the pfade)
  const CONTENT_MARKER = /\*\*Hauptinhalt:\*\*/u
  const TASK_MARKER = /\*\*Tages-Aufgabe:\*\*/u
  const REFLECTION_MARKER = /\*\*Reflexion:\*\*/u
  const QUIZ_MARKER = /\*\*Quiz:\*\*/u

  const contentStart = rest.search(CONTENT_MARKER)
  const taskStart = rest.search(TASK_MARKER)
  const reflectionStart = rest.search(REFLECTION_MARKER)
  const quizStart = rest.search(QUIZ_MARKER)

  if (contentStart === -1 || taskStart === -1 || reflectionStart === -1) {
    console.warn(
      `  ⚠ Day ${day}: missing section marker (content=${contentStart}, task=${taskStart}, reflection=${reflectionStart})`
    )
    return null
  }

  // Content: between "**Hauptinhalt:**" and "**Tages-Aufgabe:**"
  const content = rest
    .substring(contentStart + "**Hauptinhalt:**".length, taskStart)
    .trim()

  // Task: between "**Tages-Aufgabe:**" and "**Reflexion:**"
  const task = rest
    .substring(taskStart + "**Tages-Aufgabe:**".length, reflectionStart)
    .trim()

  // Reflection: from "**Reflexion:**" to "**Quiz:**" (or end of block)
  const reflectionEnd = quizStart !== -1 ? quizStart : rest.length
  const reflection = rest
    .substring(reflectionStart + "**Reflexion:**".length, reflectionEnd)
    .replace(/\n---\s*$/u, "")
    .trim()

  // Quiz: from "**Quiz:**" to end of block
  let quizzes = []
  if (quizStart !== -1) {
    const quizText = rest
      .substring(quizStart + "**Quiz:**".length)
      .replace(/\n---\s*$/u, "")
      .trim()
    quizzes = parseQuizBlock(quizText, day)
  }

  return { day, title, content, task, reflection, quizzes }
}

/**
 * Extracts the "## Einführung" section (everything up to the next "## " heading).
 * Returns the intro markdown without the trailing "---" separator, or null.
 */
function parseIntro(md) {
  const match = md.match(/^##\s+Einführung\s*\r?\n([\s\S]*?)(?=^##\s)/m)
  if (!match) return null
  return match[1].trim().replace(/\n*---\s*$/u, "").trim() || null
}

/**
 * Extracts the hero image path from a frontmatter line:
 *   > **Hero-Bild:** /kurse/slug-hero.png
 * Returns null if not present (frontend then shows the gradient placeholder).
 */
function parseHeroImage(md) {
  const match = md.match(/^>\s*\*\*Hero-Bild:\*\*\s*(\S+)/m)
  return match ? match[1].trim() : null
}

/**
 * Splits a path markdown file into day blocks. Each block starts with "### Tag X".
 */
function parsePathFile(md) {
  // Split on "### Tag " — the prefix is consumed; rejoin as "Tag X ..."
  const parts = md.split(/^###\s+/gm)
  const days = []
  for (const part of parts) {
    if (!part.startsWith("Tag ")) continue
    const parsed = parseDayBlock(part)
    if (parsed) days.push(parsed)
  }
  return days
}

async function seedPath({ slug, file }) {
  const filePath = resolve(projectRoot, file)
  if (!existsSync(filePath)) {
    console.error(`  ✗ ${slug}: file not found at ${filePath}`)
    return
  }

  const md = readFileSync(filePath, "utf-8")
  const days = parsePathFile(md)

  if (days.length === 0) {
    console.error(`  ✗ ${slug}: no days parsed`)
    return
  }

  // Look up path_id from learning_paths
  const { data: pathRow, error: pathErr } = await supabase
    .from("learning_paths")
    .select("id")
    .eq("slug", slug)
    .single()

  if (pathErr || !pathRow) {
    console.error(`  ✗ ${slug}: not found in learning_paths`, pathErr?.message)
    return
  }

  // Update curated metadata: intro text + hero image (both from the md file)
  const metaUpdate = {}
  const intro = parseIntro(md)
  if (intro) metaUpdate.intro_content = intro
  const heroImage = parseHeroImage(md)
  if (heroImage) metaUpdate.hero_image = heroImage

  if (Object.keys(metaUpdate).length > 0) {
    const { error: metaErr } = await supabase
      .from("learning_paths")
      .update(metaUpdate)
      .eq("id", pathRow.id)
    if (metaErr) {
      console.error(`  ⚠ ${slug}: metadata update failed`, metaErr.message)
    }
  }

  // Wipe existing lessons for this path (idempotent)
  const { error: delErr } = await supabase
    .from("path_lessons")
    .delete()
    .eq("path_id", pathRow.id)
  if (delErr) {
    console.error(`  ✗ ${slug}: delete failed`, delErr.message)
    return
  }

  // Insert fresh lessons — return ids so we can attach quizzes
  const rows = days.map((d) => ({
    path_id: pathRow.id,
    day_number: d.day,
    title: d.title,
    content: d.content,
    task: d.task,
    reflection_question: d.reflection,
  }))

  const { data: insertedLessons, error: insErr } = await supabase
    .from("path_lessons")
    .insert(rows)
    .select("id, day_number")
  if (insErr) {
    console.error(`  ✗ ${slug}: insert failed`, insErr.message)
    return
  }

  // Seed quizzes — path_lesson_quizzes cascade-deletes with path_lessons,
  // so the lesson wipe above already cleared the old quiz rows.
  const lessonIdByDay = {}
  for (const l of insertedLessons ?? []) lessonIdByDay[l.day_number] = l.id

  const quizRows = []
  for (const d of days) {
    const quizzes = d.quizzes ?? []
    for (let i = 0; i < quizzes.length; i++) {
      const q = quizzes[i]
      quizRows.push({
        lesson_id: lessonIdByDay[d.day],
        sort_order: i,
        question: q.question,
        options: q.options,
        correct_index: q.correctIndex,
        explanation: q.explanation,
      })
    }
  }

  if (quizRows.length > 0) {
    const { error: quizErr } = await supabase
      .from("path_lesson_quizzes")
      .insert(quizRows)
    if (quizErr) {
      console.error(`  ✗ ${slug}: quiz insert failed`, quizErr.message)
      return
    }
  }

  console.log(
    `  ✓ ${slug}: ${days.length} lessons, ${quizRows.length} quiz questions seeded`
  )
}

async function main() {
  console.log("Seeding learning paths from docs/paths/ …\n")
  for (const path of PATHS) {
    await seedPath(path)
  }
  console.log("\nDone.")
}

main().catch((err) => {
  console.error("Fatal:", err)
  process.exit(1)
})
