import { MetadataRoute } from "next"

/**
 * PROJ-26: KI-Crawler ausdrücklich zugelassen.
 *
 * Wer in Antworten von ChatGPT, Claude oder Perplexity vorkommen will, muss
 * deren Crawlern das Lesen erlauben — die halten sich an robots.txt. Eine
 * Regel für `*` deckt sie zwar formal mit ab, aber mehrere Betreiber werten
 * nur die auf ihren Agenten gemünzte Regel aus. Deshalb hier ausdrücklich,
 * damit die Erlaubnis nicht von einer Auslegung abhängt.
 *
 * Gesperrt bleiben in jedem Fall die nicht-öffentlichen Bereiche: Patienten-
 * App, Therapeuten-OS, HR-Portal, API und die token-geschützten Seiten
 * (Verträge, Einladungen). Dort steht nichts, was in einen Index gehört.
 */

const GESPERRT = [
  "/app/",
  "/os/",
  "/hr/",
  "/api/",
  "/vertrag/",
  "/bgf-vertrag/",
  "/invite/",
  "/hr-invite/",
  "/bgf-invite/",
  "/meine-termine",
  "/login",
  "/403",
]

/** Crawler, die Inhalte für KI-Antworten sammeln. */
const KI_CRAWLER = [
  "GPTBot",
  "OAI-SearchBot",
  "ChatGPT-User",
  "ClaudeBot",
  "Claude-User",
  "Claude-SearchBot",
  "PerplexityBot",
  "Perplexity-User",
  "Google-Extended",
  "Applebot-Extended",
  "Bingbot",
  "meta-externalagent",
]

export default function robots(): MetadataRoute.Robots {
  return {
    rules: [
      { userAgent: "*", allow: "/", disallow: GESPERRT },
      ...KI_CRAWLER.map((userAgent) => ({ userAgent, allow: "/", disallow: GESPERRT })),
    ],
    sitemap: "https://wwwpraxis-os.com/sitemap.xml",
    host: "https://wwwpraxis-os.com",
  }
}
