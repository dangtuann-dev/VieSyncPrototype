"use client"

import { useState, useEffect, use } from "react"
import Link from "next/link"
import { ChevronLeft, Check, Lock, MessageCircle, Info, Loader2 } from "lucide-react"
import { SecuredVideoPlayer } from "@/components/course/VideoPlayer"
import { ChatBot } from "@/components/course/ChatBot"
import { completeLessonAction } from "@/lib/actions/course"
import { useLanguage } from "@/context/LanguageContext"
import { toast } from "sonner"

export default function CoursePage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = use(params)
  const { t } = useLanguage()
  
  const [course, setCourse] = useState<any>(null)
  const [progress, setProgress] = useState({ completedLessons: [] as string[], percentComplete: 0 })
  const [isLoading, setIsLoading] = useState(true)
  const [isCompleting, setIsCompleting] = useState(false)

  const fetchData = async () => {
    try {
      const res = await fetch(`/api/course/${slug}`)
      if (res.ok) {
        const data = await res.json()
        setCourse(data.course)
        setProgress(data.progress || { completedLessons: [], percentComplete: 0 })
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
      }
    } catch {
      toast.error("Error")
    } finally {
      setIsCompleting(false)
    }
  }

  const getTranslatedTitle = (title: string, prefix = 'course') => {
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

  const uncompleted = course.lessons.filter((l: any) => !isCompleted(l.id))
  const activeLesson = uncompleted[0] || course.lessons[course.lessons.length - 1]
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

      {/* Lesson list sidebar */}
      <aside className="w-full lg:w-[320px] border-r border-[#E2EAF4] bg-white flex flex-col shrink-0 h-[40vh] lg:h-full">
        {course.liveSessions?.[0]?.isActive && (
          <a
            href={`https://meet.jit.si/${course.liveSessions[0].jitsiRoomId}`}
            target="_blank"
            rel="noopener noreferrer" 
            className="m-3 p-4 bg-gradient-to-br from-red-600 to-orange-500 text-white rounded-2xl shadow-lg hover:scale-[1.02] transition-transform"
          >
            <div className="flex items-center gap-2 mb-1">
              <div className="w-2 h-2 bg-white rounded-full" />
              <span className="text-[10px] font-bold uppercase tracking-widest">{t('course.live_now')}</span>
            </div>
            <p className="text-xs font-bold leading-tight">{t('course.live_msg')}</p>
          </a>
        )}
        
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

        <div className="flex-1 overflow-y-auto p-4 space-y-1.5">
          {course.lessons.map((lesson: any, i: number) => {
            const completed = isCompleted(lesson.id)
            const locked = isLocked(i)
            const active = lesson.id === activeLesson?.id

            return (
              <div
                key={lesson.id}
                title={locked ? t('course.lock_msg') : ""}
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
              </div>
            )
          })}
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

      {/* Video area */}
      <main className="flex-1 flex flex-col min-w-0 bg-black overflow-hidden lg:h-full">
        <div className="w-full aspect-video relative bg-black flex-shrink-0">
          <SecuredVideoPlayer
            youtubeId={activeLesson?.youtubeVideoId || "dQw4w9WgXcQ"}
            userEmail="user@viesync.com"
            userName="Student"
          />
        </div>
        <div className="flex-1 overflow-y-auto bg-white p-8 lg:p-12 border-t border-[#E2EAF4]">

          <div className="max-w-4xl">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-lg bg-blue-50 text-blue-600 text-[10px] font-black uppercase tracking-widest mb-4">
              {t('course.lesson')} {activeIndex + 1} · {activeLesson.duration} mins
            </div>
            <h1 className="text-3xl font-display font-black text-slate-900 mb-4 tracking-tight">
              {getTranslatedTitle(activeLesson?.title, 'lesson')}
            </h1>
            
            {/* Transcript / Summary section */}
            {activeLesson.transcript && (
              <div className="mb-10 p-8 bg-slate-50 rounded-[2rem] border border-slate-100 shadow-inner">
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

      {/* Chatbot */}
      <aside className="w-full lg:w-[360px] border-l border-[#E2EAF4] bg-white shrink-0 h-[50vh] lg:h-full">
        <ChatBot lessonTopic={getTranslatedTitle(course.title)} zaloLink={course.zaloLink} />
      </aside>
    </div>
  )
}
