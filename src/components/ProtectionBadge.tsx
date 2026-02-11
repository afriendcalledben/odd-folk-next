'use client';

import React, { useState } from 'react';

interface ProtectionBadgeProps {
  variant?: 'badge' | 'card' | 'inline';
  showDetails?: boolean;
}

const ProtectionBadge: React.FC<ProtectionBadgeProps> = ({
  variant = 'badge',
  showDetails = false,
}) => {
  const [isExpanded, setIsExpanded] = useState(showDetails);

  if (variant === 'inline') {
    return (
      <div className="flex items-center gap-1.5 text-brand-blue">
        <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
          <path fillRule="evenodd" d="M2.166 4.999A11.954 11.954 0 0010 1.944 11.954 11.954 0 0017.834 5c.11.65.166 1.32.166 2.001 0 5.225-3.34 9.67-8 11.317C5.34 16.67 2 12.225 2 7c0-.682.057-1.35.166-2.001zm11.541 3.708a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
        </svg>
        <span className="text-xs font-bold">Protected by Odd Folk</span>
      </div>
    );
  }

  if (variant === 'badge') {
    return (
      <div className="inline-flex items-center gap-2 bg-brand-blue/10 text-brand-blue px-3 py-1.5 rounded-full">
        <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
          <path fillRule="evenodd" d="M2.166 4.999A11.954 11.954 0 0010 1.944 11.954 11.954 0 0017.834 5c.11.65.166 1.32.166 2.001 0 5.225-3.34 9.67-8 11.317C5.34 16.67 2 12.225 2 7c0-.682.057-1.35.166-2.001zm11.541 3.708a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
        </svg>
        <span className="text-xs font-bold uppercase tracking-wide">Protected</span>
      </div>
    );
  }

  // Card variant with expandable details
  return (
    <div className="bg-gradient-to-br from-brand-blue to-brand-blue/90 rounded-xl text-white overflow-hidden">
      <div className="p-4">
        <div className="flex items-start justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-white/20 rounded-lg flex items-center justify-center">
              <svg className="w-6 h-6" fill="currentColor" viewBox="0 0 20 20">
                <path fillRule="evenodd" d="M2.166 4.999A11.954 11.954 0 0010 1.944 11.954 11.954 0 0017.834 5c.11.65.166 1.32.166 2.001 0 5.225-3.34 9.67-8 11.317C5.34 16.67 2 12.225 2 7c0-.682.057-1.35.166-2.001zm11.541 3.708a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
              </svg>
            </div>
            <div>
              <h4 className="font-heading text-lg">Protected by Odd Folk</h4>
              <p className="text-xs text-white/70">Your rental is covered</p>
            </div>
          </div>
          <button
            onClick={() => setIsExpanded(!isExpanded)}
            className="text-white/60 hover:text-white transition-colors"
          >
            <svg
              className={`w-5 h-5 transition-transform ${isExpanded ? 'rotate-180' : ''}`}
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
            </svg>
          </button>
        </div>

        {isExpanded && (
          <div className="mt-4 pt-4 border-t border-white/20 space-y-4 animate-fade-in">
            {/* What's covered */}
            <div>
              <h5 className="text-sm font-bold mb-2 flex items-center gap-2">
                <svg className="w-4 h-4 text-brand-yellow" fill="currentColor" viewBox="0 0 20 20">
                  <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                </svg>
                What's covered
              </h5>
              <ul className="text-sm text-white/80 space-y-1.5">
                <li className="flex items-start gap-2">
                  <span className="text-brand-yellow">•</span>
                  Accidental damage up to the item's full value
                </li>
                <li className="flex items-start gap-2">
                  <span className="text-brand-yellow">•</span>
                  Theft during the rental period (police report required)
                </li>
                <li className="flex items-start gap-2">
                  <span className="text-brand-yellow">•</span>
                  Transport damage during pickup/return
                </li>
                <li className="flex items-start gap-2">
                  <span className="text-brand-yellow">•</span>
                  24/7 customer support for any issues
                </li>
              </ul>
            </div>

            {/* What's not covered */}
            <div>
              <h5 className="text-sm font-bold mb-2 flex items-center gap-2">
                <svg className="w-4 h-4 text-red-300" fill="currentColor" viewBox="0 0 20 20">
                  <path fillRule="evenodd" d="M4.293 4.293a1 1 0 011.414 0L10 8.586l4.293-4.293a1 1 0 111.414 1.414L11.414 10l4.293 4.293a1 1 0 01-1.414 1.414L10 11.414l-4.293 4.293a1 1 0 01-1.414-1.414L8.586 10 4.293 5.707a1 1 0 010-1.414z" clipRule="evenodd" />
                </svg>
                Not covered
              </h5>
              <ul className="text-sm text-white/60 space-y-1.5">
                <li className="flex items-start gap-2">
                  <span className="text-red-300">•</span>
                  Intentional damage or misuse
                </li>
                <li className="flex items-start gap-2">
                  <span className="text-red-300">•</span>
                  Normal wear and tear
                </li>
                <li className="flex items-start gap-2">
                  <span className="text-red-300">•</span>
                  Items not returned by agreed date
                </li>
              </ul>
            </div>

            {/* Claim process */}
            <div className="bg-white/10 rounded-lg p-3">
              <h5 className="text-sm font-bold mb-1">How to make a claim</h5>
              <p className="text-xs text-white/70">
                Report any issues within 24 hours of return through your dashboard. Include photos and a description.
                We'll review and resolve most claims within 48 hours.
              </p>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default ProtectionBadge;
