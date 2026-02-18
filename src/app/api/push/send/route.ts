/**
 * PROJ-14: POST /api/push/send
 *
 * Internal endpoint — sends a Web Push notification to all active subscriptions
 * for a given patient. Called by:
 *   - /api/patients/[id]/chat POST (after saving a new message)
 *   - /api/cron/training-reminder (for daily training reminders)
 *
 * Security: Protected by CRON_SECRET header.
 * Only callers that know the secret can trigger a push send.
 * This endpoint is NOT callable from the browser.
 *
 * Access: Server-to-server only (verified via x-cron-secret header)
 */

import { NextRequest, NextResponse } from "next/server"
import { z } from "zod"
import { sendPushToPatient } from "@/lib/push"

// ── Zod schema ────────────────────────────────────────────────────────────────

const SendPushBodySchema = z.object({
  patientId: z.string().uuid(),
  title: z.string().min(1).max(100),
  body: z.string().min(1).max(300),
  icon: z.string().url().optional(),
  url: z.string().optional(),
  tag: z.string().optional(),
  filter: z
    .object({
      chatEnabled: z.boolean().optional(),
      reminderEnabled: z.boolean().optional(),
    })
    .optional(),
})

// ── POST ──────────────────────────────────────────────────────────────────────

export async function POST(req: NextRequest) {
  // 1. Verify CRON_SECRET — only internal callers know this secret
  const cronSecret = process.env.CRON_SECRET
  if (!cronSecret) {
    console.error("[push/send] CRON_SECRET is not set")
    return NextResponse.json({ error: "Serverkonfiguration fehlt." }, { status: 500 })
  }

  const providedSecret = req.headers.get("x-cron-secret")
  if (!providedSecret || providedSecret !== cronSecret) {
    return NextResponse.json({ error: "Nicht autorisiert." }, { status: 401 })
  }

  // 2. Validate input
  const body = await req.json().catch(() => ({}))
  const parsed = SendPushBodySchema.safeParse(body)
  if (!parsed.success) {
    return NextResponse.json(
      { error: "Ungültige Eingabe.", details: parsed.error.flatten() },
      { status: 400 }
    )
  }

  const { patientId, title, body: notifBody, icon, url, tag, filter } = parsed.data

  // 3. Send push to all active subscriptions for this patient
  const result = await sendPushToPatient(
    patientId,
    { title, body: notifBody, icon, url, tag },
    filter
  )

  return NextResponse.json({
    ok: true,
    sent: result.sent,
    failed: result.failed,
    cleaned: result.cleaned,
  })
}
