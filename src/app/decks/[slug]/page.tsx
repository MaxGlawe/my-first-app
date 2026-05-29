/**
 * PROJ-24: /decks/[slug] — Deck-Detailseite (Server Component)
 *
 * Server-Component, weil der Deck-Besitz serverseitig geprüft werden muss:
 *   - Eingeloggten User holen (createSupabaseServerClient)
 *   - hasContentAccess(user.id, 'card_deck', product.id)
 *   - Gäste besitzen nie.
 *
 * GATING der Karten-Galerie (Kern):
 *   - Immer frei: cover.png, sicherheit.png (Sicherheitskarte — Haftung!),
 *     karte-01.png.
 *   - karte-02..12: bei Besitz echte Bilder; sonst gesperrte Milchglas-Kacheln
 *     OHNE die echten Bild-URLs (serverseitig entschieden, damit Nicht-Käufer
 *     die URLs nicht im HTML finden).
 *
 * Kauf-Buttons + Freischalt-CTA sind kleine Client-Inseln (DeckBuyActions).
 *
 * Premium-Markenwelt (Paper/Ink/Green/Sand, Serif-Headlines).
 */

import type { Metadata } from "next"
import { notFound } from "next/navigation"
import Image from "next/image"
import {
  CheckCircle2,
  Lock,
  ShieldAlert,
  Sparkles,
  Printer,
  Layers,
} from "lucide-react"
import { ShopHeader } from "@/components/shop/ShopHeader"
import { ProductReviews, ProductReviewsSummary } from "@/components/shop/ProductReviews"
import { createSupabaseServiceClient } from "@/lib/supabase-service"
import { createSupabaseServerClient } from "@/lib/supabase-server"
import { hasContentAccess } from "@/lib/content-access"
import { DeckBuyActions, DeckViewTracker } from "./DeckBuyActions"

// ── Premium-Markenwelt (Masterclass-Format) ──────────────────────────────────

const PAPER = "#F8F5F0"
const INK = "#0f172a"
const MUTED = "#64748b"
const GREEN = "#2C3E2D"
const SAND = "#C9B79C"
const LINE = "#e7e1d6"

const serif = { fontFamily: "var(--font-serif)", fontWeight: 600 } as const

// ── Bild-Pfade ────────────────────────────────────────────────────────────────

function deckImage(slug: string, file: string): string {
  return `/images/decks/${slug}/${file}`
}

/** Karten, die IMMER für alle sichtbar sind (Vorschau inkl. Gäste). */
const FREIE_KARTEN = ["cover.png", "sicherheit.png", "karte-01.png"] as const

/** Inhaltskarten 02..12 — gesperrt, bis das Deck gekauft wurde. */
const GESPERRTE_KARTEN = Array.from({ length: 11 }, (_, i) =>
  `karte-${String(i + 2).padStart(2, "0")}.png`
)

// ── Produkt laden (Service-Client) ──────────────────────────────────────────

interface DeckProduct {
  id: string
  slug: string
  titel: string
  kurzbeschreibung: string | null
  beschreibung: string | null
  hero_bild: string | null
  preis: number
  waehrung: string
}

async function loadDeck(slug: string): Promise<DeckProduct | null> {
  const sc = createSupabaseServiceClient()
  const { data } = await sc
    .from("products")
    .select("id, slug, titel, kurzbeschreibung, beschreibung, hero_bild, preis, waehrung")
    .eq("slug", slug)
    .eq("produkt_typ", "deck")
    .eq("status", "aktiv")
    .maybeSingle()
  return (data as DeckProduct | null) ?? null
}

// ── SEO ─────────────────────────────────────────────────────────────────────

export async function generateMetadata({
  params,
}: {
  params: Promise<{ slug: string }>
}): Promise<Metadata> {
  const { slug } = await params
  try {
    const deck = await loadDeck(slug)
    if (deck) {
      return {
        title: deck.titel,
        description:
          deck.kurzbeschreibung ??
          "Digitale Bewegungskarten von Praxis OS — kurze Bewegungsimpulse für deinen Alltag.",
        alternates: { canonical: `/decks/${slug}` },
      }
    }
  } catch {
    // Fällt auf generischen Titel zurück
  }
  return { title: "Bewegungskarten" }
}

// ── Sicherheits-Karte (Sub-Block) ─────────────────────────────────────────────

function GalerieKarte({
  src,
  alt,
  badge,
  priority = false,
}: {
  src: string
  alt: string
  badge?: string
  priority?: boolean
}) {
  return (
    <div
      className="group relative aspect-[4/5] rounded-2xl overflow-hidden border shadow-sm"
      style={{ backgroundColor: PAPER, borderColor: LINE }}
    >
      <Image
        src={src}
        alt={alt}
        fill
        sizes="(max-width: 640px) 50vw, (max-width: 1024px) 33vw, 240px"
        priority={priority}
        className="object-cover"
      />
      {badge && (
        <div className="absolute top-2.5 left-2.5">
          <span
            className="bg-white/90 backdrop-blur-sm text-[11px] font-semibold px-2.5 py-1 rounded-lg shadow-sm"
            style={{ color: GREEN }}
          >
            {badge}
          </span>
        </div>
      )}
    </div>
  )
}

/** Gesperrte Milchglas-Kachel — rendert NICHT die echte Karten-URL. */
function GesperrteKachel({ blurSrc, nummer }: { blurSrc: string; nummer: number }) {
  return (
    <div
      className="relative aspect-[4/5] rounded-2xl overflow-hidden border"
      style={{ backgroundColor: PAPER, borderColor: LINE }}
    >
      {/* Platzhalter = stark verblurrtes Cover, NICHT die echte Karte */}
      <Image
        src={blurSrc}
        alt=""
        aria-hidden
        fill
        sizes="(max-width: 640px) 50vw, (max-width: 1024px) 33vw, 240px"
        className="object-cover blur-[8px] scale-110 select-none pointer-events-none"
      />
      {/* Weiße Milchglas-Überlagerung */}
      <div className="absolute inset-0 bg-white/55" />
      {/* Schloss + Kartennummer */}
      <div className="absolute inset-0 flex flex-col items-center justify-center gap-2" style={{ color: MUTED }}>
        <div
          className="h-10 w-10 rounded-full bg-white/80 border flex items-center justify-center shadow-sm"
          style={{ borderColor: LINE }}
        >
          <Lock className="h-4 w-4" style={{ color: GREEN }} />
        </div>
        <span className="text-xs font-semibold" style={{ color: MUTED }}>Karte {nummer}</span>
      </div>
    </div>
  )
}

// ── Page ──────────────────────────────────────────────────────────────────────

export default async function DeckDetailPage({
  params,
}: {
  params: Promise<{ slug: string }>
}) {
  const { slug } = await params

  const deck = await loadDeck(slug)
  if (!deck) notFound()

  // ── Besitz serverseitig ermitteln ──────────────────────────────────────────
  const supabase = await createSupabaseServerClient()
  const {
    data: { user },
  } = await supabase.auth.getUser()

  const eingeloggt = !!user
  const besitzt = user ? await hasContentAccess(user.id, "card_deck", deck.id) : false

  const heroPrimary = deck.hero_bild ?? deckImage(slug, "shop-1.png")
  const heroSecondary = deckImage(slug, "shop-2.png")
  const coverBlur = deckImage(slug, "cover.png")

  const preisFmt = deck.preis.toLocaleString("de-DE", {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  })

  // Kauf-Aktionen (Client-Insel) — als Element vorbereitet für Wiederverwendung
  const buyActions = (
    <DeckBuyActions
      slug={deck.slug}
      titel={deck.titel}
      preis={deck.preis}
      waehrung={deck.waehrung}
      heroBild={deck.hero_bild}
      eingeloggt={eingeloggt}
    />
  )

  return (
    <div className="min-h-screen" style={{ backgroundColor: PAPER }}>
      {/* Conversion: Produktansicht für alle Besucher (auch Besitzer) */}
      <DeckViewTracker slug={deck.slug} />
      <ShopHeader mode="website" showBack backHref="/decks" backLabel="Alle Bewegungskarten" />

      <div className="max-w-5xl mx-auto px-4 sm:px-6 py-8 sm:py-12">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 lg:gap-12 items-start">

          {/* ── Links: Inhalt ──────────────────────────────────────────── */}
          <div className="lg:col-span-2 space-y-8">

            {/* Hero-Galerie: shop-1 groß + shop-2 daneben */}
            <div className="grid grid-cols-3 gap-3 sm:gap-4">
              <div
                className="col-span-2 relative aspect-[4/5] rounded-2xl overflow-hidden border shadow-sm animate-fade-in-up"
                style={{ backgroundColor: PAPER, borderColor: LINE }}
              >
                <Image
                  src={heroPrimary}
                  alt={deck.titel}
                  fill
                  sizes="(max-width: 1024px) 66vw, 440px"
                  priority
                  className="object-cover"
                />
              </div>
              <div
                className="col-span-1 relative aspect-[4/5] rounded-2xl overflow-hidden border shadow-sm animate-fade-in-up animation-delay-150"
                style={{ backgroundColor: PAPER, borderColor: LINE }}
              >
                <Image
                  src={heroSecondary}
                  alt={`${deck.titel} — Rückseite`}
                  fill
                  sizes="(max-width: 1024px) 33vw, 220px"
                  className="object-cover"
                />
              </div>
            </div>

            {/* Titel + Kurzbeschreibung */}
            <div className="space-y-3">
              <div className="flex flex-wrap gap-2">
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
                <p className="text-lg leading-relaxed" style={{ color: MUTED }}>
                  {deck.kurzbeschreibung}
                </p>
              )}

              {/* Echte Bewertungen: Schnitt + Anzahl */}
              <ProductReviewsSummary slug={deck.slug} />
            </div>

            {/* Mobile Kauf-/Besitz-Block */}
            <div className="lg:hidden">
              <SidebarBlock
                besitzt={besitzt}
                preisFmt={preisFmt}
                buyActions={buyActions}
              />
            </div>

            {/* Beschreibung */}
            {deck.beschreibung && (
              <div className="space-y-3">
                <h2 className="text-base" style={{ ...serif, color: INK }}>
                  Über diese Bewegungskarten
                </h2>
                <p className="leading-relaxed whitespace-pre-line" style={{ color: "#334155" }}>
                  {deck.beschreibung}
                </p>
              </div>
            )}

            {/* ── Karten-Galerie (GEGATET) ──────────────────────────────── */}
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <h2 className="text-base" style={{ ...serif, color: INK }}>
                  Die Karten im Deck
                </h2>
                <span className="text-xs font-medium" style={{ color: MUTED }}>
                  {FREIE_KARTEN.length - 1 + GESPERRTE_KARTEN.length} Bewegungs-Karten + Sicherheitskarte
                </span>
              </div>

              {/* Sicherheits-Hinweis — IMMER sichtbar (Haftung) */}
              <div className="flex items-start gap-3 rounded-2xl bg-amber-50 border border-amber-200 px-4 py-3.5">
                <ShieldAlert className="h-5 w-5 text-amber-600 mt-0.5 shrink-0" />
                <div>
                  <p className="text-sm font-semibold text-amber-900">
                    Sicherheit zuerst
                  </p>
                  <p className="text-sm text-amber-800 leading-relaxed mt-0.5">
                    Bewege dich nur im geparkten Auto bei angezogener Handbremse,
                    ruhig und im angenehmen Bereich. Die Sicherheitskarte ist
                    für alle frei einsehbar — bitte vor der ersten Karte lesen.
                  </p>
                </div>
              </div>

              {/* Frei sichtbare Vorschau-Karten */}
              <div className="grid grid-cols-2 sm:grid-cols-3 gap-3 sm:gap-4">
                <GalerieKarte
                  src={deckImage(slug, "cover.png")}
                  alt={`${deck.titel} — Deckblatt`}
                  badge="Cover"
                  priority
                />
                <GalerieKarte
                  src={deckImage(slug, "sicherheit.png")}
                  alt={`${deck.titel} — Sicherheitskarte`}
                  badge="Sicherheit"
                />
                <GalerieKarte
                  src={deckImage(slug, "karte-01.png")}
                  alt={`${deck.titel} — Karte 1`}
                  badge="Karte 1"
                />

                {besitzt
                  ? // ── Besitzer: echte Karten 02..12 ──────────────────────
                    GESPERRTE_KARTEN.map((file, i) => (
                      <GalerieKarte
                        key={file}
                        src={deckImage(slug, file)}
                        alt={`${deck.titel} — Karte ${i + 2}`}
                        badge={`Karte ${i + 2}`}
                      />
                    ))
                  : // ── Nicht-Besitzer: Milchglas-Platzhalter (KEINE echten URLs/Dateinamen) ──
                    // Über die Länge iterieren (kein Dateiname als key — sonst leakt er in den RSC-Payload).
                    Array.from({ length: GESPERRTE_KARTEN.length }).map((_, i) => (
                      <GesperrteKachel
                        key={`locked-${i}`}
                        blurSrc={coverBlur}
                        nummer={i + 2}
                      />
                    ))}
              </div>

              {/* Besitzer: Druck-Tipp ───────────────────────────────────── */}
              {besitzt && (
                <div
                  className="flex items-start gap-2.5 rounded-2xl border px-4 py-3.5"
                  style={{ backgroundColor: "rgba(44,62,45,0.05)", borderColor: LINE }}
                >
                  <Printer className="h-4 w-4 mt-0.5 shrink-0" style={{ color: GREEN }} />
                  <p className="text-sm leading-relaxed" style={{ color: "#334155" }}>
                    <span className="font-semibold" style={{ color: INK }}>Tipp:</span> Karten
                    ausdrucken fürs Handschuhfach — so hast du sie unterwegs ohne
                    Handy griffbereit.
                  </p>
                </div>
              )}

              {/* Nicht-Besitzer: Freischalt-Block ────────────────────────── */}
              {!besitzt && (
                <div
                  className="rounded-2xl p-6 relative overflow-hidden"
                  style={{ backgroundColor: GREEN, color: PAPER }}
                >
                  <div
                    aria-hidden
                    className="absolute -top-8 -right-8 h-32 w-32 rounded-full pointer-events-none"
                    style={{ background: "radial-gradient(circle, rgba(201,183,156,0.30) 0%, transparent 70%)" }}
                  />
                  <div className="relative space-y-4">
                    <div className="flex items-center gap-3">
                      <div
                        className="h-10 w-10 rounded-xl flex items-center justify-center shrink-0"
                        style={{ backgroundColor: "rgba(248,245,240,0.12)" }}
                      >
                        <Sparkles className="h-5 w-5" style={{ color: SAND }} />
                      </div>
                      <div>
                        <p className="font-semibold" style={{ color: PAPER }}>
                          Noch {GESPERRTE_KARTEN.length} Karten — schalte das komplette Deck mit dem Kauf frei
                        </p>
                        <p className="text-sm mt-0.5" style={{ color: "rgba(248,245,240,0.8)" }}>
                          Cover, Sicherheitskarte und Karte 1 siehst du gratis. Der
                          Kauf schaltet alle {GESPERRTE_KARTEN.length} weiteren
                          Karten dauerhaft frei.
                        </p>
                      </div>
                    </div>
                    <div className="max-w-sm">{buyActions}</div>
                  </div>
                </div>
              )}
            </div>

            {/* Bewertungen */}
            <ProductReviews
              slug={deck.slug}
              isLoggedIn={eingeloggt}
              canReview={besitzt}
            />
          </div>

          {/* ── Rechts: Sticky Kauf-/Besitz-Block ──────────────────────── */}
          <div className="hidden lg:block">
            <div className="sticky top-20 space-y-4">
              <SidebarBlock
                besitzt={besitzt}
                preisFmt={preisFmt}
                buyActions={buyActions}
              />
            </div>
          </div>
        </div>
      </div>

      <footer className="border-t mt-12 py-8" style={{ borderColor: LINE }}>
        <div className="max-w-5xl mx-auto px-4 sm:px-6 text-center">
          <p className="text-xs" style={{ color: MUTED }}>
            © {new Date().getFullYear()} Praxis OS · Alle Preise inkl. MwSt.
          </p>
        </div>
      </footer>
    </div>
  )
}

// ── Sidebar-Block (Besitz-Hinweis ODER Preis + Kauf) ───────────────────────────

function SidebarBlock({
  besitzt,
  preisFmt,
  buyActions,
}: {
  besitzt: boolean
  preisFmt: string
  buyActions: React.ReactNode
}) {
  if (besitzt) {
    return (
      <div
        className="rounded-2xl border p-6 space-y-3"
        style={{ borderColor: GREEN, backgroundColor: "rgba(44,62,45,0.05)" }}
      >
        <div className="flex items-center gap-3">
          <div
            className="w-10 h-10 rounded-xl flex items-center justify-center"
            style={{ backgroundColor: "rgba(44,62,45,0.1)" }}
          >
            <CheckCircle2 className="h-5 w-5" style={{ color: GREEN }} />
          </div>
          <div>
            <p className="font-semibold" style={{ color: INK }}>✓ Du besitzt diese Bewegungskarten</p>
            <p className="text-sm" style={{ color: MUTED }}>Lebenslanger Zugriff · freigeschaltet</p>
          </div>
        </div>
        <p className="text-sm leading-relaxed" style={{ color: "#334155" }}>
          Alle Karten sind oben in voller Größe für dich freigeschaltet.
        </p>
      </div>
    )
  }

  return (
    <div className="rounded-2xl bg-white border p-6 space-y-5 shadow-sm" style={{ borderColor: LINE }}>
      <div>
        <div className="flex items-baseline gap-3 mb-1">
          <span className="text-3xl font-bold" style={{ color: INK }}>{preisFmt} €</span>
        </div>
        <p className="text-sm" style={{ color: MUTED }}>
          Einmalig · Lebenslanger Zugriff · inkl. MwSt.
        </p>
      </div>
      {buyActions}
    </div>
  )
}
