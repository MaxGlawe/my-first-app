"use client"

import { ArrowRight, MessageCircle, Headphones, LineChart } from "lucide-react"
import { fireInitiateCheckout } from "@/components/schmerzcheck/MetaPixel"
import type { ResultCategory } from "@/lib/schmerzcheck/scoring"

/**
 * Masterclass-Angebot auf der Schmerzcheck-Ergebnisseite (Spec B1).
 * Löst den Video-Analyse-CTA ab.
 *
 * Aufbau: Archetyp-Übergangssatz → Angebots-Karte (Inhalt / Begleitung / Preis)
 * → App-Mockup mit Chat → CTA auf die Salespage.
 *
 * HWG: kein Outcome-Versprechen, keine Heilaussage. Die Begleitung wird NIE als
 * „gratis dazu" geframt — sie ist der Hauptbestandteil des Angebots (Spec B3).
 * Für `needs_physician_assessment` wird diese Komponente gar nicht erst
 * gerendert (siehe Aufrufer) — kein Angebot bei ungeklärten Warnzeichen.
 */

/** Ein Satz je Archetyp — schlägt die Brücke vom Report zum Angebot. */
const ARCHETYPE_LINE: Record<ResultCategory, string> = {
  chronic_severe:
    "Deine Beschwerden begleiten dich schon lange und sind deutlich ausgeprägt. Genau dafür ist die Masterclass gebaut: verstehen, was da passiert — und dann jemanden an der Seite haben, der dranbleibt.",
  chronic_moderate:
    "Deine Beschwerden sind chronisch, aber nicht überwältigend. Das ist ein guter Ausgangspunkt: Du hast Luft, strukturiert zu arbeiten, statt nur zu reagieren.",
  acute_severe:
    "Deine Beschwerden sind aktuell stark. Bevor du mit Belastung startest, hilft dir das Verstehen — und ein Therapeut, der einordnet, was gerade sinnvoll ist und was noch nicht.",
  acute_moderate:
    "Deine Beschwerden sind frisch und moderat. Jetzt ist der Moment, in dem sich entscheidet, ob daraus ein Dauerzustand wird — oder eben nicht.",
  mild: "Deine Beschwerden sind aktuell mild. Der beste Zeitpunkt, um zu verstehen, was dein Rücken braucht, ist genau jetzt — nicht erst, wenn es schlimmer wird.",
  needs_physician_assessment:
    "Bitte lass deine Beschwerden zuerst ärztlich abklären. Alles Weitere hat Zeit, bis das geklärt ist.",
}

export function MasterclassOffer({
  category,
  token,
  band,
}: {
  category: ResultCategory
  /** Lead-Token für die Klick-Attribution. */
  token: string
  band?: string
}) {
  // Getrackter Ausgang: loggt `clicked` (Mail-Code REPORT, Ziel salespage,
  // Archetyp als Metadatum) und leitet dann mit UTM auf die Salespage weiter.
  const href =
    `/api/schmerzcheck/go?e=REPORT&t=salespage&m=report` +
    `&a=${encodeURIComponent(category)}&u=${encodeURIComponent(token)}`

  return (
    <div className="mt-6 overflow-hidden rounded-3xl border-2 border-emerald-600 bg-gradient-to-br from-emerald-50 to-[#fbfaf6]">
      <div className="p-6 sm:p-8">
        <span className="text-[11px] font-bold uppercase tracking-[0.18em] text-emerald-700">
          Dein empfohlener nächster Schritt
        </span>

        {/* 1 — Archetyp-Übergangssatz */}
        <h2 className="mt-1.5 text-[22px] font-extrabold leading-tight tracking-[-0.01em] text-slate-900 sm:text-[26px]">
          Du musst das nicht allein herausfinden.
        </h2>
        <p className="mt-3 max-w-xl text-[15px] leading-relaxed text-slate-700">
          {ARCHETYPE_LINE[category]}
        </p>

        <div className="mt-6 grid gap-6 sm:grid-cols-[1fr_auto] sm:items-center">
          {/* 2 — Angebots-Karte: Begleitung steht bewusst an erster Stelle */}
          <div className="space-y-3.5">
            <Feature
              icon={<MessageCircle className="h-[18px] w-[18px]" />}
              title="3 Monate persönliche Begleitung per App"
              body="Direkter Draht zu Max per Chat — Antwort innerhalb von 48 h werktags. Dazu ein Übungsprogramm, das zu dir passt, und eine Verlaufskontrolle."
              highlight
            />
            <Feature
              icon={<Headphones className="h-[18px] w-[18px]" />}
              title="27 vertonte Lektionen + Workbook + Kartendeck"
              body="Rund 270 Seiten Workbook und ein Bewegungs-Kartendeck. Bleibt dir dauerhaft — auch nach den drei Monaten."
            />
            <Feature
              icon={<LineChart className="h-[18px] w-[18px]" />}
              title="Einmalig 399 € statt 499 €"
              body="Lebenslanger Kurszugriff, inkl. der drei Monate Begleitung. Oder 3 × 133 € mit Klarna — ohne Aufpreis."
            />
          </div>

          {/* 3 — App-Mockup: zeigt, was „Begleitung" konkret heißt */}
          <PhoneMockup />
        </div>

        {/* 4 + 5 — CTA mit UTM, Klick wird getrackt */}
        <div className="mt-7">
          <a
            href={href}
            onClick={() => fireInitiateCheckout({ band })}
            className="group inline-flex items-center gap-2.5 rounded-2xl bg-gradient-to-r from-emerald-600 to-teal-600 px-8 py-4 text-[17px] font-bold text-white shadow-[0_10px_28px_rgba(6,95,70,0.32)] transition-all hover:-translate-y-0.5 hover:shadow-[0_14px_34px_rgba(6,95,70,0.4)]"
          >
            Die Masterclass ansehen
            <ArrowRight className="h-[18px] w-[18px] transition-transform group-hover:translate-x-0.5" />
          </a>
          <p className="mt-3 text-[12px] leading-relaxed text-slate-500">
            Einmalzahlung, kein Abo. Die Begleitung endet nach drei Monaten automatisch — sie
            verlängert sich nicht von selbst. Die Masterclass ersetzt weder Arzt noch Therapie.
          </p>
        </div>
      </div>
    </div>
  )
}

function Feature({
  icon,
  title,
  body,
  highlight,
}: {
  icon: React.ReactNode
  title: string
  body: string
  highlight?: boolean
}) {
  return (
    <div className="flex gap-3">
      <span
        className={`mt-0.5 flex h-9 w-9 shrink-0 items-center justify-center rounded-xl ${
          highlight ? "bg-emerald-600 text-white" : "bg-white text-emerald-700 ring-1 ring-emerald-100"
        }`}
      >
        {icon}
      </span>
      <div>
        <p className="text-[15px] font-bold leading-snug text-slate-900">{title}</p>
        <p className="mt-0.5 text-[13.5px] leading-relaxed text-slate-600">{body}</p>
      </div>
    </div>
  )
}

/**
 * Phone-Frame mit Chat-Ansicht. Bewusst als CSS gebaut statt als Screenshot:
 * bleibt scharf auf jedem Display, lädt ohne Asset und ist kein Stock-Foto.
 * Der Verlauf ist gestellt und HWG-konform — keine Zusage eines Ergebnisses.
 */
function PhoneMockup() {
  return (
    <div className="mx-auto hidden w-[218px] shrink-0 sm:block">
      <div className="rounded-[30px] border-[7px] border-slate-900 bg-slate-900 shadow-[0_18px_40px_rgba(15,23,42,0.25)]">
        <div className="relative overflow-hidden rounded-[23px] bg-[#f8f5f0]">
          {/* Notch */}
          <div className="absolute left-1/2 top-0 h-[15px] w-[70px] -translate-x-1/2 rounded-b-[9px] bg-slate-900" />

          {/* Chat-Header */}
          <div className="flex items-center gap-2 border-b border-slate-200 bg-white px-3 pb-2 pt-5">
            <span className="flex h-6 w-6 items-center justify-center rounded-full bg-emerald-700 text-[9px] font-bold text-white">
              MG
            </span>
            <div className="leading-tight">
              <p className="text-[10px] font-bold text-slate-900">Max Glawe</p>
              <p className="text-[8px] text-emerald-700">Dein Therapeut</p>
            </div>
          </div>

          {/* Verlauf */}
          <div className="space-y-1.5 px-2.5 py-3">
            <Bubble side="right">
              Woche 2 — die Übung morgens klappt. Beim Sitzen wird&apos;s ab Mittag wieder zäh.
            </Bubble>
            <Bubble side="left">
              Danke dir. Das Zäh-Werden am Nachmittag passt zum Bild. Ich nehme dir die
              Mobilisation aus dem Abendblock raus und lege sie auf 14 Uhr.
            </Bubble>
            <Bubble side="left">Programm ist angepasst — schau mal rein.</Bubble>
            <Bubble side="right">Perfekt, danke!</Bubble>
          </div>

          <div className="border-t border-slate-200 bg-white px-2.5 py-1.5">
            <div className="rounded-full bg-slate-100 px-2.5 py-1 text-[8px] text-slate-400">
              Nachricht schreiben …
            </div>
          </div>
        </div>
      </div>
      <p className="mt-2.5 text-center text-[11px] leading-snug text-slate-500">
        So sieht Begleitung aus:<br />du schreibst, Max antwortet.
      </p>
    </div>
  )
}

function Bubble({ side, children }: { side: "left" | "right"; children: React.ReactNode }) {
  const isLeft = side === "left"
  return (
    <div className={`flex ${isLeft ? "justify-start" : "justify-end"}`}>
      <p
        className={`max-w-[85%] rounded-2xl px-2.5 py-1.5 text-[8.5px] leading-[1.45] ${
          isLeft
            ? "rounded-bl-md bg-white text-slate-700 ring-1 ring-slate-200"
            : "rounded-br-md bg-emerald-700 text-white"
        }`}
      >
        {children}
      </p>
    </div>
  )
}
