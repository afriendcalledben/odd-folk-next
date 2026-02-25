'use client';

import React, { useState, useRef } from 'react';
import { Camera } from 'lucide-react';
import BookingCalendar from './BookingCalendar';
import VerificationSection from './VerificationSection';
import { useAuth } from '@/context/AuthContext';
import { uploadAvatar, removeAvatar } from '@/services/api';

interface ProfileProps {
  user: any;
  onLogout: () => void;
}

type ProfileSection = 'listings' | 'bookings' | 'favourites' | 'locations' | 'block-days' | 'wallet' | 'personal-info' | 'verification' | 'delete-account';

const Profile: React.FC<ProfileProps> = ({ user, onLogout }) => {
  const { refreshUser } = useAuth();
  const [activeSection, setActiveSection] = useState<ProfileSection>('personal-info');
  const [vacationMode, setVacationMode] = useState(false);
  const [blockedDates, setBlockedDates] = useState<Date[]>([]);
  const [isUploadingAvatar, setIsUploadingAvatar] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleAvatarChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setIsUploadingAvatar(true);
    try {
      await uploadAvatar(file);
      await refreshUser();
    } finally {
      setIsUploadingAvatar(false);
      if (fileInputRef.current) fileInputRef.current.value = '';
    }
  };

  const handleRemoveAvatar = async () => {
    setIsUploadingAvatar(true);
    try {
      await removeAvatar();
      await refreshUser();
    } finally {
      setIsUploadingAvatar(false);
    }
  };

  // Mock data for new sections
  const locations = [
    { id: 1, name: 'studio', address: 'Argall Avenue 15, E10 7QE London', type: 'Work' },
    { id: 2, name: 'home', address: 'Ruckholt Road 2A, E10 5NP London', type: 'Home' },
  ];

  const payouts = [
    { id: 'PO-1234', date: '2024-03-15', amount: 145.00, status: 'Completed', item: 'Vintage Velvet Sofa' },
    { id: 'PO-1235', date: '2024-03-10', amount: 45.00, status: 'Completed', item: 'Neon Sign' },
    { id: 'PO-1236', date: '2024-03-22', amount: 72.00, status: 'Pending', item: 'Wicker Chair' },
  ];

  const menuItems = [
    { id: 'listings', label: 'Listings', icon: '📦' },
    { id: 'bookings', label: 'Bookings', icon: '📅' },
    { id: 'favourites', label: 'Favourites', icon: '💙' },
    { id: 'locations', label: 'Locations', icon: '📍' },
    { id: 'block-days', label: 'Block Days', icon: '🗓️' },
    { id: 'wallet', label: 'Wallet', icon: '💷' },
    { id: 'verification', label: 'Verification', icon: '✓' },
  ];

  const renderSectionContent = () => {
    switch (activeSection) {
      case 'personal-info':
        return (
          <div className="space-y-8 animate-fade-in">
            <section className="bg-brand-white rounded-2xl shadow-sm border border-brand-grey p-8">
               <h2 className="font-heading text-2xl text-brand-burgundy mb-6">Personal information</h2>

               {/* Avatar editor */}
               <div className="flex items-center gap-6 mb-8">
                 <div className="relative group cursor-pointer" onClick={() => fileInputRef.current?.click()}>
                   <div className="w-24 h-24 rounded-full overflow-hidden border-4 border-brand-orange/20 bg-brand-blue flex items-center justify-center">
                     {user.avatarUrl ? (
                       <img src={user.avatarUrl} alt={user.name} className="w-full h-full object-cover" />
                     ) : (
                       <span className="font-heading text-3xl text-white">
                         {user.name?.charAt(0).toUpperCase()}
                       </span>
                     )}
                   </div>
                   <div className="absolute inset-0 rounded-full bg-black/40 opacity-0 group-hover:opacity-100 flex items-center justify-center transition-opacity">
                     <Camera className="w-6 h-6 text-white" />
                   </div>
                   <input ref={fileInputRef} type="file" accept="image/*" className="hidden" onChange={handleAvatarChange} />
                 </div>
                 <div className="space-y-1">
                   <p className="font-body text-sm text-brand-burgundy/60">
                     {isUploadingAvatar ? 'Uploading...' : 'Hover to change photo'}
                   </p>
                   <button
                     onClick={handleRemoveAvatar}
                     disabled={!!user.isGoogleUser || !user.avatarUrl || isUploadingAvatar}
                     className="text-sm text-red-500 font-bold hover:underline disabled:opacity-40 disabled:cursor-not-allowed disabled:no-underline"
                   >
                     {user.isGoogleUser ? 'Managed by Google' : 'Remove photo'}
                   </button>
                 </div>
               </div>

               <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div className="space-y-2">
                     <label className="block font-body text-sm font-bold text-brand-burgundy">Full name</label>
                     <input type="text" defaultValue={user.name} className="w-full p-3 bg-brand-white border border-brand-grey rounded-lg font-body text-brand-burgundy" />
                  </div>
                  <div className="space-y-2">
                     <label className="block font-body text-sm font-bold text-brand-burgundy">Phone number</label>
                     <input type="tel" defaultValue="+44 7700 900077" className="w-full p-3 bg-brand-white border border-brand-grey rounded-lg font-body text-brand-burgundy" />
                  </div>
                  <div className="space-y-2 md:col-span-2">
                     <label className="block font-body text-sm font-bold text-brand-burgundy">Email address</label>
                     <input type="email" defaultValue="jamie@oddfolk.co.uk" className="w-full p-3 bg-brand-white border border-brand-grey rounded-lg font-body text-brand-burgundy" />
                  </div>
               </div>
            </section>
          </div>
        );

      case 'verification':
        return (
          <div className="animate-fade-in">
            <VerificationSection />
          </div>
        );

      case 'locations':
        return (
          <div className="space-y-6 animate-fade-in">
            <div className="flex justify-between items-center">
                <h2 className="font-heading text-2xl text-brand-burgundy">My Locations</h2>
                <button className="bg-brand-yellow text-brand-burgundy font-heading px-4 py-2 rounded-xl text-sm hover:brightness-105">+ Add New</button>
            </div>
            <div className="grid gap-4">
              {locations.map(loc => (
                <div key={loc.id} className="bg-white border border-brand-grey rounded-2xl p-6 flex justify-between items-center shadow-sm">
                  <div>
                    <div className="flex items-center gap-2 mb-1">
                      <span className="font-heading text-lg text-brand-burgundy capitalize">{loc.name}</span>
                      <span className="text-[10px] bg-brand-blue/10 text-brand-blue px-2 py-0.5 rounded-full font-bold uppercase">{loc.type}</span>
                    </div>
                    <p className="text-sm text-brand-burgundy/60">{loc.address}</p>
                  </div>
                  <div className="flex gap-2">
                    <button className="text-brand-blue font-bold text-xs hover:underline">Edit</button>
                    <button className="text-red-500 font-bold text-xs hover:underline">Delete</button>
                  </div>
                </div>
              ))}
            </div>
          </div>
        );

      case 'block-days':
        return (
          <div className="space-y-8 animate-fade-in">
            <h2 className="font-heading text-2xl text-brand-burgundy">Block Days & Vacation</h2>
            
            <div className="bg-brand-blue text-white rounded-3xl p-8 flex items-center justify-between shadow-xl">
              <div>
                <h3 className="font-heading text-xl mb-1">Vacation Mode</h3>
                <p className="text-sm text-white/70">When active, your listings are hidden and cannot be booked.</p>
              </div>
              <button 
                onClick={() => setVacationMode(!vacationMode)}
                className={`w-16 h-8 rounded-full transition-colors relative ${vacationMode ? 'bg-brand-yellow' : 'bg-white/20'}`}
              >
                <div className={`absolute top-1 w-6 h-6 rounded-full bg-brand-burgundy transition-all ${vacationMode ? 'left-9' : 'left-1'}`} />
              </button>
            </div>

            <div className="bg-white border border-brand-grey rounded-3xl p-8">
              <h3 className="font-heading text-xl text-brand-burgundy mb-6">Block Specific Dates</h3>
              <p className="text-sm text-brand-burgundy/60 mb-8">Select dates on the calendar to mark them as unavailable for collection or rental.</p>
              <div className="max-w-md mx-auto">
                <BookingCalendar 
                  initialStart={null} 
                  initialEnd={null} 
                  onChange={(s) => {
                    if (s) setBlockedDates([...blockedDates, s]);
                  }} 
                />
              </div>
              <div className="mt-8 flex flex-wrap gap-2">
                {blockedDates.length > 0 && <p className="w-full text-xs font-bold text-brand-burgundy/40 uppercase mb-2">Currently blocked:</p>}
                {blockedDates.map((d, i) => (
                  <span key={i} className="bg-brand-orange text-white text-xs px-3 py-1.5 rounded-full flex items-center gap-2">
                    {d.toLocaleDateString('en-GB')}
                    <button onClick={() => setBlockedDates(blockedDates.filter((_, idx) => idx !== i))}>×</button>
                  </span>
                ))}
              </div>
            </div>
          </div>
        );

      case 'wallet':
        return (
          <div className="space-y-8 animate-fade-in">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="bg-brand-burgundy text-white rounded-3xl p-8 shadow-xl">
                <p className="text-xs font-bold text-white/50 uppercase mb-2">Available for payout</p>
                <h3 className="font-heading text-4xl text-brand-yellow">£145.00</h3>
                <button className="mt-6 w-full bg-brand-orange text-white py-3 rounded-xl font-heading hover:brightness-110 transition-all">Request Payout</button>
              </div>
              <div className="bg-brand-blue text-white rounded-3xl p-8 shadow-xl">
                <p className="text-xs font-bold text-white/50 uppercase mb-2">Pending Escrow</p>
                <h3 className="font-heading text-4xl text-white">£72.00</h3>
                <p className="text-xs text-white/60 mt-4">Funds released 48h after items are returned.</p>
              </div>
            </div>

            <section>
              <h3 className="font-heading text-xl text-brand-burgundy mb-6">Recent Transactions & Invoices</h3>
              <div className="bg-white border border-brand-grey rounded-2xl overflow-hidden shadow-sm">
                <table className="w-full text-left">
                  <thead className="bg-brand-grey/10 border-b border-brand-grey">
                    <tr>
                      <th className="px-6 py-4 font-heading text-xs uppercase tracking-wider text-brand-burgundy/60">Date</th>
                      <th className="px-6 py-4 font-heading text-xs uppercase tracking-wider text-brand-burgundy/60">Item</th>
                      <th className="px-6 py-4 font-heading text-xs uppercase tracking-wider text-brand-burgundy/60">Amount</th>
                      <th className="px-6 py-4 font-heading text-xs uppercase tracking-wider text-brand-burgundy/60 text-right">Invoice</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-brand-grey/20">
                    {payouts.map(po => (
                      <tr key={po.id} className="hover:bg-brand-grey/5 transition-colors">
                        <td className="px-6 py-4 text-sm font-body">{po.date}</td>
                        <td className="px-6 py-4 text-sm font-body text-brand-burgundy font-medium">{po.item}</td>
                        <td className="px-6 py-4 text-sm font-body font-bold">£{po.amount.toFixed(2)}</td>
                        <td className="px-6 py-4 text-right">
                          <button className="text-brand-blue hover:text-brand-orange transition-colors">
                            <svg className="w-5 h-5 inline" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 10v6m0 0l-3-3m3 3l3-3m2 8H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" /></svg>
                          </button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </section>
          </div>
        );

      case 'delete-account':
        return (
          <div className="max-w-md mx-auto py-12 text-center animate-fade-in">
            <div className="w-20 h-20 bg-red-100 text-red-600 rounded-full flex items-center justify-center mx-auto mb-6">
              <svg className="w-10 h-10" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" /></svg>
            </div>
            <h2 className="font-heading text-3xl text-brand-burgundy mb-4">Delete Account</h2>
            <p className="font-body text-brand-burgundy/60 mb-8 leading-relaxed">
              This action is permanent and cannot be undone. All your listings, history, and payout data will be wiped from the platform.
            </p>
            <div className="space-y-4">
              <button className="w-full bg-red-600 text-white py-4 rounded-xl font-heading text-lg hover:bg-red-700 shadow-xl transition-all">Yes, Delete My Account</button>
              <button onClick={() => setActiveSection('personal-info')} className="w-full text-brand-burgundy font-bold hover:underline">Cancel, take me back</button>
            </div>
          </div>
        );

      default:
        return (
          <div className="text-center py-20 text-brand-burgundy/40 italic">
            Select a section from the menu
          </div>
        );
    }
  };

  return (
    <div className="bg-brand-white min-h-screen py-12 animate-fade-in">
      <div className="container mx-auto px-4 max-w-6xl">
        
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-10">
           <div>
              <h1 className="font-heading text-4xl text-brand-burgundy mb-2">Settings & Profile</h1>
              <p className="font-body text-brand-burgundy/60">Manage your presence on the Odd Folk marketplace</p>
           </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
          
          {/* Sidebar */}
          <div className="lg:col-span-3 space-y-6">
            <div className="bg-brand-blue rounded-3xl shadow-xl border border-brand-white/10 overflow-hidden text-brand-white p-2">
                <div className="p-6 border-b border-brand-white/10 mb-2">
                    <div className="flex items-center space-x-3 cursor-pointer" onClick={() => setActiveSection('personal-info')}>
                        {user.avatarUrl ? (
                          <img src={user.avatarUrl} alt={user.name} className="w-12 h-12 rounded-full object-cover border-2 border-brand-yellow" />
                        ) : (
                          <div className="w-12 h-12 rounded-full border-2 border-brand-yellow bg-brand-orange flex items-center justify-center flex-shrink-0">
                            <span className="font-heading text-lg text-white">{user.name?.charAt(0).toUpperCase()}</span>
                          </div>
                        )}
                        <div>
                            <p className="font-bold text-sm leading-tight">{user.name}</p>
                            <p className="text-[10px] text-brand-yellow font-bold uppercase tracking-widest mt-1">Verified Folk</p>
                        </div>
                    </div>
                </div>
                
                <nav className="space-y-1">
                    {menuItems.map(item => (
                        <button
                            key={item.id}
                            onClick={() => setActiveSection(item.id as ProfileSection)}
                            className={`w-full flex items-center px-4 py-3.5 rounded-2xl font-body font-bold text-sm transition-all ${
                                activeSection === item.id 
                                ? 'bg-brand-yellow text-brand-burgundy shadow-lg' 
                                : 'text-white/80 hover:bg-white/10'
                            }`}
                        >
                            <span className="mr-3 text-lg opacity-80">{item.icon}</span>
                            {item.label}
                        </button>
                    ))}
                    
                    <div className="h-px bg-white/10 my-4 mx-4" />
                    
                    <button 
                        onClick={onLogout}
                        className="w-full flex items-center px-4 py-3.5 rounded-2xl font-body font-bold text-sm text-white/60 hover:text-white hover:bg-white/10 transition-all"
                    >
                        <span className="mr-3 text-lg opacity-80">🚪</span>
                        Sign Out
                    </button>
                    
                    <button 
                        onClick={() => setActiveSection('delete-account')}
                        className={`w-full flex items-center px-4 py-3.5 rounded-2xl font-body font-bold text-sm transition-all ${
                          activeSection === 'delete-account' 
                          ? 'bg-red-600 text-white' 
                          : 'text-red-400 hover:bg-red-400/10'
                        }`}
                    >
                        <span className="mr-3 text-lg opacity-80">🗑️</span>
                        Delete Account
                    </button>
                </nav>
            </div>
          </div>

          {/* Main Content Area */}
          <div className="lg:col-span-9">
            <div className="bg-brand-white rounded-3xl border border-brand-grey min-h-[600px] p-6 md:p-10 shadow-sm">
                {renderSectionContent()}
            </div>
          </div>

        </div>
      </div>
    </div>
  );
};

export default Profile;