import { NextResponse, type NextRequest } from 'next/server'

const protectedPaths = ['/dashboard', '/profile', '/list-item', '/welcome']

// Middleware runs in the Edge runtime which doesn't support Node.js crypto.
// We check the Better Auth session cookie here for routing decisions only.
// Full session validation happens in each API route and server component
// via requireAuth/getAuthUser, which run in the Node.js runtime.
export function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl

  const isProtected = protectedPaths.some((p) => pathname.startsWith(p))
  const isLoginPage = pathname === '/login'

  if (!isProtected && !isLoginPage) {
    return NextResponse.next()
  }

  const hasSession =
    !!request.cookies.get('better-auth.session_token')?.value ||
    !!request.cookies.get('__Secure-better-auth.session_token')?.value

  if (!hasSession && isProtected) {
    const redirectUrl = request.nextUrl.clone()
    redirectUrl.pathname = '/login'
    return NextResponse.redirect(redirectUrl)
  }

  if (hasSession && isLoginPage) {
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
