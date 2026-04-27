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
        <div
          className="font-heading text-brand-orange leading-[0.88] mb-8 select-none"
          style={{ fontSize: 'clamp(5rem, 12vw, 10rem)' }}
        >
          <div>ODD</div>
          <div>FOLK</div>
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
          src="/coming-soon-hero.jpg"
          alt=""
          className="absolute bottom-0 right-0 h-[95%] w-auto object-contain object-bottom-right"
          style={{ maxWidth: 'none' }}
        />
      </div>
    </div>
  );
}
