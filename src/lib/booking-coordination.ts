/**
 * PROJ-34 / Phase 2-3: Server-seitiger Wrapper für die Koordinations-API des
 * Buchungstools (Termine listen, Slots, umbuchen, stornieren).
 *
 * NUR serverseitig verwenden (Bearer-Key, nie im Client). Auth via
 * `Authorization: Bearer <PRAXIS_OS_API_KEY>`. Fail-soft: bei fehlender Konfig
 * oder Netzwerkfehler kommt ein getyptes `{ ok:false, error }` zurück, kein Throw.
 *
 * Muster wie `src/lib/brevo.ts`. Basis-URL/Key aus Server-Env.
 */

const DEFAULT_BASE = "https://my-first-app-psi-seven.vercel.app"

function getConfig(): { base: string; key: string } | null {
  const key = process.env.PRAXIS_OS_API_KEY
  if (!key) return null
  const base = (process.env.BOOKING_COORDINATION_BASE_URL || DEFAULT_BASE).replace(/\/$/, "")
  return { base, key }
}

// ── Typen (laut Briefing Section 4) ──────────────────────────────────────────
export type AppointmentScope = "upcoming" | "past" | "all"

export interface CoordTreatment {
  name?: string
  durationMinutes?: number
  [k: string]: unknown
}
export interface CoordTherapist {
  id?: string
  name?: string
  [k: string]: unknown
}
export interface CoordAppointment {
  bookingId: string
  bookingNumber?: string
  date: string // YYYY-MM-DD (lokale Praxiszeit)
  startTime: string // HH:MM
  endTime: string // HH:MM
  status: string
  treatment?: CoordTreatment
  therapist?: CoordTherapist
  canReschedule: boolean
  canCancel: boolean
}
export interface CoordListResult {
  patient?: Record<string, unknown>
  appointments: CoordAppointment[]
}
export interface CoordSlots {
  availableDates: string[]
  slotsByDate: Record<string, Array<{ startTime: string; endTime: string }>>
}
export interface RescheduleResult {
  success: boolean
  bookingId: string
  bookingNumber?: string
  date: string
  startTime: string
  endTime: string
  therapist?: CoordTherapist
}

export type CoordResult<T> =
  | { ok: true; data: T }
  | { ok: false; status: number; error: string }

/** Niedrigster gemeinsamer Nenner: ein fetch mit Bearer-Auth + JSON. */
async function call<T>(
  method: "GET" | "POST",
  path: string,
  body?: unknown
): Promise<CoordResult<T>> {
  const cfg = getConfig()
  if (!cfg) return { ok: false, status: 0, error: "not_configured" }
  try {
    const res = await fetch(`${cfg.base}${path}`, {
      method,
      headers: {
        Authorization: `Bearer ${cfg.key}`,
        ...(body ? { "Content-Type": "application/json" } : {}),
      },
      body: body ? JSON.stringify(body) : undefined,
      cache: "no-store",
    })
    const text = await res.text()
    let json: unknown = null
    try { json = text ? JSON.parse(text) : null } catch { /* non-JSON */ }
    if (!res.ok) {
      const err =
        (json && typeof json === "object" && "error" in json && typeof (json as { error: unknown }).error === "string"
          ? (json as { error: string }).error
          : null) ?? `http_${res.status}`
      return { ok: false, status: res.status, error: err }
    }
    return { ok: true, data: (json ?? {}) as T }
  } catch (e) {
    return { ok: false, status: 0, error: e instanceof Error ? e.message : "network_error" }
  }
}

// ── Endpunkte (Briefing 4.1-4.4) ─────────────────────────────────────────────

export function listAppointments(patientId: string, scope: AppointmentScope = "upcoming") {
  return call<CoordListResult>("POST", "/api/praxis-os/appointments/list", { patientId, scope })
}

export function getRescheduleSlots(
  bookingId: string,
  patientId: string,
  month: string, // YYYY-MM
  therapistId?: string
) {
  const q = new URLSearchParams({ patientId, month })
  if (therapistId) q.set("therapistId", therapistId)
  return call<CoordSlots>(
    "GET",
    `/api/praxis-os/appointments/${encodeURIComponent(bookingId)}/reschedule-slots?${q}`
  )
}

export function reschedule(
  bookingId: string,
  patientId: string,
  slot: { date: string; startTime: string; endTime: string; therapistId?: string }
) {
  return call<RescheduleResult>(
    "POST",
    `/api/praxis-os/appointments/${encodeURIComponent(bookingId)}/reschedule`,
    { patientId, ...slot }
  )
}

export function cancelAppointment(bookingId: string, patientId: string) {
  return call<{ success: boolean; bookingId: string; status: string }>(
    "POST",
    `/api/praxis-os/appointments/${encodeURIComponent(bookingId)}/cancel`,
    { patientId }
  )
}

export const isCoordinationConfigured = () => getConfig() !== null
