'use client';

import React from 'react';

export const HowItWorks: React.FC = () => {
  return (
    <div className="bg-brand-white py-16 md:py-24">
      <div className="container mx-auto px-4 sm:px-6 lg:px-8 max-w-5xl">
        <div className="text-center mb-16">
            <h1 className="font-heading text-5xl md:text-6xl text-brand-orange mb-6">How Odd Folk Works</h1>
            <p className="font-body text-xl text-brand-burgundy/80 max-w-2xl mx-auto">
                Odd Folk is a peer-to-peer marketplace for styling items and props — we connect event professionals and creatives who need unique pieces with collectors and stylists who have them. Simple, secure, and community-focused.
            </p>
        </div>

        <div className="grid md:grid-cols-2 gap-16 mb-20">
            <div>
                <h2 className="font-heading text-3xl text-brand-blue mb-2">For Listers (Renting Out Your Items)</h2>
                <p className="font-body text-brand-burgundy/70 mb-8">Turn your creative collection into income by sharing your styling pieces with London&apos;s event community.</p>
                <div className="space-y-8">
                    <div className="flex">
                        <div className="flex-shrink-0 w-10 h-10 rounded-full bg-brand-yellow flex items-center justify-center font-heading text-brand-burgundy text-xl mr-4">1</div>
                        <div>
                            <h3 className="font-heading text-xl text-brand-burgundy mb-2">Create Your Account</h3>
                            <p className="font-body text-brand-burgundy/70">Sign up with your email, name, phone number, and London address. It takes just 2 minutes.</p>
                        </div>
                    </div>
                    <div className="flex">
                        <div className="flex-shrink-0 w-10 h-10 rounded-full bg-brand-yellow flex items-center justify-center font-heading text-brand-burgundy text-xl mr-4">2</div>
                        <div>
                            <h3 className="font-heading text-xl text-brand-burgundy mb-2">List Your Items</h3>
                            <p className="font-body text-brand-burgundy/70">Create listings for your styling items and props:</p>
                            <ul className="list-disc pl-5 mt-2 text-brand-burgundy/70 text-sm space-y-1">
                                <li>Upload high-quality photos</li>
                                <li>Write a detailed description including dimensions, condition, and setup notes</li>
                                <li>Set your daily/weekly rental prices</li>
                                <li>Add your collection address and availability</li>
                            </ul>
                        </div>
                    </div>
                    <div className="flex">
                        <div className="flex-shrink-0 w-10 h-10 rounded-full bg-brand-yellow flex items-center justify-center font-heading text-brand-burgundy text-xl mr-4">3</div>
                        <div>
                            <h3 className="font-heading text-xl text-brand-burgundy mb-2">Upload</h3>
                            <p className="font-body text-brand-burgundy/70">Your item will automatically upload. You will receive a message from us if it goes against our terms of service and the item has been removed.</p>
                        </div>
                    </div>
                    <div className="flex">
                        <div className="flex-shrink-0 w-10 h-10 rounded-full bg-brand-yellow flex items-center justify-center font-heading text-brand-burgundy text-xl mr-4">4</div>
                        <div>
                            <h3 className="font-heading text-xl text-brand-burgundy mb-2">Manage Booking Requests</h3>
                            <p className="font-body text-brand-burgundy/70">When someone wants to rent your item:</p>
                            <ul className="list-disc pl-5 mt-2 text-brand-burgundy/70 text-sm space-y-1">
                                <li>You&apos;ll receive a notification</li>
                                <li>Review the booking dates and Hirer&apos;s profile</li>
                                <li>Approve or decline within 48 hours</li>
                            </ul>
                        </div>
                    </div>
                    <div className="flex">
                        <div className="flex-shrink-0 w-10 h-10 rounded-full bg-brand-yellow flex items-center justify-center font-heading text-brand-burgundy text-xl mr-4">5</div>
                        <div>
                            <h3 className="font-heading text-xl text-brand-burgundy mb-2">Arrange Collection</h3>
                            <p className="font-body text-brand-burgundy/70">Once you approve a booking and the Hirer pays:</p>
                            <ul className="list-disc pl-5 mt-2 text-brand-burgundy/70 text-sm space-y-1">
                                <li>Communicate through our secure Platform messaging</li>
                                <li>Arrange collection time and location</li>
                                <li>Confirm collection through the Platform (both parties must confirm)</li>
                                <li>Only hand items to the verified Hirer</li>
                            </ul>
                        </div>
                    </div>
                    <div className="flex">
                        <div className="flex-shrink-0 w-10 h-10 rounded-full bg-brand-yellow flex items-center justify-center font-heading text-brand-burgundy text-xl mr-4">6</div>
                        <div>
                            <h3 className="font-heading text-xl text-brand-burgundy mb-2">Confirm Return &amp; Get Paid</h3>
                            <p className="font-body text-brand-burgundy/70">When the rental period ends:</p>
                            <ul className="list-disc pl-5 mt-2 text-brand-burgundy/70 text-sm space-y-1">
                                <li>Arrange return with the Hirer</li>
                                <li>Both parties confirm return through the Platform</li>
                                <li>Inspect items within 48 hours and report any issues</li>
                                <li>Payment is released to you automatically after the 48-hour dispute window</li>
                                <li>You receive your rental fee minus 10% platform fee</li>
                            </ul>
                        </div>
                    </div>
                </div>
            </div>

            <div>
                <h2 className="font-heading text-3xl text-brand-blue mb-2">For Hirers (Renting Items)</h2>
                <p className="font-body text-brand-burgundy/70 mb-8">Discover extraordinary styling pieces and props to make your event unforgettable.</p>
                <div className="space-y-8">
                    <div className="flex">
                        <div className="flex-shrink-0 w-10 h-10 rounded-full bg-brand-yellow flex items-center justify-center font-heading text-brand-burgundy text-xl mr-4">1</div>
                        <div>
                            <h3 className="font-heading text-xl text-brand-burgundy mb-2">Find What You Need</h3>
                            <p className="font-body text-brand-burgundy/70">Browse our collection of unique items:</p>
                            <ul className="list-disc pl-5 mt-2 text-brand-burgundy/70 text-sm space-y-1">
                                <li>Search by category, location, or keywords</li>
                                <li>Filter by London area (postcode/area)</li>
                                <li>View detailed photos, descriptions, and pricing</li>
                                <li>Check availability for your event dates</li>
                            </ul>
                        </div>
                    </div>
                    <div className="flex">
                        <div className="flex-shrink-0 w-10 h-10 rounded-full bg-brand-yellow flex items-center justify-center font-heading text-brand-burgundy text-xl mr-4">2</div>
                        <div>
                            <h3 className="font-heading text-xl text-brand-burgundy mb-2">Create Your Account</h3>
                            <p className="font-body text-brand-burgundy/70">Sign up with your email, name, phone number, and address. Quick and easy.</p>
                        </div>
                    </div>
                    <div className="flex">
                        <div className="flex-shrink-0 w-10 h-10 rounded-full bg-brand-yellow flex items-center justify-center font-heading text-brand-burgundy text-xl mr-4">3</div>
                        <div>
                            <h3 className="font-heading text-xl text-brand-burgundy mb-2">Request Your Booking</h3>
                            <p className="font-body text-brand-burgundy/70">Found the perfect piece? Here&apos;s what happens:</p>
                            <ul className="list-disc pl-5 mt-2 text-brand-burgundy/70 text-sm space-y-1">
                                <li>Select your rental dates</li>
                                <li>Review the total cost (rental price + 10% service fee)</li>
                                <li>Submit your booking request</li>
                            </ul>
                        </div>
                    </div>
                    <div className="flex">
                        <div className="flex-shrink-0 w-10 h-10 rounded-full bg-brand-yellow flex items-center justify-center font-heading text-brand-burgundy text-xl mr-4">4</div>
                        <div>
                            <h3 className="font-heading text-xl text-brand-burgundy mb-2">Wait for Approval &amp; Pay</h3>
                            <p className="font-body text-brand-burgundy/70">The Lister has 24 hours to approve your request. Once approved:</p>
                            <ul className="list-disc pl-5 mt-2 text-brand-burgundy/70 text-sm space-y-1">
                                <li>You&apos;ll receive a confirmation notification</li>
                                <li>Complete payment through our secure system</li>
                                <li>Your payment is held safely in escrow</li>
                            </ul>
                        </div>
                    </div>
                    <div className="flex">
                        <div className="flex-shrink-0 w-10 h-10 rounded-full bg-brand-yellow flex items-center justify-center font-heading text-brand-burgundy text-xl mr-4">5</div>
                        <div>
                            <h3 className="font-heading text-xl text-brand-burgundy mb-2">Arrange Collection</h3>
                            <p className="font-body text-brand-burgundy/70">Use our Platform messaging to coordinate with the Lister:</p>
                            <ul className="list-disc pl-5 mt-2 text-brand-burgundy/70 text-sm space-y-1">
                                <li>Confirm collection time and location</li>
                                <li>Both parties confirm collection through the Platform</li>
                                <li>Collect your items and bring them to life at your event!</li>
                            </ul>
                        </div>
                    </div>
                    <div className="flex">
                        <div className="flex-shrink-0 w-10 h-10 rounded-full bg-brand-yellow flex items-center justify-center font-heading text-brand-burgundy text-xl mr-4">6</div>
                        <div>
                            <h3 className="font-heading text-xl text-brand-burgundy mb-2">Return Items &amp; Leave a Review</h3>
                            <p className="font-body text-brand-burgundy/70">When your event is over:</p>
                            <ul className="list-disc pl-5 mt-2 text-brand-burgundy/70 text-sm space-y-1">
                                <li>Return items on time in the same condition</li>
                                <li>Confirm return through the Platform (both parties confirm)</li>
                                <li>Payment is released to the Lister after 48 hours</li>
                                <li>Leave a review to help the community</li>
                            </ul>
                        </div>
                    </div>
                </div>
            </div>
        </div>

        <div className="grid md:grid-cols-2 gap-12 mb-20">
            <div className="bg-brand-blue p-8 rounded-3xl border border-brand-blue shadow-xl text-brand-white">
                <h2 className="font-heading text-2xl mb-6 text-brand-yellow">Safety &amp; Security</h2>
                <ul className="space-y-4 font-body">
                    <li className="flex items-start gap-3">
                        <span className="text-brand-yellow font-bold mt-1">✓</span>
                        <span><strong>Users:</strong> All users provide contact details and addresses.</span>
                    </li>
                    <li className="flex items-start gap-3">
                        <span className="text-brand-yellow font-bold mt-1">✓</span>
                        <span><strong>Secure Payments:</strong> Payments are processed securely through Stripe and held in escrow.</span>
                    </li>
                    <li className="flex items-start gap-3">
                        <span className="text-brand-yellow font-bold mt-1">✓</span>
                        <span><strong>Platform Messaging:</strong> All communication happens through Odd Folk to protect both parties.</span>
                    </li>
                    <li className="flex items-start gap-3">
                        <span className="text-brand-yellow font-bold mt-1">✓</span>
                        <span><strong>48-Hour Dispute Window:</strong> Listers have 48 hours after return to report any damage.</span>
                    </li>
                    <li className="flex items-start gap-3">
                        <span className="text-brand-yellow font-bold mt-1">✓</span>
                        <span><strong>Mediation Service:</strong> If disputes arise, our team is here to help find fair solutions.</span>
                    </li>
                </ul>
            </div>
            <div className="bg-brand-orange p-8 rounded-3xl border border-brand-orange shadow-xl text-brand-white">
                <h2 className="font-heading text-2xl mb-6 text-brand-yellow">Payment Breakdown</h2>
                <div className="space-y-6 font-body">
                    <div className="bg-white/10 p-5 rounded-2xl">
                        <p className="font-bold mb-2">For Hirers, you pay:</p>
                        <ul className="list-disc pl-5 text-sm space-y-1 opacity-90">
                            <li>Rental price (set by Lister)</li>
                            <li>10% service fee</li>
                            <li>Example: £100 rental + £10 service fee = £110 total</li>
                        </ul>
                    </div>
                    <div className="bg-white/10 p-5 rounded-2xl">
                        <p className="font-bold mb-2">For Listers, you receive:</p>
                        <ul className="list-disc pl-5 text-sm space-y-1 opacity-90">
                            <li>Rental price minus 10% service fee</li>
                            <li>Example: £100 rental - £10 service fee = £90 in your pocket</li>
                        </ul>
                    </div>
                    <p className="text-sm opacity-90">Platform commission: 20% total (10% from Hirer + 10% from Lister)</p>
                </div>
            </div>
        </div>
      </div>
    </div>
  );
};

export const FAQ: React.FC = () => {
  const scrollToSection = (id: string) => {
    const element = document.getElementById(id);
    if (element) {
      const offset = 120;
      const elementPosition = element.getBoundingClientRect().top;
      const offsetPosition = elementPosition + window.pageYOffset - offset;
      window.scrollTo({
        top: offsetPosition,
        behavior: 'smooth'
      });
    }
  };

  const Question: React.FC<{ q: string; a: string | React.ReactNode }> = ({ q, a }) => (
    <div className="mb-8">
      <h3 className="font-heading text-lg text-brand-burgundy mb-2">{q}</h3>
      <div className="font-body text-brand-burgundy/80 leading-relaxed text-base">
        {a}
      </div>
    </div>
  );

  return (
    <div className="bg-brand-white py-16 md:py-24">
      <div className="container mx-auto px-4 sm:px-6 lg:px-8 max-w-4xl">
        <h1 className="font-heading text-5xl md:text-6xl text-brand-orange mb-6 text-center">FAQ</h1>

        <div className="max-w-md mx-auto mb-16 sticky top-28 z-20">
             <div className="relative">
                <select
                    onChange={(e) => scrollToSection(e.target.value)}
                    className="w-full p-4 bg-brand-white border-2 border-brand-orange/20 rounded-2xl font-body text-brand-burgundy focus:outline-none focus:border-brand-orange focus:ring-1 focus:ring-brand-orange cursor-pointer appearance-none shadow-xl transition-all"
                    defaultValue=""
                >
                    <option value="" disabled>Jump to section...</option>
                    <option value="general">General Questions</option>
                    <option value="listers">For Listers</option>
                    <option value="hirers">For Hirers</option>
                    <option value="pricing">Pricing, Payments & Fees</option>
                    <option value="safety">Safety & Trust</option>
                    <option value="problems">Problems & Disputes</option>
                    <option value="technical">Account & Technical</option>
                </select>
                <div className="pointer-events-none absolute inset-y-0 right-0 flex items-center px-4 text-brand-orange">
                    <svg className="fill-current h-6 w-6" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20"><path d="M9.293 12.95l.707.707L15.657 8l-1.414-1.414L10 10.828 5.757 6.586 4.343 8z"/></svg>
                </div>
             </div>
        </div>

        <div className="space-y-20">
            {/* General Questions */}
            <section id="general">
                <h2 className="font-heading text-2xl text-brand-blue mb-8 border-b border-brand-blue/20 pb-2 uppercase tracking-wide">General Questions</h2>
                <div className="space-y-2">
                    <Question
                        q="What is Odd Folk?"
                        a="We connect people who need unique styling items for events with London's creative collectors who have them to rent. Vintage furniture, neon signs, backdrops, props—all from real people in your area."
                    />
                    <Question
                        q="How does it work?"
                        a="Listers upload their items. Hirers browse, book dates, and pay securely. Collect locally, use for your event, return on time. Payment releases after successful return."
                    />
                    <Question
                        q="Where do you operate?"
                        a="London only for now. Search by postcode or area to find pieces near you."
                    />
                    <Question
                        q="How is Odd Folk different?"
                        a="Unlike rental companies with warehouses, we connect you directly with local collectors and creatives. One-of-a-kind pieces with character—not mass-produced props. Plus, you're supporting your local creative community."
                    />
                    <Question
                        q="Can businesses use Odd Folk?"
                        a="Yes. Prop houses, event planners, photographers, stylists, and businesses are welcome. "
                    />
                    <Question
                        q="Can I sell items as well as rent?"
                        a="Odd Folk is currently a rent only platform, and does not support sale transactions."
                    />
                    <Question
                        q="Can I communicate with users outside the platform?"
                        a={
                            <div className="space-y-3">
                                <p>All communication must happen through Odd Folk&apos;s messaging system until a booking is confirmed. Sharing phone numbers, email addresses, or other contact details before confirmation is not allowed.</p>
                                <p>Communication outside the platform can lead to account deletion. For full terms, see our <a href="/terms" className="text-brand-orange hover:underline">Terms of Service</a>.</p>
                            </div>
                        }
                    />
                </div>
            </section>

            {/* For Listers */}
            <section id="listers">
                <h2 className="font-heading text-2xl text-brand-blue mb-8 border-b border-brand-blue/20 pb-2 uppercase tracking-wide">For Listers</h2>
                <div className="space-y-2">
                    <Question
                        q="What can I list?"
                        a="Furniture, lighting, backdrops, tableware, textiles, decorative props, plants, seasonal items—anything styling-related that's safe, clean, and working."
                    />
                    <Question
                        q="What can't I list?"
                        a="Vehicles, weapons, illegal items, live animals, pornographic content, stolen goods, or anything unsafe."
                    />
                    <Question
                        q="How do I create a listing?"
                        a="Create account → Click 'List an Item' → Upload your photos → Add description, dimensions, condition → Set price → Submit to upload."
                    />
                    <Question
                        q="How should I photograph items?"
                        a="Clear, well-lit photos from multiple angles. Additional shots: in use, details, any imperfections. Good photos = more bookings."
                    />
                    <Question
                        q="When do I get paid?"
                        a="Payment releases 24 hours after both parties confirm a safe return. This can take longer if disputes are made known. "
                    />
                    <Question
                        q="Do I have to approve every booking?"
                        a="No. Decline if dates don't work or you're not comfortable. Just respond within 48 hours or the request expires."
                    />
                    <Question
                        q="Can I cancel after accepting?"
                        a="Yes, but check our terms of use to see if you'll be charged."
                    />
                    <Question
                        q="Can I remove a listing?"
                        a="Yes, anytime through your dashboard. But fulfill or cancel existing bookings first."
                    />
                    <Question
                        q="What if someone damages my item?"
                        a={
                            <p>Document with photos. Message the hirer first to discuss covering the fix or replacement fee. Can&apos;t agree? <a href="/contact" className="text-brand-orange hover:underline">Contact us</a> to request mediation within 48 hours of return. Full terms found in our terms of service.</p>
                        }
                    />
                    <Question
                        q="Do I handle delivery?"
                        a="No. Collection only—hirers come to you, unless you both agree to use a courier. Odd Folk isn't responsible for items"
                    />
                </div>
            </section>

            {/* For Hirers */}
            <section id="hirers">
                <h2 className="font-heading text-2xl text-brand-blue mb-8 border-b border-brand-blue/20 pb-2 uppercase tracking-wide">For Hirers</h2>
                <div className="space-y-2">
                    <Question
                        q="How do I rent an item?"
                        a="Browse and find what you need → Create account → Request dates → Wait for approval (up to 24 hours) → Pay securely → Message to arrange collection → Collect, use, return on time."
                    />
                    <Question
                        q="When do I pay?"
                        a="When the lister approves your booking. Funds held in escrow until you return the item."
                    />
                    <Question
                        q="How do I pay?"
                        a="All major credit and debit cards through Stripe."
                    />
                    <Question
                        q="Where do I collect items?"
                        a="From the lister's address (shown on listing). Coordinate exact times through platform messaging. Collection only, we do not offer delivery."
                    />
                    <Question
                        q="Can someone else collect for me?"
                        a="Yes, if agreed with the lister beforehand. Share the collector's name to avoid complications."
                    />
                    <Question
                        q="Can I message before booking?"
                        a="Yes! Ask questions about dimensions, condition, or collection details before requesting."
                    />
                    <Question
                        q="What if I need to cancel?"
                        a={
                            <div className="space-y-2">
                                <p>Refund policies:</p>
                                <ul className="list-disc pl-5 space-y-1">
                                    <li>48+ hours before: Full refund minus processing fees</li>
                                    <li>24-48 hours before: 50% refund</li>
                                    <li>Under 24 hours: No refund</li>
                                </ul>
                            </div>
                        }
                    />
                    <Question
                        q="Can I extend my rental?"
                        a="Message the lister to request extra days. If approved, pay immediately through the platform."
                    />
                    <Question
                        q="What if I'm late returning?"
                        a="Message the lister immediately to arrange a new time. Late returns without communication may result in fees and account restrictions."
                    />
                    <Question
                        q="Am I responsible if something breaks?"
                        a="You're responsible for damage from negligence, misuse, or theft. Not liable for normal wear and tear. Report any damage immediately."
                    />
                    <Question
                        q="Are my items insured?"
                        a="Currently you'll need to insure your own items and make claims with your insurers if needed."
                    />
                    <Question
                        q="What if the item isn't as described?"
                        a={<p>Message the lister immediately and document with photos. Can&apos;t resolve it? <a href="/contact" className="text-brand-orange hover:underline">Contact us</a> for help.</p>}
                    />
                </div>
            </section>

            {/* Pricing, Payments & Fees */}
            <section id="pricing">
                <h2 className="font-heading text-2xl text-brand-blue mb-8 border-b border-brand-blue/20 pb-2 uppercase tracking-wide">Pricing, Payments & Fees</h2>
                <div className="space-y-2">
                    <Question
                        q="What does it cost?"
                        a={
                            <div className="space-y-2">
                                <ul className="list-disc pl-5 space-y-1">
                                    <li>Browsing: Free</li>
                                    <li>Hiring: Rental price + 10% service fee</li>
                                    <li>Listing: Keep 90% (we take 10%)</li>
                                </ul>
                                <p className="font-bold text-brand-burgundy mt-2 italic">Example: £100 rental = £110 for hirer, £90 for lister</p>
                            </div>
                        }
                    />
                    <Question
                        q="How should I price my items?"
                        a="You set your own prices. Research similar items and consider value, rarity, condition, and demand. A good rule of thumb: 10% of the purchase price for a 3 day rental. "
                    />
                    <Question
                        q="How does escrow work?"
                        a="When a hirer books, payment's held by Stripe. Releases automatically 24 hours after return confirmation, plus a 48-hour dispute window. Protects both parties."
                    />
                    <Question
                        q="What's the 48-hour dispute window?"
                        a="After return confirmation, listers have 48 hours to inspect and report issues. Nothing reported? Payment releases automatically."
                    />
                    <Question
                        q="Can I modify a booking after it's confirmed?"
                        a="Changes need mutual agreement. Message through the platform. Extensions require immediate payment for extra days."
                    />
                    <Question
                        q="What if an item isn't returned on time?"
                        a="Hirer must contact you immediately to arrange new time and pay for extension. Unresponsive? Contact support—we may charge fees additional fees."
                    />
                </div>
            </section>

            {/* Safety & Trust */}
            <section id="safety">
                <h2 className="font-heading text-2xl text-brand-blue mb-8 border-b border-brand-blue/20 pb-2 uppercase tracking-wide">Safety & Trust</h2>
                <div className="space-y-2">
                    <Question
                        q="How do you verify users?"
                        a="All users provide verified email, phone, and address. We manually review all listings too."
                    />
                    <Question
                        q="Is my information safe?"
                        a="Yes. Email and phone details stay private. All communication should be through our secure platform messaging. Read our Privacy Policy for details."
                    />
                    <Question
                        q="How do reviews work?"
                        a="Both parties can review after each rental. Reviews publish after both submit (or after 7 days). Honest reviews build community trust."
                    />
                    <Question
                        q="What if a review is unfair?"
                        a={<p>Reviews should be honest and accurate. If you believe one violates guidelines, <a href="/contact" className="text-brand-orange hover:underline">contact us</a>. We&apos;ll review and may remove it.</p>}
                    />
                </div>
            </section>

            {/* Problems & Disputes */}
            <section id="problems">
                <h2 className="font-heading text-2xl text-brand-blue mb-8 border-b border-brand-blue/20 pb-2 uppercase tracking-wide">Problems & Disputes</h2>
                <div className="space-y-2">
                    <Question
                        q="What if we can't agree on damage?"
                        a={<p><a href="/contact" className="text-brand-orange hover:underline">Contact us</a> to request mediation. We&apos;ll review evidence (photos, messages, receipts) and make a binding decision. Mediation fee up to 30% may be charged to hirer.</p>}
                    />
                    <Question
                        q="How do I report a problem?"
                        a={<p><a href="/contact" className="text-brand-orange hover:underline">Contact us</a> with details, photos, and evidence. We respond within 24–48 hours.</p>}
                    />
                    <Question
                        q="What happens if someone violates Terms of Service?"
                        a="Warnings, suspension, account termination, or legal action depending on severity. Serious violations (fraud, theft, harassment) reported to law enforcement."
                    />
                    <Question
                        q="Can I get a refund if something goes wrong?"
                        a="This depends on the situation. Lister cancels = full refund. Item significantly not as described = full or partial refund. Contact support to discuss."
                    />
                </div>
            </section>

            {/* Account & Technical */}
            <section id="technical">
                <h2 className="font-heading text-2xl text-brand-blue mb-8 border-b border-brand-blue/20 pb-2 uppercase tracking-wide">Account & Technical</h2>
                <div className="space-y-2">
                    <Question
                        q="I forgot my password"
                        a="Click 'Forgot Password' on login page. We'll email a reset link."
                    />
                    <Question
                        q="How do I change account information?"
                        a={
                            <div className="space-y-1">
                                <p>Click on your profile icon → My profile → Update email, phone, bio, or password</p>
                                <p>Locations → update addresses</p>
                                <p>Wallet → update payment methods</p>
                            </div>
                        }
                    />
                    <Question
                        q="How do I delete my account?"
                        a="Click your profile icon, click delete account button below. Fulfill active bookings first. Data removed per Privacy Policy."
                    />
                </div>
            </section>
        </div>

        {/* Help Banner */}
        <div className="mt-20 bg-brand-burgundy rounded-3xl p-10 text-center text-brand-white">
            <h2 className="font-heading text-3xl mb-4">Still need help?</h2>
            <p className="font-body text-lg text-brand-white/80 mb-8 max-w-lg mx-auto">
                Our support team is always ready to assist you with any questions or issues.
            </p>
            <a
                href="/contact"
                className="inline-block bg-brand-orange text-brand-white font-heading text-lg px-8 py-4 rounded-xl hover:brightness-110 transition-all shadow-xl"
            >
                Contact Us
            </a>
        </div>
      </div>
    </div>
  );
};

export const Sustainability: React.FC = () => {
  return (
    <div className="bg-brand-white py-16 md:py-24">
      <div className="container mx-auto px-4 sm:px-6 lg:px-8 max-w-4xl">
        <div className="text-center mb-16">
            <h1 className="font-heading text-5xl md:text-6xl text-brand-orange mb-6">Sustainability at Odd Folk</h1>
        </div>

        <section className="mb-20">
            <h2 className="font-heading text-3xl text-brand-blue mb-6">Why Renting Matters</h2>
            <p className="font-body text-lg text-brand-burgundy/80 leading-relaxed mb-4">
                Every year, thousands of props, furniture pieces, and decorative items are bought for single-use events—then stored, forgotten, or thrown away. It&apos;s wasteful, expensive, and unnecessary.
            </p>
            <p className="font-body text-lg text-brand-burgundy/80 leading-relaxed">
                Odd Folk offers a better way.
            </p>
        </section>

        <section className="mb-20 grid md:grid-cols-2 gap-12">
            <div className="bg-brand-burgundy/5 p-8 rounded-3xl border border-brand-burgundy/10">
                <h2 className="font-heading text-2xl text-brand-burgundy mb-6">The Problem with Single-Use Event Props</h2>
                <div className="space-y-6">
                    <div>
                        <h4 className="font-heading text-sm text-brand-burgundy/60 uppercase tracking-widest mb-2">The traditional approach:</h4>
                        <ul className="list-disc pl-5 font-body text-brand-burgundy/80 space-y-1">
                            <li>Buy new props for one event</li>
                            <li>Use them once</li>
                            <li>Store them indefinitely (taking up space and gathering dust)</li>
                            <li>Eventually throw them away when moving or decluttering</li>
                            <li>Repeat for the next event</li>
                        </ul>
                    </div>
                    <div>
                        <h4 className="font-heading text-sm text-brand-burgundy/60 uppercase tracking-widest mb-2">The impact:</h4>
                        <ul className="list-disc pl-5 font-body text-brand-burgundy/80 space-y-1">
                            <li>Increased manufacturing demand and carbon emissions</li>
                            <li>More waste ending up in landfills</li>
                            <li>Resources extracted to make items used just once</li>
                            <li>Money spent on things that sit idle 99% of the time</li>
                        </ul>
                    </div>
                </div>
            </div>

            <div className="space-y-8">
                <h2 className="font-heading text-3xl text-brand-blue mb-4">The Peer-to-Peer Alternative</h2>

                <div className="space-y-6">
                    <div>
                        <h3 className="font-heading text-xl text-brand-orange mb-2">Reuse Over Waste</h3>
                        <p className="font-body text-brand-burgundy/80">
                            When you rent from Odd Folk, you&apos;re giving existing items another life. That velvet sofa has already been made—the carbon cost is paid. Every rental extends its useful life and prevents a new item from being manufactured.
                        </p>
                    </div>
                    <div>
                        <h3 className="font-heading text-xl text-brand-orange mb-2">Local Means Lower Carbon</h3>
                        <p className="font-body text-brand-burgundy/80 mb-3">
                            Traditional rental companies operate from central warehouses—often outside city centers. Items travel long distances by van for delivery and collection.
                        </p>
                        <p className="font-body text-brand-burgundy/80 mb-2">Odd Folk is different:</p>
                        <ul className="list-disc pl-5 font-body text-brand-burgundy/80 space-y-1">
                            <li>Collection from your neighborhood – Walk, cycle, or drive a short distance</li>
                            <li>No delivery vans crisscrossing the city – Lower transport emissions</li>
                            <li>Hyperlocal sharing – Items stay within London communities</li>
                        </ul>
                    </div>
                    <div>
                        <h3 className="font-heading text-xl text-brand-orange mb-2">Keep Quality Items in Circulation</h3>
                        <p className="font-body text-brand-burgundy/80 mb-3">
                            The best props and furniture are often vintage, handmade, or unique pieces built to last. These items deserve long lives—not landfills.
                        </p>
                        <p className="font-body text-brand-burgundy/80 mb-2">Odd Folk keeps quality pieces circulating:</p>
                        <ul className="list-disc pl-5 font-body text-brand-burgundy/80 space-y-1">
                            <li>Vintage finds get used regularly instead of languishing in storage</li>
                            <li>Well-made items stay in active use for years or decades</li>
                            <li>Character pieces with history continue making new memories</li>
                        </ul>
                    </div>
                </div>
            </div>
        </section>

        <section className="bg-brand-blue text-brand-white rounded-3xl p-10 shadow-xl">
            <h2 className="font-heading text-3xl text-brand-yellow mb-10 text-center">Our Commitment</h2>

            <div className="grid md:grid-cols-2 gap-10">
                <div>
                    <h3 className="font-heading text-xl mb-4 border-b border-brand-white/20 pb-2">What We&apos;re Doing Now</h3>
                    <ul className="space-y-4 font-body">
                        <li>
                            <strong>Encouraging longer rentals:</strong> Listers can offer discounts for weekly or monthly rentals—more use per collection/return = better efficiency.
                        </li>
                        <li>
                            <strong>Collection-only model:</strong> Keeps transport emissions low and encourages local sharing.
                        </li>
                        <li>
                            <strong>Community education:</strong> Sharing the environmental case for rental through our platform and social channels.
                        </li>
                    </ul>
                </div>
                <div>
                    <h3 className="font-heading text-xl mb-4 border-b border-brand-white/20 pb-2">What&apos;s Coming</h3>
                    <ul className="space-y-4 font-body">
                        <li>
                            <strong>Carbon footprint tracking:</strong> Show users the environmental impact they&apos;ve avoided by renting instead of buying.
                        </li>
                        <li>
                            <strong>Impact reporting:</strong> Annual reports on total items shared, rentals completed, and estimated waste diverted from landfills.
                        </li>
                    </ul>
                </div>
            </div>
        </section>
      </div>
    </div>
  );
};

export const ListerInfo: React.FC = () => {
  return (
      <HowItWorks />
  );
};
