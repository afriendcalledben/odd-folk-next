import { Resend } from 'resend';
import { createElement } from 'react';
import BookingRequestEmail from '@/emails/BookingRequestEmail';
import BookingStatusEmail from '@/emails/BookingStatusEmail';

const FROM = 'Odd Folk <bookings@oddfolk.co.uk>';
const SITE_URL = process.env.NEXT_PUBLIC_SITE_URL || 'https://oddfolk.co.uk';
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
  await send(
    b.hirer.email,
    `How was your rental of ${b.productTitle}?`,
    createElement(BookingStatusEmail, {
      recipientName: b.hirer.name,
      heading: 'Leave a review',
      body: `Your rental of ${b.productTitle} is complete — we hope it was perfect for your event! It only takes a minute to leave a review and help the Odd Folk community.`,
      ctaText: 'Leave a review',
      ctaUrl: DASHBOARD_BOOKINGS,
    })
  );
}
