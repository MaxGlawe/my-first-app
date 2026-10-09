/**
 * PROJ-16: Schmerztagebuch (Therapeuten-Ansicht)
 * GET /api/patients/[id]/pain-diary — Check-in-Einträge eines Patienten
 *
 * ?tage=90 | 365 | alle   (Voreinstellung: alle)
 *
 * Bis zum 09.10.2026 waren es fest die letzten 90 Tage. Das war fuer die
 * LAUFENDE Betreuung gedacht und fuer alles andere genau falsch herum: Von
 * 309 Eintraegen in der Datenbank waren 19 sichtbar und 290 verdeckt. Elf
 * Patienten mit vollstaendigem Verlauf — einer davon 76 Eintraege ueber vier
 * Monate — zeigten eine leere Ansicht.
 *
 * Gerade die abgeschlossenen Verlaeufe sind die wertvollen: Wer im Maerz mit
 * Schmerz 7 begann und im Juni bei 3 lag, ist der Beleg, den man einer
 * Krankenkasse vorlegt. Der war unsichtbar, WEIL er abgeschlossen war.
 */

import { NextResponse } from "next/server"
import { createSupabaseServerClient } from "@/lib/supabase-server"

const UUID_REGEX =
  /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i

export async function GET(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id: patientId } = await params
  const supabase = await createSupabaseServerClient()

  const {
    data: { user },
    error: authError,
  } = await supabase.auth.getUser()
  if (authError || !user) {
    return NextResponse.json({ error: "Nicht autorisiert." }, { status: 401 })
  }

  if (!UUID_REGEX.test(patientId)) {
    return NextResponse.json({ error: "Ungültige ID." }, { status: 400 })
  }

  // Zeitraum: „alle" ist die Voreinstellung. Ein Check-in ist eine Zeile mit
  // sieben Zahlen; selbst drei Jahre taegliches Eintragen sind rund tausend
  // davon. Es gibt keinen Grund, hier etwas wegzulassen — und einen sehr
  // guten, nichts wegzulassen.
  const tageParam = new URL(request.url).searchParams.get("tage")
  const tage = tageParam === null || tageParam === "alle" ? null : Number(tageParam)

  let query = supabase
    .from("pain_diary_entries")
    .select("id, entry_date, pain_level, wellbeing, sleep_quality, stress_level, movement_restriction, pain_location, notes, created_at")
    .eq("patient_id", patientId)
    .order("entry_date", { ascending: true })

  if (tage !== null && Number.isFinite(tage) && tage > 0) {
    const ab = new Date()
    ab.setDate(ab.getDate() - tage)
    query = query.gte("entry_date", ab.toISOString().split("T")[0])
  }

  // Obergrenze als Reissleine, nicht als Zeitfenster: Sie greift erst bei
  // Jahren taeglicher Eintraege und schneidet dann die AELTESTEN ab, nicht
  // die juengsten — die Aufsteigend-Sortierung bliebe sonst am falschen Ende
  // haengen.
  const { data: entries, error } = await query.limit(2000)

  if (error) {
    console.error("[GET /api/patients/[id]/pain-diary] Error:", error)
    return NextResponse.json(
      { error: "Einträge konnten nicht geladen werden." },
      { status: 500 }
    )
  }

  return NextResponse.json({ entries: entries ?? [] })
}
