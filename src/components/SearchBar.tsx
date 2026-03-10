'use client';

import React, { useState, useEffect, useRef } from 'react';

export interface SearchFilters {
  search: string;
  location: string;
  lat?: number;
  lng?: number;
  distance?: number;
  startDate: string;
  endDate: string;
}

interface NominatimResult {
  place_id: number;
  display_name: string;
  lat: string;
  lon: string;
}

interface SearchBarProps {
  onSearch: (filters: SearchFilters) => void;
  initialFilters?: Partial<SearchFilters>;
}

const DISTANCE_OPTIONS = [
  { label: '+0.5 mi', value: 0.5 },
  { label: '+1 mi', value: 1 },
  { label: '+3 mi', value: 3 },
  { label: '+5 mi', value: 5 },
  { label: '+10 mi', value: 10 },
];

const SearchBar: React.FC<SearchBarProps> = ({ onSearch, initialFilters }) => {
  const [search, setSearch] = useState(initialFilters?.search || '');
  const [location, setLocation] = useState(initialFilters?.location || '');
  const [lat, setLat] = useState<number | undefined>(initialFilters?.lat);
  const [lng, setLng] = useState<number | undefined>(initialFilters?.lng);
  const [distance, setDistance] = useState<number>(initialFilters?.distance ?? 3);
  const [startDate, setStartDate] = useState(initialFilters?.startDate || '');
  const [endDate, setEndDate] = useState(initialFilters?.endDate || '');

  const [suggestions, setSuggestions] = useState<NominatimResult[]>([]);
  const [showSuggestions, setShowSuggestions] = useState(false);
  const debounceRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const dropdownRef = useRef<HTMLDivElement>(null);

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
          `https://nominatim.openstreetmap.org/search?q=${encodeURIComponent(location)}&format=json&limit=5&countrycodes=gb`,
          { headers: { 'User-Agent': 'OddFolk/1.0 (contact@oddfolk.co.uk)', 'Accept-Language': 'en' } }
        );
        const data: NominatimResult[] = await res.json();
        setSuggestions(data);
        setShowSuggestions(data.length > 0);
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
    <form onSubmit={handleSubmit} className="bg-brand-white p-3 rounded-lg shadow-xl max-w-4xl mx-auto flex flex-col md:flex-row items-center md:space-x-2 font-body border border-brand-grey">
      {/* Keyword Search */}
      <div className="w-full md:w-auto flex-grow flex items-center px-3 py-2 md:border-r border-brand-grey">
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

      {/* Location Search + Distance */}
      <div className="w-full md:w-auto flex-grow flex items-center px-3 py-2 md:border-r border-brand-grey border-t md:border-t-0 gap-2">
        <svg className="w-5 h-5 text-brand-grey-text flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" /><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" /></svg>
        <div className="relative flex-grow" ref={dropdownRef}>
          <input
            type="text"
            placeholder="Postcode or area"
            className="w-full bg-transparent focus:outline-none text-brand-burgundy placeholder-brand-grey-text text-base"
            value={location}
            onChange={e => handleLocationChange(e.target.value)}
            onKeyDown={handleKeyDown}
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
        {/* Distance dropdown — only meaningful once a location is resolved */}
        <select
          value={distance}
          onChange={e => setDistance(Number(e.target.value))}
          className="bg-transparent text-brand-burgundy text-sm focus:outline-none cursor-pointer flex-shrink-0"
        >
          {DISTANCE_OPTIONS.map(o => (
            <option key={o.value} value={o.value}>{o.label}</option>
          ))}
        </select>
      </div>

      {/* Date Range */}
      <div className="w-full md:w-auto flex-grow flex items-center px-3 py-2 border-t md:border-t-0 space-x-2">
        <svg className="w-5 h-5 text-brand-grey-text mr-2 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" /></svg>
        <div className="flex items-center space-x-1 w-full">
          <input
            type="date"
            className="w-28 bg-transparent focus:outline-none text-brand-burgundy placeholder-brand-grey-text text-sm text-center"
            value={startDate}
            onChange={e => setStartDate(e.target.value)}
          />
          <span className="text-brand-grey-text">-</span>
          <input
            type="date"
            className="w-28 bg-transparent focus:outline-none text-brand-burgundy placeholder-brand-grey-text text-sm text-center"
            value={endDate}
            onChange={e => setEndDate(e.target.value)}
          />
        </div>
      </div>

      <div className="flex items-center gap-2 w-full md:w-auto mt-2 md:mt-0">
        {hasFilters && (
          <button type="button" onClick={handleClear} className="text-brand-burgundy/60 hover:text-brand-burgundy text-sm font-medium px-2">
            Clear
          </button>
        )}
        <button type="submit" className="flex-grow md:flex-grow-0 bg-brand-orange text-brand-white rounded-full px-6 py-3 hover:brightness-90 transition-all font-heading">
          Search
        </button>
      </div>
    </form>
  );
};

export default SearchBar;
