'use client';

import { useState, useEffect, useRef, useCallback } from 'react';
import { useRouter } from 'next/navigation';
import { Mail } from 'lucide-react';

interface ThreadSummary {
  threadId: string;
  productTitle: string;
  otherParty: { id: string; name: string; avatarUrl: string | null };
  lastMessage: { text: string; type: string; createdAt: string; isOwn: boolean } | null;
  unreadCount: number;
}

function timeAgo(dateStr: string): string {
  const diff = Date.now() - new Date(dateStr).getTime();
  const mins = Math.floor(diff / 60000);
  if (mins < 1) return 'just now';
  if (mins < 60) return `${mins}m ago`;
  const hrs = Math.floor(mins / 60);
  if (hrs < 24) return `${hrs}h ago`;
  return `${Math.floor(hrs / 24)}d ago`;
}

export default function MessageInbox() {
  const router = useRouter();
  const [open, setOpen] = useState(false);
  const [threads, setThreads] = useState<ThreadSummary[]>([]);
  const [totalUnread, setTotalUnread] = useState(0);
  const ref = useRef<HTMLDivElement>(null);

  const fetchInbox = useCallback(async () => {
    try {
      const res = await fetch('/api/threads', { credentials: 'include' });
      if (!res.ok) return;
      const json = await res.json();
      setThreads(json.data?.threads ?? []);
      setTotalUnread(json.data?.totalUnread ?? 0);
    } catch {}
  }, []);

  useEffect(() => {
    fetchInbox();
    const interval = setInterval(fetchInbox, 30000);
    return () => clearInterval(interval);
  }, [fetchInbox]);

  useEffect(() => {
    function handleClick(e: MouseEvent) {
      if (ref.current && !ref.current.contains(e.target as Node)) setOpen(false);
    }
    document.addEventListener('mousedown', handleClick);
    return () => document.removeEventListener('mousedown', handleClick);
  }, []);

  async function handleThreadClick(threadId: string, unreadCount: number) {
    await fetch(`/api/threads/${threadId}/read`, { method: 'PUT', credentials: 'include' });
    setThreads(prev => prev.map(t => t.threadId === threadId ? { ...t, unreadCount: 0 } : t));
    setTotalUnread(prev => Math.max(0, prev - unreadCount));
    setOpen(false);
    router.push(`/inbox?t=${threadId}`);
  }

  return (
    <div className="relative" ref={ref}>
      <button
        onClick={() => setOpen(v => !v)}
        className="relative p-2 rounded-full hover:bg-white/10 transition-colors"
        aria-label="Messages"
      >
        <Mail className="w-5 h-5 text-white" />
        {totalUnread > 0 && (
          <span className="absolute -top-0.5 -right-0.5 min-w-[18px] h-[18px] bg-brand-orange rounded-full text-[10px] font-bold text-white flex items-center justify-center px-1">
            {totalUnread > 9 ? '9+' : totalUnread}
          </span>
        )}
      </button>

      {open && (
        <div className="absolute right-0 mt-2 w-80 bg-white rounded-2xl shadow-2xl border border-brand-grey/20 z-50 overflow-hidden">
          <div className="px-4 py-3 border-b border-brand-grey/20 flex items-center justify-between">
            <span className="font-heading text-brand-burgundy text-sm">Messages</span>
            <button
              onClick={() => { setOpen(false); router.push('/inbox'); }}
              className="text-xs text-brand-burgundy/40 hover:text-brand-orange font-body transition-colors"
            >
              View all →
            </button>
          </div>

          <div className="max-h-96 overflow-y-auto">
            {threads.length === 0 ? (
              <p className="px-4 py-8 text-center text-sm font-body text-brand-burgundy/40">
                No messages yet
              </p>
            ) : (
              threads.map(t => {
                const preview = t.lastMessage
                  ? t.lastMessage.type === 'SYSTEM'
                    ? '— system update —'
                    : t.lastMessage.isOwn
                      ? `You: ${t.lastMessage.text}`
                      : t.lastMessage.text
                  : null;

                return (
                  <button
                    key={t.threadId}
                    onClick={() => handleThreadClick(t.threadId, t.unreadCount)}
                    className={`w-full text-left px-4 py-3 flex gap-3 hover:bg-brand-grey/10 transition-colors border-b border-brand-grey/10 last:border-0 ${t.unreadCount > 0 ? 'bg-brand-orange/5' : ''}`}
                  >
                    <img
                      src={t.otherParty.avatarUrl || '/avatar-placeholder.svg'}
                      alt={t.otherParty.name}
                      className="w-9 h-9 rounded-full object-cover flex-shrink-0 border border-brand-grey"
                    />
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center justify-between gap-2">
                        <p className={`text-sm font-body truncate ${t.unreadCount > 0 ? 'font-semibold text-brand-burgundy' : 'text-brand-burgundy/80'}`}>
                          {t.otherParty.name}
                        </p>
                        <div className="flex items-center gap-1.5 flex-shrink-0">
                          {t.unreadCount > 0 && (
                            <span className="min-w-[18px] h-[18px] bg-brand-orange rounded-full text-[10px] font-bold text-white flex items-center justify-center px-1">
                              {t.unreadCount}
                            </span>
                          )}
                        </div>
                      </div>
                      <p className="text-xs text-brand-burgundy/50 font-body truncate">{t.productTitle}</p>
                      {preview && (
                        <p className="text-xs text-brand-burgundy/60 font-body mt-0.5 truncate">{preview}</p>
                      )}
                      {t.lastMessage && (
                        <p className="text-[10px] text-brand-burgundy/40 font-body mt-0.5">{timeAgo(t.lastMessage.createdAt)}</p>
                      )}
                    </div>
                  </button>
                );
              })
            )}
          </div>
        </div>
      )}
    </div>
  );
}
