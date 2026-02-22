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
    <Card className="bg-white/80 backdrop-blur-sm border-slate-200/60 rounded-2xl shadow-sm">
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
      <Card className="bg-white/80 backdrop-blur-sm border-slate-200/60 rounded-2xl shadow-sm">
        <CardContent className="py-12 text-center text-destructive">
          {error}
        </CardContent>
      </Card>
    )
  }

  if (courses.length === 0) {
    return (
      <Card className="bg-white/80 backdrop-blur-sm border-slate-200/60 rounded-2xl shadow-sm">
        <CardContent className="py-16 text-center">
          <div className="rounded-full bg-emerald-100 p-5 mb-4 mx-auto w-fit">
            <GraduationCap className="h-10 w-10 text-emerald-600" />
          </div>
          <h3 className="font-semibold text-lg mb-1">Keine Kurse gefunden</h3>
          <p className="text-slate-500 mb-6">
            Erstelle deinen ersten Online-Kurs für Gruppen-Therapie.
          </p>
          <Button onClick={onNewCourse} className="bg-gradient-to-r from-emerald-500 to-teal-500 hover:from-emerald-600 hover:to-teal-600 text-white border-0 shadow-sm">
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
