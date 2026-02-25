import { createServerClient } from '@supabase/ssr'
import { NextRequest } from 'next/server'

export async function getAuthUser(req: NextRequest) {
  const supabase = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE!,
    {
      cookies: {
        getAll() {
          return req.cookies.getAll()
        },
        // Session refresh is handled by middleware; no-op here
        setAll() {},
      },
    }
  )

  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return null

  return { id: user.id, email: user.email! }
}

export async function requireAuth(req: NextRequest) {
  const user = await getAuthUser(req)
  if (!user) {
    throw new Error('Unauthorized')
  }
  return user
}
