'use client';

import { useEffect, useState } from 'react';
import { useParams } from 'next/navigation';
import { fetchProductById } from '@/services/api';
import { useAuth } from '@/context/AuthContext';
import ProductDetail from '@/components/ProductDetail';
import type { Product } from '@/types';

export default function ProductPage() {
  const params = useParams();
  const { toggleFavorite } = useAuth();
  const [product, setProduct] = useState<Product | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (params.id) {
      fetchProductById(params.id as string)
        .then((p) => setProduct(p || null))
        .finally(() => setLoading(false));
    }
  }, [params.id]);

  if (loading) {
    return (
      <div className="flex items-center justify-center py-20">
        <div className="inline-block w-8 h-8 border-4 border-brand-orange border-t-transparent rounded-full animate-spin"></div>
      </div>
    );
  }

  if (!product) {
    return (
      <div className="text-center py-20">
        <h2 className="font-heading text-2xl text-brand-burgundy">Product not found</h2>
      </div>
    );
  }

  return (
    <ProductDetail
      product={product}
      onFavoriteChange={(productId) => toggleFavorite(productId)}
    />
  );
}
