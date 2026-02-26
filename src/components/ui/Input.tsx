'use client';

import React from 'react';

interface InputProps extends React.InputHTMLAttributes<HTMLInputElement> {
  label?: string;
  error?: string;
  prefix?: string;
  optional?: boolean;
}

export default function Input({ label, error, prefix, optional, className, id, ...props }: InputProps) {
  const inputId = id ?? label?.toLowerCase().replace(/\s+/g, '-');

  const base = 'w-full p-3 bg-brand-white border border-brand-grey rounded-xl font-body text-brand-burgundy placeholder:text-brand-burgundy/40 focus:outline-none focus:ring-2 focus:ring-brand-orange/30 transition-colors disabled:opacity-50 disabled:cursor-not-allowed';

  return (
    <div>
      {label && (
        <label htmlFor={inputId} className="block font-body text-sm font-bold text-brand-burgundy mb-1">
          {label}
          {optional && <span className="text-brand-burgundy/40 font-normal ml-1">(optional)</span>}
        </label>
      )}
      <div className={prefix ? 'relative' : undefined}>
        {prefix && (
          <span className="absolute left-3 top-1/2 -translate-y-1/2 text-brand-burgundy/40 font-body text-sm select-none">
            {prefix}
          </span>
        )}
        <input
          id={inputId}
          className={`${base}${prefix ? ' pl-7' : ''}${className ? ` ${className}` : ''}`}
          {...props}
        />
      </div>
      {error && <p className="mt-1 text-xs text-red-500">{error}</p>}
    </div>
  );
}
