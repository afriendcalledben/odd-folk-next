'use client';

import React from 'react';

const Hero: React.FC = () => {
  return (
    <div className="relative bg-[#D5F34C] w-full">
      {/*
        The hero section is dominated by the brand graphic.
        Background color matches the image's canvas.
      */}
      <div className="w-full relative overflow-hidden">
        {/* Subtle Grain Overlay for texture */}
        <div className="absolute inset-0 bg-grain-texture opacity-5 pointer-events-none z-10"></div>

        <div className="w-full">
          <img
            src="https://images.lucidchart.com/api/v1/resources/7f4e9a5c-5046-4e5a-9f5a-3506e6e8e8e8/content"
            alt="The place for props with personality!"
            className="w-full h-auto block relative z-0"
            onError={(e) => {
              (e.target as HTMLImageElement).src = "https://placehold.co/2000x900/D5F34C/495ED3?text=The+place+for+props+with+personality!";
            }}
          />
        </div>
      </div>
    </div>
  );
};

export default Hero;
