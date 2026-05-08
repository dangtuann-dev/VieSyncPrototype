"use client"

import { useState, useEffect } from "react"
import { toast } from "sonner"
import { useLanguage } from "@/context/LanguageContext"
import { Download as DownloadIcon, Search as SearchIcon, MoreHorizontal as MoreIcon, Loader2 as LoaderIcon } from "lucide-react"

export default function AdminUsersPage() {
  const { t, language } = useLanguage()
  const [users, setUsers] = useState<any[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [searchTerm, setSearchTerm] = useState("")

  const fetchData = async () => {
    try {
      const res = await fetch('/api/admin/users')
      if (res.ok) {
        setUsers(await res.json())
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

  const filteredUsers = users.filter(u => 
    u.name?.toLowerCase().includes(searchTerm.toLowerCase()) || 
    u.email?.toLowerCase().includes(searchTerm.toLowerCase())
  )

  const exportToCSV = () => {
    const headers = ["ID,Name,Email,Phone,Type,Field,Pain Points,Course,Progress,Joined"]
    const rows = filteredUsers.map(u => {
      const type = t(`usertype.${u.profile?.userType || 'UNKNOWN'}`)
      const interests = u.profile?.interests?.map((i: string) => t(`field.${i}`)).join(";") || ""
      const course = u.progress?.[0]?.course?.title || t('admin.users.not_started')
      const progress = u.progress?.[0]?.percentComplete || 0
      return `${u.id},${u.name},${u.email},${u.phone || ""},${type},${interests},${course},${progress}%,${new Date(u.createdAt).toLocaleDateString(language === 'vi' ? 'vi-VN' : 'en-US')}`
    })
    
    const csvContent = "\uFEFF" + headers.concat(rows).join("\n")
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' })
    const url = URL.createObjectURL(blob)
    const link = document.createElement("a")
    link.setAttribute("href", url)
    link.setAttribute("download", `users_viesync_${new Date().toISOString().split('T')[0]}.csv`)
    document.body.appendChild(link)
    link.click()
    document.body.removeChild(link)
  }

  const getTranslatedTitle = (title: string, field: string) => {
    const key = `course.${field}_title`
    const translated = t(key)
    return translated === key ? title : translated
  }

  if (isLoading) return <div className="flex justify-center p-12"><i className="fa-solid fa-spinner fa-spin text-blue-600 text-2xl"></i></div>

  return (
    <div className="space-y-8 animate-fade-up">
      {/* Header & Search */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
        <div className="relative flex-1 max-w-lg">
          <i className="fa-solid fa-magnifying-glass absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" size={18}></i>
          <input
            type="text"
            placeholder={t('admin.users.search_placeholder')}
            className="w-full pl-12 pr-6 py-3.5 bg-white border border-slate-200 rounded-[1.25rem] text-sm outline-none focus:border-blue-500 focus:ring-8 focus:ring-blue-100 transition-all font-bold shadow-sm"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </div>
        <button
          onClick={exportToCSV}
          className="flex items-center gap-2.5 px-8 py-3.5 bg-white border border-slate-200 rounded-[1.25rem] text-sm font-black text-slate-700 hover:bg-slate-50 transition-all shadow-sm hover:shadow-md"
        >
          <i className="fa-solid fa-file-csv text-emerald-600 text-lg"></i> {t('admin.users.export')}
        </button>
      </div>

      {/* Users Table */}
      <div className="bg-white border border-slate-200 rounded-[2rem] overflow-hidden shadow-sm hover:shadow-xl transition-all duration-500">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead className="bg-slate-50 border-b border-slate-100">
              <tr>
                {[
                  t('admin.users.header_user'),
                  t('admin.users.header_type'),
                  t('admin.users.header_field'),
                  t('admin.users.header_pain'),
                  t('admin.users.header_course'),
                  t('admin.users.header_progress'),
                  t('admin.users.header_joined'),
                  ""
                ].map((h, i) => (
                  <th key={i} className="px-8 py-5 text-[10px] font-black text-slate-400 uppercase tracking-[0.15em]">
                    {h}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-50">
              {filteredUsers.length === 0 ? (
                <tr><td colSpan={8} className="p-16 text-center text-slate-400 text-sm italic font-medium">No users found.</td></tr>
              ) : (
                filteredUsers.map((user) => (
                  <tr key={user.id} className="hover:bg-blue-50/40 transition-colors group">
                    <td className="px-8 py-5">
                      <div className="flex items-center gap-4">
                        <div className="w-11 h-11 rounded-2xl bg-gradient-to-br from-blue-500/10 to-cyan-500/10 flex items-center justify-center text-blue-600 font-black text-sm border border-blue-100 shadow-sm">
                          {user.name?.[0]?.toUpperCase() || '?'}
                        </div>
                        <div className="min-w-0">
                          <p className="text-sm font-black text-slate-900 truncate tracking-tight">{user.name || 'User'}</p>
                          <p className="text-[11px] text-slate-500 font-bold truncate opacity-80">{user.email}</p>
                        </div>
                      </div>
                    </td>
                    <td className="px-8 py-5">
                      <span className="text-[10px] font-black px-3 py-1 rounded-lg bg-slate-100 text-slate-500 uppercase tracking-widest border border-slate-200/50">
                        {t(`usertype.${user.profile?.userType || 'UNKNOWN'}`)}
                      </span>
                    </td>
                    <td className="px-8 py-5">
                      <div className="flex flex-wrap gap-1.5 max-w-[140px]">
                        {user.profile?.interests?.map((int: string) => (
                          <span key={int} className="text-[9px] font-black px-2 py-1 rounded bg-blue-50 text-blue-700 border border-blue-100 uppercase tracking-tight">
                            {t(`field.${int}`)}
                          </span>
                        ))}
                      </div>
                    </td>
                    <td className="px-8 py-5">
                      <div className="flex flex-wrap gap-1.5 max-w-[180px]">
                        {user.profile?.painPoints?.map((pp: string) => (
                          <span key={pp} className="text-[9px] font-black px-2 py-1 rounded bg-orange-50 text-orange-700 border border-orange-100 leading-tight">
                            <i className="fa-solid fa-triangle-exclamation mr-1 opacity-50"></i>
                            {t(`painpoint.${pp}`)}
                          </span>
                        ))}
                        {!user.profile?.painPoints?.length && <span className="text-slate-300 text-xs font-bold">-</span>}
                      </div>
                    </td>
                    <td className="px-8 py-5">
                      <p className="text-xs font-bold text-slate-700 truncate max-w-[140px] tracking-tight">
                        {user.progress?.[0] 
                          ? getTranslatedTitle(user.progress[0].course.title, user.progress[0].course.field)
                          : <span className="text-slate-300 italic font-medium">{t('admin.users.not_started')}</span>
                        }
                      </p>
                    </td>
                    <td className="px-8 py-5">
                      {user.progress?.[0] ? (
                        <div className="w-28">
                          <div className="flex justify-between items-center mb-1.5 text-[10px] font-black">
                            <span className="text-blue-600">{Math.round(user.progress[0].percentComplete)}%</span>
                          </div>
                          <div className="w-full bg-slate-100 h-1.5 rounded-full overflow-hidden shadow-inner">
                            <div className="bg-gradient-to-r from-blue-600 to-blue-400 h-full transition-all duration-700" style={{ width: `${user.progress[0].percentComplete}%` }} />
                          </div>
                        </div>
                      ) : '-'}
                    </td>
                    <td className="px-8 py-5">
                      <span className="text-xs text-slate-500 font-bold opacity-80">
                        <i className="fa-regular fa-calendar-days mr-2 text-slate-300"></i>
                        {new Date(user.createdAt).toLocaleDateString(language === 'vi' ? 'vi-VN' : 'en-US')}
                      </span>
                    </td>
                    <td className="px-8 py-5 text-right">
                      <button className="w-9 h-9 flex items-center justify-center text-slate-300 hover:text-blue-600 hover:bg-blue-50 rounded-xl transition-all opacity-0 group-hover:opacity-100">
                        <i className="fa-solid fa-ellipsis-vertical text-base"></i>
                      </button>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  )
}
