'use client';

import { useState } from 'react';
import Link from 'next/link';
import Logo from '@/components/Logo';
import { forgetPassword } from '@/lib/auth-client';

export default function ForgotPasswordPage() {
  const [email, setEmail] = useState('');
  const [pending, setPending] = useState(false);
  const [sent, setSent] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setPending(true);
    try {
      const result = await forgetPassword({
        email,
        redirectTo: '/reset-password',
      });
      if (result.error) {
        setError('Something went wrong. Please try again.');
      } else {
        setSent(true);
      }
    } catch {
      setError('Something went wrong. Please try again.');
    } finally {
      setPending(false);
    }
  };

  return (
    <div className="min-h-screen bg-brand-white flex items-center justify-center p-4 relative">
      <div className="absolute inset-0 bg-brand-yellow/10 z-0" />

      <div className="bg-brand-blue w-full max-w-[480px] rounded-3xl shadow-2xl relative z-10 p-8 sm:p-12 border border-brand-white/10 animate-fade-in text-brand-white">
        <Link
          href="/login"
          className="absolute top-6 right-6 text-brand-white/40 hover:text-brand-yellow transition-colors"
          aria-label="Back to login"
        >
          <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
          </svg>
        </Link>

        <div className="text-center mb-10">
          <div className="w-24 mx-auto mb-6 filter brightness-0 invert">
            <Logo />
          </div>
          <h1 className="font-heading text-3xl text-brand-white mb-2">Forgot password?</h1>
          <p className="font-body text-brand-white/70">
            Enter your email and we&apos;ll send you a reset link
          </p>
        </div>

        {sent ? (
          <div className="text-center space-y-6">
            <div className="bg-brand-yellow/20 border border-brand-yellow/50 text-brand-yellow px-6 py-4 rounded-xl text-sm font-body">
              Check your inbox — we&apos;ve sent a password reset link to <strong>{email}</strong>.
            </div>
            <Link
              href="/login"
              className="block w-full text-center bg-brand-orange text-brand-white font-body font-bold text-lg py-4 rounded-xl hover:brightness-110 transition-all"
            >
              Back to login
            </Link>
          </div>
        ) : (
          <form className="space-y-5" onSubmit={handleSubmit}>
            {error && (
              <div className="bg-red-500/20 border border-red-500/50 text-red-200 px-4 py-3 rounded-xl text-sm">
                {error}
              </div>
            )}

            <div className="space-y-1.5">
              <label htmlFor="email" className="block text-sm font-semibold text-brand-white/90">
                Email address
              </label>
              <input
                id="email"
                name="email"
                type="email"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                autoComplete="email"
                className="w-full px-4 py-3.5 rounded-xl border border-brand-white/20 focus:border-brand-yellow focus:ring-2 focus:ring-brand-yellow/20 outline-none transition-all bg-white/5 text-brand-white placeholder-brand-white/30 font-body"
                placeholder="name@example.com"
              />
            </div>

            <button
              type="submit"
              disabled={pending}
              className="w-full bg-brand-orange text-brand-white font-body font-bold text-lg py-4 rounded-xl hover:brightness-110 hover:shadow-xl transition-all transform hover:-translate-y-0.5 mt-4 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {pending ? 'Sending…' : 'Send reset link'}
            </button>

            <div className="text-center font-body text-brand-white/70 pt-2">
              <Link href="/login" className="text-brand-yellow font-bold hover:text-brand-white hover:underline transition-all">
                Back to login
              </Link>
            </div>
          </form>
        )}
      </div>
    </div>
  );
}
