/**
 * Segmentierung der Schmerzcheck-Bestandsleads für die Masterclass-Kampagne.
 *
 *   A  Double-Opt-in + Check abgeschlossen, ohne Red-Flag   (178)  → M1–M4
 *   B  Double-Opt-in + Red-Flag-Stopp                       (117)  → B1–B2 (Brücke, KEIN Pitch)
 *   C  Double-Opt-in, Check nicht abgeschlossen             (~16)  → C1 (Reaktivierung)
 *   D  KEIN Double-Opt-in                                   (210)  → NIEMALS mailen
 *
 * Segment D ist der wichtigste Teil dieser Datei. Diese 210 Leute haben den
 * Bestätigungslink nie geklickt — es liegt keine Einwilligung vor. Sie werden
 * an ZWEI Stellen ausgeschlossen: im Query-Filter UND in `assertMailable()`,
 * das unmittelbar vor jedem Versand nochmal prüft. Eine einzelne Verteidigungs-
 * linie war schon einmal zu wenig (100 Doppelmails am 10.07., weil ein Query
 * still ausfiel und niemand danach nochmal hinsah).
 *
 * Segment B bekommt KEIN Kaufangebot, solange die Warnzeichen nicht ärztlich
 * abgeklärt sind. Bestätigt der Lead das aktiv per Klick (medical_cleared_at),
 * wird er zu Segment A — dann, und erst dann, darf die Masterclass kommen.
 */

export type Segment = "A" | "B" | "C" | "D"

/** Schwerpunkt der Beschwerden (PROJ-25b). Nur LWS berechtigt zur Masterclass. */
export type MainRegion =
  | "unterer_ruecken"
  | "nacken_schulter"
  | "oberer_ruecken"
  | "knie_huefte_fuss"
  | "wechselt_staendig"

export interface SegmentableLead {
  id: string
  status: string
  consent_status: string
  medical_cleared_at?: string | null
  /** null = Region unbekannt (die 77 „Mehrere Bereiche") → RT1 klärt das. */
  main_region?: string | null
}

/**
 * Bekommen „wechselt ständig"-Leads die Masterclass angeboten?
 *
 * Default: NEIN (parken). Der Kursinhalt ist LWS-spezifisch — Anatomie der LWS,
 * Rumpftraining. Wer selbst sagt, dass es ständig wechselt, hat keinen klaren
 * LWS-Schwerpunkt. Über die Env-Var umschaltbar, falls Max anders entscheidet.
 */
const WECHSELT_STAENDIG_BEKOMMT_M =
  process.env.MASTERCLASS_INCLUDE_WECHSELND === "true"

/**
 * Darf dieser Lead die Masterclass (M1–M4) angeboten bekommen?
 *
 * Die Masterclass ist ein LWS-Kurs („Chronischer Kreuzschmerz", Lektionen zur
 * Anatomie der LWS und Rumpftraining). Sie einem Nacken- oder Knie-Patienten für
 * 399 € zu verkaufen, wäre ein Fehlverkauf — mit Rückforderungen und
 * Vertrauensverlust als absehbarer Folge.
 *
 * FAIL CLOSED: Ist die Region unbekannt (main_region = null, also die 77
 * „Mehrere Bereiche"), gibt es KEIN Angebot. Erst der RT1-Klick schaltet frei.
 */
export function isMasterclassEligible(lead: SegmentableLead): boolean {
  if (lead.main_region === "unterer_ruecken") return true
  if (lead.main_region === "wechselt_staendig") return WECHSELT_STAENDIG_BEKOMMT_M
  return false
}

/**
 * Braucht dieser Lead die Routing-Mail RT1?
 * Genau dann, wenn er im Verkaufs-Segment sitzt, aber seine Region unbekannt ist.
 */
export function needsRegionRouting(lead: SegmentableLead): boolean {
  return computeSegment(lead) === "A" && !lead.main_region
}

/** Leitet das Segment allein aus dem Lead-Datensatz ab. Keine Seiteneffekte. */
export function computeSegment(lead: SegmentableLead): Segment {
  // Ohne Double-Opt-in gibt es keine Einwilligung — Ende der Diskussion.
  if (lead.consent_status !== "confirmed") return "D"

  // Red-Flag-Lead, der die ärztliche Abklärung aktiv bestätigt hat, ist
  // ab sofort ein normaler Empfänger (Segment A) — siehe Migration 3.
  if (lead.status === "red_flag_routed") {
    return lead.medical_cleared_at ? "A" : "B"
  }

  if (lead.status === "check_completed") return "A"
  if (lead.status === "awaiting_check" || lead.status === "check_started") return "C"

  // 'abandoned' o.ä. — bewusst nicht anmailen.
  return "D"
}

/**
 * Harte zweite Verteidigungslinie. Wird UNMITTELBAR vor jedem Versand gerufen,
 * unabhängig davon, wie der Lead in die Empfängerliste gekommen ist.
 *
 * Wirft, statt `false` zurückzugeben: ein übersehener Rückgabewert soll nicht
 * still zu einer Mail an jemanden ohne Einwilligung führen.
 */
export function assertMailable(lead: SegmentableLead, code: string): void {
  const segment = computeSegment(lead)

  if (segment === "D") {
    throw new Error(
      `Segment D (keine Einwilligung) darf NIE gemailt werden — Lead ${lead.id}, Mail ${code}`
    )
  }

  // Segment B darf ausschließlich die Brücken-Mails bekommen (B1/B2) —
  // niemals eine Verkaufsmail. Verhindert, dass ein Bug in der Empfängerliste
  // einem Menschen mit ungeklärten Warnzeichen ein Angebot schickt.
  if (segment === "B" && !/^B[12]$/.test(code)) {
    throw new Error(
      `Segment B (Red-Flag, nicht abgeklärt) darf nur B1/B2 bekommen — Lead ${lead.id}, Mail ${code}`
    )
  }

  // Die Masterclass ist ein LWS-Kurs. M1–M4 dürfen NUR an Leads gehen, deren
  // Schwerpunkt der untere Rücken ist. Bei unbekannter Region (die 77 aus
  // „Mehrere Bereiche") gibt es kein Angebot — erst der RT1-Klick schaltet frei.
  //
  // Fail closed: lieber eine Verkaufsmail zu wenig als ein 399-€-Angebot für ein
  // Produkt, das die Beschwerden des Empfängers gar nicht behandelt.
  if (/^M[1-4]$/.test(code) && !isMasterclassEligible(lead)) {
    throw new Error(
      `Masterclass (LWS-Kurs) darf nicht an Lead mit main_region="${lead.main_region ?? "unbekannt"}" — ` +
        `Lead ${lead.id}, Mail ${code}`
    )
  }

  // RT1/RT2 sind die Routing-Frage — sinnlos, wenn die Region schon bekannt ist.
  if (/^RT[12]$/.test(code) && lead.main_region) {
    throw new Error(
      `Routing-Mail an Lead mit bereits bekannter Region "${lead.main_region}" — Lead ${lead.id}, Mail ${code}`
    )
  }
}

/** Für Reporting/Dry-Run: Segmentverteilung einer Lead-Liste. */
export function segmentCounts(leads: SegmentableLead[]): Record<Segment, number> {
  const counts: Record<Segment, number> = { A: 0, B: 0, C: 0, D: 0 }
  for (const lead of leads) counts[computeSegment(lead)]++
  return counts
}
