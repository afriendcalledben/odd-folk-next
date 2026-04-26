'use client';

import React, { useState } from 'react';
import { Input, Select, Textarea, Button } from '@/components/ui';
import TurnstileWidget from '@/components/TurnstileWidget';

interface ContactPageProps {
  onNavigate: (view: string) => void;
}

const ContactPage: React.FC<ContactPageProps> = ({ onNavigate }) => {
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    subject: '',
    message: '',
  });
  const [subscribeToNewsletter, setSubscribeToNewsletter] = useState(false);
  const [captchaToken, setCaptchaToken] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitted, setSubmitted] = useState(false);
  const [error, setError] = useState('');

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');

    if (!captchaToken) {
      setError('Please complete the CAPTCHA verification.');
      return;
    }

    setIsSubmitting(true);

    try {
      const res = await fetch('/api/contact', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ ...formData, captchaToken, subscribeToNewsletter }),
      });

      const json = await res.json();

      if (!res.ok) {
        setError(json.error || 'Failed to send message. Please try again.');
        return;
      }

      setSubmitted(true);
    } catch {
      setError('Failed to send message. Please try again.');
    } finally {
      setIsSubmitting(false);
    }
  };

  if (submitted) {
    return (
      <div className="bg-brand-white min-h-screen py-20">
        <div className="container mx-auto px-4 max-w-2xl text-center">
          <div className="w-20 h-20 bg-green-100 text-green-600 rounded-full flex items-center justify-center mx-auto mb-6">
            <svg className="w-10 h-10" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
            </svg>
          </div>
          <h1 className="font-heading text-4xl text-brand-burgundy mb-4">Message Sent!</h1>
          <p className="font-body text-brand-burgundy/70 text-lg mb-8">
            Thank you for reaching out. We'll get back to you within 24–48 hours. Check your inbox — we've sent you a confirmation email.
          </p>
          <Button onClick={() => onNavigate('home')}>
            Back to Home
          </Button>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-brand-white min-h-screen py-16">
      <div className="container mx-auto px-4 max-w-5xl">
        <div className="text-center mb-12">
          <h1 className="font-heading text-4xl md:text-5xl text-brand-burgundy mb-4">Get in Touch</h1>
          <p className="font-body text-brand-burgundy/70 text-lg max-w-2xl mx-auto">
            Have a question about Odd Folk? We're here to help. Send us a message and we'll respond as soon as possible.
          </p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-5 gap-12">
          {/* Contact Form */}
          <div className="lg:col-span-3">
            <div className="bg-white rounded-2xl border border-brand-grey/30 p-8 shadow-sm">
              <form onSubmit={handleSubmit} className="space-y-6">
                {error && (
                  <div className="bg-red-50 text-red-600 px-4 py-3 rounded-lg text-sm">
                    {error}
                  </div>
                )}

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <Input
                    label="Your Name"
                    type="text"
                    name="name"
                    required
                    value={formData.name}
                    onChange={handleChange}
                    placeholder="Jane Smith"
                  />
                  <Input
                    label="Email Address"
                    type="email"
                    name="email"
                    required
                    value={formData.email}
                    onChange={handleChange}
                    placeholder="jane@example.com"
                  />
                </div>

                <Select
                  label="Subject"
                  name="subject"
                  required
                  value={formData.subject}
                  onChange={handleChange}
                >
                  <option value="">Select a topic</option>
                  <option value="General Inquiry">General Inquiry</option>
                  <option value="Booking Help">Booking Help</option>
                  <option value="Listing Help">Listing Help</option>
                  <option value="Payment Issue">Payment Issue</option>
                  <option value="Report a Problem">Report a Problem</option>
                  <option value="Partnership">Partnership</option>
                  <option value="Press">Press</option>
                  <option value="Other">Other</option>
                </Select>

                <Textarea
                  label="Message"
                  name="message"
                  required
                  rows={6}
                  value={formData.message}
                  onChange={handleChange}
                  placeholder="Tell us how we can help..."
                />

                {/* Newsletter opt-in */}
                <label className="flex items-start gap-3 cursor-pointer group">
                  <input
                    type="checkbox"
                    checked={subscribeToNewsletter}
                    onChange={(e) => setSubscribeToNewsletter(e.target.checked)}
                    className="mt-0.5 w-4 h-4 accent-brand-orange rounded cursor-pointer"
                  />
                  <span className="font-body text-sm text-brand-burgundy/70 group-hover:text-brand-burgundy transition-colors">
                    Sign me up for Odd Folk updates — new listings, seasonal collections, and community news.
                  </span>
                </label>

                {/* CAPTCHA */}
                <div>
                  <TurnstileWidget
                    onVerify={setCaptchaToken}
                    onExpire={() => setCaptchaToken('')}
                  />
                  {!process.env.NEXT_PUBLIC_TURNSTILE_SITE_KEY && (
                    <p className="text-xs text-brand-burgundy/40 mt-1">CAPTCHA not configured (dev mode)</p>
                  )}
                </div>

                <Button type="submit" fullWidth size="lg" isLoading={isSubmitting}>
                  {isSubmitting ? 'Sending...' : 'Send Message'}
                </Button>
              </form>
            </div>
          </div>

          {/* Sidebar */}
          <div className="lg:col-span-2 space-y-6">
            {/* Response time card */}
            <div className="bg-brand-blue rounded-2xl p-6 text-white">
              <div className="flex items-center gap-4 mb-4">
                <div className="w-12 h-12 bg-white/20 rounded-xl flex items-center justify-center">
                  <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                </div>
                <div>
                  <p className="text-xs text-white/60 uppercase tracking-wider">Response time</p>
                  <p className="font-heading text-lg">Within 24–48 hours</p>
                </div>
              </div>
              <p className="text-sm text-white/70">
                We aim to respond to all enquiries during business days. You'll receive a confirmation email as soon as you submit.
              </p>
            </div>

            {/* FAQ Card */}
            <div className="bg-brand-yellow rounded-2xl p-6">
              <div className="flex items-center gap-4 mb-4">
                <div className="w-12 h-12 bg-brand-burgundy/10 rounded-xl flex items-center justify-center">
                  <svg className="w-6 h-6 text-brand-burgundy" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8.228 9c.549-1.165 2.03-2 3.772-2 2.21 0 4 1.343 4 3 0 1.4-1.278 2.575-3.006 2.907-.542.104-.994.54-.994 1.093m0 3h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                </div>
                <div>
                  <p className="font-heading text-lg text-brand-burgundy">Check our FAQ</p>
                </div>
              </div>
              <p className="text-sm text-brand-burgundy/70 mb-4">
                Find quick answers to common questions about renting, listing, and more.
              </p>
              <Button
                onClick={() => onNavigate('faq')}
                variant="danger"
                size="sm"
                fullWidth
              >
                View FAQ
              </Button>
            </div>

            {/* Location Card */}
            <div className="bg-white rounded-2xl border border-brand-grey/30 p-6">
              <div className="flex items-center gap-4 mb-4">
                <div className="w-12 h-12 bg-brand-orange/10 rounded-xl flex items-center justify-center">
                  <svg className="w-6 h-6 text-brand-orange" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
                  </svg>
                </div>
                <div>
                  <p className="text-xs text-brand-burgundy/60 uppercase tracking-wider">Based in</p>
                  <p className="font-heading text-lg text-brand-burgundy">London, UK</p>
                </div>
              </div>
              <p className="text-sm text-brand-burgundy/70">
                Odd Folk connects prop enthusiasts and event stylists across Greater London.
              </p>
            </div>

            {/* Social Links */}
            <div className="flex gap-4 justify-center">
              <a
                href="https://www.instagram.com/oddfolkhire"
                target="_blank"
                rel="noopener noreferrer"
                className="w-12 h-12 bg-brand-grey/20 rounded-xl flex items-center justify-center text-brand-burgundy/60 hover:bg-brand-orange hover:text-white transition-all"
              >
                <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24">
                  <path d="M12 2.163c3.204 0 3.584.012 4.85.07 3.252.148 4.771 1.691 4.919 4.919.058 1.265.069 1.645.069 4.849 0 3.205-.012 3.584-.069 4.849-.149 3.225-1.664 4.771-4.919 4.919-1.266.058-1.644.07-4.85.07-3.204 0-3.584-.012-4.849-.07-3.26-.149-4.771-1.699-4.919-4.92-.058-1.265-.07-1.644-.07-4.849 0-3.204.013-3.583.07-4.849.149-3.227 1.664-4.771 4.919-4.919 1.266-.057 1.645-.069 4.849-.069zm0-2.163c-3.259 0-3.667.014-4.947.072-4.358.2-6.78 2.618-6.98 6.98-.059 1.281-.073 1.689-.073 4.948 0 3.259.014 3.668.072 4.948.2 4.358 2.618 6.78 6.98 6.98 1.281.058 1.689.072 4.948.072 3.259 0 3.668-.014 4.948-.072 4.354-.2 6.782-2.618 6.979-6.98.059-1.28.073-1.689.073-4.948 0-3.259-.014-3.667-.072-4.947-.196-4.354-2.617-6.78-6.979-6.98-1.281-.059-1.69-.073-4.949-.073zm0 5.838c-3.403 0-6.162 2.759-6.162 6.162s2.759 6.163 6.162 6.163 6.162-2.759 6.162-6.163c0-3.403-2.759-6.162-6.162-6.162zm0 10.162c-2.209 0-4-1.79-4-4 0-2.209 1.791-4 4-4s4 1.791 4 4c0 2.21-1.791 4-4 4zm6.406-11.845c-.796 0-1.441.645-1.441 1.44s.645 1.44 1.441 1.44c.795 0 1.439-.645 1.439-1.44s-.644-1.44-1.439-1.44z"/>
                </svg>
              </a>
              <a
                href="https://www.facebook.com/oddfolkhire"
                target="_blank"
                rel="noopener noreferrer"
                className="w-12 h-12 bg-brand-grey/20 rounded-xl flex items-center justify-center text-brand-burgundy/60 hover:bg-brand-orange hover:text-white transition-all"
              >
                <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24">
                  <path d="M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.47h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.47h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z"/>
                </svg>
              </a>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ContactPage;
