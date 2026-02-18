/**
 * PROJ-14: Server-side Web Push helper
 *
 * sendPushToPatient() — sends a push notification to all active subscriptions
 * for a given patient. Uses the `web-push` library with VAPID authentication.
 *
 * IMPORTANT: This file is server-only. NEVER import it in client components.
 * It uses VAPID_PRIVATE_KEY which must stay server-side only.
 *
 * Expired / invalid subscriptions are automatically cleaned up from the DB.
 */

import * as webpush from "web-push"
import { createSupabaseServiceClient } from "@/lib/supabase-service"

// ── VAPID configuration ───────────────────────────────────────────────────────

function getVapidConfig() {
  const publicKey = process.env.NEXT_PUBLIC_VAPID_PUBLIC_KEY
  const privateKey = process.env.VAPID_PRIVATE_KEY
  const subject = process.env.VAPID_SUBJECT

  if (!publicKey || !privateKey || !subject) {
    throw new Error(
      "VAPID-Konfiguration unvollständig. " +
        "NEXT_PUBLIC_VAPID_PUBLIC_KEY, VAPID_PRIVATE_KEY und VAPID_SUBJECT müssen gesetzt sein."
    )
  }

  return { publicKey, privateKey, subject }
}

// ── Types ─────────────────────────────────────────────────────────────────────

export interface PushPayload {
  title: string
  body: string
  icon?: string
  badge?: string
  url?: string
  tag?: string
}

interface PushSubscriptionRow {
  id: string
  subscription_json: {
    endpoint: string
    expirationTime?: number | null
    keys: {
      p256dh: string
      auth: string
    }
  }
}

// ── sendPushToPatient ─────────────────────────────────────────────────────────

/**
 * Sends a push notification to all registered devices for a given patient.
 *
 * @param patientId  - UUID of the patient in the `patients` table
 * @param payload    - Notification content (title, body, icon, url, tag)
 * @param filter     - Optional filter: only send to subscriptions where
 *                     chat_enabled = true (for chat notifications) or
 *                     reminder_enabled = true (for training reminders)
 *
 * @returns Object with counts: { sent, failed, cleaned }
 */
export async function sendPushToPatient(
  patientId: string,
  payload: PushPayload,
  filter?: { chatEnabled?: boolean; reminderEnabled?: boolean }
): Promise<{ sent: number; failed: number; cleaned: number }> {
  const vapid = getVapidConfig()

  webpush.setVapidDetails(vapid.subject, vapid.publicKey, vapid.privateKey)

  // Use service client to bypass RLS — this is server-to-server, not user-initiated
  const supabase = createSupabaseServiceClient()

  // Build query — apply optional filter
  let query = supabase
    .from("push_subscriptions")
    .select("id, subscription_json")
    .eq("patient_id", patientId)

  if (filter?.chatEnabled !== undefined) {
    query = query.eq("chat_enabled", filter.chatEnabled)
  }
  if (filter?.reminderEnabled !== undefined) {
    query = query.eq("reminder_enabled", filter.reminderEnabled)
  }

  const { data: subscriptions, error } = await query

  if (error) {
    console.error("[push] Error loading subscriptions:", error.message)
    return { sent: 0, failed: 0, cleaned: 0 }
  }

  if (!subscriptions || subscriptions.length === 0) {
    return { sent: 0, failed: 0, cleaned: 0 }
  }

  const notificationPayload = JSON.stringify({
    title: payload.title,
    body: payload.body,
    icon: payload.icon ?? "/icons/icon-192.png",
    badge: payload.badge ?? "/icons/icon-192.png",
    url: payload.url ?? "/app/dashboard",
    tag: payload.tag,
  })

  let sent = 0
  let failed = 0
  let cleaned = 0

  const expiredIds: string[] = []

  await Promise.allSettled(
    (subscriptions as PushSubscriptionRow[]).map(async (row) => {
      try {
        await webpush.sendNotification(
          {
            endpoint: row.subscription_json.endpoint,
            expirationTime: row.subscription_json.expirationTime ?? null,
            keys: {
              p256dh: row.subscription_json.keys.p256dh,
              auth: row.subscription_json.keys.auth,
            },
          },
          notificationPayload,
          {
            TTL: 43200, // 12 hours max — stale notifications are discarded after this
          }
        )
        sent++
      } catch (err: unknown) {
        const statusCode =
          err instanceof webpush.WebPushError ? err.statusCode : null

        // 404 (Not Found) or 410 (Gone) means subscription is no longer valid
        if (statusCode === 404 || statusCode === 410) {
          expiredIds.push(row.id)
          cleaned++
        } else {
          console.error("[push] Send error for subscription", row.id, err)
          failed++
        }
      }
    })
  )

  // Clean up expired / invalid subscriptions
  if (expiredIds.length > 0) {
    await supabase.from("push_subscriptions").delete().in("id", expiredIds)
  }

  return { sent, failed, cleaned }
}

/**
 * Sends a push notification to ALL active subscriptions for multiple patients.
 * Used by the training-reminder cron job.
 *
 * @param patientIds  - Array of patient UUIDs
 * @param payload     - Notification content
 */
export async function sendPushToPatients(
  patientIds: string[],
  payload: PushPayload
): Promise<{ sent: number; failed: number; cleaned: number }> {
  if (patientIds.length === 0) {
    return { sent: 0, failed: 0, cleaned: 0 }
  }

  const results = await Promise.allSettled(
    patientIds.map((id) =>
      sendPushToPatient(id, payload, { reminderEnabled: true })
    )
  )

  return results.reduce(
    (acc, result) => {
      if (result.status === "fulfilled") {
        acc.sent += result.value.sent
        acc.failed += result.value.failed
        acc.cleaned += result.value.cleaned
      }
      return acc
    },
    { sent: 0, failed: 0, cleaned: 0 }
  )
}
