/**
 * GET /api/os/patient-alerts
 * PROJ-17: Patienten-Ampelsystem
 *
 * Computes the traffic-light (Ampel) status for every patient belonging to
 * the authenticated therapist and returns them sorted by severity:
 *   ROT (red) first → GELB (yellow) → GRUEN (green).
 *
 * Alert rules:
 *   ROT  | Schmerz >= 8 in the last 3 days
 *   ROT  | Pain increase >= 3 points over 3 consecutive days
 *   ROT  | Compliance < 25% last 7 days (active assignment)
 *   ROT  | No check-in for >= 7 days (active assignment)
 *   GELB | Pain increase >= 2 points over 3 days
 *   GELB | Compliance 25–49% last 7 days
 *   GELB | No check-in for 3–6 days
 *   GRUEN| No trigger
 *
 * Data sources: pain_diary, assignment_completions, patient_assignments, patients
 * No new tables required.
 */

import { NextRequest, NextResponse } from "next/server"
import { createSupabaseServerClient } from "@/lib/supabase-server"
import { createSupabaseServiceClient } from "@/lib/supabase-service"

// ── Types ────────────────────────────────────────────────────────────────────

export type AmpelStatus = "ROT" | "GELB" | "GRUEN"

export interface AlertGrund {
  key: string       // machine-readable key for deduplication
  label: string     // human-readable German text shown on card
  severity: "ROT" | "GELB"
}

export interface PatientAlert {
  patientId: string
  vorname: string
  nachname: string
  avatarUrl: string | null
  status: AmpelStatus
  gruende: AlertGrund[]
  letzterCheckIn: string | null // ISO date YYYY-MM-DD or null
  userId: string | null         // for chat deep-link
}

// ── Day-of-week helper (same pattern as dashboard-stats) ─────────────────────

const DOW_MAP: Record<number, string> = {
  1: "mo", 2: "di", 3: "mi", 4: "do", 5: "fr", 6: "sa", 0: "so",
}

function expectedInWindow(
  activeDays: string[],
  startDate: string,
  endDate: string,
  windowStartDate: Date,
  windowEndDate: Date,
): number {
  const start = new Date(Math.max(windowStartDate.getTime(), new Date(startDate).getTime()))
  const end = new Date(Math.min(windowEndDate.getTime(), new Date(endDate).getTime()))
  if (end < start) return 0

  let count = 0
  const cursor = new Date(start)
  while (cursor <= end) {
    if (activeDays.includes(DOW_MAP[cursor.getDay()])) count++
    cursor.setDate(cursor.getDate() + 1)
  }
  return count
}

// ── Pain increase helper ─────────────────────────────────────────────────────

/**
 * Given sorted (ascending) pain entries, compute the largest increase
 * across any 3 consecutive days within the window.
 */
function maxPainIncrease(
  entries: Array<{ recorded_date: string; pain_level: number }>,
): number {
  if (entries.length < 2) return 0
  let max = 0
  for (let i = 0; i < entries.length; i++) {
    for (let j = i + 1; j < entries.length; j++) {
      const daysDiff =
        (new Date(entries[j].recorded_date).getTime() -
          new Date(entries[i].recorded_date).getTime()) /
        86_400_000
      if (daysDiff <= 3) {
        const diff = entries[j].pain_level - entries[i].pain_level
        if (diff > max) max = diff
      }
    }
  }
  return max
}

// ── GET ─────────────────────────────────────────────────────────────────────

export async function GET(_request: NextRequest) {
  const supabase = await createSupabaseServerClient()

  const {
    data: { user },
    error: authError,
  } = await supabase.auth.getUser()

  if (authError || !user) {
    return NextResponse.json({ error: "Nicht autorisiert." }, { status: 401 })
  }

  const serviceClient = createSupabaseServiceClient()

  // ── Date window ───────────────────────────────────────────────────────────

  const today = new Date()
  today.setHours(0, 0, 0, 0)
  const todayStr = today.toISOString().split("T")[0]

  const sevenDaysAgo = new Date(today)
  sevenDaysAgo.setDate(today.getDate() - 6)
  const sevenDaysAgoStr = sevenDaysAgo.toISOString().split("T")[0]

  // ── 1. Fetch all patients for this therapist ──────────────────────────────

  const { data: patients, error: patientsError } = await supabase
    .from("patients")
    .select("id, vorname, nachname, avatar_url, user_id")
    .is("archived_at", null)
    .limit(500)

  if (patientsError || !patients) {
    return NextResponse.json(
      { error: "Patienten konnten nicht geladen werden." },
      { status: 500 },
    )
  }

  if (patients.length === 0) {
    return NextResponse.json({ alerts: [] })
  }

  const patientIds = patients.map((p) => p.id)

  // ── 2. Parallel data fetch ────────────────────────────────────────────────

  const [activeAssignmentsResult, painDiaryResult] = await Promise.all([
    // Active assignments (for compliance + check-in gap)
    serviceClient
      .from("patient_assignments")
      .select("id, patient_id, start_date, end_date, active_days")
      .in("patient_id", patientIds)
      .eq("therapist_id", user.id)
      .eq("status", "aktiv")
      .limit(1000),

    // Pain diary last 7 days (for pain level + trend)
    serviceClient
      .from("pain_diary")
      .select("patient_id, pain_level, recorded_date")
      .in("patient_id", patientIds)
      .gte("recorded_date", sevenDaysAgoStr)
      .lte("recorded_date", todayStr)
      .order("recorded_date", { ascending: true })
      .limit(5000),
  ])

  const activeAssignments = activeAssignmentsResult.data ?? []
  const painEntries = painDiaryResult.data ?? []

  // ── 3. Assignment completions (only if there are assignments) ─────────────

  let completionsByAssignment = new Map<string, Set<string>>()

  if (activeAssignments.length > 0) {
    const assignmentIds = activeAssignments.map((a) => a.id)
    const { data: completions } = await serviceClient
      .from("assignment_completions")
      .select("assignment_id, completed_date, patient_id")
      .in("assignment_id", assignmentIds)
      .gte("completed_date", sevenDaysAgoStr)
      .lte("completed_date", todayStr)
      .limit(10000)

    for (const c of completions ?? []) {
      if (!completionsByAssignment.has(c.assignment_id)) {
        completionsByAssignment.set(c.assignment_id, new Set())
      }
      completionsByAssignment.get(c.assignment_id)!.add(c.completed_date)
    }
  }

  // ── 4. Group data by patient ──────────────────────────────────────────────

  // Pain entries grouped by patient
  const painByPatient = new Map<string, Array<{ recorded_date: string; pain_level: number }>>()
  for (const entry of painEntries) {
    if (!painByPatient.has(entry.patient_id)) {
      painByPatient.set(entry.patient_id, [])
    }
    painByPatient.get(entry.patient_id)!.push({
      recorded_date: entry.recorded_date,
      pain_level: entry.pain_level,
    })
  }

  // Assignments + compliance grouped by patient
  const assignmentsByPatient = new Map<string, typeof activeAssignments>()
  for (const a of activeAssignments) {
    if (!assignmentsByPatient.has(a.patient_id)) {
      assignmentsByPatient.set(a.patient_id, [])
    }
    assignmentsByPatient.get(a.patient_id)!.push(a)
  }

  // ── 5. Evaluate alert rules for each patient ──────────────────────────────

  const alerts: PatientAlert[] = []

  for (const patient of patients) {
    const patientPain = painByPatient.get(patient.id) ?? []
    const patientAssignments = assignmentsByPatient.get(patient.id) ?? []
    const gruende: AlertGrund[] = []

    // Only patients with active assignments are monitored
    if (patientAssignments.length === 0) continue

    // ── Pain rules ──────────────────────────────────────────────────────────

    if (patientPain.length > 0) {
      // Last 3 days of pain entries
      const threeDaysAgo = new Date(today)
      threeDaysAgo.setDate(today.getDate() - 2)
      const recentPain = patientPain.filter(
        (e) => new Date(e.recorded_date) >= threeDaysAgo,
      )

      const maxPain = Math.max(...recentPain.map((e) => e.pain_level), 0)
      if (maxPain >= 8) {
        gruende.push({
          key: "schmerz-hoch",
          label: `Schmerz: ${maxPain}/10 in den letzten 3 Tagen`,
          severity: "ROT",
        })
      }

      // Pain increase rules
      const increase = maxPainIncrease(patientPain)
      if (increase >= 3) {
        gruende.push({
          key: "schmerz-anstieg-rot",
          label: `Schmerzanstieg: +${increase} Punkte in 3 Tagen`,
          severity: "ROT",
        })
      } else if (increase >= 2) {
        gruende.push({
          key: "schmerz-anstieg-gelb",
          label: `Schmerzanstieg: +${increase} Punkte in 3 Tagen`,
          severity: "GELB",
        })
      }
    }

    // ── Compliance & check-in rules (per assignment) ─────────────────────────

    // Aggregate compliance across all patient assignments
    let totalExpected = 0
    let totalDone = 0

    // Last check-in = most recent completion date across all assignments
    let lastCheckIn: string | null = null

    for (const assignment of patientAssignments) {
      const activeDays = (assignment.active_days as string[]) ?? []
      const expected = expectedInWindow(
        activeDays,
        assignment.start_date,
        assignment.end_date,
        sevenDaysAgo,
        today,
      )
      totalExpected += expected

      const done = completionsByAssignment.get(assignment.id) ?? new Set<string>()
      totalDone += done.size

      // Track most recent completion date
      for (const dateStr of done) {
        if (!lastCheckIn || dateStr > lastCheckIn) {
          lastCheckIn = dateStr
        }
      }
    }

    // Also count pain diary entries as a form of check-in (patient engagement)
    for (const entry of patientPain) {
      if (!lastCheckIn || entry.recorded_date > lastCheckIn) {
        lastCheckIn = entry.recorded_date
      }
    }

    // Compliance rule
    if (totalExpected > 0) {
      const compliancePercent = Math.min(
        100,
        Math.round((totalDone / totalExpected) * 100),
      )

      if (compliancePercent < 25) {
        gruende.push({
          key: "compliance-rot",
          label: `Compliance: ${compliancePercent}% letzte 7 Tage`,
          severity: "ROT",
        })
      } else if (compliancePercent < 50) {
        gruende.push({
          key: "compliance-gelb",
          label: `Compliance: ${compliancePercent}% letzte 7 Tage`,
          severity: "GELB",
        })
      }
    }

    // Check-in gap rule
    if (lastCheckIn !== null) {
      const daysSinceCheckIn = Math.floor(
        (today.getTime() - new Date(lastCheckIn).getTime()) / 86_400_000,
      )
      if (daysSinceCheckIn >= 7) {
        gruende.push({
          key: "kein-checkin-rot",
          label: `Kein Check-In seit ${daysSinceCheckIn} Tagen`,
          severity: "ROT",
        })
      } else if (daysSinceCheckIn >= 3) {
        gruende.push({
          key: "kein-checkin-gelb",
          label: `Kein Check-In seit ${daysSinceCheckIn} Tagen`,
          severity: "GELB",
        })
      }
    } else {
      // No check-in ever recorded — treat as 7+ days if assignment is older
      const oldestAssignment = patientAssignments.sort(
        (a, b) => new Date(a.start_date).getTime() - new Date(b.start_date).getTime(),
      )[0]
      const assignmentAge = Math.floor(
        (today.getTime() - new Date(oldestAssignment.start_date).getTime()) /
          86_400_000,
      )
      if (assignmentAge >= 7) {
        gruende.push({
          key: "kein-checkin-rot",
          label: "Noch kein Check-In aufgezeichnet (7+ Tage)",
          severity: "ROT",
        })
      } else if (assignmentAge >= 3) {
        gruende.push({
          key: "kein-checkin-gelb",
          label: `Noch kein Check-In aufgezeichnet (${assignmentAge} Tage)`,
          severity: "GELB",
        })
      }
    }

    // ── Determine overall Ampel status ──────────────────────────────────────

    const hasRot = gruende.some((g) => g.severity === "ROT")
    const hasGelb = gruende.some((g) => g.severity === "GELB")

    const status: AmpelStatus = hasRot ? "ROT" : hasGelb ? "GELB" : "GRUEN"

    alerts.push({
      patientId: patient.id,
      vorname: patient.vorname,
      nachname: patient.nachname,
      avatarUrl: patient.avatar_url ?? null,
      status,
      gruende,
      letzterCheckIn: lastCheckIn,
      userId: patient.user_id ?? null,
    })
  }

  // ── 6. Sort: ROT first, then GELB, then GRUEN ────────────────────────────

  const ORDER: Record<AmpelStatus, number> = { ROT: 0, GELB: 1, GRUEN: 2 }
  alerts.sort((a, b) => ORDER[a.status] - ORDER[b.status])

  return NextResponse.json({ alerts })
}
