"use client"

import Link from "next/link"
import { usePatientCourses } from "@/hooks/use-patient-courses"
import { KATEGORIE_LABELS } from "@/types/course"
import { GraduationCap, ChevronRight, ArrowLeft } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Skeleton } from "@/components/ui/skeleton"

export default function PatientCoursesPage() {
  const { courses, isLoading, error } = usePatientCourses()

  return (
    <div className="container mx-auto py-6 px-4 max-w-lg space-y-6">
      {/* Header */}
      <div className="flex items-center gap-3">
        <Link href="/app/dashboard">
          <Button variant="ghost" size="icon" className="h-9 w-9">
            <ArrowLeft className="h-4 w-4" />
          </Button>
        </Link>
        <h1 className="text-2xl font-bold text-slate-800">Meine Kurse</h1>
      </div>

      {isLoading && (
        <div className="space-y-3">
          <Skeleton className="h-24 w-full rounded-2xl" />
          <Skeleton className="h-24 w-full rounded-2xl" />
          <Skeleton className="h-24 w-full rounded-2xl" />
        </div>
      )}

      {error && (
        <div className="rounded-2xl bg-white border border-red-200 shadow-sm p-5 text-center">
          <p className="text-sm text-red-600">{error}</p>
        </div>
      )}

      {!isLoading && !error && courses.length === 0 && (
        <div className="rounded-2xl bg-white border border-slate-200 shadow-sm p-8 text-center">
          <GraduationCap className="mx-auto h-12 w-12 text-slate-300 mb-3" />
          <h3 className="font-semibold text-slate-700 mb-1">Keine Kurse</h3>
          <p className="text-sm text-slate-400">
            Du bist noch in keinem Kurs eingeschrieben.
          </p>
        </div>
      )}

      {!isLoading && !error && courses.length > 0 && (
        <div className="space-y-3">
          {courses.map((course) => (
            <Link
              key={course.enrollment_id}
              href={`/app/courses/${course.enrollment_id}`}
              className="block rounded-2xl bg-white border border-slate-200 shadow-sm p-5 hover:bg-slate-50 transition-colors"
            >
              <div className="flex items-center gap-4">
                {/* Course info */}
                <div className="flex-1 min-w-0">
                  <h3 className="font-semibold text-slate-800 truncate">{course.course_name}</h3>
                  <p className="text-xs text-slate-400 mt-0.5">
                    {KATEGORIE_LABELS[course.kategorie]} · {course.dauer_wochen} Wochen
                  </p>

                  {/* Progress bar */}
                  <div className="mt-3">
                    <div className="flex items-center justify-between text-xs mb-1">
                      <span className="text-slate-500">
                        {course.completed_count} von {course.total_count} Lektionen
                      </span>
                      <span className="font-medium text-emerald-600">
                        {course.progress_percent}%
                      </span>
                    </div>
                    <div className="h-2 bg-slate-100 rounded-full overflow-hidden">
                      <div
                        className="h-full bg-emerald-500 rounded-full transition-all"
                        style={{ width: `${course.progress_percent}%` }}
                      />
                    </div>
                  </div>
                </div>

                <ChevronRight className="h-5 w-5 text-slate-300 shrink-0" />
              </div>
            </Link>
          ))}
        </div>
      )}
    </div>
  )
}
