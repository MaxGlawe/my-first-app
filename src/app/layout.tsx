import type { Metadata, Viewport } from "next"
import { Inter, Space_Grotesk, Source_Serif_4 } from "next/font/google"
import "./globals.css"
import { Suspense } from "react"
import { ConsentBanner } from "@/components/analytics/ConsentBanner"
import { HerkunftMerken } from "@/components/analytics/HerkunftMerken"
import { CONSENT_MODE_DEFAULT_SNIPPET } from "@/lib/consent"

const inter = Inter({
  subsets: ["latin"],
  display: "swap",
  variable: "--font-inter",
})

// `preload: false` ist Absicht und gemessen.
//
// `--font-display` wird nur auf /kurse und den Masterclass-Seiten benutzt —
// sechs Dateien. Weil die Schrift aber hier im Wurzel-Layout steht, hat
// Next.js sie auf JEDER Seite vorab geladen: 50 KB mit hoher Prioritaet,
// die dem render-blockierenden Stylesheet die Bandbreite wegnehmen. Auf den
// Anzeigen-Seiten kostete das rund 200 ms bis zum ersten Bild, bei einer
// Schrift, die dort kein einziges Zeichen setzt.
//
// Ohne Vorabladen findet der Browser sie weiterhin ueber das Stylesheet —
// auf /kurse und der Masterclass also eine Rundreise spaeter. Dort greift
// `display: swap`, es gibt also ohnehin einen Wechsel; er kommt nur spaeter.
const spaceGrotesk = Space_Grotesk({
  subsets: ["latin"],
  display: "swap",
  variable: "--font-display",
  weight: ["400", "500", "600", "700"],
  preload: false,
})

// Editorial-Serif (Masterclass-Welt) — global verfügbar als var(--font-serif).
// Additiv: ändert NICHT --font-display (App/OS bleiben auf Space Grotesk).
const sourceSerif = Source_Serif_4({
  subsets: ["latin"],
  display: "swap",
  variable: "--font-serif",
  weight: ["400", "600", "700"],
})

export const metadata: Metadata = {
  metadataBase: new URL("https://wwwpraxis-os.com"),
  title: {
    default: "Online Physiotherapie | Praxis OS — Physiotherapie Glawe",
    template: "%s | Praxis OS",
  },
  description:
    "Professionelle Physiotherapie online. Heilpraktiker-Behandlung per Video, individuelle Trainingspläne und persönliche Betreuung per App — deutschlandweit.",
  manifest: "/manifest.json",
  appleWebApp: {
    capable: true,
    statusBarStyle: "default",
    title: "Praxis OS",
  },
  formatDetection: {
    telephone: false,
  },
  openGraph: {
    type: "website",
    locale: "de_DE",
    siteName: "Praxis OS — Physiotherapie Glawe",
    images: [
      {
        url: "/opengraph-image",
        width: 1200,
        height: 630,
        alt: "Praxis OS — Online Physiotherapie",
      },
    ],
  },
  twitter: {
    card: "summary_large_image",
    images: ["/opengraph-image"],
  },
  alternates: {
    canonical: "/",
  },
}

export const viewport: Viewport = {
  themeColor: "#10b981",
  width: "device-width",
  initialScale: 1,
  // maximumScale/userScalable bewusst NICHT gesetzt: beides verhindert das
  // Zoomen auf Mobilgeraeten und sperrt Menschen mit Sehschwaeche aus
  // (WCAG 1.4.4). Auf einer Gesundheitsseite ist das besonders unpassend.
}

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode
}>) {
  return (
    <html lang="de" className={`${inter.variable} ${spaceGrotesk.variable} ${sourceSerif.variable}`}>
      <head>
        <link rel="preconnect" href="https://duacypqeyfymdqostguw.supabase.co" />
        <link rel="dns-prefetch" href="https://duacypqeyfymdqostguw.supabase.co" />
        <link rel="apple-touch-icon" href="/icons/apple-touch-icon.png" />
        <link rel="icon" type="image/png" sizes="192x192" href="/icons/icon-192.png" />
        <link rel="icon" type="image/png" sizes="512x512" href="/icons/icon-512.png" />
        {/*
          Google Consent Mode v2 — Vorab-Standard.

          Muss VOR jedem anderen Tag im Dokument stehen, sonst misst der erste
          Tag genau einmal zu frueh. Steht deshalb hier im <head> und nicht in
          einer Komponente: Next.js wuerde eine `afterInteractive`-Komponente
          spaeter einhaengen, und „spaeter" ist hier zu spaet.

          Alles auf `denied`. Google Ads kommt erst noch; wenn es kommt,
          findet es die Signale vor und braucht keine Aenderung mehr.
        */}
        <script dangerouslySetInnerHTML={{ __html: CONSENT_MODE_DEFAULT_SNIPPET }} />
      </head>
      <body className={`${inter.className} antialiased`}>
        {children}
        {/* Auf allen oeffentlichen Seiten. Blendet sich in den angemeldeten
            Bereichen selbst aus — dort laufen nur notwendige Cookies. */}
        <ConsentBanner />
        {/* `useSearchParams` verlangt eine Suspense-Grenze, sonst wuerde die
            ganze Seite dynamisch gerendert und verloere ihre statische
            Auslieferung. */}
        <Suspense fallback={null}>
          <HerkunftMerken />
        </Suspense>
        <script
          dangerouslySetInnerHTML={{
            __html: `
              if ('serviceWorker' in navigator) {
                window.addEventListener('load', function() {
                  navigator.serviceWorker.register('/sw.js')
                    .catch(function(err) { console.warn('SW registration failed:', err); });
                });
              }
            `,
          }}
        />
      </body>
    </html>
  )
}
