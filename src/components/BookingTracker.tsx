'use client';

import React from 'react';

const STEPS = [
  { label: 'Request' },
  { label: 'Accepted' },
  { label: 'Payment' },
  { label: 'Collected' },
  { label: 'Returned' },
  { label: 'Return\naccepted' },
];

const DOT_SIZE = 28; // px — matches w-7 h-7

function getProgress(status: string): { activeStep: number; isFailed: boolean; failLabel: string } {
  switch (status) {
    case 'pending':          return { activeStep: 0, isFailed: false, failLabel: '' };
    case 'approved':         return { activeStep: 1, isFailed: false, failLabel: '' };
    case 'declined':
    case 'auto_declined':    return { activeStep: 1, isFailed: true,  failLabel: 'Declined' };
    case 'cancelled':        return { activeStep: 1, isFailed: true,  failLabel: 'Cancelled' };
    case 'paid':             return { activeStep: 2, isFailed: false, failLabel: '' };
    case 'handover_pending':
    case 'active':
    case 'collected':        return { activeStep: 3, isFailed: false, failLabel: '' };
    case 'return_pending':
    case 'returned':         return { activeStep: 4, isFailed: false, failLabel: '' };
    case 'completed':        return { activeStep: 5, isFailed: false, failLabel: '' };
    default:                 return { activeStep: 0, isFailed: false, failLabel: '' };
  }
}

export default function BookingTracker({ status }: { status: string }) {
  const { activeStep, isFailed, failLabel } = getProgress(status);
  const totalSegments = STEPS.length - 1; // 5
  const fillPercent = (activeStep / totalSegments) * 100;

  return (
    <div className="w-full py-3">
      {/* ── Dots row (fixed height = dot diameter) ── */}
      <div className="relative flex justify-between items-center" style={{ height: DOT_SIZE }}>

        {/* Line container: starts at centre of first dot, ends at centre of last dot */}
        <div
          className="absolute top-0 bottom-0 flex items-center"
          style={{ left: DOT_SIZE / 2, right: DOT_SIZE / 2 }}
        >
          {/* Grey base */}
          <div className="absolute inset-x-0 h-[2px] bg-brand-grey/30" />
          {/* Coloured fill */}
          <div
            className={`absolute left-0 h-[2px] transition-all duration-500 ${isFailed ? 'bg-red-400' : 'bg-brand-orange'}`}
            style={{ width: `${fillPercent}%` }}
          />
        </div>

        {/* Dots */}
        {STEPS.map((step, i) => {
          const isCompleted = i < activeStep;
          const isActive    = i === activeStep;
          const isFail      = isActive && isFailed;
          const isUpcoming  = i > activeStep;

          return (
            <div
              key={i}
              style={{ width: DOT_SIZE, height: DOT_SIZE }}
              className={[
                'relative z-10 rounded-full flex items-center justify-center flex-shrink-0 transition-all duration-300',
                isCompleted              ? 'bg-brand-orange'                          : '',
                isActive && !isFail      ? 'bg-brand-orange ring-4 ring-brand-orange/20' : '',
                isFail                   ? 'bg-red-500 ring-4 ring-red-500/20'        : '',
                isUpcoming               ? 'bg-white border-2 border-brand-grey/40'  : '',
              ].join(' ')}
            >
              {isCompleted && (
                <svg className="w-3.5 h-3.5 text-white" fill="none" stroke="currentColor" strokeWidth={3} viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
                </svg>
              )}
              {isActive && !isFail && (
                <div className="w-2.5 h-2.5 rounded-full bg-white" />
              )}
              {isFail && (
                <svg className="w-3.5 h-3.5 text-white" fill="none" stroke="currentColor" strokeWidth={3} viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
                </svg>
              )}
            </div>
          );
        })}
      </div>

      {/* ── Labels row (separate from dots so it doesn't affect line positioning) ── */}
      <div className="hidden sm:flex justify-between mt-2">
        {STEPS.map((step, i) => {
          const isCompleted = i < activeStep;
          const isActive    = i === activeStep;
          const isFail      = isActive && isFailed;
          const isUpcoming  = i > activeStep;
          const label       = isFail ? failLabel : step.label;

          return (
            <div
              key={i}
              style={{ width: DOT_SIZE }}
              className="flex justify-center"
            >
              <span
                className={[
                  'text-[9px] uppercase tracking-wide text-center leading-tight whitespace-pre-line',
                  isCompleted         ? 'text-brand-burgundy/50'         : '',
                  isActive && !isFail ? 'text-brand-burgundy font-bold'  : '',
                  isFail              ? 'text-red-500 font-bold'         : '',
                  isUpcoming          ? 'text-brand-burgundy/30'         : '',
                ].join(' ')}
              >
                {label}
              </span>
            </div>
          );
        })}
      </div>
    </div>
  );
}
