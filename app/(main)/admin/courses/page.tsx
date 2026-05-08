"use client"

import { useState, useEffect } from "react"
import { toast } from "sonner"
import { useLanguage } from "@/context/LanguageContext"
import { Loader2 } from "lucide-react"
import { reorderLessonAction } from "@/lib/actions/admin"

const FIELD_COLORS: any = {
  management: "bg-blue-500",
  softskills: "bg-emerald-500",
  it: "bg-purple-500",
  marketing: "bg-orange-500",
}

export default function AdminCoursesPage() {
  const { t } = useLanguage()
  const [courses, setCourses] = useState<any[]>([])
  const [isLoading, setIsLoading] = useState(true)
  
  const [editingZalo, setEditingZalo] = useState<string | null>(null)
  const [zaloInput, setZaloInput] = useState("")
  
  const [expandedCourse, setExpandedCourse] = useState<string | null>(null)
  const [editingLesson, setEditingLesson] = useState<string | null>(null)
  const [lessonVideoInput, setLessonVideoInput] = useState("")
  
  const [editingTitle, setEditingTitle] = useState<string | null>(null)
  const [lessonTitleInput, setLessonTitleInput] = useState("")
  
  const [editingTranscript, setEditingTranscript] = useState<string | null>(null)
  const [transcriptInput, setTranscriptInput] = useState("")
  
  const [isSaving, setIsSaving] = useState(false)

  const fetchData = async () => {
    try {
      const res = await fetch('/api/admin/courses')
      if (res.ok) {
        setCourses(await res.json())
      }
    } catch (e) {
      toast.error(t('admin.loading_error'))
    } finally {
      setIsLoading(false)
    }
  }

  useEffect(() => {
    fetchData()
  }, [])

  const saveZaloLink = async (courseId: string) => {
    if (!zaloInput.trim()) return
    if (!zaloInput.startsWith("https://zalo.me/") && !zaloInput.startsWith("https://chat.zalo.me/")) {
      toast.error("Invalid Zalo Link")
      return
    }

    setIsSaving(true)
    try {
      const res = await fetch(`/api/admin/courses/${courseId}/zalo`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ zaloLink: zaloInput.trim() }),
      })

      if (res.ok) {
        toast.success("✓ Updated!")
        setEditingZalo(null)
        fetchData()
      } else {
        toast.error("Failed")
      }
    } catch {
      toast.error("Error")
    } finally {
      setIsSaving(false)
    }
  }

  const saveLessonVideo = async (courseId: string, lessonId: string) => {
    if (!lessonVideoInput.trim()) return
    
    setIsSaving(true)
    try {
      const res = await fetch(`/api/admin/courses/${courseId}/lessons/${lessonId}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ youtubeVideoId: lessonVideoInput.trim() }),
      })

      if (res.ok) {
        toast.success("✓ Updated!")
        setEditingLesson(null)
        fetchData()
      } else {
        toast.error("Failed")
      }
    } catch {
      toast.error("Error")
    } finally {
      setIsSaving(false)
    }
  }

  const saveLessonTitle = async (courseId: string, lessonId: string) => {
    if (!lessonTitleInput.trim()) return
    
    setIsSaving(true)
    try {
      const res = await fetch(`/api/admin/courses/${courseId}/lessons/${lessonId}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ title: lessonTitleInput.trim() }),
      })

      if (res.ok) {
        toast.success("✓ Updated!")
        setEditingTitle(null)
        fetchData()
      } else {
        toast.error("Failed")
      }
    } catch {
      toast.error("Error")
    } finally {
      setIsSaving(false)
    }
  }

  const saveLessonTranscript = async (courseId: string, lessonId: string) => {
    setIsSaving(true)
    try {
      const res = await fetch(`/api/admin/courses/${courseId}/lessons/${lessonId}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ transcript: transcriptInput.trim() }),
      })

      if (res.ok) {
        toast.success("✓ Updated!")
        setEditingTranscript(null)
        fetchData()
      } else {
        toast.error("Failed")
      }
    } catch {
      toast.error("Error")
    } finally {
      setIsSaving(false)
    }
  }

  const handleReorder = async (lessonId: string, direction: 'up' | 'down') => {
    setIsSaving(true)
    try {
      const res = await reorderLessonAction(lessonId, direction)
      if (res.success) {
        toast.success("✓ Reordered!")
        fetchData()
      } else if (res.message) {
        toast.info(res.message)
      }
    } catch {
      toast.error("Error reordering")
    } finally {
      setIsSaving(false)
    }
  }

  const getTranslatedTitle = (title: string, field: string) => {
    const key = `course.${field}_title`
    const translated = t(key)
    return translated === key ? title : translated
  }

  if (isLoading) return <div className="flex justify-center p-12"><Loader2 className="animate-spin text-blue-600" /></div>

  return (
    <div className="space-y-6 animate-fade-up">
      {courses.map(course => (
        <div key={course.id} className="bg-white border border-slate-200 rounded-[2rem] overflow-hidden shadow-sm hover:shadow-xl transition-all duration-300">
          <div className="flex flex-col lg:flex-row items-center gap-8 p-8">
            <div className={`w-1.5 lg:h-14 self-stretch rounded-full ${FIELD_COLORS[course.field] || 'bg-slate-300'} opacity-30`} />

            <div className="flex-1 min-w-0">
              <div className="flex items-center gap-3 mb-2">
                <h3 className="font-display font-black text-slate-900 text-lg truncate tracking-tight">{getTranslatedTitle(course.title, course.field)}</h3>
                <span className={`text-[10px] font-black px-3 py-1 rounded-full uppercase tracking-widest ${
                  course.isPublished ? 'bg-emerald-50 text-emerald-700 border border-emerald-100 shadow-sm' : 'bg-slate-50 text-slate-400 border border-slate-100'
                }`}>
                  <i className={`fa-solid ${course.isPublished ? 'fa-circle-dot animate-pulse text-[8px]' : 'fa-circle'} mr-1.5`}></i>
                  {course.isPublished ? t('admin.courses.status_published') : t('admin.courses.status_hidden')}
                </span>
              </div>
              <div className="flex items-center gap-6 text-xs text-slate-500 font-bold opacity-70">
                <span className="flex items-center gap-2"><i className="fa-solid fa-play-circle text-blue-500"></i> {course.lessons?.length || 0} {t('common.lessons')}</span>
                <span className="flex items-center gap-2"><i className="fa-solid fa-user-graduate text-indigo-500"></i> {course.progress?.length || 0} Students</span>
              </div>

              <div className="flex items-center gap-2.5 mt-4">
                <div className="w-6 h-6 rounded-lg bg-blue-50 flex items-center justify-center">
                  <i className="fa-brands fa-whatsapp text-blue-500 text-xs"></i>
                </div>
                {course.zaloLink ? (
                  <a href={course.zaloLink} target="_blank" className="text-xs text-blue-600 hover:underline truncate max-w-xs font-bold tracking-tight">
                    {course.zaloLink}
                  </a>
                ) : (
                  <span className="text-xs text-slate-400 italic font-medium">{t('admin.courses.no_zalo')}</span>
                )}
              </div>
            </div>

            <div className="flex items-center gap-3 shrink-0">
              <button
                onClick={() => { 
                  setExpandedCourse(expandedCourse === course.id ? null : course.id)
                  setEditingLesson(null)
                  setEditingZalo(null)
                }}
                className={`flex items-center gap-2 text-xs font-black px-6 py-3.5 rounded-2xl border transition-all ${
                  expandedCourse === course.id 
                    ? 'bg-slate-900 text-white border-slate-900 shadow-xl' 
                    : 'bg-white text-slate-700 border-slate-200 hover:bg-slate-50 shadow-sm'
                }`}
              >
                <i className={`fa-solid ${expandedCourse === course.id ? 'fa-folder-open' : 'fa-folder'} text-base`}></i>
                {t('admin.courses.manage_lessons')}
              </button>
              <button
                onClick={() => { setEditingZalo(course.id); setZaloInput(course.zaloLink || ""); setExpandedCourse(null) }}
                className="flex items-center gap-2 text-xs font-black px-6 py-3.5 rounded-2xl bg-blue-50 hover:bg-blue-100 text-blue-700 border border-blue-200 hover:border-blue-300 transition-all shadow-sm"
              >
                <i className="fa-solid fa-link text-base"></i>
                {course.zaloLink ? t('admin.courses.edit_zalo') : t('admin.courses.add_zalo')}
              </button>
            </div>
          </div>

          {/* Lessons List Expansion */}
          {expandedCourse === course.id && (
            <div className="border-t border-slate-100 bg-slate-50/50 p-8 animate-fade-down">
              <div className="flex items-center justify-between mb-6">
                <h4 className="text-sm font-black text-slate-800 flex items-center gap-3 uppercase tracking-widest">
                  <i className="fa-solid fa-list-check text-blue-600"></i> {t('admin.courses.lesson_list')}
                </h4>
              </div>
              <div className="space-y-4">
                {course.lessons.map((lesson: any) => (
                  <div key={lesson.id} className="bg-white border border-slate-200 rounded-[1.5rem] overflow-hidden transition-all hover:border-blue-300 hover:shadow-lg shadow-sm">
                    <div className="p-5 flex flex-col md:flex-row md:items-center gap-6">
                      <div className="flex-1">
                        {editingTitle === lesson.id ? (
                          <div className="flex items-center gap-2 mb-2">
                            <input
                              type="text"
                              value={lessonTitleInput}
                              onChange={e => setLessonTitleInput(e.target.value)}
                              className="flex-1 bg-white border border-blue-300 rounded-xl px-4 py-2 text-sm font-black outline-none shadow-inner"
                              autoFocus
                            />
                            <button onClick={() => saveLessonTitle(course.id, lesson.id)} disabled={isSaving} className="w-10 h-10 bg-blue-600 text-white rounded-xl shadow-lg flex items-center justify-center">
                              {isSaving ? <i className="fa-solid fa-spinner fa-spin text-xs"></i> : <i className="fa-solid fa-check text-xs"></i>}
                            </button>
                            <button onClick={() => setEditingTitle(null)} className="w-10 h-10 text-slate-400 hover:text-slate-600 flex items-center justify-center">
                              <i className="fa-solid fa-xmark"></i>
                            </button>
                          </div>
                        ) : (
                          <p className="text-base font-black text-slate-900 mb-2">{lesson.order}. {lesson.title}</p>
                        )}
                        <div className="flex items-center gap-3">
                          <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest bg-slate-50 px-2 py-1 rounded-lg">YouTube ID</span>
                          <code className="text-xs text-blue-700 font-mono font-bold">{lesson.youtubeVideoId}</code>
                        </div>
                      </div>
                      
                      <div className="flex items-center gap-2">
                        <div className="flex flex-col gap-1 mr-2">
                          <button 
                            onClick={() => handleReorder(lesson.id, 'up')}
                            disabled={isSaving}
                            className="p-1 hover:bg-slate-100 rounded text-slate-400 hover:text-blue-600 transition-colors disabled:opacity-30"
                          >
                            <i className="fa-solid fa-chevron-up text-[10px]"></i>
                          </button>
                          <button 
                            onClick={() => handleReorder(lesson.id, 'down')}
                            disabled={isSaving}
                            className="p-1 hover:bg-slate-100 rounded text-slate-400 hover:text-blue-600 transition-colors disabled:opacity-30"
                          >
                            <i className="fa-solid fa-chevron-down text-[10px]"></i>
                          </button>
                        </div>

                        {editingLesson === lesson.id ? (
                          <div className="flex items-center gap-2">
                            <input
                              type="text"
                              value={lessonVideoInput}
                              onChange={e => setLessonVideoInput(e.target.value)}
                              placeholder="YouTube ID..."
                              className="w-40 bg-white border border-blue-300 rounded-xl px-4 py-2 text-sm outline-none font-mono font-bold"
                              autoFocus
                            />
                            <button onClick={() => saveLessonVideo(course.id, lesson.id)} disabled={isSaving} className="w-10 h-10 bg-blue-600 text-white rounded-xl shadow-lg shadow-blue-200 flex items-center justify-center">
                              {isSaving ? <i className="fa-solid fa-spinner fa-spin"></i> : <i className="fa-solid fa-save"></i>}
                            </button>
                            <button onClick={() => setEditingLesson(null)} className="w-10 h-10 text-slate-400 hover:text-slate-600 flex items-center justify-center">
                              <i className="fa-solid fa-xmark"></i>
                            </button>
                          </div>
                        ) : (
                          <button 
                            onClick={() => { setEditingLesson(lesson.id); setLessonVideoInput(lesson.youtubeVideoId) }}
                            className="flex items-center gap-2 text-xs font-black text-blue-600 hover:bg-blue-50 px-4 py-2.5 rounded-xl transition-all border border-transparent hover:border-blue-200"
                          >
                            <i className="fa-solid fa-video"></i> {t('admin.courses.edit_video')}
                          </button>
                        )}

                        <button 
                          onClick={() => { setEditingTitle(lesson.id); setLessonTitleInput(lesson.title) }}
                          className="flex items-center gap-2 text-xs font-black text-indigo-600 hover:bg-indigo-50 px-4 py-2.5 rounded-xl transition-all border border-transparent hover:border-indigo-200"
                        >
                          <i className="fa-solid fa-heading"></i> {t('admin.courses.edit_title')}
                        </button>
                        
                        <button 
                          onClick={() => { 
                            if (editingTranscript === lesson.id) {
                              setEditingTranscript(null)
                            } else {
                              setEditingTranscript(lesson.id)
                              setTranscriptInput(lesson.transcript || "")
                            }
                          }}
                          className={`flex items-center gap-2 text-xs font-black px-4 py-2.5 rounded-xl transition-all border ${
                            editingTranscript === lesson.id 
                              ? 'bg-slate-900 text-white border-slate-900 shadow-lg' 
                              : 'text-slate-600 hover:bg-slate-50 border-slate-200 shadow-sm'
                          }`}
                        >
                          <i className={`fa-solid ${editingTranscript === lesson.id ? 'fa-pen-to-square' : 'fa-file-lines'}`}></i> 
                          {editingTranscript === lesson.id ? t('admin.courses.editing') : t('admin.courses.edit_summary')}
                        </button>
                      </div>
                    </div>

                    {/* Transcript Editor Panel */}
                    {editingTranscript === lesson.id && (
                      <div className="bg-slate-50 border-t border-slate-100 p-6 animate-fade-down">
                        <div className="flex items-center justify-between mb-4">
                          <label className="text-[11px] font-black text-slate-500 uppercase flex items-center gap-2 tracking-widest">
                            <i className="fa-solid fa-circle-info text-blue-500"></i> {t('admin.courses.summary_label')}
                          </label>
                          <div className="flex gap-3">
                            <button 
                              onClick={() => saveLessonTranscript(course.id, lesson.id)}
                              disabled={isSaving}
                              className="flex items-center gap-2 px-6 py-2.5 bg-emerald-600 text-white text-[11px] font-black rounded-xl shadow-xl shadow-emerald-100 hover:bg-emerald-700 disabled:opacity-50 transition-all"
                            >
                              {isSaving ? <i className="fa-solid fa-spinner fa-spin"></i> : <i className="fa-solid fa-check-double"></i>}
                              {t('admin.courses.save_summary')}
                            </button>
                            <button onClick={() => setEditingTranscript(null)} className="px-4 py-2.5 text-slate-500 text-[11px] font-black hover:text-slate-900 transition-colors">
                              {t('admin.courses.cancel')}
                            </button>
                          </div>
                        </div>
                        <textarea
                          value={transcriptInput}
                          onChange={e => setTranscriptInput(e.target.value)}
                          placeholder="..."
                          rows={8}
                          className="w-full bg-white border border-slate-200 rounded-[1.5rem] p-6 text-sm text-slate-700 outline-none focus:border-blue-400 focus:ring-8 focus:ring-blue-50 transition-all leading-relaxed shadow-inner"
                        />
                        <p className="mt-3 text-[10px] text-slate-400 italic font-medium flex items-center gap-2">
                           <i className="fa-solid fa-lightbulb text-orange-400"></i> {t('admin.courses.tip')}
                        </p>
                      </div>
                    )}
                  </div>
                ))}
              </div>
            </div>
          )}

          {editingZalo === course.id && (
            <div className="border-t border-slate-100 bg-blue-50/30 p-8 animate-fade-up">
              <p className="text-sm font-black text-slate-800 mb-5 flex items-center gap-3 uppercase tracking-widest">
                <i className="fa-brands fa-whatsapp text-blue-600 text-xl"></i>
                {t('admin.courses.zalo_title')}
              </p>
              <div className="flex flex-col md:flex-row gap-4">
                <div className="flex-1">
                  <input
                    type="url"
                    value={zaloInput}
                    onChange={e => setZaloInput(e.target.value)}
                    placeholder="https://zalo.me/g/xxxxxxx"
                    className="w-full bg-white border border-slate-200 focus:border-blue-500 focus:ring-8 focus:ring-blue-100 rounded-2xl px-6 py-4 text-sm text-slate-800 placeholder:text-slate-400 outline-none transition-all font-mono font-bold shadow-sm"
                    autoFocus
                  />
                </div>
                <div className="flex gap-3 shrink-0">
                  <button
                    onClick={() => saveZaloLink(course.id)}
                    disabled={isSaving}
                    className="flex items-center gap-2 px-8 py-4 rounded-2xl bg-blue-600 text-white text-sm font-black shadow-xl shadow-blue-200 hover:bg-blue-700 disabled:opacity-50 transition-all"
                  >
                    {isSaving ? <i className="fa-solid fa-spinner fa-spin"></i> : <i className="fa-solid fa-paper-plane"></i>}
                    {t('admin.courses.save_link')}
                  </button>
                  <button onClick={() => setEditingZalo(null)} className="px-6 py-4 rounded-2xl border border-slate-200 bg-white text-slate-600 hover:bg-slate-50 text-sm font-black transition-all shadow-sm">
                    {t('admin.courses.cancel')}
                  </button>
                </div>
              </div>
            </div>
          )}
        </div>
      ))}
    </div>
  )
}
