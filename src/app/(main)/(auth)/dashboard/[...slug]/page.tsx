'use client';

import React, { use } from 'react';
import { useRouter } from 'next/navigation';
import { Suspense } from 'react';
import { useAuth } from '@/context/AuthContext';
import Dashboard from '@/components/Dashboard';

const VALID_TABS = ['listings', 'bookings', 'favorites', 'profile', 'locations', 'block-days', 'wallet'];
const VALID_SUB_TABS = ['made', 'received'] as const;

function DashboardSlugContent({ slug }: { slug: string[] }) {
  const { user, logout, isLoading } = useAuth();
  const router = useRouter();

  const tab = VALID_TABS.includes(slug[0]) ? slug[0] : 'listings';
  const subTab = (VALID_SUB_TABS as readonly string[]).includes(slug[1])
    ? (slug[1] as 'made' | 'received')
    : undefined;
  const bookingId = slug[2] ?? undefined;

  const handleLogout = () => {
    logout();
    router.push('/');
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center py-20">
        <div className="inline-block w-8 h-8 border-4 border-brand-orange border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  if (!user) return null;

  if (!user.username) {
    router.replace('/welcome');
    return null;
  }

  return (
    <Dashboard
      user={user}
      activeTab={tab}
      activeSubTab={subTab}
      activeBookingId={bookingId}
      onLogout={handleLogout}
    />
  );
}

export default function DashboardSlugPage({
  params,
}: {
  params: Promise<{ slug: string[] }>;
}) {
  const { slug } = use(params);
  return (
    <Suspense fallback={
      <div className="flex items-center justify-center py-20">
        <div className="inline-block w-8 h-8 border-4 border-brand-orange border-t-transparent rounded-full animate-spin" />
      </div>
    }>
      <DashboardSlugContent slug={slug} />
    </Suspense>
  );
}
