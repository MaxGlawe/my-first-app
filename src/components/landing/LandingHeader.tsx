"use client"

import Link from "next/link"
import Image from "next/image"
import { Button } from "@/components/ui/button"
import { useState, useEffect } from "react"
import { ArrowRight, Menu, X } from "lucide-react"

// Premium-Markenwelt (Masterclass-Format)
const GREEN = "#2C3E2D"
const INK = "#0f172a"
const MUTED = "#64748b"
const LINE = "#e7e1d6"
const PAPER = "#F8F5F0"

const NAV = [
  { label: "Features", href: "#features" },
  { label: "Ablauf", href: "#ablauf" },
  { label: "Vorteile", href: "#vorteile" },
  { label: "Preise", href: "#preise" },
  { label: "Shop", href: "/kurse" },
  { label: "Für Unternehmen", href: "/unternehmen" },
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
            <Link href="/anfrage">
              <Button
                size="sm"
                className="rounded-xl px-5 text-white hover:opacity-90"
                style={{ backgroundColor: GREEN }}
              >
                Jetzt starten
                <ArrowRight className="ml-1.5 h-3.5 w-3.5" />
              </Button>
            </Link>
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
            <Link href="/anfrage" onClick={() => setMenuOpen(false)}>
              <Button className="rounded-xl px-6 text-white" style={{ backgroundColor: GREEN }}>
                Jetzt starten
                <ArrowRight className="ml-2 h-4 w-4" />
              </Button>
            </Link>
          </nav>
        </div>
      )}
    </>
  )
}
