'use client';

import { useSearchParams, useRouter } from 'next/navigation';
import { Suspense } from 'react';
import { useAuth } from '@/context/AuthContext';
import Dashboard from '@/components/Dashboard';

function DashboardContent() {
  const { user, logout, isLoading } = useAuth();
  const router = useRouter();
  const searchParams = useSearchParams();
  const tab = searchParams.get('tab') || 'listings';

  const handleLogout = () => {
    logout();
    router.push('/');
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center py-20">
        <div className="inline-block w-8 h-8 border-4 border-brand-orange border-t-transparent rounded-full animate-spin"></div>
      </div>
    );
  }

  if (!user) return null;

  // Safety net: send users who haven't completed onboarding to /welcome
  if (!user.username) {
    router.replace('/welcome');
    return null;
  }

  return <Dashboard user={user} activeTab={tab} onLogout={handleLogout} />;
}

export default function DashboardPage() {
  return (
    <Suspense fallback={
      <div className="flex items-center justify-center py-20">
        <div className="inline-block w-8 h-8 border-4 border-brand-orange border-t-transparent rounded-full animate-spin"></div>
      </div>
    }>
      <DashboardContent />
    </Suspense>
  );
}
