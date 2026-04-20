/**
 * POST /api/log/client-error
 *
 * Logs client-side JavaScript errors to the server so they show up in
 * `pm2 logs praxis-os` and we can diagnose issues users report without
 * needing their browser console.
 *
 * Kept intentionally minimal — no DB writes, just stderr logging with
 * rate-limiting to prevent abuse.
 */

import { NextRequest, NextResponse } from "next/server"
import { z } from "zod"
import { createSupabaseServerClient } from "@/lib/supabase-server"
import { isRateLimited } from "@/lib/rate-limit"

const schema = z.object({
  message: z.string().max(2000),
  stack: z.string().max(8000).optional().nullable(),
  source: z.enum(["error", "unhandledrejection", "errorboundary"]),
  url: z.string().max(2000).optional().nullable(),
  userAgent: z.string().max(500).optional().nullable(),
  lineno: z.number().int().optional().nullable(),
  colno: z.number().int().optional().nullable(),
})

export async function POST(request: NextRequest) {
  // Rate-limit per IP: 30 errors per minute per IP
  const ip =
    request.headers.get("x-forwarded-for")?.split(",")[0]?.trim() ??
    request.headers.get("x-real-ip") ??
    "unknown"
  if (isRateLimited(`client-error:${ip}`, 30, 60_000)) {
    return NextResponse.json({ ok: true, skipped: "rate_limited" }, { status: 200 })
  }

  let body: z.infer<typeof schema>
  try {
    const raw = await request.json()
    body = schema.parse(raw)
  } catch {
    return NextResponse.json({ error: "bad_request" }, { status: 400 })
  }

  // Best-effort user identification — don't block on auth failures
  let userTag = "anon"
  try {
    const supabase = await createSupabaseServerClient()
    const { data: { user } } = await supabase.auth.getUser()
    if (user) userTag = `${user.email ?? user.id}`
  } catch {
    // ignore — logging errors from unauthenticated requests is still useful
  }

  // First line of stack is usually the most helpful
  const stackHead = body.stack?.split("\n").slice(0, 6).join(" | ") ?? ""

  console.error(
    `[client-error] user=${userTag} source=${body.source} ip=${ip}`,
    `\n  msg: ${body.message}`,
    `\n  url: ${body.url ?? "?"}`,
    `\n  ua:  ${body.userAgent ?? "?"}`,
    stackHead ? `\n  stack: ${stackHead}` : ""
  )

  return NextResponse.json({ ok: true })
}
