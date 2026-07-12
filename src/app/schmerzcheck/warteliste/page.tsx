import Link from "next/link"

/**
 * Bestätigungsseite nach dem Wartelisten-Klick (PROJ-25c).
 *
 * KEIN Kaufangebot, kein Preis, kein Countdown. Der Klick war eine Auskunft
 * („ja, sag mir Bescheid"), keine Kaufabsicht. Wer hier plötzlich einen
 * 399-€-Button sähe, würde sich zu Recht verkauft vorkommen — und genau das
 * Vertrauen verlieren, das diese Mail aufbauen soll.
 *
 * Ehrlich bleibt auch: Wir versprechen keinen Termin. Bei Knie/Hüfte/Fuß sind
 * es sechs Leute — das rechtfertigt kein Modul, und das sagen wir auch so.
 */

const TEXTE: Record<string, { titel: string; text: string; zusatz?: string }> = {
  nacken_schulter: {
    titel: "Danke — du stehst auf der Liste.",
    text: "Sobald das Nacken- und Schulter-Programm fertig ist, erfährst du es als Erste/r. Bis dahin hörst du von mir nichts, was nicht zu deinem Schwerpunkt gehört.",
    zusatz: "Kein Kauf, keine Vorkasse, keine Verpflichtung. Nur eine Notiz mit deinem Namen dran.",
  },
  oberer_ruecken: {
    titel: "Danke — du stehst auf der Liste.",
    text: "Sobald das Programm für Nacken und oberen Rücken fertig ist, erfährst du es als Erste/r. Bis dahin hörst du von mir nichts, was nicht zu deinem Schwerpunkt gehört.",
    zusatz: "Kein Kauf, keine Vorkasse, keine Verpflichtung. Nur eine Notiz mit deinem Namen dran.",
  },
  knie_huefte_fuss: {
    titel: "Danke — notiert.",
    text: "Ich sage dir ehrlich: Für Knie, Hüfte und Fuß gibt es bei mir bisher kein Programm, und ob eines kommt, hängt davon ab, wie viele Menschen es tatsächlich brauchen. Dein Klick ist genau das Signal, das darüber mitentscheidet.",
    zusatz: "Wenn es so weit ist, erfährst du es als Erste/r. Wenn nicht, sage ich dir das auch.",
  },
}

export default async function WartelistePage({
  searchParams,
}: {
  searchParams: Promise<{ s?: string }>
}) {
  const { s } = await searchParams
  const eintrag = s ? TEXTE[s] : undefined

  if (!eintrag) {
    return (
      <Shell
        titel="Dieser Link ist nicht mehr gültig."
        text="Der Link aus der Mail ist abgelaufen. Antworte einfach direkt auf eine meiner Mails — ich lese jede Antwort selbst."
      />
    )
  }

  return <Shell titel={eintrag.titel} text={eintrag.text} zusatz={eintrag.zusatz} />
}

function Shell({ titel, text, zusatz }: { titel: string; text: string; zusatz?: string }) {
  return (
    <div className="mx-auto flex min-h-screen max-w-[560px] flex-col items-center justify-center px-6 py-16 text-center">
      <div className="mb-6 flex h-14 w-14 items-center justify-center rounded-full border border-slate-200 bg-white text-emerald-700">
        <svg viewBox="0 0 24 24" fill="none" className="h-7 w-7">
          <path
            d="M5 13l4 4L19 7"
            stroke="currentColor"
            strokeWidth="2.2"
            strokeLinecap="round"
            strokeLinejoin="round"
          />
        </svg>
      </div>

      <h1 className="text-[clamp(24px,4vw,34px)] font-extrabold leading-tight tracking-[-0.02em] text-slate-900">
        {titel}
      </h1>

      <p className="mx-auto mt-4 max-w-md text-[15px] leading-relaxed text-slate-600">{text}</p>

      {zusatz && (
        <p className="mx-auto mt-3 max-w-md text-[13.5px] leading-relaxed text-slate-400">{zusatz}</p>
      )}

      <Link
        href="/schmerzcheck"
        className="mt-8 inline-block rounded-[14px] border border-slate-200 bg-white px-7 py-3.5 text-sm font-semibold text-slate-700 transition hover:border-emerald-300 hover:text-emerald-800"
      >
        Zur Übersicht
      </Link>
    </div>
  )
}
