"use client"

import Link from "next/link"
import { Card, CardContent } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { MoreHorizontal, BookOpen, Users, Archive, Trash2 } from "lucide-react"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { KATEGORIE_LABELS, STATUS_LABELS } from "@/types/course"
import type { CourseListItem } from "@/types/course"

interface KursKarteProps {
  course: CourseListItem
  onArchive: (course: CourseListItem) => void
  onDelete: (course: CourseListItem) => void
}

const statusColors: Record<string, string> = {
  entwurf: "bg-yellow-100 text-yellow-800 dark:bg-yellow-900/30 dark:text-yellow-400",
  aktiv: "bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-400",
  archiviert: "bg-gray-100 text-gray-600 dark:bg-gray-800 dark:text-gray-400",
}

export function KursKarte({ course, onArchive, onDelete }: KursKarteProps) {
  return (
    <Card className="group relative hover:shadow-md transition-shadow">
      <CardContent className="p-5">
        {/* Top row: Status + Menu */}
        <div className="flex items-start justify-between mb-3">
          <Badge variant="secondary" className={statusColors[course.status] ?? ""}>
            {STATUS_LABELS[course.status]}
          </Badge>
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="ghost" size="icon" className="h-8 w-8 -mt-1 -mr-2">
                <MoreHorizontal className="h-4 w-4" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end">
              {course.status !== "archiviert" && (
                <DropdownMenuItem onClick={() => onArchive(course)}>
                  <Archive className="mr-2 h-4 w-4" />
                  Archivieren
                </DropdownMenuItem>
              )}
              <DropdownMenuItem
                onClick={() => onDelete(course)}
                className="text-destructive focus:text-destructive"
              >
                <Trash2 className="mr-2 h-4 w-4" />
                Löschen
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>

        {/* Title + Description */}
        <Link href={`/os/courses/${course.id}`} className="block">
          <h3 className="font-semibold text-lg leading-tight mb-1 group-hover:text-primary transition-colors line-clamp-2">
            {course.name}
          </h3>
          {course.beschreibung && (
            <p className="text-sm text-muted-foreground line-clamp-2 mb-3">
              {course.beschreibung}
            </p>
          )}
        </Link>

        {/* Kategorie */}
        <Badge variant="outline" className="mb-3 text-xs">
          {KATEGORIE_LABELS[course.kategorie]}
        </Badge>

        {/* Meta row */}
        <div className="flex items-center gap-4 text-sm text-muted-foreground mt-auto pt-2 border-t">
          <span className="flex items-center gap-1.5">
            <BookOpen className="h-3.5 w-3.5" />
            {course.lesson_count} {course.lesson_count === 1 ? "Lektion" : "Lektionen"}
          </span>
          <span className="flex items-center gap-1.5">
            <Users className="h-3.5 w-3.5" />
            {course.enrollment_count} {course.enrollment_count === 1 ? "Teilnehmer" : "Teilnehmer"}
          </span>
          {course.version > 0 && (
            <span className="ml-auto text-xs">v{course.version}</span>
          )}
        </div>
      </CardContent>
    </Card>
  )
}
