"use client"

/**
 * Bespoke Premium-Verkaufslayout der Masterclass „Chronischer Kreuzschmerz".
 *
 * Wird ausschließlich vom In-App-Shop (`/shop/[slug]`) gerendert, wenn das
 * geladene Produkt die Masterclass ist (`produkt_typ === 'masterclass'`). Für
 * alle anderen Produkte bleibt das generische Detail-Rendering unverändert.
 *
 * Design folgt der Masterclass-/Workbook-Welt: Off-White-Papier, Tinte,
 * Anthrazit-Grün, Sand, Serif-Headlines (`var(--font-display)`), großzügiger
 * Weißraum, mobil-first. HWG-konform — keine Heilversprechen.
 *
 * Kauf-CTA dockt exakt an den bestehenden Checkout-Mechanismus an:
 *   - eingeloggt → POST /api/shop/checkout      ({ productSlug })
 *   - Gast       → POST /api/shop/public-checkout ({ productSlug, email, … })
 * Besitz-/Abo-Status (zugriff_status) wird übernommen.
 */

import { useState, useEffect, type FormEvent } from "react"
import Link from "next/link"
import Image from "next/image"
import {
  Headphones,
  Clock,
  Layers,
  BookOpen,
  PenLine,
  Play,
  ArrowRight,
  ArrowUpRight,
  CheckCircle2,
  Loader2,
  ShieldCheck,
  Sparkles,
  Mail,
  Camera,
  MessageCircle,
  CreditCard,
  LineChart,
  ClipboardList,
} from "lucide-react"
import { Button } from "@/components/ui/button"
import { captureUtm, trackBuyClick, trackScrollDepth } from "@/lib/shop/salespage-tracking"
import { toast } from "sonner"
import {
  MASTERCLASS_SECTIONS,
  getLessonsBySection,
  MASTERCLASS_LESSONS,
} from "@/lib/masterclass/registry"
import { DECK_UEBUNGEN } from "@/lib/masterclass/kartendeck"
import { MASTERCLASS_SLUG, FREE_PREVIEW_LESSON_IDS } from "@/lib/masterclass/access"

// ── Designwelt (identisch zur Masterclass/Workbook) ──────────────────────────

const PAPER = "#F8F5F0"
const INK = "#0f172a"
const MUTED = "#64748b"
const LINE = "#e7e1d6"
const SAND = "#C9B79C"
const GREEN = "#2C3E2D"

const INTRO_LESSON_ID = FREE_PREVIEW_LESSON_IDS[0] // „I.1"
const INTRO_HREF = `/masterclass/${MASTERCLASS_SLUG}/${INTRO_LESSON_ID}`

// ── Produkt-Typ (Teilmenge der Detail-API-Antwort) ───────────────────────────

export interface MasterclassProduct {
  slug: string
  titel: string
  kurzbeschreibung: string | null
  beschreibung: string | null
  produkt_typ: "challenge" | "programm" | "masterclass"
  preis: number
  preis_regulaer?: number | null
  waehrung: string
  zugriff_status: "im_abo" | "besitz" | "kaufbar"
  effektiver_preis: number
  hat_aktives_abo: boolean
  eingeloggt: boolean
}

const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/

function formatPreis(value: number): string {
  return value.toLocaleString("de-DE", { minimumFractionDigits: 0 })
}

// ── Säulen „Das bekommst du" ─────────────────────────────────────────────────

// Reihenfolge ist Absicht (Spec B3): Die Begleitung steht an Position 1, nicht
// als letzter Punkt. Sie ist der Hauptbestandteil des Angebots — der Preis wird
// über sie begründet, nicht über den Kursinhalt allein.
const PILLARS = [
  {
    icon: MessageCircle,
    titel: "3 Monate persönliche Begleitung",
    text: "Direkter Draht zu Max per Chat — Antwort innerhalb von 48 h werktags. Dazu ein Übungsprogramm, das zu dir passt, und eine Verlaufskontrolle in der App.",
  },
  {
    icon: Headphones,
    titel: "27 vertonte Lektionen",
    text: "In sechs Sektionen, ruhig gesprochen und mit Sync-Slides — vom Verstehen deines Schmerzes bis zu den Werkzeugen für den Alltag.",
  },
  {
    icon: PenLine,
    titel: "Workbook + Übungskartendeck",
    text: `Interaktives Workbook zu allen Lektionen (auch als PDF) und ${DECK_UEBUNGEN} Schlüsselübungen als Kartendeck — dein Begleiter für unterwegs.`,
  },
] as const

// ── UGC-Leiste „In echt" (durchlaufend) ──────────────────────────────────────
// Echte Lifestyle-/UGC-Fotos im Querformat 4:3, die nahtlos durchlaufen.
// → Fotos nach `public/images/masterclass/chronischer-kreuzschmerz/ugc/` legen
//   und hier eintragen. Empfehlung: 5–8 Stück, 4:3 (z. B. 1448×1086), JPG/WEBP.
// Solange die Liste leer ist, zeigt die Leiste dezente Platzhalter-Kacheln;
// mit nur einem Foto wiederholt es sich — für Abwechslung 4–6 Motive einbauen.

const UGC_BASE = `/images/masterclass/${MASTERCLASS_SLUG}/ugc`

const UGC_PHOTOS: { src: string; alt: string }[] = [
  {
    src: `${UGC_BASE}/01.jpg`,
    alt: "Frau mit der Bewegungskarte „Bird Dog“ am Café-Tisch, daneben die Masterclass auf dem Smartphone und ein Kaffee",
  },
  {
    src: `${UGC_BASE}/02.jpg`,
    alt: "Person mit Kopfhörern auf dem Sofa hört die Masterclass auf dem Tablet, daneben die Bewegungskarten",
  },
  {
    src: `${UGC_BASE}/03.jpg`,
    alt: "Schreibtisch mit Laptop, Smartphone und Tablet mit der Masterclass, Notizbuch und den Bewegungskarten",
  },
  {
    src: `${UGC_BASE}/04.jpg`,
    alt: "Frau übt „Bird Dog“ auf der Matte im Wohnzimmer, daneben das Tablet mit der Masterclass und die Karten",
  },
  // Weitere Motive hier ergänzen:
  // { src: `${UGC_BASE}/05.jpg`, alt: "…" },
]

// Mindestanzahl Kacheln, damit der Loop die Breite nahtlos füllt.
const UGC_MIN_TILES = 8

// ── „Wer dich begleitet" — ECHTES Foto von Max (kein KI-Bild!) ───────────────
// Sobald das Porträt da ist: nach public/images/masterclass/chronischer-
// kreuzschmerz/ als `max-portrait.jpg` legen und MAX_PORTRAIT auf den Pfad
// setzen. Bis dahin zeigt die Sektion einen „MG"-Platzhalter.
const MAX_PORTRAIT: string | null = `/images/masterclass/${MASTERCLASS_SLUG}/max-portrait.jpg`

// ── Kauf-Panel ───────────────────────────────────────────────────────────────

function PurchasePanel({ product }: { product: MasterclassProduct }) {
  const { zugriff_status, effektiver_preis, eingeloggt, slug, preis_regulaer } = product

  // Launch-Aktion: regulärer Streichpreis liegt über dem effektiven Preis.
  const hatLaunchAktion =
    typeof preis_regulaer === "number" && preis_regulaer > effektiver_preis

  const [email, setEmail] = useState("")
  const [firstName, setFirstName] = useState("")
  const [lastName, setLastName] = useState("")
  const [isCheckingOut, setIsCheckingOut] = useState(false)
  // § 356 Abs. 5 BGB: Bei digitalen Inhalten erlischt das Widerrufsrecht NUR,
  // wenn der Käufer vor dem Kauf ausdrücklich zustimmt UND bestätigt, dass er es
  // dadurch verliert. Ohne diese Zustimmung könnte jemand die komplette
  // Masterclass durchhören und danach die 399 € zurückfordern.
  const [widerrufVerzicht, setWiderrufVerzicht] = useState(false)

  // ── Bereits im Besitz ──────────────────────────────────────────────────
  if (zugriff_status === "besitz") {
    return (
      <div
        className="rounded-2xl border p-6 space-y-4"
        style={{ borderColor: GREEN, backgroundColor: "rgba(44,62,45,0.05)" }}
      >
        <div className="flex items-center gap-3">
          <span
            className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl"
            style={{ backgroundColor: "rgba(44,62,45,0.1)", color: GREEN }}
          >
            <CheckCircle2 className="h-5 w-5" />
          </span>
          <div>
            <p className="font-semibold" style={{ color: INK }}>
              Du besitzt diese Masterclass
            </p>
            <p className="text-sm" style={{ color: MUTED }}>
              Lebenslanger Zugriff · Einmalig gekauft
            </p>
          </div>
        </div>
        <Button
          asChild
          className="w-full font-semibold rounded-xl h-12 text-white hover:opacity-90"
          style={{ backgroundColor: GREEN }}
        >
          <Link href={`/masterclass/${MASTERCLASS_SLUG}`}>
            Masterclass öffnen
            <ArrowRight className="h-4 w-4 ml-2" />
          </Link>
        </Button>
      </div>
    )
  }

  // ── Im Abo enthalten (Randfall — Masterclass ist reiner Einmalkauf) ──────
  if (zugriff_status === "im_abo") {
    return (
      <div
        className="rounded-2xl border p-6 space-y-4"
        style={{ borderColor: GREEN, backgroundColor: "rgba(44,62,45,0.05)" }}
      >
        <div className="flex items-center gap-3">
          <span
            className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl"
            style={{ backgroundColor: "rgba(44,62,45,0.1)", color: GREEN }}
          >
            <Sparkles className="h-5 w-5" />
          </span>
          <div>
            <p className="font-semibold" style={{ color: INK }}>
              In deinem Zugang enthalten
            </p>
            <p className="text-sm" style={{ color: MUTED }}>
              Kein Kauf nötig — sofort starten
            </p>
          </div>
        </div>
        <Button
          asChild
          className="w-full font-semibold rounded-xl h-12 text-white hover:opacity-90"
          style={{ backgroundColor: GREEN }}
        >
          <Link href={`/masterclass/${MASTERCLASS_SLUG}`}>
            Jetzt starten
            <ArrowRight className="h-4 w-4 ml-2" />
          </Link>
        </Button>
      </div>
    )
  }

  // ── Kaufbar: eingeloggt → /api/shop/checkout · Gast → /api/shop/public-checkout

  async function startMemberCheckout() {
    if (!widerrufVerzicht) {
      toast.error("Bitte bestätige die Zustimmung zum sofortigen Zugang.")
      return
    }

    // Klick VOR dem Sprung zu Stripe erfassen — sonst wüssten wir nur, wer
    // gekauft hat, aber nie, wer am Checkout abgesprungen ist.
    const utm = captureUtm()
    trackBuyClick(slug, utm)

    setIsCheckingOut(true)
    try {
      const res = await fetch("/api/shop/checkout", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ productSlug: slug, utm, widerrufVerzicht: true }),
      })
      const json = await res.json()
      if (!res.ok) {
        toast.error(json.error ?? "Checkout konnte nicht gestartet werden.")
        return
      }
      if (json.url) window.location.href = json.url
    } catch {
      toast.error("Netzwerkfehler. Bitte versuche es erneut.")
    } finally {
      setIsCheckingOut(false)
    }
  }

  async function startGuestCheckout(e: FormEvent) {
    e.preventDefault()
    if (!EMAIL_RE.test(email)) {
      toast.error("Bitte gib eine gültige E-Mail-Adresse ein.")
      return
    }
    if (!widerrufVerzicht) {
      toast.error("Bitte bestätige die Zustimmung zum sofortigen Zugang.")
      return
    }

    // UTM-Kette: Mail → /go → Salespage → Stripe-Metadata → conversion_source.
    // Erst damit ist überhaupt sichtbar, welche Mail einen Kauf gebracht hat.
    const utm = captureUtm()
    trackBuyClick(slug, utm)

    setIsCheckingOut(true)
    try {
      const res = await fetch("/api/shop/public-checkout", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          productSlug: slug,
          email: email.trim(),
          firstName: firstName.trim(),
          lastName: lastName.trim(),
          utm,
          widerrufVerzicht: true,
        }),
      })
      const json = await res.json()
      if (!res.ok) {
        toast.error(json.error ?? "Checkout konnte nicht gestartet werden.")
        return
      }
      if (json.url) window.location.href = json.url
    } catch {
      toast.error("Netzwerkfehler. Bitte versuche es erneut.")
    } finally {
      setIsCheckingOut(false)
    }
  }

  return (
    <div
      className="rounded-2xl border bg-white p-6 space-y-5 shadow-sm"
      style={{ borderColor: LINE }}
    >
      {/* Preis */}
      <div>
        {hatLaunchAktion && (
          <span
            className="mb-2.5 inline-flex items-center gap-1.5 rounded-full px-2.5 py-1 text-[10px] font-semibold uppercase tracking-[0.18em]"
            style={{ backgroundColor: "rgba(201,183,156,0.22)", color: GREEN }}
          >
            <Sparkles className="h-3 w-3" />
            Launch-Aktion
          </span>
        )}
        <div className="flex items-baseline gap-2.5">
          <span
            className="text-4xl"
            style={{ fontFamily: "var(--font-display)", fontWeight: 600, color: INK }}
          >
            {formatPreis(effektiver_preis)} €
          </span>
          {hatLaunchAktion && (
            <span className="text-xl line-through" style={{ color: MUTED }}>
              {formatPreis(preis_regulaer!)} €
            </span>
          )}
        </div>
        <p className="mt-1.5 text-sm" style={{ color: MUTED }}>
          Einmalig · Lebenslanger Kurszugriff · inkl. MwSt.
        </p>

        {/* Die Begleitung gehört IN den Preis-Block, nicht in eine Feature-Liste
            weiter oben (Spec B3): Der Preis wird über sie begründet, nicht über
            den Kursinhalt allein. Bewusst NICHT als „gratis dazu" formuliert —
            was kostenlos ist, ist nichts wert. */}
        <div
          className="mt-3 flex items-start gap-2.5 rounded-xl px-3.5 py-3"
          style={{ backgroundColor: "rgba(44,62,45,0.06)" }}
        >
          <MessageCircle className="mt-0.5 h-4 w-4 shrink-0" style={{ color: GREEN }} />
          <div>
            <p className="text-sm font-semibold leading-snug" style={{ color: INK }}>
              inkl. 3 Monate persönliche Begleitung per App
            </p>
            <p className="mt-0.5 text-xs leading-relaxed" style={{ color: MUTED }}>
              Direkter Draht zu Max per Chat — Antwort innerhalb von 48 h werktags. Dazu ein
              Übungsprogramm, das zu dir passt, und eine Verlaufskontrolle.
            </p>
          </div>
        </div>
      </div>

      {/* Widerrufs-Zustimmung (§ 356 Abs. 5 BGB) — Pflicht, sonst kein Kauf.
          Ohne sie behielte der Käufer 14 Tage Widerrufsrecht, auch nachdem er
          die komplette Masterclass konsumiert hat. */}
      <label
        className="flex cursor-pointer items-start gap-2.5 rounded-xl px-3 py-2.5 transition-colors"
        style={{ backgroundColor: widerrufVerzicht ? "rgba(44,62,45,0.05)" : "transparent" }}
      >
        <input
          type="checkbox"
          checked={widerrufVerzicht}
          onChange={(e) => setWiderrufVerzicht(e.target.checked)}
          required
          aria-label="Zustimmung zum sofortigen Zugang und Verlust des Widerrufsrechts"
          className="mt-0.5 h-4 w-4 shrink-0 cursor-pointer rounded accent-[#2C3E2D]"
        />
        <span className="text-[12px] leading-relaxed" style={{ color: MUTED }}>
          Ich stimme ausdrücklich zu, dass der Zugang <strong>sofort</strong> bereitgestellt wird,
          und bestätige, dass ich damit mein{" "}
          <Link
            href="/widerruf"
            target="_blank"
            className="font-medium underline underline-offset-2"
            style={{ color: GREEN }}
          >
            Widerrufsrecht
          </Link>{" "}
          verliere. Es gelten die{" "}
          <Link
            href="/agb"
            target="_blank"
            className="font-medium underline underline-offset-2"
            style={{ color: GREEN }}
          >
            AGB
          </Link>
          .
        </span>
      </label>

      {eingeloggt ? (
        /* Eingeloggter Member → bestehender In-App-Checkout */
        <Button
          onClick={startMemberCheckout}
          disabled={isCheckingOut || !widerrufVerzicht}
          className="w-full font-semibold rounded-xl h-12 text-base text-white hover:opacity-90"
          style={{ backgroundColor: GREEN }}
        >
          {isCheckingOut ? (
            <>
              <Loader2 className="h-4 w-4 mr-2 animate-spin" />
              Wird vorbereitet…
            </>
          ) : (
            <>
              Jetzt kaufen
              <ArrowRight className="h-4 w-4 ml-2" />
            </>
          )}
        </Button>
      ) : (
        /* Gast → öffentlicher Checkout mit E-Mail-Zugang */
        <form onSubmit={startGuestCheckout} className="space-y-2.5">
          <div className="grid grid-cols-2 gap-2.5">
            <input
              type="text"
              required
              value={firstName}
              onChange={(e) => setFirstName(e.target.value)}
              placeholder="Vorname"
              aria-label="Vorname"
              className="h-11 px-4 rounded-xl border text-sm outline-none transition-all duration-200 focus:bg-white focus:ring-4 focus:ring-[#2C3E2D]/15 focus:border-[#2C3E2D]/40"
              style={{ backgroundColor: PAPER, borderColor: LINE, color: INK }}
            />
            <input
              type="text"
              required
              value={lastName}
              onChange={(e) => setLastName(e.target.value)}
              placeholder="Nachname"
              aria-label="Nachname"
              className="h-11 px-4 rounded-xl border text-sm outline-none transition-all duration-200 focus:bg-white focus:ring-4 focus:ring-[#2C3E2D]/15 focus:border-[#2C3E2D]/40"
              style={{ backgroundColor: PAPER, borderColor: LINE, color: INK }}
            />
          </div>
          <input
            type="email"
            required
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            placeholder="Deine E-Mail-Adresse"
            aria-label="E-Mail-Adresse"
            className="w-full h-11 px-4 rounded-xl border text-sm outline-none transition-all duration-200 focus:bg-white focus:ring-4 focus:ring-[#2C3E2D]/15 focus:border-[#2C3E2D]/40"
            style={{ backgroundColor: PAPER, borderColor: LINE, color: INK }}
          />
          <Button
            type="submit"
            disabled={isCheckingOut || !widerrufVerzicht}
            className="w-full font-semibold rounded-xl h-12 text-base text-white hover:opacity-90"
            style={{ backgroundColor: GREEN }}
          >
            {isCheckingOut ? (
              <>
                <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                Wird vorbereitet…
              </>
            ) : (
              "Jetzt kaufen"
            )}
          </Button>
        </form>
      )}

      {/* Klarna prominent, NICHT als Fußnote (Spec B3): Bei dieser Zielgruppe ist
          die psychologische Hürde „über 100 € auf einmal", nicht der Gesamtpreis.
          Die Ratenoption muss ohne Scrollen sichtbar sein — direkt unter dem Button. */}
      <div
        className="-mt-1 flex items-center justify-center gap-2 rounded-xl px-3 py-2.5"
        style={{ backgroundColor: "rgba(201,183,156,0.18)" }}
      >
        <CreditCard className="h-4 w-4 shrink-0" style={{ color: GREEN }} />
        <p className="text-[13px] font-semibold" style={{ color: INK }}>
          oder 3 × {formatPreis(effektiver_preis / 3)} € mit Klarna — ohne Aufpreis
        </p>
      </div>

      {/* Vergleichsanker — ein Satz, dezent, kein Marketing-Kasten (Spec B3) */}
      <p className="text-center text-xs leading-relaxed" style={{ color: MUTED }}>
        3 Monate Begleitung mit regelmäßigen Einzelterminen würden in der Praxis ein Vielfaches
        kosten.
      </p>

      {/* Sekundär-CTA: Intro gratis ansehen */}
      <Button
        asChild
        variant="outline"
        className="w-full font-medium rounded-xl h-11"
        style={{ borderColor: SAND, color: GREEN }}
      >
        <Link href={INTRO_HREF}>
          <Play className="h-4 w-4 mr-2" fill="currentColor" />
          Intro gratis ansehen
        </Link>
      </Button>

      {/* Gast-Hinweis: Zugang per E-Mail */}
      {!eingeloggt && (
        <div
          className="flex items-start gap-2 rounded-xl px-3.5 py-3"
          style={{ backgroundColor: "rgba(44,62,45,0.05)" }}
        >
          <Mail className="h-4 w-4 mt-0.5 shrink-0" style={{ color: GREEN }} />
          <p className="text-xs leading-relaxed" style={{ color: INK }}>
            Nach dem Kauf bekommst du deinen Zugang automatisch per E-Mail — kein
            Account-Anlegen vorher nötig.
          </p>
        </div>
      )}

      {/* Trust */}
      <div className="space-y-2 pt-1">
        <div className="flex items-center gap-2 text-xs" style={{ color: MUTED }}>
          <ShieldCheck className="h-3.5 w-3.5 shrink-0" />
          <span>Sichere Zahlung via Stripe — Kreditkarte, SEPA, Sofort</span>
        </div>
        <div className="flex items-center gap-2 text-xs" style={{ color: MUTED }}>
          <CheckCircle2 className="h-3.5 w-3.5 shrink-0" />
          <span>Sofortiger Zugang nach Zahlungsbestätigung</span>
        </div>
      </div>
    </div>
  )
}

// ── Sektion „Deine Begleitung" (Spec B2) ─────────────────────────────────────
// Zeigt, was die 3 Monate konkret bedeuten. HWG: keine Zusage eines Ergebnisses,
// klare Grenze („ersetzt weder Arzt noch Therapie"), Antwortzeit statt „live".

const BEGLEITUNG_FEATURES = [
  {
    icon: MessageCircle,
    titel: "Chat mit Max",
    text: "Du schreibst, wenn dich etwas beschäftigt. Antwort innerhalb von 48 h werktags — keine Akutberatung, aber ein verlässlicher Draht.",
  },
  {
    icon: ClipboardList,
    titel: "Dein Übungsprogramm",
    text: "Auf deine Situation abgestimmt und unterwegs anpassbar — nicht das gleiche Programm für alle.",
  },
  {
    icon: LineChart,
    titel: "Verlaufskontrolle",
    text: "Du siehst über die Wochen, was sich verändert, statt es nur zu vermuten.",
  },
  {
    icon: BookOpen,
    titel: "Workbook in der App",
    text: "Synchron zu den Lektionen, direkt im Browser ausfüllbar. Kein Zettelchaos.",
  },
] as const

function BegleitungSection() {
  return (
    <section className="mx-auto w-full max-w-5xl px-6 pt-20 md:pt-28">
      <p className="mb-2 text-xs font-medium uppercase tracking-[0.28em]" style={{ color: GREEN }}>
        Deine Begleitung
      </p>
      <h2
        className="text-3xl md:text-4xl"
        style={{ fontFamily: "var(--font-display)", fontWeight: 600, color: INK, letterSpacing: "-0.02em" }}
      >
        Du arbeitest nicht allein — 3 Monate Begleitung inklusive
      </h2>
      <p className="mt-3 max-w-2xl text-[15px] leading-relaxed" style={{ color: MUTED }}>
        Die meisten Kurse geben dir Inhalte und lassen dich damit allein. Genau daran scheitert es
        meistens: nicht am Wissen, sondern an den Fragen, die unterwegs auftauchen. Deshalb sind
        drei Monate Begleitung fester Bestandteil dieser Masterclass.
      </p>

      <div className="mt-10 grid gap-10 md:grid-cols-[1fr_auto] md:items-center">
        <div className="grid gap-5 sm:grid-cols-2">
          {BEGLEITUNG_FEATURES.map((f) => {
            const Icon = f.icon
            return (
              <div
                key={f.titel}
                className="rounded-2xl border bg-white p-5"
                style={{ borderColor: LINE }}
              >
                <span
                  className="inline-flex h-9 w-9 items-center justify-center rounded-xl"
                  style={{ backgroundColor: "rgba(44,62,45,0.08)", color: GREEN }}
                >
                  <Icon className="h-[18px] w-[18px]" />
                </span>
                <h3
                  className="mt-3 text-base"
                  style={{ fontFamily: "var(--font-display)", fontWeight: 600, color: INK }}
                >
                  {f.titel}
                </h3>
                <p className="mt-1 text-sm leading-relaxed" style={{ color: MUTED }}>
                  {f.text}
                </p>
              </div>
            )
          })}
        </div>

        <ChatPhone />
      </div>

      <p className="mt-8 text-xs leading-relaxed" style={{ color: MUTED }}>
        Die Begleitung endet nach drei Monaten automatisch — sie verlängert sich nicht von selbst
        und kippt in kein Abo. Deinen Kurszugang behältst du dauerhaft. Die Masterclass ersetzt
        weder Arzt noch Therapie.
      </p>
    </section>
  )
}

/**
 * Phone-Frame mit Chat-Ansicht. Bewusst als CSS statt als Screenshot: bleibt auf
 * jedem Display scharf, braucht kein Asset und ist kein Stock-Foto. Der Verlauf
 * ist gestellt und sagt bewusst kein Ergebnis zu.
 */
function ChatPhone() {
  const bubbles = [
    { side: "right", text: "Woche 2 — die Übung morgens klappt. Beim Sitzen wird's ab Mittag wieder zäh." },
    { side: "left", text: "Danke dir. Das Zäh-Werden am Nachmittag passt zum Bild. Ich nehme die Mobilisation aus dem Abendblock raus und lege sie auf 14 Uhr." },
    { side: "left", text: "Programm ist angepasst — schau mal rein." },
    { side: "right", text: "Perfekt, danke!" },
  ] as const

  return (
    <div className="mx-auto hidden w-[250px] shrink-0 md:block">
      <div
        className="rounded-[34px] border-[8px] bg-slate-900 shadow-[0_22px_50px_rgba(15,23,42,0.22)]"
        style={{ borderColor: "#0f172a" }}
      >
        <div className="relative overflow-hidden rounded-[26px]" style={{ backgroundColor: PAPER }}>
          <div className="absolute left-1/2 top-0 h-[17px] w-[80px] -translate-x-1/2 rounded-b-[10px] bg-slate-900" />

          <div className="flex items-center gap-2 border-b bg-white px-3.5 pb-2.5 pt-6" style={{ borderColor: LINE }}>
            <span
              className="flex h-7 w-7 items-center justify-center rounded-full text-[10px] font-bold text-white"
              style={{ backgroundColor: GREEN }}
            >
              MG
            </span>
            <div className="leading-tight">
              <p className="text-[11px] font-bold" style={{ color: INK }}>Max Glawe</p>
              <p className="text-[9px]" style={{ color: GREEN }}>Dein Therapeut</p>
            </div>
          </div>

          <div className="space-y-2 px-3 py-3.5">
            {bubbles.map((b, i) => (
              <div key={i} className={`flex ${b.side === "left" ? "justify-start" : "justify-end"}`}>
                <p
                  className="max-w-[86%] rounded-2xl px-3 py-1.5 text-[9px] leading-[1.5]"
                  style={
                    b.side === "left"
                      ? { backgroundColor: "#fff", color: "#334155", border: `1px solid ${LINE}`, borderBottomLeftRadius: 6 }
                      : { backgroundColor: GREEN, color: "#fff", borderBottomRightRadius: 6 }
                  }
                >
                  {b.text}
                </p>
              </div>
            ))}
          </div>

          <div className="border-t bg-white px-3 py-2" style={{ borderColor: LINE }}>
            <div className="rounded-full px-3 py-1 text-[9px]" style={{ backgroundColor: PAPER, color: MUTED }}>
              Nachricht schreiben …
            </div>
          </div>
        </div>
      </div>
      <p className="mt-3 text-center text-[12px] leading-snug" style={{ color: MUTED }}>
        So sieht Begleitung aus:<br />du schreibst, Max antwortet.
      </p>
    </div>
  )
}

// ── FAQ (Spec B2) ────────────────────────────────────────────────────────────
// Beantwortet die drei Fragen, die den Kauf sonst blockieren. Alle drei Antworten
// sind bewusst ehrlich statt beschönigend — vor allem die dritte.

const FAQ = [
  {
    frage: "Was passiert nach den 3 Monaten?",
    antwort:
      "Die Begleitung endet automatisch. Es gibt kein Abo, das sich still verlängert, und es wird nichts abgebucht. Deinen Kurszugang — Lektionen, Workbook, Kartendeck — behältst du dauerhaft. Wenn du weiter betreut werden möchtest, entscheidest du das aktiv und neu.",
  },
  {
    frage: "Wie schnell antwortet Max?",
    antwort:
      "Innerhalb von 48 Stunden werktags. Das ist eine Zusage, die ich halten kann — keine Rund-um-die-Uhr-Erreichbarkeit. Für akute Beschwerden ist der Chat nicht der richtige Ort: dann bitte zum Arzt oder in die Notaufnahme.",
  },
  {
    frage: "Ersetzt das meine Therapie?",
    antwort:
      "Nein. Die Masterclass ist ein Bildungs- und Orientierungsangebot: Sie hilft dir zu verstehen, was bei dir los ist, und gibt dir Werkzeuge für den Alltag. Sie ersetzt weder eine ärztliche Abklärung noch eine laufende Therapie — sie kann sie ergänzen.",
  },
] as const

function FaqSection() {
  return (
    <section className="mx-auto w-full max-w-3xl px-6 pt-20 md:pt-28">
      <p className="mb-2 text-xs font-medium uppercase tracking-[0.28em]" style={{ color: GREEN }}>
        Häufige Fragen
      </p>
      <h2
        className="text-2xl md:text-3xl"
        style={{ fontFamily: "var(--font-display)", fontWeight: 600, color: INK }}
      >
        Bevor du dich entscheidest
      </h2>

      <div className="mt-8 space-y-3">
        {FAQ.map((item) => (
          <details
            key={item.frage}
            className="group rounded-2xl border bg-white p-5 transition-colors"
            style={{ borderColor: LINE }}
          >
            <summary
              className="flex cursor-pointer list-none items-center justify-between gap-4 text-base font-semibold"
              style={{ color: INK }}
            >
              {item.frage}
              <ArrowRight
                className="h-4 w-4 shrink-0 transition-transform group-open:rotate-90"
                style={{ color: GREEN }}
              />
            </summary>
            <p className="mt-3 text-sm leading-relaxed" style={{ color: MUTED }}>
              {item.antwort}
            </p>
          </details>
        ))}
      </div>
    </section>
  )
}

// ── Hauptlayout ──────────────────────────────────────────────────────────────

export function MasterclassSalesLayout({ product }: { product: MasterclassProduct }) {
  const total = MASTERCLASS_LESSONS.length
  const totalMinutes = MASTERCLASS_LESSONS.reduce((sum, l) => sum + l.audioMinuten, 0)
  const totalHours = Math.round(totalMinutes / 60)
  const sectionCount = MASTERCLASS_SECTIONS.length

  // Scroll-Tiefe 25/50/75/100 % + UTM festhalten (Spec B3). Zusammen mit dem
  // Buy-Button-Klick macht das unterscheidbar, ob die Seite oder das Angebot
  // oder der Checkout die Hürde ist — bevor jemand am Preis dreht.
  useEffect(() => {
    captureUtm()
    return trackScrollDepth(product.slug)
  }, [product.slug])

  const versprechen =
    product.beschreibung?.trim() ||
    product.kurzbeschreibung?.trim() ||
    "Das, was meine Patienten in der Praxis bekommen — strukturiert, ortsunabhängig, in deinem Tempo."

  // Launch-Aktion: regulärer Streichpreis liegt über dem effektiven Preis.
  const hatLaunchAktion =
    typeof product.preis_regulaer === "number" &&
    product.preis_regulaer > product.effektiver_preis

  // UGC-Leiste: genug Kacheln für die Breite, dann verdoppeln → nahtloser Loop.
  const ugcBase =
    UGC_PHOTOS.length > 0
      ? Array.from({ length: Math.max(UGC_MIN_TILES, UGC_PHOTOS.length) }, (_, i) =>
          UGC_PHOTOS[i % UGC_PHOTOS.length],
        )
      : Array.from({ length: UGC_MIN_TILES }, () => null)
  const ugcTrack = [...ugcBase, ...ugcBase]

  return (
    <main className="min-h-[100dvh]" style={{ backgroundColor: PAPER }}>
      {/* ── Hero ── */}
      <section className="mx-auto w-full max-w-5xl px-6 pt-16 md:pt-24">
        <div className="grid items-start gap-10 lg:grid-cols-5 lg:gap-14">
          {/* Text */}
          <div className="lg:col-span-3">
            <p
              className="mb-5 text-xs font-medium uppercase tracking-[0.28em]"
              style={{ color: GREEN }}
            >
              Masterclass
            </p>

            <h1
              className="text-4xl leading-[1.08] md:text-6xl"
              style={{ fontFamily: "var(--font-display)", fontWeight: 600, color: INK }}
            >
              Chronischer Kreuzschmerz
            </h1>

            <p
              className="mt-5 text-sm uppercase tracking-[0.18em] md:text-base"
              style={{ color: MUTED }}
            >
              Verstehen · Handeln · Bleiben · Wiederkommen
            </p>

            <div className="my-7 h-px w-16" style={{ backgroundColor: GREEN }} />

            <p
              className="max-w-xl text-lg leading-relaxed md:text-xl"
              style={{ color: INK, fontFamily: "var(--font-display)", fontWeight: 400 }}
            >
              {versprechen}
            </p>

            {/* Meta */}
            <div
              className="mt-8 flex flex-wrap items-center gap-x-7 gap-y-3 text-sm"
              style={{ color: MUTED }}
            >
              <span className="inline-flex items-center gap-2">
                <Headphones className="h-4 w-4" />
                {total} Lektionen
              </span>
              <span className="inline-flex items-center gap-2">
                <Clock className="h-4 w-4" />~ {totalHours} Stunden
              </span>
              <span className="inline-flex items-center gap-2">
                <Layers className="h-4 w-4" />
                {sectionCount} Sektionen
              </span>
            </div>
          </div>

          {/* Kauf-Panel (Desktop sticky) */}
          <div className="lg:col-span-2">
            <div className="lg:sticky lg:top-20">
              <PurchasePanel product={product} />
            </div>
          </div>
        </div>
      </section>

      {/* ── Das bekommst du ── */}
      <section className="mx-auto w-full max-w-5xl px-6 pt-20 md:pt-28">
        <h2
          className="text-2xl md:text-3xl"
          style={{ fontFamily: "var(--font-display)", fontWeight: 600, color: INK }}
        >
          Das bekommst du
        </h2>
        <div className="mt-8 grid gap-5 md:grid-cols-3">
          {PILLARS.map((pillar) => {
            const Icon = pillar.icon
            return (
              <div
                key={pillar.titel}
                className="flex flex-col rounded-2xl border bg-white/60 p-6"
                style={{ borderColor: LINE }}
              >
                <span
                  className="flex h-12 w-12 items-center justify-center rounded-xl"
                  style={{ backgroundColor: "rgba(44,62,45,0.1)", color: GREEN }}
                  aria-hidden="true"
                >
                  <Icon className="h-5 w-5" />
                </span>
                <h3
                  className="mt-4 text-lg"
                  style={{ fontFamily: "var(--font-display)", fontWeight: 600, color: INK }}
                >
                  {pillar.titel}
                </h3>
                <p className="mt-1.5 text-sm leading-relaxed" style={{ color: MUTED }}>
                  {pillar.text}
                </p>
              </div>
            )
          })}
        </div>
      </section>

      {/* ── Deine Begleitung (Spec B2) ──
          Steht bewusst direkt hinter „Das bekommst du": Die Begleitung ist der
          Hauptbestandteil, nicht ein Bonus am Ende der Seite. */}
      <BegleitungSection />

      {/* ── In echt · durchlaufende UGC-Leiste ── */}
      <section className="pt-20 md:pt-28">
        <div className="mx-auto w-full max-w-5xl px-6">
          <p
            className="mb-2 text-xs font-medium uppercase tracking-[0.28em]"
            style={{ color: GREEN }}
          >
            In echt
          </p>
          <h2
            className="text-2xl md:text-3xl"
            style={{ fontFamily: "var(--font-display)", fontWeight: 600, color: INK }}
          >
            So fühlt es sich an
          </h2>
          <p className="mt-2 max-w-xl text-sm leading-relaxed" style={{ color: MUTED }}>
            Echte Eindrücke rund um die Masterclass — zum Anfassen gemacht, nicht aus dem
            Schaufenster.
          </p>
        </div>

        <div className="ugc-marquee relative mt-8 w-full overflow-hidden py-2">
          {/* Weiche Kanten ins Papier */}
          <div
            className="pointer-events-none absolute inset-y-0 left-0 z-10 w-12 md:w-28"
            style={{ background: `linear-gradient(to right, ${PAPER}, rgba(248,245,240,0))` }}
            aria-hidden="true"
          />
          <div
            className="pointer-events-none absolute inset-y-0 right-0 z-10 w-12 md:w-28"
            style={{ background: `linear-gradient(to left, ${PAPER}, rgba(248,245,240,0))` }}
            aria-hidden="true"
          />

          <ul className="ugc-marquee-track flex w-max items-stretch">
            {ugcTrack.map((photo, i) => (
              <li
                key={i}
                className="mr-4 w-72 shrink-0 sm:w-80 md:w-96"
                aria-hidden={i >= ugcBase.length ? true : undefined}
              >
                <div
                  className="relative aspect-[4/3] overflow-hidden rounded-2xl border bg-white shadow-sm"
                  style={{ borderColor: LINE }}
                >
                  {photo ? (
                    <Image
                      src={photo.src}
                      alt={photo.alt}
                      fill
                      sizes="(min-width: 768px) 24rem, (min-width: 640px) 20rem, 18rem"
                      className="object-cover"
                    />
                  ) : (
                    <div
                      className="flex h-full w-full flex-col items-center justify-center gap-2"
                      style={{
                        background:
                          "linear-gradient(135deg, rgba(201,183,156,0.20) 0%, rgba(201,183,156,0.06) 100%)",
                      }}
                    >
                      <Camera className="h-6 w-6" style={{ color: GREEN, opacity: 0.45 }} />
                      <span
                        className="text-[10px] uppercase tracking-[0.18em]"
                        style={{ color: MUTED }}
                      >
                        Dein Foto
                      </span>
                    </div>
                  )}
                </div>
              </li>
            ))}
          </ul>
        </div>
      </section>

      {/* ── Die 6 Sektionen im Überblick ── */}
      <section className="mx-auto w-full max-w-5xl px-6 pt-20 md:pt-28">
        <h2
          className="text-2xl md:text-3xl"
          style={{ fontFamily: "var(--font-display)", fontWeight: 600, color: INK }}
        >
          Die {sectionCount} Sektionen im Überblick
        </h2>
        <p className="mt-2 text-sm" style={{ color: MUTED }}>
          Sechs Sektionen, die aufeinander aufbauen — vom ehrlichen Versprechen bis zu den
          Werkzeugen für deinen Alltag.
        </p>

        <ul className="mt-8 grid gap-4 sm:grid-cols-2">
          {MASTERCLASS_SECTIONS.map((section, idx) => {
            const lessonCount = getLessonsBySection(section.key).length
            return (
              <li
                key={section.key}
                className="flex items-center gap-4 rounded-2xl border bg-white/50 px-5 py-5"
                style={{ borderColor: LINE }}
              >
                <span
                  className="text-sm font-semibold tabular-nums"
                  style={{ color: GREEN, fontFamily: "var(--font-display)" }}
                >
                  {String(idx + 1).padStart(2, "0")}
                </span>
                <div className="min-w-0 flex-1">
                  <p
                    className="text-base md:text-lg"
                    style={{ fontFamily: "var(--font-display)", fontWeight: 600, color: INK }}
                  >
                    {section.title}
                  </p>
                  <p
                    className="mt-0.5 text-xs uppercase tracking-[0.18em]"
                    style={{ color: MUTED }}
                  >
                    {section.caption}
                  </p>
                </div>
                <span className="shrink-0 text-sm tabular-nums" style={{ color: MUTED }}>
                  {lessonCount} {lessonCount === 1 ? "Lektion" : "Lektionen"}
                </span>
              </li>
            )
          })}
        </ul>
      </section>

      {/* ── Workbook + Bonus-Deck (Vertiefung) ── */}
      <section className="mx-auto w-full max-w-5xl px-6 pt-12 md:pt-16">
        <div className="grid gap-4 md:grid-cols-2">
          {/* Workbook */}
          <div
            className="flex items-start gap-4 rounded-2xl border bg-white/60 px-6 py-6"
            style={{ borderColor: LINE }}
          >
            <span
              className="flex h-12 w-12 shrink-0 items-center justify-center rounded-xl"
              style={{ backgroundColor: "rgba(44,62,45,0.1)", color: GREEN }}
              aria-hidden="true"
            >
              <BookOpen className="h-5 w-5" />
            </span>
            <div className="min-w-0">
              <h3
                className="text-lg"
                style={{ fontFamily: "var(--font-display)", fontWeight: 600, color: INK }}
              >
                Interaktives Workbook
              </h3>
              <p className="mt-1 text-sm leading-relaxed" style={{ color: MUTED }}>
                Zu allen Lektionen — Theorie vertiefen, Übungen interaktiv ausfüllen, Notizen
                speichern. Jederzeit als PDF ausdrucken.
              </p>
            </div>
          </div>

          {/* Bonus-Deck */}
          <div
            className="relative overflow-hidden rounded-2xl border px-6 py-6"
            style={{
              borderColor: SAND,
              background:
                "linear-gradient(135deg, rgba(201,183,156,0.16) 0%, rgba(201,183,156,0.05) 55%, rgba(252,250,246,0.9) 100%)",
            }}
          >
            <span
              aria-hidden="true"
              className="pointer-events-none absolute -right-10 -top-12 h-36 w-36 rounded-full"
              style={{
                background:
                  "radial-gradient(circle, rgba(201,183,156,0.35) 0%, transparent 70%)",
              }}
            />
            <div className="relative flex items-start gap-4">
              <span
                className="flex h-12 w-12 shrink-0 items-center justify-center rounded-xl"
                style={{ backgroundColor: "rgba(44,62,45,0.1)", color: GREEN }}
                aria-hidden="true"
              >
                <Layers className="h-5 w-5" />
              </span>
              <div className="min-w-0">
                <span
                  className="inline-flex items-center gap-1.5 rounded-full px-2.5 py-1 text-[10px] font-semibold uppercase tracking-[0.18em]"
                  style={{ backgroundColor: "rgba(44,62,45,0.1)", color: GREEN }}
                >
                  Bonus
                </span>
                <h3
                  className="mt-2.5 text-lg"
                  style={{ fontFamily: "var(--font-display)", fontWeight: 600, color: INK }}
                >
                  Übungskartendeck für unterwegs
                </h3>
                <p className="mt-1 text-sm leading-relaxed" style={{ color: MUTED }}>
                  Alle {DECK_UEBUNGEN} Schlüsselübungen als Karten zum Durchblättern und
                  Ausdrucken — inklusive in deiner Masterclass.
                </p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ── Für wen / Versprechen ── */}
      <section className="mx-auto w-full max-w-3xl px-6 pt-20 text-center md:pt-28">
        <h2
          className="text-2xl md:text-3xl"
          style={{ fontFamily: "var(--font-display)", fontWeight: 600, color: INK }}
        >
          Für wen ist diese Masterclass?
        </h2>
        <p
          className="mx-auto mt-5 max-w-xl text-lg leading-relaxed"
          style={{ color: INK, fontFamily: "var(--font-display)", fontWeight: 400 }}
        >
          Für alle, die ihren chronischen Kreuzschmerz besser verstehen und im Alltag
          selbstbestimmt mit ihm umgehen möchten. Du arbeitest in deinem Tempo, mit Audio,
          Workbook und Karten — strukturiert und ortsunabhängig.
        </p>
        <p className="mx-auto mt-6 max-w-xl text-sm leading-relaxed" style={{ color: MUTED }}>
          Diese Masterclass ersetzt nicht deinen Arzt oder deine Diagnostik. Sie ist ein
          Werkzeugkasten für mehr Schmerzkompetenz — kein Heilversprechen.
        </p>
      </section>

      {/* ── FAQ (Spec B2) — die drei Fragen, die vor dem Kauf im Weg stehen ── */}
      <FaqSection />

      {/* ── Wer dich begleitet (Experte hinter der Masterclass) ── */}
      <section className="mx-auto w-full max-w-4xl px-6 pt-20 md:pt-28">
        <div
          className="grid items-center gap-8 rounded-3xl border bg-white/60 p-6 md:grid-cols-5 md:gap-10 md:p-10"
          style={{ borderColor: LINE }}
        >
          {/* Foto */}
          <div className="md:col-span-2">
            <div
              className="relative mx-auto aspect-[4/5] w-44 overflow-hidden rounded-2xl border sm:w-52 md:w-full"
              style={{ borderColor: LINE }}
            >
              {MAX_PORTRAIT ? (
                <Image
                  src={MAX_PORTRAIT}
                  alt="Max Glawe — Heilpraktiker für Physiotherapie"
                  fill
                  sizes="(min-width: 768px) 18rem, 13rem"
                  className="object-cover object-top"
                />
              ) : (
                <div
                  className="flex h-full w-full flex-col items-center justify-center gap-1"
                  style={{
                    background:
                      "linear-gradient(135deg, rgba(44,62,45,0.10) 0%, rgba(201,183,156,0.18) 100%)",
                  }}
                  aria-hidden="true"
                >
                  <span
                    className="text-5xl"
                    style={{ fontFamily: "var(--font-display)", fontWeight: 600, color: GREEN }}
                  >
                    MG
                  </span>
                  <span
                    className="text-[10px] uppercase tracking-[0.18em]"
                    style={{ color: MUTED }}
                  >
                    Foto folgt
                  </span>
                </div>
              )}
            </div>
          </div>

          {/* Text */}
          <div className="md:col-span-3">
            <p
              className="mb-2 text-xs font-medium uppercase tracking-[0.28em]"
              style={{ color: GREEN }}
            >
              Wer dich begleitet
            </p>
            <h2
              className="text-2xl md:text-3xl"
              style={{ fontFamily: "var(--font-display)", fontWeight: 600, color: INK }}
            >
              Max Glawe
            </h2>
            <p className="mt-1 text-xs uppercase tracking-[0.18em]" style={{ color: MUTED }}>
              Physiotherapeut & sektoraler Heilpraktiker für Physiotherapie
            </p>
            <p
              className="mt-5 text-lg leading-relaxed"
              style={{ color: INK, fontFamily: "var(--font-display)", fontWeight: 400 }}
            >
              „In meiner Praxis begleite ich Menschen mit chronischem Kreuzschmerz. Diese
              Masterclass bündelt genau das, was sich dabei bewährt hat — strukturiert,
              verständlich und in deinem Tempo."
            </p>
            <p className="mt-4 text-sm leading-relaxed" style={{ color: MUTED }}>
              Kein Heilversprechen, sondern ehrliche Werkzeuge für mehr Schmerzkompetenz im
              Alltag.
            </p>
          </div>
        </div>
      </section>

      {/* ── Finaler CTA-Block ── */}
      <section className="mx-auto w-full max-w-3xl px-6 pb-28 pt-12 md:pt-16">
        <div
          className="overflow-hidden rounded-3xl border px-8 py-10 text-center md:px-12 md:py-12"
          style={{ borderColor: GREEN, backgroundColor: GREEN }}
        >
          <p
            className="text-xs font-medium uppercase tracking-[0.28em]"
            style={{ color: SAND }}
          >
            Masterclass · Chronischer Kreuzschmerz
          </p>
          {hatLaunchAktion && (
            <span
              className="mt-4 inline-flex items-center gap-1.5 rounded-full px-3 py-1 text-[10px] font-semibold uppercase tracking-[0.18em]"
              style={{ backgroundColor: "rgba(201,183,156,0.25)", color: SAND }}
            >
              <Sparkles className="h-3 w-3" />
              Launch-Aktion
            </span>
          )}
          <p
            className="mt-4 flex items-baseline justify-center gap-2.5 text-3xl md:text-4xl"
            style={{ fontFamily: "var(--font-display)", fontWeight: 600, color: PAPER }}
          >
            <span>{formatPreis(product.effektiver_preis)} €</span>
            {hatLaunchAktion && (
              <span className="text-xl line-through" style={{ color: "rgba(248,245,240,0.6)" }}>
                {formatPreis(product.preis_regulaer!)} €
              </span>
            )}
          </p>
          <p className="mt-1.5 text-sm" style={{ color: "rgba(248,245,240,0.7)" }}>
            Einmalig · Lebenslanger Zugriff · inkl. MwSt.
          </p>

          {product.zugriff_status === "kaufbar" ? (
            <div className="mx-auto mt-7 flex max-w-sm flex-col gap-3">
              {product.eingeloggt ? (
                <span className="text-sm" style={{ color: "rgba(248,245,240,0.85)" }}>
                  Scrolle nach oben, um den Kauf abzuschließen.
                </span>
              ) : (
                <span className="text-sm" style={{ color: "rgba(248,245,240,0.85)" }}>
                  Den Kauf schließt du oben mit deiner E-Mail-Adresse ab.
                </span>
              )}
              <Button
                asChild
                variant="outline"
                className="h-11 rounded-xl font-medium"
                style={{ borderColor: SAND, color: PAPER, backgroundColor: "transparent" }}
              >
                <Link href={INTRO_HREF}>
                  <Play className="h-4 w-4 mr-2" fill="currentColor" />
                  Intro gratis ansehen
                </Link>
              </Button>
            </div>
          ) : (
            <div className="mx-auto mt-7 max-w-sm">
              <Button
                asChild
                className="h-12 w-full rounded-xl font-semibold"
                style={{ backgroundColor: PAPER, color: GREEN }}
              >
                <Link href={`/masterclass/${MASTERCLASS_SLUG}`}>
                  Masterclass öffnen
                  <ArrowUpRight className="h-4 w-4 ml-2" />
                </Link>
              </Button>
            </div>
          )}
        </div>
      </section>
    </main>
  )
}
