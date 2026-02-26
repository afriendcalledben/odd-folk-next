'use client';

import React, { useState, useEffect, useRef } from 'react';
import toast from 'react-hot-toast';
import { getUserBookings, updateBookingStatus, fetchProducts, getLocations, getWalletBalance, getTransactions, updateUserProfile, uploadAvatar, removeAvatar } from '../services/api';
import { useAuth } from '@/context/AuthContext';
import PhoneInput, { validatePhone } from '@/components/PhoneInput';
import { Input, Textarea, Button } from '@/components/ui';
import Chat from './Chat';
import AvatarCropModal from './AvatarCropModal';
import BookingCalendar from './BookingCalendar';
import type { Booking, BookingStatus, Product } from '../types';

interface DashboardProps {
    user: { id: string; name: string; avatarUrl?: string; username?: string; bio?: string; phone?: string; email?: string };
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
    const { refreshUser } = useAuth();
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

    // Profile form state
    const [localAvatarUrl, setLocalAvatarUrl] = useState<string | undefined>(user.avatarUrl);
    const [isUploadingAvatar, setIsUploadingAvatar] = useState(false);
    const [profileName, setProfileName] = useState(user.name || '');
    const [profileUsername, setProfileUsername] = useState(user.username || '');
    const [profileBio, setProfileBio] = useState(user.bio || '');
    const [profilePhone, setProfilePhone] = useState(user.phone || '');
    const [profileErrors, setProfileErrors] = useState<{ username?: string; phone?: string }>({});
    const [isSavingProfile, setIsSavingProfile] = useState(false);
    const avatarInputRef = useRef<HTMLInputElement>(null);
    const [cropFile, setCropFile] = useState<File | null>(null);

    type UsernameStatus = 'idle' | 'checking' | 'available' | 'taken';
    const [profileUsernameStatus, setProfileUsernameStatus] = useState<UsernameStatus>('idle');
    const profileUsernameDebounceRef = useRef<ReturnType<typeof setTimeout> | null>(null);

    useEffect(() => {
        setLocalAvatarUrl(user.avatarUrl);
        setProfileName(user.name || '');
        setProfileUsername(user.username || '');
        setProfileBio(user.bio || '');
        setProfilePhone(user.phone || '');
    }, [user.avatarUrl, user.name, user.username, user.bio, user.phone]);

    // Debounced username availability check (skip if unchanged from saved username)
    const USERNAME_RE = /^[a-zA-Z0-9_-]{3,30}$/;
    useEffect(() => {
        if (profileUsernameDebounceRef.current) clearTimeout(profileUsernameDebounceRef.current);

        const unchanged = profileUsername.toLowerCase() === (user.username || '').toLowerCase();
        if (unchanged || !profileUsername || !USERNAME_RE.test(profileUsername)) {
            setProfileUsernameStatus('idle');
            return;
        }

        setProfileUsernameStatus('checking');
        profileUsernameDebounceRef.current = setTimeout(async () => {
            try {
                const res = await fetch(`/api/users/check-username?username=${encodeURIComponent(profileUsername.toLowerCase())}`);
                const json = await res.json();
                setProfileUsernameStatus(json.data?.available ? 'available' : 'taken');
            } catch {
                setProfileUsernameStatus('idle');
            }
        }, 400);

        return () => {
            if (profileUsernameDebounceRef.current) clearTimeout(profileUsernameDebounceRef.current);
        };
    }, [profileUsername, user.username]);

    const handleAvatarChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (!file) return;
        if (avatarInputRef.current) avatarInputRef.current.value = ''; // allow re-selecting same file
        setCropFile(file);
    };

    const handleCropConfirm = async (croppedFile: File) => {
        setIsUploadingAvatar(true);
        try {
            const newUrl = await uploadAvatar(croppedFile);
            setLocalAvatarUrl(newUrl);
            await refreshUser();
            toast.success('Profile photo updated');
        } catch (err: unknown) {
            const msg = err instanceof Error ? err.message : 'Upload failed';
            console.error('[avatar upload]', msg);
            toast.error(msg);
        } finally {
            setIsUploadingAvatar(false);
            setCropFile(null);
        }
    };

    const handleCropCancel = () => setCropFile(null);

    const handleRemoveAvatar = async () => {
        setIsUploadingAvatar(true);
        try {
            await removeAvatar();
            setLocalAvatarUrl(undefined);
            await refreshUser();
            toast.success('Profile photo removed');
        } catch {
            toast.error('Could not remove photo. Please try again.');
        } finally {
            setIsUploadingAvatar(false);
        }
    };

    const handleSaveProfile = async (e: React.FormEvent) => {
        e.preventDefault();
        const newErrors: { username?: string; phone?: string } = {};
        if (profileUsername && !USERNAME_RE.test(profileUsername)) {
            newErrors.username = 'Username must be 3–30 characters: letters, numbers, _ or -';
        }
        if (profileUsernameStatus === 'taken') {
            newErrors.username = 'That username is already taken';
        }
        if (profileUsernameStatus === 'checking') {
            return;
        }
        if (profilePhone && !validatePhone(profilePhone)) {
            newErrors.phone = 'Enter a valid phone number';
        }
        if (Object.keys(newErrors).length > 0) {
            setProfileErrors(newErrors);
            return;
        }
        setProfileErrors({});
        setIsSavingProfile(true);
        try {
            await updateUserProfile({
                name: profileName || undefined,
                username: profileUsername ? profileUsername.toLowerCase() : undefined,
                bio: profileBio.trim() || undefined,
                phone: profilePhone || undefined,
            });
            await refreshUser();
            toast.success('Profile updated');
        } catch (err: unknown) {
            const message = err instanceof Error ? err.message : 'Could not save profile';
            if (message.toLowerCase().includes('username')) {
                setProfileErrors(prev => ({ ...prev, username: 'That username is already taken' }));
            } else {
                toast.error(message);
            }
        } finally {
            setIsSavingProfile(false);
        }
    };

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
                        <img src={user.avatarUrl || '/avatar-placeholder.svg'} alt={user.name} className="w-16 h-16 rounded-full object-cover border-2 border-white/20" />
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

            case 'favorites':
                return (
                    <div className="space-y-6">
                        <h2 className="font-heading text-3xl text-brand-blue mb-8">Your Favourites</h2>
                        <div className="bg-white border border-brand-grey rounded-[2.5rem] p-12 shadow-xl text-center">
                            <svg className="w-16 h-16 text-brand-blue/20 mx-auto mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z" />
                            </svg>
                            <p className="font-heading text-xl text-brand-blue/50">Items you heart will appear here</p>
                            <p className="text-sm text-brand-blue/40 mt-2">Browse the marketplace and tap the heart icon on any item to save it.</p>
                        </div>
                    </div>
                );

            case 'profile': {
                const bioWords = profileBio.trim() === '' ? 0 : profileBio.trim().split(/\s+/).length;
                const bioOverLimit = bioWords > 200;
                return (
                    <div className="bg-white border border-brand-grey rounded-[2.5rem] p-10 shadow-xl">
                        <h2 className="font-heading text-3xl text-brand-burgundy mb-10">Your Profile Information</h2>
                        <form onSubmit={handleSaveProfile} noValidate>
                          <div className="space-y-12">
                            {/* Profile Photo Section */}
                            <div className="flex flex-col md:flex-row items-center gap-8 pb-8 border-b border-brand-grey">
                                <div className="relative group">
                                    <img
                                      src={localAvatarUrl || '/avatar-placeholder.svg'}
                                      alt={user.name}
                                      className="w-32 h-32 rounded-full object-cover border-4 border-brand-orange/20 group-hover:border-brand-orange transition-all"
                                    />
                                    <label className="absolute bottom-0 right-0 bg-brand-orange text-white p-2 rounded-full cursor-pointer shadow-lg hover:scale-110 transition-transform">
                                        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 9a2 2 0 012-2h.93a2 2 0 001.664-.89l.812-1.22A2 2 0 0110.07 4h3.86a2 2 0 011.664.89l.812-1.22A2 2 0 0118.07 7H19a2 2 0 012 2v9a2 2 0 01-2 2H5a2 2 0 01-2-2V9z" /></svg>
                                        <input ref={avatarInputRef} type="file" className="hidden" accept="image/*" onChange={handleAvatarChange} disabled={isUploadingAvatar} />
                                    </label>
                                </div>
                                <div className="text-center md:text-left">
                                    <h4 className="font-heading text-xl text-brand-burgundy">Profile Photo</h4>
                                    <p className="text-sm text-brand-burgundy/50 max-w-xs mt-1">{isUploadingAvatar ? 'Uploading…' : 'Make a great first impression. We recommend a clear, friendly photo of yourself.'}</p>
                                    <button
                                        type="button"
                                        onClick={handleRemoveAvatar}
                                        disabled={!localAvatarUrl || isUploadingAvatar}
                                        className="mt-4 text-red-500 font-bold text-sm hover:underline disabled:opacity-40 disabled:cursor-not-allowed disabled:no-underline"
                                    >
                                        Remove photo
                                    </button>
                                </div>
                            </div>

                            {/* Form Fields */}
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                                <div>
                                    <Input
                                        label="Username"
                                        type="text"
                                        value={profileUsername}
                                        onChange={e => {
                                            setProfileUsername(e.target.value);
                                            if (profileErrors.username) setProfileErrors(prev => ({ ...prev, username: undefined }));
                                        }}
                                        prefix="@"
                                        error={profileErrors.username}
                                        spellCheck={false}
                                    />
                                    <div className="mt-1 h-4 flex items-center gap-1.5">
                                        {profileUsernameStatus === 'checking' && (
                                            <>
                                                <svg className="w-3.5 h-3.5 animate-spin text-brand-burgundy/40" fill="none" viewBox="0 0 24 24">
                                                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                                                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v4a4 4 0 00-4 4H4z" />
                                                </svg>
                                                <span className="text-xs text-brand-burgundy/40">Checking…</span>
                                            </>
                                        )}
                                        {profileUsernameStatus === 'available' && (
                                            <>
                                                <svg className="w-3.5 h-3.5 text-green-500 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M5 13l4 4L19 7" />
                                                </svg>
                                                <span className="text-xs text-green-600 font-medium">Username available!</span>
                                            </>
                                        )}
                                        {profileUsernameStatus === 'taken' && (
                                            <>
                                                <svg className="w-3.5 h-3.5 text-red-500 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M6 18L18 6M6 6l12 12" />
                                                </svg>
                                                <span className="text-xs text-red-500 font-medium">Username taken.</span>
                                            </>
                                        )}
                                    </div>
                                </div>
                                <Input
                                    label="Full Name"
                                    type="text"
                                    value={profileName}
                                    onChange={e => setProfileName(e.target.value)}
                                />

                                <div className="md:col-span-2">
                                    <Textarea
                                        label="Bio"
                                        optional
                                        rows={4}
                                        value={profileBio}
                                        onChange={e => setProfileBio(e.target.value)}
                                        placeholder="Tell other folk a bit about yourself, your style, or what you collect..."
                                        hint={
                                            <p className={`text-right text-xs font-bold ${bioOverLimit ? 'text-red-500' : 'text-brand-burgundy/40'}`}>
                                                {bioWords} / 200 words
                                            </p>
                                        }
                                    />
                                </div>

                                <div>
                                    <label className="block font-body text-sm font-bold text-brand-burgundy mb-1">Phone Number</label>
                                    <PhoneInput
                                        value={profilePhone}
                                        onChange={v => {
                                            setProfilePhone(v);
                                            if (profileErrors.phone) setProfileErrors(prev => ({ ...prev, phone: undefined }));
                                        }}
                                        error={profileErrors.phone}
                                    />
                                </div>
                                <div className="md:col-span-2">
                                    <Input
                                        label="Email Address"
                                        type="email"
                                        value={user.email || ''}
                                        readOnly
                                        className="opacity-50 cursor-not-allowed"
                                    />
                                </div>
                            </div>
                            <div className="pt-6 border-t border-brand-grey flex justify-end">
                                <Button
                                    type="submit"
                                    isLoading={isSavingProfile}
                                    disabled={bioOverLimit || profileUsernameStatus === 'taken' || profileUsernameStatus === 'checking'}
                                    size="lg"
                                >
                                    {isSavingProfile ? 'Saving…' : 'Save Profile'}
                                </Button>
                            </div>
                          </div>
                        </form>
                    </div>
                );
            }

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

            {cropFile && (
                <AvatarCropModal
                    file={cropFile}
                    onConfirm={handleCropConfirm}
                    onCancel={handleCropCancel}
                />
            )}
        </div>
    );
};

export default Dashboard;