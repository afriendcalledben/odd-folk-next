'use client';

import React, { useEffect, useRef, useState } from 'react';
import { useRouter } from 'next/navigation';
import toast from 'react-hot-toast';
import Logo from '@/components/Logo';
import PhoneInput, { validatePhone } from '@/components/PhoneInput';
import { Input, Textarea, Button } from '@/components/ui';
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

  const [step, setStep] = useState<1 | 2>(1);
  const [acceptedPrivacy, setAcceptedPrivacy] = useState(false);
  const [acceptedTerms, setAcceptedTerms] = useState(false);
  const skipRedirect = useRef(false);
  const [username, setUsername] = useState('');
  const [bio, setBio] = useState('');
  const [phone, setPhone] = useState('');
  const [errors, setErrors] = useState<{ username?: string; phone?: string }>({});
  const [isSubmitting, setIsSubmitting] = useState(false);

  type UsernameStatus = 'idle' | 'checking' | 'available' | 'taken';
  const [usernameStatus, setUsernameStatus] = useState<UsernameStatus>('idle');
  const debounceRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  // If user already has a username, skip onboarding (unless we're mid-flow)
  useEffect(() => {
    if (user.username && !skipRedirect.current) {
      router.replace('/dashboard');
    }
  }, [user.username, router]);

  // Debounced username availability check
  useEffect(() => {
    if (debounceRef.current) clearTimeout(debounceRef.current);

    if (!username || !USERNAME_RE.test(username)) {
      setUsernameStatus('idle');
      return;
    }

    setUsernameStatus('checking');
    debounceRef.current = setTimeout(async () => {
      try {
        const res = await fetch(`/api/users/check-username?username=${encodeURIComponent(username.toLowerCase())}`);
        const json = await res.json();
        setUsernameStatus(json.data?.available ? 'available' : 'taken');
      } catch {
        setUsernameStatus('idle');
      }
    }, 400);

    return () => {
      if (debounceRef.current) clearTimeout(debounceRef.current);
    };
  }, [username]);

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
      return false;
    }

    if (usernameStatus === 'taken') {
      newErrors.username = 'That username is already taken';
    }

    if (usernameStatus === 'checking') {
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
      skipRedirect.current = true;
      await refreshUser();
      setStep(2);
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

  const shell = (children: React.ReactNode) => (
    <div className="min-h-screen bg-brand-grey/20 flex flex-col items-center justify-center px-4 py-12">
      <div className="w-full max-w-lg">
        <div className="flex justify-center mb-8">
          <Logo className="h-16 w-auto" />
        </div>
        <div className="bg-brand-white rounded-2xl shadow-sm border border-brand-grey p-8">
          {children}
        </div>
      </div>
    </div>
  );

  if (step === 2) {
    return shell(
      <>
        <div className="flex items-center gap-3 mb-6">
          <div className="w-8 h-8 rounded-full bg-brand-orange/10 flex items-center justify-center flex-shrink-0">
            <svg className="w-4 h-4 text-brand-orange" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" />
            </svg>
          </div>
          <div>
            <p className="text-xs font-body text-brand-burgundy/50 uppercase tracking-widest">Step 2 of 2</p>
            <h1 className="font-heading text-2xl text-brand-burgundy leading-tight">Before you continue</h1>
          </div>
        </div>

        <div className="mb-8">
          <p className="font-body text-brand-burgundy/80 mb-4">By signing up to this website you agree to our:</p>
          <div className="flex gap-3 mb-8">
            <a href="/privacy" target="_blank" rel="noopener noreferrer" className="font-body text-sm font-semibold text-brand-orange underline underline-offset-2 hover:text-brand-orange/80 transition-colors">
              Privacy Policy
            </a>
            <span className="text-brand-burgundy/30">·</span>
            <a href="/terms" target="_blank" rel="noopener noreferrer" className="font-body text-sm font-semibold text-brand-orange underline underline-offset-2 hover:text-brand-orange/80 transition-colors">
              Terms of Service
            </a>
          </div>

          <div className="space-y-4">
            <label className="flex items-start gap-3 cursor-pointer group">
              <input
                type="checkbox"
                checked={acceptedPrivacy}
                onChange={e => setAcceptedPrivacy(e.target.checked)}
                className="mt-0.5 w-4 h-4 accent-brand-orange rounded cursor-pointer flex-shrink-0"
              />
              <span className="font-body text-sm text-brand-burgundy/70 group-hover:text-brand-burgundy transition-colors">
                I have read and accept the{' '}
                <a href="/privacy" target="_blank" rel="noopener noreferrer" className="text-brand-orange underline underline-offset-2 hover:text-brand-orange/80">
                  Privacy Policy
                </a>
              </span>
            </label>

            <label className="flex items-start gap-3 cursor-pointer group">
              <input
                type="checkbox"
                checked={acceptedTerms}
                onChange={e => setAcceptedTerms(e.target.checked)}
                className="mt-0.5 w-4 h-4 accent-brand-orange rounded cursor-pointer flex-shrink-0"
              />
              <span className="font-body text-sm text-brand-burgundy/70 group-hover:text-brand-burgundy transition-colors">
                I have read and accept the{' '}
                <a href="/terms" target="_blank" rel="noopener noreferrer" className="text-brand-orange underline underline-offset-2 hover:text-brand-orange/80">
                  Terms of Service
                </a>
              </span>
            </label>
          </div>
        </div>

        <Button
          fullWidth
          size="lg"
          disabled={!acceptedPrivacy || !acceptedTerms}
          onClick={() => {
            toast.success('Welcome to Odd Folk!');
            router.push('/');
          }}
        >
          Continue
        </Button>
      </>
    );
  }

  return shell(
    <>
      <h1 className="font-heading text-3xl text-brand-burgundy mb-2">Welcome, {user.name.split(' ')[0]}!</h1>
      <p className="font-body text-brand-burgundy/60 text-sm mb-8">
        Let&apos;s set up your profile so the Odd Folk community can get to know you.
      </p>

      <form onSubmit={handleSubmit} noValidate className="space-y-6">
        <div>
          <Input
            label="Username"
            type="text"
            value={username}
            onChange={e => {
              setUsername(e.target.value);
              if (errors.username) setErrors(prev => ({ ...prev, username: undefined }));
            }}
            placeholder="your_username"
            prefix="@"
            error={errors.username}
            autoComplete="username"
            spellCheck={false}
          />
          <div className="mt-1 h-4 flex items-center gap-1.5">
            {usernameStatus === 'idle' && (
              <p className="text-xs text-brand-burgundy/40">3–30 characters: letters, numbers, _ or -</p>
            )}
            {usernameStatus === 'checking' && (
              <>
                <svg className="w-3.5 h-3.5 animate-spin text-brand-burgundy/40" fill="none" viewBox="0 0 24 24">
                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                  <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v4a4 4 0 00-4 4H4z" />
                </svg>
                <span className="text-xs text-brand-burgundy/40">Checking…</span>
              </>
            )}
            {usernameStatus === 'available' && (
              <>
                <svg className="w-3.5 h-3.5 text-green-500 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M5 13l4 4L19 7" />
                </svg>
                <span className="text-xs text-green-600 font-medium">Username available!</span>
              </>
            )}
            {usernameStatus === 'taken' && (
              <>
                <svg className="w-3.5 h-3.5 text-red-500 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M6 18L18 6M6 6l12 12" />
                </svg>
                <span className="text-xs text-red-500 font-medium">Username taken.</span>
              </>
            )}
          </div>
        </div>

        <Textarea
          label="Bio"
          optional
          value={bio}
          onChange={e => setBio(e.target.value)}
          placeholder="Tell the community a little about yourself…"
          rows={4}
          hint={
            <p className={`text-xs text-right ${bioOverLimit ? 'text-red-500 font-bold' : 'text-brand-burgundy/40'}`}>
              {bioWords} / 200 words
            </p>
          }
        />

        <div>
          <label className="block font-body text-sm font-bold text-brand-burgundy mb-1">
            Phone number <span className="text-brand-burgundy/40 font-normal">(optional)</span>
          </label>
          <p className="text-xs text-red-500 mb-1">Phone numbers are not required at this point</p>
          <PhoneInput
            value={phone}
            onChange={setPhone}
            error={errors.phone}
            disabled
          />
        </div>

        <Button
          type="submit"
          fullWidth
          size="lg"
          isLoading={isSubmitting}
          disabled={bioOverLimit || username.length < 3 || usernameStatus === 'taken' || usernameStatus === 'checking'}
          className="mt-2"
        >
          {isSubmitting ? 'Saving…' : 'Continue'}
        </Button>
      </form>
    </>
  );
}
