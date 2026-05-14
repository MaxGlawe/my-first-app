/**
 * Content Access Guard
 *
 * hasContentAccess(userId, contentType, contentId) — server-side check.
 * Returns true if the user is entitled to access the given content via:
 *   (a) a purchase entitlement (lifetime)  OR
 *   (b) an active subscription AND the product has abo_inkludiert = true
 *
 * Uses the service client (RLS-bypass) — call only from trusted server code.
 */

import { createSupabaseServiceClient } from "@/lib/supabase-service"

export async function hasContentAccess(
  userId: string,
  contentType: string,
  contentId: string
): Promise<boolean> {
  const sc = createSupabaseServiceClient()

  // ── (a) Direct purchase entitlement ─────────────────────────
  const { data: entitlement } = await sc
    .from("content_entitlements")
    .select("id, valid_until")
    .eq("user_id", userId)
    .eq("content_type", contentType)
    .eq("content_id", contentId)
    .eq("source", "purchase")
    .maybeSingle()

  if (entitlement) {
    // valid_until IS NULL → lifetime; otherwise must be in the future
    if (!entitlement.valid_until) return true
    if (new Date(entitlement.valid_until) > new Date()) return true
  }

  // ── (b) Active subscription + product has abo_inkludiert ────
  // Step 1: find the patient record for this user
  const { data: patient } = await sc
    .from("patients")
    .select("id")
    .eq("user_id", userId)
    .maybeSingle()

  if (!patient) return false

  // Step 2: check for active/trial subscription
  const { data: subscription } = await sc
    .from("patient_subscriptions")
    .select("id, status")
    .eq("patient_id", patient.id)
    .in("status", ["trial", "active"])
    .maybeSingle()

  if (!subscription) return false

  // Step 3: is this content part of ANY active, abo-included product?
  // Not .maybeSingle() — a content can belong to multiple products (e.g. sold
  // standalone AND inside a bundle), which would otherwise throw.
  const { data: includedProducts } = await sc
    .from("product_contents")
    .select("products!inner(abo_inkludiert, status)")
    .eq("content_type", contentType)
    .eq("content_id", contentId)

  return (includedProducts ?? []).some((row) => {
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const p = row.products as any
    return p?.abo_inkludiert === true && p?.status === "aktiv"
  })
}
