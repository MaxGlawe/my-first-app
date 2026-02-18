/**
 * Supabase Service Role Client
 *
 * Uses the SERVICE_ROLE key — bypasses Row Level Security.
 * ONLY use this in trusted server-side code (API Routes, Server Actions).
 * NEVER expose this key to the browser.
 *
 * Use cases:
 *  - Webhook receiver (inserts from external systems without user session)
 *  - Admin operations that need cross-tenant access
 */

import { createClient } from "@supabase/supabase-js"

export function createSupabaseServiceClient() {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL
  const serviceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY

  if (!url || !serviceRoleKey) {
    throw new Error(
      "Missing Supabase service role configuration. " +
        "Ensure NEXT_PUBLIC_SUPABASE_URL and SUPABASE_SERVICE_ROLE_KEY are set."
    )
  }

  return createClient(url, serviceRoleKey, {
    auth: {
      // Disable auto-refresh and session persistence — this is a server-only client
      autoRefreshToken: false,
      persistSession: false,
    },
  })
}
