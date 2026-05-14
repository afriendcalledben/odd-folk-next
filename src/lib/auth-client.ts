'use client'

import { createAuthClient } from 'better-auth/react'

export const authClient = createAuthClient({
  baseURL: process.env.NEXT_PUBLIC_SITE_URL,
})

export const { signIn, signUp, signOut, useSession } = authClient

export async function forgetPassword(data: { email: string; redirectTo: string }) {
  const res = await fetch('/api/auth/request-password-reset', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    credentials: 'include',
    body: JSON.stringify(data),
  });
  return { error: res.ok ? null : await res.json().catch(() => ({ message: 'Error' })) };
}

export async function resetPassword(data: { token: string; newPassword: string }) {
  const res = await fetch('/api/auth/reset-password', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    credentials: 'include',
    body: JSON.stringify(data),
  });
  return { error: res.ok ? null : await res.json().catch(() => ({ message: 'Error' })) };
}

export async function changePassword(data: { currentPassword: string; newPassword: string; revokeOtherSessions: boolean }) {
  const res = await fetch('/api/auth/change-password', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    credentials: 'include',
    body: JSON.stringify(data),
  });
  return { error: res.ok ? null : await res.json().catch(() => ({ message: 'Error' })) };
}
