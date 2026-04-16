import { Suspense } from 'react';
import InboxLayout from '@/components/inbox/InboxLayout';

export const metadata = { title: 'Inbox — Odd Folk' };

export default function InboxPage() {
  return (
    <Suspense>
      <InboxLayout />
    </Suspense>
  );
}
