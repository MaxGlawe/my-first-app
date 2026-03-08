import { MetadataRoute } from "next"

export default function robots(): MetadataRoute.Robots {
  return {
    rules: [
      {
        userAgent: "*",
        allow: "/",
        disallow: ["/app/", "/os/", "/api/", "/vertrag/"],
      },
    ],
    sitemap: "https://wwwpraxis-os.com/sitemap.xml",
  }
}
