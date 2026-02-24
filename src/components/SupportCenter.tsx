'use client';


import React, { useState } from 'react';
import { createDispute, reportUser, updateBookingStatus } from '../services/api';

interface SupportCenterProps {
  mode: 'dispute' | 'report_user' | 'handover' | 'return';
  bookingId?: string; // Required for dispute/handover
  targetId?: string;  // Required for report_user
  onClose: () => void;
}

const SupportCenter: React.FC<SupportCenterProps> = ({ mode, bookingId, targetId, onClose }) => {
  const [step, setStep] = useState(1);
  const [reason, setReason] = useState('');
  const [description, setDescription] = useState('');
  const [file, setFile] = useState<File | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [success, setSuccess] = useState(false);

  // Handover specific state
  const [conditionConfirmed, setConditionConfirmed] = useState(false);
  const [photosTaken, setPhotosTaken] = useState(false);

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      setFile(e.target.files[0]);
      console.log("Mock file upload:", e.target.files[0].name);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);

    try {
      if (mode === 'dispute' && bookingId) {
        await createDispute(bookingId, reason, description, file ? 'mock_url' : undefined);
      } else if (mode === 'report_user' && targetId) {
        await reportUser(targetId, reason, description);
      } else if (mode === 'handover' && bookingId) {
        await updateBookingStatus(bookingId, 'active');
      } else if (mode === 'return' && bookingId) {
        await updateBookingStatus(bookingId, 'completed');
      }
      setSuccess(true);
    } catch (err) {
      console.error(err);
      alert("Something went wrong. Please try again.");
    } finally {
      setIsSubmitting(false);
    }
  };

  if (success) {
    return (
      <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4 animate-fade-in">
        <div className="bg-white rounded-2xl p-8 max-w-sm text-center shadow-2xl">
          <div className="w-16 h-16 bg-green-100 text-green-600 rounded-full flex items-center justify-center mx-auto mb-4">
            <svg className="w-8 h-8" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" /></svg>
          </div>
          <h3 className="font-heading text-xl text-brand-burgundy mb-2">Success</h3>
          <p className="text-sm text-brand-burgundy/70 mb-6">
            {mode === 'handover' ? 'Handover complete! Enjoy your rental.' : 
             mode === 'return' ? 'Return confirmed. Funds released.' : 
             'Your report has been submitted for review.'}
          </p>
          <button onClick={onClose} className="w-full bg-brand-blue text-white py-2 rounded-lg font-bold">Close</button>
        </div>
      </div>
    );
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4 animate-fade-in">
      <div className="bg-brand-white rounded-2xl w-full max-w-lg shadow-2xl overflow-hidden flex flex-col max-h-[90vh]">
        
        {/* Header */}
        <div className="p-4 border-b border-brand-grey flex justify-between items-center bg-gray-50">
          <h2 className="font-heading text-xl text-brand-burgundy">
            {mode === 'dispute' && 'Open a Dispute'}
            {mode === 'report_user' && 'Report User'}
            {mode === 'handover' && 'Confirm Handover'}
            {mode === 'return' && 'Confirm Return'}
          </h2>
          <button onClick={onClose} className="text-brand-burgundy/50 hover:text-brand-orange">
            <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" /></svg>
          </button>
        </div>

        {/* Content */}
        <div className="p-6 overflow-y-auto">
          
          {/* HANDOVER / RETURN FLOW */}
          {(mode === 'handover' || mode === 'return') && (
            <div className="space-y-6">
              <div className="bg-blue-50 p-4 rounded-xl border border-blue-100">
                <p className="text-sm text-blue-800">
                  {mode === 'handover' 
                    ? "Please inspect the item carefully before confirming receipt."
                    : "Please inspect the item for any new damage before confirming return."}
                </p>
              </div>

              <div className="space-y-3">
                <label className="flex items-center p-3 border border-brand-grey rounded-lg cursor-pointer hover:bg-gray-50">
                  <input type="checkbox" checked={conditionConfirmed} onChange={(e) => setConditionConfirmed(e.target.checked)} className="w-5 h-5 text-brand-blue rounded focus:ring-brand-blue" />
                  <span className="ml-3 font-body text-brand-burgundy">Item matches condition description</span>
                </label>
                <label className="flex items-center p-3 border border-brand-grey rounded-lg cursor-pointer hover:bg-gray-50">
                  <input type="checkbox" checked={photosTaken} onChange={(e) => setPhotosTaken(e.target.checked)} className="w-5 h-5 text-brand-blue rounded focus:ring-brand-blue" />
                  <span className="ml-3 font-body text-brand-burgundy">I have taken photos for my records</span>
                </label>
              </div>

              <button 
                onClick={handleSubmit} 
                disabled={!conditionConfirmed || !photosTaken || isSubmitting}
                className="w-full bg-brand-orange text-white py-3 rounded-xl font-bold hover:brightness-95 disabled:bg-gray-300 disabled:cursor-not-allowed"
              >
                {isSubmitting ? 'Processing...' : 'Confirm & Complete'}
              </button>

              <div className="text-center pt-2">
                <button className="text-sm text-red-500 font-bold hover:underline">
                  Report an issue instead
                </button>
              </div>
            </div>
          )}

          {/* DISPUTE / REPORT FORM */}
          {(mode === 'dispute' || mode === 'report_user') && (
            <form onSubmit={handleSubmit} className="space-y-6">
              <div>
                <label className="block text-sm font-bold text-brand-burgundy mb-2">Reason</label>
                <select 
                  value={reason} 
                  onChange={(e) => setReason(e.target.value)} 
                  required 
                  className="w-full p-3 border border-brand-grey rounded-lg focus:ring-1 focus:ring-brand-orange outline-none"
                >
                  <option value="" disabled>Select a reason...</option>
                  {mode === 'dispute' ? (
                    <>
                      <option value="damage">Item damaged</option>
                      <option value="missing_item">Item missing / not received</option>
                      <option value="not_as_described">Not as described</option>
                      <option value="other">Other</option>
                    </>
                  ) : (
                    <>
                      <option value="harassment">Harassment</option>
                      <option value="scam">Suspicious / Scam</option>
                      <option value="no_show">No show</option>
                      <option value="other">Other</option>
                    </>
                  )}
                </select>
              </div>

              <div>
                <label className="block text-sm font-bold text-brand-burgundy mb-2">Description</label>
                <textarea 
                  value={description} 
                  onChange={(e) => setDescription(e.target.value)} 
                  required 
                  rows={4}
                  className="w-full p-3 border border-brand-grey rounded-lg focus:ring-1 focus:ring-brand-orange outline-none resize-none"
                  placeholder="Please provide specific details..."
                ></textarea>
              </div>

              {mode === 'dispute' && (
                <div>
                  <label className="block text-sm font-bold text-brand-burgundy mb-2">Evidence (Optional)</label>
                  <div className="border-2 border-dashed border-brand-grey rounded-lg p-6 text-center cursor-pointer hover:bg-gray-50 transition-colors">
                    <input type="file" onChange={handleFileUpload} className="hidden" id="file-upload" />
                    <label htmlFor="file-upload" className="cursor-pointer">
                      <p className="text-brand-blue font-bold">Click to upload photo</p>
                      <p className="text-xs text-brand-burgundy/50 mt-1">{file ? file.name : 'JPG, PNG up to 5MB'}</p>
                    </label>
                  </div>
                </div>
              )}

              <button 
                type="submit" 
                disabled={isSubmitting}
                className="w-full bg-brand-burgundy text-white py-3 rounded-xl font-bold hover:bg-brand-orange transition-colors"
              >
                {isSubmitting ? 'Submitting...' : 'Submit Report'}
              </button>
            </form>
          )}
        </div>
      </div>
    </div>
  );
};

export default SupportCenter;
