"use client"

import { useState, useEffect } from "react"
import Link from "next/link"
import { usePathname } from "next/navigation"
import { logoutAction } from "@/lib/actions/auth"
import { useLanguage } from "@/context/LanguageContext"

const NAV_ITEMS = [
  { href: "/dashboard", labelKey: "nav.home", icon: "fa-solid fa-house" },
  { href: "/my-courses", labelKey: "nav.my_courses", icon: "fa-solid fa-book-bookmark" },
  { href: "/live", labelKey: "nav.live", icon: "fa-solid fa-video" },
  { href: "/explore", labelKey: "nav.explore", icon: "fa-solid fa-compass" },
]

interface SidebarProps {
  isAdmin?: boolean
  userName?: string
  userEmail?: string
}

export function Sidebar({ isAdmin, userName, userEmail }: SidebarProps) {
  const pathname = usePathname()
  const [isOpen, setIsOpen] = useState(false)
  const [isCollapsed, setIsCollapsed] = useState(false)
  const { t } = useLanguage()
  
  const isActive = (path: string) => pathname === path

  const toggleSidebar = () => setIsOpen(!isOpen)
  
  // Persist collapse state
  useEffect(() => {
    const saved = localStorage.getItem("sidebar_collapsed") === "true"
    setIsCollapsed(saved)
    // Update a CSS variable on the document to let the layout know the sidebar width
    document.documentElement.style.setProperty('--sidebar-width', saved ? '80px' : '256px')
  }, [])

  const toggleCollapse = () => {
    const newState = !isCollapsed
    setIsCollapsed(newState)
    localStorage.setItem("sidebar_collapsed", String(newState))
    document.documentElement.style.setProperty('--sidebar-width', newState ? '80px' : '256px')
  }

  return (
    <>
      {/* Mobile Header */}
      <div className="lg:hidden fixed top-0 left-0 right-0 h-16 bg-white border-b border-slate-200 px-4 flex items-center justify-between z-50">
        <div className="flex items-center gap-2">
          <div className="w-8 h-8 rounded-lg bg-blue-600 flex items-center justify-center">
            <i className="fa-solid fa-graduation-cap text-white text-xs"></i>
          </div>
          <span className="font-display font-bold text-slate-800">VieSync</span>
        </div>
        <button onClick={toggleSidebar} className="p-2 text-slate-600 hover:bg-slate-100 rounded-lg">
          <i className={`fa-solid ${isOpen ? 'fa-xmark' : 'fa-bars'} text-xl`}></i>
        </button>
      </div>

      {/* Overlay */}
      {isOpen && (
        <div 
          className="fixed inset-0 bg-slate-900/50 backdrop-blur-sm z-40 lg:hidden"
          onClick={() => setIsOpen(false)}
        />
      )}

      {/* Sidebar Container */}
      <aside className={`
        fixed left-0 top-0 h-screen bg-white border-r border-[#E2EAF4] flex flex-col z-40 transition-all duration-300
        ${isCollapsed ? 'w-20' : 'w-64'}
        ${isOpen ? 'translate-x-0' : '-translate-x-full lg:translate-x-0'}
      `}>
        {/* Collapse Toggle Button (Desktop) */}
        <button 
          onClick={toggleCollapse}
          className="hidden lg:flex absolute -right-3 top-10 w-6 h-6 bg-white border border-slate-200 rounded-full items-center justify-center text-slate-400 hover:text-blue-600 hover:border-blue-300 shadow-sm z-50 transition-all"
        >
          <i className={`fa-solid ${isCollapsed ? 'fa-chevron-right' : 'fa-chevron-left'} text-[10px]`}></i>
        </button>

        {/* Logo */}
        <div className={`flex items-center gap-2.5 mb-10 p-6 ${isCollapsed ? 'justify-center' : ''}`}>
          <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-blue-600 to-blue-400 flex items-center justify-center shadow-lg shadow-blue-200 shrink-0">
            <i className="fa-solid fa-graduation-cap text-white text-lg"></i>
          </div>
          {!isCollapsed && <span className="font-display font-extrabold text-xl tracking-tight text-slate-900 animate-in fade-in duration-500">VieSync</span>}
        </div>

        {/* Nav */}
        <div className="flex-1 space-y-1.5 px-4">
          {NAV_ITEMS.map(item => {
            const isLiveItem = item.href === "/live"
            const active = isActive(item.href)
            return (
              <Link
                key={item.href}
                href={item.href}
                onClick={() => setIsOpen(false)}
                title={isCollapsed ? t(item.labelKey) : ""}
                className={`
                  flex items-center gap-3.5 px-3.5 py-3 rounded-xl
                  font-bold text-sm transition-all duration-200 relative
                  ${isCollapsed ? 'justify-center' : ''}
                  ${active
                    ? 'bg-blue-600 text-white shadow-xl shadow-blue-100'
                    : 'text-slate-500 hover:bg-blue-50 hover:text-blue-600'}
                `}
              >
                <i className={`${item.icon} text-base shrink-0`}></i>
                {!isCollapsed && <span className="truncate">{t(item.labelKey)}</span>}
                {isLiveItem && active && !isCollapsed && (
                  <span className="ml-auto flex h-2 w-2 rounded-full bg-red-500 shadow-[0_0_10px_rgba(239,68,68,0.6)]"></span>
                )}
                {isLiveItem && isCollapsed && (
                  <span className="absolute top-2 right-2 flex h-2 w-2 rounded-full bg-red-500"></span>
                )}
              </Link>
            )
          })}

          {isAdmin && (
            <>
              <div className="my-5 h-px bg-slate-100 mx-2" />
              <Link
                href="/admin"
                onClick={() => setIsOpen(false)}
                title={isCollapsed ? t('nav.admin') : ""}
                className={`
                  flex items-center gap-3.5 px-3.5 py-3 rounded-xl mb-1
                  font-extrabold text-sm transition-all duration-200 group relative
                  ${isCollapsed ? 'justify-center' : ''}
                  ${pathname.startsWith('/admin')
                    ? 'bg-slate-900 text-white shadow-xl'
                    : 'bg-blue-50/50 border border-blue-100 text-blue-700 hover:bg-blue-100/50 hover:border-blue-200'}
                `}
              >
                <div className="relative shrink-0">
                  <i className="fa-solid fa-gauge-high text-base"></i>
                  {!pathname.startsWith('/admin') && (
                    <span className="absolute -top-1 -right-1 w-2.5 h-2.5 bg-blue-500 rounded-full border-2 border-white" />
                  )}
                </div>
                {!isCollapsed && <span className="truncate">{t('nav.admin')}</span>}
                {!isCollapsed && <i className="fa-solid fa-chevron-right ml-auto text-[10px] opacity-40 group-hover:translate-x-0.5 transition-transform"></i>}
              </Link>
            </>
          )}
        </div>

        {/* User Info & Settings & Logout */}
        <div className="mt-auto space-y-2 p-4">
          <Link
            href="/settings"
            onClick={() => setIsOpen(false)}
            title={isCollapsed ? t('nav.settings') : ""}
            className={`
              flex items-center gap-3.5 px-3.5 py-3 rounded-xl
              font-bold text-sm transition-all duration-200
              ${isCollapsed ? 'justify-center' : ''}
              ${isActive('/settings')
                ? 'bg-slate-800 text-white shadow-xl'
                : 'text-slate-500 hover:bg-slate-50 hover:text-slate-900'}
            `}
          >
            <i className="fa-solid fa-gear text-base shrink-0"></i>
            {!isCollapsed && <span className="truncate">{t('nav.settings')}</span>}
          </Link>

          {!isCollapsed ? (
            <div className="flex items-center gap-3 p-3 rounded-2xl bg-slate-50 border border-slate-100">
              <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-indigo-500 to-blue-500 flex items-center justify-center text-white font-bold text-sm shadow-sm shrink-0">
                {userName?.[0]?.toUpperCase() || '?'}
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-sm font-bold text-slate-900 truncate">{userName || 'User'}</p>
                <p className="text-[10px] text-slate-400 font-medium truncate">{userEmail}</p>
              </div>
            </div>
          ) : (
            <div className="w-10 h-10 mx-auto rounded-xl bg-gradient-to-br from-indigo-500 to-blue-500 flex items-center justify-center text-white font-bold text-sm shadow-sm">
              {userName?.[0]?.toUpperCase() || '?'}
            </div>
          )}
          
          <form action={logoutAction}>
            <button
              type="submit"
              className={`w-full flex items-center gap-2 px-3.5 py-3 rounded-xl text-sm font-bold text-slate-400 hover:text-red-600 hover:bg-red-50 transition-all ${isCollapsed ? 'justify-center' : ''}`}
            >
              <i className="fa-solid fa-right-from-bracket text-base"></i> 
              {!isCollapsed && <span>{t('nav.logout')}</span>}
            </button>
          </form>
        </div>
      </aside>
    </>
  )
}
