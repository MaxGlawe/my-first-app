import { NextRequest, NextResponse } from "next/server"
import { z } from "zod"
import { createSupabaseServerClient } from "@/lib/supabase-server"
import { createSupabaseServiceClient } from "@/lib/supabase-service"

const UUID_REGEX = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i

// ── Validation ──────────────────────────────────────────────────────

const addMemberSchema = z.object({
  email: z.string().email("Ungültige E-Mail-Adresse.").trim(),
  vorname: z.string().max(100).trim().optional(),
  nachname: z.string().max(100).trim().optional(),
  abteilung: z.string().max(100).trim().optional(),
  arbeitsplatz_typ: z
    .enum(["buero", "homeoffice", "lager", "produktion", "handwerk", "pflege", "mischform"])
    .optional(),
})

const bulkImportSchema = z.object({
  members: z
    .array(addMemberSchema)
    .min(1, "Mindestens ein Mitarbeiter erforderlich.")
    .max(500, "Maximal 500 Mitarbeiter pro Import."),
})

// ── Auth Helper ─────────────────────────────────────────────────────

async function checkOrgAccess(orgId: string) {
  const supabase = await createSupabaseServerClient()
  const {
    data: { user },
    error: authError,
  } = await supabase.auth.getUser()

  if (authError || !user) return null

  const serviceClient = createSupabaseServiceClient()
  const { data: profile } = await serviceClient
    .from("user_profiles")
    .select("role, bgf_freigeschaltet")
    .eq("id", user.id)
    .single()

  if (!profile) return null

  const isAdmin = profile.role === "admin"
  const isBgf = profile.bgf_freigeschaltet === true

  // Prüfe ob Firma existiert und User Zugriff hat
  const { data: org } = await serviceClient
    .from("organizations")
    .select("id, vertrag_lizenzen")
    .eq("id", orgId)
    .single()

  if (!org) return null

  // Admin hat Zugriff auf alle Firmen
  if (isAdmin) return { user, serviceClient, org, isAdmin: true }

  // BGF-Therapeut nur auf seine
  if (isBgf) {
    const { data: myOrg } = await serviceClient
      .from("organizations")
      .select("id")
      .eq("id", orgId)
      .eq("therapeut_id", user.id)
      .single()

    if (myOrg) return { user, serviceClient, org, isAdmin: false }
  }

  // HR-Admin für diese Organisation
  const { data: orgAdmin } = await serviceClient
    .from("organization_admins")
    .select("id, rolle")
    .eq("organization_id", orgId)
    .eq("user_id", user.id)
    .maybeSingle()

  if (orgAdmin) return { user, serviceClient, org, isAdmin: false }

  return null
}

// ── GET: Mitglieder einer Organisation ──────────────────────────────

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id: orgId } = await params

  if (!UUID_REGEX.test(orgId)) {
    return NextResponse.json({ error: "Ungültige Organisations-ID." }, { status: 400 })
  }

  const auth = await checkOrgAccess(orgId)
  if (!auth) {
    return NextResponse.json({ error: "Nicht autorisiert." }, { status: 401 })
  }

  const { searchParams } = new URL(request.url)
  const status = searchParams.get("status")
  const abteilung = searchParams.get("abteilung")
  const search = searchParams.get("search")

  let query = auth.serviceClient
    .from("organization_members")
    .select("*", { count: "exact" })
    .eq("organization_id", orgId)
    .order("nachname", { ascending: true })
    .order("vorname", { ascending: true })
    .limit(200)

  if (status) {
    query = query.eq("status", status)
  }
  if (abteilung) {
    query = query.eq("abteilung", abteilung)
  }
  if (search?.trim()) {
    const term = search.trim().replace(/%/g, "\\%").replace(/_/g, "\\_")
    query = query.or(
      `vorname.ilike.%${term}%,nachname.ilike.%${term}%,email.ilike.%${term}%`
    )
  }

  const { data, error, count } = await query

  if (error) {
    console.error("[GET /api/bgf/organizations/[id]/members] Supabase error:", error)
    return NextResponse.json(
      { error: "Mitglieder konnten nicht geladen werden." },
      { status: 500 }
    )
  }

  return NextResponse.json({
    members: data ?? [],
    totalCount: count ?? 0,
  })
}

// ── POST: Mitarbeiter freischalten (einzeln oder bulk) ──────────────

export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id: orgId } = await params

  if (!UUID_REGEX.test(orgId)) {
    return NextResponse.json({ error: "Ungültige Organisations-ID." }, { status: 400 })
  }

  const auth = await checkOrgAccess(orgId)
  if (!auth) {
    return NextResponse.json({ error: "Nicht autorisiert." }, { status: 401 })
  }

  let body: unknown
  try {
    body = await request.json()
  } catch {
    return NextResponse.json({ error: "Ungültiges JSON." }, { status: 400 })
  }

  // Prüfe ob Bulk oder Einzel
  const isBulk = body && typeof body === "object" && "members" in body

  if (isBulk) {
    // ── Bulk Import ───────────────────────────────────────────────
    const parseResult = bulkImportSchema.safeParse(body)
    if (!parseResult.success) {
      return NextResponse.json(
        {
          error: "Validierungsfehler.",
          details: parseResult.error.flatten().fieldErrors,
        },
        { status: 422 }
      )
    }

    // Lizenz-Check
    const { count: currentCount } = await auth.serviceClient
      .from("organization_members")
      .select("id", { count: "exact", head: true })
      .eq("organization_id", orgId)

    const remaining = auth.org.vertrag_lizenzen - (currentCount ?? 0)
    if (parseResult.data.members.length > remaining) {
      return NextResponse.json(
        {
          error: `Lizenzlimit erreicht. Verfügbar: ${remaining}, angefragt: ${parseResult.data.members.length}.`,
        },
        { status: 400 }
      )
    }

    const rows = parseResult.data.members.map((m) => ({
      organization_id: orgId,
      email: m.email.toLowerCase(),
      vorname: m.vorname?.trim() || null,
      nachname: m.nachname?.trim() || null,
      abteilung: m.abteilung?.trim() || null,
      arbeitsplatz_typ: m.arbeitsplatz_typ || "buero",
      status: "eingeladen" as const,
      freigeschaltet_am: new Date().toISOString(),
      freigeschaltet_von: auth.user.id,
    }))

    const { data: created, error: insertError } = await auth.serviceClient
      .from("organization_members")
      .upsert(rows, { onConflict: "organization_id,email", ignoreDuplicates: true })
      .select("id, email, vorname, nachname, status")

    if (insertError) {
      console.error("[POST /api/bgf/.../members] Bulk insert error:", insertError)
      return NextResponse.json(
        { error: "Import fehlgeschlagen." },
        { status: 500 }
      )
    }

    return NextResponse.json(
      {
        imported: created?.length ?? 0,
        members: created ?? [],
      },
      { status: 201 }
    )
  } else {
    // ── Einzelne Freischaltung ────────────────────────────────────
    const parseResult = addMemberSchema.safeParse(body)
    if (!parseResult.success) {
      return NextResponse.json(
        {
          error: "Validierungsfehler.",
          details: parseResult.error.flatten().fieldErrors,
        },
        { status: 422 }
      )
    }

    // Lizenz-Check
    const { count: currentCount } = await auth.serviceClient
      .from("organization_members")
      .select("id", { count: "exact", head: true })
      .eq("organization_id", orgId)

    if ((currentCount ?? 0) >= auth.org.vertrag_lizenzen) {
      return NextResponse.json(
        { error: `Lizenzlimit erreicht (${auth.org.vertrag_lizenzen}).` },
        { status: 400 }
      )
    }

    const m = parseResult.data
    const emailLower = m.email.toLowerCase()

    // Insert member record
    const { data: created, error: insertError } = await auth.serviceClient
      .from("organization_members")
      .insert({
        organization_id: orgId,
        email: emailLower,
        vorname: m.vorname?.trim() || null,
        nachname: m.nachname?.trim() || null,
        abteilung: m.abteilung?.trim() || null,
        arbeitsplatz_typ: m.arbeitsplatz_typ || "buero",
        status: "eingeladen",
        freigeschaltet_am: new Date().toISOString(),
        freigeschaltet_von: auth.user.id,
      })
      .select("id, email, vorname, nachname, status, invite_token")
      .single()

    if (insertError) {
      if (insertError.code === "23505") {
        return NextResponse.json(
          { error: "Diese E-Mail ist bereits freigeschaltet." },
          { status: 409 }
        )
      }
      console.error("[POST /api/bgf/.../members] Insert error:", insertError)
      return NextResponse.json(
        { error: "Mitarbeiter konnte nicht freigeschaltet werden." },
        { status: 500 }
      )
    }

    // Get org name for email
    const { data: orgData } = await auth.serviceClient
      .from("organizations")
      .select("name")
      .eq("id", orgId)
      .single()

    // Send invitation email
    const siteUrl = process.env.NEXT_PUBLIC_SITE_URL || "http://localhost:3000"
    const inviteLink = `${siteUrl}/bgf-invite/${created.invite_token}`
    const vorname = m.vorname?.trim() || ""
    const firmenName = orgData?.name || "Ihr Unternehmen"

    try {
      const nodemailer = await import("nodemailer")
      const transporter = nodemailer.createTransport({
        host: process.env.SMTP_HOST,
        port: parseInt(process.env.SMTP_PORT || "587"),
        secure: false,
        auth: {
          user: process.env.SMTP_USER,
          pass: process.env.SMTP_PASS,
        },
      })

      await transporter.sendMail({
        from: `"${process.env.EMAIL_FROM_NAME || "Praxis OS"}" <${process.env.SMTP_USER}>`,
        to: emailLower,
        subject: `${firmenName} — Ihr persönliches Gesundheitsprogramm wartet`,
        html: `
          <div style="font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; max-width: 600px; margin: 0 auto; padding: 40px 20px;">
            <div style="text-align: center; margin-bottom: 32px;">
              <h1 style="color: #1a1a2e; font-size: 24px; margin: 0;">Praxis OS <span style="color: #2D6A4F;">Gesundheit</span></h1>
            </div>

            <p style="color: #1a1a2e; font-size: 16px; line-height: 1.6;">
              ${vorname ? `Hallo ${vorname},` : "Hallo,"}
            </p>

            <p style="color: #4A5568; font-size: 15px; line-height: 1.6;">
              <strong>${firmenName}</strong> hat Sie für das betriebliche Gesundheitsprogramm freigeschaltet.
            </p>

            <p style="color: #4A5568; font-size: 15px; line-height: 1.6;">
              Was Sie erwartet:
            </p>
            <ul style="color: #4A5568; font-size: 14px; line-height: 1.8;">
              <li>Persönliche Gesundheitsanalyse (5 Minuten)</li>
              <li>Tägliche Pausen-Fit Routinen — individuell für Sie</li>
              <li>Ergonomie-Tipps für Ihren Arbeitsplatz</li>
              <li>Bei Bedarf: Zugang zu einem Therapeuten</li>
            </ul>

            <div style="text-align: center; margin: 32px 0;">
              <a href="${inviteLink}"
                 style="display: inline-block; background: #2D6A4F; color: white; text-decoration: none;
                        padding: 14px 32px; border-radius: 100px; font-weight: 600; font-size: 15px;">
                Jetzt registrieren & starten
              </a>
            </div>

            <p style="color: #8896A6; font-size: 13px; line-height: 1.6; text-align: center;">
              Ihre Gesundheitsdaten sind vertraulich und werden <strong>niemals</strong> an Ihren Arbeitgeber weitergegeben.
            </p>

            <hr style="border: none; border-top: 1px solid #E2DDD5; margin: 32px 0;" />
            <p style="color: #8896A6; font-size: 12px; text-align: center;">
              Praxis OS — Betriebliche Gesundheitsförderung<br>
              DSGVO-konform · EU-Server · Verschlüsselt
            </p>
          </div>
        `,
      })
    } catch (emailErr) {
      console.error("[POST /api/bgf/.../members] Email error:", emailErr)
    }

    return NextResponse.json(
      { member: created, invite_link: inviteLink },
      { status: 201 }
    )
  }
}

// ── PATCH: Mitarbeiter-Status ändern (pausieren/deaktivieren/reaktivieren) ──

const updateMemberSchema = z.object({
  member_id: z.string().uuid("Ungültige Member-ID."),
  status: z.enum(["aktiv", "pausiert", "deaktiviert"]),
})

export async function PATCH(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id: orgId } = await params

  if (!UUID_REGEX.test(orgId)) {
    return NextResponse.json({ error: "Ungültige Organisations-ID." }, { status: 400 })
  }

  const auth = await checkOrgAccess(orgId)
  if (!auth) {
    return NextResponse.json({ error: "Nicht autorisiert." }, { status: 401 })
  }

  let body: unknown
  try {
    body = await request.json()
  } catch {
    return NextResponse.json({ error: "Ungültiges JSON." }, { status: 400 })
  }

  const parseResult = updateMemberSchema.safeParse(body)
  if (!parseResult.success) {
    return NextResponse.json(
      { error: "Validierungsfehler.", details: parseResult.error.flatten().fieldErrors },
      { status: 422 }
    )
  }

  const { member_id, status } = parseResult.data

  const { data: updated, error: updateError } = await auth.serviceClient
    .from("organization_members")
    .update({ status })
    .eq("id", member_id)
    .eq("organization_id", orgId)
    .select("id, email, status")
    .single()

  if (updateError || !updated) {
    console.error("[PATCH /api/bgf/.../members] Update error:", updateError)
    return NextResponse.json(
      { error: "Status konnte nicht geändert werden." },
      { status: 500 }
    )
  }

  return NextResponse.json({ member: updated })
}
