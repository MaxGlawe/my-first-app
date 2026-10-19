import { CheckShell } from "@/components/schmerzcheck/check/CheckShell"

/**
 * PROJ-23 / Phase 2: Red-flag stop page (spec §5.5). Verbatim copy.
 * HARD STOP — no marketing CTA, no "but if you still want…" escape hatch.
 * Calm, serious, empathetic (not alarming red).
 */
export default function RedFlagStopPage() {
  return (
    <CheckShell>
      <div className="rounded-2xl border border-slate-200 bg-white p-8 sm:p-10">
        <h1 className="text-[26px] font-extrabold leading-[1.15] tracking-[-0.02em] text-slate-900 sm:text-[30px]">
          Bitte beachte das hier zuerst.
        </h1>

        <div className="mt-6 rounded-2xl border border-red-200 bg-red-50/70 p-6">
          <p className="text-[16px] font-semibold leading-relaxed text-slate-900">
            Auf Basis deiner Antworten möchten wir dir eine direkte Empfehlung geben: bitte
            lass deine Beschwerden zeitnah ärztlich abklären.
          </p>
          <p className="mt-4 text-[15px] leading-relaxed text-slate-700">
            Manche Anzeichen — wie plötzliche Taubheit, Lähmungserscheinungen, unklare
            Gewichtsabnahme oder Schmerzen, die dich nachts aufwecken — können wichtige
            Hinweise sein, die nur ein Arzt oder eine Ärztin einordnen kann. Ein Schmerzcheck
            wie unserer kann das nicht ersetzen.
          </p>
        </div>

        <h2 className="mt-8 text-[15px] font-bold text-slate-900">Was du jetzt tun solltest:</h2>
        <ol className="mt-3 flex flex-col gap-4 text-[15px] leading-relaxed text-slate-700">
          <li className="flex gap-3">
            <span className="flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-slate-900 text-[12px] font-bold text-white">1</span>
            <span>
              Vereinbare zeitnah einen Termin bei deinem Hausarzt oder einer Fachärztin / einem
              Facharzt für Orthopädie oder Neurologie.
            </span>
          </li>
          <li className="flex gap-3">
            <span className="flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-slate-900 text-[12px] font-bold text-white">2</span>
            <span>
              Wenn die Beschwerden sehr stark sind oder plötzlich aufgetreten sind: zögere
              nicht, den ärztlichen Bereitschaftsdienst (116 117) anzurufen oder direkt in eine
              Notaufnahme zu gehen.
            </span>
          </li>
          <li className="flex gap-3">
            <span className="flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-slate-900 text-[12px] font-bold text-white">3</span>
            <span>
              Lass diesen Schmerzcheck erstmal beiseite. Komm gerne wieder, wenn ärztlich
              abgeklärt ist, was los ist — dann hilft dir der Check, deinen Weg nach vorne zu
              planen.
            </span>
          </li>
        </ol>

        <p className="mt-8 text-[15px] text-slate-700">Wir wünschen dir alles Gute.</p>
        <p className="mt-1 [font-family:var(--font-cormorant)] text-[17px] italic text-emerald-800">
          Max Glawe · Praxis OS
        </p>

        <div className="mt-8 border-t border-slate-100 pt-5 text-[13px] leading-relaxed text-slate-500">
          Diese Seite ersetzt keine medizinische Notfallversorgung. Bei akuten oder
          lebensbedrohlichen Beschwerden wähle <strong className="text-slate-700">112</strong>.
        </div>
      </div>
    </CheckShell>
  )
}
