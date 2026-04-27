'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';

export default function PreviewPage() {
  const router = useRouter();
  const [code, setCode] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: { preventDefault: () => void }) => {
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
    <div className="min-h-screen flex items-center justify-center px-4" style={{ backgroundImage: 'url(/coming-soon-bg.jpg)', backgroundSize: 'cover', backgroundPosition: 'center' }}>
      <div className="w-full max-w-sm">
        <div className="mb-8 select-none" style={{ width: 'clamp(160px, 30vw, 280px)' }}>
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
