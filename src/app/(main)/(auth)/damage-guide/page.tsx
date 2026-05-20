'use client';

import { useSearchParams } from 'next/navigation';
import Link from 'next/link';
import { MessageCircle, Phone, ChevronLeft, AlertTriangle } from 'lucide-react';

export default function DamageGuidePage() {
  const searchParams = useSearchParams();
  const threadId = searchParams.get('threadId');
  const product = searchParams.get('product');

  return (
    <div className="min-h-screen bg-brand-cream py-12 px-4">
      <div className="max-w-2xl mx-auto">

        {/* Back link */}
        <Link
          href="/dashboard?tab=bookings"
          className="inline-flex items-center gap-1.5 text-sm font-body text-brand-burgundy/60 hover:text-brand-burgundy mb-8 transition-colors"
        >
          <ChevronLeft className="w-4 h-4" />
          Back to bookings
        </Link>

        {/* Header */}
        <div className="flex items-start gap-4 mb-10">
          <div className="w-12 h-12 bg-red-100 rounded-2xl flex items-center justify-center flex-shrink-0 mt-1">
            <AlertTriangle className="w-6 h-6 text-red-500" />
          </div>
          <div>
            <h1 className="font-heading text-3xl text-brand-burgundy leading-tight">
              Item damage reported
            </h1>
            {product && (
              <p className="font-body text-brand-burgundy/60 mt-1">{product}</p>
            )}
            <p className="font-body text-brand-burgundy/70 mt-3 leading-relaxed">
              We&apos;re sorry to hear something went wrong. Here&apos;s how to handle it — most issues are resolved quickly between both parties.
            </p>
          </div>
        </div>

        <div className="space-y-5">

          {/* Step 1 */}
          <div className="bg-white border border-brand-grey/50 rounded-2xl overflow-hidden shadow-sm">
            <div className="bg-brand-blue px-6 py-4 flex items-center gap-3">
              <span className="w-7 h-7 rounded-full bg-white/20 text-white font-heading text-sm flex items-center justify-center flex-shrink-0">1</span>
              <h2 className="font-heading text-lg text-white">Talk to the other party first</h2>
            </div>
            <div className="p-6">
              <p className="font-body text-brand-burgundy/80 leading-relaxed mb-2">
                The fastest way to resolve a damage dispute is a direct conversation. Let the hirer know what you&apos;ve found, share photos if you have them, and give them a chance to respond.
              </p>
              <p className="font-body text-brand-burgundy/60 text-sm leading-relaxed mb-6">
                Many disputes are resolved this way — a misunderstanding about pre-existing wear, or a hirer who&apos;s happy to cover costs once they know the situation.
              </p>
              {threadId ? (
                <Link
                  href={`/inbox?t=${threadId}`}
                  className="inline-flex items-center gap-2 bg-brand-blue text-white font-body font-bold px-6 py-3 rounded-xl hover:brightness-110 transition-all shadow-sm"
                >
                  <MessageCircle className="w-4 h-4" />
                  Open conversation
                </Link>
              ) : (
                <Link
                  href="/inbox"
                  className="inline-flex items-center gap-2 bg-brand-blue text-white font-body font-bold px-6 py-3 rounded-xl hover:brightness-110 transition-all shadow-sm"
                >
                  <MessageCircle className="w-4 h-4" />
                  Go to inbox
                </Link>
              )}
            </div>
          </div>

          {/* Step 2 */}
          <div className="bg-white border border-brand-grey/50 rounded-2xl overflow-hidden shadow-sm">
            <div className="bg-brand-burgundy px-6 py-4 flex items-center gap-3">
              <span className="w-7 h-7 rounded-full bg-white/20 text-white font-heading text-sm flex items-center justify-center flex-shrink-0">2</span>
              <h2 className="font-heading text-lg text-white">Still unresolved? Contact Odd Folk</h2>
            </div>
            <div className="p-6">
              <p className="font-body text-brand-burgundy/80 leading-relaxed mb-2">
                If you&apos;ve tried to reach an agreement and it hasn&apos;t worked out, we&apos;re here to help. Odd Folk can step in to moderate the dispute and help both parties reach a fair outcome.
              </p>
              <p className="font-body text-brand-burgundy/60 text-sm leading-relaxed mb-6">
                When you contact us, please include photos of the damage, the booking reference, and a summary of what happened and what resolution you&apos;re looking for.
              </p>
              <Link
                href="/contact"
                className="inline-flex items-center gap-2 bg-brand-orange text-white font-body font-bold px-6 py-3 rounded-xl hover:brightness-110 transition-all shadow-sm"
              >
                <Phone className="w-4 h-4" />
                Contact Odd Folk
              </Link>
            </div>
          </div>

        </div>

        {/* Footer note */}
        <p className="font-body text-xs text-brand-burgundy/40 text-center mt-8 leading-relaxed">
          Odd Folk acts as a mediator in damage disputes. We&apos;ll review all evidence and work with both parties to reach a fair resolution.
        </p>

      </div>
    </div>
  );
}
