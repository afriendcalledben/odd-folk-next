'use client';

import React, { useState } from 'react';
import Logo from './Logo';

interface FooterProps {
  onNavigate: (view: string) => void;
}

const Footer: React.FC<FooterProps> = ({ onNavigate }) => {
  const [email, setEmail] = useState('');
  const [subscribed, setSubscribed] = useState(false);

  const categories = [
    "Event furniture",
    "Lighting",
    "Backdrops & installations",
    "Tableware & serving",
    "Textiles & soft furnishings",
    "Decorative props",
    "Plants & greenery",
    "Seasonal/themed items",
    "Photography & film",
    "Weddings",
    "Signage & displays"
  ];

  const handleSubscribe = (e: React.FormEvent) => {
    e.preventDefault();
    if (email) {
      setSubscribed(true);
      setEmail('');
      setTimeout(() => setSubscribed(false), 5000);
    }
  };

  return (
    <footer className="bg-brand-blue text-brand-white">
      <div className="container mx-auto px-4 sm:px-6 lg:px-8 py-16">
        <div className="grid grid-cols-1 md:grid-cols-4 lg:grid-cols-5 gap-12">
          <div className="col-span-1 md:col-span-2 lg:col-span-2">
             <div className="text-brand-white w-32">
                <Logo />
             </div>
            <p className="font-body text-brand-white/80 mt-6 max-w-sm leading-relaxed">
              London's peer-to-peer marketplace for unique styling items and props. We connect creatives who need distinctive pieces with collectors who have them to rent.
            </p>
          </div>
          <div>
            <h4 className="font-heading text-xl text-brand-yellow mb-6">Explore</h4>
            <ul className="space-y-2 font-body text-brand-white/80 text-sm">
              {categories.map((cat) => (
                  <li key={cat}>
                      <button onClick={() => onNavigate('home')} className="hover:text-brand-orange transition-colors text-left">{cat}</button>
                  </li>
              ))}
            </ul>
          </div>
          <div>
            <h4 className="font-heading text-xl text-brand-yellow mb-6">About</h4>
            <ul className="space-y-3 font-body text-brand-white/80 mb-8">
              <li><button onClick={() => onNavigate('how-it-works')} className="hover:text-brand-orange transition-colors">How it works</button></li>
              <li><button onClick={() => onNavigate('faq')} className="hover:text-brand-orange transition-colors">FAQ</button></li>
              <li><button onClick={() => onNavigate('sustainability')} className="hover:text-brand-orange transition-colors">Sustainability</button></li>
            </ul>

            {/* Newsletter Section */}
            <div className="mt-10">
              <h4 className="font-heading text-lg text-brand-yellow mb-4">Join the folk</h4>
              {subscribed ? (
                <div className="bg-brand-yellow/20 border border-brand-yellow/30 p-3 rounded-xl animate-fade-in">
                  <p className="font-body text-sm text-brand-yellow font-bold">Welcome to the club!</p>
                </div>
              ) : (
                <form onSubmit={handleSubscribe} className="flex flex-col space-y-2">
                  <input
                    type="email"
                    required
                    placeholder="Enter your email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    className="bg-white/10 border border-brand-white/20 rounded-xl px-4 py-2.5 text-sm font-body text-brand-white focus:outline-none focus:border-brand-yellow placeholder-brand-white/30 transition-all"
                  />
                  <button
                    type="submit"
                    className="bg-brand-orange text-brand-white font-heading text-sm py-2.5 rounded-xl hover:brightness-110 transition-all shadow-md active:scale-95"
                  >
                    Subscribe
                  </button>
                </form>
              )}
            </div>
          </div>
          <div>
            <h4 className="font-heading text-xl text-brand-yellow mb-6">Legal</h4>
            <ul className="space-y-3 font-body text-brand-white/80">
               <li><button onClick={() => onNavigate('terms')} className="hover:text-brand-orange transition-colors">Terms of service</button></li>
              <li><button onClick={() => onNavigate('privacy')} className="hover:text-brand-orange transition-colors">Privacy policy</button></li>
            </ul>
            
            <div className="mt-8">
                <h4 className="font-heading text-xl text-brand-yellow mb-4">Contact</h4>
                <button onClick={() => onNavigate('contact')} className="font-body text-brand-white/80 hover:text-brand-orange transition-colors block mb-2">
                    Contact Us
                </button>
                <a href="mailto:hello@oddfolk.co.uk" className="font-body text-brand-white/80 hover:text-brand-orange transition-colors block">
                    hello@oddfolk.co.uk
                </a>
            </div>
          </div>
        </div>
        <div className="mt-16 border-t border-brand-white/10 pt-8 flex flex-col sm:flex-row justify-between items-center">
          <p className="font-body text-sm text-brand-white/60">&copy; {new Date().getFullYear()} Odd Folk. All rights reserved.</p>
          <div className="flex space-x-6 mt-4 sm:mt-0">
            <a href="#" className="text-brand-white/60 hover:text-brand-yellow transition-colors font-body text-sm">Instagram</a>
            <a href="#" className="text-brand-white/60 hover:text-brand-yellow transition-colors font-body text-sm">Facebook</a>
          </div>
        </div>
      </div>
    </footer>
  );
};

export default Footer;