/**
 * PROJ-26 — Durchlauf beider Varianten, ohne etwas anzulegen.
 *
 * Rendert fuer „Begleitet" und „Intensiv" alles, was der Patient spaeter zu
 * sehen bekommt: Vertragspositionen, die davon abhaengigen Vertragsparagraphen
 * sowie Betreff und Kernsaetze der Angebots- und Willkommensmail.
 *
 *   npx tsx --tsconfig tsconfig.json scripts/pruefe-varianten.ts
 *
 * Schreibt nichts in die Datenbank und verschickt nichts.
 */

import { config } from "dotenv"
import {
  PROGRAMM,
  VARIANTEN,
  VARIANTEN_REIHENFOLGE,
  leistungenFuer,
  buchungsUrl,
  formatEuro,
} from "../src/lib/programm"
import { generateVertragText } from "../src/lib/contract-templates"
import { programmAngebotEmail } from "../src/lib/email-templates/programm-angebot"
import { programmWillkommenEmail } from "../src/lib/email-templates/programm-willkommen"
import type { PraxisSettings } from "../src/types/billing"

config({ path: ".env.local" })

const siteUrl = process.env.NEXT_PUBLIC_SITE_URL ?? "https://wwwpraxis-os.com"

/** Echte Praxisdaten, damit der Vertragstext so aussieht wie im Ernstfall. */
async function ladePraxis(): Promise<PraxisSettings> {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL!
  const key = process.env.SUPABASE_SERVICE_ROLE_KEY!
  const res = await fetch(`${url}/rest/v1/praxis_settings?select=*&limit=1`, {
    headers: { apikey: key, Authorization: `Bearer ${key}` },
  })
  const rows = (await res.json()) as PraxisSettings[]
  if (!rows?.length) throw new Error("praxis_settings ist leer")
  return rows[0]
}

/** Nimmt HTML und gibt die Zeilen zurueck, die einen Suchbegriff enthalten. */
function zeilenMit(html: string, begriffe: string[]): string[] {
  const text = html
    .replace(/<style[\s\S]*?<\/style>/g, " ")
    .replace(/<[^>]+>/g, "\n")
    .replace(/&nbsp;/g, " ")
    .replace(/&amp;/g, "&")
    .replace(/&bdquo;/g, "„")
    .replace(/&ldquo;/g, "“")
    .replace(/&euro;/g, "€")
    .split("\n")
    .map((z) => z.trim())
    .filter(Boolean)
  return text.filter((z) => begriffe.some((b) => z.includes(b)))
}

function trenner(titel: string) {
  console.log("\n" + "═".repeat(74))
  console.log("  " + titel)
  console.log("═".repeat(74))
}

async function main() {
  const praxis = await ladePraxis()
  console.log(`Praxis: ${praxis.praxis_name} — ${praxis.inhaber_name}`)
  console.log(`Programm: ${PROGRAMM.tage} Tage · Konsultation ${formatEuro(PROGRAMM.konsultation)}`)

  for (const id of VARIANTEN_REIHENFOLGE) {
    const v = VARIANTEN[id]
    trenner(`${v.name} — ${formatEuro(v.preis)} · ${v.calls} feste Video-Sitzungen`)

    // 1 — Vertragspositionen
    const leistungen = leistungenFuer(id)
    console.log("\nVertragspositionen:")
    let summe = 0
    for (const l of leistungen) {
      summe += l.preis
      const preis = l.preis > 0 ? formatEuro(l.preis).padStart(10) : "  inklusive"
      console.log(`  ${preis}  ${l.beschreibung}`)
      if (l.details) console.log(`              ↳ ${l.details}`)
    }
    console.log(`  ${"—".repeat(10)}`)
    console.log(`  ${formatEuro(summe).padStart(10)}  Summe der Positionen`)
    console.log(
      summe === v.preis
        ? `  ✓ stimmt mit dem ausgewiesenen Preis überein`
        : `  ✗ WEICHT AB vom ausgewiesenen Preis ${formatEuro(v.preis)}`
    )

    // 2 — Vertragstext, beide Zahlungsfaelle
    for (const bereitsBeglichen of [0, PROGRAMM.konsultation]) {
      const vertrag = generateVertragText({
        contractType: "praxis_os_programm",
        leistungen,
        gesamtpreis: v.preis,
        zahlungsweise: "einmalig",
        bereitsBeglichen,
        programmTage: PROGRAMM.tage,
        sitzungenAnzahl: v.calls > 0 ? v.calls : null,
        praxis,
        patientName: "Erika Musterfrau",
        patientAddress: "Musterweg 1, 15745 Wildau",
        patientGeburtsdatum: "1979-04-12",
      })
      const label =
        bereitsBeglichen === 0
          ? "Konsultation NICHT vorab bezahlt"
          : `Konsultation vorab bezahlt (${formatEuro(bereitsBeglichen)} angerechnet)`
      console.log(`\nVertragstext — ${label}:`)
      const relevant = [
        ...vertrag.leistungsbeschreibung.split("\n"),
        ...vertrag.verguetung.split("\n"),
      ].filter((z) =>
        /Video-Sitzungen|Restbetrag|Gesamtpreis|beglichen|nicht vereinbart/.test(z)
      )
      for (const z of relevant) console.log("  " + z.trim())
    }

    // 3 — Angebotsmail, beide Zahlungsfaelle. Die Preistabelle darin ist die
    //     Stelle, an der ein falscher Abzug dem Patienten sofort auffaellt.
    for (const bereitsBeglichen of [0, PROGRAMM.konsultation]) {
      const angebot = programmAngebotEmail({
        patientName: "Erika",
        variante: id,
        bereitsBeglichen,
        angebotUrl: `${siteUrl}/vertrag/BEISPIEL`,
        contractNumber: "V-2026-0099",
        gueltigBis: "25.09.2026 um 14:30",
        praxisName: praxis.praxis_name,
        behandlerName: praxis.inhaber_name,
        siteUrl,
      })
      console.log(
        `\nAngebotsmail (${formatEuro(bereitsBeglichen)} angerechnet) — Betreff: „${angebot.subject}“`
      )
      for (const z of zeilenMit(angebot.html, ["€", "enthalten", "abgezogen"]).slice(0, 8))
        console.log("  " + z)
    }

    // 4 — Willkommensmail
    const willkommen = programmWillkommenEmail({
      firstName: "Erika",
      variante: id,
      appUrl: `${siteUrl}/app/dashboard`,
      endetAm: "22.12.2026",
      behandlerName: praxis.inhaber_name,
      praxisName: praxis.praxis_name,
      siteUrl,
    })
    console.log(`\nWillkommensmail — Betreff: „${willkommen.subject}“`)
    for (const z of zeilenMit(willkommen.html, ["Video-Sitzung", "Sitzungen", "Chat"]).slice(0, 6))
      console.log("  " + z)

    // 5 — Buchungslink
    console.log(`\nBuchungslink: ${buchungsUrl("preis", id)}`)
  }

  trenner("Gegenprobe")
  const b = leistungenFuer("begleitet")
  const i = leistungenFuer("intensiv")
  const nurIntensiv = i.filter((x) => !b.some((y) => y.beschreibung === x.beschreibung))
  const nurBegleitet = b.filter((x) => !i.some((y) => y.beschreibung === x.beschreibung))
  console.log("\nNur in Intensiv:")
  for (const l of nurIntensiv) console.log("  + " + l.beschreibung)
  console.log("\nNur in Begleitet:")
  for (const l of nurBegleitet) console.log("  + " + l.beschreibung)

  const zusatz = "Kurzfristige zusätzliche Video-Sitzung"
  const inBeiden = b.some((l) => l.beschreibung.includes(zusatz)) && i.some((l) => l.beschreibung.includes(zusatz))
  console.log(
    `\nZusatzsitzung bei Verschlechterung in BEIDEN Varianten: ${inBeiden ? "✓ ja" : "✗ NEIN — Fehler"}`
  )
}

main().catch((e) => {
  console.error(e)
  process.exit(1)
})
