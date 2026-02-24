'use client';

import React from 'react';

const Hero: React.FC = () => {
  return (
    <div className="relative bg-brand-yellow w-full">
      <div className="w-full relative overflow-hidden">
        <div className="absolute inset-0 bg-grain-texture opacity-5 pointer-events-none z-10"></div>
        <img
          src="/hero.jpg"
          alt="The place for props with personality!"
          className="w-full h-auto block relative z-0"
        />
      </div>
    </div>
  );
};

export default Hero;
