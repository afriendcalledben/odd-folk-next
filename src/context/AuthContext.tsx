'use client';

import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';
import { createClient } from '@/utils/supabase/client';
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
  const [isLoading, setIsLoading] = useState(true);

  const supabase = createClient();

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
    // Fetch initial session
    refreshUser().finally(() => setIsLoading(false));

    // Listen for auth state changes (login, logout, token refresh)
    const { data: { subscription } } = supabase.auth.onAuthStateChange(async (event) => {
      if (event === 'SIGNED_IN' || event === 'TOKEN_REFRESHED') {
        await refreshUser();
      } else if (event === 'SIGNED_OUT') {
        setUser(null);
        setIsLoggedIn(false);
        setFavoriteIds([]);
      }
    });

    return () => subscription.unsubscribe();
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const logout = async () => {
    setUser(null);
    setIsLoggedIn(false);
    setFavoriteIds([]);
    await supabase.auth.signOut();
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
      isLoading,
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
