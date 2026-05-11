"use client"

import { useActionState, useTransition } from "react"
import { useState } from "react"
import Link from "next/link"
import { loginAction } from "@/lib/actions/auth"
import { Button } from "@/components/ui/Button"
import { Input } from "@/components/ui/Input"
import { Eye, EyeOff, Loader2 } from "lucide-react"
import { useLanguage } from "@/context/LanguageContext"

export default function LoginPage() {
  const [state, formAction] = useActionState(loginAction, undefined)
  const [isPending, startTransition] = useTransition()
  const [showPassword, setShowPassword] = useState(false)
  const { t } = useLanguage()

  return (
    <>
      <h2 className="font-display font-bold text-[2rem] text-slate-900 mb-2">{t('auth.login_title')}</h2>
      <p className="text-slate-500 mb-8">{t('auth.login_subtitle')}</p>

      {state?.errors?.general && (
        <div className="mb-4 px-4 py-3 rounded-xl bg-red-50 border border-red-200 text-sm text-red-600 font-medium">
          {state.errors.general[0]}
        </div>
      )}

      <form action={formAction} className="space-y-4">
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

        <div className="relative">
          <Input
            label={t('auth.password')}
            id="password"
            name="password"
            type={showPassword ? "text" : "password"}
            placeholder="••••••••"
          autoComplete="current-password"
            required
            error={state?.errors?.password?.[0]}
          />
          <button
            type="button"
            onClick={() => setShowPassword(!showPassword)}
            className="absolute right-4 top-10 text-slate-400 hover:text-slate-600 transition-colors"
          >
            {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
          </button>
        </div>

        <div className="flex items-center justify-between py-1">
          <label className="flex items-center gap-2 cursor-pointer">
            <input type="checkbox" name="remember" className="w-4 h-4 rounded border-[#E2EAF4] text-blue-600 focus:ring-blue-500" />
            <span className="text-sm font-medium text-slate-600">{t('auth.remember_me')}</span>
          </label>
          <Link href="#" className="text-sm font-semibold text-blue-600 hover:underline">
            {t('auth.forgot_password')}
          </Link>
        </div>

        <Button
          type="submit"
          className="w-full"
          disabled={isPending}
          aria-disabled={isPending}
        >
          {isPending ? <Loader2 size={18} className="animate-spin mr-2" /> : null}
          {t('auth.login_btn')}
        </Button>
      </form>

      <p className="text-center text-sm text-slate-600 mt-8">
        {t('auth.no_account')}{' '}
        <Link href="/register" className="font-semibold text-blue-600 hover:underline">
          {t('auth.register_btn')}
        </Link>
      </p>
    </>
  )
}
