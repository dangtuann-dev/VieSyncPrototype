"use client"

import { useState, useEffect } from "react"
import { BookOpen, PlayCircle, Compass, Loader2 } from "lucide-react"
import Link from "next/link"
import { useLanguage } from "@/context/LanguageContext"

export default function MyCoursesPage() {
  const { t } = useLanguage()
  const [inProgress, setInProgress] = useState<any[]>([])
  const [isLoading, setIsLoading] = useState(true)

  useEffect(() => {
    async function fetchMyCourses() {
      try {
        const res = await fetch('/api/my-courses')
        const data = await res.json()
        setInProgress(data)
      } catch (e) {
        console.error(e)
      } finally {
        setIsLoading(false)
      }
    }
    fetchMyCourses()
  }, [])

  const getTranslatedTitle = (title: string) => {
    if (!title) return ""
    const key = `course.${title}_title`
    const translated = t(key)
    return translated === key ? title : translated
  }

  const getTranslatedDesc = (desc: string) => {
    if (!desc) return ""
    const key = `course.${desc.substring(0, 20)}_desc`
    const translated = t(key)
    return translated === key ? desc : translated
  }

  return (
    <div className="animate-fade-up">
      <div className="flex items-center gap-3 mb-8">
        <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-blue-600 to-cyan-500 flex items-center justify-center shadow-md">
          <BookOpen className="text-white" size={24} />
        </div>
        <div>
          <h1 className="text-2xl font-display font-bold text-slate-900">{t('mycourses.title')}</h1>
          <p className="text-sm text-slate-500 font-medium">{t('mycourses.desc')}</p>
        </div>
      </div>

      <div className="flex border-b border-[#E2EAF4] mb-8">
        <button className="px-6 py-3 border-b-2 border-blue-600 text-blue-700 font-bold text-sm">
          {t('mycourses.learning')} ({inProgress.length})
        </button>
        <button className="px-6 py-3 text-slate-500 font-medium text-sm hover:text-slate-800 transition-colors">
          {t('mycourses.completed')} (0)
        </button>
      </div>

      {isLoading ? (
        <div className="flex justify-center p-12"><Loader2 className="animate-spin text-blue-600" /></div>
      ) : inProgress.length > 0 ? (
        <div className="space-y-4">
          {inProgress.map((course: any) => (
            <div key={course.id} className="bg-white border border-[#E2EAF4] rounded-2xl p-5 flex flex-col md:flex-row md:items-center gap-6 shadow-sm hover:shadow-md transition-all">
              <div className="w-full md:w-48 h-32 bg-slate-50 rounded-xl flex-shrink-0 flex items-center justify-center border border-slate-100">
                <span className="text-4xl">📚</span>
              </div>
              <div className="flex-1 min-w-0">
                <h3 className="font-display font-bold text-lg text-slate-900 mb-1">
                  {getTranslatedTitle(course.title)}
                </h3>
                <p className="text-sm text-slate-500 mb-4 line-clamp-1">
                  {getTranslatedDesc(course.description)}
                </p>
                <div className="max-w-md">
                  <div className="flex justify-between text-xs mb-1.5 font-medium">
                    <span className="text-slate-500">{t('common.lessons')} {course.completedCount + 1} / {course.totalCount}</span>
                    <span className="text-blue-600 font-bold">{Math.round(course.progress)}%</span>
                  </div>
                  <div className="w-full bg-[#E2EAF4] rounded-full h-1.5 overflow-hidden">
                    <div className="h-full bg-blue-600 rounded-full transition-all duration-700" style={{ width: `${course.progress}%` }} />
                  </div>
                </div>
              </div>
              <Link
                href={`/course/${course.slug}`}
                className="shrink-0 flex items-center gap-2 px-6 py-3 rounded-xl bg-blue-50 text-blue-700 hover:bg-blue-100 font-bold text-sm transition-all border border-blue-200 hover:border-blue-300"
              >
                {t('dashboard.continue')} <PlayCircle size={16} />
              </Link>
            </div>
          ))}
        </div>
      ) : (
        <div className="bg-white border border-dashed border-[#E2EAF4] rounded-2xl p-12 text-center shadow-sm">
          <div className="w-20 h-20 rounded-2xl bg-blue-50 flex items-center justify-center mx-auto mb-4 text-4xl">🤔</div>
          <h3 className="text-xl font-display font-bold text-slate-900 mb-2">{t('mycourses.empty')}</h3>
          <p className="text-slate-500 text-sm mb-8 max-w-sm mx-auto">{t('mycourses.empty_desc')}</p>
          <Link href="/explore" className="inline-flex items-center gap-2 px-8 py-3.5 rounded-xl bg-blue-600 text-white font-bold text-sm hover:bg-blue-700 transition-all shadow-lg shadow-blue-200">
            {t('explore.title')} <Compass size={16} />
          </Link>
        </div>
      )}
    </div>
  )
}
