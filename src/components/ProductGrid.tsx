'use client';

import React from 'react';
import type { Product } from '@/types';
import ProductCard from './ProductCard';
import { useAuth } from '@/context/AuthContext';

interface ProductGridProps {
  products: Product[];
  onToggleFavorite?: (productId: string) => void;
}

const ProductGrid: React.FC<ProductGridProps> = ({
  products,
  onToggleFavorite,
}) => {
  const { favoriteIds, isLoggedIn } = useAuth();

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6 lg:gap-8">
      {products.map((product) => (
        <ProductCard
          key={product.id}
          product={product}
          isFavorited={favoriteIds.includes(product.id.toString())}
          onToggleFavorite={onToggleFavorite}
        />
      ))}
    </div>
  );
};

export default ProductGrid;
