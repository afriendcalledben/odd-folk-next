'use client';

import { useState, useEffect, useRef } from 'react';
import { Input, Button } from '@/components/ui';
import { SlidersHorizontal, X } from 'lucide-react';

const CATEGORIES = [
  'Event Furniture', 'Lighting', 'Backdrops', 'Tableware', 'Decorative Props',
  'Plants & Florals', 'Photography', 'Weddings', 'Signage', 'Textiles', 'Other',
];

const CONDITIONS = ['Like New', 'Good', 'Fair', 'Poor', 'Vintage/Antique'];

const COLOURS = [
  'Black', 'White', 'Grey', 'Beige', 'Brown', 'Red', 'Blue', 'Green',
  'Yellow', 'Orange', 'Pink', 'Purple', 'Gold', 'Silver', 'Copper', 'Natural', 'Cream', 'Multi-colour',
];

const COLOUR_HEX: Record<string, string> = {
  Black: '#1a1a1a', White: '#ffffff', Grey: '#9ca3af', Beige: '#d4b896',
  Brown: '#92400e', Red: '#dc2626', Blue: '#2563eb', Green: '#16a34a',
  Yellow: '#eab308', Orange: '#ea580c', Pink: '#ec4899', Purple: '#9333ea',
  Gold: '#d97706', Silver: '#94a3b8', Copper: '#b45309', Natural: '#a3825a',
  Cream: '#fef3c7', 'Multi-colour': 'conic-gradient(red, yellow, green, blue, red)',
};

const DISTANCES = [
  { label: '+ 0.5 miles', value: 0.5 },
  { label: '+ 1 mile', value: 1 },
  { label: '+ 3 miles', value: 3 },
  { label: '+ 5 miles', value: 5 },
  { label: '+ 10 miles', value: 10 },
];

export interface FilterState {
  search: string;
  categories: string[];
  conditions: string[];
  colors: string[];
  minPrice: string;
  maxPrice: string;
  locationQuery: string;
  lat: number | null;
  lng: number | null;
  distance: number | null;
  startDate: string;
  endDate: string;
}

export const defaultFilters: FilterState = {
  search: '',
  categories: [],
  conditions: [],
  colors: [],
  minPrice: '',
  maxPrice: '',
  locationQuery: '',
  lat: null,
  lng: null,
  distance: 3,
  startDate: '',
  endDate: '',
};

interface NominatimResult {
  place_id: number;
  display_name: string;
  lat: string;
  lon: string;
}

interface SearchFiltersProps {
  filters: FilterState;
  onChange: (filters: FilterState) => void;
}

function FilterSection({ title, children, defaultOpen = true }: { title: string; children: React.ReactNode; defaultOpen?: boolean }) {
  const [open, setOpen] = useState(defaultOpen);
  return (
    <div className="border-b border-brand-grey/30 pb-5">
      <button
        type="button"
        onClick={() => setOpen(o => !o)}
        className="flex items-center justify-between w-full font-body font-bold text-sm text-brand-burgundy mb-3"
      >
        {title}
        <span className="text-brand-burgundy/40 text-xs">{open ? '▲' : '▼'}</span>
      </button>
      {open && children}
    </div>
  );
}

export default function SearchFilters({ filters, onChange }: SearchFiltersProps) {
  const [mobileOpen, setMobileOpen] = useState(false);
  const [locationResults, setLocationResults] = useState<NominatimResult[]>([]);
  const [showLocationDropdown, setShowLocationDropdown] = useState(false);
  const debounceRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const locationDropdownRef = useRef<HTMLDivElement>(null);

  const update = (partial: Partial<FilterState>) => onChange({ ...filters, ...partial });

  const toggleItem = (key: 'categories' | 'conditions' | 'colors', value: string) => {
    const current = filters[key];
    update({ [key]: current.includes(value) ? current.filter(v => v !== value) : [...current, value] });
  };

  const hasActiveFilters =
    filters.categories.length > 0 || filters.conditions.length > 0 || filters.colors.length > 0 ||
    filters.minPrice || filters.maxPrice || filters.lat !== null;

  // Nominatim location search
  useEffect(() => {
    if (filters.locationQuery.length < 3) { setLocationResults([]); setShowLocationDropdown(false); return; }
    if (debounceRef.current) clearTimeout(debounceRef.current);
    debounceRef.current = setTimeout(async () => {
      try {
        const res = await fetch(
          `https://nominatim.openstreetmap.org/search?q=${encodeURIComponent(filters.locationQuery)}&format=json&limit=5&countrycodes=gb&viewbox=-0.5103,51.6919,0.3340,51.2868&bounded=1`,
          { headers: { 'User-Agent': 'OddFolk/1.0 (contact@oddfolk.co.uk)', 'Accept-Language': 'en' } }
        );
        const data: NominatimResult[] = await res.json();
        setLocationResults(data.slice(0, 5));
        setShowLocationDropdown(data.length > 0);
      } catch { /* silent */ }
    }, 300);
    return () => { if (debounceRef.current) clearTimeout(debounceRef.current); };
  }, [filters.locationQuery]);

  useEffect(() => {
    function handleClick(e: MouseEvent) {
      if (locationDropdownRef.current && !locationDropdownRef.current.contains(e.target as Node)) {
        setShowLocationDropdown(false);
      }
    }
    document.addEventListener('mousedown', handleClick);
    return () => document.removeEventListener('mousedown', handleClick);
  }, []);

  const clearAll = () => onChange({ ...defaultFilters });

  const panel = (
    <div className="space-y-5">
      {hasActiveFilters && (
        <button
          type="button"
          onClick={clearAll}
          className="flex items-center gap-1.5 text-xs text-brand-orange font-body underline"
        >
          <X size={12} /> Clear all filters
        </button>
      )}

      <FilterSection title="Search">
        <Input
          placeholder="Keywords, tags…"
          value={filters.search}
          onChange={e => update({ search: e.target.value })}
        />
      </FilterSection>

      <FilterSection title="Location">
        <div className="space-y-3">
          <div className="relative" ref={locationDropdownRef}>
            <Input
              placeholder="Postcode or area…"
              value={filters.locationQuery}
              onChange={e => update({ locationQuery: e.target.value, lat: null, lng: null })}
            />
            {showLocationDropdown && (
              <ul className="absolute z-50 w-full bg-white border border-brand-grey rounded-xl shadow-lg mt-1 max-h-48 overflow-y-auto">
                {locationResults.map(r => (
                  <li
                    key={r.place_id}
                    className="px-3 py-2.5 hover:bg-brand-orange/10 cursor-pointer font-body text-brand-burgundy text-xs border-b border-brand-grey/30 last:border-0"
                    onMouseDown={() => {
                      update({ locationQuery: r.display_name, lat: parseFloat(r.lat), lng: parseFloat(r.lon) });
                      setShowLocationDropdown(false);
                    }}
                  >
                    {r.display_name}
                  </li>
                ))}
              </ul>
            )}
          </div>
          {filters.lat !== null && (
            <select
              className="w-full p-3 bg-brand-white border border-brand-grey rounded-xl font-body text-sm text-brand-burgundy focus:outline-none"
              value={filters.distance ?? 3}
              onChange={e => update({ distance: parseFloat(e.target.value) })}
            >
              {DISTANCES.map(d => (
                <option key={d.value} value={d.value}>{d.label}</option>
              ))}
            </select>
          )}
        </div>
      </FilterSection>

      <FilterSection title="Price per day (£)">
        <div className="flex items-center gap-2">
          <Input
            placeholder="Min"
            type="number"
            min={0}
            value={filters.minPrice}
            onChange={e => update({ minPrice: e.target.value })}
          />
          <span className="text-brand-burgundy/40 font-body text-sm">–</span>
          <Input
            placeholder="Max"
            type="number"
            min={0}
            value={filters.maxPrice}
            onChange={e => update({ maxPrice: e.target.value })}
          />
        </div>
      </FilterSection>

      <FilterSection title="Category">
        <div className="space-y-2">
          {CATEGORIES.map(cat => (
            <label key={cat} className="flex items-center gap-2.5 cursor-pointer">
              <input
                type="checkbox"
                checked={filters.categories.includes(cat)}
                onChange={() => toggleItem('categories', cat)}
                className="accent-brand-orange w-4 h-4 rounded"
              />
              <span className="font-body text-sm text-brand-burgundy">{cat}</span>
            </label>
          ))}
        </div>
      </FilterSection>

      <FilterSection title="Condition">
        <div className="space-y-2">
          {CONDITIONS.map(cond => (
            <label key={cond} className="flex items-center gap-2.5 cursor-pointer">
              <input
                type="checkbox"
                checked={filters.conditions.includes(cond)}
                onChange={() => toggleItem('conditions', cond)}
                className="accent-brand-orange w-4 h-4 rounded"
              />
              <span className="font-body text-sm text-brand-burgundy">{cond}</span>
            </label>
          ))}
        </div>
      </FilterSection>

      <FilterSection title="Colour">
        <div className="flex flex-wrap gap-2">
          {COLOURS.map(colour => (
            <button
              key={colour}
              type="button"
              title={colour}
              onClick={() => toggleItem('colors', colour)}
              className={`w-7 h-7 rounded-full border-2 transition-all ${
                filters.colors.includes(colour)
                  ? 'border-brand-orange scale-110 shadow-md'
                  : 'border-transparent hover:border-brand-grey'
              }`}
              style={
                colour === 'Multi-colour'
                  ? { background: 'conic-gradient(red, yellow, green, blue, red)' }
                  : { backgroundColor: COLOUR_HEX[colour] }
              }
            />
          ))}
        </div>
        {filters.colors.length > 0 && (
          <p className="text-xs text-brand-burgundy/50 font-body mt-2">{filters.colors.join(', ')}</p>
        )}
      </FilterSection>

      <FilterSection title="Availability" defaultOpen={false}>
        <div className="space-y-2">
          <div>
            <label className="text-xs text-brand-burgundy/60 font-body mb-1 block">From</label>
            <input
              type="date"
              value={filters.startDate}
              min={new Date().toISOString().split('T')[0]}
              onChange={e => {
                const val = e.target.value;
                onChange({ ...filters, startDate: val, endDate: filters.endDate && filters.endDate < val ? '' : filters.endDate });
              }}
              className="w-full p-2 bg-brand-white border border-brand-grey rounded-xl font-body text-sm text-brand-burgundy focus:outline-none focus:ring-2 focus:ring-brand-orange/30"
            />
          </div>
          <div>
            <label className="text-xs text-brand-burgundy/60 font-body mb-1 block">To</label>
            <input
              type="date"
              value={filters.endDate}
              min={filters.startDate || new Date().toISOString().split('T')[0]}
              onChange={e => onChange({ ...filters, endDate: e.target.value })}
              className="w-full p-2 bg-brand-white border border-brand-grey rounded-xl font-body text-sm text-brand-burgundy focus:outline-none focus:ring-2 focus:ring-brand-orange/30"
            />
          </div>
          {(filters.startDate || filters.endDate) && (
            <button
              onClick={() => onChange({ ...filters, startDate: '', endDate: '' })}
              className="text-xs text-brand-burgundy/50 hover:text-brand-burgundy transition-colors"
            >
              Clear dates
            </button>
          )}
        </div>
      </FilterSection>
    </div>
  );

  return (
    <>
      {/* Mobile toggle */}
      <div className="lg:hidden mb-4">
        <Button variant="outline" onClick={() => setMobileOpen(true)}>
          <SlidersHorizontal size={16} className="mr-2" /> Filters
          {hasActiveFilters && (
            <span className="ml-2 bg-brand-orange text-white text-xs rounded-full w-5 h-5 flex items-center justify-center">
              {filters.categories.length + filters.conditions.length + filters.colors.length + (filters.lat ? 1 : 0) + (filters.minPrice || filters.maxPrice ? 1 : 0)}
            </span>
          )}
        </Button>
      </div>

      {/* Mobile drawer */}
      {mobileOpen && (
        <div className="fixed inset-0 z-50 flex lg:hidden">
          <div className="absolute inset-0 bg-black/40" onClick={() => setMobileOpen(false)} />
          <div className="relative ml-auto w-80 bg-white h-full overflow-y-auto p-6 shadow-xl">
            <div className="flex items-center justify-between mb-6">
              <h2 className="font-heading text-lg text-brand-blue">Filters</h2>
              <button type="button" onClick={() => setMobileOpen(false)}><X size={20} /></button>
            </div>
            {panel}
            <div className="mt-6">
              <Button variant="primary" fullWidth onClick={() => setMobileOpen(false)}>Apply Filters</Button>
            </div>
          </div>
        </div>
      )}

      {/* Desktop sidebar */}
      <aside className="hidden lg:block w-72 shrink-0">
        <div className="sticky top-24 bg-white border border-brand-grey rounded-3xl p-6 shadow-sm">
          <div className="flex items-center justify-between mb-5">
            <h2 className="font-heading text-lg text-brand-blue flex items-center gap-2">
              <SlidersHorizontal size={18} /> Filters
            </h2>
          </div>
          {panel}
        </div>
      </aside>
    </>
  );
}
