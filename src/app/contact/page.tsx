'use client';

import ContactPage from '@/components/ContactPage';
import { useAppNavigate } from '@/lib/navigation';

export default function ContactRoute() {
  const navigate = useAppNavigate();
  return <ContactPage onNavigate={navigate} />;
}
