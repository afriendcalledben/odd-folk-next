'use client';

import React from 'react';

const Logo: React.FC<{ className?: string }> = ({ className }) => {
  return (
    <svg
      viewBox="0 0 340 230"
      className={className}
      xmlns="http://www.w3.org/2000/svg"
      aria-label="Odd Folk Logo"
    >
      <g style={{ fontFamily: '"Archivo Black", sans-serif' }} fontWeight="900">
        <text
          x="50%"
          y="100"
          textAnchor="middle"
          fontSize="115"
          fill="#F54F19"
          letterSpacing="-6"
        >
          ODD
        </text>
        <text
          x="50%"
          y="200"
          textAnchor="middle"
          fontSize="115"
          fill="#F54F19"
          letterSpacing="-6"
        >
          FOLK
        </text>
      </g>
    </svg>
  );
};

export default Logo;