/**
 * PROJ-29 — POST /api/os/kostenvoranschlag/[id]/send
 *
 * Schickt den Kostenvoranschlag als PDF an den Empfänger.
 *
 * Die Adresse kommt entweder aus dem Datensatz oder wird hier mitgegeben —
 * zum Nachsenden an jemanden, der beim Anlegen noch keine genannt hatte. Wird
 * eine neue übergeben, bleibt sie am Voranschlag stehen: Sonst wüsste man beim
 * nächsten Mal wieder nicht, wohin er ging.
 *
 * `versendet_at` wird erst NACH erfolgreichem Versand gesetzt. Ein Zeitstempel
 * auf einem Beleg, der nie ankam, ist schlimmer als gar keiner — er verhindert
 * das Nachfassen.
 */

import { NextRequest, NextResponse } from "next/server"
import { z } from "zod"
import { createSupabaseServerClient } from "@/lib/supabase-server"
import { createSupabaseServiceClient } from "@/lib/supabase-service"
import { generateInvoicePdf } from "@/lib/pdf/invoice-pdf"
import { sendEmail, kopieAdresse } from "@/lib/email"
import { kostenvoranschlagEmail } from "@/lib/email-templates/kostenvoranschlag"
import { kostenvoranschlagAlsBeleg, variantenName } from "@/lib/billing/kostenvoranschlag-beleg"
import type { PraxisSettings } from "@/types/billing"

export const dynamic = "force-dynamic"

const STAFF = ["admin", "heilpraktiker", "physiotherapeut"]

const schema = z.object({
  email: z.string().trim().email("Das ist keine gültige E-Mail-Adresse.").optional(),
})

export async function POST(request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params
  if (!id || !/^[0-9a-f-]{36}$/i.test(id)) {
    return NextResponse.json({ error: "Ungültige ID." }, { status: 400 })
  }

  const supabase = await createSupabaseServerClient()
  const {
    data: { user },
  } = await supabase.auth.getUser()
  if (!user) return NextResponse.json({ error: "Nicht autorisiert." }, { status: 401 })

  const svc = createSupabaseServiceClient()
  const { data: profil } = await svc
    .from("user_profiles")
    .select("role, first_name, last_name")
    .eq("id", user.id)
    .maybeSingle()
  if (!profil || !STAFF.includes(profil.role as string)) {
    return NextResponse.json({ error: "Keine Berechtigung." }, { status: 403 })
  }

  const parsed = schema.safeParse(await request.json().catch(() => ({})))
  if (!parsed.success) {
    return NextResponse.json(
      { error: parsed.error.issues[0]?.message ?? "Ungültige Eingabe." },
      { status: 422 }
    )
  }

  const { data: kv } = await svc
    .from("kostenvoranschlaege")
    .select("*")
    .eq("id", id)
    .maybeSingle()

  if (!kv) return NextResponse.json({ error: "Nicht gefunden." }, { status: 404 })
  if (kv.storniert_at) {
    return NextResponse.json({ error: "Dieser Voranschlag ist storniert." }, { status: 400 })
  }

  const adresse = parsed.data.email || (kv.empfaenger_email as string | null)
  if (!adresse) {
    return NextResponse.json(
      { error: "Für diesen Voranschlag ist keine E-Mail-Adresse hinterlegt." },
      { status: 422 }
    )
  }

  const { data: praxis } = await svc.from("praxis_settings").select("*").limit(1).maybeSingle()
  if (!praxis) {
    return NextResponse.json({ error: "Praxis-Einstellungen fehlen." }, { status: 500 })
  }

  let pdf: ArrayBuffer
  try {
    pdf = await generateInvoicePdf(
      kostenvoranschlagAlsBeleg(kv, praxis as PraxisSettings),
      praxis as PraxisSettings
    )
  } catch (err) {
    console.error("[kostenvoranschlag/send] PDF:", err)
    return NextResponse.json({ error: "Das PDF konnte nicht erstellt werden." }, { status: 500 })
  }

  const mail = kostenvoranschlagEmail({
    empfaengerName: kv.empfaenger_name as string,
    nummer: kv.nummer as string,
    summe: Number(kv.summe),
    gueltigBis: (kv.gueltig_bis as string) ?? null,
    diagnose: (kv.diagnose as string) ?? null,
    variantenName: variantenName(kv.variante as string | null),
    praxisName: (kv.praxis_name as string) ?? praxis.praxis_name,
    behandlerName:
      [profil.first_name, profil.last_name].filter(Boolean).join(" ") || praxis.inhaber_name,
    praxisTelefon: praxis.telefon,
    praxisEmail: praxis.email,
  })

  const res = await sendEmail({
    to: adresse,
    // Stille Kopie an die Praxis: der Beleg, dass sie rausgegangen ist.
    bcc: kopieAdresse(praxis.email),
    subject: mail.subject,
    html: mail.html,
    text: mail.text,
    attachments: [
      {
        filename: `Kostenvoranschlag_${kv.nummer}.pdf`,
        content: Buffer.from(pdf),
      },
    ],
  })

  if (!res.success) {
    return NextResponse.json(
      { error: res.error ?? "Die E-Mail konnte nicht versendet werden." },
      { status: 502 }
    )
  }

  await svc
    .from("kostenvoranschlaege")
    .update({ versendet_at: new Date().toISOString(), empfaenger_email: adresse })
    .eq("id", id)

  return NextResponse.json({ ok: true, an: adresse })
}
