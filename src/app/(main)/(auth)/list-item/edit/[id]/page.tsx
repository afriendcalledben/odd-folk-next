'use client';

import { useEffect, useState } from 'react';
import { useParams, useRouter } from 'next/navigation';
import ListItem from '@/components/ListItem';
import { fetchProductById } from '@/services/api';
import { useAppNavigate } from '@/lib/navigation';
import { useAuth } from '@/context/AuthContext';
import type { Product } from '@/types';

export default function EditListingPage() {
  const { id } = useParams<{ id: string }>();
  const { user, isLoading } = useAuth();
  const navigate = useAppNavigate();
  const router = useRouter();
  const [product, setProduct] = useState<Product | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (isLoading) return;
    fetchProductById(id).then(p => {
      if (!p || p.owner.id !== user?.id) {
        router.replace('/dashboard?tab=listings');
        return;
      }
      setProduct(p);
      setLoading(false);
    });
  }, [id, user, isLoading, router]);

  if (loading) {
    return (
      <div className="min-h-screen bg-brand-white flex items-center justify-center">
        <p className="font-body text-brand-burgundy animate-pulse">Loading listing…</p>
      </div>
    );
  }

  if (!product) return null;

  return <ListItem onNavigate={navigate} initialData={product} productId={id} />;
}
