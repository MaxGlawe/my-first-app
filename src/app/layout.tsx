import type { Metadata, Viewport } from "next"
import { Inter } from "next/font/google"
import "./globals.css"

const inter = Inter({
  subsets: ["latin"],
  display: "swap",
  variable: "--font-inter",
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
  maximumScale: 1,
  userScalable: false,
}

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode
}>) {
  return (
    <html lang="de" className={inter.variable}>
      <head>
        <link rel="preconnect" href="https://duacypqeyfymdqostguw.supabase.co" />
        <link rel="dns-prefetch" href="https://duacypqeyfymdqostguw.supabase.co" />
        <link rel="apple-touch-icon" href="/icons/apple-touch-icon.png" />
        <link rel="icon" type="image/png" sizes="192x192" href="/icons/icon-192.png" />
        <link rel="icon" type="image/png" sizes="512x512" href="/icons/icon-512.png" />
      </head>
      <body className={`${inter.className} antialiased`}>
        {children}
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
