'use client';

import React, { useState } from 'react';

export interface SearchFilters {
  search: string;
  location: string;
  startDate: string;
  endDate: string;
}

interface SearchBarProps {
  onSearch: (filters: SearchFilters) => void;
  initialFilters?: Partial<SearchFilters>;
}

const SearchBar: React.FC<SearchBarProps> = ({ onSearch, initialFilters }) => {
  const [search, setSearch] = useState(initialFilters?.search || '');
  const [location, setLocation] = useState(initialFilters?.location || '');
  const [startDate, setStartDate] = useState(initialFilters?.startDate || '');
  const [endDate, setEndDate] = useState(initialFilters?.endDate || '');

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSearch({ search, location, startDate, endDate });
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter') {
      handleSubmit(e);
    }
  };

  const handleClear = () => {
    setSearch('');
    setLocation('');
    setStartDate('');
    setEndDate('');
    onSearch({ search: '', location: '', startDate: '', endDate: '' });
  };

  const hasFilters = search || location || startDate || endDate;

  return (
    <form onSubmit={handleSubmit} className="bg-brand-white p-3 rounded-lg shadow-xl max-w-4xl mx-auto flex flex-col md:flex-row items-center md:space-x-2 font-body border border-brand-grey">
      {/* Keyword Search */}
      <div className="w-full md:w-auto flex-grow flex items-center px-3 py-2 md:border-r border-brand-grey">
        <svg className="w-5 h-5 text-brand-grey-text mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" /></svg>
        <input
          type="text"
          placeholder="What are you looking for?"
          className="w-full bg-transparent focus:outline-none text-brand-burgundy placeholder-brand-grey-text text-base"
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          onKeyDown={handleKeyDown}
        />
      </div>

      {/* Location Search */}
      <div className="w-full md:w-auto flex-grow flex items-center px-3 py-2 md:border-r border-brand-grey border-t md:border-t-0">
        <svg className="w-5 h-5 text-brand-grey-text mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" /><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" /></svg>
        <input
          type="text"
          placeholder="London postcode"
          className="w-full bg-transparent focus:outline-none text-brand-burgundy placeholder-brand-grey-text text-base"
          value={location}
          onChange={(e) => setLocation(e.target.value)}
          onKeyDown={handleKeyDown}
        />
      </div>

      {/* Date Range */}
      <div className="w-full md:w-auto flex-grow flex items-center px-3 py-2 border-t md:border-t-0 space-x-2">
        <svg className="w-5 h-5 text-brand-grey-text mr-2 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" /></svg>
        <div className="flex items-center space-x-1 w-full">
          <input
            type="date"
            placeholder="Start"
            className="w-28 bg-transparent focus:outline-none text-brand-burgundy placeholder-brand-grey-text text-sm text-center"
            value={startDate}
            onChange={(e) => setStartDate(e.target.value)}
          />
          <span className="text-brand-grey-text">-</span>
          <input
            type="date"
            placeholder="End"
            className="w-28 bg-transparent focus:outline-none text-brand-burgundy placeholder-brand-grey-text text-sm text-center"
            value={endDate}
            onChange={(e) => setEndDate(e.target.value)}
          />
        </div>
      </div>

      <div className="flex items-center gap-2 w-full md:w-auto mt-2 md:mt-0">
        {hasFilters && (
          <button
            type="button"
            onClick={handleClear}
            className="text-brand-burgundy/60 hover:text-brand-burgundy text-sm font-medium px-2"
          >
            Clear
          </button>
        )}
        <button
          type="submit"
          className="flex-grow md:flex-grow-0 bg-brand-orange text-brand-white rounded px-6 py-3 hover:brightness-90 transition-all font-medium"
        >
          Search
        </button>
      </div>
    </form>
  );
};

export default SearchBar;
