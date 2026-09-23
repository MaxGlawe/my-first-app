/**
 * PROJ-27 — QR-Code zu einem Videotermin.
 *
 * GET /api/os/video-calls/[id]/qr  → PNG
 *
 * Bewusst vom eigenen Server und nicht über einen der kostenlosen QR-Dienste
 * im Netz: Der Link enthält den Zugang zu einem Gespräch über Gesundheit.
 * Ihn an einen Dritten zu schicken, nur um ein Bild zu bekommen, wäre eine
 * stille Datenweitergabe.
 *
 * Als eigener Endpunkt und nicht als Data-URL in der Liste, damit die
 * Übersicht nicht bei zwanzig Terminen zwanzig Bilder mitschleppt.
 */

import { NextRequest, NextResponse } from "next/server"
import QRCode from "qrcode"
import { createSupabaseServerClient } from "@/lib/supabase-server"
import { createSupabaseServiceClient } from "@/lib/supabase-service"

const STAFF_ROLES = new Set(["admin", "heilpraktiker", "physiotherapeut", "praxismanagement"])

export async function GET(_request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params

  const supabase = await createSupabaseServerClient()
  const {
    data: { user },
  } = await supabase.auth.getUser()
  if (!user) return NextResponse.json({ error: "Nicht autorisiert." }, { status: 401 })

  const svc = createSupabaseServiceClient()
  const { data: profile } = await svc
    .from("user_profiles")
    .select("role")
    .eq("id", user.id)
    .maybeSingle()

  if (!profile || !STAFF_ROLES.has(profile.role)) {
    return NextResponse.json({ error: "Nicht autorisiert." }, { status: 403 })
  }

  const { data: call } = await svc
    .from("video_calls")
    .select("gast_token")
    .eq("id", id)
    .maybeSingle()

  if (!call) return NextResponse.json({ error: "Nicht gefunden." }, { status: 404 })

  const siteUrl = process.env.NEXT_PUBLIC_SITE_URL || "https://wwwpraxis-os.com"
  const png = await QRCode.toBuffer(`${siteUrl}/sprechzimmer/${call.gast_token}`, {
    width: 512,
    margin: 1,
    color: { dark: "#2C3E2D", light: "#FFFFFF" },
  })

  return new NextResponse(new Uint8Array(png), {
    headers: {
      "Content-Type": "image/png",
      // Nicht zwischenspeichern: Der Code trägt einen Zugang, und ein
      // Proxy-Cache wäre der falsche Ort dafür.
      "Cache-Control": "private, no-store",
    },
  })
}
