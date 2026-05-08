"use client"

import { useState, useEffect } from "react"
import { Video, Calendar, Clock, Plus, ExternalLink, Trash2, Play, Square, Loader2 } from "lucide-react"
import { toast } from "sonner"

export default function AdminLivePage() {
  const [courses, setCourses] = useState<any[]>([])
  const [sessions, setSessions] = useState<any[]>([])
  const [isLoading, setIsLoading] = useState(true)
  
  const [selectedCourse, setSelectedCourse] = useState("")
  const [title, setTitle] = useState("")
  const [date, setDate] = useState("")
  const [time, setTime] = useState("")
  const [isCreating, setIsCreating] = useState(false)

  const fetchData = async () => {
    try {
      const [cRes, sRes] = await Promise.all([
        fetch('/api/admin/courses'), // I'll need to create this simple list API too
        fetch('/api/admin/live')
      ])
      if (cRes.ok && sRes.ok) {
        setCourses(await cRes.json())
        setSessions(await sRes.json())
      }
    } catch (e) {
      toast.error("Lỗi tải dữ liệu")
    } finally {
      setIsLoading(false)
    }
  }

  useEffect(() => {
    fetchData()
  }, [])

  const handleCreate = async () => {
    if (!selectedCourse || !title || !date || !time) return
    setIsCreating(true)
    try {
      const scheduledAt = `${date}T${time}:00`
      const res = await fetch('/api/admin/live', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ courseId: selectedCourse, title, scheduledAt })
      })

      if (res.ok) {
        toast.success("Đã tạo Live Session!")
        setTitle("")
        fetchData()
      } else {
        toast.error("Tạo thất bại")
      }
    } catch (e) {
      toast.error("Lỗi kết nối")
    } finally {
      setIsCreating(false)
    }
  }

  const toggleLive = async (id: string, currentlyActive: boolean) => {
    try {
      const res = await fetch(`/api/admin/live/${id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ isActive: !currentlyActive })
      })
      if (res.ok) {
        toast.success(!currentlyActive ? "✅ Đã mở phòng Live Session!" : "Đã đóng phòng Live Session")
        fetchData()
      }
    } catch (e) {
      toast.error("Lỗi thao tác")
    }
  }

  const deleteSession = async (id: string) => {
    if (!confirm("Bạn có chắc muốn xóa buổi học này?")) return
    try {
      const res = await fetch(`/api/admin/live/${id}`, { method: 'DELETE' })
      if (res.ok) {
        toast.success("Đã xóa")
        fetchData()
      }
    } catch (e) {
      toast.error("Lỗi khi xóa")
    }
  }

  // Edit Room ID State
  const [editingRoomId, setEditingRoomId] = useState<string | null>(null)
  const [roomIdInput, setRoomIdInput] = useState("")
  const [isSaving, setIsSaving] = useState(false)

  const saveRoomId = async (id: string) => {
    setIsSaving(true)
    try {
      const res = await fetch(`/api/admin/live/${id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ jitsiRoomId: roomIdInput.trim() })
      })
      if (res.ok) {
        toast.success("Đã cập nhật mã phòng!")
        setEditingRoomId(null)
        fetchData()
      }
    } catch (e) {
      toast.error("Lỗi cập nhật")
    } finally {
      setIsSaving(false)
    }
  }

  if (isLoading) return <div className="flex justify-center p-12"><Loader2 className="animate-spin text-blue-600" /></div>

  return (
    <div className="space-y-10 animate-fade-up">
      {/* Create Session Form */}
      <div className="bg-white border border-slate-200 rounded-2xl p-6 shadow-sm">
        <h2 className="text-lg font-display font-bold text-slate-900 mb-6 flex items-center gap-2">
          <Plus size={20} className="text-blue-600" /> Tạo buổi học trực tiếp mới
        </h2>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-5 mb-6">
          <div className="space-y-1.5">
            <label className="text-sm font-semibold text-slate-700">Khóa học</label>
            <select
              className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-2.5 text-sm outline-none focus:border-blue-400 transition-all"
              value={selectedCourse}
              onChange={e => setSelectedCourse(e.target.value)}
            >
              <option value="">Chọn khóa học</option>
              {courses.map(c => <option key={c.id} value={c.id}>{c.title}</option>)}
            </select>
          </div>
          <div className="space-y-1.5">
            <label className="text-sm font-semibold text-slate-700">Tiêu đề buổi học</label>
            <input
              type="text"
              placeholder="Ví dụ: Q&A Tuần 1"
              className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-2.5 text-sm outline-none focus:border-blue-400 transition-all"
              value={title}
              onChange={e => setTitle(e.target.value)}
            />
          </div>
          <div className="space-y-1.5">
            <label className="text-sm font-semibold text-slate-700">Ngày diễn ra</label>
            <input
              type="date"
              className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-2.5 text-sm outline-none focus:border-blue-400 transition-all"
              value={date}
              onChange={e => setDate(e.target.value)}
            />
          </div>
          <div className="space-y-1.5">
            <label className="text-sm font-semibold text-slate-700">Giờ bắt đầu</label>
            <input
              type="time"
              className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-2.5 text-sm outline-none focus:border-blue-400 transition-all"
              value={time}
              onChange={e => setTime(e.target.value)}
            />
          </div>
        </div>
        <button
          onClick={handleCreate}
          disabled={isCreating}
          className="w-full md:w-auto flex items-center justify-center gap-2 px-8 py-3 bg-blue-600 hover:bg-blue-700 text-white font-semibold rounded-xl transition-all shadow-lg hover:-translate-y-0.5 disabled:opacity-50"
        >
          {isCreating ? <Loader2 size={18} className="animate-spin" /> : <Plus size={18} />}
          Tạo Live Session
        </button>
      </div>

      {/* Sessions List */}
      <div className="bg-white border border-slate-200 rounded-2xl overflow-hidden shadow-sm">
        <div className="p-5 border-b border-slate-100 bg-slate-50/50">
          <h2 className="font-display font-bold text-slate-900">Danh sách các buổi Live</h2>
        </div>
        <div className="divide-y divide-slate-100">
          {sessions.length === 0 ? (
            <p className="p-10 text-center text-slate-500 text-sm italic">Chưa có buổi học trực tiếp nào được tạo.</p>
          ) : (
            sessions.map(session => (
              <div key={session.id} className="p-5 flex flex-col lg:flex-row lg:items-center gap-6 group hover:bg-blue-50/20 transition-colors">
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 mb-1.5">
                    <span className="text-[10px] font-bold text-blue-600 bg-blue-50 px-2 py-0.5 rounded border border-blue-100 uppercase tracking-wider">{session.course.title}</span>
                    <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full uppercase tracking-wider ${
                      session.isActive ? "bg-red-50 text-red-600 border border-red-100 animate-pulse" : "bg-slate-100 text-slate-500"
                    }`}>
                      {session.isActive ? "● LIVE" : "Sắp diễn ra"}
                    </span>
                  </div>
                  <h3 className="font-bold text-slate-900 mb-1">{session.title}</h3>
                  <div className="flex items-center gap-4 text-xs text-slate-500 mb-3">
                    <span className="flex items-center gap-1.5"><Calendar size={13} /> {new Date(session.scheduledAt).toLocaleDateString('vi-VN')}</span>
                    <span className="flex items-center gap-1.5"><Clock size={13} /> {new Date(session.scheduledAt).toLocaleTimeString('vi-VN', { hour: '2-digit', minute: '2-digit' })}</span>
                  </div>

                  {editingRoomId === session.id ? (
                    <div className="flex items-center gap-2 max-w-sm">
                      <input 
                        className="flex-1 bg-white border border-blue-300 rounded-lg px-3 py-1.5 text-xs outline-none font-mono"
                        value={roomIdInput}
                        onChange={e => setRoomIdInput(e.target.value)}
                        placeholder="Mã phòng Jitsi..."
                      />
                      <button onClick={() => saveRoomId(session.id)} disabled={isSaving} className="p-1.5 bg-blue-600 text-white rounded-lg">
                        {isSaving ? <Loader2 size={14} className="animate-spin" /> : <Plus size={14} />}
                      </button>
                      <button onClick={() => setEditingRoomId(null)} className="p-1.5 text-slate-400">
                        <Clock size={14} />
                      </button>
                    </div>
                  ) : (
                    <div className="flex items-center gap-2">
                      <code className="text-[10px] bg-slate-100 px-2 py-0.5 rounded text-slate-600 font-mono">
                        jitsi: {session.jitsiRoomId}
                      </code>
                      <button onClick={() => { setEditingRoomId(session.id); setRoomIdInput(session.jitsiRoomId) }} className="text-[10px] text-blue-600 hover:underline font-bold">
                        [Đổi mã phòng]
                      </button>
                    </div>
                  )}
                </div>

                <div className="flex items-center gap-3 shrink-0">
                  <button
                    onClick={() => toggleLive(session.id, session.isActive)}
                    className={`flex items-center gap-2 px-4 py-2.5 rounded-xl text-sm font-bold transition-all shadow-sm border ${
                      session.isActive
                        ? "bg-red-50 text-red-600 border-red-200 hover:bg-red-100"
                        : "bg-emerald-50 text-emerald-600 border-emerald-200 hover:bg-emerald-100"
                    }`}
                  >
                    {session.isActive ? <Square size={16} fill="currentColor" /> : <Play size={16} fill="currentColor" />}
                    {session.isActive ? "Kết thúc" : "Bắt đầu"}
                  </button>
                  <button
                    onClick={() => {
                      navigator.clipboard.writeText(`https://meet.jit.si/${session.jitsiRoomId}`)
                      toast.success("Đã copy link Jitsi!")
                    }}
                    className="p-2.5 text-slate-400 hover:text-blue-600 bg-white border border-slate-200 rounded-xl hover:border-blue-200 transition-all shadow-sm"
                    title="Copy link Jitsi"
                  >
                    <ExternalLink size={18} />
                  </button>
                  {!session.isActive && (
                    <button 
                      onClick={() => deleteSession(session.id)}
                      className="p-2.5 text-slate-400 hover:text-red-600 bg-white border border-slate-200 rounded-xl hover:border-red-200 transition-all shadow-sm"
                    >
                      <Trash2 size={18} />
                    </button>
                  )}
                </div>
              </div>
            ))
          )}
        </div>
      </div>
    </div>
  )
}
