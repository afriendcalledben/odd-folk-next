'use client';

import { useState, useEffect, useCallback } from 'react';
import { useRouter } from 'next/navigation';
import Hero from '@/components/Hero';
import SearchBar, { type SearchFilters } from '@/components/SearchBar';
import ProductGrid from '@/components/ProductGrid';
import CategoryPills from '@/components/CategoryPills';
import { fetchProducts, type SearchParams } from '@/services/api';
import { useAuth } from '@/context/AuthContext';
import type { Product } from '@/types';

const categories = [
  "Event furniture",
  "Lighting",
  "Backdrops & installations",
  "Tableware & serving",
  "Textiles & soft furnishings",
  "Decorative props",
  "Plants & greenery",
  "Seasonal/themed items",
  "Photography & film",
  "Weddings",
  "Signage & displays"
];

export default function HomePage() {
  const router = useRouter();
  const { toggleFavorite, favoriteIds, isLoggedIn } = useAuth();
  const [products, setProducts] = useState<Product[]>([]);
  const [selectedCategory, setSelectedCategory] = useState<string>('All');
  const [searchFilters, setSearchFilters] = useState<SearchFilters>({ search: '', location: '', startDate: '', endDate: '' });
  const [isSearching, setIsSearching] = useState(false);

  const loadProducts = useCallback(async (params?: SearchParams) => {
    setIsSearching(true);
    try {
      const results = await fetchProducts(params);
      setProducts(results);
    } finally {
      setIsSearching(false);
    }
  }, []);

  useEffect(() => {
    loadProducts();
  }, [loadProducts]);

  const handleSearch = useCallback((filters: SearchFilters) => {
    setSearchFilters(filters);
    setSelectedCategory('All');
    loadProducts({ search: filters.search || undefined });
  }, [loadProducts]);

  const handleCategoryChange = useCallback((category: string) => {
    setSelectedCategory(category);
    loadProducts({
      search: searchFilters.search || undefined,
      category: category !== 'All' ? category : undefined,
    });
  }, [loadProducts, searchFilters.search]);

  return (
    <>
      <Hero />
      <div className="bg-brand-white">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8 -mt-8 relative z-20">
          <SearchBar onSearch={handleSearch} initialFilters={searchFilters} />
        </div>

        <div className="container mx-auto px-4 sm:px-6 lg:px-8 py-16">
          {searchFilters.search ? (
            <div className="text-center mb-12">
              <h2 className="font-heading text-3xl md:text-4xl text-brand-burgundy leading-tight">
                {isSearching ? 'Searching...' : `Results for "${searchFilters.search}"`}
              </h2>
              <p className="font-body text-lg text-brand-burgundy/60 mt-2">
                {!isSearching && `${products.length} item${products.length !== 1 ? 's' : ''} found`}
              </p>
            </div>
          ) : (
            <div className="text-center mb-12">
              <h2 className="font-heading text-3xl md:text-5xl text-brand-orange leading-tight">
                Be the <span className="line-through decoration-brand-burgundy decoration-4">enemy</span> of beige.
              </h2>
              <p className="font-body text-xl text-brand-burgundy/80 mt-4 max-w-2xl mx-auto leading-relaxed">
                Find extraordinary pieces from local collectors for your next experience. No warehouses. No cliches. Just props with personality.
              </p>
            </div>
          )}

          <CategoryPills
            categories={categories}
            selectedCategory={selectedCategory}
            onSelectCategory={handleCategoryChange}
          />

          <div className="mt-12">
            {isSearching ? (
              <div className="text-center py-20">
                <div className="inline-block w-8 h-8 border-4 border-brand-orange border-t-transparent rounded-full animate-spin"></div>
                <p className="mt-4 text-brand-burgundy/60">Loading...</p>
              </div>
            ) : products.length === 0 ? (
              <div className="text-center py-20">
                <div className="w-24 h-24 bg-brand-grey/20 rounded-full flex items-center justify-center mx-auto mb-6">
                  <svg className="w-12 h-12 text-brand-burgundy/40" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                  </svg>
                </div>
                <h3 className="font-heading text-2xl text-brand-burgundy mb-2">No items found</h3>
                <p className="font-body text-brand-burgundy/60 max-w-md mx-auto">
                  {searchFilters.search
                    ? `We couldn't find any props matching "${searchFilters.search}". Try a different search term or browse our categories.`
                    : 'No props available in this category yet. Check back soon or explore other categories.'}
                </p>
              </div>
            ) : (
              <ProductGrid
                products={products}
                onSelectProduct={(product) => router.push(`/products/${product.id}`)}
                favoriteIds={favoriteIds}
                onToggleFavorite={toggleFavorite}
                isLoggedIn={isLoggedIn}
              />
            )}
          </div>
        </div>
      </div>
    </>
  );
}
