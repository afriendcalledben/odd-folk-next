import { NextResponse, type NextRequest } from 'next/server'
import { auth } from '@/lib/auth'

const protectedPaths = ['/dashboard', '/profile', '/list-item', '/welcome']

export async function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl

  const isProtected = protectedPaths.some((p) => pathname.startsWith(p))
  const isLoginPage = pathname === '/login'

  if (!isProtected && !isLoginPage) {
    return NextResponse.next()
  }

  const session = await auth.api.getSession({ headers: request.headers })

  if (!session && isProtected) {
    const redirectUrl = request.nextUrl.clone()
    redirectUrl.pathname = '/login'
    return NextResponse.redirect(redirectUrl)
  }

  if (session && isLoginPage) {
    const redirectUrl = request.nextUrl.clone()
    redirectUrl.pathname = '/dashboard'
    return NextResponse.redirect(redirectUrl)
  }

  return NextResponse.next()
}

export const config = {
  matcher: [
    '/((?!_next/static|_next/image|favicon.ico|api/auth|.*\\.(?:svg|png|jpg|jpeg|gif|webp)$).*)',
  ],
}
