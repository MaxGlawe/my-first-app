"use client"

import Link from "next/link"
import Image from "next/image"
import { Button } from "@/components/ui/button"
import { useState, useEffect } from "react"
import { ArrowRight, Menu, X } from "lucide-react"

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
        className={`fixed top-0 z-50 w-full transition-all duration-500 ${
          scrolled
            ? "bg-white/95 backdrop-blur-md shadow-sm"
            : "bg-transparent"
        }`}
      >
        <div className="container mx-auto flex h-16 items-center justify-between px-4 max-w-6xl">
          <Link href="/" className="flex items-center gap-2.5">
            <Image
              src="/images/Physio Logo_ausgeschnitten.png"
              alt="Physiotherapie Glawe — Logo"
              width={36}
              height={36}
              className="rounded-xl object-contain"
            />
            <div className="flex flex-col">
              <span className={`font-semibold text-[15px] leading-tight transition-colors duration-500 ${scrolled ? "text-slate-800" : "text-white"}`}>
                Praxis OS
              </span>
              <span className={`text-[10px] leading-tight transition-colors duration-500 ${scrolled ? "text-slate-400" : "text-slate-400"}`}>
                by Physiotherapie Glawe
              </span>
            </div>
          </Link>

          <nav className="hidden sm:flex items-center gap-6 text-sm">
            {[
              { label: "Features", href: "#features" },
              { label: "Ablauf", href: "#ablauf" },
              { label: "Vorteile", href: "#vorteile" },
              { label: "Preise", href: "#preise" },
              { label: "FAQ", href: "#faq" },
            ].map((link) => (
              <a
                key={link.label}
                href={link.href}
                className={`transition-colors duration-500 hover:opacity-80 ${
                  scrolled ? "text-slate-600" : "text-slate-300"
                }`}
              >
                {link.label}
              </a>
            ))}
          </nav>

          <div className="hidden sm:flex items-center gap-3">
            <Link href="/login">
              <Button
                variant="ghost"
                size="sm"
                className={`transition-colors duration-500 ${
                  scrolled
                    ? "text-slate-600 hover:text-slate-900"
                    : "text-slate-300 hover:text-white hover:bg-white/10"
                }`}
              >
                Anmelden
              </Button>
            </Link>
            <Link href="/anfrage">
              <Button
                size="sm"
                className="bg-gradient-to-r from-emerald-500 to-teal-500 hover:from-emerald-600 hover:to-teal-600 text-white shadow-lg shadow-emerald-500/25 rounded-full px-5"
              >
                Jetzt starten
                <ArrowRight className="ml-1.5 h-3.5 w-3.5" />
              </Button>
            </Link>
          </div>

          <button
            onClick={() => setMenuOpen(!menuOpen)}
            className={`sm:hidden p-2 transition-colors ${scrolled ? "text-slate-700" : "text-white"}`}
            aria-label="Menü"
          >
            {menuOpen ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
          </button>
        </div>
      </header>

      {menuOpen && (
        <div className="fixed inset-0 z-40 bg-slate-900 pt-16 sm:hidden">
          <nav className="flex flex-col px-6 py-8 gap-6">
            {[
              { label: "Features", href: "#features" },
              { label: "Ablauf", href: "#ablauf" },
              { label: "Vorteile", href: "#vorteile" },
              { label: "Preise", href: "#preise" },
              { label: "FAQ", href: "#faq" },
            ].map((link) => (
              <a
                key={link.label}
                href={link.href}
                onClick={() => setMenuOpen(false)}
                className="text-lg text-slate-300 hover:text-white transition-colors"
              >
                {link.label}
              </a>
            ))}
            <hr className="border-slate-700" />
            <Link href="/login" className="text-lg text-slate-300 hover:text-white">
              Anmelden
            </Link>
            <Link href="/anfrage" className="inline-block">
              <Button className="bg-gradient-to-r from-emerald-500 to-teal-500 text-white rounded-full px-6">
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
