"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"
import { Check, ChevronLeft, Loader2, GraduationCap } from "lucide-react"
import { Button } from "@/components/ui/Button"
import { toast } from "sonner"

import { useLanguage } from "@/context/LanguageContext"

const USER_ROLES = [
  { id: "STUDENT", labelKey: "onboarding.role_student", descKey: "onboarding.role_student_desc", icon: "🎓" },
  { id: "PROFESSIONAL", labelKey: "onboarding.role_professional", descKey: "onboarding.role_professional_desc", icon: "💼" },
  { id: "CAREER_CHANGER", labelKey: "onboarding.role_changer", descKey: "onboarding.role_changer_desc", icon: "🔄" },
  { id: "INSTRUCTOR", labelKey: "onboarding.role_instructor", descKey: "onboarding.role_instructor_desc", icon: "👨‍🏫" },
]

const INTERESTS = [
  { id: "management", labelKey: "onboarding.int_management", descKey: "onboarding.int_management_desc", icon: "🏢", color: "bg-blue-500" },
  { id: "softskills", labelKey: "onboarding.int_softskills", descKey: "onboarding.int_softskills_desc", icon: "💬", color: "bg-emerald-500" },
  { id: "it", labelKey: "onboarding.int_it", descKey: "onboarding.int_it_desc", icon: "💻", color: "bg-purple-500" },
  { id: "marketing", labelKey: "onboarding.int_marketing", descKey: "onboarding.int_marketing_desc", icon: "📣", color: "bg-orange-500" },
]

const PAIN_POINTS = [
  { id: "Thiếu kỹ năng thực tế để xin việc", key: "onboarding.pain_skills" },
  { id: "Học xong không áp dụng được vào thực tế", key: "onboarding.pain_apply" },
  { id: "Không có thời gian học tập trung", key: "onboarding.pain_time" },
  { id: "Cảm thấy cô đơn, thiếu động lực khi học online", key: "onboarding.pain_lonely" },
  { id: "Không biết bắt đầu từ đâu", key: "onboarding.pain_start" },
  { id: "Nội dung quá lý thuyết, không cập nhật", key: "onboarding.pain_theory" },
]


export default function OnboardingPage() {
  const router = useRouter()
  const { t } = useLanguage()
  const [step, setStep] = useState(1)
  const [role, setRole] = useState("")
  const [interests, setInterests] = useState<string[]>([])
  const [painPoints, setPainPoints] = useState<string[]>([])
  const [otherPainPoint, setOtherPainPoint] = useState("")
  const [isSubmitting, setIsSubmitting] = useState(false)


  const toggleInterest = (id: string) =>
    setInterests(prev => prev.includes(id) ? prev.filter(i => i !== id) : [...prev, id])

  const togglePainPoint = (point: string) =>
    setPainPoints(prev => prev.includes(point) ? prev.filter(p => p !== point) : [...prev, point])

  const handleComplete = async () => {
    setIsSubmitting(true)
    try {
      const res = await fetch('/api/users/onboarding', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          userType: role,
          interests,
          painPoints: [...painPoints, otherPainPoint].filter(Boolean)
        })
      })

      if (res.ok) {
        window.location.href = "/dashboard"
      } else {
        toast.error("Có lỗi xảy ra", { description: "Vui lòng thử lại" })
        setIsSubmitting(false)
      }
    } catch {
      toast.error("Lỗi kết nối")
      setIsSubmitting(false)
    }
  }

  return (
    <div className="min-h-screen bg-[var(--surface)] flex flex-col py-12 px-4 relative">
      <div className="absolute top-6 left-6 md:top-10 md:left-10">
        <div className="flex items-center gap-2">
          <div className="w-8 h-8 rounded-lg bg-blue-600 flex items-center justify-center">
            <GraduationCap size={18} className="text-white" />
          </div>
          <span className="font-display font-bold text-slate-800">BlenEdU</span>
        </div>
      </div>

      <div className="w-full max-w-[560px] mx-auto mt-12">
        {/* Step indicators */}
        <div className="flex items-center gap-2 mb-10 w-[200px] mx-auto">
          {[1, 2, 3].map(s => (
            <div key={s} className="flex items-center gap-2 flex-1 last:flex-none">
              <div className={`
                w-8 h-8 rounded-full flex items-center justify-center text-sm font-bold shrink-0 transition-all duration-300
                ${step >= s ? 'bg-blue-600 text-white shadow-[0_4px_12px_rgba(59,130,246,0.4)]' : 'bg-white border-2 border-[#E2EAF4] text-slate-400'}
              `}>{step > s ? <Check size={14} strokeWidth={3} /> : s}</div>
              {s < 3 && (
                <div className={`flex-1 h-0.5 rounded min-w-8 transition-all duration-500 ${step > s ? 'bg-blue-500' : 'bg-[#E2EAF4]'}`} />
              )}
            </div>
          ))}
        </div>

        {/* Step 1 */}
        {step === 1 && (
          <div className="animate-fade-up">
            <div className="text-center mb-8">
              <h1 className="font-display font-bold text-3xl text-slate-900 mb-2">{t('onboarding.step1_title')}</h1>
              <p className="text-slate-500">{t('onboarding.step1_desc')}</p>
            </div>
            <div className="space-y-3">
              {USER_ROLES.map(opt => (
                <div
                  key={opt.id}
                  onClick={() => setRole(opt.id)}
                  className={`flex items-center gap-4 p-4 border-2 rounded-xl cursor-pointer transition-all duration-200 ${role === opt.id ? 'border-blue-500 bg-blue-50 shadow-[0_0_0_4px_rgba(59,130,246,0.1)]' : 'border-[#E2EAF4] bg-white hover:border-blue-200 hover:bg-blue-50/40'}`}
                >
                  <div className={`w-12 h-12 rounded-xl flex items-center justify-center text-2xl shrink-0 ${role === opt.id ? 'bg-blue-100' : 'bg-slate-50'}`}>{opt.icon}</div>
                  <div className="flex-1">
                    <p className="font-semibold text-slate-800">{t(opt.labelKey)}</p>
                    <p className="text-sm text-slate-500 mt-0.5">{t(opt.descKey)}</p>
                  </div>
                  <div className={`w-5 h-5 rounded-full border-2 flex items-center justify-center shrink-0 ${role === opt.id ? 'border-blue-500 bg-blue-500' : 'border-slate-300'}`}>
                    {role === opt.id && <Check size={12} className="text-white" strokeWidth={3} />}
                  </div>
                </div>
              ))}
            </div>
            <Button className="w-full mt-8" disabled={!role} onClick={() => setStep(2)}>
              {t('onboarding.step_next')}
            </Button>
          </div>
        )}

        {/* Step 2 */}
        {step === 2 && (
          <div className="animate-fade-up">
            <button onClick={() => setStep(1)} className="flex items-center gap-1 text-sm font-semibold text-slate-500 hover:text-blue-600 mb-4 transition-colors">
              <ChevronLeft size={16} /> {t('onboarding.step_back')}
            </button>
            <div className="text-center mb-8">
              <h1 className="font-display font-bold text-3xl text-slate-900 mb-2">{t('onboarding.step2_title')}</h1>
              <span className="inline-block bg-blue-50 text-blue-600 text-xs font-semibold px-3 py-1 rounded-full border border-blue-100">{t('onboarding.step2_desc')}</span>
            </div>
            <div className="space-y-3">
              {INTERESTS.map(opt => (
                <div
                  key={opt.id}
                  onClick={() => toggleInterest(opt.id)}
                  className={`flex items-center gap-4 p-4 relative overflow-hidden border-2 rounded-xl cursor-pointer transition-all duration-200 ${interests.includes(opt.id) ? 'border-blue-500 bg-blue-50 shadow-[0_0_0_4px_rgba(59,130,246,0.1)]' : 'border-[#E2EAF4] bg-white hover:border-blue-200 hover:bg-blue-50/40'}`}
                >
                  <div className={`absolute left-0 top-0 bottom-0 w-1 ${opt.color}`} />
                  <div className={`w-12 h-12 ml-2 rounded-xl flex items-center justify-center text-2xl shrink-0 ${interests.includes(opt.id) ? 'bg-blue-100' : 'bg-slate-50'}`}>{opt.icon}</div>
                  <div className="flex-1">
                    <p className="font-semibold text-slate-800">{opt.label}</p>
                    <p className="text-sm text-slate-500 mt-0.5">{opt.desc}</p>
                  </div>
                  <div className={`w-5 h-5 rounded border-2 flex items-center justify-center shrink-0 ${interests.includes(opt.id) ? 'border-blue-500 bg-blue-500' : 'border-slate-300'}`}>
                    {interests.includes(opt.id) && <Check size={12} className="text-white" strokeWidth={3} />}
                  </div>
                </div>
              ))}
            </div>
            <div className="mt-6 flex items-center justify-between">
              <span className="text-sm font-semibold text-slate-500">{t('onboarding.step2_count')} <span className="text-blue-600">{interests.length}</span> {t('onboarding.step2_field')}</span>
              <Button disabled={interests.length === 0} onClick={() => setStep(3)}>{t('onboarding.step_next')}</Button>
            </div>
          </div>
        )}

        {/* Step 3 */}
        {step === 3 && (
          <div className="animate-fade-up">
            <button onClick={() => setStep(2)} className="flex items-center gap-1 text-sm font-semibold text-slate-500 hover:text-blue-600 mb-4 transition-colors">
              <ChevronLeft size={16} /> {t('onboarding.step_back')}
            </button>
            <div className="text-center mb-8">
              <h1 className="font-display font-bold text-3xl text-slate-900 mb-2">{t('onboarding.step3_title')}</h1>
              <p className="text-slate-500">{t('onboarding.step3_desc')}</p>
            </div>
            <div className="flex flex-wrap gap-2.5 mb-6">
              {PAIN_POINTS.map(point => (
                <button
                  key={point.id}
                  onClick={() => togglePainPoint(point.id)}
                  className={`px-4 py-2.5 rounded-full border text-sm font-semibold transition-all duration-200 ${painPoints.includes(point.id) ? 'bg-blue-600 text-white border-blue-600 shadow-[0_4px_12px_rgba(37,99,235,0.25)]' : 'bg-white text-slate-600 border-[#E2EAF4] hover:border-blue-300 hover:bg-blue-50'}`}
                >
                  {t(point.key)}
                </button>
              ))}
            </div>
            <input
              type="text"
              placeholder={t('onboarding.step3_other')}
              value={otherPainPoint}
              onChange={e => setOtherPainPoint(e.target.value)}
              className="w-full mb-8 bg-white border border-[#E2EAF4] focus:border-blue-400 focus:ring-4 focus:ring-blue-100 rounded-xl px-4 py-3 text-slate-800 placeholder:text-slate-400 text-sm outline-none transition-all"
            />
            {isSubmitting && (
              <div className="mb-8 p-6 rounded-2xl bg-blue-50 border border-blue-200 text-blue-700 flex items-center gap-4 animate-pulse">
                <Loader2 size={24} className="animate-spin" />
                <p className="font-bold">{t('onboarding.step3_submitting')}</p>
              </div>
            )}

            <Button
              className="w-full text-base py-7 rounded-2xl shadow-xl bg-blue-600 hover:bg-blue-700"
              disabled={isSubmitting || (painPoints.length === 0 && !otherPainPoint)}
              onClick={handleComplete}
            >
              {isSubmitting ? t('onboarding.please_wait') : t('onboarding.step3_finish')}
            </Button>
          </div>
        )}
      </div>
    </div>
  )
}
