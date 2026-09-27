/**
 * PROJ-29 — Aufgaben anlegen: der Arbeitsvorrat statt einer Mail.
 *
 * Eine Mail ist eine Benachrichtigung, keine Aufgabe. Sie kennt kein
 * „erledigt", sie sammelt sich, und bei zwanzig Patienten im Programm
 * erzeugt allein der Rechnungslauf sechzig Mails im Quartal.
 *
 * Deshalb schreiben die automatischen Läufe hierher. Wer keine `refId`
 * mitgibt, bekommt bei jedem Lauf eine neue Aufgabe — also gibt jeder Lauf
 * eine mit.
 */

// eslint-disable-next-line @typescript-eslint/no-explicit-any
type Svc = { from: (t: string) => any }

export type AufgabenTyp = "rechnung_freigeben" | "bericht_faellig" | "hinweis"

export async function aufgabeAnlegen(
  svc: Svc,
  aufgabe: {
    typ: AufgabenTyp
    titel: string
    beschreibung?: string | null
    link?: string | null
    patientId?: string | null
    /** Das Ding, um das es geht. Verhindert Doppelte über den Index. */
    refId?: string | null
  }
): Promise<{ angelegt: boolean; grund?: string }> {
  const { error } = await svc.from("os_aufgaben").insert({
    typ: aufgabe.typ,
    titel: aufgabe.titel.slice(0, 200),
    beschreibung: aufgabe.beschreibung ?? null,
    link: aufgabe.link ?? null,
    patient_id: aufgabe.patientId ?? null,
    ref_id: aufgabe.refId ?? null,
  })

  if (!error) return { angelegt: true }

  // 23505 = der eindeutige Index hat zugeschlagen: Die Aufgabe gibt es schon.
  // Das ist der Normalfall bei einem täglichen Lauf und kein Fehler.
  if (error.code === "23505") return { angelegt: false, grund: "gibt es bereits" }

  console.error("[aufgaben] Anlegen fehlgeschlagen:", error.message)
  return { angelegt: false, grund: error.message }
}
