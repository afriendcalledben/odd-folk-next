'use client';

import { useSearchParams, useRouter } from 'next/navigation';
import { Suspense } from 'react';
import Login from '@/components/Login';
import { useAppNavigate } from '@/lib/navigation';
import { useAuth } from '@/contexts/AuthContext';

function LoginContent() {
  const searchParams = useSearchParams();
  const router = useRouter();
  const navigate = useAppNavigate();
  const { login } = useAuth();

  const mode = searchParams.get('mode') === 'signup' ? 'signup' : 'login';

  const handleLogin = async () => {
    await login();
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
