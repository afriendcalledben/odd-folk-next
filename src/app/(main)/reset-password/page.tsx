'use client';

import { useState, Suspense } from 'react';
import { useSearchParams } from 'next/navigation';
import Link from 'next/link';
import Logo from '@/components/Logo';
import { resetPassword } from '@/lib/auth-client';
import FieldRequirements, { passwordRequirements } from '@/components/ui/FieldRequirements';

function ResetPasswordForm() {
  const searchParams = useSearchParams();
  const token = searchParams.get('token');

  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [pending, setPending] = useState(false);
  const [done, setDone] = useState(false);
  const [error, setError] = useState<string | null>(null);

  if (!token) {
    return (
      <div className="text-center space-y-4">
        <div className="bg-red-500/20 border border-red-500/50 text-red-200 px-4 py-3 rounded-xl text-sm">
          Invalid or missing reset token. Please request a new reset link.
        </div>
        <Link
          href="/forgot-password"
          className="block w-full text-center bg-brand-orange text-brand-white font-body font-bold text-lg py-4 rounded-xl hover:brightness-110 transition-all"
        >
          Request new link
        </Link>
      </div>
    );
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    if (newPassword !== confirmPassword) {
      setError('Passwords do not match');
      return;
    }
    if (newPassword.length < 8) {
      setError('Password must be at least 8 characters');
      return;
    }
    setPending(true);
    try {
      const result = await resetPassword({ newPassword, token });
      if (result.error) {
        setError('This link has expired or is invalid. Please request a new one.');
      } else {
        setDone(true);
      }
    } catch {
      setError('Something went wrong. Please try again.');
    } finally {
      setPending(false);
    }
  };

  if (done) {
    return (
      <div className="text-center space-y-6">
        <div className="bg-brand-yellow/20 border border-brand-yellow/50 text-brand-yellow px-6 py-4 rounded-xl text-sm font-body">
          Your password has been reset successfully.
        </div>
        <Link
          href="/login"
          className="block w-full text-center bg-brand-orange text-brand-white font-body font-bold text-lg py-4 rounded-xl hover:brightness-110 transition-all"
        >
          Log in
        </Link>
      </div>
    );
  }

  return (
    <form className="space-y-5" onSubmit={handleSubmit}>
      {error && (
        <div className="bg-red-500/20 border border-red-500/50 text-red-200 px-4 py-3 rounded-xl text-sm">
          {error}
        </div>
      )}

      <div className="space-y-1.5">
        <label htmlFor="newPassword" className="block text-sm font-semibold text-brand-white/90">
          New password
        </label>
        <input
          id="newPassword"
          type="password"
          required
          minLength={8}
          value={newPassword}
          onChange={(e) => setNewPassword(e.target.value)}
          autoComplete="new-password"
          className="w-full px-4 py-3.5 rounded-xl border border-brand-white/20 focus:border-brand-yellow focus:ring-2 focus:ring-brand-yellow/20 outline-none transition-all bg-white/5 text-brand-white placeholder-brand-white/30 font-body"
          placeholder="Min. 8 characters"
        />
        <FieldRequirements value={newPassword} requirements={passwordRequirements} variant="dark" />
      </div>

      <div className="space-y-1.5">
        <label htmlFor="confirmPassword" className="block text-sm font-semibold text-brand-white/90">
          Confirm new password
        </label>
        <input
          id="confirmPassword"
          type="password"
          required
          minLength={8}
          value={confirmPassword}
          onChange={(e) => setConfirmPassword(e.target.value)}
          autoComplete="new-password"
          className="w-full px-4 py-3.5 rounded-xl border border-brand-white/20 focus:border-brand-yellow focus:ring-2 focus:ring-brand-yellow/20 outline-none transition-all bg-white/5 text-brand-white placeholder-brand-white/30 font-body"
          placeholder="Repeat password"
        />
      </div>

      <button
        type="submit"
        disabled={pending}
        className="w-full bg-brand-orange text-brand-white font-body font-bold text-lg py-4 rounded-xl hover:brightness-110 hover:shadow-xl transition-all transform hover:-translate-y-0.5 mt-4 disabled:opacity-50 disabled:cursor-not-allowed"
      >
        {pending ? 'Resetting…' : 'Set new password'}
      </button>
    </form>
  );
}

export default function ResetPasswordPage() {
  return (
    <div className="min-h-screen bg-brand-white flex items-center justify-center p-4 relative">
      <div className="absolute inset-0 bg-brand-yellow/10 z-0" />

      <div className="bg-brand-blue w-full max-w-[480px] rounded-3xl shadow-2xl relative z-10 p-8 sm:p-12 border border-brand-white/10 animate-fade-in text-brand-white">
        <div className="text-center mb-10">
          <div className="w-24 mx-auto mb-6 filter brightness-0 invert">
            <Logo />
          </div>
          <h1 className="font-heading text-3xl text-brand-white mb-2">Set new password</h1>
          <p className="font-body text-brand-white/70">Choose a strong password for your account</p>
        </div>

        <Suspense fallback={<div className="text-center text-brand-white/50 font-body">Loading…</div>}>
          <ResetPasswordForm />
        </Suspense>
      </div>
    </div>
  );
}
