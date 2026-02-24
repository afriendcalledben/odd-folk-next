'use client';

import { useParams, useRouter } from 'next/navigation';
import UserProfile from '@/components/UserProfile';

export default function UserProfilePage() {
  const params = useParams();
  const router = useRouter();
  const userId = params.id as string;

  return (
    <UserProfile
      userId={userId}
      onBack={() => router.back()}
      onProductClick={(product) => router.push(`/products/${product.id}`)}
    />
  );
}
