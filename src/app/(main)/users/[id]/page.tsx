'use client';

import { useParams } from 'next/navigation';
import UserProfile from '@/components/UserProfile';

export default function UserProfilePage() {
  const params = useParams();

  if (!params.id) return null;

  return <UserProfile userId={params.id as string} />;
}
