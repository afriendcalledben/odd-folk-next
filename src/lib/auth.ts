import { betterAuth } from 'better-auth'
import { prismaAdapter } from 'better-auth/adapters/prisma'
import prisma from '@/lib/prisma'
import { NextRequest } from 'next/server'
import { errorResponse } from '@/lib/api-response'

export const auth = betterAuth({
  database: prismaAdapter(prisma, { provider: 'postgresql' }),
  baseURL: process.env.BETTER_AUTH_URL || process.env.NEXT_PUBLIC_SITE_URL,
  secret: process.env.BETTER_AUTH_SECRET,
  emailAndPassword: { enabled: true },
  socialProviders: {
    google: {
      clientId: process.env.GOOGLE_CLIENT_ID!,
      clientSecret: process.env.GOOGLE_CLIENT_SECRET!,
      prompt: 'select_account',
    },
    facebook: {
      clientId: process.env.FACEBOOK_CLIENT_ID!,
      clientSecret: process.env.FACEBOOK_CLIENT_SECRET!,
    },
  },
  account: {
    accountLinking: {
      enabled: true,
      trustedProviders: ['google', 'facebook'],
    },
  },
  databaseHooks: {
    user: {
      create: {
        after: async (user) => {
          if (user.image && !user.avatarUrl) {
            await prisma.user.update({
              where: { id: user.id },
              data: { avatarUrl: user.image },
            });
          }
        },
      },
    },
  },
})

export async function getAuthUser(req: NextRequest) {
  const session = await auth.api.getSession({ headers: req.headers })
  if (!session?.user) return null
  return { id: session.user.id, email: session.user.email }
}

export async function requireAuth(req: NextRequest) {
  const user = await getAuthUser(req)
  if (!user) {
    throw new Error('Unauthorized')
  }
  return user
}

export async function getAuthUserFromHeaders(headers: Headers) {
  const session = await auth.api.getSession({ headers })
  if (!session?.user) return null
  return { id: session.user.id, email: session.user.email }
}

export { errorResponse }
