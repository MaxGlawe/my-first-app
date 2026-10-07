/**
 * PROJ-29 — Kostenvoranschläge.
 *
 * GET  /api/os/kostenvoranschlag        — die letzten, für die Übersicht
 * POST /api/os/kostenvoranschlag        — einen neuen anlegen
 *
 * Bewusst OHNE Patientenkonto: Wer anruft und fragt, was das kostet, ist noch
 * kein Patient. Erst ein Konto anzulegen wäre genau die Hürde, die diese
 * Anfrage verhindert. Name und Anschrift stehen deshalb als Freitext hier und
 * nicht als Verweis auf `patients`.
 *
 * Ist der Empfänger doch schon Patient, kann `patient_id` mitgegeben werden —
 * verlangt wird sie nie.
 */

import { NextRequest, NextResponse } from "next/server"
import { z } from "zod"
import { createSupabaseServerClient } from "@/lib/supabase-server"
import { createSupabaseServiceClient } from "@/lib/supabase-service"
import { kostenvoranschlagAufstellung } from "@/lib/abrechnung/kostenvoranschlag"
import { PROGRAMM } from "@/lib/programm"

export const dynamic = "force-dynamic"

const STAFF = ["admin", "heilpraktiker", "physiotherapeut"]

async function requireStaff() {
  const supabase = await createSupabaseServerClient()
  const {
    data: { user },
  } = await supabase.auth.getUser()
  if (!user) return null

  const svc = createSupabaseServiceClient()
  const { data: profil } = await svc
    .from("user_profiles")
    .select("role")
    .eq("id", user.id)
    .maybeSingle()

  if (!profil || !STAFF.includes(profil.role as string)) return null
  return { user, svc }
}

export async function GET() {
  const auth = await requireStaff()
  if (!auth) return NextResponse.json({ error: "Nicht autorisiert." }, { status: 403 })

  const { data, error } = await auth.svc
    .from("kostenvoranschlaege")
    .select("id, nummer, empfaenger_name, variante, summe, gueltig_bis, created_at, versendet_at")
    .is("storniert_at", null)
    .order("created_at", { ascending: false })
    .limit(50)

  if (error) {
    console.error("[kostenvoranschlag] GET:", error)
    return NextResponse.json({ error: "Konnte nicht geladen werden." }, { status: 500 })
  }
  return NextResponse.json({ voranschlaege: data ?? [] })
}

const schema = z.object({
  empfaenger_name: z.string().trim().min(1, "Name fehlt.").max(200),
  empfaenger_anschrift: z.string().trim().max(500).optional().nullable(),
  empfaenger_geburtstag: z
    .string()
    .regex(/^\d{4}-\d{2}-\d{2}$/)
    .optional()
    .nullable(),
  diagnose: z.string().trim().max(500).optional().nullable(),
  variante: z.enum(["konsultation", "begleitet", "intensiv"]),
  /** Tage ab heute. Ohne Angabe dreissig. */
  gueltig_tage: z.number().int().min(1).max(365).optional().default(30),
  hinweis: z.string().trim().max(1000).optional().nullable(),
  patient_id: z.string().uuid().optional().nullable(),
})

export async function POST(request: NextRequest) {
  const auth = await requireStaff()
  if (!auth) return NextResponse.json({ error: "Nicht autorisiert." }, { status: 403 })

  const parsed = schema.safeParse(await request.json().catch(() => ({})))
  if (!parsed.success) {
    return NextResponse.json(
      { error: parsed.error.issues[0]?.message ?? "Ungültige Eingabe." },
      { status: 422 }
    )
  }
  const d = parsed.data

  const aufstellung = kostenvoranschlagAufstellung(d.variante)

  // Die Summe MUSS dem Listenpreis entsprechen. Weicht sie ab, stimmt etwas in
  // den Konstanten nicht — und dann darf kein Papier entstehen, auf dem ein
  // Preis steht, den der Patient spaeter nicht wiederfindet.
  if (aufstellung.summe !== aufstellung.listenpreis) {
    console.error(
      `[kostenvoranschlag] Summe ${aufstellung.summe} weicht vom Listenpreis ` +
        `${aufstellung.listenpreis} ab (${d.variante})`
    )
    return NextResponse.json(
      { error: "Die Aufstellung ergibt nicht den Listenpreis. Bitte den Entwickler informieren." },
      { status: 500 }
    )
  }

  const { data: praxis } = await auth.svc
    .from("praxis_settings")
    .select("praxis_name, strasse, plz, ort, steuernummer")
    .limit(1)
    .maybeSingle()

  const { data: nummer } = await auth.svc.rpc("generate_kv_number")
  if (!nummer) {
    return NextResponse.json({ error: "Nummer konnte nicht erzeugt werden." }, { status: 500 })
  }

  const gueltigBis = new Date(Date.now() + d.gueltig_tage * 86_400_000)

  const { data: angelegt, error } = await auth.svc
    .from("kostenvoranschlaege")
    .insert({
      nummer: nummer as string,
      created_by: auth.user.id,
      empfaenger_name: d.empfaenger_name,
      empfaenger_anschrift: d.empfaenger_anschrift || null,
      empfaenger_geburtstag: d.empfaenger_geburtstag || null,
      patient_id: d.patient_id || null,
      diagnose: d.diagnose || null,
      variante: d.variante,
      positionen: aufstellung.positionen,
      summe: aufstellung.summe,
      gueltig_bis: gueltigBis.toISOString().split("T")[0],
      hinweis:
        d.hinweis ||
        `Die Behandlung erfolgt als Fernbehandlung über die Videosprechstunde. ` +
          `Der Betreuungszeitraum beträgt ${PROGRAMM.tage} Tage ab Programmstart. ` +
          `Heilkundliche Leistung, umsatzsteuerfrei nach § 4 Nr. 14a UStG.`,
      praxis_name: praxis?.praxis_name ?? null,
      praxis_adresse: `${praxis?.strasse ?? ""}\n${praxis?.plz ?? ""} ${praxis?.ort ?? ""}`.trim(),
      praxis_steuernr: praxis?.steuernummer ?? null,
    })
    .select("id, nummer, summe")
    .single()

  if (error || !angelegt) {
    console.error("[kostenvoranschlag] Anlegen:", error?.message)
    return NextResponse.json({ error: "Konnte nicht angelegt werden." }, { status: 500 })
  }

  return NextResponse.json({
    id: angelegt.id,
    nummer: angelegt.nummer,
    summe: Number(angelegt.summe),
    pdf_url: `/api/os/kostenvoranschlag/${angelegt.id}/pdf`,
  })
}
