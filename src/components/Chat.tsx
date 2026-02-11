'use client';

import React, { useState, useEffect } from 'react';
import { getMessagesForBooking, sendMessage } from '@/services/api';
import type { Message } from '@/types';
import { useAuth } from '@/context/AuthContext';
import ReportIssue from './ReportIssue';

interface ChatProps {
    bookingId: string;
}

const Chat: React.FC<ChatProps> = ({ bookingId }) => {
    const { user } = useAuth();
    const currentUserId = user?.id ?? '';
    const [messages, setMessages] = useState<Message[]>([]);
    const [newMessage, setNewMessage] = useState('');
    const [isReportModalOpen, setIsReportModalOpen] = useState(false);

    useEffect(() => {
        loadMessages();
        const interval = setInterval(loadMessages, 5000);
        return () => clearInterval(interval);
    }, [bookingId]);

    const loadMessages = async () => {
        const msgs = await getMessagesForBooking(bookingId);
        setMessages(msgs);
    };

    const handleSend = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!newMessage.trim()) return;

        await sendMessage(bookingId, newMessage, currentUserId);
        setNewMessage('');
        loadMessages();
    };

    return (
        <div className="flex flex-col h-[500px] border border-brand-grey rounded-xl bg-brand-white shadow-sm relative">
            <div className="p-4 border-b border-brand-grey bg-brand-white rounded-t-xl flex justify-between items-center">
                <h3 className="font-heading text-lg text-brand-burgundy">Messages</h3>
                <button onClick={() => setIsReportModalOpen(true)} className="text-xs text-brand-burgundy/40 hover:text-red-500 font-medium underline">
                    Report user
                </button>
            </div>

            <div className="flex-grow overflow-y-auto p-4 space-y-4 bg-[#F9FAFB]">
                {messages.map((msg) => {
                    const isSystem = msg.senderId === 'system';
                    const isMe = msg.senderId === currentUserId;

                    if (isSystem) {
                        return (
                            <div key={msg.id} className="flex justify-center my-2">
                                <span className="text-xs font-body bg-brand-grey/20 text-brand-burgundy/60 px-3 py-1 rounded-full">
                                    {msg.text}
                                </span>
                            </div>
                        );
                    }

                    return (
                        <div key={msg.id} className={`flex ${isMe ? 'justify-end' : 'justify-start'}`}>
                            <div className={`max-w-[80%] p-3 rounded-xl font-body text-sm ${
                                isMe
                                ? 'bg-brand-blue text-white rounded-br-none'
                                : 'bg-white border border-brand-grey text-brand-burgundy rounded-bl-none shadow-sm'
                            }`}>
                                {msg.text}
                            </div>
                        </div>
                    );
                })}
                {messages.length === 0 && (
                    <p className="text-center text-brand-burgundy/40 text-sm mt-10">No messages yet. Start the conversation!</p>
                )}
            </div>

            <div className="border-t border-brand-grey bg-brand-white rounded-b-xl">
                <form onSubmit={handleSend} className="p-3 flex gap-2">
                    <input
                        type="text"
                        value={newMessage}
                        onChange={(e) => setNewMessage(e.target.value)}
                        placeholder="Type a message..."
                        className="flex-grow p-2.5 border border-brand-grey rounded-lg font-body text-brand-burgundy focus:outline-none focus:ring-1 focus:ring-brand-orange text-sm"
                    />
                    <button
                        type="submit"
                        className="bg-brand-orange text-white p-2.5 rounded-lg hover:brightness-90 transition-all"
                    >
                        <svg className="w-5 h-5 transform rotate-90" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 19l9 2-9-18-9 18 9-2zm0 0v-8" /></svg>
                    </button>
                </form>
                <div className="bg-yellow-50 p-2 text-center border-t border-yellow-100 rounded-b-xl">
                    <p className="text-[10px] text-brand-burgundy/60">
                        Always communicate through Odd Folk to ensure you are protected by our scams and payment guarantees.
                    </p>
                </div>
            </div>

            {isReportModalOpen && (
                <ReportIssue
                    onClose={() => setIsReportModalOpen(false)}
                    type="user"
                    id="other_user"
                />
            )}
        </div>
    );
};

export default Chat;
