'use client';

import { createContext, useContext, useState, useEffect, useCallback, ReactNode } from 'react';
import { auth, getUserFavoriteIds, toggleFavorite } from '@/services/api';
import type { User } from '@/services/api';

interface AuthContextType {
  user: User | null;
  isLoggedIn: boolean;
  favoriteIds: string[];
  login: () => Promise<void>;
  logout: () => void;
  toggleFav: (productId: string) => Promise<void>;
  setFavoriteIds: (ids: string[]) => void;
}

const AuthContext = createContext<AuthContextType | null>(null);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [favoriteIds, setFavoriteIds] = useState<string[]>([]);

  const loadFavorites = useCallback(async () => {
    if (auth.isLoggedIn()) {
      const ids = await getUserFavoriteIds();
      setFavoriteIds(ids);
    } else {
      setFavoriteIds([]);
    }
  }, []);

  useEffect(() => {
    auth.getCurrentUser().then((currentUser) => {
      if (currentUser) {
        setUser(currentUser);
        setIsLoggedIn(true);
        loadFavorites();
      }
    });
  }, [loadFavorites]);

  const login = async () => {
    const currentUser = await auth.getCurrentUser();
    if (currentUser) {
      setUser(currentUser);
      setIsLoggedIn(true);
      loadFavorites();
    }
  };

  const logout = () => {
    auth.logout();
    setIsLoggedIn(false);
    setUser(null);
    setFavoriteIds([]);
  };

  const toggleFav = async (productId: string) => {
    try {
      const isFavorited = await toggleFavorite(productId);
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
    <AuthContext.Provider value={{ user, isLoggedIn, favoriteIds, login, logout, toggleFav, setFavoriteIds }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error('useAuth must be used within AuthProvider');
  return ctx;
}
