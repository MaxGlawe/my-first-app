import Link from "next/link"
import Image from "next/image"

export function LandingFooter() {
  return (
    <footer className="bg-slate-900 border-t border-slate-800">
      <div className="container mx-auto px-4 py-12 sm:py-16 max-w-6xl">
        <div className="grid gap-10 sm:grid-cols-2 lg:grid-cols-5">
          {/* Brand */}
          <div className="lg:col-span-2">
            <div className="flex items-center gap-2.5 mb-4">
              <Image
                src="/images/Physio Logo_ausgeschnitten.png"
                alt="Physiotherapie Glawe — Logo"
                width={36}
                height={36}
                className="rounded-xl object-contain"
              />
              <div className="flex flex-col">
                <span className="font-semibold text-[15px] leading-tight text-white">
                  Praxis OS
                </span>
                <span className="text-[10px] text-slate-500 leading-tight">
                  by Physiotherapie Glawe
                </span>
              </div>
            </div>
            <p className="text-sm text-slate-400 leading-relaxed max-w-sm">
              Professionelle Online-Physiotherapie. Heilpraktiker-Behandlung per
              Video, individuelle Trainingspläne und persönliche Betreuung —
              alles in einer App.
            </p>
          </div>

          {/* Produkt */}
          <div>
            <h3 className="text-xs font-semibold text-slate-300 uppercase tracking-wider mb-4">
              Produkt
            </h3>
            <ul className="space-y-2.5">
              {[
                { label: "Features", href: "#features" },
                { label: "Ablauf", href: "#ablauf" },
                { label: "Vorteile", href: "#vorteile" },
                { label: "Preise", href: "#preise" },
                { label: "FAQ", href: "#faq" },
                { label: "Anfrage stellen", href: "/anfrage" },
              ].map((l) => (
                <li key={l.label}>
                  <Link
                    href={l.href}
                    className="text-sm text-slate-500 hover:text-white transition-colors"
                  >
                    {l.label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* Behandlung */}
          <div>
            <h3 className="text-xs font-semibold text-slate-300 uppercase tracking-wider mb-4">
              Behandlung
            </h3>
            <ul className="space-y-2.5">
              {[
                { label: "Alle Beschwerden", href: "/beschwerden" },
                { label: "Rückenschmerzen", href: "/beschwerden/rueckenschmerzen" },
                { label: "Knieschmerzen", href: "/beschwerden/knieschmerzen" },
                { label: "Schulterschmerzen", href: "/beschwerden/schulterschmerzen" },
                { label: "Physiotherapie in Ihrer Stadt", href: "/online-physiotherapie" },
              ].map((l) => (
                <li key={l.label}>
                  <Link
                    href={l.href}
                    className="text-sm text-slate-500 hover:text-white transition-colors"
                  >
                    {l.label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* Rechtliches */}
          <div>
            <h3 className="text-xs font-semibold text-slate-300 uppercase tracking-wider mb-4">
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
                    className="text-sm text-slate-500 hover:text-white transition-colors"
                  >
                    {l.label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>
        </div>

        {/* Bottom */}
        <div className="mt-12 pt-6 border-t border-slate-800 flex flex-col sm:flex-row items-center justify-between gap-3">
          <p className="text-xs text-slate-500">
            &copy; {new Date().getFullYear()} Physiotherapie Glawe. Alle Rechte
            vorbehalten.
          </p>
          <div className="flex items-center gap-1.5">
            <div className="h-2 w-2 rounded-full bg-emerald-400 animate-dot-pulse" />
            <span className="text-xs text-slate-500">
              Alle Systeme verfügbar
            </span>
          </div>
        </div>
      </div>
    </footer>
  )
}
