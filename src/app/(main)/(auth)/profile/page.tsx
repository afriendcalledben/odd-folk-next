'use client';

import { useRouter } from 'next/navigation';
import { useAuth } from '@/context/AuthContext';
import Profile from '@/components/Profile';

export default function ProfilePage() {
  const { user, logout } = useAuth();
  const router = useRouter();

  const handleLogout = () => {
    logout();
    router.push('/');
  };

  if (!user) return null;

  return <Profile user={user} onLogout={handleLogout} />;
}
