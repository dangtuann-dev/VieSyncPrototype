import 'server-only'
import { SignJWT, jwtVerify } from 'jose'
import { cookies } from 'next/headers'
import { redirect } from 'next/navigation'
import { cache } from 'react'

export interface SessionPayload {
  userId: string
  email: string
  isAdmin: boolean
  onboarded: boolean
  expiresAt: Date
}

const secretKey = process.env.SESSION_SECRET || 'blendedu-super-secret-key-dev'
const encodedKey = new TextEncoder().encode(secretKey)

export async function encrypt(payload: SessionPayload) {
  return new SignJWT(payload as any)
    .setProtectedHeader({ alg: 'HS256' })
    .setIssuedAt()
    .setExpirationTime('7d')
    .sign(encodedKey)
}

export async function decrypt(session: string | undefined = '') {
  if (!session) return null
  try {
    const { payload } = await jwtVerify(session, encodedKey, {
      algorithms: ['HS256'],
    })
    return payload as unknown as SessionPayload
  } catch {
    return null
  }
}

export async function createSession(payload: Omit<SessionPayload, 'expiresAt'>) {
  const expiresAt = new Date(Date.now() + 7 * 24 * 60 * 60 * 1000)
  const session = await encrypt({ ...payload, expiresAt })
  const cookieStore = await cookies()
  cookieStore.set('session', session, {
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production',
    expires: expiresAt,
    sameSite: 'lax',
    path: '/',
  })
}

export async function deleteSession() {
  const cookieStore = await cookies()
  cookieStore.delete('session')
}

export const getSession = cache(async (): Promise<SessionPayload | null> => {
  const cookieStore = await cookies()
  const cookie = cookieStore.get('session')?.value
  return decrypt(cookie)
})

export const verifySession = cache(async () => {
  const session = await getSession()
  if (!session?.userId) {
    redirect('/login')
  }
  return session
})
