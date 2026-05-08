"use client"

import Link from "next/link"
import { useLanguage } from "@/context/LanguageContext"
import { usePathname } from "next/navigation"

export function AdminHeader() {
  const { t } = useLanguage()
  const pathname = usePathname()

  return (
    <>
      {/* Breadcrumb */}
      <div className="flex items-center gap-2 text-[11px] font-bold uppercase tracking-widest text-slate-400 mb-6">
        <Link href="/dashboard" className="text-blue-600 hover:text-blue-700 flex items-center gap-2 transition-colors">
          <i className="fa-solid fa-house text-xs"></i> {t('common.home')}
        </Link>
        <i className="fa-solid fa-chevron-right text-[8px] opacity-50"></i>
        <span className="text-slate-500">{t('common.system_management')}</span>
      </div>

      <div className="flex items-center justify-between mb-10">
        <div>
          <h1 className="text-4xl font-display font-black text-slate-900 tracking-tight mb-2">
            {t('admin.management')} <i className="fa-solid fa-screwdriver-wrench text-blue-600 ml-2 text-2xl"></i>
          </h1>
          <p className="text-slate-500 font-bold text-sm opacity-80">{t('admin.description')}</p>
        </div>
      </div>

      {/* Admin Tabs */}
      <div className="flex items-center gap-2 p-1.5 bg-slate-100 rounded-[1.25rem] w-fit mb-10 border border-slate-200/60 overflow-x-auto max-w-full shadow-inner">
        <AdminTab href="/admin" icon="fa-solid fa-chart-pie" label={t('admin.overview')} active={pathname === '/admin'} />
        <AdminTab href="/admin/users" icon="fa-solid fa-users-gear" label={t('admin.users')} active={pathname === '/admin/users'} />
        <AdminTab href="/admin/courses" icon="fa-solid fa-book-open" label={t('admin.courses')} active={pathname === '/admin/courses'} />
        <AdminTab href="/admin/live" icon="fa-solid fa-headset" label={t('admin.live_sessions_tab')} active={pathname === '/admin/live'} />
      </div>
    </>
  )
}

function AdminTab({ href, icon, label, active }: { href: string; icon: string; label: string; active: boolean }) {
  return (
    <Link
      href={href}
      className={`flex items-center gap-2.5 px-6 py-3 rounded-2xl text-sm font-black transition-all whitespace-nowrap ${
        active 
          ? 'bg-white text-blue-600 shadow-xl shadow-blue-100 border border-blue-50' 
          : 'text-slate-500 hover:text-blue-600 hover:bg-white/50'
      }`}
    >
      <i className={`${icon} text-base`}></i>
      {label}
    </Link>
  )
}
