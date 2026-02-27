'use client';

import { useAuth } from '@/context/AuthContext';
import WelcomeForm from '@/components/auth/WelcomeForm';

export default function WelcomePage() {
  const { user, isLoading } = useAuth();

  if (isLoading || !user) {
    return (
      <div className="flex items-center justify-center py-20">
        <div className="inline-block w-8 h-8 border-4 border-brand-orange border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  return <WelcomeForm user={user} />;
}
