/**
 * Stammdaten aus dem Buchungstool — prüfen und übersetzen.
 *
 * Stand bis zum 16.10.2026 im Webhook selbst. Herausgelöst, weil dieselbe
 * Prüfung an ZWEI Stellen läuft: beim `patient.created` und später noch
 * einmal, wenn der Termin-Schritt die vorgemerkten Stammdaten aus dem
 * Ereignisprotokoll holt. Zwei Fassungen derselben Regel wären eine Falle —
 * die zweite hätte man beim Ändern vergessen, und dann nimmt der Webhook
 * Daten an, die der Termin-Schritt Sekunden später wieder abweist.
 *
 * ── Warum der leere Nachname eine eigene Regel braucht ───────────────────
 *
 * Seit dem 16.10.2026 fragt das Buchungstool bei Praxis-OS-Buchungen keinen
 * Nachnamen mehr ab und schickt `nachname: ""`. Die alte Regel hiess
 * `z.string().min(1)`: Ein leerer Text war damit kein leerer Nachname,
 * sondern ein UNGÜLTIGES EREIGNIS. Die Folge wäre nicht ein Patient ohne
 * Nachnamen gewesen, sondern gar keiner — und weil der Webhook dem
 * Buchungstool trotzdem mit 200 antwortet (damit es nicht endlos wiederholt),
 * wäre die Buchung still verschwunden: kein Datensatz, kein Termin in der
 * Akte, keine Einladung. Der Mensch hätte gebucht und nie etwas gehört.
 *
 * Deshalb hier zwei getrennte Begriffe:
 *
 *   LEER IST GÜLTIG. `""` und `"   "` werden zu `undefined` — eine Angabe,
 *   die fehlt, nicht ein Fehler. Das gilt für jedes Namensfeld, auch den
 *   Vornamen: Was das Tool heute noch fragt, kann es morgen weglassen.
 *
 *   DIE AKTE BRAUCHT EINEN TEXT. `patients.nachname` ist NOT NULL mit
 *   `CHECK (char_length BETWEEN 1 AND 100)` — ein leerer Text verstösst
 *   gegen die Prüfbedingung und die Anlage scheitert. Erst beim Anlegen
 *   tritt deshalb der Platzhalter ein, und nur dort.
 */

import { z } from "zod"

/**
 * Was in der Akte steht, solange der echte Name fehlt.
 *
 * Sichtbar und als Platzhalter erkennbar — nicht etwa der Vorname oder ein
 * Bindestrich. Wer die Liste aufschlägt, soll sehen, dass hier etwas
 * nachzutragen ist; im Kennenlernen wird ohnehin nach dem Namen gefragt.
 */
export const NAME_FEHLT = "Unbekannt"

/** Geburtsdatum, wenn keines vorliegt — `patients.geburtsdatum` ist NOT NULL. */
export const GEBURTSDATUM_FEHLT = "1900-01-01"

/**
 * Leerer oder nur aus Leerzeichen bestehender Text → `undefined`.
 *
 * Als `preprocess` und nicht als `transform`: Die Umwandlung muss VOR der
 * Prüfung greifen, sonst scheitert `""` an der Mindestlänge, bevor es zu
 * `undefined` werden kann.
 */
const textOderLeer = (max: number) =>
  z.preprocess(
    (v) => {
      if (typeof v !== "string") return v ?? undefined
      const t = v.trim()
      return t === "" ? undefined : t
    },
    z.string().min(1).max(max).optional()
  )

export const stammdatenSchema = z
  .object({
    // Patienten-ID: Das Buchungstool sendet „id", wir nehmen auch
    // „booking_patient_id".
    id: z.string().min(1).optional(),
    booking_patient_id: z.string().min(1).optional(),
    email: z.string().email(),
    // Namen: englische und deutsche Feldnamen, beide dürfen leer sein.
    first_name: textOderLeer(100),
    vorname: textOderLeer(100),
    last_name: textOderLeer(100),
    nachname: textOderLeer(100),
    phone: z.string().max(30).optional().nullable(),
    telefon: z.string().max(30).optional().nullable(),
    // Datum: ein leeres Feld ist „nicht angegeben", kein Formatfehler.
    // Dieselbe Falle wie beim Nachnamen — das Tool schickt bei nicht
    // abgefragten Feldern den leeren Text, nicht `null`.
    date_of_birth: z.preprocess(
      (v) => (typeof v === "string" && v.trim() === "" ? undefined : v),
      z.string().regex(/^\d{4}-\d{2}-\d{2}$/).optional().nullable()
    ),
    geburtsdatum: z.preprocess(
      (v) => (typeof v === "string" && v.trim() === "" ? undefined : v),
      z.string().regex(/^\d{4}-\d{2}-\d{2}$/).optional().nullable()
    ),
    geschlecht: z.preprocess(
      (v) => (typeof v === "string" && v.trim() === "" ? undefined : v),
      z.enum(["maennlich", "weiblich", "divers", "unbekannt"]).optional().default("unbekannt")
    ),
  })
  .refine((d) => d.id || d.booking_patient_id, {
    message: "Either 'id' or 'booking_patient_id' is required",
    path: ["booking_patient_id"],
  })

export type StammdatenRoh = z.infer<typeof stammdatenSchema>

export interface Stammdaten {
  booking_patient_id: string
  email: string
  vorname?: string
  nachname?: string
  telefon?: string | null
  geburtsdatum?: string | null
  geschlecht: string
}

/** Auf die internen, deutschen Feldnamen bringen. */
export function normalisiereStammdaten(raw: StammdatenRoh): Stammdaten {
  return {
    booking_patient_id: raw.booking_patient_id ?? raw.id!,
    email: raw.email,
    vorname: raw.vorname ?? raw.first_name,
    nachname: raw.nachname ?? raw.last_name,
    telefon: raw.telefon ?? raw.phone,
    geburtsdatum: raw.geburtsdatum ?? raw.date_of_birth,
    geschlecht: raw.geschlecht,
  }
}

/**
 * Die Werte, die in `patients` dürfen — jeder erfüllt die Prüfbedingung der
 * Spalte.
 *
 * `?.trim() ||` und nicht `??`: Der leere Text ist nicht nullish, also hätte
 * `??` ihn durchgelassen. Genau daran wäre die Anlage gescheitert — nicht
 * sichtbar im Code, sondern erst als `violates check constraint` in einem
 * Log, das niemand liest.
 */
export function akteNamen(daten: { vorname?: string | null; nachname?: string | null }) {
  return {
    vorname: daten.vorname?.trim() || NAME_FEHLT,
    nachname: daten.nachname?.trim() || NAME_FEHLT,
  }
}

/**
 * Wie der Name nach aussen erscheint — in Mails, Rechnungen, Berichten.
 *
 * Der Platzhalter wird hier weggelassen: „Hallo Sabine Unbekannt" ist
 * schlechter als „Hallo Sabine", und auf einer Rechnung wäre er schlicht
 * falsch. Bleibt gar nichts übrig, steht da „Patient" — ein Anschreiben
 * ohne Anrede ist schlimmer als ein unpersönliches.
 */
export function anzeigeName(daten: { vorname?: string | null; nachname?: string | null }): string {
  const teile = [daten.vorname, daten.nachname]
    .map((t) => t?.trim() ?? "")
    .filter((t) => t !== "" && t !== NAME_FEHLT)
  return teile.join(" ") || "Patient"
}

/** Fehlt der Nachname noch? Dann ist im Kennenlernen etwas nachzutragen. */
export function nachnameFehlt(nachname?: string | null): boolean {
  const t = nachname?.trim() ?? ""
  return t === "" || t === NAME_FEHLT
}
