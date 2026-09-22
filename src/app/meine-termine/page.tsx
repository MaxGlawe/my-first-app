"use client"

// PROJ-34 / Stage 1: Eigener "Termine-only"-Bereich für Buchungs-Patienten.
// Live-Termine (ansehen/umbuchen/stornieren) + kontext-abhängige Information.
//
// PROJ-26: KEIN Selbst-Checkout mehr. Der Zugang zum 90-Tage-Programm entsteht
// ausschließlich über ein Angebot, das der Therapeut nach der Videokonsultation
// erstellt — nicht über einen Button, den der Patient hier selbst drücken kann.
// Diese Seite informiert, sie verkauft nicht.

import { useCallback, useEffect, useState } from "react"
import { Card, CardContent } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Skeleton } from "@/components/ui/skeleton"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter } from "@/components/ui/dialog"
import {
  AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription,
  AlertDialogFooter, AlertDialogHeader, AlertDialogTitle,
} from "@/components/ui/alert-dialog"
import {
  Calendar, Clock, User, AlertTriangle, CalendarX, CalendarClock, X, Lock,
  Dumbbell, MessageCircle, Activity, GraduationCap, ArrowRight,
} from "lucide-react"

// Einstieg ins Programm: die 30-minütige Videokonsultation (69 €), gebucht im
// Kalender der Praxis. Das ist der einzige Weg hinein — danach entscheidet die
// Konsultation, ob eine Fernbetreuung fachlich überhaupt in Frage kommt.
const KONSULTATION_URL =
  "https://physiotherapie-glawe.de/termin-buchen.html?service=video-sprechstunde-praxis-os&utm_source=praxis-os&utm_medium=meine-termine&utm_campaign=videokonsultation"

interface Appt {
  bookingId: string; bookingNumber?: string; date: string; startTime: string; endTime: string
  status: string; treatment?: { name?: string; durationMinutes?: number }
  therapist?: { id?: string; name?: string }; canReschedule: boolean; canCancel: boolean
}
interface Slots { availableDates: string[]; slotsByDate: Record<string, Array<{ startTime: string; endTime: string }>> }

const ERROR_DE: Record<string, string> = {
  slot_conflict: "Dieser Slot wurde gerade vergeben. Bitte wähle einen anderen.",
  holiday: "An diesem Tag ist die Praxis geschlossen. Bitte wähle einen anderen Tag.",
  not_reschedulable: "Dieser Termin lässt sich nicht mehr umbuchen.",
  invalid_time: "Diese Uhrzeit ist nicht möglich. Bitte wähle einen anderen Slot.",
  not_owner: "Dieser Termin gehört nicht zu deinem Konto.",
  already_cancelled: "Dieser Termin ist bereits storniert.",
}
const errText = (c?: string, fb = "Etwas ist schiefgelaufen. Bitte versuche es erneut.") => (c && ERROR_DE[c]) || fb
const isCancelled = (s: string) => s === "cancelled"
function fmtDate(d: string) {
  return new Date(d + "T00:00:00").toLocaleDateString("de-DE", { weekday: "long", day: "2-digit", month: "long", year: "numeric" })
}
function monthLabel(m: string) { return new Date(m + "-01T00:00:00").toLocaleDateString("de-DE", { month: "long", year: "numeric" }) }
function addMonth(m: string, d: number) { const [y, mo] = m.split("-").map(Number); const x = new Date(y, mo - 1 + d, 1); return `${x.getFullYear()}-${String(x.getMonth() + 1).padStart(2, "0")}` }

export default function MeineTerminePage() {
  const [appts, setAppts] = useState<Appt[]>([])
  const [linked, setLinked] = useState(true)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [reschedule, setReschedule] = useState<Appt | null>(null)
  const [cancelTarget, setCancelTarget] = useState<Appt | null>(null)
  const [aboSuccess, setAboSuccess] = useState(false)
  useEffect(() => {
    if (typeof window !== "undefined" && new URLSearchParams(window.location.search).get("abo") === "success") {
      setAboSuccess(true)
    }
  }, [])

  const load = useCallback(() => {
    setLoading(true)
    fetch("/api/me/appointments/live?scope=all")
      .then((r) => r.json().then((j) => ({ ok: r.ok, j })))
      .then(({ ok, j }) => {
        if (!ok) { setError(j.error || "Termine konnten nicht geladen werden."); return }
        setError(null); setLinked(j.linked !== false); setAppts(j.appointments ?? [])
      })
      .catch(() => setError("Termine konnten nicht geladen werden."))
      .finally(() => setLoading(false))
  }, [])
  useEffect(() => { load() }, [load])

  const now = new Date()
  const upcoming = appts.filter((a) => !isCancelled(a.status) && new Date(a.date + "T" + a.startTime) >= now)
    .sort((a, b) => (a.date + a.startTime).localeCompare(b.date + b.startTime))
  const past = appts.filter((a) => isCancelled(a.status) || new Date(a.date + "T" + a.startTime) < now)
    .sort((a, b) => (b.date + b.startTime).localeCompare(a.date + a.startTime))
  // "Bekannt" = hatte schon einen stattgefundenen (vergangenen, nicht stornierten) Termin.
  const known = appts.some((a) => !isCancelled(a.status) && new Date(a.date + "T" + a.startTime) < now)

  return (
    <div className="mx-auto max-w-2xl px-4 py-6">
      <header className="mb-6">
        <h1 className="text-2xl font-extrabold tracking-tight text-slate-900">Meine Termine</h1>
        <p className="mt-1 text-sm text-muted-foreground">Termine ansehen, umbuchen oder stornieren.</p>
      </header>

      {/* PROJ-26: Nur noch die Erhaltungsphase (16,99 €/Monat) landet hier — der
          Programm-Zugang entsteht über das Angebot des Therapeuten, nicht hier.
          Das success_url wandert in Phase 5 auf /app/dashboard. */}
      {aboSuccess && (
        <div className="mb-6 rounded-2xl border-2 border-emerald-600 bg-emerald-50 p-5">
          <p className="text-[15px] font-bold text-emerald-900">Deine Weiternutzung ist aktiv.</p>
          <p className="mt-1 text-[14px] leading-relaxed text-emerald-800">
            Dein Bereich ist wieder freigeschaltet — Check-ins, Chat und Pläne stehen dir erneut
            zur Verfügung. Schreib deinem Therapeuten, wenn du einen aktualisierten Plan brauchst.
          </p>
        </div>
      )}

      {loading && <div className="space-y-3"><Skeleton className="h-24 w-full rounded-xl" /><Skeleton className="h-24 w-full rounded-xl" /></div>}
      {!loading && error && <Alert variant="destructive"><AlertTriangle className="h-4 w-4" /><AlertDescription>{error}</AlertDescription></Alert>}

      {!loading && !error && !linked && (
        <Card><CardContent className="py-10 text-center text-sm text-muted-foreground">
          <CalendarX className="mx-auto mb-3 h-8 w-8 text-slate-300" />
          Noch keine Terminverknüpfung. Sobald du einen Termin buchst, erscheint er hier.
        </CardContent></Card>
      )}

      {!loading && !error && linked && (
        <div className="space-y-10">
          <section>
            <h2 className="mb-3 px-1 text-sm font-semibold text-muted-foreground">Kommende Termine</h2>
            {upcoming.length === 0
              ? <Card><CardContent className="py-8 text-center text-sm text-muted-foreground">Aktuell keine geplanten Termine.</CardContent></Card>
              : <ul className="space-y-3">{upcoming.map((a) => <ApptCard key={a.bookingId} a={a} onReschedule={() => setReschedule(a)} onCancel={() => setCancelTarget(a)} />)}</ul>}
          </section>

          <ProgrammSection hasUpcoming={upcoming.length > 0} known={known} />

          {past.length > 0 && (
            <section>
              <h2 className="mb-3 px-1 text-sm font-semibold text-muted-foreground">Vergangene & stornierte Termine</h2>
              <ul className="space-y-3 opacity-75">{past.slice(0, 12).map((a) => <ApptCard key={a.bookingId} a={a} past />)}</ul>
            </section>
          )}
        </div>
      )}

      {reschedule && <RescheduleDialog appt={reschedule} onClose={() => setReschedule(null)} onDone={() => { setReschedule(null); load() }} />}
      {cancelTarget && <CancelDialog appt={cancelTarget} onClose={() => setCancelTarget(null)} onDone={() => { setCancelTarget(null); load() }} />}
    </div>
  )
}

function ApptCard({ a, past, onReschedule, onCancel }: { a: Appt; past?: boolean; onReschedule?: () => void; onCancel?: () => void }) {
  return (
    <li className="rounded-xl border bg-white p-4">
      <div className="flex items-start gap-3">
        <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-blue-100 text-blue-700"><Calendar className="h-5 w-5" /></div>
        <div className="min-w-0 flex-1">
          <p className="truncate text-sm font-semibold text-slate-900">{a.treatment?.name ?? "Behandlung"}</p>
          <div className="mt-1 flex flex-wrap gap-x-3 gap-y-0.5 text-xs text-muted-foreground">
            <span className="flex items-center gap-1"><Calendar className="h-3 w-3" />{fmtDate(a.date)}</span>
            <span className="flex items-center gap-1"><Clock className="h-3 w-3" />{a.startTime}–{a.endTime}</span>
            {a.therapist?.name && <span className="flex items-center gap-1"><User className="h-3 w-3" />{a.therapist.name}</span>}
          </div>
        </div>
        {isCancelled(a.status)
          ? <Badge className="shrink-0 bg-slate-100 text-slate-600 hover:bg-slate-100 text-xs">Storniert</Badge>
          : <Badge className="shrink-0 bg-blue-100 text-blue-800 hover:bg-blue-100 text-xs">{past ? "Vergangen" : "Bestätigt"}</Badge>}
      </div>
      {!past && (a.canReschedule || a.canCancel) && (
        <div className="mt-3 flex gap-2 border-t pt-3">
          {a.canReschedule && <Button size="sm" variant="outline" onClick={onReschedule}><CalendarClock className="mr-1.5 h-4 w-4" />Umbuchen</Button>}
          {a.canCancel && <Button size="sm" variant="ghost" className="text-red-600 hover:bg-red-50 hover:text-red-700" onClick={onCancel}><X className="mr-1.5 h-4 w-4" />Stornieren</Button>}
        </div>
      )}
    </li>
  )
}

const FEATURES = [
  { icon: Dumbbell, t: "Täglicher Plan", d: "Micro-Übungen für jeden Tag, Trainingsplan für deine Trainingstage." },
  { icon: MessageCircle, t: "Direkter Therapeuten-Chat", d: "Antwort von einem echten Menschen, werktags innerhalb von 24 Stunden." },
  { icon: Activity, t: "Tägliches Check-in", d: "Kurze Fragen zu Schmerz, Schlaf und Belastung — dein Therapeut sieht mit." },
  { icon: GraduationCap, t: "Begleitende Video-Calls", d: "Zuerst wöchentlich, dann in größeren Abständen — bis du allein weitermachst." },
]

/** Was die Konsultation klärt — Erwartungsmanagement vor dem Termin. */
const KONSULTATION_PUNKTE = [
  "Was genau deine Beschwerden auslöst und wo du gerade stehst",
  "Ob sich dein Beschwerdebild aus der Ferne überhaupt sinnvoll betreuen lässt",
  "Wie eine Betreuung über Praxis OS in deinem Fall konkret aussehen würde",
]

/**
 * Kontext-abhängige Information — bewusst ohne Kaufbutton.
 *
 *  hasUpcoming → Vorbereitung auf die anstehende Videokonsultation
 *  known       → Konsultation war; wie es weitergeht (ohne Verkauf)
 *  sonst       → noch kein Termin: Einstieg über die Konsultation
 */
function ProgrammSection({ hasUpcoming, known }: { hasUpcoming: boolean; known: boolean }) {
  if (hasUpcoming) {
    return (
      <section className="overflow-hidden rounded-3xl border-2 border-emerald-600 bg-gradient-to-br from-emerald-50 to-[#fbfaf6] p-6 sm:p-7">
        <span className="text-[11px] font-bold uppercase tracking-[0.18em] text-emerald-700">Dein nächster Termin</span>
        <h2 className="mt-1.5 text-[20px] font-extrabold leading-tight text-slate-900 sm:text-[23px]">So läuft deine Videokonsultation ab</h2>
        <p className="mt-2 max-w-lg text-[14px] leading-relaxed text-slate-700">
          30 Minuten, per Video, ohne Praxisbesuch. Wir nehmen uns die Zeit für drei Dinge:
        </p>
        <ul className="mt-4 space-y-2.5">
          {KONSULTATION_PUNKTE.map((p) => (
            <li key={p} className="flex items-start gap-2.5 text-[14px] leading-relaxed text-slate-700">
              <span className="mt-[7px] h-1.5 w-1.5 shrink-0 rounded-full bg-emerald-600" />
              <span>{p}</span>
            </li>
          ))}
        </ul>
        <div className="mt-5 rounded-2xl border border-slate-200 bg-white/70 p-4">
          <h3 className="text-[13px] font-bold text-slate-800">Leg dir kurz bereit</h3>
          <p className="mt-1 text-[12.5px] leading-relaxed text-slate-500">
            Vorhandene Befunde oder Bildgebung, aktuelle Medikamente — und einen Platz, an dem du
            dich frei bewegen kannst.
          </p>
        </div>
      </section>
    )
  }

  return (
    <section className="overflow-hidden rounded-3xl border-2 border-emerald-600 bg-gradient-to-br from-emerald-50 to-[#fbfaf6] p-6 sm:p-7">
      <span className="text-[11px] font-bold uppercase tracking-[0.18em] text-emerald-700">Praxis OS</span>
      <h2 className="mt-1.5 text-[20px] font-extrabold leading-tight text-slate-900 sm:text-[23px]">
        90 Tage Betreuung — begleitet, nicht allein.
      </h2>
      <p className="mt-2 max-w-lg text-[14px] leading-relaxed text-slate-700">
        Physiotherapie aus der Ferne, über 90 Tage begleitet. Die App ist dabei die Schaltzentrale:
        Plan, Check-ins und Chat an einem Ort — kein separates Abo.
      </p>

      <div className="mt-5 grid gap-3 sm:grid-cols-2">
        {FEATURES.map((f) => (
          <div key={f.t} className="relative rounded-2xl border border-slate-200 bg-white/70 p-4">
            <span className="absolute right-3 top-3 text-slate-300"><Lock className="h-4 w-4" /></span>
            <f.icon className="h-5 w-5 text-emerald-700" />
            <h3 className="mt-2 text-[14px] font-bold text-slate-800">{f.t}</h3>
            <p className="mt-1 text-[12.5px] leading-relaxed text-slate-500">{f.d}</p>
          </div>
        ))}
      </div>

      {known ? (
        <div className="mt-6 rounded-2xl border border-slate-200 bg-white/70 p-4">
          <h3 className="text-[14px] font-bold text-slate-800">Wie es weitergeht</h3>
          <p className="mt-1.5 text-[13px] leading-relaxed text-slate-600">
            Wenn wir in der Konsultation gemeinsam entschieden haben, dass eine Betreuung aus der
            Ferne für dich passt, bekommst du von deinem Therapeuten ein persönliches Angebot per
            E-Mail. Sobald es angenommen ist, schaltet sich dein Bereich frei.
          </p>
          <p className="mt-2 text-[12px] text-slate-500">
            Noch offene Fragen? Antworte einfach auf die E-Mail deines Therapeuten.
          </p>
        </div>
      ) : (
        <div className="mt-6">
          <p className="mb-3 max-w-md text-[14px] leading-relaxed text-slate-700">
            Der Weg beginnt mit einer persönlichen Videokonsultation — 30 Minuten, in denen wir
            klären, ob wir dein Beschwerdebild aus der Ferne betreuen können.
          </p>
          <a href={KONSULTATION_URL} target="_blank" rel="noopener noreferrer"
             className="group inline-flex items-center gap-2 rounded-2xl bg-gradient-to-r from-emerald-600 to-teal-600 px-8 py-4 text-[16px] font-bold text-white shadow-lg transition hover:-translate-y-0.5">
            Videokonsultation buchen (69 €) <ArrowRight className="h-4 w-4 transition-transform group-hover:translate-x-0.5" />
          </a>
          <p className="mt-2 text-[12px] text-slate-500">30 Minuten · Eignungsprüfung inklusive</p>
        </div>
      )}
    </section>
  )
}

function RescheduleDialog({ appt, onClose, onDone }: { appt: Appt; onClose: () => void; onDone: () => void }) {
  const [month, setMonth] = useState(appt.date.slice(0, 7))
  const [slots, setSlots] = useState<Slots | null>(null)
  const [loading, setLoading] = useState(true)
  const [err, setErr] = useState<string | null>(null)
  const [pickedDate, setPickedDate] = useState<string | null>(null)
  const [pickedSlot, setPickedSlot] = useState<{ startTime: string; endTime: string } | null>(null)
  const [submitting, setSubmitting] = useState(false)

  const loadSlots = useCallback((m: string) => {
    setLoading(true); setErr(null); setPickedDate(null); setPickedSlot(null)
    fetch(`/api/me/appointments/${appt.bookingId}/reschedule-slots?month=${m}`)
      .then((r) => r.json().then((j) => ({ ok: r.ok, j })))
      .then(({ ok, j }) => { if (!ok) setErr(errText(j.code, "Slots konnten nicht geladen werden.")); else setSlots(j) })
      .catch(() => setErr("Slots konnten nicht geladen werden."))
      .finally(() => setLoading(false))
  }, [appt.bookingId])
  useEffect(() => { loadSlots(month) }, [month, loadSlots])

  async function confirm() {
    if (!pickedDate || !pickedSlot) return
    setSubmitting(true); setErr(null)
    try {
      const res = await fetch(`/api/me/appointments/${appt.bookingId}/reschedule`, {
        method: "POST", headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ date: pickedDate, startTime: pickedSlot.startTime, endTime: pickedSlot.endTime, therapistId: appt.therapist?.id }),
      })
      const j = await res.json()
      if (!res.ok) { setErr(errText(j.code)); if (j.code === "slot_conflict") loadSlots(month); return }
      onDone()
    } catch { setErr("Umbuchung fehlgeschlagen. Bitte erneut versuchen.") } finally { setSubmitting(false) }
  }

  return (
    <Dialog open onOpenChange={(o) => !o && onClose()}>
      <DialogContent className="max-w-md">
        <DialogHeader>
          <DialogTitle>Termin umbuchen</DialogTitle>
          <DialogDescription>{appt.treatment?.name} · aktuell {fmtDate(appt.date)}, {appt.startTime} Uhr</DialogDescription>
        </DialogHeader>
        <div className="mb-2 flex items-center justify-between">
          <Button size="sm" variant="ghost" onClick={() => setMonth(addMonth(month, -1))} disabled={loading}>‹</Button>
          <span className="text-sm font-medium">{monthLabel(month)}</span>
          <Button size="sm" variant="ghost" onClick={() => setMonth(addMonth(month, 1))} disabled={loading}>›</Button>
        </div>
        {loading && <Skeleton className="h-32 w-full rounded-lg" />}
        {!loading && err && <Alert variant="destructive"><AlertTriangle className="h-4 w-4" /><AlertDescription>{err}</AlertDescription></Alert>}
        {!loading && slots && (
          <div className="max-h-[46vh] overflow-y-auto">
            {slots.availableDates.length === 0 && <p className="py-4 text-center text-sm text-muted-foreground">In diesem Monat keine freien Termine.</p>}
            {!pickedDate && slots.availableDates.length > 0 && (
              <div className="grid grid-cols-2 gap-2">
                {slots.availableDates.map((d) => (
                  <button key={d} onClick={() => setPickedDate(d)} className="rounded-lg border px-3 py-2 text-left text-sm hover:border-emerald-400 hover:bg-emerald-50">
                    {new Date(d + "T00:00:00").toLocaleDateString("de-DE", { weekday: "short", day: "2-digit", month: "2-digit" })}
                  </button>
                ))}
              </div>
            )}
            {pickedDate && (
              <div>
                <button onClick={() => { setPickedDate(null); setPickedSlot(null) }} className="mb-2 text-xs text-emerald-700 hover:underline">‹ anderer Tag</button>
                <p className="mb-2 text-sm font-medium">{fmtDate(pickedDate)}</p>
                <div className="grid grid-cols-3 gap-2">
                  {(slots.slotsByDate[pickedDate] ?? []).map((s) => {
                    const sel = pickedSlot?.startTime === s.startTime
                    return <button key={s.startTime} onClick={() => setPickedSlot(s)} className={`rounded-lg border px-2 py-2 text-sm ${sel ? "border-emerald-600 bg-emerald-600 text-white" : "hover:border-emerald-400 hover:bg-emerald-50"}`}>{s.startTime}</button>
                  })}
                </div>
              </div>
            )}
          </div>
        )}
        <DialogFooter>
          <Button variant="outline" onClick={onClose} disabled={submitting}>Abbrechen</Button>
          <Button onClick={confirm} disabled={!pickedSlot || submitting}>{submitting ? "Wird gebucht…" : "Umbuchung bestätigen"}</Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}

function CancelDialog({ appt, onClose, onDone }: { appt: Appt; onClose: () => void; onDone: () => void }) {
  const [submitting, setSubmitting] = useState(false)
  const [err, setErr] = useState<string | null>(null)
  async function doCancel() {
    setSubmitting(true); setErr(null)
    try {
      const res = await fetch(`/api/me/appointments/${appt.bookingId}/cancel`, { method: "POST" })
      const j = await res.json()
      if (!res.ok) { if (j.code === "already_cancelled") { onDone(); return } setErr(errText(j.code)); return }
      onDone()
    } catch { setErr("Stornierung fehlgeschlagen. Bitte erneut versuchen.") } finally { setSubmitting(false) }
  }
  return (
    <AlertDialog open onOpenChange={(o) => !o && onClose()}>
      <AlertDialogContent>
        <AlertDialogHeader>
          <AlertDialogTitle>Termin stornieren?</AlertDialogTitle>
          <AlertDialogDescription>{appt.treatment?.name} am {fmtDate(appt.date)} um {appt.startTime} Uhr wird storniert.</AlertDialogDescription>
        </AlertDialogHeader>
        {err && <Alert variant="destructive"><AlertTriangle className="h-4 w-4" /><AlertDescription>{err}</AlertDescription></Alert>}
        <AlertDialogFooter>
          <AlertDialogCancel disabled={submitting}>Zurück</AlertDialogCancel>
          <AlertDialogAction onClick={(e) => { e.preventDefault(); doCancel() }} disabled={submitting} className="bg-red-600 hover:bg-red-700">{submitting ? "Wird storniert…" : "Ja, stornieren"}</AlertDialogAction>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  )
}
