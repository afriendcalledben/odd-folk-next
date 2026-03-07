'use server'

import { redirect } from 'next/navigation'
import { headers } from 'next/headers'
import prisma from '@/lib/prisma'
import { auth } from '@/lib/auth'

type FormState = { error: string } | null

export async function deleteAccountAction(): Promise<FormState> {
  const session = await auth.api.getSession({ headers: await headers() })

  if (!session?.user) {
    return { error: 'Not authenticated' }
  }

  try {
    // Deleting the user cascades to sessions, accounts, and all related data
    await prisma.user.delete({ where: { id: session.user.id } })
  } catch {
    return { error: 'Could not delete account. Please contact support.' }
  }

  redirect('/')
}
