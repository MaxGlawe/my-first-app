"use client"

import { Card, CardContent } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Skeleton } from "@/components/ui/skeleton"
import { GraduationCap, Plus } from "lucide-react"
import { KursKarte } from "./KursKarte"
import type { CourseListItem } from "@/types/course"

interface KursGridProps {
  courses: CourseListItem[]
  isLoading: boolean
  error: string | null
  onNewCourse: () => void
  onArchive: (course: CourseListItem) => void
  onDelete: (course: CourseListItem) => void
}

function SkeletonCard() {
  return (
    <Card>
      <CardContent className="p-5 space-y-3">
        <Skeleton className="h-5 w-16" />
        <Skeleton className="h-6 w-3/4" />
        <Skeleton className="h-4 w-full" />
        <Skeleton className="h-4 w-1/2" />
        <div className="flex gap-4 pt-2 border-t">
          <Skeleton className="h-4 w-20" />
          <Skeleton className="h-4 w-24" />
        </div>
      </CardContent>
    </Card>
  )
}

export function KursGrid({
  courses,
  isLoading,
  error,
  onNewCourse,
  onArchive,
  onDelete,
}: KursGridProps) {
  if (isLoading) {
    return (
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {Array.from({ length: 6 }).map((_, i) => (
          <SkeletonCard key={i} />
        ))}
      </div>
    )
  }

  if (error) {
    return (
      <Card>
        <CardContent className="py-12 text-center text-destructive">
          {error}
        </CardContent>
      </Card>
    )
  }

  if (courses.length === 0) {
    return (
      <Card>
        <CardContent className="py-16 text-center">
          <GraduationCap className="mx-auto h-12 w-12 text-muted-foreground/50 mb-4" />
          <h3 className="font-semibold text-lg mb-1">Keine Kurse gefunden</h3>
          <p className="text-muted-foreground mb-6">
            Erstelle deinen ersten Online-Kurs für Gruppen-Therapie.
          </p>
          <Button onClick={onNewCourse}>
            <Plus className="mr-2 h-4 w-4" />
            Neuen Kurs erstellen
          </Button>
        </CardContent>
      </Card>
    )
  }

  return (
    <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
      {courses.map((course) => (
        <KursKarte
          key={course.id}
          course={course}
          onArchive={onArchive}
          onDelete={onDelete}
        />
      ))}
    </div>
  )
}
