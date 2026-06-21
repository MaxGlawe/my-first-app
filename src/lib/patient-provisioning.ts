/**
 * PROJ-34 / Phase 1: Login-Provisionierung für Buchungstool-Patienten.
 *
 * Wenn über den Booking-Webhook ein Patient angelegt wird, bekommt er hier ein
 * echtes (login-fähiges) Praxis-OS-Patientenkonto — passwortlos, Zugang via
 * Supabase-Magiclink. Das Konto startet im gesperrten "Termine-only"-Zustand:
 * `app_metadata.account_origin = 'booking'` markiert es, die Paywall in
 * `supabase-middleware.ts` sperrt alles außer dem Termin-Bereich, bis der Patient
 * selbst ein Abo abschließt (PROJ-34 Komponente 5).
 *
 * Spiegelt das Muster aus `src/app/api/buyer-accounts/route.ts` (admin.createUser
 * + user_profiles) und `src/app/api/shop/resend-access` (generateLink).
 */
import { createSupabaseServiceClient } from "@/lib/supabase-service"
import { sendEmail } from "@/lib/email"
import { escapeHtml } from "@/lib/html-escape"

type ServiceClient = ReturnType<typeof createSupabaseServiceClient>

const STAFF_ROLES = new Set([
  "admin",
  "heilpraktiker",
  "physiotherapeut",
  "praeventionstrainer",
  "personal_trainer",
  "praxismanagement",
])

export type ProvisionResult =
  | { status: "created"; userId: string }
  | { status: "linked"; userId: string }
  | { status: "skipped_staff"; userId: string }
  | { status: "error"; error: string }

/**
 * Stellt sicher, dass der Patient (`patientId`) ein login-fähiges Konto hat und
 * `patients.user_id` gesetzt ist. Idempotent. Legt NUR bei wirklich neuem Login
 * ein Konto an (markiert es als account_origin='booking'); verknüpft sonst nur.
 * Sendet bei Neu-Anlage eine einmalige Zugangsmail mit Magiclink.
 */
export async function ensurePatientLogin(
  supabase: ServiceClient,
  args: { patientId: string; email: string; firstName?: string | null; lastName?: string | null }
): Promise<ProvisionResult> {
  const email = args.email.trim().toLowerCase()
  const firstName = args.firstName?.trim() || "Patient"
  const lastName = args.lastName?.trim() || ""

  // 1) Existiert bereits ein Auth-User/Profil mit dieser E-Mail?
  const { data: existingProfile } = await supabase
    .from("user_profiles")
    .select("id, role")
    .ilike("email", email)
    .maybeSingle()

  if (existingProfile) {
    // Mitarbeiter-Account → nichts anfassen.
    if (STAFF_ROLES.has(existingProfile.role)) {
      return { status: "skipped_staff", userId: existingProfile.id }
    }
    // Patient/externer Käufer → nur user_id verknüpfen (kein Zweitkonto, keine Mail).
    await supabase
      .from("patients")
      .update({ user_id: existingProfile.id })
      .eq("id", args.patientId)
      .is("user_id", null)
    return { status: "linked", userId: existingProfile.id }
  }

  // 2) Neuen passwortlosen Login anlegen (auto-confirmed, kein Passwort-Versand).
  const { data: authData, error: createError } = await supabase.auth.admin.createUser({
    email,
    email_confirm: true,
    app_metadata: { account_origin: "booking" }, // ← Paywall-Marker (nicht user-editierbar)
    user_metadata: { first_name: firstName, last_name: lastName, role: "patient" },
  })
  if (createError || !authData?.user) {
    return { status: "error", error: createError?.message ?? "createUser fehlgeschlagen" }
  }
  const userId = authData.user.id

  // user_profiles defensiv sicherstellen (ein Trigger legt die Zeile i.d.R. an).
  const { error: profileError } = await supabase
    .from("user_profiles")
    .update({ email, role: "patient", status: "aktiv", first_name: firstName, last_name: lastName })
    .eq("id", userId)
  if (profileError) {
    try { await supabase.auth.admin.deleteUser(userId) } catch {}
    return { status: "error", error: `user_profiles: ${profileError.message}` }
  }

  // patients.user_id verknüpfen.
  const { error: linkError } = await supabase
    .from("patients")
    .update({ user_id: userId })
    .eq("id", args.patientId)
  if (linkError) {
    return { status: "error", error: `patients.user_id: ${linkError.message}` }
  }

  // Einmalige Zugangsmail (fire-and-forget) — Magiclink direkt in den Termin-Bereich.
  void sendPatientAccessMail(supabase, { email, firstName }).catch((err) =>
    console.error("[PROJ-34] Zugangsmail fehlgeschlagen:", err)
  )

  return { status: "created", userId }
}

/** Generiert einen Supabase-Magiclink (→ /app/termine) und mailt ihn dem Patienten. */
export async function sendPatientAccessMail(
  supabase: ServiceClient,
  args: { email: string; firstName: string }
): Promise<void> {
  const appUrl = process.env.NEXT_PUBLIC_SITE_URL ?? "https://wwwpraxis-os.com"
  const { data, error } = await supabase.auth.admin.generateLink({
    type: "magiclink",
    email: args.email,
    options: { redirectTo: `${appUrl}/meine-termine` },
  })
  if (error || !data?.properties?.action_link) {
    throw new Error(error?.message ?? "generateLink lieferte keinen action_link")
  }
  const link = data.properties.action_link
  const name = escapeHtml(args.firstName)

  await sendEmail({
    to: args.email,
    subject: "Deine Termine sind jetzt in Praxis OS",
    html: `
<!DOCTYPE html>
<html lang="de"><head><meta charset="utf-8" /><meta name="viewport" content="width=device-width, initial-scale=1" /></head>
<body style="margin:0;padding:0;background:#f1f5f9;">
  <div style="font-family:-apple-system,BlinkMacSystemFont,'Segoe UI',Roboto,sans-serif;max-width:560px;margin:0 auto;padding:24px 16px;">
    <div style="background:#ecfdf5;border:1px solid #e2e8f0;border-bottom:none;border-radius:16px 16px 0 0;padding:32px;">
      <p style="color:#059669;font-size:12px;font-weight:700;letter-spacing:2px;text-transform:uppercase;margin:0 0 8px;">Praxis OS · Termine</p>
      <h1 style="color:#0f172a;font-size:23px;font-weight:700;margin:0;">Deine Termine an einem Ort</h1>
    </div>
    <div style="background:#fff;padding:32px;border:1px solid #e2e8f0;border-top:none;">
      <p style="font-size:16px;color:#1e293b;margin:0 0 16px;line-height:1.6;">Hallo ${name},</p>
      <p style="font-size:15px;color:#475569;margin:0 0 24px;line-height:1.7;">
        ab sofort kannst du deine Physiotherapie-Termine direkt in Praxis OS sehen — und schon bald
        selbst umbuchen oder stornieren. Mit einem Klick bist du drin, ganz ohne Passwort:
      </p>
      <div style="text-align:center;margin:0 0 28px;">
        <a href="${link}" style="display:inline-block;background:#059669;color:#fff;padding:14px 36px;border-radius:12px;text-decoration:none;font-weight:600;font-size:15px;">Meine Termine ansehen &rarr;</a>
      </div>
      <p style="font-size:13px;color:#94a3b8;margin:0;line-height:1.7;">Der Link ist persönlich und nur eine begrenzte Zeit gültig. Wenn du ihn nicht angefordert hast, ignoriere diese Mail einfach.</p>
    </div>
    <div style="background:#f8fafc;border-radius:0 0 16px 16px;padding:18px 32px;text-align:center;border:1px solid #e2e8f0;border-top:none;">
      <p style="font-size:12px;color:#94a3b8;margin:0;">Physiotherapie Glawe — Praxis OS</p>
    </div>
  </div>
</body></html>`,
  })
}
