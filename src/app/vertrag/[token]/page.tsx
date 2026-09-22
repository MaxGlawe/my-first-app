/**
 * Öffentliche Vertragsseite.
 *
 * Zwei Welten hinter einer URL:
 *  - Bestandsverträge werden unterschrieben → ContractSigningView (Signature-Pad)
 *  - PROJ-26: Das Praxis-OS-Programm wird BEZAHLT → ProgrammAngebotView
 *
 * Die Weiche liegt hier serverseitig, damit der Patient nicht erst die falsche
 * Ansicht sieht und sie dann wegflackert.
 */

import { createSupabaseServiceClient } from "@/lib/supabase-service"
import { ContractSigningView } from "@/components/contracts/ContractSigningView"
import { ProgrammAngebotView } from "@/components/contracts/ProgrammAngebotView"
import { offenerBetrag } from "@/types/contract"
import type { Leistung, VertragText } from "@/types/contract"

export const dynamic = "force-dynamic"

function InvalidLink({ title, text }: { title: string; text: string }) {
  return (
    <div className="min-h-screen bg-[#F8F5F0] flex items-center justify-center p-4">
      <div className="max-w-md text-center">
        <h1
          className="text-xl text-slate-900"
          style={{ fontFamily: "var(--font-serif)", fontWeight: 600 }}
        >
          {title}
        </h1>
        <p className="text-sm text-slate-500 mt-2 leading-relaxed">{text}</p>
      </div>
    </div>
  )
}

export default async function VertragPage({
  params,
  searchParams,
}: {
  params: Promise<{ token: string }>
  searchParams: Promise<{ bezahlt?: string }>
}) {
  const { token } = await params
  const { bezahlt } = await searchParams

  if (!token || !/^[a-zA-Z0-9_-]{16,}$/.test(token)) {
    return (
      <InvalidLink
        title="Ungültiger Link"
        text="Dieser Link ist nicht gültig. Bitte prüfe den Link in deiner E-Mail."
      />
    )
  }

  const svc = createSupabaseServiceClient()
  const { data: contract } = await svc
    .from("treatment_contracts")
    .select(
      "contract_number, contract_type, status, leistungen, gesamtpreis, bereits_beglichen, programm_tage, vertrag_text, praxis_name, praxis_inhaber, patient_name, token_expires_at, paid_at"
    )
    .eq("signing_token", token)
    .maybeSingle()

  if (!contract) {
    return (
      <InvalidLink
        title="Nicht gefunden"
        text="Zu diesem Link gibt es keinen Vertrag. Bitte prüfe den Link in deiner E-Mail."
      />
    )
  }

  // Bestandsverträge: unverändert die Unterschrifts-Ansicht.
  if (contract.contract_type !== "praxis_os_programm") {
    return <ContractSigningView token={token} />
  }

  const abgelaufen =
    !!contract.token_expires_at && new Date(contract.token_expires_at) < new Date()

  return (
    <ProgrammAngebotView
      token={token}
      contractNumber={contract.contract_number}
      patientName={contract.patient_name}
      praxisName={contract.praxis_name}
      behandler={contract.praxis_inhaber}
      leistungen={(contract.leistungen ?? []) as Leistung[]}
      vertragText={contract.vertrag_text as VertragText}
      gesamtpreis={Number(contract.gesamtpreis)}
      bereitsBeglichen={Number(contract.bereits_beglichen ?? 0)}
      zuZahlen={offenerBetrag({
        gesamtpreis: Number(contract.gesamtpreis),
        bereits_beglichen: Number(contract.bereits_beglichen ?? 0),
      })}
      tage={contract.programm_tage ?? 90}
      gueltigBis={contract.token_expires_at}
      status={
        contract.paid_at || contract.status === "unterschrieben"
          ? "bezahlt"
          : contract.status === "storniert" || contract.status === "widerrufen"
            ? "ungueltig"
            : abgelaufen
              ? "abgelaufen"
              : "offen"
      }
      geradeBezahlt={bezahlt === "1"}
    />
  )
}
