/**
 * PROJ-27 — Dokumentenakte: Liste und Upload.
 *
 * GET  /api/documents?patient_id=…   — Dokumente eines Patienten
 * POST /api/documents                — Dokument hochladen (multipart)
 *
 * EIN Endpunkt für beide Seiten statt getrennter /api/me- und /api/os-Wege.
 * Der Unterschied zwischen Patient und Praxis ist hier genau eine Frage —
 * „wessen Akte?" —, und die beantwortet der Code unten an einer Stelle.
 * Zwei Endpunkte hätten dieselbe Rechteprüfung zweimal enthalten, und die
 * zweite Kopie wäre diejenige gewesen, die beim nächsten Umbau vergessen
 * wird.
 */

import { NextRequest, NextResponse } from "next/server"
import { createSupabaseServerClient } from "@/lib/supabase-server"
import { createSupabaseServiceClient } from "@/lib/supabase-service"
import {
  DOKUMENT_BUCKET,
  ERLAUBTE_TYPEN,
  MAX_BYTES,
  KATEGORIEN,
  dokumentPfad,
  protokolliere,
  type Kategorie,
} from "@/lib/dokumente"

const KLINISCHE_ROLLEN = new Set(["admin", "heilpraktiker", "physiotherapeut", "praxismanagement"])

/**
 * Wer ist da, und auf wessen Akte darf er?
 *
 * Gibt `patientId` nur zurück, wenn der Zugriff erlaubt ist. Der Aufrufer
 * muss danach nichts mehr prüfen — genau darum liegt die Logik hier und
 * nicht verteilt.
 */
async function zugang(request: NextRequest, gewuenschterPatient?: string | null) {
  const supabase = await createSupabaseServerClient()
  const {
    data: { user },
  } = await supabase.auth.getUser()
  if (!user) return { fehler: NextResponse.json({ error: "Nicht autorisiert." }, { status: 401 }) }

  const svc = createSupabaseServiceClient()
  const { data: profile } = await svc
    .from("user_profiles")
    .select("role")
    .eq("id", user.id)
    .maybeSingle()

  const rolle = profile?.role ?? null
  const istPraxis = rolle ? KLINISCHE_ROLLEN.has(rolle) : false

  if (istPraxis) {
    if (!gewuenschterPatient) {
      return { fehler: NextResponse.json({ error: "patient_id fehlt." }, { status: 400 }) }
    }
    return { user, svc, rolle, istPraxis: true as const, patientId: gewuenschterPatient }
  }

  // Patient: immer die eigene Akte, egal was in der Anfrage steht.
  const { data: patient } = await svc
    .from("patients")
    .select("id")
    .eq("user_id", user.id)
    .maybeSingle()

  if (!patient) {
    return { fehler: NextResponse.json({ error: "Kein Patienten-Profil gefunden." }, { status: 404 }) }
  }
  if (gewuenschterPatient && gewuenschterPatient !== patient.id) {
    // Nicht 403: Wer fremde Akten abfragt, soll nicht erfahren, ob es sie gibt.
    return { fehler: NextResponse.json({ error: "Nicht gefunden." }, { status: 404 }) }
  }
  return { user, svc, rolle, istPraxis: false as const, patientId: patient.id }
}

// ── GET ─────────────────────────────────────────────────────────────────────

export async function GET(request: NextRequest) {
  const z = await zugang(request, request.nextUrl.searchParams.get("patient_id"))
  if ("fehler" in z) return z.fehler

  const { data, error } = await z.svc
    .from("patient_documents")
    .select(
      "id, kategorie, titel, notiz, mime_type, groesse_bytes, seiten, quelle, created_at, korrektur_gemeldet_at, korrektur_grund"
    )
    .eq("patient_id", z.patientId)
    .is("geloescht_at", null)
    .order("created_at", { ascending: false })
    .limit(200)

  if (error) {
    console.error("[documents] GET:", error)
    return NextResponse.json({ error: "Dokumente konnten nicht geladen werden." }, { status: 500 })
  }

  return NextResponse.json({ dokumente: data ?? [], kategorien: KATEGORIEN })
}

// ── POST ────────────────────────────────────────────────────────────────────

export async function POST(request: NextRequest) {
  let form: FormData
  try {
    form = await request.formData()
  } catch {
    return NextResponse.json({ error: "Ungültige Anfrage." }, { status: 400 })
  }

  const z = await zugang(request, (form.get("patient_id") as string | null) ?? null)
  if ("fehler" in z) return z.fehler

  const datei = form.get("datei")
  if (!(datei instanceof File)) {
    return NextResponse.json({ error: "Keine Datei erhalten." }, { status: 400 })
  }

  // Grenzen zuerst — bevor irgendetwas in den Speicher gelesen wird.
  if (datei.size === 0) {
    return NextResponse.json({ error: "Die Datei ist leer." }, { status: 400 })
  }
  if (datei.size > MAX_BYTES) {
    return NextResponse.json(
      { error: `Die Datei ist zu gross (höchstens ${Math.round(MAX_BYTES / 1024 / 1024)} MB).` },
      { status: 413 }
    )
  }
  if (!ERLAUBTE_TYPEN.includes(datei.type as (typeof ERLAUBTE_TYPEN)[number])) {
    return NextResponse.json(
      { error: "Nur PDF und Bilder (JPG, PNG, HEIC, WebP) sind möglich." },
      { status: 415 }
    )
  }

  const kategorie = ((form.get("kategorie") as string) || "sonstiges") as Kategorie
  if (!KATEGORIEN.some((k) => k.id === kategorie)) {
    return NextResponse.json({ error: "Unbekannte Kategorie." }, { status: 400 })
  }

  const titelRoh = ((form.get("titel") as string) || datei.name || "Dokument").trim()
  const titel = titelRoh.slice(0, 200)
  const notiz = ((form.get("notiz") as string) || "").trim().slice(0, 2000) || null

  // Erst die Zeile, dann die Datei: Die Dokument-UUID ist der Dateiname im
  // Bucket. Scheitert der Upload, wird die Zeile wieder entfernt — eine Zeile
  // ohne Datei wäre ein Dokument, das sich nicht öffnen lässt.
  const { data: doc, error: insertError } = await z.svc
    .from("patient_documents")
    .insert({
      patient_id: z.patientId,
      kategorie,
      titel,
      notiz,
      storage_path: "(ausstehend)",
      mime_type: datei.type,
      groesse_bytes: datei.size,
      hochgeladen_von: z.user.id,
      quelle: z.istPraxis ? "praxis" : "patient",
    })
    .select("id")
    .single()

  if (insertError || !doc) {
    console.error("[documents] Insert:", insertError)
    // 23514 = CHECK-Verletzung. Praktisch immer eine Kategorie, die der Code
    // schon kennt und die Datenbank noch nicht — also eine Migration, die
    // nicht gelaufen ist. Ein blankes "konnte nicht angelegt werden" schickt
    // einen dafuer auf die Suche im falschen Stockwerk.
    if (insertError?.code === "23514") {
      return NextResponse.json(
        {
          error: `Die Kategorie „${kategorie}" ist in der Datenbank noch nicht freigeschaltet. Es fehlt eine Migration aus supabase/migrations/.`,
        },
        { status: 400 }
      )
    }
    return NextResponse.json({ error: "Dokument konnte nicht angelegt werden." }, { status: 500 })
  }

  const pfad = dokumentPfad(z.patientId, doc.id, datei.type)
  const { error: uploadError } = await z.svc.storage
    .from(DOKUMENT_BUCKET)
    .upload(pfad, await datei.arrayBuffer(), { contentType: datei.type, upsert: false })

  if (uploadError) {
    console.error("[documents] Upload:", uploadError)
    await z.svc.from("patient_documents").delete().eq("id", doc.id)
    return NextResponse.json({ error: "Die Datei konnte nicht gespeichert werden." }, { status: 500 })
  }

  await z.svc.from("patient_documents").update({ storage_path: pfad }).eq("id", doc.id)

  protokolliere(z.svc, {
    documentId: doc.id,
    patientId: z.patientId,
    userId: z.user.id,
    rolle: z.rolle,
    aktion: "hochgeladen",
    ip: request.headers.get("x-forwarded-for"),
  })

  return NextResponse.json({ id: doc.id, titel, kategorie }, { status: 201 })
}
