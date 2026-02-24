"use client"

import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { CollapsibleSection } from "@/components/clinical-ui"
import { FileText } from "lucide-react"
import type { SoapVerlauf } from "@/types/behandlung"

interface SoapVerlaufSectionProps {
  soap: SoapVerlauf
  onChange: (soap: SoapVerlauf) => void
  disabled?: boolean
}

export function SoapVerlaufSection({ soap, onChange, disabled }: SoapVerlaufSectionProps) {
  const update = (field: keyof SoapVerlauf, value: string) => {
    onChange({ ...soap, [field]: value })
  }

  const hasContent = soap.subjektiv || soap.objektiv || soap.assessment || soap.plan

  return (
    <CollapsibleSection
      title="SOAP-Verlaufsdokumentation"
      description="Strukturierte Verlaufsnotiz nach SOAP-Schema"
      icon={FileText}
      accent="emerald"
      defaultOpen={!!hasContent}
      badge={hasContent ? "ausgefüllt" : undefined}
    >
      <div className="space-y-4">
        <div className="space-y-2">
          <Label className="text-sm font-semibold">
            <span className="inline-flex items-center justify-center w-5 h-5 rounded bg-emerald-100 text-emerald-700 text-xs font-bold mr-2">S</span>
            Subjektiv
          </Label>
          <Textarea
            rows={2}
            placeholder="Was berichtet der Patient? (Schmerzempfinden, subjektive Veränderungen, Einschränkungen im Alltag...)"
            value={soap.subjektiv}
            onChange={(e) => update("subjektiv", e.target.value)}
            disabled={disabled}
          />
        </div>

        <div className="space-y-2">
          <Label className="text-sm font-semibold">
            <span className="inline-flex items-center justify-center w-5 h-5 rounded bg-blue-100 text-blue-700 text-xs font-bold mr-2">O</span>
            Objektiv
          </Label>
          <Textarea
            rows={2}
            placeholder="Was beobachtet der Therapeut? (Bewegungsausmaß, Tonus, Palpation, Funktionsprüfung...)"
            value={soap.objektiv}
            onChange={(e) => update("objektiv", e.target.value)}
            disabled={disabled}
          />
        </div>

        <div className="space-y-2">
          <Label className="text-sm font-semibold">
            <span className="inline-flex items-center justify-center w-5 h-5 rounded bg-amber-100 text-amber-700 text-xs font-bold mr-2">A</span>
            Assessment
          </Label>
          <Textarea
            rows={2}
            placeholder="Klinische Beurteilung: Therapiefortschritt, Zusammenhang S+O, Hypothesenprüfung..."
            value={soap.assessment}
            onChange={(e) => update("assessment", e.target.value)}
            disabled={disabled}
          />
        </div>

        <div className="space-y-2">
          <Label className="text-sm font-semibold">
            <span className="inline-flex items-center justify-center w-5 h-5 rounded bg-purple-100 text-purple-700 text-xs font-bold mr-2">P</span>
            Plan
          </Label>
          <Textarea
            rows={2}
            placeholder="Weiteres Vorgehen: Anpassung der Therapie, Hausaufgaben, Kontrolltermine..."
            value={soap.plan}
            onChange={(e) => update("plan", e.target.value)}
            disabled={disabled}
          />
        </div>
      </div>
    </CollapsibleSection>
  )
}
