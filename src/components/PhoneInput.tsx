'use client';

import React, { useState, useRef, useEffect } from 'react';

const COUNTRIES = [
  { code: 'GB', name: 'United Kingdom', dial: '+44', flag: '🇬🇧' },
  { code: 'US', name: 'United States', dial: '+1', flag: '🇺🇸' },
  { code: 'AU', name: 'Australia', dial: '+61', flag: '🇦🇺' },
  { code: 'CA', name: 'Canada', dial: '+1', flag: '🇨🇦' },
  { code: 'IE', name: 'Ireland', dial: '+353', flag: '🇮🇪' },
  { code: 'FR', name: 'France', dial: '+33', flag: '🇫🇷' },
  { code: 'DE', name: 'Germany', dial: '+49', flag: '🇩🇪' },
  { code: 'ES', name: 'Spain', dial: '+34', flag: '🇪🇸' },
  { code: 'IT', name: 'Italy', dial: '+39', flag: '🇮🇹' },
  { code: 'NL', name: 'Netherlands', dial: '+31', flag: '🇳🇱' },
  { code: 'BE', name: 'Belgium', dial: '+32', flag: '🇧🇪' },
  { code: 'CH', name: 'Switzerland', dial: '+41', flag: '🇨🇭' },
  { code: 'AT', name: 'Austria', dial: '+43', flag: '🇦🇹' },
  { code: 'SE', name: 'Sweden', dial: '+46', flag: '🇸🇪' },
  { code: 'NO', name: 'Norway', dial: '+47', flag: '🇳🇴' },
  { code: 'DK', name: 'Denmark', dial: '+45', flag: '🇩🇰' },
  { code: 'FI', name: 'Finland', dial: '+358', flag: '🇫🇮' },
  { code: 'PL', name: 'Poland', dial: '+48', flag: '🇵🇱' },
  { code: 'PT', name: 'Portugal', dial: '+351', flag: '🇵🇹' },
  { code: 'GR', name: 'Greece', dial: '+30', flag: '🇬🇷' },
  { code: 'CZ', name: 'Czech Republic', dial: '+420', flag: '🇨🇿' },
  { code: 'HU', name: 'Hungary', dial: '+36', flag: '🇭🇺' },
  { code: 'RO', name: 'Romania', dial: '+40', flag: '🇷🇴' },
  { code: 'NZ', name: 'New Zealand', dial: '+64', flag: '🇳🇿' },
  { code: 'ZA', name: 'South Africa', dial: '+27', flag: '🇿🇦' },
  { code: 'IN', name: 'India', dial: '+91', flag: '🇮🇳' },
  { code: 'SG', name: 'Singapore', dial: '+65', flag: '🇸🇬' },
  { code: 'HK', name: 'Hong Kong', dial: '+852', flag: '🇭🇰' },
  { code: 'JP', name: 'Japan', dial: '+81', flag: '🇯🇵' },
  { code: 'CN', name: 'China', dial: '+86', flag: '🇨🇳' },
  { code: 'AE', name: 'UAE', dial: '+971', flag: '🇦🇪' },
  { code: 'SA', name: 'Saudi Arabia', dial: '+966', flag: '🇸🇦' },
  { code: 'BR', name: 'Brazil', dial: '+55', flag: '🇧🇷' },
  { code: 'MX', name: 'Mexico', dial: '+52', flag: '🇲🇽' },
  { code: 'AR', name: 'Argentina', dial: '+54', flag: '🇦🇷' },
];

function parsePhone(value: string): { dial: string; number: string } {
  if (!value) return { dial: '+44', number: '' };
  const matched = COUNTRIES.find(c => value.startsWith(c.dial));
  if (matched) {
    return { dial: matched.dial, number: value.slice(matched.dial.length).trim() };
  }
  return { dial: '+44', number: value };
}

export function validatePhone(value: string): boolean {
  if (!value) return true; // optional field
  const digits = value.replace(/\D/g, '');
  return digits.length >= 6 && digits.length <= 15;
}

interface PhoneInputProps {
  value: string;
  onChange: (fullNumber: string) => void;
  error?: string;
  disabled?: boolean;
}

export default function PhoneInput({ value, onChange, error, disabled }: PhoneInputProps) {
  const { dial, number } = parsePhone(value);
  const selected = COUNTRIES.find(c => c.dial === dial) ?? COUNTRIES[0];

  const [isOpen, setIsOpen] = useState(false);
  const containerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handleOutsideClick = (e: MouseEvent) => {
      if (containerRef.current && !containerRef.current.contains(e.target as Node)) {
        setIsOpen(false);
      }
    };
    if (isOpen) document.addEventListener('mousedown', handleOutsideClick);
    return () => document.removeEventListener('mousedown', handleOutsideClick);
  }, [isOpen]);

  const handleDialSelect = (newDial: string) => {
    onChange(number ? `${newDial} ${number}` : '');
    setIsOpen(false);
  };

  const handleNumberChange = (newNumber: string) => {
    onChange(newNumber ? `${dial} ${newNumber}` : '');
  };

  return (
    <div ref={containerRef} className="relative">
      <div className={`flex bg-brand-white border rounded-xl transition-colors focus-within:ring-2 focus-within:ring-brand-orange/30 ${error ? 'border-red-400' : 'border-brand-grey'} ${disabled ? 'opacity-50' : ''}`}>
        {/* Country selector trigger */}
        <button
          type="button"
          onClick={() => !disabled && setIsOpen(o => !o)}
          disabled={disabled}
          className="flex items-center gap-1.5 px-3 py-3 border-r border-brand-grey font-body text-sm text-brand-burgundy rounded-l-xl hover:bg-brand-orange/5 transition-colors flex-shrink-0 focus:outline-none"
        >
          <span className="text-base leading-none">{selected.flag}</span>
          <span className="font-medium">{selected.dial}</span>
          <svg className={`w-3.5 h-3.5 text-brand-burgundy/40 transition-transform ${isOpen ? 'rotate-180' : ''}`} fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
          </svg>
        </button>

        {/* Phone number input */}
        <input
          type="tel"
          value={number}
          onChange={e => handleNumberChange(e.target.value)}
          placeholder="7700 900077"
          disabled={disabled}
          className="flex-1 min-w-0 p-3 bg-transparent font-body text-brand-burgundy placeholder:text-brand-burgundy/40 focus:outline-none rounded-r-xl text-sm"
        />
      </div>

      {/* Dropdown */}
      {isOpen && (
        <div className="absolute z-50 top-full left-0 mt-1 w-64 bg-brand-white border border-brand-grey rounded-xl shadow-lg max-h-60 overflow-y-auto">
          {COUNTRIES.map(c => (
            <button
              key={c.code}
              type="button"
              onClick={() => handleDialSelect(c.dial)}
              className={`w-full flex items-center gap-3 px-4 py-2.5 text-sm font-body text-brand-burgundy hover:bg-brand-orange/5 transition-colors text-left ${c.dial === dial ? 'bg-brand-orange/10 font-bold' : ''}`}
            >
              <span className="text-base leading-none">{c.flag}</span>
              <span className="flex-1 truncate">{c.name}</span>
              <span className="text-brand-burgundy/50 flex-shrink-0">{c.dial}</span>
            </button>
          ))}
        </div>
      )}

      {error && <p className="mt-1 text-xs text-red-500">{error}</p>}
    </div>
  );
}
