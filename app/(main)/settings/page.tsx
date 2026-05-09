"use client"

import { useState, useEffect } from "react"
import { useLanguage } from "@/context/LanguageContext"
import { Globe, User, Shield, Lock, Save, Loader2 } from "lucide-react"
import { Input } from "@/components/ui/Input"
import { Button } from "@/components/ui/Button"
import { toast } from "sonner"

export default function SettingsPage() {
  const { language, setLanguage, t } = useLanguage()
  const [isPageLoading, setIsPageLoading] = useState(true)
  const [isSaving, setIsSaving] = useState(false)

  // Profile State
  const [profile, setProfile] = useState({ 
    name: "", 
    email: "", 
    phone: "", 
    image: "👨‍🎓", 
    userType: "STUDENT" 
  })
  
  // Password State
  const [passwords, setPasswords] = useState({ current: "", new: "", confirm: "" })

  useEffect(() => {
    fetch('/api/users/profile')
      .then(res => res.json())
      .then(data => {
        setProfile({ 
          name: data.name || "", 
          email: data.email || "", 
          phone: data.phone || "",
          image: data.image || "👨‍🎓",
          userType: data.userType || "STUDENT"
        })
        setIsPageLoading(false)
      })
      .catch(() => {
        toast.error(t('admin.loading_error'))
        setIsPageLoading(false)
      })
  }, [])

  const handleSaveProfile = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsSaving(true)
    try {
      const res = await fetch('/api/users/profile', {
        method: 'PATCH',
        body: JSON.stringify({ 
          name: profile.name, 
          phone: profile.phone,
          image: profile.image,
          userType: profile.userType
        })
      })
      if (res.ok) toast.success(t('settings.save'))
      else toast.error("Error")
    } catch (e) {
      toast.error("Connection Error")
    } finally {
      setIsSaving(false)
    }
  }

  const handleUpdatePassword = async (e: React.FormEvent) => {
    e.preventDefault()
    if (passwords.new !== passwords.confirm) {
      toast.error("Passwords do not match")
      return
    }
    setIsSaving(true)
    try {
      const res = await fetch('/api/users/profile', {
        method: 'PATCH',
        body: JSON.stringify({ currentPassword: passwords.current, newPassword: passwords.new })
      })
      const data = await res.json()
      if (res.ok) {
        toast.success(t('settings.update_pass'))
        setPasswords({ current: "", new: "", confirm: "" })
      } else {
        toast.error(data.error || "Error")
      }
    } catch (e) {
      toast.error("System Error")
    } finally {
      setIsSaving(false)
    }
  }

  if (isPageLoading) return <div className="flex justify-center p-20"><Loader2 className="animate-spin text-blue-600" size={32} /></div>

  return (
    <div className="p-8 max-w-4xl mx-auto animate-fade-up pb-20">
      <h1 className="text-3xl font-display font-bold text-slate-900 mb-2">{t('settings.title')}</h1>
      <p className="text-slate-500 mb-10">{t('settings.settings_desc')}</p>

      <div className="space-y-8">
        {/* Language Section */}
        <div className="bg-white border border-slate-200 rounded-3xl p-6 md:p-8 shadow-sm">
          <div className="flex items-center gap-4 mb-8">
            <div className="w-12 h-12 rounded-2xl bg-blue-50 flex items-center justify-center text-blue-600 shadow-sm border border-blue-100">
              <Globe size={24} />
            </div>
            <div>
              <h2 className="text-xl font-bold text-slate-900">{t('settings.language')}</h2>
              <p className="text-sm text-slate-500">{t('settings.language_desc')}</p>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <button
              onClick={() => setLanguage('vi')}
              className={`flex items-center justify-between p-5 rounded-2xl border-2 transition-all ${language === 'vi' ? 'border-blue-500 bg-blue-50/50' : 'border-slate-100 hover:border-blue-200'}`}
            >
              <div className="flex items-center gap-4">
                <span className="text-3xl">🇻🇳</span>
                <span className={`font-bold ${language === 'vi' ? 'text-blue-900' : 'text-slate-700'}`}>Tiếng Việt</span>
              </div>
              {language === 'vi' && <div className="w-2.5 h-2.5 rounded-full bg-blue-600 shadow-[0_0_8px_rgba(37,99,235,0.4)]" />}
            </button>

            <button
              onClick={() => setLanguage('en')}
              className={`flex items-center justify-between p-5 rounded-2xl border-2 transition-all ${language === 'en' ? 'border-blue-500 bg-blue-50/50' : 'border-slate-100 hover:border-blue-200'}`}
            >
              <div className="flex items-center gap-4">
                <span className="text-3xl">🇺🇸</span>
                <span className={`font-bold ${language === 'en' ? 'text-blue-900' : 'text-slate-700'}`}>English</span>
              </div>
              {language === 'en' && <div className="w-2.5 h-2.5 rounded-full bg-blue-600 shadow-[0_0_8px_rgba(37,99,235,0.4)]" />}
            </button>
          </div>
        </div>

        {/* Profile Section */}
        <div className="bg-white border border-slate-200 rounded-3xl p-6 md:p-8 shadow-sm">
          <div className="flex items-center gap-4 mb-10">
            <div className="w-12 h-12 rounded-2xl bg-purple-50 flex items-center justify-center text-purple-600 shadow-sm border border-purple-100">
              <User size={24} />
            </div>
            <div>
              <h2 className="text-xl font-bold text-slate-900">{t('settings.profile')}</h2>
              <p className="text-sm text-slate-500">{t('settings.profile_desc')}</p>
            </div>
          </div>

          <form onSubmit={handleSaveProfile} className="space-y-10">
            {/* Avatar Selector */}
            <div className="space-y-4">
              <p className="text-sm font-bold text-slate-700">{t('settings.avatar')}</p>
              <div className="flex flex-wrap gap-4">
                {["👨‍🎓", "👩‍🎓", "👨‍💻", "👩‍💻", "🧑‍💼", "👩‍💼", "👨‍🏫", "👩‍🏫"].map(emoji => (
                  <button
                    key={emoji}
                    type="button"
                    onClick={() => setProfile({...profile, image: emoji})}
                    className={`w-16 h-16 rounded-2xl text-3xl flex items-center justify-center transition-all ${profile.image === emoji ? 'bg-blue-600 shadow-xl scale-110 text-white' : 'bg-slate-50 hover:bg-slate-100'}`}
                  >
                    {emoji}
                  </button>
                ))}
              </div>
            </div>

            {/* User Type Selector */}
            <div className="space-y-4">
               <p className="text-sm font-bold text-slate-700">{t('settings.role_q')}</p>
               <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
                 {[
                   { id: 'STUDENT', key: 'usertype.STUDENT' },
                   { id: 'PROFESSIONAL', key: 'usertype.PROFESSIONAL' },
                   { id: 'CAREER_CHANGER', key: 'usertype.CAREER_CHANGER' },
                   { id: 'INSTRUCTOR', key: 'usertype.INSTRUCTOR' }
                 ].map(role => (
                   <button
                     key={role.id}
                     type="button"
                     onClick={() => setProfile({...profile, userType: role.id})}
                     className={`px-4 py-3 rounded-xl text-xs font-bold transition-all border ${profile.userType === role.id ? 'bg-slate-900 text-white border-slate-900' : 'bg-white text-slate-600 border-slate-200 hover:border-slate-400'}`}
                   >
                     {t(role.key)}
                   </button>
                 ))}
               </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 pt-4 border-t border-slate-100">
              <Input
                label={t('settings.name')}
                value={profile.name}
                onChange={e => setProfile({...profile, name: e.target.value})}
                placeholder="..."
              />
              <Input
                label={t('settings.phone')}
                value={profile.phone}
                onChange={e => setProfile({...profile, phone: e.target.value})}
                placeholder="09xx xxx xxx"
              />
            </div>
            
            <div className="p-4 bg-slate-50 rounded-2xl border border-slate-100 flex items-center justify-between">
               <div>
                 <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-0.5">{t('settings.email_label')}</p>
                 <p className="text-sm font-semibold text-slate-600">{profile.email}</p>
               </div>
               <span className="text-[10px] bg-slate-200 text-slate-500 px-2 py-0.5 rounded font-bold">{t('settings.no_change')}</span>
            </div>

            <div className="flex justify-end pt-4">
              <Button type="submit" disabled={isSaving} className="gap-2 px-10 py-6 text-base shadow-2xl">
                {isSaving ? <Loader2 size={20} className="animate-spin" /> : <Save size={20} />}
                {t('settings.save_expert')}
              </Button>
            </div>
          </form>
        </div>

        {/* Security Section */}
        <div className="bg-white border border-slate-200 rounded-3xl p-6 md:p-8 shadow-sm">
          <div className="flex items-center gap-4 mb-8">
            <div className="w-12 h-12 rounded-2xl bg-emerald-50 flex items-center justify-center text-emerald-600 shadow-sm border border-emerald-100">
              <Shield size={24} />
            </div>
            <div>
              <h2 className="text-xl font-bold text-slate-900">{t('settings.security')}</h2>
              <p className="text-sm text-slate-500">{t('settings.security_desc')}</p>
            </div>
          </div>

          <form onSubmit={handleUpdatePassword} className="space-y-6 max-w-xl">
            <Input
              label={t('settings.current_pass')}
              type="password"
              value={passwords.current}
              onChange={e => setPasswords({...passwords, current: e.target.value})}
              placeholder="••••••••"
            />
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <Input
                label={t('settings.new_pass')}
                type="password"
                value={passwords.new}
                onChange={e => setPasswords({...passwords, new: e.target.value})}
                placeholder="••••••••"
              />
              <Input
                label={t('settings.confirm_pass')}
                type="password"
                value={passwords.confirm}
                onChange={e => setPasswords({...passwords, confirm: e.target.value})}
                placeholder="••••••••"
              />
            </div>
            <div className="flex justify-end pt-2">
              <Button type="submit" variant="secondary" disabled={isSaving} className="gap-2">
                <Lock size={16} /> {t('settings.update_pass')}
              </Button>
            </div>
          </form>
        </div>
      </div>
    </div>
  )
}
