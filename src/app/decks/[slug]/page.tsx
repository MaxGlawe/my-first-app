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
    <div className="group relative aspect-[4/5] rounded-2xl overflow-hidden bg-slate-100 border border-slate-200 shadow-sm">
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
          <span className="bg-white/90 backdrop-blur-sm text-slate-700 text-[11px] font-semibold px-2.5 py-1 rounded-lg shadow-sm">
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
    <div className="relative aspect-[4/5] rounded-2xl overflow-hidden bg-slate-100 border border-slate-200">
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
      <div className="absolute inset-0 flex flex-col items-center justify-center gap-2 text-slate-400">
        <div className="h-10 w-10 rounded-full bg-white/80 border border-slate-200 flex items-center justify-center shadow-sm">
          <Lock className="h-4 w-4 text-slate-500" />
        </div>
        <span className="text-xs font-semibold text-slate-500">Karte {nummer}</span>
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
    <div className="min-h-screen bg-slate-50">
      {/* Conversion: Produktansicht für alle Besucher (auch Besitzer) */}
      <DeckViewTracker slug={deck.slug} />
      <ShopHeader mode="website" showBack backHref="/decks" backLabel="Alle Bewegungskarten" />

      <div className="max-w-5xl mx-auto px-4 sm:px-6 py-8 sm:py-12">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 lg:gap-12 items-start">

          {/* ── Links: Inhalt ──────────────────────────────────────────── */}
          <div className="lg:col-span-2 space-y-8">

            {/* Hero-Galerie: shop-1 groß + shop-2 daneben */}
            <div className="grid grid-cols-3 gap-3 sm:gap-4">
              <div className="col-span-2 relative aspect-[4/5] rounded-2xl overflow-hidden bg-slate-100 border border-slate-200 shadow-sm animate-fade-in-up">
                <Image
                  src={heroPrimary}
                  alt={deck.titel}
                  fill
                  sizes="(max-width: 1024px) 66vw, 440px"
                  priority
                  className="object-cover"
                />
              </div>
              <div className="col-span-1 relative aspect-[4/5] rounded-2xl overflow-hidden bg-slate-100 border border-slate-200 shadow-sm animate-fade-in-up animation-delay-150">
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
                <span className="inline-flex items-center gap-1.5 text-xs font-medium text-emerald-700 border border-emerald-200 bg-emerald-50 px-2.5 py-1 rounded-full">
                  <Layers className="h-3.5 w-3.5" />
                  Bewegungskarten
                </span>
              </div>

              <h1 className="text-2xl sm:text-3xl font-bold text-slate-900 leading-snug">
                {deck.titel}
              </h1>

              {deck.kurzbeschreibung && (
                <p className="text-lg text-slate-500 leading-relaxed">
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
                <h2 className="text-base font-semibold text-slate-900">
                  Über diese Bewegungskarten
                </h2>
                <p className="text-slate-600 leading-relaxed whitespace-pre-line">
                  {deck.beschreibung}
                </p>
              </div>
            )}

            {/* ── Karten-Galerie (GEGATET) ──────────────────────────────── */}
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <h2 className="text-base font-semibold text-slate-900">
                  Die Karten im Deck
                </h2>
                <span className="text-xs font-medium text-slate-400">
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
                <div className="flex items-start gap-2.5 rounded-2xl bg-slate-100 border border-slate-200 px-4 py-3.5">
                  <Printer className="h-4 w-4 text-slate-500 mt-0.5 shrink-0" />
                  <p className="text-sm text-slate-600 leading-relaxed">
                    <span className="font-semibold text-slate-700">Tipp:</span> Karten
                    ausdrucken fürs Handschuhfach — so hast du sie unterwegs ohne
                    Handy griffbereit.
                  </p>
                </div>
              )}

              {/* Nicht-Besitzer: Freischalt-Block ────────────────────────── */}
              {!besitzt && (
                <div className="rounded-2xl bg-gradient-to-br from-slate-900 to-slate-800 p-6 text-white relative overflow-hidden">
                  <div className="absolute -top-8 -right-8 h-32 w-32 rounded-full bg-emerald-500/15 blur-2xl pointer-events-none" />
                  <div className="relative space-y-4">
                    <div className="flex items-center gap-3">
                      <div className="h-10 w-10 rounded-xl bg-white/10 flex items-center justify-center shrink-0">
                        <Sparkles className="h-5 w-5 text-emerald-400" />
                      </div>
                      <div>
                        <p className="font-semibold text-white">
                          Noch {GESPERRTE_KARTEN.length} Karten — schalte das komplette Deck mit dem Kauf frei
                        </p>
                        <p className="text-sm text-slate-300 mt-0.5">
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

      <footer className="border-t border-slate-200 mt-12 py-8">
        <div className="max-w-5xl mx-auto px-4 sm:px-6 text-center">
          <p className="text-xs text-slate-400">
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
      <div className="rounded-2xl bg-emerald-50 border border-emerald-200 p-6 space-y-3">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 bg-emerald-100 rounded-xl flex items-center justify-center">
            <CheckCircle2 className="h-5 w-5 text-emerald-600" />
          </div>
          <div>
            <p className="font-semibold text-emerald-900">✓ Du besitzt diese Bewegungskarten</p>
            <p className="text-sm text-emerald-700">Lebenslanger Zugriff · freigeschaltet</p>
          </div>
        </div>
        <p className="text-sm text-emerald-700 leading-relaxed">
          Alle Karten sind oben in voller Größe für dich freigeschaltet.
        </p>
      </div>
    )
  }

  return (
    <div className="rounded-2xl bg-white border border-slate-200 p-6 space-y-5 shadow-sm">
      <div>
        <div className="flex items-baseline gap-3 mb-1">
          <span className="text-3xl font-bold text-slate-900">{preisFmt} €</span>
        </div>
        <p className="text-sm text-slate-500">
          Einmalig · Lebenslanger Zugriff · inkl. MwSt.
        </p>
      </div>
      {buyActions}
    </div>
  )
}
