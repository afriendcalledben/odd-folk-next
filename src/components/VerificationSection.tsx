'use client';

import React, { useState, useEffect } from 'react';
import {
  getVerificationStatus,
  submitVerificationDocument,
  verifyPhone,
  uploadImages,
  type VerificationStatus,
} from '../services/api';

interface VerificationSectionProps {
  onVerificationChange?: () => void;
}

const VerificationSection: React.FC<VerificationSectionProps> = ({ onVerificationChange }) => {
  const [status, setStatus] = useState<VerificationStatus | null>(null);
  const [loading, setLoading] = useState(true);
  const [uploadingId, setUploadingId] = useState(false);
  const [uploadingAddress, setUploadingAddress] = useState(false);
  const [phone, setPhone] = useState('');
  const [verifyingPhone, setVerifyingPhone] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  useEffect(() => {
    loadStatus();
  }, []);

  const loadStatus = async () => {
    try {
      const data = await getVerificationStatus();
      setStatus(data);
    } catch (err) {
      console.error('Failed to load verification status:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleFileUpload = async (type: 'id' | 'address', file: File) => {
    setError('');
    setSuccess('');

    if (type === 'id') {
      setUploadingId(true);
    } else {
      setUploadingAddress(true);
    }

    try {
      // Upload the file
      const urls = await uploadImages([file]);
      if (!urls.length) {
        throw new Error('Failed to upload file');
      }

      // Submit for verification
      await submitVerificationDocument(type, urls[0]);
      setSuccess(`${type === 'id' ? 'ID' : 'Address'} document uploaded and verified!`);
      loadStatus();
      onVerificationChange?.();
    } catch (err: any) {
      setError(err.message || 'Failed to upload document');
    } finally {
      setUploadingId(false);
      setUploadingAddress(false);
    }
  };

  const handlePhoneVerify = async () => {
    if (!phone || phone.length < 10) {
      setError('Please enter a valid phone number');
      return;
    }

    setError('');
    setSuccess('');
    setVerifyingPhone(true);

    try {
      await verifyPhone(phone);
      setSuccess('Phone number verified!');
      loadStatus();
      onVerificationChange?.();
    } catch (err: any) {
      setError(err.message || 'Failed to verify phone');
    } finally {
      setVerifyingPhone(false);
    }
  };

  if (loading) {
    return (
      <div className="animate-pulse space-y-4">
        <div className="h-8 bg-gray-200 rounded w-1/3"></div>
        <div className="h-24 bg-gray-200 rounded"></div>
        <div className="h-24 bg-gray-200 rounded"></div>
      </div>
    );
  }

  const isFullyVerified = status?.isFullyVerified;

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="font-heading text-2xl text-brand-burgundy">Verification</h2>
          <p className="text-sm text-brand-burgundy/60 mt-1">
            Verify your identity to build trust with other users
          </p>
        </div>
        {isFullyVerified && (
          <div className="flex items-center gap-2 bg-green-50 text-green-700 px-4 py-2 rounded-full">
            <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20">
              <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
            </svg>
            <span className="font-bold text-sm">Fully Verified</span>
          </div>
        )}
      </div>

      {error && (
        <div className="bg-red-50 text-red-600 px-4 py-3 rounded-lg text-sm">
          {error}
        </div>
      )}

      {success && (
        <div className="bg-green-50 text-green-600 px-4 py-3 rounded-lg text-sm">
          {success}
        </div>
      )}

      <div className="grid gap-4">
        {/* ID Verification */}
        <div className={`border rounded-xl p-5 ${status?.idVerified ? 'bg-green-50 border-green-200' : 'bg-white border-brand-grey/30'}`}>
          <div className="flex items-start justify-between">
            <div className="flex items-center gap-3">
              <div className={`w-12 h-12 rounded-xl flex items-center justify-center ${status?.idVerified ? 'bg-green-100 text-green-600' : 'bg-brand-blue/10 text-brand-blue'}`}>
                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 6H5a2 2 0 00-2 2v9a2 2 0 002 2h14a2 2 0 002-2V8a2 2 0 00-2-2h-5m-4 0V5a2 2 0 114 0v1m-4 0a2 2 0 104 0m-5 8a2 2 0 100-4 2 2 0 000 4zm0 0c1.306 0 2.417.835 2.83 2M9 14a3.001 3.001 0 00-2.83 2M15 11h3m-3 4h2" />
                </svg>
              </div>
              <div>
                <h3 className="font-heading text-lg text-brand-burgundy">ID Verification</h3>
                <p className="text-sm text-brand-burgundy/60">Upload your passport or driving licence</p>
              </div>
            </div>
            {status?.idVerified ? (
              <span className="flex items-center gap-1 text-green-600 text-sm font-bold">
                <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
                  <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                </svg>
                Verified
              </span>
            ) : (
              <label className="cursor-pointer">
                <input
                  type="file"
                  accept="image/*,.pdf"
                  className="hidden"
                  onChange={(e) => {
                    const file = e.target.files?.[0];
                    if (file) handleFileUpload('id', file);
                  }}
                  disabled={uploadingId}
                />
                <span className={`inline-flex items-center gap-2 px-4 py-2 rounded-lg font-heading text-sm ${
                  uploadingId
                    ? 'bg-gray-200 text-gray-500 cursor-not-allowed'
                    : 'bg-brand-orange text-white hover:brightness-90'
                }`}>
                  {uploadingId ? (
                    <>
                      <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin"></div>
                      Uploading...
                    </>
                  ) : (
                    <>
                      <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-8l-4-4m0 0L8 8m4-4v12" />
                      </svg>
                      Upload
                    </>
                  )}
                </span>
              </label>
            )}
          </div>
        </div>

        {/* Address Verification */}
        <div className={`border rounded-xl p-5 ${status?.addressVerified ? 'bg-green-50 border-green-200' : 'bg-white border-brand-grey/30'}`}>
          <div className="flex items-start justify-between">
            <div className="flex items-center gap-3">
              <div className={`w-12 h-12 rounded-xl flex items-center justify-center ${status?.addressVerified ? 'bg-green-100 text-green-600' : 'bg-brand-blue/10 text-brand-blue'}`}>
                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6" />
                </svg>
              </div>
              <div>
                <h3 className="font-heading text-lg text-brand-burgundy">Address Verification</h3>
                <p className="text-sm text-brand-burgundy/60">Upload a utility bill or bank statement</p>
              </div>
            </div>
            {status?.addressVerified ? (
              <span className="flex items-center gap-1 text-green-600 text-sm font-bold">
                <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
                  <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                </svg>
                Verified
              </span>
            ) : (
              <label className="cursor-pointer">
                <input
                  type="file"
                  accept="image/*,.pdf"
                  className="hidden"
                  onChange={(e) => {
                    const file = e.target.files?.[0];
                    if (file) handleFileUpload('address', file);
                  }}
                  disabled={uploadingAddress}
                />
                <span className={`inline-flex items-center gap-2 px-4 py-2 rounded-lg font-heading text-sm ${
                  uploadingAddress
                    ? 'bg-gray-200 text-gray-500 cursor-not-allowed'
                    : 'bg-brand-orange text-white hover:brightness-90'
                }`}>
                  {uploadingAddress ? (
                    <>
                      <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin"></div>
                      Uploading...
                    </>
                  ) : (
                    <>
                      <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-8l-4-4m0 0L8 8m4-4v12" />
                      </svg>
                      Upload
                    </>
                  )}
                </span>
              </label>
            )}
          </div>
        </div>

        {/* Phone Verification */}
        <div className={`border rounded-xl p-5 ${status?.phoneVerified ? 'bg-green-50 border-green-200' : 'bg-white border-brand-grey/30'}`}>
          <div className="flex items-start justify-between">
            <div className="flex items-center gap-3">
              <div className={`w-12 h-12 rounded-xl flex items-center justify-center ${status?.phoneVerified ? 'bg-green-100 text-green-600' : 'bg-brand-blue/10 text-brand-blue'}`}>
                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z" />
                </svg>
              </div>
              <div className="flex-grow">
                <h3 className="font-heading text-lg text-brand-burgundy">Phone Verification</h3>
                <p className="text-sm text-brand-burgundy/60 mb-3">Verify your phone number</p>
                {!status?.phoneVerified && (
                  <div className="flex gap-2">
                    <input
                      type="tel"
                      placeholder="+44 7700 900000"
                      value={phone}
                      onChange={(e) => setPhone(e.target.value)}
                      className="flex-grow px-3 py-2 border border-brand-grey rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-brand-blue/30"
                    />
                    <button
                      onClick={handlePhoneVerify}
                      disabled={verifyingPhone}
                      className={`px-4 py-2 rounded-lg font-heading text-sm ${
                        verifyingPhone
                          ? 'bg-gray-200 text-gray-500 cursor-not-allowed'
                          : 'bg-brand-orange text-white hover:brightness-90'
                      }`}
                    >
                      {verifyingPhone ? 'Verifying...' : 'Verify'}
                    </button>
                  </div>
                )}
              </div>
            </div>
            {status?.phoneVerified && (
              <span className="flex items-center gap-1 text-green-600 text-sm font-bold">
                <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
                  <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                </svg>
                Verified
              </span>
            )}
          </div>
        </div>
      </div>

      {/* Benefits of verification */}
      <div className="bg-brand-blue/5 rounded-xl p-5 mt-6">
        <h4 className="font-heading text-sm text-brand-burgundy mb-3">Why verify?</h4>
        <ul className="space-y-2 text-sm text-brand-burgundy/70">
          <li className="flex items-center gap-2">
            <svg className="w-4 h-4 text-brand-blue" fill="currentColor" viewBox="0 0 20 20">
              <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
            </svg>
            Get a "Verified" badge on your profile and listings
          </li>
          <li className="flex items-center gap-2">
            <svg className="w-4 h-4 text-brand-blue" fill="currentColor" viewBox="0 0 20 20">
              <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
            </svg>
            Build trust with other users for faster bookings
          </li>
          <li className="flex items-center gap-2">
            <svg className="w-4 h-4 text-brand-blue" fill="currentColor" viewBox="0 0 20 20">
              <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
            </svg>
            Access higher rental limits and premium features
          </li>
          <li className="flex items-center gap-2">
            <svg className="w-4 h-4 text-brand-blue" fill="currentColor" viewBox="0 0 20 20">
              <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
            </svg>
            Priority customer support
          </li>
        </ul>
      </div>
    </div>
  );
};

export default VerificationSection;
