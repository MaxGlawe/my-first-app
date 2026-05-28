import type { Metadata } from "next";
import Link from "next/link";
import { notFound, redirect } from "next/navigation";
import { ArrowLeft, Clock } from "lucide-react";

import {
  getLessonMeta,
  getLessonsBySection,
  MASTERCLASS_LESSONS,
  MASTERCLASS_SECTIONS,
} from "@/lib/masterclass/registry";
import { loadLesson } from "@/lib/masterclass/load";
import {
  hasMasterclassAccess,
  isPreviewLesson,
  MASTERCLASS_SHOP_HREF,
} from "@/lib/masterclass/access";
import { createSupabaseServerClient } from "@/lib/supabase-server";
import LessonClient from "./lesson-client";

const PAPER = "#F8F5F0";
const INK = "#0f172a";
const MUTED = "#64748b";
const ACCENT = "#059669";
const LINE = "#e7e1d6";

interface PageProps {
  params: Promise<{ lessonId: string }>;
}

// Alle bekannten Lektions-IDs vorab erzeugen (verfügbar wie „in Kürze").
export function generateStaticParams() {
  return MASTERCLASS_LESSONS.map((l) => ({ lessonId: l.id }));
}

export async function generateMetadata({
  params,
}: PageProps): Promise<Metadata> {
  const { lessonId } = await params;
  const meta = getLessonMeta(lessonId);
  if (!meta) {
    return { title: "Masterclass · Chronischer Kreuzschmerz", robots: { index: false } };
  }
  return {
    title: `Masterclass · Chronischer Kreuzschmerz — Lektion ${meta.nr}`,
    description: `Lektion ${meta.nr}: ${meta.title}.`,
    robots: { index: false, follow: false },
  };
}

export default async function LessonPage({ params }: PageProps) {
  const { lessonId } = await params;
  const meta = getLessonMeta(lessonId);

  // Unbekannte ID → echte 404.
  if (!meta) notFound();

  // Zugriffsschutz: Intro-Lektionen (I.1–I.3) sind Gratis-Vorschau, alles
  // andere nur für Käufer/Admins. Nicht-Käufer → Shop-Seite.
  if (!isPreviewLesson(lessonId)) {
    const supabase = await createSupabaseServerClient();
    const {
      data: { user },
    } = await supabase.auth.getUser();
    if (!(await hasMasterclassAccess(user?.id))) {
      redirect(MASTERCLASS_SHOP_HREF);
    }
  }

  const section = MASTERCLASS_SECTIONS.find((s) => s.key === meta.section);
  const sectionTitle = section?.title ?? "";

  const lesson = meta.available ? loadLesson(lessonId) : null;

  // Verfügbar + Daten vorhanden → Player-Flow.
  if (lesson) {
    return (
      <LessonClient lesson={lesson} meta={meta} sectionTitle={sectionTitle} />
    );
  }

  // Bekannt, aber noch nicht verfügbar → „in Kürze".
  return <ComingSoon meta={meta} sectionTitle={sectionTitle} />;
}

// ── „In Kürze"-Ansicht für noch nicht gebaute Lektionen ──────────────────────

function ComingSoon({
  meta,
  sectionTitle,
}: {
  meta: NonNullable<ReturnType<typeof getLessonMeta>>;
  sectionTitle: string;
}) {
  // Nächste verfügbare Lektion innerhalb derselben Sektion (zum Stöbern).
  const siblings = getLessonsBySection(meta.section);
  const available = siblings.find((l) => l.available);

  return (
    <main
      className="flex min-h-[100dvh] flex-col items-center justify-center px-6 py-16"
      style={{ backgroundColor: PAPER }}
    >
      <div className="mx-auto flex w-full max-w-xl flex-col items-center text-center">
        <Link
          href="/masterclass/chronischer-kreuzschmerz"
          className="mb-10 inline-flex items-center gap-2 text-xs uppercase tracking-[0.18em] transition-opacity hover:opacity-70"
          style={{ color: MUTED }}
        >
          <ArrowLeft className="h-4 w-4" />
          Alle Lektionen
        </Link>

        <p
          className="mb-6 text-xs font-medium uppercase tracking-[0.28em]"
          style={{ color: ACCENT }}
        >
          {sectionTitle}
        </p>

        <span
          className="mb-6 inline-flex items-center gap-2 rounded-full px-4 py-1.5 text-xs font-medium uppercase tracking-wider"
          style={{ backgroundColor: "rgba(100,116,139,0.10)", color: MUTED }}
        >
          <Clock className="h-3.5 w-3.5" />
          In Kürze
        </span>

        <h1
          className="text-display-md"
          style={{ fontFamily: "var(--font-display)", fontWeight: 600, color: INK }}
        >
          {meta.title}
        </h1>

        <p
          className="mt-4 text-sm uppercase tracking-[0.18em]"
          style={{ color: MUTED }}
        >
          Lektion {meta.nr} · ca. {meta.audioMinuten} Min
        </p>

        <div className="my-10 h-px w-16" style={{ backgroundColor: LINE }} />

        <p
          className="max-w-md text-lg leading-relaxed"
          style={{ color: INK, fontFamily: "var(--font-display)", fontWeight: 400 }}
        >
          Diese Lektion wird gerade produziert. Sie erscheint hier, sobald sie
          fertig ist.
        </p>

        <Link
          href={
            available
              ? `/masterclass/chronischer-kreuzschmerz/${available.id}`
              : "/masterclass/chronischer-kreuzschmerz"
          }
          className="mt-12 inline-flex h-12 items-center justify-center rounded-full px-8 text-base text-white shadow-md transition-transform hover:scale-[1.02] hover:opacity-95"
          style={{ backgroundColor: ACCENT }}
        >
          {available
            ? `Verfügbare Lektion: ${available.nr}`
            : "Zur Übersicht"}
        </Link>
      </div>
    </main>
  );
}
