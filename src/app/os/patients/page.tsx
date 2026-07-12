"use client"

import { useState, useCallback } from "react"
import { PatientsHeader } from "@/components/patients/PatientsHeader"
import { PatientTable } from "@/components/patients/PatientTable"
import { Button } from "@/components/ui/button"
import { usePatients } from "@/hooks/use-patients"
import {
  Pagination,
  PaginationContent,
  PaginationItem,
  PaginationLink,
  PaginationNext,
  PaginationPrevious,
} from "@/components/ui/pagination"
import { useDebounce } from "@/hooks/use-debounce"

const PAGE_SIZE = 20

export default function PatientsPage() {
  const [search, setSearch] = useState("")
  const [showArchived, setShowArchived] = useState(false)
  const [scope, setScope] = useState<"mine" | "all">("mine")
  const [nurBegleitung, setNurBegleitung] = useState(false)
  const [page, setPage] = useState(1)

  const debouncedSearch = useDebounce(search, 300)

  const { patients, totalCount, isLoading, error } = usePatients({
    search: debouncedSearch,
    showArchived,
    scope,
    page,
    nurBegleitung,
  })

  const totalPages = Math.max(1, Math.ceil(totalCount / PAGE_SIZE))

  const handleSearchChange = useCallback((value: string) => {
    setSearch(value)
    setPage(1) // Reset to page 1 on new search
  }, [])

  const handleArchivedChange = useCallback((value: boolean) => {
    setShowArchived(value)
    setPage(1)
  }, [])

  const handleScopeChange = useCallback((value: "mine" | "all") => {
    setScope(value)
    setPage(1)
  }, [])

  const handleBegleitungChange = useCallback(() => {
    setNurBegleitung((v) => !v)
    setPage(1)
  }, [])

  return (
    <div className="container mx-auto py-8 px-4 max-w-7xl">
      <PatientsHeader
        search={search}
        onSearchChange={handleSearchChange}
        showArchived={showArchived}
        onShowArchivedChange={handleArchivedChange}
        scope={scope}
        onScopeChange={handleScopeChange}
      />

      {/* Betreuungslast: nur Patienten mit laufender Masterclass-Begleitung */}
      <div className="mb-4 flex items-center gap-2">
        <Button
          type="button"
          variant={nurBegleitung ? "default" : "outline"}
          size="sm"
          onClick={handleBegleitungChange}
          className={nurBegleitung ? "bg-emerald-600 hover:bg-emerald-700" : ""}
        >
          Aktive Begleitungen
        </Button>
        {nurBegleitung && (
          <span className="text-sm text-slate-500">
            {totalCount} {totalCount === 1 ? "Patient" : "Patienten"} in Betreuung
          </span>
        )}
      </div>

      <PatientTable patients={patients} isLoading={isLoading} error={error} />

      {/* Pagination — only when there are multiple pages */}
      {totalPages > 1 && (
        <div className="mt-6 flex justify-center">
          <Pagination>
            <PaginationContent>
              <PaginationItem>
                <PaginationPrevious
                  href="#"
                  onClick={(e) => {
                    e.preventDefault()
                    if (page > 1) setPage((p) => p - 1)
                  }}
                  aria-disabled={page <= 1}
                  className={page <= 1 ? "pointer-events-none opacity-50" : ""}
                />
              </PaginationItem>

              {Array.from({ length: totalPages }, (_, i) => i + 1).map((p) => (
                <PaginationItem key={p}>
                  <PaginationLink
                    href="#"
                    isActive={p === page}
                    onClick={(e) => {
                      e.preventDefault()
                      setPage(p)
                    }}
                  >
                    {p}
                  </PaginationLink>
                </PaginationItem>
              ))}

              <PaginationItem>
                <PaginationNext
                  href="#"
                  onClick={(e) => {
                    e.preventDefault()
                    if (page < totalPages) setPage((p) => p + 1)
                  }}
                  aria-disabled={page >= totalPages}
                  className={page >= totalPages ? "pointer-events-none opacity-50" : ""}
                />
              </PaginationItem>
            </PaginationContent>
          </Pagination>
        </div>
      )}

      {/* Results count */}
      {!isLoading && !error && (
        <p className="text-center text-sm text-muted-foreground mt-4">
          {totalCount === 0
            ? "Keine Patienten gefunden"
            : `${totalCount} Patient${totalCount !== 1 ? "en" : ""} gefunden`}
        </p>
      )}
    </div>
  )
}
