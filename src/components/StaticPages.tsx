'use client';

import React from 'react';

export const HowItWorks: React.FC = () => {
  return (
    <div className="bg-brand-white py-16 md:py-24">
      <div className="container mx-auto px-4 sm:px-6 lg:px-8 max-w-5xl">
        <div className="text-center mb-16">
            <h1 className="font-heading text-5xl md:text-6xl text-brand-orange mb-6">How Odd Folk works</h1>
            <p className="font-body text-xl text-brand-burgundy/80 max-w-2xl mx-auto">
                Odd Folk is a peer-to-peer marketplace for styling items and props — we connect event hosts and creatives who need <span className="text-brand-blue font-semibold">unique pieces</span> with collectors and stylists who have them.
            </p>
            <p className="font-body text-lg text-brand-burgundy/80 max-w-2xl mx-auto mt-4">
                Turn your creative collection into income by sharing your styling pieces with London's creative community.
            </p>
        </div>

        <div className="grid md:grid-cols-2 gap-16 mb-20">
            <div>
                <h2 className="font-heading text-3xl text-brand-blue mb-8">For listers (renting out)</h2>
                <div className="space-y-8">
                    <div className="flex">
                        <div className="flex-shrink-0 w-10 h-10 rounded-full bg-brand-yellow flex items-center justify-center font-heading text-brand-burgundy text-xl mr-4">1</div>
                        <div>
                            <h3 className="font-heading text-xl text-brand-burgundy mb-2">Create your account</h3>
                            <p className="font-body text-brand-burgundy/70">Sign up with your email, name, phone number, and London address. It takes just 2 minutes.</p>
                        </div>
                    </div>
                    <div className="flex">
                        <div className="flex-shrink-0 w-10 h-10 rounded-full bg-brand-yellow flex items-center justify-center font-heading text-brand-burgundy text-xl mr-4">2</div>
                        <div>
                            <h3 className="font-heading text-xl text-brand-burgundy mb-2">List your items</h3>
                            <p className="font-body text-brand-burgundy/70">Create listings for your styling items and props:</p>
                            <ul className="list-disc pl-5 mt-2 text-brand-burgundy/70 text-sm space-y-1">
                                <li>Upload 2-5 high-quality photos</li>
                                <li>Write a detailed description including dimensions</li>
                                <li>Set your daily/weekly rental prices</li>
                                <li>Add your collection postcode</li>
                            </ul>
                        </div>
                    </div>
                    <div className="flex">
                         <div className="flex-shrink-0 w-10 h-10 rounded-full bg-brand-yellow flex items-center justify-center font-heading text-brand-burgundy text-xl mr-4">3</div>
                        <div>
                            <h3 className="font-heading text-xl text-brand-burgundy mb-2">Await approval</h3>
                            <p className="font-body text-brand-burgundy/70">Our team reviews all listings to ensure quality and accuracy.</p>
                        </div>
                    </div>
                    <div className="flex">
                         <div className="flex-shrink-0 w-10 h-10 rounded-full bg-brand-yellow flex items-center justify-center font-heading text-brand-burgundy text-xl mr-4">4</div>
                        <div>
                            <h3 className="font-heading text-xl text-brand-burgundy mb-2">Manage requests</h3>
                            <p className="font-body text-brand-burgundy/70">Review the booking dates and hirer's profile. Approve or decline within 24 hours.</p>
                        </div>
                    </div>
                     <div className="flex">
                         <div className="flex-shrink-0 w-10 h-10 rounded-full bg-brand-yellow flex items-center justify-center font-heading text-brand-burgundy text-xl mr-4">5</div>
                        <div>
                            <h3 className="font-heading text-xl text-brand-burgundy mb-2">Arrange collection</h3>
                            <p className="font-body text-brand-burgundy/70">Communicate through our secure platform messaging to arrange collection time and location.</p>
                        </div>
                    </div>
                    <div className="flex">
                         <div className="flex-shrink-0 w-10 h-10 rounded-full bg-brand-yellow flex items-center justify-center font-heading text-brand-burgundy text-xl mr-4">6</div>
                        <div>
                            <h3 className="font-heading text-xl text-brand-burgundy mb-2">Get paid</h3>
                            <p className="font-body text-brand-burgundy/70">Payment is released to you automatically after the 48-hour dispute window following return.</p>
                        </div>
                    </div>
                </div>
            </div>

            <div>
                <h2 className="font-heading text-3xl text-brand-blue mb-8">For hirers (renting items)</h2>
                <div className="space-y-8">
                    <div className="flex">
                        <div className="flex-shrink-0 w-10 h-10 rounded-full bg-brand-yellow flex items-center justify-center font-heading text-brand-burgundy text-xl mr-4">1</div>
                        <div>
                            <h3 className="font-heading text-xl text-brand-burgundy mb-2">Find what you need</h3>
                            <p className="font-body text-brand-burgundy/70">Browse our curated collection of unique items by category, location, or keywords.</p>
                        </div>
                    </div>
                    <div className="flex">
                        <div className="flex-shrink-0 w-10 h-10 rounded-full bg-brand-yellow flex items-center justify-center font-heading text-brand-burgundy text-xl mr-4">2</div>
                        <div>
                            <h3 className="font-heading text-xl text-brand-burgundy mb-2">Request your booking</h3>
                            <p className="font-body text-brand-burgundy/70">Select your rental dates and submit your booking request.</p>
                        </div>
                    </div>
                    <div className="flex">
                         <div className="flex-shrink-0 w-10 h-10 rounded-full bg-brand-yellow flex items-center justify-center font-heading text-brand-burgundy text-xl mr-4">3</div>
                        <div>
                            <h3 className="font-heading text-xl text-brand-burgundy mb-2">Wait for approval & pay</h3>
                            <p className="font-body text-brand-burgundy/70">Once approved, complete payment through our secure system. Your payment is held in escrow.</p>
                        </div>
                    </div>
                    <div className="flex">
                         <div className="flex-shrink-0 w-10 h-10 rounded-full bg-brand-yellow flex items-center justify-center font-heading text-brand-burgundy text-xl mr-4">4</div>
                        <div>
                            <h3 className="font-heading text-xl text-brand-burgundy mb-2">Arrange collection</h3>
                            <p className="font-body text-brand-burgundy/70">Use our platform messaging to coordinate with the lister for pickup.</p>
                        </div>
                    </div>
                     <div className="flex">
                         <div className="flex-shrink-0 w-10 h-10 rounded-full bg-brand-yellow flex items-center justify-center font-heading text-brand-burgundy text-xl mr-4">5</div>
                        <div>
                            <h3 className="font-heading text-xl text-brand-burgundy mb-2">Enjoy your items</h3>
                            <p className="font-body text-brand-burgundy/70">Collect your items and bring them to life at your event!</p>
                        </div>
                    </div>
                    <div className="flex">
                         <div className="flex-shrink-0 w-10 h-10 rounded-full bg-brand-yellow flex items-center justify-center font-heading text-brand-burgundy text-xl mr-4">6</div>
                        <div>
                            <h3 className="font-heading text-xl text-brand-burgundy mb-2">Return & review</h3>
                            <p className="font-body text-brand-burgundy/70">Return items on time and leave a review to help the community.</p>
                        </div>
                    </div>
                </div>
            </div>
        </div>

        <div className="grid md:grid-cols-2 gap-12 mb-20">
            <div className="bg-brand-blue p-8 rounded-3xl border border-brand-blue shadow-xl text-brand-white">
                <h2 className="font-heading text-2xl mb-6 text-brand-yellow">Safety & security</h2>
                <ul className="space-y-4 font-body">
                    <li className="flex items-start gap-3">
                        <span className="text-brand-yellow font-bold mt-1">✓</span>
                        <span><strong>Verified users:</strong> All users provide verified contact details.</span>
                    </li>
                    <li className="flex items-start gap-3">
                        <span className="text-brand-yellow font-bold mt-1">✓</span>
                        <span><strong>Secure payments:</strong> Processed via Stripe and held in escrow.</span>
                    </li>
                    <li className="flex items-start gap-3">
                        <span className="text-brand-yellow font-bold mt-1">✓</span>
                        <span><strong>48-hour dispute window:</strong> Listers have 48 hours to report any damage.</span>
                    </li>
                </ul>
            </div>
            <div className="bg-brand-orange p-8 rounded-3xl border border-brand-orange shadow-xl text-brand-white">
                 <h2 className="font-heading text-2xl mb-6 text-brand-yellow">Payment breakdown</h2>
                 <div className="space-y-6 font-body">
                     <div className="bg-white/10 p-5 rounded-2xl">
                         <p className="font-bold text-xl mb-2">Total commission: 20%</p>
                         <p className="text-sm opacity-90 leading-relaxed">
                            10% from hirer + 10% from lister covers our secure platform and support.
                         </p>
                     </div>
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
                        a="London only for now. Search by postcode or neighborhood to find pieces near you."
                    />
                    <Question
                        q="How is Odd Folk different?"
                        a="Unlike rental companies with warehouses, we connect you directly with local collectors and creatives. One-of-a-kind pieces with character—not mass-produced props. Plus, you're supporting your local creative community."
                    />
                    <Question
                        q="Can businesses use Odd Folk?"
                        a="Yes. Event planners, photographers, stylists, and businesses are welcome."
                    />
                    <Question
                        q="Can I sell items as well as rent?"
                        a="Odd Folk is currently a rent only platform, and does not support sale transactions."
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
                        a="Vehicles, weapons, illegal items, live animals, adult content, stolen goods, or anything unsafe."
                    />
                    <Question
                        q="How do I create a listing?"
                        a="Create account → Click 'List an Item' → Upload 3-6 photos (first one: cutout on plain background) → Add description, dimensions, condition → Set price → Submit for review (approved within 24-48 hours)."
                    />
                    <Question
                        q="How should I photograph items?"
                        a="Clear, well-lit photos from multiple angles. Primary image: item on plain background. Additional shots: in use, details, any imperfections. Good photos = more bookings."
                    />
                    <Question
                        q="When do I get paid?"
                        a="Payment releases 24 hours after hirer confirms return, plus 48 hours for you to inspect. Usually 3 days after return, then 2-3 business days to your account."
                    />
                    <Question
                        q="Do I have to approve every booking?"
                        a="No. Decline if dates don't work or you're not comfortable. Just respond within 24 hours or the request expires."
                    />
                    <Question
                        q="Can I cancel after accepting?"
                        a="Yes, free up to 48 hours before start. Under 48 hours = 25% penalty. Repeated cancellations may affect your account."
                    />
                    <Question
                        q="Can I remove a listing?"
                        a="Yes, anytime through your dashboard. But fulfill existing bookings first."
                    />
                    <Question
                        q="What if someone damages my item?"
                        a="Document with photos. Message the hirer first. Can't agree? Request mediation at hello@oddfolk.co.uk within 48 hours of return."
                    />
                    <Question
                        q="Do I handle delivery?"
                        a="No. Collection only—hirers come to you. If you both agree to use a courier, Odd Folk isn't responsible for items in transit."
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
                                <p>Refund policies vary by listing. Standard policy:</p>
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
                        a="Currently you'll need to insure your own items and make claims with your insurers if needed. We're adding platform-wide insurance very soon!"
                    />
                    <Question
                        q="What if the item isn't as described?"
                        a="Message the lister immediately and document with photos. Can't resolve it? Email hello@oddfolk.co.uk for help."
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
                        a="You set your own prices. Research similar items and consider value, rarity, condition, and demand. A good rule of thumb: 10-15% of the purchase price per rental."
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
                        q="Do you take deposits?"
                        a="No separate deposits. But if items aren't returned on time or damage is suspected, we may hold a deposit equal to the item's value."
                    />
                    <Question
                        q="Can I modify a booking after it's confirmed?"
                        a="Changes need mutual agreement. Message through the platform. Extensions require immediate payment for extra days."
                    />
                    <Question
                        q="What if an item isn't returned on time?"
                        a="Hirer must contact you immediately to arrange new time and pay for extension. Unresponsive? Contact support—we may charge fees or hold deposits."
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
                        q="Can I communicate outside the platform?"
                        a="No. All communication must happen through Odd Folk's messaging. Bypassing this violates Terms of Service and removes protections."
                    />
                    <Question
                        q="How do reviews work?"
                        a="Both parties can review after each rental. Reviews publish after both submit (or after 14 days). Honest reviews build community trust."
                    />
                    <Question
                        q="What if a review is unfair?"
                        a="Reviews should be honest and accurate. If you believe one violates guidelines, contact hello@oddfolk.co.uk. We'll review and may remove it."
                    />
                </div>
            </section>

            {/* Problems & Disputes */}
            <section id="problems">
                <h2 className="font-heading text-2xl text-brand-blue mb-8 border-b border-brand-blue/20 pb-2 uppercase tracking-wide">Problems & Disputes</h2>
                <div className="space-y-2">
                    <Question
                        q="What if we can't agree on damage?"
                        a="Request mediation at hello@oddfolk.co.uk. We'll review evidence (photos, messages, receipts) and make a binding decision. Mediation fee up to 30% may be charged to hirer."
                    />
                    <Question
                        q="How do I report a problem?"
                        a="Email hello@oddfolk.co.uk with details, photos, and evidence. We respond within 24-48 hours."
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
                        a="Settings → Update email, phone, address, payment methods, or password."
                    />
                    <Question
                        q="How do I delete my account?"
                        a="Email hello@oddfolk.co.uk. Fulfill active bookings first. Data removed per Privacy Policy."
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
                href="mailto:hello@oddfolk.co.uk"
                className="inline-block bg-brand-orange text-brand-white font-heading text-lg px-8 py-4 rounded-xl hover:brightness-110 transition-all shadow-xl"
            >
                Email hello@oddfolk.co.uk
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
            <p className="font-body text-xl text-brand-burgundy/80 max-w-2xl mx-auto">
                Odd Folk offers a better way to style your events while protecting our planet.
            </p>
        </div>

        <section className="mb-20">
            <h2 className="font-heading text-3xl text-brand-blue mb-6">Why Renting Matters</h2>
            <p className="font-body text-lg text-brand-burgundy/80 leading-relaxed">
                Every year, thousands of props, furniture pieces, and decorative items are bought for single-use events—then stored, forgotten, or thrown away. It's wasteful, expensive, and unnecessary.
            </p>
        </section>

        <section className="mb-20 grid md:grid-cols-2 gap-12">
            <div className="bg-brand-burgundy/5 p-8 rounded-3xl border border-brand-burgundy/10">
                <h2 className="font-heading text-2xl text-brand-burgundy mb-6">The Problem with Single-Use Event Props</h2>
                <div className="space-y-6">
                    <div>
                        <h4 className="font-heading text-sm text-brand-burgundy/60 uppercase tracking-widest mb-2">The traditional approach</h4>
                        <ul className="list-disc pl-5 font-body text-brand-burgundy/80 space-y-1">
                            <li>Buy new props for one event</li>
                            <li>Use them once</li>
                            <li>Store them indefinitely</li>
                            <li>Eventually throw them away</li>
                            <li>Repeat for the next event</li>
                        </ul>
                    </div>
                    <div>
                        <h4 className="font-heading text-sm text-brand-burgundy/60 uppercase tracking-widest mb-2">The impact</h4>
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
                            When you rent from Odd Folk, you're giving existing items another life. That velvet sofa has already been made—the carbon cost is paid. Every rental extends its useful life and prevents a new item from being manufactured.
                        </p>
                    </div>
                    <div>
                        <h3 className="font-heading text-xl text-brand-orange mb-2">Local Means Lower Carbon</h3>
                        <p className="font-body text-brand-burgundy/80">
                            Odd Folk is different: Collection from your neighborhood means walking, cycling, or driving short distances. No delivery vans crisscrossing the city means lower transport emissions.
                        </p>
                    </div>
                    <div>
                        <h3 className="font-heading text-xl text-brand-orange mb-2">Keep Quality Items in Circulation</h3>
                        <p className="font-body text-brand-burgundy/80">
                            The best props and furniture are often vintage, handmade, or unique pieces built to last. Odd Folk keeps quality pieces circulating: vintage finds get used regularly instead of languishing in storage.
                        </p>
                    </div>
                </div>
            </div>
        </section>

        <section className="bg-brand-blue text-brand-white rounded-3xl p-10 shadow-xl">
            <h2 className="font-heading text-3xl text-brand-yellow mb-10 text-center">Our Commitment</h2>

            <div className="grid md:grid-cols-2 gap-10">
                <div>
                    <h3 className="font-heading text-xl mb-4 border-b border-brand-white/20 pb-2">What We're Doing Now</h3>
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
                    <h3 className="font-heading text-xl mb-4 border-b border-brand-white/20 pb-2">What's Coming</h3>
                    <ul className="space-y-4 font-body">
                        <li>
                            <strong>Carbon footprint tracking:</strong> Show users the environmental impact they've avoided by renting instead of buying.
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
