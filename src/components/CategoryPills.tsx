'use client';

import React from 'react';

interface CategoryPillsProps {
  categories: string[];
  selectedCategory: string;
  onSelectCategory: (category: string) => void;
}

const CategoryPills: React.FC<CategoryPillsProps> = ({ categories, selectedCategory, onSelectCategory }) => {
  return (
    <div className="flex justify-center flex-wrap gap-3 p-4">
      {['All', ...categories].map((category) => (
        <button
          key={category}
          onClick={() => onSelectCategory(category)}
          className={`font-body font-medium whitespace-nowrap px-6 py-2 rounded-full text-sm sm:text-base transition-all duration-300 ${
            selectedCategory === category
              ? 'bg-brand-orange text-brand-white shadow-md'
              : 'bg-brand-white text-brand-burgundy border border-brand-burgundy/10 hover:border-brand-blue hover:text-brand-blue'
          }`}
        >
          {category}
        </button>
      ))}
    </div>
  );
};

export default CategoryPills;