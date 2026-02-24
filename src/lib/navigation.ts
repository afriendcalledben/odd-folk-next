'use client';

import { useRouter } from 'next/navigation';
import type { Product } from '@/types';

export function useAppNavigate() {
  const router = useRouter();

  return (view: string) => {
    if (view === 'home') {
      router.push('/');
    } else if (view === 'signup') {
      router.push('/login?mode=signup');
    } else if (view === 'login') {
      router.push('/login');
    } else if (view.startsWith('dashboard-')) {
      const tab = view.split('-')[1];
      router.push(`/dashboard?tab=${tab}`);
    } else if (view.startsWith('user-profile:')) {
      const userId = view.split(':')[1];
      router.push(`/users/${userId}`);
    } else {
      router.push(`/${view}`);
    }
  };
}

export function navigateToProduct(router: ReturnType<typeof useRouter>, product: Product) {
  router.push(`/products/${product.id}`);
}
