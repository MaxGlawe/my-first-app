import Link from "next/link"
import Image from "next/image"

// Premium-Markenwelt (Masterclass-Format)
const PAPER = "#F8F5F0"
const INK = "#0f172a"
const BODY = "#334155"
const MUTED = "#64748b"
const GREEN = "#2C3E2D"
const LINE = "#e7e1d6"

export function LandingFooter() {
  return (
    <footer className="border-t" style={{ backgroundColor: PAPER, borderColor: LINE }}>
      <div className="container mx-auto px-4 py-12 sm:py-16 max-w-6xl">
        <div className="grid gap-10 sm:grid-cols-2 lg:grid-cols-5">
          {/* Brand */}
          <div className="lg:col-span-2">
            <div className="flex items-center gap-2.5 mb-4">
              <Image
                src="/images/physio-logo.png"
                alt="Physiotherapie Glawe — Logo"
                width={36}
                height={36}
                className="rounded-xl object-contain"
              />
              <div className="flex flex-col">
                <span className="font-semibold text-[15px] leading-tight" style={{ color: INK }}>
                  Praxis OS
                </span>
                <span className="text-[10px] leading-tight" style={{ color: MUTED }}>
                  by Physiotherapie Glawe
                </span>
              </div>
            </div>
            <p className="text-sm leading-relaxed max-w-sm" style={{ color: BODY }}>
              Professionelle Online-Physiotherapie. Heilpraktiker-Behandlung per
              Video, individuelle Trainingspläne und persönliche Betreuung —
              alles in einer App.
            </p>
          </div>

          {/* Produkt */}
          <div>
            <h3 className="text-xs font-semibold uppercase tracking-wider mb-4" style={{ color: INK }}>
              Produkt
            </h3>
            <ul className="space-y-2.5">
              {[
                { label: "Features", href: "#features" },
                { label: "Ablauf", href: "#ablauf" },
                { label: "Vorteile", href: "#vorteile" },
                { label: "Preise", href: "#preise" },
                { label: "Shop", href: "/kurse" },
                { label: "FAQ", href: "#faq" },
                { label: "Anfrage stellen", href: "/anfrage" },
              ].map((l) => (
                <li key={l.label}>
                  <Link
                    href={l.href}
                    className="text-sm transition-colors hover:opacity-80"
                    style={{ color: MUTED }}
                  >
                    {l.label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* Behandlung */}
          <div>
            <h3 className="text-xs font-semibold uppercase tracking-wider mb-4" style={{ color: INK }}>
              Behandlung
            </h3>
            <ul className="space-y-2.5">
              {[
                { label: "Alle Beschwerden", href: "/beschwerden" },
                { label: "Rückenschmerzen", href: "/beschwerden/rueckenschmerzen" },
                { label: "Knieschmerzen", href: "/beschwerden/knieschmerzen" },
                { label: "Schulterschmerzen", href: "/beschwerden/schulterschmerzen" },
                { label: "Physiotherapie in deiner Stadt", href: "/online-physiotherapie" },
              ].map((l) => (
                <li key={l.label}>
                  <Link
                    href={l.href}
                    className="text-sm transition-colors hover:opacity-80"
                    style={{ color: MUTED }}
                  >
                    {l.label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* Rechtliches */}
          <div>
            <h3 className="text-xs font-semibold uppercase tracking-wider mb-4" style={{ color: INK }}>
              Rechtliches
            </h3>
            <ul className="space-y-2.5">
              {[
                { label: "Impressum", href: "/impressum" },
                { label: "Datenschutz", href: "/datenschutz" },
                { label: "AGB", href: "/agb" },
              ].map((l) => (
                <li key={l.label}>
                  <Link
                    href={l.href}
                    className="text-sm transition-colors hover:opacity-80"
                    style={{ color: MUTED }}
                  >
                    {l.label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>
        </div>

        {/* Bottom */}
        <div
          className="mt-12 pt-6 border-t flex flex-col sm:flex-row items-center justify-between gap-3"
          style={{ borderColor: LINE }}
        >
          <div className="text-center sm:text-left">
            <p className="text-xs font-medium" style={{ color: BODY }}>
              Praxis OS — ein Produkt der Physiotherapie Glawe.
            </p>
            <p className="text-xs mt-1" style={{ color: MUTED }}>
              &copy; {new Date().getFullYear()} Physiotherapie Glawe. Alle Rechte
              vorbehalten.
            </p>
          </div>
          <div className="flex items-center gap-1.5">
            <div className="h-2 w-2 rounded-full animate-dot-pulse" style={{ backgroundColor: GREEN }} />
            <span className="text-xs" style={{ color: MUTED }}>
              Alle Systeme verfügbar
            </span>
          </div>
        </div>
      </div>
    </footer>
  )
}
