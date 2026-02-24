'use client';

import { useRouter } from 'next/navigation';
import ListItem from '@/components/ListItem';
import Login from '@/components/Login';
import { useAuth } from '@/contexts/AuthContext';
import { useAppNavigate } from '@/lib/navigation';

export default function ListItemPage() {
  const navigate = useAppNavigate();
  const router = useRouter();
  const { isLoggedIn, login } = useAuth();

  const handleLogin = async () => {
    await login();
    router.push('/list-item');
  };

  if (!isLoggedIn) {
    return <Login onNavigate={navigate} initialMode="login" onLogin={handleLogin} />;
  }

  return <ListItem onNavigate={navigate} />;
}
