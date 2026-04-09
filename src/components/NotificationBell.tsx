'use client';

import { useState, useEffect, useRef, useCallback } from 'react';
import { useRouter } from 'next/navigation';
import { Bell } from 'lucide-react';

interface Notification {
  id: string;
  type: string;
  title: string;
  body: string;
  linkUrl: string | null;
  isRead: boolean;
  createdAt: string;
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

const TYPE_ICON: Record<string, string> = {
  BOOKING_REQUEST: '📥',
  BOOKING_APPROVED: '✅',
  BOOKING_DECLINED: '❌',
  BOOKING_CANCELLED: '🚫',
  PAYMENT_RECEIVED: '💰',
  BOOKING_COMPLETED: '🎉',
  REVIEW_RECEIVED: '⭐',
};

export default function NotificationBell() {
  const router = useRouter();
  const [open, setOpen] = useState(false);
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [unreadCount, setUnreadCount] = useState(0);
  const ref = useRef<HTMLDivElement>(null);

  const fetchNotifications = useCallback(async () => {
    try {
      const res = await fetch('/api/notifications', { credentials: 'include' });
      if (!res.ok) return;
      const json = await res.json();
      setNotifications(json.data?.notifications ?? []);
      setUnreadCount(json.data?.unreadCount ?? 0);
    } catch {}
  }, []);

  useEffect(() => {
    fetchNotifications();
    const interval = setInterval(fetchNotifications, 60000);
    return () => clearInterval(interval);
  }, [fetchNotifications]);

  // Close on outside click
  useEffect(() => {
    function handleClick(e: MouseEvent) {
      if (ref.current && !ref.current.contains(e.target as Node)) setOpen(false);
    }
    document.addEventListener('mousedown', handleClick);
    return () => document.removeEventListener('mousedown', handleClick);
  }, []);

  async function markAllRead() {
    await fetch('/api/notifications/read-all', { method: 'PUT', credentials: 'include' });
    setNotifications(prev => prev.map(n => ({ ...n, isRead: true })));
    setUnreadCount(0);
  }

  async function handleNotificationClick(n: Notification) {
    if (!n.isRead) {
      await fetch(`/api/notifications/${n.id}/read`, { method: 'PUT', credentials: 'include' });
      setNotifications(prev => prev.map(x => x.id === n.id ? { ...x, isRead: true } : x));
      setUnreadCount(prev => Math.max(0, prev - 1));
    }
    setOpen(false);
    if (n.linkUrl) router.push(n.linkUrl);
  }

  return (
    <div className="relative" ref={ref}>
      <button
        onClick={() => setOpen(v => !v)}
        className="relative p-2 rounded-full hover:bg-white/10 transition-colors"
        aria-label="Notifications"
      >
        <Bell className="w-5 h-5 text-white" />
        {unreadCount > 0 && (
          <span className="absolute -top-0.5 -right-0.5 min-w-[18px] h-[18px] bg-brand-orange rounded-full text-[10px] font-bold text-white flex items-center justify-center px-1">
            {unreadCount > 9 ? '9+' : unreadCount}
          </span>
        )}
      </button>

      {open && (
        <div className="absolute right-0 mt-2 w-80 bg-white rounded-2xl shadow-2xl border border-brand-grey/20 z-50 overflow-hidden">
          <div className="flex items-center justify-between px-4 py-3 border-b border-brand-grey/20">
            <span className="font-heading text-brand-burgundy text-sm">Notifications</span>
            {unreadCount > 0 && (
              <button
                onClick={markAllRead}
                className="text-xs font-body text-brand-orange hover:underline"
              >
                Mark all read
              </button>
            )}
          </div>

          <div className="max-h-96 overflow-y-auto">
            {notifications.length === 0 ? (
              <p className="px-4 py-8 text-center text-sm font-body text-brand-burgundy/40">
                No notifications yet
              </p>
            ) : (
              notifications.map(n => (
                <button
                  key={n.id}
                  onClick={() => handleNotificationClick(n)}
                  className={`w-full text-left px-4 py-3 flex gap-3 hover:bg-brand-grey/10 transition-colors border-b border-brand-grey/10 last:border-0 ${!n.isRead ? 'bg-brand-orange/5' : ''}`}
                >
                  <span className="text-lg flex-shrink-0 mt-0.5">{TYPE_ICON[n.type] ?? '🔔'}</span>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-start justify-between gap-2">
                      <p className={`text-sm font-body leading-snug ${!n.isRead ? 'font-semibold text-brand-burgundy' : 'text-brand-burgundy/80'}`}>
                        {n.title}
                      </p>
                      {!n.isRead && (
                        <span className="w-2 h-2 rounded-full bg-brand-orange flex-shrink-0 mt-1.5" />
                      )}
                    </div>
                    <p className="text-xs text-brand-burgundy/60 font-body mt-0.5 line-clamp-2">{n.body}</p>
                    <p className="text-[10px] text-brand-burgundy/40 font-body mt-1">{timeAgo(n.createdAt)}</p>
                  </div>
                </button>
              ))
            )}
          </div>
        </div>
      )}
    </div>
  );
}
