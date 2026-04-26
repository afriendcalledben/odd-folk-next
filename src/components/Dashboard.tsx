'use client';

import React, { useState, useEffect, useRef } from 'react';
import dynamic from 'next/dynamic';
import toast from 'react-hot-toast';
import Link from 'next/link';
import { Package, CalendarDays, Heart, User, MapPinned, PiggyBank, LogOut, Trash2, Timer, Star } from 'lucide-react';
import { getUserBookings, updateBookingStatus, cancelBooking, declineBooking, fetchProducts, getLocations, getWalletBalance, getTransactions, updateUserProfile, uploadAvatar, removeAvatar, deleteProduct, createLocation, updateLocation, deleteLocation, getUserFavorites, updateVacationMode, updateBlockedDates, getBlockedDates, type BlockedRange } from '../services/api';
import ProductGrid from './ProductGrid';
import { useAuth } from '@/context/AuthContext';
import PhoneInput, { validatePhone } from '@/components/PhoneInput';
import { Input, Textarea, Button } from '@/components/ui';
import BookingTracker from './BookingTracker';
import AvatarCropModal from './AvatarCropModal';
import BookingCalendar from './BookingCalendar';
import ReviewModal from './ReviewModal';
import type { Booking, BookingStatus, Product } from '../types';

const LocationPicker = dynamic(() => import('./LocationPicker'), { ssr: false });

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
    onDecline: (booking: Booking) => void;
    onCancel: (booking: Booking) => void;
    onReview: (booking: Booking) => void;
    currentUserId: string;
}

const fmtDate = (d: string) =>
    new Date(d).toLocaleDateString('en-GB', { day: 'numeric', month: 'short', year: 'numeric' });

function getDeadlineCountdown(responseDeadlineAt: string | undefined): { hoursRemaining: number; label: string; colour: string } | null {
    if (!responseDeadlineAt) return null;
    const ms = new Date(responseDeadlineAt).getTime() - Date.now();
    if (ms <= 0) return null;
    const hoursRemaining = Math.ceil(ms / (1000 * 60 * 60));
    if (hoursRemaining <= 3) {
        return { hoursRemaining, label: `${hoursRemaining}h to respond — act now`, colour: 'bg-red-100 text-red-700 border border-red-200' };
    }
    if (hoursRemaining <= 12) {
        return { hoursRemaining, label: `${hoursRemaining}h left to respond`, colour: 'bg-amber-100 text-amber-700 border border-amber-200' };
    }
    if (hoursRemaining <= 24) {
        return { hoursRemaining, label: `${hoursRemaining}h left to respond`, colour: 'bg-yellow-50 text-yellow-700 border border-yellow-200' };
    }
    return { hoursRemaining, label: `${hoursRemaining}h left to respond`, colour: 'bg-brand-grey/20 text-brand-burgundy/60 border border-brand-grey/30' };
}

const BookingCard: React.FC<BookingCardProps> = ({ booking, isLister, onStatusChange, onDecline, onCancel, onReview, currentUserId }) => {
    const countdown = isLister && booking.status === 'pending' ? getDeadlineCountdown(booking.responseDeadlineAt) : null;
    return (
    <div className="bg-white border border-brand-grey rounded-3xl p-6 shadow-xl mb-6 text-brand-blue">
        <div className="flex flex-col md:flex-row gap-6">
            <div className="w-full md:w-48 flex-shrink-0">
                <img src={booking.productImage} alt={booking.productName} className="w-full h-32 object-cover rounded-2xl border border-brand-grey" />
            </div>

            <div className="flex-grow">
                <div className="flex justify-between items-start mb-2">
                    <h3 className="font-heading text-xl text-brand-blue">{booking.productName}</h3>
                </div>

                {countdown && (
                    <span className={`inline-flex items-center gap-1.5 text-xs font-bold px-3 py-1 rounded-full mb-3 ${countdown.colour}`}>
                        <Timer className="w-3 h-3 flex-shrink-0" />{countdown.label}
                    </span>
                )}

                <div className="text-sm font-body text-brand-blue/70 mb-2">
                    <p>{fmtDate(booking.startDate)} — {fmtDate(booking.endDate)}</p>
                    <p className="font-bold text-brand-orange mt-1 text-lg">
                        Total: £{isLister ? booking.listerPayout.toFixed(2) : booking.totalHirerCost.toFixed(2)}
                    </p>
                </div>

                <BookingTracker status={booking.status} />

                <div className="flex flex-wrap gap-3 mt-2">
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
                        <>
                            <button
                                onClick={() => onStatusChange(booking.id, 'approved')}
                                className="bg-brand-yellow text-brand-burgundy px-6 py-2 rounded-xl font-body font-bold hover:brightness-110 shadow-md"
                            >
                                Accept
                            </button>
                            <button
                                onClick={() => onDecline(booking)}
                                className="bg-red-50 text-red-600 border border-red-200 px-6 py-2 rounded-xl font-body font-bold hover:bg-red-100 transition-colors"
                            >
                                Decline
                            </button>
                        </>
                    )}

                    {isLister && booking.status === 'approved' && (
                        <button
                            onClick={() => onCancel(booking)}
                            className="bg-red-50 text-red-600 border border-red-200 px-6 py-2 rounded-xl font-body font-bold hover:bg-red-100 transition-colors"
                        >
                            Cancel booking
                        </button>
                    )}

                    {booking.status === 'completed' && (
                        booking.hasReviewed ? (
                            <span className="flex items-center gap-1.5 text-sm font-body text-brand-burgundy/50">
                                <Star className="w-3.5 h-3.5 text-brand-orange fill-brand-orange" /> Review submitted
                            </span>
                        ) : (
                            <button
                                onClick={() => onReview(booking)}
                                className="inline-flex items-center gap-2 bg-brand-orange/10 text-brand-orange border border-brand-orange/30 px-6 py-2 rounded-xl font-body font-bold hover:bg-brand-orange/20 transition-colors"
                            >
                                <Star className="w-4 h-4" /> Leave a review
                            </button>
                        )
                    )}
                </div>
            </div>
        </div>

        {booking.threadId && (
            <div className="mt-6 border-t border-brand-grey pt-4">
                <Link
                    href={`/inbox?t=${booking.threadId}`}
                    className="inline-flex items-center gap-2 text-brand-blue font-bold text-sm uppercase tracking-widest hover:text-brand-orange transition-colors"
                >
                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 10h.01M12 10h.01M16 10h.01M9 16H5a2 2 0 01-2-2V6a2 2 0 012-2h14a2 2 0 012 2v8a2 2 0 01-2 2h-5l-5 5v-5z" /></svg>
                    View messages
                </Link>
            </div>
        )}
    </div>
    );
};

interface BookingActionModalProps {
    action: 'decline' | 'cancel';
    booking: Booking;
    onConfirm: (reason: string) => void;
    onClose: () => void;
    isSubmitting: boolean;
}

const BookingActionModal: React.FC<BookingActionModalProps> = ({ action, booking, onConfirm, onClose, isSubmitting }) => {
    const [reason, setReason] = useState('');
    const isDecline = action === 'decline';
    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4">
            <div className="bg-white rounded-2xl p-8 max-w-sm w-full shadow-2xl">
                <h3 className="font-heading text-xl text-brand-blue mb-2">
                    {isDecline ? 'Decline booking request?' : 'Cancel booking?'}
                </h3>
                <p className="font-body text-brand-blue/70 text-sm mb-5">
                    {isDecline
                        ? `This will decline ${booking.productName} and notify the renter.`
                        : `This will cancel the approved booking for ${booking.productName} and notify the renter.`}
                </p>
                <label className="block font-body text-sm font-medium text-brand-burgundy mb-1">
                    Reason <span className="text-brand-burgundy/40 font-normal">(optional)</span>
                </label>
                <textarea
                    value={reason}
                    onChange={e => setReason(e.target.value)}
                    rows={3}
                    placeholder={isDecline ? 'e.g. Dates no longer available' : 'e.g. Unforeseen circumstances'}
                    className="w-full p-3 bg-white border border-brand-grey rounded-xl font-body text-sm text-brand-burgundy placeholder:text-brand-burgundy/40 focus:outline-none focus:ring-2 focus:ring-brand-orange/30 resize-none mb-5"
                />
                <div className="flex gap-3">
                    <button
                        onClick={onClose}
                        disabled={isSubmitting}
                        className="flex-1 px-4 py-2.5 rounded-xl border border-brand-grey font-body font-medium text-brand-blue hover:bg-brand-grey/30 transition-colors disabled:opacity-50"
                    >
                        Go back
                    </button>
                    <button
                        onClick={() => onConfirm(reason)}
                        disabled={isSubmitting}
                        className="flex-1 px-4 py-2.5 rounded-xl bg-red-500 text-white font-body font-medium hover:bg-red-600 transition-colors disabled:opacity-50"
                    >
                        {isSubmitting ? 'Submitting…' : isDecline ? 'Decline booking' : 'Cancel booking'}
                    </button>
                </div>
            </div>
        </div>
    );
};

const Dashboard: React.FC<DashboardProps> = ({ user, activeTab = 'listings', onLogout }) => {
    const { refreshUser, favoriteIds, toggleFavorite, isLoggedIn } = useAuth();
    const [currentTab, setCurrentTab] = useState(activeTab);
    const [bookingSubTab, setBookingSubTab] = useState<'made' | 'received'>('made');
    const [bookings, setBookings] = useState<Booking[]>([]);
    const [myProducts, setMyProducts] = useState<Product[]>([]);
    const [favoriteProducts, setFavoriteProducts] = useState<Product[]>([]);
    const [favoritesLoading, setFavoritesLoading] = useState(false);
    const [isLoading, setIsLoading] = useState(true);
    const [vacationMode, setVacationMode] = useState(false);
    const [blockedRanges, setBlockedRanges] = useState<BlockedRange[]>([]);
    const [rangeStart, setRangeStart] = useState<Date | null>(null);
    const [rangeEnd, setRangeEnd] = useState<Date | null>(null);
    const [isSavingDates, setIsSavingDates] = useState(false);
    const [showVacationModal, setShowVacationModal] = useState(false);
    const [showRemoveModal, setShowRemoveModal] = useState(false);
    const [removeTarget, setRemoveTarget] = useState<BlockedRange | null>(null);
    const [deletionCheck, setDeletionCheck] = useState<{
        canDelete: boolean; activeBookings: number;
        listings: number; bookings: number; favorites: number;
    } | null>(null);
    const [isDeletionCheckLoading, setIsDeletionCheckLoading] = useState(false);
    const [isDeletingAccount, setIsDeletingAccount] = useState(false);
    const currentUserId = user.id;

    const [locations, setLocations] = useState<any[]>([]);
    const [editingLocation, setEditingLocation] = useState<any | null>(null);
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

    // Listings — delete state
    const [deleteId, setDeleteId] = useState<string | null>(null);
    const [isDeleting, setIsDeleting] = useState(false);

    // Decline / cancel modal state
    const [bookingActionTarget, setBookingActionTarget] = useState<{ booking: Booking; action: 'decline' | 'cancel' } | null>(null);
    const [isBookingActionSubmitting, setIsBookingActionSubmitting] = useState(false);

    // Review modal state
    const [reviewTarget, setReviewTarget] = useState<Booking | null>(null);
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
        if (currentTab !== 'favorites') return;
        setFavoritesLoading(true);
        getUserFavorites().then(setFavoriteProducts).finally(() => setFavoritesLoading(false));
    }, [currentTab]);

    useEffect(() => {
        if (currentTab !== 'block-days') return;
        getBlockedDates().then(setBlockedRanges).catch(() => setBlockedRanges([]));
    }, [currentTab]);

    useEffect(() => {
        const loadData = async () => {
            setIsLoading(true);
            try {
                const [bookingsData, allProducts, locsData, balanceData, txData] = await Promise.all([
                    getUserBookings(currentUserId),
                    fetchProducts({ ownerId: currentUserId }),
                    getLocations().catch(() => []),
                    getWalletBalance().catch(() => ({ available: 0, pending: 0, escrow: 0 })),
                    getTransactions().catch(() => []),
                ]);
                setBookings(bookingsData);
                setMyProducts(allProducts);
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

    const handleDeleteConfirm = async () => {
        if (!deleteId) return;
        setIsDeleting(true);
        try {
            await deleteProduct(deleteId);
            setMyProducts(prev => prev.filter(p => String(p.id) !== deleteId));
            toast.success('Listing removed');
        } catch {
            toast.error('Failed to remove listing');
        } finally {
            setIsDeleting(false);
            setDeleteId(null);
        }
    };



    const handleOpenDeleteAccount = async () => {
        setCurrentTab('delete-account');
        setIsDeletionCheckLoading(true);
        try {
            const res = await fetch('/api/auth/deletion-check', { credentials: 'include' });
            const json = await res.json();
            if (json.success) setDeletionCheck(json.data);
        } catch {
            toast.error('Could not load account information. Please try again.');
        } finally {
            setIsDeletionCheckLoading(false);
        }
    };

    const handleConfirmDeleteAccount = async () => {
        setIsDeletingAccount(true);
        try {
            const res = await fetch('/api/auth/account', { method: 'DELETE', credentials: 'include' });
            const json = await res.json();
            if (!json.success) {
                toast.error(json.error ?? 'Could not delete account.');
                return;
            }
            window.location.href = '/';
        } catch {
            toast.error('Something went wrong. Please try again.');
        } finally {
            setIsDeletingAccount(false);
        }
    };

    const handleStatusChange = async (bookingId: string, newStatus: BookingStatus) => {
        await updateBookingStatus(bookingId, newStatus);
        const bookingsData = await getUserBookings(currentUserId);
        setBookings(bookingsData);
    };

    const handleBookingActionConfirm = async (reason: string) => {
        if (!bookingActionTarget) return;
        setIsBookingActionSubmitting(true);
        try {
            const { booking, action } = bookingActionTarget;
            if (action === 'decline') {
                await declineBooking(booking.id, reason);
            } else {
                await cancelBooking(booking.id, reason);
            }
            const bookingsData = await getUserBookings(currentUserId);
            setBookings(bookingsData);
            setBookingActionTarget(null);
        } catch {
            toast.error('Something went wrong. Please try again.');
        } finally {
            setIsBookingActionSubmitting(false);
        }
    };

    const renderSidebar = () => {
        const tabs: Array<{ id: string; label: string; icon: React.ElementType }> = [
            { id: 'listings', label: 'Listings', icon: Package },
            { id: 'bookings', label: 'Bookings', icon: CalendarDays },
            { id: 'favorites', label: 'Favourites', icon: Heart },
            { id: 'profile', label: 'My Profile', icon: User },
            { id: 'locations', label: 'Locations', icon: MapPinned },
            { id: 'block-days', label: 'Block Days', icon: CalendarDays },
            { id: 'wallet', label: 'Wallet', icon: PiggyBank },
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
                            <tab.icon className="w-5 h-5 mr-4 flex-shrink-0" />
                            {tab.label}
                        </button>
                    ))}
                    
                    <div className="h-px bg-white/10 my-4 mx-4" />

                    <button 
                        onClick={onLogout} 
                        className="flex items-center px-5 py-4 rounded-2xl text-base font-bold text-brand-orange hover:bg-white/10 transition-all"
                    >
                        <LogOut className="w-5 h-5 mr-4 flex-shrink-0" /> Sign out
                    </button>
                    
                    <button
                        onClick={handleOpenDeleteAccount}
                        className={`flex items-center px-5 py-4 rounded-2xl text-sm font-bold transition-all ${
                            currentTab === 'delete-account'
                            ? 'bg-red-500 text-white'
                            : 'text-red-400/60 hover:text-red-400 hover:bg-red-400/10'
                        }`}
                    >
                        <Trash2 className="w-5 h-5 mr-4 flex-shrink-0" /> Delete Account
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
                        {myProducts.length === 0 ? (
                            <div className="text-center py-16">
                                <p className="font-body text-brand-burgundy/60 mb-6">You&apos;ve currently no listings.</p>
                                <Link
                                    href="/list-item"
                                    className="inline-block bg-brand-orange text-white font-body font-bold px-6 py-3 rounded-xl hover:bg-brand-orange/90 transition-colors"
                                >
                                    Add a listing
                                </Link>
                            </div>
                        ) : (
                            <>
                                <div className="grid gap-4">
                                    {myProducts.map(p => (
                                        <div key={p.id} className="bg-white border border-brand-grey rounded-2xl p-6 flex gap-6 items-center shadow-md">
                                            <Link href={`/products/${p.id}`} className="shrink-0">
                                                <img src={p.imageUrl} className="w-24 h-24 rounded-xl object-cover hover:opacity-80 transition-opacity" />
                                            </Link>
                                            <div className="flex-grow min-w-0">
                                                <Link href={`/products/${p.id}`} className="hover:underline">
                                                    <h3 className="font-heading text-xl text-brand-blue">{p.name}</h3>
                                                </Link>
                                                <p className="text-brand-orange font-bold text-lg">£{p.pricePerDay} / day</p>
                                            </div>
                                            <div className="flex gap-2 shrink-0">
                                                <Link
                                                    href={`/list-item/edit/${p.id}`}
                                                    className="bg-brand-blue/5 hover:bg-brand-blue/10 px-6 py-2 rounded-xl text-xs font-bold uppercase text-brand-blue transition-colors"
                                                >
                                                    Edit
                                                </Link>
                                                <button
                                                    onClick={() => setDeleteId(String(p.id))}
                                                    className="text-red-500 hover:bg-red-50 px-3 py-2 rounded-xl transition-colors"
                                                >
                                                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" /></svg>
                                                </button>
                                            </div>
                                        </div>
                                    ))}
                                </div>
                                <div className="pt-2">
                                    <Link
                                        href="/list-item"
                                        className="inline-block bg-brand-orange text-white font-body font-bold px-6 py-3 rounded-xl hover:bg-brand-orange/90 transition-colors"
                                    >
                                        Add a listing
                                    </Link>
                                </div>
                            </>
                        )}

                        {/* Delete confirmation modal */}
                        {deleteId && (
                            <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4">
                                <div className="bg-white rounded-2xl p-8 max-w-sm w-full shadow-2xl">
                                    <h3 className="font-heading text-xl text-brand-blue mb-3">Remove listing?</h3>
                                    <p className="font-body text-brand-blue/70 mb-6 text-sm">This listing will be removed and won&apos;t appear in search results. This can&apos;t be undone.</p>
                                    <div className="flex gap-3">
                                        <button
                                            onClick={() => setDeleteId(null)}
                                            disabled={isDeleting}
                                            className="flex-1 px-4 py-2.5 rounded-xl border border-brand-grey font-body font-medium text-brand-blue hover:bg-brand-grey/30 transition-colors disabled:opacity-50"
                                        >
                                            Cancel
                                        </button>
                                        <button
                                            onClick={handleDeleteConfirm}
                                            disabled={isDeleting}
                                            className="flex-1 px-4 py-2.5 rounded-xl bg-red-500 text-white font-body font-medium hover:bg-red-600 transition-colors disabled:opacity-50"
                                        >
                                            {isDeleting ? 'Removing…' : 'Remove'}
                                        </button>
                                    </div>
                                </div>
                            </div>
                        )}

                    </div>
                );

            case 'bookings': {
                const madeBookings = bookings.filter(b => b.hirerId === currentUserId && b.status !== 'auto_declined');
                const receivedBookings = bookings.filter(b => b.listerId === currentUserId && b.status !== 'auto_declined');
                const pendingCount = receivedBookings.filter(b => b.status === 'pending').length;
                return (
                    <>
                        <h2 className="font-heading text-3xl text-brand-blue mb-6">Bookings</h2>
                        {/* Sub-tabs */}
                        <div className="flex gap-2 mb-8">
                            <button
                                onClick={() => setBookingSubTab('made')}
                                className={`px-5 py-2 rounded-full font-body text-sm font-bold transition-colors ${bookingSubTab === 'made' ? 'bg-brand-blue text-white' : 'bg-brand-grey/20 text-brand-burgundy hover:bg-brand-grey/40'}`}
                            >
                                My Requests
                            </button>
                            <button
                                onClick={() => setBookingSubTab('received')}
                                className={`px-5 py-2 rounded-full font-body text-sm font-bold transition-colors flex items-center gap-2 ${bookingSubTab === 'received' ? 'bg-brand-blue text-white' : 'bg-brand-grey/20 text-brand-burgundy hover:bg-brand-grey/40'}`}
                            >
                                Received
                                {pendingCount > 0 && (
                                    <span className="bg-brand-orange text-white text-xs rounded-full w-5 h-5 flex items-center justify-center">
                                        {pendingCount}
                                    </span>
                                )}
                            </button>
                        </div>
                        {bookingSubTab === 'made' ? (
                            madeBookings.length === 0 ? (
                                <p className="font-body text-brand-burgundy/60 text-center py-12">You haven&apos;t made any booking requests yet.</p>
                            ) : (
                                madeBookings.map(b => (
                                    <BookingCard key={b.id} booking={b} isLister={false} onStatusChange={handleStatusChange} onDecline={() => {}} onCancel={() => {}} onReview={setReviewTarget} currentUserId={currentUserId} />
                                ))
                            )
                        ) : (
                            receivedBookings.length === 0 ? (
                                <p className="font-body text-brand-burgundy/60 text-center py-12">No booking requests for your listings yet.</p>
                            ) : (
                                receivedBookings.map(b => (
                                    <BookingCard key={b.id} booking={b} isLister={true} onStatusChange={handleStatusChange} onDecline={bk => setBookingActionTarget({ booking: bk, action: 'decline' })} onCancel={bk => setBookingActionTarget({ booking: bk, action: 'cancel' })} onReview={setReviewTarget} currentUserId={currentUserId} />
                                ))
                            )
                        )}

                        {bookingActionTarget && (
                            <BookingActionModal
                                action={bookingActionTarget.action}
                                booking={bookingActionTarget.booking}
                                onConfirm={handleBookingActionConfirm}
                                onClose={() => setBookingActionTarget(null)}
                                isSubmitting={isBookingActionSubmitting}
                            />
                        )}
                    </>
                );
            }

            case 'locations':
                return (
                    <div className="space-y-6">
                        <h2 className="font-heading text-3xl text-brand-blue mb-8">My Collection Points</h2>
                        {editingLocation ? (
                            <LocationPicker
                                key={editingLocation.id}
                                initialData={editingLocation}
                                onSave={async (loc) => {
                                    const updated = await updateLocation(editingLocation.id, loc) as any;
                                    setLocations(prev => prev.map((l: any) => l.id === editingLocation.id ? updated : l));
                                    setEditingLocation(null);
                                    toast.success('Collection point updated!');
                                }}
                                onCancel={() => setEditingLocation(null)}
                            />
                        ) : (
                            <LocationPicker
                                key="new"
                                onSave={async (loc) => {
                                    const saved = await createLocation(loc) as any;
                                    setLocations(prev => [saved, ...prev]);
                                    toast.success('Collection point added!');
                                }}
                            />
                        )}
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
                                        <button
                                            onClick={() => setEditingLocation(loc)}
                                            className="text-brand-blue font-bold hover:underline transition-all"
                                        >
                                            Edit
                                        </button>
                                        <button
                                            onClick={async () => {
                                                await deleteLocation(loc.id);
                                                setLocations(prev => prev.filter((l: any) => l.id !== loc.id));
                                                if (editingLocation?.id === loc.id) setEditingLocation(null);
                                                toast.success('Collection point removed.');
                                            }}
                                            className="text-red-500 font-bold hover:underline transition-all"
                                        >
                                            Remove
                                        </button>
                                    </div>
                                </div>
                            )) : (
                                <p className="text-brand-blue/50 italic py-8 text-center">No collection points saved yet.</p>
                            )}
                        </div>
                    </div>
                );

            case 'block-days': {
                const fmt = (s: string) => new Date(s + 'T00:00:00').toLocaleDateString('en-GB', { day: 'numeric', month: 'short', year: 'numeric' });
                const expandRanges = (ranges: BlockedRange[]) => {
                    const dates: string[] = [];
                    ranges.forEach(({ start, end }) => {
                        const cur = new Date(start + 'T00:00:00');
                        const fin = new Date(end + 'T00:00:00');
                        while (cur <= fin) {
                            dates.push(`${cur.getFullYear()}-${String(cur.getMonth()+1).padStart(2,'0')}-${String(cur.getDate()).padStart(2,'0')}`);
                            cur.setDate(cur.getDate() + 1);
                        }
                    });
                    return dates;
                };
                const toDateStr = (d: Date) => `${d.getFullYear()}-${String(d.getMonth()+1).padStart(2,'0')}-${String(d.getDate()).padStart(2,'0')}`;
                return (
                    <div className="space-y-8">
                        <h2 className="font-heading text-3xl text-brand-blue">Block Days & Vacation</h2>

                        {/* Vacation Mode modal */}
                        {showVacationModal && (
                            <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4">
                                <div className="bg-white rounded-3xl p-8 max-w-md w-full shadow-2xl">
                                    <h3 className="font-heading text-2xl text-brand-blue mb-3">{vacationMode ? 'Disable Vacation Mode?' : 'Enable Vacation Mode?'}</h3>
                                    <p className="text-brand-blue/70 mb-6">{vacationMode ? 'Your listings will become visible in search again.' : 'Your listings will be hidden from search while vacation mode is on. Any accepted bookings must still be honoured.'}</p>
                                    <div className="flex gap-3">
                                        <button onClick={async () => {
                                            const next = !vacationMode;
                                            await updateVacationMode(next);
                                            setVacationMode(next);
                                            setShowVacationModal(false);
                                            toast.success(next ? 'Vacation mode enabled' : 'Vacation mode disabled');
                                        }} className="flex-1 bg-brand-blue text-white py-3 rounded-2xl font-heading hover:brightness-110 transition-all">
                                            {vacationMode ? 'Disable' : 'Enable'}
                                        </button>
                                        <button onClick={() => setShowVacationModal(false)} className="flex-1 border border-brand-grey text-brand-blue py-3 rounded-2xl font-heading hover:bg-brand-grey/10 transition-all">Cancel</button>
                                    </div>
                                </div>
                            </div>
                        )}

                        {/* Remove blocked range modal */}
                        {showRemoveModal && removeTarget && (
                            <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4">
                                <div className="bg-white rounded-3xl p-8 max-w-md w-full shadow-2xl">
                                    <h3 className="font-heading text-2xl text-brand-blue mb-3">Remove blocked period?</h3>
                                    <p className="text-brand-blue/70 mb-2">
                                        {removeTarget.start === removeTarget.end
                                            ? fmt(removeTarget.start)
                                            : `${fmt(removeTarget.start)} – ${fmt(removeTarget.end)}`}
                                    </p>
                                    <p className="text-sm text-brand-blue/50 mb-6">Existing booking requests for these dates may still proceed.</p>
                                    <div className="flex gap-3">
                                        <button onClick={() => {
                                            setBlockedRanges(prev => prev.filter(r => r.start !== removeTarget.start || r.end !== removeTarget.end));
                                            setShowRemoveModal(false);
                                            setRemoveTarget(null);
                                        }} className="flex-1 bg-red-500 text-white py-3 rounded-2xl font-heading hover:brightness-110 transition-all">Remove</button>
                                        <button onClick={() => { setShowRemoveModal(false); setRemoveTarget(null); }} className="flex-1 border border-brand-grey text-brand-blue py-3 rounded-2xl font-heading hover:bg-brand-grey/10 transition-all">Cancel</button>
                                    </div>
                                </div>
                            </div>
                        )}

                        {/* Vacation Mode toggle */}
                        <div className="bg-brand-blue text-white rounded-3xl p-10 flex items-center justify-between shadow-2xl">
                            <div className="max-w-md">
                                <h3 className="font-heading text-2xl mb-2">Vacation Mode</h3>
                                <p className="text-white/70 leading-relaxed">Instantly hide all your listings from search and disable booking requests while you're away.</p>
                            </div>
                            <button
                                onClick={() => setShowVacationModal(true)}
                                className={`w-20 h-10 rounded-full transition-all relative ${vacationMode ? 'bg-brand-yellow' : 'bg-white/20'}`}
                            >
                                <div className={`absolute top-1 w-8 h-8 rounded-full bg-brand-blue transition-all ${vacationMode ? 'left-11' : 'left-1'}`} />
                            </button>
                        </div>

                        {/* Block Specific Dates */}
                        <div className="bg-white border border-brand-grey rounded-[2.5rem] p-10 shadow-xl">
                            <h3 className="font-heading text-2xl text-brand-blue mb-2">Block Specific Dates</h3>
                            <p className="text-brand-blue/60 mb-8">Select a date or range to mark as unavailable. Blocked dates show as <span className="text-red-400 font-medium">×</span> — click them to remove.</p>
                            <div className="max-w-md mx-auto mb-8">
                                <BookingCalendar
                                    initialStart={rangeStart}
                                    initialEnd={rangeEnd}
                                    onChange={(s, e) => { setRangeStart(s); setRangeEnd(e); }}
                                    unavailableDates={expandRanges(blockedRanges)}
                                    vacationModeActive={vacationMode}
                                    onBlockedDateClick={(dateStr) => {
                                        const target = blockedRanges.find(r => {
                                            const cur = new Date(r.start + 'T00:00:00');
                                            const fin = new Date(r.end + 'T00:00:00');
                                            const d = new Date(dateStr + 'T00:00:00');
                                            return d >= cur && d <= fin;
                                        });
                                        if (target) { setRemoveTarget(target); setShowRemoveModal(true); }
                                    }}
                                />
                            </div>
                            <div className="flex gap-3 mb-8">
                                <button
                                    disabled={!rangeStart}
                                    onClick={() => {
                                        if (!rangeStart) return;
                                        const start = toDateStr(rangeStart);
                                        const end = rangeEnd ? toDateStr(rangeEnd) : start;
                                        setBlockedRanges(prev => [...prev, { start, end }]);
                                        setRangeStart(null);
                                        setRangeEnd(null);
                                    }}
                                    className="px-6 py-3 bg-brand-blue text-white rounded-2xl font-heading disabled:opacity-40 hover:brightness-110 transition-all"
                                >
                                    {rangeStart && rangeEnd ? 'Add range' : 'Add date'}
                                </button>
                                {(rangeStart || rangeEnd) && (
                                    <button onClick={() => { setRangeStart(null); setRangeEnd(null); }} className="px-6 py-3 border border-brand-grey text-brand-blue rounded-2xl font-heading hover:bg-brand-grey/10 transition-all">Clear</button>
                                )}
                            </div>

                            {/* Blocked ranges table */}
                            {blockedRanges.length > 0 ? (
                                <div className="border border-brand-grey rounded-2xl overflow-hidden mb-6">
                                    <table className="w-full text-sm">
                                        <thead className="bg-brand-grey/10">
                                            <tr>
                                                <th className="text-left px-5 py-3 text-brand-blue/60 font-body font-semibold">Start</th>
                                                <th className="text-left px-5 py-3 text-brand-blue/60 font-body font-semibold">End</th>
                                                <th className="text-left px-5 py-3 text-brand-blue/60 font-body font-semibold">Type</th>
                                                <th className="px-5 py-3" />
                                            </tr>
                                        </thead>
                                        <tbody>
                                            {blockedRanges.map((r, i) => (
                                                <tr key={i} className="border-t border-brand-grey/50">
                                                    <td className="px-5 py-3 text-brand-blue font-body">{fmt(r.start)}</td>
                                                    <td className="px-5 py-3 text-brand-blue font-body">{fmt(r.end)}</td>
                                                    <td className="px-5 py-3 text-brand-blue/60 font-body">{r.start === r.end ? 'Single day' : 'Range'}</td>
                                                    <td className="px-5 py-3 text-right">
                                                        <button onClick={() => { setRemoveTarget(r); setShowRemoveModal(true); }} className="text-red-400 hover:text-red-600 transition-colors">
                                                            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" /></svg>
                                                        </button>
                                                    </td>
                                                </tr>
                                            ))}
                                        </tbody>
                                    </table>
                                </div>
                            ) : (
                                <p className="text-sm italic text-brand-blue/40 mb-6">No dates blocked yet.</p>
                            )}

                            <button
                                disabled={isSavingDates}
                                onClick={async () => {
                                    setIsSavingDates(true);
                                    try {
                                        await updateBlockedDates(blockedRanges);
                                        toast.success('Blocked dates saved');
                                    } catch {
                                        toast.error('Failed to save blocked dates');
                                    } finally {
                                        setIsSavingDates(false);
                                    }
                                }}
                                className="px-8 py-3 bg-brand-orange text-white rounded-2xl font-heading disabled:opacity-50 hover:brightness-110 transition-all"
                            >
                                {isSavingDates ? 'Saving…' : 'Save changes'}
                            </button>
                        </div>
                    </div>
                );
            }

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
                        {favoritesLoading ? (
                            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
                                {[...Array(4)].map((_, i) => (
                                    <div key={i} className="bg-brand-grey/20 rounded-2xl h-64 animate-pulse" />
                                ))}
                            </div>
                        ) : favoriteProducts.length === 0 ? (
                            <div className="bg-white border border-brand-grey rounded-[2.5rem] p-12 shadow-xl text-center">
                                <svg className="w-16 h-16 text-brand-blue/20 mx-auto mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z" />
                                </svg>
                                <p className="font-heading text-xl text-brand-blue/50">Items you heart will appear here</p>
                                <p className="text-sm text-brand-blue/40 mt-2">Browse the marketplace and tap the heart icon on any item to save it.</p>
                            </div>
                        ) : (
                            <ProductGrid
                                products={favoriteProducts}
                                onSelectProduct={p => window.location.href = `/products/${p.id}`}
                                favoriteIds={favoriteIds}
                                onToggleFavorite={id => {
                                    toggleFavorite(id);
                                    setFavoriteProducts(prev => prev.filter(p => p.id.toString() !== id));
                                }}
                                isLoggedIn={isLoggedIn}
                            />
                        )}
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
                                    <p className="text-xs text-red-500 mb-1">Phone numbers are not required at this point</p>
                                    <PhoneInput
                                        value={profilePhone}
                                        onChange={v => {
                                            setProfilePhone(v);
                                            if (profileErrors.phone) setProfileErrors(prev => ({ ...prev, phone: undefined }));
                                        }}
                                        error={profileErrors.phone}
                                        disabled
                                    />
                                </div>
                                <div>
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

                        {isDeletionCheckLoading && (
                            <p className="font-body text-brand-blue/50 mb-6 animate-pulse">Checking your account…</p>
                        )}

                        {deletionCheck && !isDeletionCheckLoading && (
                            <>
                                {(deletionCheck.listings > 0 || deletionCheck.bookings > 0 || deletionCheck.favorites > 0) && (
                                    <div className="bg-brand-grey/10 rounded-2xl p-6 mb-6 text-left space-y-2">
                                        <p className="font-body text-sm text-brand-blue/70">Deleting your account will permanently remove:</p>
                                        <ul className="font-body text-sm text-brand-blue space-y-1 mt-3 list-disc list-inside">
                                            {deletionCheck.listings > 0 && (
                                                <li>{deletionCheck.listings} listing{deletionCheck.listings !== 1 ? 's' : ''}</li>
                                            )}
                                            {deletionCheck.bookings > 0 && (
                                                <li>{deletionCheck.bookings} booking record{deletionCheck.bookings !== 1 ? 's' : ''}</li>
                                            )}
                                            {deletionCheck.favorites > 0 && (
                                                <li>{deletionCheck.favorites} saved favourite{deletionCheck.favorites !== 1 ? 's' : ''}</li>
                                            )}
                                        </ul>
                                    </div>
                                )}

                                {!deletionCheck.canDelete && (
                                    <div className="bg-red-50 border border-red-200 rounded-2xl p-5 mb-6 text-left">
                                        <p className="font-body text-red-700 font-bold text-sm mb-1">You have active bookings</p>
                                        <p className="font-body text-red-600 text-sm">
                                            You have {deletionCheck.activeBookings} active booking{deletionCheck.activeBookings !== 1 ? 's' : ''}.
                                            Please resolve {deletionCheck.activeBookings === 1 ? 'it' : 'them'} before deleting your account.
                                        </p>
                                    </div>
                                )}
                            </>
                        )}

                        <p className="font-body text-brand-blue/60 mb-10 text-lg leading-relaxed">
                            This is permanent and cannot be undone.
                        </p>
                        <div className="space-y-4">
                            <button
                                onClick={handleConfirmDeleteAccount}
                                disabled={!deletionCheck?.canDelete || isDeletingAccount || isDeletionCheckLoading}
                                className="w-full bg-red-500 text-white py-5 rounded-[1.5rem] font-heading text-xl hover:bg-red-600 shadow-2xl transition-all active:scale-95 disabled:opacity-40 disabled:cursor-not-allowed"
                            >
                                {isDeletingAccount ? 'Deleting…' : 'Confirm Deletion'}
                            </button>
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

            {reviewTarget && (
                <ReviewModal
                    bookingId={reviewTarget.id}
                    otherPartyName={
                        reviewTarget.hirerId === currentUserId
                            ? (reviewTarget.lister?.name ?? 'the other party')
                            : (reviewTarget.hirer?.name ?? 'the other party')
                    }
                    onClose={() => setReviewTarget(null)}
                    onSuccess={() => {
                        setBookings(prev => prev.map(b =>
                            b.id === reviewTarget.id ? { ...b, hasReviewed: true } : b
                        ));
                    }}
                />
            )}
        </div>
    );
};

export default Dashboard;