import { Resend } from 'resend';
import { createElement } from 'react';
import BookingRequestEmail from '@/emails/BookingRequestEmail';
import BookingStatusEmail from '@/emails/BookingStatusEmail';

const FROM = 'Odd Folk <bookings@oddfolk.co.uk>';
const SITE_URL = process.env.BETTER_AUTH_URL || 'https://oddfolk.co.uk';
const DASHBOARD_BOOKINGS = `${SITE_URL}/dashboard?tab=bookings`;

export interface BookingEmailData {
  id: string;
  productTitle: string;
  startDate: Date;
  endDate: Date;
  listerPayout: number;
  totalHirerCost: number;
  hirer: { name: string; email: string };
  lister: { name: string; email: string };
}

function fmt(date: Date) {
  return new Date(date).toLocaleDateString('en-GB', { day: 'numeric', month: 'short', year: 'numeric' });
}

async function send(to: string, subject: string, element: React.ReactElement) {
  if (!process.env.RESEND_API_KEY) {
    console.warn('[email] RESEND_API_KEY not set — skipping email:', subject);
    return;
  }
  try {
    const resend = new Resend(process.env.RESEND_API_KEY);
    await resend.emails.send({ from: FROM, to, subject, react: element });
  } catch (err) {
    console.error('[email] Failed to send:', subject, err);
  }
}

export async function sendBookingRequestEmail(b: BookingEmailData) {
  await send(
    b.lister.email,
    `New booking request for ${b.productTitle}`,
    createElement(BookingRequestEmail, {
      listerName: b.lister.name,
      hirerName: b.hirer.name,
      productTitle: b.productTitle,
      startDate: fmt(b.startDate),
      endDate: fmt(b.endDate),
      listerPayout: b.listerPayout,
      dashboardUrl: DASHBOARD_BOOKINGS,
    })
  );
}

export async function sendBookingApprovedEmail(b: BookingEmailData) {
  await send(
    b.hirer.email,
    `Your booking for ${b.productTitle} has been approved`,
    createElement(BookingStatusEmail, {
      recipientName: b.hirer.name,
      heading: 'Booking approved',
      body: `Great news — ${b.lister.name} has approved your request for ${b.productTitle}. Head to your dashboard to complete payment and secure the booking.`,
      detail: `${fmt(b.startDate)} – ${fmt(b.endDate)} · Total: £${b.totalHirerCost.toFixed(2)}`,
      ctaText: 'Pay now',
      ctaUrl: DASHBOARD_BOOKINGS,
    })
  );
}

export async function sendBookingDeclinedEmail(b: BookingEmailData) {
  await send(
    b.hirer.email,
    `Your booking request for ${b.productTitle} was declined`,
    createElement(BookingStatusEmail, {
      recipientName: b.hirer.name,
      heading: 'Booking declined',
      body: `Unfortunately ${b.lister.name} wasn't able to accept your request for ${b.productTitle} this time. Browse similar items on Odd Folk.`,
      ctaText: 'Browse listings',
      ctaUrl: `${SITE_URL}/search`,
    })
  );
}

export async function sendBookingCancelledEmail(b: BookingEmailData, cancelledByRole: 'hirer' | 'lister') {
  const isHirerCancel = cancelledByRole === 'hirer';
  const recipient = isHirerCancel ? b.lister : b.hirer;
  const cancellerName = isHirerCancel ? b.hirer.name : b.lister.name;

  await send(
    recipient.email,
    `Booking for ${b.productTitle} has been cancelled`,
    createElement(BookingStatusEmail, {
      recipientName: recipient.name,
      heading: 'Booking cancelled',
      body: `${cancellerName} has cancelled the booking for ${b.productTitle} (${fmt(b.startDate)} – ${fmt(b.endDate)}).`,
      ctaText: 'View dashboard',
      ctaUrl: DASHBOARD_BOOKINGS,
    })
  );
}

export async function sendPaymentReceivedEmail(b: BookingEmailData) {
  await send(
    b.lister.email,
    `Payment received for ${b.productTitle}`,
    createElement(BookingStatusEmail, {
      recipientName: b.lister.name,
      heading: 'Payment secured',
      body: `${b.hirer.name} has paid for their booking of ${b.productTitle}. The funds are held in escrow and will be released once the rental is completed.`,
      detail: `${fmt(b.startDate)} – ${fmt(b.endDate)} · Your payout: £${b.listerPayout.toFixed(2)}`,
      ctaText: 'View booking',
      ctaUrl: DASHBOARD_BOOKINGS,
    })
  );
}

export async function sendBookingCompletedEmail(b: BookingEmailData) {
  // Notify hirer
  await send(
    b.hirer.email,
    `How was your rental of ${b.productTitle}?`,
    createElement(BookingStatusEmail, {
      recipientName: b.hirer.name,
      heading: 'Leave a review',
      body: `Your rental of ${b.productTitle} is complete — we hope it was perfect for your event! Leave a review for ${b.lister.name} to help the Odd Folk community.`,
      ctaText: 'Leave a review',
      ctaUrl: DASHBOARD_BOOKINGS,
    })
  );
  // Notify lister
  await send(
    b.lister.email,
    `Rental of ${b.productTitle} is complete`,
    createElement(BookingStatusEmail, {
      recipientName: b.lister.name,
      heading: 'Rental complete',
      body: `${b.hirer.name} has completed their rental of ${b.productTitle}. Your funds have been released. Take a moment to leave a review for ${b.hirer.name}.`,
      detail: `Payout: £${b.listerPayout.toFixed(2)}`,
      ctaText: 'Leave a review',
      ctaUrl: DASHBOARD_BOOKINGS,
    })
  );
}

export async function sendBookingReminderEmail(b: BookingEmailData, hoursRemaining: number) {
  const urgency = hoursRemaining <= 3 ? 'Urgent: ' : '';
  await send(
    b.lister.email,
    `${urgency}${hoursRemaining} hours left to respond to a booking request`,
    createElement(BookingStatusEmail, {
      recipientName: b.lister.name,
      heading: `${hoursRemaining} hours remaining`,
      body: `${b.hirer.name} is waiting for your response to their booking request for ${b.productTitle} (${fmt(b.startDate)} – ${fmt(b.endDate)}). If you don't respond within ${hoursRemaining} hours the request will be automatically declined.`,
      ctaText: 'Respond now',
      ctaUrl: DASHBOARD_BOOKINGS,
    })
  );
}

export async function sendBookingAutoDeclinedEmail(b: BookingEmailData) {
  // Notify lister
  await send(
    b.lister.email,
    `Booking request for ${b.productTitle} has expired`,
    createElement(BookingStatusEmail, {
      recipientName: b.lister.name,
      heading: 'Booking request expired',
      body: `The booking request from ${b.hirer.name} for ${b.productTitle} (${fmt(b.startDate)} – ${fmt(b.endDate)}) was not responded to within 48 hours and has been automatically declined.`,
      ctaText: 'View dashboard',
      ctaUrl: DASHBOARD_BOOKINGS,
    })
  );
  // Notify hirer
  await send(
    b.hirer.email,
    `Your booking request for ${b.productTitle} wasn't responded to`,
    createElement(BookingStatusEmail, {
      recipientName: b.hirer.name,
      heading: 'Request not responded to',
      body: `Unfortunately your booking request for ${b.productTitle} (${fmt(b.startDate)} – ${fmt(b.endDate)}) wasn't responded to within 48 hours and has been automatically declined. Browse similar items on Odd Folk.`,
      ctaText: 'Browse listings',
      ctaUrl: `${SITE_URL}/search`,
    })
  );
}

export async function sendReviewReceivedEmail(data: {
  reviewee: { name: string; email: string };
  reviewer: { name: string };
  rating: number;
  comment: string | null;
  productTitle: string;
}) {
  const stars = '★'.repeat(data.rating) + '☆'.repeat(5 - data.rating);
  await send(
    data.reviewee.email,
    `${data.reviewer.name} left you a ${data.rating}-star review`,
    createElement(BookingStatusEmail, {
      recipientName: data.reviewee.name,
      heading: `${stars} New review`,
      body: data.comment
        ? `${data.reviewer.name} reviewed your rental of ${data.productTitle}: "${data.comment}"`
        : `${data.reviewer.name} left a ${data.rating}-star review for your rental of ${data.productTitle}.`,
      ctaText: 'View your profile',
      ctaUrl: `${SITE_URL}/dashboard`,
    })
  );
}
