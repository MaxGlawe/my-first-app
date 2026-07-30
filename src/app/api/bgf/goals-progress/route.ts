/**
 * PROJ-18: GET /api/bgf/goals-progress?organization_id=...
 *
 * Calculates real goal progress by comparing IST-Analyse baseline
 * values against the average of the last 7 daily check-ins.
 *
 * Each goal maps to a concrete metric:
 * - Pain goals → schmerz_aktuell (lower = better)
 * - Stress goals → stress_level via stimmung (higher stimmung = less stress)
 * - Sleep goals → schlaf_qualitaet (higher = better)
 * - Movement goals → sessions completed per week
 * - General goals → combination of engagement + metrics
 */

import { NextRequest, NextResponse } from "next/server"
import { createSupabaseServerClient } from "@/lib/supabase-server"
import { createSupabaseServiceClient } from "@/lib/supabase-service"

interface GoalProgress {
  ziel: string
  baseline: number
  current: number
  improvement_percent: number
  trend: "up" | "down" | "stable"
  metric_label: string
  detail: string // e.g. "6.0 → 3.2"
}

// Map goal names to their primary metric
function getGoalMetric(ziel: string): {
  type: "pain" | "stress" | "sleep" | "movement" | "engagement"
  inverted: boolean // true = lower is better (pain, stress)
} {
  const lower = ziel.toLowerCase()
  if (lower.includes("schmerz") || lower.includes("rücken") || lower.includes("nacken") || lower.includes("beschwerden")) {
    return { type: "pain", inverted: true }
  }
  if (lower.includes("stress") || lower.includes("entspann") || lower.includes("mental")) {
    return { type: "stress", inverted: true }
  }
  if (lower.includes("schlaf") || lower.includes("erholung")) {
    return { type: "sleep", inverted: false }
  }
  if (lower.includes("bewegung") || lower.includes("aktiv") || lower.includes("fitness")) {
    return { type: "movement", inverted: false }
  }
  if (lower.includes("haltung") || lower.includes("flexib") || lower.includes("energie") || lower.includes("stärk")) {
    return { type: "engagement", inverted: false }
  }
  return { type: "engagement", inverted: false }
}

export async function GET(request: NextRequest) {
  const supabase = await createSupabaseServerClient()
  const { data: { user }, error: authError } = await supabase.auth.getUser()

  if (authError || !user) {
    return NextResponse.json({ error: "Nicht autorisiert." }, { status: 401 })
  }

  const orgId = new URL(request.url).searchParams.get("organization_id")

  const sc = createSupabaseServiceClient()

  // 1. Load IST-Analyse baseline
  let analyseQuery = sc
    .from("ist_analyse")
    .select("schmerz_aktuell, stress_level, schlaf_qualitaet, bewegung_minuten_pro_woche, ziele")
    .eq("user_id", user.id)

  if (orgId) analyseQuery = analyseQuery.eq("organization_id", orgId)

  const { data: analyse } = await analyseQuery.maybeSingle()

  if (!analyse || !analyse.ziele || analyse.ziele.length === 0) {
    return NextResponse.json({ goals: [] })
  }

  // 2. Load last 14 days of check-ins (for 7-day average + trend comparison)
  const fourteenDaysAgo = new Date()
  fourteenDaysAgo.setDate(fourteenDaysAgo.getDate() - 14)

  const { data: checkins } = await sc
    .from("bgf_daily_checkins")
    .select("datum, schmerz_aktuell, schlaf_qualitaet, stimmung")
    .eq("user_id", user.id)
    .gte("datum", fourteenDaysAgo.toISOString().split("T")[0])
    .order("datum", { ascending: true })

  // 3. Load sessions completed in last 7 days
  const sevenDaysAgo = new Date()
  sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 7)

  const { data: recentSessions } = await sc
    .from("pausen_fit_sessions")
    .select("id")
    .eq("user_id", user.id)
    .eq("status", "abgeschlossen")
    .gte("geplant_um", `${sevenDaysAgo.toISOString().split("T")[0]}T00:00:00`)

  const sessionsThisWeek = recentSessions?.length ?? 0

  // 4. Calculate averages
  const allCheckins = checkins ?? []
  const last7 = allCheckins.slice(-7)
  const prev7 = allCheckins.slice(0, Math.max(0, allCheckins.length - 7))

  function avg(arr: number[]): number {
    if (arr.length === 0) return 0
    return arr.reduce((s, v) => s + v, 0) / arr.length
  }

  const avgPain7 = avg(last7.map((c) => c.schmerz_aktuell ?? 0))
  const avgSleep7 = avg(last7.map((c) => c.schlaf_qualitaet ?? 7))
  const avgMood7 = avg(last7.map((c) => c.stimmung ?? 3))

  // Previous 7 days for trend (if available)
  const avgPainPrev = prev7.length > 0 ? avg(prev7.map((c) => c.schmerz_aktuell ?? 0)) : null
  const avgSleepPrev = prev7.length > 0 ? avg(prev7.map((c) => c.schlaf_qualitaet ?? 7)) : null

  // Baseline values from IST-Analyse
  const baselinePain = analyse.schmerz_aktuell ?? 5
  const baselineStress = analyse.stress_level ?? 5
  const baselineSleep = analyse.schlaf_qualitaet ?? 5

  // 5. Calculate progress for each goal
  const goals: GoalProgress[] = analyse.ziele.map((ziel: string) => {
    const metric = getGoalMetric(ziel)

    let baseline: number
    let current: number
    let metricLabel: string

    switch (metric.type) {
      case "pain":
        baseline = baselinePain
        current = last7.length > 0 ? Math.round(avgPain7 * 10) / 10 : baseline
        metricLabel = "Schmerz Ø"
        break
      case "stress":
        // Use inverted stimmung as stress proxy (5=super→1 stress, 1=schlecht→5 stress)
        baseline = baselineStress
        current = last7.length > 0 ? Math.round((6 - avgMood7) * 10) / 10 : baseline
        metricLabel = "Stress Ø"
        break
      case "sleep":
        baseline = baselineSleep
        current = last7.length > 0 ? Math.round(avgSleep7 * 10) / 10 : baseline
        metricLabel = "Schlaf Ø"
        break
      case "movement":
        baseline = 0 // Started with no sessions
        current = sessionsThisWeek
        metricLabel = "Sessions/Woche"
        break
      case "engagement":
      default:
        // Composite: sessions + overall improvement
        baseline = 0
        current = sessionsThisWeek
        metricLabel = "Sessions/Woche"
        break
    }

    // Calculate improvement
    let improvementPercent: number
    if (metric.inverted) {
      // Lower is better (pain, stress): baseline 6 → current 3 = 50% better
      if (baseline === 0) {
        improvementPercent = current === 0 ? 100 : 0
      } else {
        improvementPercent = Math.round(((baseline - current) / baseline) * 100)
      }
    } else {
      // Higher is better (sleep, movement)
      if (metric.type === "movement" || metric.type === "engagement") {
        // Movement: progress based on target of 15 sessions/week (3/day * 5 days)
        improvementPercent = Math.min(100, Math.round((current / 15) * 100))
      } else {
        // Sleep: baseline 4 → current 7 → (7-4)/(10-4) = 50% toward perfect
        const maxVal = 10
        if (maxVal - baseline === 0) {
          improvementPercent = 100
        } else {
          improvementPercent = Math.round(((current - baseline) / (maxVal - baseline)) * 100)
        }
      }
    }

    // Clamp
    improvementPercent = Math.max(-100, Math.min(100, improvementPercent))

    // Trend: compare last 7 vs previous 7 (or vs baseline if not enough data)
    let trend: "up" | "down" | "stable"
    if (last7.length < 2) {
      trend = "stable"
    } else if (metric.type === "pain") {
      const ref = avgPainPrev !== null ? avgPainPrev : baselinePain
      trend = avgPain7 < ref - 0.3 ? "up" : avgPain7 > ref + 0.3 ? "down" : "stable"
    } else if (metric.type === "sleep") {
      const ref = avgSleepPrev !== null ? avgSleepPrev : baselineSleep
      trend = avgSleep7 > ref + 0.3 ? "up" : avgSleep7 < ref - 0.3 ? "down" : "stable"
    } else if (metric.type === "stress") {
      trend = avgMood7 > 3.5 ? "up" : avgMood7 < 2.5 ? "down" : "stable"
    } else {
      trend = sessionsThisWeek >= 5 ? "up" : sessionsThisWeek >= 2 ? "stable" : "down"
    }

    // Detail string
    let detail: string
    if (metric.type === "movement" || metric.type === "engagement") {
      detail = `${current} Sessions diese Woche`
    } else {
      detail = `${baseline} → ${current}`
    }

    return {
      ziel,
      baseline,
      current,
      improvement_percent: improvementPercent,
      trend,
      metric_label: metricLabel,
      detail,
    }
  })

  return NextResponse.json({ goals })
}
