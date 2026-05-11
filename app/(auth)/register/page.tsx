"use client"

import { useActionState, useTransition } from "react"
import { useState } from "react"
import Link from "next/link"
import { registerAction } from "@/lib/actions/auth"
import { Button } from "@/components/ui/Button"
import { Input } from "@/components/ui/Input"
import { Eye, EyeOff, Loader2, Check } from "lucide-react"
import { useLanguage } from "@/context/LanguageContext"

export default function RegisterPage() {
  const [state, formAction] = useActionState(registerAction, undefined)
  const [isPending, startTransition] = useTransition()
  const [showPassword, setShowPassword] = useState(false)
  const [password, setPassword] = useState("")
  const [confirmPassword, setConfirmPassword] = useState("")
  const [agreed, setAgreed] = useState(false)
  const { t } = useLanguage()

  const strengthLevel = password.length === 0 ? 0 : password.length < 6 ? 1 : password.length < 10 ? 2 : 3
  const strengthColors = ["bg-slate-200", "bg-red-500", "bg-yellow-500", "bg-emerald-500"]
  const sc = strengthColors[strengthLevel]

  return (
    <>
      <h2 className="font-display font-bold text-[2rem] text-slate-900 mb-2">{t('auth.register_title')}</h2>
      <p className="text-slate-500 mb-8">{t('auth.register_subtitle')}</p>

      {state?.errors?.general && (
        <div className="mb-4 px-4 py-3 rounded-xl bg-red-50 border border-red-200 text-sm text-red-600 font-medium">
          {state.errors.general[0]}
        </div>
      )}

      <form action={formAction} className="space-y-4">
        <Input
          label={t('auth.name')}
          id="name"
          name="name"
          type="text"
          placeholder={t('auth.name_placeholder')}
          required
          error={state?.errors?.name?.[0]}
        />

        <Input
          label={t('auth.email')}
          id="email"
          name="email"
          type="email"
          placeholder={t('auth.email_placeholder')}
          autoComplete="email"
          required
          error={state?.errors?.email?.[0]}
        />

        <Input
          label={t('auth.phone')}
          id="phone"
          name="phone"
          type="tel"
          placeholder={t('auth.phone_placeholder')}
        />

        <div className="relative">
          <Input
            label={t('auth.password')}
            id="password"
            name="password"
            type={showPassword ? "text" : "password"}
            placeholder={t('auth.password_placeholder')}
            autoComplete="new-password"
            required
            minLength={8}
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            error={state?.errors?.password?.[0]}
          />
          <button
            type="button"
            onClick={() => setShowPassword(!showPassword)}
            className="absolute right-4 top-10 text-slate-400 hover:text-slate-600 transition-colors"
          >
            {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
          </button>
          <div className="flex gap-1 mt-2">
            {[0, 1, 2].map((i) => (
              <div key={i} className="h-1 flex-1 bg-slate-100 rounded-full overflow-hidden">
                <div className={`h-full transition-all duration-300 ${strengthLevel > i ? sc : 'bg-transparent'}`} />
              </div>
            ))}
          </div>
        </div>

        <div className="relative">
          <Input
            label={t('auth.confirm_password')}
            id="confirmPassword"
            type="password"
            placeholder={t('auth.confirm_password_placeholder')}
            required
            value={confirmPassword}
            onChange={(e) => setConfirmPassword(e.target.value)}
          />
          {confirmPassword && confirmPassword === password && (
            <div className="absolute right-4 top-10 text-emerald-500">
              <Check size={18} strokeWidth={3} />
            </div>
          )}
        </div>

        <div className="flex items-start gap-3 py-2">
          <input
            type="checkbox"
            id="terms"
            checked={agreed}
            onChange={(e) => setAgreed(e.target.checked)}
            className="mt-1 w-4 h-4 rounded border-[#E2EAF4] text-blue-600 focus:ring-blue-500"
          />
          <label htmlFor="terms" className="text-sm font-medium text-slate-600 cursor-pointer">
            {t('auth.agree')}{' '}
            <Link href="#" className="text-blue-600 hover:underline">{t('auth.terms')}</Link>
            {' '}{t('auth.and')}{' '}
            <Link href="#" className="text-blue-600 hover:underline">{t('auth.privacy')}</Link>
          </label>
        </div>

        <Button
          type="submit"
          className="w-full"
          disabled={isPending || !agreed || (!!confirmPassword && confirmPassword !== password)}
          aria-disabled={isPending}
        >
          {isPending ? <Loader2 size={18} className="animate-spin mr-2" /> : null}
          {t('auth.register_btn')}
        </Button>
      </form>

      <p className="text-center text-sm text-slate-600 mt-8">
        {t('auth.have_account')}{' '}
        <Link href="/login" className="font-semibold text-blue-600 hover:underline">
          {t('auth.login_btn')}
        </Link>
      </p>
    </>
  )
}
