/**
 * Masterclass „Chronischer Kreuzschmerz" — Shop-Produkt & Zugriffsschutz.
 *
 * Reiner Einmalkauf (399 €). Der Kauf vergibt ein content_entitlement mit
 * content_type='masterclass' und der festen content_id unten (siehe Migration
 * 20260527000001_masterclass_chronischer_kreuzschmerz.sql). Das Gating prüft
 * genau dieses Entitlement — ohne DB-Lookup des Produkts.
 *
 * `hasMasterclassAccess` ist SERVER-ONLY (nutzt den Service-Client über
 * `content-access`). Nur aus Server-Komponenten / Route-Handlern aufrufen.
 */

import { hasContentAccess } from "@/lib/content-access";
import { createSupabaseServiceClient } from "@/lib/supabase-service";

/** Slug des Shop-Produkts → Verkaufsseite /shop/<slug>. */
export const MASTERCLASS_SLUG = "chronischer-kreuzschmerz";

/** Öffentliche Verkaufsseite (Redirect-Ziel für Nicht-Käufer) — /kurse ist
 *  öffentlich erreichbar, /shop/* liegt hinter dem Login. */
export const MASTERCLASS_SHOP_HREF = `/kurse/${MASTERCLASS_SLUG}`;

/** content_entitlements / product_contents Diskriminator. */
export const MASTERCLASS_CONTENT_TYPE = "masterclass";

/** Feste Content-ID — identisch zur Migration (product_contents.content_id). */
export const MASTERCLASS_CONTENT_ID = "b9f3a7c2-1d4e-4a8b-9c6f-2e5d8a0b3c71";

/** Gratis-Vorschau: die drei Intro-Lektionen (inkl. Red-Flag-Selbstcheck). */
export const FREE_PREVIEW_LESSON_IDS = ["I.1", "I.2", "I.3"] as const;

/** true, wenn die Lektion frei zugänglich ist (Gratis-Vorschau). */
export function isPreviewLesson(lessonId: string): boolean {
  return (FREE_PREVIEW_LESSON_IDS as readonly string[]).includes(lessonId);
}

/**
 * SERVER-ONLY: Darf der User die (kostenpflichtigen) Masterclass-Inhalte sehen?
 * - Admins (Praxis-Team) haben immer Zugriff.
 * - sonst: Kauf-Entitlement (content_type='masterclass').
 * Gibt false zurück, wenn kein User angemeldet ist.
 */
export async function hasMasterclassAccess(
  userId: string | null | undefined,
): Promise<boolean> {
  if (!userId) return false;

  // Admins (Praxis-Team) immer durchlassen — auch ohne Kauf.
  const sc = createSupabaseServiceClient();
  const { data: profile } = await sc
    .from("user_profiles")
    .select("role")
    .eq("id", userId)
    .maybeSingle();
  if (profile?.role === "admin") return true;

  return hasContentAccess(userId, MASTERCLASS_CONTENT_TYPE, MASTERCLASS_CONTENT_ID);
}
