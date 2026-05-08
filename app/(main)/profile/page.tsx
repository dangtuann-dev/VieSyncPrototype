"use client"

import { useState } from "react"
import { User as UserIcon, Mail, Lock, Edit3 } from "lucide-react"
import { Button } from "@/components/ui/Button"
import { Input } from "@/components/ui/Input"
import { toast } from "sonner"

export default function ProfilePage() {
  const [name, setName] = useState("")
  const [phone, setPhone] = useState("")
  const [isSaving, setIsSaving] = useState(false)

  const [currentPassword, setCurrentPassword] = useState("")
  const [newPassword, setNewPassword] = useState("")
  const [confirmPassword, setConfirmPassword] = useState("")

  const handleUpdateProfile = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsSaving(true)
    setTimeout(() => {
      toast.success("Đã cập nhật hồ sơ!")
      setIsSaving(false)
    }, 1000)
  }

  const handleUpdatePassword = async (e: React.FormEvent) => {
    e.preventDefault()
    if (newPassword !== confirmPassword) {
      toast.error("Mật khẩu xác nhận không khớp")
      return
    }
    toast.success("Mật khẩu đã được thay đổi")
    setCurrentPassword("")
    setNewPassword("")
    setConfirmPassword("")
  }

  const strengthLevel = newPassword.length === 0 ? 0 : newPassword.length < 6 ? 1 : newPassword.length < 10 ? 2 : 3
  const strengthColor = ["bg-slate-200", "bg-red-500", "bg-yellow-500", "bg-emerald-500"][strengthLevel]

  return (
    <div className="p-8 max-w-3xl mx-auto animate-fade-up">
      <div className="flex flex-col items-center mb-10 text-center">
        <div className="relative mb-4 group cursor-pointer">
          <div className="w-24 h-24 rounded-full border-4 border-white shadow-md bg-gradient-to-br from-blue-500 to-cyan-400 flex items-center justify-center text-4xl">
            👤
          </div>
          <div className="absolute inset-0 bg-black/40 rounded-full opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
            <Edit3 size={20} className="text-white" />
          </div>
        </div>
        <h1 className="text-2xl font-display font-bold text-slate-900 mb-1">Hồ sơ của tôi</h1>
        <p className="text-slate-500 text-sm flex items-center gap-1 justify-center">
          <Mail size={14} /> Email đã đăng ký
        </p>
      </div>

      <div className="space-y-6">
        {/* Profile Info */}
        <div className="bg-white border border-[#E2EAF4] rounded-2xl p-6 md:p-8 shadow-sm">
          <h2 className="text-lg font-display font-bold text-slate-900 mb-5 flex items-center gap-2">
            <UserIcon size={18} className="text-blue-500" /> Thông tin cá nhân
          </h2>
          <form onSubmit={handleUpdateProfile} className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <Input
                label="Họ và tên"
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="Nguyễn Văn A"
              />
              <Input
                label="Số điện thoại"
                value={phone}
                onChange={(e) => setPhone(e.target.value)}
                placeholder="09xx xxx xxx"
              />
            </div>
            <div className="pt-2 flex justify-end">
              <Button type="submit" disabled={isSaving}>
                {isSaving ? "Đang lưu..." : "Lưu thay đổi"}
              </Button>
            </div>
          </form>
        </div>

        {/* Recommended Path */}
        <div className="bg-gradient-to-br from-blue-50 to-cyan-50 border border-blue-100 rounded-2xl p-6 md:p-8">
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
            <div>
              <p className="text-xs font-bold text-blue-600 uppercase tracking-wider mb-1">🤖 Được AI gợi ý</p>
              <h3 className="text-lg font-display font-bold text-slate-900">Lộ trình học tập của bạn</h3>
              <p className="text-sm text-slate-600 mt-1">Dựa trên những lĩnh vực quan tâm và vấn đề bạn đã chọn.</p>
            </div>
            <Button variant="secondary">
              Cập nhật sở thích
            </Button>
          </div>
        </div>

        {/* Password */}
        <div className="bg-white border border-[#E2EAF4] rounded-2xl p-6 md:p-8 shadow-sm">
          <h2 className="text-lg font-display font-bold text-slate-900 mb-5 flex items-center gap-2">
            <Lock size={18} className="text-slate-500" /> Đổi mật khẩu
          </h2>
          <form onSubmit={handleUpdatePassword} className="space-y-4 max-w-md">
            <Input
              label="Mật khẩu hiện tại"
              type="password"
              value={currentPassword}
              onChange={e => setCurrentPassword(e.target.value)}
            />
            <div>
              <Input
                label="Mật khẩu mới"
                type="password"
                value={newPassword}
                onChange={e => setNewPassword(e.target.value)}
              />
              <div className="flex gap-1 mt-2">
                {[0, 1, 2].map(i => (
                  <div key={i} className="h-1 flex-1 bg-slate-100 rounded-full overflow-hidden">
                    <div className={`h-full transition-all duration-300 ${strengthLevel > i ? strengthColor : ''}`} />
                  </div>
                ))}
              </div>
            </div>
            <Input
              label="Xác nhận mật khẩu mới"
              type="password"
              value={confirmPassword}
              onChange={e => setConfirmPassword(e.target.value)}
            />
            <div className="pt-2">
              <Button type="submit" variant="secondary">Đổi mật khẩu</Button>
            </div>
          </form>
        </div>
      </div>
    </div>
  )
}
