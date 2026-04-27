'use client';

import { useState } from 'react';
import toast from 'react-hot-toast';

export default function ComingSoonPage() {
  const [email, setEmail] = useState('');
  const [subscribed, setSubscribed] = useState(false);
  const [loading, setLoading] = useState(false);

  const handleSubscribe = async (e: { preventDefault: () => void }) => {
    e.preventDefault();
    if (!email) return;
    setLoading(true);
    try {
      const res = await fetch('/api/newsletter/subscribe', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email }),
      });
      if (!res.ok) {
        const json = await res.json().catch(() => ({}));
        toast.error(json.error || 'Something went wrong. Please try again.');
        return;
      }
      setSubscribed(true);
      setEmail('');
    } catch {
      toast.error('Something went wrong. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex overflow-hidden" style={{ backgroundImage: 'url(/coming-soon-bg.jpg)', backgroundSize: 'cover', backgroundPosition: 'center' }}>
      {/* Left: content */}
      <div className="flex flex-col justify-center px-10 sm:px-16 lg:px-24 py-16 w-full lg:w-[52%] flex-shrink-0 z-10">
        {/* Logo */}
        <div className="mb-8 select-none" style={{ width: 'clamp(220px, 38vw, 420px)' }}>
          <svg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 504 280' fill='#F54F19' className="w-full h-auto">
            <path d='M74.67,70.74C74.67,30.33,104.32,2,149.08,2s74.41,28.33,74.41,68.74-29.65,68.74-74.41,68.74-74.41-28.33-74.41-68.74ZM149.08,91.52c12.09,0,20.59-8.5,20.59-20.77s-8.5-20.77-20.59-20.77-20.59,8.5-20.59,20.77,8.5,20.77,20.59,20.77Z'/>
            <path d='M224.88,4.64h63.64c44.95,0,73.65,25.68,73.65,66.1s-28.71,66.1-73.65,66.1h-63.64V4.64ZM286.63,90.39c13.6,0,21.91-6.99,21.91-19.64s-8.31-19.64-21.91-19.64h-8.88v39.28h8.88Z'/>
            <path d='M363.57,4.64h63.64c44.95,0,73.65,25.68,73.65,66.1s-28.71,66.1-73.65,66.1h-63.64V4.64ZM425.33,90.39c13.6,0,21.91-6.99,21.91-19.64s-8.31-19.64-21.91-19.64h-8.88v39.28h8.88Z'/>
            <path d='M2,142.69h95.56v44.38h-42.11v14.92h37.58v41.93h-37.58v30.97H2v-132.2Z'/>
            <path d='M99.41,208.79c0-40.42,29.65-68.74,74.41-68.74s74.41,28.33,74.41,68.74-29.65,68.74-74.41,68.74-74.41-28.33-74.41-68.74ZM173.82,229.56c12.09,0,20.59-8.5,20.59-20.77s-8.5-20.77-20.59-20.77-20.59,8.5-20.59,20.77,8.5,20.77,20.59,20.77Z'/>
            <path d='M255.47,142.69h54.01v83.66h46.27v48.54h-100.28v-132.2Z'/>
            <path d='M361.49,142.69h54.01v41.36h2.27c7.93,0,10.95-2.08,13.22-10.01l9.25-31.35h57.04l-17.38,52.5c-2.08,6.04-4.53,11.14-7.36,15.49l29.46,64.21h-60.43l-17.75-44h-8.31v44h-54.01v-132.2Z'/>
          </svg>
        </div>

        <h1 className="font-heading text-white mb-3" style={{ fontSize: 'clamp(1.75rem, 3.5vw, 3rem)' }}>
          Coming Soon!
        </h1>

        <p className="font-body text-white/80 text-sm sm:text-base leading-relaxed mb-8 max-w-sm">
          We are building something amazing. Subscribe to our mailing list to get notified when we launch.
        </p>

        {subscribed ? (
          <div className="bg-white/10 border border-white/20 rounded-xl px-5 py-3 max-w-sm">
            <p className="font-body text-white text-sm font-semibold">You're on the list — we'll be in touch!</p>
          </div>
        ) : (
          <form onSubmit={handleSubscribe} className="flex gap-2 max-w-sm">
            <input
              type="email"
              required
              placeholder="Enter your email address"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="flex-1 min-w-0 px-4 py-3 rounded-lg bg-white font-body text-brand-burgundy text-sm placeholder:text-brand-burgundy/40 focus:outline-none focus:ring-2 focus:ring-brand-orange/50"
            />
            <button
              type="submit"
              disabled={loading}
              className="bg-brand-orange text-white font-heading text-sm px-5 py-3 rounded-lg hover:brightness-110 transition-all disabled:opacity-60 active:scale-95 whitespace-nowrap"
            >
              {loading ? '...' : 'Notify Me'}
            </button>
          </form>
        )}
      </div>

      {/* Right: hero image */}
      <div className="hidden lg:block flex-1 relative">
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img
          src="/coming-soon-hero.png"
          alt=""
          className="absolute bottom-0 right-0 h-[95%] w-auto object-contain object-bottom-right"
          style={{ maxWidth: 'none' }}
        />
      </div>
    </div>
  );
}
