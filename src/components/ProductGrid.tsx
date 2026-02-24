'use client';

import React from 'react';
import type { Product } from '../types';
import ProductCard from './ProductCard';

interface ProductGridProps {
  products: Product[];
  onSelectProduct: (product: Product) => void;
  favoriteIds?: string[];
  onToggleFavorite?: (productId: string) => void;
  isLoggedIn?: boolean;
}

const ProductGrid: React.FC<ProductGridProps> = ({
  products,
  onSelectProduct,
  favoriteIds = [],
  onToggleFavorite,
  isLoggedIn = false,
}) => {
  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6 lg:gap-8">
      {products.map((product) => (
        <ProductCard
          key={product.id}
          product={product}
          onSelect={onSelectProduct}
          isFavorited={favoriteIds.includes(product.id.toString())}
          onToggleFavorite={onToggleFavorite}
          isLoggedIn={isLoggedIn}
        />
      ))}
    </div>
  );
};

export default ProductGrid;
