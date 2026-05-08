"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"
import { Check, ChevronLeft, Loader2, GraduationCap } from "lucide-react"
import { Button } from "@/components/ui/Button"
import { toast } from "sonner"

const USER_ROLES = [
  { id: "STUDENT", label: "Sinh viên / Học sinh", desc: "Đang học tại trường, chuẩn bị ra trường", icon: "🎓" },
  { id: "PROFESSIONAL", label: "Người đi làm", desc: "Muốn nâng cao kỹ năng trong công việc hiện tại", icon: "💼" },
  { id: "CAREER_CHANGER", label: "Người chuyển ngành", desc: "Muốn thay đổi hướng nghề nghiệp", icon: "🔄" },
  { id: "INSTRUCTOR", label: "Giảng viên / Chuyên gia", desc: "Muốn chia sẻ kiến thức và xây dựng thương hiệu", icon: "👨‍🏫" },
]

const INTERESTS = [
  { id: "management", label: "Quản trị & Lãnh đạo", desc: "Ra quyết định, quản lý đội nhóm, tư duy chiến lược", icon: "🏢", color: "bg-blue-500" },
  { id: "softskills", label: "Kỹ năng mềm & Giao tiếp", desc: "Thuyết trình, đàm phán, xử lý xung đột", icon: "💬", color: "bg-emerald-500" },
  { id: "it", label: "Lập trình & Công nghệ", desc: "Python, web development, tư duy kỹ thuật", icon: "💻", color: "bg-purple-500" },
  { id: "marketing", label: "Marketing & Truyền thông", desc: "Content, quảng cáo số, xây dựng thương hiệu", icon: "📣", color: "bg-orange-500" },
]

const PAIN_POINTS = [
  "Thiếu kỹ năng thực tế để xin việc",
  "Học xong không áp dụng được vào thực tế",
  "Không có thời gian học tập trung",
  "Cảm thấy cô đơn, thiếu động lực khi học online",
  "Không biết bắt đầu từ đâu",
  "Nội dung quá lý thuyết, không cập nhật",
]

export default function OnboardingPage() {
  const router = useRouter()
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
              <h1 className="font-display font-bold text-3xl text-slate-900 mb-2">Xin chào! Hãy cho chúng tôi biết về bạn 👋</h1>
              <p className="text-slate-500">Chúng tôi sẽ tùy chỉnh lộ trình học phù hợp nhất với bạn</p>
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
                    <p className="font-semibold text-slate-800">{opt.label}</p>
                    <p className="text-sm text-slate-500 mt-0.5">{opt.desc}</p>
                  </div>
                  <div className={`w-5 h-5 rounded-full border-2 flex items-center justify-center shrink-0 ${role === opt.id ? 'border-blue-500 bg-blue-500' : 'border-slate-300'}`}>
                    {role === opt.id && <Check size={12} className="text-white" strokeWidth={3} />}
                  </div>
                </div>
              ))}
            </div>
            <Button className="w-full mt-8" disabled={!role} onClick={() => setStep(2)}>
              Tiếp theo →
            </Button>
          </div>
        )}

        {/* Step 2 */}
        {step === 2 && (
          <div className="animate-fade-up">
            <button onClick={() => setStep(1)} className="flex items-center gap-1 text-sm font-semibold text-slate-500 hover:text-blue-600 mb-4 transition-colors">
              <ChevronLeft size={16} /> Quay lại
            </button>
            <div className="text-center mb-8">
              <h1 className="font-display font-bold text-3xl text-slate-900 mb-2">Bạn muốn phát triển kỹ năng gì?</h1>
              <span className="inline-block bg-blue-50 text-blue-600 text-xs font-semibold px-3 py-1 rounded-full border border-blue-100">Có thể chọn nhiều lĩnh vực</span>
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
              <span className="text-sm font-semibold text-slate-500">Đã chọn <span className="text-blue-600">{interests.length}</span> lĩnh vực</span>
              <Button disabled={interests.length === 0} onClick={() => setStep(3)}>Tiếp theo →</Button>
            </div>
          </div>
        )}

        {/* Step 3 */}
        {step === 3 && (
          <div className="animate-fade-up">
            <button onClick={() => setStep(2)} className="flex items-center gap-1 text-sm font-semibold text-slate-500 hover:text-blue-600 mb-4 transition-colors">
              <ChevronLeft size={16} /> Quay lại
            </button>
            <div className="text-center mb-8">
              <h1 className="font-display font-bold text-3xl text-slate-900 mb-2">Điều gì đang cản trở bạn phát triển?</h1>
              <p className="text-slate-500">Giúp chúng tôi hiểu để đề xuất đúng giải pháp</p>
            </div>
            <div className="flex flex-wrap gap-2.5 mb-6">
              {PAIN_POINTS.map(point => (
                <button
                  key={point}
                  onClick={() => togglePainPoint(point)}
                  className={`px-4 py-2.5 rounded-full border text-sm font-semibold transition-all duration-200 ${painPoints.includes(point) ? 'bg-blue-600 text-white border-blue-600 shadow-[0_4px_12px_rgba(37,99,235,0.25)]' : 'bg-white text-slate-600 border-[#E2EAF4] hover:border-blue-300 hover:bg-blue-50'}`}
                >
                  {point}
                </button>
              ))}
            </div>
            <input
              type="text"
              placeholder="Thêm vấn đề khác của bạn... (tuỳ chọn)"
              value={otherPainPoint}
              onChange={e => setOtherPainPoint(e.target.value)}
              className="w-full mb-8 bg-white border border-[#E2EAF4] focus:border-blue-400 focus:ring-4 focus:ring-blue-100 rounded-xl px-4 py-3 text-slate-800 placeholder:text-slate-400 text-sm outline-none transition-all"
            />
            {isSubmitting && (
              <div className="mb-8 p-6 rounded-2xl bg-blue-50 border border-blue-200 text-blue-700 flex items-center gap-4 animate-pulse">
                <Loader2 size={24} className="animate-spin" />
                <p className="font-bold">Đang hoàn tất hồ sơ và chuyển hướng...</p>
              </div>
            )}

            <Button
              className="w-full text-base py-7 rounded-2xl shadow-xl bg-blue-600 hover:bg-blue-700"
              disabled={isSubmitting || (painPoints.length === 0 && !otherPainPoint)}
              onClick={handleComplete}
            >
              {isSubmitting ? "Vui lòng chờ..." : "Bắt đầu học ngay 🚀"}
            </Button>
          </div>
        )}
      </div>
    </div>
  )
}
