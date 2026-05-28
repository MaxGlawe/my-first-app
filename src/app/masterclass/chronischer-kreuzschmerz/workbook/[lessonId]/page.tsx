import type { Metadata } from "next";
import { notFound, redirect } from "next/navigation";

import { getLessonMeta } from "@/lib/masterclass/registry";
import { getWorkbook, workbookLessonIds } from "@/lib/masterclass/workbook/registry";
import {
  hasMasterclassAccess,
  isPreviewLesson,
  MASTERCLASS_SHOP_HREF,
} from "@/lib/masterclass/access";
import { createSupabaseServerClient } from "@/lib/supabase-server";
import WorkbookClient from "./workbook-client";

interface PageProps {
  params: Promise<{ lessonId: string }>;
}

/** Nur Lektionen mit Workbook vorab erzeugen. */
export function generateStaticParams() {
  return workbookLessonIds().map((lessonId) => ({ lessonId }));
}

export async function generateMetadata({ params }: PageProps): Promise<Metadata> {
  const { lessonId } = await params;
  const wb = getWorkbook(lessonId);
  if (!wb) {
    return { title: "Workbook · Chronischer Kreuzschmerz", robots: { index: false } };
  }
  return {
    title: `Workbook · Lektion ${wb.nr} — ${wb.title}`,
    description: `Interaktives Workbook zur Lektion ${wb.nr}: ${wb.title}.`,
    robots: { index: false, follow: false },
  };
}

export default async function WorkbookPage({ params }: PageProps) {
  const { lessonId } = await params;
  const wb = getWorkbook(lessonId);

  // Kein Workbook für diese Lektion → 404 (z.B. Tippfehler oder noch nicht gebaut).
  if (!wb) notFound();

  // Sanity: Lektion muss in der Registry existieren.
  const meta = getLessonMeta(lessonId);
  if (!meta) notFound();

  // Zugriffsschutz: Workbooks der Vorschau-Lektionen (I.1–I.3) sind gratis,
  // alle übrigen nur für Käufer/Admins. Nicht-Käufer → Shop-Seite.
  if (!isPreviewLesson(lessonId)) {
    const supabase = await createSupabaseServerClient();
    const {
      data: { user },
    } = await supabase.auth.getUser();
    if (!(await hasMasterclassAccess(user?.id))) {
      redirect(MASTERCLASS_SHOP_HREF);
    }
  }

  return <WorkbookClient data={wb} />;
}
