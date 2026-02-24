'use client';

import React, { useState, useEffect } from 'react';
import type { Product } from '../types';
import { getPublicUserProfile, getUserProducts, getUserReviews, PublicUserProfile, UserReview } from '../services/api';

interface UserProfileProps {
  userId: string;
  onBack: () => void;
  onProductClick: (product: Product) => void;
}

const UserProfile: React.FC<UserProfileProps> = ({ userId, onBack, onProductClick }) => {
  const [profile, setProfile] = useState<PublicUserProfile | null>(null);
  const [products, setProducts] = useState<Product[]>([]);
  const [reviews, setReviews] = useState<UserReview[]>([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState<'listings' | 'reviews'>('listings');

  useEffect(() => {
    const loadUserData = async () => {
      setLoading(true);
      const [profileData, productsData, reviewsData] = await Promise.all([
        getPublicUserProfile(userId),
        getUserProducts(userId),
        getUserReviews(userId),
      ]);
      setProfile(profileData);
      setProducts(productsData);
      setReviews(reviewsData);
      setLoading(false);
    };
    loadUserData();
    window.scrollTo(0, 0);
  }, [userId]);

  if (loading) {
    return (
      <div className="min-h-screen bg-brand-white flex items-center justify-center">
        <div className="animate-pulse text-brand-burgundy/60">Loading profile...</div>
      </div>
    );
  }

  if (!profile) {
    return (
      <div className="min-h-screen bg-brand-white">
        <div className="container mx-auto px-4 py-8">
          <button onClick={onBack} className="font-body font-medium text-brand-blue mb-8 flex items-center hover:text-brand-orange">
            ← Back
          </button>
          <div className="text-center py-16">
            <p className="text-brand-burgundy/60">User not found</p>
          </div>
        </div>
      </div>
    );
  }

  const memberSince = new Date(profile.createdAt).toLocaleDateString('en-GB', {
    month: 'long',
    year: 'numeric',
  });

  return (
    <div className="min-h-screen bg-brand-white pb-20 animate-fade-in">
      <div className="container mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <button onClick={onBack} className="font-body font-medium text-brand-blue mb-8 flex items-center hover:text-brand-orange">
          ← Back
        </button>

        {/* Profile Header */}
        <div className="bg-white border border-brand-grey/30 rounded-2xl p-6 md:p-8 shadow-sm mb-8">
          <div className="flex flex-col md:flex-row items-start gap-6">
            {/* Avatar */}
            <div className="relative">
              <img
                src={profile.avatarUrl || 'https://i.pravatar.cc/150'}
                alt={profile.name}
                className="w-24 h-24 md:w-32 md:h-32 rounded-full object-cover border-4 border-brand-orange/20"
              />
              {profile.avgRating && profile.avgRating >= 4.5 && (
                <div className="absolute -bottom-2 -right-2 bg-brand-yellow text-brand-burgundy px-2 py-1 rounded-full text-xs font-bold shadow-sm">
                  Top Rated
                </div>
              )}
            </div>

            {/* Info */}
            <div className="flex-1">
              <div className="flex items-center gap-3 mb-2">
                <h1 className="font-heading text-3xl text-brand-burgundy">{profile.name}</h1>
                {profile.username && (
                  <span className="text-brand-burgundy/40 text-sm">@{profile.username}</span>
                )}
              </div>

              {/* Stats Row */}
              <div className="flex flex-wrap gap-4 md:gap-6 mb-4">
                <div className="flex items-center gap-2">
                  <svg className="w-5 h-5 text-brand-orange" fill="currentColor" viewBox="0 0 20 20">
                    <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
                  </svg>
                  <span className="font-bold text-brand-burgundy">
                    {profile.avgRating ? profile.avgRating.toFixed(1) : 'No ratings'}
                  </span>
                  <span className="text-brand-burgundy/50 text-sm">
                    ({profile._count.reviewsReceived} review{profile._count.reviewsReceived !== 1 ? 's' : ''})
                  </span>
                </div>
                <div className="flex items-center gap-2 text-brand-burgundy/70">
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 012-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10" />
                  </svg>
                  <span className="text-sm">{profile._count.products} listing{profile._count.products !== 1 ? 's' : ''}</span>
                </div>
                <div className="flex items-center gap-2 text-brand-burgundy/70">
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                  </svg>
                  <span className="text-sm">Member since {memberSince}</span>
                </div>
              </div>

              {/* Bio */}
              {profile.bio && (
                <p className="text-brand-burgundy/70 leading-relaxed max-w-2xl">{profile.bio}</p>
              )}
            </div>
          </div>
        </div>

        {/* Tabs */}
        <div className="border-b border-brand-grey/30 mb-6">
          <div className="flex gap-8">
            <button
              onClick={() => setActiveTab('listings')}
              className={`pb-3 font-heading text-sm transition-colors relative ${
                activeTab === 'listings'
                  ? 'text-brand-orange'
                  : 'text-brand-burgundy/60 hover:text-brand-burgundy'
              }`}
            >
              Listings ({products.length})
              {activeTab === 'listings' && (
                <div className="absolute bottom-0 left-0 right-0 h-0.5 bg-brand-orange" />
              )}
            </button>
            <button
              onClick={() => setActiveTab('reviews')}
              className={`pb-3 font-heading text-sm transition-colors relative ${
                activeTab === 'reviews'
                  ? 'text-brand-orange'
                  : 'text-brand-burgundy/60 hover:text-brand-burgundy'
              }`}
            >
              Reviews ({reviews.length})
              {activeTab === 'reviews' && (
                <div className="absolute bottom-0 left-0 right-0 h-0.5 bg-brand-orange" />
              )}
            </button>
          </div>
        </div>

        {/* Tab Content */}
        {activeTab === 'listings' && (
          <div>
            {products.length === 0 ? (
              <div className="text-center py-12 bg-gray-50 rounded-xl border border-brand-grey/20">
                <svg className="w-12 h-12 text-brand-burgundy/20 mx-auto mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M20 7l-8-4-8 4m16 0l-8 4m8-4v10l-8 4m0-10L4 7m8 4v10M4 7v10l8 4" />
                </svg>
                <p className="font-heading text-lg text-brand-burgundy/60">No listings yet</p>
              </div>
            ) : (
              <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4 md:gap-6">
                {products.map((product) => (
                  <button
                    key={product.id}
                    onClick={() => onProductClick(product)}
                    className="text-left group bg-white border border-brand-grey/20 rounded-xl overflow-hidden hover:shadow-lg transition-all"
                  >
                    <div className="aspect-square overflow-hidden">
                      <img
                        src={product.imageUrl}
                        alt={product.name}
                        className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                      />
                    </div>
                    <div className="p-3">
                      <p className="font-bold text-brand-burgundy text-sm truncate">{product.name}</p>
                      <p className="text-brand-orange font-heading text-sm">£{product.pricePerDay}/day</p>
                    </div>
                  </button>
                ))}
              </div>
            )}
          </div>
        )}

        {activeTab === 'reviews' && (
          <div>
            {reviews.length === 0 ? (
              <div className="text-center py-12 bg-gray-50 rounded-xl border border-brand-grey/20">
                <svg className="w-12 h-12 text-brand-burgundy/20 mx-auto mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" />
                </svg>
                <p className="font-heading text-lg text-brand-burgundy/60">No reviews yet</p>
              </div>
            ) : (
              <div className="space-y-4">
                {reviews.map((review) => (
                  <div key={review.id} className="bg-white border border-brand-grey/20 rounded-xl p-5 shadow-sm">
                    <div className="flex items-start justify-between mb-3">
                      <div className="flex items-center gap-3">
                        <img
                          src={review.reviewer.avatarUrl || 'https://i.pravatar.cc/150'}
                          alt={review.reviewer.name}
                          className="w-10 h-10 rounded-full object-cover border border-brand-grey/30"
                        />
                        <div>
                          <p className="font-bold text-brand-burgundy text-sm">{review.reviewer.name}</p>
                          <p className="text-xs text-brand-burgundy/50">
                            {new Date(review.createdAt).toLocaleDateString('en-GB', {
                              day: 'numeric',
                              month: 'short',
                              year: 'numeric',
                            })}
                            {review.product && (
                              <span className="ml-2 text-brand-blue">for {review.product.title}</span>
                            )}
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
        )}
      </div>
    </div>
  );
};

export default UserProfile;
