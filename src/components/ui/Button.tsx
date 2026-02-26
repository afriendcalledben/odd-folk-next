'use client';

import React from 'react';

type Variant = 'primary' | 'secondary' | 'outline' | 'danger' | 'ghost';
type Size = 'sm' | 'md' | 'lg';

interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: Variant;
  size?: Size;
  fullWidth?: boolean;
  isLoading?: boolean;
}

const variantClasses: Record<Variant, string> = {
  primary: 'bg-brand-orange text-white font-heading rounded-xl hover:brightness-110 transition-all disabled:opacity-50 disabled:cursor-not-allowed',
  secondary: 'bg-brand-blue text-white font-heading rounded-xl hover:brightness-110 transition-all disabled:opacity-50 disabled:cursor-not-allowed',
  outline: 'border-2 border-brand-orange text-brand-orange font-heading rounded-xl hover:bg-brand-orange hover:text-white transition-all disabled:opacity-50 disabled:cursor-not-allowed',
  danger: 'bg-brand-burgundy text-white font-heading rounded-xl hover:brightness-110 transition-all disabled:opacity-50 disabled:cursor-not-allowed',
  ghost: 'text-brand-orange font-body hover:underline transition-colors disabled:opacity-50 disabled:cursor-not-allowed',
};

const sizeClasses: Record<Size, string> = {
  sm: 'px-4 py-2 text-sm',
  md: 'px-6 py-3 text-base',
  lg: 'px-8 py-4 text-lg',
};

export default function Button({
  variant = 'primary',
  size = 'md',
  fullWidth = false,
  isLoading = false,
  children,
  className,
  disabled,
  ...props
}: ButtonProps) {
  return (
    <button
      disabled={disabled || isLoading}
      className={[
        variantClasses[variant],
        sizeClasses[size],
        fullWidth ? 'w-full' : '',
        className ?? '',
      ].filter(Boolean).join(' ')}
      {...props}
    >
      {isLoading ? (
        <span className="flex items-center justify-center gap-2">
          <span className="inline-block w-4 h-4 border-2 border-current border-t-transparent rounded-full animate-spin" />
          {children}
        </span>
      ) : children}
    </button>
  );
}
