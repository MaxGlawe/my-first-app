/**
 * PROJ-27 — Sprechzimmer, Therapeutenseite.
 *
 * GET   /api/os/video-calls?patient_id=…  — Gespräche eines Patienten
 * POST  /api/os/video-calls               — Gespräch eröffnen
 * PATCH /api/os/video-calls               — Gespräch beenden
 *
 * Eröffnet wird immer vom Behandler. Der Patient tritt bei, er lädt nicht
 * ein — sonst könnte sich jeder selbst einen Termin geben, und die
 * Eignungsprüfung am Anfang des Programms wäre eine Formalie.
 */

import { NextRequest, NextResponse } from "next/server"
import { z } from "zod"
import { createSupabaseServerClient } from "@/lib/supabase-server"
import { createSupabaseServiceClient } from "@/lib/supabase-service"
import { sendPushToPatient } from "@/lib/push"
import { videoAnbieter } from "@/lib/video/livekit"
import { ANLASS_TEXT, videoEingerichtet } from "@/lib/video"
import QRCode from "qrcode"
import { sendEmail } from "@/lib/email"
import { sprechzimmerEinladung } from "@/lib/email-templates/sprechzimmer-einladung"
import { sendeEinladung } from "@/lib/video/einladung"
import {
  oeffnetAm,
  schliesstAm,
  kalendereintrag,
  zutrittOffen,
  formatDatum,
  formatUhrzeit,
} from "@/lib/video/termin"

const STAFF_ROLES = ["admin", "heilpraktiker", "physiotherapeut"]

const anlegenSchema = z.object({
  patient_id: z.string().uuid(),
  anlass: z.enum(["konsultation", "programm_sitzung", "verschlechterung", "sonstiges"]),
  /** Geplanter Beginn, ISO. Darf auch „jetzt" sein — dann ist es ein Sofort-Termin. */
  geplant_at: z.string().datetime({ offset: true }),
  dauer_minuten: z.number().int().min(10).max(180).default(30),
  /** Was der Patient vorbereiten soll — landet in der Einladung. */
  hinweis: z.string().trim().max(500).optional().nullable(),
  verschlechterung_id: z.string().uuid().optional().nullable(),
  /** Einladung sofort verschicken? */
  einladen: z.boolean().default(true),
})

const patchSchema = z.object({
  id: z.string().uuid(),
  aktion: z.enum(["beenden", "einladung", "absagen", "notiz"]).default("beenden"),
  notiz: z.string().trim().max(4000).optional().nullable(),
  grund: z.string().trim().max(500).optional().nullable(),
})

/** QR serverseitig erzeugen — im Call zaehlt, dass das Bild sofort da ist. */
async function qrFor(url: string): Promise<string | null> {
  try {
    return await QRCode.toDataURL(url, {
      width: 512,
      margin: 1,
      color: { dark: "#2C3E2D", light: "#FFFFFF" },
    })
  } catch (err) {
    console.error("[os/video-calls] QR fehlgeschlagen:", err)
    return null
  }
}

async function requireStaff() {
  const supabase = await createSupabaseServerClient()
  const {
    data: { user },
  } = await supabase.auth.getUser()
  if (!user) return null

  const svc = createSupabaseServiceClient()
  const { data: profile } = await svc
    .from("user_profiles")
    .select("role, first_name, last_name")
    .eq("id", user.id)
    .single()

  if (!profile || !STAFF_ROLES.includes(profile.role)) return null
  return { user, svc, profile }
}

// ── GET ─────────────────────────────────────────────────────────────────────

export async function GET(request: NextRequest) {
  const auth = await requireStaff()
  if (!auth) return NextResponse.json({ error: "Nicht autorisiert." }, { status: 403 })

  const patientId = request.nextUrl.searchParams.get("patient_id")

  // Ohne patient_id: die Uebersicht der digitalen Sprechstunde. Alles, was
  // noch aussteht oder gerade lief — der Blick, mit dem der Behandler seinen
  // Tag beginnt.
  if (!patientId) {
    const grenze = new Date(Date.now() - 6 * 60 * 60_000).toISOString()
    const { data, error } = await auth.svc
      .from("video_calls")
      .select(
        "id, patient_id, gast_token, anlass, status, geplant_at, dauer_minuten, oeffnet_at, schliesst_at, hinweis, einladung_gesendet_at, abgesagt_at, patients(vorname, nachname, email)"
      )
      .gte("geplant_at", grenze)
      .not("status", "in", "(abgesagt)")
      .order("geplant_at", { ascending: true })
      .limit(200)

    if (error) {
      console.error("[os/video-calls] Uebersicht:", error)
      return NextResponse.json({ error: "Konnte nicht geladen werden." }, { status: 500 })
    }

    const siteUrl = process.env.NEXT_PUBLIC_SITE_URL || "https://wwwpraxis-os.com"
    return NextResponse.json({
      eingerichtet: videoEingerichtet(),
      termine: (data ?? []).map((c) => ({
        ...c,
        gast_url: `${siteUrl}/sprechzimmer/${c.gast_token}`,
      })),
    })
  }

  const { data, error } = await auth.svc
    .from("video_calls")
    .select(
      "id, room_name, gast_token, anlass, status, geplant_at, dauer_minuten, oeffnet_at, schliesst_at, begonnen_at, beendet_at, notiz, hinweis, einladung_gesendet_at, created_at"
    )
    .eq("patient_id", patientId)
    .order("created_at", { ascending: false })
    .limit(20)

  if (error) {
    console.error("[os/video-calls] GET:", error)
    return NextResponse.json({ error: "Konnte nicht geladen werden." }, { status: 500 })
  }

  const calls = data ?? []

  // „Aktiv" heisst: im Zutrittsfenster und nicht abgeschlossen — eine Frage
  // der Uhrzeit, nicht des Status (siehe zutrittOffen).
  const aktiv = calls.find((c) => zutrittOffen(c)) ?? null

  // Der Gast-Link ist der verlässliche Weg zum Patienten. Push funktioniert
  // nur bei installierter App und erteilter Erlaubnis — im Praxistest am
  // 23.09.2026 existierte im ganzen System genau eine solche Anmeldung.
  // Darauf als einzigen Weg zu bauen, war ein Fehler.
  let gastUrl: string | null = null
  let qr: string | null = null
  if (aktiv) {
    const siteUrl = process.env.NEXT_PUBLIC_SITE_URL || "https://wwwpraxis-os.com"
    gastUrl = `${siteUrl}/sprechzimmer/${aktiv.gast_token}`
    qr = await qrFor(gastUrl)
  }

  return NextResponse.json({
    eingerichtet: videoEingerichtet(),
    aktiv: aktiv ? { ...aktiv, gast_url: gastUrl, qr_data_url: qr } : null,
    calls,
  })
}

// ── POST ────────────────────────────────────────────────────────────────────

export async function POST(request: NextRequest) {
  const auth = await requireStaff()
  if (!auth) return NextResponse.json({ error: "Nicht autorisiert." }, { status: 403 })

  if (!videoEingerichtet()) {
    return NextResponse.json(
      { error: "Der Videodienst ist auf diesem Server nicht eingerichtet." },
      { status: 503 }
    )
  }

  let body: unknown
  try {
    body = await request.json()
  } catch {
    return NextResponse.json({ error: "Ungültiges JSON." }, { status: 400 })
  }

  const parsed = anlegenSchema.safeParse(body)
  if (!parsed.success) {
    return NextResponse.json(
      { error: "Validierungsfehler.", details: parsed.error.flatten().fieldErrors },
      { status: 400 }
    )
  }
  const { patient_id, anlass, geplant_at, dauer_minuten, hinweis, verschlechterung_id, einladen } =
    parsed.data

  const { data: patient } = await auth.svc
    .from("patients")
    .select("id, vorname, nachname, email")
    .eq("id", patient_id)
    .maybeSingle()

  if (!patient) {
    return NextResponse.json({ error: "Patient nicht gefunden." }, { status: 404 })
  }

  // Zutrittsfenster aus der geplanten Zeit. Gespeichert und nicht gerechnet:
  // Wann jemand hineindurfte, muss nachvollziehbar bleiben, auch wenn sich
  // die Regel im Code spaeter aendert.
  const oeffnet = oeffnetAm(geplant_at)
  const schliesst = schliesstAm(geplant_at, dauer_minuten)

  // Laufenden Programm-Vertrag mitschreiben, falls vorhanden — nie Pflicht.
  const { data: vertrag } = await auth.svc
    .from("treatment_contracts")
    .select("id")
    .eq("patient_id", patient_id)
    .eq("contract_type", "praxis_os_programm")
    .not("paid_at", "is", null)
    .order("paid_at", { ascending: false })
    .limit(1)
    .maybeSingle()

  const { data: call, error } = await auth.svc
    .from("video_calls")
    .insert({
      patient_id,
      therapist_id: auth.user.id,
      anlass,
      geplant_at,
      dauer_minuten,
      hinweis: hinweis || null,
      verschlechterung_id: verschlechterung_id ?? null,
      contract_id: vertrag?.id ?? null,
      oeffnet_at: oeffnet.toISOString(),
      schliesst_at: schliesst.toISOString(),
      status: "geplant",
    })
    .select(
      "id, room_name, gast_token, anlass, status, geplant_at, dauer_minuten, oeffnet_at, schliesst_at, hinweis"
    )
    .single()

  if (error || !call) {
    console.error("[os/video-calls] POST:", error)
    return NextResponse.json({ error: "Termin konnte nicht angelegt werden." }, { status: 500 })
  }

  const siteUrl = process.env.NEXT_PUBLIC_SITE_URL || "https://wwwpraxis-os.com"
  const gastUrl = `${siteUrl}/sprechzimmer/${call.gast_token}`

  // ── Einladung ────────────────────────────────────────────────────────────
  // Scheitert sie, bleibt der Termin trotzdem bestehen und die Oberflaeche
  // sagt es. Ein Termin ohne Mail laesst sich nachtraeglich verschicken; ein
  // verlorener Termin waere schlimmer.
  let einladungFehler: string | null = null
  if (einladen) {
    const behandlerName =
      [auth.profile.first_name, auth.profile.last_name].filter(Boolean).join(" ") ||
      "Dein Behandler"
    const versand = await sendeEinladung({
      svc: auth.svc,
      termin: {
        id: call.id,
        gast_token: call.gast_token,
        geplant_at: geplant_at,
        dauer_minuten: dauer_minuten,
        hinweis: hinweis || null,
      },
      patient,
      behandlerName,
    })
    if (!versand.ok) einladungFehler = versand.fehler ?? "Die Einladung konnte nicht verschickt werden."
  }

  return NextResponse.json(
    {
      call: { ...call, gast_url: gastUrl, qr_data_url: await qrFor(gastUrl) },
      einladungGesendet: einladen && !einladungFehler,
      einladungFehler,
    },
    { status: 201 }
  )
}

// ── PATCH ───────────────────────────────────────────────────────────

export async function PATCH(request: NextRequest) {
  const auth = await requireStaff()
  if (!auth) return NextResponse.json({ error: "Nicht autorisiert." }, { status: 403 })

  let body: unknown
  try {
    body = await request.json()
  } catch {
    return NextResponse.json({ error: "Ungültiges JSON." }, { status: 400 })
  }

  const parsed = patchSchema.safeParse(body)
  if (!parsed.success) {
    return NextResponse.json({ error: "Validierungsfehler." }, { status: 400 })
  }
  const { id, aktion, notiz, grund } = parsed.data

  const { data: call } = await auth.svc
    .from("video_calls")
    .select(
      "id, room_name, gast_token, patient_id, anlass, status, geplant_at, dauer_minuten, hinweis"
    )
    .eq("id", id)
    .maybeSingle()

  if (!call) {
    return NextResponse.json({ error: "Termin nicht gefunden." }, { status: 404 })
  }

  const siteUrl = process.env.NEXT_PUBLIC_SITE_URL || "https://wwwpraxis-os.com"
  const gastUrl = `${siteUrl}/sprechzimmer/${call.gast_token}`

  // ── Einladung (erneut) verschicken ────────────────────────────────
  if (aktion === "einladung") {
    const { data: patient } = await auth.svc
      .from("patients")
      .select("vorname, email")
      .eq("id", call.patient_id)
      .maybeSingle()

    if (!patient?.email) {
      return NextResponse.json(
        { error: "Der Patient hat keine E-Mail-Adresse hinterlegt." },
        { status: 400 }
      )
    }

    const { data: praxis } = await auth.svc
      .from("praxis_settings")
      .select("praxis_name, email")
      .limit(1)
      .maybeSingle()

    const behandlerName =
      [auth.profile.first_name, auth.profile.last_name].filter(Boolean).join(" ") ||
      "Dein Behandler"

    const mail = sprechzimmerEinladung({
      vorname: patient.vorname || "",
      geplantAt: call.geplant_at,
      dauerMinuten: call.dauer_minuten,
      beitrittsUrl: gastUrl,
      behandlerName,
      praxisName: praxis?.praxis_name ?? "Physiotherapie Glawe",
      siteUrl,
      hinweis: call.hinweis,
    })

    const ics = kalendereintrag({
      uid: call.id,
      geplantAt: call.geplant_at,
      dauerMinuten: call.dauer_minuten,
      titel: "Video-Sprechstunde",
      beschreibung: `Zum Sprechzimmer: ${gastUrl}`,
      url: gastUrl,
      organisator: behandlerName,
      organisatorEmail: praxis?.email || process.env.SMTP_USER || "info@wwwpraxis-os.com",
    })

    const res = await sendEmail({
      to: patient.email,
      subject: mail.subject,
      html: mail.html,
      attachments: [{ filename: "Videotermin.ics", content: Buffer.from(ics, "utf-8") }],
    })

    if (!res.success) {
      return NextResponse.json(
        { error: res.error ?? "Die Einladung konnte nicht verschickt werden." },
        { status: 502 }
      )
    }

    await auth.svc
      .from("video_calls")
      .update({ einladung_gesendet_at: new Date().toISOString() })
      .eq("id", id)

    return NextResponse.json({ gesendet: true })
  }

  // ── Notiz sichern, ohne zu beenden ───────────────────────────
  //
  // Die Schaltzentrale (PROJ-28) sichert still waehrend des Gespraechs. Ein
  // Speichern-Knopf waere einer, den jemand vergisst, waehrend er zuhoert —
  // und der Text waere weg, sobald der Raum zugeht.
  if (aktion === "notiz") {
    const { error } = await auth.svc
      .from("video_calls")
      .update({ notiz: notiz ?? null })
      .eq("id", id)

    if (error) {
      console.error("[os/video-calls] Notiz:", error)
      return NextResponse.json({ error: "Notiz konnte nicht gesichert werden." }, { status: 500 })
    }
    return NextResponse.json({ gesichert: true })
  }

  // ── Absagen ──────────────────────────────────────────────────
  if (aktion === "absagen") {
    const { error } = await auth.svc
      .from("video_calls")
      .update({
        status: "abgesagt",
        abgesagt_at: new Date().toISOString(),
        abgesagt_grund: grund || null,
        // Zugang sofort schliessen — ein abgesagter Termin darf keinen
        // gültigen Link mehr haben.
        schliesst_at: new Date().toISOString(),
      })
      .eq("id", id)
      .not("status", "in", "(abgesagt,beendet)")

    if (error) {
      console.error("[os/video-calls] Absagen:", error)
      return NextResponse.json({ error: "Konnte nicht abgesagt werden." }, { status: 500 })
    }

    // Der Patient erfährt es. Scheitert die Mail, bleibt die Absage
    // trotzdem bestehen — sonst stünde ein Termin wieder offen, den der
    // Behandler bereits gestrichen hat.
    const { data: patient } = await auth.svc
      .from("patients")
      .select("vorname, email")
      .eq("id", call.patient_id)
      .maybeSingle()

    if (patient?.email) {
      // Ueber die gemeinsame Formatierung, sonst nennt der Server die Zeit
      // in UTC — derselbe Fehler, der am 24.09.2026 in der Einladung stand.
      const wann = `${formatDatum(call.geplant_at)} um ${formatUhrzeit(call.geplant_at)}`
      void sendEmail({
        to: patient.email,
        subject: "Dein Videotermin wurde abgesagt",
        html:
          `<p style="font-family:sans-serif;font-size:15px;line-height:1.6;color:#3a4038;">` +
          `Hallo ${patient.vorname || ""},<br /><br />` +
          `dein Videotermin am <strong>${wann} Uhr</strong> muss leider entfallen` +
          (grund ? ` — ${grund}` : "") +
          `.<br /><br />Antworte einfach auf diese Mail, dann finden wir einen neuen Termin.</p>`,
      }).catch((err) => console.error("[os/video-calls] Absage-Mail:", err))
    }

    if (videoEingerichtet()) {
      await videoAnbieter().raumSchliessen(call.room_name)
    }
    return NextResponse.json({ abgesagt: true })
  }

  // ── Beenden ──────────────────────────────────────────────────
  //
  // DIE NOTIZ WIRD NUR ANGEFASST, WENN EINE MITKOMMT. Vorher stand hier
  // `notiz: notiz ?? null` — und der neue Knopf "Beenden" in der Uebersicht
  // schickt keine. Damit loeschte das Beenden genau den Text, den der
  // Behandler waehrend des Gespraechs getippt hatte. Am 24.09.2026 im
  // Protokoll gesehen: notiz "" -> null im selben Moment wie status ->
  // beendet.
  //
  // Eine Behandlungsnotiz ist Dokumentation. Sie verschwindet nicht als
  // Nebenwirkung eines Knopfes, der etwas anderes tun soll.
  const aenderung: Record<string, unknown> = {
    status: "beendet",
    beendet_at: new Date().toISOString(),
    schliesst_at: new Date().toISOString(),
  }
  if (typeof notiz === "string") aenderung.notiz = notiz.trim() || null

  const { data: beendet, error } = await auth.svc
    .from("video_calls")
    .update(aenderung)
    .eq("id", id)
    .in("status", ["geplant", "offen", "laeuft"])
    .select("id, room_name, status, beendet_at")
    .maybeSingle()

  if (error) {
    console.error("[os/video-calls] PATCH:", error)
    return NextResponse.json({ error: "Konnte nicht beendet werden." }, { status: 500 })
  }
  if (!beendet) {
    return NextResponse.json(
      { error: "Termin nicht gefunden oder bereits beendet." },
      { status: 409 }
    )
  }

  if (videoEingerichtet()) {
    await videoAnbieter().raumSchliessen(beendet.room_name)
  }

  return NextResponse.json({ call: beendet })
}
