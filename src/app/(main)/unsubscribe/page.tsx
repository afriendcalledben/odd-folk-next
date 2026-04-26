'use client';

import { useEffect, useState } from 'react';
import { useSearchParams } from 'next/navigation';
import { useAppNavigate } from '@/lib/navigation';
import { Button } from '@/components/ui';

export default function UnsubscribePage() {
  const searchParams = useSearchParams();
  const navigate = useAppNavigate();
  const token = searchParams.get('token');
  const [status, setStatus] = useState<'loading' | 'success' | 'error'>('loading');
  const [errorMessage, setErrorMessage] = useState('');

  useEffect(() => {
    if (!token) {
      setErrorMessage('No unsubscribe token provided.');
      setStatus('error');
      return;
    }

    fetch('/api/newsletter/unsubscribe', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ token }),
    })
      .then(async (res) => {
        const json = await res.json();
        if (res.ok) {
          setStatus('success');
        } else {
          setErrorMessage(json.error || 'Something went wrong.');
          setStatus('error');
        }
      })
      .catch(() => {
        setErrorMessage('Network error. Please try again.');
        setStatus('error');
      });
  }, [token]);

  if (status === 'loading') {
    return (
      <div className="bg-brand-white min-h-screen flex items-center justify-center">
        <p className="font-body text-brand-burgundy/60 text-lg">Unsubscribing…</p>
      </div>
    );
  }

  if (status === 'success') {
    return (
      <div className="bg-brand-white min-h-screen py-20">
        <div className="container mx-auto px-4 max-w-xl text-center">
          <div className="w-20 h-20 bg-brand-orange/10 text-brand-orange rounded-full flex items-center justify-center mx-auto mb-6">
            <svg className="w-10 h-10" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
            </svg>
          </div>
          <h1 className="font-heading text-4xl text-brand-burgundy mb-4">You're unsubscribed</h1>
          <p className="font-body text-brand-burgundy/70 text-lg mb-8">
            You've been removed from the Odd Folk mailing list. You won't receive any more newsletter emails.
          </p>
          <Button onClick={() => navigate('home')}>Back to Home</Button>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-brand-white min-h-screen py-20">
      <div className="container mx-auto px-4 max-w-xl text-center">
        <div className="w-20 h-20 bg-red-100 text-red-500 rounded-full flex items-center justify-center mx-auto mb-6">
          <svg className="w-10 h-10" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
          </svg>
        </div>
        <h1 className="font-heading text-4xl text-brand-burgundy mb-4">Something went wrong</h1>
        <p className="font-body text-brand-burgundy/70 text-lg mb-8">{errorMessage}</p>
        <Button onClick={() => navigate('home')}>Back to Home</Button>
      </div>
    </div>
  );
}
