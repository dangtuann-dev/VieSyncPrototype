"use client"

import { useState, useEffect } from "react"
import { useParams } from "next/navigation"
import Link from "next/link"
import { ChevronLeft, Check, Lock, Info, Loader2 } from "lucide-react"
import { SecuredVideoPlayer } from "@/components/course/VideoPlayer"
import { ChatBot } from "@/components/course/ChatBot"
import { completeLessonAction } from "@/lib/actions/course"
import { useLanguage } from "@/context/LanguageContext"
import { toast } from "sonner"

export default function CoursePage() {
  const params = useParams()
  const slug = params?.slug as string
  const { t, language } = useLanguage()
  
  const [course, setCourse] = useState<any>(null)
  const [user, setUser] = useState<{ email: string; name: string } | null>(null)
  const [progress, setProgress] = useState({ completedLessons: [] as string[], percentComplete: 0 })
  const [activeTab, setActiveTab] = useState<'lessons' | 'live'>('lessons')
  const [selectedLesson, setSelectedLesson] = useState<any>(null)
  const [isLoading, setIsLoading] = useState(true)
  const [isCompleting, setIsCompleting] = useState(false)

  const fetchData = async () => {
    if (!slug) return
    try {
      const res = await fetch(`/api/course/${slug}`)
      if (res.ok) {
        const data = await res.json()
        setCourse(data.course)
        setUser(data.user)
        setProgress(data.progress || { completedLessons: [], percentComplete: 0 })
        
        // Auto select first uncompleted lesson if none selected
        if (!selectedLesson) {
          const uncompleted = data.course.lessons.filter((l: any) => !(data.progress?.completedLessons || []).includes(l.id))
          setSelectedLesson(uncompleted[0] || data.course.lessons[0])
        }
      }
    } catch (e) {
      console.error(e)
    } finally {
      setIsLoading(false)
    }
  }

  useEffect(() => {
    fetchData()
  }, [slug])

  const isCompleted = (id: string) => progress.completedLessons.includes(id)
  
  const isLocked = (index: number) => {
    if (index === 0) return false
    return !isCompleted(course.lessons[index - 1].id)
  }

  const handleComplete = async (courseId: string, lessonId: string) => {
    setIsCompleting(true)
    try {
      const res = await completeLessonAction(courseId, lessonId)
      if (res.success) {
        toast.success(t('course.completed'))
        await fetchData()
      } else {
        toast.error(res.error || "Failed to update progress")
      }
    } catch {
      toast.error("An unexpected error occurred")
    } finally {
      setIsCompleting(false)
    }
  }

  const getTranslatedTitle = (title: string, prefix = 'course') => {
    if (!title) return ""
    const key = `${prefix}.${title}_title`
    const translated = t(key)
    return translated === key ? title : translated
  }

  const getTranslatedLine = (line: string) => {
    const key = `lesson.${line.trim()}`
    const translated = t(key)
    return translated === key ? line : translated
  }

  if (isLoading) return <div className="flex h-screen items-center justify-center bg-white"><Loader2 className="animate-spin text-blue-600" /></div>
  if (!course) return <div className="p-20 text-center">Course not found</div>

  const activeLesson = selectedLesson || course.lessons[0]
  const activeIndex = course.lessons.findIndex((l: any) => l.id === activeLesson?.id)

  return (
    <div className="flex flex-col lg:flex-row lg:h-screen bg-[#F8FAFF] overflow-y-auto lg:overflow-hidden">
      {/* Mobile Sticky Header */}
      <div className="lg:hidden sticky top-0 z-50 bg-white/80 backdrop-blur-md border-b border-[#E2EAF4] px-4 py-3 flex items-center justify-between">
        <Link href="/dashboard" className="flex items-center gap-2 text-slate-900 font-bold">
          <ChevronLeft size={20} className="text-blue-600" />
          <span className="text-sm">VieSync</span>
        </Link>
        <div className="text-[10px] font-bold px-2 py-1 bg-blue-50 text-blue-600 rounded-full uppercase tracking-wider">
          {t('course.learning_status')}
        </div>
      </div>

      {/* Video area - Top on mobile */}
      <main className="flex-1 flex flex-col min-w-0 bg-black overflow-hidden lg:h-full lg:order-2">
        <div className="w-full aspect-video relative bg-black flex-shrink-0">
          <SecuredVideoPlayer
            youtubeId={activeLesson?.youtubeVideoId || "dQw4w9WgXcQ"}
            userEmail={user?.email || "student@viesync.com"}
            userName={user?.name || "Student"}
          />
        </div>
        <div className="flex-1 overflow-y-auto bg-white p-6 lg:p-12 border-t border-[#E2EAF4]">
          <div className="max-w-4xl">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-lg bg-blue-50 text-blue-600 text-[10px] font-black uppercase tracking-widest mb-4">
              {t('course.lesson')} {activeIndex + 1} · {activeLesson?.duration || 0} mins
            </div>
            <h1 className="text-2xl lg:text-3xl font-display font-black text-slate-900 mb-4 tracking-tight">
              {getTranslatedTitle(activeLesson?.title, 'lesson')}
            </h1>
            
            {activeLesson?.transcript && (
              <div className="mb-10 p-6 lg:p-8 bg-slate-50 rounded-[2rem] border border-slate-100 shadow-inner">
                <h4 className="text-xs font-black text-slate-400 mb-6 flex items-center gap-2 uppercase tracking-widest">
                  <Info size={16} className="text-blue-500" /> {t('course.summary')}
                </h4>
                <div className="text-sm text-slate-600 space-y-4 font-medium leading-relaxed">
                  {activeLesson.transcript.split('\n').map((line: string, i: number) => (
                    <p key={i} className="flex items-start gap-3">
                       <span className="w-1.5 h-1.5 rounded-full bg-blue-400 mt-1.5 shrink-0" />
                       {getTranslatedLine(line)}
                    </p>
                  ))}
                </div>
              </div>
            )}

            {!isCompleted(activeLesson?.id) ? (
              <button 
                onClick={() => handleComplete(course.id, activeLesson.id)}
                disabled={isCompleting}
                className="bg-blue-600 hover:bg-blue-700 text-white font-black text-xs px-10 py-4 rounded-2xl shadow-xl shadow-blue-100 hover:-translate-y-1 transition-all duration-300 flex items-center gap-2 disabled:opacity-50"
              >
                {isCompleting ? <Loader2 className="animate-spin" size={18} /> : <Check size={18} strokeWidth={3} />} 
                {t('course.mark_complete')}
              </button>
            ) : (
              <div className="inline-flex items-center gap-3 px-10 py-4 rounded-2xl border-2 border-emerald-500 text-emerald-600 font-black text-xs bg-emerald-50 shadow-lg shadow-emerald-50">
                <Check size={20} strokeWidth={4} /> {t('course.completed')}
              </div>
            )}
          </div>
        </div>
      </main>

      {/* Sidebar - Below video on mobile */}
      <aside className="w-full lg:w-[320px] border-r border-[#E2EAF4] bg-white flex flex-col shrink-0 h-[50vh] lg:h-full border-b lg:border-b-0 lg:order-1">
        <div className="p-6 border-b border-[#E2EAF4]">
          <Link href="/dashboard" className="inline-flex items-center gap-1.5 text-xs font-black text-slate-400 hover:text-blue-600 mb-4 transition-colors uppercase tracking-widest">
            <ChevronLeft size={14} /> {t('course.back')}
          </Link>
          <h2 className="font-display font-black text-slate-900 text-base leading-snug line-clamp-2 tracking-tight">
            {getTranslatedTitle(course.title)}
          </h2>
          <div className="mt-6">
            <div className="flex justify-between text-[10px] mb-2 font-black uppercase tracking-widest">
              <span className="text-slate-400">{t('course.progress')}</span>
              <span className="text-blue-600">{Math.round(progress.percentComplete)}%</span>
            </div>
            <div className="h-1.5 bg-[#E2EAF4] rounded-full overflow-hidden">
              <div className="h-full bg-blue-600 rounded-full transition-all duration-700" style={{ width: `${progress.percentComplete}%` }} />
            </div>
          </div>
        </div>

        <div className="flex-1 flex flex-col min-h-0 bg-white overflow-hidden">
          <div className="flex border-b border-[#E2EAF4] shrink-0 bg-white">
            <button 
              onClick={() => setActiveTab('lessons')}
              className={`flex-1 py-4 text-[10px] font-black uppercase tracking-widest transition-all ${activeTab === 'lessons' ? 'text-blue-600 border-b-2 border-blue-600 bg-blue-50/30' : 'text-slate-400 hover:text-slate-600'}`}
            >
              {t('course.lesson')}
            </button>
            <button 
              onClick={() => setActiveTab('live')}
              className={`flex-1 py-4 text-[10px] font-black uppercase tracking-widest transition-all flex items-center justify-center gap-2 ${activeTab === 'live' ? 'text-rose-600 border-b-2 border-rose-600 bg-rose-50/30' : 'text-slate-400 hover:text-slate-600'}`}
            >
              LIVE
              {course.liveSessions?.filter((s: any) => new Date(s.scheduledAt) > new Date() || s.isActive).length > 0 && (
                <span className="w-1.5 h-1.5 rounded-full bg-rose-500 animate-pulse" />
              )}
            </button>
          </div>

          <div className="flex-1 overflow-y-auto p-4">
            {activeTab === 'lessons' ? (
              <div className="space-y-1.5">
                {course.lessons.map((lesson: any, i: number) => {
                  const completed = isCompleted(lesson.id)
                  const locked = isLocked(i)
                  const active = lesson.id === activeLesson?.id

                  return (
                    <button
                      key={lesson.id}
                      disabled={locked}
                      onClick={() => setSelectedLesson(lesson)}
                      className={`
                        w-full flex items-start gap-3.5 p-4 rounded-2xl text-left transition-all duration-300
                        ${active ? 'bg-blue-50 border border-blue-100 shadow-sm' : 'border border-transparent hover:bg-slate-50'}
                        ${locked ? 'opacity-40 grayscale cursor-not-allowed' : 'cursor-pointer'}
                      `}
                    >
                      <div className={`w-8 h-8 rounded-xl flex items-center justify-center flex-shrink-0 border transition-colors ${
                        completed ? 'bg-emerald-500 border-emerald-500 shadow-lg shadow-emerald-100' :
                        active ? 'bg-blue-600 border-blue-600 shadow-lg shadow-blue-100' :
                        locked ? 'bg-slate-100 border-slate-200' : 'bg-white border-slate-200'
                      }`}>
                        {completed ? <Check size={14} className="text-white" strokeWidth={3} />
                          : locked ? <Lock size={12} className="text-slate-400" />
                          : <span className={`text-xs font-black ${active ? 'text-white' : 'text-slate-400'}`}>{i + 1}</span>}
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className={`text-sm font-bold line-clamp-2 leading-tight mb-1 tracking-tight ${active ? 'text-blue-900' : 'text-slate-700'}`}>
                          {getTranslatedTitle(lesson.title, 'lesson')}
                        </p>
                        <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">{lesson.duration} mins</p>
                      </div>
                    </button>
                  )
                })}
              </div>
            ) : (
              <div className="space-y-4">
                {course.liveSessions?.length > 0 ? (
                  course.liveSessions.map((session: any) => {
                    const isUpcoming = new Date(session.scheduledAt) > new Date()
                    const isPast = !session.isActive && !isUpcoming
                    return (
                      <div key={session.id} className={`p-4 rounded-2xl border transition-all ${session.isActive ? 'bg-rose-50 border-rose-200' : 'bg-slate-50 border-slate-100'}`}>
                        <div className="flex items-center justify-between mb-3">
                           <span className={`text-[9px] font-black uppercase tracking-[0.15em] px-2 py-0.5 rounded-full ${
                             session.isActive ? 'bg-rose-500 text-white animate-pulse' : 
                             isUpcoming ? 'bg-blue-100 text-blue-600' : 'bg-slate-200 text-slate-500'
                           }`}>
                             {session.isActive ? 'LIVE NOW' : isUpcoming ? 'Sắp diễn ra' : 'Đã kết thúc'}
                           </span>
                           <span className="text-[10px] font-bold text-slate-400">
                             {new Date(session.scheduledAt).toLocaleDateString(language === 'vi' ? 'vi-VN' : 'en-US')}
                           </span>
                        </div>
                        <h4 className={`text-xs font-black mb-3 ${session.isActive ? 'text-rose-900' : 'text-slate-800'}`}>{session.title}</h4>
                        {session.isActive ? (
                          <a
                            href={`https://meet.jit.si/${session.jitsiRoomId}`}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="flex items-center justify-center gap-2 w-full py-2 bg-rose-600 text-white rounded-xl text-[10px] font-black hover:bg-rose-700 transition-all shadow-lg shadow-rose-100"
                          >
                            <i className="fa-solid fa-video"></i> THAM GIA NGAY
                          </a>
                        ) : isUpcoming ? (
                          <div className="flex items-center gap-2 text-[10px] font-bold text-blue-600 bg-blue-50 p-2 rounded-xl border border-blue-100">
                            <i className="fa-regular fa-clock"></i>
                            {new Date(session.scheduledAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                          </div>
                        ) : (
                          <div className="text-[10px] font-bold text-slate-400 italic">
                            Buổi học đã được ghi hình (liên hệ GV)
                          </div>
                        )}
                      </div>
                    )
                  })
                ) : (
                  <div className="py-12 text-center">
                    <i className="fa-solid fa-calendar-xmark text-slate-200 text-3xl mb-4"></i>
                    <p className="text-xs font-bold text-slate-400 italic">Chưa có lịch Live cho khóa học này</p>
                  </div>
                )}
              </div>
            )}
          </div>
        </div>

        <div className="p-5 border-t border-[#E2EAF4] bg-slate-50">
          {course.zaloLink && (
            <a
              href={course.zaloLink}
              target="_blank"
              rel="noopener noreferrer"
              className="flex items-center justify-center gap-2.5 px-4 py-3.5 rounded-2xl bg-white border border-slate-200 shadow-sm hover:border-blue-300 text-blue-700 text-xs font-black transition-all"
            >
              <i className="fa-brands fa-whatsapp text-lg"></i> {t('course.zalo_group')}
            </a>
          )}
        </div>
      </aside>

      {/* Chatbot sidebar - Right on desktop, bottom on mobile */}
      <aside className="w-full lg:w-[360px] border-l border-[#E2EAF4] bg-white shrink-0 h-[50vh] lg:h-full lg:order-3">
        <ChatBot lessonTopic={getTranslatedTitle(course.title)} zaloLink={course.zaloLink} />
      </aside>
    </div>
  )
}
