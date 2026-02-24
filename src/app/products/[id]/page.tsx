'use client';

import { useEffect, useState } from 'react';
import { useRouter, useParams } from 'next/navigation';
import { fetchProductById } from '@/services/api';
import type { Product } from '@/types';
import ProductDetail from '@/components/ProductDetail';
import { useAuth } from '@/contexts/AuthContext';
import { useAppNavigate } from '@/lib/navigation';

export default function ProductPage() {
  const params = useParams();
  const router = useRouter();
  const navigate = useAppNavigate();
  const { favoriteIds, setFavoriteIds } = useAuth();
  const [product, setProduct] = useState<Product | null>(null);
  const [loading, setLoading] = useState(true);

  const id = params.id as string;

  useEffect(() => {
    fetchProductById(id).then((p) => {
      setProduct(p || null);
      setLoading(false);
    });
  }, [id]);

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[50vh]">
        <div className="inline-block w-8 h-8 border-4 border-brand-orange border-t-transparent rounded-full animate-spin"></div>
      </div>
    );
  }

  if (!product) {
    return (
      <div className="flex items-center justify-center min-h-[50vh]">
        <p className="text-brand-burgundy">Product not found.</p>
      </div>
    );
  }

  return (
    <ProductDetail
      product={product}
      onBack={() => router.back()}
      onNavigate={navigate}
      isFavorited={favoriteIds.includes(product.id.toString())}
      onFavoriteChange={(productId, isFav) => {
        if (isFav) {
          setFavoriteIds([...favoriteIds, productId]);
        } else {
          setFavoriteIds(favoriteIds.filter(fid => fid !== productId));
        }
      }}
    />
  );
}
