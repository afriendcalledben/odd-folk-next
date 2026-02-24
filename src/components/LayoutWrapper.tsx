'use client';

import { usePathname } from 'next/navigation';
import Header from './Header';
import Footer from './Footer';
import { useAuth } from '@/contexts/AuthContext';
import { useAppNavigate } from '@/lib/navigation';

export default function LayoutWrapper({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const { user } = useAuth();
  const navigate = useAppNavigate();

  const isLoginPage = pathname === '/login';

  return (
    <div className="min-h-screen flex flex-col bg-brand-white">
      {!isLoginPage && <Header onNavigate={navigate} user={user} />}
      <main className="flex-grow">{children}</main>
      {!isLoginPage && <Footer onNavigate={navigate} />}
    </div>
  );
}
