'use client';

import React, { useState, useEffect } from 'react';
import { getUserBookings, updateBookingStatus, fetchProducts, getLocations, getWalletBalance, getTransactions } from '../services/api';
import Chat from './Chat';
import BookingCalendar from './BookingCalendar';
import type { Booking, BookingStatus, Product } from '../types';

interface DashboardProps {
    user: { id: string; name: string; avatarUrl?: string };
    activeTab?: string;
    onLogout: () => void;
}

const StatusBadge = ({ status }: { status: string }) => {
    const styles: any = {
        pending: 'bg-brand-orange text-white',
        approved: 'bg-brand-yellow text-brand-burgundy',
        paid: 'bg-green-400 text-brand-burgundy',
        collected: 'bg-purple-400 text-white',
        returned: 'bg-brand-white text-brand-blue',
        completed: 'bg-brand-white/20 text-brand-white',
    };
    return (
        <span className={`px-3 py-1 rounded-full text-[10px] font-bold uppercase tracking-widest ${styles[status] || 'bg-gray-100'}`}>
            {status}
        </span>
    );
};

interface BookingCardProps {
    booking: Booking;
    isLister: boolean;
    onStatusChange: (bookingId: string, newStatus: BookingStatus) => void;
    currentUserId: string;
}

const BookingCard: React.FC<BookingCardProps> = ({ booking, isLister, onStatusChange, currentUserId }) => (
    <div className="bg-white border border-brand-grey rounded-3xl p-6 shadow-xl mb-6 text-brand-blue">
        <div className="flex flex-col md:flex-row gap-6">
            <div className="w-full md:w-48 flex-shrink-0">
                <img src={booking.productImage} alt={booking.productName} className="w-full h-32 object-cover rounded-2xl border border-brand-grey" />
            </div>
            
            <div className="flex-grow">
                <div className="flex justify-between items-start mb-2">
                    <h3 className="font-heading text-xl text-brand-blue">{booking.productName}</h3>
                    <StatusBadge status={booking.status} />
                </div>
                
                <div className="text-sm font-body text-brand-blue/70 mb-4">
                    <p>{booking.startDate} — {booking.endDate}</p>
                    <p className="font-bold text-brand-orange mt-1 text-lg">
                        Total: £{isLister ? booking.listerPayout.toFixed(2) : booking.totalHirerCost.toFixed(2)}
                    </p>
                </div>

                <div className="flex flex-wrap gap-3">
                    {!isLister && booking.status === 'approved' && (
                        <button 
                            onClick={() => onStatusChange(booking.id, 'paid')}
                            className="bg-brand-blue text-white px-6 py-2 rounded-xl font-body font-bold hover:brightness-110 transition-all shadow-md"
                        >
                            Pay now
                        </button>
                    )}
                    
                    {!isLister && booking.status === 'paid' && (
                        <button 
                            onClick={() => onStatusChange(booking.id, 'handover_pending')}
                            className="bg-brand-yellow text-brand-burgundy px-6 py-2 rounded-xl font-body font-bold hover:brightness-110 shadow-md"
                        >
                            Confirm collection
                        </button>
                    )}

                    {isLister && booking.status === 'pending' && (
                        <button 
                            onClick={() => onStatusChange(booking.id, 'approved')}
                            className="bg-brand-yellow text-brand-burgundy px-6 py-2 rounded-xl font-body font-bold hover:brightness-110 shadow-md"
                        >
                            Approve
                        </button>
                    )}
                </div>
            </div>
        </div>

        <div className="mt-6 border-t border-brand-grey pt-6">
            <details className="group">
                <summary className="flex items-center cursor-pointer text-brand-blue font-bold text-sm select-none uppercase tracking-widest">
                    <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 10h.01M12 10h.01M16 10h.01M9 16H5a2 2 0 01-2-2V6a2 2 0 012-2h14a2 2 0 012 2v8a2 2 0 01-2 2h-5l-5 5v-5z" /></svg>
                    View messages
                </summary>
                <div className="mt-4">
                    <Chat bookingId={booking.id} currentUserId={currentUserId} />
                </div>
            </details>
        </div>
    </div>
);

const Dashboard: React.FC<DashboardProps> = ({ user, activeTab = 'listings', onLogout }) => {
    const [currentTab, setCurrentTab] = useState(activeTab);
    const [bookings, setBookings] = useState<Booking[]>([]);
    const [myProducts, setMyProducts] = useState<Product[]>([]);
    const [isLoading, setIsLoading] = useState(true);
    const [vacationMode, setVacationMode] = useState(false);
    const [blockedDates, setBlockedDates] = useState<Date[]>([]);
    const currentUserId = user.id;

    const [locations, setLocations] = useState<any[]>([]);
    const [walletBalance, setWalletBalance] = useState({ available: 0, pending: 0, escrow: 0 });
    const [transactions, setTransactions] = useState<any[]>([]);

    useEffect(() => {
        setCurrentTab(activeTab);
    }, [activeTab]);

    useEffect(() => {
        const loadData = async () => {
            setIsLoading(true);
            try {
                const [bookingsData, allProducts, locsData, balanceData, txData] = await Promise.all([
                    getUserBookings(currentUserId),
                    fetchProducts(),
                    getLocations().catch(() => []),
                    getWalletBalance().catch(() => ({ available: 0, pending: 0, escrow: 0 })),
                    getTransactions().catch(() => []),
                ]);
                setBookings(bookingsData);
                setMyProducts(allProducts.filter(p => p.owner.id === currentUserId));
                setLocations(locsData || []);
                setWalletBalance(balanceData);
                setTransactions(txData || []);
            } catch (err) {
                console.error('Failed to load dashboard data:', err);
            }
            setIsLoading(false);
        };
        loadData();
    }, [currentUserId]);

    const handleStatusChange = async (bookingId: string, newStatus: BookingStatus) => {
        await updateBookingStatus(bookingId, newStatus);
        const bookingsData = await getUserBookings(currentUserId);
        setBookings(bookingsData);
    };

    const renderSidebar = () => {
        const tabs = [
            { id: 'listings', label: 'Listings', icon: '📦' },
            { id: 'bookings', label: 'Bookings', icon: '📅' },
            { id: 'favorites', label: 'Favourites', icon: '💙' },
            { id: 'profile', label: 'My Profile', icon: '👤' },
            { id: 'locations', label: 'Locations', icon: '📍' },
            { id: 'block-days', label: 'Block Days', icon: '🗓️' },
            { id: 'wallet', label: 'Wallet', icon: '💷' },
        ];

        return (
            <div className="bg-brand-blue rounded-[2.5rem] shadow-xl border border-white/10 overflow-hidden text-brand-white">
                <div className="p-8 border-b border-white/10">
                    <div className="flex items-center space-x-4">
                        <img src={user.avatarUrl || 'https://i.pravatar.cc/150'} alt={user.name} className="w-16 h-16 rounded-full object-cover border-2 border-white/20" />
                        <div>
                            <p className="font-heading text-xl leading-tight">{user.name}</p>
                            <p className="text-[10px] text-white/50 font-bold uppercase tracking-widest mt-1">Odd Folk Member</p>
                        </div>
                    </div>
                </div>
                <nav className="flex flex-col p-4 space-y-2">
                    {tabs.map(tab => (
                        <button
                            key={tab.id}
                            onClick={() => setCurrentTab(tab.id)}
                            className={`flex items-center px-5 py-4 rounded-2xl text-base font-bold transition-all ${
                                currentTab === tab.id 
                                ? 'bg-brand-yellow text-brand-burgundy shadow-lg' 
                                : 'text-white/80 hover:bg-white/10'
                            }`}
                        >
                            <span className="mr-4 text-xl">{tab.icon}</span>
                            {tab.label}
                        </button>
                    ))}
                    
                    <div className="h-px bg-white/10 my-4 mx-4" />

                    <button 
                        onClick={onLogout} 
                        className="flex items-center px-5 py-4 rounded-2xl text-base font-bold text-brand-orange hover:bg-white/10 transition-all"
                    >
                        <span className="mr-4 text-xl">🚪</span> Sign out
                    </button>
                    
                    <button 
                        onClick={() => setCurrentTab('delete-account')}
                        className={`flex items-center px-5 py-4 rounded-2xl text-sm font-bold transition-all ${
                            currentTab === 'delete-account' 
                            ? 'bg-red-500 text-white' 
                            : 'text-red-400/60 hover:text-red-400 hover:bg-red-400/10'
                        }`}
                    >
                        <span className="mr-4 text-lg">🗑️</span> Delete Account
                    </button>
                </nav>
            </div>
        );
    };

    const renderContent = () => {
        if (isLoading) {
            return <div className="text-center py-20 font-heading text-brand-blue animate-pulse text-xl">Loading your space...</div>;
        }

        switch (currentTab) {
            case 'listings':
                return (
                    <div className="space-y-6">
                        <h2 className="font-heading text-3xl text-brand-blue mb-8">Manage Listings</h2>
                        <div className="grid gap-4">
                            {myProducts.map(p => (
                                <div key={p.id} className="bg-white border border-brand-grey rounded-2xl p-6 flex gap-6 items-center shadow-md">
                                    <img src={p.imageUrl} className="w-24 h-24 rounded-xl object-cover" />
                                    <div className="flex-grow">
                                        <h3 className="font-heading text-xl text-brand-blue">{p.name}</h3>
                                        <p className="text-brand-orange font-bold text-lg">£{p.pricePerDay} / day</p>
                                    </div>
                                    <div className="flex gap-2">
                                        <button className="bg-brand-blue/5 hover:bg-brand-blue/10 px-6 py-2 rounded-xl text-xs font-bold uppercase text-brand-blue transition-colors">Edit</button>
                                        <button className="text-red-500 hover:bg-red-50 px-3 py-2 rounded-xl transition-colors">
                                            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" /></svg>
                                        </button>
                                    </div>
                                </div>
                            ))}
                        </div>
                    </div>
                );

            case 'bookings':
                return (
                    <>
                        <h2 className="font-heading text-3xl text-brand-blue mb-8">Your Bookings</h2>
                        {bookings.filter(b => b.hirerId === currentUserId).map(b => (
                            <BookingCard key={b.id} booking={b} isLister={false} onStatusChange={handleStatusChange} currentUserId={currentUserId} />
                        ))}
                    </>
                );

            case 'locations':
                return (
                    <div className="space-y-6">
                        <div className="flex justify-between items-center mb-8">
                            <h2 className="font-heading text-3xl text-brand-blue">My Collection Points</h2>
                            <button className="bg-brand-blue text-white font-heading px-6 py-2 rounded-xl text-sm hover:brightness-110 shadow-lg transition-all">+ Add New</button>
                        </div>
                        <div className="grid gap-4">
                            {locations.length > 0 ? locations.map((loc: any) => (
                                <div key={loc.id} className="bg-white border border-brand-grey rounded-3xl p-8 flex justify-between items-center shadow-md">
                                    <div>
                                        <div className="flex items-center gap-3 mb-2">
                                            <span className="font-heading text-2xl text-brand-blue capitalize">{loc.name}</span>
                                            <span className="text-[10px] bg-brand-blue/10 text-brand-blue px-3 py-1 rounded-full font-bold uppercase tracking-wider">{loc.type || 'Other'}</span>
                                        </div>
                                        <p className="text-brand-blue/60 text-lg font-body">{loc.address}, {loc.postcode} {loc.city}</p>
                                    </div>
                                    <div className="flex gap-4">
                                        <button className="text-brand-blue font-bold hover:underline transition-all">Edit</button>
                                        <button className="text-red-500 font-bold hover:underline transition-all">Remove</button>
                                    </div>
                                </div>
                            )) : (
                                <p className="text-brand-blue/50 italic py-8 text-center">No collection points added yet. Add one to make it easier for hirers to collect items.</p>
                            )}
                        </div>
                    </div>
                );

            case 'block-days':
                return (
                    <div className="space-y-8">
                        <h2 className="font-heading text-3xl text-brand-blue">Block Days & Vacation</h2>
                        
                        <div className="bg-brand-blue text-white rounded-3xl p-10 flex items-center justify-between shadow-2xl">
                            <div className="max-w-md">
                                <h3 className="font-heading text-2xl mb-2">Vacation Mode</h3>
                                <p className="text-white/70 leading-relaxed">Instantly hide all your listings from search and disable booking requests while you're away.</p>
                            </div>
                            <button 
                                onClick={() => setVacationMode(!vacationMode)}
                                className={`w-20 h-10 rounded-full transition-all relative ${vacationMode ? 'bg-brand-yellow' : 'bg-white/20'}`}
                            >
                                <div className={`absolute top-1 w-8 h-8 rounded-full bg-brand-blue transition-all ${vacationMode ? 'left-11' : 'left-1'}`} />
                            </button>
                        </div>

                        <div className="bg-white border border-brand-grey rounded-[2.5rem] p-10 shadow-xl">
                            <h3 className="font-heading text-2xl text-brand-blue mb-4">Block Specific Dates</h3>
                            <p className="text-brand-blue/60 mb-10">Select dates to mark them as unavailable for rentals without hiding your entire collection.</p>
                            <div className="max-w-md mx-auto scale-110 mb-12">
                                <BookingCalendar 
                                    initialStart={null} 
                                    initialEnd={null} 
                                    onChange={(s) => {
                                        if (s) setBlockedDates([...blockedDates, s]);
                                    }} 
                                />
                            </div>
                            <div className="flex flex-wrap gap-2 pt-6 border-t border-brand-grey">
                                {blockedDates.length > 0 ? (
                                    blockedDates.map((d, i) => (
                                        <span key={i} className="bg-brand-blue text-white text-xs px-4 py-2 rounded-full flex items-center gap-2 shadow-sm">
                                            {d.toLocaleDateString('en-GB')}
                                            <button onClick={() => setBlockedDates(blockedDates.filter((_, idx) => idx !== i))} className="hover:text-brand-yellow transition-colors">
                                                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" /></svg>
                                            </button>
                                        </span>
                                    ))
                                ) : (
                                    <p className="text-sm italic text-brand-blue/40">No individual dates blocked.</p>
                                )}
                            </div>
                        </div>
                    </div>
                );

            case 'wallet':
                return (
                    <div className="space-y-8">
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                            <div className="bg-brand-blue text-white rounded-[2.5rem] p-10 shadow-2xl relative overflow-hidden group">
                                <div className="absolute top-0 right-0 w-32 h-32 bg-white/5 rounded-full -mr-16 -mt-16 group-hover:scale-150 transition-transform duration-700"></div>
                                <p className="text-[10px] font-bold text-brand-yellow uppercase tracking-widest mb-3">Available Payout</p>
                                <h3 className="font-heading text-5xl">£{walletBalance.available.toFixed(2)}</h3>
                                <button className="mt-8 w-full bg-brand-yellow text-brand-burgundy py-4 rounded-2xl font-heading text-lg hover:brightness-105 transition-all shadow-lg">Transfer to Bank</button>
                            </div>
                            <div className="bg-white border border-brand-grey rounded-[2.5rem] p-10 shadow-xl">
                                <p className="text-[10px] font-bold text-brand-blue/40 uppercase tracking-widest mb-3">Pending Escrow</p>
                                <h3 className="font-heading text-5xl text-brand-blue">£{walletBalance.escrow.toFixed(2)}</h3>
                                <p className="text-sm text-brand-blue/50 mt-4 leading-relaxed italic">Funds are held until 48 hours after rental returns are confirmed.</p>
                            </div>
                        </div>

                        <div className="bg-white border border-brand-grey rounded-[2.5rem] overflow-hidden shadow-xl">
                            <div className="p-8 border-b border-brand-grey flex justify-between items-center bg-gray-50/50">
                                <h3 className="font-heading text-2xl text-brand-blue">Payout History</h3>
                                <button className="text-brand-blue font-bold text-sm hover:underline">Download Statements</button>
                            </div>
                            <div className="overflow-x-auto">
                                <table className="w-full text-left">
                                    <thead>
                                        <tr className="bg-brand-blue/5 text-brand-blue/40 font-heading text-[10px] uppercase tracking-widest">
                                            <th className="px-8 py-4">Date</th>
                                            <th className="px-8 py-4">Type</th>
                                            <th className="px-8 py-4">Amount</th>
                                            <th className="px-8 py-4 text-right">Status</th>
                                        </tr>
                                    </thead>
                                    <tbody className="divide-y divide-brand-grey">
                                        {transactions.length > 0 ? transactions.map((tx: any) => (
                                            <tr key={tx.id} className="hover:bg-brand-blue/5 transition-colors group">
                                                <td className="px-8 py-6 text-sm text-brand-blue/60">{new Date(tx.createdAt).toLocaleDateString()}</td>
                                                <td className="px-8 py-6 font-bold text-brand-blue">{tx.type}</td>
                                                <td className="px-8 py-6 font-heading text-brand-orange text-lg">£{tx.amount.toFixed(2)}</td>
                                                <td className="px-8 py-6 text-right">
                                                    <span className={`px-3 py-1 rounded-full text-xs font-bold ${tx.status === 'COMPLETED' ? 'bg-green-100 text-green-700' : 'bg-yellow-100 text-yellow-700'}`}>
                                                        {tx.status}
                                                    </span>
                                                </td>
                                            </tr>
                                        )) : (
                                            <tr>
                                                <td colSpan={4} className="px-8 py-12 text-center text-brand-blue/40 italic">No transactions yet</td>
                                            </tr>
                                        )}
                                    </tbody>
                                </table>
                            </div>
                        </div>
                    </div>
                );

            case 'profile':
                return (
                    <div className="bg-white border border-brand-grey rounded-[2.5rem] p-10 shadow-xl">
                        <h2 className="font-heading text-3xl text-brand-blue mb-10">Your Profile Information</h2>
                        <div className="space-y-12">
                            {/* Profile Photo Section */}
                            <div className="flex flex-col md:flex-row items-center gap-8 pb-8 border-b border-brand-grey">
                                <div className="relative group">
                                    <img
                                      src={user.avatarUrl || 'https://i.pravatar.cc/150'}
                                      alt={user.name}
                                      className="w-32 h-32 rounded-full object-cover border-4 border-brand-blue/10 group-hover:border-brand-blue transition-all"
                                    />
                                    <label className="absolute bottom-0 right-0 bg-brand-blue text-white p-2 rounded-full cursor-pointer shadow-lg hover:scale-110 transition-transform">
                                        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 9a2 2 0 012-2h.93a2 2 0 001.664-.89l.812-1.22A2 2 0 0110.07 4h3.86a2 2 0 011.664.89l.812-1.22A2 2 0 0018.07 7H19a2 2 0 012 2v9a2 2 0 01-2 2H5a2 2 0 01-2-2V9z" /></svg>
                                        <input type="file" className="hidden" accept="image/*" />
                                    </label>
                                </div>
                                <div className="text-center md:text-left">
                                    <h4 className="font-heading text-xl text-brand-blue">Profile Photo</h4>
                                    <p className="text-sm text-brand-blue/50 max-w-xs mt-1">Make a great first impression. We recommend a clear, friendly photo of yourself.</p>
                                    <button className="mt-4 text-brand-blue font-bold text-sm hover:underline">Remove photo</button>
                                </div>
                            </div>

                            {/* Form Fields */}
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                                <div className="space-y-2">
                                    <label className="text-[10px] uppercase font-bold text-brand-blue/40 tracking-widest ml-1">Username</label>
                                    <div className="relative">
                                        <span className="absolute left-4 top-1/2 -translate-y-1/2 text-brand-blue/30 font-bold">@</span>
                                        <input type="text" defaultValue="jamiefolk" className="w-full pl-9 pr-4 py-4 bg-brand-blue/5 border border-brand-grey rounded-2xl font-bold text-brand-blue focus:ring-1 focus:ring-brand-blue outline-none transition-all" />
                                    </div>
                                </div>
                                <div className="space-y-2">
                                    <label className="text-[10px] uppercase font-bold text-brand-blue/40 tracking-widest ml-1">Full Name</label>
                                    <input type="text" defaultValue={user.name} className="w-full p-4 bg-brand-blue/5 border border-brand-grey rounded-2xl font-bold text-brand-blue focus:ring-1 focus:ring-brand-blue outline-none transition-all" />
                                </div>
                                
                                <div className="space-y-2 md:col-span-2">
                                    <label className="text-[10px] uppercase font-bold text-brand-blue/40 tracking-widest ml-1">Bio</label>
                                    <textarea 
                                        rows={4}
                                        placeholder="Tell other folk a bit about yourself, your style, or what you collect..."
                                        className="w-full p-4 bg-brand-blue/5 border border-brand-grey rounded-2xl font-bold text-brand-blue focus:ring-1 focus:ring-brand-blue outline-none transition-all resize-none"
                                        defaultValue="London-based stylist with a passion for mid-century modern furniture and rare 70s finds. I've been collecting props for 10 years and love seeing them come to life in new projects."
                                    />
                                    <p className="text-right text-[10px] text-brand-blue/30 font-bold uppercase tracking-tight">Max 300 characters</p>
                                </div>

                                <div className="space-y-2">
                                    <label className="text-[10px] uppercase font-bold text-brand-blue/40 tracking-widest ml-1">Phone Number</label>
                                    <input type="tel" defaultValue="+44 7700 900077" className="w-full p-4 bg-brand-blue/5 border border-brand-grey rounded-2xl font-bold text-brand-blue focus:ring-1 focus:ring-brand-blue outline-none transition-all" />
                                </div>
                                <div className="space-y-2 md:col-span-2">
                                    <label className="text-[10px] uppercase font-bold text-brand-blue/40 tracking-widest ml-1">Email Address</label>
                                    <input type="email" defaultValue="jamie@oddfolk.co.uk" className="w-full p-4 bg-brand-blue/5 border border-brand-grey rounded-2xl font-bold text-brand-blue focus:ring-1 focus:ring-brand-blue outline-none transition-all" />
                                </div>
                            </div>
                            <div className="pt-6 border-t border-brand-grey flex justify-end">
                                <button className="bg-brand-blue text-white font-heading px-12 py-4 rounded-2xl hover:brightness-110 shadow-xl transition-all active:scale-95">Save Profile</button>
                            </div>
                        </div>
                    </div>
                );

            case 'delete-account':
                return (
                    <div className="max-w-xl mx-auto py-12 text-center bg-white border border-brand-grey rounded-[2.5rem] p-12 shadow-xl animate-fade-in">
                        <div className="w-24 h-24 bg-red-50 text-red-500 rounded-full flex items-center justify-center mx-auto mb-8 shadow-inner">
                            <svg className="w-12 h-12" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" /></svg>
                        </div>
                        <h2 className="font-heading text-4xl text-brand-blue mb-4">Are you sure?</h2>
                        <p className="font-body text-brand-blue/60 mb-10 text-lg leading-relaxed">
                            Deleting your account is permanent. You will lose all your listings, rental history, and any saved favourites. Any pending payouts will be voided.
                        </p>
                        <div className="space-y-4">
                            <button className="w-full bg-red-500 text-white py-5 rounded-[1.5rem] font-heading text-xl hover:bg-red-600 shadow-2xl transition-all active:scale-95">Confirm Deletion</button>
                            <button onClick={() => setCurrentTab('profile')} className="w-full text-brand-blue font-bold text-lg hover:underline transition-all">Nevermind, keep my account</button>
                        </div>
                    </div>
                );

            default:
                return null;
        }
    };

    return (
        <div className="min-h-screen bg-brand-white py-12">
            <div className="container mx-auto px-4 sm:px-6 lg:px-8 max-w-7xl">
                <div className="grid grid-cols-1 lg:grid-cols-12 gap-12">
                    <div className="lg:col-span-3">
                        {renderSidebar()}
                    </div>
                    <div className="lg:col-span-9 animate-fade-in">
                        {renderContent()}
                    </div>
                </div>
            </div>
        </div>
    );
};

export default Dashboard;