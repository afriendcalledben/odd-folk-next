'use client';

import React, { useState, useRef, useEffect } from 'react';
import Logo from './Logo';
import { useAuth } from '@/context/AuthContext';

interface HeaderProps {
  onNavigate: (view: string) => void;
  user?: { name: string; avatarUrl?: string } | null;
}

const Header: React.FC<HeaderProps> = ({ onNavigate, user }) => {
  const { isLoading, logout } = useAuth();
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setIsDropdownOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  // Close mobile menu on route change
  const handleNavigate = (view: string) => {
    onNavigate(view);
    setIsDropdownOpen(false);
    setIsMobileMenuOpen(false);
  };

  return (
    <header className="bg-brand-blue sticky top-0 z-50 border-b border-white/10">
      <div className="container mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-20 sm:h-24">

          {/* Logo */}
          <div className="flex-shrink-0 cursor-pointer py-2 group" onClick={() => handleNavigate('home')}>
            <Logo className="h-14 sm:h-16 w-auto transition-transform group-hover:scale-105" />
          </div>

          {/* Desktop Navigation */}
          <nav className="hidden lg:flex items-center space-x-10">
            <button onClick={() => handleNavigate('how-it-works')} className="font-body font-bold text-white text-base hover:text-brand-yellow transition-colors">How it works</button>
            <button onClick={() => handleNavigate('faq')} className="font-body font-bold text-white text-base hover:text-brand-yellow transition-colors">FAQs</button>
            <button onClick={() => handleNavigate('list-item')} className="font-body font-bold text-white text-base hover:text-brand-yellow transition-colors">List an item</button>
          </nav>

          {/* Desktop Auth / User */}
          <div className="hidden lg:flex items-center">
            {isLoading ? null : user ? (
              <div className="relative" ref={dropdownRef}>
                <div
                  className="flex items-center space-x-3 cursor-pointer group"
                  onClick={() => setIsDropdownOpen(!isDropdownOpen)}
                >
                  <p className="font-body text-base font-bold text-white leading-none group-hover:text-brand-yellow transition-colors">{user.name}</p>
                  <div className={`w-11 h-11 rounded-full p-0.5 border-2 transition-colors ${isDropdownOpen ? 'border-brand-yellow' : 'border-white/20 group-hover:border-brand-yellow'}`}>
                    <img src={user.avatarUrl || '/avatar-placeholder.svg'} alt={user.name} className="w-full h-full rounded-full object-cover" />
                  </div>
                </div>
                {isDropdownOpen && (
                  <div className="absolute right-0 mt-3 w-56 bg-white rounded-xl shadow-xl border border-brand-grey/20 overflow-hidden py-2">
                    <button onClick={() => handleNavigate('dashboard-listings')} className="w-full text-left px-4 py-2.5 text-sm text-brand-burgundy hover:bg-brand-grey/10 hover:text-brand-orange transition-colors">📦 Listings</button>
                    <button onClick={() => handleNavigate('dashboard-bookings')} className="w-full text-left px-4 py-2.5 text-sm text-brand-burgundy hover:bg-brand-grey/10 hover:text-brand-orange transition-colors">📅 Bookings</button>
                    <button onClick={() => handleNavigate('dashboard-profile')} className="w-full text-left px-4 py-2.5 text-sm text-brand-burgundy hover:bg-brand-grey/10 hover:text-brand-orange transition-colors">👤 Profile Settings</button>
                    <div className="border-t border-brand-grey/20 mt-2 pt-2">
                      <button onClick={logout} className="w-full text-left px-4 py-2.5 text-sm text-brand-burgundy hover:bg-brand-grey/10 hover:text-brand-orange transition-colors">🚪 Sign out</button>
                    </div>
                  </div>
                )}
              </div>
            ) : (
              <div className="flex items-center bg-brand-orange rounded-full p-1.5 border border-white/10 shadow-sm">
                <button onClick={() => handleNavigate('login')} className="font-body font-bold text-white hover:text-brand-yellow transition-colors px-5 text-base">Log in</button>
                <button onClick={() => handleNavigate('signup')} className="font-body font-bold text-brand-burgundy bg-brand-yellow hover:brightness-105 transition-all rounded-full px-6 py-2.5 text-base">Sign up</button>
              </div>
            )}
          </div>

          {/* Mobile: right side — avatar or hamburger */}
          <div className="flex lg:hidden items-center gap-3">
            {user && (
              <div className="w-9 h-9 rounded-full border-2 border-white/30 overflow-hidden">
                <img src={user.avatarUrl || '/avatar-placeholder.svg'} alt={user.name} className="w-full h-full object-cover" />
              </div>
            )}
            <button
              onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
              className="text-white p-2 rounded-lg hover:bg-white/10 transition-colors"
              aria-label="Toggle menu"
            >
              {isMobileMenuOpen ? (
                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              ) : (
                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
                </svg>
              )}
            </button>
          </div>
        </div>
      </div>

      {/* Mobile Menu */}
      {isMobileMenuOpen && (
        <div className="lg:hidden border-t border-white/10 bg-brand-blue">
          <div className="container mx-auto px-4 py-4 flex flex-col gap-1">
            <button onClick={() => handleNavigate('how-it-works')} className="text-left font-body font-bold text-white text-base py-3 px-2 hover:text-brand-yellow border-b border-white/10 transition-colors">How it works</button>
            <button onClick={() => handleNavigate('faq')} className="text-left font-body font-bold text-white text-base py-3 px-2 hover:text-brand-yellow border-b border-white/10 transition-colors">FAQs</button>
            <button onClick={() => handleNavigate('list-item')} className="text-left font-body font-bold text-white text-base py-3 px-2 hover:text-brand-yellow border-b border-white/10 transition-colors">List an item</button>
            {!isLoading && (user ? (
              <>
                <button onClick={() => handleNavigate('dashboard-listings')} className="text-left font-body text-white/80 text-base py-3 px-2 hover:text-brand-yellow border-b border-white/10 transition-colors">📦 Listings</button>
                <button onClick={() => handleNavigate('dashboard-bookings')} className="text-left font-body text-white/80 text-base py-3 px-2 hover:text-brand-yellow border-b border-white/10 transition-colors">📅 Bookings</button>
                <button onClick={() => handleNavigate('dashboard-profile')} className="text-left font-body text-white/80 text-base py-3 px-2 hover:text-brand-yellow border-b border-white/10 transition-colors">👤 Profile Settings</button>
                <button onClick={logout} className="text-left font-body text-white/80 text-base py-3 px-2 hover:text-brand-yellow transition-colors">🚪 Sign out</button>
              </>
            ) : (
              <div className="flex gap-3 pt-3">
                <button onClick={() => handleNavigate('login')} className="flex-1 font-body font-bold text-white border border-white/30 rounded-full py-2.5 text-base hover:bg-white/10 transition-colors">Log in</button>
                <button onClick={() => handleNavigate('signup')} className="flex-1 font-body font-bold text-brand-burgundy bg-brand-yellow rounded-full py-2.5 text-base hover:brightness-105 transition-all">Sign up</button>
              </div>
            ))}
          </div>
        </div>
      )}
    </header>
  );
};

export default Header;