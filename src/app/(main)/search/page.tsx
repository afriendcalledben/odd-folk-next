'use client';

import { useEffect, useState, useCallback, useRef, Suspense } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { fetchProducts } from '@/services/api';
import type { Product } from '@/types';
import ProductGrid from '@/components/ProductGrid';
import SearchFilters, { FilterState } from '@/components/SearchFilters';
import { useAuth } from '@/context/AuthContext';

function filtersToSearchParams(filters: FilterState): URLSearchParams {
  const p = new URLSearchParams();
  if (filters.search) p.set('search', filters.search);
  if (filters.categories.length) p.set('categories', filters.categories.join(','));
  if (filters.conditions.length) p.set('conditions', filters.conditions.join(','));
  if (filters.colors.length) p.set('colors', filters.colors.join(','));
  if (filters.minPrice) p.set('minPrice', filters.minPrice);
  if (filters.maxPrice) p.set('maxPrice', filters.maxPrice);
  if (filters.locationQuery) p.set('locationQuery', filters.locationQuery);
  if (filters.lat !== null) p.set('lat', String(filters.lat));
  if (filters.lng !== null) p.set('lng', String(filters.lng));
  if (filters.distance !== null) p.set('distance', String(filters.distance));
  if (filters.startDate) p.set('startDate', filters.startDate);
  if (filters.endDate) p.set('endDate', filters.endDate);
  return p;
}

function searchParamsToFilters(params: URLSearchParams): FilterState {
  return {
    search: params.get('search') || '',
    categories: params.get('categories') ? params.get('categories')!.split(',') : [],
    conditions: params.get('conditions') ? params.get('conditions')!.split(',') : [],
    colors: params.get('colors') ? params.get('colors')!.split(',') : [],
    minPrice: params.get('minPrice') || '',
    maxPrice: params.get('maxPrice') || '',
    locationQuery: params.get('locationQuery') || '',
    lat: params.get('lat') ? parseFloat(params.get('lat')!) : null,
    lng: params.get('lng') ? parseFloat(params.get('lng')!) : null,
    distance: params.get('distance') ? parseFloat(params.get('distance')!) : 3,
    startDate: params.get('startDate') || '',
    endDate: params.get('endDate') || '',
  };
}

function SearchPage() {
  const router = useRouter();
  const searchParams = useSearchParams();

  const { isLoggedIn, favoriteIds, toggleFavorite } = useAuth();
  const [filters, setFilters] = useState<FilterState>(() => searchParamsToFilters(searchParams));
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);
  const debounceRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  const runSearch = useCallback(async (f: FilterState) => {
    setLoading(true);
    // Build multi-value params — API takes first category for now; extend as needed
    const params = {
      search: f.search || undefined,
      category: f.categories.length === 1 ? f.categories[0] : undefined,
      minPrice: f.minPrice ? parseFloat(f.minPrice) : undefined,
      maxPrice: f.maxPrice ? parseFloat(f.maxPrice) : undefined,
      condition: f.conditions.length === 1 ? f.conditions[0] : undefined,
      colors: f.colors.length ? f.colors : undefined,
      lat: f.lat ?? undefined,
      lng: f.lng ?? undefined,
      distance: f.lat !== null ? (f.distance ?? 3) : undefined,
      startDate: f.startDate || undefined,
      endDate: f.endDate || undefined,
    };
    const results = await fetchProducts(params);

    // Client-side multi-value filtering for categories/conditions (API supports single values)
    const filtered = results.filter(p => {
      if (f.categories.length > 1 && !f.categories.includes(p.category)) return false;
      if (f.conditions.length > 1 && !f.conditions.includes(p.condition)) return false;
      return true;
    });

    setProducts(filtered);
    setLoading(false);
  }, []);

  // Sync filters → URL and trigger search (debounced for text inputs)
  const handleFilterChange = useCallback((newFilters: FilterState) => {
    setFilters(newFilters);
    router.replace(`/search?${filtersToSearchParams(newFilters)}`, { scroll: false });

    if (debounceRef.current) clearTimeout(debounceRef.current);
    debounceRef.current = setTimeout(() => runSearch(newFilters), 400);
  }, [router, runSearch]);

  // Initial search on mount
  useEffect(() => {
    runSearch(filters);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const activeCount =
    filters.categories.length + filters.conditions.length + filters.colors.length +
    (filters.lat !== null ? 1 : 0) +
    (filters.minPrice || filters.maxPrice ? 1 : 0) +
    (filters.search ? 1 : 0);

  return (
    <div className="min-h-screen bg-brand-white">
      <div className="max-w-screen-xl mx-auto px-4 py-10">
        {/* Header */}
        <div className="mb-8">
          <h1 className="font-heading text-3xl text-brand-blue mb-1">Browse listings</h1>
          <p className="font-body text-brand-burgundy/60 text-sm">
            {loading ? 'Searching…' : `${products.length} listing${products.length !== 1 ? 's' : ''} found`}
            {activeCount > 0 && ` · ${activeCount} filter${activeCount !== 1 ? 's' : ''} active`}
          </p>
        </div>

        <div className="flex gap-8 items-start">
          <SearchFilters filters={filters} onChange={handleFilterChange} />

          <main className="flex-1 min-w-0">
            {loading ? (
              <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
                {Array.from({ length: 9 }).map((_, i) => (
                  <div key={i} className="rounded-3xl bg-brand-grey/20 animate-pulse aspect-[4/5]" />
                ))}
              </div>
            ) : products.length === 0 ? (
              <div className="text-center py-24">
                <p className="font-heading text-2xl text-brand-blue mb-2">No listings found</p>
                <p className="font-body text-brand-burgundy/60">Try adjusting your filters or broadening your search.</p>
              </div>
            ) : (
              <ProductGrid
                products={products}
                onSelectProduct={p => router.push(`/products/${p.id}`)}
                favoriteIds={favoriteIds}
                onToggleFavorite={id => toggleFavorite(id)}
                isLoggedIn={isLoggedIn}
              />
            )}
          </main>
        </div>
      </div>
    </div>
  );
}

export default function SearchPageWrapper() {
  return (
    <Suspense>
      <SearchPage />
    </Suspense>
  );
}
