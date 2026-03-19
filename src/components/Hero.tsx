'use client';

import React from 'react';

const Hero: React.FC = () => {
  return (
    <div className="w-full flex justify-center" style={{ backgroundColor: '#C9FF00' }}>
      <img
        src="/hero.jpg"
        alt="The place for props with personality!"
        className="w-full max-w-5xl h-auto block"
      />
    </div>
  );
};

export default Hero;
