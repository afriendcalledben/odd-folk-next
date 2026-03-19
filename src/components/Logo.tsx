'use client';

import React from 'react';

const Logo: React.FC<{ className?: string }> = ({ className }) => {
  return (
    <img
      src="/oddfolk_logo.svg"
      alt="Odd Folk"
      className={className ?? 'h-12 w-auto'}
    />
  );
};

export default Logo;
