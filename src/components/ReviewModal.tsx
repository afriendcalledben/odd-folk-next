'use client';

import { useState } from 'react';
import { X } from 'lucide-react';
import toast from 'react-hot-toast';
import { submitBookingReview } from '@/services/api';

interface ReviewModalProps {
  bookingId: string;
  otherPartyName: string;
  onClose: () => void;
  onSuccess: () => void;
}

export default function ReviewModal({ bookingId, otherPartyName, onClose, onSuccess }: ReviewModalProps) {
  const [rating, setRating] = useState(0);
  const [hovered, setHovered] = useState(0);
  const [comment, setComment] = useState('');
  const [submitting, setSubmitting] = useState(false);

  async function handleSubmit() {
    if (rating === 0) {
      toast.error('Please select a star rating');
      return;
    }
    setSubmitting(true);
    try {
      await submitBookingReview(bookingId, rating, comment.trim() || undefined);
      toast.success('Review submitted!');
      onSuccess();
      onClose();
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : 'Failed to submit review';
      if (msg.includes('already')) {
        toast.error("You've already reviewed this booking");
        onSuccess();
        onClose();
      } else {
        toast.error(msg);
      }
    } finally {
      setSubmitting(false);
    }
  }

  const displayRating = hovered || rating;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      <div className="absolute inset-0 bg-brand-burgundy/40 backdrop-blur-sm" onClick={onClose} />
      <div className="relative bg-white rounded-3xl shadow-2xl p-8 w-full max-w-md">
        <button
          onClick={onClose}
          className="absolute top-4 right-4 text-brand-burgundy/40 hover:text-brand-burgundy transition-colors"
        >
          <X className="w-5 h-5" />
        </button>

        <h2 className="font-heading text-2xl text-brand-burgundy mb-1">Leave a review</h2>
        <p className="font-body text-brand-burgundy/60 text-sm mb-6">
          How was your experience with <span className="font-semibold text-brand-burgundy">{otherPartyName}</span>?
        </p>

        {/* Star picker */}
        <div className="flex gap-2 mb-6" onMouseLeave={() => setHovered(0)}>
          {[1, 2, 3, 4, 5].map(star => (
            <button
              key={star}
              onMouseEnter={() => setHovered(star)}
              onClick={() => setRating(star)}
              className="text-4xl transition-transform hover:scale-110 focus:outline-none"
              aria-label={`${star} star`}
            >
              <span className={star <= displayRating ? 'text-brand-orange' : 'text-brand-grey'}>★</span>
            </button>
          ))}
        </div>

        {/* Comment */}
        <div className="mb-6">
          <label className="block font-body text-sm font-medium text-brand-burgundy mb-2">
            Share a few words <span className="text-brand-burgundy/40 font-normal">(optional)</span>
          </label>
          <textarea
            value={comment}
            onChange={e => setComment(e.target.value)}
            rows={3}
            maxLength={500}
            placeholder="What made this experience great (or not)?"
            className="w-full p-3 bg-brand-white border border-brand-grey rounded-xl font-body text-brand-burgundy placeholder:text-brand-burgundy/40 focus:outline-none focus:ring-2 focus:ring-brand-orange/30 transition-colors resize-none"
          />
        </div>

        <div className="flex gap-3">
          <button
            onClick={onClose}
            className="flex-1 py-3 rounded-xl font-body font-semibold text-brand-burgundy border border-brand-grey hover:bg-brand-grey/20 transition-colors"
          >
            Cancel
          </button>
          <button
            onClick={handleSubmit}
            disabled={submitting || rating === 0}
            className="flex-1 py-3 rounded-xl font-body font-semibold bg-brand-orange text-white disabled:opacity-50 hover:bg-brand-orange/90 transition-colors"
          >
            {submitting ? 'Submitting…' : 'Submit review'}
          </button>
        </div>
      </div>
    </div>
  );
}
