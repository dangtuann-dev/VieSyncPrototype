"use client"

import { useLanguage } from "@/context/LanguageContext"
import { Globe } from "lucide-react"

export function LanguageToggle() {
  const { language, setLanguage } = useLanguage()

  return (
    <div className="fixed top-6 right-6 z-50">
      <div className="flex items-center gap-1 bg-white/80 backdrop-blur-md border border-slate-200 p-1 rounded-full shadow-sm">
        <button
          onClick={() => setLanguage('vi')}
          className={`flex items-center gap-2 px-3 py-1.5 rounded-full text-[10px] font-bold transition-all ${language === 'vi' ? 'bg-blue-600 text-white shadow-md' : 'text-slate-600 hover:bg-slate-100'}`}
        >
          <span>🇻🇳</span>
          <span>VN</span>
        </button>
        <button
          onClick={() => setLanguage('en')}
          className={`flex items-center gap-2 px-3 py-1.5 rounded-full text-[10px] font-bold transition-all ${language === 'en' ? 'bg-blue-600 text-white shadow-md' : 'text-slate-600 hover:bg-slate-100'}`}
        >
          <span>🇺🇸</span>
          <span>EN</span>
        </button>
      </div>
    </div>
  )
}
