/**
 * PROJ-19: /shop/* Layout
 * Minimal layout for the external buyer area.
 * No sidebar, no clinical navigation — intentionally stripped down.
 */

export default function ShopLayout({ children }: { children: React.ReactNode }) {
  return <div className="min-h-screen bg-slate-50">{children}</div>
}
