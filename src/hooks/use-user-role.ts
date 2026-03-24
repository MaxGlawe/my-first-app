"use client"

import { useState, useEffect } from "react"
import { supabase } from "@/lib/supabase"

export type UserRole = "admin" | "heilpraktiker" | "physiotherapeut" | "patient" | "praeventionstrainer" | "personal_trainer" | "praxismanagement"

interface UseUserRoleResult {
  role: UserRole | null
  isLoading: boolean
  isHeilpraktiker: boolean
  isAdmin: boolean
  isTrainer: boolean
  isPraxismanagement: boolean
  /** Trainer roles that do Funktionsuntersuchung + Trainingsdokumentation */
  isFunktionsRole: boolean
  /** BGF (Betriebliche Gesundheitsförderung) access */
  isBgf: boolean
}

export function useUserRole(): UseUserRoleResult {
  const [role, setRole] = useState<UserRole | null>(null)
  const [bgfFreigeschaltet, setBgfFreigeschaltet] = useState(false)
  const [isLoading, setIsLoading] = useState(true)

  useEffect(() => {
    let cancelled = false

    async function fetchRole() {
      setIsLoading(true)

      try {
        const {
          data: { user },
        } = await supabase.auth.getUser()

        if (!user || cancelled) {
          setRole(null)
          return
        }

        const { data: profile } = await supabase
          .from("user_profiles")
          .select("role, bgf_freigeschaltet")
          .eq("id", user.id)
          .single()

        if (!cancelled) {
          setRole((profile?.role as UserRole) ?? null)
          setBgfFreigeschaltet(profile?.bgf_freigeschaltet === true)
        }
      } catch {
        if (!cancelled) setRole(null)
      } finally {
        if (!cancelled) setIsLoading(false)
      }
    }

    fetchRole()
    return () => {
      cancelled = true
    }
  }, [])

  const isTrainer = role === "praeventionstrainer" || role === "personal_trainer"
  const isAdmin = role === "admin"

  return {
    role,
    isLoading,
    isHeilpraktiker: role === "heilpraktiker",
    isAdmin,
    isTrainer,
    isPraxismanagement: role === "praxismanagement",
    isFunktionsRole: isTrainer,
    isBgf: isAdmin || bgfFreigeschaltet,
  }
}
