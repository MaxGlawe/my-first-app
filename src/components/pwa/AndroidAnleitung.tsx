"use client"

import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetDescription,
} from "@/components/ui/sheet"
import { MoreVertical, Plus, Smartphone } from "lucide-react"

interface AndroidAnleitungProps {
  open: boolean
  onClose: () => void
}

const steps = [
  {
    icon: MoreVertical,
    title: "Chrome-Menü öffnen",
    description:
      'Tippe oben rechts in Chrome auf die drei Punkte (⋮).',
    iconColor: "text-blue-500",
    bgColor: "bg-blue-50",
  },
  {
    icon: Plus,
    title: '"App installieren" oder "Zum Startbildschirm" wählen',
    description:
      'Scrolle im Menü und tippe auf "App installieren" oder "Zum Startbildschirm hinzufügen".',
    iconColor: "text-emerald-600",
    bgColor: "bg-emerald-50",
  },
  {
    icon: Smartphone,
    title: "Installation bestätigen",
    description:
      'Tippe auf "Installieren" — Praxis OS erscheint als App auf deinem Homescreen.',
    iconColor: "text-violet-500",
    bgColor: "bg-violet-50",
  },
]

export function AndroidAnleitung({ open, onClose }: AndroidAnleitungProps) {
  return (
    <Sheet open={open} onOpenChange={(v) => !v && onClose()}>
      <SheetContent side="bottom" className="rounded-t-3xl pb-10">
        <SheetHeader className="text-left mb-6">
          <SheetTitle className="text-lg font-bold text-slate-800">
            App auf Android installieren
          </SheetTitle>
          <SheetDescription className="text-sm text-slate-500">
            Folge diesen Schritten in Chrome:
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
            Hinweis: Verwende Google Chrome für die beste Erfahrung. Samsung Internet und andere Browser unterstützen die Installation ebenfalls.
          </p>
        </div>
      </SheetContent>
    </Sheet>
  )
}
