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
  /**
   * Die Warnzeichen, wegen derer dieser Lead im Juni gestoppt wurde
   * (schmerzcheck_results.red_flag_codes). Entscheidet über RF1 vs. B1.
   */
  red_flag_codes?: string[] | null
  /** Lead hat sich bereits für ein künftiges Regions-Modul vormerken lassen. */
  waitlist_region?: string | null
}

/**
 * Angaben, die nach der entschärften Regel (07/2026) KEINEN Stopp mehr auslösen.
 * Muss mit NON_STOPPING_CODES in scoring.ts übereinstimmen.
 */
const KEIN_STOPP_MEHR = new Set(["night_pain_severe", "saddle_tingling"])

export type RedFlagGruppe = "rf1" | "b1"

/**
 * Teilt die 117 Red-Flag-Leads in zwei Gruppen — der heikelste Split im ganzen
 * System.
 *
 * **rf1 (45 Leads):** Gestoppt AUSSCHLIESSLICH wegen „Beschwerden, die dich
 * nachts aufwecken". Nach der entschärften Regel wäre keiner von ihnen gestoppt
 * worden — nächtlicher Schmerz ist bei chronischen Beschwerden der Normalfall.
 * Wir haben sie schlicht zu Unrecht rausgeworfen. Sie bekommen eine ehrliche
 * Mail und dürfen den Check erneut durchlaufen.
 *
 * **b1 (72 Leads):** Echte Warnzeichen — Sattel-Taubheit, Blasen-/Darm-
 * kontrollverlust, Lähmung, Gewichtsverlust, Fieber, Krebsanamnese. Diese
 * stoppen auch nach der neuen Regel. Sie bekommen NUR die Frage nach der
 * ärztlichen Abklärung, niemals ein Angebot.
 *
 * FAIL CLOSED: Fehlen die Codes (sollte nicht vorkommen — es sind bei allen 117
 * welche gespeichert), landet der Lead in b1. Lieber jemanden zu Unrecht in der
 * vorsichtigen Gruppe als umgekehrt.
 */
export function redFlagGruppe(lead: SegmentableLead): RedFlagGruppe {
  const codes = lead.red_flag_codes
  if (!Array.isArray(codes) || codes.length === 0) return "b1"

  const echteWarnzeichen = codes.filter((c) => !KEIN_STOPP_MEHR.has(c))
  return echteWarnzeichen.length === 0 ? "rf1" : "b1"
}

/**
 * Für welches künftige Regions-Modul kommt dieser Lead in Frage?
 * null = keins (LWS wird bereits bedient, unbekannte Region klärt RT1).
 */
export function waitlistGruppe(lead: SegmentableLead): string | null {
  if (computeSegment(lead) !== "A") return null
  const r = lead.main_region
  if (r === "nacken_schulter" || r === "oberer_ruecken" || r === "knie_huefte_fuss") return r
  return null
}

/** Mail-Code der Wert-/Wartelisten-Mail je Region. */
export const WAITLIST_CODE: Record<string, "N1" | "OB1" | "K1"> = {
  nacken_schulter: "N1",
  oberer_ruecken: "OB1",
  knie_huefte_fuss: "K1",
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

  // Segment B (Red-Flag) darf ausschließlich angebotsfreie Mails bekommen:
  //   B1/B2 → „Warst du beim Arzt?" (die 72 mit echten Warnzeichen)
  //   RF1   → „Check nachgeschärft, hol dir dein Ergebnis" (die 45 Nacht-Stopps)
  // Niemals eine Verkaufsmail. Verhindert, dass ein Bug in der Empfängerliste
  // einem Menschen mit ungeklärten Warnzeichen ein Angebot schickt.
  if (segment === "B" && !/^(B[12]|RF1)$/.test(code)) {
    throw new Error(
      `Segment B (Red-Flag, nicht abgeklärt) darf nur B1/B2/RF1 bekommen — Lead ${lead.id}, Mail ${code}`
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

  // ── PROJ-25c: Der Red-Flag-Split ────────────────────────────────────────────
  // RF1 („wir haben dich zu Unrecht gestoppt, mach weiter") darf NUR an die 45,
  // deren einziger Stopp-Grund der nächtliche Schmerz war. Diese Mail an jemanden
  // mit echter Sattel-Taubheit oder Blasenkontrollverlust zu schicken, wäre grob
  // fahrlässig — sie lädt ihn ein, das Warnzeichen zu ignorieren.
  if (code === "RF1" && redFlagGruppe(lead) !== "rf1") {
    throw new Error(
      `RF1 („Check nachgeschärft") darf NUR an reine Nacht-Stopps — Lead ${lead.id} ` +
        `hat echte Warnzeichen: ${JSON.stringify(lead.red_flag_codes)}`
    )
  }

  // Umgekehrt: B1/B2 („warst du beim Arzt?") an einen der 45 wäre unnötig
  // beunruhigend — wir halten seine Angabe selbst nicht mehr für ein Warnzeichen.
  if (/^B[12]$/.test(code) && redFlagGruppe(lead) !== "b1") {
    throw new Error(
      `B1/B2 (Arzt-Frage) darf NICHT an reine Nacht-Stopps — für die gibt es RF1. Lead ${lead.id}`
    )
  }

  // ── Wartelisten-Mails: nur an die jeweilige Region ──────────────────────────
  if (/^(N1|OB1|K1)$/.test(code)) {
    const gruppe = waitlistGruppe(lead)
    if (!gruppe || WAITLIST_CODE[gruppe] !== code) {
      throw new Error(
        `Wartelisten-Mail ${code} passt nicht zur Region "${lead.main_region ?? "unbekannt"}" — Lead ${lead.id}`
      )
    }
  }
}

/** Für Reporting/Dry-Run: Segmentverteilung einer Lead-Liste. */
export function segmentCounts(leads: SegmentableLead[]): Record<Segment, number> {
  const counts: Record<Segment, number> = { A: 0, B: 0, C: 0, D: 0 }
  for (const lead of leads) counts[computeSegment(lead)]++
  return counts
}
