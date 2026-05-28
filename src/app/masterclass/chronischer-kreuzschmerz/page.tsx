import type { Metadata } from "next";
import Link from "next/link";
import {
  Headphones,
  Clock,
  Play,
  Lock,
  BookOpen,
  PenLine,
  Layers,
  ArrowUpRight,
  Sparkles,
} from "lucide-react";

import {
  MASTERCLASS_SECTIONS,
  getLessonsBySection,
  availableLessonCount,
  MASTERCLASS_LESSONS,
} from "@/lib/masterclass/registry";
import { hasWorkbook } from "@/lib/masterclass/workbook/registry";
import { DECK_UEBUNGEN } from "@/lib/masterclass/kartendeck";
import {
  hasMasterclassAccess,
  isPreviewLesson,
  MASTERCLASS_SHOP_HREF,
} from "@/lib/masterclass/access";
import { createSupabaseServerClient } from "@/lib/supabase-server";

const PAPER = "#F8F5F0";
const INK = "#0f172a";
const MUTED = "#64748b";
const ACCENT = "#059669";
const LINE = "#e7e1d6";
const SAND = "#C9B79C";
const GREEN = "#2C3E2D";

export const metadata: Metadata = {
  title: "Masterclass · Chronischer Kreuzschmerz",
  description:
    "Die Masterclass Chronischer Kreuzschmerz: 27 Lektionen in sechs Sektionen — Verstehen, Handeln, Bleiben, Wiederkommen.",
  robots: { index: false, follow: false },
};

const LESSON_HREF = "/masterclass/chronischer-kreuzschmerz";

export default async function MasterclassOverviewPage() {
  const total = MASTERCLASS_LESSONS.length;
  const available = availableLessonCount();
  const totalMinutes = MASTERCLASS_LESSONS.reduce(
    (sum, l) => sum + l.audioMinuten,
    0,
  );
  const totalHours = Math.round(totalMinutes / 60);

  // Zugriffsschutz: Übersicht bleibt für alle erreichbar (Showcase). Käufer/
  // Admins sehen alles anklickbar; Nicht-Käufer bekommen Schlösser + CTA-Leiste.
  const supabase = await createSupabaseServerClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  const hasAccess = await hasMasterclassAccess(user?.id);

  return (
    <main className="min-h-[100dvh]" style={{ backgroundColor: PAPER }}>
      {/* ── Premium-Hinweis / CTA für Nicht-Käufer ── */}
      {!hasAccess && (
        <section className="mx-auto w-full max-w-3xl px-6 pt-8">
          <div
            className="relative overflow-hidden rounded-2xl border px-6 py-6 md:px-8"
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
                  "radial-gradient(circle, rgba(201,183,156,0.32) 0%, transparent 70%)",
              }}
            />
            <div className="relative flex flex-col gap-4 md:flex-row md:items-center md:justify-between md:gap-6">
              <div className="flex items-start gap-4">
                <span
                  className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl"
                  style={{ backgroundColor: "rgba(44,62,45,0.1)", color: GREEN }}
                  aria-hidden="true"
                >
                  <Sparkles className="h-5 w-5" />
                </span>
                <div className="min-w-0">
                  <p
                    className="text-base md:text-lg"
                    style={{
                      fontFamily: "var(--font-display)",
                      fontWeight: 600,
                      color: INK,
                    }}
                  >
                    Diese Masterclass ist ein Premium-Produkt
                  </p>
                  <p className="mt-1 text-xs md:text-sm" style={{ color: MUTED }}>
                    Das Intro gibt es gratis — voller Zugriff auf alle Module,
                    Workbooks und das Bonus-Kartendeck nach dem Kauf.
                  </p>
                </div>
              </div>
              <div className="flex shrink-0 flex-col gap-2.5 sm:flex-row md:flex-col lg:flex-row">
                <Link
                  href={`${LESSON_HREF}/I.1`}
                  className="inline-flex h-11 items-center justify-center rounded-full border px-5 text-sm font-medium transition-colors hover:bg-[rgba(5,150,105,0.06)]"
                  style={{ borderColor: LINE, color: INK }}
                >
                  Intro gratis ansehen
                </Link>
                <Link
                  href={MASTERCLASS_SHOP_HREF}
                  className="inline-flex h-11 items-center justify-center gap-1.5 rounded-full px-5 text-sm font-medium text-white shadow-sm transition-transform hover:scale-[1.02]"
                  style={{ backgroundColor: GREEN }}
                >
                  Im Shop ansehen / freischalten
                  <ArrowUpRight className="h-4 w-4" />
                </Link>
              </div>
            </div>
          </div>
        </section>
      )}

      {/* ── Hero ── */}
      <section className="mx-auto flex w-full max-w-3xl flex-col items-center px-6 pb-14 pt-20 text-center md:pt-28">
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img
          src="/images/physio-logo.png"
          alt="Physiotherapie Glawe"
          className="mb-12 h-14 w-auto opacity-90"
        />

        <p
          className="mb-6 text-xs font-medium uppercase tracking-[0.28em]"
          style={{ color: ACCENT }}
        >
          Masterclass
        </p>

        <h1
          className="text-display-lg"
          style={{ fontFamily: "var(--font-display)", fontWeight: 600, color: INK }}
        >
          Chronischer Kreuzschmerz
        </h1>

        <p
          className="mt-6 text-base uppercase tracking-[0.18em] md:text-lg"
          style={{ color: MUTED }}
        >
          Verstehen · Handeln · Bleiben · Wiederkommen
        </p>

        <div className="my-10 h-px w-16" style={{ backgroundColor: ACCENT }} />

        <p
          className="max-w-xl text-lg leading-relaxed md:text-xl"
          style={{ color: INK, fontFamily: "var(--font-display)", fontWeight: 400 }}
        >
          Das, was meine Patienten in der Praxis bekommen – strukturiert,
          ortsunabhängig, in deinem Tempo. Sechs Sektionen, die aufeinander
          aufbauen: vom ehrlichen Versprechen über das Verstehen bis zu den
          Werkzeugen für deinen Alltag.
        </p>

        {/* Meta */}
        <div
          className="mt-10 flex flex-wrap items-center justify-center gap-x-8 gap-y-3 text-sm"
          style={{ color: MUTED }}
        >
          <span className="inline-flex items-center gap-2">
            <Headphones className="h-4 w-4" />
            {total} Lektionen · 6 Sektionen
          </span>
          <span className="inline-flex items-center gap-2">
            <Clock className="h-4 w-4" />~ {totalHours} Stunden
          </span>
          <span
            className="rounded-full px-3 py-1 text-xs font-medium uppercase tracking-wider"
            style={{ backgroundColor: "rgba(5,150,105,0.10)", color: ACCENT }}
          >
            {available} verfügbar
          </span>
        </div>
      </section>

      {/* ── Workbook-Download ── */}
      <section className="mx-auto w-full max-w-3xl px-6 pb-4">
        <Link
          href={
            hasAccess
              ? "/masterclass/chronischer-kreuzschmerz/workbook/I.1"
              : MASTERCLASS_SHOP_HREF
          }
          className="group flex items-center gap-4 rounded-2xl border bg-white/60 px-5 py-5 transition-colors hover:bg-[rgba(5,150,105,0.05)] md:gap-5 md:px-7"
          style={{ borderColor: LINE }}
        >
          <span
            className="flex h-12 w-12 shrink-0 items-center justify-center rounded-xl"
            style={{ backgroundColor: "rgba(5,150,105,0.10)", color: ACCENT }}
            aria-hidden="true"
          >
            <BookOpen className="h-5 w-5" />
          </span>
          <span className="min-w-0 flex-1">
            <span
              className="block text-base md:text-lg"
              style={{
                color: INK,
                fontFamily: "var(--font-display)",
                fontWeight: 600,
              }}
            >
              Das interaktive Workbook öffnen
            </span>
            <span className="mt-0.5 block text-xs md:text-sm" style={{ color: MUTED }}>
              Zum Mitmachen direkt im Browser — Theorie-Vertiefung, Übungen
              interaktiv ausfüllen, Notizen speichern. Jederzeit als PDF drucken.
            </span>
            {!hasAccess && (
              <span
                className="mt-2 inline-flex items-center gap-1.5 text-[11px] font-medium uppercase tracking-[0.14em]"
                style={{ color: MUTED }}
              >
                <Lock className="h-3 w-3" />
                Im Kauf enthalten
              </span>
            )}
          </span>
          <span
            className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full text-white shadow-sm transition-transform group-hover:scale-105"
            style={{ backgroundColor: ACCENT }}
            aria-hidden="true"
          >
            <PenLine className="h-4 w-4" />
          </span>
        </Link>
      </section>

      {/* ── Bonus: Übungskartendeck ── */}
      <section className="mx-auto w-full max-w-3xl px-6 pb-4 pt-4">
        <Link
          href={
            hasAccess
              ? "/masterclass/chronischer-kreuzschmerz/kartendeck"
              : MASTERCLASS_SHOP_HREF
          }
          className="group relative block overflow-hidden rounded-2xl border px-6 py-6 transition-colors md:px-8 md:py-7"
          style={{
            borderColor: SAND,
            background:
              "linear-gradient(135deg, rgba(201,183,156,0.16) 0%, rgba(201,183,156,0.05) 55%, rgba(252,250,246,0.9) 100%)",
          }}
        >
          {/* dezente Sand-Aura oben rechts */}
          <span
            aria-hidden="true"
            className="pointer-events-none absolute -right-10 -top-12 h-36 w-36 rounded-full"
            style={{
              background: "radial-gradient(circle, rgba(201,183,156,0.35) 0%, transparent 70%)",
            }}
          />
          <div className="relative flex items-start gap-4 md:gap-5">
            <span
              className="flex h-12 w-12 shrink-0 items-center justify-center rounded-xl"
              style={{ backgroundColor: "rgba(44,62,45,0.1)", color: GREEN }}
              aria-hidden="true"
            >
              <Layers className="h-5 w-5" />
            </span>
            <div className="min-w-0 flex-1">
              <span
                className="inline-flex items-center gap-1.5 rounded-full px-2.5 py-1 text-[10px] font-semibold uppercase tracking-[0.18em]"
                style={{ backgroundColor: "rgba(44,62,45,0.1)", color: GREEN }}
              >
                Bonus
              </span>
              <h3
                className="mt-2.5 text-lg md:text-xl"
                style={{ fontFamily: "var(--font-display)", fontWeight: 600, color: INK }}
              >
                Das Übungskartendeck für unterwegs
              </h3>
              <p className="mt-1.5 text-xs md:text-sm" style={{ color: MUTED }}>
                Alle {DECK_UEBUNGEN} Schlüsselübungen als Karten zum Durchblättern
                und Ausdrucken — inklusive in deiner Masterclass.
              </p>
              {!hasAccess && (
                <span
                  className="mt-2 inline-flex items-center gap-1.5 text-[11px] font-medium uppercase tracking-[0.14em]"
                  style={{ color: GREEN }}
                >
                  <Lock className="h-3 w-3" />
                  Im Kauf enthalten
                </span>
              )}
            </div>
            <span
              className="mt-1 flex h-10 w-10 shrink-0 items-center justify-center rounded-full text-white shadow-sm transition-transform group-hover:scale-105"
              style={{ backgroundColor: GREEN }}
              aria-hidden="true"
            >
              <ArrowUpRight className="h-4 w-4" />
            </span>
          </div>
        </Link>
      </section>

      {/* ── Lektions-Übersicht nach Sektionen ── */}
      <section className="mx-auto w-full max-w-3xl px-6 pb-28">
        <div className="flex flex-col gap-14">
          {MASTERCLASS_SECTIONS.map((section, sIdx) => {
            const lessons = getLessonsBySection(section.key);
            return (
              <div key={section.key}>
                {/* Sektions-Kopf */}
                <div className="mb-6 flex items-baseline gap-4">
                  <span
                    className="text-sm font-semibold tabular-nums"
                    style={{ color: ACCENT, fontFamily: "var(--font-display)" }}
                  >
                    {String(sIdx + 1).padStart(2, "0")}
                  </span>
                  <div>
                    <h2
                      className="text-2xl md:text-3xl"
                      style={{
                        fontFamily: "var(--font-display)",
                        fontWeight: 600,
                        color: INK,
                      }}
                    >
                      {section.title}
                    </h2>
                    <p
                      className="mt-0.5 text-xs uppercase tracking-[0.2em]"
                      style={{ color: MUTED }}
                    >
                      {section.caption}
                    </p>
                  </div>
                </div>

                {/* Lektionen der Sektion */}
                <ul
                  className="overflow-hidden rounded-2xl border bg-white/50"
                  style={{ borderColor: LINE }}
                >
                  {lessons.map((lesson, lIdx) => {
                    // Gating: für Nicht-Käufer sind nur die Vorschau-Lektionen
                    // (I.1–I.3) frei; alle übrigen verfügbaren Lektionen werden
                    // mit Schloss markiert und verlinken zur Shop-Seite.
                    const isPreview = isPreviewLesson(lesson.id);
                    const locked = !hasAccess && !isPreview;
                    return (
                    <li
                      key={lesson.id}
                      style={
                        lIdx > 0
                          ? { borderTop: `1px solid ${LINE}` }
                          : undefined
                      }
                    >
                      {lesson.available && !locked ? (
                        <Link
                          href={`${LESSON_HREF}/${lesson.id}`}
                          className="group flex items-center gap-4 px-5 py-4 transition-colors hover:bg-[rgba(5,150,105,0.05)] md:px-6"
                        >
                          <LessonNr nr={lesson.nr} available />
                          <span className="min-w-0 flex-1">
                            <span
                              className="flex items-center gap-2 truncate text-base md:text-lg"
                              style={{
                                color: INK,
                                fontFamily: "var(--font-display)",
                                fontWeight: 500,
                              }}
                            >
                              <span className="truncate">{lesson.title}</span>
                              {!hasAccess && isPreview && (
                                <span
                                  className="shrink-0 rounded-full px-2 py-0.5 text-[10px] font-semibold uppercase tracking-[0.14em]"
                                  style={{
                                    backgroundColor: "rgba(5,150,105,0.10)",
                                    color: ACCENT,
                                  }}
                                >
                                  Gratis
                                </span>
                              )}
                            </span>
                            <span
                              className="text-xs"
                              style={{ color: MUTED }}
                            >
                              {lesson.audioMinuten} Min
                            </span>
                          </span>
                          <span
                            className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full text-white shadow-sm transition-transform group-hover:scale-105"
                            style={{ backgroundColor: ACCENT }}
                            aria-hidden="true"
                          >
                            <Play className="ml-0.5 h-4 w-4" fill="currentColor" />
                          </span>
                        </Link>
                      ) : null}

                      {/* Gesperrte (kostenpflichtige) Lektion → Shop-Seite */}
                      {lesson.available && locked ? (
                        <Link
                          href={MASTERCLASS_SHOP_HREF}
                          className="group flex items-center gap-4 px-5 py-4 transition-colors hover:bg-[rgba(44,62,45,0.04)] md:px-6"
                        >
                          <LessonNr nr={lesson.nr} available={false} />
                          <span className="min-w-0 flex-1">
                            <span
                              className="block truncate text-base md:text-lg"
                              style={{
                                color: INK,
                                fontFamily: "var(--font-display)",
                                fontWeight: 500,
                              }}
                            >
                              {lesson.title}
                            </span>
                            <span
                              className="text-xs uppercase tracking-[0.16em]"
                              style={{ color: MUTED }}
                            >
                              Freischalten · {lesson.audioMinuten} Min
                            </span>
                          </span>
                          <span
                            className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full transition-transform group-hover:scale-105"
                            style={{
                              backgroundColor: "rgba(44,62,45,0.08)",
                              color: GREEN,
                            }}
                            aria-hidden="true"
                          >
                            <Lock className="h-4 w-4" />
                          </span>
                        </Link>
                      ) : null}

                      {/* Interaktives Workbook (dezenter Sekundär-Einstieg) */}
                      {lesson.available && !locked && hasWorkbook(lesson.id) && (
                        <Link
                          href={`${LESSON_HREF}/workbook/${lesson.id}`}
                          className="group/wb flex items-center gap-2.5 px-5 pb-4 pl-[4.75rem] text-xs transition-colors hover:text-[#059669] md:px-6 md:pl-[5.25rem]"
                          style={{ color: MUTED }}
                        >
                          <PenLine className="h-3.5 w-3.5" style={{ color: ACCENT }} />
                          <span style={{ fontWeight: 500 }}>
                            Workbook zu dieser Lektion
                          </span>
                          <span className="transition-transform group-hover/wb:translate-x-0.5">
                            interaktiv →
                          </span>
                        </Link>
                      )}

                      {!lesson.available && (
                        <div
                          className="flex items-center gap-4 px-5 py-4 md:px-6"
                          aria-disabled="true"
                        >
                          <LessonNr nr={lesson.nr} available={false} />
                          <span className="min-w-0 flex-1">
                            <span
                              className="block truncate text-base md:text-lg"
                              style={{
                                color: MUTED,
                                fontFamily: "var(--font-display)",
                                fontWeight: 500,
                              }}
                            >
                              {lesson.title}
                            </span>
                            <span
                              className="text-xs uppercase tracking-[0.16em]"
                              style={{ color: MUTED, opacity: 0.8 }}
                            >
                              In Kürze · {lesson.audioMinuten} Min
                            </span>
                          </span>
                          <span
                            className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full"
                            style={{
                              backgroundColor: "rgba(100,116,139,0.08)",
                              color: MUTED,
                            }}
                            aria-hidden="true"
                          >
                            <Lock className="h-4 w-4" />
                          </span>
                        </div>
                      )}
                    </li>
                    );
                  })}
                </ul>
              </div>
            );
          })}
        </div>

        {/* Fußnote */}
        <p
          className="mt-16 text-center text-[11px] leading-relaxed"
          style={{
            color: MUTED,
            borderTop: `1px solid ${LINE}`,
            paddingTop: "1.5rem",
          }}
        >
          Diese Masterclass ersetzt nicht deinen Arzt oder deine Diagnostik. Sie
          ist ein Werkzeugkasten für mehr Schmerzkompetenz – kein Heilversprechen.
        </p>
      </section>
    </main>
  );
}

// ── Lektions-Nummer-Badge ────────────────────────────────────────────────────

function LessonNr({ nr, available }: { nr: string; available: boolean }) {
  return (
    <span
      className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl text-sm font-semibold tabular-nums"
      style={{
        fontFamily: "var(--font-display)",
        backgroundColor: available ? "rgba(5,150,105,0.10)" : "rgba(100,116,139,0.06)",
        color: available ? ACCENT : MUTED,
      }}
    >
      {nr}
    </span>
  );
}
