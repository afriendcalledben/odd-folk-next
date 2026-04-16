'use client';

import Link from 'next/link';
import { ChevronRight } from 'lucide-react';

interface BookingInfo {
  id: string;
  status: string;
  startDate: string;
  endDate: string;
  totalHirerCost: number;
}

const STATUS_LABELS: Record<string, { label: string; colour: string }> = {
  PENDING:      { label: 'Awaiting response', colour: 'bg-yellow-50 text-yellow-800 border-yellow-200' },
  APPROVED:     { label: 'Approved — payment pending', colour: 'bg-blue-50 text-blue-800 border-blue-200' },
  DECLINED:     { label: 'Declined', colour: 'bg-red-50 text-red-700 border-red-200' },
  CANCELLED:    { label: 'Cancelled', colour: 'bg-red-50 text-red-700 border-red-200' },
  AUTO_DECLINED:{ label: 'Automatically declined', colour: 'bg-red-50 text-red-700 border-red-200' },
  PAID:         { label: 'Payment confirmed', colour: 'bg-green-50 text-green-800 border-green-200' },
  COLLECTED:    { label: 'Items collected', colour: 'bg-green-50 text-green-800 border-green-200' },
  RETURNED:     { label: 'Items returned', colour: 'bg-green-50 text-green-800 border-green-200' },
  COMPLETED:    { label: 'Completed', colour: 'bg-brand-grey/10 text-brand-burgundy/60 border-brand-grey/20' },
};

function fmtDate(dateStr: string) {
  return new Date(dateStr).toLocaleDateString('en-GB', { day: 'numeric', month: 'short' });
}

export default function BookingStatusBanner({ booking }: { booking: BookingInfo }) {
  const info = STATUS_LABELS[booking.status.toUpperCase()] ?? { label: booking.status, colour: 'bg-brand-grey/10 text-brand-burgundy/60 border-brand-grey/20' };

  return (
    <Link
      href={`/dashboard?tab=bookings`}
      className={`flex items-center justify-between px-4 py-2.5 border-b text-xs font-body ${info.colour} hover:opacity-80 transition-opacity`}
    >
      <div className="flex items-center gap-2">
        <span className="font-semibold">{info.label}</span>
        <span className="opacity-60">·</span>
        <span className="opacity-70">{fmtDate(booking.startDate)} – {fmtDate(booking.endDate)}</span>
      </div>
      <div className="flex items-center gap-1 opacity-60">
        <span>View booking</span>
        <ChevronRight className="w-3 h-3" />
      </div>
    </Link>
  );
}
