'use client';

import React from 'react';

interface PriceBreakdownProps {
  pricePerDay: number;
  days: number;
  quantity?: number;
  showListerPayout?: boolean;
  compact?: boolean;
}

// Fee percentages (configurable)
const SERVICE_FEE_PERCENT = 0.10; // 10% service fee
const PROTECTION_FEE_PERCENT = 0.05; // 5% damage protection
const LISTER_FEE_PERCENT = 0.10; // 10% platform fee for listers

const PriceBreakdown: React.FC<PriceBreakdownProps> = ({
  pricePerDay,
  days,
  quantity = 1,
  showListerPayout = false,
  compact = false,
}) => {
  // Calculate all fees
  const baseRental = pricePerDay * days * quantity;
  const serviceFee = baseRental * SERVICE_FEE_PERCENT;
  const protectionFee = baseRental * PROTECTION_FEE_PERCENT;
  const totalHirerCost = baseRental + serviceFee + protectionFee;

  // Lister receives 90% of base rental
  const listerPayout = baseRental * (1 - LISTER_FEE_PERCENT);

  if (compact) {
    return (
      <div className="space-y-2 text-sm">
        <div className="flex justify-between text-brand-burgundy/70">
          <span>£{pricePerDay.toFixed(0)} × {days} day{days !== 1 ? 's' : ''}{quantity > 1 ? ` × ${quantity}` : ''}</span>
          <span>£{baseRental.toFixed(2)}</span>
        </div>
        <div className="flex justify-between text-brand-burgundy/70">
          <span>Service fee</span>
          <span>£{serviceFee.toFixed(2)}</span>
        </div>
        <div className="flex justify-between text-brand-burgundy/70">
          <span>Damage protection</span>
          <span>£{protectionFee.toFixed(2)}</span>
        </div>
        <div className="border-t border-brand-grey/30 pt-2 mt-2 flex justify-between font-bold text-brand-burgundy">
          <span>Total</span>
          <span className="text-brand-orange">£{totalHirerCost.toFixed(2)}</span>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-gray-50 rounded-xl p-4 space-y-3">
      <h4 className="font-heading text-sm text-brand-burgundy mb-3">Price breakdown</h4>

      {/* Base rental */}
      <div className="flex justify-between items-center">
        <div className="flex items-center gap-2">
          <span className="text-sm text-brand-burgundy/80">
            Item rental ({days} day{days !== 1 ? 's' : ''})
            {quantity > 1 && <span className="text-brand-burgundy/50"> × {quantity}</span>}
          </span>
        </div>
        <span className="text-sm font-medium text-brand-burgundy">£{baseRental.toFixed(2)}</span>
      </div>

      {/* Service fee */}
      <div className="flex justify-between items-center">
        <div className="flex items-center gap-2">
          <span className="text-sm text-brand-burgundy/80">Service fee (10%)</span>
          <div className="group relative">
            <svg className="w-4 h-4 text-brand-burgundy/40 cursor-help" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
            <div className="absolute bottom-full left-1/2 -translate-x-1/2 mb-2 w-48 bg-brand-burgundy text-white text-xs p-2 rounded-lg opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none z-10">
              Helps us maintain the platform and provide customer support.
            </div>
          </div>
        </div>
        <span className="text-sm font-medium text-brand-burgundy">£{serviceFee.toFixed(2)}</span>
      </div>

      {/* Damage protection */}
      <div className="flex justify-between items-center">
        <div className="flex items-center gap-2">
          <span className="text-sm text-brand-burgundy/80">Damage protection (5%)</span>
          <div className="group relative">
            <svg className="w-4 h-4 text-brand-burgundy/40 cursor-help" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" />
            </svg>
            <div className="absolute bottom-full left-1/2 -translate-x-1/2 mb-2 w-48 bg-brand-burgundy text-white text-xs p-2 rounded-lg opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none z-10">
              Covers accidental damage up to the item's value. See our protection policy for details.
            </div>
          </div>
        </div>
        <span className="text-sm font-medium text-brand-burgundy">£{protectionFee.toFixed(2)}</span>
      </div>

      {/* Divider */}
      <div className="border-t border-brand-grey/30 pt-3">
        <div className="flex justify-between items-center">
          <span className="font-heading text-brand-burgundy">Total</span>
          <span className="font-heading text-xl text-brand-orange">£{totalHirerCost.toFixed(2)}</span>
        </div>
      </div>

      {/* Lister payout section */}
      {showListerPayout && (
        <div className="border-t border-brand-grey/30 pt-3 mt-3">
          <div className="flex justify-between items-center bg-brand-blue/5 -mx-4 -mb-4 px-4 py-3 rounded-b-xl">
            <div className="flex items-center gap-2">
              <svg className="w-4 h-4 text-brand-blue" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 9V7a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2m2 4h10a2 2 0 002-2v-6a2 2 0 00-2-2H9a2 2 0 00-2 2v6a2 2 0 002 2zm7-5a2 2 0 11-4 0 2 2 0 014 0z" />
              </svg>
              <span className="text-sm text-brand-burgundy/80">Lister receives (90%)</span>
            </div>
            <span className="font-bold text-brand-blue">£{listerPayout.toFixed(2)}</span>
          </div>
        </div>
      )}
    </div>
  );
};

export default PriceBreakdown;
