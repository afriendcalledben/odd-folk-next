'use client';

import React, { useState, useRef, useEffect } from 'react';
import Logo from './Logo';

interface HeaderProps {
  onNavigate: (view: string) => void;
  user?: { name: string; avatarUrl?: string } | null;
}

const Header: React.FC<HeaderProps> = ({ onNavigate, user }) => {
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setIsDropdownOpen(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, []);

  const handleNavigate = (view: string) => {
      onNavigate(view);
      setIsDropdownOpen(false);
  };

  return (
    <header className="bg-brand-blue sticky top-0 z-50 border-b border-white/10">
      <div className="container mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-24 sm:h-28">
          {/* Logo - Increased size by ~20% */}
          <div className="flex-shrink-0 cursor-pointer py-2 group" onClick={() => handleNavigate('home')}>
            <Logo className="h-16 sm:h-20 w-auto transition-transform group-hover:scale-105" />
          </div>

          {/* Navigation - Increased text size by ~20% (text-sm to text-base) */}
          <nav className="hidden lg:flex md:items-center md:space-x-12">
            <button onClick={() => handleNavigate('how-it-works')} className="font-body font-bold text-white text-base hover:text-brand-yellow transition-colors">How it works</button>
            <button onClick={() => handleNavigate('faq')} className="font-body font-bold text-white text-base hover:text-brand-yellow transition-colors">FAQs</button>
            <button onClick={() => handleNavigate('list-item')} className="font-body font-bold text-white text-base hover:text-brand-yellow transition-colors">List an item</button>
          </nav>

          {/* Action Buttons - Increased text size by ~20% */}
          <div className="flex items-center">
             {user ? (
                <div className="relative" ref={dropdownRef}>
                    <div 
                      className="flex items-center space-x-4 cursor-pointer group"
                      onClick={() => setIsDropdownOpen(!isDropdownOpen)}
                    >
                         <div className="text-right hidden lg:block">
                            <p className="font-body text-base font-bold text-white leading-none group-hover:text-brand-yellow transition-colors">{user.name}</p>
                         </div>
                         <div className={`w-12 h-12 rounded-full p-0.5 border-2 transition-colors ${isDropdownOpen ? 'border-brand-yellow' : 'border-white/20 group-hover:border-brand-yellow'}`}>
                            <img
                              src={user.avatarUrl || 'https://i.pravatar.cc/150'}
                              alt={user.name}
                              className="w-full h-full rounded-full object-cover"
                            />
                         </div>
                    </div>

                    {isDropdownOpen && (
                        <div className="absolute right-0 mt-3 w-56 bg-white rounded-xl shadow-xl border border-brand-grey/20 overflow-hidden py-2">
                            <button onClick={() => handleNavigate('dashboard-listings')} className="w-full text-left px-4 py-2 text-base text-brand-burgundy hover:bg-brand-grey/5 hover:text-brand-orange transition-colors">📦 Listings</button>
                            <button onClick={() => handleNavigate('dashboard-bookings')} className="w-full text-left px-4 py-2 text-base text-brand-burgundy hover:bg-brand-grey/5 hover:text-brand-orange transition-colors">📅 Bookings</button>
                            <button onClick={() => handleNavigate('dashboard-profile')} className="w-full text-left px-4 py-2 text-base text-brand-burgundy hover:bg-brand-grey/5 hover:text-brand-orange transition-colors">👤 Profile Settings</button>
                        </div>
                    )}
                </div>
             ) : (
                <div className="flex items-center bg-brand-orange rounded-full p-1.5 border border-white/10 shadow-sm">
                    <button 
                        onClick={() => handleNavigate('login')}
                        className="font-body font-bold text-white hover:text-brand-yellow transition-colors px-5 text-base"
                    >
                        Log in
                    </button>
                    <button 
                        onClick={() => handleNavigate('signup')}
                        className="font-body font-bold text-brand-burgundy bg-brand-yellow hover:brightness-105 transition-all rounded-full px-6 py-2.5 text-base"
                    >
                        Sign up
                    </button>
                </div>
             )}
          </div>
        </div>
      </div>
    </header>
  );
};

export default Header;