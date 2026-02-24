'use client';

import { useRouter } from 'next/navigation';
import Profile from '@/components/Profile';
import { useAuth } from '@/contexts/AuthContext';

export default function ProfilePage() {
  const router = useRouter();
  const { user, isLoggedIn, logout } = useAuth();

  const handleLogout = () => {
    logout();
    router.push('/');
  };

  if (!isLoggedIn || !user) {
    return null;
  }

  return <Profile user={user} onLogout={handleLogout} />;
}
