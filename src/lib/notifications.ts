import prisma from '@/lib/prisma';

export const NotificationType = {
  BOOKING_REQUEST: 'BOOKING_REQUEST',
  BOOKING_APPROVED: 'BOOKING_APPROVED',
  BOOKING_DECLINED: 'BOOKING_DECLINED',
  BOOKING_CANCELLED: 'BOOKING_CANCELLED',
  BOOKING_REMINDER: 'BOOKING_REMINDER',
  BOOKING_AUTO_DECLINED: 'BOOKING_AUTO_DECLINED',
  PAYMENT_RECEIVED: 'PAYMENT_RECEIVED',
  BOOKING_COMPLETED: 'BOOKING_COMPLETED',
  REVIEW_RECEIVED: 'REVIEW_RECEIVED',
  NEW_MESSAGE: 'NEW_MESSAGE',
} as const;

const SITE_URL = process.env.BETTER_AUTH_URL || 'https://oddfolk.co.uk';

export function inboxUrl(threadId?: string | null) {
  return threadId ? `${SITE_URL}/inbox?t=${threadId}` : `${SITE_URL}/inbox`;
}

export function dashboardUrl(tab: string, subTab?: string, bookingId?: string) {
  const base = `${SITE_URL}/dashboard/${tab}`;
  if (subTab && bookingId) return `${base}/${subTab}/${bookingId}`;
  if (subTab) return `${base}/${subTab}`;
  return base;
}

export async function createNotification(
  userId: string,
  type: string,
  title: string,
  body: string,
  linkUrl: string = `${SITE_URL}/inbox`
) {
  try {
    await prisma.notification.create({
      data: { userId, type, title, body, linkUrl },
    });
  } catch (err) {
    console.error('[notification] Failed to create:', type, err);
  }
}

// Convenience helpers

export function notifyBookingRequest(listerId: string, hirerName: string, productTitle: string, threadId?: string, bookingId?: string) {
  return createNotification(
    listerId,
    NotificationType.BOOKING_REQUEST,
    'New booking request',
    `**${hirerName}** has requested **${productTitle}**`,
    bookingId ? dashboardUrl('bookings', 'received', bookingId) : inboxUrl(threadId)
  );
}

export function notifyBookingApproved(hirerId: string, listerName: string, productTitle: string, threadId?: string, bookingId?: string) {
  return createNotification(
    hirerId,
    NotificationType.BOOKING_APPROVED,
    'Booking approved',
    `**${listerName}** approved your request for **${productTitle}**`,
    bookingId ? dashboardUrl('bookings', 'made', bookingId) : inboxUrl(threadId)
  );
}

export function notifyBookingDeclined(hirerId: string, listerName: string, productTitle: string, threadId?: string, bookingId?: string) {
  return createNotification(
    hirerId,
    NotificationType.BOOKING_DECLINED,
    'Booking declined',
    `**${listerName}** declined your request for **${productTitle}**`,
    bookingId ? dashboardUrl('bookings', 'made', bookingId) : inboxUrl(threadId)
  );
}

export function notifyBookingCancelled(recipientId: string, cancellerName: string, productTitle: string, threadId?: string, bookingId?: string, subTab?: 'made' | 'received') {
  return createNotification(
    recipientId,
    NotificationType.BOOKING_CANCELLED,
    'Booking cancelled',
    `**${cancellerName}** cancelled the booking for **${productTitle}**`,
    bookingId && subTab ? dashboardUrl('bookings', subTab, bookingId) : inboxUrl(threadId)
  );
}

export function notifyPaymentReceived(listerId: string, hirerName: string, productTitle: string, threadId?: string, bookingId?: string) {
  return createNotification(
    listerId,
    NotificationType.PAYMENT_RECEIVED,
    'Payment received',
    `**${hirerName}** has paid for **${productTitle}**`,
    bookingId ? dashboardUrl('bookings', 'received', bookingId) : inboxUrl(threadId)
  );
}

export function notifyBookingCompleted(userId: string, productTitle: string, threadId?: string, bookingId?: string, subTab?: 'made' | 'received') {
  return createNotification(
    userId,
    NotificationType.BOOKING_COMPLETED,
    'Rental complete',
    `Your rental of **${productTitle}** is complete — leave a review!`,
    bookingId && subTab ? dashboardUrl('bookings', subTab, bookingId) : inboxUrl(threadId)
  );
}

export function notifyBookingReminder(listerId: string, hirerName: string, productTitle: string, hoursRemaining: number, threadId?: string, bookingId?: string) {
  const urgency = hoursRemaining <= 3 ? 'Urgent: ' : '';
  return createNotification(
    listerId,
    NotificationType.BOOKING_REMINDER,
    `${urgency}${hoursRemaining} hours to respond`,
    `You have ${hoursRemaining} hours to accept or decline **${hirerName}**'s request for **${productTitle}** before it is automatically declined`,
    bookingId ? dashboardUrl('bookings', 'received', bookingId) : inboxUrl(threadId)
  );
}

export function notifyBookingAutoDeclined(userId: string, productTitle: string, isLister: boolean, threadId?: string, bookingId?: string, subTab?: 'made' | 'received') {
  return createNotification(
    userId,
    NotificationType.BOOKING_AUTO_DECLINED,
    'Booking request expired',
    isLister
      ? `A booking request for **${productTitle}** was not responded to and has been automatically declined`
      : `Your booking request for **${productTitle}** was not responded to within 48 hours and has been automatically declined`,
    bookingId && subTab ? dashboardUrl('bookings', subTab, bookingId) : inboxUrl(threadId)
  );
}

export function notifyReviewReceived(revieweeId: string, reviewerName: string, rating: number, productTitle: string, bookingId?: string, subTab?: 'made' | 'received') {
  return createNotification(
    revieweeId,
    NotificationType.REVIEW_RECEIVED,
    'New review',
    `**${reviewerName}** left you a ${rating}-star review for **${productTitle}**`,
    bookingId && subTab ? dashboardUrl('bookings', subTab, bookingId) : `${SITE_URL}/dashboard`
  );
}

export function notifyNewMessage(recipientId: string, senderName: string, productTitle: string, threadId: string) {
  return createNotification(
    recipientId,
    NotificationType.NEW_MESSAGE,
    'New message',
    `**${senderName}** sent you a message about **${productTitle}**`,
    inboxUrl(threadId)
  );
}
