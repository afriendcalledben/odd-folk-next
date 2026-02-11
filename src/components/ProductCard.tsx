'use client';

import React from 'react';
import { useRouter } from 'next/navigation';
import type { Product } from '@/types';
import { useAuth } from '@/context/AuthContext';

interface ProductCardProps {
  product: Product;
  isFavorited?: boolean;
  onToggleFavorite?: (productId: string) => void;
}

const ProductCard: React.FC<ProductCardProps> = ({
  product,
  isFavorited = false,
  onToggleFavorite,
}) => {
  const router = useRouter();
  const { isLoggedIn } = useAuth();

  const handleFavoriteClick = (e: React.MouseEvent) => {
    e.stopPropagation();
    if (!isLoggedIn) {
      alert('Please log in to save favorites');
      return;
    }
    if (onToggleFavorite) {
      onToggleFavorite(product.id.toString());
    }
  };

  // Map categories to brand colors for tags
  const getCategoryColor = (cat: string) => {
    switch(cat) {
      case 'Event furniture':
      case 'Furniture': return 'bg-brand-white text-brand-blue';
      case 'Lighting': return 'bg-brand-yellow text-brand-burgundy';
      case 'Backdrops & installations': return 'bg-brand-orange text-brand-white';
      case 'Tableware & serving':
      case 'Tableware': return 'bg-brand-burgundy text-brand-white';
      case 'Decorative props':
      case 'Decor': return 'bg-brand-orange text-brand-white';
      case 'Plants & greenery':
      case 'Plants': return 'bg-gradient-to-r from-brand-yellow to-green-300 text-brand-burgundy';
      case 'Photography & film':
      case 'Photography': return 'bg-brand-white text-brand-blue';
      case 'Weddings': return 'bg-brand-white text-brand-burgundy';
      case 'Signage & displays':
      case 'Signage': return 'bg-brand-orange text-brand-white';
      case 'Textiles & soft furnishings':
      case 'Textiles': return 'bg-brand-burgundy text-brand-white';
      case 'Seasonal': return 'bg-red-100 text-red-800';
      default: return 'bg-brand-grey text-brand-burgundy';
    }
  };

  return (
    <div
      className="bg-brand-blue rounded-2xl overflow-hidden shadow-lg hover:shadow-2xl transition-all duration-300 cursor-pointer group border border-brand-white/10"
      onClick={() => router.push('/products/' + product.id)}
    >
      <div className="relative overflow-hidden aspect-[4/3]">
        <img
          src={product.imageUrl}
          alt={product.name}
          className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-110"
        />
        <div className={`absolute top-3 right-3 font-body text-[10px] uppercase tracking-widest font-bold px-3 py-1 rounded-full ${getCategoryColor(product.category)}`}>
            {product.category}
        </div>
        {/* Favorite Button */}
        <button
          onClick={handleFavoriteClick}
          className={`absolute top-3 left-3 w-9 h-9 rounded-full flex items-center justify-center transition-all ${
            isFavorited
              ? 'bg-red-500 text-white'
              : 'bg-white/80 text-brand-burgundy/60 hover:bg-white hover:text-red-500'
          }`}
        >
          <svg
            className="w-5 h-5"
            fill={isFavorited ? 'currentColor' : 'none'}
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z"
            />
          </svg>
        </button>
      </div>
      <div className="p-5">
        <h3 className="font-heading text-lg text-brand-white truncate">{product.name}</h3>
        <div className="flex items-center gap-2 mt-1">
          <p className="text-brand-white/70 font-body text-xs">{product.location}</p>
          <span className="text-brand-white/30">•</span>
          <div className="flex items-center gap-1 text-brand-yellow/80">
            <svg className="w-3 h-3" fill="currentColor" viewBox="0 0 20 20">
              <path fillRule="evenodd" d="M2.166 4.999A11.954 11.954 0 0010 1.944 11.954 11.954 0 0017.834 5c.11.65.166 1.32.166 2.001 0 5.225-3.34 9.67-8 11.317C5.34 16.67 2 12.225 2 7c0-.682.057-1.35.166-2.001zm11.541 3.708a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
            </svg>
            <span className="text-[10px] font-bold uppercase">Protected</span>
          </div>
        </div>
        <div className="mt-4 flex items-center justify-between">
          <p className="font-body">
            <span className="font-bold text-xl text-brand-yellow">£{product.pricePerDay}</span>
            <span className="text-brand-white/60 text-sm"> /day</span>
          </p>
          <div className="flex items-center">
             <img src={product.owner.avatarUrl} alt={product.owner.name} className="w-8 h-8 rounded-full object-cover border border-brand-white/20" />
          </div>
        </div>
      </div>
    </div>
  );
};

export default ProductCard;
