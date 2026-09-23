"use client"

import Link from "next/link"
import Image from "next/image"
import { Button } from "@/components/ui/button"
import { useState, useEffect } from "react"
import { ArrowRight, Menu, X } from "lucide-react"
import { buchungsUrl } from "@/lib/programm"

// Premium-Markenwelt (Masterclass-Format)
const GREEN = "#2C3E2D"
const INK = "#0f172a"
const MUTED = "#64748b"
const LINE = "#e7e1d6"
const PAPER = "#F8F5F0"

/**
 * PROJ-26: Menue fuehrt ausschliesslich durch das Programm.
 *
 * Shop und "Fuer Unternehmen" stehen bewusst NICHT hier. Eine Startseite, die
 * ein Angebot verkauft, sollte im Menue nicht auf drei weitere zeigen. Beide
 * bleiben ueber den Fussbereich erreichbar — abgeschaltet sind sie nicht:
 * Die Masterclass-Kampagne verlinkt laufend in den Shop, und eine Mail, die
 * auf eine Fehlerseite fuehrt, ist teurer als ein Menuepunkt weniger.
 */
const NAV: { label: string; href: string }[] = [
  { label: "Ablauf", href: "/#ablauf" },
  { label: "Preis", href: "/#preis" },
  { label: "Fragen", href: "/#faq" },
  { label: "Über mich", href: "/max-glawe" },
]

export function LandingHeader() {
  const [scrolled, setScrolled] = useState(false)
  const [menuOpen, setMenuOpen] = useState(false)

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 50)
    window.addEventListener("scroll", onScroll, { passive: true })
    return () => window.removeEventListener("scroll", onScroll)
  }, [])

  return (
    <>
      <header
        className="fixed top-0 z-50 w-full transition-all duration-300"
        style={
          scrolled
            ? {
                backgroundColor: "rgba(248,245,240,0.9)",
                backdropFilter: "blur(8px)",
                borderBottom: `1px solid ${LINE}`,
              }
            : { backgroundColor: "transparent" }
        }
      >
        <div className="container mx-auto flex h-16 items-center justify-between px-4 max-w-6xl">
          <Link href="/" className="flex items-center gap-2.5">
            <Image
              src="/images/physio-logo.png"
              alt="Physiotherapie Glawe — Logo"
              width={36}
              height={36}
              className="rounded-xl object-contain"
            />
            <div className="flex flex-col">
              <span
                className="text-[16px] leading-tight"
                style={{ fontFamily: "var(--font-serif)", fontWeight: 600, color: INK }}
              >
                Praxis OS
              </span>
              <span className="text-[10px] leading-tight" style={{ color: MUTED }}>
                by Physiotherapie Glawe
              </span>
            </div>
          </Link>

          <nav className="hidden sm:flex items-center gap-6 text-sm">
            {NAV.map((link) => (
              <a
                key={link.label}
                href={link.href}
                className="transition-opacity hover:opacity-70"
                style={{ color: INK }}
              >
                {link.label}
              </a>
            ))}
          </nav>

          <div className="hidden sm:flex items-center gap-3">
            <Link href="/login">
              <Button variant="ghost" size="sm" className="hover:bg-black/5" style={{ color: MUTED }}>
                Anmelden
              </Button>
            </Link>
            <a href={buchungsUrl("kopfzeile")} target="_blank" rel="noopener noreferrer">
              <Button
                size="sm"
                className="rounded-xl px-5 text-white hover:opacity-90"
                style={{ backgroundColor: GREEN }}
              >
                Konsultation buchen
                <ArrowRight className="ml-1.5 h-3.5 w-3.5" />
              </Button>
            </a>
          </div>

          <button
            onClick={() => setMenuOpen(!menuOpen)}
            className="sm:hidden p-2"
            style={{ color: INK }}
            aria-label="Menü"
          >
            {menuOpen ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
          </button>
        </div>
      </header>

      {menuOpen && (
        <div className="fixed inset-0 z-40 pt-16 sm:hidden" style={{ backgroundColor: PAPER }}>
          <nav className="flex flex-col px-6 py-8 gap-6">
            {NAV.map((link) => (
              <a
                key={link.label}
                href={link.href}
                onClick={() => setMenuOpen(false)}
                className="text-lg transition-opacity hover:opacity-70"
                style={{ color: INK }}
              >
                {link.label}
              </a>
            ))}
            <hr style={{ borderColor: LINE }} />
            <Link href="/login" className="text-lg" style={{ color: INK }} onClick={() => setMenuOpen(false)}>
              Anmelden
            </Link>
            <a
              href={buchungsUrl("kopfzeile-mobil")}
              target="_blank"
              rel="noopener noreferrer"
              onClick={() => setMenuOpen(false)}
            >
              <Button className="rounded-xl px-6 text-white" style={{ backgroundColor: GREEN }}>
                Konsultation buchen
                <ArrowRight className="ml-2 h-4 w-4" />
              </Button>
            </a>
          </nav>
        </div>
      )}
    </>
  )
}
