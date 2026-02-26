'use client';

import React from 'react';

interface TextareaProps extends React.TextareaHTMLAttributes<HTMLTextAreaElement> {
  label?: string;
  error?: string;
  optional?: boolean;
  hint?: React.ReactNode;
}

export default function Textarea({ label, error, optional, hint, className, id, ...props }: TextareaProps) {
  const inputId = id ?? label?.toLowerCase().replace(/\s+/g, '-');

  const base = 'w-full p-3 bg-brand-white border border-brand-grey rounded-xl font-body text-brand-burgundy placeholder:text-brand-burgundy/40 focus:outline-none focus:ring-2 focus:ring-brand-orange/30 transition-colors resize-none disabled:opacity-50 disabled:cursor-not-allowed';

  return (
    <div>
      {label && (
        <label htmlFor={inputId} className="block font-body text-sm font-bold text-brand-burgundy mb-1">
          {label}
          {optional && <span className="text-brand-burgundy/40 font-normal ml-1">(optional)</span>}
        </label>
      )}
      <textarea
        id={inputId}
        className={`${base}${className ? ` ${className}` : ''}`}
        {...props}
      />
      {hint && !error && <div className="mt-1">{hint}</div>}
      {error && <p className="mt-1 text-xs text-red-500">{error}</p>}
    </div>
  );
}
