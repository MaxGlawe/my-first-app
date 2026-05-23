/**
 * PROJ-21: /kurse/[slug] — Öffentliche Kursseite (Server-Wrapper)
 *
 * Server-Component: liefert pro Kurs eigene SEO-Metadaten via generateMetadata.
 * Der interaktive Teil (Fetch, Gast-Checkout) liegt in ProductDetailClient.
 */

import type { Metadata } from "next"
import { createSupabaseServiceClient } from "@/lib/supabase-service"
import { ProductDetailClient } from "./ProductDetailClient"

export async function generateMetadata({
  params,
}: {
  params: Promise<{ slug: string }>
}): Promise<Metadata> {
  const { slug } = await params

  try {
    const sc = createSupabaseServiceClient()
    const { data: product } = await sc
      .from("products")
      .select("titel, kurzbeschreibung")
      .eq("slug", slug)
      .eq("status", "aktiv")
      .maybeSingle()

    if (product) {
      return {
        title: product.titel,
        description:
          product.kurzbeschreibung ??
          "Von Physiotherapeuten entwickelte 21-Tage-Challenge bei Praxis OS.",
        alternates: { canonical: `/kurse/${slug}` },
      }
    }
  } catch {
    // Fällt unten auf den generischen Titel zurück
  }

  return { title: "Challenge" }
}

export default function Page() {
  return <ProductDetailClient />
}
