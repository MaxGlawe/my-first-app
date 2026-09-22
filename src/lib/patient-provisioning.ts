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

/**
 * Generiert einen Supabase-Magiclink (→ /meine-termine) und mailt ihn dem Patienten.
 *
 * PROJ-26: Das ist der ERSTE Kontakt mit Praxis OS nach der Buchung der
 * Videokonsultation — nicht die Ankündigung einer Terminverwaltung. Die Mail
 * bereitet auf das Gespräch vor (Ablauf, Eignungsprüfung, was bereitliegen
 * sollte) und liefert den Zugang nebenbei mit.
 *
 * HWG: reiner Ablauf, keine Wirkungs- oder Heilaussage. Kein Preis, kein
 * Verkauf — das Programm wird im Gespräch besprochen, nicht per Mail.
 */
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

  // Marken-Token des Premium-Rebrands (Paper/Ink/Green/Sand, Georgia-Serif).
  // Bewusst inline und ohne cid-Logo: diese Mail läuft über sendEmail(), das
  // keine Inline-Anhänge mitschickt.
  const PAPER = "#F8F5F0", CARD = "#FFFFFF", INK = "#0f172a", BODY = "#334155"
  const MUTED = "#64748b", FAINT = "#94a3b8", LINE = "#e7e1d6", GREEN = "#2C3E2D"
  const SERIF = "Georgia,'Times New Roman',serif"
  const SANS = "-apple-system,BlinkMacSystemFont,'Segoe UI',Roboto,sans-serif"

  const punkte = [
    "Was deine Beschwerden auslöst und wo du gerade stehst",
    "Ob sich dein Beschwerdebild aus der Ferne sinnvoll betreuen lässt",
    "Wie eine Betreuung über Praxis OS in deinem Fall konkret aussehen würde",
  ]

  await sendEmail({
    to: args.email,
    subject: "Deine Videokonsultation — Ablauf und dein Zugang",
    html: `
<!DOCTYPE html>
<html lang="de"><head><meta charset="utf-8" /><meta name="viewport" content="width=device-width, initial-scale=1" /></head>
<body style="margin:0;padding:0;background:${PAPER};">
  <div style="background:${PAPER};padding:32px 16px;font-family:${SANS};">
    <div style="max-width:560px;margin:0 auto;background:${CARD};border:1px solid ${LINE};border-radius:18px;overflow:hidden;">
      <div style="height:4px;background:${GREEN};"></div>

      <div style="padding:26px 32px 0;">
        <span style="font-weight:600;font-size:15px;color:${INK};">Praxis OS</span>
        <span style="margin-left:6px;font-size:12px;color:${FAINT};">· Therapeut für die Hosentasche</span>
      </div>

      <div style="padding:10px 32px 28px;">
        <h1 style="font-family:${SERIF};font-weight:600;font-size:23px;line-height:1.25;color:${GREEN};margin:18px 0 14px;">
          Deine Videokonsultation steht
        </h1>

        <p style="font-size:15px;line-height:1.65;color:${BODY};margin:0 0 16px;">Hallo ${name},</p>
        <p style="font-size:15px;line-height:1.65;color:${BODY};margin:0 0 16px;">
          dein Termin ist gebucht — 30 Minuten, per Video, ohne Praxisbesuch. Damit wir die Zeit
          gut nutzen, hier vorab das Wichtigste.
        </p>

        <h2 style="font-family:${SERIF};font-weight:600;font-size:17px;color:${INK};margin:26px 0 10px;">
          Worum es in den 30 Minuten geht
        </h2>
        <table cellpadding="0" cellspacing="0" border="0" style="width:100%;">
          ${punkte
            .map(
              (p) => `<tr>
            <td valign="top" style="width:16px;padding:0 0 10px;">
              <div style="width:6px;height:6px;border-radius:50%;background:${GREEN};margin-top:8px;"></div>
            </td>
            <td style="font-size:15px;line-height:1.6;color:${BODY};padding:0 0 10px;">${p}</td>
          </tr>`
            )
            .join("")}
        </table>

        <div style="margin:22px 0 0;padding:16px 18px;background:${PAPER};border:1px solid ${LINE};border-radius:12px;">
          <p style="margin:0 0 6px;font-size:14px;font-weight:700;color:${INK};">Leg dir kurz bereit</p>
          <p style="margin:0;font-size:14px;line-height:1.6;color:${MUTED};">
            Vorhandene Befunde oder Bildgebung, deine aktuellen Medikamente — und einen Platz, an
            dem du dich frei bewegen kannst.
          </p>
        </div>

        <h2 style="font-family:${SERIF};font-weight:600;font-size:17px;color:${INK};margin:28px 0 10px;">
          Dein Zugang
        </h2>
        <p style="font-size:15px;line-height:1.65;color:${BODY};margin:0 0 18px;">
          Über den Link siehst du deinen Termin und kannst ihn selbst umbuchen oder stornieren —
          ohne Passwort, ein Klick genügt.
        </p>
        <div style="margin:0 0 22px;">
          <a href="${link}" style="display:inline-block;background:${GREEN};color:#ffffff;text-decoration:none;font-weight:700;font-size:15px;padding:15px 28px;border-radius:12px;">
            Zu meinem Termin &rarr;
          </a>
        </div>
        <p style="font-size:13px;line-height:1.6;color:${FAINT};margin:0 0 20px;">
          Der Link ist persönlich und nur begrenzte Zeit gültig. Wenn du ihn nicht angefordert
          hast, ignoriere diese Mail einfach.
        </p>

        <p style="font-size:15px;line-height:1.65;color:${BODY};margin:8px 0 0;">
          Bis bald<br/>Max Glawe<br/><span style="color:${FAINT};">Praxis OS</span>
        </p>
      </div>

      <div style="padding:18px 32px 24px;border-top:1px solid ${LINE};background:#FCFAF6;">
        <p style="margin:0;font-size:12px;line-height:1.6;color:${FAINT};">
          Praxis OS ist ein Angebot von Max Glawe, Heilpraktiker für Physiotherapie.
          Bei akuten Notfällen wende dich bitte an den ärztlichen Notdienst oder die 112.
        </p>
        <p style="margin:10px 0 0;font-size:12px;color:${FAINT};">
          <a href="${appUrl}/impressum" style="color:${MUTED};text-decoration:underline;">Impressum</a>
          &nbsp;·&nbsp;
          <a href="${appUrl}/datenschutz" style="color:${MUTED};text-decoration:underline;">Datenschutz</a>
        </p>
      </div>
    </div>
  </div>
</body></html>`,
  })
}
