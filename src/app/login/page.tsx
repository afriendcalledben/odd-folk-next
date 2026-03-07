import LoginForm from '@/components/auth/LoginForm'

interface Props {
  searchParams: Promise<{ mode?: string; message?: string; error?: string }>
}

export default async function LoginPage({ searchParams }: Props) {
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
