'use client';

import { useSearchParams, useRouter } from 'next/navigation';
import { Suspense } from 'react';
import Login from '@/components/Login';
import { useAppNavigate } from '@/lib/navigation';
import { useAuth } from '@/context/AuthContext';

function LoginContent() {
  const searchParams = useSearchParams();
  const router = useRouter();
  const navigate = useAppNavigate();
  const { refreshUser } = useAuth();

  const mode = searchParams.get('mode') === 'signup' ? 'signup' : 'login';

  const handleLogin = async () => {
    await refreshUser();
    router.push('/dashboard');
  };

  return (
    <Login
      onNavigate={navigate}
      initialMode={mode}
      onLogin={handleLogin}
    />
  );
}

export default function LoginPage() {
  return (
    <Suspense>
      <LoginContent />
    </Suspense>
  );
}
