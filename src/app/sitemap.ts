import { MetadataRoute } from "next"

export default function sitemap(): MetadataRoute.Sitemap {
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
  const beschwerden = [
    "rueckenschmerzen", "knieschmerzen", "schulterschmerzen", "nackenschmerzen",
    "hueftschmerzen", "bandscheibenvorfall", "arthrose", "post-op-reha",
    "tennisarm", "ischias", "kopfschmerzen-migraene", "fersensporn",
  ]
  const beschwerdenPages: MetadataRoute.Sitemap = beschwerden.map((slug) => ({
    url: `${baseUrl}/beschwerden/${slug}`,
    lastModified: now,
    changeFrequency: "monthly" as const,
    priority: 0.7,
  }))

  // City pages (dynamically imported would be ideal, but we list them for the sitemap)
  const staedte = [
    "berlin", "hamburg", "muenchen", "koeln", "frankfurt-am-main", "stuttgart",
    "duesseldorf", "leipzig", "dortmund", "essen", "bremen", "dresden", "hannover",
    "nuernberg", "duisburg", "bochum", "wuppertal", "bielefeld", "bonn", "muenster",
    "augsburg", "karlsruhe", "mannheim", "wiesbaden", "gelsenkirchen",
    "moenchengladbach", "braunschweig", "aachen", "kiel", "chemnitz", "halle",
    "magdeburg", "freiburg", "krefeld", "mainz", "luebeck", "erfurt", "oberhausen",
    "rostock", "kassel", "hagen", "potsdam", "saarbruecken", "hamm", "ludwigshafen",
    "oldenburg", "muelheim-an-der-ruhr", "osnabrueck", "leverkusen", "heidelberg",
    "solingen", "darmstadt", "paderborn", "regensburg", "ingolstadt", "wuerzburg",
    "wolfsburg", "goettingen", "offenbach", "ulm", "heilbronn", "pforzheim",
    "reutlingen", "bottrop", "trier", "bremerhaven", "recklinghausen", "remscheid",
    "bergisch-gladbach", "jena", "erlangen", "moers", "siegen", "hildesheim",
    "salzgitter", "cottbus", "kaiserslautern", "guetersloh", "schwerin", "witten",
    "hanau",
  ]
  const stadtPages: MetadataRoute.Sitemap = staedte.map((slug) => ({
    url: `${baseUrl}/online-physiotherapie/${slug}`,
    lastModified: now,
    changeFrequency: "monthly" as const,
    priority: 0.6,
  }))

  return [...staticPages, ...beschwerdenPages, ...stadtPages]
}
