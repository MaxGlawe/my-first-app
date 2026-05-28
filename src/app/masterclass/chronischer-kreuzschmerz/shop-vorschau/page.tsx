import type { Metadata } from "next";

import {
  MasterclassSalesLayout,
  type MasterclassProduct,
} from "@/components/shop/MasterclassSalesLayout";

/**
 * TEMPORÄRE Vorschau der Masterclass-Verkaufsseite.
 *
 * Rendert das echte `MasterclassSalesLayout` mit Test-Produktdaten (399/499 €),
 * damit die Platzierung angesehen werden kann, OHNE das Produkt in der DB
 * anzulegen (das Produkt geht erst beim Launch live). Nach dem Launch ist die
 * echte Seite unter `/shop/chronischer-kreuzschmerz` — diese Vorschau kann
 * dann entfernt werden.
 */
export const metadata: Metadata = {
  title: "Vorschau · Verkaufsseite Masterclass",
  robots: { index: false, follow: false },
};

const PREVIEW_PRODUCT: MasterclassProduct = {
  slug: "chronischer-kreuzschmerz",
  titel: "Masterclass · Chronischer Kreuzschmerz",
  kurzbeschreibung:
    "27 vertonte Lektionen, interaktives Workbook und ein Bonus-Übungskartendeck — dein strukturierter Weg im Umgang mit chronischem Kreuzschmerz, in deinem Tempo.",
  beschreibung:
    "Die Masterclass Chronischer Kreuzschmerz bringt das, was Patienten in der Praxis bekommen, strukturiert und ortsunabhängig zu dir: 27 vertonte Lektionen in sechs Sektionen (Verstehen, Handeln, Bleiben, Wiederkommen), ein interaktives Workbook zum Mitmachen und Ausdrucken sowie ein Bonus-Übungskartendeck für unterwegs. Schritt für Schritt vom Verstehen deines Schmerzes bis zu den Werkzeugen für deinen Alltag.",
  produkt_typ: "masterclass",
  preis: 399,
  preis_regulaer: 499,
  waehrung: "eur",
  zugriff_status: "kaufbar",
  effektiver_preis: 399,
  hat_aktives_abo: false,
  eingeloggt: false,
};

export default function ShopVorschauPage() {
  return (
    <main>
      <div
        style={{
          backgroundColor: "#2C3E2D",
          color: "#F8F5F0",
          textAlign: "center",
          padding: "10px 16px",
          fontSize: "13px",
          letterSpacing: "0.02em",
        }}
      >
        Vorschau der Verkaufsseite · Testdaten, noch nicht live · echte Seite nach Launch unter /shop/chronischer-kreuzschmerz
      </div>
      <MasterclassSalesLayout product={PREVIEW_PRODUCT} />
    </main>
  );
}
