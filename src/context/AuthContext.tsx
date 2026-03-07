'use client';

import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';
import { useSession, signOut } from '@/lib/auth-client';
import { getUserFavoriteIds, toggleFavorite as apiToggleFavorite, getCurrentUserProfile } from '@/services/api';
import type { User } from '@/services/api';

interface AuthContextType {
  user: User | null;
  isLoggedIn: boolean;
  favoriteIds: string[];
  logout: () => Promise<void>;
  refreshUser: () => Promise<void>;
  loadFavorites: () => Promise<void>;
  toggleFavorite: (productId: string) => Promise<void>;
  isLoading: boolean;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [favoriteIds, setFavoriteIds] = useState<string[]>([]);
  const [profileLoading, setProfileLoading] = useState(true);

  const { data: session, isPending: sessionPending } = useSession();

  const loadFavorites = useCallback(async () => {
    try {
      const ids = await getUserFavoriteIds();
      setFavoriteIds(ids);
    } catch {
      setFavoriteIds([]);
    }
  }, []);

  const refreshUser = useCallback(async () => {
    const profile = await getCurrentUserProfile();
    if (profile) {
      setUser(profile);
      setIsLoggedIn(true);
      await loadFavorites();
    } else {
      setUser(null);
      setIsLoggedIn(false);
      setFavoriteIds([]);
    }
  }, [loadFavorites]);

  useEffect(() => {
    if (sessionPending) return;

    if (session?.user) {
      setProfileLoading(true);
      refreshUser().finally(() => setProfileLoading(false));
    } else {
      setUser(null);
      setIsLoggedIn(false);
      setFavoriteIds([]);
      setProfileLoading(false);
    }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [session?.user?.id, sessionPending]);

  const logout = async () => {
    setUser(null);
    setIsLoggedIn(false);
    setFavoriteIds([]);
    await signOut();
  };

  const toggleFavorite = async (productId: string) => {
    try {
      const isFavorited = await apiToggleFavorite(productId);
      if (isFavorited) {
        setFavoriteIds(prev => [...prev, productId]);
      } else {
        setFavoriteIds(prev => prev.filter(id => id !== productId));
      }
    } catch (error) {
      console.error('Failed to toggle favorite:', error);
    }
  };

  return (
    <AuthContext.Provider value={{
      user,
      isLoggedIn,
      favoriteIds,
      logout,
      refreshUser,
      loadFavorites,
      toggleFavorite,
      isLoading: sessionPending || profileLoading,
    }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
}
