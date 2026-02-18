"use client"

import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetDescription,
} from "@/components/ui/sheet"
import { Share, Plus, MoreHorizontal } from "lucide-react"

interface iOsAnleitungProps {
  open: boolean
  onClose: () => void
}

const steps = [
  {
    icon: Share,
    title: 'Safari öffnen und "Teilen" tippen',
    description: 'Tippe unten in Safari auf das Teilen-Symbol (Quadrat mit Pfeil nach oben).',
    iconColor: "text-blue-500",
    bgColor: "bg-blue-50",
  },
  {
    icon: Plus,
    title: '"Zum Home-Bildschirm" wählen',
    description: 'Scrolle im Menü nach unten und tippe auf "Zum Home-Bildschirm".',
    iconColor: "text-emerald-600",
    bgColor: "bg-emerald-50",
  },
  {
    icon: MoreHorizontal,
    title: 'Mit "Hinzufügen" bestätigen',
    description: 'Tippe oben rechts auf "Hinzufügen" — Praxis OS erscheint auf deinem Homescreen.',
    iconColor: "text-violet-500",
    bgColor: "bg-violet-50",
  },
]

export function iOsAnleitung({ open, onClose }: iOsAnleitungProps) {
  return (
    <Sheet open={open} onOpenChange={(v) => !v && onClose()}>
      <SheetContent side="bottom" className="rounded-t-3xl pb-10">
        <SheetHeader className="text-left mb-6">
          <SheetTitle className="text-lg font-bold text-slate-800">
            App auf dem iPhone installieren
          </SheetTitle>
          <SheetDescription className="text-sm text-slate-500">
            iOS unterstützt automatische Installation nicht. Folge diesen Schritten in Safari:
          </SheetDescription>
        </SheetHeader>

        <div className="space-y-4">
          {steps.map((step, index) => {
            const Icon = step.icon
            return (
              <div key={index} className="flex items-start gap-4">
                <div
                  className={`flex-shrink-0 w-10 h-10 rounded-xl ${step.bgColor} flex items-center justify-center`}
                >
                  <Icon className={`h-5 w-5 ${step.iconColor}`} />
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 mb-0.5">
                    <span className="text-xs font-bold text-slate-400 uppercase tracking-wider">
                      Schritt {index + 1}
                    </span>
                  </div>
                  <p className="text-sm font-semibold text-slate-800">{step.title}</p>
                  <p className="text-xs text-slate-500 mt-0.5">{step.description}</p>
                </div>
              </div>
            )
          })}
        </div>

        <div className="mt-6 p-3 rounded-xl bg-amber-50 border border-amber-200">
          <p className="text-xs text-amber-700 font-medium">
            Hinweis: Die App muss in Safari geöffnet werden. Push-Benachrichtigungen sind ab iOS 16.4 verfügbar.
          </p>
        </div>
      </SheetContent>
    </Sheet>
  )
}
