"use client"

import { useState, useEffect } from "react"
import { CourseCard } from "@/components/course/CourseCard"
import { Compass, Loader2 } from "lucide-react"
import { useLanguage } from "@/context/LanguageContext"

export default function ExplorePage() {
  const { t } = useLanguage()
  const [allCourses, setAllCourses] = useState<any[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [filter, setFilter] = useState("all")

  useEffect(() => {
    async function fetchCourses() {
      try {
        const res = await fetch('/api/courses')
        const data = await res.json()
        setAllCourses(data)
      } catch (e) {
        console.error(e)
      } finally {
        setIsLoading(false)
      }
    }
    fetchCourses()
  }, [])

  const filteredCourses = filter === "all" 
    ? allCourses 
    : allCourses.filter(c => c.field === filter)

  const filters = [
    { key: "all", label: t('explore.all') },
    { key: "management", label: t('field.management') },
    { key: "softskills", label: t('field.softskills') },
    { key: "it", label: t('field.it') },
    { key: "marketing", label: t('field.marketing') },
  ]

  return (
    <div className="animate-fade-up">
      <div className="flex items-center gap-3 mb-8">
        <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-blue-600 to-cyan-500 flex items-center justify-center shadow-md">
          <Compass className="text-white" size={24} />
        </div>
        <div>
          <h1 className="text-2xl font-display font-bold text-slate-900">{t('explore.title')}</h1>
          <p className="text-sm text-slate-500 font-medium">{t('explore.desc')}</p>
        </div>
      </div>

      <div className="flex flex-wrap items-center gap-2 mb-8">
        {filters.map((f) => (
          <button
            key={f.key}
            onClick={() => setFilter(f.key)}
            className={`px-5 py-2.5 rounded-full text-sm font-bold transition-all duration-200 ${
              filter === f.key 
                ? 'bg-blue-600 text-white shadow-lg shadow-blue-200 -translate-y-0.5' 
                : 'bg-white text-slate-600 border border-[#E2EAF4] hover:border-blue-300 hover:bg-blue-50'
            }`}
          >
            {f.label}
          </button>
        ))}
      </div>

      {isLoading ? (
        <div className="flex justify-center p-12"><Loader2 className="animate-spin text-blue-600" /></div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
          {filteredCourses.map((course: any) => (
            <CourseCard key={course.id} course={course} />
          ))}
          {filteredCourses.length === 0 && (
             <p className="text-slate-400 italic text-sm col-span-full py-12 text-center bg-white rounded-3xl border border-dashed border-slate-200">
               {t('dashboard.no_courses')}
             </p>
          )}
        </div>
      )}
    </div>
  )
}
