'use client';

import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';
import { auth, getUserFavoriteIds, toggleFavorite as apiToggleFavorite, type User } from '@/services/api';

interface AuthContextType {
  user: User | null;
  isLoggedIn: boolean;
  favoriteIds: string[];
  login: (email: string, password: string) => Promise<void>;
  signup: (email: string, password: string, name: string) => Promise<void>;
  logout: () => void;
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

  const loadFavorites = useCallback(async () => {
    if (auth.isLoggedIn()) {
      const ids = await getUserFavoriteIds();
      setFavoriteIds(ids);
    } else {
      setFavoriteIds([]);
    }
  }, []);

  const refreshUser = useCallback(async () => {
    const currentUser = await auth.getCurrentUser();
    if (currentUser) {
      setUser(currentUser);
      setIsLoggedIn(true);
      await loadFavorites();
    } else {
      setUser(null);
      setIsLoggedIn(false);
      setFavoriteIds([]);
    }
  }, [loadFavorites]);

  // Check for existing session on mount
  useEffect(() => {
    refreshUser().finally(() => setIsLoading(false));
  }, [refreshUser]);

  const login = async (email: string, password: string) => {
    await auth.login(email, password);
    await refreshUser();
  };

  const signup = async (email: string, password: string, name: string) => {
    await auth.signup(email, password, name);
    await refreshUser();
  };

  const logout = () => {
    auth.logout();
    setUser(null);
    setIsLoggedIn(false);
    setFavoriteIds([]);
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
      login,
      signup,
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
