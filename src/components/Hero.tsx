'use client';

import React from 'react';

const Hero: React.FC = () => {
  return (
    <div className="w-full overflow-hidden" style={{ backgroundColor: '#d3fe8a', fontSize: 0 }}>
      <img
        src="/hero.jpg"
        alt="The place for props with personality!"
        className="block mx-auto w-full max-w-5xl"
        style={{ verticalAlign: 'bottom', display: 'block' }}
      />
    </div>
  );
};

export default Hero;
