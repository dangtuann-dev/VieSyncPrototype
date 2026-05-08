'use server'
import { prisma } from '@/lib/db'
import { createSession, deleteSession } from '@/lib/session'
import { redirect } from 'next/navigation'
import bcrypt from 'bcryptjs'
import { z } from 'zod'

const LoginSchema = z.object({
  email: z.string().email(),
  password: z.string().min(1),
})

const RegisterSchema = z.object({
  name: z.string().min(2),
  email: z.string().email(),
  phone: z.string().optional(),
  password: z.string().min(8),
})

export type AuthFormState = {
  errors?: { email?: string[]; password?: string[]; name?: string[]; general?: string[] }
  message?: string
} | undefined

export async function loginAction(state: AuthFormState, formData: FormData): Promise<AuthFormState> {
  const validated = LoginSchema.safeParse({
    email: formData.get('email'),
    password: formData.get('password'),
  })

  if (!validated.success) {
    return { errors: validated.error.flatten().fieldErrors }
  }

  const { email, password } = validated.data

  try {
    const user = await prisma.user.findUnique({ where: { email } })
    if (!user || !user.password) {
      return { errors: { general: ['Email hoặc mật khẩu không đúng'] } }
    }

    const passwordMatch = await bcrypt.compare(password, user.password)
    if (!passwordMatch) {
      return { errors: { general: ['Email hoặc mật khẩu không đúng'] } }
    }

    await createSession({
      userId: user.id,
      email: user.email,
      isAdmin: user.isAdmin,
      onboarded: user.onboarded,
    })
  } catch {
    return { errors: { general: ['Có lỗi xảy ra. Vui lòng thử lại.'] } }
  }

  // Redirect after successful login
  redirect('/dashboard')
}

export async function registerAction(state: AuthFormState, formData: FormData): Promise<AuthFormState> {
  const validated = RegisterSchema.safeParse({
    name: formData.get('name'),
    email: formData.get('email'),
    phone: formData.get('phone'),
    password: formData.get('password'),
  })

  if (!validated.success) {
    return { errors: validated.error.flatten().fieldErrors }
  }

  const { name, email, phone, password } = validated.data

  try {
    const existing = await prisma.user.findUnique({ where: { email } })
    if (existing) {
      return { errors: { email: ['Email này đã được đăng ký'] } }
    }

    const hashedPassword = await bcrypt.hash(password, 12)
    const user = await prisma.user.create({
      data: { name, email, phone, password: hashedPassword, onboarded: false },
    })

    await createSession({
      userId: user.id,
      email: user.email,
      isAdmin: user.isAdmin,
      onboarded: user.onboarded,
    })
  } catch {
    return { errors: { general: ['Đăng ký thất bại. Vui lòng thử lại.'] } }
  }

  redirect('/onboarding')
}

export async function logoutAction() {
  await deleteSession()
  redirect('/login')
}
