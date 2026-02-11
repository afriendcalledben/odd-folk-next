'use client';

import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import type { Product, Review } from '@/types';
import { createBookingRequest, fetchReviewsForProduct, auth, getProductAvailability } from '@/services/api';
import { useAuth } from '@/context/AuthContext';
import BookingCalendar from './BookingCalendar';
import SupportCenter from './SupportCenter';
import PriceBreakdown from './PriceBreakdown';
import ProtectionBadge from './ProtectionBadge';

interface ProductDetailProps {
  product: Product;
  onFavoriteChange?: (productId: string, isFavorited: boolean) => void;
}

const formatDateLong = (date: Date | null) => {
    if (!date) return '-';
    return date.toLocaleDateString('en-GB', { day: 'numeric', month: 'short', year: 'numeric' });
};

const ProductDetail: React.FC<ProductDetailProps> = ({ product, onFavoriteChange }) => {
  const router = useRouter();
  const { isLoggedIn, favoriteIds, toggleFavorite } = useAuth();

  const [activeImageIndex, setActiveImageIndex] = useState(0);
  const [reviews, setReviews] = useState<Review[]>([]);
  const isFavorited = favoriteIds.includes(product.id.toString());

  // Date & Booking State
  const [pickupDate, setPickupDate] = useState<Date | null>(null);
  const [dropoffDate, setDropoffDate] = useState<Date | null>(null);
  const [selectedQuantity, setSelectedQuantity] = useState<number>(1);
  const [unavailableDates, setUnavailableDates] = useState<string[]>([]);

  // Support State
  const [isSupportModalOpen, setIsSupportModalOpen] = useState(false);

  const handleToggleFavorite = async () => {
    if (!isLoggedIn) {
      alert('Please log in to save favorites');
      return;
    }
    try {
      await toggleFavorite(product.id.toString());
      if (onFavoriteChange) {
        onFavoriteChange(product.id.toString(), !isFavorited);
      }
    } catch (error) {
      console.error('Failed to toggle favorite:', error);
    }
  };

  const productImages = product.images && product.images.length > 0
    ? product.images
    : [product.imageUrl];

  useEffect(() => {
    const loadProductData = async () => {
        const [reviewsData, availabilityData] = await Promise.all([
          fetchReviewsForProduct(product.id),
          getProductAvailability(product.id.toString()),
        ]);
        setReviews(reviewsData);
        setUnavailableDates(availabilityData);
    };
    loadProductData();
    window.scrollTo(0, 0);
  }, [product]);

  const handleRequestBook = async () => {
      if (!pickupDate || !dropoffDate) {
          alert("Please select rental dates.");
          return;
      }
      try {
          const startDateStr = pickupDate.toISOString().split('T')[0];
          const endDateStr = dropoffDate.toISOString().split('T')[0];
          await createBookingRequest(product, startDateStr, endDateStr, selectedQuantity);
          router.push('/dashboard');
      } catch (error: any) {
          alert(error.message || "Booking failed");
      }
  };

  const incrementQty = () => setSelectedQuantity(prev => Math.min(prev + 1, product.quantityAvailable));
  const decrementQty = () => setSelectedQuantity(prev => Math.max(prev - 1, 1));

  // Determine Condition Badge Color
  const getConditionColor = (cond: string) => {
      switch(cond) {
          case 'Like New': return 'bg-green-100 text-green-800 border-green-200';
          case 'Good': return 'bg-blue-100 text-blue-800 border-blue-200';
          case 'Vintage/Antique': return 'bg-purple-100 text-purple-800 border-purple-200';
          case 'Poor': return 'bg-red-100 text-red-800 border-red-200';
          default: return 'bg-gray-100 text-gray-800 border-gray-200';
      }
  };

  return (
    <div className="bg-brand-white min-h-screen animate-fade-in pb-20">
       <div className="container mx-auto px-4 sm:px-6 lg:px-8 py-8">

        <button onClick={() => router.back()} className="font-body font-medium text-brand-blue mb-8 flex items-center hover:text-brand-orange">
          ← Back to all items
        </button>

        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 lg:gap-12">
          {/* Images */}
          <div className="lg:col-span-7 space-y-4">
             <div className="relative aspect-[4/3] bg-gray-100 rounded-xl overflow-hidden group">
                 <img src={productImages[activeImageIndex]} alt={product.name} className="w-full h-full object-cover" />
                 {/* ... (Existing navigation buttons) ... */}
             </div>
             <div className="flex gap-4 overflow-x-auto pb-2">
                 {productImages.map((img, idx) => (
                     <button key={idx} onClick={() => setActiveImageIndex(idx)} className={`w-24 h-24 rounded-lg overflow-hidden border-2 ${activeImageIndex === idx ? 'border-brand-orange' : 'border-transparent'}`}>
                         <img src={img} className="w-full h-full object-cover" />
                     </button>
                 ))}
             </div>
          </div>

          {/* Info & Booking */}
          <div className="lg:col-span-5">
             <div className="sticky top-28 space-y-8">
                <div>
                    <div className="flex justify-between items-start">
                        <span className="font-bold text-xs text-brand-blue uppercase tracking-wider mb-2 block">{product.category}</span>
                        <button onClick={() => setIsSupportModalOpen(true)} className="text-brand-burgundy/40 hover:text-red-500 text-xs font-medium flex items-center">
                            <svg className="w-4 h-4 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 21v-4m0 0V5a2 2 0 012-2h6.5l1 1H21l-3 6 3 6h-8.5l-1-1H5a2 2 0 00-2 2zm9-13a1 1 0 011-1h1.586l-.3 3h-.286a1 1 0 01-1-1z" /></svg>
                            Report item
                        </button>
                    </div>
                    <div className="flex items-start justify-between gap-4 mb-4">
                        <h1 className="font-heading text-4xl text-brand-burgundy">{product.name}</h1>
                        <button
                          onClick={handleToggleFavorite}
                          className={`flex-shrink-0 w-12 h-12 rounded-full flex items-center justify-center transition-all ${
                            isFavorited
                              ? 'bg-red-500 text-white'
                              : 'bg-brand-grey/20 text-brand-burgundy/40 hover:bg-red-50 hover:text-red-500'
                          }`}
                        >
                          <svg
                            className="w-6 h-6"
                            fill={isFavorited ? 'currentColor' : 'none'}
                            stroke="currentColor"
                            viewBox="0 0 24 24"
                          >
                            <path
                              strokeLinecap="round"
                              strokeLinejoin="round"
                              strokeWidth={2}
                              d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z"
                            />
                          </svg>
                        </button>
                    </div>

                    <div className="flex items-center space-x-3 mb-4">
                        <img src={product.owner.avatarUrl} className="w-10 h-10 rounded-full border border-brand-grey" />
                        <div>
                            <p className="text-xs text-brand-burgundy/60 uppercase">Listed by</p>
                            <p className="font-bold text-brand-burgundy text-sm">{product.owner.name}</p>
                        </div>
                    </div>

                    {/* Condition & Stock Badges */}
                    <div className="flex flex-wrap gap-2">
                        <span className={`px-3 py-1 rounded-full text-xs font-bold border ${getConditionColor(product.condition)}`}>
                            {product.condition}
                        </span>
                        <span className={`px-3 py-1 rounded-full text-xs font-bold border ${product.quantityAvailable > 0 ? 'bg-green-50 text-green-700 border-green-100' : 'bg-red-50 text-red-700 border-red-100'}`}>
                            {product.quantityAvailable > 0 ? `${product.quantityAvailable} in stock` : 'Out of stock'}
                        </span>
                        <ProtectionBadge variant="badge" />
                    </div>
                </div>

                <p className="text-brand-burgundy/80 leading-relaxed">{product.description}</p>

                {/* Protection Info Card */}
                <ProtectionBadge variant="card" />

                {/* Booking Widget */}
                <div className="bg-white border border-brand-grey/50 rounded-xl shadow-xl overflow-hidden">
                    <div className="p-4 border-b border-brand-grey/20">
                        <h3 className="font-heading text-lg text-brand-burgundy mb-4">Select dates</h3>
                        <BookingCalendar
                            initialStart={pickupDate}
                            initialEnd={dropoffDate}
                            onChange={(s, e) => { setPickupDate(s); setDropoffDate(e); }}
                            unavailableDates={unavailableDates}
                        />
                    </div>

                    {/* Quantity Selector */}
                    {product.quantityAvailable > 1 && (
                        <div className="p-4 border-b border-brand-grey/20 flex justify-between items-center bg-gray-50">
                            <span className="font-bold text-sm text-brand-burgundy">Quantity</span>
                            <div className="flex items-center bg-white border border-brand-grey rounded-lg shadow-sm">
                                <button onClick={decrementQty} className="px-3 py-1 text-brand-burgundy hover:bg-gray-100 disabled:opacity-50" disabled={selectedQuantity <= 1}>-</button>
                                <span className="px-3 py-1 text-sm font-bold min-w-[30px] text-center">{selectedQuantity}</span>
                                <button onClick={incrementQty} className="px-3 py-1 text-brand-burgundy hover:bg-gray-100 disabled:opacity-50" disabled={selectedQuantity >= product.quantityAvailable}>+</button>
                            </div>
                        </div>
                    )}

                    <div className="p-4 space-y-4">
                         {/* Price breakdown or placeholder */}
                         {pickupDate && dropoffDate ? (
                           <PriceBreakdown
                             pricePerDay={product.pricePerDay}
                             days={Math.floor((dropoffDate.getTime() - pickupDate.getTime()) / (1000 * 60 * 60 * 24)) + 1}
                             quantity={selectedQuantity}
                             showListerPayout={false}
                           />
                         ) : (
                           <div className="bg-gray-50 rounded-xl p-4 text-center">
                             <p className="text-sm text-brand-burgundy/60">Select dates to see price breakdown</p>
                             <p className="font-heading text-lg text-brand-burgundy mt-1">
                               From <span className="text-brand-orange">£{product.pricePerDay}</span>/day
                             </p>
                           </div>
                         )}
                         <button
                            onClick={handleRequestBook}
                            disabled={product.quantityAvailable === 0 || !pickupDate || !dropoffDate}
                            className="w-full bg-brand-orange text-white font-heading text-lg py-3 rounded-lg hover:brightness-90 shadow-sm disabled:bg-gray-300 disabled:cursor-not-allowed transition-all"
                         >
                             {product.quantityAvailable > 0 ? 'Send request' : 'Out of stock'}
                         </button>
                    </div>
                </div>
             </div>
          </div>
        </div>

        {/* Reviews Section */}
        <div className="mt-16 border-t border-brand-grey/30 pt-12">
          <div className="max-w-4xl">
            <div className="flex items-center justify-between mb-8">
              <div>
                <h2 className="font-heading text-2xl text-brand-burgundy">Reviews</h2>
                {reviews.length > 0 && (
                  <div className="flex items-center gap-2 mt-2">
                    <div className="flex items-center">
                      {[1, 2, 3, 4, 5].map((star) => {
                        const avgRating = reviews.reduce((sum, r) => sum + r.rating, 0) / reviews.length;
                        return (
                          <svg
                            key={star}
                            className={`w-5 h-5 ${star <= avgRating ? 'text-brand-yellow' : 'text-gray-200'}`}
                            fill="currentColor"
                            viewBox="0 0 20 20"
                          >
                            <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
                          </svg>
                        );
                      })}
                    </div>
                    <span className="font-bold text-brand-burgundy">
                      {(reviews.reduce((sum, r) => sum + r.rating, 0) / reviews.length).toFixed(1)}
                    </span>
                    <span className="text-brand-burgundy/60">({reviews.length} review{reviews.length !== 1 ? 's' : ''})</span>
                  </div>
                )}
              </div>
            </div>

            {reviews.length === 0 ? (
              <div className="text-center py-12 bg-gray-50 rounded-xl border border-brand-grey/20">
                <svg className="w-12 h-12 text-brand-burgundy/20 mx-auto mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" />
                </svg>
                <p className="font-heading text-lg text-brand-burgundy/60">No reviews yet</p>
                <p className="text-sm text-brand-burgundy/40 mt-1">Be the first to rent this item and leave a review!</p>
              </div>
            ) : (
              <div className="space-y-6">
                {reviews.map((review) => (
                  <div key={review.id} className="bg-white border border-brand-grey/20 rounded-xl p-6 shadow-sm">
                    <div className="flex items-start justify-between mb-4">
                      <div className="flex items-center gap-3">
                        <img
                          src={review.reviewerAvatar || 'https://i.pravatar.cc/150'}
                          alt={review.reviewerName}
                          className="w-10 h-10 rounded-full object-cover border border-brand-grey/30"
                        />
                        <div>
                          <p className="font-bold text-brand-burgundy text-sm">{review.reviewerName}</p>
                          <p className="text-xs text-brand-burgundy/50">
                            {new Date(review.date).toLocaleDateString('en-GB', {
                              day: 'numeric',
                              month: 'short',
                              year: 'numeric',
                            })}
                          </p>
                        </div>
                      </div>
                      <div className="flex items-center">
                        {[1, 2, 3, 4, 5].map((star) => (
                          <svg
                            key={star}
                            className={`w-4 h-4 ${star <= review.rating ? 'text-brand-yellow' : 'text-gray-200'}`}
                            fill="currentColor"
                            viewBox="0 0 20 20"
                          >
                            <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
                          </svg>
                        ))}
                      </div>
                    </div>
                    {review.comment && (
                      <p className="text-brand-burgundy/80 leading-relaxed">{review.comment}</p>
                    )}
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>

        {/* Support Modal */}
        {isSupportModalOpen && (
            <SupportCenter
                mode="report_user"
                targetId={product.owner.id}
                onClose={() => setIsSupportModalOpen(false)}
            />
        )}
      </div>
    </div>
  );
};

export default ProductDetail;
