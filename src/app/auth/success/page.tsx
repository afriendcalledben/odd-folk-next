'use client'

import { useSession } from '@/lib/auth-client'
import { useRouter } from 'next/navigation'
import { useEffect } from 'react'

export default function AuthSuccessPage() {
  const { data: session, isPending } = useSession()
  const router = useRouter()

  useEffect(() => {
    if (isPending) return
    if (session?.user) {
      router.replace('/dashboard')
    } else {
      router.replace('/login')
    }
  }, [session, isPending, router])

  return (
    <div className="min-h-screen bg-brand-white flex items-center justify-center">
      <p className="font-body text-brand-burgundy">Signing you in&hellip;</p>
    </div>
  )
}
