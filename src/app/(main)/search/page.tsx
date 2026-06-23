'use client';

import { useEffect, useState, useCallback, useRef, Suspense } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { fetchProductsPaged } from '@/services/api';
import type { Product } from '@/types';
import ProductGrid from '@/components/ProductGrid';
import SearchFilters, { FilterState } from '@/components/SearchFilters';
import SearchBar, { type SearchFilters as BarFilters } from '@/components/SearchBar';
import { useAuth } from '@/context/AuthContext';

function filtersToSearchParams(filters: FilterState): URLSearchParams {
  const p = new URLSearchParams();
  if (filters.search) p.set('search', filters.search);
  if (filters.categories.length) p.set('categories', filters.categories.join(','));
  if (filters.conditions.length) p.set('conditions', filters.conditions.join(','));
  if (filters.colors.length) p.set('colors', filters.colors.join(','));
  if (filters.materials.length) p.set('materials', filters.materials.join(','));
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
    materials: params.get('materials') ? params.get('materials')!.split(',') : [],
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

const PAGE_SIZE = 12;

// Build API params for a given filter state and page. API takes a single category/condition;
// multi-select is narrowed client-side via clientFilter below.
function buildParams(f: FilterState, page: number) {
  return {
    search: f.search || undefined,
    category: f.categories.length === 1 ? f.categories[0] : undefined,
    minPrice: f.minPrice ? parseFloat(f.minPrice) : undefined,
    maxPrice: f.maxPrice ? parseFloat(f.maxPrice) : undefined,
    condition: f.conditions.length === 1 ? f.conditions[0] : undefined,
    colors: f.colors.length ? f.colors : undefined,
    materials: f.materials.length ? f.materials : undefined,
    lat: f.lat ?? undefined,
    lng: f.lng ?? undefined,
    distance: f.lat !== null ? (f.distance ?? 3) : undefined,
    startDate: f.startDate || undefined,
    endDate: f.endDate || undefined,
    page,
    pageSize: PAGE_SIZE,
  };
}

function clientFilter(items: Product[], f: FilterState): Product[] {
  return items.filter(p => {
    if (f.categories.length > 1 && !f.categories.includes(p.category)) return false;
    if (f.conditions.length > 1 && !f.conditions.includes(p.condition)) return false;
    return true;
  });
}

function SearchPage() {
  const router = useRouter();
  const searchParams = useSearchParams();

  const { isLoggedIn, favoriteIds, toggleFavorite } = useAuth();
  const [filters, setFilters] = useState<FilterState>(() => searchParamsToFilters(searchParams));
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);
  const [loadingMore, setLoadingMore] = useState(false);
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [total, setTotal] = useState(0);
  const debounceRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const sentinelRef = useRef<HTMLDivElement>(null);

  const runSearch = useCallback(async (f: FilterState) => {
    setLoading(true);
    setPage(1);
    const { items, total, totalPages } = await fetchProductsPaged(buildParams(f, 1));
    setProducts(clientFilter(items, f));
    setTotal(total);
    setTotalPages(totalPages);
    setLoading(false);
  }, []);

  const loadMore = useCallback(async () => {
    if (loading || loadingMore || page >= totalPages) return;
    const next = page + 1;
    setLoadingMore(true);
    const { items } = await fetchProductsPaged(buildParams(filters, next));
    setProducts(prev => [...prev, ...clientFilter(items, filters)]);
    setPage(next);
    setLoadingMore(false);
  }, [loading, loadingMore, page, totalPages, filters]);

  // Auto-load the next page when the sentinel scrolls into view
  useEffect(() => {
    const el = sentinelRef.current;
    if (!el) return;
    const obs = new IntersectionObserver(
      entries => { if (entries[0].isIntersecting) loadMore(); },
      { rootMargin: '400px' }
    );
    obs.observe(el);
    return () => obs.disconnect();
  }, [loadMore]);

  // Sync filters → URL and trigger search (debounced for text inputs)
  const handleFilterChange = useCallback((newFilters: FilterState) => {
    setFilters(newFilters);
    router.replace(`/search?${filtersToSearchParams(newFilters)}`, { scroll: false });

    if (debounceRef.current) clearTimeout(debounceRef.current);
    debounceRef.current = setTimeout(() => runSearch(newFilters), 400);
  }, [router, runSearch]);

  // Map the SearchBar output into FilterState, preserving sidebar selections
  const handleBarSearch = useCallback((sf: BarFilters) => {
    handleFilterChange({
      ...filters,
      search: sf.search,
      locationQuery: sf.location,
      lat: sf.lat ?? null,
      lng: sf.lng ?? null,
      distance: sf.distance ?? 3,
      startDate: sf.startDate,
      endDate: sf.endDate,
    });
  }, [filters, handleFilterChange]);

  // Initial search on mount
  useEffect(() => {
    runSearch(filters);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const activeCount =
    filters.categories.length + filters.conditions.length + filters.colors.length + filters.materials.length +
    (filters.lat !== null ? 1 : 0) +
    (filters.minPrice || filters.maxPrice ? 1 : 0) +
    (filters.search ? 1 : 0);

  return (
    <div className="min-h-screen bg-brand-white">
      <div className="max-w-screen-xl mx-auto px-4 py-10">
        {/* Header */}
        <div className="mb-4">
          <h1 className="font-heading text-3xl text-brand-blue mb-1">Browse listings</h1>
          <p className="font-body text-brand-burgundy/60 text-sm">
            {loading ? 'Searching…' : `${total} listing${total !== 1 ? 's' : ''} found`}
            {activeCount > 0 && ` · ${activeCount} filter${activeCount !== 1 ? 's' : ''} active`}
          </p>
        </div>

        <div className="mb-6">
          <SearchBar
            widthClass="w-full"
            datePickerPosition="bottom"
            onSearch={handleBarSearch}
            initialFilters={{
              search: filters.search,
              location: filters.locationQuery,
              lat: filters.lat ?? undefined,
              lng: filters.lng ?? undefined,
              distance: filters.distance ?? 3,
              startDate: filters.startDate,
              endDate: filters.endDate,
            }}
          />
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
              <>
                <ProductGrid
                  products={products}
                  onSelectProduct={p => router.push(`/products/${p.id}`)}
                  favoriteIds={favoriteIds}
                  onToggleFavorite={id => toggleFavorite(id)}
                  isLoggedIn={isLoggedIn}
                />
                {/* Load-more sentinel — auto-loads when scrolled near, with a manual fallback */}
                <div ref={sentinelRef} className="mt-10 flex justify-center">
                  {loadingMore ? (
                    <div className="inline-block w-6 h-6 border-2 border-brand-orange border-t-transparent rounded-full animate-spin" />
                  ) : page < totalPages ? (
                    <button
                      onClick={loadMore}
                      className="bg-brand-orange text-white font-heading rounded-full px-8 py-3 hover:brightness-90 transition-all"
                    >
                      Load more
                    </button>
                  ) : (
                    <p className="font-body text-sm text-brand-burgundy/40">You&apos;ve reached the end</p>
                  )}
                </div>
              </>
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
