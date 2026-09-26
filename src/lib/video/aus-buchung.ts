/**
 * PROJ-28 / PROJ-7 — Aus einer gebuchten Video-Konsultation wird ein Termin
 * im Sprechzimmer. Ohne dass jemand etwas tut.
 *
 * Der Behandler: „Wenn eine Konsultation gebucht ist, sollte auch gleich der
 * Termin in der Digitalen Sprechstunde stehen und gleichzeitig die Mail
 * rausgehen, sodass ich da überhaupt nichts mehr machen müsste."
 *
 * ═══ NUR DIE KONSULTATION, NICHTS ANDERES ═══════════════════════════════
 *
 * Ausdrücklich gewünscht und ausdrücklich wichtig: Eine gebuchte
 * Krankengymnastik bekommt KEIN Sprechzimmer. Wer eine KG ausnahmsweise per
 * Video machen will, legt den Termin von Hand an — das ist der seltene Fall,
 * und er soll eine bewusste Entscheidung bleiben.
 *
 * Erkannt wird die Konsultation am Namen der Leistung, den der Kalender
 * mitschickt. Der Name darf sich ändern, ohne dass hier etwas kaputtgeht: Es
 * genügt „video" zusammen mit „sprechstunde" oder „konsultation". Wer einen
 * ganz anderen Namen vergibt, setzt VIDEO_KONSULTATION_MUSTER.
 *
 * ═══ WAS PASSIERT ═══════════════════════════════════════════════════════
 *
 *   gebucht   → Termin anlegen, Einladung verschicken
 *   verlegt   → denselben Termin verschieben, Einladung erneut schicken
 *   abgesagt  → Termin absagen, Zugang sofort schliessen
 *
 * Jedes Ereignis kann mehrfach kommen — Webhooks werden wiederholt, das ist
 * normal und kein Fehler. Deshalb hängt alles an `booking_appointment_id`:
 * Zweimal dasselbe Ereignis ergibt einen Termin, nicht zwei.
 */

import { oeffnetAm, schliesstAm } from "@/lib/video/termin"
import { sendeEinladung } from "@/lib/video/einladung"
// eslint-disable-next-line @typescript-eslint/no-explicit-any
type Svc = { from: (t: string) => any }

/** Standarddauer, wenn der Kalender keine mitschickt. */
const DAUER_STANDARD = 30

export function istVideoKonsultation(leistung: string | null | undefined): boolean {
  if (!leistung) return false
  const eigenes = process.env.VIDEO_KONSULTATION_MUSTER
  if (eigenes) {
    try {
      return new RegExp(eigenes, "i").test(leistung)
    } catch {
      // Ein kaputtes Muster darf nicht dazu fuehren, dass gar nichts mehr
      // erkannt wird — dann lieber die eingebaute Regel.
      console.error("[video/aus-buchung] VIDEO_KONSULTATION_MUSTER ist kein gueltiger Ausdruck.")
    }
  }
  const text = leistung.toLowerCase()
  return text.includes("video") && (text.includes("sprechstunde") || text.includes("konsultation"))
}

export interface BuchungsTermin {
  booking_appointment_id: string
  scheduled_at: string
  duration_minutes: number
  service_name?: string | null
  status: "scheduled" | "cancelled" | "completed"
}

/**
 * Legt das Videogespräch zur Buchung an, verschiebt oder sagt es ab.
 *
 * Gibt eine Zeile zurück, die im Webhook-Protokoll landet — wer spaeter
 * fragt „warum steht da kein Termin?", soll die Antwort dort finden und
 * nicht raten muessen.
 */
export async function videoterminAusBuchung(args: {
  svc: Svc
  patientId: string
  buchung: BuchungsTermin
}): Promise<{ getan: boolean; hinweis: string }> {
  const { svc, patientId, buchung } = args

  if (!istVideoKonsultation(buchung.service_name)) {
    return { getan: false, hinweis: `Keine Video-Konsultation („${buchung.service_name ?? "ohne Leistung"}") — kein Sprechzimmer.` }
  }

  const { data: vorhanden } = await svc
    .from("video_calls")
    .select("id, status, geplant_at, dauer_minuten, gast_token, hinweis")
    .eq("booking_appointment_id", buchung.booking_appointment_id)
    .maybeSingle()

  // ── Abgesagt ────────────────────────────────────────────────────────────
  if (buchung.status === "cancelled") {
    if (!vorhanden) return { getan: false, hinweis: "Absage ohne zugehoeriges Gespraech." }
    if (vorhanden.status === "beendet" || vorhanden.status === "abgesagt") {
      return { getan: false, hinweis: "Gespraech war bereits beendet oder abgesagt." }
    }
    await svc
      .from("video_calls")
      .update({
        status: "abgesagt",
        abgesagt_at: new Date().toISOString(),
        abgesagt_grund: "Im Kalender abgesagt.",
        // Zugang sofort schliessen — ein abgesagter Termin darf keinen
        // gueltigen Link mehr haben.
        schliesst_at: new Date().toISOString(),
      })
      .eq("id", vorhanden.id)
    return { getan: true, hinweis: "Videotermin abgesagt." }
  }

  if (buchung.status === "completed") {
    return { getan: false, hinweis: "Abgeschlossene Buchung — nichts zu tun." }
  }

  // ── Patient und Behandler ───────────────────────────────────────────────
  const { data: patient } = await svc
    .from("patients")
    .select("id, vorname, email, therapeut_id")
    .eq("id", patientId)
    .maybeSingle()

  if (!patient) return { getan: false, hinweis: "Patient nicht gefunden." }

  let therapeutId: string | null = patient.therapeut_id ?? null
  if (!therapeutId) {
    const { data: admin } = await svc
      .from("user_profiles")
      .select("id")
      .eq("role", "admin")
      .limit(1)
      .maybeSingle()
    therapeutId = admin?.id ?? null
  }
  if (!therapeutId) {
    return { getan: false, hinweis: "Kein Behandler gefunden, dem der Termin gehoeren koennte." }
  }

  const { data: profil } = await svc
    .from("user_profiles")
    .select("first_name, last_name")
    .eq("id", therapeutId)
    .maybeSingle()
  const behandlerName =
    [profil?.first_name, profil?.last_name].filter(Boolean).join(" ") || "Dein Behandler"

  const dauer = buchung.duration_minutes || DAUER_STANDARD
  const geplant = buchung.scheduled_at
  const fenster = {
    oeffnet_at: oeffnetAm(geplant).toISOString(),
    schliesst_at: schliesstAm(geplant, dauer).toISOString(),
  }

  // ── Schon da: verlegt oder Wiederholung ─────────────────────────────────
  if (vorhanden) {
    const verlegt =
      new Date(vorhanden.geplant_at).getTime() !== new Date(geplant).getTime() ||
      vorhanden.dauer_minuten !== dauer

    if (!verlegt && vorhanden.status !== "abgesagt") {
      return { getan: false, hinweis: "Termin steht bereits — nichts geaendert." }
    }

    await svc
      .from("video_calls")
      .update({
        geplant_at: geplant,
        dauer_minuten: dauer,
        ...fenster,
        status: "geplant",
        abgesagt_at: null,
        abgesagt_grund: null,
        // Erinnerungen zuruecksetzen: Sie gehoeren zur alten Uhrzeit. Ohne
        // das bekaeme der Patient zur neuen Zeit keine mehr.
        erinnerung_24h_at: null,
        erinnerung_1h_at: null,
      })
      .eq("id", vorhanden.id)

    const mail = await sendeEinladung({
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      svc: svc as any,
      termin: {
        id: vorhanden.id,
        gast_token: vorhanden.gast_token,
        geplant_at: geplant,
        dauer_minuten: dauer,
        hinweis: vorhanden.hinweis,
      },
      patient,
      behandlerName,
    })

    return {
      getan: true,
      hinweis: mail.ok
        ? "Videotermin verlegt, neue Einladung verschickt."
        : `Videotermin verlegt, Einladung fehlgeschlagen: ${mail.fehler}`,
    }
  }

  // ── Neu ─────────────────────────────────────────────────────────────────
  const { data: angelegt, error } = await svc
    .from("video_calls")
    .insert({
      patient_id: patient.id,
      therapist_id: therapeutId,
      anlass: "konsultation",
      geplant_at: geplant,
      dauer_minuten: dauer,
      ...fenster,
      status: "geplant",
      booking_appointment_id: buchung.booking_appointment_id,
    })
    .select("id, gast_token")
    .single()

  if (error || !angelegt) {
    // Der haeufigste Grund ist eine nicht gelaufene Migration — das soll im
    // Protokoll stehen und nicht als „unbekannter Fehler".
    return {
      getan: false,
      hinweis: `Videotermin konnte nicht angelegt werden: ${error?.message ?? "unbekannt"}`,
    }
  }

  const mail = await sendeEinladung({
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    svc: svc as any,
    termin: {
      id: angelegt.id,
      gast_token: angelegt.gast_token,
      geplant_at: geplant,
      dauer_minuten: dauer,
    },
    patient,
    behandlerName,
  })

  return {
    getan: true,
    hinweis: mail.ok
      ? "Videotermin angelegt, Einladung verschickt."
      : `Videotermin angelegt, Einladung fehlgeschlagen: ${mail.fehler}`,
  }
}
