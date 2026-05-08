"use client"

import { ReactNode } from "react"
import { GraduationCap, CheckCircle2 } from "lucide-react"
import { LanguageToggle } from "@/components/layout/LanguageToggle"
import { useLanguage } from "@/context/LanguageContext"

export default function AuthLayout({ children }: { children: ReactNode }) {
  const { t } = useLanguage()

  return (
    <div className="flex min-h-screen bg-white">
      <LanguageToggle />
      {/* Left Panel - Branding (Hidden on mobile) */}
      <div className="hidden md:flex flex-col w-1/2 p-12 text-white relative overflow-hidden">
        {/* Background Image Tag for maximum reliability */}
        <img 
          src="https://images.unsplash.com/photo-1516321318423-f06f85e504b3?q=80&w=2070"
          alt="Learning Background"
          className="absolute inset-0 w-full h-full object-cover"
        />
        
        {/* Dark Blue Overlay */}
        <div className="absolute inset-0 bg-blue-900/70" />
        
        {/* Decorative Circles */}
        <div className="absolute top-[-10%] right-[-5%] w-[400px] h-[400px] rounded-full bg-blue-400/20 blur-3xl pointer-events-none" />
        <div className="absolute bottom-[-10%] left-[-10%] w-[500px] h-[500px] rounded-full bg-blue-600/10 blur-3xl pointer-events-none" />
        
        <div className="relative z-10">
          <div className="flex items-center gap-3 mb-20">
            <div className="w-10 h-10 rounded-xl bg-white/20 flex items-center justify-center backdrop-blur-sm">
              <GraduationCap size={24} className="text-white" />
            </div>
            <span className="font-display font-extrabold text-2xl tracking-tight text-white">VieSync</span>
          </div>
 
          <h1 className="font-display font-bold text-[2.5rem] leading-[1.2] mb-12 text-white max-w-sm">
            {t('auth.title')}
          </h1>

          <div className="space-y-6">
            <div className="flex items-center gap-4">
              <CheckCircle2 size={24} className="text-cyan-300 flex-shrink-0" />
              <span className="text-lg font-medium text-white/90">{t('auth.check1')}</span>
            </div>
            <div className="flex items-center gap-4">
              <CheckCircle2 size={24} className="text-cyan-300 flex-shrink-0" />
              <span className="text-lg font-medium text-white/90">{t('auth.check2')}</span>
            </div>
            <div className="flex items-center gap-4">
              <CheckCircle2 size={24} className="text-cyan-300 flex-shrink-0" />
              <span className="text-lg font-medium text-white/90">{t('auth.check3')}</span>
            </div>
          </div>
        </div>

        <div className="mt-auto relative z-10 flex items-center gap-4">
          <div className="flex -space-x-3">
            <div className="w-10 h-10 rounded-full border-2 border-blue-600 bg-blue-300" />
            <div className="w-10 h-10 rounded-full border-2 border-blue-600 bg-cyan-300" />
            <div className="w-10 h-10 rounded-full border-2 border-blue-600 bg-emerald-300" />
            <div className="w-10 h-10 rounded-full border-2 border-blue-600 bg-white/20 backdrop-blur-sm flex items-center justify-center text-xs font-bold">+</div>
          </div>
          <span className="text-sm font-medium text-white/80">{t('auth.joined')}</span>
        </div>
      </div>
...

      {/* Right Panel - Form */}
      <div className="flex-1 flex flex-col justify-center items-center p-6 md:p-12 animate-fade-up relative">
        <div className="w-full max-w-[400px]">
          {/* Mobile Logo */}
          <div className="flex md:hidden items-center gap-2 mb-8">
            <div className="w-8 h-8 rounded-lg bg-blue-600 flex items-center justify-center">
              <GraduationCap size={20} className="text-white" />
            </div>
            <span className="font-display font-bold text-xl text-slate-900">VieSync</span>
          </div>
          
          {children}
        </div>
      </div>
    </div>
  )
}
