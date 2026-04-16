'use client';

import { useState, useEffect, useCallback } from 'react';
import { useSearchParams, useRouter } from 'next/navigation';
import ThreadList from './ThreadList';
import ThreadView from './ThreadView';
import { ArrowLeft } from 'lucide-react';
import { useAuth } from '@/context/AuthContext';

export interface ThreadSummary {
  threadId: string;
  productId: string;
  productTitle: string;
  productImage: string | null;
  otherParty: { id: string; name: string; avatarUrl: string | null };
  lastMessage: { text: string; type: string; createdAt: string; isOwn: boolean } | null;
  unreadCount: number;
  activeBooking: {
    id: string;
    status: string;
    startDate: string;
    endDate: string;
    totalHirerCost: number;
  } | null;
}

export default function InboxLayout() {
  const searchParams = useSearchParams();
  const router = useRouter();
  const { user } = useAuth();
  const selectedThreadId = searchParams.get('t');

  const [threads, setThreads] = useState<ThreadSummary[]>([]);
  const [loading, setLoading] = useState(true);

  const fetchThreads = useCallback(async () => {
    try {
      const res = await fetch('/api/threads', { credentials: 'include' });
      if (!res.ok) return;
      const json = await res.json();
      setThreads(json.data?.threads ?? []);
    } catch {}
    finally { setLoading(false); }
  }, []);

  useEffect(() => {
    fetchThreads();
    const interval = setInterval(fetchThreads, 30000);
    return () => clearInterval(interval);
  }, [fetchThreads]);

  function selectThread(threadId: string) {
    router.push(`/inbox?t=${threadId}`);
  }

  function markThreadRead(threadId: string) {
    setThreads(prev =>
      prev.map(t => t.threadId === threadId ? { ...t, unreadCount: 0 } : t)
    );
  }

  const selectedThread = threads.find(t => t.threadId === selectedThreadId) ?? null;

  return (
    <div className="bg-brand-cream py-8 px-4 sm:px-6 lg:px-8 min-h-[calc(100vh-64px)]">
      <div className="container mx-auto max-w-7xl">
        <h1 className="font-heading text-3xl text-brand-burgundy mb-6">Inbox</h1>

        {/* Two-panel card */}
        <div className="flex h-[calc(100vh-220px)] min-h-96 bg-brand-white border border-brand-grey/20 rounded-3xl shadow-xl overflow-hidden">

          {/* Thread list — always visible on desktop, hidden on mobile when thread open */}
          <div className={`
            w-full md:w-80 md:flex-shrink-0 border-r border-brand-grey/20 flex flex-col
            ${selectedThreadId ? 'hidden md:flex' : 'flex'}
          `}>
            <div className="px-4 py-3 border-b border-brand-grey/20">
              <p className="font-body text-xs uppercase tracking-widest text-brand-burgundy/40 font-semibold">Conversations</p>
            </div>
            <ThreadList
              threads={threads}
              loading={loading}
              selectedThreadId={selectedThreadId}
              onSelect={selectThread}
            />
          </div>

          {/* Thread view */}
          <div className={`
            flex-1 flex flex-col
            ${!selectedThreadId ? 'hidden md:flex' : 'flex'}
          `}>
            {selectedThreadId ? (
              <>
                {/* Mobile back button */}
                <button
                  onClick={() => router.push('/inbox')}
                  className="md:hidden flex items-center gap-2 px-4 py-3 border-b border-brand-grey/20 text-brand-burgundy/60 hover:text-brand-burgundy text-sm font-body"
                >
                  <ArrowLeft className="w-4 h-4" />
                  All messages
                </button>
                <ThreadView
                  threadId={selectedThreadId}
                  summary={selectedThread}
                  currentUserId={user?.id ?? null}
                  onRead={() => markThreadRead(selectedThreadId)}
                  onNewMessage={fetchThreads}
                />
              </>
            ) : (
              <div className="hidden md:flex flex-1 items-center justify-center text-brand-burgundy/30 font-body text-sm">
                Select a conversation
              </div>
            )}
          </div>

        </div>
      </div>
    </div>
  );
}
