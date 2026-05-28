/**
 * Bonus-Übungskartendeck zur Masterclass „Chronischer Kreuzschmerz".
 *
 * 25 Karten (Hochformat): Cover + Sicherheitskarte + 23 Übungskarten in vier
 * Kategorien (Mobilisation, Stabilisation, Belastungstoleranz, Atmung &
 * Entlastung). Die Karten-Bilder liegen unter
 * `public/images/masterclass/chronischer-kreuzschmerz/kartendeck/`.
 *
 * Die Karten selbst tragen allen Inhalt (Kategorie, Titel, Wdh./Dauer,
 * Zielregion, Anleitung, „Warum", Mantra) — hier nur Metadaten für Ansicht,
 * Reihenfolge, Gruppierung und Barrierefreiheit (alt-Text).
 */

export type DeckKategorie =
  | "Mobilisation"
  | "Stabilisation"
  | "Belastungstoleranz"
  | "Atmung & Entlastung";

export interface DeckCard {
  src: string;
  alt: string;
  kind: "cover" | "safety" | "exercise";
  /** Übungskartencode, z.B. „ÜK-M1" (nur bei kind === "exercise"). */
  code?: string;
  title?: string;
  untertitel?: string;
  kategorie?: DeckKategorie;
}

const BASE = "/images/masterclass/chronischer-kreuzschmerz/kartendeck";

/** Reihenfolge des Decks: Cover · Sicherheit · M · S · B · A. */
export const DECK_CARDS: DeckCard[] = [
  {
    src: `${BASE}/00-cover.png`,
    kind: "cover",
    alt: "Übungskartendeck Chronischer Kreuzschmerz — Cover, Companion zur Audio-Masterclass",
  },
  {
    src: `${BASE}/01-sicherheit.png`,
    kind: "safety",
    alt: "Sicherheitskarte: Sicher bewegen — Wichtige Hinweise vor, während und nach der Übung",
  },

  // — Mobilisation (ÜK-M1 … ÜK-M7) —
  { src: `${BASE}/uk-m1.png`, kind: "exercise", code: "ÜK-M1", title: "Cat-Cow", untertitel: "Katze–Kuh", kategorie: "Mobilisation", alt: "ÜK-M1 — Cat-Cow (Katze–Kuh)" },
  { src: `${BASE}/uk-m2.png`, kind: "exercise", code: "ÜK-M2", title: "Knee-to-Chest", untertitel: "Knie zur Brust", kategorie: "Mobilisation", alt: "ÜK-M2 — Knee-to-Chest (Knie zur Brust)" },
  { src: `${BASE}/uk-m3.png`, kind: "exercise", code: "ÜK-M3", title: "Pelvic Tilt", untertitel: "Beckenkippung", kategorie: "Mobilisation", alt: "ÜK-M3 — Pelvic Tilt (Beckenkippung)" },
  { src: `${BASE}/uk-m4.png`, kind: "exercise", code: "ÜK-M4", title: "Thorakale Rotation", untertitel: "Brustwirbelsäule öffnen", kategorie: "Mobilisation", alt: "ÜK-M4 — Thorakale Rotation (Brustwirbelsäule öffnen)" },
  { src: `${BASE}/uk-m5.png`, kind: "exercise", code: "ÜK-M5", title: "Hüftbeuger-Mobilisation", kategorie: "Mobilisation", alt: "ÜK-M5 — Hüftbeuger-Mobilisation" },
  { src: `${BASE}/uk-m6.png`, kind: "exercise", code: "ÜK-M6", title: "Beinkreisen", untertitel: "Hip Circles", kategorie: "Mobilisation", alt: "ÜK-M6 — Beinkreisen (Hip Circles)" },
  { src: `${BASE}/uk-m7.png`, kind: "exercise", code: "ÜK-M7", title: "Schultern-Roll", untertitel: "Schultergürtel mobilisieren", kategorie: "Mobilisation", alt: "ÜK-M7 — Schultern-Roll (Schultergürtel mobilisieren)" },

  // — Stabilisation (ÜK-S1 … ÜK-S6) —
  { src: `${BASE}/uk-s1.png`, kind: "exercise", code: "ÜK-S1", title: "TVA + Beckenboden", untertitel: "Aktivierung", kategorie: "Stabilisation", alt: "ÜK-S1 — TVA + Beckenboden Aktivierung" },
  { src: `${BASE}/uk-s2.png`, kind: "exercise", code: "ÜK-S2", title: "Dead Bug", untertitel: "Diagonale Stabilität", kategorie: "Stabilisation", alt: "ÜK-S2 — Dead Bug (Diagonale Stabilität)" },
  { src: `${BASE}/uk-s3.png`, kind: "exercise", code: "ÜK-S3", title: "Bird Dog", untertitel: "Vogel–Hund", kategorie: "Stabilisation", alt: "ÜK-S3 — Bird Dog (Vogel–Hund)" },
  { src: `${BASE}/uk-s4.png`, kind: "exercise", code: "ÜK-S4", title: "Side Plank", untertitel: "Seitstütz", kategorie: "Stabilisation", alt: "ÜK-S4 — Side Plank (Seitstütz)" },
  { src: `${BASE}/uk-s5.png`, kind: "exercise", code: "ÜK-S5", title: "Step-up", untertitel: "Kontrollierter Aufstieg", kategorie: "Stabilisation", alt: "ÜK-S5 — Step-up (Kontrollierter Aufstieg)" },
  { src: `${BASE}/uk-s6.png`, kind: "exercise", code: "ÜK-S6", title: "Plank", untertitel: "Unterarmstütz", kategorie: "Stabilisation", alt: "ÜK-S6 — Plank (Unterarmstütz)" },

  // — Belastungstoleranz (ÜK-B1 … ÜK-B7) —
  { src: `${BASE}/uk-b1.png`, kind: "exercise", code: "ÜK-B1", title: "Hip Hinge", untertitel: "Hüftgelenks-Beugung", kategorie: "Belastungstoleranz", alt: "ÜK-B1 — Hip Hinge (Hüftgelenks-Beugung)" },
  { src: `${BASE}/uk-b2.png`, kind: "exercise", code: "ÜK-B2", title: "Goblet Squat", untertitel: "Beugen unter Last", kategorie: "Belastungstoleranz", alt: "ÜK-B2 — Goblet Squat (Beugen unter Last)" },
  { src: `${BASE}/uk-b3.png`, kind: "exercise", code: "ÜK-B3", title: "Romanian Deadlift", untertitel: "RDL", kategorie: "Belastungstoleranz", alt: "ÜK-B3 — Romanian Deadlift (RDL)" },
  { src: `${BASE}/uk-b4.png`, kind: "exercise", code: "ÜK-B4", title: "Farmer's Walk", untertitel: "Tragen unter Spannung", kategorie: "Belastungstoleranz", alt: "ÜK-B4 — Farmer's Walk (Tragen unter Spannung)" },
  { src: `${BASE}/uk-b5.png`, kind: "exercise", code: "ÜK-B5", title: "Suitcase Carry", untertitel: "Einseitig tragen", kategorie: "Belastungstoleranz", alt: "ÜK-B5 — Suitcase Carry (Einseitig tragen)" },
  { src: `${BASE}/uk-b6.png`, kind: "exercise", code: "ÜK-B6", title: "Step-up belastet", untertitel: "Aufstieg mit Last", kategorie: "Belastungstoleranz", alt: "ÜK-B6 — Step-up belastet (Aufstieg mit Last)" },
  { src: `${BASE}/uk-b7.png`, kind: "exercise", code: "ÜK-B7", title: "Floor-to-Stand", untertitel: "Vom Boden aufstehen", kategorie: "Belastungstoleranz", alt: "ÜK-B7 — Floor-to-Stand (Vom Boden aufstehen)" },

  // — Atmung & Entlastung (ÜK-A1 … ÜK-A3) —
  { src: `${BASE}/uk-a1.png`, kind: "exercise", code: "ÜK-A1", title: "360°-Atmung", untertitel: "Rundum atmen", kategorie: "Atmung & Entlastung", alt: "ÜK-A1 — 360°-Atmung (Rundum atmen)" },
  { src: `${BASE}/uk-a2.png`, kind: "exercise", code: "ÜK-A2", title: "Box Breathing", untertitel: "Quadrat-Atmung", kategorie: "Atmung & Entlastung", alt: "ÜK-A2 — Box Breathing (Quadrat-Atmung)" },
  { src: `${BASE}/uk-a3.png`, kind: "exercise", code: "ÜK-A3", title: "Crocodile Breathing", untertitel: "Bauchatmung in Bauchlage", kategorie: "Atmung & Entlastung", alt: "ÜK-A3 — Crocodile Breathing (Bauchatmung in Bauchlage)" },
];

/** Die vier Übungs-Kategorien in Anzeigereihenfolge. */
export const DECK_KATEGORIEN: DeckKategorie[] = [
  "Mobilisation",
  "Stabilisation",
  "Belastungstoleranz",
  "Atmung & Entlastung",
];

/** Anzahl echter Übungskarten (ohne Cover/Sicherheit). */
export const DECK_UEBUNGEN = DECK_CARDS.filter((c) => c.kind === "exercise").length;
