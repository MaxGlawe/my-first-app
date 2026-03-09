"use client"

import { CONTRACT_STATUS_CONFIG } from "@/types/contract"
import type { ContractStatus } from "@/types/contract"

interface ContractStatusBadgeProps {
  status: ContractStatus
}

export function ContractStatusBadge({ status }: ContractStatusBadgeProps) {
  const config = CONTRACT_STATUS_CONFIG[status]
  if (!config) return null

  return (
    <span className={`inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-medium ${config.color}`}>
      {config.label}
    </span>
  )
}
