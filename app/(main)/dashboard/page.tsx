"use client"

import { useState, useEffect } from "react"
import Link from "next/link"
import { CourseCard } from "@/components/course/CourseCard"
import { useLanguage } from "@/context/LanguageContext"
import { Loader2 } from "lucide-react"

export default function DashboardPage() {
  const { t, language } = useLanguage()
  const [stats, setStats] = useState<any>(null)
  const [recommendedCourses, setRecommendedCourses] = useState<any[]>([])
  const [myProgress, setMyProgress] = useState<any[]>([])
  const [isLoading, setIsLoading] = useState(true)

  useEffect(() => {
    async function fetchDashboard() {
      try {
        const res = await fetch('/api/dashboard')
        const data = await res.json()
        setStats(data.stats)
        setRecommendedCourses(data.recommended || [])
        setMyProgress(data.progress || [])
      } catch (e) {
        console.error(e)
      } finally {
        setIsLoading(false)
      }
    }
    fetchDashboard()
  }, [])

  const getTranslatedTitle = (title: string, field: string) => {
    const key = `course.${field}_title`
    const translated = t(key)
    return translated === key ? title : translated
  }

  if (isLoading) return <div className="flex justify-center p-12"><Loader2 className="animate-spin text-blue-600" /></div>

  return (
    <div className="space-y-8 animate-fade-up">
      {/* Welcome Section - Reverted to Original Style */}
      <div className="bg-gradient-to-br from-blue-600 to-blue-800 rounded-3xl p-8 lg:p-12 text-white shadow-lg relative overflow-hidden">
        <div className="relative z-10 flex flex-col md:flex-row md:items-center justify-between gap-6">
          <div>
            <h1 className="text-3xl lg:text-4xl font-display font-bold mb-2 text-white">
              {t('dashboard.welcome')}, 👋
            </h1>
            <p className="text-blue-100 font-medium opacity-90">
              {language === 'vi' 
                ? "Hôm nay là một ngày tuyệt vời để nâng cấp kỹ năng và đột phá giới hạn của bản thân."
                : "Today is a great day to upgrade your skills and break your limits."}
            </p>
          </div>
          
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
             <StatCard icon="fa-solid fa-users" value={stats?.totalUsers || 0} label={t('dashboard.stats_users')} />
             <StatCard icon="fa-solid fa-graduation-cap" value={stats?.activeCourses || 0} label={t('dashboard.stats_courses')} />
             <StatCard icon="fa-solid fa-fire" value={stats?.streak || 0} label={t('dashboard.stats_streak')} />
             <StatCard icon="fa-solid fa-clock" value={stats?.learningMinutes || 0} label={t('dashboard.stats_minutes')} />
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Left: My Learning Path */}
        <div className="lg:col-span-2 space-y-6">
          <div className="flex items-center justify-between">
            <h2 className="text-xl font-display font-bold text-slate-900 flex items-center gap-2">
              <i className="fa-solid fa-book-open-reader text-blue-600"></i> {t('dashboard.my_learning')}
            </h2>
            <Link href="/my-courses" className="text-sm font-bold text-blue-600 hover:underline">
              {t('dashboard.view_all')} →
            </Link>
          </div>

          <div className="space-y-4">
            {myProgress?.length > 0 ? myProgress.map((p) => (
              <div key={p.id} className="bg-white border border-[#E2EAF4] rounded-2xl p-5 flex flex-col md:flex-row md:items-center gap-6 shadow-sm hover:shadow-md transition-all">
                <div className="w-16 h-16 rounded-xl bg-slate-50 flex items-center justify-center text-3xl">📚</div>
                <div className="flex-1 min-w-0">
                  <h3 className="font-display font-bold text-slate-900 mb-1 truncate">
                    {getTranslatedTitle(p.course.title, p.course.field)}
                  </h3>
                  <div className="flex items-center gap-4 text-[11px] font-bold text-slate-400 mb-3">
                    <span className="flex items-center gap-1.5"><i className="fa-solid fa-play-circle text-blue-500"></i> {p.course.lessons?.length || 0} {t('common.lessons')}</span>
                    <span className="flex items-center gap-1.5"><i className="fa-solid fa-check-circle text-emerald-500"></i> {p.completedLessons?.length || 0} {t('common.completed_count')}</span>
                  </div>
                  <div className="relative w-full h-1.5 bg-slate-100 rounded-full overflow-hidden">
                    <div className="absolute top-0 left-0 h-full bg-blue-600 rounded-full transition-all duration-1000" style={{ width: `${p.percentComplete}%` }} />
                  </div>
                </div>
                <Link 
                  href={`/course/${p.course.slug}`}
                  className="shrink-0 px-6 py-2.5 rounded-xl bg-blue-50 text-blue-700 font-bold text-sm hover:bg-blue-100 transition-all border border-blue-200"
                >
                  {t('dashboard.continue')} <i className="fa-solid fa-play ml-1"></i>
                </Link>
              </div>
            )) : (
              <div className="bg-white border border-dashed border-[#E2EAF4] rounded-2xl p-10 text-center">
                <p className="text-slate-400 font-bold italic">{t('dashboard.no_courses')}</p>
              </div>
            )}
          </div>
        </div>

        {/* Right: Recommended */}
        <div className="space-y-6">
          <h2 className="text-xl font-display font-bold text-slate-900 flex items-center gap-2">
            <i className="fa-solid fa-wand-magic-sparkles text-purple-600"></i> {t('dashboard.recommended')}
          </h2>
          <div className="space-y-4">
            {recommendedCourses?.map((course) => (
              <CourseCard key={course.id} course={course} compact />
            ))}
          </div>
        </div>
      </div>
    </div>
  )
}

function StatCard({ icon, value, label }: { icon: string, value: number | string, label: string }) {
  return (
    <div className="bg-white/10 backdrop-blur-md rounded-2xl p-4 border border-white/10 flex flex-col items-center min-w-[110px]">
      <div className="w-9 h-9 rounded-lg bg-white/20 flex items-center justify-center mb-2">
        <i className={`${icon} text-white`}></i>
      </div>
      <div className="text-lg font-bold text-white">{value}</div>
      <div className="text-[10px] font-bold text-blue-100 uppercase tracking-wider text-center opacity-80">{label}</div>
    </div>
  )
}
