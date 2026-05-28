"use client";

import {
  useCallback,
  useEffect,
  useRef,
  useState,
  type ReactNode,
} from "react";
import Link from "next/link";
import {
  ArrowLeft,
  ChevronLeft,
  ChevronRight,
  Layers,
  Printer,
  type LucideIcon,
  X,
} from "lucide-react";

import {
  DECK_CARDS,
  DECK_KATEGORIEN,
  DECK_UEBUNGEN,
  type DeckCard,
  type DeckKategorie,
} from "@/lib/masterclass/kartendeck";
import { sourceSerif } from "./fonts";

// ── Editorial-Premium-Palette (identisch zur Workbook-Welt) ──────────────────
const PAPER = "#F8F5F0"; // warmes Off-White (Bühne)
const PAPER_RAISED = "#FCFAF6"; // leicht erhöhte Flächen (Karten)
const INK = "#0f172a"; // tiefe Tinte
const INK_SOFT = "#1e293b";
const MUTED = "#6b7280";
const GREEN = "#2C3E2D"; // Anthrazit-Grün (Akzent)
const SAND = "#C9B79C"; // festliche Bonus-Orientierungsfarbe
const LINE = "#E6DFD3";
const LINE_SOFT = "#EFE9DD";

// ── Reduced-motion-Hook ──────────────────────────────────────────────────────
function usePrefersReducedMotion() {
  const [reduced, setReduced] = useState(false);
  useEffect(() => {
    const mq = window.matchMedia("(prefers-reduced-motion: reduce)");
    setReduced(mq.matches);
    const onChange = () => setReduced(mq.matches);
    mq.addEventListener("change", onChange);
    return () => mq.removeEventListener("change", onChange);
  }, []);
  return reduced;
}

const OVERVIEW_HREF = "/masterclass/chronischer-kreuzschmerz";

// Übungskarten nach Kategorie gruppieren (Reihenfolge aus DECK_CARDS bleibt erhalten).
function cardsOfKategorie(kat: DeckKategorie): DeckCard[] {
  return DECK_CARDS.filter((c) => c.kind === "exercise" && c.kategorie === kat);
}

// ════════════════════════════════════════════════════════════════════════════
// Haupt-Komponente
// ════════════════════════════════════════════════════════════════════════════
export default function KartendeckClient() {
  const reduced = usePrefersReducedMotion();

  // Lightbox: Index in DECK_CARDS (null = geschlossen).
  const [activeIndex, setActiveIndex] = useState<number | null>(null);

  const openLightbox = useCallback((src: string) => {
    const idx = DECK_CARDS.findIndex((c) => c.src === src);
    if (idx >= 0) setActiveIndex(idx);
  }, []);

  const closeLightbox = useCallback(() => setActiveIndex(null), []);

  const handlePrint = useCallback(() => {
    window.print();
  }, []);

  const cover = DECK_CARDS.find((c) => c.kind === "cover");
  const safety = DECK_CARDS.find((c) => c.kind === "safety");

  return (
    <main
      className={`${sourceSerif.variable} kd-root relative min-h-[100dvh] w-full overflow-x-hidden`}
      style={{ backgroundColor: PAPER, color: INK }}
    >
      {/* Druck-Kopf — nur beim Drucken sichtbar */}
      <div className="kd-print-only" style={{ marginBottom: "8mm" }}>
        <p
          style={{
            fontSize: "9pt",
            letterSpacing: "0.12em",
            textTransform: "uppercase",
            color: "#6b7280",
          }}
        >
          Praxis OS · Übungskartendeck Chronischer Kreuzschmerz
        </p>
        <p
          style={{
            fontSize: "12pt",
            color: "#111827",
            marginTop: "2mm",
            fontFamily: "var(--font-serif)",
            fontWeight: 600,
          }}
        >
          {DECK_UEBUNGEN} Schlüsselübungen · Cover · Sicherheitskarte — zum
          Ausschneiden &amp; Mitnehmen
        </p>
        <div style={{ height: "1px", background: "#cbd5e1", marginTop: "4mm" }} />
      </div>

      {/* dezente Sand-Aura oben (Bonus-Orientierung) */}
      <div
        aria-hidden
        className="kd-no-print pointer-events-none absolute inset-x-0 top-0 h-[420px]"
        style={{
          background: `radial-gradient(120% 100% at 50% 0%, ${SAND}30 0%, ${SAND}0f 40%, transparent 72%)`,
        }}
      />

      {/* ── Topbar ── (div, nicht <header>: globale Druckregel blendet <header> aus) */}
      <div
        className="kd-no-print sticky top-0 z-30 backdrop-blur-md"
        style={{
          backgroundColor: "rgba(248,245,240,0.82)",
          borderBottom: `1px solid ${LINE_SOFT}`,
        }}
      >
        <div className="mx-auto flex w-full max-w-5xl items-center justify-between gap-4 px-5 py-3.5 md:px-8">
          <Link
            href={OVERVIEW_HREF}
            className="inline-flex items-center gap-2 text-[11px] uppercase tracking-[0.18em] transition-opacity hover:opacity-60"
            style={{ color: MUTED }}
          >
            <ArrowLeft className="h-3.5 w-3.5" />
            <span className="hidden sm:inline">Zur Masterclass-Übersicht</span>
            <span className="sm:hidden">Masterclass</span>
          </Link>

          <button
            type="button"
            onClick={handlePrint}
            className="inline-flex items-center gap-2 rounded-full border px-4 py-2 text-[11px] uppercase tracking-[0.14em] transition-colors hover:bg-[rgba(44,62,45,0.06)]"
            style={{ borderColor: LINE, color: GREEN }}
          >
            <Printer className="h-3.5 w-3.5" />
            <span className="hidden sm:inline">Drucken / Als PDF</span>
            <span className="sm:hidden">PDF</span>
          </button>
        </div>
      </div>

      {/* ── Hero ── */}
      <section className="relative mx-auto w-full max-w-3xl px-6 pb-8 pt-16 text-center md:pt-24">
        <p
          className="mb-7 inline-flex items-center gap-2 text-[11px] font-medium uppercase tracking-[0.3em]"
          style={{ color: GREEN }}
        >
          <span
            className="inline-block h-[7px] w-[7px] rounded-full"
            style={{ backgroundColor: SAND }}
          />
          Bonus · Inklusive in deiner Masterclass
        </p>

        <h1
          className="text-balance text-[2.4rem] leading-[1.08] tracking-[-0.02em] sm:text-5xl md:text-[3.6rem]"
          style={{ fontFamily: "var(--font-serif)", fontWeight: 600, color: INK }}
        >
          Das Übungskartendeck
        </h1>

        <p
          className="mx-auto mt-7 max-w-xl text-pretty text-lg italic leading-relaxed md:text-xl"
          style={{ fontFamily: "var(--font-serif)", fontWeight: 400, color: INK_SOFT }}
        >
          Alle {DECK_UEBUNGEN} Schlüsselübungen als Karten — für unterwegs, für
          die Tasche, für den Trainingsplatz.
        </p>

        <div className="mx-auto my-9 h-px w-14" style={{ backgroundColor: SAND }} />

        <div
          className="flex flex-wrap items-center justify-center gap-x-7 gap-y-2.5 text-[13px]"
          style={{ color: MUTED }}
        >
          <span className="inline-flex items-center gap-2">
            <Layers className="h-4 w-4" />
            {DECK_UEBUNGEN} Übungen · {DECK_KATEGORIEN.length} Kategorien
          </span>
          <span
            className="inline-flex items-center gap-2 rounded-full px-3 py-1 text-[11px] font-medium uppercase tracking-wider"
            style={{ backgroundColor: "rgba(44,62,45,0.08)", color: GREEN }}
          >
            <Printer className="h-3.5 w-3.5" />
            Zum Durchblättern &amp; Ausdrucken
          </span>
        </div>
      </section>

      {/* ── Cover + Sicherheitskarte (prominent) ── */}
      <section className="mx-auto w-full max-w-3xl px-6 pb-4 pt-6">
        <div className="kd-feature-grid grid grid-cols-1 gap-7 sm:grid-cols-2">
          {cover && (
            <FeatureCard
              card={cover}
              caption="Cover"
              onOpen={openLightbox}
            />
          )}
          {safety && (
            <FeatureCard
              card={safety}
              caption="Sicherheitskarte"
              onOpen={openLightbox}
            />
          )}
        </div>
      </section>

      {/* ── Kategorien ── */}
      <div className="mx-auto w-full max-w-5xl px-6 pb-10">
        {DECK_KATEGORIEN.map((kat, kIdx) => {
          const cards = cardsOfKategorie(kat);
          if (cards.length === 0) return null;
          return (
            <section key={kat} className="pt-12 md:pt-16">
              {/* Sektions-Kopf */}
              <div className="mx-auto max-w-3xl">
                <Eyebrow>
                  Kategorie {kIdx + 1} von {DECK_KATEGORIEN.length}
                </Eyebrow>
                <div className="mt-3 flex flex-wrap items-baseline gap-x-4 gap-y-1">
                  <h2
                    className="text-[1.9rem] leading-[1.15] tracking-[-0.015em] md:text-[2.3rem]"
                    style={{
                      fontFamily: "var(--font-serif)",
                      fontWeight: 600,
                      color: INK,
                    }}
                  >
                    {kat}
                  </h2>
                  <span
                    className="text-[13px] uppercase tracking-[0.18em]"
                    style={{ color: MUTED }}
                  >
                    {cards.length} {cards.length === 1 ? "Karte" : "Karten"}
                  </span>
                </div>
                <div
                  className="mt-6 h-px w-full"
                  style={{ backgroundColor: LINE_SOFT }}
                />
              </div>

              {/* Karten-Raster: Mobil 2, Tablet 3, Desktop 4 */}
              <div className="mt-8 grid grid-cols-2 gap-4 sm:gap-5 md:grid-cols-3 lg:grid-cols-4">
                {cards.map((card) => (
                  <ExerciseCardThumb
                    key={card.src}
                    card={card}
                    onOpen={openLightbox}
                  />
                ))}
              </div>
            </section>
          );
        })}
      </div>

      {/* ── Fuß ── */}
      <footer className="mx-auto w-full max-w-3xl px-6 pb-24 pt-10">
        <div className="h-px w-full" style={{ backgroundColor: LINE }} />
        <p
          className="mt-7 text-center text-[12px] leading-relaxed"
          style={{ color: MUTED }}
        >
          Dieses Kartendeck ist eine Orientierung und Begleitung zur Masterclass,
          keine Diagnose und kein Heilversprechen. Es ersetzt nicht deinen Arzt
          oder deine Diagnostik. Lies vor dem Üben die Sicherheitskarte.
        </p>
        <div className="kd-no-print mt-7 flex justify-center">
          <Link
            href={OVERVIEW_HREF}
            className="inline-flex items-center gap-2 rounded-full px-6 py-3 text-sm text-white transition-transform hover:scale-[1.02]"
            style={{ backgroundColor: GREEN }}
          >
            <ArrowLeft className="h-4 w-4" />
            Zurück zur Masterclass
          </Link>
        </div>
      </footer>

      {/* ── Lightbox ── */}
      {activeIndex !== null && (
        <Lightbox
          index={activeIndex}
          onClose={closeLightbox}
          onNavigate={setActiveIndex}
          reduced={reduced}
        />
      )}
    </main>
  );
}

// ════════════════════════════════════════════════════════════════════════════
// Cover / Sicherheitskarte — prominente Feature-Karte
// ════════════════════════════════════════════════════════════════════════════
function FeatureCard({
  card,
  caption,
  onOpen,
}: {
  card: DeckCard;
  caption: string;
  onOpen: (src: string) => void;
}) {
  return (
    <figure className="kd-card flex flex-col">
      <button
        type="button"
        onClick={() => onOpen(card.src)}
        className="group block w-full overflow-hidden rounded-2xl border text-left transition-transform duration-300 hover:-translate-y-0.5"
        style={{
          borderColor: LINE,
          backgroundColor: "#fff",
          boxShadow: "0 18px 40px -28px rgba(15,23,42,0.4)",
        }}
        aria-label={`${caption} vergrößern`}
      >
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img
          src={card.src}
          alt={card.alt}
          loading="lazy"
          className="block h-auto w-full transition-transform duration-500 group-hover:scale-[1.015]"
          style={{ aspectRatio: "2 / 3", objectFit: "cover" }}
        />
      </button>
      <figcaption className="mt-3 flex items-center gap-2 px-1">
        <span
          className="inline-block h-[6px] w-[6px] shrink-0 rounded-full"
          style={{ backgroundColor: SAND }}
        />
        <span
          className="text-[11px] font-medium uppercase tracking-[0.2em]"
          style={{ color: GREEN }}
        >
          {caption}
        </span>
      </figcaption>
    </figure>
  );
}

// ════════════════════════════════════════════════════════════════════════════
// Übungskarte — Thumbnail im Raster
// ════════════════════════════════════════════════════════════════════════════
function ExerciseCardThumb({
  card,
  onOpen,
}: {
  card: DeckCard;
  onOpen: (src: string) => void;
}) {
  return (
    <figure className="kd-card flex flex-col">
      <button
        type="button"
        onClick={() => onOpen(card.src)}
        className="group block w-full overflow-hidden rounded-xl border text-left transition-transform duration-300 hover:-translate-y-0.5"
        style={{
          borderColor: LINE,
          backgroundColor: "#fff",
          boxShadow: "0 10px 26px -22px rgba(15,23,42,0.45)",
        }}
        aria-label={`${card.code} ${card.title} vergrößern`}
      >
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img
          src={card.src}
          alt={card.alt}
          loading="lazy"
          className="block h-auto w-full transition-transform duration-500 group-hover:scale-[1.02]"
          style={{ aspectRatio: "2 / 3", objectFit: "cover" }}
        />
      </button>
      <figcaption className="mt-2.5 px-0.5">
        <span
          className="block text-[10px] font-medium uppercase tracking-[0.16em]"
          style={{ color: GREEN }}
        >
          {card.code}
        </span>
        <span
          className="mt-0.5 block text-[13px] leading-snug"
          style={{ fontFamily: "var(--font-serif)", fontWeight: 600, color: INK }}
        >
          {card.title}
        </span>
      </figcaption>
    </figure>
  );
}

// ════════════════════════════════════════════════════════════════════════════
// Lightbox — Vollbild mit Vor/Zurück über ALLE Karten
// ════════════════════════════════════════════════════════════════════════════
function Lightbox({
  index,
  onClose,
  onNavigate,
  reduced,
}: {
  index: number;
  onClose: () => void;
  onNavigate: (idx: number) => void;
  reduced: boolean;
}) {
  const total = DECK_CARDS.length;
  const card = DECK_CARDS[index];
  const touchStartX = useRef<number | null>(null);
  const touchStartY = useRef<number | null>(null);

  const goPrev = useCallback(() => {
    onNavigate((index - 1 + total) % total);
  }, [index, total, onNavigate]);

  const goNext = useCallback(() => {
    onNavigate((index + 1) % total);
  }, [index, total, onNavigate]);

  // Tastatur-Navigation + Scroll-Lock.
  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") onClose();
      else if (e.key === "ArrowLeft") goPrev();
      else if (e.key === "ArrowRight") goNext();
    };
    window.addEventListener("keydown", onKey);
    const prevOverflow = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    return () => {
      window.removeEventListener("keydown", onKey);
      document.body.style.overflow = prevOverflow;
    };
  }, [onClose, goPrev, goNext]);

  const onTouchStart = (e: React.TouchEvent) => {
    touchStartX.current = e.touches[0].clientX;
    touchStartY.current = e.touches[0].clientY;
  };
  const onTouchEnd = (e: React.TouchEvent) => {
    if (touchStartX.current === null || touchStartY.current === null) return;
    const dx = e.changedTouches[0].clientX - touchStartX.current;
    const dy = e.changedTouches[0].clientY - touchStartY.current;
    // horizontale Wischgeste (mind. 48px, überwiegend horizontal)
    if (Math.abs(dx) > 48 && Math.abs(dx) > Math.abs(dy)) {
      if (dx > 0) goPrev();
      else goNext();
    }
    touchStartX.current = null;
    touchStartY.current = null;
  };

  const caption =
    card.kind === "cover"
      ? "Cover"
      : card.kind === "safety"
        ? "Sicherheitskarte"
        : `${card.code} · ${card.title}`;

  return (
    <div
      className="kd-no-print fixed inset-0 z-50 flex flex-col"
      role="dialog"
      aria-modal="true"
      aria-label={caption}
      style={{
        backgroundColor: "rgba(15,18,15,0.92)",
        backdropFilter: "blur(6px)",
        animation: reduced ? undefined : "kd-fade-in 0.22s ease both",
      }}
      onClick={onClose}
    >
      {/* Kopfzeile: Beschriftung + Schließen */}
      <div
        className="flex items-center justify-between gap-4 px-5 py-4 md:px-8"
        onClick={(e) => e.stopPropagation()}
      >
        <span
          className="inline-flex items-center gap-2 text-[12px] uppercase tracking-[0.18em]"
          style={{ color: "rgba(248,245,240,0.78)" }}
        >
          <span
            className="inline-block h-[6px] w-[6px] rounded-full"
            style={{ backgroundColor: SAND }}
          />
          {caption}
        </span>
        <span
          className="text-[12px] tabular-nums"
          style={{ color: "rgba(248,245,240,0.55)" }}
        >
          {index + 1} / {total}
        </span>
        <button
          type="button"
          onClick={onClose}
          aria-label="Schließen"
          className="inline-flex h-10 w-10 items-center justify-center rounded-full transition-colors hover:bg-white/10"
          style={{ color: "#F8F5F0" }}
        >
          <X className="h-5 w-5" />
        </button>
      </div>

      {/* Bühne mit Wischen + großen Tap-Flächen */}
      <div
        className="relative flex flex-1 items-center justify-center px-3 pb-6 md:px-20"
        onTouchStart={onTouchStart}
        onTouchEnd={onTouchEnd}
      >
        {/* Tap-Fläche links (Mobil) — schließt nicht, navigiert */}
        <button
          type="button"
          onClick={(e) => {
            e.stopPropagation();
            goPrev();
          }}
          aria-label="Vorherige Karte"
          className="absolute inset-y-0 left-0 z-10 w-1/4 md:hidden"
          style={{ background: "transparent" }}
        />
        {/* Tap-Fläche rechts (Mobil) */}
        <button
          type="button"
          onClick={(e) => {
            e.stopPropagation();
            goNext();
          }}
          aria-label="Nächste Karte"
          className="absolute inset-y-0 right-0 z-10 w-1/4 md:hidden"
          style={{ background: "transparent" }}
        />

        {/* Desktop-Pfeil links */}
        <button
          type="button"
          onClick={(e) => {
            e.stopPropagation();
            goPrev();
          }}
          aria-label="Vorherige Karte"
          className="absolute left-3 z-10 hidden h-12 w-12 items-center justify-center rounded-full transition-colors hover:bg-white/10 md:inline-flex md:left-6"
          style={{ color: "#F8F5F0", border: "1px solid rgba(248,245,240,0.25)" }}
        >
          <ChevronLeft className="h-6 w-6" />
        </button>

        {/* Karte */}
        <figure
          key={card.src}
          onClick={(e) => e.stopPropagation()}
          className="flex max-h-full max-w-full flex-col items-center"
          style={{
            animation: reduced ? undefined : "kd-card-in 0.28s cubic-bezier(0.16,1,0.3,1) both",
          }}
        >
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img
            src={card.src}
            alt={card.alt}
            className="max-h-[78vh] w-auto rounded-2xl"
            style={{
              objectFit: "contain",
              boxShadow: "0 30px 70px -30px rgba(0,0,0,0.7)",
              backgroundColor: "#fff",
            }}
          />
        </figure>

        {/* Desktop-Pfeil rechts */}
        <button
          type="button"
          onClick={(e) => {
            e.stopPropagation();
            goNext();
          }}
          aria-label="Nächste Karte"
          className="absolute right-3 z-10 hidden h-12 w-12 items-center justify-center rounded-full transition-colors hover:bg-white/10 md:inline-flex md:right-6"
          style={{ color: "#F8F5F0", border: "1px solid rgba(248,245,240,0.25)" }}
        >
          <ChevronRight className="h-6 w-6" />
        </button>
      </div>

      {/* Hinweis auf Mobil */}
      <p
        className="px-6 pb-6 text-center text-[11px] uppercase tracking-[0.18em] md:hidden"
        style={{ color: "rgba(248,245,240,0.45)" }}
        onClick={(e) => e.stopPropagation()}
      >
        Wischen oder tippen zum Blättern
      </p>
    </div>
  );
}

// ════════════════════════════════════════════════════════════════════════════
// Layout-Helfer
// ════════════════════════════════════════════════════════════════════════════

/** Kleiner Sektions-Eyebrow mit Sand-Punkt (analog Workbook). */
function Eyebrow({ children, icon: Icon }: { children: ReactNode; icon?: LucideIcon }) {
  return (
    <p
      className="inline-flex items-center gap-2 text-[11px] font-medium uppercase tracking-[0.24em]"
      style={{ color: GREEN }}
    >
      {Icon ? (
        <Icon className="h-3.5 w-3.5" />
      ) : (
        <span
          className="inline-block h-[6px] w-[6px] rounded-full"
          style={{ backgroundColor: SAND }}
        />
      )}
      {children}
    </p>
  );
}
