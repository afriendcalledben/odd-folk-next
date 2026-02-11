'use client';

import React from 'react';

export const HowItWorks: React.FC = () => {
  return (
    <div className="bg-brand-white py-16 md:py-24">
      <div className="container mx-auto px-4 sm:px-6 lg:px-8 max-w-5xl">
        <div className="text-center mb-16">
            <h1 className="font-heading text-5xl md:text-6xl text-brand-orange mb-6">How Odd Folk works</h1>
            <p className="font-body text-xl text-brand-burgundy/80 max-w-2xl mx-auto">
                Odd Folk is the antidote to the ordinary. We connect creators who need <span className="text-brand-blue font-semibold">distinct pieces</span> with local collectors who hate seeing good things gather dust.
            </p>
            <p className="font-body text-lg text-brand-burgundy/80 max-w-2xl mx-auto mt-4">
                Turn your creative collection into income by sharing your oddities with the neighbourhood.
            </p>
        </div>

        <div className="grid md:grid-cols-2 gap-16 mb-20">
            <div>
                <h2 className="font-heading text-3xl text-brand-blue mb-8">For collectors (sharing treasures)</h2>
                <div className="space-y-8">
                    <div className="flex">
                        <div className="flex-shrink-0 w-10 h-10 rounded-full bg-brand-yellow flex items-center justify-center font-heading text-brand-burgundy text-xl mr-4">1</div>
                        <div>
                            <h3 className="font-heading text-xl text-brand-burgundy mb-2">Join the folk</h3>
                            <p className="font-body text-brand-burgundy/70">Sign up in seconds. We verify everyone, because we're neighbours, not strangers.</p>
                        </div>
                    </div>
                    <div className="flex">
                        <div className="flex-shrink-0 w-10 h-10 rounded-full bg-brand-yellow flex items-center justify-center font-heading text-brand-burgundy text-xl mr-4">2</div>
                        <div>
                            <h3 className="font-heading text-xl text-brand-burgundy mb-2">Share your collection</h3>
                            <p className="font-body text-brand-burgundy/70">Upload photos of your treasures. Give us the dimensions, the quirks, and the history.</p>
                        </div>
                    </div>
                    <div className="flex">
                         <div className="flex-shrink-0 w-10 h-10 rounded-full bg-brand-yellow flex items-center justify-center font-heading text-brand-burgundy text-xl mr-4">3</div>
                        <div>
                            <h3 className="font-heading text-xl text-brand-burgundy mb-2">Await approval</h3>
                            <p className="font-body text-brand-burgundy/70">We check every listing to ensure it's odd enough (and safe enough) for our community.</p>
                        </div>
                    </div>
                    <div className="flex">
                         <div className="flex-shrink-0 w-10 h-10 rounded-full bg-brand-yellow flex items-center justify-center font-heading text-brand-burgundy text-xl mr-4">4</div>
                        <div>
                            <h3 className="font-heading text-xl text-brand-burgundy mb-2">Field requests</h3>
                            <p className="font-body text-brand-burgundy/70">Review requests from local creatives. Say yes to the ones that fit.</p>
                        </div>
                    </div>
                     <div className="flex">
                         <div className="flex-shrink-0 w-10 h-10 rounded-full bg-brand-yellow flex items-center justify-center font-heading text-brand-burgundy text-xl mr-4">5</div>
                        <div>
                            <h3 className="font-heading text-xl text-brand-burgundy mb-2">Hand it over</h3>
                            <p className="font-body text-brand-burgundy/70">Chat to arrange a drop-off or pickup. Meet the person bringing your piece to life.</p>
                        </div>
                    </div>
                    <div className="flex">
                         <div className="flex-shrink-0 w-10 h-10 rounded-full bg-brand-yellow flex items-center justify-center font-heading text-brand-burgundy text-xl mr-4">6</div>
                        <div>
                            <h3 className="font-heading text-xl text-brand-burgundy mb-2">Get paid</h3>
                            <p className="font-body text-brand-burgundy/70">Funds hit your account automatically after the 48-hour dispute window. Easy.</p>
                        </div>
                    </div>
                </div>
            </div>

            <div>
                <h2 className="font-heading text-3xl text-brand-blue mb-8">For creators (hunting treasures)</h2>
                <div className="space-y-8">
                    <div className="flex">
                        <div className="flex-shrink-0 w-10 h-10 rounded-full bg-brand-yellow flex items-center justify-center font-heading text-brand-burgundy text-xl mr-4">1</div>
                        <div>
                            <h3 className="font-heading text-xl text-brand-burgundy mb-2">Hunt for treasures</h3>
                            <p className="font-body text-brand-burgundy/70">Search by postcode or vibe. Find the pieces you can't get from a warehouse.</p>
                        </div>
                    </div>
                    <div className="flex">
                        <div className="flex-shrink-0 w-10 h-10 rounded-full bg-brand-yellow flex items-center justify-center font-heading text-brand-burgundy text-xl mr-4">2</div>
                        <div>
                            <h3 className="font-heading text-xl text-brand-burgundy mb-2">Request it</h3>
                            <p className="font-body text-brand-burgundy/70">Pick your dates. Tell the collector what you're making.</p>
                        </div>
                    </div>
                    <div className="flex">
                         <div className="flex-shrink-0 w-10 h-10 rounded-full bg-brand-yellow flex items-center justify-center font-heading text-brand-burgundy text-xl mr-4">3</div>
                        <div>
                            <h3 className="font-heading text-xl text-brand-burgundy mb-2">Secure the goods</h3>
                            <p className="font-body text-brand-burgundy/70">Once approved, pay securely. Your money is held in escrow until the job is done.</p>
                        </div>
                    </div>
                    <div className="flex">
                         <div className="flex-shrink-0 w-10 h-10 rounded-full bg-brand-yellow flex items-center justify-center font-heading text-brand-burgundy text-xl mr-4">4</div>
                        <div>
                            <h3 className="font-heading text-xl text-brand-burgundy mb-2">Go collect</h3>
                            <p className="font-body text-brand-burgundy/70">Coordinate with your neighbour for pickup. No corporate logistics here.</p>
                        </div>
                    </div>
                     <div className="flex">
                         <div className="flex-shrink-0 w-10 h-10 rounded-full bg-brand-yellow flex items-center justify-center font-heading text-brand-burgundy text-xl mr-4">5</div>
                        <div>
                            <h3 className="font-heading text-xl text-brand-burgundy mb-2">Make it happen</h3>
                            <p className="font-body text-brand-burgundy/70">Bring the piece to life at your event, shoot, or set.</p>
                        </div>
                    </div>
                    <div className="flex">
                         <div className="flex-shrink-0 w-10 h-10 rounded-full bg-brand-yellow flex items-center justify-center font-heading text-brand-burgundy text-xl mr-4">6</div>
                        <div>
                            <h3 className="font-heading text-xl text-brand-burgundy mb-2">Return & review</h3>
                            <p className="font-body text-brand-burgundy/70">Drop it back on time. Leave a review to help the community grow.</p>
                        </div>
                    </div>
                </div>
            </div>
        </div>

        <div className="grid md:grid-cols-2 gap-12 mb-20">
            <div className="bg-brand-blue p-8 rounded-3xl border border-brand-blue shadow-xl text-brand-white">
                <h2 className="font-heading text-2xl mb-6 text-brand-yellow">Trust & safety</h2>
                <ul className="space-y-4 font-body">
                    <li className="flex items-start gap-3">
                        <span className="text-brand-yellow font-bold mt-1">✓</span>
                        <span><strong>Verified folk:</strong> We check IDs so you know who you're dealing with.</span>
                    </li>
                    <li className="flex items-start gap-3">
                        <span className="text-brand-yellow font-bold mt-1">✓</span>
                        <span><strong>Secure funds:</strong> Payments are processed via Stripe and held in escrow.</span>
                    </li>
                    <li className="flex items-start gap-3">
                        <span className="text-brand-yellow font-bold mt-1">✓</span>
                        <span><strong>Fair disputes:</strong> 48-hour window to report issues. We've got your back.</span>
                    </li>
                </ul>
            </div>
            <div className="bg-brand-orange p-8 rounded-3xl border border-brand-orange shadow-xl text-brand-white">
                 <h2 className="font-heading text-2xl mb-6 text-brand-yellow">The breakdown</h2>
                 <div className="space-y-6 font-body">
                     <div className="bg-white/10 p-5 rounded-2xl">
                         <p className="font-bold text-xl mb-2">Total commission: 20%</p>
                         <p className="text-sm opacity-90 leading-relaxed">
                            10% from the creator + 10% from the collector. This keeps the platform secure and the lights on.
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
                    <option value="general">The basics</option>
                    <option value="listers">For collectors</option>
                    <option value="hirers">For creators</option>
                    <option value="pricing">Money stuff</option>
                    <option value="safety">Safety & trust</option>
                </select>
                <div className="pointer-events-none absolute inset-y-0 right-0 flex items-center px-4 text-brand-orange">
                    <svg className="fill-current h-6 w-6" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20"><path d="M9.293 12.95l.707.707L15.657 8l-1.414-1.414L10 10.828 5.757 6.586 4.343 8z"/></svg>
                </div>
             </div>
        </div>

        <div className="space-y-20">
            {/* General Questions */}
            <section id="general">
                <h2 className="font-heading text-2xl text-brand-blue mb-8 border-b border-brand-blue/20 pb-2 uppercase tracking-wide">The basics</h2>
                <div className="space-y-2">
                    <Question
                        q="What is Odd Folk?"
                        a="We're the antidote to the ordinary. A creative marketplace connecting creators who need distinct pieces with local collectors who have them. Vintage furniture, neon signs, backdrops—all from real people in your postcode."
                    />
                    <Question
                        q="How does it work?"
                        a="Collectors list their treasures. Creators browse, book, and pay securely. You collect locally, make magic, and return it. We handle the money and the trust part."
                    />
                    <Question
                        q="Where are you?"
                        a="London only for now. We like keeping it local."
                    />
                    <Question
                        q="How is this different to a prop house?"
                        a="We hate warehouses. We connect you directly with local creatives and collectors. You get one-of-a-kind pieces with soul, not mass-produced plastic. Plus, you're putting money back into the community."
                    />
                    <Question
                        q="Can businesses use Odd Folk?"
                        a="Absolutely. Event planners, photographers, stylists, and studios are all welcome."
                    />
                    <Question
                        q="Can I sell items?"
                        a="No selling, just sharing. We're about keeping good things in circulation, not filling landfills."
                    />
                </div>
            </section>

            {/* For Collectors */}
            <section id="listers">
                <h2 className="font-heading text-2xl text-brand-blue mb-8 border-b border-brand-blue/20 pb-2 uppercase tracking-wide">For collectors</h2>
                <div className="space-y-2">
                    <Question
                        q="What can I list?"
                        a="Furniture with character, lighting, backdrops, tableware, textiles, weird props, plants—anything styling-related that's safe and distinctive."
                    />
                    <Question
                        q="What can't I list?"
                        a="Vehicles, weapons, illegal stuff, live animals (unless they're very well behaved... joking, no animals), or anything dangerous."
                    />
                    <Question
                        q="How do I list a treasure?"
                        a="Hit 'List a treasure'. Upload 3-6 photos (make 'em pop). Tell us the story, the dimensions, and the quirks. Set your price. We review it to keep the quality high."
                    />
                    <Question
                        q="How should I photograph items?"
                        a="Light it up. Primary image on a plain background. Then show us the vibe—in a room, at an event. Detail shots matter. Good photos = more bookings."
                    />
                    <Question
                        q="When do I get paid?"
                        a="We release funds 24 hours after the return is confirmed, plus a 48-hour dispute window. It usually hits your bank 2-3 days later."
                    />
                    <Question
                        q="Do I have to say yes?"
                        a="Nope. It's your collection. Decline if the dates don't work or the vibe feels off. Just reply within 24 hours so you don't leave them hanging."
                    />
                </div>
            </section>

            {/* For Creators */}
            <section id="hirers">
                <h2 className="font-heading text-2xl text-brand-blue mb-8 border-b border-brand-blue/20 pb-2 uppercase tracking-wide">For creators</h2>
                <div className="space-y-2">
                    <Question
                        q="How do I secure a piece?"
                        a="Find it, request dates, wait for the collector's nod (usually within 24 hours). Pay securely, then chat to arrange pickup."
                    />
                    <Question
                        q="When do I pay?"
                        a="When the collector approves. Funds sit in escrow until the job is done."
                    />
                    <Question
                        q="Do you deliver?"
                        a="No. It's collection only. Meet your neighbour, see the piece, transport it carefully. If you use a courier, that's on you."
                    />
                    <Question
                        q="Can I see it before I book?"
                        a="You can ask questions via chat, but we don't support viewings yet. Rely on the photos and the description—we verify our collectors."
                    />
                    <Question
                        q="What if I'm late?"
                        a="Don't be. If you are, message the collector immediately. Late returns ruin plans and incur fees."
                    />
                </div>
            </section>

            {/* Pricing */}
            <section id="pricing">
                <h2 className="font-heading text-2xl text-brand-blue mb-8 border-b border-brand-blue/20 pb-2 uppercase tracking-wide">Money stuff</h2>
                <div className="space-y-2">
                    <Question
                        q="What does it cost?"
                        a={
                            <div className="space-y-2">
                                <ul className="list-disc pl-5 space-y-1">
                                    <li>Browsing: Free</li>
                                    <li>Booking: Rental price + 10% service fee</li>
                                    <li>Listing: You keep 90%</li>
                                </ul>
                            </div>
                        }
                    />
                    <Question
                        q="How do I price my pieces?"
                        a="You're the boss. Look at similar items. A good rule: 10-15% of the purchase value per rental day. Rare items command more."
                    />
                    <Question
                        q="How does escrow work?"
                        a="Stripe holds the cash. It keeps everyone honest. Money moves only when the job is done."
                    />
                </div>
            </section>

            {/* Safety */}
            <section id="safety">
                <h2 className="font-heading text-2xl text-brand-blue mb-8 border-b border-brand-blue/20 pb-2 uppercase tracking-wide">Safety & trust</h2>
                <div className="space-y-2">
                    <Question
                        q="Is my info safe?"
                        a="Locked down. We verify identities but keep your personal details private until a booking is confirmed."
                    />
                    <Question
                        q="Can we deal outside the platform?"
                        a="No. If you do, you lose all protection, insurance, and support. Plus, it's against the rules and we'll have to ban you. Don't be that person."
                    />
                    <Question
                        q="What if something breaks?"
                        a="Accidents happen. Report it immediately. If it's negligence, the creator pays. If it's wear and tear, that's life. We mediate if you can't agree."
                    />
                </div>
            </section>
        </div>

        {/* Help Banner */}
        <div className="mt-20 bg-brand-burgundy rounded-3xl p-10 text-center text-brand-white">
            <h2 className="font-heading text-3xl mb-4">Still stumped?</h2>
            <p className="font-body text-lg text-brand-white/80 mb-8 max-w-lg mx-auto">
                Our support team is neighbourly and ready to help.
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
            <h1 className="font-heading text-5xl md:text-6xl text-brand-orange mb-6">Fighting the beige</h1>
            <p className="font-body text-xl text-brand-burgundy/80 max-w-2xl mx-auto">
                Odd Folk isn't just about cool props. It's about a better way to create experiences.
            </p>
        </div>

        <section className="mb-20">
            <h2 className="font-heading text-3xl text-brand-blue mb-6">Why sharing matters</h2>
            <p className="font-body text-lg text-brand-burgundy/80 leading-relaxed">
                Every year, tons of props and furniture are bought for single-use events—then stored, forgotten, or dumped. It's beige behavior. It's wasteful. It's unnecessary.
            </p>
        </section>

        <section className="mb-20 grid md:grid-cols-2 gap-12">
            <div className="bg-brand-burgundy/5 p-8 rounded-3xl border border-brand-burgundy/10">
                <h2 className="font-heading text-2xl text-brand-burgundy mb-6">The old way</h2>
                <div className="space-y-6">
                    <div>
                        <h4 className="font-heading text-sm text-brand-burgundy/60 uppercase tracking-widest mb-2">The cycle of waste</h4>
                        <ul className="list-disc pl-5 font-body text-brand-burgundy/80 space-y-1">
                            <li>Buy new for one night</li>
                            <li>Use it once</li>
                            <li>Storage purgatory</li>
                            <li>Landfill</li>
                        </ul>
                    </div>
                </div>
            </div>

            <div className="space-y-8">
                <h2 className="font-heading text-3xl text-brand-blue mb-4">The Odd Folk way</h2>

                <div className="space-y-6">
                    <div>
                        <h3 className="font-heading text-xl text-brand-orange mb-2">Reuse &gt; Waste</h3>
                        <p className="font-body text-brand-burgundy/80">
                            That velvet sofa has already been made. The carbon cost is paid. Renting it gives it a second, third, and fourth life.
                        </p>
                    </div>
                    <div>
                        <h3 className="font-heading text-xl text-brand-orange mb-2">Keep it local</h3>
                        <p className="font-body text-brand-burgundy/80">
                            Collecting from your neighbour means fewer delivery vans crisscrossing London. Walking or driving a few streets beats shipping from a depot.
                        </p>
                    </div>
                    <div>
                        <h3 className="font-heading text-xl text-brand-orange mb-2">Treasures, not trash</h3>
                        <p className="font-body text-brand-burgundy/80">
                            The best props are built to last. We keep quality pieces circulating instead of languishing in a basement.
                        </p>
                    </div>
                </div>
            </div>
        </section>

        <section className="bg-brand-blue text-brand-white rounded-3xl p-10 shadow-xl">
            <h2 className="font-heading text-3xl text-brand-yellow mb-10 text-center">Our promise</h2>

            <div className="grid md:grid-cols-2 gap-10">
                <div>
                    <h3 className="font-heading text-xl mb-4 border-b border-brand-white/20 pb-2">Right now</h3>
                    <ul className="space-y-4 font-body">
                        <li>
                            <strong>Collection-only:</strong> Keeps emissions low and connects neighbours.
                        </li>
                        <li>
                            <strong>Education:</strong> We shout about the environmental win of sharing over buying.
                        </li>
                    </ul>
                </div>
                <div>
                    <h3 className="font-heading text-xl mb-4 border-b border-brand-white/20 pb-2">Up next</h3>
                    <ul className="space-y-4 font-body">
                        <li>
                            <strong>Impact tracking:</strong> We'll show you exactly how much waste you've diverted.
                        </li>
                        <li>
                            <strong>Transparency:</strong> Annual reports on the treasures we've kept in circulation.
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
