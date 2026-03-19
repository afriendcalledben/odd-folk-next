'use client';

import React from 'react';

const Hero: React.FC = () => {
  return (
    <div className="w-full flex justify-center leading-[0]" style={{ backgroundColor: '#C3F000' }}>
      <img
        src="/hero.jpg"
        alt="The place for props with personality!"
        className="w-full max-w-5xl h-auto block"
      />
    </div>
  );
};

export default Hero;
