import { NextResponse } from 'next/server'
import type { NextRequest } from 'next/server'
import { decrypt } from '@/lib/session'

// Public routes that don't require auth
const PUBLIC_ROUTES = ['/login', '/register']
const ADMIN_ROUTES = ['/admin']

export async function proxy(request: NextRequest) {
  const { pathname } = request.nextUrl
  const isPublic = PUBLIC_ROUTES.some(r => pathname.startsWith(r))

  const sessionCookie = request.cookies.get('session')?.value
  const session = await decrypt(sessionCookie)

  // If unauthenticated and hitting protected route → redirect to login
  if (!session?.userId && !isPublic && !pathname.startsWith('/api')) {
    return NextResponse.redirect(new URL('/login', request.url))
  }

  // Logged in user visiting login/register → go to dashboard
  if (session?.userId && isPublic) {
    return NextResponse.redirect(new URL('/dashboard', request.url))
  }

  // Non-onboarded user visiting dashboard → go to onboarding (unless admin)
  if (
    session?.userId &&
    !session.onboarded &&
    !session.isAdmin &&
    pathname.startsWith('/dashboard')
  ) {
    return NextResponse.redirect(new URL('/onboarding', request.url))
  }

  // Non-admin visiting /admin routes → redirect to dashboard
  if (ADMIN_ROUTES.some(r => pathname.startsWith(r)) && !session?.isAdmin) {
    return NextResponse.redirect(new URL('/dashboard', request.url))
  }

  return NextResponse.next()
}

export const config = {
  matcher: ['/((?!_next/static|_next/image|favicon.ico|.*\\.png$).*)'],
}
