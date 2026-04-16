'use client';

import type { ThreadSummary } from './InboxLayout';

function timeAgo(dateStr: string): string {
  const diff = Date.now() - new Date(dateStr).getTime();
  const mins = Math.floor(diff / 60000);
  if (mins < 1) return 'just now';
  if (mins < 60) return `${mins}m ago`;
  const hrs = Math.floor(mins / 60);
  if (hrs < 24) return `${hrs}h ago`;
  return `${Math.floor(hrs / 24)}d ago`;
}

interface Props {
  threads: ThreadSummary[];
  loading: boolean;
  selectedThreadId: string | null;
  onSelect: (threadId: string) => void;
}

export default function ThreadList({ threads, loading, selectedThreadId, onSelect }: Props) {
  if (loading) {
    return (
      <div className="flex-1 flex items-center justify-center text-brand-burgundy/30 text-sm font-body">
        Loading…
      </div>
    );
  }

  if (threads.length === 0) {
    return (
      <div className="flex-1 flex flex-col items-center justify-center px-6 py-12 text-center">
        <p className="font-body text-brand-burgundy/40 text-sm">No messages yet</p>
        <p className="font-body text-brand-burgundy/30 text-xs mt-1">
          Find a listing and click &ldquo;Message seller&rdquo; to start a conversation.
        </p>
      </div>
    );
  }

  return (
    <div className="flex-1 overflow-y-auto">
      {threads.map(thread => {
        const isSelected = thread.threadId === selectedThreadId;
        const lastMsgPreview = thread.lastMessage
          ? thread.lastMessage.type === 'SYSTEM'
            ? '— system update —'
            : thread.lastMessage.isOwn
              ? `You: ${thread.lastMessage.text}`
              : thread.lastMessage.text
          : null;

        return (
          <button
            key={thread.threadId}
            onClick={() => onSelect(thread.threadId)}
            className={`
              w-full text-left px-4 py-3 flex gap-3 transition-colors
              border-b border-brand-grey/10 last:border-0
              ${isSelected ? 'bg-brand-orange/10' : thread.unreadCount > 0 ? 'bg-brand-orange/5 hover:bg-brand-orange/10' : 'hover:bg-brand-grey/10'}
            `}
          >
            <img
              src={thread.otherParty.avatarUrl || '/avatar-placeholder.svg'}
              alt={thread.otherParty.name}
              className="w-10 h-10 rounded-full object-cover flex-shrink-0 border border-brand-grey"
            />
            <div className="flex-1 min-w-0">
              <div className="flex items-start justify-between gap-2">
                <p className={`text-sm font-body truncate ${thread.unreadCount > 0 ? 'font-semibold text-brand-burgundy' : 'text-brand-burgundy/80'}`}>
                  {thread.otherParty.name}
                </p>
                <div className="flex items-center gap-1.5 flex-shrink-0 mt-0.5">
                  {thread.lastMessage && (
                    <span className="text-[10px] text-brand-burgundy/40 font-body whitespace-nowrap">
                      {timeAgo(thread.lastMessage.createdAt)}
                    </span>
                  )}
                  {thread.unreadCount > 0 && (
                    <span className="min-w-[18px] h-[18px] bg-brand-orange rounded-full text-[10px] font-bold text-white flex items-center justify-center px-1">
                      {thread.unreadCount > 9 ? '9+' : thread.unreadCount}
                    </span>
                  )}
                </div>
              </div>
              <p className="text-xs text-brand-burgundy/50 font-body truncate">{thread.productTitle}</p>
              {lastMsgPreview && (
                <p className={`text-xs font-body mt-0.5 truncate ${thread.unreadCount > 0 ? 'text-brand-burgundy/70' : 'text-brand-burgundy/40'}`}>
                  {lastMsgPreview}
                </p>
              )}
            </div>
          </button>
        );
      })}
    </div>
  );
}
