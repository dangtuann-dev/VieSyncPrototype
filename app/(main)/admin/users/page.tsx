"use client"

import { useState, useEffect } from "react"
import { toast } from "sonner"
import { useLanguage } from "@/context/LanguageContext"
import { 
  Download as DownloadIcon, 
  Search as SearchIcon, 
  MoreHorizontal as MoreIcon, 
  Loader2 as LoaderIcon, 
  Plus, 
  Edit2, 
  Trash2, 
  X,
  UserPlus,
  ShieldCheck
} from "lucide-react"
import { Input } from "@/components/ui/Input"
import { Button } from "@/components/ui/Button"

export default function AdminUsersPage() {
  const { t, language } = useLanguage()
  const [users, setUsers] = useState<any[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [searchTerm, setSearchTerm] = useState("")
  
  // Modal State
  const [isModalOpen, setIsModalOpen] = useState(false)
  const [modalMode, setModalMode] = useState<'add' | 'edit'>('add')
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [selectedUser, setSelectedUser] = useState<any>(null)
  
  // Form State
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    password: "",
    userType: "STUDENT",
    isAdmin: false
  })

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

  const handleOpenAdd = () => {
    setModalMode('add')
    setFormData({ name: "", email: "", password: "", userType: "STUDENT", isAdmin: false })
    setIsModalOpen(true)
  }

  const handleOpenEdit = (user: any) => {
    setModalMode('edit')
    setSelectedUser(user)
    setFormData({
      name: user.name || "",
      email: user.email || "",
      password: "", // Don't show password
      userType: user.profile?.userType || "STUDENT",
      isAdmin: user.isAdmin || false
    })
    setIsModalOpen(true)
  }

  const handleDelete = async (id: string) => {
    if (!confirm("Are you sure you want to delete this user?")) return
    
    try {
      const res = await fetch(`/api/admin/users/${id}`, { method: 'DELETE' })
      if (res.ok) {
        toast.success("User deleted successfully")
        setUsers(users.filter(u => u.id !== id))
      } else {
        toast.error("Failed to delete user")
      }
    } catch (e) {
      toast.error("Error deleting user")
    }
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsSubmitting(true)
    
    try {
      const url = modalMode === 'add' ? '/api/admin/users' : `/api/admin/users/${selectedUser.id}`
      const method = modalMode === 'add' ? 'POST' : 'PATCH'
      
      const res = await fetch(url, {
        method,
        body: JSON.stringify(formData)
      })
      
      const data = await res.json()
      
      if (res.ok) {
        toast.success(modalMode === 'add' ? "User created" : "User updated")
        fetchData()
        setIsModalOpen(false)
      } else {
        toast.error(data.error || "Operation failed")
      }
    } catch (e) {
      toast.error("An error occurred")
    } finally {
      setIsSubmitting(false)
    }
  }

  const exportToCSV = () => {
    const headers = ["ID,Name,Email,Phone,Type,Field,Pain Points,Course,Progress,Joined"]
    const rows = filteredUsers.map(u => {
      const type = t(`usertype.${u.profile?.userType || 'UNKNOWN'}`)
      const interests = (u.profile?.interests || []).map((i: string) => t(`field.${i}`)).join(";")
      const pains = (u.profile?.painPoints || []).map((p: string) => t(`painpoint.${p}`)).join(";")
      const course = u.progress?.[0]?.course?.title || t('admin.users.not_started')
      const progress = u.progress?.[0]?.percentComplete || 0
      return `"${u.id}","${u.name}","${u.email}","${u.phone || ""}","${type}","${interests}","${pains}","${course}","${progress}%","${new Date(u.createdAt).toLocaleDateString(language === 'vi' ? 'vi-VN' : 'en-US')}"`
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

  if (isLoading) return <div className="flex justify-center p-12"><LoaderIcon className="animate-spin text-blue-600" size={32} /></div>

  return (
    <div className="space-y-8 animate-fade-up">
      {/* Header & Search */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
        <div className="relative flex-1 max-w-lg">
          <SearchIcon className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" size={18} />
          <input
            type="text"
            placeholder={t('admin.users.search_placeholder')}
            className="w-full pl-12 pr-6 py-3.5 bg-white border border-slate-200 rounded-[1.25rem] text-sm outline-none focus:border-blue-500 focus:ring-8 focus:ring-blue-100 transition-all font-bold shadow-sm"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </div>
        <div className="flex items-center gap-3">
          <button
            onClick={exportToCSV}
            className="flex items-center gap-2.5 px-6 py-3.5 bg-white border border-slate-200 rounded-[1.25rem] text-sm font-black text-slate-700 hover:bg-slate-50 transition-all shadow-sm"
          >
            <DownloadIcon size={18} className="text-emerald-600" /> {t('admin.users.export')}
          </button>
          <button
            onClick={handleOpenAdd}
            className="flex items-center gap-2.5 px-6 py-3.5 bg-blue-600 rounded-[1.25rem] text-sm font-black text-white hover:bg-blue-700 transition-all shadow-lg shadow-blue-100"
          >
            <Plus size={18} /> Add User
          </button>
        </div>
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
                  "Actions"
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
                          <div className="flex items-center gap-2">
                            <p className="text-sm font-black text-slate-900 truncate tracking-tight">{user.name || 'User'}</p>
                            {user.isAdmin && <ShieldCheck size={14} className="text-blue-600" />}
                          </div>
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
                        {new Date(user.createdAt).toLocaleDateString(language === 'vi' ? 'vi-VN' : 'en-US')}
                      </span>
                    </td>
                    <td className="px-8 py-5 text-right">
                      <div className="flex items-center justify-end gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                        <button 
                          onClick={() => handleOpenEdit(user)}
                          className="w-8 h-8 flex items-center justify-center text-slate-400 hover:text-blue-600 hover:bg-blue-50 rounded-lg transition-all"
                        >
                          <Edit2 size={14} />
                        </button>
                        <button 
                          onClick={() => handleDelete(user.id)}
                          className="w-8 h-8 flex items-center justify-center text-slate-400 hover:text-rose-600 hover:bg-rose-50 rounded-lg transition-all"
                        >
                          <Trash2 size={14} />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* User Modal */}
      {isModalOpen && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
          <div className="absolute inset-0 bg-slate-900/60 backdrop-blur-sm" onClick={() => setIsModalOpen(false)} />
          <div className="relative bg-white w-full max-w-xl rounded-[2.5rem] shadow-2xl animate-in zoom-in-95 duration-200 overflow-hidden">
            <div className="p-8 border-b border-slate-100 flex items-center justify-between">
              <div className="flex items-center gap-4">
                <div className="w-12 h-12 rounded-2xl bg-blue-50 flex items-center justify-center text-blue-600 shadow-sm">
                  {modalMode === 'add' ? <UserPlus size={24} /> : <Edit2 size={24} />}
                </div>
                <div>
                  <h3 className="text-xl font-black text-slate-900">{modalMode === 'add' ? 'Add New User' : 'Edit User Info'}</h3>
                  <p className="text-sm text-slate-500 font-medium">Please provide accurate details</p>
                </div>
              </div>
              <button onClick={() => setIsModalOpen(false)} className="w-10 h-10 rounded-xl bg-slate-50 flex items-center justify-center text-slate-400 hover:bg-slate-100 transition-colors">
                <X size={20} />
              </button>
            </div>

            <form onSubmit={handleSubmit} className="p-8 space-y-6">
              <div className="grid grid-cols-2 gap-6">
                <Input
                  label="Full Name"
                  placeholder="Enter name..."
                  value={formData.name}
                  onChange={e => setFormData({...formData, name: e.target.value})}
                  required
                />
                <Input
                  label="Email Address"
                  type="email"
                  placeholder="name@example.com"
                  value={formData.email}
                  onChange={e => setFormData({...formData, email: e.target.value})}
                  required
                />
              </div>

              {modalMode === 'add' && (
                <Input
                  label="Password"
                  type="password"
                  placeholder="••••••••"
                  value={formData.password}
                  onChange={e => setFormData({...formData, password: e.target.value})}
                  required
                />
              )}

              <div className="grid grid-cols-2 gap-6">
                <div className="space-y-2">
                  <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest px-1">User Role</label>
                  <select
                    className="w-full px-5 py-3.5 bg-slate-50 border border-slate-200 rounded-2xl text-sm font-bold outline-none focus:border-blue-500 transition-all"
                    value={formData.userType}
                    onChange={e => setFormData({...formData, userType: e.target.value})}
                  >
                    <option value="STUDENT">Student</option>
                    <option value="PROFESSIONAL">Professional</option>
                    <option value="CAREER_CHANGER">Career Changer</option>
                    <option value="INSTRUCTOR">Instructor</option>
                  </select>
                </div>
                <div className="space-y-2">
                  <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest px-1">Permissions</label>
                  <div className="flex items-center gap-3 px-5 py-3.5 bg-slate-50 border border-slate-200 rounded-2xl">
                    <input
                      type="checkbox"
                      id="isAdmin"
                      className="w-5 h-5 rounded-lg border-slate-300 text-blue-600 focus:ring-blue-100"
                      checked={formData.isAdmin}
                      onChange={e => setFormData({...formData, isAdmin: e.target.checked})}
                    />
                    <label htmlFor="isAdmin" className="text-sm font-bold text-slate-700 cursor-pointer">System Admin</label>
                  </div>
                </div>
              </div>

              <div className="pt-6 flex gap-3">
                <Button 
                  type="button" 
                  variant="secondary" 
                  className="flex-1 py-6"
                  onClick={() => setIsModalOpen(false)}
                >
                  Cancel
                </Button>
                <Button 
                  type="submit" 
                  className="flex-1 py-6 gap-2"
                  disabled={isSubmitting}
                >
                  {isSubmitting ? <LoaderIcon className="animate-spin" size={18} /> : modalMode === 'add' ? <Plus size={18} /> : <SaveIcon size={18} />}
                  {modalMode === 'add' ? 'Create User' : 'Update Info'}
                </Button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  )
}

function SaveIcon({ size }: { size: number }) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M19 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h11l5 5v11a2 2 0 0 1-2 2z" />
      <polyline points="17 21 17 13 7 13 7 21" />
      <polyline points="7 3 7 8 15 8" />
    </svg>
  )
}
