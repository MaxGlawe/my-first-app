import { MetadataRoute } from "next"
import { STAEDTE } from "@/lib/staedte"
import { BESCHWERDEN } from "@/lib/beschwerden"
import { createSupabaseServiceClient } from "@/lib/supabase-service"

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const baseUrl = "https://wwwpraxis-os.com"
  const now = new Date()

  // Static pages
  const staticPages: MetadataRoute.Sitemap = [
    { url: baseUrl, lastModified: now, changeFrequency: "weekly", priority: 1 },
    { url: `${baseUrl}/anfrage`, lastModified: now, changeFrequency: "monthly", priority: 0.9 },
    { url: `${baseUrl}/beschwerden`, lastModified: now, changeFrequency: "monthly", priority: 0.8 },
    { url: `${baseUrl}/online-physiotherapie`, lastModified: now, changeFrequency: "monthly", priority: 0.8 },
    { url: `${baseUrl}/impressum`, lastModified: now, changeFrequency: "yearly", priority: 0.3 },
    { url: `${baseUrl}/datenschutz`, lastModified: now, changeFrequency: "yearly", priority: 0.3 },
    { url: `${baseUrl}/agb`, lastModified: now, changeFrequency: "yearly", priority: 0.3 },
  ]

  // Beschwerden pages
  const beschwerdenPages: MetadataRoute.Sitemap = BESCHWERDEN.map((b) => ({
    url: `${baseUrl}/beschwerden/${b.slug}`,
    lastModified: now,
    changeFrequency: "monthly" as const,
    priority: 0.7,
  }))

  // City pages — all DACH cities
  const stadtPages: MetadataRoute.Sitemap = STAEDTE.map((s) => ({
    url: `${baseUrl}/online-physiotherapie/${s.slug}`,
    lastModified: now,
    changeFrequency: "monthly" as const,
    priority: 0.6,
  }))

  // Shop pages (PROJ-21)
  const kurseStatic: MetadataRoute.Sitemap = [
    { url: `${baseUrl}/kurse`, lastModified: now, changeFrequency: "weekly", priority: 0.8 },
    { url: `${baseUrl}/kurse/alle`, lastModified: now, changeFrequency: "weekly", priority: 0.7 },
  ]

  // Per-Kurs-Seiten — aus den aktiven Produkten. Defensiv: Sitemap soll auch
  // ohne DB-Zugriff funktionieren.
  let kursePages: MetadataRoute.Sitemap = []
  try {
    const sc = createSupabaseServiceClient()
    const { data: products } = await sc
      .from("products")
      .select("slug")
      .eq("status", "aktiv")
    kursePages = (products ?? []).map((p) => ({
      url: `${baseUrl}/kurse/${p.slug}`,
      lastModified: now,
      changeFrequency: "weekly" as const,
      priority: 0.7,
    }))
  } catch {
    // Ohne DB-Zugriff: nur die statischen Kurs-Routen ausliefern
  }

  return [
    ...staticPages,
    ...beschwerdenPages,
    ...stadtPages,
    ...kurseStatic,
    ...kursePages,
  ]
}
