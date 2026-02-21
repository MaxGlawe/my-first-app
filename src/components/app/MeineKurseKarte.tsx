"use client"

import { useState, useEffect } from "react"
import Link from "next/link"
import { GraduationCap, ChevronRight } from "lucide-react"
import { KATEGORIE_LABELS } from "@/types/course"
import type { CourseKategorie } from "@/types/course"

interface PatientCourse {
  enrollment_id: string
  course_name: string
  kategorie: CourseKategorie
  progress_percent: number
  completed_count: number
  total_count: number
}

export function MeineKurseKarte() {
  const [courses, setCourses] = useState<PatientCourse[]>([])
  const [isLoading, setIsLoading] = useState(true)

  useEffect(() => {
    fetch("/api/me/courses")
      .then((res) => res.json())
      .then((json) => setCourses(json.courses ?? []))
      .catch(() => {})
      .finally(() => setIsLoading(false))
  }, [])

  if (isLoading) {
    return (
      <div className="rounded-2xl bg-white border border-slate-200 shadow-sm p-5">
        <div className="flex items-center gap-2 mb-3">
          <GraduationCap className="h-5 w-5 text-emerald-600" />
          <h3 className="font-semibold">Meine Kurse</h3>
        </div>
        <div className="space-y-2">
          <div className="h-12 bg-slate-100 rounded-lg animate-pulse" />
          <div className="h-12 bg-slate-100 rounded-lg animate-pulse" />
        </div>
      </div>
    )
  }

  if (courses.length === 0) return null

  return (
    <div className="rounded-2xl bg-white border border-slate-200 shadow-sm p-5">
      <div className="flex items-center justify-between mb-3">
        <div className="flex items-center gap-2">
          <GraduationCap className="h-5 w-5 text-emerald-600" />
          <h3 className="font-semibold">Meine Kurse</h3>
        </div>
        <Link
          href="/app/courses"
          className="text-sm text-emerald-600 font-medium hover:underline"
        >
          Alle anzeigen
        </Link>
      </div>

      <div className="space-y-2">
        {courses.slice(0, 3).map((course) => (
          <Link
            key={course.enrollment_id}
            href={`/app/courses/${course.enrollment_id}`}
            className="flex items-center gap-3 p-3 rounded-xl bg-slate-50 hover:bg-slate-100 transition-colors"
          >
            <div className="flex-1 min-w-0">
              <p className="text-sm font-medium truncate">{course.course_name}</p>
              <p className="text-xs text-slate-500">
                {KATEGORIE_LABELS[course.kategorie]} · {course.completed_count}/{course.total_count} Lektionen
              </p>
            </div>

            {/* Progress ring */}
            <div className="relative h-10 w-10 shrink-0">
              <svg className="h-10 w-10 -rotate-90" viewBox="0 0 36 36">
                <path
                  d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831"
                  fill="none"
                  stroke="#e2e8f0"
                  strokeWidth="3"
                />
                <path
                  d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831"
                  fill="none"
                  stroke="#10b981"
                  strokeWidth="3"
                  strokeDasharray={`${course.progress_percent}, 100`}
                  strokeLinecap="round"
                />
              </svg>
              <span className="absolute inset-0 flex items-center justify-center text-[10px] font-bold text-emerald-600">
                {course.progress_percent}%
              </span>
            </div>

            <ChevronRight className="h-4 w-4 text-slate-400 shrink-0" />
          </Link>
        ))}
      </div>
    </div>
  )
}
