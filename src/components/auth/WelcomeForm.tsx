'use client';

import React, { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import toast from 'react-hot-toast';
import Logo from '@/components/Logo';
import PhoneInput, { validatePhone } from '@/components/PhoneInput';
import { updateUserProfile } from '@/services/api';
import { useAuth } from '@/context/AuthContext';
import type { User } from '@/services/api';

const USERNAME_RE = /^[a-zA-Z0-9_-]{3,30}$/;

function countWords(text: string): number {
  return text.trim() === '' ? 0 : text.trim().split(/\s+/).length;
}

export default function WelcomeForm({ user }: { user: User }) {
  const router = useRouter();
  const { refreshUser } = useAuth();

  const [username, setUsername] = useState('');
  const [bio, setBio] = useState('');
  const [phone, setPhone] = useState('');
  const [errors, setErrors] = useState<{ username?: string; phone?: string }>({});
  const [isSubmitting, setIsSubmitting] = useState(false);

  // If user somehow already has a username, skip onboarding
  useEffect(() => {
    if (user.username) {
      router.replace('/dashboard');
    }
  }, [user.username, router]);

  const bioWords = countWords(bio);
  const bioOverLimit = bioWords > 200;

  function validate(): boolean {
    const newErrors: { username?: string; phone?: string } = {};

    if (!username) {
      newErrors.username = 'Username is required';
    } else if (!USERNAME_RE.test(username)) {
      newErrors.username = 'Username must be 3–30 characters: letters, numbers, _ or -';
    }

    if (phone && !validatePhone(phone)) {
      newErrors.phone = 'Enter a valid phone number (6–15 digits)';
    }

    if (bioOverLimit) {
      // Prevent submit via the button being disabled; this is a safety net
      return false;
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!validate()) return;

    setIsSubmitting(true);
    try {
      await updateUserProfile({
        username: username.toLowerCase(),
        bio: bio.trim() || undefined,
        phone: phone || undefined,
      });
      await refreshUser();
      toast.success('Welcome to Odd Folk!');
      router.push('/dashboard');
    } catch (err: unknown) {
      const message = err instanceof Error ? err.message : 'Something went wrong';
      if (message.toLowerCase().includes('username')) {
        setErrors(prev => ({ ...prev, username: 'That username is already taken' }));
      } else {
        toast.error(message);
      }
    } finally {
      setIsSubmitting(false);
    }
  }

  const inputClass = 'w-full p-3 bg-brand-white border border-brand-grey rounded-lg font-body text-brand-burgundy focus:outline-none focus:ring-2 focus:ring-brand-orange/30 transition-colors';
  const labelClass = 'block font-body text-sm font-bold text-brand-burgundy mb-1';

  return (
    <div className="min-h-screen bg-brand-grey/20 flex flex-col items-center justify-center px-4 py-12">
      <div className="w-full max-w-lg">
        {/* Logo */}
        <div className="flex justify-center mb-8">
          <Logo className="h-16 w-auto" />
        </div>

        {/* Card */}
        <div className="bg-brand-white rounded-2xl shadow-sm border border-brand-grey p-8">
          <h1 className="font-heading text-3xl text-brand-burgundy mb-2">Welcome, {user.name.split(' ')[0]}!</h1>
          <p className="font-body text-brand-burgundy/60 text-sm mb-8">
            Let&apos;s set up your profile so the Odd Folk community can get to know you.
          </p>

          <form onSubmit={handleSubmit} noValidate className="space-y-6">
            {/* Username */}
            <div>
              <label className={labelClass}>
                Username <span className="text-red-500">*</span>
              </label>
              <div className="relative">
                <span className="absolute left-3 top-1/2 -translate-y-1/2 text-brand-burgundy/40 font-body text-sm select-none">@</span>
                <input
                  type="text"
                  value={username}
                  onChange={e => {
                    setUsername(e.target.value);
                    if (errors.username) setErrors(prev => ({ ...prev, username: undefined }));
                  }}
                  placeholder="your_username"
                  className={`${inputClass} pl-7`}
                  autoComplete="username"
                  spellCheck={false}
                />
              </div>
              {errors.username && (
                <p className="mt-1 text-xs text-red-500">{errors.username}</p>
              )}
              <p className="mt-1 text-xs text-brand-burgundy/40">3–30 characters: letters, numbers, _ or -</p>
            </div>

            {/* Bio */}
            <div>
              <label className={labelClass}>
                Bio <span className="text-brand-burgundy/40 font-normal">(optional)</span>
              </label>
              <textarea
                value={bio}
                onChange={e => setBio(e.target.value)}
                placeholder="Tell the community a little about yourself…"
                rows={4}
                className={`${inputClass} resize-none`}
              />
              <p className={`mt-1 text-xs text-right ${bioOverLimit ? 'text-red-500 font-bold' : 'text-brand-burgundy/40'}`}>
                {bioWords} / 200 words
              </p>
            </div>

            {/* Phone */}
            <div>
              <label className={labelClass}>
                Phone number <span className="text-brand-burgundy/40 font-normal">(optional)</span>
              </label>
              <PhoneInput
                value={phone}
                onChange={setPhone}
                error={errors.phone}
              />
            </div>

            {/* Submit */}
            <button
              type="submit"
              disabled={isSubmitting || bioOverLimit}
              className="w-full bg-brand-orange text-white font-heading text-lg py-4 rounded-xl hover:brightness-105 transition-all disabled:opacity-50 disabled:cursor-not-allowed mt-2"
            >
              {isSubmitting ? 'Saving…' : 'Get started'}
            </button>
          </form>
        </div>
      </div>
    </div>
  );
}
