import type { Metadata } from "next"
import Link from "next/link"

/**
 * Widerrufsbelehrung für digitale Inhalte (Masterclass, Kurse, Kartendecks).
 *
 * WARUM ES DIESE SEITE BRAUCHT: Die AGB regeln bislang nur das Erlöschen des
 * Widerrufsrechts bei DIENSTLEISTUNGEN (§ 356 Abs. 4 BGB). Die Masterclass ist
 * ein digitaler Inhalt — dafür gilt § 356 Abs. 5 BGB. Danach erlischt das
 * Widerrufsrecht nur, wenn der Käufer VOR dem Kauf ausdrücklich zustimmt, dass
 * mit der Ausführung sofort begonnen wird, UND bestätigt, dass er dadurch sein
 * Widerrufsrecht verliert. Fehlt diese Zustimmung, behält er 14 Tage Widerrufs-
 * recht — auch nachdem er den kompletten Kurs konsumiert hat.
 *
 * Die Zustimmung wird im Kaufpanel als Pflicht-Checkbox eingeholt und in der
 * Stripe-Session als Nachweis gespeichert (metadata.widerruf_verzicht).
 *
 * ⚠️ Der Text folgt dem gesetzlichen Muster (Anlage 1 zu Art. 246a § 1 Abs. 2
 * EGBGB). Er sollte vor dem Live-Gang von Max bzw. anwaltlich geprüft werden.
 */

export const metadata: Metadata = {
  title: "Widerrufsbelehrung | Praxis OS",
  description: "Widerrufsrecht und Muster-Widerrufsformular für digitale Inhalte.",
  robots: { index: true, follow: true },
}

export default function WiderrufPage() {
  return (
    <main className="mx-auto max-w-3xl px-6 py-16 md:py-24">
      <h1 className="text-3xl font-bold tracking-tight text-slate-900 md:text-4xl">
        Widerrufsbelehrung
      </h1>
      <p className="mt-3 text-sm text-slate-500">
        Für Verbraucher beim Kauf digitaler Inhalte (Masterclass, Online-Kurse, Kartendecks).
      </p>

      <div className="mt-10 space-y-8 text-[15px] leading-relaxed text-slate-700">
        <section>
          <h2 className="text-xl font-semibold text-slate-900">Widerrufsrecht</h2>
          <p className="mt-3">
            Du hast das Recht, binnen vierzehn Tagen ohne Angabe von Gründen diesen Vertrag zu
            widerrufen. Die Widerrufsfrist beträgt vierzehn Tage ab dem Tag des Vertragsschlusses.
          </p>
          <p className="mt-3">
            Um dein Widerrufsrecht auszuüben, musst du uns mittels einer eindeutigen Erklärung
            (z. B. ein mit der Post versandter Brief oder eine E-Mail) über deinen Entschluss,
            diesen Vertrag zu widerrufen, informieren. Du kannst dafür das untenstehende
            Muster-Widerrufsformular verwenden, das jedoch nicht vorgeschrieben ist.
          </p>
          <div className="mt-4 rounded-xl border border-slate-200 bg-slate-50 p-5">
            <p className="font-semibold text-slate-900">Der Widerruf ist zu richten an:</p>
            <p className="mt-2">
              Max Glawe · Physiotherapie Glawe
              <br />
              Karl-Marx-Straße 117, 15745 Wildau
              <br />
              E-Mail:{" "}
              <a
                href="mailto:info@physiotherapie-glawe.de"
                className="font-medium text-emerald-700 underline underline-offset-2"
              >
                info@physiotherapie-glawe.de
              </a>
            </p>
          </div>
          <p className="mt-3">
            Zur Wahrung der Widerrufsfrist reicht es aus, dass du die Mitteilung über die Ausübung
            des Widerrufsrechts vor Ablauf der Widerrufsfrist absendest.
          </p>
        </section>

        <section className="rounded-2xl border-2 border-amber-300 bg-amber-50 p-6">
          <h2 className="text-xl font-semibold text-amber-950">
            Vorzeitiges Erlöschen des Widerrufsrechts
          </h2>
          <p className="mt-3 text-amber-950">
            Bei einem Vertrag über die Bereitstellung <strong>digitaler Inhalte</strong>, die nicht
            auf einem körperlichen Datenträger geliefert werden, erlischt dein Widerrufsrecht
            vorzeitig, wenn wir mit der Ausführung des Vertrags begonnen haben, nachdem du
          </p>
          <ol className="mt-3 list-decimal space-y-1.5 pl-5 text-amber-950">
            <li>
              ausdrücklich zugestimmt hast, dass wir mit der Ausführung des Vertrags vor Ablauf der
              Widerrufsfrist beginnen, und
            </li>
            <li>
              deine Kenntnis davon bestätigt hast, dass du durch deine Zustimmung mit Beginn der
              Ausführung des Vertrags dein Widerrufsrecht verlierst.
            </li>
          </ol>
          <p className="mt-3 text-amber-950">
            Beim Kauf holen wir diese Zustimmung ausdrücklich über eine Checkbox ein. Setzt du dieses
            Häkchen nicht, kannst du nicht kaufen — der sofortige Zugang zu den Inhalten ist ohne
            deine Zustimmung nicht möglich. Verzichtest du auf den sofortigen Zugang, schreib uns
            einfach eine E-Mail; wir stellen dir den Zugang dann nach Ablauf der Widerrufsfrist
            bereit.
          </p>
        </section>

        <section>
          <h2 className="text-xl font-semibold text-slate-900">Folgen des Widerrufs</h2>
          <p className="mt-3">
            Wenn du diesen Vertrag widerrufst, haben wir dir alle Zahlungen, die wir von dir erhalten
            haben, unverzüglich und spätestens binnen vierzehn Tagen ab dem Tag zurückzuzahlen, an
            dem die Mitteilung über deinen Widerruf dieses Vertrags bei uns eingegangen ist. Für
            diese Rückzahlung verwenden wir dasselbe Zahlungsmittel, das du bei der ursprünglichen
            Transaktion eingesetzt hast, es sei denn, mit dir wurde ausdrücklich etwas anderes
            vereinbart; in keinem Fall werden dir wegen dieser Rückzahlung Entgelte berechnet.
          </p>
        </section>

        <section>
          <h2 className="text-xl font-semibold text-slate-900">Muster-Widerrufsformular</h2>
          <p className="mt-3 text-sm text-slate-500">
            (Wenn du den Vertrag widerrufen willst, fülle dieses Formular aus und sende es zurück.)
          </p>
          <div className="mt-4 whitespace-pre-line rounded-xl border border-slate-200 bg-white p-5 font-mono text-[13.5px] leading-relaxed text-slate-700">
            {`An:
Max Glawe · Physiotherapie Glawe
Karl-Marx-Straße 117, 15745 Wildau
info@physiotherapie-glawe.de

Hiermit widerrufe(n) ich/wir (*) den von mir/uns (*) abgeschlossenen Vertrag
über den Kauf der folgenden Waren (*) / die Erbringung der folgenden
Dienstleistung (*):

_______________________________________________

Bestellt am (*) / erhalten am (*):  ____________
Name des/der Verbraucher(s):        ____________
Anschrift des/der Verbraucher(s):   ____________

Unterschrift (nur bei Mitteilung auf Papier): ____________
Datum: ____________

(*) Unzutreffendes streichen.`}
          </div>
        </section>

        <p className="border-t border-slate-200 pt-6 text-sm text-slate-500">
          Siehe auch{" "}
          <Link href="/agb" className="font-medium text-emerald-700 underline underline-offset-2">
            AGB
          </Link>
          ,{" "}
          <Link
            href="/datenschutz"
            className="font-medium text-emerald-700 underline underline-offset-2"
          >
            Datenschutz
          </Link>{" "}
          und{" "}
          <Link
            href="/impressum"
            className="font-medium text-emerald-700 underline underline-offset-2"
          >
            Impressum
          </Link>
          .
        </p>
      </div>
    </main>
  )
}
