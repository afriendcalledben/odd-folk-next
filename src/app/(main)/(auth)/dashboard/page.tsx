'use client';

import { useSearchParams } from 'next/navigation';
import { Suspense } from 'react';
import { useAuth } from '@/context/AuthContext';
import Dashboard from '@/components/Dashboard';

function DashboardContent() {
  const { user } = useAuth();
  const searchParams = useSearchParams();
  const tab = searchParams.get('tab') || 'listings';

  if (!user) return null;

  return <Dashboard user={user} activeTab={tab} />;
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
