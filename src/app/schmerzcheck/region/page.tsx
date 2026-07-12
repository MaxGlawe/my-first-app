import Link from "next/link"

/**
 * Bestätigungsseite nach dem Klick in der Routing-Mail RT1/RT2 (PROJ-25b).
 *
 * Keine Sackgasse, aber auch KEIN Kaufangebot — die Spec ist da eindeutig.
 * Der Klick ist eine Auskunft, keine Kaufabsicht. Wer hier sofort einen
 * 399-€-Button sähe, würde sich zu Recht verkauft vorkommen.
 *
 * Nur bei „Unterer Rücken" gibt es einen Ausblick („die erste Mail dazu kommt
 * in den nächsten Tagen") — weil für diese Leute tatsächlich etwas kommt.
 */

const TEXTE: Record<string, { titel: string; text: string; ausblick?: string }> = {
  unterer_ruecken: {
    titel: "Danke — unterer Rücken, verstanden.",
    text: "Ab jetzt bekommst du von mir nur noch Inhalte, die zu diesem Schwerpunkt passen. Keine Allgemeinplätze mehr.",
    ausblick: "Die erste Mail dazu kommt in den nächsten Tagen.",
  },
  nacken_schulter: {
    titel: "Danke — Nacken und Schulter, verstanden.",
    text: "Ab jetzt bekommst du von mir nur noch Inhalte, die zu diesem Schwerpunkt passen. Ich arbeite gerade daran, und melde mich, sobald es so weit ist.",
  },
  oberer_ruecken: {
    titel: "Danke — oberer Rücken, verstanden.",
    text: "Ab jetzt bekommst du von mir nur noch Inhalte, die zu diesem Schwerpunkt passen. Ich arbeite gerade daran, und melde mich, sobald es so weit ist.",
  },
  knie_huefte_fuss: {
    titel: "Danke — Knie, Hüfte oder Fuß, verstanden.",
    text: "Ab jetzt bekommst du von mir nur noch Inhalte, die zu diesem Schwerpunkt passen. Ich arbeite gerade daran, und melde mich, sobald es so weit ist.",
  },
  wechselt_staendig: {
    titel: "Danke — es wechselt, verstanden.",
    text: "Das ist häufiger, als man denkt, und es macht die Sache nicht einfacher. Ab jetzt bekommst du von mir nur noch Inhalte, die dazu passen.",
  },
}

export default async function RegionPage({
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

  return <Shell titel={eintrag.titel} text={eintrag.text} ausblick={eintrag.ausblick} />
}

function Shell({
  titel,
  text,
  ausblick,
}: {
  titel: string
  text: string
  ausblick?: string
}) {
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

      {ausblick && (
        <p className="mx-auto mt-3 max-w-md text-[15px] font-semibold leading-relaxed text-emerald-800">
          {ausblick}
        </p>
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
