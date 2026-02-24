'use client';


import React, { useState } from 'react';

interface ReportIssueProps {
  onClose: () => void;
  type: 'item' | 'user';
  id: string;
}

const ReportIssue: React.FC<ReportIssueProps> = ({ onClose, type, id }) => {
  const [reason, setReason] = useState('');
  const [details, setDetails] = useState('');
  const [submitted, setSubmitted] = useState(false);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    // Simulate API call
    setTimeout(() => setSubmitted(true), 1000);
  };

  if (submitted) {
    return (
      <div className="fixed inset-0 z-[60] flex items-center justify-center bg-black/50 backdrop-blur-sm p-4 animate-fade-in">
        <div className="bg-white rounded-2xl p-8 max-w-md text-center shadow-xl">
          <div className="w-16 h-16 bg-green-100 text-green-600 rounded-full flex items-center justify-center mx-auto mb-4">
            <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" /></svg>
          </div>
          <h3 className="font-heading text-xl text-brand-burgundy mb-2">Report Received</h3>
          <p className="font-body text-brand-burgundy/70 mb-6 text-sm">Thank you for keeping our community safe. We will review your report within 24 hours.</p>
          <button onClick={onClose} className="bg-brand-blue text-white px-6 py-2 rounded-lg font-bold hover:brightness-90 transition-all">Close</button>
        </div>
      </div>
    );
  }

  return (
    <div className="fixed inset-0 z-[60] flex items-center justify-center bg-black/50 backdrop-blur-sm p-4 animate-fade-in">
      <div className="bg-white rounded-2xl w-full max-w-lg p-6 md:p-8 relative shadow-2xl">
        <button onClick={onClose} className="absolute top-4 right-4 text-brand-burgundy/40 hover:text-brand-orange transition-colors">
          <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" /></svg>
        </button>
        
        <h2 className="font-heading text-2xl text-brand-burgundy mb-2">Report {type}</h2>
        <p className="font-body text-sm text-brand-burgundy/60 mb-6">
          Please describe why you are reporting this {type}. This report will be kept anonymous.
        </p>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-sm font-bold text-brand-burgundy mb-2">Reason</label>
            <select 
              value={reason} 
              onChange={(e) => setReason(e.target.value)}
              className="w-full p-3 border border-brand-grey rounded-lg focus:outline-none focus:border-brand-orange text-brand-burgundy font-body"
              required
            >
              <option value="" disabled>Select a reason</option>
              <option value="inappropriate">Inappropriate content</option>
              <option value="scam">Suspicious or scam</option>
              <option value="misleading">Misleading information</option>
              <option value="harassment">Harassment or abusive behavior</option>
              <option value="other">Other</option>
            </select>
          </div>
          
          <div>
            <label className="block text-sm font-bold text-brand-burgundy mb-2">Details</label>
            <textarea 
              value={details}
              onChange={(e) => setDetails(e.target.value)}
              className="w-full p-3 border border-brand-grey rounded-lg h-32 resize-none focus:outline-none focus:border-brand-orange text-brand-burgundy font-body"
              placeholder="Please provide more context..."
              required
            ></textarea>
          </div>

          <button type="submit" className="w-full bg-brand-burgundy text-white py-3 rounded-lg font-bold hover:bg-brand-orange transition-colors">
            Submit Report
          </button>
        </form>
      </div>
    </div>
  );
};

export default ReportIssue;
