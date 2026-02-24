'use client';

import { useParams, useRouter } from 'next/navigation';
import UserProfile from '@/components/UserProfile';

export default function UserProfilePage() {
  const params = useParams();
  const router = useRouter();

  if (!params.id) return null;

  return (
    <UserProfile
      userId={params.id as string}
      onBack={() => router.back()}
      onProductClick={(product) => router.push(`/products/${product.id}`)}
    />
  );
}
