import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/utils/supabase/server'
import prisma from '@/lib/prisma'

export async function GET(request: NextRequest) {
  const { searchParams, origin } = new URL(request.url)
  const code = searchParams.get('code')
  const next = searchParams.get('next') ?? '/dashboard'

  if (code) {
    const supabase = await createClient()
    const { error } = await supabase.auth.exchangeCodeForSession(code)

    if (!error) {
      const { data: { user } } = await supabase.auth.getUser()

      if (user) {
        // Redirect new users (no username yet) to onboarding
        const prismaUser = await prisma.user.findUnique({
          where: { id: user.id },
          select: { username: true },
        })

        if (!prismaUser?.username) {
          return NextResponse.redirect(`${origin}/welcome`)
        }
      }

      return NextResponse.redirect(`${origin}${next}`)
    }
  }

  return NextResponse.redirect(`${origin}/login?error=oauth_failed`)
}
