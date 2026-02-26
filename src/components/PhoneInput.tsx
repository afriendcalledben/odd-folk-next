'use client';

import React from 'react';

const COUNTRIES = [
  { code: 'GB', name: 'United Kingdom', dial: '+44' },
  { code: 'US', name: 'United States', dial: '+1' },
  { code: 'AU', name: 'Australia', dial: '+61' },
  { code: 'CA', name: 'Canada', dial: '+1' },
  { code: 'IE', name: 'Ireland', dial: '+353' },
  { code: 'FR', name: 'France', dial: '+33' },
  { code: 'DE', name: 'Germany', dial: '+49' },
  { code: 'ES', name: 'Spain', dial: '+34' },
  { code: 'IT', name: 'Italy', dial: '+39' },
  { code: 'NL', name: 'Netherlands', dial: '+31' },
  { code: 'BE', name: 'Belgium', dial: '+32' },
  { code: 'CH', name: 'Switzerland', dial: '+41' },
  { code: 'AT', name: 'Austria', dial: '+43' },
  { code: 'SE', name: 'Sweden', dial: '+46' },
  { code: 'NO', name: 'Norway', dial: '+47' },
  { code: 'DK', name: 'Denmark', dial: '+45' },
  { code: 'FI', name: 'Finland', dial: '+358' },
  { code: 'PL', name: 'Poland', dial: '+48' },
  { code: 'PT', name: 'Portugal', dial: '+351' },
  { code: 'GR', name: 'Greece', dial: '+30' },
  { code: 'CZ', name: 'Czech Republic', dial: '+420' },
  { code: 'HU', name: 'Hungary', dial: '+36' },
  { code: 'RO', name: 'Romania', dial: '+40' },
  { code: 'NZ', name: 'New Zealand', dial: '+64' },
  { code: 'ZA', name: 'South Africa', dial: '+27' },
  { code: 'IN', name: 'India', dial: '+91' },
  { code: 'SG', name: 'Singapore', dial: '+65' },
  { code: 'HK', name: 'Hong Kong', dial: '+852' },
  { code: 'JP', name: 'Japan', dial: '+81' },
  { code: 'CN', name: 'China', dial: '+86' },
  { code: 'AE', name: 'UAE', dial: '+971' },
  { code: 'SA', name: 'Saudi Arabia', dial: '+966' },
  { code: 'BR', name: 'Brazil', dial: '+55' },
  { code: 'MX', name: 'Mexico', dial: '+52' },
  { code: 'AR', name: 'Argentina', dial: '+54' },
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
  // Fully controlled — derive display values from prop on every render, no local state
  const { dial, number } = parsePhone(value);

  const handleDialChange = (newDial: string) => {
    onChange(number ? `${newDial} ${number}` : '');
  };

  const handleNumberChange = (newNumber: string) => {
    onChange(newNumber ? `${dial} ${newNumber}` : '');
  };

  const baseInput = 'bg-brand-white border border-brand-grey font-body text-brand-burgundy focus:outline-none focus:ring-2 focus:ring-brand-orange/30 transition-colors disabled:opacity-50';

  return (
    <div>
      <div className="flex gap-2">
        <select
          value={dial}
          onChange={e => handleDialChange(e.target.value)}
          disabled={disabled}
          className={`${baseInput} rounded-lg px-2 py-3 text-sm flex-shrink-0 w-36`}
        >
          {COUNTRIES.map(c => (
            <option key={c.code} value={c.dial}>
              {c.name} ({c.dial})
            </option>
          ))}
        </select>
        <input
          type="tel"
          value={number}
          onChange={e => handleNumberChange(e.target.value)}
          placeholder="7700 900077"
          disabled={disabled}
          className={`${baseInput} rounded-lg p-3 flex-1 min-w-0`}
        />
      </div>
      {error && <p className="mt-1 text-xs text-red-500">{error}</p>}
    </div>
  );
}
