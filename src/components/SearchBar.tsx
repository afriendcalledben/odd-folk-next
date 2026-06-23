'use client';

import React, { useState, useEffect, useRef } from 'react';
import dynamic from 'next/dynamic';
import BookingCalendar from './BookingCalendar';

const LocationRadiusMap = dynamic(() => import('./LocationRadiusMapInner'), { ssr: false });

export interface SearchFilters {
  search: string;
  location: string;
  lat?: number;
  lng?: number;
  distance?: number;
  startDate: string;
  endDate: string;
}

const AREA_TYPES = new Set([
  'postcode',
  'city', 'town', 'village', 'hamlet',
  'suburb', 'neighbourhood', 'quarter',
  'county', 'state_district', 'administrative',
  'municipality',
]);

interface NominatimResult {
  place_id: number;
  display_name: string;
  lat: string;
  lon: string;
  type: string;
  class: string;
}

interface SearchBarProps {
  onSearch: (filters: SearchFilters) => void;
  initialFilters?: Partial<SearchFilters>;
  /** Overrides the default width container (max-w-4xl mx-auto) — e.g. "w-full" on the search page. */
  widthClass?: string;
  /** Direction the date calendar pops open. "top" suits the hero; "bottom" suits the search page. */
  datePickerPosition?: 'top' | 'bottom';
}

function parseDate(str: string): Date | null {
  if (!str) return null;
  const [y, m, d] = str.split('-').map(Number);
  if (!y || !m || !d) return null;
  return new Date(y, m - 1, d);
}

function formatDate(date: Date): string {
  const y = date.getFullYear();
  const m = String(date.getMonth() + 1).padStart(2, '0');
  const d = String(date.getDate()).padStart(2, '0');
  return `${y}-${m}-${d}`;
}

function formatLabel(str: string): string {
  const d = parseDate(str);
  return d ? d.toLocaleDateString('en-GB', { day: 'numeric', month: 'short' }) : '';
}

const DISTANCE_OPTIONS = [
  { label: '+0.5 mi', value: 0.5 },
  { label: '+1 mi', value: 1 },
  { label: '+3 mi', value: 3 },
  { label: '+5 mi', value: 5 },
  { label: '+10 mi', value: 10 },
];

const SearchBar: React.FC<SearchBarProps> = ({ onSearch, initialFilters, widthClass = 'max-w-4xl mx-auto', datePickerPosition = 'top' }) => {
  const [search, setSearch] = useState(initialFilters?.search || '');
  const [location, setLocation] = useState(initialFilters?.location || '');
  const [lat, setLat] = useState<number | undefined>(initialFilters?.lat);
  const [lng, setLng] = useState<number | undefined>(initialFilters?.lng);
  const [distance, setDistance] = useState<number>(initialFilters?.distance ?? 3);
  const [startDate, setStartDate] = useState(initialFilters?.startDate || '');
  const [endDate, setEndDate] = useState(initialFilters?.endDate || '');

  const [suggestions, setSuggestions] = useState<NominatimResult[]>([]);
  const [showSuggestions, setShowSuggestions] = useState(false);
  const [showLocationModal, setShowLocationModal] = useState(false);
  const [showDatePicker, setShowDatePicker] = useState(false);
  const debounceRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const dropdownRef = useRef<HTMLDivElement>(null);
  const dateRef = useRef<HTMLDivElement>(null);

  // Nominatim autocomplete
  useEffect(() => {
    if (location.length < 3) {
      setSuggestions([]);
      setShowSuggestions(false);
      return;
    }
    if (debounceRef.current) clearTimeout(debounceRef.current);
    debounceRef.current = setTimeout(async () => {
      try {
        const res = await fetch(
          `https://nominatim.openstreetmap.org/search?q=${encodeURIComponent(location)}&format=json&addressdetails=1&limit=8&countrycodes=gb&viewbox=-0.5103,51.6919,0.3340,51.2868&bounded=1`,
          { headers: { 'User-Agent': 'OddFolk/1.0 (contact@oddfolk.co.uk)', 'Accept-Language': 'en' } }
        );
        const data: NominatimResult[] = await res.json();
        const filtered = data.filter(r => AREA_TYPES.has(r.type) || r.class === 'boundary').slice(0, 5);
        setSuggestions(filtered);
        setShowSuggestions(filtered.length > 0);
      } catch {
        // silently fail
      }
    }, 300);
    return () => { if (debounceRef.current) clearTimeout(debounceRef.current); };
  }, [location]);

  // Close dropdown on outside click
  useEffect(() => {
    function handleClick(e: MouseEvent) {
      if (dropdownRef.current && !dropdownRef.current.contains(e.target as Node)) {
        setShowSuggestions(false);
      }
      if (dateRef.current && !dateRef.current.contains(e.target as Node)) {
        setShowDatePicker(false);
      }
    }
    document.addEventListener('mousedown', handleClick);
    return () => document.removeEventListener('mousedown', handleClick);
  }, []);

  function selectSuggestion(r: NominatimResult) {
    setLocation(r.display_name.split(',').slice(0, 2).join(',').trim());
    setLat(parseFloat(r.lat));
    setLng(parseFloat(r.lon));
    setShowSuggestions(false);
  }

  function handleLocationChange(value: string) {
    setLocation(value);
    // Clear resolved coords if user edits the field manually
    setLat(undefined);
    setLng(undefined);
  }

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSearch({ search, location, lat, lng, distance: lat ? distance : undefined, startDate, endDate });
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter') handleSubmit(e as unknown as React.FormEvent);
  };

  const handleClear = () => {
    setSearch('');
    setLocation('');
    setLat(undefined);
    setLng(undefined);
    setDistance(3);
    setStartDate('');
    setEndDate('');
    setSuggestions([]);
    onSearch({ search: '', location: '', startDate: '', endDate: '' });
  };

  const hasFilters = search || location || startDate || endDate;

  return (
    <form onSubmit={handleSubmit} className={`bg-brand-white p-3 rounded-lg shadow-xl flex flex-col gap-2 font-body border border-brand-grey ${widthClass}`}>
      {/* Row 1: Keyword Search + Search button */}
      <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-2">
        <div className="flex-grow flex items-center px-3 py-2">
          <svg className="w-5 h-5 text-brand-grey-text mr-2 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" /></svg>
          <input
            type="text"
            placeholder="What are you looking for?"
            className="w-full bg-transparent focus:outline-none text-brand-burgundy placeholder-brand-grey-text text-base"
            value={search}
            onChange={e => setSearch(e.target.value)}
            onKeyDown={handleKeyDown}
          />
        </div>
        <button type="submit" className="bg-brand-orange text-brand-white rounded-full px-8 py-3 hover:brightness-90 transition-all font-heading flex-shrink-0">
          Search
        </button>
      </div>

      {/* Row 2: Location | Date Range | Clear */}
      <div className="flex flex-col md:flex-row items-stretch md:items-center gap-2 border-t border-brand-grey pt-2">
        {/* Location */}
        <div className="flex-grow flex items-center px-3 py-2 md:border-r border-brand-grey gap-2">
          <svg className="w-5 h-5 text-brand-grey-text flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" /><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" /></svg>
          <button
            type="button"
            onClick={() => setShowLocationModal(true)}
            className="w-full text-left bg-transparent focus:outline-none text-base truncate"
          >
            {location
              ? <span className="text-brand-burgundy">{location}{lat ? ` · +${distance} mi` : ''}</span>
              : <span className="text-brand-grey-text">Postcode or area</span>}
          </button>
        </div>

        {/* Date Range */}
        <div className="flex-grow flex items-center px-3 py-2 space-x-2 relative border-t md:border-t-0 border-brand-grey" ref={dateRef}>
          <svg className="w-5 h-5 text-brand-grey-text mr-2 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" /></svg>
          <div className="flex items-center space-x-1 w-full">
            <button
              type="button"
              onClick={() => setShowDatePicker(true)}
              className="w-28 bg-transparent focus:outline-none text-sm text-center cursor-pointer"
            >
              {startDate
                ? <span className="text-brand-burgundy">{formatLabel(startDate)}</span>
                : <span className="text-brand-grey-text">Start Date</span>}
            </button>
            <span className="text-brand-grey-text">-</span>
            <button
              type="button"
              onClick={() => setShowDatePicker(true)}
              className="w-28 bg-transparent focus:outline-none text-sm text-center cursor-pointer"
            >
              {endDate
                ? <span className="text-brand-burgundy">{formatLabel(endDate)}</span>
                : <span className="text-brand-grey-text">End Date</span>}
            </button>
          </div>

          {showDatePicker && (
            <div className={`absolute z-50 left-1/2 -translate-x-1/2 bg-white border border-brand-grey rounded-3xl shadow-2xl p-4 w-[340px] ${datePickerPosition === 'top' ? 'bottom-full mb-3' : 'top-full mt-3'}`}>
              <BookingCalendar
                initialStart={parseDate(startDate)}
                initialEnd={parseDate(endDate)}
                onChange={(s, e) => {
                  setStartDate(s ? formatDate(s) : '');
                  setEndDate(e ? formatDate(e) : '');
                }}
                minDate={new Date()}
              />
              <button
                type="button"
                onClick={() => setShowDatePicker(false)}
                className="w-full mt-3 bg-brand-burgundy text-white font-body font-bold py-2.5 rounded-xl hover:bg-brand-orange transition-colors text-sm"
              >
                Done
              </button>
            </div>
          )}
        </div>

        {/* Clear */}
        <button
          type="button"
          onClick={handleClear}
          disabled={!hasFilters}
          className="text-brand-burgundy/60 hover:text-brand-burgundy text-sm font-medium px-4 py-2 flex-shrink-0 self-center disabled:opacity-40 disabled:cursor-not-allowed"
        >
          Clear
        </button>
      </div>

      {/* Location Modal */}
      {showLocationModal && (
        <div
          className="fixed inset-0 z-[1000] flex items-center justify-center bg-black/50 backdrop-blur-sm p-4 animate-fade-in"
          onClick={() => setShowLocationModal(false)}
        >
          <div
            className="bg-white rounded-3xl shadow-2xl w-full max-w-lg overflow-hidden"
            onClick={e => e.stopPropagation()}
          >
            {/* Header */}
            <div className="flex justify-between items-center p-6 pb-4">
              <h2 className="font-heading text-xl text-brand-burgundy">Choose location</h2>
              <button
                type="button"
                onClick={() => setShowLocationModal(false)}
                className="w-8 h-8 flex items-center justify-center rounded-full hover:bg-brand-grey/10 border border-brand-burgundy/20 text-brand-burgundy transition-colors"
              >
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" /></svg>
              </button>
            </div>

            <div className="px-6 pb-6 space-y-4">
              {/* Location input + autocomplete */}
              <div className="relative" ref={dropdownRef}>
                <input
                  type="text"
                  placeholder="Postcode or area"
                  className="w-full border border-brand-grey rounded-xl px-4 py-3 focus:outline-none focus:ring-2 focus:ring-brand-orange text-brand-burgundy placeholder-brand-grey-text text-base"
                  value={location}
                  onChange={e => handleLocationChange(e.target.value)}
                  autoFocus
                />
                {showSuggestions && (
                  <ul className="absolute z-50 left-0 right-0 bg-white border border-brand-grey rounded-xl shadow-lg mt-2 max-h-52 overflow-y-auto">
                    {suggestions.map(r => (
                      <li
                        key={r.place_id}
                        className="px-4 py-2 hover:bg-brand-orange/10 cursor-pointer text-brand-burgundy text-sm border-b border-brand-grey/30 last:border-0"
                        onMouseDown={() => selectSuggestion(r)}
                      >
                        {r.display_name}
                      </li>
                    ))}
                  </ul>
                )}
              </div>

              {/* Radius selector */}
              <div className="flex items-center justify-between gap-3">
                <span className="text-sm font-medium text-brand-burgundy">Search radius</span>
                <select
                  value={distance}
                  onChange={e => setDistance(Number(e.target.value))}
                  disabled={!lat}
                  className="border border-brand-grey rounded-xl px-3 py-2 text-brand-burgundy text-sm focus:outline-none focus:ring-2 focus:ring-brand-orange cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {DISTANCE_OPTIONS.map(o => (
                    <option key={o.value} value={o.value}>{o.label}</option>
                  ))}
                </select>
              </div>

              {/* Map with radius circle */}
              <div className="rounded-2xl overflow-hidden border border-brand-grey" style={{ height: 320 }}>
                {lat && lng ? (
                  <LocationRadiusMap lat={lat} lng={lng} distanceMiles={distance} />
                ) : (
                  <div className="w-full h-full flex items-center justify-center bg-brand-grey/10 text-center px-6">
                    <p className="text-sm text-brand-burgundy/50">Search for a postcode or area to preview the search radius on the map.</p>
                  </div>
                )}
              </div>

              <button
                type="button"
                onClick={() => setShowLocationModal(false)}
                className="w-full bg-brand-burgundy text-white font-body font-bold py-3 rounded-xl hover:bg-brand-orange transition-colors"
              >
                Done
              </button>
            </div>
          </div>
        </div>
      )}
    </form>
  );
};

export default SearchBar;
