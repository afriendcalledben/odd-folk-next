'use client';

import React, { useEffect, useState } from 'react';
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

  return (
    <div className="min-h-screen bg-brand-grey/20 flex flex-col items-center justify-center px-4 py-12">
      <div className="w-full max-w-lg">
        <div className="flex justify-center mb-8">
          <Logo className="h-16 w-auto" />
        </div>

        <div className="bg-brand-white rounded-2xl shadow-sm border border-brand-grey p-8">
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
              <p className="mt-1 text-xs text-brand-burgundy/40">3–30 characters: letters, numbers, _ or -</p>
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
              <PhoneInput
                value={phone}
                onChange={setPhone}
                error={errors.phone}
              />
            </div>

            <Button
              type="submit"
              fullWidth
              size="lg"
              isLoading={isSubmitting}
              disabled={bioOverLimit}
              className="mt-2"
            >
              {isSubmitting ? 'Saving…' : 'Get started'}
            </Button>
          </form>
        </div>
      </div>
    </div>
  );
}
