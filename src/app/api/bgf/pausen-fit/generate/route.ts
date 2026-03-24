/**
 * PROJ-18: POST /api/bgf/pausen-fit/generate
 *
 * Generates a personalized Pausen-Fit micro-routine using Claude AI
 * based on the employee's Ist-Analyse profile and current check-in data.
 *
 * Input: { organization_id, typ: "morgen_aktivierung" | "mittag_mobilisation" | "nachmittag_reset" }
 * Output: PausenFitSession (saved to DB + returned)
 */

import { NextRequest, NextResponse } from "next/server"
import { z } from "zod"
import { createSupabaseServerClient } from "@/lib/supabase-server"
import { createSupabaseServiceClient } from "@/lib/supabase-service"
import Anthropic from "@anthropic-ai/sdk"

const bodySchema = z.object({
  organization_id: z.string().uuid(),
  typ: z.enum(["morgen_aktivierung", "mittag_mobilisation", "nachmittag_reset"]),
})

const PAUSEN_FIT_TOOL = {
  name: "create_pausen_fit" as const,
  description: "Erstellt eine personalisierte Pausen-Fit Micro-Routine für den Arbeitsplatz.",
  input_schema: {
    type: "object" as const,
    properties: {
      uebungen: {
        type: "array" as const,
        items: {
          type: "object" as const,
          properties: {
            name: { type: "string" as const, description: "Übungsname, kurz und klar" },
            beschreibung: { type: "string" as const, description: "Anleitung in 1-2 Sätzen, verständlich für Laien" },
            dauer_sekunden: { type: "number" as const, description: "Dauer in Sekunden (15-60)" },
            position: { type: "string" as const, enum: ["sitzend", "stehend"], description: "Ausgangsposition" },
            schwierigkeit: { type: "string" as const, enum: ["leicht", "mittel", "fordernd"] },
          },
          required: ["name", "beschreibung", "dauer_sekunden", "position", "schwierigkeit"],
        },
        description: "3-4 Übungen für die Routine",
      },
      ergonomie_tipp: {
        type: "string" as const,
        description: "Ein konkreter, umsetzbarer Ergonomie-Tipp passend zum Arbeitsplatz (1-2 Sätze)",
      },
      fokus: {
        type: "string" as const,
        description: "Kurze Fokus-Beschreibung, z.B. 'Schulter & Nacken' oder 'LWS-Mobilisation'",
      },
    },
    required: ["uebungen", "ergonomie_tipp", "fokus"],
  },
}

// Typ-Labels
const TYP_LABELS: Record<string, { label: string; fokusHint: string }> = {
  morgen_aktivierung: {
    label: "Morgen-Aktivierung",
    fokusHint: "Mobilisation, Kreislauf aktivieren, wach werden. Eher dynamische Übungen.",
  },
  mittag_mobilisation: {
    label: "Mittags-Mobilisation",
    fokusHint: "Gegenbewegung zum Sitzen/Stehen, Durchblutung, Dehnung. Ausgleichende Übungen.",
  },
  nachmittag_reset: {
    label: "Nachmittags-Reset",
    fokusHint: "Augen-Entspannung, Handgelenke, Nacken. Kurz und erfrischend gegen das Nachmittagstief.",
  },
}

export async function POST(request: NextRequest) {
  const supabase = await createSupabaseServerClient()

  const {
    data: { user },
    error: authError,
  } = await supabase.auth.getUser()

  if (authError || !user) {
    return NextResponse.json({ error: "Nicht autorisiert." }, { status: 401 })
  }

  let body: unknown
  try {
    body = await request.json()
  } catch {
    return NextResponse.json({ error: "Ungültiges JSON." }, { status: 400 })
  }

  const parseResult = bodySchema.safeParse(body)
  if (!parseResult.success) {
    return NextResponse.json(
      { error: "Validierungsfehler.", details: parseResult.error.flatten().fieldErrors },
      { status: 422 }
    )
  }

  const { organization_id, typ } = parseResult.data
  const serviceClient = createSupabaseServiceClient()

  // 1. Prüfe Mitgliedschaft
  const { data: membership } = await serviceClient
    .from("organization_members")
    .select("id, status, arbeitsplatz_typ")
    .eq("organization_id", organization_id)
    .eq("user_id", user.id)
    .eq("status", "aktiv")
    .single()

  if (!membership) {
    return NextResponse.json(
      { error: "Kein aktives BGF-Mitglied in dieser Organisation." },
      { status: 403 }
    )
  }

  // 2. Ist-Analyse laden
  const { data: analyse } = await serviceClient
    .from("ist_analyse")
    .select("*")
    .eq("user_id", user.id)
    .eq("organization_id", organization_id)
    .single()

  if (!analyse) {
    return NextResponse.json(
      { error: "Bitte zuerst die Ist-Analyse abschließen." },
      { status: 400 }
    )
  }

  // 3. Heutiges BGF-Check-In laden (falls vorhanden), Fallback: pain_diary
  const today = new Date().toISOString().split("T")[0]
  const { data: bgfCheckin } = await serviceClient
    .from("bgf_daily_checkins")
    .select("schmerz_aktuell, schlaf_qualitaet, stimmung")
    .eq("user_id", user.id)
    .eq("datum", today)
    .maybeSingle()

  const { data: lastCheckIn } = !bgfCheckin
    ? await serviceClient
        .from("pain_diary_entries")
        .select("pain_level, stress_level, sleep_quality")
        .eq("patient_id", user.id)
        .order("created_at", { ascending: false })
        .limit(1)
        .maybeSingle()
    : { data: null }

  // 4. Heutige bisherige Sessions laden (für Variation)
  const { data: todaySessions } = await serviceClient
    .from("pausen_fit_sessions")
    .select("typ, uebungen")
    .eq("user_id", user.id)
    .gte("geplant_um", `${today}T00:00:00`)
    .lte("geplant_um", `${today}T23:59:59`)
    .eq("status", "abgeschlossen")

  // 5. Passenden Ergonomie-Tipp laden
  const { data: tipps } = await serviceClient
    .from("ergonomie_tipps")
    .select("tipp")
    .eq("aktiv", true)
    .contains("arbeitsplatz_typen", [analyse.arbeitsplatz_typ])
    .limit(20)

  const typInfo = TYP_LABELS[typ] || TYP_LABELS.morgen_aktivierung
  const aktuellerSchmerz = bgfCheckin?.schmerz_aktuell ?? lastCheckIn?.pain_level ?? analyse.schmerz_aktuell ?? 3
  const bereitsGemacht = (todaySessions ?? []).map((s) => {
    const ueb = s.uebungen as Array<{ name: string }>
    return ueb.map((u) => u.name).join(", ")
  }).join("; ")

  // 6. Claude API aufrufen
  const anthropic = new Anthropic()

  const systemPrompt = `Du bist ein erfahrener Präventionstrainer und Ergonomie-Experte.
Du erstellst kurze, effektive Pausen-Fit Routinen für Mitarbeitende am Arbeitsplatz.

Regeln:
- Genau 3-4 Übungen pro Routine
- Gesamtdauer: 3-5 Minuten (180-300 Sekunden)
- Alle Übungen müssen am Arbeitsplatz durchführbar sein (kein Boden nötig wenn Büro)
- Klare, verständliche Anleitungen für Laien (keine Fachbegriffe)
- Übungen sollen sich von den bereits heute gemachten unterscheiden
- Bei hohem Schmerz (≥6): nur sanfte Mobilisation, keine Belastung
- Ergonomie-Tipp: konkret und sofort umsetzbar`

  const userPrompt = `Erstelle ein "${typInfo.label}" Pausen-Fit für diesen Mitarbeiter:

PROFIL:
- Arbeitsplatz: ${analyse.arbeitsplatz_typ}
- Hauptbeschwerden: ${analyse.beschwerden_regionen?.length ? analyse.beschwerden_regionen.join(", ") : "keine"}
- Pausen-Fit Fokus: ${analyse.pausen_fit_fokus?.length ? analyse.pausen_fit_fokus.join(", ") : "allgemein"}
- Aktueller Schmerz: ${aktuellerSchmerz}/10
- Stress: ${lastCheckIn?.stress_level ?? analyse.stress_level ?? 5}/10
- Bildschirmarbeit: ${analyse.bildschirmarbeit_stunden ?? "unbekannt"} Std./Tag
- Sitzstunden: ${analyse.sitz_stunden_pro_tag ?? "unbekannt"} Std./Tag
- Heben/Tragen: ${analyse.heben_tragen ? "Ja" : "Nein"}

TAGESZEIT-FOKUS: ${typInfo.fokusHint}

BEREITS HEUTE GEMACHT: ${bereitsGemacht || "noch nichts"}

${aktuellerSchmerz >= 6 ? "WICHTIG: Schmerz ist hoch — nur sanfte, schmerzfreie Mobilisation!" : ""}

Erstelle die Routine mit dem create_pausen_fit Tool.`

  let generated: { uebungen: unknown[]; ergonomie_tipp: string; fokus: string }

  try {
    const message = await anthropic.messages.create({
      model: "claude-haiku-4-5-20251001",
      max_tokens: 2048,
      system: systemPrompt,
      tools: [PAUSEN_FIT_TOOL],
      messages: [{ role: "user", content: userPrompt }],
    })

    const toolBlock = message.content.find((b) => b.type === "tool_use")
    if (!toolBlock || toolBlock.type !== "tool_use") {
      console.error("[pausen-fit/generate] No tool_use in response:", message.content)
      return NextResponse.json(
        { error: "KI konnte kein Pausen-Fit generieren." },
        { status: 500 }
      )
    }

    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const raw = toolBlock.input as any

    // Repair JSON (same pattern as education/generate — German quotes break JSON)
    function repairAndParseJson(str: string): unknown {
      let s = str
      for (let attempt = 0; attempt < 30; attempt++) {
        try {
          return JSON.parse(s)
        } catch (e) {
          const match = (e as Error).message.match(/position\s+(\d+)/i)
          if (!match) throw e
          const errorPos = parseInt(match[1])
          let quotePos = errorPos - 1
          while (quotePos >= 0 && s[quotePos] !== '"') quotePos--
          if (quotePos < 0) throw e
          s = s.slice(0, quotePos) + '\\"' + s.slice(quotePos + 1)
        }
      }
      throw new Error("JSON-Reparatur fehlgeschlagen")
    }

    function coerceArray(val: unknown, fieldName: string): unknown[] {
      if (Array.isArray(val)) return val
      if (typeof val === "string") {
        const parsed = repairAndParseJson(val)
        if (Array.isArray(parsed)) return parsed
        throw new Error(`${fieldName} ist kein Array`)
      }
      throw new Error(`${fieldName}: unerwarteter Typ ${typeof val}`)
    }

    generated = {
      uebungen: coerceArray(raw.uebungen, "uebungen"),
      ergonomie_tipp: typeof raw.ergonomie_tipp === "string" ? raw.ergonomie_tipp : "",
      fokus: typeof raw.fokus === "string" ? raw.fokus : typInfo.label,
    }

    // Validiere Übungen
    if (generated.uebungen.length < 2 || generated.uebungen.length > 6) {
      console.error("[pausen-fit/generate] Unexpected exercise count:", generated.uebungen.length)
      return NextResponse.json(
        { error: "KI hat ungültige Übungsanzahl generiert." },
        { status: 500 }
      )
    }
  } catch (err) {
    console.error("[pausen-fit/generate] Claude API error:", err)
    return NextResponse.json(
      { error: "Pausen-Fit konnte nicht generiert werden." },
      { status: 500 }
    )
  }

  // 7. Fallback: Ergonomie-Tipp aus DB wenn KI keinen liefert
  let tipp = generated.ergonomie_tipp
  if (!tipp && tipps && tipps.length > 0) {
    tipp = tipps[Math.floor(Math.random() * tipps.length)].tipp
  }

  // 8. Gesamtdauer berechnen
  const gesamtDauer = generated.uebungen.reduce((sum: number, u) => {
    const ueb = u as { dauer_sekunden?: number }
    return sum + (ueb.dauer_sekunden ?? 30)
  }, 0)

  // 9. In DB speichern
  const { data: session, error: insertError } = await serviceClient
    .from("pausen_fit_sessions")
    .insert({
      user_id: user.id,
      organization_id,
      geplant_um: new Date().toISOString(),
      typ,
      uebungen: generated.uebungen,
      ergonomie_tipp: tipp,
      dauer_sekunden: gesamtDauer,
      status: "geplant",
      check_in_schmerz_bei_erstellung: aktuellerSchmerz,
    })
    .select("id, typ, uebungen, ergonomie_tipp, dauer_sekunden, status, geplant_um, created_at")
    .single()

  if (insertError) {
    console.error("[pausen-fit/generate] DB insert error:", insertError)
    return NextResponse.json(
      { error: "Pausen-Fit konnte nicht gespeichert werden." },
      { status: 500 }
    )
  }

  return NextResponse.json({ session, fokus: generated.fokus }, { status: 201 })
}
