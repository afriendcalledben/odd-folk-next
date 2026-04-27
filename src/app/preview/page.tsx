'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';

export default function PreviewPage() {
  const router = useRouter();
  const [code, setCode] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setLoading(true);
    try {
      const res = await fetch('/api/preview', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ code }),
      });
      if (res.ok) {
        router.push('/');
      } else {
        setError('Invalid access code. Please try again.');
        setCode('');
      }
    } catch {
      setError('Something went wrong. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-brand-blue flex items-center justify-center px-4">
      <div className="w-full max-w-sm">
        <div
          className="font-heading text-brand-orange leading-[0.88] mb-8 select-none"
          style={{ fontSize: 'clamp(3rem, 8vw, 5rem)' }}
        >
          <div>ODD</div>
          <div>FOLK</div>
        </div>

        <p className="font-body text-white/70 text-sm mb-6">Enter your access code to preview the site.</p>

        <form onSubmit={handleSubmit} className="space-y-3">
          {error && (
            <p className="text-red-300 text-sm font-body">{error}</p>
          )}
          <input
            type="password"
            required
            placeholder="Access code"
            value={code}
            onChange={(e) => setCode(e.target.value)}
            className="w-full px-4 py-3 rounded-xl bg-white font-body text-brand-burgundy text-sm placeholder:text-brand-burgundy/40 focus:outline-none focus:ring-2 focus:ring-brand-orange/50"
            autoFocus
          />
          <button
            type="submit"
            disabled={loading}
            className="w-full bg-brand-orange text-white font-heading py-3 rounded-xl hover:brightness-110 transition-all disabled:opacity-60"
          >
            {loading ? 'Checking...' : 'Enter'}
          </button>
        </form>
      </div>
    </div>
  );
}
