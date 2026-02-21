"use client"

import { useState, useRef, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Switch } from "@/components/ui/switch"
import { Label } from "@/components/ui/label"
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip"
import { ArrowLeft, Undo2, Eye, Printer, CheckCircle2, Loader2 } from "lucide-react"
import Link from "next/link"

type SaveStatus = "saved" | "saving" | "unsaved"

interface BuilderHeaderProps {
  planName: string
  onNameChange: (name: string) => void
  isTemplate: boolean
  onTemplateToggle: (value: boolean) => void
  saveStatus: SaveStatus
  canUndo: boolean
  onUndo: () => void
  onPreview: () => void
  onPrint: () => void
}

export function BuilderHeader({
  planName,
  onNameChange,
  isTemplate,
  onTemplateToggle,
  saveStatus,
  canUndo,
  onUndo,
  onPreview,
  onPrint,
}: BuilderHeaderProps) {
  const [editing, setEditing] = useState(false)
  const [localName, setLocalName] = useState(planName)
  const inputRef = useRef<HTMLInputElement>(null)

  // Sync if prop changes (e.g. after load)
  useEffect(() => {
    setLocalName(planName)
  }, [planName])

  useEffect(() => {
    if (editing && inputRef.current) {
      inputRef.current.focus()
      inputRef.current.select()
    }
  }, [editing])

  function commitName() {
    setEditing(false)
    const trimmed = localName.trim()
    if (trimmed && trimmed !== planName) {
      onNameChange(trimmed)
    } else {
      setLocalName(planName)
    }
  }

  return (
    <header className="sticky top-0 z-10 bg-background border-b px-4 py-3 flex items-center gap-3">
      {/* Back */}
      <Link href="/os/training-plans">
        <Button variant="ghost" size="icon" aria-label="Zurück">
          <ArrowLeft className="h-4 w-4" />
        </Button>
      </Link>

      {/* Plan name — inline editable */}
      <div className="flex-1 min-w-0">
        {editing ? (
          <input
            ref={inputRef}
            value={localName}
            onChange={(e) => setLocalName(e.target.value)}
            onBlur={commitName}
            onKeyDown={(e) => {
              if (e.key === "Enter") commitName()
              if (e.key === "Escape") {
                setLocalName(planName)
                setEditing(false)
              }
            }}
            className="w-full bg-transparent text-xl font-bold tracking-tight border-b border-primary focus:outline-none py-0.5 truncate"
            maxLength={200}
            aria-label="Plan-Name bearbeiten"
          />
        ) : (
          <button
            onClick={() => setEditing(true)}
            className="text-xl font-bold tracking-tight truncate hover:underline decoration-dashed underline-offset-4 text-left w-full"
            title="Klicken zum Bearbeiten"
          >
            {planName || "Unbenannter Plan"}
          </button>
        )}
      </div>

      {/* Save status */}
      <div className="flex items-center gap-1.5 text-sm shrink-0">
        {saveStatus === "saving" && (
          <>
            <Loader2 className="h-3.5 w-3.5 animate-spin text-muted-foreground" />
            <span className="text-muted-foreground hidden sm:inline">Speichert...</span>
          </>
        )}
        {saveStatus === "saved" && (
          <>
            <CheckCircle2 className="h-3.5 w-3.5 text-green-500" />
            <span className="text-muted-foreground hidden sm:inline">Gespeichert</span>
          </>
        )}
        {saveStatus === "unsaved" && (
          <span className="text-amber-600 hidden sm:inline">Nicht gespeichert</span>
        )}
      </div>

      {/* Undo */}
      <TooltipProvider>
        <Tooltip>
          <TooltipTrigger asChild>
            <Button
              variant="ghost"
              size="icon"
              onClick={onUndo}
              disabled={!canUndo}
              aria-label="Rückgängig"
            >
              <Undo2 className="h-4 w-4" />
            </Button>
          </TooltipTrigger>
          <TooltipContent>Rückgängig (Ctrl+Z)</TooltipContent>
        </Tooltip>
      </TooltipProvider>

      {/* Print */}
      <TooltipProvider>
        <Tooltip>
          <TooltipTrigger asChild>
            <Button variant="ghost" size="icon" onClick={onPrint} aria-label="Plan drucken">
              <Printer className="h-4 w-4" />
            </Button>
          </TooltipTrigger>
          <TooltipContent>Plan drucken</TooltipContent>
        </Tooltip>
      </TooltipProvider>

      {/* Preview — BUG-10 FIX: always visible; text hidden on very small screens */}
      <Button variant="outline" size="sm" onClick={onPreview} className="gap-2 flex">
        <Eye className="h-4 w-4" />
        <span className="hidden sm:inline">Patienten-Ansicht</span>
      </Button>

      {/* Template toggle */}
      <div className="flex items-center gap-2 shrink-0">
        <Switch
          id="template-toggle"
          checked={isTemplate}
          onCheckedChange={onTemplateToggle}
          aria-label="Als Template markieren"
        />
        <Label htmlFor="template-toggle" className="text-sm hidden md:inline cursor-pointer">
          Template
        </Label>
      </div>
    </header>
  )
}
