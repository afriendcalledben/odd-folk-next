import { redirect } from 'next/navigation'
import { createClient } from '@/utils/supabase/server'
import LoginForm from '@/components/auth/LoginForm'

interface Props {
  searchParams: Promise<{ mode?: string; message?: string; error?: string }>
}

export default async function LoginPage({ searchParams }: Props) {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()

  if (user) {
    redirect('/dashboard')
  }

  const params = await searchParams
  const mode = params.mode === 'signup' ? 'signup' : 'login'

  return (
    <LoginForm
      initialMode={mode}
      message={params.message}
      error={params.error}
    />
  )
}
