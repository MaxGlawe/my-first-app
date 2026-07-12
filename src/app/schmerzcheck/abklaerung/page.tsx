import Link from "next/link"

/**
 * Bestätigungsseite nach dem Klick in einer Brücken-Mail (B1/B2).
 *
 * Drei Zustände:
 *   cleared  → ärztlich abgeklärt. Der Lead wandert in Segment A und bekommt
 *              ab dem nächsten Kampagnen-Lauf die Masterclass angeboten.
 *              Hier steht bewusst noch KEIN Kauf-CTA — erst die Mail verkauft,
 *              die Bestätigungsseite bleibt ruhig.
 *   not_yet  → noch nicht abgeklärt. Kein Angebot, nur die klare Bitte, das
 *              nachzuholen, plus die Notfall-Hinweise.
 *   expired  → Link abgelaufen/ungültig.
 */
export default async function AbklaerungPage({
  searchParams,
}: {
  searchParams: Promise<{ s?: string }>
}) {
  const { s } = await searchParams
  const state = s === "cleared" || s === "not_yet" ? s : "expired"

  if (state === "cleared") {
    return (
      <Shell
        icon="check"
        title="Danke — das hilft mir weiter."
        body={
          <>
            <p className="mx-auto mt-4 max-w-md text-[15px] leading-relaxed text-slate-600">
              Gut, dass du das hast abklären lassen. Damit weiß ich, dass ich dir sinnvoll
              weiterhelfen kann, ohne etwas zu übersehen.
            </p>
            <p className="mx-auto mt-3 max-w-md text-[15px] leading-relaxed text-slate-600">
              Ich melde mich in den nächsten Tagen bei dir und zeige dir, was in deiner Situation
              als Nächstes sinnvoll ist.
            </p>
          </>
        }
      />
    )
  }

  if (state === "not_yet") {
    return (
      <Shell
        icon="info"
        title="Alles gut — hol es bitte nach."
        body={
          <>
            <p className="mx-auto mt-4 max-w-md text-[15px] leading-relaxed text-slate-600">
              Ich weiß, dass ein Arzttermin lästig ist. Bei den Angaben aus deinem Schmerzcheck ist
              er aber der richtige erste Schritt — vor allem, bevor du mit Bewegung oder Training
              anfängst.
            </p>
            <div className="mx-auto mt-6 max-w-md rounded-2xl border border-amber-200 bg-amber-50 px-5 py-4 text-left">
              <p className="text-[13px] font-semibold text-amber-900">
                Sofort in die Notaufnahme (oder 112), wenn eines davon auftritt:
              </p>
              <ul className="mt-2 list-disc pl-5 text-[13px] leading-relaxed text-amber-900">
                <li>plötzliche Taubheit im Genital- oder Sattelbereich</li>
                <li>Kontrollverlust über Blase oder Darm</li>
                <li>rasch zunehmende Lähmung oder Schwäche</li>
              </ul>
            </div>
            <p className="mx-auto mt-5 max-w-md text-[15px] leading-relaxed text-slate-600">
              Sobald das geklärt ist, melde dich gern — dann schauen wir gemeinsam weiter.
            </p>
          </>
        }
      />
    )
  }

  return (
    <Shell
      icon="info"
      title="Dieser Link ist nicht mehr gültig."
      body={
        <p className="mx-auto mt-4 max-w-md text-[15px] leading-relaxed text-slate-600">
          Der Link aus der Mail ist abgelaufen. Wenn du Fragen zu deinem Schmerzcheck hast,
          antworte einfach direkt auf eine meiner Mails — ich lese jede Antwort selbst.
        </p>
      }
    />
  )
}

function Shell({
  icon,
  title,
  body,
}: {
  icon: "check" | "info"
  title: string
  body: React.ReactNode
}) {
  return (
    <div className="mx-auto flex min-h-screen max-w-[560px] flex-col items-center justify-center px-6 py-16 text-center">
      <div className="mb-6 flex h-14 w-14 items-center justify-center rounded-full border border-slate-200 bg-white text-emerald-700">
        {icon === "check" ? (
          <svg viewBox="0 0 24 24" fill="none" className="h-7 w-7">
            <path
              d="M5 13l4 4L19 7"
              stroke="currentColor"
              strokeWidth="2.2"
              strokeLinecap="round"
              strokeLinejoin="round"
            />
          </svg>
        ) : (
          <svg viewBox="0 0 24 24" fill="none" className="h-7 w-7">
            <path d="M12 8v5" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" />
            <circle cx="12" cy="16.5" r="1.2" fill="currentColor" />
          </svg>
        )}
      </div>

      <h1 className="text-[clamp(24px,4vw,34px)] font-extrabold leading-tight tracking-[-0.02em] text-slate-900">
        {title}
      </h1>

      {body}

      <Link
        href="/schmerzcheck"
        className="mt-8 inline-block rounded-[14px] border border-slate-200 bg-white px-7 py-3.5 text-sm font-semibold text-slate-700 transition hover:border-emerald-300 hover:text-emerald-800"
      >
        Zur Übersicht
      </Link>
    </div>
  )
}
