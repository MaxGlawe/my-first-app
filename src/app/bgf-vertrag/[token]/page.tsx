"use client"

import { useParams } from "next/navigation"
import { BgfContractSigningView } from "@/components/bgf-contracts/BgfContractSigningView"

export default function BgfVertragSignPage() {
  const { token } = useParams<{ token: string }>()

  if (!token) {
    return (
      <div className="min-h-screen bg-[#faf9f7] flex items-center justify-center p-4">
        <div className="text-center">
          <h1 className="text-xl font-bold text-slate-900">Ungültiger Link</h1>
          <p className="text-sm text-slate-500 mt-2">
            Dieser Link ist nicht gültig. Bitte prüfen Sie den Link in Ihrer E-Mail.
          </p>
        </div>
      </div>
    )
  }

  return <BgfContractSigningView token={token} />
}
