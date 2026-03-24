"use client"

import Link from "next/link"
import { Building2, Users, ChevronRight } from "lucide-react"
import { Card, CardContent } from "@/components/ui/card"
import { OrgStatusBadge } from "@/components/bgf/OrgStatusBadge"
import { AmpelDot } from "@/components/bgf/AmpelDot"
import type { Organization } from "@/types/bgf"

interface OrgCardProps {
  org: Organization
  /** Pre-fetched member stats (optional — may not be available in list view) */
  memberCount?: number
  aktivCount?: number
  teilnahmequote?: number
}

export function OrgCard({ org, memberCount, aktivCount, teilnahmequote }: OrgCardProps) {
  const rate = teilnahmequote ?? 0

  return (
    <Link href={`/os/bgf/${org.id}`} className="block group">
      <Card className="hover:shadow-md transition-shadow border-slate-200/60 bg-white/80 backdrop-blur-sm">
        <CardContent className="p-5">
          <div className="flex items-start justify-between gap-3">
            {/* Left: icon + info */}
            <div className="flex items-start gap-3 min-w-0">
              <div className="h-10 w-10 rounded-xl bg-emerald-50 border border-emerald-100 flex items-center justify-center flex-shrink-0">
                <Building2 className="h-5 w-5 text-emerald-600" />
              </div>
              <div className="min-w-0">
                <p className="font-semibold text-slate-800 truncate">{org.name}</p>
                {org.branche && (
                  <p className="text-xs text-slate-400 mt-0.5 truncate">{org.branche}</p>
                )}
                <div className="flex items-center gap-2 mt-2 flex-wrap">
                  <OrgStatusBadge status={org.status} />
                  <span className="text-xs text-slate-400">{org.vertrag_tier.toUpperCase()}</span>
                </div>
              </div>
            </div>

            {/* Right: ampel + arrow */}
            <div className="flex items-center gap-3 flex-shrink-0">
              <div className="text-right">
                <div className="flex items-center gap-1.5 justify-end">
                  <AmpelDot teilnahmequote={rate} size="sm" />
                  <span className="text-sm font-semibold text-slate-700">{rate}%</span>
                </div>
                <p className="text-xs text-slate-400 mt-0.5">Teilnahme</p>
              </div>
              <ChevronRight className="h-4 w-4 text-slate-300 group-hover:text-slate-500 transition-colors" />
            </div>
          </div>

          {/* Member stats row */}
          {memberCount !== undefined && (
            <div className="mt-4 pt-3 border-t border-slate-100 flex items-center gap-4 text-xs text-slate-500">
              <span className="flex items-center gap-1">
                <Users className="h-3 w-3" />
                <span>{memberCount} Mitarbeiter</span>
              </span>
              {aktivCount !== undefined && (
                <span className="text-emerald-600 font-medium">{aktivCount} aktiv</span>
              )}
              <span className="ml-auto">
                {org.vertrag_lizenzen} Lizenzen
              </span>
            </div>
          )}
        </CardContent>
      </Card>
    </Link>
  )
}
