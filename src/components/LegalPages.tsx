'use client';

import React from 'react';

export const TermsOfService: React.FC = () => {
  return (
    <div className="bg-brand-white py-16 md:py-24 font-body text-brand-burgundy">
      <div className="container mx-auto px-4 sm:px-6 lg:px-8 max-w-4xl">
        <h1 className="font-heading text-5xl text-brand-burgundy mb-10">Odd Folk terms of service</h1>
        <p className="mb-8 text-sm text-brand-burgundy/60">Effective date: [DATE]</p>

        <div className="space-y-8 text-brand-burgundy/90">
            <section>
                <h2 className="font-heading text-2xl mb-4">1. Welcome to Odd Folk</h2>
                <p>1.1 Odd Folk operates a peer-to-peer marketplace platform that allows:</p>
                <ul className="list-alpha pl-5 space-y-1 mt-2">
                    <li>(a) users to list styling items and props for rental (such users being "Listers");</li>
                    <li>(b) listers to communicate with and enter into rental agreements with other users (such users being "Hirers");</li>
                    <li>(c) hirers to pay listers for renting styling items and props;</li>
                    <li>(d) users to manage bookings, collections, and returns through our platform; and</li>
                    <li>(e) users to resolve disputes concerning rented items.</li>
                </ul>
                <p className="mt-2">These services are made available through our website at https://oddfolk.com (the "Odd Folk Platform" or "Platform").</p>
                <p>1.2 The Odd Folk Platform is provided by [Odd Folk Ltd] ("Odd Folk", "we", "our", or "us").</p>
            </section>

            <section>
                <h2 className="font-heading text-2xl mb-4">2. Important information about renting and listing items</h2>
                <p>2.1 Odd Folk provides only the marketplace platform that connects hirers and listers. We do not own, rent, or list items ourselves, nor do we regularly inspect items listed on the platform.</p>
                <p>2.2 As a lister, you are solely responsible for ensuring that:</p>
                <ul className="list-disc pl-5 mt-2">
                    <li>Items match their descriptions and photos</li>
                    <li>Items are safe, clean, and fit for their intended purpose</li>
                    <li>You have the legal right to rent the items</li>
                    <li>Items comply with all applicable safety and consumer protection laws</li>
                </ul>
                <p className="mt-2">2.3 As a hirer, you are responsible for:</p>
                 <ul className="list-disc pl-5 mt-2">
                    <li>Proper care and timely return of rented items</li>
                    <li>Reporting any damage or issues immediately</li>
                    <li>Using items safely and as intended</li>
                    <li>Compensating listers for damage caused by negligence, misuse, improper handling, or theft</li>
                </ul>
                <p className="mt-2">2.4 Odd Folk is not liable for the quality, safety, or condition of items listed on the platform.</p>
            </section>

             <section>
                <h2 className="font-heading text-2xl mb-4">3. Your relationship with us</h2>
                <p>3.1 These Terms of service (together with our Privacy policy and any other documents referenced herein) govern your use of the Odd Folk Platform.</p>
                <p>3.2 Additional terms apply depending on whether you are a lister (see Section 10) or hirer (see Section 11).</p>
                <p>3.3 By creating an account or using the Odd Folk Platform, you agree to these Terms of service. If you do not agree, please do not use our platform.</p>
                <p>3.4 You must be at least 18 years old to use the Odd Folk Platform. By using our platform, you confirm that you are of legal age to enter into binding contracts.</p>
            </section>

            <section>
                <h2 className="font-heading text-2xl mb-4">4. Information about us</h2>
                <p>4.1 [Odd Folk Ltd] is a company registered in England and Wales, with its registered address at [ADDRESS].</p>
                <p>4.2 You can contact us at hello@oddfolk.co.uk.</p>
            </section>

             <section>
                <h2 className="font-heading text-2xl mb-4">5. Your privacy</h2>
                <p>5.1 Your privacy is important to us. Please read our Privacy policy to understand how we collect, use, and protect your personal information.</p>
                <p>5.2 By using the Odd Folk Platform, you consent to our collection and use of your information as described in the Privacy policy.</p>
            </section>

             <section>
                <h2 className="font-heading text-2xl mb-4">6. The Odd Folk platform</h2>
                <p>6.1 The Odd Folk Platform enables listers to advertise styling items and props for rental, and enables hirers to discover, book, and rent these items for events, photoshoots, and creative projects.</p>
                <p>6.2 We provide messaging features to enable communication between listers and hirers about rental arrangements, collection, and return of items.</p>
                <p>6.3 All communication regarding rental transactions must take place through the platform. Users must not exchange personal contact information to arrange rentals outside the platform.</p>
            </section>

            <section>
                <h2 className="font-heading text-2xl mb-4">7. Setting up your account</h2>
                <p>7.1 To use the Odd Folk Platform, you must create an account using a valid email address.</p>
                <p>7.2 You must provide accurate information including full name, email, phone, and physical address.</p>
                <p>7.3 You are responsible for maintaining account security and notifying us of unauthorized access at hello@oddfolk.co.uk.</p>
                <p>7.4 You may not create multiple accounts or share credentials.</p>
            </section>

             <section>
                <h2 className="font-heading text-2xl mb-4">8. Your right to use the platform</h2>
                <p>8.1 Limited license granted to use the platform according to these terms.</p>
                <p>8.2 Prohibited: Copying, reverse engineering, using bots, illegal purposes.</p>
                <p>8.3 All IP rights belong to Odd Folk.</p>
            </section>

             <section>
                <h2 className="font-heading text-2xl mb-4">9. Prohibited items</h2>
                <p>No vehicles, weapons, illegal substances, animals, adult content, or stolen goods. We reserve the right to remove listings.</p>
            </section>

             <section>
                <h2 className="font-heading text-2xl mb-4">10. Lister-specific terms</h2>
                <p><strong>Listing requirements:</strong> Provide accurate details, photos, dimensions. Must have legal right to rent. Listings subject to approval.</p>
                <p><strong>Pricing and fees:</strong> You set prices. Odd Folk charges a 10% service fee.</p>
                <p><strong>Booking management:</strong> Respond within 24 hours. Cancellations free &gt;48h before start, 25% penalty if less.</p>
                <p><strong>Collection and return:</strong> Arrange via platform messaging. Hand over only to verified hirer.</p>
            </section>

            <section>
                <h2 className="font-heading text-2xl mb-4">11. Hirer-specific terms</h2>
                <p><strong>Booking and payment:</strong> Pay rental price + 10% fee + optional protection. Payment held in escrow.</p>
                <p><strong>Responsibilities:</strong> Collect/return on time, use carefully, report damage.</p>
                <p><strong>Returns and late fees:</strong> Late returns incur fees. Report delays immediately.</p>
                <p><strong>Cancellation:</strong> 48h+ full refund; 24-48h 50% refund; less than 24h no refund.</p>
            </section>

            <section>
                <h2 className="font-heading text-2xl mb-4">12. Payment processing and escrow</h2>
                <p>Processed via Stripe. Funds released to lister 24h after return confirmation + 48h dispute window.</p>
                <p>Total commission: 20% (10% from each party).</p>
            </section>

            <section>
                <h2 className="font-heading text-2xl mb-4">13. Damage protection</h2>
                <p>Optional 10-15% fee covers accidental damage up to declared value. Does not cover negligence/theft.</p>
            </section>

            <section>
                <h2 className="font-heading text-2xl mb-4">14. Dispute resolution</h2>
                <p>Encourage direct resolution. Odd Folk mediation available by contacting hello@oddfolk.co.uk (fee up to 30%). Lister Guarantee available for non-payment.</p>
            </section>

             <section>
                <h2 className="font-heading text-2xl mb-4">15. User content and reviews</h2>
                <p>You retain ownership but grant license to Odd Folk. Content must be accurate and legal. Reviews must be honest.</p>
            </section>

             <section>
                <h2 className="font-heading text-2xl mb-4">16. Rules of acceptable use</h2>
                <p>No illegal purpose, fee avoidance, or harassment. Fee avoidance penalty: Double fees or £200.</p>
            </section>

            <section>
                <h2 className="font-heading text-2xl mb-4">17-22. General provisions</h2>
                <p>Platform provided "as is". Liability limited to fees paid in last 12 months. Third-party services subject to their own terms. Account termination possible for violations. Terms governed by laws of England and Wales.</p>
            </section>

             <section>
                <h2 className="font-heading text-2xl mb-4">23. Contact us</h2>
                <p>Email: hello@oddfolk.co.uk</p>
            </section>
        </div>
      </div>
    </div>
  );
};

export const PrivacyPolicy: React.FC = () => {
  return (
    <div className="bg-brand-white py-16 md:py-24 font-body text-brand-burgundy">
      <div className="container mx-auto px-4 sm:px-6 lg:px-8 max-w-4xl">
        <h1 className="font-heading text-5xl text-brand-burgundy mb-10">Odd Folk privacy policy</h1>
        <p className="mb-8 text-sm text-brand-burgundy/60">Last updated: [DATE]</p>

        <div className="space-y-8 text-brand-burgundy/90">
            <section>
                <h2 className="font-heading text-2xl mb-4">Introduction</h2>
                <p>When you join the Odd Folk community, you trust us with your personal information. We take this responsibility seriously. This Privacy policy explains what information we collect, how we use it, how we protect it, and your rights regarding your data. By using the Odd Folk Platform, you agree to the collection and use of information in accordance with this Privacy policy.</p>
                <p>If you have any questions about this Privacy Policy, please contact us at hello@oddfolk.co.uk.</p>
            </section>

            <section>
                <h2 className="font-heading text-2xl mb-4">1. Who we are</h2>
                <p>We are [Odd Folk Ltd], a company registered in England and Wales. Data protection contact: hello@oddfolk.co.uk.</p>
            </section>

            <section>
                <h2 className="font-heading text-2xl mb-4">2. What information we collect</h2>
                <p><strong>2.1 Information you provide directly:</strong> Account info (name, email, phone, address), profile info, listing info, payment details, verification info (ID), communications.</p>
                <p><strong>2.2 Information we collect automatically:</strong> Device/usage info (IP, browser), location info, cookies.</p>
                <p><strong>2.3 Information from third parties:</strong> Social media, payment processors (Stripe), identity verification.</p>
            </section>

             <section>
                <h2 className="font-heading text-2xl mb-4">3. Cookies and similar technologies</h2>
                <p>We use essential, performance/analytics, functional, and marketing cookies. You can manage cookies through browser settings.</p>
            </section>

            <section>
                <h2 className="font-heading text-2xl mb-4">4. How we use your information</h2>
                <ul className="list-disc pl-5 space-y-1">
                    <li>To provide and improve services</li>
                    <li>To keep the platform safe and secure</li>
                    <li>To communicate with you</li>
                    <li>For marketing and personalization (with consent)</li>
                    <li>For legal and compliance purposes</li>
                </ul>
            </section>

             <section>
                <h2 className="font-heading text-2xl mb-4">5. Legal bases (UK GDPR)</h2>
                <p>We rely on contract performance, consent, legitimate interests, and legal obligation.</p>
            </section>

             <section>
                <h2 className="font-heading text-2xl mb-4">6. How we share your information</h2>
                <p><strong>With other users:</strong> Necessary info for bookings.</p>
                <p><strong>With service providers:</strong> Stripe (payments), support, analytics, verification.</p>
                <p><strong>Legal reasons:</strong> Compliance, law enforcement, safety.</p>
                <p>We do not sell personal information.</p>
            </section>

            <section>
                <h2 className="font-heading text-2xl mb-4">7. International data transfers</h2>
                <p>Data primarily stored in UK/EEA. Transfers outside use safeguards like Adequacy decisions or Standard contractual clauses. You can request more information about international transfers by contacting hello@oddfolk.co.uk.</p>
            </section>

             <section>
                <h2 className="font-heading text-2xl mb-4">8. How we protect your information</h2>
                <p>We use SSL encryption, secure hashing, access controls, and third-party security assessments.</p>
            </section>

            <section>
                <h2 className="font-heading text-2xl mb-4">9. How long we keep your information</h2>
                <p>Retained as necessary for account activity, legal compliance (7 years for transactions), or disputes. Anonymized thereafter.</p>
            </section>

            <section>
                <h2 className="font-heading text-2xl mb-4">10. Your rights under UK GDPR</h2>
                <p>Access, rectification, erasure, restriction, portability, objection to marketing/processing. Contact hello@oddfolk.co.uk to exercise rights. You can also raise concerns directly with us at hello@oddfolk.co.uk.</p>
            </section>

            <section>
                <h2 className="font-heading text-2xl mb-4">11. Children's privacy</h2>
                <p>Platform not for under 18s. We do not knowingly collect data from children. If you believe your child has provided us with personal information, please contact us at hello@oddfolk.co.uk.</p>
            </section>

             <section>
                <h2 className="font-heading text-2xl mb-4">12. Marketing communications</h2>
                <p>You can opt out of marketing emails at any time via unsubscribe link or settings. Email hello@oddfolk.co.uk with "Unsubscribe" request.</p>
            </section>

            <section>
                <h2 className="font-heading text-2xl mb-4">13-17. Additional info</h2>
                <p>Third-party links are not our responsibility. Policy may be updated. Specific processing for ID verification/fraud prevention. CCPA rights for CA residents.</p>
                <p>Privacy questions: Email hello@oddfolk.co.uk. DPO contact: hello@oddfolk.co.uk.</p>
            </section>

            <section>
                <h2 className="font-heading text-2xl mb-4">Contact us</h2>
                <p>Email: hello@oddfolk.co.uk regarding "Privacy inquiry".</p>
            </section>
        </div>
      </div>
    </div>
  );
};
