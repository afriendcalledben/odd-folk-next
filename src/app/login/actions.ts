'use server'

import { redirect } from 'next/navigation'
import { createClient } from '@/utils/supabase/server'
import { createClient as createAdminClient } from '@supabase/supabase-js'
import prisma from '@/lib/prisma'
import { z } from 'zod'

const LoginSchema = z.object({
  email: z.string().email('Enter a valid email address'),
  password: z.string().min(8, 'Password must be at least 8 characters'),
})

const SignupSchema = z.object({
  email: z.string().email('Enter a valid email address'),
  password: z.string().min(8, 'Password must be at least 8 characters'),
  name: z.string().min(2, 'Name must be at least 2 characters'),
})

type FormState = { error: string } | null

export async function loginAction(
  _prevState: FormState,
  formData: FormData
): Promise<FormState> {
  const parsed = LoginSchema.safeParse({
    email: formData.get('email'),
    password: formData.get('password'),
  })

  if (!parsed.success) {
    return { error: parsed.error.issues[0].message }
  }

  const supabase = await createClient()
  const { error } = await supabase.auth.signInWithPassword(parsed.data)

  if (error) {
    return { error: 'Invalid email or password' }
  }

  redirect('/dashboard')
}

export async function signupAction(
  _prevState: FormState,
  formData: FormData
): Promise<FormState> {
  const parsed = SignupSchema.safeParse({
    email: formData.get('email'),
    password: formData.get('password'),
    name: formData.get('name'),
  })

  if (!parsed.success) {
    return { error: parsed.error.issues[0].message }
  }

  const { email, password, name } = parsed.data
  const supabase = await createClient()

  const { error } = await supabase.auth.signUp({
    email,
    password,
    options: { data: { name } },
  })

  if (error) {
    if (error.message.toLowerCase().includes('already registered')) {
      return { error: 'An account with this email already exists' }
    }
    return { error: 'Could not create account. Please try again.' }
  }

  // If email confirmation is disabled in Supabase, redirect to dashboard.
  // If enabled, the user will be in a limbo state — redirect to a check-email notice.
  redirect('/dashboard')
}

export async function logoutAction() {
  const supabase = await createClient()
  await supabase.auth.signOut()
  redirect('/login')
}

export async function googleSignInAction(_formData?: FormData) {
  const supabase = await createClient()
  const siteUrl = process.env.NEXT_PUBLIC_SITE_URL || 'http://localhost:3000'

  const { data, error } = await supabase.auth.signInWithOAuth({
    provider: 'google',
    options: {
      redirectTo: `${siteUrl}/auth/callback`,
    },
  })

  if (error || !data.url) {
    redirect('/login?error=google_failed')
  }

  redirect(data.url)
}

export async function deleteAccountAction(): Promise<FormState> {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()

  if (!user) {
    return { error: 'Not authenticated' }
  }

  try {
    // Delete user profile and cascading data from our DB first
    await prisma.user.delete({ where: { id: user.id } })
  } catch {
    return { error: 'Could not delete account. Please contact support.' }
  }

  // Delete from Supabase auth — uses secret key (server-only, never exposed to browser)
  const adminClient = createAdminClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SECRET_KEY!,
    { auth: { autoRefreshToken: false, persistSession: false } }
  )

  const { error: deleteError } = await adminClient.auth.admin.deleteUser(user.id)

  if (deleteError) {
    return { error: 'Account data deleted but auth cleanup failed. Contact support.' }
  }

  redirect('/')
}
