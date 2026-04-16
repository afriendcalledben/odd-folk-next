'use client';

import { useState, useEffect, useRef, useCallback } from 'react';
import { Send } from 'lucide-react';
import BookingStatusBanner from './BookingStatusBanner';
import type { ThreadSummary } from './InboxLayout';

interface Message {
  id: string;
  threadId: string;
  senderId: string;
  text: string;
  type: 'USER' | 'SYSTEM';
  createdAt: string;
  sender: { id: string; name: string; avatarUrl: string | null };
}

interface Props {
  threadId: string;
  summary: ThreadSummary | null;
  onRead: () => void;
  onNewMessage: () => void;
}

export default function ThreadView({ threadId, summary, onRead, onNewMessage }: Props) {
  const [messages, setMessages] = useState<Message[]>([]);
  const [text, setText] = useState('');
  const [sending, setSending] = useState(false);
  const [currentUserId, setCurrentUserId] = useState<string | null>(null);
  const bottomRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  // Get current user id
  useEffect(() => {
    fetch('/api/auth/me', { credentials: 'include' })
      .then(r => r.json())
      .then(json => setCurrentUserId(json.data?.id ?? null))
      .catch(() => {});
  }, []);

  const fetchMessages = useCallback(async () => {
    try {
      const res = await fetch(`/api/threads/${threadId}/messages`, { credentials: 'include' });
      if (!res.ok) return;
      const json = await res.json();
      setMessages(json.data ?? []);
    } catch {}
  }, [threadId]);

  const markRead = useCallback(async () => {
    await fetch(`/api/threads/${threadId}/read`, { method: 'PUT', credentials: 'include' });
    onRead();
  }, [threadId, onRead]);

  useEffect(() => {
    fetchMessages();
    markRead();
    const interval = setInterval(fetchMessages, 5000);
    return () => clearInterval(interval);
  }, [fetchMessages, markRead]);


  async function handleSend(e: React.FormEvent) {
    e.preventDefault();
    if (!text.trim() || sending) return;
    setSending(true);
    try {
      await fetch(`/api/threads/${threadId}/messages`, {
        method: 'POST',
        credentials: 'include',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ text: text.trim() }),
      });
      setText('');
      await fetchMessages();
      markRead();
      onNewMessage();
    } catch {}
    finally { setSending(false); }
  }

  const otherParty = summary?.otherParty;
  const productTitle = summary?.productTitle;
  const activeBooking = summary?.activeBooking ?? null;

  return (
    <div className="flex flex-col flex-1 h-full min-h-0">
      {/* Header */}
      <div className="flex items-center gap-3 px-4 py-3 border-b border-brand-grey/20 bg-brand-white flex-shrink-0">
        {otherParty && (
          <img
            src={otherParty.avatarUrl || '/avatar-placeholder.svg'}
            alt={otherParty.name}
            className="w-9 h-9 rounded-full object-cover border border-brand-grey flex-shrink-0"
          />
        )}
        <div className="min-w-0">
          <p className="font-body font-semibold text-brand-burgundy text-sm truncate">
            {otherParty?.name ?? '…'}
          </p>
          {productTitle && (
            <p className="text-xs text-brand-burgundy/50 font-body truncate">{productTitle}</p>
          )}
        </div>
      </div>

      {/* Booking status banner */}
      {activeBooking && <BookingStatusBanner booking={activeBooking} />}

      {/* Messages */}
      <div className="flex-1 overflow-y-auto px-4 py-4 space-y-3 bg-[#F9FAFB]">
        {messages.map(msg => {
          if (msg.type === 'SYSTEM') {
            return (
              <div key={msg.id} className="flex justify-center my-1">
                <span className="text-[11px] font-body bg-brand-grey/20 text-brand-burgundy/50 px-3 py-1 rounded-full text-center">
                  {msg.text}
                </span>
              </div>
            );
          }
          const isMe = msg.senderId === currentUserId;
          return (
            <div key={msg.id} className={`flex ${isMe ? 'justify-end' : 'justify-start'} gap-2`}>
              {!isMe && (
                <img
                  src={msg.sender.avatarUrl || '/avatar-placeholder.svg'}
                  alt={msg.sender.name}
                  className="w-7 h-7 rounded-full object-cover border border-brand-grey flex-shrink-0 self-end"
                />
              )}
              <div className={`max-w-[75%] px-3 py-2 rounded-2xl font-body text-sm ${
                isMe
                  ? 'bg-brand-blue text-white rounded-br-sm'
                  : 'bg-white border border-brand-grey text-brand-burgundy rounded-bl-sm shadow-sm'
              }`}>
                {msg.text}
              </div>
            </div>
          );
        })}
        {messages.length === 0 && (
          <p className="text-center text-brand-burgundy/30 text-sm mt-10 font-body">
            No messages yet. Start the conversation!
          </p>
        )}
      </div>

      {/* Compose */}
      <div className="border-t border-brand-grey/20 bg-brand-white flex-shrink-0">
        <form onSubmit={handleSend} className="p-3 flex gap-2">
          <input
            ref={inputRef}
            type="text"
            value={text}
            onChange={e => setText(e.target.value)}
            placeholder="Type a message…"
            className="flex-1 p-2.5 bg-brand-white border border-brand-grey rounded-xl font-body text-brand-burgundy placeholder:text-brand-burgundy/40 focus:outline-none focus:ring-2 focus:ring-brand-orange/30 transition-colors text-sm"
          />
          <button
            type="submit"
            disabled={!text.trim() || sending}
            className="bg-brand-orange text-white p-2.5 rounded-xl hover:brightness-110 transition-all disabled:opacity-40 disabled:cursor-not-allowed flex-shrink-0"
          >
            <Send className="w-5 h-5" />
          </button>
        </form>
        <div className="bg-yellow-50 px-3 py-1.5 text-center border-t border-yellow-100">
          <p className="text-[10px] text-brand-burgundy/50 font-body">
            Always communicate through Odd Folk to keep your rental safe and avoid scams.
          </p>
        </div>
      </div>
    </div>
  );
}
