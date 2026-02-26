'use client';

import React from 'react';

interface SelectProps extends React.SelectHTMLAttributes<HTMLSelectElement> {
  label?: string;
  error?: string;
  optional?: boolean;
  children: React.ReactNode;
}

export default function Select({ label, error, optional, children, className, id, ...props }: SelectProps) {
  const inputId = id ?? label?.toLowerCase().replace(/\s+/g, '-');

  const base = 'w-full p-3 bg-brand-white border border-brand-grey rounded-xl font-body text-brand-burgundy focus:outline-none focus:ring-2 focus:ring-brand-orange/30 transition-colors appearance-none disabled:opacity-50 disabled:cursor-not-allowed';

  return (
    <div>
      {label && (
        <label htmlFor={inputId} className="block font-body text-sm font-bold text-brand-burgundy mb-1">
          {label}
          {optional && <span className="text-brand-burgundy/40 font-normal ml-1">(optional)</span>}
        </label>
      )}
      <select
        id={inputId}
        className={`${base}${className ? ` ${className}` : ''}`}
        {...props}
      >
        {children}
      </select>
      {error && <p className="mt-1 text-xs text-red-500">{error}</p>}
    </div>
  );
}
