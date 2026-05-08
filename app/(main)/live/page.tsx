"use client"

import { useState, useEffect } from "react"
import { Video, Calendar, Clock, ExternalLink, Loader2 } from "lucide-react"
import Link from "next/link"
import { useLanguage } from "@/context/LanguageContext"

export default function StudentLivePage() {
  const { t, language } = useLanguage()
  const [sessions, setSessions] = useState<any[]>([])
  const [isLoading, setIsLoading] = useState(true)

  useEffect(() => {
    async function fetchSessions() {
      try {
        const res = await fetch('/api/live-sessions')
        const data = await res.json()
        setSessions(data)
      } catch (e) {
        console.error(e)
      } finally {
        setIsLoading(false)
      }
    }
    fetchSessions()
  }, [])

  const getTranslatedCourseTitle = (title: string, field: string) => {
    const key = `course.${field}_title`
    const translated = t(key)
    return translated === key ? title : translated
  }

  return (
    <div className="animate-fade-up">
      <div className="mb-12 text-center">
        <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-red-50 text-red-600 text-[11px] font-bold uppercase tracking-widest mb-6 border border-red-100 shadow-sm">
          <div className="w-2 h-2 bg-red-500 rounded-full animate-pulse" />
          {t('live.room')}
        </div>
        <h1 className="text-4xl font-display font-bold text-slate-900 mb-4">{t('live.title')}</h1>
        <p className="text-slate-500 max-w-xl mx-auto font-medium">
          {t('live.desc')}
        </p>
      </div>

      <div className="grid gap-8">
        {isLoading ? (
          <div className="flex justify-center p-12"><Loader2 className="animate-spin text-blue-600" /></div>
        ) : sessions.length === 0 ? (
          <div className="bg-white border border-dashed border-slate-200 rounded-3xl p-16 text-center">
            <div className="w-20 h-20 bg-slate-50 rounded-2xl flex items-center justify-center mx-auto mb-6">
              <Video className="text-slate-200" size={40} />
            </div>
            <p className="text-slate-400 font-medium italic">{t('dashboard.no_courses')}</p>
          </div>
        ) : (
          sessions.map(session => (
            <div key={session.id} className={`
              bg-white border rounded-3xl p-6 md:p-8 flex flex-col md:flex-row items-center gap-8 transition-all
              ${session.isActive ? 'border-red-500 ring-4 ring-red-50 shadow-2xl' : 'border-[#E2EAF4] hover:border-blue-300 shadow-sm'}
            `}>
              <div className="flex-1 w-full">
                <div className="flex items-center gap-3 mb-5">
                   <span className="text-[10px] font-bold px-3 py-1 rounded-full bg-blue-50 text-blue-700 border border-blue-100 uppercase tracking-wide">
                     {getTranslatedCourseTitle(session.course.title, session.course.field)}
                   </span>
                   {session.isActive && (
                     <span className="flex items-center gap-1.5 text-[10px] font-bold text-red-600 uppercase tracking-widest">
                        <span className="w-2 h-2 bg-red-500 rounded-full animate-ping" />
                        Live Now
                     </span>
                   )}
                </div>
                <h3 className="text-2xl font-display font-bold text-slate-900 mb-5">{session.title}</h3>
                <div className="flex flex-wrap items-center gap-8 text-slate-500">
                   <div className="flex items-center gap-2.5 text-sm font-semibold">
                     <Calendar size={18} className="text-blue-600" />
                     {new Date(session.scheduledAt).toLocaleDateString(language === 'vi' ? 'vi-VN' : 'en-US', { weekday: 'long', day: 'numeric', month: 'numeric' })}
                   </div>
                   <div className="flex items-center gap-2.5 text-sm font-semibold">
                     <Clock size={18} className="text-blue-600" />
                     {new Date(session.scheduledAt).toLocaleTimeString(language === 'vi' ? 'vi-VN' : 'en-US', { hour: '2-digit', minute: '2-digit' })}
                   </div>
                </div>
              </div>

              <div className="shrink-0 w-full md:w-auto">
                {session.isActive ? (
                  <Link 
                    href={`https://meet.jit.si/${session.jitsiRoomId}`}
                    target="_blank"
                    className="flex items-center justify-center gap-2 px-10 py-4 bg-red-600 hover:bg-red-700 text-white font-bold rounded-2xl transition-all shadow-xl shadow-red-100 hover:-translate-y-1"
                  >
                    {t('dashboard.start')} <ExternalLink size={20} />
                  </Link>
                ) : (
                  <button disabled className="w-full md:w-auto flex items-center justify-center gap-2 px-10 py-4 bg-slate-50 text-slate-400 font-bold rounded-2xl border border-slate-100 cursor-not-allowed">
                    {t('live.not_started')}
                  </button>
                )}
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  )
}
