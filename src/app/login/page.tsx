'use client';

import { useSearchParams } from 'next/navigation';
import { Suspense } from 'react';
import Login from '@/components/Login';

function LoginContent() {
  const searchParams = useSearchParams();
  const mode = searchParams.get('mode') === 'signup' ? 'signup' : 'login';

  return <Login initialMode={mode} />;
}

export default function LoginPage() {
  return (
    <Suspense fallback={
      <div className="flex items-center justify-center min-h-screen">
        <div className="inline-block w-8 h-8 border-4 border-brand-orange border-t-transparent rounded-full animate-spin"></div>
      </div>
    }>
      <LoginContent />
    </Suspense>
  );
}
