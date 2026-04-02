'use client';

import { useEffect, useRef, useState } from 'react';
import type { FilterState } from './SearchFilters';

interface NominatimResult {
  place_id: number;
  display_name: string;
  lat: string;
  lon: string;
}

interface SearchTopBarProps {
  filters: FilterState;
  onChange: (filters: FilterState) => void;
}

export default function SearchTopBar({ filters, onChange }: SearchTopBarProps) {
  const [locationResults, setLocationResults] = useState<NominatimResult[]>([]);
  const [showLocationDropdown, setShowLocationDropdown] = useState(false);
  const debounceRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const locationDropdownRef = useRef<HTMLDivElement>(null);

  const update = (partial: Partial<FilterState>) => onChange({ ...filters, ...partial });

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

  const inputClass = 'w-full px-3 py-2.5 bg-white border border-brand-grey rounded-xl font-body text-sm text-brand-burgundy placeholder:text-brand-burgundy/40 focus:outline-none focus:ring-2 focus:ring-brand-orange/30 transition-colors';

  return (
    <div className="flex flex-col sm:flex-row gap-2 mb-6">
      {/* Search */}
      <div className="flex-1 min-w-0">
        <input
          type="text"
          placeholder="Keywords, tags…"
          value={filters.search}
          onChange={e => update({ search: e.target.value })}
          className={inputClass}
        />
      </div>

      {/* Location */}
      <div className="flex gap-2 sm:w-72">
        <div className="relative flex-1" ref={locationDropdownRef}>
          <input
            type="text"
            placeholder="Postcode or area…"
            value={filters.locationQuery}
            onChange={e => update({ locationQuery: e.target.value, lat: null, lng: null })}
            className={inputClass}
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
            className="px-2 py-2.5 bg-white border border-brand-grey rounded-xl font-body text-sm text-brand-burgundy focus:outline-none shrink-0"
            value={filters.distance ?? 3}
            onChange={e => update({ distance: parseFloat(e.target.value) })}
          >
            {[0.5, 1, 3, 5, 10].map(v => (
              <option key={v} value={v}>+{v}mi</option>
            ))}
          </select>
        )}
      </div>

      {/* Availability */}
      <div className="flex items-center gap-2 sm:w-auto">
        <input
          type="date"
          value={filters.startDate}
          min={new Date().toISOString().split('T')[0]}
          onChange={e => {
            const val = e.target.value;
            onChange({ ...filters, startDate: val, endDate: filters.endDate && filters.endDate < val ? '' : filters.endDate });
          }}
          className={`${inputClass} w-36`}
          title="From date"
        />
        <span className="text-brand-burgundy/40 font-body text-sm shrink-0">–</span>
        <input
          type="date"
          value={filters.endDate}
          min={filters.startDate || new Date().toISOString().split('T')[0]}
          onChange={e => onChange({ ...filters, endDate: e.target.value })}
          className={`${inputClass} w-36`}
          title="To date"
        />
        {(filters.startDate || filters.endDate) && (
          <button
            onClick={() => onChange({ ...filters, startDate: '', endDate: '' })}
            className="text-brand-burgundy/40 hover:text-brand-burgundy transition-colors shrink-0 text-lg leading-none"
            title="Clear dates"
          >
            ×
          </button>
        )}
      </div>
    </div>
  );
}
