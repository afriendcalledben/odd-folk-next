'use client';

import { useRouter, useSearchParams } from 'next/navigation';
import { Suspense } from 'react';
import Dashboard from '@/components/Dashboard';
import Login from '@/components/Login';
import { useAuth } from '@/contexts/AuthContext';
import { useAppNavigate } from '@/lib/navigation';

function DashboardContent() {
  const router = useRouter();
  const navigate = useAppNavigate();
  const searchParams = useSearchParams();
  const { user, isLoggedIn, login, logout } = useAuth();

  const activeTab = searchParams.get('tab') || 'listings';

  const handleLogout = () => {
    logout();
    router.push('/');
  };

  const handleLogin = async () => {
    await login();
    router.push('/dashboard');
  };

  if (!isLoggedIn || !user) {
    return <Login onNavigate={navigate} onLogin={handleLogin} />;
  }

  return <Dashboard user={user} activeTab={activeTab} onLogout={handleLogout} />;
}

export default function DashboardPage() {
  return (
    <Suspense>
      <DashboardContent />
    </Suspense>
  );
}
