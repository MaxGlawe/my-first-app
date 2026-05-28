"use client";

import { useState } from "react";
import Link from "next/link";
import { Headphones, Clock, Play, ArrowLeft, PenLine } from "lucide-react";

import { Button } from "@/components/ui/button";
import MasterclassPlayer from "@/components/masterclass/MasterclassPlayer";
import { totalSlides, type Lesson } from "@/lib/masterclass/types";
import type { LessonMeta } from "@/lib/masterclass/registry";
import { hasWorkbook } from "@/lib/masterclass/workbook/registry";

const PAPER = "#F8F5F0";
const INK = "#0f172a";
const MUTED = "#64748b";
const ACCENT = "#059669";
const LINE = "#e7e1d6";

/**
 * Generischer Lektions-Client: Premium-Landing der einzelnen Lektion → startet
 * den Player. Bewusst schlankes, eigenes Layout (keine globale Navigation),
 * damit der „Podcast-PowerPoint"-Modus vollflächig wirkt.
 */
export default function LessonClient({
  lesson,
  meta,
  sectionTitle,
}: {
  lesson: Lesson;
  meta: LessonMeta;
  sectionTitle: string;
}) {
  const [started, setStarted] = useState(false);

  if (started) {
    return <MasterclassPlayer lesson={lesson} />;
  }

  const slides = totalSlides(lesson);
  const sectionCount = lesson.sections.length;

  return (
    <main
      className="flex min-h-[100dvh] flex-col items-center justify-center px-6 py-16"
      style={{ backgroundColor: PAPER }}
    >
      <div className="mx-auto flex w-full max-w-2xl flex-col items-center text-center">
        {/* Zurück zur Übersicht */}
        <Link
          href="/masterclass/chronischer-kreuzschmerz"
          className="mb-8 inline-flex items-center gap-2 text-xs uppercase tracking-[0.18em] transition-opacity hover:opacity-70"
          style={{ color: MUTED }}
        >
          <ArrowLeft className="h-4 w-4" />
          Alle Lektionen
        </Link>

        {/* Logo */}
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img
          src="/images/physio-logo.png"
          alt="Physiotherapie Glawe"
          className="mb-10 h-14 w-auto opacity-90"
        />

        {/* Kicker */}
        <p
          className="mb-6 text-xs font-medium uppercase tracking-[0.28em]"
          style={{ color: ACCENT }}
        >
          Masterclass · {sectionTitle}
        </p>

        {/* Titel */}
        <h1
          className="text-display-lg"
          style={{
            fontFamily: "var(--font-display)",
            fontWeight: 600,
            color: INK,
          }}
        >
          {lesson.title}
        </h1>

        {/* Untertitel */}
        <p
          className="mt-6 text-base uppercase tracking-[0.18em] md:text-lg"
          style={{ color: MUTED }}
        >
          {lesson.subtitle}
        </p>

        <div className="my-10 h-px w-16" style={{ backgroundColor: ACCENT }} />

        {/* Meta */}
        <div
          className="flex flex-wrap items-center justify-center gap-x-8 gap-y-3 text-sm"
          style={{ color: MUTED }}
        >
          <span className="inline-flex items-center gap-2">
            <span
              className="rounded-full px-3 py-1 text-xs font-medium uppercase tracking-wider"
              style={{ backgroundColor: "rgba(5,150,105,0.10)", color: ACCENT }}
            >
              Lektion {meta.nr}
            </span>
          </span>
          <span className="inline-flex items-center gap-2">
            <Clock className="h-4 w-4" />
            {meta.audioMinuten} Min
          </span>
          <span className="inline-flex items-center gap-2">
            <Headphones className="h-4 w-4" />
            {slides} Slides · {sectionCount} Abschnitte
          </span>
        </div>

        {/* CTA */}
        <Button
          onClick={() => setStarted(true)}
          size="lg"
          className="mt-12 h-14 rounded-full px-10 text-base text-white shadow-lg transition-transform hover:scale-[1.02] hover:opacity-95"
          style={{ backgroundColor: ACCENT }}
        >
          <Play className="mr-1 h-5 w-5" fill="currentColor" />
          Lektion starten
        </Button>

        <p className="mt-6 text-xs" style={{ color: MUTED }}>
          Kopfhörer empfohlen · 20 Minuten ungestört
        </p>

        {/* Workbook-Einstieg (nur bei vorhandenem interaktiven Workbook) */}
        {hasWorkbook(meta.id) && (
          <Link
            href={`/masterclass/chronischer-kreuzschmerz/workbook/${meta.id}`}
            className="group mt-10 inline-flex items-center gap-2.5 rounded-full border px-5 py-2.5 text-sm transition-colors hover:bg-[rgba(5,150,105,0.05)]"
            style={{ borderColor: LINE, color: INK }}
          >
            <PenLine className="h-4 w-4" style={{ color: ACCENT }} />
            <span style={{ fontFamily: "var(--font-display)", fontWeight: 500 }}>
              Workbook zu dieser Lektion
            </span>
            <span
              className="text-xs transition-transform group-hover:translate-x-0.5"
              style={{ color: MUTED }}
            >
              interaktiv →
            </span>
          </Link>
        )}
      </div>

      {/* Fußnote */}
      <p
        className="mt-16 max-w-md text-center text-[11px] leading-relaxed"
        style={{
          color: MUTED,
          borderTop: `1px solid ${LINE}`,
          paddingTop: "1.5rem",
        }}
      >
        Diese Masterclass ersetzt nicht deinen Arzt oder deine Diagnostik. Sie ist
        ein Werkzeugkasten für mehr Schmerzkompetenz – kein Heilversprechen.
      </p>
    </main>
  );
}
