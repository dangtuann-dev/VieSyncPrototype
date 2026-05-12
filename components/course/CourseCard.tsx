"use client"

import Link from "next/link"
import { useLanguage } from "@/context/LanguageContext"

export const fieldColor: Record<string, string> = {
  management: "bg-blue-500",
  softskills: "bg-emerald-500",
  it: "bg-purple-500",
  marketing: "bg-orange-500"
}

export function CourseCard({ course, compact = false }: { course: any; compact?: boolean }) {
  const { t } = useLanguage()
  const colorClass = fieldColor[course.field] || "bg-slate-500"

  const getTranslatedTitle = (title: string) => {
    const key = `course.${title}_title`
    const translated = t(key)
    return translated === key ? title : translated
  }

  const getTranslatedDesc = (desc: string) => {
    const key = `course.${desc.substring(0, 20)}_desc`
    const translated = t(key)
    return translated === key ? desc : translated
  }

  const lessonCount = course.lessons?.length || 0

  if (compact) {
    return (
      <Link href={`/course/${course.slug}`} className="group flex items-center gap-4 bg-white border border-[#E2EAF4] p-3 rounded-xl hover:shadow-md hover:border-blue-200 transition-all">
        <div className={`w-10 h-10 rounded-lg ${colorClass} flex items-center justify-center text-white shrink-0`}>
          <i className="fa-solid fa-graduation-cap text-sm"></i>
        </div>
        <div className="min-w-0">
          <h4 className="font-bold text-xs text-slate-900 truncate group-hover:text-blue-600 transition-colors">
            {getTranslatedTitle(course.title)}
          </h4>
          <p className="text-[10px] font-medium text-slate-400 mt-0.5">
             <i className="fa-solid fa-list-ul mr-1"></i> {lessonCount} {t('common.lessons')}
          </p>
        </div>
      </Link>
    )
  }

  return (
    <Link href={`/course/${course.slug}`} className="group block bg-white border border-[#E2EAF4] rounded-2xl overflow-hidden hover:shadow-lg hover:border-blue-200 hover:-translate-y-1 transition-all duration-250">
      <div className={`h-2 w-full ${colorClass}`} />

      <div className="p-5">
        <span className="text-[10px] font-bold text-blue-700 bg-blue-50 border border-blue-100 px-2.5 py-1 rounded-full uppercase tracking-wider">
          {t(`field.${course.field}`)}
        </span>

        <h3 className="font-display font-bold text-slate-900 text-base mt-3 mb-2 leading-snug group-hover:text-blue-700 transition-colors">
          {getTranslatedTitle(course.title)}
        </h3>

        <p className="text-xs text-slate-500 mb-4 line-clamp-2 leading-relaxed">
          {getTranslatedDesc(course.description)}
        </p>

        <div className="flex items-center gap-4 text-[10px] font-bold text-slate-400 border-t border-[#F1F5FD] pt-4 uppercase">
          <span className="flex items-center gap-1.5"><i className="fa-solid fa-clock opacity-50"></i> {course.lessons?.reduce((acc: number, l: any) => acc + (l.duration || 0), 0) || 0} {t('common.minutes')}</span>
          <span className="flex items-center gap-1.5"><i className="fa-solid fa-book-bookmark opacity-50"></i> {lessonCount} {t('common.lessons')}</span>
        </div>
      </div>
    </Link>
  )
}
