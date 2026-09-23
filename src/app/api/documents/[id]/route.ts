/**
 * PROJ-27 — Ein einzelnes Dokument.
 *
 * GET    /api/documents/[id]  — signierter Link zum Öffnen
 * PATCH  /api/documents/[id]  — Korrektur melden (Patient) oder ändern (Praxis)
 * DELETE /api/documents/[id]  — entfernen, nur Praxis
 *
 * Der GET ist die Stelle, an der ein Gesundheitsdokument tatsächlich
 * herausgegeben wird — deshalb steht hier die Protokollierung, und nicht in
 * der Liste. Wer eine Liste ansieht, hat noch nichts gelesen; wer diesen Link
 * anfordert, schon.
 */

import { NextRequest, NextResponse } from "next/server"
import { createSupabaseServerClient } from "@/lib/supabase-server"
import { createSupabaseServiceClient } from "@/lib/supabase-service"
import { DOKUMENT_BUCKET, protokolliere } from "@/lib/dokumente"

const KLINISCHE_ROLLEN = new Set(["admin", "heilpraktiker", "physiotherapeut", "praxismanagement"])

/** Kurzlebig: Der Link soll das Öffnen überleben, nicht den Tag. */
const LINK_SEKUNDEN = 300

async function kontext(id: string) {
  const supabase = await createSupabaseServerClient()
  const {
    data: { user },
  } = await supabase.auth.getUser()
  if (!user) return { fehler: NextResponse.json({ error: "Nicht autorisiert." }, { status: 401 }) }

  const svc = createSupabaseServiceClient()

  const { data: doc } = await svc
    .from("patient_documents")
    .select("id, patient_id, titel, storage_path, mime_type, geloescht_at")
    .eq("id", id)
    .maybeSingle()

  if (!doc || doc.geloescht_at) {
    return { fehler: NextResponse.json({ error: "Nicht gefunden." }, { status: 404 }) }
  }

  const { data: profile } = await svc
    .from("user_profiles")
    .select("role")
    .eq("id", user.id)
    .maybeSingle()

  const rolle = profile?.role ?? null
  const istPraxis = rolle ? KLINISCHE_ROLLEN.has(rolle) : false

  if (!istPraxis) {
    const { data: patient } = await svc
      .from("patients")
      .select("id")
      .eq("user_id", user.id)
      .maybeSingle()
    if (!patient || patient.id !== doc.patient_id) {
      return { fehler: NextResponse.json({ error: "Nicht gefunden." }, { status: 404 }) }
    }
  }

  return { user, svc, rolle, istPraxis, doc }
}

// ── GET ─────────────────────────────────────────────────────────────────────

export async function GET(request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params
  const k = await kontext(id)
  if ("fehler" in k) return k.fehler

  const { data, error } = await k.svc.storage
    .from(DOKUMENT_BUCKET)
    .createSignedUrl(k.doc.storage_path, LINK_SEKUNDEN)

  if (error || !data?.signedUrl) {
    console.error("[documents/id] Signierter Link:", error)
    return NextResponse.json({ error: "Das Dokument konnte nicht geöffnet werden." }, { status: 500 })
  }

  protokolliere(k.svc, {
    documentId: k.doc.id,
    patientId: k.doc.patient_id,
    userId: k.user.id,
    rolle: k.rolle,
    aktion: "angesehen",
    ip: request.headers.get("x-forwarded-for"),
  })

  return NextResponse.json({
    url: data.signedUrl,
    titel: k.doc.titel,
    mime: k.doc.mime_type,
    gueltigSekunden: LINK_SEKUNDEN,
  })
}

// ── PATCH ───────────────────────────────────────────────────────────────────

export async function PATCH(request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params
  const k = await kontext(id)
  if ("fehler" in k) return k.fehler

  let body: { grund?: string; kategorie?: string; titel?: string; notiz?: string }
  try {
    body = await request.json()
  } catch {
    return NextResponse.json({ error: "Ungültiges JSON." }, { status: 400 })
  }

  // Der Patient kann genau eines: melden, dass etwas nicht stimmt. Gelöscht
  // oder umbenannt wird von der Praxis — was in der Akte liegt, unterliegt
  // ihrer Dokumentationspflicht.
  if (!k.istPraxis) {
    const grund = (body.grund ?? "").trim().slice(0, 1000) || null
    const { error } = await k.svc
      .from("patient_documents")
      .update({ korrektur_gemeldet_at: new Date().toISOString(), korrektur_grund: grund })
      .eq("id", id)
      .is("korrektur_gemeldet_at", null)

    if (error) {
      console.error("[documents/id] Korrektur:", error)
      return NextResponse.json({ error: "Konnte nicht gemeldet werden." }, { status: 500 })
    }

    protokolliere(k.svc, {
      documentId: id,
      patientId: k.doc.patient_id,
      userId: k.user.id,
      rolle: k.rolle,
      aktion: "korrektur_gemeldet",
    })
    return NextResponse.json({ gemeldet: true })
  }

  const aenderung: Record<string, unknown> = {}
  if (typeof body.titel === "string") aenderung.titel = body.titel.trim().slice(0, 200)
  if (typeof body.notiz === "string") aenderung.notiz = body.notiz.trim().slice(0, 2000) || null
  if (typeof body.kategorie === "string") aenderung.kategorie = body.kategorie
  // Die Praxis hat die Meldung bearbeitet.
  if (body.grund === "erledigt") {
    aenderung.korrektur_gemeldet_at = null
    aenderung.korrektur_grund = null
  }

  if (Object.keys(aenderung).length === 0) {
    return NextResponse.json({ error: "Nichts zu ändern." }, { status: 400 })
  }

  const { error } = await k.svc.from("patient_documents").update(aenderung).eq("id", id)
  if (error) {
    console.error("[documents/id] PATCH:", error)
    return NextResponse.json({ error: "Konnte nicht gespeichert werden." }, { status: 500 })
  }
  return NextResponse.json({ gespeichert: true })
}

// ── DELETE ──────────────────────────────────────────────────────────────────

export async function DELETE(request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params
  const k = await kontext(id)
  if ("fehler" in k) return k.fehler

  if (!k.istPraxis) {
    return NextResponse.json(
      {
        error:
          "Dokumente in deiner Akte kannst du nicht selbst entfernen. Melde uns, wenn etwas nicht stimmt — wir kümmern uns darum.",
      },
      { status: 403 }
    )
  }

  // Datei weg, Zeile bleibt. Dass ein Dokument existierte und entfernt wurde,
  // ist selbst Teil der Dokumentation — ein spurlos verschwundener Befund
  // wäre die schlechtere Variante.
  const { error: storageError } = await k.svc.storage
    .from(DOKUMENT_BUCKET)
    .remove([k.doc.storage_path])

  if (storageError) {
    console.error("[documents/id] Datei entfernen:", storageError)
  }

  const { error } = await k.svc
    .from("patient_documents")
    .update({ geloescht_at: new Date().toISOString(), geloescht_von: k.user.id })
    .eq("id", id)
    .is("geloescht_at", null)

  if (error) {
    console.error("[documents/id] DELETE:", error)
    return NextResponse.json({ error: "Konnte nicht entfernt werden." }, { status: 500 })
  }

  protokolliere(k.svc, {
    documentId: id,
    patientId: k.doc.patient_id,
    userId: k.user.id,
    rolle: k.rolle,
    aktion: "geloescht",
    ip: request.headers.get("x-forwarded-for"),
  })

  return NextResponse.json({ entfernt: true })
}
