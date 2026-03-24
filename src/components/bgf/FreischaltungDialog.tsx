"use client"

import { useState } from "react"
import { UserPlus, CheckCircle2, Copy, ExternalLink } from "lucide-react"
import { Button } from "@/components/ui/button"
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from "@/components/ui/dialog"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import type { ArbeitsplatzTyp } from "@/types/bgf"

const arbeitsplatzOptions: { value: ArbeitsplatzTyp; label: string }[] = [
  { value: "buero", label: "Büro" },
  { value: "homeoffice", label: "Homeoffice" },
  { value: "lager", label: "Lager" },
  { value: "produktion", label: "Produktion" },
  { value: "handwerk", label: "Handwerk" },
  { value: "pflege", label: "Pflege" },
  { value: "mischform", label: "Mischform" },
]

interface FreischaltungDialogProps {
  orgId: string
  abteilungen?: string[]
  onSuccess: () => void
}

export function FreischaltungDialog({ orgId, abteilungen = [], onSuccess }: FreischaltungDialogProps) {
  const [open, setOpen] = useState(false)
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [result, setResult] = useState<{ email: string; invite_link?: string } | null>(null)
  const [copied, setCopied] = useState(false)

  const [email, setEmail] = useState("")
  const [vorname, setVorname] = useState("")
  const [nachname, setNachname] = useState("")
  const [abteilung, setAbteilung] = useState("")
  const [arbeitsplatzTyp, setArbeitsplatzTyp] = useState<ArbeitsplatzTyp>("buero")

  function reset() {
    setEmail("")
    setVorname("")
    setNachname("")
    setAbteilung("")
    setArbeitsplatzTyp("buero")
    setError(null)
    setResult(null)
    setCopied(false)
  }

  function handleClose() {
    reset()
    setOpen(false)
    if (result) onSuccess()
  }

  async function handleCopy() {
    if (result?.invite_link) {
      await navigator.clipboard.writeText(result.invite_link)
      setCopied(true)
      setTimeout(() => setCopied(false), 2000)
    }
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    if (!email.trim()) return

    setIsSubmitting(true)
    setError(null)

    try {
      const res = await fetch(`/api/bgf/organizations/${orgId}/members`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          email: email.trim(),
          vorname: vorname.trim() || undefined,
          nachname: nachname.trim() || undefined,
          abteilung: abteilung.trim() || undefined,
          arbeitsplatz_typ: arbeitsplatzTyp,
        }),
      })

      const body = await res.json().catch(() => ({}))

      if (!res.ok) {
        setError(body.error ?? "Freischaltung fehlgeschlagen.")
        return
      }

      setResult({
        email: email.trim(),
        invite_link: body.invite_link,
      })
    } catch {
      setError("Netzwerkfehler. Bitte erneut versuchen.")
    } finally {
      setIsSubmitting(false)
    }
  }

  return (
    <>
      <Button onClick={() => setOpen(true)} size="sm" className="gap-2 bg-emerald-600 hover:bg-emerald-700">
        <UserPlus className="h-4 w-4" />
        Mitarbeiter freischalten
      </Button>

      <Dialog open={open} onOpenChange={(v) => { if (!v) handleClose(); else setOpen(true) }}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>Mitarbeiter freischalten</DialogTitle>
            <DialogDescription>
              Der Mitarbeiter erhält eine Einladungs-E-Mail zur Registrierung.
            </DialogDescription>
          </DialogHeader>

          {result ? (
            /* ── Success State ── */
            <div className="space-y-4 py-2">
              <div className="flex items-start gap-3 bg-emerald-50 rounded-xl p-4 border border-emerald-200">
                <CheckCircle2 className="h-5 w-5 text-emerald-500 mt-0.5 flex-shrink-0" />
                <div>
                  <p className="text-sm font-medium text-emerald-700">
                    {result.email} wurde freigeschaltet!
                  </p>
                  <p className="text-xs text-emerald-600 mt-1">
                    Eine Einladungs-E-Mail wurde versendet.
                  </p>
                </div>
              </div>

              {result.invite_link && (
                <div>
                  <Label className="text-xs text-slate-500">
                    Registrierungs-Link (falls E-Mail nicht ankommt)
                  </Label>
                  <div className="flex items-center gap-2 mt-1">
                    <Input
                      value={result.invite_link}
                      readOnly
                      className="text-xs font-mono"
                    />
                    <Button
                      size="icon"
                      variant="outline"
                      onClick={handleCopy}
                      title="Link kopieren"
                      className="flex-shrink-0"
                    >
                      {copied ? <CheckCircle2 className="h-4 w-4 text-emerald-500" /> : <Copy className="h-4 w-4" />}
                    </Button>
                    <Button
                      size="icon"
                      variant="outline"
                      onClick={() => window.open(result.invite_link, "_blank")}
                      title="Link öffnen"
                      className="flex-shrink-0"
                    >
                      <ExternalLink className="h-4 w-4" />
                    </Button>
                  </div>
                </div>
              )}

              <div className="flex justify-end gap-3 pt-2">
                <Button variant="outline" onClick={() => { setResult(null); setEmail(""); setVorname(""); setNachname("") }}>
                  Weiteren einladen
                </Button>
                <Button onClick={handleClose} className="bg-emerald-600 hover:bg-emerald-700">
                  Fertig
                </Button>
              </div>
            </div>
          ) : (
            /* ── Form State ── */
            <form onSubmit={handleSubmit} className="space-y-4 mt-2">
              <div className="space-y-1.5">
                <Label htmlFor="email">E-Mail-Adresse *</Label>
                <Input
                  id="email"
                  type="email"
                  placeholder="max.mustermann@firma.de"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  required
                  autoFocus
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div className="space-y-1.5">
                  <Label htmlFor="vorname">Vorname</Label>
                  <Input
                    id="vorname"
                    placeholder="Max"
                    value={vorname}
                    onChange={(e) => setVorname(e.target.value)}
                  />
                </div>
                <div className="space-y-1.5">
                  <Label htmlFor="nachname">Nachname</Label>
                  <Input
                    id="nachname"
                    placeholder="Mustermann"
                    value={nachname}
                    onChange={(e) => setNachname(e.target.value)}
                  />
                </div>
              </div>

              <div className="space-y-1.5">
                <Label htmlFor="abteilung">Abteilung</Label>
                {abteilungen.length > 0 ? (
                  <Select value={abteilung} onValueChange={setAbteilung}>
                    <SelectTrigger id="abteilung">
                      <SelectValue placeholder="Abteilung wählen…" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="">Keine Angabe</SelectItem>
                      {abteilungen.map((a) => (
                        <SelectItem key={a} value={a}>{a}</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                ) : (
                  <Input
                    id="abteilung"
                    placeholder="z.B. Vertrieb"
                    value={abteilung}
                    onChange={(e) => setAbteilung(e.target.value)}
                  />
                )}
              </div>

              <div className="space-y-1.5">
                <Label>Arbeitsplatz-Typ</Label>
                <Select value={arbeitsplatzTyp} onValueChange={(v) => setArbeitsplatzTyp(v as ArbeitsplatzTyp)}>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {arbeitsplatzOptions.map((opt) => (
                      <SelectItem key={opt.value} value={opt.value}>{opt.label}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              {error && (
                <p className="text-sm text-red-600 bg-red-50 rounded-lg px-3 py-2">{error}</p>
              )}

              <div className="flex justify-end gap-3 pt-1">
                <Button
                  type="button"
                  variant="outline"
                  onClick={handleClose}
                  disabled={isSubmitting}
                >
                  Abbrechen
                </Button>
                <Button type="submit" disabled={isSubmitting || !email.trim()} className="bg-emerald-600 hover:bg-emerald-700">
                  {isSubmitting ? "Wird freigeschaltet…" : "Freischalten"}
                </Button>
              </div>
            </form>
          )}
        </DialogContent>
      </Dialog>
    </>
  )
}
