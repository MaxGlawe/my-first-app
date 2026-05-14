"use client"

/**
 * PROJ-20: KurseMenu — das "Kurse"-Mega-Menü in der Shop-Taskleiste.
 *
 * Sitzt zwischen "Shop" und dem Suchfeld. Öffnet bei Hover (Desktop) und Klick
 * (Touch / In-App), klappt nach unten auf und zeigt die Kurse nach Rubrik
 * gruppiert. Klick auf einen Kurs → seine eigene Seite (/shop/[slug]).
 * "Alle Kurse ansehen" → /shop/kurse.
 */

import { useRef, useState, useEffect } from "react"
import Link from "next/link"
import { ChevronDown, ArrowRight, Loader2 } from "lucide-react"
import { cn } from "@/lib/utils"
import type { ShopProduct } from "@/components/shop/ProductCard"

// Rubriken — Grundlage für Gruppierung & Filter (auch von /shop/kurse genutzt)
export const ANLIEGEN_LIST = [
  { value: null, label: "Alle Kurse", icon: "✦" },
  { value: "ruecken", label: "Rücken", icon: "🦴" },
  { value: "schmerz", label: "Schmerz", icon: "💆" },
  { value: "faszien", label: "Faszien", icon: "🔬" },
  { value: "stress", label: "Stress", icon: "🧘" },
  { value: "beweglichkeit", label: "Beweglichkeit", icon: "🤸" },
  { value: "hydration", label: "Hydration", icon: "💧" },
  { value: "wohlbefinden", label: "Wohlbefinden", icon: "🌿" },
] as const

const RUBRICS = ANLIEGEN_LIST.filter((r) => r.value !== null)

const SLUG_GRADIENTS: Record<string, string> = {
  "hydrations-boost": "from-cyan-400 to-teal-500",
  "ruecken-mobility": "from-emerald-400 to-cyan-500",
  "schmerz-tagebuch-routine": "from-rose-400 to-rose-500",
  "faszien-tiefenarbeit": "from-indigo-400 to-purple-500",
}

function gradientFor(slug: string): string {
  return SLUG_GRADIENTS[slug] ?? "from-slate-400 to-slate-500"
}

export function KurseMenu({ mode = "app" }: { mode?: "app" | "website" }) {
  const isWebsite = mode === "website"
  const [open, setOpen] = useState(false)
  const [products, setProducts] = useState<ShopProduct[]>([])
  const [loading, setLoading] = useState(true)
  const containerRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    fetch("/api/shop/products")
      .then((res) => (res.ok ? res.json() : { products: [] }))
      .then((json: { products?: ShopProduct[] }) => setProducts(json.products ?? []))
      .catch(() => setProducts([]))
      .finally(() => setLoading(false))
  }, [])

  // Außerhalb klicken schließt (für Touch / In-App)
  useEffect(() => {
    if (!open) return
    const handler = (e: PointerEvent) => {
      if (containerRef.current && !containerRef.current.contains(e.target as Node)) {
        setOpen(false)
      }
    }
    document.addEventListener("pointerdown", handler)
    return () => document.removeEventListener("pointerdown", handler)
  }, [open])

  // Gruppierung — jedes Produkt unter seiner ersten passenden Rubrik (keine Dopplungen)
  const grouped = new Map<string, ShopProduct[]>()
  for (const product of products) {
    const rubric = RUBRICS.find((r) => product.anliegen?.includes(r.value as string))
    const key = (rubric?.value as string) ?? "weitere"
    const list = grouped.get(key) ?? []
    list.push(product)
    grouped.set(key, list)
  }
  const visibleRubrics = RUBRICS.filter((r) => grouped.has(r.value as string))
  const weitere = grouped.get("weitere")

  return (
    <div
      ref={containerRef}
      className="relative"
      onMouseEnter={() => setOpen(true)}
      onMouseLeave={() => setOpen(false)}
    >
      <button
        type="button"
        onClick={() => setOpen((o) => !o)}
        aria-expanded={open}
        aria-haspopup="menu"
        className="flex items-center gap-1.5 px-3 py-2 rounded-lg text-sm font-medium text-slate-600 hover:bg-slate-100 hover:text-slate-900 transition-colors"
      >
        <span>Kurse</span>
        <ChevronDown
          className={cn("h-4 w-4 transition-transform duration-200", open && "rotate-180")}
        />
      </button>

      {/* Mega-Panel — bleibt montiert für sauberen Ein-/Ausgang */}
      <div
        className={cn(
          "absolute left-0 top-full pt-2 w-[560px] max-w-[92vw] origin-top transition-all duration-150",
          open
            ? "opacity-100 scale-100 pointer-events-auto"
            : "opacity-0 scale-95 pointer-events-none"
        )}
      >
        <div className="bg-white rounded-2xl border border-slate-200 shadow-xl shadow-slate-900/10 overflow-hidden">
          <div className="p-4">
            <p className="px-1 pb-3 text-[10px] font-bold tracking-[0.15em] text-slate-400 uppercase">
              Kurse nach Rubrik
            </p>

            {loading ? (
              <div className="flex items-center justify-center py-10 text-slate-300">
                <Loader2 className="h-5 w-5 animate-spin" />
              </div>
            ) : products.length === 0 ? (
              <p className="px-1 py-8 text-sm text-slate-400 text-center">
                Kurse sind bald verfügbar.
              </p>
            ) : (
              <div className="grid grid-cols-2 gap-x-5 gap-y-4">
                {visibleRubrics.map((rubric) => (
                  <RubricColumn
                    key={rubric.value}
                    icon={rubric.icon}
                    label={rubric.label}
                    products={grouped.get(rubric.value as string)!}
                    onNavigate={() => setOpen(false)}
                    mode={mode}
                  />
                ))}
                {weitere && (
                  <RubricColumn
                    icon="✦"
                    label="Weitere"
                    products={weitere}
                    onNavigate={() => setOpen(false)}
                    mode={mode}
                  />
                )}
              </div>
            )}
          </div>

          {/* Footer */}
          <Link
            href={isWebsite ? "/kurse/alle" : "/shop/kurse"}
            onClick={() => setOpen(false)}
            className="flex items-center justify-between px-4 py-3 bg-slate-50 border-t border-slate-100 text-sm font-semibold text-emerald-700 hover:bg-emerald-50 transition-colors"
          >
            <span>Alle Kurse ansehen</span>
            <ArrowRight className="h-4 w-4" />
          </Link>
        </div>
      </div>
    </div>
  )
}

// ── Rubrik-Spalte ─────────────────────────────────────────────────────────────

interface RubricColumnProps {
  icon: string
  label: string
  products: ShopProduct[]
  onNavigate: () => void
  mode: "app" | "website"
}

function RubricColumn({ icon, label, products, onNavigate, mode }: RubricColumnProps) {
  return (
    <div>
      <div className="flex items-center gap-1.5 px-1 mb-1.5">
        <span className="text-sm leading-none">{icon}</span>
        <span className="text-xs font-bold text-slate-700 uppercase tracking-wide">
          {label}
        </span>
      </div>
      <div className="space-y-0.5">
        {products.map((product) => (
          <CourseRow
            key={product.id}
            product={product}
            onNavigate={onNavigate}
            mode={mode}
          />
        ))}
      </div>
    </div>
  )
}

// ── Kurs-Zeile ────────────────────────────────────────────────────────────────

function CourseRow({
  product,
  onNavigate,
  mode,
}: {
  product: ShopProduct
  onNavigate: () => void
  mode: "app" | "website"
}) {
  const owned = product.besitz || product.abo_access
  const price = product.effektiver_preis ?? product.preis

  return (
    <Link
      href={mode === "website" ? `/kurse/${product.slug}` : `/shop/${product.slug}`}
      onClick={onNavigate}
      className="flex items-center gap-2.5 px-1.5 py-1.5 rounded-xl hover:bg-slate-50 transition-colors group"
    >
      <div
        className={cn(
          "h-9 w-9 rounded-lg bg-gradient-to-br shrink-0 flex items-center justify-center",
          gradientFor(product.slug)
        )}
      >
        <span className="text-white text-sm font-semibold select-none">
          {product.titel.charAt(0)}
        </span>
      </div>
      <div className="min-w-0 flex-1">
        <p className="text-sm font-medium text-slate-800 truncate group-hover:text-emerald-700 transition-colors">
          {product.titel}
        </p>
        <p className="text-xs text-slate-400">
          {owned
            ? "Freigeschaltet"
            : `${price.toLocaleString("de-DE", { minimumFractionDigits: 0 })} €`}
        </p>
      </div>
    </Link>
  )
}
