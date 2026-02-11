'use client';

import React from 'react';

const Hero: React.FC = () => {
  return (
    <div className="relative bg-brand-yellow/10 overflow-hidden pb-16">
        <div className="absolute inset-0 bg-grain-texture opacity-10"></div>
        <div className="relative container mx-auto px-4 sm:px-6 lg:px-8 py-20 sm:py-28 text-center">
            <h1 className="font-heading text-4xl sm:text-5xl md:text-7xl text-brand-burgundy tracking-tight leading-[1.1]">
                The marketplace for props with personality
            </h1>
            <p className="mt-6 max-w-2xl mx-auto font-body text-lg sm:text-xl text-brand-burgundy/90 leading-relaxed">
                The peer-to-peer marketplace connecting London creatives with unique styling, props, and event furniture in your local area.
            </p>
        </div>
    </div>
  );
};

export default Hero;
