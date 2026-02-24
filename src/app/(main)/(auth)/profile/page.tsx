'use client';

import { useAuth } from '@/context/AuthContext';
import Profile from '@/components/Profile';

export default function ProfilePage() {
  const { user } = useAuth();

  if (!user) return null;

  return <Profile user={user} />;
}
