/**
 * /karten/[slug] — Accountloser Karten-Zugang (Bewegungskarten).
 *
 * Öffentliche Server-Component. Käufer von Bewegungskarten (produkt_typ='deck')
 * erhalten nach dem Kauf eine Bestätigungs-Mail mit einem Link der Form
 *   /karten/<slug>?t=<signierter-token>
 * Dieser Token (HS256, purpose='deck_access') ersetzt den Login: kein Account,
 * kein Cookie. Der Token wird hier serverseitig verifiziert und MUSS zum
 * angefragten Slug passen.
 *
 * Bei gültigem Token rendert die Seite ALLE Karten des Decks (Cover,
 * Sicherheitskarte, Karte 01–12) in voller Größe + einen prominenten
 * Sicherheits-Hinweis + einen „Drucken / Als PDF speichern"-Button. Die
 * Druck-CSS blendet beim Druck alles außer den Karten aus.
 *
 * Diese Route ist in supabase-middleware.ts als publicRoute eingetragen und
 * via layout.tsx auf robots:noindex gesetzt (token-spezifische URLs).
 *
 * Premium-Markenwelt (Paper/Ink/Green/Sand, Serif-Headlines).
 */

import { ShieldAlert, Lock, Layers, CheckCircle2 } from "lucide-react"
import Image from "next/image"
import Link from "next/link"
import { createSupabaseServiceClient } from "@/lib/supabase-service"
import { verifyDeckToken } from "@/lib/deck-token"
import { PrintButton } from "./PrintButton"

// ── Premium-Markenwelt (Masterclass-Format) ──────────────────────────────────

const PAPER = "#F8F5F0"
const INK = "#0f172a"
const MUTED = "#64748b"
const GREEN = "#2C3E2D"
const LINE = "#e7e1d6"

const serif = { fontFamily: "var(--font-serif)", fontWeight: 600 } as const

// ── Bild-Pfade ────────────────────────────────────────────────────────────────

function deckImage(slug: string, file: string): string {
  return `/images/decks/${slug}/${file}`
}

/** Reihenfolge der Karten im Deck: Cover, Sicherheitskarte, dann Karte 01–12. */
function buildCardList(slug: string): { src: string; alt: string; badge: string }[] {
  const cards: { src: string; alt: string; badge: string }[] = [
    { src: deckImage(slug, "cover.png"), alt: "Deckblatt", badge: "Cover" },
    { src: deckImage(slug, "sicherheit.png"), alt: "Sicherheitskarte", badge: "Sicherheit" },
  ]
  for (let i = 1; i <= 12; i++) {
    const n = String(i).padStart(2, "0")
    cards.push({
      src: deckImage(slug, `karte-${n}.png`),
      alt: `Bewegungskarte ${i}`,
      badge: `Karte ${i}`,
    })
  }
  return cards
}

// ── Produkt laden ──────────────────────────────────────────────────────────────

interface DeckProduct {
  id: string
  slug: string
  titel: string
  kurzbeschreibung: string | null
}

async function loadDeck(slug: string): Promise<DeckProduct | null> {
  const sc = createSupabaseServiceClient()
  const { data } = await sc
    .from("products")
    .select("id, slug, titel, kurzbeschreibung")
    .eq("slug", slug)
    .eq("produkt_typ", "deck")
    .maybeSingle()
  return (data as DeckProduct | null) ?? null
}

// ── Fehler-Ansicht: ungültiger/abgelaufener Link ───────────────────────────────

function UngueltigerLink() {
  return (
    <div className="min-h-screen flex items-center justify-center px-4 py-16">
      <div
        className="max-w-md w-full bg-white border rounded-2xl shadow-sm p-8 text-center"
        style={{ borderColor: LINE }}
      >
        <div
          className="mx-auto mb-5 h-14 w-14 rounded-2xl flex items-center justify-center"
          style={{ backgroundColor: "rgba(44,62,45,0.1)" }}
        >
          <Lock className="h-6 w-6" style={{ color: GREEN }} />
        </div>
        <h1 className="text-xl mb-2" style={{ ...serif, color: INK }}>
          Link ungültig oder abgelaufen
        </h1>
        <p className="text-sm leading-relaxed mb-6" style={{ color: MUTED }}>
          Dieser Karten-Link konnte nicht überprüft werden. Bitte öffne den Link
          direkt aus deiner Kaufbestätigungs-E-Mail — dort findest du immer den
          aktuellen, gültigen Zugang zu deinen Bewegungskarten.
        </p>
        <p className="text-xs leading-relaxed" style={{ color: MUTED }}>
          Du findest deine E-Mail nicht mehr? Schreib uns an{" "}
          <a
            href="mailto:physiotherapieglawe@gmx.de"
            className="font-medium hover:underline"
            style={{ color: GREEN }}
          >
            physiotherapieglawe@gmx.de
          </a>{" "}
          — wir helfen dir weiter.
        </p>
      </div>
    </div>
  )
}

// ── Page ──────────────────────────────────────────────────────────────────────

export default async function KartenPage({
  params,
  searchParams,
}: {
  params: Promise<{ slug: string }>
  searchParams: Promise<{ t?: string }>
}) {
  const { slug } = await params
  const { t } = await searchParams

  // ── Token verifizieren: muss existieren UND zum Slug passen ──────────────────
  const tokenSlug = verifyDeckToken(t ?? null)
  if (!tokenSlug || tokenSlug !== slug) {
    return <UngueltigerLink />
  }

  // ── Deck-Produkt laden ──────────────────────────────────────────────────────
  const deck = await loadDeck(slug)
  if (!deck) {
    // Token ist gültig, aber das Produkt existiert nicht (mehr) — freundlicher Hinweis.
    return <UngueltigerLink />
  }

  const cards = buildCardList(slug)

  return (
    <>
      {/* Druck-freundliche CSS: beim Druck nur die Karten, sauber je eine pro Seite. */}
      <style>{`
        @media print {
          body { background: #ffffff !important; }
          .no-print { display: none !important; }
          .print-area { max-width: none !important; margin: 0 !important; padding: 0 !important; }
          .print-card {
            break-inside: avoid;
            page-break-inside: avoid;
            page-break-after: always;
            border: none !important;
            box-shadow: none !important;
            border-radius: 0 !important;
          }
          .print-card:last-child { page-break-after: auto; }
          .print-card-badge { display: none !important; }
        }
      `}</style>

      <main className="max-w-3xl mx-auto px-4 sm:px-6 py-8 sm:py-12 print-area">
        {/* ── Kopf ───────────────────────────────────────────────────────────── */}
        <header className="no-print mb-8">
          <div className="flex items-center gap-2 mb-3">
            <span
              className="inline-flex items-center gap-1.5 text-xs font-medium px-2.5 py-1 rounded-full"
              style={{ color: GREEN, backgroundColor: "rgba(44,62,45,0.1)" }}
            >
              <Layers className="h-3.5 w-3.5" />
              Bewegungskarten
            </span>
          </div>

          <h1 className="text-2xl sm:text-3xl leading-snug" style={{ ...serif, color: INK }}>
            {deck.titel}
          </h1>

          {deck.kurzbeschreibung && (
            <p className="mt-2 text-base leading-relaxed" style={{ color: MUTED }}>
              {deck.kurzbeschreibung}
            </p>
          )}

          {/* Besitz-/Zugang-Hinweis */}
          <div
            className="mt-5 flex items-start gap-3 rounded-2xl border px-4 py-3.5"
            style={{ backgroundColor: "rgba(44,62,45,0.05)", borderColor: GREEN }}
          >
            <CheckCircle2 className="h-5 w-5 mt-0.5 shrink-0" style={{ color: GREEN }} />
            <div>
              <p className="text-sm font-semibold" style={{ color: INK }}>
                Dein Zugang ist freigeschaltet
              </p>
              <p className="text-sm leading-relaxed mt-0.5" style={{ color: "#334155" }}>
                Alle Karten sind unten in voller Größe für dich da. Kein Konto
                nötig — leg dir diesen Link als Lesezeichen an, dann hast du deine
                Karten jederzeit griffbereit.
              </p>
            </div>
          </div>
        </header>

        {/* ── Sicherheits-Hinweis (prominent, amber) ─────────────────────────── */}
        <div className="no-print mb-6 flex items-start gap-3 rounded-2xl bg-amber-50 border border-amber-200 px-4 py-4">
          <ShieldAlert className="h-5 w-5 text-amber-600 mt-0.5 shrink-0" />
          <div>
            <p className="text-sm font-semibold text-amber-900">Sicherheit zuerst</p>
            <p className="text-sm text-amber-800 leading-relaxed mt-0.5">
              Bewege dich nur im <strong>geparkten Auto bei angezogener Handbremse</strong>,
              ruhig und im angenehmen Bereich. Bitte lies die Sicherheitskarte, bevor
              du mit der ersten Bewegung startest.
            </p>
          </div>
        </div>

        {/* ── Aktionen ───────────────────────────────────────────────────────── */}
        <div className="no-print mb-8 flex flex-wrap items-center gap-3">
          <PrintButton />
          <span className="text-xs" style={{ color: MUTED }}>
            {cards.length} Karten · Tipp: ausdrucken fürs Handschuhfach
          </span>
        </div>

        {/* ── Karten-Galerie (volle Größe) ───────────────────────────────────── */}
        <div className="space-y-6 sm:space-y-8">
          {cards.map((card, i) => (
            <figure
              key={card.src}
              className="print-card relative rounded-2xl overflow-hidden bg-white border shadow-sm"
              style={{ borderColor: LINE }}
            >
              <span
                className="print-card-badge no-print absolute top-3 left-3 z-10 bg-white/90 backdrop-blur-sm text-[11px] font-semibold px-2.5 py-1 rounded-lg shadow-sm"
                style={{ color: GREEN }}
              >
                {card.badge}
              </span>
              <Image
                src={card.src}
                alt={`${deck.titel} — ${card.alt}`}
                width={1200}
                height={1500}
                sizes="(max-width: 768px) 100vw, 768px"
                priority={i < 2}
                className="w-full h-auto"
              />
            </figure>
          ))}
        </div>

        {/* ── Footer ─────────────────────────────────────────────────────────── */}
        <footer className="no-print border-t mt-12 pt-8 text-center" style={{ borderColor: LINE }}>
          <p className="text-xs" style={{ color: MUTED }}>
            © {new Date().getFullYear()} Physiotherapie Glawe — Praxis OS
          </p>
          <p className="mt-1 text-xs" style={{ color: MUTED }}>
            <Link href="/impressum" className="hover:underline">
              Impressum
            </Link>{" "}
            ·{" "}
            <Link href="/datenschutz" className="hover:underline">
              Datenschutz
            </Link>
          </p>
        </footer>
      </main>
    </>
  )
}
