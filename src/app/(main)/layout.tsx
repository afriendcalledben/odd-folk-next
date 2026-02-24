'use client';

import Header from '@/components/Header';
import Footer from '@/components/Footer';
import { useAuth } from '@/context/AuthContext';
import { useAppNavigate } from '@/lib/navigation';

export default function MainLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const { user } = useAuth();
  const navigate = useAppNavigate();

  return (
    <div className="min-h-screen flex flex-col bg-brand-white">
      <Header onNavigate={navigate} user={user} />
      <main className="flex-grow">{children}</main>
      <Footer onNavigate={navigate} />
    </div>
  );
}
