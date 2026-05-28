import { Source_Serif_4 } from "next/font/google";

/**
 * Editorial-Serif für die Bonus-Kartendeck-Seite (Premium-Headlines & Lead).
 * Identisch zur Workbook-Welt geladen — global bleibt Space Grotesk (Display)
 * + Inter (Body) unverändert. Wird als CSS-Variable `--font-serif` am Wrapper
 * gesetzt.
 */
export const sourceSerif = Source_Serif_4({
  subsets: ["latin"],
  display: "swap",
  variable: "--font-serif",
  weight: ["400", "500", "600"],
  style: ["normal", "italic"],
});
